import { ArcadeAudio } from '../../core/audio';
import { addCoins, addXp, spendCoins, updateInGameHud } from '../../core/runtimeBridge';
import { playerState } from '../../core/storage';
import { Difficulty, GameInstance } from '../../core/types';

export interface CrosswordPack {
  title: string;
  grid: string[];
  clues: {
    A: Record<string, string>;
    D: Record<string, string>;
  };
}

export const CROSSWORD_PACKS: CrosswordPack[] = [
  {
    title: '🌿 Garden & Nature',
    grid: ['.P.....', 'FLOWER.', '.A.A...', '.NATURE', '.T.E..A', '..TREES', '......T'],
    clues: {
      A: {
        '1,0': 'Colorful blossom in a garden',
        '3,1': 'The outdoors, trees, and wildlife',
        '5,2': 'Tall woody garden plants'
      },
      D: {
        '0,1': 'Grow one in soil or a pot',
        '1,3': 'Essential liquid for plants',
        '3,6': 'Sunrise compass direction'
      }
    }
  },
  {
    title: '🎮 Arcade & Tech',
    grid: ['CODE...', 'O.A.B.H', 'INTRO.E', 'N.A.N.R', '...AUTO', '....S..'],
    clues: {
      A: {
        '0,0': 'Instructions written for a computer',
        '2,0': 'Opening sequence of a game',
        '4,3': 'Automatic mode or car prefix'
      },
      D: {
        '0,0': 'Golden arcade currency',
        '0,2': 'Stored facts or numbers',
        '1,4': 'Extra reward points',
        '1,6': 'Main playable champion'
      }
    }
  },
  {
    title: '🚀 Space & Science',
    grid: ['.SATURN', '.O.I..O', 'PLUTO.V', '.A.A..A', 'IRON...'],
    clues: {
      A: {
        '0,1': 'Ringed gas giant planet',
        '2,0': 'Famous icy dwarf planet',
        '4,0': 'Dense metallic element in planetary cores'
      },
      D: {
        '0,1': 'Relating to the Sun and its system',
        '0,3': 'Largest moon orbiting Saturn',
        '0,6': 'Sudden bright star explosion'
      }
    }
  },
  {
    title: '🌊 Ocean & Coast',
    grid: ['.CORAL.', '.R.E...', 'WAVE...', '.B.FISH', '.....E.', '..TIDAL'],
    clues: {
      A: {
        '0,1': 'Colorful underwater reef builder',
        '2,0': 'Cresting ocean swell',
        '3,3': 'Gilled swimmers in the sea',
        '5,2': 'Driven by rising and falling ocean levels'
      },
      D: {
        '0,1': 'Sideways-walking clawed crustacean',
        '0,3': 'Shallow underwater ridge of rock or coral',
        '3,5': 'Vast body of salt water'
      }
    }
  },
  {
    title: '🍕 Kitchen & Feast',
    grid: ['BREAD..', 'A..P...', 'C..P...', 'O..LIME', 'N..E..G', '....FIG'],
    clues: {
      A: {
        '0,0': 'Baked loaf sliced for sandwiches',
        '3,3': 'Tart green citrus fruit',
        '5,4': 'Sweet purple fruit baked in tarts'
      },
      D: {
        '0,0': 'Crispy breakfast strips',
        '0,3': 'Crisp orchard fruit',
        '3,6': 'Shell-covered breakfast staple'
      }
    }
  },
  {
    title: '🎵 Music & Rhythm',
    grid: ['MUSIC..', '..O.U..', '.BLUES.', '..O..O.', '...BAND', '.....G.'],
    clues: {
      A: {
        '0,0': 'Organized melody, harmony, and rhythm',
        '2,1': 'Soulful twelve-bar jazz genre',
        '4,3': 'Group of musicians playing together'
      },
      D: {
        '0,2': 'Performance by a single musician',
        '0,4': 'Stage signal to start playing',
        '2,5': 'Short musical piece with lyrics'
      }
    }
  }
];

export class Crossword implements GameInstance {
  level: number;
  diff: Difficulty;
  score = 0;
  lives = 1;
  maxLives = 1;
  isPaused = false;
  gameOver = false;
  packs: CrosswordPack[] = CROSSWORD_PACKS;
  packIdx = 0;
  dir: 'A' | 'D' = 'A';
  sel = { r: 1, c: 0 };
  rows = 0;
  cols = 0;
  userGrid: (string | null)[][] = [];
  solvedWords = new Set<string>();
  cellNums: Record<string, number> = {};
  private packTimer: ReturnType<typeof setTimeout> | null = null;
  private advancingPack = false;

  constructor(lvl: number, diff: Difficulty) {
    this.level = lvl;
    this.diff = diff;
  }

  start(): void {
    playerState.sessionCoins = 0;
    playerState.sessionExp = 0;
    document.getElementById('crosswordUI')?.classList.add('show');
    updateInGameHud(this.score, this.level, 20);
    this.buildKeyboard();
    this.loadPack(0);
    const dirBtn = document.getElementById('cwDirBtn');
    if (dirBtn) {
      dirBtn.onclick = () => {
        if (this.gameOver || this.isPaused) return;
        this.dir = this.dir === 'A' ? 'D' : 'A';
        ArcadeAudio.play('click');
        this.renderGrid();
      };
    }
    const hintBtn = document.getElementById('cwHintBtn');
    if (hintBtn) {
      hintBtn.onclick = () => this.useHint();
    }
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  stop(): void {
    this.gameOver = true;
    if (this.packTimer) {
      clearTimeout(this.packTimer);
      this.packTimer = null;
    }
    const dirBtn = document.getElementById('cwDirBtn');
    if (dirBtn) dirBtn.onclick = null;
    const hintBtn = document.getElementById('cwHintBtn');
    if (hintBtn) hintBtn.onclick = null;
    const kb = document.getElementById('cwKeyboard');
    if (kb) kb.innerHTML = '';
    document.getElementById('crosswordUI')?.classList.remove('show');
  }

  buildKeyboard(): void {
    const kb = document.getElementById('cwKeyboard');
    if (!kb) return;
    kb.innerHTML = '';
    ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].forEach((rowStr, rIdx) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'cw-kbd-row';
      for (const ch of rowStr) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'cw-key';
        b.textContent = ch;
        b.onclick = () => this.handleKey(ch);
        rowDiv.appendChild(b);
      }
      if (rIdx === 2) {
        const bk = document.createElement('button');
        bk.type = 'button';
        bk.className = 'cw-key wide';
        bk.textContent = '⌫';
        bk.onclick = () => this.handleKey('Backspace');
        rowDiv.appendChild(bk);
      }
      kb.appendChild(rowDiv);
    });
  }

  loadPack(idx: number): void {
    this.advancingPack = false;
    this.packIdx = idx % this.packs.length;
    const pk = this.packs[this.packIdx];
    this.rows = pk.grid.length;
    this.cols = pk.grid[0].length;
    this.userGrid = pk.grid.map((r) => r.split('').map((ch) => (ch === '.' ? null : '')));
    this.solvedWords.clear();
    this.cellNums = {};
    let nextNum = 1;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (pk.clues.A[`${r},${c}`] || pk.clues.D[`${r},${c}`]) {
          this.cellNums[`${r},${c}`] = nextNum++;
        }
      }
    }
    const firstKey = Object.keys(pk.clues.A)[0].split(',').map(Number);
    this.sel = { r: firstKey[0], c: firstKey[1] };
    this.dir = 'A';
    const titleEl = document.getElementById('cwPackTitle');
    if (titleEl) titleEl.textContent = pk.title;
    this.renderGrid();
  }

  getWordBounds(r: number, c: number, dir: 'A' | 'D'): Array<{ r: number; c: number }> {
    const g = this.packs[this.packIdx].grid;
    if (g[r]?.[c] === '.' || g[r]?.[c] === undefined) return [];
    const cells: Array<{ r: number; c: number }> = [];
    if (dir === 'A') {
      let sc = c;
      while (sc > 0 && g[r][sc - 1] !== '.') sc--;
      while (sc < this.cols && g[r][sc] !== '.') {
        cells.push({ r, c: sc });
        sc++;
      }
    } else {
      let sr = r;
      while (sr > 0 && g[sr - 1][c] !== '.') sr--;
      while (sr < this.rows && g[sr][c] !== '.') {
        cells.push({ r: sr, c });
        sr++;
      }
    }
    return cells;
  }

  renderGrid(): void {
    const pk = this.packs[this.packIdx];
    const gridEl = document.getElementById('cwGrid');
    if (!gridEl) return;
    gridEl.style.gridTemplateColumns = `repeat(${this.cols}, auto)`;
    gridEl.innerHTML = '';
    const wordCells = this.getWordBounds(this.sel.r, this.sel.c, this.dir);
    let filled = 0;
    let total = 0;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const target = pk.grid[r][c];
        const div = document.createElement('div');
        if (target === '.') {
          div.className = 'cw-cell block';
          gridEl.appendChild(div);
          continue;
        }
        total++;
        const val = this.userGrid[r][c] || '';
        if (val === target) filled++;
        const inW = wordCells.some((p) => p.r === r && p.c === c);
        const isAct = this.sel.r === r && this.sel.c === c;
        div.className =
          'cw-cell' +
          (inW ? ' in-word' : '') +
          (isAct ? ' active' : '') +
          (val ? (val === target ? ' correct' : ' wrong') : '');
        div.textContent = val;
        const cellNum = this.cellNums[`${r},${c}`];
        if (cellNum) {
          const n = document.createElement('span');
          n.className = 'cw-num';
          n.textContent = String(cellNum);
          div.appendChild(n);
        }
        div.onclick = () => {
          if (this.gameOver || this.isPaused) return;
          if (this.sel.r === r && this.sel.c === c) this.dir = this.dir === 'A' ? 'D' : 'A';
          this.sel = { r, c };
          ArcadeAudio.play('click');
          this.renderGrid();
        };
        gridEl.appendChild(div);
      }
    }

    const dirBtn = document.getElementById('cwDirBtn');
    if (dirBtn) dirBtn.textContent = this.dir === 'A' ? '↔ ACROSS' : '↕ DOWN';
    const progEl = document.getElementById('cwProgress');
    if (progEl) progEl.textContent = `${filled} / ${total} Letters`;

    let clueText = 'Tap any word cell to type!';
    if (wordCells.length >= 2) {
      const key = `${wordCells[0].r},${wordCells[0].c}`;
      const numPrefix = this.cellNums[key] ? `${this.cellNums[key]}${this.dir}: ` : '';
      const desc =
        pk.clues[this.dir][key] ||
        pk.clues[this.dir === 'A' ? 'D' : 'A'][key] ||
        `${wordCells.length}-letter word`;
      clueText = `${numPrefix}${desc}`;
    }
    const clueEl = document.getElementById('cwActiveClue');
    if (clueEl) clueEl.textContent = clueText;

    if (filled === total && total > 0 && !this.gameOver && !this.advancingPack) {
      this.advancingPack = true;
      this.score += 150;
      addCoins(15);
      this.level++;
      ArcadeAudio.play('win');
      addXp(30);
      updateInGameHud(this.score, this.level, 20);
      this.packTimer = setTimeout(() => {
        this.packTimer = null;
        if (!this.gameOver) this.loadPack(this.packIdx + 1);
      }, 700);
    }
  }

  useHint(): void {
    if (this.gameOver || this.isPaused) return;
    const target = this.packs[this.packIdx].grid[this.sel.r]?.[this.sel.c];
    if (!target || target === '.' || !spendCoins(5)) {
      ArcadeAudio.play('hurt');
      return;
    }
    this.handleKey(target, true);
  }

  handleKey(key: string, free = false): void {
    if (this.gameOver || this.isPaused) return;
    const pk = this.packs[this.packIdx];
    if (key.startsWith('Arrow')) {
      const dr = key === 'ArrowDown' ? 1 : key === 'ArrowUp' ? -1 : 0;
      const dc = key === 'ArrowRight' ? 1 : key === 'ArrowLeft' ? -1 : 0;
      let nr = this.sel.r + dr;
      let nc = this.sel.c + dc;
      while (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
        if (pk.grid[nr]?.[nc] !== '.') {
          this.sel = { r: nr, c: nc };
          ArcadeAudio.play('click');
          this.renderGrid();
          return;
        }
        nr += dr;
        nc += dc;
      }
      return;
    }
    if (key === 'Backspace') {
      this.userGrid[this.sel.r][this.sel.c] = '';
      const w = this.getWordBounds(this.sel.r, this.sel.c, this.dir);
      const idx = w.findIndex((p) => p.r === this.sel.r && p.c === this.sel.c);
      if (idx > 0) this.sel = { ...w[idx - 1] };
      ArcadeAudio.play('click');
      this.renderGrid();
      return;
    }
    const ch = key.toUpperCase();
    if (!/^[A-Z]$/.test(ch)) return;
    if (pk.grid[this.sel.r]?.[this.sel.c] === '.') return;

    this.userGrid[this.sel.r][this.sel.c] = ch;
    if (ch === pk.grid[this.sel.r][this.sel.c]) {
      if (!free) {
        this.score += 10;
        updateInGameHud(this.score, this.level, 20);
      }
      ArcadeAudio.play('key');
    } else {
      ArcadeAudio.play('hurt');
    }

    const w = this.getWordBounds(this.sel.r, this.sel.c, this.dir);
    if (w.length >= 2 && w.every((p) => this.userGrid[p.r][p.c] === pk.grid[p.r][p.c])) {
      const wk = `${this.dir}_${w[0].r}_${w[0].c}`;
      if (!this.solvedWords.has(wk)) {
        this.solvedWords.add(wk);
        this.score += 40;
        addCoins(2);
        ArcadeAudio.play('wordSolved');
        updateInGameHud(this.score, this.level, 20);
      }
    }

    const idx = w.findIndex((p) => p.r === this.sel.r && p.c === this.sel.c);
    if (idx >= 0 && idx + 1 < w.length) this.sel = { ...w[idx + 1] };
    this.renderGrid();
  }
}
