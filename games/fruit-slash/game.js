(function(ArcadeMod){
// === MODULE: src/games/fruit-slash/FruitSlash ===
ArcadeMod.define("src/games/fruit-slash/FruitSlash", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FruitSlash", {
    enumerable: true,
    get: function() {
        return FruitSlash;
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
var FRUIT_ICONS = [
    '🍎',
    '🍉',
    '🍊',
    '🍓',
    '🍍',
    '🥝',
    '🍑'
];
var FruitSlash = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(FruitSlash, BaseGame);
    function FruitSlash() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.fruits = [], _this.bombs = [], _this.slashTrail = [], _this.freezeTimer = 0, _this.frenzyTimer = 0, _this.comboCount = 0, _this.comboTimer = 0;
        return _this;
    }
    var _proto = FruitSlash.prototype;
    _proto.init = function init() {
        this.fruits = [];
        this.bombs = [];
        this.slashTrail = [];
        this.maxLives = 3;
        this.lives = 3;
        this.freezeTimer = 0;
        this.frenzyTimer = 0;
        this.comboCount = 0;
        this.comboTimer = 0;
    };
    _proto.releaseInputs = function releaseInputs() {
        this.slashTrail = [];
    };
    _proto.pause = function pause() {
        BaseGame.prototype.pause.call(this);
        this.releaseInputs();
    };
    _proto.update = function update(dt) {
        var _this = this;
        if (this.gameOver) return;
        if (this.freezeTimer > 0) this.freezeTimer = Math.max(0, this.freezeTimer - dt);
        if (this.frenzyTimer > 0) this.frenzyTimer = Math.max(0, this.frenzyTimer - dt);
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) this.comboCount = 0;
        }
        var timeSlow = this.freezeTimer > 0 ? 0.55 : 1;
        var deltaMult = dt * 60 * timeSlow;
        var hRatio = Math.max(0.45, this.height / 720);
        var gStep = 0.14 * hRatio;
        var gravityPull = gStep * deltaMult;
        var targetPeak = this.height * (0.68 + Math.random() * 0.18);
        var launchVy = -Math.sqrt(2 * gStep * targetPeak) * Math.max(0.92, Math.min(1.22, this.scaler.speedMult));
        var spawnMargin = Math.min(60, this.width * 0.14);
        var spawnSpan = Math.max(40, this.width - spawnMargin * 2);
        var baseRate = (0.025 + this.level * 0.003) * this.scaler.spawnMult * (this.frenzyTimer > 0 ? 2.4 : 1);
        var spawnRate = Math.max(0.018, baseRate) * dt * 60;
        if (Math.random() < spawnRate) {
            var r = Math.random();
            var kind = 'fruit';
            var icon = FRUIT_ICONS[Math.floor(Math.random() * FRUIT_ICONS.length)];
            if (r < 0.06) {
                kind = 'freeze';
                icon = '❄️';
            } else if (r < 0.11) {
                kind = 'frenzy';
                icon = '🌟';
            } else if (r < 0.22) {
                kind = 'coin';
                icon = '🪙';
            }
            this.fruits.push({
                x: spawnMargin + Math.random() * spawnSpan,
                y: this.height + 10,
                vy: launchVy,
                vx: (Math.random() - 0.5) * 3.4 * (this.width / 480),
                r: Math.max(20, Math.min(28, this.width * 0.055)),
                icon: icon,
                sliced: false,
                missed: false,
                kind: kind
            });
        }
        if (this.frenzyTimer <= 0 && Math.random() < 0.0065 * this.scaler.spawnMult * dt * 60) {
            this.bombs.push({
                x: spawnMargin + Math.random() * spawnSpan,
                y: this.height + 10,
                vy: launchVy,
                vx: (Math.random() - 0.5) * 2.4 * (this.width / 480),
                r: 20
            });
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(this.fruits), _step; !(_step = _iterator()).done;){
            var f = _step.value;
            f.x += f.vx * deltaMult;
            f.y += (f.vy + 0.5 * gravityPull) * deltaMult;
            f.vy += gravityPull;
            if (!f.missed && !f.sliced && f.y > this.height + 24 && f.vy > 0) {
                f.missed = true;
                if (f.kind === 'fruit' && this.frenzyTimer <= 0) {
                    this.lives--;
                    _audio.ArcadeAudio.play('hurt');
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                    if (this.lives <= 0) {
                        this.gameOverSequence();
                        return;
                    }
                }
            }
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.bombs), _step1; !(_step1 = _iterator1()).done;){
            var b = _step1.value;
            b.x += b.vx * deltaMult;
            b.y += (b.vy + 0.5 * gravityPull) * deltaMult;
            b.vy += gravityPull;
        }
        for(var i = this.slashTrail.length - 1; i >= 0; i--){
            this.slashTrail[i].life -= dt;
            if (this.slashTrail[i].life <= 0) this.slashTrail.splice(i, 1);
        }
        this.fruits = this.fruits.filter(function(f) {
            return f.y < _this.height + 50 && !f.sliced;
        });
        this.bombs = this.bombs.filter(function(b) {
            return b.y < _this.height + 50;
        });
    };
    _proto.draw = function draw() {
        if (this.level >= 50) this.ctx.fillStyle = '#000000';
        else if (this.freezeTimer > 0) this.ctx.fillStyle = '#0e344f';
        else if (this.frenzyTimer > 0) this.ctx.fillStyle = '#4c1d95';
        else if (this.level >= 30) this.ctx.fillStyle = '#0d0d2b';
        else if (this.level >= 20) this.ctx.fillStyle = '#2b1055';
        else if (this.level >= 10) this.ctx.fillStyle = '#5c1d1d';
        else this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.width, this.height);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.fruits), _step; !(_step = _iterator()).done;){
            var f = _step.value;
            if (f.sliced) continue;
            _emojiCache.EmojiCache.draw(this.ctx, f.icon, f.x, f.y, Math.round(f.r * 1.45));
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.bombs), _step1; !(_step1 = _iterator1()).done;){
            var b = _step1.value;
            this.ctx.fillStyle = '#111';
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            this.ctx.fill();
            _emojiCache.EmojiCache.draw(this.ctx, '💣', b.x, b.y, 28);
        }
        if (this.slashTrail.length > 1) {
            this.ctx.lineCap = 'round';
            for(var i = 1; i < this.slashTrail.length; i++){
                var p0 = this.slashTrail[i - 1];
                var p1 = this.slashTrail[i];
                var alpha = Math.max(0, p1.life / 0.18);
                this.ctx.strokeStyle = this.freezeTimer > 0 ? "rgba(56, 189, 248, " + alpha + ")" : "rgba(132, 250, 176, " + alpha + ")";
                this.ctx.lineWidth = Math.max(2, alpha * 9);
                this.ctx.beginPath();
                this.ctx.moveTo(p0.x, p0.y);
                this.ctx.lineTo(p1.x, p1.y);
                this.ctx.stroke();
            }
        }
        // Native strike/status banner at top-center
        var badgeY = this.width < 460 ? 52 : 12;
        this.ctx.fillStyle = 'rgba(0,0,0,0.55)';
        this.ctx.beginPath();
        this.ctx.roundRect(this.width / 2 - 78, badgeY, 156, 28, 14);
        this.ctx.fill();
        var misses = Math.max(0, this.maxLives - this.lives);
        var badge = '';
        for(var i1 = 0; i1 < this.maxLives; i1++)badge += i1 < misses ? '❌' : '🍉';
        if (this.freezeTimer > 0) badge += ' ❄️';
        else if (this.frenzyTimer > 0) badge += ' 🌟';
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '800 13px system-ui, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(badge, this.width / 2, badgeY + 19);
        this.ctx.textAlign = 'left';
    };
    _proto.handleSlice = function handleSlice(x, y) {
        if (this.gameOver || this.isPaused) return;
        this.slashTrail.push({
            x: x,
            y: y,
            life: 0.18
        });
        if (this.slashTrail.length > 18) this.slashTrail.shift();
        var hitFruit = false;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.fruits), _step; !(_step = _iterator()).done;){
            var f = _step.value;
            if (!f.sliced && Math.hypot(x - f.x, y - f.y) < f.r + 24) {
                f.sliced = true;
                this.comboCount++;
                this.comboTimer = 0.45;
                var mult = this.comboCount >= 3 ? 2 : 1;
                if (f.kind === 'freeze') {
                    this.freezeTimer = 5;
                    _audio.ArcadeAudio.play('levelup');
                    this.spawnPopup(f.x, f.y - 14, '❄️ FREEZE!', '#38bdf8');
                } else if (f.kind === 'frenzy') {
                    this.frenzyTimer = 5;
                    _audio.ArcadeAudio.play('combo');
                    this.spawnPopup(f.x, f.y - 14, '🌟 FRENZY!', '#facc15');
                } else {
                    _audio.ArcadeAudio.play(f.kind === 'coin' ? 'coin' : 'slash');
                    var pts = (f.kind === 'coin' ? 15 : 6) * mult;
                    this.score += pts;
                    (0, _runtimeBridge.addCoins)(f.kind === 'coin' ? 5 : mult);
                    (0, _runtimeBridge.addXp)(4);
                    this.spawnPopup(f.x, f.y - 12, this.comboCount >= 3 ? "+" + pts + " x" + this.comboCount + "!" : "+" + pts, '#84fab0');
                }
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 2);
                this.spawnParticles(f.x, f.y, f.kind === 'coin' ? '#ffd700' : '#ff6b6b', 10, 170);
                hitFruit = true;
            }
        }
        if (!hitFruit) {
            for(var _iterator1 = _create_for_of_iterator_helper_loose(this.bombs), _step1; !(_step1 = _iterator1()).done;){
                var b = _step1.value;
                if (Math.hypot(x - b.x, y - b.y) < b.r + 14) {
                    _audio.ArcadeAudio.play('explosion');
                    this.triggerShake(10, 0.25);
                    this.lives = 0;
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                    this.gameOverSequence();
                    return;
                }
            }
        }
    };
    return FruitSlash;
}(_BaseGame.BaseGame);

});

})(window.ArcadeMod);
