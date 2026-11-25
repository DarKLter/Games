(function(ArcadeMod){
// === MODULE: src/games/tactical-ops-fps/TacticalOpsFPS ===
ArcadeMod.define("src/games/tactical-ops-fps/TacticalOpsFPS", function(require, module, exports) {
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
    get TacticalOpsFPS () {
        return TacticalOpsFPS;
    },
    get pickRandomNextModeIndex () {
        return pickRandomNextModeIndex;
    }
});
var _audio = require("../../core/audio");
var _emojiCache = require("../../core/emojiCache");
var _runtimeBridge = require("../../core/runtimeBridge");
var _BaseFPSGame = require("../../core/BaseFPSGame");
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
function pickRandomNextModeIndex(currentIdx, rng) {
    if (rng === void 0) rng = Math.random;
    if (currentIdx === null || currentIdx < 0 || currentIdx > 2) {
        return Math.min(2, Math.floor(rng() * 3));
    }
    var choices = [
        0,
        1,
        2
    ].filter(function(idx) {
        return idx !== currentIdx;
    });
    return choices[Math.min(choices.length - 1, Math.floor(rng() * choices.length))];
}
var TacticalOpsFPS = /*#__PURE__*/ function(BaseFPSGame) {
    "use strict";
    _inherits(TacticalOpsFPS, BaseFPSGame);
    function TacticalOpsFPS() {
        var _this;
        _this = BaseFPSGame.apply(this, arguments) || this, _this.modes = [
            'range',
            'sniper',
            'zombie'
        ], _this.modeIdx = 0, _this.mode = 'range', _this.zoomFactor = 2.4, _this.waveKills = 0, _this.waveTarget = 6, _this.phaseTimer = 20, _this.phaseDuration = 20, _this.phaseShifts = 0, _this.bullseyeHits = 0, _this.livesSaved = 0, _this.zombiesSlain = 0, _this.survivorsSaved = 0, _this.targets = [], _this.incidents = [], _this.buildings = [], _this.zombies = [], _this.rescues = [], _this.crates = [], _this.boss = null, _this.missiles = [], _this.spawnTimer = 0.25, _this.crateTimer = 5.5, _this.rescueTimer = 6.0;
        return _this;
    }
    var _proto = TacticalOpsFPS.prototype;
    _proto.init = function init() {
        this.initFPS(10, 0.85, 'shot');
        this.isScoped = false;
        this.zoomFactor = 2.4;
        this.waveKills = 0;
        this.waveTarget = 6;
        this.phaseTimer = this.phaseDuration;
        this.phaseShifts = 0;
        this.bullseyeHits = 0;
        this.livesSaved = 0;
        this.zombiesSlain = 0;
        this.survivorsSaved = 0;
        this.boss = null;
        this.missiles = [];
        this.buildings = this.makeCitySkyline();
        var initialIdx = pickRandomNextModeIndex(null);
        this.setMode(initialIdx, true);
    };
    _proto.makeCitySkyline = function makeCitySkyline() {
        var list = [];
        var count = 9;
        for(var i = 0; i < count; i++){
            list.push({
                xFrac: i / count,
                wFrac: 1 / count + 0.015,
                hFrac: 0.28 + i * 37 % 19 / 55,
                shade: i % 2 === 0 ? '#1e293b' : '#263348'
            });
        }
        return list;
    };
    _proto.syncActionButton = function syncActionButton() {
        if (this.mode === 'sniper') {
            (0, _runtimeBridge.setActionButtonLabel)(this.isScoped ? 'ZOOM×1' : 'SCOPE');
        } else {
            (0, _runtimeBridge.setActionButtonLabel)('RELOAD');
        }
    };
    _proto.spawnBossEncounter = function spawnBossEncounter() {
        var isHeli = Math.random() < 0.5;
        var hp = 14 + this.level * 4;
        this.boss = {
            active: true,
            name: isHeli ? '🚁 GUNSHIP APEX BOSS' : '🤖 TITAN JUGGERNAUT BOSS',
            icon: isHeli ? '🚁' : '🤖',
            xFrac: 0.5,
            yFrac: isHeli ? 0.28 : 0.48,
            vx: 0.24 * this.scaler.speedMult,
            hp: hp,
            maxHp: hp,
            missileCd: 3.4,
            phaseShiftCount: this.phaseShifts
        };
        this.missiles = [];
        _audio.ArcadeAudio.play('warHorn');
        this.spawnPopup(this.width / 2, this.height * 0.26, "⚠️ " + this.boss.name + "!", '#facc15');
    };
    _proto.setMode = function setMode(idx, announce) {
        if (announce === void 0) announce = true;
        this.modeIdx = (idx % 3 + 3) % 3;
        this.mode = this.modes[this.modeIdx];
        this.waveKills = 0;
        this.phaseTimer = this.phaseDuration;
        this.isScoped = false;
        this.isReloading = false;
        if (this.mode === 'range') {
            this.maxAmmo = 10;
            this.ammo = 10;
            this.reloadDuration = 0.85;
            this.sfxType = 'shot';
        } else if (this.mode === 'sniper') {
            this.maxAmmo = 6;
            this.ammo = 6;
            this.reloadDuration = 1.05;
            this.sfxType = 'sniper';
        } else {
            this.maxAmmo = 12;
            this.ammo = 12;
            this.reloadDuration = 0.9;
            this.sfxType = 'shot';
        }
        this.targets = [];
        this.incidents = [];
        this.zombies = [];
        this.rescues = [];
        this.crates = [];
        this.missiles = [];
        this.boss = null;
        this.spawnTimer = 0.2;
        this.crateTimer = 5.5;
        this.rescueTimer = 6.0;
        this.syncActionButton();
        if (this.phaseShifts > 0 && this.phaseShifts % 2 === 0) {
            this.spawnBossEncounter();
        } else if (announce) {
            _audio.ArcadeAudio.play('levelup');
            var labels = {
                range: '🎯 OPS SHIFT: TARGET RANGE!',
                sniper: '🔭 OPS SHIFT: SNIPER RESCUE!',
                zombie: '🧟 OPS SHIFT: ZOMBIE SIEGE!'
            };
            this.spawnPopup(this.width / 2, this.height * 0.34, labels[this.mode], '#ffd700');
        }
    };
    _proto.toggleScope = function toggleScope() {
        if (this.gameOver || this.isPaused) return;
        if (this.mode !== 'sniper') return;
        this.isScoped = !this.isScoped;
        this.syncActionButton();
        _audio.ArcadeAudio.play('reload');
    };
    _proto.switchToRandomNextMode = function switchToRandomNextMode() {
        this.level++;
        this.phaseShifts++;
        (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 7);
        var nextIdx = pickRandomNextModeIndex(this.modeIdx);
        this.setMode(nextIdx, true);
    };
    _proto.advanceWaveCheck = function advanceWaveCheck() {
        this.waveKills++;
        if (this.waveKills >= this.waveTarget && !this.boss) {
            this.switchToRandomNextMode();
        }
    };
    _proto.spawnTarget = function spawnTarget() {
        var lanes = [
            0.38,
            0.54,
            0.7
        ];
        var laneIdx = Math.floor(Math.random() * 3);
        var railY = this.height * lanes[laneIdx];
        var scaleFactor = 0.74 + laneIdx * 0.22;
        var r = Math.max(20, Math.min(40, Math.min(this.width, this.height) * 0.068)) * scaleFactor;
        var margin = r + 26;
        var x = margin + Math.random() * Math.max(20, this.width - margin * 2);
        var roll = Math.random();
        var kind = 'target';
        if (roll < 0.14) kind = 'coin';
        else if (roll < 0.28) kind = 'friendly';
        else if (roll < 0.54) kind = 'moving';
        var maxTtl = Math.max(2.1, (4.3 - this.level * 0.12) / this.scaler.speedMult);
        var vx = (kind === 'moving' ? (Math.random() < 0.5 ? -1 : 1) * (95 + this.level * 12) : 0) * this.scaler.speedMult;
        this.targets.push({
            x: x,
            y: railY,
            r: r,
            laneIdx: laneIdx,
            kind: kind,
            vx: vx,
            ttl: maxTtl,
            maxTtl: maxTtl,
            pop: 0
        });
    };
    _proto.spawnIncident = function spawnIncident() {
        var side = Math.random() < 0.5 ? -1 : 1;
        var margin = Math.max(58, this.width * 0.14);
        var civX = margin + Math.random() * Math.max(40, this.width - margin * 2);
        var baseY = this.height * (0.43 + Math.random() * 0.34);
        var gap = Math.max(44, Math.min(72, this.width * 0.12));
        var threatX = Math.max(36, Math.min(this.width - 36, civX + side * gap));
        var civIcons = [
            '🧑‍⚕️',
            '👩',
            '🧑'
        ];
        var badIcons = [
            '🦹',
            '🥷',
            '🤖'
        ];
        var maxTtl = Math.max(2.7, (5.4 - this.level * 0.15) / this.scaler.speedMult);
        this.incidents.push({
            civX: civX,
            civY: baseY,
            threatX: threatX,
            threatY: baseY - (Math.random() * 14 - 7),
            vx: this.level >= 2 && Math.random() < 0.45 ? Math.random() < 0.5 ? -28 : 28 : 0,
            r: Math.max(20, Math.min(30, Math.min(this.width, this.height) * 0.048)),
            civIcon: civIcons[Math.floor(Math.random() * civIcons.length)],
            badIcon: badIcons[Math.floor(Math.random() * badIcons.length)],
            ttl: maxTtl,
            maxTtl: maxTtl
        });
    };
    _proto.spawnZombie = function spawnZombie() {
        var laneX = (Math.random() - 0.5) * 1.45;
        var roll = Math.random();
        var icon = '🧟';
        var hp = 1;
        var speed = 0.145;
        var pts = 25;
        if (this.level >= 2 && roll < 0.28) {
            icon = '🧟‍♂️';
            hp = 1;
            speed = 0.205;
            pts = 35;
        } else if (this.level >= 3 && roll > 0.8) {
            icon = '👹';
            hp = 3;
            speed = 0.105;
            pts = 75;
        }
        speed *= this.scaler.speedMult * (1 + this.level * 0.045);
        this.zombies.push({
            laneX: laneX,
            z: 1.0,
            hp: hp,
            maxHp: hp,
            icon: icon,
            speed: speed,
            pts: pts,
            wobble: Math.random() * 6
        });
    };
    _proto.projectZ = function projectZ(laneX, z) {
        var _this_getCamOffset = this.getCamOffset(24), cx = _this_getCamOffset.cx, cy = _this_getCamOffset.cy;
        var horizY = this.height * 0.35 + cy * 0.4;
        var groundBottom = this.height * 0.84 + cy * 0.8;
        var depthT = Math.max(0.08, 1 - z);
        var screenY = horizY + (groundBottom - horizY) * depthT;
        var spread = this.width * 0.46 * depthT;
        var screenX = this.width / 2 + cx * depthT + laneX * spread;
        var size = Math.max(18, Math.min(96, Math.min(this.width, this.height) * (0.045 + 0.145 * depthT)));
        return {
            x: screenX,
            y: screenY - size * 0.45,
            size: size
        };
    };
    _proto.update = function update(dt) {
        if (this.gameOver) return;
        this.updateFPSBase(dt);
        // Boss Movement & Shootable Incoming Missiles
        if (this.boss && this.boss.active) {
            this.boss.xFrac += this.boss.vx * dt;
            if (this.boss.xFrac < 0.16 || this.boss.xFrac > 0.84) {
                this.boss.vx *= -1;
                this.boss.xFrac = Math.max(0.16, Math.min(0.84, this.boss.xFrac));
            }
            this.boss.missileCd -= dt;
            if (this.boss.missileCd <= 0) {
                this.boss.missileCd = Math.max(1.8, 3.6 - this.level * 0.2);
                this.missiles.push({
                    xFrac: this.boss.xFrac,
                    yFrac: this.boss.yFrac + 0.06,
                    size: 18,
                    ttl: 2.8
                });
            }
            for(var i = this.missiles.length - 1; i >= 0; i--){
                var m = this.missiles[i];
                m.ttl -= dt;
                m.size += dt * 15;
                m.yFrac += dt * 0.08;
                if (m.ttl <= 0) {
                    this.missiles.splice(i, 1);
                    this.lives--;
                    this.damageFlash = 1;
                    _audio.ArcadeAudio.play('explosion');
                    this.triggerShake(9, 0.2);
                    this.spawnPopup(this.width / 2, this.height * 0.42, '💥 BOSS MISSILE HIT!', '#ef4444');
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                    if (this.lives <= 0) {
                        this.gameOverSequence();
                        return;
                    }
                }
            }
        } else {
            this.phaseTimer -= dt;
            if (this.phaseTimer <= 0) {
                this.switchToRandomNextMode();
                return;
            }
        }
        this.spawnTimer -= dt;
        if (this.mode === 'range') {
            var maxActive = Math.min(6, 2 + Math.floor(this.level / 2));
            if (this.spawnTimer <= 0 && this.targets.length < maxActive) {
                this.spawnTarget();
                this.spawnTimer = Math.max(0.45, (1.12 - this.level * 0.05) / this.scaler.spawnMult);
            }
            var _this_getCamOffset = this.getCamOffset(22), cx = _this_getCamOffset.cx, cy = _this_getCamOffset.cy;
            for(var i1 = this.targets.length - 1; i1 >= 0; i1--){
                var t = this.targets[i1];
                t.pop = Math.min(1, t.pop + dt * 8);
                t.y = this.height * [
                    0.38,
                    0.54,
                    0.7
                ][t.laneIdx] + cy * (0.5 + t.laneIdx * 0.25);
                if (t.vx) {
                    t.x += t.vx * dt;
                    if (t.x < t.r + 22 || t.x > this.width - t.r - 22) t.vx *= -1;
                }
                t.ttl -= dt;
                if (t.ttl <= 0) {
                    if (t.kind === 'target' || t.kind === 'moving') {
                        this.lives--;
                        this.streak = 0;
                        this.damageFlash = 0.7;
                        _audio.ArcadeAudio.play('hurt');
                        this.triggerShake(6, 0.15);
                        this.spawnPopup(t.x + cx, t.y - t.r, 'MISSED!', '#ff6b6b');
                        (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                        if (this.lives <= 0) {
                            this.gameOverSequence();
                            return;
                        }
                    }
                    this.targets.splice(i1, 1);
                }
            }
        } else if (this.mode === 'sniper') {
            var maxInc = Math.min(4, 1 + Math.floor(this.level / 2));
            if (this.spawnTimer <= 0 && this.incidents.length < maxInc) {
                this.spawnIncident();
                this.spawnTimer = Math.max(0.75, (1.8 - this.level * 0.07) / this.scaler.spawnMult);
            }
            for(var i2 = this.incidents.length - 1; i2 >= 0; i2--){
                var inc = this.incidents[i2];
                if (inc.vx) {
                    inc.threatX += inc.vx * dt;
                    inc.civX += inc.vx * dt * 0.5;
                    if (inc.threatX < 40 || inc.threatX > this.width - 40) inc.vx *= -1;
                }
                inc.ttl -= dt;
                if (inc.ttl <= 0) {
                    this.incidents.splice(i2, 1);
                    this.lives--;
                    this.streak = 0;
                    this.damageFlash = 1;
                    _audio.ArcadeAudio.play('hurt');
                    this.triggerShake(7, 0.16);
                    this.spawnPopup(inc.civX, inc.civY - 22, '💔 LIFE LOST!', '#ff4757');
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                    if (this.lives <= 0) {
                        this.gameOverSequence();
                        return;
                    }
                }
            }
        } else {
            this.crateTimer -= dt;
            this.rescueTimer -= dt;
            var maxZ = Math.min(9, 3 + this.level);
            if (this.spawnTimer <= 0 && this.zombies.length < maxZ) {
                this.spawnZombie();
                this.spawnTimer = Math.max(0.45, (1.42 - this.level * 0.07) / this.scaler.spawnMult);
            }
            if (this.crateTimer <= 0) {
                this.crateTimer = 8 + Math.random() * 5;
                this.crates.push({
                    laneX: (Math.random() - 0.5) * 1.1,
                    z: 0.72,
                    ttl: 4.5
                });
            }
            if (this.rescueTimer <= 0) {
                this.rescueTimer = 8.5 + Math.random() * 5;
                var side = Math.random() < 0.5 ? -1 : 1;
                this.rescues.push({
                    xFrac: side < 0 ? 0.08 : 0.92,
                    dir: -side,
                    z: 0.52,
                    ttl: 5.0
                });
            }
            for(var i3 = this.zombies.length - 1; i3 >= 0; i3--){
                var zb = this.zombies[i3];
                zb.z -= zb.speed * dt;
                zb.wobble += dt * 7;
                if (zb.z <= 0.1) {
                    this.lives--;
                    this.streak = 0;
                    this.damageFlash = 1;
                    _audio.ArcadeAudio.play('hurt');
                    this.triggerShake(8, 0.18);
                    zb.z = 0.44;
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                    var p = this.projectZ(zb.laneX, zb.z);
                    this.spawnPopup(p.x, p.y - 20, 'BREACHED! -1❤️', '#ff4757');
                    if (this.lives <= 0) {
                        this.gameOverSequence();
                        return;
                    }
                }
            }
            for(var i4 = this.crates.length - 1; i4 >= 0; i4--){
                this.crates[i4].ttl -= dt;
                if (this.crates[i4].ttl <= 0) this.crates.splice(i4, 1);
            }
            for(var i5 = this.rescues.length - 1; i5 >= 0; i5--){
                var r = this.rescues[i5];
                r.xFrac += r.dir * 0.16 * dt;
                r.ttl -= dt;
                if (r.xFrac < 0 || r.xFrac > 1 || r.ttl <= 0) this.rescues.splice(i5, 1);
            }
        }
    };
    _proto.screenToWorld = function screenToWorld(sx, sy, pointerType, prevAimX, prevAimY) {
        if (pointerType === void 0) pointerType = 'mouse';
        if (prevAimX === void 0) prevAimX = sx;
        if (prevAimY === void 0) prevAimY = sy;
        var _this_getCamOffset = this.getCamOffset(26), cx = _this_getCamOffset.cx, cy = _this_getCamOffset.cy;
        if (this.isScoped && pointerType === 'touch') {
            var swayX = Math.sin(this.clockTime * 2.4) * 5;
            var swayY = Math.cos(this.clockTime * 3.1) * 4;
            var lensCx = prevAimX + swayX;
            var lensCy = prevAimY + swayY;
            var lensR = Math.max(85, Math.min(this.width, this.height) * 0.36);
            if (Math.hypot(sx - lensCx, sy - lensCy) <= lensR) {
                var unzoomedX = lensCx + (sx - lensCx) / this.zoomFactor;
                var unzoomedY = lensCy + (sy - lensCy) / this.zoomFactor;
                return {
                    wx: unzoomedX - cx,
                    wy: unzoomedY - cy
                };
            }
        }
        return {
            wx: sx - cx,
            wy: sy - cy
        };
    };
    _proto.onFire = function onFire(sx, sy, pointerType, prevAimX, prevAimY) {
        if (pointerType === void 0) pointerType = 'mouse';
        if (prevAimX === void 0) prevAimX = sx;
        if (prevAimY === void 0) prevAimY = sy;
        // Shootable Boss Missiles take top priority
        for(var i = this.missiles.length - 1; i >= 0; i--){
            var m = this.missiles[i];
            var mx = m.xFrac * this.width;
            var my = m.yFrac * this.height;
            if (Math.hypot(sx - mx, sy - my) <= m.size + 14) {
                this.missiles.splice(i, 1);
                this.score += 60;
                (0, _runtimeBridge.addCoins)(2);
                _audio.ArcadeAudio.play('hit');
                this.spawnParticles(mx, my, '#facc15', 10, 170);
                this.spawnPopup(mx, my - 12, '🚀 INTERCEPT +60', '#84fab0');
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 7);
                return 'crit';
            }
        }
        // Armored Boss Target Check
        if (this.boss && this.boss.active) {
            var bx = this.boss.xFrac * this.width;
            var by = this.boss.yFrac * this.height;
            if (Math.hypot(sx - bx, sy - by) <= 52) {
                var isWeakspot = Math.abs(sx - bx) < 18 && sy <= by;
                var dmg = isWeakspot ? 3 : 1;
                this.boss.hp -= dmg;
                this.score += isWeakspot ? 45 : 20;
                _audio.ArcadeAudio.play(isWeakspot ? 'headshot' : 'hit');
                this.spawnParticles(sx, sy, isWeakspot ? '#facc15' : '#fb923c', 10, 160);
                if (this.boss.hp <= 0) {
                    this.boss = null;
                    this.missiles = [];
                    this.score += 350;
                    (0, _runtimeBridge.addCoins)(15);
                    (0, _runtimeBridge.addXp)(35);
                    _audio.ArcadeAudio.play('win');
                    this.spawnPopup(bx, by, '🏆 BOSS DESTROYED! +350 (+15🪙)', '#facc15');
                    (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 7);
                    this.switchToRandomNextMode();
                    return 'crit';
                }
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 7);
                this.spawnPopup(sx, sy - 14, isWeakspot ? 'CRIT ×3!' : 'HIT', '#facc15');
                return isWeakspot ? 'crit' : 'hit';
            }
        }
        if (this.mode === 'range') {
            var cx = this.getCamOffset(22).cx;
            for(var i1 = this.targets.length - 1; i1 >= 0; i1--){
                var t = this.targets[i1];
                var tx = t.x + cx * (0.5 + t.laneIdx * 0.25);
                var dist = Math.hypot(sx - tx, sy - t.y);
                if (dist <= t.r + 12) {
                    if (t.kind === 'friendly') {
                        this.targets.splice(i1, 1);
                        this.lives--;
                        this.streak = 0;
                        this.damageFlash = 1;
                        _audio.ArcadeAudio.play('hurt');
                        this.triggerShake(7, 0.16);
                        this.spawnParticles(tx, t.y, '#ff4757', 12, 180);
                        this.spawnPopup(tx, t.y - 16, 'FRIENDLY! -1❤️', '#ff4757');
                        (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                        if (this.lives <= 0) this.gameOverSequence();
                        return 'bad';
                    }
                    if (t.kind === 'coin') {
                        this.targets.splice(i1, 1);
                        this.streak++;
                        (0, _runtimeBridge.addCoins)(3);
                        this.score += 30;
                        (0, _runtimeBridge.addXp)(8);
                        _audio.ArcadeAudio.play('save');
                        (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 7);
                        this.spawnParticles(tx, t.y, '#ffd700', 12, 190);
                        this.spawnPopup(tx, t.y - 16, '+3🪙 GOLD!', '#ffd700');
                        return 'crit';
                    }
                    var isBullseye = dist <= t.r * 0.44;
                    this.targets.splice(i1, 1);
                    this.streak++;
                    var basePts = (t.kind === 'moving' ? 30 : 20) + (2 - t.laneIdx) * 10;
                    var mult = Math.min(4, 1 + Math.floor(this.streak / 3)) * (isBullseye ? 2 : 1);
                    var pts = basePts * mult;
                    this.score += pts;
                    if (isBullseye) {
                        this.bullseyeHits++;
                        (0, _runtimeBridge.addCoins)(1);
                        (0, _runtimeBridge.addXp)(6);
                        _audio.ArcadeAudio.play('headshot');
                    } else {
                        (0, _runtimeBridge.addXp)(3);
                        _audio.ArcadeAudio.play('hit');
                    }
                    (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 7);
                    this.spawnParticles(tx, t.y, isBullseye ? '#ffd700' : '#ff6b6b', 10, 175);
                    this.spawnPopup(tx, t.y - 16, isBullseye ? "\uD83C\uDFAF BULLSEYE +" + pts : "+" + pts, isBullseye ? '#ffd700' : '#84fab0');
                    this.advanceWaveCheck();
                    return isBullseye ? 'crit' : 'hit';
                }
            }
            this.streak = 0;
            return false;
        }
        if (this.mode === 'sniper') {
            var _this_screenToWorld = this.screenToWorld(sx, sy, pointerType, prevAimX, prevAimY), wx = _this_screenToWorld.wx, wy = _this_screenToWorld.wy;
            for(var i2 = this.incidents.length - 1; i2 >= 0; i2--){
                var inc = this.incidents[i2];
                var hitDist = Math.hypot(wx - inc.threatX, wy - inc.threatY);
                if (hitDist <= inc.r + 12) {
                    var isHeadshot = wy < inc.threatY - inc.r * 0.15 || hitDist <= inc.r * 0.45;
                    this.incidents.splice(i2, 1);
                    this.livesSaved++;
                    this.streak++;
                    var rounded = Math.round((isHeadshot ? 80 : 45) * (this.isScoped ? 1.5 : 1));
                    this.score += rounded;
                    var coins = isHeadshot || this.isScoped ? 3 : 2;
                    (0, _runtimeBridge.addCoins)(coins);
                    (0, _runtimeBridge.addXp)(isHeadshot ? 12 : 8);
                    (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 7);
                    _audio.ArcadeAudio.play(isHeadshot ? 'headshot' : 'save');
                    this.spawnParticles(sx, sy, '#2ecc71', 12, 180);
                    this.spawnPopup(sx, sy - 18, "\uD83D\uDC9A SAVED! +" + rounded + " (+" + coins + "\uD83E\uDE99)", isHeadshot ? '#ffd700' : '#84fab0');
                    this.advanceWaveCheck();
                    return isHeadshot ? 'crit' : 'hit';
                }
                if (Math.hypot(wx - inc.civX, wy - inc.civY) <= inc.r + 4) {
                    this.incidents.splice(i2, 1);
                    this.lives--;
                    this.streak = 0;
                    this.damageFlash = 1;
                    _audio.ArcadeAudio.play('hurt');
                    this.triggerShake(8, 0.18);
                    this.spawnParticles(sx, sy, '#ff4757', 14, 190);
                    this.spawnPopup(sx, sy - 18, '⚠️ CIVILIAN HIT! -1❤️', '#ff4757');
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                    if (this.lives <= 0) this.gameOverSequence();
                    return 'bad';
                }
            }
            this.streak = 0;
            return false;
        }
        for(var i3 = this.crates.length - 1; i3 >= 0; i3--){
            var c = this.crates[i3];
            var p = this.projectZ(c.laneX, c.z);
            if (Math.hypot(sx - p.x, sy - p.y) <= p.size * 0.75 + 12) {
                this.crates.splice(i3, 1);
                this.ammo = this.maxAmmo;
                this.isReloading = false;
                if (this.lives < this.maxLives) {
                    this.lives++;
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                }
                (0, _runtimeBridge.addCoins)(4);
                this.score += 40;
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 7);
                _audio.ArcadeAudio.play('save');
                this.spawnParticles(p.x, p.y, '#2ecc71', 12, 170);
                this.spawnPopup(p.x, p.y - 14, '🧰 HEAL +4🪙', '#84fab0');
                return 'crit';
            }
        }
        var bestIdx = -1;
        var bestZ = Infinity;
        var bestHitP = null;
        for(var idx = 0; idx < this.zombies.length; idx++){
            var zb = this.zombies[idx];
            if (zb.z >= bestZ) continue;
            var p1 = this.projectZ(zb.laneX, zb.z);
            var hitR = p1.size * 0.62 + 12;
            if (Math.hypot(sx - p1.x, sy - p1.y) <= hitR) {
                bestZ = zb.z;
                bestIdx = idx;
                bestHitP = p1;
            }
        }
        if (bestIdx >= 0 && bestHitP) {
            var zb1 = this.zombies[bestIdx];
            var p2 = bestHitP;
            var isHead = sy - p2.y < -p2.size * 0.12;
            zb1.hp -= isHead ? 2 : 1;
            zb1.z = Math.min(0.95, zb1.z + 0.12);
            if (zb1.hp <= 0) {
                this.zombies.splice(bestIdx, 1);
                this.zombiesSlain++;
                this.streak++;
                var rescueBonus = 0;
                if (this.rescues.length > 0) {
                    this.rescues.pop();
                    this.survivorsSaved++;
                    rescueBonus = 40;
                    (0, _runtimeBridge.addCoins)(2);
                }
                var pts1 = zb1.pts * (isHead ? 2 : 1) + rescueBonus;
                this.score += pts1;
                (0, _runtimeBridge.addCoins)(isHead ? 2 : 1);
                (0, _runtimeBridge.addXp)(isHead ? 10 : 5);
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 7);
                _audio.ArcadeAudio.play(isHead ? 'headshot' : 'hit');
                this.spawnParticles(p2.x, p2.y, isHead ? '#ffd700' : '#2ecc71', 11, 185);
                this.spawnPopup(p2.x, p2.y - 18, rescueBonus ? "\uD83D\uDC9A SAVED +" + pts1 : isHead ? "\uD83D\uDC80 HEADSHOT +" + pts1 : "+" + pts1, isHead ? '#ffd700' : '#84fab0');
                this.advanceWaveCheck();
                return isHead ? 'crit' : 'hit';
            }
            _audio.ArcadeAudio.play('zombieHit');
            this.spawnParticles(p2.x, p2.y, '#ff9f43', 7, 130);
            this.spawnPopup(p2.x, p2.y - 16, isHead ? 'CRIT!' : 'HIT', '#ffd700');
            return isHead ? 'crit' : 'hit';
        }
        this.streak = 0;
        return false;
    };
    _proto.drawSniperWorld = function drawSniperWorld(ctx, offsetX, offsetY) {
        var ox = Math.round(offsetX);
        var oy = Math.round(offsetY);
        var horizY = Math.round(this.height * 0.48 + oy * 0.4);
        ctx.fillStyle = '#0b1026';
        ctx.fillRect(0, 0, this.width, Math.round(horizY * 0.55));
        ctx.fillStyle = '#1e2547';
        ctx.fillRect(0, Math.round(horizY * 0.55), this.width, Math.max(0, horizY - Math.round(horizY * 0.55)));
        for(var _iterator = _create_for_of_iterator_helper_loose(this.buildings), _step; !(_step = _iterator()).done;){
            var b = _step.value;
            var bx = Math.round(b.xFrac * this.width + ox * 0.45);
            var bw = Math.round(b.wFrac * this.width);
            var bh = Math.round(b.hFrac * this.height);
            var by = Math.round(this.height * 0.5 - bh + oy * 0.4);
            ctx.fillStyle = b.shade;
            ctx.fillRect(bx, by, bw, bh + 30);
        }
        ctx.fillStyle = 'rgba(255, 215, 100, 0.25)';
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.buildings), _step1; !(_step1 = _iterator1()).done;){
            var b1 = _step1.value;
            var bx1 = Math.round(b1.xFrac * this.width + ox * 0.45);
            var bw1 = Math.round(b1.wFrac * this.width);
            var bh1 = Math.round(b1.hFrac * this.height);
            var by1 = Math.round(this.height * 0.5 - bh1 + oy * 0.4);
            var ww = Math.max(6, Math.round(bw1 * 0.18));
            for(var wy = by1 + 14; wy < by1 + bh1 - 14; wy += 34){
                ctx.fillRect(bx1 + 8, wy, ww, 9);
                ctx.fillRect(bx1 + Math.round(bw1 * 0.55), wy, ww, 9);
            }
        }
        var floorY = Math.round(this.height * 0.46 + oy * 0.5);
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(0, floorY, this.width, this.height - floorY);
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, floorY, this.width, 6);
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.incidents), _step2; !(_step2 = _iterator2()).done;){
            var inc = _step2.value;
            var cx = inc.civX + offsetX;
            var cy = inc.civY + offsetY;
            var tx = inc.threatX + offsetX;
            var ty = inc.threatY + offsetY;
            var ratio = Math.max(0, inc.ttl / inc.maxTtl);
            ctx.strokeStyle = ratio > 0.35 ? 'rgba(231, 76, 60, 0.7)' : '#ff4757';
            ctx.lineWidth = 2;
            ctx.setLineDash([
                5,
                4
            ]);
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(cx, cy);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(46, 204, 113, 0.22)';
            ctx.beginPath();
            ctx.arc(cx, cy, inc.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 2;
            ctx.stroke();
            _emojiCache.EmojiCache.draw(ctx, inc.civIcon, cx, cy, Math.round(inc.r * 1.4));
            ctx.font = '800 10px system-ui, sans-serif';
            ctx.fillStyle = '#84fab0';
            ctx.textAlign = 'center';
            ctx.fillText('🆘 SAVE', cx, cy - inc.r - 5);
            ctx.fillStyle = 'rgba(231, 76, 60, 0.26)';
            ctx.beginPath();
            ctx.arc(tx, ty, inc.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ff4757';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(tx, ty, inc.r + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
            ctx.stroke();
            _emojiCache.EmojiCache.draw(ctx, inc.badIcon, tx, ty, Math.round(inc.r * 1.45));
        }
    };
    _proto.drawBossLayer = function drawBossLayer(ctx) {
        if (!this.boss || !this.boss.active) return;
        var bx = this.boss.xFrac * this.width;
        var by = this.boss.yFrac * this.height;
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(bx, by, 44, 0, Math.PI * 2);
        ctx.stroke();
        _emojiCache.EmojiCache.draw(ctx, this.boss.icon, bx, by, 68);
        var bw = Math.min(200, this.width * 0.45);
        var bBarY = this.width < 460 ? 58 : 48;
        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        ctx.beginPath();
        ctx.roundRect((this.width - bw) / 2, bBarY, bw, 14, 7);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect((this.width - bw) / 2 + 2, bBarY + 2, (bw - 4) * Math.max(0, this.boss.hp / this.boss.maxHp), 10, 5);
        ctx.fill();
        ctx.font = '800 9.5px system-ui, sans-serif';
        ctx.fillStyle = '#facc15';
        ctx.textAlign = 'center';
        ctx.fillText(this.boss.name, this.width / 2, bBarY + 25);
        ctx.textAlign = 'left';
        for(var _iterator = _create_for_of_iterator_helper_loose(this.missiles), _step; !(_step = _iterator()).done;){
            var m = _step.value;
            var mx = m.xFrac * this.width;
            var my = m.yFrac * this.height;
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(mx, my, m.size, 0, Math.PI * 2);
            ctx.stroke();
            _emojiCache.EmojiCache.draw(ctx, '🚀', mx, my, Math.round(m.size * 1.3));
        }
    };
    _proto.draw = function draw() {
        var _this = this;
        var ctx = this.ctx;
        var phaseLeft = Math.max(1, Math.ceil(this.phaseTimer));
        if (this.mode === 'range') {
            var _this_getCamOffset = this.getCamOffset(22), cx = _this_getCamOffset.cx, cy = _this_getCamOffset.cy;
            var horizY = Math.round(this.height * 0.3 + cy * 0.35);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, this.width, Math.round(horizY * 0.55));
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, Math.round(horizY * 0.55), this.width, Math.max(0, horizY - Math.round(horizY * 0.55)));
            ctx.fillStyle = '#27303f';
            ctx.fillRect(0, horizY, this.width, Math.round((this.height - horizY) * 0.45));
            ctx.fillStyle = '#111827';
            ctx.fillRect(0, Math.round(horizY + (this.height - horizY) * 0.45), this.width, this.height - Math.round(horizY + (this.height - horizY) * 0.45));
            var vpX = this.width / 2 + cx * 0.4;
            ctx.strokeStyle = 'rgba(132, 250, 176, 0.14)';
            ctx.lineWidth = 1.5;
            for(var k = -3; k <= 3; k++){
                ctx.beginPath();
                ctx.moveTo(vpX + k * (this.width * 0.06), horizY);
                ctx.lineTo(vpX + k * (this.width * 0.28), this.height);
                ctx.stroke();
            }
            [
                0.38,
                0.54,
                0.7
            ].forEach(function(frac, idx) {
                var ry = _this.height * frac + cy * (0.5 + idx * 0.25) + 12;
                ctx.fillStyle = 'rgba(255,255,255,0.12)';
                ctx.fillRect(0, ry, _this.width, 4);
            });
            var sortedTargets = [].concat(this.targets).sort(function(a, b) {
                return a.laneIdx - b.laneIdx;
            });
            for(var _iterator = _create_for_of_iterator_helper_loose(sortedTargets), _step; !(_step = _iterator()).done;){
                var t = _step.value;
                var tx = t.x + cx * (0.5 + t.laneIdx * 0.25);
                ctx.save();
                ctx.translate(tx, t.y);
                ctx.scale(t.pop, t.pop);
                ctx.fillStyle = '#475569';
                ctx.fillRect(-3, t.r * 0.6, 6, 22);
                if (t.kind === 'coin') {
                    _emojiCache.EmojiCache.draw(ctx, '🪙', 0, 0, Math.round(t.r * 1.4));
                } else if (t.kind === 'friendly') {
                    ctx.fillStyle = '#27ae60';
                    ctx.beginPath();
                    ctx.arc(0, 0, t.r, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2.5;
                    ctx.stroke();
                    _emojiCache.EmojiCache.draw(ctx, '🙋', 0, -2, Math.round(t.r * 1.15));
                } else {
                    ctx.fillStyle = '#e74c3c';
                    ctx.beginPath();
                    ctx.arc(0, 0, t.r, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(0, 0, t.r * 0.68, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#e74c3c';
                    ctx.beginPath();
                    ctx.arc(0, 0, t.r * 0.38, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#ffd700';
                    ctx.beginPath();
                    ctx.arc(0, 0, t.r * 0.16, 0, Math.PI * 2);
                    ctx.fill();
                    var ratio = Math.max(0, t.ttl / t.maxTtl);
                    ctx.strokeStyle = ratio > 0.4 ? '#84fab0' : '#ff4757';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(0, 0, t.r + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
                    ctx.stroke();
                }
                ctx.restore();
            }
            this.drawBossLayer(ctx);
            this.drawWeaponViewmodel('#334155', '#38bdf8', 'carbine');
            this.drawCrosshair(this.aimX, this.aimY, '#84fab0', 17);
            this.drawFPSHudOverlay(this.boss ? "\uD83C\uDFAF BOSS RAID \xb7 Shoot Weakspot & Rockets!" : "\uD83C\uDFAF Range " + this.waveKills + "/" + this.waveTarget + " \xb7 Next Shift " + phaseLeft + "s \xb7 Bullseyes: " + this.bullseyeHits);
        } else if (this.mode === 'sniper') {
            var _this_getCamOffset1 = this.getCamOffset(26), cx1 = _this_getCamOffset1.cx, cy1 = _this_getCamOffset1.cy;
            this.drawSniperWorld(ctx, cx1, cy1);
            if (this.isScoped) {
                var lensR = Math.max(85, Math.min(this.width, this.height) * 0.36);
                var swayX = Math.sin(this.clockTime * 2.4) * 5;
                var swayY = Math.cos(this.clockTime * 3.1) * 4;
                var sx = this.aimX + swayX;
                var sy = this.aimY + swayY;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
                ctx.fillRect(0, 0, this.width, this.height);
                ctx.save();
                ctx.beginPath();
                ctx.arc(sx, sy, lensR, 0, Math.PI * 2);
                ctx.clip();
                ctx.translate(sx, sy);
                ctx.scale(this.zoomFactor, this.zoomFactor);
                ctx.translate(-sx, -sy);
                this.drawSniperWorld(ctx, cx1, cy1);
                ctx.restore();
                ctx.save();
                ctx.strokeStyle = '#84fab0';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(sx, sy, lensR, 0, Math.PI * 2);
                ctx.stroke();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(sx - lensR, sy);
                ctx.lineTo(sx + lensR, sy);
                ctx.moveTo(sx, sy - lensR);
                ctx.lineTo(sx, sy + lensR);
                ctx.stroke();
                ctx.fillStyle = '#ff4757';
                ctx.beginPath();
                ctx.arc(sx, sy, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else {
                this.drawWeaponViewmodel('#1e293b', '#84fab0', 'sniper');
                this.drawCrosshair(this.aimX, this.aimY, '#84fab0', 18);
            }
            this.drawBossLayer(ctx);
            this.drawFPSHudOverlay(this.boss ? "\uD83D\uDD2D BOSS RAID \xb7 Shoot Boss & Rockets!" : "\uD83D\uDD2D Sniper " + this.waveKills + "/" + this.waveTarget + " \xb7 Next Shift " + phaseLeft + "s \xb7 Saved " + this.livesSaved);
        } else {
            var _this_getCamOffset2 = this.getCamOffset(24), cx2 = _this_getCamOffset2.cx, cy2 = _this_getCamOffset2.cy;
            var horizY1 = Math.round(this.height * 0.35 + cy2 * 0.4);
            var midSky = Math.round(horizY1 * 0.52);
            ctx.fillStyle = '#070b14';
            ctx.fillRect(0, 0, this.width, midSky);
            ctx.fillStyle = '#131d2b';
            ctx.fillRect(0, midSky, this.width, Math.max(0, horizY1 - midSky));
            ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
            ctx.beginPath();
            ctx.arc(this.width * 0.78 + cx2 * 0.3, horizY1 * 0.42, Math.min(28, this.height * 0.055), 0, Math.PI * 2);
            ctx.fill();
            var midGround = Math.round(horizY1 + (this.height - horizY1) * 0.45);
            ctx.fillStyle = '#14261c';
            ctx.fillRect(0, horizY1, this.width, Math.max(0, midGround - horizY1));
            ctx.fillStyle = '#0b140f';
            ctx.fillRect(0, midGround, this.width, Math.max(0, this.height - midGround));
            var vpX1 = this.width / 2 + cx2 * 0.4;
            ctx.strokeStyle = 'rgba(46, 204, 113, 0.14)';
            ctx.lineWidth = 1.5;
            for(var k1 = -3; k1 <= 3; k1++){
                ctx.beginPath();
                ctx.moveTo(vpX1 + k1 * 24, horizY1);
                ctx.lineTo(vpX1 + k1 * (this.width * 0.25), this.height);
                ctx.stroke();
            }
            for(var _iterator1 = _create_for_of_iterator_helper_loose(this.rescues), _step1; !(_step1 = _iterator1()).done;){
                var r = _step1.value;
                var p = this.projectZ((r.xFrac - 0.5) * 1.4, r.z);
                _emojiCache.EmojiCache.draw(ctx, '🏃‍♀️', p.x, p.y, Math.round(p.size), 0, r.dir > 0 ? -1 : 1, 1);
                ctx.font = '800 10px system-ui, sans-serif';
                ctx.fillStyle = '#84fab0';
                ctx.textAlign = 'center';
                ctx.fillText('🆘 COVER ME!', p.x, p.y - p.size * 0.65);
            }
            for(var _iterator2 = _create_for_of_iterator_helper_loose(this.crates), _step2; !(_step2 = _iterator2()).done;){
                var c = _step2.value;
                var p1 = this.projectZ(c.laneX, c.z);
                _emojiCache.EmojiCache.draw(ctx, '🧰', p1.x, p1.y + Math.sin(this.clockTime * 5) * 4, Math.round(p1.size * 0.9));
            }
            var sortedZombies = [].concat(this.zombies).sort(function(a, b) {
                return b.z - a.z;
            });
            for(var _iterator3 = _create_for_of_iterator_helper_loose(sortedZombies), _step3; !(_step3 = _iterator3()).done;){
                var zb = _step3.value;
                var p2 = this.projectZ(zb.laneX, zb.z);
                var sway = Math.sin(zb.wobble) * 0.08;
                _emojiCache.EmojiCache.draw(ctx, zb.icon, p2.x, p2.y, Math.round(p2.size), sway);
                if (zb.maxHp > 1) {
                    var bw = p2.size * 0.8;
                    ctx.fillStyle = 'rgba(0,0,0,0.65)';
                    ctx.fillRect(p2.x - bw / 2, p2.y - p2.size * 0.72, bw, 5);
                    ctx.fillStyle = '#ff4757';
                    ctx.fillRect(p2.x - bw / 2, p2.y - p2.size * 0.72, bw * (zb.hp / zb.maxHp), 5);
                }
            }
            var barY = this.height - 26;
            ctx.fillStyle = '#2d241b';
            for(var sx1 = -20; sx1 < this.width + 40; sx1 += 58){
                ctx.beginPath();
                ctx.ellipse(sx1, barY + 14, 34, 18, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            this.drawBossLayer(ctx);
            this.drawWeaponViewmodel('#2c3e50', '#ff6b6b', 'carbine');
            this.drawCrosshair(this.aimX, this.aimY, '#ff6b6b', 18);
            this.drawFPSHudOverlay(this.boss ? "\uD83E\uDDDF BOSS RAID \xb7 Shoot Weakspot & Rockets!" : "\uD83E\uDDDF Siege " + this.waveKills + "/" + this.waveTarget + " \xb7 Next Shift " + phaseLeft + "s \xb7 Slain " + this.zombiesSlain);
        }
    };
    return TacticalOpsFPS;
}(_BaseFPSGame.BaseFPSGame);

});

})(window.ArcadeMod);
