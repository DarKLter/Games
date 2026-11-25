(function(ArcadeMod){
// === MODULE: src/games/vector-parkour/VectorParkour ===
ArcadeMod.define("src/games/vector-parkour/VectorParkour", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VectorParkour", {
    enumerable: true,
    get: function() {
        return VectorParkour;
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
var VectorParkour = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(VectorParkour, BaseGame);
    function VectorParkour() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.groundY = 400, _this.runner = {
            x: 80,
            y: 400,
            vy: 0,
            sliding: false,
            anim: 0,
            jumpsUsed: 0
        }, _this.obstacles = [], _this.cubes = [], _this.spawnTimer = 0.7, _this.swipeY = null, _this.skylineOffset = 0;
        return _this;
    }
    var _proto = VectorParkour.prototype;
    _proto.init = function init() {
        this.groundY = Math.round(this.height * 0.78);
        this.runner = {
            x: Math.round(Math.max(44, this.width * 0.16)),
            y: this.groundY,
            vy: 0,
            sliding: false,
            anim: 0,
            jumpsUsed: 0
        };
        this.obstacles = [];
        this.cubes = [];
        this.spawnTimer = 0.7;
        this.swipeY = null;
        this.maxLives = 3;
        this.lives = 3;
    };
    _proto.releaseInputs = function releaseInputs() {
        this.swipeY = null;
        this.runner.sliding = false;
    };
    _proto.pause = function pause() {
        BaseGame.prototype.pause.call(this);
        this.releaseInputs();
    };
    _proto.resize = function resize() {
        BaseGame.prototype.resize.call(this);
        var prevGroundY = this.groundY;
        this.groundY = Math.round(this.height * 0.78);
        this.runner.x = Math.round(Math.max(44, this.width * 0.16));
        if (this.runner.y >= prevGroundY - 2) this.runner.y = this.groundY;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.obstacles), _step; !(_step = _iterator()).done;){
            var o = _step.value;
            o.y = o.high ? this.groundY - 46 : this.groundY - 38;
        }
    };
    _proto.jump = function jump() {
        if (this.gameOver || this.isPaused) return;
        if (this.runner.jumpsUsed < 2) {
            this.runner.vy = this.runner.jumpsUsed === 0 ? -490 : -430;
            this.runner.sliding = false;
            this.runner.jumpsUsed++;
            _audio.ArcadeAudio.play('jump');
        }
    };
    _proto.setSlide = function setSlide(on) {
        if (!on) {
            this.runner.sliding = false;
            return;
        }
        if (this.gameOver || this.isPaused) return;
        this.runner.sliding = true;
        if (this.runner.y >= this.groundY - 2) _audio.ArcadeAudio.play('slide');
    };
    _proto.onPointerDown = function onPointerDown(_x, y) {
        if (this.gameOver || this.isPaused) return;
        this.swipeY = y;
    };
    _proto.onPointerMove = function onPointerMove(_x, y) {
        if (this.gameOver || this.isPaused) return;
        if (this.swipeY !== null && y - this.swipeY > 30) {
            this.setSlide(true);
            this.swipeY = null;
        }
    };
    _proto.onPointerUp = function onPointerUp() {
        if (this.gameOver || this.isPaused) {
            this.swipeY = null;
            this.runner.sliding = false;
            return;
        }
        if (this.swipeY !== null) {
            this.jump();
            this.swipeY = null;
        } else {
            this.setSlide(false);
        }
    };
    _proto.update = function update(dt) {
        if (this.gameOver) return;
        this.runner.anim += dt * 13;
        this.runner.vy += 1280 * dt;
        this.runner.y += this.runner.vy * dt;
        if (this.runner.y > this.groundY) {
            this.runner.y = this.groundY;
            this.runner.vy = 0;
            this.runner.jumpsUsed = 0;
        }
        var spd = (260 + this.level * 22) * this.scaler.speedMult;
        this.skylineOffset = (this.skylineOffset + spd * 0.25 * dt) % 140;
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnTimer = Math.max(0.75, (1.55 - this.level * 0.05) / this.scaler.spawnMult);
            var high = Math.random() < 0.45;
            this.obstacles.push({
                x: this.width + 40,
                high: high,
                w: high ? 56 : 24,
                y: high ? this.groundY - 46 : this.groundY - 38,
                h: high ? 20 : 38,
                passed: false
            });
            if (Math.random() < 0.65) {
                this.cubes.push({
                    x: this.width + 70,
                    y: this.groundY - (high ? 18 : 74)
                });
            }
        }
        var boxH = this.runner.sliding ? 22 : 48;
        for(var i = this.obstacles.length - 1; i >= 0; i--){
            var o = this.obstacles[i];
            o.x -= spd * dt;
            if (!o.passed && Math.abs(o.x + o.w / 2 - this.runner.x) < o.w / 2 + 12 && this.runner.y > o.y && this.runner.y - boxH < o.y + o.h) {
                o.passed = true;
                this.lives--;
                _audio.ArcadeAudio.play('hurt');
                this.triggerShake(8, 0.16);
                (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                if (this.lives <= 0) {
                    this.gameOverSequence(false);
                    return;
                }
            }
            if (!o.passed && o.x + o.w < this.runner.x) {
                o.passed = true;
                this.score += 15;
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 19);
            }
            if (o.x < -80) this.obstacles.splice(i, 1);
        }
        for(var i1 = this.cubes.length - 1; i1 >= 0; i1--){
            var c = this.cubes[i1];
            c.x -= spd * dt;
            if (Math.hypot(c.x - this.runner.x, c.y - (this.runner.y - boxH / 2)) < 26) {
                this.cubes.splice(i1, 1);
                this.score += 25;
                (0, _runtimeBridge.addCoins)(2);
                _audio.ArcadeAudio.play('coin');
                (0, _runtimeBridge.addXp)(5);
                this.spawnPopup(c.x, c.y - 12, '+25 💠', '#38bdf8');
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 19);
            } else if (c.x < -30) {
                this.cubes.splice(i1, 1);
            }
        }
    };
    _proto.draw = function draw() {
        var ctx = this.ctx;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, this.width, this.groundY * 0.55);
        ctx.fillStyle = '#be185d';
        ctx.fillRect(0, this.groundY * 0.55, this.width, this.groundY * 0.45);
        // Parallax silhouette skyline buildings
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        for(var sx = -this.skylineOffset; sx < this.width + 140; sx += 140){
            ctx.fillRect(sx + 8, this.groundY - 120, 48, 120);
            ctx.fillRect(sx + 66, this.groundY - 82, 58, 82);
        }
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(0, this.groundY, this.width, 3);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.obstacles), _step; !(_step = _iterator()).done;){
            var o = _step.value;
            ctx.fillStyle = o.high ? '#facc15' : '#ef4444';
            ctx.fillRect(o.x, o.y, o.w, o.h);
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.cubes), _step1; !(_step1 = _iterator1()).done;){
            var c = _step1.value;
            _emojiCache.EmojiCache.draw(ctx, '💠', c.x, c.y, 24);
        }
        var rx = this.runner.x;
        var ry = this.runner.y;
        ctx.strokeStyle = '#050507';
        ctx.fillStyle = '#050507';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        if (this.runner.sliding) {
            ctx.beginPath();
            ctx.arc(rx - 14, ry - 14, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(rx - 10, ry - 10);
            ctx.lineTo(rx + 18, ry - 6);
            ctx.stroke();
        } else {
            var stride = Math.sin(this.runner.anim) * 12;
            ctx.beginPath();
            ctx.arc(rx + 4, ry - 44, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(rx + 3, ry - 38);
            ctx.lineTo(rx - 2, ry - 18);
            ctx.moveTo(rx - 2, ry - 18);
            ctx.lineTo(rx - 4 + stride, ry);
            ctx.moveTo(rx - 2, ry - 18);
            ctx.lineTo(rx + 4 - stride, ry);
            ctx.moveTo(rx + 1, ry - 32);
            ctx.lineTo(rx + 14 - stride * 0.5, ry - 26);
            ctx.stroke();
        }
        var badgeY = this.width < 460 ? 52 : 12;
        ctx.fillStyle = 'rgba(0,0,0,0.58)';
        ctx.beginPath();
        ctx.roundRect(this.width / 2 - 58, badgeY, 116, 26, 13);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '800 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏃'.repeat(Math.max(0, this.lives)) + '✖'.repeat(Math.max(0, this.maxLives - this.lives)), this.width / 2, badgeY + 17);
        ctx.textAlign = 'left';
    };
    return VectorParkour;
}(_BaseGame.BaseGame);

});

})(window.ArcadeMod);
