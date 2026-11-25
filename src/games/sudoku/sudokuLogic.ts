import { Difficulty } from '../../core/types';

export interface SudokuPuzzleData {
  puzzle: number[][];
  solution: number[][];
  givens: boolean[][];
}

const BASE_SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

export function generateSudokuBoard(diff: Difficulty, level = 1): SudokuPuzzleData {
  // Relabel digits 1..9 randomly, permute band rows & stack cols to keep 100% valid 9x9 Sudoku
  const digits = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const digitMap = new Map<number, number>();
  digits.forEach((d, i) => digitMap.set(i + 1, d));

  const rowOrder = [0, 1, 2]
    .flatMap((b) => shuffleArray([0, 1, 2]).map((r) => b * 3 + r));
  const colOrder = [0, 1, 2]
    .flatMap((s) => shuffleArray([0, 1, 2]).map((c) => s * 3 + c));

  const solution: number[][] = rowOrder.map((r) =>
    colOrder.map((c) => digitMap.get(BASE_SOLUTION[r][c]) || BASE_SOLUTION[r][c])
  );

  const removeCounts: Record<Difficulty, number> = {
    easy: 34,
    medium: 42,
    hard: 50,
    extreme: 56
  };
  const blanks = Math.min(60, (removeCounts[diff] || 36) + Math.min(6, Math.max(0, level - 1) * 2));

  const puzzle = solution.map((row) => [...row]);
  const givens = solution.map((row) => row.map(() => true));

  const positions = shuffleArray(Array.from({ length: 81 }, (_, i) => i));
  for (let k = 0; k < blanks; k++) {
    const pos = positions[k];
    const r = Math.floor(pos / 9);
    const c = pos % 9;
    puzzle[r][c] = 0;
    givens[r][c] = false;
  }

  return { puzzle, solution, givens };
}

export function hasSudokuConflict(board: number[][], row: number, col: number): boolean {
  const val = board[row]?.[col] || 0;
  if (val === 0) return false;

  for (let i = 0; i < 9; i++) {
    if (i !== col && board[row][i] === val) return true;
    if (i !== row && board[i][col] === val) return true;
  }

  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === val) return true;
    }
  }
  return false;
}

export function isSudokuSolved(board: number[][], solution: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r]?.[c] !== solution[r]?.[c]) return false;
    }
  }
  return true;
}
