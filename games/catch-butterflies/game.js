(function(ArcadeMod){
// === MODULE: src/games/catch-butterflies/CatchButterflies ===
ArcadeMod.define("src/games/catch-butterflies/CatchButterflies", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CatchButterflies", {
    enumerable: true,
    get: function() {
        return CatchButterflies;
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
var CatchButterflies = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(CatchButterflies, BaseGame);
    function CatchButterflies() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.butterflies = [], _this.bees = [], _this.animClock = 0, _this.streak = 0;
        return _this;
    }
    var _proto = CatchButterflies.prototype;
    _proto.init = function init() {
        this.butterflies = [];
        this.bees = [];
        this.maxLives = 3;
        this.lives = 3;
        this.animClock = 0;
        this.streak = 0;
    };
    _proto.update = function update(dt) {
        var _this = this;
        if (this.gameOver) return;
        var deltaMult = dt * 60;
        this.animClock += dt;
        var speedScale = Math.max(0.85, Math.min(1.4, this.width / 480));
        var flySpeed = (1.5 + this.level * 0.25) * this.scaler.speedMult * speedScale * deltaMult;
        var minY = this.width < 460 ? 86 : 64;
        var maxY = Math.max(minY + 40, this.height - 84);
        if (Math.random() < 0.03 * this.scaler.spawnMult * deltaMult) {
            var isGold = Math.random() < 0.16;
            var startY = minY + Math.random() * (maxY - minY);
            this.butterflies.push({
                x: -30,
                y: startY,
                baseY: startY,
                phase: Math.random() * Math.PI * 2,
                vx: flySpeed + Math.random(),
                r: 20,
                caught: false,
                escaped: false,
                isGold: isGold
            });
        }
        if (Math.random() < (0.01 + this.level * 0.002) * this.scaler.spawnMult * deltaMult) {
            this.bees.push({
                x: -30,
                y: minY + Math.random() * (maxY - minY),
                vx: flySpeed + 0.5,
                r: 16
            });
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(this.butterflies), _step; !(_step = _iterator()).done;){
            var b = _step.value;
            b.x += b.vx;
            b.y = b.baseY + Math.sin(this.animClock * 4.5 + b.phase) * 14;
            if (!b.escaped && !b.caught && b.x > this.width + 20) {
                b.escaped = true;
                if (!b.isGold) {
                    this.streak = 0;
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
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.bees), _step1; !(_step1 = _iterator1()).done;){
            var bee = _step1.value;
            bee.x += bee.vx;
        }
        this.butterflies = this.butterflies.filter(function(b) {
            return b.x < _this.width + 50 && !b.caught;
        });
        this.bees = this.bees.filter(function(b) {
            return b.x < _this.width + 50;
        });
    };
    _proto.draw = function draw() {
        if (this.level >= 50) this.ctx.fillStyle = '#000000';
        else if (this.level >= 30) this.ctx.fillStyle = '#0d0d2b';
        else if (this.level >= 20) this.ctx.fillStyle = '#2b1055';
        else if (this.level >= 10) this.ctx.fillStyle = '#6b2b3a';
        else this.ctx.fillStyle = '#a8e6cf';
        this.ctx.fillRect(0, 0, this.width, this.height);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.butterflies), _step; !(_step = _iterator()).done;){
            var b = _step.value;
            if (!b.caught) {
                var flap = 0.78 + Math.abs(Math.sin(this.animClock * 11 + b.phase)) * 0.25;
                _emojiCache.EmojiCache.draw(this.ctx, b.isGold ? '🪙' : '🦋', b.x, b.y, 28, 0, flap, 1);
            }
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.bees), _step1; !(_step1 = _iterator1()).done;){
            var bee = _step1.value;
            _emojiCache.EmojiCache.draw(this.ctx, '🐝', bee.x, bee.y, 28);
        }
        // Strike indicator & net streak badge
        var badgeY = this.width < 460 ? 52 : 12;
        this.ctx.fillStyle = 'rgba(0,0,0,0.52)';
        this.ctx.beginPath();
        this.ctx.roundRect(this.width / 2 - 74, badgeY, 148, 28, 14);
        this.ctx.fill();
        var misses = Math.max(0, this.maxLives - this.lives);
        var badge = '';
        for(var i = 0; i < this.maxLives; i++)badge += i < misses ? '❌' : '🦋';
        if (this.streak >= 5) badge += " \uD83D\uDD25" + this.streak;
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '800 12px system-ui, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(badge, this.width / 2, badgeY + 18);
        this.ctx.textAlign = 'left';
    };
    _proto.handleClick = function handleClick(x, y) {
        if (this.gameOver || this.isPaused) return;
        var hitButterfly = false;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.butterflies), _step; !(_step = _iterator()).done;){
            var b = _step.value;
            if (!b.caught && Math.hypot(x - b.x, y - b.y) < b.r + 26) {
                _audio.ArcadeAudio.play(b.isGold ? 'coin' : 'match');
                var bx = b.x;
                var by = b.y;
                b.caught = true;
                b.x = 9999;
                this.streak++;
                var bonus = this.streak >= 5 ? 3 : 0;
                var coinBonus = b.isGold ? 5 : 1;
                this.score += (b.isGold ? 15 : 5) + bonus;
                (0, _runtimeBridge.addCoins)(coinBonus);
                (0, _runtimeBridge.addXp)(4);
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 3);
                this.spawnParticles(bx, by, b.isGold ? '#ffd700' : '#8fd3f4', 9, 140);
                this.spawnPopup(bx, by - 14, b.isGold ? "+15" : "+" + (5 + bonus), b.isGold ? '#ffd700' : '#ffffff');
                hitButterfly = true;
                break;
            }
        }
        if (!hitButterfly) {
            for(var _iterator1 = _create_for_of_iterator_helper_loose(this.bees), _step1; !(_step1 = _iterator1()).done;){
                var bee = _step1.value;
                if (Math.hypot(x - bee.x, y - bee.y) < bee.r + 14) {
                    _audio.ArcadeAudio.play('hurt');
                    this.triggerShake(7, 0.16);
                    this.spawnParticles(bee.x, bee.y, '#ff6b6b', 10, 150);
                    bee.x = 9999;
                    this.streak = 0;
                    this.lives--;
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                    if (this.lives <= 0) this.gameOverSequence();
                    return;
                }
            }
        }
    };
    return CatchButterflies;
}(_BaseGame.BaseGame);

});

})(window.ArcadeMod);
