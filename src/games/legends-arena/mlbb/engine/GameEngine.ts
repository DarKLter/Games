import {
  MlbbActiveBuffHud,
  MlbbHudSnapshot,
  MlbbMatchLaunchConfig,
  MlbbMatchPlayerSummary,
  MlbbMatchRecord,
  MlbbPingKind,
  MlbbSettingsState,
  MlbbSpellId
} from '../types';
import { getMlbbHeroById } from '../data/heroes';
import {
  aggregateMlbbItemStats,
  applyMlbbItemPurchase,
  computeMlbbEffectiveCost,
  computeMlbbQuickBuy,
  computeMlbbSellRefund,
  getMlbbItemById
} from '../data/items';
import { getMlbbBattleSpellById, getMlbbEmblemById, getMlbbEmoteById, MLBB_TALENTS } from '../data/emblems';
import {
  BLUE_CRYSTAL,
  BLUE_FOUNTAIN,
  BRAWL_TURRETS,
  createJungleCampSpecs,
  CYCLONE_EYES,
  FLYING_CLOUD_BLUE,
  FOUR_SKILL_HERO_META,
  getRiverCurrentSpeedBonus,
  isFourSkillHero,
  isPointInBush,
  LANE_WAYPOINTS,
  MAP_TURRETS,
  MLBB_TIMERS,
  RED_CRYSTAL,
  RED_FOUNTAIN,
  WORLD_SIZE
} from '../data/mapData';
import {
  applyAntiHealReduction,
  applyAttackSpeedCap,
  applyMoveSpeedSoftCap,
  clamp,
  computeCriticalMultiplier,
  computeDeathRecapBreakdown,
  computeMatchRatingAndMedal,
  computeTurretRampMultiplier,
  dist,
  getCcPriority,
  isMovementBlockingCc,
  resolveUniqueItemPassives
} from './CombatMath';
import {
  applyCcToHero,
  castBattleSpell,
  castHeroSkill,
  computeMitigatedHeroDamage,
  resolveWallCollision,
  SimCallbacks,
  SimHero,
  SimJungleMob,
  SimMinion,
  SimProjectile,
  SimTempWall,
  SimTurret,
  SimVfx,
  SkillCastContext
} from './SkillPhysics';
import { stepPart4HeroPassives } from './HeroKitsPart1';
import { stepPart5HeroPassives } from './HeroKitsPart2';
import {
  appendEquipmentHudBuffs,
  applyDefensiveItemAndTalentMitigation,
  applyEquipmentAndTalentStatMods,
  applyLowHpDefensiveTriggers,
  applyPostHitOffensiveTriggers,
  checkSkyPiercerExecute,
  computeHealOrShieldAmpMultiplier,
  computeOffensiveItemAndTalentMods,
  getEffectiveAttackRange,
  getJungleDamageMultiplier,
  getSpellOrActiveCdMultiplier,
  onHeroDeathEquipHooks,
  onHeroKillOrAssistEquipHooks,
  onMinionKillEquipHooks,
  stepEquipmentAndTalentTimers,
  triggerSupportHealOrShieldHooks
} from './EquipmentCombatEngine';
import { getDamageNumberStyle } from './VfxSystem';
import { stepAiHero } from './AIBotController';
import { selectAutoDirectorHero } from './SmartAiBrain';
import { RenderAimPreview, renderBattlefield, renderMinimap, RenderPing, RenderSceneState, RenderWisp } from './Renderer';
import { mlbbAudio } from './AudioEngine';
import { MlbbVisionSystem, VisionUpdateResult } from './VisionSystem';
import { MlbbPingSystem, PingContextEntities, PingPreviewResult } from './PingSystem';
import { ThreeBattlefieldRenderer } from './ThreeBattlefieldRenderer';
import { MLBB_3D_CAMERA_YAW } from './ThreeHeroModels';
import {
  computeEarlyLaneMinionRewards,
  computeOuterTurretPlateDamage,
  computeTurretRingState,
  createInitialBrawlShrines,
  createWalkieGrassWard,
  selectWeakestEnemyLane,
  SimBrawlShrine,
  SimCrystalShatter,
  SimWalkieGrass,
  stepWalkieGrassWards
} from './BattlefieldSystems';

export class MlbbGameEngine {
  private canvas: HTMLCanvasElement;
  private minimapCanvas: HTMLCanvasElement | null = null;
  private extraMinimapCanvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D;
  private config: MlbbMatchLaunchConfig;
  private settings: MlbbSettingsState;
  private onHudUpdate: (snap: MlbbHudSnapshot) => void;
  private onMatchEnd: (record: MlbbMatchRecord) => void;

  private rafId: number | null = null;
  private lastTs = 0;
  private running = false;
  private paused = false;
  private matchEnded = false;

  private matchTimeSec = 0;
  private fps = 60;
  private fpsFrames = 0;
  private fpsAccum = 0;
  private hudEmitAccum = 0;
  private passiveGoldAccum = 0;
  private nextMinionWaveSec = MLBB_TIMERS.MINION_FIRST_SPAWN;
  private outerShieldExpired = false;

  private expLane: 'top' | 'bot';
  private goldLane: 'top' | 'bot';
  private isBrawl: boolean;

  private heroes: SimHero[] = [];
  private minions: SimMinion[] = [];
  private turrets: SimTurret[] = [];
  private jungleMobs: SimJungleMob[] = [];
  private projectiles: SimProjectile[] = [];
  private vfxs: SimVfx[] = [];
  private tempWalls: SimTempWall[] = [];
  private wisps: RenderWisp[] = [];
  private walkieGrasses: SimWalkieGrass[] = [];
  private brawlShrines: SimBrawlShrine[] = [];
  private pings: RenderPing[] = [];
  private cycloneCds: Record<string, number> = {};
  private campSlainShortcut: Record<string, number> = {};
  private flyingCloudCd = 0;
  private fountainLaserCd = { blue: 0, red: 0 };
  private crystalShatter: SimCrystalShatter | null = null;

  private blueKills = 0;
  private redKills = 0;
  private firstBloodClaimed = false;
  private entitySeq = 1;
  private chatSeq = 1;

  private camX = BLUE_FOUNTAIN.x + 260;
  private camY = BLUE_FOUNTAIN.y - 260;
  private freePanOffsetX = 0;
  private freePanOffsetY = 0;
  private minimapCamFocus: { x: number; y: number } | null = null;
  private spectateTargetId: string | null = null;
  private shakeTimer = 0;

  // Vision & Tactical Ping Systems
  private visionSystem = new MlbbVisionSystem();
  private pingSystem = new MlbbPingSystem();
  private lastVision: VisionUpdateResult = {
    blueVisionCircles: [],
    redVisionCircles: [],
    visibleEnemyIds: new Set<string>(),
    spottedAllyIds: new Set<string>(),
    fogGhosts: []
  };
  private playerTurretAlert: 'none' | 'safe' | 'warn' | 'locked' = 'none';
  private turretBeepCd = 0;
  private prevPlayerBushSpotted = false;

  // Player live inputs
  private moveX = 0;
  private moveY = 0;
  private holdingAttack = false;
  private attackMode: 'hero' | 'minion' | 'turret' = 'hero';
  private lockedTargetId: string | null = null;
  private aimPreview: RenderAimPreview = {
    active: false,
    slot: 1,
    angle: 0,
    dist: 240,
    range: 420,
    radius: 100,
    shape: 'line',
    cancelHover: false
  };

  // Announcer, Chat, Tracked Enemy Battle Spells & Animated 5-Slot Surrender Vote
  private announcer: MlbbHudSnapshot['announcer'] = null;
  private objectiveBanner: string | null = null;
  private objectiveBannerTtl = 0;
  private chatFeed: MlbbHudSnapshot['chatFeed'] = [];
  private trackedEnemySpells: Record<
    string,
    {
      heroId: string;
      heroName: string;
      spellId: MlbbSpellId;
      spellName: string;
      spellIcon: string;
      remainingSec: number;
      maxSec: number;
    }
  > = {};
  private surrenderVote: MlbbHudSnapshot['surrenderVote'] = null;
  private surrenderElapsedSec = 0;
  private surrenderResolveDelay = 0;
  private surrenderSchedule: { slotIdx: number; atSec: number; vote: 'yes' | 'no'; applied: boolean }[] = [];

  // Practice cheats & 4-Skill / Spectator / 3D Renderer state
  private cheatNoCooldown = false;
  private cheatGodMode = false;
  private cheatTurretsInvincible = false;
  private playerSkill4Cd = 0;
  private timeScale: 1 | 2 | 4 = 1;
  private autoDirector = true;
  private autoDirectorTimer = 0;
  private dummyDamageEvents: { time: number; amount: number }[] = [];
  private dummyTotalDmg = 0;
  private dummyLastHit = 0;
  private dummyPeakBurst = 0;
  private threeRenderer: ThreeBattlefieldRenderer | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    config: MlbbMatchLaunchConfig,
    settings: MlbbSettingsState,
    onHudUpdate: (snap: MlbbHudSnapshot) => void,
    onMatchEnd: (record: MlbbMatchRecord) => void
  ) {
    this.canvas = canvas;
    const c = canvas.getContext('2d');
    if (!c) throw new Error('Canvas 2D context unavailable');
    this.ctx = c;
    this.config = config;
    this.settings = settings;
    this.onHudUpdate = onHudUpdate;
    this.onMatchEnd = onMatchEnd;

    this.isBrawl = config.mode === 'brawl';
    this.expLane = Math.random() < 0.5 ? 'top' : 'bot';
    this.goldLane = this.expLane === 'top' ? 'bot' : 'top';

    mlbbAudio.setVolumes(settings.sound);
    this.initWorld();
  }

  public attachThreeContainer(host: HTMLElement | null): void {
    if (this.threeRenderer) {
      this.threeRenderer.dispose();
      this.threeRenderer = null;
    }
    if (!host) return;
    try {
      this.threeRenderer = new ThreeBattlefieldRenderer(host);
    } catch {
      this.threeRenderer = null;
    }
  }

  public setTimeScale(scale: 1 | 2 | 4): void {
    this.timeScale = scale;
  }

  public setAutoDirector(enabled: boolean): void {
    this.autoDirector = enabled;
    if (enabled && this.config.isSpectator) {
      const pick = selectAutoDirectorHero(this.heroes, this.jungleMobs, this.matchTimeSec);
      if (pick) this.spectateTargetId = pick;
    }
  }

  public attachMinimapCanvas(canvas: HTMLCanvasElement | null): void {
    this.minimapCanvas = canvas;
  }

  public attachExtraMinimapCanvas(canvas: HTMLCanvasElement | null): void {
    this.extraMinimapCanvas = canvas;
  }

  public updateSettings(next: MlbbSettingsState): void {
    this.settings = next;
    mlbbAudio.setVolumes(next.sound);
  }

  public setPaused(p: boolean): void {
    this.paused = p;
  }

  private initWorld(): void {
    // 1. Spawn Turrets & Crystals
    const goldenVariant = this.config.mapVariant === 'golden_turret';
    const turretList = this.isBrawl ? BRAWL_TURRETS : MAP_TURRETS;
    this.turrets = turretList.map((t) => ({
      id: t.id,
      team: t.team,
      lane: t.lane,
      tier: t.tier,
      x: t.x,
      y: t.y,
      hp: t.tier === 1 ? 4500 : t.tier === 2 ? 5200 : 6000,
      maxHp: t.tier === 1 ? 4500 : t.tier === 2 ? 5200 : 6000,
      shieldHp: t.tier === 1 ? 1500 : 0,
      maxShieldHp: t.tier === 1 ? 1500 : 0,
      plateDamageAccum: 0,
      lastDamagedSec: -99,
      atk: t.tier === 1 ? 320 : t.tier === 2 ? 360 : 410,
      range: 340,
      atkCd: 0,
      targetId: null,
      consecutiveHeroHits: 0,
      hitFlashTimer: 0,
      alive: true,
      golden: goldenVariant && t.tier >= 2
    }));

    // Crystals (tier 4) — 8,500 HP + 1,200 regenerating out-of-combat shield
    this.turrets.push(
      {
        id: 'blue_crystal',
        team: 'blue',
        lane: 'crystal',
        tier: 4,
        x: BLUE_CRYSTAL.x,
        y: BLUE_CRYSTAL.y,
        hp: 8500,
        maxHp: 8500,
        shieldHp: 1200,
        maxShieldHp: 1200,
        plateDamageAccum: 0,
        lastDamagedSec: -99,
        atk: 450,
        range: 370,
        atkCd: 0,
        targetId: null,
        consecutiveHeroHits: 0,
        hitFlashTimer: 0,
        alive: true,
        golden: goldenVariant
      },
      {
        id: 'red_crystal',
        team: 'red',
        lane: 'crystal',
        tier: 4,
        x: RED_CRYSTAL.x,
        y: RED_CRYSTAL.y,
        hp: 8500,
        maxHp: 8500,
        shieldHp: 1200,
        maxShieldHp: 1200,
        plateDamageAccum: 0,
        lastDamagedSec: -99,
        atk: 450,
        range: 370,
        atkCd: 0,
        targetId: null,
        consecutiveHeroHits: 0,
        hitFlashTimer: 0,
        alive: true,
        golden: goldenVariant
      }
    );

    // Brawl Healing Shrines (2 periodic side bridge alcoves)
    this.brawlShrines = this.isBrawl ? createInitialBrawlShrines() : [];

    // 2. Spawn Jungle Camps (disabled in Brawl)
    if (!this.isBrawl) {
      this.jungleMobs = createJungleCampSpecs(this.expLane).map((spec) => ({
        id: spec.id,
        kind: spec.kind,
        teamSide: spec.teamSide,
        name: spec.name,
        icon: spec.icon,
        homeX: spec.x,
        homeY: spec.y,
        x: spec.x,
        y: spec.y,
        hp: spec.baseHp,
        maxHp: spec.baseHp,
        atk: spec.baseAtk,
        atkCd: 0,
        gold: spec.gold,
        exp: spec.exp,
        leashRadius: spec.leashRadius,
        color: spec.color,
        alive: false,
        respawnTimer: spec.firstSpawnSec,
        firstSpawnSec: spec.firstSpawnSec,
        respawnSec: spec.respawnSec,
        spawnedOnce: false,
        patience: 100,
        aggroTargetId: null,
        resetting: false,
        hitFlashTimer: 0,
        lordStage: 1
      }));
    }

    // 3. Revealing Wisps (2026 Variant)
    if (this.config.mapVariant === 'revealing_wisps' && !this.isBrawl) {
      this.wisps = [
        { x: 1400, y: 2000, radius: 190 },
        { x: 2600, y: 2000, radius: 190 }
      ];
    }

    // 4. Spawn 10 Heroes (or 1v1 in Practice)
    const spawnTeam = (list: MlbbMatchLaunchConfig['blueTeam'], team: 'blue' | 'red') => {
      const base = team === 'blue' ? BLUE_FOUNTAIN : RED_FOUNTAIN;
      list.forEach((slot, idx) => {
        const def = getMlbbHeroById(slot.heroId);
        const skin = slot.isPlayer
          ? def.skins.find((s) => s.id === this.config.playerSkinId) ?? def.skins[0]
          : def.skins[0];
        const ang = (idx / Math.max(1, list.length)) * Math.PI * 2;
        const startX = base.x + Math.cos(ang) * 95 + (team === 'blue' ? 90 : -90);
        const startY = base.y + Math.sin(ang) * 95 + (team === 'blue' ? -90 : 90);
        const hero: SimHero = {
          id: `${team}_${idx}_${def.id}`,
          name: slot.name,
          team,
          heroDef: def,
          skinColor: skin?.color ?? def.primaryColor,
          skinAccent: skin?.accent ?? def.accentColor,
          lane: slot.lane,
          role: def.role,
          isPlayer: slot.isPlayer,
          x: startX,
          y: startY,
          vx: 0,
          vy: 0,
          facing: team === 'blue' ? -Math.PI / 4 : (3 * Math.PI) / 4,
          radius: 30,
          level: this.isBrawl ? 3 : 1,
          xp: 0,
          xpToNext: 260,
          skillPoints: this.isBrawl ? 3 : 1,
          skillLevels: [0, 0, 0],
          skillCds: [0, 0, 0],
          spellId: slot.spellId,
          spellCd: 0,
          emblemId: slot.emblemId,
          talents: slot.isPlayer ? this.config.playerTalents : { t1: 'thrill', t2: 'tenacity', t3: 'lethal_ignition' },
          hp: def.baseHp,
          maxHp: def.baseHp,
          hpTrail: def.baseHp,
          shield: 0,
          mana: def.baseMana,
          maxMana: def.baseMana,
          gold: this.isBrawl ? 1200 : 300,
          totalGold: this.isBrawl ? 1200 : 300,
          kills: 0,
          deaths: 0,
          assists: 0,
          streak: 0,
          multiKill: 0,
          multiKillTimer: 0,
          alive: true,
          respawnTimer: 0,
          atkCd: 0,
          hitFlashTimer: 0,
          inBush: false,
          revealedTimer: 0,
          spottedByEnemy: false,
          recentlyAttackedTimer: 0,
          recalling: false,
          recallTimer: 0,
          recallCd: 0,
          regenCd: 0,
          regenTimer: 0,
          activeItemCd: 0,
          emoteCd: 0,
          activeEmote: null,
          items: [],
          blessingId: null,
          prioritizedItemId: null,
          activeBuildIdx: 0,
          buildPlan: slot.isPlayer && this.config.playerBuild.length > 0 ? [...this.config.playerBuild] : [...def.recommendedBuild],
          junglerStacks: 0,
          roamGold: 0,
          isJungler: slot.lane === 'Jungle' || slot.spellId === 'retribution',
          isRoamer: slot.lane === 'Roam',
          ccType: null,
          ccTimer: 0,
          ccPriority: 0,
          ccImmuneTimer: 0,
          untargetableTimer: 0,
          physImmuneTimer: 0,
          stealthTimer: 0,
          speedBoostPct: 0,
          speedBoostTimer: 0,
          slowPct: 0,
          slowTimer: 0,
          antiHealTimer: 0,
          defShredFlat: 0,
          defShredTimer: 0,
          passiveStacks: 0,
          passiveTimer: 0,
          passiveCd: 0,
          immortalityCd: 0,
          markedTimer: 0,
          markedBy: null,
          recastSlot: null,
          recastTimer: 0,
          attachedAllyId: null,
          attachedTimer: 0,
          tetherTargetId: null,
          tetherTimer: 0,
          tetherKind: null,
          orbitBlades: 0,
          orbitTimer: 0,
          orangeBuffTimer: 0,
          purpleBuffTimer: 0,
          turtleBuffTimer: 0,
          turtleKillerBuffTimer: 0,
          turtleShieldRefreshAccum: 0,
          goldCrabBuffTimer: 0,
          goldCrabTickAccum: 0,
          evolvedLordAuraTimer: 0,
          bushParticleAccum: 0,
          justRespawnedCloudReady: false,
          windChantTimer: 0,
          winterCrownTimer: 0,
          vengeanceTimer: 0,
          inspireTimer: 0,
          outOfCombatTimer: 5,
          castWindup: 0,
          castBackswing: 0,
          castColor: def.accentColor,
          dashVx: 0,
          dashVy: 0,
          dashTimer: 0,
          dashWallCross: false,
          leapZ: 0,
          leapTimer: 0,
          leapDuration: 0,
          modelScale: 1.0,
          deathImmuneTimer: 0,
          eggFormTimer: 0,
          blindedTimer: 0,
          wallPhaseTimer: 0,
          carDriveTimer: 0,
          beatrixGunIdx: 0,
          julianCastCount: 0,
          carmillaLinkIds: [],
          carmillaLinkTimer: 0,
          harleyRingTimer: 0,
          harleyRingDamage: 0,
          harleyRingCasterId: null,
          glooAttachTargetId: null,
          glooAttachTimer: 0,
          kaditaHealBank: 0,
          kaditaHealTimer: 0,
          fredrinnGreyHp: 0,
          toggleAuraTimer: 0,
          toggleAuraKind: null,
          snapbackAnchor: null,
          hiraraPrisms: [],
          tauntTargetId: null,
          physAtk: def.basePhysAtk,
          magicPow: def.baseMagicPow,
          physDef: def.basePhysDef,
          magicDef: def.baseMagicDef,
          flatPhysPen: 0,
          pctPhysPen: 0,
          flatMagicPen: 0,
          pctMagicPen: 0,
          atkSpd: def.baseAtkSpd,
          critChance: 0,
          critDmgPct: 1.75,
          cdrPct: 0,
          moveSpd: def.baseMoveSpd,
          lifestealPct: 0,
          spellVampPct: 0,
          ccResPct: 0,
          hpRegen: 8,
          damageDealt: 0,
          damageTaken: 0,
          turretDamage: 0,
          recentDamagers: {},
          aiState: 'lane',
          aiTimer: 0.4,
          aiTargetX: startX,
          aiTargetY: startY,
          turretHitsOnMe: 0,
          turretHitResetTimer: 0,
          damageLog: [],
          ccLog: [],
          lastDeathRecap: null,
          potionBuffTimer: 0,
          potionBuffKind: null
        };
        this.recalcHeroStats(hero, true);
        this.heroes.push(hero);
      });
    };

    spawnTeam(this.config.blueTeam, 'blue');
    spawnTeam(this.config.redTeam, 'red');

    const p = this.getPlayer();
    if (p) {
      this.camX = p.x;
      this.camY = p.y;
    }

    this.pushAnnouncer(
      'WELCOME TO LAND OF DAWN',
      this.isBrawl ? 'BRAWL — ONE LANE CHAOS' : `EXP: ${this.expLane.toUpperCase()} · GOLD: ${this.goldLane.toUpperCase()}`,
      '#F5C451'
    );
    this.pushChat('System', 'sys', '5 seconds till the enemy reaches the battlefield! Smash them!');
  }

  public start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTs = performance.now();
    const tick = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTs) / 1000));
      this.lastTs = now;

      this.fpsFrames++;
      this.fpsAccum += dt;
      if (this.fpsAccum >= 0.5) {
        this.fps = Math.round(this.fpsFrames / this.fpsAccum);
        this.fpsFrames = 0;
        this.fpsAccum = 0;
      }

      if (!this.paused && !this.matchEnded) {
        const steps = this.timeScale;
        for (let s = 0; s < steps; s++) {
          this.stepSimulation(dt);
          if (this.matchEnded) break;
        }
        if (this.config.isSpectator && this.autoDirector) {
          this.autoDirectorTimer -= dt;
          if (this.autoDirectorTimer <= 0) {
            this.autoDirectorTimer = 2.0;
            const pick = selectAutoDirectorHero(this.heroes, this.jungleMobs, this.matchTimeSec);
            if (pick) this.spectateTargetId = pick;
          }
        }
      }
      this.renderFrame();

      this.hudEmitAccum += dt;
      if (this.hudEmitAccum >= 0.066) {
        this.hudEmitAccum = 0;
        this.onHudUpdate(this.buildHudSnapshot());
      }

      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  public destroy(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.threeRenderer) {
      this.threeRenderer.dispose();
      this.threeRenderer = null;
    }
  }

  private getPlayer(): SimHero | undefined {
    return this.heroes.find((h) => h.isPlayer);
  }

  private recalcHeroStats(h: SimHero, refillHp = false): void {
    const def = h.heroDef;
    const lvlMinus = h.level - 1;
    const itemStats = aggregateMlbbItemStats(h.items, h.blessingId);
    const emblem = getMlbbEmblemById(h.emblemId);
    const t1 = MLBB_TALENTS.find((t) => t.id === h.talents.t1)?.stats;
    const t2 = MLBB_TALENTS.find((t) => t.id === h.talents.t2)?.stats;

    const sumStat = (k: keyof typeof itemStats) =>
      (itemStats[k] ?? 0) + (emblem.stats[k] ?? 0) + (t1?.[k] ?? 0) + (t2?.[k] ?? 0);
    const pctFrac = (v: number) => (v > 1 ? v / 100 : v);

    const prevMaxHp = h.maxHp;
    const uniquePassives = resolveUniqueItemPassives(h.items);
    const adaptive = sumStat('adaptiveAtk');
    const prefersMagic = def.role === 'Mage' || (def.role === 'Support' && def.baseMagicPow >= 0);
    const potionPhys = h.potionBuffTimer > 0 && h.potionBuffKind === 'power' ? 30 : 0;
    const potionMagic = h.potionBuffTimer > 0 && h.potionBuffKind === 'magic' ? 30 : 0;
    const potionHp = h.potionBuffTimer > 0 && h.potionBuffKind === 'rock' ? 500 : 0;
    const potionLifesteal = h.potionBuffTimer > 0 && h.potionBuffKind === 'power' ? 0.05 : 0;
    const potionCdr = h.potionBuffTimer > 0 && h.potionBuffKind === 'magic' ? 0.05 : 0;
    const potionCcRes = h.potionBuffTimer > 0 && h.potionBuffKind === 'rock' ? 0.15 : 0;

    const turtleBonusAtk = h.turtleKillerBuffTimer > 0 ? 25 + h.level * 3 : 0;
    const purpleBuffCdr = h.purpleBuffTimer > 0 ? 0.1 : 0;

    const rawMaxMana = Math.round(def.baseMana + def.manaGrowth * lvlMinus + sumStat('maxMana'));
    const hylosHpBonus = h.heroDef.id === 'hylos' ? Math.round(rawMaxMana * 1.5) : 0;
    const baratsBonusDef = h.heroDef.id === 'barats' ? h.passiveStacks * 4 : 0;
    const gatotBonusDef = h.heroDef.id === 'gatotkaca' ? Math.round((1 - h.hp / Math.max(1, h.maxHp)) * 90) : 0;

    h.maxHp = Math.round(def.baseHp + def.hpGrowth * lvlMinus + sumStat('maxHp') + potionHp + hylosHpBonus);
    h.maxMana = rawMaxMana;
    h.physAtk = Math.round(
      def.basePhysAtk + def.physAtkGrowth * lvlMinus + sumStat('physAtk') + (prefersMagic ? 0 : adaptive + turtleBonusAtk) + potionPhys
    );
    h.magicPow = Math.round(def.baseMagicPow + sumStat('magicPow') + (prefersMagic ? adaptive + turtleBonusAtk : 0) + potionMagic);
    h.physDef = Math.round(def.basePhysDef + def.physDefGrowth * lvlMinus + sumStat('physDef') + baratsBonusDef + gatotBonusDef);
    h.magicDef = Math.round(def.baseMagicDef + def.magicDefGrowth * lvlMinus + sumStat('magicDef') + baratsBonusDef);
    h.flatPhysPen = sumStat('flatPhysPen');
    h.pctPhysPen = pctFrac(sumStat('pctPhysPen'));
    h.flatMagicPen = sumStat('flatMagicPen');
    h.pctMagicPen = pctFrac(sumStat('pctMagicPen'));
    const rawAtkSpd =
      def.baseAtkSpd *
      (1 +
        lvlMinus * 0.03 +
        pctFrac(sumStat('atkSpdPct')) +
        (h.inspireTimer > 0 ? 0.55 : 0) +
        (h.heroDef.id === 'miya' ? h.passiveStacks * 0.05 : 0));
    h.atkSpd = applyAttackSpeedCap(rawAtkSpd, uniquePassives.hasGoldenStaff);
    h.critChance = Math.min(1, pctFrac(sumStat('critChance')) + (h.heroDef.id === 'bruno' ? h.passiveStacks * 0.02 : 0));
    h.critDmgPct = computeCriticalMultiplier(uniquePassives.hasBerserkersFury, pctFrac(sumStat('critDmgPct')));
    h.cdrPct = Math.min(uniquePassives.cdrCapPct / 100, pctFrac(sumStat('cdrPct')) + potionCdr + purpleBuffCdr);
    h.lifestealPct = pctFrac(sumStat('lifestealPct')) + potionLifesteal + (h.heroDef.id === 'alucard' && h.passiveTimer > 0 ? 0.25 : 0);
    h.spellVampPct = pctFrac(sumStat('spellVampPct'));
    h.ccResPct = Math.min(0.6, pctFrac(sumStat('ccResPct')) + potionCcRes);
    h.hpRegen = 8 + lvlMinus * 1.4 + sumStat('hpRegen');

    const rawMs =
      (def.baseMoveSpd + sumStat('moveSpd') + (h.heroDef.id === 'franco' && h.outOfCombatTimer >= 4 ? 32 : 0)) *
      (1 + pctFrac(sumStat('moveSpdPct')) + (h.speedBoostTimer > 0 ? h.speedBoostPct : 0)) *
      (1 - (h.slowTimer > 0 ? h.slowPct : 0));
    h.moveSpd = rawMs;

    const bonusPhys = sumStat('physAtk') + (prefersMagic ? 0 : adaptive);
    const bonusMag = sumStat('magicPow') + (prefersMagic ? adaptive : 0);
    const inRiverOrJungle = h.inBush || Math.abs(h.x - h.y) < 340;
    applyEquipmentAndTalentStatMods(h, bonusPhys, bonusMag, this.heroes, inRiverOrJungle);
    h.moveSpd = applyMoveSpeedSoftCap(h.moveSpd);

    if (refillHp) {
      h.hp = h.maxHp;
      h.hpTrail = h.maxHp;
      h.mana = h.maxMana;
    } else if (h.maxHp > prevMaxHp) {
      h.hp = Math.min(h.maxHp, h.hp + (h.maxHp - prevMaxHp));
    }
  }

  private getCallbacks(): SimCallbacks {
    return {
      dealDamageToHero: (attacker, target, rawDmg, dmgType, isBasic, isCrit, sourceName, bypassShield = false) => {
        if (!target.alive || target.untargetableTimer > 0 || (target.eggFormTimer ?? 0) > 0) return;
        if (target.isPlayer && this.cheatGodMode) return;

        // Gloo Head-Attach: transfers 80% of incoming damage to the enemy host!
        if (target.glooAttachTargetId && target.glooAttachTimer > 0 && sourceName !== 'Gloo Transfer') {
          const host = this.heroes.find((x) => x.id === target.glooAttachTargetId && x.alive);
          if (host) {
            this.getCallbacks().dealDamageToHero(attacker, host, rawDmg * 0.8, dmgType, false, false, 'Gloo Transfer');
            rawDmg *= 0.2;
          }
        }

        let adjRaw = rawDmg;
        // Evolved Lord (Stage 3) Damage Reduction Aura (-20% damage taken)
        if (target.evolvedLordAuraTimer > 0) adjRaw *= 0.8;
        // Layla Malefic Gun distance scaling (100% -> 130%)
        if (attacker && attacker.heroDef.id === 'layla' && isBasic) {
          const d = dist(attacker.x, attacker.y, target.x, target.y);
          adjRaw *= 1 + clamp((d - 220) / 500, 0, 0.3);
        }

        const cbRef = this.getCallbacks();
        let extraPctPen = 0;
        let ignoreFlatDef = 0;
        let bonusTrue = 0;
        let bonusMagic = 0;
        let bonusPhys = 0;
        if (attacker && sourceName !== 'Fountain Laser' && sourceName !== 'Burning Soul') {
          const off = computeOffensiveItemAndTalentMods(
            attacker,
            target,
            adjRaw,
            dmgType,
            Boolean(isBasic),
            Boolean(isCrit),
            this.heroes,
            cbRef
          );
          adjRaw = off.adjustedRaw;
          extraPctPen = dmgType === 'physical' ? off.extraPctPhysPen : off.extraPctMagicPen;
          ignoreFlatDef = off.ignoreFlatDef;
          bonusTrue = off.bonusTrueDmg;
          bonusMagic = off.bonusMagicDmg;
          bonusPhys = off.bonusPhysDmg;
        }

        let dmg = computeMitigatedHeroDamage(attacker, target, adjRaw, dmgType, extraPctPen, ignoreFlatDef);
        if (bonusPhys > 0) dmg += computeMitigatedHeroDamage(attacker, target, bonusPhys, 'physical', extraPctPen, ignoreFlatDef);
        if (bonusMagic > 0) dmg += computeMitigatedHeroDamage(attacker, target, bonusMagic, 'magic', extraPctPen, 0);
        if (bonusTrue > 0) dmg += bonusTrue;

        // Defensive Equipment Passives (Athena's, Radiant, Antique, Blade Armor, Twilight, Queen's Wings, Chastise, Vengeance)
        dmg = applyDefensiveItemAndTalentMitigation(attacker, target, dmg, dmgType, Boolean(isBasic), Boolean(isCrit), cbRef);

        // Post-Hit Offensive Triggers (Wishing Lantern Butterfly every 800 Magic Dmg & Lethal Ignition)
        if (attacker && dmg > 0 && sourceName !== 'Fountain Laser') {
          dmg += applyPostHitOffensiveTriggers(attacker, target, dmg, dmgType, cbRef);
        }

        // Orange Buff (Fiend): True Damage burn + 25% Slow on Basic Attack or Skill hit
        if (attacker && attacker.orangeBuffTimer > 0 && sourceName !== 'Fountain Laser') {
          const burnTrue = 30 + attacker.level * 4;
          dmg += burnTrue;
          target.slowPct = Math.max(target.slowPct, 0.25);
          target.slowTimer = Math.max(target.slowTimer, 1.5);
          this.vfxs.push({
            id: `v_${this.entitySeq++}`, kind: 'text', x: target.x + 14, y: target.y - 36,
            radius: 0, color: '#FDBA74', text: `+${burnTrue} 🔥`, ttl: 0.55, maxTtl: 0.55
          });
        }
        if (dmg <= 0) return;

        target.outOfCombatTimer = 0;
        target.hitFlashTimer = 0.055; // Crisp red/white hit-flash
        target.damageTaken += dmg;
        if (target.harleyRingTimer > 0) target.harleyRingDamage += dmg;
        if (target.heroDef.id === 'fredrinn') target.fredrinnGreyHp = Math.min(target.maxHp * 0.5, target.fredrinnGreyHp + dmg * 0.7);
        if (target.heroDef.id === 'kadita' && target.passiveCd <= 0) {
          if (target.kaditaHealTimer <= 0) {
            target.kaditaHealTimer = 4.0;
            target.passiveCd = 30;
          }
          target.kaditaHealBank += dmg;
        }
        if (attacker) {
          attacker.outOfCombatTimer = 0;
          attacker.recentlyAttackedTimer = Math.max(attacker.recentlyAttackedTimer, 1.5);
          attacker.damageDealt += dmg;
          target.recentDamagers[attacker.id] = this.matchTimeSec;
          if (attacker.items.some((id) => getMlbbItemById(id)?.antiHeal) || attacker.heroDef.id === 'baxia') {
            target.antiHealTimer = 3.0;
          }
          const vamp = isBasic ? attacker.lifestealPct : attacker.spellVampPct;
          if (vamp > 0) this.healHeroInternal(attacker, dmg * vamp);
          if (attacker.deathImmuneTimer > 0) this.healHeroInternal(attacker, dmg * 0.45);
          for (const t of this.turrets) {
            if (t.alive && t.team === target.team && dist(attacker.x, attacker.y, t.x, t.y) <= t.range) {
              t.targetId = attacker.id;
            }
          }
        }

        target.damageLog.push({
          attackerId: attacker ? attacker.id : 'environment',
          attackerName: attacker ? attacker.heroDef.name : 'Turret / Creep',
          heroId: attacker ? attacker.heroDef.id : 'environment',
          sourceName: sourceName ?? (isBasic ? 'Basic Attack' : attacker ? 'Skill' : 'Turret Shot'),
          damageType: dmgType,
          amount: dmg,
          timeSec: this.matchTimeSec
        });
        if (target.damageLog.length > 48) target.damageLog.splice(0, target.damageLog.length - 48);

        // Absorb with shield first (unless Esmeralda shield bypass!)
        let rem = dmg;
        if (!bypassShield && target.shield > 0) {
          const used = Math.min(target.shield, rem);
          target.shield -= used;
          rem -= used;
        }
        if (rem > 0) {
          target.recalling = false;
          if (attacker !== null || sourceName === 'Turret Shot' || sourceName === 'Fountain Laser' || !sourceName) {
            target.regenTimer = 0;
          }
        }
        if (target.isTrainingDummy) {
          target.hp = Math.max(1, target.hp - rem);
          if (target.hp < target.maxHp * 0.15) target.hp = target.maxHp;
          this.dummyTotalDmg += dmg;
          this.dummyLastHit = dmg;
          this.dummyPeakBurst = Math.max(this.dummyPeakBurst, dmg);
          this.dummyDamageEvents.push({ time: this.matchTimeSec, amount: dmg });
          if (this.dummyDamageEvents.length > 120) this.dummyDamageEvents.shift();
        } else {
          target.hp -= rem;
        }

        // Layer 5 Floating Damage Number
        const style = getDamageNumberStyle(dmgType, Boolean(isCrit), 'damage');
        this.vfxs.push({
          id: `v_${this.entitySeq++}`, kind: 'text',
          x: target.x + (Math.random() - 0.5) * 26, y: target.y - 24,
          radius: 0, color: style.color, text: isCrit ? `${dmg}!` : `${dmg}`,
          ttl: 0.68, maxTtl: 0.68, isCrit: Boolean(isCrit)
        });

        // Carmilla Ult Curse of Blood: propagate 60% damage to linked enemies!
        if (target.carmillaLinkTimer > 0 && target.carmillaLinkIds.length > 0 && sourceName !== 'Curse of Blood Link') {
          for (const lid of target.carmillaLinkIds) {
            const linkedHero = this.heroes.find((x) => x.id === lid && x.alive);
            if (linkedHero) {
              this.getCallbacks().dealDamageToHero(attacker, linkedHero, dmg * 0.6, dmgType, false, false, 'Curse of Blood Link');
            }
          }
        }

        // Johnson Electro-Airbag (<30% HP mega shield)
        if (target.heroDef.id === 'johnson' && target.hp > 0 && target.hp / target.maxHp <= 0.3 && target.passiveCd <= 0) {
          target.passiveCd = 90;
          this.grantShieldInternal(target, 500 + target.physDef * 5);
        }

        // Argus 4s Eternal Evil Death Immunity: HP cannot drop below 1!
        if (target.deathImmuneTimer > 0 && target.hp <= 0) {
          target.hp = 1;
          return;
        }

        // Low-HP Reactive Equipment Passives (Rose Gold Lifeline, Chastise Redemption, CoD Gift)
        applyLowHpDefensiveTriggers(target, cbRef);

        // Sky Piercer stacking execute (4%–12% HP)
        checkSkyPiercerExecute(attacker, target, cbRef);

        // Aurora Passive: Pride of Ice (fatal hit -> 1.5s untargetable Ice Freeze survival!)
        if (target.hp <= 0 && target.heroDef.id === 'aurora' && target.passiveCd <= 0) {
          target.hp = Math.round(target.maxHp * 0.16);
          target.passiveCd = 150;
          target.winterCrownTimer = 1.5;
          target.untargetableTimer = 1.5;
          this.vfxs.push({ id: `v_${this.entitySeq++}`, kind: 'burst', x: target.x, y: target.y, radius: 110, color: '#38BDF8', ttl: 0.85, maxTtl: 0.85 });
          return;
        }

        // Nana Passive: Molina's Gift fatal damage save (150s CD)
        if (target.hp <= 0 && target.heroDef.id === 'nana' && target.passiveCd <= 0) {
          target.hp = Math.round(target.maxHp * 0.14);
          target.passiveCd = 150;
          target.untargetableTimer = 2.0;
          target.speedBoostPct = 0.7;
          target.speedBoostTimer = 2.0;
          this.vfxs.push({ id: `v_${this.entitySeq++}`, kind: 'ring', x: target.x, y: target.y, radius: 90, color: '#F472B6', ttl: 0.7, maxTtl: 0.7 });
          return;
        }

        // Immortality Revive (210s CD)
        if (target.hp <= 0 && target.items.includes('immortality') && target.immortalityCd <= 0) {
          target.hp = Math.round(target.maxHp * 0.2);
          this.grantShieldInternal(target, 450);
          target.immortalityCd = 210;
          target.untargetableTimer = 1.6;
          this.vfxs.push({ id: `v_${this.entitySeq++}`, kind: 'ring', x: target.x, y: target.y, radius: 105, color: '#FACC15', ttl: 1.0, maxTtl: 1.0 });
          return;
        }

        if (target.hp <= 0) {
          this.handleHeroDeath(target, attacker);
        }
      },
      dealDamageToMinion: (attacker, minion, rawDmg) => {
        if (!minion.alive) return;
        const dmg = Math.max(1, Math.round(rawDmg));
        minion.hp -= dmg;
        minion.hitFlashTimer = 0.04;
        if (minion.hp <= 0) {
          minion.alive = false;
          if (attacker) {
            this.grantGoldAndXp(attacker, minion.gold, minion.exp, minion.x, minion.y);
            // Purple Buff heals +3% Max HP on minion kill
            if (attacker.purpleBuffTimer > 0) {
              this.healHeroInternal(attacker, attacker.maxHp * 0.03);
            }
            onMinionKillEquipHooks(attacker, this.getCallbacks());
            if (attacker.isPlayer) mlbbAudio.playGold();
          }
        }
      },
      dealDamageToJungle: (attacker, mob, rawDmg) => {
        if (!mob.alive) return;
        const dmg = Math.max(1, Math.round(rawDmg * getJungleDamageMultiplier(attacker)));
        mob.hp -= dmg;
        mob.hitFlashTimer = 0.04;
        if (attacker) mob.aggroTargetId = attacker.id;
        if (mob.hp <= 0) {
          this.handleJungleSlain(mob, attacker);
        }
      },
      dealDamageToTurret: (attacker, turret, rawDmg) => {
        if (!turret.alive) return;
        if (this.cheatTurretsInvincible) return;
        turret.lastDamagedSec = this.matchTimeSec;
        // Turret backdoor protection when no opposing minions are nearby
        const hasMinions = this.minions.some(
          (m) => m.alive && m.team !== turret.team && dist(m.x, m.y, turret.x, turret.y) < turret.range + 40
        );
        const mult = hasMinions ? 1.0 : 0.35;
        const preShieldDmg = Math.max(1, Math.round(rawDmg * mult * (turret.golden ? 0.85 : 1)));
        turret.hitFlashTimer = 0.04;

        // Tier 1 Outer Turret Energy Shield (00:00–05:00): 50% mitigation + +40g per 300 plate broken
        if (turret.tier === 1 && turret.shieldHp > 0 && this.matchTimeSec < MLBB_TIMERS.OUTER_SHIELD_EXPIRE) {
          const plate = computeOuterTurretPlateDamage(
            preShieldDmg,
            true,
            turret.shieldHp,
            turret.plateDamageAccum,
            this.matchTimeSec
          );
          turret.shieldHp = plate.nextShieldHp;
          turret.plateDamageAccum = plate.nextPlateAccum;
          if (attacker) attacker.turretDamage += plate.finalDamage;
          if (plate.plateGoldAward > 0) {
            const attackTeam = attacker ? attacker.team : turret.team === 'red' ? 'blue' : 'red';
            const nearbyAllies = this.heroes.filter(
              (h) => h.alive && h.team === attackTeam && dist(h.x, h.y, turret.x, turret.y) <= 460
            );
            const recipients = nearbyAllies.length > 0 ? nearbyAllies : attacker ? [attacker] : [];
            for (const r of recipients) {
              this.grantGoldAndXp(r, plate.plateGoldAward, 0, turret.x, turret.y);
              if (r.isPlayer) mlbbAudio.playGold();
            }
            this.vfxs.push({
              id: `v_${this.entitySeq++}`,
              kind: 'text',
              x: turret.x,
              y: turret.y - 46,
              radius: 0,
              color: '#38BDF8',
              text: `+${plate.plateGoldAward}g PLATE`,
              ttl: 0.9,
              maxTtl: 0.9
            });
          }
          turret.hp -= plate.finalDamage;
        } else if (turret.tier === 4 && turret.shieldHp > 0) {
          // Base Crystal regenerating energy shield absorbs damage first
          if (attacker) attacker.turretDamage += preShieldDmg;
          const used = Math.min(turret.shieldHp, preShieldDmg);
          turret.shieldHp -= used;
          const rem = preShieldDmg - used;
          if (rem > 0) turret.hp -= rem;
        } else {
          if (attacker) attacker.turretDamage += preShieldDmg;
          turret.hp -= preShieldDmg;
        }

        if (turret.hp <= 0) {
          this.handleTurretDestroyed(turret, attacker);
        }
      },
      applyCc: (target, ccType, duration, caster) => {
        const applied = applyCcToHero(target, ccType, duration, this.matchTimeSec);
        if (applied && ccType === 'taunt' && caster) {
          target.tauntTargetId = caster.id;
        }
        // Carmilla Curse of Blood CC link propagation
        if (applied && target.carmillaLinkTimer > 0 && target.carmillaLinkIds.length > 0) {
          for (const lid of target.carmillaLinkIds) {
            const linkedHero = this.heroes.find((x) => x.id === lid && x.alive);
            if (linkedHero) applyCcToHero(linkedHero, ccType, duration * 0.65, this.matchTimeSec);
          }
        }
      },
      spawnVfx: (vfx) => {
        this.vfxs.push({ ...vfx, id: `v_${this.entitySeq++}` });
      },
      spawnProjectile: (proj) => {
        this.projectiles.push({ ...proj, id: `p_${this.entitySeq++}`, hitIds: new Set() });
      },
      healHero: (target, amount, source, bypassAntiHeal = false) => {
        this.healHeroInternal(target, amount, bypassAntiHeal, source);
      },
      grantShield: (target, amount, bypassAntiHeal = false) => {
        this.grantShieldInternal(target, amount, bypassAntiHeal);
      },
      announce: (text, sub, color) => {
        this.pushAnnouncer(text, sub, color);
      },
      triggerGlobalReveal: (forTeam, durationSec) => {
        this.visionSystem.triggerGlobalReveal(forTeam, durationSec);
      },
      triggerGlobalBlind: (enemyTeam, durationSec) => {
        for (const h of this.heroes) {
          if (h.alive && h.team === enemyTeam) {
            h.blindedTimer = Math.max(h.blindedTimer, durationSec);
          }
        }
      },
      spawnTempWall: (wall) => {
        this.tempWalls.push(wall);
        if (this.tempWalls.length > 6) this.tempWalls.shift();
      }
    };
  }

  private healHeroInternal(target: SimHero, rawAmount: number, bypassAntiHeal = false, source?: SimHero): void {
    if (!target.alive) return;
    const amped = rawAmount * computeHealOrShieldAmpMultiplier(target, true);
    const amt = applyAntiHealReduction(amped, target.antiHealTimer > 0, bypassAntiHeal);
    if (amt <= 0) return;
    target.hp = Math.min(target.maxHp, target.hp + amt);
    this.vfxs.push({
      id: `v_${this.entitySeq++}`, kind: 'text', x: target.x, y: target.y - 26,
      radius: 0, color: '#2CE58B', text: `+${amt}`, ttl: 0.6, maxTtl: 0.6
    });
    if (source && source.id !== target.id) {
      triggerSupportHealOrShieldHooks(source, target, this.heroes, this.getCallbacks());
    }
  }

  private grantShieldInternal(target: SimHero, rawAmount: number, bypassAntiHeal = false): void {
    if (!target.alive) return;
    const amped = rawAmount * computeHealOrShieldAmpMultiplier(target, false);
    const amt = applyAntiHealReduction(amped, target.antiHealTimer > 0, bypassAntiHeal);
    if (amt <= 0) return;
    target.shield += amt;
    this.vfxs.push({
      id: `v_${this.entitySeq++}`, kind: 'text', x: target.x + 12, y: target.y - 34,
      radius: 0, color: '#38BDF8', text: `+${amt} 🛡️`, ttl: 0.6, maxTtl: 0.6
    });
  }

  private grantGoldAndXp(hero: SimHero, gold: number, xp: number, srcX: number, srcY: number): void {
    hero.gold += gold;
    hero.totalGold += gold;
    if (gold > 0) {
      this.vfxs.push({
        id: `v_${this.entitySeq++}`,
        kind: 'coin',
        x: srcX,
        y: srcY,
        radius: 0,
        color: '#FACC15',
        ttl: 0.5,
        maxTtl: 0.5
      });
    }
    if (xp > 0 && hero.level < 15) {
      hero.xp += xp;
      while (hero.xp >= hero.xpToNext && hero.level < 15) {
        hero.xp -= hero.xpToNext;
        hero.level++;
        hero.skillPoints++;
        hero.xpToNext = Math.round(hero.xpToNext * 1.24 + 90);
        this.recalcHeroStats(hero, false);
        if (hero.isPlayer) {
          mlbbAudio.playLevelUp();
          this.vfxs.push({
            id: `v_${this.entitySeq++}`,
            kind: 'ring',
            x: hero.x,
            y: hero.y,
            radius: 90,
            color: '#FACC15',
            ttl: 0.65,
            maxTtl: 0.65
          });
        }
      }
    }
  }

  private handleHeroDeath(victim: SimHero, killer: SimHero | null): void {
    if (victim.isPlayer) {
      victim.lastDeathRecap = computeDeathRecapBreakdown(
        victim.damageLog,
        this.matchTimeSec,
        killer ? killer.heroDef.name : 'Turret / Creep',
        killer ? killer.heroDef.id : 'environment',
        victim.ccLog
      );
      // Auto-select an alive ally to spectate while dead
      const aliveAlly = this.heroes.find((h) => h.team === victim.team && !h.isPlayer && h.alive);
      this.spectateTargetId = aliveAlly ? aliveAlly.id : null;
    }
    victim.damageLog = [];
    victim.ccLog = [];
    victim.alive = false;
    victim.hp = 0;
    victim.deaths++;
    victim.streak = 0;
    victim.recalling = false;
    victim.ccType = null;
    victim.respawnTimer = clamp(8 + victim.level * 2.2 + this.matchTimeSec / 50, 8, 45);
    // Diggie Passive: Young Again — enters roving untargetable Egg Form on death!
    if (victim.heroDef.id === 'diggie') {
      victim.eggFormTimer = victim.respawnTimer;
    }
    this.shakeTimer = victim.isPlayer || killer?.isPlayer ? 0.25 : 0.1;

    if (victim.team === 'blue') this.redKills++;
    else this.blueKills++;

    onHeroDeathEquipHooks(victim);
    const cbDeath = this.getCallbacks();
    // Grant Assists to recent damagers within 10s
    for (const [id, ts] of Object.entries(victim.recentDamagers)) {
      if (this.matchTimeSec - ts <= 10 && id !== killer?.id) {
        const assister = this.heroes.find((h) => h.id === id);
        if (assister) {
          assister.assists++;
          this.grantGoldAndXp(assister, 110, 140, victim.x, victim.y);
          onHeroKillOrAssistEquipHooks(assister, false, cbDeath);
        }
      }
    }
    victim.recentDamagers = {};

    if (killer) {
      killer.kills++;
      killer.streak++;
      if (killer.multiKillTimer > 0) killer.multiKill++;
      else killer.multiKill = 1;
      killer.multiKillTimer = 10;

      const bounty = 220 + Math.min(250, victim.level * 12);
      this.grantGoldAndXp(killer, bounty, 260, victim.x, victim.y);
      onHeroKillOrAssistEquipHooks(killer, true, cbDeath);
      // Purple Buff heals +8% Max HP on hero takedown; Balmond Bloodthirst heals 20% Max HP!
      if (killer.purpleBuffTimer > 0) {
        this.healHeroInternal(killer, killer.maxHp * 0.08);
      }
      if (killer.heroDef.id === 'balmond') {
        this.healHeroInternal(killer, killer.maxHp * 0.2);
      }

      let headline = `${killer.heroDef.name.toUpperCase()} SLAIN ${victim.heroDef.name.toUpperCase()}`;
      let intensity: 'normal' | 'kill' | 'epic' = 'kill';
      if (!this.firstBloodClaimed) {
        this.firstBloodClaimed = true;
        headline = 'FIRST BLOOD!';
        intensity = 'epic';
      } else if (killer.multiKill >= 5) {
        headline = 'SAVAGE!';
        intensity = 'epic';
      } else if (killer.multiKill === 4) {
        headline = 'MANIAC!';
        intensity = 'epic';
      } else if (killer.multiKill === 3) {
        headline = 'TRIPLE KILL!';
        intensity = 'epic';
      } else if (killer.multiKill === 2) {
        headline = 'DOUBLE KILL!';
        intensity = 'kill';
      } else if (killer.streak >= 5) {
        headline = 'LEGENDARY!';
        intensity = 'epic';
      }
      this.pushAnnouncer(headline, `${killer.heroDef.name} eliminated ${victim.heroDef.name}`, killer.team === 'blue' ? '#38BDF8' : '#EF4444');
      mlbbAudio.playAnnouncer(intensity);
    }
  }

  private handleJungleSlain(mob: SimJungleMob, killer: SimHero | null): void {
    mob.alive = false;
    mob.aggroTargetId = null;
    mob.patience = 100;
    mob.resetting = false;
    mob.x = mob.homeX;
    mob.y = mob.homeY;

    if (mob.kind === 'turtle') {
      mob.respawnTimer = this.matchTimeSec >= MLBB_TIMERS.TURTLE_STOP_SPAWN ? 99999 : MLBB_TIMERS.TURTLE_RESPAWN;
    } else if (mob.kind === 'lord') {
      mob.respawnTimer =
        this.matchTimeSec >= MLBB_TIMERS.LORD_STAGE2_TIME ? MLBB_TIMERS.LORD_RESPAWN_LATE : MLBB_TIMERS.LORD_RESPAWN_EARLY;
    } else if (mob.kind === 'crab') {
      mob.respawnTimer =
        this.matchTimeSec >= MLBB_TIMERS.CRAB_UPGRADE_TIME ? MLBB_TIMERS.CRAB_LARGE_RESPAWN : MLBB_TIMERS.CRAB_SMALL_RESPAWN;
    } else {
      mob.respawnTimer = mob.respawnSec;
    }

    if (!killer) return;
    this.grantGoldAndXp(killer, mob.gold, mob.exp, mob.x, mob.y);
    if (killer.isJungler) killer.junglerStacks++;

    if (mob.kind === 'orange_buff') {
      killer.orangeBuffTimer = MLBB_TIMERS.BUFF_DURATION;
    } else if (mob.kind === 'purple_buff') {
      killer.purpleBuffTimer = MLBB_TIMERS.BUFF_DURATION;
      this.campSlainShortcut[mob.id] = 30; // Opens Purple Buff shortcut wall for 30s
    } else if (mob.kind === 'litho') {
      const ward = createWalkieGrassWard(`wg_${this.entitySeq++}`, killer.team, mob.homeX, mob.homeY);
      this.walkieGrasses.push(ward);
      this.pushChat(
        killer.heroDef.name,
        killer.team,
        `Slain Lithowanderer — Walkie Grass now patrols Mid River (45s vision + speed + mana)!`
      );
      this.vfxs.push({
        id: `v_${this.entitySeq++}`,
        kind: 'ring',
        x: mob.homeX,
        y: mob.homeY,
        radius: 140,
        color: '#4ADE80',
        ttl: 0.8,
        maxTtl: 0.8
      });
    } else if (mob.kind === 'crab') {
      killer.goldCrabBuffTimer = MLBB_TIMERS.CRAB_GOLD_BUFF_DURATION;
      killer.goldCrabTickAccum = 0;
      this.vfxs.push({
        id: `v_${this.entitySeq++}`,
        kind: 'text',
        x: killer.x,
        y: killer.y - 38,
        radius: 0,
        color: '#FACC15',
        text: 'GOLD BUFF +10g/s!',
        ttl: 1.1,
        maxTtl: 1.1
      });
    } else if (mob.kind === 'turtle') {
      killer.turtleKillerBuffTimer = 60;
      killer.turtleShieldRefreshAccum = 0;
      killer.shield += 360 + killer.level * 35;
      for (const h of this.heroes) {
        if (h.team === killer.team && h.alive) {
          h.shield += 480 + h.level * 40;
          h.turtleBuffTimer = 60;
          this.grantGoldAndXp(h, 135, 160, h.x, h.y);
          if (this.config.mapVariant === 'healing_turtle') {
            this.healHeroInternal(h, h.maxHp * 0.35);
          }
        }
      }
      if (this.config.mapVariant === 'healing_turtle') {
        this.spawnSingleMinion(killer.team, 'mid', 'mini_turtle');
      }
      this.pushAnnouncer('TURTLE SLAIN!', `${killer.team.toUpperCase()} team gained Shield, Gold & Killer Buff!`, '#2CE58B');
      mlbbAudio.playAnnouncer('epic');
    } else if (mob.kind === 'lord') {
      const enemyTeam = killer.team === 'blue' ? 'red' : 'blue';
      const weakestLane = selectWeakestEnemyLane(this.turrets, enemyTeam);
      const stage = mob.lordStage;
      this.spawnSingleMinion(killer.team, weakestLane, 'lord_ally', stage);
      // Stage 3 Evolved Lord (18:00+) empowers ALL 3 lanes with Super Minions immediately!
      if (stage === 3) {
        for (const lane of ['top', 'mid', 'bot'] as const) {
          this.spawnSingleMinion(killer.team, lane, 'super');
        }
      }
      const stageLabel = stage === 3 ? 'EVOLVED LORD' : stage === 2 ? 'ENHANCED LORD' : 'SANCTUARY LORD';
      this.pushAnnouncer(
        `${stageLabel} SUMMONED!`,
        `${killer.team.toUpperCase()} Lord marches down ${weakestLane.toUpperCase()} Lane!`,
        '#F59E0B'
      );
      mlbbAudio.playAnnouncer('epic');
    }
  }

  private handleTurretDestroyed(turret: SimTurret, attacker: SimHero | null): void {
    turret.alive = false;
    turret.hp = 0;
    turret.shieldHp = 0;
    mlbbAudio.playTurret();
    this.shakeTimer = 0.35;

    const bonusGold = turret.golden ? 260 : 160;
    const winTeam = turret.team === 'red' ? 'blue' : 'red';
    for (const h of this.heroes) {
      if (h.team === winTeam) this.grantGoldAndXp(h, bonusGold, 150, turret.x, turret.y);
    }

    if (turret.tier === 4) {
      // Dramatic Base Crystal Shatter Slow-Motion Sequence before Victory/Defeat
      if (!this.crystalShatter) {
        mlbbAudio.playCrystalShatter();
        this.crystalShatter = {
          active: true,
          victory: turret.team === 'red',
          x: turret.x,
          y: turret.y,
          timer: 1.8,
          duration: 1.8,
          shardAccum: 0
        };
        this.shakeTimer = 0.85;
        this.pushAnnouncer(
          turret.team === 'red' ? 'ENEMY CRYSTAL SHATTERED!' : 'ALLY CRYSTAL SHATTERED!',
          turret.team === 'red' ? 'VICTORY IMMINENT!' : 'DEFENSE FALLEN!',
          turret.team === 'red' ? '#FACC15' : '#EF4444'
        );
        for (let i = 0; i < 12; i++) {
          const ang = (i / 12) * Math.PI * 2;
          this.vfxs.push({
            id: `v_${this.entitySeq++}`,
            kind: 'shard',
            x: turret.x + Math.cos(ang) * 35,
            y: turret.y + Math.sin(ang) * 35,
            radius: 130,
            color: turret.team === 'red' ? '#F87171' : '#38BDF8',
            ttl: 1.4,
            maxTtl: 1.4,
            angle: ang
          });
        }
        this.vfxs.push({
          id: `v_${this.entitySeq++}`,
          kind: 'ring',
          x: turret.x,
          y: turret.y,
          radius: 260,
          color: '#FACC15',
          ttl: 1.2,
          maxTtl: 1.2
        });
      }
      return;
    }

    if (turret.tier === 3) {
      this.pushAnnouncer(
        turret.team === 'red' ? 'ENEMY INHIBITOR DESTROYED!' : 'ALLY INHIBITOR DESTROYED!',
        `Super Minions now deploy in ${turret.lane.toUpperCase()} Lane!`,
        turret.team === 'red' ? '#F5C451' : '#EF4444'
      );
      mlbbAudio.playAnnouncer('epic');
      return;
    }

    this.pushAnnouncer(
      turret.team === 'red' ? 'ENEMY TURRET DESTROYED!' : 'ALLY TURRET DESTROYED!',
      `${attacker ? attacker.heroDef.name : winTeam.toUpperCase()} shattered a ${turret.lane.toUpperCase()} turret`,
      turret.team === 'red' ? '#2CE58B' : '#EF4444'
    );
  }

  private spawnSingleMinion(
    team: 'blue' | 'red',
    lane: 'top' | 'mid' | 'bot',
    kind: SimMinion['kind'],
    lordStage: 1 | 2 | 3 = 1
  ): void {
    const wps = LANE_WAYPOINTS[lane];
    const start = team === 'blue' ? wps[0] : wps[wps.length - 1];
    const scale = 1 + this.matchTimeSec / 360;
    const lordHpByStage = lordStage === 3 ? 12800 : lordStage === 2 ? 9200 : 6800;
    const lordAtkByStage = lordStage === 3 ? 390 : lordStage === 2 ? 310 : 240;
    const hpMap: Record<SimMinion['kind'], number> = {
      melee: 740,
      ranged: 520,
      siege: 1120,
      super: 1950,
      mini_turtle: 1650,
      lord_ally: lordHpByStage
    };
    const atkMap: Record<SimMinion['kind'], number> = {
      melee: 46,
      ranged: 62,
      siege: 88,
      super: 145,
      mini_turtle: 95,
      lord_ally: lordAtkByStage
    };
    const rewards = computeEarlyLaneMinionRewards(kind, lane, this.expLane, this.goldLane, this.matchTimeSec);
    const maxHp = Math.round(hpMap[kind] * (kind === 'lord_ally' ? 1 : scale));
    this.minions.push({
      id: `m_${this.entitySeq++}`,
      team,
      lane,
      kind,
      x: start.x + (Math.random() - 0.5) * 40,
      y: start.y + (Math.random() - 0.5) * 40,
      hp: maxHp,
      maxHp,
      atk: Math.round(atkMap[kind] * (kind === 'lord_ally' ? 1 : scale)),
      range: kind === 'ranged' || kind === 'siege' ? 240 : kind === 'lord_ally' ? 95 : 65,
      atkCd: 0,
      speed: kind === 'lord_ally' ? (lordStage >= 2 ? 195 : 175) : 195,
      radius: kind === 'lord_ally' ? (lordStage === 3 ? 48 : 42) : kind === 'super' ? 26 : kind === 'siege' ? 22 : 17,
      waypointIdx: team === 'blue' ? 1 : wps.length - 2,
      gold: rewards.gold,
      exp: rewards.exp,
      hitFlashTimer: 0,
      alive: true,
      lordStage: kind === 'lord_ally' ? lordStage : undefined,
      chargeReady: kind === 'lord_ally' && lordStage >= 2,
      slamCd: kind === 'lord_ally' ? 3.5 : undefined
    });
  }

  private spawnMinionWave(): void {
    const lanes: ('top' | 'mid' | 'bot')[] = this.isBrawl ? ['mid'] : ['top', 'mid', 'bot'];
    for (const team of ['blue', 'red'] as const) {
      const enemyTeam = team === 'blue' ? 'red' : 'blue';
      const hasEvolvedLord = this.minions.some(
        (m) => m.alive && m.team === team && m.kind === 'lord_ally' && m.lordStage === 3
      );
      for (const lane of lanes) {
        const enemyInhibitorDestroyed =
          !this.isBrawl &&
          !this.turrets.some((t) => t.team === enemyTeam && t.lane === lane && t.tier === 3 && t.alive);
        this.spawnSingleMinion(team, lane, 'melee');
        this.spawnSingleMinion(team, lane, 'ranged');
        this.spawnSingleMinion(team, lane, enemyInhibitorDestroyed || hasEvolvedLord ? 'super' : 'siege');
      }
    }
  }

  private stepSimulation(dt: number): void {
    // Dramatic Base Crystal Shatter Slow-Motion Sequence
    if (this.crystalShatter && this.crystalShatter.active) {
      const shatter = this.crystalShatter;
      shatter.timer -= dt;
      shatter.shardAccum += dt;
      if (this.shakeTimer > 0) this.shakeTimer = Math.max(0, this.shakeTimer - dt);
      // Pan camera smoothly to the shattering Base Crystal
      this.camX += (shatter.x - this.camX) * Math.min(1, dt * 8);
      this.camY += (shatter.y - this.camY) * Math.min(1, dt * 8);
      if (shatter.shardAccum >= 0.16) {
        shatter.shardAccum = 0;
        const ang = Math.random() * Math.PI * 2;
        this.vfxs.push({
          id: `v_${this.entitySeq++}`,
          kind: 'shard',
          x: shatter.x + (Math.random() - 0.5) * 80,
          y: shatter.y + (Math.random() - 0.5) * 80,
          radius: 95,
          color: shatter.victory ? '#FACC15' : '#EF4444',
          ttl: 0.9,
          maxTtl: 0.9,
          angle: ang
        });
      }
      for (const v of this.vfxs) v.ttl -= dt * 0.4;
      this.vfxs = this.vfxs.filter((v) => v.ttl > 0);
      if (shatter.timer <= 0) {
        shatter.active = false;
        this.finishMatch(shatter.victory);
      }
      return;
    }

    this.matchTimeSec += dt;
    if (this.shakeTimer > 0) this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    if (this.flyingCloudCd > 0) this.flyingCloudCd = Math.max(0, this.flyingCloudCd - dt);
    if (this.playerSkill4Cd > 0) this.playerSkill4Cd = Math.max(0, this.playerSkill4Cd - dt);
    this.fountainLaserCd.blue = Math.max(0, this.fountainLaserCd.blue - dt);
    this.fountainLaserCd.red = Math.max(0, this.fountainLaserCd.red - dt);
    if (this.announcer) {
      this.announcer.ttl -= dt;
      if (this.announcer.ttl <= 0) this.announcer = null;
    }
    if (this.objectiveBannerTtl > 0) {
      this.objectiveBannerTtl -= dt;
      if (this.objectiveBannerTtl <= 0) this.objectiveBanner = null;
    }

    // Tick tracked Enemy Battle Spell cooldowns (triggered from Scoreboard click)
    for (const k of Object.keys(this.trackedEnemySpells)) {
      const entry = this.trackedEnemySpells[k];
      entry.remainingSec -= dt;
      if (entry.remainingSec <= 0) {
        delete this.trackedEnemySpells[k];
      }
    }

    // Tick animated 5-slot Surrender Vote bar
    if (this.surrenderVote && this.surrenderVote.active) {
      this.surrenderElapsedSec += dt;
      this.surrenderVote.remainingSec = Math.max(0, 12 - this.surrenderElapsedSec);
      if (this.surrenderVote.status === 'voting') {
        for (const stepItem of this.surrenderSchedule) {
          if (!stepItem.applied && this.surrenderElapsedSec >= stepItem.atSec) {
            stepItem.applied = true;
            this.surrenderVote.slots[stepItem.slotIdx] = stepItem.vote;
            if (stepItem.vote === 'yes') this.surrenderVote.yes++;
            else this.surrenderVote.no++;
            mlbbAudio.playClick();
          }
        }
        if (this.surrenderVote.yes >= 4) {
          this.surrenderVote.status = 'passed';
          this.surrenderResolveDelay = 1.05;
          this.pushChat('System', 'sys', `Surrender vote passed (${this.surrenderVote.yes}/5).`);
        } else if (this.surrenderVote.no >= 2) {
          this.surrenderVote.status = 'failed';
          this.surrenderResolveDelay = 2.0;
          this.pushChat('System', 'sys', `Surrender vote failed (${this.surrenderVote.yes}/5). Keep fighting!`);
        }
      } else {
        this.surrenderResolveDelay -= dt;
        if (this.surrenderResolveDelay <= 0) {
          const passed = this.surrenderVote.status === 'passed';
          this.surrenderVote = null;
          if (passed && !this.matchEnded) {
            this.finishMatch(false);
            return;
          }
        }
      }
    }

    // Expire Tier 1 outer turret shields at 05:00 with shatter SFX & cyan shard burst!
    if (!this.outerShieldExpired && this.matchTimeSec >= MLBB_TIMERS.OUTER_SHIELD_EXPIRE) {
      this.outerShieldExpired = true;
      mlbbAudio.playShieldShatter();
      for (const t of this.turrets) {
        if (t.tier === 1 && t.alive && t.shieldHp > 0) {
          t.shieldHp = 0;
          this.vfxs.push({
            id: `v_${this.entitySeq++}`,
            kind: 'ring',
            x: t.x,
            y: t.y,
            radius: 135,
            color: '#22D3EE',
            ttl: 0.85,
            maxTtl: 0.85
          });
          for (let s = 0; s < 5; s++) {
            this.vfxs.push({
              id: `v_${this.entitySeq++}`,
              kind: 'shard',
              x: t.x,
              y: t.y,
              radius: 85,
              color: '#38BDF8',
              ttl: 0.75,
              maxTtl: 0.75,
              angle: (s / 5) * Math.PI * 2
            });
          }
        }
      }
      this.pushAnnouncer('OUTER TURRET SHIELDS EXPIRED', 'Outer turrets now take full damage!', '#22D3EE');
    }

    // Minion waves
    if (this.matchTimeSec >= this.nextMinionWaveSec) {
      this.nextMinionWaveSec += MLBB_TIMERS.MINION_INTERVAL;
      this.spawnMinionWave();
    }

    // Passive gold trickle (3g/s + Roamer gold)
    this.passiveGoldAccum += dt;
    if (this.passiveGoldAccum >= 1) {
      this.passiveGoldAccum -= 1;
      for (const h of this.heroes) {
        h.gold += 3;
        h.totalGold += 3;
        if (h.isRoamer) {
          h.gold += 6;
          h.totalGold += 6;
          h.roamGold += 6;
        }
      }
    }

    // Cyclone Eye & Purple shortcut timers
    for (const k of Object.keys(this.cycloneCds)) {
      this.cycloneCds[k] = Math.max(0, this.cycloneCds[k] - dt);
    }
    for (const k of Object.keys(this.campSlainShortcut)) {
      this.campSlainShortcut[k] = Math.max(0, this.campSlainShortcut[k] - dt);
    }

    // Walkie Grass river patrol wards
    this.walkieGrasses = stepWalkieGrassWards(this.walkieGrasses, dt);

    // Brawl Healing Shrines (2 periodic side alcoves)
    if (this.isBrawl) {
      for (const shrine of this.brawlShrines) {
        if (!shrine.active) {
          shrine.respawnTimer -= dt;
          if (shrine.respawnTimer <= 0) {
            shrine.active = true;
            shrine.respawnTimer = 0;
            this.vfxs.push({
              id: `v_${this.entitySeq++}`,
              kind: 'ring',
              x: shrine.x,
              y: shrine.y,
              radius: 95,
              color: '#34D399',
              ttl: 0.75,
              maxTtl: 0.75
            });
          }
        } else {
          const hero = this.heroes.find((h) => h.alive && dist(h.x, h.y, shrine.x, shrine.y) <= 95);
          if (hero) {
            shrine.active = false;
            shrine.respawnTimer = MLBB_TIMERS.BRAWL_SHRINE_RESPAWN;
            shrine.maxRespawn = MLBB_TIMERS.BRAWL_SHRINE_RESPAWN;
            this.healHeroInternal(hero, hero.maxHp * 0.22);
            hero.mana = Math.min(hero.maxMana, hero.mana + hero.maxMana * 0.22);
            hero.speedBoostPct = Math.max(hero.speedBoostPct, 0.25);
            hero.speedBoostTimer = Math.max(hero.speedBoostTimer, 3.0);
            mlbbAudio.playShrineHeal();
            this.vfxs.push({
              id: `v_${this.entitySeq++}`,
              kind: 'burst',
              x: shrine.x,
              y: shrine.y,
              radius: 120,
              color: '#34D399',
              ttl: 0.65,
              maxTtl: 0.65
            });
          }
        }
      }
    }

    // Revealing Wisps drift
    if (this.wisps.length > 0) {
      this.wisps[0].x = 1400 + Math.sin(this.matchTimeSec * 0.45) * 420;
      this.wisps[0].y = 2000 + Math.cos(this.matchTimeSec * 0.35) * 380;
      this.wisps[1].x = 2600 - Math.sin(this.matchTimeSec * 0.45) * 420;
      this.wisps[1].y = 2000 - Math.cos(this.matchTimeSec * 0.35) * 380;
    }

    // Decay temporary player-created walls (Grock, Badang, Zhuxin)
    for (let i = this.tempWalls.length - 1; i >= 0; i--) {
      this.tempWalls[i].ttl -= dt;
      if (this.tempWalls[i].ttl <= 0) this.tempWalls.splice(i, 1);
    }

    const skillCtx: SkillCastContext = {
      heroes: this.heroes,
      minions: this.minions,
      turrets: this.turrets,
      jungleMobs: this.jungleMobs,
      callbacks: this.getCallbacks(),
      matchTimeSec: this.matchTimeSec,
      noCooldown: this.cheatNoCooldown,
      tempWalls: this.tempWalls
    };

    // Fountain Lethal True-Damage Laser vs Invading Enemy Heroes (1,500 True Damage/hit)
    for (const side of ['blue', 'red'] as const) {
      const f = side === 'blue' ? BLUE_FOUNTAIN : RED_FOUNTAIN;
      if (this.fountainLaserCd[side] <= 0) {
        const invader = this.heroes.find(
          (h) => h.alive && h.team !== side && h.untargetableTimer <= 0 && dist(h.x, h.y, f.x, f.y) <= f.radius + 95
        );
        if (invader) {
          this.fountainLaserCd[side] = 0.45;
          skillCtx.callbacks.dealDamageToHero(null, invader, 1500, 'true', false, false, 'Fountain Laser');
          this.vfxs.push({
            id: `v_${this.entitySeq++}`,
            kind: 'beam',
            x: f.x,
            y: f.y,
            tx: invader.x,
            ty: invader.y,
            radius: 18,
            color: side === 'blue' ? '#38BDF8' : '#EF4444',
            ttl: 0.25,
            maxTtl: 0.25
          });
        }
      }
    }

    // Step Heroes
    for (const h of this.heroes) {
      if (!h.alive) {
        // Diggie Egg Form: untargetable egg can roam the map and hatches in-place on respawn
        if (h.heroDef.id === 'diggie' && h.eggFormTimer > 0) {
          h.eggFormTimer = Math.max(0, h.respawnTimer - dt);
          if (h.isPlayer && !this.config.isSpectator && (Math.abs(this.moveX) > 0.05 || Math.abs(this.moveY) > 0.05)) {
            const eggSpd = 290;
            const res = resolveWallCollision(
              h.x + this.moveX * eggSpd * dt,
              h.y + this.moveY * eggSpd * dt,
              h.radius,
              this.campSlainShortcut,
              this.config.mapVariant,
              this.isBrawl,
              this.tempWalls
            );
            h.x = res.x;
            h.y = res.y;
          }
        }
        h.respawnTimer -= dt;
        if (h.respawnTimer <= 0) {
          const home = h.team === 'blue' ? BLUE_FOUNTAIN : RED_FOUNTAIN;
          const hatchInPlace = h.heroDef.id === 'diggie';
          h.eggFormTimer = 0;
          h.alive = true;
          if (!hatchInPlace) {
            h.x = home.x + (h.team === 'blue' ? 75 : -75);
            h.y = home.y + (h.team === 'blue' ? -75 : 75);
          }
          h.justRespawnedCloudReady = true;
          if (h.isPlayer) {
            this.spectateTargetId = null;
            if (this.config.mapVariant === 'flying_cloud') {
              this.flyingCloudCd = 0;
            }
          }
          this.recalcHeroStats(h, true);
        }
        continue;
      }

      // Tick cooldowns & status timers
      h.skillCds[0] = Math.max(0, h.skillCds[0] - dt);
      h.skillCds[1] = Math.max(0, h.skillCds[1] - dt);
      h.skillCds[2] = Math.max(0, h.skillCds[2] - dt);
      h.spellCd = Math.max(0, h.spellCd - dt);
      h.atkCd = Math.max(0, h.atkCd - dt);
      h.recallCd = Math.max(0, h.recallCd - dt);
      h.regenCd = Math.max(0, h.regenCd - dt);
      h.activeItemCd = Math.max(0, h.activeItemCd - dt);
      h.emoteCd = Math.max(0, h.emoteCd - dt);
      h.hitFlashTimer = Math.max(0, h.hitFlashTimer - dt);
      h.ccImmuneTimer = Math.max(0, h.ccImmuneTimer - dt);
      h.untargetableTimer = Math.max(0, h.untargetableTimer - dt);
      h.physImmuneTimer = Math.max(0, h.physImmuneTimer - dt);
      h.stealthTimer = Math.max(0, h.stealthTimer - dt);
      h.speedBoostTimer = Math.max(0, h.speedBoostTimer - dt);
      h.slowTimer = Math.max(0, h.slowTimer - dt);
      h.antiHealTimer = Math.max(0, h.antiHealTimer - dt);
      h.defShredTimer = Math.max(0, h.defShredTimer - dt);
      h.revealedTimer = Math.max(0, h.revealedTimer - dt);
      h.recentlyAttackedTimer = Math.max(0, h.recentlyAttackedTimer - dt);
      h.potionBuffTimer = Math.max(0, h.potionBuffTimer - dt);
      if (h.potionBuffTimer <= 0) h.potionBuffKind = null;
      h.passiveTimer = Math.max(0, h.passiveTimer - dt);
      if (h.passiveTimer <= 0) h.passiveStacks = 0;
      h.passiveCd = Math.max(0, h.passiveCd - dt);
      h.immortalityCd = Math.max(0, h.immortalityCd - dt);
      h.markedTimer = Math.max(0, h.markedTimer - dt);
      h.recastTimer = Math.max(0, h.recastTimer - dt);
      if (h.recastTimer <= 0) h.recastSlot = null;
      h.orangeBuffTimer = Math.max(0, h.orangeBuffTimer - dt);
      h.purpleBuffTimer = Math.max(0, h.purpleBuffTimer - dt);
      h.turtleBuffTimer = Math.max(0, h.turtleBuffTimer - dt);
      h.turtleKillerBuffTimer = Math.max(0, h.turtleKillerBuffTimer - dt);
      h.goldCrabBuffTimer = Math.max(0, h.goldCrabBuffTimer - dt);
      h.evolvedLordAuraTimer = Math.max(0, h.evolvedLordAuraTimer - dt);
      h.turretHitResetTimer = Math.max(0, h.turretHitResetTimer - dt);
      if (h.turretHitResetTimer <= 0) h.turretHitsOnMe = 0;

      // Sanctum Crab Gold Buff (+10g every 1s for 18s)
      if (h.goldCrabBuffTimer > 0) {
        h.goldCrabTickAccum += dt;
        if (h.goldCrabTickAccum >= 1.0) {
          h.goldCrabTickAccum -= 1.0;
          this.grantGoldAndXp(h, 10, 0, h.x, h.y);
          if (h.isPlayer) {
            this.vfxs.push({
              id: `v_${this.entitySeq++}`,
              kind: 'text',
              x: h.x,
              y: h.y - 34,
              radius: 0,
              color: '#FACC15',
              text: '+10g',
              ttl: 0.55,
              maxTtl: 0.55
            });
          }
        }
      }

      // Turtle Killer Buff: refreshes extra shield every 5s while out of combat
      if (h.turtleKillerBuffTimer > 0 && h.outOfCombatTimer >= 5) {
        h.turtleShieldRefreshAccum += dt;
        if (h.turtleShieldRefreshAccum >= 5.0) {
          h.turtleShieldRefreshAccum = 0;
          const refreshCap = 360 + h.level * 35;
          if (h.shield < refreshCap) h.shield = refreshCap;
        }
      }

      h.windChantTimer = Math.max(0, h.windChantTimer - dt);
      h.winterCrownTimer = Math.max(0, h.winterCrownTimer - dt);
      h.vengeanceTimer = Math.max(0, h.vengeanceTimer - dt);
      h.inspireTimer = Math.max(0, h.inspireTimer - dt);
      h.orbitTimer = Math.max(0, h.orbitTimer - dt);
      if (h.orbitTimer <= 0) h.orbitBlades = 0;
      h.tetherTimer = Math.max(0, h.tetherTimer - dt);
      if (h.tetherTimer <= 0) h.tetherTargetId = null;
      h.multiKillTimer = Math.max(0, h.multiKillTimer - dt);
      h.outOfCombatTimer += dt;

      if (h.activeEmote) {
        h.activeEmote.ttl -= dt;
        if (h.activeEmote.ttl <= 0) h.activeEmote = null;
      }

      if (h.ccTimer > 0) {
        h.ccTimer -= dt;
        if (h.ccTimer <= 0) {
          h.ccType = null;
          h.ccPriority = 0;
        }
      }

      // Delayed HP catch-up bar smooth trail
      if (h.hpTrail > h.hp) {
        h.hpTrail = Math.max(h.hp, h.hpTrail - h.maxHp * 0.42 * dt);
      } else {
        h.hpTrail = h.hp;
      }

      // Fountain rapid heal (+15% Max HP/s) + Regen spell + Natural regen
      const home = h.team === 'blue' ? BLUE_FOUNTAIN : RED_FOUNTAIN;
      if (dist(h.x, h.y, home.x, home.y) < home.radius) {
        h.hp = Math.min(h.maxHp, h.hp + h.maxHp * 0.15 * dt);
        h.mana = Math.min(h.maxMana, h.mana + h.maxMana * 0.25 * dt);
      } else {
        h.hp = Math.min(h.maxHp, h.hp + h.hpRegen * dt);
        if (h.regenTimer > 0) {
          h.regenTimer -= dt;
          h.hp = Math.min(h.maxHp, h.hp + h.maxHp * 0.055 * dt);
          h.mana = Math.min(h.maxMana, h.mana + h.maxMana * 0.06 * dt);
        }
        h.mana = Math.min(h.maxMana, h.mana + (8 + h.level * 0.8) * dt);
      }

      // Recall countdown
      if (h.recalling) {
        h.recallTimer -= dt;
        if (h.recallTimer <= 0) {
          h.recalling = false;
          h.x = home.x + (h.team === 'blue' ? 75 : -75);
          h.y = home.y + (h.team === 'blue' ? -75 : 75);
          h.hp = h.maxHp;
          h.mana = h.maxMana;
        }
      }

      // Angela attached state
      if (h.attachedAllyId && h.attachedTimer > 0) {
        h.attachedTimer -= dt;
        const host = this.heroes.find((x) => x.id === h.attachedAllyId && x.alive);
        if (host) {
          h.x = host.x;
          h.y = host.y;
        } else {
          h.attachedAllyId = null;
        }
        if (h.attachedTimer <= 0) h.attachedAllyId = null;
        continue;
      }

      // Player Auto-Level Up & Auto-Buy settings
      if (h.isPlayer) {
        if (this.settings.controls.autoLevelUp && h.skillPoints > 0) {
          this.upgradePlayerSkill(h.skillLevels[2] === 0 && h.level >= 4 ? 3 : h.skillLevels[0] <= h.skillLevels[1] ? 1 : 2);
        }
        if (this.settings.controls.autoBuy) {
          const disc = h.talents.t2 === 'bargain_hunter' ? 0.05 : 0;
          const qb = computeMlbbQuickBuy(h.buildPlan, h.items, h.gold, h.prioritizedItemId, disc);
          if (qb.length > 0 && qb[0].canAfford) this.buyItem(qb[0].id);
        }
      }

      // Step Part 4, Part 5 Hero Passives & Part 6 Equipment/Talent/Aura Timers
      stepPart4HeroPassives(h, dt, this.heroes, skillCtx.callbacks, this.tempWalls);
      stepPart5HeroPassives(h, dt, this.heroes, skillCtx.callbacks, this.tempWalls);
      stepEquipmentAndTalentTimers(h, dt, this.heroes, this.jungleMobs, this.minions, skillCtx.callbacks);

      // Input or AI decision (Spectator mode lets AI control all 10 heroes!)
      if (h.isPlayer && !this.config.isSpectator) {
        if (Math.abs(this.moveX) > 0.05 || Math.abs(this.moveY) > 0.05) {
          h.vx = this.moveX;
          h.vy = this.moveY;
          h.facing = Math.atan2(this.moveY, this.moveX);
          h.recalling = false;
          // 3-Phase Animation Cancel: Movement immediately cancels lingering skill Backswing!
          h.castBackswing = 0;
        } else {
          h.vx = 0;
          h.vy = 0;
        }
        if (this.holdingAttack) {
          this.performPlayerBasicAttack(this.attackMode);
        } else if (h.heroDef.id === 'irithel' && (Math.abs(h.vx) > 0.1 || Math.abs(h.vy) > 0.1)) {
          // Irithel Jungle Heart: shoots continuously while moving!
          this.performPlayerBasicAttack('hero');
        }
      } else {
        const botOrder = h.team === 'blue' ? this.pingSystem.getActiveBotPingOrder('blue', h.x, h.y) : null;
        stepAiHero(h, dt, {
          ctx: skillCtx,
          expLane: this.expLane,
          goldLane: this.goldLane,
          isBrawl: this.isBrawl,
          difficulty: this.config.isSpectator ? 'mythic' : (this.settings.controls.aiDifficulty ?? 'epic'),
          activePingOrder: botOrder,
          basicAttackTarget: (atk, kind, id) => this.executeBasicAttack(atk, kind, id),
          buyItemForHero: (bot, itemId) => this.buyItemForHeroInternal(bot, itemId),
          triggerHeroEmote: (bot, emId) => this.triggerHeroEmoteInternal(bot, emId),
          triggerActiveItemForHero: (bot) => this.triggerActiveItemForHeroInternal(bot)
        });
      }

      // Tier 2 Taunt forces hero to walk toward the taunting caster!
      if (h.ccType === 'taunt' && h.tauntTargetId) {
        const taunter = this.heroes.find((x) => x.id === h.tauntTargetId && x.alive);
        if (taunter) {
          const ang = Math.atan2(taunter.y - h.y, taunter.x - h.x);
          h.vx = Math.cos(ang);
          h.vy = Math.sin(ang);
          h.facing = ang;
        }
      }

      // River Current (+15% standard river, +28% with Expanding Rivers variant) + Walkie Grass river regen
      if (!this.isBrawl) {
        const riverBoost = getRiverCurrentSpeedBonus(h.x, h.y, this.config.mapVariant);
        if (riverBoost > 0) {
          h.speedBoostPct = Math.max(h.speedBoostPct, riverBoost);
          h.speedBoostTimer = Math.max(h.speedBoostTimer, 0.35);
          if (this.walkieGrasses.some((w) => w.team === h.team)) {
            h.mana = Math.min(h.maxMana, h.mana + 18 * dt);
            h.speedBoostPct = Math.max(h.speedBoostPct, 0.2);
          }
        }
      }

      // Flying Cloud (2026 Variant): auto-launch over walls when stepping onto the respawn platform
      if (
        !this.isBrawl &&
        this.config.mapVariant === 'flying_cloud' &&
        h.team === 'blue' &&
        h.dashTimer <= 0 &&
        dist(h.x, h.y, FLYING_CLOUD_BLUE.x, FLYING_CLOUD_BLUE.y) <= FLYING_CLOUD_BLUE.radius + 16 &&
        (h.justRespawnedCloudReady || (h.isPlayer && this.flyingCloudCd <= 0))
      ) {
        h.justRespawnedCloudReady = false;
        if (h.isPlayer) this.flyingCloudCd = 35;
        h.dashVx = Math.cos(-Math.PI / 4) * 1400;
        h.dashVy = Math.sin(-Math.PI / 4) * 1400;
        h.dashTimer = 0.65;
        h.dashWallCross = true;
        h.ccImmuneTimer = 0.8;
        this.vfxs.push({
          id: `v_${this.entitySeq++}`, kind: 'burst', x: h.x, y: h.y,
          radius: 110, color: '#E879F9', ttl: 0.6, maxTtl: 0.6
        });
        if (h.isPlayer) mlbbAudio.playSkill(3, 'magic');
      }

      // Recalc move speed with active buffs/slows
      this.recalcHeroStats(h, false);

      // Movement & Dashes (respecting 6-Tier CC Hierarchy & Wall-Phasing!)
      const immobilized = h.ccType ? isMovementBlockingCc(h.ccType) : false;
      const canPhaseWalls = (h.dashWallCross || h.wallPhaseTimer > 0) && !this.isBrawl;
      if (h.dashTimer > 0) {
        h.dashTimer -= dt;
        const nx = h.x + h.dashVx * dt;
        const ny = h.y + h.dashVy * dt;
        if (canPhaseWalls) {
          h.x = clamp(nx, 60, WORLD_SIZE - 60);
          h.y = clamp(ny, 60, WORLD_SIZE - 60);
        } else {
          const res = resolveWallCollision(nx, ny, h.radius, this.campSlainShortcut, this.config.mapVariant, this.isBrawl, this.tempWalls);
          h.x = res.x;
          h.y = res.y;
        }
      } else if (!immobilized && !h.recalling && h.winterCrownTimer <= 0 && (h.vx !== 0 || h.vy !== 0)) {
        const mag = Math.hypot(h.vx, h.vy) || 1;
        const speedPx = h.moveSpd * 1.05;
        const nx = h.x + (h.vx / mag) * speedPx * dt;
        const ny = h.y + (h.vy / mag) * speedPx * dt;
        if (canPhaseWalls) {
          h.x = clamp(nx, 60, WORLD_SIZE - 60);
          h.y = clamp(ny, 60, WORLD_SIZE - 60);
        } else {
          const res = resolveWallCollision(nx, ny, h.radius, this.campSlainShortcut, this.config.mapVariant, this.isBrawl, this.tempWalls);
          h.x = res.x;
          h.y = res.y;
        }
      }

      // Bush stealth, rustling leaf particles & Revealing Wisps check (includes Dangerous Grass extra bushes)
      h.inBush = !this.isBrawl && isPointInBush(h.x, h.y, this.config.mapVariant) !== null;
      if (h.inBush) {
        if (Math.hypot(h.vx, h.vy) > 0.12) {
          h.bushParticleAccum += dt;
          if (h.bushParticleAccum >= 0.28) {
            h.bushParticleAccum = 0;
            this.vfxs.push({
              id: `v_${this.entitySeq++}`,
              kind: 'leaf',
              x: h.x + (Math.random() - 0.5) * 26,
              y: h.y + (Math.random() - 0.5) * 26,
              radius: 26,
              color: '#4ADE80',
              ttl: 0.55,
              maxTtl: 0.55,
              angle: Math.random() * Math.PI * 2
            });
          }
        }
        for (const w of this.wisps) {
          if (dist(h.x, h.y, w.x, w.y) <= w.radius) {
            h.revealedTimer = Math.max(h.revealedTimer, 1.5);
          }
        }
      }

      // Cyclone Eye wind dash trigger
      if (!this.isBrawl) {
        for (const ce of CYCLONE_EYES) {
          if ((this.cycloneCds[ce.id] ?? 0) <= 0 && dist(h.x, h.y, ce.x, ce.y) < 42) {
            this.cycloneCds[ce.id] = MLBB_TIMERS.CYCLONE_EYE_CD;
            h.dashVx = Math.cos(h.facing) * 1150;
            h.dashVy = Math.sin(h.facing) * 1150;
            h.dashTimer = 0.28;
            h.dashWallCross = true;
            this.vfxs.push({ id: `v_${this.entitySeq++}`, kind: 'ring', x: ce.x, y: ce.y, radius: 75, color: '#38BDF8', ttl: 0.45, maxTtl: 0.45 });
          }
        }
      }
    }

    // Step Minions & Allied Sanctuary Lord (Stage 1/2/3 Mechanics)
    for (const m of this.minions) {
      if (!m.alive) continue;
      m.atkCd = Math.max(0, m.atkCd - dt);
      m.hitFlashTimer = Math.max(0, m.hitFlashTimer - dt);

      if (m.kind === 'lord_ally') {
        if (m.slamCd !== undefined && m.slamCd > 0) m.slamCd = Math.max(0, m.slamCd - dt);
        // Stage 3 Evolved Lord: -20% Damage Reduction Aura to nearby allied heroes
        if (m.lordStage === 3) {
          for (const ally of this.heroes) {
            if (ally.alive && ally.team === m.team && dist(ally.x, ally.y, m.x, m.y) <= 480) {
              ally.evolvedLordAuraTimer = 0.5;
            }
          }
        }
        // Stage 2+ Enhanced/Evolved Lord: Unstoppable Charge Dash into Enemy Turret (2,200 True Damage!)
        if (m.chargeReady) {
          const chargeTurret = this.turrets.find(
            (t) => t.alive && t.team !== m.team && dist(m.x, m.y, t.x, t.y) <= 460
          );
          if (chargeTurret) {
            m.chargeReady = false;
            const ang = Math.atan2(chargeTurret.y - m.y, chargeTurret.x - m.x);
            m.x = chargeTurret.x - Math.cos(ang) * 75;
            m.y = chargeTurret.y - Math.sin(ang) * 75;
            skillCtx.callbacks.dealDamageToTurret(null, chargeTurret, 2200);
            this.shakeTimer = Math.max(this.shakeTimer, 0.35);
            this.vfxs.push({
              id: `v_${this.entitySeq++}`,
              kind: 'burst',
              x: chargeTurret.x,
              y: chargeTurret.y,
              radius: 175,
              color: '#F59E0B',
              ttl: 0.7,
              maxTtl: 0.7
            });
            this.pushAnnouncer('LORD CHARGE IMPACT!', 'Enhanced Lord slammed the enemy turret for 2,200 True Damage!', '#F59E0B');
            mlbbAudio.playTurret();
          }
        }
      }

      const enemyMinion = this.minions.find((o) => o.alive && o.team !== m.team && dist(m.x, m.y, o.x, o.y) <= m.range + 150);
      const enemyTurret = this.turrets.find((t) => t.alive && t.team !== m.team && dist(m.x, m.y, t.x, t.y) <= m.range + 90);
      const enemyHero = this.heroes.find((h) => h.alive && h.team !== m.team && dist(m.x, m.y, h.x, h.y) <= m.range + 120);

      const tgt = enemyMinion ?? enemyTurret ?? enemyHero;
      if (tgt) {
        const d = dist(m.x, m.y, tgt.x, tgt.y);
        if (d <= m.range + 35) {
          // Allied Lord AoE Knockup Slam every 5s
          if (m.kind === 'lord_ally' && (m.slamCd ?? 0) <= 0) {
            m.slamCd = 5.0;
            const slamDmg = Math.round(m.atk * 1.35);
            this.vfxs.push({
              id: `v_${this.entitySeq++}`,
              kind: 'ring',
              x: m.x,
              y: m.y,
              radius: 195,
              color: '#F59E0B',
              ttl: 0.55,
              maxTtl: 0.55
            });
            for (const eh of this.heroes) {
              if (eh.alive && eh.team !== m.team && dist(eh.x, eh.y, m.x, m.y) <= 195) {
                skillCtx.callbacks.dealDamageToHero(null, eh, slamDmg, 'physical', false, false, 'Lord Knockup Slam');
                skillCtx.callbacks.applyCc(eh, 'airborne', 0.7);
              }
            }
            for (const em of this.minions) {
              if (em.alive && em.team !== m.team && dist(em.x, em.y, m.x, m.y) <= 195) {
                skillCtx.callbacks.dealDamageToMinion(null, em, slamDmg, 'physical');
              }
            }
          }
          if (m.atkCd <= 0) {
            m.atkCd = 1.1;
            if ('waypointIdx' in tgt) skillCtx.callbacks.dealDamageToMinion(null, tgt, m.atk, 'physical');
            else if ('tier' in tgt) skillCtx.callbacks.dealDamageToTurret(null, tgt, m.atk);
            else skillCtx.callbacks.dealDamageToHero(null, tgt, m.atk, 'physical');
          }
        } else {
          const ang = Math.atan2(tgt.y - m.y, tgt.x - m.x);
          m.x += Math.cos(ang) * m.speed * dt;
          m.y += Math.sin(ang) * m.speed * dt;
        }
      } else {
        const wps = LANE_WAYPOINTS[m.lane];
        const wp = wps[clamp(m.waypointIdx, 0, wps.length - 1)];
        const d = dist(m.x, m.y, wp.x, wp.y);
        if (d < 45) {
          m.waypointIdx += m.team === 'blue' ? 1 : -1;
        } else {
          const ang = Math.atan2(wp.y - m.y, wp.x - m.x);
          m.x += Math.cos(ang) * m.speed * dt;
          m.y += Math.sin(ang) * m.speed * dt;
        }
      }
    }
    this.minions = this.minions.filter((m) => m.alive);

    // Step Turrets (with Exact +40%..260% Hero Ramp, 3s Reset, and Base Crystal Shield Regen)
    for (const t of this.turrets) {
      if (!t.alive) continue;
      t.atkCd = Math.max(0, t.atkCd - dt);
      t.hitFlashTimer = Math.max(0, t.hitFlashTimer - dt);

      // Base Crystal regenerating shield after 8s out of combat
      if (t.tier === 4 && t.maxShieldHp > 0 && t.shieldHp < t.maxShieldHp && this.matchTimeSec - t.lastDamagedSec >= 8) {
        t.shieldHp = Math.min(t.maxShieldHp, t.shieldHp + 120 * dt);
      }

      // Validate current target
      let targetObj: { id: string; x: number; y: number; kind: 'hero' | 'minion' } | null = null;
      if (t.targetId) {
        const h = this.heroes.find((x) => x.id === t.targetId && x.alive && x.untargetableTimer <= 0 && dist(x.x, x.y, t.x, t.y) <= t.range);
        if (h) targetObj = { id: h.id, x: h.x, y: h.y, kind: 'hero' };
        else {
          const m = this.minions.find((x) => x.id === t.targetId && x.alive && dist(x.x, x.y, t.x, t.y) <= t.range);
          if (m) targetObj = { id: m.id, x: m.x, y: m.y, kind: 'minion' };
        }
      }

      if (!targetObj) {
        t.consecutiveHeroHits = 0;
        const m = this.minions.find((x) => x.alive && x.team !== t.team && dist(x.x, x.y, t.x, t.y) <= t.range);
        if (m) targetObj = { id: m.id, x: m.x, y: m.y, kind: 'minion' };
        else {
          const h = this.heroes.find((x) => x.alive && x.team !== t.team && x.untargetableTimer <= 0 && dist(x.x, x.y, t.x, t.y) <= t.range);
          if (h) targetObj = { id: h.id, x: h.x, y: h.y, kind: 'hero' };
        }
        t.targetId = targetObj?.id ?? null;
      }

      if (targetObj && t.atkCd <= 0) {
        t.atkCd = 1.05;
        let shotDmg = t.atk;
        if (targetObj.kind === 'hero') {
          const hitHero = this.heroes.find((x) => x.id === targetObj!.id);
          const rampStacks = hitHero ? Math.max(t.consecutiveHeroHits, hitHero.turretHitsOnMe) : t.consecutiveHeroHits;
          shotDmg = Math.round(t.atk * computeTurretRampMultiplier(rampStacks));
          t.consecutiveHeroHits++;
          if (hitHero) {
            hitHero.turretHitsOnMe = rampStacks + 1;
            hitHero.turretHitResetTimer = 3.0;
          }
        }
        skillCtx.callbacks.spawnProjectile({
          ownerId: t.id,
          team: t.team,
          x: t.x,
          y: t.y - 24,
          vx: 0,
          vy: 0,
          radius: 16,
          rangeLeft: 900,
          damage: shotDmg,
          damageType: 'physical',
          color: t.team === 'blue' ? '#38BDF8' : '#EF4444',
          kind: 'turret_shot',
          homingTargetId: targetObj.id,
          life: 1.4,
          maxLife: 1.4
        });
      }
    }

    // Step Jungle Mobs (with Respawns, Leash & Patience Reset)
    for (const mob of this.jungleMobs) {
      mob.hitFlashTimer = Math.max(0, mob.hitFlashTimer - dt);
      if (!mob.alive) {
        // Turtle despawns at 08:00 when Lord takes over
        if (mob.kind === 'turtle' && this.matchTimeSec >= MLBB_TIMERS.TURTLE_DESPAWN) continue;
        mob.respawnTimer -= dt;
        if (mob.respawnTimer <= 0) {
          mob.alive = true;
          mob.spawnedOnce = true;
          const timeScale = 1 + this.matchTimeSec / 420;
          if (mob.kind === 'lord') {
            mob.lordStage =
              this.matchTimeSec >= MLBB_TIMERS.LORD_STAGE3_TIME ? 3 : this.matchTimeSec >= MLBB_TIMERS.LORD_STAGE2_TIME ? 2 : 1;
            this.objectiveBanner = `SANCTUARY LORD (STAGE ${mob.lordStage}) HAS SPAWNED`;
            this.objectiveBannerTtl = 6;
          } else if (mob.kind === 'turtle') {
            this.objectiveBanner = 'THE TURTLE HAS SPAWNED!';
            this.objectiveBannerTtl = 5;
          }
          mob.maxHp = Math.round(mob.maxHp * (mob.spawnedOnce ? 1.06 : 1) * Math.min(1.8, timeScale));
          mob.hp = mob.maxHp;
          mob.patience = 100;
          mob.resetting = false;
        }
        continue;
      }

      if (mob.kind === 'turtle' && this.matchTimeSec >= MLBB_TIMERS.TURTLE_DESPAWN) {
        mob.alive = false;
        continue;
      }

      mob.atkCd = Math.max(0, mob.atkCd - dt);
      if (mob.resetting) {
        const dHome = dist(mob.x, mob.y, mob.homeX, mob.homeY);
        if (dHome < 16) {
          mob.x = mob.homeX;
          mob.y = mob.homeY;
          mob.hp = mob.maxHp;
          mob.patience = 100;
          mob.resetting = false;
          mob.aggroTargetId = null;
        } else {
          const ang = Math.atan2(mob.homeY - mob.y, mob.homeX - mob.x);
          mob.x += Math.cos(ang) * 260 * dt;
          mob.y += Math.sin(ang) * 260 * dt;
          mob.hp = Math.min(mob.maxHp, mob.hp + mob.maxHp * 0.25 * dt);
        }
        continue;
      }

      if (mob.aggroTargetId) {
        const tgt = this.heroes.find((h) => h.id === mob.aggroTargetId && h.alive);
        const outOfLeash = dist(mob.x, mob.y, mob.homeX, mob.homeY) > mob.leashRadius || !tgt || dist(tgt.x, tgt.y, mob.homeX, mob.homeY) > mob.leashRadius + 130;
        if (outOfLeash) {
          mob.patience -= 36 * dt;
          if (mob.patience <= 0) {
            mob.resetting = true;
            mob.aggroTargetId = null;
            continue;
          }
        } else {
          mob.patience = Math.min(100, mob.patience + 18 * dt);
        }
        if (tgt) {
          const d = dist(mob.x, mob.y, tgt.x, tgt.y);
          if (d > 82) {
            const ang = Math.atan2(tgt.y - mob.y, tgt.x - mob.x);
            mob.x += Math.cos(ang) * 185 * dt;
            mob.y += Math.sin(ang) * 185 * dt;
          } else if (mob.atkCd <= 0) {
            mob.atkCd = 1.25;
            skillCtx.callbacks.dealDamageToHero(null, tgt, mob.atk, 'physical');
          }
        }
      }
    }

    // Step Projectiles
    for (const p of this.projectiles) {
      p.life -= dt;
      if (p.life <= 0) continue;

      const ownerHero = this.heroes.find((h) => h.id === p.ownerId) ?? null;

      if (p.homingTargetId) {
        const hTgt = this.heroes.find((h) => h.id === p.homingTargetId && h.alive);
        const mTgt = !hTgt ? this.minions.find((m) => m.id === p.homingTargetId && m.alive) : undefined;
        const jTgt = !hTgt && !mTgt ? this.jungleMobs.find((j) => j.id === p.homingTargetId && j.alive) : undefined;
        const tTgt = !hTgt && !mTgt && !jTgt ? this.turrets.find((t) => t.id === p.homingTargetId && t.alive) : undefined;
        const target = hTgt ?? mTgt ?? jTgt ?? tTgt;
        if (!target) {
          p.life = 0;
          continue;
        }
        const ang = Math.atan2(target.y - p.y, target.x - p.x);
        const spd = p.kind === 'turret_shot' ? 760 : 920;
        p.x += Math.cos(ang) * spd * dt;
        p.y += Math.sin(ang) * spd * dt;
        if (dist(p.x, p.y, target.x, target.y) <= 28) {
          p.life = 0;
          if (hTgt) {
            skillCtx.callbacks.dealDamageToHero(ownerHero, hTgt, p.damage, p.damageType, p.kind === 'basic');
            if (p.ccType && p.ccDuration) skillCtx.callbacks.applyCc(hTgt, p.ccType, p.ccDuration, ownerHero ?? undefined);
          } else if (mTgt) {
            skillCtx.callbacks.dealDamageToMinion(ownerHero, mTgt, p.damage, p.damageType);
          } else if (jTgt) {
            skillCtx.callbacks.dealDamageToJungle(ownerHero, jTgt, p.damage, p.damageType);
          } else if (tTgt) {
            skillCtx.callbacks.dealDamageToTurret(ownerHero, tTgt, p.damage);
          }
        }
        continue;
      }

      // Linear / Hook / Boomerang projectiles
      const stepD = Math.hypot(p.vx, p.vy) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rangeLeft -= stepD;

      if (p.kind === 'boomerang' && !p.returning && p.rangeLeft <= 0 && ownerHero) {
        p.returning = true;
        p.hitIds.clear();
        p.rangeLeft = 900;
      }
      if (p.kind === 'boomerang' && p.returning && ownerHero) {
        const ang = Math.atan2(ownerHero.y - p.y, ownerHero.x - p.x);
        p.vx = Math.cos(ang) * 860;
        p.vy = Math.sin(ang) * 860;
        if (dist(p.x, p.y, ownerHero.x, ownerHero.y) < 35) {
          p.life = 0;
          continue;
        }
      } else if (p.rangeLeft <= 0) {
        p.life = 0;
        continue;
      }

      // Hit checks vs enemy heroes
      for (const h of this.heroes) {
        if (!h.alive || h.team === p.team || h.untargetableTimer > 0 || p.hitIds.has(h.id)) continue;
        if (dist(p.x, p.y, h.x, h.y) <= p.radius + h.radius) {
          p.hitIds.add(h.id);
          let hitDmg = p.damage;
          if (p.kind === 'flameshot' && ownerHero) {
            const traveled = dist(ownerHero.x, ownerHero.y, h.x, h.y);
            const distRatio = clamp(traveled / 1200, 0, 1);
            hitDmg = Math.round(200 + distRatio * 440 + ownerHero.magicPow * (0.5 + distRatio * 1.3));
          }
          skillCtx.callbacks.dealDamageToHero(ownerHero, h, hitDmg, p.damageType);
          if (p.kind === 'hook' && ownerHero) {
            // Pull victim straight to Franco!
            h.x = ownerHero.x + Math.cos(ownerHero.facing) * 60;
            h.y = ownerHero.y + Math.sin(ownerHero.facing) * 60;
            skillCtx.callbacks.applyCc(h, 'pull', 0.65, ownerHero);
          } else if (p.kind === 'flameshot') {
            const kAng = Math.atan2(p.vy, p.vx);
            const closeHit = ownerHero ? dist(ownerHero.x, ownerHero.y, h.x, h.y) <= 320 : true;
            if (closeHit) {
              h.x = clamp(h.x + Math.cos(kAng) * 140, 80, WORLD_SIZE - 80);
              h.y = clamp(h.y + Math.sin(kAng) * 140, 80, WORLD_SIZE - 80);
              skillCtx.callbacks.applyCc(h, 'knockback', 0.5, ownerHero ?? undefined);
            }
          } else if (p.extraTag === 'layla_s1' && ownerHero) {
            ownerHero.speedBoostPct = 0.3;
            ownerHero.speedBoostTimer = 2.0;
          }
          if (!p.pierce) {
            p.life = 0;
            break;
          }
        }
      }
      if (p.life <= 0) continue;

      // Hit checks vs enemy minions
      for (const m of this.minions) {
        if (!m.alive || m.team === p.team || p.hitIds.has(m.id)) continue;
        if (dist(p.x, p.y, m.x, m.y) <= p.radius + m.radius) {
          p.hitIds.add(m.id);
          skillCtx.callbacks.dealDamageToMinion(ownerHero, m, p.damage, p.damageType);
          if (!p.pierce) {
            p.life = 0;
            break;
          }
        }
      }
    }
    this.projectiles = this.projectiles.filter((p) => p.life > 0);

    // Step VFX, VisionSystem, PingSystem & Turret Alert
    for (const v of this.vfxs) v.ttl -= dt;
    this.vfxs = this.vfxs.filter((v) => v.ttl > 0);
    for (const ping of this.pings) ping.ttl -= dt;
    this.pings = this.pings.filter((p) => p.ttl > 0);
    this.pingSystem.step(dt);

    // Step VisionSystem (Fog of War, Bush Stealth, Overhead Eye Spotting, Walkie Grass Wards, 2s Fog Ghosts)
    const visionWards = [
      ...this.wisps.map((w) => ({ x: w.x, y: w.y, radius: w.radius, team: 'both' as const })),
      ...this.walkieGrasses.map((wg) => ({ x: wg.x, y: wg.y, radius: wg.radius, team: wg.team }))
    ];
    this.lastVision = this.visionSystem.step(
      dt,
      this.heroes.map((h) => ({
        id: h.id,
        heroId: h.heroDef.id,
        name: h.heroDef.name,
        team: h.team,
        x: h.x,
        y: h.y,
        alive: h.alive,
        inBush: h.inBush,
        stealthTimer: h.stealthTimer,
        revealedTimer: h.revealedTimer,
        color: h.skinColor,
        recentlyAttackedTimer: h.recentlyAttackedTimer
      })),
      this.minions,
      this.turrets,
      visionWards,
      this.config.mapVariant
    );
    for (const h of this.heroes) {
      h.spottedByEnemy = h.team === 'blue' ? this.lastVision.spottedAllyIds.has(h.id) : this.lastVision.visibleEnemyIds.has(h.id);
    }

    // Check Player Bush Eye-Spot Audio & 3-State Turret Alert (Green / Yellow / Red) + Lock-On Beep
    const player = this.getPlayer();
    this.turretBeepCd = Math.max(0, this.turretBeepCd - dt);
    if (player && player.alive) {
      const bushSpotted = player.inBush && player.spottedByEnemy;
      if (bushSpotted && !this.prevPlayerBushSpotted) {
        mlbbAudio.playEyeSpot();
      }
      this.prevPlayerBushSpotted = bushSpotted;

      let alert: 'none' | 'safe' | 'warn' | 'locked' = 'none';
      for (const t of this.turrets) {
        if (!t.alive || t.team === player.team) continue;
        if (dist(player.x, player.y, t.x, t.y) <= t.range + 45) {
          const ring = computeTurretRingState(t, player.id, player.team, this.minions);
          if (ring === 'locked') {
            alert = 'locked';
            break;
          }
          if (ring === 'warn') alert = 'warn';
          else if (alert === 'none') alert = 'safe';
        }
      }
      this.playerTurretAlert = alert;
      if (alert === 'locked' && this.turretBeepCd <= 0) {
        this.turretBeepCd = 1.1;
        mlbbAudio.playTurretLockBeep();
      }
    } else {
      this.playerTurretAlert = 'none';
      this.prevPlayerBushSpotted = false;
    }

    // Live Stream Spectator: reveal all 10 heroes on battlefield & minimap
    if (this.config.isSpectator) {
      for (const h of this.heroes) {
        if (h.alive && h.team === 'red') {
          this.lastVision.visibleEnemyIds.add(h.id);
        }
      }
    }

    // 4-Mode Camera Scouting: Minimap Direct Drag -> Spectator / Death Spectate -> Hero Follow + Free-Pan + Aim Panning
    if (this.minimapCamFocus) {
      this.camX += (this.minimapCamFocus.x - this.camX) * Math.min(1, dt * 16);
      this.camY += (this.minimapCamFocus.y - this.camY) * Math.min(1, dt * 16);
    } else if (this.config.isSpectator) {
      const spec =
        (this.spectateTargetId ? this.heroes.find((h) => h.id === this.spectateTargetId && h.alive) : null) ??
        this.heroes.find((h) => h.alive) ??
        this.heroes[0];
      if (spec) {
        this.camX += (spec.x + this.freePanOffsetX - this.camX) * Math.min(1, dt * 9);
        this.camY += (spec.y + this.freePanOffsetY - this.camY) * Math.min(1, dt * 9);
      }
    } else if (player && !player.alive && this.spectateTargetId) {
      const spec = this.heroes.find((h) => h.id === this.spectateTargetId && h.alive);
      if (spec) {
        this.camX += (spec.x + this.freePanOffsetX - this.camX) * Math.min(1, dt * 10);
        this.camY += (spec.y + this.freePanOffsetY - this.camY) * Math.min(1, dt * 10);
      }
    } else if (player) {
      let targetCamX = player.x + this.freePanOffsetX;
      let targetCamY = player.y + this.freePanOffsetY;
      if (this.settings.controls.aimPanning && this.aimPreview.active) {
        targetCamX += Math.cos(this.aimPreview.angle) * 145;
        targetCamY += Math.sin(this.aimPreview.angle) * 145;
      }
      this.camX += (targetCamX - this.camX) * Math.min(1, dt * 11);
      this.camY += (targetCamY - this.camY) * Math.min(1, dt * 11);
    }
    this.camX = clamp(this.camX, 220, WORLD_SIZE - 220);
    this.camY = clamp(this.camY, 220, WORLD_SIZE - 220);
  }

  private renderFrame(): void {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const parent = this.canvas.parentElement;
    const cssW = this.canvas.clientWidth || parent?.clientWidth || this.canvas.getBoundingClientRect().width;
    const cssH = this.canvas.clientHeight || parent?.clientHeight || this.canvas.getBoundingClientRect().height;
    const w = Math.max(320, Math.floor(cssW * dpr));
    const h = Math.max(180, Math.floor(cssH * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    const baseZoom = (Math.min(w, h) / 760) * (this.settings.basics.cameraHeight === 'high' ? 0.88 : 1.05);
    const sceneState: RenderSceneState = {
      matchTimeSec: this.matchTimeSec,
      mapTheme: this.settings.basics.mapTheme,
      mapVariant: this.config.mapVariant,
      isBrawl: this.isBrawl,
      expLane: this.expLane,
      goldLane: this.goldLane,
      camX: this.camX,
      camY: this.camY,
      camViewW: w / baseZoom,
      camViewH: h / baseZoom,
      zoom: baseZoom,
      shakeTimer: this.shakeTimer,
      heroes: this.heroes,
      minions: this.minions,
      turrets: this.turrets,
      jungleMobs: this.jungleMobs,
      projectiles: this.projectiles,
      vfxs: this.vfxs,
      tempWalls: this.tempWalls,
      playerBlinded: Boolean(this.getPlayer() && (this.getPlayer()!.blindedTimer ?? 0) > 0),
      wisps: this.wisps,
      walkieGrasses: this.walkieGrasses,
      brawlShrines: this.brawlShrines,
      isSpectator: Boolean(this.config.isSpectator),
      pings: this.pings,
      tacticalPings: this.pingSystem.getActivePings(),
      visibleEnemyIds: this.lastVision.visibleEnemyIds,
      fogGhosts: this.lastVision.fogGhosts,
      blueVisionCircles: this.lastVision.blueVisionCircles,
      cycloneCds: this.cycloneCds,
      campSlainShortcut: this.campSlainShortcut,
      flyingCloudCd: this.flyingCloudCd,
      lockedTargetId: this.lockedTargetId,
      aimPreview: this.aimPreview,
      settings: this.settings
    };

    if (this.threeRenderer && this.threeRenderer.isAvailable()) {
      this.threeRenderer.render(sceneState);
    } else {
      renderBattlefield(this.ctx, w, h, sceneState);
    }

    if (this.minimapCanvas) {
      const mctx = this.minimapCanvas.getContext('2d');
      if (mctx) {
        renderMinimap(mctx, this.minimapCanvas.width, this.minimapCanvas.height, sceneState);
      }
    }
    if (this.extraMinimapCanvas) {
      const ectx = this.extraMinimapCanvas.getContext('2d');
      if (ectx) {
        renderMinimap(ectx, this.extraMinimapCanvas.width, this.extraMinimapCanvas.height, sceneState);
      }
    }
  }

  private executeBasicAttack(attacker: SimHero, kind: 'hero' | 'minion' | 'jungle' | 'turret', targetId: string): void {
    if (!attacker.alive || attacker.atkCd > 0 || (attacker.eggFormTimer ?? 0) > 0) return;
    if (attacker.ccType && (attacker.ccType === 'disarm' || getCcPriority(attacker.ccType) >= 3)) return;
    attacker.atkCd = 1 / Math.max(0.45, attacker.atkSpd);
    attacker.recalling = false;
    attacker.stealthTimer = 0;

    const isCrit = Math.random() < attacker.critChance;
    let rawDmg = attacker.physAtk * (isCrit ? attacker.critDmgPct : 1);
    if (attacker.orangeBuffTimer > 0) rawDmg += 45 + attacker.level * 5;

    // Miya Moon Blessing stacks
    if (attacker.heroDef.id === 'miya') {
      attacker.passiveStacks = Math.min(5, attacker.passiveStacks + 1);
      attacker.passiveTimer = 4.0;
    }

    if (attacker.isPlayer) mlbbAudio.playAttack(attacker.heroDef.isRanged, isCrit);

    const cb = this.getCallbacks();
    if (attacker.heroDef.isRanged) {
      cb.spawnProjectile({
        ownerId: attacker.id,
        team: attacker.team,
        x: attacker.x,
        y: attacker.y,
        vx: 0,
        vy: 0,
        radius: 11,
        rangeLeft: getEffectiveAttackRange(attacker) + 150,
        damage: rawDmg,
        damageType: 'physical',
        color: isCrit ? '#FACC15' : attacker.skinAccent,
        kind: 'basic',
        homingTargetId: targetId,
        life: 0.9,
        maxLife: 0.9
      });
    } else {
      cb.spawnVfx({
        kind: 'slash',
        x: attacker.x,
        y: attacker.y,
        radius: attacker.heroDef.attackRange * 0.72,
        color: isCrit ? '#FACC15' : attacker.skinAccent,
        ttl: 0.16,
        maxTtl: 0.16,
        angle: attacker.facing
      });
      if (kind === 'hero') {
        const tgt = this.heroes.find((h) => h.id === targetId && h.alive);
        if (tgt) cb.dealDamageToHero(attacker, tgt, rawDmg, 'physical', true, isCrit);
      } else if (kind === 'minion') {
        const tgt = this.minions.find((m) => m.id === targetId && m.alive);
        if (tgt) cb.dealDamageToMinion(attacker, tgt, rawDmg, 'physical');
      } else if (kind === 'jungle') {
        const tgt = this.jungleMobs.find((j) => j.id === targetId && j.alive);
        if (tgt) cb.dealDamageToJungle(attacker, tgt, rawDmg, 'physical');
      } else if (kind === 'turret') {
        const tgt = this.turrets.find((t) => t.id === targetId && t.alive);
        if (tgt) cb.dealDamageToTurret(attacker, tgt, rawDmg);
      }
    }
  }

  // ==================== PUBLIC PLAYER CONTROLS API ====================

  private getCameraYaw(): number {
    return this.threeRenderer && this.threeRenderer.isAvailable() ? MLBB_3D_CAMERA_YAW : 0;
  }

  public setMoveVector(vx: number, vy: number): void {
    const sx = clamp(vx, -1, 1);
    const sy = clamp(vy, -1, 1);
    const yaw = this.getCameraYaw();
    if (yaw !== 0) {
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      this.moveX = clamp(sx * c - sy * s, -1, 1);
      this.moveY = clamp(sx * s + sy * c, -1, 1);
    } else {
      this.moveX = sx;
      this.moveY = sy;
    }
  }

  public setHoldingAttack(holding: boolean, mode: 'hero' | 'minion' | 'turret' = 'hero'): void {
    this.holdingAttack = holding;
    this.attackMode = mode;
    if (holding) this.performPlayerBasicAttack(mode);
  }

  public performPlayerBasicAttack(mode: 'hero' | 'minion' | 'turret' = 'hero'): void {
    const p = this.getPlayer();
    if (!p || !p.alive || p.atkCd > 0) return;
    const range = getEffectiveAttackRange(p) + 55;

    if (mode === 'turret') {
      const t = this.turrets
        .filter((x) => x.alive && x.team !== p.team && dist(p.x, p.y, x.x, x.y) <= range + 45)
        .sort((a, b) => dist(p.x, p.y, a.x, a.y) - dist(p.x, p.y, b.x, b.y))[0];
      if (t) {
        p.facing = Math.atan2(t.y - p.y, t.x - p.x);
        this.executeBasicAttack(p, 'turret', t.id);
        return;
      }
    }

    if (mode === 'minion') {
      const m = this.minions
        .filter((x) => x.alive && x.team !== p.team && dist(p.x, p.y, x.x, x.y) <= range + 35)
        .sort((a, b) => a.hp - b.hp)[0];
      if (m) {
        p.facing = Math.atan2(m.y - p.y, m.x - p.x);
        this.executeBasicAttack(p, 'minion', m.id);
        return;
      }
      const j = this.jungleMobs
        .filter((x) => x.alive && dist(p.x, p.y, x.x, x.y) <= range + 45)
        .sort((a, b) => dist(p.x, p.y, a.x, a.y) - dist(p.x, p.y, b.x, b.y))[0];
      if (j) {
        p.facing = Math.atan2(j.y - p.y, j.x - p.x);
        this.executeBasicAttack(p, 'jungle', j.id);
        return;
      }
    }

    // Priority: Locked enemy hero -> Priority setting -> Minion -> Jungle -> Turret
    if (this.lockedTargetId) {
      const locked = this.heroes.find((h) => h.id === this.lockedTargetId && h.alive && dist(p.x, p.y, h.x, h.y) <= range + 60);
      if (locked) {
        p.facing = Math.atan2(locked.y - p.y, locked.x - p.x);
        this.executeBasicAttack(p, 'hero', locked.id);
        return;
      }
    }

    const candidates = this.heroes.filter(
      (h) => h.alive && h.team !== p.team && h.untargetableTimer <= 0 && h.stealthTimer <= 0 && dist(p.x, p.y, h.x, h.y) <= range
    );
    if (candidates.length > 0) {
      const prio = this.settings.controls.targetingPriority;
      candidates.sort((a, b) =>
        prio === 'lowest_hp'
          ? a.hp - b.hp
          : prio === 'lowest_pct'
            ? a.hp / a.maxHp - b.hp / b.maxHp
            : dist(p.x, p.y, a.x, a.y) - dist(p.x, p.y, b.x, b.y)
      );
      const tgt = candidates[0];
      p.facing = Math.atan2(tgt.y - p.y, tgt.x - p.x);
      this.executeBasicAttack(p, 'hero', tgt.id);
      return;
    }

    // Fallback: nearest minion, jungle, or turret
    const m = this.minions.find((x) => x.alive && x.team !== p.team && dist(p.x, p.y, x.x, x.y) <= range);
    if (m) {
      p.facing = Math.atan2(m.y - p.y, m.x - p.x);
      this.executeBasicAttack(p, 'minion', m.id);
      return;
    }
    const j = this.jungleMobs.find((x) => x.alive && dist(p.x, p.y, x.x, x.y) <= range + 25);
    if (j) {
      p.facing = Math.atan2(j.y - p.y, j.x - p.x);
      this.executeBasicAttack(p, 'jungle', j.id);
      return;
    }
    const t = this.turrets.find((x) => x.alive && x.team !== p.team && dist(p.x, p.y, x.x, x.y) <= range + 40);
    if (t) {
      p.facing = Math.atan2(t.y - p.y, t.x - p.x);
      this.executeBasicAttack(p, 'turret', t.id);
    }
  }

  public setLockedTarget(id: string | null): void {
    this.lockedTargetId = this.lockedTargetId === id ? null : id;
  }

  public setAimPreview(preview: Partial<RenderAimPreview>): void {
    const adjusted =
      preview.angle !== undefined ? { ...preview, angle: preview.angle + this.getCameraYaw() } : preview;
    this.aimPreview = { ...this.aimPreview, ...adjusted };
  }

  public castPlayerSkill(slot: 1 | 2 | 3, aimAngle?: number, aimDist?: number): boolean {
    const p = this.getPlayer();
    if (!p || !p.alive) return false;
    let angle = aimAngle !== undefined ? aimAngle + this.getCameraYaw() : p.facing;
    let distVal = aimDist ?? p.heroDef.skills[slot - 1].range * 0.65;

    // Auto-aim to locked or nearest enemy if tapped without explicit drag
    if (aimAngle === undefined) {
      const locked = this.lockedTargetId
        ? this.heroes.find((h) => h.id === this.lockedTargetId && h.alive)
        : null;
      const target =
        locked ??
        this.heroes
          .filter((h) => h.alive && h.team !== p.team && h.stealthTimer <= 0 && dist(p.x, p.y, h.x, h.y) <= Math.max(520, p.heroDef.skills[slot - 1].range + 80))
          .sort((a, b) => dist(p.x, p.y, a.x, a.y) - dist(p.x, p.y, b.x, b.y))[0];
      if (target) {
        angle = Math.atan2(target.y - p.y, target.x - p.x);
        distVal = dist(p.x, p.y, target.x, target.y);
      }
    }

    return castHeroSkill(p, slot, angle, distVal, {
      heroes: this.heroes,
      minions: this.minions,
      turrets: this.turrets,
      jungleMobs: this.jungleMobs,
      tempWalls: this.tempWalls,
      callbacks: this.getCallbacks(),
      matchTimeSec: this.matchTimeSec,
      noCooldown: this.cheatNoCooldown
    });
  }

  public castPlayerSkill4(aimAngle?: number): boolean {
    const p = this.getPlayer();
    if (!p || !p.alive || !isFourSkillHero(p.heroDef.id)) return false;
    if (this.playerSkill4Cd > 0) return false;
    const meta = FOUR_SKILL_HERO_META[p.heroDef.id];
    const angle = aimAngle !== undefined ? aimAngle + this.getCameraYaw() : p.facing;
    this.playerSkill4Cd = this.cheatNoCooldown ? 0.4 : meta.cd;
    p.facing = angle;
    p.speedBoostPct = Math.max(p.speedBoostPct, 0.35);
    p.speedBoostTimer = Math.max(p.speedBoostTimer, 2.2);
    p.shield += Math.round(180 + p.level * 28 + p.magicPow * 0.35);
    const cb = this.getCallbacks();
    const tx = clamp(p.x + Math.cos(angle) * 180, 80, WORLD_SIZE - 80);
    const ty = clamp(p.y + Math.sin(angle) * 180, 80, WORLD_SIZE - 80);
    cb.spawnVfx({ kind: 'burst', x: p.x, y: p.y, radius: 115, color: meta.color, ttl: 0.45, maxTtl: 0.45 });
    cb.spawnVfx({ kind: 'ring', x: tx, y: ty, radius: 135, color: meta.color, ttl: 0.5, maxTtl: 0.5 });
    const rawDmg = 210 + p.level * 36 + p.physAtk * 0.45 + p.magicPow * 0.65;
    const dType = p.role === 'Mage' || p.role === 'Support' ? 'magic' : 'physical';
    for (const h of this.heroes) {
      if (h.alive && h.team !== p.team && h.untargetableTimer <= 0 && dist(tx, ty, h.x, h.y) <= 165) {
        cb.dealDamageToHero(p, h, rawDmg, dType, false, false, meta.name);
        cb.applyCc(h, 'slow', 1.1, p);
      }
    }
    mlbbAudio.playSkill(2, dType);
    return true;
  }

  public castPlayerSpell(aimAngle?: number): boolean {
    const p = this.getPlayer();
    if (!p || !p.alive) return false;
    const worldAngle = aimAngle !== undefined ? aimAngle + this.getCameraYaw() : p.facing;
    return castBattleSpell(p, worldAngle, {
      heroes: this.heroes,
      minions: this.minions,
      turrets: this.turrets,
      jungleMobs: this.jungleMobs,
      callbacks: this.getCallbacks(),
      matchTimeSec: this.matchTimeSec,
      noCooldown: this.cheatNoCooldown
    });
  }

  public upgradePlayerSkill(slot: 1 | 2 | 3): void {
    const p = this.getPlayer();
    if (!p || p.skillPoints <= 0) return;
    const idx = slot - 1;
    const maxLvl = slot === 3 ? 3 : 6;
    const reqLvl = slot === 3 ? (p.skillLevels[2] === 0 ? 4 : p.skillLevels[2] === 1 ? 8 : 12) : 1;
    if (p.skillLevels[idx] >= maxLvl || p.level < reqLvl) return;
    p.skillLevels[idx]++;
    p.skillPoints--;
    mlbbAudio.playClick();
  }

  public triggerRecall(): void {
    const p = this.getPlayer();
    if (!p || !p.alive || p.recalling) return;
    p.recalling = true;
    p.recallTimer = 4.0;
    mlbbAudio.playClick();
  }

  public triggerRegen(): void {
    const p = this.getPlayer();
    if (!p || !p.alive || p.regenCd > 0) return;
    p.regenCd = 60;
    p.regenTimer = 5.0;
    this.vfxs.push({ id: `v_${this.entitySeq++}`, kind: 'ring', x: p.x, y: p.y, radius: 75, color: '#2CE58B', ttl: 0.6, maxTtl: 0.6 });
    mlbbAudio.playClick();
  }

  public triggerActiveItem(): void {
    const p = this.getPlayer();
    if (p) this.triggerActiveItemForHeroInternal(p);
  }

  private triggerActiveItemForHeroInternal(p: SimHero): void {
    if (!p.alive || p.activeItemCd > 0) return;
    const allIds = p.blessingId ? [...p.items, p.blessingId] : p.items;
    const activeDef = allIds.map((id) => getMlbbItemById(id)).find((it) => it?.activeKind);
    if (!activeDef || !activeDef.activeKind) return;
    const cdMult = getSpellOrActiveCdMultiplier(p);
    p.activeItemCd = p.isPlayer && this.cheatNoCooldown ? 2 : Math.round((activeDef.activeCd ?? 70) * cdMult);
    if (activeDef.activeKind === 'wind_chant') {
      p.physImmuneTimer = p.role === 'Marksman' ? 2.0 : 1.0;
      this.vfxs.push({ id: `v_${this.entitySeq++}`, kind: 'ring', x: p.x, y: p.y, radius: 90, color: '#FACC15', ttl: 0.7, maxTtl: 0.7 });
    } else if (activeDef.activeKind === 'winter_crown') {
      p.winterCrownTimer = 2.0;
      p.untargetableTimer = 2.0;
    } else if (activeDef.activeKind === 'conceal') {
      for (const h of this.heroes) {
        if (h.alive && h.team === p.team && dist(p.x, p.y, h.x, h.y) <= 460) {
          h.stealthTimer = 5.0;
          h.speedBoostPct = Math.max(h.speedBoostPct, 0.38);
          h.speedBoostTimer = 5.0;
        }
      }
    }
    if (p.isPlayer) mlbbAudio.playSkill(2, 'true');
  }

  public triggerFlyingCloud(): void {
    const p = this.getPlayer();
    if (!p || !p.alive || this.config.mapVariant !== 'flying_cloud' || this.flyingCloudCd > 0) return;
    if (dist(p.x, p.y, FLYING_CLOUD_BLUE.x, FLYING_CLOUD_BLUE.y) > FLYING_CLOUD_BLUE.radius + 70) return;
    this.flyingCloudCd = 35;
    p.dashVx = Math.cos(-Math.PI / 4) * 1400;
    p.dashVy = Math.sin(-Math.PI / 4) * 1400;
    p.dashTimer = 0.65;
    p.dashWallCross = true;
    p.ccImmuneTimer = 0.8;
    this.vfxs.push({ id: `v_${this.entitySeq++}`, kind: 'burst', x: p.x, y: p.y, radius: 110, color: '#E879F9', ttl: 0.6, maxTtl: 0.6 });
    mlbbAudio.playSkill(3, 'magic');
  }

  public triggerEmote(emoteId: string): void {
    const p = this.getPlayer();
    if (!p || !p.alive || p.emoteCd > 0) return;
    this.triggerHeroEmoteInternal(p, emoteId);
  }

  private triggerHeroEmoteInternal(hero: SimHero, emoteId: string): void {
    const em = getMlbbEmoteById(emoteId);
    hero.emoteCd = 3.5;
    hero.activeEmote = { icon: em.icon, callout: em.callout, color: em.color, ttl: 2.6 };
    this.vfxs.push({
      id: `v_${this.entitySeq++}`,
      kind: 'burst',
      x: hero.x,
      y: hero.y,
      radius: 75,
      color: em.color,
      ttl: 0.45,
      maxTtl: 0.45
    });
    if (hero.isPlayer) mlbbAudio.playEmote(em.sfx);
  }

  public sendQuickChat(text: string): void {
    const p = this.getPlayer();
    this.pushChat(p ? p.heroDef.name : 'You', 'blue', text);
    mlbbAudio.playClick();
  }

  private buildPingContext(): PingContextEntities {
    return {
      heroes: this.heroes.map((h) => ({
        id: h.id,
        heroId: h.heroDef.id,
        name: h.heroDef.name,
        team: h.team,
        x: h.x,
        y: h.y,
        alive: h.alive,
        visible: h.team === 'blue' || this.lastVision.visibleEnemyIds.has(h.id)
      })),
      turrets: this.turrets.map((t) => ({
        id: t.id,
        team: t.team,
        lane: t.lane,
        tier: t.tier,
        x: t.x,
        y: t.y,
        alive: t.alive
      })),
      objectives: this.jungleMobs.map((m) => ({
        id: m.id,
        kind: m.kind,
        name: m.name,
        x: m.x,
        y: m.y,
        alive: m.alive,
        respawnTimer: m.respawnTimer
      })),
      matchTimeSec: this.matchTimeSec,
      expLane: this.expLane,
      goldLane: this.goldLane,
      mapVariant: this.config.mapVariant
    };
  }

  public previewDragPing(kind: 'attack' | 'retreat' | 'gather', worldX: number, worldY: number): PingPreviewResult {
    return this.pingSystem.previewPingTarget(kind, worldX, worldY, 'blue', this.buildPingContext());
  }

  public sendTacticalPing(kind: MlbbPingKind, worldX?: number, worldY?: number): void {
    const p = this.getPlayer();
    const x = worldX ?? p?.x ?? 2000;
    const y = worldY ?? p?.y ?? 2000;
    const emitted = this.pingSystem.resolveAndEmitPing(
      kind,
      x,
      y,
      p ? p.heroDef.name : 'You',
      'blue',
      this.buildPingContext()
    );
    this.pushChat(p ? p.heroDef.name : 'You', 'blue', `[${emitted.icon}] ${emitted.label}`);
    mlbbAudio.playPing(emitted.kind);
  }

  public dragPingToWorld(kind: 'attack' | 'retreat' | 'gather' | 'missing', worldX: number, worldY: number): void {
    this.sendTacticalPing(kind, worldX, worldY);
  }

  public expandedMapTap(worldX: number, worldY: number, kind: MlbbPingKind = 'attack'): void {
    this.sendTacticalPing(kind, worldX, worldY);
  }

  public drawOmwRoute(worldPoints: { x: number; y: number }[]): void {
    if (worldPoints.length < 2) return;
    const p = this.getPlayer();
    const end = worldPoints[worldPoints.length - 1];
    const emitted = this.pingSystem.resolveAndEmitPing(
      'omw',
      end.x,
      end.y,
      p ? p.heroDef.name : 'You',
      'blue',
      this.buildPingContext(),
      worldPoints
    );
    this.pushChat(p ? p.heroDef.name : 'You', 'blue', `[🧭] ${emitted.label}`);
    mlbbAudio.playPing('omw');
  }

  public signalSkillStatus(slot: 1 | 2 | 3): void {
    const p = this.getPlayer();
    if (!p) return;
    const sk = p.heroDef.skills[slot - 1];
    const cd = Math.ceil(p.skillCds[slot - 1]);
    const label = slot === 3 ? 'Ultimate' : `Skill ${slot}`;
    const msg =
      p.skillLevels[slot - 1] <= 0
        ? `${label} (${sk.name}) Not Learned Yet!`
        : cd > 0
          ? `${label} (${sk.name}) Ready in ${cd}s!`
          : `${label} (${sk.name}) Ready!`;
    this.pingSystem.emitStatusSignal(p.heroDef.name, msg, '⚡', '#38BDF8');
    this.pushChat(p.heroDef.name, 'blue', `[STATUS] ${msg}`);
    mlbbAudio.playPing('status');
  }

  public signalSkill4Status(): void {
    const p = this.getPlayer();
    if (!p || !isFourSkillHero(p.heroDef.id)) return;
    const meta = FOUR_SKILL_HERO_META[p.heroDef.id];
    const cd = Math.ceil(this.playerSkill4Cd);
    const msg = cd > 0 ? `Skill 4 (${meta.name}) Ready in ${cd}s!` : `Skill 4 (${meta.name}) Ready!`;
    this.pingSystem.emitStatusSignal(p.heroDef.name, msg, meta.icon, meta.color);
    this.pushChat(p.heroDef.name, 'blue', `[STATUS] ${msg}`);
    mlbbAudio.playPing('status');
  }

  public signalLowHpStatus(): void {
    const p = this.getPlayer();
    if (!p) return;
    const pct = Math.max(1, Math.round((p.hp / Math.max(1, p.maxHp)) * 100));
    const msg = `Low HP (${pct}%), retreating!`;
    this.pingSystem.emitStatusSignal(p.heroDef.name, msg, '💔', '#FACC15');
    this.pushChat(p.heroDef.name, 'blue', `[STATUS] ${msg}`);
    mlbbAudio.playPing('retreat');
  }

  public signalLowManaStatus(): void {
    const p = this.getPlayer();
    if (!p || p.heroDef.resource === 'none') return;
    const pct = Math.max(0, Math.round((p.mana / Math.max(1, p.maxMana)) * 100));
    const resLabel = p.heroDef.resource === 'energy' ? 'Energy' : 'Mana';
    const msg = `Low ${resLabel} (${pct}%)!`;
    this.pingSystem.emitStatusSignal(p.heroDef.name, msg, '💧', '#38BDF8');
    this.pushChat(p.heroDef.name, 'blue', `[STATUS] ${msg}`);
    mlbbAudio.playPing('status');
  }

  public signalSpellStatus(): void {
    const p = this.getPlayer();
    if (!p) return;
    const sp = getMlbbBattleSpellById(p.spellId);
    const cd = Math.ceil(p.spellCd);
    const msg = cd > 0 ? `${sp.name} Ready in ${cd}s!` : `${sp.name} Ready!`;
    this.pingSystem.emitStatusSignal(p.heroDef.name, msg, sp.icon, '#FACC15');
    this.pushChat(p.heroDef.name, 'blue', `[STATUS] ${msg}`);
    mlbbAudio.playPing('status');
  }

  public signalItemNeed(itemId: string): void {
    const p = this.getPlayer();
    const item = getMlbbItemById(itemId);
    if (!p || !item) return;
    const discount = p.talents.t2 === 'bargain_hunter' ? 0.05 : 0;
    const { effectiveCost } = computeMlbbEffectiveCost(itemId, p.items, discount);
    const need = Math.max(0, Math.ceil(effectiveCost - p.gold));
    const msg = need > 0 ? `Need ${need}g for ${item.name}!` : `Ready to buy ${item.name}!`;
    this.pingSystem.emitStatusSignal(p.heroDef.name, msg, '💰', '#F5C451');
    this.pushChat(p.heroDef.name, 'blue', `[GOLD] ${msg}`);
    mlbbAudio.playPing('status');
  }

  public signalScoreboardTarget(heroId: string, kind: 'focus' | 'no_spell'): void {
    const p = this.getPlayer();
    const target = this.heroes.find((h) => h.id === heroId || h.heroDef.id === heroId);
    if (!p || !target) return;
    const sp = getMlbbBattleSpellById(target.spellId);
    if (kind === 'no_spell') {
      const rem = target.spellCd > 3 ? Math.ceil(target.spellCd) : sp.cooldown;
      this.trackedEnemySpells[target.id] = {
        heroId: target.id,
        heroName: target.heroDef.name,
        spellId: target.spellId,
        spellName: sp.name,
        spellIcon: sp.icon,
        remainingSec: rem,
        maxSec: sp.cooldown
      };
      const msg = `Enemy ${target.heroDef.name} used ${sp.name}! (${rem}s CD)`;
      this.pingSystem.emitStatusSignal(p.heroDef.name, msg, '⏱️', '#F59E0B');
      this.pushChat(p.heroDef.name, 'blue', `[TIMER] ${msg}`);
      mlbbAudio.playPing('status');
      return;
    }
    const msg = `Focus ${target.heroDef.name} in the next fight!`;
    this.pingSystem.emitStatusSignal(p.heroDef.name, msg, '🎯', '#FF3B4E');
    this.pushChat(p.heroDef.name, 'blue', `[ALERT] ${msg}`);
    mlbbAudio.playPing('attack');
  }

  public setMinimapCameraFocus(worldX: number, worldY: number): void {
    this.minimapCamFocus = {
      x: clamp(worldX, 220, WORLD_SIZE - 220),
      y: clamp(worldY, 220, WORLD_SIZE - 220)
    };
  }

  public clearMinimapCameraFocus(): void {
    this.minimapCamFocus = null;
  }

  public setSpectateTarget(heroId: string | null): void {
    this.spectateTargetId = heroId;
  }

  public setFreeCameraOffset(dx: number, dy: number): void {
    const sens = this.settings.controls.cameraPanSensitivity / 50;
    const yaw = this.getCameraYaw();
    const rx = yaw !== 0 ? dx * Math.cos(yaw) - dy * Math.sin(yaw) : dx;
    const ry = yaw !== 0 ? dx * Math.sin(yaw) + dy * Math.cos(yaw) : dy;
    this.freePanOffsetX = clamp(rx * sens * 6, -900, 900);
    this.freePanOffsetY = clamp(ry * sens * 6, -900, 900);
  }

  public resetFreeCamera(): void {
    this.freePanOffsetX = 0;
    this.freePanOffsetY = 0;
  }

  public buyItem(itemId: string): boolean {
    const p = this.getPlayer();
    if (!p) return false;
    const ok = this.buyItemForHeroInternal(p, itemId);
    if (ok) mlbbAudio.playGold();
    return ok;
  }

  private buyItemForHeroInternal(hero: SimHero, itemId: string): boolean {
    const item = getMlbbItemById(itemId);
    if (!item) return false;
    if (item.blessingKind) {
      hero.blessingId = item.id;
      if (item.blessingKind === 'jungle') hero.isJungler = true;
      if (item.blessingKind === 'roam') hero.isRoamer = true;
      return true;
    }
    const discount = hero.talents.t2 === 'bargain_hunter' ? 0.05 : 0;
    const res = applyMlbbItemPurchase(itemId, hero.items, hero.gold, discount);
    if (!res.ok) return false;
    hero.items = res.nextItems;
    hero.gold = res.nextGold;
    if (item.category === 'consumable') {
      hero.potionBuffTimer = item.consumableDurationSec ?? 120;
      hero.potionBuffKind = itemId.includes('power') ? 'power' : itemId.includes('magic') ? 'magic' : 'rock';
      this.vfxs.push({
        id: `v_${this.entitySeq++}`,
        kind: 'ring',
        x: hero.x,
        y: hero.y,
        radius: 85,
        color: '#E879F9',
        ttl: 0.7,
        maxTtl: 0.7
      });
    }
    if (hero.prioritizedItemId === itemId) hero.prioritizedItemId = null;
    this.recalcHeroStats(hero, false);
    return true;
  }

  public sellItem(slotIndex: number): boolean {
    const p = this.getPlayer();
    if (!p || slotIndex < 0 || slotIndex >= p.items.length) return false;
    const id = p.items[slotIndex];
    const refund = computeMlbbSellRefund(id);
    p.items.splice(slotIndex, 1);
    p.gold += refund;
    this.recalcHeroStats(p, false);
    mlbbAudio.playGold();
    return true;
  }

  public prioritizeItem(itemId: string | null): void {
    const p = this.getPlayer();
    if (p) p.prioritizedItemId = itemId;
  }

  public switchBuildPreset(slotIdx: 0 | 1 | 2, buildItems: string[]): void {
    const p = this.getPlayer();
    if (!p) return;
    p.activeBuildIdx = slotIdx;
    p.buildPlan = [...buildItems];
  }

  public pingNeedGoldForItem(itemId: string): void {
    const p = this.getPlayer();
    const it = getMlbbItemById(itemId);
    if (!p || !it) return;
    const discount = p.talents.t2 === 'bargain_hunter' ? 0.05 : 0;
    const effCost = computeMlbbEffectiveCost(itemId, p.items, discount).effectiveCost;
    const missing = Math.max(0, effCost - Math.round(p.gold));
    const msg =
      missing > 0
        ? `Need ${missing.toLocaleString()} more Gold for [${it.name}]!`
        : `Ready to buy [${it.name}] (${effCost.toLocaleString()}g)!`;
    this.pushChat(p.heroDef.name, 'blue', msg);
    mlbbAudio.playPing('status');
  }

  public initiateSurrender(): void {
    if (this.matchTimeSec < MLBB_TIMERS.SURRENDER_UNLOCK && this.config.mode !== 'practice') return;
    if (this.surrenderVote && this.surrenderVote.active) return;
    this.surrenderElapsedSec = 0;
    this.surrenderResolveDelay = 0;
    this.surrenderVote = {
      active: true,
      yes: 1,
      no: 0,
      slots: ['yes', 'pending', 'pending', 'pending', 'pending'],
      remainingSec: 12,
      status: 'voting'
    };
    // Staggered realistic ally responses across Slots 2..5 (shows green ✓ and red ✕ progression)
    this.surrenderSchedule = [
      { slotIdx: 1, atSec: 0.65, vote: 'yes', applied: false },
      { slotIdx: 2, atSec: 1.25, vote: 'no', applied: false },
      { slotIdx: 3, atSec: 1.85, vote: 'yes', applied: false },
      { slotIdx: 4, atSec: 2.45, vote: 'yes', applied: false }
    ];
    this.pushChat('System', 'sys', 'Surrender vote initiated (1/5). Waiting for allies...');
    mlbbAudio.playPing('retreat');
  }

  // Practice Mode Cheats (Full 11+ Master Prompt Training Suite)
  public practiceCheat(
    action:
      | 'gold'
      | 'gold_10k'
      | 'level'
      | 'max_level'
      | 'no_cd'
      | 'god_mode'
      | 'spawn_wave'
      | 'spawn_dummy'
      | 'spawn_normal_bot'
      | 'spawn_jungle'
      | 'spawn_turtle'
      | 'spawn_lord'
      | 'clear_minions'
      | 'turret_invincible'
      | 'reset_pos'
      | 'reset_dummy_dps'
      | 'level_bot'
      | 'end_win'
  ): void {
    const p = this.getPlayer();
    if (!p) return;
    if (action === 'gold') {
      this.grantGoldAndXp(p, 1000, 0, p.x, p.y);
      mlbbAudio.playGold();
    } else if (action === 'gold_10k') {
      this.grantGoldAndXp(p, 10000, 0, p.x, p.y);
      mlbbAudio.playGold();
    } else if (action === 'level') {
      this.grantGoldAndXp(p, 0, p.xpToNext, p.x, p.y);
    } else if (action === 'max_level') {
      while (p.level < 15) this.grantGoldAndXp(p, 0, p.xpToNext, p.x, p.y);
    } else if (action === 'no_cd') {
      this.cheatNoCooldown = !this.cheatNoCooldown;
      if (this.cheatNoCooldown) {
        p.skillCds = [0, 0, 0];
        p.spellCd = 0;
        this.playerSkill4Cd = 0;
      }
    } else if (action === 'god_mode') {
      this.cheatGodMode = !this.cheatGodMode;
      p.hp = p.maxHp;
    } else if (action === 'turret_invincible') {
      this.cheatTurretsInvincible = !this.cheatTurretsInvincible;
      this.pushChat('Practice', 'sys', `Turret Invincibility: ${this.cheatTurretsInvincible ? 'ON' : 'OFF'}`);
    } else if (action === 'clear_minions') {
      this.minions = [];
      this.pushChat('Practice', 'sys', 'Cleared all lane minions!');
    } else if (action === 'reset_pos') {
      p.x = BLUE_FOUNTAIN.x + 85;
      p.y = BLUE_FOUNTAIN.y - 85;
      p.hp = p.maxHp;
      p.mana = p.maxMana;
      this.pushChat('Practice', 'sys', 'Teleported back to Allied Fountain.');
    } else if (action === 'spawn_wave') {
      this.spawnMinionWave();
    } else if (action === 'spawn_jungle') {
      for (const m of this.jungleMobs) {
        if (m.kind !== 'turtle' && m.kind !== 'lord') {
          m.alive = true;
          m.hp = m.maxHp;
          m.respawnTimer = 0;
        }
      }
      this.pushChat('Practice', 'sys', 'Respawned all Jungle Creeps & Buffs!');
    } else if (action === 'spawn_normal_bot') {
      const def = getMlbbHeroById('zilong');
      const dx = clamp(p.x + Math.cos(p.facing) * 240, 120, WORLD_SIZE - 120);
      const dy = clamp(p.y + Math.sin(p.facing) * 240, 120, WORLD_SIZE - 120);
      const bot: SimHero = {
        ...p,
        id: `practice_bot_${this.entitySeq++}`,
        name: 'Combat Bot',
        team: 'red',
        heroDef: def,
        skinColor: def.primaryColor,
        skinAccent: def.accentColor,
        isPlayer: false,
        isTrainingDummy: false,
        x: dx,
        y: dy,
        vx: 0,
        vy: 0,
        level: p.level,
        items: [...def.recommendedBuild.slice(0, 3)],
        damageLog: [],
        ccLog: [],
        lastDeathRecap: null,
        recentDamagers: {},
        alive: true
      };
      this.recalcHeroStats(bot, true);
      this.heroes.push(bot);
      this.pushChat('Practice', 'sys', `Spawned Level ${p.level} Combat Bot (${def.name})!`);
    } else if (action === 'spawn_dummy') {
      const existing = this.heroes.find((h) => h.isTrainingDummy);
      const dx = clamp(p.x + Math.cos(p.facing) * 200, 120, WORLD_SIZE - 120);
      const dy = clamp(p.y + Math.sin(p.facing) * 200, 120, WORLD_SIZE - 120);
      if (existing) {
        existing.x = dx;
        existing.y = dy;
        existing.hp = existing.maxHp;
        existing.alive = true;
      } else {
        const def = getMlbbHeroById('tigreal');
        const dummy: SimHero = {
          ...p,
          id: 'practice_dummy',
          name: 'Training Dummy',
          team: 'red',
          heroDef: { ...def, name: 'DPS Dummy', weaponIcon: '🎯' },
          skinColor: '#F59E0B',
          skinAccent: '#FEF08A',
          isPlayer: false,
          isTrainingDummy: true,
          x: dx,
          y: dy,
          vx: 0,
          vy: 0,
          level: 15,
          hp: 20000,
          maxHp: 20000,
          hpTrail: 20000,
          shield: 0,
          physDef: 60,
          magicDef: 60,
          items: [],
          damageLog: [],
          ccLog: [],
          lastDeathRecap: null,
          recentDamagers: {},
          alive: true
        };
        this.heroes.push(dummy);
      }
      this.pushChat('Practice', 'sys', 'Spawned 20,000 HP Training Dummy in front of you!');
    } else if (action === 'spawn_turtle') {
      const turtle = this.jungleMobs.find((m) => m.kind === 'turtle');
      if (turtle) {
        turtle.alive = true;
        turtle.hp = turtle.maxHp;
        turtle.respawnTimer = 0;
        this.pushAnnouncer('PRACTICE: TURTLE SPAWNED!', 'River Pit ready for Retribution testing!', '#2CE58B');
      }
    } else if (action === 'spawn_lord') {
      const lord = this.jungleMobs.find((m) => m.kind === 'lord');
      if (lord) {
        lord.alive = true;
        lord.hp = lord.maxHp;
        lord.respawnTimer = 0;
        this.pushAnnouncer('PRACTICE: LORD SPAWNED!', 'Sanctuary Lord ready in the river pit!', '#F59E0B');
      }
    } else if (action === 'reset_dummy_dps') {
      this.dummyDamageEvents = [];
      this.dummyTotalDmg = 0;
      this.dummyLastHit = 0;
      this.dummyPeakBurst = 0;
      const d = this.heroes.find((h) => h.isTrainingDummy);
      if (d) d.hp = d.maxHp;
      this.pushChat('Practice', 'sys', 'Reset Training Dummy DPS & Burst counters.');
    } else if (action === 'level_bot') {
      let leveled = 0;
      for (const h of this.heroes) {
        if (h.team === 'red' && !h.isTrainingDummy && h.level < 15) {
          this.grantGoldAndXp(h, 800, h.xpToNext, h.x, h.y);
          leveled++;
        }
      }
      this.pushChat('Practice', 'sys', leveled > 0 ? `Leveled up ${leveled} enemy bot(s) +800g!` : 'Enemy bots are already Lv.15.');
    } else if (action === 'end_win') {
      this.finishMatch(true);
    }
  }

  private pushAnnouncer(text: string, sub: string, color: string): void {
    this.announcer = { text, sub, color, ttl: 3.4 };
  }

  private pushChat(sender: string, team: 'blue' | 'red' | 'sys', text: string): void {
    this.chatFeed = [...this.chatFeed.slice(-7), { id: this.chatSeq++, sender, team, text }];
  }

  private buildScoreboardSummaries(): MlbbMatchPlayerSummary[] {
    const blueTotal = Math.max(1, this.blueKills);
    const redTotal = Math.max(1, this.redKills);
    const list: MlbbMatchPlayerSummary[] = this.heroes.map((h) => {
      const teamTotal = h.team === 'blue' ? blueTotal : redTotal;
      const tfPct = Math.min(100, Math.round(((h.kills + h.assists) / teamTotal) * 100));
      const { rating, medal } = computeMatchRatingAndMedal(h.kills, h.deaths, h.assists, h.damageDealt, h.turretDamage, tfPct);
      return {
        id: h.id,
        name: h.name,
        team: h.team,
        heroId: h.heroDef.id,
        heroName: h.heroDef.name,
        role: h.role,
        lane: h.lane,
        isPlayer: h.isPlayer,
        level: h.level,
        kills: h.kills,
        deaths: h.deaths,
        assists: h.assists,
        gold: Math.round(h.totalGold),
        items: [...h.items],
        spellId: h.spellId,
        emblemId: h.emblemId,
        coreTalentId: h.talents.t3,
        damageDealt: Math.round(h.damageDealt),
        damageTaken: Math.round(h.damageTaken),
        turretDamage: Math.round(h.turretDamage),
        teamfightPct: tfPct,
        rating,
        medal,
        isMvp: false
      };
    });

    // Mark Win MVP & Losing MVP
    for (const team of ['blue', 'red'] as const) {
      const tPlayers = list.filter((p) => p.team === team);
      tPlayers.sort((a, b) => b.rating - a.rating);
      if (tPlayers[0]) {
        tPlayers[0].isMvp = true;
        tPlayers[0].medal = 'MVP';
      }
    }
    return list;
  }

  private finishMatch(victory: boolean): void {
    if (this.matchEnded) return;
    this.matchEnded = true;
    mlbbAudio.playFanfare(victory);
    const players = this.buildScoreboardSummaries();
    const me = players.find((p) => p.isPlayer) ?? players[0];
    const record: MlbbMatchRecord = {
      id: `match_${Date.now()}`,
      timestamp: Date.now(),
      mode: this.config.mode,
      victory,
      durationSec: Math.round(this.matchTimeSec),
      blueKills: this.blueKills,
      redKills: this.redKills,
      playerHeroId: me.heroId,
      playerHeroName: me.heroName,
      kda: [me.kills, me.deaths, me.assists],
      rating: me.rating,
      medal: me.medal,
      items: [...me.items],
      players
    };
    this.onMatchEnd(record);
  }

  private buildHudSnapshot(): MlbbHudSnapshot {
    const p = this.getPlayer() ?? this.heroes[0];
    const spellDef = getMlbbBattleSpellById(p.spellId);
    const activeItemIds = p.blessingId ? [...p.items, p.blessingId] : p.items;
    const activeItemDef = activeItemIds.map((id) => getMlbbItemById(id)).find((it) => it?.activeKind);

    const activeBuffs: MlbbActiveBuffHud[] = [];
    if (p.orangeBuffTimer > 0) activeBuffs.push({ id: 'orange', label: 'Orange Buff', icon: '🟠', remaining: p.orangeBuffTimer, max: MLBB_TIMERS.BUFF_DURATION, color: '#F97316' });
    if (p.purpleBuffTimer > 0) activeBuffs.push({ id: 'purple', label: 'Purple Buff', icon: '🟣', remaining: p.purpleBuffTimer, max: MLBB_TIMERS.BUFF_DURATION, color: '#A855F7' });
    if (p.turtleKillerBuffTimer > 0) activeBuffs.push({ id: 'turtle_killer', label: 'Turtle Killer', icon: '🐢', remaining: p.turtleKillerBuffTimer, max: 60, color: '#34D399' });
    else if (p.turtleBuffTimer > 0) activeBuffs.push({ id: 'turtle', label: 'Turtle Blessing', icon: '🐢', remaining: p.turtleBuffTimer, max: 60, color: '#2CE58B' });
    if (p.goldCrabBuffTimer > 0) activeBuffs.push({ id: 'gold_crab', label: 'Gold Buff', icon: '🦀', remaining: p.goldCrabBuffTimer, max: MLBB_TIMERS.CRAB_GOLD_BUFF_DURATION, color: '#FACC15' });
    if (p.evolvedLordAuraTimer > 0) activeBuffs.push({ id: 'evolved_lord', label: 'Lord Aura -20%', icon: '👑', remaining: p.evolvedLordAuraTimer, max: 1, color: '#F59E0B' });
    if (p.inspireTimer > 0) activeBuffs.push({ id: 'inspire', label: 'Inspire', icon: '🔥', remaining: p.inspireTimer, max: 5, color: '#FB7185' });
    if (p.vengeanceTimer > 0) activeBuffs.push({ id: 'veng', label: 'Vengeance', icon: '🛡️', remaining: p.vengeanceTimer, max: 3.0, color: '#A855F7' });
    if (p.physImmuneTimer > 0) activeBuffs.push({ id: 'won', label: 'Wind Chant', icon: '🌪️', remaining: p.physImmuneTimer, max: 2, color: '#FACC15' });
    if (p.potionBuffTimer > 0 && p.potionBuffKind) {
      activeBuffs.push({
        id: 'potion',
        label: p.potionBuffKind === 'power' ? 'Power Potion' : p.potionBuffKind === 'magic' ? 'Magic Potion' : 'Rock Potion',
        icon: '🧪',
        remaining: p.potionBuffTimer,
        max: 120,
        color: '#E879F9'
      });
    }
    appendEquipmentHudBuffs(p, activeBuffs);

    const skills = p.heroDef.skills.map((sk, idx) => {
      const slot = (idx + 1) as 1 | 2 | 3;
      const lvl = p.skillLevels[idx];
      const maxLevel = slot === 3 ? 3 : 6;
      const reqLvl = slot === 3 ? (lvl === 0 ? 4 : lvl === 1 ? 8 : 12) : 1;
      const cdIdx = clamp(lvl - 1, 0, sk.cooldown.length - 1);
      return {
        slot,
        name: sk.name,
        icon: sk.icon,
        color: sk.color,
        level: lvl,
        maxLevel,
        canUpgrade: p.skillPoints > 0 && lvl < maxLevel && p.level >= reqLvl,
        cd: p.skillCds[idx],
        maxCd: sk.cooldown[cdIdx],
        manaCost: sk.manaCost,
        hasMana: p.heroDef.resource !== 'mana' || p.mana >= sk.manaCost,
        telegraph: sk.telegraph,
        range: sk.range,
        radius: sk.radius,
        recastActive: p.recastSlot === slot && p.recastTimer > 0
      };
    }) as MlbbHudSnapshot['skills'];

    const teammates = this.heroes
      .filter((h) => h.team === 'blue' && !h.isPlayer)
      .map((h) => ({
        id: h.id,
        heroId: h.heroDef.id,
        name: h.heroDef.name,
        color: h.skinColor,
        hpPct: h.hp / h.maxHp,
        alive: h.alive,
        respawnSec: Math.ceil(h.respawnTimer),
        ultReady: h.skillLevels[2] > 0 && h.skillCds[2] <= 0
      }));

    const nearbyEnemies = this.heroes
      .filter((h) => h.alive && h.team === 'red' && h.stealthTimer <= 0 && dist(p.x, p.y, h.x, h.y) <= 780)
      .sort((a, b) => dist(p.x, p.y, a.x, a.y) - dist(p.x, p.y, b.x, b.y))
      .slice(0, 5)
      .map((h) => ({
        id: h.id,
        heroId: h.heroDef.id,
        name: h.heroDef.name,
        color: h.skinColor,
        hpPct: h.hp / h.maxHp,
        dist: Math.round(dist(p.x, p.y, h.x, h.y))
      }));

    return {
      matchTimeSec: this.matchTimeSec,
      mode: this.config.mode,
      mapVariant: this.config.mapVariant,
      expLane: this.expLane,
      goldLane: this.goldLane,
      blueKills: this.blueKills,
      redKills: this.redKills,
      fps: this.fps,
      pingMs: this.settings.network.speedMode ? 14 : 26,
      player: {
        id: p.id,
        heroId: p.heroDef.id,
        name: p.heroDef.name,
        x: Math.round(p.x),
        y: Math.round(p.y),
        passiveName: p.heroDef.passiveName,
        level: p.level,
        xpPct: p.level >= 15 ? 1 : p.xp / Math.max(1, p.xpToNext),
        skillPoints: p.skillPoints,
        hp: Math.round(p.hp),
        maxHp: p.maxHp,
        shield: Math.round(p.shield),
        mana: Math.round(p.mana),
        maxMana: p.maxMana,
        resource: p.heroDef.resource,
        gold: Math.round(p.gold),
        totalGold: Math.round(p.totalGold),
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
        alive: p.alive,
        respawnSec: Math.ceil(p.respawnTimer),
        inBush: p.inBush,
        spottedByEnemy: p.spottedByEnemy,
        turretAlert: this.playerTurretAlert,
        deathRecap: p.lastDeathRecap,
        recalling: p.recalling,
        recallProg: p.recalling ? 1 - p.recallTimer / 4.0 : 0,
        regening: p.regenTimer > 0,
        items: [...p.items],
        blessingId: p.blessingId,
        prioritizedItemId: p.prioritizedItemId,
        activeBuildIdx: p.activeBuildIdx,
        junglerStacks: p.junglerStacks,
        roamGold: p.roamGold,
        isJungler: p.isJungler,
        isRoamer: p.isRoamer,
        passiveStacks: p.passiveStacks,
        ccText: p.ccType ? p.ccType.toUpperCase() : '',
        nearFlyingCloud:
          this.config.mapVariant === 'flying_cloud' &&
          dist(p.x, p.y, FLYING_CLOUD_BLUE.x, FLYING_CLOUD_BLUE.y) <= FLYING_CLOUD_BLUE.radius + 70,
        flyingCloudReady: this.flyingCloudCd <= 0,
        stats: {
          physAtk: p.physAtk,
          magicPow: p.magicPow,
          physDef: p.physDef,
          magicDef: p.magicDef,
          flatPhysPen: p.flatPhysPen,
          pctPhysPen: p.pctPhysPen,
          flatMagicPen: p.flatMagicPen,
          pctMagicPen: p.pctMagicPen,
          atkSpd: p.atkSpd,
          critChance: p.critChance,
          cdrPct: p.cdrPct,
          moveSpd: p.moveSpd,
          lifestealPct: p.lifestealPct,
          spellVampPct: p.spellVampPct
        }
      },
      skills,
      extraSkill4: isFourSkillHero(p.heroDef.id)
        ? {
            slot: 4,
            name: FOUR_SKILL_HERO_META[p.heroDef.id].name,
            icon: FOUR_SKILL_HERO_META[p.heroDef.id].icon,
            color: FOUR_SKILL_HERO_META[p.heroDef.id].color,
            level: 1,
            maxLevel: 1,
            canUpgrade: false,
            cd: this.playerSkill4Cd,
            maxCd: FOUR_SKILL_HERO_META[p.heroDef.id].cd,
            manaCost: 0,
            hasMana: true,
            telegraph: 'circle',
            range: 280,
            radius: 135,
            recastActive: false
          }
        : null,
      isSpectator: Boolean(this.config.isSpectator),
      rendererMode: this.threeRenderer && this.threeRenderer.isAvailable() ? '3d' : '2d',
      spell: {
        id: p.spellId,
        name: spellDef.name,
        icon: spellDef.icon,
        color: spellDef.color,
        cd: p.spellCd,
        maxCd: spellDef.cooldown
      },
      recallCd: p.recallCd,
      regenCd: p.regenCd,
      activeItem: activeItemDef
        ? {
            id: activeItemDef.id,
            name: activeItemDef.activeName ?? activeItemDef.name,
            icon: activeItemDef.icon,
            cd: p.activeItemCd,
            maxCd: activeItemDef.activeCd ?? 70
          }
        : null,
      emoteCd: p.emoteCd,
      activeBuffs,
      teammates,
      nearbyEnemies,
      lockedTargetId: this.lockedTargetId,
      spectateTargetId: this.spectateTargetId,
      autoDirectorActive: this.autoDirector,
      playbackSpeed: this.timeScale,
      paused: this.paused,
      cameraFreePanActive: this.minimapCamFocus !== null || Math.abs(this.freePanOffsetX) > 4 || Math.abs(this.freePanOffsetY) > 4,
      announcer: this.announcer ? { ...this.announcer } : null,
      objectiveBanner: this.objectiveBanner,
      chatFeed: this.chatFeed,
      pingFeed: this.pingSystem.getFeed(),
      scoreboard: this.buildScoreboardSummaries(),
      trackedEnemySpells: Object.values(this.trackedEnemySpells)
        .map((e) => ({ ...e, remainingSec: Math.ceil(e.remainingSec) }))
        .sort((a, b) => a.remainingSec - b.remainingSec),
      surrenderAvailable: this.matchTimeSec >= MLBB_TIMERS.SURRENDER_UNLOCK || this.config.mode === 'practice',
      surrenderVote: this.surrenderVote
        ? { ...this.surrenderVote, slots: [...this.surrenderVote.slots] }
        : null,
      practiceCheats: {
        noCooldown: this.cheatNoCooldown,
        godMode: this.cheatGodMode,
        dummyAlive: this.heroes.some((h) => h.isTrainingDummy && h.alive),
        turretsInvincible: this.cheatTurretsInvincible,
        dummyDps: Math.round(
          this.dummyDamageEvents
            .filter((ev) => this.matchTimeSec - ev.time <= 5)
            .reduce((s, ev) => s + ev.amount, 0) / 5
        ),
        dummyLastHit: this.dummyLastHit,
        dummyTotalDmg: this.dummyTotalDmg,
        dummyPeakBurst: this.dummyPeakBurst
      },
      angelaAttachChoices:
        p.heroDef.id === 'angela' && p.skillLevels[2] > 0 && p.skillCds[2] <= 0
          ? teammates.filter((t) => t.alive).map((t) => ({ id: t.id, name: t.name, hpPct: t.hpPct, color: t.color }))
          : []
    };
  }
}
