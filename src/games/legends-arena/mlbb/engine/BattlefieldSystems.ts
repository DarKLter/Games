import {
  BRAWL_HEALING_SHRINES,
  MLBB_TIMERS
} from '../data/mapData';
import { dist } from './CombatMath';

export interface SimWalkieGrass {
  id: string;
  team: 'blue' | 'red';
  x: number;
  y: number;
  originX: number;
  originY: number;
  radius: number;
  ttl: number;
  maxTtl: number;
  phase: number;
}

export interface SimBrawlShrine {
  id: string;
  side: 'blue' | 'red';
  x: number;
  y: number;
  active: boolean;
  respawnTimer: number;
  maxRespawn: number;
}

export interface SimCrystalShatter {
  active: boolean;
  victory: boolean;
  x: number;
  y: number;
  timer: number;
  duration: number;
  shardAccum: number;
}

export interface TurretRingCandidate {
  id: string;
  team: 'blue' | 'red';
  x: number;
  y: number;
  range: number;
  targetId: string | null;
  alive: boolean;
}

export interface MinionTankCandidate {
  team: 'blue' | 'red';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  alive: boolean;
}

export function createInitialBrawlShrines(): SimBrawlShrine[] {
  return BRAWL_HEALING_SHRINES.map((s) => ({
    id: s.id,
    side: s.side,
    x: s.x,
    y: s.y,
    active: false,
    respawnTimer: MLBB_TIMERS.BRAWL_SHRINE_FIRST_SPAWN,
    maxRespawn: MLBB_TIMERS.BRAWL_SHRINE_FIRST_SPAWN
  }));
}

export function createWalkieGrassWard(
  id: string,
  team: 'blue' | 'red',
  x: number,
  y: number
): SimWalkieGrass {
  return {
    id,
    team,
    x,
    y,
    originX: x,
    originY: y,
    radius: 460,
    ttl: MLBB_TIMERS.WALKIE_GRASS_DURATION,
    maxTtl: MLBB_TIMERS.WALKIE_GRASS_DURATION,
    phase: 0
  };
}

/**
 * Advances moving Walkie Grass wards along the diagonal river corridor.
 */
export function stepWalkieGrassWards(wards: SimWalkieGrass[], dt: number): SimWalkieGrass[] {
  const next: SimWalkieGrass[] = [];
  for (const w of wards) {
    w.ttl -= dt;
    if (w.ttl <= 0) continue;
    w.phase += dt * 0.72;
    const drift = Math.sin(w.phase) * 260;
    w.x = w.originX + drift;
    w.y = w.originY + drift;
    next.push(w);
  }
  return next;
}

/**
 * Computes Siege Minion early-game Gold Lane (+45% Gold) & EXP Lane (+35% EXP) bonuses (00:00 - 05:00).
 */
export function computeEarlyLaneMinionRewards(
  kind: 'melee' | 'ranged' | 'siege' | 'super' | 'lord_ally' | 'mini_turtle',
  lane: 'top' | 'mid' | 'bot',
  expLane: 'top' | 'bot',
  goldLane: 'top' | 'bot',
  matchTimeSec: number
): { gold: number; exp: number } {
  const baseGold =
    kind === 'super' ? 90 : kind === 'siege' ? 75 : kind === 'melee' ? 45 : kind === 'ranged' ? 40 : 60;
  const baseExp =
    kind === 'super' ? 135 : kind === 'siege' ? 110 : kind === 'melee' ? 75 : kind === 'ranged' ? 70 : 95;

  if (kind === 'siege' && matchTimeSec < MLBB_TIMERS.OUTER_SHIELD_EXPIRE) {
    if (lane === goldLane) {
      return { gold: Math.round(baseGold * 1.45), exp: baseExp };
    }
    if (lane === expLane) {
      return { gold: baseGold, exp: Math.round(baseExp * 1.35) };
    }
  }
  return { gold: baseGold, exp: baseExp };
}

/**
 * Computes Outer Turret Energy Shield (00:00-05:00) 50% damage reduction and +40g plate chunk payouts.
 */
export function computeOuterTurretPlateDamage(
  rawDmg: number,
  isOuterTier1: boolean,
  shieldHp: number,
  plateDamageAccum: number,
  matchTimeSec: number
): {
  finalDamage: number;
  nextShieldHp: number;
  nextPlateAccum: number;
  platesBroken: number;
  plateGoldAward: number;
} {
  const shieldActive = isOuterTier1 && shieldHp > 0 && matchTimeSec < MLBB_TIMERS.OUTER_SHIELD_EXPIRE;
  if (!shieldActive) {
    return {
      finalDamage: Math.max(1, Math.round(rawDmg)),
      nextShieldHp: shieldHp,
      nextPlateAccum: plateDamageAccum,
      platesBroken: 0,
      plateGoldAward: 0
    };
  }

  const mitigated = Math.max(1, Math.round(rawDmg * 0.5));
  const shieldUsed = Math.min(shieldHp, mitigated);
  const nextShieldHp = Math.max(0, shieldHp - shieldUsed);
  const totalAccum = plateDamageAccum + shieldUsed;
  const platesBroken = Math.floor(totalAccum / MLBB_TIMERS.OUTER_PLATE_CHUNK);
  const nextPlateAccum = totalAccum - platesBroken * MLBB_TIMERS.OUTER_PLATE_CHUNK;

  return {
    finalDamage: mitigated,
    nextShieldHp,
    nextPlateAccum,
    platesBroken,
    plateGoldAward: platesBroken * MLBB_TIMERS.OUTER_PLATE_GOLD
  };
}

/**
 * Selects the enemy team's weakest lane (fewest standing turrets, then lowest total turret HP) for Lord march.
 */
export function selectWeakestEnemyLane(
  turrets: readonly { team: 'blue' | 'red'; lane: 'top' | 'mid' | 'bot' | 'crystal'; alive: boolean; hp: number }[],
  enemyTeam: 'blue' | 'red'
): 'top' | 'mid' | 'bot' {
  const lanes: ('top' | 'mid' | 'bot')[] = ['top', 'mid', 'bot'];
  let bestLane: 'top' | 'mid' | 'bot' = 'mid';
  let bestCount = Infinity;
  let bestHp = Infinity;

  for (const lane of lanes) {
    const laneTurrets = turrets.filter((t) => t.team === enemyTeam && t.lane === lane && t.alive);
    const count = laneTurrets.length;
    const totalHp = laneTurrets.reduce((sum, t) => sum + t.hp, 0);
    if (count < bestCount || (count === bestCount && totalHp < bestHp)) {
      bestCount = count;
      bestHp = totalHp;
      bestLane = lane;
    }
  }
  return bestLane;
}

/**
 * Evaluates MLBB 3-state Turret Ring color around an enemy turret:
 * - 'locked' (RED): Turret is actively locked onto the player.
 * - 'safe' (GREEN): At least one healthy allied minion/Lord (>= 35% HP) is tanking inside turret range.
 * - 'warn' (YELLOW): Entering range with no allied minions or only critically low-HP (< 35%) minions.
 */
export function computeTurretRingState(
  turret: TurretRingCandidate,
  playerId: string,
  playerTeam: 'blue' | 'red',
  minions: readonly MinionTankCandidate[]
): 'safe' | 'warn' | 'locked' {
  if (turret.targetId === playerId) return 'locked';
  let bestMinionHpRatio = 0;
  for (const m of minions) {
    if (!m.alive || m.team !== playerTeam) continue;
    if (dist(m.x, m.y, turret.x, turret.y) <= turret.range) {
      const ratio = m.hp / Math.max(1, m.maxHp);
      if (ratio > bestMinionHpRatio) bestMinionHpRatio = ratio;
    }
  }
  if (bestMinionHpRatio >= 0.35) return 'safe';
  return 'warn';
}
