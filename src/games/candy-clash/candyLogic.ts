export type CandySpecial = 'row' | 'col' | 'bomb' | null;

export interface CandyCell {
  type: number;
  special: CandySpecial;
  yOff: number;
  xOff: number;
  pop: number;
}

export interface MatchRun {
  len: number;
  dir: 'h' | 'v';
  cells: Array<{ r: number; c: number }>;
  type: number;
}

export interface MatchResult {
  matched: boolean[][];
  runs: MatchRun[];
}

export function findMatchesOnGrid(grid: Array<Array<CandyCell | null>>): MatchResult {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const matched = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  const runs: MatchRun[] = [];

  for (let r = 0; r < rows; r++) {
    let c = 0;
    while (c < cols) {
      const t = grid[r][c]?.type;
      let end = c + 1;
      while (end < cols && t !== undefined && grid[r][end]?.type === t) end++;
      if (t !== undefined && end - c >= 3) {
        const cells: Array<{ r: number; c: number }> = [];
        for (let k = c; k < end; k++) {
          matched[r][k] = true;
          cells.push({ r, c: k });
        }
        runs.push({ len: end - c, dir: 'h', cells, type: t });
      }
      c = end;
    }
  }

  for (let c = 0; c < cols; c++) {
    let r = 0;
    while (r < rows) {
      const t = grid[r][c]?.type;
      let end = r + 1;
      while (end < rows && t !== undefined && grid[end][c]?.type === t) end++;
      if (t !== undefined && end - r >= 3) {
        const cells: Array<{ r: number; c: number }> = [];
        for (let k = r; k < end; k++) {
          matched[k][c] = true;
          cells.push({ r: k, c });
        }
        runs.push({ len: end - r, dir: 'v', cells, type: t });
      }
      r = end;
    }
  }

  return { matched, runs };
}

export function hasAnyValidCandyMove(grid: Array<Array<CandyCell | null>>): boolean {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = grid[r][c];
      if (!a) continue;
      if (a.special === 'bomb') return true;
      if (c + 1 < cols && grid[r][c + 1]) {
        const b = grid[r][c + 1]!;
        if (b.special === 'bomb') return true;
        grid[r][c] = b;
        grid[r][c + 1] = a;
        const ok = findMatchesOnGrid(grid).runs.length > 0;
        grid[r][c] = a;
        grid[r][c + 1] = b;
        if (ok) return true;
      }
      if (r + 1 < rows && grid[r + 1][c]) {
        const b = grid[r + 1][c]!;
        if (b.special === 'bomb') return true;
        grid[r][c] = b;
        grid[r + 1][c] = a;
        const ok = findMatchesOnGrid(grid).runs.length > 0;
        grid[r][c] = a;
        grid[r + 1][c] = b;
        if (ok) return true;
      }
    }
  }
  return false;
}

export function createInitialCandyGrid(
  rows: number,
  cols: number,
  candyCount: number,
  rng: () => number = Math.random
): CandyCell[][] {
  for (let attempt = 0; attempt < 25; attempt++) {
    const grid: CandyCell[][] = [];
    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        let type = 0;
        let guard = 0;
        do {
          type = Math.floor(rng() * candyCount);
          guard++;
        } while (
          guard < 20 &&
          ((c >= 2 && grid[r][c - 1].type === type && grid[r][c - 2].type === type) ||
            (r >= 2 && grid[r - 1][c].type === type && grid[r - 2][c].type === type))
        );
        grid[r][c] = { type, special: null, yOff: 0, xOff: 0, pop: 1 };
      }
    }
    if (hasAnyValidCandyMove(grid)) return grid;
  }
  return createInitialCandyGridFallback(rows, cols, candyCount);
}

function createInitialCandyGridFallback(rows: number, cols: number, candyCount: number): CandyCell[][] {
  const grid: CandyCell[][] = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      grid[r][c] = { type: (r * 2 + c) % candyCount, special: null, yOff: 0, xOff: 0, pop: 1 };
    }
  }
  if (rows >= 2 && cols >= 4) {
    grid[0][0].type = 0;
    grid[0][1].type = 0;
    grid[0][2].type = 1;
    grid[1][2].type = 0;
  }
  return grid;
}

export function computeSwipeTarget(
  originR: number,
  originC: number,
  dx: number,
  dy: number,
  threshold: number,
  rows: number,
  cols: number
): { r: number; c: number } | null {
  if (Math.hypot(dx, dy) < threshold) return null;
  let tr = originR;
  let tc = originC;
  if (Math.abs(dx) >= Math.abs(dy)) tc += dx > 0 ? 1 : -1;
  else tr += dy > 0 ? 1 : -1;
  if (tr < 0 || tr >= rows || tc < 0 || tc >= cols) return null;
  return { r: tr, c: tc };
}

export function tickCandyTurnTimer(
  turnTimer: number,
  turnDuration: number,
  movesLeft: number,
  dt: number
): { turnTimer: number; movesLeft: number; expired: boolean } {
  const next = turnTimer - dt;
  if (next > 0) {
    return { turnTimer: next, movesLeft, expired: false };
  }
  return {
    turnTimer: turnDuration,
    movesLeft: Math.max(0, movesLeft - 1),
    expired: true
  };
}

