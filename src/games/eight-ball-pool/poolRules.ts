export type PoolMode = 'vs' | 'solo';

export interface PoolBallLike {
  x: number;
  y: number;
  isCue?: boolean;
  is8?: boolean;
}

export interface PoolPocket {
  x: number;
  y: number;
}

export function resolvePoolWinner(playerScore: number, enemyScore: number): 'player' | 'enemy' | 'draw' {
  if (playerScore > enemyScore) return 'player';
  if (enemyScore > playerScore) return 'enemy';
  return 'draw';
}

export function pickBestPoolShot(
  cue: PoolBallLike,
  balls: PoolBallLike[],
  pockets: PoolPocket[]
): { angle: number; power: number } {
  const colored = balls.filter((b) => !b.isCue && !b.is8);
  const targets = colored.length > 0 ? colored : balls.filter((b) => !b.isCue);
  if (targets.length === 0) return { angle: 0, power: 420 };

  let bestScore = -Infinity;
  let bestAngle = 0;

  for (const t of targets) {
    for (const pk of pockets) {
      const tpDx = pk.x - t.x;
      const tpDy = pk.y - t.y;
      const tpDist = Math.hypot(tpDx, tpDy) || 1;
      const ctDx = t.x - cue.x;
      const ctDy = t.y - cue.y;
      const ctDist = Math.hypot(ctDx, ctDy) || 1;
      const align = (tpDx / tpDist) * (ctDx / ctDist) + (tpDy / tpDist) * (ctDy / ctDist);
      const heuristic = align * 200 - tpDist * 0.22 - ctDist * 0.14;
      if (heuristic > bestScore) {
        bestScore = heuristic;
        // Aim slightly toward the ghost ball spot behind target from pocket
        const aimX = t.x - (tpDx / tpDist) * 14;
        const aimY = t.y - (tpDy / tpDist) * 14;
        bestAngle = Math.atan2(aimY - cue.y, aimX - cue.x);
      }
    }
  }

  return { angle: bestAngle, power: 580 };
}
