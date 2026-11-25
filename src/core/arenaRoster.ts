export {
  MOBA_DAILY_MISSIONS,
  MOBA_ELEMENT_PALETTES,
  MOBA_EMBLEMS,
  MOBA_HEROES,
  MOBA_MODES,
  MOBA_QUESTS,
  MOBA_RANKS,
  MOBA_ROLES,
  computeMobaLeaderboard,
  detectCooldownReadySlots,
  formatDailyCountdown,
  getEmblemUpgradeCost,
  getHeroBaseElementTheme,
  getHeroCombatKit,
  getLocalDateKey,
  getMillisUntilMidnight,
  getMobaDailyMissionValue,
  getMobaEmblemBonus,
  getMobaQuestValue,
  getMobaRankTitle,
  resolveElementStatusEffect,
  resolveSkillAimPoint,
  stepHealthTrail,
  triggerHealthTrailDamage
} from '../games/legends-arena/mobaHeroCatalog';
export type {
  MobaArchetype,
  MobaCcKind,
  MobaDailyMissionDef,
  MobaDailyMissionStat,
  MobaElementProjectileKind,
  MobaElementStatusKind,
  MobaElementTheme,
  MobaElementVisualDef,
  MobaEmblemDef,
  MobaHeroCombatKit,
  MobaHeroDef,
  MobaIconicUltKind,
  MobaLane,
  MobaLeaderboardRow,
  MobaModeDef,
  MobaModeId,
  MobaPassiveKind,
  MobaQuestDef,
  MobaRole,
  MobaSkillActionKind,
  MobaSkillDetail,
  MobaSkillEffectSpec,
  MobaSkillMoveKind,
  MobaSkillTargeting,
  MobaVfxKind,
  MobaWeaponKind
} from '../games/legends-arena/mobaHeroCatalog';
export {
  ALL_MOBA_TALENTS,
  DEFAULT_EMBLEM_TALENTS,
  DEFAULT_MOBA_SETTINGS,
  DEFAULT_STARTER_EMOTE_IDS,
  MOBA_ACHIEVEMENTS,
  MOBA_COLLECTOR_TIERS,
  MOBA_ELIM_EFFECTS,
  MOBA_EMOTES,
  MOBA_LUCKY_SPIN_POOL,
  MOBA_RECALL_EFFECTS,
  MOBA_SKIN_VARIANTS,
  MOBA_STARLIGHT_TRACK,
  MOBA_TALENTS_T1,
  MOBA_TALENTS_T2,
  MOBA_TALENTS_T3,
  computeCollectorTier,
  equipEmoteToSlot,
  getHeroMasteryTitle,
  getMobaEmoteById,
  getSkinVariantById,
  getTalentById,
  normalizeEquippedEmotes,
  pickContextualAiEmote
} from '../games/legends-arena/mobaSystemsCatalog';
export type {
  MobaAchievementDef,
  MobaBackpackState,
  MobaCollectorTier,
  MobaCosmeticEffectDef,
  MobaEmblemId,
  MobaEmblemTalentLoadout,
  MobaEmoteAiContext,
  MobaEmoteCategory,
  MobaEmoteDef,
  MobaEmoteRarity,
  MobaHeroMasteryEntry,
  MobaLuckySpinReward,
  MobaMatchRecord,
  MobaSettings,
  MobaSkinVariant,
  MobaSquadState,
  MobaStarlightReward,
  MobaTalentDef
} from '../games/legends-arena/mobaSystemsCatalog';
export {
  ALL_MOBA_SHOP_ITEMS,
  MOBA_BASIC_ITEMS,
  MOBA_BOOT_BLESSINGS,
  MOBA_EQUIPMENT_ITEMS,
  MOBA_INTERMEDIATE_ITEMS,
  MOBA_ITEM_RECIPES,
  ROLE_BUILD_PRESETS,
  ROLE_RECOMMENDED_BUILDS,
  applyCraftedPurchase,
  computeEffectiveItemCost,
  computeMobaEquippedStats,
  computeSellRefund,
  getItemRecipe,
  getMobaBlessingById,
  getMobaEquipmentById,
  getNextQuickBuyRecommendation,
  getQuickBuyPair
} from '../games/legends-arena/mobaEquipmentCatalog';
export type {
  ComputedMobaStats,
  CraftedCostBreakdown,
  CraftedPurchaseResult,
  MobaActiveSkillId,
  MobaBlessingKind,
  MobaBootBlessing,
  MobaBuildPreset,
  MobaEquipCategory,
  MobaEquipTier,
  MobaEquipmentCategory,
  MobaEquipStats,
  MobaEquipmentItem,
  MobaQuickBuyRec
} from '../games/legends-arena/mobaEquipmentCatalog';
export {
  CYCLONE_EYE_SPECS,
  FLYING_CLOUD_BLUE_SPOT,
  LITHO_LOWER_SPOT,
  LITHO_UPPER_SPOT,
  LOWER_RIVER_PIT,
  MLBB_TIMERS,
  MOBA_MAP_VARIANTS,
  UPPER_RIVER_PIT,
  canRespawnNextTurtle,
  computeEvolvedLordNeutralDr,
  computeEvolvedLordSummonedDr,
  computeOrangeBuffPenetrationPct,
  computeRetributionDamage,
  computeTurtleRewards,
  createDynamicLaneAssignment,
  evaluateBattlefieldClock,
  formatMatchClock,
  getMapVariantDef,
  resolveMatchMapVariant,
  selectLordWeakestLane,
  shouldTurtleDissipate
} from '../games/legends-arena/mobaBattlefield';
export type {
  BattlefieldClockSnapshot,
  CycloneEyeSpec,
  DynamicLaneAssignment,
  LordStage,
  MobaMapVariantDef,
  MobaMapVariantId,
  MobaMapVariantSetting,
  RiverPitSide,
  TurtleRewardPayload
} from '../games/legends-arena/mobaBattlefield';
export {
  NARUTO_FACTIONS,
  NARUTO_MODES,
  NARUTO_SHINOBI_ROSTER,
  NARUTO_STAGES,
  SENKI_RAMEN_ITEMS,
  STORM_NINJA_TOOLS,
  STORM_SUPPORT_TYPE_DEFS,
  computeSenkiLevelStats,
  computeStormComboProration,
  computeStormMaxUsableChakra,
  getNarutoShinobiById,
  resolveNarutoTeamSynergy,
  selectSenkiTowerTarget,
  stepSubstitutionGauge
} from '../games/naruto-senki-storm/narutoCatalog';
export type {
  NarutoFaction,
  NarutoModeDef,
  NarutoModeId,
  NarutoShinobiDef,
  NarutoSkillDef,
  NarutoStageDef,
  NarutoStageId,
  NarutoWeaponKind,
  SenkiInnateTraitKind,
  SenkiRamenShopItem,
  SenkiSkillActionKind,
  SenkiSkillSpec,
  SenkiTargetCandidate,
  StormNinjaToolDef,
  StormSupportType,
  TeamSynergyResult
} from '../games/naruto-senki-storm/narutoCatalog';
export * from '../games/hoops-2k26/hoops2k26Catalog';

export type MobaSpellId =
  | 'execute'
  | 'retribution'
  | 'inspire'
  | 'sprint'
  | 'revitalize'
  | 'aegis'
  | 'petrify'
  | 'purify'
  | 'flameshot'
  | 'flicker'
  | 'arrival'
  | 'vengeance';

export interface MobaSpellDef {
  id: MobaSpellId;
  name: string;
  icon: string;
  cooldownSec: number;
  colorHex: string;
  colorNum: number;
  summary: string;
}

export const MOBA_SPELLS: MobaSpellDef[] = [
  {
    id: 'execute',
    name: 'Execute',
    icon: '💀',
    cooldownSec: 11,
    colorHex: '#f43f5e',
    colorNum: 0xf43f5e,
    summary: 'True Damage finisher (16% lost HP); -40% CD on kill'
  },
  {
    id: 'retribution',
    name: 'Retribution',
    icon: '🩸',
    cooldownSec: 10,
    colorHex: '#ef4444',
    colorNum: 0xef4444,
    summary: 'Massive True Damage smite to jungle, Turtle & Lord'
  },
  {
    id: 'inspire',
    name: 'Inspire',
    icon: '🔥',
    cooldownSec: 12,
    colorHex: '#f97316',
    colorNum: 0xf97316,
    summary: '+55% ATK Speed, armor pierce & lifesteal for 5s'
  },
  {
    id: 'sprint',
    name: 'Sprint',
    icon: '💨',
    cooldownSec: 12,
    colorHex: '#38bdf8',
    colorNum: 0x38bdf8,
    summary: '+50% Move Speed & Slow Immunity for 6s'
  },
  {
    id: 'revitalize',
    name: 'Revitalize',
    icon: '💚',
    cooldownSec: 14,
    colorHex: '#22c55e',
    colorNum: 0x22c55e,
    summary: 'Summons 5s Healing Spring restoring team HP & +25% heals'
  },
  {
    id: 'aegis',
    name: 'Aegis',
    icon: '🛡️',
    cooldownSec: 13,
    colorHex: '#fbbf24',
    colorNum: 0xfbbf24,
    summary: 'Grants heavy damage-absorbing Shield for 5s'
  },
  {
    id: 'petrify',
    name: 'Petrify',
    icon: '🪨',
    cooldownSec: 13,
    colorHex: '#a8a29e',
    colorNum: 0xa8a29e,
    summary: 'Deals Magic Damage & petrifies nearby foes (0.8s stun)'
  },
  {
    id: 'purify',
    name: 'Purify',
    icon: '✨',
    cooldownSec: 13,
    colorHex: '#e0f2fe',
    colorNum: 0xe0f2fe,
    summary: 'Cleanses all CC + 1.2s CC Immunity & +15% Move Speed'
  },
  {
    id: 'flameshot',
    name: 'Flameshot',
    icon: '☄️',
    cooldownSec: 11,
    colorHex: '#fb923c',
    colorNum: 0xfb923c,
    summary: 'Global fire bolt; knocks back close foes & scales with range'
  },
  {
    id: 'flicker',
    name: 'Flicker',
    icon: '⚡',
    cooldownSec: 10,
    colorHex: '#60a5fa',
    colorNum: 0x60a5fa,
    summary: 'Instant directional blink + bonus Hybrid Defense & haste'
  },
  {
    id: 'arrival',
    name: 'Arrival',
    icon: '🌀',
    cooldownSec: 15,
    colorHex: '#c084fc',
    colorNum: 0xc084fc,
    summary: 'Teleports to friendly turret/minion + 60% Move Speed burst'
  },
  {
    id: 'vengeance',
    name: 'Vengeance',
    icon: '⚜️',
    cooldownSec: 12,
    colorHex: '#facc15',
    colorNum: 0xfacc15,
    summary: '35% Damage Reduction + reflects 35% Magic Damage for 3.5s'
  }
];

export type BrWeaponId = 'm416' | 'ump45' | 'shotgun' | 'awm';
export type BrModeId = 'solo' | 'squad';
export type BrMapId = 'erangel' | 'sanhok';

export interface BrWeaponDef {
  id: BrWeaponId;
  slot: 1 | 2 | 3 | 4;
  name: string;
  shortName: string;
  category: string;
  icon: string;
  dmg: number;
  fireCd: number;
  magSize: number;
  reloadSec: number;
  pellets: number;
  spread: number;
  bulletSpeed: number;
  rangeLife: number;
  scopeFov: number;
  accentHex: string;
}

export const BR_WEAPONS: BrWeaponDef[] = [
  {
    id: 'm416',
    slot: 1,
    name: 'M416 Rifle',
    shortName: 'M416',
    category: '5.56 AR',
    icon: '🔫',
    dmg: 28,
    fireCd: 0.12,
    magSize: 30,
    reloadSec: 1.15,
    pellets: 1,
    spread: 0.016,
    bulletSpeed: 74,
    rangeLife: 1.45,
    scopeFov: 36,
    accentHex: '#f59e0b'
  },
  {
    id: 'ump45',
    slot: 2,
    name: 'UMP45 SMG',
    shortName: 'UMP45',
    category: '.45 SMG',
    icon: '⚡',
    dmg: 21,
    fireCd: 0.08,
    magSize: 35,
    reloadSec: 0.95,
    pellets: 1,
    spread: 0.028,
    bulletSpeed: 64,
    rangeLife: 1.05,
    scopeFov: 44,
    accentHex: '#38bdf8'
  },
  {
    id: 'shotgun',
    slot: 3,
    name: 'S1897 Pump',
    shortName: 'S1897',
    category: '12G SG',
    icon: '💥',
    dmg: 19,
    fireCd: 0.56,
    magSize: 8,
    reloadSec: 1.3,
    pellets: 6,
    spread: 0.085,
    bulletSpeed: 56,
    rangeLife: 0.48,
    scopeFov: 48,
    accentHex: '#ef4444'
  },
  {
    id: 'awm',
    slot: 4,
    name: 'AWM Magnum',
    shortName: 'AWM',
    category: '4x Sniper',
    icon: '🔭',
    dmg: 96,
    fireCd: 0.85,
    magSize: 5,
    reloadSec: 1.45,
    pellets: 1,
    spread: 0.002,
    bulletSpeed: 118,
    rangeLife: 2.0,
    scopeFov: 22,
    accentHex: '#a855f7'
  }
];

export type SupercarBodyStyle = 'gt' | 'hyper' | 'heavy' | 'drift';
export type AsphaltStatKey = 'speed' | 'accel' | 'nitro' | 'handling';
export type AsphaltCarUpgrades = Record<AsphaltStatKey, number>;

export interface AsphaltCarDef {
  id: number;
  name: string;
  tagline: string;
  icon: string;
  unlockCost: number;
  style: SupercarBodyStyle;
  paintColor: number;
  stripeColor: number;
  accentHex: string;
  topSpeed: number;
  nitroSpeed: number;
  nitroDrain: number;
  driftCharge: number;
  steerSpeed: number;
  accelRate: number;
  mass: number;
  statSpeed: number; // 1..5 base
  statAccel: number; // 1..5 base
  statNitro: number; // 1..5 base
  statImpact: number; // 1..5 base
}

export const ASPHALT_CARS: AsphaltCarDef[] = [
  {
    id: 0,
    name: 'Viper GT',
    tagline: 'Starter All-Rounder',
    icon: '🏎️',
    unlockCost: 0,
    style: 'gt',
    paintColor: 0xef4444,
    stripeColor: 0xfacc15,
    accentHex: '#ef4444',
    topSpeed: 64,
    nitroSpeed: 88,
    nitroDrain: 27,
    driftCharge: 23,
    steerSpeed: 12.6,
    accelRate: 4.5,
    mass: 1.0,
    statSpeed: 3,
    statAccel: 3,
    statNitro: 3,
    statImpact: 3
  },
  {
    id: 1,
    name: 'Apex Hyperion',
    tagline: 'Top Velocity',
    icon: '⚡',
    unlockCost: 100,
    style: 'hyper',
    paintColor: 0x06b6d4,
    stripeColor: 0xffffff,
    accentHex: '#22d3ee',
    topSpeed: 69,
    nitroSpeed: 94,
    nitroDrain: 28,
    driftCharge: 21,
    steerSpeed: 12.2,
    accelRate: 4.7,
    mass: 0.92,
    statSpeed: 4,
    statAccel: 4,
    statNitro: 4,
    statImpact: 2
  },
  {
    id: 2,
    name: 'Titan V12',
    tagline: 'Heavy Rammer',
    icon: '🛡️',
    unlockCost: 160,
    style: 'heavy',
    paintColor: 0xf59e0b,
    stripeColor: 0x111827,
    accentHex: '#f59e0b',
    topSpeed: 63,
    nitroSpeed: 87,
    nitroDrain: 24,
    driftCharge: 22,
    steerSpeed: 11.8,
    accelRate: 4.4,
    mass: 1.5,
    statSpeed: 3,
    statAccel: 3,
    statNitro: 3,
    statImpact: 5
  },
  {
    id: 3,
    name: 'Phantom Drift',
    tagline: 'Drift & Nitro',
    icon: '🌀',
    unlockCost: 220,
    style: 'drift',
    paintColor: 0xa855f7,
    stripeColor: 0x84fab0,
    accentHex: '#c084fc',
    topSpeed: 66,
    nitroSpeed: 92,
    nitroDrain: 21,
    driftCharge: 34,
    steerSpeed: 14.8,
    accelRate: 5.0,
    mass: 1.05,
    statSpeed: 4,
    statAccel: 4,
    statNitro: 5,
    statImpact: 3
  },
  {
    id: 4,
    name: 'Solaris Spyder',
    tagline: 'Emerald Track Coupe',
    icon: 'Emerald',
    unlockCost: 300,
    style: 'gt',
    paintColor: 0x10b981,
    stripeColor: 0xfacc15,
    accentHex: '#34d399',
    topSpeed: 71,
    nitroSpeed: 96,
    nitroDrain: 23,
    driftCharge: 27,
    steerSpeed: 13.8,
    accelRate: 5.2,
    mass: 1.08,
    statSpeed: 4,
    statAccel: 5,
    statNitro: 4,
    statImpact: 3
  },
  {
    id: 5,
    name: 'Obsidian Venom',
    tagline: 'Stealth Interceptor',
    icon: '🦇',
    unlockCost: 420,
    style: 'hyper',
    paintColor: 0x1e293b,
    stripeColor: 0xf43f5e,
    accentHex: '#fb7185',
    topSpeed: 75,
    nitroSpeed: 102,
    nitroDrain: 24,
    driftCharge: 25,
    steerSpeed: 13.4,
    accelRate: 5.4,
    mass: 1.02,
    statSpeed: 5,
    statAccel: 5,
    statNitro: 4,
    statImpact: 3
  },
  {
    id: 6,
    name: 'Brawler GT-X',
    tagline: 'Armored Street Beast',
    icon: '🦏',
    unlockCost: 540,
    style: 'heavy',
    paintColor: 0x2563eb,
    stripeColor: 0xf97316,
    accentHex: '#60a5fa',
    topSpeed: 72,
    nitroSpeed: 98,
    nitroDrain: 21,
    driftCharge: 28,
    steerSpeed: 13.2,
    accelRate: 5.1,
    mass: 1.62,
    statSpeed: 4,
    statAccel: 4,
    statNitro: 5,
    statImpact: 5
  },
  {
    id: 7,
    name: 'Koenig Hypernova',
    tagline: 'S-Class Legend',
    icon: '👑',
    unlockCost: 700,
    style: 'hyper',
    paintColor: 0xe2e8f0,
    stripeColor: 0x06b6d4,
    accentHex: '#38bdf8',
    topSpeed: 78,
    nitroSpeed: 108,
    nitroDrain: 19,
    driftCharge: 32,
    steerSpeed: 15.2,
    accelRate: 5.8,
    mass: 1.18,
    statSpeed: 5,
    statAccel: 5,
    statNitro: 5,
    statImpact: 4
  }
];

ASPHALT_CARS[4].icon = '💚';

export function defaultCarUpgrades(): AsphaltCarUpgrades {
  return { speed: 1, accel: 1, nitro: 1, handling: 1 };
}

export function getCarUpgradeCost(currentLevel: number): number {
  const lvl = Math.max(1, Math.min(5, Math.floor(currentLevel)));
  if (lvl >= 5) return 0;
  return 60 * lvl;
}

export function computeUpgradedCarStats(
  car: AsphaltCarDef,
  upgrades?: Partial<AsphaltCarUpgrades>
): {
  topSpeed: number;
  nitroSpeed: number;
  accelRate: number;
  steerSpeed: number;
  nitroDrain: number;
  driftCharge: number;
  levels: AsphaltCarUpgrades;
} {
  const lv: AsphaltCarUpgrades = {
    speed: Math.max(1, Math.min(5, upgrades?.speed ?? 1)),
    accel: Math.max(1, Math.min(5, upgrades?.accel ?? 1)),
    nitro: Math.max(1, Math.min(5, upgrades?.nitro ?? 1)),
    handling: Math.max(1, Math.min(5, upgrades?.handling ?? 1))
  };
  return {
    topSpeed: car.topSpeed + (lv.speed - 1) * 3.4,
    nitroSpeed: car.nitroSpeed + (lv.nitro - 1) * 4.2 + (lv.speed - 1) * 1.6,
    accelRate: car.accelRate + (lv.accel - 1) * 0.65,
    steerSpeed: car.steerSpeed + (lv.handling - 1) * 1.15,
    nitroDrain: Math.max(13, car.nitroDrain - (lv.nitro - 1) * 1.8),
    driftCharge: car.driftCharge + (lv.handling - 1) * 2.5,
    levels: lv
  };
}

export type AsphaltMissionKind = 'race' | 'takedown' | 'gates' | 'elimination';

export interface AsphaltMapDef {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  icon: string;
  missionKind: AsphaltMissionKind;
  missionGoal: string;
  laps: number;
  targetKOs: number;
  targetGates: number;
  timeLimitSec: number;
  rewardCoins: number;
  skyColor: number;
  fogColor: number;
  groundColor: number;
  mesaColor: number;
  curbLeftHex: string;
  curbRightHex: string;
  accentHex: string;
}

export const ASPHALT_MAPS: AsphaltMapDef[] = [
  {
    id: 0,
    slug: 'neon-city',
    name: 'Neon Metropolis',
    subtitle: 'Night Circuit · 3 Laps',
    icon: '🌃',
    missionKind: 'race',
    missionGoal: 'Finish Top 3 across 3 Laps',
    laps: 3,
    targetKOs: 0,
    targetGates: 0,
    timeLimitSec: 0,
    rewardCoins: 45,
    skyColor: 0x0f172a,
    fogColor: 0x1e1b4b,
    groundColor: 0x090d16,
    mesaColor: 0x1e293b,
    curbLeftHex: '#06b6d4',
    curbRightHex: '#f43f5e',
    accentHex: '#22d3ee'
  },
  {
    id: 1,
    slug: 'red-canyon',
    name: 'Red Canyon Gorge',
    subtitle: 'Takedown Hunt · 3 KOs',
    icon: '🏜️',
    missionKind: 'takedown',
    missionGoal: 'Knockdown 3 Rivals & Finish',
    laps: 2,
    targetKOs: 3,
    targetGates: 0,
    timeLimitSec: 0,
    rewardCoins: 65,
    skyColor: 0xc2410c,
    fogColor: 0xfb923c,
    groundColor: 0x7c2d12,
    mesaColor: 0x9a3412,
    curbLeftHex: '#facc15',
    curbRightHex: '#ef4444',
    accentHex: '#f97316'
  },
  {
    id: 2,
    slug: 'alpine-snow',
    name: 'Alpine Snow Pass',
    subtitle: 'Gate Rush · 10 Gates',
    icon: '🏔️',
    missionKind: 'gates',
    missionGoal: 'Smash 10 Speed Gates Before Time Expires',
    laps: 2,
    targetKOs: 0,
    targetGates: 10,
    timeLimitSec: 75,
    rewardCoins: 80,
    skyColor: 0x38bdf8,
    fogColor: 0xbae6fd,
    groundColor: 0xe2e8f0,
    mesaColor: 0x94a3b8,
    curbLeftHex: '#0284c7',
    curbRightHex: '#f8fafc',
    accentHex: '#38bdf8'
  },
  {
    id: 3,
    slug: 'volcanic-coast',
    name: 'Volcanic Coast',
    subtitle: 'Elimination · 2 Laps',
    icon: '🌋',
    missionKind: 'elimination',
    missionGoal: 'Hold Top 2 at Lap Cutoffs & Win',
    laps: 2,
    targetKOs: 0,
    targetGates: 0,
    timeLimitSec: 0,
    rewardCoins: 95,
    skyColor: 0x450a0a,
    fogColor: 0x991b1b,
    groundColor: 0x1c1917,
    mesaColor: 0x292524,
    curbLeftHex: '#f97316',
    curbRightHex: '#facc15',
    accentHex: '#fb7185'
  }
];

export interface BasketballTeamDef {
  id: number;
  name: string;
  abbr: string;
  tagline: string;
  icon: string;
  jerseyColor: number;
  trimColor: number;
  accentHex: string;
  shootRating: number; // 1..5
  dunkRating: number; // 1..5
  speedRating: number; // 1..5
  defRating: number; // 1..5
}

export const BASKETBALL_TEAMS: BasketballTeamDef[] = [
  {
    id: 0,
    name: 'Boston Celtics',
    abbr: 'BOS',
    tagline: '5-Out 3PT Champions',
    icon: '🍀',
    jerseyColor: 0x007a33,
    trimColor: 0xfacc15,
    accentHex: '#4ade80',
    shootRating: 5,
    dunkRating: 4,
    speedRating: 4,
    defRating: 5
  },
  {
    id: 1,
    name: 'Los Angeles Lakers',
    abbr: 'LAL',
    tagline: 'Showtime Star Power',
    icon: '👑',
    jerseyColor: 0x552583,
    trimColor: 0xfdb927,
    accentHex: '#facc15',
    shootRating: 4,
    dunkRating: 5,
    speedRating: 4,
    defRating: 4
  },
  {
    id: 2,
    name: 'Golden State Warriors',
    abbr: 'GSW',
    tagline: 'Splash Motion Offense',
    icon: '🌉',
    jerseyColor: 0x1d428a,
    trimColor: 0xffc72c,
    accentHex: '#38bdf8',
    shootRating: 5,
    dunkRating: 4,
    speedRating: 5,
    defRating: 4
  },
  {
    id: 3,
    name: 'Denver Nuggets',
    abbr: 'DEN',
    tagline: 'Mile High Playmaking',
    icon: '⛰️',
    jerseyColor: 0x0e2240,
    trimColor: 0xfec524,
    accentHex: '#f59e0b',
    shootRating: 5,
    dunkRating: 4,
    speedRating: 4,
    defRating: 4
  }
];

export type HoopsModeId = '2v2' | '3v3' | '5v5' | 'tournament';

export interface HoopsModeDef {
  id: HoopsModeId;
  name: string;
  badge: string;
  playersPerSide: 2 | 3 | 5;
  courtKind: 'blacktop' | 'arena';
  quarters: number;
  quarterSec: number;
  description: string;
}

export const HOOPS_MODES: HoopsModeDef[] = [
  {
    id: '2v2',
    name: '2v2 Streetball',
    badge: 'HALF-COURT',
    playersPerSide: 2,
    courtKind: 'blacktop',
    quarters: 1,
    quarterSec: 75,
    description: 'Outdoor Sunset Blacktop · Fast 2v2 duo clash'
  },
  {
    id: '3v3',
    name: '3v3 Blacktop',
    badge: 'PARK TRIPLES',
    playersPerSide: 3,
    courtKind: 'blacktop',
    quarters: 1,
    quarterSec: 90,
    description: 'Outdoor Park Triples · PG/SF/C street action'
  },
  {
    id: '5v5',
    name: '5v5 NBA Quick',
    badge: 'FULL COURT',
    playersPerSide: 5,
    courtKind: 'arena',
    quarters: 4,
    quarterSec: 45,
    description: 'Indoor NBA Arena · 4 Quarters full simulation'
  },
  {
    id: 'tournament',
    name: 'NBA Playoffs',
    badge: '3-ROUND CUP',
    playersPerSide: 5,
    courtKind: 'arena',
    quarters: 4,
    quarterSec: 40,
    description: 'QF → Semifinals → Finals · +150🪙 Championship Jackpot'
  }
];

export interface HoopsTournamentState {
  teamId: number;
  round: 1 | 2 | 3;
  opponents: [number, number, number];
  champion: boolean;
}

export function createTournamentBracket(teamId: number): HoopsTournamentState {
  const safeId = ((teamId % BASKETBALL_TEAMS.length) + BASKETBALL_TEAMS.length) % BASKETBALL_TEAMS.length;
  const opps: number[] = [];
  for (let i = 1; i <= 3; i++) {
    opps.push((safeId + i) % BASKETBALL_TEAMS.length);
  }
  return {
    teamId: safeId,
    round: 1,
    opponents: [opps[0], opps[1], opps[2]],
    champion: false
  };
}

export function advanceTournamentBracket(
  state: HoopsTournamentState,
  won: boolean
): { nextState: HoopsTournamentState; wonChampionship: boolean; bonusCoins: number } {
  if (!won) {
    return {
      nextState: createTournamentBracket(state.teamId),
      wonChampionship: false,
      bonusCoins: 0
    };
  }
  if (state.round >= 3) {
    return {
      nextState: { ...state, round: 3, champion: true },
      wonChampionship: true,
      bonusCoins: 150
    };
  }
  return {
    nextState: { ...state, round: (state.round + 1) as 1 | 2 | 3, champion: false },
    wonChampionship: false,
    bonusCoins: 40
  };
}
