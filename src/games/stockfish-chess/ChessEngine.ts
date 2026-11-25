export interface ChessAnalysisResult {
  bestUci: string;
  bestMoverCp: number;
  secondBestMoverCp: number;
  playedMoverCp: number;
  numLegalMoves: number;
  isSacrificeOffer: boolean;
}

export interface MoveClassification {
  tag: 'brilliant' | 'great' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  badge: string;
  icon: string;
  label: string;
  color: string;
  cpLoss: number;
  winLoss: number;
}

export function createGeniusChessEngine() {
  const P_N = 2, P_B = 3, P_R = 4, P_Q = 5, P_K = 6, P_P = 1;
  const CHAR_MAP: Record<string, number> = { P: 1, N: 2, B: 3, R: 4, Q: 5, K: 6, p: -1, n: -2, b: -3, r: -4, q: -5, k: -6 };
  const PROM_CHARS = ['', '', 'n', 'b', 'r', 'q'];
  const MG_VAL = [0, 82, 337, 365, 477, 1025, 20000];
  const EG_VAL = [0, 94, 281, 297, 512, 936, 20000];
  const SEE_VAL = [0, 100, 325, 340, 500, 950, 20000];
  const PHASE_W = [0, 0, 1, 1, 2, 4, 0];

  const MG_PST: (number[] | null)[] = [
    null,
    [0,0,0,0,0,0,0,0,98,134,61,95,68,126,34,-11,-6,7,26,31,65,56,25,-20,-14,13,6,21,23,12,17,-23,-27,-2,-5,12,17,6,10,-25,-26,-4,-4,-10,3,3,33,-12,-35,-1,-20,-23,-15,24,38,-22,0,0,0,0,0,0,0,0],
    [-167,-89,-34,-49,61,-97,-15,-107,-73,-41,72,36,23,62,7,-17,-47,60,37,65,84,129,73,44,-9,17,19,53,37,69,18,22,-13,4,16,13,28,19,21,-8,-23,-9,12,10,19,17,25,-16,-29,-53,-12,-3,-1,18,-14,-19,-105,-21,-58,-33,-17,-28,-19,-23],
    [-29,4,-82,-37,-25,-42,7,-8,-26,16,-18,-13,30,59,18,-47,-16,37,43,40,35,50,37,-2,-4,5,19,50,37,37,7,-2,-6,13,13,26,34,12,10,4,0,15,15,15,14,27,18,10,4,15,16,0,7,21,33,1,-33,-3,-14,-21,-13,-12,-39,-21],
    [32,42,32,51,63,9,31,43,27,32,58,62,80,67,26,44,-5,19,26,36,17,45,61,16,-24,-11,7,26,24,35,-8,-20,-36,-26,-12,-1,9,-7,6,-23,-45,-25,-16,-17,3,0,-5,-33,-44,-16,-20,-9,-1,11,-6,-71,-19,-13,1,17,16,7,-37,-26],
    [-28,0,29,12,59,44,43,45,-24,-39,-5,1,-16,57,28,54,-13,-17,7,8,29,56,47,57,-27,-27,-16,-16,-1,17,-2,1,-9,-26,-9,-10,-2,-4,3,-3,-14,2,-11,-2,-5,2,14,5,-35,-8,11,2,8,15,-3,1,-1,-18,-9,10,-15,-25,-31,-50],
    [-65,23,16,-15,-56,-34,2,13,29,-1,-20,-7,-8,-4,-38,-29,-9,24,2,-16,-20,6,22,-22,-17,-20,-12,-27,-30,-25,-14,-36,-49,-1,-27,-39,-46,-44,-33,-51,-14,-14,-22,-46,-44,-30,-15,-27,1,7,-8,-64,-43,-16,9,8,-15,36,12,-54,8,-28,24,14]
  ];
  const EG_PST: (number[] | null)[] = [
    null,
    [0,0,0,0,0,0,0,0,178,173,158,134,147,132,165,187,94,100,85,67,56,53,82,84,32,24,13,5,-2,4,17,17,13,9,-3,-7,-7,-8,3,-1,4,7,-6,1,0,-5,-1,-8,13,8,8,10,13,0,2,-7,0,0,0,0,0,0,0,0],
    [-58,-38,-13,-28,-31,-27,-63,-99,-25,-8,-25,-2,-9,-25,-24,-52,-24,-20,10,9,-1,-9,-19,-41,-17,3,22,22,22,11,8,-18,-18,-6,16,25,16,17,4,-18,-23,-3,-1,15,10,-3,-20,-22,-42,-20,-10,-5,-2,-20,-23,-44,-29,-51,-23,-15,-22,-18,-50,-64],
    [-14,-21,-11,-8,-7,-9,-17,-24,-8,-4,7,-12,-3,-13,-4,-14,2,-8,0,-1,-2,6,0,4,-3,9,12,9,14,10,3,2,-6,3,13,19,7,10,-3,-9,-12,-3,8,10,13,3,-7,-15,-14,-18,-7,-1,4,-9,-15,-27,-23,-9,-23,-5,-9,-16,-5,-17],
    [13,10,18,15,12,12,8,5,11,13,13,11,-33,8,13,12,7,7,7,5,4,-3,-5,-3,4,3,13,1,2,1,-1,2,3,5,8,4,-5,-6,-8,-11,-4,0,-5,-1,-7,-12,-8,-16,-6,-6,0,2,-9,-9,-11,-3,-9,2,3,-1,-5,-13,4,-20],
    [-9,22,22,27,27,19,10,20,-17,20,32,41,58,25,30,0,-20,6,9,49,47,35,19,9,3,22,24,45,57,40,57,36,-18,28,19,47,31,34,39,23,-16,-27,15,6,9,17,10,5,-22,-23,-30,-16,-16,-23,-36,-32,-33,-28,-22,-43,-5,-32,-20,-41],
    [-74,-35,-18,-18,-11,15,4,-17,-12,17,14,17,17,38,23,11,10,17,23,15,20,45,44,13,-8,22,24,27,26,33,26,3,-18,-4,21,24,27,23,9,-11,-19,-3,11,21,23,16,7,-9,-27,-11,4,13,14,4,-5,-17,-53,-34,-21,-11,-28,-14,-24,-43]
  ];

  let seed = 0x9e3779b9;
  function nextRand32(): number {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t ^ (t >>> 14)) >>> 0;
  }
  const Z_HI = new Uint32Array(13 * 64);
  const Z_LO = new Uint32Array(13 * 64);
  for (let i = 0; i < 13 * 64; i++) { Z_HI[i] = nextRand32() & 0x1fffff; Z_LO[i] = nextRand32(); }
  const Z_TURN_HI = nextRand32() & 0x1fffff, Z_TURN_LO = nextRand32();
  const Z_CAS_HI = new Uint32Array(16), Z_CAS_LO = new Uint32Array(16);
  for (let i = 0; i < 16; i++) { Z_CAS_HI[i] = nextRand32() & 0x1fffff; Z_CAS_LO[i] = nextRand32(); }
  const Z_EP_HI = new Uint32Array(8), Z_EP_LO = new Uint32Array(8);
  for (let i = 0; i < 8; i++) { Z_EP_HI[i] = nextRand32() & 0x1fffff; Z_EP_LO[i] = nextRand32(); }

  const OPENING_BOOK: Record<string, string[]> = {
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': ['e2e4', 'd2d4', 'c2c4', 'g1f3'],
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -': ['c7c5', 'e7e5', 'e7e6', 'c7c6'],
    'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq -': ['g8f6', 'd7d5', 'e7e6'],
    'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq -': ['e7e5', 'g8f6', 'c7c5', 'e7e6'],
    'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq -': ['d7d5', 'g8f6', 'c7c5'],
    'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['g1f3', 'f1c4', 'b1c3'],
    'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -': ['b8c6', 'g8f6'],
    'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -': ['f1b5', 'f1c4', 'd2d4'],
    'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['g1f3', 'b1c3', 'c2c3'],
    'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -': ['c2c4', 'g1f3', 'c1f4'],
    'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -': ['c2c4', 'g1f3', 'c1f4']
  };

  interface EngineState { b: Int8Array; turn: number; castle: number; ep: number; hi: number; lo: number; }
  interface EngineMove { from: number; to: number; prom?: number; isEp?: boolean; epSet?: number; castle?: number; cap?: boolean; _ord?: number; }

  function parseFen(fen: string): EngineState {
    const parts = fen.trim().split(/\s+/);
    const rows = parts[0].split('/');
    const b = new Int8Array(64);
    for (let r = 0; r < 8; r++) {
      let c = 0;
      const row = rows[r];
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch >= '1' && ch <= '8') c += parseInt(ch, 10);
        else { b[r * 8 + c] = CHAR_MAP[ch] || 0; c++; }
      }
    }
    const turn = parts[1] === 'b' ? -1 : 1;
    let castle = 0;
    const cs = parts[2] || '-';
    if (cs.includes('K')) castle |= 1;
    if (cs.includes('Q')) castle |= 2;
    if (cs.includes('k')) castle |= 4;
    if (cs.includes('q')) castle |= 8;
    let ep = -1;
    if (parts[3] && parts[3] !== '-') {
      ep = (8 - parseInt(parts[3][1], 10)) * 8 + (parts[3].charCodeAt(0) - 97);
    }
    let hi = 0, lo = 0;
    for (let sq = 0; sq < 64; sq++) {
      if (b[sq]) {
        const pIdx = (b[sq] + 6) * 64 + sq;
        hi ^= Z_HI[pIdx]; lo ^= Z_LO[pIdx];
      }
    }
    if (turn === -1) { hi ^= Z_TURN_HI; lo ^= Z_TURN_LO; }
    hi ^= Z_CAS_HI[castle]; lo ^= Z_CAS_LO[castle];
    if (ep >= 0) { hi ^= Z_EP_HI[ep & 7]; lo ^= Z_EP_LO[ep & 7]; }
    return { b, turn, castle, ep, hi, lo };
  }

  function hashKey(st: EngineState): number {
    return (st.hi >>> 0) * 4294967296 + (st.lo >>> 0);
  }

  function isAttacked(b: Int8Array, sq: number, bySide: number): boolean {
    const r = sq >> 3, c = sq & 7;
    const pawn = bySide * P_P;
    const pr = bySide === 1 ? r + 1 : r - 1;
    if (pr >= 0 && pr < 8) {
      if (c > 0 && b[pr * 8 + c - 1] === pawn) return true;
      if (c < 7 && b[pr * 8 + c + 1] === pawn) return true;
    }
    const kn = bySide * P_N;
    const kOff = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for (let i = 0; i < 8; i++) {
      const nr = r + kOff[i][0], nc = c + kOff[i][1];
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr * 8 + nc] === kn) return true;
    }
    const kg = bySide * P_K;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const kr = r + dr, kc = c + dc;
      if (kr >= 0 && kr < 8 && kc >= 0 && kc < 8 && b[kr * 8 + kc] === kg) return true;
    }
    const rk = bySide * P_R, bs = bySide * P_B, qn = bySide * P_Q;
    const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
    for (let d = 0; d < 8; d++) {
      let sr = r + dirs[d][0], sc = c + dirs[d][1];
      while (sr >= 0 && sr < 8 && sc >= 0 && sc < 8) {
        const p = b[sr * 8 + sc];
        if (p) {
          if (d < 4 && (p === rk || p === qn)) return true;
          if (d >= 4 && (p === bs || p === qn)) return true;
          break;
        }
        sr += dirs[d][0]; sc += dirs[d][1];
      }
    }
    return false;
  }

  const seeGain = new Int32Array(32);
  const seeSavedSq = new Int32Array(32);
  const seeSavedP = new Int8Array(32);

  function findSmallestAttacker(b: Int8Array, sq: number, side: number): number {
    const r = sq >> 3, c = sq & 7;
    const pawn = side * P_P;
    const pr = side === 1 ? r + 1 : r - 1;
    if (pr >= 0 && pr < 8) {
      if (c > 0 && b[pr * 8 + c - 1] === pawn) return pr * 8 + c - 1;
      if (c < 7 && b[pr * 8 + c + 1] === pawn) return pr * 8 + c + 1;
    }
    const kn = side * P_N;
    const kOff = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for (let i = 0; i < 8; i++) {
      const nr = r + kOff[i][0], nc = c + kOff[i][1];
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr * 8 + nc] === kn) return nr * 8 + nc;
    }
    const bs = side * P_B, rk = side * P_R, qn = side * P_Q;
    const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
    let rookHit = -1, queenHit = -1;
    for (let d = 0; d < 8; d++) {
      let sr = r + dirs[d][0], sc = c + dirs[d][1];
      while (sr >= 0 && sr < 8 && sc >= 0 && sc < 8) {
        const sIdx = sr * 8 + sc, p = b[sIdx];
        if (p) {
          if (d >= 4 && p === bs) return sIdx;
          if (d < 4 && p === rk && rookHit < 0) rookHit = sIdx;
          if (p === qn && queenHit < 0) queenHit = sIdx;
          break;
        }
        sr += dirs[d][0]; sc += dirs[d][1];
      }
    }
    if (rookHit >= 0) return rookHit;
    if (queenHit >= 0) return queenHit;
    const kg = side * P_K;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const kr = r + dr, kc = c + dc;
      if (kr >= 0 && kr < 8 && kc >= 0 && kc < 8 && b[kr * 8 + kc] === kg) return kr * 8 + kc;
    }
    return -1;
  }

  function fastSee(b: Int8Array, from: number, to: number, turn: number): number {
    const origFrom = b[from];
    if (!origFrom) return 0;
    const origTo = b[to];
    let curPiece = Math.abs(origFrom);
    let curSide = turn;
    seeGain[0] = origTo ? SEE_VAL[Math.abs(origTo)] : (curPiece === P_P && (from & 7) !== (to & 7) ? 100 : 0);
    b[from] = 0;
    let savedCount = 0;
    let d = 1;
    while (d < 24) {
      seeGain[d] = SEE_VAL[curPiece] - seeGain[d - 1];
      curSide = -curSide;
      const atkSq = findSmallestAttacker(b, to, curSide);
      if (atkSq < 0) break;
      curPiece = Math.abs(b[atkSq]);
      seeSavedSq[savedCount] = atkSq;
      seeSavedP[savedCount] = b[atkSq];
      b[atkSq] = 0;
      savedCount++;
      if (curPiece === P_K && isAttacked(b, to, -curSide)) break;
      d++;
    }
    for (let k = savedCount - 1; k >= 0; k--) b[seeSavedSq[k]] = seeSavedP[k];
    b[from] = origFrom;
    while (--d > 0) seeGain[d - 1] = -Math.max(-seeGain[d - 1], seeGain[d]);
    return seeGain[0];
  }

  function applyMove(st: EngineState, m: EngineMove): EngineState {
    const nb = st.b.slice();
    const p = nb[m.from];
    const turn = st.turn;
    let hi = st.hi ^ Z_TURN_HI, lo = st.lo ^ Z_TURN_LO;
    hi ^= Z_CAS_HI[st.castle]; lo ^= Z_CAS_LO[st.castle];
    if (st.ep >= 0) { hi ^= Z_EP_HI[st.ep & 7]; lo ^= Z_EP_LO[st.ep & 7]; }
    const fpIdx = (p + 6) * 64 + m.from;
    hi ^= Z_HI[fpIdx]; lo ^= Z_LO[fpIdx];
    if (nb[m.to]) {
      const tpIdx = (nb[m.to] + 6) * 64 + m.to;
      hi ^= Z_HI[tpIdx]; lo ^= Z_LO[tpIdx];
    }
    const placed = m.prom ? (turn * m.prom) : p;
    nb[m.to] = placed;
    nb[m.from] = 0;
    const ppIdx = (placed + 6) * 64 + m.to;
    hi ^= Z_HI[ppIdx]; lo ^= Z_LO[ppIdx];
    if (m.isEp) {
      const epSq = (m.from >> 3) * 8 + (m.to & 7);
      const epP = nb[epSq];
      const eIdx = (epP + 6) * 64 + epSq;
      hi ^= Z_HI[eIdx]; lo ^= Z_LO[eIdx];
      nb[epSq] = 0;
    }
    if (m.castle) {
      let rf = 0, rt = 0;
      const rk = turn * P_R;
      if (m.castle === 1) { rf = 63; rt = 61; }
      else if (m.castle === 2) { rf = 56; rt = 59; }
      else if (m.castle === 4) { rf = 7; rt = 5; }
      else { rf = 0; rt = 3; }
      const r1 = (rk + 6) * 64 + rf, r2 = (rk + 6) * 64 + rt;
      hi ^= Z_HI[r1] ^ Z_HI[r2]; lo ^= Z_LO[r1] ^ Z_LO[r2];
      nb[rt] = rk; nb[rf] = 0;
    }
    let nc = st.castle;
    if (m.from === 60) nc &= ~3;
    if (m.from === 4) nc &= ~12;
    if (m.from === 63 || m.to === 63) nc &= ~1;
    if (m.from === 56 || m.to === 56) nc &= ~2;
    if (m.from === 7 || m.to === 7) nc &= ~4;
    if (m.from === 0 || m.to === 0) nc &= ~8;
    hi ^= Z_CAS_HI[nc]; lo ^= Z_CAS_LO[nc];
    const nep = m.epSet !== undefined ? m.epSet : -1;
    if (nep >= 0) { hi ^= Z_EP_HI[nep & 7]; lo ^= Z_EP_LO[nep & 7]; }
    return { b: nb, turn: -turn, castle: nc, ep: nep, hi, lo };
  }

  function genMoves(st: EngineState, capturesOnly: boolean): EngineMove[] {
    const b = st.b, turn = st.turn;
    const moves: EngineMove[] = [];
    for (let sq = 0; sq < 64; sq++) {
      const p = b[sq];
      if (!p || (p > 0 ? 1 : -1) !== turn) continue;
      const r = sq >> 3, c = sq & 7, t = Math.abs(p);
      if (t === P_P) {
        const dir = turn === 1 ? -1 : 1, startR = turn === 1 ? 6 : 1, promR = turn === 1 ? 0 : 7;
        const nr = r + dir;
        if (nr >= 0 && nr < 8) {
          const f1 = nr * 8 + c;
          if (!b[f1]) {
            if (nr === promR) {
              moves.push({ from: sq, to: f1, prom: P_Q, cap: true });
              if (!capturesOnly) {
                moves.push({ from: sq, to: f1, prom: P_N, cap: true });
                moves.push({ from: sq, to: f1, prom: P_R, cap: true });
                moves.push({ from: sq, to: f1, prom: P_B, cap: true });
              }
            } else if (!capturesOnly) {
              moves.push({ from: sq, to: f1 });
              const f2 = (r + dir * 2) * 8 + c;
              if (r === startR && !b[f2]) moves.push({ from: sq, to: f2, epSet: f1 });
            }
          }
          for (let ci = -1; ci <= 1; ci += 2) {
            const cc = c + ci;
            if (cc < 0 || cc > 7) continue;
            const to = nr * 8 + cc, targ = b[to];
            if ((targ && (targ > 0 ? 1 : -1) !== turn) || to === st.ep) {
              if (nr === promR) {
                moves.push({ from: sq, to, prom: P_Q, isEp: to === st.ep, cap: true });
                if (!capturesOnly) moves.push({ from: sq, to, prom: P_N, isEp: to === st.ep, cap: true });
              } else {
                moves.push({ from: sq, to, isEp: to === st.ep, cap: true });
              }
            }
          }
        }
      } else if (t === P_N || t === P_K) {
        const offs = t === P_N ? [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]] : [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        for (let i = 0; i < 8; i++) {
          const nr = r + offs[i][0], nc = c + offs[i][1];
          if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
          const to = nr * 8 + nc, targ = b[to];
          if (!targ) { if (!capturesOnly) moves.push({ from: sq, to }); }
          else if ((targ > 0 ? 1 : -1) !== turn) moves.push({ from: sq, to, cap: true });
        }
        if (t === P_K && !capturesOnly) {
          if (turn === 1 && sq === 60 && !isAttacked(b, 60, -1)) {
            if ((st.castle & 1) && !b[61] && !b[62] && !isAttacked(b, 61, -1) && !isAttacked(b, 62, -1)) moves.push({ from: 60, to: 62, castle: 1 });
            if ((st.castle & 2) && !b[59] && !b[58] && !b[57] && !isAttacked(b, 59, -1) && !isAttacked(b, 58, -1)) moves.push({ from: 60, to: 58, castle: 2 });
          } else if (turn === -1 && sq === 4 && !isAttacked(b, 4, 1)) {
            if ((st.castle & 4) && !b[5] && !b[6] && !isAttacked(b, 5, 1) && !isAttacked(b, 6, 1)) moves.push({ from: 4, to: 6, castle: 4 });
            if ((st.castle & 8) && !b[3] && !b[2] && !b[1] && !isAttacked(b, 3, 1) && !isAttacked(b, 2, 1)) moves.push({ from: 4, to: 2, castle: 8 });
          }
        }
      } else {
        const sIdx = t === P_B ? 4 : 0, eIdx = t === P_R ? 4 : 8;
        const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
        for (let d = sIdx; d < eIdx; d++) {
          let sr = r + dirs[d][0], sc = c + dirs[d][1];
          while (sr >= 0 && sr < 8 && sc >= 0 && sc < 8) {
            const to = sr * 8 + sc, targ = b[to];
            if (!targ) { if (!capturesOnly) moves.push({ from: sq, to }); }
            else { if ((targ > 0 ? 1 : -1) !== turn) moves.push({ from: sq, to, cap: true }); break; }
            sr += dirs[d][0]; sc += dirs[d][1];
          }
        }
      }
    }
    const legal: EngineMove[] = [], myKing = turn * P_K;
    for (let i = 0; i < moves.length; i++) {
      const m = moves[i], ns = applyMove(st, m);
      let kSq = -1;
      for (let q = 0; q < 64; q++) if (ns.b[q] === myKing) { kSq = q; break; }
      if (kSq >= 0 && !isAttacked(ns.b, kSq, -turn)) legal.push(m);
    }
    return legal;
  }

  function evaluate(st: EngineState): number {
    const b = st.b;
    let mg = 0, eg = 0, phase = 0, wb = 0, bb = 0, wKsq = -1, bKsq = -1;
    const wPawnFiles = new Int8Array(8), bPawnFiles = new Int8Array(8);
    for (let sq = 0; sq < 64; sq++) {
      const p = b[sq];
      if (!p) continue;
      const t = Math.abs(p);
      if (p > 0) {
        if (t === P_K) wKsq = sq;
        else if (t === P_P) wPawnFiles[sq & 7]++;
        else if (t === P_B) wb++;
        mg += MG_VAL[t] + (MG_PST[t] ? MG_PST[t]![sq] : 0);
        eg += EG_VAL[t] + (EG_PST[t] ? EG_PST[t]![sq] : 0);
      } else {
        if (t === P_K) bKsq = sq;
        else if (t === P_P) bPawnFiles[sq & 7]++;
        else if (t === P_B) bb++;
        const flip = (7 - (sq >> 3)) * 8 + (sq & 7);
        mg -= MG_VAL[t] + (MG_PST[t] ? MG_PST[t]![flip] : 0);
        eg -= EG_VAL[t] + (EG_PST[t] ? EG_PST[t]![flip] : 0);
      }
      phase += PHASE_W[t];
    }
    if (wb >= 2) { mg += 35; eg += 52; }
    if (bb >= 2) { mg -= 35; eg -= 52; }
    for (let sq = 0; sq < 64; sq++) {
      const p = b[sq];
      if (!p) continue;
      const t = Math.abs(p), r = sq >> 3, f = sq & 7;
      if (t === P_P) {
        if (p > 0) {
          if (wPawnFiles[f] > 1) { mg -= 10; eg -= 14; }
          if ((f === 0 || !wPawnFiles[f - 1]) && (f === 7 || !wPawnFiles[f + 1])) { mg -= 12; eg -= 14; }
        } else {
          if (bPawnFiles[f] > 1) { mg += 10; eg += 14; }
          if ((f === 0 || !bPawnFiles[f - 1]) && (f === 7 || !bPawnFiles[f + 1])) { mg += 12; eg += 14; }
        }
      } else if (t === P_R) {
        if (p > 0 && !wPawnFiles[f]) { const bn = !bPawnFiles[f] ? 24 : 13; mg += bn; eg += bn - 4; }
        if (p < 0 && !bPawnFiles[f]) { const bn = !wPawnFiles[f] ? 24 : 13; mg -= bn; eg -= bn - 4; }
      }
    }
    if (phase <= 6 && wKsq >= 0 && bKsq >= 0) {
      const kDist = Math.abs((wKsq >> 3) - (bKsq >> 3)) + Math.abs((wKsq & 7) - (bKsq & 7));
      if (eg >= 180) eg += Math.round(Math.max(Math.abs((bKsq >> 3) - 3.5), Math.abs((bKsq & 7) - 3.5)) * 10 + (14 - kDist) * 5);
      else if (eg <= -180) eg -= Math.round(Math.max(Math.abs((wKsq >> 3) - 3.5), Math.abs((wKsq & 7) - 3.5)) * 10 + (14 - kDist) * 5);
    }
    const mgPhase = Math.min(24, phase), egPhase = 24 - mgPhase;
    const tapered = Math.round((mg * mgPhase + eg * egPhase) / 24);
    return st.turn * (tapered + (st.turn === 1 ? 10 : -10));
  }

  function toUci(m: EngineMove): string {
    return String.fromCharCode(97 + (m.from & 7)) + (8 - (m.from >> 3)) +
           String.fromCharCode(97 + (m.to & 7)) + (8 - (m.to >> 3)) +
           (m.prom ? PROM_CHARS[m.prom] : '');
  }

  const tt = new Map<number, { depth: number; val: number; flag: number; best: EngineMove }>();
  let killers: (EngineMove | null)[][] = [];
  const history = new Int32Array(2 * 64 * 64);
  let repHistorySet = new Set<number>();
  let startTime = 0, timeLimit = 1200, aborted = false, nodes = 0;

  function uciToMoveObj(st: EngineState, uci: string): EngineMove | null {
    if (!uci || uci.length < 4) return null;
    const from = (8 - parseInt(uci[1], 10)) * 8 + (uci.charCodeAt(0) - 97);
    const to = (8 - parseInt(uci[3], 10)) * 8 + (uci.charCodeAt(2) - 97);
    const promChar = uci[4] || '';
    const prom = promChar === 'q' ? P_Q : (promChar === 'r' ? P_R : (promChar === 'b' ? P_B : (promChar === 'n' ? P_N : 0)));
    const moves = genMoves(st, false);
    return moves.find((m) => m.from === from && m.to === to && (m.prom || 0) === prom) || null;
  }

  function scoreMoveForOrder(st: EngineState, m: EngineMove, ttMove: EngineMove | null, ply: number): number {
    if (ttMove && m.from === ttMove.from && m.to === ttMove.to && m.prom === ttMove.prom) return 2000000;
    let s = 0;
    if (m.prom) s += 1500000 + m.prom * 1000;
    if (st.b[m.to] || m.isEp) {
      const see = fastSee(st.b, m.from, m.to, st.turn);
      return s + (see >= 0 ? 1000000 : 100000) + see * 10 + (st.b[m.to] ? SEE_VAL[Math.abs(st.b[m.to])] : 100);
    }
    const kl = killers[ply];
    if (kl) {
      if (kl[0] && kl[0].from === m.from && kl[0].to === m.to) return 900000;
      if (kl[1] && kl[1].from === m.from && kl[1].to === m.to) return 850000;
    }
    if (m.castle) return 700000;
    return history[(st.turn === 1 ? 0 : 4096) + (m.from << 6) + m.to];
  }

  function orderMoves(st: EngineState, moves: EngineMove[], ttMove: EngineMove | null, ply: number): void {
    for (let i = 0; i < moves.length; i++) moves[i]._ord = scoreMoveForOrder(st, moves[i], ttMove, ply);
    moves.sort((a, b) => (b._ord || 0) - (a._ord || 0));
  }

  function hasNonPawnMaterial(b: Int8Array, turn: number): boolean {
    for (let i = 0; i < 64; i++) {
      const p = b[i];
      if (p && (p > 0 ? 1 : -1) === turn) {
        const t = Math.abs(p);
        if (t >= P_N && t <= P_Q) return true;
      }
    }
    return false;
  }

  function quiesce(st: EngineState, alpha: number, beta: number, ply: number): number {
    nodes++;
    if ((nodes & 2047) === 0 && performance.now() - startTime > timeLimit) { aborted = true; return alpha; }
    const myK = st.turn * P_K;
    let kSq = -1;
    for (let i = 0; i < 64; i++) if (st.b[i] === myK) { kSq = i; break; }
    const inChk = kSq >= 0 && isAttacked(st.b, kSq, -st.turn);
    let stand = 0;
    if (!inChk) {
      stand = evaluate(st);
      if (stand >= beta) return beta;
      if (stand > alpha) alpha = stand;
    }
    if (ply >= 24) return inChk ? evaluate(st) : stand;
    const moves = genMoves(st, !inChk);
    if (!moves.length) return inChk ? (-30000 + ply) : stand;
    orderMoves(st, moves, null, ply);
    for (let i = 0; i < moves.length; i++) {
      const m = moves[i];
      if (!inChk && !m.prom) {
        const capVal = m.isEp ? 100 : (st.b[m.to] ? SEE_VAL[Math.abs(st.b[m.to])] : 0);
        if (stand + capVal + 200 < alpha) continue;
        if (fastSee(st.b, m.from, m.to, st.turn) < -20) continue;
      }
      const val = -quiesce(applyMove(st, m), -beta, -alpha, ply + 1);
      if (aborted) return alpha;
      if (val >= beta) return beta;
      if (val > alpha) alpha = val;
    }
    return alpha;
  }

  function negamax(st: EngineState, depth: number, alpha: number, beta: number, ply: number, allowNull: boolean): number {
    nodes++;
    if ((nodes & 2047) === 0 && performance.now() - startTime > timeLimit) { aborted = true; return alpha; }
    const key = hashKey(st);
    if (ply > 0 && repHistorySet.has(key)) return 0;
    const myK = st.turn * P_K;
    let kSq = -1;
    for (let i = 0; i < 64; i++) if (st.b[i] === myK) { kSq = i; break; }
    const inChk = kSq >= 0 && isAttacked(st.b, kSq, -st.turn);
    if (inChk && ply < 16) depth++;
    if (depth <= 0) return quiesce(st, alpha, beta, ply);

    const origAlpha = alpha;
    const entry = tt.get(key);
    if (entry && entry.depth >= depth && ply > 0) {
      if (entry.flag === 0) return entry.val;
      if (entry.flag === 1 && entry.val > alpha) alpha = entry.val;
      else if (entry.flag === 2 && entry.val < beta) beta = entry.val;
      if (alpha >= beta) return entry.val;
    }
    if (allowNull && !inChk && depth >= 3 && ply > 0 && hasNonPawnMaterial(st.b, st.turn)) {
      const R = depth >= 6 ? 3 : 2;
      let nhi = st.hi ^ Z_TURN_HI, nlo = st.lo ^ Z_TURN_LO;
      if (st.ep >= 0) { nhi ^= Z_EP_HI[st.ep & 7]; nlo ^= Z_EP_LO[st.ep & 7]; }
      const nullScore = -negamax({ b: st.b, turn: -st.turn, castle: st.castle, ep: -1, hi: nhi, lo: nlo }, depth - 1 - R, -beta, -beta + 1, ply + 1, false);
      if (aborted) return alpha;
      if (nullScore >= beta) return beta;
    }
    const moves = genMoves(st, false);
    if (!moves.length) return inChk ? (-30000 + ply) : 0;
    orderMoves(st, moves, entry ? entry.best : null, ply);
    let best = -999999, bestMove = moves[0];
    const enemyKing = -st.turn * P_K;
    for (let i = 0; i < moves.length; i++) {
      const m = moves[i], ns = applyMove(st, m);
      let givesCheck = false;
      for (let q = 0; q < 64; q++) if (ns.b[q] === enemyKing) { givesCheck = isAttacked(ns.b, q, st.turn); break; }
      let score: number;
      const isQuiet = !st.b[m.to] && !m.isEp && !m.prom;
      if (i === 0) score = -negamax(ns, depth - 1, -beta, -alpha, ply + 1, true);
      else {
        let red = 0;
        if (depth >= 3 && i >= 4 && isQuiet && !inChk && !givesCheck) red = i >= 10 && depth >= 6 ? 2 : 1;
        score = -negamax(ns, depth - 1 - red, -alpha - 1, -alpha, ply + 1, true);
        if (!aborted && red > 0 && score > alpha) score = -negamax(ns, depth - 1, -alpha - 1, -alpha, ply + 1, true);
        if (!aborted && score > alpha && score < beta) score = -negamax(ns, depth - 1, -beta, -alpha, ply + 1, true);
      }
      if (aborted) return best === -999999 ? alpha : best;
      if (score > best) { best = score; bestMove = m; }
      if (score > alpha) alpha = score;
      if (alpha >= beta) {
        if (isQuiet) {
          if (!killers[ply]) killers[ply] = [null, null];
          if (!killers[ply][0] || killers[ply][0]!.from !== m.from || killers[ply][0]!.to !== m.to) {
            killers[ply][1] = killers[ply][0];
            killers[ply][0] = m;
          }
          const hIdx = (st.turn === 1 ? 0 : 4096) + (m.from << 6) + m.to;
          history[hIdx] = Math.min(400000, history[hIdx] + depth * depth);
        }
        break;
      }
    }
    const flag = best <= origAlpha ? 2 : (best >= beta ? 1 : 0);
    if (tt.size > 180000) tt.clear();
    tt.set(key, { depth, val: best, flag, best: bestMove });
    return best;
  }

  function findBestMove(fen: string, maxDepth = 10, budgetMs = 1400, skill = 20, priorHashes: number[] | null = null) {
    const st = parseFen(fen);
    const moves = genMoves(st, false);
    if (!moves.length) return { bestUci: '(none)', scoreCp: 0, depth: 0 };
    repHistorySet = new Set(priorHashes || []);
    const bookKey = fen.split(' ').slice(0, 4).join(' ');
    if (OPENING_BOOK[bookKey]) {
      const cands = OPENING_BOOK[bookKey];
      const pick = cands[Math.floor(Math.random() * cands.length)];
      if (moves.some((m) => toUci(m) === pick)) return { bestUci: pick, scoreCp: 25, depth: 12 };
    }
    startTime = performance.now();
    timeLimit = Math.max(budgetMs, 350);
    aborted = false;
    nodes = 0;
    killers = [];
    const effectiveMaxDepth = skill <= 14 ? Math.min(maxDepth, 6) : (skill <= 18 ? Math.min(maxDepth, 8) : maxDepth);
    let bestMove = moves[0], bestScore = 0, completedDepth = 0;
    for (let d = 1; d <= effectiveMaxDepth; d++) {
      timeLimit = d <= 3 ? Math.max(budgetMs, 1600) : Math.max(budgetMs, 350);
      aborted = false;
      orderMoves(st, moves, bestMove, 0);
      const alpha = d >= 4 ? bestScore - 55 : -999999;
      const beta = d >= 4 ? bestScore + 55 : 999999;
      const runRoot = (a: number, b: number) => {
        let locBest = moves[0], locScore = -999999;
        for (let i = 0; i < moves.length; i++) {
          const ns = applyMove(st, moves[i]);
          const scKey = hashKey(ns);
          let sc: number;
          if (repHistorySet.has(scKey)) sc = 0;
          else if (i === 0) sc = -negamax(ns, d - 1, -b, -a, 1, true);
          else {
            sc = -negamax(ns, d - 1, -a - 1, -a, 1, true);
            if (!aborted && sc > a && sc < b) sc = -negamax(ns, d - 1, -b, -a, 1, true);
          }
          if (aborted) return null;
          if (sc > locScore) { locScore = sc; locBest = moves[i]; }
          if (sc > a) a = sc;
        }
        return { locBest, locScore };
      };
      let res = runRoot(alpha, beta);
      if (res && (res.locScore <= alpha || res.locScore >= beta) && !aborted) res = runRoot(-999999, 999999);
      if (!res || aborted) break;
      bestMove = res.locBest; bestScore = res.locScore; completedDepth = d;
      if (Math.abs(bestScore) >= 29000 || (d >= 4 && performance.now() - startTime > Math.max(budgetMs, 350) * 0.7)) break;
    }
    return { bestUci: toUci(bestMove), scoreCp: bestScore, depth: completedDepth };
  }

  function analyzePositionMove(fenBefore: string, playedUci: string, searchDepth = 4, budgetMs = 280): ChessAnalysisResult {
    const st = parseFen(fenBefore);
    const moves = genMoves(st, false);
    if (!moves.length) return { bestUci: '', bestMoverCp: 0, secondBestMoverCp: 0, playedMoverCp: 0, numLegalMoves: 0, isSacrificeOffer: false };
    const playedMoveObj = moves.find((m) => toUci(m) === playedUci) || moves[0];
    const playedSt = applyMove(st, playedMoveObj);
    const movedPieceVal = SEE_VAL[Math.abs(st.b[playedMoveObj.from])];
    const capVal = playedMoveObj.isEp ? 100 : (st.b[playedMoveObj.to] ? SEE_VAL[Math.abs(st.b[playedMoveObj.to])] : 0);
    const isSacrificeOffer = movedPieceVal >= 320 && movedPieceVal > capVal + 135 && isAttacked(playedSt.b, playedMoveObj.to, -st.turn);
    startTime = performance.now();
    timeLimit = Math.max(budgetMs, 150);
    aborted = false; nodes = 0; killers = [];
    const targetDepth = Math.max(2, searchDepth);
    let bestMoveObj = playedMoveObj, bestUci = toUci(playedMoveObj);
    let bestMoverCp = 0, secondBestMoverCp = 0, playedMoverCp = 0;
    for (let d = 2; d <= targetDepth; d++) {
      const childDepth = d - 1;
      timeLimit = d === 2 ? Math.max(budgetMs, 1800) : Math.max(budgetMs, 150);
      aborted = false;
      orderMoves(st, moves, d === 2 ? null : bestMoveObj, 0);
      const curPlayedCp = -negamax(playedSt, childDepth, -999999, 999999, 1, true);
      if (d > 2 && aborted) break;
      let curBestCp = -999999, curSecondCp = -999999, curBestObj = moves[0], curBestUci = toUci(moves[0]), depthComplete = true;
      for (let i = 0; i < moves.length; i++) {
        const m = moves[i], uci = toUci(m);
        let sc: number;
        if (uci === playedUci) sc = curPlayedCp;
        else {
          const floor = curBestCp >= 20000 ? 280 : Math.max(-35000, curBestCp - 650);
          sc = -negamax(applyMove(st, m), childDepth, -999999, -floor, 1, true);
          if (d > 2 && aborted) { depthComplete = false; break; }
        }
        if (sc > curBestCp) { curSecondCp = curBestCp; curBestCp = sc; curBestObj = m; curBestUci = uci; }
        else if (uci !== curBestUci && sc > curSecondCp) curSecondCp = sc;
      }
      if (!depthComplete) break;
      if (curSecondCp === -999999) curSecondCp = curBestCp;
      bestMoveObj = curBestObj; bestUci = curBestUci; bestMoverCp = curBestCp; secondBestMoverCp = curSecondCp; playedMoverCp = curPlayedCp;
      if (performance.now() - startTime > Math.max(budgetMs, 150) * 0.55) break;
    }
    return { bestUci, bestMoverCp, secondBestMoverCp, playedMoverCp, numLegalMoves: moves.length, isSacrificeOffer };
  }

  return { findBestMove, analyzePositionMove, parseFen, applyMove, hashKey, uciToMoveObj };
}

export function cpToWinPercent(cp: number): number {
  if (cp >= 20000) return 100.0;
  if (cp <= -20000) return 0.0;
  const clamped = Math.max(-1500, Math.min(1500, cp));
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * clamped)) - 1);
}

export function classifyChessMove(
  analysis: ChessAnalysisResult,
  playedUci: string,
  isCheckmateAfter: boolean
): MoveClassification {
  const { bestUci, bestMoverCp, secondBestMoverCp, playedMoverCp, numLegalMoves, isSacrificeOffer } = analysis;
  const cpLoss = Math.max(0, bestMoverCp - playedMoverCp);
  const winBefore = cpToWinPercent(bestMoverCp);
  const winAfter = cpToWinPercent(playedMoverCp);
  const winLoss = Math.max(0, winBefore - winAfter);
  const uniquenessGap = bestMoverCp - secondBestMoverCp;

  if (isCheckmateAfter) return { tag: 'best', badge: '★', icon: '⭐', label: 'Best', color: '#2ecc71', cpLoss: 0, winLoss: 0 };
  if (bestMoverCp > -20000 && playedMoverCp <= -20000) return { tag: 'blunder', badge: '??', icon: '💥', label: 'Blunder', color: '#e74c3c', cpLoss, winLoss };
  if (bestMoverCp >= 20000 && playedMoverCp < 250) return { tag: 'blunder', badge: '??', icon: '💥', label: 'Blunder', color: '#e74c3c', cpLoss, winLoss };
  if (winLoss >= 20.0 || (cpLoss >= 290 && bestMoverCp > -600 && playedMoverCp < 650) || (cpLoss >= 480 && bestMoverCp > -700)) {
    return { tag: 'blunder', badge: '??', icon: '💥', label: 'Blunder', color: '#e74c3c', cpLoss, winLoss };
  }
  if ((bestMoverCp >= 20000 && playedMoverCp < 20000) || winLoss >= 10.0 || (cpLoss >= 145 && bestMoverCp > -600 && playedMoverCp < 750)) {
    return { tag: 'mistake', badge: '?', icon: '❓', label: 'Mistake', color: '#e67e22', cpLoss, winLoss };
  }
  if (winLoss >= 4.5 || (cpLoss >= 70 && bestMoverCp > -600 && playedMoverCp < 750)) {
    return { tag: 'inaccuracy', badge: '?!', icon: '⚠️', label: 'Inaccuracy', color: '#f1c40f', cpLoss, winLoss };
  }
  if (isSacrificeOffer && winLoss <= 2.2 && cpLoss <= 25 && playedMoverCp >= -40 && (bestMoverCp < 750 || secondBestMoverCp < 300)) {
    return { tag: 'brilliant', badge: '!!', icon: '💎', label: 'Brilliant', color: '#1abc9c', cpLoss, winLoss };
  }
  if (numLegalMoves >= 3 && winLoss <= 1.8 && cpLoss <= 15 && (uniquenessGap >= 135 || winBefore - cpToWinPercent(secondBestMoverCp) >= 12.0)) {
    return { tag: 'great', badge: '!', icon: '❗', label: 'Great', color: '#3498db', cpLoss, winLoss };
  }
  if (playedUci === bestUci || (bestMoverCp >= 20000 && playedMoverCp >= 20000) || (cpLoss <= 8 && winLoss <= 0.8)) {
    return { tag: 'best', badge: '★', icon: '⭐', label: 'Best', color: '#2ecc71', cpLoss, winLoss };
  }
  return { tag: 'good', badge: '✓', icon: '👍', label: 'Good', color: '#84fab0', cpLoss, winLoss };
}
