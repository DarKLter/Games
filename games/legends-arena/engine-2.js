(function(ArcadeMod){
// === MODULE: src/games/legends-arena/LegendsArena3DCombat ===
ArcadeMod.define("src/games/legends-arena/LegendsArena3DCombat", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LegendsArena3DCombat", {
    enumerable: true,
    get: function() {
        return LegendsArena3DCombat;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _arenaRoster = require("../../core/arenaRoster");
var _audio = require("../../core/audio");
var _runtimeBridge = require("../../core/runtimeBridge");
var _storage = require("../../core/storage");
var _mobaElementalVfx = require("./mobaElementalVfx");
var _threeShared = require("../../core/threeShared");
var _LegendsArena3DWorld = require("./LegendsArena3DWorld");
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
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) return obj;
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") return {
        default: obj
    };
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) return cache.get(obj);
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
            else newObj[key] = obj[key];
        }
    }
    newObj.default = obj;
    if (cache) cache.set(obj, newObj);
    return newObj;
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
var LegendsArena3DCombat = /*#__PURE__*/ function(LegendsArena3DWorld) {
    "use strict";
    _inherits(LegendsArena3DCombat, LegendsArena3DWorld);
    function LegendsArena3DCombat() {
        return LegendsArena3DWorld.apply(this, arguments) || this;
    }
    var _proto = LegendsArena3DCombat.prototype;
    _proto.spawnDamageNumber = function spawnDamageNumber(wx, wz, amount, kind) {
        if (!_storage.playerState.mobaSettings.damageText) return;
        var color = kind === 'heal' ? '#4ade80' : kind === 'true' ? '#f8fafc' : kind === 'magic' ? '#c084fc' : kind === 'crit' ? '#facc15' : '#fb923c';
        var prefix = kind === 'heal' ? '+' : kind === 'crit' ? 'CRIT ' : '';
        this.floatingDmgNums.push({
            wx: wx + (Math.random() - 0.5) * 1.1,
            wy: 2.8 + Math.random() * 0.5,
            wz: wz + (Math.random() - 0.5) * 1.1,
            text: "" + prefix + Math.max(1, Math.round(amount)),
            color: color,
            life: 0.85,
            maxLife: 0.85,
            isCrit: kind === 'crit'
        });
        if (this.floatingDmgNums.length > 36) this.floatingDmgNums.shift();
    };
    _proto.spawnAfterimageGhost = function spawnAfterimageGhost(x, y, z, yaw, tintColor) {
        var ghost = new _three.Group();
        var mat = new _three.MeshBasicMaterial({
            color: tintColor,
            transparent: true,
            opacity: 0.45
        });
        var torso = new _three.Mesh(new _three.BoxGeometry(1.0, 1.5, 0.7), mat);
        torso.position.y = 1.45;
        var head = new _three.Mesh(new _three.SphereGeometry(0.42, 8, 8), mat);
        head.position.y = 2.5;
        ghost.add(torso, head);
        ghost.position.set(x, y, z);
        ghost.rotation.y = yaw;
        this.three.scene.add(ghost);
        this.fxObjs.push({
            mesh: ghost,
            life: 0.34,
            maxLife: 0.34,
            mode: 'ghost'
        });
    };
    _proto.startPlayerMotion = function startPlayerMotion(kind, dist, duration, peakY) {
        if (peakY === void 0) peakY = 0;
        var dir = kind === 'snap_back' ? -1 : 1;
        var endX = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.px + Math.sin(this.pYaw) * dist * dir));
        var endZ = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.pz + Math.cos(this.pYaw) * dist * dir));
        this.spawnAfterimageGhost(this.px, this.py, this.pz, this.pYaw, this.heroBladeColor);
        this.activeMotion = {
            kind: kind,
            startX: this.px,
            startZ: this.pz,
            endX: endX,
            endZ: endZ,
            elapsed: 0,
            duration: Math.max(0.12, duration),
            peakY: peakY,
            ghostAcc: 0
        };
    };
    _proto.findNearestEnemyTarget = function findNearestEnemyTarget() {
        var _this = this;
        var maxSearch = Math.max(this.atkRange + 6, 18);
        // 1. Respect Hero Lock Mode target if alive & in range
        if (_storage.playerState.mobaSettings.heroLockMode && this.lockedEnemyId !== null) {
            var locked = this.actors.find(function(a) {
                return a.id === _this.lockedEnemyId && a.alive && a.team === 'red';
            });
            if (locked) {
                var d = Math.hypot(locked.x - this.px, locked.z - this.pz);
                if (d <= maxSearch + 10) {
                    return {
                        x: locked.x,
                        z: locked.z,
                        angle: Math.atan2(locked.x - this.px, locked.z - this.pz),
                        dist: d,
                        actor: locked
                    };
                }
            }
        }
        var preferLowestHp = _storage.playerState.mobaSettings.targetPriority === 'lowest_hp';
        var bestScore = Infinity;
        var best = null;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.actors), _step; !(_step = _iterator()).done;){
            var a = _step.value;
            if (!a.alive || a.team !== 'red') continue;
            var d1 = Math.hypot(a.x - this.px, a.z - this.pz);
            if (d1 > maxSearch) continue;
            // Prioritize heroes over minions, and lowest HP when setting enabled
            var heroBias = a.kind === 'hero' ? 0 : 120;
            var metric = preferLowestHp ? heroBias + a.hp / Math.max(1, a.maxHp) * 80 + d1 * 0.6 : heroBias * 0.25 + d1;
            if (metric < bestScore) {
                bestScore = metric;
                best = {
                    x: a.x,
                    z: a.z,
                    angle: Math.atan2(a.x - this.px, a.z - this.pz),
                    dist: d1,
                    actor: a
                };
            }
        }
        if (best) return best;
        var bestD = maxSearch;
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.jungleCamps), _step1; !(_step1 = _iterator1()).done;){
            var jc = _step1.value;
            if (!jc.alive) continue;
            var d2 = Math.hypot(jc.x - this.px, jc.z - this.pz);
            if (d2 < bestD) {
                bestD = d2;
                best = {
                    x: jc.x,
                    z: jc.z,
                    angle: Math.atan2(jc.x - this.px, jc.z - this.pz),
                    dist: d2
                };
            }
        }
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.turrets), _step2; !(_step2 = _iterator2()).done;){
            var t = _step2.value;
            if (!t.alive || t.team !== 'red') continue;
            var d3 = Math.hypot(t.x - this.px, t.z - this.pz);
            if (d3 < bestD) {
                bestD = d3;
                best = {
                    x: t.x,
                    z: t.z,
                    angle: Math.atan2(t.x - this.px, t.z - this.pz),
                    dist: d3
                };
            }
        }
        return best;
    };
    _proto.triggerTyphoonChain = function triggerTyphoonChain(centerX, centerZ, chainDmg) {
        var hits = 0;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.actors), _step; !(_step = _iterator()).done;){
            var a = _step.value;
            if (!a.alive || a.team !== 'red') continue;
            if (Math.hypot(a.x - centerX, a.z - centerZ) <= 9.5) {
                this.damageEnemyActor(a, chainDmg);
                hits++;
                if (hits >= 3) break;
            }
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.jungleCamps), _step1; !(_step1 = _iterator1()).done;){
            var jc = _step1.value;
            if (!jc.alive || hits >= 3) continue;
            if (Math.hypot(jc.x - centerX, jc.z - centerZ) <= 9.5) {
                this.damageJungleCamp(jc, chainDmg);
                hits++;
            }
        }
        if (hits > 0) {
            this.spawnVfx('lightning', centerX, centerZ, 5.2, 0x38bdf8);
        }
    };
    _proto.applyHeroPassiveOnHit = function applyHeroPassiveOnHit(baseDmg, dist) {
        this.hitCounter++;
        var kind = this.combatKit.passiveKind;
        if (this.passiveStacks < this.combatKit.maxStacks) {
            this.passiveStacks++;
        }
        var mult = 1.0;
        if (this.giantTimer > 0) mult *= 1.25;
        if (kind === 'longshot_scale') {
            mult *= 1 + Math.min(0.35, dist * 0.022);
        } else if (kind === 'crit_6th' && this.hitCounter % 6 === 0) {
            mult *= 1.8;
            this.spawnVfx('lightning', this.px, this.pz, 4.5, 0xfacc15);
        } else if (kind === 'true_5th' && this.hitCounter % 5 === 0) {
            mult *= 1.6;
            this.lives = Math.min(this.maxLives, this.lives + 8);
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        } else if ((kind === 'hit_3_proc' || kind === 'burn_stacks') && this.hitCounter % 3 === 0) {
            mult *= 1.45;
            this.lives = Math.min(this.maxLives, this.lives + 10);
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        } else if (kind === 'lifesteal_aura') {
            this.lives = Math.min(this.maxLives, this.lives + Math.round(baseDmg * 0.14));
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        } else if (kind === 'cd_on_hit') {
            this.cdSkill1 = Math.max(0, this.cdSkill1 - 0.35);
            this.cdSkill2 = Math.max(0, this.cdSkill2 - 0.35);
        } else if (kind === 'atk_speed_stack') {
            mult *= 1 + this.passiveStacks * 0.04;
        }
        // Equipment: Critical Strike (unless Golden Staff disables crits)
        if (this.computedStats.critChance > 0 && Math.random() * 100 < this.computedStats.critChance) {
            mult *= this.computedStats.critMult;
            this.spawnVfx('ring', this.px, this.pz, 3.2, 0xfacc15);
            if (this.equippedItemIds.includes('haas_claws')) {
                this.hasteTimer = Math.max(this.hasteTimer, 1.5);
            }
        }
        // Equipment: Golden Staff (Endless Strike every 3rd basic attack)
        if (this.equippedItemIds.includes('golden_staff') && this.hitCounter % 3 === 0) {
            mult *= 1.38;
        }
        // Equipment: Endless Battle / Calamity Reaper / Starlium Scythe (Divine Justice / Crisis)
        if (this.divineJusticePrimed && this.computedStats.hasDivineJustice) {
            this.divineJusticePrimed = false;
            mult *= 1.45;
            this.hasteTimer = Math.max(this.hasteTimer, 1.8);
            this.spawnVfx('ring', this.px, this.pz, 3.8, 0xfef08a);
        }
        // Equipment: Blade of the Heptaseas / Shadow Twinblades (Ambush)
        if (this.outOfCombatSec >= 5 && this.computedStats.hasAmbush) {
            mult *= 1.42;
            this.spawnVfx('slash_arc', this.px, this.pz, 4.8, 0xf43f5e);
        }
        this.outOfCombatSec = 0;
        // Equipment: Hunter Strike (Retribution 5-hit haste)
        if (this.equippedItemIds.includes('hunter_strike') && this.hitCounter % 5 === 0) {
            this.hasteTimer = Math.max(this.hasteTimer, 2.5);
        }
        // Keystone Talent: Concussive Blast (every 4th attack detonates HP-scaled AoE shockwave)
        if (this.keystoneT3 === 'concussive_blast' && this.hitCounter % 4 === 0) {
            var blastDmg = Math.max(18, Math.round(this.maxLives * 0.08));
            this.spawnVfx('ring', this.px, this.pz, 6.2, 0xf97316);
            for(var _iterator = _create_for_of_iterator_helper_loose(this.actors), _step; !(_step = _iterator()).done;){
                var a = _step.value;
                if (a.alive && a.team === 'red' && Math.hypot(a.x - this.px, a.z - this.pz) < 6.4) {
                    this.damageEnemyActor(a, blastDmg, true, 'magic');
                }
            }
        }
        // Equipment: Windtalker / Lightning Truncheon (Typhoon / Resonate every 4th hit)
        if (this.computedStats.hasTyphoon && this.hitCounter % 4 === 0) {
            this.triggerTyphoonChain(this.px, this.pz, Math.round(baseDmg * 0.55));
        }
        var finalDmg = Math.round(baseDmg * mult);
        // Equipment: Lifesteal & Spell Vamp sustain
        if (this.computedStats.lifestealRatio > 0) {
            var heal = Math.max(1, Math.round(finalDmg * this.computedStats.lifestealRatio * 0.45));
            this.lives = Math.min(this.maxLives, this.lives + heal);
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
            this.spawnDamageNumber(this.px, this.pz, heal, 'heal');
        }
        return finalDmg;
    };
    _proto.attack = function attack() {
        if (this.gameOver || this.isPaused || this.basicCd > 0 || this.frozenTimer > 0) return;
        var itemAtkSpeedFactor = Math.max(0.45, 1 / this.computedStats.atkSpeedMult);
        var speedBoost = itemAtkSpeedFactor * (this.inspireTimer > 0 ? 0.52 : 1.0) * (this.combatKit.passiveKind === 'atk_speed_stack' ? Math.max(0.68, 1 - this.passiveStacks * 0.05) : 1.0);
        var effectiveDmg = this.inspireTimer > 0 ? Math.round(this.atkDmg * 1.45) : this.atkDmg;
        this.basicCd = (this.heroDef.weapon === 'daggers' ? 0.27 : 0.35) * speedBoost;
        this.recallTimer = 0;
        this.stealthTimer = 0;
        this.bushRevealTimer = 2.0;
        this.castAnimTimer = 0.22;
        var tgt = this.findNearestEnemyTarget();
        var ang = tgt ? tgt.angle : this.pYaw;
        var dist = tgt ? tgt.dist : 8;
        var dmg = this.applyHeroPassiveOnHit(effectiveDmg, dist);
        // Keystone Talent: Weakness Finder (slows enemies 50% on basic attack)
        var weaknessSlow = this.keystoneT3 === 'weakness_finder' && this.weaknessFinderCd <= 0 ? 1.2 : 0;
        if (weaknessSlow > 0) this.weaknessFinderCd = 3.0;
        if (this.isRanged || this.giantTimer > 0) {
            _audio.ArcadeAudio.play('shoot');
            this.pYaw = ang;
            var lifeSec = this.heroDef.archetype === 'snipe' ? 0.95 : 0.7;
            this.firePlayerBolt(ang, dmg, lifeSec, undefined, this.heroBaseElement, 0.92);
            if (this.combatKit.passiveKind === 'pet_companion' || this.combatKit.passiveKind === 'atk_speed_stack' && this.passiveStacks >= 5) {
                this.firePlayerBolt(ang + 0.1, Math.round(dmg * 0.5), lifeSec, undefined, this.heroBaseElement, 0.85);
            }
            this.spawnElementalVfx(this.heroBaseElement, 'ring', this.px, this.pz, 2.5, ang);
            return;
        }
        _audio.ArcadeAudio.play('slash');
        this.spawnElementalVfx(this.heroBaseElement, 'slash_arc', this.px, this.pz, 4.4, ang);
        if (this.combatKit.passiveKind === 'pet_companion') {
            this.firePlayerBolt(ang, Math.round(dmg * 0.5), 0.55, undefined, this.heroBaseElement, 0.9);
        }
        var slowFromHit = Math.max(this.redBuffTimer > 0 || this.computedStats.hasIceBound ? 1.5 : 0, weaknessSlow);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.actors), _step; !(_step = _iterator()).done;){
            var a = _step.value;
            if (a.alive && a.team === 'red' && Math.hypot(a.x - this.px, a.z - this.pz) < this.atkRange + 0.8) {
                if (slowFromHit > 0) a.slowTimer = Math.max(a.slowTimer, slowFromHit);
                this.damageEnemyActor(a, dmg, true, 'phys');
            }
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.jungleCamps), _step1; !(_step1 = _iterator1()).done;){
            var jc = _step1.value;
            if (jc.alive && Math.hypot(jc.x - this.px, jc.z - this.pz) < this.atkRange + 2.0) {
                this.damageJungleCamp(jc, dmg);
            }
        }
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.turrets), _step2; !(_step2 = _iterator2()).done;){
            var t = _step2.value;
            if (t.alive && t.team === 'red' && Math.hypot(t.x - this.px, t.z - this.pz) < this.atkRange + 2.2) {
                this.damageTurret(t, dmg);
            }
        }
    };
    _proto.launchIconicUlt = function launchIconicUlt(kind, dmg, spec, aimOverride) {
        if (kind === 'tigreal_implosion') {
            var grp = new _three.Group();
            var ring = new _three.Mesh(new _three.RingGeometry(1.5, 9.2, 36), new _three.MeshBasicMaterial({
                color: 0xfacc15,
                side: _three.DoubleSide,
                transparent: true,
                opacity: 0.58,
                polygonOffset: true,
                polygonOffsetFactor: -2
            }));
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.18;
            grp.add(ring);
            var tethered = [];
            for(var _iterator = _create_for_of_iterator_helper_loose(this.actors), _step; !(_step = _iterator()).done;){
                var a = _step.value;
                if (a.alive && a.team === 'red' && Math.hypot(a.x - this.px, a.z - this.pz) <= 10.5) {
                    tethered.push(a);
                    var dx = a.x - this.px;
                    var dz = a.z - this.pz;
                    var len = Math.max(1, Math.hypot(dx, dz));
                    var chain = new _three.Mesh(new _three.CylinderGeometry(0.14, 0.14, len, 6), new _three.MeshBasicMaterial({
                        color: 0xfef08a
                    }));
                    chain.rotation.x = Math.PI / 2;
                    chain.rotation.z = -Math.atan2(dx, dz);
                    chain.position.set(dx / 2, 1.4, dz / 2);
                    grp.add(chain);
                }
            }
            grp.position.set(this.px, 0, this.pz);
            this.three.scene.add(grp);
            this.activeUltSetpieces.push({
                kind: kind,
                group: grp,
                cx: this.px,
                cz: this.pz,
                life: 0.95,
                maxLife: 0.95,
                tickAcc: 0,
                detonated: false,
                baseDmg: dmg,
                tetherTargets: tethered
            });
            this.showKillfeed('🛡️ TIGREAL: IMPLOSION — GRAVITY VORTEX!');
            return;
        }
        if (kind === 'lancelot_thorned_rose') {
            this.untargetableTimer = Math.max(this.untargetableTimer, 0.95);
            var cx = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.px + Math.sin(this.pYaw) * 4.5));
            var cz = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.pz + Math.cos(this.pYaw) * 4.5));
            var grp1 = new _three.Group();
            var roseMat = new _three.MeshBasicMaterial({
                color: 0xf472b6,
                side: _three.DoubleSide,
                transparent: true,
                opacity: 0.78,
                polygonOffset: true,
                polygonOffsetFactor: -3
            });
            for(var i = 0; i < 3; i++){
                var ang = i * Math.PI * 2 / 3 + this.pYaw;
                var slash = new _three.Mesh(new _three.PlaneGeometry(1.15, 11.5), roseMat.clone());
                slash.rotation.x = -Math.PI / 2;
                slash.rotation.z = ang;
                slash.position.set(Math.sin(ang) * 2.1, 0.22 + i * 0.03, Math.cos(ang) * 2.1);
                grp1.add(slash);
                this.spawnAfterimageGhost(cx + Math.sin(ang) * 4.4, 0, cz + Math.cos(ang) * 4.4, ang + Math.PI, 0xf472b6);
            }
            grp1.position.set(cx, 0, cz);
            this.three.scene.add(grp1);
            this.activeUltSetpieces.push({
                kind: kind,
                group: grp1,
                cx: cx,
                cz: cz,
                life: 0.85,
                maxLife: 0.85,
                tickAcc: 0,
                detonated: false,
                baseDmg: dmg
            });
            this.showKillfeed('🌹 LANCELOT: THORNED ROSE — INVULNERABLE TRIANGLE!');
            return;
        }
        if (kind === 'johnson_car') {
            // Remove any existing car form first
            var existingIdx = this.activeUltSetpieces.findIndex(function(s) {
                return s.kind === 'johnson_car';
            });
            if (existingIdx >= 0) {
                var cur = this.activeUltSetpieces[existingIdx];
                this.detonateJohnsonCrash(cur);
                (0, _LegendsArena3DWorld.disposeObjectTree)(cur.group);
                this.three.scene.remove(cur.group);
                this.activeUltSetpieces.splice(existingIdx, 1);
                return;
            }
            var car = new _three.Group();
            var chassis = new _three.Mesh(new _three.BoxGeometry(2.5, 0.95, 4.8), (0, _threeShared.createToonMaterial)(0x1d4ed8, {
                emissive: 0x38bdf8,
                emissiveIntensity: 0.3
            }));
            chassis.position.y = 0.85;
            var cabin = new _three.Mesh(new _three.BoxGeometry(2.05, 0.72, 2.2), (0, _threeShared.createToonMaterial)(0x0f172a));
            cabin.position.set(0, 1.55, -0.2);
            var stripe = new _three.Mesh(new _three.BoxGeometry(0.45, 0.12, 4.85), new _three.MeshBasicMaterial({
                color: 0xfacc15
            }));
            stripe.position.set(0, 1.35, 0);
            var hlMat = new _three.MeshBasicMaterial({
                color: 0xfef08a
            });
            var hlL = new _three.Mesh(new _three.SphereGeometry(0.24, 8, 8), hlMat);
            hlL.position.set(-0.85, 0.9, 2.42);
            var hlR = new _three.Mesh(new _three.SphereGeometry(0.24, 8, 8), hlMat);
            hlR.position.set(0.85, 0.9, 2.42);
            var flameMat = new _three.MeshBasicMaterial({
                color: 0xf97316,
                transparent: true,
                opacity: 0.85
            });
            var exL = new _three.Mesh(new _three.ConeGeometry(0.26, 1.35, 8), flameMat);
            exL.rotation.x = -Math.PI / 2;
            exL.position.set(-0.65, 0.65, -2.95);
            var exR = new _three.Mesh(new _three.ConeGeometry(0.26, 1.35, 8), flameMat);
            exR.rotation.x = -Math.PI / 2;
            exR.position.set(0.65, 0.65, -2.95);
            var wheelMat = (0, _threeShared.createToonMaterial)(0x111827);
            var wheelGeo = new _three.CylinderGeometry(0.46, 0.46, 0.35, 10);
            wheelGeo.rotateZ(Math.PI / 2);
            for(var _i = 0, _iter = [
                [
                    -1.3,
                    1.5
                ],
                [
                    1.3,
                    1.5
                ],
                [
                    -1.3,
                    -1.5
                ],
                [
                    1.3,
                    -1.5
                ]
            ]; _i < _iter.length; _i++){
                var _iter__i = _iter[_i], wx = _iter__i[0], wz = _iter__i[1];
                var w = new _three.Mesh(wheelGeo, wheelMat);
                w.position.set(wx, 0.46, wz);
                car.add(w);
            }
            car.add(chassis, cabin, stripe, hlL, hlR, exL, exR);
            car.position.set(this.px, 0, this.pz);
            car.rotation.y = this.pYaw;
            this.three.scene.add(car);
            this.hasteTimer = Math.max(this.hasteTimer, 5.5);
            this.ccImmuneTimer = Math.max(this.ccImmuneTimer, 5.5);
            this.activeUltSetpieces.push({
                kind: kind,
                group: car,
                cx: this.px,
                cz: this.pz,
                life: 5.5,
                maxLife: 5.5,
                tickAcc: 0,
                detonated: false,
                baseDmg: dmg
            });
            this.showKillfeed('🚗 JOHNSON: FULL THROTTLE — RAM ENEMIES FOR SHOCK CRASH!');
            return;
        }
        if (kind === 'yve_chessboard') {
            var cx1 = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.px + Math.sin(this.pYaw) * 6.5));
            var cz1 = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.pz + Math.cos(this.pYaw) * 6.5));
            var board = new _three.Group();
            var tileSize = 2.0;
            var tileGeo = new _three.PlaneGeometry(tileSize * 0.92, tileSize * 0.92);
            var matA = new _three.MeshBasicMaterial({
                color: 0x6d28d9,
                side: _three.DoubleSide,
                transparent: true,
                opacity: 0.56,
                polygonOffset: true,
                polygonOffsetFactor: -2
            });
            var matB = new _three.MeshBasicMaterial({
                color: 0x312e81,
                side: _three.DoubleSide,
                transparent: true,
                opacity: 0.56,
                polygonOffset: true,
                polygonOffsetFactor: -2
            });
            for(var gx = -3; gx <= 3; gx++){
                for(var gz = -3; gz <= 3; gz++){
                    var tile = new _three.Mesh(tileGeo, (gx + gz) % 2 === 0 ? matA : matB);
                    tile.rotation.x = -Math.PI / 2;
                    tile.position.set(gx * tileSize, 0.16, gz * tileSize);
                    board.add(tile);
                }
            }
            var frame = new _three.Mesh(new _three.RingGeometry(9.6, 10.2, 4), new _three.MeshBasicMaterial({
                color: 0xfacc15,
                side: _three.DoubleSide,
                transparent: true,
                opacity: 0.85
            }));
            frame.rotation.x = -Math.PI / 2;
            frame.rotation.z = Math.PI / 4;
            frame.position.y = 0.2;
            board.add(frame);
            board.position.set(cx1, 0, cz1);
            this.three.scene.add(board);
            this.shieldTimer = Math.max(this.shieldTimer, 4.5);
            this.ccImmuneTimer = Math.max(this.ccImmuneTimer, 4.5);
            this.activeUltSetpieces.push({
                kind: kind,
                group: board,
                cx: cx1,
                cz: cz1,
                life: 4.5,
                maxLife: 4.5,
                tickAcc: 0,
                detonated: false,
                baseDmg: Math.round(dmg * 0.45)
            });
            this.showKillfeed('♟️ YVE: REAL WORLD MANIPULATION — 7x7 STARFIELD CHESSBOARD!');
            return;
        }
        if (kind === 'kagura_overturn') {
            var tgt = aimOverride ? null : this.findNearestEnemyTarget();
            var cx2 = aimOverride ? aimOverride.aimX : tgt ? tgt.x : Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.px + Math.sin(this.pYaw) * 7.5));
            var cz2 = aimOverride ? aimOverride.aimZ : tgt ? tgt.z : Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.pz + Math.cos(this.pYaw) * 7.5));
            var grp2 = new _three.Group();
            var canopy = new _three.Mesh(new _three.ConeGeometry(2.1, 0.9, 12), (0, _threeShared.createToonMaterial)(0x7c3aed, {
                emissive: 0xc084fc,
                emissiveIntensity: 0.55
            }));
            canopy.position.y = 2.4;
            var pole = new _three.Mesh(new _three.CylinderGeometry(0.08, 0.08, 2.5, 8), (0, _threeShared.createToonMaterial)(0xfef08a));
            pole.position.y = 1.25;
            var ring1 = new _three.Mesh(new _three.RingGeometry(1.2, 8.6, 32), new _three.MeshBasicMaterial({
                color: 0xa855f7,
                side: _three.DoubleSide,
                transparent: true,
                opacity: 0.42,
                polygonOffset: true,
                polygonOffsetFactor: -2
            }));
            ring1.rotation.x = -Math.PI / 2;
            ring1.position.y = 0.18;
            grp2.add(canopy, pole, ring1);
            var tethered1 = [];
            for(var _iterator1 = _create_for_of_iterator_helper_loose(this.actors), _step1; !(_step1 = _iterator1()).done;){
                var a1 = _step1.value;
                if (a1.alive && a1.team === 'red' && Math.hypot(a1.x - cx2, a1.z - cz2) <= 9.2) {
                    tethered1.push(a1);
                    var dx1 = a1.x - cx2;
                    var dz1 = a1.z - cz2;
                    var len1 = Math.max(1, Math.hypot(dx1, dz1));
                    var link = new _three.Mesh(new _three.CylinderGeometry(0.11, 0.11, len1, 6), new _three.MeshBasicMaterial({
                        color: 0xe879f9
                    }));
                    link.rotation.x = Math.PI / 2;
                    link.rotation.z = -Math.atan2(dx1, dz1);
                    link.position.set(dx1 / 2, 1.5, dz1 / 2);
                    grp2.add(link);
                }
            }
            grp2.position.set(cx2, 0, cz2);
            this.three.scene.add(grp2);
            this.activeUltSetpieces.push({
                kind: kind,
                group: grp2,
                cx: cx2,
                cz: cz2,
                life: 1.2,
                maxLife: 1.2,
                tickAcc: 0,
                detonated: false,
                baseDmg: dmg,
                tetherTargets: tethered1
            });
            this.showKillfeed("☂️ KAGURA: " + spec.name.toUpperCase() + " — SPIRIT CHAINS LINKED!");
        }
    };
    _proto.detonateJohnsonCrash = function detonateJohnsonCrash(sp) {
        if (sp.detonated) return;
        sp.detonated = true;
        this.cameraShake = Math.max(this.cameraShake, 0.65);
        _audio.ArcadeAudio.play('explosion');
        this.spawnVfx('lightning', this.px, this.pz, 9.5, 0x38bdf8);
        this.spawnVfx('ring', this.px, this.pz, 10.5, 0xfacc15);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.actors), _step; !(_step = _iterator()).done;){
            var a = _step.value;
            if (a.alive && a.team === 'red' && Math.hypot(a.x - this.px, a.z - this.pz) <= 10.2) {
                a.stunTimer = Math.max(a.stunTimer, 1.35);
                a.airborneTimer = 0.55;
                a.airborneDur = 0.55;
                a.airbornePeak = 2.8;
                this.damageEnemyActor(a, Math.round(sp.baseDmg * 1.25), true, 'magic');
            }
        }
        this.showKillfeed('💥 FULL THROTTLE ELECTRIC CRASH! ENEMIES STUNNED!');
    };
    _proto.castHeroSkill = function castHeroSkill(slotIndex, aimOverride) {
        var _this = this;
        if (this.frozenTimer > 0) return;
        var spec = this.combatKit.skills[slotIndex];
        if (!spec) return;
        // Allow re-casting Johnson Ultimate while driving to crash early
        if (spec.iconicUlt === 'johnson_car' && this.activeUltSetpieces.some(function(s) {
            return s.kind === 'johnson_car';
        })) {
            this.launchIconicUlt('johnson_car', Math.round(this.atkDmg * spec.dmgMult), spec, aimOverride);
            return;
        }
        if (slotIndex === 0 && this.cdSkill1 > 0) return;
        if (slotIndex === 1 && this.cdSkill2 > 0) return;
        if (slotIndex === 2 && this.cdSkill3 > 0) return;
        if (slotIndex === 3 && this.cdSkill4 > 0) return;
        var cd = spec.cdSec * this.cdMult;
        if (slotIndex === 0) {
            this.cdSkill1 = cd;
            this.maxCdSkill1 = cd;
        } else if (slotIndex === 1) {
            this.cdSkill2 = cd;
            this.maxCdSkill2 = cd;
        } else if (slotIndex === 2) {
            this.cdSkill3 = cd;
            this.maxCdSkill3 = cd;
        } else if (slotIndex === 3) {
            this.cdSkill4 = cd;
            this.maxCdSkill4 = cd;
        }
        this.recallTimer = 0;
        this.stealthTimer = 0;
        this.outOfCombatSec = 0;
        this.bushRevealTimer = 2.0;
        this.castAnimTimer = 0.3;
        // Flash Ground Telegraph briefly during quick-tap cast wind-up
        if (!aimOverride) {
            this.telegraphSlot = slotIndex;
            this.telegraphAutoTimer = 0.28;
            this.rebuildTelegraphMesh(slotIndex);
        }
        // Keystone Talent: Temporal Reign (Ultimate accelerates basic skill cooldowns)
        if (slotIndex >= 2 && this.keystoneT3 === 'temporal_reign') {
            this.cdSkill1 *= 0.65;
            this.cdSkill2 *= 0.65;
        }
        // Prime Divine Justice / Crisis (Endless Battle, Calamity Reaper, Starlium Scythe)
        if (this.computedStats.hasDivineJustice) {
            this.divineJusticePrimed = true;
        }
        // Great Dragon Spear (Supreme Warrior: Ultimate grants +30% Move Speed for 7.5s)
        if (slotIndex >= 2 && this.equippedItemIds.includes('great_dragon_spear')) {
            this.hasteTimer = Math.max(this.hasteTimer, 7.5);
        }
        if (this.combatKit.passiveKind === 'cd_on_hit') {
            this.cdSkill1 = Math.max(0, this.cdSkill1 - 0.5);
            this.cdSkill2 = Math.max(0, this.cdSkill2 - 0.5);
        }
        var elemTheme = spec.elementTheme;
        var elemPal = _arenaRoster.MOBA_ELEMENT_PALETTES[elemTheme];
        var fxColor = elemPal.primary;
        var tgt = aimOverride ? null : this.findNearestEnemyTarget();
        var lockedTargetActor = (aimOverride == null ? void 0 : aimOverride.lockedTargetId) !== null && (aimOverride == null ? void 0 : aimOverride.lockedTargetId) !== undefined ? this.actors.find(function(a) {
            return a.id === aimOverride.lockedTargetId && a.alive && a.team === 'red';
        }) : undefined;
        if (aimOverride) {
            this.pYaw = aimOverride.aimYaw;
        } else if (tgt) {
            this.pYaw = tgt.angle;
        }
        // Apply Self Buffs / Heals / Shields / Stealth / Giant Forms / CC Immunity
        if (spec.healPct > 0) {
            var favorMult = this.blessingId === 'favor' || this.blessingId === 'roam_favor' ? 1.25 : 1.0;
            var oracleMult = this.equippedItemIds.includes('oracle') ? 1.3 : 1.0;
            var healAmt = Math.round(this.maxLives * spec.healPct * favorMult * oracleMult);
            this.lives = Math.min(this.maxLives, this.lives + healAmt);
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
            this.spawnDamageNumber(this.px, this.pz, healAmt, 'heal');
        }
        if (spec.shieldSec > 0) this.shieldTimer = Math.max(this.shieldTimer, spec.shieldSec);
        if (spec.hasteSec > 0) this.hasteTimer = Math.max(this.hasteTimer, spec.hasteSec);
        if (spec.stealthSec > 0) this.stealthTimer = Math.max(this.stealthTimer, spec.stealthSec);
        if (spec.ccImmuneSec && spec.ccImmuneSec > 0) this.ccImmuneTimer = Math.max(this.ccImmuneTimer, spec.ccImmuneSec);
        if (spec.giantSec > 0) {
            this.giantTimer = Math.max(this.giantTimer, spec.giantSec);
            this.showKillfeed("\uD83D\uDC32 " + this.heroDef.name.toUpperCase() + " TRANSFORMED!");
        }
        var dmg = Math.round(this.atkDmg * spec.dmgMult * (this.giantTimer > 0 ? 1.2 : 1.0));
        var impactCenter = aimOverride ? {
            x: aimOverride.aimX,
            z: aimOverride.aimZ
        } : {
            x: Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.px + Math.sin(this.pYaw) * Math.min(spec.range * 0.65, 11))),
            z: Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.pz + Math.cos(this.pYaw) * Math.min(spec.range * 0.65, 11)))
        };
        // Signature Iconic 3D Ultimate Set-Pieces (Tigreal, Lancelot, Johnson, Yve, Kagura)
        if (spec.iconicUlt && spec.iconicUlt !== 'none') {
            _audio.ArcadeAudio.play('combo');
            this.launchIconicUlt(spec.iconicUlt, dmg, spec, aimOverride);
            this.pushMobaHudSnapshot();
            return;
        }
        // Execute Unique Skill Kinds + Movement Physics + Elemental 3D VFX
        switch(spec.kind){
            case 'dash_strike':
            case 'blink_teleport':
                {
                    _audio.ArcadeAudio.play('dash');
                    if (spec.slot === 4 && this.heroDef.name === 'Chip') {
                        this.beaconIdx = (this.beaconIdx + 1) % _LegendsArena3DWorld.BEACON_SPOTS.length;
                        var _BEACON_SPOTS_this_beaconIdx = _LegendsArena3DWorld.BEACON_SPOTS[this.beaconIdx], bx = _BEACON_SPOTS_this_beaconIdx[0], bz = _BEACON_SPOTS_this_beaconIdx[1];
                        this.spawnAfterimageGhost(this.px, this.py, this.pz, this.pYaw, fxColor);
                        this.px = bx;
                        this.pz = bz;
                        this.showKillfeed("\uD83E\uDD8A " + this.heroDef.name + " WARPED TO BEACON " + (this.beaconIdx + 1) + "!");
                    } else if (spec.moveKind === 'leap') {
                        var dist = aimOverride ? Math.max(3.5, Math.min(spec.range, aimOverride.dist)) : Math.min(16, spec.range);
                        this.startPlayerMotion('leap', dist, 0.34, 4.2);
                    } else if (spec.moveKind === 'dash') {
                        var dist1 = aimOverride ? Math.max(4.0, Math.min(spec.range, aimOverride.dist)) : Math.min(14, spec.range);
                        this.startPlayerMotion('dash', dist1, 0.24, 0.4);
                    } else if (spec.moveKind === 'snap_back') {
                        this.startPlayerMotion('snap_back', 7.5, 0.22, 1.2);
                    } else {
                        // Instant Blink with Ghost Trail
                        this.spawnAfterimageGhost(this.px, this.py, this.pz, this.pYaw, fxColor);
                        if (aimOverride) {
                            this.px = aimOverride.aimX;
                            this.pz = aimOverride.aimZ;
                        } else {
                            var dist2 = Math.min(18, spec.range);
                            this.px = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.px + Math.sin(this.pYaw) * dist2));
                            this.pz = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.pz + Math.cos(this.pYaw) * dist2));
                        }
                    }
                    var fxX = this.activeMotion ? this.activeMotion.endX : this.px;
                    var fxZ = this.activeMotion ? this.activeMotion.endZ : this.pz;
                    this.spawnElementalVfx(elemTheme, spec.vfx, fxX, fxZ, spec.radius, this.pYaw);
                    this.applySkillAreaEffects(fxX, fxZ, spec.radius, dmg, spec);
                    break;
                }
            case 'hook_pull':
                {
                    _audio.ArcadeAudio.play('slingshot');
                    this.spawnElementalVfx(elemTheme, 'hook_chain', this.px, this.pz, spec.range, this.pYaw);
                    var hookedAny = false;
                    var dirX = Math.sin(this.pYaw);
                    var dirZ = Math.cos(this.pYaw);
                    var candidates = lockedTargetActor ? [].concat([
                        lockedTargetActor
                    ], this.actors) : this.actors;
                    var seen = new Set();
                    for(var _iterator = _create_for_of_iterator_helper_loose(candidates), _step; !(_step = _iterator()).done;){
                        var a = _step.value;
                        if (seen.has(a.id)) continue;
                        seen.add(a.id);
                        if (!a.alive || a.team !== 'red') continue;
                        var rx = a.x - this.px;
                        var rz = a.z - this.pz;
                        var d = Math.hypot(rx, rz);
                        var proj = rx * dirX + rz * dirZ;
                        var perp = Math.abs(rx * dirZ - rz * dirX);
                        var inLine = aimOverride ? proj > 0 && proj <= spec.range + 2.5 && perp <= 3.8 : d < spec.range + 2;
                        if (inLine) {
                            if (spec.ccKind === 'flip') {
                                a.x = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.px - dirX * 3.4));
                                a.z = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.pz - dirZ * 3.4));
                                a.airborneTimer = 0.45;
                                a.airborneDur = 0.45;
                                a.airbornePeak = 3.2;
                            } else {
                                a.x = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.px + dirX * 2.8));
                                a.z = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.pz + dirZ * 2.8));
                            }
                            a.mesh.position.set(a.x, 0, a.z);
                            a.stunTimer = Math.max(a.stunTimer, 1.15);
                            this.applyElementalStatusToActor(a, elemTheme, spec.ccKind, dmg);
                            this.damageEnemyActor(a, dmg, true, 'phys');
                            this.spawnElementalVfx(elemTheme, 'ring', a.x, a.z, 4.2, this.pYaw);
                            hookedAny = true;
                            if (a.kind === 'hero') break;
                        }
                    }
                    if (!hookedAny) {
                        this.applySkillAreaEffects(impactCenter.x, impactCenter.z, spec.radius, dmg, spec);
                    }
                    break;
                }
            case 'laser_beam':
            case 'snipe_shot':
                {
                    _audio.ArcadeAudio.play('shoot');
                    this.spawnElementalVfx(elemTheme, 'beam', this.px, this.pz, spec.range, this.pYaw);
                    this.firePlayerBolt(this.pYaw, Math.round(dmg * 0.9), 1.15, fxColor, elemTheme, 1.35);
                    this.firePlayerBolt(this.pYaw, Math.round(dmg * 0.65), 1.25, fxColor, elemTheme, 1.15);
                    var dirX1 = Math.sin(this.pYaw);
                    var dirZ1 = Math.cos(this.pYaw);
                    for(var _iterator1 = _create_for_of_iterator_helper_loose(this.actors), _step1; !(_step1 = _iterator1()).done;){
                        var a1 = _step1.value;
                        if (!a1.alive || a1.team !== 'red') continue;
                        var rx1 = a1.x - this.px;
                        var rz1 = a1.z - this.pz;
                        var proj1 = rx1 * dirX1 + rz1 * dirZ1;
                        var perp1 = Math.abs(rx1 * dirZ1 - rz1 * dirX1);
                        if (proj1 > 0 && proj1 <= spec.range && perp1 < 3.6) {
                            this.applyElementalStatusToActor(a1, elemTheme, spec.ccKind, dmg);
                            this.damageEnemyActor(a1, dmg, true, 'magic');
                            this.spawnElementalVfx(elemTheme, 'ring', a1.x, a1.z, 3.8, this.pYaw);
                        }
                    }
                    for(var _iterator2 = _create_for_of_iterator_helper_loose(this.jungleCamps), _step2; !(_step2 = _iterator2()).done;){
                        var jc = _step2.value;
                        if (!jc.alive) continue;
                        var rx2 = jc.x - this.px;
                        var rz2 = jc.z - this.pz;
                        var proj2 = rx2 * dirX1 + rz2 * dirZ1;
                        var perp2 = Math.abs(rx2 * dirZ1 - rz2 * dirX1);
                        if (proj2 > 0 && proj2 <= spec.range && perp2 < 4.2) {
                            this.damageJungleCamp(jc, dmg);
                        }
                    }
                    break;
                }
            case 'fan_volley':
            case 'homing_barrage':
                {
                    _audio.ArcadeAudio.play('shoot');
                    var spreads = spec.slot >= 3 ? [
                        -0.36,
                        -0.18,
                        0,
                        0.18,
                        0.36
                    ] : [
                        -0.22,
                        0,
                        0.22
                    ];
                    for(var _iterator3 = _create_for_of_iterator_helper_loose(spreads), _step3; !(_step3 = _iterator3()).done;){
                        var off = _step3.value;
                        this.firePlayerBolt(this.pYaw + off, Math.round(dmg * 0.55), 0.95, fxColor, elemTheme, 1.22);
                    }
                    this.spawnElementalVfx(elemTheme, spec.vfx, this.px, this.pz, spec.radius, this.pYaw);
                    this.applySkillAreaEffects(impactCenter.x, impactCenter.z, spec.radius * 0.9, Math.round(dmg * 0.55), spec);
                    break;
                }
            case 'summon_clone':
            case 'summon_turret':
                {
                    _audio.ArcadeAudio.play('plant');
                    var isTurret = spec.kind === 'summon_turret';
                    var sx = aimOverride ? aimOverride.aimX : Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.px + Math.sin(this.pYaw) * 4.0));
                    var sz = aimOverride ? aimOverride.aimZ : Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.pz + Math.cos(this.pYaw) * 4.0));
                    var summonMesh = isTurret ? function() {
                        var g = new _three.Group();
                        var base = new _three.Mesh(new _three.CylinderGeometry(0.9, 1.3, 2.2, 8), (0, _threeShared.createToonMaterial)(_this.heroBodyColor));
                        base.position.y = 1.1;
                        var orb = new _three.Mesh(new _three.OctahedronGeometry(0.85, 0), (0, _threeShared.createToonMaterial)(fxColor, {
                            emissive: fxColor,
                            emissiveIntensity: 0.7
                        }));
                        orb.position.y = 2.7;
                        g.add(base, orb);
                        return g;
                    }() : (0, _threeShared.buildMobaHeroMesh)(this.heroBodyColor, this.heroCloakColor, fxColor, 1.05, this.heroDef.weapon, _storage.playerState.mobaSettings.outline);
                    summonMesh.position.set(sx, 0, sz);
                    this.three.scene.add(summonMesh);
                    this.actors.push({
                        id: this.nextActorId++,
                        mesh: summonMesh,
                        x: sx,
                        z: sz,
                        team: 'blue',
                        kind: isTurret ? 'summon_turret' : 'summon_clone',
                        hp: Math.round(this.maxLives * 0.75),
                        maxHp: Math.round(this.maxLives * 0.75),
                        atk: Math.round(this.atkDmg * 0.9),
                        cd: 0.25,
                        lane: 1,
                        alive: true,
                        stunTimer: 0,
                        rootTimer: 0,
                        silenceTimer: 0,
                        fearTimer: 0,
                        tauntTimer: 0,
                        slowTimer: 0,
                        airborneTimer: 0,
                        airborneDur: 0.4,
                        airbornePeak: 0,
                        lifeTimer: 12.0,
                        respawnTimer: 0,
                        spawnX: sx,
                        spawnZ: sz,
                        label: isTurret ? 'Sentry' : 'Clone'
                    });
                    this.spawnElementalVfx(elemTheme, spec.vfx, sx, sz, 5.5, this.pYaw);
                    this.applySkillAreaEffects(sx, sz, 6.2, Math.round(dmg * 0.7), spec);
                    break;
                }
            case 'orbital_drop':
                {
                    _audio.ArcadeAudio.play('explosion');
                    var tx = aimOverride ? aimOverride.aimX : tgt ? tgt.x : impactCenter.x;
                    var tz = aimOverride ? aimOverride.aimZ : tgt ? tgt.z : impactCenter.z;
                    this.cameraShake = Math.max(this.cameraShake, 0.35);
                    this.spawnElementalVfx(elemTheme, spec.vfx, tx, tz, spec.radius, this.pYaw);
                    this.applySkillAreaEffects(tx, tz, spec.radius, dmg, spec);
                    break;
                }
            case 'cc_freeze_root':
            case 'whirlwind_spin':
                {
                    _audio.ArcadeAudio.play('combo');
                    var cx = spec.targeting === 'self' ? this.px : impactCenter.x;
                    var cz = spec.targeting === 'self' ? this.pz : impactCenter.z;
                    this.spawnElementalVfx(elemTheme, spec.vfx, cx, cz, spec.radius, this.pYaw);
                    this.applySkillAreaEffects(cx, cz, spec.radius, dmg, spec);
                    break;
                }
            default:
                {
                    _audio.ArcadeAudio.play(spec.slot >= 3 ? 'combo' : 'explosion');
                    var cx1 = spec.targeting === 'self' ? this.px : impactCenter.x;
                    var cz1 = spec.targeting === 'self' ? this.pz : impactCenter.z;
                    if (spec.slot >= 3) this.cameraShake = Math.max(this.cameraShake, 0.35);
                    if (spec.targeting === 'line') {
                        this.firePlayerBolt(this.pYaw, Math.round(dmg * 0.65), 0.9, fxColor, elemTheme, 1.35);
                    }
                    this.spawnElementalVfx(elemTheme, spec.vfx, cx1, cz1, spec.radius, this.pYaw);
                    this.applySkillAreaEffects(cx1, cz1, spec.radius, dmg, spec);
                    break;
                }
        }
        this.pushMobaHudSnapshot();
    };
    _proto.applyElementalStatusToActor = function applyElementalStatusToActor(a, elementTheme, ccKind, baseDmg) {
        var _a_statusTimer;
        var eff = (0, _arenaRoster.resolveElementStatusEffect)(elementTheme, ccKind);
        if (eff.statusKind === 'none' || eff.durationSec <= 0) return;
        // Ice chill/freeze also slows or briefly immobilizes
        if (eff.statusKind === 'freeze') {
            a.slowTimer = Math.max(a.slowTimer, eff.durationSec);
            if (ccKind === 'stun' || ccKind === 'root') {
                a.rootTimer = Math.max(a.rootTimer, Math.min(1.8, eff.durationSec));
            }
        } else if (eff.statusKind === 'soak' || eff.statusKind === 'crush') {
            a.slowTimer = Math.max(a.slowTimer, 1.4);
        } else if (eff.statusKind === 'vine') {
            a.rootTimer = Math.max(a.rootTimer, Math.min(1.5, eff.durationSec * 0.65));
        }
        var prevKind = a.statusKind;
        a.statusKind = eff.statusKind;
        a.statusTimer = Math.max((_a_statusTimer = a.statusTimer) != null ? _a_statusTimer : 0, eff.durationSec);
        if (eff.dotDpsRatio > 0) {
            var _a_statusDps;
            a.statusDps = Math.max((_a_statusDps = a.statusDps) != null ? _a_statusDps : 0, Math.max(5, Math.round(baseDmg * eff.dotDpsRatio)));
        }
        if (a.statusTickAcc === undefined) a.statusTickAcc = 0;
        if (prevKind !== eff.statusKind || !a.statusFxGroup) {
            if (a.statusFxGroup) {
                (0, _LegendsArena3DWorld.disposeObjectTree)(a.statusFxGroup);
                a.mesh.remove(a.statusFxGroup);
            }
            var fx = (0, _mobaElementalVfx.createElementalStatusMesh)(eff.statusKind);
            a.mesh.add(fx);
            a.statusFxGroup = fx;
        } else {
            a.statusFxGroup.visible = true;
        }
    };
    _proto.applyCcToActor = function applyCcToActor(a, kind, sec, cx, cz) {
        if (kind === 'stun') {
            a.stunTimer = Math.max(a.stunTimer, sec);
        } else if (kind === 'root') {
            a.rootTimer = Math.max(a.rootTimer, sec);
        } else if (kind === 'silence') {
            a.silenceTimer = Math.max(a.silenceTimer, sec);
        } else if (kind === 'fear') {
            a.fearTimer = Math.max(a.fearTimer, sec);
        } else if (kind === 'taunt') {
            a.tauntTimer = Math.max(a.tauntTimer, sec);
        } else if (kind === 'slow') {
            a.slowTimer = Math.max(a.slowTimer, sec);
        } else if (kind === 'pull') {
            a.x = a.x * 0.42 + cx * 0.58;
            a.z = a.z * 0.42 + cz * 0.58;
            a.mesh.position.set(a.x, 0, a.z);
            a.stunTimer = Math.max(a.stunTimer, Math.min(0.85, sec));
        } else if (kind === 'flip') {
            a.x = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.px - Math.sin(this.pYaw) * 3.2));
            a.z = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.pz - Math.cos(this.pYaw) * 3.2));
            a.mesh.position.set(a.x, 0, a.z);
            a.airborneTimer = 0.45;
            a.airborneDur = 0.45;
            a.airbornePeak = 3.0;
            a.stunTimer = Math.max(a.stunTimer, sec);
        } else if (kind === 'knockback') {
            var dx = a.x - cx;
            var dz = a.z - cz;
            var len = Math.hypot(dx, dz) || 1;
            a.x = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, a.x + dx / len * 4.8));
            a.z = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, a.z + dz / len * 4.8));
            a.mesh.position.set(a.x, 0, a.z);
            a.airborneTimer = 0.36;
            a.airborneDur = 0.36;
            a.airbornePeak = 1.9;
        }
    };
    _proto.applySkillAreaEffects = function applySkillAreaEffects(cx, cz, rad, dmg, spec) {
        var iceSlow = this.computedStats.hasIceBound ? 1.5 : 0;
        var dmgType = this.heroDef.role === 'Mage' || this.heroDef.role === 'Support' ? 'magic' : 'phys';
        var hitAny = false;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.actors), _step; !(_step = _iterator()).done;){
            var a = _step.value;
            if (!a.alive || a.team !== 'red') continue;
            if (Math.hypot(a.x - cx, a.z - cz) <= rad) {
                hitAny = true;
                if (spec.ccKind !== 'none') {
                    this.applyCcToActor(a, spec.ccKind, spec.ccSec, cx, cz);
                } else if (iceSlow > 0) {
                    a.slowTimer = Math.max(a.slowTimer, iceSlow);
                }
                this.applyElementalStatusToActor(a, spec.elementTheme, spec.ccKind, dmg);
                // Keystone Talent: Impure Rage (+4% target max HP bonus Magic Damage on skill hit)
                var impureBonus = this.keystoneT3 === 'impure_rage' ? Math.max(6, Math.round(a.maxHp * 0.04)) : 0;
                this.damageEnemyActor(a, dmg + impureBonus, true, dmgType);
            }
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.jungleCamps), _step1; !(_step1 = _iterator1()).done;){
            var jc = _step1.value;
            if (!jc.alive) continue;
            if (Math.hypot(jc.x - cx, jc.z - cz) <= rad + 1.2) {
                hitAny = true;
                if (spec.ccKind === 'stun' || spec.ccKind === 'root') {
                    jc.stunTimer = Math.max(jc.stunTimer, spec.ccSec);
                }
                this.damageJungleCamp(jc, dmg);
            }
        }
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.turrets), _step2; !(_step2 = _iterator2()).done;){
            var t = _step2.value;
            if (t.alive && t.team === 'red' && Math.hypot(t.x - cx, t.z - cz) <= rad + 1.5) {
                this.damageTurret(t, Math.round(dmg * 0.72));
            }
        }
        // Keystone Talent: Brave Smite (skill damage restores 5% Max HP)
        if (hitAny && this.keystoneT3 === 'brave_smite' && this.braveSmiteCd <= 0) {
            this.braveSmiteCd = 4.5;
            var heal = Math.max(8, Math.round(this.maxLives * 0.05));
            this.lives = Math.min(this.maxLives, this.lives + heal);
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
            this.spawnDamageNumber(this.px, this.pz, heal, 'heal');
        }
    };
    _proto.castBattleSpell = function castBattleSpell(aimOverride) {
        var _this = this;
        var _playerState_mobaEmblemTalents_playerState_selectedMobaEmblem;
        if (this.cdSpell > 0 || this.gameOver || this.isPaused || this.frozenTimer > 0) return;
        var talentSpellCdMult = ((_playerState_mobaEmblemTalents_playerState_selectedMobaEmblem = _storage.playerState.mobaEmblemTalents[_storage.playerState.selectedMobaEmblem]) == null ? void 0 : _playerState_mobaEmblemTalents_playerState_selectedMobaEmblem.t2) === 'pull_yourself_together' ? 0.85 : 1.0;
        var cd = this.spellDef.cooldownSec * this.cdMult * talentSpellCdMult;
        this.cdSpell = cd;
        this.maxCdSpell = cd;
        this.recallTimer = 0;
        _audio.ArcadeAudio.play('levelup');
        this.spawnVfx('ring', this.px, this.pz, 6.8, this.spellDef.colorNum);
        switch(this.spellDef.id){
            case 'execute':
                {
                    var bestHero = null;
                    if ((aimOverride == null ? void 0 : aimOverride.lockedTargetId) !== null && (aimOverride == null ? void 0 : aimOverride.lockedTargetId) !== undefined) {
                        var locked = this.actors.find(function(a) {
                            return a.id === aimOverride.lockedTargetId && a.alive && a.team === 'red' && Math.hypot(a.x - _this.px, a.z - _this.pz) < 12.5;
                        });
                        if (locked) bestHero = locked;
                    }
                    if (!bestHero) {
                        for(var _iterator = _create_for_of_iterator_helper_loose(this.actors), _step; !(_step = _iterator()).done;){
                            var a = _step.value;
                            if (!a.alive || a.team !== 'red') continue;
                            if (Math.hypot(a.x - this.px, a.z - this.pz) < 10.5) {
                                if (!bestHero || a.hp < bestHero.hp) bestHero = a;
                            }
                        }
                    }
                    if (bestHero) {
                        var missingHp = Math.max(0, bestHero.maxHp - bestHero.hp);
                        var trueDmg = Math.round(115 + this.atkDmg * 1.4 + missingHp * 0.16);
                        var wasAlive = bestHero.alive;
                        this.applyElementalStatusToActor(bestHero, 'blood', 'none', trueDmg);
                        this.damageEnemyActor(bestHero, trueDmg, true, 'true');
                        if (wasAlive && !bestHero.alive && bestHero.kind === 'hero') {
                            this.cdSpell *= 0.6;
                        }
                        this.spawnElementalVfx('blood', 'slash_arc', bestHero.x, bestHero.z, 5.4, this.pYaw);
                    } else {
                        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.jungleCamps), _step1; !(_step1 = _iterator1()).done;){
                            var jc = _step1.value;
                            if (jc.alive && Math.hypot(jc.x - this.px, jc.z - this.pz) < 10.5) {
                                this.damageJungleCamp(jc, Math.round(120 + this.atkDmg * 1.3));
                                break;
                            }
                        }
                    }
                    this.showKillfeed('💀 EXECUTE: TRUE DAMAGE FINISHER!');
                    break;
                }
            case 'retribution':
                {
                    var smiteDmg = (0, _arenaRoster.computeRetributionDamage)(this.heroLevel, this.junglerStacks >= 5);
                    var refX = aimOverride ? aimOverride.aimX : this.px;
                    var refZ = aimOverride ? aimOverride.aimZ : this.pz;
                    var smoteCamp = null;
                    var bestD = 15;
                    for(var _iterator2 = _create_for_of_iterator_helper_loose(this.jungleCamps), _step2; !(_step2 = _iterator2()).done;){
                        var jc1 = _step2.value;
                        if (!jc1.alive) continue;
                        var dHero = Math.hypot(jc1.x - this.px, jc1.z - this.pz);
                        if (dHero > 16.5) continue;
                        var dRef = Math.hypot(jc1.x - refX, jc1.z - refZ);
                        if (dRef < bestD) {
                            bestD = dRef;
                            smoteCamp = jc1;
                        }
                    }
                    if (smoteCamp) {
                        this.spawnElementalVfx('blood', 'lightning', smoteCamp.x, smoteCamp.z, 6.2, this.pYaw);
                        this.damageJungleCamp(smoteCamp, smiteDmg, true);
                        this.showKillfeed("\uD83E\uDE78 RETRIBUTION SMITE! " + smiteDmg + " True DMG to " + smoteCamp.label + "!");
                    } else {
                        var _this_findNearestEnemyTarget;
                        var aimedActor = (aimOverride == null ? void 0 : aimOverride.lockedTargetId) !== null && (aimOverride == null ? void 0 : aimOverride.lockedTargetId) !== undefined ? this.actors.find(function(a) {
                            return a.id === aimOverride.lockedTargetId && a.alive && a.team === 'red' && Math.hypot(a.x - _this.px, a.z - _this.pz) <= 16.5;
                        }) : undefined;
                        var targetActor = aimedActor != null ? aimedActor : (_this_findNearestEnemyTarget = this.findNearestEnemyTarget()) == null ? void 0 : _this_findNearestEnemyTarget.actor;
                        if (targetActor) {
                            this.damageEnemyActor(targetActor, Math.round(smiteDmg * 0.42), true, 'true');
                            targetActor.slowTimer = Math.max(targetActor.slowTimer, 2.5);
                            this.applyElementalStatusToActor(targetActor, 'blood', 'slow', smiteDmg);
                            this.hasteTimer = Math.max(this.hasteTimer, 2.5);
                            this.spawnElementalVfx('blood', 'lightning', targetActor.x, targetActor.z, 5.2, this.pYaw);
                            this.showKillfeed('🩸 RETRIBUTION: STOLE SPEED & TRUE DAMAGE!');
                        } else {
                            this.showKillfeed('🩸 RETRIBUTION READY — MOVE CLOSER TO JUNGLE OR HERO!');
                        }
                    }
                    break;
                }
            case 'inspire':
                {
                    this.inspireTimer = 5.0;
                    this.showKillfeed('🔥 INSPIRE: +55% ATK SPEED & ARMOR PIERCE (5s)!');
                    break;
                }
            case 'sprint':
                {
                    this.sprintBoostTimer = 6.0;
                    this.slowImmuneTimer = 6.0;
                    this.hasteTimer = Math.max(this.hasteTimer, 6.0);
                    this.showKillfeed('💨 SPRINT: +50% MOVE SPEED & SLOW IMMUNITY (6s)!');
                    break;
                }
            case 'revitalize':
                {
                    var springGrp = new _three.Group();
                    var outer = new _three.Mesh(new _three.RingGeometry(5.6, 6.4, 32), new _three.MeshBasicMaterial({
                        color: 0x22c55e,
                        side: _three.DoubleSide,
                        transparent: true,
                        opacity: 0.78,
                        polygonOffset: true,
                        polygonOffsetFactor: -2
                    }));
                    outer.rotation.x = -Math.PI / 2;
                    outer.position.y = 0.16;
                    var pool = new _three.Mesh(new _three.CircleGeometry(5.6, 28), new _three.MeshBasicMaterial({
                        color: 0x4ade80,
                        side: _three.DoubleSide,
                        transparent: true,
                        opacity: 0.28,
                        polygonOffset: true,
                        polygonOffsetFactor: -1
                    }));
                    pool.rotation.x = -Math.PI / 2;
                    pool.position.y = 0.14;
                    springGrp.add(outer, pool);
                    springGrp.position.set(this.px, 0, this.pz);
                    this.three.scene.add(springGrp);
                    this.healingSprings.push({
                        mesh: springGrp,
                        x: this.px,
                        z: this.pz,
                        life: 5.0,
                        tickAcc: 0
                    });
                    this.showKillfeed('💚 REVITALIZE: HEALING SPRING SUMMONED (5s)!');
                    break;
                }
            case 'aegis':
                {
                    this.shieldTimer = Math.max(this.shieldTimer, 5.0);
                    var instantShieldHeal = Math.round(this.maxLives * 0.14);
                    this.lives = Math.min(this.maxLives, this.lives + instantShieldHeal);
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                    this.spawnVfx('dome', this.px, this.pz, 5.4, 0xfbbf24);
                    this.showKillfeed('🛡️ AEGIS: HEAVY BARRIER SHIELD ACTIVATED (5s)!');
                    break;
                }
            case 'petrify':
                {
                    this.spawnVfx('dome', this.px, this.pz, 7.6, 0xa8a29e);
                    var dmg = Math.round(80 + this.heroLevel * 12);
                    for(var _iterator3 = _create_for_of_iterator_helper_loose(this.actors), _step3; !(_step3 = _iterator3()).done;){
                        var a1 = _step3.value;
                        if (a1.alive && a1.team === 'red' && Math.hypot(a1.x - this.px, a1.z - this.pz) <= 8.2) {
                            a1.stunTimer = Math.max(a1.stunTimer, 0.9);
                            a1.slowTimer = Math.max(a1.slowTimer, 1.8);
                            this.damageEnemyActor(a1, dmg, true, 'magic');
                        }
                    }
                    this.showKillfeed('🪨 PETRIFY: NEARBY ENEMIES TURNED TO STONE!');
                    break;
                }
            case 'purify':
                {
                    this.ccImmuneTimer = Math.max(this.ccImmuneTimer, 1.5);
                    this.slowImmuneTimer = Math.max(this.slowImmuneTimer, 1.5);
                    this.hasteTimer = Math.max(this.hasteTimer, 2.0);
                    this.spawnVfx('dome', this.px, this.pz, 5.0, 0xfef08a);
                    this.showKillfeed('✨ PURIFY: CC CLEANSED + 1.5s GOLDEN CC IMMUNITY!');
                    break;
                }
            case 'flameshot':
                {
                    if (aimOverride) {
                        this.pYaw = aimOverride.aimYaw;
                    } else {
                        var tgt = this.findNearestEnemyTarget();
                        if (tgt) this.pYaw = tgt.angle;
                    }
                    // Close-range knockback pulse
                    for(var _iterator4 = _create_for_of_iterator_helper_loose(this.actors), _step4; !(_step4 = _iterator4()).done;){
                        var a2 = _step4.value;
                        if (a2.alive && a2.team === 'red' && Math.hypot(a2.x - this.px, a2.z - this.pz) <= 6.2) {
                            this.applyCcToActor(a2, 'knockback', 0.6, this.px, this.pz);
                        }
                    }
                    var m = (0, _mobaElementalVfx.createElementalProjectileMesh)('fire', 1.65);
                    m.position.set(this.px, 1.6, this.pz);
                    m.rotation.y = this.pYaw;
                    this.three.scene.add(m);
                    this.bolts.push({
                        mesh: m,
                        x: this.px,
                        z: this.pz,
                        vx: Math.sin(this.pYaw) * 44,
                        vz: Math.cos(this.pYaw) * 44,
                        team: 'blue',
                        dmg: Math.round(95 + this.atkDmg * 1.4),
                        life: 2.8,
                        isFlameshot: true,
                        startX: this.px,
                        startZ: this.pz,
                        elementTheme: 'fire',
                        isSharedMesh: false
                    });
                    this.spawnElementalVfx('fire', 'flame_wave', this.px, this.pz, 5.2, this.pYaw);
                    this.showKillfeed('☄️ FLAMESHOT: GLOBAL FIRE BOLT LAUNCHED!');
                    break;
                }
            case 'flicker':
                {
                    this.spawnAfterimageGhost(this.px, this.py, this.pz, this.pYaw, 0x60a5fa);
                    if (aimOverride) {
                        this.pYaw = aimOverride.aimYaw;
                        this.px = aimOverride.aimX;
                        this.pz = aimOverride.aimZ;
                    } else {
                        this.px = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.px + Math.sin(this.pYaw) * 15));
                        this.pz = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.pz + Math.cos(this.pYaw) * 15));
                    }
                    this.hasteTimer = Math.max(this.hasteTimer, 2.4);
                    this.shieldTimer = Math.max(this.shieldTimer, 1.6);
                    this.spawnElementalVfx('lightning', 'portal_warp', this.px, this.pz, 5.4, this.pYaw);
                    this.showKillfeed('⚡ FLICKER: INSTANT BLINK + DEFENSE!');
                    break;
                }
            case 'arrival':
                {
                    var destX = 0;
                    var destZ = 0;
                    var bestScore = -Infinity;
                    for(var _iterator5 = _create_for_of_iterator_helper_loose(this.turrets), _step5; !(_step5 = _iterator5()).done;){
                        var t = _step5.value;
                        if (!t.alive || t.team !== 'blue' || t.isNexus) continue;
                        var forward = t.x - t.z; // closer to Red Base (+108, -108)
                        if (forward > bestScore) {
                            bestScore = forward;
                            destX = t.x + 2.5;
                            destZ = t.z - 2.5;
                        }
                    }
                    for(var _iterator6 = _create_for_of_iterator_helper_loose(this.actors), _step6; !(_step6 = _iterator6()).done;){
                        var a3 = _step6.value;
                        if (!a3.alive || a3.team !== 'blue' || a3.kind !== 'minion') continue;
                        var forward1 = a3.x - a3.z;
                        if (forward1 > bestScore) {
                            bestScore = forward1;
                            destX = a3.x;
                            destZ = a3.z;
                        }
                    }
                    this.spawnAfterimageGhost(this.px, this.py, this.pz, this.pYaw, 0xc084fc);
                    this.px = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, destX));
                    this.pz = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, destZ));
                    this.hasteTimer = Math.max(this.hasteTimer, 3.0);
                    this.spawnVfx('portal_warp', this.px, this.pz, 6.2, 0xc084fc);
                    this.showKillfeed('🌀 ARRIVAL: TELEPORTED TO FRONT LINE (+60% SPEED)!');
                    break;
                }
            case 'vengeance':
                {
                    this.vengeanceTimer = 3.5;
                    this.shieldTimer = Math.max(this.shieldTimer, 3.5);
                    for(var _iterator7 = _create_for_of_iterator_helper_loose(this.actors), _step7; !(_step7 = _iterator7()).done;){
                        var a4 = _step7.value;
                        if (a4.alive && a4.team === 'red' && Math.hypot(a4.x - this.px, a4.z - this.pz) < 8.5) {
                            this.damageEnemyActor(a4, Math.round(this.atkDmg * 1.4), true, 'magic');
                        }
                    }
                    this.showKillfeed('⚜️ VENGEANCE: 35% DR & MAGIC REFLECTION (3.5s)!');
                    break;
                }
        }
        this.pushMobaHudSnapshot();
    };
    _proto.castHpRegen = function castHpRegen() {
        if (this.cdRegen > 0 || this.gameOver || this.isPaused) return;
        this.cdRegen = this.maxCdRegen * this.cdMult;
        this.regenHoTTimer = 3.2;
        var favorBonus = this.blessingId === 'favor' || this.blessingId === 'roam_favor' ? 0.26 : 0.16;
        var oracleBonus = this.equippedItemIds.includes('oracle') ? 1.3 : 1.0;
        var heal = Math.round(this.maxLives * favorBonus * oracleBonus);
        this.lives = Math.min(this.maxLives, this.lives + heal);
        (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        this.spawnDamageNumber(this.px, this.pz, heal, 'heal');
        _audio.ArcadeAudio.play('levelup');
        this.spawnVfx('dome', this.px, this.pz, 4.2, 0x22c55e);
        this.showKillfeed(this.blessingId === 'favor' || this.blessingId === 'roam_favor' ? '💚 FAVOR BLESSING REGEN (+Enhanced Heal!)' : '💚 HP REGEN ACTIVE (+Healing Over Time)');
        this.pushMobaHudSnapshot();
    };
    _proto.startRecall = function startRecall() {
        var _this = this;
        if (this.gameOver || this.isPaused || this.frozenTimer > 0) return;
        var modeDef = _arenaRoster.MOBA_MODES.find(function(m) {
            return m.id === _this.mobaMode;
        });
        if (modeDef == null ? void 0 : modeDef.disableRecall) {
            this.showKillfeed('🚫 RECALL IS DISABLED IN BRAWL MODE!');
            return;
        }
        if (this.recallTimer <= 0) {
            this.recallTimer = 2.4;
            this.moveX = 0;
            this.moveZ = 0;
            this.tapTarget = null;
            _audio.ArcadeAudio.play('click');
            this.showKillfeed('🌀 RECALLING TO BASE FOUNTAIN (2.4s)...');
            this.pushMobaHudSnapshot();
        }
    };
    _proto.castActiveItem = function castActiveItem() {
        if (this.gameOver || this.isPaused || this.cdItemActive > 0) return;
        var kind = this.computedStats.activeKind;
        if (!kind) return;
        var cd = this.computedStats.activeCdSec * this.cdMult;
        this.cdItemActive = cd;
        this.maxCdItemActive = cd;
        this.recallTimer = 0;
        if (kind === 'wind_chant') {
            var dur = this.heroDef.role === 'Marksman' ? 2.0 : 1.2;
            this.windChantTimer = dur;
            _audio.ArcadeAudio.play('levelup');
            this.spawnVfx('dome', this.px, this.pz, 4.6, 0xa3e635);
            this.showKillfeed("\uD83C\uDF43 WIND OF NATURE: PHYSICAL IMMUNITY (" + dur.toFixed(1) + "s)!");
        } else if (kind === 'frozen') {
            this.frozenTimer = 2.0;
            this.moveX = 0;
            this.moveZ = 0;
            this.tapTarget = null;
            _audio.ArcadeAudio.play('combo');
            this.spawnVfx('dome', this.px, this.pz, 4.8, 0x67e8f9);
            this.showKillfeed('❄️ WINTER CROWN: FROZEN STASIS (2.0s UNTARGETABLE)!');
        } else if (kind === 'conceal') {
            this.stealthTimer = Math.max(this.stealthTimer, 5.0);
            this.hasteTimer = Math.max(this.hasteTimer, 5.0);
            _audio.ArcadeAudio.play('dash');
            this.spawnVfx('portal_warp', this.px, this.pz, 5.4, 0xc084fc);
            this.showKillfeed('👻 CONCEAL BLESSING: CAMOUFLAGE & +50% MOVE SPEED (5.0s)!');
        }
        this.pushMobaHudSnapshot();
    };
    _proto.buyEquipment = function buyEquipment(itemId) {
        if (this.gameOver) return false;
        var item = (0, _arenaRoster.getMobaEquipmentById)(itemId);
        if (!item) return false;
        var result = (0, _arenaRoster.applyCraftedPurchase)(item.id, this.equippedItemIds, Math.floor(this.gold));
        if (!result.ok) {
            if (result.reason) {
                this.showKillfeed("\uD83D\uDED2 " + result.reason);
            }
            return false;
        }
        this.gold = Math.max(0, this.gold - result.spentGold);
        this.equippedItemIds = result.nextEquippedIds;
        if (this.prioritizedItemId === item.id) {
            this.prioritizedItemId = null;
        }
        this.recomputeStats();
        _audio.ArcadeAudio.play('coin');
        this.spawnVfx('ring', this.px, this.pz, 3.8, 0xfacc15);
        var craftNote = result.consumedCount > 0 ? " (Crafted -" + Math.max(0, item.cost - result.spentGold) + "g)" : '';
        this.showKillfeed(item.icon + " Purchased " + item.name + craftNote + "!");
        this.pushMobaHudSnapshot();
        return true;
    };
    _proto.sellEquipment = function sellEquipment(slotIdx) {
        if (this.gameOver || slotIdx < 0 || slotIdx >= this.equippedItemIds.length) return false;
        var removedId = this.equippedItemIds[slotIdx];
        var item = (0, _arenaRoster.getMobaEquipmentById)(removedId);
        this.equippedItemIds.splice(slotIdx, 1);
        if ((item == null ? void 0 : item.category) === 'movement' && !this.equippedItemIds.some(function(id) {
            var _getMobaEquipmentById;
            return ((_getMobaEquipmentById = (0, _arenaRoster.getMobaEquipmentById)(id)) == null ? void 0 : _getMobaEquipmentById.category) === 'movement';
        })) {
            this.blessingId = null;
        }
        var refund = item ? (0, _arenaRoster.computeSellRefund)(item.id) : 120;
        this.gold += refund;
        this.recomputeStats();
        _audio.ArcadeAudio.play('click');
        this.showKillfeed("\uD83E\uDE99 Sold " + (item ? item.name : 'Item') + " (+" + refund + " Gold \xb7 60% refund)");
        this.pushMobaHudSnapshot();
        return true;
    };
    _proto.buyBlessing = function buyBlessing(blessingId) {
        if (this.gameOver) return false;
        var blessing = (0, _arenaRoster.getMobaBlessingById)(blessingId);
        if (!blessing) return false;
        var hasBoots = this.equippedItemIds.some(function(id) {
            var _getMobaEquipmentById;
            return ((_getMobaEquipmentById = (0, _arenaRoster.getMobaEquipmentById)(id)) == null ? void 0 : _getMobaEquipmentById.category) === 'movement';
        });
        if (!hasBoots) {
            this.showKillfeed('👢 Equip Movement Boots before attaching a Free Blessing!');
            return false;
        }
        if (this.blessingId === blessing.id) return false;
        if (this.gold < blessing.cost) {
            this.showKillfeed("\uD83E\uDE99 Need " + (blessing.cost - Math.floor(this.gold)) + " more Gold for " + blessing.name + "!");
            return false;
        }
        this.gold -= blessing.cost;
        this.blessingId = blessing.id;
        this.recomputeStats();
        _audio.ArcadeAudio.play('levelup');
        this.spawnVfx('ring', this.px, this.pz, 4.2, 0x38bdf8);
        this.showKillfeed(blessing.icon + " Boots Blessed: " + blessing.name + " (" + (blessing.cost === 0 ? 'FREE' : "" + blessing.cost + "g") + ")!");
        this.pushMobaHudSnapshot();
        return true;
    };
    _proto.quickBuy = function quickBuy(itemId) {
        if (this.gameOver) return false;
        if (itemId) {
            if ((0, _arenaRoster.getMobaBlessingById)(itemId)) return this.buyBlessing(itemId);
            return this.buyEquipment(itemId);
        }
        var rec = (0, _arenaRoster.getNextQuickBuyRecommendation)(this.heroDef.role, this.equippedItemIds, this.blessingId, this.gold, this.customBuildIds, this.prioritizedItemId);
        if (!rec) return false;
        if (rec.kind === 'item') {
            return this.buyEquipment(rec.id);
        }
        return this.buyBlessing(rec.id);
    };
    _proto.setPrioritizedItem = function setPrioritizedItem(itemId) {
        this.prioritizedItemId = this.prioritizedItemId === itemId ? null : itemId;
        if (this.prioritizedItemId) {
            var it = (0, _arenaRoster.getMobaEquipmentById)(this.prioritizedItemId);
            if (it) this.showKillfeed("\uD83D\uDCCC Prioritized " + it.name + " in Quick-Buy!");
        } else {
            this.showKillfeed('📌 Cleared Quick-Buy Priority.');
        }
        this.pushMobaHudSnapshot();
    };
    _proto.setBuildPreset = function setBuildPreset(presetIdx) {
        var _ROLE_BUILD_PRESETS_this_heroDef_role;
        var presets = (_ROLE_BUILD_PRESETS_this_heroDef_role = _arenaRoster.ROLE_BUILD_PRESETS[this.heroDef.role]) != null ? _ROLE_BUILD_PRESETS_this_heroDef_role : _arenaRoster.ROLE_BUILD_PRESETS.Fighter;
        var clamped = Math.max(0, Math.min(presets.length - 1, presetIdx));
        this.activePresetIdx = clamped;
        this.customBuildIds = [].concat(presets[clamped].items);
        this.showKillfeed("\uD83D\uDCCB Switched Build Preset: " + presets[clamped].name);
        this.pushMobaHudSnapshot();
    };
    _proto.sendMapPing = function sendMapPing(kind, nx, nz, label) {
        var ping = {
            id: this.nextPingId++,
            kind: kind,
            nx: Math.max(0.04, Math.min(0.96, nx)),
            nz: Math.max(0.04, Math.min(0.96, nz)),
            label: label,
            ttl: 4.5
        };
        this.minimapPings.push(ping);
        if (this.minimapPings.length > 6) this.minimapPings.shift();
        this.tacticalPingText = "\uD83D\uDCE3 " + label;
        this.tacticalPingTimer = 4.0;
        _audio.ArcadeAudio.play('click');
        this.showKillfeed("\uD83D\uDCE3 TEAM PING: " + label);
        this.pushMobaHudSnapshot();
    };
    _proto.activateFlyingCloud = function activateFlyingCloud() {
        if (this.activeMapVariant.id !== 'flying_cloud' || this.flyingCloudCd > 0 || this.gameOver) return false;
        var nearCloud = Math.hypot(this.px - _arenaRoster.FLYING_CLOUD_BLUE_SPOT[0], this.pz - _arenaRoster.FLYING_CLOUD_BLUE_SPOT[1]) <= 14 || Math.hypot(this.px - _LegendsArena3DWorld.BLUE_BASE_X, this.pz - _LegendsArena3DWorld.BLUE_BASE_Z) <= 16;
        if (!nearCloud) return false;
        this.flyingCloudCd = _arenaRoster.MLBB_TIMERS.FLYING_CLOUD_COOLDOWN_SEC;
        this.pYaw = Math.atan2(1, -1); // northeast toward mid/river
        this.startPlayerMotion('leap', 58, 1.35, 12.0);
        this.hasteTimer = Math.max(this.hasteTimer, 3.0);
        _audio.ArcadeAudio.play('dash');
        this.spawnVfx('portal_warp', this.px, this.pz, 6.2, 0xa78bfa);
        this.showKillfeed('☁️ FLYING CLOUD LAUNCH! Soaring over Base Walls!');
        this.pushMobaHudSnapshot();
        return true;
    };
    _proto.triggerAction = function triggerAction(actionKey, pressed) {
        if (!pressed || this.gameOver || this.isPaused) return;
        if (actionKey === 'action' || actionKey === 'attack') this.attack();
        else if (actionKey === 'jump' || actionKey === 'skill1') this.castHeroSkill(0);
        else if (actionKey === 'skill2') this.castHeroSkill(1);
        else if (actionKey === 'skill3') this.castHeroSkill(2);
        else if (actionKey === 'skill4') this.castHeroSkill(3);
        else if (actionKey === 'spell') this.castBattleSpell();
        else if (actionKey === 'regen') this.castHpRegen();
        else if (actionKey === 'recall') this.startRecall();
        else if (actionKey === 'itemActive') this.castActiveItem();
    };
    _proto.spawnElementalVfx = function spawnElementalVfx(theme, kind, x, z, size, yaw) {
        if (yaw === void 0) yaw = this.pYaw;
        var built = (0, _mobaElementalVfx.createElementalImpactVfx)(theme, kind, size, yaw);
        built.group.position.set(x, 0, z);
        this.three.scene.add(built.group);
        this.fxObjs.push({
            mesh: built.group,
            life: built.duration,
            maxLife: built.duration,
            mode: 'elemental',
            elemAnim: built.animKind
        });
    };
    _proto.spawnVfx = function spawnVfx(kind, x, z, size, color) {
        if (kind === 'beam') {
            var geo = new _three.CylinderGeometry(0.55, 0.75, size, 10);
            geo.translate(0, size / 2, 0);
            geo.rotateX(Math.PI / 2);
            var mesh = new _three.Mesh(geo, new _three.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.85
            }));
            mesh.position.set(x, 1.5, z);
            mesh.rotation.y = this.pYaw;
            this.three.scene.add(mesh);
            this.fxObjs.push({
                mesh: mesh,
                life: 0.32,
                maxLife: 0.32,
                mode: 'beam'
            });
            return;
        }
        if (kind === 'meteor' || kind === 'lightning' || kind === 'portal_warp') {
            var pillar = new _three.Mesh(new _three.CylinderGeometry(size * 0.22, size * 0.48, 18, 12), new _three.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.68
            }));
            pillar.position.set(x, 9, z);
            this.three.scene.add(pillar);
            this.fxObjs.push({
                mesh: pillar,
                life: 0.36,
                maxLife: 0.36,
                mode: 'pillar'
            });
        }
        if (kind === 'dome' || kind === 'shield_dome' || kind === 'transform_giant') {
            var dome = new _three.Mesh(new _three.SphereGeometry(Math.max(2.2, size * 0.45), 14, 12), new _three.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.35,
                wireframe: true
            }));
            dome.position.set(x, 1.8, z);
            this.three.scene.add(dome);
            this.fxObjs.push({
                mesh: dome,
                life: 0.42,
                maxLife: 0.42,
                mode: 'dome'
            });
        }
        var ring = new _three.Mesh(new _three.RingGeometry(size * 0.38, size, 24), new _three.MeshBasicMaterial({
            color: color,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.78
        }));
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, 0.16, z);
        this.three.scene.add(ring);
        this.fxObjs.push({
            mesh: ring,
            life: 0.3,
            maxLife: 0.3,
            mode: 'ring'
        });
    };
    _proto.setPurpleShortcutOpen = function setPurpleShortcutOpen(campId, open) {
        for(var _iterator = _create_for_of_iterator_helper_loose(this.purpleShortcutWalls), _step; !(_step = _iterator()).done;){
            var w = _step.value;
            if (w.campId !== campId) continue;
            w.open = open;
            var mat = w.mesh.material;
            mat.opacity = open ? 0.16 : 0.92;
            w.mesh.position.y = open ? 0.25 : 1.8;
        }
    };
    _proto.spawnLittleCrammer = function spawnLittleCrammer(parentX, parentZ) {
        var id = "little_crammer_" + Date.now() + "_" + Math.floor(Math.random() * 999);
        var sx = parentX + 2.6;
        var sz = parentZ + 1.8;
        var grp = this.createCampMesh('little_crammer', 0.72, 0xfb7185);
        grp.position.set(sx, 0, sz);
        this.three.scene.add(grp);
        var ringMesh = new _three.Mesh(new _three.RingGeometry(1.1, 1.45, 18), new _three.MeshBasicMaterial({
            color: 0xfb7185,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.65
        }));
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.set(sx, 0.12, sz);
        this.three.scene.add(ringMesh);
        this.jungleCamps.push({
            id: id,
            campKind: 'little_crammer',
            label: 'Little Crammer',
            icon: '🐞',
            mesh: grp,
            ringMesh: ringMesh,
            leashRadius: 10.5,
            patience: 100,
            aggroed: true,
            outOfCombatSec: 0,
            x: sx,
            z: sz,
            homeX: sx,
            homeZ: sz,
            hp: 68,
            maxHp: 68,
            atk: 6,
            cd: 0.6,
            alive: true,
            respawnTimer: 0,
            respawnDelay: 0,
            goldReward: 26,
            scoreReward: 35,
            colorHex: '#fb7185',
            colorNum: 0xfb7185,
            stunTimer: 0,
            isSplitChild: true
        });
    };
    _proto.spawnLithoCompanions = function spawnLithoCompanions(originX, originZ) {
        this.walkieGrassTimer = _arenaRoster.MLBB_TIMERS.WALKIE_GRASS_DURATION_SEC;
        // Remove older walkie / stone roamer wards
        for(var i = this.riverWards.length - 1; i >= 0; i--){
            if (this.riverWards[i].kind !== 'wisp') {
                (0, _LegendsArena3DWorld.disposeObjectTree)(this.riverWards[i].mesh);
                this.three.scene.remove(this.riverWards[i].mesh);
                this.riverWards.splice(i, 1);
            }
        }
        // Walkie Grass floating follower
        var wg = new _three.Group();
        var body = new _three.Mesh(new _three.SphereGeometry(0.55, 10, 10), (0, _threeShared.createToonMaterial)(0x2dd4bf, {
            emissive: 0x14b8a6,
            emissiveIntensity: 0.8
        }));
        body.position.y = 1.6;
        wg.add(body);
        wg.position.set(this.px + 1.8, 0, this.pz + 1.8);
        this.three.scene.add(wg);
        this.riverWards.push({
            mesh: wg,
            x: this.px + 1.8,
            z: this.pz + 1.8,
            homeX: originX,
            homeZ: originZ,
            angle: 0,
            life: _arenaRoster.MLBB_TIMERS.WALKIE_GRASS_DURATION_SEC,
            kind: 'walkie'
        });
        // Stone Roamer patrolling river bush-reveal ward
        var sg = new _three.Group();
        var stone = new _three.Mesh(new _three.OctahedronGeometry(0.68, 0), (0, _threeShared.createToonMaterial)(0x38bdf8, {
            emissive: 0x0ea5e9,
            emissiveIntensity: 0.7
        }));
        stone.position.y = 1.5;
        var vision = new _three.Mesh(new _three.RingGeometry(4.8, 5.4, 24), new _three.MeshBasicMaterial({
            color: 0x2dd4bf,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.42
        }));
        vision.rotation.x = -Math.PI / 2;
        vision.position.y = 0.14;
        sg.add(stone, vision);
        sg.position.set(originX, 0, originZ);
        this.three.scene.add(sg);
        this.riverWards.push({
            mesh: sg,
            x: originX,
            z: originZ,
            homeX: originX,
            homeZ: originZ,
            angle: 0,
            life: 55,
            kind: 'stone_roamer'
        });
    };
    _proto.damageJungleCamp = function damageJungleCamp(jc, dmg, isTrueDmg) {
        if (isTrueDmg === void 0) isTrueDmg = false;
        var _jc_lordStage;
        var _this_blessingId;
        if (!jc.alive) return;
        jc.aggroed = true;
        jc.outOfCombatSec = 0;
        var finalMult = ((_this_blessingId = this.blessingId) == null ? void 0 : _this_blessingId.startsWith('jungle_')) || this.spellDef.id === 'retribution' ? 1.25 : 1.0;
        // Stage 3 Evolved Lord Neutral Aura: 40% DR reduced by 5% per nearby hero (min 15%)
        if (!isTrueDmg && jc.campKind === 'lord' && ((_jc_lordStage = jc.lordStage) != null ? _jc_lordStage : 0) >= 3) {
            var nearbyHeroes = 1; // player
            for(var _iterator = _create_for_of_iterator_helper_loose(this.actors), _step; !(_step = _iterator()).done;){
                var a = _step.value;
                if (a.alive && a.kind === 'hero' && Math.hypot(a.x - jc.x, a.z - jc.z) <= 16) nearbyHeroes++;
            }
            var dr = (0, _arenaRoster.computeEvolvedLordNeutralDr)(nearbyHeroes);
            finalMult *= 1 - dr;
        }
        var applied = Math.max(1, Math.round(dmg * finalMult));
        jc.hp -= applied;
        this.spawnDamageNumber(jc.x, jc.z, applied, isTrueDmg ? 'true' : 'phys');
        if (jc.hp <= 0) {
            jc.alive = false;
            jc.aggroed = false;
            jc.patience = 100;
            jc.mesh.visible = false;
            jc.ringMesh.visible = false;
            if (jc.leashMesh) jc.leashMesh.visible = false;
            jc.x = jc.homeX;
            jc.z = jc.homeZ;
            jc.mesh.position.set(jc.x, 0, jc.z);
            this.jungleClears++;
            // Jungler Retribution Stack Tracking (0/5 -> 5/5)
            if (this.spellDef.id === 'retribution' && this.junglerStacks < 5) {
                this.junglerStacks = Math.min(5, this.junglerStacks + 1);
                if (this.junglerStacks === 5) {
                    this.showKillfeed('🩸 RETRIBUTION EVOLVED (5/5 STACKS)! Max True DMG Unlocked!');
                }
            }
            if (jc.isSplitChild) {
                this.gold += jc.goldReward;
                this.grantHeroXp(30);
                (0, _LegendsArena3DWorld.disposeObjectTree)(jc.mesh);
                (0, _LegendsArena3DWorld.disposeObjectTree)(jc.ringMesh);
                this.three.scene.remove(jc.mesh);
                this.three.scene.remove(jc.ringMesh);
                var idx = this.jungleCamps.indexOf(jc);
                if (idx >= 0) this.jungleCamps.splice(idx, 1);
                this.showKillfeed("\uD83D\uDC1E Little Crammer Slain (+" + jc.goldReward + " Gold)");
                this.pushMobaHudSnapshot();
                return;
            }
            this.gold += jc.goldReward;
            jc.respawnTimer = jc.respawnDelay;
            if (jc.campKind === 'blue_buff') {
                this.blueBuffTimer = _arenaRoster.MLBB_TIMERS.BUFF_DURATION_SEC;
                this.setPurpleShortcutOpen(jc.id, true);
                this.recomputeStats();
                this.lives = Math.min(this.maxLives, this.lives + Math.round(this.maxLives * 0.2));
                (0, _storage.recordMobaDailyEvent)('jungle');
                this.spawnVfx('dome', this.px, this.pz, 4.8, 0xa855f7);
                this.showKillfeed('🟣 PURPLE BUFF SLAIN! (-CDR, Energy/Mana Cost & Shortcut Wall Opened · 75s)');
            } else if (jc.campKind === 'red_buff') {
                this.redBuffTimer = _arenaRoster.MLBB_TIMERS.BUFF_DURATION_SEC;
                this.recomputeStats();
                var pen = (0, _arenaRoster.computeOrangeBuffPenetrationPct)(this.heroDef.role);
                this.lives = Math.min(this.maxLives, this.lives + Math.round(this.maxLives * 0.16));
                (0, _storage.recordMobaDailyEvent)('jungle');
                this.spawnVfx('dome', this.px, this.pz, 4.8, 0xf97316);
                this.showKillfeed("\uD83D\uDFE0 ORANGE BUFF SLAIN! (+True DMG Burn, Slow & +" + pen + "% PEN \xb7 75s)");
            } else if (jc.campKind === 'fire_beetle') {
                this.spawnLittleCrammer(jc.homeX, jc.homeZ);
                (0, _storage.recordMobaDailyEvent)('jungle');
                this.showKillfeed("\uD83E\uDEB2 Fire Beetle Split into Little Crammer! (+" + jc.goldReward + " Gold)");
            } else if (jc.campKind === 'horned_lizard' || jc.campKind === 'lava_golem') {
                var healAmt = Math.round(this.maxLives * 0.14);
                this.lives = Math.min(this.maxLives, this.lives + healAmt);
                this.spawnDamageNumber(this.px, this.pz, healAmt, 'heal');
                (0, _storage.recordMobaDailyEvent)('jungle');
                this.showKillfeed(jc.icon + " " + jc.label + " Farmed (+" + jc.goldReward + " Gold & +" + healAmt + " HP)");
            } else if (jc.campKind === 'litho') {
                this.spawnLithoCompanions(jc.homeX, jc.homeZ);
                (0, _storage.recordMobaDailyEvent)('jungle');
                this.showKillfeed('🌿 LITHOWANDERER SLAIN! Walkie Grass (45s) & Stone Roamer River Ward active!');
            } else if (jc.campKind === 'crab') {
                this.crabAuraTimer = _arenaRoster.MLBB_TIMERS.CRAB_AURA_DURATION_SEC;
                this.crabAuraAcc = 0;
                (0, _storage.recordMobaDailyEvent)('jungle');
                this.showKillfeed("\uD83E\uDD80 " + jc.label + " Slain! (+18s Ticking Gold & EXP Aura)");
            } else if (jc.campKind === 'turtle') {
                this.turtleKills++;
                var rew = (0, _arenaRoster.computeTurtleRewards)(this.turtleKills, this.heroLevel);
                this.gold += rew.teamGold;
                this.turtleBlessingTimer = rew.teamShieldSec;
                this.shieldTimer = Math.max(this.shieldTimer, 8.0);
                this.lives = Math.min(this.maxLives, this.lives + Math.round(this.maxLives * 0.22));
                (0, _storage.recordMobaDailyEvent)('boss');
                this.spawnVfx('dome', this.px, this.pz, 6.2, 0x10b981);
                // Healing Turtle Map Variant: summon a mini-turtle siege unit
                if (this.activeMapVariant.id === 'healing_turtle') {
                    var mtMesh = (0, _threeShared.buildSoldierMesh)(0x10b981, 0x065f46, 0x6ee7b7, 0.95, _storage.playerState.mobaSettings.outline).group;
                    mtMesh.position.set(this.px + 2, 0, this.pz - 2);
                    this.three.scene.add(mtMesh);
                    this.actors.push({
                        id: this.nextActorId++,
                        mesh: mtMesh,
                        x: this.px + 2,
                        z: this.pz - 2,
                        team: 'blue',
                        kind: 'summon_clone',
                        hp: 260,
                        maxHp: 260,
                        atk: 26,
                        cd: 0.5,
                        lane: 1,
                        alive: true,
                        stunTimer: 0,
                        rootTimer: 0,
                        silenceTimer: 0,
                        fearTimer: 0,
                        tauntTimer: 0,
                        slowTimer: 0,
                        airborneTimer: 0,
                        airborneDur: 0.4,
                        airbornePeak: 0,
                        lifeTimer: 40,
                        respawnTimer: 0,
                        spawnX: this.px,
                        spawnZ: this.pz,
                        label: 'Mini-Turtle'
                    });
                }
                // Next Turtle Pit Logic (6:00 kill cutoff -> otherwise waits for 8:00 Lord)
                this.activeBossPit = this.activeBossPit === 'upper' ? 'lower' : 'upper';
                var nextPit = this.activeBossPit === 'upper' ? _arenaRoster.UPPER_RIVER_PIT : _arenaRoster.LOWER_RIVER_PIT;
                jc.homeX = nextPit[0];
                jc.homeZ = nextPit[1];
                jc.x = nextPit[0];
                jc.z = nextPit[1];
                jc.ringMesh.position.set(nextPit[0], 0.12, nextPit[1]);
                if (jc.leashMesh) jc.leashMesh.position.set(nextPit[0], 0.13, nextPit[1]);
                if (this.pitHologramGroup) this.pitHologramGroup.position.set(nextPit[0], 0, nextPit[1]);
                if ((0, _arenaRoster.canRespawnNextTurtle)(this.matchElapsed)) {
                    jc.respawnTimer = _arenaRoster.MLBB_TIMERS.TURTLE_RESPAWN_SEC;
                } else {
                    this.bossPhase = 'lord';
                    jc.respawnTimer = Math.max(10, _arenaRoster.MLBB_TIMERS.FIRST_LORD_SEC - this.matchElapsed);
                }
                this.showKillfeed("\uD83D\uDC22 TURTLE #" + this.turtleKills + " SLAIN! (+" + rew.teamGold + "g Team Gold & Turtle's Blessing 120s)");
            } else if (jc.campKind === 'lord') {
                var stage = jc.lordStage && jc.lordStage >= 1 ? jc.lordStage : 1;
                this.spawnAlliedLord(stage);
                (0, _storage.recordMobaDailyEvent)('boss');
                var clock = (0, _arenaRoster.evaluateBattlefieldClock)(this.matchElapsed);
                jc.respawnTimer = clock.lordRespawnSec;
            }
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
            var rankMult = this.mobaMode === 'ranked' ? 1.5 : this.mobaMode === 'ai_vs' ? 0.75 : 1;
            this.score += Math.round(jc.scoreReward * rankMult);
            (0, _runtimeBridge.addCoins)(Math.max(2, Math.round((jc.campKind === 'lord' ? 18 : jc.campKind === 'turtle' ? 12 : 4) * rankMult)));
            (0, _runtimeBridge.addXp)(jc.campKind === 'lord' ? 40 : 14);
            this.grantHeroXp(jc.campKind === 'lord' ? 140 : jc.campKind === 'turtle' ? 110 : 55);
            _audio.ArcadeAudio.play('coin');
            (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
            this.pushMobaHudSnapshot();
        }
    };
    _proto.damageEnemyActor = function damageEnemyActor(a, dmg, byPlayer, dmgKind) {
        if (byPlayer === void 0) byPlayer = true;
        if (dmgKind === void 0) dmgKind = 'phys';
        var bonusMult = byPlayer && this.heroDef.archetype === 'burst' && a.hp < a.maxHp * 0.45 ? 1.25 : 1.0;
        if (byPlayer) {
            // Combat reveal for Bush Stealth (2s)
            if (this.inBush) this.bushRevealTimer = Math.max(this.bushRevealTimer, 2.0);
            // Blade of Despair (Despair: +25% when enemy HP < 50%)
            if (this.computedStats.hasDespair && a.hp < a.maxHp * 0.5) {
                bonusMult *= 1.25;
            }
            // Roaming Blessing: Dire Hit (+18% burst when enemy HP < 35%)
            if (this.computedStats.hasDireHit && a.hp < a.maxHp * 0.35) {
                bonusMult *= 1.18;
            }
            // Keystone Talent: Lethal Ignition (3 rapid hits within 5s deal bonus adaptive scorch burst)
            if (this.keystoneT3 === 'lethal_ignition' && this.lethalIgnitionCd <= 0 && a.kind === 'hero') {
                if (this.lethalIgnitionWindow <= 0) this.lethalIgnitionHits = 0;
                this.lethalIgnitionWindow = 4.5;
                this.lethalIgnitionHits++;
                if (this.lethalIgnitionHits >= 3) {
                    this.lethalIgnitionHits = 0;
                    this.lethalIgnitionWindow = 0;
                    this.lethalIgnitionCd = 10.0;
                    var scorch = Math.round(70 + this.heroLevel * 12);
                    a.hp -= scorch;
                    this.spawnDamageNumber(a.x, a.z, scorch, 'true');
                    this.spawnVfx('ring', a.x, a.z, 3.6, 0xf97316);
                }
            }
        }
        // Demon Hunter Sword / Glowing Wand / Wishing Lantern (% Current HP bonus damage)
        var devourBonus = byPlayer && this.computedStats.hasDevour ? Math.min(45, Math.round(a.hp * 0.08)) : 0;
        var totalDmg = Math.max(1, Math.round(dmg * bonusMult) + devourBonus);
        a.hp -= totalDmg;
        if (byPlayer) {
            this.spawnDamageNumber(a.x, a.z, totalDmg, dmgKind);
        }
        // Sky Piercer (Lethality: instant execute if hero HP falls below 6%)
        if (byPlayer && this.equippedItemIds.includes('sky_piercer') && a.hp > 0 && a.hp <= a.maxHp * 0.06) {
            a.hp = 0;
        }
        if (a.hp <= 0) {
            a.alive = false;
            a.mesh.visible = false;
            if (this.lockedEnemyId === a.id) this.lockedEnemyId = null;
            if (a.kind === 'hero') {
                a.respawnTimer = 10.0;
            }
            var g = a.kind === 'lord' ? 180 : a.kind === 'hero' ? 115 : 28;
            if (byPlayer) {
                this.gold += Math.round(this.mobaMode === 'brawl' ? g * 1.5 : g);
                if (this.combatKit.passiveKind === 'kill_heal') {
                    var heal = Math.round(this.maxLives * 0.18);
                    this.lives = Math.min(this.maxLives, this.lives + heal);
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                    this.spawnDamageNumber(this.px, this.pz, heal, 'heal');
                }
                // Keystone Talent: Killing Spree (15% Max HP heal + 20% Move Speed on Hero elimination)
                if (a.kind === 'hero' && this.keystoneT3 === 'killing_spree') {
                    var ksHeal = Math.round(this.maxLives * 0.15);
                    this.lives = Math.min(this.maxLives, this.lives + ksHeal);
                    this.hasteTimer = Math.max(this.hasteTimer, 3.0);
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                    this.spawnDamageNumber(this.px, this.pz, ksHeal, 'heal');
                }
                // Fleeting Time (Timestream: -30% Ultimate Cooldown on hero kill/assist)
                if (a.kind === 'hero' && this.computedStats.hasTimestream) {
                    this.cdSkill3 = Math.max(0, this.cdSkill3 - this.maxCdSkill3 * 0.3);
                    this.cdSkill4 = Math.max(0, this.cdSkill4 - this.maxCdSkill4 * 0.3);
                }
                // Equipped Elimination Effect VFX on hero/lord KO
                if (a.kind === 'hero' || a.kind === 'lord') {
                    var _MOBA_ELIM_EFFECTS_find;
                    var elim = (_MOBA_ELIM_EFFECTS_find = _arenaRoster.MOBA_ELIM_EFFECTS.find(function(e) {
                        return e.id === _storage.playerState.mobaElimEffect;
                    })) != null ? _MOBA_ELIM_EFFECTS_find : _arenaRoster.MOBA_ELIM_EFFECTS[0];
                    this.spawnVfx('dome', a.x, a.z, 5.2, elim.colorNum);
                    this.spawnVfx('lightning', a.x, a.z, 4.6, elim.colorNum);
                }
            }
            if (a.kind === 'hero' || a.kind === 'lord') {
                this.kills++;
                _storage.playerState.mobaKillsTotal++;
                (0, _storage.persistMobaStats)();
                if (a.kind === 'hero') (0, _storage.recordMobaDailyEvent)('kill');
                this.showKillfeed(a.kind === 'lord' ? "\uD83D\uDC09 LORD SLAIN BY " + this.heroDef.name.toUpperCase() + "!" : "⚔️ SLAY! " + this.heroDef.name + " eliminated " + (a.label || 'Enemy Hero') + "!");
                // Contextual AI ally celebration emote near takedown
                var nearbyAlly = this.actors.find(function(ally) {
                    return ally.alive && ally.team === 'blue' && ally.kind === 'hero' && Math.hypot(ally.x - a.x, ally.z - a.z) <= 44;
                });
                if (nearbyAlly) {
                    this.triggerActorAiEmote(nearbyAlly, a.kind === 'lord' ? 'objective' : 'rally');
                }
            }
            var rankMult = this.mobaMode === 'ranked' ? 1.5 : this.mobaMode === 'ai_vs' ? 0.75 : 1;
            this.score += Math.round((a.kind === 'lord' ? 400 : a.kind === 'hero' ? 160 : 32) * rankMult);
            (0, _runtimeBridge.addCoins)(Math.max(1, Math.round((a.kind === 'hero' ? 10 : 2) * rankMult)));
            (0, _runtimeBridge.addXp)(a.kind === 'hero' ? 20 : 5);
            if (byPlayer) {
                this.grantHeroXp(a.kind === 'lord' ? 160 : a.kind === 'hero' ? 120 : 28);
            }
            _audio.ArcadeAudio.play(a.kind === 'minion' ? 'hit' : 'coin');
            (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
            this.pushMobaHudSnapshot();
        } else if (a.kind === 'hero' && a.hp > 0 && a.hp <= a.maxHp * 0.3) {
            this.triggerActorAiEmote(a, 'low_hp');
        }
    };
    _proto.damageTurret = function damageTurret(t, dmg, byLord) {
        if (byLord === void 0) byLord = false;
        var clock = (0, _arenaRoster.evaluateBattlefieldClock)(this.matchElapsed);
        var armorBuster = this.equippedItemIds.includes('malefic_roar') ? 1.25 : 1.0;
        var shieldDr = 1.0;
        if (t.tier === 1 && clock.outerTurretShieldActive) shieldDr = 0.72;
        else if (t.tier === 2 && clock.innerTurretEarlyDrActive) shieldDr = 0.8;
        else if (t.tier === 3 && clock.baseTurretEarlyBuffActive) shieldDr = 0.85;
        var totalDmg = Math.max(1, Math.round(dmg * armorBuster * shieldDr));
        // Stage 2+ Enhanced/Evolved Lord Turret Charge slam on first enemy turret
        if (byLord && this.lordChargeAvailable && t.team === 'red' && !t.isNexus) {
            this.lordChargeAvailable = false;
            totalDmg = Math.round(dmg * 2.8);
            this.cameraShake = Math.max(this.cameraShake, 0.52);
            this.spawnVfx('dome', t.x, t.z, 7.5, 0xfacc15);
            this.showKillfeed('💥 ENHANCED LORD TURRET CHARGE! Massive True DMG Slam!');
        }
        t.hp -= totalDmg;
        if (t.team === 'red') {
            this.spawnDamageNumber(t.x, t.z, totalDmg, byLord ? 'true' : 'phys');
            // Outer Turret Plating Gold (< 5:00)
            if (t.tier === 1 && clock.outerTurretShieldActive && t.platingGoldPaid < 160) {
                var plateGold = Math.min(160 - t.platingGoldPaid, Math.max(6, Math.round(totalDmg * 0.4)));
                t.platingGoldPaid += plateGold;
                this.gold += plateGold;
            }
        }
        if (t.hp <= 0) {
            t.alive = false;
            t.mesh.visible = false;
            _audio.ArcadeAudio.play('explosion');
            this.cameraShake = Math.max(this.cameraShake, 0.45);
            if (t.team === 'red') {
                _storage.playerState.mobaTurretsDestroyed++;
                (0, _storage.persistMobaStats)();
                var baseGold = t.isNexus ? 250 : 95;
                var goldReward = this.activeMapVariant.id === 'golden_turret' ? Math.round(baseGold * 1.65) : baseGold;
                this.gold += goldReward;
                this.grantHeroXp(t.isNexus ? 200 : 110);
                // Destroying Red Base Turret (T3) upgrades allied lane waves permanently to Super Minions
                if (t.tier === 3) {
                    this.superMinionLanes.add(t.lane);
                    this.showKillfeed("\uD83D\uDD25 RED BASE TURRET DESTROYED! Super Minions unlocked in " + (t.lane === 1 ? 'Mid' : t.lane === this.laneAssign.expLaneIndex ? 'EXP' : 'Gold') + " Lane!");
                }
            }
            var rankMult = this.mobaMode === 'ranked' ? 1.5 : this.mobaMode === 'ai_vs' ? 0.75 : 1;
            this.score += Math.round((t.isNexus ? 1000 : 250) * rankMult);
            (0, _runtimeBridge.addCoins)(Math.max(2, Math.round((t.isNexus ? 60 : 18) * rankMult)));
            (0, _runtimeBridge.addXp)(40);
            if (!(t.team === 'red' && t.tier === 3)) {
                this.showKillfeed(t.isNexus ? "" + (t.team === 'red' ? '🏆 VICTORY! RED NEXUS DESTROYED!' : '💀 BLUE NEXUS FELL!') : "\uD83C\uDFF0 " + (t.team === 'red' ? 'Enemy' : 'Allied') + " Turret Destroyed!" + (this.activeMapVariant.id === 'golden_turret' ? ' (+65% Gold)' : ''));
            }
            if (t.team === 'red' && !t.isNexus) {
                var nearbyAlly = this.actors.find(function(ally) {
                    return ally.alive && ally.team === 'blue' && ally.kind === 'hero' && Math.hypot(ally.x - t.x, ally.z - t.z) <= 50;
                });
                if (nearbyAlly) {
                    this.triggerActorAiEmote(nearbyAlly, 'objective');
                }
            }
            (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
            if (t.isNexus && t.team === 'red') {
                _storage.playerState.mobaWins++;
                (0, _storage.persistMobaStats)();
                if (this.mobaMode === 'ranked') {
                    (0, _storage.recordMobaDailyEvent)('ranked_win');
                }
                this.endMatch(true);
            } else if (t.isNexus && t.team === 'blue') {
                this.endMatch(false);
            }
        }
    };
    _proto.applyPlayerDamage = function applyPlayerDamage(rawDmg, attacker) {
        if (this.stealthTimer > 0 || this.frozenTimer > 0 || this.windChantTimer > 0 || this.untargetableTimer > 0) return;
        this.outOfCombatSec = 0;
        if (this.recallTimer > 0) {
            this.recallTimer = 0;
            this.showKillfeed('⚠️ RECALL INTERRUPTED BY DAMAGE!');
        }
        var mult = (this.shieldTimer > 0 ? 0.4 : 1.0) * (1 - this.computedStats.damageReductionPct);
        if (this.vengeanceTimer > 0) {
            mult *= 0.65; // Vengeance 35% Damage Reduction
        }
        if (this.combatKit.passiveKind === 'low_hp_armor' && this.lives < this.maxLives * 0.5) {
            mult *= 0.72;
        }
        var finalDmg = Math.max(1, Math.round(rawDmg * mult));
        this.lives = Math.max(0, this.lives - finalDmg);
        (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        this.spawnDamageNumber(this.px, this.pz, finalDmg, 'phys');
        // Vengeance Battle Spell reflection (35% Magic Damage back to attacker)
        if (this.vengeanceTimer > 0 && attacker && attacker.alive && attacker.team === 'red') {
            var refDmg = Math.max(6, Math.round(rawDmg * 0.35 + 14));
            this.damageEnemyActor(attacker, refDmg, true, 'magic');
            this.spawnVfx('ring', attacker.x, attacker.z, 2.8, 0xf59e0b);
        }
        // Rose Gold Meteor / Queen's Wings (Lifeline / Demonize emergency shield below 32% HP)
        if (this.lives > 0 && this.lives < this.maxLives * 0.32 && this.computedStats.hasLifelineShield && this.lifelineCd <= 0) {
            this.lifelineCd = 35;
            this.shieldTimer = Math.max(this.shieldTimer, 3.5);
            this.hasteTimer = Math.max(this.hasteTimer, 2.5);
            this.spawnVfx('dome', this.px, this.pz, 4.2, 0xfacc15);
            this.showKillfeed('🛡️ LIFELINE SHIELD ACTIVATED!');
        }
        if (this.lives <= 0) {
            // Immortality (Immortal resurrection)
            if (this.computedStats.hasImmortality && this.immortalityCd <= 0) {
                this.immortalityCd = 55;
                this.lives = Math.round(this.maxLives * 0.25);
                this.shieldTimer = Math.max(this.shieldTimer, 3.0);
                (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                _audio.ArcadeAudio.play('levelup');
                this.spawnVfx('dome', this.px, this.pz, 4.8, 0xfacc15);
                this.showKillfeed('🪽 IMMORTALITY RESURRECTED YOUR HERO!');
                this.pushMobaHudSnapshot();
                return;
            }
            if (this.combatKit.passiveKind === 'revive_cheat' && this.reviveCheatCd <= 0) {
                this.reviveCheatCd = 55;
                this.lives = Math.round(this.maxLives * 0.35);
                this.stealthTimer = 2.0;
                this.hasteTimer = 2.5;
                (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                this.spawnVfx('dome', this.px, this.pz, 4.5, 0xfef08a);
                this.showKillfeed("\uD83E\uDD5A " + this.heroDef.name.toUpperCase() + " PASSIVE CHEATED DEATH!");
                return;
            }
            if (attacker && attacker.alive && attacker.kind === 'hero') {
                this.triggerActorAiEmote(attacker, 'kill');
            }
            this.deaths++;
            this.px = _LegendsArena3DWorld.BLUE_BASE_X + 4;
            this.py = 0;
            this.pz = _LegendsArena3DWorld.BLUE_BASE_Z - 4;
            this.activeMotion = null;
            this.lives = this.maxLives;
            this.playerTrailHp = this.maxLives;
            this.playerLastHp = this.maxLives;
            this.playerTrailHold = 0;
            _audio.ArcadeAudio.play('hurt');
            this.showKillfeed("\uD83D\uDC80 " + this.heroDef.name + " respawned at Base Fountain!");
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        }
    };
    return LegendsArena3DCombat;
}(_LegendsArena3DWorld.LegendsArena3DWorld);

});

})(window.ArcadeMod);
