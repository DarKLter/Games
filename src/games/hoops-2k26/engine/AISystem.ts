// ============================================================================
// PART 4 — SMART 5v5 / 3v3 / 1v1 AI ENGINE (PLAYVISION, SCHEMES & TENDENCIES)
// ============================================================================

import type { GameplaySliderSet, MatchDifficulty } from '../hybrid/types';
import type { PlayerProfile } from '../hybrid/rosterTypes';
import {
  COURT_DIMS,
  type DefensiveSchemeId,
  type MarkCoverageTag,
  type PlayVisionPlayId,
} from './courtTypes';

export interface DifficultyProfile {
  id: MatchDifficulty;
  aiReactionSec: number; // Delay before CPU makes a read
  aiShotGreenRate: number; // 0..1 base probability of hitting excellent timing
  aiContestCloseoutMul: number; // Speed/aggressiveness closing out shooters
  aiStealAggroMul: number; // Multiplier on steal attempts
  aiBlockTimingAccuracy: number; // 0..1 probability of timing a block cleanly
  userGreenWindowMul: number; // Scales user green window width
  requiresInteractiveFinishPrompts: boolean; // False on Rookie, true on Pro+
}

export const DIFFICULTY_PROFILES: Record<MatchDifficulty, DifficultyProfile> = {
  Rookie: {
    id: 'Rookie',
    aiReactionSec: 0.52,
    aiShotGreenRate: 0.24,
    aiContestCloseoutMul: 0.72,
    aiStealAggroMul: 0.45,
    aiBlockTimingAccuracy: 0.32,
    userGreenWindowMul: 1.32,
    requiresInteractiveFinishPrompts: false,
  },
  Pro: {
    id: 'Pro',
    aiReactionSec: 0.36,
    aiShotGreenRate: 0.38,
    aiContestCloseoutMul: 0.88,
    aiStealAggroMul: 0.72,
    aiBlockTimingAccuracy: 0.48,
    userGreenWindowMul: 1.12,
    requiresInteractiveFinishPrompts: true,
  },
  'All-Star': {
    id: 'All-Star',
    aiReactionSec: 0.24,
    aiShotGreenRate: 0.5,
    aiContestCloseoutMul: 1.0,
    aiStealAggroMul: 0.95,
    aiBlockTimingAccuracy: 0.62,
    userGreenWindowMul: 1.0,
    requiresInteractiveFinishPrompts: true,
  },
  Superstar: {
    id: 'Superstar',
    aiReactionSec: 0.16,
    aiShotGreenRate: 0.62,
    aiContestCloseoutMul: 1.12,
    aiStealAggroMul: 1.15,
    aiBlockTimingAccuracy: 0.74,
    userGreenWindowMul: 0.88,
    requiresInteractiveFinishPrompts: true,
  },
  'Hall of Fame': {
    id: 'Hall of Fame',
    aiReactionSec: 0.1,
    aiShotGreenRate: 0.72,
    aiContestCloseoutMul: 1.24,
    aiStealAggroMul: 1.32,
    aiBlockTimingAccuracy: 0.84,
    userGreenWindowMul: 0.78,
    requiresInteractiveFinishPrompts: true,
  },
};

export interface AIPlayerSnap {
  id: string;
  slotIndex: number; // 0..4 within team
  teamSide: 'HOME' | 'AWAY';
  profile: PlayerProfile;
  x: number;
  z: number;
  hasBall: boolean;
  isUserControlled: boolean;
  stamina: number;
  adrenalinePips: number;
  guardTargetId: string | null;
}

export interface OffenseAICommand {
  targetX: number;
  targetZ: number;
  sprint: boolean;
  action: 'MOVE' | 'SHOOT' | 'DRIVE' | 'PASS' | 'ALLEY_OOP' | 'DRIBBLE_MOVE' | 'SET_SCREEN';
  passTargetId?: string;
}

export interface DefenseAICommand {
  targetX: number;
  targetZ: number;
  sprint: boolean;
  handsUp: boolean;
  intenseD: boolean;
  attemptSteal: boolean;
  attemptBlock: boolean;
  boxOut: boolean;
  guardTargetId: string | null;
}

function clampCourt(x: number, z: number): { x: number; z: number } {
  return {
    x: Math.max(-COURT_DIMS.HALF_LENGTH + 0.85, Math.min(COURT_DIMS.HALF_LENGTH - 0.85, x)),
    z: Math.max(-COURT_DIMS.HALF_WIDTH + 0.7, Math.min(COURT_DIMS.HALF_WIDTH - 0.7, z)),
  };
}

/**
 * Generates authentic 5-out / Motion Cut / Horns / Floppy / Pick & Roll floor spots
 * so off-ball teammates NEVER bunch around the ball handler.
 */
export function getPlayVisionOffenseSpots(
  play: PlayVisionPlayId,
  attackDirX: 1 | -1,
  playClockSec: number,
  playersPerSide: number
): Array<{ x: number; z: number; role: 'HANDLER' | 'SHOOTER' | 'CUTTER' | 'SCREENER' | 'CORNER' }> {
  const d = attackDirX;
  const phase = (playClockSec % 8) / 8; // 0..1 continuous motion cycle
  const cutWave = Math.sin(phase * Math.PI * 2);

  let spots: Array<{
    x: number;
    z: number;
    role: 'HANDLER' | 'SHOOTER' | 'CUTTER' | 'SCREENER' | 'CORNER';
  }>;

  switch (play) {
    case 'FIVE_OUT':
      spots = [
        { x: d * 4.5, z: 0.0, role: 'HANDLER' },
        { x: d * 6.4, z: -5.4, role: 'SHOOTER' },
        { x: d * 6.4, z: 5.4, role: 'SHOOTER' },
        { x: d * 11.4, z: -6.7, role: 'CORNER' },
        { x: d * 11.4, z: 6.7, role: 'CORNER' },
      ];
      break;

    case 'MOTION_CUT':
      spots = [
        { x: d * 4.8, z: -0.6, role: 'HANDLER' },
        { x: d * (7.2 + Math.max(0, cutWave) * 3.4), z: -5.2 + Math.max(0, cutWave) * 3.5, role: 'CUTTER' },
        { x: d * 6.2, z: 5.4, role: 'SHOOTER' },
        { x: d * 11.2, z: -6.6, role: 'CORNER' },
        { x: d * (9.2 - Math.max(0, -cutWave) * 2.2), z: 2.1 + cutWave * 1.4, role: 'CUTTER' },
      ];
      break;

    case 'HORNS':
      spots = [
        { x: d * 4.2, z: 0.0, role: 'HANDLER' },
        { x: d * 11.5, z: -6.7, role: 'CORNER' },
        { x: d * 11.5, z: 6.7, role: 'CORNER' },
        { x: d * 7.4, z: -2.4, role: 'SCREENER' },
        { x: d * (7.4 + Math.max(0, cutWave) * 3.6), z: 2.4 - Math.max(0, cutWave) * 1.6, role: 'SCREENER' },
      ];
      break;

    case 'FLOPPY':
      spots = [
        { x: d * 4.6, z: 0.0, role: 'HANDLER' },
        { x: d * (10.4 - Math.abs(cutWave) * 3.2), z: -1.4 - Math.abs(cutWave) * 4.6, role: 'SHOOTER' },
        { x: d * 11.3, z: 6.6, role: 'CORNER' },
        { x: d * 9.8, z: -2.6, role: 'SCREENER' },
        { x: d * 9.8, z: 2.6, role: 'SCREENER' },
      ];
      break;

    case 'PICK_AND_ROLL':
    case 'OFF':
    default:
      spots = [
        { x: d * 4.7, z: -0.4, role: 'HANDLER' },
        { x: d * 11.5, z: -6.7, role: 'CORNER' },
        { x: d * 6.6, z: 5.5, role: 'SHOOTER' },
        { x: d * 11.5, z: 6.7, role: 'CORNER' },
        {
          // Roll man sets screen high then dives to dunker spot
          x: d * (phase < 0.45 ? 6.2 : 6.2 + ((phase - 0.45) / 0.55) * 4.9),
          z: phase < 0.45 ? -1.4 : -1.4 + ((phase - 0.45) / 0.55) * 2.1,
          role: phase < 0.45 ? 'SCREENER' : 'CUTTER',
        },
      ];
      break;
  }

  return spots.slice(0, Math.max(1, Math.min(5, playersPerSide)));
}

/**
 * Evaluates closest defender distance to a given offensive player.
 */
function findNearestDefender(
  p: AIPlayerSnap,
  defenders: AIPlayerSnap[]
): { defender: AIPlayerSnap | null; dist: number; secondDist: number } {
  let nearest: AIPlayerSnap | null = null;
  let best = 999;
  let second = 999;
  for (let i = 0; i < defenders.length; i++) {
    const d = defenders[i];
    const dist = Math.hypot(d.x - p.x, d.z - p.z);
    if (dist < best) {
      second = best;
      best = dist;
      nearest = d;
    } else if (dist < second) {
      second = dist;
    }
  }
  return { defender: nearest, dist: best, secondDist: second };
}

/**
 * Computes smart offensive AI for either the AI ball-handler or an off-ball teammate.
 */
export function computeOffenseAI(params: {
  player: AIPlayerSnap;
  teammates: AIPlayerSnap[];
  defenders: AIPlayerSnap[];
  attackDirX: 1 | -1;
  playVision: PlayVisionPlayId;
  shotClockSec: number;
  playClockSec: number;
  difficulty: MatchDifficulty;
  playersPerSide: number;
  canDecideAction: boolean;
  isBlacktopHalfCourt: boolean;
}): OffenseAICommand {
  const {
    player,
    teammates,
    defenders,
    attackDirX,
    playVision,
    shotClockSec,
    playClockSec,
    difficulty,
    playersPerSide,
    canDecideAction,
    isBlacktopHalfCourt,
  } = params;

  const hoopX = attackDirX * COURT_DIMS.RIM_X;
  const hoopZ = 0;
  const spots = getPlayVisionOffenseSpots(playVision, attackDirX, playClockSec, playersPerSide);
  const slotSpot = spots[Math.min(player.slotIndex, spots.length - 1)] ?? spots[0];

  // Off-ball movement: space into PlayVision spot, cut backdoor if defender overplays
  if (!player.hasBall) {
    const ballHandler = teammates.find((t) => t.hasBall);
    let tx = slotSpot.x;
    let tz = slotSpot.z;

    // If handler is occupying our spot, shift gracefully to opposite wing/corner
    if (ballHandler && Math.hypot(ballHandler.x - tx, ballHandler.z - tz) < 2.4) {
      tz = tz >= 0 ? -Math.min(6.6, Math.abs(tz) + 2.2) : Math.min(6.6, Math.abs(tz) + 2.2);
    }

    // Backdoor cut opportunity when defender is overplaying beyond the 3PT arc
    const nearestDef = findNearestDefender(player, defenders);
    if (
      slotSpot.role === 'CUTTER' ||
      (nearestDef.defender &&
        nearestDef.dist < 1.8 &&
        Math.abs(hoopX - nearestDef.defender.x) > Math.abs(hoopX - player.x) + 0.6)
    ) {
      tx = hoopX - attackDirX * 1.9;
      tz = Math.sign(player.z || 1) * 1.4;
    }

    const clamped = clampCourt(tx, tz);
    return {
      targetX: clamped.x,
      targetZ: clamped.z,
      sprint: slotSpot.role === 'CUTTER',
      action: slotSpot.role === 'SCREENER' ? 'SET_SCREEN' : 'MOVE',
    };
  }

  // ---- BALL HANDLER AI ----
  const distToHoop = Math.hypot(hoopX - player.x, hoopZ - player.z);
  const defInfo = findNearestDefender(player, defenders);
  const isDoubleTeamed = defInfo.dist < 2.2 && defInfo.secondDist < 2.7;
  const inFrontCourt = isBlacktopHalfCourt
    ? true
    : attackDirX === 1
      ? player.x > 0.6
      : player.x < -0.6;

  // Bring the ball cleanly across half-court first (prevents 8s backcourt violation)
  if (!inFrontCourt) {
    const advance = clampCourt(attackDirX * 4.4, player.z * 0.45);
    return {
      targetX: advance.x,
      targetZ: advance.z,
      sprint: shotClockSec < 18,
      action: 'MOVE',
    };
  }

  // Evaluate open teammates for kick-outs / alley-oops / Dimer passes
  let bestPassTarget: AIPlayerSnap | null = null;
  let bestPassScore = 0;
  let preferAlleyOop = false;

  for (let i = 0; i < teammates.length; i++) {
    const mate = teammates[i];
    if (mate.id === player.id) continue;
    const mateDef = findNearestDefender(mate, defenders);
    const mateDistHoop = Math.hypot(hoopX - mate.x, mate.z);
    const isCornerOrWing3 = mateDistHoop >= COURT_DIMS.THREE_PT_RADIUS - 0.15 && mateDistHoop <= 8.8;
    const isCuttingRim = mateDistHoop <= 3.1 && mate.profile.attributes.drivingDunk >= 78;

    let score = mateDef.dist * 12;
    if (isCornerOrWing3) {
      score += (mate.profile.attributes.threePt - 60) * 0.9;
    }
    if (isCuttingRim && mateDef.dist > 1.7) {
      score += 36;
    }
    if (score > bestPassScore) {
      bestPassScore = score;
      bestPassTarget = mate;
      preferAlleyOop = isCuttingRim && mateDef.dist > 1.9 && player.profile.attributes.passAccuracy >= 74;
    }
  }

  const diffProfile = DIFFICULTY_PROFILES[difficulty];
  const tend = player.profile.tendencies;

  // Immediate kick-out when double-teamed!
  if (canDecideAction && isDoubleTeamed && bestPassTarget && bestPassScore > 26) {
    return {
      targetX: player.x,
      targetZ: player.z,
      sprint: false,
      action: preferAlleyOop ? 'ALLEY_OOP' : 'PASS',
      passTargetId: bestPassTarget.id,
    };
  }

  // Late shot-clock urgency (< 3.5s) -> hoist best available shot immediately
  if (shotClockSec <= 3.2 && distToHoop <= 9.2) {
    return {
      targetX: hoopX,
      targetZ: 0,
      sprint: false,
      action: 'SHOOT',
    };
  }

  if (canDecideAction) {
    // 1. Wide-open 3PT or Mid-Range pull-up scaled by player tendencies
    const isThreeRange = distToHoop >= COURT_DIMS.THREE_PT_RADIUS - 0.1 && distToHoop <= 8.6;
    const isMidRange = distToHoop >= 4.0 && distToHoop < COURT_DIMS.THREE_PT_RADIUS - 0.1;

    if (isThreeRange && defInfo.dist >= 2.15 && tend.shoot3 >= 58) {
      const pullProb = ((tend.shoot3 - 40) / 70) * (0.65 + diffProfile.aiShotGreenRate * 0.35);
      if (pullProb > 0.35 || shotClockSec < 8) {
        return { targetX: player.x, targetZ: player.z, sprint: false, action: 'SHOOT' };
      }
    }

    if (isMidRange && defInfo.dist >= 1.95 && player.profile.attributes.midRange >= 76) {
      return { targetX: player.x, targetZ: player.z, sprint: false, action: 'SHOOT' };
    }

    // 2. Finish at rim when inside 3.9m
    if (distToHoop <= 3.9) {
      return {
        targetX: hoopX,
        targetZ: 0,
        sprint: true,
        action: 'SHOOT',
      };
    }

    // 3. Pass to wide-open shooter or rim-runner if passFirst tendency or high score
    if (bestPassTarget && bestPassScore > (tend.passFirst >= 72 ? 38 : 54)) {
      return {
        targetX: player.x,
        targetZ: player.z,
        sprint: false,
        action: preferAlleyOop ? 'ALLEY_OOP' : 'PASS',
        passTargetId: bestPassTarget.id,
      };
    }

    // 4. Iso dribble move if tightly guarded on the perimeter
    if (defInfo.dist < 1.55 && player.adrenalinePips > 0 && player.profile.attributes.ballHandle >= 75) {
      return {
        targetX: hoopX - attackDirX * 3.0,
        targetZ: player.z + (player.z >= 0 ? -1.8 : 1.8),
        sprint: true,
        action: 'DRIBBLE_MOVE',
      };
    }
  }

  // 5. Drive downhill toward open lane or attack mismatch
  const laneZ =
    defInfo.defender && Math.abs(defInfo.defender.z - player.z) < 0.9
      ? player.z + (player.z >= 0 ? -2.1 : 2.1)
      : player.z * 0.55;
  const driveTarget = clampCourt(
    tend.driveRim >= tend.shoot3 ? hoopX - attackDirX * 1.4 : hoopX - attackDirX * 5.2,
    laneZ
  );

  return {
    targetX: driveTarget.x,
    targetZ: driveTarget.z,
    sprint: tend.driveRim >= 65 && player.adrenalinePips > 0,
    action: 'DRIVE',
  };
}

// ============================================================================
// DEFENSIVE SCHEMES (MAN, 2-3 ZONE, 3-2 ZONE, FULL PRESS, HALF-COURT TRAP)
// + MARKED ENEMY STAR DIRECTIVES (DOUBLE / DENY / OVER / PACK)
// ============================================================================

function getZoneAnchor(
  scheme: 'ZONE_2_3' | 'ZONE_3_2',
  slotIndex: number,
  defendHoopX: number,
  ballX: number,
  ballZ: number
): { x: number; z: number } {
  const dirFromHoop = defendHoopX > 0 ? -1 : 1; // direction toward midcourt
  const shiftZ = Math.max(-1.6, Math.min(1.6, ballZ * 0.24));
  const shiftX = Math.max(-0.9, Math.min(0.9, (ballX - defendHoopX) * 0.06));

  if (scheme === 'ZONE_2_3') {
    const anchors = [
      { x: defendHoopX + dirFromHoop * 6.4, z: -2.2 }, // Top Left Guard
      { x: defendHoopX + dirFromHoop * 6.4, z: 2.2 }, // Top Right Guard
      { x: defendHoopX + dirFromHoop * 2.5, z: -4.4 }, // Bottom Left Wing
      { x: defendHoopX + dirFromHoop * 2.5, z: 4.4 }, // Bottom Right Wing
      { x: defendHoopX + dirFromHoop * 1.9, z: 0.0 }, // Center Rim Anchor
    ];
    const base = anchors[slotIndex % anchors.length];
    return clampCourt(base.x + shiftX, base.z + shiftZ);
  }

  // ZONE_3_2
  const anchors = [
    { x: defendHoopX + dirFromHoop * 7.2, z: 0.0 }, // Top Point
    { x: defendHoopX + dirFromHoop * 5.6, z: -4.6 }, // Left Wing
    { x: defendHoopX + dirFromHoop * 5.6, z: 4.6 }, // Right Wing
    { x: defendHoopX + dirFromHoop * 2.3, z: -2.2 }, // Low Left Block
    { x: defendHoopX + dirFromHoop * 2.3, z: 2.2 }, // Low Right Block
  ];
  const base = anchors[slotIndex % anchors.length];
  return clampCourt(base.x + shiftX, base.z + shiftZ);
}

export function computeDefenseAI(params: {
  defender: AIPlayerSnap;
  teammates: AIPlayerSnap[];
  offense: AIPlayerSnap[];
  ballX: number;
  ballZ: number;
  ballHandler: AIPlayerSnap | null;
  ballInFlight: boolean;
  shooterIsRising: boolean;
  defendHoopX: number; // hoop this defender is protecting
  scheme: DefensiveSchemeId;
  markedStarId: string | null;
  markedStarTag: MarkCoverageTag;
  difficulty: MatchDifficulty;
  cpuDefenseSlider: number; // 20..90
  cpuSliders?: GameplaySliderSet;
  canAttemptEvent: boolean;
}): DefenseAICommand {
  const {
    defender,
    teammates,
    offense,
    ballX,
    ballZ,
    ballHandler,
    ballInFlight,
    shooterIsRising,
    defendHoopX,
    scheme,
    markedStarId,
    markedStarTag,
    difficulty,
    cpuDefenseSlider,
    cpuSliders,
    canAttemptEvent,
  } = params;

  const diff = DIFFICULTY_PROFILES[difficulty];
  const helpVal = cpuSliders ? cpuSliders.helpDefense : cpuDefenseSlider;
  const contestVal = cpuSliders ? cpuSliders.shotContestImpact : cpuDefenseSlider;
  const blockVal = cpuSliders ? cpuSliders.blockFrequency : cpuDefenseSlider;
  const stealVal = cpuSliders ? cpuSliders.stealSuccess : cpuDefenseSlider;
  const helpMul = 0.72 + (helpVal / 100) * 0.56;
  const contestMul = 0.75 + (contestVal / 100) * 0.5;
  const blockMul = 0.65 + (blockVal / 100) * 0.7;
  const stealMul = 0.65 + (stealVal / 100) * 0.7;

  // Matchup by slot index fallback
  const manTarget =
    offense.find((o) => o.id === defender.guardTargetId) ??
    offense[defender.slotIndex % Math.max(1, offense.length)] ??
    offense[0];

  if (!manTarget) {
    return {
      targetX: defendHoopX * 0.6,
      targetZ: 0,
      sprint: false,
      handsUp: false,
      intenseD: false,
      attemptSteal: false,
      attemptBlock: false,
      boxOut: false,
      guardTargetId: null,
    };
  }

  // Rebound box-out behavior while ball is in flight
  if (ballInFlight) {
    const dirToBall = Math.atan2(ballZ - defendHoopX * 0, ballX - defendHoopX);
    const boxX = manTarget.x * 0.55 + defendHoopX * 0.45;
    const boxZ = manTarget.z * 0.65;
    const clamped = clampCourt(boxX, boxZ);
    return {
      targetX: clamped.x + Math.cos(dirToBall) * 0.1,
      targetZ: clamped.z,
      sprint: true,
      handsUp: false,
      intenseD: true,
      attemptSteal: false,
      attemptBlock: false,
      boxOut: true,
      guardTargetId: manTarget.id,
    };
  }

  // Check Marked Enemy Star DOUBLE-TEAM or HALF_COURT_TRAP
  const markedStar = markedStarId ? offense.find((o) => o.id === markedStarId) ?? null : null;
  const isMarkedTarget = manTarget.id === markedStarId;

  // Determine if this defender should leave their assignment to double-team the marked star
  let shouldDoubleStar = false;
  if (
    markedStar &&
    markedStar.hasBall &&
    !isMarkedTarget &&
    (markedStarTag === 'DOUBLE' || scheme === 'HALF_COURT_TRAP')
  ) {
    const inFrontHalf = defendHoopX > 0 ? markedStar.x > 0 : markedStar.x < 0;
    if (inFrontHalf) {
      // Pick the single closest non-primary defender to trap
      let closestId = defender.id;
      let bestD = Math.hypot(defender.x - markedStar.x, defender.z - markedStar.z);
      for (let i = 0; i < teammates.length; i++) {
        const tm = teammates[i];
        if (tm.guardTargetId === markedStar.id) continue;
        const d = Math.hypot(tm.x - markedStar.x, tm.z - markedStar.z);
        if (d < bestD) {
          bestD = d;
          closestId = tm.id;
        }
      }
      shouldDoubleStar = closestId === defender.id && bestD < 8.5;
    }
  }

  let tx = manTarget.x;
  let tz = manTarget.z;
  let sprint = false;
  let intenseD = false;

  if (shouldDoubleStar && markedStar) {
    const dx = defendHoopX - markedStar.x;
    const dz = -markedStar.z;
    const len = Math.max(0.01, Math.hypot(dx, dz));
    tx = markedStar.x + (dx / len) * 1.05;
    tz = markedStar.z + (dz / len) * 1.05 + (defender.z >= markedStar.z ? 0.6 : -0.6);
    sprint = true;
    intenseD = true;
  } else if (scheme === 'ZONE_2_3' || scheme === 'ZONE_3_2') {
    const anchor = getZoneAnchor(scheme, defender.slotIndex, defendHoopX, ballX, ballZ);
    // Close out hard if the ball handler enters this defender's zone sector
    if (ballHandler && Math.hypot(ballHandler.x - anchor.x, ballHandler.z - anchor.z) < 3.6) {
      const dx = defendHoopX - ballHandler.x;
      const dz = -ballHandler.z;
      const len = Math.max(0.01, Math.hypot(dx, dz));
      tx = ballHandler.x + (dx / len) * 1.25;
      tz = ballHandler.z + (dz / len) * 1.25;
      intenseD = true;
      sprint = true;
    } else {
      tx = anchor.x;
      tz = anchor.z;
    }
  } else {
    // MAN_TO_MAN, FULL_COURT_PRESS, HALF_COURT_TRAP
    const dx = defendHoopX - manTarget.x;
    const dz = -manTarget.z;
    const len = Math.max(0.01, Math.hypot(dx, dz));

    let cushion = manTarget.hasBall ? 1.18 : 1.9;
    if (scheme === 'FULL_COURT_PRESS') {
      cushion = manTarget.hasBall ? 0.92 : 1.15;
      sprint = true;
    }

    // Apply Marked Star tag nuance
    if (isMarkedTarget) {
      if (markedStarTag === 'DENY') {
        cushion = 0.85;
        intenseD = true;
        sprint = true;
      } else if (markedStarTag === 'OVER') {
        cushion = 0.95;
        intenseD = true;
      } else if (markedStarTag === 'PACK') {
        cushion = 2.65; // Sag into the lane to wall off drives
      }
    }

    // Help-side sag when off-ball man is on weak side
    if (!manTarget.hasBall && (!isMarkedTarget || markedStarTag !== 'DENY')) {
      tx = manTarget.x + (dx / len) * cushion * 0.72 + (defendHoopX - manTarget.x) * 0.12;
      tz = manTarget.z * 0.82;
    } else {
      tx = manTarget.x + (dx / len) * cushion;
      tz = manTarget.z + (dz / len) * cushion;
      intenseD = manTarget.hasBall;
    }

    const distToSpot = Math.hypot(tx - defender.x, tz - defender.z);
    if (distToSpot > 2.2) sprint = true;
  }

  const clamped = clampCourt(tx, tz);
  const distToHandler = ballHandler
    ? Math.hypot(defender.x - ballHandler.x, defender.z - ballHandler.z)
    : 99;

  const handsUp = distToHandler < 2.25 * contestMul;
  const attemptBlock =
    Boolean(shooterIsRising) &&
    distToHandler < 2.15 * contestMul &&
    canAttemptEvent &&
    diff.aiBlockTimingAccuracy * blockMul > 0.35;

  const attemptSteal =
    !shooterIsRising &&
    Boolean(ballHandler) &&
    distToHandler < 1.38 * helpMul &&
    canAttemptEvent &&
    (defender.profile.tendencies.stealAggro / 100) * diff.aiStealAggroMul * stealMul > 0.62;

  return {
    targetX: clamped.x,
    targetZ: clamped.z,
    sprint,
    handsUp,
    intenseD,
    attemptSteal,
    attemptBlock,
    boxOut: false,
    guardTargetId: manTarget.id,
  };
}
