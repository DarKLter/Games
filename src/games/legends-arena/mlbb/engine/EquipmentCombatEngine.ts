import { MlbbActiveBuffHud, MlbbDamageType } from '../types';
import { clamp, dist } from './CombatMath';
import type { SimCallbacks, SimHero, SimJungleMob, SimMinion } from './SkillPhysics';

/**
 * Per-hero dynamic combat state for Part 6 Equipment Passives, Emblem Talents,
 * Jungle/Roam Blessings, and Battle Spell duration/stack tracking.
 */
export interface SimItemTalentState {
  // Scaling & Stacking Equipment Passives
  skyPiercerStacks: number;
  thunderBeltStacks: number;
  thunderBeltCd: number;
  warAxeStacks: number;
  warAxeTimer: number;
  hunterStrikeHits: number;
  hunterStrikeCd: number;
  bruteForceStacks: number;
  bruteForceTimer: number;
  radiantStacks: number;
  radiantTimer: number;
  warriorBootsStacks: number;
  warriorBootsTimer: number;
  antiqueDebuffStacks: number;
  antiqueDebuffTimer: number;
  concentratedStacks: number;
  concentratedTimer: number;
  clockStacks: number;
  clockTimer: number;
  clockHealCd: number;
  geniusShredStacks: number;
  geniusShredTimer: number;
  impulseStacks: number;
  impulseTimer: number;
  dhsStacks: number;
  dhsTimer: number;
  berserkerBuffTimer: number;
  haasBuffTimer: number;
  bodBuffTimer: number;
  ogreCrisisCd: number;

  // Cooldown / Trigger Equipment Passives
  wishingLanternAccum: Record<string, number>;
  athenaActiveTimer: number;
  athenaCd: number;
  twilightCd: number;
  bloodWingsShieldCd: number;
  roseGoldCd: number;
  queensWingsTimer: number;
  queensWingsCd: number;
  chastiseCd: number;
  flaskOasisCd: number;
  windtalkerCd: number;
  lightningTruncheonCd: number;
  greatDragonCd: number;
  spellbladeReady: boolean;
  spellbladeCd: number;
  goldenStaffHits: number;
  direHitCd: number;
  favorCd: number;

  // Periodic DoT / Aura / Debuff States
  glowingBurnTimer: number;
  glowingBurnSourceId: string | null;
  cursedTickAccum: number;
  manaSpringAccum: number;
  dominanceSlowTimer: number;
  chastiseSlowTimer: number;
  weaknessAtkSlowTimer: number;

  // Tier 2 & Tier 3 Emblem Talent States
  festivalStacks: number;
  impureRageCd: number;
  quantumChargeCd: number;
  concussiveBlastCd: number;
  braveSmiteCd: number;
  weaknessFinderCd: number;
  lethalIgnitionHits: number;
  lethalIgnitionWindow: number;
  lethalIgnitionCd: number;
  warCryHits: number;
  warCryTimer: number;
  temporalReignTimer: number;
  focusingMarkTimer: number;
  focusingMarkTeam: 'blue' | 'red' | null;

  // Battle Spell & Retribution Blessing States
  inspireAttacksLeft: number;
  flickerDefTimer: number;
  flameRetriBonusAtk: number;
  flameRetriTimer: number;
  flameRetriDebuffAtk: number;
  flameRetriDebuffTimer: number;
  bloodyDrainTimer: number;
  bloodyDrainSourceId: string | null;
  bloodyDrainTickAccum: number;
  revitalizeZoneTimer: number;
  revitalizeZoneX: number;
  revitalizeZoneY: number;
  revitalizeTickAccum: number;
  revitalizeAmpTimer: number;
}

export function createInitialEquipState(): SimItemTalentState {
  return {
    skyPiercerStacks: 0,
    thunderBeltStacks: 0,
    thunderBeltCd: 0,
    warAxeStacks: 0,
    warAxeTimer: 0,
    hunterStrikeHits: 0,
    hunterStrikeCd: 0,
    bruteForceStacks: 0,
    bruteForceTimer: 0,
    radiantStacks: 0,
    radiantTimer: 0,
    warriorBootsStacks: 0,
    warriorBootsTimer: 0,
    antiqueDebuffStacks: 0,
    antiqueDebuffTimer: 0,
    concentratedStacks: 0,
    concentratedTimer: 0,
    clockStacks: 0,
    clockTimer: 0,
    clockHealCd: 0,
    geniusShredStacks: 0,
    geniusShredTimer: 0,
    impulseStacks: 0,
    impulseTimer: 0,
    dhsStacks: 0,
    dhsTimer: 0,
    berserkerBuffTimer: 0,
    haasBuffTimer: 0,
    bodBuffTimer: 0,
    ogreCrisisCd: 0,

    wishingLanternAccum: {},
    athenaActiveTimer: 0,
    athenaCd: 0,
    twilightCd: 0,
    bloodWingsShieldCd: 0,
    roseGoldCd: 0,
    queensWingsTimer: 0,
    queensWingsCd: 0,
    chastiseCd: 0,
    flaskOasisCd: 0,
    windtalkerCd: 0,
    lightningTruncheonCd: 0,
    greatDragonCd: 0,
    spellbladeReady: false,
    spellbladeCd: 0,
    goldenStaffHits: 0,
    direHitCd: 0,
    favorCd: 0,

    glowingBurnTimer: 0,
    glowingBurnSourceId: null,
    cursedTickAccum: 0,
    manaSpringAccum: 0,
    dominanceSlowTimer: 0,
    chastiseSlowTimer: 0,
    weaknessAtkSlowTimer: 0,

    festivalStacks: 0,
    impureRageCd: 0,
    quantumChargeCd: 0,
    concussiveBlastCd: 0,
    braveSmiteCd: 0,
    weaknessFinderCd: 0,
    lethalIgnitionHits: 0,
    lethalIgnitionWindow: 0,
    lethalIgnitionCd: 0,
    warCryHits: 0,
    warCryTimer: 0,
    temporalReignTimer: 0,
    focusingMarkTimer: 0,
    focusingMarkTeam: null,

    inspireAttacksLeft: 0,
    flickerDefTimer: 0,
    flameRetriBonusAtk: 0,
    flameRetriTimer: 0,
    flameRetriDebuffAtk: 0,
    flameRetriDebuffTimer: 0,
    bloodyDrainTimer: 0,
    bloodyDrainSourceId: null,
    bloodyDrainTickAccum: 0,
    revitalizeZoneTimer: 0,
    revitalizeZoneX: 0,
    revitalizeZoneY: 0,
    revitalizeTickAccum: 0,
    revitalizeAmpTimer: 0
  };
}

export function ensureEquipState(h: SimHero): SimItemTalentState {
  if (!h.equipState) {
    h.equipState = createInitialEquipState();
  }
  return h.equipState;
}

/**
 * Malefic Gun (+12% Basic Attack Range) helper used for targeting & projectile reach.
 */
export function getEffectiveAttackRange(h: SimHero): number {
  const base = h.heroDef.attackRange;
  return h.items.includes('malefic_gun') ? Math.round(base * 1.12) : base;
}

/**
 * Pull Yourself Together (Tier-2 Utility Talent): -15% Battle Spell & Active Item CD.
 */
export function getSpellOrActiveCdMultiplier(h: SimHero): number {
  return h.talents.t2 === 'pull_yourself_together' ? 0.85 : 1.0;
}

/**
 * Computes live stat adjustments from Part 6 Equipment Passives, Stacking Items,
 * Roam Auras, and Emblem Talents during recalcHeroStats.
 */
export function applyEquipmentAndTalentStatMods(
  h: SimHero,
  itemAndEmblemBonusPhys: number,
  itemAndEmblemBonusMagic: number,
  allHeroes: readonly SimHero[],
  inJungleOrRiver: boolean
): void {
  const st = ensureEquipState(h);
  const prefersMagic = h.role === 'Mage' || (h.role === 'Support' && h.heroDef.baseMagicPow >= 0);

  // Weapon Master (Tier-2 Talent): +5% bonus Physical Attack & Magic Power from items & emblems
  if (h.talents.t2 === 'weapon_master') {
    h.physAtk += Math.round(itemAndEmblemBonusPhys * 0.05);
    h.magicPow += Math.round(itemAndEmblemBonusMagic * 0.05);
  }

  // Holy Crystal (Mystery): +21% to +35% Total Magic Power scaling with hero level
  if (h.items.includes('holy_crystal')) {
    const mult = 0.21 + ((h.level - 1) / 14) * 0.14;
    h.magicPow = Math.round(h.magicPow * (1 + mult));
  }

  // War Axe (Fighting Spirit): +12 Phys ATK per stack (max 6 = +72)
  if (st.warAxeTimer > 0 && st.warAxeStacks > 0) {
    h.physAtk += st.warAxeStacks * 12;
  }

  // Blade of Despair active buff (+25% Phys ATK for 2s)
  if (st.bodBuffTimer > 0) {
    h.physAtk = Math.round(h.physAtk * 1.25);
  }

  // Berserker's Fury (Doom): +5% Phys ATK for 2s after crit
  if (st.berserkerBuffTimer > 0) {
    h.physAtk = Math.round(h.physAtk * 1.05);
  }

  // Brute Force Breastplate: +6 Adaptive ATK & +2% MS per stack (max 6); +15% CC Res at max
  if (st.bruteForceTimer > 0 && st.bruteForceStacks > 0) {
    const adapt = st.bruteForceStacks * 6;
    if (prefersMagic) h.magicPow += adapt;
    else h.physAtk += adapt;
    h.moveSpd = Math.round(h.moveSpd * (1 + st.bruteForceStacks * 0.02));
    if (st.bruteForceStacks >= 6) {
      h.ccResPct = Math.min(0.6, h.ccResPct + 0.15);
    }
  }

  // Concentrated Energy: +5 Magic Power per stack (max 6 = +30)
  if (st.concentratedTimer > 0 && st.concentratedStacks > 0) {
    h.magicPow += st.concentratedStacks * 5;
  }

  // Clock of Destiny: +4.5 Hybrid DEF per stack (max 6)
  if (st.clockTimer > 0 && st.clockStacks > 0) {
    const bonus = Math.round(st.clockStacks * (4.5 + h.level * 0.35));
    h.physDef += bonus;
    h.magicDef += bonus;
  }

  // Thunder Belt: permanent +1 Hybrid DEF per stack
  if (st.thunderBeltStacks > 0) {
    h.physDef += st.thunderBeltStacks;
    h.magicDef += st.thunderBeltStacks;
  }

  // Radiant Armor: +5..+8 Magic DEF per stack (max 6)
  if (st.radiantTimer > 0 && st.radiantStacks > 0) {
    const perStack = 5 + Math.round(((h.level - 1) / 14) * 3);
    h.magicDef += st.radiantStacks * perStack;
  }

  // Warrior Boots (Valor): +4 Phys DEF per stack (max 5 = +20)
  if (st.warriorBootsTimer > 0 && st.warriorBootsStacks > 0) {
    h.physDef += st.warriorBootsStacks * 4;
  }

  // Tenacity (Tier-2 Talent): <50% HP grants +15 Physical & Magic Defense
  if (h.talents.t2 === 'tenacity' && h.hp / Math.max(1, h.maxHp) < 0.5) {
    h.physDef += 15;
    h.magicDef += 15;
  }

  // Flicker brief Hybrid Defense bonus (+6 + 1*Lv for 1.5s)
  if (st.flickerDefTimer > 0) {
    const bonus = 6 + h.level;
    h.physDef += bonus;
    h.magicDef += bonus;
  }

  // Flame Retribution Adaptive Attack steal / debuff
  if (st.flameRetriTimer > 0 && st.flameRetriBonusAtk > 0) {
    if (prefersMagic) h.magicPow += st.flameRetriBonusAtk;
    else h.physAtk += st.flameRetriBonusAtk;
  }
  if (st.flameRetriDebuffTimer > 0 && st.flameRetriDebuffAtk > 0) {
    h.physAtk = Math.max(20, h.physAtk - st.flameRetriDebuffAtk);
    h.magicPow = Math.max(0, h.magicPow - st.flameRetriDebuffAtk);
  }

  // Antique Cuirass / Dreadnaught Armor debuff (-6% Phys ATK per stack up to 3x = -18%)
  if (st.antiqueDebuffTimer > 0 && st.antiqueDebuffStacks > 0) {
    h.physAtk = Math.round(h.physAtk * Math.max(0.75, 1 - st.antiqueDebuffStacks * 0.06));
  }

  // Genius Wand Magic DEF shred
  if (st.geniusShredTimer > 0 && st.geniusShredStacks > 0) {
    h.magicDef -= st.geniusShredStacks * (3 + Math.floor(h.level * 0.28));
  }

  // Encourage Roam Blessing passive aura (+12..+30 Adaptive ATK & +15% ATK Speed to nearby allies)
  const hasEncourageAura = allHeroes.some(
    (ally) =>
      ally.alive &&
      ally.team === h.team &&
      ally.id !== h.id &&
      ally.blessingId === 'roam_encourage' &&
      dist(ally.x, ally.y, h.x, h.y) <= 520
  );
  if (hasEncourageAura) {
    const bonusAtk = 12 + Math.round(((h.level - 1) / 14) * 18);
    if (prefersMagic) h.magicPow += bonusAtk;
    else h.physAtk += bonusAtk;
    h.atkSpd = Math.min(5.0, h.atkSpd * 1.15);
  }

  // Festival of Blood (Tier-2 Talent): +0.5% Spell Vamp per stack (max 8 stacks = +4% extra -> +10% total)
  if (h.talents.t2 === 'festival_of_blood' && st.festivalStacks > 0) {
    h.spellVampPct += Math.min(8, st.festivalStacks) * 0.005;
  }

  // DHS Lifesteal stacks (+3% per stack up to 5x)
  if (st.dhsTimer > 0 && st.dhsStacks > 0) {
    h.lifestealPct += st.dhsStacks * 0.03;
  }

  // Impulse (Corrosion Scythe / Feather of Heaven / Swift Crossbow) & Haas's Claws ATK Speed boosts
  if (st.impulseTimer > 0 && st.impulseStacks > 0) {
    h.atkSpd = Math.min(5.0, h.atkSpd * (1 + st.impulseStacks * 0.06));
  }
  if (st.haasBuffTimer > 0) {
    h.atkSpd = Math.min(5.0, h.atkSpd * 1.2);
  }

  // Golden Staff (Swift): converts Crit Chance into extra Attack Speed (1% Crit -> +1% ATK Spd) and disables crit
  if (h.items.includes('golden_staff') && h.critChance > 0) {
    h.atkSpd = Math.min(5.0, h.atkSpd * (1 + h.critChance));
    h.critChance = 0;
  }

  // Dominance Ice / Chastise Pauldron / Weakness Finder Attack Speed reduction debuffs
  let atkSpdMult = 1;
  if (st.dominanceSlowTimer > 0) atkSpdMult = Math.min(atkSpdMult, 0.8);
  if (st.chastiseSlowTimer > 0) atkSpdMult = Math.min(atkSpdMult, 0.78);
  if (st.weaknessAtkSlowTimer > 0) atkSpdMult = Math.min(atkSpdMult, 0.7);
  if (atkSpdMult < 1) {
    h.atkSpd = Math.max(0.45, h.atkSpd * atkSpdMult);
  }

  // Wilderness Blessing (Tier-2 Talent): +10% MS in Jungle/River (halved in combat)
  if (h.talents.t2 === 'wilderness_blessing' && inJungleOrRiver) {
    const bonus = h.outOfCombatTimer >= 4 ? 0.1 : 0.05;
    h.moveSpd = Math.round(h.moveSpd * (1 + bonus));
  }

  // Rapid Boots Side Effect: -25 MS in combat
  if (h.items.includes('rapid_boots') && h.outOfCombatTimer < 5) {
    h.moveSpd = Math.max(180, h.moveSpd - 25);
  }

  // Blood Wings Guard: +30 MS while shield is active
  if (h.items.includes('blood_wings') && h.shield > 0) {
    h.moveSpd += 30;
  }
}

/**
 * Applies all offensive Equipment Passives & Emblem Talents before damage mitigation,
 * returning adjusted raw damage, extra true/magic/physical bonus damage, and extra penetration.
 */
export function computeOffensiveItemAndTalentMods(
  attacker: SimHero,
  target: SimHero,
  rawDmg: number,
  dmgType: MlbbDamageType,
  isBasic: boolean,
  isCrit: boolean,
  allHeroes: readonly SimHero[],
  callbacks: SimCallbacks
): {
  adjustedRaw: number;
  bonusTrueDmg: number;
  bonusMagicDmg: number;
  bonusPhysDmg: number;
  extraPctPhysPen: number;
  extraPctMagicPen: number;
  ignoreFlatDef: number;
} {
  const ast = ensureEquipState(attacker);
  const tst = ensureEquipState(target);
  let adj = rawDmg;
  let bonusTrueDmg = 0;
  let bonusMagicDmg = 0;
  let bonusPhysDmg = 0;
  let extraPctPhysPen = 0;
  let extraPctMagicPen = 0;
  let ignoreFlatDef = 0;

  // --- Penetration Scaling Passives ---
  // Malefic Roar (Breaker): +0.1% Phys PEN per point of enemy Phys DEF (up to +30% extra = 60% total)
  if (dmgType === 'physical' && attacker.items.includes('malefic_roar')) {
    extraPctPhysPen = Math.min(0.3, Math.max(0, target.physDef) * 0.001);
  }
  // Divine Glaive (Spellbreaker): +0.1% Magic PEN per point of enemy Magic DEF (up to +20% extra = 60% total)
  if (dmgType === 'magic' && attacker.items.includes('divine_glaive')) {
    extraPctMagicPen = Math.min(0.2, Math.max(0, target.magicDef) * 0.001);
  }

  // --- Inspire 8-Hit Basic Attack Charge (Armor Ignore + Heal) ---
  if (isBasic && attacker.inspireTimer > 0 && ast.inspireAttacksLeft > 0) {
    ast.inspireAttacksLeft--;
    ignoreFlatDef += 8 + attacker.level;
    callbacks.healHero(attacker, 60 + attacker.physAtk * 0.15, attacker);
    if (ast.inspireAttacksLeft <= 0) attacker.inspireTimer = 0;
  }

  // --- Percentage Multipliers ---
  // Blade of Despair (<50% HP triggers +25% Phys ATK buff for 2s)
  if (attacker.items.includes('blade_of_despair') && target.hp / Math.max(1, target.maxHp) < 0.5) {
    ast.bodBuffTimer = 2.0;
    adj *= 1.25;
  }
  // Berserker's Fury crit buff
  if (isCrit && attacker.items.includes('berserkers_fury')) {
    ast.berserkerBuffTimer = 2.0;
  }
  // Haas's Claws crit atk spd surge
  if (isCrit && attacker.items.includes('haas_claws')) {
    ast.haasBuffTimer = 2.0;
  }
  // Sea Halberd (Punish): +8% damage vs higher Max HP heroes
  if (attacker.items.includes('sea_halberd') && target.maxHp > attacker.maxHp) {
    adj *= 1.08;
  }
  // Queen's Wings (Defiance): up to +15% damage based on missing HP
  if (attacker.items.includes('queens_wings')) {
    const missingRatio = 1 - attacker.hp / Math.max(1, attacker.maxHp);
    adj *= 1 + clamp(missingRatio * 0.25, 0, 0.15);
  }
  // Concentrated Energy: stack Magic Power & +12% Magic Damage at 6 stacks
  if (dmgType === 'magic' && attacker.items.includes('concentrated_energy')) {
    ast.concentratedStacks = Math.min(6, ast.concentratedStacks + 1);
    ast.concentratedTimer = 4.0;
    if (ast.concentratedStacks >= 6) adj *= 1.12;
  }
  // Master Assassin (Tier-2 Talent): +7% Damage in 1v1 duel
  if (attacker.talents.t2 === 'master_assassin') {
    const nearbyEnemies = allHeroes.filter(
      (eh) => eh.alive && eh.team !== attacker.team && dist(eh.x, eh.y, target.x, target.y) <= 460
    );
    if (nearbyEnemies.length <= 1) adj *= 1.07;
  }
  // Focusing Mark (Tier-3 Talent): +6% allied damage on marked target
  if (tst.focusingMarkTimer > 0 && tst.focusingMarkTeam === attacker.team) {
    adj *= 1.06;
  }
  if (attacker.talents.t3 === 'focusing_mark') {
    tst.focusingMarkTimer = 3.0;
    tst.focusingMarkTeam = attacker.team;
  }
  // War Cry (Tier-3 Talent): 3 hits -> +8% all damage for 6s
  if (attacker.talents.t3 === 'war_cry') {
    if (ast.warCryTimer > 0) {
      adj *= 1.08;
    } else {
      ast.warCryHits++;
      if (ast.warCryHits >= 3) {
        ast.warCryHits = 0;
        ast.warCryTimer = 6.0;
        callbacks.spawnVfx({ kind: 'ring', x: attacker.x, y: attacker.y, radius: 68, color: '#F59E0B', ttl: 0.45, maxTtl: 0.45 });
      }
    }
  }

  // --- Stacking Passives on Damage Dealt ---
  if (attacker.items.includes('war_axe')) {
    ast.warAxeStacks = Math.min(6, ast.warAxeStacks + 1);
    ast.warAxeTimer = 4.0;
    if (ast.warAxeStacks >= 6) {
      bonusTrueDmg += Math.round(adj * 0.1);
    }
  }
  if (attacker.items.includes('brute_force_breastplate')) {
    ast.bruteForceStacks = Math.min(6, ast.bruteForceStacks + 1);
    ast.bruteForceTimer = 4.0;
  }
  if (attacker.items.includes('clock_of_destiny') && dmgType === 'magic') {
    ast.clockStacks = Math.min(6, ast.clockStacks + 1);
    ast.clockTimer = 5.0;
  }
  if (attacker.items.includes('ogre_tomahawk') && ast.ogreCrisisCd <= 0) {
    ast.ogreCrisisCd = 4.0;
    attacker.speedBoostPct = Math.max(attacker.speedBoostPct, 0.1);
    attacker.speedBoostTimer = Math.max(attacker.speedBoostTimer, 2.0);
  }
  if (attacker.items.includes('hunter_strike') && ast.hunterStrikeCd <= 0) {
    ast.hunterStrikeHits++;
    if (ast.hunterStrikeHits >= 5) {
      ast.hunterStrikeHits = 0;
      ast.hunterStrikeCd = 8.0;
      attacker.speedBoostPct = Math.max(attacker.speedBoostPct, 0.5);
      attacker.speedBoostTimer = Math.max(attacker.speedBoostTimer, 3.0);
    }
  }
  if (attacker.items.includes('malefic_gun') && isBasic) {
    attacker.speedBoostPct = Math.max(attacker.speedBoostPct, 0.1);
    attacker.speedBoostTimer = Math.max(attacker.speedBoostTimer, 1.0);
  }
  if (attacker.items.includes('genius_wand') && dmgType === 'magic') {
    tst.geniusShredStacks = Math.min(3, tst.geniusShredStacks + 1);
    tst.geniusShredTimer = 2.0;
  }
  if (attacker.items.includes('glowing_wand') && dmgType === 'magic') {
    tst.glowingBurnTimer = 3.0;
    tst.glowingBurnSourceId = attacker.id;
  }
  if (!isBasic && attacker.items.includes('ice_queen_wand')) {
    target.slowPct = Math.max(target.slowPct, 0.25);
    target.slowTimer = Math.max(target.slowTimer, 2.0);
  }

  // --- On-Hit Basic Attack Passives (with Golden Staff 3x Endless Strike!) ---
  if (isBasic) {
    let onHitMult = 1;
    if (attacker.items.includes('golden_staff')) {
      ast.goldenStaffHits++;
      if (ast.goldenStaffHits >= 3) {
        ast.goldenStaffHits = 0;
        onHitMult = 3;
      }
    }

    // Demon Hunter Sword: 8% Target Current HP Phys Damage + Lifesteal stack
    if (attacker.items.includes('demon_hunter_sword')) {
      bonusPhysDmg += Math.round(target.hp * 0.08 * onHitMult);
      ast.dhsStacks = Math.min(5, ast.dhsStacks + 1);
      ast.dhsTimer = 3.0;
    }

    // Corrosion Scythe / Swift Crossbow / Feather of Heaven
    if (attacker.items.includes('corrosion_scythe')) {
      bonusPhysDmg += 80 * onHitMult;
      ast.impulseStacks = Math.min(5, ast.impulseStacks + 1);
      ast.impulseTimer = 3.0;
      target.slowPct = Math.max(target.slowPct, 0.3);
      target.slowTimer = Math.max(target.slowTimer, 1.5);
    } else if (attacker.items.includes('swift_crossbow')) {
      bonusPhysDmg += 40 * onHitMult;
      ast.impulseStacks = Math.min(5, ast.impulseStacks + 1);
      ast.impulseTimer = 3.0;
    }
    if (attacker.items.includes('feather_of_heaven')) {
      bonusMagicDmg += Math.round((50 + attacker.magicPow * 0.3) * onHitMult);
      ast.impulseStacks = Math.min(5, ast.impulseStacks + 1);
      ast.impulseTimer = 3.0;
    }

    // Blade of the Heptaseas (Ambush): Out of combat >= 5s
    if (attacker.items.includes('blade_of_heptaseas') && attacker.outOfCombatTimer >= 5.0) {
      bonusPhysDmg += Math.round(160 + attacker.physAtk * 0.4);
      target.slowPct = Math.max(target.slowPct, 0.4);
      target.slowTimer = Math.max(target.slowTimer, 1.5);
      callbacks.spawnVfx({ kind: 'burst', x: target.x, y: target.y, radius: 60, color: '#F97316', ttl: 0.35, maxTtl: 0.35 });
    }

    // Spellblade Passives: Endless Battle (Divine Justice) + Starlium Scythe (Crisis) + Azure Blade (Judgment)
    if (ast.spellbladeReady && ast.spellbladeCd <= 0) {
      let triggered = false;
      if (attacker.items.includes('endless_battle')) {
        bonusTrueDmg += Math.round(attacker.physAtk * 0.6);
        attacker.speedBoostPct = Math.max(attacker.speedBoostPct, 0.1);
        attacker.speedBoostTimer = Math.max(attacker.speedBoostTimer, 1.5);
        triggered = true;
      }
      if (attacker.items.includes('starlium_scythe')) {
        bonusTrueDmg += Math.round(100 + attacker.magicPow);
        attacker.speedBoostPct = Math.max(attacker.speedBoostPct, 0.1);
        attacker.speedBoostTimer = Math.max(attacker.speedBoostTimer, 1.5);
        triggered = true;
      } else if (attacker.items.includes('azure_blade') && !triggered) {
        bonusTrueDmg += Math.round(50 + attacker.magicPow * 0.6);
        triggered = true;
      }
      if (triggered) {
        ast.spellbladeReady = false;
        ast.spellbladeCd = 1.5;
      }
    }

    // Thunder Belt (Thunderbolt): Every 4s AoE True Damage + Permanent +1 Hybrid DEF stack!
    if (attacker.items.includes('thunder_belt') && ast.thunderBeltCd <= 0) {
      ast.thunderBeltCd = 4.0;
      ast.thunderBeltStacks += 1;
      const tbTrue = Math.round(50 + attacker.physDef + attacker.magicDef);
      bonusTrueDmg += tbTrue;
      target.slowPct = Math.max(target.slowPct, 0.4);
      target.slowTimer = Math.max(target.slowTimer, 1.0);
      callbacks.spawnVfx({ kind: 'ring', x: target.x, y: target.y, radius: 105, color: '#38BDF8', ttl: 0.4, maxTtl: 0.4 });
      callbacks.spawnVfx({ kind: 'text', x: attacker.x, y: attacker.y - 40, radius: 0, color: '#38BDF8', text: `⛈️ +1 DEF (${ast.thunderBeltStacks})`, ttl: 0.75, maxTtl: 0.75 });
    }

    // Windtalker (Typhoon): Chain lightning to up to 3 foes
    if (attacker.items.includes('windtalker') && ast.windtalkerCd <= 0) {
      ast.windtalkerCd = Math.max(2.0, 5.0 - attacker.atkSpd * 0.8);
      const typhDmg = Math.round(150 + attacker.level * 14);
      bonusMagicDmg += typhDmg;
      const chains = allHeroes
        .filter((e) => e.alive && e.team !== attacker.team && e.id !== target.id && dist(e.x, e.y, target.x, target.y) <= 280)
        .slice(0, 2);
      for (const ch of chains) {
        ch.hp = Math.max(1, ch.hp - Math.round(typhDmg * 0.75));
        callbacks.spawnVfx({ kind: 'beam', x: target.x, y: target.y, tx: ch.x, ty: ch.y, radius: 10, color: '#38BDF8', ttl: 0.25, maxTtl: 0.25 });
      }
    }

    // Tier-3 Talents on Basic Attack: Quantum Charge, Concussive Blast, Weakness Finder
    if (attacker.talents.t3 === 'quantum_charge' && ast.quantumChargeCd <= 0) {
      ast.quantumChargeCd = 8.0;
      attacker.speedBoostPct = Math.max(attacker.speedBoostPct, 0.3);
      attacker.speedBoostTimer = Math.max(attacker.speedBoostTimer, 1.5);
      callbacks.healHero(attacker, 75 + attacker.level * 7, attacker);
    }
    if (attacker.talents.t3 === 'concussive_blast' && ast.concussiveBlastCd <= 0) {
      ast.concussiveBlastCd = 15.0;
      const blastDmg = Math.round(100 + attacker.maxHp * 0.07);
      bonusMagicDmg += blastDmg;
      callbacks.spawnVfx({ kind: 'burst', x: target.x, y: target.y, radius: 145, color: '#38BDF8', ttl: 0.45, maxTtl: 0.45 });
    }
    if (attacker.talents.t3 === 'weakness_finder' && ast.weaknessFinderCd <= 0) {
      ast.weaknessFinderCd = 10.0;
      target.slowPct = Math.max(target.slowPct, 0.5);
      target.slowTimer = Math.max(target.slowTimer, 1.0);
      tst.weaknessAtkSlowTimer = 1.0;
    }
  } else {
    // --- Skill-Hit Triggers ---
    // Lightning Truncheon (Resonate): 6s CD AoE chain lightning + +30% MS
    if (attacker.items.includes('lightning_truncheon') && ast.lightningTruncheonCd <= 0) {
      ast.lightningTruncheonCd = 6.0;
      const ltDmg = Math.round(attacker.magicPow * 1.2);
      bonusMagicDmg += ltDmg;
      attacker.speedBoostPct = Math.max(attacker.speedBoostPct, 0.3);
      attacker.speedBoostTimer = Math.max(attacker.speedBoostTimer, 2.0);
      const chains = allHeroes
        .filter((e) => e.alive && e.team !== attacker.team && e.id !== target.id && dist(e.x, e.y, target.x, target.y) <= 300)
        .slice(0, 2);
      for (const ch of chains) {
        ch.hp = Math.max(1, ch.hp - Math.round(ltDmg * 0.7));
        callbacks.spawnVfx({ kind: 'beam', x: target.x, y: target.y, tx: ch.x, ty: ch.y, radius: 12, color: '#60A5FA', ttl: 0.3, maxTtl: 0.3 });
      }
    }

    // Impure Rage (Tier-3 Talent): 4% Target Current HP Adaptive Damage + 2% Max Mana restore (5s CD)
    if (attacker.talents.t3 === 'impure_rage' && ast.impureRageCd <= 0) {
      ast.impureRageCd = 5.0;
      const irDmg = Math.round(target.hp * 0.04);
      if (dmgType === 'magic') bonusMagicDmg += irDmg;
      else bonusPhysDmg += irDmg;
      attacker.mana = Math.min(attacker.maxMana, attacker.mana + attacker.maxMana * 0.02);
    }

    // Brave Smite (Tier-3 Talent): Skill hit restores 5% Max HP (6s CD)
    if (attacker.talents.t3 === 'brave_smite' && ast.braveSmiteCd <= 0) {
      ast.braveSmiteCd = 6.0;
      callbacks.healHero(attacker, attacker.maxHp * 0.05, attacker);
    }
  }

  // --- Roam Dire Hit Blessing (<35% HP target burst, 30s CD) ---
  if (attacker.blessingId === 'roam_dire_hit' && ast.direHitCd <= 0 && target.hp / Math.max(1, target.maxHp) <= 0.35) {
    ast.direHitCd = 30.0;
    const pct = 0.07 + ((attacker.level - 1) / 14) * 0.11;
    bonusMagicDmg += Math.round(target.maxHp * pct);
    callbacks.spawnVfx({ kind: 'burst', x: target.x, y: target.y, radius: 70, color: '#EF4444', ttl: 0.35, maxTtl: 0.35 });
  }

  return {
    adjustedRaw: adj,
    bonusTrueDmg,
    bonusMagicDmg,
    bonusPhysDmg,
    extraPctPhysPen,
    extraPctMagicPen,
    ignoreFlatDef
  };
}

/**
 * Post-mitigation offensive triggers: Wishing Lantern (Butterfly every 800 Magic Dmg)
 * and Lethal Ignition (3 heavy hits >7% target Max HP within 5s).
 */
export function applyPostHitOffensiveTriggers(
  attacker: SimHero,
  target: SimHero,
  dealtDmg: number,
  dmgType: MlbbDamageType,
  callbacks: SimCallbacks
): number {
  const ast = ensureEquipState(attacker);
  let extraDmg = 0;

  // Wishing Lantern (Butterfly Goddess): every 800 Magic Damage -> 8% target Current HP Magic Damage
  if (dmgType === 'magic' && attacker.items.includes('wishing_lantern') && dealtDmg > 0) {
    const prev = ast.wishingLanternAccum[target.id] ?? 0;
    const next = prev + dealtDmg;
    if (next >= 800) {
      ast.wishingLanternAccum[target.id] = next % 800;
      const butterflyDmg = Math.max(60, Math.round(target.hp * 0.08));
      extraDmg += butterflyDmg;
      callbacks.spawnVfx({ kind: 'beam', x: attacker.x, y: attacker.y, tx: target.x, ty: target.y, radius: 14, color: '#FDE047', ttl: 0.35, maxTtl: 0.35 });
      callbacks.spawnVfx({ kind: 'text', x: target.x - 16, y: target.y - 42, radius: 0, color: '#FDE047', text: `🏮 ${butterflyDmg}`, ttl: 0.65, maxTtl: 0.65 });
    } else {
      ast.wishingLanternAccum[target.id] = next;
    }
  }

  // Lethal Ignition (Tier-3 Talent): 3 hits each >=7% target Max HP within 5s scorches for 162-750 Adaptive Dmg
  if (attacker.talents.t3 === 'lethal_ignition' && ast.lethalIgnitionCd <= 0 && dealtDmg >= target.maxHp * 0.07) {
    if (ast.lethalIgnitionWindow <= 0) {
      ast.lethalIgnitionHits = 1;
      ast.lethalIgnitionWindow = 5.0;
    } else {
      ast.lethalIgnitionHits++;
    }
    if (ast.lethalIgnitionHits >= 3) {
      ast.lethalIgnitionHits = 0;
      ast.lethalIgnitionWindow = 0;
      ast.lethalIgnitionCd = 15.0;
      const scorch = Math.round(162 + ((attacker.level - 1) / 14) * 588);
      extraDmg += scorch;
      callbacks.spawnVfx({ kind: 'burst', x: target.x, y: target.y, radius: 85, color: '#F97316', ttl: 0.45, maxTtl: 0.45 });
    }
  }

  return extraDmg;
}

/**
 * Applies defensive Equipment Passives & Vengeance mitigation/reflection on incoming damage.
 */
export function applyDefensiveItemAndTalentMitigation(
  attacker: SimHero | null,
  target: SimHero,
  incomingDmg: number,
  dmgType: MlbbDamageType,
  isBasic: boolean,
  isCrit: boolean,
  callbacks: SimCallbacks
): number {
  const tst = ensureEquipState(target);
  let dmg = incomingDmg;

  // Blade Armor: +20% Critical Damage Reduction
  if (isCrit && target.items.includes('blade_armor')) {
    dmg = Math.round(dmg * 0.8);
  }

  // Athena's Shield: Upon taking Magic Damage, reduces all Magic Damage taken by 25% for 3s (10s OOC CD)
  if (dmgType === 'magic' && target.items.includes('athenas_shield')) {
    if (tst.athenaActiveTimer <= 0 && tst.athenaCd <= 0) {
      tst.athenaActiveTimer = 3.0;
      tst.athenaCd = 10.0;
      callbacks.spawnVfx({ kind: 'ring', x: target.x, y: target.y, radius: 72, color: '#C084FC', ttl: 0.4, maxTtl: 0.4 });
    }
    if (tst.athenaActiveTimer > 0) {
      dmg = Math.round(dmg * 0.75);
    }
  }

  // Radiant Armor: Taking Magic Damage stacks Magic DEF (up to 6x)
  if (dmgType === 'magic' && target.items.includes('radiant_armor')) {
    tst.radiantStacks = Math.min(6, tst.radiantStacks + 1);
    tst.radiantTimer = 5.0;
  }

  // Warrior Boots (Valor): Taking Physical Damage stacks Phys DEF (up to 5x)
  if (dmgType === 'physical' && target.items.includes('warrior_boots')) {
    tst.warriorBootsStacks = Math.min(5, tst.warriorBootsStacks + 1);
    tst.warriorBootsTimer = 3.0;
  }

  // Antique Cuirass / Dreadnaught Armor: Enemy skill hits reduce attacker Phys ATK (-6% x3)
  if (attacker && !isBasic && (target.items.includes('antique_cuirass') || target.items.includes('dreadnaught_armor'))) {
    const ast = ensureEquipState(attacker);
    ast.antiqueDebuffStacks = Math.min(3, ast.antiqueDebuffStacks + 1);
    ast.antiqueDebuffTimer = 2.0;
  }

  // Chastise Pauldron: slows attacker ATK Speed on hit
  if (attacker && target.items.includes('chastise_pauldron')) {
    const ast = ensureEquipState(attacker);
    ast.chastiseSlowTimer = 1.5;
  }

  // Queen's Wings (Demonize): Below 40% HP grants 30% DR for 3s & -2s skill CDs (60s CD)
  if (target.items.includes('queens_wings')) {
    if (tst.queensWingsTimer <= 0 && tst.queensWingsCd <= 0 && (target.hp - dmg) / Math.max(1, target.maxHp) <= 0.4) {
      tst.queensWingsTimer = 3.0;
      tst.queensWingsCd = 60.0;
      target.skillCds[0] = Math.max(0, target.skillCds[0] - 2);
      target.skillCds[1] = Math.max(0, target.skillCds[1] - 2);
      target.skillCds[2] = Math.max(0, target.skillCds[2] - 2);
      callbacks.spawnVfx({ kind: 'ring', x: target.x, y: target.y, radius: 75, color: '#F43F5E', ttl: 0.45, maxTtl: 0.45 });
    }
    if (tst.queensWingsTimer > 0) {
      dmg = Math.round(dmg * 0.7);
    }
  }

  // Twilight Armor: reduces single-hit burst exceeding 500 by (0.4% Max HP + 15)% (5s CD)
  if (target.items.includes('twilight_armor') && dmg > 500 && tst.twilightCd <= 0) {
    tst.twilightCd = 5.0;
    const excess = dmg - 500;
    const reductionFrac = clamp((target.maxHp * 0.004 + 15) / 100, 0.15, 0.65);
    dmg = Math.round(500 + excess * (1 - reductionFrac));
    callbacks.spawnVfx({ kind: 'ring', x: target.x, y: target.y, radius: 80, color: '#818CF8', ttl: 0.4, maxTtl: 0.4 });
  }

  // Vengeance (exact 35% Magic reflect) & Blade Armor (30% Basic Attack + 20% Phys DEF reflect + 15% slow)
  if (attacker && attacker.alive) {
    if (target.vengeanceTimer > 0) {
      const refl = Math.max(1, Math.round(dmg * 0.35));
      attacker.hp = Math.max(1, attacker.hp - refl);
      callbacks.spawnVfx({ kind: 'text', x: attacker.x, y: attacker.y - 26, radius: 0, color: '#C084FC', text: `${refl}`, ttl: 0.45, maxTtl: 0.45 });
    } else if (isBasic && target.items.includes('blade_armor')) {
      const refl = Math.max(1, Math.round(dmg * 0.3 + target.physDef * 0.2));
      attacker.hp = Math.max(1, attacker.hp - refl);
      attacker.slowPct = Math.max(attacker.slowPct, 0.15);
      attacker.slowTimer = Math.max(attacker.slowTimer, 1.0);
    } else if (target.heroDef.id === 'belerick') {
      attacker.hp = Math.max(1, attacker.hp - Math.round(dmg * 0.22));
    }
  }

  return Math.max(0, dmg);
}

/**
 * Post-damage low-HP reactive passives: Rose Gold Meteor / Magic Blade Lifeline,
 * Chastise Pauldron Redemption (<30% HP clutch heal), Clock of Destiny Gift (<50% HP restore).
 */
export function applyLowHpDefensiveTriggers(target: SimHero, callbacks: SimCallbacks): void {
  if (!target.alive || target.hp <= 0) return;
  const tst = ensureEquipState(target);
  const hpRatio = target.hp / Math.max(1, target.maxHp);

  // Rose Gold Meteor / Magic Blade (Lifeline <30% HP shield + 50% MS, 60s CD)
  if (hpRatio <= 0.3 && tst.roseGoldCd <= 0) {
    if (target.items.includes('rose_gold_meteor')) {
      tst.roseGoldCd = 60.0;
      callbacks.grantShield(target, 840 + target.level * 35);
      target.speedBoostPct = Math.max(target.speedBoostPct, 0.5);
      target.speedBoostTimer = Math.max(target.speedBoostTimer, 3.0);
      callbacks.spawnVfx({ kind: 'ring', x: target.x, y: target.y, radius: 85, color: '#FB7185', ttl: 0.5, maxTtl: 0.5 });
    } else if (target.items.includes('magic_blade')) {
      tst.roseGoldCd = 60.0;
      callbacks.grantShield(target, 400 + target.level * 30);
      target.speedBoostPct = Math.max(target.speedBoostPct, 0.5);
      target.speedBoostTimer = Math.max(target.speedBoostTimer, 2.5);
    }
  }

  // Chastise Pauldron (Redemption <30% HP restores 20% Max HP, 60s CD)
  if (hpRatio <= 0.3 && target.items.includes('chastise_pauldron') && tst.chastiseCd <= 0) {
    tst.chastiseCd = 60.0;
    callbacks.healHero(target, target.maxHp * 0.2, target);
    callbacks.spawnVfx({ kind: 'ring', x: target.x, y: target.y, radius: 85, color: '#2CE58B', ttl: 0.5, maxTtl: 0.5 });
  }

  // Clock of Destiny (Gift <50% HP restores 15% HP & Mana, 60s CD)
  if (hpRatio <= 0.5 && target.items.includes('clock_of_destiny') && tst.clockHealCd <= 0) {
    tst.clockHealCd = 60.0;
    callbacks.healHero(target, target.maxHp * 0.15, target);
    target.mana = Math.min(target.maxMana, target.mana + target.maxMana * 0.15);
  }
}

/**
 * Sky Piercer (Lethality): executes enemy heroes below 4%..12% HP depending on stacks (0..80).
 */
export function checkSkyPiercerExecute(attacker: SimHero | null, target: SimHero, callbacks: SimCallbacks): boolean {
  if (!attacker || !target.alive || target.hp <= 0 || target.isTrainingDummy) return false;
  if (!attacker.items.includes('sky_piercer')) return false;
  const ast = ensureEquipState(attacker);
  const threshold = 0.04 + Math.min(80, ast.skyPiercerStacks) * 0.001; // 4% base -> 12% at 80 stacks
  if (target.hp / Math.max(1, target.maxHp) <= threshold) {
    target.hp = 0;
    callbacks.spawnVfx({ kind: 'burst', x: target.x, y: target.y, radius: 95, color: '#FDE047', ttl: 0.45, maxTtl: 0.45 });
    callbacks.spawnVfx({ kind: 'text', x: target.x, y: target.y - 44, radius: 0, color: '#FDE047', text: `🌠 EXECUTED (${Math.round(threshold * 100)}%)`, ttl: 0.85, maxTtl: 0.85 });
    return true;
  }
  return false;
}

/**
 * Healing & Shield amplification + reactive support triggers:
 * - Oracle (+30% Shield & HP Regen received)
 * - Revitalize Healing Spring (+25% Healing received)
 * - Flask of the Oasis (ally <35% HP -> 680-1800 Shield + -2s caster CDs, 60s CD)
 * - Favor Roam Blessing (bonus 300-750 HP heal to lowest-HP nearby ally, 15s CD)
 */
export function computeHealOrShieldAmpMultiplier(target: SimHero, isHeal: boolean): number {
  const tst = ensureEquipState(target);
  let mult = 1.0;
  if (target.items.includes('oracle')) mult += 0.3;
  if (isHeal && tst.revitalizeAmpTimer > 0) mult += 0.25;
  return mult;
}

export function triggerSupportHealOrShieldHooks(
  healer: SimHero | undefined,
  target: SimHero,
  allHeroes: readonly SimHero[],
  callbacks: SimCallbacks
): void {
  if (!healer || !healer.alive) return;
  const hst = ensureEquipState(healer);

  // Flask of the Oasis (Blessing): ally <35% HP gets 680-1800 Shield & caster -2s CDs (60s CD)
  if (healer.items.includes('flask_of_the_oasis') && hst.flaskOasisCd <= 0 && target.hp / Math.max(1, target.maxHp) <= 0.35) {
    hst.flaskOasisCd = 60.0;
    const shieldAmt = Math.round(680 + ((healer.level - 1) / 14) * 1120);
    callbacks.grantShield(target, shieldAmt);
    healer.skillCds[0] = Math.max(0, healer.skillCds[0] - 2);
    healer.skillCds[1] = Math.max(0, healer.skillCds[1] - 2);
    healer.skillCds[2] = Math.max(0, healer.skillCds[2] - 2);
    callbacks.spawnVfx({ kind: 'ring', x: target.x, y: target.y, radius: 95, color: '#2CE58B', ttl: 0.55, maxTtl: 0.55 });
  }

  // Roam Favor Blessing: bonus 300-750 HP to lowest-HP nearby ally (15s CD)
  if (healer.blessingId === 'roam_favor' && hst.favorCd <= 0) {
    const lowest = allHeroes
      .filter((a) => a.alive && a.team === healer.team && dist(a.x, a.y, healer.x, healer.y) <= 520)
      .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    if (lowest) {
      hst.favorCd = 15.0;
      const bonusHeal = Math.round(300 + ((healer.level - 1) / 14) * 450);
      lowest.hp = Math.min(lowest.maxHp, lowest.hp + bonusHeal);
      callbacks.spawnVfx({ kind: 'text', x: lowest.x, y: lowest.y - 34, radius: 0, color: '#34D399', text: `+${bonusHeal} 💚`, ttl: 0.65, maxTtl: 0.65 });
    }
  }
}

/**
 * Called whenever a hero casts Skill 1, 2, or 3:
 * - Arms Spellblade (Endless Battle / Starlium Scythe / Azure Blade)
 * - Great Dragon Spear (Ult -> +30% MS for 7.5s, 15s CD)
 * - Temporal Reign (Tier-3 Talent: Ult -> 1.5x non-Ult skill CD acceleration for 4s)
 */
export function onHeroSkillCastEquipHooks(caster: SimHero, slot: 1 | 2 | 3): void {
  const st = ensureEquipState(caster);
  if (
    caster.items.includes('endless_battle') ||
    caster.items.includes('starlium_scythe') ||
    caster.items.includes('azure_blade')
  ) {
    st.spellbladeReady = true;
  }
  if (slot === 3) {
    if (caster.items.includes('great_dragon_spear') && st.greatDragonCd <= 0) {
      st.greatDragonCd = 15.0;
      caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.3);
      caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 7.5);
    }
    if (caster.talents.t3 === 'temporal_reign') {
      st.temporalReignTimer = 4.0;
    }
  }
}

/**
 * Called on Hero Kill or Assist:
 * - Fleeting Time (Timestream: -30% current Ultimate CD)
 * - Sky Piercer (+10 Lethality stacks up to 80 on kill; victim loses 30% stacks on death)
 * - Festival of Blood (+1 stack up to 8 -> +0.5% Spell Vamp each)
 * - Killing Spree (Kill restores 10% Lost HP + +20% MS for 3s)
 * - Demon Shoes (Restores 10% Max Mana)
 */
export function onHeroKillOrAssistEquipHooks(
  actor: SimHero,
  isKill: boolean,
  callbacks: SimCallbacks
): void {
  const st = ensureEquipState(actor);

  if (actor.items.includes('fleeting_time')) {
    actor.skillCds[2] = Math.max(0, actor.skillCds[2] * 0.7);
  }
  if (isKill && actor.items.includes('sky_piercer')) {
    st.skyPiercerStacks = Math.min(80, st.skyPiercerStacks + 10);
  }
  if (actor.talents.t2 === 'festival_of_blood') {
    st.festivalStacks = Math.min(8, st.festivalStacks + 1);
  }
  if (isKill && actor.talents.t3 === 'killing_spree') {
    const lostHp = Math.max(0, actor.maxHp - actor.hp);
    callbacks.healHero(actor, lostHp * 0.1, actor);
    actor.speedBoostPct = Math.max(actor.speedBoostPct, 0.2);
    actor.speedBoostTimer = Math.max(actor.speedBoostTimer, 3.0);
  }
  if (actor.items.includes('demon_shoes')) {
    actor.mana = Math.min(actor.maxMana, actor.mana + actor.maxMana * 0.1);
  }
}

export function onHeroDeathEquipHooks(victim: SimHero): void {
  const st = ensureEquipState(victim);
  if (st.skyPiercerStacks > 0) {
    st.skyPiercerStacks = Math.floor(st.skyPiercerStacks * 0.7);
  }
}

/**
 * Called when a hero kills a lane minion:
 * - Life Drain (Tier-2 Talent): restores 3% Max HP & 3% Max Mana
 * - Demon Shoes: restores 4% Max Mana
 */
export function onMinionKillEquipHooks(killer: SimHero, callbacks: SimCallbacks): void {
  if (killer.talents.t2 === 'life_drain') {
    callbacks.healHero(killer, killer.maxHp * 0.03, killer);
    killer.mana = Math.min(killer.maxMana, killer.mana + killer.maxMana * 0.03);
  }
  if (killer.items.includes('demon_shoes')) {
    killer.mana = Math.min(killer.maxMana, killer.mana + killer.maxMana * 0.04);
  }
}

/**
 * Seasoned Hunter (Tier-2 Talent): +15% Damage against Lord, Turtle, and Jungle Creeps.
 */
export function getJungleDamageMultiplier(attacker: SimHero | null): number {
  if (!attacker) return 1;
  return attacker.talents.t2 === 'seasoned_hunter' ? 1.15 : 1.0;
}

/**
 * Per-frame step for all Equipment, Talent, Aura, Burn, Regen, and Revitalize Spring timers.
 */
export function stepEquipmentAndTalentTimers(
  h: SimHero,
  dt: number,
  allHeroes: readonly SimHero[],
  jungleMobs: readonly SimJungleMob[],
  minions: readonly SimMinion[],
  callbacks: SimCallbacks
): void {
  const st = ensureEquipState(h);

  // Decay cooldowns & active timers
  st.thunderBeltCd = Math.max(0, st.thunderBeltCd - dt);
  st.warAxeTimer = Math.max(0, st.warAxeTimer - dt);
  if (st.warAxeTimer <= 0) st.warAxeStacks = 0;
  st.hunterStrikeCd = Math.max(0, st.hunterStrikeCd - dt);
  st.bruteForceTimer = Math.max(0, st.bruteForceTimer - dt);
  if (st.bruteForceTimer <= 0) st.bruteForceStacks = 0;
  st.radiantTimer = Math.max(0, st.radiantTimer - dt);
  if (st.radiantTimer <= 0) st.radiantStacks = 0;
  st.warriorBootsTimer = Math.max(0, st.warriorBootsTimer - dt);
  if (st.warriorBootsTimer <= 0) st.warriorBootsStacks = 0;
  st.antiqueDebuffTimer = Math.max(0, st.antiqueDebuffTimer - dt);
  if (st.antiqueDebuffTimer <= 0) st.antiqueDebuffStacks = 0;
  st.concentratedTimer = Math.max(0, st.concentratedTimer - dt);
  if (st.concentratedTimer <= 0) st.concentratedStacks = 0;
  st.clockTimer = Math.max(0, st.clockTimer - dt);
  if (st.clockTimer <= 0) st.clockStacks = 0;
  st.clockHealCd = Math.max(0, st.clockHealCd - dt);
  st.geniusShredTimer = Math.max(0, st.geniusShredTimer - dt);
  if (st.geniusShredTimer <= 0) st.geniusShredStacks = 0;
  st.impulseTimer = Math.max(0, st.impulseTimer - dt);
  if (st.impulseTimer <= 0) st.impulseStacks = 0;
  st.dhsTimer = Math.max(0, st.dhsTimer - dt);
  if (st.dhsTimer <= 0) st.dhsStacks = 0;
  st.berserkerBuffTimer = Math.max(0, st.berserkerBuffTimer - dt);
  st.haasBuffTimer = Math.max(0, st.haasBuffTimer - dt);
  st.bodBuffTimer = Math.max(0, st.bodBuffTimer - dt);
  st.ogreCrisisCd = Math.max(0, st.ogreCrisisCd - dt);
  st.athenaActiveTimer = Math.max(0, st.athenaActiveTimer - dt);
  if (h.outOfCombatTimer >= 5) st.athenaCd = Math.max(0, st.athenaCd - dt);
  st.twilightCd = Math.max(0, st.twilightCd - dt);
  st.bloodWingsShieldCd = Math.max(0, st.bloodWingsShieldCd - dt);
  st.roseGoldCd = Math.max(0, st.roseGoldCd - dt);
  st.queensWingsTimer = Math.max(0, st.queensWingsTimer - dt);
  st.queensWingsCd = Math.max(0, st.queensWingsCd - dt);
  st.chastiseCd = Math.max(0, st.chastiseCd - dt);
  st.flaskOasisCd = Math.max(0, st.flaskOasisCd - dt);
  st.windtalkerCd = Math.max(0, st.windtalkerCd - dt);
  st.lightningTruncheonCd = Math.max(0, st.lightningTruncheonCd - dt);
  st.greatDragonCd = Math.max(0, st.greatDragonCd - dt);
  st.spellbladeCd = Math.max(0, st.spellbladeCd - dt);
  st.direHitCd = Math.max(0, st.direHitCd - dt);
  st.favorCd = Math.max(0, st.favorCd - dt);
  st.dominanceSlowTimer = Math.max(0, st.dominanceSlowTimer - dt);
  st.chastiseSlowTimer = Math.max(0, st.chastiseSlowTimer - dt);
  st.weaknessAtkSlowTimer = Math.max(0, st.weaknessAtkSlowTimer - dt);

  st.impureRageCd = Math.max(0, st.impureRageCd - dt);
  st.quantumChargeCd = Math.max(0, st.quantumChargeCd - dt);
  st.concussiveBlastCd = Math.max(0, st.concussiveBlastCd - dt);
  st.braveSmiteCd = Math.max(0, st.braveSmiteCd - dt);
  st.weaknessFinderCd = Math.max(0, st.weaknessFinderCd - dt);
  st.lethalIgnitionWindow = Math.max(0, st.lethalIgnitionWindow - dt);
  if (st.lethalIgnitionWindow <= 0) st.lethalIgnitionHits = 0;
  st.lethalIgnitionCd = Math.max(0, st.lethalIgnitionCd - dt);
  st.warCryTimer = Math.max(0, st.warCryTimer - dt);
  st.focusingMarkTimer = Math.max(0, st.focusingMarkTimer - dt);
  st.flickerDefTimer = Math.max(0, st.flickerDefTimer - dt);
  st.flameRetriTimer = Math.max(0, st.flameRetriTimer - dt);
  st.flameRetriDebuffTimer = Math.max(0, st.flameRetriDebuffTimer - dt);
  st.revitalizeAmpTimer = Math.max(0, st.revitalizeAmpTimer - dt);

  // Temporal Reign (Tier-3 Talent): extra 0.5x CD tick on S1 & S2 (total 1.5x speed for 4s)
  if (st.temporalReignTimer > 0) {
    st.temporalReignTimer = Math.max(0, st.temporalReignTimer - dt);
    h.skillCds[0] = Math.max(0, h.skillCds[0] - dt * 0.5);
    h.skillCds[1] = Math.max(0, h.skillCds[1] - dt * 0.5);
  }

  // Guardian Helmet (Recovery): 2.5% Max HP/s OOC, 0.5% Max HP/s in combat
  if (h.items.includes('guardian_helmet')) {
    const rate = h.outOfCombatTimer >= 5 ? 0.025 : 0.005;
    h.hp = Math.min(h.maxHp, h.hp + h.maxHp * rate * dt);
  }

  // Blood Wings (Guard): regenerates 800 (+100% Magic Power) Shield every 20s when depleted
  if (h.items.includes('blood_wings') && h.shield <= 0 && st.bloodWingsShieldCd <= 0) {
    st.bloodWingsShieldCd = 20.0;
    callbacks.grantShield(h, Math.round(800 + h.magicPow));
  }

  // Enchanted Talisman (Mana Spring): restores 15% Max Mana every 10s
  if (h.items.includes('enchanted_talisman')) {
    st.manaSpringAccum += dt;
    if (st.manaSpringAccum >= 10.0) {
      st.manaSpringAccum = 0;
      h.mana = Math.min(h.maxMana, h.mana + h.maxMana * 0.15);
    }
  }

  // Glowing Wand Scorch DoT (1.5% Max HP/s Magic burn)
  if (st.glowingBurnTimer > 0) {
    st.glowingBurnTimer = Math.max(0, st.glowingBurnTimer - dt);
    const burnTick = Math.max(1, h.maxHp * 0.015 * dt);
    h.hp = Math.max(1, h.hp - burnTick);
  }

  // Bloody Retribution 4s Max HP Drain (12.5% user Max HP over 4s)
  if (st.bloodyDrainTimer > 0) {
    st.bloodyDrainTimer = Math.max(0, st.bloodyDrainTimer - dt);
    st.bloodyDrainTickAccum += dt;
    if (st.bloodyDrainTickAccum >= 1.0) {
      st.bloodyDrainTickAccum -= 1.0;
      const src = allHeroes.find((x) => x.id === st.bloodyDrainSourceId && x.alive);
      const drainAmt = Math.round((src ? src.maxHp : h.maxHp) * 0.03125);
      h.hp = Math.max(1, h.hp - drainAmt);
      if (src) callbacks.healHero(src, drainAmt, src);
    }
  }

  // Revitalize 4s Healing Spring Zone (2.5% Max HP every 0.5s + +25% Healing Received)
  if (st.revitalizeZoneTimer > 0) {
    st.revitalizeZoneTimer = Math.max(0, st.revitalizeZoneTimer - dt);
    st.revitalizeTickAccum += dt;
    if (st.revitalizeTickAccum >= 0.5) {
      st.revitalizeTickAccum -= 0.5;
      callbacks.spawnVfx({ kind: 'ring', x: st.revitalizeZoneX, y: st.revitalizeZoneY, radius: 220, color: '#2CE58B', ttl: 0.45, maxTtl: 0.45 });
      for (const ally of allHeroes) {
        if (ally.alive && ally.team === h.team && dist(ally.x, ally.y, st.revitalizeZoneX, st.revitalizeZoneY) <= 220) {
          ensureEquipState(ally).revitalizeAmpTimer = 0.8;
          callbacks.healHero(ally, ally.maxHp * 0.025, h);
        }
      }
    }
  }

  // Dominance Ice / Black Ice Shield nearby aura (Arctic Cold + 50% Lifebane Anti-Heal)
  const hasDomIce = h.items.includes('dominance_ice');
  const hasBlackIce = !hasDomIce && h.items.includes('black_ice_shield');
  if (hasDomIce || hasBlackIce) {
    for (const enemy of allHeroes) {
      if (enemy.alive && enemy.team !== h.team && dist(h.x, h.y, enemy.x, enemy.y) <= 320) {
        ensureEquipState(enemy).dominanceSlowTimer = 0.5;
        if (hasDomIce) enemy.antiHealTimer = Math.max(enemy.antiHealTimer, 0.6);
      }
    }
  }

  // Cursed Helmet / Molten Essence (Burning Soul AoE Magic DPS every 1s)
  const hasCursed = h.items.includes('cursed_helmet');
  const hasMolten = !hasCursed && h.items.includes('molten_essence');
  if (hasCursed || hasMolten) {
    st.cursedTickAccum += dt;
    if (st.cursedTickAccum >= 1.0) {
      st.cursedTickAccum -= 1.0;
      const pct = hasCursed ? 0.012 : 0.006;
      const heroDps = Math.round(h.maxHp * pct);
      const creepDps = Math.round(heroDps * (hasCursed ? 2.4 : 2.0));
      for (const enemy of allHeroes) {
        if (enemy.alive && enemy.team !== h.team && dist(h.x, h.y, enemy.x, enemy.y) <= 220) {
          callbacks.dealDamageToHero(h, enemy, heroDps, 'magic', false, false, 'Burning Soul');
        }
      }
      for (const mob of jungleMobs) {
        if (mob.alive && dist(h.x, h.y, mob.x, mob.y) <= 220) {
          callbacks.dealDamageToJungle(h, mob, creepDps, 'magic');
        }
      }
      for (const min of minions) {
        if (min.alive && min.team !== h.team && dist(h.x, h.y, min.x, min.y) <= 220) {
          callbacks.dealDamageToMinion(h, min, creepDps, 'magic');
        }
      }
    }
  }
}

/**
 * Appends active Part 6 Equipment / Talent / Spell HUD buffs so the player sees live feedback.
 */
export function appendEquipmentHudBuffs(p: SimHero, activeBuffs: MlbbActiveBuffHud[]): void {
  const st = p.equipState;
  if (!st) return;
  if (p.items.includes('sky_piercer') && st.skyPiercerStacks > 0) {
    activeBuffs.push({
      id: 'sky_piercer',
      label: `Sky Piercer (${st.skyPiercerStacks})`,
      icon: '🌠',
      remaining: st.skyPiercerStacks,
      max: 80,
      color: '#FDE047'
    });
  }
  if (p.items.includes('thunder_belt') && st.thunderBeltStacks > 0) {
    activeBuffs.push({
      id: 'thunder_belt',
      label: `Thunder +${st.thunderBeltStacks} DEF`,
      icon: '⛈️',
      remaining: st.thunderBeltStacks,
      max: Math.max(20, st.thunderBeltStacks),
      color: '#38BDF8'
    });
  }
  if (st.warCryTimer > 0) {
    activeBuffs.push({ id: 'war_cry', label: 'War Cry +8%', icon: '📣', remaining: st.warCryTimer, max: 6, color: '#F59E0B' });
  }
  if (st.temporalReignTimer > 0) {
    activeBuffs.push({ id: 'temporal_reign', label: 'Temporal 1.5x', icon: '⏳', remaining: st.temporalReignTimer, max: 4, color: '#22D3EE' });
  }
  if (st.athenaActiveTimer > 0) {
    activeBuffs.push({ id: 'athena', label: 'Athena -25% Mag', icon: '🔰', remaining: st.athenaActiveTimer, max: 3, color: '#C084FC' });
  }
  if (st.revitalizeZoneTimer > 0) {
    activeBuffs.push({ id: 'revitalize', label: 'Healing Spring', icon: '🌿', remaining: st.revitalizeZoneTimer, max: 4, color: '#2CE58B' });
  }
}
