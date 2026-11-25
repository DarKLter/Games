import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, updateInGameHud } from '../../core/runtimeBridge';
import { BaseGame } from '../../core/BaseGame';
import {
  CandyCell,
  computeSwipeTarget,
  createInitialCandyGrid,
  findMatchesOnGrid,
  hasAnyValidCandyMove,
  MatchRun,
  tickCandyTurnTimer
} from './candyLogic';

export class CandyClashGame extends BaseGame {
  rows = 8;
  cols = 8;
  candies = [
    { icon: '🍓', bg: '#ef4444' },
    { icon: '🍋', bg: '#eab308' },
    { icon: '🍇', bg: '#a855f7' },
    { icon: '🍏', bg: '#22c55e' },
    { icon: '🍊', bg: '#f97316' },
    { icon: '💎', bg: '#38bdf8' }
  ];
  movesLeft = 24;
  turnDuration = 12;
  turnTimer = 12;
  selected: { r: number; c: number } | null = null;
  dragOrigin: { r: number; c: number; x: number; y: number } | null = null;
  combo = 0;
  animLock = 0;
  grid: Array<Array<CandyCell | null>> = [];

  init(): void {
    this.rows = 8;
    this.cols = 8;
    this.movesLeft = Math.max(18, Math.round(28 / Math.sqrt(this.scaler.speedMult)));
    this.turnDuration = this.diff === 'extreme' ? 8 : this.diff === 'hard' ? 10 : 12;
    this.turnTimer = this.turnDuration;
    this.selected = null;
    this.dragOrigin = null;
    this.combo = 0;
    this.animLock = 0;
    this.maxLives = 1;
    this.lives = 1;
    this.grid = createInitialCandyGrid(this.rows, this.cols, this.candies.length);
  }

  override resize(): void {
    super.resize();
    this.dragOrigin = null;
    if (this.isPaused) this.draw();
  }

  getBoardRect(): { x: number; y: number; size: number; cell: number } {
    const isCompactLand = this.width > this.height * 1.35 && this.height < 500;
    const topSafe = isCompactLand ? 52 : this.width < 460 ? 74 : 66;
    const bottomSafe = isCompactLand ? 34 : 54;
    const availW = this.width - 18;
    const availH = Math.max(120, this.height - topSafe - bottomSafe);
    const size = Math.min(availW, availH, 460);
    const cell = size / this.cols;
    return { x: (this.width - size) / 2, y: topSafe + (availH - size) / 2, size, cell };
  }

  cellAt(x: number, y: number): { r: number; c: number } | null {
    const b = this.getBoardRect();
    const c = Math.floor((x - b.x) / b.cell);
    const r = Math.floor((y - b.y) / b.cell);
    return r >= 0 && r < this.rows && c >= 0 && c < this.cols ? { r, c } : null;
  }

  onPointerDown(x: number, y: number): void {
    if (this.gameOver || this.isPaused || this.animLock > 0) return;
    const hit = this.cellAt(x, y);
    if (!hit) {
      this.selected = null;
      this.dragOrigin = null;
      return;
    }
    this.dragOrigin = { r: hit.r, c: hit.c, x, y };
    if (this.selected) {
      const dr = Math.abs(this.selected.r - hit.r);
      const dc = Math.abs(this.selected.c - hit.c);
      if (dr + dc === 1) {
        this.trySwap(this.selected.r, this.selected.c, hit.r, hit.c);
        this.selected = null;
        this.dragOrigin = null;
        return;
      }
    }
    this.selected = hit;
    ArcadeAudio.play('click');
  }

  private tryHandleSwipe(x: number, y: number, allowAdjacentCell = false): boolean {
    if (!this.dragOrigin || this.gameOver || this.isPaused || this.animLock > 0) return false;
    const br = this.getBoardRect();
    const threshold = Math.max(12, br.cell * 0.34);
    const dx = x - this.dragOrigin.x;
    const dy = y - this.dragOrigin.y;
    let target = computeSwipeTarget(this.dragOrigin.r, this.dragOrigin.c, dx, dy, threshold, this.rows, this.cols);
    if (!target && allowAdjacentCell) {
      const hover = this.cellAt(x, y);
      if (
        hover &&
        Math.abs(hover.r - this.dragOrigin.r) + Math.abs(hover.c - this.dragOrigin.c) === 1
      ) {
        target = hover;
      }
    }
    if (!target) return false;
    this.trySwap(this.dragOrigin.r, this.dragOrigin.c, target.r, target.c);
    this.dragOrigin = null;
    this.selected = null;
    return true;
  }

  onPointerMove(x: number, y: number): void {
    this.tryHandleSwipe(x, y, false);
  }

  override releaseInputs(): void {
    this.dragOrigin = null;
  }

  override pause(): void {
    super.pause();
    this.releaseInputs();
  }

  onPointerUp(x?: number, y?: number): void {
    if (this.gameOver || this.isPaused) {
      this.dragOrigin = null;
      return;
    }
    if (typeof x === 'number' && typeof y === 'number') {
      this.tryHandleSwipe(x, y, true);
    }
    this.dragOrigin = null;
  }

  trySwap(r1: number, c1: number, r2: number, c2: number): void {
    const a = this.grid[r1]?.[c1];
    const b = this.grid[r2]?.[c2];
    if (!a || !b) return;
    this.grid[r1][c1] = b;
    this.grid[r2][c2] = a;
    const hasBomb = a.special === 'bomb' || b.special === 'bomb';
    const { matched, runs } = findMatchesOnGrid(this.grid);
    if (!hasBomb && runs.length === 0) {
      this.grid[r1][c1] = a;
      this.grid[r2][c2] = b;
      a.xOff = (c2 - c1) * 14;
      b.xOff = (c1 - c2) * 14;
      a.yOff = (r2 - r1) * 14;
      b.yOff = (r1 - r2) * 14;
      ArcadeAudio.play('hurt');
      return;
    }
    this.movesLeft--;
    this.turnTimer = this.turnDuration;
    this.combo = 0;
    if (hasBomb) {
      const targetType = a.special === 'bomb' ? b.type : a.type;
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const cell = this.grid[r][c];
          if (cell && (cell.type === targetType || cell.special === 'bomb')) matched[r][c] = true;
        }
      }
    }
    this.resolveMatches(matched, runs, { r: r2, c: c2 });
  }

  private resolveMatches(
    matched: boolean[][],
    runs: MatchRun[],
    focusCell: { r: number; c: number } | null = null
  ): void {
    const br = this.getBoardRect();
    let cleared = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const sp = this.grid[r][c]?.special;
        if (matched[r][c] && sp === 'row') {
          for (let k = 0; k < this.cols; k++) matched[r][k] = true;
        } else if (matched[r][c] && sp === 'col') {
          for (let k = 0; k < this.rows; k++) matched[k][c] = true;
        }
      }
    }
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r][c];
        if (matched[r][c] && cell) {
          const cellInfo = this.candies[cell.type];
          this.spawnParticles(
            br.x + (c + 0.5) * br.cell,
            br.y + (r + 0.5) * br.cell,
            cellInfo.bg,
            5,
            130
          );
          this.grid[r][c] = null;
          cleared++;
        }
      }
    }
    for (const run of runs) {
      const spot =
        focusCell && run.cells.some((p) => p.r === focusCell.r && p.c === focusCell.c)
          ? focusCell
          : run.cells[1];
      if (run.len >= 5 && this.grid[spot.r][spot.c] === null) {
        this.grid[spot.r][spot.c] = { type: run.type, special: 'bomb', yOff: 0, xOff: 0, pop: 1.4 };
      } else if (run.len === 4 && this.grid[spot.r][spot.c] === null) {
        this.grid[spot.r][spot.c] = {
          type: run.type,
          special: run.dir === 'h' ? 'col' : 'row',
          yOff: 0,
          xOff: 0,
          pop: 1.3
        };
      }
    }
    this.combo++;
    const pts = cleared * 12 * this.combo;
    this.score += pts;
    if (cleared >= 5 || this.combo >= 2) {
      const cAdd = Math.min(5, Math.floor(cleared / 3) + this.combo - 1);
      addCoins(cAdd);
      ArcadeAudio.play('combo');
      this.spawnPopup(br.x + br.size / 2, br.y + br.size * 0.45, `✨ x${this.combo} COMBO +${pts}`, '#ffd700');
    } else {
      ArcadeAudio.play('match');
    }
    addXp(Math.max(3, cleared));
    if (this.score >= this.level * 500) {
      this.level++;
      this.movesLeft += 5;
      ArcadeAudio.play('levelup');
      this.spawnPopup(this.width / 2, br.y - 10, '⬆️ LEVEL UP! +5 MOVES', '#84fab0');
    }
    updateInGameHud(this.score, this.level, 8);
    for (let c = 0; c < this.cols; c++) {
      let writeR = this.rows - 1;
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.grid[r][c]) {
          if (writeR !== r) {
            this.grid[writeR][c] = this.grid[r][c];
            this.grid[writeR][c]!.yOff = -(writeR - r) * br.cell;
            this.grid[r][c] = null;
          }
          writeR--;
        }
      }
      while (writeR >= 0) {
        this.grid[writeR][c] = {
          type: Math.floor(Math.random() * this.candies.length),
          special: null,
          yOff: -br.cell * (writeR + 1.5),
          xOff: 0,
          pop: 1
        };
        writeR--;
      }
    }
    this.animLock = 0.24;
  }

  update(dt: number): void {
    if (this.gameOver) return;
    this.survivalElapsed = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r][c];
        if (!cell) continue;
        cell.xOff *= Math.exp(-14 * dt);
        cell.yOff *= Math.exp(-12 * dt);
        cell.pop += (1 - cell.pop) * (1 - Math.exp(-10 * dt));
      }
    }
    if (this.animLock > 0) {
      this.animLock -= dt;
      if (this.animLock <= 0) {
        const { matched, runs } = findMatchesOnGrid(this.grid);
        if (runs.length > 0) {
          this.resolveMatches(matched, runs);
        } else if (this.movesLeft <= 0) {
          this.gameOverSequence(this.score >= 800);
        } else if (!hasAnyValidCandyMove(this.grid)) {
          this.grid = createInitialCandyGrid(this.rows, this.cols, this.candies.length);
          this.spawnPopup(this.width / 2, this.height * 0.5, '🔀 SHUFFLE!', '#8fd3f4');
        }
      }
    } else {
      const tick = tickCandyTurnTimer(this.turnTimer, this.turnDuration, this.movesLeft, dt);
      this.turnTimer = tick.turnTimer;
      if (tick.expired) {
        this.movesLeft = tick.movesLeft;
        this.selected = null;
        this.dragOrigin = null;
        ArcadeAudio.play('hurt');
        this.triggerShake(5, 0.14);
        this.spawnPopup(this.width / 2, this.height * 0.36, '⏱️ TIME UP! -1 MOVE', '#ef4444');
        if (this.movesLeft <= 0) {
          this.gameOverSequence(this.score >= 800);
        }
      }
    }
  }

  draw(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#1b112c';
    ctx.fillRect(0, 0, this.width, this.height);
    const br = this.getBoardRect();
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeStyle = 'rgba(232, 121, 249, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(br.x - 6, br.y - 6, br.size + 12, br.size + 12, 14);
    ctx.fill();
    ctx.stroke();

    // Per-turn countdown progress bar above board
    const pct = Math.max(0, Math.min(1, this.turnTimer / this.turnDuration));
    const isCompactLand = this.width > this.height * 1.35 && this.height < 500;
    const timerBarY = Math.max(isCompactLand ? 34 : 46, br.y - 20);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(br.x, timerBarY, br.size, 8, 4);
    ctx.fill();
    ctx.fillStyle = this.turnTimer <= 3 ? '#ef4444' : '#facc15';
    ctx.beginPath();
    ctx.roundRect(br.x, timerBarY, br.size * pct, 8, 4);
    ctx.fill();

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cx = br.x + c * br.cell;
        const cy = br.y + r * br.cell;
        ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.2)';
        ctx.fillRect(cx + 1, cy + 1, br.cell - 2, br.cell - 2);
        const item = this.grid[r][c];
        if (!item) continue;
        const px = cx + br.cell / 2 + item.xOff;
        const py = cy + br.cell / 2 + item.yOff;
        const candy = this.candies[item.type];
        const rad = br.cell * 0.41 * item.pop;
        ctx.fillStyle = item.special === 'bomb' ? '#111827' : candy.bg;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
        if (item.special === 'row' || item.special === 'col') {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          if (item.special === 'row') {
            ctx.moveTo(px - rad * 0.8, py);
            ctx.lineTo(px + rad * 0.8, py);
          } else {
            ctx.moveTo(px, py - rad * 0.8);
            ctx.lineTo(px, py + rad * 0.8);
          }
          ctx.stroke();
        }
        EmojiCache.draw(
          ctx,
          item.special === 'bomb' ? '🌈' : candy.icon,
          px,
          py,
          Math.round(br.cell * 0.6)
        );
        if (this.selected && this.selected.r === r && this.selected.c === c) {
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 3;
          ctx.strokeRect(cx + 2, cy + 2, br.cell - 4, br.cell - 4);
        }
      }
    }
    ctx.font = '800 12.5px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.turnTimer <= 3 ? '#f87171' : '#ffd700';
    ctx.fillText(
      `⏱️ ${Math.ceil(this.turnTimer)}s  ·  🎯 Moves: ${this.movesLeft}  ·  Goal: ${this.level * 500}`,
      this.width / 2,
      Math.min(this.height - 14, br.y + br.size + 26)
    );
    ctx.textAlign = 'left';
  }
}
