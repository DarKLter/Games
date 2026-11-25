import { MLBB_RANK_TIERS } from '../data/emblems';
import { getMlbbItemById } from '../data/items';
import {
  MlbbAiDifficulty,
  MlbbMatchRecord,
  MlbbProfileSave
} from '../types';
import { dist, getCcPriority } from './CombatMath';
import { SimHero, SimJungleMob, SimTurret } from './SkillPhysics';

export interface AiDifficultyProfile {
  tier: MlbbAiDifficulty;
  label: string;
  buyIntervalSec: number;
  retriMargin: number; // multiplier on retribution threshold (1.0 = frame-perfect, 1.35 = early/sloppy)
  enableCounterBuild: boolean;
  enableGanking: boolean;
  enablePeel: boolean;
  enableActiveItems: boolean;
  enablePurifyReflex: boolean;
  kiteStrafeStrength: number; // 0..1 lateral kite strafe
  comboSkillChance: number; // 0..1 chance to weave full combo cleanly
}

export const AI_DIFFICULTY_PROFILES: Record<MlbbAiDifficulty, AiDifficultyProfile> = {
  warrior: {
    tier: 'warrior',
    label: 'Warrior (Casual)',
    buyIntervalSec: 1.4,
    retriMargin: 1.35,
    enableCounterBuild: false,
    enableGanking: false,
    enablePeel: false,
    enableActiveItems: false,
    enablePurifyReflex: false,
    kiteStrafeStrength: 0.25,
    comboSkillChance: 0.55
  },
  epic: {
    tier: 'epic',
    label: 'Epic (Competitive)',
    buyIntervalSec: 0.85,
    retriMargin: 1.12,
    enableCounterBuild: true,
    enableGanking: true,
    enablePeel: true,
    enableActiveItems: true,
    enablePurifyReflex: true,
    kiteStrafeStrength: 0.65,
    comboSkillChance: 0.85
  },
  mythic: {
    tier: 'mythic',
    label: 'Mythic (Pro Macro)',
    buyIntervalSec: 0.5,
    retriMargin: 1.02,
    enableCounterBuild: true,
    enableGanking: true,
    enablePeel: true,
    enableActiveItems: true,
    enablePurifyReflex: true,
    kiteStrafeStrength: 0.95,
    comboSkillChance: 1.0
  }
};

export function getAiDifficultyProfile(tier?: MlbbAiDifficulty): AiDifficultyProfile {
  return AI_DIFFICULTY_PROFILES[tier ?? 'epic'] ?? AI_DIFFICULTY_PROFILES.epic;
}

const HIGH_HEAL_HERO_IDS = new Set([
  'estes', 'angela', 'floryn', 'rafaela', 'uranus', 'esmeralda',
  'ruby', 'yu_zhong', 'alucard', 'alice', 'thamuz', 'alpha', 'hilda', 'lapu_lapu'
]);

/**
 * Dynamically adapts an AI bot's situational late-game slots (slots 4-5)
 * to counter enemy Magic burst, Healing/Sustain, or High Armor compositions.
 */
export function computeCounterBuildPlan(bot: SimHero, allHeroes: SimHero[]): string[] {
  const basePlan = [...(bot.buildPlan.length > 0 ? bot.buildPlan : bot.heroDef.recommendedBuild)];
  if (basePlan.length < 5) return basePlan;

  const enemies = allHeroes.filter((h) => h.team !== bot.team && !h.isTrainingDummy);
  if (enemies.length === 0) return basePlan;

  const magicThreats = enemies.filter((e) => e.role === 'Mage' || e.magicPow >= 260).length;
  const sustainThreats = enemies.filter(
    (e) =>
      HIGH_HEAL_HERO_IDS.has(e.heroDef.id) ||
      e.lifestealPct >= 0.16 ||
      e.spellVampPct >= 0.16
  ).length;
  const tankThreats = enemies.filter((e) => e.role === 'Tank' || e.physDef >= 115 || e.magicDef >= 95).length;

  const isMagicCarry = bot.role === 'Mage' || bot.heroDef.baseMagicPow > 0;
  const isTankOrSupport = bot.role === 'Tank' || bot.role === 'Support';

  const hasItemInPlan = (id: string) => basePlan.includes(id) || bot.items.includes(id);

  // 1. Anti-Heal Counter Priority
  if (sustainThreats >= 1) {
    const antiHealId = isTankOrSupport ? 'dominance_ice' : isMagicCarry ? 'glowing_wand' : 'sea_halberd';
    if (!hasItemInPlan(antiHealId) && getMlbbItemById(antiHealId)) {
      basePlan[4] = antiHealId;
    }
  }

  // 2. Heavy Magic Burst Counter (Slot 5 defense for Fighters/Tanks/Marksmen)
  if (magicThreats >= 2 && !isMagicCarry) {
    const magicDefId = bot.role === 'Marksman' ? 'rose_gold_meteor' : 'athenas_shield';
    if (!hasItemInPlan(magicDefId) && getMlbbItemById(magicDefId)) {
      basePlan[5] = magicDefId;
    }
  } else if (tankThreats >= 2 && !isTankOrSupport) {
    // 3. Heavy Armor/Tank Counter -> % Penetration
    const penId = isMagicCarry ? 'divine_glaive' : 'malefic_roar';
    if (!hasItemInPlan(penId) && getMlbbItemById(penId)) {
      basePlan[4] = penId;
    }
  }

  return basePlan;
}

/**
 * Evaluates whether a Jungler, Mid Mage, or Roamer should rotate to gank
 * a vulnerable overextended enemy hero outside safe enemy turret protection.
 */
export function findGankOpportunity(
  bot: SimHero,
  allHeroes: SimHero[],
  turrets: SimTurret[]
): SimHero | null {
  if (!bot.isJungler && !bot.isRoamer && bot.lane !== 'Mid') return null;
  if (bot.hp / Math.max(1, bot.maxHp) < 0.52) return null;

  let bestTarget: SimHero | null = null;
  let bestScore = -1;

  for (const enemy of allHeroes) {
    if (!enemy.alive || enemy.team === bot.team || enemy.isTrainingDummy) continue;
    if (enemy.stealthTimer > 0 || enemy.untargetableTimer > 0) continue;

    const d = dist(bot.x, bot.y, enemy.x, enemy.y);
    if (d > 1650) continue;

    // Avoid tower diving full-HP targets under enemy turrets
    const underEnemyTurret = turrets.some(
      (t) => t.alive && t.team === enemy.team && dist(enemy.x, enemy.y, t.x, t.y) < t.range + 30
    );
    const enemyHpPct = enemy.hp / Math.max(1, enemy.maxHp);
    if (underEnemyTurret && enemyHpPct > 0.28) continue;

    const nearbyAlly = allHeroes.some(
      (a) => a.alive && a.team === bot.team && a.id !== bot.id && dist(a.x, a.y, enemy.x, enemy.y) < 760
    );

    const score =
      (1 - enemyHpPct) * 60 +
      (nearbyAlly ? 35 : 0) +
      (1 - d / 1650) * 30 +
      (enemy.role === 'Marksman' || enemy.role === 'Mage' ? 18 : 0);

    if (score > 48 && score > bestScore) {
      bestScore = score;
      bestTarget = enemy;
    }
  }

  return bestTarget;
}

/**
 * Tank & Support peeling logic: finds an enemy diving a nearby allied Marksman or Mage carry.
 */
export function findPeelTarget(bot: SimHero, allHeroes: SimHero[]): SimHero | null {
  if (bot.role !== 'Tank' && bot.role !== 'Support') return null;

  const threatenedCarry = allHeroes.find(
    (ally) =>
      ally.alive &&
      ally.team === bot.team &&
      ally.id !== bot.id &&
      (ally.role === 'Marksman' || ally.role === 'Mage') &&
      dist(bot.x, bot.y, ally.x, ally.y) < 820 &&
      ally.hp / Math.max(1, ally.maxHp) < 0.75
  );
  if (!threatenedCarry) return null;

  const diver = allHeroes
    .filter(
      (e) =>
        e.alive &&
        e.team !== bot.team &&
        !e.isTrainingDummy &&
        dist(e.x, e.y, threatenedCarry.x, threatenedCarry.y) < 420
    )
    .sort(
      (a, b) =>
        dist(a.x, a.y, threatenedCarry.x, threatenedCarry.y) -
        dist(b.x, b.y, threatenedCarry.x, threatenedCarry.y)
    )[0];

  return diver ?? null;
}

/**
 * Smart Active Equipment & Purify Reflex decision for Epic / Mythic AI bots.
 */
export function shouldTriggerBotActiveOrPurify(
  bot: SimHero,
  nearbyEnemies: SimHero[],
  profile: AiDifficultyProfile
): 'purify' | 'active_item' | null {
  if (profile.enablePurifyReflex && bot.spellId === 'purify' && bot.spellCd <= 0) {
    if (bot.ccType && getCcPriority(bot.ccType) >= 3 && bot.ccType !== 'suppression') {
      return 'purify';
    }
  }

  if (!profile.enableActiveItems || bot.activeItemCd > 0) return null;
  const hpPct = bot.hp / Math.max(1, bot.maxHp);

  const hasWind = bot.items.includes('wind_of_nature');
  const hasWinter = bot.items.includes('winter_crown');
  const hasConceal = bot.blessingId === 'roam_conceal';

  if (hasWind && hpPct < 0.48 && nearbyEnemies.some((e) => e.physAtk > e.magicPow && dist(bot.x, bot.y, e.x, e.y) < 520)) {
    return 'active_item';
  }
  if (hasWinter && hpPct < 0.28 && nearbyEnemies.length >= 1) {
    return 'active_item';
  }
  if (hasConceal && nearbyEnemies.length >= 1 && nearbyEnemies.every((e) => dist(bot.x, bot.y, e.x, e.y) > 480 && dist(bot.x, bot.y, e.x, e.y) < 1100)) {
    return 'active_item';
  }

  return null;
}

/**
 * Auto-Director camera selector for Esports Live Stream mode:
 * prioritizes active multi-hero teamfights, Turtle/Lord pit contests, and low-HP skirmishes.
 */
export function selectAutoDirectorHero(
  heroes: SimHero[],
  jungleMobs: SimJungleMob[],
  matchTimeSec: number
): string | null {
  const aliveHeroes = heroes.filter((h) => h.alive && !h.isTrainingDummy);
  if (aliveHeroes.length === 0) return null;

  const activeBoss = jungleMobs.find(
    (m) => m.alive && ((m.kind === 'turtle' && matchTimeSec >= 110) || (m.kind === 'lord' && matchTimeSec >= 470))
  );

  let bestId = aliveHeroes[0].id;
  let bestHeat = -1;

  for (const h of aliveHeroes) {
    const nearbyEnemies = aliveHeroes.filter((e) => e.team !== h.team && dist(h.x, h.y, e.x, e.y) < 620).length;
    const nearbyAllies = aliveHeroes.filter((a) => a.team === h.team && a.id !== h.id && dist(h.x, h.y, a.x, a.y) < 620).length;
    const hpPct = h.hp / Math.max(1, h.maxHp);
    const bossBonus = activeBoss && dist(h.x, h.y, activeBoss.x, activeBoss.y) < 680 ? 38 : 0;

    const heat =
      nearbyEnemies * 32 +
      (nearbyEnemies > 0 ? nearbyAllies * 14 : 0) +
      (nearbyEnemies > 0 && hpPct < 0.45 ? 25 : 0) +
      bossBonus +
      h.kills * 2.5;

    if (heat > bestHeat) {
      bestHeat = heat;
      bestId = h.id;
    }
  }

  return bestId;
}

export interface PostMatchProgressionResult {
  nextProfile: MlbbProfileSave;
  starDelta: number;
  starProtected: boolean;
  starProtectionSource: 'points' | 'card' | null;
  starRaisedBonus: boolean;
  bpGain: number;
  expGain: number;
  doubleBpUsed: boolean;
  doubleExpUsed: boolean;
  mmrDelta: number;
  masteryGain: number;
}

/**
 * Computes full Part 7 Post-Match Progression:
 * - Ranked Star Gain / Loss
 * - Star Protection (auto-saves star on defeat via 1000 Protection Points OR Backpack Star Protection Card)
 * - Star Raising Card (+1 bonus star on Ranked win)
 * - Double BP & Double EXP Card bonuses
 * - Hero MMR & Mastery progression + Daily/Weekly Activity + Starlight XP
 */
export function computePostMatchProgression(
  prev: MlbbProfileSave,
  record: MlbbMatchRecord
): PostMatchProgressionResult {
  let tierIdx = prev.rankTierIdx;
  let stars = prev.rankStars;
  let prot = prev.starProtectionPts;
  let starDelta = 0;
  let starProtected = false;
  let starProtectionSource: 'points' | 'card' | null = null;
  let starRaisedBonus = false;
  const backpack = { ...prev.backpack };

  const isMvp = record.medal === 'MVP';
  const baseBp = record.victory ? (isMvp ? 380 : 320) : isMvp ? 210 : 165;
  const baseExp = record.victory ? (isMvp ? 320 : 280) : isMvp ? 185 : 150;

  let doubleBpUsed = false;
  let doubleExpUsed = false;
  let bpGain = baseBp;
  let expGain = baseExp;

  if (record.mode !== 'practice' && backpack.doubleBpCards > 0) {
    backpack.doubleBpCards -= 1;
    bpGain *= 2;
    doubleBpUsed = true;
  }
  if (record.mode !== 'practice' && backpack.doubleExpCards > 0) {
    backpack.doubleExpCards -= 1;
    expGain *= 2;
    doubleExpUsed = true;
  }

  const tier = MLBB_RANK_TIERS[Math.max(0, Math.min(MLBB_RANK_TIERS.length - 1, tierIdx))];

  if (record.mode === 'ranked') {
    if (record.victory) {
      let gain = 1;
      if (backpack.starRaisingCards > 0 && isMvp) {
        backpack.starRaisingCards -= 1;
        gain = 2;
        starRaisedBonus = true;
      }
      stars += gain;
      starDelta = gain;
      prot = Math.min(1000, prot + (isMvp ? 220 : 140));
      while (stars > tier.starsPerTier && tierIdx < MLBB_RANK_TIERS.length - 1) {
        stars -= tier.starsPerTier;
        tierIdx += 1;
      }
    } else {
      if (prot >= 1000) {
        prot = 0;
        starDelta = 0;
        starProtected = true;
        starProtectionSource = 'points';
      } else if (backpack.starProtectionCards > 0) {
        backpack.starProtectionCards -= 1;
        starDelta = 0;
        starProtected = true;
        starProtectionSource = 'card';
      } else {
        starDelta = -1;
        prot = Math.min(1000, prot + (isMvp ? 180 : 90));
        if (stars > 0) {
          stars -= 1;
        } else if (tierIdx > 0) {
          tierIdx -= 1;
          stars = MLBB_RANK_TIERS[tierIdx].starsPerTier - 1;
        }
      }
    }
  }

  const mmrDelta = record.mode === 'practice' ? 0 : record.victory ? (isMvp ? 36 : 26) : isMvp ? -6 : -14;
  const masteryGain = record.mode === 'practice' ? 2 : record.victory ? (isMvp ? 18 : 12) : 6;

  const prevH = prev.heroStats[record.playerHeroId] ?? { matches: 0, wins: 0, mmr: 1200, mastery: 0 };
  const nextH = {
    matches: prevH.matches + 1,
    wins: prevH.wins + (record.victory ? 1 : 0),
    mmr: Math.max(800, prevH.mmr + mmrDelta),
    mastery: Math.min(100, prevH.mastery + masteryGain)
  };

  const nextExp = prev.exp + expGain;
  const levelUp = Math.floor(nextExp / 1000);
  const nextStarlightXp = prev.starlightXp + (record.victory ? 280 : 180);

  const nextProfile: MlbbProfileSave = {
    ...prev,
    rankTierIdx: tierIdx,
    rankStars: stars,
    starProtectionPts: prot,
    backpack,
    bp: prev.bp + bpGain,
    exp: nextExp % 1000,
    level: prev.level + levelUp,
    dailyActivity: Math.min(800, prev.dailyActivity + 120),
    weeklyActivity: Math.min(1000, prev.weeklyActivity + 140),
    starlightXp: nextStarlightXp % 1000,
    starlightLevel: Math.min(60, prev.starlightLevel + Math.floor(nextStarlightXp / 1000)),
    heroStats: { ...prev.heroStats, [record.playerHeroId]: nextH },
    matchHistory: [record, ...prev.matchHistory].slice(0, 25)
  };

  return {
    nextProfile,
    starDelta,
    starProtected,
    starProtectionSource,
    starRaisedBonus,
    bpGain,
    expGain,
    doubleBpUsed,
    doubleExpUsed,
    mmrDelta,
    masteryGain
  };
}
