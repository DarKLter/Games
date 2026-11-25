export type MlbbScreen =
  | 'lobby'
  | 'prematch'
  | 'draft'
  | 'loading'
  | 'battle'
  | 'livestream'
  | 'postmatch';

export type MlbbRole = 'Tank' | 'Fighter' | 'Assassin' | 'Mage' | 'Marksman' | 'Support';
export type MlbbLane = 'EXP' | 'Jungle' | 'Mid' | 'Gold' | 'Roam';
export type MlbbModeId = 'ranked' | 'classic' | 'brawl' | 'arcade' | 'vs_ai' | 'practice';
export type MlbbMapThemeId =
  | 'imperial_sanctuary'
  | 'western_expanse'
  | 'celestial_palace'
  | 'sanctum_island'
  | 'harmonic_sanctuary';
export type MlbbMapVariantId =
  | 'dangerous_grass'
  | 'broken_walls'
  | 'flying_cloud'
  | 'expanding_rivers'
  | 'revealing_wisps'
  | 'healing_turtle'
  | 'golden_turret';

export type MlbbDamageType = 'physical' | 'magic' | 'true';
export type MlbbCcType =
  | 'slow'
  | 'grounded'
  | 'root'
  | 'silence'
  | 'disarm'
  | 'stun'
  | 'freeze'
  | 'petrify'
  | 'taunt'
  | 'transform'
  | 'airborne'
  | 'knockback'
  | 'pull'
  | 'vortex'
  | 'suppression';

export type MlbbElementKind =
  | 'fire'
  | 'ice'
  | 'lightning'
  | 'shadow'
  | 'holy'
  | 'water'
  | 'wind'
  | 'blood'
  | 'astral';

export type MlbbSkillPhysicsKind =
  | 'blink'
  | 'dash'
  | 'leap'
  | 'boomerang'
  | 'displacement'
  | 'channel'
  | 'projectile'
  | 'iframe'
  | 'buff'
  | 'aoe'
  | 'tether'
  | 'snapback'
  | 'terrain'
  | 'attach';

export type MlbbTelegraphShape = 'line' | 'circle' | 'cone' | 'ring' | 'self' | 'ally';

export interface MlbbSkillDef {
  slot: 1 | 2 | 3;
  name: string;
  icon: string;
  desc: string;
  manaCost: number;
  cooldown: number[];
  baseDmg: number[];
  physScale: number;
  magicScale: number;
  damageType: MlbbDamageType;
  range: number;
  radius: number;
  telegraph: MlbbTelegraphShape;
  physics: MlbbSkillPhysicsKind;
  color: string;
  foreswing: number;
  backswing: number;
  ccType?: MlbbCcType;
  ccDuration?: number;
  wallCross?: boolean;
}

export interface MlbbHeroDef {
  id: string;
  name: string;
  title: string;
  role: MlbbRole;
  secondaryRole?: MlbbRole;
  lane: MlbbLane;
  specialty: string;
  costBp: number;
  costDiamonds: number;
  starter?: boolean;
  primaryColor: string;
  accentColor: string;
  weaponIcon: string;
  resource: 'mana' | 'energy' | 'none';
  attackRange: number;
  isRanged: boolean;
  baseHp: number;
  hpGrowth: number;
  baseMana: number;
  manaGrowth: number;
  basePhysAtk: number;
  physAtkGrowth: number;
  baseMagicPow: number;
  basePhysDef: number;
  physDefGrowth: number;
  baseMagicDef: number;
  magicDefGrowth: number;
  baseMoveSpd: number;
  baseAtkSpd: number;
  ratings: { durability: number; offense: number; control: number; difficulty: number };
  passiveName: string;
  passiveDesc: string;
  skills: [MlbbSkillDef, MlbbSkillDef, MlbbSkillDef];
  recommendedBuild: string[];
  skins: { id: string; name: string; tag: string; color: string; accent: string; costDiamonds: number }[];
}

export type MlbbItemCategory =
  | 'attack'
  | 'magic'
  | 'defense'
  | 'movement'
  | 'jungling'
  | 'roaming'
  | 'consumable'
  | 'unique';

export interface MlbbItemStats {
  physAtk?: number;
  magicPow?: number;
  adaptiveAtk?: number;
  maxHp?: number;
  maxMana?: number;
  manaRegen?: number;
  physDef?: number;
  magicDef?: number;
  moveSpd?: number;
  moveSpdPct?: number;
  atkSpdPct?: number;
  critChance?: number;
  critDmgPct?: number;
  cdrPct?: number;
  lifestealPct?: number;
  spellVampPct?: number;
  flatPhysPen?: number;
  pctPhysPen?: number;
  flatMagicPen?: number;
  pctMagicPen?: number;
  ccResPct?: number;
  hpRegen?: number;
  healEffectPct?: number;
}

export interface MlbbItemDef {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  category: MlbbItemCategory;
  tier: 1 | 2 | 3;
  cost: number;
  recipe: string[];
  stats: MlbbItemStats;
  passiveName?: string;
  passiveDesc?: string;
  uniquePassives?: string[];
  activeName?: string;
  activeCd?: number;
  activeKind?: 'wind_chant' | 'winter_crown' | 'conceal';
  blessingKind?: 'jungle' | 'roam';
  consumableDurationSec?: number;
  heroExclusive?: string;
  antiHeal?: boolean;
  execute?: boolean;
  revive?: boolean;
  reflect?: boolean;
}

export type MlbbEmblemId = 'common' | 'tank' | 'assassin' | 'mage' | 'fighter' | 'support' | 'marksman';

export interface MlbbEmblemDef {
  id: MlbbEmblemId;
  name: string;
  icon: string;
  color: string;
  stats: MlbbItemStats;
  desc: string;
}

export interface MlbbTalentDef {
  id: string;
  tier: 1 | 2 | 3;
  name: string;
  icon: string;
  desc: string;
  stats?: MlbbItemStats;
}

export type MlbbSpellId =
  | 'flicker'
  | 'retribution'
  | 'execute'
  | 'inspire'
  | 'sprint'
  | 'purify'
  | 'vengeance'
  | 'aegis'
  | 'revitalize'
  | 'petrify'
  | 'flameshot'
  | 'arrival';

export interface MlbbBattleSpellDef {
  id: MlbbSpellId;
  name: string;
  icon: string;
  cooldown: number;
  color: string;
  desc: string;
  range: number;
}

export interface MlbbEmoteDef {
  id: string;
  name: string;
  callout: string;
  icon: string;
  color: string;
  rarity: 'Starter' | 'Rare' | 'Epic';
  costTickets: number;
  costBp: number;
  sfx: 'chime' | 'horn' | 'spark' | 'laugh';
}

export interface MlbbUiControlLayout {
  id: string;
  label: string;
  xPct: number;
  yPct: number;
  scale: number; // 0.5 - 1.5
  opacity: number; // 0.2 - 1.0
}

export type MlbbAiDifficulty = 'warrior' | 'epic' | 'mythic';

export interface MlbbSettingsState {
  basics: {
    outline: boolean;
    screenShake: boolean;
    cameraHeight: 'low' | 'high';
    shadows: boolean;
    creepHpNumbers: boolean;
    damageText: boolean;
    colorblind: 'off' | 'deuteranopia' | 'protanopia' | 'tritanopia';
    refreshRate: 30 | 60 | 90 | 120;
    graphicsQuality: 'smooth' | 'medium' | 'high' | 'ultra';
    hdMode: boolean;
    mapTheme: MlbbMapThemeId;
  };
  controls: {
    targetingMethod: 'standard' | 'advanced';
    targetingPriority: 'lowest_hp' | 'lowest_pct' | 'closest';
    heroLockMode: boolean;
    skillSmartTargeting: boolean;
    basicSmartTargeting: boolean;
    attackAssist?: boolean;
    aimPanning: boolean;
    joystickPosition: 'fixed' | 'floating';
    skillCancelMethod?: 'drag_to_x' | 'drag_distance';
    cameraPanSensitivity: number; // 10..100
    autoLevelUp: boolean;
    autoBuy: boolean;
    aiDifficulty?: MlbbAiDifficulty;
  };
  interface: {
    battlefieldUiOpacity: number; // 0..100
    activeSkillPreset: '3skill' | '4skill';
    editorSnapToGrid?: boolean;
    customUi3Skill: Record<string, MlbbUiControlLayout>;
    customUi4Skill: Record<string, MlbbUiControlLayout>;
  };
  sound: {
    master: number;
    sfx: number;
    bgm: number;
    voice: number;
    mic: number;
    language: 'English' | 'Japanese' | 'Indonesian' | 'Tagalog';
    killAnnouncer: boolean;
  };
  network: {
    speedMode: boolean;
    networkBoost: boolean;
    showPingFps: boolean;
  };
  privacy: {
    hideMatchHistory: boolean;
    hideFavoriteHeroes: boolean;
    hideOnlineStatus: boolean;
    hideRegion: boolean;
    blockNonFriendInvites: boolean;
  };
  resources: {
    hdVfxPack: boolean;
    hdAudioPack: boolean;
  };
}

export interface MlbbMatchPlayerSummary {
  id: string;
  name: string;
  team: 'blue' | 'red';
  heroId: string;
  heroName: string;
  role: MlbbRole;
  lane: MlbbLane;
  isPlayer: boolean;
  level: number;
  kills: number;
  deaths: number;
  assists: number;
  gold: number;
  items: string[];
  spellId: MlbbSpellId;
  emblemId: MlbbEmblemId;
  coreTalentId: string;
  damageDealt: number;
  damageTaken: number;
  turretDamage: number;
  teamfightPct: number;
  rating: number;
  medal: 'MVP' | 'Gold' | 'Silver' | 'Bronze';
  isMvp: boolean;
}

export interface MlbbMatchRecord {
  id: string;
  timestamp: number;
  mode: MlbbModeId;
  victory: boolean;
  durationSec: number;
  blueKills: number;
  redKills: number;
  playerHeroId: string;
  playerHeroName: string;
  kda: [number, number, number];
  rating: number;
  medal: 'MVP' | 'Gold' | 'Silver' | 'Bronze';
  items: string[];
  players: MlbbMatchPlayerSummary[];
}

export interface MlbbProfileSave {
  version: number;
  accountId: string;
  serverId: string;
  name: string;
  avatar: string;
  border: string;
  countryFlag: string;
  gender: 'Unspecified' | 'Male' | 'Female';
  bio: string;
  battleTitle: string;
  level: number;
  exp: number;
  rankTierIdx: number; // 0 Warrior .. 9 Mythical Immortal
  rankStars: number;
  starProtectionPts: number;
  bp: number;
  tickets: number;
  diamonds: number;
  fragments: number;
  charisma: number;
  creditScore: number;
  dailyActivity: number; // 0..800
  claimedDailyMilestones: number[];
  dailyTasksDone: string[];
  weeklyActivity: number;
  claimedActivityMilestones: number[];
  starlightLevel: number;
  starlightXp: number;
  claimedStarlightLevels: number[];
  claimedMailIds: string[];
  claimedAchievementIds: string[];
  claimedMasteryChapters: Record<string, number[]>;
  ownedHeroIds: string[];
  ownedSkins: Record<string, string[]>;
  equippedSkins: Record<string, string>;
  showcaseHeroId: string;
  selectedHeroId: string;
  selectedLane: MlbbLane;
  selectedMode: MlbbModeId;
  selectedMapVariant: MlbbMapVariantId | 'random';
  selectedSpellId: MlbbSpellId;
  selectedEmblemId: MlbbEmblemId;
  emblemTalents: Record<MlbbEmblemId, { t1: string; t2: string; t3: string }>;
  savedBuilds: Record<string, [string[], string[], string[]]>;
  activeBuildSlot: Record<string, 0 | 1 | 2>;
  quickChatIds: string[];
  ownedEmotes: string[];
  equippedEmotes: [string, string, string, string];
  ownedEffects: { recall: string[]; spawn: string[]; elim: string[]; killNotif: string[] };
  equippedEffects: { recall: string; spawn: string; elim: string; killNotif: string };
  backpack: {
    trialCards: number;
    doubleBpCards: number;
    doubleExpCards: number;
    starProtectionCards: number;
    starRaisingCards: number;
    chests: number;
  };
  squad: { name: string; tag: string; slogan: string; activity?: number; rank?: string };
  matchHistory: MlbbMatchRecord[];
  heroStats: Record<string, { matches: number; wins: number; mmr: number; mastery: number }>;
  likesReceived: { id: string; from: string; hero: string; likedBack: boolean }[];
  namecardLikes: number;
  namecardSuperLikes: number;
  activeIdCard: 'mythic_medal' | 'collector' | 'achievement_hall' | 'season_info';
  selectedServerRegion: string;
  boundAccounts: { moonton: boolean; google: boolean; apple: boolean; facebook: boolean };
  affinityLinks: {
    id: string;
    name: string;
    role: 'Partner' | 'Bro' | 'Bestie' | 'Confidant';
    level: number;
    pts: number;
    heroId: string;
  }[];
  photoAlbum: { id: string; caption: string; heroId: string; date: string; likes: number }[];
  esportsPredictions: Record<string, string>;
  arcadeSubMode?: 'mayhem' | 'overdrive';
  customSubMode?: '5v5' | '1v1_mid' | 'practice';
  secondaryPasswordEnabled: boolean;
  settings: MlbbSettingsState;
}

export interface MlbbActiveBuffHud {
  id: string;
  label: string;
  icon: string;
  remaining: number;
  max: number;
  color: string;
}

export interface MlbbHudHeroLockTarget {
  id: string;
  heroId: string;
  name: string;
  color: string;
  hpPct: number;
  dist: number;
}

export interface MlbbHudTeammate {
  id: string;
  heroId: string;
  name: string;
  color: string;
  hpPct: number;
  alive: boolean;
  respawnSec: number;
  ultReady: boolean;
}

export interface MlbbHudSkillSlot {
  slot: 1 | 2 | 3 | 4;
  name: string;
  icon: string;
  color: string;
  level: number;
  maxLevel: number;
  canUpgrade: boolean;
  cd: number;
  maxCd: number;
  manaCost: number;
  hasMana: boolean;
  telegraph: MlbbTelegraphShape;
  range: number;
  radius: number;
  recastActive?: boolean;
}

export type MlbbPingKind = 'attack' | 'retreat' | 'gather' | 'missing' | 'omw' | 'status';

export interface MlbbTacticalPing {
  id: number;
  x: number;
  y: number;
  kind: MlbbPingKind;
  color: string;
  icon: string;
  label: string;
  sender: string;
  team: 'blue' | 'red';
  targetHeroId?: string;
  targetType?: 'hero' | 'turret' | 'turtle' | 'lord' | 'bush' | 'lane' | 'route';
  routePoints?: { x: number; y: number }[];
  ttl: number;
  maxTtl: number;
}

export interface MlbbFogGhost {
  heroId: string;
  name: string;
  team: 'blue' | 'red';
  x: number;
  y: number;
  color: string;
  ttl: number;
  maxTtl: number;
}

export interface MlbbDeathRecapEntry {
  attackerId: string;
  attackerName: string;
  heroId: string;
  totalDamage: number;
  sharePct: number;
  physical: number;
  magic: number;
  trueDmg: number;
  topSkills: { name: string; damage: number }[];
}

export interface MlbbCcRecapEntry {
  ccType: MlbbCcType;
  durationSec: number;
  count: number;
}

export interface MlbbDeathRecap {
  killerName: string;
  killerHeroId: string;
  deathTimeSec: number;
  totalDamage: number;
  physicalTotal: number;
  magicTotal: number;
  trueTotal: number;
  physicalPct: number;
  magicPct: number;
  truePct: number;
  totalCcSec: number;
  ccBreakdown: MlbbCcRecapEntry[];
  contributors: MlbbDeathRecapEntry[];
}

export interface MlbbTrackedEnemySpell {
  heroId: string;
  heroName: string;
  spellId: MlbbSpellId;
  spellName: string;
  spellIcon: string;
  remainingSec: number;
  maxSec: number;
}

export interface MlbbHudSnapshot {
  matchTimeSec: number;
  mode: MlbbModeId;
  mapVariant: MlbbMapVariantId;
  expLane: 'top' | 'bot';
  goldLane: 'top' | 'bot';
  blueKills: number;
  redKills: number;
  fps: number;
  pingMs: number;
  player: {
    id: string;
    heroId: string;
    name: string;
    x: number;
    y: number;
    passiveName: string;
    level: number;
    xpPct: number;
    skillPoints: number;
    hp: number;
    maxHp: number;
    shield: number;
    mana: number;
    maxMana: number;
    resource: 'mana' | 'energy' | 'none';
    gold: number;
    totalGold: number;
    kills: number;
    deaths: number;
    assists: number;
    alive: boolean;
    respawnSec: number;
    inBush: boolean;
    spottedByEnemy: boolean;
    recalling: boolean;
    recallProg: number;
    regening: boolean;
    items: string[];
    blessingId: string | null;
    prioritizedItemId: string | null;
    activeBuildIdx: 0 | 1 | 2;
    junglerStacks: number;
    roamGold: number;
    isJungler: boolean;
    isRoamer: boolean;
    passiveStacks: number;
    ccText: string;
    nearFlyingCloud: boolean;
    flyingCloudReady: boolean;
    turretAlert: 'none' | 'safe' | 'warn' | 'locked';
    deathRecap: MlbbDeathRecap | null;
    stats: {
      physAtk: number;
      magicPow: number;
      physDef: number;
      magicDef: number;
      flatPhysPen: number;
      pctPhysPen: number;
      flatMagicPen: number;
      pctMagicPen: number;
      atkSpd: number;
      critChance: number;
      cdrPct: number;
      moveSpd: number;
      lifestealPct: number;
      spellVampPct: number;
    };
  };
  skills: [MlbbHudSkillSlot, MlbbHudSkillSlot, MlbbHudSkillSlot];
  extraSkill4?: MlbbHudSkillSlot | null;
  spell: {
    id: MlbbSpellId;
    name: string;
    icon: string;
    color: string;
    cd: number;
    maxCd: number;
  };
  recallCd: number;
  regenCd: number;
  activeItem: {
    id: string;
    name: string;
    icon: string;
    cd: number;
    maxCd: number;
  } | null;
  emoteCd: number;
  activeBuffs: MlbbActiveBuffHud[];
  teammates: MlbbHudTeammate[];
  nearbyEnemies: MlbbHudHeroLockTarget[];
  lockedTargetId: string | null;
  spectateTargetId: string | null;
  cameraFreePanActive: boolean;
  isSpectator?: boolean;
  autoDirectorActive?: boolean;
  playbackSpeed?: number;
  paused?: boolean;
  rendererMode?: '3d' | '2d';
  pingFeed: { id: number; kind: MlbbPingKind; icon: string; color: string; text: string }[];
  announcer: {
    text: string;
    sub: string;
    color: string;
    ttl: number;
  } | null;
  objectiveBanner: string | null;
  chatFeed: { id: number; sender: string; team: 'blue' | 'red' | 'sys'; text: string }[];
  scoreboard: MlbbMatchPlayerSummary[];
  trackedEnemySpells: MlbbTrackedEnemySpell[];
  surrenderAvailable: boolean;
  surrenderVote: {
    active: boolean;
    yes: number;
    no: number;
    slots: ('yes' | 'no' | 'pending')[];
    remainingSec: number;
    status: 'voting' | 'passed' | 'failed';
  } | null;
  practiceCheats: {
    noCooldown: boolean;
    godMode: boolean;
    turretsInvincible?: boolean;
    dummyAlive: boolean;
    dummyDps?: number;
    dummyLastHit?: number;
    dummyTotalDmg?: number;
    dummyPeakBurst?: number;
  };
  angelaAttachChoices: { id: string; name: string; hpPct: number; color: string }[];
}

export interface MlbbMatchLaunchConfig {
  mode: MlbbModeId;
  playerHeroId: string;
  playerSkinId: string;
  playerLane: MlbbLane;
  playerSpellId: MlbbSpellId;
  playerEmblemId: MlbbEmblemId;
  playerTalents: { t1: string; t2: string; t3: string };
  playerBuild: string[];
  mapTheme: MlbbMapThemeId;
  mapVariant: MlbbMapVariantId;
  isSpectator?: boolean;
  customSubMode?: '5v5' | '1v1_mid' | 'practice';
  blueTeam: { heroId: string; lane: MlbbLane; name: string; isPlayer: boolean; spellId: MlbbSpellId; emblemId: MlbbEmblemId }[];
  redTeam: { heroId: string; lane: MlbbLane; name: string; isPlayer: boolean; spellId: MlbbSpellId; emblemId: MlbbEmblemId }[];
}
