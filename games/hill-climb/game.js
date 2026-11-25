(function(ArcadeMod){
// === MODULE: src/games/hill-climb/HillClimb ===
ArcadeMod.define("src/games/hill-climb/HillClimb", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HillClimb", {
    enumerable: true,
    get: function() {
        return HillClimb;
    }
});
var _audio = require("../../core/audio");
var _emojiCache = require("../../core/emojiCache");
var _runtimeBridge = require("../../core/runtimeBridge");
var _storage = require("../../core/storage");
var _BaseGame = require("../../core/BaseGame");
var _hillClimbPhysics = require("./hillClimbPhysics");
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
var HillClimb = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(HillClimb, BaseGame);
    function HillClimb() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.carX = 160, _this.carY = 0, _this.vx = 0, _this.vy = 0, _this.angle = 0, _this.angVel = 0, _this.gas = false, _this.brake = false, _this.fuel = 100, _this.bestDist = 0, _this.pickups = [], _this.nextSpawnX = 420, _this.wasOnGround = true;
        return _this;
    }
    var _proto = HillClimb.prototype;
    _proto.init = function init() {
        this.carX = 160;
        this.carY = this.getTerrainY(160) - 20;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.angVel = 0;
        this.gas = false;
        this.brake = false;
        this.fuel = 100;
        this.maxLives = 1;
        this.lives = 1;
        this.bestDist = 0;
        this.pickups = [];
        this.nextSpawnX = 420;
        this.wasOnGround = true;
    };
    _proto.releaseInputs = function releaseInputs() {
        this.gas = false;
        this.brake = false;
    };
    _proto.pause = function pause() {
        BaseGame.prototype.pause.call(this);
        this.releaseInputs();
    };
    _proto.resize = function resize() {
        BaseGame.prototype.resize.call(this);
        var gy = this.getTerrainY(this.carX);
        if (this.wasOnGround) this.carY = gy - 20;
        else this.carY = Math.min(this.carY, gy - 20);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.pickups), _step; !(_step = _iterator()).done;){
            var p = _step.value;
            p.y = this.getTerrainY(p.x) - 28;
        }
        if (this.isPaused) this.draw();
    };
    _proto.setSteerLeft = function setSteerLeft(down) {
        if (!down) {
            this.brake = false;
            return;
        }
        if (this.gameOver || this.isPaused) return;
        this.brake = true;
    };
    _proto.setSteerRight = function setSteerRight(down) {
        if (!down) {
            this.gas = false;
            return;
        }
        if (this.gameOver || this.isPaused) return;
        this.gas = true;
    };
    _proto.triggerAction = function triggerAction(actionKey, pressed) {
        if (actionKey === 'boost' || actionKey === 'action') {
            if (!pressed) {
                this.gas = false;
                return;
            }
            if (this.gameOver || this.isPaused) return;
            if (this.fuel > 12) {
                this.gas = true;
                this.vx += 110;
                _audio.ArcadeAudio.play('boost');
            }
        }
    };
    _proto.getTerrainY = function getTerrainY(x) {
        return (0, _hillClimbPhysics.terrainY)(x, this.height);
    };
    _proto.getSlope = function getSlope(x) {
        return (0, _hillClimbPhysics.terrainSlope)(x, this.height);
    };
    _proto.update = function update(dt) {
        if (this.gameOver) return;
        this.fuel = Math.max(0, this.fuel - dt * (this.gas ? 5.2 : 2.1) * this.scaler.speedMult);
        if (this.fuel <= 0 && Math.abs(this.vx) < 12) {
            this.spawnPopup(this.width * 0.38, this.height * 0.35, '⛽ OUT OF FUEL!', '#ef4444');
            this.gameOverSequence(false);
            return;
        }
        var gx = this.carX;
        var gy = this.getTerrainY(gx);
        var slopeAngle = Math.atan(this.getSlope(gx));
        var onGround = this.carY >= gy - 23;
        if (onGround) {
            if (!this.wasOnGround) {
                if ((0, _hillClimbPhysics.isCrashLanding)(this.angle, slopeAngle)) {
                    _audio.ArcadeAudio.play('break');
                    this.triggerShake(12, 0.3);
                    this.spawnPopup(this.width * 0.35, this.height * 0.35, '💥 BAD LANDING!', '#ef4444');
                    this.gameOverSequence(false);
                    return;
                }
                if (this.vy > 215) {
                    this.vy = -this.vy * 0.22;
                    this.angVel += (0, _hillClimbPhysics.normalizeAngle)(this.angle - slopeAngle) * 1.6;
                    _audio.ArcadeAudio.play('break');
                } else {
                    this.vy = 0;
                }
            }
            this.carY = gy - 20;
            var diff = (0, _hillClimbPhysics.normalizeAngle)(slopeAngle - this.angle);
            // Responsive suspension alignment keeps car steady on the starting pad and smooth crests
            this.angle += diff * (1 - Math.exp(-8.5 * dt));
            this.angVel *= Math.exp(-8.5 * dt);
            if (this.gas && this.fuel > 0) {
                this.vx += 450 * dt;
                // Wheelie torque only on steep uphill hills beyond the launch pad
                if (gx > 460 && slopeAngle < -0.28) {
                    this.angVel -= 0.75 * dt;
                }
                if (Math.random() < dt * 7) _audio.ArcadeAudio.play('gas');
            }
            if (this.brake) {
                this.vx -= 350 * dt;
            }
            this.vx -= Math.sin(slopeAngle) * 295 * dt;
            this.vx *= Math.exp(-0.9 * dt);
            var aheadSlope = this.getSlope(gx + 18) - this.getSlope(gx);
            if (this.vx > 225 && aheadSlope > 0.13) {
                this.vy = -Math.min(315, this.vx * 0.52);
                this.angVel -= aheadSlope * 2.8;
            }
        } else {
            this.vy += 600 * dt;
            if (this.gas) this.angVel -= 4.2 * dt; // pitch nose UP
            if (this.brake) this.angVel += 4.2 * dt; // pitch nose DOWN
            this.angle += this.angVel * dt;
            this.angVel *= Math.exp(-0.5 * dt);
        }
        this.wasOnGround = onGround;
        this.carX = Math.max(40, this.carX + this.vx * dt);
        this.carY += this.vy * dt;
        var normAng = Math.abs((0, _hillClimbPhysics.normalizeAngle)(this.angle));
        if (onGround && normAng > 1.38) {
            _audio.ArcadeAudio.play('hurt');
            this.triggerShake(10, 0.25);
            this.spawnPopup(this.width * 0.35, this.height * 0.35, '💥 FLIPPED!', '#ef4444');
            this.gameOverSequence(false);
            return;
        }
        while(this.nextSpawnX < this.carX + this.width + 220){
            var isFuel = this.nextSpawnX % 1100 < 220;
            this.pickups.push({
                x: this.nextSpawnX,
                y: this.getTerrainY(this.nextSpawnX) - 28,
                kind: isFuel ? 'fuel' : 'coin',
                taken: false
            });
            this.nextSpawnX += isFuel ? 220 : 145;
        }
        for(var i = this.pickups.length - 1; i >= 0; i--){
            var p = this.pickups[i];
            if (!p.taken && Math.hypot(p.x - this.carX, p.y - this.carY) < 44) {
                p.taken = true;
                if (p.kind === 'fuel') {
                    this.fuel = Math.min(100, this.fuel + 45);
                    _audio.ArcadeAudio.play('save');
                    this.spawnPopup(this.width * 0.35, this.height * 0.35, '⛽ +FUEL!', '#84fab0');
                } else {
                    this.score += 20;
                    (0, _runtimeBridge.addCoins)(2);
                    _audio.ArcadeAudio.play('coin');
                    (0, _runtimeBridge.addXp)(4);
                }
            }
            if (p.taken || p.x < this.carX - 240) this.pickups.splice(i, 1);
        }
        var distM = Math.max(0, Math.floor((this.carX - 160) / 15));
        if (distM > this.bestDist) {
            this.score += distM - this.bestDist;
            this.bestDist = distM;
            this.level = 1 + Math.floor(distM / 120);
            (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 11);
        }
    };
    _proto.draw = function draw() {
        var ctx = this.ctx;
        var camX = this.carX - Math.min(160, this.width * 0.28);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(0, 0, this.width, this.height * 0.55);
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(0, this.height * 0.55, this.width, this.height * 0.45);
        ctx.beginPath();
        ctx.moveTo(0, this.height);
        for(var sx = 0; sx <= this.width + 16; sx += 14){
            ctx.lineTo(sx, this.getTerrainY(camX + sx));
        }
        ctx.lineTo(this.width, this.height);
        ctx.closePath();
        ctx.fillStyle = '#78350f';
        ctx.fill();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 7;
        ctx.beginPath();
        for(var sx1 = 0; sx1 <= this.width + 16; sx1 += 14){
            var sy = this.getTerrainY(camX + sx1);
            if (sx1 === 0) ctx.moveTo(sx1, sy);
            else ctx.lineTo(sx1, sy);
        }
        ctx.stroke();
        // Starting Flag on the flat launch pad
        var startFlagScreenX = 360 - camX;
        if (startFlagScreenX > -40 && startFlagScreenX < this.width + 40) {
            var fy = this.getTerrainY(360);
            _emojiCache.EmojiCache.draw(ctx, '🏁', startFlagScreenX, fy - 22, 28);
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(this.pickups), _step; !(_step = _iterator()).done;){
            var p = _step.value;
            var sx2 = p.x - camX;
            _emojiCache.EmojiCache.draw(ctx, p.kind === 'fuel' ? '⛽' : '🪙', sx2, p.y, 28);
        }
        var cx = this.carX - camX;
        var cy = this.carY;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.angle);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(-26, -18, 52, 20, 6);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-12, -28, 24, 12);
        _emojiCache.EmojiCache.draw(ctx, _storage.playerState.currentAvatar, -2, -26, 20);
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.arc(-16, 4, 9, 0, Math.PI * 2);
        ctx.arc(16, 4, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        var barW = Math.min(180, this.width * 0.44);
        var bx = (this.width - barW) / 2;
        var isCompactLand = this.width > this.height * 1.35 && this.height < 480;
        var by = this.width < 460 ? 58 : isCompactLand ? 14 : 48;
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.beginPath();
        ctx.roundRect(bx, by, barW, 18, 9);
        ctx.fill();
        ctx.fillStyle = this.fuel < 25 ? '#ef4444' : '#22c55e';
        ctx.beginPath();
        ctx.roundRect(bx + 2, by + 2, Math.max(0, (barW - 4) * (this.fuel / 100)), 14, 7);
        ctx.fill();
        ctx.font = '800 10px system-ui, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText("⛽ " + Math.ceil(this.fuel) + "% \xb7 " + this.bestDist + "m", this.width / 2, by + 13);
        ctx.textAlign = 'left';
    };
    return HillClimb;
}(_BaseGame.BaseGame);

});
// === MODULE: src/games/hill-climb/hillClimbPhysics ===
ArcadeMod.define("src/games/hill-climb/hillClimbPhysics", function(require, module, exports) {
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
    get isCrashLanding () {
        return isCrashLanding;
    },
    get normalizeAngle () {
        return normalizeAngle;
    },
    get smoothstep () {
        return smoothstep;
    },
    get terrainSlope () {
        return terrainSlope;
    },
    get terrainY () {
        return terrainY;
    }
});
function smoothstep(edge0, edge1, x) {
    var t = Math.max(0, Math.min(1, (x - edge0) / Math.max(0.0001, edge1 - edge0)));
    return t * t * (3 - 2 * t);
}
function terrainY(x, screenHeight) {
    var base = screenHeight * 0.67;
    // Flat starting launch pad (x <= 380) smoothly blending into progressive rolling & steep hills
    var ramp = smoothstep(380, 1050, x);
    if (ramp <= 0) return base;
    var distFactor = 1 + Math.min(0.9, Math.max(0, x - 380) / 6200);
    var amp = Math.min(122, screenHeight * 0.2) * distFactor * ramp;
    var hx = x - 380;
    return base - (Math.sin(hx * 0.0055) * amp * 0.48 + Math.sin(hx * 0.0135 + 1.1) * amp * 0.32 + Math.sin(hx * 0.024 + 0.4) * amp * 0.18 + (1 - Math.cos(hx * 0.0024)) * amp * 0.22);
}
function terrainSlope(x, screenHeight) {
    return (terrainY(x + 4, screenHeight) - terrainY(x - 4, screenHeight)) / 8;
}
function normalizeAngle(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
}
function isCrashLanding(carAngle, slopeAngle) {
    var normCar = normalizeAngle(carAngle);
    if (Math.abs(normCar) > 1.38) return true;
    var diff = normalizeAngle(normCar - slopeAngle);
    return Math.abs(diff) > 0.92;
}

});

})(window.ArcadeMod);
