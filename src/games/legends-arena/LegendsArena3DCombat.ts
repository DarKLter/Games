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
import {
  LegendsArena3DWorld,
  MobaActor,
  TurretObj,
  JungleCamp,
  ActiveUltSetpiece,
  SkillAimOverride,
  MAP_SIZE,
  MAP_HALF,
  PLAY_LIMIT,
  BLUE_BASE_X,
  BLUE_BASE_Z,
  RED_BASE_X,
  RED_BASE_Z,
  BEACON_SPOTS,
  AMBUSH_BUSHES,
  disposeObjectTree
} from './LegendsArena3DWorld';

export abstract class LegendsArena3DCombat extends LegendsArena3DWorld {
  protected spawnDamageNumber(
    wx: number,
    wz: number,
    amount: number,
    kind: 'phys' | 'magic' | 'true' | 'crit' | 'heal'
  ): void {
    if (!playerState.mobaSettings.damageText) return;
    const color =
      kind === 'heal'
        ? '#4ade80'
        : kind === 'true'
          ? '#f8fafc'
          : kind === 'magic'
            ? '#c084fc'
            : kind === 'crit'
              ? '#facc15'
              : '#fb923c';
    const prefix = kind === 'heal' ? '+' : kind === 'crit' ? 'CRIT ' : '';
    this.floatingDmgNums.push({
      wx: wx + (Math.random() - 0.5) * 1.1,
      wy: 2.8 + Math.random() * 0.5,
      wz: wz + (Math.random() - 0.5) * 1.1,
      text: `${prefix}${Math.max(1, Math.round(amount))}`,
      color,
      life: 0.85,
      maxLife: 0.85,
      isCrit: kind === 'crit'
    });
    if (this.floatingDmgNums.length > 36) this.floatingDmgNums.shift();
  }

  protected spawnAfterimageGhost(x: number, y: number, z: number, yaw: number, tintColor: number): void {
    const ghost = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({
      color: tintColor,
      transparent: true,
      opacity: 0.45
    });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.5, 0.7), mat);
    torso.position.y = 1.45;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8), mat);
    head.position.y = 2.5;
    ghost.add(torso, head);
    ghost.position.set(x, y, z);
    ghost.rotation.y = yaw;
    this.three.scene.add(ghost);
    this.fxObjs.push({ mesh: ghost, life: 0.34, maxLife: 0.34, mode: 'ghost' });
  }

  protected startPlayerMotion(
    kind: 'dash' | 'leap' | 'snap_back',
    dist: number,
    duration: number,
    peakY = 0
  ): void {
    const dir = kind === 'snap_back' ? -1 : 1;
    const endX = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.px + Math.sin(this.pYaw) * dist * dir));
    const endZ = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.pz + Math.cos(this.pYaw) * dist * dir));
    this.spawnAfterimageGhost(this.px, this.py, this.pz, this.pYaw, this.heroBladeColor);
    this.activeMotion = {
      kind,
      startX: this.px,
      startZ: this.pz,
      endX,
      endZ,
      elapsed: 0,
      duration: Math.max(0.12, duration),
      peakY,
      ghostAcc: 0
    };
  }

  protected findNearestEnemyTarget(): { x: number; z: number; angle: number; dist: number; actor?: MobaActor } | null {
    const maxSearch = Math.max(this.atkRange + 6, 18);

    // 1. Respect Hero Lock Mode target if alive & in range
    if (playerState.mobaSettings.heroLockMode && this.lockedEnemyId !== null) {
      const locked = this.actors.find((a) => a.id === this.lockedEnemyId && a.alive && a.team === 'red');
      if (locked) {
        const d = Math.hypot(locked.x - this.px, locked.z - this.pz);
        if (d <= maxSearch + 10) {
          return {
            x: locked.x,
            z: locked.z,
            angle: Math.atan2(locked.x - this.px, locked.z - this.pz),
            dist: d,
            actor: locked
          };
        }
      }
    }

    const preferLowestHp = playerState.mobaSettings.targetPriority === 'lowest_hp';
    let bestScore = Infinity;
    let best: { x: number; z: number; angle: number; dist: number; actor?: MobaActor } | null = null;

    for (const a of this.actors) {
      if (!a.alive || a.team !== 'red') continue;
      const d = Math.hypot(a.x - this.px, a.z - this.pz);
      if (d > maxSearch) continue;
      // Prioritize heroes over minions, and lowest HP when setting enabled
      const heroBias = a.kind === 'hero' ? 0 : 120;
      const metric = preferLowestHp ? heroBias + (a.hp / Math.max(1, a.maxHp)) * 80 + d * 0.6 : heroBias * 0.25 + d;
      if (metric < bestScore) {
        bestScore = metric;
        best = { x: a.x, z: a.z, angle: Math.atan2(a.x - this.px, a.z - this.pz), dist: d, actor: a };
      }
    }
    if (best) return best;

    let bestD = maxSearch;
    for (const jc of this.jungleCamps) {
      if (!jc.alive) continue;
      const d = Math.hypot(jc.x - this.px, jc.z - this.pz);
      if (d < bestD) {
        bestD = d;
        best = { x: jc.x, z: jc.z, angle: Math.atan2(jc.x - this.px, jc.z - this.pz), dist: d };
      }
    }
    for (const t of this.turrets) {
      if (!t.alive || t.team !== 'red') continue;
      const d = Math.hypot(t.x - this.px, t.z - this.pz);
      if (d < bestD) {
        bestD = d;
        best = { x: t.x, z: t.z, angle: Math.atan2(t.x - this.px, t.z - this.pz), dist: d };
      }
    }
    return best;
  }

  protected triggerTyphoonChain(centerX: number, centerZ: number, chainDmg: number): void {
    let hits = 0;
    for (const a of this.actors) {
      if (!a.alive || a.team !== 'red') continue;
      if (Math.hypot(a.x - centerX, a.z - centerZ) <= 9.5) {
        this.damageEnemyActor(a, chainDmg);
        hits++;
        if (hits >= 3) break;
      }
    }
    for (const jc of this.jungleCamps) {
      if (!jc.alive || hits >= 3) continue;
      if (Math.hypot(jc.x - centerX, jc.z - centerZ) <= 9.5) {
        this.damageJungleCamp(jc, chainDmg);
        hits++;
      }
    }
    if (hits > 0) {
      this.spawnVfx('lightning', centerX, centerZ, 5.2, 0x38bdf8);
    }
  }

  protected applyHeroPassiveOnHit(baseDmg: number, dist: number): number {
    this.hitCounter++;
    const kind = this.combatKit.passiveKind;
    if (this.passiveStacks < this.combatKit.maxStacks) {
      this.passiveStacks++;
    }
    let mult = 1.0;
    if (this.giantTimer > 0) mult *= 1.25;

    if (kind === 'longshot_scale') {
      mult *= 1 + Math.min(0.35, dist * 0.022);
    } else if (kind === 'crit_6th' && this.hitCounter % 6 === 0) {
      mult *= 1.8;
      this.spawnVfx('lightning', this.px, this.pz, 4.5, 0xfacc15);
    } else if (kind === 'true_5th' && this.hitCounter % 5 === 0) {
      mult *= 1.6;
      this.lives = Math.min(this.maxLives, this.lives + 8);
      updateHealthDisplay(this.lives, this.maxLives);
    } else if ((kind === 'hit_3_proc' || kind === 'burn_stacks') && this.hitCounter % 3 === 0) {
      mult *= 1.45;
      this.lives = Math.min(this.maxLives, this.lives + 10);
      updateHealthDisplay(this.lives, this.maxLives);
    } else if (kind === 'lifesteal_aura') {
      this.lives = Math.min(this.maxLives, this.lives + Math.round(baseDmg * 0.14));
      updateHealthDisplay(this.lives, this.maxLives);
    } else if (kind === 'cd_on_hit') {
      this.cdSkill1 = Math.max(0, this.cdSkill1 - 0.35);
      this.cdSkill2 = Math.max(0, this.cdSkill2 - 0.35);
    } else if (kind === 'atk_speed_stack') {
      mult *= 1 + this.passiveStacks * 0.04;
    }

    // Equipment: Critical Strike (unless Golden Staff disables crits)
    if (this.computedStats.critChance > 0 && Math.random() * 100 < this.computedStats.critChance) {
      mult *= this.computedStats.critMult;
      this.spawnVfx('ring', this.px, this.pz, 3.2, 0xfacc15);
      if (this.equippedItemIds.includes('haas_claws')) {
        this.hasteTimer = Math.max(this.hasteTimer, 1.5);
      }
    }

    // Equipment: Golden Staff (Endless Strike every 3rd basic attack)
    if (this.equippedItemIds.includes('golden_staff') && this.hitCounter % 3 === 0) {
      mult *= 1.38;
    }

    // Equipment: Endless Battle / Calamity Reaper / Starlium Scythe (Divine Justice / Crisis)
    if (this.divineJusticePrimed && this.computedStats.hasDivineJustice) {
      this.divineJusticePrimed = false;
      mult *= 1.45;
      this.hasteTimer = Math.max(this.hasteTimer, 1.8);
      this.spawnVfx('ring', this.px, this.pz, 3.8, 0xfef08a);
    }

    // Equipment: Blade of the Heptaseas / Shadow Twinblades (Ambush)
    if (this.outOfCombatSec >= 5 && this.computedStats.hasAmbush) {
      mult *= 1.42;
      this.spawnVfx('slash_arc', this.px, this.pz, 4.8, 0xf43f5e);
    }
    this.outOfCombatSec = 0;

    // Equipment: Hunter Strike (Retribution 5-hit haste)
    if (this.equippedItemIds.includes('hunter_strike') && this.hitCounter % 5 === 0) {
      this.hasteTimer = Math.max(this.hasteTimer, 2.5);
    }

    // Keystone Talent: Concussive Blast (every 4th attack detonates HP-scaled AoE shockwave)
    if (this.keystoneT3 === 'concussive_blast' && this.hitCounter % 4 === 0) {
      const blastDmg = Math.max(18, Math.round(this.maxLives * 0.08));
      this.spawnVfx('ring', this.px, this.pz, 6.2, 0xf97316);
      for (const a of this.actors) {
        if (a.alive && a.team === 'red' && Math.hypot(a.x - this.px, a.z - this.pz) < 6.4) {
          this.damageEnemyActor(a, blastDmg, true, 'magic');
        }
      }
    }

    // Equipment: Windtalker / Lightning Truncheon (Typhoon / Resonate every 4th hit)
    if (this.computedStats.hasTyphoon && this.hitCounter % 4 === 0) {
      this.triggerTyphoonChain(this.px, this.pz, Math.round(baseDmg * 0.55));
    }

    const finalDmg = Math.round(baseDmg * mult);

    // Equipment: Lifesteal & Spell Vamp sustain
    if (this.computedStats.lifestealRatio > 0) {
      const heal = Math.max(1, Math.round(finalDmg * this.computedStats.lifestealRatio * 0.45));
      this.lives = Math.min(this.maxLives, this.lives + heal);
      updateHealthDisplay(this.lives, this.maxLives);
      this.spawnDamageNumber(this.px, this.pz, heal, 'heal');
    }

    return finalDmg;
  }

  attack(): void {
    if (this.gameOver || this.isPaused || this.basicCd > 0 || this.frozenTimer > 0) return;
    const itemAtkSpeedFactor = Math.max(0.45, 1 / this.computedStats.atkSpeedMult);
    const speedBoost =
      itemAtkSpeedFactor *
      (this.inspireTimer > 0 ? 0.52 : 1.0) *
      (this.combatKit.passiveKind === 'atk_speed_stack' ? Math.max(0.68, 1 - this.passiveStacks * 0.05) : 1.0);
    const effectiveDmg = this.inspireTimer > 0 ? Math.round(this.atkDmg * 1.45) : this.atkDmg;
    this.basicCd = (this.heroDef.weapon === 'daggers' ? 0.27 : 0.35) * speedBoost;
    this.recallTimer = 0;
    this.stealthTimer = 0;
    this.bushRevealTimer = 2.0;
    this.castAnimTimer = 0.22;

    const tgt = this.findNearestEnemyTarget();
    const ang = tgt ? tgt.angle : this.pYaw;
    const dist = tgt ? tgt.dist : 8;
    const dmg = this.applyHeroPassiveOnHit(effectiveDmg, dist);

    // Keystone Talent: Weakness Finder (slows enemies 50% on basic attack)
    const weaknessSlow = this.keystoneT3 === 'weakness_finder' && this.weaknessFinderCd <= 0 ? 1.2 : 0;
    if (weaknessSlow > 0) this.weaknessFinderCd = 3.0;

    if (this.isRanged || this.giantTimer > 0) {
      ArcadeAudio.play('shoot');
      this.pYaw = ang;
      const lifeSec = this.heroDef.archetype === 'snipe' ? 0.95 : 0.7;
      this.firePlayerBolt(ang, dmg, lifeSec, undefined, this.heroBaseElement, 0.92);
      if (this.combatKit.passiveKind === 'pet_companion' || (this.combatKit.passiveKind === 'atk_speed_stack' && this.passiveStacks >= 5)) {
        this.firePlayerBolt(ang + 0.1, Math.round(dmg * 0.5), lifeSec, undefined, this.heroBaseElement, 0.85);
      }
      this.spawnElementalVfx(this.heroBaseElement, 'ring', this.px, this.pz, 2.5, ang);
      return;
    }

    ArcadeAudio.play('slash');
    this.spawnElementalVfx(this.heroBaseElement, 'slash_arc', this.px, this.pz, 4.4, ang);
    if (this.combatKit.passiveKind === 'pet_companion') {
      this.firePlayerBolt(ang, Math.round(dmg * 0.5), 0.55, undefined, this.heroBaseElement, 0.9);
    }

    const slowFromHit = Math.max(
      this.redBuffTimer > 0 || this.computedStats.hasIceBound ? 1.5 : 0,
      weaknessSlow
    );
    for (const a of this.actors) {
      if (a.alive && a.team === 'red' && Math.hypot(a.x - this.px, a.z - this.pz) < this.atkRange + 0.8) {
        if (slowFromHit > 0) a.slowTimer = Math.max(a.slowTimer, slowFromHit);
        this.damageEnemyActor(a, dmg, true, 'phys');
      }
    }
    for (const jc of this.jungleCamps) {
      if (jc.alive && Math.hypot(jc.x - this.px, jc.z - this.pz) < this.atkRange + 2.0) {
        this.damageJungleCamp(jc, dmg);
      }
    }
    for (const t of this.turrets) {
      if (t.alive && t.team === 'red' && Math.hypot(t.x - this.px, t.z - this.pz) < this.atkRange + 2.2) {
        this.damageTurret(t, dmg);
      }
    }
  }

  protected launchIconicUlt(
    kind: NonNullable<MobaSkillEffectSpec['iconicUlt']>,
    dmg: number,
    spec: MobaSkillEffectSpec,
    aimOverride?: SkillAimOverride
  ): void {
    if (kind === 'tigreal_implosion') {
      const grp = new THREE.Group();
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.5, 9.2, 36),
        new THREE.MeshBasicMaterial({
          color: 0xfacc15,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.58,
          polygonOffset: true,
          polygonOffsetFactor: -2
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.18;
      grp.add(ring);

      const tethered: MobaActor[] = [];
      for (const a of this.actors) {
        if (a.alive && a.team === 'red' && Math.hypot(a.x - this.px, a.z - this.pz) <= 10.5) {
          tethered.push(a);
          const dx = a.x - this.px;
          const dz = a.z - this.pz;
          const len = Math.max(1, Math.hypot(dx, dz));
          const chain = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.14, len, 6),
            new THREE.MeshBasicMaterial({ color: 0xfef08a })
          );
          chain.rotation.x = Math.PI / 2;
          chain.rotation.z = -Math.atan2(dx, dz);
          chain.position.set(dx / 2, 1.4, dz / 2);
          grp.add(chain);
        }
      }
      grp.position.set(this.px, 0, this.pz);
      this.three.scene.add(grp);
      this.activeUltSetpieces.push({
        kind,
        group: grp,
        cx: this.px,
        cz: this.pz,
        life: 0.95,
        maxLife: 0.95,
        tickAcc: 0,
        detonated: false,
        baseDmg: dmg,
        tetherTargets: tethered
      });
      this.showKillfeed('🛡️ TIGREAL: IMPLOSION — GRAVITY VORTEX!');
      return;
    }

    if (kind === 'lancelot_thorned_rose') {
      this.untargetableTimer = Math.max(this.untargetableTimer, 0.95);
      const cx = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.px + Math.sin(this.pYaw) * 4.5));
      const cz = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.pz + Math.cos(this.pYaw) * 4.5));
      const grp = new THREE.Group();
      const roseMat = new THREE.MeshBasicMaterial({
        color: 0xf472b6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.78,
        polygonOffset: true,
        polygonOffsetFactor: -3
      });
      for (let i = 0; i < 3; i++) {
        const ang = (i * Math.PI * 2) / 3 + this.pYaw;
        const slash = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 11.5), roseMat.clone());
        slash.rotation.x = -Math.PI / 2;
        slash.rotation.z = ang;
        slash.position.set(Math.sin(ang) * 2.1, 0.22 + i * 0.03, Math.cos(ang) * 2.1);
        grp.add(slash);
        this.spawnAfterimageGhost(cx + Math.sin(ang) * 4.4, 0, cz + Math.cos(ang) * 4.4, ang + Math.PI, 0xf472b6);
      }
      grp.position.set(cx, 0, cz);
      this.three.scene.add(grp);
      this.activeUltSetpieces.push({
        kind,
        group: grp,
        cx,
        cz,
        life: 0.85,
        maxLife: 0.85,
        tickAcc: 0,
        detonated: false,
        baseDmg: dmg
      });
      this.showKillfeed('🌹 LANCELOT: THORNED ROSE — INVULNERABLE TRIANGLE!');
      return;
    }

    if (kind === 'johnson_car') {
      // Remove any existing car form first
      const existingIdx = this.activeUltSetpieces.findIndex((s) => s.kind === 'johnson_car');
      if (existingIdx >= 0) {
        const cur = this.activeUltSetpieces[existingIdx];
        this.detonateJohnsonCrash(cur);
        disposeObjectTree(cur.group);
        this.three.scene.remove(cur.group);
        this.activeUltSetpieces.splice(existingIdx, 1);
        return;
      }
      const car = new THREE.Group();
      const chassis = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.95, 4.8),
        createToonMaterial(0x1d4ed8, { emissive: 0x38bdf8, emissiveIntensity: 0.3 })
      );
      chassis.position.y = 0.85;
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.72, 2.2), createToonMaterial(0x0f172a));
      cabin.position.set(0, 1.55, -0.2);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 4.85), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      stripe.position.set(0, 1.35, 0);
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const hlL = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), hlMat);
      hlL.position.set(-0.85, 0.9, 2.42);
      const hlR = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), hlMat);
      hlR.position.set(0.85, 0.9, 2.42);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.85 });
      const exL = new THREE.Mesh(new THREE.ConeGeometry(0.26, 1.35, 8), flameMat);
      exL.rotation.x = -Math.PI / 2;
      exL.position.set(-0.65, 0.65, -2.95);
      const exR = new THREE.Mesh(new THREE.ConeGeometry(0.26, 1.35, 8), flameMat);
      exR.rotation.x = -Math.PI / 2;
      exR.position.set(0.65, 0.65, -2.95);
      const wheelMat = createToonMaterial(0x111827);
      const wheelGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.35, 10);
      wheelGeo.rotateZ(Math.PI / 2);
      for (const [wx, wz] of [[-1.3, 1.5], [1.3, 1.5], [-1.3, -1.5], [1.3, -1.5]]) {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.position.set(wx, 0.46, wz);
        car.add(w);
      }
      car.add(chassis, cabin, stripe, hlL, hlR, exL, exR);
      car.position.set(this.px, 0, this.pz);
      car.rotation.y = this.pYaw;
      this.three.scene.add(car);
      this.hasteTimer = Math.max(this.hasteTimer, 5.5);
      this.ccImmuneTimer = Math.max(this.ccImmuneTimer, 5.5);
      this.activeUltSetpieces.push({
        kind,
        group: car,
        cx: this.px,
        cz: this.pz,
        life: 5.5,
        maxLife: 5.5,
        tickAcc: 0,
        detonated: false,
        baseDmg: dmg
      });
      this.showKillfeed('🚗 JOHNSON: FULL THROTTLE — RAM ENEMIES FOR SHOCK CRASH!');
      return;
    }

    if (kind === 'yve_chessboard') {
      const cx = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.px + Math.sin(this.pYaw) * 6.5));
      const cz = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.pz + Math.cos(this.pYaw) * 6.5));
      const board = new THREE.Group();
      const tileSize = 2.0;
      const tileGeo = new THREE.PlaneGeometry(tileSize * 0.92, tileSize * 0.92);
      const matA = new THREE.MeshBasicMaterial({
        color: 0x6d28d9,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.56,
        polygonOffset: true,
        polygonOffsetFactor: -2
      });
      const matB = new THREE.MeshBasicMaterial({
        color: 0x312e81,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.56,
        polygonOffset: true,
        polygonOffsetFactor: -2
      });
      for (let gx = -3; gx <= 3; gx++) {
        for (let gz = -3; gz <= 3; gz++) {
          const tile = new THREE.Mesh(tileGeo, (gx + gz) % 2 === 0 ? matA : matB);
          tile.rotation.x = -Math.PI / 2;
          tile.position.set(gx * tileSize, 0.16, gz * tileSize);
          board.add(tile);
        }
      }
      const frame = new THREE.Mesh(
        new THREE.RingGeometry(9.6, 10.2, 4),
        new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
      );
      frame.rotation.x = -Math.PI / 2;
      frame.rotation.z = Math.PI / 4;
      frame.position.y = 0.2;
      board.add(frame);
      board.position.set(cx, 0, cz);
      this.three.scene.add(board);
      this.shieldTimer = Math.max(this.shieldTimer, 4.5);
      this.ccImmuneTimer = Math.max(this.ccImmuneTimer, 4.5);
      this.activeUltSetpieces.push({
        kind,
        group: board,
        cx,
        cz,
        life: 4.5,
        maxLife: 4.5,
        tickAcc: 0,
        detonated: false,
        baseDmg: Math.round(dmg * 0.45)
      });
      this.showKillfeed('♟️ YVE: REAL WORLD MANIPULATION — 7x7 STARFIELD CHESSBOARD!');
      return;
    }

    if (kind === 'kagura_overturn') {
      const tgt = aimOverride ? null : this.findNearestEnemyTarget();
      const cx = aimOverride
        ? aimOverride.aimX
        : tgt
          ? tgt.x
          : Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.px + Math.sin(this.pYaw) * 7.5));
      const cz = aimOverride
        ? aimOverride.aimZ
        : tgt
          ? tgt.z
          : Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.pz + Math.cos(this.pYaw) * 7.5));
      const grp = new THREE.Group();
      const canopy = new THREE.Mesh(
        new THREE.ConeGeometry(2.1, 0.9, 12),
        createToonMaterial(0x7c3aed, { emissive: 0xc084fc, emissiveIntensity: 0.55 })
      );
      canopy.position.y = 2.4;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8), createToonMaterial(0xfef08a));
      pole.position.y = 1.25;
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.2, 8.6, 32),
        new THREE.MeshBasicMaterial({
          color: 0xa855f7,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.42,
          polygonOffset: true,
          polygonOffsetFactor: -2
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.18;
      grp.add(canopy, pole, ring);

      const tethered: MobaActor[] = [];
      for (const a of this.actors) {
        if (a.alive && a.team === 'red' && Math.hypot(a.x - cx, a.z - cz) <= 9.2) {
          tethered.push(a);
          const dx = a.x - cx;
          const dz = a.z - cz;
          const len = Math.max(1, Math.hypot(dx, dz));
          const link = new THREE.Mesh(
            new THREE.CylinderGeometry(0.11, 0.11, len, 6),
            new THREE.MeshBasicMaterial({ color: 0xe879f9 })
          );
          link.rotation.x = Math.PI / 2;
          link.rotation.z = -Math.atan2(dx, dz);
          link.position.set(dx / 2, 1.5, dz / 2);
          grp.add(link);
        }
      }
      grp.position.set(cx, 0, cz);
      this.three.scene.add(grp);
      this.activeUltSetpieces.push({
        kind,
        group: grp,
        cx,
        cz,
        life: 1.2,
        maxLife: 1.2,
        tickAcc: 0,
        detonated: false,
        baseDmg: dmg,
        tetherTargets: tethered
      });
      this.showKillfeed(`☂️ KAGURA: ${spec.name.toUpperCase()} — SPIRIT CHAINS LINKED!`);
    }
  }

  protected detonateJohnsonCrash(sp: ActiveUltSetpiece): void {
    if (sp.detonated) return;
    sp.detonated = true;
    this.cameraShake = Math.max(this.cameraShake, 0.65);
    ArcadeAudio.play('explosion');
    this.spawnVfx('lightning', this.px, this.pz, 9.5, 0x38bdf8);
    this.spawnVfx('ring', this.px, this.pz, 10.5, 0xfacc15);
    for (const a of this.actors) {
      if (a.alive && a.team === 'red' && Math.hypot(a.x - this.px, a.z - this.pz) <= 10.2) {
        a.stunTimer = Math.max(a.stunTimer, 1.35);
        a.airborneTimer = 0.55;
        a.airborneDur = 0.55;
        a.airbornePeak = 2.8;
        this.damageEnemyActor(a, Math.round(sp.baseDmg * 1.25), true, 'magic');
      }
    }
    this.showKillfeed('💥 FULL THROTTLE ELECTRIC CRASH! ENEMIES STUNNED!');
  }

  protected castHeroSkill(slotIndex: 0 | 1 | 2 | 3, aimOverride?: SkillAimOverride): void {
    if (this.frozenTimer > 0) return;
    const spec = this.combatKit.skills[slotIndex];
    if (!spec) return;

    // Allow re-casting Johnson Ultimate while driving to crash early
    if (spec.iconicUlt === 'johnson_car' && this.activeUltSetpieces.some((s) => s.kind === 'johnson_car')) {
      this.launchIconicUlt('johnson_car', Math.round(this.atkDmg * spec.dmgMult), spec, aimOverride);
      return;
    }

    if (slotIndex === 0 && this.cdSkill1 > 0) return;
    if (slotIndex === 1 && this.cdSkill2 > 0) return;
    if (slotIndex === 2 && this.cdSkill3 > 0) return;
    if (slotIndex === 3 && this.cdSkill4 > 0) return;

    const cd = spec.cdSec * this.cdMult;
    if (slotIndex === 0) { this.cdSkill1 = cd; this.maxCdSkill1 = cd; }
    else if (slotIndex === 1) { this.cdSkill2 = cd; this.maxCdSkill2 = cd; }
    else if (slotIndex === 2) { this.cdSkill3 = cd; this.maxCdSkill3 = cd; }
    else if (slotIndex === 3) { this.cdSkill4 = cd; this.maxCdSkill4 = cd; }

    this.recallTimer = 0;
    this.stealthTimer = 0;
    this.outOfCombatSec = 0;
    this.bushRevealTimer = 2.0;
    this.castAnimTimer = 0.3;

    // Flash Ground Telegraph briefly during quick-tap cast wind-up
    if (!aimOverride) {
      this.telegraphSlot = slotIndex;
      this.telegraphAutoTimer = 0.28;
      this.rebuildTelegraphMesh(slotIndex);
    }

    // Keystone Talent: Temporal Reign (Ultimate accelerates basic skill cooldowns)
    if (slotIndex >= 2 && this.keystoneT3 === 'temporal_reign') {
      this.cdSkill1 *= 0.65;
      this.cdSkill2 *= 0.65;
    }

    // Prime Divine Justice / Crisis (Endless Battle, Calamity Reaper, Starlium Scythe)
    if (this.computedStats.hasDivineJustice) {
      this.divineJusticePrimed = true;
    }

    // Great Dragon Spear (Supreme Warrior: Ultimate grants +30% Move Speed for 7.5s)
    if (slotIndex >= 2 && this.equippedItemIds.includes('great_dragon_spear')) {
      this.hasteTimer = Math.max(this.hasteTimer, 7.5);
    }

    if (this.combatKit.passiveKind === 'cd_on_hit') {
      this.cdSkill1 = Math.max(0, this.cdSkill1 - 0.5);
      this.cdSkill2 = Math.max(0, this.cdSkill2 - 0.5);
    }

    const elemTheme = spec.elementTheme;
    const elemPal = MOBA_ELEMENT_PALETTES[elemTheme];
    const fxColor = elemPal.primary;

    const tgt = aimOverride ? null : this.findNearestEnemyTarget();
    const lockedTargetActor =
      aimOverride?.lockedTargetId !== null && aimOverride?.lockedTargetId !== undefined
        ? this.actors.find((a) => a.id === aimOverride.lockedTargetId && a.alive && a.team === 'red')
        : undefined;

    if (aimOverride) {
      this.pYaw = aimOverride.aimYaw;
    } else if (tgt) {
      this.pYaw = tgt.angle;
    }

    // Apply Self Buffs / Heals / Shields / Stealth / Giant Forms / CC Immunity
    if (spec.healPct > 0) {
      const favorMult = this.blessingId === 'favor' || this.blessingId === 'roam_favor' ? 1.25 : 1.0;
      const oracleMult = this.equippedItemIds.includes('oracle') ? 1.3 : 1.0;
      const healAmt = Math.round(this.maxLives * spec.healPct * favorMult * oracleMult);
      this.lives = Math.min(this.maxLives, this.lives + healAmt);
      updateHealthDisplay(this.lives, this.maxLives);
      this.spawnDamageNumber(this.px, this.pz, healAmt, 'heal');
    }
    if (spec.shieldSec > 0) this.shieldTimer = Math.max(this.shieldTimer, spec.shieldSec);
    if (spec.hasteSec > 0) this.hasteTimer = Math.max(this.hasteTimer, spec.hasteSec);
    if (spec.stealthSec > 0) this.stealthTimer = Math.max(this.stealthTimer, spec.stealthSec);
    if (spec.ccImmuneSec && spec.ccImmuneSec > 0) this.ccImmuneTimer = Math.max(this.ccImmuneTimer, spec.ccImmuneSec);
    if (spec.giantSec > 0) {
      this.giantTimer = Math.max(this.giantTimer, spec.giantSec);
      this.showKillfeed(`🐲 ${this.heroDef.name.toUpperCase()} TRANSFORMED!`);
    }

    const dmg = Math.round(this.atkDmg * spec.dmgMult * (this.giantTimer > 0 ? 1.2 : 1.0));
    const impactCenter = aimOverride
      ? { x: aimOverride.aimX, z: aimOverride.aimZ }
      : {
          x: Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.px + Math.sin(this.pYaw) * Math.min(spec.range * 0.65, 11))),
          z: Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.pz + Math.cos(this.pYaw) * Math.min(spec.range * 0.65, 11)))
        };

    // Signature Iconic 3D Ultimate Set-Pieces (Tigreal, Lancelot, Johnson, Yve, Kagura)
    if (spec.iconicUlt && spec.iconicUlt !== 'none') {
      ArcadeAudio.play('combo');
      this.launchIconicUlt(spec.iconicUlt, dmg, spec, aimOverride);
      this.pushMobaHudSnapshot();
      return;
    }

    // Execute Unique Skill Kinds + Movement Physics + Elemental 3D VFX
    switch (spec.kind) {
      case 'dash_strike':
      case 'blink_teleport': {
        ArcadeAudio.play('dash');
        if (spec.slot === 4 && this.heroDef.name === 'Chip') {
          this.beaconIdx = (this.beaconIdx + 1) % BEACON_SPOTS.length;
          const [bx, bz] = BEACON_SPOTS[this.beaconIdx];
          this.spawnAfterimageGhost(this.px, this.py, this.pz, this.pYaw, fxColor);
          this.px = bx;
          this.pz = bz;
          this.showKillfeed(`🦊 ${this.heroDef.name} WARPED TO BEACON ${this.beaconIdx + 1}!`);
        } else if (spec.moveKind === 'leap') {
          const dist = aimOverride ? Math.max(3.5, Math.min(spec.range, aimOverride.dist)) : Math.min(16, spec.range);
          this.startPlayerMotion('leap', dist, 0.34, 4.2);
        } else if (spec.moveKind === 'dash') {
          const dist = aimOverride ? Math.max(4.0, Math.min(spec.range, aimOverride.dist)) : Math.min(14, spec.range);
          this.startPlayerMotion('dash', dist, 0.24, 0.4);
        } else if (spec.moveKind === 'snap_back') {
          this.startPlayerMotion('snap_back', 7.5, 0.22, 1.2);
        } else {
          // Instant Blink with Ghost Trail
          this.spawnAfterimageGhost(this.px, this.py, this.pz, this.pYaw, fxColor);
          if (aimOverride) {
            this.px = aimOverride.aimX;
            this.pz = aimOverride.aimZ;
          } else {
            const dist = Math.min(18, spec.range);
            this.px = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.px + Math.sin(this.pYaw) * dist));
            this.pz = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.pz + Math.cos(this.pYaw) * dist));
          }
        }
        const fxX = this.activeMotion ? this.activeMotion.endX : this.px;
        const fxZ = this.activeMotion ? this.activeMotion.endZ : this.pz;
        this.spawnElementalVfx(elemTheme, spec.vfx, fxX, fxZ, spec.radius, this.pYaw);
        this.applySkillAreaEffects(fxX, fxZ, spec.radius, dmg, spec);
        break;
      }

      case 'hook_pull': {
        ArcadeAudio.play('slingshot');
        this.spawnElementalVfx(elemTheme, 'hook_chain', this.px, this.pz, spec.range, this.pYaw);
        let hookedAny = false;
        const dirX = Math.sin(this.pYaw);
        const dirZ = Math.cos(this.pYaw);
        const candidates = lockedTargetActor ? [lockedTargetActor, ...this.actors] : this.actors;
        const seen = new Set<number>();
        for (const a of candidates) {
          if (seen.has(a.id)) continue;
          seen.add(a.id);
          if (!a.alive || a.team !== 'red') continue;
          const rx = a.x - this.px;
          const rz = a.z - this.pz;
          const d = Math.hypot(rx, rz);
          const proj = rx * dirX + rz * dirZ;
          const perp = Math.abs(rx * dirZ - rz * dirX);
          const inLine = aimOverride ? proj > 0 && proj <= spec.range + 2.5 && perp <= 3.8 : d < spec.range + 2;
          if (inLine) {
            if (spec.ccKind === 'flip') {
              a.x = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.px - dirX * 3.4));
              a.z = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.pz - dirZ * 3.4));
              a.airborneTimer = 0.45;
              a.airborneDur = 0.45;
              a.airbornePeak = 3.2;
            } else {
              a.x = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.px + dirX * 2.8));
              a.z = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.pz + dirZ * 2.8));
            }
            a.mesh.position.set(a.x, 0, a.z);
            a.stunTimer = Math.max(a.stunTimer, 1.15);
            this.applyElementalStatusToActor(a, elemTheme, spec.ccKind, dmg);
            this.damageEnemyActor(a, dmg, true, 'phys');
            this.spawnElementalVfx(elemTheme, 'ring', a.x, a.z, 4.2, this.pYaw);
            hookedAny = true;
            if (a.kind === 'hero') break;
          }
        }
        if (!hookedAny) {
          this.applySkillAreaEffects(impactCenter.x, impactCenter.z, spec.radius, dmg, spec);
        }
        break;
      }

      case 'laser_beam':
      case 'snipe_shot': {
        ArcadeAudio.play('shoot');
        this.spawnElementalVfx(elemTheme, 'beam', this.px, this.pz, spec.range, this.pYaw);
        this.firePlayerBolt(this.pYaw, Math.round(dmg * 0.9), 1.15, fxColor, elemTheme, 1.35);
        this.firePlayerBolt(this.pYaw, Math.round(dmg * 0.65), 1.25, fxColor, elemTheme, 1.15);
        const dirX = Math.sin(this.pYaw);
        const dirZ = Math.cos(this.pYaw);
        for (const a of this.actors) {
          if (!a.alive || a.team !== 'red') continue;
          const rx = a.x - this.px;
          const rz = a.z - this.pz;
          const proj = rx * dirX + rz * dirZ;
          const perp = Math.abs(rx * dirZ - rz * dirX);
          if (proj > 0 && proj <= spec.range && perp < 3.6) {
            this.applyElementalStatusToActor(a, elemTheme, spec.ccKind, dmg);
            this.damageEnemyActor(a, dmg, true, 'magic');
            this.spawnElementalVfx(elemTheme, 'ring', a.x, a.z, 3.8, this.pYaw);
          }
        }
        for (const jc of this.jungleCamps) {
          if (!jc.alive) continue;
          const rx = jc.x - this.px;
          const rz = jc.z - this.pz;
          const proj = rx * dirX + rz * dirZ;
          const perp = Math.abs(rx * dirZ - rz * dirX);
          if (proj > 0 && proj <= spec.range && perp < 4.2) {
            this.damageJungleCamp(jc, dmg);
          }
        }
        break;
      }

      case 'fan_volley':
      case 'homing_barrage': {
        ArcadeAudio.play('shoot');
        const spreads = spec.slot >= 3 ? [-0.36, -0.18, 0, 0.18, 0.36] : [-0.22, 0, 0.22];
        for (const off of spreads) {
          this.firePlayerBolt(this.pYaw + off, Math.round(dmg * 0.55), 0.95, fxColor, elemTheme, 1.22);
        }
        this.spawnElementalVfx(elemTheme, spec.vfx, this.px, this.pz, spec.radius, this.pYaw);
        this.applySkillAreaEffects(impactCenter.x, impactCenter.z, spec.radius * 0.9, Math.round(dmg * 0.55), spec);
        break;
      }

      case 'summon_clone':
      case 'summon_turret': {
        ArcadeAudio.play('plant');
        const isTurret = spec.kind === 'summon_turret';
        const sx = aimOverride
          ? aimOverride.aimX
          : Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.px + Math.sin(this.pYaw) * 4.0));
        const sz = aimOverride
          ? aimOverride.aimZ
          : Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.pz + Math.cos(this.pYaw) * 4.0));
        const summonMesh = isTurret
          ? (() => {
              const g = new THREE.Group();
              const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.3, 2.2, 8), createToonMaterial(this.heroBodyColor));
              base.position.y = 1.1;
              const orb = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.85, 0),
                createToonMaterial(fxColor, { emissive: fxColor, emissiveIntensity: 0.7 })
              );
              orb.position.y = 2.7;
              g.add(base, orb);
              return g;
            })()
          : buildMobaHeroMesh(this.heroBodyColor, this.heroCloakColor, fxColor, 1.05, this.heroDef.weapon, playerState.mobaSettings.outline);
        summonMesh.position.set(sx, 0, sz);
        this.three.scene.add(summonMesh);
        this.actors.push({
          id: this.nextActorId++,
          mesh: summonMesh,
          x: sx,
          z: sz,
          team: 'blue',
          kind: isTurret ? 'summon_turret' : 'summon_clone',
          hp: Math.round(this.maxLives * 0.75),
          maxHp: Math.round(this.maxLives * 0.75),
          atk: Math.round(this.atkDmg * 0.9),
          cd: 0.25,
          lane: 1,
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
          lifeTimer: 12.0,
          respawnTimer: 0,
          spawnX: sx,
          spawnZ: sz,
          label: isTurret ? 'Sentry' : 'Clone'
        });
        this.spawnElementalVfx(elemTheme, spec.vfx, sx, sz, 5.5, this.pYaw);
        this.applySkillAreaEffects(sx, sz, 6.2, Math.round(dmg * 0.7), spec);
        break;
      }

      case 'orbital_drop': {
        ArcadeAudio.play('explosion');
        const tx = aimOverride ? aimOverride.aimX : tgt ? tgt.x : impactCenter.x;
        const tz = aimOverride ? aimOverride.aimZ : tgt ? tgt.z : impactCenter.z;
        this.cameraShake = Math.max(this.cameraShake, 0.35);
        this.spawnElementalVfx(elemTheme, spec.vfx, tx, tz, spec.radius, this.pYaw);
        this.applySkillAreaEffects(tx, tz, spec.radius, dmg, spec);
        break;
      }

      case 'cc_freeze_root':
      case 'whirlwind_spin': {
        ArcadeAudio.play('combo');
        const cx = spec.targeting === 'self' ? this.px : impactCenter.x;
        const cz = spec.targeting === 'self' ? this.pz : impactCenter.z;
        this.spawnElementalVfx(elemTheme, spec.vfx, cx, cz, spec.radius, this.pYaw);
        this.applySkillAreaEffects(cx, cz, spec.radius, dmg, spec);
        break;
      }

      default: {
        ArcadeAudio.play(spec.slot >= 3 ? 'combo' : 'explosion');
        const cx = spec.targeting === 'self' ? this.px : impactCenter.x;
        const cz = spec.targeting === 'self' ? this.pz : impactCenter.z;
        if (spec.slot >= 3) this.cameraShake = Math.max(this.cameraShake, 0.35);
        if (spec.targeting === 'line') {
          this.firePlayerBolt(this.pYaw, Math.round(dmg * 0.65), 0.9, fxColor, elemTheme, 1.35);
        }
        this.spawnElementalVfx(elemTheme, spec.vfx, cx, cz, spec.radius, this.pYaw);
        this.applySkillAreaEffects(cx, cz, spec.radius, dmg, spec);
        break;
      }
    }

    this.pushMobaHudSnapshot();
  }

  protected applyElementalStatusToActor(
    a: MobaActor,
    elementTheme: MobaElementTheme,
    ccKind: MobaCcKind,
    baseDmg: number
  ): void {
    const eff = resolveElementStatusEffect(elementTheme, ccKind);
    if (eff.statusKind === 'none' || eff.durationSec <= 0) return;

    // Ice chill/freeze also slows or briefly immobilizes
    if (eff.statusKind === 'freeze') {
      a.slowTimer = Math.max(a.slowTimer, eff.durationSec);
      if (ccKind === 'stun' || ccKind === 'root') {
        a.rootTimer = Math.max(a.rootTimer, Math.min(1.8, eff.durationSec));
      }
    } else if (eff.statusKind === 'soak' || eff.statusKind === 'crush') {
      a.slowTimer = Math.max(a.slowTimer, 1.4);
    } else if (eff.statusKind === 'vine') {
      a.rootTimer = Math.max(a.rootTimer, Math.min(1.5, eff.durationSec * 0.65));
    }

    const prevKind = a.statusKind;
    a.statusKind = eff.statusKind;
    a.statusTimer = Math.max(a.statusTimer ?? 0, eff.durationSec);
    if (eff.dotDpsRatio > 0) {
      a.statusDps = Math.max(a.statusDps ?? 0, Math.max(5, Math.round(baseDmg * eff.dotDpsRatio)));
    }
    if (a.statusTickAcc === undefined) a.statusTickAcc = 0;

    if (prevKind !== eff.statusKind || !a.statusFxGroup) {
      if (a.statusFxGroup) {
        disposeObjectTree(a.statusFxGroup);
        a.mesh.remove(a.statusFxGroup);
      }
      const fx = createElementalStatusMesh(eff.statusKind);
      a.mesh.add(fx);
      a.statusFxGroup = fx;
    } else {
      a.statusFxGroup.visible = true;
    }
  }

  protected applyCcToActor(a: MobaActor, kind: MobaCcKind, sec: number, cx: number, cz: number): void {
    if (kind === 'stun') {
      a.stunTimer = Math.max(a.stunTimer, sec);
    } else if (kind === 'root') {
      a.rootTimer = Math.max(a.rootTimer, sec);
    } else if (kind === 'silence') {
      a.silenceTimer = Math.max(a.silenceTimer, sec);
    } else if (kind === 'fear') {
      a.fearTimer = Math.max(a.fearTimer, sec);
    } else if (kind === 'taunt') {
      a.tauntTimer = Math.max(a.tauntTimer, sec);
    } else if (kind === 'slow') {
      a.slowTimer = Math.max(a.slowTimer, sec);
    } else if (kind === 'pull') {
      a.x = a.x * 0.42 + cx * 0.58;
      a.z = a.z * 0.42 + cz * 0.58;
      a.mesh.position.set(a.x, 0, a.z);
      a.stunTimer = Math.max(a.stunTimer, Math.min(0.85, sec));
    } else if (kind === 'flip') {
      a.x = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.px - Math.sin(this.pYaw) * 3.2));
      a.z = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.pz - Math.cos(this.pYaw) * 3.2));
      a.mesh.position.set(a.x, 0, a.z);
      a.airborneTimer = 0.45;
      a.airborneDur = 0.45;
      a.airbornePeak = 3.0;
      a.stunTimer = Math.max(a.stunTimer, sec);
    } else if (kind === 'knockback') {
      const dx = a.x - cx;
      const dz = a.z - cz;
      const len = Math.hypot(dx, dz) || 1;
      a.x = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, a.x + (dx / len) * 4.8));
      a.z = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, a.z + (dz / len) * 4.8));
      a.mesh.position.set(a.x, 0, a.z);
      a.airborneTimer = 0.36;
      a.airborneDur = 0.36;
      a.airbornePeak = 1.9;
    }
  }

  protected applySkillAreaEffects(cx: number, cz: number, rad: number, dmg: number, spec: MobaSkillEffectSpec): void {
    const iceSlow = this.computedStats.hasIceBound ? 1.5 : 0;
    const dmgType: 'phys' | 'magic' =
      this.heroDef.role === 'Mage' || this.heroDef.role === 'Support' ? 'magic' : 'phys';
    let hitAny = false;

    for (const a of this.actors) {
      if (!a.alive || a.team !== 'red') continue;
      if (Math.hypot(a.x - cx, a.z - cz) <= rad) {
        hitAny = true;
        if (spec.ccKind !== 'none') {
          this.applyCcToActor(a, spec.ccKind, spec.ccSec, cx, cz);
        } else if (iceSlow > 0) {
          a.slowTimer = Math.max(a.slowTimer, iceSlow);
        }
        this.applyElementalStatusToActor(a, spec.elementTheme, spec.ccKind, dmg);
        // Keystone Talent: Impure Rage (+4% target max HP bonus Magic Damage on skill hit)
        const impureBonus = this.keystoneT3 === 'impure_rage' ? Math.max(6, Math.round(a.maxHp * 0.04)) : 0;
        this.damageEnemyActor(a, dmg + impureBonus, true, dmgType);
      }
    }
    for (const jc of this.jungleCamps) {
      if (!jc.alive) continue;
      if (Math.hypot(jc.x - cx, jc.z - cz) <= rad + 1.2) {
        hitAny = true;
        if (spec.ccKind === 'stun' || spec.ccKind === 'root') {
          jc.stunTimer = Math.max(jc.stunTimer, spec.ccSec);
        }
        this.damageJungleCamp(jc, dmg);
      }
    }
    for (const t of this.turrets) {
      if (t.alive && t.team === 'red' && Math.hypot(t.x - cx, t.z - cz) <= rad + 1.5) {
        this.damageTurret(t, Math.round(dmg * 0.72));
      }
    }

    // Keystone Talent: Brave Smite (skill damage restores 5% Max HP)
    if (hitAny && this.keystoneT3 === 'brave_smite' && this.braveSmiteCd <= 0) {
      this.braveSmiteCd = 4.5;
      const heal = Math.max(8, Math.round(this.maxLives * 0.05));
      this.lives = Math.min(this.maxLives, this.lives + heal);
      updateHealthDisplay(this.lives, this.maxLives);
      this.spawnDamageNumber(this.px, this.pz, heal, 'heal');
    }
  }

  castBattleSpell(aimOverride?: SkillAimOverride): void {
    if (this.cdSpell > 0 || this.gameOver || this.isPaused || this.frozenTimer > 0) return;
    const talentSpellCdMult =
      playerState.mobaEmblemTalents[playerState.selectedMobaEmblem]?.t2 === 'pull_yourself_together' ? 0.85 : 1.0;
    const cd = this.spellDef.cooldownSec * this.cdMult * talentSpellCdMult;
    this.cdSpell = cd;
    this.maxCdSpell = cd;
    this.recallTimer = 0;
    ArcadeAudio.play('levelup');
    this.spawnVfx('ring', this.px, this.pz, 6.8, this.spellDef.colorNum);

    switch (this.spellDef.id) {
      case 'execute': {
        let bestHero: MobaActor | null = null;
        if (aimOverride?.lockedTargetId !== null && aimOverride?.lockedTargetId !== undefined) {
          const locked = this.actors.find(
            (a) =>
              a.id === aimOverride.lockedTargetId &&
              a.alive &&
              a.team === 'red' &&
              Math.hypot(a.x - this.px, a.z - this.pz) < 12.5
          );
          if (locked) bestHero = locked;
        }
        if (!bestHero) {
          for (const a of this.actors) {
            if (!a.alive || a.team !== 'red') continue;
            if (Math.hypot(a.x - this.px, a.z - this.pz) < 10.5) {
              if (!bestHero || a.hp < bestHero.hp) bestHero = a;
            }
          }
        }
        if (bestHero) {
          const missingHp = Math.max(0, bestHero.maxHp - bestHero.hp);
          const trueDmg = Math.round(115 + this.atkDmg * 1.4 + missingHp * 0.16);
          const wasAlive = bestHero.alive;
          this.applyElementalStatusToActor(bestHero, 'blood', 'none', trueDmg);
          this.damageEnemyActor(bestHero, trueDmg, true, 'true');
          if (wasAlive && !bestHero.alive && bestHero.kind === 'hero') {
            this.cdSpell *= 0.6;
          }
          this.spawnElementalVfx('blood', 'slash_arc', bestHero.x, bestHero.z, 5.4, this.pYaw);
        } else {
          for (const jc of this.jungleCamps) {
            if (jc.alive && Math.hypot(jc.x - this.px, jc.z - this.pz) < 10.5) {
              this.damageJungleCamp(jc, Math.round(120 + this.atkDmg * 1.3));
              break;
            }
          }
        }
        this.showKillfeed('💀 EXECUTE: TRUE DAMAGE FINISHER!');
        break;
      }

      case 'retribution': {
        const smiteDmg = computeRetributionDamage(this.heroLevel, this.junglerStacks >= 5);
        const refX = aimOverride ? aimOverride.aimX : this.px;
        const refZ = aimOverride ? aimOverride.aimZ : this.pz;
        let smoteCamp: JungleCamp | null = null;
        let bestD = 15;
        for (const jc of this.jungleCamps) {
          if (!jc.alive) continue;
          const dHero = Math.hypot(jc.x - this.px, jc.z - this.pz);
          if (dHero > 16.5) continue;
          const dRef = Math.hypot(jc.x - refX, jc.z - refZ);
          if (dRef < bestD) {
            bestD = dRef;
            smoteCamp = jc;
          }
        }
        if (smoteCamp) {
          this.spawnElementalVfx('blood', 'lightning', smoteCamp.x, smoteCamp.z, 6.2, this.pYaw);
          this.damageJungleCamp(smoteCamp, smiteDmg, true);
          this.showKillfeed(`🩸 RETRIBUTION SMITE! ${smiteDmg} True DMG to ${smoteCamp.label}!`);
        } else {
          const aimedActor =
            aimOverride?.lockedTargetId !== null && aimOverride?.lockedTargetId !== undefined
              ? this.actors.find(
                  (a) =>
                    a.id === aimOverride.lockedTargetId &&
                    a.alive &&
                    a.team === 'red' &&
                    Math.hypot(a.x - this.px, a.z - this.pz) <= 16.5
                )
              : undefined;
          const targetActor = aimedActor ?? this.findNearestEnemyTarget()?.actor;
          if (targetActor) {
            this.damageEnemyActor(targetActor, Math.round(smiteDmg * 0.42), true, 'true');
            targetActor.slowTimer = Math.max(targetActor.slowTimer, 2.5);
            this.applyElementalStatusToActor(targetActor, 'blood', 'slow', smiteDmg);
            this.hasteTimer = Math.max(this.hasteTimer, 2.5);
            this.spawnElementalVfx('blood', 'lightning', targetActor.x, targetActor.z, 5.2, this.pYaw);
            this.showKillfeed('🩸 RETRIBUTION: STOLE SPEED & TRUE DAMAGE!');
          } else {
            this.showKillfeed('🩸 RETRIBUTION READY — MOVE CLOSER TO JUNGLE OR HERO!');
          }
        }
        break;
      }

      case 'inspire': {
        this.inspireTimer = 5.0;
        this.showKillfeed('🔥 INSPIRE: +55% ATK SPEED & ARMOR PIERCE (5s)!');
        break;
      }

      case 'sprint': {
        this.sprintBoostTimer = 6.0;
        this.slowImmuneTimer = 6.0;
        this.hasteTimer = Math.max(this.hasteTimer, 6.0);
        this.showKillfeed('💨 SPRINT: +50% MOVE SPEED & SLOW IMMUNITY (6s)!');
        break;
      }

      case 'revitalize': {
        const springGrp = new THREE.Group();
        const outer = new THREE.Mesh(
          new THREE.RingGeometry(5.6, 6.4, 32),
          new THREE.MeshBasicMaterial({
            color: 0x22c55e,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.78,
            polygonOffset: true,
            polygonOffsetFactor: -2
          })
        );
        outer.rotation.x = -Math.PI / 2;
        outer.position.y = 0.16;
        const pool = new THREE.Mesh(
          new THREE.CircleGeometry(5.6, 28),
          new THREE.MeshBasicMaterial({
            color: 0x4ade80,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.28,
            polygonOffset: true,
            polygonOffsetFactor: -1
          })
        );
        pool.rotation.x = -Math.PI / 2;
        pool.position.y = 0.14;
        springGrp.add(outer, pool);
        springGrp.position.set(this.px, 0, this.pz);
        this.three.scene.add(springGrp);
        this.healingSprings.push({ mesh: springGrp, x: this.px, z: this.pz, life: 5.0, tickAcc: 0 });
        this.showKillfeed('💚 REVITALIZE: HEALING SPRING SUMMONED (5s)!');
        break;
      }

      case 'aegis': {
        this.shieldTimer = Math.max(this.shieldTimer, 5.0);
        const instantShieldHeal = Math.round(this.maxLives * 0.14);
        this.lives = Math.min(this.maxLives, this.lives + instantShieldHeal);
        updateHealthDisplay(this.lives, this.maxLives);
        this.spawnVfx('dome', this.px, this.pz, 5.4, 0xfbbf24);
        this.showKillfeed('🛡️ AEGIS: HEAVY BARRIER SHIELD ACTIVATED (5s)!');
        break;
      }

      case 'petrify': {
        this.spawnVfx('dome', this.px, this.pz, 7.6, 0xa8a29e);
        const dmg = Math.round(80 + this.heroLevel * 12);
        for (const a of this.actors) {
          if (a.alive && a.team === 'red' && Math.hypot(a.x - this.px, a.z - this.pz) <= 8.2) {
            a.stunTimer = Math.max(a.stunTimer, 0.9);
            a.slowTimer = Math.max(a.slowTimer, 1.8);
            this.damageEnemyActor(a, dmg, true, 'magic');
          }
        }
        this.showKillfeed('🪨 PETRIFY: NEARBY ENEMIES TURNED TO STONE!');
        break;
      }

      case 'purify': {
        this.ccImmuneTimer = Math.max(this.ccImmuneTimer, 1.5);
        this.slowImmuneTimer = Math.max(this.slowImmuneTimer, 1.5);
        this.hasteTimer = Math.max(this.hasteTimer, 2.0);
        this.spawnVfx('dome', this.px, this.pz, 5.0, 0xfef08a);
        this.showKillfeed('✨ PURIFY: CC CLEANSED + 1.5s GOLDEN CC IMMUNITY!');
        break;
      }

      case 'flameshot': {
        if (aimOverride) {
          this.pYaw = aimOverride.aimYaw;
        } else {
          const tgt = this.findNearestEnemyTarget();
          if (tgt) this.pYaw = tgt.angle;
        }
        // Close-range knockback pulse
        for (const a of this.actors) {
          if (a.alive && a.team === 'red' && Math.hypot(a.x - this.px, a.z - this.pz) <= 6.2) {
            this.applyCcToActor(a, 'knockback', 0.6, this.px, this.pz);
          }
        }
        const m = createElementalProjectileMesh('fire', 1.65);
        m.position.set(this.px, 1.6, this.pz);
        m.rotation.y = this.pYaw;
        this.three.scene.add(m);
        this.bolts.push({
          mesh: m,
          x: this.px,
          z: this.pz,
          vx: Math.sin(this.pYaw) * 44,
          vz: Math.cos(this.pYaw) * 44,
          team: 'blue',
          dmg: Math.round(95 + this.atkDmg * 1.4),
          life: 2.8,
          isFlameshot: true,
          startX: this.px,
          startZ: this.pz,
          elementTheme: 'fire',
          isSharedMesh: false
        });
        this.spawnElementalVfx('fire', 'flame_wave', this.px, this.pz, 5.2, this.pYaw);
        this.showKillfeed('☄️ FLAMESHOT: GLOBAL FIRE BOLT LAUNCHED!');
        break;
      }

      case 'flicker': {
        this.spawnAfterimageGhost(this.px, this.py, this.pz, this.pYaw, 0x60a5fa);
        if (aimOverride) {
          this.pYaw = aimOverride.aimYaw;
          this.px = aimOverride.aimX;
          this.pz = aimOverride.aimZ;
        } else {
          this.px = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.px + Math.sin(this.pYaw) * 15));
          this.pz = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.pz + Math.cos(this.pYaw) * 15));
        }
        this.hasteTimer = Math.max(this.hasteTimer, 2.4);
        this.shieldTimer = Math.max(this.shieldTimer, 1.6);
        this.spawnElementalVfx('lightning', 'portal_warp', this.px, this.pz, 5.4, this.pYaw);
        this.showKillfeed('⚡ FLICKER: INSTANT BLINK + DEFENSE!');
        break;
      }

      case 'arrival': {
        let destX = 0;
        let destZ = 0;
        let bestScore = -Infinity;
        for (const t of this.turrets) {
          if (!t.alive || t.team !== 'blue' || t.isNexus) continue;
          const forward = t.x - t.z; // closer to Red Base (+108, -108)
          if (forward > bestScore) {
            bestScore = forward;
            destX = t.x + 2.5;
            destZ = t.z - 2.5;
          }
        }
        for (const a of this.actors) {
          if (!a.alive || a.team !== 'blue' || a.kind !== 'minion') continue;
          const forward = a.x - a.z;
          if (forward > bestScore) {
            bestScore = forward;
            destX = a.x;
            destZ = a.z;
          }
        }
        this.spawnAfterimageGhost(this.px, this.py, this.pz, this.pYaw, 0xc084fc);
        this.px = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, destX));
        this.pz = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, destZ));
        this.hasteTimer = Math.max(this.hasteTimer, 3.0);
        this.spawnVfx('portal_warp', this.px, this.pz, 6.2, 0xc084fc);
        this.showKillfeed('🌀 ARRIVAL: TELEPORTED TO FRONT LINE (+60% SPEED)!');
        break;
      }

      case 'vengeance': {
        this.vengeanceTimer = 3.5;
        this.shieldTimer = Math.max(this.shieldTimer, 3.5);
        for (const a of this.actors) {
          if (a.alive && a.team === 'red' && Math.hypot(a.x - this.px, a.z - this.pz) < 8.5) {
            this.damageEnemyActor(a, Math.round(this.atkDmg * 1.4), true, 'magic');
          }
        }
        this.showKillfeed('⚜️ VENGEANCE: 35% DR & MAGIC REFLECTION (3.5s)!');
        break;
      }
    }
    this.pushMobaHudSnapshot();
  }

  protected castHpRegen(): void {
    if (this.cdRegen > 0 || this.gameOver || this.isPaused) return;
    this.cdRegen = this.maxCdRegen * this.cdMult;
    this.regenHoTTimer = 3.2;
    const favorBonus = this.blessingId === 'favor' || this.blessingId === 'roam_favor' ? 0.26 : 0.16;
    const oracleBonus = this.equippedItemIds.includes('oracle') ? 1.3 : 1.0;
    const heal = Math.round(this.maxLives * favorBonus * oracleBonus);
    this.lives = Math.min(this.maxLives, this.lives + heal);
    updateHealthDisplay(this.lives, this.maxLives);
    this.spawnDamageNumber(this.px, this.pz, heal, 'heal');
    ArcadeAudio.play('levelup');
    this.spawnVfx('dome', this.px, this.pz, 4.2, 0x22c55e);
    this.showKillfeed(
      this.blessingId === 'favor' || this.blessingId === 'roam_favor'
        ? '💚 FAVOR BLESSING REGEN (+Enhanced Heal!)'
        : '💚 HP REGEN ACTIVE (+Healing Over Time)'
    );
    this.pushMobaHudSnapshot();
  }

  protected startRecall(): void {
    if (this.gameOver || this.isPaused || this.frozenTimer > 0) return;
    const modeDef = MOBA_MODES.find((m) => m.id === this.mobaMode);
    if (modeDef?.disableRecall) {
      this.showKillfeed('🚫 RECALL IS DISABLED IN BRAWL MODE!');
      return;
    }
    if (this.recallTimer <= 0) {
      this.recallTimer = 2.4;
      this.moveX = 0;
      this.moveZ = 0;
      this.tapTarget = null;
      ArcadeAudio.play('click');
      this.showKillfeed('🌀 RECALLING TO BASE FOUNTAIN (2.4s)...');
      this.pushMobaHudSnapshot();
    }
  }

  protected castActiveItem(): void {
    if (this.gameOver || this.isPaused || this.cdItemActive > 0) return;
    const kind = this.computedStats.activeKind;
    if (!kind) return;

    const cd = this.computedStats.activeCdSec * this.cdMult;
    this.cdItemActive = cd;
    this.maxCdItemActive = cd;
    this.recallTimer = 0;

    if (kind === 'wind_chant') {
      const dur = this.heroDef.role === 'Marksman' ? 2.0 : 1.2;
      this.windChantTimer = dur;
      ArcadeAudio.play('levelup');
      this.spawnVfx('dome', this.px, this.pz, 4.6, 0xa3e635);
      this.showKillfeed(`🍃 WIND OF NATURE: PHYSICAL IMMUNITY (${dur.toFixed(1)}s)!`);
    } else if (kind === 'frozen') {
      this.frozenTimer = 2.0;
      this.moveX = 0;
      this.moveZ = 0;
      this.tapTarget = null;
      ArcadeAudio.play('combo');
      this.spawnVfx('dome', this.px, this.pz, 4.8, 0x67e8f9);
      this.showKillfeed('❄️ WINTER CROWN: FROZEN STASIS (2.0s UNTARGETABLE)!');
    } else if (kind === 'conceal') {
      this.stealthTimer = Math.max(this.stealthTimer, 5.0);
      this.hasteTimer = Math.max(this.hasteTimer, 5.0);
      ArcadeAudio.play('dash');
      this.spawnVfx('portal_warp', this.px, this.pz, 5.4, 0xc084fc);
      this.showKillfeed('👻 CONCEAL BLESSING: CAMOUFLAGE & +50% MOVE SPEED (5.0s)!');
    }

    this.pushMobaHudSnapshot();
  }

  buyEquipment(itemId: string): boolean {
    if (this.gameOver) return false;
    const item = getMobaEquipmentById(itemId);
    if (!item) return false;
    const result = applyCraftedPurchase(item.id, this.equippedItemIds, Math.floor(this.gold));
    if (!result.ok) {
      if (result.reason) {
        this.showKillfeed(`🛒 ${result.reason}`);
      }
      return false;
    }

    this.gold = Math.max(0, this.gold - result.spentGold);
    this.equippedItemIds = result.nextEquippedIds;
    if (this.prioritizedItemId === item.id) {
      this.prioritizedItemId = null;
    }
    this.recomputeStats();
    ArcadeAudio.play('coin');
    this.spawnVfx('ring', this.px, this.pz, 3.8, 0xfacc15);
    const craftNote =
      result.consumedCount > 0 ? ` (Crafted -${Math.max(0, item.cost - result.spentGold)}g)` : '';
    this.showKillfeed(`${item.icon} Purchased ${item.name}${craftNote}!`);
    this.pushMobaHudSnapshot();
    return true;
  }

  sellEquipment(slotIdx: number): boolean {
    if (this.gameOver || slotIdx < 0 || slotIdx >= this.equippedItemIds.length) return false;
    const removedId = this.equippedItemIds[slotIdx];
    const item = getMobaEquipmentById(removedId);
    this.equippedItemIds.splice(slotIdx, 1);
    if (
      item?.category === 'movement' &&
      !this.equippedItemIds.some((id) => getMobaEquipmentById(id)?.category === 'movement')
    ) {
      this.blessingId = null;
    }
    const refund = item ? computeSellRefund(item.id) : 120;
    this.gold += refund;
    this.recomputeStats();
    ArcadeAudio.play('click');
    this.showKillfeed(`🪙 Sold ${item ? item.name : 'Item'} (+${refund} Gold · 60% refund)`);
    this.pushMobaHudSnapshot();
    return true;
  }

  buyBlessing(blessingId: string): boolean {
    if (this.gameOver) return false;
    const blessing = getMobaBlessingById(blessingId);
    if (!blessing) return false;
    const hasBoots = this.equippedItemIds.some((id) => getMobaEquipmentById(id)?.category === 'movement');
    if (!hasBoots) {
      this.showKillfeed('👢 Equip Movement Boots before attaching a Free Blessing!');
      return false;
    }
    if (this.blessingId === blessing.id) return false;
    if (this.gold < blessing.cost) {
      this.showKillfeed(`🪙 Need ${blessing.cost - Math.floor(this.gold)} more Gold for ${blessing.name}!`);
      return false;
    }
    this.gold -= blessing.cost;
    this.blessingId = blessing.id;
    this.recomputeStats();
    ArcadeAudio.play('levelup');
    this.spawnVfx('ring', this.px, this.pz, 4.2, 0x38bdf8);
    this.showKillfeed(`${blessing.icon} Boots Blessed: ${blessing.name} (${blessing.cost === 0 ? 'FREE' : `${blessing.cost}g`})!`);
    this.pushMobaHudSnapshot();
    return true;
  }

  quickBuy(itemId?: string): boolean {
    if (this.gameOver) return false;
    if (itemId) {
      if (getMobaBlessingById(itemId)) return this.buyBlessing(itemId);
      return this.buyEquipment(itemId);
    }
    const rec = getNextQuickBuyRecommendation(
      this.heroDef.role,
      this.equippedItemIds,
      this.blessingId,
      this.gold,
      this.customBuildIds,
      this.prioritizedItemId
    );
    if (!rec) return false;
    if (rec.kind === 'item') {
      return this.buyEquipment(rec.id);
    }
    return this.buyBlessing(rec.id);
  }

  setPrioritizedItem(itemId: string | null): void {
    this.prioritizedItemId = this.prioritizedItemId === itemId ? null : itemId;
    if (this.prioritizedItemId) {
      const it = getMobaEquipmentById(this.prioritizedItemId);
      if (it) this.showKillfeed(`📌 Prioritized ${it.name} in Quick-Buy!`);
    } else {
      this.showKillfeed('📌 Cleared Quick-Buy Priority.');
    }
    this.pushMobaHudSnapshot();
  }

  setBuildPreset(presetIdx: number): void {
    const presets = ROLE_BUILD_PRESETS[this.heroDef.role] ?? ROLE_BUILD_PRESETS.Fighter;
    const clamped = Math.max(0, Math.min(presets.length - 1, presetIdx));
    this.activePresetIdx = clamped;
    this.customBuildIds = [...presets[clamped].items];
    this.showKillfeed(`📋 Switched Build Preset: ${presets[clamped].name}`);
    this.pushMobaHudSnapshot();
  }

  sendMapPing(
    kind: 'turtle' | 'lord' | 'gather' | 'retreat' | 'lane',
    nx: number,
    nz: number,
    label: string
  ): void {
    const ping: MobaMinimapPingHud = {
      id: this.nextPingId++,
      kind,
      nx: Math.max(0.04, Math.min(0.96, nx)),
      nz: Math.max(0.04, Math.min(0.96, nz)),
      label,
      ttl: 4.5
    };
    this.minimapPings.push(ping);
    if (this.minimapPings.length > 6) this.minimapPings.shift();
    this.tacticalPingText = `📣 ${label}`;
    this.tacticalPingTimer = 4.0;
    ArcadeAudio.play('click');
    this.showKillfeed(`📣 TEAM PING: ${label}`);
    this.pushMobaHudSnapshot();
  }

  activateFlyingCloud(): boolean {
    if (this.activeMapVariant.id !== 'flying_cloud' || this.flyingCloudCd > 0 || this.gameOver) return false;
    const nearCloud =
      Math.hypot(this.px - FLYING_CLOUD_BLUE_SPOT[0], this.pz - FLYING_CLOUD_BLUE_SPOT[1]) <= 14 ||
      Math.hypot(this.px - BLUE_BASE_X, this.pz - BLUE_BASE_Z) <= 16;
    if (!nearCloud) return false;
    this.flyingCloudCd = MLBB_TIMERS.FLYING_CLOUD_COOLDOWN_SEC;
    this.pYaw = Math.atan2(1, -1); // northeast toward mid/river
    this.startPlayerMotion('leap', 58, 1.35, 12.0);
    this.hasteTimer = Math.max(this.hasteTimer, 3.0);
    ArcadeAudio.play('dash');
    this.spawnVfx('portal_warp', this.px, this.pz, 6.2, 0xa78bfa);
    this.showKillfeed('☁️ FLYING CLOUD LAUNCH! Soaring over Base Walls!');
    this.pushMobaHudSnapshot();
    return true;
  }

  triggerAction(actionKey: string, pressed: boolean): void {
    if (!pressed || this.gameOver || this.isPaused) return;
    if (actionKey === 'action' || actionKey === 'attack') this.attack();
    else if (actionKey === 'jump' || actionKey === 'skill1') this.castHeroSkill(0);
    else if (actionKey === 'skill2') this.castHeroSkill(1);
    else if (actionKey === 'skill3') this.castHeroSkill(2);
    else if (actionKey === 'skill4') this.castHeroSkill(3);
    else if (actionKey === 'spell') this.castBattleSpell();
    else if (actionKey === 'regen') this.castHpRegen();
    else if (actionKey === 'recall') this.startRecall();
    else if (actionKey === 'itemActive') this.castActiveItem();
  }

  protected spawnElementalVfx(
    theme: MobaElementTheme,
    kind: MobaVfxKind | 'dome',
    x: number,
    z: number,
    size: number,
    yaw = this.pYaw
  ): void {
    const built = createElementalImpactVfx(theme, kind, size, yaw);
    built.group.position.set(x, 0, z);
    this.three.scene.add(built.group);
    this.fxObjs.push({
      mesh: built.group,
      life: built.duration,
      maxLife: built.duration,
      mode: 'elemental',
      elemAnim: built.animKind
    });
  }

  protected spawnVfx(kind: MobaVfxKind | 'dome', x: number, z: number, size: number, color: number): void {
    if (kind === 'beam') {
      const geo = new THREE.CylinderGeometry(0.55, 0.75, size, 10);
      geo.translate(0, size / 2, 0);
      geo.rotateX(Math.PI / 2);
      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 })
      );
      mesh.position.set(x, 1.5, z);
      mesh.rotation.y = this.pYaw;
      this.three.scene.add(mesh);
      this.fxObjs.push({ mesh, life: 0.32, maxLife: 0.32, mode: 'beam' });
      return;
    }

    if (kind === 'meteor' || kind === 'lightning' || kind === 'portal_warp') {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(size * 0.22, size * 0.48, 18, 12),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.68 })
      );
      pillar.position.set(x, 9, z);
      this.three.scene.add(pillar);
      this.fxObjs.push({ mesh: pillar, life: 0.36, maxLife: 0.36, mode: 'pillar' });
    }

    if (kind === 'dome' || kind === 'shield_dome' || kind === 'transform_giant') {
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(2.2, size * 0.45), 14, 12),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, wireframe: true })
      );
      dome.position.set(x, 1.8, z);
      this.three.scene.add(dome);
      this.fxObjs.push({ mesh: dome, life: 0.42, maxLife: 0.42, mode: 'dome' });
    }

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(size * 0.38, size, 24),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.78 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.16, z);
    this.three.scene.add(ring);
    this.fxObjs.push({ mesh: ring, life: 0.3, maxLife: 0.3, mode: 'ring' });
  }

  protected setPurpleShortcutOpen(campId: string, open: boolean): void {
    for (const w of this.purpleShortcutWalls) {
      if (w.campId !== campId) continue;
      w.open = open;
      const mat = w.mesh.material as THREE.MeshToonMaterial;
      mat.opacity = open ? 0.16 : 0.92;
      w.mesh.position.y = open ? 0.25 : 1.8;
    }
  }

  protected spawnLittleCrammer(parentX: number, parentZ: number): void {
    const id = `little_crammer_${Date.now()}_${Math.floor(Math.random() * 999)}`;
    const sx = parentX + 2.6;
    const sz = parentZ + 1.8;
    const grp = this.createCampMesh('little_crammer', 0.72, 0xfb7185);
    grp.position.set(sx, 0, sz);
    this.three.scene.add(grp);
    const ringMesh = new THREE.Mesh(
      new THREE.RingGeometry(1.1, 1.45, 18),
      new THREE.MeshBasicMaterial({ color: 0xfb7185, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
    );
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(sx, 0.12, sz);
    this.three.scene.add(ringMesh);
    this.jungleCamps.push({
      id,
      campKind: 'little_crammer',
      label: 'Little Crammer',
      icon: '🐞',
      mesh: grp,
      ringMesh,
      leashRadius: 10.5,
      patience: 100,
      aggroed: true,
      outOfCombatSec: 0,
      x: sx,
      z: sz,
      homeX: sx,
      homeZ: sz,
      hp: 68,
      maxHp: 68,
      atk: 6,
      cd: 0.6,
      alive: true,
      respawnTimer: 0,
      respawnDelay: 0,
      goldReward: 26,
      scoreReward: 35,
      colorHex: '#fb7185',
      colorNum: 0xfb7185,
      stunTimer: 0,
      isSplitChild: true
    });
  }

  protected spawnLithoCompanions(originX: number, originZ: number): void {
    this.walkieGrassTimer = MLBB_TIMERS.WALKIE_GRASS_DURATION_SEC;
    // Remove older walkie / stone roamer wards
    for (let i = this.riverWards.length - 1; i >= 0; i--) {
      if (this.riverWards[i].kind !== 'wisp') {
        disposeObjectTree(this.riverWards[i].mesh);
        this.three.scene.remove(this.riverWards[i].mesh);
        this.riverWards.splice(i, 1);
      }
    }
    // Walkie Grass floating follower
    const wg = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 10, 10),
      createToonMaterial(0x2dd4bf, { emissive: 0x14b8a6, emissiveIntensity: 0.8 })
    );
    body.position.y = 1.6;
    wg.add(body);
    wg.position.set(this.px + 1.8, 0, this.pz + 1.8);
    this.three.scene.add(wg);
    this.riverWards.push({
      mesh: wg,
      x: this.px + 1.8,
      z: this.pz + 1.8,
      homeX: originX,
      homeZ: originZ,
      angle: 0,
      life: MLBB_TIMERS.WALKIE_GRASS_DURATION_SEC,
      kind: 'walkie'
    });

    // Stone Roamer patrolling river bush-reveal ward
    const sg = new THREE.Group();
    const stone = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.68, 0),
      createToonMaterial(0x38bdf8, { emissive: 0x0ea5e9, emissiveIntensity: 0.7 })
    );
    stone.position.y = 1.5;
    const vision = new THREE.Mesh(
      new THREE.RingGeometry(4.8, 5.4, 24),
      new THREE.MeshBasicMaterial({ color: 0x2dd4bf, side: THREE.DoubleSide, transparent: true, opacity: 0.42 })
    );
    vision.rotation.x = -Math.PI / 2;
    vision.position.y = 0.14;
    sg.add(stone, vision);
    sg.position.set(originX, 0, originZ);
    this.three.scene.add(sg);
    this.riverWards.push({
      mesh: sg,
      x: originX,
      z: originZ,
      homeX: originX,
      homeZ: originZ,
      angle: 0,
      life: 55,
      kind: 'stone_roamer'
    });
  }

  protected damageJungleCamp(jc: JungleCamp, dmg: number, isTrueDmg = false): void {
    if (!jc.alive) return;
    jc.aggroed = true;
    jc.outOfCombatSec = 0;

    let finalMult = this.blessingId?.startsWith('jungle_') || this.spellDef.id === 'retribution' ? 1.25 : 1.0;
    // Stage 3 Evolved Lord Neutral Aura: 40% DR reduced by 5% per nearby hero (min 15%)
    if (!isTrueDmg && jc.campKind === 'lord' && (jc.lordStage ?? 0) >= 3) {
      let nearbyHeroes = 1; // player
      for (const a of this.actors) {
        if (a.alive && a.kind === 'hero' && Math.hypot(a.x - jc.x, a.z - jc.z) <= 16) nearbyHeroes++;
      }
      const dr = computeEvolvedLordNeutralDr(nearbyHeroes);
      finalMult *= 1 - dr;
    }

    const applied = Math.max(1, Math.round(dmg * finalMult));
    jc.hp -= applied;
    this.spawnDamageNumber(jc.x, jc.z, applied, isTrueDmg ? 'true' : 'phys');

    if (jc.hp <= 0) {
      jc.alive = false;
      jc.aggroed = false;
      jc.patience = 100;
      jc.mesh.visible = false;
      jc.ringMesh.visible = false;
      if (jc.leashMesh) jc.leashMesh.visible = false;
      jc.x = jc.homeX;
      jc.z = jc.homeZ;
      jc.mesh.position.set(jc.x, 0, jc.z);
      this.jungleClears++;

      // Jungler Retribution Stack Tracking (0/5 -> 5/5)
      if (this.spellDef.id === 'retribution' && this.junglerStacks < 5) {
        this.junglerStacks = Math.min(5, this.junglerStacks + 1);
        if (this.junglerStacks === 5) {
          this.showKillfeed('🩸 RETRIBUTION EVOLVED (5/5 STACKS)! Max True DMG Unlocked!');
        }
      }

      if (jc.isSplitChild) {
        this.gold += jc.goldReward;
        this.grantHeroXp(30);
        disposeObjectTree(jc.mesh);
        disposeObjectTree(jc.ringMesh);
        this.three.scene.remove(jc.mesh);
        this.three.scene.remove(jc.ringMesh);
        const idx = this.jungleCamps.indexOf(jc);
        if (idx >= 0) this.jungleCamps.splice(idx, 1);
        this.showKillfeed(`🐞 Little Crammer Slain (+${jc.goldReward} Gold)`);
        this.pushMobaHudSnapshot();
        return;
      }

      this.gold += jc.goldReward;
      jc.respawnTimer = jc.respawnDelay;

      if (jc.campKind === 'blue_buff') {
        this.blueBuffTimer = MLBB_TIMERS.BUFF_DURATION_SEC;
        this.setPurpleShortcutOpen(jc.id, true);
        this.recomputeStats();
        this.lives = Math.min(this.maxLives, this.lives + Math.round(this.maxLives * 0.2));
        recordMobaDailyEvent('jungle');
        this.spawnVfx('dome', this.px, this.pz, 4.8, 0xa855f7);
        this.showKillfeed('🟣 PURPLE BUFF SLAIN! (-CDR, Energy/Mana Cost & Shortcut Wall Opened · 75s)');
      } else if (jc.campKind === 'red_buff') {
        this.redBuffTimer = MLBB_TIMERS.BUFF_DURATION_SEC;
        this.recomputeStats();
        const pen = computeOrangeBuffPenetrationPct(this.heroDef.role);
        this.lives = Math.min(this.maxLives, this.lives + Math.round(this.maxLives * 0.16));
        recordMobaDailyEvent('jungle');
        this.spawnVfx('dome', this.px, this.pz, 4.8, 0xf97316);
        this.showKillfeed(`🟠 ORANGE BUFF SLAIN! (+True DMG Burn, Slow & +${pen}% PEN · 75s)`);
      } else if (jc.campKind === 'fire_beetle') {
        this.spawnLittleCrammer(jc.homeX, jc.homeZ);
        recordMobaDailyEvent('jungle');
        this.showKillfeed(`🪲 Fire Beetle Split into Little Crammer! (+${jc.goldReward} Gold)`);
      } else if (jc.campKind === 'horned_lizard' || jc.campKind === 'lava_golem') {
        const healAmt = Math.round(this.maxLives * 0.14);
        this.lives = Math.min(this.maxLives, this.lives + healAmt);
        this.spawnDamageNumber(this.px, this.pz, healAmt, 'heal');
        recordMobaDailyEvent('jungle');
        this.showKillfeed(`${jc.icon} ${jc.label} Farmed (+${jc.goldReward} Gold & +${healAmt} HP)`);
      } else if (jc.campKind === 'litho') {
        this.spawnLithoCompanions(jc.homeX, jc.homeZ);
        recordMobaDailyEvent('jungle');
        this.showKillfeed('🌿 LITHOWANDERER SLAIN! Walkie Grass (45s) & Stone Roamer River Ward active!');
      } else if (jc.campKind === 'crab') {
        this.crabAuraTimer = MLBB_TIMERS.CRAB_AURA_DURATION_SEC;
        this.crabAuraAcc = 0;
        recordMobaDailyEvent('jungle');
        this.showKillfeed(`🦀 ${jc.label} Slain! (+18s Ticking Gold & EXP Aura)`);
      } else if (jc.campKind === 'turtle') {
        this.turtleKills++;
        const rew = computeTurtleRewards(this.turtleKills, this.heroLevel);
        this.gold += rew.teamGold;
        this.turtleBlessingTimer = rew.teamShieldSec;
        this.shieldTimer = Math.max(this.shieldTimer, 8.0);
        this.lives = Math.min(this.maxLives, this.lives + Math.round(this.maxLives * 0.22));
        recordMobaDailyEvent('boss');
        this.spawnVfx('dome', this.px, this.pz, 6.2, 0x10b981);

        // Healing Turtle Map Variant: summon a mini-turtle siege unit
        if (this.activeMapVariant.id === 'healing_turtle') {
          const mtMesh = buildSoldierMesh(0x10b981, 0x065f46, 0x6ee7b7, 0.95, playerState.mobaSettings.outline).group;
          mtMesh.position.set(this.px + 2, 0, this.pz - 2);
          this.three.scene.add(mtMesh);
          this.actors.push({
            id: this.nextActorId++,
            mesh: mtMesh,
            x: this.px + 2,
            z: this.pz - 2,
            team: 'blue',
            kind: 'summon_clone',
            hp: 260,
            maxHp: 260,
            atk: 26,
            cd: 0.5,
            lane: 1,
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
            lifeTimer: 40,
            respawnTimer: 0,
            spawnX: this.px,
            spawnZ: this.pz,
            label: 'Mini-Turtle'
          });
        }

        // Next Turtle Pit Logic (6:00 kill cutoff -> otherwise waits for 8:00 Lord)
        this.activeBossPit = this.activeBossPit === 'upper' ? 'lower' : 'upper';
        const nextPit = this.activeBossPit === 'upper' ? UPPER_RIVER_PIT : LOWER_RIVER_PIT;
        jc.homeX = nextPit[0];
        jc.homeZ = nextPit[1];
        jc.x = nextPit[0];
        jc.z = nextPit[1];
        jc.ringMesh.position.set(nextPit[0], 0.12, nextPit[1]);
        if (jc.leashMesh) jc.leashMesh.position.set(nextPit[0], 0.13, nextPit[1]);
        if (this.pitHologramGroup) this.pitHologramGroup.position.set(nextPit[0], 0, nextPit[1]);

        if (canRespawnNextTurtle(this.matchElapsed)) {
          jc.respawnTimer = MLBB_TIMERS.TURTLE_RESPAWN_SEC;
        } else {
          this.bossPhase = 'lord';
          jc.respawnTimer = Math.max(10, MLBB_TIMERS.FIRST_LORD_SEC - this.matchElapsed);
        }
        this.showKillfeed(`🐢 TURTLE #${this.turtleKills} SLAIN! (+${rew.teamGold}g Team Gold & Turtle's Blessing 120s)`);
      } else if (jc.campKind === 'lord') {
        const stage = (jc.lordStage && jc.lordStage >= 1 ? jc.lordStage : 1) as 1 | 2 | 3;
        this.spawnAlliedLord(stage);
        recordMobaDailyEvent('boss');
        const clock = evaluateBattlefieldClock(this.matchElapsed);
        jc.respawnTimer = clock.lordRespawnSec;
      }

      updateHealthDisplay(this.lives, this.maxLives);
      const rankMult = this.mobaMode === 'ranked' ? 1.5 : this.mobaMode === 'ai_vs' ? 0.75 : 1;
      this.score += Math.round(jc.scoreReward * rankMult);
      addCoins(Math.max(2, Math.round((jc.campKind === 'lord' ? 18 : jc.campKind === 'turtle' ? 12 : 4) * rankMult)));
      addXp(jc.campKind === 'lord' ? 40 : 14);
      this.grantHeroXp(jc.campKind === 'lord' ? 140 : jc.campKind === 'turtle' ? 110 : 55);
      ArcadeAudio.play('coin');
      updateInGameHud(this.score, this.level, this.gameIdx);
      this.pushMobaHudSnapshot();
    }
  }

  protected damageEnemyActor(
    a: MobaActor,
    dmg: number,
    byPlayer = true,
    dmgKind: 'phys' | 'magic' | 'true' | 'crit' = 'phys'
  ): void {
    let bonusMult =
      byPlayer && this.heroDef.archetype === 'burst' && a.hp < a.maxHp * 0.45 ? 1.25 : 1.0;

    if (byPlayer) {
      // Combat reveal for Bush Stealth (2s)
      if (this.inBush) this.bushRevealTimer = Math.max(this.bushRevealTimer, 2.0);
      // Blade of Despair (Despair: +25% when enemy HP < 50%)
      if (this.computedStats.hasDespair && a.hp < a.maxHp * 0.5) {
        bonusMult *= 1.25;
      }
      // Roaming Blessing: Dire Hit (+18% burst when enemy HP < 35%)
      if (this.computedStats.hasDireHit && a.hp < a.maxHp * 0.35) {
        bonusMult *= 1.18;
      }
      // Keystone Talent: Lethal Ignition (3 rapid hits within 5s deal bonus adaptive scorch burst)
      if (this.keystoneT3 === 'lethal_ignition' && this.lethalIgnitionCd <= 0 && a.kind === 'hero') {
        if (this.lethalIgnitionWindow <= 0) this.lethalIgnitionHits = 0;
        this.lethalIgnitionWindow = 4.5;
        this.lethalIgnitionHits++;
        if (this.lethalIgnitionHits >= 3) {
          this.lethalIgnitionHits = 0;
          this.lethalIgnitionWindow = 0;
          this.lethalIgnitionCd = 10.0;
          const scorch = Math.round(70 + this.heroLevel * 12);
          a.hp -= scorch;
          this.spawnDamageNumber(a.x, a.z, scorch, 'true');
          this.spawnVfx('ring', a.x, a.z, 3.6, 0xf97316);
        }
      }
    }

    // Demon Hunter Sword / Glowing Wand / Wishing Lantern (% Current HP bonus damage)
    const devourBonus =
      byPlayer && this.computedStats.hasDevour ? Math.min(45, Math.round(a.hp * 0.08)) : 0;

    const totalDmg = Math.max(1, Math.round(dmg * bonusMult) + devourBonus);
    a.hp -= totalDmg;

    if (byPlayer) {
      this.spawnDamageNumber(a.x, a.z, totalDmg, dmgKind);
    }

    // Sky Piercer (Lethality: instant execute if hero HP falls below 6%)
    if (byPlayer && this.equippedItemIds.includes('sky_piercer') && a.hp > 0 && a.hp <= a.maxHp * 0.06) {
      a.hp = 0;
    }

    if (a.hp <= 0) {
      a.alive = false;
      a.mesh.visible = false;
      if (this.lockedEnemyId === a.id) this.lockedEnemyId = null;
      if (a.kind === 'hero') {
        a.respawnTimer = 10.0;
      }
      const g = a.kind === 'lord' ? 180 : a.kind === 'hero' ? 115 : 28;
      if (byPlayer) {
        this.gold += Math.round(this.mobaMode === 'brawl' ? g * 1.5 : g);
        if (this.combatKit.passiveKind === 'kill_heal') {
          const heal = Math.round(this.maxLives * 0.18);
          this.lives = Math.min(this.maxLives, this.lives + heal);
          updateHealthDisplay(this.lives, this.maxLives);
          this.spawnDamageNumber(this.px, this.pz, heal, 'heal');
        }
        // Keystone Talent: Killing Spree (15% Max HP heal + 20% Move Speed on Hero elimination)
        if (a.kind === 'hero' && this.keystoneT3 === 'killing_spree') {
          const ksHeal = Math.round(this.maxLives * 0.15);
          this.lives = Math.min(this.maxLives, this.lives + ksHeal);
          this.hasteTimer = Math.max(this.hasteTimer, 3.0);
          updateHealthDisplay(this.lives, this.maxLives);
          this.spawnDamageNumber(this.px, this.pz, ksHeal, 'heal');
        }
        // Fleeting Time (Timestream: -30% Ultimate Cooldown on hero kill/assist)
        if (a.kind === 'hero' && this.computedStats.hasTimestream) {
          this.cdSkill3 = Math.max(0, this.cdSkill3 - this.maxCdSkill3 * 0.3);
          this.cdSkill4 = Math.max(0, this.cdSkill4 - this.maxCdSkill4 * 0.3);
        }
        // Equipped Elimination Effect VFX on hero/lord KO
        if (a.kind === 'hero' || a.kind === 'lord') {
          const elim = MOBA_ELIM_EFFECTS.find((e) => e.id === playerState.mobaElimEffect) ?? MOBA_ELIM_EFFECTS[0];
          this.spawnVfx('dome', a.x, a.z, 5.2, elim.colorNum);
          this.spawnVfx('lightning', a.x, a.z, 4.6, elim.colorNum);
        }
      }
      if (a.kind === 'hero' || a.kind === 'lord') {
        this.kills++;
        playerState.mobaKillsTotal++;
        persistMobaStats();
        if (a.kind === 'hero') recordMobaDailyEvent('kill');
        this.showKillfeed(
          a.kind === 'lord'
            ? `🐉 LORD SLAIN BY ${this.heroDef.name.toUpperCase()}!`
            : `⚔️ SLAY! ${this.heroDef.name} eliminated ${a.label || 'Enemy Hero'}!`
        );
        // Contextual AI ally celebration emote near takedown
        const nearbyAlly = this.actors.find(
          (ally) =>
            ally.alive &&
            ally.team === 'blue' &&
            ally.kind === 'hero' &&
            Math.hypot(ally.x - a.x, ally.z - a.z) <= 44
        );
        if (nearbyAlly) {
          this.triggerActorAiEmote(nearbyAlly, a.kind === 'lord' ? 'objective' : 'rally');
        }
      }
      const rankMult = this.mobaMode === 'ranked' ? 1.5 : this.mobaMode === 'ai_vs' ? 0.75 : 1;
      this.score += Math.round((a.kind === 'lord' ? 400 : a.kind === 'hero' ? 160 : 32) * rankMult);
      addCoins(Math.max(1, Math.round((a.kind === 'hero' ? 10 : 2) * rankMult)));
      addXp(a.kind === 'hero' ? 20 : 5);
      if (byPlayer) {
        this.grantHeroXp(a.kind === 'lord' ? 160 : a.kind === 'hero' ? 120 : 28);
      }
      ArcadeAudio.play(a.kind === 'minion' ? 'hit' : 'coin');
      updateInGameHud(this.score, this.level, this.gameIdx);
      this.pushMobaHudSnapshot();
    } else if (a.kind === 'hero' && a.hp > 0 && a.hp <= a.maxHp * 0.3) {
      this.triggerActorAiEmote(a, 'low_hp');
    }
  }

  protected damageTurret(t: TurretObj, dmg: number, byLord = false): void {
    const clock = evaluateBattlefieldClock(this.matchElapsed);
    const armorBuster = this.equippedItemIds.includes('malefic_roar') ? 1.25 : 1.0;
    let shieldDr = 1.0;
    if (t.tier === 1 && clock.outerTurretShieldActive) shieldDr = 0.72;
    else if (t.tier === 2 && clock.innerTurretEarlyDrActive) shieldDr = 0.8;
    else if (t.tier === 3 && clock.baseTurretEarlyBuffActive) shieldDr = 0.85;

    let totalDmg = Math.max(1, Math.round(dmg * armorBuster * shieldDr));
    // Stage 2+ Enhanced/Evolved Lord Turret Charge slam on first enemy turret
    if (byLord && this.lordChargeAvailable && t.team === 'red' && !t.isNexus) {
      this.lordChargeAvailable = false;
      totalDmg = Math.round(dmg * 2.8);
      this.cameraShake = Math.max(this.cameraShake, 0.52);
      this.spawnVfx('dome', t.x, t.z, 7.5, 0xfacc15);
      this.showKillfeed('💥 ENHANCED LORD TURRET CHARGE! Massive True DMG Slam!');
    }

    t.hp -= totalDmg;
    if (t.team === 'red') {
      this.spawnDamageNumber(t.x, t.z, totalDmg, byLord ? 'true' : 'phys');
      // Outer Turret Plating Gold (< 5:00)
      if (t.tier === 1 && clock.outerTurretShieldActive && t.platingGoldPaid < 160) {
        const plateGold = Math.min(160 - t.platingGoldPaid, Math.max(6, Math.round(totalDmg * 0.4)));
        t.platingGoldPaid += plateGold;
        this.gold += plateGold;
      }
    }
    if (t.hp <= 0) {
      t.alive = false;
      t.mesh.visible = false;
      ArcadeAudio.play('explosion');
      this.cameraShake = Math.max(this.cameraShake, 0.45);
      if (t.team === 'red') {
        playerState.mobaTurretsDestroyed++;
        persistMobaStats();
        const baseGold = t.isNexus ? 250 : 95;
        const goldReward =
          this.activeMapVariant.id === 'golden_turret' ? Math.round(baseGold * 1.65) : baseGold;
        this.gold += goldReward;
        this.grantHeroXp(t.isNexus ? 200 : 110);
        // Destroying Red Base Turret (T3) upgrades allied lane waves permanently to Super Minions
        if (t.tier === 3) {
          this.superMinionLanes.add(t.lane);
          this.showKillfeed(
            `🔥 RED BASE TURRET DESTROYED! Super Minions unlocked in ${t.lane === 1 ? 'Mid' : t.lane === this.laneAssign.expLaneIndex ? 'EXP' : 'Gold'} Lane!`
          );
        }
      }
      const rankMult = this.mobaMode === 'ranked' ? 1.5 : this.mobaMode === 'ai_vs' ? 0.75 : 1;
      this.score += Math.round((t.isNexus ? 1000 : 250) * rankMult);
      addCoins(Math.max(2, Math.round((t.isNexus ? 60 : 18) * rankMult)));
      addXp(40);
      if (!(t.team === 'red' && t.tier === 3)) {
        this.showKillfeed(
          t.isNexus
            ? `${t.team === 'red' ? '🏆 VICTORY! RED NEXUS DESTROYED!' : '💀 BLUE NEXUS FELL!'}`
            : `🏰 ${t.team === 'red' ? 'Enemy' : 'Allied'} Turret Destroyed!${this.activeMapVariant.id === 'golden_turret' ? ' (+65% Gold)' : ''}`
        );
      }
      if (t.team === 'red' && !t.isNexus) {
        const nearbyAlly = this.actors.find(
          (ally) =>
            ally.alive &&
            ally.team === 'blue' &&
            ally.kind === 'hero' &&
            Math.hypot(ally.x - t.x, ally.z - t.z) <= 50
        );
        if (nearbyAlly) {
          this.triggerActorAiEmote(nearbyAlly, 'objective');
        }
      }
      updateInGameHud(this.score, this.level, this.gameIdx);
      if (t.isNexus && t.team === 'red') {
        playerState.mobaWins++;
        persistMobaStats();
        if (this.mobaMode === 'ranked') {
          recordMobaDailyEvent('ranked_win');
        }
        this.endMatch(true);
      } else if (t.isNexus && t.team === 'blue') {
        this.endMatch(false);
      }
    }
  }

  protected applyPlayerDamage(rawDmg: number, attacker?: MobaActor): void {
    if (this.stealthTimer > 0 || this.frozenTimer > 0 || this.windChantTimer > 0 || this.untargetableTimer > 0) return;
    this.outOfCombatSec = 0;
    if (this.recallTimer > 0) {
      this.recallTimer = 0;
      this.showKillfeed('⚠️ RECALL INTERRUPTED BY DAMAGE!');
    }

    let mult = (this.shieldTimer > 0 ? 0.4 : 1.0) * (1 - this.computedStats.damageReductionPct);
    if (this.vengeanceTimer > 0) {
      mult *= 0.65; // Vengeance 35% Damage Reduction
    }
    if (this.combatKit.passiveKind === 'low_hp_armor' && this.lives < this.maxLives * 0.5) {
      mult *= 0.72;
    }

    const finalDmg = Math.max(1, Math.round(rawDmg * mult));
    this.lives = Math.max(0, this.lives - finalDmg);
    updateHealthDisplay(this.lives, this.maxLives);
    this.spawnDamageNumber(this.px, this.pz, finalDmg, 'phys');

    // Vengeance Battle Spell reflection (35% Magic Damage back to attacker)
    if (this.vengeanceTimer > 0 && attacker && attacker.alive && attacker.team === 'red') {
      const refDmg = Math.max(6, Math.round(rawDmg * 0.35 + 14));
      this.damageEnemyActor(attacker, refDmg, true, 'magic');
      this.spawnVfx('ring', attacker.x, attacker.z, 2.8, 0xf59e0b);
    }

    // Rose Gold Meteor / Queen's Wings (Lifeline / Demonize emergency shield below 32% HP)
    if (this.lives > 0 && this.lives < this.maxLives * 0.32 && this.computedStats.hasLifelineShield && this.lifelineCd <= 0) {
      this.lifelineCd = 35;
      this.shieldTimer = Math.max(this.shieldTimer, 3.5);
      this.hasteTimer = Math.max(this.hasteTimer, 2.5);
      this.spawnVfx('dome', this.px, this.pz, 4.2, 0xfacc15);
      this.showKillfeed('🛡️ LIFELINE SHIELD ACTIVATED!');
    }

    if (this.lives <= 0) {
      // Immortality (Immortal resurrection)
      if (this.computedStats.hasImmortality && this.immortalityCd <= 0) {
        this.immortalityCd = 55;
        this.lives = Math.round(this.maxLives * 0.25);
        this.shieldTimer = Math.max(this.shieldTimer, 3.0);
        updateHealthDisplay(this.lives, this.maxLives);
        ArcadeAudio.play('levelup');
        this.spawnVfx('dome', this.px, this.pz, 4.8, 0xfacc15);
        this.showKillfeed('🪽 IMMORTALITY RESURRECTED YOUR HERO!');
        this.pushMobaHudSnapshot();
        return;
      }

      if (this.combatKit.passiveKind === 'revive_cheat' && this.reviveCheatCd <= 0) {
        this.reviveCheatCd = 55;
        this.lives = Math.round(this.maxLives * 0.35);
        this.stealthTimer = 2.0;
        this.hasteTimer = 2.5;
        updateHealthDisplay(this.lives, this.maxLives);
        this.spawnVfx('dome', this.px, this.pz, 4.5, 0xfef08a);
        this.showKillfeed(`🥚 ${this.heroDef.name.toUpperCase()} PASSIVE CHEATED DEATH!`);
        return;
      }

      if (attacker && attacker.alive && attacker.kind === 'hero') {
        this.triggerActorAiEmote(attacker, 'kill');
      }
      this.deaths++;
      this.px = BLUE_BASE_X + 4;
      this.py = 0;
      this.pz = BLUE_BASE_Z - 4;
      this.activeMotion = null;
      this.lives = this.maxLives;
      this.playerTrailHp = this.maxLives;
      this.playerLastHp = this.maxLives;
      this.playerTrailHold = 0;
      ArcadeAudio.play('hurt');
      this.showKillfeed(`💀 ${this.heroDef.name} respawned at Base Fountain!`);
      updateHealthDisplay(this.lives, this.maxLives);
    }
  }

}
