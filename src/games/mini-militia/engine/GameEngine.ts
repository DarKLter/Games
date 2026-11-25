import {
  MiniMilitiaHudSnapshot,
  MiniMilitiaSave,
  MmAvatarConfig,
  MmGrenadeId,
  MmKillFeedItem,
  MmLoadoutDef,
  MmMapDef,
  MmMatchConfig,
  MmMatchSummary,
  MmNearbyPickupHud,
  MmPlatformRect,
  MmScoreboardRow,
  MmSettingsState,
  MmSpecialPerkId,
  MmTeam,
  MmWeaponMasteryStat
} from '../types';
import { getMmMapById } from '../data/maps';
import {
  canDualWieldPair,
  getMmGrenadeById,
  getMmWeaponById,
  MM_PREBUILT_LOADOUTS
} from '../data/weapons';
import { makeRandomAvatar, MM_BOT_NAMES, MM_SARGE_AVATAR } from '../data/progression';
import { mmAudio } from './AudioEngine';
import { drawDoodleSoldier, drawParallaxBackground, drawWeaponVector } from './DoodleRenderer';

interface WeaponSlotState {
  weaponId: string;
  mag: number;
  reserve: number;
}

interface SimSoldier {
  id: string;
  name: string;
  team: MmTeam;
  isPlayer: boolean;
  isSarge?: boolean;
  isBoss?: boolean;
  isTargetDummy?: boolean;
  avatar: MmAvatarConfig;
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  crouching: boolean;
  rollTimer: number;
  rollCooldown: number;
  aimAngle: number;
  walkPhase: number;
  hp: number;
  maxHp: number;
  lastDamagedAt: number;
  jetFuel: number;
  maxJetFuel: number;
  jetpacking: boolean;
  empDisabledTimer: number;
  boostTimer: number;
  burnTimer: number;
  burnAttackerId: string | null;
  spawnShieldTimer: number;
  alive: boolean;
  respawnTimer: number;
  activeSlot: WeaponSlotState;
  offhandSlot: WeaponSlotState | null;
  holsteredSlot: WeaponSlotState | null;
  fireCooldown: number;
  offhandFireCooldown: number;
  burstRemaining: number;
  burstTick: number;
  spinUpTimer: number;
  reloading: boolean;
  reloadTimer: number;
  reloadDuration: number;
  muzzleFlash: number;
  meleeTimer: number;
  meleeCooldown: number;
  grenadeType: MmGrenadeId;
  grenades: Record<MmGrenadeId, number>;
  perkId: MmSpecialPerkId;
  activeLoadoutId: string;
  kills: number;
  deaths: number;
  assists: number;
  captures: number;
  streak: number;
  bestStreak: number;
  multiKillCount: number;
  multiKillTimer: number;
  bestMultiKill: number;
  recentAttackers: Map<string, number>;
  carryingFlag: 'blue' | 'red' | null;
  speechText: string | null;
  speechTimer: number;
  aiThinkTimer: number;
  aiMoveDir: number;
  aiJetBurst: number;
  aiGoalX: number;
  aiGoalY: number;
  aiTargetId: string | null;
}

interface SimProjectile {
  id: number;
  ownerId: string;
  ownerTeam: MmTeam;
  weaponId: string;
  kind: 'bullet' | 'pellet' | 'rocket' | 'mortar' | 'flame' | 'emp' | 'saw';
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  headshotMult: number;
  splashRadius: number;
  ricochetsLeft: number;
  ttl: number;
  maxTtl: number;
  color: string;
  fromDualWield: boolean;
}

interface SimGrenade {
  id: number;
  ownerId: string;
  ownerTeam: MmTeam;
  kind: MmGrenadeId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fuse: number;
  stuck: boolean;
  armed: boolean;
  blinkPhase: number;
}

interface SimGasCloud {
  id: number;
  ownerId: string;
  ownerTeam: MmTeam;
  x: number;
  y: number;
  radius: number;
  ttl: number;
  maxTtl: number;
  tickAcc: number;
}

interface SimDroppedWeapon {
  id: string;
  weaponId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number;
}

interface SimPadRuntime {
  index: number;
  x: number;
  y: number;
  kind: 'weapon' | 'health' | 'boost' | 'ammo';
  weaponId: string | null;
  active: boolean;
  timer: number;
  respawnSec: number;
  pool: string[];
}

interface SimParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  ttl: number;
  maxTtl: number;
  gravity: number;
  kind: 'dot' | 'smoke' | 'ring' | 'casing' | 'beam';
  x2?: number;
  y2?: number;
}

interface SimFlag {
  team: 'blue' | 'red';
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  carrierId: string | null;
  droppedTimer: number;
}

const FIXED_DT = 1 / 60;
const BASE_GRAVITY = 980;
const BASE_MOVE_SPEED = 275;
const JETPACK_ACCEL = 1780;
const SOLDIER_W = 24;
const SOLDIER_H = 46;

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(bx - ax, by - ay);
}

export class MiniMilitiaGameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: MmMatchConfig;
  private map: MmMapDef;
  private settings: MmSettingsState;
  private allLoadouts: MmLoadoutDef[];
  private rankDiscountPct: number;
  private onHudUpdate: (snap: MiniMilitiaHudSnapshot) => void;
  private onMatchFinish: (summary: MmMatchSummary) => void;

  private rafId: number | null = null;
  private lastFrameTs = 0;
  private accDt = 0;
  private paused = false;
  private matchEnded = false;
  private matchTimeSec = 0;
  private timeRemainingSec = 300;
  private hudEmitAcc = 0;
  private fpsSamples = 60;
  private seq = 1;

  // World entities
  private soldiers: SimSoldier[] = [];
  private projectiles: SimProjectile[] = [];
  private grenades: SimGrenade[] = [];
  private gasClouds: SimGasCloud[] = [];
  private drops: SimDroppedWeapon[] = [];
  private pads: SimPadRuntime[] = [];
  private particles: SimParticle[] = [];
  private killFeed: MmKillFeedItem[] = [];
  private banner: { text: string; sub: string; color: string; ttl: number } | null = null;

  // Mode states
  private scoreBlue = 0;
  private scoreRed = 0;
  private flags: { blue: SimFlag; red: SimFlag };
  private ptbRound = 1;
  private ptbBlueRounds = 0;
  private ptbRedRounds = 0;
  private ptbBombState: 'carried' | 'planted' | 'defused' | 'exploded' = 'carried';
  private ptbBombTimer = 30;
  private ptbBombSite: 'A' | 'B' | null = null;
  private ptbBombX = 0;
  private ptbBombY = 0;
  private ptbActionProgress = 0;
  private survivalWave = 1;
  private survivalWaveClearTimer = 0;
  private bootcampStep = 0; // 0..6
  private bootcampMovedSec = 0;
  private bootcampFlewSec = 0;
  private bootcampTargetsKilled = 0;
  private bootcampZoomShotDone = false;
  private bootcampMeleeDone = false;
  private bootcampGrenadeDone = false;
  private bootcampDualDone = false;

  // Player session stats & telemetry
  private playerCoins = 0;
  private playerRankCashEarned = 0;
  private playerHeadshots = 0;
  private playerMeleeKills = 0;
  private playerGrenadeKills = 0;
  private playerDualKills = 0;
  private playerSniperHeadshots = 0;
  private playerMacheteKills = 0;
  private playerSmawKills = 0;
  private playerFlameKills = 0;
  private playerSawKills = 0;
  private playerFlagCaptures = 0;
  private playerBombActions = 0;
  private playerSuicides = 0;
  private weaponDeltas: Record<string, MmWeaponMasteryStat> = {};

  // Camera
  private camX = 600;
  private camY = 500;
  private currentZoom = 1.0;
  private targetZoom = 1.0;
  private shakeTimer = 0;
  private shakeMag = 0;

  // Inputs (Simultaneous Keyboard+Mouse & Touch Dual-Stick)
  private keys = new Set<string>();
  private mouseDown = false;
  private rightMouseDown = false;
  private mouseScreenX = 0;
  private mouseScreenY = 0;
  private mouseMoved = false;
  private touchMoveX = 0;
  private touchMoveY = 0;
  private touchAimActive = false;
  private touchAimAngle = 0;
  private touchAimAutoFire = false;
  private touchFireBtnDown = false;
  private touchCrouchBtn = false;
  private lastDownTapTs = 0;
  private lastMatchSummary: MmMatchSummary | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    config: MmMatchConfig,
    save: MiniMilitiaSave,
    rankDiscountPct: number,
    onHudUpdate: (snap: MiniMilitiaHudSnapshot) => void,
    onMatchFinish: (summary: MmMatchSummary) => void
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('2D canvas context unavailable');
    this.ctx = context;
    this.config = config;
    this.map = getMmMapById(config.mapId);
    this.settings = save.settings;
    this.allLoadouts = [...MM_PREBUILT_LOADOUTS, ...save.customLoadouts];
    this.rankDiscountPct = rankDiscountPct;
    this.playerCoins = save.coins;
    this.onHudUpdate = onHudUpdate;
    this.onMatchFinish = onMatchFinish;
    this.timeRemainingSec = config.mode === 'survival' || config.mode === 'bootcamp' ? 9999 : config.timeLimitSec;

    this.flags = {
      blue: {
        team: 'blue',
        homeX: this.map.blueFlagPos.x,
        homeY: this.map.blueFlagPos.y,
        x: this.map.blueFlagPos.x,
        y: this.map.blueFlagPos.y,
        carrierId: null,
        droppedTimer: 0
      },
      red: {
        team: 'red',
        homeX: this.map.redFlagPos.x,
        homeY: this.map.redFlagPos.y,
        x: this.map.redFlagPos.x,
        y: this.map.redFlagPos.y,
        carrierId: null,
        droppedTimer: 0
      }
    };

    this.initPads();
    this.initSoldiers(save);
    this.bindDesktopInputs();

    const p = this.getPlayer();
    if (p) {
      this.camX = p.x;
      this.camY = p.y;
    }
  }

  public start(): void {
    this.lastFrameTs = performance.now();
    const tick = (ts: number) => {
      const rawDt = Math.min(0.05, Math.max(0.001, (ts - this.lastFrameTs) / 1000));
      this.lastFrameTs = ts;
      this.fpsSamples = this.fpsSamples * 0.9 + (1 / rawDt) * 0.1;

      if (!this.paused && !this.matchEnded) {
        this.accDt += rawDt;
        while (this.accDt >= FIXED_DT) {
          this.stepSimulation(FIXED_DT);
          this.accDt -= FIXED_DT;
        }
      }
      this.renderFrame();

      this.hudEmitAcc += rawDt;
      if (this.hudEmitAcc >= 0.06) {
        this.hudEmitAcc = 0;
        this.emitHud();
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.emitHud();
    this.rafId = requestAnimationFrame(tick);
  }

  public destroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.unbindDesktopInputs();
  }

  public setPaused(p: boolean): void {
    this.paused = p;
    this.emitHud();
  }

  public updateSettings(next: MmSettingsState): void {
    this.settings = next;
    mmAudio.setVolumes(next.audio);
  }

  // ==================== PUBLIC INPUT & ACTION APIS ====================
  public setTouchMoveStick(nx: number, ny: number): void {
    this.touchMoveX = clamp(nx, -1, 1);
    this.touchMoveY = clamp(ny, -1, 1);
  }

  public setTouchAimStick(active: boolean, angle: number, mag: number): void {
    this.touchAimActive = active;
    if (active) {
      this.touchAimAngle = angle;
      const fireThresh = this.settings.controls.fireRingThreshold / 100;
      this.touchAimAutoFire =
        this.settings.controls.controlScheme === 'dual_stick' && mag >= fireThresh;
    } else {
      this.touchAimAutoFire = false;
    }
  }

  public setTouchFireButton(down: boolean): void {
    this.touchFireBtnDown = down;
  }

  public setTouchCrouch(down: boolean): void {
    if (down && !this.touchCrouchBtn) {
      const now = performance.now();
      if (now - this.lastDownTapTs < 320 && this.settings.controls.combatRollMode !== 'off') {
        this.triggerCombatRoll();
      }
      this.lastDownTapTs = now;
    }
    this.touchCrouchBtn = down;
  }

  public triggerCombatRoll(): void {
    const p = this.getPlayer();
    if (!p || !p.alive || p.rollCooldown > 0) return;
    const dir = Math.abs(p.vx) > 25 ? Math.sign(p.vx) : Math.cos(p.aimAngle) >= 0 ? 1 : -1;
    p.vx = dir * 470;
    p.rollTimer = 0.28;
    p.rollCooldown = 1.4;
    mmAudio.playMelee();
  }

  public triggerSwapWeapon(): void {
    const p = this.getPlayer();
    if (!p || !p.alive) return;
    if (p.offhandSlot) {
      // Collapse offhand into holstered or swap primary with holstered
      const prevOff = p.offhandSlot;
      p.offhandSlot = null;
      if (p.holsteredSlot) {
        const tmp = p.activeSlot;
        p.activeSlot = p.holsteredSlot;
        p.holsteredSlot = tmp;
      } else {
        p.holsteredSlot = prevOff;
      }
    } else if (p.holsteredSlot) {
      const tmp = p.activeSlot;
      p.activeSlot = p.holsteredSlot;
      p.holsteredSlot = tmp;
    } else {
      return;
    }
    p.reloading = false;
    p.spinUpTimer = 0;
    this.targetZoom = Math.min(this.targetZoom, this.getMaxZoomForPlayer(p));
    mmAudio.playClick();
    this.emitHud();
  }

  public triggerReload(): void {
    const p = this.getPlayer();
    if (!p || !p.alive || p.reloading) return;
    const w = getMmWeaponById(p.activeSlot.weaponId);
    if (w.isMelee || w.isShield || w.batteryAutoRefill) return;
    if (p.activeSlot.mag >= w.magSize && (!p.offhandSlot || p.offhandSlot.mag >= getMmWeaponById(p.offhandSlot.weaponId).magSize)) {
      return;
    }
    if (p.activeSlot.reserve <= 0 && (!p.offhandSlot || p.offhandSlot.reserve <= 0)) return;
    const speedMult = p.perkId === 'quick_hands' ? 0.8 : 1.0;
    p.reloading = true;
    p.reloadDuration = Math.max(0.5, w.reloadSec * speedMult);
    p.reloadTimer = p.reloadDuration;
    mmAudio.playReload();
  }

  public triggerMelee(): void {
    const p = this.getPlayer();
    if (!p || !p.alive || p.meleeCooldown > 0) return;
    this.executeMelee(p);
  }

  public triggerThrowGrenade(): void {
    const p = this.getPlayer();
    if (!p || !p.alive) return;
    this.throwGrenade(p);
  }

  public cycleGrenadeType(dir = 1): void {
    const p = this.getPlayer();
    if (!p) return;
    const order: MmGrenadeId[] = ['frag', 'gas', 'proxy', 'emp'];
    const idx = order.indexOf(p.grenadeType);
    p.grenadeType = order[(idx + dir + order.length) % order.length];
    mmAudio.playClick();
    this.emitHud();
  }

  public selectGrenadeType(id: MmGrenadeId): void {
    const p = this.getPlayer();
    if (!p) return;
    p.grenadeType = id;
    mmAudio.playClick();
    this.emitHud();
  }

  public cycleZoom(): void {
    const p = this.getPlayer();
    if (!p) return;
    const maxZ = this.getMaxZoomForPlayer(p);
    const steps = [1.0, 1.6, 2.5, 4.0, 7.0].filter((z) => z <= maxZ + 0.05);
    if (steps[steps.length - 1] < maxZ - 0.1) steps.push(maxZ);
    const curIdx = steps.findIndex((z) => Math.abs(z - this.targetZoom) < 0.2);
    this.targetZoom = steps[(curIdx + 1) % steps.length];
    mmAudio.playClick();
    this.emitHud();
  }

  public triggerPickup(dualWield = false): void {
    const p = this.getPlayer();
    if (!p || !p.alive) return;
    const near = this.findNearbyPickup(p);
    if (!near) return;
    const dropIdx = this.drops.findIndex((d) => d.id === near.id);
    if (dropIdx === -1) return;
    const drop = this.drops[dropIdx];
    const wDef = getMmWeaponById(drop.weaponId);

    if (dualWield && canDualWieldPair(p.activeSlot.weaponId, drop.weaponId)) {
      if (p.offhandSlot) {
        this.spawnDrop(p.offhandSlot.weaponId, p.x, p.y - 10);
      }
      p.offhandSlot = { weaponId: drop.weaponId, mag: wDef.magSize, reserve: wDef.reserveMax };
      this.drops.splice(dropIdx, 1);
      if (this.config.mode === 'bootcamp' && this.bootcampStep === 6) {
        this.bootcampDualDone = true;
      }
      mmAudio.playPickup();
      this.emitHud();
      return;
    }

    // Standard swap into active slot
    this.spawnDrop(p.activeSlot.weaponId, p.x, p.y - 10);
    p.activeSlot = { weaponId: drop.weaponId, mag: wDef.magSize, reserve: wDef.reserveMax };
    if (!wDef.oneHanded && p.offhandSlot) {
      this.spawnDrop(p.offhandSlot.weaponId, p.x + 12, p.y - 10);
      p.offhandSlot = null;
    }
    p.reloading = false;
    this.drops.splice(dropIdx, 1);
    mmAudio.playPickup();
    this.emitHud();
  }

  public triggerQuickChat(text: string): void {
    const p = this.getPlayer();
    if (!p) return;
    p.speechText = text;
    p.speechTimer = 3.2;
    mmAudio.playClick();
  }

  public selectRespawnLoadout(loadoutId: string): void {
    const p = this.getPlayer();
    if (!p) return;
    const ld = this.allLoadouts.find((l) => l.id === loadoutId);
    if (!ld) return;
    const cost = Math.round(ld.coinCost * (1 - this.rankDiscountPct / 100));
    if (cost > this.playerCoins) return;
    if (cost > 0) this.playerCoins -= cost;
    p.activeLoadoutId = ld.id;
    if (!p.alive) {
      this.applyLoadoutToSoldier(p, ld);
    }
    mmAudio.playClick();
    this.emitHud();
  }

  public swapPlayerTeam(): void {
    if (this.config.mode === 'ffa' || this.config.mode === 'survival' || this.config.mode === 'bootcamp') return;
    const p = this.getPlayer();
    if (!p) return;
    p.team = p.team === 'blue' ? 'red' : 'blue';
    this.respawnSoldier(p);
    this.emitHud();
  }

  // ==================== INITIALIZATION ====================
  private initPads(): void {
    this.pads = this.map.pads.map((pad, index) => {
      const pool = pad.weaponPool && pad.weaponPool.length > 0 ? pad.weaponPool : ['m4', 'ak47', 'uzi'];
      return {
        index,
        x: pad.x,
        y: pad.y,
        kind: pad.kind,
        weaponId: pad.kind === 'weapon' ? pool[0] : null,
        active: this.config.mapDrops || pad.kind === 'health' || this.config.classicV4,
        timer: 0,
        respawnSec: pad.respawnSec,
        pool
      };
    });
  }

  private initSoldiers(save: MiniMilitiaSave): void {
    const playerLoadout =
      this.allLoadouts.find((l) => l.id === save.activeLoadoutId) ?? MM_PREBUILT_LOADOUTS[0];

    if (this.config.mode === 'bootcamp') {
      // Boot Camp: Player + Sarge + Cardboard Targets
      const p = this.createSoldier({
        id: 'player',
        name: save.callsign,
        team: 'blue',
        isPlayer: true,
        avatar: save.avatarPresets[save.activeAvatarPreset] ?? save.avatarPresets[0],
        loadout: MM_PREBUILT_LOADOUTS[0]
      });
      p.x = 220;
      p.y = this.map.height - 160;
      this.soldiers.push(p);

      const sarge = this.createSoldier({
        id: 'sarge_ai',
        name: 'Sarge',
        team: 'blue',
        isPlayer: false,
        isSarge: true,
        avatar: MM_SARGE_AVATAR,
        loadout: MM_PREBUILT_LOADOUTS[2]
      });
      sarge.x = 310;
      sarge.y = this.map.height - 160;
      sarge.speechText = 'Welcome to Boot Camp! Move & Crouch (A/D + S)!';
      sarge.speechTimer = 6;
      this.soldiers.push(sarge);

      // Spawn 3 cardboard practice dummies
      [960, 1220, 1520].forEach((tx, idx) => {
        const d = this.createSoldier({
          id: `dummy_${idx}`,
          name: `Target #${idx + 1}`,
          team: 'red',
          isPlayer: false,
          isTargetDummy: true,
          avatar: makeRandomAvatar(`Target #${idx + 1}`),
          loadout: MM_PREBUILT_LOADOUTS[0]
        });
        d.x = tx;
        d.y = idx === 1 ? 820 : this.map.height - 140;
        d.hp = 60;
        d.maxHp = 60;
        this.soldiers.push(d);
      });
      // Drop Uzi nearby for step 7 dual-wield test
      this.spawnDrop('uzi', 520, this.map.height - 160);
      this.spawnDrop('m93ba', 420, this.map.height - 160);
      return;
    }

    if (this.config.mode === 'survival') {
      const p = this.createSoldier({
        id: 'player',
        name: save.callsign,
        team: 'blue',
        isPlayer: true,
        avatar: save.avatarPresets[save.activeAvatarPreset] ?? save.avatarPresets[0],
        loadout: playerLoadout
      });
      this.soldiers.push(p);

      const sarge = this.createSoldier({
        id: 'sarge_ai',
        name: 'Sarge',
        team: 'blue',
        isPlayer: false,
        isSarge: true,
        avatar: MM_SARGE_AVATAR,
        loadout: MM_PREBUILT_LOADOUTS[2]
      });
      sarge.speechText = 'Wave 1 inbound! Lock and load, soldier!';
      sarge.speechTimer = 5;
      this.soldiers.push(sarge);

      const allies = Math.max(0, Math.min(3, this.config.coopAllies ?? 0));
      for (let i = 0; i < allies; i++) {
        const botName = MM_BOT_NAMES[(i + 2) % MM_BOT_NAMES.length];
        this.soldiers.push(
          this.createSoldier({
            id: `ally_${i}`,
            name: botName,
            team: 'blue',
            isPlayer: false,
            avatar: makeRandomAvatar(botName),
            loadout: MM_PREBUILT_LOADOUTS[(i + 2) % MM_PREBUILT_LOADOUTS.length]
          })
        );
      }

      this.spawnSurvivalWave(1);
      return;
    }

    // Standard Multiplayer / Custom Room (TDM, FFA, CTF, PTB)
    for (const slot of this.config.slots) {
      const team: MmTeam = this.config.mode === 'ffa' ? 'ffa' : slot.team;
      const ld = slot.isPlayer
        ? playerLoadout
        : MM_PREBUILT_LOADOUTS[Math.floor(Math.random() * MM_PREBUILT_LOADOUTS.length)];
      const sol = this.createSoldier({
        id: slot.id,
        name: slot.name,
        team,
        isPlayer: slot.isPlayer,
        avatar: slot.avatar,
        loadout: ld
      });
      this.soldiers.push(sol);
    }

    if (this.config.mode === 'ptb') {
      this.resetPtbRound();
    }
  }

  private createSoldier(opts: {
    id: string;
    name: string;
    team: MmTeam;
    isPlayer: boolean;
    isSarge?: boolean;
    isBoss?: boolean;
    isTargetDummy?: boolean;
    avatar: MmAvatarConfig;
    loadout: MmLoadoutDef;
  }): SimSoldier {
    const sp = this.pickSpawnPoint(opts.team);
    const s: SimSoldier = {
      id: opts.id,
      name: opts.name,
      team: opts.team,
      isPlayer: opts.isPlayer,
      isSarge: opts.isSarge,
      isBoss: opts.isBoss,
      isTargetDummy: opts.isTargetDummy,
      avatar: opts.avatar,
      x: sp.x,
      y: sp.y,
      vx: 0,
      vy: 0,
      onGround: false,
      crouching: false,
      rollTimer: 0,
      rollCooldown: 0,
      aimAngle: opts.team === 'red' ? Math.PI : 0,
      walkPhase: 0,
      hp: 100,
      maxHp: 100,
      lastDamagedAt: -10,
      jetFuel: 100,
      maxJetFuel: 100,
      jetpacking: false,
      empDisabledTimer: 0,
      boostTimer: 0,
      burnTimer: 0,
      burnAttackerId: null,
      spawnShieldTimer: 2.0,
      alive: true,
      respawnTimer: 0,
      activeSlot: { weaponId: 'magnum', mag: 6, reserve: 54 },
      offhandSlot: null,
      holsteredSlot: { weaponId: 'deagle', mag: 7, reserve: 63 },
      fireCooldown: 0,
      offhandFireCooldown: 0,
      burstRemaining: 0,
      burstTick: 0,
      spinUpTimer: 0,
      reloading: false,
      reloadTimer: 0,
      reloadDuration: 1.5,
      muzzleFlash: 0,
      meleeTimer: 0,
      meleeCooldown: 0,
      grenadeType: 'frag',
      grenades: { frag: 2, gas: 1, proxy: 1, emp: 1 },
      perkId: opts.loadout.perkId,
      activeLoadoutId: opts.loadout.id,
      kills: 0,
      deaths: 0,
      assists: 0,
      captures: 0,
      streak: 0,
      bestStreak: 0,
      multiKillCount: 0,
      multiKillTimer: 0,
      bestMultiKill: 0,
      recentAttackers: new Map(),
      carryingFlag: null,
      speechText: null,
      speechTimer: 0,
      aiThinkTimer: 0.2,
      aiMoveDir: 1,
      aiJetBurst: 0,
      aiGoalX: sp.x,
      aiGoalY: sp.y,
      aiTargetId: null
    };
    this.applyLoadoutToSoldier(s, opts.loadout);
    return s;
  }

  private applyLoadoutToSoldier(s: SimSoldier, ld: MmLoadoutDef): void {
    s.perkId = ld.perkId;
    const nitroScale = this.config.nitroMode === '2x' ? 2.0 : 1.0;
    s.maxHp = s.isBoss ? 360 : ld.perkId === 'heavy_armor' ? 120 : 100;
    s.hp = s.maxHp;
    s.maxJetFuel = (ld.perkId === 'jet_booster' ? 125 : 100) * nitroScale;
    s.jetFuel = s.maxJetFuel;

    if (this.config.classicV4 && !s.isBoss) {
      // Classic V4 rules: spawn with Magnum + Deagle + 2 Frag grenades & loot the map!
      const mag = getMmWeaponById('magnum');
      const deg = getMmWeaponById('deagle');
      s.activeSlot = { weaponId: mag.id, mag: mag.magSize, reserve: mag.reserveMax };
      s.offhandSlot = null;
      s.holsteredSlot = { weaponId: deg.id, mag: deg.magSize, reserve: deg.reserveMax };
      s.grenadeType = 'frag';
      s.grenades = { frag: 2, gas: 0, proxy: 0, emp: 0 };
      return;
    }

    const pDef = getMmWeaponById(ld.primaryId);
    const secDef = getMmWeaponById(ld.secondaryId);
    s.activeSlot = { weaponId: pDef.id, mag: pDef.magSize, reserve: pDef.reserveMax };
    if (ld.dualWieldStart && canDualWieldPair(pDef.id, secDef.id)) {
      s.offhandSlot = { weaponId: secDef.id, mag: secDef.magSize, reserve: secDef.reserveMax };
      s.holsteredSlot = null;
    } else {
      s.offhandSlot = null;
      s.holsteredSlot = { weaponId: secDef.id, mag: secDef.magSize, reserve: secDef.reserveMax };
    }

    const bonusG = ld.perkId === 'grenadier' ? 2 : 0;
    s.grenadeType = ld.grenadeId;
    s.grenades = {
      frag: ld.grenadeId === 'frag' ? ld.grenadeCount + bonusG : 1,
      gas: ld.grenadeId === 'gas' ? ld.grenadeCount + bonusG : 1,
      proxy: ld.grenadeId === 'proxy' ? ld.grenadeCount + bonusG : 1,
      emp: ld.grenadeId === 'emp' ? ld.grenadeCount + bonusG : 1
    };
  }

  private pickSpawnPoint(team: MmTeam): { x: number; y: number } {
    const arr =
      team === 'blue'
        ? this.map.blueSpawns
        : team === 'red'
          ? this.map.redSpawns
          : this.map.ffaSpawns;
    const base = arr[Math.floor(Math.random() * arr.length)] ?? { x: 400, y: 400 };
    return { x: base.x + (Math.random() - 0.5) * 40, y: base.y };
  }

  private spawnSurvivalWave(wave: number): void {
    this.survivalWave = wave;
    // Clear dead wave bots
    this.soldiers = this.soldiers.filter((s) => s.team === 'blue');
    const isBossWave = wave % 5 === 0;
    const count = Math.min(8, 3 + Math.floor(wave * 0.7));

    for (let i = 0; i < count; i++) {
      const boss = isBossWave && i === 0;
      const pool =
        boss
          ? ['minigun', 'smaw', 'flamethrower', 'saw_gun']
          : wave <= 3
            ? ['pistol', 'deagle', 'uzi']
            : wave <= 6
              ? ['uzi', 'ak47', 'm4', 'mp5']
              : ['m93ba', 'spas12', 'aa12', 'smaw', 'flamethrower'];
      const wid = pool[Math.floor(Math.random() * pool.length)];
      const name = boss ? `JUGGERNAUT BOSS W${wave}` : wave <= 3 ? `Drone #${i + 1}` : `Trooper #${i + 1}`;
      const avatar = makeRandomAvatar(name);
      if (wave <= 3) {
        avatar.skinTone = '#9CA3AF';
        avatar.eyeStyle = 'cyber';
        avatar.headgear = 'space_visor';
      } else if (boss) {
        avatar.headgear = 'skull_mask';
        avatar.outfit = 'juggernaut';
      }
      const sol = this.createSoldier({
        id: `wave_${wave}_${i}`,
        name,
        team: 'red',
        isPlayer: false,
        isBoss: boss,
        avatar,
        loadout: {
          id: 'wave_ld',
          name: 'Wave',
          primaryId: wid,
          secondaryId: wave >= 7 && i % 2 === 1 ? 'riot_shield' : 'deagle',
          dualWieldStart: wave >= 7 && i % 2 === 1 && canDualWieldPair(wid, 'riot_shield'),
          grenadeId: wave >= 6 ? 'gas' : 'frag',
          grenadeCount: 2,
          perkId: boss ? 'heavy_armor' : 'jet_booster',
          coinCost: 0,
          desc: ''
        }
      });
      this.soldiers.push(sol);
    }

    // Sarge calls out wave & drops medkit on ground
    const sarge = this.soldiers.find((s) => s.isSarge);
    if (sarge) {
      sarge.speechText = isBossWave
        ? `BOSS WAVE ${wave}! Watch out for heavy rockets!`
        : `Wave ${wave} inbound! Aim for the head!`;
      sarge.speechTimer = 4.5;
    }
    this.showBanner(`WAVE ${wave}`, isBossWave ? 'ARMORED JUGGERNAUT BOSS INBOUND!' : 'HOLD THE OUTPOST!', isBossWave ? '#EF4444' : '#F5A623');
    mmAudio.playKillstreakChime(isBossWave ? 3 : 2);
  }

  private resetPtbRound(): void {
    this.ptbBombState = 'carried';
    this.ptbBombTimer = 30;
    this.ptbBombSite = null;
    this.ptbActionProgress = 0;
    for (const s of this.soldiers) {
      this.respawnSoldier(s);
    }
    this.showBanner(`ROUND ${this.ptbRound}`, 'RED: PLANT C4 AT SITE A/B · BLUE: DEFEND', '#F5A623');
  }

  private getPlayer(): SimSoldier | undefined {
    return this.soldiers.find((s) => s.isPlayer);
  }

  private getMaxZoomForPlayer(p: SimSoldier): number {
    const w = getMmWeaponById(p.activeSlot.weaponId);
    if (w.isMelee || w.isShield) {
      return this.settings.gameplay.unarmedZoom ? 2.0 : 1.0;
    }
    return w.zoomMax;
  }

  private showBanner(text: string, sub: string, color: string): void {
    this.banner = { text, sub, color, ttl: 2.6 };
  }

  private recordWeaponDelta(weaponId: string, patch: Partial<MmWeaponMasteryStat>): void {
    const cur = this.weaponDeltas[weaponId] ?? { kills: 0, shotsFired: 0, shotsHit: 0, headshots: 0 };
    this.weaponDeltas[weaponId] = {
      kills: cur.kills + (patch.kills ?? 0),
      shotsFired: cur.shotsFired + (patch.shotsFired ?? 0),
      shotsHit: cur.shotsHit + (patch.shotsHit ?? 0),
      headshots: cur.headshots + (patch.headshots ?? 0)
    };
  }

  // ==================== FIXED-TIMESTEP 60 HZ SIMULATION ====================
  private stepSimulation(dt: number): void {
    this.matchTimeSec += dt;
    if (this.config.mode !== 'survival' && this.config.mode !== 'bootcamp') {
      this.timeRemainingSec = Math.max(0, this.timeRemainingSec - dt);
      if (this.timeRemainingSec <= 0) {
        this.finishMatch();
        return;
      }
    }

    if (this.banner) {
      this.banner.ttl -= dt;
      if (this.banner.ttl <= 0) this.banner = null;
    }
    if (this.shakeTimer > 0) this.shakeTimer = Math.max(0, this.shakeTimer - dt);

    for (let i = this.killFeed.length - 1; i >= 0; i--) {
      this.killFeed[i].ttl -= dt;
      if (this.killFeed[i].ttl <= 0) this.killFeed.splice(i, 1);
    }

    this.stepPads(dt);
    this.stepDrops(dt);

    // Step all soldiers
    for (const s of this.soldiers) {
      this.stepSoldier(s, dt);
    }

    this.stepProjectiles(dt);
    this.stepGrenades(dt);
    this.stepGasClouds(dt);
    this.stepParticles(dt);
    this.stepModeLogic(dt);
    this.updateCamera(dt);
  }

  private stepSoldier(s: SimSoldier, dt: number): void {
    if (s.speechTimer > 0) {
      s.speechTimer -= dt;
      if (s.speechTimer <= 0) s.speechText = null;
    }
    if (s.multiKillTimer > 0) {
      s.multiKillTimer -= dt;
      if (s.multiKillTimer <= 0) s.multiKillCount = 0;
    }

    if (!s.alive) {
      if (this.config.mode === 'survival' && s.team === 'red') return;
      if (this.config.mode === 'ptb') return; // Wait for next round
      s.respawnTimer -= dt;
      if (s.respawnTimer <= 0) {
        this.respawnSoldier(s);
      }
      return;
    }

    // Timers
    if (s.fireCooldown > 0) s.fireCooldown = Math.max(0, s.fireCooldown - dt);
    if (s.offhandFireCooldown > 0) s.offhandFireCooldown = Math.max(0, s.offhandFireCooldown - dt);
    if (s.muzzleFlash > 0) s.muzzleFlash = Math.max(0, s.muzzleFlash - dt * 8);
    if (s.meleeTimer > 0) s.meleeTimer = Math.max(0, s.meleeTimer - dt * 4);
    if (s.meleeCooldown > 0) s.meleeCooldown = Math.max(0, s.meleeCooldown - dt);
    if (s.rollTimer > 0) s.rollTimer = Math.max(0, s.rollTimer - dt);
    if (s.rollCooldown > 0) s.rollCooldown = Math.max(0, s.rollCooldown - dt);
    if (s.spawnShieldTimer > 0) s.spawnShieldTimer = Math.max(0, s.spawnShieldTimer - dt);
    if (s.empDisabledTimer > 0) s.empDisabledTimer = Math.max(0, s.empDisabledTimer - dt);
    if (s.boostTimer > 0) s.boostTimer = Math.max(0, s.boostTimer - dt);

    // Health Regen after 4.0s out of combat (+12 HP/s)
    if (this.matchTimeSec - s.lastDamagedAt >= 4.0 && s.hp < s.maxHp && !s.isTargetDummy) {
      s.hp = Math.min(s.maxHp, s.hp + 12 * dt);
    }

    // Burn DOT (Flamethrower)
    if (s.burnTimer > 0) {
      s.burnTimer -= dt;
      const attacker = this.soldiers.find((x) => x.id === s.burnAttackerId) ?? null;
      this.applyDamage(s, 14 * dt, attacker, 'flamethrower', false, false, true);
      if (!s.alive) return;
    }

    // Battery Auto-Refill (PHASR & Flamethrower)
    const activeW = getMmWeaponById(s.activeSlot.weaponId);
    if (activeW.batteryAutoRefill && s.activeSlot.mag < activeW.magSize && s.fireCooldown <= 0) {
      s.activeSlot.mag = Math.min(activeW.magSize, s.activeSlot.mag + 22 * dt);
    }

    // Reload timer
    if (s.reloading) {
      s.reloadTimer -= dt;
      if (s.reloadTimer <= 0) {
        s.reloading = false;
        this.finishReloadSlot(s.activeSlot);
        if (s.offhandSlot) this.finishReloadSlot(s.offhandSlot);
      }
    }

    // Gather movement / aim / fire intent
    let moveX = 0;
    let thrustUp = false;
    let crouch = false;
    let wantsFire = false;
    let dropThrough = false;

    if (s.isPlayer) {
      const kLeft = this.keys.has('KeyA') || this.keys.has('ArrowLeft');
      const kRight = this.keys.has('KeyD') || this.keys.has('ArrowRight');
      const kUp = this.keys.has('KeyW') || this.keys.has('ArrowUp') || this.keys.has('Space') || this.rightMouseDown;
      const kDown = this.keys.has('KeyS') || this.keys.has('ArrowDown');

      const sens = this.settings.controls.moveSensitivity;
      if (kLeft) moveX -= 1;
      if (kRight) moveX += 1;
      if (Math.abs(this.touchMoveX) > 0.14) moveX = clamp(this.touchMoveX * sens, -1, 1);

      thrustUp = kUp || this.touchMoveY < -0.35;
      crouch = kDown || this.touchCrouchBtn || this.touchMoveY > 0.62;
      dropThrough = crouch;

      // Aim calculation
      if (this.touchAimActive) {
        s.aimAngle = this.touchAimAngle;
      } else if (this.mouseMoved) {
        const worldMouse = this.screenToWorld(this.mouseScreenX, this.mouseScreenY);
        s.aimAngle = Math.atan2(worldMouse.y - (s.y - 8), worldMouse.x - s.x);
      }

      // Subtle touch aim assist if enabled
      if (this.touchAimActive && this.settings.controls.aimAssist !== 'off') {
        const pull = this.settings.controls.aimAssist === 'high' ? 0.22 : 0.11;
        const bestEnemy = this.findNearestEnemyInCone(s, s.aimAngle, 0.35, 620);
        if (bestEnemy) {
          const targetA = Math.atan2(bestEnemy.y - 16 - (s.y - 8), bestEnemy.x - s.x);
          const diff = Math.atan2(Math.sin(targetA - s.aimAngle), Math.cos(targetA - s.aimAngle));
          s.aimAngle += diff * pull;
        }
      }

      wantsFire = this.mouseDown || this.touchAimAutoFire || this.touchFireBtnDown;
    } else if (!s.isTargetDummy) {
      const ai = this.computeAiInput(s, dt);
      moveX = ai.moveX;
      thrustUp = ai.thrustUp;
      crouch = ai.crouch;
      dropThrough = ai.dropThrough;
      wantsFire = ai.wantsFire;
    }

    s.crouching = crouch && s.onGround && !thrustUp;

    // Weight & Speed modifiers
    let weightMult = activeW.weightSpeedMult;
    if (s.offhandSlot) {
      weightMult = Math.min(weightMult, getMmWeaponById(s.offhandSlot.weaponId).weightSpeedMult);
    }
    if (s.carryingFlag) weightMult *= 0.9;
    if (s.boostTimer > 0) weightMult *= 1.35;
    if (s.crouching) weightMult *= 0.45;

    const maxSpeed = BASE_MOVE_SPEED * weightMult;
    const accel = s.onGround ? 2100 * this.map.friction : 980;
    if (s.rollTimer <= 0) {
      if (Math.abs(moveX) > 0.05) {
        s.vx += moveX * accel * dt;
        if (Math.abs(s.vx) > maxSpeed && s.onGround) {
          s.vx = Math.sign(s.vx) * Math.max(maxSpeed, Math.abs(s.vx) * (1 - 6 * dt));
        }
      } else {
        const damp = s.onGround ? 11 * this.map.friction : 1.6;
        s.vx *= Math.max(0, 1 - damp * dt);
      }
    }

    // Jetpack & Gravity
    const gravMult =
      this.config.gravityMode === 'low'
        ? 0.42
        : this.config.gravityMode === 'heavy'
          ? 1.35
          : this.map.gravityScale;
    const g = BASE_GRAVITY * gravMult;
    const unlimitedFuel = this.map.unlimitedJetpack || this.config.nitroMode === 'unlimited';

    if (thrustUp && s.empDisabledTimer <= 0 && (s.jetFuel > 1 || unlimitedFuel)) {
      s.jetpacking = true;
      s.vy -= JETPACK_ACCEL * dt;
      s.vy = Math.max(-420, s.vy);
      if (!unlimitedFuel) {
        s.jetFuel = Math.max(0, s.jetFuel - 34 * dt);
      }
      if (s.isPlayer) mmAudio.playJetpackPulse();
      if (Math.random() < 0.45) {
        this.particles.push({
          x: s.x + (Math.random() - 0.5) * 10,
          y: s.y + 14,
          vx: (Math.random() - 0.5) * 40,
          vy: 70 + Math.random() * 60,
          size: 4 + Math.random() * 4,
          color: 'rgba(241, 245, 249, 0.55)',
          ttl: 0.35,
          maxTtl: 0.35,
          gravity: -40,
          kind: 'smoke'
        });
      }
    } else {
      s.jetpacking = false;
      const regenRate = s.onGround ? 44 : 20;
      s.jetFuel = Math.min(s.maxJetFuel, s.jetFuel + regenRate * dt);
    }

    s.vy += g * dt;
    s.vy = Math.min(720, s.vy);

    // Move & Collide with Map Geometry
    this.moveAndCollideSoldier(s, dt, dropThrough);

    // Walk cycle animation
    if (s.onGround && Math.abs(s.vx) > 20) {
      s.walkPhase += Math.abs(s.vx) * dt * 0.06;
    }

    // Cliffhanger Lethal Abyss check
    if (this.map.lethalAbyss && s.y > this.map.height + 60) {
      this.killSoldier(s, null, 'Abyss Fall', false, false);
      return;
    }

    // Boot Camp progress checks
    if (s.isPlayer && this.config.mode === 'bootcamp') {
      if (Math.abs(moveX) > 0.2 || s.crouching) this.bootcampMovedSec += dt;
      if (s.jetpacking) this.bootcampFlewSec += dt;
    }

    // M4 3-Round Burst continuation
    if (s.burstRemaining > 0) {
      s.burstTick -= dt;
      if (s.burstTick <= 0) {
        s.burstRemaining--;
        s.burstTick = 0.075;
        this.fireSingleSlot(s, s.activeSlot, false);
      }
    }

    // Minigun 0.8s Spin-Up & Firing
    if (wantsFire && !s.reloading) {
      if (activeW.fireMode === 'spinup') {
        s.spinUpTimer = Math.min(activeW.spinUpSec ?? 0.8, s.spinUpTimer + dt);
        if (s.spinUpTimer >= (activeW.spinUpSec ?? 0.8) && s.fireCooldown <= 0) {
          this.fireSingleSlot(s, s.activeSlot, false);
        }
      } else {
        if (s.fireCooldown <= 0) {
          this.fireSingleSlot(s, s.activeSlot, false);
        }
        if (s.offhandSlot && s.offhandFireCooldown <= 0) {
          const offW = getMmWeaponById(s.offhandSlot.weaponId);
          if (!offW.isShield) {
            this.fireSingleSlot(s, s.offhandSlot, true);
          }
        }
      }
    } else {
      s.spinUpTimer = Math.max(0, s.spinUpTimer - dt * 1.4);
    }
  }

  private finishReloadSlot(slot: WeaponSlotState): void {
    const w = getMmWeaponById(slot.weaponId);
    if (w.isMelee || w.isShield) return;
    const need = w.magSize - Math.floor(slot.mag);
    const take = Math.min(need, slot.reserve);
    slot.mag += take;
    slot.reserve -= take;
  }

  private fireSingleSlot(s: SimSoldier, slot: WeaponSlotState, isOffhand: boolean): void {
    const w = getMmWeaponById(slot.weaponId);
    if (w.isShield) return;
    if (w.isMelee) {
      this.executeMelee(s);
      return;
    }

    if (slot.mag < 1) {
      if (this.settings.controls.autoReload && !s.reloading && slot.reserve > 0 && !w.batteryAutoRefill) {
        const speedMult = s.perkId === 'quick_hands' ? 0.8 : 1.0;
        s.reloading = true;
        s.reloadDuration = Math.max(0.5, w.reloadSec * speedMult);
        s.reloadTimer = s.reloadDuration;
        if (s.isPlayer) mmAudio.playReload();
      }
      return;
    }

    // Firing breaks spawn shield immediately
    s.spawnShieldTimer = 0;

    // Consume ammo
    slot.mag = Math.max(0, slot.mag - 1);
    const boostRpm = s.boostTimer > 0 ? 1.25 : 1.0;
    const cd = 60 / (w.rpm * boostRpm);
    if (isOffhand) s.offhandFireCooldown = cd * 1.05;
    else s.fireCooldown = w.fireMode === 'burst3' ? cd * 2.8 : cd;

    if (!isOffhand && w.fireMode === 'burst3' && s.burstRemaining === 0 && slot.mag > 0) {
      s.burstRemaining = Math.min(2, Math.floor(slot.mag));
      s.burstTick = 0.075;
    }

    s.muzzleFlash = 1.0;
    if (s.isPlayer || dist(s.x, s.y, this.camX, this.camY) < 920) {
      mmAudio.playWeaponFire(w.id);
    }

    // Recoil pushback impulse
    if (w.recoilImpulse !== 0) {
      const airBonus = s.onGround ? 0.35 : 1.0;
      s.vx -= Math.cos(s.aimAngle) * w.recoilImpulse * airBonus;
      s.vy -= Math.sin(s.aimAngle) * w.recoilImpulse * airBonus * 0.7;
    }
    if (s.isPlayer && this.settings.video.screenShake && w.recoilImpulse >= 50) {
      this.shakeTimer = 0.1;
      this.shakeMag = Math.min(8, w.recoilImpulse * 0.04);
    }

    const muzzleX = s.x + Math.cos(s.aimAngle) * 26;
    const muzzleY = s.y - 7 + Math.sin(s.aimAngle) * 26;
    const dmgBoost = s.boostTimer > 0 ? 1.2 : 1.0;
    const crouchSpread = s.crouching ? 0.7 : 1.0;
    const dualSpread = s.offhandSlot && !getMmWeaponById(s.offhandSlot.weaponId).isShield ? 1.25 : 1.0;

    if (s.isPlayer) {
      this.recordWeaponDelta(w.id, { shotsFired: 1 });
    }

    // Brass shell casing VFX
    if (this.settings.video.mmcEnhanced && w.projectileKind === 'bullet') {
      this.particles.push({
        x: s.x + Math.cos(s.aimAngle) * 8,
        y: s.y - 8,
        vx: -Math.cos(s.aimAngle) * 55 + (Math.random() - 0.5) * 40,
        vy: -90 - Math.random() * 50,
        size: 3,
        color: '#FACC15',
        ttl: 0.7,
        maxTtl: 0.7,
        gravity: 520,
        kind: 'casing'
      });
    }

    // Hitscan Continuous Laser (PHASR)
    if (w.projectileKind === 'laser') {
      this.firePhasrLaser(s, muzzleX, muzzleY, w.damage * dmgBoost, w.headshotMult);
      return;
    }

    // Projectiles (bullets, pellets, rockets, mortar, flame, emp, saw)
    for (let i = 0; i < w.pellets; i++) {
      const spreadRad = ((w.spreadDeg * crouchSpread * dualSpread) * (Math.random() - 0.5) * Math.PI) / 180;
      const a = s.aimAngle + spreadRad;
      const spd = w.projectileSpeed * (w.projectileKind === 'pellet' ? 0.9 + Math.random() * 0.2 : 1);
      this.projectiles.push({
        id: this.seq++,
        ownerId: s.id,
        ownerTeam: s.team,
        weaponId: w.id,
        kind: w.projectileKind === 'melee' || w.projectileKind === 'shield' ? 'bullet' : w.projectileKind,
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        damage: w.damage * dmgBoost,
        headshotMult: w.headshotMult,
        splashRadius: w.splashRadius ?? 0,
        ricochetsLeft: w.ricochets ?? 0,
        ttl: w.projectileKind === 'flame' ? 0.45 : w.projectileKind === 'mortar' ? 2.2 : w.projectileKind === 'saw' ? 4.2 : 1.9,
        maxTtl: w.projectileKind === 'flame' ? 0.45 : 2.2,
        color: w.accent,
        fromDualWield: Boolean(s.offhandSlot && !getMmWeaponById(s.offhandSlot.weaponId).isShield)
      });
    }
  }

  private firePhasrLaser(s: SimSoldier, startX: number, startY: number, dmg: number, hsMult: number): void {
    const maxLen = 1150;
    const dx = Math.cos(s.aimAngle);
    const dy = Math.sin(s.aimAngle);
    let endX = startX + dx * maxLen;
    let endY = startY + dy * maxLen;
    let hitSoldier: SimSoldier | null = null;
    let isHead = false;

    const steps = 65;
    for (let i = 1; i <= steps; i++) {
      const px = startX + dx * (maxLen * (i / steps));
      const py = startY + dy * (maxLen * (i / steps));
      if (this.pointHitsSolid(px, py)) {
        endX = px;
        endY = py;
        break;
      }
      const hit = this.checkPointHitsSoldier(px, py, s.id, s.team);
      if (hit) {
        endX = px;
        endY = py;
        hitSoldier = hit.soldier;
        isHead = hit.headshot;
        break;
      }
    }

    this.particles.push({
      x: startX,
      y: startY,
      x2: endX,
      y2: endY,
      vx: 0,
      vy: 0,
      size: 3.5,
      color: '#22D3EE',
      ttl: 0.11,
      maxTtl: 0.11,
      gravity: 0,
      kind: 'beam'
    });

    if (hitSoldier) {
      if (this.isBlockedByRiotShield(hitSoldier, startX, startY)) {
        mmAudio.playShieldBlock();
        this.spawnSparks(endX, endY, '#93C5FD', 6);
      } else {
        const finalDmg = isHead ? dmg * hsMult : dmg;
        if (s.isPlayer) this.recordWeaponDelta('phasr', { shotsHit: 1, headshots: isHead ? 1 : 0 });
        this.applyDamage(hitSoldier, finalDmg, s, 'phasr', isHead, false, false);
      }
    }
  }

  private executeMelee(s: SimSoldier): void {
    const w = getMmWeaponById(s.activeSlot.weaponId);
    const offW = s.offhandSlot ? getMmWeaponById(s.offhandSlot.weaponId) : null;
    const hasMachete = w.id === 'machete' || offW?.id === 'machete';
    const dualMachete = w.id === 'machete' && offW?.id === 'machete';

    s.spawnShieldTimer = 0;
    s.meleeTimer = 1.0;
    s.meleeCooldown = dualMachete ? 0.24 : hasMachete ? 0.36 : 0.44;
    s.vx += Math.cos(s.aimAngle) * 165;
    s.vy += Math.sin(s.aimAngle) * 90;
    mmAudio.playMelee();

    const reach = hasMachete ? 64 : 48;
    const dmg = hasMachete ? 85 : 45;
    const hitX = s.x + Math.cos(s.aimAngle) * (reach * 0.55);
    const hitY = s.y - 10 + Math.sin(s.aimAngle) * (reach * 0.55);

    for (const target of this.soldiers) {
      if (!target.alive || target.id === s.id) continue;
      if (!this.canDamage(s.team, target.team)) continue;
      if (dist(hitX, hitY, target.x, target.y - 12) <= reach) {
        const headHit = dist(hitX, hitY, target.x, target.y - 25) < 28;
        const mult = headHit && hasMachete ? 1.35 : 1.0;
        target.vx += Math.cos(s.aimAngle) * 260;
        target.vy -= 140;
        this.applyDamage(target, dmg * mult, s, hasMachete ? 'machete' : 'melee', headHit, true, false);
        if (s.isPlayer && this.config.mode === 'bootcamp' && this.bootcampStep === 4) {
          this.bootcampMeleeDone = true;
        }
      }
    }
  }

  private throwGrenade(s: SimSoldier): void {
    const kind = s.grenadeType;
    if (s.grenades[kind] <= 0) return;
    s.grenades[kind]--;
    s.spawnShieldTimer = 0;
    const def = getMmGrenadeById(kind);
    const spd = kind === 'proxy' ? 620 : 540;
    this.grenades.push({
      id: this.seq++,
      ownerId: s.id,
      ownerTeam: s.team,
      kind,
      x: s.x + Math.cos(s.aimAngle) * 20,
      y: s.y - 14 + Math.sin(s.aimAngle) * 20,
      vx: Math.cos(s.aimAngle) * spd + s.vx * 0.25,
      vy: Math.sin(s.aimAngle) * spd - (kind === 'proxy' ? 0 : 90),
      fuse: def.fuseSec,
      stuck: false,
      armed: false,
      blinkPhase: 0
    });
    mmAudio.playClick();
  }

  private moveAndCollideSoldier(s: SimSoldier, dt: number, dropThrough: boolean): void {
    const halfW = SOLDIER_W / 2;
    const h = s.crouching ? SOLDIER_H * 0.65 : SOLDIER_H;
    const topOff = h - 18;
    const botOff = 18;

    // Horizontal
    s.x += s.vx * dt;
    for (const pl of this.map.platforms) {
      if (pl.oneWay) continue;
      if (s.x + halfW > pl.x && s.x - halfW < pl.x + pl.w && s.y + botOff > pl.y + 4 && s.y - topOff < pl.y + pl.h - 4) {
        if (s.vx > 0) s.x = pl.x - halfW;
        else if (s.vx < 0) s.x = pl.x + pl.w + halfW;
        s.vx = 0;
      }
    }

    // Vertical
    const prevBot = s.y + botOff;
    s.y += s.vy * dt;
    s.onGround = false;
    for (const pl of this.map.platforms) {
      if (s.x + halfW <= pl.x + 2 || s.x - halfW >= pl.x + pl.w - 2) continue;
      if (pl.oneWay) {
        if (!dropThrough && s.vy >= 0 && prevBot <= pl.y + 8 && s.y + botOff >= pl.y) {
          s.y = pl.y - botOff;
          s.vy = 0;
          s.onGround = true;
        }
        continue;
      }
      if (s.y + botOff > pl.y && s.y - topOff < pl.y + pl.h) {
        if (s.vy > 0) {
          s.y = pl.y - botOff;
          s.vy = 0;
          s.onGround = true;
        } else if (s.vy < 0) {
          s.y = pl.y + pl.h + topOff;
          s.vy = 0;
        }
      }
    }

    // World bounds clamp
    s.x = clamp(s.x, 60, this.map.width - 60);
    if (!this.map.lethalAbyss) {
      s.y = clamp(s.y, 70, this.map.height - 60);
    }
  }

  private pointHitsSolid(x: number, y: number): boolean {
    for (const pl of this.map.platforms) {
      if (pl.oneWay) continue;
      if (x >= pl.x && x <= pl.x + pl.w && y >= pl.y && y <= pl.y + pl.h) return true;
    }
    return false;
  }

  private canDamage(attackerTeam: MmTeam, targetTeam: MmTeam): boolean {
    if (attackerTeam === 'ffa' || targetTeam === 'ffa') return true;
    if (this.config.friendlyFire) return true;
    return attackerTeam !== targetTeam;
  }

  private checkPointHitsSoldier(
    px: number,
    py: number,
    ownerId: string,
    ownerTeam: MmTeam
  ): { soldier: SimSoldier; headshot: boolean } | null {
    for (const s of this.soldiers) {
      if (!s.alive || s.id === ownerId) continue;
      if (!this.canDamage(ownerTeam, s.team)) continue;
      const crouchOff = s.crouching ? 10 : 0;
      // Head Circle Hitbox (1.75x multiplier!)
      if (dist(px, py, s.x, s.y - 25 + crouchOff) <= 15) {
        return { soldier: s, headshot: true };
      }
      // Torso/Legs Capsule Hitbox
      if (Math.abs(px - s.x) <= 14 && py >= s.y - 16 + crouchOff && py <= s.y + 18) {
        return { soldier: s, headshot: false };
      }
    }
    return null;
  }

  private isBlockedByRiotShield(target: SimSoldier, incomingFromX: number, incomingFromY: number): boolean {
    const hasShield =
      target.activeSlot.weaponId === 'riot_shield' || target.offhandSlot?.weaponId === 'riot_shield';
    if (!hasShield) return false;
    const toAttacker = Math.atan2(incomingFromY - (target.y - 10), incomingFromX - target.x);
    const diff = Math.abs(Math.atan2(Math.sin(toAttacker - target.aimAngle), Math.cos(toAttacker - target.aimAngle)));
    return diff <= 1.05; // ~120-degree front shield block cone
  }

  private stepProjectiles(dt: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.ttl -= dt;
      if (pr.ttl <= 0) {
        if (pr.kind === 'mortar' || pr.kind === 'rocket' || pr.kind === 'emp') {
          this.detonateProjectile(pr);
        }
        this.projectiles.splice(i, 1);
        continue;
      }

      if (pr.kind === 'mortar') {
        pr.vy += BASE_GRAVITY * 0.72 * dt;
      } else if (pr.kind === 'flame') {
        pr.vx *= 0.94;
        pr.vy -= 30 * dt;
      } else if (pr.kind === 'rocket' && Math.random() < 0.65) {
        this.particles.push({
          x: pr.x,
          y: pr.y,
          vx: (Math.random() - 0.5) * 20,
          vy: (Math.random() - 0.5) * 20,
          size: 5,
          color: 'rgba(226, 232, 240, 0.55)',
          ttl: 0.35,
          maxTtl: 0.35,
          gravity: -20,
          kind: 'smoke'
        });
      }

      const nextX = pr.x + pr.vx * dt;
      const nextY = pr.y + pr.vy * dt;

      // Wall hit / Ricochet check
      if (this.pointHitsSolid(nextX, nextY)) {
        if (pr.kind === 'saw' && pr.ricochetsLeft > 0) {
          pr.ricochetsLeft--;
          const hitHoriz = this.pointHitsSolid(nextX, pr.y);
          if (hitHoriz) pr.vx = -pr.vx;
          else pr.vy = -pr.vy;
          mmAudio.playRicochet();
          this.spawnSparks(pr.x, pr.y, '#FDE047', 6);
          continue;
        }
        if (pr.kind === 'mortar') {
          const hitHoriz = this.pointHitsSolid(nextX, pr.y);
          if (hitHoriz) pr.vx = -pr.vx * 0.62;
          else pr.vy = -pr.vy * 0.62;
          mmAudio.playGrenadeBounce();
          continue;
        }
        if (pr.kind === 'rocket' || pr.kind === 'emp') {
          this.detonateProjectile(pr);
        } else {
          this.spawnSparks(pr.x, pr.y, '#FDE68A', 4);
        }
        this.projectiles.splice(i, 1);
        continue;
      }

      pr.x = nextX;
      pr.y = nextY;

      // Shoot armed Proxy Mines!
      for (let gi = this.grenades.length - 1; gi >= 0; gi--) {
        const gr = this.grenades[gi];
        if (gr.kind === 'proxy' && gr.stuck && dist(pr.x, pr.y, gr.x, gr.y) < 16) {
          this.detonateGrenade(gr);
          this.grenades.splice(gi, 1);
        }
      }

      // Soldier Hit Check
      const hit = this.checkPointHitsSoldier(pr.x, pr.y, pr.ownerId, pr.ownerTeam);
      if (hit) {
        const owner = this.soldiers.find((x) => x.id === pr.ownerId) ?? null;
        if (pr.kind === 'rocket' || pr.kind === 'mortar' || pr.kind === 'emp') {
          this.detonateProjectile(pr);
          this.projectiles.splice(i, 1);
          continue;
        }

        // Riot Shield blocks bullets/pellets/sawblades from the front, but NOT Flamethrower!
        if (pr.kind !== 'flame' && this.isBlockedByRiotShield(hit.soldier, pr.x - pr.vx * dt, pr.y - pr.vy * dt)) {
          mmAudio.playShieldBlock();
          this.spawnSparks(pr.x, pr.y, '#93C5FD', 6);
          this.projectiles.splice(i, 1);
          continue;
        }

        const dmg = hit.headshot ? pr.damage * pr.headshotMult : pr.damage;
        if (owner?.isPlayer) {
          this.recordWeaponDelta(pr.weaponId, { shotsHit: 1, headshots: hit.headshot ? 1 : 0 });
          if (this.config.mode === 'bootcamp' && this.bootcampStep === 3 && this.currentZoom >= 1.5) {
            this.bootcampZoomShotDone = true;
          }
        }
        if (pr.kind === 'flame') {
          hit.soldier.burnTimer = 3.0;
          hit.soldier.burnAttackerId = pr.ownerId;
        }
        this.applyDamage(
          hit.soldier,
          dmg,
          owner,
          pr.weaponId,
          hit.headshot,
          false,
          pr.fromDualWield
        );
        // Sawblade slices through!
        if (pr.kind !== 'saw') {
          this.projectiles.splice(i, 1);
        }
      }
    }
  }

  private detonateProjectile(pr: SimProjectile): void {
    const owner = this.soldiers.find((x) => x.id === pr.ownerId) ?? null;
    if (pr.kind === 'emp') {
      mmAudio.playEmpZap();
      this.spawnShockwave(pr.x, pr.y, pr.splashRadius, '#38BDF8');
      this.disarmNearbyMines(pr.x, pr.y, pr.splashRadius);
      for (const s of this.soldiers) {
        if (!s.alive) continue;
        if (dist(pr.x, pr.y, s.x, s.y - 10) <= pr.splashRadius) {
          if (s.id === pr.ownerId || this.canDamage(pr.ownerTeam, s.team)) {
            s.empDisabledTimer = Math.max(s.empDisabledTimer, 4.0);
            s.boostTimer = 0;
            this.applyDamage(s, pr.damage, owner, pr.weaponId, false, false, false);
          }
        }
      }
      return;
    }

    mmAudio.playExplosion();
    this.spawnShockwave(pr.x, pr.y, pr.splashRadius, '#FB923C');
    if (this.settings.video.screenShake && dist(pr.x, pr.y, this.camX, this.camY) < 700) {
      this.shakeTimer = 0.22;
      this.shakeMag = 10;
    }
    for (const s of this.soldiers) {
      if (!s.alive) continue;
      const d = dist(pr.x, pr.y, s.x, s.y - 10);
      if (d <= pr.splashRadius) {
        const falloff = 1 - (d / pr.splashRadius) * 0.65;
        const angle = Math.atan2(s.y - 10 - pr.y, s.x - pr.x);
        s.vx += Math.cos(angle) * 340 * falloff;
        s.vy += Math.sin(angle) * 340 * falloff - 120;
        if (s.id === pr.ownerId || this.canDamage(pr.ownerTeam, s.team)) {
          // Self rocket-jump deals reduced self damage
          const selfMult = s.id === pr.ownerId ? 0.45 : 1.0;
          this.applyDamage(s, pr.damage * falloff * selfMult, owner, pr.weaponId, false, false, false);
        }
      }
    }
  }

  private stepGrenades(dt: number): void {
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const gr = this.grenades[i];
      gr.blinkPhase += dt * 7;

      if (gr.kind === 'proxy') {
        if (!gr.stuck) {
          const nx = gr.x + gr.vx * dt;
          const ny = gr.y + gr.vy * dt;
          if (this.pointHitsSolid(nx, ny)) {
            gr.stuck = true;
            gr.vx = 0;
            gr.vy = 0;
            mmAudio.playGrenadeBounce();
          } else {
            gr.x = nx;
            gr.y = ny;
          }
        } else {
          if (!gr.armed) {
            gr.fuse -= dt;
            if (gr.fuse <= 0) gr.armed = true;
          } else {
            // Check proximity trigger against enemies
            const triggered = this.soldiers.some(
              (s) => s.alive && s.id !== gr.ownerId && this.canDamage(gr.ownerTeam, s.team) && dist(gr.x, gr.y, s.x, s.y - 10) <= 68
            );
            if (triggered) {
              this.detonateGrenade(gr);
              this.grenades.splice(i, 1);
            }
          }
        }
        continue;
      }

      // Standard bouncing grenades (Frag, Gas, EMP)
      gr.fuse -= dt;
      gr.vy += BASE_GRAVITY * 0.85 * dt;
      const nx = gr.x + gr.vx * dt;
      const ny = gr.y + gr.vy * dt;
      if (this.pointHitsSolid(nx, gr.y)) {
        gr.vx = -gr.vx * 0.55;
        mmAudio.playGrenadeBounce();
      } else {
        gr.x = nx;
      }
      if (this.pointHitsSolid(gr.x, ny)) {
        gr.vy = -gr.vy * 0.5;
        gr.vx *= 0.82;
        if (Math.abs(gr.vy) > 40) mmAudio.playGrenadeBounce();
      } else {
        gr.y = ny;
      }

      if (gr.fuse <= 0) {
        this.detonateGrenade(gr);
        this.grenades.splice(i, 1);
      }
    }
  }

  private detonateGrenade(gr: SimGrenade): void {
    const def = getMmGrenadeById(gr.kind);
    const owner = this.soldiers.find((x) => x.id === gr.ownerId) ?? null;

    if (owner?.isPlayer && this.config.mode === 'bootcamp' && this.bootcampStep === 5) {
      this.bootcampGrenadeDone = true;
    }

    if (gr.kind === 'gas') {
      mmAudio.playGasHiss();
      this.gasClouds.push({
        id: this.seq++,
        ownerId: gr.ownerId,
        ownerTeam: gr.ownerTeam,
        x: gr.x,
        y: gr.y,
        radius: def.radius,
        ttl: 7.0,
        maxTtl: 7.0,
        tickAcc: 0
      });
      return;
    }

    if (gr.kind === 'emp') {
      mmAudio.playEmpZap();
      this.spawnShockwave(gr.x, gr.y, def.radius, '#38BDF8');
      this.disarmNearbyMines(gr.x, gr.y, def.radius);
      for (const s of this.soldiers) {
        if (!s.alive) continue;
        if (dist(gr.x, gr.y, s.x, s.y - 10) <= def.radius) {
          if (s.id === gr.ownerId || this.canDamage(gr.ownerTeam, s.team)) {
            s.empDisabledTimer = Math.max(s.empDisabledTimer, 5.0);
            s.boostTimer = 0;
            this.applyDamage(s, def.damage, owner, 'emp_grenade', false, false, false);
          }
        }
      }
      return;
    }

    // Frag or Proxy Explosion
    mmAudio.playExplosion();
    this.spawnShockwave(gr.x, gr.y, def.radius, gr.kind === 'proxy' ? '#EF4444' : '#F59E0B');
    if (this.settings.video.screenShake && dist(gr.x, gr.y, this.camX, this.camY) < 750) {
      this.shakeTimer = 0.24;
      this.shakeMag = 11;
    }
    for (const s of this.soldiers) {
      if (!s.alive) continue;
      const d = dist(gr.x, gr.y, s.x, s.y - 10);
      if (d <= def.radius) {
        const falloff = 1 - (d / def.radius) * 0.6;
        const ang = Math.atan2(s.y - 10 - gr.y, s.x - gr.x);
        s.vx += Math.cos(ang) * 360 * falloff;
        s.vy += Math.sin(ang) * 360 * falloff - 120;
        if (s.id === gr.ownerId || this.canDamage(gr.ownerTeam, s.team)) {
          this.applyDamage(s, def.damage * falloff, owner, gr.kind === 'proxy' ? 'proxy_mine' : 'frag_grenade', false, false, false);
        }
      }
    }
  }

  private disarmNearbyMines(x: number, y: number, radius: number): void {
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i];
      if (g.kind === 'proxy' && dist(x, y, g.x, g.y) <= radius) {
        this.spawnSparks(g.x, g.y, '#38BDF8', 8);
        this.grenades.splice(i, 1);
      }
    }
  }

  private stepGasClouds(dt: number): void {
    for (let i = this.gasClouds.length - 1; i >= 0; i--) {
      const gc = this.gasClouds[i];
      gc.ttl -= dt;
      gc.tickAcc += dt;
      if (gc.tickAcc >= 0.25) {
        gc.tickAcc = 0;
        const owner = this.soldiers.find((x) => x.id === gc.ownerId) ?? null;
        for (const s of this.soldiers) {
          if (!s.alive) continue;
          if (dist(gc.x, gc.y, s.x, s.y - 10) <= gc.radius) {
            if (s.id === gc.ownerId || this.canDamage(gc.ownerTeam, s.team)) {
              this.applyDamage(s, 35 * 0.25, owner, 'gas_grenade', false, false, false);
            }
          }
        }
      }
      if (gc.ttl <= 0) this.gasClouds.splice(i, 1);
    }
  }

  private applyDamage(
    target: SimSoldier,
    amount: number,
    attacker: SimSoldier | null,
    weaponId: string,
    headshot: boolean,
    isMelee: boolean,
    fromDualWield: boolean
  ): void {
    if (!target.alive || target.spawnShieldTimer > 0) return;
    target.hp -= amount;
    target.lastDamagedAt = this.matchTimeSec;
    if (attacker && attacker.id !== target.id) {
      target.recentAttackers.set(attacker.id, this.matchTimeSec);
    }

    if (headshot && attacker?.isPlayer) {
      mmAudio.playHeadshotDing();
    }

    // Hit particles (Red Blood / Cartoon Confetti / Off)
    if (this.settings.video.hitEffects !== 'off') {
      const count = headshot ? 7 : 3;
      const palette =
        this.settings.video.hitEffects === 'confetti'
          ? ['#FACC15', '#38BDF8', '#F472B6', '#4ADE80']
          : [headshot ? '#FACC15' : '#DC2626', '#991B1B'];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: target.x,
          y: headshot ? target.y - 25 : target.y - 10,
          vx: (Math.random() - 0.5) * 210,
          vy: -40 - Math.random() * 140,
          size: headshot ? 4 : 3,
          color: palette[i % palette.length],
          ttl: 0.45,
          maxTtl: 0.45,
          gravity: 480,
          kind: 'dot'
        });
      }
    }

    if (target.hp <= 0) {
      this.killSoldier(target, attacker, weaponId, headshot, isMelee, fromDualWield);
    }
  }

  private killSoldier(
    victim: SimSoldier,
    attacker: SimSoldier | null,
    weaponId: string,
    headshot: boolean,
    isMelee: boolean,
    fromDualWield = false
  ): void {
    victim.alive = false;
    victim.hp = 0;
    victim.deaths++;
    victim.streak = 0;
    victim.respawnTimer = 3.0;
    victim.burnTimer = 0;

    // Drop carried CTF flag
    if (victim.carryingFlag) {
      const fl = this.flags[victim.carryingFlag];
      fl.carrierId = null;
      fl.x = victim.x;
      fl.y = victim.y;
      fl.droppedTimer = 14;
      victim.carryingFlag = null;
    }

    // Drop primary weapon + comic burst
    if (!victim.isTargetDummy) {
      this.spawnDrop(victim.activeSlot.weaponId, victim.x, victim.y - 12);
    }
    if (this.settings.video.hitEffects !== 'off') {
      const cols =
        this.settings.video.hitEffects === 'confetti'
          ? ['#FACC15', '#38BDF8', '#F472B6', '#4ADE80', '#FB923C']
          : ['#DC2626', '#EF4444', '#7F1D1D', '#F59E0B'];
      for (let i = 0; i < 18; i++) {
        this.particles.push({
          x: victim.x,
          y: victim.y - 12,
          vx: (Math.random() - 0.5) * 320,
          vy: -80 - Math.random() * 220,
          size: 4 + Math.random() * 4,
          color: cols[i % cols.length],
          ttl: 0.75,
          maxTtl: 0.75,
          gravity: 540,
          kind: 'dot'
        });
      }
    }

    if (victim.isTargetDummy) {
      this.bootcampTargetsKilled++;
      victim.respawnTimer = 9999;
      return;
    }

    const isSuicide = !attacker || attacker.id === victim.id;
    const wName =
      weaponId === 'frag_grenade'
        ? 'Frag Grenade'
        : weaponId === 'gas_grenade'
          ? 'Poison Gas'
          : weaponId === 'proxy_mine'
            ? 'Proxy Mine'
            : weaponId === 'emp_grenade'
              ? 'EMP Grenade'
              : weaponId === 'melee'
                ? 'Melee'
                : weaponId === 'Abyss Fall'
                  ? 'Abyss'
                  : getMmWeaponById(weaponId).shortName;

    if (isSuicide) {
      if (victim.isPlayer) this.playerSuicides++;
      this.killFeed.unshift({
        id: this.seq++,
        killer: victim.name,
        killerTeam: victim.team,
        victim: 'Self',
        victimTeam: victim.team,
        weaponName: wName,
        headshot: false,
        melee: false,
        ttl: 5.0
      });
      this.killFeed = this.killFeed.slice(0, 5);
      return;
    }

    // Credit Killer
    attacker.kills++;
    attacker.streak++;
    attacker.bestStreak = Math.max(attacker.bestStreak, attacker.streak);
    attacker.multiKillCount = attacker.multiKillTimer > 0 ? attacker.multiKillCount + 1 : 1;
    attacker.multiKillTimer = 4.2;
    attacker.bestMultiKill = Math.max(attacker.bestMultiKill, attacker.multiKillCount);

    // Credit Assists
    for (const [aid, ts] of victim.recentAttackers.entries()) {
      if (aid !== attacker.id && this.matchTimeSec - ts <= 6.0) {
        const helper = this.soldiers.find((x) => x.id === aid);
        if (helper) helper.assists++;
      }
    }
    victim.recentAttackers.clear();

    // Team scores in TDM
    if (this.config.mode === 'tdm') {
      if (attacker.team === 'blue') this.scoreBlue++;
      else if (attacker.team === 'red') this.scoreRed++;
    }

    // Player detailed stats & Killstreak announcements
    if (attacker.isPlayer) {
      this.playerCoins += headshot ? 35 : 25;
      if (headshot) this.playerHeadshots++;
      if (isMelee) this.playerMeleeKills++;
      if (weaponId === 'frag_grenade' || weaponId === 'gas_grenade' || weaponId === 'proxy_mine' || weaponId === 'emp_grenade') {
        this.playerGrenadeKills++;
      } else if (weaponId !== 'melee') {
        this.recordWeaponDelta(weaponId, { kills: 1 });
      }
      if (fromDualWield) this.playerDualKills++;
      if (headshot && (weaponId === 'm93ba' || weaponId === 'hunting_rifle' || weaponId === 'm14')) {
        this.playerSniperHeadshots++;
      }
      if (weaponId === 'machete') this.playerMacheteKills++;
      if (weaponId === 'smaw') this.playerSmawKills++;
      if (weaponId === 'flamethrower') this.playerFlameKills++;
      if (weaponId === 'saw_gun') this.playerSawKills++;

      if (attacker.multiKillCount >= 2) {
        const labels = ['', '', 'DOUBLE KILL!', 'TRIPLE KILL!', 'RAMPAGE!', 'UNSTOPPABLE!', 'GODLIKE!'];
        const lbl = labels[Math.min(labels.length - 1, attacker.multiKillCount)];
        this.showBanner(lbl, `${victim.name} eliminated with ${wName}`, '#F5A623');
        mmAudio.playKillstreakChime(attacker.multiKillCount);
      } else if (headshot) {
        this.showBanner('HEADSHOT!', `+35 Coins · ${wName}`, '#EF4444');
        mmAudio.playKillstreakChime(1);
      } else if (isMelee) {
        this.showBanner('HUMILIATION!', `Melee takedown on ${victim.name}`, '#F97316');
        mmAudio.playKillstreakChime(1);
      }
    }

    this.killFeed.unshift({
      id: this.seq++,
      killer: attacker.name,
      killerTeam: attacker.team,
      victim: victim.name,
      victimTeam: victim.team,
      weaponName: wName,
      headshot,
      melee: isMelee,
      ttl: 5.5
    });
    this.killFeed = this.killFeed.slice(0, 5);

    // Check immediate score win conditions
    if (this.config.mode === 'tdm' && (this.scoreBlue >= this.config.scoreLimit || this.scoreRed >= this.config.scoreLimit)) {
      this.finishMatch();
    } else if (this.config.mode === 'ffa' && attacker.kills >= this.config.scoreLimit) {
      this.finishMatch();
    }
  }

  private respawnSoldier(s: SimSoldier): void {
    const sp = this.pickSpawnPoint(s.team);
    s.x = sp.x;
    s.y = sp.y;
    s.vx = 0;
    s.vy = 0;
    s.alive = true;
    s.reloading = false;
    s.empDisabledTimer = 0;
    s.burnTimer = 0;
    s.spawnShieldTimer = 2.0;
    const ld = this.allLoadouts.find((l) => l.id === s.activeLoadoutId) ?? MM_PREBUILT_LOADOUTS[0];
    this.applyLoadoutToSoldier(s, ld);
  }

  private stepPads(dt: number): void {
    for (const pad of this.pads) {
      if (!pad.active) {
        pad.timer -= dt;
        if (pad.timer <= 0) {
          pad.active = true;
          if (pad.kind === 'weapon') {
            pad.weaponId = pad.pool[Math.floor(Math.random() * pad.pool.length)];
          }
        }
        continue;
      }

      for (const s of this.soldiers) {
        if (!s.alive || s.isTargetDummy) continue;
        if (dist(s.x, s.y - 8, pad.x, pad.y) > 34) continue;

        if (pad.kind === 'health' && s.hp < s.maxHp) {
          s.hp = s.maxHp;
          pad.active = false;
          pad.timer = pad.respawnSec;
          if (s.isPlayer) mmAudio.playPickup();
          break;
        } else if (pad.kind === 'boost') {
          s.boostTimer = 15.0;
          pad.active = false;
          pad.timer = pad.respawnSec;
          if (s.isPlayer) {
            mmAudio.playPickup();
            this.showBanner('POWER BOOST!', '+35% Speed · +25% Fire Rate · +20% DMG', '#EF4444');
          }
          break;
        } else if (pad.kind === 'ammo') {
          const w = getMmWeaponById(s.activeSlot.weaponId);
          s.activeSlot.reserve = w.reserveMax;
          const cap = s.perkId === 'grenadier' ? 6 : 4;
          s.grenades[s.grenadeType] = Math.min(cap, s.grenades[s.grenadeType] + 2);
          pad.active = false;
          pad.timer = pad.respawnSec;
          if (s.isPlayer) mmAudio.playPickup();
          break;
        } else if (pad.kind === 'weapon' && pad.weaponId) {
          // Spawn a dropped pickup right on the pad so players use contextual Swap / Dual Wield
          const alreadyHere = this.drops.some((d) => dist(d.x, d.y, pad.x, pad.y) < 30);
          if (!alreadyHere) {
            this.spawnDrop(pad.weaponId, pad.x, pad.y - 6);
            pad.active = false;
            pad.timer = pad.respawnSec;
          }
          break;
        }
      }
    }
  }

  private spawnDrop(weaponId: string, x: number, y: number): void {
    this.drops.push({
      id: `drp_${this.seq++}`,
      weaponId,
      x,
      y,
      vx: (Math.random() - 0.5) * 90,
      vy: -120,
      ttl: 28
    });
    if (this.drops.length > 22) this.drops.shift();
  }

  private stepDrops(dt: number): void {
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      d.ttl -= dt;
      if (d.ttl <= 0) {
        this.drops.splice(i, 1);
        continue;
      }
      d.vy += BASE_GRAVITY * 0.7 * dt;
      d.x += d.vx * dt;
      const ny = d.y + d.vy * dt;
      if (this.pointHitsSolid(d.x, ny + 8)) {
        d.vy = 0;
        d.vx *= 0.6;
      } else {
        d.y = ny;
      }
    }
  }

  private findNearbyPickup(p: SimSoldier): MmNearbyPickupHud | null {
    let best: SimDroppedWeapon | null = null;
    let bestD = 54;
    for (const d of this.drops) {
      const dd = dist(p.x, p.y, d.x, d.y);
      if (dd < bestD) {
        bestD = dd;
        best = d;
      }
    }
    if (!best) return null;
    const w = getMmWeaponById(best.weaponId);
    return {
      id: best.id,
      weaponId: best.weaponId,
      weaponName: w.name,
      canDualWield: canDualWieldPair(p.activeSlot.weaponId, best.weaponId)
    };
  }

  private stepModeLogic(dt: number): void {
    if (this.config.mode === 'ctf') {
      this.stepCtf(dt);
    } else if (this.config.mode === 'ptb') {
      this.stepPtb(dt);
    } else if (this.config.mode === 'survival') {
      this.stepSurvival(dt);
    } else if (this.config.mode === 'bootcamp') {
      this.stepBootcamp();
    }
  }

  private stepCtf(dt: number): void {
    (['blue', 'red'] as const).forEach((team) => {
      const fl = this.flags[team];
      if (fl.carrierId) {
        const c = this.soldiers.find((s) => s.id === fl.carrierId && s.alive);
        if (c) {
          fl.x = c.x;
          fl.y = c.y - 12;
          // Check capture at carrier's home flag!
          const home = this.flags[c.team === 'blue' ? 'blue' : 'red'];
          if (!home.carrierId && dist(home.x, home.y, home.homeX, home.homeY) < 25 && dist(c.x, c.y, home.homeX, home.homeY) < 52) {
            if (c.team === 'blue') this.scoreBlue++;
            else this.scoreRed++;
            c.captures++;
            if (c.isPlayer) this.playerFlagCaptures++;
            c.carryingFlag = null;
            fl.carrierId = null;
            fl.x = fl.homeX;
            fl.y = fl.homeY;
            this.showBanner(`${c.team.toUpperCase()} CAPTURED THE FLAG!`, `${c.name} scored!`, c.team === 'blue' ? '#38BDF8' : '#EF4444');
            mmAudio.playKillstreakChime(3);
            if (this.scoreBlue >= this.config.scoreLimit || this.scoreRed >= this.config.scoreLimit) {
              this.finishMatch();
            }
          }
        } else {
          fl.carrierId = null;
          fl.droppedTimer = 14;
        }
        return;
      }

      if (fl.droppedTimer > 0) {
        fl.droppedTimer -= dt;
        if (fl.droppedTimer <= 0) {
          fl.x = fl.homeX;
          fl.y = fl.homeY;
        }
      }

      for (const s of this.soldiers) {
        if (!s.alive) continue;
        if (dist(s.x, s.y, fl.x, fl.y) < 42) {
          if (s.team === team) {
            // Return dropped own flag
            if (dist(fl.x, fl.y, fl.homeX, fl.homeY) > 25) {
              fl.x = fl.homeX;
              fl.y = fl.homeY;
              fl.droppedTimer = 0;
              mmAudio.playPickup();
            }
          } else if (!s.carryingFlag) {
            fl.carrierId = s.id;
            s.carryingFlag = team;
            mmAudio.playPickup();
            this.showBanner(`${s.name} GRABBED ${team.toUpperCase()} FLAG!`, 'Intercept the flag carrier!', '#F5A623');
          }
        }
      }
    });
  }

  private stepPtb(dt: number): void {
    const aliveBlue = this.soldiers.filter((s) => s.team === 'blue' && s.alive).length;
    const aliveRed = this.soldiers.filter((s) => s.team === 'red' && s.alive).length;

    if (this.ptbBombState === 'carried') {
      // Check if any Red soldier stands near Site A or Site B to plant (3s)
      const planter = this.soldiers.find(
        (s) =>
          s.alive &&
          s.team === 'red' &&
          (dist(s.x, s.y, this.map.bombSiteA.x, this.map.bombSiteA.y) < 70 ||
            dist(s.x, s.y, this.map.bombSiteB.x, this.map.bombSiteB.y) < 70)
      );
      if (planter) {
        this.ptbActionProgress += dt / 3.0;
        if (this.ptbActionProgress >= 1) {
          const nearA = dist(planter.x, planter.y, this.map.bombSiteA.x, this.map.bombSiteA.y) < 75;
          this.ptbBombSite = nearA ? 'A' : 'B';
          this.ptbBombX = nearA ? this.map.bombSiteA.x : this.map.bombSiteB.x;
          this.ptbBombY = nearA ? this.map.bombSiteA.y : this.map.bombSiteB.y;
          this.ptbBombState = 'planted';
          this.ptbBombTimer = 30.0;
          this.ptbActionProgress = 0;
          if (planter.isPlayer) this.playerBombActions++;
          this.showBanner(`C4 PLANTED AT SITE ${this.ptbBombSite}!`, '30 SECONDS TO DEFUSE!', '#EF4444');
          mmAudio.playKillstreakChime(2);
        }
      } else {
        this.ptbActionProgress = Math.max(0, this.ptbActionProgress - dt);
      }

      if (aliveRed === 0) {
        this.awardPtbRound('blue', 'All Attackers Eliminated!');
      } else if (aliveBlue === 0) {
        this.awardPtbRound('red', 'All Defenders Eliminated!');
      }
    } else if (this.ptbBombState === 'planted') {
      this.ptbBombTimer -= dt;
      const defuser = this.soldiers.find(
        (s) => s.alive && s.team === 'blue' && dist(s.x, s.y, this.ptbBombX, this.ptbBombY) < 68
      );
      if (defuser) {
        this.ptbActionProgress += dt / 4.0;
        if (this.ptbActionProgress >= 1) {
          if (defuser.isPlayer) this.playerBombActions++;
          this.ptbBombState = 'defused';
          this.awardPtbRound('blue', 'Bomb Defused by Blue Squad!');
          return;
        }
      } else {
        this.ptbActionProgress = Math.max(0, this.ptbActionProgress - dt);
      }

      if (this.ptbBombTimer <= 0) {
        this.ptbBombState = 'exploded';
        mmAudio.playExplosion();
        this.spawnShockwave(this.ptbBombX, this.ptbBombY, 260, '#EF4444');
        this.awardPtbRound('red', 'C4 Detonated!');
      }
    }
  }

  private awardPtbRound(winner: 'blue' | 'red', reason: string): void {
    if (winner === 'blue') {
      this.ptbBlueRounds++;
      this.scoreBlue = this.ptbBlueRounds;
    } else {
      this.ptbRedRounds++;
      this.scoreRed = this.ptbRedRounds;
    }
    this.showBanner(`${winner.toUpperCase()} WINS ROUND ${this.ptbRound}!`, reason, winner === 'blue' ? '#38BDF8' : '#EF4444');
    if (this.ptbBlueRounds >= 3 || this.ptbRedRounds >= 3) {
      this.finishMatch();
      return;
    }
    this.ptbRound++;
    this.resetPtbRound();
  }

  private stepSurvival(dt: number): void {
    const p = this.getPlayer();
    const aliveAllies = this.soldiers.filter((s) => s.team === 'blue' && s.alive).length;
    if (p && !p.alive && aliveAllies === 0) {
      this.finishMatch();
      return;
    }
    const enemiesAlive = this.soldiers.filter((s) => s.team === 'red' && s.alive).length;
    if (enemiesAlive === 0) {
      this.survivalWaveClearTimer += dt;
      if (this.survivalWaveClearTimer >= 2.2) {
        this.survivalWaveClearTimer = 0;
        this.playerRankCashEarned += 20;
        this.spawnSurvivalWave(this.survivalWave + 1);
      }
    }
  }

  private stepBootcamp(): void {
    const sarge = this.soldiers.find((s) => s.isSarge);
    const advance = (nextStep: number, msg: string) => {
      this.bootcampStep = nextStep;
      if (sarge) {
        sarge.speechText = msg;
        sarge.speechTimer = 7;
      }
      mmAudio.playKillstreakChime(2);
    };

    if (this.bootcampStep === 0 && this.bootcampMovedSec >= 1.2) {
      advance(1, 'Great! Now ignite Rocket Boots (W / Space / Left Stick Up)!');
    } else if (this.bootcampStep === 1 && this.bootcampFlewSec >= 1.0) {
      advance(2, 'Nice flying! Shoot down the 3 Target Dummies ahead!');
    } else if (this.bootcampStep === 2 && this.bootcampTargetsKilled >= 3) {
      // Respawn 1 sniper target far right
      const d = this.soldiers.find((s) => s.isTargetDummy);
      if (d) {
        d.alive = true;
        d.hp = 60;
        d.x = 1850;
        d.y = 840;
      }
      advance(3, 'Press Z / Zoom Button & land a zoomed Sniper shot!');
    } else if (this.bootcampStep === 3 && this.bootcampZoomShotDone) {
      const d = this.soldiers.find((s) => s.isTargetDummy);
      if (d) {
        d.alive = true;
        d.hp = 60;
        d.x = 640;
        d.y = this.map.height - 140;
      }
      advance(4, 'Close in and Melee Attack (F / Punch Button) the dummy!');
    } else if (this.bootcampStep === 4 && this.bootcampMeleeDone) {
      advance(5, 'Throw a Frag Grenade (G / Grenade Button)!');
    } else if (this.bootcampStep === 5 && this.bootcampGrenadeDone) {
      advance(6, 'Pick up & Dual Wield the Uzi (X / +Dual Wield) to graduate!');
    } else if (this.bootcampStep === 6 && this.bootcampDualDone) {
      this.bootcampStep = 7;
      this.showBanner('BOOT CAMP COMPLETE!', 'You are combat-ready, Soldier!', '#4ADE80');
      setTimeout(() => {
        if (!this.matchEnded) this.finishMatch();
      }, 1500);
    }
  }

  // ==================== TACTICAL AI BOTS & SARGE AI ====================
  private computeAiInput(
    bot: SimSoldier,
    dt: number
  ): { moveX: number; thrustUp: boolean; crouch: boolean; dropThrough: boolean; wantsFire: boolean } {
    bot.aiThinkTimer -= dt;
    if (bot.aiJetBurst > 0) bot.aiJetBurst -= dt;

    const diffAcc =
      this.config.botDifficulty === 'easy'
        ? 0.28
        : this.config.botDifficulty === 'normal'
          ? 0.16
          : this.config.botDifficulty === 'pro'
            ? 0.08
            : 0.03;

    // 1. Find nearest visible enemy
    let target: SimSoldier | null = null;
    let bestD = 980;
    for (const o of this.soldiers) {
      if (!o.alive || o.id === bot.id || o.isTargetDummy) continue;
      if (!this.canDamage(bot.team, o.team)) continue;
      const d = dist(bot.x, bot.y, o.x, o.y);
      if (d < bestD) {
        bestD = d;
        target = o;
      }
    }

    // 2. Gas cloud / Proxy mine avoidance
    const inGas = this.gasClouds.find((g) => dist(bot.x, bot.y, g.x, g.y) < g.radius + 45);
    const nearAbyss = this.map.lethalAbyss && bot.y > this.map.height - 230;

    if (bot.aiThinkTimer <= 0) {
      bot.aiThinkTimer = 0.28 + Math.random() * 0.25;
      if (inGas) {
        bot.aiMoveDir = bot.x < inGas.x ? -1 : 1;
        bot.aiJetBurst = 0.5;
      } else if (bot.hp < bot.maxHp * 0.5) {
        // Seek health pad
        const hpPad = this.pads.find((p) => p.kind === 'health' && p.active);
        if (hpPad) {
          bot.aiGoalX = hpPad.x;
          bot.aiGoalY = hpPad.y;
          bot.aiMoveDir = Math.sign(hpPad.x - bot.x);
        }
      } else if (bot.isSarge) {
        const p = this.getPlayer();
        if (p && p.alive && dist(bot.x, bot.y, p.x, p.y) > 260) {
          bot.aiGoalX = p.x;
          bot.aiGoalY = p.y;
          bot.aiMoveDir = Math.sign(p.x - bot.x);
        } else {
          bot.aiMoveDir = Math.random() < 0.5 ? -1 : 1;
        }
      } else if (this.config.mode === 'ctf') {
        const enemyFlag = this.flags[bot.team === 'blue' ? 'red' : 'blue'];
        const homeFlag = this.flags[bot.team === 'blue' ? 'blue' : 'red'];
        const gx = bot.carryingFlag ? homeFlag.homeX : enemyFlag.x;
        const gy = bot.carryingFlag ? homeFlag.homeY : enemyFlag.y;
        bot.aiGoalX = gx;
        bot.aiGoalY = gy;
        bot.aiMoveDir = Math.sign(gx - bot.x);
      } else if (this.config.mode === 'ptb') {
        const site = this.ptbBombState === 'planted' ? { x: this.ptbBombX, y: this.ptbBombY } : this.map.bombSiteA;
        bot.aiGoalX = site.x;
        bot.aiGoalY = site.y;
        bot.aiMoveDir = Math.sign(site.x - bot.x);
      } else if (target) {
        bot.aiGoalX = target.x;
        bot.aiGoalY = target.y;
        bot.aiMoveDir = bestD > 260 ? Math.sign(target.x - bot.x) : bestD < 130 ? -Math.sign(target.x - bot.x) : (Math.random() - 0.5) * 2;
      } else {
        bot.aiGoalX = 240 + Math.random() * (this.map.width - 480);
        bot.aiGoalY = 240 + Math.random() * (this.map.height - 480);
        bot.aiMoveDir = Math.sign(bot.aiGoalX - bot.x);
      }

      if (bot.aiGoalY < bot.y - 70 || Math.random() < 0.25) {
        bot.aiJetBurst = 0.35 + Math.random() * 0.35;
      }

      // Throw grenade occasionally if target is mid-range
      if (target && bestD > 160 && bestD < 430 && Math.random() < 0.08) {
        this.throwGrenade(bot);
      }
    }

    let wantsFire = false;
    if (target) {
      const lead = this.config.botDifficulty === 'insane' ? 0.22 : this.config.botDifficulty === 'pro' ? 0.14 : 0.05;
      const aimX = target.x + target.vx * lead;
      const aimY = target.y - 16 + target.vy * lead;
      const desired = Math.atan2(aimY - (bot.y - 8), aimX - bot.x) + (Math.random() - 0.5) * diffAcc;
      bot.aimAngle = desired;
      const clearShot = !this.segmentBlocked(bot.x, bot.y - 10, target.x, target.y - 12);
      if (clearShot && bestD < 740) {
        wantsFire = true;
      }
      if (bestD < 52 && bot.meleeCooldown <= 0) {
        this.executeMelee(bot);
      }
    } else {
      bot.aimAngle = bot.aiMoveDir >= 0 ? 0 : Math.PI;
    }

    const blockedAhead = this.pointHitsSolid(bot.x + bot.aiMoveDir * 28, bot.y);
    const thrustUp = nearAbyss || blockedAhead || bot.aiJetBurst > 0;
    const dropThrough = bot.aiGoalY > bot.y + 90;
    const crouch = !target && bot.hp < bot.maxHp * 0.45 && bot.onGround;

    return { moveX: bot.aiMoveDir, thrustUp, crouch, dropThrough, wantsFire };
  }

  private segmentBlocked(x1: number, y1: number, x2: number, y2: number): boolean {
    const steps = 14;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (this.pointHitsSolid(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) return true;
    }
    return false;
  }

  private findNearestEnemyInCone(s: SimSoldier, angle: number, coneRad: number, maxRange: number): SimSoldier | null {
    let best: SimSoldier | null = null;
    let bestD = maxRange;
    for (const o of this.soldiers) {
      if (!o.alive || o.id === s.id) continue;
      if (!this.canDamage(s.team, o.team)) continue;
      const d = dist(s.x, s.y, o.x, o.y);
      if (d > bestD) continue;
      const a = Math.atan2(o.y - s.y, o.x - s.x);
      const diff = Math.abs(Math.atan2(Math.sin(a - angle), Math.cos(a - angle)));
      if (diff <= coneRad) {
        bestD = d;
        best = o;
      }
    }
    return best;
  }

  private spawnSparks(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 260,
        vy: (Math.random() - 0.5) * 260,
        size: 2.5,
        color,
        ttl: 0.25,
        maxTtl: 0.25,
        gravity: 340,
        kind: 'dot'
      });
    }
  }

  private spawnShockwave(x: number, y: number, radius: number, color: string): void {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: radius,
      color,
      ttl: 0.35,
      maxTtl: 0.35,
      gravity: 0,
      kind: 'ring'
    });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * (120 + Math.random() * 140),
        vy: Math.sin(a) * (120 + Math.random() * 140),
        size: 6 + Math.random() * 6,
        color,
        ttl: 0.5,
        maxTtl: 0.5,
        gravity: 200,
        kind: 'smoke'
      });
    }
  }

  private stepParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.ttl -= dt;
      if (pt.ttl <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      pt.vy += pt.gravity * dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
    }
  }

  // ==================== CAMERA & RENDERING ====================
  private updateCamera(dt: number): void {
    const p = this.getPlayer();
    if (!p) return;
    this.currentZoom += (this.targetZoom - this.currentZoom) * Math.min(1, dt * 8);
    const lookPct = this.settings.controls.weaponLookAhead / 100;
    const lookDist = (85 + (this.currentZoom - 1) * 75) * lookPct;
    const tx = p.x + Math.cos(p.aimAngle) * lookDist;
    const ty = p.y - 16 + Math.sin(p.aimAngle) * lookDist * 0.7;
    this.camX += (tx - this.camX) * Math.min(1, dt * 7.5);
    this.camY += (ty - this.camY) * Math.min(1, dt * 7.5);
  }

  private getCameraScale(): number {
    // Higher zoom zooms viewport OUT so snipers see far down corridors (exact Mini Militia behavior!)
    const base = Math.min(this.canvas.width / 1020, this.canvas.height / 580);
    return base / (1 + (this.currentZoom - 1) * 0.24);
  }

  private screenToWorld(sx: number, sy: number): { x: number; y: number } {
    const scale = this.getCameraScale();
    return {
      x: this.camX + (sx - this.canvas.width / 2) / scale,
      y: this.camY + (sy - this.canvas.height / 2) / scale
    };
  }

  private renderFrame(): void {
    const { ctx, canvas } = this;
    const cw = canvas.width;
    const ch = canvas.height;
    const scale = this.getCameraScale();

    // 1. 4-Layer Parallax Background
    drawParallaxBackground(ctx, cw, ch, this.map.biome, this.camX, this.camY, this.matchTimeSec, false);

    ctx.save();
    const shakeX = this.shakeTimer > 0 ? (Math.random() - 0.5) * this.shakeMag : 0;
    const shakeY = this.shakeTimer > 0 ? (Math.random() - 0.5) * this.shakeMag : 0;
    ctx.translate(cw / 2 + shakeX, ch / 2 + shakeY);
    ctx.scale(scale, scale);
    ctx.translate(-this.camX, -this.camY);

    // 2. Platforms & Terrain Geometry
    for (const pl of this.map.platforms) {
      this.drawPlatform(ctx, pl);
    }

    // 3. CTF Flag Pedestals / PTB Bomb Sites
    if (this.config.mode === 'ctf') {
      this.drawCtfFlags(ctx);
    } else if (this.config.mode === 'ptb') {
      this.drawPtbSites(ctx);
    }

    // 4. Spawn Pads (Health, Boost, Ammo, Weapons)
    for (const pad of this.pads) {
      this.drawPad(ctx, pad);
    }

    // 5. Dropped Floor Weapons
    for (const d of this.drops) {
      ctx.save();
      ctx.translate(d.x, d.y + Math.sin(this.matchTimeSec * 4 + d.x) * 2.5);
      ctx.fillStyle = 'rgba(245, 166, 35, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      drawWeaponVector(ctx, d.weaponId, 0, 0);
      ctx.restore();
    }

    // 6. Poison Gas Clouds
    for (const gc of this.gasClouds) {
      const alpha = Math.min(0.55, (gc.ttl / gc.maxTtl) * 0.75);
      const radGrad = ctx.createRadialGradient(gc.x, gc.y, 12, gc.x, gc.y, gc.radius);
      radGrad.addColorStop(0, `rgba(132, 204, 22, ${alpha})`);
      radGrad.addColorStop(1, 'rgba(132, 204, 22, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(gc.x, gc.y, gc.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Soldiers + M93BA Red Laser Sight + Sightline
    const player = this.getPlayer();
    for (const s of this.soldiers) {
      if (!s.alive) continue;
      const w = getMmWeaponById(s.activeSlot.weaponId);
      // Iconic M93BA Red Laser Sight (or Player Crosshair sightline)
      if (w.hasLaserSight || (s.isPlayer && this.settings.controls.crosshairStyle === 'laser_dot')) {
        ctx.save();
        ctx.strokeStyle = w.hasLaserSight ? 'rgba(239, 68, 68, 0.72)' : 'rgba(244, 244, 236, 0.24)';
        ctx.lineWidth = w.hasLaserSight ? 1.8 : 1.2;
        ctx.setLineDash(w.hasLaserSight ? [] : [6, 6]);
        ctx.beginPath();
        ctx.moveTo(s.x + Math.cos(s.aimAngle) * 26, s.y - 7 + Math.sin(s.aimAngle) * 26);
        ctx.lineTo(s.x + Math.cos(s.aimAngle) * (w.hasLaserSight ? 950 : 280), s.y - 7 + Math.sin(s.aimAngle) * (w.hasLaserSight ? 950 : 280));
        ctx.stroke();
        ctx.restore();
      }

      const isCrouchStealthEnemy =
        !s.isPlayer && s.crouching && Math.abs(s.vx) < 12 && player && this.canDamage(player.team, s.team);
      drawDoodleSoldier(ctx, {
        x: s.x,
        y: s.y,
        aimAngle: s.aimAngle,
        avatar: s.avatar,
        team: s.team,
        weaponId: s.activeSlot.weaponId,
        offhandWeaponId: s.offhandSlot?.weaponId ?? null,
        crouching: s.crouching,
        jetpacking: s.jetpacking,
        walkPhase: s.walkPhase,
        scale: s.isBoss ? 1.32 : 1.0,
        hpPct: s.hp / s.maxHp,
        name: s.name,
        showTag: this.settings.video.showNametags && !isCrouchStealthEnemy,
        stealthAlpha: s.isPlayer && s.crouching && Math.abs(s.vx) < 12 ? 0.72 : 1.0,
        spawnShield: s.spawnShieldTimer > 0,
        boosted: s.boostTimer > 0,
        burning: s.burnTimer > 0,
        empDisabled: s.empDisabledTimer > 0,
        carryingFlagColor: s.carryingFlag === 'blue' ? '#2B82D9' : s.carryingFlag === 'red' ? '#D93829' : null,
        muzzleFlash: s.muzzleFlash,
        meleeSwing: s.meleeTimer,
        speechText: s.speechText,
        timeSec: this.matchTimeSec
      });
    }

    // 8. Projectiles
    for (const pr of this.projectiles) {
      ctx.save();
      if (pr.kind === 'saw') {
        ctx.translate(pr.x, pr.y);
        ctx.rotate(this.matchTimeSec * 28);
        ctx.fillStyle = '#E2E8F0';
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (pr.kind === 'rocket') {
        ctx.translate(pr.x, pr.y);
        ctx.rotate(Math.atan2(pr.vy, pr.vx));
        ctx.fillStyle = '#3F6212';
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 1.8;
        ctx.fillRect(-10, -4, 20, 8);
        ctx.strokeRect(-10, -4, 20, 8);
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(6, -3.5, 5, 7);
      } else if (pr.kind === 'emp') {
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, 8 + Math.sin(this.matchTimeSec * 20) * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (pr.kind === 'flame') {
        ctx.fillStyle = pr.ttl > 0.25 ? '#FACC15' : 'rgba(239, 68, 68, 0.72)';
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, 7 + (0.45 - pr.ttl) * 20, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = '#FDE047';
        ctx.lineWidth = pr.kind === 'pellet' ? 2 : 2.8;
        ctx.beginPath();
        ctx.moveTo(pr.x, pr.y);
        ctx.lineTo(pr.x - pr.vx * 0.018, pr.y - pr.vy * 0.018);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 9. Grenades & Blinking Proximity Mines
    for (const gr of this.grenades) {
      ctx.save();
      ctx.translate(gr.x, gr.y);
      const def = getMmGrenadeById(gr.kind);
      ctx.fillStyle = def.color;
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 2;
      if (gr.kind === 'proxy') {
        ctx.beginPath();
        ctx.roundRect(-7, -4, 14, 8, 3);
        ctx.fill();
        ctx.stroke();
        if (gr.armed && Math.sin(gr.blinkPhase) > 0) {
          ctx.fillStyle = '#FEF08A';
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // 10. Particles & Shockwaves & Laser Beams
    for (const pt of this.particles) {
      ctx.save();
      const alpha = Math.max(0, pt.ttl / pt.maxTtl);
      ctx.globalAlpha = alpha;
      if (pt.kind === 'beam' && pt.x2 !== undefined && pt.y2 !== undefined) {
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = pt.size * 2;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x2, pt.y2);
        ctx.stroke();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (pt.kind === 'ring') {
        const r = pt.size * (1 - alpha * 0.7);
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = 5 * alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();

    // 11. Arctic Snow Overlay
    if (this.map.snowOverlay) {
      ctx.fillStyle = 'rgba(248, 250, 252, 0.55)';
      for (let i = 0; i < 45; i++) {
        const sx = ((i * 157 + this.matchTimeSec * 45) % cw + cw) % cw;
        const sy = ((i * 97 + this.matchTimeSec * 85) % ch + ch) % ch;
        ctx.beginPath();
        ctx.arc(sx, sy, (i % 3) + 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 12. Off-Screen Directional Enemy / Ally Arrows (Crouch Stealth Hides Enemy Arrow!)
    if (this.settings.gameplay.showOffscreenArrows && player) {
      this.drawOffscreenArrows(ctx, player, cw, ch, scale);
    }

    // 13. Desktop Dynamic Crosshair
    if (this.mouseMoved && !this.touchAimActive) {
      ctx.save();
      ctx.translate(this.mouseScreenX, this.mouseScreenY);
      ctx.strokeStyle = '#F5A623';
      ctx.lineWidth = 2;
      const r = this.settings.controls.crosshairStyle === 'minimal' ? 5 : 10;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.moveTo(-r - 5, 0);
      ctx.lineTo(-r + 3, 0);
      ctx.moveTo(r - 3, 0);
      ctx.lineTo(r + 5, 0);
      ctx.moveTo(0, -r - 5);
      ctx.lineTo(0, -r + 3);
      ctx.moveTo(0, r - 3);
      ctx.lineTo(0, r + 5);
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawPlatform(ctx: CanvasRenderingContext2D, pl: MmPlatformRect): void {
    ctx.save();
    if (pl.oneWay) {
      ctx.fillStyle = pl.material === 'wood' ? '#92400E' : '#475569';
      ctx.fillRect(pl.x, pl.y, pl.w, Math.min(16, pl.h));
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(pl.x, pl.y, pl.w, Math.min(16, pl.h));
      ctx.restore();
      return;
    }

    const fill =
      pl.material === 'ice'
        ? '#7DD3FC'
        : pl.material === 'sand'
          ? '#D97706'
          : pl.material === 'metal'
            ? '#334155'
            : pl.material === 'hazard'
              ? '#3F3F46'
              : '#3E4A2E';
    ctx.fillStyle = fill;
    ctx.fillRect(pl.x, pl.y, pl.w, pl.h);

    // Top moss/snow/hazard trim
    ctx.fillStyle =
      pl.material === 'ice'
        ? '#E0F2FE'
        : pl.material === 'sand'
          ? '#FDE68A'
          : pl.material === 'hazard'
            ? '#F59E0B'
            : pl.material === 'metal'
              ? '#64748B'
              : '#4D7C0F';
    ctx.fillRect(pl.x, pl.y, pl.w, Math.min(10, pl.h));

    // Bold comic ink outline
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3;
    ctx.strokeRect(pl.x, pl.y, pl.w, pl.h);
    ctx.restore();
  }

  private drawCtfFlags(ctx: CanvasRenderingContext2D): void {
    (['blue', 'red'] as const).forEach((t) => {
      const fl = this.flags[t];
      if (fl.carrierId) return;
      ctx.save();
      ctx.translate(fl.x, fl.y);
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, 12);
      ctx.lineTo(0, -44);
      ctx.stroke();
      ctx.fillStyle = t === 'blue' ? '#2B82D9' : '#D93829';
      ctx.beginPath();
      ctx.moveTo(0, -44);
      ctx.lineTo(30, -34 + Math.sin(this.matchTimeSec * 6) * 3);
      ctx.lineTo(0, -22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  private drawPtbSites(ctx: CanvasRenderingContext2D): void {
    ([
      ['A', this.map.bombSiteA],
      ['B', this.map.bombSiteB]
    ] as const).forEach(([lbl, pos]) => {
      ctx.save();
      ctx.strokeStyle = '#F5A623';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 46, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#F5A623';
      ctx.font = 'bold 16px "Oswald", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`SITE ${lbl}`, pos.x, pos.y - 52);
      ctx.restore();
    });

    if (this.ptbBombState === 'planted') {
      ctx.save();
      ctx.translate(this.ptbBombX, this.ptbBombY);
      ctx.fillStyle = '#1F2937';
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 2;
      ctx.fillRect(-12, -8, 24, 16);
      ctx.strokeRect(-12, -8, 24, 16);
      if (Math.sin(this.matchTimeSec * 12) > 0) {
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private drawPad(ctx: CanvasRenderingContext2D, pad: SimPadRuntime): void {
    ctx.save();
    ctx.translate(pad.x, pad.y);
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.fillRect(-16, 4, 32, 7);
    ctx.strokeRect(-16, 4, 32, 7);

    if (!pad.active) {
      ctx.restore();
      return;
    }

    const bob = Math.sin(this.matchTimeSec * 4 + pad.index) * 3;
    ctx.translate(0, -10 + bob);
    if (pad.kind === 'health') {
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(-11, -9, 22, 18);
      ctx.strokeRect(-11, -9, 22, 18);
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(-3, -6, 6, 12);
      ctx.fillRect(-6, -3, 12, 6);
    } else if (pad.kind === 'boost') {
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FEF08A';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡', 0, 4);
    } else if (pad.kind === 'ammo') {
      ctx.fillStyle = '#4D7C0F';
      ctx.fillRect(-12, -8, 24, 16);
      ctx.strokeRect(-12, -8, 24, 16);
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(-6, -3, 12, 6);
    } else if (pad.weaponId) {
      drawWeaponVector(ctx, pad.weaponId, 0, 0);
    }
    ctx.restore();
  }

  private drawOffscreenArrows(
    ctx: CanvasRenderingContext2D,
    player: SimSoldier,
    cw: number,
    ch: number,
    scale: number
  ): void {
    const pad = 34;
    for (const s of this.soldiers) {
      if (!s.alive || s.id === player.id) continue;
      // Crouch stealth hides enemy radar arrows!
      if (s.crouching && Math.abs(s.vx) < 12 && this.canDamage(player.team, s.team)) continue;

      const sx = cw / 2 + (s.x - this.camX) * scale;
      const sy = ch / 2 + (s.y - this.camY) * scale;
      if (sx > 20 && sx < cw - 20 && sy > 20 && sy < ch - 20) continue;

      const ang = Math.atan2(sy - ch / 2, sx - cw / 2);
      const ax = clamp(sx, pad, cw - pad);
      const ay = clamp(sy, pad + 38, ch - pad - 20);
      const isAlly = !this.canDamage(player.team, s.team);

      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(ang);
      ctx.fillStyle = isAlly ? '#2B82D9' : '#D93829';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(11, 0);
      ctx.lineTo(-7, -7);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-7, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  // ==================== DESKTOP MOUSE + KEYBOARD BINDINGS ====================
  private onKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    this.keys.add(e.code);
    if (e.code === 'KeyQ') this.triggerSwapWeapon();
    else if (e.code === 'KeyR') this.triggerReload();
    else if (e.code === 'KeyF') this.triggerMelee();
    else if (e.code === 'KeyG') this.triggerThrowGrenade();
    else if (e.code === 'KeyE') this.triggerPickup(false);
    else if (e.code === 'KeyX') this.triggerPickup(true);
    else if (e.code === 'KeyZ') this.cycleZoom();
    else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.triggerCombatRoll();
    else if (e.code === 'Digit1') this.selectGrenadeType('frag');
    else if (e.code === 'Digit2') this.selectGrenadeType('gas');
    else if (e.code === 'Digit3') this.selectGrenadeType('proxy');
    else if (e.code === 'Digit4') this.selectGrenadeType('emp');
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  private onMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseScreenX = ((e.clientX - rect.left) / rect.width) * this.canvas.width;
    this.mouseScreenY = ((e.clientY - rect.top) / rect.height) * this.canvas.height;
    this.mouseMoved = true;
  };

  private onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) this.mouseDown = true;
    if (e.button === 2) this.rightMouseDown = true;
  };

  private onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) this.mouseDown = false;
    if (e.button === 2) this.rightMouseDown = false;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.cycleZoom();
  };

  private onContextMenu = (e: MouseEvent) => e.preventDefault();

  private bindDesktopInputs(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    this.canvas.addEventListener('contextmenu', this.onContextMenu);
  }

  private unbindDesktopInputs(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
  }

  // ==================== HUD SNAPSHOT & MATCH FINISH ====================
  private buildScoreboard(): MmScoreboardRow[] {
    const sorted = [...this.soldiers]
      .filter((s) => !s.isTargetDummy)
      .sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
    const topId = sorted[0]?.id ?? '';
    return sorted.map((s) => ({
      id: s.id,
      name: s.name,
      team: s.team,
      isPlayer: s.isPlayer,
      kills: s.kills,
      deaths: s.deaths,
      assists: s.assists,
      captures: s.captures,
      pingMs: s.isPlayer ? 18 : 24 + ((s.name.length * 7) % 36),
      alive: s.alive,
      isMvp: s.id === topId && s.kills > 0
    }));
  }

  private finishMatch(): void {
    if (this.matchEnded) return;
    this.matchEnded = true;
    const p = this.getPlayer();
    const sb = this.buildScoreboard();
    const playerRow = sb.find((r) => r.isPlayer);

    let victory = false;
    if (this.config.mode === 'bootcamp') victory = this.bootcampStep >= 7;
    else if (this.config.mode === 'survival') victory = this.survivalWave >= 3;
    else if (this.config.mode === 'ffa') victory = sb[0]?.isPlayer ?? false;
    else {
      const pTeam = p?.team ?? 'blue';
      victory = pTeam === 'blue' ? this.scoreBlue >= this.scoreRed : this.scoreRed >= this.scoreBlue;
    }

    const kills = p?.kills ?? 0;
    const xpEarned = Math.round(
      180 + kills * 55 + this.playerHeadshots * 25 + (victory ? 320 : 100) + (this.config.mode === 'survival' ? this.survivalWave * 95 : 0)
    );
    const coinsEarned = Math.round(120 + kills * 28 + (victory ? 180 : 60));
    const cashEarned = Math.round((victory ? 45 : 18) + this.playerRankCashEarned + Math.floor(kills / 4) * 10);

    const summary: MmMatchSummary = {
      victory,
      mode: this.config.mode,
      mapId: this.map.id,
      mapName: this.map.name,
      scoreBlue: this.scoreBlue,
      scoreRed: this.scoreRed,
      playerKills: kills,
      playerDeaths: p?.deaths ?? 0,
      playerAssists: p?.assists ?? 0,
      headshots: this.playerHeadshots,
      meleeKills: this.playerMeleeKills,
      grenadeKills: this.playerGrenadeKills,
      dualWieldKills: this.playerDualKills,
      sniperHeadshots: this.playerSniperHeadshots,
      macheteKills: this.playerMacheteKills,
      smawKills: this.playerSmawKills,
      flameKills: this.playerFlameKills,
      sawKills: this.playerSawKills,
      flagCaptures: this.playerFlagCaptures,
      bombActions: this.playerBombActions,
      suicides: this.playerSuicides,
      bestStreak: p?.bestStreak ?? 0,
      bestMultiKill: p?.bestMultiKill ?? 0,
      waveReached: this.config.mode === 'survival' ? this.survivalWave : 0,
      durationSec: this.matchTimeSec,
      isMvp: Boolean(playerRow?.isMvp),
      xpEarned,
      coinsEarned,
      cashEarned,
      weaponDeltas: this.weaponDeltas,
      scoreboard: sb
    };

    this.lastMatchSummary = summary;
    this.emitHud();
    this.onMatchFinish(summary);
  }

  private emitHud(): void {
    const p = this.getPlayer();
    if (!p) return;
    const activeW = getMmWeaponById(p.activeSlot.weaponId);
    const offW = p.offhandSlot ? getMmWeaponById(p.offhandSlot.weaponId) : null;
    const holW = p.holsteredSlot ? getMmWeaponById(p.holsteredSlot.weaponId) : null;
    const sb = this.buildScoreboard();
    const ffaRank = Math.max(1, sb.findIndex((r) => r.isPlayer) + 1);
    const bootcampPrompts = [
      'Step 1/7: Move Left/Right (A/D) & Crouch (S)',
      'Step 2/7: Ignite Rocket Boots (W / Space / Left Stick Up)',
      `Step 3/7: Destroy 3 Cardboard Targets (${this.bootcampTargetsKilled}/3)`,
      'Step 4/7: Press Z (Zoom) and hit the Sniper target!',
      'Step 5/7: Melee Attack (F / Punch) the close dummy!',
      'Step 6/7: Throw a Frag Grenade (G / Grenade Button)!',
      'Step 7/7: Pick up & Dual Wield the Uzi (X / +Dual Wield)!',
      'Boot Camp Graduated!'
    ];

    let ptbPrompt: 'plant' | 'defuse' | null = null;
    if (this.config.mode === 'ptb' && p.alive) {
      if (
        p.team === 'red' &&
        this.ptbBombState === 'carried' &&
        (dist(p.x, p.y, this.map.bombSiteA.x, this.map.bombSiteA.y) < 75 ||
          dist(p.x, p.y, this.map.bombSiteB.x, this.map.bombSiteB.y) < 75)
      ) {
        ptbPrompt = 'plant';
      } else if (p.team === 'blue' && this.ptbBombState === 'planted' && dist(p.x, p.y, this.ptbBombX, this.ptbBombY) < 72) {
        ptbPrompt = 'defuse';
      }
    }

    this.onHudUpdate({
      mode: this.config.mode,
      mapId: this.map.id,
      mapName: this.map.name,
      classicV4: this.config.classicV4,
      timeRemainingSec: Math.ceil(this.timeRemainingSec),
      scoreBlue: this.scoreBlue,
      scoreRed: this.scoreRed,
      scoreLimit: this.config.scoreLimit,
      ffaRank,
      ffaLeaderKills: sb[0]?.kills ?? 0,
      survivalWave: this.survivalWave,
      survivalEnemiesAlive: this.soldiers.filter((s) => s.team === 'red' && s.alive).length,
      ptbRound: this.ptbRound,
      ptbBlueRounds: this.ptbBlueRounds,
      ptbRedRounds: this.ptbRedRounds,
      ptbBombState: this.ptbBombState,
      ptbBombTimer: Math.ceil(this.ptbBombTimer),
      ptbBombSite: this.ptbBombSite,
      ptbCanPlantOrDefuse: ptbPrompt,
      ptbActionProgress: this.ptbActionProgress,
      bootcampStep: this.bootcampStep,
      bootcampPrompt: bootcampPrompts[Math.min(bootcampPrompts.length - 1, this.bootcampStep)],
      bootcampDone: this.bootcampStep >= 7,
      fps: Math.round(this.fpsSamples),
      pingMs: 18,
      player: {
        alive: p.alive,
        respawnSec: Math.ceil(p.respawnTimer),
        hp: Math.ceil(p.hp),
        maxHp: p.maxHp,
        jetFuel: Math.round(p.jetFuel),
        maxJetFuel: p.maxJetFuel,
        empDisabledSec: Math.ceil(p.empDisabledTimer),
        boostTimer: Math.ceil(p.boostTimer),
        crouching: p.crouching,
        stealthHidden: p.crouching && Math.abs(p.vx) < 12,
        carryingFlag: Boolean(p.carryingFlag),
        team: p.team,
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
        streak: p.streak,
        activeWeaponId: activeW.id,
        activeWeaponName: activeW.shortName,
        offhandWeaponId: offW?.id ?? null,
        offhandWeaponName: offW?.shortName ?? null,
        holsteredWeaponId: holW?.id ?? null,
        holsteredWeaponName: holW?.shortName ?? null,
        mag: Math.floor(p.activeSlot.mag),
        magMax: activeW.magSize,
        reserve: p.activeSlot.reserve,
        offhandMag: p.offhandSlot ? Math.floor(p.offhandSlot.mag) : 0,
        offhandMagMax: offW?.magSize ?? 0,
        reloading: p.reloading,
        reloadProgress: p.reloading ? 1 - p.reloadTimer / Math.max(0.1, p.reloadDuration) : 0,
        spinUpProgress: activeW.spinUpSec ? p.spinUpTimer / activeW.spinUpSec : 0,
        grenadeType: p.grenadeType,
        grenades: { ...p.grenades },
        zoomLevel: Number(this.targetZoom.toFixed(1)),
        zoomMax: this.getMaxZoomForPlayer(p),
        coins: this.playerCoins,
        activeLoadoutId: p.activeLoadoutId
      },
      nearbyPickup: this.findNearbyPickup(p),
      killFeed: [...this.killFeed],
      banner: this.banner ? { ...this.banner } : null,
      scoreboard: sb,
      matchEnded: this.matchEnded,
      matchResult: this.lastMatchSummary
    });
  }
}
