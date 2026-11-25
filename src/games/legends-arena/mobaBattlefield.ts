import { MobaRole } from './mobaHeroCatalog';

export type MobaMapVariantId =
  | 'revealing_wisps'
  | 'healing_turtle'
  | 'golden_turret'
  | 'flying_cloud';

export type MobaMapVariantSetting = 'random' | MobaMapVariantId;

export interface MobaMapVariantDef {
  id: MobaMapVariantId;
  name: string;
  shortName: string;
  icon: string;
  accentHex: string;
  colorNum: number;
  summary: string;
  tacticalTip: string;
}

export const MOBA_MAP_VARIANTS: MobaMapVariantDef[] = [
  {
    id: 'revealing_wisps',
    name: 'Revealing Wisps',
    shortName: 'Wisps',
    icon: '✨',
    accentHex: '#38bdf8',
    colorNum: 0x38bdf8,
    summary: 'Drifting spirit orbs patrol jungle corridors and reveal enemies hiding in nearby bushes.',
    tacticalTip: 'Track wisp patrols before setting up bush ambushes near buff camps.'
  },
  {
    id: 'healing_turtle',
    name: 'Healing Turtle',
    shortName: 'Heal Turtle',
    icon: '🐢',
    accentHex: '#34d399',
    colorNum: 0x10b981,
    summary: 'Allied heroes near captured/allied Turtle rapidly heal & summon mini-turtle siege companions.',
    tacticalTip: 'Group around your Turtle buff to push outer turrets with mini-turtle siegers.'
  },
  {
    id: 'golden_turret',
    name: 'Golden Turret',
    shortName: 'Gold Turret',
    icon: '🏛️',
    accentHex: '#facc15',
    colorNum: 0xfacc15,
    summary: 'Inner & Base Turrets gain +25% max HP, and every destroyed turret awards +65% teamwide Gold.',
    tacticalTip: 'Prioritize turret takedowns for massive shared gold spikes across your team.'
  },
  {
    id: 'flying_cloud',
    name: 'Flying Cloud',
    shortName: 'Sky Cloud',
    icon: '☁️',
    accentHex: '#a78bfa',
    colorNum: 0xa78bfa,
    summary: 'Interactive cloud launch pad near Base Fountain launches heroes over base walls into outer lanes.',
    tacticalTip: 'Step onto the glowing cloud beside Fountain after respawning to reinforce lanes fast.'
  }
];

export function getMapVariantDef(id: MobaMapVariantId): MobaMapVariantDef {
  return MOBA_MAP_VARIANTS.find((v) => v.id === id) ?? MOBA_MAP_VARIANTS[0];
}

export function resolveMatchMapVariant(
  override: MobaMapVariantSetting = 'random',
  rng: () => number = Math.random
): MobaMapVariantDef {
  if (override !== 'random') {
    return getMapVariantDef(override);
  }
  const idx = Math.floor(Math.max(0, Math.min(0.999999, rng())) * MOBA_MAP_VARIANTS.length);
  return MOBA_MAP_VARIANTS[idx] ?? MOBA_MAP_VARIANTS[0];
}

export type RiverPitSide = 'upper' | 'lower';

export interface DynamicLaneAssignment {
  firstTurtlePit: RiverPitSide;
  expLaneIndex: 0 | 2; // 0 = Top-Left lane, 2 = Bottom-Right lane
  goldLaneIndex: 0 | 2;
  expLaneSide: 'top' | 'bottom';
  goldLaneSide: 'top' | 'bottom';
  expMarkerWorld: [number, number];
  goldMarkerWorld: [number, number];
}

export function createDynamicLaneAssignment(firstTurtlePit: RiverPitSide): DynamicLaneAssignment {
  if (firstTurtlePit === 'upper') {
    return {
      firstTurtlePit: 'upper',
      expLaneIndex: 0,
      goldLaneIndex: 2,
      expLaneSide: 'top',
      goldLaneSide: 'bottom',
      expMarkerWorld: [-104, -56],
      goldMarkerWorld: [56, 104]
    };
  }
  return {
    firstTurtlePit: 'lower',
    expLaneIndex: 2,
    goldLaneIndex: 0,
    expLaneSide: 'bottom',
    goldLaneSide: 'top',
    expMarkerWorld: [56, 104],
    goldMarkerWorld: [-104, -56]
  };
}

// ============================================================================
// EXACT MLBB REAL-TIME MATCH TIMELINE (0:00 -> 18:00+)
// ============================================================================
export const MLBB_TIMERS = {
  FIRST_WAVE_SEC: 10,
  WAVE_INTERVAL_SEC: 30,
  ORANGE_FIRST_SPAWN_SEC: 20,
  PURPLE_FIRST_SPAWN_SEC: 25,
  SMALL_CAMP_FIRST_SPAWN_SEC: 30,
  LITHO_FIRST_SPAWN_SEC: 40,
  CRAB_FIRST_SPAWN_SEC: 42,
  BUFF_RESPAWN_SEC: 90,
  BUFF_DURATION_SEC: 75,
  SMALL_CAMP_RESPAWN_SEC: 70,
  LITHO_RESPAWN_SEC: 120,
  WALKIE_GRASS_DURATION_SEC: 45,
  LITTLE_CRAB_RESPAWN_SEC: 35,
  LARGE_CRAB_RESPAWN_SEC: 90,
  CRAB_AURA_DURATION_SEC: 18,
  CYCLONE_EYE_COOLDOWN_SEC: 45,
  FIRST_TURTLE_SEC: 120, // 2:00
  TURTLE_RESPAWN_SEC: 120, // 2m
  TURTLE_CUTOFF_SEC: 360, // 6:00 kill cutoff
  TURRET_SHIELD_END_SEC: 300, // 5:00
  FIRST_LORD_SEC: 480, // 8:00
  TURTLE_MAX_COMBAT_DELAY_SEC: 540, // 9:00
  ENHANCED_LORD_SEC: 720, // 12:00
  EVOLVED_LORD_SEC: 1080, // 18:00
  LORD_STAGE1_RESPAWN_SEC: 180, // 3m
  LORD_STAGE2_RESPAWN_SEC: 180, // 3m
  LORD_STAGE3_RESPAWN_SEC: 150, // 2.5m
  FLYING_CLOUD_COOLDOWN_SEC: 45
} as const;

export type LordStage = 0 | 1 | 2 | 3;

export interface BattlefieldClockSnapshot {
  elapsedSec: number;
  wavesStarted: boolean;
  orangeBuffReady: boolean;
  purpleBuffReady: boolean;
  smallCampsReady: boolean;
  lithoReady: boolean;
  crabsReady: boolean;
  largeGoldCrabsActive: boolean;
  junglerJungleDrActive: boolean; // 15% allied jungle DR until 2:00
  outerTurretShieldActive: boolean; // Energy Shield + plating gold until 5:00
  laneCannonBonusActive: boolean; // Gold/EXP cannon bonus until 5:00
  junglerLanePenaltyActive: boolean; // Early lane minion penalty until 5:00
  roamDevotionActive: boolean; // Roam devotion until 8:00
  innerTurretEarlyDrActive: boolean; // Inner turret DR until 8:00
  baseTurretEarlyBuffActive: boolean; // Base turret early wave-clear buff until 12:00
  minionSpeedBoostActive: boolean; // 12:00+
  lateGameEscalationActive: boolean; // 18:00+ (longer death timers + stronger homeguard)
  lordStage: LordStage;
  lordStageLabel: string;
  lordRespawnSec: number;
  nextMilestoneLabel: string;
  nextMilestoneInSec: number;
}

export function evaluateBattlefieldClock(elapsedSec: number): BattlefieldClockSnapshot {
  const t = Math.max(0, elapsedSec);
  const lordStage: LordStage =
    t >= MLBB_TIMERS.EVOLVED_LORD_SEC
      ? 3
      : t >= MLBB_TIMERS.ENHANCED_LORD_SEC
        ? 2
        : t >= MLBB_TIMERS.FIRST_LORD_SEC
          ? 1
          : 0;

  const lordStageLabel =
    lordStage === 3
      ? 'Evolved Lord'
      : lordStage === 2
        ? 'Enhanced Lord'
        : lordStage === 1
          ? 'Neutral Lord'
          : 'Turtle Phase';

  const lordRespawnSec =
    lordStage === 3 ? MLBB_TIMERS.LORD_STAGE3_RESPAWN_SEC : MLBB_TIMERS.LORD_STAGE1_RESPAWN_SEC;

  let nextMilestoneLabel = 'Evolved Lord Active';
  let nextMilestoneInSec = 0;
  if (t < MLBB_TIMERS.FIRST_WAVE_SEC) {
    nextMilestoneLabel = 'First Minion Wave';
    nextMilestoneInSec = MLBB_TIMERS.FIRST_WAVE_SEC - t;
  } else if (t < MLBB_TIMERS.ORANGE_FIRST_SPAWN_SEC) {
    nextMilestoneLabel = 'Orange Buff Spawn';
    nextMilestoneInSec = MLBB_TIMERS.ORANGE_FIRST_SPAWN_SEC - t;
  } else if (t < MLBB_TIMERS.FIRST_TURTLE_SEC) {
    nextMilestoneLabel = 'First Turtle & Large Crabs';
    nextMilestoneInSec = MLBB_TIMERS.FIRST_TURTLE_SEC - t;
  } else if (t < MLBB_TIMERS.TURRET_SHIELD_END_SEC) {
    nextMilestoneLabel = 'Turret Shields Expire';
    nextMilestoneInSec = MLBB_TIMERS.TURRET_SHIELD_END_SEC - t;
  } else if (t < MLBB_TIMERS.FIRST_LORD_SEC) {
    nextMilestoneLabel = 'Neutral Lord (Stage 1)';
    nextMilestoneInSec = MLBB_TIMERS.FIRST_LORD_SEC - t;
  } else if (t < MLBB_TIMERS.ENHANCED_LORD_SEC) {
    nextMilestoneLabel = 'Enhanced Lord (Stage 2)';
    nextMilestoneInSec = MLBB_TIMERS.ENHANCED_LORD_SEC - t;
  } else if (t < MLBB_TIMERS.EVOLVED_LORD_SEC) {
    nextMilestoneLabel = 'Evolved Lord (Stage 3)';
    nextMilestoneInSec = MLBB_TIMERS.EVOLVED_LORD_SEC - t;
  }

  return {
    elapsedSec: t,
    wavesStarted: t >= MLBB_TIMERS.FIRST_WAVE_SEC,
    orangeBuffReady: t >= MLBB_TIMERS.ORANGE_FIRST_SPAWN_SEC,
    purpleBuffReady: t >= MLBB_TIMERS.PURPLE_FIRST_SPAWN_SEC,
    smallCampsReady: t >= MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN_SEC,
    lithoReady: t >= MLBB_TIMERS.LITHO_FIRST_SPAWN_SEC,
    crabsReady: t >= MLBB_TIMERS.CRAB_FIRST_SPAWN_SEC,
    largeGoldCrabsActive: t >= MLBB_TIMERS.FIRST_TURTLE_SEC,
    junglerJungleDrActive: t < MLBB_TIMERS.FIRST_TURTLE_SEC,
    outerTurretShieldActive: t < MLBB_TIMERS.TURRET_SHIELD_END_SEC,
    laneCannonBonusActive: t < MLBB_TIMERS.TURRET_SHIELD_END_SEC,
    junglerLanePenaltyActive: t < MLBB_TIMERS.TURRET_SHIELD_END_SEC,
    roamDevotionActive: t < MLBB_TIMERS.FIRST_LORD_SEC,
    innerTurretEarlyDrActive: t < MLBB_TIMERS.FIRST_LORD_SEC,
    baseTurretEarlyBuffActive: t < MLBB_TIMERS.ENHANCED_LORD_SEC,
    minionSpeedBoostActive: t >= MLBB_TIMERS.ENHANCED_LORD_SEC,
    lateGameEscalationActive: t >= MLBB_TIMERS.EVOLVED_LORD_SEC,
    lordStage,
    lordStageLabel,
    lordRespawnSec,
    nextMilestoneLabel,
    nextMilestoneInSec: Math.max(0, Math.ceil(nextMilestoneInSec))
  };
}

export function canRespawnNextTurtle(slainAtSec: number): boolean {
  return slainAtSec < MLBB_TIMERS.TURTLE_CUTOFF_SEC;
}

export function shouldTurtleDissipate(elapsedSec: number, outOfCombatSec: number): boolean {
  if (elapsedSec >= MLBB_TIMERS.TURTLE_MAX_COMBAT_DELAY_SEC) return true;
  if (elapsedSec >= MLBB_TIMERS.FIRST_LORD_SEC && outOfCombatSec >= 5) return true;
  return false;
}

export interface TurtleRewardPayload {
  teamGold: number;
  teamXp: number;
  teamShieldHp: number;
  teamShieldSec: number;
  slayerShieldHp: number;
  slayerPhysAtkBonus: number;
  slayerMagicPowerBonus: number;
}

export function computeTurtleRewards(turtleNumber: number, heroLevel: number): TurtleRewardPayload {
  const n = Math.max(1, Math.round(turtleNumber));
  const lv = Math.max(1, Math.min(15, Math.round(heroLevel)));
  return {
    teamGold: 60 + (n - 1) * 10,
    teamXp: 90 + (n - 1) * 20,
    teamShieldHp: 200 + 20 * lv,
    teamShieldSec: 120,
    slayerShieldHp: 400 + 40 * lv,
    slayerPhysAtkBonus: 20 + 2 * lv,
    slayerMagicPowerBonus: 25 + 4 * lv
  };
}

export function computeEvolvedLordNeutralDr(nearbyHeroCount: number): number {
  const count = Math.max(0, Math.floor(nearbyHeroCount));
  return Number(Math.max(0.15, 0.4 - count * 0.05).toFixed(2));
}

export function computeEvolvedLordSummonedDr(nearbyAllyCount: number): number {
  const count = Math.max(0, Math.floor(nearbyAllyCount));
  return Number(Math.min(0.25, count * 0.05).toFixed(2));
}

export function selectLordWeakestLane(redStandingTurretsPerLane: Record<0 | 1 | 2, number>): 0 | 1 | 2 {
  const c0 = redStandingTurretsPerLane[0];
  const c1 = redStandingTurretsPerLane[1];
  const c2 = redStandingTurretsPerLane[2];
  const minVal = Math.min(c0, c1, c2);
  // Default to Mid (1) when tied, matching MLBB Lord lane rules
  if (c1 === minVal) return 1;
  if (c0 === minVal) return 0;
  return 2;
}

export function computeOrangeBuffPenetrationPct(role: MobaRole): number {
  if (role === 'Assassin' || role === 'Marksman' || role === 'Mage') return 10;
  return 5;
}

export function computeRetributionDamage(heroLevel: number, evolved: boolean): number {
  const lv = Math.max(1, Math.min(15, Math.round(heroLevel)));
  return (evolved ? 310 : 240) + lv * 26;
}

export function formatMatchClock(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export interface CycloneEyeSpec {
  id: string;
  x: number;
  z: number;
}

// 4 Cyclone Eyes positioned at the 4 jungle chokepoints adjacent to Purple/Orange buff walls
export const CYCLONE_EYE_SPECS: CycloneEyeSpec[] = [
  { id: 'cyclone_blue_top', x: -56, z: 10 },
  { id: 'cyclone_blue_bot', x: -10, z: 56 },
  { id: 'cyclone_red_top', x: 10, z: -56 },
  { id: 'cyclone_red_bot', x: 56, z: -10 }
];

export const UPPER_RIVER_PIT: [number, number] = [-36, -36];
export const LOWER_RIVER_PIT: [number, number] = [36, 36];
export const LITHO_UPPER_SPOT: [number, number] = [-16, -16];
export const LITHO_LOWER_SPOT: [number, number] = [16, 16];
export const FLYING_CLOUD_BLUE_SPOT: [number, number] = [-94, 94];
