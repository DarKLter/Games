(function(ArcadeMod){
// === MODULE: src/games/block-blast/BlockBlast ===
ArcadeMod.define("src/games/block-blast/BlockBlast", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BlockBlastGame", {
    enumerable: true,
    get: function() {
        return BlockBlastGame;
    }
});
var _audio = require("../../core/audio");
var _runtimeBridge = require("../../core/runtimeBridge");
var _BaseGame = require("../../core/BaseGame");
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
var BlockBlastGame = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(BlockBlastGame, BaseGame);
    function BlockBlastGame() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.size = 8, _this.board = [], _this.palette = [
            '#38bdf8',
            '#f472b6',
            '#facc15',
            '#4ade80',
            '#fb923c',
            '#a78bfa'
        ], _this.shapesCatalog = [
            [
                [
                    1
                ]
            ],
            [
                [
                    1,
                    1
                ]
            ],
            [
                [
                    1
                ],
                [
                    1
                ]
            ],
            [
                [
                    1,
                    1,
                    1
                ]
            ],
            [
                [
                    1
                ],
                [
                    1
                ],
                [
                    1
                ]
            ],
            [
                [
                    1,
                    1
                ],
                [
                    1,
                    1
                ]
            ],
            [
                [
                    1,
                    1,
                    1
                ],
                [
                    0,
                    1,
                    0
                ]
            ],
            [
                [
                    1,
                    0
                ],
                [
                    1,
                    1
                ]
            ],
            [
                [
                    0,
                    1
                ],
                [
                    1,
                    1
                ]
            ],
            [
                [
                    1,
                    1,
                    1,
                    1
                ]
            ],
            [
                [
                    1
                ],
                [
                    1
                ],
                [
                    1
                ],
                [
                    1
                ]
            ],
            [
                [
                    1,
                    1,
                    1
                ],
                [
                    1,
                    0,
                    0
                ]
            ],
            [
                [
                    1,
                    1,
                    1
                ],
                [
                    0,
                    0,
                    1
                ]
            ],
            [
                [
                    1,
                    1,
                    0
                ],
                [
                    0,
                    1,
                    1
                ]
            ],
            [
                [
                    1,
                    1,
                    1
                ],
                [
                    1,
                    1,
                    1
                ],
                [
                    1,
                    1,
                    1
                ]
            ]
        ], _this.tray = [], _this.dragging = null;
        return _this;
    }
    var _proto = BlockBlastGame.prototype;
    _proto.init = function init() {
        var _this = this;
        this.size = 8;
        this.board = Array.from({
            length: this.size
        }, function() {
            return new Array(_this.size).fill(null);
        });
        this.maxLives = 1;
        this.lives = 1;
        this.dragging = null;
        this.refillTray();
    };
    _proto.refillTray = function refillTray() {
        this.tray = [];
        for(var i = 0; i < 3; i++){
            var mat = this.shapesCatalog[Math.floor(Math.random() * this.shapesCatalog.length)];
            var color = this.palette[Math.floor(Math.random() * this.palette.length)];
            this.tray.push({
                mat: mat,
                color: color,
                used: false
            });
        }
        if (!this.hasAnyValidMove()) this.gameOverSequence(false);
    };
    _proto.resize = function resize() {
        BaseGame.prototype.resize.call(this);
        this.dragging = null;
        if (this.isPaused) this.draw();
    };
    _proto.getLayout = function getLayout() {
        var isCompactLand = this.width > this.height * 1.35 && this.height < 500;
        var topSafe = isCompactLand ? 44 : this.width < 460 ? 64 : 58;
        var trayH = isCompactLand ? Math.max(66, Math.min(86, this.height * 0.22)) : Math.max(82, Math.min(120, this.height * 0.21));
        var maxGrid = Math.min(this.width - 20, this.height - topSafe - trayH - (isCompactLand ? 16 : 22), 410);
        var cell = maxGrid / this.size;
        var bx = (this.width - maxGrid) / 2;
        var by = topSafe + Math.max(2, (this.height - topSafe - trayH - maxGrid - 12) / 2);
        var slotW = Math.min(130, (this.width - 20) / 3);
        var trayStartX = (this.width - slotW * 3) / 2;
        var trayY = by + maxGrid + (isCompactLand ? 8 : 12);
        return {
            bx: bx,
            by: by,
            gridPx: maxGrid,
            cell: cell,
            slotW: slotW,
            trayStartX: trayStartX,
            trayY: trayY,
            trayH: trayH
        };
    };
    _proto.canPlace = function canPlace(mat, r0, c0) {
        for(var r = 0; r < mat.length; r++){
            for(var c = 0; c < mat[r].length; c++){
                if (!mat[r][c]) continue;
                var rr = r0 + r;
                var cc = c0 + c;
                if (rr < 0 || rr >= this.size || cc < 0 || cc >= this.size || this.board[rr][cc]) return false;
            }
        }
        return true;
    };
    _proto.hasAnyValidMove = function hasAnyValidMove() {
        for(var _iterator = _create_for_of_iterator_helper_loose(this.tray), _step; !(_step = _iterator()).done;){
            var item = _step.value;
            if (item.used) continue;
            for(var r = 0; r < this.size; r++){
                for(var c = 0; c < this.size; c++){
                    if (this.canPlace(item.mat, r, c)) return true;
                }
            }
        }
        return false;
    };
    _proto.onPointerDown = function onPointerDown(x, y, pointerType) {
        if (pointerType === void 0) pointerType = 'mouse';
        if (this.gameOver || this.isPaused) return;
        var lay = this.getLayout();
        for(var i = 0; i < 3; i++){
            var item = this.tray[i];
            if (!item || item.used) continue;
            var sx = lay.trayStartX + i * lay.slotW;
            if (x >= sx && x <= sx + lay.slotW && y >= lay.trayY - 6 && y <= lay.trayY + lay.trayH) {
                var lift = pointerType === 'touch' ? 42 : 0;
                this.dragging = {
                    idx: i,
                    x: x,
                    y: y - lift,
                    pointerType: pointerType
                };
                _audio.ArcadeAudio.play('click');
                return;
            }
        }
    };
    _proto.releaseInputs = function releaseInputs() {
        this.dragging = null;
    };
    _proto.pause = function pause() {
        BaseGame.prototype.pause.call(this);
        this.releaseInputs();
    };
    _proto.onPointerMove = function onPointerMove(x, y, pointerType) {
        if (pointerType === void 0) pointerType = 'mouse';
        if (!this.dragging || this.gameOver || this.isPaused) return;
        var lift = this.dragging.pointerType === 'touch' || pointerType === 'touch' ? 42 : 0;
        this.dragging.x = x;
        this.dragging.y = y - lift;
    };
    _proto.onPointerUp = function onPointerUp() {
        if (this.gameOver || this.isPaused) {
            this.dragging = null;
            return;
        }
        if (!this.dragging) return;
        var lay = this.getLayout();
        var item = this.tray[this.dragging.idx];
        var mat = item.mat;
        var c0 = Math.round((this.dragging.x - lay.bx) / lay.cell - mat[0].length / 2);
        var r0 = Math.round((this.dragging.y - lay.by) / lay.cell - mat.length / 2);
        if (this.canPlace(mat, r0, c0)) {
            var _this, _loop = function(c1) {
                if (_this.board.every(function(row) {
                    return row[c1];
                })) fullCols.push(c1);
            };
            var placedCount = 0;
            for(var r = 0; r < mat.length; r++){
                for(var c = 0; c < mat[r].length; c++){
                    if (mat[r][c]) {
                        this.board[r0 + r][c0 + c] = item.color;
                        placedCount++;
                    }
                }
            }
            item.used = true;
            this.score += placedCount * 5;
            _audio.ArcadeAudio.play('place');
            var fullRows = [];
            var fullCols = [];
            for(var r1 = 0; r1 < this.size; r1++)if (this.board[r1].every(Boolean)) fullRows.push(r1);
            for(var c1 = 0; c1 < this.size; c1++)_this = this, _loop(c1);
            var lines = fullRows.length + fullCols.length;
            if (lines > 0) {
                var toClear = [];
                var seen = new Set();
                for(var _iterator = _create_for_of_iterator_helper_loose(fullRows), _step; !(_step = _iterator()).done;){
                    var r2 = _step.value;
                    for(var c2 = 0; c2 < this.size; c2++){
                        var key = r2 * this.size + c2;
                        if (!seen.has(key)) {
                            seen.add(key);
                            toClear.push({
                                r: r2,
                                c: c2,
                                color: this.board[r2][c2] || '#fff'
                            });
                        }
                    }
                }
                for(var _iterator1 = _create_for_of_iterator_helper_loose(fullCols), _step1; !(_step1 = _iterator1()).done;){
                    var c3 = _step1.value;
                    for(var r3 = 0; r3 < this.size; r3++){
                        var key1 = r3 * this.size + c3;
                        if (!seen.has(key1)) {
                            seen.add(key1);
                            toClear.push({
                                r: r3,
                                c: c3,
                                color: this.board[r3][c3] || '#fff'
                            });
                        }
                    }
                }
                for(var _iterator2 = _create_for_of_iterator_helper_loose(toClear), _step2; !(_step2 = _iterator2()).done;){
                    var cellInfo = _step2.value;
                    this.spawnParticles(lay.bx + (cellInfo.c + 0.5) * lay.cell, lay.by + (cellInfo.r + 0.5) * lay.cell, cellInfo.color, 4, 150);
                    this.board[cellInfo.r][cellInfo.c] = null;
                }
                var bonus = lines * lines * 45;
                this.score += bonus;
                (0, _runtimeBridge.addCoins)(lines * 2);
                (0, _runtimeBridge.addXp)(lines * 10);
                _audio.ArcadeAudio.play(lines > 1 ? 'combo' : 'clear');
                this.triggerShake(4 + lines * 2, 0.14);
                this.spawnPopup(this.width / 2, lay.by + lay.gridPx * 0.45, "\uD83D\uDCA5 " + lines + "x BLAST! +" + bonus, '#ffd700');
            }
            if (this.score >= this.level * 300) {
                this.level++;
                _audio.ArcadeAudio.play('levelup');
            }
            (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 9);
            if (this.tray.every(function(t) {
                return t.used;
            })) this.refillTray();
            else if (!this.hasAnyValidMove()) this.gameOverSequence(false);
        } else {
            _audio.ArcadeAudio.play('hurt');
        }
        this.dragging = null;
    };
    _proto.update = function update() {
        this.survivalElapsed = 0;
    };
    _proto.draw = function draw() {
        var ctx = this.ctx;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, this.width, this.height);
        var lay = this.getLayout();
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(lay.bx - 5, lay.by - 5, lay.gridPx + 10, lay.gridPx + 10, 12);
        ctx.fill();
        ctx.stroke();
        for(var r = 0; r < this.size; r++){
            for(var c = 0; c < this.size; c++){
                var x = lay.bx + c * lay.cell;
                var y = lay.by + r * lay.cell;
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
            var item = this.tray[this.dragging.idx];
            var mat = item.mat;
            var c0 = Math.round((this.dragging.x - lay.bx) / lay.cell - mat[0].length / 2);
            var r0 = Math.round((this.dragging.y - lay.by) / lay.cell - mat.length / 2);
            var valid = this.canPlace(mat, r0, c0);
            for(var r1 = 0; r1 < mat.length; r1++){
                for(var c1 = 0; c1 < mat[r1].length; c1++){
                    if (!mat[r1][c1]) continue;
                    var rr = r0 + r1;
                    var cc = c0 + c1;
                    if (rr >= 0 && rr < this.size && cc >= 0 && cc < this.size) {
                        ctx.fillStyle = valid ? 'rgba(132, 250, 176, 0.45)' : 'rgba(239, 68, 68, 0.42)';
                        ctx.fillRect(lay.bx + cc * lay.cell + 2, lay.by + rr * lay.cell + 2, lay.cell - 4, lay.cell - 4);
                    }
                }
            }
        }
        for(var i = 0; i < 3; i++){
            var item1 = this.tray[i];
            if (!item1 || item1.used) continue;
            var isDrag = this.dragging && this.dragging.idx === i;
            var miniCell = isDrag ? lay.cell * 0.92 : Math.min(20, (lay.slotW - 14) / 4);
            var mat1 = item1.mat;
            var pw = mat1[0].length * miniCell;
            var ph = mat1.length * miniCell;
            var ox = isDrag ? this.dragging.x - pw / 2 : lay.trayStartX + i * lay.slotW + (lay.slotW - pw) / 2;
            var oy = isDrag ? this.dragging.y - ph / 2 : lay.trayY + (lay.trayH - ph) / 2;
            ctx.fillStyle = item1.color;
            for(var r2 = 0; r2 < mat1.length; r2++){
                for(var c2 = 0; c2 < mat1[r2].length; c2++){
                    if (mat1[r2][c2]) {
                        ctx.beginPath();
                        ctx.roundRect(ox + c2 * miniCell + 1.5, oy + r2 * miniCell + 1.5, miniCell - 3, miniCell - 3, 4);
                        ctx.fill();
                    }
                }
            }
        }
    };
    return BlockBlastGame;
}(_BaseGame.BaseGame);

});

})(window.ArcadeMod);
