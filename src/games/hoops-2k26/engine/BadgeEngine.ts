// ============================================================================
// PART 4 — 5-TIER BADGE ENGINE (ALL 25 BADGES) & TAKEOVER PROGRESSION (LV 1–5)
// ============================================================================

import {
  BADGE_CATALOG,
  type AttributeKey,
  type BadgeCategory,
  type BadgeId,
  type BadgeTier,
  type PlayerProfile,
} from '../hybrid/rosterTypes';

export const BADGE_TIER_BONUS: Record<BadgeTier, number> = {
  BRONZE: 0.04,
  SILVER: 0.08,
  GOLD: 0.12,
  HOF: 0.16,
  LEGEND: 0.22,
};

export const BADGE_TIER_LABEL: Record<BadgeTier, string> = {
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  HOF: 'Hall of Fame',
  LEGEND: 'Legend',
};

export const BADGE_TIER_COLOR: Record<BadgeTier, string> = {
  BRONZE: '#cd7f32',
  SILVER: '#cbd5e1',
  GOLD: '#facc15',
  HOF: '#a855f7',
  LEGEND: '#ef4444',
};

const BADGE_META_MAP: Record<BadgeId, { name: string; category: BadgeCategory }> = (() => {
  const m = {} as Record<BadgeId, { name: string; category: BadgeCategory }>;
  for (let i = 0; i < BADGE_CATALOG.length; i++) {
    const b = BADGE_CATALOG[i];
    m[b.id] = { name: b.name, category: b.category };
  }
  return m;
})();

export interface BadgeTriggerEvent {
  id: string;
  playerId: string;
  playerName: string;
  teamSide: 'HOME' | 'AWAY';
  badgeId: BadgeId;
  badgeName: string;
  tier: BadgeTier;
  category: BadgeCategory;
  boostPct: number; // e.g. 12 for Gold (+12%)
  timestampMs: number;
  ttlSec: number;
}

export type BadgeEmitter = (
  player: PlayerProfile,
  teamSide: 'HOME' | 'AWAY',
  badgeId: BadgeId,
  tier: BadgeTier
) => void;

export function getBadgeTier(player: PlayerProfile, badgeId: BadgeId): BadgeTier | null {
  return player.badges[badgeId] ?? null;
}

export function getBadgeBonus(player: PlayerProfile, badgeId: BadgeId): number {
  const tier = getBadgeTier(player, badgeId);
  return tier ? BADGE_TIER_BONUS[tier] : 0;
}

export function createBadgeTriggerEvent(
  player: PlayerProfile,
  teamSide: 'HOME' | 'AWAY',
  badgeId: BadgeId,
  tier: BadgeTier,
  seq: number
): BadgeTriggerEvent {
  const meta = BADGE_META_MAP[badgeId] ?? { name: badgeId, category: 'SHOOTING' as BadgeCategory };
  return {
    id: `bdg_${seq}_${badgeId}_${player.id}`,
    playerId: player.id,
    playerName: player.name,
    teamSide,
    badgeId,
    badgeName: meta.name,
    tier,
    category: meta.category,
    boostPct: Math.round(BADGE_TIER_BONUS[tier] * 100),
    timestampMs: Date.now(),
    ttlSec: 2.8,
  };
}

// ============================================================================
// 1. SHOOTING BADGES EVALUATION
// ============================================================================

export interface ShootingBadgeContext {
  shooter: PlayerProfile;
  shooterSide: 'HOME' | 'AWAY';
  defender: PlayerProfile | null;
  defenderSide: 'HOME' | 'AWAY';
  passer: PlayerProfile | null;
  distMeters: number;
  isCatchAndShoot: boolean;
  isOffDribble: boolean;
  contestPct: number; // 0..100
}

export interface ShootingBadgeResult {
  offenseBonus: number; // additive bonus to shot make / green window (0..0.55)
  contestReduction: number; // fraction of contest penalty negated (0..0.45)
  defenderContestBoost: number; // additive contest boost from Challenger (0..0.22)
  triggeredBadges: BadgeId[];
}

export function evaluateShootingBadges(
  ctx: ShootingBadgeContext,
  emit?: BadgeEmitter
): ShootingBadgeResult {
  let offenseBonus = 0;
  let contestReduction = 0;
  let defenderContestBoost = 0;
  const triggeredBadges: BadgeId[] = [];

  const fire = (
    p: PlayerProfile,
    side: 'HOME' | 'AWAY',
    id: BadgeId
  ): number => {
    const tier = getBadgeTier(p, id);
    if (!tier) return 0;
    triggeredBadges.push(id);
    if (emit) emit(p, side, id, tier);
    return BADGE_TIER_BONUS[tier];
  };

  // DEADEYE: mitigates late closeouts & moderate-to-heavy contests
  if (ctx.contestPct >= 14) {
    const b = fire(ctx.shooter, ctx.shooterSide, 'DEADEYE');
    if (b > 0) {
      contestReduction += b * 1.45; // Legend +22% -> reduces contest impact by ~32%
      offenseBonus += b * 0.45;
    }
  }

  // LIMITLESS_RANGE: triggers on deep threes beyond 7.75m (~25.4 ft)
  if (ctx.distMeters >= 7.75) {
    const b = fire(ctx.shooter, ctx.shooterSide, 'LIMITLESS_RANGE');
    if (b > 0) {
      offenseBonus += b * 0.9;
    }
  }

  // SET_SHOT_SPECIALIST: stationary catch-and-shoot jumpers
  if (ctx.isCatchAndShoot && !ctx.isOffDribble) {
    const b = fire(ctx.shooter, ctx.shooterSide, 'SET_SHOT_SPECIALIST');
    if (b > 0) {
      offenseBonus += b * 0.85;
    }
  }

  // SHIFTY_SHOOTER: off-dribble pull-ups, stepbacks, fades
  if (ctx.isOffDribble) {
    const b = fire(ctx.shooter, ctx.shooterSide, 'SHIFTY_SHOOTER');
    if (b > 0) {
      offenseBonus += b * 0.85;
    }
  }

  // MINI_MARKSMAN: shorter shooter (at least 3" shorter) shooting over taller defender
  if (ctx.defender && ctx.defender.heightInches - ctx.shooter.heightInches >= 3 && ctx.contestPct >= 8) {
    const b = fire(ctx.shooter, ctx.shooterSide, 'MINI_MARKSMAN');
    if (b > 0) {
      offenseBonus += b * 0.75;
      contestReduction += b * 0.6;
    }
  }

  // DIMER: shooter received pass directly from a teammate with Dimer
  if (ctx.isCatchAndShoot && ctx.passer && ctx.passer.id !== ctx.shooter.id) {
    const b = fire(ctx.passer, ctx.shooterSide, 'DIMER');
    if (b > 0) {
      offenseBonus += b * 0.75;
    }
  }

  // PERIMETER_CHALLENGER: opposing defender contesting perimeter jumper
  if (ctx.defender && ctx.contestPct >= 10 && ctx.distMeters >= 4.2) {
    const b = fire(ctx.defender, ctx.defenderSide, 'PERIMETER_CHALLENGER');
    if (b > 0) {
      defenderContestBoost += b;
    }
  }

  return {
    offenseBonus: Math.min(0.5, offenseBonus),
    contestReduction: Math.min(0.55, contestReduction),
    defenderContestBoost,
    triggeredBadges,
  };
}

// ============================================================================
// 2. FINISHING BADGES EVALUATION
// ============================================================================

export type FinishMoveKind =
  | 'STANDARD_LAYUP'
  | 'REVERSE_LAYUP'
  | 'EURO_STEP'
  | 'FLOATER'
  | 'DUNK'
  | 'ALLEY_OOP'
  | 'PUTBACK';

export interface FinishingBadgeContext {
  finisher: PlayerProfile;
  finisherSide: 'HOME' | 'AWAY';
  defender: PlayerProfile | null;
  defenderSide: 'HOME' | 'AWAY';
  moveKind: FinishMoveKind;
  hasContact: boolean;
  isChaseDown: boolean;
}

export interface FinishingBadgeResult {
  finishBonus: number;
  dunkMeterBonus: number;
  defenderDeterBonus: number;
  blockBonus: number;
  triggeredBadges: BadgeId[];
}

export function evaluateFinishingBadges(
  ctx: FinishingBadgeContext,
  emit?: BadgeEmitter
): FinishingBadgeResult {
  let finishBonus = 0;
  let dunkMeterBonus = 0;
  let defenderDeterBonus = 0;
  let blockBonus = 0;
  const triggeredBadges: BadgeId[] = [];

  const fire = (p: PlayerProfile, side: 'HOME' | 'AWAY', id: BadgeId): number => {
    const tier = getBadgeTier(p, id);
    if (!tier) return 0;
    triggeredBadges.push(id);
    if (emit) emit(p, side, id, tier);
    return BADGE_TIER_BONUS[tier];
  };

  if (ctx.moveKind === 'DUNK') {
    const b = fire(ctx.finisher, ctx.finisherSide, 'POSTERIZER');
    if (b > 0) {
      finishBonus += b * 0.9;
      dunkMeterBonus += b * 0.85;
    }
  }

  if (ctx.moveKind === 'ALLEY_OOP' || ctx.moveKind === 'PUTBACK') {
    const b = fire(ctx.finisher, ctx.finisherSide, 'AERIAL_WIZARD');
    if (b > 0) {
      finishBonus += b * 1.0;
      dunkMeterBonus += b * 0.9;
    }
  }

  if (ctx.moveKind === 'EURO_STEP' || ctx.moveKind === 'REVERSE_LAYUP') {
    const b = fire(ctx.finisher, ctx.finisherSide, 'LAYUP_MIXMASTER');
    if (b > 0) {
      finishBonus += b * 0.95;
    }
  }

  if (ctx.moveKind === 'FLOATER') {
    const b = fire(ctx.finisher, ctx.finisherSide, 'FLOAT_GAME');
    if (b > 0) {
      finishBonus += b * 1.0;
    }
  }

  if (ctx.hasContact && ctx.moveKind !== 'FLOATER') {
    const b = fire(ctx.finisher, ctx.finisherSide, 'PHYSICAL_FINISHER');
    if (b > 0) {
      finishBonus += b * 0.75;
      dunkMeterBonus += b * 0.4;
    }
  }

  if (ctx.defender) {
    const patroller = fire(ctx.defender, ctx.defenderSide, 'PAINT_PATROLLER');
    if (patroller > 0) {
      defenderDeterBonus += patroller;
      blockBonus += patroller * 0.7;
    }
    if (ctx.isChaseDown) {
      const denier = fire(ctx.defender, ctx.defenderSide, 'HIGH_FLYING_DENIER');
      if (denier > 0) {
        blockBonus += denier * 1.0;
      }
    }
  }

  return {
    finishBonus: Math.min(0.45, finishBonus),
    dunkMeterBonus: Math.min(0.35, dunkMeterBonus),
    defenderDeterBonus,
    blockBonus,
    triggeredBadges,
  };
}

// ============================================================================
// 3. PLAYMAKING & BALL-HANDLING BADGES
// ============================================================================

export function evaluateFirstStepLaunch(
  handler: PlayerProfile,
  side: 'HOME' | 'AWAY',
  emit?: BadgeEmitter
): { speedMultiplier: number; adrenalineDrainMul: number } {
  const launchTier = getBadgeTier(handler, 'LIGHTNING_LAUNCH');
  const handlesTier = getBadgeTier(handler, 'HANDLES_FOR_DAYS');
  let speedMultiplier = 1.0;
  let adrenalineDrainMul = 1.0;

  if (launchTier) {
    const b = BADGE_TIER_BONUS[launchTier];
    speedMultiplier += b * 0.9; // up to ~+20% burst
    adrenalineDrainMul -= b * 0.55;
    if (emit) emit(handler, side, 'LIGHTNING_LAUNCH', launchTier);
  }
  if (handlesTier) {
    const b = BADGE_TIER_BONUS[handlesTier];
    adrenalineDrainMul -= b * 1.1; // up to ~-24% stamina/adrenaline drain
    if (emit) emit(handler, side, 'HANDLES_FOR_DAYS', handlesTier);
  }

  return {
    speedMultiplier,
    adrenalineDrainMul: Math.max(0.55, adrenalineDrainMul),
  };
}

export function evaluateAnkleBreaker(
  handler: PlayerProfile,
  handlerSide: 'HOME' | 'AWAY',
  defender: PlayerProfile,
  emit?: BadgeEmitter
): { stunChance: number; triggered: boolean } {
  const tier = getBadgeTier(handler, 'ANKLE_ASSASSIN');
  const baseHandle = (handler.attributes.ballHandle - defender.attributes.perimeterDef) * 0.0045;
  let bonus = 0;
  if (tier) {
    bonus = BADGE_TIER_BONUS[tier] * 1.1;
    if (emit) emit(handler, handlerSide, 'ANKLE_ASSASSIN', tier);
  }
  const stunChance = Math.max(0.04, Math.min(0.48, 0.1 + baseHandle + bonus));
  return { stunChance, triggered: Boolean(tier) };
}

export function evaluatePassBadges(
  passer: PlayerProfile,
  passerSide: 'HOME' | 'AWAY',
  isAlleyOopOrWrap: boolean,
  isOutletBreak: boolean,
  emit?: BadgeEmitter
): { passSpeedMul: number; accuracyBonus: number; lobWindowBonus: number } {
  let passSpeedMul = 1.0;
  let accuracyBonus = 0;
  let lobWindowBonus = 0;

  if (isAlleyOopOrWrap) {
    const vv = getBadgeTier(passer, 'VERSATILE_VISIONARY');
    if (vv) {
      const b = BADGE_TIER_BONUS[vv];
      passSpeedMul += b * 0.7;
      accuracyBonus += b;
      lobWindowBonus += b * 0.9;
      if (emit) emit(passer, passerSide, 'VERSATILE_VISIONARY', vv);
    }
  }

  if (isOutletBreak) {
    const bs = getBadgeTier(passer, 'BREAK_STARTER');
    if (bs) {
      const b = BADGE_TIER_BONUS[bs];
      passSpeedMul += b * 0.85;
      accuracyBonus += b * 1.1;
      if (emit) emit(passer, passerSide, 'BREAK_STARTER', bs);
    }
  }

  const dimer = getBadgeTier(passer, 'DIMER');
  if (dimer) {
    accuracyBonus += BADGE_TIER_BONUS[dimer] * 0.5;
  }

  return { passSpeedMul, accuracyBonus, lobWindowBonus };
}

// ============================================================================
// 4. DEFENSE, STEAL & REBOUND BADGES
// ============================================================================

export function evaluateStealAttempt(
  defender: PlayerProfile,
  defenderSide: 'HOME' | 'AWAY',
  handler: PlayerProfile,
  handlerSide: 'HOME' | 'AWAY',
  isPassLane: boolean,
  isQuickProtectActive: boolean,
  emit?: BadgeEmitter
): { stealChance: number; foulChance: number } {
  const defRating = defender.attributes.steal;
  const offRating = handler.attributes.ballHandle;

  let stealChance = 0.14 + (defRating - offRating) * 0.0055;
  let foulChance = 0.18 + Math.max(0, 82 - defRating) * 0.004;

  if (isPassLane) {
    const inter = getBadgeTier(defender, 'INTERCEPTOR');
    if (inter) {
      stealChance += BADGE_TIER_BONUS[inter] * 1.15;
      if (emit) emit(defender, defenderSide, 'INTERCEPTOR', inter);
    }
    foulChance = 0.02;
  } else {
    const glove = getBadgeTier(defender, 'GLOVE');
    if (glove) {
      stealChance += BADGE_TIER_BONUS[glove] * 1.05;
      foulChance -= BADGE_TIER_BONUS[glove] * 0.35;
      if (emit) emit(defender, defenderSide, 'GLOVE', glove);
    }

    const unpluck = getBadgeTier(handler, 'UNPLUCKABLE');
    if (unpluck) {
      stealChance -= BADGE_TIER_BONUS[unpluck] * 1.1;
      foulChance += BADGE_TIER_BONUS[unpluck] * 0.35;
      if (emit) emit(handler, handlerSide, 'UNPLUCKABLE', unpluck);
    }

    // 2K26 Quick Protect hip-shield heavily punishes steal spammers!
    if (isQuickProtectActive) {
      stealChance *= 0.22;
      foulChance = Math.min(0.75, foulChance + 0.36);
    }
  }

  return {
    stealChance: Math.max(0.02, Math.min(0.62, stealChance)),
    foulChance: Math.max(0.02, Math.min(0.78, foulChance)),
  };
}

export function evaluateReboundBadges(
  rebounder: PlayerProfile,
  rebounderSide: 'HOME' | 'AWAY',
  isBoxingOut: boolean,
  isSecondJump: boolean,
  emit?: BadgeEmitter
): { reachBonusM: number; scoreBonus: number; recoveryMul: number } {
  let reachBonusM = 0;
  let scoreBonus = 0;
  let recoveryMul = 1.0;

  const chaser = getBadgeTier(rebounder, 'REBOUND_CHASER');
  if (chaser) {
    const b = BADGE_TIER_BONUS[chaser];
    reachBonusM += b * 2.4; // up to +0.53m snag radius
    scoreBonus += b * 18;
    if (emit) emit(rebounder, rebounderSide, 'REBOUND_CHASER', chaser);
  }

  if (isBoxingOut) {
    const box = getBadgeTier(rebounder, 'BOXOUT_BEAST');
    if (box) {
      const b = BADGE_TIER_BONUS[box];
      scoreBonus += b * 22;
      if (emit) emit(rebounder, rebounderSide, 'BOXOUT_BEAST', box);
    }
  }

  if (isSecondJump) {
    const pogo = getBadgeTier(rebounder, 'POGO_STICK');
    if (pogo) {
      const b = BADGE_TIER_BONUS[pogo];
      recoveryMul -= b * 1.5;
      scoreBonus += b * 14;
      if (emit) emit(rebounder, rebounderSide, 'POGO_STICK', pogo);
    }
  }

  return {
    reachBonusM,
    scoreBonus,
    recoveryMul: Math.max(0.55, recoveryMul),
  };
}

// ============================================================================
// 5. TAKEOVER PROGRESSION (NBA 2K26 LEVELS 1–5 + IGNITION PERK)
// ============================================================================

export type TakeoverArchetype = 'SHARP' | 'SLASHER' | 'PLAYMAKER' | 'LOCKDOWN' | 'GLASS';

export interface TakeoverState {
  meter: number; // 0..100
  level: 0 | 1 | 2 | 3 | 4 | 5;
  readyToIgnite: boolean;
  ignited: boolean;
  igniteRemainingSec: number; // 45s when ignited
  archetype: TakeoverArchetype;
  perkLabel: string;
}

const TAKEOVER_ATTR_MAP: Record<TakeoverArchetype, AttributeKey[]> = {
  SHARP: ['threePt', 'midRange', 'freeThrow', 'closeShot'],
  SLASHER: ['drivingDunk', 'drivingLayup', 'vertical', 'speed', 'acceleration'],
  PLAYMAKER: ['ballHandle', 'passAccuracy', 'speed', 'acceleration', 'threePt'],
  LOCKDOWN: ['perimeterDef', 'interiorDef', 'steal', 'block', 'strength'],
  GLASS: ['defReb', 'offReb', 'interiorDef', 'block', 'strength', 'closeShot'],
};

const TAKEOVER_PERK_LABELS: Record<TakeoverArchetype, string> = {
  SHARP: 'DEEP BOMBER (+10 SHOOT · EXTENDED GREEN)',
  SLASHER: 'POSTER MACHINE (+10 FINISH · CONTACT SLAM)',
  PLAYMAKER: 'ANKLE MAESTRO (+10 PLAY · DIMER + ANKLES)',
  LOCKDOWN: 'CLAMP GOD (+10 DEF · HEAVY CONTEST + STRIP)',
  GLASS: 'GLASS CLEANER (+10 REB · PAINT FORTRESS)',
};

export function deriveTakeoverArchetype(profile: PlayerProfile): TakeoverArchetype {
  const a = profile.attributes;
  const sharp = a.threePt * 0.6 + a.midRange * 0.4;
  const slash = a.drivingDunk * 0.55 + a.drivingLayup * 0.45;
  const play = a.ballHandle * 0.52 + a.passAccuracy * 0.48;
  const lock = a.perimeterDef * 0.55 + a.steal * 0.45;
  const glass = a.defReb * 0.5 + a.interiorDef * 0.25 + a.block * 0.25;

  const ranked: Array<[TakeoverArchetype, number]> = [
    ['SHARP', sharp],
    ['SLASHER', slash],
    ['PLAYMAKER', play],
    ['LOCKDOWN', lock],
    ['GLASS', glass],
  ];
  ranked.sort((x, y) => y[1] - x[1]);
  return ranked[0][0];
}

export function createTakeoverState(profile: PlayerProfile): TakeoverState {
  const archetype = deriveTakeoverArchetype(profile);
  return {
    meter: 0,
    level: 0,
    readyToIgnite: false,
    ignited: false,
    igniteRemainingSec: 0,
    archetype,
    perkLabel: TAKEOVER_PERK_LABELS[archetype],
  };
}

export function computeTakeoverLevel(meter: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (meter >= 100) return 5;
  if (meter >= 80) return 4;
  if (meter >= 60) return 3;
  if (meter >= 40) return 2;
  if (meter >= 20) return 1;
  return 0;
}

export function addTakeoverProgress(state: TakeoverState, delta: number): TakeoverState {
  if (state.ignited) {
    // Small positive plays extend remaining flame by up to 2s, cap at 45s
    if (delta > 0) {
      state.igniteRemainingSec = Math.min(45, state.igniteRemainingSec + Math.min(2, delta * 0.08));
    }
    return state;
  }
  state.meter = Math.max(0, Math.min(100, state.meter + delta));
  state.level = computeTakeoverLevel(state.meter);
  state.readyToIgnite = state.level === 5;
  return state;
}

export function igniteTakeover(state: TakeoverState): boolean {
  if (state.ignited || !state.readyToIgnite) return false;
  state.ignited = true;
  state.readyToIgnite = false;
  state.igniteRemainingSec = 45;
  state.level = 5;
  state.meter = 100;
  return true;
}

export function tickTakeover(state: TakeoverState, dt: number): void {
  if (state.ignited) {
    state.igniteRemainingSec = Math.max(0, state.igniteRemainingSec - dt);
    state.meter = Math.max(0, (state.igniteRemainingSec / 45) * 100);
    if (state.igniteRemainingSec <= 0) {
      state.ignited = false;
      state.readyToIgnite = false;
      state.meter = 0;
      state.level = 0;
    }
  } else if (state.meter > 0) {
    // Gentle cool-down decay (0.45% per second)
    state.meter = Math.max(0, state.meter - dt * 0.45);
    state.level = computeTakeoverLevel(state.meter);
    state.readyToIgnite = state.level === 5;
  }
}

/**
 * Progressive Takeover rating boost:
 * Levels 1..4 -> +2, +4, +6, +8 to archetype attributes.
 * Level 5 Ignited -> +10 to archetype attributes (+3 to all other attributes).
 */
export function getTakeoverAttributeBoost(
  state: TakeoverState,
  attrKey: AttributeKey
): number {
  const boostedKeys = TAKEOVER_ATTR_MAP[state.archetype];
  const isCore = boostedKeys.includes(attrKey);
  if (state.ignited) {
    return isCore ? 10 : 3;
  }
  if (state.level >= 1 && isCore) {
    return Math.min(8, state.level * 2);
  }
  return 0;
}

export function getEffectiveAttribute(
  profile: PlayerProfile,
  takeover: TakeoverState,
  attrKey: AttributeKey
): number {
  const base = profile.attributes[attrKey];
  const boost = getTakeoverAttributeBoost(takeover, attrKey);
  return Math.max(25, Math.min(99, base + boost));
}
