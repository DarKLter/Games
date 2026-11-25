(function(ArcadeMod){
// === MODULE: src/games/hungry-shark/HungryShark ===
ArcadeMod.define("src/games/hungry-shark/HungryShark", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HungryShark", {
    enumerable: true,
    get: function() {
        return HungryShark;
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
var HungryShark = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(HungryShark, BaseGame);
    function HungryShark() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.shark = {
            x: 0,
            y: 240,
            angle: 0,
            size: 1,
            hunger: 100
        }, _this.camX = 0, _this.camY = 0, _this.targetScreenPos = null, _this.moveDx = 0, _this.moveDy = 0, _this.boosting = false, _this.goldRush = 0, _this.rushCharge = 0, _this.entities = [];
        return _this;
    }
    var _proto = HungryShark.prototype;
    _proto.init = function init() {
        this.shark = {
            x: 0,
            y: 240,
            angle: 0,
            size: 1,
            hunger: 100
        };
        this.camX = this.shark.x - this.width / 2;
        this.camY = this.shark.y - this.height / 2;
        this.targetScreenPos = null;
        this.moveDx = 0;
        this.moveDy = 0;
        this.boosting = false;
        this.goldRush = 0;
        this.rushCharge = 0;
        this.entities = [];
        this.maxLives = 3;
        this.lives = 3;
        for(var i = 0; i < 24; i++)this.spawnOceanEntity(true);
    };
    _proto.releaseInputs = function releaseInputs() {
        this.targetScreenPos = null;
        this.boosting = false;
        this.moveDx = 0;
        this.moveDy = 0;
    };
    _proto.pause = function pause() {
        BaseGame.prototype.pause.call(this);
        this.releaseInputs();
    };
    _proto.setBoost = function setBoost(on) {
        if (!on) {
            this.boosting = false;
            return;
        }
        if (this.gameOver || this.isPaused) return;
        if (!this.boosting) _audio.ArcadeAudio.play('boost');
        this.boosting = true;
    };
    _proto.setMoveDir = function setMoveDir(dx, dy) {
        if (this.gameOver || this.isPaused) {
            this.moveDx = 0;
            this.moveDy = 0;
            return;
        }
        this.moveDx = dx;
        this.moveDy = dy;
    };
    _proto.triggerAction = function triggerAction(actionKey, pressed) {
        if (actionKey === 'boost' || actionKey === 'action') this.setBoost(pressed);
    };
    _proto.onPointerDown = function onPointerDown(x, y) {
        if (this.gameOver || this.isPaused) return;
        this.targetScreenPos = {
            x: x,
            y: y
        };
    };
    _proto.onPointerMove = function onPointerMove(x, y) {
        if (this.gameOver || this.isPaused) return;
        if (this.targetScreenPos) this.targetScreenPos = {
            x: x,
            y: y
        };
    };
    _proto.onPointerUp = function onPointerUp() {
        this.targetScreenPos = null;
    };
    _proto.spawnOceanEntity = function spawnOceanEntity(anywhereInView) {
        if (anywhereInView === void 0) anywhereInView = false;
        var viewL = this.camX;
        var viewT = this.camY;
        var edgeRoll = Math.floor(Math.random() * 4);
        var ex = viewL + Math.random() * this.width;
        var ey = viewT + Math.random() * this.height;
        if (!anywhereInView) {
            var margin = 70;
            if (edgeRoll === 0) {
                ex = viewL - margin;
            } else if (edgeRoll === 1) {
                ex = viewL + this.width + margin;
            } else if (edgeRoll === 2) {
                ey = Math.max(0, viewT - margin);
            } else {
                ey = viewT + this.height + margin;
            }
        }
        // Unlimited horizontal ocean; keep minimum surface ceiling at y = 20
        ey = Math.max(24, ey);
        var roll = Math.random();
        var kind = 'prey';
        var icon = '🐟';
        var r = 14;
        var pts = 18;
        var spd = 62;
        if (roll < 0.14) {
            kind = 'mine';
            icon = '💣';
            r = 16;
            spd = 18;
        } else if (roll < 0.22) {
            kind = 'pred';
            icon = ey > 750 ? '🐙' : '🐋';
            r = 30;
            pts = 110;
            spd = 82;
        } else if (roll < 0.30) {
            kind = 'gem';
            icon = '💎';
            r = 16;
            pts = 55;
            spd = 25;
        } else if (roll < 0.50) {
            kind = 'prey';
            icon = ey > 550 ? '🦑' : '🐠';
            r = 16;
            pts = 26;
            spd = 72;
        } else if (roll < 0.65) {
            kind = 'prey';
            icon = ey < 260 ? '🤿' : '🦀';
            r = 18;
            pts = 42;
            spd = 48;
        }
        var dirX = ex < this.shark.x ? 1 : -1;
        this.entities.push({
            x: ex,
            y: ey,
            vx: dirX * spd * this.scaler.speedMult,
            vy: (Math.random() - 0.5) * 18,
            kind: kind,
            icon: icon,
            r: r,
            pts: pts
        });
    };
    _proto.update = function update(dt) {
        if (this.gameOver) return;
        if (this.goldRush > 0) this.goldRush = Math.max(0, this.goldRush - dt);
        var boostMult = this.boosting && this.shark.hunger > 15 || this.goldRush > 0 ? 1.85 : 1;
        var hungerDrain = this.goldRush > 0 ? 0.5 : this.boosting ? 7.2 : 3.2;
        this.shark.hunger -= dt * hungerDrain * this.scaler.speedMult;
        if (this.shark.hunger <= 0) {
            this.gameOverSequence(false);
            return;
        }
        var vx = this.moveDx;
        var vy = this.moveDy;
        if (this.targetScreenPos) {
            var worldTx = this.camX + this.targetScreenPos.x;
            var worldTy = this.camY + this.targetScreenPos.y;
            var dx = worldTx - this.shark.x;
            var dy = worldTy - this.shark.y;
            var d = Math.hypot(dx, dy);
            if (d > 8) {
                vx = dx / d;
                vy = dy / d;
            }
        }
        var spd = 235 * boostMult;
        // Unlimited horizontal & deep diving world (bounded only by sea surface at y = 18)
        this.shark.x += vx * spd * dt;
        this.shark.y = Math.max(18, this.shark.y + vy * spd * dt);
        if (Math.hypot(vx, vy) > 0.1) this.shark.angle = Math.atan2(vy, vx);
        // Smooth camera tracking
        var targetCamX = this.shark.x - this.width / 2;
        var targetCamY = Math.max(-40, this.shark.y - this.height / 2);
        var camAlpha = 1 - Math.exp(-8 * dt);
        this.camX += (targetCamX - this.camX) * camAlpha;
        this.camY += (targetCamY - this.camY) * camAlpha;
        var desiredCount = 24 + Math.min(18, this.level * 2);
        while(this.entities.length < desiredCount)this.spawnOceanEntity(false);
        var sharkR = 22 + Math.min(20, (this.shark.size - 1) * 9);
        for(var i = this.entities.length - 1; i >= 0; i--){
            var e = this.entities[i];
            e.x += e.vx * dt;
            e.y = Math.max(24, e.y + e.vy * dt);
            var sx = e.x - this.camX;
            var sy = e.y - this.camY;
            if (Math.hypot(e.x - this.shark.x, e.y - this.shark.y) < sharkR + e.r) {
                var canEat = this.goldRush > 0 || e.kind === 'prey' || e.kind === 'gem' || e.kind === 'pred' && this.shark.size >= 1.7;
                if (canEat) {
                    this.entities.splice(i, 1);
                    this.shark.hunger = Math.min(100, this.shark.hunger + (e.kind === 'gem' ? 12 : 18));
                    this.shark.size = Math.min(2.6, this.shark.size + 0.03);
                    var pts = e.pts * (this.goldRush > 0 ? 2 : 1);
                    this.score += pts;
                    this.rushCharge += e.kind === 'gem' ? 22 : 12;
                    if (this.rushCharge >= 100 && this.goldRush <= 0) {
                        this.rushCharge = 0;
                        this.goldRush = 7.5;
                        _audio.ArcadeAudio.play('levelup');
                        this.spawnPopup(this.width / 2, this.height * 0.34, '⚡ GOLD RUSH FEVER!', '#facc15');
                    }
                    (0, _runtimeBridge.addCoins)(e.kind === 'gem' || this.goldRush > 0 ? 3 : 1);
                    _audio.ArcadeAudio.play('chomp');
                    (0, _runtimeBridge.addXp)(5);
                    if (this.score >= this.level * 400) this.level++;
                    (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 15);
                    this.spawnParticles(sx, sy, this.goldRush > 0 ? '#facc15' : '#ef4444', 7, 130);
                    continue;
                } else {
                    this.entities.splice(i, 1);
                    this.lives--;
                    _audio.ArcadeAudio.play('hurt');
                    this.triggerShake(8, 0.2);
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                    if (this.lives <= 0) {
                        this.gameOverSequence(false);
                        return;
                    }
                    continue;
                }
            }
            var maxRange = Math.max(this.width, this.height) * 0.95 + 180;
            if (Math.abs(e.x - this.shark.x) > maxRange || Math.abs(e.y - this.shark.y) > maxRange) {
                this.entities.splice(i, 1);
            }
        }
    };
    _proto.draw = function draw() {
        var ctx = this.ctx;
        // Dynamic depth color based on vertical position
        var depth = Math.max(0, Math.floor(this.shark.y / 12));
        var deepFactor = Math.min(1, Math.max(0, this.camY / 900));
        var topR = Math.round(3 + (2 - 3) * deepFactor);
        var topG = Math.round(105 * (1 - deepFactor * 0.72));
        var topB = Math.round(161 * (1 - deepFactor * 0.52));
        ctx.fillStyle = "rgb(" + topR + ", " + topG + ", " + topB + ")";
        ctx.fillRect(0, 0, this.width, this.height);
        // Infinite sky / water surface when camera nears top
        var surfaceScreenY = 0 - this.camY;
        if (surfaceScreenY > 0) {
            ctx.fillStyle = '#7dd3fc';
            ctx.fillRect(0, 0, this.width, Math.min(this.height, surfaceScreenY));
        }
        // Parallax bubbles & sea columns keyed cleanly off modulo world grid
        var gridStep = 220;
        var startGx = Math.floor(this.camX / gridStep) * gridStep;
        var startGy = Math.max(80, Math.floor(this.camY / gridStep) * gridStep);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        for(var gx = startGx; gx < this.camX + this.width + gridStep; gx += gridStep){
            for(var gy = startGy; gy < this.camY + this.height + gridStep; gy += gridStep){
                var hash = Math.abs(Math.sin(gx * 0.17 + gy * 0.31));
                var sx = gx + hash * 120 - this.camX;
                var sy = gy + hash * 97 % 1 * 120 - this.camY;
                ctx.beginPath();
                ctx.arc(sx, sy, 4 + hash * 8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.save();
        ctx.translate(-this.camX, -this.camY);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.entities), _step; !(_step = _iterator()).done;){
            var e = _step.value;
            var icon = this.goldRush > 0 && (e.kind === 'prey' || e.kind === 'pred') ? '🪙' : e.icon;
            _emojiCache.EmojiCache.draw(ctx, icon, e.x, e.y, e.r * 1.9, 0, e.vx < 0 ? 1 : -1, 1);
        }
        var flipX = Math.cos(this.shark.angle) >= 0 ? -1 : 1;
        if (this.goldRush > 0) {
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.shark.x, this.shark.y, 30 * Math.min(1.8, this.shark.size), 0, Math.PI * 2);
            ctx.stroke();
        }
        _emojiCache.EmojiCache.draw(ctx, '🦈', this.shark.x, this.shark.y, Math.round(44 * Math.min(1.9, this.shark.size)), 0, flipX, 1);
        ctx.restore();
        var bw = Math.min(180, this.width * 0.44);
        var isCompactLand = this.width > this.height * 1.35 && this.height < 480;
        var by = this.width < 460 ? 58 : isCompactLand ? 14 : 48;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath();
        ctx.roundRect((this.width - bw) / 2, by, bw, 14, 7);
        ctx.fill();
        ctx.fillStyle = this.goldRush > 0 ? '#facc15' : this.shark.hunger < 25 ? '#ef4444' : '#38bdf8';
        ctx.beginPath();
        ctx.roundRect((this.width - bw) / 2 + 2, by + 2, (bw - 4) * (this.shark.hunger / 100), 10, 5);
        ctx.fill();
        ctx.font = '800 10px system-ui, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        var distKm = Math.floor(Math.hypot(this.shark.x, this.shark.y - 240) / 100);
        ctx.fillText(this.goldRush > 0 ? "⚡ GOLD RUSH " + Math.ceil(this.goldRush) + "s \xb7 Depth " + depth + "m" : "\uD83E\uDD88 Size " + this.shark.size.toFixed(1) + "x \xb7 " + distKm + "m \xb7 Depth " + depth + "m", this.width / 2, by + 26);
        ctx.textAlign = 'left';
    };
    return HungryShark;
}(_BaseGame.BaseGame);

});

})(window.ArcadeMod);
