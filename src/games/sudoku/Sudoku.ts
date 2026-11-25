import { ArcadeAudio } from '../../core/audio';
import { addCoins, addXp, spendCoins, triggerGameOver, updateHealthDisplay, updateInGameHud } from '../../core/runtimeBridge';
import { playerState } from '../../core/storage';
import { Difficulty, GameInstance } from '../../core/types';
import { generateSudokuBoard, hasSudokuConflict, isSudokuSolved } from './sudokuLogic';

export class Sudoku implements GameInstance {
  level: number;
  diff: Difficulty;
  score = 0;
  lives = 3;
  maxLives = 3;
  isPaused = false;
  gameOver = false;
  mistakes = 0;
  notesMode = false;
  selected = { r: 0, c: 0 };
  board: number[][] = [];
  solution: number[][] = [];
  givens: boolean[][] = [];
  notes: Set<number>[][] = [];
  private boardTimer: ReturnType<typeof setTimeout> | null = null;
  private boardSolvedLock = false;

  constructor(lvl: number, diff: Difficulty) {
    this.level = lvl;
    this.diff = diff;
  }

  start(): void {
    playerState.sessionCoins = 0;
    playerState.sessionExp = 0;
    this.mistakes = 0;
    this.lives = 3;
    this.maxLives = 3;
    this.notesMode = false;
    document.getElementById('sdkNotesBtn')?.classList.remove('active');
    document.getElementById('sudokuUI')?.classList.add('show');
    updateInGameHud(this.score, this.level, 21);
    updateHealthDisplay(this.lives, this.maxLives);
    this.buildNumpad();
    this.bindTools();
    this.newBoard(true);
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  stop(): void {
    this.gameOver = true;
    this.notesMode = false;
    document.getElementById('sdkNotesBtn')?.classList.remove('active');
    if (this.boardTimer) {
      clearTimeout(this.boardTimer);
      this.boardTimer = null;
    }
    for (const id of ['sdkNotesBtn', 'sdkEraseBtn', 'sdkHintBtn', 'sdkNewBtn']) {
      const el = document.getElementById(id);
      if (el) el.onclick = null;
    }
    document.getElementById('sudokuUI')?.classList.remove('show');
  }

  newBoard(resetLives = true): void {
    if (this.boardTimer) {
      clearTimeout(this.boardTimer);
      this.boardTimer = null;
    }
    this.boardSolvedLock = false;
    const data = generateSudokuBoard(this.diff, this.level);
    this.board = data.puzzle;
    this.solution = data.solution;
    this.givens = data.givens;
    this.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()));
    if (resetLives) {
      this.mistakes = 0;
      this.lives = 3;
    }
    updateHealthDisplay(this.lives, this.maxLives);
    // Pick first empty square as default selection
    outer: for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!this.givens[r][c]) {
          this.selected = { r, c };
          break outer;
        }
      }
    }
    this.render();
  }

  private bindTools(): void {
    const notesBtn = document.getElementById('sdkNotesBtn');
    if (notesBtn) {
      notesBtn.onclick = () => {
        if (this.gameOver || this.isPaused) return;
        this.notesMode = !this.notesMode;
        notesBtn.classList.toggle('active', this.notesMode);
        ArcadeAudio.play('click');
      };
    }
    const eraseBtn = document.getElementById('sdkEraseBtn');
    if (eraseBtn) {
      eraseBtn.onclick = () => this.handleKey('Backspace');
    }
    const hintBtn = document.getElementById('sdkHintBtn');
    if (hintBtn) {
      hintBtn.onclick = () => this.useHint();
    }
    const newBtn = document.getElementById('sdkNewBtn');
    if (newBtn) {
      newBtn.onclick = () => {
        if (this.gameOver || this.isPaused) return;
        ArcadeAudio.play('click');
        this.newBoard(false);
      };
    }
  }

  private buildNumpad(): void {
    const pad = document.getElementById('sdkNumpad');
    if (!pad) return;
    pad.innerHTML = '';
    for (let n = 1; n <= 9; n++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sdk-num-btn';
      btn.textContent = String(n);
      btn.onclick = () => this.handleKey(String(n));
      pad.appendChild(btn);
    }
  }

  useHint(): void {
    if (this.gameOver || this.isPaused) return;
    const { r, c } = this.selected;
    if (this.givens[r]?.[c] || this.board[r]?.[c] === this.solution[r]?.[c]) {
      // Find first unsolved cell automatically
      let found: { r: number; c: number } | null = null;
      for (let rr = 0; rr < 9 && !found; rr++) {
        for (let cc = 0; cc < 9 && !found; cc++) {
          if (this.board[rr][cc] !== this.solution[rr][cc]) found = { r: rr, c: cc };
        }
      }
      if (!found) return;
      this.selected = found;
    }
    if (!spendCoins(5)) {
      ArcadeAudio.play('hurt');
      return;
    }
    const tr = this.selected.r;
    const tc = this.selected.c;
    this.board[tr][tc] = this.solution[tr][tc];
    this.notes[tr][tc].clear();
    ArcadeAudio.play('sudokuOk');
    this.checkWin();
    this.render();
  }

  handleKey(key: string): void {
    if (this.gameOver || this.isPaused) return;
    const { r, c } = this.selected;
    if (key === 'ArrowUp') { this.selected.r = (r + 8) % 9; this.render(); return; }
    if (key === 'ArrowDown') { this.selected.r = (r + 1) % 9; this.render(); return; }
    if (key === 'ArrowLeft') { this.selected.c = (c + 8) % 9; this.render(); return; }
    if (key === 'ArrowRight') { this.selected.c = (c + 1) % 9; this.render(); return; }

    if (this.givens[r]?.[c]) return;

    if (key === 'Backspace' || key === 'Delete' || key === '0') {
      this.board[r][c] = 0;
      this.notes[r][c].clear();
      ArcadeAudio.play('click');
      this.render();
      return;
    }

    const num = parseInt(key, 10);
    if (Number.isNaN(num) || num < 1 || num > 9) return;

    if (this.notesMode) {
      if (this.notes[r][c].has(num)) this.notes[r][c].delete(num);
      else this.notes[r][c].add(num);
      ArcadeAudio.play('key');
      this.render();
      return;
    }

    this.board[r][c] = num;
    this.notes[r][c].clear();

    if (num === this.solution[r][c]) {
      this.score += 20;
      addCoins(1);
      addXp(4);
      ArcadeAudio.play('sudokuOk');
      updateInGameHud(this.score, this.level, 21);
      this.checkWin();
    } else {
      this.mistakes++;
      this.lives = Math.max(0, 3 - this.mistakes);
      ArcadeAudio.play('hurt');
      updateHealthDisplay(this.lives, this.maxLives);
      if (this.mistakes >= 3) {
        this.gameOver = true;
        triggerGameOver(this.score, playerState.sessionCoins, this.level, 21, false);
        return;
      }
    }
    this.render();
  }

  private checkWin(): void {
    if (this.boardSolvedLock || this.gameOver) return;
    if (isSudokuSolved(this.board, this.solution)) {
      this.boardSolvedLock = true;
      this.score += 250;
      this.level++;
      addCoins(20);
      addXp(40);
      ArcadeAudio.play('win');
      updateInGameHud(this.score, this.level, 21);
      this.boardTimer = setTimeout(() => {
        this.boardTimer = null;
        if (!this.gameOver) this.newBoard();
      }, 900);
    }
  }

  render(): void {
    const gridEl = document.getElementById('sdkGrid');
    const titleEl = document.getElementById('sdkTitle');
    const mistEl = document.getElementById('sdkMistakes');
    if (titleEl) titleEl.textContent = `🔢 Sudoku · Lvl ${this.level} (${this.diff.toUpperCase()})`;
    if (mistEl) mistEl.textContent = `Mistakes: ${this.mistakes}/3`;
    if (!gridEl) return;

    gridEl.innerHTML = '';
    const selVal = this.board[this.selected.r]?.[this.selected.c] || 0;
    const selBoxR = Math.floor(this.selected.r / 3);
    const selBoxC = Math.floor(this.selected.c / 3);

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = this.board[r][c];
        const cell = document.createElement('div');
        let cls = 'sdk-cell';
        if (c === 2 || c === 5) cls += ' box-right';
        if (r === 2 || r === 5) cls += ' box-bottom';
        if (this.givens[r][c]) cls += ' given';
        const isSelected = r === this.selected.r && c === this.selected.c;
        const isPeer =
          r === this.selected.r ||
          c === this.selected.c ||
          (Math.floor(r / 3) === selBoxR && Math.floor(c / 3) === selBoxC);
        if (isPeer && !isSelected) cls += ' peer';
        if (selVal > 0 && val === selVal && !isSelected) cls += ' same-num';
        if (isSelected) cls += ' selected';
        if (val > 0 && !this.givens[r][c] && (val !== this.solution[r][c] || hasSudokuConflict(this.board, r, c))) {
          cls += ' conflict';
        }
        cell.className = cls;

        if (val > 0) {
          cell.textContent = String(val);
        } else if (this.notes[r][c].size > 0) {
          const notesWrap = document.createElement('div');
          notesWrap.className = 'sdk-notes';
          for (let d = 1; d <= 9; d++) {
            const sp = document.createElement('span');
            sp.textContent = this.notes[r][c].has(d) ? String(d) : '';
            notesWrap.appendChild(sp);
          }
          cell.appendChild(notesWrap);
        }

        cell.onclick = () => {
          if (this.gameOver || this.isPaused) return;
          this.selected = { r, c };
          ArcadeAudio.play('click');
          this.render();
        };
        gridEl.appendChild(cell);
      }
    }
  }
}
