(function(ArcadeMod){
// === MODULE: src/games/mini-militia/engine/GameEngine ===
ArcadeMod.define("src/games/mini-militia/engine/GameEngine", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MiniMilitiaGameEngine", {
    enumerable: true,
    get: function() {
        return MiniMilitiaGameEngine;
    }
});
var _maps = require("../data/maps");
var _weapons = require("../data/weapons");
var _progression = require("../data/progression");
var _AudioEngine = require("./AudioEngine");
var _DoodleRenderer = require("./DoodleRenderer");
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
function _instanceof(left, right) {
    "@swc/helpers - instanceof";
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else return left instanceof right;
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var FIXED_DT = 1 / 60;
var BASE_GRAVITY = 980;
var BASE_MOVE_SPEED = 275;
var JETPACK_ACCEL = 1780;
var SOLDIER_W = 24;
var SOLDIER_H = 46;
function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
}
function dist(ax, ay, bx, by) {
    return Math.hypot(bx - ax, by - ay);
}
var MiniMilitiaGameEngine = /*#__PURE__*/ function() {
    "use strict";
    function MiniMilitiaGameEngine(canvas, config, save, rankDiscountPct, onHudUpdate, onMatchFinish) {
        var _this = this;
        this.rafId = null;
        this.lastFrameTs = 0;
        this.accDt = 0;
        this.paused = false;
        this.matchEnded = false;
        this.matchTimeSec = 0;
        this.timeRemainingSec = 300;
        this.hudEmitAcc = 0;
        this.fpsSamples = 60;
        this.seq = 1;
        // World entities
        this.soldiers = [];
        this.projectiles = [];
        this.grenades = [];
        this.gasClouds = [];
        this.drops = [];
        this.pads = [];
        this.particles = [];
        this.killFeed = [];
        this.banner = null;
        // Mode states
        this.scoreBlue = 0;
        this.scoreRed = 0;
        this.ptbRound = 1;
        this.ptbBlueRounds = 0;
        this.ptbRedRounds = 0;
        this.ptbBombState = 'carried';
        this.ptbBombTimer = 30;
        this.ptbBombSite = null;
        this.ptbBombX = 0;
        this.ptbBombY = 0;
        this.ptbActionProgress = 0;
        this.survivalWave = 1;
        this.survivalWaveClearTimer = 0;
        this.bootcampStep = 0; // 0..6
        this.bootcampMovedSec = 0;
        this.bootcampFlewSec = 0;
        this.bootcampTargetsKilled = 0;
        this.bootcampZoomShotDone = false;
        this.bootcampMeleeDone = false;
        this.bootcampGrenadeDone = false;
        this.bootcampDualDone = false;
        // Player session stats & telemetry
        this.playerCoins = 0;
        this.playerRankCashEarned = 0;
        this.playerHeadshots = 0;
        this.playerMeleeKills = 0;
        this.playerGrenadeKills = 0;
        this.playerDualKills = 0;
        this.playerSniperHeadshots = 0;
        this.playerMacheteKills = 0;
        this.playerSmawKills = 0;
        this.playerFlameKills = 0;
        this.playerSawKills = 0;
        this.playerFlagCaptures = 0;
        this.playerBombActions = 0;
        this.playerSuicides = 0;
        this.weaponDeltas = {};
        // Camera
        this.camX = 600;
        this.camY = 500;
        this.currentZoom = 1.0;
        this.targetZoom = 1.0;
        this.shakeTimer = 0;
        this.shakeMag = 0;
        // Inputs (Simultaneous Keyboard+Mouse & Touch Dual-Stick)
        this.keys = new Set();
        this.mouseDown = false;
        this.rightMouseDown = false;
        this.mouseScreenX = 0;
        this.mouseScreenY = 0;
        this.mouseMoved = false;
        this.touchMoveX = 0;
        this.touchMoveY = 0;
        this.touchAimActive = false;
        this.touchAimAngle = 0;
        this.touchAimAutoFire = false;
        this.touchFireBtnDown = false;
        this.touchCrouchBtn = false;
        this.lastDownTapTs = 0;
        this.lastMatchSummary = null;
        // ==================== DESKTOP MOUSE + KEYBOARD BINDINGS ====================
        this.onKeyDown = function(e) {
            if (_instanceof(e.target, HTMLInputElement) || _instanceof(e.target, HTMLTextAreaElement)) return;
            _this.keys.add(e.code);
            if (e.code === 'KeyQ') _this.triggerSwapWeapon();
            else if (e.code === 'KeyR') _this.triggerReload();
            else if (e.code === 'KeyF') _this.triggerMelee();
            else if (e.code === 'KeyG') _this.triggerThrowGrenade();
            else if (e.code === 'KeyE') _this.triggerPickup(false);
            else if (e.code === 'KeyX') _this.triggerPickup(true);
            else if (e.code === 'KeyZ') _this.cycleZoom();
            else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') _this.triggerCombatRoll();
            else if (e.code === 'Digit1') _this.selectGrenadeType('frag');
            else if (e.code === 'Digit2') _this.selectGrenadeType('gas');
            else if (e.code === 'Digit3') _this.selectGrenadeType('proxy');
            else if (e.code === 'Digit4') _this.selectGrenadeType('emp');
        };
        this.onKeyUp = function(e) {
            _this.keys.delete(e.code);
        };
        this.onMouseMove = function(e) {
            var rect = _this.canvas.getBoundingClientRect();
            _this.mouseScreenX = (e.clientX - rect.left) / rect.width * _this.canvas.width;
            _this.mouseScreenY = (e.clientY - rect.top) / rect.height * _this.canvas.height;
            _this.mouseMoved = true;
        };
        this.onMouseDown = function(e) {
            if (e.button === 0) _this.mouseDown = true;
            if (e.button === 2) _this.rightMouseDown = true;
        };
        this.onMouseUp = function(e) {
            if (e.button === 0) _this.mouseDown = false;
            if (e.button === 2) _this.rightMouseDown = false;
        };
        this.onWheel = function(e) {
            e.preventDefault();
            _this.cycleZoom();
        };
        this.onContextMenu = function(e) {
            return e.preventDefault();
        };
        this.canvas = canvas;
        var context = canvas.getContext('2d');
        if (!context) throw new Error('2D canvas context unavailable');
        this.ctx = context;
        this.config = config;
        this.map = (0, _maps.getMmMapById)(config.mapId);
        this.settings = save.settings;
        this.allLoadouts = [].concat(_weapons.MM_PREBUILT_LOADOUTS, save.customLoadouts);
        this.rankDiscountPct = rankDiscountPct;
        this.playerCoins = save.coins;
        this.onHudUpdate = onHudUpdate;
        this.onMatchFinish = onMatchFinish;
        this.timeRemainingSec = config.mode === 'survival' || config.mode === 'bootcamp' ? 9999 : config.timeLimitSec;
        this.flags = {
            blue: {
                team: 'blue',
                homeX: this.map.blueFlagPos.x,
                homeY: this.map.blueFlagPos.y,
                x: this.map.blueFlagPos.x,
                y: this.map.blueFlagPos.y,
                carrierId: null,
                droppedTimer: 0
            },
            red: {
                team: 'red',
                homeX: this.map.redFlagPos.x,
                homeY: this.map.redFlagPos.y,
                x: this.map.redFlagPos.x,
                y: this.map.redFlagPos.y,
                carrierId: null,
                droppedTimer: 0
            }
        };
        this.initPads();
        this.initSoldiers(save);
        this.bindDesktopInputs();
        var p = this.getPlayer();
        if (p) {
            this.camX = p.x;
            this.camY = p.y;
        }
    }
    var _proto = MiniMilitiaGameEngine.prototype;
    _proto.start = function start() {
        var _this = this;
        this.lastFrameTs = performance.now();
        var tick = function tick1(ts) {
            var rawDt = Math.min(0.05, Math.max(0.001, (ts - _this.lastFrameTs) / 1000));
            _this.lastFrameTs = ts;
            _this.fpsSamples = _this.fpsSamples * 0.9 + 1 / rawDt * 0.1;
            if (!_this.paused && !_this.matchEnded) {
                _this.accDt += rawDt;
                while(_this.accDt >= FIXED_DT){
                    _this.stepSimulation(FIXED_DT);
                    _this.accDt -= FIXED_DT;
                }
            }
            _this.renderFrame();
            _this.hudEmitAcc += rawDt;
            if (_this.hudEmitAcc >= 0.06) {
                _this.hudEmitAcc = 0;
                _this.emitHud();
            }
            _this.rafId = requestAnimationFrame(tick);
        };
        this.emitHud();
        this.rafId = requestAnimationFrame(tick);
    };
    _proto.destroy = function destroy() {
        if (this.rafId !== null) cancelAnimationFrame(this.rafId);
        this.unbindDesktopInputs();
    };
    _proto.setPaused = function setPaused(p) {
        this.paused = p;
        this.emitHud();
    };
    _proto.updateSettings = function updateSettings(next) {
        this.settings = next;
        _AudioEngine.mmAudio.setVolumes(next.audio);
    };
    // ==================== PUBLIC INPUT & ACTION APIS ====================
    _proto.setTouchMoveStick = function setTouchMoveStick(nx, ny) {
        this.touchMoveX = clamp(nx, -1, 1);
        this.touchMoveY = clamp(ny, -1, 1);
    };
    _proto.setTouchAimStick = function setTouchAimStick(active, angle, mag) {
        this.touchAimActive = active;
        if (active) {
            this.touchAimAngle = angle;
            var fireThresh = this.settings.controls.fireRingThreshold / 100;
            this.touchAimAutoFire = this.settings.controls.controlScheme === 'dual_stick' && mag >= fireThresh;
        } else {
            this.touchAimAutoFire = false;
        }
    };
    _proto.setTouchFireButton = function setTouchFireButton(down) {
        this.touchFireBtnDown = down;
    };
    _proto.setTouchCrouch = function setTouchCrouch(down) {
        if (down && !this.touchCrouchBtn) {
            var now = performance.now();
            if (now - this.lastDownTapTs < 320 && this.settings.controls.combatRollMode !== 'off') {
                this.triggerCombatRoll();
            }
            this.lastDownTapTs = now;
        }
        this.touchCrouchBtn = down;
    };
    _proto.triggerCombatRoll = function triggerCombatRoll() {
        var p = this.getPlayer();
        if (!p || !p.alive || p.rollCooldown > 0) return;
        var dir = Math.abs(p.vx) > 25 ? Math.sign(p.vx) : Math.cos(p.aimAngle) >= 0 ? 1 : -1;
        p.vx = dir * 470;
        p.rollTimer = 0.28;
        p.rollCooldown = 1.4;
        _AudioEngine.mmAudio.playMelee();
    };
    _proto.triggerSwapWeapon = function triggerSwapWeapon() {
        var p = this.getPlayer();
        if (!p || !p.alive) return;
        if (p.offhandSlot) {
            // Collapse offhand into holstered or swap primary with holstered
            var prevOff = p.offhandSlot;
            p.offhandSlot = null;
            if (p.holsteredSlot) {
                var tmp = p.activeSlot;
                p.activeSlot = p.holsteredSlot;
                p.holsteredSlot = tmp;
            } else {
                p.holsteredSlot = prevOff;
            }
        } else if (p.holsteredSlot) {
            var tmp1 = p.activeSlot;
            p.activeSlot = p.holsteredSlot;
            p.holsteredSlot = tmp1;
        } else {
            return;
        }
        p.reloading = false;
        p.spinUpTimer = 0;
        this.targetZoom = Math.min(this.targetZoom, this.getMaxZoomForPlayer(p));
        _AudioEngine.mmAudio.playClick();
        this.emitHud();
    };
    _proto.triggerReload = function triggerReload() {
        var p = this.getPlayer();
        if (!p || !p.alive || p.reloading) return;
        var w = (0, _weapons.getMmWeaponById)(p.activeSlot.weaponId);
        if (w.isMelee || w.isShield || w.batteryAutoRefill) return;
        if (p.activeSlot.mag >= w.magSize && (!p.offhandSlot || p.offhandSlot.mag >= (0, _weapons.getMmWeaponById)(p.offhandSlot.weaponId).magSize)) {
            return;
        }
        if (p.activeSlot.reserve <= 0 && (!p.offhandSlot || p.offhandSlot.reserve <= 0)) return;
        var speedMult = p.perkId === 'quick_hands' ? 0.8 : 1.0;
        p.reloading = true;
        p.reloadDuration = Math.max(0.5, w.reloadSec * speedMult);
        p.reloadTimer = p.reloadDuration;
        _AudioEngine.mmAudio.playReload();
    };
    _proto.triggerMelee = function triggerMelee() {
        var p = this.getPlayer();
        if (!p || !p.alive || p.meleeCooldown > 0) return;
        this.executeMelee(p);
    };
    _proto.triggerThrowGrenade = function triggerThrowGrenade() {
        var p = this.getPlayer();
        if (!p || !p.alive) return;
        this.throwGrenade(p);
    };
    _proto.cycleGrenadeType = function cycleGrenadeType(dir) {
        if (dir === void 0) dir = 1;
        var p = this.getPlayer();
        if (!p) return;
        var order = [
            'frag',
            'gas',
            'proxy',
            'emp'
        ];
        var idx = order.indexOf(p.grenadeType);
        p.grenadeType = order[(idx + dir + order.length) % order.length];
        _AudioEngine.mmAudio.playClick();
        this.emitHud();
    };
    _proto.selectGrenadeType = function selectGrenadeType(id) {
        var p = this.getPlayer();
        if (!p) return;
        p.grenadeType = id;
        _AudioEngine.mmAudio.playClick();
        this.emitHud();
    };
    _proto.cycleZoom = function cycleZoom() {
        var _this = this;
        var p = this.getPlayer();
        if (!p) return;
        var maxZ = this.getMaxZoomForPlayer(p);
        var steps = [
            1.0,
            1.6,
            2.5,
            4.0,
            7.0
        ].filter(function(z) {
            return z <= maxZ + 0.05;
        });
        if (steps[steps.length - 1] < maxZ - 0.1) steps.push(maxZ);
        var curIdx = steps.findIndex(function(z) {
            return Math.abs(z - _this.targetZoom) < 0.2;
        });
        this.targetZoom = steps[(curIdx + 1) % steps.length];
        _AudioEngine.mmAudio.playClick();
        this.emitHud();
    };
    _proto.triggerPickup = function triggerPickup(dualWield) {
        if (dualWield === void 0) dualWield = false;
        var p = this.getPlayer();
        if (!p || !p.alive) return;
        var near = this.findNearbyPickup(p);
        if (!near) return;
        var dropIdx = this.drops.findIndex(function(d) {
            return d.id === near.id;
        });
        if (dropIdx === -1) return;
        var drop = this.drops[dropIdx];
        var wDef = (0, _weapons.getMmWeaponById)(drop.weaponId);
        if (dualWield && (0, _weapons.canDualWieldPair)(p.activeSlot.weaponId, drop.weaponId)) {
            if (p.offhandSlot) {
                this.spawnDrop(p.offhandSlot.weaponId, p.x, p.y - 10);
            }
            p.offhandSlot = {
                weaponId: drop.weaponId,
                mag: wDef.magSize,
                reserve: wDef.reserveMax
            };
            this.drops.splice(dropIdx, 1);
            if (this.config.mode === 'bootcamp' && this.bootcampStep === 6) {
                this.bootcampDualDone = true;
            }
            _AudioEngine.mmAudio.playPickup();
            this.emitHud();
            return;
        }
        // Standard swap into active slot
        this.spawnDrop(p.activeSlot.weaponId, p.x, p.y - 10);
        p.activeSlot = {
            weaponId: drop.weaponId,
            mag: wDef.magSize,
            reserve: wDef.reserveMax
        };
        if (!wDef.oneHanded && p.offhandSlot) {
            this.spawnDrop(p.offhandSlot.weaponId, p.x + 12, p.y - 10);
            p.offhandSlot = null;
        }
        p.reloading = false;
        this.drops.splice(dropIdx, 1);
        _AudioEngine.mmAudio.playPickup();
        this.emitHud();
    };
    _proto.triggerQuickChat = function triggerQuickChat(text) {
        var p = this.getPlayer();
        if (!p) return;
        p.speechText = text;
        p.speechTimer = 3.2;
        _AudioEngine.mmAudio.playClick();
    };
    _proto.selectRespawnLoadout = function selectRespawnLoadout(loadoutId) {
        var p = this.getPlayer();
        if (!p) return;
        var ld = this.allLoadouts.find(function(l) {
            return l.id === loadoutId;
        });
        if (!ld) return;
        var cost = Math.round(ld.coinCost * (1 - this.rankDiscountPct / 100));
        if (cost > this.playerCoins) return;
        if (cost > 0) this.playerCoins -= cost;
        p.activeLoadoutId = ld.id;
        if (!p.alive) {
            this.applyLoadoutToSoldier(p, ld);
        }
        _AudioEngine.mmAudio.playClick();
        this.emitHud();
    };
    _proto.swapPlayerTeam = function swapPlayerTeam() {
        if (this.config.mode === 'ffa' || this.config.mode === 'survival' || this.config.mode === 'bootcamp') return;
        var p = this.getPlayer();
        if (!p) return;
        p.team = p.team === 'blue' ? 'red' : 'blue';
        this.respawnSoldier(p);
        this.emitHud();
    };
    // ==================== INITIALIZATION ====================
    _proto.initPads = function initPads() {
        var _this = this;
        this.pads = this.map.pads.map(function(pad, index) {
            var pool = pad.weaponPool && pad.weaponPool.length > 0 ? pad.weaponPool : [
                'm4',
                'ak47',
                'uzi'
            ];
            return {
                index: index,
                x: pad.x,
                y: pad.y,
                kind: pad.kind,
                weaponId: pad.kind === 'weapon' ? pool[0] : null,
                active: _this.config.mapDrops || pad.kind === 'health' || _this.config.classicV4,
                timer: 0,
                respawnSec: pad.respawnSec,
                pool: pool
            };
        });
    };
    _proto.initSoldiers = function initSoldiers(save) {
        var _this = this;
        var _this_allLoadouts_find;
        var playerLoadout = (_this_allLoadouts_find = this.allLoadouts.find(function(l) {
            return l.id === save.activeLoadoutId;
        })) != null ? _this_allLoadouts_find : _weapons.MM_PREBUILT_LOADOUTS[0];
        if (this.config.mode === 'bootcamp') {
            var _save_avatarPresets_save_activeAvatarPreset;
            // Boot Camp: Player + Sarge + Cardboard Targets
            var p = this.createSoldier({
                id: 'player',
                name: save.callsign,
                team: 'blue',
                isPlayer: true,
                avatar: (_save_avatarPresets_save_activeAvatarPreset = save.avatarPresets[save.activeAvatarPreset]) != null ? _save_avatarPresets_save_activeAvatarPreset : save.avatarPresets[0],
                loadout: _weapons.MM_PREBUILT_LOADOUTS[0]
            });
            p.x = 220;
            p.y = this.map.height - 160;
            this.soldiers.push(p);
            var sarge = this.createSoldier({
                id: 'sarge_ai',
                name: 'Sarge',
                team: 'blue',
                isPlayer: false,
                isSarge: true,
                avatar: _progression.MM_SARGE_AVATAR,
                loadout: _weapons.MM_PREBUILT_LOADOUTS[2]
            });
            sarge.x = 310;
            sarge.y = this.map.height - 160;
            sarge.speechText = 'Welcome to Boot Camp! Move & Crouch (A/D + S)!';
            sarge.speechTimer = 6;
            this.soldiers.push(sarge);
            // Spawn 3 cardboard practice dummies
            [
                960,
                1220,
                1520
            ].forEach(function(tx, idx) {
                var d = _this.createSoldier({
                    id: "dummy_" + idx,
                    name: "Target #" + (idx + 1),
                    team: 'red',
                    isPlayer: false,
                    isTargetDummy: true,
                    avatar: (0, _progression.makeRandomAvatar)("Target #" + (idx + 1)),
                    loadout: _weapons.MM_PREBUILT_LOADOUTS[0]
                });
                d.x = tx;
                d.y = idx === 1 ? 820 : _this.map.height - 140;
                d.hp = 60;
                d.maxHp = 60;
                _this.soldiers.push(d);
            });
            // Drop Uzi nearby for step 7 dual-wield test
            this.spawnDrop('uzi', 520, this.map.height - 160);
            this.spawnDrop('m93ba', 420, this.map.height - 160);
            return;
        }
        if (this.config.mode === 'survival') {
            var _save_avatarPresets_save_activeAvatarPreset1, _this_config_coopAllies;
            var p1 = this.createSoldier({
                id: 'player',
                name: save.callsign,
                team: 'blue',
                isPlayer: true,
                avatar: (_save_avatarPresets_save_activeAvatarPreset1 = save.avatarPresets[save.activeAvatarPreset]) != null ? _save_avatarPresets_save_activeAvatarPreset1 : save.avatarPresets[0],
                loadout: playerLoadout
            });
            this.soldiers.push(p1);
            var sarge1 = this.createSoldier({
                id: 'sarge_ai',
                name: 'Sarge',
                team: 'blue',
                isPlayer: false,
                isSarge: true,
                avatar: _progression.MM_SARGE_AVATAR,
                loadout: _weapons.MM_PREBUILT_LOADOUTS[2]
            });
            sarge1.speechText = 'Wave 1 inbound! Lock and load, soldier!';
            sarge1.speechTimer = 5;
            this.soldiers.push(sarge1);
            var allies = Math.max(0, Math.min(3, (_this_config_coopAllies = this.config.coopAllies) != null ? _this_config_coopAllies : 0));
            for(var i = 0; i < allies; i++){
                var botName = _progression.MM_BOT_NAMES[(i + 2) % _progression.MM_BOT_NAMES.length];
                this.soldiers.push(this.createSoldier({
                    id: "ally_" + i,
                    name: botName,
                    team: 'blue',
                    isPlayer: false,
                    avatar: (0, _progression.makeRandomAvatar)(botName),
                    loadout: _weapons.MM_PREBUILT_LOADOUTS[(i + 2) % _weapons.MM_PREBUILT_LOADOUTS.length]
                }));
            }
            this.spawnSurvivalWave(1);
            return;
        }
        // Standard Multiplayer / Custom Room (TDM, FFA, CTF, PTB)
        for(var _iterator = _create_for_of_iterator_helper_loose(this.config.slots), _step; !(_step = _iterator()).done;){
            var slot = _step.value;
            var team = this.config.mode === 'ffa' ? 'ffa' : slot.team;
            var ld = slot.isPlayer ? playerLoadout : _weapons.MM_PREBUILT_LOADOUTS[Math.floor(Math.random() * _weapons.MM_PREBUILT_LOADOUTS.length)];
            var sol = this.createSoldier({
                id: slot.id,
                name: slot.name,
                team: team,
                isPlayer: slot.isPlayer,
                avatar: slot.avatar,
                loadout: ld
            });
            this.soldiers.push(sol);
        }
        if (this.config.mode === 'ptb') {
            this.resetPtbRound();
        }
    };
    _proto.createSoldier = function createSoldier(opts) {
        var sp = this.pickSpawnPoint(opts.team);
        var s = {
            id: opts.id,
            name: opts.name,
            team: opts.team,
            isPlayer: opts.isPlayer,
            isSarge: opts.isSarge,
            isBoss: opts.isBoss,
            isTargetDummy: opts.isTargetDummy,
            avatar: opts.avatar,
            x: sp.x,
            y: sp.y,
            vx: 0,
            vy: 0,
            onGround: false,
            crouching: false,
            rollTimer: 0,
            rollCooldown: 0,
            aimAngle: opts.team === 'red' ? Math.PI : 0,
            walkPhase: 0,
            hp: 100,
            maxHp: 100,
            lastDamagedAt: -10,
            jetFuel: 100,
            maxJetFuel: 100,
            jetpacking: false,
            empDisabledTimer: 0,
            boostTimer: 0,
            burnTimer: 0,
            burnAttackerId: null,
            spawnShieldTimer: 2.0,
            alive: true,
            respawnTimer: 0,
            activeSlot: {
                weaponId: 'magnum',
                mag: 6,
                reserve: 54
            },
            offhandSlot: null,
            holsteredSlot: {
                weaponId: 'deagle',
                mag: 7,
                reserve: 63
            },
            fireCooldown: 0,
            offhandFireCooldown: 0,
            burstRemaining: 0,
            burstTick: 0,
            spinUpTimer: 0,
            reloading: false,
            reloadTimer: 0,
            reloadDuration: 1.5,
            muzzleFlash: 0,
            meleeTimer: 0,
            meleeCooldown: 0,
            grenadeType: 'frag',
            grenades: {
                frag: 2,
                gas: 1,
                proxy: 1,
                emp: 1
            },
            perkId: opts.loadout.perkId,
            activeLoadoutId: opts.loadout.id,
            kills: 0,
            deaths: 0,
            assists: 0,
            captures: 0,
            streak: 0,
            bestStreak: 0,
            multiKillCount: 0,
            multiKillTimer: 0,
            bestMultiKill: 0,
            recentAttackers: new Map(),
            carryingFlag: null,
            speechText: null,
            speechTimer: 0,
            aiThinkTimer: 0.2,
            aiMoveDir: 1,
            aiJetBurst: 0,
            aiGoalX: sp.x,
            aiGoalY: sp.y,
            aiTargetId: null
        };
        this.applyLoadoutToSoldier(s, opts.loadout);
        return s;
    };
    _proto.applyLoadoutToSoldier = function applyLoadoutToSoldier(s, ld) {
        s.perkId = ld.perkId;
        var nitroScale = this.config.nitroMode === '2x' ? 2.0 : 1.0;
        s.maxHp = s.isBoss ? 360 : ld.perkId === 'heavy_armor' ? 120 : 100;
        s.hp = s.maxHp;
        s.maxJetFuel = (ld.perkId === 'jet_booster' ? 125 : 100) * nitroScale;
        s.jetFuel = s.maxJetFuel;
        if (this.config.classicV4 && !s.isBoss) {
            // Classic V4 rules: spawn with Magnum + Deagle + 2 Frag grenades & loot the map!
            var mag = (0, _weapons.getMmWeaponById)('magnum');
            var deg = (0, _weapons.getMmWeaponById)('deagle');
            s.activeSlot = {
                weaponId: mag.id,
                mag: mag.magSize,
                reserve: mag.reserveMax
            };
            s.offhandSlot = null;
            s.holsteredSlot = {
                weaponId: deg.id,
                mag: deg.magSize,
                reserve: deg.reserveMax
            };
            s.grenadeType = 'frag';
            s.grenades = {
                frag: 2,
                gas: 0,
                proxy: 0,
                emp: 0
            };
            return;
        }
        var pDef = (0, _weapons.getMmWeaponById)(ld.primaryId);
        var secDef = (0, _weapons.getMmWeaponById)(ld.secondaryId);
        s.activeSlot = {
            weaponId: pDef.id,
            mag: pDef.magSize,
            reserve: pDef.reserveMax
        };
        if (ld.dualWieldStart && (0, _weapons.canDualWieldPair)(pDef.id, secDef.id)) {
            s.offhandSlot = {
                weaponId: secDef.id,
                mag: secDef.magSize,
                reserve: secDef.reserveMax
            };
            s.holsteredSlot = null;
        } else {
            s.offhandSlot = null;
            s.holsteredSlot = {
                weaponId: secDef.id,
                mag: secDef.magSize,
                reserve: secDef.reserveMax
            };
        }
        var bonusG = ld.perkId === 'grenadier' ? 2 : 0;
        s.grenadeType = ld.grenadeId;
        s.grenades = {
            frag: ld.grenadeId === 'frag' ? ld.grenadeCount + bonusG : 1,
            gas: ld.grenadeId === 'gas' ? ld.grenadeCount + bonusG : 1,
            proxy: ld.grenadeId === 'proxy' ? ld.grenadeCount + bonusG : 1,
            emp: ld.grenadeId === 'emp' ? ld.grenadeCount + bonusG : 1
        };
    };
    _proto.pickSpawnPoint = function pickSpawnPoint(team) {
        var _arr_Math_floor;
        var arr = team === 'blue' ? this.map.blueSpawns : team === 'red' ? this.map.redSpawns : this.map.ffaSpawns;
        var base = (_arr_Math_floor = arr[Math.floor(Math.random() * arr.length)]) != null ? _arr_Math_floor : {
            x: 400,
            y: 400
        };
        return {
            x: base.x + (Math.random() - 0.5) * 40,
            y: base.y
        };
    };
    _proto.spawnSurvivalWave = function spawnSurvivalWave(wave) {
        this.survivalWave = wave;
        // Clear dead wave bots
        this.soldiers = this.soldiers.filter(function(s) {
            return s.team === 'blue';
        });
        var isBossWave = wave % 5 === 0;
        var count = Math.min(8, 3 + Math.floor(wave * 0.7));
        for(var i = 0; i < count; i++){
            var boss = isBossWave && i === 0;
            var pool = boss ? [
                'minigun',
                'smaw',
                'flamethrower',
                'saw_gun'
            ] : wave <= 3 ? [
                'pistol',
                'deagle',
                'uzi'
            ] : wave <= 6 ? [
                'uzi',
                'ak47',
                'm4',
                'mp5'
            ] : [
                'm93ba',
                'spas12',
                'aa12',
                'smaw',
                'flamethrower'
            ];
            var wid = pool[Math.floor(Math.random() * pool.length)];
            var name = boss ? "JUGGERNAUT BOSS W" + wave : wave <= 3 ? "Drone #" + (i + 1) : "Trooper #" + (i + 1);
            var avatar = (0, _progression.makeRandomAvatar)(name);
            if (wave <= 3) {
                avatar.skinTone = '#9CA3AF';
                avatar.eyeStyle = 'cyber';
                avatar.headgear = 'space_visor';
            } else if (boss) {
                avatar.headgear = 'skull_mask';
                avatar.outfit = 'juggernaut';
            }
            var sol = this.createSoldier({
                id: "wave_" + wave + "_" + i,
                name: name,
                team: 'red',
                isPlayer: false,
                isBoss: boss,
                avatar: avatar,
                loadout: {
                    id: 'wave_ld',
                    name: 'Wave',
                    primaryId: wid,
                    secondaryId: wave >= 7 && i % 2 === 1 ? 'riot_shield' : 'deagle',
                    dualWieldStart: wave >= 7 && i % 2 === 1 && (0, _weapons.canDualWieldPair)(wid, 'riot_shield'),
                    grenadeId: wave >= 6 ? 'gas' : 'frag',
                    grenadeCount: 2,
                    perkId: boss ? 'heavy_armor' : 'jet_booster',
                    coinCost: 0,
                    desc: ''
                }
            });
            this.soldiers.push(sol);
        }
        // Sarge calls out wave & drops medkit on ground
        var sarge = this.soldiers.find(function(s) {
            return s.isSarge;
        });
        if (sarge) {
            sarge.speechText = isBossWave ? "BOSS WAVE " + wave + "! Watch out for heavy rockets!" : "Wave " + wave + " inbound! Aim for the head!";
            sarge.speechTimer = 4.5;
        }
        this.showBanner("WAVE " + wave, isBossWave ? 'ARMORED JUGGERNAUT BOSS INBOUND!' : 'HOLD THE OUTPOST!', isBossWave ? '#EF4444' : '#F5A623');
        _AudioEngine.mmAudio.playKillstreakChime(isBossWave ? 3 : 2);
    };
    _proto.resetPtbRound = function resetPtbRound() {
        this.ptbBombState = 'carried';
        this.ptbBombTimer = 30;
        this.ptbBombSite = null;
        this.ptbActionProgress = 0;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.soldiers), _step; !(_step = _iterator()).done;){
            var s = _step.value;
            this.respawnSoldier(s);
        }
        this.showBanner("ROUND " + this.ptbRound, 'RED: PLANT C4 AT SITE A/B · BLUE: DEFEND', '#F5A623');
    };
    _proto.getPlayer = function getPlayer() {
        return this.soldiers.find(function(s) {
            return s.isPlayer;
        });
    };
    _proto.getMaxZoomForPlayer = function getMaxZoomForPlayer(p) {
        var w = (0, _weapons.getMmWeaponById)(p.activeSlot.weaponId);
        if (w.isMelee || w.isShield) {
            return this.settings.gameplay.unarmedZoom ? 2.0 : 1.0;
        }
        return w.zoomMax;
    };
    _proto.showBanner = function showBanner(text, sub, color) {
        this.banner = {
            text: text,
            sub: sub,
            color: color,
            ttl: 2.6
        };
    };
    _proto.recordWeaponDelta = function recordWeaponDelta(weaponId, patch) {
        var _this_weaponDeltas_weaponId, _patch_kills, _patch_shotsFired, _patch_shotsHit, _patch_headshots;
        var cur = (_this_weaponDeltas_weaponId = this.weaponDeltas[weaponId]) != null ? _this_weaponDeltas_weaponId : {
            kills: 0,
            shotsFired: 0,
            shotsHit: 0,
            headshots: 0
        };
        this.weaponDeltas[weaponId] = {
            kills: cur.kills + ((_patch_kills = patch.kills) != null ? _patch_kills : 0),
            shotsFired: cur.shotsFired + ((_patch_shotsFired = patch.shotsFired) != null ? _patch_shotsFired : 0),
            shotsHit: cur.shotsHit + ((_patch_shotsHit = patch.shotsHit) != null ? _patch_shotsHit : 0),
            headshots: cur.headshots + ((_patch_headshots = patch.headshots) != null ? _patch_headshots : 0)
        };
    };
    // ==================== FIXED-TIMESTEP 60 HZ SIMULATION ====================
    _proto.stepSimulation = function stepSimulation(dt) {
        this.matchTimeSec += dt;
        if (this.config.mode !== 'survival' && this.config.mode !== 'bootcamp') {
            this.timeRemainingSec = Math.max(0, this.timeRemainingSec - dt);
            if (this.timeRemainingSec <= 0) {
                this.finishMatch();
                return;
            }
        }
        if (this.banner) {
            this.banner.ttl -= dt;
            if (this.banner.ttl <= 0) this.banner = null;
        }
        if (this.shakeTimer > 0) this.shakeTimer = Math.max(0, this.shakeTimer - dt);
        for(var i = this.killFeed.length - 1; i >= 0; i--){
            this.killFeed[i].ttl -= dt;
            if (this.killFeed[i].ttl <= 0) this.killFeed.splice(i, 1);
        }
        this.stepPads(dt);
        this.stepDrops(dt);
        // Step all soldiers
        for(var _iterator = _create_for_of_iterator_helper_loose(this.soldiers), _step; !(_step = _iterator()).done;){
            var s = _step.value;
            this.stepSoldier(s, dt);
        }
        this.stepProjectiles(dt);
        this.stepGrenades(dt);
        this.stepGasClouds(dt);
        this.stepParticles(dt);
        this.stepModeLogic(dt);
        this.updateCamera(dt);
    };
    _proto.stepSoldier = function stepSoldier(s, dt) {
        if (s.speechTimer > 0) {
            s.speechTimer -= dt;
            if (s.speechTimer <= 0) s.speechText = null;
        }
        if (s.multiKillTimer > 0) {
            s.multiKillTimer -= dt;
            if (s.multiKillTimer <= 0) s.multiKillCount = 0;
        }
        if (!s.alive) {
            if (this.config.mode === 'survival' && s.team === 'red') return;
            if (this.config.mode === 'ptb') return; // Wait for next round
            s.respawnTimer -= dt;
            if (s.respawnTimer <= 0) {
                this.respawnSoldier(s);
            }
            return;
        }
        // Timers
        if (s.fireCooldown > 0) s.fireCooldown = Math.max(0, s.fireCooldown - dt);
        if (s.offhandFireCooldown > 0) s.offhandFireCooldown = Math.max(0, s.offhandFireCooldown - dt);
        if (s.muzzleFlash > 0) s.muzzleFlash = Math.max(0, s.muzzleFlash - dt * 8);
        if (s.meleeTimer > 0) s.meleeTimer = Math.max(0, s.meleeTimer - dt * 4);
        if (s.meleeCooldown > 0) s.meleeCooldown = Math.max(0, s.meleeCooldown - dt);
        if (s.rollTimer > 0) s.rollTimer = Math.max(0, s.rollTimer - dt);
        if (s.rollCooldown > 0) s.rollCooldown = Math.max(0, s.rollCooldown - dt);
        if (s.spawnShieldTimer > 0) s.spawnShieldTimer = Math.max(0, s.spawnShieldTimer - dt);
        if (s.empDisabledTimer > 0) s.empDisabledTimer = Math.max(0, s.empDisabledTimer - dt);
        if (s.boostTimer > 0) s.boostTimer = Math.max(0, s.boostTimer - dt);
        // Health Regen after 4.0s out of combat (+12 HP/s)
        if (this.matchTimeSec - s.lastDamagedAt >= 4.0 && s.hp < s.maxHp && !s.isTargetDummy) {
            s.hp = Math.min(s.maxHp, s.hp + 12 * dt);
        }
        // Burn DOT (Flamethrower)
        if (s.burnTimer > 0) {
            var _this_soldiers_find;
            s.burnTimer -= dt;
            var attacker = (_this_soldiers_find = this.soldiers.find(function(x) {
                return x.id === s.burnAttackerId;
            })) != null ? _this_soldiers_find : null;
            this.applyDamage(s, 14 * dt, attacker, 'flamethrower', false, false, true);
            if (!s.alive) return;
        }
        // Battery Auto-Refill (PHASR & Flamethrower)
        var activeW = (0, _weapons.getMmWeaponById)(s.activeSlot.weaponId);
        if (activeW.batteryAutoRefill && s.activeSlot.mag < activeW.magSize && s.fireCooldown <= 0) {
            s.activeSlot.mag = Math.min(activeW.magSize, s.activeSlot.mag + 22 * dt);
        }
        // Reload timer
        if (s.reloading) {
            s.reloadTimer -= dt;
            if (s.reloadTimer <= 0) {
                s.reloading = false;
                this.finishReloadSlot(s.activeSlot);
                if (s.offhandSlot) this.finishReloadSlot(s.offhandSlot);
            }
        }
        // Gather movement / aim / fire intent
        var moveX = 0;
        var thrustUp = false;
        var crouch = false;
        var wantsFire = false;
        var dropThrough = false;
        if (s.isPlayer) {
            var kLeft = this.keys.has('KeyA') || this.keys.has('ArrowLeft');
            var kRight = this.keys.has('KeyD') || this.keys.has('ArrowRight');
            var kUp = this.keys.has('KeyW') || this.keys.has('ArrowUp') || this.keys.has('Space') || this.rightMouseDown;
            var kDown = this.keys.has('KeyS') || this.keys.has('ArrowDown');
            var sens = this.settings.controls.moveSensitivity;
            if (kLeft) moveX -= 1;
            if (kRight) moveX += 1;
            if (Math.abs(this.touchMoveX) > 0.14) moveX = clamp(this.touchMoveX * sens, -1, 1);
            thrustUp = kUp || this.touchMoveY < -0.35;
            crouch = kDown || this.touchCrouchBtn || this.touchMoveY > 0.62;
            dropThrough = crouch;
            // Aim calculation
            if (this.touchAimActive) {
                s.aimAngle = this.touchAimAngle;
            } else if (this.mouseMoved) {
                var worldMouse = this.screenToWorld(this.mouseScreenX, this.mouseScreenY);
                s.aimAngle = Math.atan2(worldMouse.y - (s.y - 8), worldMouse.x - s.x);
            }
            // Subtle touch aim assist if enabled
            if (this.touchAimActive && this.settings.controls.aimAssist !== 'off') {
                var pull = this.settings.controls.aimAssist === 'high' ? 0.22 : 0.11;
                var bestEnemy = this.findNearestEnemyInCone(s, s.aimAngle, 0.35, 620);
                if (bestEnemy) {
                    var targetA = Math.atan2(bestEnemy.y - 16 - (s.y - 8), bestEnemy.x - s.x);
                    var diff = Math.atan2(Math.sin(targetA - s.aimAngle), Math.cos(targetA - s.aimAngle));
                    s.aimAngle += diff * pull;
                }
            }
            wantsFire = this.mouseDown || this.touchAimAutoFire || this.touchFireBtnDown;
        } else if (!s.isTargetDummy) {
            var ai = this.computeAiInput(s, dt);
            moveX = ai.moveX;
            thrustUp = ai.thrustUp;
            crouch = ai.crouch;
            dropThrough = ai.dropThrough;
            wantsFire = ai.wantsFire;
        }
        s.crouching = crouch && s.onGround && !thrustUp;
        // Weight & Speed modifiers
        var weightMult = activeW.weightSpeedMult;
        if (s.offhandSlot) {
            weightMult = Math.min(weightMult, (0, _weapons.getMmWeaponById)(s.offhandSlot.weaponId).weightSpeedMult);
        }
        if (s.carryingFlag) weightMult *= 0.9;
        if (s.boostTimer > 0) weightMult *= 1.35;
        if (s.crouching) weightMult *= 0.45;
        var maxSpeed = BASE_MOVE_SPEED * weightMult;
        var accel = s.onGround ? 2100 * this.map.friction : 980;
        if (s.rollTimer <= 0) {
            if (Math.abs(moveX) > 0.05) {
                s.vx += moveX * accel * dt;
                if (Math.abs(s.vx) > maxSpeed && s.onGround) {
                    s.vx = Math.sign(s.vx) * Math.max(maxSpeed, Math.abs(s.vx) * (1 - 6 * dt));
                }
            } else {
                var damp = s.onGround ? 11 * this.map.friction : 1.6;
                s.vx *= Math.max(0, 1 - damp * dt);
            }
        }
        // Jetpack & Gravity
        var gravMult = this.config.gravityMode === 'low' ? 0.42 : this.config.gravityMode === 'heavy' ? 1.35 : this.map.gravityScale;
        var g = BASE_GRAVITY * gravMult;
        var unlimitedFuel = this.map.unlimitedJetpack || this.config.nitroMode === 'unlimited';
        if (thrustUp && s.empDisabledTimer <= 0 && (s.jetFuel > 1 || unlimitedFuel)) {
            s.jetpacking = true;
            s.vy -= JETPACK_ACCEL * dt;
            s.vy = Math.max(-420, s.vy);
            if (!unlimitedFuel) {
                s.jetFuel = Math.max(0, s.jetFuel - 34 * dt);
            }
            if (s.isPlayer) _AudioEngine.mmAudio.playJetpackPulse();
            if (Math.random() < 0.45) {
                this.particles.push({
                    x: s.x + (Math.random() - 0.5) * 10,
                    y: s.y + 14,
                    vx: (Math.random() - 0.5) * 40,
                    vy: 70 + Math.random() * 60,
                    size: 4 + Math.random() * 4,
                    color: 'rgba(241, 245, 249, 0.55)',
                    ttl: 0.35,
                    maxTtl: 0.35,
                    gravity: -40,
                    kind: 'smoke'
                });
            }
        } else {
            s.jetpacking = false;
            var regenRate = s.onGround ? 44 : 20;
            s.jetFuel = Math.min(s.maxJetFuel, s.jetFuel + regenRate * dt);
        }
        s.vy += g * dt;
        s.vy = Math.min(720, s.vy);
        // Move & Collide with Map Geometry
        this.moveAndCollideSoldier(s, dt, dropThrough);
        // Walk cycle animation
        if (s.onGround && Math.abs(s.vx) > 20) {
            s.walkPhase += Math.abs(s.vx) * dt * 0.06;
        }
        // Cliffhanger Lethal Abyss check
        if (this.map.lethalAbyss && s.y > this.map.height + 60) {
            this.killSoldier(s, null, 'Abyss Fall', false, false);
            return;
        }
        // Boot Camp progress checks
        if (s.isPlayer && this.config.mode === 'bootcamp') {
            if (Math.abs(moveX) > 0.2 || s.crouching) this.bootcampMovedSec += dt;
            if (s.jetpacking) this.bootcampFlewSec += dt;
        }
        // M4 3-Round Burst continuation
        if (s.burstRemaining > 0) {
            s.burstTick -= dt;
            if (s.burstTick <= 0) {
                s.burstRemaining--;
                s.burstTick = 0.075;
                this.fireSingleSlot(s, s.activeSlot, false);
            }
        }
        // Minigun 0.8s Spin-Up & Firing
        if (wantsFire && !s.reloading) {
            if (activeW.fireMode === 'spinup') {
                var _activeW_spinUpSec, _activeW_spinUpSec1;
                s.spinUpTimer = Math.min((_activeW_spinUpSec = activeW.spinUpSec) != null ? _activeW_spinUpSec : 0.8, s.spinUpTimer + dt);
                if (s.spinUpTimer >= ((_activeW_spinUpSec1 = activeW.spinUpSec) != null ? _activeW_spinUpSec1 : 0.8) && s.fireCooldown <= 0) {
                    this.fireSingleSlot(s, s.activeSlot, false);
                }
            } else {
                if (s.fireCooldown <= 0) {
                    this.fireSingleSlot(s, s.activeSlot, false);
                }
                if (s.offhandSlot && s.offhandFireCooldown <= 0) {
                    var offW = (0, _weapons.getMmWeaponById)(s.offhandSlot.weaponId);
                    if (!offW.isShield) {
                        this.fireSingleSlot(s, s.offhandSlot, true);
                    }
                }
            }
        } else {
            s.spinUpTimer = Math.max(0, s.spinUpTimer - dt * 1.4);
        }
    };
    _proto.finishReloadSlot = function finishReloadSlot(slot) {
        var w = (0, _weapons.getMmWeaponById)(slot.weaponId);
        if (w.isMelee || w.isShield) return;
        var need = w.magSize - Math.floor(slot.mag);
        var take = Math.min(need, slot.reserve);
        slot.mag += take;
        slot.reserve -= take;
    };
    _proto.fireSingleSlot = function fireSingleSlot(s, slot, isOffhand) {
        var w = (0, _weapons.getMmWeaponById)(slot.weaponId);
        if (w.isShield) return;
        if (w.isMelee) {
            this.executeMelee(s);
            return;
        }
        if (slot.mag < 1) {
            if (this.settings.controls.autoReload && !s.reloading && slot.reserve > 0 && !w.batteryAutoRefill) {
                var speedMult = s.perkId === 'quick_hands' ? 0.8 : 1.0;
                s.reloading = true;
                s.reloadDuration = Math.max(0.5, w.reloadSec * speedMult);
                s.reloadTimer = s.reloadDuration;
                if (s.isPlayer) _AudioEngine.mmAudio.playReload();
            }
            return;
        }
        // Firing breaks spawn shield immediately
        s.spawnShieldTimer = 0;
        // Consume ammo
        slot.mag = Math.max(0, slot.mag - 1);
        var boostRpm = s.boostTimer > 0 ? 1.25 : 1.0;
        var cd = 60 / (w.rpm * boostRpm);
        if (isOffhand) s.offhandFireCooldown = cd * 1.05;
        else s.fireCooldown = w.fireMode === 'burst3' ? cd * 2.8 : cd;
        if (!isOffhand && w.fireMode === 'burst3' && s.burstRemaining === 0 && slot.mag > 0) {
            s.burstRemaining = Math.min(2, Math.floor(slot.mag));
            s.burstTick = 0.075;
        }
        s.muzzleFlash = 1.0;
        if (s.isPlayer || dist(s.x, s.y, this.camX, this.camY) < 920) {
            _AudioEngine.mmAudio.playWeaponFire(w.id);
        }
        // Recoil pushback impulse
        if (w.recoilImpulse !== 0) {
            var airBonus = s.onGround ? 0.35 : 1.0;
            s.vx -= Math.cos(s.aimAngle) * w.recoilImpulse * airBonus;
            s.vy -= Math.sin(s.aimAngle) * w.recoilImpulse * airBonus * 0.7;
        }
        if (s.isPlayer && this.settings.video.screenShake && w.recoilImpulse >= 50) {
            this.shakeTimer = 0.1;
            this.shakeMag = Math.min(8, w.recoilImpulse * 0.04);
        }
        var muzzleX = s.x + Math.cos(s.aimAngle) * 26;
        var muzzleY = s.y - 7 + Math.sin(s.aimAngle) * 26;
        var dmgBoost = s.boostTimer > 0 ? 1.2 : 1.0;
        var crouchSpread = s.crouching ? 0.7 : 1.0;
        var dualSpread = s.offhandSlot && !(0, _weapons.getMmWeaponById)(s.offhandSlot.weaponId).isShield ? 1.25 : 1.0;
        if (s.isPlayer) {
            this.recordWeaponDelta(w.id, {
                shotsFired: 1
            });
        }
        // Brass shell casing VFX
        if (this.settings.video.mmcEnhanced && w.projectileKind === 'bullet') {
            this.particles.push({
                x: s.x + Math.cos(s.aimAngle) * 8,
                y: s.y - 8,
                vx: -Math.cos(s.aimAngle) * 55 + (Math.random() - 0.5) * 40,
                vy: -90 - Math.random() * 50,
                size: 3,
                color: '#FACC15',
                ttl: 0.7,
                maxTtl: 0.7,
                gravity: 520,
                kind: 'casing'
            });
        }
        // Hitscan Continuous Laser (PHASR)
        if (w.projectileKind === 'laser') {
            this.firePhasrLaser(s, muzzleX, muzzleY, w.damage * dmgBoost, w.headshotMult);
            return;
        }
        // Projectiles (bullets, pellets, rockets, mortar, flame, emp, saw)
        for(var i = 0; i < w.pellets; i++){
            var _w_splashRadius, _w_ricochets;
            var spreadRad = w.spreadDeg * crouchSpread * dualSpread * (Math.random() - 0.5) * Math.PI / 180;
            var a = s.aimAngle + spreadRad;
            var spd = w.projectileSpeed * (w.projectileKind === 'pellet' ? 0.9 + Math.random() * 0.2 : 1);
            this.projectiles.push({
                id: this.seq++,
                ownerId: s.id,
                ownerTeam: s.team,
                weaponId: w.id,
                kind: w.projectileKind === 'melee' || w.projectileKind === 'shield' ? 'bullet' : w.projectileKind,
                x: muzzleX,
                y: muzzleY,
                vx: Math.cos(a) * spd,
                vy: Math.sin(a) * spd,
                damage: w.damage * dmgBoost,
                headshotMult: w.headshotMult,
                splashRadius: (_w_splashRadius = w.splashRadius) != null ? _w_splashRadius : 0,
                ricochetsLeft: (_w_ricochets = w.ricochets) != null ? _w_ricochets : 0,
                ttl: w.projectileKind === 'flame' ? 0.45 : w.projectileKind === 'mortar' ? 2.2 : w.projectileKind === 'saw' ? 4.2 : 1.9,
                maxTtl: w.projectileKind === 'flame' ? 0.45 : 2.2,
                color: w.accent,
                fromDualWield: Boolean(s.offhandSlot && !(0, _weapons.getMmWeaponById)(s.offhandSlot.weaponId).isShield)
            });
        }
    };
    _proto.firePhasrLaser = function firePhasrLaser(s, startX, startY, dmg, hsMult) {
        var maxLen = 1150;
        var dx = Math.cos(s.aimAngle);
        var dy = Math.sin(s.aimAngle);
        var endX = startX + dx * maxLen;
        var endY = startY + dy * maxLen;
        var hitSoldier = null;
        var isHead = false;
        var steps = 65;
        for(var i = 1; i <= steps; i++){
            var px = startX + dx * (maxLen * (i / steps));
            var py = startY + dy * (maxLen * (i / steps));
            if (this.pointHitsSolid(px, py)) {
                endX = px;
                endY = py;
                break;
            }
            var hit = this.checkPointHitsSoldier(px, py, s.id, s.team);
            if (hit) {
                endX = px;
                endY = py;
                hitSoldier = hit.soldier;
                isHead = hit.headshot;
                break;
            }
        }
        this.particles.push({
            x: startX,
            y: startY,
            x2: endX,
            y2: endY,
            vx: 0,
            vy: 0,
            size: 3.5,
            color: '#22D3EE',
            ttl: 0.11,
            maxTtl: 0.11,
            gravity: 0,
            kind: 'beam'
        });
        if (hitSoldier) {
            if (this.isBlockedByRiotShield(hitSoldier, startX, startY)) {
                _AudioEngine.mmAudio.playShieldBlock();
                this.spawnSparks(endX, endY, '#93C5FD', 6);
            } else {
                var finalDmg = isHead ? dmg * hsMult : dmg;
                if (s.isPlayer) this.recordWeaponDelta('phasr', {
                    shotsHit: 1,
                    headshots: isHead ? 1 : 0
                });
                this.applyDamage(hitSoldier, finalDmg, s, 'phasr', isHead, false, false);
            }
        }
    };
    _proto.executeMelee = function executeMelee(s) {
        var w = (0, _weapons.getMmWeaponById)(s.activeSlot.weaponId);
        var offW = s.offhandSlot ? (0, _weapons.getMmWeaponById)(s.offhandSlot.weaponId) : null;
        var hasMachete = w.id === 'machete' || (offW == null ? void 0 : offW.id) === 'machete';
        var dualMachete = w.id === 'machete' && (offW == null ? void 0 : offW.id) === 'machete';
        s.spawnShieldTimer = 0;
        s.meleeTimer = 1.0;
        s.meleeCooldown = dualMachete ? 0.24 : hasMachete ? 0.36 : 0.44;
        s.vx += Math.cos(s.aimAngle) * 165;
        s.vy += Math.sin(s.aimAngle) * 90;
        _AudioEngine.mmAudio.playMelee();
        var reach = hasMachete ? 64 : 48;
        var dmg = hasMachete ? 85 : 45;
        var hitX = s.x + Math.cos(s.aimAngle) * (reach * 0.55);
        var hitY = s.y - 10 + Math.sin(s.aimAngle) * (reach * 0.55);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.soldiers), _step; !(_step = _iterator()).done;){
            var target = _step.value;
            if (!target.alive || target.id === s.id) continue;
            if (!this.canDamage(s.team, target.team)) continue;
            if (dist(hitX, hitY, target.x, target.y - 12) <= reach) {
                var headHit = dist(hitX, hitY, target.x, target.y - 25) < 28;
                var mult = headHit && hasMachete ? 1.35 : 1.0;
                target.vx += Math.cos(s.aimAngle) * 260;
                target.vy -= 140;
                this.applyDamage(target, dmg * mult, s, hasMachete ? 'machete' : 'melee', headHit, true, false);
                if (s.isPlayer && this.config.mode === 'bootcamp' && this.bootcampStep === 4) {
                    this.bootcampMeleeDone = true;
                }
            }
        }
    };
    _proto.throwGrenade = function throwGrenade(s) {
        var kind = s.grenadeType;
        if (s.grenades[kind] <= 0) return;
        s.grenades[kind]--;
        s.spawnShieldTimer = 0;
        var def = (0, _weapons.getMmGrenadeById)(kind);
        var spd = kind === 'proxy' ? 620 : 540;
        this.grenades.push({
            id: this.seq++,
            ownerId: s.id,
            ownerTeam: s.team,
            kind: kind,
            x: s.x + Math.cos(s.aimAngle) * 20,
            y: s.y - 14 + Math.sin(s.aimAngle) * 20,
            vx: Math.cos(s.aimAngle) * spd + s.vx * 0.25,
            vy: Math.sin(s.aimAngle) * spd - (kind === 'proxy' ? 0 : 90),
            fuse: def.fuseSec,
            stuck: false,
            armed: false,
            blinkPhase: 0
        });
        _AudioEngine.mmAudio.playClick();
    };
    _proto.moveAndCollideSoldier = function moveAndCollideSoldier(s, dt, dropThrough) {
        var halfW = SOLDIER_W / 2;
        var h = s.crouching ? SOLDIER_H * 0.65 : SOLDIER_H;
        var topOff = h - 18;
        var botOff = 18;
        // Horizontal
        s.x += s.vx * dt;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.map.platforms), _step; !(_step = _iterator()).done;){
            var pl = _step.value;
            if (pl.oneWay) continue;
            if (s.x + halfW > pl.x && s.x - halfW < pl.x + pl.w && s.y + botOff > pl.y + 4 && s.y - topOff < pl.y + pl.h - 4) {
                if (s.vx > 0) s.x = pl.x - halfW;
                else if (s.vx < 0) s.x = pl.x + pl.w + halfW;
                s.vx = 0;
            }
        }
        // Vertical
        var prevBot = s.y + botOff;
        s.y += s.vy * dt;
        s.onGround = false;
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.map.platforms), _step1; !(_step1 = _iterator1()).done;){
            var pl1 = _step1.value;
            if (s.x + halfW <= pl1.x + 2 || s.x - halfW >= pl1.x + pl1.w - 2) continue;
            if (pl1.oneWay) {
                if (!dropThrough && s.vy >= 0 && prevBot <= pl1.y + 8 && s.y + botOff >= pl1.y) {
                    s.y = pl1.y - botOff;
                    s.vy = 0;
                    s.onGround = true;
                }
                continue;
            }
            if (s.y + botOff > pl1.y && s.y - topOff < pl1.y + pl1.h) {
                if (s.vy > 0) {
                    s.y = pl1.y - botOff;
                    s.vy = 0;
                    s.onGround = true;
                } else if (s.vy < 0) {
                    s.y = pl1.y + pl1.h + topOff;
                    s.vy = 0;
                }
            }
        }
        // World bounds clamp
        s.x = clamp(s.x, 60, this.map.width - 60);
        if (!this.map.lethalAbyss) {
            s.y = clamp(s.y, 70, this.map.height - 60);
        }
    };
    _proto.pointHitsSolid = function pointHitsSolid(x, y) {
        for(var _iterator = _create_for_of_iterator_helper_loose(this.map.platforms), _step; !(_step = _iterator()).done;){
            var pl = _step.value;
            if (pl.oneWay) continue;
            if (x >= pl.x && x <= pl.x + pl.w && y >= pl.y && y <= pl.y + pl.h) return true;
        }
        return false;
    };
    _proto.canDamage = function canDamage(attackerTeam, targetTeam) {
        if (attackerTeam === 'ffa' || targetTeam === 'ffa') return true;
        if (this.config.friendlyFire) return true;
        return attackerTeam !== targetTeam;
    };
    _proto.checkPointHitsSoldier = function checkPointHitsSoldier(px, py, ownerId, ownerTeam) {
        for(var _iterator = _create_for_of_iterator_helper_loose(this.soldiers), _step; !(_step = _iterator()).done;){
            var s = _step.value;
            if (!s.alive || s.id === ownerId) continue;
            if (!this.canDamage(ownerTeam, s.team)) continue;
            var crouchOff = s.crouching ? 10 : 0;
            // Head Circle Hitbox (1.75x multiplier!)
            if (dist(px, py, s.x, s.y - 25 + crouchOff) <= 15) {
                return {
                    soldier: s,
                    headshot: true
                };
            }
            // Torso/Legs Capsule Hitbox
            if (Math.abs(px - s.x) <= 14 && py >= s.y - 16 + crouchOff && py <= s.y + 18) {
                return {
                    soldier: s,
                    headshot: false
                };
            }
        }
        return null;
    };
    _proto.isBlockedByRiotShield = function isBlockedByRiotShield(target, incomingFromX, incomingFromY) {
        var _target_offhandSlot;
        var hasShield = target.activeSlot.weaponId === 'riot_shield' || ((_target_offhandSlot = target.offhandSlot) == null ? void 0 : _target_offhandSlot.weaponId) === 'riot_shield';
        if (!hasShield) return false;
        var toAttacker = Math.atan2(incomingFromY - (target.y - 10), incomingFromX - target.x);
        var diff = Math.abs(Math.atan2(Math.sin(toAttacker - target.aimAngle), Math.cos(toAttacker - target.aimAngle)));
        return diff <= 1.05; // ~120-degree front shield block cone
    };
    _proto.stepProjectiles = function stepProjectiles(dt) {
        var _this, _loop = function(i) {
            var pr = _this.projectiles[i];
            pr.ttl -= dt;
            if (pr.ttl <= 0) {
                if (pr.kind === 'mortar' || pr.kind === 'rocket' || pr.kind === 'emp') {
                    _this.detonateProjectile(pr);
                }
                _this.projectiles.splice(i, 1);
                return "continue";
            }
            if (pr.kind === 'mortar') {
                pr.vy += BASE_GRAVITY * 0.72 * dt;
            } else if (pr.kind === 'flame') {
                pr.vx *= 0.94;
                pr.vy -= 30 * dt;
            } else if (pr.kind === 'rocket' && Math.random() < 0.65) {
                _this.particles.push({
                    x: pr.x,
                    y: pr.y,
                    vx: (Math.random() - 0.5) * 20,
                    vy: (Math.random() - 0.5) * 20,
                    size: 5,
                    color: 'rgba(226, 232, 240, 0.55)',
                    ttl: 0.35,
                    maxTtl: 0.35,
                    gravity: -20,
                    kind: 'smoke'
                });
            }
            var nextX = pr.x + pr.vx * dt;
            var nextY = pr.y + pr.vy * dt;
            // Wall hit / Ricochet check
            if (_this.pointHitsSolid(nextX, nextY)) {
                if (pr.kind === 'saw' && pr.ricochetsLeft > 0) {
                    pr.ricochetsLeft--;
                    var hitHoriz = _this.pointHitsSolid(nextX, pr.y);
                    if (hitHoriz) pr.vx = -pr.vx;
                    else pr.vy = -pr.vy;
                    _AudioEngine.mmAudio.playRicochet();
                    _this.spawnSparks(pr.x, pr.y, '#FDE047', 6);
                    return "continue";
                }
                if (pr.kind === 'mortar') {
                    var hitHoriz1 = _this.pointHitsSolid(nextX, pr.y);
                    if (hitHoriz1) pr.vx = -pr.vx * 0.62;
                    else pr.vy = -pr.vy * 0.62;
                    _AudioEngine.mmAudio.playGrenadeBounce();
                    return "continue";
                }
                if (pr.kind === 'rocket' || pr.kind === 'emp') {
                    _this.detonateProjectile(pr);
                } else {
                    _this.spawnSparks(pr.x, pr.y, '#FDE68A', 4);
                }
                _this.projectiles.splice(i, 1);
                return "continue";
            }
            pr.x = nextX;
            pr.y = nextY;
            // Shoot armed Proxy Mines!
            for(var gi = _this.grenades.length - 1; gi >= 0; gi--){
                var gr = _this.grenades[gi];
                if (gr.kind === 'proxy' && gr.stuck && dist(pr.x, pr.y, gr.x, gr.y) < 16) {
                    _this.detonateGrenade(gr);
                    _this.grenades.splice(gi, 1);
                }
            }
            // Soldier Hit Check
            var hit = _this.checkPointHitsSoldier(pr.x, pr.y, pr.ownerId, pr.ownerTeam);
            if (hit) {
                var _this_soldiers_find;
                var owner = (_this_soldiers_find = _this.soldiers.find(function(x) {
                    return x.id === pr.ownerId;
                })) != null ? _this_soldiers_find : null;
                if (pr.kind === 'rocket' || pr.kind === 'mortar' || pr.kind === 'emp') {
                    _this.detonateProjectile(pr);
                    _this.projectiles.splice(i, 1);
                    return "continue";
                }
                // Riot Shield blocks bullets/pellets/sawblades from the front, but NOT Flamethrower!
                if (pr.kind !== 'flame' && _this.isBlockedByRiotShield(hit.soldier, pr.x - pr.vx * dt, pr.y - pr.vy * dt)) {
                    _AudioEngine.mmAudio.playShieldBlock();
                    _this.spawnSparks(pr.x, pr.y, '#93C5FD', 6);
                    _this.projectiles.splice(i, 1);
                    return "continue";
                }
                var dmg = hit.headshot ? pr.damage * pr.headshotMult : pr.damage;
                if (owner == null ? void 0 : owner.isPlayer) {
                    _this.recordWeaponDelta(pr.weaponId, {
                        shotsHit: 1,
                        headshots: hit.headshot ? 1 : 0
                    });
                    if (_this.config.mode === 'bootcamp' && _this.bootcampStep === 3 && _this.currentZoom >= 1.5) {
                        _this.bootcampZoomShotDone = true;
                    }
                }
                if (pr.kind === 'flame') {
                    hit.soldier.burnTimer = 3.0;
                    hit.soldier.burnAttackerId = pr.ownerId;
                }
                _this.applyDamage(hit.soldier, dmg, owner, pr.weaponId, hit.headshot, false, pr.fromDualWield);
                // Sawblade slices through!
                if (pr.kind !== 'saw') {
                    _this.projectiles.splice(i, 1);
                }
            }
        };
        for(var i = this.projectiles.length - 1; i >= 0; i--)_this = this, _loop(i);
    };
    _proto.detonateProjectile = function detonateProjectile(pr) {
        var _this_soldiers_find;
        var owner = (_this_soldiers_find = this.soldiers.find(function(x) {
            return x.id === pr.ownerId;
        })) != null ? _this_soldiers_find : null;
        if (pr.kind === 'emp') {
            _AudioEngine.mmAudio.playEmpZap();
            this.spawnShockwave(pr.x, pr.y, pr.splashRadius, '#38BDF8');
            this.disarmNearbyMines(pr.x, pr.y, pr.splashRadius);
            for(var _iterator = _create_for_of_iterator_helper_loose(this.soldiers), _step; !(_step = _iterator()).done;){
                var s = _step.value;
                if (!s.alive) continue;
                if (dist(pr.x, pr.y, s.x, s.y - 10) <= pr.splashRadius) {
                    if (s.id === pr.ownerId || this.canDamage(pr.ownerTeam, s.team)) {
                        s.empDisabledTimer = Math.max(s.empDisabledTimer, 4.0);
                        s.boostTimer = 0;
                        this.applyDamage(s, pr.damage, owner, pr.weaponId, false, false, false);
                    }
                }
            }
            return;
        }
        _AudioEngine.mmAudio.playExplosion();
        this.spawnShockwave(pr.x, pr.y, pr.splashRadius, '#FB923C');
        if (this.settings.video.screenShake && dist(pr.x, pr.y, this.camX, this.camY) < 700) {
            this.shakeTimer = 0.22;
            this.shakeMag = 10;
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.soldiers), _step1; !(_step1 = _iterator1()).done;){
            var s1 = _step1.value;
            if (!s1.alive) continue;
            var d = dist(pr.x, pr.y, s1.x, s1.y - 10);
            if (d <= pr.splashRadius) {
                var falloff = 1 - d / pr.splashRadius * 0.65;
                var angle = Math.atan2(s1.y - 10 - pr.y, s1.x - pr.x);
                s1.vx += Math.cos(angle) * 340 * falloff;
                s1.vy += Math.sin(angle) * 340 * falloff - 120;
                if (s1.id === pr.ownerId || this.canDamage(pr.ownerTeam, s1.team)) {
                    // Self rocket-jump deals reduced self damage
                    var selfMult = s1.id === pr.ownerId ? 0.45 : 1.0;
                    this.applyDamage(s1, pr.damage * falloff * selfMult, owner, pr.weaponId, false, false, false);
                }
            }
        }
    };
    _proto.stepGrenades = function stepGrenades(dt) {
        var _this, _loop = function(i) {
            var gr = _this.grenades[i];
            gr.blinkPhase += dt * 7;
            if (gr.kind === 'proxy') {
                if (!gr.stuck) {
                    var nx = gr.x + gr.vx * dt;
                    var ny = gr.y + gr.vy * dt;
                    if (_this.pointHitsSolid(nx, ny)) {
                        gr.stuck = true;
                        gr.vx = 0;
                        gr.vy = 0;
                        _AudioEngine.mmAudio.playGrenadeBounce();
                    } else {
                        gr.x = nx;
                        gr.y = ny;
                    }
                } else {
                    if (!gr.armed) {
                        gr.fuse -= dt;
                        if (gr.fuse <= 0) gr.armed = true;
                    } else {
                        // Check proximity trigger against enemies
                        var triggered = _this.soldiers.some(function(s) {
                            return s.alive && s.id !== gr.ownerId && _this1.canDamage(gr.ownerTeam, s.team) && dist(gr.x, gr.y, s.x, s.y - 10) <= 68;
                        });
                        if (triggered) {
                            _this.detonateGrenade(gr);
                            _this.grenades.splice(i, 1);
                        }
                    }
                }
                return "continue";
            }
            // Standard bouncing grenades (Frag, Gas, EMP)
            gr.fuse -= dt;
            gr.vy += BASE_GRAVITY * 0.85 * dt;
            var nx1 = gr.x + gr.vx * dt;
            var ny1 = gr.y + gr.vy * dt;
            if (_this.pointHitsSolid(nx1, gr.y)) {
                gr.vx = -gr.vx * 0.55;
                _AudioEngine.mmAudio.playGrenadeBounce();
            } else {
                gr.x = nx1;
            }
            if (_this.pointHitsSolid(gr.x, ny1)) {
                gr.vy = -gr.vy * 0.5;
                gr.vx *= 0.82;
                if (Math.abs(gr.vy) > 40) _AudioEngine.mmAudio.playGrenadeBounce();
            } else {
                gr.y = ny1;
            }
            if (gr.fuse <= 0) {
                _this.detonateGrenade(gr);
                _this.grenades.splice(i, 1);
            }
        };
        var _this1 = this;
        for(var i = this.grenades.length - 1; i >= 0; i--)_this = this, _loop(i);
    };
    _proto.detonateGrenade = function detonateGrenade(gr) {
        var _this_soldiers_find;
        var def = (0, _weapons.getMmGrenadeById)(gr.kind);
        var owner = (_this_soldiers_find = this.soldiers.find(function(x) {
            return x.id === gr.ownerId;
        })) != null ? _this_soldiers_find : null;
        if ((owner == null ? void 0 : owner.isPlayer) && this.config.mode === 'bootcamp' && this.bootcampStep === 5) {
            this.bootcampGrenadeDone = true;
        }
        if (gr.kind === 'gas') {
            _AudioEngine.mmAudio.playGasHiss();
            this.gasClouds.push({
                id: this.seq++,
                ownerId: gr.ownerId,
                ownerTeam: gr.ownerTeam,
                x: gr.x,
                y: gr.y,
                radius: def.radius,
                ttl: 7.0,
                maxTtl: 7.0,
                tickAcc: 0
            });
            return;
        }
        if (gr.kind === 'emp') {
            _AudioEngine.mmAudio.playEmpZap();
            this.spawnShockwave(gr.x, gr.y, def.radius, '#38BDF8');
            this.disarmNearbyMines(gr.x, gr.y, def.radius);
            for(var _iterator = _create_for_of_iterator_helper_loose(this.soldiers), _step; !(_step = _iterator()).done;){
                var s = _step.value;
                if (!s.alive) continue;
                if (dist(gr.x, gr.y, s.x, s.y - 10) <= def.radius) {
                    if (s.id === gr.ownerId || this.canDamage(gr.ownerTeam, s.team)) {
                        s.empDisabledTimer = Math.max(s.empDisabledTimer, 5.0);
                        s.boostTimer = 0;
                        this.applyDamage(s, def.damage, owner, 'emp_grenade', false, false, false);
                    }
                }
            }
            return;
        }
        // Frag or Proxy Explosion
        _AudioEngine.mmAudio.playExplosion();
        this.spawnShockwave(gr.x, gr.y, def.radius, gr.kind === 'proxy' ? '#EF4444' : '#F59E0B');
        if (this.settings.video.screenShake && dist(gr.x, gr.y, this.camX, this.camY) < 750) {
            this.shakeTimer = 0.24;
            this.shakeMag = 11;
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.soldiers), _step1; !(_step1 = _iterator1()).done;){
            var s1 = _step1.value;
            if (!s1.alive) continue;
            var d = dist(gr.x, gr.y, s1.x, s1.y - 10);
            if (d <= def.radius) {
                var falloff = 1 - d / def.radius * 0.6;
                var ang = Math.atan2(s1.y - 10 - gr.y, s1.x - gr.x);
                s1.vx += Math.cos(ang) * 360 * falloff;
                s1.vy += Math.sin(ang) * 360 * falloff - 120;
                if (s1.id === gr.ownerId || this.canDamage(gr.ownerTeam, s1.team)) {
                    this.applyDamage(s1, def.damage * falloff, owner, gr.kind === 'proxy' ? 'proxy_mine' : 'frag_grenade', false, false, false);
                }
            }
        }
    };
    _proto.disarmNearbyMines = function disarmNearbyMines(x, y, radius) {
        for(var i = this.grenades.length - 1; i >= 0; i--){
            var g = this.grenades[i];
            if (g.kind === 'proxy' && dist(x, y, g.x, g.y) <= radius) {
                this.spawnSparks(g.x, g.y, '#38BDF8', 8);
                this.grenades.splice(i, 1);
            }
        }
    };
    _proto.stepGasClouds = function stepGasClouds(dt) {
        var _this, _loop = function(i) {
            var gc = _this.gasClouds[i];
            gc.ttl -= dt;
            gc.tickAcc += dt;
            if (gc.tickAcc >= 0.25) {
                var _this_soldiers_find;
                gc.tickAcc = 0;
                var owner = (_this_soldiers_find = _this.soldiers.find(function(x) {
                    return x.id === gc.ownerId;
                })) != null ? _this_soldiers_find : null;
                for(var _iterator = _create_for_of_iterator_helper_loose(_this.soldiers), _step; !(_step = _iterator()).done;){
                    var s = _step.value;
                    if (!s.alive) continue;
                    if (dist(gc.x, gc.y, s.x, s.y - 10) <= gc.radius) {
                        if (s.id === gc.ownerId || _this.canDamage(gc.ownerTeam, s.team)) {
                            _this.applyDamage(s, 35 * 0.25, owner, 'gas_grenade', false, false, false);
                        }
                    }
                }
            }
            if (gc.ttl <= 0) _this.gasClouds.splice(i, 1);
        };
        for(var i = this.gasClouds.length - 1; i >= 0; i--)_this = this, _loop(i);
    };
    _proto.applyDamage = function applyDamage(target, amount, attacker, weaponId, headshot, isMelee, fromDualWield) {
        if (!target.alive || target.spawnShieldTimer > 0) return;
        target.hp -= amount;
        target.lastDamagedAt = this.matchTimeSec;
        if (attacker && attacker.id !== target.id) {
            target.recentAttackers.set(attacker.id, this.matchTimeSec);
        }
        if (headshot && (attacker == null ? void 0 : attacker.isPlayer)) {
            _AudioEngine.mmAudio.playHeadshotDing();
        }
        // Hit particles (Red Blood / Cartoon Confetti / Off)
        if (this.settings.video.hitEffects !== 'off') {
            var count = headshot ? 7 : 3;
            var palette = this.settings.video.hitEffects === 'confetti' ? [
                '#FACC15',
                '#38BDF8',
                '#F472B6',
                '#4ADE80'
            ] : [
                headshot ? '#FACC15' : '#DC2626',
                '#991B1B'
            ];
            for(var i = 0; i < count; i++){
                this.particles.push({
                    x: target.x,
                    y: headshot ? target.y - 25 : target.y - 10,
                    vx: (Math.random() - 0.5) * 210,
                    vy: -40 - Math.random() * 140,
                    size: headshot ? 4 : 3,
                    color: palette[i % palette.length],
                    ttl: 0.45,
                    maxTtl: 0.45,
                    gravity: 480,
                    kind: 'dot'
                });
            }
        }
        if (target.hp <= 0) {
            this.killSoldier(target, attacker, weaponId, headshot, isMelee, fromDualWield);
        }
    };
    _proto.killSoldier = function killSoldier(victim, attacker, weaponId, headshot, isMelee, fromDualWield) {
        var _this, _loop = function() {
            var _step_value = _step.value, aid = _step_value[0], ts = _step_value[1];
            if (aid !== attacker.id && _this.matchTimeSec - ts <= 6.0) {
                var helper = _this.soldiers.find(function(x) {
                    return x.id === aid;
                });
                if (helper) helper.assists++;
            }
        };
        if (fromDualWield === void 0) fromDualWield = false;
        victim.alive = false;
        victim.hp = 0;
        victim.deaths++;
        victim.streak = 0;
        victim.respawnTimer = 3.0;
        victim.burnTimer = 0;
        // Drop carried CTF flag
        if (victim.carryingFlag) {
            var fl = this.flags[victim.carryingFlag];
            fl.carrierId = null;
            fl.x = victim.x;
            fl.y = victim.y;
            fl.droppedTimer = 14;
            victim.carryingFlag = null;
        }
        // Drop primary weapon + comic burst
        if (!victim.isTargetDummy) {
            this.spawnDrop(victim.activeSlot.weaponId, victim.x, victim.y - 12);
        }
        if (this.settings.video.hitEffects !== 'off') {
            var cols = this.settings.video.hitEffects === 'confetti' ? [
                '#FACC15',
                '#38BDF8',
                '#F472B6',
                '#4ADE80',
                '#FB923C'
            ] : [
                '#DC2626',
                '#EF4444',
                '#7F1D1D',
                '#F59E0B'
            ];
            for(var i = 0; i < 18; i++){
                this.particles.push({
                    x: victim.x,
                    y: victim.y - 12,
                    vx: (Math.random() - 0.5) * 320,
                    vy: -80 - Math.random() * 220,
                    size: 4 + Math.random() * 4,
                    color: cols[i % cols.length],
                    ttl: 0.75,
                    maxTtl: 0.75,
                    gravity: 540,
                    kind: 'dot'
                });
            }
        }
        if (victim.isTargetDummy) {
            this.bootcampTargetsKilled++;
            victim.respawnTimer = 9999;
            return;
        }
        var isSuicide = !attacker || attacker.id === victim.id;
        var wName = weaponId === 'frag_grenade' ? 'Frag Grenade' : weaponId === 'gas_grenade' ? 'Poison Gas' : weaponId === 'proxy_mine' ? 'Proxy Mine' : weaponId === 'emp_grenade' ? 'EMP Grenade' : weaponId === 'melee' ? 'Melee' : weaponId === 'Abyss Fall' ? 'Abyss' : (0, _weapons.getMmWeaponById)(weaponId).shortName;
        if (isSuicide) {
            if (victim.isPlayer) this.playerSuicides++;
            this.killFeed.unshift({
                id: this.seq++,
                killer: victim.name,
                killerTeam: victim.team,
                victim: 'Self',
                victimTeam: victim.team,
                weaponName: wName,
                headshot: false,
                melee: false,
                ttl: 5.0
            });
            this.killFeed = this.killFeed.slice(0, 5);
            return;
        }
        // Credit Killer
        attacker.kills++;
        attacker.streak++;
        attacker.bestStreak = Math.max(attacker.bestStreak, attacker.streak);
        attacker.multiKillCount = attacker.multiKillTimer > 0 ? attacker.multiKillCount + 1 : 1;
        attacker.multiKillTimer = 4.2;
        attacker.bestMultiKill = Math.max(attacker.bestMultiKill, attacker.multiKillCount);
        // Credit Assists
        for(var _iterator = _create_for_of_iterator_helper_loose(victim.recentAttackers.entries()), _step; !(_step = _iterator()).done;)_this = this, _loop();
        victim.recentAttackers.clear();
        // Team scores in TDM
        if (this.config.mode === 'tdm') {
            if (attacker.team === 'blue') this.scoreBlue++;
            else if (attacker.team === 'red') this.scoreRed++;
        }
        // Player detailed stats & Killstreak announcements
        if (attacker.isPlayer) {
            this.playerCoins += headshot ? 35 : 25;
            if (headshot) this.playerHeadshots++;
            if (isMelee) this.playerMeleeKills++;
            if (weaponId === 'frag_grenade' || weaponId === 'gas_grenade' || weaponId === 'proxy_mine' || weaponId === 'emp_grenade') {
                this.playerGrenadeKills++;
            } else if (weaponId !== 'melee') {
                this.recordWeaponDelta(weaponId, {
                    kills: 1
                });
            }
            if (fromDualWield) this.playerDualKills++;
            if (headshot && (weaponId === 'm93ba' || weaponId === 'hunting_rifle' || weaponId === 'm14')) {
                this.playerSniperHeadshots++;
            }
            if (weaponId === 'machete') this.playerMacheteKills++;
            if (weaponId === 'smaw') this.playerSmawKills++;
            if (weaponId === 'flamethrower') this.playerFlameKills++;
            if (weaponId === 'saw_gun') this.playerSawKills++;
            if (attacker.multiKillCount >= 2) {
                var labels = [
                    '',
                    '',
                    'DOUBLE KILL!',
                    'TRIPLE KILL!',
                    'RAMPAGE!',
                    'UNSTOPPABLE!',
                    'GODLIKE!'
                ];
                var lbl = labels[Math.min(labels.length - 1, attacker.multiKillCount)];
                this.showBanner(lbl, victim.name + " eliminated with " + wName, '#F5A623');
                _AudioEngine.mmAudio.playKillstreakChime(attacker.multiKillCount);
            } else if (headshot) {
                this.showBanner('HEADSHOT!', "+35 Coins \xb7 " + wName, '#EF4444');
                _AudioEngine.mmAudio.playKillstreakChime(1);
            } else if (isMelee) {
                this.showBanner('HUMILIATION!', "Melee takedown on " + victim.name, '#F97316');
                _AudioEngine.mmAudio.playKillstreakChime(1);
            }
        }
        this.killFeed.unshift({
            id: this.seq++,
            killer: attacker.name,
            killerTeam: attacker.team,
            victim: victim.name,
            victimTeam: victim.team,
            weaponName: wName,
            headshot: headshot,
            melee: isMelee,
            ttl: 5.5
        });
        this.killFeed = this.killFeed.slice(0, 5);
        // Check immediate score win conditions
        if (this.config.mode === 'tdm' && (this.scoreBlue >= this.config.scoreLimit || this.scoreRed >= this.config.scoreLimit)) {
            this.finishMatch();
        } else if (this.config.mode === 'ffa' && attacker.kills >= this.config.scoreLimit) {
            this.finishMatch();
        }
    };
    _proto.respawnSoldier = function respawnSoldier(s) {
        var _this_allLoadouts_find;
        var sp = this.pickSpawnPoint(s.team);
        s.x = sp.x;
        s.y = sp.y;
        s.vx = 0;
        s.vy = 0;
        s.alive = true;
        s.reloading = false;
        s.empDisabledTimer = 0;
        s.burnTimer = 0;
        s.spawnShieldTimer = 2.0;
        var ld = (_this_allLoadouts_find = this.allLoadouts.find(function(l) {
            return l.id === s.activeLoadoutId;
        })) != null ? _this_allLoadouts_find : _weapons.MM_PREBUILT_LOADOUTS[0];
        this.applyLoadoutToSoldier(s, ld);
    };
    _proto.stepPads = function stepPads(dt) {
        var _this, _loop = function() {
            var pad = _step.value;
            if (!pad.active) {
                pad.timer -= dt;
                if (pad.timer <= 0) {
                    pad.active = true;
                    if (pad.kind === 'weapon') {
                        pad.weaponId = pad.pool[Math.floor(Math.random() * pad.pool.length)];
                    }
                }
                return "continue";
            }
            for(var _iterator = _create_for_of_iterator_helper_loose(_this.soldiers), _step1; !(_step1 = _iterator()).done;){
                var s = _step1.value;
                if (!s.alive || s.isTargetDummy) continue;
                if (dist(s.x, s.y - 8, pad.x, pad.y) > 34) continue;
                if (pad.kind === 'health' && s.hp < s.maxHp) {
                    s.hp = s.maxHp;
                    pad.active = false;
                    pad.timer = pad.respawnSec;
                    if (s.isPlayer) _AudioEngine.mmAudio.playPickup();
                    break;
                } else if (pad.kind === 'boost') {
                    s.boostTimer = 15.0;
                    pad.active = false;
                    pad.timer = pad.respawnSec;
                    if (s.isPlayer) {
                        _AudioEngine.mmAudio.playPickup();
                        _this.showBanner('POWER BOOST!', '+35% Speed · +25% Fire Rate · +20% DMG', '#EF4444');
                    }
                    break;
                } else if (pad.kind === 'ammo') {
                    var w = (0, _weapons.getMmWeaponById)(s.activeSlot.weaponId);
                    s.activeSlot.reserve = w.reserveMax;
                    var cap = s.perkId === 'grenadier' ? 6 : 4;
                    s.grenades[s.grenadeType] = Math.min(cap, s.grenades[s.grenadeType] + 2);
                    pad.active = false;
                    pad.timer = pad.respawnSec;
                    if (s.isPlayer) _AudioEngine.mmAudio.playPickup();
                    break;
                } else if (pad.kind === 'weapon' && pad.weaponId) {
                    // Spawn a dropped pickup right on the pad so players use contextual Swap / Dual Wield
                    var alreadyHere = _this.drops.some(function(d) {
                        return dist(d.x, d.y, pad.x, pad.y) < 30;
                    });
                    if (!alreadyHere) {
                        _this.spawnDrop(pad.weaponId, pad.x, pad.y - 6);
                        pad.active = false;
                        pad.timer = pad.respawnSec;
                    }
                    break;
                }
            }
        };
        for(var _iterator = _create_for_of_iterator_helper_loose(this.pads), _step; !(_step = _iterator()).done;)_this = this, _loop();
    };
    _proto.spawnDrop = function spawnDrop(weaponId, x, y) {
        this.drops.push({
            id: "drp_" + this.seq++,
            weaponId: weaponId,
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 90,
            vy: -120,
            ttl: 28
        });
        if (this.drops.length > 22) this.drops.shift();
    };
    _proto.stepDrops = function stepDrops(dt) {
        for(var i = this.drops.length - 1; i >= 0; i--){
            var d = this.drops[i];
            d.ttl -= dt;
            if (d.ttl <= 0) {
                this.drops.splice(i, 1);
                continue;
            }
            d.vy += BASE_GRAVITY * 0.7 * dt;
            d.x += d.vx * dt;
            var ny = d.y + d.vy * dt;
            if (this.pointHitsSolid(d.x, ny + 8)) {
                d.vy = 0;
                d.vx *= 0.6;
            } else {
                d.y = ny;
            }
        }
    };
    _proto.findNearbyPickup = function findNearbyPickup(p) {
        var best = null;
        var bestD = 54;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.drops), _step; !(_step = _iterator()).done;){
            var d = _step.value;
            var dd = dist(p.x, p.y, d.x, d.y);
            if (dd < bestD) {
                bestD = dd;
                best = d;
            }
        }
        if (!best) return null;
        var w = (0, _weapons.getMmWeaponById)(best.weaponId);
        return {
            id: best.id,
            weaponId: best.weaponId,
            weaponName: w.name,
            canDualWield: (0, _weapons.canDualWieldPair)(p.activeSlot.weaponId, best.weaponId)
        };
    };
    _proto.stepModeLogic = function stepModeLogic(dt) {
        if (this.config.mode === 'ctf') {
            this.stepCtf(dt);
        } else if (this.config.mode === 'ptb') {
            this.stepPtb(dt);
        } else if (this.config.mode === 'survival') {
            this.stepSurvival(dt);
        } else if (this.config.mode === 'bootcamp') {
            this.stepBootcamp();
        }
    };
    _proto.stepCtf = function stepCtf(dt) {
        var _this = this;
        [
            'blue',
            'red'
        ].forEach(function(team) {
            var fl = _this.flags[team];
            if (fl.carrierId) {
                var c = _this.soldiers.find(function(s) {
                    return s.id === fl.carrierId && s.alive;
                });
                if (c) {
                    fl.x = c.x;
                    fl.y = c.y - 12;
                    // Check capture at carrier's home flag!
                    var home = _this.flags[c.team === 'blue' ? 'blue' : 'red'];
                    if (!home.carrierId && dist(home.x, home.y, home.homeX, home.homeY) < 25 && dist(c.x, c.y, home.homeX, home.homeY) < 52) {
                        if (c.team === 'blue') _this.scoreBlue++;
                        else _this.scoreRed++;
                        c.captures++;
                        if (c.isPlayer) _this.playerFlagCaptures++;
                        c.carryingFlag = null;
                        fl.carrierId = null;
                        fl.x = fl.homeX;
                        fl.y = fl.homeY;
                        _this.showBanner("" + c.team.toUpperCase() + " CAPTURED THE FLAG!", "" + c.name + " scored!", c.team === 'blue' ? '#38BDF8' : '#EF4444');
                        _AudioEngine.mmAudio.playKillstreakChime(3);
                        if (_this.scoreBlue >= _this.config.scoreLimit || _this.scoreRed >= _this.config.scoreLimit) {
                            _this.finishMatch();
                        }
                    }
                } else {
                    fl.carrierId = null;
                    fl.droppedTimer = 14;
                }
                return;
            }
            if (fl.droppedTimer > 0) {
                fl.droppedTimer -= dt;
                if (fl.droppedTimer <= 0) {
                    fl.x = fl.homeX;
                    fl.y = fl.homeY;
                }
            }
            for(var _iterator = _create_for_of_iterator_helper_loose(_this.soldiers), _step; !(_step = _iterator()).done;){
                var s = _step.value;
                if (!s.alive) continue;
                if (dist(s.x, s.y, fl.x, fl.y) < 42) {
                    if (s.team === team) {
                        // Return dropped own flag
                        if (dist(fl.x, fl.y, fl.homeX, fl.homeY) > 25) {
                            fl.x = fl.homeX;
                            fl.y = fl.homeY;
                            fl.droppedTimer = 0;
                            _AudioEngine.mmAudio.playPickup();
                        }
                    } else if (!s.carryingFlag) {
                        fl.carrierId = s.id;
                        s.carryingFlag = team;
                        _AudioEngine.mmAudio.playPickup();
                        _this.showBanner(s.name + " GRABBED " + team.toUpperCase() + " FLAG!", 'Intercept the flag carrier!', '#F5A623');
                    }
                }
            }
        });
    };
    _proto.stepPtb = function stepPtb(dt) {
        var _this = this;
        var aliveBlue = this.soldiers.filter(function(s) {
            return s.team === 'blue' && s.alive;
        }).length;
        var aliveRed = this.soldiers.filter(function(s) {
            return s.team === 'red' && s.alive;
        }).length;
        if (this.ptbBombState === 'carried') {
            // Check if any Red soldier stands near Site A or Site B to plant (3s)
            var planter = this.soldiers.find(function(s) {
                return s.alive && s.team === 'red' && (dist(s.x, s.y, _this.map.bombSiteA.x, _this.map.bombSiteA.y) < 70 || dist(s.x, s.y, _this.map.bombSiteB.x, _this.map.bombSiteB.y) < 70);
            });
            if (planter) {
                this.ptbActionProgress += dt / 3.0;
                if (this.ptbActionProgress >= 1) {
                    var nearA = dist(planter.x, planter.y, this.map.bombSiteA.x, this.map.bombSiteA.y) < 75;
                    this.ptbBombSite = nearA ? 'A' : 'B';
                    this.ptbBombX = nearA ? this.map.bombSiteA.x : this.map.bombSiteB.x;
                    this.ptbBombY = nearA ? this.map.bombSiteA.y : this.map.bombSiteB.y;
                    this.ptbBombState = 'planted';
                    this.ptbBombTimer = 30.0;
                    this.ptbActionProgress = 0;
                    if (planter.isPlayer) this.playerBombActions++;
                    this.showBanner("C4 PLANTED AT SITE " + this.ptbBombSite + "!", '30 SECONDS TO DEFUSE!', '#EF4444');
                    _AudioEngine.mmAudio.playKillstreakChime(2);
                }
            } else {
                this.ptbActionProgress = Math.max(0, this.ptbActionProgress - dt);
            }
            if (aliveRed === 0) {
                this.awardPtbRound('blue', 'All Attackers Eliminated!');
            } else if (aliveBlue === 0) {
                this.awardPtbRound('red', 'All Defenders Eliminated!');
            }
        } else if (this.ptbBombState === 'planted') {
            this.ptbBombTimer -= dt;
            var defuser = this.soldiers.find(function(s) {
                return s.alive && s.team === 'blue' && dist(s.x, s.y, _this.ptbBombX, _this.ptbBombY) < 68;
            });
            if (defuser) {
                this.ptbActionProgress += dt / 4.0;
                if (this.ptbActionProgress >= 1) {
                    if (defuser.isPlayer) this.playerBombActions++;
                    this.ptbBombState = 'defused';
                    this.awardPtbRound('blue', 'Bomb Defused by Blue Squad!');
                    return;
                }
            } else {
                this.ptbActionProgress = Math.max(0, this.ptbActionProgress - dt);
            }
            if (this.ptbBombTimer <= 0) {
                this.ptbBombState = 'exploded';
                _AudioEngine.mmAudio.playExplosion();
                this.spawnShockwave(this.ptbBombX, this.ptbBombY, 260, '#EF4444');
                this.awardPtbRound('red', 'C4 Detonated!');
            }
        }
    };
    _proto.awardPtbRound = function awardPtbRound(winner, reason) {
        if (winner === 'blue') {
            this.ptbBlueRounds++;
            this.scoreBlue = this.ptbBlueRounds;
        } else {
            this.ptbRedRounds++;
            this.scoreRed = this.ptbRedRounds;
        }
        this.showBanner(winner.toUpperCase() + " WINS ROUND " + this.ptbRound + "!", reason, winner === 'blue' ? '#38BDF8' : '#EF4444');
        if (this.ptbBlueRounds >= 3 || this.ptbRedRounds >= 3) {
            this.finishMatch();
            return;
        }
        this.ptbRound++;
        this.resetPtbRound();
    };
    _proto.stepSurvival = function stepSurvival(dt) {
        var p = this.getPlayer();
        var aliveAllies = this.soldiers.filter(function(s) {
            return s.team === 'blue' && s.alive;
        }).length;
        if (p && !p.alive && aliveAllies === 0) {
            this.finishMatch();
            return;
        }
        var enemiesAlive = this.soldiers.filter(function(s) {
            return s.team === 'red' && s.alive;
        }).length;
        if (enemiesAlive === 0) {
            this.survivalWaveClearTimer += dt;
            if (this.survivalWaveClearTimer >= 2.2) {
                this.survivalWaveClearTimer = 0;
                this.playerRankCashEarned += 20;
                this.spawnSurvivalWave(this.survivalWave + 1);
            }
        }
    };
    _proto.stepBootcamp = function stepBootcamp() {
        var _this = this;
        var sarge = this.soldiers.find(function(s) {
            return s.isSarge;
        });
        var advance = function advance(nextStep, msg) {
            _this.bootcampStep = nextStep;
            if (sarge) {
                sarge.speechText = msg;
                sarge.speechTimer = 7;
            }
            _AudioEngine.mmAudio.playKillstreakChime(2);
        };
        if (this.bootcampStep === 0 && this.bootcampMovedSec >= 1.2) {
            advance(1, 'Great! Now ignite Rocket Boots (W / Space / Left Stick Up)!');
        } else if (this.bootcampStep === 1 && this.bootcampFlewSec >= 1.0) {
            advance(2, 'Nice flying! Shoot down the 3 Target Dummies ahead!');
        } else if (this.bootcampStep === 2 && this.bootcampTargetsKilled >= 3) {
            // Respawn 1 sniper target far right
            var d = this.soldiers.find(function(s) {
                return s.isTargetDummy;
            });
            if (d) {
                d.alive = true;
                d.hp = 60;
                d.x = 1850;
                d.y = 840;
            }
            advance(3, 'Press Z / Zoom Button & land a zoomed Sniper shot!');
        } else if (this.bootcampStep === 3 && this.bootcampZoomShotDone) {
            var d1 = this.soldiers.find(function(s) {
                return s.isTargetDummy;
            });
            if (d1) {
                d1.alive = true;
                d1.hp = 60;
                d1.x = 640;
                d1.y = this.map.height - 140;
            }
            advance(4, 'Close in and Melee Attack (F / Punch Button) the dummy!');
        } else if (this.bootcampStep === 4 && this.bootcampMeleeDone) {
            advance(5, 'Throw a Frag Grenade (G / Grenade Button)!');
        } else if (this.bootcampStep === 5 && this.bootcampGrenadeDone) {
            advance(6, 'Pick up & Dual Wield the Uzi (X / +Dual Wield) to graduate!');
        } else if (this.bootcampStep === 6 && this.bootcampDualDone) {
            this.bootcampStep = 7;
            this.showBanner('BOOT CAMP COMPLETE!', 'You are combat-ready, Soldier!', '#4ADE80');
            setTimeout(function() {
                if (!_this.matchEnded) _this.finishMatch();
            }, 1500);
        }
    };
    // ==================== TACTICAL AI BOTS & SARGE AI ====================
    _proto.computeAiInput = function computeAiInput(bot, dt) {
        bot.aiThinkTimer -= dt;
        if (bot.aiJetBurst > 0) bot.aiJetBurst -= dt;
        var diffAcc = this.config.botDifficulty === 'easy' ? 0.28 : this.config.botDifficulty === 'normal' ? 0.16 : this.config.botDifficulty === 'pro' ? 0.08 : 0.03;
        // 1. Find nearest visible enemy
        var target = null;
        var bestD = 980;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.soldiers), _step; !(_step = _iterator()).done;){
            var o = _step.value;
            if (!o.alive || o.id === bot.id || o.isTargetDummy) continue;
            if (!this.canDamage(bot.team, o.team)) continue;
            var d = dist(bot.x, bot.y, o.x, o.y);
            if (d < bestD) {
                bestD = d;
                target = o;
            }
        }
        // 2. Gas cloud / Proxy mine avoidance
        var inGas = this.gasClouds.find(function(g) {
            return dist(bot.x, bot.y, g.x, g.y) < g.radius + 45;
        });
        var nearAbyss = this.map.lethalAbyss && bot.y > this.map.height - 230;
        if (bot.aiThinkTimer <= 0) {
            bot.aiThinkTimer = 0.28 + Math.random() * 0.25;
            if (inGas) {
                bot.aiMoveDir = bot.x < inGas.x ? -1 : 1;
                bot.aiJetBurst = 0.5;
            } else if (bot.hp < bot.maxHp * 0.5) {
                // Seek health pad
                var hpPad = this.pads.find(function(p) {
                    return p.kind === 'health' && p.active;
                });
                if (hpPad) {
                    bot.aiGoalX = hpPad.x;
                    bot.aiGoalY = hpPad.y;
                    bot.aiMoveDir = Math.sign(hpPad.x - bot.x);
                }
            } else if (bot.isSarge) {
                var p = this.getPlayer();
                if (p && p.alive && dist(bot.x, bot.y, p.x, p.y) > 260) {
                    bot.aiGoalX = p.x;
                    bot.aiGoalY = p.y;
                    bot.aiMoveDir = Math.sign(p.x - bot.x);
                } else {
                    bot.aiMoveDir = Math.random() < 0.5 ? -1 : 1;
                }
            } else if (this.config.mode === 'ctf') {
                var enemyFlag = this.flags[bot.team === 'blue' ? 'red' : 'blue'];
                var homeFlag = this.flags[bot.team === 'blue' ? 'blue' : 'red'];
                var gx = bot.carryingFlag ? homeFlag.homeX : enemyFlag.x;
                var gy = bot.carryingFlag ? homeFlag.homeY : enemyFlag.y;
                bot.aiGoalX = gx;
                bot.aiGoalY = gy;
                bot.aiMoveDir = Math.sign(gx - bot.x);
            } else if (this.config.mode === 'ptb') {
                var site = this.ptbBombState === 'planted' ? {
                    x: this.ptbBombX,
                    y: this.ptbBombY
                } : this.map.bombSiteA;
                bot.aiGoalX = site.x;
                bot.aiGoalY = site.y;
                bot.aiMoveDir = Math.sign(site.x - bot.x);
            } else if (target) {
                bot.aiGoalX = target.x;
                bot.aiGoalY = target.y;
                bot.aiMoveDir = bestD > 260 ? Math.sign(target.x - bot.x) : bestD < 130 ? -Math.sign(target.x - bot.x) : (Math.random() - 0.5) * 2;
            } else {
                bot.aiGoalX = 240 + Math.random() * (this.map.width - 480);
                bot.aiGoalY = 240 + Math.random() * (this.map.height - 480);
                bot.aiMoveDir = Math.sign(bot.aiGoalX - bot.x);
            }
            if (bot.aiGoalY < bot.y - 70 || Math.random() < 0.25) {
                bot.aiJetBurst = 0.35 + Math.random() * 0.35;
            }
            // Throw grenade occasionally if target is mid-range
            if (target && bestD > 160 && bestD < 430 && Math.random() < 0.08) {
                this.throwGrenade(bot);
            }
        }
        var wantsFire = false;
        if (target) {
            var lead = this.config.botDifficulty === 'insane' ? 0.22 : this.config.botDifficulty === 'pro' ? 0.14 : 0.05;
            var aimX = target.x + target.vx * lead;
            var aimY = target.y - 16 + target.vy * lead;
            var desired = Math.atan2(aimY - (bot.y - 8), aimX - bot.x) + (Math.random() - 0.5) * diffAcc;
            bot.aimAngle = desired;
            var clearShot = !this.segmentBlocked(bot.x, bot.y - 10, target.x, target.y - 12);
            if (clearShot && bestD < 740) {
                wantsFire = true;
            }
            if (bestD < 52 && bot.meleeCooldown <= 0) {
                this.executeMelee(bot);
            }
        } else {
            bot.aimAngle = bot.aiMoveDir >= 0 ? 0 : Math.PI;
        }
        var blockedAhead = this.pointHitsSolid(bot.x + bot.aiMoveDir * 28, bot.y);
        var thrustUp = nearAbyss || blockedAhead || bot.aiJetBurst > 0;
        var dropThrough = bot.aiGoalY > bot.y + 90;
        var crouch = !target && bot.hp < bot.maxHp * 0.45 && bot.onGround;
        return {
            moveX: bot.aiMoveDir,
            thrustUp: thrustUp,
            crouch: crouch,
            dropThrough: dropThrough,
            wantsFire: wantsFire
        };
    };
    _proto.segmentBlocked = function segmentBlocked(x1, y1, x2, y2) {
        var steps = 14;
        for(var i = 1; i < steps; i++){
            var t = i / steps;
            if (this.pointHitsSolid(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) return true;
        }
        return false;
    };
    _proto.findNearestEnemyInCone = function findNearestEnemyInCone(s, angle, coneRad, maxRange) {
        var best = null;
        var bestD = maxRange;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.soldiers), _step; !(_step = _iterator()).done;){
            var o = _step.value;
            if (!o.alive || o.id === s.id) continue;
            if (!this.canDamage(s.team, o.team)) continue;
            var d = dist(s.x, s.y, o.x, o.y);
            if (d > bestD) continue;
            var a = Math.atan2(o.y - s.y, o.x - s.x);
            var diff = Math.abs(Math.atan2(Math.sin(a - angle), Math.cos(a - angle)));
            if (diff <= coneRad) {
                bestD = d;
                best = o;
            }
        }
        return best;
    };
    _proto.spawnSparks = function spawnSparks(x, y, color, count) {
        for(var i = 0; i < count; i++){
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 260,
                vy: (Math.random() - 0.5) * 260,
                size: 2.5,
                color: color,
                ttl: 0.25,
                maxTtl: 0.25,
                gravity: 340,
                kind: 'dot'
            });
        }
    };
    _proto.spawnShockwave = function spawnShockwave(x, y, radius, color) {
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            size: radius,
            color: color,
            ttl: 0.35,
            maxTtl: 0.35,
            gravity: 0,
            kind: 'ring'
        });
        for(var i = 0; i < 16; i++){
            var a = i / 16 * Math.PI * 2;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(a) * (120 + Math.random() * 140),
                vy: Math.sin(a) * (120 + Math.random() * 140),
                size: 6 + Math.random() * 6,
                color: color,
                ttl: 0.5,
                maxTtl: 0.5,
                gravity: 200,
                kind: 'smoke'
            });
        }
    };
    _proto.stepParticles = function stepParticles(dt) {
        for(var i = this.particles.length - 1; i >= 0; i--){
            var pt = this.particles[i];
            pt.ttl -= dt;
            if (pt.ttl <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            pt.vy += pt.gravity * dt;
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
        }
    };
    // ==================== CAMERA & RENDERING ====================
    _proto.updateCamera = function updateCamera(dt) {
        var p = this.getPlayer();
        if (!p) return;
        this.currentZoom += (this.targetZoom - this.currentZoom) * Math.min(1, dt * 8);
        var lookPct = this.settings.controls.weaponLookAhead / 100;
        var lookDist = (85 + (this.currentZoom - 1) * 75) * lookPct;
        var tx = p.x + Math.cos(p.aimAngle) * lookDist;
        var ty = p.y - 16 + Math.sin(p.aimAngle) * lookDist * 0.7;
        this.camX += (tx - this.camX) * Math.min(1, dt * 7.5);
        this.camY += (ty - this.camY) * Math.min(1, dt * 7.5);
    };
    _proto.getCameraScale = function getCameraScale() {
        // Higher zoom zooms viewport OUT so snipers see far down corridors (exact Mini Militia behavior!)
        var base = Math.min(this.canvas.width / 1020, this.canvas.height / 580);
        return base / (1 + (this.currentZoom - 1) * 0.24);
    };
    _proto.screenToWorld = function screenToWorld(sx, sy) {
        var scale = this.getCameraScale();
        return {
            x: this.camX + (sx - this.canvas.width / 2) / scale,
            y: this.camY + (sy - this.canvas.height / 2) / scale
        };
    };
    _proto.renderFrame = function renderFrame() {
        var _this = this, ctx = _this.ctx, canvas = _this.canvas;
        var cw = canvas.width;
        var ch = canvas.height;
        var scale = this.getCameraScale();
        // 1. 4-Layer Parallax Background
        (0, _DoodleRenderer.drawParallaxBackground)(ctx, cw, ch, this.map.biome, this.camX, this.camY, this.matchTimeSec, false);
        ctx.save();
        var shakeX = this.shakeTimer > 0 ? (Math.random() - 0.5) * this.shakeMag : 0;
        var shakeY = this.shakeTimer > 0 ? (Math.random() - 0.5) * this.shakeMag : 0;
        ctx.translate(cw / 2 + shakeX, ch / 2 + shakeY);
        ctx.scale(scale, scale);
        ctx.translate(-this.camX, -this.camY);
        // 2. Platforms & Terrain Geometry
        for(var _iterator = _create_for_of_iterator_helper_loose(this.map.platforms), _step; !(_step = _iterator()).done;){
            var pl = _step.value;
            this.drawPlatform(ctx, pl);
        }
        // 3. CTF Flag Pedestals / PTB Bomb Sites
        if (this.config.mode === 'ctf') {
            this.drawCtfFlags(ctx);
        } else if (this.config.mode === 'ptb') {
            this.drawPtbSites(ctx);
        }
        // 4. Spawn Pads (Health, Boost, Ammo, Weapons)
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.pads), _step1; !(_step1 = _iterator1()).done;){
            var pad = _step1.value;
            this.drawPad(ctx, pad);
        }
        // 5. Dropped Floor Weapons
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.drops), _step2; !(_step2 = _iterator2()).done;){
            var d = _step2.value;
            ctx.save();
            ctx.translate(d.x, d.y + Math.sin(this.matchTimeSec * 4 + d.x) * 2.5);
            ctx.fillStyle = 'rgba(245, 166, 35, 0.2)';
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fill();
            (0, _DoodleRenderer.drawWeaponVector)(ctx, d.weaponId, 0, 0);
            ctx.restore();
        }
        // 6. Poison Gas Clouds
        for(var _iterator3 = _create_for_of_iterator_helper_loose(this.gasClouds), _step3; !(_step3 = _iterator3()).done;){
            var gc = _step3.value;
            var alpha = Math.min(0.55, gc.ttl / gc.maxTtl * 0.75);
            var radGrad = ctx.createRadialGradient(gc.x, gc.y, 12, gc.x, gc.y, gc.radius);
            radGrad.addColorStop(0, "rgba(132, 204, 22, " + alpha + ")");
            radGrad.addColorStop(1, 'rgba(132, 204, 22, 0)');
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(gc.x, gc.y, gc.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        // 7. Soldiers + M93BA Red Laser Sight + Sightline
        var player = this.getPlayer();
        for(var _iterator4 = _create_for_of_iterator_helper_loose(this.soldiers), _step4; !(_step4 = _iterator4()).done;){
            var s = _step4.value;
            var _ref;
            var _s_offhandSlot;
            if (!s.alive) continue;
            var w = (0, _weapons.getMmWeaponById)(s.activeSlot.weaponId);
            // Iconic M93BA Red Laser Sight (or Player Crosshair sightline)
            if (w.hasLaserSight || s.isPlayer && this.settings.controls.crosshairStyle === 'laser_dot') {
                ctx.save();
                ctx.strokeStyle = w.hasLaserSight ? 'rgba(239, 68, 68, 0.72)' : 'rgba(244, 244, 236, 0.24)';
                ctx.lineWidth = w.hasLaserSight ? 1.8 : 1.2;
                ctx.setLineDash(w.hasLaserSight ? [] : [
                    6,
                    6
                ]);
                ctx.beginPath();
                ctx.moveTo(s.x + Math.cos(s.aimAngle) * 26, s.y - 7 + Math.sin(s.aimAngle) * 26);
                ctx.lineTo(s.x + Math.cos(s.aimAngle) * (w.hasLaserSight ? 950 : 280), s.y - 7 + Math.sin(s.aimAngle) * (w.hasLaserSight ? 950 : 280));
                ctx.stroke();
                ctx.restore();
            }
            var isCrouchStealthEnemy = !s.isPlayer && s.crouching && Math.abs(s.vx) < 12 && player && this.canDamage(player.team, s.team);
            (0, _DoodleRenderer.drawDoodleSoldier)(ctx, {
                x: s.x,
                y: s.y,
                aimAngle: s.aimAngle,
                avatar: s.avatar,
                team: s.team,
                weaponId: s.activeSlot.weaponId,
                offhandWeaponId: (_ref = (_s_offhandSlot = s.offhandSlot) == null ? void 0 : _s_offhandSlot.weaponId) != null ? _ref : null,
                crouching: s.crouching,
                jetpacking: s.jetpacking,
                walkPhase: s.walkPhase,
                scale: s.isBoss ? 1.32 : 1.0,
                hpPct: s.hp / s.maxHp,
                name: s.name,
                showTag: this.settings.video.showNametags && !isCrouchStealthEnemy,
                stealthAlpha: s.isPlayer && s.crouching && Math.abs(s.vx) < 12 ? 0.72 : 1.0,
                spawnShield: s.spawnShieldTimer > 0,
                boosted: s.boostTimer > 0,
                burning: s.burnTimer > 0,
                empDisabled: s.empDisabledTimer > 0,
                carryingFlagColor: s.carryingFlag === 'blue' ? '#2B82D9' : s.carryingFlag === 'red' ? '#D93829' : null,
                muzzleFlash: s.muzzleFlash,
                meleeSwing: s.meleeTimer,
                speechText: s.speechText,
                timeSec: this.matchTimeSec
            });
        }
        // 8. Projectiles
        for(var _iterator5 = _create_for_of_iterator_helper_loose(this.projectiles), _step5; !(_step5 = _iterator5()).done;){
            var pr = _step5.value;
            ctx.save();
            if (pr.kind === 'saw') {
                ctx.translate(pr.x, pr.y);
                ctx.rotate(this.matchTimeSec * 28);
                ctx.fillStyle = '#E2E8F0';
                ctx.strokeStyle = '#111827';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#DC2626';
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (pr.kind === 'rocket') {
                ctx.translate(pr.x, pr.y);
                ctx.rotate(Math.atan2(pr.vy, pr.vx));
                ctx.fillStyle = '#3F6212';
                ctx.strokeStyle = '#111827';
                ctx.lineWidth = 1.8;
                ctx.fillRect(-10, -4, 20, 8);
                ctx.strokeRect(-10, -4, 20, 8);
                ctx.fillStyle = '#EF4444';
                ctx.fillRect(6, -3.5, 5, 7);
            } else if (pr.kind === 'emp') {
                ctx.fillStyle = '#38BDF8';
                ctx.beginPath();
                ctx.arc(pr.x, pr.y, 8 + Math.sin(this.matchTimeSec * 20) * 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else if (pr.kind === 'flame') {
                ctx.fillStyle = pr.ttl > 0.25 ? '#FACC15' : 'rgba(239, 68, 68, 0.72)';
                ctx.beginPath();
                ctx.arc(pr.x, pr.y, 7 + (0.45 - pr.ttl) * 20, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.strokeStyle = '#FDE047';
                ctx.lineWidth = pr.kind === 'pellet' ? 2 : 2.8;
                ctx.beginPath();
                ctx.moveTo(pr.x, pr.y);
                ctx.lineTo(pr.x - pr.vx * 0.018, pr.y - pr.vy * 0.018);
                ctx.stroke();
            }
            ctx.restore();
        }
        // 9. Grenades & Blinking Proximity Mines
        for(var _iterator6 = _create_for_of_iterator_helper_loose(this.grenades), _step6; !(_step6 = _iterator6()).done;){
            var gr = _step6.value;
            ctx.save();
            ctx.translate(gr.x, gr.y);
            var def = (0, _weapons.getMmGrenadeById)(gr.kind);
            ctx.fillStyle = def.color;
            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 2;
            if (gr.kind === 'proxy') {
                ctx.beginPath();
                ctx.roundRect(-7, -4, 14, 8, 3);
                ctx.fill();
                ctx.stroke();
                if (gr.armed && Math.sin(gr.blinkPhase) > 0) {
                    ctx.fillStyle = '#FEF08A';
                    ctx.beginPath();
                    ctx.arc(0, 0, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        }
        // 10. Particles & Shockwaves & Laser Beams
        for(var _iterator7 = _create_for_of_iterator_helper_loose(this.particles), _step7; !(_step7 = _iterator7()).done;){
            var pt = _step7.value;
            ctx.save();
            var alpha1 = Math.max(0, pt.ttl / pt.maxTtl);
            ctx.globalAlpha = alpha1;
            if (pt.kind === 'beam' && pt.x2 !== undefined && pt.y2 !== undefined) {
                ctx.strokeStyle = pt.color;
                ctx.lineWidth = pt.size * 2;
                ctx.beginPath();
                ctx.moveTo(pt.x, pt.y);
                ctx.lineTo(pt.x2, pt.y2);
                ctx.stroke();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else if (pt.kind === 'ring') {
                var r = pt.size * (1 - alpha1 * 0.7);
                ctx.strokeStyle = pt.color;
                ctx.lineWidth = 5 * alpha1;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                ctx.fillStyle = pt.color;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
        ctx.restore();
        // 11. Arctic Snow Overlay
        if (this.map.snowOverlay) {
            ctx.fillStyle = 'rgba(248, 250, 252, 0.55)';
            for(var i = 0; i < 45; i++){
                var sx = ((i * 157 + this.matchTimeSec * 45) % cw + cw) % cw;
                var sy = ((i * 97 + this.matchTimeSec * 85) % ch + ch) % ch;
                ctx.beginPath();
                ctx.arc(sx, sy, i % 3 + 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        // 12. Off-Screen Directional Enemy / Ally Arrows (Crouch Stealth Hides Enemy Arrow!)
        if (this.settings.gameplay.showOffscreenArrows && player) {
            this.drawOffscreenArrows(ctx, player, cw, ch, scale);
        }
        // 13. Desktop Dynamic Crosshair
        if (this.mouseMoved && !this.touchAimActive) {
            ctx.save();
            ctx.translate(this.mouseScreenX, this.mouseScreenY);
            ctx.strokeStyle = '#F5A623';
            ctx.lineWidth = 2;
            var r1 = this.settings.controls.crosshairStyle === 'minimal' ? 5 : 10;
            ctx.beginPath();
            ctx.arc(0, 0, r1, 0, Math.PI * 2);
            ctx.moveTo(-r1 - 5, 0);
            ctx.lineTo(-r1 + 3, 0);
            ctx.moveTo(r1 - 3, 0);
            ctx.lineTo(r1 + 5, 0);
            ctx.moveTo(0, -r1 - 5);
            ctx.lineTo(0, -r1 + 3);
            ctx.moveTo(0, r1 - 3);
            ctx.lineTo(0, r1 + 5);
            ctx.stroke();
            ctx.restore();
        }
    };
    _proto.drawPlatform = function drawPlatform(ctx, pl) {
        ctx.save();
        if (pl.oneWay) {
            ctx.fillStyle = pl.material === 'wood' ? '#92400E' : '#475569';
            ctx.fillRect(pl.x, pl.y, pl.w, Math.min(16, pl.h));
            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(pl.x, pl.y, pl.w, Math.min(16, pl.h));
            ctx.restore();
            return;
        }
        var fill = pl.material === 'ice' ? '#7DD3FC' : pl.material === 'sand' ? '#D97706' : pl.material === 'metal' ? '#334155' : pl.material === 'hazard' ? '#3F3F46' : '#3E4A2E';
        ctx.fillStyle = fill;
        ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
        // Top moss/snow/hazard trim
        ctx.fillStyle = pl.material === 'ice' ? '#E0F2FE' : pl.material === 'sand' ? '#FDE68A' : pl.material === 'hazard' ? '#F59E0B' : pl.material === 'metal' ? '#64748B' : '#4D7C0F';
        ctx.fillRect(pl.x, pl.y, pl.w, Math.min(10, pl.h));
        // Bold comic ink outline
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3;
        ctx.strokeRect(pl.x, pl.y, pl.w, pl.h);
        ctx.restore();
    };
    _proto.drawCtfFlags = function drawCtfFlags(ctx) {
        var _this = this;
        [
            'blue',
            'red'
        ].forEach(function(t) {
            var fl = _this.flags[t];
            if (fl.carrierId) return;
            ctx.save();
            ctx.translate(fl.x, fl.y);
            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(0, 12);
            ctx.lineTo(0, -44);
            ctx.stroke();
            ctx.fillStyle = t === 'blue' ? '#2B82D9' : '#D93829';
            ctx.beginPath();
            ctx.moveTo(0, -44);
            ctx.lineTo(30, -34 + Math.sin(_this.matchTimeSec * 6) * 3);
            ctx.lineTo(0, -22);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });
    };
    _proto.drawPtbSites = function drawPtbSites(ctx) {
        [
            [
                'A',
                this.map.bombSiteA
            ],
            [
                'B',
                this.map.bombSiteB
            ]
        ].forEach(function(param) {
            var lbl = param[0], pos = param[1];
            ctx.save();
            ctx.strokeStyle = '#F5A623';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([
                6,
                4
            ]);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 46, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#F5A623';
            ctx.font = 'bold 16px "Oswald", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("SITE " + lbl, pos.x, pos.y - 52);
            ctx.restore();
        });
        if (this.ptbBombState === 'planted') {
            ctx.save();
            ctx.translate(this.ptbBombX, this.ptbBombY);
            ctx.fillStyle = '#1F2937';
            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 2;
            ctx.fillRect(-12, -8, 24, 16);
            ctx.strokeRect(-12, -8, 24, 16);
            if (Math.sin(this.matchTimeSec * 12) > 0) {
                ctx.fillStyle = '#EF4444';
                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    };
    _proto.drawPad = function drawPad(ctx, pad) {
        ctx.save();
        ctx.translate(pad.x, pad.y);
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 2;
        ctx.fillRect(-16, 4, 32, 7);
        ctx.strokeRect(-16, 4, 32, 7);
        if (!pad.active) {
            ctx.restore();
            return;
        }
        var bob = Math.sin(this.matchTimeSec * 4 + pad.index) * 3;
        ctx.translate(0, -10 + bob);
        if (pad.kind === 'health') {
            ctx.fillStyle = '#F8FAFC';
            ctx.fillRect(-11, -9, 22, 18);
            ctx.strokeRect(-11, -9, 22, 18);
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(-3, -6, 6, 12);
            ctx.fillRect(-6, -3, 12, 6);
        } else if (pad.kind === 'boost') {
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#FEF08A';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚡', 0, 4);
        } else if (pad.kind === 'ammo') {
            ctx.fillStyle = '#4D7C0F';
            ctx.fillRect(-12, -8, 24, 16);
            ctx.strokeRect(-12, -8, 24, 16);
            ctx.fillStyle = '#FACC15';
            ctx.fillRect(-6, -3, 12, 6);
        } else if (pad.weaponId) {
            (0, _DoodleRenderer.drawWeaponVector)(ctx, pad.weaponId, 0, 0);
        }
        ctx.restore();
    };
    _proto.drawOffscreenArrows = function drawOffscreenArrows(ctx, player, cw, ch, scale) {
        var pad = 34;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.soldiers), _step; !(_step = _iterator()).done;){
            var s = _step.value;
            if (!s.alive || s.id === player.id) continue;
            // Crouch stealth hides enemy radar arrows!
            if (s.crouching && Math.abs(s.vx) < 12 && this.canDamage(player.team, s.team)) continue;
            var sx = cw / 2 + (s.x - this.camX) * scale;
            var sy = ch / 2 + (s.y - this.camY) * scale;
            if (sx > 20 && sx < cw - 20 && sy > 20 && sy < ch - 20) continue;
            var ang = Math.atan2(sy - ch / 2, sx - cw / 2);
            var ax = clamp(sx, pad, cw - pad);
            var ay = clamp(sy, pad + 38, ch - pad - 20);
            var isAlly = !this.canDamage(player.team, s.team);
            ctx.save();
            ctx.translate(ax, ay);
            ctx.rotate(ang);
            ctx.fillStyle = isAlly ? '#2B82D9' : '#D93829';
            ctx.strokeStyle = '#0F172A';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(11, 0);
            ctx.lineTo(-7, -7);
            ctx.lineTo(-4, 0);
            ctx.lineTo(-7, 7);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    };
    _proto.bindDesktopInputs = function bindDesktopInputs() {
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        this.canvas.addEventListener('mousemove', this.onMouseMove);
        this.canvas.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mouseup', this.onMouseUp);
        this.canvas.addEventListener('wheel', this.onWheel, {
            passive: false
        });
        this.canvas.addEventListener('contextmenu', this.onContextMenu);
    };
    _proto.unbindDesktopInputs = function unbindDesktopInputs() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mouseup', this.onMouseUp);
        this.canvas.removeEventListener('wheel', this.onWheel);
        this.canvas.removeEventListener('contextmenu', this.onContextMenu);
    };
    // ==================== HUD SNAPSHOT & MATCH FINISH ====================
    _proto.buildScoreboard = function buildScoreboard() {
        var _ref;
        var _sorted_;
        var sorted = [].concat(this.soldiers).filter(function(s) {
            return !s.isTargetDummy;
        }).sort(function(a, b) {
            return b.kills - a.kills || a.deaths - b.deaths;
        });
        var topId = (_ref = (_sorted_ = sorted[0]) == null ? void 0 : _sorted_.id) != null ? _ref : '';
        return sorted.map(function(s) {
            return {
                id: s.id,
                name: s.name,
                team: s.team,
                isPlayer: s.isPlayer,
                kills: s.kills,
                deaths: s.deaths,
                assists: s.assists,
                captures: s.captures,
                pingMs: s.isPlayer ? 18 : 24 + s.name.length * 7 % 36,
                alive: s.alive,
                isMvp: s.id === topId && s.kills > 0
            };
        });
    };
    _proto.finishMatch = function finishMatch() {
        var _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
        var _sb_;
        if (this.matchEnded) return;
        this.matchEnded = true;
        var p = this.getPlayer();
        var sb = this.buildScoreboard();
        var playerRow = sb.find(function(r) {
            return r.isPlayer;
        });
        var victory = false;
        if (this.config.mode === 'bootcamp') victory = this.bootcampStep >= 7;
        else if (this.config.mode === 'survival') victory = this.survivalWave >= 3;
        else if (this.config.mode === 'ffa') victory = (_ref = (_sb_ = sb[0]) == null ? void 0 : _sb_.isPlayer) != null ? _ref : false;
        else {
            var _ref6;
            var pTeam = (_ref6 = p == null ? void 0 : p.team) != null ? _ref6 : 'blue';
            victory = pTeam === 'blue' ? this.scoreBlue >= this.scoreRed : this.scoreRed >= this.scoreBlue;
        }
        var kills = (_ref1 = p == null ? void 0 : p.kills) != null ? _ref1 : 0;
        var xpEarned = Math.round(180 + kills * 55 + this.playerHeadshots * 25 + (victory ? 320 : 100) + (this.config.mode === 'survival' ? this.survivalWave * 95 : 0));
        var coinsEarned = Math.round(120 + kills * 28 + (victory ? 180 : 60));
        var cashEarned = Math.round((victory ? 45 : 18) + this.playerRankCashEarned + Math.floor(kills / 4) * 10);
        var summary = {
            victory: victory,
            mode: this.config.mode,
            mapId: this.map.id,
            mapName: this.map.name,
            scoreBlue: this.scoreBlue,
            scoreRed: this.scoreRed,
            playerKills: kills,
            playerDeaths: (_ref2 = p == null ? void 0 : p.deaths) != null ? _ref2 : 0,
            playerAssists: (_ref3 = p == null ? void 0 : p.assists) != null ? _ref3 : 0,
            headshots: this.playerHeadshots,
            meleeKills: this.playerMeleeKills,
            grenadeKills: this.playerGrenadeKills,
            dualWieldKills: this.playerDualKills,
            sniperHeadshots: this.playerSniperHeadshots,
            macheteKills: this.playerMacheteKills,
            smawKills: this.playerSmawKills,
            flameKills: this.playerFlameKills,
            sawKills: this.playerSawKills,
            flagCaptures: this.playerFlagCaptures,
            bombActions: this.playerBombActions,
            suicides: this.playerSuicides,
            bestStreak: (_ref4 = p == null ? void 0 : p.bestStreak) != null ? _ref4 : 0,
            bestMultiKill: (_ref5 = p == null ? void 0 : p.bestMultiKill) != null ? _ref5 : 0,
            waveReached: this.config.mode === 'survival' ? this.survivalWave : 0,
            durationSec: this.matchTimeSec,
            isMvp: Boolean(playerRow == null ? void 0 : playerRow.isMvp),
            xpEarned: xpEarned,
            coinsEarned: coinsEarned,
            cashEarned: cashEarned,
            weaponDeltas: this.weaponDeltas,
            scoreboard: sb
        };
        this.lastMatchSummary = summary;
        this.emitHud();
        this.onMatchFinish(summary);
    };
    _proto.emitHud = function emitHud() {
        var _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
        var _sb_;
        var p = this.getPlayer();
        if (!p) return;
        var activeW = (0, _weapons.getMmWeaponById)(p.activeSlot.weaponId);
        var offW = p.offhandSlot ? (0, _weapons.getMmWeaponById)(p.offhandSlot.weaponId) : null;
        var holW = p.holsteredSlot ? (0, _weapons.getMmWeaponById)(p.holsteredSlot.weaponId) : null;
        var sb = this.buildScoreboard();
        var ffaRank = Math.max(1, sb.findIndex(function(r) {
            return r.isPlayer;
        }) + 1);
        var bootcampPrompts = [
            'Step 1/7: Move Left/Right (A/D) & Crouch (S)',
            'Step 2/7: Ignite Rocket Boots (W / Space / Left Stick Up)',
            "Step 3/7: Destroy 3 Cardboard Targets (" + this.bootcampTargetsKilled + "/3)",
            'Step 4/7: Press Z (Zoom) and hit the Sniper target!',
            'Step 5/7: Melee Attack (F / Punch) the close dummy!',
            'Step 6/7: Throw a Frag Grenade (G / Grenade Button)!',
            'Step 7/7: Pick up & Dual Wield the Uzi (X / +Dual Wield)!',
            'Boot Camp Graduated!'
        ];
        var ptbPrompt = null;
        if (this.config.mode === 'ptb' && p.alive) {
            if (p.team === 'red' && this.ptbBombState === 'carried' && (dist(p.x, p.y, this.map.bombSiteA.x, this.map.bombSiteA.y) < 75 || dist(p.x, p.y, this.map.bombSiteB.x, this.map.bombSiteB.y) < 75)) {
                ptbPrompt = 'plant';
            } else if (p.team === 'blue' && this.ptbBombState === 'planted' && dist(p.x, p.y, this.ptbBombX, this.ptbBombY) < 72) {
                ptbPrompt = 'defuse';
            }
        }
        this.onHudUpdate({
            mode: this.config.mode,
            mapId: this.map.id,
            mapName: this.map.name,
            classicV4: this.config.classicV4,
            timeRemainingSec: Math.ceil(this.timeRemainingSec),
            scoreBlue: this.scoreBlue,
            scoreRed: this.scoreRed,
            scoreLimit: this.config.scoreLimit,
            ffaRank: ffaRank,
            ffaLeaderKills: (_ref = (_sb_ = sb[0]) == null ? void 0 : _sb_.kills) != null ? _ref : 0,
            survivalWave: this.survivalWave,
            survivalEnemiesAlive: this.soldiers.filter(function(s) {
                return s.team === 'red' && s.alive;
            }).length,
            ptbRound: this.ptbRound,
            ptbBlueRounds: this.ptbBlueRounds,
            ptbRedRounds: this.ptbRedRounds,
            ptbBombState: this.ptbBombState,
            ptbBombTimer: Math.ceil(this.ptbBombTimer),
            ptbBombSite: this.ptbBombSite,
            ptbCanPlantOrDefuse: ptbPrompt,
            ptbActionProgress: this.ptbActionProgress,
            bootcampStep: this.bootcampStep,
            bootcampPrompt: bootcampPrompts[Math.min(bootcampPrompts.length - 1, this.bootcampStep)],
            bootcampDone: this.bootcampStep >= 7,
            fps: Math.round(this.fpsSamples),
            pingMs: 18,
            player: {
                alive: p.alive,
                respawnSec: Math.ceil(p.respawnTimer),
                hp: Math.ceil(p.hp),
                maxHp: p.maxHp,
                jetFuel: Math.round(p.jetFuel),
                maxJetFuel: p.maxJetFuel,
                empDisabledSec: Math.ceil(p.empDisabledTimer),
                boostTimer: Math.ceil(p.boostTimer),
                crouching: p.crouching,
                stealthHidden: p.crouching && Math.abs(p.vx) < 12,
                carryingFlag: Boolean(p.carryingFlag),
                team: p.team,
                kills: p.kills,
                deaths: p.deaths,
                assists: p.assists,
                streak: p.streak,
                activeWeaponId: activeW.id,
                activeWeaponName: activeW.shortName,
                offhandWeaponId: (_ref1 = offW == null ? void 0 : offW.id) != null ? _ref1 : null,
                offhandWeaponName: (_ref2 = offW == null ? void 0 : offW.shortName) != null ? _ref2 : null,
                holsteredWeaponId: (_ref3 = holW == null ? void 0 : holW.id) != null ? _ref3 : null,
                holsteredWeaponName: (_ref4 = holW == null ? void 0 : holW.shortName) != null ? _ref4 : null,
                mag: Math.floor(p.activeSlot.mag),
                magMax: activeW.magSize,
                reserve: p.activeSlot.reserve,
                offhandMag: p.offhandSlot ? Math.floor(p.offhandSlot.mag) : 0,
                offhandMagMax: (_ref5 = offW == null ? void 0 : offW.magSize) != null ? _ref5 : 0,
                reloading: p.reloading,
                reloadProgress: p.reloading ? 1 - p.reloadTimer / Math.max(0.1, p.reloadDuration) : 0,
                spinUpProgress: activeW.spinUpSec ? p.spinUpTimer / activeW.spinUpSec : 0,
                grenadeType: p.grenadeType,
                grenades: _extends({}, p.grenades),
                zoomLevel: Number(this.targetZoom.toFixed(1)),
                zoomMax: this.getMaxZoomForPlayer(p),
                coins: this.playerCoins,
                activeLoadoutId: p.activeLoadoutId
            },
            nearbyPickup: this.findNearbyPickup(p),
            killFeed: [].concat(this.killFeed),
            banner: this.banner ? _extends({}, this.banner) : null,
            scoreboard: sb,
            matchEnded: this.matchEnded,
            matchResult: this.lastMatchSummary
        });
    };
    return MiniMilitiaGameEngine;
}();

});

})(window.ArcadeMod);
