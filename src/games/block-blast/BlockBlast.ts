import { ArcadeAudio } from '../../core/audio';
import { addCoins, addXp, updateInGameHud } from '../../core/runtimeBridge';
import { BaseGame } from '../../core/BaseGame';

interface TrayPiece {
  mat: number[][];
  color: string;
  used: boolean;
}

interface DragState {
  idx: number;
  x: number;
  y: number;
  pointerType: string;
}

export class BlockBlastGame extends BaseGame {
  size = 8;
  board: Array<Array<string | null>> = [];
  palette = ['#38bdf8', '#f472b6', '#facc15', '#4ade80', '#fb923c', '#a78bfa'];
  shapesCatalog: number[][][] = [
    [[1]],
    [[1, 1]],
    [[1], [1]],
    [[1, 1, 1]],
    [[1], [1], [1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 0], [1, 1]],
    [[0, 1], [1, 1]],
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
  ];
  tray: TrayPiece[] = [];
  dragging: DragState | null = null;

  init(): void {
    this.size = 8;
    this.board = Array.from({ length: this.size }, () => new Array<string | null>(this.size).fill(null));
    this.maxLives = 1;
    this.lives = 1;
    this.dragging = null;
    this.refillTray();
  }

  private refillTray(): void {
    this.tray = [];
    for (let i = 0; i < 3; i++) {
      const mat = this.shapesCatalog[Math.floor(Math.random() * this.shapesCatalog.length)];
      const color = this.palette[Math.floor(Math.random() * this.palette.length)];
      this.tray.push({ mat, color, used: false });
    }
    if (!this.hasAnyValidMove()) this.gameOverSequence(false);
  }

  override resize(): void {
    super.resize();
    this.dragging = null;
    if (this.isPaused) this.draw();
  }

  getLayout(): {
    bx: number;
    by: number;
    gridPx: number;
    cell: number;
    slotW: number;
    trayStartX: number;
    trayY: number;
    trayH: number;
  } {
    const isCompactLand = this.width > this.height * 1.35 && this.height < 500;
    const topSafe = isCompactLand ? 44 : this.width < 460 ? 64 : 58;
    const trayH = isCompactLand
      ? Math.max(66, Math.min(86, this.height * 0.22))
      : Math.max(82, Math.min(120, this.height * 0.21));
    const maxGrid = Math.min(this.width - 20, this.height - topSafe - trayH - (isCompactLand ? 16 : 22), 410);
    const cell = maxGrid / this.size;
    const bx = (this.width - maxGrid) / 2;
    const by = topSafe + Math.max(2, (this.height - topSafe - trayH - maxGrid - 12) / 2);
    const slotW = Math.min(130, (this.width - 20) / 3);
    const trayStartX = (this.width - slotW * 3) / 2;
    const trayY = by + maxGrid + (isCompactLand ? 8 : 12);
    return { bx, by, gridPx: maxGrid, cell, slotW, trayStartX, trayY, trayH };
  }

  canPlace(mat: number[][], r0: number, c0: number): boolean {
    for (let r = 0; r < mat.length; r++) {
      for (let c = 0; c < mat[r].length; c++) {
        if (!mat[r][c]) continue;
        const rr = r0 + r;
        const cc = c0 + c;
        if (rr < 0 || rr >= this.size || cc < 0 || cc >= this.size || this.board[rr][cc]) return false;
      }
    }
    return true;
  }

  hasAnyValidMove(): boolean {
    for (const item of this.tray) {
      if (item.used) continue;
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.canPlace(item.mat, r, c)) return true;
        }
      }
    }
    return false;
  }

  onPointerDown(x: number, y: number, pointerType = 'mouse'): void {
    if (this.gameOver || this.isPaused) return;
    const lay = this.getLayout();
    for (let i = 0; i < 3; i++) {
      const item = this.tray[i];
      if (!item || item.used) continue;
      const sx = lay.trayStartX + i * lay.slotW;
      if (x >= sx && x <= sx + lay.slotW && y >= lay.trayY - 6 && y <= lay.trayY + lay.trayH) {
        const lift = pointerType === 'touch' ? 42 : 0;
        this.dragging = { idx: i, x, y: y - lift, pointerType };
        ArcadeAudio.play('click');
        return;
      }
    }
  }

  override releaseInputs(): void {
    this.dragging = null;
  }

  override pause(): void {
    super.pause();
    this.releaseInputs();
  }

  onPointerMove(x: number, y: number, pointerType = 'mouse'): void {
    if (!this.dragging || this.gameOver || this.isPaused) return;
    const lift = this.dragging.pointerType === 'touch' || pointerType === 'touch' ? 42 : 0;
    this.dragging.x = x;
    this.dragging.y = y - lift;
  }

  onPointerUp(): void {
    if (this.gameOver || this.isPaused) {
      this.dragging = null;
      return;
    }
    if (!this.dragging) return;
    const lay = this.getLayout();
    const item = this.tray[this.dragging.idx];
    const mat = item.mat;
    const c0 = Math.round((this.dragging.x - lay.bx) / lay.cell - mat[0].length / 2);
    const r0 = Math.round((this.dragging.y - lay.by) / lay.cell - mat.length / 2);
    if (this.canPlace(mat, r0, c0)) {
      let placedCount = 0;
      for (let r = 0; r < mat.length; r++) {
        for (let c = 0; c < mat[r].length; c++) {
          if (mat[r][c]) {
            this.board[r0 + r][c0 + c] = item.color;
            placedCount++;
          }
        }
      }
      item.used = true;
      this.score += placedCount * 5;
      ArcadeAudio.play('place');

      const fullRows: number[] = [];
      const fullCols: number[] = [];
      for (let r = 0; r < this.size; r++) if (this.board[r].every(Boolean)) fullRows.push(r);
      for (let c = 0; c < this.size; c++) if (this.board.every((row) => row[c])) fullCols.push(c);
      const lines = fullRows.length + fullCols.length;
      if (lines > 0) {
        const toClear: Array<{ r: number; c: number; color: string }> = [];
        const seen = new Set<number>();
        for (const r of fullRows) {
          for (let c = 0; c < this.size; c++) {
            const key = r * this.size + c;
            if (!seen.has(key)) {
              seen.add(key);
              toClear.push({ r, c, color: this.board[r][c] || '#fff' });
            }
          }
        }
        for (const c of fullCols) {
          for (let r = 0; r < this.size; r++) {
            const key = r * this.size + c;
            if (!seen.has(key)) {
              seen.add(key);
              toClear.push({ r, c, color: this.board[r][c] || '#fff' });
            }
          }
        }
        for (const cellInfo of toClear) {
          this.spawnParticles(
            lay.bx + (cellInfo.c + 0.5) * lay.cell,
            lay.by + (cellInfo.r + 0.5) * lay.cell,
            cellInfo.color,
            4,
            150
          );
          this.board[cellInfo.r][cellInfo.c] = null;
        }
        const bonus = lines * lines * 45;
        this.score += bonus;
        addCoins(lines * 2);
        addXp(lines * 10);
        ArcadeAudio.play(lines > 1 ? 'combo' : 'clear');
        this.triggerShake(4 + lines * 2, 0.14);
        this.spawnPopup(
          this.width / 2,
          lay.by + lay.gridPx * 0.45,
          `💥 ${lines}x BLAST! +${bonus}`,
          '#ffd700'
        );
      }
      if (this.score >= this.level * 300) {
        this.level++;
        ArcadeAudio.play('levelup');
      }
      updateInGameHud(this.score, this.level, 9);
      if (this.tray.every((t) => t.used)) this.refillTray();
      else if (!this.hasAnyValidMove()) this.gameOverSequence(false);
    } else {
      ArcadeAudio.play('hurt');
    }
    this.dragging = null;
  }

  update(): void {
    this.survivalElapsed = 0;
  }

  draw(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.width, this.height);
    const lay = this.getLayout();
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(lay.bx - 5, lay.by - 5, lay.gridPx + 10, lay.gridPx + 10, 12);
    ctx.fill();
    ctx.stroke();

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const x = lay.bx + c * lay.cell;
        const y = lay.by + r * lay.cell;
        ctx.fillStyle = this.board[r][c] || '#0b1220';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, lay.cell - 4, lay.cell - 4, 5);
        ctx.fill();
        if (this.board[r][c]) {
          ctx.fillStyle = 'rgba(255,255,255,0.22)';
          ctx.fillRect(x + 5, y + 4, lay.cell - 10, 4);
        }
      }
    }
    if (this.dragging) {
      const item = this.tray[this.dragging.idx];
      const mat = item.mat;
      const c0 = Math.round((this.dragging.x - lay.bx) / lay.cell - mat[0].length / 2);
      const r0 = Math.round((this.dragging.y - lay.by) / lay.cell - mat.length / 2);
      const valid = this.canPlace(mat, r0, c0);
      for (let r = 0; r < mat.length; r++) {
        for (let c = 0; c < mat[r].length; c++) {
          if (!mat[r][c]) continue;
          const rr = r0 + r;
          const cc = c0 + c;
          if (rr >= 0 && rr < this.size && cc >= 0 && cc < this.size) {
            ctx.fillStyle = valid ? 'rgba(132, 250, 176, 0.45)' : 'rgba(239, 68, 68, 0.42)';
            ctx.fillRect(
              lay.bx + cc * lay.cell + 2,
              lay.by + rr * lay.cell + 2,
              lay.cell - 4,
              lay.cell - 4
            );
          }
        }
      }
    }
    for (let i = 0; i < 3; i++) {
      const item = this.tray[i];
      if (!item || item.used) continue;
      const isDrag = this.dragging && this.dragging.idx === i;
      const miniCell = isDrag ? lay.cell * 0.92 : Math.min(20, (lay.slotW - 14) / 4);
      const mat = item.mat;
      const pw = mat[0].length * miniCell;
      const ph = mat.length * miniCell;
      const ox = isDrag
        ? this.dragging!.x - pw / 2
        : lay.trayStartX + i * lay.slotW + (lay.slotW - pw) / 2;
      const oy = isDrag ? this.dragging!.y - ph / 2 : lay.trayY + (lay.trayH - ph) / 2;
      ctx.fillStyle = item.color;
      for (let r = 0; r < mat.length; r++) {
        for (let c = 0; c < mat[r].length; c++) {
          if (mat[r][c]) {
            ctx.beginPath();
            ctx.roundRect(
              ox + c * miniCell + 1.5,
              oy + r * miniCell + 1.5,
              miniCell - 3,
              miniCell - 3,
              4
            );
            ctx.fill();
          }
        }
      }
    }
  }
}
