// ============================================================================
// PART 4 — 60 FPS DETERMINISTIC BASKETBALL PHYSICS & ProPLAY™ GAMEPLAY ENGINE
// ============================================================================

import type { ActiveMatchConfig, MatchDifficulty, SettingsState } from '../hybrid/types';
import type {
  BadgeId,
  HotZoneKey,
  HotZoneValue,
  PlayerProfile,
  TeamData,
} from '../hybrid/rosterTypes';
import {
  COURT_DIMS,
  type DefensiveSchemeId,
  type MarkCoverageTag,
  type MatchRenderState,
  type PlayerAnimState,
  type PlayerRenderState,
  type PlayVisionPlayId,
  type ShotTimingProfile,
  type VisualCueId,
} from './courtTypes';
import {
  addTakeoverProgress,
  createBadgeTriggerEvent,
  createTakeoverState,
  evaluateAnkleBreaker,
  evaluateFinishingBadges,
  evaluateFirstStepLaunch,
  evaluatePassBadges,
  evaluateReboundBadges,
  evaluateShootingBadges,
  evaluateStealAttempt,
  getEffectiveAttribute,
  igniteTakeover,
  tickTakeover,
  type BadgeTriggerEvent,
  type FinishMoveKind,
  type TakeoverState,
} from './BadgeEngine';
import {
  computeDefenseAI,
  computeOffenseAI,
  DIFFICULTY_PROFILES,
  type AIPlayerSnap,
} from './AISystem';
import {
  computeScreenPosition,
  createIdlePickAndRoll,
  createInitialTeammateGrade,
  InstantReplayBuffer,
  recordTeammateGradeEvent,
  selectLineupProfiles,
  tickTeammateGradeEvents,
  type LineupPresetId,
  type PickAndRollState,
  type SplashBannerItem,
  type SplashBannerTone,
  type TeammateGradeState,
} from './SimTacticsAndReplay';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

export type MatchPhase =
  | 'JUMP_BALL'
  | 'LIVE'
  | 'FREE_THROW'
  | 'INBOUND'
  | 'CHECK_BALL'
  | 'QUARTER_BREAK'
  | 'HALFTIME_SWAP'
  | 'GAME_OVER';

export type AlleyOopPromptKey = 'A' | 'B' | 'X' | 'Y';

export interface SimInputState {
  moveX: number; // -1..1 (court screen-relative or world X)
  moveZ: number; // -1..1
  sprint: boolean;
  shootHeld: boolean;
  quickProtectOrIntenseD: boolean; // Shift
  handsUp: boolean; // U
}

export interface PlayerBoxScore {
  playerId: string;
  name: string;
  teamSide: 'HOME' | 'AWAY';
  jersey: number;
  position: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  turnovers: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
  fouls: number;
  plusMinus: number;
  minutesSec: number;
  greens: number;
  greenThrees: number;
}

export interface MatchShotRecord {
  id: string;
  teamSide: 'HOME' | 'AWAY';
  shooterId: string;
  x: number; // -25..25 feet
  y: number; // 0..42 feet from baseline
  made: boolean;
  isThree: boolean;
  isGreen: boolean;
}

export interface TeamComparisonStats {
  homePaintPts: number;
  awayPaintPts: number;
  homeFastBreakPts: number;
  awayFastBreakPts: number;
  homeSecondChancePts: number;
  awaySecondChancePts: number;
  homeBenchPts: number;
  awayBenchPts: number;
  homeTurnovers: number;
  awayTurnovers: number;
  homeReb: number;
  awayReb: number;
  homeBiggestLead?: number;
  awayBiggestLead?: number;
  leadChanges?: number;
  timesTied?: number;
}

export interface ActiveMeterHud {
  kind: 'NONE' | 'JUMPSHOT' | 'RHYTHM_SHOT' | 'SKILL_DUNK' | 'FREE_THROW' | 'JUMP_BALL';
  progress: number; // 0..1
  targetCenter: number; // 0..1 sweet spot center
  greenHalfWidth: number; // half-width of green zone
  label: string;
  isRhythmArmed: boolean;
}

export interface AlleyOopPromptHud {
  active: boolean;
  promptKey: AlleyOopPromptKey;
  receiverName: string;
  remainingSec: number;
  durationSec: number;
}

export interface ShotFeedbackHud {
  timingLabel: string;
  rhythmLabel: string | null;
  contestLabel: string;
  contestPct: number;
  isGreen: boolean;
  made: boolean | null;
  ttlSec: number;
}

export interface RadarPlayerDot {
  id: string;
  teamSide: 'HOME' | 'AWAY';
  jerseyNumber: number;
  position: string;
  lastName: string;
  name: string;
  ovr: number;
  x: number;
  z: number;
  hasBall: boolean;
  isUserControlled: boolean;
  stamina: number;
}

export interface SimHudSnapshot {
  phase: MatchPhase;
  awayAbbr: string;
  homeAbbr: string;
  awayScore: number;
  homeScore: number;
  awayFouls: number;
  homeFouls: number;
  awayInBonus: boolean;
  homeInBonus: boolean;
  homeTimeouts: number;
  awayTimeouts: number;
  timeoutHuddleSec: number;
  quarter: number;
  quarterLabel: string;
  quarterClockSec: number;
  shotClockSec: number;
  possession: 'HOME' | 'AWAY';
  isBlacktop: boolean;
  targetScore: number | null;
  userTeamSide: 'HOME' | 'AWAY' | null;
  controlledPlayerId: string | null;
  controlledPlayerName: string;
  controlledPosition: string;
  controlledStamina: number; // 0..1
  controlledAdrenaline: number; // 0..3
  controlledTakeover: TakeoverState | null;
  activeShooterId: string | null;
  activeAlleyOopReceiverId: string | null;
  meter: ActiveMeterHud;
  alleyOopPrompt: AlleyOopPromptHud;
  shotFeedback: ShotFeedbackHud | null;
  badgeFeed: BadgeTriggerEvent[];
  teammateGrade: {
    score: number;
    letter: TeammateGradeState['letter'];
    events: TeammateGradeState['events'];
  };
  splashBanner: SplashBannerItem | null;
  pickAndRoll: PickAndRollState;
  activeLineupPreset: LineupPresetId;
  markedStar: { playerId: string | null; tag: MarkCoverageTag };
  isPaused: boolean;
  replayFrameCount: number;
  iconPassingActive: boolean;
  iconTargets: Array<{ slotNum: number; playerId: string; lastName: string; position: string }>;
  defensiveScheme: DefensiveSchemeId;
  activePlay: PlayVisionPlayId;
  shotTimingProfile: ShotTimingProfile;
  bannerText: string;
  winnerSide: 'HOME' | 'AWAY' | null;
  boxScore: PlayerBoxScore[];
  teamComparison: TeamComparisonStats;
  matchShots: MatchShotRecord[];
  radarPlayers: RadarPlayerDot[];
  radarBall: { x: number; z: number };
}

export interface SimSoundHooks {
  onDribble?: () => void;
  onSwish?: (isChain: boolean) => void;
  onGreenRelease?: () => void;
  onRimClank?: () => void;
  onDunkSlam?: () => void;
  onWhistle?: () => void;
  onBuzzer?: () => void;
  onCrowdRoar?: (intensity: number) => void;
  onAnnounce?: (line: string) => void;
}

export interface SimScenarioOverride {
  startQuarter?: number;
  startClockSec?: number;
  startHomeScore?: number;
  startAwayScore?: number;
  threePointValue?: number;
  twoPointValue?: number;
  speedMultiplier?: number;
  forceGreenOrMiss?: boolean;
  staminaBonus?: number;
  instantTakeover?: boolean;
}

export const VISUAL_CUE_TARGETS: Record<VisualCueId, number> = {
  JUMP: 0.48,
  SET_POINT: 0.68,
  PUSH: 0.8,
  RELEASE: 0.9,
};

const GRAVITY = -9.81;

// ============================================================================
// PURE DETERMINISTIC MATH HELPERS (EXPORTED FOR UNIT TESTING)
// ============================================================================

export function getHotZoneKeyForPosition(x: number, z: number, hoopX: number): HotZoneKey {
  const dx = Math.abs(hoopX - x);
  const dist = Math.hypot(hoopX - x, z);
  const sideSign = hoopX > 0 ? 1 : -1;
  const relZ = z * sideSign; // +Z right side facing hoop

  if (dist <= 3.1 || (dx <= 4.8 && Math.abs(z) <= 2.35)) {
    return 'paint';
  }
  const isThree =
    dist >= COURT_DIMS.THREE_PT_RADIUS - 0.12 ||
    (dx <= 4.3 && Math.abs(z) >= COURT_DIMS.CORNER_THREE_Z - 0.12);

  if (isThree) {
    if (dx <= 4.5 && Math.abs(z) >= 5.6) {
      return relZ < 0 ? 'leftCorner3' : 'rightCorner3';
    }
    if (Math.abs(relZ) <= 2.75) {
      return 'topKey3';
    }
    return relZ < 0 ? 'leftWing3' : 'rightWing3';
  }

  if (Math.abs(relZ) <= 2.45) {
    return 'topMid';
  }
  return relZ < 0 ? 'leftMid' : 'rightMid';
}

export interface ShotOutcomeParams {
  shooter: PlayerProfile;
  shooterSide: 'HOME' | 'AWAY';
  shooterTakeover: TakeoverState;
  defender: PlayerProfile | null;
  defenderSide: 'HOME' | 'AWAY';
  passer: PlayerProfile | null;
  distMeters: number;
  isThree: boolean;
  hotZoneState: HotZoneValue;
  releaseValue: number; // 0..1
  targetCenter: number; // 0..1 from Visual Cue
  timingProfile: ShotTimingProfile;
  shotMeterEnabled: boolean;
  isRhythmShot: boolean;
  rhythmTempoError: number; // 0 (perfect tempo) .. 0.5
  isCatchAndShoot: boolean;
  isOffDribble: boolean;
  contestPct: number; // 0..100
  stamina: number; // 0..1
  adrenalinePips: number; // 0..3
  difficulty: MatchDifficulty;
  userShotSlider: number; // 20..90
  randomRoll?: number; // deterministic injection for tests (0..1)
}

export interface ShotOutcomeResult {
  isGreen: boolean;
  made: boolean;
  makeProb: number;
  timingError: number;
  greenHalfWidth: number;
  timingLabel: string;
  rhythmLabel: string | null;
  contestPct: number;
  contestLabel: string;
  triggeredBadges: BadgeId[];
}

export function computeShotOutcome(
  p: ShotOutcomeParams,
  emitBadge?: (player: PlayerProfile, side: 'HOME' | 'AWAY', id: BadgeId, tier: import('../hybrid/rosterTypes').BadgeTier) => void
): ShotOutcomeResult {
  const ratingKey = p.isThree ? 'threePt' : p.distMeters <= 3.1 ? 'closeShot' : 'midRange';
  const effRating = getEffectiveAttribute(p.shooter, p.shooterTakeover, ratingKey);
  const diff = DIFFICULTY_PROFILES[p.difficulty];

  const badgeRes = evaluateShootingBadges(
    {
      shooter: p.shooter,
      shooterSide: p.shooterSide,
      defender: p.defender,
      defenderSide: p.defenderSide,
      passer: p.passer,
      distMeters: p.distMeters,
      isCatchAndShoot: p.isCatchAndShoot,
      isOffDribble: p.isOffDribble,
      contestPct: p.contestPct,
    },
    emitBadge
  );

  // Contest % adjusted by Challenger & Deadeye / Mini Marksman
  const rawContest = Math.max(0, Math.min(100, p.contestPct + badgeRes.defenderContestBoost * 65));
  const effContest = Math.max(0, rawContest * (1 - badgeRes.contestReduction));

  const contestLabel =
    effContest < 8
      ? 'Wide Open'
      : effContest < 22
        ? 'Open'
        : effContest < 48
          ? `Lightly Contested (${Math.round(effContest)}%)`
          : effContest < 75
            ? `Contested (${Math.round(effContest)}%)`
            : `Smothered (${Math.round(effContest)}%)`;

  // Hot / Cold zone bonus: +8% Hot, -6% Cold
  const hotZoneDelta = p.hotZoneState === 1 ? 0.08 : p.hotZoneState === -1 ? -0.06 : 0;

  // Stamina & 0-Adrenaline penalty
  const staminaPenalty = p.stamina < 0.35 ? (0.35 - p.stamina) * 0.28 : 0;
  const adrenalinePenalty = p.adrenalinePips <= 0 && p.isOffDribble ? 0.045 : 0;

  // Rhythm Shooting check (+12% Green Window when Timing + Tempo are clean)
  const rhythmGood = p.isRhythmShot && p.rhythmTempoError <= 0.14;
  const rhythmLabel = p.isRhythmShot
    ? p.rhythmTempoError <= 0.075
      ? 'RHYTHM: PERFECT'
      : p.rhythmTempoError <= 0.15
        ? 'RHYTHM: SLIGHTLY FAST'
        : 'RHYTHM: RUSHED'
    : null;

  // Base Green Window half-width (~0.045 .. 0.115)
  let greenHalf = 0.048 + ((effRating - 60) / 39) * 0.036;
  greenHalf *= diff.userGreenWindowMul;
  greenHalf *= 1 + badgeRes.offenseBonus * 0.65 + hotZoneDelta;
  greenHalf *= Math.max(0.32, 1 - (effContest / 100) * 0.72);
  greenHalf *= Math.max(0.65, 1 - staminaPenalty - adrenalinePenalty);

  // No-Meter +15% Green Window boost
  if (!p.shotMeterEnabled) {
    greenHalf *= 1.15;
  }
  // 2K26 Enhanced Rhythm Shooting +12% Green Window boost
  if (rhythmGood) {
    greenHalf *= 1.12;
  }
  // Profile scaling on green window
  if (p.timingProfile === 'HIGH_RISK') greenHalf *= 1.18;
  else if (p.timingProfile === 'GREEN_OR_MISS') greenHalf *= 1.06;
  else if (p.timingProfile === 'LOW_RISK') greenHalf *= 0.92;

  greenHalf = Math.max(0.018, Math.min(0.145, greenHalf));

  const signedErr = p.releaseValue - p.targetCenter;
  const absErr = Math.abs(signedErr);
  const isGreen = p.timingProfile !== 'REAL_PLAYER_PCT' && absErr <= greenHalf;

  // Base Make Probability (used for whites & Real Player %)
  const sliderDelta = (p.userShotSlider - 50) * 0.004;
  let baseProb =
    0.24 +
    ((effRating - 50) / 49) * 0.44 +
    badgeRes.offenseBonus * 0.45 +
    hotZoneDelta +
    sliderDelta -
    (effContest / 100) * 0.56 -
    staminaPenalty -
    adrenalinePenalty;

  if (rhythmGood) baseProb += 0.08;
  if (p.shooterTakeover.ignited && p.shooterTakeover.archetype === 'SHARP') {
    baseProb += 0.14;
  }

  let makeProb = Math.max(0.02, Math.min(0.96, baseProb));
  let made = false;

  if (p.timingProfile === 'REAL_PLAYER_PCT') {
    const roll = p.randomRoll !== undefined ? p.randomRoll : Math.random();
    made = roll <= makeProb;
  } else if (isGreen) {
    makeProb = 1.0;
    made = true;
  } else if (p.timingProfile === 'GREEN_OR_MISS') {
    makeProb = 0;
    made = false;
  } else {
    const closeness = Math.max(0, 1 - absErr / Math.max(0.24, greenHalf * 3.2));
    const profileMul =
      p.timingProfile === 'HIGH_RISK'
        ? 0.35
        : p.timingProfile === 'LOW_RISK'
          ? 0.98
          : 0.72; // NORMAL
    makeProb = Math.max(0.02, Math.min(0.88, makeProb * closeness * profileMul));
    const roll = p.randomRoll !== undefined ? p.randomRoll : Math.random();
    made = roll <= makeProb;
  }

  let timingLabel = 'EXCELLENT';
  if (!isGreen) {
    if (p.timingProfile === 'REAL_PLAYER_PCT') {
      timingLabel = made ? 'REAL FG% MAKE' : 'REAL FG% MISS';
    } else if (absErr <= greenHalf * 1.9) {
      timingLabel = signedErr < 0 ? 'SLIGHTLY EARLY' : 'SLIGHTLY LATE';
    } else {
      timingLabel = signedErr < 0 ? 'EARLY' : 'LATE';
    }
  } else {
    timingLabel = 'GREEN · EXCELLENT';
  }

  return {
    isGreen,
    made,
    makeProb,
    timingError: signedErr,
    greenHalfWidth: greenHalf,
    timingLabel,
    rhythmLabel,
    contestPct: Math.round(effContest),
    contestLabel,
    triggeredBadges: badgeRes.triggeredBadges,
  };
}

export function computeSkillDunkGreenWindow(
  finisher: PlayerProfile,
  defender: PlayerProfile | null,
  dunkMeterBadgeBonus: number,
  defenderDeterBonus: number
): number {
  const dunkAttr = finisher.attributes.drivingDunk;
  const intDef = defender ? defender.attributes.interiorDef : 55;
  let half = 0.085 + ((dunkAttr - 70) / 29) * 0.045 + dunkMeterBadgeBonus * 0.14;
  // Shrink vs strong paint protection & Paint Patroller
  half -= Math.max(0, (intDef - 65) / 34) * 0.042;
  half -= defenderDeterBonus * 0.12;
  return Math.max(0.032, Math.min(0.145, half));
}

// ============================================================================
// INTERNAL SIMULATION ACTOR
// ============================================================================

interface SimPlayerActor {
  render: PlayerRenderState;
  profile: PlayerProfile;
  takeover: TakeoverState;
  teamSlot: number; // 0..4
  vx: number;
  vz: number;
  actionTimer: number;
  stunTimer: number; // Ankle breaker or Defender Jail
  dribbleCooldown: number;
  stealCooldown: number;
  blockCooldown: number;
  jumpRecoveryTimer: number;
  lastCatchTime: number;
  lastPasserId: string | null;
  paintThreeSecTimer: number;
  jumpCountInPaint: number;
  aiThinkTimer: number;
  boxScore: PlayerBoxScore;
}

interface ActiveShotFlight {
  shooterId: string;
  shooterSide: 'HOME' | 'AWAY';
  passerId: string | null;
  pointsValue: number;
  isThree: boolean;
  isFreeThrow: boolean;
  isDunk: boolean;
  isAlleyOop: boolean;
  isGreen: boolean;
  willMake: boolean;
  targetHoopX: number;
  startX: number;
  startY: number;
  startZ: number;
  elapsed: number;
  duration: number;
  peakHeight: number;
  resolved: boolean;
  isReboundLive: boolean;
}

interface ActivePassFlight {
  passerId: string;
  receiverId: string;
  passerSide: 'HOME' | 'AWAY';
  kind: 'CHEST' | 'BOUNCE' | 'WRAP' | 'ALLEY_OOP';
  startX: number;
  startY: number;
  startZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  elapsed: number;
  duration: number;
  alleyOopKey: AlleyOopPromptKey;
  alleyOopPressed: boolean;
  alleyOopSucceeded: boolean;
  requiresPrompt: boolean;
}

interface ActiveFreeThrowSeq {
  shooterId: string;
  side: 'HOME' | 'AWAY';
  shotsRemaining: number;
  totalShots: number;
  meterActive: boolean;
  meterProgress: number;
  meterDir: 1 | -1;
  waitingFlight: boolean;
  aiReleaseTimer: number;
}

// ============================================================================
// MAIN SIMULATION CLASS
// ============================================================================

export class BasketballSimulation {
  public readonly renderState: MatchRenderState;

  private config: ActiveMatchConfig;
  private settings: SettingsState;
  private hooks: SimSoundHooks;
  private awayTeam: TeamData;
  private homeTeam: TeamData;

  private actors: SimPlayerActor[] = [];
  private actorMap = new Map<string, SimPlayerActor>();

  private phase: MatchPhase = 'JUMP_BALL';
  private phaseTimer = 0;
  private simTimeSec = 0;
  private playClockSec = 0;
  private backcourtClockSec = 0;
  private crossedHalfCourt = false;
  private halftimeSwapped = false;

  private homeFoulsQtr = 0;
  private awayFoulsQtr = 0;
  private userTeamSide: 'HOME' | 'AWAY' | null = 'HOME';
  private controlledPlayerId: string | null = null;
  private defensiveScheme: DefensiveSchemeId = 'MAN_TO_MAN';
  private iconPassingActive = false;

  // Input & Shot / Dunk Charging State
  private input: SimInputState = {
    moveX: 0,
    moveZ: 0,
    sprint: false,
    shootHeld: false,
    quickProtectOrIntenseD: false,
    handsUp: false,
  };
  private prevShootHeld = false;
  private lastShootTapTime = -10;
  private lastBounceTapTime = -10;
  private lastLobTapTime = -10;

  private shotChargeActive = false;
  private shotChargeProgress = 0;
  private shotChargeKind: 'JUMPSHOT' | 'RHYTHM_SHOT' | 'SKILL_DUNK' = 'JUMPSHOT';
  private shotChargeDuration = 0.62;
  private shotChargeTargetCenter = 0.68;
  private shotChargeGreenHalf = 0.065;
  private shotChargeFinishMove: FinishMoveKind | null = null;
  private shotChargeHasDunkMeter = false;
  private rhythmDownTime = 0;
  private rhythmIsArmed = false;

  // Jump Ball Mini-Game State
  private jumpBallProgress = 0;
  private jumpBallTossElapsed = 0;
  private jumpBallUserAttempted = false;
  private jumpBallUserTimingErr = 1;

  // Ball Flights & Free Throws
  private activeShot: ActiveShotFlight | null = null;
  private activePass: ActivePassFlight | null = null;
  private activeFreeThrow: ActiveFreeThrowSeq | null = null;
  private nextInboundSide: 'HOME' | 'AWAY' = 'HOME';
  private pendingCheckBall = false;

  // Feedback, Badges & Part 5 Battlefield HUD State
  private badgeSeq = 0;
  private badgeFeed: BadgeTriggerEvent[] = [];
  private shotFeedback: ShotFeedbackHud | null = null;
  private winnerSide: 'HOME' | 'AWAY' | null = null;
  private dribbleAudioCooldown = 0;
  private isOutdoorChainNet = false;

  private homeTimeouts = 7;
  private awayTimeouts = 7;
  private timeoutHuddleSec = 0;
  private teammateGrade: TeammateGradeState = createInitialTeammateGrade();
  private splashBanner: SplashBannerItem | null = null;
  private splashSeq = 0;
  private pickAndRoll: PickAndRollState = createIdlePickAndRoll();
  private activeLineupPreset: LineupPresetId = 'STARTERS';
  private paused = false;
  private replayBuffer = new InstantReplayBuffer(600);
  private matchShots: MatchShotRecord[] = [];
  private teamComp: TeamComparisonStats = {
    homePaintPts: 0,
    awayPaintPts: 0,
    homeFastBreakPts: 0,
    awayFastBreakPts: 0,
    homeSecondChancePts: 0,
    awaySecondChancePts: 0,
    homeBenchPts: 0,
    awayBenchPts: 0,
    homeTurnovers: 0,
    awayTurnovers: 0,
    homeReb: 0,
    awayReb: 0,
    homeBiggestLead: 0,
    awayBiggestLead: 0,
    leadChanges: 0,
    timesTied: 1,
  };
  private lastPossessionWasOffReb = false;
  private possessionElapsedSec = 0;
  private liveBackupBeforeReplay: {
    ballX: number;
    ballY: number;
    ballZ: number;
    ballInFlight: boolean;
    holderPlayerId: string | null;
    players: Array<{
      id: string;
      x: number;
      y: number;
      z: number;
      facingRad: number;
      animState: PlayerAnimState;
      animPhase: number;
      shotProgress: number;
      hasBall: boolean;
    }>;
  } | null = null;

  private scenarioOverride: SimScenarioOverride | null = null;

  constructor(params: {
    awayTeam: TeamData;
    homeTeam: TeamData;
    config: ActiveMatchConfig;
    settings: SettingsState;
    hooks?: SimSoundHooks;
    scenarioOverride?: SimScenarioOverride | null;
  }) {
    this.awayTeam = params.awayTeam;
    this.homeTeam = params.homeTeam;
    this.config = { ...params.config };
    this.settings = params.settings;
    this.hooks = params.hooks ?? {};
    this.scenarioOverride = params.scenarioOverride ?? null;
    this.isOutdoorChainNet =
      params.config.venue === 'BLACKTOP_CAGE' ||
      params.config.venue === 'SKYLINE_PARK' ||
      params.config.venue === 'RIVET_CITY' ||
      params.config.venue === 'SUNSET_BEACH' ||
      params.config.venue === 'OLD_TOWN';

    this.userTeamSide =
      params.config.sideControl === 'CPU_VS_CPU' ? null : params.config.sideControl;

    this.renderState = this.buildInitialRenderState();
    this.spawnPlayers();
    this.beginTipOffOrBlacktop();
    this.applyScenarioOverrides();
  }

  private applyScenarioOverrides(): void {
    const ov = this.scenarioOverride;
    if (!ov) return;
    if (typeof ov.startQuarter === 'number') {
      this.renderState.quarter = ov.startQuarter;
    }
    if (typeof ov.startClockSec === 'number') {
      this.renderState.quarterClockSec = ov.startClockSec;
    }
    if (typeof ov.startHomeScore === 'number') {
      this.renderState.homeScore = ov.startHomeScore;
    }
    if (typeof ov.startAwayScore === 'number') {
      this.renderState.awayScore = ov.startAwayScore;
    }
    if (
      typeof ov.startQuarter === 'number' ||
      typeof ov.startHomeScore === 'number' ||
      typeof ov.startClockSec === 'number'
    ) {
      const startSide = this.userTeamSide ?? 'HOME';
      this.phase = 'LIVE';
      this.renderState.possession = startSide;
      const sideActors = this.getSideActors(startSide);
      if (sideActors.length > 0) {
        this.grantPossession(sideActors[0], false);
        this.controlledPlayerId = sideActors[0].render.id;
      }
      this.renderState.lastEventLabel = 'SCENARIO LIVE — CRUNCH TIME!';
    }
    if (ov.instantTakeover && this.userTeamSide) {
      const userActors = this.getSideActors(this.userTeamSide);
      if (userActors[0]) {
        addTakeoverProgress(userActors[0].takeover, 100);
        igniteTakeover(userActors[0].takeover);
        userActors[0].render.takeoverLevel = 1;
      }
    }
  }

  public isBlacktopMode(): boolean {
    return this.config.playersPerSide < 5 || this.config.targetScore !== null;
  }

  public syncSettings(next: SettingsState): void {
    this.settings = next;
    this.renderState.activePlay = next.visual.playVision;
  }

  public setInput(partial: Partial<SimInputState>): void {
    Object.assign(this.input, partial);
  }

  public setDefensiveScheme(scheme: DefensiveSchemeId): void {
    this.defensiveScheme = scheme;
    this.renderState.lastEventLabel = `DEFENSE: ${scheme.replace(/_/g, ' ')}`;
  }

  public setActivePlay(play: PlayVisionPlayId): void {
    this.renderState.activePlay = play;
    this.renderState.lastEventLabel = `PLAY: ${play.replace(/_/g, ' ')}`;
  }

  public setMarkedStar(playerId: string | null, tag: MarkCoverageTag): void {
    this.renderState.markedStar = { playerId, tag };
    if (playerId) {
      const target = this.actorMap.get(playerId);
      if (target) {
        this.renderState.lastEventLabel = `🎯 MARKED ${target.render.lastName.toUpperCase()}: ${tag}`;
      }
    } else {
      this.renderState.lastEventLabel = 'DEFENSIVE MARK CLEARED';
    }
  }

  public cycleMarkedStarTag(): MarkCoverageTag {
    const order: MarkCoverageTag[] = ['DOUBLE', 'DENY', 'OVER', 'PACK'];
    const cur = order.indexOf(this.renderState.markedStar.tag);
    const next = order[(cur + 1) % order.length];
    this.renderState.markedStar.tag = next;
    return next;
  }

  public setPaused(nextPaused: boolean): void {
    if (nextPaused === this.paused) return;
    this.paused = nextPaused;
    if (!nextPaused) {
      this.restoreLiveFromReplay();
    }
  }

  public isPaused(): boolean {
    return this.paused;
  }

  public getReplayFrameCount(): number {
    return this.replayBuffer.getFrameCount();
  }

  public previewReplayFrame(frameIndex: number): boolean {
    if (!this.liveBackupBeforeReplay) {
      this.liveBackupBeforeReplay = {
        ballX: this.renderState.ball.x,
        ballY: this.renderState.ball.y,
        ballZ: this.renderState.ball.z,
        ballInFlight: this.renderState.ball.inFlight,
        holderPlayerId: this.renderState.ball.holderPlayerId,
        players: this.renderState.players.map((pl) => ({
          id: pl.id,
          x: pl.x,
          y: pl.y,
          z: pl.z,
          facingRad: pl.facingRad,
          animState: pl.animState,
          animPhase: pl.animPhase,
          shotProgress: pl.shotProgress,
          hasBall: pl.hasBall,
        })),
      };
    }
    return this.replayBuffer.applyFrame(frameIndex, this.renderState);
  }

  public restoreLiveFromReplay(): void {
    const bak = this.liveBackupBeforeReplay;
    if (!bak) return;
    this.renderState.ball.x = bak.ballX;
    this.renderState.ball.y = bak.ballY;
    this.renderState.ball.z = bak.ballZ;
    this.renderState.ball.inFlight = bak.ballInFlight;
    this.renderState.ball.holderPlayerId = bak.holderPlayerId;
    for (let i = 0; i < bak.players.length; i++) {
      const snap = bak.players[i];
      const pl = this.renderState.players.find((p) => p.id === snap.id);
      if (pl) {
        pl.x = snap.x;
        pl.y = snap.y;
        pl.z = snap.z;
        pl.facingRad = snap.facingRad;
        pl.animState = snap.animState;
        pl.animPhase = snap.animPhase;
        pl.shotProgress = snap.shotProgress;
        pl.hasBall = snap.hasBall;
      }
    }
    this.liveBackupBeforeReplay = null;
  }

  public pushSplashBanner(
    title: string,
    subtitle: string,
    tone: SplashBannerTone = 'GOLD',
    ttlSec = 2.0
  ): void {
    this.splashSeq += 1;
    this.splashBanner = {
      id: this.splashSeq,
      title,
      subtitle,
      tone,
      ttlSec,
    };
  }

  public addGradeEvent(label: string, delta: number): void {
    recordTeammateGradeEvent(this.teammateGrade, label, delta);
  }

  public callPickAndRoll(): boolean {
    if (this.phase !== 'LIVE') return false;
    const handler = this.getBallHandler();
    if (!handler) return false;
    const mates = this.getSideActors(handler.render.teamSide).filter(
      (a) => a.render.id !== handler.render.id
    );
    if (mates.length === 0) return false;

    // Prefer big men (C / PF) nearest to the ball-handler
    let best = mates[0];
    let bestScore = -9999;
    for (let i = 0; i < mates.length; i++) {
      const m = mates[i];
      const dist = Math.hypot(m.render.x - handler.render.x, m.render.z - handler.render.z);
      const posBonus = m.render.position === 'C' ? 5 : m.render.position === 'PF' ? 4 : 0;
      const sc = posBonus - dist * 0.45;
      if (sc > bestScore) {
        bestScore = sc;
        best = m;
      }
    }

    const attackDirX = this.getAttackDirForSide(handler.render.teamSide);
    const angleDeg = this.pickAndRoll.active ? this.pickAndRoll.angleDeg : 45;
    const action = this.pickAndRoll.active ? this.pickAndRoll.action : 'ROLL';
    const pos = computeScreenPosition(handler.render.x, handler.render.z, attackDirX, angleDeg);

    this.pickAndRoll = {
      active: true,
      screenerId: best.render.id,
      screenerName: best.render.lastName,
      handlerId: handler.render.id,
      angleDeg,
      action,
      screenX: pos.x,
      screenZ: pos.z,
      elapsedSec: 0,
      screenSet: false,
      screenAssistWindowSec: 0,
    };
    this.renderState.activePlay = 'PICK_AND_ROLL';
    this.renderState.lastEventLabel = `SCREEN CALLED: ${best.render.lastName.toUpperCase()} (${angleDeg}° ${action})`;
    return true;
  }

  public flipPickAndRollAngle(): 45 | 180 {
    const nextAngle: 45 | 180 = this.pickAndRoll.angleDeg === 45 ? 180 : 45;
    this.pickAndRoll.angleDeg = nextAngle;
    const handler = this.getBallHandler();
    if (this.pickAndRoll.active && handler) {
      const dir = this.getAttackDirForSide(handler.render.teamSide);
      const pos = computeScreenPosition(handler.render.x, handler.render.z, dir, nextAngle);
      this.pickAndRoll.screenX = pos.x;
      this.pickAndRoll.screenZ = pos.z;
      this.renderState.lastEventLabel = `SCREEN FLIPPED TO ${nextAngle}° (${this.pickAndRoll.action})`;
    }
    return nextAngle;
  }

  public togglePickAndRollAction(): 'ROLL' | 'FADE' {
    const nextAction: 'ROLL' | 'FADE' = this.pickAndRoll.action === 'ROLL' ? 'FADE' : 'ROLL';
    this.pickAndRoll.action = nextAction;
    if (this.pickAndRoll.active) {
      this.renderState.lastEventLabel = `PICK & ${nextAction} (${this.pickAndRoll.angleDeg}°)`;
    }
    return nextAction;
  }

  public cancelPickAndRoll(): void {
    this.pickAndRoll.active = false;
    this.pickAndRoll.screenSet = false;
  }

  public callTimeout(sideOverride?: 'HOME' | 'AWAY'): boolean {
    const side: 'HOME' | 'AWAY' = sideOverride ?? this.userTeamSide ?? this.renderState.possession;
    if (side === 'HOME') {
      if (this.homeTimeouts <= 0) return false;
      this.homeTimeouts -= 1;
    } else {
      if (this.awayTimeouts <= 0) return false;
      this.awayTimeouts -= 1;
    }

    // Restore stamina across both benches during 3-second tactical huddle
    for (let i = 0; i < this.actors.length; i++) {
      this.actors[i].render.stamina = Math.min(1.0, this.actors[i].render.stamina + 0.38);
      this.actors[i].render.adrenalinePips = 3;
    }
    this.timeoutHuddleSec = 3.0;
    this.shotChargeActive = false;
    this.activePass = null;
    this.activeShot = null;
    this.cancelPickAndRoll();
    const abbr = side === 'HOME' ? this.homeTeam.abbr : this.awayTeam.abbr;
    this.renderState.lastEventLabel = `TIMEOUT ${abbr} · STAMINA RESTORED!`;
    this.pushSplashBanner(`TIMEOUT · ${abbr}`, '3-SECOND QUICK HUDDLE · STAMINA RESTORED', 'CYAN', 2.8);
    this.hooks.onWhistle?.();
    this.hooks.onAnnounce?.(`Timeout called by ${abbr}. Players catch their breath.`);
    return true;
  }

  public applyLineupPreset(preset: LineupPresetId, sideOverride?: 'HOME' | 'AWAY'): boolean {
    const side: 'HOME' | 'AWAY' = sideOverride ?? this.userTeamSide ?? 'HOME';
    const team = side === 'HOME' ? this.homeTeam : this.awayTeam;
    const actors = this.getSideActors(side);
    const selected = selectLineupProfiles(team.roster, preset, actors.length);
    if (selected.length === 0) return false;

    for (let i = 0; i < actors.length; i++) {
      const actor = actors[i];
      const nextProf = selected[i];
      if (!nextProf) continue;
      const changed = actor.profile.id !== nextProf.id;
      actor.profile = nextProf;
      const parts = nextProf.name.trim().split(/\s+/);
      actor.render.name = nextProf.name;
      actor.render.lastName = parts[parts.length - 1] ?? nextProf.name;
      actor.render.jerseyNumber = nextProf.jerseyNumber;
      actor.render.position = nextProf.position;
      actor.render.heightInches = nextProf.heightInches;
      actor.render.weightLbs = nextProf.weightLbs;
      actor.render.wingspanInches = nextProf.wingspanInches;
      actor.render.hotZones = nextProf.hotZones;
      actor.boxScore.name = nextProf.name;
      actor.boxScore.jersey = nextProf.jerseyNumber;
      actor.boxScore.position = nextProf.position;
      if (changed) {
        actor.render.stamina = Math.max(actor.render.stamina, 0.94);
        actor.takeover = createTakeoverState(nextProf);
      }
    }
    this.activeLineupPreset = preset;
    this.renderState.lastEventLabel = `LINEUP SUB: ${preset} UNIT ON FLOOR`;
    return true;
  }

  // ==========================================================================
  // INITIALIZATION & ROSTER SPAWNING
  // ==========================================================================

  private buildInitialRenderState(): MatchRenderState {
    const qSec = this.config.quarterLengthMin * 60;
    return {
      awayAbbr: this.awayTeam.abbr,
      homeAbbr: this.homeTeam.abbr,
      awayScore: 0,
      homeScore: 0,
      quarter: 1,
      quarterClockSec: qSec,
      shotClockSec: 24,
      possession: 'HOME',
      attackDirX: 1,
      players: [],
      ball: {
        x: 0,
        y: 1.35,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        spinX: 0,
        spinZ: 0,
        holderPlayerId: null,
        dribbleHand: 'right',
        inFlight: false,
        isGreenShot: false,
      },
      hoops: {
        leftRimFlex: 0,
        rightRimFlex: 0,
        leftNetRipple: 0,
        rightNetRipple: 0,
        leftNetTime: 0,
        rightNetTime: 0,
        buzzerLit: false,
      },
      activePlay: this.settings.visual.playVision,
      markedStar: { playerId: null, tag: 'DOUBLE' },
      crowdExcitement: 0.35,
      cameraShake: 0,
      jumbotronBanner: `${this.awayTeam.abbr} AT ${this.homeTeam.abbr} · TIP-OFF`,
      lastEventLabel: 'CENTER COURT JUMP BALL',
    };
  }

  private spawnPlayers(): void {
    this.actors = [];
    this.actorMap.clear();
    const count = Math.max(1, Math.min(5, this.config.playersPerSide));

    const addSide = (team: TeamData, side: 'HOME' | 'AWAY', slotOffset: number) => {
      const starters = team.roster.slice(0, count);
      for (let i = 0; i < starters.length; i++) {
        const prof = starters[i];
        const parts = prof.name.trim().split(/\s+/);
        const lastName = parts[parts.length - 1] ?? prof.name;
        const render: PlayerRenderState = {
          id: `${side.toLowerCase()}_${i}_${prof.id}`,
          slotIndex: slotOffset + i,
          teamSide: side,
          name: prof.name,
          lastName,
          jerseyNumber: prof.jerseyNumber,
          position: prof.position,
          heightInches: prof.heightInches,
          weightLbs: prof.weightLbs,
          wingspanInches: prof.wingspanInches,
          appearance: prof.appearance,
          hotZones: prof.hotZones,
          x: side === 'HOME' ? -2.2 - i * 1.1 : 2.2 + i * 1.1,
          y: 0,
          z: (i - 2) * 1.5,
          facingRad: side === 'HOME' ? 0 : Math.PI,
          speed: 0,
          animState: 'IDLE',
          animPhase: i * 0.7,
          shotProgress: 0,
          hasBall: false,
          isUserControlled: false,
          stamina: 1.0,
          adrenalinePips: 3,
          takeoverLevel: 0,
          shotQuality2K14: 'NONE',
          guardTargetId: null,
          visible: true,
        };

        const actor: SimPlayerActor = {
          render,
          profile: prof,
          takeover: createTakeoverState(prof),
          teamSlot: i,
          vx: 0,
          vz: 0,
          actionTimer: 0,
          stunTimer: 0,
          dribbleCooldown: 0,
          stealCooldown: 0,
          blockCooldown: 0,
          jumpRecoveryTimer: 0,
          lastCatchTime: -10,
          lastPasserId: null,
          paintThreeSecTimer: 0,
          jumpCountInPaint: 0,
          aiThinkTimer: 0.25 + i * 0.08,
          boxScore: {
            playerId: render.id,
            name: prof.name,
            teamSide: side,
            jersey: prof.jerseyNumber,
            position: prof.position,
            pts: 0,
            reb: 0,
            ast: 0,
            stl: 0,
            blk: 0,
            turnovers: 0,
            fgm: 0,
            fga: 0,
            tpm: 0,
            tpa: 0,
            ftm: 0,
            fta: 0,
            fouls: 0,
            plusMinus: 0,
            minutesSec: 0,
            greens: 0,
            greenThrees: 0,
          },
        };
        this.actors.push(actor);
        this.actorMap.set(render.id, actor);
      }
    };

    addSide(this.homeTeam, 'HOME', 0);
    addSide(this.awayTeam, 'AWAY', 5);
    this.renderState.players = this.actors.map((a) => a.render);

    // Pair defensive matchups 1-to-1 and mark opponent's highest OVR star
    const homeActors = this.getSideActors('HOME');
    const awayActors = this.getSideActors('AWAY');
    for (let i = 0; i < homeActors.length; i++) {
      if (awayActors[i]) {
        homeActors[i].render.guardTargetId = awayActors[i].render.id;
        awayActors[i].render.guardTargetId = homeActors[i].render.id;
      }
    }

    const oppSide: 'HOME' | 'AWAY' = this.userTeamSide === 'AWAY' ? 'HOME' : 'AWAY';
    const oppActors = this.getSideActors(oppSide);
    let star = oppActors[0];
    for (let i = 1; i < oppActors.length; i++) {
      if (oppActors[i].profile.ovr > star.profile.ovr) star = oppActors[i];
    }
    if (star) {
      this.renderState.markedStar = { playerId: star.render.id, tag: 'DOUBLE' };
    }

    this.selectUserControlledPlayer(this.userTeamSide === 'AWAY' ? awayActors[0] : homeActors[0]);
  }

  private getSideActors(side: 'HOME' | 'AWAY'): SimPlayerActor[] {
    return this.actors.filter((a) => a.render.teamSide === side);
  }

  private getAttackDirForSide(side: 'HOME' | 'AWAY'): 1 | -1 {
    if (this.isBlacktopMode()) {
      return 1; // Half-court streetball always attacks +X hoop
    }
    const baseDir: 1 | -1 = side === 'HOME' ? 1 : -1;
    return this.halftimeSwapped ? (baseDir === 1 ? -1 : 1) : baseDir;
  }

  private selectUserControlledPlayer(actor: SimPlayerActor | null): void {
    for (let i = 0; i < this.actors.length; i++) {
      this.actors[i].render.isUserControlled = false;
    }
    if (!this.userTeamSide || !actor || actor.render.teamSide !== this.userTeamSide) {
      this.controlledPlayerId = null;
      return;
    }
    actor.render.isUserControlled = true;
    this.controlledPlayerId = actor.render.id;
  }

  private getControlledActor(): SimPlayerActor | null {
    if (!this.controlledPlayerId) return null;
    return this.actorMap.get(this.controlledPlayerId) ?? null;
  }

  private getBallHandler(): SimPlayerActor | null {
    const id = this.renderState.ball.holderPlayerId;
    if (!id) return null;
    return this.actorMap.get(id) ?? null;
  }

  private emitBadge(
    player: PlayerProfile,
    teamSide: 'HOME' | 'AWAY',
    badgeId: BadgeId,
    tier: import('../hybrid/rosterTypes').BadgeTier
  ): void {
    // Deduplicate identical badge pop-ups within 0.6s
    const existing = this.badgeFeed.find(
      (b) => b.playerId === player.id && b.badgeId === badgeId && b.ttlSec > 2.2
    );
    if (existing) return;
    const ev = createBadgeTriggerEvent(player, teamSide, badgeId, tier, ++this.badgeSeq);
    this.badgeFeed = [ev, ...this.badgeFeed].slice(0, 6);
  }

  // ==========================================================================
  // OPENING JUMP BALL TIP-OFF & BLACKTOP CHECK-BALL
  // ==========================================================================

  private beginTipOffOrBlacktop(): void {
    if (this.isBlacktopMode()) {
      this.startCheckBall('HOME', 'CHECK BALL · STREETBALL TIP');
      return;
    }

    this.phase = 'JUMP_BALL';
    this.jumpBallProgress = 0;
    this.jumpBallTossElapsed = 0;
    this.jumpBallUserAttempted = false;
    this.jumpBallUserTimingErr = 1;
    this.activeShot = null;
    this.activePass = null;
    this.renderState.ball.holderPlayerId = null;
    this.renderState.ball.inFlight = true;
    this.renderState.ball.x = 0;
    this.renderState.ball.y = 1.4;
    this.renderState.ball.z = 0;

    // Position Centers at center circle, guards & wings around circle
    const home = this.getSideActors('HOME');
    const away = this.getSideActors('AWAY');
    const homeCenter = home[home.length - 1];
    const awayCenter = away[away.length - 1];

    for (let i = 0; i < home.length; i++) {
      const a = home[i];
      if (a === homeCenter) {
        a.render.x = -0.85;
        a.render.z = 0;
        a.render.facingRad = 0;
      } else {
        const ang = (i - 1.5) * 0.65;
        a.render.x = -2.8 - Math.abs(Math.sin(ang)) * 1.1;
        a.render.z = Math.sin(ang) * 3.1;
        a.render.facingRad = 0;
      }
      a.render.animState = 'IDLE';
      a.render.hasBall = false;
    }

    for (let i = 0; i < away.length; i++) {
      const a = away[i];
      if (a === awayCenter) {
        a.render.x = 0.85;
        a.render.z = 0;
        a.render.facingRad = Math.PI;
      } else {
        const ang = (i - 1.5) * 0.65;
        a.render.x = 2.8 + Math.abs(Math.sin(ang)) * 1.1;
        a.render.z = Math.sin(ang) * 3.1;
        a.render.facingRad = Math.PI;
      }
      a.render.animState = 'IDLE';
      a.render.hasBall = false;
    }

    if (this.userTeamSide === 'HOME' && homeCenter) {
      this.selectUserControlledPlayer(homeCenter);
    } else if (this.userTeamSide === 'AWAY' && awayCenter) {
      this.selectUserControlledPlayer(awayCenter);
    }

    this.renderState.lastEventLabel = 'TIP-OFF! TAP [SPACE] AT PEAK!';
    this.pushSplashBanner('TIP-OFF', `${this.awayTeam.abbr} AT ${this.homeTeam.abbr}`, 'GOLD', 2.0);
    this.hooks.onWhistle?.();
    this.hooks.onAnnounce?.('Welcome to tip-off! Tap shoot at the peak for opening possession.');
  }

  public triggerJumpBallAttempt(): void {
    if (this.phase !== 'JUMP_BALL' || this.jumpBallUserAttempted) return;
    this.jumpBallUserAttempted = true;
    this.jumpBallUserTimingErr = Math.abs(this.jumpBallProgress - 0.84);
    const ctrl = this.getControlledActor();
    if (ctrl) {
      ctrl.render.animState = 'JUMP_BLOCK';
      ctrl.render.y = 0.72;
    }
    this.resolveJumpBall();
  }

  private resolveJumpBall(): void {
    const home = this.getSideActors('HOME');
    const away = this.getSideActors('AWAY');
    const hC = home[home.length - 1];
    const aC = away[away.length - 1];

    const hVert = (hC?.profile.attributes.vertical ?? 75) + (hC?.profile.heightInches ?? 82);
    const aVert = (aC?.profile.attributes.vertical ?? 75) + (aC?.profile.heightInches ?? 82);

    let winner: 'HOME' | 'AWAY' = hVert >= aVert ? 'HOME' : 'AWAY';
    if (this.userTeamSide) {
      const userBonus = this.jumpBallUserAttempted
        ? Math.max(-25, 34 - this.jumpBallUserTimingErr * 120)
        : -18;
      const homeScore = hVert + (this.userTeamSide === 'HOME' ? userBonus : 0);
      const awayScore = aVert + (this.userTeamSide === 'AWAY' ? userBonus : 0);
      winner = homeScore >= awayScore ? 'HOME' : 'AWAY';
    }

    const pg = winner === 'HOME' ? home[0] : away[0];
    this.grantPossession(pg, true);
    this.phase = 'LIVE';
    this.renderState.lastEventLabel =
      winner === 'HOME'
        ? `${this.homeTeam.abbr} WINS TIP-OFF!`
        : `${this.awayTeam.abbr} WINS TIP-OFF!`;
    this.hooks.onCrowdRoar?.(0.65);
  }

  // ==========================================================================
  // PUBLIC PLAYER ACTION TRIGGERS (KEYBOARD / MOUSE PRO-STICK / GAMEPAD / TOUCH)
  // ==========================================================================

  public triggerPass(kind: 'CHEST' | 'BOUNCE' | 'WRAP' = 'CHEST'): void {
    if (this.phase !== 'LIVE') return;
    const handler = this.getBallHandler();
    if (!handler || !handler.render.isUserControlled) {
      // On defense, pressing J attempts a Glove Strip or switches defender
      this.triggerStealAttempt();
      return;
    }
    if (this.shotChargeActive || this.activePass || this.activeShot) return;

    // Double-tap K -> Wrap Pass
    let resolvedKind = kind;
    if (kind === 'BOUNCE') {
      if (this.simTimeSec - this.lastBounceTapTime < 0.34) {
        resolvedKind = 'WRAP';
      }
      this.lastBounceTapTime = this.simTimeSec;
    }

    const target = this.findBestPassTarget(handler);
    if (target) {
      this.executePass(handler, target, resolvedKind);
    }
  }

  public toggleIconPassing(): void {
    if (this.phase !== 'LIVE') return;
    const handler = this.getBallHandler();
    if (handler && handler.render.isUserControlled) {
      this.iconPassingActive = !this.iconPassingActive;
    } else {
      // On defense, Tab switches to the defender closest to the ball!
      this.switchToNearestDefender();
    }
  }

  public triggerIconPass(slotNumber1To5: number): void {
    if (this.phase !== 'LIVE') return;
    const handler = this.getBallHandler();
    if (!handler || !handler.render.isUserControlled) return;
    const mates = this.getSideActors(handler.render.teamSide);
    const target = mates[slotNumber1To5 - 1];
    this.iconPassingActive = false;
    if (target && target.render.id !== handler.render.id) {
      this.executePass(handler, target, 'CHEST');
    }
  }

  public triggerLobOrBlock(): void {
    // Handles `L` key: Double-tap on offense -> Alley-Oop; on defense -> Block / Rebound Snag;
    // Also handles Jump Ball & Free Throw release if needed
    if (this.phase === 'JUMP_BALL') {
      this.triggerJumpBallAttempt();
      return;
    }
    if (this.phase !== 'LIVE') return;

    const handler = this.getBallHandler();
    if (handler && handler.render.isUserControlled) {
      if (this.simTimeSec - this.lastLobTapTime < 0.42) {
        this.triggerAlleyOop();
      } else {
        this.lastLobTapTime = this.simTimeSec;
        this.renderState.lastEventLabel = 'TAP [L] AGAIN TO THROW ALLEY-OOP!';
      }
      return;
    }

    // Rebound snag if ball is loose in flight
    if (this.activeShot && this.activeShot.isReboundLive) {
      this.attemptUserReboundSnag();
      return;
    }

    // Jump / Chase-down block on defense
    this.triggerBlockAttempt();
  }

  public triggerAlleyOop(): void {
    if (this.phase !== 'LIVE') return;
    const handler = this.getBallHandler();
    if (!handler || !handler.render.isUserControlled) return;
    if (this.activePass || this.activeShot) return;

    const hoopX = this.getAttackDirForSide(handler.render.teamSide) * COURT_DIMS.RIM_X;
    const mates = this.getSideActors(handler.render.teamSide).filter(
      (m) => m.render.id !== handler.render.id
    );
    if (mates.length === 0) return;

    // Pick best rim-runner / dunker closest to the hoop
    let best = mates[0];
    let bestScore = -999;
    for (let i = 0; i < mates.length; i++) {
      const m = mates[i];
      const d = Math.hypot(hoopX - m.render.x, m.render.z);
      const score = m.profile.attributes.drivingDunk * 1.2 + m.profile.attributes.vertical * 0.5 - d * 9;
      if (score > bestScore) {
        bestScore = score;
        best = m;
      }
    }

    this.executePass(handler, best, 'ALLEY_OOP');
  }

  public submitAlleyOopFinishKey(key: AlleyOopPromptKey | 'ANY'): void {
    if (!this.activePass || this.activePass.kind !== 'ALLEY_OOP') return;
    if (this.activePass.alleyOopPressed) return;
    this.activePass.alleyOopPressed = true;
    const matched = key === 'ANY' || key === this.activePass.alleyOopKey;
    const timingOk = this.activePass.elapsed >= this.activePass.duration * 0.22;
    this.activePass.alleyOopSucceeded = matched && timingOk;
    if (this.activePass.alleyOopSucceeded) {
      this.renderState.lastEventLabel = 'ALLEY-OOP TIMING: PERFECT!';
    } else {
      this.renderState.lastEventLabel = 'ALLEY-OOP MISSED PROMPT!';
    }
  }

  public triggerDribbleMove(move: 'CROSSOVER' | 'SPIN' | 'STEPBACK'): void {
    if (this.phase !== 'LIVE') return;
    const handler = this.getBallHandler();
    if (!handler || !handler.render.isUserControlled) return;
    this.performDribbleMove(handler, move);
  }

  public triggerTakeoverIgnition(): boolean {
    const ctrl = this.getControlledActor();
    if (!ctrl) return false;
    const ok = igniteTakeover(ctrl.takeover);
    if (ok) {
      ctrl.render.takeoverLevel = 1;
      this.renderState.crowdExcitement = Math.min(1, this.renderState.crowdExcitement + 0.35);
      this.renderState.lastEventLabel = `🔥 ${ctrl.render.lastName.toUpperCase()} IGNITED TAKEOVER!`;
      this.pushSplashBanner('TAKEOVER IGNITED!', `${ctrl.profile.name.toUpperCase()} · ${ctrl.takeover.perkLabel}`, 'FIRE', 2.4);
      this.addGradeEvent('+Takeover Ignited', 6);
      this.hooks.onCrowdRoar?.(0.95);
      this.hooks.onAnnounce?.(`${ctrl.profile.name} has ignited Takeover!`);
    }
    return ok;
  }

  public switchToNearestDefender(): void {
    if (!this.userTeamSide) return;
    const team = this.getSideActors(this.userTeamSide);
    let best = team[0];
    let bestD = 999;
    for (let i = 0; i < team.length; i++) {
      const a = team[i];
      const d = Math.hypot(a.render.x - this.renderState.ball.x, a.render.z - this.renderState.ball.z);
      if (d < bestD) {
        bestD = d;
        best = a;
      }
    }
    if (best) this.selectUserControlledPlayer(best);
  }

  /**
   * 2K26 Pro-Stick Rhythm Shooting: Pull Down arms the rhythm shot;
   * Flicking Up submits timing + tempo velocity (`tempoError: 0..0.4`).
   */
  public startRhythmShotDown(): void {
    if (this.phase === 'JUMP_BALL') {
      this.triggerJumpBallAttempt();
      return;
    }
    if (this.phase === 'FREE_THROW') {
      this.releaseUserFreeThrow();
      return;
    }
    if (this.phase !== 'LIVE') return;
    const handler = this.getBallHandler();
    if (!handler || !handler.render.isUserControlled) return;
    if (this.shotChargeActive || this.activeShot || this.activePass) return;

    this.rhythmIsArmed = true;
    this.rhythmDownTime = this.simTimeSec;
    this.beginShotCharge(handler, true);
  }

  public flickRhythmShotUp(upFlickVelocityNorm = 1.0): void {
    if (!this.shotChargeActive || !this.rhythmIsArmed) return;
    const handler = this.getBallHandler();
    if (!handler) return;
    // Ideal tempo matches jumpshotSpeed (~1.0); deviation creates tempo error
    const ideal = handler.profile.jumpshotSpeed;
    const tempoErr = Math.abs(upFlickVelocityNorm - ideal) * 0.22;
    this.rhythmIsArmed = false;
    this.releaseShotCharge(handler, true, tempoErr);
  }

  public releaseUserFreeThrow(): void {
    if (this.phase !== 'FREE_THROW' || !this.activeFreeThrow) return;
    const ft = this.activeFreeThrow;
    if (ft.waitingFlight || !ft.meterActive) return;
    if (this.userTeamSide && ft.side !== this.userTeamSide) return;
    this.executeFreeThrowRelease(ft.meterProgress);
  }

  public triggerStealAttempt(): void {
    if (this.phase !== 'LIVE') return;
    const ctrl = this.getControlledActor();
    if (!ctrl || ctrl.stealCooldown > 0 || ctrl.stunTimer > 0) return;

    // Pass lane interception if a pass is in flight
    if (this.activePass && this.activePass.passerSide !== ctrl.render.teamSide) {
      const distBall = Math.hypot(
        ctrl.render.x - this.renderState.ball.x,
        ctrl.render.z - this.renderState.ball.z
      );
      if (distBall <= 2.35) {
        const passer = this.actorMap.get(this.activePass.passerId);
        const res = evaluateStealAttempt(
          ctrl.profile,
          ctrl.render.teamSide,
          passer?.profile ?? ctrl.profile,
          this.activePass.passerSide,
          true,
          false,
          (pl, s, id, t) => this.emitBadge(pl, s, id, t)
        );
        ctrl.stealCooldown = 0.65;
        if (Math.random() <= res.stealChance + 0.18) {
          this.activePass = null;
          ctrl.boxScore.stl += 1;
          addTakeoverProgress(ctrl.takeover, 16);
          this.grantPossession(ctrl, true);
          this.renderState.lastEventLabel = `INTERCEPTED BY ${ctrl.render.lastName.toUpperCase()}!`;
          this.hooks.onCrowdRoar?.(0.75);
          return;
        }
      }
      return;
    }

    const handler = this.getBallHandler();
    if (!handler || handler.render.teamSide === ctrl.render.teamSide) {
      this.switchToNearestDefender();
      return;
    }
    this.performStealCheck(ctrl, handler);
  }

  public triggerBlockAttempt(): void {
    if (this.phase !== 'LIVE') return;
    const ctrl = this.getControlledActor();
    if (!ctrl || ctrl.blockCooldown > 0 || ctrl.stunTimer > 0) return;

    ctrl.blockCooldown = 0.62;
    ctrl.render.animState = 'JUMP_BLOCK';
    ctrl.render.y = 0.68;
    ctrl.jumpCountInPaint += 1;

    // If opponent is shooting right nearby, contest/block!
    const handler = this.getBallHandler();
    if (handler && handler.render.teamSide !== ctrl.render.teamSide) {
      const dist = Math.hypot(ctrl.render.x - handler.render.x, ctrl.render.z - handler.render.z);
      if (dist <= 2.25 && this.shotChargeActive) {
        this.attemptBlockOnShooter(ctrl, handler);
      } else if (dist <= 2.2 && !this.shotChargeActive) {
        // Bit on pump fake -> fly-by recovery stun
        ctrl.stunTimer = 0.55;
        this.renderState.lastEventLabel = `${ctrl.render.lastName.toUpperCase()} BIT ON PUMP FAKE!`;
        this.addGradeEvent('-Bad Block Attempt', -5);
      }
    }
  }

  // ==========================================================================
  // FIXED 60 HZ SIMULATION STEP
  // ==========================================================================

  public step(rawDt: number): void {
    if (this.paused) return;

    const dt = Math.min(0.05, Math.max(0.001, rawDt));
    const sliderSpeed = this.settings.coach.sliders?.user.gameSpeed ?? this.settings.gameplay.gameSpeed;
    const effectiveGameSpeed = Math.round((this.settings.gameplay.gameSpeed + sliderSpeed) * 0.5);
    const speedScale = 0.78 + ((effectiveGameSpeed - 40) / 30) * 0.44;
    const sDt = dt * speedScale;
    this.possessionElapsedSec += sDt;

    this.simTimeSec += sDt;
    this.dribbleAudioCooldown = Math.max(0, this.dribbleAudioCooldown - dt);

    // Decay splash banner & teammate grade event feed
    tickTeammateGradeEvents(this.teammateGrade, dt);
    if (this.splashBanner) {
      this.splashBanner.ttlSec -= dt;
      if (this.splashBanner.ttlSec <= 0) this.splashBanner = null;
    }

    // 3-second Timeout quick huddle pause
    if (this.timeoutHuddleSec > 0) {
      this.timeoutHuddleSec = Math.max(0, this.timeoutHuddleSec - dt);
      return;
    }

    // Decay transient visual effects
    this.renderState.cameraShake = Math.max(0, this.renderState.cameraShake - dt * 2.2);
    this.renderState.crowdExcitement = Math.max(0.22, this.renderState.crowdExcitement - dt * 0.08);
    this.renderState.hoops.leftRimFlex = Math.max(0, this.renderState.hoops.leftRimFlex - dt * 2.6);
    this.renderState.hoops.rightRimFlex = Math.max(0, this.renderState.hoops.rightRimFlex - dt * 2.6);
    this.renderState.hoops.leftNetRipple = Math.max(0, this.renderState.hoops.leftNetRipple - dt * 1.4);
    this.renderState.hoops.rightNetRipple = Math.max(0, this.renderState.hoops.rightNetRipple - dt * 1.4);
    this.renderState.hoops.leftNetTime += dt;
    this.renderState.hoops.rightNetTime += dt;

    // Decay Pick & Roll screen assist window
    if (this.pickAndRoll.screenAssistWindowSec > 0) {
      this.pickAndRoll.screenAssistWindowSec = Math.max(0, this.pickAndRoll.screenAssistWindowSec - dt);
    }

    // Decay badge feed & shot feedback
    if (this.badgeFeed.length > 0) {
      for (let i = this.badgeFeed.length - 1; i >= 0; i--) {
        this.badgeFeed[i].ttlSec -= dt;
        if (this.badgeFeed[i].ttlSec <= 0) this.badgeFeed.splice(i, 1);
      }
    }
    if (this.shotFeedback) {
      this.shotFeedback.ttlSec -= dt;
      if (this.shotFeedback.ttlSec <= 0) this.shotFeedback = null;
    }

    // Tick Takeover & cooldowns for all players
    for (let i = 0; i < this.actors.length; i++) {
      const a = this.actors[i];
      tickTakeover(a.takeover, dt);
      a.render.takeoverLevel = a.takeover.ignited
        ? 1.0
        : a.takeover.meter / 100;
      a.stunTimer = Math.max(0, a.stunTimer - dt);
      a.dribbleCooldown = Math.max(0, a.dribbleCooldown - dt);
      a.stealCooldown = Math.max(0, a.stealCooldown - dt);
      a.blockCooldown = Math.max(0, a.blockCooldown - dt);
      a.jumpRecoveryTimer = Math.max(0, a.jumpRecoveryTimer - dt);
      a.actionTimer = Math.max(0, a.actionTimer - dt);
      if (a.render.y > 0 && a.render.animState !== 'DUNK' && a.render.animState !== 'RIM_HANG') {
        a.render.y = Math.max(0, a.render.y - dt * 2.6);
      }
    }

    switch (this.phase) {
      case 'JUMP_BALL':
        this.stepJumpBall(dt);
        break;
      case 'LIVE':
        this.stepLivePlay(sDt, dt);
        break;
      case 'FREE_THROW':
        this.stepFreeThrow(dt);
        break;
      case 'INBOUND':
      case 'CHECK_BALL':
        this.stepDeadBallReset(dt);
        break;
      case 'QUARTER_BREAK':
      case 'HALFTIME_SWAP':
        this.stepQuarterBreak(dt);
        break;
      case 'GAME_OVER':
        break;
    }

    this.replayBuffer.record(this.renderState, this.simTimeSec, dt);
    this.prevShootHeld = this.input.shootHeld;
  }

  private stepJumpBall(dt: number): void {
    this.jumpBallTossElapsed += dt;
    const dur = 1.25;
    this.jumpBallProgress = Math.min(1, this.jumpBallTossElapsed / dur);
    // Smooth parabolic ball toss straight up at (0, y, 0)
    const t = this.jumpBallProgress;
    this.renderState.ball.x = 0;
    this.renderState.ball.z = 0;
    this.renderState.ball.y = 1.4 + Math.sin(t * Math.PI * 0.92) * 2.65;

    if (this.input.shootHeld && !this.prevShootHeld) {
      this.triggerJumpBallAttempt();
      return;
    }

    if (this.jumpBallTossElapsed >= dur) {
      this.resolveJumpBall();
    }
  }

  private getSlidersForSide(side: 'HOME' | 'AWAY') {
    const sl = this.settings.coach.sliders;
    if (!sl) {
      return {
        insideShot: 50,
        closeShot: 50,
        midRange: 50,
        threePt: this.settings.coach.userShotSlider,
        layup: 50,
        dunkInTraffic: this.settings.coach.dunkFrequencySlider,
        shotContestImpact: 50,
        blockFrequency: 50,
        stealSuccess: 50,
        offReb: 50,
        defReb: 50,
        ballSecurity: 50,
        helpDefense: this.settings.coach.cpuDefenseSlider,
        gameSpeed: this.settings.gameplay.gameSpeed,
        foulFrequency: 50,
      };
    }
    return this.userTeamSide && side === this.userTeamSide ? sl.user : sl.cpu;
  }

  private stepLivePlay(sDt: number, dt: number): void {
    this.playClockSec += sDt;
    this.possessionElapsedSec += dt;
    for (let i = 0; i < this.actors.length; i++) {
      this.actors[i].boxScore.minutesSec += dt;
    }

    // 1. Clocks (NBA regulation vs Blacktop untimed)
    if (!this.isBlacktopMode()) {
      this.renderState.quarterClockSec = Math.max(0, this.renderState.quarterClockSec - dt);
      if (!this.activeShot && this.settings.gameplay.shotClock24 !== false) {
        this.renderState.shotClockSec = Math.max(0, this.renderState.shotClockSec - dt);
        if (this.renderState.shotClockSec <= 0) {
          this.handleTurnover('24-SECOND SHOT CLOCK VIOLATION!', true);
          return;
        }
      }
      if (this.renderState.quarterClockSec <= 0 && !this.activeShot) {
        this.handleQuarterEnd();
        return;
      }

      // 8-Second Backcourt violation check
      if (this.settings.gameplay.eightSecBackcourt !== false) {
        const handler = this.getBallHandler();
        if (handler && !this.crossedHalfCourt) {
          const dir = this.getAttackDirForSide(handler.render.teamSide);
          const pastHalf = dir === 1 ? handler.render.x > 0.25 : handler.render.x < -0.25;
          if (pastHalf) {
            this.crossedHalfCourt = true;
            this.backcourtClockSec = 0;
          } else {
            this.backcourtClockSec += dt;
            if (this.backcourtClockSec >= 8.0) {
              this.handleTurnover('8-SECOND BACKCOURT VIOLATION!', true);
              return;
            }
          }
        }
      }
    }

    // 2. Toggleable 3-Second Offensive Paint Violation
    if (this.settings.gameplay.paintThreeSecViolation && !this.activeShot) {
      const offSide = this.renderState.possession;
      const hoopX = this.getAttackDirForSide(offSide) * COURT_DIMS.RIM_X;
      const offPlayers = this.getSideActors(offSide);
      for (let i = 0; i < offPlayers.length; i++) {
        const a = offPlayers[i];
        const inPaint =
          Math.abs(hoopX - a.render.x) <= COURT_DIMS.KEY_LENGTH - 0.3 &&
          Math.abs(a.render.z) <= COURT_DIMS.KEY_HALF_WIDTH - 0.15;
        if (inPaint && !a.render.hasBall) {
          a.paintThreeSecTimer += dt;
          if (a.paintThreeSecTimer >= 3.0) {
            a.paintThreeSecTimer = 0;
            this.handleTurnover('3-SECOND PAINT VIOLATION!', true);
            return;
          }
        } else {
          a.paintThreeSecTimer = 0;
        }
      }
    }

    // 3. Handle User Shot Button Hold / Release (Non-Rhythm)
    const handler = this.getBallHandler();
    if (handler && handler.render.isUserControlled && !this.activePass && !this.activeShot) {
      if (this.input.shootHeld && !this.prevShootHeld && !this.shotChargeActive) {
        this.beginShotCharge(handler, false);
      } else if (!this.input.shootHeld && this.prevShootHeld && this.shotChargeActive && !this.rhythmIsArmed) {
        // Quick tap (< 0.15s) outside paint -> Pump Fake!
        const hoopX = this.getAttackDirForSide(handler.render.teamSide) * COURT_DIMS.RIM_X;
        const dist = Math.hypot(hoopX - handler.render.x, handler.render.z);
        if (this.shotChargeProgress < 0.22 && dist > 4.2) {
          this.shotChargeActive = false;
          handler.render.animState = 'JUMPSHOT';
          handler.render.shotProgress = 0.25;
          handler.actionTimer = 0.22;
          this.renderState.lastEventLabel = `${handler.render.lastName.toUpperCase()} PUMP FAKE!`;
          this.triggerDefenderPumpFakeBite(handler);
        } else {
          this.releaseShotCharge(handler, false, 0);
        }
      }
    }

    // Advance active shot charge meter
    if (this.shotChargeActive && handler) {
      this.shotChargeProgress += dt / Math.max(0.28, this.shotChargeDuration);
      handler.render.shotProgress = Math.min(1, this.shotChargeProgress);
      if (this.shotChargeProgress >= 1.12) {
        // Auto-release very late
        this.rhythmIsArmed = false;
        this.releaseShotCharge(handler, false, 0.35);
      }
    }

    // 4. Advance Pass or Shot Ball Flight
    if (this.activePass) {
      this.stepPassFlight(dt);
    } else if (this.activeShot) {
      this.stepShotFlight(dt);
    }

    // 5. Move User & AI Players
    this.stepAllPlayers(sDt, dt);

    // 6. Sync Ball Position to Ball Handler when not in flight
    const curHandler = this.getBallHandler();
    if (curHandler && !this.activePass && !this.activeShot) {
      const handSign = this.renderState.ball.dribbleHand === 'right' ? 1 : -1;
      const f = curHandler.render.facingRad;
      const forwardX = Math.cos(f);
      const forwardZ = Math.sin(f);
      const rightX = -forwardZ;
      const rightZ = forwardX;
      const bounceWave = Math.abs(Math.sin(this.simTimeSec * (curHandler.render.speed > 2.2 ? 9.5 : 6.2)));
      const ballY =
        this.shotChargeActive
          ? 1.55 + Math.min(1, this.shotChargeProgress) * 1.15
          : 0.14 + bounceWave * 0.96;

      this.renderState.ball.x = curHandler.render.x + forwardX * 0.38 + rightX * 0.32 * handSign;
      this.renderState.ball.z = curHandler.render.z + forwardZ * 0.38 + rightZ * 0.32 * handSign;
      this.renderState.ball.y = ballY;
      this.renderState.ball.inFlight = false;

      if (!this.shotChargeActive && bounceWave < 0.1 && this.dribbleAudioCooldown <= 0) {
        this.dribbleAudioCooldown = 0.32;
        this.hooks.onDribble?.();
      }

      // Update 2K14 Shot Quality floor ring under handler
      this.updateShotQualityRing(curHandler);

      // Out-of-bounds check
      if (
        Math.abs(curHandler.render.x) > COURT_DIMS.HALF_LENGTH - 0.15 ||
        Math.abs(curHandler.render.z) > COURT_DIMS.HALF_WIDTH - 0.15
      ) {
        this.handleTurnover('OUT OF BOUNDS!', true);
      }
    }
  }

  // ==========================================================================
  // PLAYER MOVEMENT & AI LOOP
  // ==========================================================================

  private stepAllPlayers(sDt: number, dt: number): void {
    const homeActors = this.getSideActors('HOME');
    const awayActors = this.getSideActors('AWAY');
    const ballHandler = this.getBallHandler();

    const makeSnaps = (list: SimPlayerActor[]): AIPlayerSnap[] =>
      list.map((a) => ({
        id: a.render.id,
        slotIndex: a.teamSlot,
        teamSide: a.render.teamSide,
        profile: a.profile,
        x: a.render.x,
        z: a.render.z,
        hasBall: a.render.hasBall,
        isUserControlled: a.render.isUserControlled,
        stamina: a.render.stamina,
        adrenalinePips: a.render.adrenalinePips,
        guardTargetId: a.render.guardTargetId,
      }));

    const homeSnaps = makeSnaps(homeActors);
    const awaySnaps = makeSnaps(awayActors);

    for (let i = 0; i < this.actors.length; i++) {
      const a = this.actors[i];

      if (a.stunTimer > 0) {
        a.render.speed = 0;
        a.render.animState = 'ANKLE_BROKEN_STUMBLE';
        a.render.animPhase += dt * 4;
        continue;
      }

      const isOffense = a.render.teamSide === this.renderState.possession;
      const mySnaps = a.render.teamSide === 'HOME' ? homeSnaps : awaySnaps;
      const oppSnaps = a.render.teamSide === 'HOME' ? awaySnaps : homeSnaps;
      const mySnap = mySnaps[a.teamSlot];
      const attackDirX = this.getAttackDirForSide(a.render.teamSide);
      const defendHoopX = -attackDirX * COURT_DIMS.RIM_X;

      if (a.render.isUserControlled) {
        this.stepUserPlayer(a, sDt, dt, isOffense, attackDirX);
        continue;
      }

      // AI Think Timer
      a.aiThinkTimer -= dt;
      const canDecide = a.aiThinkTimer <= 0;
      if (canDecide) {
        const diff = DIFFICULTY_PROFILES[this.config.difficulty];
        a.aiThinkTimer = diff.aiReactionSec + Math.random() * 0.25;
      }

      // Rebound chase if ball is loose after miss
      if (this.activeShot && this.activeShot.isReboundLive) {
        const bx = this.renderState.ball.x;
        const bz = this.renderState.ball.z;
        this.moveActorToward(a, bx, bz, true, sDt, dt, false);
        const distB = Math.hypot(a.render.x - bx, a.render.z - bz);
        if (distB < 1.35 && this.renderState.ball.y < 3.15) {
          this.resolveReboundBattle(a);
        }
        continue;
      }

      if (isOffense) {
        // Active Pick & Roll / Pick & Fade Screener Override
        if (this.pickAndRoll.active && this.pickAndRoll.screenerId === a.render.id) {
          this.pickAndRoll.elapsedSec += dt;
          const pnrHandler = this.getBallHandler();
          if (!pnrHandler || pnrHandler.render.teamSide !== a.render.teamSide || this.pickAndRoll.elapsedSec > 5.5) {
            this.cancelPickAndRoll();
          } else {
            const distToSpot = Math.hypot(
              a.render.x - this.pickAndRoll.screenX,
              a.render.z - this.pickAndRoll.screenZ
            );
            if (!this.pickAndRoll.screenSet) {
              const updatedSpot = computeScreenPosition(
                pnrHandler.render.x,
                pnrHandler.render.z,
                attackDirX,
                this.pickAndRoll.angleDeg
              );
              this.pickAndRoll.screenX = updatedSpot.x;
              this.pickAndRoll.screenZ = updatedSpot.z;
              this.moveActorToward(a, updatedSpot.x, updatedSpot.z, true, sDt, dt, false);
              if (distToSpot < 0.72 || this.pickAndRoll.elapsedSec > 1.35) {
                this.pickAndRoll.screenSet = true;
                this.pickAndRoll.screenAssistWindowSec = 4.2;
                // Physical Brick Wall stun on defender clipped by screen
                const nearestDef = this.findClosestOpponent(a);
                if (nearestDef && nearestDef.dist < 1.65) {
                  nearestDef.actor.stunTimer = Math.max(nearestDef.actor.stunTimer, 0.72);
                }
              }
            } else if (this.pickAndRoll.elapsedSec < 2.25) {
              // Hold wide screen stance
              a.render.speed = 0;
              a.render.animState = 'QUICK_PROTECT';
            } else {
              // Roll to rim OR Fade to 3PT pop spot
              const targetX =
                this.pickAndRoll.action === 'ROLL'
                  ? attackDirX * (COURT_DIMS.RIM_X - 1.5)
                  : attackDirX * (COURT_DIMS.RIM_X - 7.8);
              const targetZ =
                this.pickAndRoll.action === 'ROLL'
                  ? 0
                  : this.pickAndRoll.screenZ >= 0
                    ? 4.6
                    : -4.6;
              this.moveActorToward(a, targetX, targetZ, true, sDt, dt, false);
            }
            continue;
          }
        }

        const cmd = computeOffenseAI({
          player: mySnap,
          teammates: mySnaps,
          defenders: oppSnaps,
          attackDirX,
          playVision: this.renderState.activePlay,
          shotClockSec: this.renderState.shotClockSec,
          playClockSec: this.playClockSec,
          difficulty: this.config.difficulty,
          playersPerSide: this.config.playersPerSide,
          canDecideAction: canDecide && !this.activePass && !this.activeShot,
          isBlacktopHalfCourt: this.isBlacktopMode(),
        });

        if (a.render.hasBall && !this.activePass && !this.activeShot) {
          if (cmd.action === 'SHOOT') {
            this.executeAIShot(a);
            continue;
          }
          if ((cmd.action === 'PASS' || cmd.action === 'ALLEY_OOP') && cmd.passTargetId) {
            const target = this.actorMap.get(cmd.passTargetId);
            if (target) {
              this.executePass(a, target, cmd.action === 'ALLEY_OOP' ? 'ALLEY_OOP' : 'CHEST');
              continue;
            }
          }
          if (cmd.action === 'DRIBBLE_MOVE' && a.dribbleCooldown <= 0) {
            this.performDribbleMove(a, 'CROSSOVER');
          }
        }

        this.moveActorToward(a, cmd.targetX, cmd.targetZ, cmd.sprint, sDt, dt, false);
      } else {
        const cmd = computeDefenseAI({
          defender: mySnap,
          teammates: mySnaps,
          offense: oppSnaps,
          ballX: this.renderState.ball.x,
          ballZ: this.renderState.ball.z,
          ballHandler: ballHandler
            ? (ballHandler.render.teamSide === 'HOME' ? homeSnaps : awaySnaps)[ballHandler.teamSlot]
            : null,
          ballInFlight: Boolean(this.activeShot),
          shooterIsRising: this.shotChargeActive,
          defendHoopX,
          scheme: this.defensiveScheme,
          markedStarId: this.renderState.markedStar.playerId,
          markedStarTag: this.renderState.markedStar.tag,
          difficulty: this.config.difficulty,
          cpuDefenseSlider: this.settings.coach.cpuDefenseSlider,
          cpuSliders: this.settings.coach.sliders?.cpu,
          canAttemptEvent: canDecide,
        });

        a.render.guardTargetId = cmd.guardTargetId;
        this.moveActorToward(a, cmd.targetX, cmd.targetZ, cmd.sprint, sDt, dt, cmd.intenseD);

        if (cmd.handsUp && a.actionTimer <= 0) {
          a.render.animState = 'HANDS_UP_CONTEST';
        }
        if (cmd.attemptSteal && ballHandler && a.stealCooldown <= 0) {
          this.performStealCheck(a, ballHandler);
        }
        if (cmd.attemptBlock && ballHandler && a.blockCooldown <= 0) {
          a.blockCooldown = 0.72;
          a.render.animState = 'JUMP_BLOCK';
          a.render.y = 0.65;
          this.attemptBlockOnShooter(a, ballHandler);
        }
      }
    }
  }

  private stepUserPlayer(
    a: SimPlayerActor,
    sDt: number,
    dt: number,
    isOffense: boolean,
    attackDirX: 1 | -1
  ): void {
    // Rebound snag automatically assists if user holds movement toward loose rebound
    if (this.activeShot && this.activeShot.isReboundLive) {
      const distB = Math.hypot(
        a.render.x - this.renderState.ball.x,
        a.render.z - this.renderState.ball.z
      );
      if (distB < 1.15 && this.renderState.ball.y < 3.0) {
        this.resolveReboundBattle(a);
        return;
      }
    }

    const mag = Math.hypot(this.input.moveX, this.input.moveZ);
    const nx = mag > 0.05 ? this.input.moveX / Math.max(1, mag) : 0;
    const nz = mag > 0.05 ? this.input.moveZ / Math.max(1, mag) : 0;

    // 2K26 Quick Protect (Offense Shift) / Intense-D (Defense Shift)
    const isQuickProtect = isOffense && a.render.hasBall && this.input.quickProtectOrIntenseD;
    const isIntenseD = !isOffense && this.input.quickProtectOrIntenseD;

    const effSpeed = getEffectiveAttribute(a.profile, a.takeover, 'speed');
    let maxSpeed =
      (4.6 + ((effSpeed - 55) / 44) * 2.55) * (this.scenarioOverride?.speedMultiplier ?? 1); // ~4.6 .. 7.15 m/s

    // Sprint & 3-Bar Adrenaline Mechanics
    const wantsSprint = this.input.sprint && mag > 0.15 && !isQuickProtect && !this.shotChargeActive;
    if (wantsSprint) {
      if (a.render.adrenalinePips > 0) {
        const launch = evaluateFirstStepLaunch(a.profile, a.render.teamSide, (pl, s, id, t) =>
          this.emitBadge(pl, s, id, t)
        );
        maxSpeed *= 1.24 * Math.min(1.16, launch.speedMultiplier);
        if (this.settings.gameplay.fatigue) {
          const gatoradeSave = this.scenarioOverride?.staminaBonus ? 0.72 : 1;
          a.render.stamina = Math.max(
            0.08,
            a.render.stamina - dt * 0.11 * launch.adrenalineDrainMul * gatoradeSave
          );
        }
        // Bursting consumes 1 adrenaline pip every 1.45s of continuous turbo
        if (a.dribbleCooldown <= 0 && a.render.hasBall) {
          a.render.adrenalinePips = Math.max(0, a.render.adrenalinePips - 1);
          a.dribbleCooldown = 1.45 / Math.max(0.65, launch.adrenalineDrainMul);
        }
      } else {
        // 0 Adrenaline Pips -> -18% burst speed penalty
        maxSpeed *= 0.82;
      }
    } else if (this.settings.gameplay.fatigue) {
      const recBonus = this.scenarioOverride?.staminaBonus ? 1.35 : 1;
      a.render.stamina = Math.min(1, a.render.stamina + dt * 0.065 * recBonus);
    }

    if (isQuickProtect) maxSpeed *= 0.64;
    if (isIntenseD) maxSpeed *= 0.84;
    if (this.shotChargeActive && this.shotChargeKind !== 'SKILL_DUNK') maxSpeed *= 0.22;

    // Clamps body-up slowdown if opponent defender is clamping closely
    if (a.render.hasBall) {
      const nearestDef = this.findClosestOpponent(a);
      if (nearestDef && nearestDef.dist < 1.15 && nearestDef.actor.render.animState === 'DEFENSIVE_SLIDE') {
        maxSpeed *= 0.72;
      }
    }

    a.vx = nx * maxSpeed;
    a.vz = nz * maxSpeed;
    a.render.x = Math.max(
      -COURT_DIMS.HALF_LENGTH + 0.1,
      Math.min(COURT_DIMS.HALF_LENGTH - 0.1, a.render.x + a.vx * sDt)
    );
    a.render.z = Math.max(
      -COURT_DIMS.HALF_WIDTH + 0.1,
      Math.min(COURT_DIMS.HALF_WIDTH - 0.1, a.render.z + a.vz * sDt)
    );
    a.render.speed = Math.hypot(a.vx, a.vz);

    if (a.render.speed > 0.25) {
      a.render.facingRad = Math.atan2(a.vz, a.vx);
      a.render.animPhase += sDt * (2.6 + a.render.speed * 0.85);
    } else {
      // Face hoop on offense, face ball on defense
      const tx = isOffense ? attackDirX * COURT_DIMS.RIM_X : this.renderState.ball.x;
      const tz = isOffense ? 0 : this.renderState.ball.z;
      a.render.facingRad = Math.atan2(tz - a.render.z, tx - a.render.x);
    }

    if (a.actionTimer <= 0 && !this.shotChargeActive) {
      if (isQuickProtect) {
        a.render.animState = 'QUICK_PROTECT';
      } else if (!isOffense && this.input.handsUp) {
        a.render.animState = 'HANDS_UP_CONTEST';
      } else if (isIntenseD) {
        a.render.animState = 'DEFENSIVE_SLIDE';
      } else if (a.render.hasBall) {
        a.render.animState =
          a.render.speed > 5.4
            ? 'SPRINT'
            : this.renderState.ball.dribbleHand === 'right'
              ? 'DRIBBLE_RIGHT'
              : 'DRIBBLE_LEFT';
      } else {
        a.render.animState = a.render.speed > 5.4 ? 'SPRINT' : a.render.speed > 0.4 ? 'RUN' : 'IDLE';
      }
    }
  }

  private moveActorToward(
    a: SimPlayerActor,
    tx: number,
    tz: number,
    sprint: boolean,
    sDt: number,
    dt: number,
    intenseD: boolean
  ): void {
    const dx = tx - a.render.x;
    const dz = tz - a.render.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 0.22) {
      a.vx = 0;
      a.vz = 0;
      a.render.speed = 0;
      if (a.actionTimer <= 0) {
        a.render.animState = intenseD
          ? 'DEFENSIVE_SLIDE'
          : a.render.hasBall
            ? 'DRIBBLE_RIGHT'
            : 'IDLE';
      }
      // Face ball or hoop
      const lookX = a.render.hasBall
        ? this.getAttackDirForSide(a.render.teamSide) * COURT_DIMS.RIM_X
        : this.renderState.ball.x;
      const lookZ = a.render.hasBall ? 0 : this.renderState.ball.z;
      a.render.facingRad = Math.atan2(lookZ - a.render.z, lookX - a.render.x);
      return;
    }

    const effSpeed = getEffectiveAttribute(a.profile, a.takeover, 'speed');
    let speed = 4.35 + ((effSpeed - 55) / 44) * 2.35;
    if (sprint && a.render.adrenalinePips > 0) {
      speed *= 1.18;
      if (this.settings.gameplay.fatigue) {
        a.render.stamina = Math.max(0.12, a.render.stamina - dt * 0.08);
      }
    } else if (sprint && a.render.adrenalinePips <= 0) {
      speed *= 0.82;
    } else if (this.settings.gameplay.fatigue) {
      a.render.stamina = Math.min(1, a.render.stamina + dt * 0.05);
    }

    if (intenseD) speed *= 0.86;
    const stepLen = Math.min(dist, speed * sDt);
    a.render.x += (dx / dist) * stepLen;
    a.render.z += (dz / dist) * stepLen;
    a.render.speed = speed;
    a.render.facingRad = Math.atan2(dz, dx);
    a.render.animPhase += sDt * (2.4 + speed * 0.75);

    if (a.actionTimer <= 0) {
      if (intenseD) a.render.animState = 'DEFENSIVE_SLIDE';
      else if (a.render.hasBall) a.render.animState = sprint ? 'SPRINT' : 'DRIBBLE_RIGHT';
      else a.render.animState = sprint ? 'SPRINT' : 'RUN';
    }
  }

  // ==========================================================================
  // SHOOTING, FINISHING, EURO-STEPS, SKILL DUNK METER & PARABOLIC FLIGHT
  // ==========================================================================

  private beginShotCharge(handler: SimPlayerActor, isRhythm: boolean): void {
    const hoopX = this.getAttackDirForSide(handler.render.teamSide) * COURT_DIMS.RIM_X;
    const dist = Math.hypot(hoopX - handler.render.x, handler.render.z);
    const isMoving = handler.render.speed > 1.35;
    const isDoubleTapShoot = this.simTimeSec - this.lastShootTapTime < 0.36;
    this.lastShootTapTime = this.simTimeSec;

    const isNoDipCatch = this.simTimeSec - handler.lastCatchTime <= 0.45 && !isMoving;
    const nearestDef = this.findClosestOpponent(handler);
    const diff = DIFFICULTY_PROFILES[this.config.difficulty];

    // Inside 4.2m moving -> Finishing moves (Dunk / Euro-Step / Floater / Reverse Layup / Layup)
    if (dist <= 4.2 && (isMoving || this.input.sprint)) {
      let move: FinishMoveKind = 'STANDARD_LAYUP';
      if (isDoubleTapShoot || this.input.quickProtectOrIntenseD) {
        move = 'EURO_STEP';
      } else if (
        this.input.sprint &&
        handler.profile.attributes.drivingDunk >= 65 &&
        dist <= 3.7
      ) {
        move = 'DUNK';
      } else if (dist >= 2.55) {
        move = 'FLOATER';
      } else if (Math.abs(handler.render.z) >= 1.65) {
        move = 'REVERSE_LAYUP';
      }

      this.shotChargeFinishMove = move;
      this.shotChargeActive = true;
      this.shotChargeProgress = 0;

      if (move === 'DUNK' && diff.requiresInteractiveFinishPrompts) {
        const badgeFin = evaluateFinishingBadges({
          finisher: handler.profile,
          finisherSide: handler.render.teamSide,
          defender: nearestDef && nearestDef.dist < 2.6 ? nearestDef.actor.profile : null,
          defenderSide: handler.render.teamSide === 'HOME' ? 'AWAY' : 'HOME',
          moveKind: 'DUNK',
          hasContact: Boolean(nearestDef && nearestDef.dist < 2.1),
          isChaseDown: false,
        });
        this.shotChargeKind = 'SKILL_DUNK';
        this.shotChargeHasDunkMeter = true;
        this.shotChargeDuration = 0.56;
        this.shotChargeTargetCenter = 0.74;
        this.shotChargeGreenHalf = computeSkillDunkGreenWindow(
          handler.profile,
          nearestDef && nearestDef.dist < 2.6 ? nearestDef.actor.profile : null,
          badgeFin.dunkMeterBonus,
          badgeFin.defenderDeterBonus
        );
        handler.render.animState = 'DUNK';
        this.renderState.lastEventLabel = 'SKILL DUNK METER! RELEASE IN GREEN!';
        return;
      }

      // Layup / Euro / Floater / Rookie Dunk resolves quickly
      this.shotChargeKind = 'JUMPSHOT';
      this.shotChargeHasDunkMeter = false;
      this.shotChargeDuration = move === 'EURO_STEP' ? 0.52 : 0.44;
      this.shotChargeTargetCenter = 0.72;
      this.shotChargeGreenHalf = 0.1;
      handler.render.animState =
        move === 'DUNK'
          ? 'DUNK'
          : move === 'EURO_STEP'
            ? 'EURO_STEP'
            : move === 'FLOATER'
              ? 'FLOATER'
              : 'LAYUP';
      return;
    }

    // Perimeter / Mid-Range Jumpshot (Button Hold or 2K26 Rhythm Shooting)
    this.shotChargeFinishMove = null;
    this.shotChargeHasDunkMeter = false;
    this.shotChargeActive = true;
    this.shotChargeProgress = 0;
    this.shotChargeKind = isRhythm ? 'RHYTHM_SHOT' : 'JUMPSHOT';
    const baseGather = 0.64 / Math.max(0.75, Math.min(1.25, handler.profile.jumpshotSpeed));
    this.shotChargeDuration = isNoDipCatch ? baseGather * 0.8 : baseGather; // -20% No-Dip Catch-and-Shoot!
    this.shotChargeTargetCenter = VISUAL_CUE_TARGETS[this.settings.gameplay.visualCue] ?? 0.68;
    this.shotChargeGreenHalf = 0.072 * diff.userGreenWindowMul;
    handler.render.animState = 'JUMPSHOT';
    handler.render.shotProgress = 0;

    if (isNoDipCatch) {
      this.renderState.lastEventLabel = 'NO-DIP CATCH & SHOOT (-20% GATHER)';
    }
  }

  private releaseShotCharge(
    handler: SimPlayerActor,
    isRhythmShot: boolean,
    rhythmTempoError: number
  ): void {
    this.shotChargeActive = false;
    const hoopX = this.getAttackDirForSide(handler.render.teamSide) * COURT_DIMS.RIM_X;
    const dist = Math.hypot(hoopX - handler.render.x, handler.render.z);
    const isThree = this.isThreePointShot(handler.render.x, handler.render.z, hoopX);
    const nearestDef = this.findClosestOpponent(handler);
    const contestPct = this.computeDefenderContestPct(handler, nearestDef);
    const isCatchAndShoot = this.simTimeSec - handler.lastCatchTime <= 0.85;
    const passer = handler.lastPasserId ? this.actorMap.get(handler.lastPasserId) ?? null : null;

    // Shooting Foul check on contested paint drives / late closeouts
    if (
      nearestDef &&
      nearestDef.dist < 1.35 &&
      contestPct >= 52 &&
      (this.shotChargeFinishMove === 'DUNK' || this.shotChargeFinishMove === 'STANDARD_LAYUP') &&
      Math.random() < 0.16
    ) {
      this.callFoul(nearestDef.actor, handler, true, isThree ? 3 : 2);
      return;
    }

    // Skill Dunk / Finishing Resolution
    if (this.shotChargeFinishMove) {
      const move = this.shotChargeFinishMove;
      this.shotChargeFinishMove = null;
      const hasContact = Boolean(nearestDef && nearestDef.dist < 2.2);
      const badgeFin = evaluateFinishingBadges(
        {
          finisher: handler.profile,
          finisherSide: handler.render.teamSide,
          defender: hasContact && nearestDef ? nearestDef.actor.profile : null,
          defenderSide: handler.render.teamSide === 'HOME' ? 'AWAY' : 'HOME',
          moveKind: move,
          hasContact,
          isChaseDown: Boolean(nearestDef && nearestDef.actor.render.speed > 5.2),
        },
        (pl, s, id, t) => this.emitBadge(pl, s, id, t)
      );

      let isGreen = false;
      let made = false;
      if (move === 'DUNK' && this.shotChargeHasDunkMeter) {
        const err = Math.abs(this.shotChargeProgress - this.shotChargeTargetCenter);
        isGreen = err <= this.shotChargeGreenHalf;
        made = isGreen || (err <= this.shotChargeGreenHalf * 1.5 && Math.random() < 0.45);
      } else {
        const attr =
          move === 'DUNK'
            ? getEffectiveAttribute(handler.profile, handler.takeover, 'drivingDunk')
            : getEffectiveAttribute(handler.profile, handler.takeover, 'drivingLayup');
        const prob = Math.max(
          0.18,
          Math.min(
            0.94,
            0.48 +
              ((attr - 65) / 34) * 0.34 +
              badgeFin.finishBonus * 0.55 -
              badgeFin.defenderDeterBonus * 0.45 -
              (contestPct / 100) * 0.36
          )
        );
        const err = Math.abs(this.shotChargeProgress - this.shotChargeTargetCenter);
        isGreen = err <= 0.085 && prob > 0.55;
        made = isGreen || Math.random() <= prob;
      }

      this.shotFeedback = {
        timingLabel: isGreen
          ? move === 'DUNK'
            ? 'POSTER GREEN SLAM!'
            : `${move.replace(/_/g, ' ')} · GREEN`
          : made
            ? `${move.replace(/_/g, ' ')} FINISH`
            : `${move.replace(/_/g, ' ')} RIM OUT`,
        rhythmLabel: null,
        contestLabel: contestPct < 15 ? 'Open Lane' : `Paint Contest ${Math.round(contestPct)}%`,
        contestPct: Math.round(contestPct),
        isGreen,
        made,
        ttlSec: 2.6,
      };

      if (move === 'DUNK') {
        handler.render.x = hoopX - this.getAttackDirForSide(handler.render.teamSide) * 0.95;
        handler.render.z = Math.max(-0.55, Math.min(0.55, handler.render.z * 0.35));
        handler.render.y = 1.05;
        handler.render.animState = made ? 'RIM_HANG' : 'DUNK';
        handler.actionTimer = 0.65;
      } else {
        handler.actionTimer = 0.45;
      }

      this.launchBallShot({
        shooter: handler,
        passerId: isCatchAndShoot ? handler.lastPasserId : null,
        isThree: false,
        isFreeThrow: false,
        isDunk: move === 'DUNK',
        isAlleyOop: false,
        isGreen,
        willMake: made,
        targetHoopX: hoopX,
      });
      return;
    }

    // Standard / Rhythm Jumpshot Evaluation
    const hotKey = getHotZoneKeyForPosition(handler.render.x, handler.render.z, hoopX);
    const hotVal = handler.profile.hotZones[hotKey] ?? 0;

    const res = computeShotOutcome(
      {
        shooter: handler.profile,
        shooterSide: handler.render.teamSide,
        shooterTakeover: handler.takeover,
        defender: nearestDef && nearestDef.dist < 3.0 ? nearestDef.actor.profile : null,
        defenderSide: handler.render.teamSide === 'HOME' ? 'AWAY' : 'HOME',
        passer: isCatchAndShoot ? passer?.profile ?? null : null,
        distMeters: dist,
        isThree,
        hotZoneState: hotVal,
        releaseValue: this.shotChargeProgress,
        targetCenter: this.shotChargeTargetCenter,
        timingProfile: this.scenarioOverride?.forceGreenOrMiss
          ? 'GREEN_OR_MISS'
          : this.settings.gameplay.shotTimingProfile,
        shotMeterEnabled: this.settings.controller.shotMeterEnabled,
        isRhythmShot,
        rhythmTempoError,
        isCatchAndShoot,
        isOffDribble: handler.render.speed > 1.25 || !isCatchAndShoot,
        contestPct,
        stamina: handler.render.stamina,
        adrenalinePips: handler.render.adrenalinePips,
        difficulty: this.config.difficulty,
        userShotSlider: (() => {
          const sl = this.getSlidersForSide(handler.render.teamSide);
          const defSl = this.getSlidersForSide(handler.render.teamSide === 'HOME' ? 'AWAY' : 'HOME');
          const shotTypeVal = isThree
            ? sl.threePt
            : dist <= 2.4
              ? sl.insideShot
              : dist <= 4.2
                ? sl.closeShot
                : sl.midRange;
          const contestPenalty = (defSl.shotContestImpact - 50) * (contestPct / 100) * 0.45;
          return Math.max(10, Math.min(95, shotTypeVal - contestPenalty));
        })(),
      },
      (pl, s, id, t) => this.emitBadge(pl, s, id, t)
    );

    this.shotFeedback = {
      timingLabel: res.timingLabel,
      rhythmLabel: res.rhythmLabel,
      contestLabel: res.contestLabel,
      contestPct: res.contestPct,
      isGreen: res.isGreen,
      made: res.made,
      ttlSec: 2.8,
    };

    handler.render.y = 0.58;
    handler.actionTimer = 0.5;
    this.launchBallShot({
      shooter: handler,
      passerId: isCatchAndShoot ? handler.lastPasserId : null,
      isThree,
      isFreeThrow: false,
      isDunk: false,
      isAlleyOop: false,
      isGreen: res.isGreen,
      willMake: res.made,
      targetHoopX: hoopX,
    });
  }

  private executeAIShot(shooter: SimPlayerActor): void {
    const hoopX = this.getAttackDirForSide(shooter.render.teamSide) * COURT_DIMS.RIM_X;
    const dist = Math.hypot(hoopX - shooter.render.x, shooter.render.z);
    const isThree = this.isThreePointShot(shooter.render.x, shooter.render.z, hoopX);
    const nearestDef = this.findClosestOpponent(shooter);
    const contestPct = this.computeDefenderContestPct(shooter, nearestDef);
    const diff = DIFFICULTY_PROFILES[this.config.difficulty];
    const isDunk = dist <= 3.1 && shooter.profile.attributes.drivingDunk >= 75;
    const isCatch = this.simTimeSec - shooter.lastCatchTime <= 0.9;
    const passer = shooter.lastPasserId ? this.actorMap.get(shooter.lastPasserId) ?? null : null;

    if (isDunk) {
      const made = Math.random() <= 0.72 - (contestPct / 100) * 0.35;
      shooter.render.animState = made ? 'RIM_HANG' : 'DUNK';
      shooter.render.y = 0.95;
      shooter.actionTimer = 0.6;
      this.launchBallShot({
        shooter,
        passerId: isCatch ? shooter.lastPasserId : null,
        isThree: false,
        isFreeThrow: false,
        isDunk: true,
        isAlleyOop: false,
        isGreen: made,
        willMake: made,
        targetHoopX: hoopX,
      });
      return;
    }

    const hotKey = getHotZoneKeyForPosition(shooter.render.x, shooter.render.z, hoopX);
    const hotVal = shooter.profile.hotZones[hotKey] ?? 0;
    const aiGreen = Math.random() <= diff.aiShotGreenRate;
    const target = 0.68;
    const releaseVal = aiGreen ? target : target + (Math.random() < 0.5 ? -0.11 : 0.11);

    const res = computeShotOutcome(
      {
        shooter: shooter.profile,
        shooterSide: shooter.render.teamSide,
        shooterTakeover: shooter.takeover,
        defender: nearestDef && nearestDef.dist < 3.0 ? nearestDef.actor.profile : null,
        defenderSide: shooter.render.teamSide === 'HOME' ? 'AWAY' : 'HOME',
        passer: isCatch ? passer?.profile ?? null : null,
        distMeters: dist,
        isThree,
        hotZoneState: hotVal,
        releaseValue: releaseVal,
        targetCenter: target,
        timingProfile: 'NORMAL',
        shotMeterEnabled: true,
        isRhythmShot: false,
        rhythmTempoError: 0.2,
        isCatchAndShoot: isCatch,
        isOffDribble: !isCatch,
        contestPct,
        stamina: shooter.render.stamina,
        adrenalinePips: shooter.render.adrenalinePips,
        difficulty: this.config.difficulty,
        userShotSlider: (() => {
          const sl = this.getSlidersForSide(shooter.render.teamSide);
          const defSl = this.getSlidersForSide(shooter.render.teamSide === 'HOME' ? 'AWAY' : 'HOME');
          const shotTypeVal = isThree
            ? sl.threePt
            : dist <= 2.4
              ? sl.insideShot
              : dist <= 4.2
                ? sl.closeShot
                : sl.midRange;
          const contestPenalty = (defSl.shotContestImpact - 50) * (contestPct / 100) * 0.45;
          return Math.max(10, Math.min(95, shotTypeVal - contestPenalty));
        })(),
      },
      (pl, s, id, t) => this.emitBadge(pl, s, id, t)
    );

    shooter.render.animState = dist <= 3.8 ? 'LAYUP' : 'JUMPSHOT';
    shooter.render.y = 0.52;
    shooter.actionTimer = 0.48;

    this.launchBallShot({
      shooter,
      passerId: isCatch ? shooter.lastPasserId : null,
      isThree,
      isFreeThrow: false,
      isDunk: false,
      isAlleyOop: false,
      isGreen: res.isGreen,
      willMake: res.made,
      targetHoopX: hoopX,
    });
  }

  private launchBallShot(opts: {
    shooter: SimPlayerActor;
    passerId: string | null;
    isThree: boolean;
    isFreeThrow: boolean;
    isDunk: boolean;
    isAlleyOop: boolean;
    isGreen: boolean;
    willMake: boolean;
    targetHoopX: number;
  }): void {
    const { shooter } = opts;
    shooter.render.hasBall = false;
    this.renderState.ball.holderPlayerId = null;
    this.renderState.ball.inFlight = true;
    this.renderState.ball.isGreenShot = opts.isGreen;

    if (!opts.isFreeThrow) {
      shooter.boxScore.fga += 1;
      if (opts.isThree) shooter.boxScore.tpa += 1;
      const distFromBaseFt = Math.max(
        1,
        Math.min(40, Math.round(Math.abs(opts.targetHoopX - shooter.render.x) * 3.281))
      );
      const sideFeet = Math.max(-24, Math.min(24, Math.round(shooter.render.z * 3.281)));
      this.matchShots.push({
        id: `ms_${this.matchShots.length + 1}`,
        teamSide: shooter.render.teamSide,
        shooterId: shooter.render.id,
        x: sideFeet,
        y: distFromBaseFt,
        made: opts.willMake,
        isThree: opts.isThree,
        isGreen: opts.isGreen,
      });
    } else {
      shooter.boxScore.fta += 1;
    }

    const startX = shooter.render.x;
    const startY = opts.isDunk ? COURT_DIMS.RIM_Y + 0.28 : 2.35;
    const startZ = shooter.render.z;
    const dist = Math.hypot(opts.targetHoopX - startX, startZ);
    const duration = opts.isDunk ? 0.24 : Math.max(0.55, Math.min(1.22, 0.48 + dist * 0.072));
    const peakHeight = opts.isDunk
      ? COURT_DIMS.RIM_Y + 0.35
      : COURT_DIMS.RIM_Y + 1.15 + Math.min(2.1, dist * 0.2);

    const pointsValue = opts.isFreeThrow
      ? 1
      : opts.isThree
        ? this.scenarioOverride?.threePointValue ??
          (this.isBlacktopMode() && this.settings.gameplay.blacktopScoring === '1S_2S' ? 2 : 3)
        : this.scenarioOverride?.twoPointValue ??
          (this.isBlacktopMode() && this.settings.gameplay.blacktopScoring === '1S_2S' ? 1 : 2);

    if (opts.isGreen && !opts.isDunk) {
      this.hooks.onGreenRelease?.();
    }

    this.activeShot = {
      shooterId: shooter.render.id,
      shooterSide: shooter.render.teamSide,
      passerId: opts.passerId,
      pointsValue,
      isThree: opts.isThree,
      isFreeThrow: opts.isFreeThrow,
      isDunk: opts.isDunk,
      isAlleyOop: opts.isAlleyOop,
      isGreen: opts.isGreen,
      willMake: opts.willMake,
      targetHoopX: opts.targetHoopX,
      startX,
      startY,
      startZ,
      elapsed: 0,
      duration,
      peakHeight,
      resolved: false,
      isReboundLive: false,
    };
  }

  private stepShotFlight(dt: number): void {
    const shot = this.activeShot;
    if (!shot) return;

    if (!shot.resolved) {
      shot.elapsed += dt;
      const t = Math.min(1, shot.elapsed / shot.duration);
      const endX = shot.willMake
        ? shot.targetHoopX
        : shot.targetHoopX + (shot.targetHoopX > 0 ? -0.26 : 0.26);
      const endZ = shot.willMake ? 0 : (Math.random() - 0.5) * 0.38;

      this.renderState.ball.x = shot.startX + (endX - shot.startX) * t;
      this.renderState.ball.z = shot.startZ + (endZ - shot.startZ) * t;

      // Quadratic arc hitting peakHeight at mid-flight and rim height at t=1
      const baseY = shot.startY + (COURT_DIMS.RIM_Y - shot.startY) * t;
      const arcBoost = 4 * (shot.peakHeight - (shot.startY + COURT_DIMS.RIM_Y) * 0.5) * t * (1 - t);
      this.renderState.ball.y = baseY + Math.max(0, arcBoost);
      this.renderState.ball.spinX += dt * 16;

      if (t >= 1) {
        shot.resolved = true;
        this.onShotReachedRim(shot);
      }
      return;
    }

    // Post-rim physics (dropped through net OR physical rebound carom)
    if (shot.isReboundLive) {
      this.renderState.ball.vy += GRAVITY * dt;
      this.renderState.ball.x += this.renderState.ball.vx * dt;
      this.renderState.ball.y += this.renderState.ball.vy * dt;
      this.renderState.ball.z += this.renderState.ball.vz * dt;

      if (this.renderState.ball.y <= COURT_DIMS.BALL_RADIUS) {
        this.renderState.ball.y = COURT_DIMS.BALL_RADIUS;
        this.renderState.ball.vy = Math.abs(this.renderState.ball.vy) * 0.58;
        this.renderState.ball.vx *= 0.84;
        this.renderState.ball.vz *= 0.84;
      }

      // Clamp rebound inside playable floor so ball never escapes
      this.renderState.ball.x = Math.max(
        -COURT_DIMS.HALF_LENGTH + 0.6,
        Math.min(COURT_DIMS.HALF_LENGTH - 0.6, this.renderState.ball.x)
      );
      this.renderState.ball.z = Math.max(
        -COURT_DIMS.HALF_WIDTH + 0.6,
        Math.min(COURT_DIMS.HALF_WIDTH - 0.6, this.renderState.ball.z)
      );
    }
  }

  private onShotReachedRim(shot: ActiveShotFlight): void {
    const isRightHoop = shot.targetHoopX > 0;
    const shooter = this.actorMap.get(shot.shooterId);

    if (shot.willMake) {
      // SWISH OR POSTER SLAM!
      if (isRightHoop) {
        this.renderState.hoops.rightNetRipple = 1.0;
        if (shot.isDunk) this.renderState.hoops.rightRimFlex = 1.0;
      } else {
        this.renderState.hoops.leftNetRipple = 1.0;
        if (shot.isDunk) this.renderState.hoops.leftRimFlex = 1.0;
      }

      if (shot.shooterSide === 'HOME') {
        this.renderState.homeScore += shot.pointsValue;
      } else {
        this.renderState.awayScore += shot.pointsValue;
      }

      // Plus/Minus update across active floor units
      for (let i = 0; i < this.actors.length; i++) {
        const ac = this.actors[i];
        ac.boxScore.plusMinus +=
          ac.render.teamSide === shot.shooterSide ? shot.pointsValue : -shot.pointsValue;
      }

      // Team comparison buckets (Paint, Fast Break, 2nd Chance, Bench)
      const shotDistM = Math.hypot(shot.targetHoopX - shot.startX, shot.startZ);
      const isHome = shot.shooterSide === 'HOME';
      if (!shot.isFreeThrow && (shot.isDunk || shotDistM <= 3.9)) {
        if (isHome) this.teamComp.homePaintPts += shot.pointsValue;
        else this.teamComp.awayPaintPts += shot.pointsValue;
      }
      if (!shot.isFreeThrow && this.possessionElapsedSec <= 5.5) {
        if (isHome) this.teamComp.homeFastBreakPts += shot.pointsValue;
        else this.teamComp.awayFastBreakPts += shot.pointsValue;
      }
      if (!shot.isFreeThrow && this.lastPossessionWasOffReb) {
        if (isHome) this.teamComp.homeSecondChancePts += shot.pointsValue;
        else this.teamComp.awaySecondChancePts += shot.pointsValue;
      }
      this.lastPossessionWasOffReb = false;

      if (shooter) {
        shooter.boxScore.pts += shot.pointsValue;
        if (shot.isFreeThrow) {
          shooter.boxScore.ftm += 1;
        } else {
          shooter.boxScore.fgm += 1;
          if (shot.isThree) shooter.boxScore.tpm += 1;
          if (shot.isGreen) {
            shooter.boxScore.greens += 1;
            if (shot.isThree) shooter.boxScore.greenThrees += 1;
          }
        }
        addTakeoverProgress(
          shooter.takeover,
          shot.isDunk ? 24 : shot.isGreen ? 20 : 14
        );
      }

      if (shot.passerId && shot.passerId !== shot.shooterId) {
        const passer = this.actorMap.get(shot.passerId);
        if (passer) {
          passer.boxScore.ast += 1;
          addTakeoverProgress(passer.takeover, 12);
          if (this.userTeamSide && passer.render.teamSide === this.userTeamSide) {
            this.addGradeEvent('+Assist', 6);
          }
        }
      }

      if (this.userTeamSide && shot.shooterSide === this.userTeamSide) {
        this.addGradeEvent(shot.isGreen ? '+Good Shot Selection' : '+Made Basket', shot.isGreen ? 6 : 4);
        if (this.pickAndRoll.screenAssistWindowSec > 0) {
          this.addGradeEvent('+Screen Assist', 5);
          this.pickAndRoll.screenAssistWindowSec = 0;
        }
      } else if (this.userTeamSide && shot.shooterSide !== this.userTeamSide) {
        this.addGradeEvent('-Defensive Breakdown', -4);
      }

      if (shot.isDunk) {
        if (this.settings.camera.dunkCameraShake) {
          this.renderState.cameraShake = 0.85;
        }
        this.hooks.onDunkSlam?.();
        this.hooks.onCrowdRoar?.(0.95);
        this.renderState.crowdExcitement = 0.95;
        this.renderState.lastEventLabel = shot.isAlleyOop
          ? `💥 ALLEY-OOP SLAM! +${shot.pointsValue}`
          : `💥 POSTER DUNK! +${shot.pointsValue}`;
        this.pushSplashBanner(
          shot.isAlleyOop ? 'ALLEY-OOP SLAM!' : 'POSTER DUNK!',
          `${shooter?.render.lastName.toUpperCase() ?? 'STAR'} +${shot.pointsValue}`,
          'FIRE',
          2.0
        );
      } else {
        this.hooks.onSwish?.(this.isOutdoorChainNet);
        this.hooks.onCrowdRoar?.(shot.isThree ? 0.82 : 0.55);
        this.renderState.crowdExcitement = Math.min(1, this.renderState.crowdExcitement + 0.25);
        this.renderState.lastEventLabel = shot.isGreen
          ? `💚 GREEN LIGHT! +${shot.pointsValue}`
          : `BUCKET! +${shot.pointsValue}`;
        if (shot.isGreen) {
          this.pushSplashBanner(
            shot.isThree ? '3-POINT SPLASH!' : 'GREEN RELEASE!',
            `${shooter?.render.lastName.toUpperCase() ?? 'SHOOTER'} · EXCELLENT +${shot.pointsValue}`,
            'GREEN',
            1.8
          );
        } else if (shot.isThree) {
          this.pushSplashBanner(
            '3-POINT SPLASH!',
            `${shooter?.render.lastName.toUpperCase() ?? 'SHOOTER'} FROM DEEP`,
            'CYAN',
            1.7
          );
        }
      }

      this.activeShot = null;

      // Check Blacktop target score win condition
      if (this.checkBlacktopWin()) return;

      if (shot.isFreeThrow && this.activeFreeThrow) {
        this.advanceFreeThrowSequence(true);
        return;
      }

      const nextSide: 'HOME' | 'AWAY' =
        this.isBlacktopMode() && this.settings.gameplay.blacktopMakeItTakeIt
          ? shot.shooterSide
          : shot.shooterSide === 'HOME'
            ? 'AWAY'
            : 'HOME';

      if (this.isBlacktopMode()) {
        this.startCheckBall(nextSide, 'CHECK BALL');
      } else {
        this.startInbound(nextSide, 'INBOUND PASS');
      }
    } else {
      // MISS -> Physical Rim / Backboard Carom Rebound!
      this.hooks.onRimClank?.();
      if (shooter) addTakeoverProgress(shooter.takeover, -6);

      if (shot.isFreeThrow && this.activeFreeThrow && this.activeFreeThrow.shotsRemaining > 1) {
        this.activeShot = null;
        this.advanceFreeThrowSequence(false);
        return;
      }

      // Final FT miss or live FG miss -> live carom rebound!
      if (shot.isFreeThrow) {
        this.activeFreeThrow = null;
        this.phase = 'LIVE';
      }
      shot.isReboundLive = true;
      const bounceDir = isRightHoop ? -1 : 1;
      this.renderState.ball.vx = bounceDir * (2.2 + Math.random() * 2.6);
      this.renderState.ball.vy = 2.6 + Math.random() * 1.9;
      this.renderState.ball.vz = (Math.random() - 0.5) * 4.2;
      this.renderState.lastEventLabel = 'CLANK! BATTLE FOR THE REBOUND [L]!';
    }
  }

  // ==========================================================================
  // PASSING, WRAP PASSES, ALLEY-OOPS, DRIBBLING, STEALS, BLOCKS & REBOUNDS
  // ==========================================================================

  private findBestPassTarget(handler: SimPlayerActor): SimPlayerActor | null {
    const mates = this.getSideActors(handler.render.teamSide).filter(
      (m) => m.render.id !== handler.render.id
    );
    if (mates.length === 0) return null;

    const aimX = Math.abs(this.input.moveX) > 0.1 || Math.abs(this.input.moveZ) > 0.1
      ? this.input.moveX
      : Math.cos(handler.render.facingRad);
    const aimZ = Math.abs(this.input.moveX) > 0.1 || Math.abs(this.input.moveZ) > 0.1
      ? this.input.moveZ
      : Math.sin(handler.render.facingRad);
    const aimLen = Math.max(0.01, Math.hypot(aimX, aimZ));

    let best = mates[0];
    let bestScore = -999;
    for (let i = 0; i < mates.length; i++) {
      const m = mates[i];
      const dx = m.render.x - handler.render.x;
      const dz = m.render.z - handler.render.z;
      const dist = Math.max(0.5, Math.hypot(dx, dz));
      const dot = (dx * aimX + dz * aimZ) / (dist * aimLen);
      const score = dot * 3.0 - dist * 0.08;
      if (score > bestScore) {
        bestScore = score;
        best = m;
      }
    }
    return best;
  }

  private executePass(
    passer: SimPlayerActor,
    receiver: SimPlayerActor,
    kind: 'CHEST' | 'BOUNCE' | 'WRAP' | 'ALLEY_OOP'
  ): void {
    passer.render.hasBall = false;
    this.renderState.ball.holderPlayerId = null;
    this.renderState.ball.inFlight = true;
    this.iconPassingActive = false;

    const isOutlet =
      Math.hypot(receiver.render.x - passer.render.x, receiver.render.z - passer.render.z) > 10.5;
    const pBadges = evaluatePassBadges(
      passer.profile,
      passer.render.teamSide,
      kind === 'ALLEY_OOP' || kind === 'WRAP',
      isOutlet,
      (pl, s, id, t) => this.emitBadge(pl, s, id, t)
    );

    const hoopX = this.getAttackDirForSide(passer.render.teamSide) * COURT_DIMS.RIM_X;
    const targetX = kind === 'ALLEY_OOP' ? hoopX - this.getAttackDirForSide(passer.render.teamSide) * 1.15 : receiver.render.x;
    const targetZ = kind === 'ALLEY_OOP' ? Math.max(-0.85, Math.min(0.85, receiver.render.z * 0.4)) : receiver.render.z;
    const dist = Math.hypot(targetX - passer.render.x, targetZ - passer.render.z);
    const speed = (kind === 'ALLEY_OOP' ? 10.5 : 15.8) * pBadges.passSpeedMul;
    const duration = Math.max(0.22, Math.min(kind === 'ALLEY_OOP' ? 0.95 : 0.65, dist / speed));

    const keys: AlleyOopPromptKey[] = ['A', 'B', 'X', 'Y'];
    const promptKey = keys[Math.floor(Math.random() * keys.length)];
    const diff = DIFFICULTY_PROFILES[this.config.difficulty];
    const requiresPrompt =
      kind === 'ALLEY_OOP' &&
      diff.requiresInteractiveFinishPrompts &&
      passer.render.teamSide === this.userTeamSide;

    if (kind === 'ALLEY_OOP') {
      this.renderState.lastEventLabel = requiresPrompt
        ? `ALLEY-OOP LOB! PRESS [${promptKey}] OR TAP TO SLAM!`
        : 'ALLEY-OOP LOB IN THE AIR!';
    } else if (kind === 'WRAP') {
      this.renderState.lastEventLabel = `WRAP PASS BY ${passer.render.lastName.toUpperCase()}!`;
    }

    this.activePass = {
      passerId: passer.render.id,
      receiverId: receiver.render.id,
      passerSide: passer.render.teamSide,
      kind,
      startX: passer.render.x,
      startY: 1.45,
      startZ: passer.render.z,
      targetX,
      targetY: kind === 'ALLEY_OOP' ? COURT_DIMS.RIM_Y + 0.4 : 1.42,
      targetZ,
      elapsed: 0,
      duration,
      alleyOopKey: promptKey,
      alleyOopPressed: false,
      alleyOopSucceeded: !requiresPrompt,
      requiresPrompt,
    };
  }

  private stepPassFlight(dt: number): void {
    const pass = this.activePass;
    if (!pass) return;
    pass.elapsed += dt;
    const t = Math.min(1, pass.elapsed / pass.duration);
    const receiver = this.actorMap.get(pass.receiverId);

    // Track moving receiver smoothly for non-lob passes; pull receiver to rim on alley-oops
    if (receiver) {
      if (pass.kind === 'ALLEY_OOP') {
        receiver.render.x += (pass.targetX - receiver.render.x) * Math.min(1, dt * 7);
        receiver.render.z += (pass.targetZ - receiver.render.z) * Math.min(1, dt * 7);
        if (t > 0.55) {
          receiver.render.y = Math.sin(((t - 0.55) / 0.45) * Math.PI * 0.65) * 1.15;
          receiver.render.animState = 'DUNK';
        }
      } else {
        pass.targetX = receiver.render.x;
        pass.targetZ = receiver.render.z;
      }
    }

    this.renderState.ball.x = pass.startX + (pass.targetX - pass.startX) * t;
    this.renderState.ball.z = pass.startZ + (pass.targetZ - pass.startZ) * t;

    if (pass.kind === 'BOUNCE') {
      this.renderState.ball.y = t < 0.55 ? 1.35 * (1 - t / 0.55) + 0.14 : 0.14 + ((t - 0.55) / 0.45) * 1.2;
    } else if (pass.kind === 'ALLEY_OOP') {
      this.renderState.ball.y =
        pass.startY + (pass.targetY - pass.startY) * t + Math.sin(t * Math.PI) * 1.85;
    } else {
      this.renderState.ball.y = 1.42 + Math.sin(t * Math.PI) * 0.35;
    }

    if (t >= 1) {
      this.activePass = null;
      if (!receiver) return;

      if (pass.kind === 'ALLEY_OOP') {
        const hoopX = this.getAttackDirForSide(receiver.render.teamSide) * COURT_DIMS.RIM_X;
        const nearestDef = this.findClosestOpponent(receiver);
        const fin = evaluateFinishingBadges(
          {
            finisher: receiver.profile,
            finisherSide: receiver.render.teamSide,
            defender: nearestDef && nearestDef.dist < 2.2 ? nearestDef.actor.profile : null,
            defenderSide: receiver.render.teamSide === 'HOME' ? 'AWAY' : 'HOME',
            moveKind: 'ALLEY_OOP',
            hasContact: Boolean(nearestDef && nearestDef.dist < 2.0),
            isChaseDown: false,
          },
          (pl, s, id, tier) => this.emitBadge(pl, s, id, tier)
        );
        const willMake = pass.alleyOopSucceeded && Math.random() <= Math.min(0.95, 0.72 + fin.finishBonus);
        this.selectUserControlledPlayer(
          receiver.render.teamSide === this.userTeamSide ? receiver : this.getControlledActor()
        );
        this.launchBallShot({
          shooter: receiver,
          passerId: pass.passerId,
          isThree: false,
          isFreeThrow: false,
          isDunk: true,
          isAlleyOop: true,
          isGreen: willMake,
          willMake,
          targetHoopX: hoopX,
        });
        return;
      }

      receiver.lastCatchTime = this.simTimeSec;
      receiver.lastPasserId = pass.passerId;
      this.grantPossession(receiver, false);
    }
  }

  private performDribbleMove(
    handler: SimPlayerActor,
    move: 'CROSSOVER' | 'SPIN' | 'STEPBACK'
  ): void {
    if (handler.dribbleCooldown > 0) return;

    const launch = evaluateFirstStepLaunch(handler.profile, handler.render.teamSide, (pl, s, id, t) =>
      this.emitBadge(pl, s, id, t)
    );
    handler.dribbleCooldown = 0.58;
    handler.render.adrenalinePips = Math.max(0, handler.render.adrenalinePips - 1);
    if (this.settings.gameplay.fatigue) {
      handler.render.stamina = Math.max(0.1, handler.render.stamina - 0.05 * launch.adrenalineDrainMul);
    }

    this.renderState.ball.dribbleHand =
      this.renderState.ball.dribbleHand === 'right' ? 'left' : 'right';

    const attackDir = this.getAttackDirForSide(handler.render.teamSide);
    if (move === 'STEPBACK') {
      handler.render.animState = 'STEPBACK';
      handler.render.x -= attackDir * 1.15;
    } else {
      handler.render.animState = 'CROSSOVER';
      handler.render.z += (this.renderState.ball.dribbleHand === 'right' ? 1 : -1) * 0.95;
    }
    handler.actionTimer = 0.34;
    this.hooks.onDribble?.();

    // Check Ankle Assassin stun against closest defender!
    const nearestDef = this.findClosestOpponent(handler);
    if (nearestDef && nearestDef.dist <= 2.15) {
      const ab = evaluateAnkleBreaker(
        handler.profile,
        handler.render.teamSide,
        nearestDef.actor.profile,
        (pl, s, id, t) => this.emitBadge(pl, s, id, t)
      );
      if (Math.random() <= ab.stunChance) {
        nearestDef.actor.stunTimer = 1.35;
        nearestDef.actor.render.animState = 'ANKLE_BROKEN_STUMBLE';
        addTakeoverProgress(handler.takeover, 15);
        this.hooks.onCrowdRoar?.(0.8);
        this.renderState.lastEventLabel = `🔥 ANKLE BREAKER BY ${handler.render.lastName.toUpperCase()}!`;
        this.pushSplashBanner('ANKLE BREAKER!', `${handler.render.lastName.toUpperCase()} DROPPED THE DEFENDER`, 'FIRE', 1.9);
        if (this.userTeamSide && handler.render.teamSide === this.userTeamSide) {
          this.addGradeEvent('+Ankle Breaker', 5);
        }
      }
    }
  }

  private performStealCheck(defender: SimPlayerActor, handler: SimPlayerActor): void {
    const dist = Math.hypot(defender.render.x - handler.render.x, defender.render.z - handler.render.z);
    if (dist > 1.75) return;

    defender.stealCooldown = 0.72;
    const isQuickProtect = handler.render.animState === 'QUICK_PROTECT';

    const res = evaluateStealAttempt(
      defender.profile,
      defender.render.teamSide,
      handler.profile,
      handler.render.teamSide,
      false,
      isQuickProtect,
      (pl, s, id, t) => this.emitBadge(pl, s, id, t)
    );

    const defSl = this.getSlidersForSide(defender.render.teamSide);
    const offSl = this.getSlidersForSide(handler.render.teamSide);
    const stealScale = Math.max(0.25, Math.min(2.1, (defSl.stealSuccess / 50) * (1.5 - offSl.ballSecurity / 100)));
    const foulScale =
      this.settings.gameplay.reachInFouls === false
        ? 0
        : Math.max(0, Math.min(2.0, defSl.foulFrequency / 50));

    const adjStealChance = Math.min(0.85, res.stealChance * stealScale);
    const adjFoulChance = Math.min(0.65, res.foulChance * foulScale);

    const roll = Math.random();
    if (roll <= adjStealChance) {
      defender.boxScore.stl += 1;
      handler.boxScore.turnovers += 1;
      if (handler.render.teamSide === 'HOME') this.teamComp.homeTurnovers += 1;
      else this.teamComp.awayTurnovers += 1;
      addTakeoverProgress(defender.takeover, 18);
      addTakeoverProgress(handler.takeover, -10);
      this.grantPossession(defender, true);
      this.renderState.lastEventLabel = `STRIP STEAL BY ${defender.render.lastName.toUpperCase()}!`;
      this.hooks.onCrowdRoar?.(0.75);
      return;
    }

    if (roll <= adjStealChance + adjFoulChance) {
      if (isQuickProtect && Math.random() < 0.55) {
        // 2K26 Quick Protect traps steal-spammer in Defender Jail!
        defender.stunTimer = 1.1;
        this.renderState.lastEventLabel = `QUICK PROTECT! ${defender.render.lastName.toUpperCase()} IN DEFENDER JAIL!`;
      } else {
        this.callFoul(defender, handler, false, 0);
      }
    }
  }

  private attemptBlockOnShooter(defender: SimPlayerActor, shooter: SimPlayerActor): void {
    const dist = Math.hypot(defender.render.x - shooter.render.x, defender.render.z - shooter.render.z);
    if (dist > 2.2) return;

    const fin = evaluateFinishingBadges(
      {
        finisher: shooter.profile,
        finisherSide: shooter.render.teamSide,
        defender: defender.profile,
        defenderSide: defender.render.teamSide,
        moveKind: 'STANDARD_LAYUP',
        hasContact: true,
        isChaseDown: defender.render.speed > 5.0,
      },
      (pl, s, id, t) => this.emitBadge(pl, s, id, t)
    );

    const blkRating = getEffectiveAttribute(defender.profile, defender.takeover, 'block');
    const defSliders = this.getSlidersForSide(defender.render.teamSide);
    const blkSliderMod = (defSliders.blockFrequency - 50) * 0.0045;
    const chance = Math.max(
      0.04,
      Math.min(0.68, 0.14 + ((blkRating - 60) / 39) * 0.22 + fin.blockBonus * 0.5 + blkSliderMod)
    );
    if (Math.random() <= chance) {
      this.shotChargeActive = false;
      this.activeShot = null;
      defender.boxScore.blk += 1;
      addTakeoverProgress(defender.takeover, 20);
      this.grantPossession(defender, true);
      this.renderState.lastEventLabel = `🚫 SWAT BLOCK BY ${defender.render.lastName.toUpperCase()}!`;
      if (this.userTeamSide && defender.render.teamSide === this.userTeamSide) {
        this.addGradeEvent('+Good Shot Contest', 7);
      }
      this.hooks.onCrowdRoar?.(0.88);
    }
  }

  private triggerDefenderPumpFakeBite(handler: SimPlayerActor): void {
    const nearestDef = this.findClosestOpponent(handler);
    if (!nearestDef || nearestDef.dist > 2.2) return;
    if (nearestDef.actor.render.animState === 'HANDS_UP_CONTEST') {
      // Hands-up defense NEVER bites on pump fakes!
      return;
    }
    if (!nearestDef.actor.render.isUserControlled && Math.random() < 0.45) {
      nearestDef.actor.render.animState = 'JUMP_BLOCK';
      nearestDef.actor.render.y = 0.7;
      nearestDef.actor.stunTimer = 0.65;
    }
  }

  private attemptUserReboundSnag(): void {
    const ctrl = this.getControlledActor();
    if (!ctrl || !this.activeShot || !this.activeShot.isReboundLive) return;
    const badges = evaluateReboundBadges(
      ctrl.profile,
      ctrl.render.teamSide,
      this.input.quickProtectOrIntenseD,
      ctrl.jumpCountInPaint > 0,
      (pl, s, id, t) => this.emitBadge(pl, s, id, t)
    );
    const dist = Math.hypot(
      ctrl.render.x - this.renderState.ball.x,
      ctrl.render.z - this.renderState.ball.z
    );
    ctrl.render.animState = 'REBOUND_SNAG';
    ctrl.render.y = 0.72;
    ctrl.jumpCountInPaint += 1;

    if (dist <= 1.85 + badges.reachBonusM && this.renderState.ball.y <= 3.35) {
      this.resolveReboundBattle(ctrl);
    }
  }

  private resolveReboundBattle(winner: SimPlayerActor): void {
    if (!this.activeShot) return;
    const wasOffReb = winner.render.teamSide === this.activeShot.shooterSide;
    this.activeShot = null;
    winner.boxScore.reb += 1;
    winner.render.animState = 'REBOUND_SNAG';
    winner.actionTimer = 0.32;
    addTakeoverProgress(winner.takeover, wasOffReb ? 14 : 10);

    this.grantPossession(winner, !wasOffReb);
    this.lastPossessionWasOffReb = wasOffReb;
    if (wasOffReb) {
      // NBA rule: Offensive Rebound resets shot clock to 14 seconds!
      this.renderState.shotClockSec = Math.max(this.renderState.shotClockSec, 14);
      this.renderState.lastEventLabel = `OFFENSIVE REBOUND (${winner.render.lastName.toUpperCase()}) · 14s RESET!`;
    } else {
      this.renderState.lastEventLabel = `DEFENSIVE BOARD BY ${winner.render.lastName.toUpperCase()}!`;
    }
  }

  // ==========================================================================
  // FOULS, BONUS FREE THROWS, TURNOVERS, QUARTERS, HALFTIME & BLACKTOP RULES
  // ==========================================================================

  private callFoul(
    fouler: SimPlayerActor,
    victim: SimPlayerActor,
    isShootingFoul: boolean,
    ftCount: number
  ): void {
    fouler.boxScore.fouls += 1;
    if (fouler.render.teamSide === 'HOME') this.homeFoulsQtr += 1;
    else this.awayFoulsQtr += 1;

    const foulerTeamFouls = fouler.render.teamSide === 'HOME' ? this.homeFoulsQtr : this.awayFoulsQtr;
    const inBonus = !this.isBlacktopMode() && foulerTeamFouls >= 5;

    this.shotChargeActive = false;
    this.activePass = null;
    this.activeShot = null;
    this.hooks.onWhistle?.();

    if (!this.isBlacktopMode() && (isShootingFoul || inBonus)) {
      const shots = isShootingFoul ? Math.max(2, ftCount) : 2;
      this.startFreeThrowSequence(victim, shots, inBonus && !isShootingFoul);
      return;
    }

    // Non-shooting foul: reset shot clock to at least 14s and inbound/check-ball
    this.renderState.shotClockSec = Math.max(this.renderState.shotClockSec, 14);
    if (this.isBlacktopMode()) {
      this.startCheckBall(victim.render.teamSide, 'REACH-IN FOUL · CHECK BALL');
    } else {
      this.startInbound(victim.render.teamSide, 'REACH-IN FOUL · 14s RESET');
    }
  }

  private startFreeThrowSequence(shooter: SimPlayerActor, count: number, isBonus: boolean): void {
    this.phase = 'FREE_THROW';
    const dir = this.getAttackDirForSide(shooter.render.teamSide);
    const ftLineX = dir * COURT_DIMS.FREE_THROW_X;

    // Position shooter at FT line and teammates/defenders along lane
    shooter.render.x = ftLineX;
    shooter.render.z = 0;
    shooter.render.facingRad = dir === 1 ? 0 : Math.PI;
    shooter.render.animState = 'IDLE';

    const others = this.actors.filter((a) => a.render.id !== shooter.render.id);
    for (let i = 0; i < others.length; i++) {
      const a = others[i];
      const sideSign = i % 2 === 0 ? -1 : 1;
      a.render.x = dir * (COURT_DIMS.RIM_X - 1.5 - Math.floor(i / 2) * 1.05);
      a.render.z = sideSign * (COURT_DIMS.KEY_HALF_WIDTH + 0.35);
      a.render.facingRad = Math.atan2(-a.render.z, dir * COURT_DIMS.RIM_X - a.render.x);
      a.render.animState = 'IDLE';
      a.render.hasBall = false;
    }

    this.grantPossession(shooter, false);
    this.activeFreeThrow = {
      shooterId: shooter.render.id,
      side: shooter.render.teamSide,
      shotsRemaining: count,
      totalShots: count,
      meterActive: true,
      meterProgress: 0.15,
      meterDir: 1,
      waitingFlight: false,
      aiReleaseTimer: 0.9,
    };

    this.renderState.lastEventLabel = isBonus
      ? `TEAM BONUS! ${shooter.render.lastName.toUpperCase()} AT THE LINE (${count} FTs)`
      : `SHOOTING FOUL! ${shooter.render.lastName.toUpperCase()} SHOOTS ${count} FTs`;
  }

  private stepFreeThrow(dt: number): void {
    const ft = this.activeFreeThrow;
    if (!ft) {
      this.phase = 'LIVE';
      return;
    }

    if (ft.waitingFlight) {
      this.stepShotFlight(dt);
      return;
    }

    // Oscillate Free Throw bar cleanly
    ft.meterProgress += ft.meterDir * dt * 0.95;
    if (ft.meterProgress >= 1) {
      ft.meterProgress = 1;
      ft.meterDir = -1;
    } else if (ft.meterProgress <= 0) {
      ft.meterProgress = 0;
      ft.meterDir = 1;
    }

    const isUserShooter = this.userTeamSide === ft.side;
    if (isUserShooter) {
      if (this.input.shootHeld && !this.prevShootHeld) {
        this.executeFreeThrowRelease(ft.meterProgress);
      }
    } else {
      ft.aiReleaseTimer -= dt;
      if (ft.aiReleaseTimer <= 0) {
        const shooter = this.actorMap.get(ft.shooterId);
        const ftAttr = shooter?.profile.attributes.freeThrow ?? 75;
        const make = Math.random() <= 0.45 + (ftAttr / 100) * 0.48;
        this.executeFreeThrowRelease(make ? 0.72 : 0.35);
      }
    }
  }

  private executeFreeThrowRelease(meterValue: number): void {
    const ft = this.activeFreeThrow;
    if (!ft) return;
    const shooter = this.actorMap.get(ft.shooterId);
    if (!shooter) return;

    const ftAttr = getEffectiveAttribute(shooter.profile, shooter.takeover, 'freeThrow');
    const halfW = 0.075 + ((ftAttr - 50) / 49) * 0.085;
    const err = Math.abs(meterValue - 0.72);
    const isGreen = err <= halfW;
    const made = isGreen || (err <= halfW * 1.8 && Math.random() <= ftAttr / 120);

    ft.meterActive = false;
    ft.waitingFlight = true;
    shooter.render.animState = 'JUMPSHOT';

    this.shotFeedback = {
      timingLabel: isGreen ? 'FREE THROW · GREEN' : made ? 'FREE THROW GOOD' : 'FREE THROW MISS',
      rhythmLabel: null,
      contestLabel: 'At The Line',
      contestPct: 0,
      isGreen,
      made,
      ttlSec: 2.2,
    };

    const hoopX = this.getAttackDirForSide(shooter.render.teamSide) * COURT_DIMS.RIM_X;
    this.launchBallShot({
      shooter,
      passerId: null,
      isThree: false,
      isFreeThrow: true,
      isDunk: false,
      isAlleyOop: false,
      isGreen,
      willMake: made,
      targetHoopX: hoopX,
    });
  }

  private advanceFreeThrowSequence(_lastMade: boolean): void {
    const ft = this.activeFreeThrow;
    if (!ft) return;
    ft.shotsRemaining -= 1;
    if (ft.shotsRemaining > 0) {
      ft.meterActive = true;
      ft.meterProgress = 0.15;
      ft.meterDir = 1;
      ft.waitingFlight = false;
      ft.aiReleaseTimer = 0.85;
      const shooter = this.actorMap.get(ft.shooterId);
      if (shooter) this.grantPossession(shooter, false);
      return;
    }

    const opp: 'HOME' | 'AWAY' = ft.side === 'HOME' ? 'AWAY' : 'HOME';
    this.activeFreeThrow = null;
    this.startInbound(opp, 'INBOUND PASS');
  }

  private handleTurnover(reason: string, whistle: boolean): void {
    this.shotChargeActive = false;
    this.activePass = null;
    this.activeShot = null;
    this.cancelPickAndRoll();
    if (this.userTeamSide && this.renderState.possession === this.userTeamSide) {
      this.addGradeEvent('-Turnover', -6);
    }
    if (reason.includes('SHOT CLOCK')) {
      this.pushSplashBanner('SHOT CLOCK VIOLATION', '24 SECONDS EXPIRED · TURNOVER', 'CRIMSON', 2.0);
    }
    if (whistle) this.hooks.onWhistle?.();
    const nextSide: 'HOME' | 'AWAY' = this.renderState.possession === 'HOME' ? 'AWAY' : 'HOME';
    if (this.isBlacktopMode()) {
      this.startCheckBall(nextSide, reason);
    } else {
      this.startInbound(nextSide, reason);
    }
  }

  private startInbound(side: 'HOME' | 'AWAY', label: string): void {
    this.phase = 'INBOUND';
    this.phaseTimer = 0.85;
    this.nextInboundSide = side;
    this.pendingCheckBall = false;
    this.renderState.lastEventLabel = label;
  }

  private startCheckBall(side: 'HOME' | 'AWAY', label: string): void {
    this.phase = 'CHECK_BALL';
    this.phaseTimer = 0.75;
    this.nextInboundSide = side;
    this.pendingCheckBall = true;
    this.renderState.lastEventLabel = label;
  }

  private stepDeadBallReset(dt: number): void {
    this.phaseTimer -= dt;
    if (this.phaseTimer > 0) return;

    const side = this.nextInboundSide;
    const offActors = this.getSideActors(side);
    const defActors = this.getSideActors(side === 'HOME' ? 'AWAY' : 'HOME');
    const dir = this.getAttackDirForSide(side);

    if (this.pendingCheckBall) {
      // Half-court streetball check-ball at top of the key (+X hoop)
      for (let i = 0; i < offActors.length; i++) {
        offActors[i].render.x = 4.6 + (i === 0 ? 0 : 1.6);
        offActors[i].render.z = i === 0 ? 0 : (i % 2 === 1 ? -4.5 : 4.5);
        offActors[i].render.animState = 'IDLE';
      }
      for (let i = 0; i < defActors.length; i++) {
        defActors[i].render.x = offActors[i] ? offActors[i].render.x + 1.5 : 6.4;
        defActors[i].render.z = offActors[i] ? offActors[i].render.z : 0;
        defActors[i].render.animState = 'DEFENSIVE_SLIDE';
      }
      this.crossedHalfCourt = true;
    } else {
      // Regulation inbound from backcourt baseline
      const baseX = -dir * 11.2;
      for (let i = 0; i < offActors.length; i++) {
        offActors[i].render.x = baseX + dir * (i * 2.1);
        offActors[i].render.z = (i - 2) * 2.2;
        offActors[i].render.animState = 'IDLE';
      }
      for (let i = 0; i < defActors.length; i++) {
        defActors[i].render.x = baseX + dir * (3.6 + i * 1.9);
        defActors[i].render.z = (i - 2) * 2.0;
        defActors[i].render.animState = 'DEFENSIVE_SLIDE';
      }
      this.crossedHalfCourt = false;
    }

    this.grantPossession(offActors[0], true);
    this.phase = 'LIVE';
  }

  private handleQuarterEnd(): void {
    this.hooks.onBuzzer?.();
    this.renderState.hoops.buzzerLit = true;
    this.shotChargeActive = false;
    this.activePass = null;
    this.activeShot = null;

    if (this.renderState.quarter >= 4 && this.renderState.homeScore !== this.renderState.awayScore) {
      this.finishMatch(
        this.renderState.homeScore > this.renderState.awayScore ? 'HOME' : 'AWAY'
      );
      return;
    }

    this.renderState.quarter += 1;
    this.homeFoulsQtr = 0;
    this.awayFoulsQtr = 0;
    const isOT = this.renderState.quarter >= 5;
    this.renderState.quarterClockSec = isOT ? 120 : this.config.quarterLengthMin * 60;
    this.renderState.shotClockSec = 24;

    if (this.renderState.quarter === 3) {
      this.halftimeSwapped = true;
      this.phase = 'HALFTIME_SWAP';
      this.phaseTimer = 1.45;
      this.renderState.lastEventLabel = 'HALFTIME · TEAMS SWAP SIDES!';
      this.pushSplashBanner('HALFTIME', `${this.awayTeam.abbr} ${this.renderState.awayScore} - ${this.homeTeam.abbr} ${this.renderState.homeScore}`, 'GOLD', 2.2);
      this.hooks.onAnnounce?.('Halftime! Teams switch ends for the second half.');
    } else {
      this.phase = 'QUARTER_BREAK';
      this.phaseTimer = 1.25;
      this.renderState.lastEventLabel = isOT
        ? `OVERTIME ${this.renderState.quarter - 4}!`
        : `START OF Q${this.renderState.quarter}!`;
      this.pushSplashBanner('QUARTER END', this.renderState.lastEventLabel, 'GOLD', 2.0);
    }
  }

  private stepQuarterBreak(dt: number): void {
    this.phaseTimer -= dt;
    if (this.phaseTimer > 0) return;
    this.renderState.hoops.buzzerLit = false;
    const startSide: 'HOME' | 'AWAY' = this.renderState.quarter % 2 === 0 ? 'AWAY' : 'HOME';
    this.startInbound(startSide, `Q${this.renderState.quarter} INBOUND`);
  }

  private checkBlacktopWin(): boolean {
    if (!this.isBlacktopMode()) return false;
    const target = this.config.targetScore ?? 21;
    const winBy2 = this.settings.gameplay.blacktopWinByTwo;
    const h = this.renderState.homeScore;
    const a = this.renderState.awayScore;

    if (h >= target && (!winBy2 || h - a >= 2)) {
      this.finishMatch('HOME');
      return true;
    }
    if (a >= target && (!winBy2 || a - h >= 2)) {
      this.finishMatch('AWAY');
      return true;
    }
    return false;
  }

  private finishMatch(winner: 'HOME' | 'AWAY'): void {
    this.phase = 'GAME_OVER';
    this.winnerSide = winner;
    this.renderState.hoops.buzzerLit = true;
    const winAbbr = winner === 'HOME' ? this.homeTeam.abbr : this.awayTeam.abbr;
    this.renderState.lastEventLabel = `FINAL BUZZER · ${winAbbr} WINS!`;
    this.renderState.jumbotronBanner = `FINAL: ${this.awayTeam.abbr} ${this.renderState.awayScore} - ${this.homeTeam.abbr} ${this.renderState.homeScore}`;
    this.hooks.onBuzzer?.();
    this.hooks.onCrowdRoar?.(1.0);
    this.hooks.onAnnounce?.(`Final buzzer! ${winAbbr} takes the victory!`);
  }

  // ==========================================================================
  // POSSESSION, CONTEST & HELPER UTILITIES
  // ==========================================================================

  private grantPossession(player: SimPlayerActor, resetClockAndAdrenaline: boolean): void {
    for (let i = 0; i < this.actors.length; i++) {
      this.actors[i].render.hasBall = false;
      this.actors[i].render.shotQuality2K14 = 'NONE';
      if (resetClockAndAdrenaline) {
        this.actors[i].render.adrenalinePips = 3; // Fresh 3-bar Adrenaline each possession
        this.actors[i].paintThreeSecTimer = 0;
        this.actors[i].jumpCountInPaint = 0;
      }
    }

    player.render.hasBall = true;
    this.renderState.ball.holderPlayerId = player.render.id;
    this.renderState.ball.inFlight = false;
    this.renderState.ball.isGreenShot = false;
    this.renderState.possession = player.render.teamSide;
    this.renderState.attackDirX = this.getAttackDirForSide(player.render.teamSide);

    if (resetClockAndAdrenaline) {
      this.renderState.shotClockSec = 24;
      this.backcourtClockSec = 0;
      this.possessionElapsedSec = 0;
      this.lastPossessionWasOffReb = false;
      const dir = this.renderState.attackDirX;
      this.crossedHalfCourt =
        this.isBlacktopMode() || (dir === 1 ? player.render.x > 0 : player.render.x < 0);
    }

    // Auto-select ball handler when user's team has possession, or nearest defender on D
    if (this.userTeamSide === player.render.teamSide) {
      this.selectUserControlledPlayer(player);
    } else if (this.userTeamSide) {
      this.switchToNearestDefender();
    }
  }

  private findClosestOpponent(
    actor: SimPlayerActor
  ): { actor: SimPlayerActor; dist: number } | null {
    const oppSide: 'HOME' | 'AWAY' = actor.render.teamSide === 'HOME' ? 'AWAY' : 'HOME';
    const opps = this.getSideActors(oppSide);
    let best: SimPlayerActor | null = null;
    let bestD = 999;
    for (let i = 0; i < opps.length; i++) {
      const d = Math.hypot(opps[i].render.x - actor.render.x, opps[i].render.z - actor.render.z);
      if (d < bestD) {
        bestD = d;
        best = opps[i];
      }
    }
    return best ? { actor: best, dist: bestD } : null;
  }

  private computeDefenderContestPct(
    shooter: SimPlayerActor,
    nearest: { actor: SimPlayerActor; dist: number } | null
  ): number {
    if (!nearest || nearest.dist > 3.1) return 0;
    const def = nearest.actor;
    let pct = Math.max(0, (3.1 - nearest.dist) / 2.2) * 58;
    if (def.render.animState === 'HANDS_UP_CONTEST') pct += 22;
    if (def.render.animState === 'JUMP_BLOCK') pct += 30;
    const heightDiff = def.profile.heightInches - shooter.profile.heightInches;
    pct += heightDiff * 2.5;
    if (def.takeover.ignited && def.takeover.archetype === 'LOCKDOWN') pct += 16;
    return Math.max(0, Math.min(100, pct));
  }

  private isThreePointShot(x: number, z: number, hoopX: number): boolean {
    const dx = Math.abs(hoopX - x);
    const dist = Math.hypot(hoopX - x, z);
    if (dx <= 4.3 && Math.abs(z) >= COURT_DIMS.CORNER_THREE_Z - 0.08) return true;
    return dist >= COURT_DIMS.THREE_PT_RADIUS - 0.08;
  }

  private updateShotQualityRing(handler: SimPlayerActor): void {
    const hoopX = this.getAttackDirForSide(handler.render.teamSide) * COURT_DIMS.RIM_X;
    const dist = Math.hypot(hoopX - handler.render.x, handler.render.z);
    if (dist > 9.6) {
      handler.render.shotQuality2K14 = 'RED';
      return;
    }
    const nearestDef = this.findClosestOpponent(handler);
    const contest = this.computeDefenderContestPct(handler, nearestDef);
    const isThree = this.isThreePointShot(handler.render.x, handler.render.z, hoopX);
    const rating = isThree ? handler.profile.attributes.threePt : handler.profile.attributes.midRange;
    if (contest < 18 && rating >= 74) handler.render.shotQuality2K14 = 'GREEN';
    else if (contest < 45 && rating >= 60) handler.render.shotQuality2K14 = 'YELLOW';
    else handler.render.shotQuality2K14 = 'RED';
  }

  // ==========================================================================
  // HUD SNAPSHOT SERIALIZATION
  // ==========================================================================

  public getHudSnapshot(): SimHudSnapshot {
    const ctrl = this.getControlledActor();
    let meter: ActiveMeterHud = {
      kind: 'NONE',
      progress: 0,
      targetCenter: 0.68,
      greenHalfWidth: 0.06,
      label: '',
      isRhythmArmed: false,
    };

    if (this.phase === 'JUMP_BALL') {
      meter = {
        kind: 'JUMP_BALL',
        progress: this.jumpBallProgress,
        targetCenter: 0.84,
        greenHalfWidth: 0.1,
        label: 'TAP [SPACE] AT PEAK FOR TIP-OFF',
        isRhythmArmed: false,
      };
    } else if (this.phase === 'FREE_THROW' && this.activeFreeThrow && this.activeFreeThrow.meterActive) {
      const isUser = this.userTeamSide === this.activeFreeThrow.side;
      meter = {
        kind: 'FREE_THROW',
        progress: this.activeFreeThrow.meterProgress,
        targetCenter: 0.72,
        greenHalfWidth: 0.11,
        label: isUser
          ? `FREE THROW (${this.activeFreeThrow.totalShots - this.activeFreeThrow.shotsRemaining + 1}/${this.activeFreeThrow.totalShots}) · TAP [SPACE]`
          : 'CPU FREE THROW',
        isRhythmArmed: false,
      };
    } else if (this.shotChargeActive) {
      meter = {
        kind: this.shotChargeKind,
        progress: Math.min(1, this.shotChargeProgress),
        targetCenter: this.shotChargeTargetCenter,
        greenHalfWidth: this.shotChargeGreenHalf,
        label:
          this.shotChargeKind === 'SKILL_DUNK'
            ? 'SKILL DUNK METER'
            : this.shotChargeKind === 'RHYTHM_SHOT'
              ? 'RHYTHM PRO-STICK (FLICK UP!)'
              : 'SHOT METER',
        isRhythmArmed: this.rhythmIsArmed,
      };
    }

    const alleyOopPrompt: AlleyOopPromptHud =
      this.activePass && this.activePass.kind === 'ALLEY_OOP' && this.activePass.requiresPrompt && !this.activePass.alleyOopPressed
        ? {
            active: true,
            promptKey: this.activePass.alleyOopKey,
            receiverName: this.actorMap.get(this.activePass.receiverId)?.render.lastName ?? 'FINISHER',
            remainingSec: Math.max(0, this.activePass.duration - this.activePass.elapsed),
            durationSec: this.activePass.duration,
          }
        : {
            active: false,
            promptKey: 'X',
            receiverName: '',
            remainingSec: 0,
            durationSec: 1,
          };

    const handler = this.getBallHandler();
    const iconTargets =
      this.iconPassingActive && handler && handler.render.isUserControlled
        ? this.getSideActors(handler.render.teamSide)
            .map((a, idx) => ({
              slotNum: idx + 1,
              playerId: a.render.id,
              lastName: a.render.lastName,
              position: a.render.position,
            }))
            .filter((t) => t.playerId !== handler.render.id)
        : [];

    const qNum = this.renderState.quarter;
    const quarterLabel = this.isBlacktopMode()
      ? `TO ${this.config.targetScore ?? 21}`
      : qNum <= 4
        ? `Q${qNum}`
        : `OT${qNum - 4}`;

    const activeShooterId =
      this.phase === 'FREE_THROW' && this.activeFreeThrow
        ? this.activeFreeThrow.shooterId
        : this.shotChargeActive
          ? this.renderState.ball.holderPlayerId
          : null;

    const activeAlleyOopReceiverId =
      this.activePass && this.activePass.kind === 'ALLEY_OOP' && this.activePass.requiresPrompt && !this.activePass.alleyOopPressed
        ? this.activePass.receiverId
        : null;

    return {
      phase: this.phase,
      awayAbbr: this.renderState.awayAbbr,
      homeAbbr: this.renderState.homeAbbr,
      awayScore: this.renderState.awayScore,
      homeScore: this.renderState.homeScore,
      awayFouls: this.awayFoulsQtr,
      homeFouls: this.homeFoulsQtr,
      awayInBonus: !this.isBlacktopMode() && this.awayFoulsQtr >= 5,
      homeInBonus: !this.isBlacktopMode() && this.homeFoulsQtr >= 5,
      homeTimeouts: this.homeTimeouts,
      awayTimeouts: this.awayTimeouts,
      timeoutHuddleSec: this.timeoutHuddleSec,
      quarter: qNum,
      quarterLabel,
      quarterClockSec: this.renderState.quarterClockSec,
      shotClockSec: this.renderState.shotClockSec,
      possession: this.renderState.possession,
      isBlacktop: this.isBlacktopMode(),
      targetScore: this.config.targetScore,
      userTeamSide: this.userTeamSide,
      controlledPlayerId: ctrl?.render.id ?? null,
      controlledPlayerName: ctrl?.profile.name ?? 'CPU SPECTATE',
      controlledPosition: ctrl?.render.position ?? 'PG',
      controlledStamina: ctrl?.render.stamina ?? 1,
      controlledAdrenaline: ctrl?.render.adrenalinePips ?? 3,
      controlledTakeover: ctrl ? { ...ctrl.takeover } : null,
      activeShooterId,
      activeAlleyOopReceiverId,
      meter,
      alleyOopPrompt,
      shotFeedback: this.shotFeedback ? { ...this.shotFeedback } : null,
      badgeFeed: this.badgeFeed.map((b) => ({ ...b })),
      teammateGrade: {
        score: this.teammateGrade.score,
        letter: this.teammateGrade.letter,
        events: this.teammateGrade.events.map((e) => ({ ...e })),
      },
      splashBanner: this.splashBanner ? { ...this.splashBanner } : null,
      pickAndRoll: { ...this.pickAndRoll },
      activeLineupPreset: this.activeLineupPreset,
      markedStar: { ...this.renderState.markedStar },
      isPaused: this.paused,
      replayFrameCount: this.replayBuffer.getFrameCount(),
      iconPassingActive: this.iconPassingActive,
      iconTargets,
      defensiveScheme: this.defensiveScheme,
      activePlay: this.renderState.activePlay,
      shotTimingProfile: this.settings.gameplay.shotTimingProfile,
      bannerText: this.renderState.lastEventLabel,
      winnerSide: this.winnerSide,
      boxScore: this.actors.map((a) => ({ ...a.boxScore })),
      teamComparison: {
        ...this.teamComp,
        homeReb: this.actors
          .filter((a) => a.render.teamSide === 'HOME')
          .reduce((s, a) => s + a.boxScore.reb, 0),
        awayReb: this.actors
          .filter((a) => a.render.teamSide === 'AWAY')
          .reduce((s, a) => s + a.boxScore.reb, 0),
      },
      matchShots: this.matchShots.slice(),
      radarPlayers: this.actors.map((a) => ({
        id: a.render.id,
        teamSide: a.render.teamSide,
        jerseyNumber: a.render.jerseyNumber,
        position: a.render.position,
        lastName: a.render.lastName,
        name: a.profile.name,
        ovr: a.profile.ovr,
        x: a.render.x,
        z: a.render.z,
        hasBall: a.render.hasBall,
        isUserControlled: a.render.isUserControlled,
        stamina: a.render.stamina,
      })),
      radarBall: {
        x: this.renderState.ball.x,
        z: this.renderState.ball.z,
      },
    };
  }
}
