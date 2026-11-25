import { BLUE_FOUNTAIN, LANE_WAYPOINTS, RED_FOUNTAIN } from '../data/mapData';
import { computeMlbbQuickBuy } from '../data/items';
import { MLBB_EMOTES } from '../data/emblems';
import { MlbbAiDifficulty } from '../types';
import { clamp, computeRetributionThreshold, dist, getCcPriority } from './CombatMath';
import {
  castBattleSpell,
  castHeroSkill,
  SimHero,
  SkillCastContext
} from './SkillPhysics';
import { BotPingOrder } from './PingSystem';
import {
  computeCounterBuildPlan,
  findGankOpportunity,
  findPeelTarget,
  getAiDifficultyProfile,
  shouldTriggerBotActiveOrPurify
} from './SmartAiBrain';

export interface AiStepHelpers {
  ctx: SkillCastContext;
  expLane: 'top' | 'bot';
  goldLane: 'top' | 'bot';
  isBrawl: boolean;
  difficulty?: MlbbAiDifficulty;
  activePingOrder?: BotPingOrder | null;
  basicAttackTarget: (attacker: SimHero, targetKind: 'hero' | 'minion' | 'jungle' | 'turret', targetId: string) => void;
  buyItemForHero: (hero: SimHero, itemId: string) => boolean;
  triggerHeroEmote: (hero: SimHero, emoteId: string) => void;
  triggerActiveItemForHero?: (hero: SimHero) => void;
}

function getAssignedLaneKey(hero: SimHero, expLane: 'top' | 'bot', goldLane: 'top' | 'bot', isBrawl: boolean): 'top' | 'mid' | 'bot' {
  if (isBrawl) return 'mid';
  if (hero.lane === 'EXP') return expLane;
  if (hero.lane === 'Gold') return goldLane;
  return 'mid';
}

export function stepAiHero(hero: SimHero, dt: number, helpers: AiStepHelpers): void {
  if (!hero.alive || hero.isPlayer || hero.isTrainingDummy) return;
  const diff = getAiDifficultyProfile(helpers.difficulty);

  // Reflex Purify even while CC'd (non-Suppression) on Epic / Mythic AI
  if (diff.enablePurifyReflex && hero.spellId === 'purify' && hero.spellCd <= 0 && hero.ccType && getCcPriority(hero.ccType) >= 3 && hero.ccType !== 'suppression') {
    castBattleSpell(hero, hero.facing, helpers.ctx);
  }

  if (hero.ccType && getCcPriority(hero.ccType) >= 4) return;
  if (hero.dashTimer > 0) return;

  const {
    ctx,
    expLane,
    goldLane,
    isBrawl,
    activePingOrder,
    basicAttackTarget,
    buyItemForHero,
    triggerHeroEmote,
    triggerActiveItemForHero
  } = helpers;
  const { heroes, minions, turrets, jungleMobs, matchTimeSec } = ctx;

  // Auto level up skills for AI bots
  if (hero.skillPoints > 0) {
    const order: (0 | 1 | 2)[] = [2, 0, 1];
    for (const idx of order) {
      const maxLvl = idx === 2 ? 3 : 6;
      const reqLvl = idx === 2 ? (hero.skillLevels[2] === 0 ? 4 : hero.skillLevels[2] === 1 ? 8 : 12) : 1;
      if (hero.skillLevels[idx] < maxLvl && hero.level >= reqLvl) {
        hero.skillLevels[idx]++;
        hero.skillPoints--;
        break;
      }
    }
  }

  // Dynamic Counter-Build + Auto-buy items from hero's build plan
  hero.aiTimer -= dt;
  if (hero.aiTimer <= 0) {
    hero.aiTimer = diff.buyIntervalSec + Math.random() * 0.25;
    if (diff.enableCounterBuild && matchTimeSec >= 120 && hero.items.length >= 2) {
      hero.buildPlan = computeCounterBuildPlan(hero, heroes);
    }
    const qb = computeMlbbQuickBuy(hero.buildPlan, hero.items, hero.gold, null);
    if (qb.length > 0 && qb[0].canAfford) {
      buyItemForHero(hero, qb[0].id);
    }
  }

  const home = hero.team === 'blue' ? BLUE_FOUNTAIN : RED_FOUNTAIN;
  const hpPct = hero.hp / Math.max(1, hero.maxHp);

  // 1. RETREAT / RECALL if low HP
  const retreatThresh = diff.tier === 'mythic' ? 0.27 : diff.tier === 'epic' ? 0.24 : 0.19;
  if (hpPct < retreatThresh && !isBrawl) {
    hero.aiState = 'retreat';
    const dHome = dist(hero.x, hero.y, home.x, home.y);
    if (dHome < 260) {
      hero.vx = 0;
      hero.vy = 0;
      return;
    }
    const nearestThreat = heroes.find((h) => h.alive && h.team !== hero.team && !h.isTrainingDummy && dist(hero.x, hero.y, h.x, h.y) < 540);
    if (!nearestThreat && dHome > 900 && !hero.recalling) {
      hero.recalling = true;
      hero.recallTimer = 4.0;
      hero.vx = 0;
      hero.vy = 0;
      return;
    }
    if (hero.recalling) {
      hero.vx = 0;
      hero.vy = 0;
      return;
    }
    const ang = Math.atan2(home.y - hero.y, home.x - hero.x);
    hero.vx = Math.cos(ang);
    hero.vy = Math.sin(ang);
    hero.facing = ang;
    if (hero.spellCd <= 0 && (hero.spellId === 'sprint' || hero.spellId === 'aegis' || hero.spellId === 'flicker' || hero.spellId === 'revitalize')) {
      castBattleSpell(hero, ang, ctx);
    }
    if (nearestThreat && triggerActiveItemForHero && shouldTriggerBotActiveOrPurify(hero, [nearestThreat], diff) === 'active_item') {
      triggerActiveItemForHero(hero);
    }
    return;
  }

  hero.recalling = false;

  // 1B. PING-RESPONSIVE ALLIED AI COMMANDS (Drag-to-Mark Attack / Gather / Retreat / OMW)
  if (activePingOrder) {
    const dPing = dist(hero.x, hero.y, activePingOrder.x, activePingOrder.y);
    if (activePingOrder.kind === 'retreat' && dPing < 650) {
      hero.aiState = 'retreat';
      const retreatAng = Math.atan2(home.y - hero.y, home.x - hero.x);
      hero.vx = Math.cos(retreatAng);
      hero.vy = Math.sin(retreatAng);
      hero.facing = retreatAng;
      return;
    }
    if ((activePingOrder.kind === 'attack' || activePingOrder.kind === 'gather' || activePingOrder.kind === 'omw') && dPing > 220) {
      hero.aiState = 'objective';
      const moveAng = Math.atan2(activePingOrder.y - hero.y, activePingOrder.x - hero.x);
      hero.vx = Math.cos(moveAng);
      hero.vy = Math.sin(moveAng);
      hero.facing = moveAng;
      if (activePingOrder.targetHeroId) {
        const marked = heroes.find((h) => h.id === activePingOrder.targetHeroId && h.alive && dist(hero.x, hero.y, h.x, h.y) <= hero.heroDef.attackRange + 90);
        if (marked) {
          const mAng = Math.atan2(marked.y - hero.y, marked.x - hero.x);
          hero.facing = mAng;
          hero.vx = 0;
          hero.vy = 0;
          basicAttackTarget(hero, 'hero', marked.id);
          if (hero.skillLevels[0] > 0 && hero.skillCds[0] <= 0) castHeroSkill(hero, 1, mAng, dist(hero.x, hero.y, marked.x, marked.y), ctx);
        }
      }
      return;
    }
  }

  // 2. OBJECTIVE CHECK (Turtle at 1:50+, Lord at 7:50+) for Jungler / Roam (or Mythic Mid/EXP)
  const shouldContestObjective =
    !isBrawl &&
    (hero.isJungler || hero.isRoamer || (diff.tier === 'mythic' && (hero.lane === 'Mid' || hero.lane === 'EXP')));
  if (shouldContestObjective) {
    const objMob = jungleMobs.find(
      (m) =>
        m.alive &&
        ((m.kind === 'turtle' && matchTimeSec >= 110) || (m.kind === 'lord' && matchTimeSec >= 470)) &&
        dist(hero.x, hero.y, m.x, m.y) < (hero.isJungler || hero.isRoamer ? 1750 : 1150)
    );
    if (objMob) {
      hero.aiState = 'objective';
      const dObj = dist(hero.x, hero.y, objMob.x, objMob.y);
      const ang = Math.atan2(objMob.y - hero.y, objMob.x - hero.x);
      hero.facing = ang;
      if (dObj > hero.heroDef.attackRange * 0.85) {
        hero.vx = Math.cos(ang);
        hero.vy = Math.sin(ang);
      } else {
        hero.vx = 0;
        hero.vy = 0;
        basicAttackTarget(hero, 'jungle', objMob.id);
        if (hero.spellId === 'retribution' && hero.spellCd <= 0) {
          const thresh = computeRetributionThreshold(hero.level, hero.junglerStacks >= 5);
          if (objMob.hp <= thresh * diff.retriMargin) {
            castBattleSpell(hero, ang, ctx);
          }
        }
        if (hero.skillCds[0] <= 0 && hero.skillLevels[0] > 0) castHeroSkill(hero, 1, ang, dObj, ctx);
      }
      return;
    }
  }

  // 3. JUNGLING for Jungler role (prioritize Buffs before ganks)
  if (!isBrawl && hero.isJungler) {
    const camp = jungleMobs
      .filter((m) => m.alive && m.teamSide === hero.team && m.kind !== 'turtle' && m.kind !== 'lord')
      .sort((a, b) => dist(hero.x, hero.y, a.x, a.y) - dist(hero.x, hero.y, b.x, b.y))[0];
    if (camp && dist(hero.x, hero.y, camp.x, camp.y) < 1100) {
      hero.aiState = 'jungle';
      const dCamp = dist(hero.x, hero.y, camp.x, camp.y);
      const ang = Math.atan2(camp.y - hero.y, camp.x - hero.x);
      hero.facing = ang;
      if (dCamp > hero.heroDef.attackRange * 0.85) {
        hero.vx = Math.cos(ang);
        hero.vy = Math.sin(ang);
      } else {
        hero.vx = 0;
        hero.vy = 0;
        basicAttackTarget(hero, 'jungle', camp.id);
        if (hero.skillCds[0] <= 0 && hero.skillLevels[0] > 0) castHeroSkill(hero, 1, ang, dCamp, ctx);
        if (hero.spellId === 'retribution' && hero.spellCd <= 0 && camp.hp <= computeRetributionThreshold(hero.level, hero.junglerStacks >= 5) * diff.retriMargin) {
          castBattleSpell(hero, ang, ctx);
        }
      }
      return;
    }
  }

  // 4. TEAMFIGHT, PEELING & HERO COMBAT
  const enemyHeroes = heroes
    .filter((h) => h.alive && h.team !== hero.team && !h.isTrainingDummy && h.untargetableTimer <= 0 && h.stealthTimer <= 0 && dist(hero.x, hero.y, h.x, h.y) <= 800)
    .sort((a, b) => a.hp / Math.max(1, a.maxHp) - b.hp / Math.max(1, b.maxHp));

  // Check if under an enemy turret with no allied minions tanking -> back off!
  const dangerousTurret = turrets.find(
    (t) =>
      t.alive &&
      t.team !== hero.team &&
      dist(hero.x, hero.y, t.x, t.y) < t.range + 40 &&
      !minions.some((m) => m.alive && m.team === hero.team && dist(m.x, m.y, t.x, t.y) < t.range)
  );
  if (dangerousTurret) {
    const outAng = Math.atan2(hero.y - dangerousTurret.y, hero.x - dangerousTurret.x);
    hero.vx = Math.cos(outAng);
    hero.vy = Math.sin(outAng);
    hero.facing = outAng;
    return;
  }

  // Support AI: heal/shield low-HP allies
  if (hero.role === 'Support') {
    const lowAlly = heroes.find(
      (h) => h.alive && h.team === hero.team && h.id !== hero.id && h.hp / Math.max(1, h.maxHp) < 0.62 && dist(hero.x, hero.y, h.x, h.y) < 720
    );
    if (lowAlly) {
      const ang = Math.atan2(lowAlly.y - hero.y, lowAlly.x - hero.x);
      if (hero.skillCds[0] <= 0 && hero.skillLevels[0] > 0) castHeroSkill(hero, 1, ang, dist(hero.x, hero.y, lowAlly.x, lowAlly.y), ctx);
      if (lowAlly.hp / Math.max(1, lowAlly.maxHp) < 0.44 && hero.skillCds[2] <= 0 && hero.skillLevels[2] > 0) {
        castHeroSkill(hero, 3, ang, 300, ctx);
      }
      if (hero.spellCd <= 0 && hero.spellId === 'revitalize' && dist(hero.x, hero.y, lowAlly.x, lowAlly.y) < 340) {
        castBattleSpell(hero, ang, ctx);
      }
    }
  }

  // Tank / Support Peel Priority (Epic / Mythic)
  const peelTarget = diff.enablePeel ? findPeelTarget(hero, heroes) : null;

  if (enemyHeroes.length > 0 || peelTarget) {
    hero.aiState = 'fight';
    const tgt = peelTarget ?? enemyHeroes[0];
    const dTgt = dist(hero.x, hero.y, tgt.x, tgt.y);
    const ang = Math.atan2(tgt.y - hero.y, tgt.x - hero.x);
    hero.facing = ang;

    // Smart Active Item trigger (Wind of Nature / Winter Crown / Conceal)
    const activeDecision = shouldTriggerBotActiveOrPurify(hero, enemyHeroes.length > 0 ? enemyHeroes : [tgt], diff);
    if (activeDecision === 'active_item' && triggerActiveItemForHero) {
      triggerActiveItemForHero(hero);
    }

    // Cast combo skills (scaled by difficulty combo cadence)
    if (Math.random() <= diff.comboSkillChance) {
      if (hero.skillLevels[2] > 0 && hero.skillCds[2] <= 0 && (tgt.hp / Math.max(1, tgt.maxHp) < 0.68 || enemyHeroes.length >= 2 || Boolean(peelTarget))) {
        if (dTgt <= Math.max(360, hero.heroDef.skills[2].range)) {
          castHeroSkill(hero, 3, ang, dTgt, ctx);
        }
      }
      if (hero.skillLevels[1] > 0 && hero.skillCds[1] <= 0 && dTgt <= Math.max(280, hero.heroDef.skills[1].range)) {
        castHeroSkill(hero, 2, ang, dTgt, ctx);
      }
      if (hero.skillLevels[0] > 0 && hero.skillCds[0] <= 0 && dTgt <= Math.max(280, hero.heroDef.skills[0].range)) {
        castHeroSkill(hero, 1, ang, dTgt, ctx);
      }
    }
    if (hero.spellCd <= 0 && tgt.hp / Math.max(1, tgt.maxHp) < 0.26 && (hero.spellId === 'execute' || hero.spellId === 'flameshot')) {
      castBattleSpell(hero, ang, ctx);
    }
    if (hero.spellCd <= 0 && (hero.spellId === 'inspire' || hero.spellId === 'vengeance' || hero.spellId === 'petrify' || hero.spellId === 'aegis')) {
      if (dTgt < 340) castBattleSpell(hero, ang, ctx);
    }

    // Precision Kiting & Strafe Movement for Marksmen / Mages vs Melee chase
    const idealDist = hero.heroDef.isRanged ? hero.heroDef.attackRange * 0.85 : hero.heroDef.attackRange * 0.72;
    if (dTgt > hero.heroDef.attackRange) {
      hero.vx = Math.cos(ang);
      hero.vy = Math.sin(ang);
    } else if (hero.heroDef.isRanged && dTgt < idealDist * 0.68) {
      const strafeDir = ((Math.floor(matchTimeSec * 0.7) + (hero.id.charCodeAt(0) % 2)) % 2 === 0 ? 1 : -1) * diff.kiteStrafeStrength;
      const backAng = ang + Math.PI + strafeDir * 0.45;
      hero.vx = Math.cos(backAng);
      hero.vy = Math.sin(backAng);
      basicAttackTarget(hero, 'hero', tgt.id);
    } else {
      hero.vx = 0;
      hero.vy = 0;
      basicAttackTarget(hero, 'hero', tgt.id);
    }

    // Contextual AI Emote on low-HP duel / kill play
    if (hero.emoteCd <= 0 && tgt.hp / Math.max(1, tgt.maxHp) < 0.2 && Math.random() < 0.012) {
      const em = MLBB_EMOTES[Math.floor(Math.random() * 4)];
      triggerHeroEmote(hero, em.id);
    }
    return;
  }

  // 4B. PROACTIVE GANKING FOR JUNGLER / ROAM / MID (Epic & Mythic)
  if (!isBrawl && diff.enableGanking) {
    const gankTarget = findGankOpportunity(hero, heroes, turrets);
    if (gankTarget) {
      hero.aiState = 'fight';
      const gAng = Math.atan2(gankTarget.y - hero.y, gankTarget.x - hero.x);
      hero.vx = Math.cos(gAng);
      hero.vy = Math.sin(gAng);
      hero.facing = gAng;
      return;
    }
  }

  // 5. LANING & PUSHING MINIONS / TURRETS
  hero.aiState = 'lane';
  const laneKey = getAssignedLaneKey(hero, expLane, goldLane, isBrawl);
  const wps = LANE_WAYPOINTS[laneKey];
  const ordered = hero.team === 'blue' ? wps : [...wps].reverse();

  const enemyMinion = minions
    .filter((m) => m.alive && m.team !== hero.team && dist(hero.x, hero.y, m.x, m.y) < 580)
    .sort((a, b) => a.hp - b.hp)[0];

  if (enemyMinion) {
    const dm = dist(hero.x, hero.y, enemyMinion.x, enemyMinion.y);
    const ang = Math.atan2(enemyMinion.y - hero.y, enemyMinion.x - hero.x);
    hero.facing = ang;
    if (dm > hero.heroDef.attackRange * 0.9) {
      hero.vx = Math.cos(ang);
      hero.vy = Math.sin(ang);
    } else {
      hero.vx = 0;
      hero.vy = 0;
      basicAttackTarget(hero, 'minion', enemyMinion.id);
      if (hero.skillCds[0] <= 0 && hero.skillLevels[0] > 0 && hero.mana / Math.max(1, hero.maxMana) > 0.45) {
        castHeroSkill(hero, 1, ang, dm, ctx);
      }
    }
    return;
  }

  const enemyTurret = turrets
    .filter((t) => t.alive && t.team !== hero.team && dist(hero.x, hero.y, t.x, t.y) < 620)
    .sort((a, b) => dist(hero.x, hero.y, a.x, a.y) - dist(hero.x, hero.y, b.x, b.y))[0];

  if (enemyTurret) {
    const allyTank = minions.some((m) => m.alive && m.team === hero.team && dist(m.x, m.y, enemyTurret.x, enemyTurret.y) < enemyTurret.range);
    const dtTurret = dist(hero.x, hero.y, enemyTurret.x, enemyTurret.y);
    const ang = Math.atan2(enemyTurret.y - hero.y, enemyTurret.x - hero.x);
    if (allyTank) {
      hero.facing = ang;
      if (dtTurret > hero.heroDef.attackRange + 35) {
        hero.vx = Math.cos(ang);
        hero.vy = Math.sin(ang);
      } else {
        hero.vx = 0;
        hero.vy = 0;
        basicAttackTarget(hero, 'turret', enemyTurret.id);
      }
      return;
    }
  }

  let targetWp = ordered[Math.min(ordered.length - 1, Math.floor(ordered.length / 2))];
  for (let i = 0; i < ordered.length; i++) {
    const wp = ordered[i];
    if (dist(hero.x, hero.y, wp.x, wp.y) > 220) {
      targetWp = wp;
      const blockingTurret = turrets.find(
        (t) => t.alive && t.team !== hero.team && dist(wp.x, wp.y, t.x, t.y) < 350
      );
      if (blockingTurret) {
        targetWp = ordered[clamp(i - 1, 0, ordered.length - 1)];
        break;
      }
      if (i >= 2) break;
    }
  }

  const ang = Math.atan2(targetWp.y - hero.y, targetWp.x - hero.x);
  hero.vx = Math.cos(ang);
  hero.vy = Math.sin(ang);
  hero.facing = ang;
}
