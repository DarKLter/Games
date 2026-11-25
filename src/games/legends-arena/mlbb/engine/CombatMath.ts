import { MlbbCcRecapEntry, MlbbCcType, MlbbDamageType, MlbbDeathRecap, MlbbDeathRecapEntry } from '../types';

/**
 * Exact MLBB Part 4 Effective Defense calculation:
 * effectiveDef = Math.max(-60, (targetDef - flatPen) * (1 - percentPen))
 */
export function computeEffectiveDefense(baseDef: number, flatPen: number, pctPen: number): number {
  const safePct = Math.max(0, Math.min(1, pctPen));
  const eff = (baseDef - Math.max(0, flatPen)) * (1 - safePct);
  return Math.max(-60, eff);
}

/**
 * Exact MLBB Part 4 Damage Formula:
 * - Positive/Zero Defense: 120 / (120 + effectiveDef)
 * - Negative Defense (down to -60): 2 - (120 / (120 - effectiveDef)) -> up to 1.333x at -60
 * - True Damage bypasses defense completely.
 */
export function computeFinalDamage(
  rawDamage: number,
  effectiveDefense: number,
  damageType: MlbbDamageType
): number {
  if (rawDamage <= 0) return 0;
  if (damageType === 'true') return Math.round(rawDamage);
  const clampedDef = Math.max(-60, effectiveDefense);
  const mult =
    clampedDef >= 0
      ? 120 / (120 + clampedDef)
      : 2 - 120 / (120 - clampedDef);
  return Math.max(1, Math.round(rawDamage * mult));
}

/**
 * Exact MLBB Critical Strike Damage Multiplier:
 * Base 200% Physical Damage (240% with Berserker's Fury).
 */
export function computeCriticalMultiplier(hasBerserkersFury: boolean, extraCritDmgPct = 0): number {
  const base = hasBerserkersFury ? 2.4 : 2.0;
  return base + Math.max(0, extraCritDmgPct);
}

/**
 * Exact MLBB Attack Speed Cap:
 * Hard cap 3.00 attacks/sec (5.00 with Golden Staff or uncapped passives).
 */
export function applyAttackSpeedCap(rawAtkSpd: number, hasGoldenStaff: boolean): number {
  const cap = hasGoldenStaff ? 5.0 : 3.0;
  return Number(Math.max(0.45, Math.min(cap, rawAtkSpd)).toFixed(2));
}

/**
 * Exact MLBB Cooldown Reduction (CDR) Cap:
 * Hard cap 40% (45% with Enchanted Talisman).
 */
export function applyCdrCap(rawCdr: number, hasEnchantedTalisman: boolean): number {
  const cap = hasEnchantedTalisman ? 0.45 : 0.4;
  return Math.max(0, Math.min(cap, rawCdr));
}

/**
 * Exact MLBB Shield & Anti-Heal Layering:
 * Anti-Heal debuff reduces incoming HP Regen/Heals AND Shields by 50% for 3s,
 * unless explicitly bypassed (e.g., Floryn Ult Bloom).
 */
export function applyAntiHealReduction(
  rawAmount: number,
  antiHealActive: boolean,
  bypassAntiHeal = false
): number {
  if (rawAmount <= 0) return 0;
  if (antiHealActive && !bypassAntiHeal) {
    return Math.round(rawAmount * 0.5);
  }
  return Math.round(rawAmount);
}

/**
 * Exact MLBB Movement Speed Soft-Caps:
 * - Up to 415 MS: 100% value
 * - 415 to 490 MS: 80% of excess
 * - Above 490 MS: 50% of excess
 */
export function applyMoveSpeedSoftCap(rawMs: number): number {
  const ms = Math.max(120, rawMs);
  if (ms <= 415) return Math.round(ms);
  if (ms <= 490) {
    return Math.round(415 + (ms - 415) * 0.8);
  }
  return Math.round(415 + 75 * 0.8 + (ms - 490) * 0.5);
}

/**
 * Exact Part 4 6-Tier Crowd Control Priority Hierarchy (Tiers 1–5 disables + Tier 6 Counters):
 * 1: Soft CC — Slow, Grounded (blocks dashes/blinks)
 * 2: Action Lock — Silence, Immobilize/Root, Disarm, Taunt
 * 3: Hard Disable — Stun, Freeze, Petrify, Morph/Transform
 * 4: Displacement — Airborne/Knock-up, Knockback, Pull/Hook, Vortex
 * 5: Ultimate CC — Suppression (Franco/Kaja/Barats Ult — CANNOT be cleansed by Purify or Diggie Ult!)
 */
export function getCcPriority(ccType: MlbbCcType): 1 | 2 | 3 | 4 | 5 {
  switch (ccType) {
    case 'slow':
    case 'grounded':
      return 1;
    case 'silence':
    case 'root':
    case 'disarm':
    case 'taunt':
      return 2;
    case 'stun':
    case 'freeze':
    case 'petrify':
    case 'transform':
      return 3;
    case 'airborne':
    case 'knockback':
    case 'pull':
    case 'vortex':
      return 4;
    case 'suppression':
      return 5;
  }
}

export function canCleanseCc(ccType: MlbbCcType): boolean {
  return ccType !== 'suppression';
}

export function isHardDisableCc(ccType: MlbbCcType): boolean {
  return getCcPriority(ccType) >= 3;
}

export function isDashBlockingCc(ccType: MlbbCcType): boolean {
  return (
    ccType === 'grounded' ||
    ccType === 'root' ||
    ccType === 'silence' ||
    ccType === 'taunt' ||
    getCcPriority(ccType) >= 3
  );
}

export function isMovementBlockingCc(ccType: MlbbCcType): boolean {
  return ccType === 'root' || getCcPriority(ccType) >= 3;
}

/**
 * Exact MLBB Turret Ramp Damage:
 * Consecutive turret shots against the same hero ramp +40% per shot up to 260% (2.6x).
 */
export function computeTurretRampMultiplier(consecutiveHits: number): number {
  const n = Math.max(0, Math.floor(consecutiveHits));
  return Math.min(2.6, 1 + n * 0.4);
}

/**
 * Retribution True Damage Threshold against Creeps/Turtle/Lord.
 */
export function computeRetributionThreshold(level: number, evolved: boolean): number {
  const base = 520 + Math.max(1, level) * 80;
  return evolved ? Math.round(base * 1.45) : base;
}

/**
 * Authentic MLBB Same-Name Unique Passive Non-Stacking Resolver:
 * - Lifebane caps Anti-Heal at 50% reduction (does not stack twice).
 * - Armor Buster on Malefic Roar + Malefic Gun only applies +30% once.
 * - Lifeline on Rose Gold Meteor + Magic Blade uses strongest shield only.
 * - Burning Soul on Cursed Helmet + Molten Essence uses strongest burn only.
 * - Impulse on Corrosion Scythe + Feather of Heaven shares 5-stack cap.
 * - Distinct passives DO stack (Endless Battle's Divine Justice + Starlium Scythe's Crisis).
 */
export interface ResolvedUniquePassives {
  activePassiveNames: string[];
  antiHealReductionPct: number; // 0 or 50 (Lifebane never stacks beyond 50%)
  armorBusterPctPen: number; // 0 or 0.30 (never stacks twice)
  hasDivineJustice: boolean;
  hasCrisis: boolean;
  spellbladeStacks: number; // 0, 1, or 2 (Divine Justice + Crisis stack!)
  burningSoulMaxHpPct: number; // 0, 0.006, or 0.012
  lifelineShieldTier: 'none' | 'magic_blade' | 'rose_gold';
  hasImpulse: boolean;
  hasGoldenStaff: boolean;
  hasBerserkersFury: boolean;
  cdrCapPct: number; // 40 default, 45 with Enchanted Talisman Magic Mastery
}

export function resolveUniqueItemPassives(ownedItemIds: readonly string[]): ResolvedUniquePassives {
  const uniqueSet = new Set(ownedItemIds);
  const activePassiveNames = new Set<string>();

  const hasLifebane =
    uniqueSet.has('sea_halberd') || uniqueSet.has('glowing_wand') || uniqueSet.has('dominance_ice');
  if (hasLifebane) activePassiveNames.add('Lifebane');

  const hasArmorBuster = uniqueSet.has('malefic_roar') || uniqueSet.has('malefic_gun');
  if (hasArmorBuster) activePassiveNames.add('Armor Buster');

  const hasDivineJustice = uniqueSet.has('endless_battle');
  if (hasDivineJustice) activePassiveNames.add('Divine Justice');

  if (uniqueSet.has('starlium_scythe')) activePassiveNames.add('Crisis');

  const burningSoulMaxHpPct = uniqueSet.has('cursed_helmet')
    ? 0.012
    : uniqueSet.has('molten_essence')
      ? 0.006
      : 0;
  if (burningSoulMaxHpPct > 0) activePassiveNames.add('Burning Soul');

  const lifelineShieldTier = uniqueSet.has('rose_gold_meteor')
    ? 'rose_gold'
    : uniqueSet.has('magic_blade')
      ? 'magic_blade'
      : 'none';
  if (lifelineShieldTier !== 'none') activePassiveNames.add('Lifeline');

  const hasImpulse =
    uniqueSet.has('corrosion_scythe') ||
    uniqueSet.has('feather_of_heaven') ||
    uniqueSet.has('swift_crossbow');
  if (hasImpulse) activePassiveNames.add('Impulse');

  const hasGoldenStaff = uniqueSet.has('golden_staff');
  if (hasGoldenStaff) activePassiveNames.add('Swift');

  const hasBerserkersFury = uniqueSet.has('berserkers_fury');
  if (hasBerserkersFury) activePassiveNames.add('Doom');

  const cdrCapPct = uniqueSet.has('enchanted_talisman') ? 45 : 40;
  if (cdrCapPct === 45) activePassiveNames.add('Magic Mastery');

  const spellbladeStacks =
    (hasDivineJustice ? 1 : 0) + (uniqueSet.has('starlium_scythe') ? 1 : 0);

  return {
    activePassiveNames: Array.from(activePassiveNames),
    antiHealReductionPct: hasLifebane ? 50 : 0,
    armorBusterPctPen: hasArmorBuster ? 0.3 : 0,
    hasDivineJustice,
    hasCrisis: uniqueSet.has('starlium_scythe'),
    spellbladeStacks,
    burningSoulMaxHpPct,
    lifelineShieldTier,
    hasImpulse,
    hasGoldenStaff,
    hasBerserkersFury,
    cdrCapPct
  };
}

/**
 * Computes the Death Damage Recap Breakdown:
 * Physical % / Magic % / True % totals + Top 3 contributing killers & their top skills.
 */
export interface RawDamageLogHit {
  attackerId: string;
  attackerName: string;
  heroId: string;
  sourceName: string;
  damageType: MlbbDamageType;
  amount: number;
  timeSec: number;
}

export interface RawCcLogEvent {
  ccType: MlbbCcType;
  durationSec: number;
  timeSec: number;
}

export function computeDeathRecapBreakdown(
  hits: readonly RawDamageLogHit[],
  deathTimeSec: number,
  killerName: string,
  killerHeroId: string,
  ccEvents: readonly RawCcLogEvent[] = []
): MlbbDeathRecap {
  const recent = hits.filter((h) => deathTimeSec - h.timeSec <= 15 && h.amount > 0);
  let physicalTotal = 0;
  let magicTotal = 0;
  let trueTotal = 0;

  const byAttacker = new Map<
    string,
    {
      attackerId: string;
      attackerName: string;
      heroId: string;
      totalDamage: number;
      physical: number;
      magic: number;
      trueDmg: number;
      sources: Map<string, number>;
    }
  >();

  for (const h of recent) {
    if (h.damageType === 'physical') physicalTotal += h.amount;
    else if (h.damageType === 'magic') magicTotal += h.amount;
    else trueTotal += h.amount;

    let entry = byAttacker.get(h.attackerId);
    if (!entry) {
      entry = {
        attackerId: h.attackerId,
        attackerName: h.attackerName,
        heroId: h.heroId,
        totalDamage: 0,
        physical: 0,
        magic: 0,
        trueDmg: 0,
        sources: new Map()
      };
      byAttacker.set(h.attackerId, entry);
    }
    entry.totalDamage += h.amount;
    if (h.damageType === 'physical') entry.physical += h.amount;
    else if (h.damageType === 'magic') entry.magic += h.amount;
    else entry.trueDmg += h.amount;
    entry.sources.set(h.sourceName, (entry.sources.get(h.sourceName) ?? 0) + h.amount);
  }

  const totalDamage = Math.max(1, physicalTotal + magicTotal + trueTotal);
  const physicalPct = Math.round((physicalTotal / totalDamage) * 100);
  const magicPct = Math.round((magicTotal / totalDamage) * 100);
  const truePct = Math.max(0, 100 - physicalPct - magicPct);

  const contributors: MlbbDeathRecapEntry[] = Array.from(byAttacker.values())
    .sort((a, b) => b.totalDamage - a.totalDamage)
    .slice(0, 3)
    .map((e) => {
      const topSkills = Array.from(e.sources.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, dmg]) => ({ name, damage: Math.round(dmg) }));
      return {
        attackerId: e.attackerId,
        attackerName: e.attackerName,
        heroId: e.heroId,
        totalDamage: Math.round(e.totalDamage),
        sharePct: Math.round((e.totalDamage / totalDamage) * 100),
        physical: Math.round(e.physical),
        magic: Math.round(e.magic),
        trueDmg: Math.round(e.trueDmg),
        topSkills
      };
    });

  // Aggregate Crowd Control suffered over the last 15 seconds
  const recentCc = ccEvents.filter((c) => deathTimeSec - c.timeSec <= 15 && c.durationSec > 0);
  const ccByType = new Map<MlbbCcType, { durationSec: number; count: number }>();
  let rawCcTotal = 0;
  for (const c of recentCc) {
    rawCcTotal += c.durationSec;
    const prev = ccByType.get(c.ccType) ?? { durationSec: 0, count: 0 };
    ccByType.set(c.ccType, {
      durationSec: prev.durationSec + c.durationSec,
      count: prev.count + 1
    });
  }
  const ccBreakdown: MlbbCcRecapEntry[] = Array.from(ccByType.entries())
    .map(([ccType, info]) => ({
      ccType,
      durationSec: Math.round(info.durationSec * 10) / 10,
      count: info.count
    }))
    .sort((a, b) => b.durationSec - a.durationSec);

  return {
    killerName,
    killerHeroId,
    deathTimeSec,
    totalDamage: Math.round(physicalTotal + magicTotal + trueTotal),
    physicalTotal: Math.round(physicalTotal),
    magicTotal: Math.round(magicTotal),
    trueTotal: Math.round(trueTotal),
    physicalPct,
    magicPct,
    truePct,
    totalCcSec: Math.round(rawCcTotal * 10) / 10,
    ccBreakdown,
    contributors
  };
}

/**
 * Classifies a tactical ping button press into a crisp instant tap vs. a press-and-hold/drag
 * gesture that opens the Pop-Out Tactical Mini-Map (140ms hold OR >10px pointer movement).
 */
export function classifyPingGesture(elapsedMs: number, movedPx: number): 'tap' | 'drag' {
  return elapsedMs >= 140 || movedPx > 10 ? 'drag' : 'tap';
}

/**
 * Generates an interpolated "On My Way" cyan dotted route polyline from hero position to destination.
 */
export function buildOmwRouteFromHero(
  heroX: number,
  heroY: number,
  destX: number,
  destY: number,
  segments = 6
): { x: number; y: number }[] {
  const count = Math.max(2, Math.floor(segments));
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    pts.push({
      x: Math.round(heroX + (destX - heroX) * t),
      y: Math.round(heroY + (destY - heroY) * t)
    });
  }
  return pts;
}

/**
 * Post-Match Rating (3.0 - 15.0) and Medal Computation.
 */
export function computeMatchRatingAndMedal(
  kills: number,
  deaths: number,
  assists: number,
  damageDealt: number,
  turretDamage: number,
  teamfightPct: number
): { rating: number; medal: 'Gold' | 'Silver' | 'Bronze' } {
  const kdaScore = (kills * 1.25 + assists * 0.72) / Math.max(1, deaths + 0.65);
  const contribScore =
    Math.min(2.2, damageDealt / 18000) +
    Math.min(1.4, turretDamage / 8000) +
    Math.min(1.6, teamfightPct / 45);
  const raw = 4.2 + Math.min(6.4, kdaScore * 1.35) + contribScore;
  const rating = Math.max(3.0, Math.min(15.0, Math.round(raw * 10) / 10));
  const medal: 'Gold' | 'Silver' | 'Bronze' =
    rating >= 8.2 ? 'Gold' : rating >= 6.0 ? 'Silver' : 'Bronze';
  return { rating, medal };
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function distSq(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}
