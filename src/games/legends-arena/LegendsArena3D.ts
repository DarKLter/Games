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
import { LegendsArena3DCombat } from './LegendsArena3DCombat';
import {
  MobaActor,
  TurretObj,
  JungleCamp,
  MAP_SIZE,
  MAP_HALF,
  PLAY_LIMIT,
  BLUE_BASE_X,
  BLUE_BASE_Z,
  RED_BASE_X,
  RED_BASE_Z,
  AMBUSH_BUSHES,
  _mobaDesired,
  _mobaLook,
  _mobaProj,
  disposeObjectTree,
  applyMobaSpeedSoftCap
} from './LegendsArena3DWorld';

export * from './LegendsArena3DWorld';

export class LegendsArena3D extends LegendsArena3DCombat implements GameInstance {
  protected pushMobaHudSnapshot(): void {
    const s1 = this.combatKit.skills[0];
    const s2 = this.combatKit.skills[1];
    const s3 = this.combatKit.skills[2];
    const s4 = this.combatKit.skills[3];
    const buffs: string[] = [];
    if (this.blueBuffTimer > 0) buffs.push(`🔵BLUE ${Math.ceil(this.blueBuffTimer)}s`);
    if (this.redBuffTimer > 0) buffs.push(`🟠RED ${Math.ceil(this.redBuffTimer)}s`);
    if (this.ccImmuneTimer > 0) buffs.push('✨CC IMMUNE');
    if (this.vengeanceTimer > 0) buffs.push('⚜️VENG');
    if (this.sprintBoostTimer > 0) buffs.push('💨SPRINT');
    if (this.windChantTimer > 0) buffs.push('🍃IMMUNE');
    if (this.frozenTimer > 0) buffs.push('❄️FROZEN');
    if (this.shieldTimer > 0) buffs.push('🛡️SHD');
    if (this.inspireTimer > 0) buffs.push('🔥INS');
    if (this.giantTimer > 0) buffs.push('🐲GIANT');
    if (this.inBush && this.bushRevealTimer <= 0) buffs.push('🌿STEALTH');

    const hasActiveItem = Boolean(this.computedStats.activeKind);

    const enemyHeroes: MobaHudEnemyTarget[] = [];
    for (const a of this.actors) {
      if (a.team === 'red' && a.kind === 'hero') {
        enemyHeroes.push({
          id: a.id,
          name: a.label || 'Enemy',
          icon: a.icon || '⚔️',
          hpPct: Math.max(0, Math.min(100, Math.round((a.hp / Math.max(1, a.maxHp)) * 100))),
          alive: a.alive,
          dist: Math.round(Math.hypot(a.x - this.px, a.z - this.pz))
        });
      }
    }

    const activeUlt = this.activeUltSetpieces[0];
    const iconicUltLabel = activeUlt
      ? activeUlt.kind === 'johnson_car'
        ? '🚗 FULL THROTTLE (TAP ULT TO CRASH)'
        : activeUlt.kind === 'yve_chessboard'
          ? '♟️ REAL WORLD MANIPULATION'
          : activeUlt.kind === 'lancelot_thorned_rose'
            ? '🌹 THORNED ROSE'
            : activeUlt.kind === 'tigreal_implosion'
              ? '🛡️ IMPLOSION'
              : '☂️ YIN YANG OVERTURN'
      : undefined;

    const clock = evaluateBattlefieldClock(this.matchElapsed);
    const presets = ROLE_BUILD_PRESETS[this.heroDef.role] ?? ROLE_BUILD_PRESETS.Fighter;

    const activeBuffs: MobaActiveBuffHud[] = [];
    if (this.blueBuffTimer > 0) {
      activeBuffs.push({
        id: 'purple_buff',
        label: 'Purple Buff',
        icon: '🟣',
        remainingSec: Math.ceil(this.blueBuffTimer),
        maxSec: MLBB_TIMERS.BUFF_DURATION_SEC,
        color: '#a855f7'
      });
    }
    if (this.redBuffTimer > 0) {
      activeBuffs.push({
        id: 'orange_buff',
        label: 'Orange Buff',
        icon: '🟠',
        remainingSec: Math.ceil(this.redBuffTimer),
        maxSec: MLBB_TIMERS.BUFF_DURATION_SEC,
        color: '#f97316'
      });
    }
    if (this.turtleBlessingTimer > 0) {
      activeBuffs.push({
        id: 'turtle_blessing',
        label: 'Turtle Shield',
        icon: '🐢',
        remainingSec: Math.ceil(this.turtleBlessingTimer),
        maxSec: 120,
        color: '#10b981'
      });
    }
    if (this.crabAuraTimer > 0) {
      activeBuffs.push({
        id: 'crab_aura',
        label: 'Gold Crab',
        icon: '🦀',
        remainingSec: Math.ceil(this.crabAuraTimer),
        maxSec: MLBB_TIMERS.CRAB_AURA_DURATION_SEC,
        color: '#facc15'
      });
    }
    if (this.walkieGrassTimer > 0) {
      activeBuffs.push({
        id: 'walkie_grass',
        label: 'Walkie Grass',
        icon: '🌿',
        remainingSec: Math.ceil(this.walkieGrassTimer),
        maxSec: MLBB_TIMERS.WALKIE_GRASS_DURATION_SEC,
        color: '#2dd4bf'
      });
    }
    if (this.homeguardTimer > 0) {
      activeBuffs.push({
        id: 'homeguard',
        label: 'Homeguard',
        icon: '💨',
        remainingSec: Math.ceil(this.homeguardTimer),
        maxSec: 4.5,
        color: '#38bdf8'
      });
    }

    const toNorm = (v: number) => Math.max(0, Math.min(1, (v + MAP_HALF) / MAP_SIZE));
    const bossCamp = this.jungleCamps.find((c) => c.id === 'river_boss');
    const objectiveBanner = bossCamp
      ? {
          kind: (this.bossPhase === 'lord' || bossCamp.campKind === 'lord' ? 'lord' : 'turtle') as 'turtle' | 'lord',
          stage: (this.bossPhase === 'lord' ? Math.max(1, clock.lordStage) : 0) as 0 | 1 | 2 | 3,
          label: bossCamp.label,
          alive: bossCamp.alive,
          countdownSec: bossCamp.alive ? 0 : Math.max(0, Math.ceil(bossCamp.respawnTimer)),
          pit: this.activeBossPit
        }
      : undefined;

    const minimapCamps: MobaMinimapCampHud[] = this.jungleCamps
      .filter((c) => !c.isSplitChild)
      .map((c) => ({
        id: c.id,
        kind:
          c.campKind === 'blue_buff'
            ? 'purple'
            : c.campKind === 'red_buff'
              ? 'orange'
              : c.campKind === 'litho'
                ? 'litho'
                : c.campKind === 'crab'
                  ? 'crab'
                  : c.campKind === 'turtle'
                    ? 'turtle'
                    : c.campKind === 'lord'
                      ? 'lord'
                      : 'small',
        nx: toNorm(c.alive ? c.x : c.homeX),
        nz: toNorm(c.alive ? c.z : c.homeZ),
        alive: c.alive,
        respawnSec: c.alive ? 0 : Math.max(0, Math.ceil(c.respawnTimer)),
        label: c.label,
        icon: c.icon
      }));

    const nearFlyingCloud =
      this.activeMapVariant.id === 'flying_cloud' &&
      (Math.hypot(this.px - FLYING_CLOUD_BLUE_SPOT[0], this.pz - FLYING_CLOUD_BLUE_SPOT[1]) <= 14 ||
        Math.hypot(this.px - BLUE_BASE_X, this.pz - BLUE_BASE_Z) <= 16);

    const snap: MobaHudSnapshot = {
      heroName: this.heroDef.name,
      heroRole: this.heroDef.role,
      attackLabel: 'ATK',
      hasSkill4: Boolean(s4),
      hasActiveItem,
      passiveLabel: this.combatKit.passiveLabel,
      passiveStacks: this.passiveStacks,
      maxStacks: this.combatKit.maxStacks,
      buffsText: buffs.join(' '),
      gold: Math.floor(this.gold),
      equippedItemIds: [...this.equippedItemIds],
      customBuildIds: [...this.customBuildIds],
      activePresetIdx: this.activePresetIdx,
      presetNames: presets.map((p) => p.name),
      prioritizedItemId: this.prioritizedItemId,
      blessingId: this.blessingId,
      blueBuffSec: Math.ceil(this.blueBuffTimer),
      redBuffSec: Math.ceil(this.redBuffTimer),
      matchElapsedSec: Math.floor(this.matchElapsed),
      mapVariantId: this.activeMapVariant.id,
      mapVariantName: this.activeMapVariant.name,
      mapVariantIcon: this.activeMapVariant.icon,
      mapVariantSummary: this.activeMapVariant.summary,
      expLaneSide: this.laneAssign.expLaneSide,
      goldLaneSide: this.laneAssign.goldLaneSide,
      outerShieldActive: clock.outerTurretShieldActive,
      isJungler: this.spellDef.id === 'retribution' || Boolean(this.blessingId?.startsWith('jungle_')),
      junglerStacks: this.junglerStacks,
      hasRoamBlessing: Boolean(this.blessingId?.startsWith('roam_')),
      roamGold: Math.floor(this.roamGold),
      flyingCloudReady: this.activeMapVariant.id === 'flying_cloud' && this.flyingCloudCd <= 0,
      nearFlyingCloud,
      activeBuffs,
      objectiveBanner,
      minimapData: {
        playerNx: toNorm(this.px),
        playerNz: toNorm(this.pz),
        camps: minimapCamps,
        cycloneEyes: this.cycloneEyes.map((ce) => ({
          id: ce.id,
          nx: toNorm(ce.x),
          nz: toNorm(ce.z),
          ready: ce.cd <= 0,
          cdSec: Math.ceil(ce.cd)
        })),
        turrets: this.turrets
          .filter((t) => t.alive)
          .map((t) => ({
            nx: toNorm(t.x),
            nz: toNorm(t.z),
            team: t.team,
            isNexus: t.isNexus,
            shield: t.tier === 1 && clock.outerTurretShieldActive
          })),
        heroes: this.actors
          .filter((a) => a.alive && (a.kind === 'hero' || a.kind === 'lord'))
          .map((a) => ({
            nx: toNorm(a.x),
            nz: toNorm(a.z),
            team: a.team,
            isLord: a.kind === 'lord'
          })),
        pings: this.minimapPings.map((p) => ({ ...p }))
      },
      tacticalPingText: this.tacticalPingTimer > 0 ? this.tacticalPingText : '',
      lockedEnemyId: this.lockedEnemyId,
      enemyHeroes,
      effectiveSpeed: Math.round(this.effectiveMlbbSpeed),
      isSprinting: this.isSprinting,
      inBushStealth: this.inBush && this.bushRevealTimer <= 0,
      ccImmuneSec: Number(this.ccImmuneTimer.toFixed(1)),
      activeCcText: this.frozenTimer > 0 ? '❄️ FROZEN' : this.ccImmuneTimer > 0 ? '✨ CC IMMUNE' : '',
      recallProgress: this.recallTimer > 0 ? Math.max(0, Math.min(1, 1 - this.recallTimer / 2.4)) : 0,
      iconicUltLabel,
      combatStats: {
        atk: this.atkDmg,
        maxHp: this.maxLives,
        physDef: this.computedStats.physDef,
        magicDef: this.computedStats.magicDef,
        cdrPct: this.computedStats.cdrPct,
        moveSpd: Math.round(this.effectiveMlbbSpeed)
      },
      skill1: {
        label: s1 ? s1.shortLabel : 'SKILL 1',
        icon: s1 ? s1.icon : '🗡️',
        cd: Number(this.cdSkill1.toFixed(1)),
        maxCd: this.maxCdSkill1,
        visible: true,
        elementColor: MOBA_ELEMENT_PALETTES[s1 ? s1.elementTheme : this.heroBaseElement].glowHex,
        targeting: s1 ? s1.targeting : 'line'
      },
      skill2: {
        label: s2 ? s2.shortLabel : 'SKILL 2',
        icon: s2 ? s2.icon : '☄️',
        cd: Number(this.cdSkill2.toFixed(1)),
        maxCd: this.maxCdSkill2,
        visible: true,
        elementColor: MOBA_ELEMENT_PALETTES[s2 ? s2.elementTheme : this.heroBaseElement].glowHex,
        targeting: s2 ? s2.targeting : 'circle'
      },
      skill3: {
        label: s3 ? s3.shortLabel : 'ULTI',
        icon: s3 ? s3.icon : '🌟',
        cd: Number(this.cdSkill3.toFixed(1)),
        maxCd: this.maxCdSkill3,
        visible: true,
        elementColor: MOBA_ELEMENT_PALETTES[s3 ? s3.elementTheme : this.heroBaseElement].glowHex,
        targeting: s3 ? s3.targeting : 'circle'
      },
      skill4: {
        label: s4 ? s4.shortLabel : 'SKILL 4',
        icon: s4 ? s4.icon : '🌀',
        cd: Number(this.cdSkill4.toFixed(1)),
        maxCd: this.maxCdSkill4,
        visible: Boolean(s4),
        elementColor: MOBA_ELEMENT_PALETTES[s4 ? s4.elementTheme : this.heroBaseElement].glowHex,
        targeting: s4 ? s4.targeting : 'circle'
      },
      spell: (() => {
        const meta = this.resolveActionAimMeta('spell');
        return {
          label: this.spellDef.name.slice(0, 7).toUpperCase(),
          icon: this.spellDef.icon,
          cd: Number(this.cdSpell.toFixed(1)),
          maxCd: this.maxCdSpell,
          visible: true,
          elementColor: meta ? MOBA_ELEMENT_PALETTES[meta.elementTheme].glowHex : '#38bdf8',
          targeting: meta ? meta.targeting : 'self'
        };
      })(),
      regen: {
        label: 'REGEN',
        icon: '💚',
        cd: Number(this.cdRegen.toFixed(1)),
        maxCd: this.maxCdRegen,
        visible: true,
        activeBuff: this.regenHoTTimer > 0,
        elementColor: '#22c55e',
        targeting: 'self'
      },
      recall: {
        label: this.recallTimer > 0 ? `${this.recallTimer.toFixed(1)}s` : 'RECALL',
        icon: '🌀',
        cd: 0,
        maxCd: 2.4,
        visible: !MOBA_MODES.find((m) => m.id === this.mobaMode)?.disableRecall,
        activeBuff: this.recallTimer > 0,
        elementColor: '#38bdf8',
        targeting: 'self'
      },
      itemActive: {
        label: this.computedStats.activeLabel || 'ACTIVE',
        icon: this.computedStats.activeIcon || '⚡',
        cd: Number(this.cdItemActive.toFixed(1)),
        maxCd: this.maxCdItemActive,
        visible: hasActiveItem,
        activeBuff: this.windChantTimer > 0 || this.frozenTimer > 0 || (this.computedStats.activeKind === 'conceal' && this.stealthTimer > 0),
        elementColor: '#facc15',
        targeting: 'self'
      },
      equippedEmotes: normalizeEquippedEmotes(playerState.mobaEquippedEmotes, playerState.mobaOwnedEmotes).map(
        (emoteId, idx): MobaEquippedEmoteHud => {
          const em = getMobaEmoteById(emoteId);
          return {
            slot: idx as 0 | 1 | 2 | 3,
            id: em.id,
            name: em.name,
            callout: em.callout,
            icon: em.icon,
            colorHex: em.colorHex
          };
        }
      ),
      emoteCd: Number(this.cdEmote.toFixed(1)),
      emoteMaxCd: this.maxCdEmote
    };
    updateMobaHud(snap);
  }

  public triggerEmote(slotIndex: number): boolean {
    if (this.gameOver || this.isPaused || this.cdEmote > 0) return false;
    const equipped = normalizeEquippedEmotes(playerState.mobaEquippedEmotes, playerState.mobaOwnedEmotes);
    const clampedSlot = Math.max(0, Math.min(3, Math.floor(slotIndex)));
    const emote = getMobaEmoteById(equipped[clampedSlot]);
    this.playerEmoteId = emote.id;
    this.playerEmoteTimer = this.playerEmoteMax;
    this.cdEmote = this.maxCdEmote;
    ArcadeAudio.play(emote.sfx);
    this.spawnEmoteBurst3D(this.px, this.py, this.pz, emote.colorNum);
    this.pushMobaHudSnapshot();
    return true;
  }

  protected spawnEmoteBurst3D(x: number, y: number, z: number, colorNum: number): void {
    const group = new THREE.Group();
    group.position.set(x, y + 0.15, z);

    const ringGeo = new THREE.RingGeometry(1.05, 1.45, 28);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorNum,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.12;
    ring.userData.isEmoteRing = true;
    group.add(ring);

    const sparkleGeo = new THREE.OctahedronGeometry(0.24, 0);
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI * 2 * i) / 6;
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? colorNum : 0xffffff,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      });
      const sp = new THREE.Mesh(sparkleGeo, mat);
      const rad = 1.15;
      sp.position.set(Math.cos(ang) * rad, 0.7 + (i % 2) * 0.4, Math.sin(ang) * rad);
      sp.userData.isEmoteSparkle = true;
      sp.userData.angle = ang;
      sp.userData.riseSpeed = 2.6 + (i % 3) * 0.55;
      group.add(sp);
    }

    this.three.scene.add(group);
    this.fxObjs.push({
      mesh: group,
      life: 0.9,
      maxLife: 0.9,
      mode: 'emote_burst'
    });
  }

  protected triggerActorAiEmote(a: MobaActor, context: MobaEmoteAiContext): void {
    if (!a.alive || a.kind !== 'hero') return;
    if ((a.emoteAiCd ?? 0) > 0) return;
    // Cap simultaneous AI hero emote bubbles at 2 so the battlefield stays clean
    let activeAiBubbles = 0;
    for (const other of this.actors) {
      if (other.alive && other.activeEmoteTimer && other.activeEmoteTimer > 0) {
        activeAiBubbles++;
      }
    }
    if (activeAiBubbles >= 2) return;

    const seed = Math.floor(this.matchElapsed * 10) + a.id * 7;
    const emote = pickContextualAiEmote(context, seed);
    a.activeEmoteId = emote.id;
    a.activeEmoteTimer = 2.5;
    a.activeEmoteMax = 2.5;
    a.emoteAiCd = 15 + (a.id % 8);
    if (Math.hypot(a.x - this.px, a.z - this.pz) <= 44) {
      this.spawnEmoteBurst3D(a.x, a.mesh.position.y, a.z, emote.colorNum);
    }
  }

  protected setHeroBushTranslucency(stealth: boolean): void {
    if (this.bushStealthApplied === stealth) return;
    this.bushStealthApplied = stealth;
    this.playerMesh.traverse((obj) => {
      if (
        obj === this.shieldDomeMesh ||
        obj === this.ccImmuneAuraMesh ||
        obj === this.frozenCrystalMesh ||
        obj === this.blueBuffAuraMesh ||
        obj === this.redBuffAuraMesh
      ) {
        return;
      }
      const m = obj as THREE.Mesh;
      if (!m.isMesh) return;
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mat of mats) {
        if ('opacity' in mat && 'transparent' in mat) {
          const std = mat as THREE.MeshStandardMaterial;
          if (!std.userData._origOpacitySaved) {
            std.userData._origOpacity = std.opacity;
            std.userData._origTransparent = std.transparent;
            std.userData._origOpacitySaved = true;
          }
          if (stealth) {
            std.transparent = true;
            std.opacity = Math.min(0.45, std.userData._origOpacity ?? 1);
          } else {
            std.transparent = Boolean(std.userData._origTransparent);
            std.opacity = std.userData._origOpacity ?? 1;
          }
          std.needsUpdate = true;
        }
      }
    });
  }

  protected updateSimulation(dt: number): void {
    this.matchElapsed += dt;
    this.outOfCombatSec += dt;

    // Passive Match Gold Trickle (+8 Gold/s, +14 Gold/s in Brawl/Overdrive)
    this.gold += (this.mobaMode === 'brawl' || this.mobaMode === 'overdrive' ? 14 : 8) * dt;

    if (this.killfeedTimer > 0) this.killfeedTimer = Math.max(0, this.killfeedTimer - dt);
    this.basicCd = Math.max(0, this.basicCd - dt);
    this.cdSkill1 = Math.max(0, this.cdSkill1 - dt);
    this.cdSkill2 = Math.max(0, this.cdSkill2 - dt);
    this.cdSkill3 = Math.max(0, this.cdSkill3 - dt);
    this.cdSkill4 = Math.max(0, this.cdSkill4 - dt);
    this.cdSpell = Math.max(0, this.cdSpell - dt);
    this.cdRegen = Math.max(0, this.cdRegen - dt);
    this.cdEmote = Math.max(0, this.cdEmote - dt);
    if (this.playerEmoteTimer > 0) {
      this.playerEmoteTimer = Math.max(0, this.playerEmoteTimer - dt);
      if (this.playerEmoteTimer <= 0) this.playerEmoteId = null;
    }
    this.cdItemActive = Math.max(0, this.cdItemActive - dt);
    this.shieldTimer = Math.max(0, this.shieldTimer - dt);
    this.inspireTimer = Math.max(0, this.inspireTimer - dt);
    this.hasteTimer = Math.max(0, this.hasteTimer - dt);
    this.stealthTimer = Math.max(0, this.stealthTimer - dt);
    this.giantTimer = Math.max(0, this.giantTimer - dt);
    this.windChantTimer = Math.max(0, this.windChantTimer - dt);
    this.frozenTimer = Math.max(0, this.frozenTimer - dt);
    this.reviveCheatCd = Math.max(0, this.reviveCheatCd - dt);
    this.immortalityCd = Math.max(0, this.immortalityCd - dt);
    this.lifelineCd = Math.max(0, this.lifelineCd - dt);

    // New Combat / Animation / Talent Timers
    this.bushRevealTimer = Math.max(0, this.bushRevealTimer - dt);
    this.ccImmuneTimer = Math.max(0, this.ccImmuneTimer - dt);
    this.slowImmuneTimer = Math.max(0, this.slowImmuneTimer - dt);
    this.sprintBoostTimer = Math.max(0, this.sprintBoostTimer - dt);
    this.vengeanceTimer = Math.max(0, this.vengeanceTimer - dt);
    this.untargetableTimer = Math.max(0, this.untargetableTimer - dt);
    this.castAnimTimer = Math.max(0, this.castAnimTimer - dt);
    this.cameraShake = Math.max(0, this.cameraShake - dt * 1.9);
    this.braveSmiteCd = Math.max(0, this.braveSmiteCd - dt);
    this.weaknessFinderCd = Math.max(0, this.weaknessFinderCd - dt);
    this.lethalIgnitionCd = Math.max(0, this.lethalIgnitionCd - dt);
    if (this.lethalIgnitionWindow > 0) {
      this.lethalIgnitionWindow = Math.max(0, this.lethalIgnitionWindow - dt);
      if (this.lethalIgnitionWindow <= 0) this.lethalIgnitionHits = 0;
    }
    if (this.telegraphAutoTimer > 0 && !this.activeSkillAim) {
      this.telegraphAutoTimer = Math.max(0, this.telegraphAutoTimer - dt);
      if (this.telegraphAutoTimer <= 0 && this.telegraphSlot !== null) {
        this.telegraphSlot = null;
        this.telegraphGroup.visible = false;
        if (this.telegraphRangeGroup) this.telegraphRangeGroup.visible = false;
      }
    }

    const prevBlue = this.blueBuffTimer > 0;
    const prevRed = this.redBuffTimer > 0;
    this.blueBuffTimer = Math.max(0, this.blueBuffTimer - dt);
    this.redBuffTimer = Math.max(0, this.redBuffTimer - dt);
    if ((prevBlue && this.blueBuffTimer <= 0) || (prevRed && this.redBuffTimer <= 0)) {
      this.recomputeStats();
    }

    const clock = evaluateBattlefieldClock(this.matchElapsed);

    // Exact MLBB Match Timeline Announcements & State Transitions (0:10, 2:00, 5:00, 8:00, 12:00, 18:00)
    if (clock.outerTurretShieldActive === false && !this.announcedMilestones.has('5m')) {
      this.announcedMilestones.add('5m');
      for (const t of this.turrets) {
        if (t.shieldMesh) t.shieldMesh.visible = false;
      }
      for (const m of this.laneMarkerMeshes) m.visible = false;
      this.showKillfeed('🛡️ 05:00 — Outer Turret Energy Shields & Lane Cannon Bonuses Expired!');
    }
    if (clock.largeGoldCrabsActive && !this.announcedMilestones.has('2m_crabs')) {
      this.announcedMilestones.add('2m_crabs');
      for (const jc of this.jungleCamps) {
        if (jc.campKind === 'crab' && !jc.upgraded) {
          jc.upgraded = true;
          jc.label = 'Large Gold Crab';
          jc.maxHp = 210;
          jc.hp = jc.alive ? Math.max(jc.hp, 210) : 210;
          jc.goldReward = 115;
          jc.respawnDelay = MLBB_TIMERS.LARGE_CRAB_RESPAWN_SEC;
          jc.mesh.scale.setScalar(1.32);
        }
      }
    }
    if (clock.minionSpeedBoostActive && !this.announcedMilestones.has('12m')) {
      this.announcedMilestones.add('12m');
      this.showKillfeed('⚡ 12:00 — Enhanced Lord (Stage 2) Awakens & Minion Waves Gain Speed Boost!');
    }
    if (clock.lateGameEscalationActive && !this.announcedMilestones.has('18m')) {
      this.announcedMilestones.add('18m');
      this.showKillfeed('🔥 18:00 — Evolved Lord (Stage 3) & Late-Game Homeguard Surge Active!');
    }

    // Update Minimap Pings TTL & Tactical Ping Banner
    if (this.tacticalPingTimer > 0) this.tacticalPingTimer = Math.max(0, this.tacticalPingTimer - dt);
    for (let i = this.minimapPings.length - 1; i >= 0; i--) {
      this.minimapPings[i].ttl -= dt;
      if (this.minimapPings[i].ttl <= 0) this.minimapPings.splice(i, 1);
    }

    // Active Battlefield Buff Timers (Turtle's Blessing, Crab Gold/EXP Aura, Walkie Grass, Homeguard, Flying Cloud CD, Roam Gold)
    this.flyingCloudCd = Math.max(0, this.flyingCloudCd - dt);
    this.fountainLaserCd = Math.max(0, this.fountainLaserCd - dt);
    this.homeguardTimer = Math.max(0, this.homeguardTimer - dt);
    this.walkieGrassTimer = Math.max(0, this.walkieGrassTimer - dt);
    if (this.turtleBlessingTimer > 0) {
      this.turtleBlessingTimer = Math.max(0, this.turtleBlessingTimer - dt);
      if (this.activeMapVariant.id === 'healing_turtle') {
        this.turtleHealAcc += dt;
        if (this.turtleHealAcc >= 2.0) {
          this.turtleHealAcc -= 2.0;
          const heal = Math.max(8, Math.round(this.maxLives * 0.05));
          this.lives = Math.min(this.maxLives, this.lives + heal);
          updateHealthDisplay(this.lives, this.maxLives);
          this.spawnDamageNumber(this.px, this.pz, heal, 'heal');
        }
      }
    }
    if (this.crabAuraTimer > 0) {
      this.crabAuraTimer = Math.max(0, this.crabAuraTimer - dt);
      this.crabAuraAcc += dt;
      if (this.crabAuraAcc >= 2.0) {
        this.crabAuraAcc -= 2.0;
        this.gold += 14;
        this.grantHeroXp(16);
      }
    }
    if (this.blessingId?.startsWith('roam_') && this.roamGold < 600) {
      this.roamGoldAcc += dt;
      if (this.roamGoldAcc >= 1.5) {
        this.roamGoldAcc -= 1.5;
        const prev = this.roamGold;
        this.roamGold = Math.min(600, this.roamGold + 18);
        this.gold += 12;
        if (prev < 600 && this.roamGold >= 600) {
          this.showKillfeed('🛡️ ROAM BLESSING EVOLVED (600/600 GOLD)! Full Support Aura Unlocked!');
        }
      }
    }

    // 4 Cyclone Eyes (Directional Wind Dash on step)
    for (const ce of this.cycloneEyes) {
      ce.cd = Math.max(0, ce.cd - dt);
      ce.mesh.rotation.y += dt * (ce.cd <= 0 ? 4.2 : 0.7);
      ce.mesh.visible = true;
      const ready = ce.cd <= 0;
      ce.mesh.scale.setScalar(ready ? 1.0 : 0.55);
      if (ready && !this.activeMotion && Math.hypot(this.px - ce.x, this.pz - ce.z) <= 3.2) {
        ce.cd = MLBB_TIMERS.CYCLONE_EYE_COOLDOWN_SEC;
        this.startPlayerMotion('dash', 16.5, 0.34, 0.65);
        this.hasteTimer = Math.max(this.hasteTimer, 1.4);
        ArcadeAudio.play('dash');
        this.spawnVfx('ring', ce.x, ce.z, 5.2, 0x38bdf8);
        this.showKillfeed('🌀 CYCLONE EYE! Wind Surge Dash!');
      }
    }

    // Flying Cloud Interactive Launch Pad
    if (this.flyingCloudMesh) {
      this.flyingCloudMesh.position.y = Math.sin(this.matchElapsed * 2.5) * 0.25;
      this.flyingCloudMesh.scale.setScalar(this.flyingCloudCd <= 0 ? 1.0 : 0.6);
      if (
        this.flyingCloudCd <= 0 &&
        !this.activeMotion &&
        Math.hypot(this.px - FLYING_CLOUD_BLUE_SPOT[0], this.pz - FLYING_CLOUD_BLUE_SPOT[1]) <= 3.6
      ) {
        this.activateFlyingCloud();
      }
    }

    // River Wards: Walkie Grass follower, Stone Roamer & Revealing Wisps patrol
    for (let i = this.riverWards.length - 1; i >= 0; i--) {
      const rw = this.riverWards[i];
      rw.life -= dt;
      rw.angle += dt * 1.4;
      if (rw.kind === 'walkie') {
        rw.x = this.px + Math.cos(rw.angle * 1.6) * 2.1;
        rw.z = this.pz + Math.sin(rw.angle * 1.6) * 2.1;
        rw.mesh.position.set(rw.x, Math.sin(rw.angle * 3) * 0.2, rw.z);
        if (Math.random() < dt * 1.5 && this.lives < this.maxLives) {
          this.lives = Math.min(this.maxLives, this.lives + 4);
          updateHealthDisplay(this.lives, this.maxLives);
        }
      } else {
        const patrolRad = rw.kind === 'wisp' ? 14 : 11;
        rw.x = rw.homeX + Math.cos(rw.angle * 0.55) * patrolRad;
        rw.z = rw.homeZ + Math.sin(rw.angle * 0.55) * patrolRad;
        rw.mesh.position.set(rw.x, 0, rw.z);
        rw.mesh.rotation.y += dt * 2.2;
      }
      if (rw.life <= 0) {
        disposeObjectTree(rw.mesh);
        this.three.scene.remove(rw.mesh);
        this.riverWards.splice(i, 1);
      }
    }

    // 3D Pit Hologram Countdown Ring Animation
    if (this.pitHologramGroup && this.pitHologramRing) {
      const bossCamp = this.jungleCamps.find((c) => c.id === 'river_boss');
      const showHolo = Boolean(bossCamp && !bossCamp.alive);
      this.pitHologramGroup.visible = showHolo;
      if (showHolo && bossCamp) {
        this.pitHologramGroup.rotation.y += dt * 1.8;
        const maxWait = Math.max(1, bossCamp.respawnDelay);
        const prog = Math.max(0.15, Math.min(1, 1 - bossCamp.respawnTimer / maxWait));
        this.pitHologramRing.scale.setScalar(prog * 1.45);
      }
    }

    // Blue Fountain Healing + Homeguard & Red Fountain Instant-Kill Laser
    const atFountain = Math.hypot(this.px - BLUE_BASE_X, this.pz - BLUE_BASE_Z) < 12;
    if (atFountain) {
      this.lives = Math.min(this.maxLives, this.lives + Math.max(1, Math.round(this.maxLives * 0.3 * dt)));
      this.homeguardTimer = Math.max(this.homeguardTimer, clock.lateGameEscalationActive ? 6.0 : 4.5);
      updateHealthDisplay(this.lives, this.maxLives);
    }
    const atRedFountain = Math.hypot(this.px - RED_BASE_X, this.pz - RED_BASE_Z) < 12.5;
    if (atRedFountain && this.fountainLaserCd <= 0) {
      this.fountainLaserCd = 0.55;
      this.spawnVfx('lightning', this.px, this.pz, 6.0, 0xf43f5e);
      this.showKillfeed('⚡ ENEMY FOUNTAIN LASER! Instant High-True-Damage Defense!');
      this.applyPlayerDamage(Math.round(this.maxLives * 0.55));
    }

    if (this.regenHoTTimer > 0) {
      this.regenHoTTimer = Math.max(0, this.regenHoTTimer - dt);
      this.lives = Math.min(this.maxLives, this.lives + Math.max(1, Math.round(this.maxLives * 0.1 * dt)));
      updateHealthDisplay(this.lives, this.maxLives);
    }
    if (this.computedStats.hpRegenPerSec > 0 && this.lives < this.maxLives && Math.random() < dt * 2.5) {
      this.lives = Math.min(this.maxLives, this.lives + Math.max(1, Math.round(this.computedStats.hpRegenPerSec * 0.45)));
      updateHealthDisplay(this.lives, this.maxLives);
    }

    // Revitalize Healing Springs (5s team HoT)
    for (let i = this.healingSprings.length - 1; i >= 0; i--) {
      const sp = this.healingSprings[i];
      sp.life -= dt;
      sp.tickAcc += dt;
      sp.mesh.rotation.y += dt * 1.4;
      if (sp.tickAcc >= 0.5) {
        sp.tickAcc -= 0.5;
        if (Math.hypot(this.px - sp.x, this.pz - sp.z) <= 6.2) {
          const heal = Math.max(6, Math.round(this.maxLives * 0.045));
          this.lives = Math.min(this.maxLives, this.lives + heal);
          updateHealthDisplay(this.lives, this.maxLives);
          this.spawnDamageNumber(this.px, this.pz, heal, 'heal');
        }
        for (const a of this.actors) {
          if (a.alive && a.team === 'blue' && Math.hypot(a.x - sp.x, a.z - sp.z) <= 6.2) {
            a.hp = Math.min(a.maxHp, a.hp + Math.round(a.maxHp * 0.05));
          }
        }
      }
      if (sp.life <= 0) {
        disposeObjectTree(sp.mesh);
        this.three.scene.remove(sp.mesh);
        this.healingSprings.splice(i, 1);
      }
    }

    // Cursed Helmet (Burning Soul: AoE Magic Damage around hero)
    if (this.computedStats.hasBurningSoul && Math.random() < dt * 2) {
      const burnDmg = Math.max(4, Math.round(this.maxLives * 0.02));
      for (const a of this.actors) {
        if (a.alive && a.team === 'red' && Math.hypot(a.x - this.px, a.z - this.pz) < 6.0) {
          this.damageEnemyActor(a, burnDmg, true, 'magic');
        }
      }
      for (const jc of this.jungleCamps) {
        if (jc.alive && Math.hypot(jc.x - this.px, jc.z - this.pz) < 6.0) {
          this.damageJungleCamp(jc, burnDmg);
        }
      }
    }

    // Ambush Bush detection + 3D Stealth Translucency Shader (opacity 0.45 when hidden)
    this.inBush = AMBUSH_BUSHES.some(([bx, bz, br]) => Math.hypot(this.px - bx, this.pz - bz) < br);
    const isBushStealthed = this.inBush && this.bushRevealTimer <= 0;
    this.setHeroBushTranslucency(isBushStealthed || this.stealthTimer > 0);
    if (this.inBush && this.combatKit.passiveKind === 'bush_regen_stealth') {
      this.lives = Math.min(this.maxLives, this.lives + Math.max(1, Math.round(this.maxLives * 0.08 * dt)));
      updateHealthDisplay(this.lives, this.maxLives);
    }

    // Cancelable 3D Recall Channel Circle
    this.recallCircleGroup.visible = this.recallTimer > 0;
    if (this.recallTimer > 0) {
      this.recallCircleGroup.position.set(this.px, 0, this.pz);
      this.recallCircleGroup.rotation.y += dt * 3.8;
      this.recallTimer -= dt;
      if (this.recallTimer <= 0) {
        this.recallCircleGroup.visible = false;
        this.px = BLUE_BASE_X + 4;
        this.py = 0;
        this.pz = BLUE_BASE_Z - 4;
        this.lives = this.maxLives;
        ArcadeAudio.play('levelup');
        updateHealthDisplay(this.lives, this.maxLives);
        this.spawnVfx('portal_warp', this.px, this.pz, 5.0, 0x38bdf8);
        this.showKillfeed('🌀 RECALLED TO FOUNTAIN! FULL HP RESTORED!');
      }
    }

    // Active Movement Physics (Linear Dash / Parabolic Z-Y Leap / Snap-back + Ghost Afterimages)
    let isMoving = false;
    const drivingCar = this.activeUltSetpieces.find((s) => s.kind === 'johnson_car');

    if (this.activeMotion) {
      const m = this.activeMotion;
      m.elapsed += dt;
      m.ghostAcc += dt;
      const t = Math.min(1, m.elapsed / Math.max(0.05, m.duration));
      if (m.kind === 'snap_back') {
        const tri = t < 0.5 ? t * 2 : (1 - t) * 2;
        this.px = m.startX + (m.endX - m.startX) * tri;
        this.pz = m.startZ + (m.endZ - m.startZ) * tri;
        this.py = 4 * m.peakY * t * (1 - t);
      } else {
        this.px = m.startX + (m.endX - m.startX) * t;
        this.pz = m.startZ + (m.endZ - m.startZ) * t;
        this.py = m.peakY > 0 ? 4 * m.peakY * t * (1 - t) : 0;
      }
      if (m.ghostAcc >= 0.065) {
        m.ghostAcc = 0;
        this.spawnAfterimageGhost(this.px, this.py, this.pz, this.pYaw, this.heroBladeColor);
      }
      isMoving = true;
      if (t >= 1) {
        this.py = 0;
        this.activeMotion = null;
      }
    } else if (this.frozenTimer <= 0) {
      let vx = this.moveX;
      let vz = this.moveZ;
      if (vx === 0 && vz === 0 && this.tapTarget) {
        const dx = this.tapTarget.x - this.px;
        const dz = this.tapTarget.z - this.pz;
        const d = Math.hypot(dx, dz);
        if (d > 0.7) {
          vx = dx / d;
          vz = dz / d;
        } else {
          this.tapTarget = null;
        }
      }
      // Johnson Full Throttle auto-drives forward and steers with joystick
      if (drivingCar) {
        if (vx !== 0 || vz !== 0) {
          const desiredYaw = Math.atan2(vx, vz);
          let diff = desiredYaw - this.pYaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          this.pYaw += Math.max(-2.6 * dt, Math.min(2.6 * dt, diff));
        }
        vx = Math.sin(this.pYaw);
        vz = Math.cos(this.pYaw);
      }

      // Compute MLBB Movement Speed (with River Speed Current + Soft-Caps at 415 and 490)
      const inRiver = Math.abs(this.px - this.pz) < 18 && Math.abs(this.px) < 95;
      const riverBonus = inRiver ? 45 : 0;
      const rapidBootsBonus = this.equippedItemIds.includes('rapid_boots') && this.outOfCombatSec >= 5 ? 40 : 0;
      const homeguardBonus =
        this.homeguardTimer > 0 ? (clock.lateGameEscalationActive ? 0.55 : 0.35) : 0;
      const hastePct =
        (this.sprintBoostTimer > 0 ? 0.5 : 0) +
        (this.hasteTimer > 0 ? 0.28 : 0) +
        (this.stealthTimer > 0 ? 0.2 : 0) +
        homeguardBonus +
        (drivingCar ? 0.65 : 0);
      const rawMlbbSpd = (this.moveSpd * 21.5 + riverBonus + rapidBootsBonus) * (1 + hastePct);
      this.effectiveMlbbSpeed = applyMobaSpeedSoftCap(rawMlbbSpd);
      this.isSprinting = this.effectiveMlbbSpeed >= 360;

      if (vx !== 0 || vz !== 0) {
        isMoving = true;
        this.recallTimer = 0;
        // Backswing cancel when player issues movement input
        if (this.castAnimTimer > 0 && this.castAnimTimer < 0.14) {
          this.castAnimTimer = 0;
        }
        const len = Math.hypot(vx, vz) || 1;
        const mag = Math.min(1, len);
        const worldSpd = (this.effectiveMlbbSpeed / 21.5) * mag * dt;
        this.px = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.px + (vx / len) * worldSpd));
        this.pz = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.pz + (vz / len) * worldSpd));
        if (!drivingCar) {
          this.pYaw = Math.atan2(vx, vz);
        }
      }
    }

    // Update Hero 3D Transform, Sprint Posture (>360 speed), Cast Wind-up, and Idle/Special Idle
    if (isMoving) {
      this.idleTimer = 0;
      this.walkPhase += dt * (this.isSprinting ? 14 : 9.5);
    } else {
      this.idleTimer += dt;
    }

    const baseScale = this.giantTimer > 0 ? 1.65 : 1.24;
    const bobY = this.py > 0 ? 0 : isMoving ? Math.abs(Math.sin(this.walkPhase)) * (this.isSprinting ? 0.26 : 0.14) : Math.sin(this.idleTimer * 2.4) * 0.05;
    this.playerMesh.visible = !drivingCar && this.untargetableTimer <= 0;
    this.playerMesh.position.set(this.px, this.py + bobY, this.pz);
    // Special Idle flourish after 3.2s standing still
    const specialIdleSpin = !isMoving && this.idleTimer > 3.2 && this.idleTimer % 4.5 < 0.7 ? Math.sin(((this.idleTimer % 4.5) / 0.7) * Math.PI * 2) * 0.35 : 0;
    this.playerMesh.rotation.y = this.pYaw + specialIdleSpin;
    // Forward Sprint Lean (>360 speed) vs Cast Wind-up
    const targetPitch = this.castAnimTimer > 0.12 ? -0.18 : isMoving && this.isSprinting ? 0.24 : isMoving ? 0.08 : 0;
    this.playerMesh.rotation.x += (targetPitch - this.playerMesh.rotation.x) * Math.min(1, dt * 14);
    const breathScale = !isMoving ? 1 + Math.sin(this.idleTimer * 2.8) * 0.025 : 1;
    this.playerMesh.scale.set(baseScale, baseScale * breathScale, baseScale);

    // 3D Shield Dome, CC Immunity Golden Halo, Winter Crown Frozen Crystal, and Blue/Orange Buff Rings
    this.shieldDomeMesh.visible = this.shieldTimer > 0 || this.windChantTimer > 0 || this.vengeanceTimer > 0;
    if (this.shieldDomeMesh.visible) {
      this.shieldDomeMesh.rotation.y += dt * 2.2;
    }
    this.ccImmuneAuraMesh.visible = this.ccImmuneTimer > 0;
    if (this.ccImmuneAuraMesh.visible) {
      this.ccImmuneAuraMesh.rotation.z += dt * 4.5;
    }
    this.frozenCrystalMesh.visible = this.frozenTimer > 0;
    if (this.frozenCrystalMesh.visible) {
      this.frozenCrystalMesh.rotation.y += dt * 3.5;
    }
    this.blueBuffAuraMesh.visible = this.blueBuffTimer > 0;
    if (this.blueBuffAuraMesh.visible) {
      this.blueBuffAuraMesh.rotation.y += dt * 2.6;
    }
    this.redBuffAuraMesh.visible = this.redBuffTimer > 0;
    if (this.redBuffAuraMesh.visible) {
      this.redBuffAuraMesh.rotation.y -= dt * 2.6;
    }

    // Update 5 Signature 3D Ultimate Setpieces
    for (let i = this.activeUltSetpieces.length - 1; i >= 0; i--) {
      const sp = this.activeUltSetpieces[i];
      sp.life -= dt;
      sp.tickAcc += dt;

      if (sp.kind === 'tigreal_implosion') {
        sp.group.position.set(this.px, 0, this.pz);
        sp.group.rotation.y += dt * 3.2;
        if (sp.tetherTargets) {
          for (const a of sp.tetherTargets) {
            if (!a.alive) continue;
            a.x += (this.px - a.x) * Math.min(1, dt * 4.2);
            a.z += (this.pz - a.z) * Math.min(1, dt * 4.2);
            a.mesh.position.set(a.x, 0, a.z);
          }
        }
        if (sp.life <= 0.15 && !sp.detonated) {
          sp.detonated = true;
          this.cameraShake = Math.max(this.cameraShake, 0.55);
          ArcadeAudio.play('explosion');
          this.spawnVfx('ring', this.px, this.pz, 10.5, 0xfacc15);
          for (const a of this.actors) {
            if (a.alive && a.team === 'red' && Math.hypot(a.x - this.px, a.z - this.pz) <= 10.2) {
              a.stunTimer = Math.max(a.stunTimer, 1.5);
              this.damageEnemyActor(a, sp.baseDmg, true, 'phys');
            }
          }
        }
      } else if (sp.kind === 'lancelot_thorned_rose') {
        sp.group.rotation.y += dt * 0.8;
        if (sp.life <= 0.12 && !sp.detonated) {
          sp.detonated = true;
          this.cameraShake = Math.max(this.cameraShake, 0.42);
          ArcadeAudio.play('combo');
          this.spawnVfx('ring', sp.cx, sp.cz, 7.6, 0xf472b6);
          for (const a of this.actors) {
            if (a.alive && a.team === 'red' && Math.hypot(a.x - sp.cx, a.z - sp.cz) <= 7.8) {
              a.slowTimer = Math.max(a.slowTimer, 1.5);
              this.damageEnemyActor(a, sp.baseDmg, true, 'phys');
            }
          }
        }
      } else if (sp.kind === 'johnson_car') {
        sp.group.position.set(this.px, 0, this.pz);
        sp.group.rotation.y = this.pYaw;
        // Detect crash against enemy hero or turret
        let crashed = false;
        for (const a of this.actors) {
          if (a.alive && a.team === 'red' && a.kind === 'hero' && Math.hypot(a.x - this.px, a.z - this.pz) < 3.4) {
            crashed = true;
            break;
          }
        }
        if (!crashed) {
          for (const t of this.turrets) {
            if (t.alive && t.team === 'red' && Math.hypot(t.x - this.px, t.z - this.pz) < 4.2) {
              crashed = true;
              break;
            }
          }
        }
        if (crashed || sp.life <= 0.05) {
          this.detonateJohnsonCrash(sp);
          sp.life = 0;
        }
      } else if (sp.kind === 'yve_chessboard') {
        if (sp.tickAcc >= 0.42) {
          sp.tickAcc -= 0.42;
          const rx = sp.cx + (Math.random() - 0.5) * 11;
          const rz = sp.cz + (Math.random() - 0.5) * 11;
          this.spawnVfx('meteor', rx, rz, 3.5, 0xa855f7);
          for (const a of this.actors) {
            if (a.alive && a.team === 'red' && Math.abs(a.x - sp.cx) <= 7.4 && Math.abs(a.z - sp.cz) <= 7.4) {
              a.slowTimer = Math.max(a.slowTimer, 1.0);
              this.damageEnemyActor(a, sp.baseDmg, true, 'magic');
            }
          }
        }
      } else if (sp.kind === 'kagura_overturn') {
        sp.group.rotation.y += dt * 5.2;
        if (sp.life <= 0.12 && !sp.detonated) {
          sp.detonated = true;
          this.cameraShake = Math.max(this.cameraShake, 0.48);
          ArcadeAudio.play('explosion');
          this.spawnVfx('ring', sp.cx, sp.cz, 9.2, 0xc084fc);
          const targets = sp.tetherTargets && sp.tetherTargets.length > 0 ? sp.tetherTargets : this.actors;
          for (const a of targets) {
            if (a.alive && a.team === 'red' && Math.hypot(a.x - sp.cx, a.z - sp.cz) <= 10.5) {
              a.x = sp.cx + (a.x - sp.cx) * 0.25;
              a.z = sp.cz + (a.z - sp.cz) * 0.25;
              a.mesh.position.set(a.x, 0, a.z);
              a.stunTimer = Math.max(a.stunTimer, 1.1);
              this.damageEnemyActor(a, sp.baseDmg, true, 'magic');
            }
          }
        }
      }

      if (sp.life <= 0) {
        disposeObjectTree(sp.group);
        this.three.scene.remove(sp.group);
        this.activeUltSetpieces.splice(i, 1);
      }
    }

    // Minion Waves (Exact MLBB: 0:10 first wave, every 30s in Classic/Ranked, faster in Brawl)
    this.waveTimer -= dt;
    if (this.waveTimer <= 0) {
      this.waveTimer = this.mobaMode === 'brawl' ? 12.0 : MLBB_TIMERS.WAVE_INTERVAL_SEC;
      let aliveCount = 0;
      for (const a of this.actors) {
        if (a.alive) aliveCount++;
      }
      if (aliveCount < 32) {
        this.spawnMinionWave();
      }
    }

    // Jungle Camps, 3-Stage Lord Evolution, Leash Perimeter Ring & Patience Bar
    for (const jc of this.jungleCamps) {
      // Turtle -> 3-Stage Lord Transformation (8:00 Neutral / 12:00 Enhanced / 18:00 Evolved)
      if (jc.id === 'river_boss') {
        if (jc.campKind === 'turtle' && jc.alive && shouldTurtleDissipate(this.matchElapsed, jc.outOfCombatSec)) {
          jc.alive = false;
          jc.aggroed = false;
          jc.mesh.visible = false;
          jc.ringMesh.visible = false;
          if (jc.leashMesh) jc.leashMesh.visible = false;
          this.bossPhase = 'lord';
          jc.respawnTimer = 2.0;
          this.showKillfeed('✨ 08:00 — River Turtle Dissipated! The Sovereign Lord is Awakening!');
        }
        if (clock.lordStage >= 1 && (this.bossPhase !== 'lord' || jc.campKind !== 'lord' || (jc.lordStage ?? 0) < clock.lordStage)) {
          if (!jc.alive || jc.campKind === 'lord') {
            this.bossPhase = 'lord';
            const nextStage = clock.lordStage as 1 | 2 | 3;
            const stageChanged = (jc.lordStage ?? 0) !== nextStage || jc.campKind !== 'lord';
            if (stageChanged) {
              jc.campKind = 'lord';
              jc.lordStage = nextStage;
              jc.icon = '🐉';
              jc.label =
                nextStage === 3
                  ? 'Evolved Lord (Stage 3)'
                  : nextStage === 2
                    ? 'Enhanced Lord (Stage 2)'
                    : 'Neutral Lord (Stage 1)';
              jc.colorNum = nextStage === 3 ? 0xa855f7 : nextStage === 2 ? 0xf59e0b : 0xfacc15;
              jc.colorHex = nextStage === 3 ? '#c084fc' : nextStage === 2 ? '#fbbf24' : '#fde047';
              jc.maxHp = nextStage === 3 ? 1150 : nextStage === 2 ? 880 : 650;
              jc.hp = jc.alive ? Math.max(jc.hp, Math.round(jc.maxHp * 0.85)) : jc.maxHp;
              jc.atk = nextStage === 3 ? 34 : nextStage === 2 ? 28 : 22;
              jc.respawnDelay = clock.lordRespawnSec;
              const newMesh = this.createCampMesh('lord', nextStage === 3 ? 2.25 : nextStage === 2 ? 2.1 : 1.95, jc.colorNum);
              newMesh.position.set(jc.x, 0, jc.z);
              newMesh.visible = jc.alive;
              disposeObjectTree(jc.mesh);
              this.three.scene.remove(jc.mesh);
              jc.mesh = newMesh;
              this.three.scene.add(newMesh);
            }
          }
        }
      }

      if (!jc.alive) {
        jc.respawnTimer -= dt;
        if (jc.respawnTimer <= 0) {
          jc.alive = true;
          jc.aggroed = false;
          jc.patience = 100;
          jc.outOfCombatSec = 99;
          jc.hp = jc.maxHp;
          jc.x = jc.homeX;
          jc.z = jc.homeZ;
          jc.mesh.position.set(jc.x, 0, jc.z);
          jc.mesh.visible = true;
          jc.ringMesh.visible = true;
          if (jc.campKind === 'blue_buff') {
            this.setPurpleShortcutOpen(jc.id, false);
            this.showKillfeed(`${jc.icon} ${jc.label} has spawned!`);
          } else if (jc.campKind === 'red_buff') {
            this.showKillfeed(`${jc.icon} ${jc.label} has spawned!`);
          } else if (jc.campKind === 'turtle') {
            this.showKillfeed('🐢 THE RIVER TURTLE HAS SPAWNED!');
          } else if (jc.campKind === 'lord') {
            this.showKillfeed(`🐉 ${jc.label.toUpperCase()} HAS AWAKENED IN THE RIVER PIT!`);
          }
        }
        continue;
      }

      jc.outOfCombatSec += dt;
      if (jc.mesh.children[1]) {
        jc.mesh.children[1].rotation.y += dt * 1.9;
      }
      if (jc.leashMesh) {
        jc.leashMesh.visible = jc.aggroed;
      }
      jc.stunTimer = Math.max(0, jc.stunTimer - dt);
      jc.cd = Math.max(0, jc.cd - dt);
      if (jc.stunTimer > 0) continue;

      const dp = Math.hypot(this.px - jc.x, this.pz - jc.z);
      const distHome = Math.hypot(jc.x - jc.homeX, jc.z - jc.homeZ);
      const playerFromHome = Math.hypot(this.px - jc.homeX, this.pz - jc.homeZ);

      if (jc.aggroed) {
        // Drain patience if dragged outside leash perimeter ring or hero leaves camp
        if (distHome > jc.leashRadius || playerFromHome > jc.leashRadius + 1.5) {
          jc.patience = Math.max(0, jc.patience - 30 * dt);
        } else {
          jc.patience = Math.min(100, jc.patience + 18 * dt);
        }

        if (jc.patience <= 0) {
          // Reset creep & heal rapidly to 100%
          jc.aggroed = false;
          jc.patience = 100;
          jc.hp = jc.maxHp;
          jc.x = jc.homeX;
          jc.z = jc.homeZ;
          jc.mesh.position.set(jc.x, 0, jc.z);
          if (jc.leashMesh) jc.leashMesh.visible = false;
          this.spawnDamageNumber(jc.x, jc.z, jc.maxHp, 'heal');
          continue;
        }

        if (dp < 3.8) {
          if (jc.cd <= 0) {
            jc.cd = 1.2;
            this.applyPlayerDamage(jc.atk);
          }
        } else if (distHome <= jc.leashRadius + 1.2) {
          const dx = this.px - jc.x;
          const dz = this.pz - jc.z;
          const d = Math.hypot(dx, dz) || 1;
          jc.x += (dx / d) * 3.8 * dt;
          jc.z += (dz / d) * 3.8 * dt;
          jc.mesh.position.set(jc.x, 0, jc.z);
          jc.mesh.rotation.y = Math.atan2(dx, dz);
        }
      } else if (distHome > 0.6) {
        const dx = jc.homeX - jc.x;
        const dz = jc.homeZ - jc.z;
        const d = Math.hypot(dx, dz) || 1;
        jc.x += (dx / d) * 5.4 * dt;
        jc.z += (dz / d) * 5.4 * dt;
        jc.mesh.position.set(jc.x, 0, jc.z);
        jc.hp = Math.min(jc.maxHp, jc.hp + Math.max(1, Math.round(jc.maxHp * 0.25 * dt)));
      }
    }

    // Stage 3 Evolved Lord Summoned Aura: empowers nearby allies with Magic DMG pulse every 2s
    const alliedLord = this.actors.find((a) => a.alive && a.kind === 'lord' && a.team === 'blue');
    if (alliedLord && clock.lordStage >= 3) {
      this.lordAuraTickAcc += dt;
      if (this.lordAuraTickAcc >= 2.0) {
        this.lordAuraTickAcc -= 2.0;
        if (Math.hypot(this.px - alliedLord.x, this.pz - alliedLord.z) <= 18) {
          for (const e of this.actors) {
            if (e.alive && e.team === 'red' && Math.hypot(e.x - this.px, e.z - this.pz) <= 10) {
              this.damageEnemyActor(e, 38 + this.heroLevel * 4, true, 'magic');
            }
          }
        }
      }
    }

    // Actors (Heroes, Minions, Allied Lord, Summons) + Full CC & Airborne Arc Physics
    let lockedTargetObj: MobaActor | null = null;
    for (let i = this.actors.length - 1; i >= 0; i--) {
      const a = this.actors[i];
      if (a.lifeTimer > 0) {
        a.lifeTimer -= dt;
        if (a.lifeTimer <= 0) {
          disposeObjectTree(a.mesh);
          this.three.scene.remove(a.mesh);
          this.actors.splice(i, 1);
          continue;
        }
      }
      if (!a.alive) {
        if (a.kind === 'hero' && a.respawnTimer > 0) {
          a.respawnTimer -= dt;
          if (a.respawnTimer <= 0) {
            a.alive = true;
            a.hp = a.maxHp;
            a.x = a.spawnX;
            a.z = a.spawnZ;
            a.mesh.position.set(a.x, 0, a.z);
            a.mesh.visible = true;
          }
        }
        continue;
      }

      if (a.id === this.lockedEnemyId && a.team === 'red') {
        lockedTargetObj = a;
      }

      a.stunTimer = Math.max(0, a.stunTimer - dt);
      a.rootTimer = Math.max(0, a.rootTimer - dt);
      a.silenceTimer = Math.max(0, a.silenceTimer - dt);
      a.fearTimer = Math.max(0, a.fearTimer - dt);
      a.tauntTimer = Math.max(0, a.tauntTimer - dt);
      a.slowTimer = Math.max(0, a.slowTimer - dt);
      a.cd = Math.max(0, a.cd - dt);
      if (a.emoteAiCd && a.emoteAiCd > 0) {
        a.emoteAiCd = Math.max(0, a.emoteAiCd - dt);
      }
      if (a.activeEmoteTimer && a.activeEmoteTimer > 0) {
        a.activeEmoteTimer = Math.max(0, a.activeEmoteTimer - dt);
        if (a.activeEmoteTimer <= 0) a.activeEmoteId = undefined;
      }

      // Persistent 3D Elemental Target Status Effect & Burn/Bleed/Curse DoT Ticks
      if (a.statusTimer && a.statusTimer > 0) {
        a.statusTimer = Math.max(0, a.statusTimer - dt);
        if (a.statusFxGroup && a.statusKind) {
          animateElementalStatusMesh(a.statusFxGroup, a.statusKind, this.matchElapsed, dt);
        }
        if (a.statusDps && a.statusDps > 0 && a.team === 'red') {
          a.statusTickAcc = (a.statusTickAcc ?? 0) + dt;
          if (a.statusTickAcc >= 0.65) {
            a.statusTickAcc -= 0.65;
            this.damageEnemyActor(a, Math.max(4, Math.round(a.statusDps * 0.65)), true, 'magic');
            if (!a.alive) {
              if (a.statusFxGroup) {
                disposeObjectTree(a.statusFxGroup);
                a.mesh.remove(a.statusFxGroup);
                a.statusFxGroup = undefined;
              }
              a.statusTimer = 0;
              a.statusDps = 0;
              continue;
            }
          }
        }
        if (a.statusTimer <= 0) {
          a.statusDps = 0;
          a.statusKind = undefined;
          if (a.statusFxGroup) {
            disposeObjectTree(a.statusFxGroup);
            a.mesh.remove(a.statusFxGroup);
            a.statusFxGroup = undefined;
          }
        }
      }

      if (a.airborneTimer > 0) {
        a.airborneTimer = Math.max(0, a.airborneTimer - dt);
        const prog = 1 - a.airborneTimer / Math.max(0.05, a.airborneDur);
        const arcY = 4 * a.airbornePeak * prog * (1 - prog);
        a.mesh.position.set(a.x, Math.max(0, arcY), a.z);
        continue;
      } else if (a.mesh.position.y > 0.01) {
        a.mesh.position.y = 0;
      }

      if (a.stunTimer > 0) continue;

      // Fear CC: force enemy to flee away from player
      if (a.fearTimer > 0 && a.team === 'red') {
        const dx = a.x - this.px;
        const dz = a.z - this.pz;
        const d = Math.hypot(dx, dz) || 1;
        a.x = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, a.x + (dx / d) * 5.2 * dt));
        a.z = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, a.z + (dz / d) * 5.2 * dt));
        a.mesh.position.set(a.x, 0, a.z);
        a.mesh.rotation.y = Math.atan2(dx, dz);
        continue;
      }

      const defaultTargetX = a.team === 'blue' ? RED_BASE_X : a.kind === 'hero' ? this.px : BLUE_BASE_X;
      const defaultTargetZ = a.team === 'blue' ? RED_BASE_Z : a.kind === 'hero' ? this.pz : BLUE_BASE_Z;

      let nearDist = 999;
      let tx = defaultTargetX;
      let tz = defaultTargetZ;
      let hitTarget: MobaActor | null = null;
      let hitTurret: TurretObj | null = null;

      // Taunt forces enemy to walk directly toward player
      if (a.tauntTimer > 0 && a.team === 'red') {
        nearDist = Math.hypot(this.px - a.x, this.pz - a.z);
        tx = this.px;
        tz = this.pz;
      } else {
        if (a.team === 'red' && this.stealthTimer <= 0 && this.frozenTimer <= 0 && this.untargetableTimer <= 0) {
          const dp = Math.hypot(this.px - a.x, this.pz - a.z);
          if (dp < (isBushStealthed ? 5.5 : 16)) {
            nearDist = dp;
            tx = this.px;
            tz = this.pz;
          }
        }

        for (const other of this.actors) {
          if (!other.alive || other.team === a.team) continue;
          const d = Math.hypot(other.x - a.x, other.z - a.z);
          if (d < 16 && d < nearDist) {
            nearDist = d;
            tx = other.x;
            tz = other.z;
            hitTarget = other;
            hitTurret = null;
          }
        }
        for (const t of this.turrets) {
          if (!t.alive || t.team === a.team) continue;
          const d = Math.hypot(t.x - a.x, t.z - a.z);
          if (d < 14 && d < nearDist) {
            nearDist = d;
            tx = t.x;
            tz = t.z;
            hitTurret = t;
            hitTarget = null;
          }
        }
      }

      const strikeRange = a.kind === 'summon_turret' ? 12.5 : a.kind === 'lord' ? 5.2 : 4.0;
      if (nearDist < strikeRange) {
        if (a.cd <= 0 && a.silenceTimer <= 0) {
          a.cd = a.kind === 'summon_turret' ? 0.65 : 1.0;
          if (hitTarget && hitTarget.alive) {
            if (hitTarget.team === 'red') this.damageEnemyActor(hitTarget, a.atk, a.kind.startsWith('summon_'), 'phys');
            else {
              let incoming = a.atk;
              // Stage 3 Evolved Lord Summoned Aura: 5% DR per nearby allied hero (max 25%)
              if (hitTarget.kind === 'lord' && clock.lordStage >= 3) {
                let nearbyAllies = Math.hypot(this.px - hitTarget.x, this.pz - hitTarget.z) <= 16 ? 1 : 0;
                for (const ally of this.actors) {
                  if (ally.alive && ally.team === 'blue' && ally.kind === 'hero' && Math.hypot(ally.x - hitTarget.x, ally.z - hitTarget.z) <= 16) {
                    nearbyAllies++;
                  }
                }
                incoming = Math.max(1, Math.round(incoming * (1 - computeEvolvedLordSummonedDr(nearbyAllies))));
              }
              hitTarget.hp -= incoming;
              if (hitTarget.hp <= 0) {
                hitTarget.alive = false;
                hitTarget.mesh.visible = false;
                if (hitTarget.kind === 'hero') {
                  hitTarget.respawnTimer = 10.0;
                  if (a.kind === 'hero') this.triggerActorAiEmote(a, 'kill');
                }
              } else if (hitTarget.kind === 'hero' && hitTarget.hp <= hitTarget.maxHp * 0.3) {
                this.triggerActorAiEmote(hitTarget, 'low_hp');
              }
            }
          } else if (hitTurret && hitTurret.alive) {
            this.damageTurret(hitTurret, a.atk * (a.kind === 'lord' ? 1.8 : 0.85), a.kind === 'lord');
          } else if (a.team === 'red' && Math.hypot(this.px - a.x, this.pz - a.z) < 4.5) {
            this.applyPlayerDamage(a.atk, a);
            // Blade Armor (Bladed Armor: reflect damage back to attacker)
            if (this.equippedItemIds.includes('blade_armor')) {
              this.damageEnemyActor(a, Math.max(4, Math.round(this.computedStats.physDef * 0.25)), true, 'phys');
            }
          }
        }
      } else if (a.kind !== 'summon_turret' && a.rootTimer <= 0) {
        const dx = tx - a.x;
        const dz = tz - a.z;
        const d = Math.hypot(dx, dz) || 1;
        const slowMult = a.slowTimer > 0 ? 0.55 : 1.0;
        const minionLateBoost = a.kind === 'minion' && clock.minionSpeedBoostActive ? 1.28 : 1.0;
        const baseSpd = a.kind === 'hero' ? 6.2 : a.kind === 'lord' ? 5.0 : a.kind === 'summon_clone' ? 8.5 : 4.4 * minionLateBoost;
        const spd = baseSpd * slowMult * dt;
        a.x = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, a.x + (dx / d) * spd));
        a.z = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, a.z + (dz / d) * spd));
        a.mesh.position.set(a.x, 0, a.z);
        a.mesh.rotation.y = Math.atan2(dx, dz);
      }
    }

    // Hero Lock Ground Reticle Ring
    if (lockedTargetObj) {
      this.lockedReticleMesh.visible = true;
      this.lockedReticleMesh.position.set(lockedTargetObj.x, 0.22, lockedTargetObj.z);
      this.lockedReticleMesh.rotation.z += dt * 3.0;
    } else {
      this.lockedReticleMesh.visible = false;
    }

    // Turrets
    for (const t of this.turrets) {
      if (!t.alive) continue;
      t.mesh.children[1].rotation.y += dt * 1.8;
      t.cd = Math.max(0, t.cd - dt);
      if (t.cd <= 0) {
        let tgtX = 0;
        let tgtZ = 0;
        let found = false;
        if (
          t.team === 'red' &&
          this.stealthTimer <= 0 &&
          this.frozenTimer <= 0 &&
          this.untargetableTimer <= 0 &&
          Math.hypot(this.px - t.x, this.pz - t.z) < 14
        ) {
          tgtX = this.px;
          tgtZ = this.pz;
          found = true;
        } else {
          for (const a of this.actors) {
            if (a.alive && a.team !== t.team && Math.hypot(a.x - t.x, a.z - t.z) < 14) {
              tgtX = a.x;
              tgtZ = a.z;
              found = true;
              break;
            }
          }
        }
        if (found) {
          t.cd = 1.25;
          const dx = tgtX - t.x;
          const dz = tgtZ - t.z;
          const d = Math.hypot(dx, dz) || 1;
          const m = new THREE.Mesh(this.boltGeo, t.team === 'blue' ? this.blueBoltMat : this.redBoltMat);
          m.position.set(t.x, 4.8, t.z);
          this.three.scene.add(m);
          this.bolts.push({
            mesh: m,
            x: t.x,
            z: t.z,
            vx: (dx / d) * 28,
            vz: (dz / d) * 28,
            team: t.team,
            dmg: 20,
            life: 1.0,
            isSharedMesh: true
          });
        }
      }
    }

    // Projectiles (with Flameshot distance damage scaling & Elemental Impacts)
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const b = this.bolts[i];
      b.life -= dt;
      b.x += b.vx * dt;
      b.z += b.vz * dt;
      b.mesh.position.set(b.x, 1.85, b.z);
      if (b.elementTheme === 'wind' || b.elementTheme === 'blood' || b.elementTheme === 'earth') {
        b.mesh.rotation.z += dt * 10;
      }
      let dead = b.life <= 0;
      if (!dead && b.team === 'red' && Math.hypot(b.x - this.px, b.z - this.pz) < 1.5) {
        dead = true;
        this.applyPlayerDamage(b.dmg);
      } else if (!dead && b.team === 'blue') {
        for (const a of this.actors) {
          if (a.alive && a.team === 'red' && Math.hypot(b.x - a.x, b.z - a.z) < 2.0) {
            dead = true;
            if (b.slowSec && b.slowSec > 0) a.slowTimer = Math.max(a.slowTimer, b.slowSec);
            let finalBoltDmg = b.dmg;
            if (b.isFlameshot && b.startX !== undefined && b.startZ !== undefined) {
              const travel = Math.hypot(b.x - b.startX, b.z - b.startZ);
              finalBoltDmg = Math.round(b.dmg * (1 + Math.min(1.0, travel / 35)));
              this.spawnElementalVfx('fire', 'flame_wave', a.x, a.z, 5.2, this.pYaw);
            } else if (b.elementTheme && b.elementTheme !== 'steel') {
              this.spawnElementalVfx(b.elementTheme, 'ring', a.x, a.z, 3.0, this.pYaw);
            }
            if (b.elementTheme) {
              this.applyElementalStatusToActor(a, b.elementTheme, 'none', finalBoltDmg);
            }
            this.damageEnemyActor(a, finalBoltDmg, true, b.isFlameshot ? 'magic' : 'phys');
            break;
          }
        }
        if (!dead) {
          for (const jc of this.jungleCamps) {
            if (jc.alive && Math.hypot(b.x - jc.x, b.z - jc.z) < 2.4) {
              dead = true;
              if (b.elementTheme && b.elementTheme !== 'steel') {
                this.spawnElementalVfx(b.elementTheme, 'ring', jc.x, jc.z, 3.2, this.pYaw);
              }
              this.damageJungleCamp(jc, b.dmg);
              break;
            }
          }
        }
        if (!dead) {
          for (const t of this.turrets) {
            if (t.alive && t.team === 'red' && Math.hypot(b.x - t.x, b.z - t.z) < 2.6) {
              dead = true;
              this.damageTurret(t, b.dmg);
              break;
            }
          }
        }
      }
      if (dead) {
        if (!b.isSharedMesh) {
          disposeObjectTree(b.mesh);
        }
        this.three.scene.remove(b.mesh);
        this.bolts.splice(i, 1);
      }
    }

    // 3D VFX Animation & Ghost Afterimage Fade
    for (let i = this.fxObjs.length - 1; i >= 0; i--) {
      const fx = this.fxObjs[i];
      fx.life -= dt;
      if (fx.mode === 'elemental' && fx.elemAnim) {
        const progress = 1 - Math.max(0, fx.life) / Math.max(0.05, fx.maxLife);
        animateElementalVfx(fx.mesh as THREE.Group, fx.elemAnim, progress, dt);
      } else if (fx.mode === 'ring') {
        fx.mesh.scale.addScalar(dt * 2.2);
      } else if (fx.mode === 'pillar') {
        fx.mesh.scale.x += dt * 1.4;
        fx.mesh.scale.z += dt * 1.4;
      } else if (fx.mode === 'dome') {
        fx.mesh.rotation.y += dt * 3.0;
        fx.mesh.scale.addScalar(dt * 0.8);
      } else if (fx.mode === 'emote_burst') {
        const ratio = Math.max(0, fx.life / Math.max(0.05, fx.maxLife));
        fx.mesh.children.forEach((child) => {
          const m = child as THREE.Mesh;
          if (m.userData.isEmoteRing) {
            m.scale.addScalar(dt * 2.4);
            if (m.material && 'opacity' in m.material) {
              (m.material as THREE.MeshBasicMaterial).opacity = ratio * 0.85;
            }
          } else if (m.userData.isEmoteSparkle) {
            const ang = (m.userData.angle as number) ?? 0;
            const rise = (m.userData.riseSpeed as number) ?? 2.8;
            m.position.y += dt * rise;
            m.position.x += Math.cos(ang) * dt * 1.1;
            m.position.z += Math.sin(ang) * dt * 1.1;
            m.rotation.y += dt * 5.2;
            m.rotation.x += dt * 3.4;
            m.scale.setScalar(Math.max(0.25, ratio * 1.1));
            if (m.material && 'opacity' in m.material) {
              (m.material as THREE.MeshBasicMaterial).opacity = ratio;
            }
          }
        });
      } else if (fx.mode === 'ghost') {
        const ratio = Math.max(0, fx.life / Math.max(0.05, fx.maxLife));
        fx.mesh.traverse((obj) => {
          const m = obj as THREE.Mesh;
          if (m.isMesh && m.material && 'opacity' in m.material) {
            (m.material as THREE.MeshBasicMaterial).opacity = ratio * 0.45;
          }
        });
      }
      if (fx.life <= 0) {
        disposeObjectTree(fx.mesh);
        this.three.scene.remove(fx.mesh);
        this.fxObjs.splice(i, 1);
      }
    }

    // Floating Damage Numbers Drift
    for (let i = this.floatingDmgNums.length - 1; i >= 0; i--) {
      const d = this.floatingDmgNums[i];
      d.life -= dt;
      d.wy += dt * 2.8;
      if (d.life <= 0) this.floatingDmgNums.splice(i, 1);
    }

    // Ground Aiming Telegraph Sync
    this.syncTelegraphTransform();

    // Smoothly Damped Camera Follow (respecting Low / Medium / High Camera Height + Shake)
    const camOff = this.getCameraOffsets();
    const shakeX = this.cameraShake > 0 ? (Math.random() - 0.5) * this.cameraShake * 1.6 : 0;
    const shakeZ = this.cameraShake > 0 ? (Math.random() - 0.5) * this.cameraShake * 1.6 : 0;
    _mobaDesired.set(this.px + camOff.dx + shakeX, camOff.y, this.pz + camOff.dz + shakeZ);
    this.three.camera.position.lerp(_mobaDesired, 1 - Math.exp(-10 * dt));
    _mobaLook.set(this.px + 2.6, 0.9, this.pz - 2.6);
    this.three.camera.lookAt(_mobaLook);

    this.hudSyncTimer -= dt;
    if (this.hudSyncTimer <= 0) {
      this.hudSyncTimer = 0.1;
      this.pushMobaHudSnapshot();
    }
  }

  protected endMatch(victory: boolean): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.isRunning = false;
    for (const sp of this.healingSprings) {
      disposeObjectTree(sp.mesh);
      this.three.scene.remove(sp.mesh);
    }
    this.healingSprings = [];
    for (const up of this.activeUltSetpieces) {
      disposeObjectTree(up.group);
      this.three.scene.remove(up.group);
    }
    this.activeUltSetpieces = [];

    recordMobaMatchResult({
      heroId: this.heroDef.id,
      heroName: this.heroDef.name,
      mode: this.mobaMode,
      victory,
      kills: this.kills,
      deaths: this.deaths,
      gold: Math.round(this.gold),
      score: this.score,
      durationSec: Math.round(this.matchElapsed),
      items: [...this.equippedItemIds]
    });

    updateMobaHud(null);
    triggerGameOver(this.score, playerState.sessionCoins, this.level, this.gameIdx, victory);
  }

  protected projectToOverlay(wx: number, wy: number, wz: number, w: number, h: number): { sx: number; sy: number } | null {
    _mobaProj.set(wx, wy, wz);
    _mobaProj.project(this.three.camera);
    if (_mobaProj.z < -1 || _mobaProj.z > 1) return null;
    const sx = (_mobaProj.x * 0.5 + 0.5) * w;
    const sy = (-_mobaProj.y * 0.5 + 0.5) * h;
    if (sx < -40 || sx > w + 40 || sy < 40 || sy > h - 30) return null;
    return { sx, sy };
  }

  protected updateAllHealthTrails(dt: number): void {
    // Player overhead bar delayed catch-up trail
    if (this.lives !== this.playerLastHp) {
      const trig = triggerHealthTrailDamage(this.playerLastHp, this.lives, this.playerTrailHp, this.playerTrailHold);
      this.playerTrailHp = trig.trailHp;
      this.playerTrailHold = trig.holdSec;
      this.playerLastHp = this.lives;
    }
    const pStep = stepHealthTrail(this.lives, this.maxLives, this.playerTrailHp, this.playerTrailHold, dt);
    this.playerTrailHp = pStep.trailHp;
    this.playerTrailHold = pStep.holdSec;

    // Actors (Heroes, Minions, Summons, Lord)
    for (const a of this.actors) {
      if (!a.alive) {
        a.trailHp = 0;
        a.trailHold = 0;
        a.lastHp = 0;
        continue;
      }
      if (a.trailHp === undefined || a.lastHp === undefined) {
        a.trailHp = a.hp;
        a.lastHp = a.hp;
        a.trailHold = 0;
      } else if (a.hp !== a.lastHp) {
        const trig = triggerHealthTrailDamage(a.lastHp, a.hp, a.trailHp, a.trailHold ?? 0);
        a.trailHp = trig.trailHp;
        a.trailHold = trig.holdSec;
        a.lastHp = a.hp;
      }
      const st = stepHealthTrail(a.hp, a.maxHp, a.trailHp, a.trailHold ?? 0, dt);
      a.trailHp = st.trailHp;
      a.trailHold = st.holdSec;
    }

    // Jungle Camps, Turtle & Lord
    for (const jc of this.jungleCamps) {
      if (!jc.alive) {
        jc.trailHp = jc.maxHp;
        jc.lastHp = jc.maxHp;
        jc.trailHold = 0;
        continue;
      }
      if (jc.trailHp === undefined || jc.lastHp === undefined) {
        jc.trailHp = jc.hp;
        jc.lastHp = jc.hp;
        jc.trailHold = 0;
      } else if (jc.hp !== jc.lastHp) {
        const trig = triggerHealthTrailDamage(jc.lastHp, jc.hp, jc.trailHp, jc.trailHold ?? 0);
        jc.trailHp = trig.trailHp;
        jc.trailHold = trig.holdSec;
        jc.lastHp = jc.hp;
      }
      const st = stepHealthTrail(jc.hp, jc.maxHp, jc.trailHp, jc.trailHold ?? 0, dt);
      jc.trailHp = st.trailHp;
      jc.trailHold = st.holdSec;
    }

    // Turrets & Nexus Cores
    for (const t of this.turrets) {
      if (!t.alive) continue;
      if (t.trailHp === undefined || t.lastHp === undefined) {
        t.trailHp = t.hp;
        t.lastHp = t.hp;
        t.trailHold = 0;
      } else if (t.hp !== t.lastHp) {
        const trig = triggerHealthTrailDamage(t.lastHp, t.hp, t.trailHp, t.trailHold ?? 0);
        t.trailHp = trig.trailHp;
        t.trailHold = trig.holdSec;
        t.lastHp = t.hp;
      }
      const st = stepHealthTrail(t.hp, t.maxHp, t.trailHp, t.trailHold ?? 0, dt);
      t.trailHp = st.trailHp;
      t.trailHold = st.holdSec;
    }
  }

  protected drawFloatingBar(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    barW: number,
    barH: number,
    hp: number,
    maxHp: number,
    fillColor: string,
    label?: string,
    subBadge?: string,
    shieldActive = false,
    trailHp?: number
  ): void {
    const pct = Math.max(0, Math.min(1, hp / Math.max(1, maxHp)));
    const trailPct =
      trailHp !== undefined && trailHp > hp + 0.5
        ? Math.max(pct, Math.min(1, trailHp / Math.max(1, maxHp)))
        : pct;
    const x = Math.round(sx - barW / 2);
    const y = Math.round(sy - barH / 2);

    if (label) {
      ctx.font = '800 9.5px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
      ctx.fillText(label, sx + 1, y - 3);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(label, sx, y - 4);
    }

    ctx.fillStyle = 'rgba(9, 13, 22, 0.9)';
    ctx.fillRect(x - 1, y - 1, barW + 2, barH + 2);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y, barW, barH);

    // Delayed catch-up damage trail behind live HP fill
    if (trailPct > pct + 0.005) {
      const fillW = Math.round(barW * pct);
      const trailW = Math.max(fillW + 1, Math.round(barW * trailPct));
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + fillW, y, Math.max(1, trailW - fillW), barH);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.72)';
      ctx.fillRect(x + fillW, y + Math.floor(barH * 0.45), Math.max(1, trailW - fillW), Math.ceil(barH * 0.55));
    }

    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, hp > 0 ? Math.max(1, Math.round(barW * pct)) : 0, barH);

    if (shieldActive) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x + Math.round(barW * pct * 0.78), y, Math.max(4, Math.round(barW * 0.22)), barH);
    }

    // Segment ticks for larger bars
    if (barW >= 46) {
      ctx.fillStyle = 'rgba(9, 13, 22, 0.55)';
      const segs = 4;
      for (let i = 1; i < segs; i++) {
        ctx.fillRect(x + Math.round((barW * i) / segs), y, 1, barH);
      }
    }

    if (subBadge) {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(x - 16, y - 2, 14, barH + 4);
      ctx.strokeStyle = fillColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 16, y - 2, 14, barH + 4);
      ctx.fillStyle = '#facc15';
      ctx.font = '900 8px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(subBadge, x - 9, y + barH - 0.5);
    }
  }

  protected drawCcCue(ctx: CanvasRenderingContext2D, sx: number, sy: number, text: string, color: string): void {
    ctx.font = '900 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(9, 13, 22, 0.9)';
    ctx.fillText(text, sx + 1, sy + 1);
    ctx.fillStyle = color;
    ctx.fillText(text, sx, sy);
  }

  protected drawEmoteBubble(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    emote: MobaEmoteDef,
    remainingSec: number,
    maxSec: number
  ): void {
    const elapsed = Math.max(0, maxSec - remainingSec);
    // Crisp bounce-in over first 0.2s, smooth fade-out over final 0.35s
    const popScale =
      elapsed < 0.14
        ? 0.45 + (elapsed / 0.14) * 0.67
        : elapsed < 0.24
          ? 1.12 - ((elapsed - 0.14) / 0.1) * 0.12
          : 1.0;
    const alpha = remainingSec < 0.35 ? Math.max(0, remainingSec / 0.35) : 1.0;
    const floatY = Math.sin(elapsed * 5.0) * 2.2;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(sx, sy + floatY);
    ctx.scale(popScale, popScale);

    const text = `${emote.icon} ${emote.callout}`;
    ctx.font = '900 11px system-ui, sans-serif';
    const textW = ctx.measureText(text).width;
    const padX = 11;
    const boxW = Math.max(58, Math.round(textW + padX * 2));
    const boxH = 26;
    const bx = -boxW / 2;
    const by = -boxH - 8;

    // Grounded drop shadow
    ctx.fillStyle = 'rgba(4, 7, 14, 0.72)';
    ctx.beginPath();
    ctx.roundRect(bx + 2, by + 3, boxW, boxH, 9);
    ctx.fill();

    // Speech bubble body
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 9);
    ctx.fill();
    ctx.strokeStyle = emote.colorHex;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pointer triangle tail
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.moveTo(-5, by + boxH - 1);
    ctx.lineTo(5, by + boxH - 1);
    ctx.lineTo(0, by + boxH + 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = emote.colorHex;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-5, by + boxH);
    ctx.lineTo(0, by + boxH + 6);
    ctx.lineTo(5, by + boxH);
    ctx.stroke();

    // Emote icon + callout label
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, by + boxH / 2 + 0.5);
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }

  protected drawOverlayHud(): void {
    const ctx = this.three.overlayCtx;
    if (!ctx) return;
    const w = this.three.width;
    const h = this.three.height;
    ctx.clearRect(0, 0, w, h);

    // 1. Floating Overhead Health Bars for EVERY Unit on the Battlefield
    // 1a. Turrets & Nexus Cores
    for (const t of this.turrets) {
      if (!t.alive) continue;
      if (Math.hypot(t.x - this.px, t.z - this.pz) > 48) continue;
      const proj = this.projectToOverlay(t.x, t.isNexus ? 8.2 : 6.4, t.z, w, h);
      if (!proj) continue;
      this.drawFloatingBar(
        ctx,
        proj.sx,
        proj.sy,
        t.isNexus ? 66 : 44,
        t.isNexus ? 6 : 5,
        t.hp,
        t.maxHp,
        t.team === 'blue' ? '#38bdf8' : '#f43f5e',
        t.isNexus ? (t.team === 'blue' ? 'BLUE NEXUS' : 'RED NEXUS') : undefined,
        undefined,
        false,
        t.trailHp
      );
    }

    // 1b. Jungle Creeps, Purple/Orange Buffs, Turtle & Lord + Retribution Execute Line + Patience Bar
    const hasRetri = this.spellDef.id === 'retribution';
    const retriDmg = hasRetri ? computeRetributionDamage(this.heroLevel, this.junglerStacks >= 5) : 0;
    for (const jc of this.jungleCamps) {
      if (!jc.alive) continue;
      if (Math.hypot(jc.x - this.px, jc.z - this.pz) > 46) continue;
      const isBoss = jc.campKind === 'lord' || jc.campKind === 'turtle';
      const isBuff = jc.campKind === 'blue_buff' || jc.campKind === 'red_buff';
      const yOff = jc.campKind === 'lord' ? 5.6 : isBuff || jc.campKind === 'turtle' ? 4.4 : 3.2;
      const proj = this.projectToOverlay(jc.x, yOff, jc.z, w, h);
      if (!proj) continue;
      const barW = isBoss ? 72 : isBuff ? 58 : 42;
      const barH = isBoss ? 7 : 5;
      this.drawFloatingBar(
        ctx,
        proj.sx,
        proj.sy,
        barW,
        barH,
        jc.hp,
        jc.maxHp,
        jc.colorHex,
        `${jc.icon} ${jc.label} (${jc.hp})`,
        undefined,
        false,
        jc.trailHp
      );

      // Red Retribution Execute Threshold Line on Buffs, Turtle, and Lord HP Bars
      if (hasRetri && (isBoss || isBuff)) {
        const retriRatio = Math.max(0.06, Math.min(0.95, retriDmg / Math.max(1, jc.maxHp)));
        const bx = Math.round(proj.sx - barW / 2 + barW * retriRatio);
        const by = Math.round(proj.sy - barH / 2);
        ctx.fillStyle = jc.hp <= retriDmg ? '#ef4444' : '#f87171';
        ctx.fillRect(bx - 1, by - 2, 2.5, barH + 4);
      }

      // White/Yellow Patience Bar below aggroed Jungle Camp HP Bar
      if (jc.aggroed && jc.patience < 99.5) {
        const px0 = Math.round(proj.sx - barW / 2);
        const py0 = Math.round(proj.sy + barH / 2 + 3);
        ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
        ctx.fillRect(px0 - 1, py0 - 1, barW + 2, 4);
        ctx.fillStyle = jc.patience < 35 ? '#facc15' : '#f8fafc';
        ctx.fillRect(px0, py0, Math.max(1, Math.round(barW * (jc.patience / 100))), 2.5);
      }
    }

    // 1c. All Lane Minions, Summons, Allied Lord, and Allied/Enemy Heroes + Overhead CC & Elemental Status Cues
    for (const a of this.actors) {
      if (!a.alive) continue;
      if (Math.hypot(a.x - this.px, a.z - this.pz) > 48) continue;
      const isHero = a.kind === 'hero';
      const isLord = a.kind === 'lord';
      const yOff = isLord ? 5.4 : isHero ? 3.8 : 2.5;
      const proj = this.projectToOverlay(a.x, yOff + a.mesh.position.y, a.z, w, h);
      if (!proj) continue;

      if (a.kind === 'minion' || a.kind.startsWith('summon_')) {
        this.drawFloatingBar(
          ctx,
          proj.sx,
          proj.sy,
          26,
          3.5,
          a.hp,
          a.maxHp,
          a.team === 'blue' ? '#38bdf8' : '#ef4444',
          a.label,
          undefined,
          false,
          a.trailHp
        );
      } else {
        this.drawFloatingBar(
          ctx,
          proj.sx,
          proj.sy,
          isLord ? 64 : 52,
          6,
          a.hp,
          a.maxHp,
          a.team === 'blue' ? '#3b82f6' : '#f43f5e',
          a.label ? `${a.icon || ''} ${a.label} (${Math.max(0, Math.round(a.hp))})` : undefined,
          isLord ? 'LRD' : String(this.heroLevel),
          false,
          a.trailHp
        );
      }

      // Overhead CC & Elemental Status Visual Cues
      if (a.stunTimer > 0) {
        this.drawCcCue(ctx, proj.sx, proj.sy - 18, '⭐ STUNNED', '#facc15');
      } else if (a.airborneTimer > 0) {
        this.drawCcCue(ctx, proj.sx, proj.sy - 18, '🌪️ AIRBORNE', '#38bdf8');
      } else if (a.fearTimer > 0) {
        this.drawCcCue(ctx, proj.sx, proj.sy - 18, '💀 FEARED', '#c084fc');
      } else if (a.tauntTimer > 0) {
        this.drawCcCue(ctx, proj.sx, proj.sy - 18, '🛡️ TAUNTED', '#f97316');
      } else if (a.rootTimer > 0) {
        this.drawCcCue(ctx, proj.sx, proj.sy - 18, '🌿 ROOTED', '#4ade80');
      } else if (a.silenceTimer > 0) {
        this.drawCcCue(ctx, proj.sx, proj.sy - 18, '✖ SILENCED', '#e879f9');
      } else if (a.statusTimer && a.statusTimer > 0 && a.statusKind && a.statusKind !== 'none') {
        const cueMap: Record<string, [string, string]> = {
          burn: ['🔥 BURNING', '#ff6b2b'],
          freeze: ['❄️ FROZEN', '#38bdf8'],
          shock: ['⚡ SHOCKED', '#60a5fa'],
          gust: ['🌪️ SWEPT', '#2dd4bf'],
          soak: ['🌊 SOAKED', '#0ea5e9'],
          curse: ['🌑 CURSED', '#c084fc'],
          vine: ['🌿 ENTANGLED', '#4ade80'],
          radiant: ['✨ SEARED', '#fde047'],
          crush: ['🪨 SHATTERED', '#f59e0b'],
          bleed: ['🩸 BLEEDING', '#fb7185']
        };
        const cue = cueMap[a.statusKind];
        if (cue) this.drawCcCue(ctx, proj.sx, proj.sy - 18, cue[0], cue[1]);
      }

      // Contextual AI Hero Overhead Emote Speech Bubble
      if (isHero && a.activeEmoteId && a.activeEmoteTimer && a.activeEmoteTimer > 0) {
        const em = getMobaEmoteById(a.activeEmoteId);
        this.drawEmoteBubble(ctx, proj.sx, proj.sy - 22, em, a.activeEmoteTimer, a.activeEmoteMax ?? 2.5);
      }
    }

    // 1d. Player Hero Floating Overhead Health Bar + CC Immune / Recall Progress Bar
    const pProj = this.projectToOverlay(this.px, (this.giantTimer > 0 ? 5.2 : 4.1) + this.py, this.pz, w, h);
    if (pProj) {
      const buffIcons =
        (this.blueBuffTimer > 0 ? '🔵' : '') +
        (this.redBuffTimer > 0 ? '🟠' : '') +
        (this.windChantTimer > 0 ? '🍃' : '') +
        (this.frozenTimer > 0 ? '❄️' : '');
      this.drawFloatingBar(
        ctx,
        pProj.sx,
        pProj.sy,
        64,
        7,
        this.lives,
        this.maxLives,
        '#22c55e',
        `${this.heroDef.name} ${this.lives}/${this.maxLives} ${buffIcons}`.trim(),
        String(this.heroLevel),
        this.shieldTimer > 0 || this.windChantTimer > 0,
        this.playerTrailHp
      );
      if (this.ccImmuneTimer > 0) {
        this.drawCcCue(ctx, pProj.sx, pProj.sy - 20, '✨ CC IMMUNE', '#fde047');
      } else if (this.recallTimer > 0) {
        this.drawCcCue(ctx, pProj.sx, pProj.sy - 20, `🌀 RECALLING ${this.recallTimer.toFixed(1)}s`, '#38bdf8');
      } else if (this.isSprinting) {
        this.drawCcCue(ctx, pProj.sx, pProj.sy - 19, `💨 SPRINT ${Math.round(this.effectiveMlbbSpeed)}`, '#84fab0');
      }
      if (this.playerEmoteId && this.playerEmoteTimer > 0) {
        const em = getMobaEmoteById(this.playerEmoteId);
        this.drawEmoteBubble(ctx, pProj.sx, pProj.sy - 24, em, this.playerEmoteTimer, this.playerEmoteMax);
      }
    }

    // 1e. Floating Damage & Healing Numbers
    if (playerState.mobaSettings.damageText && this.floatingDmgNums.length > 0) {
      ctx.textAlign = 'center';
      for (const dn of this.floatingDmgNums) {
        const proj = this.projectToOverlay(dn.wx, dn.wy, dn.wz, w, h);
        if (!proj) continue;
        const alpha = Math.max(0, Math.min(1, dn.life / Math.max(0.05, dn.maxLife)));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = dn.isCrit ? '900 14px system-ui, sans-serif' : '800 11.5px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(9, 13, 22, 0.9)';
        ctx.fillText(dn.text, proj.sx + 1.2, proj.sy + 1.2);
        ctx.fillStyle = dn.color;
        ctx.fillText(dn.text, proj.sx, proj.sy);
        ctx.restore();
      }
    }

    // 2. 2D Tactical Minimap scaled to 264x264 (-132..+132)
    const isCompactViewport = w < 640 || h < 540;
    const ms = h < 460 ? 74 : w < 460 ? 84 : 110;
    const mx = w - ms - 12;
    const my = isCompactViewport ? 122 : 58;
    ctx.fillStyle = '#090d16';
    ctx.fillRect(mx + 3, my + 3, ms, ms);
    ctx.fillStyle = '#14532d';
    ctx.fillRect(mx, my, ms, ms);

    // Minimap Lanes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mx + 6, my + ms - 6);
    ctx.lineTo(mx + 6, my + 6);
    ctx.lineTo(mx + ms - 6, my + 6);
    ctx.moveTo(mx + 6, my + ms - 6);
    ctx.lineTo(mx + ms - 6, my + 6);
    ctx.moveTo(mx + 6, my + ms - 6);
    ctx.lineTo(mx + ms - 6, my + ms - 6);
    ctx.lineTo(mx + ms - 6, my + 6);
    ctx.stroke();

    // River on Minimap
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(mx + 4, my + 4);
    ctx.lineTo(mx + ms - 4, my + ms - 4);
    ctx.stroke();

    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(mx, my, ms, ms);

    const toM = (val: number) => ((val + MAP_HALF) / MAP_SIZE) * ms;

    // Dynamic EXP (Purple) & Gold (Yellow) Lane Badges on Minimap
    const [exX, exZ] = this.laneAssign.expMarkerWorld;
    const [goX, goZ] = this.laneAssign.goldMarkerWorld;
    ctx.font = '900 7px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c084fc';
    ctx.fillText('EXP', mx + toM(exX), my + toM(exZ) + 2);
    ctx.fillStyle = '#fde047';
    ctx.fillText('GLD', mx + toM(goX), my + toM(goZ) + 2);

    // 4 Cyclone Eyes (Blue Diamonds)
    for (const ce of this.cycloneEyes) {
      const cx = mx + toM(ce.x);
      const cy = my + toM(ce.z);
      ctx.fillStyle = ce.cd <= 0 ? '#38bdf8' : 'rgba(56, 189, 248, 0.35)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 3);
      ctx.lineTo(cx + 3, cy);
      ctx.lineTo(cx, cy + 3);
      ctx.lineTo(cx - 3, cy);
      ctx.closePath();
      ctx.fill();
    }

    // Jungle Camps, Buffs (with :XX respawn timers), Lithowanderer (Turquoise), Small Camps/Crabs (Yellow), Turtle/Lord (MM:SS)
    for (const jc of this.jungleCamps) {
      if (jc.isSplitChild) continue;
      const cx = mx + toM(jc.alive ? jc.x : jc.homeX);
      const cy = my + toM(jc.alive ? jc.z : jc.homeZ);
      const isBoss = jc.campKind === 'lord' || jc.campKind === 'turtle';
      const isBuff = jc.campKind === 'blue_buff' || jc.campKind === 'red_buff';
      if (jc.alive) {
        ctx.fillStyle =
          jc.campKind === 'blue_buff'
            ? '#c084fc'
            : jc.campKind === 'red_buff'
              ? '#fb923c'
              : jc.campKind === 'litho'
                ? '#2dd4bf'
                : isBoss
                  ? jc.campKind === 'lord'
                    ? '#facc15'
                    : '#10b981'
                  : '#fde047';
        const rad = isBoss ? 4.4 : isBuff ? 3.4 : jc.campKind === 'litho' ? 3.0 : 2.1;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
        if (isBoss || isBuff) {
          ctx.strokeStyle = '#090d16';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      } else if (isBoss || isBuff) {
        // Countdown timers for Respawning Buffs & Turtle/Lord
        ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
        ctx.fillRect(cx - 11, cy - 5, 22, 10);
        ctx.fillStyle = isBoss ? '#34d399' : jc.campKind === 'blue_buff' ? '#d8b4fe' : '#fdba74';
        ctx.font = '900 7px system-ui, sans-serif';
        ctx.textAlign = 'center';
        const sec = Math.max(0, Math.ceil(jc.respawnTimer));
        const txt = isBoss ? formatMatchClock(sec) : `:${String(sec).padStart(2, '0')}`;
        ctx.fillText(txt, cx, cy + 2.5);
      }
    }

    // Turrets
    for (const t of this.turrets) {
      if (!t.alive) continue;
      ctx.fillStyle = t.team === 'blue' ? '#38bdf8' : '#f43f5e';
      const sz = t.isNexus ? 6.5 : 4.2;
      ctx.fillRect(mx + toM(t.x) - sz / 2, my + toM(t.z) - sz / 2, sz, sz);
    }

    // Heroes on Minimap
    for (const a of this.actors) {
      if (!a.alive || (a.kind !== 'hero' && a.kind !== 'lord')) continue;
      ctx.fillStyle = a.kind === 'lord' ? '#a78bfa' : a.team === 'blue' ? '#60a5fa' : '#fb7185';
      ctx.beginPath();
      ctx.arc(mx + toM(a.x), my + toM(a.z), a.kind === 'lord' ? 4 : 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tactical Ping Rings on Minimap
    for (const p of this.minimapPings) {
      const pxm = mx + p.nx * ms;
      const pym = my + p.nz * ms;
      const pulse = 4 + ((4.5 - p.ttl) * 8) % 9;
      ctx.strokeStyle = p.kind === 'retreat' ? '#f43f5e' : p.kind === 'turtle' ? '#34d399' : '#facc15';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(pxm, pym, pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Player Dot
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(mx + toM(this.px), my + toM(this.pz), 4.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Compact Top Combat Match Strip (centered cleanly below top HP bar, clearing #inGameHud & minimap)
    const pillW = Math.min(isCompactViewport ? w - 210 : w - ms - 200, 350);
    const barX = Math.max(isCompactViewport ? 120 : 152, (w - pillW) / 2);
    const barY = isCompactViewport ? 40 : 48;
    ctx.fillStyle = 'rgba(9, 13, 22, 0.88)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, pillW, 28, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.font = w < 440 ? '800 9.5px system-ui, sans-serif' : '800 10.5px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const mm = String(Math.floor(this.matchElapsed / 60)).padStart(2, '0');
    const ss = String(Math.floor(this.matchElapsed % 60)).padStart(2, '0');
    ctx.fillText(
      `${this.heroDef.icon} Lv.${this.heroLevel} ${this.heroDef.name} · ${this.kills}/${this.deaths} K/D · ❤️${this.lives}/${this.maxLives} · ${mm}:${ss}`,
      barX + pillW / 2,
      barY + 18,
      pillW - 16
    );

    // Killfeed Toast (always centered cleanly, auto-fitted inside pill)
    if (this.killfeedTimer > 0 && this.killfeedText) {
      ctx.fillStyle = 'rgba(9, 13, 22, 0.92)';
      const kw = Math.min(isCompactViewport ? w - 180 : w - 48, 410);
      const kx = Math.max(10, (w - kw) / 2);
      const ky = isCompactViewport ? 112 : 84;
      ctx.beginPath();
      ctx.roundRect(kx, ky, kw, 26, 8);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.font = '800 10.5px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.killfeedText, kx + kw / 2, ky + 17, kw - 18);
    }
    ctx.textAlign = 'left';
  }

  protected tick = (): void => {
    if (!this.isRunning || this.gameOver || this.isPaused) return;
    const now = performance.now();
    const dt = Math.min(Math.max((now - this.lastTime) / 1000, 0.001), 0.05);
    this.lastTime = now;
    this.updateSimulation(dt);
    this.updateAllHealthTrails(dt);
    this.drawOverlayHud();
    this.three.render();
    if (this.isRunning && !this.gameOver && !this.isPaused) {
      this.three.scheduleNextFrame(this.tick);
    }
  };
}
