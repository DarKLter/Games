(function(ArcadeMod){
// === MODULE: src/games/worm-io/WormIo ===
ArcadeMod.define("src/games/worm-io/WormIo", function(require, module, exports) {
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
    get WormIo () {
        return WormIo;
    },
    get stepWormChain () {
        return stepWormChain;
    },
    get wrapAngleDelta () {
        return wrapAngleDelta;
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
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
function wrapAngleDelta(from, to) {
    return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}
function stepWormChain(pts, angle, spd, dt, targetLen, spacing) {
    if (spacing === void 0) spacing = 8;
    if (pts.length === 0) return;
    pts[0].x += Math.cos(angle) * spd * dt;
    pts[0].y += Math.sin(angle) * spd * dt;
    for(var i = 1; i < pts.length; i++){
        var prev = pts[i - 1];
        var curr = pts[i];
        var dx = curr.x - prev.x;
        var dy = curr.y - prev.y;
        var dist = Math.hypot(dx, dy);
        if (dist > 0.0001) {
            curr.x = prev.x + dx / dist * spacing;
            curr.y = prev.y + dy / dist * spacing;
        }
    }
    var desiredCount = Math.max(2, Math.floor(targetLen));
    while(pts.length < desiredCount){
        var tail = pts[pts.length - 1];
        pts.push({
            x: tail.x,
            y: tail.y
        });
    }
    while(pts.length > desiredCount)pts.pop();
}
var WormIo = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(WormIo, BaseGame);
    function WormIo() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.arena = 1500, _this.player = {
            angle: 0,
            targetAngle: null,
            steer: 0,
            boosting: false,
            pts: [],
            len: 18,
            color: '#4ade80'
        }, _this.orbs = [], _this.bots = [];
        return _this;
    }
    var _proto = WormIo.prototype;
    _proto.init = function init() {
        this.arena = 1500;
        this.player = {
            angle: 0,
            targetAngle: null,
            steer: 0,
            boosting: false,
            pts: [],
            len: 18,
            color: '#4ade80'
        };
        for(var i = 0; i < 18; i++){
            this.player.pts.push({
                x: this.arena / 2 - i * 8,
                y: this.arena / 2
            });
        }
        this.orbs = [];
        this.bots = [];
        this.maxLives = 1;
        this.lives = 1;
        for(var i1 = 0; i1 < 120; i1++)this.spawnOrb();
        var colors = [
            '#f472b6',
            '#38bdf8',
            '#facc15',
            '#fb923c',
            '#a78bfa'
        ];
        for(var i2 = 0; i2 < 5; i2++)this.spawnBot(colors[i2]);
    };
    _proto.spawnOrb = function spawnOrb(x, y, val) {
        if (val === void 0) val = 1;
        var cols = [
            '#fde047',
            '#38bdf8',
            '#f472b6',
            '#4ade80',
            '#fb923c'
        ];
        this.orbs.push({
            x: x != null ? x : 60 + Math.random() * (this.arena - 120),
            y: y != null ? y : 60 + Math.random() * (this.arena - 120),
            val: val,
            color: cols[Math.floor(Math.random() * cols.length)]
        });
    };
    _proto.spawnBot = function spawnBot(color) {
        var bx = 220 + Math.random() * (this.arena - 440);
        var by = 220 + Math.random() * (this.arena - 440);
        var pts = [];
        for(var i = 0; i < 16; i++)pts.push({
            x: bx - i * 8,
            y: by
        });
        this.bots.push({
            angle: Math.random() * Math.PI * 2,
            pts: pts,
            len: 16,
            color: color,
            turnTimer: 0
        });
    };
    _proto.releaseInputs = function releaseInputs() {
        this.player.boosting = false;
        this.player.steer = 0;
        this.player.targetAngle = null;
    };
    _proto.pause = function pause() {
        BaseGame.prototype.pause.call(this);
        this.releaseInputs();
    };
    _proto.setBoost = function setBoost(on) {
        if (!on) {
            this.player.boosting = false;
            return;
        }
        if (this.gameOver || this.isPaused) return;
        if (!this.player.boosting) _audio.ArcadeAudio.play('boost');
        this.player.boosting = true;
    };
    _proto.setSteer = function setSteer(dir) {
        if (this.gameOver || this.isPaused) {
            this.player.steer = 0;
            return;
        }
        this.player.steer = dir;
    };
    _proto.onPointerDown = function onPointerDown(x, y) {
        if (this.gameOver || this.isPaused) return;
        this.player.targetAngle = Math.atan2(y - this.height / 2, x - this.width / 2);
    };
    _proto.onPointerMove = function onPointerMove(x, y) {
        if (this.gameOver || this.isPaused) return;
        if (this.player.targetAngle !== null) {
            this.player.targetAngle = Math.atan2(y - this.height / 2, x - this.width / 2);
        }
    };
    _proto.onPointerUp = function onPointerUp() {
        this.player.targetAngle = null;
    };
    _proto.stepWorm = function stepWorm(w, spd, dt) {
        stepWormChain(w.pts, w.angle, spd, dt, w.len, 8);
    };
    _proto.update = function update(dt) {
        var _this, _loop = function(b1) {
            var bot = _this.bots[b1];
            var bh = bot.pts[0];
            bot.turnTimer -= dt;
            if (bh.x < 130 || bh.x > _this.arena - 130 || bh.y < 130 || bh.y > _this.arena - 130) {
                var targetAng = Math.atan2(_this.arena / 2 - bh.y, _this.arena / 2 - bh.x);
                bot.angle += wrapAngleDelta(bot.angle, targetAng) * (1 - Math.exp(-4 * dt));
            } else if (bot.turnTimer <= 0) {
                bot.turnTimer = 0.7 + Math.random();
                bot.angle += (Math.random() - 0.5) * 1.4;
            }
            _this.stepWorm(bot, 145 * _this.scaler.speedMult, dt);
            var headCollision = Math.hypot(bh.x - ph.x, bh.y - ph.y) < 18;
            if (headCollision && _this.player.len >= bot.len + 2) {
                for(var s = 0; s < bot.pts.length; s += 2)_this.spawnOrb(bot.pts[s].x, bot.pts[s].y, 3);
                _audio.ArcadeAudio.play('ko');
                _this.score += 120;
                (0, _runtimeBridge.addXp)(15);
                (0, _runtimeBridge.updateInGameHud)(_this.score, _this.level, 16);
                _this.bots.splice(b1, 1);
                _this.spawnBot(bot.color);
                b1--;
                return b = b1, "continue";
            }
            if (_this.player.pts.some(function(seg, idx) {
                return idx > 2 && Math.hypot(seg.x - bh.x, seg.y - bh.y) < 16;
            })) {
                for(var s1 = 0; s1 < bot.pts.length; s1 += 2)_this.spawnOrb(bot.pts[s1].x, bot.pts[s1].y, 3);
                _audio.ArcadeAudio.play('ko');
                _this.score += 120;
                (0, _runtimeBridge.addXp)(15);
                (0, _runtimeBridge.updateInGameHud)(_this.score, _this.level, 16);
                _this.bots.splice(b1, 1);
                _this.spawnBot(bot.color);
                b1--;
                return b = b1, "continue";
            }
            if (bot.pts.some(function(seg, idx) {
                return (idx > 0 || _this1.player.len < bot.len + 2) && Math.hypot(seg.x - ph.x, seg.y - ph.y) < 16;
            })) {
                _audio.ArcadeAudio.play('hurt');
                _this.gameOverSequence(false);
                return b = b1, {
                    v: void void 0
                };
            }
            b = b1, void 0;
        };
        var _this1 = this;
        if (this.gameOver) return;
        if (this.player.steer) {
            this.player.angle += this.player.steer * 3.8 * dt;
        } else if (this.player.targetAngle !== null) {
            var diff = wrapAngleDelta(this.player.angle, this.player.targetAngle);
            this.player.angle += diff * (1 - Math.exp(-8 * dt));
        }
        var boosting = this.player.boosting && this.player.len > 10;
        if (boosting) this.player.len -= dt * 2.5;
        this.stepWorm(this.player, boosting ? 275 : 165, dt);
        var ph = this.player.pts[0];
        if (ph.x < 16 || ph.x > this.arena - 16 || ph.y < 16 || ph.y > this.arena - 16) {
            _audio.ArcadeAudio.play('hurt');
            this.gameOverSequence(false);
            return;
        }
        for(var i = this.orbs.length - 1; i >= 0; i--){
            var o = this.orbs[i];
            if (Math.hypot(o.x - ph.x, o.y - ph.y) < 22) {
                this.player.len += o.val * 0.6;
                this.score += o.val * 10;
                if (o.val >= 2) (0, _runtimeBridge.addCoins)(1);
                _audio.ArcadeAudio.play('coin');
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 16);
                this.orbs.splice(i, 1);
                this.spawnOrb();
            }
        }
        for(var b = 0; b < this.bots.length; b++){
            var _ret = (_this = this, _loop(b));
            if (_type_of(_ret) === "object") return _ret.v;
        }
    };
    _proto.draw = function draw() {
        var ctx = this.ctx;
        var ph = this.player.pts[0];
        var camX = ph.x - this.width / 2;
        var camY = ph.y - this.height / 2;
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.save();
        ctx.translate(-camX, -camY);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for(var g = 0; g <= this.arena; g += 80){
            ctx.beginPath();
            ctx.moveTo(g, 0);
            ctx.lineTo(g, this.arena);
            ctx.moveTo(0, g);
            ctx.lineTo(this.arena, g);
            ctx.stroke();
        }
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 8;
        ctx.strokeRect(0, 0, this.arena, this.arena);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.orbs), _step; !(_step = _iterator()).done;){
            var o = _step.value;
            ctx.fillStyle = o.color;
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.val >= 2 ? 7 : 5, 0, Math.PI * 2);
            ctx.fill();
        }
        var drawW = function drawW(w) {
            ctx.fillStyle = w.color;
            for(var i = w.pts.length - 1; i >= 0; i--){
                ctx.beginPath();
                ctx.arc(w.pts[i].x, w.pts[i].y, i === 0 ? 12 : 9, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(w.pts[0].x + Math.cos(w.angle) * 4, w.pts[0].y + Math.sin(w.angle) * 4, 3.5, 0, Math.PI * 2);
            ctx.fill();
        };
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.bots), _step1; !(_step1 = _iterator1()).done;){
            var bot = _step1.value;
            drawW(bot);
        }
        drawW(this.player);
        ctx.restore();
        var badgeY = this.width < 460 ? 52 : 12;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.beginPath();
        ctx.roundRect(this.width / 2 - 76, badgeY, 152, 26, 13);
        ctx.fill();
        ctx.font = '800 11px system-ui, sans-serif';
        ctx.fillStyle = '#84fab0';
        ctx.textAlign = 'center';
        ctx.fillText("\uD83D\uDC0D Mass: " + Math.floor(this.player.len) + " \xb7 Rivals: " + this.bots.length, this.width / 2, badgeY + 17);
        ctx.textAlign = 'left';
    };
    return WormIo;
}(_BaseGame.BaseGame);

});

})(window.ArcadeMod);
