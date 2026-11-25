(function(ArcadeMod){
// === MODULE: src/games/plant-vs-zombie/PlantVsZombie ===
ArcadeMod.define("src/games/plant-vs-zombie/PlantVsZombie", function(require, module, exports) {
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
    get PVZ_CARDS () {
        return PVZ_CARDS;
    },
    get PlantVsZombie () {
        return PlantVsZombie;
    }
});
var _audio = require("../../core/audio");
var _emojiCache = require("../../core/emojiCache");
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
var PVZ_CARDS = [
    {
        id: 'sun',
        name: 'Sun',
        icon: '🌻',
        cost: 50,
        hp: 65
    },
    {
        id: 'pea',
        name: 'Pea',
        icon: '🌱',
        cost: 100,
        hp: 75
    },
    {
        id: 'snow',
        name: 'Snow',
        icon: '❄️',
        cost: 175,
        hp: 75
    },
    {
        id: 'repeater',
        name: 'Dual',
        icon: '🫛',
        cost: 200,
        hp: 80
    },
    {
        id: 'nut',
        name: 'Nut',
        icon: '🌰',
        cost: 50,
        hp: 320
    },
    {
        id: 'mine',
        name: 'Mine',
        icon: '💣',
        cost: 25,
        hp: 60
    },
    {
        id: 'jalapeno',
        name: 'Chili',
        icon: '🌶️',
        cost: 125,
        hp: 999
    },
    {
        id: 'cherry',
        name: 'Bomb',
        icon: '🍒',
        cost: 150,
        hp: 999
    },
    {
        id: 'shovel',
        name: 'Dig',
        icon: '🪓',
        cost: 0,
        hp: 999
    }
];
var SUN_HIT_RADIUS = 46;
var PlantVsZombie = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(PlantVsZombie, BaseGame);
    function PlantVsZombie() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.rows = 5, _this.cols = 8, _this.sun = 175, _this.selectedCard = 1, _this.cards = PVZ_CARDS, _this.plants = [], _this.zombies = [], _this.peas = [], _this.suns = [], _this.mowers = [], _this.spawnTimer = 2.0, _this.skySunTimer = 1.8, _this.zombiesSlain = 0, _this.animClock = 0;
        return _this;
    }
    var _proto = PlantVsZombie.prototype;
    _proto.init = function init() {
        var _this = this;
        this.rows = 5;
        this.cols = 8;
        this.sun = 175;
        this.selectedCard = 1;
        this.cards = PVZ_CARDS;
        this.plants = Array.from({
            length: this.rows
        }, function() {
            return new Array(_this.cols).fill(null);
        });
        this.zombies = [];
        this.peas = [];
        this.suns = [];
        this.mowers = Array.from({
            length: this.rows
        }, function(_, row) {
            return {
                row: row,
                col: -0.45,
                active: false,
                used: false
            };
        });
        this.spawnTimer = 2.0;
        this.skySunTimer = 1.6;
        this.zombiesSlain = 0;
        this.animClock = 0;
        this.maxLives = 1;
        this.lives = 1;
    };
    _proto.resize = function resize() {
        BaseGame.prototype.resize.call(this);
        if (this.isPaused) this.draw();
    };
    _proto.getGridRect = function getGridRect() {
        var isCompactLand = this.width > this.height * 1.35 && this.height < 480;
        var isNarrowPortrait = this.width < 540;
        var topBarY = isCompactLand ? 44 : this.width < 460 ? 58 : 50;
        var barH = 44;
        var trayRows = isNarrowPortrait ? 2 : 1;
        var rowGap = 5;
        var availTop = topBarY + trayRows * barH + (trayRows - 1) * rowGap + (isCompactLand ? 6 : 10);
        var leftPad = 32;
        var cw = Math.min(58, (this.width - leftPad - 14) / this.cols);
        var ch = Math.min(62, (this.height - availTop - 12) / this.rows);
        var gw = cw * this.cols;
        var gh = ch * this.rows;
        return {
            topBarY: topBarY,
            barH: barH,
            rowGap: rowGap,
            isNarrowPortrait: isNarrowPortrait,
            x: leftPad + Math.max(0, (this.width - leftPad - gw) / 2),
            y: availTop + Math.max(0, (this.height - availTop - gh) / 2),
            cw: cw,
            ch: ch,
            gw: gw,
            gh: gh
        };
    };
    _proto.getCardButtons = function getCardButtons(rect) {
        if (rect.isNarrowPortrait) {
            // 2-row layout on narrow portrait screens so every touch target stays >= 44px wide & tall
            var gap = 5;
            var colsPerRow = 5;
            var maxRowW = Math.min(420, this.width - 16);
            var cellW = Math.max(44, Math.floor((maxRowW - gap * (colsPerRow - 1)) / colsPerRow));
            var rowTotalW = colsPerRow * cellW + (colsPerRow - 1) * gap;
            var startX = (this.width - rowTotalW) / 2;
            var btns = [
                {
                    type: 'sun',
                    x: startX,
                    y: rect.topBarY,
                    w: cellW,
                    h: rect.barH
                }
            ];
            this.cards.forEach(function(_, idx) {
                var slot = idx + 1; // slot 0 is sun indicator
                var r = Math.floor(slot / colsPerRow);
                var c = slot % colsPerRow;
                btns.push({
                    type: 'card',
                    idx: idx,
                    x: startX + c * (cellW + gap),
                    y: rect.topBarY + r * (rect.barH + rect.rowGap),
                    w: cellW,
                    h: rect.barH
                });
            });
            return btns;
        }
        var gap1 = 5;
        var sunBoxW = 60;
        var availCardsW = Math.max(180, this.width - 18 - sunBoxW - gap1);
        var cardW = Math.max(44, Math.min(58, Math.floor((availCardsW - gap1 * this.cards.length) / this.cards.length)));
        var totalW = sunBoxW + gap1 + this.cards.length * (cardW + gap1) - gap1;
        var sx = Math.max(6, (this.width - totalW) / 2);
        var btns1 = [
            {
                type: 'sun',
                x: sx,
                y: rect.topBarY,
                w: sunBoxW,
                h: rect.barH
            }
        ];
        sx += sunBoxW + gap1;
        this.cards.forEach(function(_, idx) {
            btns1.push({
                type: 'card',
                idx: idx,
                x: sx + idx * (cardW + gap1),
                y: rect.topBarY,
                w: cardW,
                h: rect.barH
            });
        });
        return btns1;
    };
    _proto.tryCollectSun = function tryCollectSun(x, y) {
        for(var i = this.suns.length - 1; i >= 0; i--){
            var s = this.suns[i];
            if (Math.hypot(x - s.x, y - s.y) <= SUN_HIT_RADIUS) {
                this.sun += 25;
                this.suns.splice(i, 1);
                _audio.ArcadeAudio.play('coin');
                this.spawnParticles(s.x, s.y, '#facc15', 8, 120);
                this.spawnPopup(s.x, s.y - 12, '+25☀️', '#facc15');
                return true;
            }
        }
        return false;
    };
    _proto.onPointerDown = function onPointerDown(x, y) {
        if (this.gameOver || this.isPaused) return;
        if (this.tryCollectSun(x, y)) return;
        var rect = this.getGridRect();
        for(var _iterator = _create_for_of_iterator_helper_loose(this.getCardButtons(rect)), _step; !(_step = _iterator()).done;){
            var b = _step.value;
            if (b.type === 'card' && b.idx !== undefined && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
                this.selectedCard = b.idx;
                _audio.ArcadeAudio.play('click');
                return;
            }
        }
        var c = Math.floor((x - rect.x) / rect.cw);
        var r = Math.floor((y - rect.y) / rect.ch);
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
            var card = this.cards[this.selectedCard];
            if (card.id === 'shovel') {
                var existing = this.plants[r][c];
                if (existing) {
                    var orig = this.cards.find(function(k) {
                        return k.id === existing.id;
                    });
                    var refund = orig ? Math.floor(orig.cost * 0.5) : 0;
                    this.sun += refund;
                    this.plants[r][c] = null;
                    _audio.ArcadeAudio.play('slide');
                    this.spawnPopup(x, y - 10, "+" + refund + "☀️", '#84fab0');
                }
                return;
            }
            if (this.sun < card.cost) {
                _audio.ArcadeAudio.play('hurt');
                this.spawnPopup(x, y - 10, 'Need ☀️!', '#ef4444');
                return;
            }
            if (card.id === 'cherry') {
                this.sun -= card.cost;
                var bx = rect.x + (c + 0.5) * rect.cw;
                var by = rect.y + (r + 0.5) * rect.ch;
                _audio.ArcadeAudio.play('explosion');
                this.triggerShake(9, 0.22);
                this.spawnParticles(bx, by, '#ef4444', 20, 230);
                for(var i = this.zombies.length - 1; i >= 0; i--){
                    var zb = this.zombies[i];
                    if (Math.abs(zb.row - r) <= 1 && Math.abs(zb.col - c) <= 1.7) {
                        zb.hp -= 190;
                        if (zb.hp <= 0) this.defeatZombie(i);
                    }
                }
                return;
            }
            if (card.id === 'jalapeno') {
                this.sun -= card.cost;
                var by1 = rect.y + (r + 0.5) * rect.ch;
                _audio.ArcadeAudio.play('explosion');
                this.triggerShake(8, 0.2);
                this.spawnParticles(rect.x + rect.gw / 2, by1, '#fb923c', 24, 240);
                this.spawnPopup(rect.x + rect.gw / 2, by1 - 12, '🌶️ LANE FIRE!', '#fb923c');
                for(var i1 = this.zombies.length - 1; i1 >= 0; i1--){
                    if (this.zombies[i1].row === r) {
                        this.zombies[i1].hp -= 200;
                        if (this.zombies[i1].hp <= 0) this.defeatZombie(i1);
                    }
                }
                return;
            }
            if (!this.plants[r][c]) {
                this.sun -= card.cost;
                this.plants[r][c] = {
                    id: card.id,
                    hp: card.hp,
                    maxHp: card.hp,
                    timer: card.id === 'sun' ? 4.0 : card.id === 'mine' ? 3.5 : 1.0,
                    armed: card.id !== 'mine'
                };
                _audio.ArcadeAudio.play('plant');
                this.spawnParticles(rect.x + (c + 0.5) * rect.cw, rect.y + (r + 0.5) * rect.ch, '#4ade80', 6, 90);
            }
        }
    };
    _proto.onPointerMove = function onPointerMove(x, y) {
        if (this.gameOver || this.isPaused) return;
        this.tryCollectSun(x, y);
    };
    _proto.defeatZombie = function defeatZombie(index) {
        var zb = this.zombies[index];
        this.zombies.splice(index, 1);
        this.zombiesSlain++;
        this.score += zb.isBoss ? 180 : 35;
        (0, _runtimeBridge.addCoins)(zb.isBoss ? 6 : 1);
        (0, _runtimeBridge.addXp)(zb.isBoss ? 20 : 6);
        if (this.zombiesSlain % 10 === 0) {
            this.level++;
            _audio.ArcadeAudio.play('levelup');
            this.spawnPopup(this.width / 2, this.height * 0.3, "\uD83C\uDF0A ZOMBIE WAVE " + this.level + "!", '#84fab0');
        }
        (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 12);
    };
    _proto.update = function update(dt) {
        var _this, _loop = function(r) {
            var _this1, _loop = function(c) {
                var pl = _this1.plants[r][c];
                if (!pl) return "continue";
                pl.timer -= dt;
                if (pl.id === 'sun' && pl.timer <= 0) {
                    pl.timer = 7.0;
                    _this1.suns.push({
                        x: rect.x + (c + 0.5) * rect.cw,
                        y: rect.y + (r + 0.5) * rect.ch - 14,
                        targetY: rect.y + (r + 0.65) * rect.ch,
                        ttl: 9
                    });
                } else if (pl.id === 'mine') {
                    if (!pl.armed && pl.timer <= 0) {
                        pl.armed = true;
                        _audio.ArcadeAudio.play('click');
                    }
                    if (pl.armed) {
                        var target = _this1.zombies.some(function(z) {
                            return z.row === r && Math.abs(z.col - c) < 0.72;
                        });
                        if (target) {
                            _this1.plants[r][c] = null;
                            var bx = rect.x + (c + 0.5) * rect.cw;
                            var by = rect.y + (r + 0.5) * rect.ch;
                            _audio.ArcadeAudio.play('explosion');
                            _this1.triggerShake(7, 0.18);
                            _this1.spawnParticles(bx, by, '#facc15', 16, 180);
                            _this1.spawnPopup(bx, by - 12, '💥 SPUDOW!', '#facc15');
                            for(var zi = _this1.zombies.length - 1; zi >= 0; zi--){
                                if (_this1.zombies[zi].row === r && Math.abs(_this1.zombies[zi].col - c) < 1.1) {
                                    _this1.zombies[zi].hp -= 240;
                                    if (_this1.zombies[zi].hp <= 0) _this1.defeatZombie(zi);
                                }
                            }
                        }
                    }
                } else if ((pl.id === 'pea' || pl.id === 'snow' || pl.id === 'repeater') && pl.timer <= 0) {
                    var hasTarget = _this1.zombies.some(function(z) {
                        return z.row === r && z.col >= c;
                    });
                    if (hasTarget) {
                        if (pl.id === 'repeater') {
                            if (!pl.burstLeft) {
                                pl.burstLeft = 1;
                                pl.timer = 0.22;
                            } else {
                                pl.burstLeft = 0;
                                pl.timer = 1.15;
                            }
                            _this1.peas.push({
                                row: r,
                                col: c + 0.4,
                                isIce: false,
                                dmg: 22
                            });
                        } else {
                            pl.timer = 1.3;
                            _this1.peas.push({
                                row: r,
                                col: c + 0.4,
                                isIce: pl.id === 'snow',
                                dmg: 22
                            });
                        }
                        _audio.ArcadeAudio.play('shoot');
                    } else {
                        pl.timer = 0.25;
                    }
                }
            };
            for(var c = 0; c < _this.cols; c++)_this1 = _this, _loop(c);
        };
        if (this.gameOver) return;
        this.animClock += dt;
        var rect = this.getGridRect();
        this.skySunTimer -= dt;
        if (this.skySunTimer <= 0) {
            this.skySunTimer = 5.0;
            this.suns.push({
                x: rect.x + 24 + Math.random() * Math.max(20, rect.gw - 48),
                y: rect.y - 10,
                targetY: rect.y + 38 + Math.random() * Math.max(30, rect.gh - 56),
                ttl: 9
            });
        }
        for(var i = this.suns.length - 1; i >= 0; i--){
            var s = this.suns[i];
            if (s.y < s.targetY) s.y = Math.min(s.targetY, s.y + 42 * dt);
            else {
                s.ttl -= dt;
                if (s.ttl <= 0) this.suns.splice(i, 1);
            }
        }
        for(var r = 0; r < this.rows; r++)_this = this, _loop(r);
        for(var i1 = this.peas.length - 1; i1 >= 0; i1--){
            var p = this.peas[i1];
            p.col += 4.8 * dt;
            var hit = false;
            for(var j = this.zombies.length - 1; j >= 0; j--){
                var zb = this.zombies[j];
                if (zb.row === p.row && Math.abs(zb.col - p.col) < 0.44) {
                    zb.hp -= p.dmg;
                    if (p.isIce) zb.chillTimer = 3.2;
                    hit = true;
                    _audio.ArcadeAudio.play('zombieHit');
                    if (zb.hp <= 0) this.defeatZombie(j);
                    break;
                }
            }
            if (hit || p.col > this.cols + 0.5) this.peas.splice(i1, 1);
        }
        // Active Lawnmowers mow entire row cleanly
        for(var _iterator = _create_for_of_iterator_helper_loose(this.mowers), _step; !(_step = _iterator()).done;){
            var mw = _step.value;
            if (mw.active) {
                mw.col += 6.2 * dt;
                for(var i2 = this.zombies.length - 1; i2 >= 0; i2--){
                    if (this.zombies[i2].row === mw.row && Math.abs(this.zombies[i2].col - mw.col) < 0.65) {
                        this.defeatZombie(i2);
                    }
                }
                if (mw.col > this.cols + 0.8) {
                    mw.active = false;
                    mw.used = true;
                }
            }
        }
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnTimer = Math.max(1.35, (4.0 - this.level * 0.24) / this.scaler.spawnMult);
            var roll = Math.random();
            var isBoss = this.level >= 2 && roll > 0.86;
            var hp = isBoss ? 280 + this.level * 40 : roll > 0.68 ? 160 : roll > 0.42 ? 105 : 65;
            var spd = isBoss ? 0.2 : roll > 0.68 ? 0.24 : 0.28 + this.level * 0.02;
            this.zombies.push({
                row: Math.floor(Math.random() * this.rows),
                col: this.cols + 0.2,
                hp: hp,
                maxHp: hp,
                speed: spd,
                chillTimer: 0,
                icon: isBoss ? '👹' : roll > 0.68 ? '🪣' : roll > 0.42 ? '🧟‍♂️' : '🧟',
                isBoss: isBoss
            });
        }
        for(var i3 = this.zombies.length - 1; i3 >= 0; i3--){
            var zb1 = this.zombies[i3];
            if (zb1.chillTimer > 0) zb1.chillTimer -= dt;
            var chillFactor = zb1.chillTimer > 0 ? 0.45 : 1;
            var cIdx = Math.floor(zb1.col);
            var blocking = cIdx >= 0 && cIdx < this.cols ? this.plants[zb1.row][cIdx] : null;
            if (blocking) {
                blocking.hp -= (zb1.isBoss ? 36 : 22) * chillFactor * dt;
                if (blocking.hp <= 0) {
                    this.plants[zb1.row][cIdx] = null;
                    _audio.ArcadeAudio.play('chomp');
                }
            } else {
                zb1.col -= zb1.speed * chillFactor * this.scaler.speedMult * dt;
            }
            if (zb1.col < 0) {
                var mower = this.mowers[zb1.row];
                if (mower && !mower.used && !mower.active) {
                    mower.active = true;
                    _audio.ArcadeAudio.play('boost');
                    this.spawnPopup(rect.x, rect.y + (zb1.row + 0.5) * rect.ch, '🚜 MOWER!', '#facc15');
                } else if (zb1.col < -0.35 && (!mower || mower.used)) {
                    _audio.ArcadeAudio.play('hurt');
                    this.triggerShake(10, 0.25);
                    this.spawnPopup(this.width / 2, this.height * 0.35, '🧟 THE ZOMBIES ATE YOUR BRAINS!', '#ef4444');
                    this.gameOverSequence(false);
                    return;
                }
            }
        }
    };
    _proto.draw = function draw() {
        var ctx = this.ctx;
        var rect = this.getGridRect();
        ctx.fillStyle = '#14532d';
        ctx.fillRect(0, 0, this.width, this.height);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.getCardButtons(rect)), _step; !(_step = _iterator()).done;){
            var b = _step.value;
            if (b.type === 'sun') {
                ctx.fillStyle = 'rgba(0,0,0,0.65)';
                ctx.beginPath();
                ctx.roundRect(b.x, b.y, b.w, b.h, 8);
                ctx.fill();
                ctx.font = '800 11px system-ui, sans-serif';
                ctx.fillStyle = '#facc15';
                ctx.textAlign = 'center';
                ctx.fillText("☀️" + this.sun, b.x + b.w / 2, b.y + 27);
            } else if (b.idx !== undefined) {
                var card = this.cards[b.idx];
                var sel = this.selectedCard === b.idx;
                var ok = this.sun >= card.cost;
                ctx.fillStyle = sel ? '#84fab0' : ok ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.45)';
                ctx.strokeStyle = sel ? '#fff' : 'rgba(255,255,255,0.28)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(b.x, b.y, b.w, b.h, 8);
                ctx.fill();
                ctx.stroke();
                _emojiCache.EmojiCache.draw(ctx, card.icon, b.x + b.w / 2, b.y + 16, 18);
                ctx.font = '800 9.5px system-ui, sans-serif';
                ctx.fillStyle = sel ? '#0f172a' : ok ? '#facc15' : '#94a3b8';
                ctx.textAlign = 'center';
                ctx.fillText(card.cost > 0 ? "" + card.cost : 'DIG', b.x + b.w / 2, b.y + 39);
            }
        }
        ctx.textAlign = 'left';
        for(var r = 0; r < this.rows; r++){
            var _this, _loop = function(c) {
                var tx = rect.x + c * rect.cw;
                var ty = rect.y + r * rect.ch;
                ctx.fillStyle = (r + c) % 2 === 0 ? '#22c55e' : '#16a34a';
                ctx.fillRect(tx + 1, ty + 1, rect.cw - 2, rect.ch - 2);
                var pl = _this.plants[r][c];
                if (pl) {
                    var card = _this.cards.find(function(k) {
                        return k.id === pl.id;
                    });
                    var sz = pl.id === 'mine' && !pl.armed ? Math.round(Math.min(rect.cw, rect.ch) * 0.45) : Math.round(Math.min(rect.cw, rect.ch) * 0.68);
                    _emojiCache.EmojiCache.draw(ctx, card ? card.icon : '🌱', tx + rect.cw / 2, ty + rect.ch / 2, sz);
                }
            };
            for(var c = 0; c < this.cols; c++)_this = this, _loop(c);
            var mw = this.mowers[r];
            if (mw && !mw.used) {
                _emojiCache.EmojiCache.draw(ctx, '🚜', rect.x + mw.col * rect.cw, rect.y + (r + 0.5) * rect.ch, Math.round(rect.ch * 0.62), 0, -1, 1);
            }
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.peas), _step1; !(_step1 = _iterator1()).done;){
            var p = _step1.value;
            ctx.fillStyle = p.isIce ? '#7dd3fc' : '#bef264';
            ctx.beginPath();
            ctx.arc(rect.x + p.col * rect.cw, rect.y + (p.row + 0.45) * rect.ch, 6, 0, Math.PI * 2);
            ctx.fill();
        }
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.zombies), _step2; !(_step2 = _iterator2()).done;){
            var zb = _step2.value;
            var zx = rect.x + zb.col * rect.cw;
            var zy = rect.y + (zb.row + 0.5) * rect.ch;
            _emojiCache.EmojiCache.draw(ctx, zb.icon, zx, zy, Math.round(Math.min(rect.cw, rect.ch) * (zb.isBoss ? 0.88 : 0.72)));
            if (zb.chillTimer > 0) {
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(zx, zy, 18, 0, Math.PI * 2);
                ctx.stroke();
            }
            if (zb.hp < zb.maxHp) {
                ctx.fillStyle = '#000';
                ctx.fillRect(zx - 14, zy - 26, 28, 4);
                ctx.fillStyle = zb.isBoss ? '#facc15' : '#ef4444';
                ctx.fillRect(zx - 14, zy - 26, 28 * Math.max(0, zb.hp / zb.maxHp), 4);
            }
        }
        var pulse = 1 + Math.sin(this.animClock * 8) * 0.1;
        for(var _iterator3 = _create_for_of_iterator_helper_loose(this.suns), _step3; !(_step3 = _iterator3()).done;){
            var s = _step3.value;
            ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(s.x, s.y, 24 * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            _emojiCache.EmojiCache.draw(ctx, '☀️', s.x, s.y, 34);
        }
    };
    return PlantVsZombie;
}(_BaseGame.BaseGame);

});

})(window.ArcadeMod);
