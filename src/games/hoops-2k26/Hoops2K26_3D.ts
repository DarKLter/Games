import * as THREE from 'three';
import {
  HOOPS_2K26_TEAMS,
  HOOPS_MODES,
  HOOPS_TAKEOVERS,
  Hoops2K26TeamDef,
  HoopsCourtTheme,
  HoopsMatchContext,
  HoopsModeDef,
  advanceTournamentBracket,
  computeHoopsPostGameRewards,
  evaluateCustomJumpShot,
  getActiveMyPlayer,
  getHoops2K26TeamById,
  getPlateTierForScore,
  getRepTierForXp
} from '../../core/arenaRoster';
import { ArcadeAudio } from '../../core/audio';
import {
  HoopsHudSnapshot,
  HoopsPostGameSummary,
  addCoins,
  addXp,
  setActionButtonLabel,
  updateHealthDisplay,
  updateHoopsHud,
  updateInGameHud
} from '../../core/runtimeBridge';
import { persistHoops2K26, persistHoopsTournament, playerState } from '../../core/storage';
import { Difficulty, DifficultyScaler, difficultyScalers, GameInstance } from '../../core/types';
import {
  CORNER_THREE_Z,
  COURT_HALF_LEN,
  COURT_HALF_WID,
  HOOP_X,
  RIM_Y,
  SHOT_CLOCK_SEC,
  THREE_PT_RADIUS,
  TeammateGradeEvent,
  canAttemptDunk,
  computeShotWindowEnhanced,
  evaluateShotRelease,
  getTeammateGradeLabel,
  pickBestPassTargetIndex,
  stepAdrenalineBars,
  stepMatchClocks,
  stepTakeoverMeter,
  stepTeammateGrade
} from './basketballLogic';
import {
  BasketballPlayerRig,
  StudioThreeContext,
  addInkOutline,
  buildBasketballPlayerMesh,
  createContactShadowMesh,
  createToonMaterial
} from '../../core/threeShared';

type CourtRole = 'PG' | 'SG' | 'SF' | 'PF' | 'C';
type BallMode = 'held' | 'pass' | 'shot' | 'dunk' | 'loose';

interface HoopPlayer {
  index: number;
  team: 'home' | 'away';
  role: CourtRole;
  name: string;
  rig: BasketballPlayerRig;
  x: number;
  z: number;
  y: number;
  vx: number;
  vz: number;
  vy: number;
  facingYaw: number;
  stamina: number;
  sprinting: boolean;
  homeSlotX: number;
  homeSlotZ: number;
  stealCd: number;
  stunTimer: number;
  blockTimer: number;
  animPhase: number;
  pointsScored: number;
}

interface FloatingBanner {
  text: string;
  color: string;
  timer: number;
  maxTimer: number;
}

const ROLE_SLOTS: Array<{ role: CourtRole; offX: number; offZ: number; defX: number; defZ: number; scale: number; skin: number }> = [
  { role: 'PG', offX: 8.5, offZ: 0.0, defX: -11.5, defZ: 0.0, scale: 0.96, skin: 0xd99b66 },
  { role: 'SG', offX: 11.4, offZ: -7.8, defX: -14.2, defZ: -6.8, scale: 1.0, skin: 0x8d5524 },
  { role: 'SF', offX: 15.8, offZ: 10.1, defX: -15.8, defZ: 8.4, scale: 1.04, skin: 0xc68642 },
  { role: 'PF', offX: 14.0, offZ: -3.2, defX: -16.8, defZ: -3.0, scale: 1.09, skin: 0xf1c27d },
  { role: 'C', offX: 16.4, offZ: 2.8, defX: -17.4, defZ: 2.2, scale: 1.14, skin: 0x6b3e26 }
];

const PLAY_BOOK = [
  { id: 'freelance', name: '5-Out Freelance', offsetZ: 0 },
  { id: 'pnr', name: 'High Pick & Roll', offsetZ: -2.2 },
  { id: 'floppy', name: 'Floppy 3PT Screen', offsetZ: 3.4 },
  { id: 'post_iso', name: 'Low Post Iso', offsetZ: -4.1 }
] as const;

const COACH_SCHEMES = ['Man-to-Man', '2-3 Zone', 'Switch Everything', 'Pace & Space'] as const;

const _camDesired = new THREE.Vector3();
const _camLookDesired = new THREE.Vector3();
const _camLookCur = new THREE.Vector3();
const _projVec = new THREE.Vector3();
const _dummyMatrix = new THREE.Matrix4();
const _dummyQuat = new THREE.Quaternion();
const _dummyScale = new THREE.Vector3(1, 1, 1);
const _dummyPos = new THREE.Vector3();

function hexStrToNum(hex: string, fallback: number): number {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return Number.isFinite(n) ? n : fallback;
}

export class Hoops2K26_3D implements GameInstance {
  container: HTMLElement;
  diff: Difficulty;
  level: number;
  gameIdx: number;
  homeTeam: Hoops2K26TeamDef;
  awayTeam: Hoops2K26TeamDef;
  modeDef: HoopsModeDef;
  matchCtx: HoopsMatchContext;
  playersPerSide = 5;
  scaler: DifficultyScaler;

  score = 0;
  lives = 100;
  maxLives = 100;
  isPaused = false;
  gameOver = false;
  isRunning = false;

  three!: StudioThreeContext;
  players: HoopPlayer[] = [];
  controlledIdx = 0;

  // Ball state
  ballGroup!: THREE.Group;
  ballShadow!: THREE.Mesh;
  ballX = 0;
  ballY = 1.2;
  ballZ = 0;
  ballVx = 0;
  ballVy = 0;
  ballVz = 0;
  ballMode: BallMode = 'held';
  carrierIdx = 0;
  possession: 'home' | 'away' = 'home';
  dribblePhase = 0;
  lastDribblePlayed = false;

  // Pass flight & Assist tracking
  passFromX = 0;
  passFromY = 1.4;
  passFromZ = 0;
  passTargetIdx = 1;
  passTimer = 0;
  passDuration = 0.28;
  lastUserPassToIdx = -1;
  lastUserPassTimer = 0;

  // Shot flight & Pro-Stick meter
  meterActive = false;
  meterProgress = 0;
  meterGreenStart = 0.77;
  meterGreenEnd = 0.91;
  meterBaseProb = 0.65;
  meterPoints: 2 | 3 = 2;
  meterCoverage = 'OPEN';
  meterOffBoostApplied = false;

  shotStartX = 0;
  shotStartY = 2.4;
  shotStartZ = 0;
  shotTargetX = HOOP_X;
  shotTargetZ = 0;
  shotPeakY = 5.4;
  shotTimer = 0;
  shotDuration = 0.78;
  shotWillMake = false;
  shotPoints: 2 | 3 = 2;
  shotTeam: 'home' | 'away' = 'home';
  shotWasGreen = false;
  shotShooterIdx = 0;

  // Dunk flight
  dunkFromX = 0;
  dunkFromZ = 0;
  dunkTargetX = HOOP_X;
  dunkTimer = 0;
  dunkDuration = 0.42;

  // Nets, Crowd, Play Diagram & Perfect Release VFX
  leftNetMesh!: THREE.Mesh;
  rightNetMesh!: THREE.Mesh;
  leftNetShake = 0;
  rightNetShake = 0;
  crowdMesh!: THREE.InstancedMesh;
  crowdBasePos: Array<{ x: number; y: number; z: number; phase: number }> = [];
  crowdExcite = 0;
  playDiagramGroup!: THREE.Group;
  releaseVfxGroup!: THREE.Group;
  releaseVfxTimer = 0;
  takeoverAuraMesh!: THREE.Mesh;

  // Match Clocks, Fouls & Score
  homeScore = 0;
  awayScore = 0;
  quarter = 1;
  quarterClock = 300;
  maxQuarters = 4;
  quarterLengthSec = 300;
  targetScore: number | null = null;
  shotClock = SHOT_CLOCK_SEC;
  homeFouls = 0;
  awayFouls = 0;
  homeTimeouts = 4;
  awayTimeouts = 4;
  inboundPause = 0;
  pendingInboundTeam: 'home' | 'away' = 'home';
  quarterBreakPause = 0;

  // NBA 2K26 On-Court Systems (Grade, Takeover, Adrenaline, Stats, Coaching, Icon Passing)
  teammateGradeScore = 54; // starts at C+
  teammateGrade = getTeammateGradeLabel(54);
  gradeFlash = '';
  gradeFlashTimer = 0;
  takeoverMeter = 85; // 0..500
  takeoverLevel = 0;
  takeoverActive = false;
  takeoverActiveTimer = 0;
  takeoverName = 'Sharpshooter';
  adrenalineBars = 3;
  adrenalineRechargeTimer = 0;
  wasSprintingLastFrame = false;

  stats = {
    pts: 0,
    reb: 0,
    ast: 0,
    stl: 0,
    blk: 0,
    tov: 0,
    fgm: 0,
    fga: 0,
    tpm: 0,
    tpa: 0,
    greens: 0
  };
  shotFeedback: { timing: string; coverage: string; isGreen: boolean; ttl: number } | null = null;
  iconPassingActive = false;
  activePlayIdx = 0;
  coachSchemeIdx = 0;
  postGameSummary: HoopsPostGameSummary | null = null;

  // AI timers
  aiDecisionTimer = 0.4;
  aiAttackPhaseTimer = 0;
  hudSyncTimer = 0;

  // Inputs
  moveDx = 0;
  moveDy = 0;
  steerLeftHeld = false;
  steerRightHeld = false;
  sprintHeld = false;
  shootHeld = false;
  camShake = 0;

  banner: FloatingBanner | null = null;
  lastActionBtnMode = '';
  lastTime = 0;

  constructor(
    container: HTMLElement,
    diff: Difficulty,
    lvl: number,
    gameIdx = 27,
    teamId = playerState.selectedBasketballTeam
  ) {
    this.container = container;
    this.diff = diff;
    this.level = lvl;
    this.gameIdx = gameIdx;

    this.modeDef = HOOPS_MODES.find((m) => m.id === playerState.selectedHoopsMode) ?? HOOPS_MODES[2];
    const prof = playerState.hoops2k26;
    const settings = prof.settings;
    const defaultQuarterSec = Math.max(45, Math.round(settings.quarterLengthMin * 60));

    if (prof.activeMatchContext) {
      this.matchCtx = { ...prof.activeMatchContext };
    } else {
      const isBlacktop = this.modeDef.courtKind === 'blacktop';
      const awayId =
        this.modeDef.id === 'tournament'
          ? playerState.hoopsTournament.opponents[playerState.hoopsTournament.round - 1] ?? 1
          : (teamId + 1) % HOOPS_2K26_TEAMS.length;
      this.matchCtx = {
        sourceLabel: this.modeDef.name,
        courtTheme: isBlacktop ? 'park' : 'nba_arena',
        playersPerSide: this.modeDef.playersPerSide,
        homeTeamId: teamId,
        awayTeamId: awayId,
        homeJerseyVariant: 'home',
        useMyPlayer: false,
        targetScore: isBlacktop ? 21 : null,
        quarterSec: isBlacktop ? 90 : defaultQuarterSec,
        difficultyLabel: settings.difficulty,
        repMult: 1,
        badgeMult: 1,
        vcBonus: 250
      };
    }

    this.playersPerSide = this.matchCtx.playersPerSide;
    this.targetScore = this.matchCtx.targetScore;
    this.quarterLengthSec = this.matchCtx.quarterSec || defaultQuarterSec;
    this.quarterClock = this.quarterLengthSec;
    this.maxQuarters = this.targetScore ? 1 : 4;

    this.homeTeam =
      this.matchCtx.homeTeamOverride ?? getHoops2K26TeamById(this.matchCtx.homeTeamId);
    this.awayTeam =
      this.matchCtx.awayTeamOverride ?? getHoops2K26TeamById(this.matchCtx.awayTeamId);
    if (
      !this.matchCtx.homeTeamOverride &&
      !this.matchCtx.awayTeamOverride &&
      this.awayTeam.id === this.homeTeam.id
    ) {
      this.awayTeam = getHoops2K26TeamById((this.homeTeam.id + 1) % HOOPS_2K26_TEAMS.length);
    }

    const mp = getActiveMyPlayer(prof);
    const tkDef = HOOPS_TAKEOVERS.find((t) => t.id === mp.equippedTakeoverId) ?? HOOPS_TAKEOVERS[0];
    this.takeoverName = tkDef.name;

    this.scaler = difficultyScalers[diff] || difficultyScalers.medium;
    playerState.sessionCoins = 0;
    playerState.sessionExp = 0;
  }

  private isOutdoorCourt(): boolean {
    const t: HoopsCourtTheme = this.matchCtx.courtTheme;
    return t === 'park' || t === 'blacktop' || t === 'street_kings';
  }

  start(): void {
    const outdoor = this.isOutdoorCourt();
    const isMyCourt = this.matchCtx.courtTheme === 'mycourt';
    const mural = playerState.hoops2k26.myCourt.muralTheme;
    const skyColor = outdoor
      ? this.matchCtx.courtTheme === 'street_kings'
        ? 0x7c2d12
        : 0x38bdf8
      : isMyCourt && mural === 'northern_lights'
        ? 0x1e1b4b
        : 0x0b1020;

    this.three = new StudioThreeContext(this.container, {
      skyColor,
      fogColor: outdoor ? (this.matchCtx.courtTheme === 'street_kings' ? 0xc2410c : 0xbae6fd) : skyColor,
      fogNear: 56,
      fogFar: 150,
      keyColor: outdoor ? 0xfff3d6 : 0xfff7ed,
      keyIntensity: outdoor ? 2.15 : 2.0,
      hemiSky: outdoor ? 0x7dd3fc : 0xbae6fd,
      hemiGround: outdoor ? 0x57534e : 0x7c2d12,
      hemiIntensity: outdoor ? 1.02 : 0.92,
      shadowExtent: 28,
      fov: 44,
      far: 195
    });
    this.three.renderer.toneMapping = THREE.NoToneMapping;

    this.buildArena();
    this.buildPlayDiagramAndVfx();
    this.spawnTeams();
    this.buildBasketball();
    this.resetHalfCourtSetup('home', true);
    this.syncCameraFov();
    this.snapCameraImmediate();

    this.three.prewarm();
    this.isRunning = true;
    this.lastTime = performance.now();
    this.syncActionLabels();
    updateHealthDisplay(this.lives, this.maxLives);
    updateInGameHud(this.score, this.level, this.gameIdx);
    this.pushHudSnapshot();

    const titleBanner = this.targetScore
      ? `${this.matchCtx.sourceLabel.toUpperCase()} · FIRST TO ${this.targetScore}!`
      : `${this.matchCtx.sourceLabel.toUpperCase()} — ${this.homeTeam.abbr} VS ${this.awayTeam.abbr}`;
    this.popBanner(titleBanner, this.homeTeam.accentHex, 2.0);
    ArcadeAudio.play('whistle');
    this.tick();
  }

  stop(): void {
    this.isRunning = false;
    this.releaseInputs();
    updateHoopsHud(null);
    this.three?.dispose();
  }

  releaseInputs(): void {
    this.moveDx = 0;
    this.moveDy = 0;
    this.steerLeftHeld = false;
    this.steerRightHeld = false;
    this.sprintHeld = false;
    this.shootHeld = false;
    this.meterActive = false;
    this.meterProgress = 0;
  }

  pause(): void {
    this.isPaused = true;
    this.releaseInputs();
    this.three?.cancelPendingFrame();
  }

  resume(): void {
    this.isPaused = false;
    this.lastTime = performance.now();
    if (this.isRunning && !this.gameOver) {
      this.three?.scheduleNextFrame(this.tick);
    }
  }

  resize(): void {
    this.three?.resize();
    this.syncCameraFov();
  }

  // =========================================================================
  // NEW NBA 2K26 ON-COURT INTERACTIVE CONTROLS (Called from Keyboard / HUD)
  // =========================================================================

  toggleIconPassing(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.ballMode !== 'held' || this.carrierIdx !== this.controlledIdx || this.playersPerSide <= 1) {
      this.iconPassingActive = false;
      this.pushHudSnapshot();
      return;
    }
    this.iconPassingActive = !this.iconPassingActive;
    ArcadeAudio.play('click');
    this.pushHudSnapshot();
  }

  triggerIconPass(mateIndex: number): void {
    if (this.gameOver || this.isPaused) return;
    const carrier = this.players[this.controlledIdx];
    const target = this.players[mateIndex];
    if (!carrier || !target || target.team !== 'home' || target.index === carrier.index) return;
    if (this.ballMode === 'held' && this.carrierIdx === this.controlledIdx) {
      this.iconPassingActive = false;
      this.lastUserPassToIdx = target.index;
      this.lastUserPassTimer = 4.5;
      this.startPass(carrier, target);
      this.controlledIdx = target.index;
      this.updateActiveRing();
      this.popBanner(`ICON PASS → ${target.name.split(' ').pop()?.toUpperCase()}`, '#38bdf8', 0.85);
      this.pushHudSnapshot();
    }
  }

  callHoopsPlay(playId?: string): void {
    if (this.gameOver || this.isPaused) return;
    if (playId) {
      const idx = PLAY_BOOK.findIndex((p) => p.id === playId);
      if (idx >= 0) this.activePlayIdx = idx;
    } else {
      this.activePlayIdx = (this.activePlayIdx + 1) % PLAY_BOOK.length;
    }
    const play = PLAY_BOOK[this.activePlayIdx];
    this.refreshPlayDiagramVisual();
    this.popBanner(`PLAY CALL: ${play.name.toUpperCase()}`, '#facc15', 1.2);
    ArcadeAudio.play('click');
    this.pushHudSnapshot();
  }

  setHoopsCoachScheme(scheme: string): void {
    if (this.gameOver || this.isPaused) return;
    const idx = COACH_SCHEMES.findIndex((s) => s.toLowerCase() === scheme.toLowerCase());
    this.coachSchemeIdx = idx >= 0 ? idx : (this.coachSchemeIdx + 1) % COACH_SCHEMES.length;
    const activeScheme = COACH_SCHEMES[this.coachSchemeIdx];
    this.popBanner(`COACH SCHEME: ${activeScheme.toUpperCase()}`, '#38bdf8', 1.15);
    ArcadeAudio.play('click');
    this.pushHudSnapshot();
  }

  activateHoopsTakeover(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.takeoverLevel < 5 || this.takeoverActive) return;
    this.takeoverActive = true;
    this.takeoverActiveTimer = 16.0;
    this.takeoverAuraMesh.visible = true;
    this.crowdExcite = 1.0;
    this.popBanner(`🔥 ${this.takeoverName.toUpperCase()} TAKEOVER IGNITED!`, '#f97316', 1.6);
    ArcadeAudio.play('win');
    this.pushHudSnapshot();
  }

  toggleHoopsCamera(): void {
    const s = playerState.hoops2k26.settings;
    s.cameraAngle = s.cameraAngle === '2k' ? 'broadcast' : '2k';
    persistHoops2K26();
    this.popBanner(
      s.cameraAngle === '2k' ? 'CAMERA: 2K NORTH-SOUTH' : 'CAMERA: BROADCAST SIDELINE',
      '#38bdf8',
      1.1
    );
    this.pushHudSnapshot();
  }

  simHoopsToEnd(): void {
    if (this.gameOver) return;
    // Simulate realistic remaining possessions so players can test 5m/12m games & reach the 4-Tab Post-Game Summary cleanly
    if (this.targetScore) {
      const needHome = Math.max(0, this.targetScore - this.homeScore);
      const userWins = this.homeScore >= this.awayScore || Math.random() < 0.65;
      if (userWins) {
        this.homeScore = Math.max(this.homeScore + 2, this.targetScore);
        this.awayScore = Math.min(this.homeScore - 2, Math.max(this.awayScore, this.targetScore - 4));
      } else {
        this.awayScore = Math.max(this.awayScore + 2, this.targetScore);
        this.homeScore = Math.min(this.awayScore - 2, Math.max(this.homeScore, this.targetScore - 3));
      }
      this.stats.pts += Math.max(2, Math.round(needHome * 0.55));
      this.stats.reb += 2;
      this.stats.ast += 2;
    } else {
      const remQuarters = Math.max(0.25, this.maxQuarters - this.quarter + this.quarterClock / Math.max(1, this.quarterLengthSec));
      const homeAdd = Math.round(remQuarters * (18 + this.homeTeam.shootRating * 1.4));
      const awayAdd = Math.round(remQuarters * (17 + this.awayTeam.shootRating * 1.2));
      this.homeScore += homeAdd;
      this.awayScore += awayAdd;
      if (this.homeScore === this.awayScore) this.homeScore += 3;
      this.stats.pts += Math.round(homeAdd * 0.34);
      this.stats.reb += Math.max(1, Math.round(remQuarters * 2.1));
      this.stats.ast += Math.max(1, Math.round(remQuarters * 2.4));
      this.stats.fgm += Math.round((homeAdd * 0.34) / 2.3);
      this.stats.fga += Math.round((homeAdd * 0.34) / 1.4);
      this.quarter = this.maxQuarters;
      this.quarterClock = 0;
    }
    this.finishMatch();
  }

  handleKey(key: string): void {
    const k = key.toLowerCase();
    if (k === 'tab' || k === 'e') {
      this.toggleIconPassing();
    } else if (k === 'q') {
      this.callHoopsPlay();
    } else if (k === 't') {
      this.activateHoopsTakeover();
    } else if (k === 'c') {
      this.toggleHoopsCamera();
    } else if (this.iconPassingActive && (k === '1' || k === '2' || k === '3' || k === '4' || k === '5')) {
      const slotNum = parseInt(k, 10) - 1;
      const targets = this.getIconPassTargets();
      if (targets[slotNum]) {
        this.triggerIconPass(targets[slotNum].index);
      }
    }
  }

  private syncCameraFov(): void {
    if (!this.three) return;
    const portrait = this.three.height > this.three.width;
    const nextFov = portrait ? 56 : 44;
    if (this.three.camera.fov !== nextFov) {
      this.three.camera.fov = nextFov;
      this.three.camera.updateProjectionMatrix();
    }
  }

  setMoveDir(dx: number, dy: number): void {
    this.moveDx = Math.max(-1, Math.min(1, dx));
    this.moveDy = Math.max(-1, Math.min(1, dy));
  }

  setSteerLeft(down: boolean): void {
    this.steerLeftHeld = down;
  }

  setSteerRight(down: boolean): void {
    this.steerRightHeld = down;
  }

  jump(): void {
    this.triggerAction('pass', true);
  }

  attack(): void {
    this.triggerAction('shoot', true);
  }

  triggerAction(actionKey: string, pressed: boolean): void {
    if (this.gameOver || this.isPaused) return;

    if (actionKey === 'sprint' || actionKey === 'boost') {
      this.sprintHeld = pressed;
      return;
    }

    if (actionKey === 'shoot' || actionKey === 'action') {
      this.shootHeld = pressed;
      if (pressed) {
        this.onShootPressed();
      } else {
        this.onShootReleased();
      }
      return;
    }

    if ((actionKey === 'pass' || actionKey === 'jump') && pressed) {
      this.onPassOrSwitch();
      return;
    }

    if (actionKey === 'steal' && pressed) {
      this.onStealPressed();
    }
  }

  private getEffectiveJerseyColor(team: Hoops2K26TeamDef, isHome: boolean): number {
    if (!isHome) return team.jerseyColor;
    const variant = this.matchCtx.homeJerseyVariant;
    if (variant === 'away') return team.awayJerseyColor;
    if (variant === 'city') return team.cityJerseyColor;
    return team.jerseyColor;
  }

  private buildArena(): void {
    const theme = this.matchCtx.courtTheme;
    const outdoor = this.isOutdoorCourt();
    const isMyCourt = theme === 'mycourt';
    const mc = playerState.hoops2k26.myCourt;

    const apronColor = outdoor
      ? theme === 'street_kings'
        ? 0x431407
        : 0x334155
      : theme === 'the_rec'
        ? 0x111827
        : 0x0f172a;
    const apron = new THREE.Mesh(
      new THREE.PlaneGeometry(outdoor ? 160 : 80, outdoor ? 160 : 54),
      new THREE.MeshLambertMaterial({ color: apronColor })
    );
    apron.rotation.x = -Math.PI / 2;
    apron.position.y = -0.03;
    apron.receiveShadow = true;
    this.three.scene.add(apron);

    // Outdoor skyline silhouettes so outdoor Park / Blacktop / Street Kings feels genuinely open-air!
    if (outdoor) {
      for (let i = 0; i < 20; i++) {
        const ang = (i / 20) * Math.PI * 2;
        const dist = 54 + (i % 3) * 8;
        const h = 14 + ((i * 5) % 18);
        const tower = new THREE.Mesh(
          new THREE.BoxGeometry(6 + (i % 3) * 2, h, 6 + (i % 2) * 2),
          new THREE.MeshLambertMaterial({ color: theme === 'street_kings' ? 0x292524 : 0x475569 })
        );
        tower.position.set(Math.cos(ang) * dist, h * 0.5 - 0.1, Math.sin(ang) * dist);
        this.three.scene.add(tower);
      }
    }

    const courtTex = this.three.createCanvasTexture(
      1024,
      (ctx, s) => {
        const toX = (wx: number) => ((wx + COURT_HALF_LEN) / (COURT_HALF_LEN * 2)) * s;
        const toZ = (wz: number) => ((wz + COURT_HALF_WID) / (COURT_HALF_WID * 2)) * s;
        const rx = (r: number) => (r / (COURT_HALF_LEN * 2)) * s;
        const rz = (r: number) => (r / (COURT_HALF_WID * 2)) * s;

        if (outdoor) {
          ctx.fillStyle = theme === 'street_kings' ? '#44403c' : '#1e293b';
          ctx.fillRect(0, 0, s, s);
          for (let px = 0; px < s; px += 32) {
            ctx.fillStyle = px % 64 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)';
            ctx.fillRect(px, 0, 32, s);
          }
        } else {
          const plankCols = 28;
          const plankH = s / plankCols;
          const baseWood = isMyCourt ? mc.woodHex : theme === 'the_rec' ? '#c89b6e' : '#d99c52';
          const tones = isMyCourt
            ? [baseWood, baseWood, '#d6a46c', baseWood]
            : ['#d99c52', '#cf9146', '#e1a862', '#c8873d'];
          for (let r = 0; r < plankCols; r++) {
            ctx.fillStyle = tones[r % tones.length];
            ctx.fillRect(0, r * plankH, s, plankH + 1);
            ctx.strokeStyle = 'rgba(110, 62, 18, 0.22)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, r * plankH);
            ctx.lineTo(s, r * plankH);
            ctx.stroke();
          }
        }

        const keyLen = 5.4;
        const keyHalfW = 2.6;
        const homePaint = isMyCourt ? mc.paintHex : `${this.homeTeam.accentHex}cc`;
        const awayPaint = isMyCourt ? mc.paintHex : `${this.awayTeam.accentHex}cc`;
        ctx.fillStyle = awayPaint;
        ctx.fillRect(toX(-COURT_HALF_LEN), toZ(-keyHalfW), rx(keyLen), rz(keyHalfW * 2));
        ctx.fillStyle = homePaint;
        ctx.fillRect(toX(COURT_HALF_LEN - keyLen), toZ(-keyHalfW), rx(keyLen), rz(keyHalfW * 2));

        // Center court medallion
        const centerText = isMyCourt
          ? mc.centerLogoText || 'MyCOURT'
          : theme === 'the_rec'
            ? 'THE REC'
            : theme === 'proving_grounds'
              ? 'PROVING'
              : theme === 'theater'
                ? 'THEATER'
                : theme === 'open_court'
                  ? '3X BADGES'
                  : theme === 'wnba_arena'
                    ? 'THE W'
                    : outdoor
                      ? 'PARK 21'
                      : '2K26';

        ctx.fillStyle = isMyCourt ? mc.paintHex : this.homeTeam.accentHex;
        ctx.beginPath();
        ctx.ellipse(toX(0), toZ(0), rx(3.4), rz(3.4), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(toX(0), toZ(0), rx(2.85), rz(2.85), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 34px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(centerText, toX(0), toZ(0));

        // Court markings
        ctx.strokeStyle = isMyCourt ? mc.lineHex : '#f8fafc';
        ctx.lineWidth = 5;
        ctx.strokeRect(3, 3, s - 6, s - 6);

        ctx.beginPath();
        ctx.moveTo(toX(0), 0);
        ctx.lineTo(toX(0), s);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(toX(0), toZ(0), rx(3.4), rz(3.4), 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeRect(toX(-COURT_HALF_LEN), toZ(-keyHalfW), rx(keyLen), rz(keyHalfW * 2));
        ctx.strokeRect(toX(COURT_HALF_LEN - keyLen), toZ(-keyHalfW), rx(keyLen), rz(keyHalfW * 2));

        ctx.beginPath();
        ctx.ellipse(toX(-COURT_HALF_LEN + keyLen), toZ(0), rx(1.8), rz(1.8), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(toX(COURT_HALF_LEN - keyLen), toZ(0), rx(1.8), rz(1.8), 0, 0, Math.PI * 2);
        ctx.stroke();

        // Three-point arcs
        ctx.beginPath();
        ctx.moveTo(toX(-COURT_HALF_LEN), toZ(-CORNER_THREE_Z));
        ctx.lineTo(toX(-HOOP_X), toZ(-CORNER_THREE_Z));
        ctx.moveTo(toX(-COURT_HALF_LEN), toZ(CORNER_THREE_Z));
        ctx.lineTo(toX(-HOOP_X), toZ(CORNER_THREE_Z));
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(toX(-HOOP_X), toZ(0), rx(THREE_PT_RADIUS), rz(THREE_PT_RADIUS), 0, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX(COURT_HALF_LEN), toZ(-CORNER_THREE_Z));
        ctx.lineTo(toX(HOOP_X), toZ(-CORNER_THREE_Z));
        ctx.moveTo(toX(COURT_HALF_LEN), toZ(CORNER_THREE_Z));
        ctx.lineTo(toX(HOOP_X), toZ(CORNER_THREE_Z));
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(toX(HOOP_X), toZ(0), rx(THREE_PT_RADIUS), rz(THREE_PT_RADIUS), 0, Math.PI / 2, (Math.PI * 3) / 2);
        ctx.stroke();
      },
      1,
      1
    );
    courtTex.wrapS = THREE.ClampToEdgeWrapping;
    courtTex.wrapT = THREE.ClampToEdgeWrapping;

    const hardwood = new THREE.Mesh(
      new THREE.PlaneGeometry(COURT_HALF_LEN * 2, COURT_HALF_WID * 2),
      new THREE.MeshStandardMaterial({ map: courtTex, roughness: outdoor ? 0.72 : 0.34, metalness: 0.06 })
    );
    hardwood.rotation.x = -Math.PI / 2;
    hardwood.receiveShadow = true;
    this.three.scene.add(hardwood);

    // LED Scorer's Table along far sideline
    const ledTable = new THREE.Mesh(
      new THREE.BoxGeometry(24, 1.05, 0.9),
      createToonMaterial(0x1e293b, { emissive: 0x0f172a, emissiveIntensity: 0.35 })
    );
    ledTable.position.set(0, 0.52, -13.4);
    addInkOutline(ledTable, 1.03);
    const ledStrip = new THREE.Mesh(
      new THREE.BoxGeometry(22.4, 0.52, 0.94),
      new THREE.MeshBasicMaterial({ color: this.homeTeam.jerseyColor })
    );
    ledStrip.position.set(0, 0.54, -13.4);
    this.three.scene.add(ledTable, ledStrip);

    // MyCOURT Back Wall Mural if in MyCOURT
    if (isMyCourt) {
      const muralColor =
        mc.muralTheme === 'northern_lights'
          ? 0x7c3aed
          : mc.muralTheme === 'sunset_city'
            ? 0xf97316
            : mc.muralTheme === 'championship_gold'
              ? 0xeab308
              : 0x334155;
      const muralWall = new THREE.Mesh(
        new THREE.BoxGeometry(46, 9.5, 0.6),
        createToonMaterial(muralColor, { emissive: muralColor, emissiveIntensity: 0.2 })
      );
      muralWall.position.set(0, 4.75, -15.5);
      this.three.scene.add(muralWall);
    }

    // Hoop Stanchions
    this.leftNetMesh = this.buildHoopStanchion(-1);
    this.rightNetMesh = this.buildHoopStanchion(1);

    // Bleachers & Crowd (skip heavy bleachers in private MyCOURT)
    const standMat = createToonMaterial(outdoor ? 0x334155 : 0x1e293b);
    if (!isMyCourt) {
      const northStand = new THREE.Mesh(new THREE.BoxGeometry(58, outdoor ? 2.6 : 5.2, 8.5), standMat);
      northStand.position.set(0, outdoor ? 1.3 : 2.5, -18.8);
      this.three.scene.add(northStand);
      if (!outdoor) {
        const westStand = new THREE.Mesh(new THREE.BoxGeometry(7.5, 4.4, 34), standMat);
        westStand.position.set(-28.5, 2.1, -1.5);
        const eastStand = new THREE.Mesh(new THREE.BoxGeometry(7.5, 4.4, 34), standMat);
        eastStand.position.set(28.5, 2.1, -1.5);
        this.three.scene.add(westStand, eastStand);
      }
    }

    const specGeo = new THREE.BoxGeometry(0.68, 1.15, 0.52);
    const specMat = createToonMaterial(0xffffff);
    const maxSpecs = isMyCourt ? 16 : 160;
    this.crowdMesh = new THREE.InstancedMesh(specGeo, specMat, maxSpecs);
    const palette = [
      new THREE.Color(this.homeTeam.jerseyColor),
      new THREE.Color(this.homeTeam.trimColor),
      new THREE.Color(0xe2e8f0),
      new THREE.Color(this.awayTeam.jerseyColor),
      new THREE.Color(0x64748b)
    ];

    let count = 0;
    const rows = isMyCourt ? 1 : outdoor ? 2 : 3;
    for (let row = 0; row < rows && count < maxSpecs; row++) {
      for (let x = -24; x <= 24 && count < maxSpecs; x += isMyCourt ? 3.4 : 1.45) {
        const y = 1.8 + row * 1.45;
        const z = -15.4 - row * 1.85;
        this.crowdBasePos.push({ x, y, z, phase: count * 0.7 });
        _dummyPos.set(x, y, z);
        _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
        this.crowdMesh.setMatrixAt(count, _dummyMatrix);
        this.crowdMesh.setColorAt(count, palette[count % palette.length]);
        count++;
      }
    }
    this.crowdMesh.count = count;
    this.crowdMesh.instanceMatrix.needsUpdate = true;
    if (this.crowdMesh.instanceColor) this.crowdMesh.instanceColor.needsUpdate = true;
    this.crowdMesh.computeBoundingSphere();
    this.three.scene.add(this.crowdMesh);
  }

  private buildHoopStanchion(sideDir: -1 | 1): THREE.Mesh {
    const hoopX = sideDir * HOOP_X;
    const baseX = sideDir * 22.3;
    const boardX = sideDir * 19.45;
    const group = new THREE.Group();
    const isMyCourt = this.matchCtx.courtTheme === 'mycourt';
    const stanchionCol = isMyCourt ? hexStrToNum(playerState.hoops2k26.myCourt.stanchionHex, 0x1e293b) : 0x1e293b;

    const postMat = createToonMaterial(stanchionCol);
    const padMat = createToonMaterial(
      isMyCourt
        ? hexStrToNum(playerState.hoops2k26.myCourt.paintHex, this.homeTeam.jerseyColor)
        : sideDir === 1
          ? this.homeTeam.jerseyColor
          : this.awayTeam.jerseyColor
    );
    const rimMat = createToonMaterial(0xf97316, { emissive: 0x9a3412, emissiveIntensity: 0.25 });

    const basePad = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.35, 1.25), padMat);
    basePad.position.set(baseX, 0.68, 0);
    basePad.castShadow = true;
    addInkOutline(basePad, 1.05);

    const upright = new THREE.Mesh(new THREE.BoxGeometry(0.45, 3.6, 0.45), postMat);
    upright.position.set(baseX, 2.2, 0);
    addInkOutline(upright, 1.06);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.34, 0.36), postMat);
    arm.position.set(baseX - sideDir * 1.3, 3.55, 0);
    addInkOutline(arm, 1.05);

    const boardMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.42,
      roughness: 0.15,
      metalness: 0.1,
      depthWrite: false
    });
    const backboard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.55, 2.4), boardMat);
    backboard.position.set(boardX, RIM_Y + 0.55, 0);
    backboard.renderOrder = 3;

    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 2.46), createToonMaterial(0xf8fafc));
    frameTop.position.set(boardX, RIM_Y + 1.32, 0);
    const frameBot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 2.46), createToonMaterial(0xf8fafc));
    frameBot.position.set(boardX, RIM_Y - 0.22, 0);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.048, 10, 24), rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(hoopX, RIM_Y, 0);

    const netGeo = new THREE.CylinderGeometry(0.42, 0.23, 0.62, 12, 1, true);
    const netMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const net = new THREE.Mesh(netGeo, netMat);
    net.position.set(hoopX, RIM_Y - 0.32, 0);

    group.add(basePad, upright, arm, backboard, frameTop, frameBot, rim, net);
    this.three.scene.add(group);
    return net;
  }

  private buildPlayDiagramAndVfx(): void {
    // 3D PlayVision Hardwood Arrows / Target Rings
    this.playDiagramGroup = new THREE.Group();
    this.playDiagramGroup.position.y = 0.06;
    this.three.scene.add(this.playDiagramGroup);
    this.refreshPlayDiagramVisual();

    // 3D Perfect Release VFX Group (Flame / Crown / Burst around shooter)
    this.releaseVfxGroup = new THREE.Group();
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x4ade80,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88
    });
    const outerRing = new THREE.Mesh(new THREE.RingGeometry(0.75, 1.15, 24), ringMat);
    outerRing.rotation.x = -Math.PI / 2;
    const crownMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.08, 8, 18),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    crownMesh.rotation.x = Math.PI / 2;
    crownMesh.position.y = 2.6;
    this.releaseVfxGroup.add(outerRing, crownMesh);
    this.releaseVfxGroup.visible = false;
    this.three.scene.add(this.releaseVfxGroup);

    // Glowing Takeover Ignition Aura Ring
    this.takeoverAuraMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.35, 32),
      new THREE.MeshBasicMaterial({
        color: 0xf97316,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.86,
        depthWrite: false
      })
    );
    this.takeoverAuraMesh.rotation.x = -Math.PI / 2;
    this.takeoverAuraMesh.position.y = 0.07;
    this.takeoverAuraMesh.visible = false;
    this.three.scene.add(this.takeoverAuraMesh);
  }

  private refreshPlayDiagramVisual(): void {
    while (this.playDiagramGroup.children.length > 0) {
      this.playDiagramGroup.remove(this.playDiagramGroup.children[0]);
    }
    const pv = playerState.hoops2k26.settings.playVision;
    if (pv === 'off' || this.activePlayIdx === 0) return;

    const play = PLAY_BOOK[this.activePlayIdx];
    const mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.72,
      depthWrite: false
    });
    const spotRing = new THREE.Mesh(new THREE.RingGeometry(0.7, 1.05, 20), mat);
    spotRing.rotation.x = -Math.PI / 2;
    spotRing.position.set(11.5, 0, play.offsetZ);

    const arrowShaft = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 0.35), mat);
    arrowShaft.rotation.x = -Math.PI / 2;
    arrowShaft.position.set(8.5, 0, play.offsetZ * 0.6);

    this.playDiagramGroup.add(spotRing, arrowShaft);
  }

  private spawnTeams(): void {
    this.players = [];
    const n = this.playersPerSide;
    const roleIndices = n === 1 ? [0] : n === 2 ? [0, 4] : n === 3 ? [0, 2, 4] : [0, 1, 2, 3, 4];
    const mp = getActiveMyPlayer(playerState.hoops2k26);
    const shoe =
      playerState.hoops2k26.customShoes.find((s) => s.id === mp.equippedShoeId) ??
      playerState.hoops2k26.customShoes[0];
    const shoePalette = shoe
      ? {
          upper: hexStrToNum(shoe.upperHex, 0x111827),
          sole: hexStrToNum(shoe.soleHex, 0xf8fafc),
          accent: hexStrToNum(shoe.accentHex, 0xf59e0b)
        }
      : undefined;

    for (let teamIdx = 0; teamIdx < 2; teamIdx++) {
      const team: 'home' | 'away' = teamIdx === 0 ? 'home' : 'away';
      const def = team === 'home' ? this.homeTeam : this.awayTeam;
      const jerseyColor = this.getEffectiveJerseyColor(def, team === 'home');
      for (let i = 0; i < n; i++) {
        const rIdx = roleIndices[i];
        const slot = ROLE_SLOTS[rIdx];
        const starter = def.starters[rIdx] ?? def.starters[0];
        const isControlledMyPlayer = team === 'home' && i === 0 && this.matchCtx.useMyPlayer;
        const playerName = isControlledMyPlayer ? mp.name : starter.name;
        const playerRole: CourtRole = isControlledMyPlayer ? mp.position : starter.role;

        const rig = buildBasketballPlayerMesh(
          jerseyColor,
          def.trimColor,
          starter.skin,
          team === 'home',
          isControlledMyPlayer ? 0.96 + (mp.heightIn - 72) * 0.015 : starter.scale,
          true,
          team === 'home' && i === 0 ? shoePalette : undefined
        );
        this.three.scene.add(rig.group);
        this.players.push({
          index: teamIdx * n + i,
          team,
          role: playerRole,
          name: playerName,
          rig,
          x: 0,
          z: 0,
          y: 0,
          vx: 0,
          vz: 0,
          vy: 0,
          facingYaw: team === 'home' ? Math.PI / 2 : -Math.PI / 2,
          stamina: 1.0,
          sprinting: false,
          homeSlotX: slot.offX,
          homeSlotZ: slot.offZ,
          stealCd: 0,
          stunTimer: 0,
          blockTimer: 0,
          animPhase: i * 1.1,
          pointsScored: 0
        });
      }
    }
    this.updateActiveRing();
  }

  private buildBasketball(): void {
    this.ballGroup = new THREE.Group();
    const ballMat = createToonMaterial(0xea580c);
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), ballMat);
    sphere.castShadow = true;
    addInkOutline(sphere, 1.09);

    const seamMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const seamA = new THREE.Mesh(new THREE.TorusGeometry(0.242, 0.015, 6, 18), seamMat);
    const seamB = new THREE.Mesh(new THREE.TorusGeometry(0.242, 0.015, 6, 18), seamMat);
    seamB.rotation.y = Math.PI / 2;

    this.ballGroup.add(sphere, seamA, seamB);
    this.three.scene.add(this.ballGroup);

    this.ballShadow = createContactShadowMesh(0.36, 0.45);
    this.three.scene.add(this.ballShadow);
  }

  private updateActiveRing(): void {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].rig.activeRing.visible = i === this.controlledIdx;
    }
  }

  private resetHalfCourtSetup(offenseTeam: 'home' | 'away', isTipoff = false): void {
    const n = this.playersPerSide;
    const roleIndices = n === 1 ? [0] : n === 2 ? [0, 4] : n === 3 ? [0, 2, 4] : [0, 1, 2, 3, 4];
    this.possession = offenseTeam;
    this.ballMode = 'held';
    this.meterActive = false;
    this.meterProgress = 0;
    this.iconPassingActive = false;
    this.shotClock = this.targetScore ? SHOT_CLOCK_SEC : Math.min(SHOT_CLOCK_SEC, Math.max(0.5, this.quarterClock));

    const offSign = offenseTeam === 'home' ? 1 : -1;
    for (let i = 0; i < n; i++) {
      const slot = ROLE_SLOTS[roleIndices[i]];
      const homeP = this.players[i];
      const awayP = this.players[n + i];

      if (offenseTeam === 'home') {
        homeP.x = isTipoff && i === 0 ? -1.5 : -6.5 + i * 1.4;
        homeP.z = slot.offZ * 0.72;
        awayP.x = 7.5 + i * 2.1;
        awayP.z = slot.offZ * 0.65;
      } else {
        awayP.x = 6.5 - i * 1.4;
        awayP.z = slot.offZ * 0.72;
        homeP.x = -7.5 - i * 2.1;
        homeP.z = slot.offZ * 0.65;
      }
      homeP.y = 0;
      awayP.y = 0;
      homeP.vy = 0;
      awayP.vy = 0;
      homeP.vx = 0;
      homeP.vz = 0;
      awayP.vx = 0;
      awayP.vz = 0;
      homeP.facingYaw = offSign * (Math.PI / 2);
      awayP.facingYaw = offSign * (Math.PI / 2);
    }

    this.carrierIdx = offenseTeam === 'home' ? 0 : n;
    this.controlledIdx = 0;
    this.updateActiveRing();
    this.syncActionLabels();

    const carrier = this.players[this.carrierIdx];
    this.ballX = carrier.x + offSign * 0.55;
    this.ballY = 0.95;
    this.ballZ = carrier.z;
    this.syncMeshes();
    this.pushHudSnapshot();
  }

  private syncActionLabels(): void {
    const nextLabel = this.possession === 'home' ? 'SHOOT' : 'BLOCK';
    if (nextLabel !== this.lastActionBtnMode) {
      this.lastActionBtnMode = nextLabel;
      setActionButtonLabel(nextLabel);
    }
  }

  private applyGradeEvent(event: TeammateGradeEvent, label: string, takeoverDelta = 0): void {
    const res = stepTeammateGrade(this.teammateGradeScore, event);
    this.teammateGradeScore = res.score;
    this.teammateGrade = res.grade;
    this.gradeFlash = `${res.delta >= 0 ? '+' : ''}${label}`;
    this.gradeFlashTimer = 1.6;
    if (takeoverDelta !== 0 && !this.takeoverActive) {
      const tk = stepTakeoverMeter(this.takeoverMeter, takeoverDelta);
      this.takeoverMeter = tk.meter;
      this.takeoverLevel = tk.level;
    }
  }

  private getHotZoneForPosition(x: number, z: number): 'cold' | 'neutral' | 'hot' | 'lethal' {
    const mp = getActiveMyPlayer(playerState.hoops2k26);
    if (Math.hypot(x - HOOP_X, z) < 4.5) return mp.hotZones.paint;
    if (z < -7.5) return mp.hotZones.left_corner;
    if (z > 7.5) return mp.hotZones.right_corner;
    if (z < -2.2) return mp.hotZones.left_wing;
    if (z > 2.2) return mp.hotZones.right_wing;
    return mp.hotZones.top_key;
  }

  private onShootPressed(): void {
    const p = this.players[this.controlledIdx];
    if (!p || this.inboundPause > 0 || this.quarterBreakPause > 0) return;

    if (this.ballMode === 'held' && this.carrierIdx === this.controlledIdx) {
      if (canAttemptDunk(p.x, p.z, HOOP_X, p.sprinting || this.sprintHeld, p.stamina)) {
        this.startDunk(p);
        return;
      }

      const defenderDistances: number[] = [];
      const n = this.playersPerSide;
      for (let i = n; i < n * 2; i++) {
        defenderDistances.push(Math.hypot(this.players[i].x - p.x, this.players[i].z - p.z));
      }

      const prof = playerState.hoops2k26;
      const mp = getActiveMyPlayer(prof);
      const jsEval = evaluateCustomJumpShot(mp.jumpShot);
      const effectiveShootRating = this.matchCtx.useMyPlayer
        ? Math.max(2, Math.min(5, 1 + (mp.attributes.shooting - 55) / 11))
        : this.homeTeam.shootRating;

      const win = computeShotWindowEnhanced({
        shooterPos: { x: p.x, z: p.z },
        hoopX: HOOP_X,
        defenderDistances,
        shootRating: effectiveShootRating,
        staminaRatio: p.stamina,
        sprinting: p.sprinting || this.sprintHeld,
        jumpShotMeterOff: prof.settings.jumpShotMeterOff,
        jumpShotGreenBonus: jsEval.greenWindowBonus,
        hotZoneHeat: this.getHotZoneForPosition(p.x, p.z),
        takeoverActive: this.takeoverActive,
        skillBoostActive: prof.skillBoosts > 0
      });

      this.meterActive = true;
      this.meterProgress = 0;
      this.meterGreenStart = win.greenStart;
      this.meterGreenEnd = win.greenEnd;
      this.meterBaseProb = win.baseMakeProb;
      this.meterPoints = win.points;
      this.meterCoverage = win.coverageLabel;
      this.meterOffBoostApplied = win.meterOffBoostApplied;
      p.vy = 4.6;
      return;
    }

    if (p.y <= 0.05 && p.blockTimer <= 0) {
      p.vy = 6.2;
      p.blockTimer = 0.55;
      ArcadeAudio.play('jump');
    }
  }

  private onShootReleased(): void {
    if (!this.meterActive) return;
    this.releaseUserShot();
  }

  private releaseUserShot(): void {
    const shooter = this.players[this.controlledIdx];
    this.meterActive = false;

    if (!shooter || this.ballMode !== 'held' || this.carrierIdx !== this.controlledIdx) {
      return;
    }

    const evalRes = evaluateShotRelease(
      this.meterProgress,
      this.meterGreenStart,
      this.meterGreenEnd,
      this.meterBaseProb,
      this.meterPoints
    );

    this.stats.fga += 1;
    if (evalRes.points === 3) this.stats.tpa += 1;

    const willMake = evalRes.isGreen ? true : Math.random() < evalRes.makeProb;
    const timingStr = evalRes.isGreen
      ? 'EXCELLENT'
      : evalRes.quality === 'GREAT'
        ? 'GREAT'
        : evalRes.quality === 'EARLY'
          ? 'SLIGHTLY EARLY'
          : 'SLIGHTLY LATE';

    if (playerState.hoops2k26.settings.shotFeedback !== 'off') {
      this.shotFeedback = {
        timing: timingStr,
        coverage: this.meterCoverage,
        isGreen: evalRes.isGreen,
        ttl: 2.2
      };
    }

    if (evalRes.isGreen) {
      this.stats.greens += 1;
      this.releaseVfxGroup.position.set(shooter.x, 0.08, shooter.z);
      this.releaseVfxGroup.visible = true;
      this.releaseVfxTimer = 1.25;
      this.popBanner(
        this.meterOffBoostApplied ? 'GREEN RELEASE (+METER OFF BOOST)!' : 'EXCELLENT GREEN RELEASE!',
        '#4ade80',
        1.2
      );
      this.crowdExcite = Math.min(1, this.crowdExcite + 0.55);
    } else if (evalRes.quality === 'EARLY') {
      this.popBanner(`SLIGHTLY EARLY · ${this.meterCoverage}`, '#fbbf24', 0.85);
    } else if (evalRes.quality === 'LATE') {
      this.popBanner(`SLIGHTLY LATE · ${this.meterCoverage}`, '#f87171', 0.85);
    }

    this.launchShot(shooter, HOOP_X, evalRes.points, willMake, evalRes.isGreen);
    this.pushHudSnapshot();
  }

  private startDunk(p: HoopPlayer): void {
    this.ballMode = 'dunk';
    this.meterActive = false;
    this.dunkFromX = p.x;
    this.dunkFromZ = p.z;
    this.dunkTargetX = HOOP_X - 0.55;
    this.dunkTimer = 0;
    this.dunkDuration = 0.42;
    this.stats.fga += 1;
    p.stamina = Math.max(0, p.stamina - 0.14);
    ArcadeAudio.play('jump');
    this.popBanner('POSTERIZER DRIVE!', this.homeTeam.accentHex, 0.85);
  }

  private launchShot(
    shooter: HoopPlayer,
    targetHoopX: number,
    points: 2 | 3,
    willMake: boolean,
    wasGreen: boolean
  ): void {
    this.ballMode = 'shot';
    this.shotStartX = this.ballX;
    this.shotStartY = Math.max(2.3, shooter.y + 2.35);
    this.shotStartZ = this.ballZ;

    const dir = targetHoopX > 0 ? 1 : -1;
    this.shotTargetX = willMake ? targetHoopX : targetHoopX - dir * 0.44;
    this.shotTargetZ = willMake ? 0 : Math.random() > 0.5 ? 0.36 : -0.36;

    const dist = Math.hypot(targetHoopX - shooter.x, shooter.z);
    this.shotDuration = Math.max(0.55, Math.min(1.08, 0.46 + dist * 0.032));
    this.shotPeakY = Math.max(this.shotStartY + 1.5, RIM_Y + 2.0 + dist * 0.13);
    this.shotTimer = 0;
    this.shotWillMake = willMake;
    this.shotPoints = points;
    this.shotTeam = shooter.team;
    this.shotWasGreen = wasGreen;
    this.shotShooterIdx = shooter.index;

    shooter.facingYaw = Math.atan2(targetHoopX - shooter.x, -shooter.z);
  }

  private onPassOrSwitch(): void {
    if (this.inboundPause > 0 || this.quarterBreakPause > 0) return;

    if (this.ballMode === 'held' && this.carrierIdx === this.controlledIdx && this.playersPerSide > 1) {
      const carrier = this.players[this.controlledIdx];
      const aimX = (this.steerRightHeld ? 1 : 0) - (this.steerLeftHeld ? 1 : 0) || this.moveDx;
      const aimZ = this.moveDy;

      const n = this.playersPerSide;
      const mates = this.players.slice(0, n).map((m) => ({ index: m.index, x: m.x, z: m.z }));
      const targetIdx = pickBestPassTargetIndex(
        { x: carrier.x, z: carrier.z },
        { x: aimX, z: aimZ },
        HOOP_X,
        this.controlledIdx,
        mates
      );

      if (targetIdx >= 0) {
        this.lastUserPassToIdx = targetIdx;
        this.lastUserPassTimer = 4.5;
        this.startPass(carrier, this.players[targetIdx]);
        this.controlledIdx = targetIdx;
        this.updateActiveRing();
      }
      return;
    }

    let bestIdx = this.controlledIdx;
    let bestDist = Infinity;
    for (let i = 0; i < this.playersPerSide; i++) {
      if (i === this.controlledIdx) continue;
      const d = Math.hypot(this.players[i].x - this.ballX, this.players[i].z - this.ballZ);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    if (bestIdx !== this.controlledIdx) {
      this.controlledIdx = bestIdx;
      this.updateActiveRing();
      ArcadeAudio.play('click');
    }
  }

  private startPass(from: HoopPlayer, to: HoopPlayer): void {
    this.ballMode = 'pass';
    this.passFromX = from.x;
    this.passFromY = 1.42;
    this.passFromZ = from.z;
    this.passTargetIdx = to.index;
    const dist = Math.hypot(to.x - from.x, to.z - from.z);
    this.passDuration = Math.max(0.18, Math.min(0.42, dist / 28));
    this.passTimer = 0;
    this.meterActive = false;
    ArcadeAudio.play('dribble');
  }

  private onStealPressed(): void {
    const p = this.players[this.controlledIdx];
    if (!p || p.stealCd > 0 || this.inboundPause > 0 || this.quarterBreakPause > 0) return;

    p.stealCd = 0.72;
    // Consume 1 Adrenaline Bar on defensive lunge / crossover burst
    const adr = stepAdrenalineBars(this.adrenalineBars, this.adrenalineRechargeTimer, 0, true, false);
    this.adrenalineBars = adr.bars;
    this.adrenalineRechargeTimer = adr.rechargeTimer;

    if (this.ballMode === 'held' && this.players[this.carrierIdx]?.team === 'away') {
      const opp = this.players[this.carrierIdx];
      const dist = Math.hypot(opp.x - p.x, opp.z - p.z);
      const dx = opp.x - p.x;
      const dz = opp.z - p.z;
      if (dist > 0.1) {
        p.x += (dx / dist) * Math.min(0.8, dist * 0.45);
        p.z += (dz / dist) * Math.min(0.8, dist * 0.45);
      }
      if (dist < 2.25) {
        const stealProb = 0.36 + (this.homeTeam.defRating - 3) * 0.08 + (this.takeoverActive ? 0.18 : 0);
        if (Math.random() < stealProb) {
          opp.stunTimer = 0.75;
          this.carrierIdx = p.index;
          this.possession = 'home';
          this.shotClock = this.targetScore ? SHOT_CLOCK_SEC : Math.min(SHOT_CLOCK_SEC, Math.max(0.5, this.quarterClock));
          this.score += 15;
          this.stats.stl += 1;
          this.applyGradeEvent('steal', 'STEAL', 75);
          updateInGameHud(this.score, this.level, this.gameIdx);
          ArcadeAudio.play('whistle');
          this.popBanner('GLOVE STEAL! +15', '#38bdf8', 1.15);
          this.syncActionLabels();
          this.pushHudSnapshot();
          return;
        }
      }
      ArcadeAudio.play('click');
    } else if (this.ballMode === 'held' && this.carrierIdx === this.controlledIdx && p.stamina > 0.1) {
      p.stamina = Math.max(0, p.stamina - 0.12);
      p.z = Math.max(-COURT_HALF_WID + 0.8, Math.min(COURT_HALF_WID - 0.8, p.z + (p.z >= 0 ? -1.1 : 1.1)));
      ArcadeAudio.play('dribble');
    }
  }

  private scoreBasket(team: 'home' | 'away', points: 2 | 3, label: string): void {
    const shooter = this.players[this.shotShooterIdx];
    if (shooter) shooter.pointsScored += points;

    if (team === 'home') {
      this.homeScore += points;
      this.rightNetShake = 1.0;
      this.stats.pts += points;
      this.stats.fgm += 1;
      if (points === 3) this.stats.tpm += 1;

      if (this.lastUserPassTimer > 0 && this.shotShooterIdx === this.lastUserPassToIdx) {
        this.stats.ast += 1;
        this.applyGradeEvent('assist', 'ASSIST', 65);
        this.lastUserPassTimer = 0;
      }

      if (this.shotWasGreen) {
        this.applyGradeEvent('green_make', 'GREEN BUCKET', 95);
      } else {
        this.applyGradeEvent('good_shot', 'GOOD SHOT', 65);
      }

      const ptsValue = points === 3 ? 35 : 25;
      const greenBonus = this.shotWasGreen ? 15 : 0;
      this.score += ptsValue + greenBonus;
      addCoins((points === 3 ? 20 : 12) + (this.shotWasGreen ? 10 : 0));
      addXp(18);
      updateInGameHud(this.score, this.level, this.gameIdx);
      this.popBanner(`${label} +${points}`, points === 3 ? '#4ade80' : '#facc15', 1.35);
    } else {
      this.awayScore += points;
      this.leftNetShake = 1.0;
      this.applyGradeEvent('defensive_breakdown', 'ALLOWED SCORE', -25);
      this.popBanner(`${this.awayTeam.abbr} SCORES +${points}`, '#f87171', 1.1);
    }

    ArcadeAudio.play('swish');
    this.crowdExcite = 1.0;

    // Check Park / Blacktop / Street Kings Target Score 21 win condition!
    if (this.targetScore && (this.homeScore >= this.targetScore || this.awayScore >= this.targetScore)) {
      this.finishMatch();
      return;
    }

    this.inboundPause = 0.85;
    this.pendingInboundTeam = team === 'home' ? 'away' : 'home';
    this.pushHudSnapshot();
  }

  private finishMatch(): void {
    ArcadeAudio.play('buzzer');
    this.gameOver = true;
    this.isRunning = false;
    this.meterActive = false;

    const won = this.homeScore >= this.awayScore;
    let winBonus = won ? 120 : 25;
    let coinReward = won ? 60 : 15;

    if (this.modeDef.id === 'tournament' && !playerState.hoops2k26.activeMatchContext) {
      const res = advanceTournamentBracket(playerState.hoopsTournament, won);
      playerState.hoopsTournament = res.nextState;
      coinReward += res.bonusCoins;
      if (res.wonChampionship) {
        playerState.hoopsChampionships++;
        winBonus += 250;
      }
      persistHoopsTournament();
    }

    this.score += this.homeScore * 10 + winBonus;
    addCoins(coinReward);
    addXp(won ? 85 : 30);

    // Compute & persist complete 4-Tab NBA 2K26 Post-Game Progression
    const prof = playerState.hoops2k26;
    const mp = getActiveMyPlayer(prof);
    const doubleXpActive = prof.doubleXpUntilMs > Date.now();
    const rewards = computeHoopsPostGameRewards({
      won,
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      points: this.stats.pts,
      rebounds: this.stats.reb,
      assists: this.stats.ast,
      steals: this.stats.stl,
      blocks: this.stats.blk,
      turnovers: this.stats.tov,
      greens: this.stats.greens,
      teammateGrade: this.teammateGrade,
      teammateGradeScore: this.teammateGradeScore,
      difficulty: prof.settings.difficulty,
      courtContext: this.matchCtx,
      crewLevel: prof.crewLevel,
      doubleXpActive
    });

    prof.vc += rewards.totalVc;
    prof.mtp += rewards.mtpEarned;
    prof.repXp += rewards.repXpEarned;
    prof.crewXp += rewards.crewXpEarned;
    if (prof.crewXp >= prof.crewLevel * 250 && prof.crewLevel < 30) {
      prof.crewXp -= prof.crewLevel * 250;
      prof.crewLevel += 1;
    }
    prof.plateScore = Math.max(0, Math.min(1000, prof.plateScore + rewards.plateDelta));
    prof.seasonXp += rewards.seasonXpEarned;
    prof.careerStats.gamesPlayed += 1;
    if (won) prof.careerStats.wins += 1;
    prof.careerStats.points += this.stats.pts;
    prof.careerStats.rebounds += this.stats.reb;
    prof.careerStats.assists += this.stats.ast;
    prof.careerStats.steals += this.stats.stl;
    prof.careerStats.blocks += this.stats.blk;
    prof.careerStats.greens += this.stats.greens;

    if (prof.skillBoosts > 0) prof.skillBoosts = Math.max(0, prof.skillBoosts - 1);
    if (prof.gatoradeBoosts > 0) prof.gatoradeBoosts = Math.max(0, prof.gatoradeBoosts - 1);

    mp.myPoints += rewards.myPointsEarned;
    mp.badgeXp += rewards.badgeXpEarned;
    if (this.matchCtx.courtTheme === 'nba_arena' && this.matchCtx.useMyPlayer) {
      mp.nbaSeasonGamesPlayed += 1;
      if (won) mp.nbaSeasonGamesWon += 1;
    }
    if (rewards.hotZoneUpgraded) {
      mp.hotZones.top_key = mp.hotZones.top_key === 'hot' ? 'lethal' : 'hot';
    }

    // Update Daily Challenges
    for (const task of prof.dailyChallenges.tasks) {
      if (task.id === 'dc_pts') task.progress = Math.min(task.target, task.progress + this.stats.pts);
      if (task.id === 'dc_green') task.progress = Math.min(task.target, task.progress + this.stats.greens);
      if (task.id === 'dc_win' && won) task.progress = Math.min(task.target, task.progress + 1);
    }

    persistHoops2K26();

    const repTier = getRepTierForXp(prof.repXp);
    const plate = getPlateTierForScore(prof.plateScore);
    const seasonLevel = Math.min(40, 1 + Math.floor(prof.seasonXp / 300));
    const leadPlayer = this.players[0];

    this.postGameSummary = {
      won,
      homeTeamName: this.homeTeam.name,
      homeAbbr: this.homeTeam.abbr,
      awayTeamName: this.awayTeam.name,
      awayAbbr: this.awayTeam.abbr,
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      courtLabel: this.matchCtx.sourceLabel,
      potgName: leadPlayer?.name ?? mp.name,
      potgLine: `${this.stats.pts} PTS · ${this.stats.reb} REB · ${this.stats.ast} AST · ${this.teammateGrade}`,
      playerName: leadPlayer?.name ?? mp.name,
      teammateGrade: this.teammateGrade,
      stats: { ...this.stats },
      rewards,
      repLabel: repTier.tier.label,
      plateLabel: plate.label,
      plateColorHex: plate.hex,
      crewLevel: prof.crewLevel,
      seasonLevel
    };

    this.pushHudSnapshot();
  }

  private popBanner(text: string, color: string, dur = 1.1): void {
    this.banner = { text, color, timer: dur, maxTimer: dur };
  }

  private getIconPassTargets(): Array<{ index: number; keyLabel: string; name: string; role: string }> {
    const out: Array<{ index: number; keyLabel: string; name: string; role: string }> = [];
    let keyNum = 1;
    for (let i = 0; i < this.playersPerSide; i++) {
      if (i === this.controlledIdx) continue;
      const m = this.players[i];
      if (!m) continue;
      out.push({
        index: m.index,
        keyLabel: String(keyNum++),
        name: m.name,
        role: m.role
      });
    }
    return out;
  }

  private pushHudSnapshot(): void {
    const activeP = this.players[this.controlledIdx] ?? this.players[0];
    const prof = playerState.hoops2k26;
    const snap: HoopsHudSnapshot = {
      courtLabel: this.matchCtx.sourceLabel,
      isOutdoorPark: this.isOutdoorCourt() || this.targetScore !== null,
      homeName: this.homeTeam.name,
      homeAbbr: this.homeTeam.abbr,
      homeAccent: this.homeTeam.accentHex,
      homeScore: this.homeScore,
      awayName: this.awayTeam.name,
      awayAbbr: this.awayTeam.abbr,
      awayAccent: this.awayTeam.accentHex,
      awayScore: this.awayScore,
      quarter: this.quarter,
      quarterClock: this.quarterClock,
      targetScore: this.targetScore,
      shotClock: this.shotClock,
      homeFouls: this.homeFouls,
      awayFouls: this.awayFouls,
      homeTimeouts: this.homeTimeouts,
      awayTimeouts: this.awayTimeouts,
      teammateGrade: this.teammateGrade,
      teammateGradeScore: this.teammateGradeScore,
      gradeFlash: this.gradeFlashTimer > 0 ? this.gradeFlash : '',
      playerName: activeP?.name ?? 'MyPLAYER',
      playerPos: activeP?.role ?? 'PG',
      stats: {
        pts: this.stats.pts,
        reb: this.stats.reb,
        ast: this.stats.ast,
        stl: this.stats.stl,
        blk: this.stats.blk,
        greens: this.stats.greens
      },
      takeoverMeter: this.takeoverMeter,
      takeoverLevel: this.takeoverLevel,
      takeoverActive: this.takeoverActive,
      takeoverName: this.takeoverName,
      adrenalineBars: this.adrenalineBars,
      stamina: activeP?.stamina ?? 1,
      shotMeterOffBoost: prof.settings.jumpShotMeterOff,
      shotFeedback: this.shotFeedback,
      iconPassingActive: this.iconPassingActive,
      iconPassTargets: this.getIconPassTargets(),
      activePlayName: PLAY_BOOK[this.activePlayIdx].name,
      coachScheme: COACH_SCHEMES[this.coachSchemeIdx],
      cameraAngle: prof.settings.cameraAngle,
      postGameSummary: this.postGameSummary
    };
    updateHoopsHud(snap);
  }

  private tick = (): void => {
    if (!this.isRunning || this.isPaused || this.gameOver) return;

    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const speedScale = Math.max(0.8, Math.min(1.2, playerState.hoops2k26.settings.gameSpeed / 50));
    const dt = Math.min(Math.max(rawDt, 0.001), 0.05) * speedScale;

    this.stepSimulation(dt);
    if (!this.isRunning || this.isPaused || this.gameOver) return;
    this.syncMeshes();
    this.updateCamera(dt);
    this.three.render();
    this.drawCourtOverlay();

    this.hudSyncTimer += dt;
    if (this.hudSyncTimer >= 0.12) {
      this.hudSyncTimer = 0;
      this.pushHudSnapshot();
    }

    if (this.isRunning && !this.isPaused && !this.gameOver) {
      this.three.scheduleNextFrame(this.tick);
    }
  };

  private stepSimulation(dt: number): void {
    if (this.banner) {
      this.banner.timer -= dt;
      if (this.banner.timer <= 0) this.banner = null;
    }
    if (this.gradeFlashTimer > 0) this.gradeFlashTimer = Math.max(0, this.gradeFlashTimer - dt);
    if (this.lastUserPassTimer > 0) this.lastUserPassTimer = Math.max(0, this.lastUserPassTimer - dt);
    if (this.shotFeedback) {
      this.shotFeedback.ttl -= dt;
      if (this.shotFeedback.ttl <= 0) this.shotFeedback = null;
    }
    if (this.releaseVfxTimer > 0) {
      this.releaseVfxTimer -= dt;
      this.releaseVfxGroup.rotation.y += dt * 4.5;
      this.releaseVfxGroup.scale.setScalar(1 + (1.25 - this.releaseVfxTimer) * 0.45);
      if (this.releaseVfxTimer <= 0) this.releaseVfxGroup.visible = false;
    }
    if (this.takeoverActive) {
      this.takeoverActiveTimer -= dt;
      this.takeoverMeter = Math.max(0, (this.takeoverActiveTimer / 16) * 500);
      this.takeoverLevel = Math.min(5, Math.floor(this.takeoverMeter / 100));
      if (this.takeoverActiveTimer <= 0) {
        this.takeoverActive = false;
        this.takeoverMeter = 0;
        this.takeoverLevel = 0;
        this.takeoverAuraMesh.visible = false;
      }
    }

    this.leftNetShake = Math.max(0, this.leftNetShake - dt * 2.4);
    this.rightNetShake = Math.max(0, this.rightNetShake - dt * 2.4);
    this.crowdExcite = Math.max(0, this.crowdExcite - dt * 0.65);
    this.camShake = Math.max(0, this.camShake - dt * 2.8);

    if (this.quarterBreakPause > 0) {
      this.quarterBreakPause -= dt;
      if (this.quarterBreakPause <= 0) {
        this.resetHalfCourtSetup(this.quarter % 2 === 1 ? 'home' : 'away', true);
      }
      return;
    }

    if (this.inboundPause > 0) {
      this.inboundPause -= dt;
      if (this.inboundPause <= 0) {
        this.resetHalfCourtSetup(this.pendingInboundTeam, false);
      }
      return;
    }

    // Advance Match & Shot clocks (for Target Score 21 games, only 24s shot clock runs)
    if (this.targetScore) {
      this.shotClock -= dt;
      if (this.shotClock <= 0) {
        ArcadeAudio.play('whistle');
        this.popBanner('24s SHOT CLOCK VIOLATION!', '#fbbf24', 1.2);
        if (this.possession === 'home') this.applyGradeEvent('shot_clock_violation', 'SHOT CLOCK', -40);
        this.shotClock = SHOT_CLOCK_SEC;
        this.inboundPause = 0.8;
        this.pendingInboundTeam = this.possession === 'home' ? 'away' : 'home';
        return;
      }
    } else {
      const clockStep = stepMatchClocks(
        this.quarter,
        this.quarterClock,
        this.shotClock,
        this.homeScore,
        this.awayScore,
        dt,
        this.maxQuarters,
        this.quarterLengthSec
      );
      this.quarter = clockStep.quarter;
      this.quarterClock = clockStep.quarterClock;
      this.shotClock = clockStep.shotClock;

      if (clockStep.matchOver) {
        this.finishMatch();
        return;
      }

      if (clockStep.quarterEnded) {
        ArcadeAudio.play('buzzer');
        this.quarterBreakPause = 1.5;
        this.homeFouls = 0;
        this.awayFouls = 0;
        const label = this.quarter > 4 ? 'OVERTIME!' : `QUARTER ${this.quarter}`;
        this.popBanner(label, '#38bdf8', 1.4);
        this.pushHudSnapshot();
        return;
      }

      if (clockStep.shotClockViolation) {
        ArcadeAudio.play('whistle');
        this.popBanner('24s SHOT CLOCK VIOLATION!', '#fbbf24', 1.25);
        if (this.possession === 'home') {
          this.stats.tov += 1;
          this.applyGradeEvent('shot_clock_violation', 'SHOT CLOCK', -40);
        }
        this.inboundPause = 0.85;
        this.pendingInboundTeam = this.possession === 'home' ? 'away' : 'home';
        return;
      }
    }

    // Advance Pro-Stick Shot Meter using Custom Jump Shot speed
    if (this.meterActive) {
      const mp = getActiveMyPlayer(playerState.hoops2k26);
      const jsEval = evaluateCustomJumpShot(mp.jumpShot);
      const meterSpeed = (1.24 + (5 - this.homeTeam.shootRating) * 0.05) * jsEval.meterSpeedMult;
      this.meterProgress = Math.min(1.0, this.meterProgress + meterSpeed * dt);
      if (this.meterProgress >= 1.0) {
        this.releaseUserShot();
      }
    }

    this.stepControlledPlayer(dt);
    this.stepAIPlayers(dt);
    this.stepBallPhysics(dt);
    this.animateCrowd();
  }

  private stepControlledPlayer(dt: number): void {
    const p = this.players[this.controlledIdx];
    if (!p) return;

    const rawInX = Math.abs(this.moveDx) > 0.08 ? this.moveDx : (this.steerRightHeld ? 1 : 0) - (this.steerLeftHeld ? 1 : 0);
    const rawInY = Math.abs(this.moveDy) > 0.08 ? this.moveDy : 0;

    // Remap screen input to world (X, Z) according to active Camera Angle!
    const settings = playerState.hoops2k26.settings;
    let worldDx = rawInX;
    let worldDz = rawInY;
    if (settings.cameraAngle === '2k') {
      const flipToDef = settings.flipCamera && this.possession === 'away';
      if (!flipToDef) {
        // Camera is behind left baseline looking +X: screen Up (rawInY < 0) => +X, screen Right (rawInX > 0) => +Z
        worldDx = -rawInY;
        worldDz = rawInX;
      } else {
        // Camera flipped behind right baseline looking -X: screen Up (rawInY < 0) => -X, screen Right (rawInX > 0) => -Z
        worldDx = rawInY;
        worldDz = -rawInX;
      }
    }

    const mag = Math.hypot(worldDx, worldDz);
    const nx = mag > 1 ? worldDx / mag : worldDx;
    const nz = mag > 1 ? worldDz / mag : worldDz;

    const wantsSprint = this.sprintHeld && mag > 0.15 && p.stamina > 0.04;
    const burstTriggered = wantsSprint && !this.wasSprintingLastFrame;
    this.wasSprintingLastFrame = wantsSprint;

    const hasRecharge = playerState.hoops2k26.repXp >= 4800;
    const adrStep = stepAdrenalineBars(this.adrenalineBars, this.adrenalineRechargeTimer, dt, burstTriggered, hasRecharge);
    this.adrenalineBars = adrStep.bars;
    this.adrenalineRechargeTimer = adrStep.rechargeTimer;

    p.sprinting = wantsSprint;
    const gatoradeMult = playerState.hoops2k26.gatoradeBoosts > 0 ? 0.78 : 1.0;
    if (wantsSprint) {
      p.stamina = Math.max(0, p.stamina - dt * 0.32 * gatoradeMult);
    } else {
      p.stamina = Math.min(1, p.stamina + dt * 0.24);
    }

    const staminaPct = Math.round(p.stamina * 100);
    if (Math.abs(staminaPct - this.lives) >= 3) {
      this.lives = staminaPct;
      updateHealthDisplay(this.lives, this.maxLives);
    }

    if (this.ballMode === 'dunk' && this.carrierIdx === p.index) return;

    const speedRatingMult = 0.94 + this.homeTeam.speedRating * 0.04 + (this.takeoverActive ? 0.14 : 0);
    const adrenalinePenalty = this.adrenalineBars === 0 ? 0.84 : 1.0;
    const baseSpeed = 8.4 * speedRatingMult * (wantsSprint ? 1.4 * adrenalinePenalty : 1.0) * (this.meterActive ? 0.18 : 1.0);

    if (mag > 0.06) {
      p.vx = nx * baseSpeed;
      p.vz = nz * baseSpeed;
      p.facingYaw = Math.atan2(p.vx, p.vz);
      p.animPhase += dt * (wantsSprint ? 13.5 : 9.2);
    } else {
      p.vx *= Math.exp(-12 * dt);
      p.vz *= Math.exp(-12 * dt);
    }

    p.x = Math.max(-COURT_HALF_LEN + 0.7, Math.min(COURT_HALF_LEN - 0.7, p.x + p.vx * dt));
    p.z = Math.max(-COURT_HALF_WID + 0.7, Math.min(COURT_HALF_WID - 0.7, p.z + p.vz * dt));
  }

  private stepAIPlayers(dt: number): void {
    this.aiDecisionTimer -= dt;
    this.aiAttackPhaseTimer += dt;
    const activePlay = PLAY_BOOK[this.activePlayIdx];
    const scheme = COACH_SCHEMES[this.coachSchemeIdx];

    for (let i = 0; i < this.players.length; i++) {
      const p = this.players[i];
      p.stealCd = Math.max(0, p.stealCd - dt);
      p.stunTimer = Math.max(0, p.stunTimer - dt);
      p.blockTimer = Math.max(0, p.blockTimer - dt);

      if (p.y > 0 || p.vy !== 0) {
        p.y += p.vy * dt;
        p.vy -= 17.5 * dt;
        if (p.y <= 0) {
          p.y = 0;
          p.vy = 0;
        }
      }

      if (i === this.controlledIdx) continue;
      if (this.ballMode === 'dunk' && this.carrierIdx === i) continue;

      let targetX = p.x;
      let targetZ = p.z;
      let maxSpd = 6.9;

      if (this.ballMode === 'loose') {
        targetX = this.ballX;
        targetZ = this.ballZ;
        maxSpd = 7.8;
      } else if (p.team === this.possession) {
        const offSign = p.team === 'home' ? 1 : -1;
        if (this.ballMode === 'held' && this.carrierIdx === p.index && p.team === 'away') {
          const rimTargetX = -HOOP_X + 4.4;
          const cutOffset = Math.sin(this.aiAttackPhaseTimer * 1.4) * 3.8;
          targetX = rimTargetX;
          targetZ = cutOffset;
          maxSpd = 6.8 + (this.scaler.speedMult - 0.85) * 1.6;
        } else {
          const slot = ROLE_SLOTS[p.index % 5];
          const weave = Math.sin(this.aiAttackPhaseTimer * 1.1 + p.index) * 1.5;
          const playShiftZ = p.team === 'home' ? activePlay.offsetZ * 0.45 : 0;
          targetX = offSign * slot.offX;
          targetZ = Math.max(-COURT_HALF_WID + 1.2, Math.min(COURT_HALF_WID - 1.2, slot.offZ + weave + playShiftZ));
        }
      } else {
        const n = this.playersPerSide;
        const oppIdx = p.team === 'home' ? n + (p.index % n) : p.index % n;
        const mark = this.players[oppIdx];
        const defHoopX = p.team === 'home' ? -HOOP_X : HOOP_X;
        if (p.team === 'home' && scheme === '2-3 Zone') {
          const slot = ROLE_SLOTS[p.index % 5];
          targetX = slot.defX * 0.88 + this.ballX * 0.12;
          targetZ = slot.defZ * 0.85 + this.ballZ * 0.2;
        } else {
          const isOnBall = this.ballMode === 'held' && this.carrierIdx === oppIdx;
          const guardFrac = isOnBall ? 0.16 : 0.25;
          targetX = mark.x + (defHoopX - mark.x) * guardFrac;
          targetZ = mark.z + (0 - mark.z) * guardFrac;
        }
        maxSpd = p.team === 'away' ? 6.5 * this.scaler.speedMult : 7.3;
      }

      if (p.stunTimer > 0) maxSpd *= 0.25;

      const dx = targetX - p.x;
      const dz = targetZ - p.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.35) {
        const stepSpd = Math.min(maxSpd, dist * 3.8);
        p.vx = (dx / dist) * stepSpd;
        p.vz = (dz / dist) * stepSpd;
        p.x = Math.max(-COURT_HALF_LEN + 0.7, Math.min(COURT_HALF_LEN - 0.7, p.x + p.vx * dt));
        p.z = Math.max(-COURT_HALF_WID + 0.7, Math.min(COURT_HALF_WID - 0.7, p.z + p.vz * dt));
        p.facingYaw = Math.atan2(p.vx, p.vz);
        p.animPhase += dt * 8.4;
      } else {
        p.vx = 0;
        p.vz = 0;
        const lookX = p.team === 'home' ? HOOP_X : -HOOP_X;
        p.facingYaw = Math.atan2(lookX - p.x, -p.z);
      }
    }

    if (this.ballMode === 'held' && this.possession === 'away' && this.aiDecisionTimer <= 0) {
      this.aiDecisionTimer = 0.55;
      const carrier = this.players[this.carrierIdx];
      const n = this.playersPerSide;
      if (carrier && carrier.team === 'away') {
        const distToRim = Math.hypot(carrier.x - -HOOP_X, carrier.z);
        const urgentShot = this.shotClock < 4.5 && carrier.x < 4;

        if (distToRim < 3.2 && carrier.x < -14) {
          const makeProb = 0.54 + (this.scaler.speedMult - 1) * 0.14;
          this.launchShot(carrier, -HOOP_X, 2, Math.random() < makeProb, false);
        } else if ((distToRim < 9.2 && Math.random() < 0.36) || urgentShot) {
          let nearestHome = Infinity;
          for (let h = 0; h < n; h++) {
            const hd = Math.hypot(this.players[h].x - carrier.x, this.players[h].z - carrier.z);
            if (hd < nearestHome) nearestHome = hd;
          }
          const contestMalus = nearestHome < 2.2 ? 0.22 : nearestHome < 3.4 ? 0.09 : 0;
          if (nearestHome < 2.4) this.applyGradeEvent('good_contest', 'GOOD CONTEST', 30);
          const pts: 2 | 3 = distToRim > THREE_PT_RADIUS ? 3 : 2;
          const base = pts === 3 ? 0.38 : 0.52;
          const makeProb = Math.max(0.18, base + (this.scaler.speedMult - 1) * 0.12 - contestMalus);
          this.launchShot(carrier, -HOOP_X, pts, Math.random() < makeProb, false);
        } else if (Math.random() < 0.25 && n > 1) {
          const mates = this.players.slice(n, n * 2).map((m) => ({ index: m.index, x: m.x, z: m.z }));
          const tIdx = pickBestPassTargetIndex(
            { x: carrier.x, z: carrier.z },
            { x: -1, z: Math.sin(this.aiAttackPhaseTimer) },
            -HOOP_X,
            carrier.index,
            mates
          );
          if (tIdx >= n) {
            this.startPass(carrier, this.players[tIdx]);
          }
        }
      }
    }
  }

  private stepBallPhysics(dt: number): void {
    if (this.ballMode === 'held') {
      const carrier = this.players[this.carrierIdx];
      if (!carrier) return;

      const fwdX = Math.sin(carrier.facingYaw);
      const fwdZ = Math.cos(carrier.facingYaw);
      const rightX = Math.cos(carrier.facingYaw);
      const rightZ = -Math.sin(carrier.facingYaw);

      if (this.meterActive && carrier.index === this.controlledIdx) {
        this.ballX = carrier.x + fwdX * 0.36;
        this.ballZ = carrier.z + fwdZ * 0.36;
        this.ballY = carrier.y + 2.15;
      } else {
        this.dribblePhase += dt * (carrier.sprinting ? 11.5 : 8.5);
        const s = Math.abs(Math.sin(this.dribblePhase));
        if (s < 0.18 && !this.lastDribblePlayed && carrier.index === this.controlledIdx) {
          this.lastDribblePlayed = true;
          ArcadeAudio.play('dribble');
        } else if (s > 0.35) {
          this.lastDribblePlayed = false;
        }
        this.ballX = carrier.x + fwdX * 0.48 + rightX * 0.32;
        this.ballZ = carrier.z + fwdZ * 0.48 + rightZ * 0.32;
        this.ballY = 0.24 + s * 0.92;
      }
      return;
    }

    if (this.ballMode === 'pass') {
      this.passTimer += dt;
      const t = Math.min(1, this.passTimer / this.passDuration);
      const receiver = this.players[this.passTargetIdx];
      if (!receiver) {
        this.ballMode = 'loose';
        return;
      }
      this.ballX = THREE.MathUtils.lerp(this.passFromX, receiver.x, t);
      this.ballZ = THREE.MathUtils.lerp(this.passFromZ, receiver.z, t);
      this.ballY = THREE.MathUtils.lerp(this.passFromY, 1.35, t) + Math.sin(t * Math.PI) * 0.65;

      if (t >= 1) {
        this.ballMode = 'held';
        this.carrierIdx = receiver.index;
        this.possession = receiver.team;
        if (receiver.team === 'home') {
          this.controlledIdx = receiver.index;
          this.updateActiveRing();
        }
        this.syncActionLabels();
      }
      return;
    }

    if (this.ballMode === 'dunk') {
      const dunker = this.players[this.carrierIdx];
      if (!dunker) {
        this.ballMode = 'loose';
        return;
      }
      this.dunkTimer += dt;
      const t = Math.min(1, this.dunkTimer / this.dunkDuration);
      dunker.x = THREE.MathUtils.lerp(this.dunkFromX, this.dunkTargetX, t);
      dunker.z = THREE.MathUtils.lerp(this.dunkFromZ, 0, t);
      dunker.y = Math.sin(t * Math.PI) * 1.95;
      dunker.facingYaw = Math.atan2(HOOP_X - dunker.x, -dunker.z);

      this.ballX = THREE.MathUtils.lerp(dunker.x + 0.35, HOOP_X, Math.pow(t, 1.4));
      this.ballZ = dunker.z * (1 - t);
      this.ballY = dunker.y + 2.05;

      if (t >= 1) {
        dunker.y = 0;
        this.camShake = playerState.hoops2k26.settings.cameraShake ? 0.55 : 0;
        this.shotWasGreen = true;
        this.shotShooterIdx = dunker.index;
        this.scoreBasket('home', 2, 'POSTER DUNK!');
      }
      return;
    }

    if (this.ballMode === 'shot') {
      this.shotTimer += dt;
      const t = Math.min(1, this.shotTimer / this.shotDuration);

      if (t < 0.45) {
        for (let i = 0; i < this.players.length; i++) {
          const def = this.players[i];
          if (def.team === this.shotTeam || def.blockTimer <= 0) continue;
          const distXZ = Math.hypot(def.x - this.ballX, def.z - this.ballZ);
          if (distXZ < 1.35 && Math.abs(def.y + 1.9 - this.ballY) < 1.1) {
            this.ballMode = 'loose';
            this.ballVx = (def.team === 'home' ? -1 : 1) * 5.2;
            this.ballVy = 3.2;
            this.ballVz = (Math.random() - 0.5) * 4.5;
            ArcadeAudio.play('rimClank');
            this.popBanner('SNATCH BLOCK!', '#38bdf8', 1.1);
            if (def.team === 'home') {
              this.score += 20;
              this.stats.blk += 1;
              this.applyGradeEvent('block', 'BLOCK', 85);
              updateInGameHud(this.score, this.level, this.gameIdx);
              this.pushHudSnapshot();
            }
            return;
          }
        }
      }

      this.ballX = THREE.MathUtils.lerp(this.shotStartX, this.shotTargetX, t);
      this.ballZ = THREE.MathUtils.lerp(this.shotStartZ, this.shotTargetZ, t);
      const oneMinus = 1 - t;
      this.ballY =
        oneMinus * oneMinus * this.shotStartY + 2 * oneMinus * t * this.shotPeakY + t * t * RIM_Y;

      if (t >= 1) {
        if (this.shotWillMake) {
          this.ballY = RIM_Y - 0.55;
          const lbl = this.shotWasGreen
            ? 'GREEN SPLASH!'
            : this.shotPoints === 3
              ? '3PT SWISH!'
              : 'BUCKET!';
          this.scoreBasket(this.shotTeam, this.shotPoints, lbl);
        } else {
          ArcadeAudio.play('rimClank');
          this.ballMode = 'loose';
          const bounceDir = this.shotTargetX > 0 ? -1 : 1;
          this.ballVx = bounceDir * (2.6 + Math.random() * 2.4);
          this.ballVy = 4.5 + Math.random() * 1.5;
          this.ballVz = (Math.random() - 0.5) * 4.4;
          this.popBanner('REBOUND!', '#cbd5e1', 0.8);
        }
      }
      return;
    }

    // Loose rebound physics
    this.ballX += this.ballVx * dt;
    this.ballZ += this.ballVz * dt;
    this.ballY += this.ballVy * dt;
    this.ballVy -= 17.5 * dt;

    if (this.ballY <= 0.24) {
      this.ballY = 0.24;
      this.ballVy = Math.abs(this.ballVy) * 0.64;
      this.ballVx *= 0.85;
      this.ballVz *= 0.85;
    }

    if (Math.abs(this.ballX) > COURT_HALF_LEN - 0.5) {
      this.ballX = Math.sign(this.ballX) * (COURT_HALF_LEN - 0.5);
      this.ballVx *= -0.7;
    }
    if (Math.abs(this.ballZ) > COURT_HALF_WID - 0.5) {
      this.ballZ = Math.sign(this.ballZ) * (COURT_HALF_WID - 0.5);
      this.ballVz *= -0.7;
    }

    if (this.ballY < 2.65) {
      let bestGrab = -1;
      let bestDist = 1.45;
      for (let i = 0; i < this.players.length; i++) {
        const pl = this.players[i];
        const d = Math.hypot(pl.x - this.ballX, pl.z - this.ballZ);
        if (d < bestDist) {
          bestDist = d;
          bestGrab = i;
        }
      }
      if (bestGrab >= 0) {
        const grabber = this.players[bestGrab];
        const isOffensiveReb = grabber.team === this.shotTeam;
        this.ballMode = 'held';
        this.carrierIdx = bestGrab;
        this.possession = grabber.team;
        // Authentic NBA 24s / 14s offensive rebound shot clock reset!
        const resetClock = isOffensiveReb ? 14 : SHOT_CLOCK_SEC;
        this.shotClock = this.targetScore ? resetClock : Math.min(resetClock, Math.max(0.5, this.quarterClock));
        if (grabber.team === 'home') {
          this.controlledIdx = bestGrab;
          this.updateActiveRing();
          this.score += 10;
          this.stats.reb += 1;
          this.applyGradeEvent('rebound', isOffensiveReb ? 'OFF REB' : 'DEF REB', 50);
          updateInGameHud(this.score, this.level, this.gameIdx);
          this.popBanner(isOffensiveReb ? 'OFFENSIVE BOARD! (:14)' : 'DEFENSIVE BOARD! +10', '#4ade80', 0.85);
          this.pushHudSnapshot();
        }
        this.syncActionLabels();
        ArcadeAudio.play('dribble');
      }
    }
  }

  private animateCrowd(): void {
    const t = performance.now() * 0.005;
    const amp = 0.06 + this.crowdExcite * 0.42;
    for (let i = 0; i < this.crowdMesh.count; i++) {
      const b = this.crowdBasePos[i];
      const bob = Math.abs(Math.sin(t + b.phase)) * amp;
      _dummyPos.set(b.x, b.y + bob, b.z);
      _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
      this.crowdMesh.setMatrixAt(i, _dummyMatrix);
    }
    this.crowdMesh.instanceMatrix.needsUpdate = true;
  }

  private syncMeshes(): void {
    for (let i = 0; i < this.players.length; i++) {
      const p = this.players[i];
      p.rig.group.position.set(p.x, p.y, p.z);
      p.rig.group.rotation.y = p.facingYaw;

      const moving = Math.hypot(p.vx, p.vz) > 0.35;
      const stride = moving ? Math.sin(p.animPhase) * 0.55 : 0;
      p.rig.legL.rotation.x = stride;
      p.rig.legR.rotation.x = -stride;

      const isShooting =
        (this.meterActive && i === this.controlledIdx) ||
        (this.ballMode === 'dunk' && i === this.carrierIdx) ||
        p.blockTimer > 0.15;
      if (isShooting) {
        p.rig.armL.rotation.x = -2.45;
        p.rig.armR.rotation.x = -2.45;
      } else {
        p.rig.armL.rotation.x = -stride * 0.65;
        p.rig.armR.rotation.x = stride * 0.65;
      }
    }

    const activeP = this.players[this.controlledIdx];
    if (this.takeoverActive && activeP) {
      this.takeoverAuraMesh.position.set(activeP.x, 0.07, activeP.z);
      const pulse = 1 + Math.sin(performance.now() * 0.01) * 0.12;
      this.takeoverAuraMesh.scale.set(pulse, pulse, 1);
    }

    this.ballGroup.position.set(this.ballX, this.ballY, this.ballZ);
    this.ballGroup.rotation.x += 0.09;
    this.ballGroup.rotation.z += 0.06;
    this.ballShadow.position.set(this.ballX, 0.035, this.ballZ);
    const shadowScale = Math.max(0.42, 1.0 - (this.ballY - 0.25) * 0.08);
    this.ballShadow.scale.set(0.36 * shadowScale, 0.36 * shadowScale, 1);

    this.leftNetMesh.scale.set(1 + this.leftNetShake * 0.2, 1 - this.leftNetShake * 0.14, 1 + this.leftNetShake * 0.2);
    this.rightNetMesh.scale.set(1 + this.rightNetShake * 0.2, 1 - this.rightNetShake * 0.14, 1 + this.rightNetShake * 0.2);
  }

  private computeTargetCameraVectors(): { pos: THREE.Vector3; look: THREE.Vector3 } {
    const s = playerState.hoops2k26.settings;
    const activeP = this.players[this.controlledIdx];
    const focusX = this.ballMode === 'shot' ? this.ballX * 0.72 : activeP?.x ?? this.ballX;
    const focusZ = this.ballZ * 0.42;
    const zoomOff = (5 - s.cameraZoom) * 0.9; // higher zoom = closer
    const heightOff = (s.cameraHeight - 5) * 0.75;

    if (s.cameraAngle === '2k') {
      const flipToDef = s.flipCamera && this.possession === 'away';
      const dir = flipToDef ? 1 : -1; // -1 sits behind left baseline looking right (+X)
      const camX = THREE.MathUtils.clamp(focusX + dir * (16.5 + zoomOff), -32, 32);
      const camY = THREE.MathUtils.clamp(12.2 + heightOff, 8.5, 18.5);
      const camZ = THREE.MathUtils.clamp(focusZ * 0.55, -6.5, 6.5);
      _camDesired.set(camX, camY, camZ);
      _camLookDesired.set(
        THREE.MathUtils.clamp(focusX - dir * 7.5, -18, 18),
        1.8,
        THREE.MathUtils.clamp(focusZ * 0.4, -5, 5)
      );
    } else {
      const camX = THREE.MathUtils.clamp(focusX * 0.58, -11.5, 11.5);
      _camDesired.set(camX, 15.6 + heightOff * 0.7, 22.8 + zoomOff * 0.8);
      _camLookDesired.set(THREE.MathUtils.clamp(focusX * 0.72, -14.5, 14.5), 1.85, THREE.MathUtils.clamp(focusZ, -4.5, 4.5));
    }
    return { pos: _camDesired, look: _camLookDesired };
  }

  private snapCameraImmediate(): void {
    const { pos, look } = this.computeTargetCameraVectors();
    _camLookCur.copy(look);
    this.three.camera.position.copy(pos);
    this.three.camera.lookAt(_camLookCur);
  }

  private updateCamera(dt: number): void {
    const { pos, look } = this.computeTargetCameraVectors();
    const shakeX = this.camShake > 0 ? Math.sin(performance.now() * 0.06) * this.camShake * 0.4 : 0;
    const shakeY = this.camShake > 0 ? Math.cos(performance.now() * 0.08) * this.camShake * 0.28 : 0;
    pos.x += shakeX;
    pos.y += shakeY;

    const alpha = 1 - Math.exp(-5.8 * dt);
    this.three.camera.position.lerp(pos, alpha);
    _camLookCur.lerp(look, alpha);
    this.three.camera.lookAt(_camLookCur);
  }

  private projectWorld(x: number, y: number, z: number): { x: number; y: number; visible: boolean } {
    _projVec.set(x, y, z).project(this.three.camera);
    const sx = (_projVec.x * 0.5 + 0.5) * this.three.width;
    const sy = (-_projVec.y * 0.5 + 0.5) * this.three.height;
    return { x: sx, y: sy, visible: _projVec.z < 1 && _projVec.z > -1 };
  }

  private drawCourtOverlay(): void {
    const ctx = this.three.overlayCtx;
    if (!ctx) return;
    const w = this.three.width;
    const vh = this.three.height;
    this.three.clearOverlay();
    const s = playerState.hoops2k26.settings;

    ctx.save();

    // 1. Icon Passing Key Badges over Teammates when active
    if (this.iconPassingActive && this.ballMode === 'held' && this.carrierIdx === this.controlledIdx) {
      const targets = this.getIconPassTargets();
      for (const t of targets) {
        const mate = this.players[t.index];
        if (!mate) continue;
        const pt = this.projectWorld(mate.x, mate.y + 2.75, mate.z);
        if (!pt.visible) continue;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.font = '900 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.keyLabel, pt.x, pt.y + 0.5);
      }
    }

    // 2. Who-To-Guard Defensive Arrow Indicator
    const activeP = this.players[this.controlledIdx];
    if (s.whoToGuard && this.possession === 'away' && activeP) {
      const n = this.playersPerSide;
      const mark = this.players[n + (activeP.index % n)];
      if (mark) {
        const pt = this.projectWorld(mark.x, mark.y + 2.65, mark.z);
        if (pt.visible) {
          ctx.fillStyle = '#f43f5e';
          ctx.font = '900 10px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('GUARD', pt.x, pt.y - 8);
        }
      }
    }

    // 3. Controlled Player Nameplate + 3 Adrenaline Bars + Stamina Bar + Dunk Ready Hint
    if (activeP && s.floorStamina) {
      const headPt = this.projectWorld(activeP.x, activeP.y + 2.6, activeP.z);
      if (headPt.visible) {
        const dunkReady =
          this.ballMode === 'held' &&
          this.carrierIdx === this.controlledIdx &&
          canAttemptDunk(activeP.x, activeP.z, HOOP_X, activeP.sprinting || this.sprintHeld, activeP.stamina);
        const label = dunkReady
          ? '🔥 DUNK READY'
          : s.ballHandlerText === 'off'
            ? ''
            : s.ballHandlerText === 'position'
              ? activeP.role
              : activeP.name.split(' ').pop() || activeP.role;

        if (label) {
          ctx.textAlign = 'center';
          ctx.font = '900 10px system-ui, sans-serif';
          ctx.fillStyle = dunkReady ? '#facc15' : this.takeoverActive ? '#fb923c' : '#84fab0';
          ctx.fillText(label, headPt.x, headPt.y - 16);
        }

        // Stamina bar
        const barW = 38;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(headPt.x - barW * 0.5, headPt.y - 9, barW, 4);
        ctx.fillStyle = activeP.stamina > 0.3 ? '#38bdf8' : '#ef4444';
        ctx.fillRect(headPt.x - barW * 0.5, headPt.y - 9, barW * activeP.stamina, 4);

        // 3 Adrenaline Pip Bars (■■■)
        for (let b = 0; b < 3; b++) {
          ctx.fillStyle = b < this.adrenalineBars ? '#facc15' : 'rgba(148, 163, 184, 0.32)';
          ctx.fillRect(headPt.x - 16 + b * 11.5, headPt.y - 3, 9.5, 3);
        }
      }
    }

    // 4. Pro-Stick Shot Meter (Comet / Fang / Horn) OR Shot Meter Off Green Boost Cue
    if (this.meterActive && activeP) {
      const sp = this.projectWorld(activeP.x + 1.0, activeP.y + 2.1, activeP.z);
      if (sp.visible) {
        if (s.jumpShotMeterOff) {
          ctx.font = '900 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#4ade80';
          ctx.fillText('NO METER · +GREEN BOOST', sp.x, Math.max(76, sp.y - 44));
        } else {
          const style = s.layupMeterStyle;
          const mW = style === 'fang' ? 20 : 16;
          const mH = 74;
          const mx = Math.max(12, Math.min(w - mW - 44, sp.x + 18));
          const my = Math.max(76, Math.min(vh - mH - 18, sp.y - mH * 0.5));

          ctx.fillStyle = 'rgba(11, 16, 32, 0.92)';
          ctx.strokeStyle = style === 'horn' ? '#facc15' : style === 'fang' ? '#38bdf8' : '#f8fafc';
          ctx.lineWidth = 2;
          this.roundRect(ctx, mx, my, mW, mH, style === 'comet' ? 8 : 3);
          ctx.fill();
          ctx.stroke();

          const gTop = my + mH * (1 - this.meterGreenEnd);
          const gH = mH * (this.meterGreenEnd - this.meterGreenStart);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(mx + 2, gTop, mW - 4, gH);

          const fillH = mH * this.meterProgress;
          const inGreen = this.meterProgress >= this.meterGreenStart && this.meterProgress <= this.meterGreenEnd;
          ctx.fillStyle = inGreen ? '#4ade80' : '#facc15';
          ctx.fillRect(mx + 4, my + mH - fillH, mW - 8, fillH);

          const needleY = my + mH * (1 - this.meterProgress);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(mx - 3, needleY - 2, mW + 6, 4);

          ctx.font = '900 10px system-ui, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillStyle = '#facc15';
          ctx.fillText(`${this.meterPoints}PT`, mx + mW + 6, my + 12);
        }
      }
    }

    // 5. Shot Feedback Callout + Animated Play Banner
    if (this.banner) {
      const alpha = Math.min(1, this.banner.timer * 2.5);
      ctx.globalAlpha = alpha;
      ctx.font = '900 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      const by = vh < 480 ? 58 : 78;
      ctx.fillStyle = 'rgba(11, 16, 32, 0.88)';
      const tw = ctx.measureText(this.banner.text).width + 26;
      this.roundRect(ctx, w * 0.5 - tw * 0.5, by - 15, tw, 28, 8);
      ctx.fill();
      ctx.fillStyle = this.banner.color;
      ctx.fillText(this.banner.text, w * 0.5, by + 1);
    }

    ctx.restore();
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
