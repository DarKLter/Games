import {
  AsphaltCarUpgrades,
  BrMapId,
  BrModeId,
  DEFAULT_EMBLEM_TALENTS,
  DEFAULT_HOOPS_2K26_SETTINGS,
  DEFAULT_MOBA_SETTINGS,
  DEFAULT_MYCOURT_DESIGN,
  DEFAULT_STARTER_EMOTE_IDS,
  Hoops2K26Profile,
  HoopsModeId,
  HoopsTournamentState,
  MOBA_HEROES,
  MOBA_MODES,
  MOBA_SPELLS,
  MobaBackpackState,
  MobaEmblemId,
  MobaEmblemTalentLoadout,
  MobaHeroMasteryEntry,
  MobaMatchRecord,
  MobaModeId,
  MobaSettings,
  MobaSpellId,
  MobaSquadState,
  NARUTO_SHINOBI_ROSTER,
  NarutoModeId,
  NarutoStageId,
  StormSupportType,
  createDailyChallengesForDate,
  createDefaultHoops2K26Profile,
  createDefaultMyPlayerSave,
  createTournamentBracket,
  defaultCarUpgrades,
  getLocalDateKey,
  normalizeEquippedEmotes
} from './arenaRoster';

const memoryStorage: Record<string, string> = {};

export const TOTAL_GAMES = 29;

export const tryStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStorage[key] ?? null;
    }
  },
  setItem(key: string, val: string): void {
    try {
      localStorage.setItem(key, val);
    } catch {
      memoryStorage[key] = val;
    }
  }
};

export interface PlayerProgress {
  totalCoins: number;
  sessionCoins: number;
  sessionExp: number;
  playerXp: number;
  playerLevel: number;
  currentAvatar: string;
  unlockedAvatars: Set<string>;
  highScores: number[];
  username: string;
  selectedChessTimeSec: number;
  // Battle Royale 3D (PUBG Mobile Lobby)
  selectedBrMode: BrModeId;
  selectedBrMap: BrMapId;
  brSupplyCrateReady: boolean;
  brWins: number;
  brKills: number;
  // Legends Arena 3D (Complete MLBB Ecosystem + 129 Heroes)
  selectedMobaHero: number;
  mobaTrialHeroId: number | null;
  unlockedMobaHeroes: number[];
  selectedMobaMode: MobaModeId;
  selectedMobaSpell: MobaSpellId;
  selectedMobaEmblem: MobaEmblemId;
  mobaEmblemLevels: Record<MobaEmblemId, number>;
  mobaEmblemTalents: Record<MobaEmblemId, MobaEmblemTalentLoadout>;
  mobaCustomBuilds: Record<number, string[]>;
  mobaBp: number;
  mobaTickets: number;
  mobaDiamonds: number;
  mobaPromoDiamonds: number;
  mobaOwnedSkins: Record<number, string[]>;
  mobaEquippedSkins: Record<number, string>;
  mobaOwnedRecallEffects: string[];
  mobaRecallEffect: string;
  mobaOwnedElimEffects: string[];
  mobaElimEffect: string;
  mobaOwnedEmotes: string[];
  mobaEquippedEmotes: [string, string, string, string];
  mobaCreditScore: number;
  mobaMatchHistory: MobaMatchRecord[];
  mobaHeroMastery: Record<number, MobaHeroMasteryEntry>;
  mobaSquad: MobaSquadState;
  mobaClaimedAchievements: string[];
  mobaStarlightXp: number;
  mobaStarlightClaimed: number[];
  mobaCheckInDay: number;
  mobaCheckInLastDate: string;
  mobaBackpack: MobaBackpackState;
  mobaDraftBans: number[];
  mobaSettings: MobaSettings;
  mobaWins: number;
  mobaMatchesPlayed: number;
  mobaKillsTotal: number;
  mobaTurretsDestroyed: number;
  claimedMobaQuests: string[];
  mobaDaily: MobaDailyState;
  // Asphalt Nitro 3D (Garage & 4 Maps)
  selectedAsphaltCar: number;
  ownedAsphaltCars: number[];
  carUpgrades: Record<number, AsphaltCarUpgrades>;
  selectedAsphaltMap: number;
  asphaltMapStars: number[];
  // Hoops 2K26 3D (Modes, Playoff Bracket & Complete NBA 2K26 Profile)
  selectedBasketballTeam: number;
  selectedHoopsMode: HoopsModeId;
  hoopsChampionships: number;
  hoopsTournament: HoopsTournamentState;
  hoops2k26: Hoops2K26Profile;
  // Naruto: Senki & Storm (Dual-Engine 2D MOBA + 3D Arena Fighter, 64 Shinobi)
  selectedNarutoHero: number;
  narutoTrialHeroId: number | null;
  unlockedNarutoHeroes: number[];
  selectedNarutoSupport1: number;
  selectedNarutoSupport2: number;
  narutoSupport1Type: StormSupportType;
  narutoSupport2Type: StormSupportType;
  selectedNarutoMode: NarutoModeId;
  selectedNarutoStage: NarutoStageId;
  narutoWins: number;
  narutoMatchesPlayed: number;
  narutoKillsTotal: number;
  narutoTowersDestroyed: number;
}

export interface MobaDailyState {
  dateKey: string;
  matchesPlayed: number;
  rankedWins: number;
  kills: number;
  jungleSlain: number;
  bossesSlain: number;
  claimedIds: string[];
}

function loadHighScores(): number[] {
  const arr = new Array<number>(TOTAL_GAMES).fill(0);
  try {
    const saved = JSON.parse(tryStorage.getItem('tsepang_high_scores') || '[]');
    if (Array.isArray(saved)) {
      saved.forEach((v, i) => {
        if (i < arr.length) arr[i] = Number(v) || 0;
      });
    }
  } catch {
    // ignore corrupted cache
  }
  return arr;
}

function loadUnlockedAvatars(): Set<string> {
  const set = new Set<string>(['😀']);
  try {
    const saved = JSON.parse(tryStorage.getItem('tsepang_unlocks') || '["😀"]');
    if (Array.isArray(saved)) {
      saved.forEach((a) => {
        if (typeof a === 'string') set.add(a);
      });
    }
  } catch {
    // ignore
  }
  return set;
}

function loadUnlockedMobaHeroes(): number[] {
  const set = new Set<number>([0, 1, 2]);
  const maxId = Math.max(2, MOBA_HEROES.length - 1);
  try {
    const raw = JSON.parse(tryStorage.getItem('tsepang_moba_unlocked') || '[0,1,2]');
    if (Array.isArray(raw)) {
      raw.forEach((id) => {
        const n = Number(id);
        if (Number.isInteger(n) && n >= 0 && n <= maxId) set.add(n);
      });
    }
  } catch {
    // ignore
  }
  return Array.from(set).sort((a, b) => a - b);
}

function loadUnlockedNarutoHeroes(): number[] {
  const set = new Set<number>([0, 1, 2, 3]);
  const maxId = Math.max(3, NARUTO_SHINOBI_ROSTER.length - 1);
  try {
    const raw = JSON.parse(tryStorage.getItem('tsepang_naruto_unlocked') || '[0,1,2,3]');
    if (Array.isArray(raw)) {
      raw.forEach((id) => {
        const n = Number(id);
        if (Number.isInteger(n) && n >= 0 && n <= maxId) set.add(n);
      });
    }
  } catch {
    // ignore
  }
  return Array.from(set).sort((a, b) => a - b);
}

function loadMobaEmblemLevels(): Record<MobaEmblemId, number> {
  const out: Record<MobaEmblemId, number> = {
    Common: 1,
    Marksman: 1,
    Tank: 1,
    Fighter: 1,
    Assassin: 1,
    Mage: 1,
    Support: 1
  };
  try {
    const raw = JSON.parse(tryStorage.getItem('tsepang_moba_emblems') || '{}');
    if (raw && typeof raw === 'object') {
      (Object.keys(out) as MobaEmblemId[]).forEach((role) => {
        const v = Number((raw as Record<string, unknown>)[role]);
        if (Number.isFinite(v)) out[role] = Math.max(1, Math.min(5, Math.round(v)));
      });
    }
  } catch {
    // ignore
  }
  return out;
}

interface MobaMetaBlob {
  bp?: number;
  tickets?: number;
  diamonds?: number;
  promoDiamonds?: number;
  emblemTalents?: Partial<Record<MobaEmblemId, MobaEmblemTalentLoadout>>;
  customBuilds?: Record<number, string[]>;
  ownedSkins?: Record<number, string[]>;
  equippedSkins?: Record<number, string>;
  ownedRecallEffects?: string[];
  recallEffect?: string;
  ownedElimEffects?: string[];
  elimEffect?: string;
  ownedEmotes?: string[];
  equippedEmotes?: string[];
  creditScore?: number;
  matchHistory?: MobaMatchRecord[];
  heroMastery?: Record<number, MobaHeroMasteryEntry>;
  squad?: Partial<MobaSquadState>;
  claimedAchievements?: string[];
  starlightXp?: number;
  starlightClaimed?: number[];
  checkInDay?: number;
  checkInLastDate?: string;
  backpack?: Partial<MobaBackpackState>;
  draftBans?: number[];
  settings?: Partial<MobaSettings>;
}

function loadMobaMetaBlob(): MobaMetaBlob {
  try {
    const raw = JSON.parse(tryStorage.getItem('tsepang_moba_meta_v2') || '{}');
    if (raw && typeof raw === 'object') return raw as MobaMetaBlob;
  } catch {
    // ignore corrupted cache
  }
  return {};
}

function mergeEmblemTalents(
  saved?: Partial<Record<MobaEmblemId, MobaEmblemTalentLoadout>>
): Record<MobaEmblemId, MobaEmblemTalentLoadout> {
  const out = {} as Record<MobaEmblemId, MobaEmblemTalentLoadout>;
  (Object.keys(DEFAULT_EMBLEM_TALENTS) as MobaEmblemId[]).forEach((key) => {
    const base = DEFAULT_EMBLEM_TALENTS[key];
    const s = saved?.[key];
    out[key] = {
      t1: typeof s?.t1 === 'string' ? s.t1 : base.t1,
      t2: typeof s?.t2 === 'string' ? s.t2 : base.t2,
      t3: typeof s?.t3 === 'string' ? s.t3 : base.t3
    };
  });
  return out;
}

function loadClaimedMobaQuests(): string[] {
  try {
    const raw = JSON.parse(tryStorage.getItem('tsepang_moba_quests') || '[]');
    if (Array.isArray(raw)) {
      return raw.filter((q): q is string => typeof q === 'string');
    }
  } catch {
    // ignore
  }
  return [];
}

function createFreshDailyState(dateKey = getLocalDateKey()): MobaDailyState {
  return {
    dateKey,
    matchesPlayed: 0,
    rankedWins: 0,
    kills: 0,
    jungleSlain: 0,
    bossesSlain: 0,
    claimedIds: []
  };
}

function loadMobaDailyState(): MobaDailyState {
  const today = getLocalDateKey();
  try {
    const raw = JSON.parse(tryStorage.getItem('tsepang_moba_daily') || 'null');
    if (raw && typeof raw === 'object' && raw.dateKey === today) {
      return {
        dateKey: today,
        matchesPlayed: Math.max(0, Number(raw.matchesPlayed) || 0),
        rankedWins: Math.max(0, Number(raw.rankedWins) || 0),
        kills: Math.max(0, Number(raw.kills) || 0),
        jungleSlain: Math.max(0, Number(raw.jungleSlain) || 0),
        bossesSlain: Math.max(0, Number(raw.bossesSlain) || 0),
        claimedIds: Array.isArray(raw.claimedIds)
          ? raw.claimedIds.filter((q: unknown): q is string => typeof q === 'string')
          : []
      };
    }
  } catch {
    // ignore corrupted daily mission data
  }
  return createFreshDailyState(today);
}

function loadOwnedCars(): number[] {
  const set = new Set<number>([0]);
  try {
    const raw = JSON.parse(tryStorage.getItem('tsepang_asphalt_owned') || '[0]');
    if (Array.isArray(raw)) {
      raw.forEach((id) => {
        const n = Number(id);
        if (Number.isInteger(n) && n >= 0 && n <= 7) set.add(n);
      });
    }
  } catch {
    // ignore
  }
  return Array.from(set).sort((a, b) => a - b);
}

function loadCarUpgrades(): Record<number, AsphaltCarUpgrades> {
  const out: Record<number, AsphaltCarUpgrades> = {};
  for (let i = 0; i < 8; i++) out[i] = defaultCarUpgrades();
  try {
    const raw = JSON.parse(tryStorage.getItem('tsepang_asphalt_upgrades') || '{}');
    if (raw && typeof raw === 'object') {
      for (let i = 0; i < 8; i++) {
        const u = (raw as Record<string, Partial<AsphaltCarUpgrades>>)[String(i)];
        if (u && typeof u === 'object') {
          out[i] = {
            speed: Math.max(1, Math.min(5, Number(u.speed) || 1)),
            accel: Math.max(1, Math.min(5, Number(u.accel) || 1)),
            nitro: Math.max(1, Math.min(5, Number(u.nitro) || 1)),
            handling: Math.max(1, Math.min(5, Number(u.handling) || 1))
          };
        }
      }
    }
  } catch {
    // ignore
  }
  return out;
}

function loadMapStars(): number[] {
  const stars = [0, 0, 0, 0];
  try {
    const raw = JSON.parse(tryStorage.getItem('tsepang_asphalt_stars') || '[0,0,0,0]');
    if (Array.isArray(raw)) {
      for (let i = 0; i < 4; i++) {
        stars[i] = Math.max(0, Math.min(3, Number(raw[i]) || 0));
      }
    }
  } catch {
    // ignore
  }
  return stars;
}

function loadHoopsTournament(teamId: number): HoopsTournamentState {
  try {
    const raw = JSON.parse(tryStorage.getItem('tsepang_hoops_tourney') || 'null');
    if (raw && typeof raw === 'object' && Array.isArray(raw.opponents) && raw.opponents.length === 3) {
      return {
        teamId: Math.max(0, Math.min(3, Number(raw.teamId) || 0)),
        round: ([1, 2, 3].includes(Number(raw.round)) ? Number(raw.round) : 1) as 1 | 2 | 3,
        opponents: [
          Math.max(0, Math.min(3, Number(raw.opponents[0]) || 0)),
          Math.max(0, Math.min(3, Number(raw.opponents[1]) || 1)),
          Math.max(0, Math.min(3, Number(raw.opponents[2]) || 2))
        ],
        champion: Boolean(raw.champion)
      };
    }
  } catch {
    // ignore
  }
  return createTournamentBracket(teamId);
}

function loadHoops2K26Profile(): Hoops2K26Profile {
  const today = getLocalDateKey();
  const base = createDefaultHoops2K26Profile(today);
  try {
    const raw = JSON.parse(tryStorage.getItem('tsepang_hoops2k26_v1') || 'null');
    if (raw && typeof raw === 'object') {
      const mergedSaves =
        Array.isArray(raw.saves) && raw.saves.length > 0
          ? raw.saves.map((s: Record<string, unknown>, idx: number) => ({
              ...createDefaultMyPlayerSave(`mp_${idx + 1}`),
              ...s
            }))
          : base.saves;
      const daily =
        raw.dailyChallenges && raw.dailyChallenges.dateKey === today && Array.isArray(raw.dailyChallenges.tasks)
          ? raw.dailyChallenges
          : createDailyChallengesForDate(today);
      return {
        ...base,
        ...raw,
        settings: { ...DEFAULT_HOOPS_2K26_SETTINGS, ...(raw.settings ?? {}) },
        myCourt: { ...DEFAULT_MYCOURT_DESIGN, ...(raw.myCourt ?? {}) },
        timers: { ...base.timers, ...(raw.timers ?? {}) },
        careerStats: { ...base.careerStats, ...(raw.careerStats ?? {}) },
        gameChangers: { ...base.gameChangers, ...(raw.gameChangers ?? {}) },
        saves: mergedSaves,
        activeSaveId:
          typeof raw.activeSaveId === 'string' && mergedSaves.some((s: { id: string }) => s.id === raw.activeSaveId)
            ? raw.activeSaveId
            : mergedSaves[0].id,
        dailyChallenges: daily,
        activeMatchContext: null
      };
    }
  } catch {
    // ignore malformed storage
  }
  return base;
}

const parsedCoins = parseInt(tryStorage.getItem('tsepang_coins') || '100', 10);
const savedTeam = Math.max(0, Math.min(3, parseInt(tryStorage.getItem('tsepang_basketball_team') || '0', 10) || 0));
const savedBrMode = tryStorage.getItem('tsepang_br_mode');
const savedBrMap = tryStorage.getItem('tsepang_br_map');
const savedMobaMode = tryStorage.getItem('tsepang_moba_mode');
const savedMobaSpell = tryStorage.getItem('tsepang_moba_spell');
const savedMobaEmblem = tryStorage.getItem('tsepang_moba_emblem_sel');
const savedHoopsMode = tryStorage.getItem('tsepang_hoops_mode');
const maxHeroId = Math.max(2, MOBA_HEROES.length - 1);
const unlockedHeroesInit = loadUnlockedMobaHeroes();
const rawSelectedHero = Math.max(0, Math.min(maxHeroId, parseInt(tryStorage.getItem('tsepang_moba_hero') || '0', 10) || 0));

const maxNarutoId = Math.max(3, NARUTO_SHINOBI_ROSTER.length - 1);
const unlockedNarutoInit = loadUnlockedNarutoHeroes();
const rawSelectedNaruto = Math.max(0, Math.min(maxNarutoId, parseInt(tryStorage.getItem('tsepang_naruto_hero') || '0', 10) || 0));
const rawNarutoSup1 = Math.max(0, Math.min(maxNarutoId, parseInt(tryStorage.getItem('tsepang_naruto_sup1') || '1', 10) || 1));
const rawNarutoSup2 = Math.max(0, Math.min(maxNarutoId, parseInt(tryStorage.getItem('tsepang_naruto_sup2') || '2', 10) || 2));
const savedNarutoMode = tryStorage.getItem('tsepang_naruto_mode');
const savedNarutoStage = tryStorage.getItem('tsepang_naruto_stage');
const savedSup1Type = tryStorage.getItem('tsepang_naruto_sup1_type');
const savedSup2Type = tryStorage.getItem('tsepang_naruto_sup2_type');

const mobaMetaInit = loadMobaMetaBlob();
const validMobaModes = new Set<string>(MOBA_MODES.map((m) => m.id));
const validMobaSpells = new Set<string>(MOBA_SPELLS.map((s) => s.id));
const validMobaEmblems = new Set<string>(['Common', 'Tank', 'Assassin', 'Mage', 'Fighter', 'Support', 'Marksman']);

export const playerState: PlayerProgress = {
  totalCoins: Number.isNaN(parsedCoins) ? 100 : parsedCoins,
  sessionCoins: 0,
  sessionExp: 0,
  playerXp: parseInt(tryStorage.getItem('tsepang_xp') || '0', 10) || 0,
  playerLevel: parseInt(tryStorage.getItem('tsepang_lvl') || '1', 10) || 1,
  currentAvatar: tryStorage.getItem('tsepang_avatar') || '😀',
  unlockedAvatars: loadUnlockedAvatars(),
  highScores: loadHighScores(),
  username: tryStorage.getItem('tsepang_username') || 'TsepangPlayer',
  selectedChessTimeSec: (() => {
    const t = parseInt(tryStorage.getItem('tsepang_chess_time') || '600', 10);
    return t === 60 || t === 300 || t === 600 || t === 900 ? t : 600;
  })(),
  selectedBrMode: savedBrMode === 'squad' ? 'squad' : 'solo',
  selectedBrMap: savedBrMap === 'sanhok' ? 'sanhok' : 'erangel',
  brSupplyCrateReady: tryStorage.getItem('tsepang_br_crate') === '1',
  brWins: Math.max(0, parseInt(tryStorage.getItem('tsepang_br_wins') || '0', 10) || 0),
  brKills: Math.max(0, parseInt(tryStorage.getItem('tsepang_br_kills') || '0', 10) || 0),
  selectedMobaHero: unlockedHeroesInit.includes(rawSelectedHero) ? rawSelectedHero : 0,
  mobaTrialHeroId: null,
  unlockedMobaHeroes: unlockedHeroesInit,
  selectedMobaMode:
    savedMobaMode && validMobaModes.has(savedMobaMode) ? (savedMobaMode as MobaModeId) : 'classic',
  selectedMobaSpell:
    savedMobaSpell && validMobaSpells.has(savedMobaSpell) ? (savedMobaSpell as MobaSpellId) : 'flicker',
  selectedMobaEmblem:
    savedMobaEmblem && validMobaEmblems.has(savedMobaEmblem) ? (savedMobaEmblem as MobaEmblemId) : 'Fighter',
  mobaEmblemLevels: loadMobaEmblemLevels(),
  mobaEmblemTalents: mergeEmblemTalents(mobaMetaInit.emblemTalents),
  mobaCustomBuilds: mobaMetaInit.customBuilds && typeof mobaMetaInit.customBuilds === 'object' ? mobaMetaInit.customBuilds : {},
  mobaBp: Math.max(0, Number(mobaMetaInit.bp ?? 12000)),
  mobaTickets: Math.max(0, Number(mobaMetaInit.tickets ?? 250)),
  mobaDiamonds: Math.max(0, Number(mobaMetaInit.diamonds ?? 120)),
  mobaPromoDiamonds: Math.max(0, Number(mobaMetaInit.promoDiamonds ?? 60)),
  mobaOwnedSkins: mobaMetaInit.ownedSkins && typeof mobaMetaInit.ownedSkins === 'object' ? mobaMetaInit.ownedSkins : {},
  mobaEquippedSkins:
    mobaMetaInit.equippedSkins && typeof mobaMetaInit.equippedSkins === 'object' ? mobaMetaInit.equippedSkins : {},
  mobaOwnedRecallEffects: Array.isArray(mobaMetaInit.ownedRecallEffects)
    ? Array.from(new Set(['recall_classic', ...mobaMetaInit.ownedRecallEffects]))
    : ['recall_classic'],
  mobaRecallEffect: typeof mobaMetaInit.recallEffect === 'string' ? mobaMetaInit.recallEffect : 'recall_classic',
  mobaOwnedElimEffects: Array.isArray(mobaMetaInit.ownedElimEffects)
    ? Array.from(new Set(['elim_classic', ...mobaMetaInit.ownedElimEffects]))
    : ['elim_classic'],
  mobaElimEffect: typeof mobaMetaInit.elimEffect === 'string' ? mobaMetaInit.elimEffect : 'elim_classic',
  mobaOwnedEmotes: Array.isArray(mobaMetaInit.ownedEmotes)
    ? Array.from(new Set([...DEFAULT_STARTER_EMOTE_IDS, ...mobaMetaInit.ownedEmotes.filter((v): v is string => typeof v === 'string')]))
    : [...DEFAULT_STARTER_EMOTE_IDS],
  mobaEquippedEmotes: normalizeEquippedEmotes(
    mobaMetaInit.equippedEmotes,
    Array.isArray(mobaMetaInit.ownedEmotes)
      ? mobaMetaInit.ownedEmotes.filter((v): v is string => typeof v === 'string')
      : DEFAULT_STARTER_EMOTE_IDS
  ),
  mobaCreditScore: Math.max(0, Math.min(110, Number(mobaMetaInit.creditScore ?? 110))),
  mobaMatchHistory: Array.isArray(mobaMetaInit.matchHistory) ? mobaMetaInit.matchHistory.slice(0, 20) : [],
  mobaHeroMastery:
    mobaMetaInit.heroMastery && typeof mobaMetaInit.heroMastery === 'object' ? mobaMetaInit.heroMastery : {},
  mobaSquad: {
    name: typeof mobaMetaInit.squad?.name === 'string' ? mobaMetaInit.squad.name : 'Dawn Guardians',
    tag: typeof mobaMetaInit.squad?.tag === 'string' ? mobaMetaInit.squad.tag : 'DAWN',
    slogan:
      typeof mobaMetaInit.squad?.slogan === 'string'
        ? mobaMetaInit.squad.slogan
        : 'Push turrets, secure Lord, claim Mythic!'
  },
  mobaClaimedAchievements: Array.isArray(mobaMetaInit.claimedAchievements)
    ? mobaMetaInit.claimedAchievements.filter((v): v is string => typeof v === 'string')
    : [],
  mobaStarlightXp: Math.max(0, Number(mobaMetaInit.starlightXp ?? 40)),
  mobaStarlightClaimed: Array.isArray(mobaMetaInit.starlightClaimed)
    ? mobaMetaInit.starlightClaimed.map(Number).filter(Number.isFinite)
    : [],
  mobaCheckInDay: Math.max(0, Math.min(7, Number(mobaMetaInit.checkInDay ?? 0))),
  mobaCheckInLastDate: typeof mobaMetaInit.checkInLastDate === 'string' ? mobaMetaInit.checkInLastDate : '',
  mobaBackpack: {
    trialCards: Math.max(0, Number(mobaMetaInit.backpack?.trialCards ?? 3)),
    doubleBpCards: Math.max(0, Number(mobaMetaInit.backpack?.doubleBpCards ?? 2)),
    activeDoubleBp: Boolean(mobaMetaInit.backpack?.activeDoubleBp),
    starProtectionCards: Math.max(0, Number(mobaMetaInit.backpack?.starProtectionCards ?? 1))
  },
  mobaDraftBans: Array.isArray(mobaMetaInit.draftBans)
    ? mobaMetaInit.draftBans.map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= maxHeroId).slice(0, 6)
    : [],
  mobaSettings: {
    ...DEFAULT_MOBA_SETTINGS,
    ...(mobaMetaInit.settings ?? {})
  },
  mobaWins: Math.max(0, parseInt(tryStorage.getItem('tsepang_moba_wins') || '0', 10) || 0),
  mobaMatchesPlayed: Math.max(0, parseInt(tryStorage.getItem('tsepang_moba_matches') || '0', 10) || 0),
  mobaKillsTotal: Math.max(0, parseInt(tryStorage.getItem('tsepang_moba_kills') || '0', 10) || 0),
  mobaTurretsDestroyed: Math.max(0, parseInt(tryStorage.getItem('tsepang_moba_turrets') || '0', 10) || 0),
  claimedMobaQuests: loadClaimedMobaQuests(),
  mobaDaily: loadMobaDailyState(),
  selectedAsphaltCar: Math.max(0, Math.min(7, parseInt(tryStorage.getItem('tsepang_asphalt_car') || '0', 10) || 0)),
  ownedAsphaltCars: loadOwnedCars(),
  carUpgrades: loadCarUpgrades(),
  selectedAsphaltMap: Math.max(0, Math.min(3, parseInt(tryStorage.getItem('tsepang_asphalt_map') || '0', 10) || 0)),
  asphaltMapStars: loadMapStars(),
  selectedBasketballTeam: savedTeam,
  selectedHoopsMode:
    savedHoopsMode === '2v2' || savedHoopsMode === '3v3' || savedHoopsMode === 'tournament'
      ? savedHoopsMode
      : '5v5',
  hoopsChampionships: Math.max(0, parseInt(tryStorage.getItem('tsepang_hoops_champs') || '0', 10) || 0),
  hoopsTournament: loadHoopsTournament(savedTeam),
  hoops2k26: loadHoops2K26Profile(),
  selectedNarutoHero: unlockedNarutoInit.includes(rawSelectedNaruto) ? rawSelectedNaruto : 0,
  narutoTrialHeroId: null,
  unlockedNarutoHeroes: unlockedNarutoInit,
  selectedNarutoSupport1: rawNarutoSup1,
  selectedNarutoSupport2: rawNarutoSup2,
  narutoSupport1Type:
    savedSup1Type === 'guard' || savedSup1Type === 'charge' || savedSup1Type === 'cover_fire'
      ? savedSup1Type
      : 'attack',
  narutoSupport2Type:
    savedSup2Type === 'attack' || savedSup2Type === 'charge' || savedSup2Type === 'cover_fire'
      ? savedSup2Type
      : 'guard',
  selectedNarutoMode:
    savedNarutoMode === 'senki_4v4' || savedNarutoMode === 'storm_3v3' || savedNarutoMode === 'storm_1v1'
      ? savedNarutoMode
      : 'senki_3v3',
  selectedNarutoStage:
    savedNarutoStage === 'valley_of_end' ||
    savedNarutoStage === 'chunin_arena' ||
    savedNarutoStage === 'shinobi_war_crater' ||
    savedNarutoStage === 'kaguya_dimension'
      ? savedNarutoStage
      : 'konoha_gates',
  narutoWins: Math.max(0, parseInt(tryStorage.getItem('tsepang_naruto_wins') || '0', 10) || 0),
  narutoMatchesPlayed: Math.max(0, parseInt(tryStorage.getItem('tsepang_naruto_matches') || '0', 10) || 0),
  narutoKillsTotal: Math.max(0, parseInt(tryStorage.getItem('tsepang_naruto_kills') || '0', 10) || 0),
  narutoTowersDestroyed: Math.max(0, parseInt(tryStorage.getItem('tsepang_naruto_towers') || '0', 10) || 0)
};

export function persistCoinsAndUnlocks(): void {
  tryStorage.setItem('tsepang_coins', String(playerState.totalCoins));
  tryStorage.setItem('tsepang_unlocks', JSON.stringify(Array.from(playerState.unlockedAvatars)));
}

export function persistHighScores(): void {
  tryStorage.setItem('tsepang_high_scores', JSON.stringify(playerState.highScores));
}

export function persistXpAndLevel(): void {
  tryStorage.setItem('tsepang_xp', String(playerState.playerXp));
  tryStorage.setItem('tsepang_lvl', String(playerState.playerLevel));
}

export function persistArenaSelections(): void {
  tryStorage.setItem('tsepang_br_mode', playerState.selectedBrMode);
  tryStorage.setItem('tsepang_br_map', playerState.selectedBrMap);
  tryStorage.setItem('tsepang_br_crate', playerState.brSupplyCrateReady ? '1' : '0');
  tryStorage.setItem('tsepang_moba_hero', String(playerState.selectedMobaHero));
  tryStorage.setItem('tsepang_moba_mode', playerState.selectedMobaMode);
  tryStorage.setItem('tsepang_moba_spell', playerState.selectedMobaSpell);
  tryStorage.setItem('tsepang_moba_emblem_sel', playerState.selectedMobaEmblem);
  tryStorage.setItem('tsepang_asphalt_car', String(playerState.selectedAsphaltCar));
  tryStorage.setItem('tsepang_asphalt_map', String(playerState.selectedAsphaltMap));
  tryStorage.setItem('tsepang_basketball_team', String(playerState.selectedBasketballTeam));
  tryStorage.setItem('tsepang_hoops_mode', playerState.selectedHoopsMode);
}

export function persistMobaProgression(): void {
  tryStorage.setItem('tsepang_moba_hero', String(playerState.selectedMobaHero));
  tryStorage.setItem('tsepang_moba_unlocked', JSON.stringify(playerState.unlockedMobaHeroes));
  tryStorage.setItem('tsepang_moba_emblem_sel', playerState.selectedMobaEmblem);
  tryStorage.setItem('tsepang_moba_emblems', JSON.stringify(playerState.mobaEmblemLevels));
  tryStorage.setItem('tsepang_moba_quests', JSON.stringify(playerState.claimedMobaQuests));
}

export function persistAsphaltGarage(): void {
  tryStorage.setItem('tsepang_asphalt_car', String(playerState.selectedAsphaltCar));
  tryStorage.setItem('tsepang_asphalt_owned', JSON.stringify(playerState.ownedAsphaltCars));
  tryStorage.setItem('tsepang_asphalt_upgrades', JSON.stringify(playerState.carUpgrades));
  tryStorage.setItem('tsepang_asphalt_map', String(playerState.selectedAsphaltMap));
  tryStorage.setItem('tsepang_asphalt_stars', JSON.stringify(playerState.asphaltMapStars));
}

export function persistHoopsTournament(): void {
  tryStorage.setItem('tsepang_hoops_mode', playerState.selectedHoopsMode);
  tryStorage.setItem('tsepang_hoops_champs', String(playerState.hoopsChampionships));
  tryStorage.setItem('tsepang_hoops_tourney', JSON.stringify(playerState.hoopsTournament));
}

export function persistHoops2K26(): void {
  const safeCopy: Hoops2K26Profile = {
    ...playerState.hoops2k26,
    activeMatchContext: null
  };
  tryStorage.setItem('tsepang_hoops2k26_v1', JSON.stringify(safeCopy));
}

export function persistBrStats(): void {
  tryStorage.setItem('tsepang_br_crate', playerState.brSupplyCrateReady ? '1' : '0');
  tryStorage.setItem('tsepang_br_wins', String(playerState.brWins));
  tryStorage.setItem('tsepang_br_kills', String(playerState.brKills));
}

export function persistMobaStats(): void {
  tryStorage.setItem('tsepang_moba_wins', String(playerState.mobaWins));
  tryStorage.setItem('tsepang_moba_matches', String(playerState.mobaMatchesPlayed));
  tryStorage.setItem('tsepang_moba_kills', String(playerState.mobaKillsTotal));
  tryStorage.setItem('tsepang_moba_turrets', String(playerState.mobaTurretsDestroyed));
  tryStorage.setItem('tsepang_moba_quests', JSON.stringify(playerState.claimedMobaQuests));
}

export function persistMobaMeta(): void {
  const blob: MobaMetaBlob = {
    bp: playerState.mobaBp,
    tickets: playerState.mobaTickets,
    diamonds: playerState.mobaDiamonds,
    promoDiamonds: playerState.mobaPromoDiamonds,
    emblemTalents: playerState.mobaEmblemTalents,
    customBuilds: playerState.mobaCustomBuilds,
    ownedSkins: playerState.mobaOwnedSkins,
    equippedSkins: playerState.mobaEquippedSkins,
    ownedRecallEffects: playerState.mobaOwnedRecallEffects,
    recallEffect: playerState.mobaRecallEffect,
    ownedElimEffects: playerState.mobaOwnedElimEffects,
    elimEffect: playerState.mobaElimEffect,
    ownedEmotes: playerState.mobaOwnedEmotes,
    equippedEmotes: playerState.mobaEquippedEmotes,
    creditScore: playerState.mobaCreditScore,
    matchHistory: playerState.mobaMatchHistory.slice(0, 20),
    heroMastery: playerState.mobaHeroMastery,
    squad: playerState.mobaSquad,
    claimedAchievements: playerState.mobaClaimedAchievements,
    starlightXp: playerState.mobaStarlightXp,
    starlightClaimed: playerState.mobaStarlightClaimed,
    checkInDay: playerState.mobaCheckInDay,
    checkInLastDate: playerState.mobaCheckInLastDate,
    backpack: playerState.mobaBackpack,
    draftBans: playerState.mobaDraftBans,
    settings: playerState.mobaSettings
  };
  tryStorage.setItem('tsepang_moba_meta_v2', JSON.stringify(blob));
}

export function recordMobaMatchResult(params: {
  heroId: number;
  heroName: string;
  mode: string;
  victory: boolean;
  kills: number;
  deaths: number;
  gold: number;
  score: number;
  durationSec: number;
  items: string[];
}): void {
  const kdaRatio = (params.kills + 1) / Math.max(1, params.deaths + 1);
  const medal: 'MVP' | 'Gold' | 'Silver' =
    params.victory && (params.kills >= 4 || kdaRatio >= 2.2)
      ? 'MVP'
      : kdaRatio >= 1.2 || params.victory
        ? 'Gold'
        : 'Silver';

  const rec: MobaMatchRecord = {
    id: `m_${Date.now().toString(36)}`,
    heroId: params.heroId,
    heroName: params.heroName,
    mode: params.mode,
    victory: params.victory,
    kills: params.kills,
    deaths: params.deaths,
    gold: Math.round(params.gold),
    score: Math.round(params.score),
    durationSec: Math.max(1, Math.round(params.durationSec)),
    medal,
    items: params.items.slice(0, 6),
    timestamp: Date.now()
  };

  playerState.mobaMatchHistory = [rec, ...playerState.mobaMatchHistory].slice(0, 20);

  // Update Hero Mastery & MMR
  const prev = playerState.mobaHeroMastery[params.heroId] ?? {
    matches: 0,
    wins: 0,
    mmr: 1000,
    masteryPts: 0
  };
  playerState.mobaHeroMastery[params.heroId] = {
    matches: prev.matches + 1,
    wins: prev.wins + (params.victory ? 1 : 0),
    mmr: Math.max(800, prev.mmr + (params.victory ? 42 + params.kills * 4 : -18 + params.kills * 2)),
    masteryPts: prev.masteryPts + (params.victory ? 160 : 85) + params.kills * 15
  };

  // Award BP, Tickets, StarLight XP, Credit Score
  const bpBase = params.victory ? 420 : 210;
  const bpMult = playerState.mobaBackpack.activeDoubleBp ? 2 : 1;
  playerState.mobaBp += (bpBase + params.kills * 35) * bpMult;
  if (playerState.mobaBackpack.activeDoubleBp) {
    playerState.mobaBackpack.activeDoubleBp = false;
  }
  playerState.mobaTickets += params.victory ? 22 : 10;
  playerState.mobaStarlightXp += params.victory ? 65 : 35;
  playerState.mobaCreditScore = Math.min(110, playerState.mobaCreditScore + 1);
  persistMobaMeta();
}

export function persistMobaDaily(): void {
  tryStorage.setItem('tsepang_moba_daily', JSON.stringify(playerState.mobaDaily));
}

export function ensureCurrentMobaDailyState(date = new Date()): MobaDailyState {
  const today = getLocalDateKey(date);
  if (playerState.mobaDaily.dateKey !== today) {
    playerState.mobaDaily = createFreshDailyState(today);
    persistMobaDaily();
  }
  return playerState.mobaDaily;
}

export function recordMobaDailyEvent(
  event: 'match' | 'ranked_win' | 'kill' | 'jungle' | 'boss',
  amount = 1,
  date = new Date()
): void {
  const daily = ensureCurrentMobaDailyState(date);
  const delta = Math.max(1, Math.round(amount));
  if (event === 'match') daily.matchesPlayed += delta;
  else if (event === 'ranked_win') daily.rankedWins += delta;
  else if (event === 'kill') daily.kills += delta;
  else if (event === 'jungle') daily.jungleSlain += delta;
  else if (event === 'boss') daily.bossesSlain += delta;
  persistMobaDaily();
}

export function persistNarutoProgression(): void {
  tryStorage.setItem('tsepang_naruto_hero', String(playerState.selectedNarutoHero));
  tryStorage.setItem('tsepang_naruto_unlocked', JSON.stringify(playerState.unlockedNarutoHeroes));
  tryStorage.setItem('tsepang_naruto_sup1', String(playerState.selectedNarutoSupport1));
  tryStorage.setItem('tsepang_naruto_sup2', String(playerState.selectedNarutoSupport2));
  tryStorage.setItem('tsepang_naruto_sup1_type', playerState.narutoSupport1Type);
  tryStorage.setItem('tsepang_naruto_sup2_type', playerState.narutoSupport2Type);
  tryStorage.setItem('tsepang_naruto_mode', playerState.selectedNarutoMode);
  tryStorage.setItem('tsepang_naruto_stage', playerState.selectedNarutoStage);
  tryStorage.setItem('tsepang_naruto_wins', String(playerState.narutoWins));
  tryStorage.setItem('tsepang_naruto_matches', String(playerState.narutoMatchesPlayed));
  tryStorage.setItem('tsepang_naruto_kills', String(playerState.narutoKillsTotal));
  tryStorage.setItem('tsepang_naruto_towers', String(playerState.narutoTowersDestroyed));
}

export function persistChessTime(sec: number): void {
  const valid = sec === 60 || sec === 300 || sec === 600 || sec === 900 ? sec : 600;
  playerState.selectedChessTimeSec = valid;
  tryStorage.setItem('tsepang_chess_time', String(valid));
}

export interface UiPrefs {
  greetingTitle?: string;
  isNight?: boolean;
  cloudCount?: number;
  mountainCount?: number;
  sunPos?: number;
  activeThemeIdx?: number;
  dpadScale?: number;
  dpadY?: number;
  dpadX?: number;
}

export function loadUiPrefs(): UiPrefs {
  try {
    const raw = JSON.parse(tryStorage.getItem('tsepang_ui_prefs_v1') || 'null');
    if (raw && typeof raw === 'object') return raw as UiPrefs;
  } catch {
    // ignore malformed storage
  }
  return {};
}

export function saveUiPrefs(partial: UiPrefs): void {
  const merged = { ...loadUiPrefs(), ...partial };
  tryStorage.setItem('tsepang_ui_prefs_v1', JSON.stringify(merged));
}
