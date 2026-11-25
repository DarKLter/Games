import * as THREE from 'three';
import {
  CYCLONE_EYE_SPECS,
  ComputedMobaStats,
  DynamicLaneAssignment,
  FLYING_CLOUD_BLUE_SPOT,
  LITHO_LOWER_SPOT,
  LITHO_UPPER_SPOT,
  LOWER_RIVER_PIT,
  MLBB_TIMERS,
  MOBA_ELEMENT_PALETTES,
  MOBA_ELIM_EFFECTS,
  MOBA_HEROES,
  MOBA_MODES,
  MOBA_RECALL_EFFECTS,
  MOBA_SPELLS,
  MobaCcKind,
  MobaElementStatusKind,
  MobaElementTheme,
  MobaEmoteAiContext,
  MobaEmoteDef,
  MobaHeroCombatKit,
  MobaHeroDef,
  MobaMapVariantDef,
  MobaModeId,
  MobaSkillEffectSpec,
  MobaSkillTargeting,
  MobaSpellDef,
  MobaVfxKind,
  ROLE_BUILD_PRESETS,
  RiverPitSide,
  UPPER_RIVER_PIT,
  applyCraftedPurchase,
  canRespawnNextTurtle,
  computeEvolvedLordNeutralDr,
  computeEvolvedLordSummonedDr,
  computeMobaEquippedStats,
  computeOrangeBuffPenetrationPct,
  computeRetributionDamage,
  computeSellRefund,
  computeTurtleRewards,
  createDynamicLaneAssignment,
  evaluateBattlefieldClock,
  formatMatchClock,
  getHeroBaseElementTheme,
  getHeroCombatKit,
  getMobaBlessingById,
  getMobaEmblemBonus,
  getMobaEmoteById,
  getMobaEquipmentById,
  getNextQuickBuyRecommendation,
  getSkinVariantById,
  normalizeEquippedEmotes,
  pickContextualAiEmote,
  resolveElementStatusEffect,
  resolveMatchMapVariant,
  resolveSkillAimPoint,
  selectLordWeakestLane,
  shouldTurtleDissipate,
  stepHealthTrail,
  triggerHealthTrailDamage
} from '../../core/arenaRoster';
import { ArcadeAudio } from '../../core/audio';
import {
  MobaActiveBuffHud,
  MobaEquippedEmoteHud,
  MobaHudEnemyTarget,
  MobaHudSnapshot,
  MobaMinimapCampHud,
  MobaMinimapPingHud,
  addCoins,
  addXp,
  triggerGameOver,
  updateHealthDisplay,
  updateInGameHud,
  updateMobaHud
} from '../../core/runtimeBridge';
import { persistMobaStats, playerState, recordMobaDailyEvent, recordMobaMatchResult } from '../../core/storage';
import { Difficulty, DifficultyScaler, difficultyScalers, GameInstance } from '../../core/types';
import { getViewportSize, mapClientToStage } from '../../core/viewport';
import {
  ElementalFxAnimKind,
  animateElementalStatusMesh,
  animateElementalVfx,
  createElementalImpactVfx,
  createElementalProjectileMesh,
  createElementalStatusMesh
} from './mobaElementalVfx';
import { StudioThreeContext, addInkOutline, buildMobaHeroMesh, buildSoldierMesh, createToonMaterial } from '../../core/threeShared';


export const MAP_SIZE = 264;
export const MAP_HALF = MAP_SIZE / 2; // 132
export const PLAY_LIMIT = 124;
export const BLUE_BASE_X = -108;
export const BLUE_BASE_Z = 108;
export const RED_BASE_X = 108;
export const RED_BASE_Z = -108;

export const AMBUSH_BUSHES: [number, number, number][] = [
  [-62, 0, 9.5],
  [0, 62, 9.5],
  [62, 0, 9.5],
  [0, -62, 9.5],
  [-92, -16, 8.5],
  [16, 92, 8.5],
  [-16, -92, 8.5],
  [92, 16, 8.5]
];

export const BEACON_SPOTS: [number, number][] = [
  [-54, -54],
  [54, 54],
  [-66, 26],
  [26, -66]
];

export interface MobaActor {
  id: number;
  mesh: THREE.Group;
  x: number;
  z: number;
  team: 'blue' | 'red';
  kind: 'minion' | 'hero' | 'lord' | 'summon_clone' | 'summon_turret';
  hp: number;
  maxHp: number;
  atk: number;
  cd: number;
  lane: number;
  alive: boolean;
  stunTimer: number;
  rootTimer: number;
  silenceTimer: number;
  fearTimer: number;
  tauntTimer: number;
  slowTimer: number;
  airborneTimer: number;
  airborneDur: number;
  airbornePeak: number;
  lifeTimer: number; // >0 for timed summons
  respawnTimer: number; // >0 for respawning heroes
  spawnX: number;
  spawnZ: number;
  label?: string;
  icon?: string;
  statusKind?: MobaElementStatusKind;
  statusTimer?: number;
  statusDps?: number;
  statusTickAcc?: number;
  statusFxGroup?: THREE.Group;
  trailHp?: number;
  trailHold?: number;
  lastHp?: number;
  activeEmoteId?: string;
  activeEmoteTimer?: number;
  activeEmoteMax?: number;
  emoteAiCd?: number;
}

export type JungleCampKind =
  | 'blue_buff'
  | 'red_buff'
  | 'horned_lizard'
  | 'lava_golem'
  | 'fire_beetle'
  | 'little_crammer'
  | 'litho'
  | 'crab'
  | 'turtle'
  | 'lord';

export interface JungleCamp {
  id: string;
  campKind: JungleCampKind;
  label: string;
  icon: string;
  mesh: THREE.Group;
  ringMesh: THREE.Mesh;
  leashMesh?: THREE.Mesh;
  leashRadius: number;
  patience: number; // 0..100
  aggroed: boolean;
  outOfCombatSec: number;
  x: number;
  z: number;
  homeX: number;
  homeZ: number;
  hp: number;
  maxHp: number;
  atk: number;
  cd: number;
  alive: boolean;
  respawnTimer: number;
  respawnDelay: number;
  goldReward: number;
  scoreReward: number;
  colorHex: string;
  colorNum: number;
  stunTimer: number;
  upgraded?: boolean;
  isSplitChild?: boolean;
  lordStage?: 0 | 1 | 2 | 3;
  trailHp?: number;
  trailHold?: number;
  lastHp?: number;
}

export interface TurretObj {
  mesh: THREE.Group;
  x: number;
  z: number;
  team: 'blue' | 'red';
  lane: 0 | 1 | 2;
  tier: 0 | 1 | 2 | 3; // 0 = Nexus, 1 = Outer, 2 = Inner, 3 = Base
  hp: number;
  maxHp: number;
  cd: number;
  isNexus: boolean;
  alive: boolean;
  shieldMesh?: THREE.Mesh;
  platingGoldPaid: number;
  trailHp?: number;
  trailHold?: number;
  lastHp?: number;
}

export interface CycloneEyeObj {
  id: string;
  x: number;
  z: number;
  cd: number;
  mesh: THREE.Group;
}

export interface RiverWardObj {
  mesh: THREE.Group;
  x: number;
  z: number;
  homeX: number;
  homeZ: number;
  angle: number;
  life: number;
  kind: 'walkie' | 'stone_roamer' | 'wisp';
}

export interface PurpleShortcutWall {
  mesh: THREE.Mesh;
  campId: string;
  open: boolean;
}

export interface EnergyBolt {
  mesh: THREE.Object3D;
  x: number;
  z: number;
  vx: number;
  vz: number;
  team: 'blue' | 'red';
  dmg: number;
  life: number;
  slowSec?: number;
  isFlameshot?: boolean;
  startX?: number;
  startZ?: number;
  elementTheme?: MobaElementTheme;
  isSharedMesh?: boolean;
}

export interface FxVisualObj {
  mesh: THREE.Object3D;
  life: number;
  maxLife: number;
  mode: 'ring' | 'pillar' | 'beam' | 'dome' | 'ghost' | 'slash' | 'elemental' | 'emote_burst';
  elemAnim?: ElementalFxAnimKind;
}

export interface ActiveSkillAimState {
  actionKey: 'skill1' | 'skill2' | 'skill3' | 'skill4' | 'spell';
  slotIndex: 0 | 1 | 2 | 3 | null;
  mode: 'drag' | 'cursor';
  targeting: MobaSkillTargeting;
  range: number;
  radius: number;
  elementTheme: MobaElementTheme;
  aimYaw: number;
  aimX: number;
  aimZ: number;
  lockedTargetId: number | null;
  cancelled: boolean;
  hasManualAim: boolean;
}

export interface SkillAimOverride {
  aimX: number;
  aimZ: number;
  aimYaw: number;
  lockedTargetId: number | null;
  dist: number;
}

export interface FloatingDamageNum {
  wx: number;
  wy: number;
  wz: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  isCrit?: boolean;
}

export interface ActivePlayerMotion {
  kind: 'dash' | 'leap' | 'snap_back';
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  elapsed: number;
  duration: number;
  peakY: number;
  ghostAcc: number;
}

export interface ActiveHealingSpring {
  mesh: THREE.Group;
  x: number;
  z: number;
  life: number;
  tickAcc: number;
}

export interface ActiveUltSetpiece {
  kind: 'tigreal_implosion' | 'lancelot_thorned_rose' | 'johnson_car' | 'yve_chessboard' | 'kagura_overturn';
  group: THREE.Group;
  cx: number;
  cz: number;
  life: number;
  maxLife: number;
  tickAcc: number;
  detonated: boolean;
  baseDmg: number;
  tetherTargets?: MobaActor[];
}

export const _mobaDesired = new THREE.Vector3();
export const _mobaLook = new THREE.Vector3();
export const _mobaRay = new THREE.Raycaster();
export const _mobaNdc = new THREE.Vector2();
export const _mobaProj = new THREE.Vector3();
export const _camFwd = new THREE.Vector3();
export const _camRight = new THREE.Vector3();
export const _worldUp = new THREE.Vector3(0, 1, 0);

export function disposeObjectTree(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const m = obj as THREE.Mesh;
    if (m.geometry && !m.geometry.userData?.noDispose) m.geometry.dispose();
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    for (const mat of mats) {
      if (mat && !mat.userData?.noDispose) mat.dispose();
    }
  });
}

export function applyMobaSpeedSoftCap(rawMlbbSpeed: number): number {
  if (rawMlbbSpeed <= 415) return rawMlbbSpeed;
  if (rawMlbbSpeed <= 490) return 415 + (rawMlbbSpeed - 415) * 0.8;
  return 475 + (rawMlbbSpeed - 490) * 0.5;
}


export abstract class LegendsArena3DWorld {

  protected abstract pushMobaHudSnapshot(): void;
  protected abstract tick: () => void;
  protected abstract castHeroSkill(slotIndex: 0 | 1 | 2 | 3, aimOverride?: SkillAimOverride): void;
  public abstract castBattleSpell(aimOverride?: SkillAimOverride): void;
  protected abstract castHpRegen(): void;
  protected abstract startRecall(): void;
  protected abstract castActiveItem(): void;
  public abstract triggerEmote(slotIndex: number): boolean;
  protected abstract spawnVfx(kind: MobaVfxKind | 'dome', x: number, z: number, size: number, color: number): void;
  protected abstract spawnElementalVfx(theme: MobaElementTheme, kind: MobaVfxKind | 'dome', x: number, z: number, size: number, yaw?: number): void;
  protected abstract findNearestEnemyTarget(): { x: number; z: number; angle: number; dist: number; actor?: MobaActor } | null;
  protected abstract triggerActorAiEmote(a: MobaActor, context: MobaEmoteAiContext): void;
  protected abstract endMatch(victory: boolean): void;

  container: HTMLElement;
  diff: Difficulty;
  level: number;
  gameIdx: number;
  heroDef: MobaHeroDef;
  combatKit: MobaHeroCombatKit;
  spellDef: MobaSpellDef;
  mobaMode: MobaModeId;
  scaler: DifficultyScaler;
  score = 0;
  lives = 175;
  maxLives = 175;
  playerTrailHp = 175;
  playerLastHp = 175;
  playerTrailHold = 0;
  isPaused = false;
  gameOver = false;
  isRunning = false;

  three!: StudioThreeContext;
  playerMesh!: THREE.Group;
  shieldDomeMesh!: THREE.Mesh;
  ccImmuneAuraMesh!: THREE.Mesh;
  blueBuffAuraMesh!: THREE.Group;
  redBuffAuraMesh!: THREE.Group;
  frozenCrystalMesh!: THREE.Mesh;
  recallCircleGroup!: THREE.Group;
  telegraphGroup!: THREE.Group;
  telegraphRangeGroup!: THREE.Group;
  aimTargetHighlightMesh!: THREE.Mesh;
  lockedReticleMesh!: THREE.Mesh;
  heroBaseElement: MobaElementTheme = 'steel';
  heroBodyColor = 0x2563eb;
  heroCloakColor = 0x1e3a8a;
  heroBladeColor = 0x38bdf8;
  px = BLUE_BASE_X + 6;
  py = 0;
  pz = BLUE_BASE_Z - 6;
  pYaw = -Math.PI / 4;
  moveX = 0;
  moveZ = 0;
  tapTarget: { x: number; z: number } | null = null;
  nextActorId = 1;
  lockedEnemyId: number | null = null;

  // Animation, Sprint, Stealth, Camera Shake, Physics & Talents
  idleTimer = 0;
  walkPhase = 0;
  castAnimTimer = 0;
  cameraShake = 0;
  effectiveMlbbSpeed = 260;
  isSprinting = false;
  bushRevealTimer = 0;
  bushStealthApplied = false;
  ccImmuneTimer = 0;
  slowImmuneTimer = 0;
  sprintBoostTimer = 0;
  vengeanceTimer = 0;
  untargetableTimer = 0;
  telegraphSlot: number | null = null;
  telegraphAutoTimer = 0;
  activeSkillAim: ActiveSkillAimState | null = null;
  telegraphCancelled = false;
  activeMotion: ActivePlayerMotion | null = null;
  healingSprings: ActiveHealingSpring[] = [];
  activeUltSetpieces: ActiveUltSetpiece[] = [];
  floatingDmgNums: FloatingDamageNum[] = [];
  keystoneT3 = '';
  braveSmiteCd = 0;
  weaknessFinderCd = 0;
  lethalIgnitionHits = 0;
  lethalIgnitionWindow = 0;
  lethalIgnitionCd = 0;
  customBuildIds: string[] = [];
  activePresetIdx = 0;
  prioritizedItemId: string | null = null;
  activeMapVariant: MobaMapVariantDef;
  laneAssign: DynamicLaneAssignment;
  activeBossPit: RiverPitSide;
  bossPhase: 'turtle' | 'lord' = 'turtle';
  currentLordStage: 0 | 1 | 2 | 3 = 0;
  turtleKills = 0;
  turtleBlessingTimer = 0;
  turtleHealAcc = 0;
  crabAuraTimer = 0;
  crabAuraAcc = 0;
  walkieGrassTimer = 0;
  homeguardTimer = 0;
  junglerStacks = 0;
  roamGold = 0;
  roamGoldAcc = 0;
  flyingCloudCd = 0;
  fountainLaserCd = 0;
  lordChargeAvailable = false;
  lordAuraTickAcc = 0;
  superMinionLanes = new Set<number>();
  announcedMilestones = new Set<string>();
  laneMarkerMeshes: THREE.Object3D[] = [];
  purpleShortcutWalls: PurpleShortcutWall[] = [];
  cycloneEyes: CycloneEyeObj[] = [];
  riverWards: RiverWardObj[] = [];
  flyingCloudMesh?: THREE.Group;
  pitHologramGroup?: THREE.Group;
  pitHologramRing?: THREE.Mesh;
  minimapPings: MobaMinimapPingHud[] = [];
  nextPingId = 1;
  tacticalPingText = '';
  tacticalPingTimer = 0;

  gold = 300;
  goldTrickleAcc = 0;
  heroLevel = 1;
  heroXp = 0;
  heroXpNext = 100;
  kills = 0;
  deaths = 0;
  jungleClears = 0;
  atkDmg = 34;
  atkRange = 5.5;
  moveSpd = 12.2;
  isRanged = false;

  // 6-Slot In-Battle Equipment & Boot Blessing
  equippedItemIds: string[] = [];
  blessingId: string | null = null;
  emblemBonus: { hpBonus: number; atkBonus: number; spdBonus: number; cdReduction: number };
  computedStats!: ComputedMobaStats;

  // Player Timers & Buffs
  shieldTimer = 0;
  inspireTimer = 0;
  hasteTimer = 0;
  stealthTimer = 0;
  giantTimer = 0;
  blueBuffTimer = 0;
  redBuffTimer = 0;
  regenHoTTimer = 0;
  recallTimer = 0;
  windChantTimer = 0;
  frozenTimer = 0;
  cdItemActive = 0;
  maxCdItemActive = 20.0;
  immortalityCd = 0;
  lifelineCd = 0;
  divineJusticePrimed = false;
  outOfCombatSec = 5.0;
  burningSoulTick = 0;
  regenTickAcc = 0;
  inBush = false;
  basicCd = 0;
  cdSkill1 = 0;
  cdSkill2 = 0;
  cdSkill3 = 0;
  cdSkill4 = 0;
  cdSpell = 0;
  cdRegen = 0;
  cdEmote = 0;
  maxCdEmote = 3.0;
  playerEmoteId: string | null = null;
  playerEmoteTimer = 0;
  playerEmoteMax = 2.6;
  maxCdSkill1 = 3.0;
  maxCdSkill2 = 4.8;
  maxCdSkill3 = 8.5;
  maxCdSkill4 = 7.0;
  maxCdSpell = 10.0;
  maxCdRegen = 14.0;

  // Passive Tracking
  hitCounter = 0;
  passiveStacks = 0;
  reviveCheatCd = 0;
  beaconIdx = 0;

  matchElapsed = 0;
  waveTimer: number = MLBB_TIMERS.FIRST_WAVE_SEC;
  hudSyncTimer = 0;
  killfeedText = '';
  killfeedTimer = 0;

  fxObjs: FxVisualObj[] = [];
  turrets: TurretObj[] = [];
  actors: MobaActor[] = [];
  jungleCamps: JungleCamp[] = [];
  bolts: EnergyBolt[] = [];
  boltGeo!: THREE.SphereGeometry;
  blueBoltMat!: THREE.MeshBasicMaterial;
  heroBoltMat!: THREE.MeshBasicMaterial;
  redBoltMat!: THREE.MeshBasicMaterial;
  lastTime = 0;

  emblemCdMult = 1.0;

  constructor(
    container: HTMLElement,
    diff: Difficulty,
    lvl: number,
    gameIdx = 25,
    heroId = playerState.selectedMobaHero
  ) {
    this.container = container;
    this.diff = diff;
    this.level = lvl;
    this.gameIdx = gameIdx;
    this.heroDef = MOBA_HEROES[heroId] || MOBA_HEROES[0];
    this.heroBaseElement = getHeroBaseElementTheme(this.heroDef);
    this.combatKit = getHeroCombatKit(this.heroDef);
    this.spellDef = MOBA_SPELLS.find((s) => s.id === playerState.selectedMobaSpell) ?? MOBA_SPELLS[0];
    this.mobaMode = playerState.selectedMobaMode;

    // Resolve 2026 Annual Map Variant & Dynamic EXP / Gold Lane Assignment
    this.activeMapVariant = resolveMatchMapVariant(playerState.mobaSettings.mapVariantOverride ?? 'random');
    const firstPit: RiverPitSide = Math.random() < 0.5 ? 'upper' : 'lower';
    this.laneAssign = createDynamicLaneAssignment(firstPit);
    this.activeBossPit = firstPit;

    const skin = getSkinVariantById(playerState.mobaEquippedSkins[this.heroDef.id]);
    this.heroBodyColor = skin.bodyShift ?? this.heroDef.bodyColor;
    this.heroCloakColor = skin.cloakShift ?? this.heroDef.cloakColor;
    this.heroBladeColor = skin.bladeShift ?? this.heroDef.bladeColor;

    const embId = playerState.selectedMobaEmblem;
    const embLv = playerState.mobaEmblemLevels[embId] ?? 1;
    const embTalents = playerState.mobaEmblemTalents[embId];
    this.keystoneT3 = embTalents?.t3 ?? '';
    this.emblemBonus = getMobaEmblemBonus(embId, embLv, embTalents);
    this.emblemCdMult = 1 - this.emblemBonus.cdReduction;

    const savedCustom = playerState.mobaCustomBuilds[this.heroDef.id];
    const presets = ROLE_BUILD_PRESETS[this.heroDef.role] ?? ROLE_BUILD_PRESETS.Fighter;
    this.customBuildIds =
      Array.isArray(savedCustom) && savedCustom.length > 0 ? [...savedCustom] : [...presets[0].items];

    this.isRanged = this.heroDef.isRanged;
    this.scaler = difficultyScalers[diff] || difficultyScalers.easy;
    this.recomputeStats(true);
    playerState.sessionCoins = 0;
    playerState.sessionExp = 0;
  }

  protected recomputeStats(resetFullHp = false): void {
    const oldMax = Math.max(1, this.maxLives);
    const hpRatio = resetFullHp ? 1 : Math.min(1, Math.max(0.05, this.lives / oldMax));
    this.computedStats = computeMobaEquippedStats(
      this.heroDef,
      this.emblemBonus,
      this.equippedItemIds,
      this.blessingId,
      this.blueBuffTimer > 0,
      this.redBuffTimer > 0,
      this.heroLevel
    );
    this.maxLives = this.computedStats.maxHp;
    this.lives = resetFullHp ? this.maxLives : Math.min(this.maxLives, Math.max(1, Math.round(this.maxLives * hpRatio)));
    if (resetFullHp) {
      this.playerTrailHp = this.lives;
      this.playerLastHp = this.lives;
      this.playerTrailHold = 0;
    }
    this.atkDmg = this.computedStats.atkDmg;
    this.atkRange = this.computedStats.atkRange;
    this.moveSpd = this.computedStats.moveSpeed;
    if (this.computedStats.activeSkill) {
      this.maxCdItemActive = this.computedStats.activeSkill.cdSec;
    }
    if (this.isRunning) {
      updateHealthDisplay(this.lives, this.maxLives);
      this.pushMobaHudSnapshot();
    }
  }

  protected grantHeroXp(amt: number): void {
    if (this.heroLevel >= 15 || amt <= 0) return;
    this.heroXp += amt;
    let leveled = false;
    while (this.heroLevel < 15 && this.heroXp >= this.heroXpNext) {
      this.heroXp -= this.heroXpNext;
      this.heroLevel += 1;
      this.heroXpNext = 90 + this.heroLevel * 35;
      leveled = true;
    }
    if (leveled) {
      this.recomputeStats(false);
      this.lives = Math.min(this.maxLives, this.lives + Math.round(this.maxLives * 0.12));
      updateHealthDisplay(this.lives, this.maxLives);
      ArcadeAudio.play('levelup');
      this.spawnVfx('ring', this.px, this.pz, 4.4, 0xfacc15);
      this.showKillfeed(`⬆️ LEVEL UP! ${this.heroDef.name} Lv.${this.heroLevel}`);
    }
  }

  protected showKillfeed(msg: string): void {
    this.killfeedText = msg;
    this.killfeedTimer = 3.0;
  }

  protected get cdMult(): number {
    const modeDef = MOBA_MODES.find((m) => m.id === this.mobaMode);
    const modeMult = modeDef?.cdMult ?? 1.0;
    return modeMult * Math.max(0.55, 1 - this.computedStats.cdrRatio);
  }

  protected getCameraOffsets(): { dx: number; y: number; dz: number } {
    const h = playerState.mobaSettings.cameraHeight;
    if (h === 'low') return { dx: -11, y: 21, dz: 17 };
    if (h === 'medium') return { dx: -13, y: 26, dz: 21 };
    return { dx: -15, y: 31, dz: 25 };
  }

  start(): void {
    this.three = new StudioThreeContext(this.container, {
      skyColor: 0x38bdf8,
      fogColor: 0x7dd3fc,
      fogNear: 92,
      fogFar: 255,
      keyColor: 0xfffbeb,
      keyIntensity: 2.15,
      hemiSky: 0xbae6fd,
      hemiGround: 0x166534,
      hemiIntensity: 1.05,
      fov: 46,
      far: 340
    });
    this.three.renderer.toneMapping = THREE.NoToneMapping;

    playerState.mobaMatchesPlayed++;
    persistMobaStats();
    recordMobaDailyEvent('match');

    this.buildArena();
    this.buildJungleCamps();
    this.spawnPlayer();
    this.spawnTeamHeroes();
    this.snapCamera();

    const trialTag = playerState.mobaTrialHeroId !== null ? ' (TRIAL)' : '';
    const modeName = MOBA_MODES.find((m) => m.id === this.mobaMode)?.title ?? this.mobaMode.toUpperCase();
    this.showKillfeed(
      `${modeName}${trialTag} · ${this.activeMapVariant.icon} ${this.activeMapVariant.name} · EXP ${this.laneAssign.expLaneSide.toUpperCase()} / GOLD ${this.laneAssign.goldLaneSide.toUpperCase()}`
    );

    this.three.renderer.domElement.addEventListener('pointerdown', this.onCanvasTap);
    this.three.prewarm();
    this.isRunning = true;
    this.lastTime = performance.now();
    updateHealthDisplay(this.lives, this.maxLives);
    updateInGameHud(this.score, this.level, this.gameIdx);
    this.pushMobaHudSnapshot();
    this.tick();
  }

  protected snapCamera(): void {
    const cam = this.getCameraOffsets();
    this.three.camera.position.set(this.px + cam.dx, cam.y, this.pz + cam.dz);
    this.three.camera.lookAt(this.px + 2.6, 0.9, this.pz - 2.6);
  }

  stop(): void {
    this.isRunning = false;
    playerState.mobaTrialHeroId = null;
    for (const sp of this.healingSprings) {
      disposeObjectTree(sp.mesh);
      this.three?.scene?.remove(sp.mesh);
    }
    this.healingSprings = [];
    for (const up of this.activeUltSetpieces) {
      disposeObjectTree(up.group);
      this.three?.scene?.remove(up.group);
    }
    this.activeUltSetpieces = [];
    for (const rw of this.riverWards) {
      disposeObjectTree(rw.mesh);
      this.three?.scene?.remove(rw.mesh);
    }
    this.riverWards = [];
    updateMobaHud(null);
    this.releaseInputs();
    this.three?.renderer?.domElement?.removeEventListener('pointerdown', this.onCanvasTap);
    this.three?.dispose();
  }

  releaseInputs(): void {
    this.moveX = 0;
    this.moveZ = 0;
    this.tapTarget = null;
    this.cancelSkillAim();
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
  }

  protected buildArena(): void {
    const tex = this.three.createCanvasTexture(
      1024,
      (ctx, s) => {
        // Lush jungle floor checkerboard
        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, 0, s, s);
        ctx.fillStyle = '#166534';
        for (let gx = 0; gx < s; gx += 64) {
          for (let gy = 0; gy < s; gy += 64) {
            if (((gx + gy) / 64) % 2 === 0) ctx.fillRect(gx, gy, 64, 64);
          }
        }

        // Jungle clearing glades
        ctx.fillStyle = '#14532d';
        for (const [cx, cy] of [
          [s * 0.25, s * 0.62],
          [s * 0.38, s * 0.75],
          [s * 0.75, s * 0.38],
          [s * 0.62, s * 0.25]
        ]) {
          ctx.beginPath();
          ctx.arc(cx, cy, 46, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3 Wide Paved Lanes (EXP Top-Left, Mid Diagonal, Gold Bottom-Right)
        const m = 86;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0b0f19';
        ctx.lineWidth = 74;
        ctx.beginPath();
        ctx.moveTo(m, s - m); ctx.lineTo(m, m); ctx.lineTo(s - m, m);
        ctx.moveTo(m, s - m); ctx.lineTo(s - m, m);
        ctx.moveTo(m, s - m); ctx.lineTo(s - m, s - m); ctx.lineTo(s - m, m);
        ctx.stroke();

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 60;
        ctx.beginPath();
        ctx.moveTo(m, s - m); ctx.lineTo(m, m); ctx.lineTo(s - m, m);
        ctx.moveTo(m, s - m); ctx.lineTo(s - m, m);
        ctx.moveTo(m, s - m); ctx.lineTo(s - m, s - m); ctx.lineTo(s - m, m);
        ctx.stroke();

        // Diagonal River dividing Top-Left to Bottom-Right
        ctx.strokeStyle = '#0b0f19';
        ctx.lineWidth = 52;
        ctx.beginPath();
        ctx.moveTo(32, 32); ctx.lineTo(s - 32, s - 32);
        ctx.stroke();
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 38;
        ctx.beginPath();
        ctx.moveTo(32, 32); ctx.lineTo(s - 32, s - 32);
        ctx.stroke();

        // Turtle & Lord Pits on the River
        for (const [px, py, fill] of [
          [s * 0.365, s * 0.365, '#4c1d95'],
          [s * 0.635, s * 0.635, '#065f46']
        ] as [number, number, string][]) {
          ctx.fillStyle = fill;
          ctx.beginPath();
          ctx.arc(px, py, 44, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 5;
          ctx.stroke();
        }

        // Dynamic EXP Lane (Purple Scroll) & Gold Lane (Yellow Coin) Floor Emblems
        const toTex = (wVal: number) => ((wVal + MAP_HALF) / MAP_SIZE) * s;
        const [exX, exZ] = this.laneAssign.expMarkerWorld;
        const [goX, goZ] = this.laneAssign.goldMarkerWorld;
        ctx.save();
        ctx.fillStyle = 'rgba(168, 85, 247, 0.32)';
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(toTex(exX), toTex(exZ), 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f3e8ff';
        ctx.font = '900 18px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('EXP', toTex(exX), toTex(exZ) + 6);

        ctx.fillStyle = 'rgba(250, 204, 21, 0.32)';
        ctx.strokeStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(toTex(goX), toTex(goZ), 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fef9c3';
        ctx.fillText('GOLD', toTex(goX), toTex(goZ) + 6);
        ctx.restore();
      },
      1,
      1
    );

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE),
      new THREE.MeshToonMaterial({ map: tex })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.three.scene.add(floor);

    const outerVoid = new THREE.Mesh(
      new THREE.PlaneGeometry(520, 520),
      createToonMaterial(0x0c4a6e)
    );
    outerVoid.rotation.x = -Math.PI / 2;
    outerVoid.position.y = -0.6;
    this.three.scene.add(outerVoid);

    // Blue & Red Base Healing Fountains
    const fountainRing = new THREE.Mesh(
      new THREE.RingGeometry(4.5, 9.6, 32),
      new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.58 })
    );
    fountainRing.rotation.x = -Math.PI / 2;
    fountainRing.position.set(BLUE_BASE_X, 0.1, BLUE_BASE_Z);
    this.three.scene.add(fountainRing);

    const redFountainRing = new THREE.Mesh(
      new THREE.RingGeometry(4.5, 9.6, 32),
      new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide, transparent: true, opacity: 0.52 })
    );
    redFountainRing.rotation.x = -Math.PI / 2;
    redFountainRing.position.set(RED_BASE_X, 0.1, RED_BASE_Z);
    this.three.scene.add(redFountainRing);

    // 3D Dynamic Lane Floor Rings (EXP Purple Scroll & Gold Yellow Coin, fade after 5:00)
    const expRing = new THREE.Mesh(
      new THREE.RingGeometry(3.2, 4.4, 24),
      new THREE.MeshBasicMaterial({ color: 0xa855f7, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
    );
    expRing.rotation.x = -Math.PI / 2;
    expRing.position.set(this.laneAssign.expMarkerWorld[0], 0.14, this.laneAssign.expMarkerWorld[1]);
    this.three.scene.add(expRing);

    const goldRing = new THREE.Mesh(
      new THREE.RingGeometry(3.2, 4.4, 24),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
    );
    goldRing.rotation.x = -Math.PI / 2;
    goldRing.position.set(this.laneAssign.goldMarkerWorld[0], 0.14, this.laneAssign.goldMarkerWorld[1]);
    this.three.scene.add(goldRing);
    this.laneMarkerMeshes.push(expRing, goldRing);

    // Map-wide Teleport Beacons
    for (const [bx, bz] of BEACON_SPOTS) {
      const ped = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1.8, 0.6, 8),
        createToonMaterial(0x0284c7, { emissive: 0x38bdf8, emissiveIntensity: 0.45 })
      );
      ped.position.set(bx, 0.3, bz);
      this.three.scene.add(ped);
    }

    // 20 Turrets: Nexus Cores + Outer(T1)/Inner(T2)/Base(T3) across Top(0), Mid(1), Bot(2)
    const towerSpecs: [number, number, 'blue' | 'red', boolean, 0 | 1 | 2, 0 | 1 | 2 | 3][] = [
      [BLUE_BASE_X - 4, BLUE_BASE_Z + 4, 'blue', true, 1, 0],
      [RED_BASE_X + 4, RED_BASE_Z - 4, 'red', true, 1, 0],
      // Blue Top Lane (0): Base T3 -> Inner T2 -> Outer T1
      [-108, 36, 'blue', false, 0, 3],
      [-108, -28, 'blue', false, 0, 2],
      [-90, -86, 'blue', false, 0, 1],
      // Blue Mid Lane (1): Outer T1 -> Inner T2 -> Base T3
      [-34, 34, 'blue', false, 1, 1],
      [-62, 62, 'blue', false, 1, 2],
      [-86, 86, 'blue', false, 1, 3],
      // Blue Bot Lane (2): Base T3 -> Inner T2 -> Outer T1
      [-36, 108, 'blue', false, 2, 3],
      [28, 108, 'blue', false, 2, 2],
      [86, 90, 'blue', false, 2, 1],
      // Red Top Lane (0): Inner T2, Base T3, Outer T1
      [-28, -108, 'red', false, 0, 2],
      [36, -108, 'red', false, 0, 3],
      [-86, -104, 'red', false, 0, 1],
      // Red Mid Lane (1): Outer T1, Inner T2, Base T3
      [34, -34, 'red', false, 1, 1],
      [62, -62, 'red', false, 1, 2],
      [86, -86, 'red', false, 1, 3],
      // Red Bot Lane (2): Base T3, Inner T2, Outer T1
      [108, -36, 'red', false, 2, 3],
      [108, 28, 'red', false, 2, 2],
      [104, 86, 'red', false, 2, 1]
    ];

    const isGoldenTurretVariant = this.activeMapVariant.id === 'golden_turret';

    for (const [x, z, team, isNexus, lane, tier] of towerSpecs) {
      const g = new THREE.Group();
      const baseMat = createToonMaterial(team === 'blue' ? 0x2563eb : 0xdc2626);
      const gemMat = createToonMaterial(team === 'blue' ? 0x38bdf8 : 0xff6b6b, {
        emissive: team === 'blue' ? 0x38bdf8 : 0xff4757,
        emissiveIntensity: 0.78
      });
      const r = isNexus ? 3.2 : 1.7;
      const h = isNexus ? 6.8 : 5.0;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.72, r, h, 8), baseMat);
      pillar.position.y = h / 2;
      pillar.castShadow = true;
      addInkOutline(pillar, 1.07);
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(isNexus ? 1.55 : 0.9, 0), gemMat);
      gem.position.y = h + (isNexus ? 1.5 : 1.0);
      addInkOutline(gem, 1.09);
      g.add(pillar, gem);

      // Golden Turret Annual Map Variant: golden crown ring on T2 & T3 + +25% HP
      if (isGoldenTurretVariant && (tier === 2 || tier === 3)) {
        const goldTrim = new THREE.Mesh(
          new THREE.TorusGeometry(r * 0.98, 0.24, 8, 20),
          createToonMaterial(0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.55 })
        );
        goldTrim.rotation.x = Math.PI / 2;
        goldTrim.position.y = h * 0.85;
        g.add(goldTrim);
      }

      // Outer Turret (T1) Energy Shield Dome (active 0:00 -> 5:00)
      let shieldMesh: THREE.Mesh | undefined;
      if (tier === 1) {
        shieldMesh = new THREE.Mesh(
          new THREE.SphereGeometry(2.75, 16, 12),
          new THREE.MeshBasicMaterial({
            color: team === 'blue' ? 0x38bdf8 : 0xfbbf24,
            transparent: true,
            opacity: 0.26,
            wireframe: true
          })
        );
        shieldMesh.position.y = 2.8;
        g.add(shieldMesh);
      }

      g.position.set(x, 0, z);
      this.three.scene.add(g);
      const baseHp = isNexus ? 960 : tier === 3 ? 420 : tier === 2 ? 380 : 340;
      const hp = isGoldenTurretVariant && (tier === 2 || tier === 3) ? Math.round(baseHp * 1.25) : baseHp;
      this.turrets.push({
        mesh: g,
        x,
        z,
        team,
        lane,
        tier,
        hp,
        maxHp: hp,
        cd: 0,
        isNexus,
        alive: true,
        shieldMesh,
        platingGoldPaid: 0
      });
    }

    // Purple Buff Shortcut Walls (open while Purple Buff is dead)
    const wallSpecs: [number, number, string][] = [
      [-76, 20, 'purple_blue'],
      [76, -20, 'purple_red']
    ];
    for (const [wx, wz, campId] of wallSpecs) {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(5.8, 3.6, 1.4),
        createToonMaterial(0x581c87, { emissive: 0x9333ea, emissiveIntensity: 0.22, transparent: true, opacity: 0.92 })
      );
      wall.position.set(wx, 1.8, wz);
      wall.rotation.y = Math.PI / 4;
      addInkOutline(wall, 1.05);
      this.three.scene.add(wall);
      this.purpleShortcutWalls.push({ mesh: wall, campId, open: false });
    }

    // 4 Cyclone Eyes (Directional Wind Dash Gates, 45s CD)
    for (const spec of CYCLONE_EYE_SPECS) {
      const cg = new THREE.Group();
      const outer = new THREE.Mesh(
        new THREE.TorusGeometry(2.1, 0.22, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
      );
      outer.rotation.x = Math.PI / 2;
      outer.position.y = 0.25;
      const inner = new THREE.Mesh(
        new THREE.TorusGeometry(1.15, 0.16, 8, 18),
        new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.9 })
      );
      inner.rotation.x = Math.PI / 2;
      inner.position.y = 0.7;
      const core = new THREE.Mesh(
        new THREE.ConeGeometry(0.6, 2.2, 8),
        new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.5 })
      );
      core.position.y = 1.1;
      cg.add(outer, inner, core);
      cg.position.set(spec.x, 0, spec.z);
      this.three.scene.add(cg);
      this.cycloneEyes.push({ id: spec.id, x: spec.x, z: spec.z, cd: 0, mesh: cg });
    }

    // 3D River Pit Hologram Countdown Ring (tracks upcoming Turtle / Lord pit)
    const pitPos = this.activeBossPit === 'upper' ? UPPER_RIVER_PIT : LOWER_RIVER_PIT;
    this.pitHologramGroup = new THREE.Group();
    const holoBase = new THREE.Mesh(
      new THREE.RingGeometry(4.8, 5.6, 36),
      new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
    );
    holoBase.rotation.x = -Math.PI / 2;
    holoBase.position.y = 0.18;
    const holoInner = new THREE.Mesh(
      new THREE.RingGeometry(2.4, 3.1, 24),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
    );
    holoInner.rotation.x = -Math.PI / 2;
    holoInner.position.y = 0.22;
    this.pitHologramRing = holoInner;
    this.pitHologramGroup.add(holoBase, holoInner);
    this.pitHologramGroup.position.set(pitPos[0], 0, pitPos[1]);
    this.three.scene.add(this.pitHologramGroup);

    // Annual Map Variant 3D Actors: Revealing Wisps / Flying Cloud
    if (this.activeMapVariant.id === 'revealing_wisps') {
      for (const [wx, wz] of [
        [-48, 22],
        [48, -22]
      ]) {
        const wg = new THREE.Group();
        const orb = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.75, 0),
          createToonMaterial(0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.9 })
        );
        orb.position.y = 1.9;
        const visRing = new THREE.Mesh(
          new THREE.RingGeometry(4.2, 4.7, 24),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
        );
        visRing.rotation.x = -Math.PI / 2;
        visRing.position.y = 0.15;
        wg.add(orb, visRing);
        wg.position.set(wx, 0, wz);
        this.three.scene.add(wg);
        this.riverWards.push({ mesh: wg, x: wx, z: wz, homeX: wx, homeZ: wz, angle: 0, life: 9999, kind: 'wisp' });
      }
    } else if (this.activeMapVariant.id === 'flying_cloud') {
      const cg = new THREE.Group();
      const cloudMat = createToonMaterial(0xe0e7ff, { emissive: 0xa78bfa, emissiveIntensity: 0.55 });
      const mainPuff = new THREE.Mesh(new THREE.SphereGeometry(2.1, 14, 12), cloudMat);
      mainPuff.scale.set(1.4, 0.55, 1.1);
      mainPuff.position.y = 0.9;
      const sideA = new THREE.Mesh(new THREE.SphereGeometry(1.3, 12, 10), cloudMat);
      sideA.position.set(-1.7, 0.85, 0.5);
      const sideB = new THREE.Mesh(new THREE.SphereGeometry(1.3, 12, 10), cloudMat);
      sideB.position.set(1.7, 0.85, -0.4);
      const launchRing = new THREE.Mesh(
        new THREE.RingGeometry(3.2, 3.9, 28),
        new THREE.MeshBasicMaterial({ color: 0xa78bfa, side: THREE.DoubleSide, transparent: true, opacity: 0.78 })
      );
      launchRing.rotation.x = -Math.PI / 2;
      launchRing.position.y = 0.16;
      cg.add(mainPuff, sideA, sideB, launchRing);
      cg.position.set(FLYING_CLOUD_BLUE_SPOT[0], 0, FLYING_CLOUD_BLUE_SPOT[1]);
      this.three.scene.add(cg);
      this.flyingCloudMesh = cg;
    }

    // Ambush Bushes across lanes and river
    const bushMat = createToonMaterial(0x065f46, { transparent: true, opacity: 0.85 });
    for (const [bx, bz, br] of AMBUSH_BUSHES) {
      const patch = new THREE.Mesh(new THREE.CylinderGeometry(br * 0.75, br * 0.82, 0.55, 12), bushMat);
      patch.position.set(bx, 0.25, bz);
      this.three.scene.add(patch);
    }

    // Jungle Landmark Rocks
    const jungleRocks: [number, number][] = [
      [-50, 48], [-82, 48], [50, -48], [82, -48],
      [-48, -50], [48, 50], [-82, -48], [82, 48]
    ];
    for (const [rx, rz] of jungleRocks) {
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(3.1, 0),
        createToonMaterial(0x475569)
      );
      rock.position.set(rx, 1.9, rz);
      rock.castShadow = true;
      addInkOutline(rock, 1.06);
      this.three.scene.add(rock);
    }

    this.boltGeo = new THREE.SphereGeometry(0.32, 8, 8);
    this.blueBoltMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this.heroBoltMat = new THREE.MeshBasicMaterial({ color: this.heroBladeColor });
    this.redBoltMat = new THREE.MeshBasicMaterial({ color: 0xff4757 });
  }

  protected createCampMesh(kind: JungleCampKind, scale: number, colorNum: number): THREE.Group {
    const grp = new THREE.Group();
    if (kind === 'blue_buff' || kind === 'red_buff') {
      const isPurple = kind === 'blue_buff';
      const stoneCol = isPurple ? 0x3b0764 : 0x7c2d12;
      const glowCol = isPurple ? 0xa855f7 : 0xf97316;
      const torso = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.15 * scale, 0),
        createToonMaterial(stoneCol, { emissive: glowCol, emissiveIntensity: 0.28 })
      );
      torso.position.y = scale * 1.25;
      torso.castShadow = true;
      addInkOutline(torso, 1.07);
      const crown = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.56 * scale, 0),
        createToonMaterial(glowCol, { emissive: glowCol, emissiveIntensity: 0.85 })
      );
      crown.position.y = scale * 2.65;
      const shoulderGeo = new THREE.BoxGeometry(0.75 * scale, 0.85 * scale, 0.75 * scale);
      const shoulderMat = createToonMaterial(glowCol, { emissive: glowCol, emissiveIntensity: 0.45 });
      const leftShoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
      leftShoulder.position.set(-1.1 * scale, scale * 1.65, 0);
      const rightShoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
      rightShoulder.position.set(1.1 * scale, scale * 1.65, 0);
      grp.add(torso, crown, leftShoulder, rightShoulder);
    } else {
      const bodyGeo =
        kind === 'turtle'
          ? new THREE.DodecahedronGeometry(1.35 * scale, 0)
          : kind === 'lord'
            ? new THREE.CylinderGeometry(1.1 * scale, 1.45 * scale, 2.7 * scale, 8)
            : kind === 'crab'
              ? new THREE.CylinderGeometry(1.0 * scale, 1.15 * scale, 0.9 * scale, 8)
              : new THREE.IcosahedronGeometry(1.05 * scale, 0);
      const body = new THREE.Mesh(
        bodyGeo,
        createToonMaterial(colorNum, { emissive: colorNum, emissiveIntensity: 0.26 })
      );
      body.position.y = scale * 1.1;
      body.castShadow = true;
      addInkOutline(body, 1.08);
      const crown = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.46 * scale, 0),
        createToonMaterial(0xfef08a, { emissive: colorNum, emissiveIntensity: 0.65 })
      );
      crown.position.y = scale * 2.45;
      grp.add(body, crown);
    }
    return grp;
  }

  protected buildJungleCamps(): void {
    const lithoSpot = Math.random() < 0.5 ? LITHO_UPPER_SPOT : LITHO_LOWER_SPOT;
    const bossSpot = this.activeBossPit === 'upper' ? UPPER_RIVER_PIT : LOWER_RIVER_PIT;

    const specs: {
      id: string;
      kind: JungleCampKind;
      label: string;
      icon: string;
      x: number;
      z: number;
      hp: number;
      atk: number;
      scale: number;
      respawn: number;
      gold: number;
      score: number;
      colorNum: number;
      colorHex: string;
      initialWait: number;
    }[] = [
      // Purple Buffs (0:25 first spawn, 90s respawn)
      {
        id: 'purple_blue', kind: 'blue_buff', label: 'Purple Buff (Thunder Fenrir)', icon: '🟣', x: -68, z: 28,
        hp: 260, atk: 13, scale: 1.45, respawn: MLBB_TIMERS.BUFF_RESPAWN_SEC, gold: 95, score: 150,
        colorNum: 0xa855f7, colorHex: '#c084fc', initialWait: MLBB_TIMERS.PURPLE_FIRST_SPAWN_SEC
      },
      {
        id: 'purple_red', kind: 'blue_buff', label: 'Purple Buff (Thunder Fenrir)', icon: '🟣', x: 68, z: -28,
        hp: 260, atk: 13, scale: 1.45, respawn: MLBB_TIMERS.BUFF_RESPAWN_SEC, gold: 95, score: 150,
        colorNum: 0xa855f7, colorHex: '#c084fc', initialWait: MLBB_TIMERS.PURPLE_FIRST_SPAWN_SEC
      },
      // Orange Buffs (0:20 first spawn, 90s respawn)
      {
        id: 'orange_blue', kind: 'red_buff', label: 'Orange Buff (Molten Fiend)', icon: '🟠', x: -28, z: 68,
        hp: 270, atk: 15, scale: 1.48, respawn: MLBB_TIMERS.BUFF_RESPAWN_SEC, gold: 95, score: 150,
        colorNum: 0xf97316, colorHex: '#fb923c', initialWait: MLBB_TIMERS.ORANGE_FIRST_SPAWN_SEC
      },
      {
        id: 'orange_red', kind: 'red_buff', label: 'Orange Buff (Molten Fiend)', icon: '🟠', x: 28, z: -68,
        hp: 270, atk: 15, scale: 1.48, respawn: MLBB_TIMERS.BUFF_RESPAWN_SEC, gold: 95, score: 150,
        colorNum: 0xf97316, colorHex: '#fb923c', initialWait: MLBB_TIMERS.ORANGE_FIRST_SPAWN_SEC
      },
      // Horned Lizards (0:30 first spawn, 70s respawn + Heal)
      {
        id: 'lizard_blue', kind: 'horned_lizard', label: 'Horned Lizard', icon: '🦎', x: -80, z: 4,
        hp: 135, atk: 9, scale: 1.05, respawn: MLBB_TIMERS.SMALL_CAMP_RESPAWN_SEC, gold: 60, score: 85,
        colorNum: 0x22c55e, colorHex: '#facc15', initialWait: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN_SEC
      },
      {
        id: 'lizard_red', kind: 'horned_lizard', label: 'Horned Lizard', icon: '🦎', x: 80, z: -4,
        hp: 135, atk: 9, scale: 1.05, respawn: MLBB_TIMERS.SMALL_CAMP_RESPAWN_SEC, gold: 60, score: 85,
        colorNum: 0x22c55e, colorHex: '#facc15', initialWait: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN_SEC
      },
      // Lava Golems (0:30 first spawn, 70s respawn + Heal)
      {
        id: 'golem_blue', kind: 'lava_golem', label: 'Lava Golem', icon: '🪨', x: -4, z: 80,
        hp: 150, atk: 10, scale: 1.12, respawn: MLBB_TIMERS.SMALL_CAMP_RESPAWN_SEC, gold: 65, score: 90,
        colorNum: 0xea580c, colorHex: '#facc15', initialWait: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN_SEC
      },
      {
        id: 'golem_red', kind: 'lava_golem', label: 'Lava Golem', icon: '🪨', x: 4, z: -80,
        hp: 150, atk: 10, scale: 1.12, respawn: MLBB_TIMERS.SMALL_CAMP_RESPAWN_SEC, gold: 65, score: 90,
        colorNum: 0xea580c, colorHex: '#facc15', initialWait: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN_SEC
      },
      // Fire Beetles / Crammers (0:30 first spawn, 70s respawn, splits into Little Crammer!)
      {
        id: 'beetle_blue', kind: 'fire_beetle', label: 'Fire Beetle (Crammer)', icon: '🪲', x: -50, z: 74,
        hp: 140, atk: 9, scale: 1.08, respawn: MLBB_TIMERS.SMALL_CAMP_RESPAWN_SEC, gold: 58, score: 80,
        colorNum: 0xef4444, colorHex: '#facc15', initialWait: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN_SEC
      },
      {
        id: 'beetle_red', kind: 'fire_beetle', label: 'Fire Beetle (Crammer)', icon: '🪲', x: 50, z: -74,
        hp: 140, atk: 9, scale: 1.08, respawn: MLBB_TIMERS.SMALL_CAMP_RESPAWN_SEC, gold: 58, score: 80,
        colorNum: 0xef4444, colorHex: '#facc15', initialWait: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN_SEC
      },
      // Lithowanderer (0:40 first spawn, 120s respawn, Walkie Grass + Stone Roamer)
      {
        id: 'litho_river', kind: 'litho', label: 'Lithowanderer', icon: '🌿', x: lithoSpot[0], z: lithoSpot[1],
        hp: 175, atk: 8, scale: 1.15, respawn: MLBB_TIMERS.LITHO_RESPAWN_SEC, gold: 70, score: 115,
        colorNum: 0x14b8a6, colorHex: '#2dd4bf', initialWait: MLBB_TIMERS.LITHO_FIRST_SPAWN_SEC
      },
      // Scavenger Crabs (0:42 Little 35s -> 2:00 Large Gold Crab 90s + 18s Gold/EXP Aura)
      {
        id: 'crab_top', kind: 'crab', label: 'Little Scavenger Crab', icon: '🦀', x: -96, z: -74,
        hp: 110, atk: 7, scale: 0.92, respawn: MLBB_TIMERS.LITTLE_CRAB_RESPAWN_SEC, gold: 50, score: 75,
        colorNum: 0xf59e0b, colorHex: '#fde047', initialWait: MLBB_TIMERS.CRAB_FIRST_SPAWN_SEC
      },
      {
        id: 'crab_bot', kind: 'crab', label: 'Little Scavenger Crab', icon: '🦀', x: 74, z: 96,
        hp: 110, atk: 7, scale: 0.92, respawn: MLBB_TIMERS.LITTLE_CRAB_RESPAWN_SEC, gold: 50, score: 75,
        colorNum: 0xf59e0b, colorHex: '#fde047', initialWait: MLBB_TIMERS.CRAB_FIRST_SPAWN_SEC
      },
      // Shared River Objective Boss: First Turtle at 2:00 -> Neutral/Enhanced/Evolved Lord at 8:00/12:00/18:00
      {
        id: 'river_boss', kind: 'turtle', label: 'River Turtle', icon: '🐢', x: bossSpot[0], z: bossSpot[1],
        hp: 420, atk: 18, scale: 1.78, respawn: MLBB_TIMERS.TURTLE_RESPAWN_SEC, gold: 130, score: 260,
        colorNum: 0x10b981, colorHex: '#34d399', initialWait: MLBB_TIMERS.FIRST_TURTLE_SEC
      }
    ];

    for (const s of specs) {
      const grp = this.createCampMesh(s.kind, s.scale, s.colorNum);
      grp.position.set(s.x, 0, s.z);
      grp.visible = false;
      this.three.scene.add(grp);

      const ringMesh = new THREE.Mesh(
        new THREE.RingGeometry(1.8 * s.scale, 2.35 * s.scale, 24),
        new THREE.MeshBasicMaterial({ color: s.colorNum, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
      );
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(s.x, 0.12, s.z);
      ringMesh.visible = false;
      this.three.scene.add(ringMesh);

      const leashRadius = s.kind === 'turtle' || s.kind === 'lord' ? 14.5 : 12.5;
      const leashMesh = new THREE.Mesh(
        new THREE.RingGeometry(leashRadius - 0.35, leashRadius, 36),
        new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.52 })
      );
      leashMesh.rotation.x = -Math.PI / 2;
      leashMesh.position.set(s.x, 0.13, s.z);
      leashMesh.visible = false;
      this.three.scene.add(leashMesh);

      this.jungleCamps.push({
        id: s.id,
        campKind: s.kind,
        label: s.label,
        icon: s.icon,
        mesh: grp,
        ringMesh,
        leashMesh,
        leashRadius,
        patience: 100,
        aggroed: false,
        outOfCombatSec: 99,
        x: s.x,
        z: s.z,
        homeX: s.x,
        homeZ: s.z,
        hp: s.hp,
        maxHp: s.hp,
        atk: s.atk,
        cd: 0.6,
        alive: false,
        respawnTimer: s.initialWait,
        respawnDelay: s.respawn,
        goldReward: s.gold,
        scoreReward: s.score,
        colorHex: s.colorHex,
        colorNum: s.colorNum,
        stunTimer: 0,
        lordStage: 0
      });
    }
  }

  protected spawnPlayer(): void {
    const outline = playerState.mobaSettings.outline;
    this.playerMesh = buildMobaHeroMesh(
      this.heroBodyColor,
      this.heroCloakColor,
      this.heroBladeColor,
      1.24,
      this.heroDef.weapon,
      outline
    );
    this.px = BLUE_BASE_X + 6;
    this.py = 0;
    this.pz = BLUE_BASE_Z - 6;
    this.playerMesh.position.set(this.px, 0, this.pz);
    this.three.scene.add(this.playerMesh);

    this.shieldDomeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(2.3, 18, 14),
      new THREE.MeshBasicMaterial({
        color: this.heroBladeColor,
        transparent: true,
        opacity: 0.26,
        wireframe: true
      })
    );
    this.shieldDomeMesh.position.y = 1.6;
    this.shieldDomeMesh.visible = false;
    this.playerMesh.add(this.shieldDomeMesh);

    // Golden CC Immunity Aura Ring
    this.ccImmuneAuraMesh = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.14, 10, 32),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.9 })
    );
    this.ccImmuneAuraMesh.rotation.x = Math.PI / 2;
    this.ccImmuneAuraMesh.position.y = 1.45;
    this.ccImmuneAuraMesh.visible = false;
    this.playerMesh.add(this.ccImmuneAuraMesh);

    // 3D Glowing Feet Aura Ring for Blue Buff Golem
    this.blueBuffAuraMesh = new THREE.Group();
    const blueOuter = new THREE.Mesh(
      new THREE.RingGeometry(1.45, 1.95, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    blueOuter.rotation.x = -Math.PI / 2;
    const blueInner = new THREE.Mesh(
      new THREE.RingGeometry(0.85, 1.15, 6),
      new THREE.MeshBasicMaterial({ color: 0xa855f7, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
    );
    blueInner.rotation.x = -Math.PI / 2;
    this.blueBuffAuraMesh.add(blueOuter, blueInner);
    this.blueBuffAuraMesh.position.y = 0.14;
    this.blueBuffAuraMesh.visible = false;
    this.playerMesh.add(this.blueBuffAuraMesh);

    // 3D Glowing Feet Aura Ring for Orange Buff Golem
    this.redBuffAuraMesh = new THREE.Group();
    const redOuter = new THREE.Mesh(
      new THREE.RingGeometry(2.05, 2.55, 24),
      new THREE.MeshBasicMaterial({ color: 0xf97316, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    redOuter.rotation.x = -Math.PI / 2;
    const redInner = new THREE.Mesh(
      new THREE.RingGeometry(1.2, 1.42, 8),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
    );
    redInner.rotation.x = -Math.PI / 2;
    this.redBuffAuraMesh.add(redOuter, redInner);
    this.redBuffAuraMesh.position.y = 0.17;
    this.redBuffAuraMesh.visible = false;
    this.playerMesh.add(this.redBuffAuraMesh);

    // Winter Crown Frozen Stasis Crystal
    this.frozenCrystalMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(2.2, 0),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.52 })
    );
    this.frozenCrystalMesh.position.y = 1.6;
    this.frozenCrystalMesh.visible = false;
    this.playerMesh.add(this.frozenCrystalMesh);

    // 3D Rotating Recall Magic Circle + Beam (uses equipped Recall cosmetic color)
    const recallEffect =
      MOBA_RECALL_EFFECTS.find((e) => e.id === playerState.mobaRecallEffect) ?? MOBA_RECALL_EFFECTS[0];
    this.recallCircleGroup = new THREE.Group();
    const recOuter = new THREE.Mesh(
      new THREE.RingGeometry(2.3, 2.75, 32),
      new THREE.MeshBasicMaterial({
        color: recallEffect.colorNum,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.88,
        polygonOffset: true,
        polygonOffsetFactor: -2
      })
    );
    recOuter.rotation.x = -Math.PI / 2;
    const recInner = new THREE.Mesh(
      new THREE.RingGeometry(1.2, 1.55, 6),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
        polygonOffset: true,
        polygonOffsetFactor: -2
      })
    );
    recInner.rotation.x = -Math.PI / 2;
    const recBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.75, 2.2, 14, 18, 1, true),
      new THREE.MeshBasicMaterial({
        color: recallEffect.colorNum,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.24
      })
    );
    recBeam.position.y = 7;
    this.recallCircleGroup.add(recOuter, recInner, recBeam);
    this.recallCircleGroup.position.set(this.px, 0.16, this.pz);
    this.recallCircleGroup.visible = false;
    this.three.scene.add(this.recallCircleGroup);

    // Reusable Ground Aiming Telegraph Container & Max-Range Ring
    this.telegraphGroup = new THREE.Group();
    this.telegraphGroup.visible = false;
    this.three.scene.add(this.telegraphGroup);

    this.telegraphRangeGroup = new THREE.Group();
    this.telegraphRangeGroup.visible = false;
    this.three.scene.add(this.telegraphRangeGroup);

    // Aimed Enemy Target Highlight Ring
    this.aimTargetHighlightMesh = new THREE.Mesh(
      new THREE.RingGeometry(1.9, 2.55, 24),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        polygonOffset: true,
        polygonOffsetFactor: -4
      })
    );
    this.aimTargetHighlightMesh.rotation.x = -Math.PI / 2;
    this.aimTargetHighlightMesh.visible = false;
    this.three.scene.add(this.aimTargetHighlightMesh);

    // Hero Lock Ground Reticle Ring
    this.lockedReticleMesh = new THREE.Mesh(
      new THREE.RingGeometry(1.7, 2.25, 28),
      new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92,
        polygonOffset: true,
        polygonOffsetFactor: -2
      })
    );
    this.lockedReticleMesh.rotation.x = -Math.PI / 2;
    this.lockedReticleMesh.visible = false;
    this.three.scene.add(this.lockedReticleMesh);
  }

  protected spawnTeamHeroes(): void {
    const isRanked = this.mobaMode === 'ranked';
    const isAiVs = this.mobaMode === 'ai_vs';
    const enemyHp = (isRanked ? 300 : isAiVs ? 210 : 250) + this.level * 24;
    const outline = playerState.mobaSettings.outline;
    const banSet = new Set<number>(this.mobaMode === 'ranked' ? playerState.mobaDraftBans : []);
    banSet.add(this.heroDef.id);

    const pickCanonicalEnemy = (preferredIds: number[]): MobaHeroDef => {
      for (const id of preferredIds) {
        if (!banSet.has(id) && MOBA_HEROES[id]) {
          banSet.add(id);
          return MOBA_HEROES[id];
        }
      }
      const fallback = MOBA_HEROES.find((h) => !banSet.has(h.id)) ?? MOBA_HEROES[1];
      banSet.add(fallback.id);
      return fallback;
    };

    const enemy1 = pickCanonicalEnemy([1, 98, 101, 108]); // Eudora / Gord / Kagura / Valir
    const enemy2 = pickCanonicalEnemy([80, 84, 83, 88]); // Saber / Lancelot / Hayabusa / Gusion
    const enemy3 = pickCanonicalEnemy([2, 3, 4, 8]); // Layla / Miya / Bruno / Moskov

    const enemySpecs: [number, number, number, MobaHeroDef][] = [
      [88, -88, 1, enemy1],
      [-86, -98, 0, enemy2],
      [98, 84, 2, enemy3]
    ];
    for (const [hx, hz, lane, hDef] of enemySpecs) {
      const m = buildMobaHeroMesh(0xef4444, 0x991b1b, 0xfacc15, 1.18, hDef.weapon, outline);
      m.position.set(hx, 0, hz);
      this.three.scene.add(m);
      this.actors.push({
        id: this.nextActorId++,
        mesh: m,
        x: hx,
        z: hz,
        team: 'red',
        kind: 'hero',
        hp: enemyHp,
        maxHp: enemyHp,
        atk: isRanked ? 22 : isAiVs ? 13 : 17,
        cd: 0.6,
        lane,
        alive: true,
        stunTimer: 0,
        rootTimer: 0,
        silenceTimer: 0,
        fearTimer: 0,
        tauntTimer: 0,
        slowTimer: 0,
        airborneTimer: 0,
        airborneDur: 0.5,
        airbornePeak: 0,
        lifeTimer: 0,
        respawnTimer: 0,
        spawnX: RED_BASE_X - 8,
        spawnZ: RED_BASE_Z + 8,
        label: hDef.name,
        icon: hDef.icon
      });
    }

    // 2 Allied Blue Heroes pushing Top & Bot Lanes (Tigreal & Miya)
    const allySpecs: [number, number, number, 'shield' | 'bow', string, string][] = [
      [-94, 38, 0, 'shield', 'Tigreal', '🛡️'],
      [-38, 94, 2, 'bow', 'Miya', '🏹']
    ];
    for (const [ax, az, lane, wp, label, icon] of allySpecs) {
      const m = buildMobaHeroMesh(0x2563eb, 0x1e40af, 0x38bdf8, 1.14, wp, outline);
      m.position.set(ax, 0, az);
      this.three.scene.add(m);
      this.actors.push({
        id: this.nextActorId++,
        mesh: m,
        x: ax,
        z: az,
        team: 'blue',
        kind: 'hero',
        hp: 250,
        maxHp: 250,
        atk: 17,
        cd: 0.6,
        lane,
        alive: true,
        stunTimer: 0,
        rootTimer: 0,
        silenceTimer: 0,
        fearTimer: 0,
        tauntTimer: 0,
        slowTimer: 0,
        airborneTimer: 0,
        airborneDur: 0.5,
        airbornePeak: 0,
        lifeTimer: 0,
        respawnTimer: 0,
        spawnX: BLUE_BASE_X + 10,
        spawnZ: BLUE_BASE_Z - 10,
        label,
        icon
      });
    }
  }

  protected spawnMinionWave(): void {
    const outline = playerState.mobaSettings.outline;
    const blueOffsets: [number, number, number][] = [
      [-104, 72, 0],
      [-94, 94, 1],
      [-72, 104, 2]
    ];
    const hasAlliedLord = this.actors.some((a) => a.alive && a.kind === 'lord' && a.team === 'blue');
    for (const [bx, bz, lane] of blueOffsets) {
      const isSuperBlue = this.superMinionLanes.has(lane) || hasAlliedLord;
      const blueScale = isSuperBlue ? 1.02 : 0.78;
      const blueBuilt = buildSoldierMesh(
        isSuperBlue ? 0x0ea5e9 : 0x3b82f6,
        isSuperBlue ? 0x1e40af : 0x1d4ed8,
        isSuperBlue ? 0xfacc15 : 0x93c5fd,
        blueScale,
        outline
      );
      blueBuilt.group.position.set(bx, 0, bz);
      this.three.scene.add(blueBuilt.group);
      this.actors.push({
        id: this.nextActorId++,
        mesh: blueBuilt.group,
        x: bx,
        z: bz,
        team: 'blue',
        kind: 'minion',
        hp: isSuperBlue ? 145 : 75,
        maxHp: isSuperBlue ? 145 : 75,
        atk: isSuperBlue ? 18 : 10,
        cd: 0.4,
        lane,
        alive: true,
        stunTimer: 0,
        rootTimer: 0,
        silenceTimer: 0,
        fearTimer: 0,
        tauntTimer: 0,
        slowTimer: 0,
        airborneTimer: 0,
        airborneDur: 0.4,
        airbornePeak: 0,
        lifeTimer: 0,
        respawnTimer: 0,
        spawnX: bx,
        spawnZ: bz,
        label: isSuperBlue ? 'Super Minion' : undefined
      });

      const rx = -bx;
      const rz = -bz;
      const redBuilt = buildSoldierMesh(0xef4444, 0x991b1b, 0xfca5a5, 0.78, outline);
      redBuilt.group.position.set(rx, 0, rz);
      this.three.scene.add(redBuilt.group);
      this.actors.push({
        id: this.nextActorId++,
        mesh: redBuilt.group,
        x: rx,
        z: rz,
        team: 'red',
        kind: 'minion',
        hp: 75,
        maxHp: 75,
        atk: 10,
        cd: 0.4,
        lane,
        alive: true,
        stunTimer: 0,
        rootTimer: 0,
        silenceTimer: 0,
        fearTimer: 0,
        tauntTimer: 0,
        slowTimer: 0,
        airborneTimer: 0,
        airborneDur: 0.4,
        airbornePeak: 0,
        lifeTimer: 0,
        respawnTimer: 0,
        spawnX: rx,
        spawnZ: rz
      });
    }
  }

  protected spawnAlliedLord(stage: 1 | 2 | 3 = 1): void {
    const standing: Record<0 | 1 | 2, number> = { 0: 0, 1: 0, 2: 0 };
    for (const t of this.turrets) {
      if (t.alive && t.team === 'red' && !t.isNexus) {
        standing[t.lane]++;
      }
    }
    const targetLane = selectLordWeakestLane(standing);
    const laneName =
      targetLane === 1
        ? 'Mid Lane'
        : targetLane === this.laneAssign.expLaneIndex
          ? 'EXP Lane'
          : 'Gold Lane';
    const spawnPos: [number, number] =
      targetLane === 0 ? [-92, 32] : targetLane === 2 ? [-32, 92] : [-36, 36];

    const scale = stage === 3 ? 2.15 : stage === 2 ? 1.98 : 1.85;
    const hp = stage === 3 ? 1280 : stage === 2 ? 980 : 760;
    const atk = stage === 3 ? 58 : stage === 2 ? 46 : 38;
    const bossMesh = buildMobaHeroMesh(
      stage === 3 ? 0x7c3aed : 0x2563eb,
      0x1d4ed8,
      0xfacc15,
      scale,
      'halberd',
      playerState.mobaSettings.outline
    );
    bossMesh.position.set(spawnPos[0], 0, spawnPos[1]);
    this.three.scene.add(bossMesh);
    this.lordChargeAvailable = stage >= 2;
    this.actors.push({
      id: this.nextActorId++,
      mesh: bossMesh,
      x: spawnPos[0],
      z: spawnPos[1],
      team: 'blue',
      kind: 'lord',
      hp,
      maxHp: hp,
      atk,
      cd: 0.8,
      lane: targetLane,
      alive: true,
      stunTimer: 0,
      rootTimer: 0,
      silenceTimer: 0,
      fearTimer: 0,
      tauntTimer: 0,
      slowTimer: 0,
      airborneTimer: 0,
      airborneDur: 0.5,
      airbornePeak: 0,
      lifeTimer: 0,
      respawnTimer: 0,
      spawnX: spawnPos[0],
      spawnZ: spawnPos[1],
      label: stage === 3 ? 'Evolved Lord' : stage === 2 ? 'Enhanced Lord' : 'Allied Lord',
      icon: '🐉'
    });
    this.showKillfeed(`🐉 ${stage === 3 ? 'EVOLVED' : stage === 2 ? 'ENHANCED' : 'LUMINOUS'} LORD marches ${laneName}!`);
  }

  protected onCanvasTap = (e: PointerEvent): void => {
    if (this.gameOver || this.isPaused) return;
    if (this.activeSkillAim) return;
    const pt = mapClientToStage(e.clientX, e.clientY);
    const vp = getViewportSize();
    _mobaNdc.set(
      (pt.x / Math.max(1, vp.width)) * 2 - 1,
      -(pt.y / Math.max(1, vp.height)) * 2 + 1
    );
    _mobaRay.setFromCamera(_mobaNdc, this.three.camera);
    if (Math.abs(_mobaRay.ray.direction.y) > 0.01) {
      const t = -_mobaRay.ray.origin.y / _mobaRay.ray.direction.y;
      if (t > 0 && t < 320) {
        const hitX = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, _mobaRay.ray.origin.x + _mobaRay.ray.direction.x * t));
        const hitZ = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, _mobaRay.ray.origin.z + _mobaRay.ray.direction.z * t));
        this.tapTarget = { x: hitX, z: hitZ };
      }
    }
  };

  setMoveDir(dx: number, dy: number): void {
    if (this.gameOver || this.isPaused) {
      this.moveX = 0;
      this.moveZ = 0;
      return;
    }
    this.moveX = dx;
    this.moveZ = dy;
    if (dx !== 0 || dy !== 0) this.tapTarget = null;
  }

  setSteerLeft(down: boolean): void {
    this.moveX = down && !this.gameOver && !this.isPaused ? -1 : 0;
    if (down && !this.isPaused) this.tapTarget = null;
  }

  setSteerRight(down: boolean): void {
    this.moveX = down && !this.gameOver && !this.isPaused ? 1 : 0;
    if (down && !this.isPaused) this.tapTarget = null;
  }

  protected firePlayerBolt(
    angle: number,
    dmg: number,
    rangeSec = 0.78,
    _colorOverride?: number,
    elementTheme?: MobaElementTheme,
    boltScale = 1.05
  ): void {
    const theme = elementTheme ?? this.heroBaseElement;
    const m = createElementalProjectileMesh(theme, boltScale);
    m.position.set(this.px, 1.55, this.pz);
    m.rotation.y = angle;
    this.three.scene.add(m);
    const rangeBoost = this.equippedItemIds.includes('malefic_gun') ? 1.15 : 1.0;
    this.bolts.push({
      mesh: m,
      x: this.px,
      z: this.pz,
      vx: Math.sin(angle) * 34,
      vz: Math.cos(angle) * 34,
      team: 'blue',
      dmg,
      life: rangeSec * rangeBoost,
      slowSec: this.redBuffTimer > 0 || this.computedStats.hasIceBound ? 1.5 : 0,
      elementTheme: theme,
      isSharedMesh: false
    });
  }

  setLockedEnemy(actorId: number | null): void {
    if (this.lockedEnemyId === actorId) {
      this.lockedEnemyId = null;
    } else {
      this.lockedEnemyId = actorId;
    }
    this.pushMobaHudSnapshot();
  }

  isSkillAiming(): boolean {
    return this.activeSkillAim !== null;
  }

  protected resolveActionAimMeta(actionKey: string): {
    actionKey: 'skill1' | 'skill2' | 'skill3' | 'skill4' | 'spell';
    slotIndex: 0 | 1 | 2 | 3 | null;
    targeting: MobaSkillTargeting;
    range: number;
    radius: number;
    elementTheme: MobaElementTheme;
    ready: boolean;
  } | null {
    if (actionKey === 'skill1' || actionKey === 'skill2' || actionKey === 'skill3' || actionKey === 'skill4') {
      const slotIndex = (Number(actionKey.slice(5)) - 1) as 0 | 1 | 2 | 3;
      const spec = this.combatKit.skills[slotIndex];
      if (!spec) return null;
      const johnsonDriving =
        spec.iconicUlt === 'johnson_car' && this.activeUltSetpieces.some((s) => s.kind === 'johnson_car');
      const cd =
        slotIndex === 0
          ? this.cdSkill1
          : slotIndex === 1
            ? this.cdSkill2
            : slotIndex === 2
              ? this.cdSkill3
              : this.cdSkill4;
      return {
        actionKey,
        slotIndex,
        targeting: spec.targeting,
        range: Math.max(6, Math.min(28, spec.range)),
        radius: Math.max(2.6, Math.min(14, spec.radius)),
        elementTheme: spec.elementTheme,
        ready: johnsonDriving || cd <= 0
      };
    }
    if (actionKey === 'spell') {
      const id = this.spellDef.id;
      let targeting: MobaSkillTargeting = 'self';
      let range = 8;
      let radius = 5.5;
      let elementTheme: MobaElementTheme = 'celestial';
      if (id === 'flicker') {
        targeting = 'circle';
        range = 15;
        radius = 3.2;
        elementTheme = 'lightning';
      } else if (id === 'flameshot') {
        targeting = 'line';
        range = 26;
        radius = 2.6;
        elementTheme = 'fire';
      } else if (id === 'execute') {
        targeting = 'lock';
        range = 10.5;
        radius = 3.0;
        elementTheme = 'blood';
      } else if (id === 'retribution') {
        targeting = 'lock';
        range = 15;
        radius = 3.2;
        elementTheme = 'blood';
      } else if (id === 'petrify') {
        targeting = 'self';
        range = 8.2;
        radius = 8.2;
        elementTheme = 'earth';
      } else if (id === 'revitalize') {
        targeting = 'self';
        range = 6.2;
        radius = 6.2;
        elementTheme = 'nature';
      } else if (id === 'inspire') {
        elementTheme = 'fire';
      } else if (id === 'sprint') {
        elementTheme = 'wind';
      } else if (id === 'aegis' || id === 'vengeance' || id === 'purify') {
        elementTheme = 'celestial';
      } else if (id === 'arrival') {
        elementTheme = 'shadow';
      }
      return {
        actionKey: 'spell',
        slotIndex: null,
        targeting,
        range,
        radius,
        elementTheme,
        ready: this.cdSpell <= 0
      };
    }
    return null;
  }

  protected findAimLockEnemy(
    aimX: number,
    aimZ: number,
    aimYaw: number,
    maxRange: number,
    targeting: MobaSkillTargeting
  ): { id: number | null; x: number; z: number } | null {
    const dirX = Math.sin(aimYaw);
    const dirZ = Math.cos(aimYaw);
    let bestScore = Infinity;
    let best: { id: number | null; x: number; z: number } | null = null;

    for (const a of this.actors) {
      if (!a.alive || a.team !== 'red') continue;
      const dHero = Math.hypot(a.x - this.px, a.z - this.pz);
      if (dHero > maxRange + 4.5) continue;

      let score = Infinity;
      if (targeting === 'line' || targeting === 'cone') {
        const rx = a.x - this.px;
        const rz = a.z - this.pz;
        const proj = rx * dirX + rz * dirZ;
        const perp = Math.abs(rx * dirZ - rz * dirX);
        const coneLimit = targeting === 'cone' ? Math.max(3.5, proj * 0.62) : 3.6;
        if (proj > 0 && proj <= maxRange + 2 && perp <= coneLimit) {
          score = perp * 2.2 + proj * 0.15;
        }
      } else {
        const dAim = Math.hypot(a.x - aimX, a.z - aimZ);
        if (dAim <= (targeting === 'lock' ? 7.5 : 5.5)) {
          score = dAim;
        }
      }
      if (a.kind === 'hero' && Number.isFinite(score)) score *= 0.65;
      if (score < bestScore) {
        bestScore = score;
        best = { id: a.id, x: a.x, z: a.z };
      }
    }
    return best;
  }

  beginSkillAim(actionKey: string, mode: 'drag' | 'cursor' = 'drag'): boolean {
    if (this.gameOver || this.isPaused || this.frozenTimer > 0) return false;
    const meta = this.resolveActionAimMeta(actionKey);
    if (!meta || !meta.ready) return false;

    const tgt = this.findNearestEnemyTarget();
    const initialYaw = tgt ? tgt.angle : this.pYaw;
    const initDist =
      meta.targeting === 'self'
        ? 0
        : tgt
          ? Math.min(meta.range, tgt.dist)
          : Math.min(meta.range * 0.65, 11);
    const aimX = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.px + Math.sin(initialYaw) * initDist));
    const aimZ = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.pz + Math.cos(initialYaw) * initDist));

    this.activeSkillAim = {
      actionKey: meta.actionKey,
      slotIndex: meta.slotIndex,
      mode,
      targeting: meta.targeting,
      range: meta.range,
      radius: meta.radius,
      elementTheme: meta.elementTheme,
      aimYaw: initialYaw,
      aimX,
      aimZ,
      lockedTargetId: tgt?.actor?.id ?? null,
      cancelled: false,
      hasManualAim: false
    };
    this.telegraphSlot = meta.slotIndex;
    this.telegraphAutoTimer = 0;
    this.telegraphCancelled = false;
    this.rebuildActiveTelegraphMesh();
    this.syncTelegraphTransform();
    return true;
  }

  updateSkillAimDrag(normX: number, normY: number, cancelled = false): void {
    const aim = this.activeSkillAim;
    if (!aim || !this.three?.camera) return;

    const prevCancel = aim.cancelled;
    aim.cancelled = cancelled;

    const mag = Math.hypot(normX, normY);
    if (mag > 0.14) {
      // Map screen-space drag (normX right, normY down) onto camera-relative world XZ plane
      this.three.camera.getWorldDirection(_camFwd);
      _camFwd.y = 0;
      if (_camFwd.lengthSq() < 1e-5) _camFwd.set(0.55, 0, -0.83);
      _camFwd.normalize();
      _camRight.crossVectors(_camFwd, _worldUp).normalize();

      const worldDx = _camRight.x * normX + _camFwd.x * -normY;
      const worldDz = _camRight.z * normX + _camFwd.z * -normY;

      const resolved = resolveSkillAimPoint(
        this.px,
        this.pz,
        worldDx,
        worldDz,
        aim.range,
        aim.targeting,
        PLAY_LIMIT
      );
      aim.aimYaw = resolved.aimYaw;
      aim.aimX = resolved.aimX;
      aim.aimZ = resolved.aimZ;
      aim.hasManualAim = true;

      const snapped = this.findAimLockEnemy(aim.aimX, aim.aimZ, aim.aimYaw, aim.range, aim.targeting);
      aim.lockedTargetId = snapped?.id ?? null;
      if (aim.targeting === 'lock' && snapped) {
        aim.aimX = snapped.x;
        aim.aimZ = snapped.z;
        aim.aimYaw = Math.atan2(snapped.x - this.px, snapped.z - this.pz);
      }
    }

    if (prevCancel !== cancelled) {
      this.telegraphCancelled = cancelled;
      this.rebuildActiveTelegraphMesh();
    }
    this.syncTelegraphTransform();
  }

  updateSkillAimScreen(clientX: number, clientY: number, cancelled = false): void {
    const aim = this.activeSkillAim;
    if (!aim || !this.three?.camera) return;

    const prevCancel = aim.cancelled;
    aim.cancelled = cancelled;

    const pt = mapClientToStage(clientX, clientY);
    const vp = getViewportSize();
    _mobaNdc.set(
      (pt.x / Math.max(1, vp.width)) * 2 - 1,
      -(pt.y / Math.max(1, vp.height)) * 2 + 1
    );
    _mobaRay.setFromCamera(_mobaNdc, this.three.camera);
    if (Math.abs(_mobaRay.ray.direction.y) > 0.01) {
      const t = -_mobaRay.ray.origin.y / _mobaRay.ray.direction.y;
      if (t > 0 && t < 340) {
        const hitX = _mobaRay.ray.origin.x + _mobaRay.ray.direction.x * t;
        const hitZ = _mobaRay.ray.origin.z + _mobaRay.ray.direction.z * t;
        const dx = hitX - this.px;
        const dz = hitZ - this.pz;
        const rawDist = Math.hypot(dx, dz);
        if (rawDist > 0.25) {
          const aimYaw = Math.atan2(dx, dz);
          const clampedDist = aim.targeting === 'self' ? 0 : Math.min(aim.range, rawDist);
          aim.aimYaw = aimYaw;
          aim.aimX = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.px + Math.sin(aimYaw) * clampedDist));
          aim.aimZ = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.pz + Math.cos(aimYaw) * clampedDist));
          aim.hasManualAim = true;

          const snapped = this.findAimLockEnemy(aim.aimX, aim.aimZ, aim.aimYaw, aim.range, aim.targeting);
          aim.lockedTargetId = snapped?.id ?? null;
          if (aim.targeting === 'lock' && snapped) {
            aim.aimX = snapped.x;
            aim.aimZ = snapped.z;
            aim.aimYaw = Math.atan2(snapped.x - this.px, snapped.z - this.pz);
          }
        }
      }
    }

    if (prevCancel !== cancelled) {
      this.telegraphCancelled = cancelled;
      this.rebuildActiveTelegraphMesh();
    }
    this.syncTelegraphTransform();
  }

  commitSkillAim(quickTap = false): void {
    const aim = this.activeSkillAim;
    if (!aim) return;
    this.activeSkillAim = null;
    this.telegraphSlot = null;
    this.telegraphCancelled = false;
    if (this.telegraphGroup) this.telegraphGroup.visible = false;
    if (this.telegraphRangeGroup) this.telegraphRangeGroup.visible = false;
    if (this.aimTargetHighlightMesh) this.aimTargetHighlightMesh.visible = false;

    if (aim.cancelled) return;

    const override: SkillAimOverride | undefined =
      quickTap && !aim.hasManualAim
        ? undefined
        : {
            aimX: aim.aimX,
            aimZ: aim.aimZ,
            aimYaw: aim.aimYaw,
            lockedTargetId: aim.lockedTargetId,
            dist: Math.hypot(aim.aimX - this.px, aim.aimZ - this.pz)
          };

    if (aim.slotIndex !== null) {
      this.castHeroSkill(aim.slotIndex, override);
    } else if (aim.actionKey === 'spell') {
      this.castBattleSpell(override);
    }
  }

  cancelSkillAim(): void {
    this.activeSkillAim = null;
    this.telegraphSlot = null;
    this.telegraphAutoTimer = 0;
    this.telegraphCancelled = false;
    if (this.telegraphGroup) this.telegraphGroup.visible = false;
    if (this.telegraphRangeGroup) this.telegraphRangeGroup.visible = false;
    if (this.aimTargetHighlightMesh) this.aimTargetHighlightMesh.visible = false;
  }

  previewSkillTelegraph(slotIndex: number | null): void {
    if (this.activeSkillAim) return;
    this.telegraphSlot = slotIndex;
    this.telegraphAutoTimer = 0;
    this.rebuildTelegraphMesh(slotIndex);
  }

  protected clearGroupChildren(grp?: THREE.Group): void {
    if (!grp) return;
    while (grp.children.length > 0) {
      const ch = grp.children[0];
      disposeObjectTree(ch);
      grp.remove(ch);
    }
  }

  protected buildTelegraphGeometry(
    targeting: MobaSkillTargeting,
    range: number,
    radius: number,
    elementTheme: MobaElementTheme,
    cancelled: boolean
  ): void {
    if (!this.telegraphGroup || !this.telegraphRangeGroup) return;
    this.clearGroupChildren(this.telegraphGroup);
    this.clearGroupChildren(this.telegraphRangeGroup);

    const pal = MOBA_ELEMENT_PALETTES[elementTheme];
    const fillColor = cancelled ? 0xef4444 : pal.primary;
    const rimColor = cancelled ? 0xfca5a5 : pal.secondary;
    const coreColor = cancelled ? 0xfee2e2 : pal.core;

    const matFill = new THREE.MeshBasicMaterial({
      color: fillColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: cancelled ? 0.28 : 0.24,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -3
    });
    const matRim = new THREE.MeshBasicMaterial({
      color: rimColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4
    });
    const matCore = new THREE.MeshBasicMaterial({
      color: coreColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -5
    });

    // Outer max cast-range ring around hero for non-self skills
    if (targeting !== 'self') {
      const rangeRing = new THREE.Mesh(
        new THREE.RingGeometry(Math.max(1, range - 0.22), range, 48),
        new THREE.MeshBasicMaterial({
          color: rimColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: cancelled ? 0.55 : 0.42,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -2
        })
      );
      rangeRing.rotation.x = -Math.PI / 2;
      rangeRing.position.y = 0.12;
      this.telegraphRangeGroup.add(rangeRing);
      this.telegraphRangeGroup.visible = true;
    } else {
      this.telegraphRangeGroup.visible = false;
    }

    if (targeting === 'line') {
      const len = Math.max(6, Math.min(26, range));
      const rect = new THREE.Mesh(new THREE.PlaneGeometry(2.9, len), matFill);
      rect.rotation.x = -Math.PI / 2;
      rect.position.set(0, 0.15, len / 2);
      const rail = new THREE.Mesh(new THREE.PlaneGeometry(0.45, len * 0.96), matCore);
      rail.rotation.x = -Math.PI / 2;
      rail.position.set(0, 0.17, len / 2);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(1.85, 2.5, 3), matRim);
      tip.rotation.x = Math.PI / 2;
      tip.position.set(0, 0.19, len + 0.85);
      this.telegraphGroup.add(rect, rail, tip);
    } else if (targeting === 'cone') {
      const rad = Math.max(6, Math.min(18, range));
      const cone = new THREE.Mesh(new THREE.CircleGeometry(rad, 22, Math.PI / 2 - 0.56, 1.12), matFill);
      cone.rotation.x = -Math.PI / 2;
      cone.rotation.z = Math.PI;
      cone.position.y = 0.15;
      const rimArc = new THREE.Mesh(
        new THREE.RingGeometry(rad - 0.32, rad, 24, 1, Math.PI / 2 - 0.56, 1.12),
        matRim
      );
      rimArc.rotation.x = -Math.PI / 2;
      rimArc.rotation.z = Math.PI;
      rimArc.position.y = 0.17;
      this.telegraphGroup.add(cone, rimArc);
    } else if (targeting === 'circle' || targeting === 'lock') {
      const r = targeting === 'lock' ? Math.max(2.6, Math.min(4.2, radius * 0.55)) : Math.max(2.6, radius);
      const outer = new THREE.Mesh(new THREE.RingGeometry(r - 0.35, r, 36), matRim);
      outer.rotation.x = -Math.PI / 2;
      outer.position.y = 0.16;
      const fill = new THREE.Mesh(new THREE.CircleGeometry(r, 30), matFill);
      fill.rotation.x = -Math.PI / 2;
      fill.position.y = 0.14;
      const crossH = new THREE.Mesh(new THREE.PlaneGeometry(r * 0.72, 0.22), matCore);
      crossH.rotation.x = -Math.PI / 2;
      crossH.position.y = 0.18;
      const crossV = new THREE.Mesh(new THREE.PlaneGeometry(0.22, r * 0.72), matCore);
      crossV.rotation.x = -Math.PI / 2;
      crossV.position.y = 0.18;
      this.telegraphGroup.add(outer, fill, crossH, crossV);
    } else {
      const r = Math.max(3.5, radius);
      const selfRing = new THREE.Mesh(new THREE.RingGeometry(r - 0.38, r, 32), matRim);
      selfRing.rotation.x = -Math.PI / 2;
      selfRing.position.y = 0.16;
      const selfFill = new THREE.Mesh(new THREE.CircleGeometry(r, 28), matFill);
      selfFill.rotation.x = -Math.PI / 2;
      selfFill.position.y = 0.14;
      this.telegraphGroup.add(selfRing, selfFill);
    }
    this.telegraphGroup.visible = true;
  }

  protected rebuildActiveTelegraphMesh(): void {
    const aim = this.activeSkillAim;
    if (!aim) return;
    this.buildTelegraphGeometry(aim.targeting, aim.range, aim.radius, aim.elementTheme, aim.cancelled);
    if (this.aimTargetHighlightMesh) {
      const mat = this.aimTargetHighlightMesh.material as THREE.MeshBasicMaterial;
      mat.color.setHex(aim.cancelled ? 0xef4444 : MOBA_ELEMENT_PALETTES[aim.elementTheme].secondary);
    }
  }

  protected rebuildTelegraphMesh(slotIndex: number | null): void {
    if (!this.telegraphGroup) return;
    if (slotIndex === null || slotIndex < 0 || slotIndex > 3) {
      this.clearGroupChildren(this.telegraphGroup);
      this.clearGroupChildren(this.telegraphRangeGroup);
      this.telegraphGroup.visible = false;
      if (this.telegraphRangeGroup) this.telegraphRangeGroup.visible = false;
      if (this.aimTargetHighlightMesh) this.aimTargetHighlightMesh.visible = false;
      return;
    }
    const spec = this.combatKit.skills[slotIndex];
    if (!spec) {
      this.telegraphGroup.visible = false;
      return;
    }
    this.buildTelegraphGeometry(spec.targeting, spec.range, spec.radius, spec.elementTheme, false);
    this.syncTelegraphTransform();
  }

  protected syncTelegraphTransform(): void {
    if (!this.telegraphGroup || !this.telegraphGroup.visible) return;

    if (this.activeSkillAim) {
      const aim = this.activeSkillAim;
      if (this.telegraphRangeGroup) {
        this.telegraphRangeGroup.position.set(this.px, 0, this.pz);
      }
      if (aim.targeting === 'circle' || aim.targeting === 'lock') {
        this.telegraphGroup.position.set(aim.aimX, 0, aim.aimZ);
        this.telegraphGroup.rotation.y = 0;
      } else {
        this.telegraphGroup.position.set(this.px, 0, this.pz);
        this.telegraphGroup.rotation.y = aim.aimYaw;
      }

      // Highlight locked / hovered target under aim
      if (this.aimTargetHighlightMesh) {
        let hiActor: MobaActor | undefined;
        if (aim.lockedTargetId !== null) {
          hiActor = this.actors.find((a) => a.id === aim.lockedTargetId && a.alive && a.team === 'red');
        }
        if (!hiActor && aim.targeting === 'circle') {
          hiActor = this.actors.find(
            (a) => a.alive && a.team === 'red' && Math.hypot(a.x - aim.aimX, a.z - aim.aimZ) <= aim.radius
          );
        }
        if (hiActor) {
          this.aimTargetHighlightMesh.visible = true;
          this.aimTargetHighlightMesh.position.set(hiActor.x, 0.24, hiActor.z);
          this.aimTargetHighlightMesh.rotation.z += 0.08;
        } else {
          this.aimTargetHighlightMesh.visible = false;
        }
      }
      return;
    }

    if (this.telegraphSlot === null) return;
    const spec = this.combatKit.skills[this.telegraphSlot];
    if (!spec) return;
    if (this.telegraphRangeGroup) {
      this.telegraphRangeGroup.position.set(this.px, 0, this.pz);
    }
    if (spec.targeting === 'circle' || spec.targeting === 'lock') {
      const tgt = this.findNearestEnemyTarget();
      if (tgt) {
        this.telegraphGroup.position.set(tgt.x, 0, tgt.z);
      } else {
        const dist = Math.min(spec.range * 0.65, 11);
        this.telegraphGroup.position.set(
          this.px + Math.sin(this.pYaw) * dist,
          0,
          this.pz + Math.cos(this.pYaw) * dist
        );
      }
      this.telegraphGroup.rotation.y = 0;
    } else {
      this.telegraphGroup.position.set(this.px, 0, this.pz);
      this.telegraphGroup.rotation.y = this.pYaw;
    }
  }

}
