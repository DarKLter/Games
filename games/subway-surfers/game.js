(function(ArcadeMod){
// === MODULE: src/games/subway-surfers/SubwaySurfers ===
ArcadeMod.define("src/games/subway-surfers/SubwaySurfers", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SubwaySurfersGame", {
    enumerable: true,
    get: function() {
        return SubwaySurfersGame;
    }
});
var _audio = require("../../core/audio");
var _emojiCache = require("../../core/emojiCache");
var _runtimeBridge = require("../../core/runtimeBridge");
var _storage = require("../../core/storage");
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
var SubwaySurfersGame = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(SubwaySurfersGame, BaseGame);
    function SubwaySurfersGame() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.lane = 1, _this.visualLane = 1, _this.jumpY = 0, _this.jumpVy = 0, _this.slideTimer = 0, _this.shield = 0, _this.magnet = 0, _this.jetpack = 0, _this.entities = [], _this.spawnTimer = 0.4, _this.trackOffset = 0, _this.swipeStart = null;
        return _this;
    }
    var _proto = SubwaySurfersGame.prototype;
    _proto.init = function init() {
        this.lane = 1;
        this.visualLane = 1;
        this.jumpY = 0;
        this.jumpVy = 0;
        this.slideTimer = 0;
        this.shield = 0;
        this.magnet = 0;
        this.jetpack = 0;
        this.entities = [];
        this.spawnTimer = 0.4;
        this.trackOffset = 0;
        this.swipeStart = null;
        this.maxLives = 3;
        this.lives = 3;
    };
    _proto.releaseInputs = function releaseInputs() {
        this.swipeStart = null;
    };
    _proto.pause = function pause() {
        BaseGame.prototype.pause.call(this);
        this.releaseInputs();
    };
    _proto.moveLeft = function moveLeft() {
        if (this.gameOver || this.isPaused) return;
        if (this.lane > 0) {
            this.lane--;
            _audio.ArcadeAudio.play('dash');
        }
    };
    _proto.moveRight = function moveRight() {
        if (this.gameOver || this.isPaused) return;
        if (this.lane < 2) {
            this.lane++;
            _audio.ArcadeAudio.play('dash');
        }
    };
    _proto.jump = function jump() {
        if (this.gameOver || this.isPaused) return;
        if (this.jumpY <= 1 && this.jetpack <= 0) {
            this.jumpVy = 13.5;
            this.slideTimer = 0;
            _audio.ArcadeAudio.play('jump');
        }
    };
    _proto.slide = function slide() {
        if (this.gameOver || this.isPaused) return;
        if (this.jetpack > 0) return;
        if (this.jumpY > 2) this.jumpVy = -14;
        this.slideTimer = 0.65;
        _audio.ArcadeAudio.play('slide');
    };
    _proto.onPointerDown = function onPointerDown(x, y) {
        if (this.gameOver || this.isPaused) return;
        this.swipeStart = {
            x: x,
            y: y
        };
    };
    _proto.onPointerMove = function onPointerMove(x, y) {
        if (!this.swipeStart || this.gameOver || this.isPaused) return;
        var dx = x - this.swipeStart.x;
        var dy = y - this.swipeStart.y;
        if (Math.hypot(dx, dy) > 26) {
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) this.moveRight();
                else this.moveLeft();
            } else if (dy < 0) {
                this.jump();
            } else {
                this.slide();
            }
            this.swipeStart = null;
        }
    };
    _proto.onPointerUp = function onPointerUp() {
        this.swipeStart = null;
    };
    _proto.project = function project(laneIdx, z) {
        var horizY = this.height * 0.28;
        var groundY = this.height * 0.88;
        var t = Math.max(0.05, 1 - z);
        var y = horizY + (groundY - horizY) * (t * t * 0.65 + t * 0.35);
        var spread = Math.min(this.width * 0.3, 140) * (0.16 + t * 0.84);
        var x = this.width / 2 + (laneIdx - 1) * spread;
        var scale = 0.22 + t * 0.88;
        return {
            x: x,
            y: y,
            scale: scale
        };
    };
    _proto.update = function update(dt) {
        if (this.gameOver) return;
        this.visualLane += (this.lane - this.visualLane) * (1 - Math.exp(-16 * dt));
        if (this.slideTimer > 0) this.slideTimer = Math.max(0, this.slideTimer - dt);
        if (this.shield > 0) this.shield = Math.max(0, this.shield - dt);
        if (this.magnet > 0) this.magnet = Math.max(0, this.magnet - dt);
        if (this.jetpack > 0) {
            this.jetpack = Math.max(0, this.jetpack - dt);
            this.jumpY += (88 - this.jumpY) * (1 - Math.exp(-8 * dt));
            this.jumpVy = 0;
        } else if (this.jumpY > 0 || this.jumpVy !== 0) {
            this.jumpY += this.jumpVy * dt * 28;
            this.jumpVy -= 36 * dt;
            if (this.jumpY <= 0) {
                this.jumpY = 0;
                this.jumpVy = 0;
            }
        }
        var spd = (0.42 + this.level * 0.03) * this.scaler.speedMult * (this.jetpack > 0 ? 1.45 : 1);
        this.trackOffset = (this.trackOffset + spd * dt * 12) % 1;
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnTimer = Math.max(0.38, (1.1 - this.level * 0.04) / this.scaler.spawnMult);
            var ln = Math.floor(Math.random() * 3);
            var roll = Math.random();
            var kind = 'coin';
            if (this.jetpack > 0) {
                kind = 'coin';
            } else if (roll < 0.23) kind = 'train';
            else if (roll < 0.45) kind = 'barrier';
            else if (roll < 0.64) kind = 'sign';
            else if (roll < 0.70) kind = 'shield';
            else if (roll < 0.75) kind = 'magnet';
            else if (roll < 0.79) kind = 'jetpack';
            var isHighCoin = this.jetpack > 0 && kind === 'coin';
            this.entities.push({
                lane: ln,
                z: 1.0,
                kind: kind,
                done: false,
                high: isHighCoin
            });
            if (kind === 'coin') {
                this.entities.push({
                    lane: ln,
                    z: 0.92,
                    kind: 'coin',
                    done: false,
                    high: isHighCoin
                });
                this.entities.push({
                    lane: ln,
                    z: 0.84,
                    kind: 'coin',
                    done: false,
                    high: isHighCoin
                });
            }
        }
        for(var i = this.entities.length - 1; i >= 0; i--){
            var e = this.entities[i];
            e.z -= spd * dt;
            var magnetCatch = this.magnet > 0 && e.kind === 'coin' && e.z <= 0.24 && e.z >= 0.0;
            var laneMatch = Math.abs(e.lane - this.visualLane) < 0.45;
            var heightMatch = !e.high || this.jumpY > 32 || this.jetpack > 0;
            if (!e.done && e.z <= 0.14 && e.z >= 0.02 && (laneMatch || magnetCatch) && (heightMatch || magnetCatch)) {
                if (e.kind === 'coin') {
                    e.done = true;
                    this.score += 15;
                    (0, _runtimeBridge.addCoins)(1);
                    _audio.ArcadeAudio.play('coin');
                    (0, _runtimeBridge.addXp)(3);
                    (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 10);
                    var p = this.project(e.lane, e.z);
                    this.spawnParticles(p.x, p.y - (16 + (e.high ? 58 : 0)) * p.scale, '#ffd700', 6, 120);
                } else if (e.kind === 'shield') {
                    e.done = true;
                    this.shield = 7;
                    _audio.ArcadeAudio.play('levelup');
                    var p1 = this.project(e.lane, e.z);
                    this.spawnPopup(p1.x, p1.y - 30, '🛡️ HOVERBOARD!', '#38bdf8');
                } else if (e.kind === 'magnet') {
                    e.done = true;
                    this.magnet = 8;
                    _audio.ArcadeAudio.play('levelup');
                    var p2 = this.project(e.lane, e.z);
                    this.spawnPopup(p2.x, p2.y - 30, '🧲 COIN MAGNET!', '#f472b6');
                } else if (e.kind === 'jetpack') {
                    e.done = true;
                    this.jetpack = 5;
                    _audio.ArcadeAudio.play('combo');
                    var p3 = this.project(e.lane, e.z);
                    this.spawnPopup(p3.x, p3.y - 30, '🚀 JETPACK FLY!', '#facc15');
                } else if (this.jetpack <= 0) {
                    var dodged = e.kind === 'barrier' && this.jumpY > 22 || e.kind === 'sign' && this.slideTimer > 0;
                    if (!dodged) {
                        e.done = true;
                        if (this.shield > 0) {
                            this.shield = 0;
                            _audio.ArcadeAudio.play('break');
                            this.triggerShake(5, 0.12);
                        } else {
                            this.lives--;
                            _audio.ArcadeAudio.play('hurt');
                            this.triggerShake(9, 0.2);
                            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                            if (this.lives <= 0) {
                                this.gameOverSequence();
                                return;
                            }
                        }
                    }
                }
            }
            if (!e.done && e.z < 0 && ![
                'coin',
                'shield',
                'magnet',
                'jetpack'
            ].includes(e.kind)) {
                e.done = true;
                this.score += 10;
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 10);
            }
            if (e.z < -0.1 || e.done) this.entities.splice(i, 1);
        }
    };
    _proto.draw = function draw() {
        var ctx = this.ctx;
        var horizY = this.height * 0.28;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, this.width, horizY);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, horizY, this.width, this.height - horizY);
        for(var ln = 0; ln < 3; ln++){
            var topP = this.project(ln, 0.95);
            var botP = this.project(ln, 0);
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(topP.x - 10, topP.y);
            ctx.lineTo(botP.x - 36, botP.y);
            ctx.moveTo(topP.x + 10, topP.y);
            ctx.lineTo(botP.x + 36, botP.y);
            ctx.stroke();
        }
        this.entities.sort(function(a, b) {
            return b.z - a.z;
        });
        for(var _iterator = _create_for_of_iterator_helper_loose(this.entities), _step; !(_step = _iterator()).done;){
            var e = _step.value;
            var p = this.project(e.lane, e.z);
            if (e.kind === 'coin') {
                _emojiCache.EmojiCache.draw(ctx, '🪙', p.x, p.y - (16 + (e.high ? 58 : 0)) * p.scale, Math.round(28 * p.scale));
            } else if (e.kind === 'shield') {
                _emojiCache.EmojiCache.draw(ctx, '🛡️', p.x, p.y - 20 * p.scale, Math.round(32 * p.scale));
            } else if (e.kind === 'magnet') {
                _emojiCache.EmojiCache.draw(ctx, '🧲', p.x, p.y - 20 * p.scale, Math.round(32 * p.scale));
            } else if (e.kind === 'jetpack') {
                _emojiCache.EmojiCache.draw(ctx, '🚀', p.x, p.y - 22 * p.scale, Math.round(34 * p.scale));
            } else if (e.kind === 'train') {
                var tw = 66 * p.scale;
                var th = 72 * p.scale;
                ctx.fillStyle = '#eab308';
                ctx.beginPath();
                ctx.roundRect(p.x - tw / 2, p.y - th, tw, th, 8);
                ctx.fill();
                ctx.fillStyle = '#0ea5e9';
                ctx.fillRect(p.x - tw * 0.36, p.y - th * 0.8, tw * 0.72, th * 0.34);
                _emojiCache.EmojiCache.draw(ctx, '🚇', p.x, p.y - th * 0.3, Math.round(32 * p.scale));
            } else if (e.kind === 'barrier') {
                var bw = 62 * p.scale;
                var bh = 26 * p.scale;
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(p.x - bw / 2, p.y - bh, bw, bh);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(p.x - bw / 2, p.y - bh + 4, bw, 5);
            } else if (e.kind === 'sign') {
                var sw = 66 * p.scale;
                var sy = p.y - 52 * p.scale;
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(p.x - sw / 2, sy - 24 * p.scale, sw, 24 * p.scale);
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(p.x - sw / 2, sy, 4, 52 * p.scale);
                ctx.fillRect(p.x + sw / 2 - 4, sy, 4, 52 * p.scale);
            }
        }
        var pl = this.project(this.visualLane, 0.08);
        var squashY = this.slideTimer > 0 ? 0.55 : 1;
        if (this.shield > 0) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(pl.x, pl.y - 22 - this.jumpY, 30, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (this.jetpack > 0) {
            _emojiCache.EmojiCache.draw(ctx, '🔥', pl.x, pl.y - 4 - this.jumpY, 26);
        }
        _emojiCache.EmojiCache.draw(ctx, _storage.playerState.currentAvatar, pl.x, pl.y - 22 * squashY - this.jumpY, 40, 0, 1, squashY);
        // Compact top-center badge
        var badgeY = this.width < 460 ? 52 : 12;
        ctx.fillStyle = 'rgba(0,0,0,0.58)';
        ctx.beginPath();
        ctx.roundRect(this.width / 2 - 84, badgeY, 168, 28, 14);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '800 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        var hearts = '❤️'.repeat(Math.max(0, this.lives)) + '🖤'.repeat(Math.max(0, this.maxLives - this.lives));
        var buffs = "" + (this.jetpack > 0 ? ' 🚀' : '') + (this.magnet > 0 ? ' 🧲' : '') + (this.shield > 0 ? ' 🛡️' : '');
        ctx.fillText("" + hearts + buffs, this.width / 2, badgeY + 18);
        ctx.textAlign = 'left';
    };
    return SubwaySurfersGame;
}(_BaseGame.BaseGame);

});

})(window.ArcadeMod);
