import { useEffect, useState } from 'react';
import { ROSTERS_2K14 } from './rosters2K14';
import { ROSTERS_2K26 } from './rosters2K26';
import { ROSTERS_BONUS } from './rostersBonus';
import {
  computePlayerOvr,
  computeTeamRatings,
  deriveArchetype,
  type PlayerProfile,
  type TeamData,
  type TeamEra,
} from './rosterTypes';
import type { Hoops2K26TeamDef, HoopsRosterPlayer } from '../hoops2k26Catalog';

// ============================================================================
// PART 2 ROSTER STORE — 72 TEAMS (576+ PLAYERS) + LOCALSTORAGE OVERLAY DIFFS
// ============================================================================

export const CUSTOM_ROSTER_SAVE_KEY = 'nba2k14_2k26_custom_rosters_v1';

export const DEFAULT_ALL_TEAMS: TeamData[] = [
  ...ROSTERS_2K14,
  ...ROSTERS_2K26,
  ...ROSTERS_BONUS,
];

export interface RosterOverlayState {
  version: 1;
  playerEdits: Record<string, PlayerProfile>;
  teamRosterIds: Record<string, string[]>;
  createdPlayers: PlayerProfile[];
  freeAgentIds: string[];
  lastUpdatedMs: number;
}

export interface RosterSnapshot {
  teams: TeamData[];
  freeAgents: PlayerProfile[];
  createdPlayers: PlayerProfile[];
  isCustomized: boolean;
  revision: number;
}

function safeGetStorage(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, val: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, val);
  } catch {
    // Ignore sandbox/quota errors
  }
}

function createEmptyOverlay(): RosterOverlayState {
  return {
    version: 1,
    playerEdits: {},
    teamRosterIds: {},
    createdPlayers: [],
    freeAgentIds: [],
    lastUpdatedMs: Date.now(),
  };
}

function clonePlayer(p: PlayerProfile): PlayerProfile {
  return {
    ...p,
    appearance: { ...p.appearance },
    tendencies: { ...p.tendencies },
    attributes: { ...p.attributes },
    hotZones: { ...p.hotZones },
    badges: { ...p.badges },
  };
}

// Base lookup maps for fast overlay hydration
const BASE_PLAYERS_BY_ID: Record<string, PlayerProfile> = {};
DEFAULT_ALL_TEAMS.forEach((team) => {
  team.roster.forEach((p) => {
    BASE_PLAYERS_BY_ID[p.id] = p;
  });
});

function loadOverlay(): RosterOverlayState {
  const raw = safeGetStorage(CUSTOM_ROSTER_SAVE_KEY);
  if (!raw) return createEmptyOverlay();
  try {
    const parsed = JSON.parse(raw) as Partial<RosterOverlayState>;
    if (!parsed || typeof parsed !== 'object') return createEmptyOverlay();
    return {
      version: 1,
      playerEdits: parsed.playerEdits && typeof parsed.playerEdits === 'object' ? parsed.playerEdits : {},
      teamRosterIds: parsed.teamRosterIds && typeof parsed.teamRosterIds === 'object' ? parsed.teamRosterIds : {},
      createdPlayers: Array.isArray(parsed.createdPlayers) ? parsed.createdPlayers : [],
      freeAgentIds: Array.isArray(parsed.freeAgentIds) ? parsed.freeAgentIds : [],
      lastUpdatedMs: typeof parsed.lastUpdatedMs === 'number' ? parsed.lastUpdatedMs : Date.now(),
    };
  } catch {
    return createEmptyOverlay();
  }
}

function buildSnapshot(overlay: RosterOverlayState, revision: number): RosterSnapshot {
  const createdById: Record<string, PlayerProfile> = {};
  overlay.createdPlayers.forEach((p) => {
    createdById[p.id] = p;
  });

  const resolvePlayer = (id: string): PlayerProfile | null => {
    if (overlay.playerEdits[id]) return clonePlayer(overlay.playerEdits[id]);
    if (createdById[id]) return clonePlayer(createdById[id]);
    if (BASE_PLAYERS_BY_ID[id]) return clonePlayer(BASE_PLAYERS_BY_ID[id]);
    return null;
  };

  const teams: TeamData[] = DEFAULT_ALL_TEAMS.map((baseTeam) => {
    const ids = overlay.teamRosterIds[baseTeam.id] ?? baseTeam.roster.map((p) => p.id);
    const roster: PlayerProfile[] = [];
    ids.forEach((pid) => {
      const p = resolvePlayer(pid);
      if (p) roster.push(p);
    });
    // Safety guard: guarantee at least 5 players on any team
    if (roster.length < 5) {
      baseTeam.roster.forEach((bp) => {
        if (!roster.some((x) => x.id === bp.id)) {
          roster.push(clonePlayer(bp));
        }
      });
    }
    const ratings = computeTeamRatings(roster);
    return {
      ...baseTeam,
      colors: { ...baseTeam.colors },
      ovr: ratings.ovr,
      offRating: ratings.offRating,
      defRating: ratings.defRating,
      roster,
    };
  });

  const freeAgents: PlayerProfile[] = [];
  overlay.freeAgentIds.forEach((pid) => {
    const p = resolvePlayer(pid);
    if (p) freeAgents.push(p);
  });

  const isCustomized =
    Object.keys(overlay.playerEdits).length > 0 ||
    Object.keys(overlay.teamRosterIds).length > 0 ||
    overlay.createdPlayers.length > 0 ||
    overlay.freeAgentIds.length > 0;

  return {
    teams,
    freeAgents,
    createdPlayers: overlay.createdPlayers.map(clonePlayer),
    isCustomized,
    revision,
  };
}

let _overlay: RosterOverlayState = loadOverlay();
let _revision = 1;
let _snapshot: RosterSnapshot = buildSnapshot(_overlay, _revision);
const _listeners = new Set<(snap: RosterSnapshot) => void>();

function commitOverlay(next: RosterOverlayState): RosterSnapshot {
  _overlay = { ...next, lastUpdatedMs: Date.now() };
  _revision += 1;
  safeSetStorage(CUSTOM_ROSTER_SAVE_KEY, JSON.stringify(_overlay));
  _snapshot = buildSnapshot(_overlay, _revision);
  _listeners.forEach((fn) => fn(_snapshot));
  return _snapshot;
}

function getTeamRosterIdList(teamId: string): string[] {
  const existing = _overlay.teamRosterIds[teamId];
  if (existing) return [...existing];
  const base = DEFAULT_ALL_TEAMS.find((t) => t.id === teamId);
  return base ? base.roster.map((p) => p.id) : [];
}

// Legacy Part 1 team ID aliases so older localStorage saves resolve seamlessly
const LEGACY_TEAM_ID_ALIASES: Record<string, string> = {
  '2k26_bos_0': '2k26_bos',
  '2k26_lal_1': '2k26_lal',
  '2k26_gsw_2': '2k26_gsw',
  '2k26_den_3': '2k26_den',
  '2k26_okc_4': '2k26_okc',
  '2k26_mil_5': '2k26_mil',
  '2k26_nyk_6': '2k26_nyk',
  '2k26_sas_7': '2k26_sas',
  '2k26_min_8': '2k26_min',
  '2k26_mia_9': '2k26_mia',
  '2k26_lva_10': 'wnba_lva',
  '2k26_nyl_11': 'wnba_nyl',
  '2k26_ind_12': 'wnba_ind',
  '2k26_min_13': 'wnba_chi',
  '2k26_96b_14': 'leg_chi96',
  '2k26_01l_15': 'leg_lal01',
  '2k14_96chi': 'leg_chi96',
  '2k14_01lal': 'leg_lal01',
  '2k14_86bos': 'leg_bos86',
  '2k14_rm': 'euro_rm',
  '2k14_fcb': 'euro_fcb',
  '2k14_cska': 'euro_cska',
  '2k14_oly': 'euro_oly',
};

export function resolveCanonicalTeamId(teamId: string): string {
  return LEGACY_TEAM_ID_ALIASES[teamId] ?? teamId;
}

export const RosterStore = {
  getSnapshot(): RosterSnapshot {
    return _snapshot;
  },

  subscribe(listener: (snap: RosterSnapshot) => void): () => void {
    _listeners.add(listener);
    return () => {
      _listeners.delete(listener);
    };
  },

  getAllTeams(): TeamData[] {
    return _snapshot.teams;
  },

  getTeamsByEra(era: TeamEra): TeamData[] {
    return _snapshot.teams.filter((t) => t.era === era);
  },

  getTeamById(teamId: string): TeamData {
    const canon = resolveCanonicalTeamId(teamId);
    return _snapshot.teams.find((t) => t.id === canon) ?? _snapshot.teams[0];
  },

  findPlayerTeam(playerId: string): TeamData | null {
    return _snapshot.teams.find((t) => t.roster.some((p) => p.id === playerId)) ?? null;
  },

  updatePlayer(updated: PlayerProfile, recomputeOvr = true): RosterSnapshot {
    const nextPlayer = clonePlayer(updated);
    if (recomputeOvr) {
      nextPlayer.ovr = computePlayerOvr(nextPlayer.attributes, nextPlayer.position);
      nextPlayer.archetype = deriveArchetype(nextPlayer.attributes, nextPlayer.position);
    }
    const nextCreated = _overlay.createdPlayers.map((p) =>
      p.id === nextPlayer.id ? nextPlayer : p
    );
    return commitOverlay({
      ..._overlay,
      playerEdits: {
        ..._overlay.playerEdits,
        [nextPlayer.id]: nextPlayer,
      },
      createdPlayers: nextCreated,
    });
  },

  swapStarterBench(teamId: string, indexA: number, indexB: number): RosterSnapshot {
    const canon = resolveCanonicalTeamId(teamId);
    const ids = getTeamRosterIdList(canon);
    if (
      indexA < 0 ||
      indexB < 0 ||
      indexA >= ids.length ||
      indexB >= ids.length ||
      indexA === indexB
    ) {
      return _snapshot;
    }
    const tmp = ids[indexA];
    ids[indexA] = ids[indexB];
    ids[indexB] = tmp;
    return commitOverlay({
      ..._overlay,
      teamRosterIds: {
        ..._overlay.teamRosterIds,
        [canon]: ids,
      },
    });
  },

  tradePlayers(
    teamAId: string,
    playerAId: string,
    teamBId: string,
    playerBId: string
  ): { ok: boolean; message: string } {
    const canonA = resolveCanonicalTeamId(teamAId);
    const canonB = resolveCanonicalTeamId(teamBId);
    if (canonA === canonB) {
      return { ok: false, message: 'Select two different teams to complete a trade.' };
    }
    const idsA = getTeamRosterIdList(canonA);
    const idsB = getTeamRosterIdList(canonB);
    const idxA = idsA.indexOf(playerAId);
    const idxB = idsB.indexOf(playerBId);
    if (idxA === -1 || idxB === -1) {
      return { ok: false, message: 'Could not locate selected players on those rosters.' };
    }
    idsA[idxA] = playerBId;
    idsB[idxB] = playerAId;
    commitOverlay({
      ..._overlay,
      teamRosterIds: {
        ..._overlay.teamRosterIds,
        [canonA]: idsA,
        [canonB]: idsB,
      },
    });
    return { ok: true, message: 'Trade finalized and saved to custom rosters!' };
  },

  addCreatedPlayer(
    player: PlayerProfile,
    assignTeamId: string | 'FREE_AGENTS',
    insertAsStarter = true
  ): RosterSnapshot {
    const cleanPlayer = clonePlayer({
      ...player,
      isCreated: true,
      ovr: computePlayerOvr(player.attributes, player.position),
      archetype: player.archetype || deriveArchetype(player.attributes, player.position),
    });

    const nextCreated = [
      ..._overlay.createdPlayers.filter((p) => p.id !== cleanPlayer.id),
      cleanPlayer,
    ];
    const nextEdits = {
      ..._overlay.playerEdits,
      [cleanPlayer.id]: cleanPlayer,
    };

    if (assignTeamId === 'FREE_AGENTS') {
      const nextFa = _overlay.freeAgentIds.includes(cleanPlayer.id)
        ? _overlay.freeAgentIds
        : [cleanPlayer.id, ..._overlay.freeAgentIds];
      return commitOverlay({
        ..._overlay,
        playerEdits: nextEdits,
        createdPlayers: nextCreated,
        freeAgentIds: nextFa,
      });
    }

    const canonTeam = resolveCanonicalTeamId(assignTeamId);
    const ids = getTeamRosterIdList(canonTeam).filter((id) => id !== cleanPlayer.id);
    if (insertAsStarter) {
      const posSlot: Record<PlayerProfile['position'], number> = {
        PG: 0,
        SG: 1,
        SF: 2,
        PF: 3,
        C: 4,
      };
      const slot = posSlot[cleanPlayer.position];
      const displaced = ids[slot];
      ids[slot] = cleanPlayer.id;
      if (displaced) ids.push(displaced);
    } else {
      ids.push(cleanPlayer.id);
    }

    return commitOverlay({
      ..._overlay,
      playerEdits: nextEdits,
      createdPlayers: nextCreated,
      teamRosterIds: {
        ..._overlay.teamRosterIds,
        [canonTeam]: ids,
      },
      freeAgentIds: _overlay.freeAgentIds.filter((id) => id !== cleanPlayer.id),
    });
  },

  signFreeAgent(playerId: string, targetTeamId: string): { ok: boolean; message: string } {
    if (!_overlay.freeAgentIds.includes(playerId)) {
      return { ok: false, message: 'Player is not currently in Free Agents.' };
    }
    const canonTeam = resolveCanonicalTeamId(targetTeamId);
    const ids = getTeamRosterIdList(canonTeam);
    if (!ids.includes(playerId)) {
      ids.push(playerId);
    }
    commitOverlay({
      ..._overlay,
      teamRosterIds: {
        ..._overlay.teamRosterIds,
        [canonTeam]: ids,
      },
      freeAgentIds: _overlay.freeAgentIds.filter((id) => id !== playerId),
    });
    return { ok: true, message: 'Free agent signed to roster!' };
  },

  releaseToFreeAgents(teamId: string, playerId: string): { ok: boolean; message: string } {
    const canonTeam = resolveCanonicalTeamId(teamId);
    const ids = getTeamRosterIdList(canonTeam);
    if (ids.length <= 5) {
      return { ok: false, message: 'A team must keep at least 5 active players.' };
    }
    const nextIds = ids.filter((id) => id !== playerId);
    if (nextIds.length === ids.length) {
      return { ok: false, message: 'Player not found on team.' };
    }
    commitOverlay({
      ..._overlay,
      teamRosterIds: {
        ..._overlay.teamRosterIds,
        [canonTeam]: nextIds,
      },
      freeAgentIds: [playerId, ..._overlay.freeAgentIds.filter((id) => id !== playerId)],
    });
    return { ok: true, message: 'Player moved to Free Agents pool.' };
  },

  resetDefaultRosters(): RosterSnapshot {
    return commitOverlay(createEmptyOverlay());
  },
};

export function useRosterStore(): RosterSnapshot {
  const [snap, setSnap] = useState<RosterSnapshot>(() => RosterStore.getSnapshot());
  useEffect(() => RosterStore.subscribe(setSnap), []);
  return snap;
}

// ============================================================================
// LIVE 3D TIP-OFF BRIDGE: Convert Any Part 2 TeamData -> Hoops2K26TeamDef
// ============================================================================

function cssHexToInt(hex: string, fallback = 0x1d428a): number {
  const clean = hex.replace('#', '').trim();
  const parsed = parseInt(clean, 16);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function ratingToFiveScale(val: number): number {
  return Math.max(1, Math.min(5, Math.round((val - 60) / 8)));
}

export function toHoops2K26TeamOverride(team: TeamData, fallbackCourtId = 0): Hoops2K26TeamDef {
  const starterSlice = team.roster.slice(0, 5);
  const toRosterPlayer = (p: PlayerProfile, idx: number): HoopsRosterPlayer => {
    const roles: HoopsRosterPlayer['role'][] = ['PG', 'SG', 'SF', 'PF', 'C'];
    const scale = Number((0.92 + ((p.heightInches - 70) / 18) * 0.24).toFixed(2));
    return {
      role: p.position || roles[idx],
      name: p.name,
      ovr: p.ovr,
      jersey: p.jerseyNumber,
      skin: cssHexToInt(p.appearance.skinTone, 0xc68657),
      scale: Math.max(0.88, Math.min(1.18, scale)),
    };
  };

  const starters = [0, 1, 2, 3, 4].map((i) =>
    toRosterPlayer(starterSlice[i] ?? starterSlice[0], i)
  ) as [
    HoopsRosterPlayer,
    HoopsRosterPlayer,
    HoopsRosterPlayer,
    HoopsRosterPlayer,
    HoopsRosterPlayer,
  ];

  const avg3 =
    starterSlice.reduce((s, p) => s + p.attributes.threePt, 0) / Math.max(1, starterSlice.length);
  const avgDunk =
    starterSlice.reduce((s, p) => s + p.attributes.drivingDunk, 0) / Math.max(1, starterSlice.length);
  const avgSpd =
    starterSlice.reduce((s, p) => s + p.attributes.speed, 0) / Math.max(1, starterSlice.length);
  const avgDef =
    starterSlice.reduce(
      (s, p) => s + (p.attributes.perimeterDef + p.attributes.interiorDef) / 2,
      0
    ) / Math.max(1, starterSlice.length);

  return {
    id: fallbackCourtId,
    city: team.city,
    name: `${team.city} ${team.name}`.trim(),
    abbr: team.abbr,
    league:
      team.era === 'WNBA' ? 'wnba' : team.era === 'LEGENDS' ? 'classic' : 'nba',
    eraTag: team.era,
    tier: team.ovr >= 88 ? 1 : team.ovr >= 82 ? 2 : 3,
    tagline: `${team.era} · ${team.arena}`,
    icon: team.era === 'LEGENDS' ? '🏆' : team.era === 'EUROLEAGUE' ? '🌍' : team.era === 'WNBA' ? '⚡' : '🏀',
    jerseyColor: cssHexToInt(team.colors.primary, 0x1d428a),
    awayJerseyColor: 0xf8fafc,
    cityJerseyColor: cssHexToInt(team.colors.secondary, 0x111827),
    trimColor: cssHexToInt(team.colors.accent || team.colors.secondary, 0xf59e0b),
    accentHex: team.colors.accent || team.colors.secondary || '#f59e0b',
    shootRating: ratingToFiveScale(avg3),
    dunkRating: ratingToFiveScale(avgDunk),
    speedRating: ratingToFiveScale(avgSpd),
    defRating: ratingToFiveScale(avgDef),
    starters,
  };
}
