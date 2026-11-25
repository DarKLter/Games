(function(ArcadeMod){
// === MODULE: src/core/BaseFPSGame ===
ArcadeMod.define("src/core/BaseFPSGame", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BaseFPSGame", {
    enumerable: true,
    get: function() {
        return BaseFPSGame;
    }
});
var _audio = require("./audio");
var _BaseGame = require("./BaseGame");
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
var BaseFPSGame = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(BaseFPSGame, BaseGame);
    function BaseFPSGame() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.aimX = 0, _this.aimY = 0, _this.maxAmmo = 8, _this.ammo = 8, _this.reloadDuration = 0.85, _this.isReloading = false, _this.reloadTimer = 0, _this.sfxType = 'shot', _this.recoil = 0, _this.muzzleFlash = 0, _this.hitMarker = 0, _this.hitMarkerColor = '#ffffff', _this.damageFlash = 0, _this.streak = 0, _this.shotsFired = 0, _this.shotsHit = 0, _this.clockTime = 0, _this.isScoped = false;
        return _this;
    }
    var _proto = BaseFPSGame.prototype;
    _proto.initFPS = function initFPS(maxAmmo, reloadDuration, sfxType) {
        if (maxAmmo === void 0) maxAmmo = 8;
        if (reloadDuration === void 0) reloadDuration = 0.85;
        if (sfxType === void 0) sfxType = 'shot';
        this.maxLives = 3;
        this.lives = 3;
        this.aimX = this.width / 2;
        this.aimY = this.height / 2;
        this.maxAmmo = maxAmmo;
        this.ammo = maxAmmo;
        this.reloadDuration = reloadDuration;
        this.isReloading = false;
        this.reloadTimer = 0;
        this.sfxType = sfxType;
        this.recoil = 0;
        this.muzzleFlash = 0;
        this.hitMarker = 0;
        this.hitMarkerColor = '#ffffff';
        this.damageFlash = 0;
        this.streak = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.clockTime = 0;
    };
    _proto.handlePointerMove = function handlePointerMove(x, y) {
        if (this.gameOver || this.isPaused) return;
        this.aimX = Math.max(0, Math.min(this.width, x));
        this.aimY = Math.max(0, Math.min(this.height, y));
    };
    _proto.reload = function reload() {
        if (this.gameOver || this.isPaused || this.isReloading || this.ammo >= this.maxAmmo) return;
        this.isReloading = true;
        this.reloadTimer = this.reloadDuration;
        _audio.ArcadeAudio.play('reload');
    };
    _proto.onFire = function onFire(_sx, _sy, _pointerType, _prevAimX, _prevAimY) {
        if (_pointerType === void 0) _pointerType = 'mouse';
        if (_prevAimX === void 0) _prevAimX = 0;
        if (_prevAimY === void 0) _prevAimY = 0;
        return false;
    };
    _proto.handleFire = function handleFire(x, y, pointerType) {
        if (pointerType === void 0) pointerType = 'mouse';
        if (this.gameOver || this.isPaused) return;
        var prevAimX = this.aimX;
        var prevAimY = this.aimY;
        if (!(this.isScoped && pointerType === 'touch')) {
            this.handlePointerMove(x, y);
        }
        if (this.isReloading) return;
        if (this.ammo <= 0) {
            this.reload();
            return;
        }
        this.ammo--;
        this.shotsFired++;
        this.recoil = 1;
        this.muzzleFlash = 0.08;
        _audio.ArcadeAudio.play(this.sfxType);
        var hitResult = this.onFire(x, y, pointerType, prevAimX, prevAimY);
        if (hitResult) {
            this.shotsHit++;
            this.hitMarker = 0.16;
            this.hitMarkerColor = hitResult === 'crit' ? '#ffd700' : hitResult === 'bad' ? '#ff4757' : '#84fab0';
        }
        if (this.ammo <= 0) this.reload();
    };
    _proto.updateFPSBase = function updateFPSBase(dt) {
        this.clockTime += dt;
        if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - dt * 7);
        if (this.muzzleFlash > 0) this.muzzleFlash = Math.max(0, this.muzzleFlash - dt);
        if (this.hitMarker > 0) this.hitMarker = Math.max(0, this.hitMarker - dt);
        if (this.damageFlash > 0) this.damageFlash = Math.max(0, this.damageFlash - dt * 2.2);
        if (this.isReloading) {
            this.reloadTimer -= dt;
            if (this.reloadTimer <= 0) {
                this.isReloading = false;
                this.ammo = this.maxAmmo;
                _audio.ArcadeAudio.play('reload');
            }
        }
    };
    _proto.getCamOffset = function getCamOffset(strength) {
        if (strength === void 0) strength = 18;
        var nx = this.aimX / Math.max(1, this.width) - 0.5;
        var ny = this.aimY / Math.max(1, this.height) - 0.5;
        return {
            cx: -nx * strength,
            cy: -ny * (strength * 0.65)
        };
    };
    _proto.drawWeaponViewmodel = function drawWeaponViewmodel(bodyColor, accentColor, gunType) {
        if (bodyColor === void 0) bodyColor = '#2c3e50';
        if (accentColor === void 0) accentColor = '#84fab0';
        if (gunType === void 0) gunType = 'carbine';
        var ctx = this.ctx;
        var baseW = Math.min(this.width, this.height);
        var scale = Math.max(0.65, Math.min(1.15, baseW / 540));
        var swayX = (this.aimX / Math.max(1, this.width) - 0.5) * 32;
        var kick = this.recoil * 22 * scale;
        var gx = this.width * 0.78 + swayX;
        var gy = this.height - 6 + kick;
        ctx.save();
        ctx.translate(gx, gy);
        ctx.scale(scale, scale);
        ctx.rotate(-0.18 - this.recoil * 0.14);
        ctx.fillStyle = '#141820';
        ctx.fillRect(-18, -110, 36, 95);
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-26, -65, 52, 80);
        if (gunType === 'sniper') {
            ctx.fillStyle = '#0d1117';
            ctx.fillRect(-9, -152, 18, 52);
            ctx.fillStyle = accentColor;
            ctx.fillRect(-12, -96, 24, 10);
        } else {
            ctx.fillStyle = accentColor;
            ctx.fillRect(-6, -102, 12, 24);
        }
        if (this.muzzleFlash > 0) {
            var tipY = gunType === 'sniper' ? -156 : -114;
            ctx.fillStyle = 'rgba(255, 225, 90, 0.92)';
            ctx.beginPath();
            ctx.arc(0, tipY, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, tipY, 10, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };
    _proto.drawCrosshair = function drawCrosshair(x, y, color, radius) {
        if (color === void 0) color = '#84fab0';
        if (radius === void 0) radius = 16;
        var ctx = this.ctx;
        var r = radius + this.recoil * 8;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - r - 6, y);
        ctx.lineTo(x - r + 4, y);
        ctx.moveTo(x + r - 4, y);
        ctx.lineTo(x + r + 6, y);
        ctx.moveTo(x, y - r - 6);
        ctx.lineTo(x, y - r + 4);
        ctx.moveTo(x, y + r - 4);
        ctx.lineTo(x, y + r + 6);
        ctx.stroke();
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        if (this.hitMarker > 0) {
            ctx.strokeStyle = this.hitMarkerColor;
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.moveTo(x - 10, y - 10);
            ctx.lineTo(x - 4, y - 4);
            ctx.moveTo(x + 10, y - 10);
            ctx.lineTo(x + 4, y - 4);
            ctx.moveTo(x - 10, y + 10);
            ctx.lineTo(x - 4, y + 4);
            ctx.moveTo(x + 10, y + 10);
            ctx.lineTo(x + 4, y + 4);
            ctx.stroke();
        }
        ctx.restore();
    };
    _proto.drawFPSHudOverlay = function drawFPSHudOverlay(extraText) {
        if (extraText === void 0) extraText = '';
        var ctx = this.ctx;
        if (this.damageFlash > 0) {
            ctx.fillStyle = "rgba(231, 76, 60, " + Math.min(0.45, this.damageFlash * 0.45) + ")";
            ctx.fillRect(0, 0, this.width, this.height);
        }
        var isNarrow = this.width < 480;
        var boxW = isNarrow ? Math.max(88, Math.floor(this.width * 0.5 - 52)) : Math.min(185, Math.floor(this.width * 0.36));
        var boxH = isNarrow ? 40 : 44;
        var bx = isNarrow ? 8 : 12;
        var by = this.height - boxH - (isNarrow ? 10 : 12);
        ctx.fillStyle = 'rgba(12, 18, 14, 0.85)';
        ctx.strokeStyle = 'rgba(132, 250, 176, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, 10);
        ctx.fill();
        ctx.stroke();
        ctx.font = isNarrow ? '800 11px system-ui, sans-serif' : '800 12px system-ui, sans-serif';
        ctx.fillStyle = this.isReloading ? '#ffd700' : '#ffffff';
        ctx.textAlign = 'left';
        var ammoLabel = this.isReloading ? isNarrow ? 'RELOAD...' : 'RELOADING...' : "\uD83D\uDD2B " + this.ammo + "/" + this.maxAmmo + (this.streak >= 2 ? " \uD83D\uDD25" + this.streak : '');
        ctx.fillText(ammoLabel, bx + 8, by + (isNarrow ? 16 : 18));
        var barW = boxW - 16;
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.fillRect(bx + 8, by + (isNarrow ? 24 : 26), barW, 7);
        var fillRatio = this.isReloading ? Math.max(0, 1 - this.reloadTimer / this.reloadDuration) : this.ammo / Math.max(1, this.maxAmmo);
        ctx.fillStyle = this.isReloading ? '#ffd700' : this.ammo <= 2 ? '#ff6b6b' : '#84fab0';
        ctx.fillRect(bx + 8, by + (isNarrow ? 24 : 26), barW * fillRatio, 7);
        if (extraText) {
            ctx.font = isNarrow ? '800 10.5px system-ui, sans-serif' : '800 12px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#84fab0';
            var extraY = isNarrow ? Math.max(70, this.height * 0.11 + 20) : Math.max(58, this.height * 0.08 + 20);
            ctx.fillText(extraText, this.width / 2, extraY);
            ctx.textAlign = 'left';
        }
    };
    return BaseFPSGame;
}(_BaseGame.BaseGame);

});
// === MODULE: src/core/BaseGame ===
ArcadeMod.define("src/core/BaseGame", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BaseGame", {
    enumerable: true,
    get: function() {
        return BaseGame;
    }
});
var _emojiCache = require("./emojiCache");
var _storage = require("./storage");
var _types = require("./types");
var _audio = require("./audio");
var _runtimeBridge = require("./runtimeBridge");
var _viewport = require("./viewport");
var BaseGame = /*#__PURE__*/ function() {
    "use strict";
    function BaseGame(canvas, ctx, diff, lvl, gameIdx) {
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.maxLives = 3;
        this.gameOver = false;
        this.survivalElapsed = 0;
        this.animId = null;
        this.lastTime = 0;
        this.smoothDt = 1 / 60;
        this.particles = [];
        this.popups = [];
        this.shakeTime = 0;
        this.shakeMag = 0;
        this.canvas = canvas;
        this.ctx = ctx;
        this.diff = diff;
        this.level = lvl;
        this.gameIdx = gameIdx;
        var vp = typeof window !== 'undefined' ? (0, _viewport.getViewportSize)() : {
            width: 800,
            height: 600
        };
        this.width = vp.width;
        this.height = vp.height;
        this.scaler = _types.difficultyScalers[diff] || _types.difficultyScalers.easy;
        this.lastTime = performance.now();
        _storage.playerState.sessionCoins = 0;
        _storage.playerState.sessionExp = 0;
    }
    var _proto = BaseGame.prototype;
    _proto.triggerShake = function triggerShake(mag, dur) {
        if (mag === void 0) mag = 6;
        if (dur === void 0) dur = 0.16;
        this.shakeMag = Math.max(this.shakeMag, mag);
        this.shakeTime = Math.max(this.shakeTime, dur);
    };
    _proto.start = function start() {
        this.resize();
        this.isRunning = true;
        this.lastTime = performance.now();
        var preload = [
            '🪙',
            '⭐',
            '🦋',
            '🐝',
            '🏎️',
            '🚗',
            '🚘',
            '🛻',
            '🚚',
            '🚌',
            '🎯',
            '🙋',
            '💀',
            '🧟',
            '🧟‍♂️',
            '🧟‍♀️',
            '👹',
            '🏃‍♀️',
            '🧰',
            '👩',
            '🧑',
            '🧑‍⚕️',
            '🦹',
            '🥷',
            '🤖',
            '☀️',
            '🌱',
            '🌰',
            '🍒',
            '🐷',
            '🍔',
            '🍕',
            '🌮',
            '🍣',
            '🐟',
            '🐠',
            '💣',
            '⛽',
            '🥗',
            '🍳',
            '🌯',
            '🍰',
            '🥪',
            '🪖',
            '🧨',
            '🏥',
            '🔫',
            '⚔️',
            '⛏️',
            '🗡️',
            '🏹',
            '🛡️',
            '🪄',
            '👑',
            _storage.playerState.currentAvatar
        ];
        preload.forEach(function(em) {
            return _emojiCache.EmojiCache.get(em, 28);
        });
        this.init();
        this.loop(this.lastTime);
    };
    _proto.stop = function stop() {
        this.isRunning = false;
        if (this.animId !== null) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
        this.shakeTime = 0;
        this.shakeMag = 0;
        this.particles = [];
        this.popups = [];
        this.releaseInputs();
    };
    _proto.releaseInputs = function releaseInputs() {};
    _proto.pause = function pause() {
        this.isPaused = true;
        this.releaseInputs();
        if (this.animId !== null) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
    };
    _proto.resume = function resume() {
        var _this = this;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.smoothDt = 1 / 60;
        if (this.isRunning && !this.gameOver && this.animId === null) {
            this.animId = requestAnimationFrame(function(t) {
                return _this.loop(t);
            });
        }
    };
    _proto.resize = function resize() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var vp = (0, _viewport.getViewportSize)();
        this.width = Math.max(240, vp.width);
        this.height = Math.max(240, vp.height);
        this.canvas.width = Math.floor(this.width * dpr);
        this.canvas.height = Math.floor(this.height * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (this.isPaused) this.draw();
    };
    _proto.spawnParticles = function spawnParticles(x, y, color, count, speed) {
        if (count === void 0) count = 8;
        if (speed === void 0) speed = 160;
        var cap = Math.min(count, Math.max(0, 72 - this.particles.length));
        for(var i = 0; i < cap; i++){
            var ang = Math.PI * 2 * i / Math.max(1, count) + (Math.random() - 0.5) * 0.5;
            var spd = speed * (0.45 + Math.random() * 0.75);
            var life = 0.45 + Math.random() * 0.25;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 30,
                r: 3 + Math.random() * 3.5,
                color: color,
                life: life,
                maxLife: life
            });
        }
    };
    _proto.spawnPopup = function spawnPopup(x, y, text, color) {
        if (color === void 0) color = '#ffd700';
        if (this.popups.length < 24) {
            this.popups.push({
                x: x,
                y: y,
                text: text,
                color: color,
                life: 0.75,
                maxLife: 0.75
            });
        }
    };
    _proto.updateEffects = function updateEffects(dt) {
        if (this.shakeTime > 0) this.shakeTime = Math.max(0, this.shakeTime - dt);
        for(var i = this.particles.length - 1; i >= 0; i--){
            var p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 320 * dt;
            p.life -= dt;
            if (p.life <= 0) {
                this.particles[i] = this.particles[this.particles.length - 1];
                this.particles.pop();
            }
        }
        for(var i1 = this.popups.length - 1; i1 >= 0; i1--){
            var pop = this.popups[i1];
            pop.y -= 48 * dt;
            pop.life -= dt;
            if (pop.life <= 0) {
                this.popups[i1] = this.popups[this.popups.length - 1];
                this.popups.pop();
            }
        }
    };
    _proto.drawEffects = function drawEffects() {
        for(var i = 0; i < this.particles.length; i++){
            var p = this.particles[i];
            this.ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
        if (this.popups.length > 0) {
            this.ctx.font = '800 15px system-ui, sans-serif';
            this.ctx.textAlign = 'center';
            for(var i1 = 0; i1 < this.popups.length; i1++){
                var pop = this.popups[i1];
                this.ctx.globalAlpha = Math.max(0, Math.min(1, pop.life / pop.maxLife * 1.4));
                this.ctx.fillStyle = pop.color;
                this.ctx.fillText(pop.text, pop.x, pop.y);
            }
            this.ctx.globalAlpha = 1;
            this.ctx.textAlign = 'left';
        }
    };
    _proto.loop = function loop(time) {
        var _this = this;
        if (!this.isRunning || this.isPaused || this.gameOver) {
            this.animId = null;
            return;
        }
        var elapsedMs = time - this.lastTime;
        if (elapsedMs > 250) {
            this.smoothDt = 1 / 60;
        }
        var rawDt = Math.min(Math.max(elapsedMs / 1000, 0.001), 0.05);
        this.lastTime = time;
        this.smoothDt = this.smoothDt * 0.75 + rawDt * 0.25;
        this.survivalElapsed += this.smoothDt;
        if (this.survivalElapsed >= 10) {
            this.survivalElapsed -= 10;
            this.level++;
            _audio.ArcadeAudio.play('levelup');
            (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
        }
        this.update(this.smoothDt);
        if (!this.isRunning || this.gameOver || this.isPaused) {
            this.animId = null;
            return;
        }
        this.updateEffects(this.smoothDt);
        var shaking = this.shakeTime > 0;
        if (shaking) {
            var s = this.shakeMag * (this.shakeTime / 0.18);
            this.ctx.save();
            this.ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
        }
        this.draw();
        this.drawEffects();
        if (shaking) this.ctx.restore();
        if (this.isRunning && !this.gameOver && !this.isPaused) {
            this.animId = requestAnimationFrame(function(t) {
                return _this.loop(t);
            });
        } else {
            this.animId = null;
        }
    };
    _proto.init = function init() {};
    _proto.update = function update(_dt) {};
    _proto.draw = function draw() {};
    _proto.gameOverSequence = function gameOverSequence(isVictory) {
        if (isVictory === void 0) isVictory = false;
        if (this.gameOver) return;
        this.gameOver = true;
        this.stop();
        (0, _runtimeBridge.triggerGameOver)(this.score, _storage.playerState.sessionCoins, this.level, this.gameIdx, isVictory);
    };
    _proto.getDynamicSkyColor = function getDynamicSkyColor() {
        if (this.level >= 50) return '#000000';
        if (this.level >= 30) return '#0d0d2b';
        if (this.level >= 20) return '#2b1055';
        if (this.level >= 10) return '#b33939';
        return '#87ceeb';
    };
    return BaseGame;
}();

});
// === MODULE: src/core/arcadeGlobal ===
ArcadeMod.define("src/core/arcadeGlobal", function(require, module, exports) {
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
    get getRegisteredGameFactory () {
        return getRegisteredGameFactory;
    },
    get installArcadeGlobal () {
        return installArcadeGlobal;
    },
    get registerArcadeGame () {
        return registerArcadeGame;
    }
});
var _audio = require("./audio");
var _BaseFPSGame = require("./BaseFPSGame");
var _BaseGame = require("./BaseGame");
var _emojiCache = require("./emojiCache");
var _instructions = require("./instructions");
var _runtimeBridge = require("./runtimeBridge");
var _storage = require("./storage");
var registeredFactories = new Map();
function registerArcadeGame(id, factory, meta) {
    registeredFactories.set(id, factory);
    if (meta && !_instructions.GAME_LIST.some(function(g) {
        return g.id === meta.id;
    })) {
        _instructions.GAME_LIST.push(meta);
    }
}
function getRegisteredGameFactory(id) {
    return registeredFactories.get(id);
}
function installArcadeGlobal() {
    var api = {
        version: '2.0-modular',
        BaseGame: _BaseGame.BaseGame,
        BaseFPSGame: _BaseFPSGame.BaseFPSGame,
        EmojiCache: _emojiCache.EmojiCache,
        Audio: _audio.ArcadeAudio,
        GAME_LIST: _instructions.GAME_LIST,
        registerGame: registerArcadeGame,
        getRegisteredGameFactory: getRegisteredGameFactory,
        getRegisteredGames: function getRegisteredGames() {
            return Array.from(registeredFactories.keys()).sort(function(a, b) {
                return a - b;
            });
        },
        getState: function getState() {
            return _storage.playerState;
        },
        getCoins: function getCoins() {
            return _storage.playerState.totalCoins;
        },
        setCoins: function setCoins(coins) {
            _storage.playerState.totalCoins = Math.max(0, Math.floor(coins));
            _storage.tryStorage.setItem('tsepang_coins', String(_storage.playerState.totalCoins));
            (0, _runtimeBridge.updateCoinsDisplay)();
        },
        awardBonusCoins: _runtimeBridge.awardBonusCoins,
        spendCoins: _runtimeBridge.spendCoins,
        addXp: _runtimeBridge.addXp,
        storage: _storage.tryStorage
    };
    if (typeof window !== 'undefined') {
        window.Arcade = api;
        var w = window;
        if (!w.ARCADE_BUILD_VERSION) {
            w.ARCADE_BUILD_VERSION = 'Tsepang Arcade · Live Modular v1.0 (rev ?v=1 · Offline Ready)';
        }
    }
    return api;
}

});
// === MODULE: src/core/arenaRoster ===
ArcadeMod.define("src/core/arenaRoster", function(require, module, exports) {
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
    get ALL_MOBA_SHOP_ITEMS () {
        return _mobaEquipmentCatalog.ALL_MOBA_SHOP_ITEMS;
    },
    get ALL_MOBA_TALENTS () {
        return _mobaSystemsCatalog.ALL_MOBA_TALENTS;
    },
    get ASPHALT_CARS () {
        return ASPHALT_CARS;
    },
    get ASPHALT_MAPS () {
        return ASPHALT_MAPS;
    },
    get BASKETBALL_TEAMS () {
        return BASKETBALL_TEAMS;
    },
    get BR_WEAPONS () {
        return BR_WEAPONS;
    },
    get CYCLONE_EYE_SPECS () {
        return _mobaBattlefield.CYCLONE_EYE_SPECS;
    },
    get DEFAULT_EMBLEM_TALENTS () {
        return _mobaSystemsCatalog.DEFAULT_EMBLEM_TALENTS;
    },
    get DEFAULT_MOBA_SETTINGS () {
        return _mobaSystemsCatalog.DEFAULT_MOBA_SETTINGS;
    },
    get DEFAULT_STARTER_EMOTE_IDS () {
        return _mobaSystemsCatalog.DEFAULT_STARTER_EMOTE_IDS;
    },
    get FLYING_CLOUD_BLUE_SPOT () {
        return _mobaBattlefield.FLYING_CLOUD_BLUE_SPOT;
    },
    get HOOPS_MODES () {
        return HOOPS_MODES;
    },
    get LITHO_LOWER_SPOT () {
        return _mobaBattlefield.LITHO_LOWER_SPOT;
    },
    get LITHO_UPPER_SPOT () {
        return _mobaBattlefield.LITHO_UPPER_SPOT;
    },
    get LOWER_RIVER_PIT () {
        return _mobaBattlefield.LOWER_RIVER_PIT;
    },
    get MLBB_TIMERS () {
        return _mobaBattlefield.MLBB_TIMERS;
    },
    get MOBA_ACHIEVEMENTS () {
        return _mobaSystemsCatalog.MOBA_ACHIEVEMENTS;
    },
    get MOBA_BASIC_ITEMS () {
        return _mobaEquipmentCatalog.MOBA_BASIC_ITEMS;
    },
    get MOBA_BOOT_BLESSINGS () {
        return _mobaEquipmentCatalog.MOBA_BOOT_BLESSINGS;
    },
    get MOBA_COLLECTOR_TIERS () {
        return _mobaSystemsCatalog.MOBA_COLLECTOR_TIERS;
    },
    get MOBA_DAILY_MISSIONS () {
        return _mobaHeroCatalog.MOBA_DAILY_MISSIONS;
    },
    get MOBA_ELEMENT_PALETTES () {
        return _mobaHeroCatalog.MOBA_ELEMENT_PALETTES;
    },
    get MOBA_ELIM_EFFECTS () {
        return _mobaSystemsCatalog.MOBA_ELIM_EFFECTS;
    },
    get MOBA_EMBLEMS () {
        return _mobaHeroCatalog.MOBA_EMBLEMS;
    },
    get MOBA_EMOTES () {
        return _mobaSystemsCatalog.MOBA_EMOTES;
    },
    get MOBA_EQUIPMENT_ITEMS () {
        return _mobaEquipmentCatalog.MOBA_EQUIPMENT_ITEMS;
    },
    get MOBA_HEROES () {
        return _mobaHeroCatalog.MOBA_HEROES;
    },
    get MOBA_INTERMEDIATE_ITEMS () {
        return _mobaEquipmentCatalog.MOBA_INTERMEDIATE_ITEMS;
    },
    get MOBA_ITEM_RECIPES () {
        return _mobaEquipmentCatalog.MOBA_ITEM_RECIPES;
    },
    get MOBA_LUCKY_SPIN_POOL () {
        return _mobaSystemsCatalog.MOBA_LUCKY_SPIN_POOL;
    },
    get MOBA_MAP_VARIANTS () {
        return _mobaBattlefield.MOBA_MAP_VARIANTS;
    },
    get MOBA_MODES () {
        return _mobaHeroCatalog.MOBA_MODES;
    },
    get MOBA_QUESTS () {
        return _mobaHeroCatalog.MOBA_QUESTS;
    },
    get MOBA_RANKS () {
        return _mobaHeroCatalog.MOBA_RANKS;
    },
    get MOBA_RECALL_EFFECTS () {
        return _mobaSystemsCatalog.MOBA_RECALL_EFFECTS;
    },
    get MOBA_ROLES () {
        return _mobaHeroCatalog.MOBA_ROLES;
    },
    get MOBA_SKIN_VARIANTS () {
        return _mobaSystemsCatalog.MOBA_SKIN_VARIANTS;
    },
    get MOBA_SPELLS () {
        return MOBA_SPELLS;
    },
    get MOBA_STARLIGHT_TRACK () {
        return _mobaSystemsCatalog.MOBA_STARLIGHT_TRACK;
    },
    get MOBA_TALENTS_T1 () {
        return _mobaSystemsCatalog.MOBA_TALENTS_T1;
    },
    get MOBA_TALENTS_T2 () {
        return _mobaSystemsCatalog.MOBA_TALENTS_T2;
    },
    get MOBA_TALENTS_T3 () {
        return _mobaSystemsCatalog.MOBA_TALENTS_T3;
    },
    get NARUTO_FACTIONS () {
        return _narutoCatalog.NARUTO_FACTIONS;
    },
    get NARUTO_MODES () {
        return _narutoCatalog.NARUTO_MODES;
    },
    get NARUTO_SHINOBI_ROSTER () {
        return _narutoCatalog.NARUTO_SHINOBI_ROSTER;
    },
    get NARUTO_STAGES () {
        return _narutoCatalog.NARUTO_STAGES;
    },
    get ROLE_BUILD_PRESETS () {
        return _mobaEquipmentCatalog.ROLE_BUILD_PRESETS;
    },
    get ROLE_RECOMMENDED_BUILDS () {
        return _mobaEquipmentCatalog.ROLE_RECOMMENDED_BUILDS;
    },
    get SENKI_RAMEN_ITEMS () {
        return _narutoCatalog.SENKI_RAMEN_ITEMS;
    },
    get STORM_NINJA_TOOLS () {
        return _narutoCatalog.STORM_NINJA_TOOLS;
    },
    get STORM_SUPPORT_TYPE_DEFS () {
        return _narutoCatalog.STORM_SUPPORT_TYPE_DEFS;
    },
    get UPPER_RIVER_PIT () {
        return _mobaBattlefield.UPPER_RIVER_PIT;
    },
    get advanceTournamentBracket () {
        return advanceTournamentBracket;
    },
    get applyCraftedPurchase () {
        return _mobaEquipmentCatalog.applyCraftedPurchase;
    },
    get canRespawnNextTurtle () {
        return _mobaBattlefield.canRespawnNextTurtle;
    },
    get computeCollectorTier () {
        return _mobaSystemsCatalog.computeCollectorTier;
    },
    get computeEffectiveItemCost () {
        return _mobaEquipmentCatalog.computeEffectiveItemCost;
    },
    get computeEvolvedLordNeutralDr () {
        return _mobaBattlefield.computeEvolvedLordNeutralDr;
    },
    get computeEvolvedLordSummonedDr () {
        return _mobaBattlefield.computeEvolvedLordSummonedDr;
    },
    get computeMobaEquippedStats () {
        return _mobaEquipmentCatalog.computeMobaEquippedStats;
    },
    get computeMobaLeaderboard () {
        return _mobaHeroCatalog.computeMobaLeaderboard;
    },
    get computeOrangeBuffPenetrationPct () {
        return _mobaBattlefield.computeOrangeBuffPenetrationPct;
    },
    get computeRetributionDamage () {
        return _mobaBattlefield.computeRetributionDamage;
    },
    get computeSellRefund () {
        return _mobaEquipmentCatalog.computeSellRefund;
    },
    get computeSenkiLevelStats () {
        return _narutoCatalog.computeSenkiLevelStats;
    },
    get computeStormComboProration () {
        return _narutoCatalog.computeStormComboProration;
    },
    get computeStormMaxUsableChakra () {
        return _narutoCatalog.computeStormMaxUsableChakra;
    },
    get computeTurtleRewards () {
        return _mobaBattlefield.computeTurtleRewards;
    },
    get computeUpgradedCarStats () {
        return computeUpgradedCarStats;
    },
    get createDynamicLaneAssignment () {
        return _mobaBattlefield.createDynamicLaneAssignment;
    },
    get createTournamentBracket () {
        return createTournamentBracket;
    },
    get defaultCarUpgrades () {
        return defaultCarUpgrades;
    },
    get detectCooldownReadySlots () {
        return _mobaHeroCatalog.detectCooldownReadySlots;
    },
    get equipEmoteToSlot () {
        return _mobaSystemsCatalog.equipEmoteToSlot;
    },
    get evaluateBattlefieldClock () {
        return _mobaBattlefield.evaluateBattlefieldClock;
    },
    get formatDailyCountdown () {
        return _mobaHeroCatalog.formatDailyCountdown;
    },
    get formatMatchClock () {
        return _mobaBattlefield.formatMatchClock;
    },
    get getCarUpgradeCost () {
        return getCarUpgradeCost;
    },
    get getEmblemUpgradeCost () {
        return _mobaHeroCatalog.getEmblemUpgradeCost;
    },
    get getHeroBaseElementTheme () {
        return _mobaHeroCatalog.getHeroBaseElementTheme;
    },
    get getHeroCombatKit () {
        return _mobaHeroCatalog.getHeroCombatKit;
    },
    get getHeroMasteryTitle () {
        return _mobaSystemsCatalog.getHeroMasteryTitle;
    },
    get getItemRecipe () {
        return _mobaEquipmentCatalog.getItemRecipe;
    },
    get getLocalDateKey () {
        return _mobaHeroCatalog.getLocalDateKey;
    },
    get getMapVariantDef () {
        return _mobaBattlefield.getMapVariantDef;
    },
    get getMillisUntilMidnight () {
        return _mobaHeroCatalog.getMillisUntilMidnight;
    },
    get getMobaBlessingById () {
        return _mobaEquipmentCatalog.getMobaBlessingById;
    },
    get getMobaDailyMissionValue () {
        return _mobaHeroCatalog.getMobaDailyMissionValue;
    },
    get getMobaEmblemBonus () {
        return _mobaHeroCatalog.getMobaEmblemBonus;
    },
    get getMobaEmoteById () {
        return _mobaSystemsCatalog.getMobaEmoteById;
    },
    get getMobaEquipmentById () {
        return _mobaEquipmentCatalog.getMobaEquipmentById;
    },
    get getMobaQuestValue () {
        return _mobaHeroCatalog.getMobaQuestValue;
    },
    get getMobaRankTitle () {
        return _mobaHeroCatalog.getMobaRankTitle;
    },
    get getNarutoShinobiById () {
        return _narutoCatalog.getNarutoShinobiById;
    },
    get getNextQuickBuyRecommendation () {
        return _mobaEquipmentCatalog.getNextQuickBuyRecommendation;
    },
    get getQuickBuyPair () {
        return _mobaEquipmentCatalog.getQuickBuyPair;
    },
    get getSkinVariantById () {
        return _mobaSystemsCatalog.getSkinVariantById;
    },
    get getTalentById () {
        return _mobaSystemsCatalog.getTalentById;
    },
    get normalizeEquippedEmotes () {
        return _mobaSystemsCatalog.normalizeEquippedEmotes;
    },
    get pickContextualAiEmote () {
        return _mobaSystemsCatalog.pickContextualAiEmote;
    },
    get resolveElementStatusEffect () {
        return _mobaHeroCatalog.resolveElementStatusEffect;
    },
    get resolveMatchMapVariant () {
        return _mobaBattlefield.resolveMatchMapVariant;
    },
    get resolveNarutoTeamSynergy () {
        return _narutoCatalog.resolveNarutoTeamSynergy;
    },
    get resolveSkillAimPoint () {
        return _mobaHeroCatalog.resolveSkillAimPoint;
    },
    get selectLordWeakestLane () {
        return _mobaBattlefield.selectLordWeakestLane;
    },
    get selectSenkiTowerTarget () {
        return _narutoCatalog.selectSenkiTowerTarget;
    },
    get shouldTurtleDissipate () {
        return _mobaBattlefield.shouldTurtleDissipate;
    },
    get stepHealthTrail () {
        return _mobaHeroCatalog.stepHealthTrail;
    },
    get stepSubstitutionGauge () {
        return _narutoCatalog.stepSubstitutionGauge;
    },
    get triggerHealthTrailDamage () {
        return _mobaHeroCatalog.triggerHealthTrailDamage;
    }
});
var _mobaHeroCatalog = require("../games/legends-arena/mobaHeroCatalog");
var _mobaSystemsCatalog = require("../games/legends-arena/mobaSystemsCatalog");
var _mobaEquipmentCatalog = require("../games/legends-arena/mobaEquipmentCatalog");
var _mobaBattlefield = require("../games/legends-arena/mobaBattlefield");
var _narutoCatalog = require("../games/naruto-senki-storm/narutoCatalog");
_export_star(require("../games/hoops-2k26/hoops2k26Catalog"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}
function _extends() {
    _extends = Object.assign || function assign(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source)if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
var MOBA_SPELLS = [
    {
        id: 'execute',
        name: 'Execute',
        icon: '💀',
        cooldownSec: 11,
        colorHex: '#f43f5e',
        colorNum: 0xf43f5e,
        summary: 'True Damage finisher (16% lost HP); -40% CD on kill'
    },
    {
        id: 'retribution',
        name: 'Retribution',
        icon: '🩸',
        cooldownSec: 10,
        colorHex: '#ef4444',
        colorNum: 0xef4444,
        summary: 'Massive True Damage smite to jungle, Turtle & Lord'
    },
    {
        id: 'inspire',
        name: 'Inspire',
        icon: '🔥',
        cooldownSec: 12,
        colorHex: '#f97316',
        colorNum: 0xf97316,
        summary: '+55% ATK Speed, armor pierce & lifesteal for 5s'
    },
    {
        id: 'sprint',
        name: 'Sprint',
        icon: '💨',
        cooldownSec: 12,
        colorHex: '#38bdf8',
        colorNum: 0x38bdf8,
        summary: '+50% Move Speed & Slow Immunity for 6s'
    },
    {
        id: 'revitalize',
        name: 'Revitalize',
        icon: '💚',
        cooldownSec: 14,
        colorHex: '#22c55e',
        colorNum: 0x22c55e,
        summary: 'Summons 5s Healing Spring restoring team HP & +25% heals'
    },
    {
        id: 'aegis',
        name: 'Aegis',
        icon: '🛡️',
        cooldownSec: 13,
        colorHex: '#fbbf24',
        colorNum: 0xfbbf24,
        summary: 'Grants heavy damage-absorbing Shield for 5s'
    },
    {
        id: 'petrify',
        name: 'Petrify',
        icon: '🪨',
        cooldownSec: 13,
        colorHex: '#a8a29e',
        colorNum: 0xa8a29e,
        summary: 'Deals Magic Damage & petrifies nearby foes (0.8s stun)'
    },
    {
        id: 'purify',
        name: 'Purify',
        icon: '✨',
        cooldownSec: 13,
        colorHex: '#e0f2fe',
        colorNum: 0xe0f2fe,
        summary: 'Cleanses all CC + 1.2s CC Immunity & +15% Move Speed'
    },
    {
        id: 'flameshot',
        name: 'Flameshot',
        icon: '☄️',
        cooldownSec: 11,
        colorHex: '#fb923c',
        colorNum: 0xfb923c,
        summary: 'Global fire bolt; knocks back close foes & scales with range'
    },
    {
        id: 'flicker',
        name: 'Flicker',
        icon: '⚡',
        cooldownSec: 10,
        colorHex: '#60a5fa',
        colorNum: 0x60a5fa,
        summary: 'Instant directional blink + bonus Hybrid Defense & haste'
    },
    {
        id: 'arrival',
        name: 'Arrival',
        icon: '🌀',
        cooldownSec: 15,
        colorHex: '#c084fc',
        colorNum: 0xc084fc,
        summary: 'Teleports to friendly turret/minion + 60% Move Speed burst'
    },
    {
        id: 'vengeance',
        name: 'Vengeance',
        icon: '⚜️',
        cooldownSec: 12,
        colorHex: '#facc15',
        colorNum: 0xfacc15,
        summary: '35% Damage Reduction + reflects 35% Magic Damage for 3.5s'
    }
];
var BR_WEAPONS = [
    {
        id: 'm416',
        slot: 1,
        name: 'M416 Rifle',
        shortName: 'M416',
        category: '5.56 AR',
        icon: '🔫',
        dmg: 28,
        fireCd: 0.12,
        magSize: 30,
        reloadSec: 1.15,
        pellets: 1,
        spread: 0.016,
        bulletSpeed: 74,
        rangeLife: 1.45,
        scopeFov: 36,
        accentHex: '#f59e0b'
    },
    {
        id: 'ump45',
        slot: 2,
        name: 'UMP45 SMG',
        shortName: 'UMP45',
        category: '.45 SMG',
        icon: '⚡',
        dmg: 21,
        fireCd: 0.08,
        magSize: 35,
        reloadSec: 0.95,
        pellets: 1,
        spread: 0.028,
        bulletSpeed: 64,
        rangeLife: 1.05,
        scopeFov: 44,
        accentHex: '#38bdf8'
    },
    {
        id: 'shotgun',
        slot: 3,
        name: 'S1897 Pump',
        shortName: 'S1897',
        category: '12G SG',
        icon: '💥',
        dmg: 19,
        fireCd: 0.56,
        magSize: 8,
        reloadSec: 1.3,
        pellets: 6,
        spread: 0.085,
        bulletSpeed: 56,
        rangeLife: 0.48,
        scopeFov: 48,
        accentHex: '#ef4444'
    },
    {
        id: 'awm',
        slot: 4,
        name: 'AWM Magnum',
        shortName: 'AWM',
        category: '4x Sniper',
        icon: '🔭',
        dmg: 96,
        fireCd: 0.85,
        magSize: 5,
        reloadSec: 1.45,
        pellets: 1,
        spread: 0.002,
        bulletSpeed: 118,
        rangeLife: 2.0,
        scopeFov: 22,
        accentHex: '#a855f7'
    }
];
var ASPHALT_CARS = [
    {
        id: 0,
        name: 'Viper GT',
        tagline: 'Starter All-Rounder',
        icon: '🏎️',
        unlockCost: 0,
        style: 'gt',
        paintColor: 0xef4444,
        stripeColor: 0xfacc15,
        accentHex: '#ef4444',
        topSpeed: 64,
        nitroSpeed: 88,
        nitroDrain: 27,
        driftCharge: 23,
        steerSpeed: 12.6,
        accelRate: 4.5,
        mass: 1.0,
        statSpeed: 3,
        statAccel: 3,
        statNitro: 3,
        statImpact: 3
    },
    {
        id: 1,
        name: 'Apex Hyperion',
        tagline: 'Top Velocity',
        icon: '⚡',
        unlockCost: 100,
        style: 'hyper',
        paintColor: 0x06b6d4,
        stripeColor: 0xffffff,
        accentHex: '#22d3ee',
        topSpeed: 69,
        nitroSpeed: 94,
        nitroDrain: 28,
        driftCharge: 21,
        steerSpeed: 12.2,
        accelRate: 4.7,
        mass: 0.92,
        statSpeed: 4,
        statAccel: 4,
        statNitro: 4,
        statImpact: 2
    },
    {
        id: 2,
        name: 'Titan V12',
        tagline: 'Heavy Rammer',
        icon: '🛡️',
        unlockCost: 160,
        style: 'heavy',
        paintColor: 0xf59e0b,
        stripeColor: 0x111827,
        accentHex: '#f59e0b',
        topSpeed: 63,
        nitroSpeed: 87,
        nitroDrain: 24,
        driftCharge: 22,
        steerSpeed: 11.8,
        accelRate: 4.4,
        mass: 1.5,
        statSpeed: 3,
        statAccel: 3,
        statNitro: 3,
        statImpact: 5
    },
    {
        id: 3,
        name: 'Phantom Drift',
        tagline: 'Drift & Nitro',
        icon: '🌀',
        unlockCost: 220,
        style: 'drift',
        paintColor: 0xa855f7,
        stripeColor: 0x84fab0,
        accentHex: '#c084fc',
        topSpeed: 66,
        nitroSpeed: 92,
        nitroDrain: 21,
        driftCharge: 34,
        steerSpeed: 14.8,
        accelRate: 5.0,
        mass: 1.05,
        statSpeed: 4,
        statAccel: 4,
        statNitro: 5,
        statImpact: 3
    },
    {
        id: 4,
        name: 'Solaris Spyder',
        tagline: 'Emerald Track Coupe',
        icon: 'Emerald',
        unlockCost: 300,
        style: 'gt',
        paintColor: 0x10b981,
        stripeColor: 0xfacc15,
        accentHex: '#34d399',
        topSpeed: 71,
        nitroSpeed: 96,
        nitroDrain: 23,
        driftCharge: 27,
        steerSpeed: 13.8,
        accelRate: 5.2,
        mass: 1.08,
        statSpeed: 4,
        statAccel: 5,
        statNitro: 4,
        statImpact: 3
    },
    {
        id: 5,
        name: 'Obsidian Venom',
        tagline: 'Stealth Interceptor',
        icon: '🦇',
        unlockCost: 420,
        style: 'hyper',
        paintColor: 0x1e293b,
        stripeColor: 0xf43f5e,
        accentHex: '#fb7185',
        topSpeed: 75,
        nitroSpeed: 102,
        nitroDrain: 24,
        driftCharge: 25,
        steerSpeed: 13.4,
        accelRate: 5.4,
        mass: 1.02,
        statSpeed: 5,
        statAccel: 5,
        statNitro: 4,
        statImpact: 3
    },
    {
        id: 6,
        name: 'Brawler GT-X',
        tagline: 'Armored Street Beast',
        icon: '🦏',
        unlockCost: 540,
        style: 'heavy',
        paintColor: 0x2563eb,
        stripeColor: 0xf97316,
        accentHex: '#60a5fa',
        topSpeed: 72,
        nitroSpeed: 98,
        nitroDrain: 21,
        driftCharge: 28,
        steerSpeed: 13.2,
        accelRate: 5.1,
        mass: 1.62,
        statSpeed: 4,
        statAccel: 4,
        statNitro: 5,
        statImpact: 5
    },
    {
        id: 7,
        name: 'Koenig Hypernova',
        tagline: 'S-Class Legend',
        icon: '👑',
        unlockCost: 700,
        style: 'hyper',
        paintColor: 0xe2e8f0,
        stripeColor: 0x06b6d4,
        accentHex: '#38bdf8',
        topSpeed: 78,
        nitroSpeed: 108,
        nitroDrain: 19,
        driftCharge: 32,
        steerSpeed: 15.2,
        accelRate: 5.8,
        mass: 1.18,
        statSpeed: 5,
        statAccel: 5,
        statNitro: 5,
        statImpact: 4
    }
];
ASPHALT_CARS[4].icon = '💚';
function defaultCarUpgrades() {
    return {
        speed: 1,
        accel: 1,
        nitro: 1,
        handling: 1
    };
}
function getCarUpgradeCost(currentLevel) {
    var lvl = Math.max(1, Math.min(5, Math.floor(currentLevel)));
    if (lvl >= 5) return 0;
    return 60 * lvl;
}
function computeUpgradedCarStats(car, upgrades) {
    var _ref, _ref1, _ref2, _ref3;
    var lv = {
        speed: Math.max(1, Math.min(5, (_ref = upgrades == null ? void 0 : upgrades.speed) != null ? _ref : 1)),
        accel: Math.max(1, Math.min(5, (_ref1 = upgrades == null ? void 0 : upgrades.accel) != null ? _ref1 : 1)),
        nitro: Math.max(1, Math.min(5, (_ref2 = upgrades == null ? void 0 : upgrades.nitro) != null ? _ref2 : 1)),
        handling: Math.max(1, Math.min(5, (_ref3 = upgrades == null ? void 0 : upgrades.handling) != null ? _ref3 : 1))
    };
    return {
        topSpeed: car.topSpeed + (lv.speed - 1) * 3.4,
        nitroSpeed: car.nitroSpeed + (lv.nitro - 1) * 4.2 + (lv.speed - 1) * 1.6,
        accelRate: car.accelRate + (lv.accel - 1) * 0.65,
        steerSpeed: car.steerSpeed + (lv.handling - 1) * 1.15,
        nitroDrain: Math.max(13, car.nitroDrain - (lv.nitro - 1) * 1.8),
        driftCharge: car.driftCharge + (lv.handling - 1) * 2.5,
        levels: lv
    };
}
var ASPHALT_MAPS = [
    {
        id: 0,
        slug: 'neon-city',
        name: 'Neon Metropolis',
        subtitle: 'Night Circuit · 3 Laps',
        icon: '🌃',
        missionKind: 'race',
        missionGoal: 'Finish Top 3 across 3 Laps',
        laps: 3,
        targetKOs: 0,
        targetGates: 0,
        timeLimitSec: 0,
        rewardCoins: 45,
        skyColor: 0x0f172a,
        fogColor: 0x1e1b4b,
        groundColor: 0x090d16,
        mesaColor: 0x1e293b,
        curbLeftHex: '#06b6d4',
        curbRightHex: '#f43f5e',
        accentHex: '#22d3ee'
    },
    {
        id: 1,
        slug: 'red-canyon',
        name: 'Red Canyon Gorge',
        subtitle: 'Takedown Hunt · 3 KOs',
        icon: '🏜️',
        missionKind: 'takedown',
        missionGoal: 'Knockdown 3 Rivals & Finish',
        laps: 2,
        targetKOs: 3,
        targetGates: 0,
        timeLimitSec: 0,
        rewardCoins: 65,
        skyColor: 0xc2410c,
        fogColor: 0xfb923c,
        groundColor: 0x7c2d12,
        mesaColor: 0x9a3412,
        curbLeftHex: '#facc15',
        curbRightHex: '#ef4444',
        accentHex: '#f97316'
    },
    {
        id: 2,
        slug: 'alpine-snow',
        name: 'Alpine Snow Pass',
        subtitle: 'Gate Rush · 10 Gates',
        icon: '🏔️',
        missionKind: 'gates',
        missionGoal: 'Smash 10 Speed Gates Before Time Expires',
        laps: 2,
        targetKOs: 0,
        targetGates: 10,
        timeLimitSec: 75,
        rewardCoins: 80,
        skyColor: 0x38bdf8,
        fogColor: 0xbae6fd,
        groundColor: 0xe2e8f0,
        mesaColor: 0x94a3b8,
        curbLeftHex: '#0284c7',
        curbRightHex: '#f8fafc',
        accentHex: '#38bdf8'
    },
    {
        id: 3,
        slug: 'volcanic-coast',
        name: 'Volcanic Coast',
        subtitle: 'Elimination · 2 Laps',
        icon: '🌋',
        missionKind: 'elimination',
        missionGoal: 'Hold Top 2 at Lap Cutoffs & Win',
        laps: 2,
        targetKOs: 0,
        targetGates: 0,
        timeLimitSec: 0,
        rewardCoins: 95,
        skyColor: 0x450a0a,
        fogColor: 0x991b1b,
        groundColor: 0x1c1917,
        mesaColor: 0x292524,
        curbLeftHex: '#f97316',
        curbRightHex: '#facc15',
        accentHex: '#fb7185'
    }
];
var BASKETBALL_TEAMS = [
    {
        id: 0,
        name: 'Boston Celtics',
        abbr: 'BOS',
        tagline: '5-Out 3PT Champions',
        icon: '🍀',
        jerseyColor: 0x007a33,
        trimColor: 0xfacc15,
        accentHex: '#4ade80',
        shootRating: 5,
        dunkRating: 4,
        speedRating: 4,
        defRating: 5
    },
    {
        id: 1,
        name: 'Los Angeles Lakers',
        abbr: 'LAL',
        tagline: 'Showtime Star Power',
        icon: '👑',
        jerseyColor: 0x552583,
        trimColor: 0xfdb927,
        accentHex: '#facc15',
        shootRating: 4,
        dunkRating: 5,
        speedRating: 4,
        defRating: 4
    },
    {
        id: 2,
        name: 'Golden State Warriors',
        abbr: 'GSW',
        tagline: 'Splash Motion Offense',
        icon: '🌉',
        jerseyColor: 0x1d428a,
        trimColor: 0xffc72c,
        accentHex: '#38bdf8',
        shootRating: 5,
        dunkRating: 4,
        speedRating: 5,
        defRating: 4
    },
    {
        id: 3,
        name: 'Denver Nuggets',
        abbr: 'DEN',
        tagline: 'Mile High Playmaking',
        icon: '⛰️',
        jerseyColor: 0x0e2240,
        trimColor: 0xfec524,
        accentHex: '#f59e0b',
        shootRating: 5,
        dunkRating: 4,
        speedRating: 4,
        defRating: 4
    }
];
var HOOPS_MODES = [
    {
        id: '2v2',
        name: '2v2 Streetball',
        badge: 'HALF-COURT',
        playersPerSide: 2,
        courtKind: 'blacktop',
        quarters: 1,
        quarterSec: 75,
        description: 'Outdoor Sunset Blacktop · Fast 2v2 duo clash'
    },
    {
        id: '3v3',
        name: '3v3 Blacktop',
        badge: 'PARK TRIPLES',
        playersPerSide: 3,
        courtKind: 'blacktop',
        quarters: 1,
        quarterSec: 90,
        description: 'Outdoor Park Triples · PG/SF/C street action'
    },
    {
        id: '5v5',
        name: '5v5 NBA Quick',
        badge: 'FULL COURT',
        playersPerSide: 5,
        courtKind: 'arena',
        quarters: 4,
        quarterSec: 45,
        description: 'Indoor NBA Arena · 4 Quarters full simulation'
    },
    {
        id: 'tournament',
        name: 'NBA Playoffs',
        badge: '3-ROUND CUP',
        playersPerSide: 5,
        courtKind: 'arena',
        quarters: 4,
        quarterSec: 40,
        description: 'QF → Semifinals → Finals · +150🪙 Championship Jackpot'
    }
];
function createTournamentBracket(teamId) {
    var safeId = (teamId % BASKETBALL_TEAMS.length + BASKETBALL_TEAMS.length) % BASKETBALL_TEAMS.length;
    var opps = [];
    for(var i = 1; i <= 3; i++){
        opps.push((safeId + i) % BASKETBALL_TEAMS.length);
    }
    return {
        teamId: safeId,
        round: 1,
        opponents: [
            opps[0],
            opps[1],
            opps[2]
        ],
        champion: false
    };
}
function advanceTournamentBracket(state, won) {
    if (!won) {
        return {
            nextState: createTournamentBracket(state.teamId),
            wonChampionship: false,
            bonusCoins: 0
        };
    }
    if (state.round >= 3) {
        return {
            nextState: _extends({}, state, {
                round: 3,
                champion: true
            }),
            wonChampionship: true,
            bonusCoins: 150
        };
    }
    return {
        nextState: _extends({}, state, {
            round: state.round + 1,
            champion: false
        }),
        wonChampionship: false,
        bonusCoins: 40
    };
}

});
// === MODULE: src/core/audio ===
ArcadeMod.define("src/core/audio", function(require, module, exports) {
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
    get ArcadeAudio () {
        return ArcadeAudio;
    },
    get SFX_PACKS () {
        return SFX_PACKS;
    },
    get isValidSfxPack () {
        return isValidSfxPack;
    }
});
var _storage = require("./storage");
var SFX_PACKS = [
    {
        id: 'classic',
        name: 'Arcade Classic',
        icon: '🕹️',
        desc: 'Balanced arcade synth'
    },
    {
        id: 'realistic',
        name: 'Realistic',
        icon: '🔊',
        desc: 'Punchy acoustic & noise bursts'
    },
    {
        id: 'retro',
        name: 'Retro Synth',
        icon: '👾',
        desc: '8-bit chiptune square waves'
    }
];
function isValidSfxPack(val) {
    return val === 'classic' || val === 'realistic' || val === 'retro';
}
var THEME_PATTERNS = {
    arcade: {
        ms: 175,
        wave: 'triangle',
        melody: [
            523,
            0,
            659,
            784,
            659,
            0,
            587,
            523,
            440,
            0,
            523,
            659,
            587,
            0,
            494,
            440
        ],
        bass: [
            131,
            131,
            165,
            165,
            147,
            147,
            131,
            131,
            110,
            110,
            131,
            131,
            147,
            147,
            123,
            110
        ]
    },
    action: {
        ms: 150,
        wave: 'square',
        melody: [
            330,
            0,
            392,
            440,
            392,
            330,
            494,
            0,
            440,
            0,
            392,
            330,
            294,
            330,
            392,
            0
        ],
        bass: [
            110,
            110,
            110,
            165,
            110,
            110,
            131,
            147,
            110,
            110,
            110,
            165,
            98,
            98,
            123,
            131
        ]
    },
    tactical: {
        ms: 145,
        wave: 'sawtooth',
        melody: [
            220,
            0,
            262,
            330,
            294,
            0,
            262,
            247,
            220,
            0,
            330,
            392,
            349,
            0,
            330,
            294
        ],
        bass: [
            82,
            82,
            98,
            110,
            82,
            82,
            110,
            98,
            82,
            82,
            98,
            110,
            73,
            82,
            98,
            82
        ]
    },
    war: {
        ms: 165,
        wave: 'sawtooth',
        melody: [
            294,
            294,
            349,
            440,
            0,
            392,
            349,
            330,
            294,
            0,
            440,
            523,
            494,
            440,
            392,
            0
        ],
        bass: [
            98,
            98,
            110,
            147,
            98,
            98,
            131,
            147,
            98,
            98,
            110,
            147,
            110,
            131,
            147,
            110
        ]
    },
    puzzle: {
        ms: 210,
        wave: 'sine',
        melody: [
            523,
            659,
            784,
            0,
            698,
            659,
            587,
            0,
            523,
            587,
            659,
            784,
            880,
            0,
            784,
            0
        ],
        bass: [
            131,
            0,
            196,
            0,
            175,
            0,
            147,
            0,
            131,
            0,
            165,
            0,
            175,
            0,
            196,
            0
        ]
    },
    chill: {
        ms: 260,
        wave: 'sine',
        melody: [
            440,
            0,
            523,
            0,
            659,
            0,
            587,
            0,
            392,
            0,
            494,
            0,
            587,
            0,
            523,
            0
        ],
        bass: [
            110,
            0,
            0,
            165,
            147,
            0,
            0,
            110,
            98,
            0,
            0,
            147,
            131,
            0,
            0,
            110
        ]
    },
    garden: {
        ms: 225,
        wave: 'sine',
        melody: [
            392,
            494,
            587,
            0,
            659,
            587,
            494,
            0,
            440,
            523,
            587,
            0,
            494,
            440,
            392,
            0
        ],
        bass: [
            98,
            0,
            147,
            0,
            131,
            0,
            147,
            0,
            110,
            0,
            147,
            0,
            123,
            0,
            98,
            0
        ]
    }
};
function loadInitialSfxPack() {
    var saved = _storage.tryStorage.getItem('tsepang_sfx_pack');
    return isValidSfxPack(saved) ? saved : 'classic';
}
var ArcadeAudioEngine = /*#__PURE__*/ function() {
    "use strict";
    function ArcadeAudioEngine() {
        this.ctx = null;
        this.noiseBuffer = null;
        this.sfxEnabled = _storage.tryStorage.getItem('tsepang_sfx') !== '0';
        this.bgmEnabled = _storage.tryStorage.getItem('tsepang_bgm') !== '0';
        this.sfxPack = loadInitialSfxPack();
        this.bgmTimer = null;
        this.bgmStep = 0;
        this.currentTheme = null;
        this.paused = false;
        this.masterVolume = function() {
            var raw = parseFloat(_storage.tryStorage.getItem('tsepang_master_vol') || '0.8');
            return Number.isFinite(raw) ? Math.max(0, Math.min(1, raw)) : 0.8;
        }();
        this.bgmAudio = typeof Audio !== 'undefined' ? new Audio() : null;
        this.coinAudio = typeof Audio !== 'undefined' ? new Audio() : null;
        this.clickAudio = typeof Audio !== 'undefined' ? new Audio() : null;
        this.onToggleSync = null;
        this.lastPlayedAt = new Map();
        if (this.bgmAudio) this.bgmAudio.volume = this.masterVolume;
        if (this.coinAudio) this.coinAudio.volume = this.masterVolume;
        if (this.clickAudio) this.clickAudio.volume = this.masterVolume;
    }
    var _proto = ArcadeAudioEngine.prototype;
    _proto.setToggleSync = function setToggleSync(cb) {
        this.onToggleSync = cb;
    };
    _proto.getSfxPack = function getSfxPack() {
        return this.sfxPack;
    };
    _proto.setSfxPack = function setSfxPack(pack, preview) {
        if (preview === void 0) preview = true;
        if (!isValidSfxPack(pack)) return;
        this.sfxPack = pack;
        _storage.tryStorage.setItem('tsepang_sfx_pack', pack);
        if (preview && this.sfxEnabled) {
            this.play('coin');
        }
        this.onToggleSync == null ? void 0 : this.onToggleSync.call(this);
    };
    _proto.setVolume = function setVolume(vol) {
        this.masterVolume = Math.max(0, Math.min(1, vol));
        _storage.tryStorage.setItem('tsepang_master_vol', String(this.masterVolume));
        if (this.bgmAudio) this.bgmAudio.volume = this.masterVolume;
        if (this.coinAudio) this.coinAudio.volume = this.masterVolume;
        if (this.clickAudio) this.clickAudio.volume = this.masterVolume;
    };
    _proto.ensureCtx = function ensureCtx() {
        if (typeof window === 'undefined') return null;
        var Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return null;
        if (!this.ctx) this.ctx = new Ctor();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(function() {});
        }
        return this.ctx;
    };
    _proto.ensureNoiseBuffer = function ensureNoiseBuffer(ac) {
        if (this.noiseBuffer && this.noiseBuffer.sampleRate === ac.sampleRate) {
            return this.noiseBuffer;
        }
        var len = Math.floor(ac.sampleRate * 0.6);
        var buf = ac.createBuffer(1, len, ac.sampleRate);
        var data = buf.getChannelData(0);
        for(var i = 0; i < len; i++){
            data[i] = Math.random() * 2 - 1;
        }
        this.noiseBuffer = buf;
        return buf;
    };
    _proto.noiseBurst = function noiseBurst(dur, filterFreq, filterType, q, gainPeak, delay) {
        if (dur === void 0) dur = 0.08;
        if (filterFreq === void 0) filterFreq = 1400;
        if (filterType === void 0) filterType = 'bandpass';
        if (q === void 0) q = 1.4;
        if (gainPeak === void 0) gainPeak = 0.14;
        if (delay === void 0) delay = 0;
        if (!this.sfxEnabled || this.masterVolume <= 0.01) return;
        try {
            var ac = this.ensureCtx();
            if (!ac) return;
            var t0 = ac.currentTime + delay;
            var src = ac.createBufferSource();
            src.buffer = this.ensureNoiseBuffer(ac);
            var filter = ac.createBiquadFilter();
            filter.type = filterType;
            filter.frequency.setValueAtTime(Math.max(40, filterFreq), t0);
            filter.Q.setValueAtTime(Math.max(0.2, q), t0);
            var g = ac.createGain();
            var amp = Math.max(0.001, gainPeak * this.masterVolume);
            g.gain.setValueAtTime(amp, t0);
            g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
            src.connect(filter);
            filter.connect(g);
            g.connect(ac.destination);
            src.start(t0);
            src.stop(t0 + dur + 0.02);
        } catch (unused) {
        // ignore WebAudio lock before gesture
        }
    };
    _proto.note = function note(freq, dur, type, gainPeak, delay, slideTo) {
        if (dur === void 0) dur = 0.1;
        if (type === void 0) type = 'triangle';
        if (gainPeak === void 0) gainPeak = 0.14;
        if (delay === void 0) delay = 0;
        if (slideTo === void 0) slideTo = null;
        if (!this.sfxEnabled || this.masterVolume <= 0.01) return;
        try {
            var ac = this.ensureCtx();
            if (!ac) return;
            var effType = type;
            var effFreq = freq;
            var effDur = dur;
            var effGain = gainPeak;
            var effSlide = slideTo;
            if (this.sfxPack === 'retro') {
                effType = type === 'sawtooth' ? 'sawtooth' : 'square';
                effFreq = freq * 1.06;
                effDur = Math.max(0.032, dur * 0.85);
                effGain = Math.min(0.14, gainPeak * 0.78);
                effSlide = slideTo ? slideTo * 1.08 : null;
            } else if (this.sfxPack === 'realistic') {
                effType = type === 'square' ? 'triangle' : type;
                effFreq = freq * 0.92;
                effDur = Math.max(0.04, dur * 1.08);
                effGain = gainPeak * 0.92;
                effSlide = slideTo ? slideTo * 0.92 : null;
            }
            var t0 = ac.currentTime + delay;
            var osc = ac.createOscillator();
            var g = ac.createGain();
            osc.type = effType;
            osc.frequency.setValueAtTime(Math.max(30, effFreq), t0);
            if (effSlide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, effSlide), t0 + effDur);
            var amp = Math.max(0.001, effGain * this.masterVolume);
            g.gain.setValueAtTime(amp, t0);
            g.gain.exponentialRampToValueAtTime(0.001, t0 + effDur);
            osc.connect(g);
            g.connect(ac.destination);
            osc.start(t0);
            osc.stop(t0 + effDur + 0.02);
        } catch (unused) {
        // ignore WebAudio lock before gesture
        }
    };
    _proto.bgmNote = function bgmNote(freq, dur, type, vol) {
        if (dur === void 0) dur = 0.18;
        if (type === void 0) type = 'triangle';
        if (vol === void 0) vol = 0.055;
        if (!this.bgmEnabled || this.paused || this.masterVolume <= 0.01 || !freq) return;
        if (typeof document !== 'undefined' && document.hidden) return;
        try {
            var ac = this.ensureCtx();
            if (!ac) return;
            var t0 = ac.currentTime;
            var osc = ac.createOscillator();
            var g = ac.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, t0);
            g.gain.setValueAtTime(0.001, t0);
            g.gain.linearRampToValueAtTime(vol * this.masterVolume, t0 + 0.015);
            g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
            osc.connect(g);
            g.connect(ac.destination);
            osc.start(t0);
            osc.stop(t0 + dur + 0.02);
        } catch (unused) {
        // ignore
        }
    };
    _proto.play = function play(kind) {
        var _this_clickAudio, _this_coinAudio;
        if (!this.sfxEnabled || this.masterVolume <= 0.01) return;
        if (kind === 'coin' || kind === 'hit' || kind === 'shoot' || kind === 'shot' || kind === 'cueHit' || kind === 'zombieHit' || kind === 'gas' || kind === 'jetpack' || kind === 'dribble') {
            var _this_lastPlayedAt_get;
            var now = typeof performance !== 'undefined' ? performance.now() : Date.now();
            var prev = (_this_lastPlayedAt_get = this.lastPlayedAt.get(kind)) != null ? _this_lastPlayedAt_get : -Infinity;
            if (now - prev < 38) return;
            this.lastPlayedAt.set(kind, now);
        }
        if (kind === 'click' && ((_this_clickAudio = this.clickAudio) == null ? void 0 : _this_clickAudio.src)) {
            this.clickAudio.currentTime = 0;
            this.clickAudio.play().catch(function() {});
            return;
        }
        if (kind === 'coin' && ((_this_coinAudio = this.coinAudio) == null ? void 0 : _this_coinAudio.src)) {
            this.coinAudio.currentTime = 0;
            this.coinAudio.play().catch(function() {});
            return;
        }
        if (this.sfxPack === 'realistic') {
            switch(kind){
                case 'click':
                    this.noiseBurst(0.025, 2200, 'highpass', 1.2, 0.09);
                    this.note(420, 0.03, 'sine', 0.06, 0, 220);
                    return;
                case 'coin':
                    this.note(1174, 0.09, 'sine', 0.13, 0);
                    this.note(1760, 0.22, 'sine', 0.11, 0.045);
                    this.note(3520, 0.16, 'sine', 0.04, 0.05);
                    return;
                case 'shot':
                    this.noiseBurst(0.09, 1650, 'bandpass', 0.9, 0.22);
                    this.note(140, 0.08, 'sine', 0.18, 0, 42);
                    return;
                case 'sniper':
                    this.noiseBurst(0.18, 1200, 'lowpass', 0.7, 0.26);
                    this.note(165, 0.16, 'triangle', 0.22, 0, 38);
                    return;
                case 'explosion':
                    this.noiseBurst(0.36, 460, 'lowpass', 0.8, 0.28);
                    this.note(92, 0.3, 'sine', 0.24, 0, 30);
                    return;
                case 'sword':
                case 'slash':
                    this.noiseBurst(0.095, 3100, 'bandpass', 1.8, 0.16);
                    this.note(520, 0.06, 'triangle', 0.09, 0, 210);
                    return;
                case 'punch':
                case 'ko':
                    this.noiseBurst(0.08, 550, 'lowpass', 1.0, 0.18);
                    this.note(115, 0.12, 'sine', 0.22, 0, 42);
                    return;
                case 'arrow':
                case 'slingshot':
                    this.noiseBurst(0.06, 2600, 'bandpass', 2.2, 0.11);
                    this.note(360, 0.07, 'triangle', 0.09, 0, 190);
                    return;
                case 'swish':
                    this.noiseBurst(0.12, 3400, 'bandpass', 1.1, 0.14);
                    this.note(880, 0.09, 'sine', 0.09, 0.03, 1320);
                    return;
                case 'rimClank':
                    this.noiseBurst(0.05, 1900, 'bandpass', 2.5, 0.12);
                    this.note(260, 0.12, 'triangle', 0.13, 0, 160);
                    return;
                case 'dribble':
                    this.noiseBurst(0.03, 420, 'lowpass', 1.2, 0.08);
                    this.note(110, 0.065, 'sine', 0.13, 0, 58);
                    return;
                case 'cueHit':
                    this.noiseBurst(0.028, 3800, 'highpass', 1.6, 0.12);
                    this.note(680, 0.04, 'sine', 0.12, 0, 310);
                    return;
                case 'break':
                    this.noiseBurst(0.14, 1500, 'highpass', 1.0, 0.18);
                    this.note(150, 0.1, 'triangle', 0.12, 0, 65);
                    return;
                case 'gas':
                case 'jetpack':
                    this.noiseBurst(0.075, 420, 'lowpass', 0.9, 0.08);
                    this.note(88, 0.06, 'triangle', 0.06, 0, 105);
                    return;
                case 'reload':
                    this.noiseBurst(0.035, 2400, 'bandpass', 2.0, 0.1);
                    this.note(320, 0.05, 'triangle', 0.08, 0.06, 480);
                    return;
                default:
                    break;
            }
        }
        switch(kind){
            case 'click':
                this.note(520, 0.045, 'triangle', 0.09, 0, 380);
                break;
            case 'coin':
                this.note(987.77, 0.065, 'sine', 0.13, 0);
                this.note(1318.51, 0.14, 'sine', 0.13, 0.055);
                if (this.sfxPack === 'retro') this.note(1975.5, 0.12, 'square', 0.08, 0.11);
                break;
            case 'jump':
                this.note(220, 0.12, 'triangle', 0.14, 0, 520);
                break;
            case 'flap':
                this.note(300, 0.075, 'sine', 0.12, 0, 490);
                break;
            case 'slide':
                this.note(360, 0.09, 'triangle', 0.1, 0, 150);
                break;
            case 'dash':
                this.note(420, 0.06, 'sine', 0.09, 0, 620);
                break;
            case 'slash':
                this.note(680, 0.08, 'sawtooth', 0.09, 0, 210);
                break;
            case 'match':
                this.note(587, 0.08, 'sine', 0.13, 0);
                this.note(880, 0.11, 'sine', 0.12, 0.05);
                break;
            case 'combo':
                this.note(523, 0.07, 'triangle', 0.12, 0);
                this.note(659, 0.07, 'triangle', 0.12, 0.05);
                this.note(1046, 0.14, 'sine', 0.14, 0.1);
                break;
            case 'place':
                this.note(260, 0.07, 'triangle', 0.14, 0, 180);
                break;
            case 'clear':
                this.note(523, 0.08, 'square', 0.08, 0);
                this.note(784, 0.16, 'triangle', 0.14, 0.07);
                break;
            case 'plant':
                this.note(392, 0.08, 'sine', 0.12, 0, 523);
                break;
            case 'shoot':
                this.note(540, 0.06, 'square', 0.07, 0, 260);
                break;
            case 'zombieHit':
                this.note(190, 0.08, 'sawtooth', 0.1, 0, 110);
                break;
            case 'slingshot':
                this.note(190, 0.14, 'triangle', 0.15, 0, 480);
                break;
            case 'break':
                this.note(180, 0.11, 'square', 0.11, 0, 75);
                break;
            case 'cook':
                this.note(720, 0.06, 'sine', 0.1, 0, 960);
                break;
            case 'serve':
                this.note(659, 0.07, 'sine', 0.13, 0);
                this.note(988, 0.13, 'sine', 0.14, 0.06);
                break;
            case 'chomp':
                this.note(240, 0.08, 'sawtooth', 0.13, 0, 120);
                break;
            case 'boost':
                this.note(320, 0.09, 'sawtooth', 0.08, 0, 640);
                break;
            case 'punch':
                this.note(165, 0.08, 'sawtooth', 0.15, 0, 62);
                break;
            case 'ko':
                this.note(220, 0.14, 'sawtooth', 0.16, 0, 55);
                this.note(440, 0.16, 'square', 0.1, 0.08, 880);
                break;
            case 'cueHit':
                this.note(780, 0.045, 'triangle', 0.14, 0, 320);
                break;
            case 'pocket':
                this.note(330, 0.08, 'sine', 0.14, 0);
                this.note(660, 0.12, 'sine', 0.12, 0.05);
                break;
            case 'chessMove':
                this.note(280, 0.055, 'triangle', 0.12, 0, 190);
                break;
            case 'chessCapture':
                this.note(360, 0.08, 'sawtooth', 0.11, 0, 140);
                break;
            case 'chessCheck':
                this.note(740, 0.09, 'sine', 0.14, 0);
                this.note(988, 0.12, 'sine', 0.12, 0.06);
                break;
            case 'key':
                this.note(600, 0.04, 'sine', 0.09, 0, 520);
                break;
            case 'sudokuOk':
                this.note(660, 0.055, 'sine', 0.11, 0, 880);
                break;
            case 'wordSolved':
                this.note(523, 0.07, 'sine', 0.12, 0);
                this.note(659, 0.07, 'sine', 0.12, 0.06);
                this.note(784, 0.14, 'sine', 0.13, 0.12);
                break;
            case 'gas':
                this.note(95, 0.06, 'sawtooth', 0.055, 0, 118);
                break;
            case 'hit':
                this.note(660, 0.07, 'sine', 0.13, 0, 880);
                break;
            case 'hurt':
                this.note(155, 0.18, 'sawtooth', 0.16, 0, 58);
                break;
            case 'shot':
                this.note(340, 0.09, 'triangle', 0.16, 0, 48);
                break;
            case 'sniper':
                this.note(240, 0.16, 'sawtooth', 0.18, 0, 45);
                break;
            case 'headshot':
                this.note(1120, 0.07, 'sine', 0.14, 0, 1680);
                break;
            case 'save':
                this.note(523, 0.08, 'sine', 0.12, 0);
                this.note(784, 0.12, 'sine', 0.12, 0.06);
                break;
            case 'reload':
                this.note(220, 0.055, 'square', 0.08, 0);
                this.note(420, 0.06, 'square', 0.08, 0.06);
                break;
            case 'jetpack':
                this.note(140, 0.06, 'sawtooth', 0.05, 0, 175);
                break;
            case 'explosion':
                this.note(135, 0.22, 'sawtooth', 0.18, 0, 38);
                this.note(90, 0.24, 'square', 0.12, 0.02, 32);
                break;
            case 'sword':
                this.note(620, 0.06, 'triangle', 0.11, 0, 260);
                break;
            case 'arrow':
                this.note(840, 0.05, 'sine', 0.08, 0, 420);
                break;
            case 'magic':
                this.note(480, 0.09, 'sine', 0.12, 0, 960);
                this.note(720, 0.12, 'triangle', 0.1, 0.05, 1180);
                break;
            case 'warHorn':
                this.note(196, 0.18, 'sawtooth', 0.13, 0, 262);
                this.note(294, 0.24, 'triangle', 0.13, 0.12, 392);
                break;
            case 'swish':
                this.note(880, 0.06, 'sine', 0.12, 0, 1320);
                this.note(1174, 0.12, 'triangle', 0.14, 0.05, 1760);
                break;
            case 'rimClank':
                this.note(210, 0.08, 'square', 0.11, 0, 125);
                this.note(145, 0.1, 'triangle', 0.12, 0.04, 92);
                break;
            case 'buzzer':
                this.note(110, 0.42, 'sawtooth', 0.16, 0, 102);
                this.note(138, 0.42, 'square', 0.1, 0, 130);
                break;
            case 'whistle':
                this.note(2450, 0.14, 'sine', 0.09, 0, 2680);
                this.note(2580, 0.12, 'sine', 0.08, 0.09, 2320);
                break;
            case 'dribble':
                this.note(135, 0.055, 'sine', 0.08, 0, 72);
                break;
            case 'levelup':
                this.note(523, 0.08, 'triangle', 0.13, 0);
                this.note(659, 0.08, 'triangle', 0.13, 0.07);
                this.note(784, 0.08, 'triangle', 0.13, 0.14);
                this.note(1046, 0.18, 'sine', 0.14, 0.21);
                break;
            case 'win':
                this.note(523, 0.09, 'triangle', 0.14, 0);
                this.note(659, 0.09, 'triangle', 0.14, 0.08);
                this.note(784, 0.09, 'triangle', 0.14, 0.16);
                this.note(1046, 0.28, 'sine', 0.16, 0.24);
                break;
            case 'gameover':
                this.note(330, 0.14, 'sawtooth', 0.13, 0, 260);
                this.note(260, 0.14, 'sawtooth', 0.13, 0.13, 196);
                this.note(196, 0.28, 'sawtooth', 0.13, 0.26, 110);
                break;
        }
    };
    _proto.startBgm = function startBgm(theme) {
        var _this = this;
        if (theme === void 0) theme = 'arcade';
        var _this_bgmAudio;
        this.currentTheme = theme;
        this.paused = false;
        if ((_this_bgmAudio = this.bgmAudio) == null ? void 0 : _this_bgmAudio.src) {
            if (this.bgmEnabled) {
                this.bgmAudio.loop = true;
                this.bgmAudio.volume = this.masterVolume;
                this.bgmAudio.play().catch(function() {});
            } else {
                this.bgmAudio.pause();
            }
            return;
        }
        this.stopTimer();
        if (!this.bgmEnabled) return;
        var cfg = THEME_PATTERNS[theme] || THEME_PATTERNS.arcade;
        this.bgmStep = 0;
        this.bgmTimer = setInterval(function() {
            if (!_this.bgmEnabled || _this.paused) return;
            var idx = _this.bgmStep % cfg.melody.length;
            var m = cfg.melody[idx];
            var b = cfg.bass[idx];
            if (m) _this.bgmNote(m, cfg.ms * 0.0011, cfg.wave, cfg.wave === 'square' || cfg.wave === 'sawtooth' ? 0.028 : 0.048);
            if (b) _this.bgmNote(b, cfg.ms * 0.0013, 'triangle', 0.052);
            _this.bgmStep++;
        }, cfg.ms);
    };
    _proto.stopTimer = function stopTimer() {
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    };
    _proto.stopBgm = function stopBgm() {
        this.stopTimer();
        this.currentTheme = null;
        this.lastPlayedAt.clear();
        try {
            if (this.bgmAudio) {
                this.bgmAudio.pause();
                this.bgmAudio.currentTime = 0;
            }
        } catch (unused) {
        // ignore
        }
    };
    _proto.syncPause = function syncPause(isPaused) {
        var _this_bgmAudio;
        this.paused = !!isPaused;
        if ((_this_bgmAudio = this.bgmAudio) == null ? void 0 : _this_bgmAudio.src) {
            if (this.paused || !this.bgmEnabled) this.bgmAudio.pause();
            else this.bgmAudio.play().catch(function() {});
        }
    };
    _proto.toggleBgm = function toggleBgm() {
        this.bgmEnabled = !this.bgmEnabled;
        _storage.tryStorage.setItem('tsepang_bgm', this.bgmEnabled ? '1' : '0');
        if (this.bgmEnabled) {
            this.ensureCtx();
            if (this.currentTheme) this.startBgm(this.currentTheme);
        } else {
            this.stopTimer();
            try {
                var _this_bgmAudio;
                (_this_bgmAudio = this.bgmAudio) == null ? void 0 : _this_bgmAudio.pause();
            } catch (unused) {
            // ignore
            }
        }
        this.onToggleSync == null ? void 0 : this.onToggleSync.call(this);
    };
    _proto.toggleSfx = function toggleSfx() {
        this.sfxEnabled = !this.sfxEnabled;
        _storage.tryStorage.setItem('tsepang_sfx', this.sfxEnabled ? '1' : '0');
        if (this.sfxEnabled) this.play('click');
        this.onToggleSync == null ? void 0 : this.onToggleSync.call(this);
    };
    return ArcadeAudioEngine;
}();
var ArcadeAudio = new ArcadeAudioEngine();

});
// === MODULE: src/core/catalog ===
ArcadeMod.define("src/core/catalog", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "characterCatalog", {
    enumerable: true,
    get: function() {
        return characterCatalog;
    }
});
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
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
function buildUniqueList(seeds, targetCount) {
    if (targetCount === void 0) targetCount = 180;
    var result = [];
    var seen = new Set();
    for(var _iterator = _create_for_of_iterator_helper_loose(seeds), _step; !(_step = _iterator()).done;){
        var item = _step.value;
        if (!seen.has(item)) {
            seen.add(item);
            result.push(item);
        }
    }
    var badges = [
        '',
        '✨',
        '⭐',
        '🔥',
        '👑',
        '💎',
        '🌟',
        '⚡',
        '🌈',
        '🍀'
    ];
    var idx = 0;
    while(result.length < targetCount){
        var base = seeds[idx % seeds.length];
        var badge = badges[Math.floor(idx / seeds.length) % badges.length];
        var label = badge ? "" + base + badge : base + "#" + idx;
        if (!seen.has(label)) {
            seen.add(label);
            result.push(label);
        }
        idx++;
    }
    return result;
}
var characterCatalog = {
    boy: buildUniqueList([
        '😀',
        '😎',
        '🤠',
        '🥳',
        '🤓',
        '🧐',
        '🤩',
        '😇',
        '🧑',
        '👦',
        '🧔',
        '👨',
        '🧑‍💻',
        '👨‍🚀',
        '🦸‍♂️',
        '🧙‍♂️',
        '🧝‍♂️',
        '🧛‍♂️',
        '🥷',
        '🤴',
        '👮‍♂️',
        '👷‍♂️',
        '💂‍♂️',
        '🕵️‍♂️',
        '👨‍⚕️',
        '👨‍🌾',
        '👨‍🍳',
        '👨‍🎓',
        '👨‍🎤',
        '👨‍🏫',
        '👨‍🏭',
        '👨‍💼',
        '👨‍🔧',
        '👨‍🔬',
        '👨‍🎨',
        '👨‍🚒',
        '👨‍✈️',
        '🧑‍⚖️',
        '🎅',
        '🤶',
        '🧟‍♂️',
        '🧞‍♂️',
        '🧜‍♂️',
        '🧚‍♂️',
        '🕺',
        '🏃‍♂️',
        '🚴‍♂️',
        '🏄‍♂️',
        '🧗‍♂️',
        '🏋️‍♂️',
        '🤸‍♂️',
        '⛹️‍♂️',
        '🤺',
        '🤾‍♂️',
        '🏌️‍♂️',
        '🏇',
        '🧘‍♂️',
        '🏂',
        '⛷️'
    ], 180),
    girl: buildUniqueList([
        '👧',
        '👩',
        '👱‍♀️',
        '👩‍🦰',
        '👩‍🦱',
        '👩‍🦳',
        '👩‍🦲',
        '👸',
        '👰‍♀️',
        '🦸‍♀️',
        '🦹‍♀️',
        '🧙‍♀️',
        '🧚‍♀️',
        '🧛‍♀️',
        '🧜‍♀️',
        '🧝‍♀️',
        '🧞‍♀️',
        '🧟‍♀️',
        '💃',
        '👩‍💻',
        '👩‍🚀',
        '👩‍⚕️',
        '👩‍🌾',
        '👩‍🍳',
        '👩‍🎓',
        '👩‍🎤',
        '👩‍🏫',
        '👩‍🏭',
        '👩‍💼',
        '👩‍🔧',
        '👩‍🔬',
        '👩‍🎨',
        '👩‍🚒',
        '👩‍✈️',
        '👩‍⚖️',
        '👮‍♀️',
        '👷‍♀️',
        '💂‍♀️',
        '🕵️‍♀️',
        '🏃‍♀️',
        '🚴‍♀️',
        '🏄‍♀️',
        '🧗‍♀️',
        '🏋️‍♀️',
        '🤸‍♀️',
        '⛹️‍♀️',
        '🤾‍♀️',
        '🏌️‍♀️',
        '🧘‍♀️',
        '💅',
        '🤳',
        '🌸',
        '🌺',
        '🌷',
        '🌹',
        '💐',
        '🦋',
        '🦄',
        '🎀',
        '👑'
    ], 180),
    animals: buildUniqueList([
        '🦁',
        '🐯',
        '🐱',
        '🐶',
        '🐺',
        '🦊',
        '🦝',
        '🐻',
        '🐼',
        '🐨',
        '🐮',
        '🐷',
        '🐽',
        '🐗',
        '🐭',
        '🐹',
        '🐰',
        '🐻‍❄️',
        '🐸',
        '🐵',
        '🙈',
        '🙉',
        '🙊',
        '🐒',
        '🐔',
        '🐧',
        '🐦',
        '🐤',
        '🐣',
        '🐥',
        '🦆',
        '🦅',
        '🦉',
        '🦇',
        '🐴',
        '🦄',
        '🐝',
        '🐛',
        '🦋',
        '🐌',
        '🐞',
        '🐜',
        '🦟',
        '🦗',
        '🕷️',
        '🐢',
        '🐍',
        '🦎',
        '🦖',
        '🦕',
        '🐙',
        '🦑',
        '🦐',
        '🦞',
        '🦀',
        '🐡',
        '🐠',
        '🐟',
        '🐬',
        '🐳',
        '🐋',
        '🦈',
        '🐊',
        '🐅',
        '🐆',
        '🦓',
        '🦍',
        '🦧',
        '🦣',
        '🐘',
        '🦛',
        '🦏',
        '🐪',
        '🐫',
        '🦒',
        '🦘',
        '🦬',
        '🐃',
        '🐂',
        '🐄',
        '🐎',
        '🐖',
        '🐏',
        '🐑',
        '🦙',
        '🐐',
        '🦌',
        '🐕',
        '🐩',
        '🦮',
        '🐕‍🦺',
        '🐈',
        '🐈‍⬛',
        '🐓',
        '🦃',
        '🦚',
        '🦜',
        '🦢',
        '🦩',
        '🕊️',
        '🐇',
        '🦨',
        '🦡',
        '🦫',
        '🦦',
        '🦥',
        '🐁',
        '🐀',
        '🐿️',
        '🦔'
    ], 180),
    foods: buildUniqueList([
        '🍎',
        '🍐',
        '🍊',
        '🍋',
        '🍌',
        '🍉',
        '🍇',
        '🍓',
        '🫐',
        '🍈',
        '🍒',
        '🍑',
        '🥭',
        '🍍',
        '🥥',
        '🥝',
        '🍅',
        '🍆',
        '🥑',
        '🥦',
        '🥬',
        '🥒',
        '🌶️',
        '🫑',
        '🌽',
        '🥕',
        '🫒',
        '🧄',
        '🧅',
        '🥔',
        '🍠',
        '🥐',
        '🥯',
        '🍞',
        '🥖',
        '🥨',
        '🧀',
        '🥚',
        '🍳',
        '🧈',
        '🥞',
        '🧇',
        '🥓',
        '🥩',
        '🍗',
        '🍖',
        '🦴',
        '🌭',
        '🍔',
        '🍟',
        '🍕',
        '🫓',
        '🥪',
        '🥙',
        '🧆',
        '🌮',
        '🌯',
        '🫔',
        '🥗',
        '🥘',
        '🫕',
        '🥫',
        '🍝',
        '🍜',
        '🍲',
        '🍛',
        '🍣',
        '🍱',
        '🥟',
        '🦪',
        '🍤',
        '🍙',
        '🍚',
        '🍘',
        '🍥',
        '🥠',
        '🥮',
        '🍢',
        '🍡',
        '🍧',
        '🍨',
        '🍦',
        '🥧',
        '🧁',
        '🍰',
        '🎂',
        '🍮',
        '🍭',
        '🍬',
        '🍫',
        '🍿',
        '🍩',
        '🍪',
        '🌰',
        '🥜',
        '🍯',
        '🥛',
        '☕',
        '🍵',
        '🧃',
        '🥤',
        '🧋',
        '🧊'
    ], 180),
    vehicles: buildUniqueList([
        '🏎️',
        '🚗',
        '🚕',
        '🚙',
        '🚌',
        '🚎',
        '🚓',
        '🚑',
        '🚒',
        '🚐',
        '🛻',
        '🚚',
        '🚛',
        '🚜',
        '🦯',
        '🦽',
        '🦼',
        '🛴',
        '🚲',
        '🛵',
        '🏍️',
        '🛺',
        '🚨',
        '🚔',
        '🚍',
        '🚘',
        '🚖',
        '🚡',
        '🚠',
        '🚟',
        '🚃',
        '🚋',
        '🚞',
        '🚝',
        '🚄',
        '🚅',
        '🚈',
        '🚂',
        '🚆',
        '🚇',
        '🚊',
        '🚉',
        '✈️',
        '🛫',
        '🛬',
        '🛩️',
        '💺',
        '🛰️',
        '🚀',
        '🛸',
        '🚁',
        '🛶',
        '⛵',
        '🚤',
        '🛥️',
        '🛳️',
        '⛴️',
        '🚢',
        '⚓',
        '⛽',
        '🚧',
        '🚦',
        '🚥',
        '🗺️',
        '🗿',
        '🗽',
        '🗼',
        '🏰',
        '🏯',
        '🏟️',
        '🎡',
        '🎢',
        '🎠',
        '⛲',
        '⛱️',
        '🏖️',
        '🏝️',
        '🏜️',
        '🌋',
        '⛰️',
        '🏔️',
        '🗻',
        '🏕️'
    ], 180),
    hearts: buildUniqueList([
        '💖',
        '❤️',
        '🧡',
        '💛',
        '💚',
        '💙',
        '💜',
        '🖤',
        '🤍',
        '🤎',
        '💔',
        '❤️‍🔥',
        '❤️‍🩹',
        '❣️',
        '💕',
        '💞',
        '💓',
        '💗',
        '💘',
        '💝',
        '💟',
        '☮️',
        '✝️',
        '☪️',
        '🕉️',
        '☸️',
        '✡️',
        '🔯',
        '🕎',
        '☯️',
        '☦️',
        '🛐',
        '⛎',
        '♈',
        '♉',
        '♊',
        '♋',
        '♌',
        '♍',
        '♎',
        '♏',
        '♐',
        '♑',
        '♒',
        '♓',
        '🆔',
        '⚛️',
        '🉑',
        '☢️',
        '☣️',
        '📴',
        '📳',
        '🈶',
        '🈚',
        '🈸',
        '🈺',
        '🈷️',
        '✴️',
        '🆚',
        '💮',
        '🉐',
        '㊙️',
        '㊗️',
        '🈴',
        '🈵',
        '🈹',
        '🈲',
        '🅰️',
        '🅱️',
        '🆎',
        '🆑',
        '🅾️',
        '🆘',
        '❌',
        '⭕',
        '🛑',
        '⛔',
        '📛',
        '🚫',
        '💯',
        '💢',
        '♨️',
        '🚷',
        '🚯',
        '🚳',
        '🚱',
        '🔞',
        '📵',
        '🚭',
        '❗',
        '❕',
        '❓',
        '❔',
        '‼️',
        '⁉️',
        '🔅',
        '🔆',
        '〽️',
        '⚠️',
        '🚸',
        '🔱',
        '⚜️',
        '🔰',
        '♻️',
        '✅',
        '🈯',
        '💹',
        '❇️',
        '✳️',
        '❎',
        '🌐',
        '💠',
        'Ⓜ️',
        '🌀',
        '💤',
        '🏧',
        '🚾',
        '♿',
        '🅿️',
        '🈳',
        '🈂️',
        '🛂',
        '🛃',
        '🛄',
        '🛅'
    ], 180)
};

});
// === MODULE: src/core/controlLayouts ===
ArcadeMod.define("src/core/controlLayouts", function(require, module, exports) {
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
    get GLOBAL_PRESET_BUTTONS () {
        return GLOBAL_PRESET_BUTTONS;
    },
    get addPresetButtonToLayout () {
        return addPresetButtonToLayout;
    },
    get applyControlModeToAllGames () {
        return applyControlModeToAllGames;
    },
    get clampControlPos () {
        return clampControlPos;
    },
    get getDefaultGameLayout () {
        return getDefaultGameLayout;
    },
    get getGlobalControlMode () {
        return getGlobalControlMode;
    },
    get loadGameLayout () {
        return loadGameLayout;
    },
    get removeExtraButtonFromLayout () {
        return removeExtraButtonFromLayout;
    },
    get resetGameLayout () {
        return resetGameLayout;
    },
    get saveGameLayout () {
        return saveGameLayout;
    },
    get setGlobalControlMode () {
        return setGlobalControlMode;
    }
});
var _storage = require("./storage");
function _extends() {
    _extends = Object.assign || function assign(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source)if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
var STORAGE_KEY = 'tsepang_ctrl_layouts_v1';
var GLOBAL_CONTROL_MODE_KEY = 'tsepang_global_control_mode';
var cachedGlobalControlMode = null;
function getGlobalControlMode() {
    if (cachedGlobalControlMode) return cachedGlobalControlMode;
    var saved = _storage.tryStorage.getItem(GLOBAL_CONTROL_MODE_KEY);
    cachedGlobalControlMode = saved === 'buttons' ? 'buttons' : 'analog';
    return cachedGlobalControlMode;
}
function setGlobalControlMode(mode, applyToAllGames) {
    if (applyToAllGames === void 0) applyToAllGames = false;
    var normalized = mode === 'buttons' ? 'buttons' : 'analog';
    cachedGlobalControlMode = normalized;
    _storage.tryStorage.setItem(GLOBAL_CONTROL_MODE_KEY, normalized);
    if (applyToAllGames) {
        applyControlModeToAllGames(normalized);
    }
    return normalized;
}
function applyControlModeToAllGames(mode) {
    var normalized = mode === 'buttons' ? 'buttons' : 'analog';
    var all = readAllLayouts();
    var keys = Object.keys(all);
    var mutated = false;
    for(var i = 0; i < keys.length; i++){
        var id = Number(keys[i]);
        var entry = all[id];
        if (entry) {
            all[id] = _extends({}, entry, {
                controlMode: normalized,
                controlModeExplicit: false
            });
            mutated = true;
        }
    }
    if (mutated) {
        writeAllLayouts(all);
    }
}
var GLOBAL_PRESET_BUTTONS = [
    {
        actionKey: 'action',
        label: 'ACTION',
        icon: '⚡',
        defaultX: 84,
        defaultY: 112
    },
    {
        actionKey: 'jump',
        label: 'JUMP',
        icon: '⬆️',
        defaultX: 88,
        defaultY: 190
    },
    {
        actionKey: 'left',
        label: 'LEFT',
        icon: '◀️',
        defaultX: 12,
        defaultY: 105,
        holdable: true
    },
    {
        actionKey: 'right',
        label: 'RIGHT',
        icon: '▶️',
        defaultX: 28,
        defaultY: 105,
        holdable: true
    },
    {
        actionKey: 'moveUp',
        label: 'UP/RUN',
        icon: '🔼',
        defaultX: 20,
        defaultY: 165,
        holdable: true
    },
    {
        actionKey: 'down',
        label: 'DOWN',
        icon: '🔽',
        defaultX: 20,
        defaultY: 42,
        holdable: true
    },
    {
        actionKey: 'attack',
        label: 'ATTACK',
        icon: '⚔️',
        defaultX: 84,
        defaultY: 105
    },
    {
        actionKey: 'fire',
        label: 'FIRE',
        icon: '🔫',
        defaultX: 85,
        defaultY: 115,
        holdable: true
    },
    {
        actionKey: 'scope',
        label: 'SCOPE',
        icon: '🔭',
        defaultX: 70,
        defaultY: 185
    },
    {
        actionKey: 'reload',
        label: 'RELOAD',
        icon: '🔄',
        defaultX: 70,
        defaultY: 96
    },
    {
        actionKey: 'grenade',
        label: 'BOMB',
        icon: '💣',
        defaultX: 88,
        defaultY: 196
    },
    {
        actionKey: 'boost',
        label: 'NITRO',
        icon: '🔥',
        defaultX: 86,
        defaultY: 118,
        holdable: true
    },
    {
        actionKey: 'drift',
        label: 'DRIFT',
        icon: '💨',
        defaultX: 72,
        defaultY: 42,
        holdable: true
    },
    {
        actionKey: 'skill1',
        label: 'SKILL 1',
        icon: '🗡️',
        defaultX: 78,
        defaultY: 38
    },
    {
        actionKey: 'skill2',
        label: 'SKILL 2',
        icon: '☄️',
        defaultX: 80,
        defaultY: 118
    },
    {
        actionKey: 'skill3',
        label: 'ULTI',
        icon: '🌟',
        defaultX: 90,
        defaultY: 186
    },
    {
        actionKey: 'skill4',
        label: 'SKILL 4',
        icon: '🌀',
        defaultX: 71,
        defaultY: 196
    },
    {
        actionKey: 'regen',
        label: 'REGEN',
        icon: '💚',
        defaultX: 66,
        defaultY: 28
    },
    {
        actionKey: 'recall',
        label: 'RECALL',
        icon: '🌀',
        defaultX: 56,
        defaultY: 28
    },
    {
        actionKey: 'heal',
        label: 'MEDKIT',
        icon: '🩹',
        defaultX: 72,
        defaultY: 46
    },
    {
        actionKey: 'spell1',
        label: 'RAGE',
        icon: '🎺',
        defaultX: 86,
        defaultY: 130
    },
    {
        actionKey: 'spell2',
        label: 'GOLD!',
        icon: '💰',
        defaultX: 86,
        defaultY: 196
    },
    {
        actionKey: 'hint',
        label: 'HINT',
        icon: '💡',
        defaultX: 86,
        defaultY: 112
    },
    {
        actionKey: 'pass',
        label: 'PASS',
        icon: '🏀',
        defaultX: 74,
        defaultY: 184
    },
    {
        actionKey: 'steal',
        label: 'STEAL',
        icon: '🖐️',
        defaultX: 72,
        defaultY: 102
    },
    {
        actionKey: 'sprint',
        label: 'SPRINT',
        icon: '⚡',
        defaultX: 88,
        defaultY: 202,
        holdable: true
    },
    {
        actionKey: 'vehicle',
        label: 'CAR',
        icon: '🚗',
        defaultX: 60,
        defaultY: 112
    },
    {
        actionKey: 'swapWeapon',
        label: 'GUN',
        icon: '🔁',
        defaultX: 60,
        defaultY: 180
    },
    {
        actionKey: 'flare',
        label: 'FLARE',
        icon: '🚨',
        defaultX: 60,
        defaultY: 46
    },
    {
        actionKey: 'spell',
        label: 'SPELL',
        icon: '✨',
        defaultX: 68,
        defaultY: 108
    },
    {
        actionKey: 'itemActive',
        label: 'ITEM',
        icon: '👑',
        defaultX: 60,
        defaultY: 162
    },
    {
        actionKey: 'skill5',
        label: 'OUGI 2',
        icon: '🔥',
        defaultX: 82,
        defaultY: 248
    },
    {
        actionKey: 'sub',
        label: 'SUB LOG',
        icon: '🪵',
        defaultX: 68,
        defaultY: 108
    },
    {
        actionKey: 'chakra',
        label: 'CHAKRA',
        icon: '💙',
        defaultX: 66,
        defaultY: 28,
        holdable: true
    },
    {
        actionKey: 'guard',
        label: 'GUARD',
        icon: '🛡️',
        defaultX: 56,
        defaultY: 28,
        holdable: true
    },
    {
        actionKey: 'support',
        label: 'ASSIST',
        icon: '🤝',
        defaultX: 60,
        defaultY: 162
    }
];
function getDefaultGameLayout(gameId) {
    var defaultMode = getGlobalControlMode();
    var defaultAnalog = {
        xPct: 16,
        yPx: 32,
        scale: 1.0,
        visible: true
    };
    if (gameId === 7) {
        // Tactical Ops FPS: scope/reload plus tap-to-shoot on canvas
        return {
            controlMode: defaultMode,
            analog: defaultAnalog,
            action: {
                xPct: 86,
                yPx: 44,
                scale: 1.0,
                visible: true
            },
            jump: {
                xPct: 86,
                yPx: 112,
                scale: 0.9,
                visible: false
            },
            steerLeft: {
                xPct: 8,
                yPx: 30,
                scale: 1.0,
                visible: false
            },
            steerRight: {
                xPct: 92,
                yPx: 30,
                scale: 1.0,
                visible: false
            },
            extras: [
                {
                    id: 'fps_reload',
                    actionKey: 'reload',
                    label: 'RELOAD',
                    icon: '🔄',
                    xPct: 86,
                    yPx: 132,
                    scale: 0.92,
                    visible: true
                }
            ]
        };
    }
    if (gameId === 22) {
        // Mini Militia: dedicated left/right, fire, jetpack & grenade controls
        return {
            controlMode: defaultMode,
            analog: defaultAnalog,
            action: {
                xPct: 88,
                yPx: 118,
                scale: 0.98,
                visible: true
            },
            jump: {
                xPct: 73,
                yPx: 146,
                scale: 0.9,
                visible: true
            },
            steerLeft: {
                xPct: 10,
                yPx: 32,
                scale: 0.95,
                visible: true
            },
            steerRight: {
                xPct: 29,
                yPx: 32,
                scale: 0.95,
                visible: true
            },
            extras: [
                {
                    id: 'mm_fire',
                    actionKey: 'fire',
                    label: 'FIRE',
                    icon: '🔫',
                    xPct: 86,
                    yPx: 34,
                    scale: 1.04,
                    visible: true,
                    holdable: true
                }
            ]
        };
    }
    if (gameId === 24) {
        // Battle Royale 3D
        return {
            controlMode: defaultMode,
            analog: defaultAnalog,
            action: {
                xPct: 86,
                yPx: 112,
                scale: 1.05,
                visible: true
            },
            jump: {
                xPct: 88,
                yPx: 196,
                scale: 0.95,
                visible: true
            },
            steerLeft: {
                xPct: 11,
                yPx: 34,
                scale: 0.9,
                visible: true
            },
            steerRight: {
                xPct: 32,
                yPx: 34,
                scale: 0.9,
                visible: true
            },
            extras: [
                {
                    id: 'br_fwd',
                    actionKey: 'moveUp',
                    label: 'RUN',
                    icon: '⬆️',
                    xPct: 21,
                    yPx: 114,
                    scale: 0.95,
                    visible: true,
                    holdable: true
                },
                {
                    id: 'br_scope',
                    actionKey: 'scope',
                    label: 'SCOPE',
                    icon: '🔭',
                    xPct: 72,
                    yPx: 162,
                    scale: 0.9,
                    visible: true
                },
                {
                    id: 'br_reload',
                    actionKey: 'reload',
                    label: 'RELOAD',
                    icon: '🔄',
                    xPct: 72,
                    yPx: 76,
                    scale: 0.9,
                    visible: true
                },
                {
                    id: 'br_veh',
                    actionKey: 'vehicle',
                    label: 'BUGGY',
                    icon: '🚗',
                    xPct: 60,
                    yPx: 120,
                    scale: 0.86,
                    visible: true
                },
                {
                    id: 'br_swap',
                    actionKey: 'swapWeapon',
                    label: 'GUN',
                    icon: '🔁',
                    xPct: 60,
                    yPx: 194,
                    scale: 0.86,
                    visible: true
                }
            ]
        };
    }
    if (gameId === 25) {
        // Legends Arena 3D — Classic Mobile Legends Radial Arc
        return {
            controlMode: defaultMode,
            analog: defaultAnalog,
            action: {
                xPct: 89,
                yPx: 30,
                scale: 1.12,
                visible: true
            },
            jump: {
                xPct: 78,
                yPx: 38,
                scale: 0.94,
                visible: true
            },
            steerLeft: {
                xPct: 11,
                yPx: 34,
                scale: 0.92,
                visible: true
            },
            steerRight: {
                xPct: 32,
                yPx: 34,
                scale: 0.92,
                visible: true
            },
            extras: [
                {
                    id: 'ml_s2',
                    actionKey: 'skill2',
                    label: 'SKILL 2',
                    icon: '☄️',
                    xPct: 80,
                    yPx: 118,
                    scale: 0.94,
                    visible: true
                },
                {
                    id: 'ml_ult',
                    actionKey: 'skill3',
                    label: 'ULTI',
                    icon: '🌟',
                    xPct: 90,
                    yPx: 186,
                    scale: 1.0,
                    visible: true
                },
                {
                    id: 'ml_s4',
                    actionKey: 'skill4',
                    label: 'SKILL 4',
                    icon: '🌀',
                    xPct: 71,
                    yPx: 196,
                    scale: 0.9,
                    visible: true
                },
                {
                    id: 'ml_spell',
                    actionKey: 'spell',
                    label: 'SPELL',
                    icon: '✨',
                    xPct: 68,
                    yPx: 108,
                    scale: 0.86,
                    visible: true
                },
                {
                    id: 'ml_item',
                    actionKey: 'itemActive',
                    label: 'ITEM',
                    icon: '👑',
                    xPct: 60,
                    yPx: 162,
                    scale: 0.86,
                    visible: true
                },
                {
                    id: 'ml_regen',
                    actionKey: 'regen',
                    label: 'REGEN',
                    icon: '💚',
                    xPct: 66,
                    yPx: 28,
                    scale: 0.82,
                    visible: true
                },
                {
                    id: 'ml_rec',
                    actionKey: 'recall',
                    label: 'RECALL',
                    icon: '🌀',
                    xPct: 56,
                    yPx: 28,
                    scale: 0.82,
                    visible: true
                }
            ]
        };
    }
    if (gameId === 26) {
        // Asphalt Nitro 3D
        return {
            controlMode: defaultMode,
            analog: defaultAnalog,
            action: {
                xPct: 84,
                yPx: 120,
                scale: 1.0,
                visible: true
            },
            jump: {
                xPct: 86,
                yPx: 200,
                scale: 0.95,
                visible: true
            },
            steerLeft: {
                xPct: 11,
                yPx: 34,
                scale: 1.0,
                visible: true
            },
            steerRight: {
                xPct: 89,
                yPx: 34,
                scale: 1.0,
                visible: true
            },
            extras: [
                {
                    id: 'an_drift',
                    actionKey: 'drift',
                    label: 'DRIFT',
                    icon: '💨',
                    xPct: 62,
                    yPx: 108,
                    scale: 0.92,
                    visible: true,
                    holdable: true
                }
            ]
        };
    }
    if (gameId === 27) {
        // Hoops 2K26 3D
        return {
            controlMode: defaultMode,
            analog: defaultAnalog,
            action: {
                xPct: 87,
                yPx: 102,
                scale: 1.02,
                visible: true
            },
            jump: {
                xPct: 73,
                yPx: 176,
                scale: 0.94,
                visible: true
            },
            steerLeft: {
                xPct: 9,
                yPx: 66,
                scale: 0.88,
                visible: true
            },
            steerRight: {
                xPct: 31,
                yPx: 66,
                scale: 0.88,
                visible: true
            },
            extras: [
                {
                    id: 'bk_up',
                    actionKey: 'moveUp',
                    label: 'UP',
                    icon: '🔼',
                    xPct: 20,
                    yPx: 132,
                    scale: 0.86,
                    visible: true,
                    holdable: true
                },
                {
                    id: 'bk_dn',
                    actionKey: 'down',
                    label: 'DOWN',
                    icon: '🔽',
                    xPct: 20,
                    yPx: 14,
                    scale: 0.86,
                    visible: true,
                    holdable: true
                },
                {
                    id: 'bk_steal',
                    actionKey: 'steal',
                    label: 'STEAL',
                    icon: '🖐️',
                    xPct: 68,
                    yPx: 88,
                    scale: 0.9,
                    visible: true
                },
                {
                    id: 'bk_sprint',
                    actionKey: 'sprint',
                    label: 'SPRINT',
                    icon: '⚡',
                    xPct: 88,
                    yPx: 196,
                    scale: 0.92,
                    visible: true,
                    holdable: true
                }
            ]
        };
    }
    if (gameId === 28) {
        // Naruto: Senki & Ultimate Ninja Storm — Shinobi Jutsu & Storm Arc
        return {
            controlMode: defaultMode,
            analog: defaultAnalog,
            action: {
                xPct: 89,
                yPx: 30,
                scale: 1.12,
                visible: true
            },
            jump: {
                xPct: 78,
                yPx: 38,
                scale: 0.94,
                visible: true
            },
            steerLeft: {
                xPct: 11,
                yPx: 34,
                scale: 0.92,
                visible: true
            },
            steerRight: {
                xPct: 32,
                yPx: 34,
                scale: 0.92,
                visible: true
            },
            extras: [
                {
                    id: 'ns_s2',
                    actionKey: 'skill2',
                    label: 'JUTSU 2',
                    icon: '🌀',
                    xPct: 80,
                    yPx: 108,
                    scale: 0.92,
                    visible: true
                },
                {
                    id: 'ns_s3',
                    actionKey: 'skill3',
                    label: 'JUTSU 3',
                    icon: '⚡',
                    xPct: 90,
                    yPx: 158,
                    scale: 0.92,
                    visible: true
                },
                {
                    id: 'ns_ougi1',
                    actionKey: 'skill4',
                    label: 'OUGI 1',
                    icon: '🌟',
                    xPct: 70,
                    yPx: 166,
                    scale: 0.9,
                    visible: true
                },
                {
                    id: 'ns_ougi2',
                    actionKey: 'skill5',
                    label: 'OUGI 2',
                    icon: '🔥',
                    xPct: 80,
                    yPx: 210,
                    scale: 0.9,
                    visible: true
                },
                {
                    id: 'ns_sub',
                    actionKey: 'sub',
                    label: 'SUB LOG',
                    icon: '🪵',
                    xPct: 68,
                    yPx: 98,
                    scale: 0.86,
                    visible: true
                },
                {
                    id: 'ns_sup',
                    actionKey: 'support',
                    label: 'ASSIST',
                    icon: '🤝',
                    xPct: 58,
                    yPx: 148,
                    scale: 0.84,
                    visible: true
                },
                {
                    id: 'ns_chk',
                    actionKey: 'chakra',
                    label: 'CHAKRA',
                    icon: '💙',
                    xPct: 66,
                    yPx: 26,
                    scale: 0.84,
                    visible: true,
                    holdable: true
                },
                {
                    id: 'ns_grd',
                    actionKey: 'guard',
                    label: 'GUARD',
                    icon: '🛡️',
                    xPct: 56,
                    yPx: 26,
                    scale: 0.84,
                    visible: true,
                    holdable: true
                }
            ]
        };
    }
    return {
        controlMode: defaultMode,
        analog: defaultAnalog,
        action: {
            xPct: 50,
            yPx: 30,
            scale: 1.0,
            visible: true
        },
        jump: {
            xPct: 86,
            yPx: 112,
            scale: 1.0,
            visible: true
        },
        steerLeft: {
            xPct: 8,
            yPx: 30,
            scale: 1.0,
            visible: true
        },
        steerRight: {
            xPct: 92,
            yPx: 30,
            scale: 1.0,
            visible: true
        },
        extras: []
    };
}
var cachedLayouts = null;
function readAllLayouts() {
    if (cachedLayouts) return cachedLayouts;
    try {
        var raw = _storage.tryStorage.getItem(STORAGE_KEY);
        if (raw) {
            var parsed = JSON.parse(raw);
            if (parsed && (typeof parsed === "undefined" ? "undefined" : _type_of(parsed)) === 'object') {
                cachedLayouts = parsed;
                return cachedLayouts;
            }
        }
    } catch (unused) {
    // ignore storage read error
    }
    cachedLayouts = {};
    return cachedLayouts;
}
function writeAllLayouts(map) {
    cachedLayouts = map;
    _storage.tryStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}
function loadGameLayout(gameId) {
    var all = readAllLayouts();
    var saved = all[gameId];
    var def = getDefaultGameLayout(gameId);
    if (!saved) return cloneLayout(def);
    var extras = Array.isArray(saved.extras) ? saved.extras.map(function(e) {
        return _extends({}, e);
    }) : def.extras.map(function(e) {
        return _extends({}, e);
    });
    if (gameId === 25 && (!extras.some(function(b) {
        return b.actionKey === 'regen';
    }) || !extras.some(function(b) {
        return b.actionKey === 'skill4';
    }) || !extras.some(function(b) {
        return b.actionKey === 'itemActive';
    }))) {
        // Migrate legacy MOBA layout cleanly to the Mobile Legends radial arc (S1-S4, Regen, Recall, Spell, ItemActive)
        return cloneLayout(def);
    }
    if (gameId === 28 && extras.some(function(b) {
        return b.id === 'ns_ougi2' && b.yPx >= 245;
    })) {
        // Keep Naruto Storm/Senki default cluster clear of top-right settings button on compact landscape viewports
        return cloneLayout(def);
    }
    if (gameId === 22 && !extras.some(function(b) {
        return b.actionKey === 'fire';
    })) {
        return cloneLayout(def);
    }
    if (gameId === 7 && !extras.some(function(b) {
        return b.actionKey === 'reload';
    })) {
        return cloneLayout(def);
    }
    var resolvedMode = saved.controlModeExplicit ? saved.controlMode === 'buttons' ? 'buttons' : 'analog' : getGlobalControlMode();
    return {
        controlMode: resolvedMode,
        controlModeExplicit: Boolean(saved.controlModeExplicit),
        analog: _extends({}, def.analog, saved.analog),
        action: _extends({}, def.action, saved.action),
        jump: _extends({}, def.jump, saved.jump),
        steerLeft: _extends({}, def.steerLeft, saved.steerLeft),
        steerRight: _extends({}, def.steerRight, saved.steerRight),
        extras: extras
    };
}
function saveGameLayout(gameId, layout) {
    var all = readAllLayouts();
    all[gameId] = cloneLayout(layout);
    writeAllLayouts(all);
}
function resetGameLayout(gameId) {
    var all = readAllLayouts();
    delete all[gameId];
    writeAllLayouts(all);
    return getDefaultGameLayout(gameId);
}
function addPresetButtonToLayout(layout, preset) {
    var _preset_defaultX, _preset_defaultY;
    var idxOffset = layout.extras.length % 4 * 6;
    var next = {
        id: "btn_" + preset.actionKey + "_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 99),
        actionKey: preset.actionKey,
        label: preset.label,
        icon: preset.icon,
        xPct: Math.min(92, Math.max(10, ((_preset_defaultX = preset.defaultX) != null ? _preset_defaultX : 75) - idxOffset)),
        yPx: Math.min(300, Math.max(24, ((_preset_defaultY = preset.defaultY) != null ? _preset_defaultY : 125) + idxOffset)),
        scale: 0.95,
        visible: true,
        holdable: preset.holdable
    };
    return _extends({}, layout, {
        extras: [].concat(layout.extras, [
            next
        ])
    });
}
function removeExtraButtonFromLayout(layout, buttonId) {
    return _extends({}, layout, {
        extras: layout.extras.filter(function(b) {
            return b.id !== buttonId;
        })
    });
}
function clampControlPos(xPct, yPx, scale) {
    return {
        xPct: Math.round(Math.max(6, Math.min(94, xPct))),
        yPx: Math.round(Math.max(12, Math.min(280, yPx))),
        scale: Math.round(Math.max(0.5, Math.min(1.8, scale)) * 10) / 10
    };
}
function cloneLayout(l) {
    return {
        controlMode: l.controlMode,
        controlModeExplicit: l.controlModeExplicit,
        analog: _extends({}, l.analog),
        action: _extends({}, l.action),
        jump: _extends({}, l.jump),
        steerLeft: _extends({}, l.steerLeft),
        steerRight: _extends({}, l.steerRight),
        extras: l.extras.map(function(e) {
            return _extends({}, e);
        })
    };
}

});
// === MODULE: src/core/dailyReward ===
ArcadeMod.define("src/core/dailyReward", function(require, module, exports) {
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
    get DAILY_COOLDOWN_MS () {
        return DAILY_COOLDOWN_MS;
    },
    get DAILY_REWARD_LAST_CLAIM_KEY () {
        return DAILY_REWARD_LAST_CLAIM_KEY;
    },
    get DAILY_REWARD_PENDING_KEY () {
        return DAILY_REWARD_PENDING_KEY;
    },
    get MAX_DAILY_COINS () {
        return MAX_DAILY_COINS;
    },
    get MIN_DAILY_COINS () {
        return MIN_DAILY_COINS;
    },
    get claimDailyReward () {
        return claimDailyReward;
    },
    get getOrCreatePendingDailyReward () {
        return getOrCreatePendingDailyReward;
    },
    get getRemainingCooldownMs () {
        return getRemainingCooldownMs;
    },
    get isDailyRewardAvailable () {
        return isDailyRewardAvailable;
    },
    get readLastClaimAt () {
        return readLastClaimAt;
    },
    get rollDailyRewardAmount () {
        return rollDailyRewardAmount;
    }
});
var _storage = require("./storage");
var DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;
var MIN_DAILY_COINS = 50;
var MAX_DAILY_COINS = 200;
var DAILY_REWARD_LAST_CLAIM_KEY = 'tsepang_daily_reward_last_claim';
var DAILY_REWARD_PENDING_KEY = 'tsepang_daily_reward_pending';
function rollDailyRewardAmount(rng) {
    if (rng === void 0) rng = Math.random;
    var raw = rng();
    var safeRng = Number.isFinite(raw) ? Math.max(0, Math.min(0.9999999, raw)) : 0;
    var span = MAX_DAILY_COINS - MIN_DAILY_COINS + 1;
    return Math.min(MAX_DAILY_COINS, Math.max(MIN_DAILY_COINS, MIN_DAILY_COINS + Math.floor(safeRng * span)));
}
function readLastClaimAt(storage) {
    if (storage === void 0) storage = _storage.tryStorage;
    var raw = storage.getItem(DAILY_REWARD_LAST_CLAIM_KEY);
    if (!raw) return null;
    var parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return parsed;
}
function isDailyRewardAvailable(lastClaimAt, nowMs) {
    if (nowMs === void 0) nowMs = Date.now();
    if (lastClaimAt === null) return true;
    if (!Number.isFinite(nowMs) || nowMs < lastClaimAt) return false;
    return nowMs - lastClaimAt >= DAILY_COOLDOWN_MS;
}
function getRemainingCooldownMs(lastClaimAt, nowMs) {
    if (nowMs === void 0) nowMs = Date.now();
    if (lastClaimAt === null) return 0;
    if (!Number.isFinite(nowMs) || nowMs < lastClaimAt) return DAILY_COOLDOWN_MS;
    return Math.max(0, DAILY_COOLDOWN_MS - (nowMs - lastClaimAt));
}
function getOrCreatePendingDailyReward(nowMs, storage, rng) {
    if (nowMs === void 0) nowMs = Date.now();
    if (storage === void 0) storage = _storage.tryStorage;
    if (rng === void 0) rng = Math.random;
    var lastClaimAt = readLastClaimAt(storage);
    if (!isDailyRewardAvailable(lastClaimAt, nowMs)) {
        return {
            available: false,
            amount: null,
            remainingMs: getRemainingCooldownMs(lastClaimAt, nowMs)
        };
    }
    var savedPendingRaw = storage.getItem(DAILY_REWARD_PENDING_KEY);
    if (savedPendingRaw) {
        var savedAmount = parseInt(savedPendingRaw, 10);
        if (Number.isInteger(savedAmount) && savedAmount >= MIN_DAILY_COINS && savedAmount <= MAX_DAILY_COINS) {
            return {
                available: true,
                amount: savedAmount,
                remainingMs: 0
            };
        }
    }
    var amount = rollDailyRewardAmount(rng);
    storage.setItem(DAILY_REWARD_PENDING_KEY, String(amount));
    return {
        available: true,
        amount: amount,
        remainingMs: 0
    };
}
function claimDailyReward(nowMs, storage, rng) {
    if (nowMs === void 0) nowMs = Date.now();
    if (storage === void 0) storage = _storage.tryStorage;
    if (rng === void 0) rng = Math.random;
    var pending = getOrCreatePendingDailyReward(nowMs, storage, rng);
    if (!pending.available || pending.amount === null) {
        return {
            claimed: false,
            amount: 0,
            claimedAt: readLastClaimAt(storage)
        };
    }
    storage.setItem(DAILY_REWARD_LAST_CLAIM_KEY, String(nowMs));
    storage.setItem(DAILY_REWARD_PENDING_KEY, '');
    return {
        claimed: true,
        amount: pending.amount,
        claimedAt: nowMs
    };
}

});
// === MODULE: src/core/emojiCache ===
ArcadeMod.define("src/core/emojiCache", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EmojiCache", {
    enumerable: true,
    get: function() {
        return EmojiCache;
    }
});
var EmojiCacheStore = /*#__PURE__*/ function() {
    "use strict";
    function EmojiCacheStore() {
        this.cache = new Map();
    }
    var _proto = EmojiCacheStore.prototype;
    _proto.get = function get(emoji, size) {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var key = emoji + "_" + size + "_" + dpr;
        var entry = this.cache.get(key);
        if (!entry) {
            var pad = Math.ceil(size * 0.35);
            var dim = Math.ceil((size + pad * 2) * dpr);
            var off = document.createElement('canvas');
            off.width = dim;
            off.height = dim;
            var octx = off.getContext('2d');
            if (octx) {
                octx.scale(dpr, dpr);
                octx.font = "" + size + 'px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
                octx.textAlign = 'center';
                octx.textBaseline = 'middle';
                octx.fillText(emoji, (size + pad * 2) / 2, (size + pad * 2) / 2 + size * 0.05);
            }
            entry = {
                canvas: off,
                logicalSize: size + pad * 2
            };
            this.cache.set(key, entry);
        }
        return entry;
    };
    _proto.draw = function draw(ctx, emoji, centerX, centerY, size, rotation, scaleX, scaleY) {
        if (rotation === void 0) rotation = 0;
        if (scaleX === void 0) scaleX = 1;
        if (scaleY === void 0) scaleY = 1;
        var bucket = Math.max(24, Math.min(96, Math.ceil(size / 16) * 16));
        var item = this.get(emoji, bucket);
        var drawScale = size / bucket;
        var drawDim = item.logicalSize * drawScale;
        var half = drawDim / 2;
        if (rotation !== 0 || scaleX !== 1 || scaleY !== 1) {
            ctx.save();
            ctx.translate(centerX, centerY);
            if (rotation !== 0) ctx.rotate(rotation);
            if (scaleX !== 1 || scaleY !== 1) ctx.scale(scaleX, scaleY);
            ctx.drawImage(item.canvas, -half, -half, drawDim, drawDim);
            ctx.restore();
        } else {
            ctx.drawImage(item.canvas, centerX - half, centerY - half, drawDim, drawDim);
        }
    };
    return EmojiCacheStore;
}();
var EmojiCache = new EmojiCacheStore();

});

})(window.ArcadeMod);
