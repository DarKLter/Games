import * as THREE from 'three';
import {
  NARUTO_MODES,
  NARUTO_SHINOBI_ROSTER,
  NARUTO_STAGES,
  SENKI_RAMEN_ITEMS,
  STORM_NINJA_TOOLS,
  computeSenkiLevelStats,
  computeStormComboProration,
  computeStormMaxUsableChakra,
  resolveNarutoTeamSynergy,
  selectSenkiTowerTarget,
  stepSubstitutionGauge,
  type NarutoModeDef,
  type NarutoShinobiDef,
  type NarutoSkillDef,
  type NarutoStageDef,
  type StormSupportType
} from '../../core/arenaRoster';
import { ArcadeAudio } from '../../core/audio';
import {
  addCoins,
  addXp,
  triggerGameOver,
  updateHealthDisplay,
  updateInGameHud,
  updateNarutoHud
} from '../../core/runtimeBridge';
import { persistNarutoProgression, playerState } from '../../core/storage';
import type { Difficulty, GameInstance } from '../../core/types';
import { getViewportSize } from '../../core/viewport';
import { StudioThreeContext, buildShinobiMesh, type ShinobiMeshRig } from '../../core/threeShared';

const _stormCamDesired = new THREE.Vector3();
const _stormProjVec = new THREE.Vector3();

// ============================================================================
// PART 1: 2D NARUTO SENKI ENGINE TYPES
// ============================================================================
interface SenkiFighter {
  uid: string;
  team: 'konoha' | 'akatsuki';
  isPlayer: boolean;
  isClone: boolean;
  ownerUid?: string;
  cloneTtl: number;
  def: NarutoShinobiDef;
  x: number;
  y: number;
  facing: 1 | -1;
  level: number;
  xp: number;
  xpNext: number;
  hp: number;
  maxHp: number;
  atk: number;
  speed: number;
  alive: boolean;
  respawnTimer: number;
  attackCd: number;
  skillCds: [number, number, number, number, number];
  superArmorTimer: number;
  iFrameTimer: number;
  stunTimer: number;
  awakenedTimer: number;
  atkBuffTimer: number;
  speedBuffTimer: number;
  jashinTimer: number;
  rebirthUsed: boolean;
  lastDamagedEnemyHeroTimer: number;
  animPhase: number;
}

interface SenkiMinion {
  uid: string;
  team: 'konoha' | 'akatsuki';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  atk: number;
  attackCd: number;
  alive: boolean;
}

interface SenkiTower {
  id: string;
  team: 'konoha' | 'akatsuki';
  tier: 1 | 2 | 3; // 1 = Outer, 2 = Inner, 3 = Main Base Crystal
  label: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  atk: number;
  range: number;
  fireCd: number;
  targetUid: string | null;
}

interface SenkiProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  team: 'konoha' | 'akatsuki';
  dmg: number;
  hitsTowers: boolean;
  ttl: number;
  stunSec: number;
}

interface SenkiFloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  ttl: number;
}

// ============================================================================
// PART 2: 3D ULTIMATE NINJA STORM ENGINE TYPES
// ============================================================================
interface StormCombatant {
  team: 'player' | 'enemy';
  slotIndex: number; // 0 = Lead, 1 = Support 1, 2 = Support 2
  def: NarutoShinobiDef;
  supportType: StormSupportType;
  rig: ShinobiMeshRig;
  x: number;
  z: number;
  y: number;
  facingAngle: number;
  hp: number; // Shared per team (2000 max)
  maxHp: number;
  chakra: number; // 0..100
  chakraLockedTimer: number; // 16.0s grey lock on Counterattack
  chakraFatigueTimer: number; // 10.0s post-Awakening fatigue
  subLogs: number; // 0..4
  subCooldownTimer: number; // 14.0s recharge timer (resets to 0 on any log use)
  guardHp: number; // 0..100
  isGuarding: boolean;
  guardBreakTimer: number; // 2.5s dizzy stun
  hitstunTimer: number;
  iFrameTimer: number;
  superArmorTimer: number;
  dashTimer: number;
  comboCount: number;
  comboResetTimer: number;
  awakened: boolean;
  awakeningTimer: number;
  atkBuffTimer: number;
  defBuffTimer: number;
  speedBuffTimer: number;
  exhaustDebuffTimer: number;
  attackCooldown: number;
  jutsuCooldown: number;
  counterStartupTimer: number;
}

interface StormProjectile3D {
  mesh: THREE.Mesh;
  team: 'player' | 'enemy';
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  dmg: number;
  isChakraEnhanced: boolean;
  isUltimate: boolean;
  ttl: number;
}

interface StormLogDecoy3D {
  mesh: THREE.Group;
  x: number;
  y: number;
  z: number;
  ttl: number;
}

export class NarutoSenkiStormGame implements GameInstance {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  threeContainer: HTMLElement;
  diff: Difficulty;
  level: number;
  gameIdx: number;
  score = 0;
  lives = 100;
  maxLives = 100;
  isPaused = false;
  gameOver = false;
  isRunning = false;
  uses3DViewport: boolean;

  private modeDef: NarutoModeDef;
  private stageDef: NarutoStageDef;
  private leadDef: NarutoShinobiDef;
  private support1Def: NarutoShinobiDef;
  private support2Def: NarutoShinobiDef;
  private support1Type: StormSupportType;
  private support2Type: StormSupportType;
  private teamSynergy: { name: string; bonusPct: number };

  private moveDx = 0;
  private moveDy = 0;
  private steerLeftHeld = false;
  private steerRightHeld = false;
  private chakraChargeHeld = false;
  private guardHeld = false;
  private cutInBanner: { title: string; subtitle: string; color: string; timer: number } | null = null;

  // --- PART 1: 2D SENKI STATE ---
  private senkiWidth = 800;
  private senkiHeight = 600;
  private senkiLaneWidth = 2600;
  private senkiGroundY = 420;
  private senkiCameraX = 0;
  private senkiFighters: SenkiFighter[] = [];
  private senkiMinions: SenkiMinion[] = [];
  private senkiTowers: SenkiTower[] = [];
  private senkiProjectiles: SenkiProjectile[] = [];
  private senkiFloatTexts: SenkiFloatText[] = [];
  private senkiWaveTimer = 2.5;
  private senkiGold = 120;
  private senkiGoldTick = 0;
  private senkiRamenCds: [number, number, number] = [0, 0, 0];
  private senkiKills = 0;
  private senkiDeaths = 0;
  private senkiTowersDestroyedCount = 0;
  private senkiAnimFrame: number | null = null;
  private senkiLastTs = 0;

  // --- PART 2: 3D STORM STATE ---
  private three: StudioThreeContext | null = null;
  private stormArenaGroup = new THREE.Group();
  private stormAmenominakaIndex = 0;
  private stormPlayerTeam: StormCombatant[] = [];
  private stormEnemyTeam: StormCombatant[] = [];
  private stormActivePlayerSlot = 0;
  private stormActiveEnemySlot = 0;
  private stormSupportCds: [number, number] = [0, 0];
  private stormGauge = 0; // 0..100
  private stormToolUses: [number, number, number, number] = [2, 2, 3, 2];
  private stormToolCds: [number, number, number, number] = [0, 0, 0, 0];
  private stormProjectiles: StormProjectile3D[] = [];
  private stormLogs: StormLogDecoy3D[] = [];
  private stormLastTs = 0;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    threeContainer: HTMLElement,
    diff: Difficulty,
    level: number,
    gameIdx: number
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.threeContainer = threeContainer;
    this.diff = diff;
    this.level = level;
    this.gameIdx = gameIdx;

    const chosenHeroId =
      playerState.narutoTrialHeroId !== null ? playerState.narutoTrialHeroId : playerState.selectedNarutoHero;
    this.leadDef = NARUTO_SHINOBI_ROSTER[chosenHeroId] ?? NARUTO_SHINOBI_ROSTER[0];
    this.support1Def =
      NARUTO_SHINOBI_ROSTER[playerState.selectedNarutoSupport1] ??
      NARUTO_SHINOBI_ROSTER[(this.leadDef.id + 1) % NARUTO_SHINOBI_ROSTER.length];
    this.support2Def =
      NARUTO_SHINOBI_ROSTER[playerState.selectedNarutoSupport2] ??
      NARUTO_SHINOBI_ROSTER[(this.leadDef.id + 2) % NARUTO_SHINOBI_ROSTER.length];
    this.support1Type = playerState.narutoSupport1Type || 'attack';
    this.support2Type = playerState.narutoSupport2Type || 'guard';

    this.modeDef =
      NARUTO_MODES.find((m) => m.id === playerState.selectedNarutoMode) ?? NARUTO_MODES[0];
    this.stageDef =
      NARUTO_STAGES.find((s) => s.id === playerState.selectedNarutoStage) ?? NARUTO_STAGES[0];
    this.uses3DViewport = this.modeDef.engine === 'storm_3d';
    this.teamSynergy = resolveNarutoTeamSynergy([
      this.leadDef.id,
      this.support1Def.id,
      this.support2Def.id
    ]);
  }

  start(): void {
    this.gameOver = false;
    this.isPaused = false;
    this.isRunning = true;
    this.score = 0;
    this.cutInBanner = {
      title: `${this.leadDef.name.toUpperCase()} — ${this.modeDef.title.toUpperCase()}`,
      subtitle: `${this.stageDef.name} • Team Synergy: ${this.teamSynergy.name}`,
      color: `#${this.leadDef.chakraColor.toString(16).padStart(6, '0')}`,
      timer: 2.8
    };

    if (this.uses3DViewport) {
      this.initStorm3D();
    } else {
      this.initSenki2D();
    }
  }

  stop(): void {
    this.isRunning = false;
    this.gameOver = true;
    if (this.senkiAnimFrame !== null) {
      cancelAnimationFrame(this.senkiAnimFrame);
      this.senkiAnimFrame = null;
    }
    if (this.three) {
      this.three.dispose();
      this.three = null;
    }
    updateNarutoHud(null);
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
    this.senkiLastTs = performance.now();
    this.stormLastTs = performance.now();
  }

  releaseInputs(): void {
    this.moveDx = 0;
    this.moveDy = 0;
    this.steerLeftHeld = false;
    this.steerRightHeld = false;
    this.chakraChargeHeld = false;
    this.guardHeld = false;
  }

  setMoveDir(dx: number, dy: number): void {
    this.moveDx = dx;
    this.moveDy = dy;
  }

  setSteerLeft(down: boolean): void {
    this.steerLeftHeld = down;
  }

  setSteerRight(down: boolean): void {
    this.steerRightHeld = down;
  }

  attack(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.uses3DViewport) {
      this.performStormMeleeOrKunai(false);
    } else {
      const player = this.senkiFighters.find((f) => f.isPlayer);
      if (player && player.alive && player.attackCd <= 0) {
        this.performSenkiBasicAttack(player);
      }
    }
  }

  jump(): void {
    this.triggerAction('jump', true);
  }

  triggerAction(actionKey: string, pressed: boolean): void {
    if (this.gameOver || this.isPaused) return;

    if (actionKey === 'chakra') {
      this.chakraChargeHeld = pressed;
      return;
    }
    if (actionKey === 'guard') {
      this.guardHeld = pressed;
      return;
    }

    if (!pressed) return;

    if (this.uses3DViewport) {
      const p = this.stormPlayerTeam[this.stormActivePlayerSlot];
      const e = this.stormEnemyTeam[this.stormActiveEnemySlot];
      if (!p || !e) return;

      if (actionKey === 'action' || actionKey === 'attack' || actionKey === 'fire') {
        this.performStormMeleeOrKunai(false);
      } else if (actionKey === 'jump' || actionKey === 'skill1') {
        // Skill 1 / Jump = Signature Ninjutsu (or Chakra Dash if holding Chakra)
        if (this.chakraChargeHeld && p.chakra >= 10) {
          p.chakra -= 10;
          p.dashTimer = 0.36;
          ArcadeAudio.play('dash');
        } else {
          this.performStormNinjutsu(p, e);
        }
      } else if (actionKey === 'skill2') {
        // Skill 2 = Chakra Shuriken / Counterattack Parry if Guarding
        if (this.guardHeld || p.isGuarding) {
          if (p.counterStartupTimer <= 0) {
            p.counterStartupTimer = 0.48;
            p.chakraLockedTimer = 16.0; // Locks 35% of max Chakra grey for 16s
            p.chakra = Math.min(p.chakra, 65);
            ArcadeAudio.play('sword');
          }
        } else {
          this.performStormMeleeOrKunai(true);
        }
      } else if (actionKey === 'skill3') {
        // Skill 3 = Chakra Dash (10% Chakra)
        if (p.chakra >= 10) {
          p.chakra -= 10;
          p.dashTimer = 0.36;
          ArcadeAudio.play('dash');
        }
      } else if (actionKey === 'skill4') {
        // Skill 4 = Secret Technique (Ougi) or Linked Team Ultimate (45% Chakra)
        this.performStormUltimateOugi(p, e);
      } else if (actionKey === 'skill5') {
        // Skill 5 = True Awakening
        this.performStormAwakening(p);
      } else if (actionKey === 'sub') {
        // Substitution Log (Kawarimi)
        this.triggerSubstitutionKawarimi(p, e);
      } else if (actionKey === 'support') {
        // Call Support Assist 1 or 2
        if (this.stormSupportCds[0] <= 0) this.triggerStormSupport(1);
        else this.triggerStormSupport(2);
      }
    } else {
      const player = this.senkiFighters.find((f) => f.isPlayer);
      if (!player || !player.alive) return;

      if (actionKey === 'action' || actionKey === 'attack' || actionKey === 'fire') {
        if (player.attackCd <= 0) this.performSenkiBasicAttack(player);
      } else if (actionKey === 'jump' || actionKey === 'skill1') {
        this.castSenkiSkill(player, 0);
      } else if (actionKey === 'skill2') {
        this.castSenkiSkill(player, 1);
      } else if (actionKey === 'skill3') {
        this.castSenkiSkill(player, 2);
      } else if (actionKey === 'skill4') {
        this.castSenkiSkill(player, 3);
      } else if (actionKey === 'skill5') {
        this.castSenkiSkill(player, 4);
      } else if (actionKey === 'sub') {
        // Quick evade dash in Senki
        player.iFrameTimer = Math.max(player.iFrameTimer, 0.45);
        player.x = Math.max(120, Math.min(this.senkiLaneWidth - 120, player.x - player.facing * 95));
        ArcadeAudio.play('dash');
      } else if (actionKey === 'support') {
        this.buySenkiItem('ramen');
      }
    }
  }

  // ============================================================================
  // PART 1: 2D NARUTO SENKI INITIALIZATION & LOOP
  // ============================================================================
  private resizeSenkiCanvas(): void {
    const vp = typeof window !== 'undefined' ? getViewportSize() : { width: 800, height: 600 };
    this.senkiWidth = Math.max(240, vp.width);
    this.senkiHeight = Math.max(240, vp.height);
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    this.canvas.width = Math.floor(this.senkiWidth * dpr);
    this.canvas.height = Math.floor(this.senkiHeight * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const prevGroundY = this.senkiGroundY;
    const isCompactLandscape = this.senkiWidth > this.senkiHeight * 1.2 && this.senkiHeight <= 460;
    this.senkiGroundY = isCompactLandscape
      ? Math.round(this.senkiHeight * 0.72)
      : Math.max(270, Math.min(520, this.senkiHeight - 108));

    const dy = this.senkiGroundY - prevGroundY;
    if (dy !== 0) {
      for (const t of this.senkiTowers) t.y = this.senkiGroundY;
      for (const m of this.senkiMinions) m.y = this.senkiGroundY;
      for (const f of this.senkiFighters) f.y = this.senkiGroundY;
      for (const p of this.senkiProjectiles) p.y += dy;
      for (const ft of this.senkiFloatTexts) ft.y += dy;
    }
  }

  private initSenki2D(): void {
    this.senkiFighters = [];
    this.senkiMinions = [];
    this.senkiTowers = [];
    this.senkiProjectiles = [];
    this.senkiFloatTexts = [];
    this.senkiGold = 120;
    this.senkiGoldTick = 0;
    this.senkiRamenCds = [0, 0, 0];
    this.senkiKills = 0;
    this.senkiDeaths = 0;
    this.senkiTowersDestroyedCount = 0;
    this.resizeSenkiCanvas();

    const hpMult = this.modeDef.id === 'senki_4v4' ? 1.25 : 1.0;

    const towerSetup: Array<{
      id: string;
      team: 'konoha' | 'akatsuki';
      tier: 1 | 2 | 3;
      label: string;
      x: number;
      hp: number;
      atk: number;
    }> = [
      { id: 'k_base', team: 'konoha', tier: 3, label: 'Konoha Hokage Base', x: 240, hp: Math.round(6000 * hpMult), atk: 185 },
      { id: 'k_inner', team: 'konoha', tier: 2, label: 'Konoha Inner Tower', x: 580, hp: Math.round(4500 * hpMult), atk: 155 },
      { id: 'k_outer', team: 'konoha', tier: 1, label: 'Konoha Outer Tower', x: 920, hp: Math.round(3000 * hpMult), atk: 130 },
      { id: 'a_outer', team: 'akatsuki', tier: 1, label: 'Akatsuki Outer Tower', x: 1680, hp: Math.round(3000 * hpMult), atk: 130 },
      { id: 'a_inner', team: 'akatsuki', tier: 2, label: 'Akatsuki Inner Tower', x: 2020, hp: Math.round(4500 * hpMult), atk: 155 },
      { id: 'a_base', team: 'akatsuki', tier: 3, label: 'Akatsuki Main Crystal', x: 2360, hp: Math.round(6000 * hpMult), atk: 185 }
    ];

    for (const t of towerSetup) {
      this.senkiTowers.push({
        id: t.id,
        team: t.team,
        tier: t.tier,
        label: t.label,
        x: t.x,
        y: this.senkiGroundY,
        hp: t.hp,
        maxHp: t.hp,
        atk: t.atk,
        range: 270,
        fireCd: 0,
        targetUid: null
      });
    }

    const teamSize = this.modeDef.teamSize;
    const allyDefs: NarutoShinobiDef[] = [this.leadDef, this.support1Def, this.support2Def];
    if (teamSize >= 4) {
      const fourth =
        NARUTO_SHINOBI_ROSTER.find(
          (h) => h.id !== this.leadDef.id && h.id !== this.support1Def.id && h.id !== this.support2Def.id
        ) ?? NARUTO_SHINOBI_ROSTER[3];
      allyDefs.push(fourth);
    }

    allyDefs.slice(0, teamSize).forEach((def, idx) => {
      this.senkiFighters.push(this.createSenkiFighter(def, 'konoha', idx === 0, 320 + idx * 55));
    });

    const enemyPool = NARUTO_SHINOBI_ROSTER.filter(
      (h) =>
        h.id !== this.leadDef.id &&
        (h.faction === 'Akatsuki & Villains' ||
          h.faction === 'Boruto & Otsutsuki' ||
          h.faction === 'Five Kage & Legends')
    );
    for (let i = 0; i < teamSize; i++) {
      const def = enemyPool[(this.level + i * 5) % enemyPool.length] ?? NARUTO_SHINOBI_ROSTER[30 + i];
      this.senkiFighters.push(this.createSenkiFighter(def, 'akatsuki', false, 2280 - i * 55));
    }

    this.spawnSenkiMinionWave();
    this.senkiLastTs = performance.now();
    this.loopSenki2D();
  }

  private createSenkiFighter(
    def: NarutoShinobiDef,
    team: 'konoha' | 'akatsuki',
    isPlayer: boolean,
    x: number,
    isClone = false,
    ownerUid?: string
  ): SenkiFighter {
    const lv1 = computeSenkiLevelStats(def, 1);
    const cloneMult = isClone ? 0.42 : 1;
    return {
      uid: `${team}_${def.id}_${isClone ? 'clone_' : ''}${Math.random().toString(36).slice(2, 7)}`,
      team,
      isPlayer,
      isClone,
      ownerUid,
      cloneTtl: isClone ? 14 : 0,
      def,
      x,
      y: this.senkiGroundY,
      facing: team === 'konoha' ? 1 : -1,
      level: 1,
      xp: 0,
      xpNext: lv1.xpToNext,
      hp: Math.round(lv1.maxHp * cloneMult),
      maxHp: Math.round(lv1.maxHp * cloneMult),
      atk: Math.round(lv1.atk * cloneMult),
      speed: def.speed,
      alive: true,
      respawnTimer: 0,
      attackCd: 0,
      skillCds: [0, 0, 0, 0, 0],
      superArmorTimer: 0,
      iFrameTimer: 0,
      stunTimer: 0,
      awakenedTimer: 0,
      atkBuffTimer: 0,
      speedBuffTimer: 0,
      jashinTimer: 0,
      rebirthUsed: false,
      lastDamagedEnemyHeroTimer: 0,
      animPhase: Math.random() * Math.PI * 2
    };
  }

  private spawnSenkiMinionWave(): void {
    for (let i = 0; i < 3; i++) {
      this.senkiMinions.push({
        uid: `m_konoha_${Date.now()}_${i}`,
        team: 'konoha',
        x: 340 - i * 38,
        y: this.senkiGroundY,
        hp: 460,
        maxHp: 460,
        atk: 42,
        attackCd: 0,
        alive: true
      });
      this.senkiMinions.push({
        uid: `m_akatsuki_${Date.now()}_${i}`,
        team: 'akatsuki',
        x: 2260 + i * 38,
        y: this.senkiGroundY,
        hp: 460,
        maxHp: 460,
        atk: 42,
        attackCd: 0,
        alive: true
      });
    }
  }

  private loopSenki2D = (): void => {
    if (this.gameOver || !this.isRunning) return;
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0.008, (now - this.senkiLastTs) / 1000));
    this.senkiLastTs = now;

    if (!this.isPaused) {
      this.updateSenki2D(dt);
    }
    if (this.gameOver || !this.isRunning) return;
    this.renderSenki2D();
    this.senkiAnimFrame = requestAnimationFrame(this.loopSenki2D);
  };

  private grantSenkiXpAndGold(fighter: SenkiFighter, xpGain: number, goldGain: number): void {
    if (fighter.isClone) return;
    if (fighter.team === 'konoha' && goldGain > 0) {
      this.senkiGold += goldGain;
      if (fighter.isPlayer) {
        this.senkiFloatTexts.push({
          x: fighter.x,
          y: fighter.y - 78,
          text: `+${goldGain}G`,
          color: '#facc15',
          ttl: 1.1
        });
      }
    }
    if (fighter.level >= 6) return;
    fighter.xp += xpGain;
    while (fighter.level < 6 && fighter.xp >= fighter.xpNext) {
      fighter.xp -= fighter.xpNext;
      fighter.level += 1;
      const scaled = computeSenkiLevelStats(fighter.def, fighter.level);
      const hpDelta = scaled.maxHp - fighter.maxHp;
      fighter.maxHp = scaled.maxHp;
      fighter.hp = Math.min(fighter.maxHp, fighter.hp + hpDelta + Math.round(fighter.maxHp * 0.25));
      fighter.atk = scaled.atk;
      fighter.xpNext = scaled.xpToNext;
      if (fighter.isPlayer) {
        ArcadeAudio.play('levelup');
        const unlockNote =
          fighter.level === 4
            ? 'OUGI 1 UNLOCKED!'
            : fighter.level === 6
              ? 'OUGI 2 / AWAKENING UNLOCKED!'
              : `LEVEL ${fighter.level}!`;
        this.senkiFloatTexts.push({
          x: fighter.x,
          y: fighter.y - 95,
          text: unlockNote,
          color: '#38bdf8',
          ttl: 1.6
        });
      }
    }
  }

  buySenkiItem(itemId: 'ramen' | 'pill' | 'speed_tag'): boolean {
    if (this.uses3DViewport || this.gameOver) return false;
    const player = this.senkiFighters.find((f) => f.isPlayer);
    if (!player || !player.alive) return false;
    const idx = SENKI_RAMEN_ITEMS.findIndex((i) => i.id === itemId);
    if (idx < 0) return false;
    const item = SENKI_RAMEN_ITEMS[idx];
    if (this.senkiRamenCds[idx] > 0 || this.senkiGold < item.cost) return false;

    this.senkiGold -= item.cost;
    this.senkiRamenCds[idx] = item.cooldownSec;
    ArcadeAudio.play('coin');

    if (itemId === 'ramen') {
      const heal = Math.round(player.maxHp * 0.42);
      player.hp = Math.min(player.maxHp, player.hp + heal);
      this.senkiFloatTexts.push({
        x: player.x,
        y: player.y - 82,
        text: `🍜 +${heal} HP`,
        color: '#4ade80',
        ttl: 1.3
      });
    } else if (itemId === 'pill') {
      player.atkBuffTimer = item.durationSec;
      this.senkiFloatTexts.push({
        x: player.x,
        y: player.y - 82,
        text: '💊 +25% ATK (15s)',
        color: '#f97316',
        ttl: 1.3
      });
    } else if (itemId === 'speed_tag') {
      player.speedBuffTimer = item.durationSec;
      this.senkiFloatTexts.push({
        x: player.x,
        y: player.y - 82,
        text: '⚡ +30% SPD & 2x CD (12s)',
        color: '#38bdf8',
        ttl: 1.3
      });
    }
    return true;
  }

  private castSenkiSkill(fighter: SenkiFighter, slotIndex: 0 | 1 | 2 | 3 | 4): void {
    const skill: NarutoSkillDef = fighter.def.skills[slotIndex];
    if (!skill) return;
    if (fighter.level < skill.unlockLevel) return;
    if (fighter.skillCds[slotIndex] > 0) return;

    fighter.skillCds[slotIndex] = skill.cooldown;
    if (skill.grantsSuperArmor) {
      fighter.superArmorTimer = Math.max(fighter.superArmorTimer, slotIndex >= 3 ? 2.2 : 1.1);
    }
    if (skill.grantsIFrames) {
      fighter.iFrameTimer = Math.max(fighter.iFrameTimer, 0.95);
    }

    if (slotIndex >= 3) {
      if (slotIndex === 4) {
        fighter.awakenedTimer = 14.0;
        fighter.hp = Math.min(fighter.maxHp, fighter.hp + Math.round(fighter.maxHp * 0.22));
      }
      if (fighter.isPlayer) {
        ArcadeAudio.play('explosion');
        this.cutInBanner = {
          title: `${fighter.def.name.toUpperCase()} — ${skill.name.toUpperCase()}!`,
          subtitle: slotIndex === 4 ? `AWAKENING: ${fighter.def.awakeningName}` : 'SECRET TECHNIQUE (OUGI)',
          color: skill.color,
          timer: 1.9
        };
      }
    } else if (fighter.isPlayer) {
      ArcadeAudio.play('magic');
    }

    if (skill.spawnsClones && skill.spawnsClones > 0) {
      const existingClones = this.senkiFighters.filter((f) => f.isClone && f.ownerUid === fighter.uid && f.alive);
      const countToSpawn = Math.min(skill.spawnsClones, Math.max(0, 3 - existingClones.length));
      for (let i = 0; i < countToSpawn; i++) {
        const clone = this.createSenkiFighter(
          fighter.def,
          fighter.team,
          false,
          fighter.x + fighter.facing * (35 + i * 28),
          true,
          fighter.uid
        );
        clone.level = fighter.level;
        this.senkiFighters.push(clone);
      }
    }

    if (skill.healsAlliesPct) {
      for (const ally of this.senkiFighters) {
        if (ally.team === fighter.team && ally.alive && Math.abs(ally.x - fighter.x) <= skill.range + 120) {
          const heal = Math.round(ally.maxHp * skill.healsAlliesPct);
          ally.hp = Math.min(ally.maxHp, ally.hp + heal);
          this.senkiFloatTexts.push({
            x: ally.x,
            y: ally.y - 68,
            text: `+${heal} HP`,
            color: '#4ade80',
            ttl: 1.0
          });
        }
      }
    }
    if (fighter.def.passiveTrait === 'jashin_immortality' && slotIndex >= 2) {
      fighter.jashinTimer = 7.0;
    }

    if (skill.kind === 'dash' || skill.grantsIFrames) {
      fighter.x = Math.max(
        120,
        Math.min(this.senkiLaneWidth - 120, fighter.x + fighter.facing * Math.min(185, skill.range * 0.72))
      );
    }

    const synergyMult = fighter.team === 'konoha' ? 1 + this.teamSynergy.bonusPct / 100 : 1;
    const buffMult = (fighter.atkBuffTimer > 0 ? 1.25 : 1) * (fighter.awakenedTimer > 0 ? 1.32 : 1) * synergyMult;
    const totalDmg = Math.round((skill.damage + fighter.atk * 0.85) * buffMult);

    this.senkiProjectiles.push({
      x: fighter.x + fighter.facing * 34,
      y: fighter.y - 34,
      vx: fighter.facing * (skill.kind === 'projectile' ? 540 : 380),
      vy: 0,
      radius: slotIndex >= 3 ? 58 : 34,
      color: skill.color,
      team: fighter.team,
      dmg: totalDmg,
      hitsTowers: skill.hitsTowers,
      ttl: Math.max(0.32, skill.range / 440),
      stunSec: skill.stunSec ?? (slotIndex >= 3 ? 0.9 : 0.25)
    });
  }

  private dealSenkiDamageToFighter(
    target: SenkiFighter,
    rawDmg: number,
    attacker: SenkiFighter | null,
    stunSec = 0
  ): void {
    if (!target.alive || target.iFrameTimer > 0) return;

    let dmg = rawDmg;
    if (attacker) {
      if (attacker.def.passiveTrait === 'sharingan_crit' && target.hp / target.maxHp < 0.65) {
        dmg = Math.round(dmg * 1.22);
      }
      if (attacker.def.passiveTrait === 'berserk_low_hp' && attacker.hp / attacker.maxHp < 0.45) {
        dmg = Math.round(dmg * 1.28);
      }
      if (attacker.def.passiveTrait === 'shadow_clone_synergy') {
        const clones = this.senkiFighters.filter((c) => c.isClone && c.ownerUid === attacker.uid && c.alive).length;
        if (clones > 0) dmg = Math.round(dmg * (1 + clones * 0.12));
      }
      if (attacker.def.passiveTrait === 'samehada_lifesteal') {
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + Math.round(dmg * 0.18));
      }
      if (target.def.passiveTrait === 'bone_reflect' && Math.abs(attacker.x - target.x) < 110) {
        attacker.hp = Math.max(1, attacker.hp - Math.round(dmg * 0.2));
      }
      if (!target.isClone) {
        attacker.lastDamagedEnemyHeroTimer = 3.5;
      }
    }

    if (target.awakenedTimer > 0) {
      dmg = Math.round(dmg * 0.72);
    }

    target.hp -= dmg;
    if (stunSec > 0 && target.superArmorTimer <= 0) {
      target.stunTimer = Math.max(target.stunTimer, stunSec);
    }

    if (target.hp <= 0 && target.jashinTimer > 0) {
      target.hp = 1;
    }

    if (target.hp <= 0 && !target.isClone && target.def.passiveTrait === 'white_snake_rebirth' && !target.rebirthUsed) {
      target.rebirthUsed = true;
      target.hp = Math.round(target.maxHp * 0.35);
      target.iFrameTimer = 1.2;
      this.senkiFloatTexts.push({
        x: target.x,
        y: target.y - 84,
        text: '🐍 WHITE SNAKE REBIRTH!',
        color: '#a855f7',
        ttl: 1.5
      });
      return;
    }

    if (target.hp <= 0) {
      target.hp = 0;
      target.alive = false;
      target.respawnTimer = target.isClone ? 0 : 5 + target.level * 1.5;

      if (attacker && !target.isClone) {
        this.grantSenkiXpAndGold(attacker, 135, 220);
        if (attacker.team === 'konoha') {
          this.senkiKills += 1;
          playerState.narutoKillsTotal += 1;
        }
      }
      if (target.isPlayer) {
        this.senkiDeaths += 1;
      }
    }
  }

  private updateSenki2D(dt: number): void {
    if (this.cutInBanner) {
      this.cutInBanner.timer -= dt;
      if (this.cutInBanner.timer <= 0) this.cutInBanner = null;
    }

    this.senkiGoldTick += dt;
    if (this.senkiGoldTick >= 3.0) {
      this.senkiGoldTick -= 3.0;
      this.senkiGold += 10;
    }

    for (let i = 0; i < 3; i++) {
      this.senkiRamenCds[i] = Math.max(0, this.senkiRamenCds[i] - dt);
    }

    this.senkiWaveTimer -= dt;
    if (this.senkiWaveTimer <= 0) {
      this.senkiWaveTimer = 11.0;
      this.spawnSenkiMinionWave();
    }

    const inputDx =
      Math.abs(this.moveDx) > 0.08
        ? this.moveDx
        : (this.steerRightHeld ? 1 : 0) - (this.steerLeftHeld ? 1 : 0);

    for (const f of this.senkiFighters) {
      if (!f.alive) {
        if (!f.isClone) {
          f.respawnTimer -= dt;
          if (f.respawnTimer <= 0) {
            f.alive = true;
            f.hp = f.maxHp;
            f.rebirthUsed = false;
            f.x = f.team === 'konoha' ? 290 : this.senkiLaneWidth - 290;
            f.iFrameTimer = 1.5;
          }
        }
        continue;
      }

      if (f.isClone) {
        f.cloneTtl -= dt;
        if (f.cloneTtl <= 0) {
          f.alive = false;
          continue;
        }
      }

      if (f.def.passiveTrait === 'hashirama_regen') {
        f.hp = Math.min(f.maxHp, f.hp + f.maxHp * 0.022 * dt);
      }

      f.attackCd = Math.max(0, f.attackCd - dt);
      f.superArmorTimer = Math.max(0, f.superArmorTimer - dt);
      f.iFrameTimer = Math.max(0, f.iFrameTimer - dt);
      f.stunTimer = Math.max(0, f.stunTimer - dt);
      f.awakenedTimer = Math.max(0, f.awakenedTimer - dt);
      f.atkBuffTimer = Math.max(0, f.atkBuffTimer - dt);
      f.speedBuffTimer = Math.max(0, f.speedBuffTimer - dt);
      f.jashinTimer = Math.max(0, f.jashinTimer - dt);
      f.lastDamagedEnemyHeroTimer = Math.max(0, f.lastDamagedEnemyHeroTimer - dt);

      const cdRate = (f.speedBuffTimer > 0 ? 2.0 : 1.0) * (f.def.passiveTrait === 'byakugan_cd' ? 1.2 : 1.0);
      for (let s = 0; s < 5; s++) {
        f.skillCds[s] = Math.max(0, f.skillCds[s] - dt * cdRate);
      }

      if (f.stunTimer > 0) continue;

      const moveSpeed =
        f.speed *
        38 *
        (f.speedBuffTimer > 0 ? 1.3 : 1) *
        (f.awakenedTimer > 0 ? 1.2 : 1) *
        (f.def.passiveTrait === 'yellow_flash' ? 1.15 : 1);

      if (f.isPlayer) {
        if (Math.abs(inputDx) > 0.05) {
          f.x += inputDx * moveSpeed * dt;
          f.facing = inputDx >= 0 ? 1 : -1;
          f.animPhase += dt * 11;
        }
        f.x = Math.max(120, Math.min(this.senkiLaneWidth - 120, f.x));
      } else {
        this.updateSenkiAiFighter(f, moveSpeed, dt);
      }
    }

    // Update Minions
    for (const m of this.senkiMinions) {
      if (!m.alive) continue;
      m.attackCd = Math.max(0, m.attackCd - dt);
      const dir = m.team === 'konoha' ? 1 : -1;

      let closestDist = 9999;
      let targetFighter: SenkiFighter | null = null;
      let targetMinion: SenkiMinion | null = null;
      let targetTower: SenkiTower | null = null;

      for (const em of this.senkiMinions) {
        if (em.alive && em.team !== m.team) {
          const d = Math.abs(em.x - m.x);
          if (d < closestDist) {
            closestDist = d;
            targetMinion = em;
          }
        }
      }
      for (const ef of this.senkiFighters) {
        if (ef.alive && ef.team !== m.team) {
          const d = Math.abs(ef.x - m.x);
          if (d < closestDist) {
            closestDist = d;
            targetFighter = ef;
            targetMinion = null;
          }
        }
      }
      for (const et of this.senkiTowers) {
        if (et.hp > 0 && et.team !== m.team) {
          const d = Math.abs(et.x - m.x);
          if (d < closestDist) {
            closestDist = d;
            targetTower = et;
            targetFighter = null;
            targetMinion = null;
          }
        }
      }

      if (closestDist <= 62) {
        if (m.attackCd <= 0) {
          m.attackCd = 1.05;
          if (targetMinion) {
            targetMinion.hp -= m.atk;
            if (targetMinion.hp <= 0) targetMinion.alive = false;
          } else if (targetFighter) {
            this.dealSenkiDamageToFighter(targetFighter, m.atk, null, 0);
          } else if (targetTower) {
            targetTower.hp = Math.max(0, targetTower.hp - m.atk * 0.65);
          }
        }
      } else {
        m.x += dir * 92 * dt;
      }
    }

    // Update Towers with strict Senki Tower Aggro Priority
    for (const t of this.senkiTowers) {
      if (t.hp <= 0) {
        t.targetUid = null;
        continue;
      }
      t.fireCd = Math.max(0, t.fireCd - dt);

      const candidates: Array<{
        id: string;
        kind: 'minion' | 'clone' | 'hero';
        distance: number;
        damagedAlliedHeroRecently: boolean;
      }> = [];

      for (const m of this.senkiMinions) {
        if (m.alive && m.team !== t.team) {
          candidates.push({
            id: m.uid,
            kind: 'minion',
            distance: Math.abs(m.x - t.x),
            damagedAlliedHeroRecently: false
          });
        }
      }
      for (const f of this.senkiFighters) {
        if (f.alive && f.team !== t.team && f.iFrameTimer <= 0) {
          candidates.push({
            id: f.uid,
            kind: f.isClone ? 'clone' : 'hero',
            distance: Math.abs(f.x - t.x),
            damagedAlliedHeroRecently: f.lastDamagedEnemyHeroTimer > 0
          });
        }
      }

      t.targetUid = selectSenkiTowerTarget(candidates, t.range);
      if (t.targetUid && t.fireCd <= 0) {
        t.fireCd = 1.15;
        const hitMinion = this.senkiMinions.find((m) => m.uid === t.targetUid && m.alive);
        if (hitMinion) {
          hitMinion.hp -= t.atk;
          if (hitMinion.hp <= 0) hitMinion.alive = false;
        } else {
          const hitFighter = this.senkiFighters.find((f) => f.uid === t.targetUid && f.alive);
          if (hitFighter) {
            this.dealSenkiDamageToFighter(hitFighter, t.atk, null, 0);
          }
        }
      }
    }

    // Update Projectiles
    for (let i = this.senkiProjectiles.length - 1; i >= 0; i--) {
      const p = this.senkiProjectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.ttl -= dt;

      for (const m of this.senkiMinions) {
        if (m.alive && m.team !== p.team && Math.abs(m.x - p.x) <= p.radius + 20) {
          m.hp -= p.dmg;
          if (m.hp <= 0) {
            m.alive = false;
            const player = this.senkiFighters.find((f) => f.isPlayer);
            if (player && p.team === 'konoha') {
              this.grantSenkiXpAndGold(player, 36, 32);
            }
          }
        }
      }

      const owner = this.senkiFighters.find((f) => f.team === p.team && !f.isClone) ?? null;
      for (const f of this.senkiFighters) {
        if (f.alive && f.team !== p.team && Math.abs(f.x - p.x) <= p.radius + 26) {
          this.dealSenkiDamageToFighter(f, p.dmg * dt * 3.2, owner, p.stunSec);
        }
      }

      for (const t of this.senkiTowers) {
        if (t.hp > 0 && t.team !== p.team && Math.abs(t.x - p.x) <= p.radius + 36) {
          const towerDmg = p.hitsTowers ? p.dmg * dt * 2.1 : p.dmg * dt * 0.45;
          const prevHp = t.hp;
          t.hp = Math.max(0, t.hp - towerDmg);
          if (prevHp > 0 && t.hp <= 0 && p.team === 'konoha') {
            this.senkiTowersDestroyedCount += 1;
            playerState.narutoTowersDestroyed += 1;
            const player = this.senkiFighters.find((f) => f.isPlayer);
            if (player) this.grantSenkiXpAndGold(player, 180, 300);
          }
        }
      }

      if (p.ttl <= 0) {
        this.senkiProjectiles.splice(i, 1);
      }
    }

    this.senkiMinions = this.senkiMinions.filter((m) => m.alive);
    this.senkiFighters = this.senkiFighters.filter((f) => !f.isClone || f.alive);

    for (let i = this.senkiFloatTexts.length - 1; i >= 0; i--) {
      this.senkiFloatTexts[i].y -= 28 * dt;
      this.senkiFloatTexts[i].ttl -= dt;
      if (this.senkiFloatTexts[i].ttl <= 0) this.senkiFloatTexts.splice(i, 1);
    }

    const konohaBase = this.senkiTowers.find((t) => t.id === 'k_base');
    const akatsukiBase = this.senkiTowers.find((t) => t.id === 'a_base');
    if (akatsukiBase && akatsukiBase.hp <= 0) {
      this.finishMatch(true);
      return;
    }
    if (konohaBase && konohaBase.hp <= 0) {
      this.finishMatch(false);
      return;
    }

    const player = this.senkiFighters.find((f) => f.isPlayer);
    if (player) {
      const targetCamX = Math.max(
        0,
        Math.min(this.senkiLaneWidth - this.senkiWidth, player.x - this.senkiWidth * 0.42)
      );
      this.senkiCameraX += (targetCamX - this.senkiCameraX) * Math.min(1, dt * 8);

      this.score = this.senkiKills * 250 + this.senkiTowersDestroyedCount * 500 + this.senkiGold;
      this.lives = Math.max(0, Math.round(player.hp));
      this.maxLives = player.maxHp;
      updateInGameHud(this.score, player.level, this.gameIdx);
      updateHealthDisplay(this.lives, this.maxLives);

      const s1 = player.def.skills[0];
      const s2 = player.def.skills[1];
      const s3 = player.def.skills[2];
      const s4 = player.def.skills[3];
      const s5 = player.def.skills[4];

      updateNarutoHud({
        engine: 'senki_2d',
        modeName: this.modeDef.title,
        heroName: player.def.name,
        heroIcon: player.def.icon,
        traitName: player.def.passiveName,
        level: player.level,
        xpPct: Math.min(100, Math.round((player.xp / Math.max(1, player.xpNext)) * 100)),
        gold: this.senkiGold,
        awakenedSec: Number(player.awakenedTimer.toFixed(1)),
        superArmor: player.superArmorTimer > 0,
        iFrames: player.iFrameTimer > 0,
        ramenCd: Number(this.senkiRamenCds[0].toFixed(1)),
        pillCd: Number(this.senkiRamenCds[1].toFixed(1)),
        pillBuffSec: Number(player.atkBuffTimer.toFixed(1)),
        speedTagCd: Number(this.senkiRamenCds[2].toFixed(1)),
        speedTagBuffSec: Number(player.speedBuffTimer.toFixed(1)),
        teamHp: Math.round(player.hp),
        teamMaxHp: player.maxHp,
        enemyHp: Math.round(akatsukiBase?.hp ?? 0),
        enemyMaxHp: akatsukiBase?.maxHp ?? 6000,
        subLogs: 4,
        subRechargeSec: 0,
        chakra: 100,
        maxUsableChakra: 100,
        counterPenaltySec: 0,
        guardHp: 100,
        guardBrokenSec: 0,
        stormGauge: 0,
        comboHits: 0,
        prorationPct: 100,
        fatigueSec: 0,
        toolCharges: [0, 0, 0, 0],
        support1Name: this.support1Def.name,
        support1Icon: this.support1Def.icon,
        support1Cd: 0,
        support2Name: this.support2Def.name,
        support2Icon: this.support2Def.icon,
        support2Cd: 0,
        actionLabel: '⚔️ ATK',
        jumpSkill1: {
          label: s1.name.slice(0, 7),
          icon: '🌀',
          cd: Number(player.skillCds[0].toFixed(1)),
          maxCd: s1.cooldown,
          visible: true
        },
        skill2: {
          label: player.level >= 2 ? s2.name.slice(0, 7) : 'Lv.2',
          icon: '⚡',
          cd: Number(player.skillCds[1].toFixed(1)),
          maxCd: s2.cooldown,
          visible: true
        },
        skill3: {
          label: player.level >= 3 ? s3.name.slice(0, 7) : 'Lv.3',
          icon: '🔥',
          cd: Number(player.skillCds[2].toFixed(1)),
          maxCd: s3.cooldown,
          visible: true
        },
        skill4: {
          label: player.level >= 4 ? 'OUGI 1' : 'Lv.4',
          icon: '💥',
          cd: Number(player.skillCds[3].toFixed(1)),
          maxCd: s4.cooldown,
          visible: true
        },
        skill5: {
          label: player.level >= 6 ? 'OUGI 2' : 'Lv.6',
          icon: '🌟',
          cd: Number(player.skillCds[4].toFixed(1)),
          maxCd: s5.cooldown,
          visible: true,
          activeBuff: player.awakenedTimer > 0
        },
        subBtn: {
          label: 'EVADE',
          icon: '💨',
          cd: 0,
          maxCd: 1,
          visible: true
        },
        supportBtn: {
          label: 'RAMEN',
          icon: '🍜',
          cd: Number(this.senkiRamenCds[0].toFixed(1)),
          maxCd: 10,
          visible: true
        },
        chakraBtn: {
          label: 'PILL',
          icon: '💊',
          cd: Number(this.senkiRamenCds[1].toFixed(1)),
          maxCd: 20,
          visible: false
        },
        guardBtn: {
          label: 'TAG',
          icon: '⚡',
          cd: Number(this.senkiRamenCds[2].toFixed(1)),
          maxCd: 22,
          visible: false
        }
      });
    }
  }

  private performSenkiBasicAttack(f: SenkiFighter): void {
    f.attackCd = 0.42;
    const range = 92;
    const dmg = Math.round(f.atk * (f.atkBuffTimer > 0 ? 1.25 : 1) * (f.awakenedTimer > 0 ? 1.3 : 1));
    if (f.isPlayer) ArcadeAudio.play('punch');

    for (const m of this.senkiMinions) {
      if (
        m.alive &&
        m.team !== f.team &&
        Math.abs(m.x - f.x) <= range &&
        Math.sign(m.x - f.x || f.facing) === f.facing
      ) {
        m.hp -= dmg;
        if (m.hp <= 0) {
          m.alive = false;
          this.grantSenkiXpAndGold(f, 38, 35);
        }
      }
    }
    for (const ef of this.senkiFighters) {
      if (ef.alive && ef.team !== f.team && Math.abs(ef.x - f.x) <= range) {
        this.dealSenkiDamageToFighter(ef, dmg, f, 0.12);
      }
    }
    for (const t of this.senkiTowers) {
      if (t.hp > 0 && t.team !== f.team && Math.abs(t.x - f.x) <= range + 24) {
        const prev = t.hp;
        t.hp = Math.max(0, t.hp - dmg * 0.9);
        if (prev > 0 && t.hp <= 0 && f.team === 'konoha') {
          this.senkiTowersDestroyedCount += 1;
          playerState.narutoTowersDestroyed += 1;
          this.grantSenkiXpAndGold(f, 180, 300);
        }
      }
    }
  }

  private updateSenkiAiFighter(f: SenkiFighter, moveSpeed: number, dt: number): void {
    let targetX = f.team === 'konoha' ? this.senkiLaneWidth - 240 : 240;
    let closestDist = 9999;
    let enemyHeroDist = 9999;

    for (const ef of this.senkiFighters) {
      if (ef.alive && ef.team !== f.team) {
        const d = Math.abs(ef.x - f.x);
        if (d < closestDist) {
          closestDist = d;
          targetX = ef.x;
        }
        if (d < enemyHeroDist) enemyHeroDist = d;
      }
    }
    for (const em of this.senkiMinions) {
      if (em.alive && em.team !== f.team) {
        const d = Math.abs(em.x - f.x);
        if (d < closestDist) {
          closestDist = d;
          targetX = em.x;
        }
      }
    }
    for (const et of this.senkiTowers) {
      if (et.hp > 0 && et.team !== f.team) {
        const d = Math.abs(et.x - f.x);
        if (d < closestDist) {
          closestDist = d;
          targetX = et.x;
        }
      }
    }

    f.facing = targetX >= f.x ? 1 : -1;

    if (!f.isClone && Math.random() < dt * 0.45) {
      this.grantSenkiXpAndGold(f, 22, 0);
    }

    if (closestDist > 82) {
      f.x += f.facing * moveSpeed * 0.78 * dt;
      f.animPhase += dt * 9;
    } else {
      if (f.attackCd <= 0) {
        this.performSenkiBasicAttack(f);
      }
      if (!f.isClone && enemyHeroDist < 260) {
        for (let s = 4; s >= 0; s--) {
          const sk = f.def.skills[s];
          if (sk && f.level >= sk.unlockLevel && f.skillCds[s] <= 0 && Math.random() < 0.35) {
            this.castSenkiSkill(f, s as 0 | 1 | 2 | 3 | 4);
            break;
          }
        }
      }
    }
    f.x = Math.max(120, Math.min(this.senkiLaneWidth - 120, f.x));
  }

  private renderSenki2D(): void {
    const { ctx } = this;
    const w = this.senkiWidth;
    const h = this.senkiHeight;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, `#${this.stageDef.skyColor.toString(16).padStart(6, '0')}`);
    grad.addColorStop(1, `#${this.stageDef.groundColor.toString(16).padStart(6, '0')}`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(-this.senkiCameraX, 0);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    for (let i = 0; i < 14; i++) {
      const mx = i * 210;
      const mh = 110 + (i % 4) * 35;
      ctx.beginPath();
      ctx.moveTo(mx, this.senkiGroundY);
      ctx.lineTo(mx + 105, this.senkiGroundY - mh);
      ctx.lineTo(mx + 210, this.senkiGroundY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, this.senkiGroundY, this.senkiLaneWidth, h - this.senkiGroundY);
    ctx.fillStyle = `#${this.stageDef.accentColor.toString(16).padStart(6, '0')}`;
    ctx.fillRect(0, this.senkiGroundY, this.senkiLaneWidth, 4);

    for (const t of this.senkiTowers) {
      if (t.hp <= 0) continue;
      const isKonoha = t.team === 'konoha';
      const towerH = t.tier === 3 ? 138 : t.tier === 2 ? 112 : 95;
      const towerW = t.tier === 3 ? 58 : 44;

      ctx.fillStyle = isKonoha ? '#1d4ed8' : '#b91c1c';
      ctx.fillRect(t.x - towerW / 2, this.senkiGroundY - towerH, towerW, towerH);
      ctx.strokeStyle = isKonoha ? '#60a5fa' : '#f87171';
      ctx.lineWidth = 2;
      ctx.strokeRect(t.x - towerW / 2, this.senkiGroundY - towerH, towerW, towerH);

      ctx.fillStyle = isKonoha ? '#38bdf8' : '#ef4444';
      ctx.beginPath();
      ctx.arc(t.x, this.senkiGroundY - towerH - 12, 12, 0, Math.PI * 2);
      ctx.fill();

      const hpPct = Math.max(0, t.hp / t.maxHp);
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(t.x - 38, this.senkiGroundY - towerH - 36, 76, 8);
      ctx.fillStyle = isKonoha ? '#22c55e' : '#ef4444';
      ctx.fillRect(t.x - 38, this.senkiGroundY - towerH - 36, 76 * hpPct, 8);

      if (t.targetUid) {
        const tf = this.senkiFighters.find((f) => f.uid === t.targetUid && f.alive);
        const tm = this.senkiMinions.find((m) => m.uid === t.targetUid && m.alive);
        const tx = tf ? tf.x : tm ? tm.x : null;
        const ty = tf ? this.senkiGroundY - 35 : tm ? this.senkiGroundY - 20 : null;
        if (tx !== null && ty !== null) {
          ctx.strokeStyle = tf && !tf.isClone ? 'rgba(239, 68, 68, 0.92)' : 'rgba(250, 204, 21, 0.55)';
          ctx.lineWidth = tf && !tf.isClone ? 2.5 : 1.5;
          ctx.beginPath();
          ctx.moveTo(t.x, this.senkiGroundY - towerH - 12);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        }
      }
    }

    for (const m of this.senkiMinions) {
      if (!m.alive) continue;
      ctx.fillStyle = m.team === 'konoha' ? '#2563eb' : '#dc2626';
      ctx.fillRect(m.x - 10, this.senkiGroundY - 32, 20, 32);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(m.x - 10, this.senkiGroundY - 28, 20, 4);
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(m.x - 14, this.senkiGroundY - 42, 28, 4);
      ctx.fillStyle = m.team === 'konoha' ? '#4ade80' : '#f87171';
      ctx.fillRect(m.x - 14, this.senkiGroundY - 42, 28 * (m.hp / m.maxHp), 4);
    }

    for (const f of this.senkiFighters) {
      if (!f.alive) continue;
      const fy = this.senkiGroundY;
      const primaryHex = `#${f.def.primaryColor.toString(16).padStart(6, '0')}`;
      const accentHex = `#${f.def.accentColor.toString(16).padStart(6, '0')}`;
      const hairHex = `#${f.def.hairColor.toString(16).padStart(6, '0')}`;
      const chakraHex = `#${f.def.chakraColor.toString(16).padStart(6, '0')}`;

      ctx.save();
      if (f.iFrameTimer > 0) ctx.globalAlpha = 0.55;
      else if (f.isClone) ctx.globalAlpha = 0.78;

      if (f.awakenedTimer > 0 || f.superArmorTimer > 0) {
        ctx.strokeStyle = f.awakenedTimer > 0 ? chakraHex : '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(f.x, fy - 28, 30, 0, Math.PI * 2);
        ctx.stroke();
      }

      const stride = Math.sin(f.animPhase) * 6;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(f.x - 8 + stride * 0.5, fy - 18, 6, 18);
      ctx.fillRect(f.x + 2 - stride * 0.5, fy - 18, 6, 18);

      ctx.fillStyle = primaryHex;
      ctx.fillRect(f.x - 13, fy - 44, 26, 26);
      ctx.fillStyle = accentHex;
      ctx.fillRect(f.x - 11, fy - 42, 22, 14);

      ctx.fillStyle = '#fde68a';
      ctx.fillRect(f.x - 10, fy - 60, 20, 16);
      ctx.fillStyle = '#334155';
      ctx.fillRect(f.x - 11, fy - 57, 22, 4);
      ctx.fillStyle = hairHex;
      ctx.beginPath();
      ctx.moveTo(f.x - 13, fy - 58);
      ctx.lineTo(f.x - 6, fy - 69);
      ctx.lineTo(f.x + 1, fy - 61);
      ctx.lineTo(f.x + 8, fy - 70);
      ctx.lineTo(f.x + 13, fy - 58);
      ctx.closePath();
      ctx.fill();

      const barW = f.isClone ? 38 : 56;
      const barY = fy - 80;
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(f.x - barW / 2, barY, barW, 7);
      ctx.fillStyle = f.team === 'konoha' ? (f.isPlayer ? '#38bdf8' : '#22c55e') : '#ef4444';
      ctx.fillRect(f.x - barW / 2, barY, barW * Math.max(0, f.hp / f.maxHp), 7);

      if (!f.isClone) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Lv.${f.level} ${f.def.name.split(' ')[0]}`, f.x, barY - 4);
      }
      ctx.restore();
    }

    for (const p of this.senkiProjectiles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    for (const ft of this.senkiFloatTexts) {
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    ctx.restore();

    // Top Single-Lane Minimap Radar (clears health bar & Ramen strip on all viewports)
    const mapW = Math.min(300, w * 0.46);
    const mapH = 20;
    const mapX = (w - mapW) / 2;
    const mapY = w < 560 ? 124 : 46;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(mapX, mapY, mapW, mapH);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.strokeRect(mapX, mapY, mapW, mapH);

    for (const t of this.senkiTowers) {
      if (t.hp <= 0) continue;
      const mx = mapX + (t.x / this.senkiLaneWidth) * mapW;
      ctx.fillStyle = t.team === 'konoha' ? '#38bdf8' : '#ef4444';
      ctx.fillRect(mx - 3, mapY + 3, 6, mapH - 6);
    }
    for (const f of this.senkiFighters) {
      if (!f.alive || f.isClone) continue;
      const mx = mapX + (f.x / this.senkiLaneWidth) * mapW;
      ctx.fillStyle = f.isPlayer ? '#facc15' : f.team === 'konoha' ? '#4ade80' : '#f87171';
      ctx.beginPath();
      ctx.arc(mx, mapY + mapH / 2, f.isPlayer ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.cutInBanner) {
      const bannerY = h < 460 ? h * 0.34 : h * 0.25;
      ctx.fillStyle = 'rgba(9, 13, 22, 0.86)';
      ctx.fillRect(0, bannerY, w, 54);
      ctx.strokeStyle = this.cutInBanner.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, bannerY, w, 54);
      ctx.fillStyle = '#ffffff';
      ctx.font = w < 460 ? 'bold 13px sans-serif' : 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.cutInBanner.title, w / 2, bannerY + 23);
      ctx.fillStyle = this.cutInBanner.color;
      ctx.font = 'bold 11.5px sans-serif';
      ctx.fillText(this.cutInBanner.subtitle, w / 2, bannerY + 42);
    }
  }

  // ============================================================================
  // PART 2: 3D ULTIMATE NINJA STORM INITIALIZATION & LOOP
  // ============================================================================
  private initStorm3D(): void {
    this.three = new StudioThreeContext(this.threeContainer, {
      skyColor: this.stageDef.skyColor,
      fogColor: this.stageDef.fogColor,
      fogNear: 24,
      fogFar: 110,
      keyColor: 0xfff3d6,
      keyIntensity: 2.0,
      hemiSky: this.stageDef.accentColor,
      hemiGround: this.stageDef.groundColor,
      hemiIntensity: 0.85,
      shadowExtent: 34,
      fov: 50,
      withOverlayCanvas: true
    });

    this.stormArenaGroup = new THREE.Group();
    this.three.scene.add(this.stormArenaGroup);
    this.buildStormArenaEnvironment(this.stageDef);

    this.stormPlayerTeam = [];
    this.stormEnemyTeam = [];
    this.stormActivePlayerSlot = 0;
    this.stormActiveEnemySlot = 0;
    this.stormSupportCds = [0, 0];
    this.stormGauge = 0;
    this.stormToolUses = [2, 2, 3, 2];
    this.stormToolCds = [0, 0, 0, 0];
    this.stormProjectiles = [];
    this.stormLogs = [];

    const isTeamMode = this.modeDef.id === 'storm_3v3';
    const playerRoster = isTeamMode ? [this.leadDef, this.support1Def, this.support2Def] : [this.leadDef];
    const playerSupportTypes: StormSupportType[] = ['attack', this.support1Type, this.support2Type];

    playerRoster.forEach((def, idx) => {
      const c = this.createStormCombatant(def, 'player', idx, playerSupportTypes[idx] ?? 'attack', -8, 0);
      c.rig.group.visible = idx === 0;
      this.three!.scene.add(c.rig.group);
      this.stormPlayerTeam.push(c);
    });

    const enemyPool = NARUTO_SHINOBI_ROSTER.filter((h) => h.id !== this.leadDef.id);
    const enemyLead = enemyPool[(this.level * 3 + 7) % enemyPool.length] ?? NARUTO_SHINOBI_ROSTER[1];
    const enemySup1 = enemyPool[(this.level * 3 + 15) % enemyPool.length] ?? NARUTO_SHINOBI_ROSTER[30];
    const enemySup2 = enemyPool[(this.level * 3 + 23) % enemyPool.length] ?? NARUTO_SHINOBI_ROSTER[31];
    const enemyRoster = isTeamMode ? [enemyLead, enemySup1, enemySup2] : [enemyLead];

    enemyRoster.forEach((def, idx) => {
      const c = this.createStormCombatant(def, 'enemy', idx, idx === 1 ? 'attack' : 'cover_fire', 8, 0);
      c.rig.group.visible = idx === 0;
      this.three!.scene.add(c.rig.group);
      this.stormEnemyTeam.push(c);
    });

    this.three.prewarm();
    this.stormLastTs = performance.now();
    this.loopStorm3D();
  }

  private buildStormArenaEnvironment(stage: NarutoStageDef): void {
    if (!this.three) return;
    while (this.stormArenaGroup.children.length > 0) {
      const child = this.stormArenaGroup.children[0];
      child.traverse((obj) => {
        const m = obj as THREE.Mesh;
        if (m.geometry && !m.geometry.userData?.noDispose) m.geometry.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        for (const mat of mats) {
          if (mat && !mat.userData?.noDispose) mat.dispose();
        }
      });
      this.stormArenaGroup.remove(child);
    }
    this.three.scene.background = new THREE.Color(stage.skyColor);
    this.three.scene.fog = new THREE.Fog(stage.fogColor, 24, 110);

    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(22, 23.5, 1.2, 48),
      new THREE.MeshStandardMaterial({
        color: stage.groundColor,
        roughness: 0.72,
        metalness: 0.15
      })
    );
    floor.position.y = -0.6;
    floor.receiveShadow = true;
    this.stormArenaGroup.add(floor);

    const ringOuter = new THREE.Mesh(
      new THREE.RingGeometry(20.6, 21.3, 48),
      new THREE.MeshBasicMaterial({ color: stage.accentColor, side: THREE.DoubleSide })
    );
    ringOuter.rotation.x = -Math.PI / 2;
    ringOuter.position.y = 0.02;
    this.stormArenaGroup.add(ringOuter);

    const pillarMat = new THREE.MeshStandardMaterial({
      color: stage.accentColor,
      roughness: 0.6,
      metalness: 0.25
    });
    for (let i = 0; i < 12; i++) {
      const ang = (i * Math.PI * 2) / 12;
      const h = 4.5 + (i % 3) * 2.2;
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(2.2, h, 2.2), pillarMat);
      pillar.position.set(Math.cos(ang) * 23.5, h / 2, Math.sin(ang) * 23.5);
      pillar.lookAt(0, h / 2, 0);
      this.stormArenaGroup.add(pillar);
    }
  }

  private createStormCombatant(
    def: NarutoShinobiDef,
    team: 'player' | 'enemy',
    slotIndex: number,
    supportType: StormSupportType,
    x: number,
    z: number
  ): StormCombatant {
    const rig = buildShinobiMesh(def, 1.18, false);
    rig.group.position.set(x, 0, z);
    const facingAngle = team === 'player' ? Math.PI / 2 : -Math.PI / 2;
    rig.group.rotation.y = facingAngle;

    return {
      team,
      slotIndex,
      def,
      supportType,
      rig,
      x,
      z,
      y: 0,
      facingAngle,
      hp: 2000,
      maxHp: 2000,
      chakra: 100,
      chakraLockedTimer: 0,
      chakraFatigueTimer: 0,
      subLogs: 4,
      subCooldownTimer: 0,
      guardHp: 100,
      isGuarding: false,
      guardBreakTimer: 0,
      hitstunTimer: 0,
      iFrameTimer: 0,
      superArmorTimer: 0,
      dashTimer: 0,
      comboCount: 0,
      comboResetTimer: 0,
      awakened: false,
      awakeningTimer: 0,
      atkBuffTimer: 0,
      defBuffTimer: 0,
      speedBuffTimer: 0,
      exhaustDebuffTimer: 0,
      attackCooldown: 0,
      jutsuCooldown: 0,
      counterStartupTimer: 0
    };
  }

  useStormNinjaTool(slotIndex: 0 | 1 | 2 | 3): boolean {
    if (!this.uses3DViewport || this.gameOver) return false;
    const p = this.stormPlayerTeam[this.stormActivePlayerSlot];
    const e = this.stormEnemyTeam[this.stormActiveEnemySlot];
    if (!p || !e) return false;
    if (this.stormToolUses[slotIndex] <= 0 || this.stormToolCds[slotIndex] > 0) return false;

    this.stormToolUses[slotIndex] -= 1;
    this.stormToolCds[slotIndex] = 6.0;
    ArcadeAudio.play('coin');

    if (slotIndex === 0) {
      p.atkBuffTimer = 12.0;
    } else if (slotIndex === 1) {
      p.defBuffTimer = 12.0;
      p.guardHp = Math.min(100, p.guardHp + 45);
    } else if (slotIndex === 2) {
      this.spawnStormProjectile(p, e, 165, 0xf97316, true, false);
    } else if (slotIndex === 3) {
      p.speedBuffTimer = 10.0;
      e.exhaustDebuffTimer = 8.0;
    }
    return true;
  }

  switchStormLeader(): void {
    if (!this.uses3DViewport || this.gameOver) return;
    if (this.stormPlayerTeam.length <= 1) return;
    const prev = this.stormPlayerTeam[this.stormActivePlayerSlot];
    const nextSlot = (this.stormActivePlayerSlot + 1) % this.stormPlayerTeam.length;
    const next = this.stormPlayerTeam[nextSlot];
    if (!prev || !next) return;

    next.hp = prev.hp;
    next.subLogs = prev.subLogs;
    next.subCooldownTimer = prev.subCooldownTimer;
    next.x = prev.x;
    next.z = prev.z;
    next.y = prev.y;
    next.chakra = Math.max(40, prev.chakra);

    prev.rig.group.visible = false;
    next.rig.group.visible = true;
    next.rig.group.position.set(next.x, next.y, next.z);
    this.stormActivePlayerSlot = nextSlot;
    this.stormGauge = Math.min(100, this.stormGauge + 14);
    ArcadeAudio.play('dash');
  }

  private performStormMeleeOrKunai(isKunai: boolean): void {
    const p = this.stormPlayerTeam[this.stormActivePlayerSlot];
    const e = this.stormEnemyTeam[this.stormActiveEnemySlot];
    if (!p || !e || p.hitstunTimer > 0 || p.guardBreakTimer > 0 || p.attackCooldown > 0) return;

    const dist = Math.hypot(e.x - p.x, e.z - p.z);
    if (isKunai) {
      p.attackCooldown = 0.3;
      const chakraEnhanced = this.chakraChargeHeld && p.chakra >= 5;
      if (chakraEnhanced) p.chakra -= 5;
      ArcadeAudio.play('arrow');
      this.spawnStormProjectile(p, e, chakraEnhanced ? 95 : 55, p.def.chakraColor, chakraEnhanced, false);
      if (this.stormGauge >= 50 && (this.support1Type === 'cover_fire' || this.support2Type === 'cover_fire')) {
        this.spawnStormProjectile(p, e, 48, this.support1Def.chakraColor, true, false);
      }
      return;
    }

    p.attackCooldown = 0.26;
    p.rig.armR.rotation.x = -1.2;
    ArcadeAudio.play('punch');
    if (dist <= (p.awakened ? 4.4 : 3.2)) {
      this.dealStormDamage(p, e, p.def.baseAtk * 0.72, 18, false);
      if (this.stormGauge >= 50 && (this.support1Type === 'attack' || this.support2Type === 'attack')) {
        this.dealStormDamage(p, e, 36, 8, false);
      }
    } else {
      p.x += Math.sin(p.facingAngle) * 1.15;
      p.z += Math.cos(p.facingAngle) * 1.15;
    }
  }

  private performStormNinjutsu(p: StormCombatant, e: StormCombatant): void {
    if (p.jutsuCooldown > 0 || p.chakra < 22 || p.hitstunTimer > 0 || p.guardBreakTimer > 0) return;
    p.chakra -= 22;
    p.jutsuCooldown = 1.4;
    const jutsuSkill = p.def.skills[0];
    ArcadeAudio.play('magic');
    const dist = Math.hypot(e.x - p.x, e.z - p.z);
    if (dist <= 4.2) {
      this.dealStormDamage(p, e, jutsuSkill.damage * 0.78, 34, false);
    } else {
      this.spawnStormProjectile(p, e, jutsuSkill.damage * 0.75, p.def.chakraColor, true, false);
    }
  }

  private performStormUltimateOugi(p: StormCombatant, e: StormCombatant): void {
    if (p.jutsuCooldown > 0 || p.chakra < 45 || p.hitstunTimer > 0 || p.guardBreakTimer > 0) return;
    p.chakra -= 45;
    p.jutsuCooldown = 2.4;
    p.superArmorTimer = 1.6;
    const isTeamLinked = this.stormGauge >= 100 && this.stormPlayerTeam.length > 1;
    if (isTeamLinked) this.stormGauge = 0;

    const ougiSkill = p.def.skills[3];
    const ultDmg = isTeamLinked ? 460 : 340;
    ArcadeAudio.play('explosion');
    this.cutInBanner = {
      title: isTeamLinked
        ? `LINKED SECRET TECHNIQUE: ${this.teamSynergy.name.toUpperCase()}!`
        : `SECRET TECHNIQUE: ${ougiSkill.name.toUpperCase()}!`,
      subtitle: isTeamLinked
        ? `${this.leadDef.name} • ${this.support1Def.name} • ${this.support2Def.name}`
        : p.def.name,
      color: ougiSkill.color,
      timer: 2.1
    };

    const dist = Math.hypot(e.x - p.x, e.z - p.z);
    if (dist <= 6.5) {
      this.dealStormDamage(p, e, ultDmg, 100, true);
    } else {
      this.spawnStormProjectile(p, e, ultDmg, p.def.chakraColor, true, true);
    }
  }

  private performStormAwakening(p: StormCombatant): void {
    const canAwaken = !p.awakened && p.chakraFatigueTimer <= 0 && (p.hp <= p.maxHp * 0.45 || p.chakra >= 90);
    if (!canAwaken) return;
    p.awakened = true;
    p.awakeningTimer = 16.0;
    p.superArmorTimer = 16.0;
    p.rig.awakeningAura.visible = true;
    p.rig.group.scale.setScalar(1.18 * 1.42);
    ArcadeAudio.play('levelup');
    this.cutInBanner = {
      title: `TRUE AWAKENING: ${p.def.awakeningName.toUpperCase()}!`,
      subtitle: `${p.def.name} unleashes full Chakra power!`,
      color: `#${p.def.chakraColor.toString(16).padStart(6, '0')}`,
      timer: 2.2
    };

    if (p.def.passiveTrait === 'amenominaka_dimension') {
      this.stormAmenominakaIndex = (this.stormAmenominakaIndex + 1) % NARUTO_STAGES.length;
      this.buildStormArenaEnvironment(NARUTO_STAGES[this.stormAmenominakaIndex]);
    }
  }

  private triggerSubstitutionKawarimi(victim: StormCombatant, attacker: StormCombatant): void {
    if (victim.subLogs <= 0 || victim.guardBreakTimer > 0) return;
    const stepped = stepSubstitutionGauge(victim.subLogs, victim.subCooldownTimer, 0, true);
    victim.subLogs = stepped.logs;
    victim.subCooldownTimer = stepped.timerSec; // Resets to 0.0s (full 14.0s wait)

    if (this.three) {
      const logGroup = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 1.25, 10),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 })
      );
      trunk.rotation.z = 0.4;
      trunk.position.y = 0.7;
      logGroup.add(trunk);
      logGroup.position.set(victim.x, victim.y, victim.z);
      this.three.scene.add(logGroup);
      this.stormLogs.push({ mesh: logGroup, x: victim.x, y: victim.y, z: victim.z, ttl: 1.8 });
    }

    const behindX = attacker.x - Math.sin(attacker.facingAngle) * 2.6;
    const behindZ = attacker.z - Math.cos(attacker.facingAngle) * 2.6;
    const clampedR = Math.hypot(behindX, behindZ);
    if (clampedR > 19.5) {
      victim.x = (behindX / clampedR) * 19.5;
      victim.z = (behindZ / clampedR) * 19.5;
    } else {
      victim.x = behindX;
      victim.z = behindZ;
    }
    victim.hitstunTimer = 0;
    victim.iFrameTimer = 0.28;
    attacker.comboCount = 0;
    ArcadeAudio.play('dash');
  }

  triggerStormSupport(slotOffset: 1 | 2): void {
    if (this.stormPlayerTeam.length <= slotOffset) return;
    const cdIdx = (slotOffset - 1) as 0 | 1;
    if (this.stormSupportCds[cdIdx] > 0) return;

    const lead = this.stormPlayerTeam[this.stormActivePlayerSlot];
    const sup = this.stormPlayerTeam[(this.stormActivePlayerSlot + slotOffset) % this.stormPlayerTeam.length];
    const enemy = this.stormEnemyTeam[this.stormActiveEnemySlot];
    if (!lead || !sup || !enemy) return;

    this.stormSupportCds[cdIdx] = 9.5;
    this.stormGauge = Math.min(100, this.stormGauge + 18);
    ArcadeAudio.play('magic');
    this.spawnStormProjectile(lead, enemy, 155, sup.def.chakraColor, true, false);
  }

  private spawnStormProjectile(
    caster: StormCombatant,
    target: StormCombatant,
    dmg: number,
    colorHex: number,
    isChakraEnhanced: boolean,
    isUltimate: boolean
  ): void {
    if (!this.three) return;
    const radius = isUltimate ? 1.15 : isChakraEnhanced ? 0.55 : 0.28;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 14, 14),
      new THREE.MeshBasicMaterial({ color: colorHex })
    );
    const sx = caster.x + Math.sin(caster.facingAngle) * 1.2;
    const sz = caster.z + Math.cos(caster.facingAngle) * 1.2;
    const sy = 1.15;
    mesh.position.set(sx, sy, sz);
    this.three.scene.add(mesh);

    const dx = target.x - sx;
    const dz = target.z - sz;
    const dist = Math.max(0.1, Math.hypot(dx, dz));
    const speed = isUltimate ? 28 : isChakraEnhanced ? 24 : 20;

    this.stormProjectiles.push({
      mesh,
      team: caster.team,
      x: sx,
      y: sy,
      z: sz,
      vx: (dx / dist) * speed,
      vy: 0,
      vz: (dz / dist) * speed,
      radius,
      dmg,
      isChakraEnhanced,
      isUltimate,
      ttl: 1.8
    });
  }

  private dealStormDamage(
    attacker: StormCombatant,
    defender: StormCombatant,
    baseDmg: number,
    guardDmg: number,
    isUltimate = false
  ): void {
    if (defender.iFrameTimer > 0) return;

    if (defender.counterStartupTimer > 0 && !isUltimate) {
      defender.counterStartupTimer = 0;
      attacker.hitstunTimer = 1.8;
      attacker.chakraLockedTimer = 16.0;
      attacker.chakra = Math.min(attacker.chakra, 65);
      ArcadeAudio.play('explosion');
      return;
    }

    if (defender.isGuarding && defender.guardBreakTimer <= 0 && !isUltimate) {
      const supportGuardBonus =
        defender.team === 'player' &&
        this.stormGauge >= 50 &&
        (this.support1Type === 'guard' || this.support2Type === 'guard')
          ? 0.6
          : 1.0;
      defender.guardHp -= guardDmg * supportGuardBonus;
      if (defender.guardHp <= 0) {
        defender.guardHp = 0;
        defender.isGuarding = false;
        defender.guardBreakTimer = 2.5;
        ArcadeAudio.play('break');
      } else {
        ArcadeAudio.play('hit');
      }
      return;
    }

    attacker.comboCount += 1;
    attacker.comboResetTimer = 1.85;
    const proration = isUltimate ? 1.0 : computeStormComboProration(attacker.comboCount);

    const atkMult =
      (attacker.awakened ? 1.38 : 1.0) *
      (attacker.atkBuffTimer > 0 ? 1.25 : 1.0) *
      (attacker.team === 'player' ? 1 + this.teamSynergy.bonusPct / 100 : 1.0);
    const defMult = defender.defBuffTimer > 0 ? 0.72 : 1.0;
    const finalDmg = Math.max(8, Math.round(baseDmg * proration * atkMult * defMult));

    const teamList = defender.team === 'player' ? this.stormPlayerTeam : this.stormEnemyTeam;
    for (const member of teamList) {
      member.hp = Math.max(0, member.hp - finalDmg);
    }

    if (defender.superArmorTimer <= 0 && !defender.awakened) {
      defender.hitstunTimer = isUltimate ? 1.15 : 0.48;
    }

    if (attacker.team === 'player') {
      this.stormGauge = Math.min(100, this.stormGauge + (isUltimate ? 20 : 6));
    }
  }

  private loopStorm3D = (): void => {
    if (this.gameOver || !this.isRunning || !this.three || this.three.disposed) return;
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0.008, (now - this.stormLastTs) / 1000));
    this.stormLastTs = now;

    if (!this.isPaused) {
      this.updateStorm3D(dt);
    }
    if (this.gameOver || !this.isRunning || !this.three || this.three.disposed) return;
    this.three.render();
    this.three.scheduleNextFrame(this.loopStorm3D);
  };

  private updateStorm3D(dt: number): void {
    const p = this.stormPlayerTeam[this.stormActivePlayerSlot];
    const e = this.stormEnemyTeam[this.stormActiveEnemySlot];
    if (!p || !e) return;

    if (this.cutInBanner) {
      this.cutInBanner.timer -= dt;
      if (this.cutInBanner.timer <= 0) this.cutInBanner = null;
    }

    const pSub = stepSubstitutionGauge(p.subLogs, p.subCooldownTimer, dt, false);
    p.subLogs = pSub.logs;
    p.subCooldownTimer = pSub.timerSec;
    for (const m of this.stormPlayerTeam) {
      m.subLogs = p.subLogs;
      m.subCooldownTimer = p.subCooldownTimer;
    }

    const eSub = stepSubstitutionGauge(e.subLogs, e.subCooldownTimer, dt, false);
    e.subLogs = eSub.logs;
    e.subCooldownTimer = eSub.timerSec;

    this.stormSupportCds[0] = Math.max(0, this.stormSupportCds[0] - dt);
    this.stormSupportCds[1] = Math.max(0, this.stormSupportCds[1] - dt);
    for (let i = 0; i < 4; i++) {
      this.stormToolCds[i] = Math.max(0, this.stormToolCds[i] - dt);
    }

    this.stepStormCombatantTimers(p, dt);
    this.stepStormCombatantTimers(e, dt);

    const distToEnemy = Math.max(0.1, Math.hypot(e.x - p.x, e.z - p.z));
    p.facingAngle = Math.atan2(e.x - p.x, e.z - p.z);
    e.facingAngle = Math.atan2(p.x - e.x, p.z - e.z);

    const pMaxChakra = computeStormMaxUsableChakra(p.chakraLockedTimer);
    p.isGuarding = this.guardHeld && p.hitstunTimer <= 0 && p.guardBreakTimer <= 0;

    if (p.hitstunTimer <= 0 && p.guardBreakTimer <= 0) {
      if (this.chakraChargeHeld && p.chakraFatigueTimer <= 0 && !p.isGuarding) {
        const chargeBonus =
          this.stormGauge >= 50 && (this.support1Type === 'charge' || this.support2Type === 'charge') ? 1.35 : 1.0;
        p.chakra = Math.min(pMaxChakra, p.chakra + 34 * chargeBonus * dt);
      }

      const inputDx =
        Math.abs(this.moveDx) > 0.08
          ? this.moveDx
          : (this.steerRightHeld ? 1 : 0) - (this.steerLeftHeld ? 1 : 0);
      const inputDy = this.moveDy;

      if (!p.isGuarding && (Math.abs(inputDx) > 0.05 || Math.abs(inputDy) > 0.05)) {
        const speedMult =
          (p.speedBuffTimer > 0 ? 1.25 : 1.0) *
          (p.exhaustDebuffTimer > 0 ? 0.72 : 1.0) *
          (p.awakened ? 1.22 : 1.0);
        const step = p.def.speed * 2.25 * speedMult * dt;
        const forwardX = Math.sin(p.facingAngle);
        const forwardZ = Math.cos(p.facingAngle);
        const rightX = Math.cos(p.facingAngle);
        const rightZ = -Math.sin(p.facingAngle);
        p.x += (-inputDy * forwardX + inputDx * rightX) * step;
        p.z += (-inputDy * forwardZ + inputDx * rightZ) * step;
      }
    }

    if (p.dashTimer > 0) {
      p.x += Math.sin(p.facingAngle) * 22 * dt;
      p.z += Math.cos(p.facingAngle) * 22 * dt;
      if (distToEnemy <= 2.2) {
        p.dashTimer = 0;
        this.dealStormDamage(p, e, 85, 22, false);
      }
    }

    this.updateStormEnemyAi(e, p, distToEnemy, dt);

    for (const unit of [p, e]) {
      const r = Math.hypot(unit.x, unit.z);
      if (r > 20.5) {
        unit.x = (unit.x / r) * 20.5;
        unit.z = (unit.z / r) * 20.5;
      }
      unit.rig.group.position.set(unit.x, unit.y, unit.z);
      unit.rig.group.rotation.y = unit.facingAngle;
      unit.rig.armR.rotation.x *= 0.85;

      unit.rig.guardShield.visible = unit.isGuarding;
      if (unit.isGuarding) {
        const shieldMat = unit.rig.guardShield.material as THREE.MeshBasicMaterial;
        shieldMat.color.setHex(
          unit.guardHp > 60 ? 0x38bdf8 : unit.guardHp > 30 ? 0xfacc15 : 0xef4444
        );
      }
    }

    for (let i = this.stormProjectiles.length - 1; i >= 0; i--) {
      const proj = this.stormProjectiles[i];
      proj.x += proj.vx * dt;
      proj.z += proj.vz * dt;
      proj.ttl -= dt;
      proj.mesh.position.set(proj.x, proj.y, proj.z);

      const target = proj.team === 'player' ? e : p;
      const attacker = proj.team === 'player' ? p : e;
      if (Math.hypot(target.x - proj.x, target.z - proj.z) <= proj.radius + 1.05) {
        this.dealStormDamage(attacker, target, proj.dmg, proj.isChakraEnhanced ? 26 : 12, proj.isUltimate);
        proj.ttl = 0;
      }

      if (proj.ttl <= 0) {
        this.three?.scene.remove(proj.mesh);
        proj.mesh.geometry.dispose();
        (proj.mesh.material as THREE.Material).dispose();
        this.stormProjectiles.splice(i, 1);
      }
    }

    for (let i = this.stormLogs.length - 1; i >= 0; i--) {
      const lg = this.stormLogs[i];
      lg.ttl -= dt;
      lg.mesh.rotation.y += dt * 4;
      if (lg.ttl <= 0) {
        lg.mesh.traverse((obj) => {
          const m = obj as THREE.Mesh;
          if (m.geometry && !m.geometry.userData?.noDispose) m.geometry.dispose();
          const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
          for (const mat of mats) {
            if (mat && !mat.userData?.noDispose) mat.dispose();
          }
        });
        this.three?.scene.remove(lg.mesh);
        this.stormLogs.splice(i, 1);
      }
    }

    if (this.three) {
      const midX = (p.x + e.x) * 0.5;
      const midZ = (p.z + e.z) * 0.5;
      const camX = p.x - Math.sin(p.facingAngle) * 7.8 + Math.cos(p.facingAngle) * 2.2;
      const camZ = p.z - Math.cos(p.facingAngle) * 7.8 - Math.sin(p.facingAngle) * 2.2;
      _stormCamDesired.set(camX, 3.8, camZ);
      this.three.camera.position.lerp(_stormCamDesired, Math.min(1, dt * 8));
      this.three.camera.lookAt(midX, 1.35, midZ);
      this.renderStormOverlay2D(p, e);
    }

    if (e.hp <= 0) {
      playerState.narutoKillsTotal += 1;
      this.finishMatch(true);
      return;
    }
    if (p.hp <= 0) {
      this.finishMatch(false);
      return;
    }

    const prorationPct = Math.round(computeStormComboProration(Math.max(1, p.comboCount)) * 100);
    this.score = Math.round((2000 - e.hp) * 2 + p.hp);
    this.lives = Math.round(p.hp);
    this.maxLives = p.maxHp;
    updateInGameHud(this.score, this.level, this.gameIdx);
    updateHealthDisplay(this.lives, this.maxLives);

    updateNarutoHud({
      engine: 'storm_3d',
      modeName: this.modeDef.title,
      heroName: p.def.name,
      heroIcon: p.def.icon,
      traitName: p.def.passiveName,
      level: 6,
      xpPct: 100,
      gold: 0,
      awakenedSec: Number(p.awakeningTimer.toFixed(1)),
      superArmor: p.superArmorTimer > 0,
      iFrames: p.iFrameTimer > 0,
      ramenCd: 0,
      pillCd: 0,
      pillBuffSec: Number(p.atkBuffTimer.toFixed(1)),
      speedTagCd: 0,
      speedTagBuffSec: Number(p.speedBuffTimer.toFixed(1)),
      teamHp: Math.round(p.hp),
      teamMaxHp: p.maxHp,
      enemyHp: Math.round(e.hp),
      enemyMaxHp: e.maxHp,
      subLogs: p.subLogs,
      subRechargeSec: Number(p.subCooldownTimer.toFixed(1)),
      chakra: Math.round(p.chakra),
      maxUsableChakra: pMaxChakra,
      counterPenaltySec: Number(p.chakraLockedTimer.toFixed(1)),
      guardHp: Math.round(p.guardHp),
      guardBrokenSec: Number(p.guardBreakTimer.toFixed(1)),
      stormGauge: Math.round(this.stormGauge),
      comboHits: p.comboCount,
      prorationPct,
      fatigueSec: Number(p.chakraFatigueTimer.toFixed(1)),
      toolCharges: [...this.stormToolUses] as [number, number, number, number],
      support1Name: this.support1Def.name,
      support1Icon: this.support1Def.icon,
      support1Cd: Number(this.stormSupportCds[0].toFixed(1)),
      support2Name: this.support2Def.name,
      support2Icon: this.support2Def.icon,
      support2Cd: Number(this.stormSupportCds[1].toFixed(1)),
      actionLabel: '🥊 COMBO',
      jumpSkill1: {
        label: 'JUTSU',
        icon: '🌀',
        cd: Number(p.jutsuCooldown.toFixed(1)),
        maxCd: 1.4,
        visible: true
      },
      skill2: {
        label: this.guardHeld ? 'PARRY' : 'KUNAI',
        icon: '🗡️',
        cd: Number(p.attackCooldown.toFixed(1)),
        maxCd: 0.3,
        visible: true
      },
      skill3: {
        label: 'DASH',
        icon: '💨',
        cd: Number(p.dashTimer.toFixed(1)),
        maxCd: 0.36,
        visible: true
      },
      skill4: {
        label: this.stormGauge >= 100 ? 'TEAM ULT' : 'OUGI',
        icon: '💥',
        cd: Number(p.jutsuCooldown.toFixed(1)),
        maxCd: 2.4,
        visible: true
      },
      skill5: {
        label: 'AWAKEN',
        icon: '🌟',
        cd: Number(p.chakraFatigueTimer.toFixed(1)),
        maxCd: 10,
        visible: true,
        activeBuff: p.awakened
      },
      subBtn: {
        label: `SUB (${p.subLogs})`,
        icon: '🪵',
        cd: p.subLogs <= 0 ? Number((14 - p.subCooldownTimer).toFixed(1)) : 0,
        maxCd: 14,
        visible: true
      },
      supportBtn: {
        label: 'ASSIST',
        icon: '🤝',
        cd: Number(Math.min(this.stormSupportCds[0], this.stormSupportCds[1]).toFixed(1)),
        maxCd: 9.5,
        visible: true
      },
      chakraBtn: {
        label: 'CHAKRA',
        icon: '💙',
        cd: Number(p.chakraFatigueTimer.toFixed(1)),
        maxCd: 10,
        visible: true,
        activeBuff: this.chakraChargeHeld
      },
      guardBtn: {
        label: 'GUARD',
        icon: '🛡️',
        cd: Number(p.guardBreakTimer.toFixed(1)),
        maxCd: 2.5,
        visible: true,
        activeBuff: p.isGuarding
      }
    });
  }

  private stepStormCombatantTimers(c: StormCombatant, dt: number): void {
    c.chakraLockedTimer = Math.max(0, c.chakraLockedTimer - dt);
    c.chakraFatigueTimer = Math.max(0, c.chakraFatigueTimer - dt);
    c.guardBreakTimer = Math.max(0, c.guardBreakTimer - dt);
    c.hitstunTimer = Math.max(0, c.hitstunTimer - dt);
    c.iFrameTimer = Math.max(0, c.iFrameTimer - dt);
    c.superArmorTimer = Math.max(0, c.superArmorTimer - dt);
    c.dashTimer = Math.max(0, c.dashTimer - dt);
    c.atkBuffTimer = Math.max(0, c.atkBuffTimer - dt);
    c.defBuffTimer = Math.max(0, c.defBuffTimer - dt);
    c.speedBuffTimer = Math.max(0, c.speedBuffTimer - dt);
    c.exhaustDebuffTimer = Math.max(0, c.exhaustDebuffTimer - dt);
    c.attackCooldown = Math.max(0, c.attackCooldown - dt);
    c.jutsuCooldown = Math.max(0, c.jutsuCooldown - dt);
    c.counterStartupTimer = Math.max(0, c.counterStartupTimer - dt);

    if (!c.isGuarding && c.guardBreakTimer <= 0) {
      c.guardHp = Math.min(100, c.guardHp + 12 * dt);
    }

    if (c.comboResetTimer > 0) {
      c.comboResetTimer -= dt;
      if (c.comboResetTimer <= 0) c.comboCount = 0;
    }

    if (c.awakened) {
      c.awakeningTimer -= dt;
      if (c.awakeningTimer <= 0) {
        c.awakened = false;
        c.chakraFatigueTimer = 10.0;
        c.chakra = 20;
        c.rig.awakeningAura.visible = false;
        c.rig.group.scale.setScalar(1.18);
      }
    }
  }

  private updateStormEnemyAi(e: StormCombatant, p: StormCombatant, dist: number, dt: number): void {
    if (e.guardBreakTimer > 0) return;

    if (e.hitstunTimer > 0 && p.comboCount >= 3 && e.subLogs > 0 && Math.random() < 0.35) {
      this.triggerSubstitutionKawarimi(e, p);
      return;
    }
    if (e.hitstunTimer > 0) return;

    const eMaxChakra = computeStormMaxUsableChakra(e.chakraLockedTimer);
    e.chakra = Math.min(eMaxChakra, e.chakra + 14 * dt);

    if (!e.awakened && e.chakraFatigueTimer <= 0 && e.hp <= 750 && e.chakra >= 70) {
      e.awakened = true;
      e.awakeningTimer = 14.0;
      e.superArmorTimer = 14.0;
      e.rig.awakeningAura.visible = true;
      e.rig.group.scale.setScalar(1.18 * 1.42);
    }

    if (dist > 3.1) {
      e.isGuarding = false;
      const spd = e.def.speed * 1.85 * (e.exhaustDebuffTimer > 0 ? 0.72 : 1.0) * dt;
      e.x += Math.sin(e.facingAngle) * spd;
      e.z += Math.cos(e.facingAngle) * spd;

      if (dist > 7.5 && e.jutsuCooldown <= 0 && e.chakra >= 25 && Math.random() < dt * 1.4) {
        e.chakra -= 22;
        e.jutsuCooldown = 2.2;
        this.spawnStormProjectile(e, p, e.def.skills[0].damage * 0.65, e.def.chakraColor, true, false);
      }
    } else {
      e.isGuarding = Math.random() < 0.22;
      if (!e.isGuarding && e.attackCooldown <= 0) {
        e.attackCooldown = 0.48;
        e.rig.armR.rotation.x = -1.2;
        this.dealStormDamage(e, p, e.def.baseAtk * 0.58, 15, false);
      }
    }
  }

  private renderStormOverlay2D(p: StormCombatant, e: StormCombatant): void {
    const octx = this.three?.overlayCtx;
    if (!octx || !this.three) return;
    this.three.clearOverlay();
    const w = this.three.width;
    const h = this.three.height;

    _stormProjVec.set(e.x, 2.55, e.z).project(this.three.camera);
    if (_stormProjVec.z > -1 && _stormProjVec.z < 1) {
      const sx = (_stormProjVec.x * 0.5 + 0.5) * w;
      const sy = (-_stormProjVec.y * 0.5 + 0.5) * h;
      octx.fillStyle = 'rgba(9, 13, 22, 0.82)';
      octx.fillRect(sx - 56, sy - 22, 112, 18);
      octx.fillStyle = '#f8fafc';
      octx.font = 'bold 11px sans-serif';
      octx.textAlign = 'center';
      const statusTag =
        e.guardBreakTimer > 0
          ? '💫 GUARD BROKEN!'
          : e.awakened
            ? '🔥 AWAKENED'
            : e.isGuarding
              ? `🛡️ GUARD ${Math.round(e.guardHp)}%`
              : e.def.name;
      octx.fillText(statusTag, sx, sy - 9);
    }

    if (p.comboCount >= 2) {
      const prorationPct = Math.round(computeStormComboProration(p.comboCount) * 100);
      octx.fillStyle = '#f97316';
      octx.font = '900 22px sans-serif';
      octx.textAlign = 'right';
      octx.fillText(`${p.comboCount} HITS!`, w - 20, h * 0.36);
      octx.fillStyle = '#fde047';
      octx.font = 'bold 11.5px sans-serif';
      octx.fillText(`Combo Scaling: ${prorationPct}%`, w - 20, h * 0.36 + 17);
    }

    if (this.cutInBanner) {
      const bannerY = h < 460 ? h * 0.34 : h * 0.25;
      octx.fillStyle = 'rgba(9, 13, 22, 0.88)';
      octx.fillRect(0, bannerY, w, 54);
      octx.strokeStyle = this.cutInBanner.color;
      octx.lineWidth = 2;
      octx.strokeRect(0, bannerY, w, 54);
      octx.fillStyle = '#ffffff';
      octx.font = w < 460 ? 'bold 13px sans-serif' : 'bold 16px sans-serif';
      octx.textAlign = 'center';
      octx.fillText(this.cutInBanner.title, w / 2, bannerY + 23);
      octx.fillStyle = this.cutInBanner.color;
      octx.font = 'bold 11.5px sans-serif';
      octx.fillText(this.cutInBanner.subtitle, w / 2, bannerY + 42);
    }
  }

  // ============================================================================
  // MATCH COMPLETION & CLEANUP
  // ============================================================================
  private finishMatch(won: boolean): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.isRunning = false;
    playerState.narutoMatchesPlayed += 1;
    if (won) playerState.narutoWins += 1;
    playerState.narutoTrialHeroId = null;
    persistNarutoProgression();

    const coinsEarned = won ? 85 + this.senkiKills * 10 : 25;
    addCoins(coinsEarned);
    addXp(won ? 120 : 45);
    triggerGameOver(this.score, coinsEarned, this.level, this.gameIdx, won);
  }

  resize(): void {
    if (this.uses3DViewport) {
      this.three?.resize();
    } else {
      this.resizeSenkiCanvas();
    }
  }
}
