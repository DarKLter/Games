(function(ArcadeMod){
// === MODULE: src/games/legends-arena/LegendsArena3D ===
ArcadeMod.define("src/games/legends-arena/LegendsArena3D", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LegendsArena3D", {
    enumerable: true,
    get: function() {
        return LegendsArena3D;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _arenaRoster = require("../../core/arenaRoster");
var _audio = require("../../core/audio");
var _runtimeBridge = require("../../core/runtimeBridge");
var _storage = require("../../core/storage");
var _mobaElementalVfx = require("./mobaElementalVfx");
var _LegendsArena3DCombat = require("./LegendsArena3DCombat");
var _LegendsArena3DWorld = _export_star(require("./LegendsArena3DWorld"), exports);
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
var LegendsArena3D = /*#__PURE__*/ function(LegendsArena3DCombat) {
    "use strict";
    _inherits(LegendsArena3D, LegendsArena3DCombat);
    function LegendsArena3D() {
        var _this;
        _this = LegendsArena3DCombat.apply(this, arguments) || this, _this.tick = function() {
            if (!_this.isRunning || _this.gameOver || _this.isPaused) return;
            var now = performance.now();
            var dt = Math.min(Math.max((now - _this.lastTime) / 1000, 0.001), 0.05);
            _this.lastTime = now;
            _this.updateSimulation(dt);
            _this.updateAllHealthTrails(dt);
            _this.drawOverlayHud();
            _this.three.render();
            if (_this.isRunning && !_this.gameOver && !_this.isPaused) {
                _this.three.scheduleNextFrame(_this.tick);
            }
        };
        return _this;
    }
    var _proto = LegendsArena3D.prototype;
    _proto.pushMobaHudSnapshot = function pushMobaHudSnapshot() {
        var _this = this;
        var _ROLE_BUILD_PRESETS_this_heroDef_role;
        var _this_blessingId, _this_blessingId1, _MOBA_MODES_find;
        var s1 = this.combatKit.skills[0];
        var s2 = this.combatKit.skills[1];
        var s3 = this.combatKit.skills[2];
        var s4 = this.combatKit.skills[3];
        var buffs = [];
        if (this.blueBuffTimer > 0) buffs.push("\uD83D\uDD35BLUE " + Math.ceil(this.blueBuffTimer) + "s");
        if (this.redBuffTimer > 0) buffs.push("\uD83D\uDFE0RED " + Math.ceil(this.redBuffTimer) + "s");
        if (this.ccImmuneTimer > 0) buffs.push('✨CC IMMUNE');
        if (this.vengeanceTimer > 0) buffs.push('⚜️VENG');
        if (this.sprintBoostTimer > 0) buffs.push('💨SPRINT');
        if (this.windChantTimer > 0) buffs.push('🍃IMMUNE');
        if (this.frozenTimer > 0) buffs.push('❄️FROZEN');
        if (this.shieldTimer > 0) buffs.push('🛡️SHD');
        if (this.inspireTimer > 0) buffs.push('🔥INS');
        if (this.giantTimer > 0) buffs.push('🐲GIANT');
        if (this.inBush && this.bushRevealTimer <= 0) buffs.push('🌿STEALTH');
        var hasActiveItem = Boolean(this.computedStats.activeKind);
        var enemyHeroes = [];
        for(var _iterator = _create_for_of_iterator_helper_loose(this.actors), _step; !(_step = _iterator()).done;){
            var a = _step.value;
            if (a.team === 'red' && a.kind === 'hero') {
                enemyHeroes.push({
                    id: a.id,
                    name: a.label || 'Enemy',
                    icon: a.icon || '⚔️',
                    hpPct: Math.max(0, Math.min(100, Math.round(a.hp / Math.max(1, a.maxHp) * 100))),
                    alive: a.alive,
                    dist: Math.round(Math.hypot(a.x - this.px, a.z - this.pz))
                });
            }
        }
        var activeUlt = this.activeUltSetpieces[0];
        var iconicUltLabel = activeUlt ? activeUlt.kind === 'johnson_car' ? '🚗 FULL THROTTLE (TAP ULT TO CRASH)' : activeUlt.kind === 'yve_chessboard' ? '♟️ REAL WORLD MANIPULATION' : activeUlt.kind === 'lancelot_thorned_rose' ? '🌹 THORNED ROSE' : activeUlt.kind === 'tigreal_implosion' ? '🛡️ IMPLOSION' : '☂️ YIN YANG OVERTURN' : undefined;
        var clock = (0, _arenaRoster.evaluateBattlefieldClock)(this.matchElapsed);
        var presets = (_ROLE_BUILD_PRESETS_this_heroDef_role = _arenaRoster.ROLE_BUILD_PRESETS[this.heroDef.role]) != null ? _ROLE_BUILD_PRESETS_this_heroDef_role : _arenaRoster.ROLE_BUILD_PRESETS.Fighter;
        var activeBuffs = [];
        if (this.blueBuffTimer > 0) {
            activeBuffs.push({
                id: 'purple_buff',
                label: 'Purple Buff',
                icon: '🟣',
                remainingSec: Math.ceil(this.blueBuffTimer),
                maxSec: _arenaRoster.MLBB_TIMERS.BUFF_DURATION_SEC,
                color: '#a855f7'
            });
        }
        if (this.redBuffTimer > 0) {
            activeBuffs.push({
                id: 'orange_buff',
                label: 'Orange Buff',
                icon: '🟠',
                remainingSec: Math.ceil(this.redBuffTimer),
                maxSec: _arenaRoster.MLBB_TIMERS.BUFF_DURATION_SEC,
                color: '#f97316'
            });
        }
        if (this.turtleBlessingTimer > 0) {
            activeBuffs.push({
                id: 'turtle_blessing',
                label: 'Turtle Shield',
                icon: '🐢',
                remainingSec: Math.ceil(this.turtleBlessingTimer),
                maxSec: 120,
                color: '#10b981'
            });
        }
        if (this.crabAuraTimer > 0) {
            activeBuffs.push({
                id: 'crab_aura',
                label: 'Gold Crab',
                icon: '🦀',
                remainingSec: Math.ceil(this.crabAuraTimer),
                maxSec: _arenaRoster.MLBB_TIMERS.CRAB_AURA_DURATION_SEC,
                color: '#facc15'
            });
        }
        if (this.walkieGrassTimer > 0) {
            activeBuffs.push({
                id: 'walkie_grass',
                label: 'Walkie Grass',
                icon: '🌿',
                remainingSec: Math.ceil(this.walkieGrassTimer),
                maxSec: _arenaRoster.MLBB_TIMERS.WALKIE_GRASS_DURATION_SEC,
                color: '#2dd4bf'
            });
        }
        if (this.homeguardTimer > 0) {
            activeBuffs.push({
                id: 'homeguard',
                label: 'Homeguard',
                icon: '💨',
                remainingSec: Math.ceil(this.homeguardTimer),
                maxSec: 4.5,
                color: '#38bdf8'
            });
        }
        var toNorm = function toNorm(v) {
            return Math.max(0, Math.min(1, (v + _LegendsArena3DWorld.MAP_HALF) / _LegendsArena3DWorld.MAP_SIZE));
        };
        var bossCamp = this.jungleCamps.find(function(c) {
            return c.id === 'river_boss';
        });
        var objectiveBanner = bossCamp ? {
            kind: this.bossPhase === 'lord' || bossCamp.campKind === 'lord' ? 'lord' : 'turtle',
            stage: this.bossPhase === 'lord' ? Math.max(1, clock.lordStage) : 0,
            label: bossCamp.label,
            alive: bossCamp.alive,
            countdownSec: bossCamp.alive ? 0 : Math.max(0, Math.ceil(bossCamp.respawnTimer)),
            pit: this.activeBossPit
        } : undefined;
        var minimapCamps = this.jungleCamps.filter(function(c) {
            return !c.isSplitChild;
        }).map(function(c) {
            return {
                id: c.id,
                kind: c.campKind === 'blue_buff' ? 'purple' : c.campKind === 'red_buff' ? 'orange' : c.campKind === 'litho' ? 'litho' : c.campKind === 'crab' ? 'crab' : c.campKind === 'turtle' ? 'turtle' : c.campKind === 'lord' ? 'lord' : 'small',
                nx: toNorm(c.alive ? c.x : c.homeX),
                nz: toNorm(c.alive ? c.z : c.homeZ),
                alive: c.alive,
                respawnSec: c.alive ? 0 : Math.max(0, Math.ceil(c.respawnTimer)),
                label: c.label,
                icon: c.icon
            };
        });
        var nearFlyingCloud = this.activeMapVariant.id === 'flying_cloud' && (Math.hypot(this.px - _arenaRoster.FLYING_CLOUD_BLUE_SPOT[0], this.pz - _arenaRoster.FLYING_CLOUD_BLUE_SPOT[1]) <= 14 || Math.hypot(this.px - _LegendsArena3DWorld.BLUE_BASE_X, this.pz - _LegendsArena3DWorld.BLUE_BASE_Z) <= 16);
        var snap = {
            heroName: this.heroDef.name,
            heroRole: this.heroDef.role,
            attackLabel: 'ATK',
            hasSkill4: Boolean(s4),
            hasActiveItem: hasActiveItem,
            passiveLabel: this.combatKit.passiveLabel,
            passiveStacks: this.passiveStacks,
            maxStacks: this.combatKit.maxStacks,
            buffsText: buffs.join(' '),
            gold: Math.floor(this.gold),
            equippedItemIds: [].concat(this.equippedItemIds),
            customBuildIds: [].concat(this.customBuildIds),
            activePresetIdx: this.activePresetIdx,
            presetNames: presets.map(function(p) {
                return p.name;
            }),
            prioritizedItemId: this.prioritizedItemId,
            blessingId: this.blessingId,
            blueBuffSec: Math.ceil(this.blueBuffTimer),
            redBuffSec: Math.ceil(this.redBuffTimer),
            matchElapsedSec: Math.floor(this.matchElapsed),
            mapVariantId: this.activeMapVariant.id,
            mapVariantName: this.activeMapVariant.name,
            mapVariantIcon: this.activeMapVariant.icon,
            mapVariantSummary: this.activeMapVariant.summary,
            expLaneSide: this.laneAssign.expLaneSide,
            goldLaneSide: this.laneAssign.goldLaneSide,
            outerShieldActive: clock.outerTurretShieldActive,
            isJungler: this.spellDef.id === 'retribution' || Boolean((_this_blessingId = this.blessingId) == null ? void 0 : _this_blessingId.startsWith('jungle_')),
            junglerStacks: this.junglerStacks,
            hasRoamBlessing: Boolean((_this_blessingId1 = this.blessingId) == null ? void 0 : _this_blessingId1.startsWith('roam_')),
            roamGold: Math.floor(this.roamGold),
            flyingCloudReady: this.activeMapVariant.id === 'flying_cloud' && this.flyingCloudCd <= 0,
            nearFlyingCloud: nearFlyingCloud,
            activeBuffs: activeBuffs,
            objectiveBanner: objectiveBanner,
            minimapData: {
                playerNx: toNorm(this.px),
                playerNz: toNorm(this.pz),
                camps: minimapCamps,
                cycloneEyes: this.cycloneEyes.map(function(ce) {
                    return {
                        id: ce.id,
                        nx: toNorm(ce.x),
                        nz: toNorm(ce.z),
                        ready: ce.cd <= 0,
                        cdSec: Math.ceil(ce.cd)
                    };
                }),
                turrets: this.turrets.filter(function(t) {
                    return t.alive;
                }).map(function(t) {
                    return {
                        nx: toNorm(t.x),
                        nz: toNorm(t.z),
                        team: t.team,
                        isNexus: t.isNexus,
                        shield: t.tier === 1 && clock.outerTurretShieldActive
                    };
                }),
                heroes: this.actors.filter(function(a) {
                    return a.alive && (a.kind === 'hero' || a.kind === 'lord');
                }).map(function(a) {
                    return {
                        nx: toNorm(a.x),
                        nz: toNorm(a.z),
                        team: a.team,
                        isLord: a.kind === 'lord'
                    };
                }),
                pings: this.minimapPings.map(function(p) {
                    return _extends({}, p);
                })
            },
            tacticalPingText: this.tacticalPingTimer > 0 ? this.tacticalPingText : '',
            lockedEnemyId: this.lockedEnemyId,
            enemyHeroes: enemyHeroes,
            effectiveSpeed: Math.round(this.effectiveMlbbSpeed),
            isSprinting: this.isSprinting,
            inBushStealth: this.inBush && this.bushRevealTimer <= 0,
            ccImmuneSec: Number(this.ccImmuneTimer.toFixed(1)),
            activeCcText: this.frozenTimer > 0 ? '❄️ FROZEN' : this.ccImmuneTimer > 0 ? '✨ CC IMMUNE' : '',
            recallProgress: this.recallTimer > 0 ? Math.max(0, Math.min(1, 1 - this.recallTimer / 2.4)) : 0,
            iconicUltLabel: iconicUltLabel,
            combatStats: {
                atk: this.atkDmg,
                maxHp: this.maxLives,
                physDef: this.computedStats.physDef,
                magicDef: this.computedStats.magicDef,
                cdrPct: this.computedStats.cdrPct,
                moveSpd: Math.round(this.effectiveMlbbSpeed)
            },
            skill1: {
                label: s1 ? s1.shortLabel : 'SKILL 1',
                icon: s1 ? s1.icon : '🗡️',
                cd: Number(this.cdSkill1.toFixed(1)),
                maxCd: this.maxCdSkill1,
                visible: true,
                elementColor: _arenaRoster.MOBA_ELEMENT_PALETTES[s1 ? s1.elementTheme : this.heroBaseElement].glowHex,
                targeting: s1 ? s1.targeting : 'line'
            },
            skill2: {
                label: s2 ? s2.shortLabel : 'SKILL 2',
                icon: s2 ? s2.icon : '☄️',
                cd: Number(this.cdSkill2.toFixed(1)),
                maxCd: this.maxCdSkill2,
                visible: true,
                elementColor: _arenaRoster.MOBA_ELEMENT_PALETTES[s2 ? s2.elementTheme : this.heroBaseElement].glowHex,
                targeting: s2 ? s2.targeting : 'circle'
            },
            skill3: {
                label: s3 ? s3.shortLabel : 'ULTI',
                icon: s3 ? s3.icon : '🌟',
                cd: Number(this.cdSkill3.toFixed(1)),
                maxCd: this.maxCdSkill3,
                visible: true,
                elementColor: _arenaRoster.MOBA_ELEMENT_PALETTES[s3 ? s3.elementTheme : this.heroBaseElement].glowHex,
                targeting: s3 ? s3.targeting : 'circle'
            },
            skill4: {
                label: s4 ? s4.shortLabel : 'SKILL 4',
                icon: s4 ? s4.icon : '🌀',
                cd: Number(this.cdSkill4.toFixed(1)),
                maxCd: this.maxCdSkill4,
                visible: Boolean(s4),
                elementColor: _arenaRoster.MOBA_ELEMENT_PALETTES[s4 ? s4.elementTheme : this.heroBaseElement].glowHex,
                targeting: s4 ? s4.targeting : 'circle'
            },
            spell: function() {
                var meta = _this.resolveActionAimMeta('spell');
                return {
                    label: _this.spellDef.name.slice(0, 7).toUpperCase(),
                    icon: _this.spellDef.icon,
                    cd: Number(_this.cdSpell.toFixed(1)),
                    maxCd: _this.maxCdSpell,
                    visible: true,
                    elementColor: meta ? _arenaRoster.MOBA_ELEMENT_PALETTES[meta.elementTheme].glowHex : '#38bdf8',
                    targeting: meta ? meta.targeting : 'self'
                };
            }(),
            regen: {
                label: 'REGEN',
                icon: '💚',
                cd: Number(this.cdRegen.toFixed(1)),
                maxCd: this.maxCdRegen,
                visible: true,
                activeBuff: this.regenHoTTimer > 0,
                elementColor: '#22c55e',
                targeting: 'self'
            },
            recall: {
                label: this.recallTimer > 0 ? "" + this.recallTimer.toFixed(1) + "s" : 'RECALL',
                icon: '🌀',
                cd: 0,
                maxCd: 2.4,
                visible: !((_MOBA_MODES_find = _arenaRoster.MOBA_MODES.find(function(m) {
                    return m.id === _this.mobaMode;
                })) == null ? void 0 : _MOBA_MODES_find.disableRecall),
                activeBuff: this.recallTimer > 0,
                elementColor: '#38bdf8',
                targeting: 'self'
            },
            itemActive: {
                label: this.computedStats.activeLabel || 'ACTIVE',
                icon: this.computedStats.activeIcon || '⚡',
                cd: Number(this.cdItemActive.toFixed(1)),
                maxCd: this.maxCdItemActive,
                visible: hasActiveItem,
                activeBuff: this.windChantTimer > 0 || this.frozenTimer > 0 || this.computedStats.activeKind === 'conceal' && this.stealthTimer > 0,
                elementColor: '#facc15',
                targeting: 'self'
            },
            equippedEmotes: (0, _arenaRoster.normalizeEquippedEmotes)(_storage.playerState.mobaEquippedEmotes, _storage.playerState.mobaOwnedEmotes).map(function(emoteId, idx) {
                var em = (0, _arenaRoster.getMobaEmoteById)(emoteId);
                return {
                    slot: idx,
                    id: em.id,
                    name: em.name,
                    callout: em.callout,
                    icon: em.icon,
                    colorHex: em.colorHex
                };
            }),
            emoteCd: Number(this.cdEmote.toFixed(1)),
            emoteMaxCd: this.maxCdEmote
        };
        (0, _runtimeBridge.updateMobaHud)(snap);
    };
    _proto.triggerEmote = function triggerEmote(slotIndex) {
        if (this.gameOver || this.isPaused || this.cdEmote > 0) return false;
        var equipped = (0, _arenaRoster.normalizeEquippedEmotes)(_storage.playerState.mobaEquippedEmotes, _storage.playerState.mobaOwnedEmotes);
        var clampedSlot = Math.max(0, Math.min(3, Math.floor(slotIndex)));
        var emote = (0, _arenaRoster.getMobaEmoteById)(equipped[clampedSlot]);
        this.playerEmoteId = emote.id;
        this.playerEmoteTimer = this.playerEmoteMax;
        this.cdEmote = this.maxCdEmote;
        _audio.ArcadeAudio.play(emote.sfx);
        this.spawnEmoteBurst3D(this.px, this.py, this.pz, emote.colorNum);
        this.pushMobaHudSnapshot();
        return true;
    };
    _proto.spawnEmoteBurst3D = function spawnEmoteBurst3D(x, y, z, colorNum) {
        var group = new _three.Group();
        group.position.set(x, y + 0.15, z);
        var ringGeo = new _three.RingGeometry(1.05, 1.45, 28);
        var ringMat = new _three.MeshBasicMaterial({
            color: colorNum,
            transparent: true,
            opacity: 0.9,
            side: _three.DoubleSide,
            depthWrite: false
        });
        var ring = new _three.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.12;
        ring.userData.isEmoteRing = true;
        group.add(ring);
        var sparkleGeo = new _three.OctahedronGeometry(0.24, 0);
        for(var i = 0; i < 6; i++){
            var ang = Math.PI * 2 * i / 6;
            var mat = new _three.MeshBasicMaterial({
                color: i % 2 === 0 ? colorNum : 0xffffff,
                transparent: true,
                opacity: 0.95,
                depthWrite: false
            });
            var sp = new _three.Mesh(sparkleGeo, mat);
            var rad = 1.15;
            sp.position.set(Math.cos(ang) * rad, 0.7 + i % 2 * 0.4, Math.sin(ang) * rad);
            sp.userData.isEmoteSparkle = true;
            sp.userData.angle = ang;
            sp.userData.riseSpeed = 2.6 + i % 3 * 0.55;
            group.add(sp);
        }
        this.three.scene.add(group);
        this.fxObjs.push({
            mesh: group,
            life: 0.9,
            maxLife: 0.9,
            mode: 'emote_burst'
        });
    };
    _proto.triggerActorAiEmote = function triggerActorAiEmote(a, context) {
        var _a_emoteAiCd;
        if (!a.alive || a.kind !== 'hero') return;
        if (((_a_emoteAiCd = a.emoteAiCd) != null ? _a_emoteAiCd : 0) > 0) return;
        // Cap simultaneous AI hero emote bubbles at 2 so the battlefield stays clean
        var activeAiBubbles = 0;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.actors), _step; !(_step = _iterator()).done;){
            var other = _step.value;
            if (other.alive && other.activeEmoteTimer && other.activeEmoteTimer > 0) {
                activeAiBubbles++;
            }
        }
        if (activeAiBubbles >= 2) return;
        var seed = Math.floor(this.matchElapsed * 10) + a.id * 7;
        var emote = (0, _arenaRoster.pickContextualAiEmote)(context, seed);
        a.activeEmoteId = emote.id;
        a.activeEmoteTimer = 2.5;
        a.activeEmoteMax = 2.5;
        a.emoteAiCd = 15 + a.id % 8;
        if (Math.hypot(a.x - this.px, a.z - this.pz) <= 44) {
            this.spawnEmoteBurst3D(a.x, a.mesh.position.y, a.z, emote.colorNum);
        }
    };
    _proto.setHeroBushTranslucency = function setHeroBushTranslucency(stealth) {
        var _this = this;
        if (this.bushStealthApplied === stealth) return;
        this.bushStealthApplied = stealth;
        this.playerMesh.traverse(function(obj) {
            if (obj === _this.shieldDomeMesh || obj === _this.ccImmuneAuraMesh || obj === _this.frozenCrystalMesh || obj === _this.blueBuffAuraMesh || obj === _this.redBuffAuraMesh) {
                return;
            }
            var m = obj;
            if (!m.isMesh) return;
            var mats = Array.isArray(m.material) ? m.material : m.material ? [
                m.material
            ] : [];
            for(var _iterator = _create_for_of_iterator_helper_loose(mats), _step; !(_step = _iterator()).done;){
                var mat = _step.value;
                if ('opacity' in mat && 'transparent' in mat) {
                    var std = mat;
                    if (!std.userData._origOpacitySaved) {
                        std.userData._origOpacity = std.opacity;
                        std.userData._origTransparent = std.transparent;
                        std.userData._origOpacitySaved = true;
                    }
                    if (stealth) {
                        var _std_userData__origOpacity;
                        std.transparent = true;
                        std.opacity = Math.min(0.45, (_std_userData__origOpacity = std.userData._origOpacity) != null ? _std_userData__origOpacity : 1);
                    } else {
                        var _std_userData__origOpacity1;
                        std.transparent = Boolean(std.userData._origTransparent);
                        std.opacity = (_std_userData__origOpacity1 = std.userData._origOpacity) != null ? _std_userData__origOpacity1 : 1;
                    }
                    std.needsUpdate = true;
                }
            }
        });
    };
    _proto.updateSimulation = function updateSimulation(dt) {
        var _this, _loop = function(i6) {
            var fx = _this.fxObjs[i6];
            fx.life -= dt;
            if (fx.mode === 'elemental' && fx.elemAnim) {
                var progress = 1 - Math.max(0, fx.life) / Math.max(0.05, fx.maxLife);
                (0, _mobaElementalVfx.animateElementalVfx)(fx.mesh, fx.elemAnim, progress, dt);
            } else if (fx.mode === 'ring') {
                fx.mesh.scale.addScalar(dt * 2.2);
            } else if (fx.mode === 'pillar') {
                fx.mesh.scale.x += dt * 1.4;
                fx.mesh.scale.z += dt * 1.4;
            } else if (fx.mode === 'dome') {
                fx.mesh.rotation.y += dt * 3.0;
                fx.mesh.scale.addScalar(dt * 0.8);
            } else if (fx.mode === 'emote_burst') {
                var ratio = Math.max(0, fx.life / Math.max(0.05, fx.maxLife));
                fx.mesh.children.forEach(function(child) {
                    var m = child;
                    if (m.userData.isEmoteRing) {
                        m.scale.addScalar(dt * 2.4);
                        if (m.material && 'opacity' in m.material) {
                            m.material.opacity = ratio * 0.85;
                        }
                    } else if (m.userData.isEmoteSparkle) {
                        var _m_userData_angle, _m_userData_riseSpeed;
                        var ang = (_m_userData_angle = m.userData.angle) != null ? _m_userData_angle : 0;
                        var rise = (_m_userData_riseSpeed = m.userData.riseSpeed) != null ? _m_userData_riseSpeed : 2.8;
                        m.position.y += dt * rise;
                        m.position.x += Math.cos(ang) * dt * 1.1;
                        m.position.z += Math.sin(ang) * dt * 1.1;
                        m.rotation.y += dt * 5.2;
                        m.rotation.x += dt * 3.4;
                        m.scale.setScalar(Math.max(0.25, ratio * 1.1));
                        if (m.material && 'opacity' in m.material) {
                            m.material.opacity = ratio;
                        }
                    }
                });
            } else if (fx.mode === 'ghost') {
                var ratio1 = Math.max(0, fx.life / Math.max(0.05, fx.maxLife));
                fx.mesh.traverse(function(obj) {
                    var m = obj;
                    if (m.isMesh && m.material && 'opacity' in m.material) {
                        m.material.opacity = ratio1 * 0.45;
                    }
                });
            }
            if (fx.life <= 0) {
                (0, _LegendsArena3DWorld.disposeObjectTree)(fx.mesh);
                _this.three.scene.remove(fx.mesh);
                _this.fxObjs.splice(i6, 1);
            }
        };
        var _this1 = this;
        var _this_blessingId;
        this.matchElapsed += dt;
        this.outOfCombatSec += dt;
        // Passive Match Gold Trickle (+8 Gold/s, +14 Gold/s in Brawl/Overdrive)
        this.gold += (this.mobaMode === 'brawl' || this.mobaMode === 'overdrive' ? 14 : 8) * dt;
        if (this.killfeedTimer > 0) this.killfeedTimer = Math.max(0, this.killfeedTimer - dt);
        this.basicCd = Math.max(0, this.basicCd - dt);
        this.cdSkill1 = Math.max(0, this.cdSkill1 - dt);
        this.cdSkill2 = Math.max(0, this.cdSkill2 - dt);
        this.cdSkill3 = Math.max(0, this.cdSkill3 - dt);
        this.cdSkill4 = Math.max(0, this.cdSkill4 - dt);
        this.cdSpell = Math.max(0, this.cdSpell - dt);
        this.cdRegen = Math.max(0, this.cdRegen - dt);
        this.cdEmote = Math.max(0, this.cdEmote - dt);
        if (this.playerEmoteTimer > 0) {
            this.playerEmoteTimer = Math.max(0, this.playerEmoteTimer - dt);
            if (this.playerEmoteTimer <= 0) this.playerEmoteId = null;
        }
        this.cdItemActive = Math.max(0, this.cdItemActive - dt);
        this.shieldTimer = Math.max(0, this.shieldTimer - dt);
        this.inspireTimer = Math.max(0, this.inspireTimer - dt);
        this.hasteTimer = Math.max(0, this.hasteTimer - dt);
        this.stealthTimer = Math.max(0, this.stealthTimer - dt);
        this.giantTimer = Math.max(0, this.giantTimer - dt);
        this.windChantTimer = Math.max(0, this.windChantTimer - dt);
        this.frozenTimer = Math.max(0, this.frozenTimer - dt);
        this.reviveCheatCd = Math.max(0, this.reviveCheatCd - dt);
        this.immortalityCd = Math.max(0, this.immortalityCd - dt);
        this.lifelineCd = Math.max(0, this.lifelineCd - dt);
        // New Combat / Animation / Talent Timers
        this.bushRevealTimer = Math.max(0, this.bushRevealTimer - dt);
        this.ccImmuneTimer = Math.max(0, this.ccImmuneTimer - dt);
        this.slowImmuneTimer = Math.max(0, this.slowImmuneTimer - dt);
        this.sprintBoostTimer = Math.max(0, this.sprintBoostTimer - dt);
        this.vengeanceTimer = Math.max(0, this.vengeanceTimer - dt);
        this.untargetableTimer = Math.max(0, this.untargetableTimer - dt);
        this.castAnimTimer = Math.max(0, this.castAnimTimer - dt);
        this.cameraShake = Math.max(0, this.cameraShake - dt * 1.9);
        this.braveSmiteCd = Math.max(0, this.braveSmiteCd - dt);
        this.weaknessFinderCd = Math.max(0, this.weaknessFinderCd - dt);
        this.lethalIgnitionCd = Math.max(0, this.lethalIgnitionCd - dt);
        if (this.lethalIgnitionWindow > 0) {
            this.lethalIgnitionWindow = Math.max(0, this.lethalIgnitionWindow - dt);
            if (this.lethalIgnitionWindow <= 0) this.lethalIgnitionHits = 0;
        }
        if (this.telegraphAutoTimer > 0 && !this.activeSkillAim) {
            this.telegraphAutoTimer = Math.max(0, this.telegraphAutoTimer - dt);
            if (this.telegraphAutoTimer <= 0 && this.telegraphSlot !== null) {
                this.telegraphSlot = null;
                this.telegraphGroup.visible = false;
                if (this.telegraphRangeGroup) this.telegraphRangeGroup.visible = false;
            }
        }
        var prevBlue = this.blueBuffTimer > 0;
        var prevRed = this.redBuffTimer > 0;
        this.blueBuffTimer = Math.max(0, this.blueBuffTimer - dt);
        this.redBuffTimer = Math.max(0, this.redBuffTimer - dt);
        if (prevBlue && this.blueBuffTimer <= 0 || prevRed && this.redBuffTimer <= 0) {
            this.recomputeStats();
        }
        var clock = (0, _arenaRoster.evaluateBattlefieldClock)(this.matchElapsed);
        // Exact MLBB Match Timeline Announcements & State Transitions (0:10, 2:00, 5:00, 8:00, 12:00, 18:00)
        if (clock.outerTurretShieldActive === false && !this.announcedMilestones.has('5m')) {
            this.announcedMilestones.add('5m');
            for(var _iterator = _create_for_of_iterator_helper_loose(this.turrets), _step; !(_step = _iterator()).done;){
                var t = _step.value;
                if (t.shieldMesh) t.shieldMesh.visible = false;
            }
            for(var _iterator1 = _create_for_of_iterator_helper_loose(this.laneMarkerMeshes), _step1; !(_step1 = _iterator1()).done;){
                var m = _step1.value;
                m.visible = false;
            }
            this.showKillfeed('🛡️ 05:00 — Outer Turret Energy Shields & Lane Cannon Bonuses Expired!');
        }
        if (clock.largeGoldCrabsActive && !this.announcedMilestones.has('2m_crabs')) {
            this.announcedMilestones.add('2m_crabs');
            for(var _iterator2 = _create_for_of_iterator_helper_loose(this.jungleCamps), _step2; !(_step2 = _iterator2()).done;){
                var jc = _step2.value;
                if (jc.campKind === 'crab' && !jc.upgraded) {
                    jc.upgraded = true;
                    jc.label = 'Large Gold Crab';
                    jc.maxHp = 210;
                    jc.hp = jc.alive ? Math.max(jc.hp, 210) : 210;
                    jc.goldReward = 115;
                    jc.respawnDelay = _arenaRoster.MLBB_TIMERS.LARGE_CRAB_RESPAWN_SEC;
                    jc.mesh.scale.setScalar(1.32);
                }
            }
        }
        if (clock.minionSpeedBoostActive && !this.announcedMilestones.has('12m')) {
            this.announcedMilestones.add('12m');
            this.showKillfeed('⚡ 12:00 — Enhanced Lord (Stage 2) Awakens & Minion Waves Gain Speed Boost!');
        }
        if (clock.lateGameEscalationActive && !this.announcedMilestones.has('18m')) {
            this.announcedMilestones.add('18m');
            this.showKillfeed('🔥 18:00 — Evolved Lord (Stage 3) & Late-Game Homeguard Surge Active!');
        }
        // Update Minimap Pings TTL & Tactical Ping Banner
        if (this.tacticalPingTimer > 0) this.tacticalPingTimer = Math.max(0, this.tacticalPingTimer - dt);
        for(var i = this.minimapPings.length - 1; i >= 0; i--){
            this.minimapPings[i].ttl -= dt;
            if (this.minimapPings[i].ttl <= 0) this.minimapPings.splice(i, 1);
        }
        // Active Battlefield Buff Timers (Turtle's Blessing, Crab Gold/EXP Aura, Walkie Grass, Homeguard, Flying Cloud CD, Roam Gold)
        this.flyingCloudCd = Math.max(0, this.flyingCloudCd - dt);
        this.fountainLaserCd = Math.max(0, this.fountainLaserCd - dt);
        this.homeguardTimer = Math.max(0, this.homeguardTimer - dt);
        this.walkieGrassTimer = Math.max(0, this.walkieGrassTimer - dt);
        if (this.turtleBlessingTimer > 0) {
            this.turtleBlessingTimer = Math.max(0, this.turtleBlessingTimer - dt);
            if (this.activeMapVariant.id === 'healing_turtle') {
                this.turtleHealAcc += dt;
                if (this.turtleHealAcc >= 2.0) {
                    this.turtleHealAcc -= 2.0;
                    var heal = Math.max(8, Math.round(this.maxLives * 0.05));
                    this.lives = Math.min(this.maxLives, this.lives + heal);
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                    this.spawnDamageNumber(this.px, this.pz, heal, 'heal');
                }
            }
        }
        if (this.crabAuraTimer > 0) {
            this.crabAuraTimer = Math.max(0, this.crabAuraTimer - dt);
            this.crabAuraAcc += dt;
            if (this.crabAuraAcc >= 2.0) {
                this.crabAuraAcc -= 2.0;
                this.gold += 14;
                this.grantHeroXp(16);
            }
        }
        if (((_this_blessingId = this.blessingId) == null ? void 0 : _this_blessingId.startsWith('roam_')) && this.roamGold < 600) {
            this.roamGoldAcc += dt;
            if (this.roamGoldAcc >= 1.5) {
                this.roamGoldAcc -= 1.5;
                var prev = this.roamGold;
                this.roamGold = Math.min(600, this.roamGold + 18);
                this.gold += 12;
                if (prev < 600 && this.roamGold >= 600) {
                    this.showKillfeed('🛡️ ROAM BLESSING EVOLVED (600/600 GOLD)! Full Support Aura Unlocked!');
                }
            }
        }
        // 4 Cyclone Eyes (Directional Wind Dash on step)
        for(var _iterator3 = _create_for_of_iterator_helper_loose(this.cycloneEyes), _step3; !(_step3 = _iterator3()).done;){
            var ce = _step3.value;
            ce.cd = Math.max(0, ce.cd - dt);
            ce.mesh.rotation.y += dt * (ce.cd <= 0 ? 4.2 : 0.7);
            ce.mesh.visible = true;
            var ready = ce.cd <= 0;
            ce.mesh.scale.setScalar(ready ? 1.0 : 0.55);
            if (ready && !this.activeMotion && Math.hypot(this.px - ce.x, this.pz - ce.z) <= 3.2) {
                ce.cd = _arenaRoster.MLBB_TIMERS.CYCLONE_EYE_COOLDOWN_SEC;
                this.startPlayerMotion('dash', 16.5, 0.34, 0.65);
                this.hasteTimer = Math.max(this.hasteTimer, 1.4);
                _audio.ArcadeAudio.play('dash');
                this.spawnVfx('ring', ce.x, ce.z, 5.2, 0x38bdf8);
                this.showKillfeed('🌀 CYCLONE EYE! Wind Surge Dash!');
            }
        }
        // Flying Cloud Interactive Launch Pad
        if (this.flyingCloudMesh) {
            this.flyingCloudMesh.position.y = Math.sin(this.matchElapsed * 2.5) * 0.25;
            this.flyingCloudMesh.scale.setScalar(this.flyingCloudCd <= 0 ? 1.0 : 0.6);
            if (this.flyingCloudCd <= 0 && !this.activeMotion && Math.hypot(this.px - _arenaRoster.FLYING_CLOUD_BLUE_SPOT[0], this.pz - _arenaRoster.FLYING_CLOUD_BLUE_SPOT[1]) <= 3.6) {
                this.activateFlyingCloud();
            }
        }
        // River Wards: Walkie Grass follower, Stone Roamer & Revealing Wisps patrol
        for(var i1 = this.riverWards.length - 1; i1 >= 0; i1--){
            var rw = this.riverWards[i1];
            rw.life -= dt;
            rw.angle += dt * 1.4;
            if (rw.kind === 'walkie') {
                rw.x = this.px + Math.cos(rw.angle * 1.6) * 2.1;
                rw.z = this.pz + Math.sin(rw.angle * 1.6) * 2.1;
                rw.mesh.position.set(rw.x, Math.sin(rw.angle * 3) * 0.2, rw.z);
                if (Math.random() < dt * 1.5 && this.lives < this.maxLives) {
                    this.lives = Math.min(this.maxLives, this.lives + 4);
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                }
            } else {
                var patrolRad = rw.kind === 'wisp' ? 14 : 11;
                rw.x = rw.homeX + Math.cos(rw.angle * 0.55) * patrolRad;
                rw.z = rw.homeZ + Math.sin(rw.angle * 0.55) * patrolRad;
                rw.mesh.position.set(rw.x, 0, rw.z);
                rw.mesh.rotation.y += dt * 2.2;
            }
            if (rw.life <= 0) {
                (0, _LegendsArena3DWorld.disposeObjectTree)(rw.mesh);
                this.three.scene.remove(rw.mesh);
                this.riverWards.splice(i1, 1);
            }
        }
        // 3D Pit Hologram Countdown Ring Animation
        if (this.pitHologramGroup && this.pitHologramRing) {
            var bossCamp = this.jungleCamps.find(function(c) {
                return c.id === 'river_boss';
            });
            var showHolo = Boolean(bossCamp && !bossCamp.alive);
            this.pitHologramGroup.visible = showHolo;
            if (showHolo && bossCamp) {
                this.pitHologramGroup.rotation.y += dt * 1.8;
                var maxWait = Math.max(1, bossCamp.respawnDelay);
                var prog = Math.max(0.15, Math.min(1, 1 - bossCamp.respawnTimer / maxWait));
                this.pitHologramRing.scale.setScalar(prog * 1.45);
            }
        }
        // Blue Fountain Healing + Homeguard & Red Fountain Instant-Kill Laser
        var atFountain = Math.hypot(this.px - _LegendsArena3DWorld.BLUE_BASE_X, this.pz - _LegendsArena3DWorld.BLUE_BASE_Z) < 12;
        if (atFountain) {
            this.lives = Math.min(this.maxLives, this.lives + Math.max(1, Math.round(this.maxLives * 0.3 * dt)));
            this.homeguardTimer = Math.max(this.homeguardTimer, clock.lateGameEscalationActive ? 6.0 : 4.5);
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        }
        var atRedFountain = Math.hypot(this.px - _LegendsArena3DWorld.RED_BASE_X, this.pz - _LegendsArena3DWorld.RED_BASE_Z) < 12.5;
        if (atRedFountain && this.fountainLaserCd <= 0) {
            this.fountainLaserCd = 0.55;
            this.spawnVfx('lightning', this.px, this.pz, 6.0, 0xf43f5e);
            this.showKillfeed('⚡ ENEMY FOUNTAIN LASER! Instant High-True-Damage Defense!');
            this.applyPlayerDamage(Math.round(this.maxLives * 0.55));
        }
        if (this.regenHoTTimer > 0) {
            this.regenHoTTimer = Math.max(0, this.regenHoTTimer - dt);
            this.lives = Math.min(this.maxLives, this.lives + Math.max(1, Math.round(this.maxLives * 0.1 * dt)));
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        }
        if (this.computedStats.hpRegenPerSec > 0 && this.lives < this.maxLives && Math.random() < dt * 2.5) {
            this.lives = Math.min(this.maxLives, this.lives + Math.max(1, Math.round(this.computedStats.hpRegenPerSec * 0.45)));
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        }
        // Revitalize Healing Springs (5s team HoT)
        for(var i2 = this.healingSprings.length - 1; i2 >= 0; i2--){
            var sp = this.healingSprings[i2];
            sp.life -= dt;
            sp.tickAcc += dt;
            sp.mesh.rotation.y += dt * 1.4;
            if (sp.tickAcc >= 0.5) {
                sp.tickAcc -= 0.5;
                if (Math.hypot(this.px - sp.x, this.pz - sp.z) <= 6.2) {
                    var heal1 = Math.max(6, Math.round(this.maxLives * 0.045));
                    this.lives = Math.min(this.maxLives, this.lives + heal1);
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                    this.spawnDamageNumber(this.px, this.pz, heal1, 'heal');
                }
                for(var _iterator4 = _create_for_of_iterator_helper_loose(this.actors), _step4; !(_step4 = _iterator4()).done;){
                    var a = _step4.value;
                    if (a.alive && a.team === 'blue' && Math.hypot(a.x - sp.x, a.z - sp.z) <= 6.2) {
                        a.hp = Math.min(a.maxHp, a.hp + Math.round(a.maxHp * 0.05));
                    }
                }
            }
            if (sp.life <= 0) {
                (0, _LegendsArena3DWorld.disposeObjectTree)(sp.mesh);
                this.three.scene.remove(sp.mesh);
                this.healingSprings.splice(i2, 1);
            }
        }
        // Cursed Helmet (Burning Soul: AoE Magic Damage around hero)
        if (this.computedStats.hasBurningSoul && Math.random() < dt * 2) {
            var burnDmg = Math.max(4, Math.round(this.maxLives * 0.02));
            for(var _iterator5 = _create_for_of_iterator_helper_loose(this.actors), _step5; !(_step5 = _iterator5()).done;){
                var a1 = _step5.value;
                if (a1.alive && a1.team === 'red' && Math.hypot(a1.x - this.px, a1.z - this.pz) < 6.0) {
                    this.damageEnemyActor(a1, burnDmg, true, 'magic');
                }
            }
            for(var _iterator6 = _create_for_of_iterator_helper_loose(this.jungleCamps), _step6; !(_step6 = _iterator6()).done;){
                var jc1 = _step6.value;
                if (jc1.alive && Math.hypot(jc1.x - this.px, jc1.z - this.pz) < 6.0) {
                    this.damageJungleCamp(jc1, burnDmg);
                }
            }
        }
        // Ambush Bush detection + 3D Stealth Translucency Shader (opacity 0.45 when hidden)
        this.inBush = _LegendsArena3DWorld.AMBUSH_BUSHES.some(function(param) {
            var bx = param[0], bz = param[1], br = param[2];
            return Math.hypot(_this1.px - bx, _this1.pz - bz) < br;
        });
        var isBushStealthed = this.inBush && this.bushRevealTimer <= 0;
        this.setHeroBushTranslucency(isBushStealthed || this.stealthTimer > 0);
        if (this.inBush && this.combatKit.passiveKind === 'bush_regen_stealth') {
            this.lives = Math.min(this.maxLives, this.lives + Math.max(1, Math.round(this.maxLives * 0.08 * dt)));
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        }
        // Cancelable 3D Recall Channel Circle
        this.recallCircleGroup.visible = this.recallTimer > 0;
        if (this.recallTimer > 0) {
            this.recallCircleGroup.position.set(this.px, 0, this.pz);
            this.recallCircleGroup.rotation.y += dt * 3.8;
            this.recallTimer -= dt;
            if (this.recallTimer <= 0) {
                this.recallCircleGroup.visible = false;
                this.px = _LegendsArena3DWorld.BLUE_BASE_X + 4;
                this.py = 0;
                this.pz = _LegendsArena3DWorld.BLUE_BASE_Z - 4;
                this.lives = this.maxLives;
                _audio.ArcadeAudio.play('levelup');
                (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                this.spawnVfx('portal_warp', this.px, this.pz, 5.0, 0x38bdf8);
                this.showKillfeed('🌀 RECALLED TO FOUNTAIN! FULL HP RESTORED!');
            }
        }
        // Active Movement Physics (Linear Dash / Parabolic Z-Y Leap / Snap-back + Ghost Afterimages)
        var isMoving = false;
        var drivingCar = this.activeUltSetpieces.find(function(s) {
            return s.kind === 'johnson_car';
        });
        if (this.activeMotion) {
            var m1 = this.activeMotion;
            m1.elapsed += dt;
            m1.ghostAcc += dt;
            var t1 = Math.min(1, m1.elapsed / Math.max(0.05, m1.duration));
            if (m1.kind === 'snap_back') {
                var tri = t1 < 0.5 ? t1 * 2 : (1 - t1) * 2;
                this.px = m1.startX + (m1.endX - m1.startX) * tri;
                this.pz = m1.startZ + (m1.endZ - m1.startZ) * tri;
                this.py = 4 * m1.peakY * t1 * (1 - t1);
            } else {
                this.px = m1.startX + (m1.endX - m1.startX) * t1;
                this.pz = m1.startZ + (m1.endZ - m1.startZ) * t1;
                this.py = m1.peakY > 0 ? 4 * m1.peakY * t1 * (1 - t1) : 0;
            }
            if (m1.ghostAcc >= 0.065) {
                m1.ghostAcc = 0;
                this.spawnAfterimageGhost(this.px, this.py, this.pz, this.pYaw, this.heroBladeColor);
            }
            isMoving = true;
            if (t1 >= 1) {
                this.py = 0;
                this.activeMotion = null;
            }
        } else if (this.frozenTimer <= 0) {
            var vx = this.moveX;
            var vz = this.moveZ;
            if (vx === 0 && vz === 0 && this.tapTarget) {
                var dx = this.tapTarget.x - this.px;
                var dz = this.tapTarget.z - this.pz;
                var d = Math.hypot(dx, dz);
                if (d > 0.7) {
                    vx = dx / d;
                    vz = dz / d;
                } else {
                    this.tapTarget = null;
                }
            }
            // Johnson Full Throttle auto-drives forward and steers with joystick
            if (drivingCar) {
                if (vx !== 0 || vz !== 0) {
                    var desiredYaw = Math.atan2(vx, vz);
                    var diff = desiredYaw - this.pYaw;
                    while(diff > Math.PI)diff -= Math.PI * 2;
                    while(diff < -Math.PI)diff += Math.PI * 2;
                    this.pYaw += Math.max(-2.6 * dt, Math.min(2.6 * dt, diff));
                }
                vx = Math.sin(this.pYaw);
                vz = Math.cos(this.pYaw);
            }
            // Compute MLBB Movement Speed (with River Speed Current + Soft-Caps at 415 and 490)
            var inRiver = Math.abs(this.px - this.pz) < 18 && Math.abs(this.px) < 95;
            var riverBonus = inRiver ? 45 : 0;
            var rapidBootsBonus = this.equippedItemIds.includes('rapid_boots') && this.outOfCombatSec >= 5 ? 40 : 0;
            var homeguardBonus = this.homeguardTimer > 0 ? clock.lateGameEscalationActive ? 0.55 : 0.35 : 0;
            var hastePct = (this.sprintBoostTimer > 0 ? 0.5 : 0) + (this.hasteTimer > 0 ? 0.28 : 0) + (this.stealthTimer > 0 ? 0.2 : 0) + homeguardBonus + (drivingCar ? 0.65 : 0);
            var rawMlbbSpd = (this.moveSpd * 21.5 + riverBonus + rapidBootsBonus) * (1 + hastePct);
            this.effectiveMlbbSpeed = (0, _LegendsArena3DWorld.applyMobaSpeedSoftCap)(rawMlbbSpd);
            this.isSprinting = this.effectiveMlbbSpeed >= 360;
            if (vx !== 0 || vz !== 0) {
                isMoving = true;
                this.recallTimer = 0;
                // Backswing cancel when player issues movement input
                if (this.castAnimTimer > 0 && this.castAnimTimer < 0.14) {
                    this.castAnimTimer = 0;
                }
                var len = Math.hypot(vx, vz) || 1;
                var mag = Math.min(1, len);
                var worldSpd = this.effectiveMlbbSpeed / 21.5 * mag * dt;
                this.px = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.px + vx / len * worldSpd));
                this.pz = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, this.pz + vz / len * worldSpd));
                if (!drivingCar) {
                    this.pYaw = Math.atan2(vx, vz);
                }
            }
        }
        // Update Hero 3D Transform, Sprint Posture (>360 speed), Cast Wind-up, and Idle/Special Idle
        if (isMoving) {
            this.idleTimer = 0;
            this.walkPhase += dt * (this.isSprinting ? 14 : 9.5);
        } else {
            this.idleTimer += dt;
        }
        var baseScale = this.giantTimer > 0 ? 1.65 : 1.24;
        var bobY = this.py > 0 ? 0 : isMoving ? Math.abs(Math.sin(this.walkPhase)) * (this.isSprinting ? 0.26 : 0.14) : Math.sin(this.idleTimer * 2.4) * 0.05;
        this.playerMesh.visible = !drivingCar && this.untargetableTimer <= 0;
        this.playerMesh.position.set(this.px, this.py + bobY, this.pz);
        // Special Idle flourish after 3.2s standing still
        var specialIdleSpin = !isMoving && this.idleTimer > 3.2 && this.idleTimer % 4.5 < 0.7 ? Math.sin(this.idleTimer % 4.5 / 0.7 * Math.PI * 2) * 0.35 : 0;
        this.playerMesh.rotation.y = this.pYaw + specialIdleSpin;
        // Forward Sprint Lean (>360 speed) vs Cast Wind-up
        var targetPitch = this.castAnimTimer > 0.12 ? -0.18 : isMoving && this.isSprinting ? 0.24 : isMoving ? 0.08 : 0;
        this.playerMesh.rotation.x += (targetPitch - this.playerMesh.rotation.x) * Math.min(1, dt * 14);
        var breathScale = !isMoving ? 1 + Math.sin(this.idleTimer * 2.8) * 0.025 : 1;
        this.playerMesh.scale.set(baseScale, baseScale * breathScale, baseScale);
        // 3D Shield Dome, CC Immunity Golden Halo, Winter Crown Frozen Crystal, and Blue/Orange Buff Rings
        this.shieldDomeMesh.visible = this.shieldTimer > 0 || this.windChantTimer > 0 || this.vengeanceTimer > 0;
        if (this.shieldDomeMesh.visible) {
            this.shieldDomeMesh.rotation.y += dt * 2.2;
        }
        this.ccImmuneAuraMesh.visible = this.ccImmuneTimer > 0;
        if (this.ccImmuneAuraMesh.visible) {
            this.ccImmuneAuraMesh.rotation.z += dt * 4.5;
        }
        this.frozenCrystalMesh.visible = this.frozenTimer > 0;
        if (this.frozenCrystalMesh.visible) {
            this.frozenCrystalMesh.rotation.y += dt * 3.5;
        }
        this.blueBuffAuraMesh.visible = this.blueBuffTimer > 0;
        if (this.blueBuffAuraMesh.visible) {
            this.blueBuffAuraMesh.rotation.y += dt * 2.6;
        }
        this.redBuffAuraMesh.visible = this.redBuffTimer > 0;
        if (this.redBuffAuraMesh.visible) {
            this.redBuffAuraMesh.rotation.y -= dt * 2.6;
        }
        // Update 5 Signature 3D Ultimate Setpieces
        for(var i3 = this.activeUltSetpieces.length - 1; i3 >= 0; i3--){
            var sp1 = this.activeUltSetpieces[i3];
            sp1.life -= dt;
            sp1.tickAcc += dt;
            if (sp1.kind === 'tigreal_implosion') {
                sp1.group.position.set(this.px, 0, this.pz);
                sp1.group.rotation.y += dt * 3.2;
                if (sp1.tetherTargets) {
                    for(var _iterator7 = _create_for_of_iterator_helper_loose(sp1.tetherTargets), _step7; !(_step7 = _iterator7()).done;){
                        var a2 = _step7.value;
                        if (!a2.alive) continue;
                        a2.x += (this.px - a2.x) * Math.min(1, dt * 4.2);
                        a2.z += (this.pz - a2.z) * Math.min(1, dt * 4.2);
                        a2.mesh.position.set(a2.x, 0, a2.z);
                    }
                }
                if (sp1.life <= 0.15 && !sp1.detonated) {
                    sp1.detonated = true;
                    this.cameraShake = Math.max(this.cameraShake, 0.55);
                    _audio.ArcadeAudio.play('explosion');
                    this.spawnVfx('ring', this.px, this.pz, 10.5, 0xfacc15);
                    for(var _iterator8 = _create_for_of_iterator_helper_loose(this.actors), _step8; !(_step8 = _iterator8()).done;){
                        var a3 = _step8.value;
                        if (a3.alive && a3.team === 'red' && Math.hypot(a3.x - this.px, a3.z - this.pz) <= 10.2) {
                            a3.stunTimer = Math.max(a3.stunTimer, 1.5);
                            this.damageEnemyActor(a3, sp1.baseDmg, true, 'phys');
                        }
                    }
                }
            } else if (sp1.kind === 'lancelot_thorned_rose') {
                sp1.group.rotation.y += dt * 0.8;
                if (sp1.life <= 0.12 && !sp1.detonated) {
                    sp1.detonated = true;
                    this.cameraShake = Math.max(this.cameraShake, 0.42);
                    _audio.ArcadeAudio.play('combo');
                    this.spawnVfx('ring', sp1.cx, sp1.cz, 7.6, 0xf472b6);
                    for(var _iterator9 = _create_for_of_iterator_helper_loose(this.actors), _step9; !(_step9 = _iterator9()).done;){
                        var a4 = _step9.value;
                        if (a4.alive && a4.team === 'red' && Math.hypot(a4.x - sp1.cx, a4.z - sp1.cz) <= 7.8) {
                            a4.slowTimer = Math.max(a4.slowTimer, 1.5);
                            this.damageEnemyActor(a4, sp1.baseDmg, true, 'phys');
                        }
                    }
                }
            } else if (sp1.kind === 'johnson_car') {
                sp1.group.position.set(this.px, 0, this.pz);
                sp1.group.rotation.y = this.pYaw;
                // Detect crash against enemy hero or turret
                var crashed = false;
                for(var _iterator10 = _create_for_of_iterator_helper_loose(this.actors), _step10; !(_step10 = _iterator10()).done;){
                    var a5 = _step10.value;
                    if (a5.alive && a5.team === 'red' && a5.kind === 'hero' && Math.hypot(a5.x - this.px, a5.z - this.pz) < 3.4) {
                        crashed = true;
                        break;
                    }
                }
                if (!crashed) {
                    for(var _iterator11 = _create_for_of_iterator_helper_loose(this.turrets), _step11; !(_step11 = _iterator11()).done;){
                        var t2 = _step11.value;
                        if (t2.alive && t2.team === 'red' && Math.hypot(t2.x - this.px, t2.z - this.pz) < 4.2) {
                            crashed = true;
                            break;
                        }
                    }
                }
                if (crashed || sp1.life <= 0.05) {
                    this.detonateJohnsonCrash(sp1);
                    sp1.life = 0;
                }
            } else if (sp1.kind === 'yve_chessboard') {
                if (sp1.tickAcc >= 0.42) {
                    sp1.tickAcc -= 0.42;
                    var rx = sp1.cx + (Math.random() - 0.5) * 11;
                    var rz = sp1.cz + (Math.random() - 0.5) * 11;
                    this.spawnVfx('meteor', rx, rz, 3.5, 0xa855f7);
                    for(var _iterator12 = _create_for_of_iterator_helper_loose(this.actors), _step12; !(_step12 = _iterator12()).done;){
                        var a6 = _step12.value;
                        if (a6.alive && a6.team === 'red' && Math.abs(a6.x - sp1.cx) <= 7.4 && Math.abs(a6.z - sp1.cz) <= 7.4) {
                            a6.slowTimer = Math.max(a6.slowTimer, 1.0);
                            this.damageEnemyActor(a6, sp1.baseDmg, true, 'magic');
                        }
                    }
                }
            } else if (sp1.kind === 'kagura_overturn') {
                sp1.group.rotation.y += dt * 5.2;
                if (sp1.life <= 0.12 && !sp1.detonated) {
                    sp1.detonated = true;
                    this.cameraShake = Math.max(this.cameraShake, 0.48);
                    _audio.ArcadeAudio.play('explosion');
                    this.spawnVfx('ring', sp1.cx, sp1.cz, 9.2, 0xc084fc);
                    var targets = sp1.tetherTargets && sp1.tetherTargets.length > 0 ? sp1.tetherTargets : this.actors;
                    for(var _iterator13 = _create_for_of_iterator_helper_loose(targets), _step13; !(_step13 = _iterator13()).done;){
                        var a7 = _step13.value;
                        if (a7.alive && a7.team === 'red' && Math.hypot(a7.x - sp1.cx, a7.z - sp1.cz) <= 10.5) {
                            a7.x = sp1.cx + (a7.x - sp1.cx) * 0.25;
                            a7.z = sp1.cz + (a7.z - sp1.cz) * 0.25;
                            a7.mesh.position.set(a7.x, 0, a7.z);
                            a7.stunTimer = Math.max(a7.stunTimer, 1.1);
                            this.damageEnemyActor(a7, sp1.baseDmg, true, 'magic');
                        }
                    }
                }
            }
            if (sp1.life <= 0) {
                (0, _LegendsArena3DWorld.disposeObjectTree)(sp1.group);
                this.three.scene.remove(sp1.group);
                this.activeUltSetpieces.splice(i3, 1);
            }
        }
        // Minion Waves (Exact MLBB: 0:10 first wave, every 30s in Classic/Ranked, faster in Brawl)
        this.waveTimer -= dt;
        if (this.waveTimer <= 0) {
            this.waveTimer = this.mobaMode === 'brawl' ? 12.0 : _arenaRoster.MLBB_TIMERS.WAVE_INTERVAL_SEC;
            var aliveCount = 0;
            for(var _iterator14 = _create_for_of_iterator_helper_loose(this.actors), _step14; !(_step14 = _iterator14()).done;){
                var a8 = _step14.value;
                if (a8.alive) aliveCount++;
            }
            if (aliveCount < 32) {
                this.spawnMinionWave();
            }
        }
        // Jungle Camps, 3-Stage Lord Evolution, Leash Perimeter Ring & Patience Bar
        for(var _iterator15 = _create_for_of_iterator_helper_loose(this.jungleCamps), _step15; !(_step15 = _iterator15()).done;){
            var jc2 = _step15.value;
            // Turtle -> 3-Stage Lord Transformation (8:00 Neutral / 12:00 Enhanced / 18:00 Evolved)
            if (jc2.id === 'river_boss') {
                var _jc_lordStage;
                if (jc2.campKind === 'turtle' && jc2.alive && (0, _arenaRoster.shouldTurtleDissipate)(this.matchElapsed, jc2.outOfCombatSec)) {
                    jc2.alive = false;
                    jc2.aggroed = false;
                    jc2.mesh.visible = false;
                    jc2.ringMesh.visible = false;
                    if (jc2.leashMesh) jc2.leashMesh.visible = false;
                    this.bossPhase = 'lord';
                    jc2.respawnTimer = 2.0;
                    this.showKillfeed('✨ 08:00 — River Turtle Dissipated! The Sovereign Lord is Awakening!');
                }
                if (clock.lordStage >= 1 && (this.bossPhase !== 'lord' || jc2.campKind !== 'lord' || ((_jc_lordStage = jc2.lordStage) != null ? _jc_lordStage : 0) < clock.lordStage)) {
                    if (!jc2.alive || jc2.campKind === 'lord') {
                        var _jc_lordStage1;
                        this.bossPhase = 'lord';
                        var nextStage = clock.lordStage;
                        var stageChanged = ((_jc_lordStage1 = jc2.lordStage) != null ? _jc_lordStage1 : 0) !== nextStage || jc2.campKind !== 'lord';
                        if (stageChanged) {
                            jc2.campKind = 'lord';
                            jc2.lordStage = nextStage;
                            jc2.icon = '🐉';
                            jc2.label = nextStage === 3 ? 'Evolved Lord (Stage 3)' : nextStage === 2 ? 'Enhanced Lord (Stage 2)' : 'Neutral Lord (Stage 1)';
                            jc2.colorNum = nextStage === 3 ? 0xa855f7 : nextStage === 2 ? 0xf59e0b : 0xfacc15;
                            jc2.colorHex = nextStage === 3 ? '#c084fc' : nextStage === 2 ? '#fbbf24' : '#fde047';
                            jc2.maxHp = nextStage === 3 ? 1150 : nextStage === 2 ? 880 : 650;
                            jc2.hp = jc2.alive ? Math.max(jc2.hp, Math.round(jc2.maxHp * 0.85)) : jc2.maxHp;
                            jc2.atk = nextStage === 3 ? 34 : nextStage === 2 ? 28 : 22;
                            jc2.respawnDelay = clock.lordRespawnSec;
                            var newMesh = this.createCampMesh('lord', nextStage === 3 ? 2.25 : nextStage === 2 ? 2.1 : 1.95, jc2.colorNum);
                            newMesh.position.set(jc2.x, 0, jc2.z);
                            newMesh.visible = jc2.alive;
                            (0, _LegendsArena3DWorld.disposeObjectTree)(jc2.mesh);
                            this.three.scene.remove(jc2.mesh);
                            jc2.mesh = newMesh;
                            this.three.scene.add(newMesh);
                        }
                    }
                }
            }
            if (!jc2.alive) {
                jc2.respawnTimer -= dt;
                if (jc2.respawnTimer <= 0) {
                    jc2.alive = true;
                    jc2.aggroed = false;
                    jc2.patience = 100;
                    jc2.outOfCombatSec = 99;
                    jc2.hp = jc2.maxHp;
                    jc2.x = jc2.homeX;
                    jc2.z = jc2.homeZ;
                    jc2.mesh.position.set(jc2.x, 0, jc2.z);
                    jc2.mesh.visible = true;
                    jc2.ringMesh.visible = true;
                    if (jc2.campKind === 'blue_buff') {
                        this.setPurpleShortcutOpen(jc2.id, false);
                        this.showKillfeed(jc2.icon + " " + jc2.label + " has spawned!");
                    } else if (jc2.campKind === 'red_buff') {
                        this.showKillfeed(jc2.icon + " " + jc2.label + " has spawned!");
                    } else if (jc2.campKind === 'turtle') {
                        this.showKillfeed('🐢 THE RIVER TURTLE HAS SPAWNED!');
                    } else if (jc2.campKind === 'lord') {
                        this.showKillfeed("\uD83D\uDC09 " + jc2.label.toUpperCase() + " HAS AWAKENED IN THE RIVER PIT!");
                    }
                }
                continue;
            }
            jc2.outOfCombatSec += dt;
            if (jc2.mesh.children[1]) {
                jc2.mesh.children[1].rotation.y += dt * 1.9;
            }
            if (jc2.leashMesh) {
                jc2.leashMesh.visible = jc2.aggroed;
            }
            jc2.stunTimer = Math.max(0, jc2.stunTimer - dt);
            jc2.cd = Math.max(0, jc2.cd - dt);
            if (jc2.stunTimer > 0) continue;
            var dp = Math.hypot(this.px - jc2.x, this.pz - jc2.z);
            var distHome = Math.hypot(jc2.x - jc2.homeX, jc2.z - jc2.homeZ);
            var playerFromHome = Math.hypot(this.px - jc2.homeX, this.pz - jc2.homeZ);
            if (jc2.aggroed) {
                // Drain patience if dragged outside leash perimeter ring or hero leaves camp
                if (distHome > jc2.leashRadius || playerFromHome > jc2.leashRadius + 1.5) {
                    jc2.patience = Math.max(0, jc2.patience - 30 * dt);
                } else {
                    jc2.patience = Math.min(100, jc2.patience + 18 * dt);
                }
                if (jc2.patience <= 0) {
                    // Reset creep & heal rapidly to 100%
                    jc2.aggroed = false;
                    jc2.patience = 100;
                    jc2.hp = jc2.maxHp;
                    jc2.x = jc2.homeX;
                    jc2.z = jc2.homeZ;
                    jc2.mesh.position.set(jc2.x, 0, jc2.z);
                    if (jc2.leashMesh) jc2.leashMesh.visible = false;
                    this.spawnDamageNumber(jc2.x, jc2.z, jc2.maxHp, 'heal');
                    continue;
                }
                if (dp < 3.8) {
                    if (jc2.cd <= 0) {
                        jc2.cd = 1.2;
                        this.applyPlayerDamage(jc2.atk);
                    }
                } else if (distHome <= jc2.leashRadius + 1.2) {
                    var dx1 = this.px - jc2.x;
                    var dz1 = this.pz - jc2.z;
                    var d1 = Math.hypot(dx1, dz1) || 1;
                    jc2.x += dx1 / d1 * 3.8 * dt;
                    jc2.z += dz1 / d1 * 3.8 * dt;
                    jc2.mesh.position.set(jc2.x, 0, jc2.z);
                    jc2.mesh.rotation.y = Math.atan2(dx1, dz1);
                }
            } else if (distHome > 0.6) {
                var dx2 = jc2.homeX - jc2.x;
                var dz2 = jc2.homeZ - jc2.z;
                var d2 = Math.hypot(dx2, dz2) || 1;
                jc2.x += dx2 / d2 * 5.4 * dt;
                jc2.z += dz2 / d2 * 5.4 * dt;
                jc2.mesh.position.set(jc2.x, 0, jc2.z);
                jc2.hp = Math.min(jc2.maxHp, jc2.hp + Math.max(1, Math.round(jc2.maxHp * 0.25 * dt)));
            }
        }
        // Stage 3 Evolved Lord Summoned Aura: empowers nearby allies with Magic DMG pulse every 2s
        var alliedLord = this.actors.find(function(a) {
            return a.alive && a.kind === 'lord' && a.team === 'blue';
        });
        if (alliedLord && clock.lordStage >= 3) {
            this.lordAuraTickAcc += dt;
            if (this.lordAuraTickAcc >= 2.0) {
                this.lordAuraTickAcc -= 2.0;
                if (Math.hypot(this.px - alliedLord.x, this.pz - alliedLord.z) <= 18) {
                    for(var _iterator16 = _create_for_of_iterator_helper_loose(this.actors), _step16; !(_step16 = _iterator16()).done;){
                        var e = _step16.value;
                        if (e.alive && e.team === 'red' && Math.hypot(e.x - this.px, e.z - this.pz) <= 10) {
                            this.damageEnemyActor(e, 38 + this.heroLevel * 4, true, 'magic');
                        }
                    }
                }
            }
        }
        // Actors (Heroes, Minions, Allied Lord, Summons) + Full CC & Airborne Arc Physics
        var lockedTargetObj = null;
        for(var i4 = this.actors.length - 1; i4 >= 0; i4--){
            var a9 = this.actors[i4];
            if (a9.lifeTimer > 0) {
                a9.lifeTimer -= dt;
                if (a9.lifeTimer <= 0) {
                    (0, _LegendsArena3DWorld.disposeObjectTree)(a9.mesh);
                    this.three.scene.remove(a9.mesh);
                    this.actors.splice(i4, 1);
                    continue;
                }
            }
            if (!a9.alive) {
                if (a9.kind === 'hero' && a9.respawnTimer > 0) {
                    a9.respawnTimer -= dt;
                    if (a9.respawnTimer <= 0) {
                        a9.alive = true;
                        a9.hp = a9.maxHp;
                        a9.x = a9.spawnX;
                        a9.z = a9.spawnZ;
                        a9.mesh.position.set(a9.x, 0, a9.z);
                        a9.mesh.visible = true;
                    }
                }
                continue;
            }
            if (a9.id === this.lockedEnemyId && a9.team === 'red') {
                lockedTargetObj = a9;
            }
            a9.stunTimer = Math.max(0, a9.stunTimer - dt);
            a9.rootTimer = Math.max(0, a9.rootTimer - dt);
            a9.silenceTimer = Math.max(0, a9.silenceTimer - dt);
            a9.fearTimer = Math.max(0, a9.fearTimer - dt);
            a9.tauntTimer = Math.max(0, a9.tauntTimer - dt);
            a9.slowTimer = Math.max(0, a9.slowTimer - dt);
            a9.cd = Math.max(0, a9.cd - dt);
            if (a9.emoteAiCd && a9.emoteAiCd > 0) {
                a9.emoteAiCd = Math.max(0, a9.emoteAiCd - dt);
            }
            if (a9.activeEmoteTimer && a9.activeEmoteTimer > 0) {
                a9.activeEmoteTimer = Math.max(0, a9.activeEmoteTimer - dt);
                if (a9.activeEmoteTimer <= 0) a9.activeEmoteId = undefined;
            }
            // Persistent 3D Elemental Target Status Effect & Burn/Bleed/Curse DoT Ticks
            if (a9.statusTimer && a9.statusTimer > 0) {
                a9.statusTimer = Math.max(0, a9.statusTimer - dt);
                if (a9.statusFxGroup && a9.statusKind) {
                    (0, _mobaElementalVfx.animateElementalStatusMesh)(a9.statusFxGroup, a9.statusKind, this.matchElapsed, dt);
                }
                if (a9.statusDps && a9.statusDps > 0 && a9.team === 'red') {
                    var _a_statusTickAcc;
                    a9.statusTickAcc = ((_a_statusTickAcc = a9.statusTickAcc) != null ? _a_statusTickAcc : 0) + dt;
                    if (a9.statusTickAcc >= 0.65) {
                        a9.statusTickAcc -= 0.65;
                        this.damageEnemyActor(a9, Math.max(4, Math.round(a9.statusDps * 0.65)), true, 'magic');
                        if (!a9.alive) {
                            if (a9.statusFxGroup) {
                                (0, _LegendsArena3DWorld.disposeObjectTree)(a9.statusFxGroup);
                                a9.mesh.remove(a9.statusFxGroup);
                                a9.statusFxGroup = undefined;
                            }
                            a9.statusTimer = 0;
                            a9.statusDps = 0;
                            continue;
                        }
                    }
                }
                if (a9.statusTimer <= 0) {
                    a9.statusDps = 0;
                    a9.statusKind = undefined;
                    if (a9.statusFxGroup) {
                        (0, _LegendsArena3DWorld.disposeObjectTree)(a9.statusFxGroup);
                        a9.mesh.remove(a9.statusFxGroup);
                        a9.statusFxGroup = undefined;
                    }
                }
            }
            if (a9.airborneTimer > 0) {
                a9.airborneTimer = Math.max(0, a9.airborneTimer - dt);
                var prog1 = 1 - a9.airborneTimer / Math.max(0.05, a9.airborneDur);
                var arcY = 4 * a9.airbornePeak * prog1 * (1 - prog1);
                a9.mesh.position.set(a9.x, Math.max(0, arcY), a9.z);
                continue;
            } else if (a9.mesh.position.y > 0.01) {
                a9.mesh.position.y = 0;
            }
            if (a9.stunTimer > 0) continue;
            // Fear CC: force enemy to flee away from player
            if (a9.fearTimer > 0 && a9.team === 'red') {
                var dx3 = a9.x - this.px;
                var dz3 = a9.z - this.pz;
                var d3 = Math.hypot(dx3, dz3) || 1;
                a9.x = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, a9.x + dx3 / d3 * 5.2 * dt));
                a9.z = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, a9.z + dz3 / d3 * 5.2 * dt));
                a9.mesh.position.set(a9.x, 0, a9.z);
                a9.mesh.rotation.y = Math.atan2(dx3, dz3);
                continue;
            }
            var defaultTargetX = a9.team === 'blue' ? _LegendsArena3DWorld.RED_BASE_X : a9.kind === 'hero' ? this.px : _LegendsArena3DWorld.BLUE_BASE_X;
            var defaultTargetZ = a9.team === 'blue' ? _LegendsArena3DWorld.RED_BASE_Z : a9.kind === 'hero' ? this.pz : _LegendsArena3DWorld.BLUE_BASE_Z;
            var nearDist = 999;
            var tx = defaultTargetX;
            var tz = defaultTargetZ;
            var hitTarget = null;
            var hitTurret = null;
            // Taunt forces enemy to walk directly toward player
            if (a9.tauntTimer > 0 && a9.team === 'red') {
                nearDist = Math.hypot(this.px - a9.x, this.pz - a9.z);
                tx = this.px;
                tz = this.pz;
            } else {
                if (a9.team === 'red' && this.stealthTimer <= 0 && this.frozenTimer <= 0 && this.untargetableTimer <= 0) {
                    var dp1 = Math.hypot(this.px - a9.x, this.pz - a9.z);
                    if (dp1 < (isBushStealthed ? 5.5 : 16)) {
                        nearDist = dp1;
                        tx = this.px;
                        tz = this.pz;
                    }
                }
                for(var _iterator17 = _create_for_of_iterator_helper_loose(this.actors), _step17; !(_step17 = _iterator17()).done;){
                    var other = _step17.value;
                    if (!other.alive || other.team === a9.team) continue;
                    var d4 = Math.hypot(other.x - a9.x, other.z - a9.z);
                    if (d4 < 16 && d4 < nearDist) {
                        nearDist = d4;
                        tx = other.x;
                        tz = other.z;
                        hitTarget = other;
                        hitTurret = null;
                    }
                }
                for(var _iterator18 = _create_for_of_iterator_helper_loose(this.turrets), _step18; !(_step18 = _iterator18()).done;){
                    var t3 = _step18.value;
                    if (!t3.alive || t3.team === a9.team) continue;
                    var d5 = Math.hypot(t3.x - a9.x, t3.z - a9.z);
                    if (d5 < 14 && d5 < nearDist) {
                        nearDist = d5;
                        tx = t3.x;
                        tz = t3.z;
                        hitTurret = t3;
                        hitTarget = null;
                    }
                }
            }
            var strikeRange = a9.kind === 'summon_turret' ? 12.5 : a9.kind === 'lord' ? 5.2 : 4.0;
            if (nearDist < strikeRange) {
                if (a9.cd <= 0 && a9.silenceTimer <= 0) {
                    a9.cd = a9.kind === 'summon_turret' ? 0.65 : 1.0;
                    if (hitTarget && hitTarget.alive) {
                        if (hitTarget.team === 'red') this.damageEnemyActor(hitTarget, a9.atk, a9.kind.startsWith('summon_'), 'phys');
                        else {
                            var incoming = a9.atk;
                            // Stage 3 Evolved Lord Summoned Aura: 5% DR per nearby allied hero (max 25%)
                            if (hitTarget.kind === 'lord' && clock.lordStage >= 3) {
                                var nearbyAllies = Math.hypot(this.px - hitTarget.x, this.pz - hitTarget.z) <= 16 ? 1 : 0;
                                for(var _iterator19 = _create_for_of_iterator_helper_loose(this.actors), _step19; !(_step19 = _iterator19()).done;){
                                    var ally = _step19.value;
                                    if (ally.alive && ally.team === 'blue' && ally.kind === 'hero' && Math.hypot(ally.x - hitTarget.x, ally.z - hitTarget.z) <= 16) {
                                        nearbyAllies++;
                                    }
                                }
                                incoming = Math.max(1, Math.round(incoming * (1 - (0, _arenaRoster.computeEvolvedLordSummonedDr)(nearbyAllies))));
                            }
                            hitTarget.hp -= incoming;
                            if (hitTarget.hp <= 0) {
                                hitTarget.alive = false;
                                hitTarget.mesh.visible = false;
                                if (hitTarget.kind === 'hero') {
                                    hitTarget.respawnTimer = 10.0;
                                    if (a9.kind === 'hero') this.triggerActorAiEmote(a9, 'kill');
                                }
                            } else if (hitTarget.kind === 'hero' && hitTarget.hp <= hitTarget.maxHp * 0.3) {
                                this.triggerActorAiEmote(hitTarget, 'low_hp');
                            }
                        }
                    } else if (hitTurret && hitTurret.alive) {
                        this.damageTurret(hitTurret, a9.atk * (a9.kind === 'lord' ? 1.8 : 0.85), a9.kind === 'lord');
                    } else if (a9.team === 'red' && Math.hypot(this.px - a9.x, this.pz - a9.z) < 4.5) {
                        this.applyPlayerDamage(a9.atk, a9);
                        // Blade Armor (Bladed Armor: reflect damage back to attacker)
                        if (this.equippedItemIds.includes('blade_armor')) {
                            this.damageEnemyActor(a9, Math.max(4, Math.round(this.computedStats.physDef * 0.25)), true, 'phys');
                        }
                    }
                }
            } else if (a9.kind !== 'summon_turret' && a9.rootTimer <= 0) {
                var dx4 = tx - a9.x;
                var dz4 = tz - a9.z;
                var d6 = Math.hypot(dx4, dz4) || 1;
                var slowMult = a9.slowTimer > 0 ? 0.55 : 1.0;
                var minionLateBoost = a9.kind === 'minion' && clock.minionSpeedBoostActive ? 1.28 : 1.0;
                var baseSpd = a9.kind === 'hero' ? 6.2 : a9.kind === 'lord' ? 5.0 : a9.kind === 'summon_clone' ? 8.5 : 4.4 * minionLateBoost;
                var spd = baseSpd * slowMult * dt;
                a9.x = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, a9.x + dx4 / d6 * spd));
                a9.z = Math.max(-_LegendsArena3DWorld.PLAY_LIMIT, Math.min(_LegendsArena3DWorld.PLAY_LIMIT, a9.z + dz4 / d6 * spd));
                a9.mesh.position.set(a9.x, 0, a9.z);
                a9.mesh.rotation.y = Math.atan2(dx4, dz4);
            }
        }
        // Hero Lock Ground Reticle Ring
        if (lockedTargetObj) {
            this.lockedReticleMesh.visible = true;
            this.lockedReticleMesh.position.set(lockedTargetObj.x, 0.22, lockedTargetObj.z);
            this.lockedReticleMesh.rotation.z += dt * 3.0;
        } else {
            this.lockedReticleMesh.visible = false;
        }
        // Turrets
        for(var _iterator20 = _create_for_of_iterator_helper_loose(this.turrets), _step20; !(_step20 = _iterator20()).done;){
            var t4 = _step20.value;
            if (!t4.alive) continue;
            t4.mesh.children[1].rotation.y += dt * 1.8;
            t4.cd = Math.max(0, t4.cd - dt);
            if (t4.cd <= 0) {
                var tgtX = 0;
                var tgtZ = 0;
                var found = false;
                if (t4.team === 'red' && this.stealthTimer <= 0 && this.frozenTimer <= 0 && this.untargetableTimer <= 0 && Math.hypot(this.px - t4.x, this.pz - t4.z) < 14) {
                    tgtX = this.px;
                    tgtZ = this.pz;
                    found = true;
                } else {
                    for(var _iterator21 = _create_for_of_iterator_helper_loose(this.actors), _step21; !(_step21 = _iterator21()).done;){
                        var a10 = _step21.value;
                        if (a10.alive && a10.team !== t4.team && Math.hypot(a10.x - t4.x, a10.z - t4.z) < 14) {
                            tgtX = a10.x;
                            tgtZ = a10.z;
                            found = true;
                            break;
                        }
                    }
                }
                if (found) {
                    t4.cd = 1.25;
                    var dx5 = tgtX - t4.x;
                    var dz5 = tgtZ - t4.z;
                    var d7 = Math.hypot(dx5, dz5) || 1;
                    var m2 = new _three.Mesh(this.boltGeo, t4.team === 'blue' ? this.blueBoltMat : this.redBoltMat);
                    m2.position.set(t4.x, 4.8, t4.z);
                    this.three.scene.add(m2);
                    this.bolts.push({
                        mesh: m2,
                        x: t4.x,
                        z: t4.z,
                        vx: dx5 / d7 * 28,
                        vz: dz5 / d7 * 28,
                        team: t4.team,
                        dmg: 20,
                        life: 1.0,
                        isSharedMesh: true
                    });
                }
            }
        }
        // Projectiles (with Flameshot distance damage scaling & Elemental Impacts)
        for(var i5 = this.bolts.length - 1; i5 >= 0; i5--){
            var b = this.bolts[i5];
            b.life -= dt;
            b.x += b.vx * dt;
            b.z += b.vz * dt;
            b.mesh.position.set(b.x, 1.85, b.z);
            if (b.elementTheme === 'wind' || b.elementTheme === 'blood' || b.elementTheme === 'earth') {
                b.mesh.rotation.z += dt * 10;
            }
            var dead = b.life <= 0;
            if (!dead && b.team === 'red' && Math.hypot(b.x - this.px, b.z - this.pz) < 1.5) {
                dead = true;
                this.applyPlayerDamage(b.dmg);
            } else if (!dead && b.team === 'blue') {
                for(var _iterator22 = _create_for_of_iterator_helper_loose(this.actors), _step22; !(_step22 = _iterator22()).done;){
                    var a11 = _step22.value;
                    if (a11.alive && a11.team === 'red' && Math.hypot(b.x - a11.x, b.z - a11.z) < 2.0) {
                        dead = true;
                        if (b.slowSec && b.slowSec > 0) a11.slowTimer = Math.max(a11.slowTimer, b.slowSec);
                        var finalBoltDmg = b.dmg;
                        if (b.isFlameshot && b.startX !== undefined && b.startZ !== undefined) {
                            var travel = Math.hypot(b.x - b.startX, b.z - b.startZ);
                            finalBoltDmg = Math.round(b.dmg * (1 + Math.min(1.0, travel / 35)));
                            this.spawnElementalVfx('fire', 'flame_wave', a11.x, a11.z, 5.2, this.pYaw);
                        } else if (b.elementTheme && b.elementTheme !== 'steel') {
                            this.spawnElementalVfx(b.elementTheme, 'ring', a11.x, a11.z, 3.0, this.pYaw);
                        }
                        if (b.elementTheme) {
                            this.applyElementalStatusToActor(a11, b.elementTheme, 'none', finalBoltDmg);
                        }
                        this.damageEnemyActor(a11, finalBoltDmg, true, b.isFlameshot ? 'magic' : 'phys');
                        break;
                    }
                }
                if (!dead) {
                    for(var _iterator23 = _create_for_of_iterator_helper_loose(this.jungleCamps), _step23; !(_step23 = _iterator23()).done;){
                        var jc3 = _step23.value;
                        if (jc3.alive && Math.hypot(b.x - jc3.x, b.z - jc3.z) < 2.4) {
                            dead = true;
                            if (b.elementTheme && b.elementTheme !== 'steel') {
                                this.spawnElementalVfx(b.elementTheme, 'ring', jc3.x, jc3.z, 3.2, this.pYaw);
                            }
                            this.damageJungleCamp(jc3, b.dmg);
                            break;
                        }
                    }
                }
                if (!dead) {
                    for(var _iterator24 = _create_for_of_iterator_helper_loose(this.turrets), _step24; !(_step24 = _iterator24()).done;){
                        var t5 = _step24.value;
                        if (t5.alive && t5.team === 'red' && Math.hypot(b.x - t5.x, b.z - t5.z) < 2.6) {
                            dead = true;
                            this.damageTurret(t5, b.dmg);
                            break;
                        }
                    }
                }
            }
            if (dead) {
                if (!b.isSharedMesh) {
                    (0, _LegendsArena3DWorld.disposeObjectTree)(b.mesh);
                }
                this.three.scene.remove(b.mesh);
                this.bolts.splice(i5, 1);
            }
        }
        // 3D VFX Animation & Ghost Afterimage Fade
        for(var i6 = this.fxObjs.length - 1; i6 >= 0; i6--)_this = this, _loop(i6);
        // Floating Damage Numbers Drift
        for(var i7 = this.floatingDmgNums.length - 1; i7 >= 0; i7--){
            var d8 = this.floatingDmgNums[i7];
            d8.life -= dt;
            d8.wy += dt * 2.8;
            if (d8.life <= 0) this.floatingDmgNums.splice(i7, 1);
        }
        // Ground Aiming Telegraph Sync
        this.syncTelegraphTransform();
        // Smoothly Damped Camera Follow (respecting Low / Medium / High Camera Height + Shake)
        var camOff = this.getCameraOffsets();
        var shakeX = this.cameraShake > 0 ? (Math.random() - 0.5) * this.cameraShake * 1.6 : 0;
        var shakeZ = this.cameraShake > 0 ? (Math.random() - 0.5) * this.cameraShake * 1.6 : 0;
        _LegendsArena3DWorld._mobaDesired.set(this.px + camOff.dx + shakeX, camOff.y, this.pz + camOff.dz + shakeZ);
        this.three.camera.position.lerp(_LegendsArena3DWorld._mobaDesired, 1 - Math.exp(-10 * dt));
        _LegendsArena3DWorld._mobaLook.set(this.px + 2.6, 0.9, this.pz - 2.6);
        this.three.camera.lookAt(_LegendsArena3DWorld._mobaLook);
        this.hudSyncTimer -= dt;
        if (this.hudSyncTimer <= 0) {
            this.hudSyncTimer = 0.1;
            this.pushMobaHudSnapshot();
        }
    };
    _proto.endMatch = function endMatch(victory) {
        if (this.gameOver) return;
        this.gameOver = true;
        this.isRunning = false;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.healingSprings), _step; !(_step = _iterator()).done;){
            var sp = _step.value;
            (0, _LegendsArena3DWorld.disposeObjectTree)(sp.mesh);
            this.three.scene.remove(sp.mesh);
        }
        this.healingSprings = [];
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.activeUltSetpieces), _step1; !(_step1 = _iterator1()).done;){
            var up = _step1.value;
            (0, _LegendsArena3DWorld.disposeObjectTree)(up.group);
            this.three.scene.remove(up.group);
        }
        this.activeUltSetpieces = [];
        (0, _storage.recordMobaMatchResult)({
            heroId: this.heroDef.id,
            heroName: this.heroDef.name,
            mode: this.mobaMode,
            victory: victory,
            kills: this.kills,
            deaths: this.deaths,
            gold: Math.round(this.gold),
            score: this.score,
            durationSec: Math.round(this.matchElapsed),
            items: [].concat(this.equippedItemIds)
        });
        (0, _runtimeBridge.updateMobaHud)(null);
        (0, _runtimeBridge.triggerGameOver)(this.score, _storage.playerState.sessionCoins, this.level, this.gameIdx, victory);
    };
    _proto.projectToOverlay = function projectToOverlay(wx, wy, wz, w, h) {
        _LegendsArena3DWorld._mobaProj.set(wx, wy, wz);
        _LegendsArena3DWorld._mobaProj.project(this.three.camera);
        if (_LegendsArena3DWorld._mobaProj.z < -1 || _LegendsArena3DWorld._mobaProj.z > 1) return null;
        var sx = (_LegendsArena3DWorld._mobaProj.x * 0.5 + 0.5) * w;
        var sy = (-_LegendsArena3DWorld._mobaProj.y * 0.5 + 0.5) * h;
        if (sx < -40 || sx > w + 40 || sy < 40 || sy > h - 30) return null;
        return {
            sx: sx,
            sy: sy
        };
    };
    _proto.updateAllHealthTrails = function updateAllHealthTrails(dt) {
        // Player overhead bar delayed catch-up trail
        if (this.lives !== this.playerLastHp) {
            var trig = (0, _arenaRoster.triggerHealthTrailDamage)(this.playerLastHp, this.lives, this.playerTrailHp, this.playerTrailHold);
            this.playerTrailHp = trig.trailHp;
            this.playerTrailHold = trig.holdSec;
            this.playerLastHp = this.lives;
        }
        var pStep = (0, _arenaRoster.stepHealthTrail)(this.lives, this.maxLives, this.playerTrailHp, this.playerTrailHold, dt);
        this.playerTrailHp = pStep.trailHp;
        this.playerTrailHold = pStep.holdSec;
        // Actors (Heroes, Minions, Summons, Lord)
        for(var _iterator = _create_for_of_iterator_helper_loose(this.actors), _step; !(_step = _iterator()).done;){
            var a = _step.value;
            var _a_trailHold;
            if (!a.alive) {
                a.trailHp = 0;
                a.trailHold = 0;
                a.lastHp = 0;
                continue;
            }
            if (a.trailHp === undefined || a.lastHp === undefined) {
                a.trailHp = a.hp;
                a.lastHp = a.hp;
                a.trailHold = 0;
            } else if (a.hp !== a.lastHp) {
                var _a_trailHold1;
                var trig1 = (0, _arenaRoster.triggerHealthTrailDamage)(a.lastHp, a.hp, a.trailHp, (_a_trailHold1 = a.trailHold) != null ? _a_trailHold1 : 0);
                a.trailHp = trig1.trailHp;
                a.trailHold = trig1.holdSec;
                a.lastHp = a.hp;
            }
            var st = (0, _arenaRoster.stepHealthTrail)(a.hp, a.maxHp, a.trailHp, (_a_trailHold = a.trailHold) != null ? _a_trailHold : 0, dt);
            a.trailHp = st.trailHp;
            a.trailHold = st.holdSec;
        }
        // Jungle Camps, Turtle & Lord
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.jungleCamps), _step1; !(_step1 = _iterator1()).done;){
            var jc = _step1.value;
            var _jc_trailHold;
            if (!jc.alive) {
                jc.trailHp = jc.maxHp;
                jc.lastHp = jc.maxHp;
                jc.trailHold = 0;
                continue;
            }
            if (jc.trailHp === undefined || jc.lastHp === undefined) {
                jc.trailHp = jc.hp;
                jc.lastHp = jc.hp;
                jc.trailHold = 0;
            } else if (jc.hp !== jc.lastHp) {
                var _jc_trailHold1;
                var trig2 = (0, _arenaRoster.triggerHealthTrailDamage)(jc.lastHp, jc.hp, jc.trailHp, (_jc_trailHold1 = jc.trailHold) != null ? _jc_trailHold1 : 0);
                jc.trailHp = trig2.trailHp;
                jc.trailHold = trig2.holdSec;
                jc.lastHp = jc.hp;
            }
            var st1 = (0, _arenaRoster.stepHealthTrail)(jc.hp, jc.maxHp, jc.trailHp, (_jc_trailHold = jc.trailHold) != null ? _jc_trailHold : 0, dt);
            jc.trailHp = st1.trailHp;
            jc.trailHold = st1.holdSec;
        }
        // Turrets & Nexus Cores
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.turrets), _step2; !(_step2 = _iterator2()).done;){
            var t = _step2.value;
            var _t_trailHold;
            if (!t.alive) continue;
            if (t.trailHp === undefined || t.lastHp === undefined) {
                t.trailHp = t.hp;
                t.lastHp = t.hp;
                t.trailHold = 0;
            } else if (t.hp !== t.lastHp) {
                var _t_trailHold1;
                var trig3 = (0, _arenaRoster.triggerHealthTrailDamage)(t.lastHp, t.hp, t.trailHp, (_t_trailHold1 = t.trailHold) != null ? _t_trailHold1 : 0);
                t.trailHp = trig3.trailHp;
                t.trailHold = trig3.holdSec;
                t.lastHp = t.hp;
            }
            var st2 = (0, _arenaRoster.stepHealthTrail)(t.hp, t.maxHp, t.trailHp, (_t_trailHold = t.trailHold) != null ? _t_trailHold : 0, dt);
            t.trailHp = st2.trailHp;
            t.trailHold = st2.holdSec;
        }
    };
    _proto.drawFloatingBar = function drawFloatingBar(ctx, sx, sy, barW, barH, hp, maxHp, fillColor, label, subBadge, shieldActive, trailHp) {
        if (shieldActive === void 0) shieldActive = false;
        var pct = Math.max(0, Math.min(1, hp / Math.max(1, maxHp)));
        var trailPct = trailHp !== undefined && trailHp > hp + 0.5 ? Math.max(pct, Math.min(1, trailHp / Math.max(1, maxHp))) : pct;
        var x = Math.round(sx - barW / 2);
        var y = Math.round(sy - barH / 2);
        if (label) {
            ctx.font = '800 9.5px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
            ctx.fillText(label, sx + 1, y - 3);
            ctx.fillStyle = '#f8fafc';
            ctx.fillText(label, sx, y - 4);
        }
        ctx.fillStyle = 'rgba(9, 13, 22, 0.9)';
        ctx.fillRect(x - 1, y - 1, barW + 2, barH + 2);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y, barW, barH);
        // Delayed catch-up damage trail behind live HP fill
        if (trailPct > pct + 0.005) {
            var fillW = Math.round(barW * pct);
            var trailW = Math.max(fillW + 1, Math.round(barW * trailPct));
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(x + fillW, y, Math.max(1, trailW - fillW), barH);
            ctx.fillStyle = 'rgba(249, 115, 22, 0.72)';
            ctx.fillRect(x + fillW, y + Math.floor(barH * 0.45), Math.max(1, trailW - fillW), Math.ceil(barH * 0.55));
        }
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, hp > 0 ? Math.max(1, Math.round(barW * pct)) : 0, barH);
        if (shieldActive) {
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(x + Math.round(barW * pct * 0.78), y, Math.max(4, Math.round(barW * 0.22)), barH);
        }
        // Segment ticks for larger bars
        if (barW >= 46) {
            ctx.fillStyle = 'rgba(9, 13, 22, 0.55)';
            var segs = 4;
            for(var i = 1; i < segs; i++){
                ctx.fillRect(x + Math.round(barW * i / segs), y, 1, barH);
            }
        }
        if (subBadge) {
            ctx.fillStyle = '#090d16';
            ctx.fillRect(x - 16, y - 2, 14, barH + 4);
            ctx.strokeStyle = fillColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(x - 16, y - 2, 14, barH + 4);
            ctx.fillStyle = '#facc15';
            ctx.font = '900 8px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(subBadge, x - 9, y + barH - 0.5);
        }
    };
    _proto.drawCcCue = function drawCcCue(ctx, sx, sy, text, color) {
        ctx.font = '900 10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(9, 13, 22, 0.9)';
        ctx.fillText(text, sx + 1, sy + 1);
        ctx.fillStyle = color;
        ctx.fillText(text, sx, sy);
    };
    _proto.drawEmoteBubble = function drawEmoteBubble(ctx, sx, sy, emote, remainingSec, maxSec) {
        var elapsed = Math.max(0, maxSec - remainingSec);
        // Crisp bounce-in over first 0.2s, smooth fade-out over final 0.35s
        var popScale = elapsed < 0.14 ? 0.45 + elapsed / 0.14 * 0.67 : elapsed < 0.24 ? 1.12 - (elapsed - 0.14) / 0.1 * 0.12 : 1.0;
        var alpha = remainingSec < 0.35 ? Math.max(0, remainingSec / 0.35) : 1.0;
        var floatY = Math.sin(elapsed * 5.0) * 2.2;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(sx, sy + floatY);
        ctx.scale(popScale, popScale);
        var text = emote.icon + " " + emote.callout;
        ctx.font = '900 11px system-ui, sans-serif';
        var textW = ctx.measureText(text).width;
        var padX = 11;
        var boxW = Math.max(58, Math.round(textW + padX * 2));
        var boxH = 26;
        var bx = -boxW / 2;
        var by = -boxH - 8;
        // Grounded drop shadow
        ctx.fillStyle = 'rgba(4, 7, 14, 0.72)';
        ctx.beginPath();
        ctx.roundRect(bx + 2, by + 3, boxW, boxH, 9);
        ctx.fill();
        // Speech bubble body
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, 9);
        ctx.fill();
        ctx.strokeStyle = emote.colorHex;
        ctx.lineWidth = 2;
        ctx.stroke();
        // Pointer triangle tail
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.moveTo(-5, by + boxH - 1);
        ctx.lineTo(5, by + boxH - 1);
        ctx.lineTo(0, by + boxH + 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = emote.colorHex;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-5, by + boxH);
        ctx.lineTo(0, by + boxH + 6);
        ctx.lineTo(5, by + boxH);
        ctx.stroke();
        // Emote icon + callout label
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, by + boxH / 2 + 0.5);
        ctx.textBaseline = 'alphabetic';
        ctx.restore();
    };
    _proto.drawOverlayHud = function drawOverlayHud() {
        var ctx = this.three.overlayCtx;
        if (!ctx) return;
        var w = this.three.width;
        var h = this.three.height;
        ctx.clearRect(0, 0, w, h);
        // 1. Floating Overhead Health Bars for EVERY Unit on the Battlefield
        // 1a. Turrets & Nexus Cores
        for(var _iterator = _create_for_of_iterator_helper_loose(this.turrets), _step; !(_step = _iterator()).done;){
            var t = _step.value;
            if (!t.alive) continue;
            if (Math.hypot(t.x - this.px, t.z - this.pz) > 48) continue;
            var proj = this.projectToOverlay(t.x, t.isNexus ? 8.2 : 6.4, t.z, w, h);
            if (!proj) continue;
            this.drawFloatingBar(ctx, proj.sx, proj.sy, t.isNexus ? 66 : 44, t.isNexus ? 6 : 5, t.hp, t.maxHp, t.team === 'blue' ? '#38bdf8' : '#f43f5e', t.isNexus ? t.team === 'blue' ? 'BLUE NEXUS' : 'RED NEXUS' : undefined, undefined, false, t.trailHp);
        }
        // 1b. Jungle Creeps, Purple/Orange Buffs, Turtle & Lord + Retribution Execute Line + Patience Bar
        var hasRetri = this.spellDef.id === 'retribution';
        var retriDmg = hasRetri ? (0, _arenaRoster.computeRetributionDamage)(this.heroLevel, this.junglerStacks >= 5) : 0;
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.jungleCamps), _step1; !(_step1 = _iterator1()).done;){
            var jc = _step1.value;
            if (!jc.alive) continue;
            if (Math.hypot(jc.x - this.px, jc.z - this.pz) > 46) continue;
            var isBoss = jc.campKind === 'lord' || jc.campKind === 'turtle';
            var isBuff = jc.campKind === 'blue_buff' || jc.campKind === 'red_buff';
            var yOff = jc.campKind === 'lord' ? 5.6 : isBuff || jc.campKind === 'turtle' ? 4.4 : 3.2;
            var proj1 = this.projectToOverlay(jc.x, yOff, jc.z, w, h);
            if (!proj1) continue;
            var barW = isBoss ? 72 : isBuff ? 58 : 42;
            var barH = isBoss ? 7 : 5;
            this.drawFloatingBar(ctx, proj1.sx, proj1.sy, barW, barH, jc.hp, jc.maxHp, jc.colorHex, jc.icon + " " + jc.label + " (" + jc.hp + ")", undefined, false, jc.trailHp);
            // Red Retribution Execute Threshold Line on Buffs, Turtle, and Lord HP Bars
            if (hasRetri && (isBoss || isBuff)) {
                var retriRatio = Math.max(0.06, Math.min(0.95, retriDmg / Math.max(1, jc.maxHp)));
                var bx = Math.round(proj1.sx - barW / 2 + barW * retriRatio);
                var by = Math.round(proj1.sy - barH / 2);
                ctx.fillStyle = jc.hp <= retriDmg ? '#ef4444' : '#f87171';
                ctx.fillRect(bx - 1, by - 2, 2.5, barH + 4);
            }
            // White/Yellow Patience Bar below aggroed Jungle Camp HP Bar
            if (jc.aggroed && jc.patience < 99.5) {
                var px0 = Math.round(proj1.sx - barW / 2);
                var py0 = Math.round(proj1.sy + barH / 2 + 3);
                ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
                ctx.fillRect(px0 - 1, py0 - 1, barW + 2, 4);
                ctx.fillStyle = jc.patience < 35 ? '#facc15' : '#f8fafc';
                ctx.fillRect(px0, py0, Math.max(1, Math.round(barW * (jc.patience / 100))), 2.5);
            }
        }
        // 1c. All Lane Minions, Summons, Allied Lord, and Allied/Enemy Heroes + Overhead CC & Elemental Status Cues
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.actors), _step2; !(_step2 = _iterator2()).done;){
            var a = _step2.value;
            if (!a.alive) continue;
            if (Math.hypot(a.x - this.px, a.z - this.pz) > 48) continue;
            var isHero = a.kind === 'hero';
            var isLord = a.kind === 'lord';
            var yOff1 = isLord ? 5.4 : isHero ? 3.8 : 2.5;
            var proj2 = this.projectToOverlay(a.x, yOff1 + a.mesh.position.y, a.z, w, h);
            if (!proj2) continue;
            if (a.kind === 'minion' || a.kind.startsWith('summon_')) {
                this.drawFloatingBar(ctx, proj2.sx, proj2.sy, 26, 3.5, a.hp, a.maxHp, a.team === 'blue' ? '#38bdf8' : '#ef4444', a.label, undefined, false, a.trailHp);
            } else {
                this.drawFloatingBar(ctx, proj2.sx, proj2.sy, isLord ? 64 : 52, 6, a.hp, a.maxHp, a.team === 'blue' ? '#3b82f6' : '#f43f5e', a.label ? (a.icon || '') + " " + a.label + " (" + Math.max(0, Math.round(a.hp)) + ")" : undefined, isLord ? 'LRD' : String(this.heroLevel), false, a.trailHp);
            }
            // Overhead CC & Elemental Status Visual Cues
            if (a.stunTimer > 0) {
                this.drawCcCue(ctx, proj2.sx, proj2.sy - 18, '⭐ STUNNED', '#facc15');
            } else if (a.airborneTimer > 0) {
                this.drawCcCue(ctx, proj2.sx, proj2.sy - 18, '🌪️ AIRBORNE', '#38bdf8');
            } else if (a.fearTimer > 0) {
                this.drawCcCue(ctx, proj2.sx, proj2.sy - 18, '💀 FEARED', '#c084fc');
            } else if (a.tauntTimer > 0) {
                this.drawCcCue(ctx, proj2.sx, proj2.sy - 18, '🛡️ TAUNTED', '#f97316');
            } else if (a.rootTimer > 0) {
                this.drawCcCue(ctx, proj2.sx, proj2.sy - 18, '🌿 ROOTED', '#4ade80');
            } else if (a.silenceTimer > 0) {
                this.drawCcCue(ctx, proj2.sx, proj2.sy - 18, '✖ SILENCED', '#e879f9');
            } else if (a.statusTimer && a.statusTimer > 0 && a.statusKind && a.statusKind !== 'none') {
                var cueMap = {
                    burn: [
                        '🔥 BURNING',
                        '#ff6b2b'
                    ],
                    freeze: [
                        '❄️ FROZEN',
                        '#38bdf8'
                    ],
                    shock: [
                        '⚡ SHOCKED',
                        '#60a5fa'
                    ],
                    gust: [
                        '🌪️ SWEPT',
                        '#2dd4bf'
                    ],
                    soak: [
                        '🌊 SOAKED',
                        '#0ea5e9'
                    ],
                    curse: [
                        '🌑 CURSED',
                        '#c084fc'
                    ],
                    vine: [
                        '🌿 ENTANGLED',
                        '#4ade80'
                    ],
                    radiant: [
                        '✨ SEARED',
                        '#fde047'
                    ],
                    crush: [
                        '🪨 SHATTERED',
                        '#f59e0b'
                    ],
                    bleed: [
                        '🩸 BLEEDING',
                        '#fb7185'
                    ]
                };
                var cue = cueMap[a.statusKind];
                if (cue) this.drawCcCue(ctx, proj2.sx, proj2.sy - 18, cue[0], cue[1]);
            }
            // Contextual AI Hero Overhead Emote Speech Bubble
            if (isHero && a.activeEmoteId && a.activeEmoteTimer && a.activeEmoteTimer > 0) {
                var _a_activeEmoteMax;
                var em = (0, _arenaRoster.getMobaEmoteById)(a.activeEmoteId);
                this.drawEmoteBubble(ctx, proj2.sx, proj2.sy - 22, em, a.activeEmoteTimer, (_a_activeEmoteMax = a.activeEmoteMax) != null ? _a_activeEmoteMax : 2.5);
            }
        }
        // 1d. Player Hero Floating Overhead Health Bar + CC Immune / Recall Progress Bar
        var pProj = this.projectToOverlay(this.px, (this.giantTimer > 0 ? 5.2 : 4.1) + this.py, this.pz, w, h);
        if (pProj) {
            var buffIcons = (this.blueBuffTimer > 0 ? '🔵' : '') + (this.redBuffTimer > 0 ? '🟠' : '') + (this.windChantTimer > 0 ? '🍃' : '') + (this.frozenTimer > 0 ? '❄️' : '');
            this.drawFloatingBar(ctx, pProj.sx, pProj.sy, 64, 7, this.lives, this.maxLives, '#22c55e', (this.heroDef.name + " " + this.lives + "/" + this.maxLives + " " + buffIcons).trim(), String(this.heroLevel), this.shieldTimer > 0 || this.windChantTimer > 0, this.playerTrailHp);
            if (this.ccImmuneTimer > 0) {
                this.drawCcCue(ctx, pProj.sx, pProj.sy - 20, '✨ CC IMMUNE', '#fde047');
            } else if (this.recallTimer > 0) {
                this.drawCcCue(ctx, pProj.sx, pProj.sy - 20, "\uD83C\uDF00 RECALLING " + this.recallTimer.toFixed(1) + "s", '#38bdf8');
            } else if (this.isSprinting) {
                this.drawCcCue(ctx, pProj.sx, pProj.sy - 19, "\uD83D\uDCA8 SPRINT " + Math.round(this.effectiveMlbbSpeed), '#84fab0');
            }
            if (this.playerEmoteId && this.playerEmoteTimer > 0) {
                var em1 = (0, _arenaRoster.getMobaEmoteById)(this.playerEmoteId);
                this.drawEmoteBubble(ctx, pProj.sx, pProj.sy - 24, em1, this.playerEmoteTimer, this.playerEmoteMax);
            }
        }
        // 1e. Floating Damage & Healing Numbers
        if (_storage.playerState.mobaSettings.damageText && this.floatingDmgNums.length > 0) {
            ctx.textAlign = 'center';
            for(var _iterator3 = _create_for_of_iterator_helper_loose(this.floatingDmgNums), _step3; !(_step3 = _iterator3()).done;){
                var dn = _step3.value;
                var proj3 = this.projectToOverlay(dn.wx, dn.wy, dn.wz, w, h);
                if (!proj3) continue;
                var alpha = Math.max(0, Math.min(1, dn.life / Math.max(0.05, dn.maxLife)));
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.font = dn.isCrit ? '900 14px system-ui, sans-serif' : '800 11.5px system-ui, sans-serif';
                ctx.fillStyle = 'rgba(9, 13, 22, 0.9)';
                ctx.fillText(dn.text, proj3.sx + 1.2, proj3.sy + 1.2);
                ctx.fillStyle = dn.color;
                ctx.fillText(dn.text, proj3.sx, proj3.sy);
                ctx.restore();
            }
        }
        // 2. 2D Tactical Minimap scaled to 264x264 (-132..+132)
        var isCompactViewport = w < 640 || h < 540;
        var ms = h < 460 ? 74 : w < 460 ? 84 : 110;
        var mx = w - ms - 12;
        var my = isCompactViewport ? 122 : 58;
        ctx.fillStyle = '#090d16';
        ctx.fillRect(mx + 3, my + 3, ms, ms);
        ctx.fillStyle = '#14532d';
        ctx.fillRect(mx, my, ms, ms);
        // Minimap Lanes
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mx + 6, my + ms - 6);
        ctx.lineTo(mx + 6, my + 6);
        ctx.lineTo(mx + ms - 6, my + 6);
        ctx.moveTo(mx + 6, my + ms - 6);
        ctx.lineTo(mx + ms - 6, my + 6);
        ctx.moveTo(mx + 6, my + ms - 6);
        ctx.lineTo(mx + ms - 6, my + ms - 6);
        ctx.lineTo(mx + ms - 6, my + 6);
        ctx.stroke();
        // River on Minimap
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(mx + 4, my + 4);
        ctx.lineTo(mx + ms - 4, my + ms - 4);
        ctx.stroke();
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(mx, my, ms, ms);
        var toM = function toM(val) {
            return (val + _LegendsArena3DWorld.MAP_HALF) / _LegendsArena3DWorld.MAP_SIZE * ms;
        };
        // Dynamic EXP (Purple) & Gold (Yellow) Lane Badges on Minimap
        var _this_laneAssign_expMarkerWorld = this.laneAssign.expMarkerWorld, exX = _this_laneAssign_expMarkerWorld[0], exZ = _this_laneAssign_expMarkerWorld[1];
        var _this_laneAssign_goldMarkerWorld = this.laneAssign.goldMarkerWorld, goX = _this_laneAssign_goldMarkerWorld[0], goZ = _this_laneAssign_goldMarkerWorld[1];
        ctx.font = '900 7px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#c084fc';
        ctx.fillText('EXP', mx + toM(exX), my + toM(exZ) + 2);
        ctx.fillStyle = '#fde047';
        ctx.fillText('GLD', mx + toM(goX), my + toM(goZ) + 2);
        // 4 Cyclone Eyes (Blue Diamonds)
        for(var _iterator4 = _create_for_of_iterator_helper_loose(this.cycloneEyes), _step4; !(_step4 = _iterator4()).done;){
            var ce = _step4.value;
            var cx = mx + toM(ce.x);
            var cy = my + toM(ce.z);
            ctx.fillStyle = ce.cd <= 0 ? '#38bdf8' : 'rgba(56, 189, 248, 0.35)';
            ctx.beginPath();
            ctx.moveTo(cx, cy - 3);
            ctx.lineTo(cx + 3, cy);
            ctx.lineTo(cx, cy + 3);
            ctx.lineTo(cx - 3, cy);
            ctx.closePath();
            ctx.fill();
        }
        // Jungle Camps, Buffs (with :XX respawn timers), Lithowanderer (Turquoise), Small Camps/Crabs (Yellow), Turtle/Lord (MM:SS)
        for(var _iterator5 = _create_for_of_iterator_helper_loose(this.jungleCamps), _step5; !(_step5 = _iterator5()).done;){
            var jc1 = _step5.value;
            if (jc1.isSplitChild) continue;
            var cx1 = mx + toM(jc1.alive ? jc1.x : jc1.homeX);
            var cy1 = my + toM(jc1.alive ? jc1.z : jc1.homeZ);
            var isBoss1 = jc1.campKind === 'lord' || jc1.campKind === 'turtle';
            var isBuff1 = jc1.campKind === 'blue_buff' || jc1.campKind === 'red_buff';
            if (jc1.alive) {
                ctx.fillStyle = jc1.campKind === 'blue_buff' ? '#c084fc' : jc1.campKind === 'red_buff' ? '#fb923c' : jc1.campKind === 'litho' ? '#2dd4bf' : isBoss1 ? jc1.campKind === 'lord' ? '#facc15' : '#10b981' : '#fde047';
                var rad = isBoss1 ? 4.4 : isBuff1 ? 3.4 : jc1.campKind === 'litho' ? 3.0 : 2.1;
                ctx.beginPath();
                ctx.arc(cx1, cy1, rad, 0, Math.PI * 2);
                ctx.fill();
                if (isBoss1 || isBuff1) {
                    ctx.strokeStyle = '#090d16';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            } else if (isBoss1 || isBuff1) {
                // Countdown timers for Respawning Buffs & Turtle/Lord
                ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
                ctx.fillRect(cx1 - 11, cy1 - 5, 22, 10);
                ctx.fillStyle = isBoss1 ? '#34d399' : jc1.campKind === 'blue_buff' ? '#d8b4fe' : '#fdba74';
                ctx.font = '900 7px system-ui, sans-serif';
                ctx.textAlign = 'center';
                var sec = Math.max(0, Math.ceil(jc1.respawnTimer));
                var txt = isBoss1 ? (0, _arenaRoster.formatMatchClock)(sec) : ":" + String(sec).padStart(2, '0');
                ctx.fillText(txt, cx1, cy1 + 2.5);
            }
        }
        // Turrets
        for(var _iterator6 = _create_for_of_iterator_helper_loose(this.turrets), _step6; !(_step6 = _iterator6()).done;){
            var t1 = _step6.value;
            if (!t1.alive) continue;
            ctx.fillStyle = t1.team === 'blue' ? '#38bdf8' : '#f43f5e';
            var sz = t1.isNexus ? 6.5 : 4.2;
            ctx.fillRect(mx + toM(t1.x) - sz / 2, my + toM(t1.z) - sz / 2, sz, sz);
        }
        // Heroes on Minimap
        for(var _iterator7 = _create_for_of_iterator_helper_loose(this.actors), _step7; !(_step7 = _iterator7()).done;){
            var a1 = _step7.value;
            if (!a1.alive || a1.kind !== 'hero' && a1.kind !== 'lord') continue;
            ctx.fillStyle = a1.kind === 'lord' ? '#a78bfa' : a1.team === 'blue' ? '#60a5fa' : '#fb7185';
            ctx.beginPath();
            ctx.arc(mx + toM(a1.x), my + toM(a1.z), a1.kind === 'lord' ? 4 : 2.8, 0, Math.PI * 2);
            ctx.fill();
        }
        // Tactical Ping Rings on Minimap
        for(var _iterator8 = _create_for_of_iterator_helper_loose(this.minimapPings), _step8; !(_step8 = _iterator8()).done;){
            var p = _step8.value;
            var pxm = mx + p.nx * ms;
            var pym = my + p.nz * ms;
            var pulse = 4 + (4.5 - p.ttl) * 8 % 9;
            ctx.strokeStyle = p.kind === 'retreat' ? '#f43f5e' : p.kind === 'turtle' ? '#34d399' : '#facc15';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.arc(pxm, pym, pulse, 0, Math.PI * 2);
            ctx.stroke();
        }
        // Player Dot
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(mx + toM(this.px), my + toM(this.pz), 4.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Compact Top Combat Match Strip (centered cleanly below top HP bar, clearing #inGameHud & minimap)
        var pillW = Math.min(isCompactViewport ? w - 210 : w - ms - 200, 350);
        var barX = Math.max(isCompactViewport ? 120 : 152, (w - pillW) / 2);
        var barY = isCompactViewport ? 40 : 48;
        ctx.fillStyle = 'rgba(9, 13, 22, 0.88)';
        ctx.beginPath();
        ctx.roundRect(barX, barY, pillW, 28, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.font = w < 440 ? '800 9.5px system-ui, sans-serif' : '800 10.5px system-ui, sans-serif';
        ctx.textAlign = 'center';
        var mm = String(Math.floor(this.matchElapsed / 60)).padStart(2, '0');
        var ss = String(Math.floor(this.matchElapsed % 60)).padStart(2, '0');
        ctx.fillText(this.heroDef.icon + " Lv." + this.heroLevel + " " + this.heroDef.name + " \xb7 " + this.kills + "/" + this.deaths + " K/D \xb7 ❤️" + this.lives + "/" + this.maxLives + " \xb7 " + mm + ":" + ss, barX + pillW / 2, barY + 18, pillW - 16);
        // Killfeed Toast (always centered cleanly, auto-fitted inside pill)
        if (this.killfeedTimer > 0 && this.killfeedText) {
            ctx.fillStyle = 'rgba(9, 13, 22, 0.92)';
            var kw = Math.min(isCompactViewport ? w - 180 : w - 48, 410);
            var kx = Math.max(10, (w - kw) / 2);
            var ky = isCompactViewport ? 112 : 84;
            ctx.beginPath();
            ctx.roundRect(kx, ky, kw, 26, 8);
            ctx.fill();
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#fef08a';
            ctx.font = '800 10.5px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.killfeedText, kx + kw / 2, ky + 17, kw - 18);
        }
        ctx.textAlign = 'left';
    };
    return LegendsArena3D;
}(_LegendsArena3DCombat.LegendsArena3DCombat);

});

})(window.ArcadeMod);
