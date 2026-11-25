export type MmModeId = 'tdm' | 'ffa' | 'ctf' | 'ptb' | 'survival' | 'bootcamp';

export type MmBiomeId = 'jungle' | 'underground' | 'arctic' | 'lunar' | 'desert' | 'industrial';

export type MmWeaponCategory = 'one_handed' | 'rifle_sniper' | 'heavy_special';

export type MmFireMode = 'semi' | 'auto' | 'burst3' | 'bolt' | 'melee' | 'shield' | 'flame' | 'laser' | 'spinup';

export type MmGrenadeId = 'frag' | 'gas' | 'proxy' | 'emp';

export type MmSpecialPerkId = 'grenadier' | 'jet_booster' | 'heavy_armor' | 'quick_hands';

export type MmBotDifficulty = 'easy' | 'normal' | 'pro' | 'insane';

export type MmTeam = 'blue' | 'red' | 'ffa';

export interface MmWeaponDef {
  id: string;
  name: string;
  shortName: string;
  category: MmWeaponCategory;
  fireMode: MmFireMode;
  oneHanded: boolean;
  isMelee?: boolean;
  isShield?: boolean;
  damage: number;
  headshotMult: number;
  pellets: number;
  rpm: number; // shots per minute
  magSize: number;
  reserveMax: number;
  reloadSec: number;
  zoomMax: number; // e.g., 1.2 .. 7.0
  weightSpeedMult: number; // 0.75 .. 1.0
  recoilImpulse: number; // px/s pushback per shot
  spreadDeg: number;
  projectileSpeed: number; // px/s (0 for hitscan/melee)
  projectileKind: 'bullet' | 'pellet' | 'rocket' | 'mortar' | 'flame' | 'laser' | 'emp' | 'saw' | 'melee' | 'shield';
  splashRadius?: number;
  ricochets?: number;
  spinUpSec?: number;
  hasLaserSight?: boolean;
  burnsTarget?: boolean;
  disablesJetpackSec?: number;
  batteryAutoRefill?: boolean;
  color: string;
  accent: string;
  desc: string;
  unlockCostCash: number;
}

export interface MmGrenadeDef {
  id: MmGrenadeId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  fuseSec: number;
  radius: number;
  damage: number;
  desc: string;
}

export interface MmLoadoutDef {
  id: string;
  name: string;
  primaryId: string;
  secondaryId: string;
  dualWieldStart?: boolean;
  grenadeId: MmGrenadeId;
  grenadeCount: number;
  perkId: MmSpecialPerkId;
  coinCost: number;
  desc: string;
}

export interface MmPlatformRect {
  x: number;
  y: number;
  w: number;
  h: number;
  oneWay?: boolean;
  material?: 'stone' | 'metal' | 'wood' | 'ice' | 'sand' | 'hazard';
}

export interface MmSpawnPad {
  x: number;
  y: number;
  kind: 'weapon' | 'health' | 'boost' | 'ammo';
  weaponPool?: string[];
  respawnSec: number;
}

export interface MmMapDef {
  id: string;
  name: string;
  biome: MmBiomeId;
  width: number;
  height: number;
  gravityScale: number; // 1.0 normal, 0.38 lunarcy
  unlimitedJetpack?: boolean;
  friction: number; // 1.0 normal, 0.32 icebox
  lethalAbyss?: boolean;
  snowOverlay?: boolean;
  description: string;
  tagline: string;
  platforms: MmPlatformRect[];
  blueSpawns: { x: number; y: number }[];
  redSpawns: { x: number; y: number }[];
  ffaSpawns: { x: number; y: number }[];
  blueFlagPos: { x: number; y: number };
  redFlagPos: { x: number; y: number };
  bombSiteA: { x: number; y: number };
  bombSiteB: { x: number; y: number };
  pads: MmSpawnPad[];
}

export interface MmAvatarConfig {
  name: string;
  skinTone: string;
  eyeStyle: 'determined' | 'angry' | 'cool' | 'cyber' | 'scarred' | 'sarge';
  headgear: string;
  eyewear: string;
  facial: string;
  outfit: string;
  boots: string;
  accentColor: string;
}

export interface MmRankDef {
  index: number;
  title: string;
  xpRequired: number;
  discountPct: number;
  insigniaType: 'chevron' | 'bar' | 'leaf' | 'eagle' | 'star' | 'commander';
  tierCount: number;
  color: string;
}

export interface MmAchievementDef {
  id: string;
  title: string;
  desc: string;
  icon: string;
  rewardCash: number;
  rewardXp: number;
  target: number;
  getProgress: (save: MiniMilitiaSave) => number;
}

export interface MmWeaponMasteryStat {
  kills: number;
  shotsFired: number;
  shotsHit: number;
  headshots: number;
}

export interface MmMatchHistoryEntry {
  id: string;
  timestamp: number;
  mapId: string;
  mapName: string;
  mode: MmModeId;
  victory: boolean;
  kills: number;
  deaths: number;
  assists: number;
  scoreBlue: number;
  scoreRed: number;
  waveReached?: number;
  isMvp: boolean;
  xpEarned: number;
  coinsEarned: number;
}

export interface MmHudControlLayout {
  id: string;
  label: string;
  xPct: number;
  yPct: number;
  scale: number; // 0.5 .. 1.8
  opacity: number; // 0 .. 1.0
}

export interface MmSettingsState {
  controls: {
    controlScheme: 'dual_stick' | 'separate_fire';
    joystickAnchor: 'floating' | 'fixed';
    moveSensitivity: number; // 0.5 .. 2.0
    aimSensitivity: number; // 0.5 .. 2.0
    fireRingThreshold: number; // 55 .. 90
    aimAssist: 'off' | 'low' | 'high';
    crosshairStyle: 'laser_dot' | 'dynamic' | 'minimal';
    weaponLookAhead: number; // 0 .. 100
    autoReload: boolean;
    combatRollMode: 'double_down' | 'off' | 'button';
    leftHanded: boolean;
  };
  video: {
    mmcEnhanced: boolean;
    hitEffects: 'red' | 'confetti' | 'off';
    screenShake: boolean;
    targetFps: 30 | 60 | 120;
    showFpsPing: boolean;
    showNametags: boolean;
  };
  audio: {
    master: number;
    sfx: number;
    music: number;
    voice: number;
    muted: boolean;
  };
  gameplay: {
    region: 'auto' | 'asia' | 'europe' | 'na' | 'sa';
    classicV4Default: boolean;
    unarmedZoom: boolean;
    autoPickupItems: boolean;
    showOffscreenArrows: boolean;
  };
}

export interface MmFriendEntry {
  id: string;
  callsign: string;
  clanTag: string;
  rankIndex: number;
  online: boolean;
  inSquad: boolean;
}

export interface MiniMilitiaSave {
  version: number;
  callsign: string;
  clanTag: string;
  playerId: string;
  xp: number;
  coins: number;
  cash: number;
  proPackUnlocked: boolean;
  preferredTeam: 'auto' | 'blue' | 'red';
  activeAvatarPreset: number;
  avatarPresets: MmAvatarConfig[];
  activeLoadoutId: string;
  customLoadouts: MmLoadoutDef[];
  unlockedLoadoutIds: string[];
  unlockedCosmeticIds: string[];
  unlockedWeaponSkins: Record<string, string>;
  stats: {
    matches: number;
    wins: number;
    kills: number;
    deaths: number;
    assists: number;
    headshots: number;
    meleeKills: number;
    grenadeKills: number;
    dualWieldKills: number;
    sniperHeadshots: number;
    macheteKills: number;
    smawKills: number;
    flameKills: number;
    sawKills: number;
    flagCaptures: number;
    bombActions: number;
    suicides: number;
    bestKillstreak: number;
    bestMultiKill: number;
    survivalBestWave: number;
    survivalBestTimeSec: number;
    bootcampCompleted: boolean;
  };
  weaponMastery: Record<string, MmWeaponMasteryStat>;
  matchHistory: MmMatchHistoryEntry[];
  claimedAchievements: string[];
  friends: MmFriendEntry[];
  settings: MmSettingsState;
  customHud: Record<string, MmHudControlLayout>;
}

export interface MmRoomBotSlot {
  id: string;
  name: string;
  team: 'blue' | 'red';
  isPlayer: boolean;
  ready: boolean;
  avatar: MmAvatarConfig;
  weaponId?: string;
}

export interface MmMatchConfig {
  mode: MmModeId;
  mapId: string;
  timeLimitSec: number;
  scoreLimit: number;
  botDifficulty: MmBotDifficulty;
  classicV4: boolean;
  mapDrops: boolean;
  friendlyFire: boolean;
  gravityMode: 'normal' | 'low' | 'heavy';
  nitroMode: '1x' | '2x' | 'unlimited';
  roomName?: string;
  password?: string;
  coopAllies?: number;
  slots: MmRoomBotSlot[];
}

export interface MmKillFeedItem {
  id: number;
  killer: string;
  killerTeam: MmTeam;
  victim: string;
  victimTeam: MmTeam;
  weaponName: string;
  headshot: boolean;
  melee: boolean;
  ttl: number;
}

export interface MmScoreboardRow {
  id: string;
  name: string;
  team: MmTeam;
  isPlayer: boolean;
  kills: number;
  deaths: number;
  assists: number;
  captures: number;
  pingMs: number;
  alive: boolean;
  isMvp: boolean;
}

export interface MmNearbyPickupHud {
  id: string;
  weaponId: string;
  weaponName: string;
  canDualWield: boolean;
}

export interface MiniMilitiaHudSnapshot {
  mode: MmModeId;
  mapId: string;
  mapName: string;
  classicV4: boolean;
  timeRemainingSec: number;
  scoreBlue: number;
  scoreRed: number;
  scoreLimit: number;
  ffaRank: number;
  ffaLeaderKills: number;
  survivalWave: number;
  survivalEnemiesAlive: number;
  ptbRound: number;
  ptbBlueRounds: number;
  ptbRedRounds: number;
  ptbBombState: 'carried' | 'planted' | 'defused' | 'exploded';
  ptbBombTimer: number;
  ptbBombSite: 'A' | 'B' | null;
  ptbCanPlantOrDefuse: 'plant' | 'defuse' | null;
  ptbActionProgress: number;
  bootcampStep: number;
  bootcampPrompt: string;
  bootcampDone: boolean;
  fps: number;
  pingMs: number;
  player: {
    alive: boolean;
    respawnSec: number;
    hp: number;
    maxHp: number;
    jetFuel: number;
    maxJetFuel: number;
    empDisabledSec: number;
    boostTimer: number;
    crouching: boolean;
    stealthHidden: boolean;
    carryingFlag: boolean;
    team: MmTeam;
    kills: number;
    deaths: number;
    assists: number;
    streak: number;
    activeWeaponId: string;
    activeWeaponName: string;
    offhandWeaponId: string | null;
    offhandWeaponName: string | null;
    holsteredWeaponId: string | null;
    holsteredWeaponName: string | null;
    mag: number;
    magMax: number;
    reserve: number;
    offhandMag: number;
    offhandMagMax: number;
    reloading: boolean;
    reloadProgress: number;
    spinUpProgress: number;
    grenadeType: MmGrenadeId;
    grenades: Record<MmGrenadeId, number>;
    zoomLevel: number;
    zoomMax: number;
    coins: number;
    activeLoadoutId: string;
  };
  nearbyPickup: MmNearbyPickupHud | null;
  killFeed: MmKillFeedItem[];
  banner: { text: string; sub: string; color: string; ttl: number } | null;
  scoreboard: MmScoreboardRow[];
  matchEnded: boolean;
  matchResult: MmMatchSummary | null;
}

export interface MmMatchSummary {
  victory: boolean;
  mode: MmModeId;
  mapId: string;
  mapName: string;
  scoreBlue: number;
  scoreRed: number;
  playerKills: number;
  playerDeaths: number;
  playerAssists: number;
  headshots: number;
  meleeKills: number;
  grenadeKills: number;
  dualWieldKills: number;
  sniperHeadshots: number;
  macheteKills: number;
  smawKills: number;
  flameKills: number;
  sawKills: number;
  flagCaptures: number;
  bombActions: number;
  suicides: number;
  bestStreak: number;
  bestMultiKill: number;
  waveReached: number;
  durationSec: number;
  isMvp: boolean;
  xpEarned: number;
  coinsEarned: number;
  cashEarned: number;
  weaponDeltas: Record<string, MmWeaponMasteryStat>;
  scoreboard: MmScoreboardRow[];
}
