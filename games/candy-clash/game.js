(function(ArcadeMod){
// === MODULE: src/games/candy-clash/CandyClash ===
ArcadeMod.define("src/games/candy-clash/CandyClash", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CandyClashGame", {
    enumerable: true,
    get: function() {
        return CandyClashGame;
    }
});
var _audio = require("../../core/audio");
var _emojiCache = require("../../core/emojiCache");
var _runtimeBridge = require("../../core/runtimeBridge");
var _BaseGame = require("../../core/BaseGame");
var _candyLogic = require("./candyLogic");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
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
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });
    if (superClass) _set_prototype_of(subClass, superClass);
}
function _set_prototype_of(o, p) {
    _set_prototype_of = Object.setPrototypeOf || function setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return _set_prototype_of(o, p);
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var CandyClashGame = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(CandyClashGame, BaseGame);
    function CandyClashGame() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.rows = 8, _this.cols = 8, _this.candies = [
            {
                icon: '🍓',
                bg: '#ef4444'
            },
            {
                icon: '🍋',
                bg: '#eab308'
            },
            {
                icon: '🍇',
                bg: '#a855f7'
            },
            {
                icon: '🍏',
                bg: '#22c55e'
            },
            {
                icon: '🍊',
                bg: '#f97316'
            },
            {
                icon: '💎',
                bg: '#38bdf8'
            }
        ], _this.movesLeft = 24, _this.turnDuration = 12, _this.turnTimer = 12, _this.selected = null, _this.dragOrigin = null, _this.combo = 0, _this.animLock = 0, _this.grid = [];
        return _this;
    }
    var _proto = CandyClashGame.prototype;
    _proto.init = function init() {
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
        this.grid = (0, _candyLogic.createInitialCandyGrid)(this.rows, this.cols, this.candies.length);
    };
    _proto.resize = function resize() {
        BaseGame.prototype.resize.call(this);
        this.dragOrigin = null;
        if (this.isPaused) this.draw();
    };
    _proto.getBoardRect = function getBoardRect() {
        var isCompactLand = this.width > this.height * 1.35 && this.height < 500;
        var topSafe = isCompactLand ? 52 : this.width < 460 ? 74 : 66;
        var bottomSafe = isCompactLand ? 34 : 54;
        var availW = this.width - 18;
        var availH = Math.max(120, this.height - topSafe - bottomSafe);
        var size = Math.min(availW, availH, 460);
        var cell = size / this.cols;
        return {
            x: (this.width - size) / 2,
            y: topSafe + (availH - size) / 2,
            size: size,
            cell: cell
        };
    };
    _proto.cellAt = function cellAt(x, y) {
        var b = this.getBoardRect();
        var c = Math.floor((x - b.x) / b.cell);
        var r = Math.floor((y - b.y) / b.cell);
        return r >= 0 && r < this.rows && c >= 0 && c < this.cols ? {
            r: r,
            c: c
        } : null;
    };
    _proto.onPointerDown = function onPointerDown(x, y) {
        if (this.gameOver || this.isPaused || this.animLock > 0) return;
        var hit = this.cellAt(x, y);
        if (!hit) {
            this.selected = null;
            this.dragOrigin = null;
            return;
        }
        this.dragOrigin = {
            r: hit.r,
            c: hit.c,
            x: x,
            y: y
        };
        if (this.selected) {
            var dr = Math.abs(this.selected.r - hit.r);
            var dc = Math.abs(this.selected.c - hit.c);
            if (dr + dc === 1) {
                this.trySwap(this.selected.r, this.selected.c, hit.r, hit.c);
                this.selected = null;
                this.dragOrigin = null;
                return;
            }
        }
        this.selected = hit;
        _audio.ArcadeAudio.play('click');
    };
    _proto.tryHandleSwipe = function tryHandleSwipe(x, y, allowAdjacentCell) {
        if (allowAdjacentCell === void 0) allowAdjacentCell = false;
        if (!this.dragOrigin || this.gameOver || this.isPaused || this.animLock > 0) return false;
        var br = this.getBoardRect();
        var threshold = Math.max(12, br.cell * 0.34);
        var dx = x - this.dragOrigin.x;
        var dy = y - this.dragOrigin.y;
        var target = (0, _candyLogic.computeSwipeTarget)(this.dragOrigin.r, this.dragOrigin.c, dx, dy, threshold, this.rows, this.cols);
        if (!target && allowAdjacentCell) {
            var hover = this.cellAt(x, y);
            if (hover && Math.abs(hover.r - this.dragOrigin.r) + Math.abs(hover.c - this.dragOrigin.c) === 1) {
                target = hover;
            }
        }
        if (!target) return false;
        this.trySwap(this.dragOrigin.r, this.dragOrigin.c, target.r, target.c);
        this.dragOrigin = null;
        this.selected = null;
        return true;
    };
    _proto.onPointerMove = function onPointerMove(x, y) {
        this.tryHandleSwipe(x, y, false);
    };
    _proto.releaseInputs = function releaseInputs() {
        this.dragOrigin = null;
    };
    _proto.pause = function pause() {
        BaseGame.prototype.pause.call(this);
        this.releaseInputs();
    };
    _proto.onPointerUp = function onPointerUp(x, y) {
        if (this.gameOver || this.isPaused) {
            this.dragOrigin = null;
            return;
        }
        if (typeof x === 'number' && typeof y === 'number') {
            this.tryHandleSwipe(x, y, true);
        }
        this.dragOrigin = null;
    };
    _proto.trySwap = function trySwap(r1, c1, r2, c2) {
        var _this_grid_r1, _this_grid_r2;
        var a = (_this_grid_r1 = this.grid[r1]) == null ? void 0 : _this_grid_r1[c1];
        var b = (_this_grid_r2 = this.grid[r2]) == null ? void 0 : _this_grid_r2[c2];
        if (!a || !b) return;
        this.grid[r1][c1] = b;
        this.grid[r2][c2] = a;
        var hasBomb = a.special === 'bomb' || b.special === 'bomb';
        var _findMatchesOnGrid = (0, _candyLogic.findMatchesOnGrid)(this.grid), matched = _findMatchesOnGrid.matched, runs = _findMatchesOnGrid.runs;
        if (!hasBomb && runs.length === 0) {
            this.grid[r1][c1] = a;
            this.grid[r2][c2] = b;
            a.xOff = (c2 - c1) * 14;
            b.xOff = (c1 - c2) * 14;
            a.yOff = (r2 - r1) * 14;
            b.yOff = (r1 - r2) * 14;
            _audio.ArcadeAudio.play('hurt');
            return;
        }
        this.movesLeft--;
        this.turnTimer = this.turnDuration;
        this.combo = 0;
        if (hasBomb) {
            var targetType = a.special === 'bomb' ? b.type : a.type;
            for(var r = 0; r < this.rows; r++){
                for(var c = 0; c < this.cols; c++){
                    var cell = this.grid[r][c];
                    if (cell && (cell.type === targetType || cell.special === 'bomb')) matched[r][c] = true;
                }
            }
        }
        this.resolveMatches(matched, runs, {
            r: r2,
            c: c2
        });
    };
    _proto.resolveMatches = function resolveMatches(matched, runs, focusCell) {
        if (focusCell === void 0) focusCell = null;
        var br = this.getBoardRect();
        var cleared = 0;
        for(var r = 0; r < this.rows; r++){
            for(var c = 0; c < this.cols; c++){
                var _this_grid_r_c;
                var sp = (_this_grid_r_c = this.grid[r][c]) == null ? void 0 : _this_grid_r_c.special;
                if (matched[r][c] && sp === 'row') {
                    for(var k = 0; k < this.cols; k++)matched[r][k] = true;
                } else if (matched[r][c] && sp === 'col') {
                    for(var k1 = 0; k1 < this.rows; k1++)matched[k1][c] = true;
                }
            }
        }
        for(var r1 = 0; r1 < this.rows; r1++){
            for(var c1 = 0; c1 < this.cols; c1++){
                var cell = this.grid[r1][c1];
                if (matched[r1][c1] && cell) {
                    var cellInfo = this.candies[cell.type];
                    this.spawnParticles(br.x + (c1 + 0.5) * br.cell, br.y + (r1 + 0.5) * br.cell, cellInfo.bg, 5, 130);
                    this.grid[r1][c1] = null;
                    cleared++;
                }
            }
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(runs), _step; !(_step = _iterator()).done;){
            var run = _step.value;
            var spot = focusCell && run.cells.some(function(p) {
                return p.r === focusCell.r && p.c === focusCell.c;
            }) ? focusCell : run.cells[1];
            if (run.len >= 5 && this.grid[spot.r][spot.c] === null) {
                this.grid[spot.r][spot.c] = {
                    type: run.type,
                    special: 'bomb',
                    yOff: 0,
                    xOff: 0,
                    pop: 1.4
                };
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
        var pts = cleared * 12 * this.combo;
        this.score += pts;
        if (cleared >= 5 || this.combo >= 2) {
            var cAdd = Math.min(5, Math.floor(cleared / 3) + this.combo - 1);
            (0, _runtimeBridge.addCoins)(cAdd);
            _audio.ArcadeAudio.play('combo');
            this.spawnPopup(br.x + br.size / 2, br.y + br.size * 0.45, "✨ x" + this.combo + " COMBO +" + pts, '#ffd700');
        } else {
            _audio.ArcadeAudio.play('match');
        }
        (0, _runtimeBridge.addXp)(Math.max(3, cleared));
        if (this.score >= this.level * 500) {
            this.level++;
            this.movesLeft += 5;
            _audio.ArcadeAudio.play('levelup');
            this.spawnPopup(this.width / 2, br.y - 10, '⬆️ LEVEL UP! +5 MOVES', '#84fab0');
        }
        (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 8);
        for(var c2 = 0; c2 < this.cols; c2++){
            var writeR = this.rows - 1;
            for(var r2 = this.rows - 1; r2 >= 0; r2--){
                if (this.grid[r2][c2]) {
                    if (writeR !== r2) {
                        this.grid[writeR][c2] = this.grid[r2][c2];
                        this.grid[writeR][c2].yOff = -(writeR - r2) * br.cell;
                        this.grid[r2][c2] = null;
                    }
                    writeR--;
                }
            }
            while(writeR >= 0){
                this.grid[writeR][c2] = {
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
    };
    _proto.update = function update(dt) {
        if (this.gameOver) return;
        this.survivalElapsed = 0;
        for(var r = 0; r < this.rows; r++){
            for(var c = 0; c < this.cols; c++){
                var cell = this.grid[r][c];
                if (!cell) continue;
                cell.xOff *= Math.exp(-14 * dt);
                cell.yOff *= Math.exp(-12 * dt);
                cell.pop += (1 - cell.pop) * (1 - Math.exp(-10 * dt));
            }
        }
        if (this.animLock > 0) {
            this.animLock -= dt;
            if (this.animLock <= 0) {
                var _findMatchesOnGrid = (0, _candyLogic.findMatchesOnGrid)(this.grid), matched = _findMatchesOnGrid.matched, runs = _findMatchesOnGrid.runs;
                if (runs.length > 0) {
                    this.resolveMatches(matched, runs);
                } else if (this.movesLeft <= 0) {
                    this.gameOverSequence(this.score >= 800);
                } else if (!(0, _candyLogic.hasAnyValidCandyMove)(this.grid)) {
                    this.grid = (0, _candyLogic.createInitialCandyGrid)(this.rows, this.cols, this.candies.length);
                    this.spawnPopup(this.width / 2, this.height * 0.5, '🔀 SHUFFLE!', '#8fd3f4');
                }
            }
        } else {
            var tick = (0, _candyLogic.tickCandyTurnTimer)(this.turnTimer, this.turnDuration, this.movesLeft, dt);
            this.turnTimer = tick.turnTimer;
            if (tick.expired) {
                this.movesLeft = tick.movesLeft;
                this.selected = null;
                this.dragOrigin = null;
                _audio.ArcadeAudio.play('hurt');
                this.triggerShake(5, 0.14);
                this.spawnPopup(this.width / 2, this.height * 0.36, '⏱️ TIME UP! -1 MOVE', '#ef4444');
                if (this.movesLeft <= 0) {
                    this.gameOverSequence(this.score >= 800);
                }
            }
        }
    };
    _proto.draw = function draw() {
        var ctx = this.ctx;
        ctx.fillStyle = '#1b112c';
        ctx.fillRect(0, 0, this.width, this.height);
        var br = this.getBoardRect();
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.strokeStyle = 'rgba(232, 121, 249, 0.55)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(br.x - 6, br.y - 6, br.size + 12, br.size + 12, 14);
        ctx.fill();
        ctx.stroke();
        // Per-turn countdown progress bar above board
        var pct = Math.max(0, Math.min(1, this.turnTimer / this.turnDuration));
        var isCompactLand = this.width > this.height * 1.35 && this.height < 500;
        var timerBarY = Math.max(isCompactLand ? 34 : 46, br.y - 20);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath();
        ctx.roundRect(br.x, timerBarY, br.size, 8, 4);
        ctx.fill();
        ctx.fillStyle = this.turnTimer <= 3 ? '#ef4444' : '#facc15';
        ctx.beginPath();
        ctx.roundRect(br.x, timerBarY, br.size * pct, 8, 4);
        ctx.fill();
        for(var r = 0; r < this.rows; r++){
            for(var c = 0; c < this.cols; c++){
                var cx = br.x + c * br.cell;
                var cy = br.y + r * br.cell;
                ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.2)';
                ctx.fillRect(cx + 1, cy + 1, br.cell - 2, br.cell - 2);
                var item = this.grid[r][c];
                if (!item) continue;
                var px = cx + br.cell / 2 + item.xOff;
                var py = cy + br.cell / 2 + item.yOff;
                var candy = this.candies[item.type];
                var rad = br.cell * 0.41 * item.pop;
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
                _emojiCache.EmojiCache.draw(ctx, item.special === 'bomb' ? '🌈' : candy.icon, px, py, Math.round(br.cell * 0.6));
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
        ctx.fillText("⏱️ " + Math.ceil(this.turnTimer) + "s  \xb7  \uD83C\uDFAF Moves: " + this.movesLeft + "  \xb7  Goal: " + this.level * 500, this.width / 2, Math.min(this.height - 14, br.y + br.size + 26));
        ctx.textAlign = 'left';
    };
    return CandyClashGame;
}(_BaseGame.BaseGame);

});
// === MODULE: src/games/candy-clash/candyLogic ===
ArcadeMod.define("src/games/candy-clash/candyLogic", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get computeSwipeTarget () {
        return computeSwipeTarget;
    },
    get createInitialCandyGrid () {
        return createInitialCandyGrid;
    },
    get findMatchesOnGrid () {
        return findMatchesOnGrid;
    },
    get hasAnyValidCandyMove () {
        return hasAnyValidCandyMove;
    },
    get tickCandyTurnTimer () {
        return tickCandyTurnTimer;
    }
});
function findMatchesOnGrid(grid) {
    var rows = grid.length;
    var cols = rows > 0 ? grid[0].length : 0;
    var matched = Array.from({
        length: rows
    }, function() {
        return new Array(cols).fill(false);
    });
    var runs = [];
    for(var r = 0; r < rows; r++){
        var c = 0;
        while(c < cols){
            var _grid_r_c, _grid_r_end;
            var t = (_grid_r_c = grid[r][c]) == null ? void 0 : _grid_r_c.type;
            var end = c + 1;
            while(end < cols && t !== undefined && ((_grid_r_end = grid[r][end]) == null ? void 0 : _grid_r_end.type) === t)end++;
            if (t !== undefined && end - c >= 3) {
                var cells = [];
                for(var k = c; k < end; k++){
                    matched[r][k] = true;
                    cells.push({
                        r: r,
                        c: k
                    });
                }
                runs.push({
                    len: end - c,
                    dir: 'h',
                    cells: cells,
                    type: t
                });
            }
            c = end;
        }
    }
    for(var c1 = 0; c1 < cols; c1++){
        var r1 = 0;
        while(r1 < rows){
            var _grid_r_c1, _grid_end_c;
            var t1 = (_grid_r_c1 = grid[r1][c1]) == null ? void 0 : _grid_r_c1.type;
            var end1 = r1 + 1;
            while(end1 < rows && t1 !== undefined && ((_grid_end_c = grid[end1][c1]) == null ? void 0 : _grid_end_c.type) === t1)end1++;
            if (t1 !== undefined && end1 - r1 >= 3) {
                var cells1 = [];
                for(var k1 = r1; k1 < end1; k1++){
                    matched[k1][c1] = true;
                    cells1.push({
                        r: k1,
                        c: c1
                    });
                }
                runs.push({
                    len: end1 - r1,
                    dir: 'v',
                    cells: cells1,
                    type: t1
                });
            }
            r1 = end1;
        }
    }
    return {
        matched: matched,
        runs: runs
    };
}
function hasAnyValidCandyMove(grid) {
    var rows = grid.length;
    var cols = rows > 0 ? grid[0].length : 0;
    for(var r = 0; r < rows; r++){
        for(var c = 0; c < cols; c++){
            var a = grid[r][c];
            if (!a) continue;
            if (a.special === 'bomb') return true;
            if (c + 1 < cols && grid[r][c + 1]) {
                var b = grid[r][c + 1];
                if (b.special === 'bomb') return true;
                grid[r][c] = b;
                grid[r][c + 1] = a;
                var ok = findMatchesOnGrid(grid).runs.length > 0;
                grid[r][c] = a;
                grid[r][c + 1] = b;
                if (ok) return true;
            }
            if (r + 1 < rows && grid[r + 1][c]) {
                var b1 = grid[r + 1][c];
                if (b1.special === 'bomb') return true;
                grid[r][c] = b1;
                grid[r + 1][c] = a;
                var ok1 = findMatchesOnGrid(grid).runs.length > 0;
                grid[r][c] = a;
                grid[r + 1][c] = b1;
                if (ok1) return true;
            }
        }
    }
    return false;
}
function createInitialCandyGrid(rows, cols, candyCount, rng) {
    if (rng === void 0) rng = Math.random;
    for(var attempt = 0; attempt < 25; attempt++){
        var grid = [];
        for(var r = 0; r < rows; r++){
            grid[r] = [];
            for(var c = 0; c < cols; c++){
                var type = 0;
                var guard = 0;
                do {
                    type = Math.floor(rng() * candyCount);
                    guard++;
                }while (guard < 20 && (c >= 2 && grid[r][c - 1].type === type && grid[r][c - 2].type === type || r >= 2 && grid[r - 1][c].type === type && grid[r - 2][c].type === type));
                grid[r][c] = {
                    type: type,
                    special: null,
                    yOff: 0,
                    xOff: 0,
                    pop: 1
                };
            }
        }
        if (hasAnyValidCandyMove(grid)) return grid;
    }
    return createInitialCandyGridFallback(rows, cols, candyCount);
}
function createInitialCandyGridFallback(rows, cols, candyCount) {
    var grid = [];
    for(var r = 0; r < rows; r++){
        grid[r] = [];
        for(var c = 0; c < cols; c++){
            grid[r][c] = {
                type: (r * 2 + c) % candyCount,
                special: null,
                yOff: 0,
                xOff: 0,
                pop: 1
            };
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
function computeSwipeTarget(originR, originC, dx, dy, threshold, rows, cols) {
    if (Math.hypot(dx, dy) < threshold) return null;
    var tr = originR;
    var tc = originC;
    if (Math.abs(dx) >= Math.abs(dy)) tc += dx > 0 ? 1 : -1;
    else tr += dy > 0 ? 1 : -1;
    if (tr < 0 || tr >= rows || tc < 0 || tc >= cols) return null;
    return {
        r: tr,
        c: tc
    };
}
function tickCandyTurnTimer(turnTimer, turnDuration, movesLeft, dt) {
    var next = turnTimer - dt;
    if (next > 0) {
        return {
            turnTimer: next,
            movesLeft: movesLeft,
            expired: false
        };
    }
    return {
        turnTimer: turnDuration,
        movesLeft: Math.max(0, movesLeft - 1),
        expired: true
    };
}

});

})(window.ArcadeMod);
