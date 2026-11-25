export const COURT_HALF_LEN = 22;
export const COURT_HALF_WID = 12;
export const HOOP_X = 18.8;
export const RIM_Y = 3.05;
export const THREE_PT_RADIUS = 7.35;
export const CORNER_THREE_Z = 9.4;
export const DUNK_RADIUS = 3.4;
export const QUARTER_DURATION_SEC = 45;
export const OT_DURATION_SEC = 25;
export const SHOT_CLOCK_SEC = 24;

export interface CourtPoint {
  x: number;
  z: number;
}

export interface ShotWindowParams {
  shooterPos: CourtPoint;
  hoopX: number;
  defenderDistances: number[];
  shootRating: number; // 1..5
  staminaRatio: number; // 0..1
  sprinting: boolean;
}

export type ShotReleaseQuality = 'GREEN' | 'GREAT' | 'EARLY' | 'LATE';

export interface ShotEvaluationResult {
  quality: ShotReleaseQuality;
  isGreen: boolean;
  makeProb: number;
  points: 2 | 3;
}

export interface PassCandidate {
  index: number;
  x: number;
  z: number;
}

export interface ClockStepResult {
  quarter: number;
  quarterClock: number;
  shotClock: number;
  quarterEnded: boolean;
  shotClockViolation: boolean;
  matchOver: boolean;
}

/**
 * Determines whether a shot taken from (x, z) toward `attackingHoopX`
 * counts as a 3-pointer (outside both the arc radius and corner-3 sidelines).
 */
export function isThreePointLocation(x: number, z: number, attackingHoopX: number): boolean {
  const distToHoop = Math.hypot(x - attackingHoopX, z);
  const absZ = Math.abs(z);
  // Pro court has a straight corner-three line near the sideline plus the curved arc
  const pastBackboardTowardHalf = attackingHoopX > 0 ? x < attackingHoopX : x > attackingHoopX;
  if (!pastBackboardTowardHalf) {
    return absZ > CORNER_THREE_Z;
  }
  return distToHoop > THREE_PT_RADIUS || absZ > CORNER_THREE_Z;
}

/**
 * Checks whether a driving player qualifies for a SLAM DUNK / acrobatic drive animation.
 */
export function canAttemptDunk(
  x: number,
  z: number,
  attackingHoopX: number,
  sprinting: boolean,
  stamina: number
): boolean {
  const dist = Math.hypot(x - attackingHoopX, z);
  return dist <= DUNK_RADIUS && (sprinting || dist <= 2.15) && stamina >= 0.08;
}

/**
 * Computes the green release window bounds [greenStart, greenEnd] inside [0, 1] meter progress,
 * plus base contest-adjusted shot probability.
 */
export function computeShotWindow(params: ShotWindowParams): {
  greenStart: number;
  greenEnd: number;
  baseMakeProb: number;
  points: 2 | 3;
} {
  const { shooterPos, hoopX, defenderDistances, shootRating, staminaRatio, sprinting } = params;
  const dist = Math.hypot(shooterPos.x - hoopX, shooterPos.z);
  const points: 2 | 3 = isThreePointLocation(shooterPos.x, shooterPos.z, hoopX) ? 3 : 2;

  let nearestDef = Infinity;
  for (let i = 0; i < defenderDistances.length; i++) {
    if (defenderDistances[i] < nearestDef) nearestDef = defenderDistances[i];
  }

  // Contest penalty: heavy contest within 1.8m, open beyond 4.2m
  const contestPenalty =
    nearestDef < 1.8 ? 0.34 : nearestDef < 3.0 ? 0.18 : nearestDef < 4.2 ? 0.07 : 0;

  const distFactor = Math.max(0, Math.min(1, 1 - Math.max(0, dist - 2.5) / 16));
  const ratingBonus = (shootRating - 3) * 0.045;
  const fatiguePenalty = staminaRatio < 0.25 ? 0.12 : 0;
  const offDribblePenalty = sprinting && points === 3 ? 0.08 : 0;

  const greenWidth = Math.max(
    0.075,
    Math.min(0.18, 0.14 + (shootRating - 3) * 0.015 - contestPenalty * 0.16 - fatiguePenalty * 0.2)
  );
  const greenCenter = 0.84;
  const greenStart = greenCenter - greenWidth * 0.5;
  const greenEnd = greenCenter + greenWidth * 0.5;

  const baseMakeProb = Math.max(
    0.16,
    Math.min(0.92, 0.48 + distFactor * 0.26 + ratingBonus - contestPenalty - fatiguePenalty - offDribblePenalty)
  );

  return { greenStart, greenEnd, baseMakeProb, points };
}

/**
 * Evaluates a released Pro-Stick shot meter against the Green Zone.
 */
export function evaluateShotRelease(
  meterProgress: number,
  greenStart: number,
  greenEnd: number,
  baseMakeProb: number,
  points: 2 | 3
): ShotEvaluationResult {
  const clamped = Math.max(0, Math.min(1, meterProgress));
  if (clamped >= greenStart && clamped <= greenEnd) {
    return {
      quality: 'GREEN',
      isGreen: true,
      makeProb: 1.0,
      points
    };
  }

  const distFromGreen = clamped < greenStart ? greenStart - clamped : clamped - greenEnd;
  const quality: ShotReleaseQuality =
    distFromGreen <= 0.12 ? 'GREAT' : clamped < greenStart ? 'EARLY' : 'LATE';
  const timingFactor = Math.max(0.15, 1 - distFromGreen * 1.45);
  const makeProb = Math.max(0.08, Math.min(0.95, baseMakeProb * timingFactor));

  return {
    quality,
    isGreen: false,
    makeProb,
    points
  };
}

/**
 * Selects the best teammate index for a pass given carrier position and optional aim direction.
 */
export function pickBestPassTargetIndex(
  carrierPos: CourtPoint,
  aimDir: CourtPoint,
  attackingHoopX: number,
  carrierIdx: number,
  teammates: PassCandidate[]
): number {
  const aimMag = Math.hypot(aimDir.x, aimDir.z);
  const hasAim = aimMag > 0.2;
  const ax = hasAim ? aimDir.x / aimMag : Math.sign(attackingHoopX - carrierPos.x) || 1;
  const az = hasAim ? aimDir.z / aimMag : 0;

  let bestIdx = -1;
  let bestScore = -Infinity;

  for (let i = 0; i < teammates.length; i++) {
    const mate = teammates[i];
    if (mate.index === carrierIdx) continue;
    const dx = mate.x - carrierPos.x;
    const dz = mate.z - carrierPos.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.5) continue;

    const dot = (dx / dist) * ax + (dz / dist) * az;
    const towardHoop = Math.sign(attackingHoopX - carrierPos.x) * (mate.x - carrierPos.x);
    const idealDistBonus = 1 - Math.min(1, Math.abs(dist - 9.5) / 22);
    const score = (hasAim ? dot * 2.4 : dot * 0.8) + towardHoop * 0.045 + idealDistBonus * 0.6;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = mate.index;
    }
  }

  return bestIdx;
}

/**
 * Advances quarter game clock and 24-second shot clock, handling Q1..Q4 and OT rollovers cleanly.
 */
export function stepMatchClocks(
  quarter: number,
  quarterClock: number,
  shotClock: number,
  homeScore: number,
  awayScore: number,
  dt: number,
  maxQuarters = 4,
  quarterDurationSec = QUARTER_DURATION_SEC
): ClockStepResult {
  const safeDt = Math.max(0, Math.min(0.25, dt));
  let nextQ = quarter;
  let nextQClock = quarterClock - safeDt;
  let nextShotClock = shotClock - safeDt;
  let quarterEnded = false;
  let shotClockViolation = false;
  let matchOver = false;

  if (nextQClock <= 0) {
    quarterEnded = true;
    if (nextQ < maxQuarters) {
      nextQ += 1;
      nextQClock = quarterDurationSec;
      nextShotClock = SHOT_CLOCK_SEC;
    } else if (homeScore === awayScore) {
      // Sudden/short Overtime if tied at end of final period or any OT
      nextQ += 1;
      nextQClock = OT_DURATION_SEC;
      nextShotClock = SHOT_CLOCK_SEC;
    } else {
      nextQClock = 0;
      nextShotClock = 0;
      matchOver = true;
    }
  } else if (nextShotClock <= 0) {
    shotClockViolation = true;
    nextShotClock = SHOT_CLOCK_SEC;
  }

  return {
    quarter: nextQ,
    quarterClock: nextQClock,
    shotClock: Math.min(nextQClock, nextShotClock),
    quarterEnded,
    shotClockViolation,
    matchOver
  };
}

// ============================================================================
// NBA 2K26 ENHANCED ON-COURT SYSTEMS
// ============================================================================

export type HoopsShotCoverage = 'WIDE OPEN' | 'OPEN' | 'WEAK' | 'STRONG' | 'TIGHT';

export interface EnhancedShotWindowParams extends ShotWindowParams {
  jumpShotMeterOff?: boolean;
  jumpShotGreenBonus?: number;
  hotZoneHeat?: 'cold' | 'neutral' | 'hot' | 'lethal';
  takeoverActive?: boolean;
  heatCheckActive?: boolean;
  skillBoostActive?: boolean;
}

/**
 * NBA 2K26 Enhanced Shot Window:
 * - Turning Shot Meter OFF grants an automatic +Green Window Boost (+0.036 width / +7% make).
 * - Incorporates Custom Jump Shot stability bonus, Hot/Lethal Zones, Takeover, and Skill Boosts.
 * - Returns authentic NBA 2K26 shot coverage labels (WIDE OPEN / OPEN / WEAK / STRONG / TIGHT).
 */
export function computeShotWindowEnhanced(params: EnhancedShotWindowParams): {
  greenStart: number;
  greenEnd: number;
  greenWidth: number;
  baseMakeProb: number;
  points: 2 | 3;
  coverageLabel: HoopsShotCoverage;
  meterOffBoostApplied: boolean;
} {
  const base = computeShotWindow(params);
  let nearestDef = Infinity;
  for (let i = 0; i < params.defenderDistances.length; i++) {
    if (params.defenderDistances[i] < nearestDef) nearestDef = params.defenderDistances[i];
  }

  const coverageLabel: HoopsShotCoverage =
    nearestDef >= 4.4
      ? 'WIDE OPEN'
      : nearestDef >= 3.2
        ? 'OPEN'
        : nearestDef >= 2.3
          ? 'WEAK'
          : nearestDef >= 1.5
            ? 'STRONG'
            : 'TIGHT';

  const meterOffBonus = params.jumpShotMeterOff ? 0.036 : 0;
  const jsBonus = Math.max(0, Math.min(0.03, params.jumpShotGreenBonus ?? 0));
  const zoneBonus =
    params.hotZoneHeat === 'lethal'
      ? 0.026
      : params.hotZoneHeat === 'hot'
        ? 0.014
        : params.hotZoneHeat === 'cold'
          ? -0.018
          : 0;
  const takeoverBonus = params.takeoverActive ? 0.032 : 0;
  const heatCheckBonus = params.heatCheckActive ? 0.045 : 0;
  const skillBoost = params.skillBoostActive ? 0.012 : 0;

  const baseWidth = base.greenEnd - base.greenStart;
  const greenWidth = Math.max(
    0.065,
    Math.min(0.28, baseWidth + meterOffBonus + jsBonus + zoneBonus + takeoverBonus + heatCheckBonus + skillBoost)
  );
  const center = 0.84;
  const greenStart = Math.max(0.45, center - greenWidth * 0.5);
  const greenEnd = Math.min(0.985, center + greenWidth * 0.5);

  const probBoost =
    (params.jumpShotMeterOff ? 0.07 : 0) +
    (params.takeoverActive ? 0.1 : 0) +
    (params.heatCheckActive ? 0.12 : 0) +
    (params.skillBoostActive ? 0.05 : 0) +
    (params.hotZoneHeat === 'lethal' ? 0.08 : params.hotZoneHeat === 'hot' ? 0.04 : params.hotZoneHeat === 'cold' ? -0.06 : 0);

  return {
    greenStart,
    greenEnd,
    greenWidth,
    baseMakeProb: Math.max(0.12, Math.min(0.98, base.baseMakeProb + probBoost)),
    points: base.points,
    coverageLabel,
    meterOffBoostApplied: Boolean(params.jumpShotMeterOff)
  };
}

export const TEAMMATE_GRADES = ['F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'] as const;
export type TeammateGradeLabel = (typeof TEAMMATE_GRADES)[number];

export type TeammateGradeEvent =
  | 'good_shot'
  | 'green_make'
  | 'assist'
  | 'rebound'
  | 'steal'
  | 'block'
  | 'good_contest'
  | 'screen_assist'
  | 'turnover'
  | 'bad_shot'
  | 'defensive_breakdown'
  | 'shot_clock_violation';

export function getTeammateGradeLabel(score: number): TeammateGradeLabel {
  const clamped = Math.max(0, Math.min(100, score));
  const idx = Math.min(TEAMMATE_GRADES.length - 1, Math.floor((clamped / 100) * TEAMMATE_GRADES.length));
  return TEAMMATE_GRADES[idx];
}

export function stepTeammateGrade(currentScore: number, event: TeammateGradeEvent): {
  score: number;
  grade: TeammateGradeLabel;
  delta: number;
} {
  const deltaMap: Record<TeammateGradeEvent, number> = {
    good_shot: 5,
    green_make: 8,
    assist: 9,
    rebound: 6,
    steal: 9,
    block: 10,
    good_contest: 4,
    screen_assist: 5,
    turnover: -11,
    bad_shot: -7,
    defensive_breakdown: -6,
    shot_clock_violation: -9
  };
  const delta = deltaMap[event];
  const score = Math.max(0, Math.min(100, currentScore + delta));
  return { score, grade: getTeammateGradeLabel(score), delta };
}

/**
 * NBA 2K26 3-Bar Adrenaline System:
 * Consumes 1 bar on explosive burst/dribble launch/steal lunge; recharges passively over time
 * (faster with Starter II "Recharge" REP booster).
 */
export function stepAdrenalineBars(
  bars: number,
  rechargeTimer: number,
  dt: number,
  burstTriggered: boolean,
  hasRechargeBooster = false
): { bars: number; rechargeTimer: number; exhausted: boolean } {
  let nextBars = Math.max(0, Math.min(3, Math.floor(bars)));
  let nextTimer = Math.max(0, rechargeTimer);

  if (burstTriggered && nextBars > 0) {
    nextBars -= 1;
    nextTimer = 0;
  }

  const rechargeSec = hasRechargeBooster ? 2.4 : 3.8;
  if (nextBars < 3) {
    nextTimer += Math.max(0, dt);
    if (nextTimer >= rechargeSec) {
      nextBars = Math.min(3, nextBars + 1);
      nextTimer = 0;
    }
  } else {
    nextTimer = 0;
  }

  return {
    bars: nextBars,
    rechargeTimer: nextTimer,
    exhausted: nextBars === 0
  };
}

/**
 * Advances Takeover Meter (0..500 -> Level 0..5). Level 5 unlocks manual Takeover Ignition!
 */
export function stepTakeoverMeter(
  currentMeter: number,
  delta: number
): { meter: number; level: number; readyToIgnite: boolean } {
  const meter = Math.max(0, Math.min(500, currentMeter + delta));
  const level = Math.min(5, Math.floor(meter / 100));
  return {
    meter,
    level,
    readyToIgnite: level >= 5
  };
}

