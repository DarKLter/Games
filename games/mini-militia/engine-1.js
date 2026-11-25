(function(ArcadeMod){
// === MODULE: src/games/mini-militia/MiniMilitia ===
ArcadeMod.define("src/games/mini-militia/MiniMilitia", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MiniMilitia", {
    enumerable: true,
    get: function() {
        return MiniMilitia;
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
var MiniMilitia = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(MiniMilitia, BaseGame);
    function MiniMilitia() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.worldW = 2800, _this.worldH = 1260, _this.platforms = [], _this.player = {
            x: 360,
            y: 1120,
            vx: 0,
            vy: 0,
            moveDir: 0,
            jetpack: false,
            fuel: 100,
            aimAngle: 0,
            firing: false,
            fireCd: 0,
            weapon: 'rifle',
            weaponAmmo: 0,
            grenades: 3,
            hitCd: 0
        }, _this.bullets = [], _this.grenades = [], _this.enemies = [], _this.pickups = [], _this.camX = 0, _this.camY = 0, _this.wave = 1, _this.spawnTimer = 1.0, _this.pickupTimer = 4.0, _this.pointerScreen = null;
        return _this;
    }
    var _proto = MiniMilitia.prototype;
    _proto.init = function init() {
        this.worldW = 2800;
        this.worldH = 1260;
        this.platforms = [
            {
                x: 0,
                y: 1200,
                w: this.worldW,
                h: 60
            },
            {
                x: 140,
                y: 1020,
                w: 340,
                h: 18
            },
            {
                x: 680,
                y: 940,
                w: 400,
                h: 18
            },
            {
                x: 1280,
                y: 1000,
                w: 360,
                h: 18
            },
            {
                x: 1840,
                y: 920,
                w: 380,
                h: 18
            },
            {
                x: 2340,
                y: 1020,
                w: 320,
                h: 18
            },
            {
                x: 320,
                y: 740,
                w: 340,
                h: 18
            },
            {
                x: 960,
                y: 690,
                w: 460,
                h: 18
            },
            {
                x: 1640,
                y: 720,
                w: 400,
                h: 18
            },
            {
                x: 2220,
                y: 740,
                w: 340,
                h: 18
            },
            {
                x: 600,
                y: 470,
                w: 360,
                h: 18
            },
            {
                x: 1240,
                y: 420,
                w: 420,
                h: 18
            },
            {
                x: 1900,
                y: 480,
                w: 360,
                h: 18
            },
            {
                x: 1120,
                y: 220,
                w: 560,
                h: 18
            }
        ];
        this.player = {
            x: 360,
            y: 1140,
            vx: 0,
            vy: 0,
            moveDir: 0,
            jetpack: false,
            fuel: 100,
            aimAngle: 0,
            firing: false,
            fireCd: 0,
            weapon: 'rifle',
            weaponAmmo: 0,
            grenades: 3,
            hitCd: 0
        };
        this.bullets = [];
        this.grenades = [];
        this.enemies = [];
        this.pickups = [];
        this.wave = 1;
        this.maxLives = 5;
        this.lives = 5;
        this.spawnTimer = 0.5;
        this.pickupTimer = 3.0;
        this.pointerScreen = null;
        this.camX = 0;
        this.camY = Math.max(0, this.worldH - this.height);
        for(var i = 0; i < 4; i++)this.spawnEnemy(false);
    };
    _proto.releaseInputs = function releaseInputs() {
        this.player.firing = false;
        this.player.jetpack = false;
        this.player.moveDir = 0;
        this.pointerScreen = null;
    };
    _proto.pause = function pause() {
        BaseGame.prototype.pause.call(this);
        this.releaseInputs();
    };
    _proto.setMove = function setMove(dir) {
        if (this.gameOver || this.isPaused) {
            this.player.moveDir = 0;
            return;
        }
        this.player.moveDir = dir;
    };
    _proto.setJetpack = function setJetpack(on) {
        if (!on) {
            this.player.jetpack = false;
            return;
        }
        if (this.gameOver || this.isPaused) return;
        this.player.jetpack = true;
    };
    _proto.throwGrenade = function throwGrenade() {
        if (this.gameOver || this.isPaused || this.player.grenades <= 0) return;
        this.player.grenades--;
        var ang = this.player.aimAngle;
        this.grenades.push({
            x: this.player.x + Math.cos(ang) * 18,
            y: this.player.y - 22 + Math.sin(ang) * 18,
            vx: Math.cos(ang) * 440 + this.player.vx * 0.4,
            vy: Math.sin(ang) * 440 - 160,
            fuse: 1.35,
            fromPlayer: true
        });
        _audio.ArcadeAudio.play('slingshot');
    };
    _proto.triggerAction = function triggerAction(actionKey, pressed) {
        if (pressed && (this.gameOver || this.isPaused)) return;
        if (actionKey === 'fire' || actionKey === 'attack') this.player.firing = pressed;
        else if (actionKey === 'action' || actionKey === 'moveUp' || actionKey === 'jump') this.player.jetpack = pressed;
        else if (actionKey === 'grenade' && pressed) this.throwGrenade();
        else if (actionKey === 'left') this.player.moveDir = pressed ? -1 : 0;
        else if (actionKey === 'right') this.player.moveDir = pressed ? 1 : 0;
    };
    _proto.onPointerDown = function onPointerDown(x, y) {
        if (this.gameOver || this.isPaused) return;
        this.pointerScreen = {
            x: x,
            y: y
        };
        this.player.firing = true;
        this.updateAimFromPointer();
    };
    _proto.onPointerMove = function onPointerMove(x, y) {
        if (this.gameOver || this.isPaused) return;
        this.pointerScreen = {
            x: x,
            y: y
        };
        this.updateAimFromPointer();
    };
    _proto.onPointerUp = function onPointerUp() {
        this.player.firing = false;
    };
    _proto.updateAimFromPointer = function updateAimFromPointer() {
        if (!this.pointerScreen) return;
        var wx = this.pointerScreen.x + this.camX;
        var wy = this.pointerScreen.y + this.camY;
        this.player.aimAngle = Math.atan2(wy - (this.player.y - 22), wx - this.player.x);
    };
    _proto.spawnEnemy = function spawnEnemy(isBoss) {
        if (isBoss === void 0) isBoss = false;
        var x = isBoss ? this.player.x < this.worldW * 0.5 ? this.worldW - 240 : 240 : 120 + Math.random() * (this.worldW - 240);
        var y = isBoss ? 360 : 260 + Math.random() * 820;
        var hp = isBoss ? 240 + this.wave * 95 : 55 + this.wave * 18;
        this.enemies.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            hp: hp,
            maxHp: hp,
            shootCd: 0.9 + Math.random() * 0.8,
            jetTimer: 0.4,
            flash: 0,
            isBoss: isBoss
        });
        if (isBoss) {
            _audio.ArcadeAudio.play('warHorn');
            this.spawnPopup(this.width / 2, this.height * 0.3, '🚁 GUNSHIP BOSS INBOUND!', '#facc15');
        }
    };
    _proto.firePlayerWeapon = function firePlayerWeapon() {
        var px = this.player.x + Math.cos(this.player.aimAngle) * 20;
        var py = this.player.y - 22 + Math.sin(this.player.aimAngle) * 20;
        if (this.player.weapon === 'rocket') {
            this.player.fireCd = 0.55;
            var a = this.player.aimAngle;
            this.bullets.push({
                x: px,
                y: py,
                vx: Math.cos(a) * 620,
                vy: Math.sin(a) * 620,
                fromPlayer: true,
                dmg: 65,
                color: '#fb923c',
                life: 1.5,
                isRocket: true
            });
            _audio.ArcadeAudio.play('explosion');
            this.player.weaponAmmo--;
        } else if (this.player.weapon === 'shotgun') {
            this.player.fireCd = 0.36;
            for(var k = -2; k <= 2; k++){
                var a1 = this.player.aimAngle + k * 0.08;
                this.bullets.push({
                    x: px,
                    y: py,
                    vx: Math.cos(a1) * 700,
                    vy: Math.sin(a1) * 700,
                    fromPlayer: true,
                    dmg: 18,
                    color: '#facc15',
                    life: 0.95
                });
            }
            _audio.ArcadeAudio.play('shot');
            this.player.weaponAmmo--;
        } else if (this.player.weapon === 'laser') {
            this.player.fireCd = 0.11;
            var a2 = this.player.aimAngle;
            this.bullets.push({
                x: px,
                y: py,
                vx: Math.cos(a2) * 900,
                vy: Math.sin(a2) * 900,
                fromPlayer: true,
                dmg: 24,
                color: '#38bdf8',
                life: 1.3
            });
            _audio.ArcadeAudio.play('shoot');
            this.player.weaponAmmo--;
        } else {
            this.player.fireCd = 0.16;
            var a3 = this.player.aimAngle + (Math.random() - 0.5) * 0.04;
            this.bullets.push({
                x: px,
                y: py,
                vx: Math.cos(a3) * 740,
                vy: Math.sin(a3) * 740,
                fromPlayer: true,
                dmg: 22,
                color: '#fde047',
                life: 1.25
            });
            _audio.ArcadeAudio.play('shot');
        }
        if (this.player.weapon !== 'rifle' && this.player.weaponAmmo <= 0) {
            this.player.weapon = 'rifle';
        }
    };
    _proto.resolvePlatforms = function resolvePlatforms(ent, prevY) {
        for(var _iterator = _create_for_of_iterator_helper_loose(this.platforms), _step; !(_step = _iterator()).done;){
            var p = _step.value;
            if (ent.x >= p.x - 10 && ent.x <= p.x + p.w + 10) {
                if (ent.vy >= 0 && prevY <= p.y + 6 && ent.y >= p.y && ent.y <= p.y + p.h + 24) {
                    ent.y = p.y;
                    ent.vy = 0;
                }
            }
        }
        ent.x = Math.max(20, Math.min(this.worldW - 20, ent.x));
        if (ent.y < 36) {
            ent.y = 36;
            ent.vy = Math.max(0, ent.vy);
        }
        if (ent.y > this.worldH - 60) {
            ent.y = this.worldH - 60;
            ent.vy = 0;
        }
    };
    _proto.explodeSplash = function explodeSplash(gx, gy, dmg, radius) {
        _audio.ArcadeAudio.play('explosion');
        this.triggerShake(10, 0.22);
        this.spawnParticles(gx - this.camX, gy - this.camY, '#fb923c', 22, 240);
        for(var i = this.enemies.length - 1; i >= 0; i--){
            var e = this.enemies[i];
            if (Math.hypot(e.x - gx, e.y - 20 - gy) < radius) {
                e.hp -= dmg;
                e.flash = 0.2;
                if (e.hp <= 0) this.killEnemy(i);
            }
        }
    };
    _proto.killEnemy = function killEnemy(idx) {
        var e = this.enemies[idx];
        this.enemies.splice(idx, 1);
        var pts = e.isBoss ? 260 : 65;
        this.score += pts;
        (0, _runtimeBridge.addCoins)(e.isBoss ? 10 : 2);
        (0, _runtimeBridge.addXp)(e.isBoss ? 30 : 9);
        _audio.ArcadeAudio.play(e.isBoss ? 'win' : 'ko');
        this.spawnParticles(e.x - this.camX, e.y - 20 - this.camY, '#ef4444', 12, 170);
        this.spawnPopup(e.x - this.camX, e.y - 50 - this.camY, e.isBoss ? "\uD83C\uDFC6 BOSS DOWN! +" + pts : '💥 +65', '#ffd700');
        if (this.score >= this.wave * 340) {
            this.wave++;
            this.level++;
            this.player.grenades = Math.min(5, this.player.grenades + 1);
            _audio.ArcadeAudio.play('levelup');
            this.spawnEnemy(true);
        }
        (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 22);
    };
    _proto.update = function update(dt) {
        var _this, _loop = function(i2) {
            var b = _this.bullets[i2];
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.life -= dt;
            var hit = b.life <= 0 || b.x < 0 || b.x > _this.worldW || b.y < 0 || b.y > _this.worldH;
            if (!hit && _this.platforms.some(function(p) {
                return b.x >= p.x && b.x <= p.x + p.w && b.y >= p.y && b.y <= p.y + p.h;
            })) {
                hit = true;
                if (b.isRocket) _this.explodeSplash(b.x, b.y, 65, 110);
            }
            if (!hit && b.fromPlayer) {
                for(var j = _this.enemies.length - 1; j >= 0; j--){
                    var e = _this.enemies[j];
                    var hitR = e.isBoss ? 34 : 24;
                    if (Math.hypot(b.x - e.x, b.y - (e.y - 22)) < hitR) {
                        if (b.isRocket) {
                            _this.explodeSplash(b.x, b.y, 65, 110);
                        } else {
                            e.hp -= b.dmg;
                            e.flash = 0.12;
                            if (e.hp <= 0) _this.killEnemy(j);
                        }
                        hit = true;
                        break;
                    }
                }
            } else if (!hit && !b.fromPlayer) {
                if (Math.hypot(b.x - _this.player.x, b.y - (_this.player.y - 22)) < 22) {
                    hit = true;
                    if (_this.player.hitCd <= 0) {
                        _this.player.hitCd = 0.45;
                        _this.lives--;
                        _audio.ArcadeAudio.play('hurt');
                        _this.triggerShake(7, 0.16);
                        (0, _runtimeBridge.updateHealthDisplay)(_this.lives, _this.maxLives);
                        if (_this.lives <= 0) {
                            _this.gameOverSequence(false);
                            return {
                                v: void void 0
                            };
                        }
                    }
                }
            }
            if (hit) _this.bullets.splice(i2, 1);
        };
        if (this.gameOver) return;
        this.survivalElapsed = 0;
        this.updateAimFromPointer();
        this.player.vx = this.player.moveDir * 270;
        if (this.player.jetpack && this.player.fuel > 0) {
            this.player.vy = Math.max(-330, this.player.vy - 1280 * dt);
            this.player.fuel = Math.max(0, this.player.fuel - 32 * dt);
            if (Math.random() < dt * 12) _audio.ArcadeAudio.play('jetpack');
        } else {
            this.player.vy += 880 * dt;
            this.player.fuel = Math.min(100, this.player.fuel + 26 * dt);
        }
        var prevPy = this.player.y;
        this.player.x += this.player.vx * dt;
        this.player.y += this.player.vy * dt;
        this.resolvePlatforms(this.player, prevPy);
        if (this.player.hitCd > 0) this.player.hitCd -= dt;
        if (this.player.fireCd > 0) this.player.fireCd -= dt;
        if (this.player.firing && this.player.fireCd <= 0) {
            this.firePlayerWeapon();
        }
        var targetCamX = Math.max(0, Math.min(this.worldW - this.width, this.player.x - this.width / 2));
        var targetCamY = Math.max(0, Math.min(this.worldH - this.height, this.player.y - this.height * 0.58));
        var camAlpha = 1 - Math.exp(-8 * dt);
        this.camX += (targetCamX - this.camX) * camAlpha;
        this.camY += (targetCamY - this.camY) * camAlpha;
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0 && this.enemies.length < Math.min(10, 4 + this.wave)) {
            this.spawnEnemy(false);
            this.spawnTimer = Math.max(1.5, 3.2 - this.wave * 0.22) / this.scaler.spawnMult;
        }
        this.pickupTimer -= dt;
        if (this.pickupTimer <= 0 && this.pickups.length < 6) {
            this.pickupTimer = 5.5;
            var kinds = [
                'shotgun',
                'laser',
                'rocket',
                'medkit',
                'grenade'
            ];
            this.pickups.push({
                x: 160 + Math.random() * (this.worldW - 320),
                y: 260 + Math.random() * 820,
                kind: kinds[Math.floor(Math.random() * kinds.length)],
                ttl: 18
            });
        }
        for(var i = this.pickups.length - 1; i >= 0; i--){
            var pk = this.pickups[i];
            pk.ttl -= dt;
            if (Math.hypot(pk.x - this.player.x, pk.y - (this.player.y - 22)) < 38) {
                if (pk.kind === 'medkit') {
                    this.lives = Math.min(this.maxLives, this.lives + 1);
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                    _audio.ArcadeAudio.play('save');
                } else if (pk.kind === 'grenade') {
                    this.player.grenades = Math.min(5, this.player.grenades + 2);
                    _audio.ArcadeAudio.play('reload');
                } else {
                    this.player.weapon = pk.kind;
                    this.player.weaponAmmo = pk.kind === 'laser' ? 35 : pk.kind === 'rocket' ? 8 : 18;
                    _audio.ArcadeAudio.play('reload');
                }
                this.spawnPopup(pk.x - this.camX, pk.y - this.camY, pk.kind.toUpperCase(), '#84fab0');
                this.pickups.splice(i, 1);
            } else if (pk.ttl <= 0) {
                this.pickups.splice(i, 1);
            }
        }
        for(var i1 = this.grenades.length - 1; i1 >= 0; i1--){
            var g = this.grenades[i1];
            var prevGy = g.y;
            g.vy += 680 * dt;
            g.x += g.vx * dt;
            g.y += g.vy * dt;
            for(var _iterator = _create_for_of_iterator_helper_loose(this.platforms), _step; !(_step = _iterator()).done;){
                var p = _step.value;
                if (g.x >= p.x && g.x <= p.x + p.w && g.vy >= 0 && prevGy <= p.y + 4 && g.y >= p.y && g.y <= p.y + p.h + 12) {
                    g.y = p.y;
                    if (Math.abs(g.vy) < 42) {
                        g.vy = 0;
                        g.vx *= Math.exp(-12 * dt);
                    } else {
                        g.vy *= -0.48;
                        g.vx *= 0.78;
                    }
                    break;
                }
            }
            g.fuse -= dt;
            if (g.fuse <= 0) {
                this.explodeSplash(g.x, g.y, 85, 125);
                this.grenades.splice(i1, 1);
            }
        }
        for(var i2 = this.bullets.length - 1; i2 >= 0; i2--){
            var _ret = (_this = this, _loop(i2));
            if (_type_of(_ret) === "object") return _ret.v;
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.enemies), _step1; !(_step1 = _iterator1()).done;){
            var e = _step1.value;
            if (e.flash > 0) e.flash -= dt;
            var dx = this.player.x - e.x;
            var dy = this.player.y - e.y;
            e.vx = Math.abs(dx) > 130 ? Math.sign(dx) * (e.isBoss ? 125 : 108 + this.wave * 8) * this.scaler.speedMult : 0;
            e.jetTimer -= dt;
            if (dy < -50 || e.isBoss || e.jetTimer <= 0 && Math.random() < 0.35) {
                if (dy < 60 || e.isBoss) {
                    e.vy = Math.max(-240, e.vy - 960 * dt);
                } else {
                    e.vy += 760 * dt;
                }
                if (e.jetTimer <= 0) e.jetTimer = 0.8 + Math.random() * 0.9;
            } else {
                e.vy += 820 * dt;
            }
            var prevEy = e.y;
            e.x += e.vx * dt;
            e.y += e.vy * dt;
            this.resolvePlatforms(e, prevEy);
            e.shootCd -= dt;
            if (e.shootCd <= 0 && Math.hypot(dx, dy) < 620) {
                e.shootCd = Math.max(0.75, ((e.isBoss ? 1.15 : 1.8) - this.wave * 0.1) / this.scaler.speedMult);
                var ang = Math.atan2(this.player.y - e.y, this.player.x - e.x) + (Math.random() - 0.5) * 0.14;
                var shots = e.isBoss ? [
                    -0.14,
                    0,
                    0.14
                ] : [
                    0
                ];
                for(var _iterator2 = _create_for_of_iterator_helper_loose(shots), _step2; !(_step2 = _iterator2()).done;){
                    var off = _step2.value;
                    this.bullets.push({
                        x: e.x,
                        y: e.y - 22,
                        vx: Math.cos(ang + off) * 460,
                        vy: Math.sin(ang + off) * 460,
                        fromPlayer: false,
                        dmg: 1,
                        color: e.isBoss ? '#facc15' : '#f87171',
                        life: 1.5
                    });
                }
            }
        }
    };
    _proto.draw = function draw() {
        var ctx = this.ctx;
        ctx.fillStyle = '#0b1322';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.save();
        ctx.translate(-this.camX, -this.camY);
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for(var x = 0; x <= this.worldW; x += 140){
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.worldH);
            ctx.stroke();
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(this.platforms), _step; !(_step = _iterator()).done;){
            var p = _step.value;
            ctx.fillStyle = p.h > 25 ? '#1e293b' : '#334155';
            ctx.fillRect(p.x, p.y, p.w, p.h);
            ctx.fillStyle = '#84fab0';
            ctx.fillRect(p.x, p.y, p.w, 3);
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.pickups), _step1; !(_step1 = _iterator1()).done;){
            var pk = _step1.value;
            var icon = pk.kind === 'medkit' ? '❤️' : pk.kind === 'grenade' ? '🧨' : pk.kind === 'rocket' ? '🚀' : '🔫';
            _emojiCache.EmojiCache.draw(ctx, icon, pk.x, pk.y, 26);
        }
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.grenades), _step2; !(_step2 = _iterator2()).done;){
            var g = _step2.value;
            _emojiCache.EmojiCache.draw(ctx, '🧨', g.x, g.y, 20);
        }
        for(var _iterator3 = _create_for_of_iterator_helper_loose(this.bullets), _step3; !(_step3 = _iterator3()).done;){
            var b = _step3.value;
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.isRocket ? 6 : 4, 0, Math.PI * 2);
            ctx.fill();
        }
        for(var _iterator4 = _create_for_of_iterator_helper_loose(this.enemies), _step4; !(_step4 = _iterator4()).done;){
            var e = _step4.value;
            var w = e.isBoss ? 34 : 20;
            var h = e.isBoss ? 48 : 32;
            ctx.fillStyle = e.flash > 0 ? '#ffffff' : e.isBoss ? '#facc15' : '#ef4444';
            ctx.beginPath();
            ctx.roundRect(e.x - w / 2, e.y - h - 4, w, h, 8);
            ctx.fill();
            _emojiCache.EmojiCache.draw(ctx, e.isBoss ? '🚁' : '🪖', e.x, e.y - h - 4, e.isBoss ? 34 : 22);
            var bw = e.isBoss ? 52 : 32;
            ctx.fillStyle = '#000';
            ctx.fillRect(e.x - bw / 2, e.y - h - 24, bw, 4);
            ctx.fillStyle = e.isBoss ? '#facc15' : '#ef4444';
            ctx.fillRect(e.x - bw / 2, e.y - h - 24, bw * Math.max(0, e.hp / e.maxHp), 4);
        }
        if (this.player.jetpack && this.player.fuel > 0) {
            ctx.fillStyle = '#fb923c';
            ctx.beginPath();
            ctx.arc(this.player.x - 8, this.player.y - 6 + Math.random() * 6, 7, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.roundRect(this.player.x - 10, this.player.y - 36, 20, 32, 6);
        ctx.fill();
        _emojiCache.EmojiCache.draw(ctx, '🪖', this.player.x, this.player.y - 36, 24);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.player.x, this.player.y - 22);
        ctx.lineTo(this.player.x + Math.cos(this.player.aimAngle) * 24, this.player.y - 22 + Math.sin(this.player.aimAngle) * 24);
        ctx.stroke();
        ctx.restore();
        var isCompactLandscape = this.width > this.height * 1.3 && this.height < 460;
        var barW = Math.min(160, this.width * 0.38);
        var by = this.width < 460 ? 58 : isCompactLandscape ? 54 : 48;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.roundRect((this.width - barW) / 2, by, barW, 14, 7);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect((this.width - barW) / 2 + 2, by + 2, (barW - 4) * (this.player.fuel / 100), 10, 5);
        ctx.fill();
        ctx.font = '800 10px system-ui, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText("\uD83D\uDD25 " + Math.round(this.player.fuel) + "% \xb7 " + this.player.weapon.toUpperCase() + " \xb7 \uD83E\uDDE8" + this.player.grenades, this.width / 2, by + 26);
        // Compact Radar Minimap
        var mapW = isCompactLandscape ? 82 : 92;
        var mapH = isCompactLandscape ? 36 : 42;
        var mx = this.width - mapW - (isCompactLandscape ? 64 : 12);
        var my = isCompactLandscape ? 12 : 60;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(mx, my, mapW, mapH, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(mx + this.player.x / this.worldW * (mapW - 4), my + this.player.y / this.worldH * (mapH - 4), 4, 4);
        for(var _iterator5 = _create_for_of_iterator_helper_loose(this.enemies), _step5; !(_step5 = _iterator5()).done;){
            var e1 = _step5.value;
            ctx.fillStyle = e1.isBoss ? '#facc15' : '#ef4444';
            ctx.fillRect(mx + e1.x / this.worldW * (mapW - 4), my + e1.y / this.worldH * (mapH - 4), e1.isBoss ? 5 : 3, e1.isBoss ? 5 : 3);
        }
        ctx.textAlign = 'left';
    };
    return MiniMilitia;
}(_BaseGame.BaseGame);

});
// === MODULE: src/games/mini-militia/engine/AudioEngine ===
ArcadeMod.define("src/games/mini-militia/engine/AudioEngine", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "mmAudio", {
    enumerable: true,
    get: function() {
        return mmAudio;
    }
});
/**
 * 100% Procedural Web Audio API Sound Engine for Mini Militia - Doodle Army 2.
 * Synthesizes unique gunfire per weapon, metallic reloads, jetpack thrust,
 * headshot dings, grenade bounces, explosions, gas hiss, EMP zaps, saw ricochets & chimes.
 */ var MiniMilitiaAudioEngine = /*#__PURE__*/ function() {
    "use strict";
    function MiniMilitiaAudioEngine() {
        this.ctx = null;
        this.masterVol = 0.8;
        this.sfxVol = 0.85;
        this.voiceVol = 0.8;
        this.muted = false;
        this.noiseBuf = null;
        this.lastJetSfxAt = 0;
    }
    var _proto = MiniMilitiaAudioEngine.prototype;
    _proto.setVolumes = function setVolumes(audio) {
        this.masterVol = Math.max(0, Math.min(1, audio.master / 100));
        this.sfxVol = Math.max(0, Math.min(1, audio.sfx / 100));
        this.voiceVol = Math.max(0, Math.min(1, audio.voice / 100));
        this.muted = audio.muted;
    };
    _proto.ensureCtx = function ensureCtx() {
        if (this.muted || this.masterVol <= 0.01) return null;
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            this.ctx = new AC();
        }
        if (this.ctx.state === 'suspended') {
            void this.ctx.resume().catch(function() {});
        }
        if (!this.noiseBuf && this.ctx) {
            var len = Math.floor(this.ctx.sampleRate * 0.6);
            var buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
            var data = buf.getChannelData(0);
            for(var i = 0; i < len; i++)data[i] = Math.random() * 2 - 1;
            this.noiseBuf = buf;
        }
        return this.ctx;
    };
    _proto.gainVal = function gainVal(scale, isVoice) {
        if (scale === void 0) scale = 1;
        if (isVoice === void 0) isVoice = false;
        return Math.min(0.65, this.masterVol * (isVoice ? this.voiceVol : this.sfxVol) * scale);
    };
    _proto.playClick = function playClick() {
        var ctx = this.ensureCtx();
        if (!ctx) return;
        var t = ctx.currentTime;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(640, t);
        osc.frequency.exponentialRampToValueAtTime(280, t + 0.045);
        g.gain.setValueAtTime(this.gainVal(0.14), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(g).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.055);
    };
    _proto.playWeaponFire = function playWeaponFire(weaponId) {
        var ctx = this.ensureCtx();
        if (!ctx || !this.noiseBuf) return;
        var t = ctx.currentTime;
        if (weaponId === 'phasr') {
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1180, t);
            osc.frequency.exponentialRampToValueAtTime(520, t + 0.08);
            g.gain.setValueAtTime(this.gainVal(0.16), t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
            osc.connect(g).connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.095);
            return;
        }
        if (weaponId === 'flamethrower') {
            var src = ctx.createBufferSource();
            src.buffer = this.noiseBuf;
            var flt = ctx.createBiquadFilter();
            flt.type = 'bandpass';
            flt.frequency.setValueAtTime(420, t);
            flt.Q.value = 0.8;
            var g1 = ctx.createGain();
            g1.gain.setValueAtTime(this.gainVal(0.14), t);
            g1.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
            src.connect(flt).connect(g1).connect(ctx.destination);
            src.start(t);
            src.stop(t + 0.12);
            return;
        }
        if (weaponId === 'emp_gun') {
            var osc1 = ctx.createOscillator();
            var g2 = ctx.createGain();
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(860, t);
            osc1.frequency.exponentialRampToValueAtTime(140, t + 0.22);
            g2.gain.setValueAtTime(this.gainVal(0.24), t);
            g2.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
            osc1.connect(g2).connect(ctx.destination);
            osc1.start(t);
            osc1.stop(t + 0.25);
            return;
        }
        if (weaponId === 'saw_gun') {
            var osc2 = ctx.createOscillator();
            var g3 = ctx.createGain();
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(520, t);
            osc2.frequency.linearRampToValueAtTime(1420, t + 0.11);
            g3.gain.setValueAtTime(this.gainVal(0.2), t);
            g3.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
            osc2.connect(g3).connect(ctx.destination);
            osc2.start(t);
            osc2.stop(t + 0.17);
            return;
        }
        if (weaponId === 'machete' || weaponId === 'riot_shield') {
            this.playMelee();
            return;
        }
        var isHeavy = weaponId === 'm93ba' || weaponId === 'smaw' || weaponId === 'spas12' || weaponId === 'sawed_off' || weaponId === 'hunting_rifle';
        var isSilenced = weaponId === 'golden_eagle';
        var isSmg = weaponId === 'uzi' || weaponId === 'tec9' || weaponId === 'mp5' || weaponId === 'minigun';
        // Noise burst
        var src1 = ctx.createBufferSource();
        src1.buffer = this.noiseBuf;
        var filter = ctx.createBiquadFilter();
        filter.type = isHeavy ? 'lowpass' : 'bandpass';
        filter.frequency.setValueAtTime(isHeavy ? 950 : isSilenced ? 1900 : isSmg ? 1600 : 1200, t);
        var ng = ctx.createGain();
        var dur = isHeavy ? 0.22 : isSilenced ? 0.065 : isSmg ? 0.055 : 0.1;
        ng.gain.setValueAtTime(this.gainVal(isHeavy ? 0.34 : isSilenced ? 0.11 : isSmg ? 0.14 : 0.22), t);
        ng.gain.exponentialRampToValueAtTime(0.001, t + dur);
        src1.connect(filter).connect(ng).connect(ctx.destination);
        src1.start(t);
        src1.stop(t + dur + 0.01);
        // Low punch thump
        var osc3 = ctx.createOscillator();
        var og = ctx.createGain();
        osc3.type = isHeavy ? 'sawtooth' : 'triangle';
        osc3.frequency.setValueAtTime(isHeavy ? 185 : isSmg ? 280 : 230, t);
        osc3.frequency.exponentialRampToValueAtTime(42, t + dur);
        og.gain.setValueAtTime(this.gainVal(isHeavy ? 0.3 : 0.15), t);
        og.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc3.connect(og).connect(ctx.destination);
        osc3.start(t);
        osc3.stop(t + dur + 0.01);
    };
    _proto.playReload = function playReload() {
        var _this = this;
        var ctx = this.ensureCtx();
        if (!ctx) return;
        var t = ctx.currentTime;
        [
            0,
            0.13
        ].forEach(function(off, idx) {
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(idx === 0 ? 920 : 1340, t + off);
            osc.frequency.exponentialRampToValueAtTime(idx === 0 ? 480 : 760, t + off + 0.04);
            g.gain.setValueAtTime(_this.gainVal(0.14), t + off);
            g.gain.exponentialRampToValueAtTime(0.001, t + off + 0.045);
            osc.connect(g).connect(ctx.destination);
            osc.start(t + off);
            osc.stop(t + off + 0.05);
        });
    };
    _proto.playJetpackPulse = function playJetpackPulse() {
        var now = performance.now();
        if (now - this.lastJetSfxAt < 110) return;
        this.lastJetSfxAt = now;
        var ctx = this.ensureCtx();
        if (!ctx || !this.noiseBuf) return;
        var t = ctx.currentTime;
        var src = ctx.createBufferSource();
        src.buffer = this.noiseBuf;
        var flt = ctx.createBiquadFilter();
        flt.type = 'lowpass';
        flt.frequency.setValueAtTime(340, t);
        var g = ctx.createGain();
        g.gain.setValueAtTime(this.gainVal(0.08), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        src.connect(flt).connect(g).connect(ctx.destination);
        src.start(t);
        src.stop(t + 0.13);
    };
    _proto.playMelee = function playMelee() {
        var ctx = this.ensureCtx();
        if (!ctx || !this.noiseBuf) return;
        var t = ctx.currentTime;
        var src = ctx.createBufferSource();
        src.buffer = this.noiseBuf;
        var flt = ctx.createBiquadFilter();
        flt.type = 'bandpass';
        flt.frequency.setValueAtTime(1400, t);
        flt.frequency.exponentialRampToValueAtTime(320, t + 0.11);
        var g = ctx.createGain();
        g.gain.setValueAtTime(this.gainVal(0.22), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        src.connect(flt).connect(g).connect(ctx.destination);
        src.start(t);
        src.stop(t + 0.13);
    };
    _proto.playHeadshotDing = function playHeadshotDing() {
        var ctx = this.ensureCtx();
        if (!ctx) return;
        var t = ctx.currentTime;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1880, t);
        osc.frequency.exponentialRampToValueAtTime(2460, t + 0.12);
        g.gain.setValueAtTime(this.gainVal(0.24), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(g).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.19);
    };
    _proto.playShieldBlock = function playShieldBlock() {
        var ctx = this.ensureCtx();
        if (!ctx) return;
        var t = ctx.currentTime;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1420, t);
        osc.frequency.exponentialRampToValueAtTime(520, t + 0.06);
        g.gain.setValueAtTime(this.gainVal(0.2), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        osc.connect(g).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.075);
    };
    _proto.playRicochet = function playRicochet() {
        var ctx = this.ensureCtx();
        if (!ctx) return;
        var t = ctx.currentTime;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1950, t);
        osc.frequency.exponentialRampToValueAtTime(680, t + 0.11);
        g.gain.setValueAtTime(this.gainVal(0.18), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(g).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.13);
    };
    _proto.playGrenadeBounce = function playGrenadeBounce() {
        var ctx = this.ensureCtx();
        if (!ctx) return;
        var t = ctx.currentTime;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(340, t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.04);
        g.gain.setValueAtTime(this.gainVal(0.14), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
        osc.connect(g).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
    };
    _proto.playExplosion = function playExplosion() {
        var ctx = this.ensureCtx();
        if (!ctx || !this.noiseBuf) return;
        var t = ctx.currentTime;
        var src = ctx.createBufferSource();
        src.buffer = this.noiseBuf;
        var flt = ctx.createBiquadFilter();
        flt.type = 'lowpass';
        flt.frequency.setValueAtTime(620, t);
        flt.frequency.exponentialRampToValueAtTime(75, t + 0.45);
        var g = ctx.createGain();
        g.gain.setValueAtTime(this.gainVal(0.45), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
        src.connect(flt).connect(g).connect(ctx.destination);
        src.start(t);
        src.stop(t + 0.5);
        var sub = ctx.createOscillator();
        var sg = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(120, t);
        sub.frequency.exponentialRampToValueAtTime(28, t + 0.4);
        sg.gain.setValueAtTime(this.gainVal(0.36), t);
        sg.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
        sub.connect(sg).connect(ctx.destination);
        sub.start(t);
        sub.stop(t + 0.44);
    };
    _proto.playGasHiss = function playGasHiss() {
        var ctx = this.ensureCtx();
        if (!ctx || !this.noiseBuf) return;
        var t = ctx.currentTime;
        var src = ctx.createBufferSource();
        src.buffer = this.noiseBuf;
        var flt = ctx.createBiquadFilter();
        flt.type = 'highpass';
        flt.frequency.setValueAtTime(2200, t);
        var g = ctx.createGain();
        g.gain.setValueAtTime(this.gainVal(0.18), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        src.connect(flt).connect(g).connect(ctx.destination);
        src.start(t);
        src.stop(t + 0.46);
    };
    _proto.playEmpZap = function playEmpZap() {
        var ctx = this.ensureCtx();
        if (!ctx) return;
        var t = ctx.currentTime;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1240, t);
        osc.frequency.exponentialRampToValueAtTime(95, t + 0.35);
        g.gain.setValueAtTime(this.gainVal(0.3), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.37);
        osc.connect(g).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.38);
    };
    _proto.playKillstreakChime = function playKillstreakChime(multiLevel) {
        var _this = this;
        if (multiLevel === void 0) multiLevel = 1;
        var ctx = this.ensureCtx();
        if (!ctx) return;
        var t = ctx.currentTime;
        var notes = multiLevel >= 3 ? [
            523,
            659,
            784,
            1046
        ] : multiLevel === 2 ? [
            523,
            659,
            784
        ] : [
            587,
            880
        ];
        notes.forEach(function(freq, i) {
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + i * 0.08);
            g.gain.setValueAtTime(_this.gainVal(0.22, true), t + i * 0.08);
            g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.16);
            osc.connect(g).connect(ctx.destination);
            osc.start(t + i * 0.08);
            osc.stop(t + i * 0.08 + 0.17);
        });
    };
    _proto.playKillstreak = function playKillstreak() {
        this.playKillstreakChime(2);
    };
    _proto.playPickup = function playPickup() {
        var ctx = this.ensureCtx();
        if (!ctx) return;
        var t = ctx.currentTime;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, t);
        osc.frequency.setValueAtTime(990, t + 0.06);
        g.gain.setValueAtTime(this.gainVal(0.18), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        osc.connect(g).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
    };
    return MiniMilitiaAudioEngine;
}();
var mmAudio = new MiniMilitiaAudioEngine();

});
// === MODULE: src/games/mini-militia/engine/DoodleRenderer ===
ArcadeMod.define("src/games/mini-militia/engine/DoodleRenderer", function(require, module, exports) {
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
    get drawDoodleSoldier () {
        return drawDoodleSoldier;
    },
    get drawMapMiniSilhouette () {
        return drawMapMiniSilhouette;
    },
    get drawParallaxBackground () {
        return drawParallaxBackground;
    },
    get drawWeaponVector () {
        return drawWeaponVector;
    }
});
var _progression = require("../data/progression");
var _weapons = require("../data/weapons");
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
function drawDoodleSoldier(ctx, p) {
    var _p_scale, _MM_OUTFITS_find, _MM_BOOTS_find, _p_timeSec, _p_walkPhase, _p_muzzleFlash, _p_meleeSwing;
    var s = (_p_scale = p.scale) != null ? _p_scale : 1;
    var facingLeft = Math.cos(p.aimAngle) < 0;
    var outfit = (_MM_OUTFITS_find = _progression.MM_OUTFITS.find(function(o) {
        return o.id === p.avatar.outfit;
    })) != null ? _MM_OUTFITS_find : _progression.MM_OUTFITS[0];
    var boot = (_MM_BOOTS_find = _progression.MM_BOOTS.find(function(b) {
        return b.id === p.avatar.boots;
    })) != null ? _MM_BOOTS_find : _progression.MM_BOOTS[0];
    var teamAccent = p.team === 'blue' ? '#2B82D9' : p.team === 'red' ? '#D93829' : p.avatar.accentColor;
    var crouchOff = p.crouching ? 10 : 0;
    var t = (_p_timeSec = p.timeSec) != null ? _p_timeSec : 0;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(s, s);
    if (p.stealthAlpha !== undefined && p.stealthAlpha < 1) {
        ctx.globalAlpha = p.stealthAlpha;
    }
    // Speed/Power boost red aura
    if (p.boosted) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, -14 + crouchOff * 0.5, 32 + Math.sin(t * 14) * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.fill();
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
    // CTF Flag mounted on back
    if (p.carryingFlagColor) {
        ctx.save();
        var bx = facingLeft ? 10 : -10;
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bx, -6 + crouchOff);
        ctx.lineTo(bx + (facingLeft ? 8 : -8), -48 + crouchOff);
        ctx.stroke();
        ctx.fillStyle = p.carryingFlagColor;
        ctx.beginPath();
        var fx = bx + (facingLeft ? 8 : -8);
        var fy = -48 + crouchOff;
        var wave = Math.sin(t * 10) * 3;
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + (facingLeft ? 24 : -24), fy + 6 + wave);
        ctx.lineTo(fx, fy + 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    // Legs + Rocket Boots
    var legSwing = p.jetpacking ? 0.35 : Math.sin((_p_walkPhase = p.walkPhase) != null ? _p_walkPhase : 0) * 6;
    var legY = p.crouching ? 8 : 11;
    [
        -6,
        6
    ].forEach(function(lx, idx) {
        var offX = idx === 0 ? legSwing : -legSwing;
        var footX = lx + offX * 0.7;
        var footY = legY + (p.jetpacking ? 3 : Math.abs(offX) * 0.25);
        // Thruster flame underneath Rocket Boots when flying!
        if (p.jetpacking && !p.empDisabled) {
            ctx.save();
            var fl = 14 + Math.sin(t * 40 + idx * 2) * 6;
            ctx.beginPath();
            ctx.moveTo(footX - 4, footY + 6);
            ctx.lineTo(footX, footY + 6 + fl);
            ctx.lineTo(footX + 4, footY + 6);
            ctx.closePath();
            ctx.fillStyle = boot.flame;
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(footX - 2, footY + 6);
            ctx.lineTo(footX, footY + 6 + fl * 0.55);
            ctx.lineTo(footX + 2, footY + 6);
            ctx.closePath();
            ctx.fillStyle = '#FEF9C3';
            ctx.fill();
            ctx.restore();
        }
        // Leg line
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lx * 0.7, 0 + crouchOff * 0.6);
        ctx.lineTo(footX, footY);
        ctx.stroke();
        // Rocket Boot housing
        ctx.fillStyle = boot.color;
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.roundRect(footX - 6, footY - 2, 12, 8, 3);
        ctx.fill();
        ctx.stroke();
    });
    // Armored Torso
    ctx.fillStyle = outfit.primary;
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.roundRect(-11, -14 + crouchOff, 22, p.crouching ? 18 : 22, 7);
    ctx.fill();
    ctx.stroke();
    // Tactical Vest / Belt & Team Stripe
    ctx.fillStyle = outfit.secondary;
    ctx.fillRect(-9, -6 + crouchOff, 18, 6);
    ctx.fillStyle = teamAccent;
    ctx.fillRect(-10, -10 + crouchOff, 20, 4);
    // Oversized Cartoon Doodle Head
    var headY = -25 + crouchOff;
    ctx.save();
    ctx.translate(0, headY);
    if (facingLeft) ctx.scale(-1, 1);
    // Base head circle
    ctx.fillStyle = p.avatar.skinTone;
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(0, 0, 14.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Expressive Eyes
    var eyeColor = p.avatar.eyeStyle === 'cyber' ? '#EF4444' : '#111827';
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(5, -2, 3.6, 4.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(6.4, -2, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // Eyebrow / expression
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    if (p.avatar.eyeStyle === 'angry' || p.avatar.eyeStyle === 'determined') {
        ctx.moveTo(1, -7.5);
        ctx.lineTo(9.5, -5.2);
    } else if (p.avatar.eyeStyle === 'sarge') {
        ctx.moveTo(1, -5.8);
        ctx.lineTo(10, -5.8);
    } else {
        ctx.moveTo(1.5, -7);
        ctx.lineTo(9, -7.5);
    }
    ctx.stroke();
    if (p.avatar.eyeStyle === 'scarred') {
        ctx.strokeStyle = '#991B1B';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(4, -8);
        ctx.lineTo(7, 5);
        ctx.stroke();
    }
    // Facial Hair / Mouth
    drawFacialLayer(ctx, p.avatar.facial);
    // Eyewear Layer
    drawEyewearLayer(ctx, p.avatar.eyewear);
    // Headgear / Hair Layer
    drawHeadgearLayer(ctx, p.avatar.headgear, teamAccent);
    ctx.restore();
    // Weapons & 360° Articulated Hands
    var shoulderY = -7 + crouchOff;
    // Off-hand weapon (if Dual Wielding or holding Riot Shield)
    if (p.offhandWeaponId) {
        var _p_muzzleFlash1, _p_meleeSwing1;
        ctx.save();
        ctx.translate(facingLeft ? -4 : 4, shoulderY + 3);
        ctx.rotate(p.aimAngle);
        if (facingLeft) ctx.scale(1, -1);
        drawWeaponVector(ctx, p.offhandWeaponId, ((_p_muzzleFlash1 = p.muzzleFlash) != null ? _p_muzzleFlash1 : 0) * 0.85, (_p_meleeSwing1 = p.meleeSwing) != null ? _p_meleeSwing1 : 0);
        ctx.restore();
    }
    // Primary active weapon
    ctx.save();
    ctx.translate(0, shoulderY);
    ctx.rotate(p.aimAngle);
    if (facingLeft) ctx.scale(1, -1);
    drawWeaponVector(ctx, p.weaponId, (_p_muzzleFlash = p.muzzleFlash) != null ? _p_muzzleFlash : 0, (_p_meleeSwing = p.meleeSwing) != null ? _p_meleeSwing : 0);
    ctx.restore();
    // Status VFX: Burning / EMP Zapped / Spawn Shield
    if (p.burning) {
        ctx.fillStyle = 'rgba(251, 146, 60, 0.72)';
        for(var i = 0; i < 3; i++){
            ctx.beginPath();
            ctx.arc(Math.sin(t * 14 + i * 2) * 10, -14 - i * 8 + Math.cos(t * 12 + i) * 3, 5 - i, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    if (p.empDisabled) {
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -10 + crouchOff, 22, 0, Math.PI * 2);
        ctx.stroke();
    }
    if (p.spawnShield) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, -12 + crouchOff * 0.5, 29, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(248, 250, 252, 0.24)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.restore();
    }
    // Overhead Nametag & HP Bar (hidden when crouch-stealthed)
    if (p.showTag && p.name) {
        var tagY = -50 + crouchOff;
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeText(p.name, 0, tagY - 7);
        ctx.fillStyle = p.team === 'blue' ? '#60A5FA' : p.team === 'red' ? '#F87171' : '#F4F4EC';
        ctx.fillText(p.name, 0, tagY - 7);
        if (p.hpPct !== undefined) {
            var bw = 34;
            ctx.fillStyle = '#0F172A';
            ctx.fillRect(-bw / 2 - 1, tagY - 3, bw + 2, 6);
            ctx.fillStyle = p.hpPct > 0.5 ? '#4ADE80' : p.hpPct > 0.25 ? '#FACC15' : '#EF4444';
            ctx.fillRect(-bw / 2, tagY - 2, bw * Math.max(0, Math.min(1, p.hpPct)), 4);
        }
    }
    // Comic Speech Bubble (Sarge / Quick Chat / Taunts)
    if (p.speechText) {
        ctx.save();
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        var tw = Math.max(64, ctx.measureText(p.speechText).width + 18);
        var bx1 = -tw / 2;
        var by = -86 + crouchOff;
        ctx.fillStyle = '#FEFCE8';
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx1, by, tw, 24, 8);
        ctx.fill();
        ctx.stroke();
        // Tail triangle
        ctx.beginPath();
        ctx.moveTo(-4, by + 24);
        ctx.lineTo(0, by + 31);
        ctx.lineTo(6, by + 24);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#111827';
        ctx.textAlign = 'center';
        ctx.fillText(p.speechText, 0, by + 16);
        ctx.restore();
    }
    ctx.restore();
}
function drawFacialLayer(ctx, facial) {
    ctx.save();
    switch(facial){
        case 'sarge_stache':
            ctx.fillStyle = '#573B26';
            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(1, 3, 13, 5.5, 2.5);
            ctx.fill();
            ctx.stroke();
            break;
        case 'cigar':
            ctx.fillStyle = '#573B26';
            ctx.beginPath();
            ctx.roundRect(1, 2.5, 11, 4.5, 2);
            ctx.fill();
            ctx.fillStyle = '#78350F';
            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 1.3;
            ctx.fillRect(8, 5, 11, 3.2);
            ctx.strokeRect(8, 5, 11, 3.2);
            ctx.fillStyle = '#F97316';
            ctx.fillRect(18, 5, 2.5, 3.2);
            break;
        case 'full_beard':
            ctx.fillStyle = '#451A03';
            ctx.beginPath();
            ctx.arc(2, 3, 12.5, 0.05 * Math.PI, 0.92 * Math.PI);
            ctx.fill();
            break;
        case 'goatee':
            ctx.fillStyle = '#3F2715';
            ctx.beginPath();
            ctx.arc(8, 9, 4.5, 0, Math.PI);
            ctx.fill();
            break;
        case 'stubble':
            ctx.fillStyle = 'rgba(30, 41, 59, 0.35)';
            ctx.beginPath();
            ctx.arc(3, 5, 10, 0.1 * Math.PI, 0.85 * Math.PI);
            ctx.fill();
            break;
        case 'war_grin':
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(3, 4.5, 9, 4.5, 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'respirator':
            ctx.fillStyle = '#334155';
            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.roundRect(3, 2, 12, 9, 3);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#F59E0B';
            ctx.beginPath();
            ctx.arc(10, 6.5, 2.5, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'skull_bandana':
            ctx.fillStyle = '#18181B';
            ctx.beginPath();
            ctx.roundRect(-6, 2, 20, 11, 3);
            ctx.fill();
            ctx.fillStyle = '#F8FAFC';
            ctx.fillRect(5, 5, 2, 5);
            ctx.fillRect(9, 5, 2, 5);
            break;
        case 'whistle':
            ctx.fillStyle = '#CBD5E1';
            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.roundRect(8, 5, 9, 4, 2);
            ctx.fill();
            ctx.stroke();
            break;
        default:
            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(4, 6);
            ctx.lineTo(10, 5.5);
            ctx.stroke();
    }
    ctx.restore();
}
function drawEyewearLayer(ctx, eyewear) {
    if (eyewear === 'none') return;
    ctx.save();
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 1.6;
    switch(eyewear){
        case 'aviators':
            ctx.fillStyle = '#0F172A';
            ctx.beginPath();
            ctx.roundRect(1, -5.5, 11.5, 6.5, 2.5);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.fillRect(3, -4.5, 3, 2);
            break;
        case 'tactical_goggles':
            ctx.fillStyle = '#F59E0B';
            ctx.beginPath();
            ctx.roundRect(0, -6.5, 12.5, 7, 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'nvg':
            ctx.fillStyle = '#1E293B';
            ctx.fillRect(2, -7.5, 13, 7);
            ctx.strokeRect(2, -7.5, 13, 7);
            ctx.fillStyle = '#22C55E';
            ctx.beginPath();
            ctx.arc(8, -4, 2.4, 0, Math.PI * 2);
            ctx.arc(13, -4, 2.2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'cyber_visor':
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.roundRect(1, -5.5, 13, 4.5, 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'eyepatch':
            ctx.fillStyle = '#09090B';
            ctx.beginPath();
            ctx.arc(6, -2, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-12, -8);
            ctx.lineTo(10, -2);
            ctx.stroke();
            break;
        case 'monocle':
            ctx.strokeStyle = '#FACC15';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(6, -2, 4.5, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 'ski_goggles':
            ctx.fillStyle = '#38BDF8';
            ctx.beginPath();
            ctx.roundRect(0, -6, 13, 7, 3);
            ctx.fill();
            ctx.stroke();
            break;
        case 'battle_paint':
            ctx.fillStyle = '#14532D';
            ctx.fillRect(2, 1.5, 9, 2.2);
            break;
        case 'bandage':
            ctx.fillStyle = '#F8FAFC';
            ctx.fillRect(-13, -7, 26, 4);
            ctx.strokeRect(-13, -7, 26, 4);
            break;
    }
    ctx.restore();
}
function drawHeadgearLayer(ctx, gear, teamAccent) {
    ctx.save();
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2.4;
    switch(gear){
        case 'bald':
            break;
        case 'buzzcut':
            ctx.fillStyle = '#27272A';
            ctx.beginPath();
            ctx.arc(0, -2, 14.2, Math.PI * 1.05, Math.PI * 1.95);
            ctx.fill();
            break;
        case 'spiked_hair':
            ctx.fillStyle = '#18181B';
            ctx.beginPath();
            ctx.moveTo(-13, -6);
            ctx.lineTo(-9, -22);
            ctx.lineTo(-2, -14);
            ctx.lineTo(3, -24);
            ctx.lineTo(8, -14);
            ctx.lineTo(14, -19);
            ctx.lineTo(13, -6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'mohawk':
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.moveTo(-8, -12);
            ctx.lineTo(-4, -25);
            ctx.lineTo(4, -24);
            ctx.lineTo(9, -12);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'red_beret':
            ctx.fillStyle = '#B91C1C';
            ctx.beginPath();
            ctx.ellipse(-2, -13, 15, 7, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'commando_bandana':
            ctx.fillStyle = teamAccent;
            ctx.fillRect(-14.5, -10, 29, 5.5);
            ctx.strokeRect(-14.5, -10, 29, 5.5);
            ctx.beginPath();
            ctx.moveTo(-14, -8);
            ctx.lineTo(-23, -4);
            ctx.lineTo(-21, -11);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'swat_helmet':
            ctx.fillStyle = '#1F2937';
            ctx.beginPath();
            ctx.arc(0, -3, 16, Math.PI, 0);
            ctx.lineTo(17, -2);
            ctx.lineTo(-17, -2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'pilot_cap':
            ctx.fillStyle = '#78350F';
            ctx.beginPath();
            ctx.arc(0, -2, 15.5, Math.PI * 0.9, Math.PI * 2.1);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#38BDF8';
            ctx.beginPath();
            ctx.arc(5, -12, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'viking_helm':
            ctx.fillStyle = '#64748B';
            ctx.beginPath();
            ctx.arc(0, -4, 15.5, Math.PI, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#FEF3C7';
            ctx.beginPath();
            ctx.moveTo(-12, -11);
            ctx.lineTo(-22, -23);
            ctx.lineTo(-7, -15);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(12, -11);
            ctx.lineTo(22, -23);
            ctx.lineTo(7, -15);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'ninja_hood':
            ctx.fillStyle = '#18181B';
            ctx.beginPath();
            ctx.arc(0, 0, 15.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#F7CBA4';
            ctx.beginPath();
            ctx.roundRect(0, -6.5, 13.5, 7, 3);
            ctx.fill();
            ctx.fillStyle = '#111827';
            ctx.beginPath();
            ctx.arc(6.5, -3, 2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'gas_mask':
            ctx.fillStyle = '#374151';
            ctx.beginPath();
            ctx.arc(0, 0, 15.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#4ADE80';
            ctx.beginPath();
            ctx.arc(6, -3, 4.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#1F2937';
            ctx.beginPath();
            ctx.arc(12, 6, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'skull_mask':
            ctx.fillStyle = '#F8FAFC';
            ctx.beginPath();
            ctx.arc(0, 0, 15.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#09090B';
            ctx.beginPath();
            ctx.arc(6, -2, 3.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(4, 6, 8, 2.5);
            break;
        case 'halo':
            ctx.strokeStyle = '#FDE047';
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.ellipse(0, -21, 13, 3.5, 0, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 'crown':
            ctx.fillStyle = '#FACC15';
            ctx.beginPath();
            ctx.moveTo(-11, -12);
            ctx.lineTo(-12, -23);
            ctx.lineTo(-4, -17);
            ctx.lineTo(0, -25);
            ctx.lineTo(4, -17);
            ctx.lineTo(12, -23);
            ctx.lineTo(11, -12);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'space_visor':
            ctx.fillStyle = '#F8FAFC';
            ctx.beginPath();
            ctx.arc(0, 0, 16.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#38BDF8';
            ctx.beginPath();
            ctx.arc(4, -1, 10, -Math.PI * 0.45, Math.PI * 0.45);
            ctx.fill();
            ctx.stroke();
            break;
        case 'cowboy_hat':
            ctx.fillStyle = '#92400E';
            ctx.beginPath();
            ctx.roundRect(-20, -13, 40, 4.5, 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.roundRect(-10, -23, 20, 11, 4);
            ctx.fill();
            ctx.stroke();
            break;
        case 'ghillie_hood':
            ctx.fillStyle = '#365314';
            ctx.beginPath();
            ctx.arc(0, -4, 17, Math.PI * 0.85, Math.PI * 2.15);
            ctx.fill();
            ctx.stroke();
            break;
        default:
            ctx.fillStyle = '#3E4A2E';
            ctx.beginPath();
            ctx.arc(0, -4, 16, Math.PI * 0.98, Math.PI * 2.02);
            ctx.lineTo(18, -4);
            ctx.lineTo(-18, -4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = teamAccent;
            ctx.fillRect(-14, -8, 28, 3.2);
    }
    ctx.restore();
}
function drawWeaponVector(ctx, weaponId, muzzleFlash, meleeSwing) {
    var w = (0, _weapons.getMmWeaponById)(weaponId);
    ctx.save();
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2.2;
    if (w.isShield) {
        // Riot Shield held forward vertically
        ctx.fillStyle = '#1E3A8A';
        ctx.beginPath();
        ctx.roundRect(14, -20, 9, 40, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#93C5FD';
        ctx.fillRect(15.5, -13, 6, 9);
        ctx.restore();
        return;
    }
    if (w.isMelee) {
        var swingRot = meleeSwing > 0 ? Math.sin(meleeSwing * Math.PI) * 1.65 - 0.5 : -0.35;
        ctx.rotate(swingRot);
        ctx.fillStyle = '#78350F';
        ctx.fillRect(8, -2.5, 8, 5);
        ctx.strokeRect(8, -2.5, 8, 5);
        ctx.fillStyle = '#E2E8F0';
        ctx.beginPath();
        ctx.moveTo(16, -3);
        ctx.lineTo(38, -5);
        ctx.lineTo(42, 0);
        ctx.lineTo(36, 4);
        ctx.lineTo(16, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        return;
    }
    // Hand circle
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(12, 2, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    var len = w.id === 'm93ba' || w.id === 'smaw' ? 36 : w.id === 'hunting_rifle' || w.id === 'm14' || w.id === 'minigun' || w.id === 'phasr' ? 30 : w.oneHanded ? 18 : 26;
    var h = w.id === 'smaw' || w.id === 'minigun' || w.id === 'saw_gun' ? 9 : w.oneHanded ? 5.5 : 7;
    // Receiver & Barrel
    ctx.fillStyle = w.color;
    ctx.beginPath();
    ctx.roundRect(8, -h / 2, len, h, 2);
    ctx.fill();
    ctx.stroke();
    // Accent / Scope / Sawblade
    ctx.fillStyle = w.accent;
    if (w.id === 'm93ba' || w.id === 'hunting_rifle' || w.id === 'm14') {
        ctx.fillRect(14, -h / 2 - 4, 12, 3.5);
        ctx.strokeRect(14, -h / 2 - 4, 12, 3.5);
    } else if (w.id === 'saw_gun') {
        ctx.beginPath();
        ctx.arc(8 + len, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else if (w.id === 'minigun') {
        ctx.fillRect(20, -4, 18, 2);
        ctx.fillRect(20, 2, 18, 2);
    } else {
        ctx.fillRect(14, -1.5, Math.max(6, len * 0.45), 3);
    }
    // Glowing Muzzle Flash
    if (muzzleFlash > 0) {
        ctx.save();
        ctx.translate(10 + len, 0);
        ctx.fillStyle = w.id === 'phasr' ? '#22D3EE' : w.id === 'emp_gun' ? '#60A5FA' : '#FDE047';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(14 + muzzleFlash * 8, 0);
        ctx.lineTo(0, 6);
        ctx.lineTo(5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    ctx.restore();
}
function drawParallaxBackground(ctx, w, h, biome, camX, camY, timeSec, isLobby) {
    if (isLobby === void 0) isLobby = false;
    // Layer 0 (0.0x): Sky / Deep Cavern Gradient
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    if (biome === 'jungle') {
        grad.addColorStop(0, '#1D4E7A');
        grad.addColorStop(0.55, '#5995B5');
        grad.addColorStop(1, '#98B899');
    } else if (biome === 'underground') {
        grad.addColorStop(0, '#111318');
        grad.addColorStop(0.5, '#1F2229');
        grad.addColorStop(1, '#14171C');
    } else if (biome === 'arctic') {
        grad.addColorStop(0, '#64748B');
        grad.addColorStop(0.6, '#CBD5E1');
        grad.addColorStop(1, '#E2E8F0');
    } else if (biome === 'lunar') {
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.6, '#0F172A');
        grad.addColorStop(1, '#1E293B');
    } else if (biome === 'desert') {
        grad.addColorStop(0, '#7C2D12');
        grad.addColorStop(0.5, '#D97706');
        grad.addColorStop(1, '#FDE68A');
    } else {
        grad.addColorStop(0, '#1F2937');
        grad.addColorStop(0.55, '#374151');
        grad.addColorStop(1, '#4B5563');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // Layer 1 (0.1x): Celestial / Clouds / Stars
    if (biome === 'lunar') {
        ctx.fillStyle = '#F8FAFC';
        for(var i = 0; i < 42; i++){
            var sx = ((i * 197 - camX * 0.06) % w + w) % w;
            var sy = ((i * 89 - camY * 0.04) % (h * 0.72) + h * 0.72) % (h * 0.72);
            ctx.fillRect(sx, sy, i % 3 + 1, i % 3 + 1);
        }
        // Glowing Earth suspended in sky
        var ex = w * 0.76 - camX * 0.04 % 120;
        var ey = h * 0.24;
        ctx.fillStyle = '#2563EB';
        ctx.beginPath();
        ctx.arc(ex, ey, 44, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22C55E';
        ctx.beginPath();
        ctx.arc(ex - 10, ey - 8, 16, 0, Math.PI * 2);
        ctx.arc(ex + 14, ey + 10, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(147,197,253,0.45)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(ex, ey, 46, 0, Math.PI * 2);
        ctx.stroke();
    } else if (biome !== 'underground') {
        ctx.fillStyle = biome === 'desert' ? 'rgba(254, 243, 199, 0.22)' : 'rgba(255, 255, 255, 0.22)';
        for(var i1 = 0; i1 < 7; i1++){
            var cx = ((i1 * 290 + timeSec * 14 - camX * 0.1) % (w + 260) + w + 260) % (w + 260) - 130;
            var cy = 50 + i1 % 3 * 44;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 62, 20, 0, 0, Math.PI * 2);
            ctx.ellipse(cx + 30, cy - 8, 42, 18, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    // Lobby occasional helicopter flyby
    if (isLobby) {
        var hx = timeSec * 65 % (w + 340) - 170;
        var hy = 72 + Math.sin(timeSec * 2.2) * 8;
        ctx.save();
        ctx.translate(hx, hy);
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-38, -2, 22, 4);
        ctx.fillRect(-40, -8, 4, 12);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        var blade = Math.sin(timeSec * 40) * 32;
        ctx.beginPath();
        ctx.moveTo(-blade, -12);
        ctx.lineTo(blade, -12);
        ctx.stroke();
        ctx.restore();
    }
    // Layer 2 (0.3x): Distant Mountains / Dunes / Cavern Pillars / Factories
    var hillColor = biome === 'jungle' ? '#2E4C36' : biome === 'arctic' ? '#94A3B8' : biome === 'desert' ? '#B45309' : biome === 'lunar' ? '#334155' : biome === 'underground' ? '#27272A' : '#1E293B';
    ctx.fillStyle = hillColor;
    var span = 320;
    var offset = -(camX * 0.3 % span);
    ctx.beginPath();
    ctx.moveTo(0, h);
    for(var x = offset - span; x <= w + span; x += span){
        if (biome === 'industrial') {
            ctx.lineTo(x, h * 0.56);
            ctx.lineTo(x + 90, h * 0.56);
            ctx.lineTo(x + 90, h * 0.42);
            ctx.lineTo(x + 140, h * 0.42);
            ctx.lineTo(x + 140, h * 0.62);
            ctx.lineTo(x + span, h * 0.62);
        } else if (biome === 'underground') {
            ctx.lineTo(x, h * 0.25);
            ctx.lineTo(x + 110, h * 0.44);
            ctx.lineTo(x + 210, h * 0.22);
            ctx.lineTo(x + span, h * 0.35);
        } else {
            ctx.lineTo(x, h * 0.66);
            ctx.lineTo(x + span * 0.5, h * 0.42);
            ctx.lineTo(x + span, h * 0.66);
        }
    }
    ctx.lineTo(w + span, h);
    ctx.closePath();
    ctx.fill();
    // Layer 3 (0.6x): Midground Watchtowers / Palms / Torches / Girders
    var midSpan = 420;
    var midOff = -(camX * 0.6 % midSpan);
    for(var x1 = midOff - midSpan; x1 <= w + midSpan; x1 += midSpan){
        if (biome === 'jungle') {
            // Distant watchtower with flickering amber beacon
            ctx.fillStyle = '#1E2E1D';
            ctx.fillRect(x1 + 140, h * 0.52, 10, h * 0.48);
            ctx.fillRect(x1 + 178, h * 0.52, 10, h * 0.48);
            ctx.fillRect(x1 + 132, h * 0.48, 64, 24);
            if (Math.sin(timeSec * 5 + x1) > 0) {
                ctx.fillStyle = '#F59E0B';
                ctx.beginPath();
                ctx.arc(x1 + 164, h * 0.46, 4.5, 0, Math.PI * 2);
                ctx.fill();
            }
            // Swaying palm silhouette
            var sway = Math.sin(timeSec * 1.8 + x1 * 0.01) * 6;
            ctx.strokeStyle = '#1A2E1A';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(x1 + 310, h);
            ctx.quadraticCurveTo(x1 + 300 + sway, h * 0.72, x1 + 316 + sway, h * 0.58);
            ctx.stroke();
        } else if (biome === 'underground') {
            // Glowing cavern torch
            var ty = h * 0.48;
            ctx.fillStyle = '#78350F';
            ctx.fillRect(x1 + 180, ty, 8, 28);
            var glow = 16 + Math.sin(timeSec * 12 + x1) * 4;
            ctx.fillStyle = 'rgba(251, 146, 60, 0.25)';
            ctx.beginPath();
            ctx.arc(x1 + 184, ty - 4, glow, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FACC15';
            ctx.beginPath();
            ctx.arc(x1 + 184, ty - 4, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (biome === 'desert') {
            ctx.fillStyle = '#92400E';
            ctx.beginPath();
            ctx.moveTo(x1 + 80, h);
            ctx.lineTo(x1 + 210, h * 0.54);
            ctx.lineTo(x1 + 340, h);
            ctx.closePath();
            ctx.fill();
        }
    }
}
function drawMapMiniSilhouette(ctx, map, w, h) {
    drawParallaxBackground(ctx, w, h, map.biome, 0, 0, 1.5, false);
    var sx = w / map.width;
    var sy = h / map.height;
    for(var _iterator = _create_for_of_iterator_helper_loose(map.platforms), _step; !(_step = _iterator()).done;){
        var plat = _step.value;
        ctx.fillStyle = plat.oneWay ? '#C2B280' : '#23272A';
        ctx.fillRect(plat.x * sx, plat.y * sy, Math.max(2, plat.w * sx), Math.max(2, plat.h * sy));
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1;
        ctx.strokeRect(plat.x * sx, plat.y * sy, Math.max(2, plat.w * sx), Math.max(2, plat.h * sy));
    }
    // Flag markers
    ctx.fillStyle = '#2B82D9';
    ctx.beginPath();
    ctx.arc(map.blueFlagPos.x * sx, map.blueFlagPos.y * sy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#D93829';
    ctx.beginPath();
    ctx.arc(map.redFlagPos.x * sx, map.redFlagPos.y * sy, 4, 0, Math.PI * 2);
    ctx.fill();
    // Weapon pads
    ctx.fillStyle = '#F5A623';
    for(var _iterator1 = _create_for_of_iterator_helper_loose(map.pads), _step1; !(_step1 = _iterator1()).done;){
        var pad = _step1.value;
        ctx.fillRect(pad.x * sx - 2, pad.y * sy - 2, 4, 4);
    }
}

});

})(window.ArcadeMod);
