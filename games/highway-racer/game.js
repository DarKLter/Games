(function(ArcadeMod){
// === MODULE: src/games/highway-racer/HighwayRacer ===
ArcadeMod.define("src/games/highway-racer/HighwayRacer", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HighwayRacer", {
    enumerable: true,
    get: function() {
        return HighwayRacer;
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
var HighwayRacer = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(HighwayRacer, BaseGame);
    function HighwayRacer() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.laneCount = 3, _this.currentLane = 1, _this.visualLane = 1, _this.traffic = [], _this.coins = [], _this.spawnTimer = 0, _this.roadOffset = 0, _this.invulnerableTime = 0, _this.nitroTimer = 0;
        return _this;
    }
    var _proto = HighwayRacer.prototype;
    _proto.init = function init() {
        this.maxLives = 3;
        this.lives = 3;
        this.laneCount = 3;
        this.currentLane = 1;
        this.visualLane = 1;
        this.traffic = [];
        this.coins = [];
        this.spawnTimer = 0;
        this.roadOffset = 0;
        this.invulnerableTime = 0;
        this.nitroTimer = 0;
    };
    _proto.moveLeft = function moveLeft() {
        if (this.gameOver || this.isPaused) return;
        if (this.currentLane > 0) {
            this.currentLane--;
            this.invulnerableTime = Math.max(this.invulnerableTime, 0.22);
            _audio.ArcadeAudio.play('dash');
        }
    };
    _proto.moveRight = function moveRight() {
        if (this.gameOver || this.isPaused) return;
        if (this.currentLane < this.laneCount - 1) {
            this.currentLane++;
            this.invulnerableTime = Math.max(this.invulnerableTime, 0.22);
            _audio.ArcadeAudio.play('dash');
        }
    };
    _proto.update = function update(dt) {
        var _this = this;
        if (this.gameOver) return;
        var deltaMult = dt * 60;
        this.visualLane += (this.currentLane - this.visualLane) * (1 - Math.exp(-20 * dt));
        if (Math.abs(this.currentLane - this.visualLane) < 0.005) this.visualLane = this.currentLane;
        if (this.invulnerableTime > 0) this.invulnerableTime = Math.max(0, this.invulnerableTime - dt);
        if (this.nitroTimer > 0) this.nitroTimer = Math.max(0, this.nitroTimer - dt);
        var hScale = Math.max(0.7, Math.min(1.25, this.height / 700));
        var nitroMult = this.nitroTimer > 0 ? 1.55 : 1;
        var scrollSpeed = (6.0 + this.level * 0.5) * this.scaler.speedMult * hScale * nitroMult * deltaMult;
        this.roadOffset = (this.roadOffset + scrollSpeed) % 40;
        this.spawnTimer += deltaMult;
        if (this.spawnTimer > 45 / (this.scaler.spawnMult * nitroMult)) {
            this.spawnTimer = 0;
            if (Math.random() < 0.68) {
                var cars = [
                    '🚗',
                    '🚘',
                    '🛻',
                    '🚚',
                    '🚌'
                ];
                this.traffic.push({
                    lane: Math.floor(Math.random() * this.laneCount),
                    y: -60,
                    car: cars[Math.floor(Math.random() * cars.length)],
                    hit: false
                });
            } else {
                var occupied = this.traffic.filter(function(t) {
                    return t.y < 120;
                }).map(function(t) {
                    return t.lane;
                });
                var valid = [
                    0,
                    1,
                    2
                ].filter(function(l) {
                    return !occupied.includes(l);
                });
                if (valid.length > 0) {
                    var r = Math.random();
                    var kind = r < 0.16 ? 'nitro' : r < 0.34 ? 'bag' : 'coin';
                    this.coins.push({
                        lane: valid[Math.floor(Math.random() * valid.length)],
                        y: -40,
                        label: kind === 'nitro' ? '⚡' : kind === 'bag' ? '💰' : '🪙',
                        val: kind === 'bag' ? 5 : 1,
                        kind: kind,
                        collected: false
                    });
                }
            }
        }
        var roadWidth = Math.min(this.width * 0.88, Math.max(230, Math.min(420, this.width * 0.6)));
        var roadX = (this.width - roadWidth) / 2;
        var laneWidth = roadWidth / this.laneCount;
        var playerYCenter = this.height - Math.max(92, Math.min(138, this.height * 0.18));
        for(var _iterator = _create_for_of_iterator_helper_loose(this.coins), _step; !(_step = _iterator()).done;){
            var c = _step.value;
            c.y += scrollSpeed;
            if (!c.collected && c.lane === this.currentLane && Math.abs(c.y - 14 - playerYCenter) < 28) {
                c.collected = true;
                var cx = roadX + c.lane * laneWidth + laneWidth / 2;
                if (c.kind === 'nitro') {
                    this.nitroTimer = 4.5;
                    _audio.ArcadeAudio.play('levelup');
                    this.spawnPopup(cx, c.y - 14, '⚡ NITRO SURGE!', '#38bdf8');
                } else {
                    _audio.ArcadeAudio.play('coin');
                    this.spawnPopup(cx, c.y - 14, "+" + c.val + "\uD83E\uDE99", '#ffd700');
                }
                this.score += c.kind === 'nitro' ? 35 : 15;
                (0, _runtimeBridge.addCoins)(c.val);
                (0, _runtimeBridge.addXp)(6);
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 5);
                this.spawnParticles(cx, c.y, c.kind === 'nitro' ? '#38bdf8' : '#ffd700', 8, 130);
            }
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.traffic), _step1; !(_step1 = _iterator1()).done;){
            var t = _step1.value;
            t.y += scrollSpeed;
            var laneDist = Math.abs(t.lane - this.currentLane);
            if (!t.hit && !t.nearMissed && laneDist === 1 && Math.abs(t.y - playerYCenter) < 18) {
                t.nearMissed = true;
                this.score += 20;
                (0, _runtimeBridge.addXp)(3);
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 5);
                this.spawnPopup(roadX + this.visualLane * laneWidth + laneWidth / 2, playerYCenter - 26, '+20 NEAR MISS!', '#84fab0');
            }
            if (!t.hit && t.lane === this.currentLane && Math.abs(t.y - 18 - playerYCenter) < 22) {
                t.hit = true;
                if (this.nitroTimer > 0) {
                    _audio.ArcadeAudio.play('explosion');
                    this.score += 30;
                    (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 5);
                    this.spawnParticles(roadX + t.lane * laneWidth + laneWidth / 2, t.y, '#38bdf8', 12, 180);
                    this.spawnPopup(roadX + t.lane * laneWidth + laneWidth / 2, t.y, '💥 SMASH +30!', '#38bdf8');
                    continue;
                }
                if (this.invulnerableTime <= 0) {
                    this.lives--;
                    this.invulnerableTime = 0.7;
                    _audio.ArcadeAudio.play('hurt');
                    this.triggerShake(8, 0.18);
                    this.spawnParticles(roadX + t.lane * laneWidth + laneWidth / 2, t.y, '#ff6b6b', 12, 180);
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                    if (this.lives <= 0) {
                        this.gameOverSequence();
                        return;
                    }
                }
            }
        }
        this.traffic = this.traffic.filter(function(t) {
            return t.y < _this.height + 60 && !t.hit;
        });
        this.coins = this.coins.filter(function(c) {
            return c.y < _this.height + 60 && !c.collected;
        });
    };
    _proto.draw = function draw() {
        var isNoir = this.level >= 50;
        this.ctx.fillStyle = isNoir ? '#000000' : this.level >= 30 ? '#0d0d2b' : this.level >= 20 ? '#2b1055' : this.level >= 10 ? '#8b2626' : '#228B22';
        this.ctx.fillRect(0, 0, this.width, this.height);
        var roadWidth = Math.min(this.width * 0.88, Math.max(230, Math.min(420, this.width * 0.6)));
        var roadX = (this.width - roadWidth) / 2;
        var laneWidth = roadWidth / this.laneCount;
        var playerYCenter = this.height - Math.max(92, Math.min(138, this.height * 0.18));
        this.ctx.fillStyle = isNoir ? '#111111' : '#333333';
        this.ctx.fillRect(roadX, 0, roadWidth, this.height);
        this.ctx.strokeStyle = this.nitroTimer > 0 ? '#38bdf8' : isNoir ? '#ffffff' : '#f1c40f';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(roadX, 0, roadWidth, this.height);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([
            20,
            20
        ]);
        this.ctx.lineDashOffset = -this.roadOffset;
        for(var i = 1; i < this.laneCount; i++){
            this.ctx.beginPath();
            this.ctx.moveTo(roadX + i * laneWidth, 0);
            this.ctx.lineTo(roadX + i * laneWidth, this.height);
            this.ctx.stroke();
        }
        this.ctx.setLineDash([]);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.traffic), _step; !(_step = _iterator()).done;){
            var t = _step.value;
            if (!t.hit) _emojiCache.EmojiCache.draw(this.ctx, t.car, roadX + t.lane * laneWidth + laneWidth / 2, t.y - 12, 36);
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.coins), _step1; !(_step1 = _iterator1()).done;){
            var c = _step1.value;
            if (!c.collected) _emojiCache.EmojiCache.draw(this.ctx, c.label, roadX + c.lane * laneWidth + laneWidth / 2, c.y - 10, 28);
        }
        if (this.invulnerableTime <= 0 || Math.floor(this.invulnerableTime * 16) % 2 === 0) {
            var playerX = roadX + this.visualLane * laneWidth + laneWidth / 2;
            if (this.nitroTimer > 0) {
                this.ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
                this.ctx.beginPath();
                this.ctx.arc(playerX, playerYCenter + 8, 28, 0, Math.PI * 2);
                this.ctx.fill();
            }
            _emojiCache.EmojiCache.draw(this.ctx, '🏎️', playerX, playerYCenter, 38, (this.currentLane - this.visualLane) * 0.28);
        }
        // Top-center compact shield/lives badge
        var badgeY = this.width < 460 ? 52 : 12;
        this.ctx.fillStyle = 'rgba(12,18,28,0.72)';
        this.ctx.beginPath();
        this.ctx.roundRect(this.width / 2 - 74, badgeY, 148, 28, 14);
        this.ctx.fill();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '800 12px system-ui, sans-serif';
        this.ctx.textAlign = 'center';
        var hearts = '🚘'.repeat(Math.max(0, this.lives)) + '💥'.repeat(Math.max(0, this.maxLives - this.lives));
        var nitroTag = this.nitroTimer > 0 ? " ⚡" + this.nitroTimer.toFixed(1) + "s" : '';
        this.ctx.fillText("" + hearts + nitroTag, this.width / 2, badgeY + 18);
        this.ctx.textAlign = 'left';
    };
    return HighwayRacer;
}(_BaseGame.BaseGame);

});

})(window.ArcadeMod);
