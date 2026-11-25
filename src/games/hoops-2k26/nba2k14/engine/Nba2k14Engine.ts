// ============================================================================
// NBA 2K14 — Complete Decoupled Three.js 3D Basketball Simulation Engine
// Supports 5v5/3v3/2v2/1v1, Pro Stick IsoMotion, Shooting/Dunking/Post/PnR,
// All 32+ Signature Skills, 3PT Shootout, Dunk Contest, Training Drills,
// 6 Camera Angles, Gamepad/Keyboard/Touch, and 10s 3D Instant Replay.
// ============================================================================

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Nba2k14Audio } from '../audio/Nba2k14Audio';
import { DUNK_CONTEST_MOVES, TRAINING_DRILLS, classifyShotZone } from '../data/modesData';
import { getTeamById } from '../data/rosters';
import {
  SIGNATURE_SKILL_MAP,
  canGoCold,
  computeAnkleBreakerChance,
  computeBlockReachBonus,
  computeReboundScore,
  computeScreenKnockdownChance,
  computeShotProbability,
  computeStealOutcome,
  getEffectiveFastbreakSpeedBonus,
  getHotThreshold,
  getSkillLevel,
} from '../data/signatureSkills';
import type {
  HotZoneId,
  MatchConfig,
  MatchHudSnapshot,
  MatchResultSummary,
  Nba2k14Settings,
  OtfcState,
  PlayerData,
  PlayerMatchStats,
  ReplayFrame,
  ShotFeedbackEvent,
  SigSkillPopup,
  TeamData,
} from '../types';
import { COURT_LENGTH, COURT_WIDTH, HOOP_X, RIM_Y, buildArenaEnvironment, type ArenaBuildResult } from './arenaBuilder';
import {
  animatePlayerRig,
  createArticulatedPlayerRig,
  updatePlayerFloorRing,
  type ArticulatedPlayerRig,
  type PlayerPose,
} from './playerRig';

interface SimPlayer {
  data: PlayerData;
  side: 'home' | 'away';
  slotIdx: number;
  rig: ArticulatedPlayerRig;
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  rotY: number;
  pose: PlayerPose;
  poseTimer: number;
  stamina: number;
  streak: number;
  stumbleTimer: number;
  isoChain: number;
  isoResetTimer: number;
  catchTimer: number;
  lastPasserSkills: PlayerData['signatureSkills'];
  lastPassFromPost: boolean;
  usedScreenTimer: number;
  screenerPopTimer: number;
  isScreening: boolean;
  isPostingUp: boolean;
  jumpVelY: number;
  stats: PlayerMatchStats;
}

interface BallSim {
  mesh: THREE.Mesh;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  state: 'held' | 'shot' | 'pass' | 'loose' | 'alleyoop';
  holderId: string | null;
  passTargetId: string | null;
  shooterId: string | null;
  shotTargetSide: 'home' | 'away';
  shotWillMake: boolean;
  shotPoints: 2 | 3;
  shotIsDunk: boolean;
  shotZone: HotZoneId;
  shotExcellent: boolean;
  shotFastbreak: boolean;
  shotPaint: boolean;
  shotProgress: number;
  shotDuration: number;
  shotStart: THREE.Vector3;
  shotPeakY: number;
  shotEnd: THREE.Vector3;
  lastTouchedSide: 'home' | 'away';
  dribblePhase: number;
}

export interface VirtualInputState {
  moveX: number;
  moveY: number;
  sprint: boolean;
  shoot: boolean;
  pass: boolean;
  intenseD: boolean;
  postBlock: boolean;
  pickCharge: boolean;
  proStickX: number;
  proStickY: number;
}

const GRADE_STEPS = ['F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];
const THREE_PT_RACK_POSITIONS: [number, number][] = [
  [HOOP_X - 1.2, -6.9],
  [HOOP_X - 5.1, -5.2],
  [HOOP_X - 7.45, 0],
  [HOOP_X - 5.1, 5.2],
  [HOOP_X - 1.2, 6.9],
];

export class Nba2k14Engine {
  private container: HTMLElement;
  private config: MatchConfig;
  private settings: Nba2k14Settings;
  private homeTeam: TeamData;
  private awayTeam: TeamData;
  private onHudUpdate: (snap: MatchHudSnapshot) => void;
  private onMatchComplete: (summary: MatchResultSummary) => void;

  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private arena: ArenaBuildResult;
  private envTex: THREE.Texture | null = null;
  private isSoftwareGl = false;
  private resizeObserver: ResizeObserver;

  private players: SimPlayer[] = [];
  private allBenchHome: PlayerData[] = [];
  private allBenchAway: PlayerData[] = [];
  private ball!: BallSim;

  private controlledId = '';
  private possession: 'home' | 'away' = 'home';
  private homeScore = 0;
  private awayScore = 0;
  private quarter = 1;
  private quarterScoresHome = [0, 0, 0, 0];
  private quarterScoresAway = [0, 0, 0, 0];
  private gameClockSec = 300;
  private shotClockSec = 24;
  private backcourtTimer = 0;
  private homeTimeouts = 7;
  private awayTimeouts = 7;
  private homeFoulsQ = 0;
  private awayFoulsQ = 0;

  // Shot Meter & Free Throw State
  private isChargingShot = false;
  private shotChargeTime = 0;
  private shotReleaseDuration = 0.65;
  private shotStartPressMs = 0;
  private freeThrowActive = false;
  private freeThrowShooterId: string | null = null;
  private freeThrowRemaining = 0;
  private freeThrowPos = 0;
  private freeThrowDir = 1;

  // Icon Passing, OTFC, Teammate Grade & Presentation
  private iconPassActive = false;
  private otfc: OtfcState = {
    openTab: null,
    offensePoe: 'Get Shooters Open',
    activePlay: 'None',
    defenseSet: 'Man-to-Man',
    showSigSkillsOverhead: false,
  };
  private teammateGradeIdx = 6; // C+
  private teammateGradeFill = 0.5;
  private gradeEvents: { id: number; text: string; positive: boolean }[] = [];
  private shotFeedback: ShotFeedbackEvent | null = null;
  private shotFeedbackTimer = 0;
  private sigPopup: SigSkillPopup | null = null;
  private sigPopupTimer = 0;
  private commentary = 'Welcome to NBA 2K14! Tip-off is underway!';
  private paBanner: string | null = null;
  private paBannerTimer = 0;
  private crowdExcitement = 0.25;
  private buzzerFlashTimer = 0;
  private cameraShake = 0;
  private eventSeq = 1;

  // Special Modes State
  private shootoutRack = 0;
  private shootoutBallInRack = 0;
  private shootoutScore = 0;
  private shootoutTime = 60;
  private dunkRound = 1;
  private dunkAttempt = 1;
  private dunkMoveId = DUNK_CONTEST_MOVES[0].id;
  private dunkTotalScore = 0;
  private dunkJudgeScores: number[] = [];
  private dunkPhase: 'select' | 'runup' | 'meter' | 'scored' = 'select';
  private dunkMeterVal = 0;
  private trainingReps = 0;

  // Replay Ring Buffer (10s @ 30Hz = 300 frames)
  private replayBuffer: ReplayFrame[] = [];
  private replaySampleAccum = 0;
  private replayMode = false;
  private replayIndex = 0;
  private replayPlaying = false;
  private replaySpeed: 0.25 | 0.5 | 1 = 0.5;
  private replayOrbitAngle = 0.5;
  private replayOrbitDist = 11.5;
  private replayOrbitHeight = 4.6;
  private replayDragging = false;
  private replayLastX = 0;

  // Input State
  private keys = new Set<string>();
  private virtualInput: VirtualInputState = {
    moveX: 0,
    moveY: 0,
    sprint: false,
    shoot: false,
    pass: false,
    intenseD: false,
    postBlock: false,
    pickCharge: false,
    proStickX: 0,
    proStickY: 0,
  };
  private prevVirtualShoot = false;
  private prevGamepadButtons: boolean[] = [];

  // Runtime Bookkeeping
  private paused = false;
  private finished = false;
  private disposed = false;
  private rafId = 0;
  private lastFrameMs = performance.now();
  private elapsed = 0;
  private hudEmitAccum = 0;
  private fps = 60;
  private curCamPos = new THREE.Vector3(0, 12, 16);
  private curCamLook = new THREE.Vector3(0, 1.5, 0);
  private userShotLog: MatchHudSnapshot['userShotLog'] = [];
  private aiDecisionCooldown = 0.4;

  constructor(
    container: HTMLElement,
    config: MatchConfig,
    settings: Nba2k14Settings,
    onHudUpdate: (snap: MatchHudSnapshot) => void,
    onMatchComplete: (summary: MatchResultSummary) => void
  ) {
    this.container = container;
    this.config = config;
    this.settings = settings;
    this.onHudUpdate = onHudUpdate;
    this.onMatchComplete = onMatchComplete;

    this.homeTeam = getTeamById(config.homeTeamId);
    this.awayTeam = getTeamById(config.awayTeamId);
    this.homeScore = config.startHomeScore ?? 0;
    this.awayScore = config.startAwayScore ?? 0;
    this.quarter = config.startQuarter ?? 1;
    this.gameClockSec = config.startClockSec ?? config.quarterLengthMin * 60;
    this.shotClockSec = 24;

    // Renderer Setup
    this.renderer = new THREE.WebGLRenderer({ antialias: settings.graphics.renderQuality !== 'Low', powerPreference: 'high-performance' });
    const gl = this.renderer.getContext();
    const rStr = String(gl.getParameter(gl.RENDERER) || '');
    this.isSoftwareGl = /SwiftShader|llvmpipe|Software|Basic Render Driver/i.test(rStr);

    const dprCap =
      this.isSoftwareGl || settings.graphics.renderQuality === 'Low'
        ? 1
        : settings.graphics.renderQuality === 'Ultra'
          ? 2
          : 1.5;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl && settings.graphics.renderQuality !== 'Low';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // Scene + Lighting + RoomEnvironment
    this.scene = new THREE.Scene();
    const bgHex =
      config.courtEnv === 'blacktop'
        ? '#1a1524'
        : config.courtEnv === 'park'
          ? '#1e293b'
          : config.courtEnv === 'practice'
            ? '#273142'
            : '#090b10';
    this.scene.background = new THREE.Color(bgHex);
    this.scene.fog = new THREE.FogExp2(bgHex, 0.011);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.envTex;
    pmrem.dispose();

    const w = Math.max(320, container.clientWidth);
    const h = Math.max(240, container.clientHeight);
    this.camera = new THREE.PerspectiveCamera(48, w / h, 0.15, 160);
    this.renderer.setSize(w, h, false);

    // Arena Lighting
    const hemi = new THREE.HemisphereLight(
      config.courtEnv === 'blacktop' ? '#ffd9a8' : '#ffffff',
      '#1e1a18',
      config.courtEnv === 'practice' ? 0.95 : 0.72
    );
    this.scene.add(hemi);

    const keyDir = new THREE.DirectionalLight(
      config.courtEnv === 'blacktop' ? '#ffcf8c' : '#fff8ef',
      config.courtEnv === 'blacktop' ? 1.55 : 1.35
    );
    keyDir.position.set(8, 22, 11);
    keyDir.castShadow = !this.isSoftwareGl && settings.graphics.renderQuality !== 'Low';
    keyDir.shadow.mapSize.set(1024, 1024);
    keyDir.shadow.camera.left = -18;
    keyDir.shadow.camera.right = 18;
    keyDir.shadow.camera.top = 14;
    keyDir.shadow.camera.bottom = -14;
    keyDir.shadow.bias = -0.0005;
    this.scene.add(keyDir);

    const fillDir = new THREE.DirectionalLight('#93c5fd', 0.42);
    fillDir.position.set(-12, 14, -10);
    this.scene.add(fillDir);

    // Build 3D Arena Environment
    this.arena = buildArenaEnvironment(
      config.courtEnv,
      this.homeTeam,
      Boolean(config.fibaRules),
      settings.graphics.crowdDetail === 'High' && !this.isSoftwareGl,
      settings.graphics.courtReflections
    );
    this.scene.add(this.arena.group);

    // Build Basketball & Players
    this.initBall();
    this.initPlayers();
    this.setupInitialPositions();

    // Listeners
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.renderer.domElement.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    this.renderer.domElement.addEventListener('webglcontextlost', this.handleContextLost);

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    Nba2k14Audio.playWhistle();
    this.emitHud();
    this.lastFrameMs = performance.now();
    this.tick();
  }

  private initBall(): void {
    const ballCanvas = document.createElement('canvas');
    ballCanvas.width = 256;
    ballCanvas.height = 128;
    const bctx = ballCanvas.getContext('2d')!;
    bctx.fillStyle = '#d45a15';
    bctx.fillRect(0, 0, 256, 128);
    bctx.strokeStyle = '#18181b';
    bctx.lineWidth = 4;
    bctx.beginPath();
    bctx.moveTo(0, 64);
    bctx.lineTo(256, 64);
    bctx.moveTo(128, 0);
    bctx.lineTo(128, 128);
    bctx.stroke();

    const ballTex = new THREE.CanvasTexture(ballCanvas);
    ballTex.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.125, 18, 16),
      new THREE.MeshStandardMaterial({ map: ballTex, roughness: 0.45, metalness: 0.06 })
    );
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.ball = {
      mesh,
      x: 0,
      y: 1.1,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      state: 'held',
      holderId: null,
      passTargetId: null,
      shooterId: null,
      shotTargetSide: 'away',
      shotWillMake: false,
      shotPoints: 2,
      shotIsDunk: false,
      shotZone: 'mid_top',
      shotExcellent: false,
      shotFastbreak: false,
      shotPaint: false,
      shotProgress: 0,
      shotDuration: 0.9,
      shotStart: new THREE.Vector3(),
      shotPeakY: 4.5,
      shotEnd: new THREE.Vector3(),
      lastTouchedSide: 'home',
      dribblePhase: 0,
    };
  }

  private initPlayers(): void {
    const count = this.config.mode === 'shootout3pt' || this.config.mode === 'dunkcontest' ? 1 : this.config.playersPerSide;
    const homeSource = this.config.homeCustomPlayers?.length ? this.config.homeCustomPlayers : this.homeTeam.players;
    const awaySource = this.config.awayCustomPlayers?.length ? this.config.awayCustomPlayers : this.awayTeam.players;

    const homeActive = homeSource.slice(0, count);
    this.allBenchHome = homeSource.slice(count);

    const awayActive =
      this.config.mode === 'shootout3pt' || this.config.mode === 'dunkcontest'
        ? []
        : awaySource.slice(0, count);
    this.allBenchAway = awaySource.slice(count);

    const homeJersey = this.config.jerseyMode === 'alternate' ? this.homeTeam.altColor : this.homeTeam.homeJerseyColor;
    const awayJersey = this.config.jerseyMode === 'alternate' ? this.awayTeam.secondaryColor : this.awayTeam.awayJerseyColor;

    const spawnList = (list: PlayerData[], side: 'home' | 'away') => {
      const team = side === 'home' ? this.homeTeam : this.awayTeam;
      const jersey = side === 'home' ? homeJersey : awayJersey;
      const trim = side === 'home' ? team.primaryColor : team.secondaryColor;
      list.forEach((pData, idx) => {
        const rig = createArticulatedPlayerRig(pData, jersey, trim, team.code, side === this.config.userSide);
        this.scene.add(rig.root);
        this.players.push({
          data: pData,
          side,
          slotIdx: idx,
          rig,
          x: 0,
          y: 0,
          z: 0,
          vx: 0,
          vz: 0,
          rotY: 0,
          pose: 'idle',
          poseTimer: 0,
          stamina: 100,
          streak: 0,
          stumbleTimer: 0,
          isoChain: 0,
          isoResetTimer: 0,
          catchTimer: 0,
          lastPasserSkills: [],
          lastPassFromPost: false,
          usedScreenTimer: 0,
          screenerPopTimer: 0,
          isScreening: false,
          isPostingUp: false,
          jumpVelY: 0,
          stats: {
            playerId: pData.id,
            name: pData.name,
            pos: pData.pos,
            jersey: pData.jersey,
            teamSide: side,
            pts: 0,
            fgm: 0,
            fga: 0,
            tpm: 0,
            tpa: 0,
            ftm: 0,
            fta: 0,
            reb: 0,
            ast: 0,
            stl: 0,
            blk: 0,
            to: 0,
            pf: 0,
            stamina: 100,
            streak: 0,
          },
        });
      });
    };

    spawnList(homeActive, 'home');
    spawnList(awayActive, 'away');

    // Choose initial controlled player
    const userPlayers = this.players.filter((p) => p.side === this.config.userSide);
    const locked = this.config.playerLockId
      ? userPlayers.find((p) => p.data.id === this.config.playerLockId)
      : null;
    this.controlledId = (locked ?? userPlayers[0] ?? this.players[0]).data.id;
  }

  private setupInitialPositions(): void {
    if (this.config.mode === 'shootout3pt') {
      const shooter = this.players[0];
      const [rx, rz] = THREE_PT_RACK_POSITIONS[0];
      shooter.x = rx;
      shooter.z = rz;
      shooter.rotY = Math.atan2(HOOP_X - rx, -rz);
      this.ball.state = 'held';
      this.ball.holderId = shooter.data.id;
      this.commentary = 'NBA 2K14 3-Point Shootout! 5 Racks, 25 Balls, 60 Seconds. Hold Space to shoot!';
      return;
    }

    if (this.config.mode === 'dunkcontest') {
      const dunker = this.players[0];
      dunker.x = 3.2;
      dunker.z = 0;
      dunker.rotY = Math.PI / 2;
      this.ball.state = 'held';
      this.ball.holderId = dunker.data.id;
      this.commentary = 'Sprite Slam Dunk Contest! Pick your signature dunk and nail the timing meter!';
      return;
    }

    this.possession = this.config.userSide;
    this.resetHalfCourtPossession(this.possession, true);
  }

  private getAttackDir(side: 'home' | 'away'): 1 | -1 {
    if (this.config.halfCourt) return 1; // Half-court always attacks +HOOP_X
    return side === 'home' ? 1 : -1;
  }

  private getTargetHoopX(side: 'home' | 'away'): number {
    return this.getAttackDir(side) * HOOP_X;
  }

  private resetHalfCourtPossession(offSide: 'home' | 'away', isTipOrInbound = false): void {
    this.possession = offSide;
    this.shotClockSec = 24;
    this.backcourtTimer = 0;
    const dir = this.getAttackDir(offSide);
    const offPlayers = this.players.filter((p) => p.side === offSide);
    const defPlayers = this.players.filter((p) => p.side !== offSide);

    const offOffsets: [number, number][] = this.config.halfCourt
      ? [
          [4.2, 0],
          [7.4, -5.2],
          [7.4, 5.2],
          [9.6, -2.5],
          [9.8, 2.5],
        ]
      : [
          [isTipOrInbound ? -1.5 * dir : -7.5 * dir, 0],
          [3.5 * dir, -5.4],
          [3.5 * dir, 5.4],
          [8.6 * dir, -2.8],
          [9.2 * dir, 2.8],
        ];

    offPlayers.forEach((p, i) => {
      const [ox, oz] = offOffsets[i % offOffsets.length];
      p.x = ox;
      p.z = oz;
      p.y = 0;
      p.vx = 0;
      p.vz = 0;
      p.stumbleTimer = 0;
      p.isScreening = false;
      p.isPostingUp = false;
    });

    defPlayers.forEach((p, i) => {
      const match = offPlayers[i % Math.max(1, offPlayers.length)];
      if (match) {
        const hoopX = this.getTargetHoopX(offSide);
        p.x = THREE.MathUtils.lerp(match.x, hoopX, 0.28);
        p.z = match.z * 0.88;
      }
      p.y = 0;
      p.vx = 0;
      p.vz = 0;
      p.stumbleTimer = 0;
    });

    const handler =
      this.config.playerLockId && offSide === this.config.userSide
        ? offPlayers.find((p) => p.data.id === this.config.playerLockId) ?? offPlayers[0]
        : offPlayers[0];

    if (handler) {
      this.ball.state = 'held';
      this.ball.holderId = handler.data.id;
      this.ball.lastTouchedSide = offSide;
      if (!this.config.playerLockId && offSide === this.config.userSide) {
        this.controlledId = handler.data.id;
      }
    }
  }

  // ==================== PUBLIC CONTROLS FOR REACT UI ====================

  public updateSettings(next: Nba2k14Settings): void {
    this.settings = next;
  }

  public setPaused(p: boolean): void {
    this.paused = p;
    if (!p) {
      this.replayMode = false;
      this.lastFrameMs = performance.now();
    }
    this.emitHud();
  }

  public enterInstantReplay(): void {
    this.paused = true;
    this.replayMode = true;
    this.replayPlaying = false;
    this.replayIndex = Math.max(0, this.replayBuffer.length - 1);
    this.emitHud();
  }

  public exitInstantReplay(): void {
    this.replayMode = false;
    this.emitHud();
  }

  public setReplayControls(opts: { index?: number; playing?: boolean; speed?: 0.25 | 0.5 | 1 }): void {
    if (opts.index !== undefined) {
      this.replayIndex = Math.max(0, Math.min(Math.max(0, this.replayBuffer.length - 1), opts.index));
    }
    if (opts.playing !== undefined) this.replayPlaying = opts.playing;
    if (opts.speed !== undefined) this.replaySpeed = opts.speed;
    this.emitHud();
  }

  public setVirtualInput(patch: Partial<VirtualInputState>): void {
    Object.assign(this.virtualInput, patch);
  }

  public triggerOtfcAction(action: {
    tab?: OtfcState['openTab'];
    offensePoe?: OtfcState['offensePoe'];
    activePlay?: OtfcState['activePlay'];
    defenseSet?: OtfcState['defenseSet'];
    subPreset?: 'Starters' | 'Bench' | 'Tall' | '3PT' | 'Defense';
  }): void {
    if (action.tab !== undefined) {
      this.otfc.openTab = this.otfc.openTab === action.tab ? null : action.tab;
      this.otfc.showSigSkillsOverhead = this.otfc.openTab === 'skills';
    }
    if (action.offensePoe) {
      this.otfc.offensePoe = action.offensePoe;
      this.commentary = `Coach Point of Emphasis: ${action.offensePoe}`;
      this.otfc.openTab = null;
    }
    if (action.activePlay) {
      this.otfc.activePlay = action.activePlay;
      this.commentary = `Play Called: ${action.activePlay}`;
      this.otfc.openTab = null;
    }
    if (action.defenseSet) {
      this.otfc.defenseSet = action.defenseSet;
      this.commentary = `Defensive Set switched to ${action.defenseSet}`;
      this.otfc.openTab = null;
    }
    if (action.subPreset) {
      this.applySubstitutionPreset(this.config.userSide, action.subPreset);
      this.otfc.openTab = null;
    }
    Nba2k14Audio.playUiClick('select');
    this.emitHud();
  }

  public callTimeout(): void {
    if (this.config.userSide === 'home' && this.homeTimeouts > 0) this.homeTimeouts -= 1;
    else if (this.config.userSide === 'away' && this.awayTimeouts > 0) this.awayTimeouts -= 1;
    else return;
    this.players.forEach((p) => {
      p.stamina = Math.min(100, p.stamina + 30);
    });
    Nba2k14Audio.playWhistle();
    this.paBanner = 'TIMEOUT CALLED · STAMINA RESTORED';
    this.paBannerTimer = 2.0;
    this.commentary = 'Coach calls a timely timeout to rest the squad and draw up a play.';
    this.emitHud();
  }

  public selectDunkContestMove(moveId: string): void {
    if (this.config.mode !== 'dunkcontest') return;
    this.dunkMoveId = moveId;
    this.dunkPhase = 'runup';
    const dunker = this.players[0];
    dunker.x = 2.2;
    dunker.z = 0;
    this.dunkMeterVal = 0;
    this.commentary = `Running up for the ${DUNK_CONTEST_MOVES.find((m) => m.id === moveId)?.name ?? 'Slam'}! Press Space at the rim!`;
    this.emitHud();
  }

  public applySubstitutionPreset(side: 'home' | 'away', preset: 'Starters' | 'Bench' | 'Tall' | '3PT' | 'Defense'): void {
    const active = this.players.filter((p) => p.side === side);
    const bench = side === 'home' ? this.allBenchHome : this.allBenchAway;
    if (bench.length === 0) return;

    const pool = [...active.map((a) => a.data), ...bench];
    let sorted = [...pool];
    if (preset === 'Starters') sorted.sort((a, b) => Number(b.isStarter) - Number(a.isStarter) || b.ovr - a.ovr);
    else if (preset === 'Bench') sorted.sort((a, b) => Number(a.isStarter) - Number(b.isStarter) || b.ovr - a.ovr);
    else if (preset === 'Tall') sorted.sort((a, b) => b.heightCm - a.heightCm);
    else if (preset === '3PT') sorted.sort((a, b) => b.attrs.threePt - a.attrs.threePt);
    else if (preset === 'Defense') sorted.sort((a, b) => b.attrs.onBallDefense + b.attrs.block - (a.attrs.onBallDefense + a.attrs.block));

    const nextFive = sorted.slice(0, active.length);
    const nextBench = sorted.slice(active.length);
    if (side === 'home') this.allBenchHome = nextBench;
    else this.allBenchAway = nextBench;

    active.forEach((sp, i) => {
      const nextP = nextFive[i];
      if (!nextP || nextP.id === sp.data.id) return;
      sp.data = nextP;
      sp.stamina = 96;
      sp.stats.name = nextP.name;
      sp.stats.jersey = nextP.jersey;
      sp.stats.pos = nextP.pos;
    });
    this.commentary = `Substitution Preset applied: ${preset} lineup on the floor.`;
  }

  public finishEarlyAndSummarize(): void {
    if (this.finished) return;
    this.finalizeMatch();
  }

  // ==================== KEYBOARD & POINTER INPUT ====================

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (this.finished) return;
    const code = e.code;

    if (code === 'Escape') {
      e.preventDefault();
      if (this.replayMode) this.exitInstantReplay();
      else this.setPaused(!this.paused);
      return;
    }

    if (this.paused) return;

    // Prevent browser scroll on Space / Arrows
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
      e.preventDefault();
    }

    const kb = this.settings.keybinds;

    // OTFC D-Pad Arrow Keys
    if (code === 'ArrowLeft') {
      this.triggerOtfcAction({ tab: 'strategy' });
      return;
    }
    if (code === 'ArrowRight') {
      this.triggerOtfcAction({ tab: 'plays' });
      return;
    }
    if (code === 'ArrowDown') {
      this.triggerOtfcAction({ tab: 'subs' });
      return;
    }
    if (code === 'ArrowUp') {
      this.triggerOtfcAction({ tab: 'skills' });
      return;
    }

    if (code === kb.timeout) {
      this.callTimeout();
      return;
    }

    if (code === kb.playCall) {
      const plays: OtfcState['activePlay'][] = ['Pick & Roll', 'Quick Iso', 'Motion Cuts', '3PT Play', 'None'];
      const nextIdx = (plays.indexOf(this.otfc.activePlay) + 1) % plays.length;
      this.otfc.activePlay = plays[nextIdx];
      this.commentary = this.otfc.activePlay === 'None' ? 'Freelance Offense' : `PlayVision: ${this.otfc.activePlay}`;
      this.emitHud();
      return;
    }

    if (code === kb.iconPass) {
      this.iconPassActive = !this.iconPassActive;
      this.emitHud();
      return;
    }

    if (this.iconPassActive && ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(code)) {
      const idx = Number(code.replace('Digit', '')) - 1;
      this.executeIconPass(idx);
      this.iconPassActive = false;
      return;
    }

    if (!this.keys.has(code)) {
      this.onActionPress(code);
    }
    this.keys.add(code);
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    const code = e.code;
    this.keys.delete(code);
    const kb = this.settings.keybinds;

    if (
      code === kb.shoot ||
      code === kb.proStickUp ||
      code === kb.proStickDown ||
      code === kb.proStickLeft ||
      code === kb.proStickRight
    ) {
      if (this.isChargingShot) {
        this.releaseShot(code);
      }
    }
  };

  private onActionPress(code: string): void {
    const kb = this.settings.keybinds;

    // Free Throw Release
    if (this.freeThrowActive && code === kb.shoot) {
      this.resolveFreeThrow();
      return;
    }

    // Dunk Contest Timing Press
    if (this.config.mode === 'dunkcontest' && code === kb.shoot) {
      if (this.dunkPhase === 'runup' || this.dunkPhase === 'meter') {
        this.resolveDunkContestAttempt();
      }
      return;
    }

    const ctrl = this.getControlledPlayer();
    if (!ctrl) return;
    const hasBall = this.ball.state === 'held' && this.ball.holderId === ctrl.data.id;

    // Shoot / Alley-Oop / Steal
    if (code === kb.shoot) {
      if (hasBall) {
        if (this.keys.has(kb.intenseD)) {
          this.attemptAlleyOop(ctrl);
        } else {
          this.startShotCharge(ctrl);
        }
      } else if (this.possession !== ctrl.side) {
        this.attemptSteal(ctrl);
      }
      return;
    }

    // Pro Stick Flicks (I/J/K/L) -> IsoMotion Dribble or Euro/Hop Layup
    if ([kb.proStickUp, kb.proStickDown, kb.proStickLeft, kb.proStickRight].includes(code)) {
      if (hasBall) {
        if (this.settings.controller.proStickFunction === 'Shots') {
          this.startShotCharge(ctrl);
        } else {
          this.triggerIsoMotionDribble(ctrl, code);
        }
      }
      return;
    }

    // Pass / Switch Defender
    if (code === kb.pass) {
      if (hasBall) {
        const isBounce = this.keys.has(kb.intenseD);
        this.executeSmartPass(ctrl, isBounce ? 'bounce' : 'chest');
      } else if (this.possession !== ctrl.side && !this.config.playerLockId) {
        this.switchNearestDefender();
      } else if (this.possession === ctrl.side && this.config.playerLockId) {
        // Call for pass in MyCAREER Player Lock
        const holder = this.players.find((p) => p.data.id === this.ball.holderId);
        if (holder && holder.side === ctrl.side) {
          this.launchPass(holder, ctrl, 'chest');
        }
      }
      return;
    }

    // Flashy Pass
    if (code === kb.flashyPass && hasBall) {
      this.executeSmartPass(ctrl, 'flashy');
      return;
    }

    // Post-Up (Offense) / Block & Rebound (Defense)
    if (code === kb.postUp) {
      if (hasBall) {
        ctrl.isPostingUp = !ctrl.isPostingUp;
        ctrl.pose = ctrl.isPostingUp ? 'post' : 'dribble';
      } else {
        this.attemptBlockOrRebound(ctrl);
      }
      return;
    }

    // Pick & Roll (Offense) / Take Charge (Defense)
    if (code === kb.pickAndRoll) {
      if (this.possession === ctrl.side) {
        this.callPickAndRoll(ctrl);
      } else {
        this.attemptTakeCharge(ctrl);
      }
    }
  }

  private handlePointerDown = (e: PointerEvent): void => {
    if (this.replayMode) {
      this.replayDragging = true;
      this.replayLastX = e.clientX;
    }
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (this.replayMode && this.replayDragging) {
      const dx = e.clientX - this.replayLastX;
      this.replayLastX = e.clientX;
      this.replayOrbitAngle += dx * 0.009;
    }
  };

  private handlePointerUp = (): void => {
    this.replayDragging = false;
  };

  private handleContextLost = (e: Event): void => {
    e.preventDefault();
  };

  private handleResize(): void {
    if (this.disposed) return;
    const w = Math.max(320, this.container.clientWidth);
    const h = Math.max(240, this.container.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  // ==================== GAMEPLAY ACTIONS ====================

  private getControlledPlayer(): SimPlayer | undefined {
    return this.players.find((p) => p.data.id === this.controlledId) ?? this.players[0];
  }

  private getNearestOpponent(p: SimPlayer): SimPlayer | null {
    let best: SimPlayer | null = null;
    let bestDist = Infinity;
    for (const o of this.players) {
      if (o.side === p.side) continue;
      const d = Math.hypot(o.x - p.x, o.z - p.z);
      if (d < bestDist) {
        bestDist = d;
        best = o;
      }
    }
    return best;
  }

  private switchNearestDefender(): void {
    const userSide = this.config.userSide;
    const defs = this.players.filter((p) => p.side === userSide);
    let best = defs[0];
    let bestD = Infinity;
    for (const d of defs) {
      const dist = Math.hypot(d.x - this.ball.x, d.z - this.ball.z);
      if (dist < bestD) {
        bestD = dist;
        best = d;
      }
    }
    if (best) this.controlledId = best.data.id;
  }

  private startShotCharge(p: SimPlayer): void {
    this.isChargingShot = true;
    this.shotChargeTime = 0;
    this.shotStartPressMs = performance.now();
    this.shotReleaseDuration = p.data.releaseSpeed;
    p.pose = 'jumpshot';
  }

  private releaseShot(triggerCode?: string): void {
    const p = this.getControlledPlayer();
    this.isChargingShot = false;
    if (!p || this.ball.holderId !== p.data.id) return;

    const heldMs = performance.now() - this.shotStartPressMs;
    // Quick tap (<130ms) = Pump Fake!
    if (heldMs < 130 && this.config.mode !== 'shootout3pt') {
      p.pose = 'jumpshot';
      p.poseTimer = 0.24;
      const def = this.getNearestOpponent(p);
      if (def && Math.hypot(def.x - p.x, def.z - p.z) < 2.2) {
        def.jumpVelY = 4.6;
        def.pose = 'block';
        def.poseTimer = 0.55;
        this.commentary = `${p.data.name} pump fakes and gets ${def.data.name} in the air!`;
      }
      return;
    }

    const fill = this.shotChargeTime / this.shotReleaseDuration;
    const sweetSpot = 0.82;
    const releaseError = fill - sweetSpot;
    const kb = this.settings.keybinds;
    const isEuro = triggerCode === kb.proStickLeft || triggerCode === kb.proStickRight;

    this.fireBasketballShot(p, releaseError, isEuro);
  }

  private fireBasketballShot(p: SimPlayer, releaseError: number, forceEuro = false, isAlleyOop = false): void {
    const hoopX = this.getTargetHoopX(p.side);
    const { zone, isThree, distMeters } = classifyShotZone(p.x, p.z, hoopX, Boolean(this.config.fibaRules));
    const sprintHeld = p.data.id === this.controlledId && (this.keys.has(this.settings.keybinds.sprint) || this.virtualInput.sprint);
    const speed = Math.hypot(p.vx, p.vz);

    let shotType: 'three' | 'mid' | 'close' | 'layup' | 'dunk' | 'euro' | 'post_fade' | 'post_hook' = isThree ? 'three' : 'mid';
    if (isAlleyOop) {
      shotType = 'dunk';
    } else if (distMeters < 2.35 && (sprintHeld || p.data.attrs.dunk >= 80) && speed > 2.2) {
      shotType = 'dunk';
    } else if (distMeters < 2.8) {
      shotType = forceEuro ? 'euro' : p.isPostingUp ? 'post_hook' : 'layup';
    } else if (p.isPostingUp) {
      shotType = 'post_fade';
    } else if (distMeters < 4.2) {
      shotType = 'close';
    }

    // Calculate Defender Contest
    const def = this.getNearestOpponent(p);
    let contestRatio = 0;
    if (def && this.config.mode !== 'shootout3pt') {
      const dDist = Math.hypot(def.x - p.x, def.z - p.z);
      if (dDist < 2.6) {
        contestRatio = Math.max(0, 1 - dDist / 2.6);
        if (def.pose === 'hands_up' || def.pose === 'block') contestRatio = Math.min(1, contestRatio + 0.25);
        if (def.stumbleTimer > 0) contestRatio *= 0.2;
      }

      // Check Mid-Air Rim/Chasedown Block!
      if (def.pose === 'block' && dDist < 1.75) {
        const blkReach = computeBlockReachBonus(def.data, speed > 5);
        const blkProb = Math.min(0.55, (def.data.attrs.block / 260) * blkReach);
        if (Math.random() < blkProb) {
          def.stats.blk += 1;
          p.stats.fga += 1;
          this.ball.state = 'loose';
          this.ball.holderId = null;
          this.ball.vx = (p.x - def.x) * 3.5;
          this.ball.vy = 3.2;
          this.ball.vz = (p.z - def.z) * 3.5;
          Nba2k14Audio.playRimClank();
          Nba2k14Audio.playCrowdCheer(0.95);
          this.paBanner = `REJECTED BY ${def.data.name.toUpperCase()}!`;
          this.paBannerTimer = 1.6;
          this.commentary = `BLOCKED BY ${def.data.name}! What a swat at the rim!`;
          if (getSkillLevel(def.data.signatureSkills, 'eraser') > 0) {
            this.showSigSkillPopup('eraser', getSkillLevel(def.data.signatureSkills, 'eraser') as 1 | 2 | 3, def.data.name);
          }
          if (def.data.id === this.controlledId) this.adjustTeammateGrade(0.45, '+Block');
          return;
        }
      }

      // Check Shooting Foul on heavy paint contact
      if (
        this.settings.rules.shootingFouls &&
        this.config.mode !== 'park' &&
        this.config.mode !== 'blacktop' &&
        this.config.mode !== 'training' &&
        contestRatio > 0.72 &&
        (shotType === 'layup' || shotType === 'dunk') &&
        Math.random() < 0.14
      ) {
        this.triggerShootingFoul(p, def, isThree ? 3 : 2);
        return;
      }
    }

    const isUserShooter = p.side === this.config.userSide;
    const sliders = isUserShooter ? this.settings.slidersUser : this.settings.slidersCpu;
    const isClutch =
      this.settings.game.clutchFactor &&
      this.quarter >= 4 &&
      this.gameClockSec <= 240 &&
      Math.abs(this.homeScore - this.awayScore) <= 7;

    const teammates = this.players.filter((pl) => pl.side === p.side).map((pl) => pl.data);
    const outcome = computeShotProbability({
      shooter: p.data,
      defender: def?.data ?? null,
      teammatesOnCourt: teammates,
      shotType,
      zone,
      releaseError,
      noMeterBoost: this.settings.controller.shotMeterDisplay === 'Off (No-Meter Green Boost)',
      contestRatio,
      fatigueRatio: this.settings.game.fatigue ? Math.max(0, (100 - p.stamina) / 100) : 0,
      streak: p.streak,
      isFastbreak: this.shotClockSec > 18.5,
      offDribble: speed > 2.4 && shotType !== 'dunk' && shotType !== 'layup',
      justCaughtPass: p.catchTimer > 0,
      passerSkills: p.lastPasserSkills,
      passFromPost: p.lastPassFromPost,
      usedScreenRecently: p.usedScreenTimer > 0,
      isScreenerPop: p.screenerPopTimer > 0,
      isAlleyOop,
      isClutchTime: isClutch,
      difficulty: this.settings.game.difficulty,
      sliders,
      realPlayerPctMode: this.settings.game.shotTiming === 'Real Player FG%',
    });

    const willMake = Math.random() < outcome.makeProbability;

    // Trigger Signature Skill Flash
    if (outcome.triggeredSkills.length > 0) {
      const first = outcome.triggeredSkills[0];
      this.showSigSkillPopup(first.id, first.level, first.ownerName);
    }

    // Shot Feedback Banner for User
    if (isUserShooter && this.settings.controller.shotFeedback) {
      this.shotFeedback = {
        id: this.eventSeq++,
        release: outcome.releaseLabel,
        quality: outcome.qualityGrade,
        contestLabel: outcome.contestLabel,
        made: willMake,
        points: isThree ? 3 : 2,
        zone,
        shooterName: p.data.name,
      };
      this.shotFeedbackTimer = 2.4;
    }

    // Animate Player & Ball Trajectory
    p.pose = shotType === 'dunk' ? 'dunk' : shotType === 'layup' || shotType === 'euro' ? 'layup' : 'jumpshot';
    p.poseTimer = shotType === 'dunk' ? 0.65 : 0.45;
    p.jumpVelY = shotType === 'dunk' ? 5.6 : 4.2;
    p.isPostingUp = false;

    const targetSide: 'home' | 'away' = hoopX > 0 ? 'away' : 'home';
    this.ball.state = 'shot';
    this.ball.holderId = null;
    this.ball.shooterId = p.data.id;
    this.ball.shotTargetSide = targetSide;
    this.ball.shotWillMake = willMake;
    this.ball.shotPoints = isThree ? 3 : 2;
    this.ball.shotIsDunk = shotType === 'dunk';
    this.ball.shotZone = zone;
    this.ball.shotExcellent = outcome.releaseLabel === 'EXCELLENT';
    this.ball.shotFastbreak = this.shotClockSec > 18.5;
    this.ball.shotPaint = zone === 'restricted' || zone.startsWith('paint');
    this.ball.shotProgress = 0;
    this.ball.shotDuration = shotType === 'dunk' ? 0.34 : Math.min(1.15, Math.max(0.58, distMeters * 0.11));
    this.ball.shotStart.set(p.x, 2.15, p.z);
    this.ball.shotEnd.set(
      hoopX + (willMake ? 0 : (Math.random() > 0.5 ? 0.27 : -0.27)),
      RIM_Y,
      willMake ? 0 : (Math.random() - 0.5) * 0.38
    );
    this.ball.shotPeakY = shotType === 'dunk' ? RIM_Y + 0.55 : RIM_Y + 1.45 + distMeters * 0.24;

    if (shotType === 'dunk') {
      p.x = THREE.MathUtils.lerp(p.x, hoopX - Math.sign(hoopX) * 0.6, 0.55);
      p.z *= 0.4;
    }

    if (isUserShooter && outcome.qualityGrade === 'F') {
      this.adjustTeammateGrade(-0.22, '-Bad Shot Selection');
    } else if (isUserShooter && outcome.qualityGrade === 'A+') {
      this.adjustTeammateGrade(0.18, '+Good Shot Selection');
    }

    if (this.config.mode === 'training') {
      this.checkTrainingDrillProgress(shotType, willMake);
    }
  }

  private triggerIsoMotionDribble(p: SimPlayer, code: string): void {
    const kb = this.settings.keybinds;
    p.pose = 'crossover';
    p.poseTimer = 0.32;
    p.isoChain = Math.min(4, p.isoChain + 1);
    p.isoResetTimer = 1.6;
    p.stamina = Math.max(10, p.stamina - 4.5);

    const sidePush = code === kb.proStickLeft ? -3.4 : code === kb.proStickRight ? 3.4 : 0;
    const backPush = code === kb.proStickDown ? -3.2 * this.getAttackDir(p.side) : 1.8 * this.getAttackDir(p.side);
    p.vx += backPush;
    p.vz += sidePush;
    Nba2k14Audio.playSneakerSqueak();
    Nba2k14Audio.playDribble();

    // Roll Ankle Breaker Physics Check!
    const def = this.getNearestOpponent(p);
    if (def && Math.hypot(def.x - p.x, def.z - p.z) < 2.2) {
      const chance = computeAnkleBreakerChance(p.data, def.data, p.isoChain);
      if (Math.random() < chance) {
        def.stumbleTimer = 1.35;
        def.pose = 'stumble';
        this.crowdExcitement = Math.min(1, this.crowdExcitement + 0.45);
        Nba2k14Audio.playCrowdCheer(0.85);
        this.commentary = `OH! ${p.data.name} drops ${def.data.name} with a nasty IsoMotion crossover!`;
        const abLvl = getSkillLevel(p.data.signatureSkills, 'ankle_breaker');
        if (abLvl > 0) this.showSigSkillPopup('ankle_breaker', abLvl as 1 | 2 | 3, p.data.name);
        if (p.data.id === this.controlledId) this.adjustTeammateGrade(0.25, '+Ankle Breaker');
      }
    }
  }

  private executeSmartPass(passer: SimPlayer, style: 'chest' | 'bounce' | 'flashy'): void {
    const teammates = this.players.filter((pl) => pl.side === passer.side && pl.data.id !== passer.data.id);
    if (teammates.length === 0) return;

    // Pick best open teammate closest to movement/facing direction
    let best = teammates[0];
    let bestScore = -Infinity;
    for (const tm of teammates) {
      const dist = Math.hypot(tm.x - passer.x, tm.z - passer.z);
      const nearestDef = this.getNearestOpponent(tm);
      const openness = nearestDef ? Math.min(4, Math.hypot(nearestDef.x - tm.x, nearestDef.z - tm.z)) : 3;
      const score = openness * 2.5 - dist * 0.25;
      if (score > bestScore) {
        bestScore = score;
        best = tm;
      }
    }
    this.launchPass(passer, best, style);
  }

  private executeIconPass(slotIdx: number): void {
    const passer = this.getControlledPlayer();
    if (!passer || this.ball.holderId !== passer.data.id) return;
    const teammates = this.players.filter((pl) => pl.side === passer.side);
    const target = teammates[slotIdx];
    if (target && target.data.id !== passer.data.id) {
      this.launchPass(passer, target, 'chest');
    }
  }

  private launchPass(passer: SimPlayer, receiver: SimPlayer, style: 'chest' | 'bounce' | 'flashy'): void {
    // Check Flashy Pass turnover risk
    if (style === 'flashy') {
      const fpLvl = getSkillLevel(passer.data.signatureSkills, 'flashy_passer');
      const turnoverRisk = 0.22 * (1 - fpLvl * 0.2);
      if (fpLvl > 0) this.showSigSkillPopup('flashy_passer', fpLvl as 1 | 2 | 3, passer.data.name);
      if (Math.random() < turnoverRisk) {
        passer.stats.to += 1;
        this.ball.state = 'loose';
        this.ball.holderId = null;
        this.ball.vx = (receiver.x - passer.x) * 1.4;
        this.ball.vy = 1.6;
        this.ball.vz = (receiver.z - passer.z) * 1.4;
        this.commentary = `Flashy pass goes awry off ${passer.data.name}'s hands!`;
        return;
      }
    }

    this.ball.state = 'pass';
    this.ball.holderId = null;
    this.ball.passTargetId = receiver.data.id;
    this.ball.shooterId = passer.data.id;
    receiver.lastPasserSkills = passer.data.signatureSkills;
    receiver.lastPassFromPost = passer.isPostingUp;
    Nba2k14Audio.playDribble();
    if (passer.data.id === this.controlledId) {
      this.adjustTeammateGrade(0.08, style === 'flashy' ? '+Flashy Pass' : '+Good Pass');
    }
  }

  private attemptAlleyOop(passer: SimPlayer): void {
    const hoopX = this.getTargetHoopX(passer.side);
    const teammates = this.players.filter((pl) => pl.side === passer.side && pl.data.id !== passer.data.id);
    if (teammates.length === 0) return;
    const flyer = [...teammates].sort((a, b) => b.data.attrs.dunk + b.data.attrs.vertical - (a.data.attrs.dunk + a.data.attrs.vertical))[0];
    flyer.x = hoopX - Math.sign(hoopX) * 1.35;
    flyer.z = (Math.random() - 0.5) * 1.1;
    flyer.jumpVelY = 6.0;
    flyer.pose = 'dunk';
    flyer.poseTimer = 0.7;

    this.ball.holderId = flyer.data.id;
    passer.stats.ast += 1;
    const oopLvl = getSkillLevel(passer.data.signatureSkills, 'alley_ooper');
    if (oopLvl > 0) this.showSigSkillPopup('alley_ooper', oopLvl as 1 | 2 | 3, passer.data.name);
    this.commentary = `ALLEY-OOP! ${passer.data.name} throws it up to ${flyer.data.name} for the slam!`;
    this.fireBasketballShot(flyer, 0.01, false, true);
    if (this.config.mode === 'training' && this.config.trainingDrillId === 'alley_oop') {
      this.trainingReps += 1;
    }
  }

  private callPickAndRoll(handler: SimPlayer): void {
    const teammates = this.players.filter((pl) => pl.side === handler.side && pl.data.id !== handler.data.id);
    if (teammates.length === 0) return;
    const big = [...teammates].sort((a, b) => b.data.heightCm - a.data.heightCm)[0];
    big.isScreening = true;
    const dir = this.getAttackDir(handler.side);
    big.x = handler.x + dir * 1.15;
    big.z = handler.z + (handler.z > 0 ? -1.1 : 1.1);
    handler.usedScreenTimer = 3.2;
    big.screenerPopTimer = 3.5;
    this.otfc.activePlay = 'Pick & Roll';
    this.commentary = `${big.data.name} comes up to set a hard Pick & Roll screen!`;

    // Brick Wall vs Pick Dodger check on defender
    const def = this.getNearestOpponent(handler);
    if (def && Math.hypot(def.x - big.x, def.z - big.z) < 2.4) {
      const knock = computeScreenKnockdownChance(big.data, def.data);
      if (Math.random() < knock) {
        def.stumbleTimer = 1.25;
        def.pose = 'stumble';
        def.stamina = Math.max(10, def.stamina - 14);
        const bwLvl = getSkillLevel(big.data.signatureSkills, 'brick_wall');
        if (bwLvl > 0) this.showSigSkillPopup('brick_wall', bwLvl as 1 | 2 | 3, big.data.name);
      }
    }
    if (this.config.mode === 'training' && this.config.trainingDrillId === 'pick_roll') {
      this.trainingReps += 1;
    }
  }

  private attemptSteal(def: SimPlayer): void {
    const handler = this.players.find((p) => p.data.id === this.ball.holderId);
    if (!handler || handler.side === def.side) return;
    const dist = Math.hypot(handler.x - def.x, handler.z - def.z);
    def.pose = 'intense_d';
    def.poseTimer = 0.25;
    if (dist > 1.95) return;

    const sliders = def.side === this.config.userSide ? this.settings.slidersUser : this.settings.slidersCpu;
    const { stealProb, foulProb } = computeStealOutcome(def.data, handler.data, handler.pose === 'crossover', sliders.stealSuccess);

    if (Math.random() < stealProb) {
      def.stats.stl += 1;
      handler.stats.to += 1;
      this.ball.holderId = def.data.id;
      this.possession = def.side;
      this.shotClockSec = 24;
      this.backcourtTimer = 0;
      Nba2k14Audio.playSneakerSqueak();
      Nba2k14Audio.playCrowdCheer(0.65);
      this.commentary = `STOLEN BY ${def.data.name}! Clean rip!`;
      const pkp = getSkillLevel(def.data.signatureSkills, 'pick_pocket');
      if (pkp > 0) this.showSigSkillPopup('pick_pocket', pkp as 1 | 2 | 3, def.data.name);
      if (def.data.id === this.controlledId) this.adjustTeammateGrade(0.35, '+Steal');
      if (this.config.mode === 'training' && this.config.trainingDrillId === 'intense_d') {
        this.trainingReps += 1;
      }
    } else if (this.settings.rules.reachInFouls && Math.random() < foulProb && this.config.mode !== 'park' && this.config.mode !== 'blacktop') {
      def.stats.pf += 1;
      if (def.side === 'home') this.homeFoulsQ += 1;
      else this.awayFoulsQ += 1;
      Nba2k14Audio.playWhistle();
      this.commentary = `Whistle! Reach-in foul on ${def.data.name}.`;
      if (def.data.id === this.controlledId) this.adjustTeammateGrade(-0.25, '-Reach-In Foul');
    }
  }

  private attemptBlockOrRebound(p: SimPlayer): void {
    if (p.y > 0.05) return;
    p.jumpVelY = 5.1;
    p.pose = 'block';
    p.poseTimer = 0.45;
  }

  private attemptTakeCharge(def: SimPlayer): void {
    const handler = this.players.find((p) => p.data.id === this.ball.holderId);
    if (!handler || handler.side === def.side) return;
    const dist = Math.hypot(handler.x - def.x, handler.z - def.z);
    const speed = Math.hypot(handler.vx, handler.vz);
    if (this.settings.rules.chargingFouls && dist < 1.6 && speed > 4.2) {
      const cc = getSkillLevel(def.data.signatureSkills, 'charge_card');
      if (Math.random() < 0.28 + cc * 0.14) {
        handler.stats.pf += 1;
        handler.stats.to += 1;
        Nba2k14Audio.playWhistle();
        this.paBanner = 'OFFENSIVE FOUL · CHARGE DRAWN!';
        this.paBannerTimer = 1.8;
        this.commentary = `CHARGE! ${def.data.name} stood his ground and drew the offensive foul!`;
        if (cc > 0) this.showSigSkillPopup('charge_card', cc as 1 | 2 | 3, def.data.name);
        if (def.data.id === this.controlledId) this.adjustTeammateGrade(0.42, '+Charge Drawn');
        this.resetHalfCourtPossession(def.side);
      }
    }
  }

  private triggerShootingFoul(shooter: SimPlayer, defender: SimPlayer, count: 2 | 3): void {
    defender.stats.pf += 1;
    if (defender.side === 'home') this.homeFoulsQ += 1;
    else this.awayFoulsQ += 1;
    Nba2k14Audio.playWhistle();
    this.paBanner = `SHOOTING FOUL · ${count} FREE THROWS`;
    this.paBannerTimer = 2.0;
    this.commentary = `Foul called on ${defender.data.name}! ${shooter.data.name} heads to the charity stripe for ${count}.`;

    if (shooter.side === this.config.userSide && this.settings.game.freeThrowTiming === 'User Timing') {
      this.freeThrowActive = true;
      this.freeThrowShooterId = shooter.data.id;
      this.freeThrowRemaining = count;
      this.freeThrowPos = 0;
      this.freeThrowDir = 1;
    } else {
      // Simulate AI / Real Player FT%
      let made = 0;
      for (let i = 0; i < count; i++) {
        shooter.stats.fta += 1;
        if (Math.random() < shooter.data.attrs.freeThrow / 100) {
          shooter.stats.ftm += 1;
          shooter.stats.pts += 1;
          made += 1;
          this.addScore(shooter.side, 1);
        }
      }
      this.commentary = `${shooter.data.name} hits ${made} of ${count} free throws.`;
      this.resetHalfCourtPossession(shooter.side === 'home' ? 'away' : 'home');
    }
  }

  private resolveFreeThrow(): void {
    const shooter = this.players.find((p) => p.data.id === this.freeThrowShooterId);
    if (!shooter) {
      this.freeThrowActive = false;
      return;
    }
    const err = Math.abs(this.freeThrowPos - 0.5);
    const makeProb = err < 0.08 ? 0.98 : err < 0.18 ? 0.78 : 0.35;
    shooter.stats.fta += 1;
    if (Math.random() < makeProb) {
      shooter.stats.ftm += 1;
      shooter.stats.pts += 1;
      this.addScore(shooter.side, 1);
      Nba2k14Audio.playSwish(false);
      this.commentary = `${shooter.data.name} drains the free throw!`;
    } else {
      Nba2k14Audio.playRimClank();
      this.commentary = `${shooter.data.name} rims out the free throw.`;
    }
    this.freeThrowRemaining -= 1;
    if (this.freeThrowRemaining <= 0) {
      this.freeThrowActive = false;
      this.freeThrowShooterId = null;
      this.resetHalfCourtPossession(shooter.side === 'home' ? 'away' : 'home');
    }
  }

  private resolveDunkContestAttempt(): void {
    const move = DUNK_CONTEST_MOVES.find((m) => m.id === this.dunkMoveId) ?? DUNK_CONTEST_MOVES[0];
    const err = Math.abs(this.dunkMeterVal - 0.8);
    const base = Math.round(Math.max(32, Math.min(50, move.difficulty + (0.2 - err) * 45)));
    const judges = Array.from({ length: 5 }, (_, i) => Math.max(6, Math.min(10, Math.round(base / 5 + ((i % 2 === 0 ? 1 : -1) * (err < 0.06 ? 0 : 1))))));
    const total = judges.reduce((a, b) => a + b, 0);
    this.dunkJudgeScores = judges;
    this.dunkTotalScore += total;
    this.dunkPhase = 'scored';

    const dunker = this.players[0];
    dunker.x = HOOP_X - 0.8;
    dunker.y = 1.6;
    dunker.pose = 'dunk';
    dunker.poseTimer = 0.9;
    this.arena.triggerSwish('away', true);
    Nba2k14Audio.playDunkBoom();
    this.cameraShake = 0.55;
    this.paBanner = `DUNK SCORE: ${total} / 50!`;
    this.paBannerTimer = 2.4;
    this.commentary = `${move.name}! The judges award a ${total}!`;

    setTimeout(() => {
      if (this.disposed || this.finished) return;
      if (this.dunkRound >= 2) {
        this.homeScore = this.dunkTotalScore;
        this.awayScore = 84; // AI rival benchmark
        this.finalizeMatch();
      } else {
        this.dunkRound += 1;
        this.dunkAttempt += 1;
        this.dunkPhase = 'select';
        dunker.x = 3.2;
        dunker.y = 0;
        this.emitHud();
      }
    }, 2200);
    this.emitHud();
  }

  private checkTrainingDrillProgress(shotType: string, made: boolean): void {
    const id = this.config.trainingDrillId ?? 'freestyle';
    if (!made) return;
    if (
      id === 'freestyle' ||
      (id === 'jump_shot' && (shotType === 'three' || shotType === 'mid')) ||
      (id === 'isomotion' && (this.getControlledPlayer()?.isoChain ?? 0) > 0) ||
      (id === 'euro_hop' && (shotType === 'euro' || shotType === 'layup')) ||
      (id === 'poster_dunk' && shotType === 'dunk') ||
      (id === 'post_moves' && (shotType === 'post_fade' || shotType === 'post_hook'))
    ) {
      this.trainingReps += 1;
      const drill = TRAINING_DRILLS.find((d) => d.id === id);
      if (drill && this.trainingReps >= drill.targetReps && id !== 'freestyle') {
        this.homeScore = this.trainingReps * 2;
        this.awayScore = 0;
        this.paBanner = `DRILL COMPLETE · +${drill.spReward} SP!`;
        this.paBannerTimer = 2.0;
        setTimeout(() => {
          if (!this.disposed && !this.finished) this.finalizeMatch();
        }, 1200);
      }
    }
  }

  private showSigSkillPopup(id: SigSkillPopup['skillId'], level: 1 | 2 | 3, playerName: string): void {
    const def = SIGNATURE_SKILL_MAP[id];
    if (!def) return;
    this.sigPopup = {
      id: this.eventSeq++,
      skillId: id,
      skillName: def.name,
      code: def.code,
      playerName,
      level,
    };
    this.sigPopupTimer = 2.1;
  }

  private adjustTeammateGrade(delta: number, label: string): void {
    this.teammateGradeFill += delta;
    while (this.teammateGradeFill >= 1 && this.teammateGradeIdx < GRADE_STEPS.length - 1) {
      this.teammateGradeFill -= 1;
      this.teammateGradeIdx += 1;
    }
    while (this.teammateGradeFill < 0 && this.teammateGradeIdx > 0) {
      this.teammateGradeFill += 1;
      this.teammateGradeIdx -= 1;
    }
    this.teammateGradeFill = Math.max(0.05, Math.min(0.95, this.teammateGradeFill));
    this.gradeEvents = [{ id: this.eventSeq++, text: label, positive: delta >= 0 }, ...this.gradeEvents].slice(0, 4);
  }

  private addScore(side: 'home' | 'away', pts: number): void {
    const actualPts = this.config.targetScore ? (pts === 3 ? 2 : 1) : pts; // Park/Blacktop 1s & 2s
    if (side === 'home') {
      this.homeScore += actualPts;
      this.quarterScoresHome[Math.min(3, this.quarter - 1)] += actualPts;
    } else {
      this.awayScore += actualPts;
      this.quarterScoresAway[Math.min(3, this.quarter - 1)] += actualPts;
    }

    if (this.config.targetScore && (this.homeScore >= this.config.targetScore || this.awayScore >= this.config.targetScore)) {
      this.finalizeMatch();
    }
  }

  // ==================== MAIN SIMULATION LOOP ====================

  private pollGamepad(): { mx: number; my: number; sprint: boolean } {
    let mx = 0;
    let my = 0;
    let sprint = false;
    try {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = pads && pads[0];
      if (!gp) return { mx, my, sprint };
      if (Math.abs(gp.axes[0] || 0) > 0.18) mx = gp.axes[0];
      if (Math.abs(gp.axes[1] || 0) > 0.18) my = gp.axes[1];
      sprint = Boolean(gp.buttons[7]?.pressed);

      const kb = this.settings.keybinds;
      const btnPressed = (idx: number) => Boolean(gp.buttons[idx]?.pressed);
      const justPressed = (idx: number) => btnPressed(idx) && !this.prevGamepadButtons[idx];
      const justReleased = (idx: number) => !btnPressed(idx) && Boolean(this.prevGamepadButtons[idx]);

      if (justPressed(2)) this.onActionPress(kb.shoot); // Square / X
      if (justReleased(2) && this.isChargingShot) this.releaseShot(kb.shoot);
      if (justPressed(0)) this.onActionPress(kb.pass); // Cross / A
      if (justPressed(3)) this.onActionPress(kb.postUp); // Triangle / Y
      if (justPressed(1)) this.onActionPress(kb.pickAndRoll); // Circle / B
      if (justPressed(9)) this.setPaused(!this.paused); // Start
      if (justPressed(5)) this.iconPassActive = !this.iconPassActive; // R1

      // Right Stick IsoMotion Flick
      if (Math.abs(gp.axes[2] || 0) > 0.72) {
        const ctrl = this.getControlledPlayer();
        if (ctrl && this.ball.holderId === ctrl.data.id && ctrl.poseTimer <= 0) {
          this.triggerIsoMotionDribble(ctrl, gp.axes[2] < 0 ? kb.proStickLeft : kb.proStickRight);
        }
      }

      this.prevGamepadButtons = gp.buttons.map((b) => b.pressed);
    } catch {
      // ignore unsupported gamepad
    }
    return { mx, my, sprint };
  }

  private tick = (): void => {
    if (this.disposed) return;

    const now = performance.now();
    const rawDt = Math.min(0.05, Math.max(0.001, (now - this.lastFrameMs) * 0.001));
    this.lastFrameMs = now;
    this.fps = Math.round(this.fps * 0.9 + (1 / rawDt) * 0.1);

    const speedMult = 0.7 + (this.settings.game.gameSpeed / 100) * 0.6;
    const dt = rawDt * speedMult;

    if (this.replayMode) {
      this.updateReplayView(rawDt);
    } else if (!this.paused && !this.finished) {
      this.elapsed += dt;
      this.stepSimulation(dt);
      this.recordReplayFrame(rawDt);
      this.updateCamera(rawDt);
    }

    this.arena.updateArena(rawDt, this.elapsed, this.crowdExcitement, this.buzzerFlashTimer > 0);
    this.renderer.render(this.scene, this.camera);

    this.hudEmitAccum += rawDt;
    if (this.hudEmitAccum >= 0.06) {
      this.hudEmitAccum = 0;
      this.emitHud();
    }

    if (this.isSoftwareGl) {
      setTimeout(() => {
        if (!this.disposed) this.rafId = requestAnimationFrame(this.tick);
      }, 28);
    } else {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  private stepSimulation(dt: number): void {
    this.crowdExcitement = Math.max(0.2, this.crowdExcitement - dt * 0.14);
    if (this.buzzerFlashTimer > 0) this.buzzerFlashTimer = Math.max(0, this.buzzerFlashTimer - dt);
    if (this.cameraShake > 0) this.cameraShake = Math.max(0, this.cameraShake - dt * 2.5);
    if (this.shotFeedbackTimer > 0) {
      this.shotFeedbackTimer -= dt;
      if (this.shotFeedbackTimer <= 0) this.shotFeedback = null;
    }
    if (this.sigPopupTimer > 0) {
      this.sigPopupTimer -= dt;
      if (this.sigPopupTimer <= 0) this.sigPopup = null;
    }
    if (this.paBannerTimer > 0) {
      this.paBannerTimer -= dt;
      if (this.paBannerTimer <= 0) this.paBanner = null;
    }

    // Free Throw Meter Oscillation
    if (this.freeThrowActive) {
      this.freeThrowPos += this.freeThrowDir * dt * 1.45;
      if (this.freeThrowPos >= 1) {
        this.freeThrowPos = 1;
        this.freeThrowDir = -1;
      } else if (this.freeThrowPos <= 0) {
        this.freeThrowPos = 0;
        this.freeThrowDir = 1;
      }
      this.syncRigTransforms(dt);
      return;
    }

    // 3-Point Shootout Timer
    if (this.config.mode === 'shootout3pt') {
      this.shootoutTime = Math.max(0, this.shootoutTime - dt);
      if (this.shootoutTime <= 0) {
        Nba2k14Audio.playBuzzer();
        this.homeScore = this.shootoutScore;
        this.awayScore = 18;
        this.finalizeMatch();
        return;
      }
    }

    // Dunk Contest Runup & Meter
    if (this.config.mode === 'dunkcontest') {
      const dunker = this.players[0];
      if (this.dunkPhase === 'runup') {
        dunker.x += dt * 5.8;
        dunker.pose = 'dribble';
        this.dunkMeterVal = Math.min(1, (dunker.x - 2.2) / 9.2);
        if (dunker.x >= HOOP_X - 2.4) this.dunkPhase = 'meter';
        if (dunker.x >= HOOP_X - 0.6) this.resolveDunkContestAttempt();
      } else if (this.dunkPhase === 'meter') {
        dunker.x += dt * 3.8;
        this.dunkMeterVal = Math.min(1, this.dunkMeterVal + dt * 0.65);
        if (this.dunkMeterVal >= 1) this.resolveDunkContestAttempt();
      }
      this.syncRigTransforms(dt);
      this.updateBall(dt);
      return;
    }

    // Regulation Clocks
    if (this.config.mode !== 'shootout3pt' && this.config.mode !== 'training' && !this.config.targetScore) {
      this.gameClockSec = Math.max(0, this.gameClockSec - dt);
      if (this.gameClockSec <= 0) {
        this.buzzerFlashTimer = 1.6;
        Nba2k14Audio.playBuzzer();
        if (this.quarter < 4 || this.homeScore === this.awayScore) {
          this.quarter += 1;
          this.homeFoulsQ = 0;
          this.awayFoulsQ = 0;
          this.gameClockSec = this.quarter > 4 ? Math.min(180, this.config.quarterLengthMin * 60) : this.config.quarterLengthMin * 60;
          this.paBanner = this.quarter > 4 ? `OVERTIME ${this.quarter - 4}` : `START OF QUARTER ${this.quarter}`;
          this.paBannerTimer = 2.2;
          this.resetHalfCourtPossession(this.quarter % 2 === 0 ? 'away' : 'home', true);
        } else {
          this.finalizeMatch();
          return;
        }
      }
    }

    // 24-Second Shot Clock
    if (this.settings.rules.shotClock24 && this.config.mode !== 'shootout3pt' && this.config.mode !== 'training' && this.ball.state === 'held') {
      this.shotClockSec = Math.max(0, this.shotClockSec - dt);
      if (this.shotClockSec <= 0) {
        this.buzzerFlashTimer = 1.4;
        Nba2k14Audio.playBuzzer();
        this.paBanner = '24-SECOND SHOT CLOCK VIOLATION';
        this.paBannerTimer = 1.8;
        this.resetHalfCourtPossession(this.possession === 'home' ? 'away' : 'home');
        return;
      }
    }

    // Charge Active Shot Meter
    if (this.isChargingShot) {
      this.shotChargeTime += dt;
      if (this.shotChargeTime >= this.shotReleaseDuration * 1.25) {
        this.releaseShot();
      }
    }

    // Handle Virtual Touch Shoot Button Edge
    if (this.virtualInput.shoot && !this.prevVirtualShoot) {
      this.onActionPress(this.settings.keybinds.shoot);
    } else if (!this.virtualInput.shoot && this.prevVirtualShoot && this.isChargingShot) {
      this.releaseShot(this.settings.keybinds.shoot);
    }
    this.prevVirtualShoot = this.virtualInput.shoot;

    // Update Controlled Player Movement
    this.updateControlledMovement(dt);

    // Update AI Players
    if (this.config.mode !== 'shootout3pt') {
      this.updateAiPlayers(dt);
    }

    // Update Ball & Scoring
    this.updateBall(dt);

    // Sync 3D Player Rigs & Floor Rings
    this.syncRigTransforms(dt);

    // Update PlayVision 3D Floor Art
    this.arena.setPlayVision(
      this.otfc.activePlay,
      this.getAttackDir(this.possession),
      this.settings.coach.playVision !== 'Off' && this.possession === this.config.userSide
    );
  }

  private updateControlledMovement(dt: number): void {
    const p = this.getControlledPlayer();
    if (!p || this.config.mode === 'shootout3pt') return;

    const kb = this.settings.keybinds;
    const gp = this.pollGamepad();

    let inX = gp.mx + this.virtualInput.moveX;
    let inY = gp.my + this.virtualInput.moveY;
    if (this.keys.has(kb.moveUp)) inY -= 1;
    if (this.keys.has(kb.moveDown)) inY += 1;
    if (this.keys.has(kb.moveLeft)) inX -= 1;
    if (this.keys.has(kb.moveRight)) inX += 1;

    const mag = Math.hypot(inX, inY);
    if (mag > 1) {
      inX /= mag;
      inY /= mag;
    }

    // Map screen-space input according to active camera orientation
    let worldDx = 0;
    let worldDz = 0;
    const camAngle = this.settings.camera.angle;
    if (camAngle === '2K' || camAngle === 'Turbo' || camAngle === 'Drive' || camAngle === 'Player Lock') {
      const dir = this.settings.camera.autoFlip ? this.getAttackDir(this.possession) : this.getAttackDir(this.config.userSide);
      worldDx = -inY * dir;
      worldDz = inX * dir;
    } else {
      // Broadcast / Nosebleeds TV Sideline orientation
      worldDx = inX;
      worldDz = inY;
    }

    const sprint = (this.keys.has(kb.sprint) || gp.sprint || this.virtualInput.sprint) && p.stamina > 8;
    const intenseD = (this.keys.has(kb.intenseD) || this.virtualInput.intenseD) && this.possession !== p.side;
    const handsUp = this.keys.has(kb.handsUp) && this.possession !== p.side;

    const fastbreakBonus = this.shotClockSec > 18 ? getEffectiveFastbreakSpeedBonus(p.data) * 0.08 : 0;
    const baseSpeed = 4.6 + (p.data.attrs.speed / 99) * 2.4 + fastbreakBonus;
    const moveSpeed = sprint ? baseSpeed * 1.28 : intenseD ? baseSpeed * 0.78 : baseSpeed;

    if (p.stumbleTimer > 0) {
      p.vx *= 0.85;
      p.vz *= 0.85;
    } else if (this.isChargingShot) {
      p.vx *= 0.72;
      p.vz *= 0.72;
    } else {
      p.vx = THREE.MathUtils.lerp(p.vx, worldDx * moveSpeed, Math.min(1, dt * 11));
      p.vz = THREE.MathUtils.lerp(p.vz, worldDz * moveSpeed, Math.min(1, dt * 11));
    }

    p.x += p.vx * dt;
    p.z += p.vz * dt;

    // Out-of-bounds clamping (or violation)
    const maxX = COURT_LENGTH / 2 - 0.35;
    const maxZ = COURT_WIDTH / 2 - 0.35;
    p.x = THREE.MathUtils.clamp(p.x, -maxX, maxX);
    p.z = THREE.MathUtils.clamp(p.z, -maxZ, maxZ);

    // Stamina drain / recovery
    if (this.settings.game.fatigue) {
      if (sprint && mag > 0.1) p.stamina = Math.max(5, p.stamina - dt * 14);
      else p.stamina = Math.min(100, p.stamina + dt * 6.5);
      p.stats.stamina = Math.round(p.stamina);
    }

    if (p.poseTimer <= 0 && p.stumbleTimer <= 0 && !this.isChargingShot) {
      if (handsUp) p.pose = 'hands_up';
      else if (intenseD) p.pose = 'intense_d';
      else if (p.isPostingUp) p.pose = 'post';
      else if (this.ball.holderId === p.data.id) p.pose = 'dribble';
      else p.pose = Math.hypot(p.vx, p.vz) > 0.6 ? 'run' : 'idle';
    }

    // Intense D Defensive Assist Shading
    if (intenseD && this.settings.controller.defensiveAssist > 10) {
      const handler = this.players.find((pl) => pl.data.id === this.ball.holderId);
      if (handler && Math.hypot(handler.x - p.x, handler.z - p.z) < 3.5) {
        const hoopX = this.getTargetHoopX(handler.side);
        const shadeX = THREE.MathUtils.lerp(handler.x, hoopX, 0.22);
        const assist = (this.settings.controller.defensiveAssist / 100) * dt * 2.8;
        p.x = THREE.MathUtils.lerp(p.x, shadeX, assist);
        p.z = THREE.MathUtils.lerp(p.z, handler.z, assist);
      }
    }

    // Facing Direction
    const hoopX = this.getTargetHoopX(p.side);
    if (this.ball.holderId === p.data.id || p.isPostingUp) {
      p.rotY = Math.atan2(hoopX - p.x, -p.z);
    } else if (Math.hypot(p.vx, p.vz) > 0.4) {
      p.rotY = Math.atan2(p.vx, p.vz);
    }
  }

  private updateAiPlayers(dt: number): void {
    this.aiDecisionCooldown = Math.max(0, this.aiDecisionCooldown - dt);
    const offDir = this.getAttackDir(this.possession);
    const attackHoopX = this.getTargetHoopX(this.possession);

    const offTeam = this.players.filter((p) => p.side === this.possession);
    const defTeam = this.players.filter((p) => p.side !== this.possession);

    // Floor spacing spots for off-ball offense
    const spacingSpots: [number, number][] = [
      [attackHoopX - offDir * 7.8, 0],
      [attackHoopX - offDir * 2.2, -6.5],
      [attackHoopX - offDir * 2.2, 6.5],
      [attackHoopX - offDir * 5.6, -4.4],
      [attackHoopX - offDir * 4.2, 3.6],
    ];

    for (const p of this.players) {
      if (p.data.id === this.controlledId) continue;
      if (p.stumbleTimer > 0) continue;

      const isOff = p.side === this.possession;
      const hasBall = this.ball.state === 'held' && this.ball.holderId === p.data.id;
      const moveSpeed = 4.3 + (p.data.attrs.speed / 99) * 2.1;

      let targetX = p.x;
      let targetZ = p.z;

      if (this.ball.state === 'loose') {
        targetX = this.ball.x;
        targetZ = this.ball.z;
      } else if (hasBall) {
        // AI Ball Handler attacks hoop or looks for open jumper / pass
        const distHoop = Math.hypot(attackHoopX - p.x, -p.z);
        targetX = attackHoopX - offDir * (p.data.attrs.threePt >= 82 ? 6.8 : 2.1);
        targetZ = Math.sin(this.elapsed * 0.9 + p.slotIdx) * 3.8;

        if (this.aiDecisionCooldown <= 0 && distHoop < 9.0) {
          this.aiDecisionCooldown = 0.7 + Math.random() * 0.65;
          const def = this.getNearestOpponent(p);
          const defDist = def ? Math.hypot(def.x - p.x, def.z - p.z) : 5;

          if ((distHoop < 2.5 || defDist > 2.2 || this.shotClockSec < 4.5) && Math.random() < 0.62) {
            const aiErr = (Math.random() - 0.5) * (this.settings.game.difficulty === 'Hall of Fame' ? 0.08 : 0.19);
            this.fireBasketballShot(p, aiErr);
          } else if (Math.random() < 0.42) {
            this.executeSmartPass(p, 'chest');
          }
        }
      } else if (isOff) {
        const spot = spacingSpots[p.slotIdx % spacingSpots.length];
        const cutWave = this.otfc.activePlay === 'Motion Cuts' ? Math.sin(this.elapsed * 1.6 + p.slotIdx) * 1.9 : 0;
        targetX = spot[0] + cutWave * offDir * 0.4;
        targetZ = spot[1] + cutWave * 0.5;
      } else {
        // Defender tracks matchup or zone spot
        const match = offTeam[p.slotIdx % Math.max(1, offTeam.length)];
        if (this.otfc.defenseSet === '2-3 Zone' && p.side === this.config.userSide) {
          const zoneSpots: [number, number][] = [
            [attackHoopX - offDir * 5.8, -2.5],
            [attackHoopX - offDir * 5.8, 2.5],
            [attackHoopX - offDir * 2.4, -4.4],
            [attackHoopX - offDir * 2.4, 4.4],
            [attackHoopX - offDir * 2.2, 0],
          ];
          const zs = zoneSpots[p.slotIdx % zoneSpots.length];
          targetX = zs[0];
          targetZ = zs[1];
        } else if (match) {
          const tight = match.data.id === this.ball.holderId ? 0.16 : 0.28;
          targetX = THREE.MathUtils.lerp(match.x, attackHoopX, tight);
          targetZ = THREE.MathUtils.lerp(match.z, 0, tight * 0.5);
        }
      }

      const dx = targetX - p.x;
      const dz = targetZ - p.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.25) {
        p.vx = THREE.MathUtils.lerp(p.vx, (dx / dist) * moveSpeed, Math.min(1, dt * 8));
        p.vz = THREE.MathUtils.lerp(p.vz, (dz / dist) * moveSpeed, Math.min(1, dt * 8));
      } else {
        p.vx *= 0.8;
        p.vz *= 0.8;
      }

      p.x = THREE.MathUtils.clamp(p.x + p.vx * dt, -COURT_LENGTH / 2 + 0.4, COURT_LENGTH / 2 - 0.4);
      p.z = THREE.MathUtils.clamp(p.z + p.vz * dt, -COURT_WIDTH / 2 + 0.4, COURT_WIDTH / 2 - 0.4);

      if (p.poseTimer <= 0) {
        if (hasBall) p.pose = 'dribble';
        else if (!isOff && dist < 1.8) p.pose = 'intense_d';
        else p.pose = Math.hypot(p.vx, p.vz) > 0.55 ? 'run' : 'idle';
      }

      p.rotY = isOff
        ? Math.atan2(attackHoopX - p.x, -p.z)
        : Math.atan2(this.ball.x - p.x, this.ball.z - p.z);
    }

    // Keep unused ref quiet
    void defTeam;
  }

  private updateBall(dt: number): void {
    const b = this.ball;
    if (b.state === 'held') {
      const holder = this.players.find((p) => p.data.id === b.holderId);
      if (holder) {
        b.dribblePhase += dt * (Math.hypot(holder.vx, holder.vz) > 1 ? 11.5 : 8.0);
        const bounce = holder.pose === 'jumpshot' || holder.pose === 'dunk' ? 2.15 + holder.y : 0.14 + Math.abs(Math.sin(b.dribblePhase)) * 0.88;
        const sideOffX = Math.cos(holder.rotY) * 0.34 + Math.sin(holder.rotY) * 0.32;
        const sideOffZ = -Math.sin(holder.rotY) * 0.34 + Math.cos(holder.rotY) * 0.32;
        b.x = holder.x + sideOffX;
        b.y = bounce;
        b.z = holder.z + sideOffZ;
      }
    } else if (b.state === 'pass') {
      const target = this.players.find((p) => p.data.id === b.passTargetId);
      if (!target) {
        b.state = 'loose';
      } else {
        const dx = target.x - b.x;
        const dz = target.z - b.z;
        const dist = Math.hypot(dx, dz);
        const passSpeed = 17.5;
        if (dist < 0.65) {
          b.state = 'held';
          b.holderId = target.data.id;
          b.passTargetId = null;
          target.catchTimer = 1.05; // Catch & Shoot 1s window!
          if (!this.config.playerLockId && target.side === this.config.userSide) {
            this.controlledId = target.data.id;
          }
        } else {
          b.x += (dx / dist) * passSpeed * dt;
          b.z += (dz / dist) * passSpeed * dt;
          b.y = THREE.MathUtils.lerp(b.y, 1.35, dt * 8);
        }
      }
    } else if (b.state === 'shot') {
      b.shotProgress += dt / b.shotDuration;
      const t = Math.min(1, b.shotProgress);
      b.x = THREE.MathUtils.lerp(b.shotStart.x, b.shotEnd.x, t);
      b.z = THREE.MathUtils.lerp(b.shotStart.z, b.shotEnd.z, t);
      const linearY = THREE.MathUtils.lerp(b.shotStart.y, b.shotEnd.y, t);
      const arcBoost = Math.sin(t * Math.PI) * (b.shotPeakY - Math.max(b.shotStart.y, b.shotEnd.y));
      b.y = linearY + arcBoost;

      if (b.shotProgress >= 1) {
        this.onShotReachedRim();
      }
    } else if (b.state === 'loose') {
      b.vy -= 12.8 * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.z += b.vz * dt;
      if (b.y <= 0.13) {
        b.y = 0.13;
        b.vy = Math.abs(b.vy) * 0.62;
        b.vx *= 0.82;
        b.vz *= 0.82;
        if (b.vy > 0.6) Nba2k14Audio.playDribble();
      }
      b.x = THREE.MathUtils.clamp(b.x, -COURT_LENGTH / 2 + 0.5, COURT_LENGTH / 2 - 0.5);
      b.z = THREE.MathUtils.clamp(b.z, -COURT_WIDTH / 2 + 0.5, COURT_WIDTH / 2 - 0.5);

      // Rebound Battle
      if (b.y < 2.25) {
        let winner: SimPlayer | null = null;
        let bestScore = -Infinity;
        for (const p of this.players) {
          const dist = Math.hypot(p.x - b.x, p.z - b.z);
          if (dist < 1.55) {
            const isOff = p.side === b.lastTouchedSide;
            const score = computeReboundScore(p.data, isOff, dist);
            if (score > bestScore) {
              bestScore = score;
              winner = p;
            }
          }
        }
        if (winner) {
          winner.stats.reb += 1;
          const isOffReb = winner.side === this.possession;
          b.state = 'held';
          b.holderId = winner.data.id;
          this.possession = winner.side;
          this.shotClockSec = isOffReb ? 14 : 24;
          if (!this.config.playerLockId && winner.side === this.config.userSide) {
            this.controlledId = winner.data.id;
          }
          if (winner.data.id === this.controlledId) {
            this.adjustTeammateGrade(0.28, isOffReb ? '+Offensive Rebound' : '+Defensive Rebound');
          }
          if (getSkillLevel(winner.data.signatureSkills, 'tenacious_rebounder') > 0) {
            this.showSigSkillPopup('tenacious_rebounder', getSkillLevel(winner.data.signatureSkills, 'tenacious_rebounder') as 1 | 2 | 3, winner.data.name);
          }
        }
      }
    }

    b.mesh.position.set(b.x, b.y, b.z);
    b.mesh.rotation.x += dt * 7;
    b.mesh.rotation.z += dt * 3;
  }

  private onShotReachedRim(): void {
    const b = this.ball;
    const shooter = this.players.find((p) => p.data.id === b.shooterId);
    const isChainNet = this.config.courtEnv === 'blacktop' || this.config.courtEnv === 'park';

    if (shooter) {
      shooter.stats.fga += 1;
      if (b.shotPoints === 3) shooter.stats.tpa += 1;
      if (shooter.side === this.config.userSide) {
        this.userShotLog.push({
          zone: b.shotZone,
          made: b.shotWillMake,
          pts: b.shotPoints,
          excellent: b.shotExcellent,
          fastbreak: b.shotFastbreak,
          paint: b.shotPaint,
        });
      }
    }

    // 3-Point Shootout Advance Logic
    if (this.config.mode === 'shootout3pt') {
      const isMoney = this.shootoutBallInRack === 4;
      if (b.shotWillMake) {
        const add = isMoney ? 2 : 1;
        this.shootoutScore += add;
        this.homeScore = this.shootoutScore;
        this.arena.triggerSwish('away', false);
        Nba2k14Audio.playSwish(false);
        Nba2k14Audio.playCrowdCheer(isMoney ? 0.9 : 0.45);
        this.commentary = isMoney ? `MONEY BALL! +2! Total: ${this.shootoutScore}` : `Swish! Total: ${this.shootoutScore}`;
      } else {
        Nba2k14Audio.playRimClank();
      }
      this.shootoutBallInRack += 1;
      if (this.shootoutBallInRack >= 5) {
        this.shootoutBallInRack = 0;
        this.shootoutRack += 1;
      }
      if (this.shootoutRack >= 5) {
        this.awayScore = 18;
        this.finalizeMatch();
        return;
      }
      const p = this.players[0];
      const [rx, rz] = THREE_PT_RACK_POSITIONS[this.shootoutRack];
      p.x = rx;
      p.z = rz;
      p.rotY = Math.atan2(HOOP_X - rx, -rz);
      b.state = 'held';
      b.holderId = p.data.id;
      return;
    }

    if (b.shotWillMake) {
      this.arena.triggerSwish(b.shotTargetSide, b.shotIsDunk);
      if (b.shotIsDunk) {
        Nba2k14Audio.playDunkBoom();
        if (this.settings.camera.dunkShake) this.cameraShake = 0.48;
      } else {
        Nba2k14Audio.playSwish(isChainNet);
        if (b.shotPoints === 3) {
          Nba2k14Audio.playArenaOrgan('three');
          Nba2k14Audio.playCrowdCheer(0.85);
        } else {
          Nba2k14Audio.playCrowdCheer(0.45);
        }
      }
      this.crowdExcitement = Math.min(1, this.crowdExcitement + (b.shotIsDunk || b.shotPoints === 3 ? 0.55 : 0.25));

      if (shooter) {
        shooter.stats.fgm += 1;
        if (b.shotPoints === 3) shooter.stats.tpm += 1;
        shooter.stats.pts += b.shotPoints;
        shooter.streak = Math.max(1, shooter.streak + 1);
        shooter.stats.streak = shooter.streak;
        if (shooter.catchTimer > 0 && shooter.lastPasserSkills) {
          // Credit assist to previous teammate
          const teammates = this.players.filter((pl) => pl.side === shooter.side && pl.data.id !== shooter.data.id);
          if (teammates[0]) teammates[0].stats.ast += 1;
        }
        const hot = shooter.streak >= getHotThreshold(shooter.data);
        this.commentary = b.shotIsDunk
          ? `THUNDEROUS SLAM BY ${shooter.data.name.toUpperCase()}!`
          : b.shotPoints === 3
            ? `${shooter.data.name} FROM DOWNTOWN — BANG!${hot ? ' HE IS ON FIRE!' : ''}`
            : `${shooter.data.name} knocks it down for two!`;
        if (shooter.data.id === this.controlledId) {
          this.adjustTeammateGrade(b.shotPoints === 3 ? 0.34 : 0.26, b.shotIsDunk ? '+Highlight Dunk' : '+Score');
        }
        this.addScore(shooter.side, b.shotPoints);
      }

      if (!this.finished) {
        if (this.config.mode === 'training') {
          this.resetHalfCourtPossession(this.config.userSide);
        } else {
          const nextOff: 'home' | 'away' = shooter?.side === 'home' ? 'away' : 'home';
          this.resetHalfCourtPossession(nextOff);
        }
      }
    } else {
      Nba2k14Audio.playRimClank();
      if (shooter) {
        if (canGoCold(shooter.data)) shooter.streak = Math.min(-1, shooter.streak - 1);
        else shooter.streak = Math.max(0, shooter.streak - 1);
        shooter.stats.streak = shooter.streak;
      }
      b.state = 'loose';
      b.lastTouchedSide = shooter?.side ?? 'home';
      const bounceDir = b.shotTargetSide === 'away' ? -1 : 1;
      b.vx = bounceDir * (2.0 + Math.random() * 2.2);
      b.vy = 3.1 + Math.random() * 1.4;
      b.vz = (Math.random() - 0.5) * 4.2;
    }
  }

  private syncRigTransforms(dt: number): void {
    const ballHolder = this.players.find((p) => p.data.id === this.ball.holderId);
    const primaryDefender = ballHolder ? this.getNearestOpponent(ballHolder) : null;

    for (const p of this.players) {
      if (p.poseTimer > 0) p.poseTimer = Math.max(0, p.poseTimer - dt);
      if (p.stumbleTimer > 0) p.stumbleTimer = Math.max(0, p.stumbleTimer - dt);
      if (p.catchTimer > 0) p.catchTimer = Math.max(0, p.catchTimer - dt);
      if (p.usedScreenTimer > 0) p.usedScreenTimer = Math.max(0, p.usedScreenTimer - dt);
      if (p.screenerPopTimer > 0) p.screenerPopTimer = Math.max(0, p.screenerPopTimer - dt);
      if (p.isoResetTimer > 0) {
        p.isoResetTimer -= dt;
        if (p.isoResetTimer <= 0) p.isoChain = 0;
      }

      if (p.y > 0 || p.jumpVelY !== 0) {
        p.y += p.jumpVelY * dt;
        p.jumpVelY -= 14.5 * dt;
        if (p.y <= 0) {
          p.y = 0;
          p.jumpVelY = 0;
        }
      }

      p.rig.root.position.set(p.x, 0, p.z);
      p.rig.bodyGroup.rotation.y = p.rotY;
      animatePlayerRig(p.rig, p.pose, this.elapsed, Math.hypot(p.vx, p.vz) / 6.5, p.y);

      const isCtrl = p.data.id === this.controlledId;
      const isPrimDef = primaryDefender?.data.id === p.data.id;
      const showRing = this.settings.presentation.playerIndicatorStyle !== 'Name + Number';

      let matchupAngle: number | null = null;
      if (isCtrl && this.possession !== p.side) {
        const opp = this.getNearestOpponent(p);
        if (opp) matchupAngle = Math.atan2(opp.x - p.x, opp.z - p.z);
      }

      updatePlayerFloorRing(p.rig, {
        visible: showRing && (isCtrl || isPrimDef),
        isControlled: isCtrl,
        isPrimaryDefender: isPrimDef,
        stamina: p.stamina,
        streak: p.streak,
        showShotMeter:
          isCtrl &&
          this.isChargingShot &&
          this.settings.controller.shotMeterDisplay === 'On (Floor Ring)',
        shotFill: this.shotChargeTime / this.shotReleaseDuration,
        matchupAngle,
        teamColor: p.side === 'home' ? this.homeTeam.primaryColor : this.awayTeam.primaryColor,
      });
    }
  }

  private updateCamera(dt: number): void {
    const camCfg = this.settings.camera;
    const zoomScale = 1.35 - camCfg.zoom * 0.06;
    const heightBoost = (camCfg.height - 5) * 0.65;

    const focusX = this.config.mode === 'shootout3pt' || this.config.mode === 'dunkcontest'
      ? (this.players[0]?.x ?? 4) * 0.65 + HOOP_X * 0.35
      : this.ball.x * 0.72;
    const focusZ = this.ball.z * 0.55;

    const desiredPos = new THREE.Vector3();
    const desiredLook = new THREE.Vector3(focusX, 1.7, focusZ);

    if (camCfg.angle === 'Broadcast' || camCfg.angle === 'Nosebleeds') {
      const dist = (camCfg.angle === 'Nosebleeds' ? 23 : 16.5) * zoomScale;
      desiredPos.set(focusX * 0.65, (camCfg.angle === 'Nosebleeds' ? 14 : 9.4) + heightBoost, dist);
    } else if (camCfg.angle === 'Player Lock') {
      const ctrl = this.getControlledPlayer();
      const dir = this.getAttackDir(this.possession);
      const px = ctrl?.x ?? focusX;
      const pz = ctrl?.z ?? focusZ;
      desiredPos.set(px - dir * 8.2 * zoomScale, 5.2 + heightBoost, pz * 0.75);
      desiredLook.set(px + dir * 4.5, 1.8, pz * 0.5);
    } else {
      // Iconic NBA 2K Vertical North-South Camera (2K / Turbo / Drive)
      const dir = camCfg.autoFlip ? this.getAttackDir(this.possession) : this.getAttackDir(this.config.userSide);
      const baseDist = camCfg.angle === 'Drive' ? 10.5 : camCfg.angle === 'Turbo' ? 12.2 : 14.2;
      desiredPos.set(focusX - dir * baseDist * zoomScale, 9.6 + heightBoost, focusZ * 0.55);
      desiredLook.set(focusX + dir * 4.2, 1.65, focusZ * 0.45);
    }

    if (this.cameraShake > 0) {
      desiredPos.x += (Math.random() - 0.5) * this.cameraShake * 0.65;
      desiredPos.y += (Math.random() - 0.5) * this.cameraShake * 0.65;
    }

    this.curCamPos.lerp(desiredPos, Math.min(1, dt * 5.2));
    this.curCamLook.lerp(desiredLook, Math.min(1, dt * 6.5));
    this.camera.position.copy(this.curCamPos);
    this.camera.lookAt(this.curCamLook);
  }

  // ==================== 10-SECOND 3D INSTANT REPLAY ====================

  private recordReplayFrame(dt: number): void {
    this.replaySampleAccum += dt;
    if (this.replaySampleAccum < 1 / 30) return;
    this.replaySampleAccum = 0;

    this.replayBuffer.push({
      t: this.elapsed,
      ballX: this.ball.x,
      ballY: this.ball.y,
      ballZ: this.ball.z,
      players: this.players.map((p) => ({
        id: p.data.id,
        x: p.x,
        y: p.y,
        z: p.z,
        rotY: p.rotY,
        pose: p.pose,
      })),
    });
    if (this.replayBuffer.length > 300) {
      this.replayBuffer.shift();
    }
  }

  private updateReplayView(dt: number): void {
    if (this.replayBuffer.length === 0) return;
    if (this.replayPlaying) {
      this.replayIndex += dt * 30 * this.replaySpeed;
      if (this.replayIndex >= this.replayBuffer.length - 1) {
        this.replayIndex = 0;
      }
    }
    const frame = this.replayBuffer[Math.floor(this.replayIndex)] ?? this.replayBuffer[0];
    this.ball.mesh.position.set(frame.ballX, frame.ballY, frame.ballZ);
    for (const pf of frame.players) {
      const sp = this.players.find((p) => p.data.id === pf.id);
      if (sp) {
        sp.rig.root.position.set(pf.x, 0, pf.z);
        sp.rig.bodyGroup.rotation.y = pf.rotY;
        animatePlayerRig(sp.rig, pf.pose as PlayerPose, frame.t, 0.5, pf.y);
      }
    }

    // Free-orbit 3D replay camera centered on the ball
    this.camera.position.set(
      frame.ballX + Math.cos(this.replayOrbitAngle) * this.replayOrbitDist,
      this.replayOrbitHeight,
      frame.ballZ + Math.sin(this.replayOrbitAngle) * this.replayOrbitDist
    );
    this.camera.lookAt(frame.ballX, 1.75, frame.ballZ);
  }

  // ==================== FINALIZE & HUD SNAPSHOT ====================

  private finalizeMatch(): void {
    if (this.finished) return;
    this.finished = true;
    const userScore = this.config.userSide === 'home' ? this.homeScore : this.awayScore;
    const oppScore = this.config.userSide === 'home' ? this.awayScore : this.homeScore;
    const userWon = userScore >= oppScore;

    const box = this.players.map((p) => ({ ...p.stats }));
    const pog = [...box].sort((a, b) => b.pts + b.reb * 1.2 + b.ast * 1.5 - (a.pts + a.reb * 1.2 + a.ast * 1.5))[0] ?? box[0];
    const diffMult =
      this.settings.game.difficulty === 'Hall of Fame'
        ? 1.75
        : this.settings.game.difficulty === 'Superstar'
          ? 1.45
          : this.settings.game.difficulty === 'All-Star'
            ? 1.2
            : 1.0;

    const grade = GRADE_STEPS[this.teammateGradeIdx];
    const vcEarned = Math.round(((userWon ? 450 : 220) + userScore * 8 + this.teammateGradeIdx * 28) * diffMult);
    const spEarned = Math.round(((userWon ? 350 : 180) + userScore * 6 + this.teammateGradeIdx * 25) * diffMult);
    const mtEarned = this.config.mode === 'myteam' ? Math.round((userWon ? 750 : 300) + userScore * 12) : 150;
    const repEarned = this.config.mode === 'park' ? (userWon ? 320 : 120) : 0;

    this.emitHud();
    this.onMatchComplete({
      config: this.config,
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      userWon,
      quarterScoresHome: [...this.quarterScoresHome],
      quarterScoresAway: [...this.quarterScoresAway],
      boxScore: box,
      playerOfGame: pog,
      teammateGrade: grade,
      vcEarned,
      spEarned,
      mtEarned,
      repEarned,
      userShotLog: [...this.userShotLog],
      newAchievements: [],
      shootoutScore: this.config.mode === 'shootout3pt' ? this.shootoutScore : undefined,
      dunkContestScore: this.config.mode === 'dunkcontest' ? this.dunkTotalScore : undefined,
    });
  }

  private emitHud(): void {
    const ctrl = this.getControlledPlayer();
    const lockPlayer = this.config.playerLockId
      ? this.players.find((p) => p.data.id === this.config.playerLockId) ?? ctrl
      : ctrl;

    // Project teammate screen coordinates for Icon Passing overlay
    const iconTargets: MatchHudSnapshot['iconTargets'] = [];
    if (this.iconPassActive && ctrl) {
      const mates = this.players.filter((p) => p.side === ctrl.side);
      const projVec = new THREE.Vector3();
      const w = this.container.clientWidth || 1280;
      const h = this.container.clientHeight || 720;
      mates.forEach((m, idx) => {
        projVec.set(m.x, 2.35, m.z).project(this.camera);
        iconTargets.push({
          key: String(idx + 1),
          name: m.data.name,
          pos: m.data.pos,
          screenX: (projVec.x * 0.5 + 0.5) * w,
          screenY: (-projVec.y * 0.5 + 0.5) * h,
        });
      });
    }

    const activeDrill = TRAINING_DRILLS.find((d) => d.id === this.config.trainingDrillId);

    this.onHudUpdate({
      homeCode: this.homeTeam.code,
      awayCode: this.awayTeam.code,
      homeColor: this.homeTeam.primaryColor,
      awayColor: this.awayTeam.primaryColor,
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      homeTimeouts: this.homeTimeouts,
      awayTimeouts: this.awayTimeouts,
      homeFoulsQ: this.homeFoulsQ,
      awayFoulsQ: this.awayFoulsQ,
      quarter: this.quarter,
      quarterScoresHome: [...this.quarterScoresHome],
      quarterScoresAway: [...this.quarterScoresAway],
      gameClockSec: this.gameClockSec,
      shotClockSec: this.shotClockSec,
      possession: this.possession,
      controlledPlayerName: ctrl?.data.name ?? 'Player',
      controlledPlayerPos: ctrl?.data.pos ?? 'SF',
      controlledPlayerJersey: ctrl?.data.jersey ?? 6,
      controlledPlayerStamina: ctrl?.stamina ?? 100,
      controlledPlayerStreak: ctrl?.streak ?? 0,
      controlledPlayerSkills: ctrl?.data.signatureSkills ?? [],
      shotMeterActive: this.isChargingShot && this.settings.controller.shotMeterDisplay !== 'Off (No-Meter Green Boost)',
      shotMeterFill: Math.min(1.15, this.shotChargeTime / this.shotReleaseDuration),
      shotMeterSweetSpot: 0.82,
      freeThrowActive: this.freeThrowActive,
      freeThrowShooterName: this.players.find((p) => p.data.id === this.freeThrowShooterId)?.data.name ?? '',
      freeThrowRemaining: this.freeThrowRemaining,
      freeThrowPos: this.freeThrowPos,
      iconPassActive: this.iconPassActive,
      iconTargets,
      shotFeedback: this.shotFeedback,
      sigPopup: this.sigPopup,
      commentary: this.commentary,
      paBanner: this.paBanner,
      teammateGrade: GRADE_STEPS[this.teammateGradeIdx],
      teammateGradeFill: this.teammateGradeFill,
      gradeEvents: this.gradeEvents,
      playerLockStats: lockPlayer ? { ...lockPlayer.stats } : null,
      otfc: { ...this.otfc },
      fps: this.fps,
      paused: this.paused,
      replayMode: this.replayMode,
      replayIndex: Math.floor(this.replayIndex),
      replayLength: this.replayBuffer.length,
      replayPlaying: this.replayPlaying,
      replaySpeed: this.replaySpeed,
      shootoutState:
        this.config.mode === 'shootout3pt'
          ? {
              rackIndex: this.shootoutRack,
              ballInRack: this.shootoutBallInRack,
              score: this.shootoutScore,
              timeLeft: this.shootoutTime,
              isMoneyBall: this.shootoutBallInRack === 4,
              ballsRemaining: Math.max(0, 25 - (this.shootoutRack * 5 + this.shootoutBallInRack)),
            }
          : undefined,
      dunkContestState:
        this.config.mode === 'dunkcontest'
          ? {
              round: this.dunkRound,
              attempt: this.dunkAttempt,
              selectedDunk: DUNK_CONTEST_MOVES.find((m) => m.id === this.dunkMoveId)?.name ?? '',
              totalScore: this.dunkTotalScore,
              lastJudgeScores: this.dunkJudgeScores,
              phase: this.dunkPhase,
            }
          : undefined,
      trainingState:
        this.config.mode === 'training' && activeDrill
          ? {
              drillTitle: activeDrill.title,
              instruction: activeDrill.instruction,
              completedReps: this.trainingReps,
              targetReps: activeDrill.targetReps,
            }
          : undefined,
      finished: this.finished,
      boxScore: this.players.map((p) => ({ ...p.stats })),
      userShotLog: [...this.userShotLog],
    });
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost);
    this.resizeObserver.disconnect();
    this.players.forEach((p) => p.rig.dispose());
    this.arena.dispose();
    this.envTex?.dispose();
    this.ball.mesh.geometry.dispose();
    (this.ball.mesh.material as THREE.Material).dispose();
    this.renderer.dispose();
  }
}
