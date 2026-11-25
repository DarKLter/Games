export interface ChessSquarePiece {
  type: string;
  color: 'w' | 'b';
}

export interface ChessMoveVerbose {
  from: string;
  to: string;
  captured?: string;
  promotion?: string;
  san?: string;
}

export interface ChessBoardLike {
  reset(): void;
  load(fen: string): boolean;
  turn(): 'w' | 'b';
  get(sq: string): ChessSquarePiece | null;
  board(): (ChessSquarePiece | null)[][];
  fen(): string;
  moves(opts?: { square?: string; verbose?: boolean }): ChessMoveVerbose[];
  move(arg: { from: string; to: string; promotion?: string }): ChessMoveVerbose | null;
  undo(): ChessMoveVerbose | null;
  history(opts?: { verbose?: boolean }): ChessMoveVerbose[];
  in_check(): boolean;
  in_checkmate(): boolean;
  in_draw(): boolean;
  game_over(): boolean;
}

interface RawFallbackMove {
  from: number;
  to: number;
  prom?: string;
  epSet?: number;
  isEp?: boolean;
  castle?: string;
}

interface HistorySnapshot {
  b: (string | null)[];
  turn: 'w' | 'b';
  castle: string;
  ep: number;
  half: number;
  full: number;
  moveObj: ChessMoveVerbose;
}

export class FallbackChess implements ChessBoardLike {
  private b: (string | null)[] = [];
  private _turn: 'w' | 'b' = 'w';
  private castle = 'KQkq';
  private ep = -1;
  private half = 0;
  private full = 1;
  private _hist: HistorySnapshot[] = [];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.b = [
      'r','n','b','q','k','b','n','r',
      'p','p','p','p','p','p','p','p',
      null,null,null,null,null,null,null,null,
      null,null,null,null,null,null,null,null,
      null,null,null,null,null,null,null,null,
      null,null,null,null,null,null,null,null,
      'P','P','P','P','P','P','P','P',
      'R','N','B','Q','K','B','N','R'
    ];
    this._turn = 'w';
    this.castle = 'KQkq';
    this.ep = -1;
    this.half = 0;
    this.full = 1;
    this._hist = [];
  }

  load(fenStr: string): boolean {
    const parts = (fenStr || '').trim().split(/\s+/);
    const rows = (parts[0] || '').split('/');
    if (rows.length !== 8) return false;
    const nb: (string | null)[] = new Array(64).fill(null);
    for (let r = 0; r < 8; r++) {
      let c = 0;
      for (let i = 0; i < rows[r].length; i++) {
        const ch = rows[r][i];
        if (ch >= '1' && ch <= '8') c += parseInt(ch, 10);
        else {
          nb[r * 8 + c] = ch;
          c++;
        }
      }
    }
    this.b = nb;
    this._turn = parts[1] === 'b' ? 'b' : 'w';
    this.castle = !parts[2] || parts[2] === '-' ? '' : parts[2];
    this.ep = parts[3] && parts[3] !== '-' ? this.sqToIdx(parts[3]) : -1;
    this.half = parseInt(parts[4] || '0', 10) || 0;
    this.full = parseInt(parts[5] || '1', 10) || 1;
    this._hist = [];
    return true;
  }

  turn(): 'w' | 'b' {
    return this._turn;
  }

  private sqToIdx(sq: string): number {
    if (!sq || sq.length < 2) return -1;
    const f = sq.charCodeAt(0) - 97;
    const r = 8 - parseInt(sq[1], 10);
    return r >= 0 && r < 8 && f >= 0 && f < 8 ? r * 8 + f : -1;
  }

  private idxToSq(i: number): string {
    return String.fromCharCode(97 + (i & 7)) + (8 - (i >> 3));
  }

  private isW(p: string | null): boolean {
    return !!p && p === p.toUpperCase();
  }

  get(sq: string): ChessSquarePiece | null {
    const i = this.sqToIdx(sq);
    if (i < 0 || !this.b[i]) return null;
    const p = this.b[i]!;
    return { type: p.toLowerCase(), color: this.isW(p) ? 'w' : 'b' };
  }

  board(): (ChessSquarePiece | null)[][] {
    const out: (ChessSquarePiece | null)[][] = [];
    for (let r = 0; r < 8; r++) {
      const row: (ChessSquarePiece | null)[] = [];
      for (let c = 0; c < 8; c++) {
        const p = this.b[r * 8 + c];
        row.push(p ? { type: p.toLowerCase(), color: this.isW(p) ? 'w' : 'b' } : null);
      }
      out.push(row);
    }
    return out;
  }

  fen(): string {
    const rows: string[] = [];
    for (let r = 0; r < 8; r++) {
      let s = '';
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = this.b[r * 8 + c];
        if (!p) empty++;
        else {
          if (empty) {
            s += empty;
            empty = 0;
          }
          s += p;
        }
      }
      if (empty) s += empty;
      rows.push(s);
    }
    const epStr = this.ep >= 0 ? this.idxToSq(this.ep) : '-';
    return `${rows.join('/')} ${this._turn} ${this.castle || '-'} ${epStr} ${this.half} ${this.full}`;
  }

  private attacked(b: (string | null)[], sq: number, byW: boolean): boolean {
    const r = sq >> 3;
    const c = sq & 7;
    const pr = byW ? r + 1 : r - 1;
    if (pr >= 0 && pr < 8) {
      const pawn = byW ? 'P' : 'p';
      if (c > 0 && b[pr * 8 + c - 1] === pawn) return true;
      if (c < 7 && b[pr * 8 + c + 1] === pawn) return true;
    }
    const kn = byW ? 'N' : 'n';
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr * 8 + nc] === kn) return true;
    }
    const kg = byW ? 'K' : 'k';
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const kr = r + dr;
        const kc = c + dc;
        if (kr >= 0 && kr < 8 && kc >= 0 && kc < 8 && b[kr * 8 + kc] === kg) return true;
      }
    }
    const rk = byW ? 'R' : 'r';
    const qn = byW ? 'Q' : 'q';
    const bs = byW ? 'B' : 'b';
    const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
    for (let d = 0; d < 8; d++) {
      let sr = r + dirs[d][0];
      let sc = c + dirs[d][1];
      while (sr >= 0 && sr < 8 && sc >= 0 && sc < 8) {
        const p = b[sr * 8 + sc];
        if (p) {
          if (d < 4 && (p === rk || p === qn)) return true;
          if (d >= 4 && (p === bs || p === qn)) return true;
          break;
        }
        sr += dirs[d][0];
        sc += dirs[d][1];
      }
    }
    return false;
  }

  private genLegal(onlySq = -1): RawFallbackMove[] {
    const wTurn = this._turn === 'w';
    const raw: RawFallbackMove[] = [];
    for (let sq = 0; sq < 64; sq++) {
      if (onlySq >= 0 && sq !== onlySq) continue;
      const p = this.b[sq];
      if (!p || this.isW(p) !== wTurn) continue;
      const r = sq >> 3;
      const c = sq & 7;
      const t = p.toLowerCase();
      if (t === 'p') {
        const dir = wTurn ? -1 : 1;
        const startR = wTurn ? 6 : 1;
        const promR = wTurn ? 0 : 7;
        const f1 = (r + dir) * 8 + c;
        if (r + dir >= 0 && r + dir < 8 && !this.b[f1]) {
          if (r + dir === promR) {
            for (const pr of ['q','r','b','n']) raw.push({ from: sq, to: f1, prom: pr });
          } else {
            raw.push({ from: sq, to: f1 });
            const f2 = (r + dir * 2) * 8 + c;
            if (r === startR && !this.b[f2]) raw.push({ from: sq, to: f2, epSet: f1 });
          }
        }
        for (const dc of [-1, 1]) {
          const cc = c + dc;
          if (cc < 0 || cc > 7) continue;
          const to = (r + dir) * 8 + cc;
          const target = this.b[to];
          if ((target && this.isW(target) !== wTurn) || to === this.ep) {
            if (r + dir === promR) {
              for (const pr of ['q','r','b','n']) raw.push({ from: sq, to, prom: pr, isEp: to === this.ep });
            } else {
              raw.push({ from: sq, to, isEp: to === this.ep });
            }
          }
        }
      } else if (t === 'n' || t === 'k') {
        const offs = t === 'n'
          ? [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]
          : [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        for (const [dr, dc] of offs) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
          const to = nr * 8 + nc;
          if (!this.b[to] || this.isW(this.b[to]) !== wTurn) raw.push({ from: sq, to });
        }
        if (t === 'k') {
          if (wTurn && sq === 60 && !this.attacked(this.b, 60, false)) {
            if (this.castle.includes('K') && !this.b[61] && !this.b[62] && !this.attacked(this.b, 61, false) && !this.attacked(this.b, 62, false)) raw.push({ from: 60, to: 62, castle: 'K' });
            if (this.castle.includes('Q') && !this.b[59] && !this.b[58] && !this.b[57] && !this.attacked(this.b, 59, false) && !this.attacked(this.b, 58, false)) raw.push({ from: 60, to: 58, castle: 'Q' });
          } else if (!wTurn && sq === 4 && !this.attacked(this.b, 4, true)) {
            if (this.castle.includes('k') && !this.b[5] && !this.b[6] && !this.attacked(this.b, 5, true) && !this.attacked(this.b, 6, true)) raw.push({ from: 4, to: 6, castle: 'k' });
            if (this.castle.includes('q') && !this.b[3] && !this.b[2] && !this.b[1] && !this.attacked(this.b, 3, true) && !this.attacked(this.b, 2, true)) raw.push({ from: 4, to: 2, castle: 'q' });
          }
        }
      } else {
        const rays = t === 'r'
          ? [[-1,0],[1,0],[0,-1],[0,1]]
          : t === 'b'
            ? [[-1,-1],[-1,1],[1,-1],[1,1]]
            : [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
        for (const [dr, dc] of rays) {
          let sr = r + dr;
          let sc = c + dc;
          while (sr >= 0 && sr < 8 && sc >= 0 && sc < 8) {
            const to = sr * 8 + sc;
            if (!this.b[to]) raw.push({ from: sq, to });
            else {
              if (this.isW(this.b[to]) !== wTurn) raw.push({ from: sq, to });
              break;
            }
            sr += dr;
            sc += dc;
          }
        }
      }
    }
    const legal: RawFallbackMove[] = [];
    const myK = wTurn ? 'K' : 'k';
    for (const m of raw) {
      const nb = this.b.slice();
      const p = nb[m.from];
      nb[m.to] = m.prom ? (wTurn ? m.prom.toUpperCase() : m.prom) : p;
      nb[m.from] = null;
      if (m.isEp) nb[(m.from >> 3) * 8 + (m.to & 7)] = null;
      if (m.castle === 'K') { nb[61] = 'R'; nb[63] = null; }
      else if (m.castle === 'Q') { nb[59] = 'R'; nb[56] = null; }
      else if (m.castle === 'k') { nb[5] = 'r'; nb[7] = null; }
      else if (m.castle === 'q') { nb[3] = 'r'; nb[0] = null; }
      const kSq = nb.indexOf(myK);
      if (kSq >= 0 && !this.attacked(nb, kSq, !wTurn)) legal.push(m);
    }
    return legal;
  }

  moves(opts: { square?: string; verbose?: boolean } = {}): ChessMoveVerbose[] {
    const idx = opts.square ? this.sqToIdx(opts.square) : -1;
    return this.genLegal(idx).map((m) => {
      const cap = m.isEp ? 'p' : this.b[m.to] ? this.b[m.to]!.toLowerCase() : undefined;
      return { from: this.idxToSq(m.from), to: this.idxToSq(m.to), captured: cap, promotion: m.prom };
    });
  }

  move(arg: { from: string; to: string; promotion?: string }): ChessMoveVerbose | null {
    const from = arg.from;
    const to = arg.to;
    const promotion = arg.promotion || 'q';
    const f = this.sqToIdx(from);
    const t = this.sqToIdx(to);
    const legal = this.genLegal(f);
    const m = legal.find((x) => x.to === t && (!x.prom || x.prom === promotion));
    if (!m) return null;
    const cap = m.isEp ? 'p' : this.b[t] ? this.b[t]!.toLowerCase() : undefined;
    const wTurn = this._turn === 'w';
    const p = this.b[f]!;
    const pType = p.toLowerCase();
    let san = '';
    if (m.castle === 'K' || m.castle === 'k') san = 'O-O';
    else if (m.castle === 'Q' || m.castle === 'q') san = 'O-O-O';
    else {
      if (pType !== 'p') san += pType.toUpperCase();
      else if (cap) san += from[0];
      if (cap) san += 'x';
      san += to;
      if (m.prom) san += '=' + m.prom.toUpperCase();
    }
    const moveObj: ChessMoveVerbose = { from, to, captured: cap, promotion: m.prom, san };
    this._hist.push({
      b: this.b.slice(),
      turn: this._turn,
      castle: this.castle,
      ep: this.ep,
      half: this.half,
      full: this.full,
      moveObj
    });
    this.b[t] = m.prom ? (wTurn ? m.prom.toUpperCase() : m.prom) : p;
    this.b[f] = null;
    if (m.isEp) this.b[(f >> 3) * 8 + (t & 7)] = null;
    if (m.castle === 'K') { this.b[61] = 'R'; this.b[63] = null; }
    else if (m.castle === 'Q') { this.b[59] = 'R'; this.b[56] = null; }
    else if (m.castle === 'k') { this.b[5] = 'r'; this.b[7] = null; }
    else if (m.castle === 'q') { this.b[3] = 'r'; this.b[0] = null; }
    if (f === 60) this.castle = this.castle.replace('K', '').replace('Q', '');
    if (f === 4) this.castle = this.castle.replace('k', '').replace('q', '');
    if (f === 63 || t === 63) this.castle = this.castle.replace('K', '');
    if (f === 56 || t === 56) this.castle = this.castle.replace('Q', '');
    if (f === 7 || t === 7) this.castle = this.castle.replace('k', '');
    if (f === 0 || t === 0) this.castle = this.castle.replace('q', '');
    this.ep = m.epSet !== undefined ? m.epSet : -1;
    if (!wTurn) this.full++;
    this._turn = wTurn ? 'b' : 'w';
    if (this.in_check()) {
      san += this.genLegal().length === 0 ? '#' : '+';
      moveObj.san = san;
    }
    return moveObj;
  }

  undo(): ChessMoveVerbose | null {
    const prev = this._hist.pop();
    if (!prev) return null;
    this.b = prev.b;
    this._turn = prev.turn;
    this.castle = prev.castle;
    this.ep = prev.ep;
    this.half = prev.half;
    this.full = prev.full;
    return prev.moveObj;
  }

  history(): ChessMoveVerbose[] {
    return this._hist.map((h) => h.moveObj);
  }

  in_check(): boolean {
    const wTurn = this._turn === 'w';
    const kSq = this.b.indexOf(wTurn ? 'K' : 'k');
    return kSq >= 0 && this.attacked(this.b, kSq, !wTurn);
  }

  in_checkmate(): boolean {
    return this.in_check() && this.genLegal().length === 0;
  }

  in_draw(): boolean {
    return !this.in_check() && this.genLegal().length === 0;
  }

  game_over(): boolean {
    return this.genLegal().length === 0;
  }
}

export function createChessInstance(): ChessBoardLike {
  const Ctor = (typeof window !== 'undefined' && (window as unknown as { Chess?: new () => ChessBoardLike }).Chess) || FallbackChess;
  return new Ctor();
}
