(function(ArcadeMod){
// === MODULE: src/games/super-runner/SuperRunner ===
ArcadeMod.define("src/games/super-runner/SuperRunner", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SuperRunner", {
    enumerable: true,
    get: function() {
        return SuperRunner;
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
var SuperRunner = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(SuperRunner, BaseGame);
    function SuperRunner() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.groundY = 0, _this.player = {
            x: 60,
            y: 0,
            w: 32,
            h: 42,
            vy: 0,
            jumping: false,
            jumpsUsed: 0
        }, _this.gravity = 0.65, _this.jumpForce = -13.5, _this.obstacles = [], _this.coins = [], _this.obstacleTimer = 0, _this.coinTimer = 0, _this.minObstacleGap = 200, _this.groundScroll = 0, _this.magnetTimer = 0, _this.shieldActive = false, _this.streak = 0;
        return _this;
    }
    var _proto = SuperRunner.prototype;
    _proto.calcGroundY = function calcGroundY() {
        return Math.round(this.height - Math.min(180, Math.max(76, this.height * 0.24)));
    };
    _proto.init = function init() {
        this.groundY = this.calcGroundY();
        var px = Math.round(Math.max(36, Math.min(100, this.width * 0.14)));
        this.player = {
            x: px,
            y: this.groundY - 42,
            w: 32,
            h: 42,
            vy: 0,
            jumping: false,
            jumpsUsed: 0
        };
        var hScale = Math.max(0.76, Math.min(1.1, this.height / 700));
        this.gravity = 0.65 * hScale;
        this.jumpForce = -13.5 * Math.sqrt(hScale);
        this.obstacles = [];
        this.coins = [];
        this.obstacleTimer = 0;
        this.coinTimer = 0;
        this.minObstacleGap = Math.max(170, Math.min(260, this.width * 0.34));
        this.groundScroll = 0;
        this.magnetTimer = 0;
        this.shieldActive = false;
        this.streak = 0;
    };
    _proto.resize = function resize() {
        BaseGame.prototype.resize.call(this);
        this.groundY = this.calcGroundY();
        this.minObstacleGap = Math.max(170, Math.min(260, this.width * 0.34));
        if (this.player) {
            this.player.x = Math.round(Math.max(36, Math.min(100, this.width * 0.14)));
            if (!this.player.jumping) this.player.y = this.groundY - this.player.h;
        }
    };
    _proto.update = function update(dt) {
        if (this.gameOver) return;
        var deltaMult = dt * 60;
        if (this.magnetTimer > 0) this.magnetTimer = Math.max(0, this.magnetTimer - dt);
        this.player.y += (this.player.vy + 0.5 * this.gravity * deltaMult) * deltaMult;
        this.player.vy += this.gravity * deltaMult;
        if (this.player.y >= this.groundY - this.player.h) {
            if (this.player.jumping) {
                this.spawnParticles(this.player.x + 16, this.groundY - 2, 'rgba(255,255,255,0.65)', 5, 80);
            }
            this.player.y = this.groundY - this.player.h;
            this.player.vy = 0;
            this.player.jumping = false;
            this.player.jumpsUsed = 0;
        }
        var speedScale = Math.max(0.82, Math.min(1.25, this.width / 460));
        var currentSpeed = (6.4 + this.level * 0.45) * this.scaler.speedMult * speedScale * deltaMult;
        this.groundScroll = (this.groundScroll + currentSpeed) % 48;
        this.obstacleTimer += deltaMult;
        this.coinTimer += deltaMult;
        if (this.coinTimer > 95 && Math.random() < 0.03 * deltaMult) {
            this.coinTimer = 0;
            var roll = Math.random();
            var kind = 'coin';
            var label = '🪙';
            var val = 1;
            if (roll < 0.12) {
                kind = 'magnet';
                label = '🧲';
                val = 3;
            } else if (roll < 0.22 && !this.shieldActive) {
                kind = 'shield';
                label = '🛡️';
                val = 3;
            } else if (roll < 0.38) {
                kind = 'star';
                label = '⭐';
                val = 5;
            }
            var floatH = Math.min(this.groundY - 36, kind === 'coin' ? 45 + Math.random() * 40 : Math.min(108, this.height * 0.18));
            this.coins.push({
                x: this.width + 30,
                y: this.groundY - floatH,
                r: 13,
                label: label,
                val: val,
                kind: kind,
                collected: false
            });
        }
        var lastObs = this.obstacles[this.obstacles.length - 1];
        var distFromLast = lastObs ? this.width - lastObs.x : 999;
        if (this.obstacleTimer > 55 / this.scaler.spawnMult && distFromLast >= this.minObstacleGap && Math.random() < 0.09 * deltaMult) {
            var randType = Math.random();
            var type = 'standard';
            var obsW = 22;
            var obsH = 30;
            var obsY = this.groundY - 30;
            var label1 = '🧱';
            if (this.level >= 2 && randType < 0.35) {
                type = 'flying';
                obsW = 28;
                obsH = 22;
                obsY = this.groundY - Math.min(76, Math.round(this.height * 0.14));
                label1 = '🦇';
            } else if (randType > 0.7) {
                type = 'small';
                obsW = 16;
                obsH = 16;
                obsY = this.groundY - 16;
                label1 = '🪨';
            }
            this.obstacles.push({
                x: this.width,
                y: obsY,
                w: obsW,
                h: obsH,
                type: type,
                label: label1,
                passed: false
            });
            this.obstacleTimer = 0;
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(this.obstacles), _step; !(_step = _iterator()).done;){
            var o = _step.value;
            o.x -= currentSpeed;
            if (!o.passed && o.x + o.w < this.player.x) {
                o.passed = true;
                this.streak++;
                var bonus = this.streak >= 5 ? 15 : 10;
                this.score += bonus;
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 0);
                this.spawnPopup(this.player.x + 16, this.player.y - 10, this.streak >= 5 ? "+" + bonus + " \uD83D\uDD25" : "+" + bonus, this.streak >= 5 ? '#facc15' : '#84fab0');
            }
        }
        var pcx = this.player.x + 16;
        var pcy = this.player.y + 21;
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.coins), _step1; !(_step1 = _iterator1()).done;){
            var c = _step1.value;
            if (this.magnetTimer > 0 && c.kind === 'coin') {
                var dx = pcx - c.x;
                var dy = pcy - c.y;
                var d = Math.hypot(dx, dy);
                if (d < 220 && d > 1) {
                    c.x += dx / d * 340 * dt;
                    c.y += dy / d * 340 * dt;
                } else {
                    c.x -= currentSpeed;
                }
            } else {
                c.x -= currentSpeed;
            }
            if (!c.collected && Math.hypot(c.x - pcx, c.y - pcy) < 26) {
                c.collected = true;
                if (c.kind === 'magnet') {
                    this.magnetTimer = 8;
                    _audio.ArcadeAudio.play('levelup');
                    this.spawnPopup(c.x, c.y - 14, '🧲 MAGNET 8s!', '#38bdf8');
                } else if (c.kind === 'shield') {
                    this.shieldActive = true;
                    _audio.ArcadeAudio.play('levelup');
                    this.spawnPopup(c.x, c.y - 14, '🛡️ SHIELD!', '#84fab0');
                } else {
                    _audio.ArcadeAudio.play('coin');
                    this.spawnPopup(c.x, c.y - 12, "+" + c.val + "\uD83E\uDE99", '#ffd700');
                }
                (0, _runtimeBridge.addCoins)(c.val);
                (0, _runtimeBridge.addXp)(2 * c.val);
                this.score += c.val * 4;
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 0);
                this.spawnParticles(c.x, c.y, '#ffd700', 8, 130);
            }
        }
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.obstacles), _step2; !(_step2 = _iterator2()).done;){
            var o1 = _step2.value;
            if (!o1.passed && this.player.x < o1.x + o1.w && this.player.x + this.player.w > o1.x && this.player.y < o1.y + o1.h && this.player.y + this.player.h > o1.y) {
                o1.passed = true;
                o1.x = -200;
                if (this.shieldActive) {
                    this.shieldActive = false;
                    _audio.ArcadeAudio.play('break');
                    this.triggerShake(5, 0.12);
                    this.spawnParticles(pcx, pcy, '#84fab0', 12, 160);
                    this.spawnPopup(pcx, this.player.y - 16, '🛡️ SAVED!', '#84fab0');
                    continue;
                }
                this.streak = 0;
                this.lives--;
                _audio.ArcadeAudio.play('hurt');
                this.triggerShake(7, 0.16);
                this.spawnParticles(pcx, pcy, '#ff6b6b', 10, 160);
                (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                if (this.lives <= 0) {
                    this.gameOverSequence();
                    return;
                }
            }
        }
        this.obstacles = this.obstacles.filter(function(o) {
            return o.x > -60;
        });
        this.coins = this.coins.filter(function(c) {
            return c.x > -40 && !c.collected;
        });
    };
    _proto.draw = function draw() {
        this.ctx.fillStyle = this.level >= 50 ? '#000000' : this.getDynamicSkyColor();
        this.ctx.fillRect(0, 0, this.width, this.groundY);
        if (this.level >= 50) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
        } else {
            this.ctx.fillStyle = '#228B22';
            this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
            this.ctx.fillStyle = 'rgba(255,255,255,0.22)';
            for(var gx = -this.groundScroll; gx < this.width; gx += 48){
                this.ctx.fillRect(gx, this.groundY + 6, 22, 4);
            }
        }
        var jumpTilt = this.player.jumping ? Math.max(-0.22, Math.min(0.22, this.player.vy * 0.015)) : 0;
        if (this.shieldActive) {
            this.ctx.strokeStyle = '#38bdf8';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x + 16, this.player.y + 21, 24, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        _emojiCache.EmojiCache.draw(this.ctx, _storage.playerState.currentAvatar, this.player.x + 16, this.player.y + 21, 32, jumpTilt);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.coins), _step; !(_step = _iterator()).done;){
            var c = _step.value;
            if (!c.collected) _emojiCache.EmojiCache.draw(this.ctx, c.label, c.x, c.y, 24);
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.obstacles), _step1; !(_step1 = _iterator1()).done;){
            var o = _step1.value;
            if (this.level >= 50) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(o.x, o.y, o.w, o.h);
                this.ctx.strokeStyle = '#000000';
                this.ctx.strokeRect(o.x, o.y, o.w, o.h);
            } else if (o.type === 'flying') {
                _emojiCache.EmojiCache.draw(this.ctx, o.label, o.x + o.w / 2, o.y + o.h / 2, 24);
            } else if (o.type === 'small') {
                this.ctx.fillStyle = '#7f8c8d';
                this.ctx.fillRect(o.x, o.y, o.w, o.h);
            } else {
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(o.x, o.y, o.w, o.h);
            }
        }
        // Crisp on-canvas lives & active powerups badge
        var badgeY = this.width < 460 ? 52 : 12;
        this.ctx.fillStyle = 'rgba(10,16,24,0.72)';
        this.ctx.beginPath();
        this.ctx.roundRect(this.width / 2 - 74, badgeY, 148, 28, 14);
        this.ctx.fill();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '800 12px system-ui, sans-serif';
        this.ctx.textAlign = 'center';
        var hearts = '❤️'.repeat(Math.max(0, this.lives)) + '🖤'.repeat(Math.max(0, this.maxLives - this.lives));
        var buff = this.magnetTimer > 0 ? " \uD83E\uDDF2" + Math.ceil(this.magnetTimer) + "s" : this.shieldActive ? ' 🛡️' : '';
        this.ctx.fillText("" + hearts + buff, this.width / 2, badgeY + 18);
        this.ctx.textAlign = 'left';
    };
    _proto.jump = function jump() {
        if (this.gameOver || this.isPaused) return;
        if (this.player.jumpsUsed < 2) {
            this.player.vy = this.jumpForce * (this.player.jumpsUsed === 1 ? 0.92 : 1);
            this.player.jumping = true;
            this.player.jumpsUsed++;
            _audio.ArcadeAudio.play('jump');
            this.spawnParticles(this.player.x + 16, this.player.y + this.player.h, 'rgba(255,255,255,0.7)', 6, 95);
        }
    };
    return SuperRunner;
}(_BaseGame.BaseGame);

});

})(window.ArcadeMod);
