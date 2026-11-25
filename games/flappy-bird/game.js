(function(ArcadeMod){
// === MODULE: src/games/flappy-bird/FlappyBird ===
ArcadeMod.define("src/games/flappy-bird/FlappyBird", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FlappyBird", {
    enumerable: true,
    get: function() {
        return FlappyBird;
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
var FlappyBird = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(FlappyBird, BaseGame);
    function FlappyBird() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.bird = {
            x: 80,
            y: 200,
            r: 16,
            vy: 0
        }, _this.gravity = 0.45, _this.flapForce = -7.5, _this.pipes = [], _this.coins = [], _this.spawnTimer = -60;
        return _this;
    }
    var _proto = FlappyBird.prototype;
    _proto.init = function init() {
        var bx = Math.round(Math.max(48, Math.min(110, this.width * 0.18)));
        var hScale = Math.max(0.75, Math.min(1.1, this.height / 700));
        this.bird = {
            x: bx,
            y: this.height / 2,
            r: 16,
            vy: 0
        };
        this.gravity = 0.45 * hScale;
        this.flapForce = -7.5 * Math.sqrt(hScale);
        this.pipes = [];
        this.coins = [];
        this.maxLives = 1;
        this.lives = 1;
        this.spawnTimer = -60;
    };
    _proto.resize = function resize() {
        BaseGame.prototype.resize.call(this);
        var hScale = Math.max(0.75, Math.min(1.1, this.height / 700));
        this.gravity = 0.45 * hScale;
        this.flapForce = -7.5 * Math.sqrt(hScale);
        if (this.bird) {
            this.bird.x = Math.round(Math.max(48, Math.min(110, this.width * 0.18)));
            this.bird.y = Math.max(24, Math.min(this.height - 24, this.bird.y));
        }
    };
    _proto.update = function update(dt) {
        if (this.gameOver) return;
        var deltaMult = dt * 60;
        this.bird.y += (this.bird.vy + 0.5 * this.gravity * deltaMult) * deltaMult;
        this.bird.vy += this.gravity * deltaMult;
        var speedScale = Math.max(0.82, Math.min(1.25, this.width / 460));
        var pipeSpeed = (3.2 + this.level * 0.25) * this.scaler.speedMult * speedScale * deltaMult;
        this.spawnTimer += deltaMult;
        if (this.spawnTimer > 0 && Math.random() < 0.025 * this.scaler.spawnMult * deltaMult) {
            var gapSize = Math.max(105, Math.min(185, this.height * 0.28) - this.level * 2 - this.scaler.speedMult * 8);
            var minTop = Math.max(45, Math.round(this.height * 0.1));
            var maxTop = Math.max(minTop + 20, this.height - gapSize - Math.max(55, Math.round(this.height * 0.12)));
            var topHeight = minTop + Math.random() * (maxTop - minTop);
            this.pipes.push({
                x: this.width + 50,
                top: topHeight,
                gap: gapSize,
                scored: false
            });
            if (Math.random() < 0.35) {
                this.coins.push({
                    x: this.width + 72,
                    y: topHeight + gapSize / 2,
                    r: 14,
                    collected: false
                });
            }
            this.spawnTimer = -75;
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(this.pipes), _step; !(_step = _iterator()).done;){
            var p = _step.value;
            p.x -= pipeSpeed;
            if (!p.scored && p.x < this.bird.x) {
                p.scored = true;
                this.score += 1;
                (0, _runtimeBridge.addXp)(4);
                _audio.ArcadeAudio.play('hit');
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 1);
                this.spawnPopup(this.bird.x, this.bird.y - 22, '+1', '#84fab0');
            }
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.coins), _step1; !(_step1 = _iterator1()).done;){
            var c = _step1.value;
            c.x -= pipeSpeed;
            if (!c.collected && Math.hypot(c.x - this.bird.x, c.y - this.bird.y) < 24) {
                _audio.ArcadeAudio.play('coin');
                c.collected = true;
                (0, _runtimeBridge.addCoins)(2);
                (0, _runtimeBridge.addXp)(4);
                this.spawnParticles(c.x, c.y, '#ffd700', 8, 120);
                this.spawnPopup(c.x, c.y - 14, '+2🪙', '#ffd700');
            }
        }
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.pipes), _step2; !(_step2 = _iterator2()).done;){
            var p1 = _step2.value;
            if (this.bird.x + 12 > p1.x && this.bird.x - 12 < p1.x + 45 && (this.bird.y - 12 < p1.top || this.bird.y + 12 > p1.top + p1.gap)) {
                _audio.ArcadeAudio.play('hurt');
                this.gameOverSequence();
                return;
            }
        }
        if (this.bird.y > this.height || this.bird.y < 0) {
            _audio.ArcadeAudio.play('hurt');
            this.gameOverSequence();
            return;
        }
        this.pipes = this.pipes.filter(function(p) {
            return p.x > -60;
        });
        this.coins = this.coins.filter(function(c) {
            return c.x > -40 && !c.collected;
        });
    };
    _proto.draw = function draw() {
        this.ctx.fillStyle = this.getDynamicSkyColor();
        this.ctx.fillRect(0, 0, this.width, this.height);
        var birdAngle = Math.max(-0.45, Math.min(0.65, this.bird.vy * 0.06));
        _emojiCache.EmojiCache.draw(this.ctx, _storage.playerState.currentAvatar, this.bird.x, this.bird.y, 28, birdAngle);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.coins), _step; !(_step = _iterator()).done;){
            var c = _step.value;
            if (!c.collected) _emojiCache.EmojiCache.draw(this.ctx, '🪙', c.x, c.y, 22);
        }
        this.ctx.fillStyle = this.level >= 50 ? '#ffffff' : '#2ecc71';
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.pipes), _step1; !(_step1 = _iterator1()).done;){
            var p = _step1.value;
            this.ctx.fillRect(p.x, 0, 45, p.top);
            this.ctx.fillRect(p.x - 3, Math.max(0, p.top - 14), 51, 14);
            this.ctx.fillRect(p.x, p.top + p.gap, 45, this.height - (p.top + p.gap));
            this.ctx.fillRect(p.x - 3, p.top + p.gap, 51, 14);
        }
    };
    _proto.flap = function flap() {
        if (this.gameOver || this.isPaused) return;
        this.bird.vy = this.flapForce;
        _audio.ArcadeAudio.play('flap');
        this.spawnParticles(this.bird.x - 10, this.bird.y + 8, 'rgba(255,255,255,0.75)', 4, 70);
    };
    return FlappyBird;
}(_BaseGame.BaseGame);

});

})(window.ArcadeMod);
