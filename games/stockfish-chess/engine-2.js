(function(ArcadeMod){
// === MODULE: src/games/stockfish-chess/StockfishChess ===
ArcadeMod.define("src/games/stockfish-chess/StockfishChess", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "StockfishChessGame", {
    enumerable: true,
    get: function() {
        return StockfishChessGame;
    }
});
var _audio = require("../../core/audio");
var _runtimeBridge = require("../../core/runtimeBridge");
var _storage = require("../../core/storage");
var _ChessEngine = require("./ChessEngine");
var _ChessFallback = require("./ChessFallback");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) resolve(value);
    else Promise.resolve(value).then(_next, _throw);
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _create_for_of_iterator_helper_loose(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (it) return (it = it.call(o)).next.bind(it);
    if (Array.isArray(o) || (it = _unsupported_iterable_to_array(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        return function() {
            if (i >= o.length) return {
                done: true
            };
            return {
                done: false,
                value: o[i++]
            };
        };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _extends() {
    _extends = Object.assign || function assign(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source)if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
function _ts_generator(thisArg, body) {
    var f, y, t, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype), d = Object.defineProperty;
    return d(g, "next", {
        value: verb(0)
    }), d(g, "throw", {
        value: verb(1)
    }), d(g, "return", {
        value: verb(2)
    }), typeof Symbol === "function" && d(g, Symbol.iterator, {
        value: function() {
            return this;
        }
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var localChessAnalyzer = (0, _ChessEngine.createGeniusChessEngine)();
var StockfishChessGame = /*#__PURE__*/ function() {
    "use strict";
    function StockfishChessGame(lvl, diff) {
        this.score = 0;
        this.lives = 3;
        this.maxLives = 3;
        this.isPaused = false;
        this.gameOver = false;
        this.endResult = {
            won: false,
            reason: 'Game Over'
        };
        this.clockInterval = null;
        this.lastClockTick = performance.now();
        this.selectedSq = null;
        this.legalTargets = [];
        this.lastMove = null;
        this.dragStartSq = null;
        this.moveRecords = [];
        this.viewIndex = -1;
        this.latestEngineCpWhite = 20;
        this.boardCells = [];
        this.engineReady = false;
        this.engineThinking = false;
        this.pendingEngineMove = false;
        this.engineWatchdog = null;
        this.moveSafetyTimer = null;
        this.engineLabel = 'Stockfish 19';
        this.worker = null;
        this.analysisWorker = null;
        this.analysisBlobUrl = null;
        this.blobUrl = null;
        this.wasmBlobUrl = null;
        this.pendingAnalyses = 0;
        this.usingInThreadEngine = false;
        this.stopped = false;
        this.queuedBestMove = null;
        this.pendingTimers = new Set();
        this.level = lvl;
        this.diff = diff;
        // Normal Stockfish Elo strength settings across all 4 tiers (same Elos: 2750, 3100, 3450, 3750+)
        var skillMap = {
            easy: {
                skill: 15,
                elo: 2750,
                eloLabel: '2750 Elo Master',
                limitStrength: true,
                depth: 12,
                movetime: 650,
                builtinDepth: 6,
                mult: 1
            },
            medium: {
                skill: 18,
                elo: 3100,
                eloLabel: '3100 Elo GM',
                limitStrength: true,
                depth: 15,
                movetime: 950,
                builtinDepth: 8,
                mult: 2
            },
            hard: {
                skill: 20,
                elo: 3450,
                eloLabel: '3450 Elo Super-GM',
                limitStrength: false,
                depth: 18,
                movetime: 1350,
                builtinDepth: 10,
                mult: 3
            },
            extreme: {
                skill: 20,
                elo: 3750,
                eloLabel: '3750+ Elo Stockfish',
                limitStrength: false,
                depth: 22,
                movetime: 1900,
                builtinDepth: 12,
                mult: 5
            }
        };
        this.cfg = skillMap[diff] || skillMap.easy;
        this.game = (0, _ChessFallback.createChessInstance)();
        this.viewGame = (0, _ChessFallback.createChessInstance)();
        this.playerColor = Math.random() < 0.5 ? 'w' : 'b';
        var timeSelEl = document.getElementById('chessTimeSelect');
        if (timeSelEl) timeSelEl.value = String(_storage.playerState.selectedChessTimeSec || 600);
        this.baseTimeSec = parseInt((timeSelEl == null ? void 0 : timeSelEl.value) || String(_storage.playerState.selectedChessTimeSec), 10) || 600;
        this.whiteTime = this.baseTimeSec;
        this.blackTime = this.baseTimeSec;
    }
    var _proto = StockfishChessGame.prototype;
    _proto.initBoardDom = function initBoardDom() {
        var _this, _loop = function(i) {
            var cell = document.createElement('div');
            cell.className = 'chess-sq light';
            var pieceSpan = document.createElement('span');
            pieceSpan.className = 'chess-piece w';
            var badgeSpan = document.createElement('span');
            badgeSpan.className = 'chess-sq-badge';
            badgeSpan.style.display = 'none';
            var markerDiv = document.createElement('div');
            markerDiv.style.display = 'none';
            cell.appendChild(pieceSpan);
            cell.appendChild(badgeSpan);
            cell.appendChild(markerDiv);
            cell.onpointerdown = function(e) {
                if (_this1.stopped || _this1.gameOver || _this1.isPaused) return;
                if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
                e.preventDefault();
                var sq = cell.dataset.sq || '';
                _this1.dragStartSq = sq;
                _this1.handleSquareClick(sq, false);
            };
            cell.onpointerup = function(e) {
                var _dropCell_dataset;
                if (_this1.stopped || _this1.gameOver || _this1.isPaused) {
                    _this1.dragStartSq = null;
                    return;
                }
                var targetEl = document.elementFromPoint(e.clientX, e.clientY);
                var dropCell = targetEl == null ? void 0 : targetEl.closest('.chess-sq');
                var dropSq = (dropCell == null ? void 0 : (_dropCell_dataset = dropCell.dataset) == null ? void 0 : _dropCell_dataset.sq) || cell.dataset.sq || '';
                if (_this1.dragStartSq && dropSq && dropSq !== _this1.dragStartSq) {
                    _this1.handleSquareClick(dropSq, true);
                }
                _this1.dragStartSq = null;
            };
            boardEl.appendChild(cell);
            _this.boardCells.push({
                cell: cell,
                pieceSpan: pieceSpan,
                badgeSpan: badgeSpan,
                markerDiv: markerDiv
            });
        };
        var _this1 = this;
        var boardEl = document.getElementById('chessBoard');
        if (!boardEl) return;
        boardEl.innerHTML = '';
        this.boardCells = [];
        for(var i = 0; i < 64; i++)_this = this, _loop(i);
    };
    _proto.applyAnalysisResult = function applyAnalysisResult(plyIdx, playedUci, isMateAfter, moverColor, analysis) {
        var _document_getElementById;
        if (this.stopped) return;
        this.pendingAnalyses = Math.max(0, this.pendingAnalyses - 1);
        var rec = this.moveRecords[plyIdx];
        if (!rec) return;
        var sign = moverColor === 'w' ? 1 : -1;
        var cls = (0, _ChessEngine.classifyChessMove)(analysis, playedUci, isMateAfter);
        var evalAfterWhite = isMateAfter ? moverColor === 'w' ? 30000 : -30000 : analysis.playedMoverCp * sign;
        var evalBeforeWhite = analysis.bestMoverCp * sign;
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
        if (this.gameOver && ((_document_getElementById = document.getElementById('chessAnalysisOverlay')) == null ? void 0 : _document_getElementById.classList.contains('show'))) {
            this.buildAnalysisReport();
        }
    };
    _proto.initAnalysisWorker = function initAnalysisWorker() {
        var _this = this;
        try {
            if (typeof Worker === 'undefined' || window.location.protocol === 'file:') {
                this.analysisWorker = null;
                return;
            }
            var workerSrc = "\n        const engine = (" + _ChessEngine.createGeniusChessEngine.toString() + ")();\n        self.onmessage = function(e) {\n          const d = e.data;\n          if (!d || d.type !== 'analyze') return;\n          const analysis = engine.analyzePositionMove(d.fenBefore, d.playedUci, d.depth || 5, d.budgetMs || 320);\n          self.postMessage({ type: 'result', plyIdx: d.plyIdx, playedUci: d.playedUci, isMateAfter: d.isMateAfter, moverColor: d.moverColor, analysis });\n        };\n      ";
            var blob = new Blob([
                workerSrc
            ], {
                type: 'application/javascript'
            });
            this.analysisBlobUrl = URL.createObjectURL(blob);
            this.analysisWorker = new Worker(this.analysisBlobUrl);
            this.analysisWorker.onmessage = function(e) {
                var msg = e.data;
                if (!msg || msg.type !== 'result') return;
                _this.applyAnalysisResult(msg.plyIdx, msg.playedUci, msg.isMateAfter, msg.moverColor, msg.analysis);
            };
            this.analysisWorker.onerror = function() {
                if (_this.analysisWorker) {
                    _this.analysisWorker.terminate();
                    _this.analysisWorker = null;
                }
            };
        } catch (unused) {
            this.analysisWorker = null;
        }
    };
    _proto.start = function start() {
        var _this = this;
        var _document_getElementById, _document_getElementById1, _document_getElementById2;
        _storage.playerState.sessionCoins = 0;
        _storage.playerState.sessionExp = 0;
        (_document_getElementById = document.getElementById('chessGameUI')) == null ? void 0 : _document_getElementById.classList.add('show');
        (_document_getElementById1 = document.getElementById('chessAnalysisOverlay')) == null ? void 0 : _document_getElementById1.classList.remove('show');
        var openBtn = document.getElementById('chessOpenAnalysisBtn');
        if (openBtn) openBtn.style.display = 'none';
        var eloTag = document.getElementById('chessEloTag');
        if (eloTag) eloTag.textContent = this.cfg.eloLabel;
        (_document_getElementById2 = document.getElementById('inGameHud')) == null ? void 0 : _document_getElementById2.classList.add('show');
        var settingsBtn = document.getElementById('gameSettingsBtn');
        if (settingsBtn) settingsBtn.style.display = 'flex';
        (0, _runtimeBridge.updateCoinsDisplay)();
        (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 6);
        this.initBoardDom();
        this.initAnalysisWorker();
        var newMatchBtn = document.getElementById('chessNewMatchBtn');
        if (newMatchBtn) {
            newMatchBtn.onclick = function() {
                _audio.ArcadeAudio.play('click');
                _this.playerColor = Math.random() < 0.5 ? 'w' : 'b';
                _this.resetBoard();
            };
        }
        var timeSel = document.getElementById('chessTimeSelect');
        if (timeSel) {
            timeSel.onchange = function() {
                _this.baseTimeSec = parseInt(timeSel.value, 10) || 600;
                (0, _storage.persistChessTime)(_this.baseTimeSec);
                _this.playerColor = Math.random() < 0.5 ? 'w' : 'b';
                _this.resetBoard();
            };
        }
        var resignBtn = document.getElementById('chessResignBtn');
        if (resignBtn) resignBtn.onclick = function() {
            if (!_this.stopped && !_this.gameOver && !_this.isPaused) _this.finishMatch(false, '🏳️ You Resigned');
        };
        var prevBtn = document.getElementById('chessPrevMoveBtn');
        if (prevBtn) prevBtn.onclick = function() {
            return _this.stepHistory(-1);
        };
        var nextBtn = document.getElementById('chessNextMoveBtn');
        if (nextBtn) nextBtn.onclick = function() {
            return _this.stepHistory(1);
        };
        var liveBtn = document.getElementById('chessLiveMoveBtn');
        if (liveBtn) liveBtn.onclick = function() {
            return _this.jumpToMove(_this.moveRecords.length - 1);
        };
        var inspectBtn = document.getElementById('chessInspectBoardBtn');
        if (inspectBtn) {
            inspectBtn.onclick = function() {
                var _document_getElementById;
                (_document_getElementById = document.getElementById('chessAnalysisOverlay')) == null ? void 0 : _document_getElementById.classList.remove('show');
                var btn = document.getElementById('chessOpenAnalysisBtn');
                if (btn) btn.style.display = 'block';
            };
        }
        if (openBtn) {
            openBtn.onclick = function() {
                var _document_getElementById;
                _this.buildAnalysisReport();
                (_document_getElementById = document.getElementById('chessAnalysisOverlay')) == null ? void 0 : _document_getElementById.classList.add('show');
            };
        }
        var claimBtn = document.getElementById('chessClaimFinishBtn');
        if (claimBtn) {
            claimBtn.onclick = function() {
                var _document_getElementById;
                (_document_getElementById = document.getElementById('chessAnalysisOverlay')) == null ? void 0 : _document_getElementById.classList.remove('show');
                _this.stop();
                (0, _runtimeBridge.triggerGameOver)(_this.score, _storage.playerState.sessionCoins, _this.level, 6, _this.endResult.won);
            };
        }
        this.initEngine();
        this.startClockTimer();
        this.updateClockUI();
        this.renderHistoryStrip();
        this.renderBoard();
    };
    _proto.releaseInputs = function releaseInputs() {
        this.dragStartSq = null;
    };
    _proto.pause = function pause() {
        this.isPaused = true;
        this.releaseInputs();
    };
    _proto.resume = function resume() {
        this.isPaused = false;
        this.lastClockTick = performance.now();
        if (this.queuedBestMove && !this.stopped && !this.gameOver) {
            var mv = this.queuedBestMove;
            this.queuedBestMove = null;
            this.applyEngineBestMove(mv);
        } else if (!this.stopped && !this.gameOver && this.game.turn() !== this.playerColor && !this.engineThinking) {
            this.requestEngineMove();
        }
    };
    _proto.applyEngineBestMove = function applyEngineBestMove(moveStr) {
        if (moveStr && moveStr !== '(none)' && !this.gameOver && !this.stopped) {
            var moverColor = this.game.turn();
            var fenBefore = this.game.fen();
            var move = this.game.move({
                from: moveStr.slice(0, 2),
                to: moveStr.slice(2, 4),
                promotion: moveStr.length > 4 ? moveStr[4] : 'q'
            });
            if (move) {
                this.lastMove = {
                    from: move.from,
                    to: move.to
                };
                this.recordPlayedMove(move, moverColor, fenBefore);
                if (this.game.in_check()) _audio.ArcadeAudio.play('chessCheck');
                else _audio.ArcadeAudio.play(move.captured ? 'chessCapture' : 'chessMove');
            }
        }
        this.updateClockUI();
        this.renderBoard();
        this.checkEndOrStatus();
    };
    _proto.scheduleSafeTimeout = function scheduleSafeTimeout(fn, ms) {
        var _this = this;
        var id = setTimeout(function() {
            _this.pendingTimers.delete(id);
            if (!_this.stopped) fn();
        }, ms);
        this.pendingTimers.add(id);
    };
    _proto.stop = function stop() {
        var _document_getElementById, _document_getElementById1;
        this.stopped = true;
        this.dragStartSq = null;
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
            this.clockInterval = null;
        }
        if (this.engineWatchdog) {
            clearTimeout(this.engineWatchdog);
            this.engineWatchdog = null;
        }
        if (this.moveSafetyTimer) {
            clearTimeout(this.moveSafetyTimer);
            this.moveSafetyTimer = null;
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(this.pendingTimers), _step; !(_step = _iterator()).done;){
            var id = _step.value;
            clearTimeout(id);
        }
        this.pendingTimers.clear();
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        if (this.analysisWorker) {
            this.analysisWorker.terminate();
            this.analysisWorker = null;
        }
        if (this.blobUrl) {
            URL.revokeObjectURL(this.blobUrl);
            this.blobUrl = null;
        }
        if (this.analysisBlobUrl) {
            URL.revokeObjectURL(this.analysisBlobUrl);
            this.analysisBlobUrl = null;
        }
        if (this.wasmBlobUrl) {
            URL.revokeObjectURL(this.wasmBlobUrl);
            this.wasmBlobUrl = null;
        }
        for(var _i = 0, _iter = [
            'chessNewMatchBtn',
            'chessResignBtn',
            'chessPrevMoveBtn',
            'chessNextMoveBtn',
            'chessLiveMoveBtn',
            'chessInspectBoardBtn',
            'chessOpenAnalysisBtn',
            'chessClaimFinishBtn'
        ]; _i < _iter.length; _i++){
            var id1 = _iter[_i];
            var el = document.getElementById(id1);
            if (el) el.onclick = null;
        }
        var timeSelEl = document.getElementById('chessTimeSelect');
        if (timeSelEl) timeSelEl.onchange = null;
        (_document_getElementById = document.getElementById('chessAnalysisOverlay')) == null ? void 0 : _document_getElementById.classList.remove('show');
        (_document_getElementById1 = document.getElementById('chessGameUI')) == null ? void 0 : _document_getElementById1.classList.remove('show');
    };
    _proto.startClockTimer = function startClockTimer() {
        var _this = this;
        if (this.clockInterval) clearInterval(this.clockInterval);
        this.lastClockTick = performance.now();
        this.clockInterval = setInterval(function() {
            var now = performance.now();
            var dt = (now - _this.lastClockTick) / 1000;
            _this.lastClockTick = now;
            if (_this.isPaused || _this.gameOver) return;
            if (_this.game.turn() === 'w') {
                _this.whiteTime = Math.max(0, _this.whiteTime - dt);
                if (_this.whiteTime <= 0) {
                    _this.updateClockUI();
                    var playerWon = _this.playerColor === 'b';
                    _this.finishMatch(playerWon, playerWon ? '⏱️ Bot Flagged on Time!' : '⏱️ You Ran Out of Time!');
                    return;
                }
            } else {
                _this.blackTime = Math.max(0, _this.blackTime - dt);
                if (_this.blackTime <= 0) {
                    _this.updateClockUI();
                    var playerWon1 = _this.playerColor === 'w';
                    _this.finishMatch(playerWon1, playerWon1 ? '⏱️ Bot Flagged on Time!' : '⏱️ You Ran Out of Time!');
                    return;
                }
            }
            _this.updateClockUI();
        }, 200);
    };
    _proto.formatClock = function formatClock(sec) {
        var s = Math.max(0, sec);
        if (s < 10) return "0:0" + s.toFixed(1);
        var mins = Math.floor(s / 60);
        var rem = Math.floor(s % 60);
        return mins + ":" + (rem < 10 ? '0' : '') + rem;
    };
    _proto.updateClockUI = function updateClockUI() {
        var botTime = this.playerColor === 'w' ? this.blackTime : this.whiteTime;
        var playerTime = this.playerColor === 'w' ? this.whiteTime : this.blackTime;
        var botTurn = this.game.turn() !== this.playerColor && !this.gameOver;
        var playerTurn = this.game.turn() === this.playerColor && !this.gameOver;
        var botCard = document.getElementById('chessBotClockCard');
        var playerCard = document.getElementById('chessPlayerClockCard');
        var botLbl = document.getElementById('chessBotClockLabel');
        var plLbl = document.getElementById('chessPlayerClockLabel');
        var botClock = document.getElementById('chessBotClock');
        var plClock = document.getElementById('chessPlayerClock');
        if (botLbl) botLbl.textContent = "\uD83E\uDD16 " + this.engineLabel + " (" + (this.playerColor === 'w' ? 'Black' : 'White') + ")";
        if (plLbl) plLbl.textContent = "\uD83D\uDC64 You (" + (this.playerColor === 'w' ? 'White' : 'Black') + ")";
        if (botClock) botClock.textContent = this.formatClock(botTime);
        if (plClock) plClock.textContent = this.formatClock(playerTime);
        botCard == null ? void 0 : botCard.classList.toggle('active-turn', botTurn);
        playerCard == null ? void 0 : playerCard.classList.toggle('active-turn', playerTurn);
        botCard == null ? void 0 : botCard.classList.toggle('low-time', botTime <= 15);
        playerCard == null ? void 0 : playerCard.classList.toggle('low-time', playerTime <= 15);
    };
    _proto.updateEvalBar = function updateEvalBar(evalWhiteCp, isMate, moverColor) {
        this.latestEngineCpWhite = evalWhiteCp;
        var evalEl = document.getElementById('chessEval');
        var fillEl = document.getElementById('chessEvalFill');
        if (!evalEl || !fillEl) return;
        if (isMate || Math.abs(evalWhiteCp) >= 20000) {
            var whiteAhead = isMate ? moverColor === 'w' : evalWhiteCp > 0;
            evalEl.textContent = whiteAhead ? '+M' : '-M';
            fillEl.style.height = whiteAhead ? '100%' : '0%';
        } else {
            var pawns = evalWhiteCp / 100;
            evalEl.textContent = "" + (pawns > 0 ? '+' : '') + pawns.toFixed(2);
            var clamped = Math.max(-10, Math.min(10, pawns));
            fillEl.style.height = "" + (50 + clamped * 5) + "%";
        }
    };
    _proto.recordPlayedMove = function recordPlayedMove(moveObj, moverColor, fenBefore) {
        var _this = this;
        var fenAfter = this.game.fen();
        var isMate = this.game.in_checkmate();
        var playedUci = "" + moveObj.from + moveObj.to + (moveObj.promotion || '');
        var sign = moverColor === 'w' ? 1 : -1;
        var quickAnalysis = localChessAnalyzer.analyzePositionMove(fenBefore, playedUci, 3, 55);
        var cls = (0, _ChessEngine.classifyChessMove)(quickAnalysis, playedUci, isMate);
        var evalAfterWhite = isMate ? moverColor === 'w' ? 30000 : -30000 : quickAnalysis.playedMoverCp * sign;
        var evalBeforeWhite = quickAnalysis.bestMoverCp * sign;
        this.updateEvalBar(evalAfterWhite, isMate, moverColor);
        var plyIdx = this.moveRecords.length;
        var ply = plyIdx + 1;
        var moveNumber = Math.ceil(ply / 2);
        var san = moveObj.san || moveObj.from + "-" + moveObj.to;
        this.moveRecords.push(_extends({
            ply: ply,
            moveNumber: moveNumber,
            san: san,
            from: moveObj.from,
            to: moveObj.to,
            fen: fenAfter,
            evalBefore: evalBeforeWhite,
            evalAfter: evalAfterWhite
        }, cls, {
            color: moverColor,
            badgeColor: cls.color
        }));
        this.viewIndex = this.moveRecords.length - 1;
        this.renderHistoryStrip();
        if (this.analysisWorker) {
            this.pendingAnalyses++;
            this.analysisWorker.postMessage({
                type: 'analyze',
                plyIdx: plyIdx,
                fenBefore: fenBefore,
                playedUci: playedUci,
                isMateAfter: isMate,
                moverColor: moverColor,
                depth: 5,
                budgetMs: 320
            });
        } else {
            this.pendingAnalyses++;
            this.scheduleSafeTimeout(function() {
                if (!_this.moveRecords[plyIdx]) return;
                var analysis = localChessAnalyzer.analyzePositionMove(fenBefore, playedUci, 4, 150);
                _this.applyAnalysisResult(plyIdx, playedUci, isMate, moverColor, analysis);
            }, 15);
        }
    };
    _proto.isViewingLive = function isViewingLive() {
        return this.viewIndex === this.moveRecords.length - 1;
    };
    _proto.stepHistory = function stepHistory(delta) {
        if (!this.moveRecords.length) return;
        this.jumpToMove(Math.max(-1, Math.min(this.moveRecords.length - 1, this.viewIndex + delta)));
    };
    _proto.jumpToMove = function jumpToMove(index) {
        if (!this.moveRecords.length) return;
        this.viewIndex = Math.max(-1, Math.min(this.moveRecords.length - 1, index));
        this.selectedSq = null;
        this.legalTargets = [];
        this.renderHistoryStrip();
        this.renderBoard();
        this.updateStatus();
    };
    _proto.renderHistoryStrip = function renderHistoryStrip() {
        var _this = this;
        var strip = document.getElementById('chessMovesStrip');
        var prevBtn = document.getElementById('chessPrevMoveBtn');
        var nextBtn = document.getElementById('chessNextMoveBtn');
        var liveBtn = document.getElementById('chessLiveMoveBtn');
        if (prevBtn) prevBtn.disabled = this.viewIndex < 0;
        if (nextBtn) nextBtn.disabled = this.viewIndex >= this.moveRecords.length - 1;
        if (liveBtn) liveBtn.disabled = this.viewIndex >= this.moveRecords.length - 1;
        if (!strip) return;
        if (!this.moveRecords.length) {
            strip.innerHTML = '<span style="opacity:0.6;">No moves yet</span>';
            return;
        }
        strip.innerHTML = '';
        this.moveRecords.forEach(function(rec, idx) {
            var pill = document.createElement('button');
            pill.type = 'button';
            pill.className = 'chess-move-pill' + (idx === _this.viewIndex ? ' active-ply' : '');
            var prefix = rec.color === 'w' ? "" + rec.moveNumber + "." : "" + rec.moveNumber + "...";
            pill.innerHTML = "<span>" + prefix + rec.san + '</span><span style="color:' + (rec.badgeColor || '#84fab0') + ';">' + rec.icon + "</span>";
            pill.onclick = function() {
                return _this.jumpToMove(idx);
            };
            strip.appendChild(pill);
        });
        var activeEl = strip.querySelector('.active-ply');
        if (activeEl) activeEl.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    };
    _proto.fetchWithTimeout = function fetchWithTimeout() {
        return _async_to_generator(function(url, options, timeoutMs) {
            var controller, timer;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        if (options === void 0) options = {};
                        if (timeoutMs === void 0) timeoutMs = 6000;
                        controller = new AbortController();
                        timer = setTimeout(function() {
                            return controller.abort();
                        }, timeoutMs);
                        _state.label = 1;
                    case 1:
                        _state.trys.push([
                            1,
                            ,
                            3,
                            4
                        ]);
                        return [
                            4,
                            fetch(url, _extends({}, options, {
                                signal: controller.signal
                            }))
                        ];
                    case 2:
                        return [
                            2,
                            _state.sent()
                        ];
                    case 3:
                        clearTimeout(timer);
                        return [
                            7
                        ];
                    case 4:
                        return [
                            2
                        ];
                }
            });
        }).apply(this, arguments);
    };
    _proto.createInThreadUciWorker = function createInThreadUciWorker() {
        this.usingInThreadEngine = true;
        var listeners = {
            onmessage: null,
            onerror: null
        };
        var emit = function emit(data) {
            setTimeout(function() {
                if (!cancelled) listeners.onmessage == null ? void 0 : listeners.onmessage.call(listeners, {
                    data: data
                });
            }, 0);
        };
        var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        var skillLevel = this.cfg.skill;
        var builtinDepth = Math.min(this.cfg.builtinDepth, 5);
        var currentFen = START_FEN;
        var currentRepHashes = [];
        var boardToFen = function boardToFen(st) {
            var chars = [
                '',
                'P',
                'N',
                'B',
                'R',
                'Q',
                'K'
            ];
            var fen = '';
            for(var r = 0; r < 8; r++){
                var empty = 0;
                for(var c = 0; c < 8; c++){
                    var p = st.b[r * 8 + c];
                    if (!p) empty++;
                    else {
                        if (empty) {
                            fen += empty;
                            empty = 0;
                        }
                        var ch = chars[Math.abs(p)];
                        fen += p > 0 ? ch : ch.toLowerCase();
                    }
                }
                if (empty) fen += empty;
                if (r < 7) fen += '/';
            }
            var cs = '';
            if (st.castle & 1) cs += 'K';
            if (st.castle & 2) cs += 'Q';
            if (st.castle & 4) cs += 'k';
            if (st.castle & 8) cs += 'q';
            if (!cs) cs = '-';
            var ep = st.ep >= 0 ? String.fromCharCode(97 + (st.ep & 7)) + (8 - (st.ep >> 3)) : '-';
            return fen + " " + (st.turn === 1 ? 'w' : 'b') + " " + cs + " " + ep + " 0 1";
        };
        var cancelled = false;
        var shim = {
            set onmessage (fn){
                listeners.onmessage = fn;
            },
            get onmessage () {
                return listeners.onmessage;
            },
            set onerror (fn){
                listeners.onerror = fn;
            },
            get onerror () {
                return listeners.onerror;
            },
            terminate: function terminate() {
                cancelled = true;
            },
            postMessage: function postMessage(rawCmd) {
                if (cancelled) return;
                var cmd = (rawCmd || '').trim();
                if (cmd === 'uci') {
                    emit('id name Stockfish');
                    emit('uciok');
                } else if (cmd === 'isready') {
                    emit('readyok');
                } else if (cmd.startsWith('setoption name Skill Level value ')) {
                    skillLevel = parseInt(cmd.split(' ').pop() || '', 10) || skillLevel;
                } else if (cmd.startsWith('position ')) {
                    var mIdx = cmd.indexOf(' moves ');
                    var posPart = mIdx >= 0 ? cmd.slice(9, mIdx).trim() : cmd.slice(9).trim();
                    var baseFen = posPart === 'startpos' ? START_FEN : posPart.startsWith('fen ') ? posPart.slice(4).trim() : START_FEN;
                    currentRepHashes = [];
                    var st = localChessAnalyzer.parseFen(baseFen);
                    var seen = new Map();
                    seen.set(localChessAnalyzer.hashKey(st), 1);
                    if (mIdx >= 0) {
                        var movesStr = cmd.slice(mIdx + 7).trim().split(/\s+/);
                        for(var _iterator = _create_for_of_iterator_helper_loose(movesStr), _step; !(_step = _iterator()).done;){
                            var mv = _step.value;
                            var mo = localChessAnalyzer.uciToMoveObj(st, mv);
                            if (!mo) break;
                            st = localChessAnalyzer.applyMove(st, mo);
                            var kh = localChessAnalyzer.hashKey(st);
                            var cnt = (seen.get(kh) || 0) + 1;
                            seen.set(kh, cnt);
                            if (cnt >= 2) currentRepHashes.push(kh);
                        }
                        currentFen = boardToFen(st);
                    } else {
                        currentFen = baseFen;
                    }
                } else if (cmd.startsWith('go ')) {
                    setTimeout(function() {
                        if (cancelled) return;
                        var mtMatch = cmd.match(/movetime (\d+)/);
                        var budget = Math.min(mtMatch ? parseInt(mtMatch[1], 10) : 700, 700);
                        var dMatch = cmd.match(/depth (\d+)/);
                        var targetDepth = dMatch ? Math.min(builtinDepth, parseInt(dMatch[1], 10)) : builtinDepth;
                        var res = localChessAnalyzer.findBestMove(currentFen, targetDepth, budget, skillLevel, currentRepHashes);
                        if (Math.abs(res.scoreCp) >= 28000) {
                            var mateIn = Math.max(1, Math.ceil((30000 - Math.abs(res.scoreCp)) / 2));
                            emit("info depth " + res.depth + " score mate " + (res.scoreCp > 0 ? mateIn : -mateIn));
                        } else {
                            emit("info depth " + res.depth + " score cp " + Math.round(res.scoreCp));
                        }
                        emit("bestmove " + res.bestUci);
                    }, 25);
                }
            }
        };
        return shim;
    };
    _proto.createBuiltinUciWorker = function createBuiltinUciWorker() {
        try {
            if (typeof Worker === 'undefined' || window.location.protocol === 'file:') {
                return this.createInThreadUciWorker();
            }
            this.usingInThreadEngine = false;
            var blob = new Blob([
                "\n        const engine = (" + _ChessEngine.createGeniusChessEngine.toString() + ')();\n        const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";\n        let skillLevel = ' + this.cfg.skill + ";\n        let builtinDepth = " + this.cfg.builtinDepth + ";\n        let currentFen = START_FEN;\n        let currentRepHashes = [];\n        function boardToFen(st) {\n          const chars = ['', 'P', 'N', 'B', 'R', 'Q', 'K'];\n          let fen = '';\n          for (let r = 0; r < 8; r++) {\n            let empty = 0;\n            for (let c = 0; c < 8; c++) {\n              const p = st.b[r * 8 + c];\n              if (!p) empty++;\n              else { if (empty) { fen += empty; empty = 0; } const ch = chars[Math.abs(p)]; fen += p > 0 ? ch : ch.toLowerCase(); }\n            }\n            if (empty) fen += empty;\n            if (r < 7) fen += '/';\n          }\n          let cs = '';\n          if (st.castle & 1) cs += 'K';\n          if (st.castle & 2) cs += 'Q';\n          if (st.castle & 4) cs += 'k';\n          if (st.castle & 8) cs += 'q';\n          if (!cs) cs = '-';\n          const ep = st.ep >= 0 ? (String.fromCharCode(97 + (st.ep & 7)) + (8 - (st.ep >> 3))) : '-';\n          return fen + ' ' + (st.turn === 1 ? 'w' : 'b') + ' ' + cs + ' ' + ep + ' 0 1';\n        }\n        self.onmessage = function(e) {\n          const cmd = (e.data || \"\").trim();\n          if (cmd === \"uci\") { self.postMessage(\"id name Stockfish\"); self.postMessage(\"uciok\"); }\n          else if (cmd === \"isready\") { self.postMessage(\"readyok\"); }\n          else if (cmd.indexOf(\"setoption name Skill Level value \") === 0) {\n            skillLevel = parseInt(cmd.split(\" \").pop(), 10) || " + this.cfg.skill + ';\n          } else if (cmd.indexOf("position ") === 0) {\n            const mIdx = cmd.indexOf(" moves ");\n            const posPart = mIdx >= 0 ? cmd.slice(9, mIdx).trim() : cmd.slice(9).trim();\n            const baseFen = posPart === "startpos" ? START_FEN : (posPart.indexOf("fen ") === 0 ? posPart.slice(4).trim() : START_FEN);\n            currentRepHashes = [];\n            let st = engine.parseFen(baseFen);\n            const seen = new Map();\n            seen.set(engine.hashKey(st), 1);\n            if (mIdx >= 0) {\n              const movesStr = cmd.slice(mIdx + 7).trim().split(/\\s+/);\n              for (let i = 0; i < movesStr.length; i++) {\n                const mo = engine.uciToMoveObj(st, movesStr[i]);\n                if (!mo) break;\n                st = engine.applyMove(st, mo);\n                const kh = engine.hashKey(st);\n                const cnt = (seen.get(kh) || 0) + 1;\n                seen.set(kh, cnt);\n                if (cnt >= 2) currentRepHashes.push(kh);\n              }\n              currentFen = boardToFen(st);\n            } else {\n              currentFen = baseFen;\n            }\n          } else if (cmd.indexOf("go ") === 0) {\n            const mtMatch = cmd.match(/movetime (\\d+)/);\n            const budget = mtMatch ? parseInt(mtMatch[1], 10) : 950;\n            const dMatch = cmd.match(/depth (\\d+)/);\n            const targetDepth = dMatch ? Math.min(builtinDepth, parseInt(dMatch[1], 10)) : builtinDepth;\n            const res = engine.findBestMove(currentFen, targetDepth, budget, skillLevel, currentRepHashes);\n            if (Math.abs(res.scoreCp) >= 28000) {\n              const mateIn = Math.max(1, Math.ceil((30000 - Math.abs(res.scoreCp)) / 2));\n              self.postMessage("info depth " + res.depth + " score mate " + (res.scoreCp > 0 ? mateIn : -mateIn));\n            } else {\n              self.postMessage("info depth " + res.depth + " score cp " + Math.round(res.scoreCp));\n            }\n            self.postMessage("bestmove " + res.bestUci);\n          }\n        };\n      '
            ], {
                type: 'application/javascript'
            });
            this.blobUrl = URL.createObjectURL(blob);
            return new Worker(this.blobUrl);
        } catch (unused) {
            return this.createInThreadUciWorker();
        }
    };
    _proto.createStockfishWorker = function createStockfishWorker() {
        return _async_to_generator(function() {
            var _this, tryWasmMirror, unused;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        _this = this;
                        if (typeof Worker === 'undefined' || window.location.protocol === 'file:') {
                            this.engineLabel = 'Stockfish Engine';
                            return [
                                2,
                                this.createBuiltinUciWorker()
                            ];
                        }
                        tryWasmMirror = function tryWasmMirror(cdnBase) {
                            return _async_to_generator(function() {
                                var _ref, jsResp, wasmResp, _ref1, jsText, wasmBuffer, workerBlob;
                                return _ts_generator(this, function(_state) {
                                    switch(_state.label){
                                        case 0:
                                            return [
                                                4,
                                                Promise.all([
                                                    this.fetchWithTimeout("" + cdnBase + "/stockfish-19-lite-single.js", {}, 6000),
                                                    this.fetchWithTimeout("" + cdnBase + "/stockfish-19-lite-single.wasm", {}, 6000)
                                                ])
                                            ];
                                        case 1:
                                            _ref = _state.sent(), jsResp = _ref[0], wasmResp = _ref[1];
                                            if (!jsResp.ok || !wasmResp.ok) throw new Error('WASM fetch failed');
                                            return [
                                                4,
                                                Promise.all([
                                                    jsResp.text(),
                                                    wasmResp.arrayBuffer()
                                                ])
                                            ];
                                        case 2:
                                            _ref1 = _state.sent(), jsText = _ref1[0], wasmBuffer = _ref1[1];
                                            this.wasmBlobUrl = URL.createObjectURL(new Blob([
                                                wasmBuffer
                                            ], {
                                                type: 'application/wasm'
                                            }));
                                            workerBlob = new Blob([
                                                jsText
                                            ], {
                                                type: 'application/javascript'
                                            });
                                            this.blobUrl = URL.createObjectURL(workerBlob);
                                            this.engineLabel = 'Stockfish 19';
                                            return [
                                                2,
                                                new Worker(this.blobUrl + "#" + encodeURIComponent(this.wasmBlobUrl) + ",worker")
                                            ];
                                    }
                                });
                            }).call(_this);
                        };
                        _state.label = 1;
                    case 1:
                        _state.trys.push([
                            1,
                            3,
                            ,
                            4
                        ]);
                        return [
                            4,
                            tryWasmMirror('https://unpkg.com/stockfish@19.0.1/bin')
                        ];
                    case 2:
                        return [
                            2,
                            _state.sent()
                        ];
                    case 3:
                        unused = _state.sent();
                        this.engineLabel = 'Stockfish Engine';
                        return [
                            2,
                            this.createBuiltinUciWorker()
                        ];
                    case 4:
                        return [
                            2
                        ];
                }
            });
        }).call(this);
    };
    _proto.fallbackToBuiltinEngine = function fallbackToBuiltinEngine() {
        if (this.engineWatchdog) {
            clearTimeout(this.engineWatchdog);
            this.engineWatchdog = null;
        }
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.engineLabel = 'Stockfish Engine';
        this.worker = this.engineLabel === 'Stockfish Engine' && !this.usingInThreadEngine && typeof Worker !== 'undefined' ? this.createBuiltinUciWorker() : this.createInThreadUciWorker();
        this.bindWorkerHandlers();
        this.worker.postMessage('uci');
    };
    _proto.bindWorkerHandlers = function bindWorkerHandlers() {
        var _this = this;
        if (!this.worker || this.stopped) return;
        this.worker.onmessage = function(e) {
            if (_this.stopped) return;
            var line = typeof e.data === 'string' ? e.data : '';
            if (!line) return;
            if (line === 'uciok') {
                var _this_worker, _this_worker1, _this_worker2;
                (_this_worker = _this.worker) == null ? void 0 : _this_worker.postMessage('setoption name Hash value 32');
                (_this_worker1 = _this.worker) == null ? void 0 : _this_worker1.postMessage("setoption name Skill Level value " + _this.cfg.skill);
                if (_this.cfg.limitStrength) {
                    var _this_worker3, _this_worker4;
                    (_this_worker3 = _this.worker) == null ? void 0 : _this_worker3.postMessage('setoption name UCI_LimitStrength value true');
                    (_this_worker4 = _this.worker) == null ? void 0 : _this_worker4.postMessage("setoption name UCI_Elo value " + _this.cfg.elo);
                } else {
                    var _this_worker5;
                    (_this_worker5 = _this.worker) == null ? void 0 : _this_worker5.postMessage('setoption name UCI_LimitStrength value false');
                }
                (_this_worker2 = _this.worker) == null ? void 0 : _this_worker2.postMessage('isready');
            } else if (line === 'readyok') {
                if (_this.engineWatchdog) {
                    clearTimeout(_this.engineWatchdog);
                    _this.engineWatchdog = null;
                }
                if (!_this.engineReady) {
                    _this.engineReady = true;
                    _this.updateStatus();
                    if (_this.pendingEngineMove || _this.game.turn() !== _this.playerColor) {
                        _this.pendingEngineMove = false;
                        _this.requestEngineMove();
                    }
                }
            } else if (line.startsWith('info ') && line.includes(' score ')) {
                _this.parseEval(line);
            } else if (line.startsWith('bestmove ')) {
                if (_this.moveSafetyTimer) {
                    clearTimeout(_this.moveSafetyTimer);
                    _this.moveSafetyTimer = null;
                }
                _this.engineThinking = false;
                var moveStr = line.split(' ')[1];
                if (_this.isPaused) {
                    if (moveStr && moveStr !== '(none)' && !_this.gameOver) {
                        _this.queuedBestMove = moveStr;
                    }
                    return;
                }
                _this.applyEngineBestMove(moveStr);
            }
        };
        this.worker.onerror = function() {
            if (_this.engineLabel !== 'Stockfish Engine') {
                _this.fallbackToBuiltinEngine();
            } else if (!_this.usingInThreadEngine) {
                if (_this.worker) {
                    _this.worker.terminate();
                    _this.worker = null;
                }
                _this.worker = _this.createInThreadUciWorker();
                _this.bindWorkerHandlers();
                _this.worker.postMessage('uci');
            }
        };
    };
    _proto.initEngine = function initEngine() {
        return _async_to_generator(function() {
            var _this, w, unused;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        _this = this;
                        this.updateStatus();
                        _state.label = 1;
                    case 1:
                        _state.trys.push([
                            1,
                            3,
                            ,
                            4
                        ]);
                        return [
                            4,
                            this.createStockfishWorker()
                        ];
                    case 2:
                        w = _state.sent();
                        return [
                            3,
                            4
                        ];
                    case 3:
                        unused = _state.sent();
                        this.engineLabel = 'Stockfish Engine';
                        w = this.createBuiltinUciWorker();
                        return [
                            3,
                            4
                        ];
                    case 4:
                        if (this.stopped) {
                            w.terminate();
                            return [
                                2
                            ];
                        }
                        this.worker = w;
                        this.bindWorkerHandlers();
                        this.engineWatchdog = setTimeout(function() {
                            if (!_this.engineReady && !_this.usingInThreadEngine) {
                                if (_this.engineLabel !== 'Stockfish Engine') _this.fallbackToBuiltinEngine();
                                else {
                                    if (_this.worker) {
                                        _this.worker.terminate();
                                        _this.worker = null;
                                    }
                                    _this.worker = _this.createInThreadUciWorker();
                                    _this.bindWorkerHandlers();
                                    _this.worker.postMessage('uci');
                                }
                            }
                        }, 3500);
                        this.worker.postMessage('uci');
                        return [
                            2
                        ];
                }
            });
        }).call(this);
    };
    _proto.parseEval = function parseEval(line) {
        var cpMatch = line.match(/\bscore cp (-?\d+)/);
        var mateMatch = line.match(/\bscore mate (-?\d+)/);
        var mult = this.game.turn() === 'w' ? 1 : -1;
        var evalEl = document.getElementById('chessEval');
        var fillEl = document.getElementById('chessEvalFill');
        if (!evalEl || !fillEl) return;
        if (mateMatch) {
            var m = parseInt(mateMatch[1], 10) * mult;
            this.latestEngineCpWhite = m > 0 ? 30000 : -30000;
            evalEl.textContent = "M" + Math.abs(m);
            fillEl.style.height = m > 0 ? '100%' : '0%';
        } else if (cpMatch) {
            var cpWhite = parseInt(cpMatch[1], 10) * mult;
            this.latestEngineCpWhite = cpWhite;
            var pawns = cpWhite / 100;
            evalEl.textContent = "" + (pawns > 0 ? '+' : '') + pawns.toFixed(2);
            var clamped = Math.max(-10, Math.min(10, pawns));
            fillEl.style.height = "" + (50 + clamped * 5) + "%";
        }
    };
    _proto.requestEngineMove = function requestEngineMove() {
        var _this = this;
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
        var uciMoves = this.game.history({
            verbose: true
        }).map(function(m) {
            return "" + m.from + m.to + (m.promotion || '');
        });
        this.worker.postMessage(uciMoves.length ? "position startpos moves " + uciMoves.join(' ') : 'position startpos');
        var botTimeSec = this.playerColor === 'w' ? this.blackTime : this.whiteTime;
        var moveTime = botTimeSec < 18 ? Math.min(this.cfg.movetime, Math.max(250, Math.floor(botTimeSec * 80))) : this.cfg.movetime;
        this.worker.postMessage("go depth " + this.cfg.depth + " movetime " + moveTime);
        if (this.moveSafetyTimer) clearTimeout(this.moveSafetyTimer);
        this.moveSafetyTimer = setTimeout(function() {
            if (_this.engineThinking && !_this.gameOver) {
                _this.engineThinking = false;
                if (_this.engineLabel !== 'Stockfish Engine') {
                    _this.pendingEngineMove = true;
                    _this.fallbackToBuiltinEngine();
                } else {
                    _this.updateStatus();
                }
            }
        }, moveTime + 5000);
    };
    _proto.fenToBoardHelper = function fenToBoardHelper(fen) {
        var rows = fen.split(' ')[0].split('/');
        var grid = [];
        for(var r = 0; r < 8; r++){
            var row = [];
            for(var i = 0; i < rows[r].length; i++){
                var ch = rows[r][i];
                if (ch >= '1' && ch <= '8') {
                    var n = parseInt(ch, 10);
                    for(var k = 0; k < n; k++)row.push(null);
                } else {
                    row.push({
                        type: ch.toLowerCase(),
                        color: ch === ch.toUpperCase() ? 'w' : 'b'
                    });
                }
            }
            grid.push(row);
        }
        return {
            board: function board() {
                return grid;
            }
        };
    };
    _proto.renderBoard = function renderBoard() {
        if (!this.boardCells || this.boardCells.length !== 64) this.initBoardDom();
        var symbols = {
            w: {
                k: '♔',
                q: '♕',
                r: '♖',
                b: '♗',
                n: '♘',
                p: '♙'
            },
            b: {
                k: '♚',
                q: '♛',
                r: '♜',
                b: '♝',
                n: '♞',
                p: '♟'
            }
        };
        var viewingLive = this.isViewingLive();
        var viewedRec = this.viewIndex >= 0 && this.moveRecords[this.viewIndex] ? this.moveRecords[this.viewIndex] : null;
        var activeBoardObj = this.game;
        var activeLastMove = this.lastMove;
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
                activeLastMove = {
                    from: viewedRec.from,
                    to: viewedRec.to
                };
            }
        }
        var board = activeBoardObj.board();
        var ranks = this.playerColor === 'w' ? [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7
        ] : [
            7,
            6,
            5,
            4,
            3,
            2,
            1,
            0
        ];
        var files = this.playerColor === 'w' ? [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7
        ] : [
            7,
            6,
            5,
            4,
            3,
            2,
            1,
            0
        ];
        var isCheckNow = viewingLive && this.game.in_check();
        var turnNow = this.game.turn();
        var idx = 0;
        for(var _iterator = _create_for_of_iterator_helper_loose(ranks), _step; !(_step = _iterator()).done;){
            var _this, _loop = function() {
                var f = _step1.value;
                var sq = 'abcdefgh'[f] + (8 - r);
                var slot = _this.boardCells[idx++];
                if (!slot) return "continue";
                var cell = slot.cell, pieceSpan = slot.pieceSpan, badgeSpan = slot.badgeSpan, markerDiv = slot.markerDiv;
                var cls = "chess-sq " + ((r + f) % 2 === 0 ? 'light' : 'dark');
                if (activeLastMove && (sq === activeLastMove.from || sq === activeLastMove.to)) cls += ' last-move';
                if (viewingLive && _this.selectedSq === sq) cls += ' selected';
                var piece = board[r][f];
                if (piece) {
                    if (isCheckNow && piece.type === 'k' && piece.color === turnNow) cls += ' in-check';
                    pieceSpan.className = "chess-piece " + piece.color;
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
                if (viewingLive && _this.legalTargets.some(function(m) {
                    return m.to === sq;
                })) {
                    markerDiv.style.display = 'block';
                    markerDiv.className = piece ? 'chess-ring' : 'chess-dot';
                } else {
                    markerDiv.style.display = 'none';
                    markerDiv.className = '';
                }
            };
            var r = _step.value;
            for(var _iterator1 = _create_for_of_iterator_helper_loose(files), _step1; !(_step1 = _iterator1()).done;)_this = this, _loop();
        }
    };
    _proto.tryPlayerMove = function tryPlayerMove(fromSq, toSq) {
        var _this = this;
        if (!this.isViewingLive()) return false;
        var moverColor = this.game.turn();
        var fenBefore = this.game.fen();
        var move = this.game.move({
            from: fromSq,
            to: toSq,
            promotion: 'q'
        });
        if (!move) return false;
        if (this.game.in_check()) _audio.ArcadeAudio.play('chessCheck');
        else _audio.ArcadeAudio.play(move.captured ? 'chessCapture' : 'chessMove');
        this.lastMove = {
            from: move.from,
            to: move.to
        };
        this.selectedSq = null;
        this.legalTargets = [];
        this.recordPlayedMove(move, moverColor, fenBefore);
        var capturePoints = {
            p: 10,
            n: 30,
            b: 30,
            r: 50,
            q: 90
        };
        this.score += (move.captured ? capturePoints[move.captured] || 10 : 5) * this.cfg.mult;
        if (move.captured) {
            _audio.ArcadeAudio.play('coin');
            var coinsEarned = this.cfg.mult;
            _storage.playerState.totalCoins += coinsEarned;
            _storage.playerState.sessionCoins += coinsEarned;
            (0, _runtimeBridge.addXp)(5 * this.cfg.mult);
            (0, _runtimeBridge.updateCoinsDisplay)();
        }
        (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 6);
        this.updateClockUI();
        this.renderBoard();
        if (!this.checkEndOrStatus()) this.scheduleSafeTimeout(function() {
            return _this.requestEngineMove();
        }, 80);
        return true;
    };
    _proto.handleSquareClick = function handleSquareClick(sq, isDrop) {
        if (isDrop === void 0) isDrop = false;
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
        var piece = this.game.get(sq);
        if (piece && piece.color === this.playerColor) {
            this.selectedSq = sq;
            this.legalTargets = this.game.moves({
                square: sq,
                verbose: true
            });
            _audio.ArcadeAudio.play('click');
        } else {
            this.selectedSq = null;
            this.legalTargets = [];
        }
        this.renderBoard();
    };
    _proto.resetBoard = function resetBoard() {
        var _this = this;
        var _document_getElementById;
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
        (_document_getElementById = document.getElementById('chessAnalysisOverlay')) == null ? void 0 : _document_getElementById.classList.remove('show');
        var openBtn = document.getElementById('chessOpenAnalysisBtn');
        if (openBtn) openBtn.style.display = 'none';
        var evalEl = document.getElementById('chessEval');
        if (evalEl) evalEl.textContent = '0.00';
        var fillEl = document.getElementById('chessEvalFill');
        if (fillEl) fillEl.style.height = '50%';
        this.updateClockUI();
        this.renderHistoryStrip();
        this.renderBoard();
        this.updateStatus();
        if (this.playerColor === 'b') this.scheduleSafeTimeout(function() {
            return _this.requestEngineMove();
        }, 150);
    };
    _proto.updateStatus = function updateStatus() {
        var el = document.getElementById('chessStatus');
        if (!el) return;
        if (this.gameOver) el.textContent = this.endResult.reason;
        else if (!this.isViewingLive()) el.textContent = "\uD83D\uDCDC Viewing " + (this.viewIndex < 0 ? 'Start' : "Move #" + (this.viewIndex + 1)) + " (Tap ⏭)";
        else if (this.engineThinking) el.textContent = "\uD83E\uDD14 " + this.engineLabel + " thinking...";
        else if (this.game.turn() !== this.playerColor) el.textContent = "⏳ Waiting for " + this.engineLabel + "...";
        else el.textContent = "\uD83C\uDFB2 Your Turn (" + (this.playerColor === 'w' ? 'White ♔' : 'Black ♚') + ")";
    };
    _proto.buildAnalysisReport = function buildAnalysisReport() {
        var _this = this;
        var categories = [
            {
                tag: 'brilliant',
                icon: '💎',
                label: 'Brilliant (!!)',
                color: '#1abc9c'
            },
            {
                tag: 'great',
                icon: '❗',
                label: 'Great (!)',
                color: '#3498db'
            },
            {
                tag: 'best',
                icon: '⭐',
                label: 'Best',
                color: '#2ecc71'
            },
            {
                tag: 'good',
                icon: '👍',
                label: 'Good',
                color: '#84fab0'
            },
            {
                tag: 'inaccuracy',
                icon: '⚠️',
                label: 'Inaccuracy (?!)',
                color: '#f1c40f'
            },
            {
                tag: 'mistake',
                icon: '❓',
                label: 'Mistake (?)',
                color: '#e67e22'
            },
            {
                tag: 'blunder',
                icon: '💥',
                label: 'Blunder (??)',
                color: '#e74c3c'
            }
        ];
        var playerMoves = this.moveRecords.filter(function(m) {
            return m.color === _this.playerColor;
        });
        var botMoves = this.moveRecords.filter(function(m) {
            return m.color !== _this.playerColor;
        });
        var calcAcc = function calcAcc(list) {
            if (!list.length) return 100;
            var avgWinLoss = list.reduce(function(s, m) {
                return s + (m.winLoss !== undefined ? m.winLoss : Math.min(35, m.cpLoss / 8));
            }, 0) / list.length;
            var acc = Math.round(103.1668 * Math.exp(-0.04354 * avgWinLoss) - 3.1669);
            return Math.max(0, Math.min(100, acc));
        };
        var head = document.getElementById('chessAnalysisHeadline');
        if (head) head.textContent = this.endResult.won ? "\uD83C\uDFC6 Victory — " + this.endResult.reason : "\uD83D\uDCCA Match Over — " + this.endResult.reason;
        var sub = document.getElementById('chessAnalysisSub');
        if (sub) sub.textContent = "Opponent: " + this.engineLabel + " (" + this.cfg.eloLabel + ") \xb7 " + this.moveRecords.length + " Plies";
        var botLbl = document.getElementById('chessBotAccLabel');
        if (botLbl) botLbl.textContent = "" + this.engineLabel.toUpperCase() + " ACCURACY";
        var pAcc = document.getElementById('chessPlayerAcc');
        if (pAcc) pAcc.textContent = "" + calcAcc(playerMoves) + "%";
        var bAcc = document.getElementById('chessBotAcc');
        if (bAcc) bAcc.textContent = "" + calcAcc(botMoves) + "%";
        var grid = document.getElementById('chessClassBreakdown');
        if (grid) {
            grid.innerHTML = '<div class="chess-class-row" style="font-weight:900; color:#aaa; border-bottom:1px solid rgba(255,255,255,0.12);"><span>YOU</span><span style="text-align:center;">MOVE QUALITY</span><span style="text-align:right;">BOT</span></div>';
            categories.forEach(function(cat) {
                var pCount = playerMoves.filter(function(m) {
                    return m.tag === cat.tag;
                }).length;
                var bCount = botMoves.filter(function(m) {
                    return m.tag === cat.tag;
                }).length;
                var row = document.createElement('div');
                row.className = 'chess-class-row';
                row.innerHTML = '<strong style="color:' + cat.color + ';">' + pCount + '</strong><span style="text-align:center; color:' + cat.color + '; font-weight:800;">' + cat.icon + " " + cat.label + '</span><strong style="text-align:right; color:' + cat.color + ';">' + bCount + "</strong>";
                grid.appendChild(row);
            });
        }
        var listEl = document.getElementById('chessReviewMoveList');
        if (listEl) {
            listEl.innerHTML = '';
            if (!this.moveRecords.length) {
                listEl.innerHTML = '<div style="text-align:center; opacity:0.6; padding:8px;">No moves played in this game.</div>';
            } else {
                this.moveRecords.forEach(function(rec, idx) {
                    var who = rec.color === _this.playerColor ? 'You' : 'Bot';
                    var evalAfterStr = "" + (rec.evalAfter >= 0 ? '+' : '') + (rec.evalAfter / 100).toFixed(2);
                    var item = document.createElement('button');
                    item.type = 'button';
                    item.className = 'chess-review-item';
                    item.innerHTML = "<span><strong>" + rec.moveNumber + (rec.color === 'w' ? '.' : '...') + " " + rec.san + '</strong> <span style="opacity:0.7;">(' + who + ')</span></span><span style="color:' + (rec.badgeColor || '#84fab0') + '; font-weight:800;">' + rec.icon + " " + rec.label + " (" + evalAfterStr + ")</span>";
                    item.onclick = function() {
                        var _document_getElementById;
                        (_document_getElementById = document.getElementById('chessAnalysisOverlay')) == null ? void 0 : _document_getElementById.classList.remove('show');
                        var openBtn = document.getElementById('chessOpenAnalysisBtn');
                        if (openBtn) openBtn.style.display = 'block';
                        _this.jumpToMove(idx);
                    };
                    listEl.appendChild(item);
                });
            }
        }
    };
    _proto.finishMatch = function finishMatch(playerWon, reason) {
        var _document_getElementById;
        if (this.gameOver) return;
        this.gameOver = true;
        this.engineThinking = false;
        _audio.ArcadeAudio.stopBgm();
        _audio.ArcadeAudio.play(playerWon ? 'win' : 'gameover');
        document.body.dataset.state = 'gameover';
        if (this.worker) this.worker.postMessage('stop');
        this.endResult = {
            won: playerWon,
            reason: reason
        };
        if (playerWon) {
            var bonus = 50 * this.cfg.mult;
            this.score += 250 * this.cfg.mult;
            _storage.playerState.totalCoins += bonus;
            _storage.playerState.sessionCoins += bonus;
            (0, _runtimeBridge.addXp)(100 * this.cfg.mult);
            (0, _runtimeBridge.updateCoinsDisplay)();
            (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 6);
        }
        this.updateClockUI();
        this.updateStatus();
        this.buildAnalysisReport();
        (_document_getElementById = document.getElementById('chessAnalysisOverlay')) == null ? void 0 : _document_getElementById.classList.add('show');
    };
    _proto.checkEndOrStatus = function checkEndOrStatus() {
        if (this.game.in_checkmate()) {
            var playerWon = this.game.turn() !== this.playerColor;
            this.finishMatch(playerWon, playerWon ? '♔ Checkmate — You Win!' : '♚ Checkmate — Bot Wins!');
            return true;
        }
        if (this.game.in_draw()) {
            this.finishMatch(false, '🤝 Draw Game');
            return true;
        }
        this.updateStatus();
        return false;
    };
    return StockfishChessGame;
}();

});

})(window.ArcadeMod);
