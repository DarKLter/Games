import React from 'react';
import {
  BADGE_CATALOG,
  type BadgeId,
  type BadgeTier,
  type TeamData,
  type TeamEra,
} from './rosterTypes';
import {
  DEFAULT_ALL_TEAMS,
  RosterStore,
  resolveCanonicalTeamId,
} from './rosterStore';
import { TeamLogo, pickShapeForTeam } from './TeamLogo';
import type {
  EraPoolId,
  HybridRosterStarter,
  HybridTeamSummary,
  MatchVenueId,
} from './types';

// ============================================================================
// UNIFIED 72-TEAM BRIDGE — LIVE-LINKED TO PART 2 ROSTER STORE
// ============================================================================

function teamEraToPool(era: TeamEra): EraPoolId {
  if (era === '2K14') return 'NBA_2K14';
  if (era === '2K26') return 'NBA_2K26';
  if (era === 'LEGENDS') return 'LEGENDS';
  if (era === 'EUROLEAGUE') return 'EUROLEAGUE_14';
  return 'THE_W';
}

function poolToTeamEra(pool: EraPoolId): TeamEra {
  if (pool === 'NBA_2K14') return '2K14';
  if (pool === 'NBA_2K26') return '2K26';
  if (pool === 'LEGENDS') return 'LEGENDS';
  if (pool === 'EUROLEAGUE_14') return 'EUROLEAGUE';
  return 'WNBA';
}

function eraBadgeLabel(era: TeamEra): string {
  if (era === '2K14') return '2013-14 NBA';
  if (era === '2K26') return '2025-26 NBA';
  if (era === 'LEGENDS') return 'NBA Legend';
  if (era === 'EUROLEAGUE') return "EuroLeague '14";
  return 'THE W · WNBA';
}

function mapAbbrToCourtTeamId(abbr: string, idx: number): number {
  const lookup: Record<string, number> = {
    BOS: 0,
    LAL: 1,
    GSW: 2,
    DEN: 3,
    OKC: 4,
    MIL: 5,
    NYK: 6,
    SAS: 7,
    MIN: 8,
    MIA: 9,
    LVA: 10,
    NYL: 11,
    INDW: 12,
    CHIW: 13,
    '96CHI': 14,
    '01LAL': 15,
  };
  return lookup[abbr] ?? (idx % 10);
}

const TIER_RANK: Record<BadgeTier, number> = {
  LEGEND: 5,
  HOF: 4,
  GOLD: 3,
  SILVER: 2,
  BRONZE: 1,
};

function topSignatureTag(badges: Partial<Record<BadgeId, BadgeTier>>, archetype: string): string {
  const entries = Object.entries(badges) as Array<[BadgeId, BadgeTier]>;
  if (entries.length === 0) return archetype;
  entries.sort((a, b) => (TIER_RANK[b[1]] ?? 0) - (TIER_RANK[a[1]] ?? 0));
  const [topId, topTier] = entries[0];
  const meta = BADGE_CATALOG.find((b) => b.id === topId);
  return `${meta?.name ?? topId} (${topTier})`;
}

export function teamDataToSummary(team: TeamData, idx = 0): HybridTeamSummary {
  const eraPool = teamEraToPool(team.era);
  const starters: HybridRosterStarter[] = team.roster.slice(0, 5).map((p) => ({
    name: p.name,
    position: p.position,
    ovr: p.ovr,
    jersey: p.jerseyNumber,
    signatureTag: topSignatureTag(p.badges, p.archetype),
  }));

  const starPlayer = [...starters].sort((a, b) => b.ovr - a.ovr)[0] ?? {
    name: team.name,
    position: 'SF' as const,
    ovr: team.ovr,
    jersey: 6,
    signatureTag: 'Franchise Leader',
  };

  return {
    id: team.id,
    abbr: team.abbr,
    city: team.city,
    name: team.name,
    fullName: `${team.city} ${team.name}`.trim(),
    eraPool,
    eraBadge: eraBadgeLabel(team.era),
    arena: team.arena,
    primaryColor: team.colors.primary,
    secondaryColor: team.colors.secondary,
    accentColor: team.colors.accent,
    ovr: team.ovr,
    off: team.offRating,
    def: team.defRating,
    tagline:
      team.era === 'EUROLEAGUE'
        ? 'Official 2K14 EuroLeague Club'
        : team.era === 'LEGENDS'
          ? 'Iconic Championship Dynasty'
          : team.era === 'WNBA'
            ? 'The W · 2K26 WNBA Franchise'
            : `${team.conference} Conference · ${team.era === '2K14' ? '2013-14' : '2025-26'}`,
    emblemStyle: pickShapeForTeam(team.id, team.era),
    starPlayer,
    starters,
    mappedCourtTeamId: mapAbbrToCourtTeamId(team.abbr, idx),
  };
}

// Static default export (72 teams) for tests/boot inspection
export const HYBRID_ALL_TEAMS: HybridTeamSummary[] = DEFAULT_ALL_TEAMS.map((t, i) =>
  teamDataToSummary(t, i)
);

export const ERA_POOL_META: Array<{
  id: EraPoolId;
  label: string;
  shortLabel: string;
  accent: string;
}> = [
  { id: 'NBA_2K14', label: '2013-14 2K14 (30)', shortLabel: '2K14 NBA', accent: '#E11D48' },
  { id: 'NBA_2K26', label: '2025-26 2K26 (30)', shortLabel: '2K26 NBA', accent: '#F59E0B' },
  { id: 'LEGENDS', label: 'LEGENDS (4)', shortLabel: 'LEGENDS', accent: '#A855F7' },
  { id: 'EUROLEAGUE_14', label: "EUROLEAGUE '14 (4)", shortLabel: 'EURO', accent: '#38BDF8' },
  { id: 'THE_W', label: 'THE W / WNBA (4)', shortLabel: 'THE W', accent: '#FB923C' },
];

export const VENUE_OPTIONS: Array<{
  id: MatchVenueId;
  label: string;
  courtTheme:
    | 'nba_arena'
    | 'park'
    | 'the_rec'
    | 'blacktop'
    | 'street_kings'
    | 'wnba_arena'
    | 'proving_grounds';
  eraNote: string;
}> = [
  { id: 'ARENA_2K26', label: '2K26 Next-Gen NBA Arena', courtTheme: 'nba_arena', eraNote: 'Official ProPLAY Hardwood' },
  { id: 'ARENA_2K14', label: '2K14 Classic Arena', courtTheme: 'nba_arena', eraNote: '2014 Finals Spotlight Gold' },
  { id: 'SKYLINE_PARK', label: 'Skyline Park (2K26)', courtTheme: 'park', eraNote: 'Golden-Hour City Rooftop' },
  { id: 'RIVET_CITY', label: 'Rivet City Rooftops', courtTheme: 'the_rec', eraNote: 'Classic Park Industrial' },
  { id: 'SUNSET_BEACH', label: 'Sunset Beach Courts', courtTheme: 'park', eraNote: 'Palm Oceanfront Park' },
  { id: 'OLD_TOWN', label: 'Old Town Flyers Park', courtTheme: 'proving_grounds', eraNote: 'Heritage Boardwalk Park' },
  { id: 'BLACKTOP_CAGE', label: 'Blacktop Cage', courtTheme: 'blacktop', eraNote: 'Chain-Link Streetball' },
  { id: 'STREET_KINGS', label: 'Street Kings Plaza', courtTheme: 'street_kings', eraNote: '2K26 Boss Arena' },
  { id: 'EUROLEAGUE_PALACE', label: 'EuroLeague Palace', courtTheme: 'proving_grounds', eraNote: 'FIBA / Euro 2K14' },
  { id: 'WNBA_ARENA', label: 'WNBA Arena', courtTheme: 'wnba_arena', eraNote: 'The W Broadcast' },
];

export function getAllLiveHybridTeams(): HybridTeamSummary[] {
  return RosterStore.getAllTeams().map((t, i) => teamDataToSummary(t, i));
}

export function getTeamsByEraPool(pool: EraPoolId): HybridTeamSummary[] {
  const targetEra = poolToTeamEra(pool);
  return RosterStore.getTeamsByEra(targetEra).map((t, i) => teamDataToSummary(t, i));
}

export function getHybridTeamById(id: string): HybridTeamSummary {
  const canon = resolveCanonicalTeamId(id);
  const all = RosterStore.getAllTeams();
  const idx = all.findIndex((t) => t.id === canon);
  if (idx >= 0) return teamDataToSummary(all[idx], idx);
  return teamDataToSummary(all[0], 0);
}

export interface TeamEmblemProps {
  team: HybridTeamSummary;
  size?: number;
}

export const TeamEmblemSVG: React.FC<TeamEmblemProps> = ({ team, size = 76 }) => (
  <TeamLogo
    id={team.id}
    abbr={team.abbr}
    name={team.fullName}
    era={poolToTeamEra(team.eraPool)}
    primaryColor={team.primaryColor}
    secondaryColor={team.secondaryColor}
    accentColor={team.accentColor}
    ovr={team.ovr}
    shape={team.emblemStyle}
    size={size}
  />
);
