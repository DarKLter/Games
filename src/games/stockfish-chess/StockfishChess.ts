import { ArcadeAudio } from '../../core/audio';
import { addXp, triggerGameOver, updateCoinsDisplay, updateInGameHud } from '../../core/runtimeBridge';
import { persistChessTime, playerState } from '../../core/storage';
import { Difficulty, GameInstance } from '../../core/types';
import { classifyChessMove, createGeniusChessEngine, MoveClassification } from './ChessEngine';
import { ChessBoardLike, ChessMoveVerbose, createChessInstance } from './ChessFallback';

const localChessAnalyzer = createGeniusChessEngine();

interface SkillProfile {
  skill: number;
  elo: number;
  eloLabel: string;
  limitStrength: boolean;
  depth: number;
  movetime: number;
  builtinDepth: number;
  mult: number;
}

interface MoveRecord extends MoveClassification {
  ply: number;
  moveNumber: number;
  san: string;
  from: string;
  to: string;
  fen: string;
  evalBefore: number;
  evalAfter: number;
  color: 'w' | 'b';
  badgeColor: string;
}

interface BoardSlot {
  cell: HTMLDivElement;
  pieceSpan: HTMLSpanElement;
  badgeSpan: HTMLSpanElement;
  markerDiv: HTMLDivElement;
}

export class StockfishChessGame implements GameInstance {
  level: number;
  diff: Difficulty;
  score = 0;
  lives = 3;
  maxLives = 3;
  isPaused = false;
  gameOver = false;
  endResult = { won: false, reason: 'Game Over' };
  cfg: SkillProfile;
  game: ChessBoardLike;
  viewGame: ChessBoardLike;
  playerColor: 'w' | 'b';
  baseTimeSec: number;
  whiteTime: number;
  blackTime: number;
  clockInterval: ReturnType<typeof setInterval> | null = null;
  lastClockTick = performance.now();
  selectedSq: string | null = null;
  legalTargets: ChessMoveVerbose[] = [];
  lastMove: { from: string; to: string } | null = null;
  dragStartSq: string | null = null;
  moveRecords: MoveRecord[] = [];
  viewIndex = -1;
  latestEngineCpWhite = 20;
  boardCells: BoardSlot[] = [];
  engineReady = false;
  engineThinking = false;
  pendingEngineMove = false;
  engineWatchdog: ReturnType<typeof setTimeout> | null = null;
  moveSafetyTimer: ReturnType<typeof setTimeout> | null = null;
  engineLabel = 'Stockfish 19';
  worker: Worker | null = null;
  analysisWorker: Worker | null = null;
  analysisBlobUrl: string | null = null;
  blobUrl: string | null = null;
  wasmBlobUrl: string | null = null;
  pendingAnalyses = 0;
  usingInThreadEngine = false;
  private stopped = false;
  private queuedBestMove: string | null = null;
  private pendingTimers = new Set<ReturnType<typeof setTimeout>>();

  constructor(lvl: number, diff: Difficulty) {
    this.level = lvl;
    this.diff = diff;

    // Normal Stockfish Elo strength settings across all 4 tiers (same Elos: 2750, 3100, 3450, 3750+)
    const skillMap: Record<Difficulty, SkillProfile> = {
      easy: { skill: 15, elo: 2750, eloLabel: '2750 Elo Master', limitStrength: true, depth: 12, movetime: 650, builtinDepth: 6, mult: 1 },
      medium: { skill: 18, elo: 3100, eloLabel: '3100 Elo GM', limitStrength: true, depth: 15, movetime: 950, builtinDepth: 8, mult: 2 },
      hard: { skill: 20, elo: 3450, eloLabel: '3450 Elo Super-GM', limitStrength: false, depth: 18, movetime: 1350, builtinDepth: 10, mult: 3 },
      extreme: { skill: 20, elo: 3750, eloLabel: '3750+ Elo Stockfish', limitStrength: false, depth: 22, movetime: 1900, builtinDepth: 12, mult: 5 }
    };
    this.cfg = skillMap[diff] || skillMap.easy;
    this.game = createChessInstance();
    this.viewGame = createChessInstance();
    this.playerColor = Math.random() < 0.5 ? 'w' : 'b';

    const timeSelEl = document.getElementById('chessTimeSelect') as HTMLSelectElement | null;
    if (timeSelEl) timeSelEl.value = String(playerState.selectedChessTimeSec || 600);
    this.baseTimeSec = parseInt(timeSelEl?.value || String(playerState.selectedChessTimeSec), 10) || 600;
    this.whiteTime = this.baseTimeSec;
    this.blackTime = this.baseTimeSec;
  }

  private initBoardDom(): void {
    const boardEl = document.getElementById('chessBoard');
    if (!boardEl) return;
    boardEl.innerHTML = '';
    this.boardCells = [];
    for (let i = 0; i < 64; i++) {
      const cell = document.createElement('div');
      cell.className = 'chess-sq light';
      const pieceSpan = document.createElement('span');
      pieceSpan.className = 'chess-piece w';
      const badgeSpan = document.createElement('span');
      badgeSpan.className = 'chess-sq-badge';
      badgeSpan.style.display = 'none';
      const markerDiv = document.createElement('div');
      markerDiv.style.display = 'none';
      cell.appendChild(pieceSpan);
      cell.appendChild(badgeSpan);
      cell.appendChild(markerDiv);

      cell.onpointerdown = (e) => {
        if (this.stopped || this.gameOver || this.isPaused) return;
        if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
        e.preventDefault();
        const sq = cell.dataset.sq || '';
        this.dragStartSq = sq;
        this.handleSquareClick(sq, false);
      };
      cell.onpointerup = (e) => {
        if (this.stopped || this.gameOver || this.isPaused) {
          this.dragStartSq = null;
          return;
        }
        const targetEl = document.elementFromPoint(e.clientX, e.clientY);
        const dropCell = targetEl?.closest('.chess-sq') as HTMLElement | null;
        const dropSq = dropCell?.dataset?.sq || cell.dataset.sq || '';
        if (this.dragStartSq && dropSq && dropSq !== this.dragStartSq) {
          this.handleSquareClick(dropSq, true);
        }
        this.dragStartSq = null;
      };
      boardEl.appendChild(cell);
      this.boardCells.push({ cell, pieceSpan, badgeSpan, markerDiv });
    }
  }

  private applyAnalysisResult(
    plyIdx: number,
    playedUci: string,
    isMateAfter: boolean,
    moverColor: 'w' | 'b',
    analysis: ReturnType<typeof localChessAnalyzer.analyzePositionMove>
  ): void {
    if (this.stopped) return;
    this.pendingAnalyses = Math.max(0, this.pendingAnalyses - 1);
    const rec = this.moveRecords[plyIdx];
    if (!rec) return;
    const sign = moverColor === 'w' ? 1 : -1;
    const cls = classifyChessMove(analysis, playedUci, isMateAfter);
    const evalAfterWhite = isMateAfter ? (moverColor === 'w' ? 30000 : -30000) : (analysis.playedMoverCp * sign);
    const evalBeforeWhite = analysis.bestMoverCp * sign;
    Object.assign(rec, cls, {
      color: moverColor,
      badgeColor: cls.color,
      evalBefore: evalBeforeWhite,
      evalAfter: evalAfterWhite
    });
    if (plyIdx === this.moveRecords.length - 1) {
      this.updateEvalBar(evalAfterWhite, isMateAfter, moverColor);
    }
    this.renderHistoryStrip();
    if (this.viewIndex === plyIdx) this.renderBoard();
    if (this.gameOver && document.getElementById('chessAnalysisOverlay')?.classList.contains('show')) {
      this.buildAnalysisReport();
    }
  }

  private initAnalysisWorker(): void {
    try {
      if (typeof Worker === 'undefined' || window.location.protocol === 'file:') {
        this.analysisWorker = null;
        return;
      }
      const workerSrc = `
        const engine = (${createGeniusChessEngine.toString()})();
        self.onmessage = function(e) {
          const d = e.data;
          if (!d || d.type !== 'analyze') return;
          const analysis = engine.analyzePositionMove(d.fenBefore, d.playedUci, d.depth || 5, d.budgetMs || 320);
          self.postMessage({ type: 'result', plyIdx: d.plyIdx, playedUci: d.playedUci, isMateAfter: d.isMateAfter, moverColor: d.moverColor, analysis });
        };
      `;
      const blob = new Blob([workerSrc], { type: 'application/javascript' });
      this.analysisBlobUrl = URL.createObjectURL(blob);
      this.analysisWorker = new Worker(this.analysisBlobUrl);
      this.analysisWorker.onmessage = (e) => {
        const msg = e.data;
        if (!msg || msg.type !== 'result') return;
        this.applyAnalysisResult(msg.plyIdx, msg.playedUci, msg.isMateAfter, msg.moverColor, msg.analysis);
      };
      this.analysisWorker.onerror = () => {
        if (this.analysisWorker) {
          this.analysisWorker.terminate();
          this.analysisWorker = null;
        }
      };
    } catch {
      this.analysisWorker = null;
    }
  }

  start(): void {
    playerState.sessionCoins = 0;
    playerState.sessionExp = 0;
    document.getElementById('chessGameUI')?.classList.add('show');
    document.getElementById('chessAnalysisOverlay')?.classList.remove('show');
    const openBtn = document.getElementById('chessOpenAnalysisBtn');
    if (openBtn) openBtn.style.display = 'none';
    const eloTag = document.getElementById('chessEloTag');
    if (eloTag) eloTag.textContent = this.cfg.eloLabel;
    document.getElementById('inGameHud')?.classList.add('show');
    const settingsBtn = document.getElementById('gameSettingsBtn');
    if (settingsBtn) settingsBtn.style.display = 'flex';
    updateCoinsDisplay();
    updateInGameHud(this.score, this.level, 6);
    this.initBoardDom();
    this.initAnalysisWorker();

    const newMatchBtn = document.getElementById('chessNewMatchBtn');
    if (newMatchBtn) {
      newMatchBtn.onclick = () => {
        ArcadeAudio.play('click');
        this.playerColor = Math.random() < 0.5 ? 'w' : 'b';
        this.resetBoard();
      };
    }
    const timeSel = document.getElementById('chessTimeSelect') as HTMLSelectElement | null;
    if (timeSel) {
      timeSel.onchange = () => {
        this.baseTimeSec = parseInt(timeSel.value, 10) || 600;
        persistChessTime(this.baseTimeSec);
        this.playerColor = Math.random() < 0.5 ? 'w' : 'b';
        this.resetBoard();
      };
    }
    const resignBtn = document.getElementById('chessResignBtn');
    if (resignBtn) resignBtn.onclick = () => { if (!this.stopped && !this.gameOver && !this.isPaused) this.finishMatch(false, '🏳️ You Resigned'); };
    const prevBtn = document.getElementById('chessPrevMoveBtn');
    if (prevBtn) prevBtn.onclick = () => this.stepHistory(-1);
    const nextBtn = document.getElementById('chessNextMoveBtn');
    if (nextBtn) nextBtn.onclick = () => this.stepHistory(1);
    const liveBtn = document.getElementById('chessLiveMoveBtn');
    if (liveBtn) liveBtn.onclick = () => this.jumpToMove(this.moveRecords.length - 1);

    const inspectBtn = document.getElementById('chessInspectBoardBtn');
    if (inspectBtn) {
      inspectBtn.onclick = () => {
        document.getElementById('chessAnalysisOverlay')?.classList.remove('show');
        const btn = document.getElementById('chessOpenAnalysisBtn');
        if (btn) btn.style.display = 'block';
      };
    }
    if (openBtn) {
      openBtn.onclick = () => {
        this.buildAnalysisReport();
        document.getElementById('chessAnalysisOverlay')?.classList.add('show');
      };
    }
    const claimBtn = document.getElementById('chessClaimFinishBtn');
    if (claimBtn) {
      claimBtn.onclick = () => {
        document.getElementById('chessAnalysisOverlay')?.classList.remove('show');
        this.stop();
        triggerGameOver(this.score, playerState.sessionCoins, this.level, 6, this.endResult.won);
      };
    }

    this.initEngine();
    this.startClockTimer();
    this.updateClockUI();
    this.renderHistoryStrip();
    this.renderBoard();
  }

  releaseInputs(): void {
    this.dragStartSq = null;
  }

  pause(): void {
    this.isPaused = true;
    this.releaseInputs();
  }

  resume(): void {
    this.isPaused = false;
    this.lastClockTick = performance.now();
    if (this.queuedBestMove && !this.stopped && !this.gameOver) {
      const mv = this.queuedBestMove;
      this.queuedBestMove = null;
      this.applyEngineBestMove(mv);
    } else if (!this.stopped && !this.gameOver && this.game.turn() !== this.playerColor && !this.engineThinking) {
      this.requestEngineMove();
    }
  }

  private applyEngineBestMove(moveStr: string): void {
    if (moveStr && moveStr !== '(none)' && !this.gameOver && !this.stopped) {
      const moverColor = this.game.turn();
      const fenBefore = this.game.fen();
      const move = this.game.move({
        from: moveStr.slice(0, 2),
        to: moveStr.slice(2, 4),
        promotion: moveStr.length > 4 ? moveStr[4] : 'q'
      });
      if (move) {
        this.lastMove = { from: move.from, to: move.to };
        this.recordPlayedMove(move, moverColor, fenBefore);
        if (this.game.in_check()) ArcadeAudio.play('chessCheck');
        else ArcadeAudio.play(move.captured ? 'chessCapture' : 'chessMove');
      }
    }
    this.updateClockUI();
    this.renderBoard();
    this.checkEndOrStatus();
  }

  private scheduleSafeTimeout(fn: () => void, ms: number): void {
    const id = setTimeout(() => {
      this.pendingTimers.delete(id);
      if (!this.stopped) fn();
    }, ms);
    this.pendingTimers.add(id);
  }

  stop(): void {
    this.stopped = true;
    this.dragStartSq = null;
    if (this.clockInterval) { clearInterval(this.clockInterval); this.clockInterval = null; }
    if (this.engineWatchdog) { clearTimeout(this.engineWatchdog); this.engineWatchdog = null; }
    if (this.moveSafetyTimer) { clearTimeout(this.moveSafetyTimer); this.moveSafetyTimer = null; }
    for (const id of this.pendingTimers) clearTimeout(id);
    this.pendingTimers.clear();
    if (this.worker) { this.worker.terminate(); this.worker = null; }
    if (this.analysisWorker) { this.analysisWorker.terminate(); this.analysisWorker = null; }
    if (this.blobUrl) { URL.revokeObjectURL(this.blobUrl); this.blobUrl = null; }
    if (this.analysisBlobUrl) { URL.revokeObjectURL(this.analysisBlobUrl); this.analysisBlobUrl = null; }
    if (this.wasmBlobUrl) { URL.revokeObjectURL(this.wasmBlobUrl); this.wasmBlobUrl = null; }
    for (const id of ['chessNewMatchBtn', 'chessResignBtn', 'chessPrevMoveBtn', 'chessNextMoveBtn', 'chessLiveMoveBtn', 'chessInspectBoardBtn', 'chessOpenAnalysisBtn', 'chessClaimFinishBtn']) {
      const el = document.getElementById(id);
      if (el) el.onclick = null;
    }
    const timeSelEl = document.getElementById('chessTimeSelect') as HTMLSelectElement | null;
    if (timeSelEl) timeSelEl.onchange = null;
    document.getElementById('chessAnalysisOverlay')?.classList.remove('show');
    document.getElementById('chessGameUI')?.classList.remove('show');
  }

  private startClockTimer(): void {
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.lastClockTick = performance.now();
    this.clockInterval = setInterval(() => {
      const now = performance.now();
      const dt = (now - this.lastClockTick) / 1000;
      this.lastClockTick = now;
      if (this.isPaused || this.gameOver) return;
      if (this.game.turn() === 'w') {
        this.whiteTime = Math.max(0, this.whiteTime - dt);
        if (this.whiteTime <= 0) {
          this.updateClockUI();
          const playerWon = this.playerColor === 'b';
          this.finishMatch(playerWon, playerWon ? '⏱️ Bot Flagged on Time!' : '⏱️ You Ran Out of Time!');
          return;
        }
      } else {
        this.blackTime = Math.max(0, this.blackTime - dt);
        if (this.blackTime <= 0) {
          this.updateClockUI();
          const playerWon = this.playerColor === 'w';
          this.finishMatch(playerWon, playerWon ? '⏱️ Bot Flagged on Time!' : '⏱️ You Ran Out of Time!');
          return;
        }
      }
      this.updateClockUI();
    }, 200);
  }

  private formatClock(sec: number): string {
    const s = Math.max(0, sec);
    if (s < 10) return `0:0${s.toFixed(1)}`;
    const mins = Math.floor(s / 60);
    const rem = Math.floor(s % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  }

  private updateClockUI(): void {
    const botTime = this.playerColor === 'w' ? this.blackTime : this.whiteTime;
    const playerTime = this.playerColor === 'w' ? this.whiteTime : this.blackTime;
    const botTurn = this.game.turn() !== this.playerColor && !this.gameOver;
    const playerTurn = this.game.turn() === this.playerColor && !this.gameOver;
    const botCard = document.getElementById('chessBotClockCard');
    const playerCard = document.getElementById('chessPlayerClockCard');
    const botLbl = document.getElementById('chessBotClockLabel');
    const plLbl = document.getElementById('chessPlayerClockLabel');
    const botClock = document.getElementById('chessBotClock');
    const plClock = document.getElementById('chessPlayerClock');
    if (botLbl) botLbl.textContent = `🤖 ${this.engineLabel} (${this.playerColor === 'w' ? 'Black' : 'White'})`;
    if (plLbl) plLbl.textContent = `👤 You (${this.playerColor === 'w' ? 'White' : 'Black'})`;
    if (botClock) botClock.textContent = this.formatClock(botTime);
    if (plClock) plClock.textContent = this.formatClock(playerTime);
    botCard?.classList.toggle('active-turn', botTurn);
    playerCard?.classList.toggle('active-turn', playerTurn);
    botCard?.classList.toggle('low-time', botTime <= 15);
    playerCard?.classList.toggle('low-time', playerTime <= 15);
  }

  private updateEvalBar(evalWhiteCp: number, isMate: boolean, moverColor: 'w' | 'b'): void {
    this.latestEngineCpWhite = evalWhiteCp;
    const evalEl = document.getElementById('chessEval');
    const fillEl = document.getElementById('chessEvalFill');
    if (!evalEl || !fillEl) return;
    if (isMate || Math.abs(evalWhiteCp) >= 20000) {
      const whiteAhead = isMate ? moverColor === 'w' : evalWhiteCp > 0;
      evalEl.textContent = whiteAhead ? '+M' : '-M';
      fillEl.style.height = whiteAhead ? '100%' : '0%';
    } else {
      const pawns = evalWhiteCp / 100;
      evalEl.textContent = `${pawns > 0 ? '+' : ''}${pawns.toFixed(2)}`;
      const clamped = Math.max(-10, Math.min(10, pawns));
      fillEl.style.height = `${50 + clamped * 5}%`;
    }
  }

  private recordPlayedMove(moveObj: ChessMoveVerbose, moverColor: 'w' | 'b', fenBefore: string): void {
    const fenAfter = this.game.fen();
    const isMate = this.game.in_checkmate();
    const playedUci = `${moveObj.from}${moveObj.to}${moveObj.promotion || ''}`;
    const sign = moverColor === 'w' ? 1 : -1;
    const quickAnalysis = localChessAnalyzer.analyzePositionMove(fenBefore, playedUci, 3, 55);
    const cls = classifyChessMove(quickAnalysis, playedUci, isMate);
    const evalAfterWhite = isMate ? (moverColor === 'w' ? 30000 : -30000) : quickAnalysis.playedMoverCp * sign;
    const evalBeforeWhite = quickAnalysis.bestMoverCp * sign;
    this.updateEvalBar(evalAfterWhite, isMate, moverColor);

    const plyIdx = this.moveRecords.length;
    const ply = plyIdx + 1;
    const moveNumber = Math.ceil(ply / 2);
    const san = moveObj.san || `${moveObj.from}-${moveObj.to}`;
    this.moveRecords.push({
      ply, moveNumber, san, from: moveObj.from, to: moveObj.to, fen: fenAfter,
      evalBefore: evalBeforeWhite, evalAfter: evalAfterWhite, ...cls, color: moverColor, badgeColor: cls.color
    });
    this.viewIndex = this.moveRecords.length - 1;
    this.renderHistoryStrip();

    if (this.analysisWorker) {
      this.pendingAnalyses++;
      this.analysisWorker.postMessage({
        type: 'analyze', plyIdx, fenBefore, playedUci, isMateAfter: isMate, moverColor, depth: 5, budgetMs: 320
      });
    } else {
      this.pendingAnalyses++;
      this.scheduleSafeTimeout(() => {
        if (!this.moveRecords[plyIdx]) return;
        const analysis = localChessAnalyzer.analyzePositionMove(fenBefore, playedUci, 4, 150);
        this.applyAnalysisResult(plyIdx, playedUci, isMate, moverColor, analysis);
      }, 15);
    }
  }

  private isViewingLive(): boolean {
    return this.viewIndex === this.moveRecords.length - 1;
  }

  stepHistory(delta: number): void {
    if (!this.moveRecords.length) return;
    this.jumpToMove(Math.max(-1, Math.min(this.moveRecords.length - 1, this.viewIndex + delta)));
  }

  private jumpToMove(index: number): void {
    if (!this.moveRecords.length) return;
    this.viewIndex = Math.max(-1, Math.min(this.moveRecords.length - 1, index));
    this.selectedSq = null;
    this.legalTargets = [];
    this.renderHistoryStrip();
    this.renderBoard();
    this.updateStatus();
  }

  private renderHistoryStrip(): void {
    const strip = document.getElementById('chessMovesStrip');
    const prevBtn = document.getElementById('chessPrevMoveBtn') as HTMLButtonElement | null;
    const nextBtn = document.getElementById('chessNextMoveBtn') as HTMLButtonElement | null;
    const liveBtn = document.getElementById('chessLiveMoveBtn') as HTMLButtonElement | null;
    if (prevBtn) prevBtn.disabled = this.viewIndex < 0;
    if (nextBtn) nextBtn.disabled = this.viewIndex >= this.moveRecords.length - 1;
    if (liveBtn) liveBtn.disabled = this.viewIndex >= this.moveRecords.length - 1;
    if (!strip) return;
    if (!this.moveRecords.length) {
      strip.innerHTML = '<span style="opacity:0.6;">No moves yet</span>';
      return;
    }
    strip.innerHTML = '';
    this.moveRecords.forEach((rec, idx) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'chess-move-pill' + (idx === this.viewIndex ? ' active-ply' : '');
      const prefix = rec.color === 'w' ? `${rec.moveNumber}.` : `${rec.moveNumber}...`;
      pill.innerHTML = `<span>${prefix}${rec.san}</span><span style="color:${rec.badgeColor || '#84fab0'};">${rec.icon}</span>`;
      pill.onclick = () => this.jumpToMove(idx);
      strip.appendChild(pill);
    });
    const activeEl = strip.querySelector('.active-ply');
    if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 6000): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  private createInThreadUciWorker(): Worker {
    this.usingInThreadEngine = true;
    const listeners = {
      onmessage: null as ((ev: MessageEvent) => void) | null,
      onerror: null as ((ev: ErrorEvent) => void) | null
    };
    const emit = (data: string) => {
      setTimeout(() => {
        if (!cancelled) listeners.onmessage?.({ data } as MessageEvent);
      }, 0);
    };
    const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    let skillLevel = this.cfg.skill;
    const builtinDepth = Math.min(this.cfg.builtinDepth, 5);
    let currentFen = START_FEN;
    let currentRepHashes: number[] = [];

    const boardToFen = (st: ReturnType<typeof localChessAnalyzer.parseFen>) => {
      const chars = ['', 'P', 'N', 'B', 'R', 'Q', 'K'];
      let fen = '';
      for (let r = 0; r < 8; r++) {
        let empty = 0;
        for (let c = 0; c < 8; c++) {
          const p = st.b[r * 8 + c];
          if (!p) empty++;
          else {
            if (empty) { fen += empty; empty = 0; }
            const ch = chars[Math.abs(p)];
            fen += p > 0 ? ch : ch.toLowerCase();
          }
        }
        if (empty) fen += empty;
        if (r < 7) fen += '/';
      }
      let cs = '';
      if (st.castle & 1) cs += 'K';
      if (st.castle & 2) cs += 'Q';
      if (st.castle & 4) cs += 'k';
      if (st.castle & 8) cs += 'q';
      if (!cs) cs = '-';
      const ep = st.ep >= 0 ? (String.fromCharCode(97 + (st.ep & 7)) + (8 - (st.ep >> 3))) : '-';
      return `${fen} ${st.turn === 1 ? 'w' : 'b'} ${cs} ${ep} 0 1`;
    };

    let cancelled = false;
    const shim = {
      set onmessage(fn: ((ev: MessageEvent) => void) | null) { listeners.onmessage = fn; },
      get onmessage() { return listeners.onmessage; },
      set onerror(fn: ((ev: ErrorEvent) => void) | null) { listeners.onerror = fn; },
      get onerror() { return listeners.onerror; },
      terminate() { cancelled = true; },
      postMessage(rawCmd: string) {
        if (cancelled) return;
        const cmd = (rawCmd || '').trim();
        if (cmd === 'uci') {
          emit('id name Stockfish');
          emit('uciok');
        } else if (cmd === 'isready') {
          emit('readyok');
        } else if (cmd.startsWith('setoption name Skill Level value ')) {
          skillLevel = parseInt(cmd.split(' ').pop() || '', 10) || skillLevel;
        } else if (cmd.startsWith('position ')) {
          const mIdx = cmd.indexOf(' moves ');
          const posPart = mIdx >= 0 ? cmd.slice(9, mIdx).trim() : cmd.slice(9).trim();
          const baseFen = posPart === 'startpos' ? START_FEN : (posPart.startsWith('fen ') ? posPart.slice(4).trim() : START_FEN);
          currentRepHashes = [];
          let st = localChessAnalyzer.parseFen(baseFen);
          const seen = new Map<number, number>();
          seen.set(localChessAnalyzer.hashKey(st), 1);
          if (mIdx >= 0) {
            const movesStr = cmd.slice(mIdx + 7).trim().split(/\s+/);
            for (const mv of movesStr) {
              const mo = localChessAnalyzer.uciToMoveObj(st, mv);
              if (!mo) break;
              st = localChessAnalyzer.applyMove(st, mo);
              const kh = localChessAnalyzer.hashKey(st);
              const cnt = (seen.get(kh) || 0) + 1;
              seen.set(kh, cnt);
              if (cnt >= 2) currentRepHashes.push(kh);
            }
            currentFen = boardToFen(st);
          } else {
            currentFen = baseFen;
          }
        } else if (cmd.startsWith('go ')) {
          setTimeout(() => {
            if (cancelled) return;
            const mtMatch = cmd.match(/movetime (\d+)/);
            const budget = Math.min(mtMatch ? parseInt(mtMatch[1], 10) : 700, 700);
            const dMatch = cmd.match(/depth (\d+)/);
            const targetDepth = dMatch ? Math.min(builtinDepth, parseInt(dMatch[1], 10)) : builtinDepth;
            const res = localChessAnalyzer.findBestMove(currentFen, targetDepth, budget, skillLevel, currentRepHashes);
            if (Math.abs(res.scoreCp) >= 28000) {
              const mateIn = Math.max(1, Math.ceil((30000 - Math.abs(res.scoreCp)) / 2));
              emit(`info depth ${res.depth} score mate ${res.scoreCp > 0 ? mateIn : -mateIn}`);
            } else {
              emit(`info depth ${res.depth} score cp ${Math.round(res.scoreCp)}`);
            }
            emit(`bestmove ${res.bestUci}`);
          }, 25);
        }
      }
    };
    return shim as unknown as Worker;
  }

  private createBuiltinUciWorker(): Worker {
    try {
      if (typeof Worker === 'undefined' || window.location.protocol === 'file:') {
        return this.createInThreadUciWorker();
      }
      this.usingInThreadEngine = false;
      const blob = new Blob([`
        const engine = (${createGeniusChessEngine.toString()})();
        const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        let skillLevel = ${this.cfg.skill};
        let builtinDepth = ${this.cfg.builtinDepth};
        let currentFen = START_FEN;
        let currentRepHashes = [];
        function boardToFen(st) {
          const chars = ['', 'P', 'N', 'B', 'R', 'Q', 'K'];
          let fen = '';
          for (let r = 0; r < 8; r++) {
            let empty = 0;
            for (let c = 0; c < 8; c++) {
              const p = st.b[r * 8 + c];
              if (!p) empty++;
              else { if (empty) { fen += empty; empty = 0; } const ch = chars[Math.abs(p)]; fen += p > 0 ? ch : ch.toLowerCase(); }
            }
            if (empty) fen += empty;
            if (r < 7) fen += '/';
          }
          let cs = '';
          if (st.castle & 1) cs += 'K';
          if (st.castle & 2) cs += 'Q';
          if (st.castle & 4) cs += 'k';
          if (st.castle & 8) cs += 'q';
          if (!cs) cs = '-';
          const ep = st.ep >= 0 ? (String.fromCharCode(97 + (st.ep & 7)) + (8 - (st.ep >> 3))) : '-';
          return fen + ' ' + (st.turn === 1 ? 'w' : 'b') + ' ' + cs + ' ' + ep + ' 0 1';
        }
        self.onmessage = function(e) {
          const cmd = (e.data || "").trim();
          if (cmd === "uci") { self.postMessage("id name Stockfish"); self.postMessage("uciok"); }
          else if (cmd === "isready") { self.postMessage("readyok"); }
          else if (cmd.indexOf("setoption name Skill Level value ") === 0) {
            skillLevel = parseInt(cmd.split(" ").pop(), 10) || ${this.cfg.skill};
          } else if (cmd.indexOf("position ") === 0) {
            const mIdx = cmd.indexOf(" moves ");
            const posPart = mIdx >= 0 ? cmd.slice(9, mIdx).trim() : cmd.slice(9).trim();
            const baseFen = posPart === "startpos" ? START_FEN : (posPart.indexOf("fen ") === 0 ? posPart.slice(4).trim() : START_FEN);
            currentRepHashes = [];
            let st = engine.parseFen(baseFen);
            const seen = new Map();
            seen.set(engine.hashKey(st), 1);
            if (mIdx >= 0) {
              const movesStr = cmd.slice(mIdx + 7).trim().split(/\\s+/);
              for (let i = 0; i < movesStr.length; i++) {
                const mo = engine.uciToMoveObj(st, movesStr[i]);
                if (!mo) break;
                st = engine.applyMove(st, mo);
                const kh = engine.hashKey(st);
                const cnt = (seen.get(kh) || 0) + 1;
                seen.set(kh, cnt);
                if (cnt >= 2) currentRepHashes.push(kh);
              }
              currentFen = boardToFen(st);
            } else {
              currentFen = baseFen;
            }
          } else if (cmd.indexOf("go ") === 0) {
            const mtMatch = cmd.match(/movetime (\\d+)/);
            const budget = mtMatch ? parseInt(mtMatch[1], 10) : 950;
            const dMatch = cmd.match(/depth (\\d+)/);
            const targetDepth = dMatch ? Math.min(builtinDepth, parseInt(dMatch[1], 10)) : builtinDepth;
            const res = engine.findBestMove(currentFen, targetDepth, budget, skillLevel, currentRepHashes);
            if (Math.abs(res.scoreCp) >= 28000) {
              const mateIn = Math.max(1, Math.ceil((30000 - Math.abs(res.scoreCp)) / 2));
              self.postMessage("info depth " + res.depth + " score mate " + (res.scoreCp > 0 ? mateIn : -mateIn));
            } else {
              self.postMessage("info depth " + res.depth + " score cp " + Math.round(res.scoreCp));
            }
            self.postMessage("bestmove " + res.bestUci);
          }
        };
      `], { type: 'application/javascript' });
      this.blobUrl = URL.createObjectURL(blob);
      return new Worker(this.blobUrl);
    } catch {
      return this.createInThreadUciWorker();
    }
  }

  private async createStockfishWorker(): Promise<Worker> {
    if (typeof Worker === 'undefined' || window.location.protocol === 'file:') {
      this.engineLabel = 'Stockfish Engine';
      return this.createBuiltinUciWorker();
    }
    const tryWasmMirror = async (cdnBase: string): Promise<Worker> => {
      const [jsResp, wasmResp] = await Promise.all([
        this.fetchWithTimeout(`${cdnBase}/stockfish-19-lite-single.js`, {}, 6000),
        this.fetchWithTimeout(`${cdnBase}/stockfish-19-lite-single.wasm`, {}, 6000)
      ]);
      if (!jsResp.ok || !wasmResp.ok) throw new Error('WASM fetch failed');
      const [jsText, wasmBuffer] = await Promise.all([jsResp.text(), wasmResp.arrayBuffer()]);
      this.wasmBlobUrl = URL.createObjectURL(new Blob([wasmBuffer], { type: 'application/wasm' }));
      const workerBlob = new Blob([jsText], { type: 'application/javascript' });
      this.blobUrl = URL.createObjectURL(workerBlob);
      this.engineLabel = 'Stockfish 19';
      return new Worker(`${this.blobUrl}#${encodeURIComponent(this.wasmBlobUrl)},worker`);
    };

    try {
      return await tryWasmMirror('https://unpkg.com/stockfish@19.0.1/bin');
    } catch {
      this.engineLabel = 'Stockfish Engine';
      return this.createBuiltinUciWorker();
    }
  }

  private fallbackToBuiltinEngine(): void {
    if (this.engineWatchdog) { clearTimeout(this.engineWatchdog); this.engineWatchdog = null; }
    if (this.worker) { this.worker.terminate(); this.worker = null; }
    this.engineLabel = 'Stockfish Engine';
    this.worker = this.engineLabel === 'Stockfish Engine' && !this.usingInThreadEngine && typeof Worker !== 'undefined'
      ? this.createBuiltinUciWorker()
      : this.createInThreadUciWorker();
    this.bindWorkerHandlers();
    this.worker.postMessage('uci');
  }

  private bindWorkerHandlers(): void {
    if (!this.worker || this.stopped) return;
    this.worker.onmessage = (e) => {
      if (this.stopped) return;
      const line = typeof e.data === 'string' ? e.data : '';
      if (!line) return;
      if (line === 'uciok') {
        this.worker?.postMessage('setoption name Hash value 32');
        this.worker?.postMessage(`setoption name Skill Level value ${this.cfg.skill}`);
        if (this.cfg.limitStrength) {
          this.worker?.postMessage('setoption name UCI_LimitStrength value true');
          this.worker?.postMessage(`setoption name UCI_Elo value ${this.cfg.elo}`);
        } else {
          this.worker?.postMessage('setoption name UCI_LimitStrength value false');
        }
        this.worker?.postMessage('isready');
      } else if (line === 'readyok') {
        if (this.engineWatchdog) { clearTimeout(this.engineWatchdog); this.engineWatchdog = null; }
        if (!this.engineReady) {
          this.engineReady = true;
          this.updateStatus();
          if (this.pendingEngineMove || this.game.turn() !== this.playerColor) {
            this.pendingEngineMove = false;
            this.requestEngineMove();
          }
        }
      } else if (line.startsWith('info ') && line.includes(' score ')) {
        this.parseEval(line);
      } else if (line.startsWith('bestmove ')) {
        if (this.moveSafetyTimer) { clearTimeout(this.moveSafetyTimer); this.moveSafetyTimer = null; }
        this.engineThinking = false;
        const moveStr = line.split(' ')[1];
        if (this.isPaused) {
          if (moveStr && moveStr !== '(none)' && !this.gameOver) {
            this.queuedBestMove = moveStr;
          }
          return;
        }
        this.applyEngineBestMove(moveStr);
      }
    };
    this.worker.onerror = () => {
      if (this.engineLabel !== 'Stockfish Engine') {
        this.fallbackToBuiltinEngine();
      } else if (!this.usingInThreadEngine) {
        if (this.worker) { this.worker.terminate(); this.worker = null; }
        this.worker = this.createInThreadUciWorker();
        this.bindWorkerHandlers();
        this.worker.postMessage('uci');
      }
    };
  }

  private async initEngine(): Promise<void> {
    this.updateStatus();
    let w: Worker;
    try {
      w = await this.createStockfishWorker();
    } catch {
      this.engineLabel = 'Stockfish Engine';
      w = this.createBuiltinUciWorker();
    }
    if (this.stopped) {
      w.terminate();
      return;
    }
    this.worker = w;
    this.bindWorkerHandlers();
    this.engineWatchdog = setTimeout(() => {
      if (!this.engineReady && !this.usingInThreadEngine) {
        if (this.engineLabel !== 'Stockfish Engine') this.fallbackToBuiltinEngine();
        else {
          if (this.worker) { this.worker.terminate(); this.worker = null; }
          this.worker = this.createInThreadUciWorker();
          this.bindWorkerHandlers();
          this.worker.postMessage('uci');
        }
      }
    }, 3500);
    this.worker.postMessage('uci');
  }

  private parseEval(line: string): void {
    const cpMatch = line.match(/\bscore cp (-?\d+)/);
    const mateMatch = line.match(/\bscore mate (-?\d+)/);
    const mult = this.game.turn() === 'w' ? 1 : -1;
    const evalEl = document.getElementById('chessEval');
    const fillEl = document.getElementById('chessEvalFill');
    if (!evalEl || !fillEl) return;
    if (mateMatch) {
      const m = parseInt(mateMatch[1], 10) * mult;
      this.latestEngineCpWhite = m > 0 ? 30000 : -30000;
      evalEl.textContent = `M${Math.abs(m)}`;
      fillEl.style.height = m > 0 ? '100%' : '0%';
    } else if (cpMatch) {
      const cpWhite = parseInt(cpMatch[1], 10) * mult;
      this.latestEngineCpWhite = cpWhite;
      const pawns = cpWhite / 100;
      evalEl.textContent = `${pawns > 0 ? '+' : ''}${pawns.toFixed(2)}`;
      const clamped = Math.max(-10, Math.min(10, pawns));
      fillEl.style.height = `${50 + clamped * 5}%`;
    }
  }

  private requestEngineMove(): void {
    if (this.stopped || this.game.game_over() || this.isPaused || this.gameOver) return;
    if (!this.engineReady || !this.worker) {
      this.pendingEngineMove = true;
      this.updateStatus();
      return;
    }
    this.engineThinking = true;
    this.updateStatus();
    this.updateClockUI();
    this.worker.postMessage('stop');
    const uciMoves = this.game.history({ verbose: true }).map((m) => `${m.from}${m.to}${m.promotion || ''}`);
    this.worker.postMessage(uciMoves.length ? `position startpos moves ${uciMoves.join(' ')}` : 'position startpos');
    const botTimeSec = this.playerColor === 'w' ? this.blackTime : this.whiteTime;
    const moveTime = botTimeSec < 18 ? Math.min(this.cfg.movetime, Math.max(250, Math.floor(botTimeSec * 80))) : this.cfg.movetime;
    this.worker.postMessage(`go depth ${this.cfg.depth} movetime ${moveTime}`);
    if (this.moveSafetyTimer) clearTimeout(this.moveSafetyTimer);
    this.moveSafetyTimer = setTimeout(() => {
      if (this.engineThinking && !this.gameOver) {
        this.engineThinking = false;
        if (this.engineLabel !== 'Stockfish Engine') {
          this.pendingEngineMove = true;
          this.fallbackToBuiltinEngine();
        } else {
          this.updateStatus();
        }
      }
    }, moveTime + 5000);
  }

  private fenToBoardHelper(fen: string): { board: () => ({ type: string; color: 'w' | 'b' } | null)[][] } {
    const rows = fen.split(' ')[0].split('/');
    const grid: ({ type: string; color: 'w' | 'b' } | null)[][] = [];
    for (let r = 0; r < 8; r++) {
      const row: ({ type: string; color: 'w' | 'b' } | null)[] = [];
      for (let i = 0; i < rows[r].length; i++) {
        const ch = rows[r][i];
        if (ch >= '1' && ch <= '8') {
          const n = parseInt(ch, 10);
          for (let k = 0; k < n; k++) row.push(null);
        } else {
          row.push({ type: ch.toLowerCase(), color: ch === ch.toUpperCase() ? 'w' : 'b' });
        }
      }
      grid.push(row);
    }
    return { board: () => grid };
  }

  private renderBoard(): void {
    if (!this.boardCells || this.boardCells.length !== 64) this.initBoardDom();
    const symbols: Record<'w' | 'b', Record<string, string>> = {
      w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
      b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
    };
    const viewingLive = this.isViewingLive();
    const viewedRec = this.viewIndex >= 0 && this.moveRecords[this.viewIndex] ? this.moveRecords[this.viewIndex] : null;
    let activeBoardObj: { board: () => ({ type: string; color: 'w' | 'b' } | null)[][] } = this.game;
    let activeLastMove = this.lastMove;
    if (!viewingLive) {
      if (this.viewIndex === -1) {
        this.viewGame.reset();
        activeBoardObj = this.viewGame;
        activeLastMove = null;
      } else if (viewedRec) {
        if (typeof this.viewGame.load === 'function') {
          this.viewGame.load(viewedRec.fen);
          activeBoardObj = this.viewGame;
        } else {
          activeBoardObj = this.fenToBoardHelper(viewedRec.fen);
        }
        activeLastMove = { from: viewedRec.from, to: viewedRec.to };
      }
    }
    const board = activeBoardObj.board();
    const ranks = this.playerColor === 'w' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
    const files = this.playerColor === 'w' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
    const isCheckNow = viewingLive && this.game.in_check();
    const turnNow = this.game.turn();

    let idx = 0;
    for (const r of ranks) {
      for (const f of files) {
        const sq = 'abcdefgh'[f] + (8 - r);
        const slot = this.boardCells[idx++];
        if (!slot) continue;
        const { cell, pieceSpan, badgeSpan, markerDiv } = slot;
        let cls = `chess-sq ${(r + f) % 2 === 0 ? 'light' : 'dark'}`;
        if (activeLastMove && (sq === activeLastMove.from || sq === activeLastMove.to)) cls += ' last-move';
        if (viewingLive && this.selectedSq === sq) cls += ' selected';
        const piece = board[r][f];
        if (piece) {
          if (isCheckNow && piece.type === 'k' && piece.color === turnNow) cls += ' in-check';
          pieceSpan.className = `chess-piece ${piece.color}`;
          pieceSpan.textContent = symbols[piece.color][piece.type] || '';
        } else {
          pieceSpan.textContent = '';
        }
        if (cell.className !== cls) cell.className = cls;
        cell.dataset.sq = sq;
        if (viewedRec && sq === viewedRec.to && viewedRec.badge) {
          badgeSpan.style.display = 'inline-block';
          badgeSpan.style.background = viewedRec.badgeColor || '#2ecc71';
          badgeSpan.textContent = viewedRec.badge;
        } else {
          badgeSpan.style.display = 'none';
        }
        if (viewingLive && this.legalTargets.some((m) => m.to === sq)) {
          markerDiv.style.display = 'block';
          markerDiv.className = piece ? 'chess-ring' : 'chess-dot';
        } else {
          markerDiv.style.display = 'none';
          markerDiv.className = '';
        }
      }
    }
  }

  private tryPlayerMove(fromSq: string, toSq: string): boolean {
    if (!this.isViewingLive()) return false;
    const moverColor = this.game.turn();
    const fenBefore = this.game.fen();
    const move = this.game.move({ from: fromSq, to: toSq, promotion: 'q' });
    if (!move) return false;
    if (this.game.in_check()) ArcadeAudio.play('chessCheck');
    else ArcadeAudio.play(move.captured ? 'chessCapture' : 'chessMove');
    this.lastMove = { from: move.from, to: move.to };
    this.selectedSq = null;
    this.legalTargets = [];
    this.recordPlayedMove(move, moverColor, fenBefore);

    const capturePoints: Record<string, number> = { p: 10, n: 30, b: 30, r: 50, q: 90 };
    this.score += (move.captured ? (capturePoints[move.captured] || 10) : 5) * this.cfg.mult;
    if (move.captured) {
      ArcadeAudio.play('coin');
      const coinsEarned = this.cfg.mult;
      playerState.totalCoins += coinsEarned;
      playerState.sessionCoins += coinsEarned;
      addXp(5 * this.cfg.mult);
      updateCoinsDisplay();
    }
    updateInGameHud(this.score, this.level, 6);
    this.updateClockUI();
    this.renderBoard();
    if (!this.checkEndOrStatus()) this.scheduleSafeTimeout(() => this.requestEngineMove(), 80);
    return true;
  }

  handleSquareClick(sq: string, isDrop = false): void {
    if (this.gameOver || !this.isViewingLive() || this.engineThinking || this.isPaused || this.game.game_over() || this.game.turn() !== this.playerColor) return;
    if (this.selectedSq) {
      if (this.selectedSq === sq && !isDrop) {
        this.selectedSq = null;
        this.legalTargets = [];
        this.renderBoard();
        return;
      }
      if (this.tryPlayerMove(this.selectedSq, sq)) return;
    }
    if (isDrop) return;
    const piece = this.game.get(sq);
    if (piece && piece.color === this.playerColor) {
      this.selectedSq = sq;
      this.legalTargets = this.game.moves({ square: sq, verbose: true });
      ArcadeAudio.play('click');
    } else {
      this.selectedSq = null;
      this.legalTargets = [];
    }
    this.renderBoard();
  }

  private resetBoard(): void {
    if (this.worker) this.worker.postMessage('stop');
    this.engineThinking = false;
    this.pendingEngineMove = false;
    this.queuedBestMove = null;
    this.gameOver = false;
    this.game.reset();
    this.selectedSq = null;
    this.legalTargets = [];
    this.lastMove = null;
    this.moveRecords = [];
    this.viewIndex = -1;
    this.whiteTime = this.baseTimeSec;
    this.blackTime = this.baseTimeSec;
    document.getElementById('chessAnalysisOverlay')?.classList.remove('show');
    const openBtn = document.getElementById('chessOpenAnalysisBtn');
    if (openBtn) openBtn.style.display = 'none';
    const evalEl = document.getElementById('chessEval');
    if (evalEl) evalEl.textContent = '0.00';
    const fillEl = document.getElementById('chessEvalFill');
    if (fillEl) fillEl.style.height = '50%';
    this.updateClockUI();
    this.renderHistoryStrip();
    this.renderBoard();
    this.updateStatus();
    if (this.playerColor === 'b') this.scheduleSafeTimeout(() => this.requestEngineMove(), 150);
  }

  private updateStatus(): void {
    const el = document.getElementById('chessStatus');
    if (!el) return;
    if (this.gameOver) el.textContent = this.endResult.reason;
    else if (!this.isViewingLive()) el.textContent = `📜 Viewing ${this.viewIndex < 0 ? 'Start' : `Move #${this.viewIndex + 1}`} (Tap ⏭)`;
    else if (this.engineThinking) el.textContent = `🤔 ${this.engineLabel} thinking...`;
    else if (this.game.turn() !== this.playerColor) el.textContent = `⏳ Waiting for ${this.engineLabel}...`;
    else el.textContent = `🎲 Your Turn (${this.playerColor === 'w' ? 'White ♔' : 'Black ♚'})`;
  }

  private buildAnalysisReport(): void {
    const categories = [
      { tag: 'brilliant', icon: '💎', label: 'Brilliant (!!)', color: '#1abc9c' },
      { tag: 'great', icon: '❗', label: 'Great (!)', color: '#3498db' },
      { tag: 'best', icon: '⭐', label: 'Best', color: '#2ecc71' },
      { tag: 'good', icon: '👍', label: 'Good', color: '#84fab0' },
      { tag: 'inaccuracy', icon: '⚠️', label: 'Inaccuracy (?!)', color: '#f1c40f' },
      { tag: 'mistake', icon: '❓', label: 'Mistake (?)', color: '#e67e22' },
      { tag: 'blunder', icon: '💥', label: 'Blunder (??)', color: '#e74c3c' }
    ];
    const playerMoves = this.moveRecords.filter((m) => m.color === this.playerColor);
    const botMoves = this.moveRecords.filter((m) => m.color !== this.playerColor);
    const calcAcc = (list: MoveRecord[]) => {
      if (!list.length) return 100;
      const avgWinLoss = list.reduce((s, m) => s + (m.winLoss !== undefined ? m.winLoss : Math.min(35, m.cpLoss / 8)), 0) / list.length;
      const acc = Math.round(103.1668 * Math.exp(-0.04354 * avgWinLoss) - 3.1669);
      return Math.max(0, Math.min(100, acc));
    };

    const head = document.getElementById('chessAnalysisHeadline');
    if (head) head.textContent = this.endResult.won ? `🏆 Victory — ${this.endResult.reason}` : `📊 Match Over — ${this.endResult.reason}`;
    const sub = document.getElementById('chessAnalysisSub');
    if (sub) sub.textContent = `Opponent: ${this.engineLabel} (${this.cfg.eloLabel}) · ${this.moveRecords.length} Plies`;
    const botLbl = document.getElementById('chessBotAccLabel');
    if (botLbl) botLbl.textContent = `${this.engineLabel.toUpperCase()} ACCURACY`;
    const pAcc = document.getElementById('chessPlayerAcc');
    if (pAcc) pAcc.textContent = `${calcAcc(playerMoves)}%`;
    const bAcc = document.getElementById('chessBotAcc');
    if (bAcc) bAcc.textContent = `${calcAcc(botMoves)}%`;

    const grid = document.getElementById('chessClassBreakdown');
    if (grid) {
      grid.innerHTML = `<div class="chess-class-row" style="font-weight:900; color:#aaa; border-bottom:1px solid rgba(255,255,255,0.12);"><span>YOU</span><span style="text-align:center;">MOVE QUALITY</span><span style="text-align:right;">BOT</span></div>`;
      categories.forEach((cat) => {
        const pCount = playerMoves.filter((m) => m.tag === cat.tag).length;
        const bCount = botMoves.filter((m) => m.tag === cat.tag).length;
        const row = document.createElement('div');
        row.className = 'chess-class-row';
        row.innerHTML = `<strong style="color:${cat.color};">${pCount}</strong><span style="text-align:center; color:${cat.color}; font-weight:800;">${cat.icon} ${cat.label}</span><strong style="text-align:right; color:${cat.color};">${bCount}</strong>`;
        grid.appendChild(row);
      });
    }

    const listEl = document.getElementById('chessReviewMoveList');
    if (listEl) {
      listEl.innerHTML = '';
      if (!this.moveRecords.length) {
        listEl.innerHTML = '<div style="text-align:center; opacity:0.6; padding:8px;">No moves played in this game.</div>';
      } else {
        this.moveRecords.forEach((rec, idx) => {
          const who = rec.color === this.playerColor ? 'You' : 'Bot';
          const evalAfterStr = `${rec.evalAfter >= 0 ? '+' : ''}${(rec.evalAfter / 100).toFixed(2)}`;
          const item = document.createElement('button');
          item.type = 'button';
          item.className = 'chess-review-item';
          item.innerHTML = `<span><strong>${rec.moveNumber}${rec.color === 'w' ? '.' : '...'} ${rec.san}</strong> <span style="opacity:0.7;">(${who})</span></span><span style="color:${rec.badgeColor || '#84fab0'}; font-weight:800;">${rec.icon} ${rec.label} (${evalAfterStr})</span>`;
          item.onclick = () => {
            document.getElementById('chessAnalysisOverlay')?.classList.remove('show');
            const openBtn = document.getElementById('chessOpenAnalysisBtn');
            if (openBtn) openBtn.style.display = 'block';
            this.jumpToMove(idx);
          };
          listEl.appendChild(item);
        });
      }
    }
  }

  private finishMatch(playerWon: boolean, reason: string): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.engineThinking = false;
    ArcadeAudio.stopBgm();
    ArcadeAudio.play(playerWon ? 'win' : 'gameover');
    document.body.dataset.state = 'gameover';
    if (this.worker) this.worker.postMessage('stop');
    this.endResult = { won: playerWon, reason };
    if (playerWon) {
      const bonus = 50 * this.cfg.mult;
      this.score += 250 * this.cfg.mult;
      playerState.totalCoins += bonus;
      playerState.sessionCoins += bonus;
      addXp(100 * this.cfg.mult);
      updateCoinsDisplay();
      updateInGameHud(this.score, this.level, 6);
    }
    this.updateClockUI();
    this.updateStatus();
    this.buildAnalysisReport();
    document.getElementById('chessAnalysisOverlay')?.classList.add('show');
  }

  private checkEndOrStatus(): boolean {
    if (this.game.in_checkmate()) {
      const playerWon = this.game.turn() !== this.playerColor;
      this.finishMatch(playerWon, playerWon ? '♔ Checkmate — You Win!' : '♚ Checkmate — Bot Wins!');
      return true;
    }
    if (this.game.in_draw()) {
      this.finishMatch(false, '🤝 Draw Game');
      return true;
    }
    this.updateStatus();
    return false;
  }
}
