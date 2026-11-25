(function(ArcadeMod){
// === MODULE: src/games/legends-arena/LegendsArena3DWorld ===
ArcadeMod.define("src/games/legends-arena/LegendsArena3DWorld", function(require, module, exports) {
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
    get AMBUSH_BUSHES () {
        return AMBUSH_BUSHES;
    },
    get BEACON_SPOTS () {
        return BEACON_SPOTS;
    },
    get BLUE_BASE_X () {
        return BLUE_BASE_X;
    },
    get BLUE_BASE_Z () {
        return BLUE_BASE_Z;
    },
    get LegendsArena3DWorld () {
        return LegendsArena3DWorld;
    },
    get MAP_HALF () {
        return MAP_HALF;
    },
    get MAP_SIZE () {
        return MAP_SIZE;
    },
    get PLAY_LIMIT () {
        return PLAY_LIMIT;
    },
    get RED_BASE_X () {
        return RED_BASE_X;
    },
    get RED_BASE_Z () {
        return RED_BASE_Z;
    },
    get _camFwd () {
        return _camFwd;
    },
    get _camRight () {
        return _camRight;
    },
    get _mobaDesired () {
        return _mobaDesired;
    },
    get _mobaLook () {
        return _mobaLook;
    },
    get _mobaNdc () {
        return _mobaNdc;
    },
    get _mobaProj () {
        return _mobaProj;
    },
    get _mobaRay () {
        return _mobaRay;
    },
    get _worldUp () {
        return _worldUp;
    },
    get applyMobaSpeedSoftCap () {
        return applyMobaSpeedSoftCap;
    },
    get disposeObjectTree () {
        return disposeObjectTree;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _arenaRoster = require("../../core/arenaRoster");
var _audio = require("../../core/audio");
var _runtimeBridge = require("../../core/runtimeBridge");
var _storage = require("../../core/storage");
var _types = require("../../core/types");
var _viewport = require("../../core/viewport");
var _mobaElementalVfx = require("./mobaElementalVfx");
var _threeShared = require("../../core/threeShared");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
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
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var MAP_SIZE = 264;
var MAP_HALF = MAP_SIZE / 2; // 132
var PLAY_LIMIT = 124;
var BLUE_BASE_X = -108;
var BLUE_BASE_Z = 108;
var RED_BASE_X = 108;
var RED_BASE_Z = -108;
var AMBUSH_BUSHES = [
    [
        -62,
        0,
        9.5
    ],
    [
        0,
        62,
        9.5
    ],
    [
        62,
        0,
        9.5
    ],
    [
        0,
        -62,
        9.5
    ],
    [
        -92,
        -16,
        8.5
    ],
    [
        16,
        92,
        8.5
    ],
    [
        -16,
        -92,
        8.5
    ],
    [
        92,
        16,
        8.5
    ]
];
var BEACON_SPOTS = [
    [
        -54,
        -54
    ],
    [
        54,
        54
    ],
    [
        -66,
        26
    ],
    [
        26,
        -66
    ]
];
var _mobaDesired = new _three.Vector3();
var _mobaLook = new _three.Vector3();
var _mobaRay = new _three.Raycaster();
var _mobaNdc = new _three.Vector2();
var _mobaProj = new _three.Vector3();
var _camFwd = new _three.Vector3();
var _camRight = new _three.Vector3();
var _worldUp = new _three.Vector3(0, 1, 0);
function disposeObjectTree(root) {
    root.traverse(function(obj) {
        var _m_geometry_userData;
        var m = obj;
        if (m.geometry && !((_m_geometry_userData = m.geometry.userData) == null ? void 0 : _m_geometry_userData.noDispose)) m.geometry.dispose();
        var mats = Array.isArray(m.material) ? m.material : m.material ? [
            m.material
        ] : [];
        for(var _iterator = _create_for_of_iterator_helper_loose(mats), _step; !(_step = _iterator()).done;){
            var mat = _step.value;
            var _mat_userData;
            if (mat && !((_mat_userData = mat.userData) == null ? void 0 : _mat_userData.noDispose)) mat.dispose();
        }
    });
}
function applyMobaSpeedSoftCap(rawMlbbSpeed) {
    if (rawMlbbSpeed <= 415) return rawMlbbSpeed;
    if (rawMlbbSpeed <= 490) return 415 + (rawMlbbSpeed - 415) * 0.8;
    return 475 + (rawMlbbSpeed - 490) * 0.5;
}
var LegendsArena3DWorld = /*#__PURE__*/ function() {
    "use strict";
    function LegendsArena3DWorld(container, diff, lvl, gameIdx, heroId) {
        var _this = this;
        if (gameIdx === void 0) gameIdx = 25;
        if (heroId === void 0) heroId = _storage.playerState.selectedMobaHero;
        var _MOBA_SPELLS_find, _playerState_mobaSettings_mapVariantOverride, _skin_bodyShift, _skin_cloakShift, _skin_bladeShift, _playerState_mobaEmblemLevels_embId, _ref, _ROLE_BUILD_PRESETS_this_heroDef_role;
        this.score = 0;
        this.lives = 175;
        this.maxLives = 175;
        this.playerTrailHp = 175;
        this.playerLastHp = 175;
        this.playerTrailHold = 0;
        this.isPaused = false;
        this.gameOver = false;
        this.isRunning = false;
        this.heroBaseElement = 'steel';
        this.heroBodyColor = 0x2563eb;
        this.heroCloakColor = 0x1e3a8a;
        this.heroBladeColor = 0x38bdf8;
        this.px = BLUE_BASE_X + 6;
        this.py = 0;
        this.pz = BLUE_BASE_Z - 6;
        this.pYaw = -Math.PI / 4;
        this.moveX = 0;
        this.moveZ = 0;
        this.tapTarget = null;
        this.nextActorId = 1;
        this.lockedEnemyId = null;
        // Animation, Sprint, Stealth, Camera Shake, Physics & Talents
        this.idleTimer = 0;
        this.walkPhase = 0;
        this.castAnimTimer = 0;
        this.cameraShake = 0;
        this.effectiveMlbbSpeed = 260;
        this.isSprinting = false;
        this.bushRevealTimer = 0;
        this.bushStealthApplied = false;
        this.ccImmuneTimer = 0;
        this.slowImmuneTimer = 0;
        this.sprintBoostTimer = 0;
        this.vengeanceTimer = 0;
        this.untargetableTimer = 0;
        this.telegraphSlot = null;
        this.telegraphAutoTimer = 0;
        this.activeSkillAim = null;
        this.telegraphCancelled = false;
        this.activeMotion = null;
        this.healingSprings = [];
        this.activeUltSetpieces = [];
        this.floatingDmgNums = [];
        this.keystoneT3 = '';
        this.braveSmiteCd = 0;
        this.weaknessFinderCd = 0;
        this.lethalIgnitionHits = 0;
        this.lethalIgnitionWindow = 0;
        this.lethalIgnitionCd = 0;
        this.customBuildIds = [];
        this.activePresetIdx = 0;
        this.prioritizedItemId = null;
        this.bossPhase = 'turtle';
        this.currentLordStage = 0;
        this.turtleKills = 0;
        this.turtleBlessingTimer = 0;
        this.turtleHealAcc = 0;
        this.crabAuraTimer = 0;
        this.crabAuraAcc = 0;
        this.walkieGrassTimer = 0;
        this.homeguardTimer = 0;
        this.junglerStacks = 0;
        this.roamGold = 0;
        this.roamGoldAcc = 0;
        this.flyingCloudCd = 0;
        this.fountainLaserCd = 0;
        this.lordChargeAvailable = false;
        this.lordAuraTickAcc = 0;
        this.superMinionLanes = new Set();
        this.announcedMilestones = new Set();
        this.laneMarkerMeshes = [];
        this.purpleShortcutWalls = [];
        this.cycloneEyes = [];
        this.riverWards = [];
        this.minimapPings = [];
        this.nextPingId = 1;
        this.tacticalPingText = '';
        this.tacticalPingTimer = 0;
        this.gold = 300;
        this.goldTrickleAcc = 0;
        this.heroLevel = 1;
        this.heroXp = 0;
        this.heroXpNext = 100;
        this.kills = 0;
        this.deaths = 0;
        this.jungleClears = 0;
        this.atkDmg = 34;
        this.atkRange = 5.5;
        this.moveSpd = 12.2;
        this.isRanged = false;
        // 6-Slot In-Battle Equipment & Boot Blessing
        this.equippedItemIds = [];
        this.blessingId = null;
        // Player Timers & Buffs
        this.shieldTimer = 0;
        this.inspireTimer = 0;
        this.hasteTimer = 0;
        this.stealthTimer = 0;
        this.giantTimer = 0;
        this.blueBuffTimer = 0;
        this.redBuffTimer = 0;
        this.regenHoTTimer = 0;
        this.recallTimer = 0;
        this.windChantTimer = 0;
        this.frozenTimer = 0;
        this.cdItemActive = 0;
        this.maxCdItemActive = 20.0;
        this.immortalityCd = 0;
        this.lifelineCd = 0;
        this.divineJusticePrimed = false;
        this.outOfCombatSec = 5.0;
        this.burningSoulTick = 0;
        this.regenTickAcc = 0;
        this.inBush = false;
        this.basicCd = 0;
        this.cdSkill1 = 0;
        this.cdSkill2 = 0;
        this.cdSkill3 = 0;
        this.cdSkill4 = 0;
        this.cdSpell = 0;
        this.cdRegen = 0;
        this.cdEmote = 0;
        this.maxCdEmote = 3.0;
        this.playerEmoteId = null;
        this.playerEmoteTimer = 0;
        this.playerEmoteMax = 2.6;
        this.maxCdSkill1 = 3.0;
        this.maxCdSkill2 = 4.8;
        this.maxCdSkill3 = 8.5;
        this.maxCdSkill4 = 7.0;
        this.maxCdSpell = 10.0;
        this.maxCdRegen = 14.0;
        // Passive Tracking
        this.hitCounter = 0;
        this.passiveStacks = 0;
        this.reviveCheatCd = 0;
        this.beaconIdx = 0;
        this.matchElapsed = 0;
        this.waveTimer = _arenaRoster.MLBB_TIMERS.FIRST_WAVE_SEC;
        this.hudSyncTimer = 0;
        this.killfeedText = '';
        this.killfeedTimer = 0;
        this.fxObjs = [];
        this.turrets = [];
        this.actors = [];
        this.jungleCamps = [];
        this.bolts = [];
        this.lastTime = 0;
        this.emblemCdMult = 1.0;
        this.onCanvasTap = function(e) {
            if (_this.gameOver || _this.isPaused) return;
            if (_this.activeSkillAim) return;
            var pt = (0, _viewport.mapClientToStage)(e.clientX, e.clientY);
            var vp = (0, _viewport.getViewportSize)();
            _mobaNdc.set(pt.x / Math.max(1, vp.width) * 2 - 1, -(pt.y / Math.max(1, vp.height)) * 2 + 1);
            _mobaRay.setFromCamera(_mobaNdc, _this.three.camera);
            if (Math.abs(_mobaRay.ray.direction.y) > 0.01) {
                var t = -_mobaRay.ray.origin.y / _mobaRay.ray.direction.y;
                if (t > 0 && t < 320) {
                    var hitX = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, _mobaRay.ray.origin.x + _mobaRay.ray.direction.x * t));
                    var hitZ = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, _mobaRay.ray.origin.z + _mobaRay.ray.direction.z * t));
                    _this.tapTarget = {
                        x: hitX,
                        z: hitZ
                    };
                }
            }
        };
        this.container = container;
        this.diff = diff;
        this.level = lvl;
        this.gameIdx = gameIdx;
        this.heroDef = _arenaRoster.MOBA_HEROES[heroId] || _arenaRoster.MOBA_HEROES[0];
        this.heroBaseElement = (0, _arenaRoster.getHeroBaseElementTheme)(this.heroDef);
        this.combatKit = (0, _arenaRoster.getHeroCombatKit)(this.heroDef);
        this.spellDef = (_MOBA_SPELLS_find = _arenaRoster.MOBA_SPELLS.find(function(s) {
            return s.id === _storage.playerState.selectedMobaSpell;
        })) != null ? _MOBA_SPELLS_find : _arenaRoster.MOBA_SPELLS[0];
        this.mobaMode = _storage.playerState.selectedMobaMode;
        // Resolve 2026 Annual Map Variant & Dynamic EXP / Gold Lane Assignment
        this.activeMapVariant = (0, _arenaRoster.resolveMatchMapVariant)((_playerState_mobaSettings_mapVariantOverride = _storage.playerState.mobaSettings.mapVariantOverride) != null ? _playerState_mobaSettings_mapVariantOverride : 'random');
        var firstPit = Math.random() < 0.5 ? 'upper' : 'lower';
        this.laneAssign = (0, _arenaRoster.createDynamicLaneAssignment)(firstPit);
        this.activeBossPit = firstPit;
        var skin = (0, _arenaRoster.getSkinVariantById)(_storage.playerState.mobaEquippedSkins[this.heroDef.id]);
        this.heroBodyColor = (_skin_bodyShift = skin.bodyShift) != null ? _skin_bodyShift : this.heroDef.bodyColor;
        this.heroCloakColor = (_skin_cloakShift = skin.cloakShift) != null ? _skin_cloakShift : this.heroDef.cloakColor;
        this.heroBladeColor = (_skin_bladeShift = skin.bladeShift) != null ? _skin_bladeShift : this.heroDef.bladeColor;
        var embId = _storage.playerState.selectedMobaEmblem;
        var embLv = (_playerState_mobaEmblemLevels_embId = _storage.playerState.mobaEmblemLevels[embId]) != null ? _playerState_mobaEmblemLevels_embId : 1;
        var embTalents = _storage.playerState.mobaEmblemTalents[embId];
        this.keystoneT3 = (_ref = embTalents == null ? void 0 : embTalents.t3) != null ? _ref : '';
        this.emblemBonus = (0, _arenaRoster.getMobaEmblemBonus)(embId, embLv, embTalents);
        this.emblemCdMult = 1 - this.emblemBonus.cdReduction;
        var savedCustom = _storage.playerState.mobaCustomBuilds[this.heroDef.id];
        var presets = (_ROLE_BUILD_PRESETS_this_heroDef_role = _arenaRoster.ROLE_BUILD_PRESETS[this.heroDef.role]) != null ? _ROLE_BUILD_PRESETS_this_heroDef_role : _arenaRoster.ROLE_BUILD_PRESETS.Fighter;
        this.customBuildIds = Array.isArray(savedCustom) && savedCustom.length > 0 ? [].concat(savedCustom) : [].concat(presets[0].items);
        this.isRanged = this.heroDef.isRanged;
        this.scaler = _types.difficultyScalers[diff] || _types.difficultyScalers.easy;
        this.recomputeStats(true);
        _storage.playerState.sessionCoins = 0;
        _storage.playerState.sessionExp = 0;
    }
    var _proto = LegendsArena3DWorld.prototype;
    _proto.recomputeStats = function recomputeStats(resetFullHp) {
        if (resetFullHp === void 0) resetFullHp = false;
        var oldMax = Math.max(1, this.maxLives);
        var hpRatio = resetFullHp ? 1 : Math.min(1, Math.max(0.05, this.lives / oldMax));
        this.computedStats = (0, _arenaRoster.computeMobaEquippedStats)(this.heroDef, this.emblemBonus, this.equippedItemIds, this.blessingId, this.blueBuffTimer > 0, this.redBuffTimer > 0, this.heroLevel);
        this.maxLives = this.computedStats.maxHp;
        this.lives = resetFullHp ? this.maxLives : Math.min(this.maxLives, Math.max(1, Math.round(this.maxLives * hpRatio)));
        if (resetFullHp) {
            this.playerTrailHp = this.lives;
            this.playerLastHp = this.lives;
            this.playerTrailHold = 0;
        }
        this.atkDmg = this.computedStats.atkDmg;
        this.atkRange = this.computedStats.atkRange;
        this.moveSpd = this.computedStats.moveSpeed;
        if (this.computedStats.activeSkill) {
            this.maxCdItemActive = this.computedStats.activeSkill.cdSec;
        }
        if (this.isRunning) {
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
            this.pushMobaHudSnapshot();
        }
    };
    _proto.grantHeroXp = function grantHeroXp(amt) {
        if (this.heroLevel >= 15 || amt <= 0) return;
        this.heroXp += amt;
        var leveled = false;
        while(this.heroLevel < 15 && this.heroXp >= this.heroXpNext){
            this.heroXp -= this.heroXpNext;
            this.heroLevel += 1;
            this.heroXpNext = 90 + this.heroLevel * 35;
            leveled = true;
        }
        if (leveled) {
            this.recomputeStats(false);
            this.lives = Math.min(this.maxLives, this.lives + Math.round(this.maxLives * 0.12));
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
            _audio.ArcadeAudio.play('levelup');
            this.spawnVfx('ring', this.px, this.pz, 4.4, 0xfacc15);
            this.showKillfeed("⬆️ LEVEL UP! " + this.heroDef.name + " Lv." + this.heroLevel);
        }
    };
    _proto.showKillfeed = function showKillfeed(msg) {
        this.killfeedText = msg;
        this.killfeedTimer = 3.0;
    };
    _proto.getCameraOffsets = function getCameraOffsets() {
        var h = _storage.playerState.mobaSettings.cameraHeight;
        if (h === 'low') return {
            dx: -11,
            y: 21,
            dz: 17
        };
        if (h === 'medium') return {
            dx: -13,
            y: 26,
            dz: 21
        };
        return {
            dx: -15,
            y: 31,
            dz: 25
        };
    };
    _proto.start = function start() {
        var _this = this;
        var _ref;
        var _MOBA_MODES_find;
        this.three = new _threeShared.StudioThreeContext(this.container, {
            skyColor: 0x38bdf8,
            fogColor: 0x7dd3fc,
            fogNear: 92,
            fogFar: 255,
            keyColor: 0xfffbeb,
            keyIntensity: 2.15,
            hemiSky: 0xbae6fd,
            hemiGround: 0x166534,
            hemiIntensity: 1.05,
            fov: 46,
            far: 340
        });
        this.three.renderer.toneMapping = _three.NoToneMapping;
        _storage.playerState.mobaMatchesPlayed++;
        (0, _storage.persistMobaStats)();
        (0, _storage.recordMobaDailyEvent)('match');
        this.buildArena();
        this.buildJungleCamps();
        this.spawnPlayer();
        this.spawnTeamHeroes();
        this.snapCamera();
        var trialTag = _storage.playerState.mobaTrialHeroId !== null ? ' (TRIAL)' : '';
        var modeName = (_ref = (_MOBA_MODES_find = _arenaRoster.MOBA_MODES.find(function(m) {
            return m.id === _this.mobaMode;
        })) == null ? void 0 : _MOBA_MODES_find.title) != null ? _ref : this.mobaMode.toUpperCase();
        this.showKillfeed("" + modeName + trialTag + " \xb7 " + this.activeMapVariant.icon + " " + this.activeMapVariant.name + " \xb7 EXP " + this.laneAssign.expLaneSide.toUpperCase() + " / GOLD " + this.laneAssign.goldLaneSide.toUpperCase());
        this.three.renderer.domElement.addEventListener('pointerdown', this.onCanvasTap);
        this.three.prewarm();
        this.isRunning = true;
        this.lastTime = performance.now();
        (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
        this.pushMobaHudSnapshot();
        this.tick();
    };
    _proto.snapCamera = function snapCamera() {
        var cam = this.getCameraOffsets();
        this.three.camera.position.set(this.px + cam.dx, cam.y, this.pz + cam.dz);
        this.three.camera.lookAt(this.px + 2.6, 0.9, this.pz - 2.6);
    };
    _proto.stop = function stop() {
        var _this_three_renderer_domElement, _this_three_renderer, _this_three, _this_three1;
        this.isRunning = false;
        _storage.playerState.mobaTrialHeroId = null;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.healingSprings), _step; !(_step = _iterator()).done;){
            var sp = _step.value;
            var _this_three_scene, _this_three2;
            disposeObjectTree(sp.mesh);
            (_this_three2 = this.three) == null ? void 0 : (_this_three_scene = _this_three2.scene) == null ? void 0 : _this_three_scene.remove(sp.mesh);
        }
        this.healingSprings = [];
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.activeUltSetpieces), _step1; !(_step1 = _iterator1()).done;){
            var up = _step1.value;
            var _this_three_scene1, _this_three3;
            disposeObjectTree(up.group);
            (_this_three3 = this.three) == null ? void 0 : (_this_three_scene1 = _this_three3.scene) == null ? void 0 : _this_three_scene1.remove(up.group);
        }
        this.activeUltSetpieces = [];
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.riverWards), _step2; !(_step2 = _iterator2()).done;){
            var rw = _step2.value;
            var _this_three_scene2, _this_three4;
            disposeObjectTree(rw.mesh);
            (_this_three4 = this.three) == null ? void 0 : (_this_three_scene2 = _this_three4.scene) == null ? void 0 : _this_three_scene2.remove(rw.mesh);
        }
        this.riverWards = [];
        (0, _runtimeBridge.updateMobaHud)(null);
        this.releaseInputs();
        (_this_three = this.three) == null ? void 0 : (_this_three_renderer = _this_three.renderer) == null ? void 0 : (_this_three_renderer_domElement = _this_three_renderer.domElement) == null ? void 0 : _this_three_renderer_domElement.removeEventListener('pointerdown', this.onCanvasTap);
        (_this_three1 = this.three) == null ? void 0 : _this_three1.dispose();
    };
    _proto.releaseInputs = function releaseInputs() {
        this.moveX = 0;
        this.moveZ = 0;
        this.tapTarget = null;
        this.cancelSkillAim();
    };
    _proto.pause = function pause() {
        var _this_three;
        this.isPaused = true;
        this.releaseInputs();
        (_this_three = this.three) == null ? void 0 : _this_three.cancelPendingFrame();
    };
    _proto.resume = function resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
        if (this.isRunning && !this.gameOver) {
            var _this_three;
            (_this_three = this.three) == null ? void 0 : _this_three.scheduleNextFrame(this.tick);
        }
    };
    _proto.resize = function resize() {
        var _this_three;
        (_this_three = this.three) == null ? void 0 : _this_three.resize();
    };
    _proto.buildArena = function buildArena() {
        var _this = this;
        var tex = this.three.createCanvasTexture(1024, function(ctx, s) {
            // Lush jungle floor checkerboard
            ctx.fillStyle = '#15803d';
            ctx.fillRect(0, 0, s, s);
            ctx.fillStyle = '#166534';
            for(var gx = 0; gx < s; gx += 64){
                for(var gy = 0; gy < s; gy += 64){
                    if ((gx + gy) / 64 % 2 === 0) ctx.fillRect(gx, gy, 64, 64);
                }
            }
            // Jungle clearing glades
            ctx.fillStyle = '#14532d';
            for(var _i = 0, _iter = [
                [
                    s * 0.25,
                    s * 0.62
                ],
                [
                    s * 0.38,
                    s * 0.75
                ],
                [
                    s * 0.75,
                    s * 0.38
                ],
                [
                    s * 0.62,
                    s * 0.25
                ]
            ]; _i < _iter.length; _i++){
                var _iter__i = _iter[_i], cx = _iter__i[0], cy = _iter__i[1];
                ctx.beginPath();
                ctx.arc(cx, cy, 46, 0, Math.PI * 2);
                ctx.fill();
            }
            // 3 Wide Paved Lanes (EXP Top-Left, Mid Diagonal, Gold Bottom-Right)
            var m = 86;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#0b0f19';
            ctx.lineWidth = 74;
            ctx.beginPath();
            ctx.moveTo(m, s - m);
            ctx.lineTo(m, m);
            ctx.lineTo(s - m, m);
            ctx.moveTo(m, s - m);
            ctx.lineTo(s - m, m);
            ctx.moveTo(m, s - m);
            ctx.lineTo(s - m, s - m);
            ctx.lineTo(s - m, m);
            ctx.stroke();
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 60;
            ctx.beginPath();
            ctx.moveTo(m, s - m);
            ctx.lineTo(m, m);
            ctx.lineTo(s - m, m);
            ctx.moveTo(m, s - m);
            ctx.lineTo(s - m, m);
            ctx.moveTo(m, s - m);
            ctx.lineTo(s - m, s - m);
            ctx.lineTo(s - m, m);
            ctx.stroke();
            // Diagonal River dividing Top-Left to Bottom-Right
            ctx.strokeStyle = '#0b0f19';
            ctx.lineWidth = 52;
            ctx.beginPath();
            ctx.moveTo(32, 32);
            ctx.lineTo(s - 32, s - 32);
            ctx.stroke();
            ctx.strokeStyle = '#0ea5e9';
            ctx.lineWidth = 38;
            ctx.beginPath();
            ctx.moveTo(32, 32);
            ctx.lineTo(s - 32, s - 32);
            ctx.stroke();
            // Turtle & Lord Pits on the River
            for(var _i1 = 0, _iter1 = [
                [
                    s * 0.365,
                    s * 0.365,
                    '#4c1d95'
                ],
                [
                    s * 0.635,
                    s * 0.635,
                    '#065f46'
                ]
            ]; _i1 < _iter1.length; _i1++){
                var _iter__i1 = _iter1[_i1], px = _iter__i1[0], py = _iter__i1[1], fill = _iter__i1[2];
                ctx.fillStyle = fill;
                ctx.beginPath();
                ctx.arc(px, py, 44, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 5;
                ctx.stroke();
            }
            // Dynamic EXP Lane (Purple Scroll) & Gold Lane (Yellow Coin) Floor Emblems
            var toTex = function toTex(wVal) {
                return (wVal + MAP_HALF) / MAP_SIZE * s;
            };
            var _this_laneAssign_expMarkerWorld = _this.laneAssign.expMarkerWorld, exX = _this_laneAssign_expMarkerWorld[0], exZ = _this_laneAssign_expMarkerWorld[1];
            var _this_laneAssign_goldMarkerWorld = _this.laneAssign.goldMarkerWorld, goX = _this_laneAssign_goldMarkerWorld[0], goZ = _this_laneAssign_goldMarkerWorld[1];
            ctx.save();
            ctx.fillStyle = 'rgba(168, 85, 247, 0.32)';
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(toTex(exX), toTex(exZ), 28, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#f3e8ff';
            ctx.font = '900 18px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('EXP', toTex(exX), toTex(exZ) + 6);
            ctx.fillStyle = 'rgba(250, 204, 21, 0.32)';
            ctx.strokeStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(toTex(goX), toTex(goZ), 28, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fef9c3';
            ctx.fillText('GOLD', toTex(goX), toTex(goZ) + 6);
            ctx.restore();
        }, 1, 1);
        var floor = new _three.Mesh(new _three.PlaneGeometry(MAP_SIZE, MAP_SIZE), new _three.MeshToonMaterial({
            map: tex
        }));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.three.scene.add(floor);
        var outerVoid = new _three.Mesh(new _three.PlaneGeometry(520, 520), (0, _threeShared.createToonMaterial)(0x0c4a6e));
        outerVoid.rotation.x = -Math.PI / 2;
        outerVoid.position.y = -0.6;
        this.three.scene.add(outerVoid);
        // Blue & Red Base Healing Fountains
        var fountainRing = new _three.Mesh(new _three.RingGeometry(4.5, 9.6, 32), new _three.MeshBasicMaterial({
            color: 0x34d399,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.58
        }));
        fountainRing.rotation.x = -Math.PI / 2;
        fountainRing.position.set(BLUE_BASE_X, 0.1, BLUE_BASE_Z);
        this.three.scene.add(fountainRing);
        var redFountainRing = new _three.Mesh(new _three.RingGeometry(4.5, 9.6, 32), new _three.MeshBasicMaterial({
            color: 0xf43f5e,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.52
        }));
        redFountainRing.rotation.x = -Math.PI / 2;
        redFountainRing.position.set(RED_BASE_X, 0.1, RED_BASE_Z);
        this.three.scene.add(redFountainRing);
        // 3D Dynamic Lane Floor Rings (EXP Purple Scroll & Gold Yellow Coin, fade after 5:00)
        var expRing = new _three.Mesh(new _three.RingGeometry(3.2, 4.4, 24), new _three.MeshBasicMaterial({
            color: 0xa855f7,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.72
        }));
        expRing.rotation.x = -Math.PI / 2;
        expRing.position.set(this.laneAssign.expMarkerWorld[0], 0.14, this.laneAssign.expMarkerWorld[1]);
        this.three.scene.add(expRing);
        var goldRing = new _three.Mesh(new _three.RingGeometry(3.2, 4.4, 24), new _three.MeshBasicMaterial({
            color: 0xfacc15,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.72
        }));
        goldRing.rotation.x = -Math.PI / 2;
        goldRing.position.set(this.laneAssign.goldMarkerWorld[0], 0.14, this.laneAssign.goldMarkerWorld[1]);
        this.three.scene.add(goldRing);
        this.laneMarkerMeshes.push(expRing, goldRing);
        // Map-wide Teleport Beacons
        for(var _iterator = _create_for_of_iterator_helper_loose(BEACON_SPOTS), _step; !(_step = _iterator()).done;){
            var _step_value = _step.value, bx = _step_value[0], bz = _step_value[1];
            var ped = new _three.Mesh(new _three.CylinderGeometry(1.4, 1.8, 0.6, 8), (0, _threeShared.createToonMaterial)(0x0284c7, {
                emissive: 0x38bdf8,
                emissiveIntensity: 0.45
            }));
            ped.position.set(bx, 0.3, bz);
            this.three.scene.add(ped);
        }
        // 20 Turrets: Nexus Cores + Outer(T1)/Inner(T2)/Base(T3) across Top(0), Mid(1), Bot(2)
        var towerSpecs = [
            [
                BLUE_BASE_X - 4,
                BLUE_BASE_Z + 4,
                'blue',
                true,
                1,
                0
            ],
            [
                RED_BASE_X + 4,
                RED_BASE_Z - 4,
                'red',
                true,
                1,
                0
            ],
            // Blue Top Lane (0): Base T3 -> Inner T2 -> Outer T1
            [
                -108,
                36,
                'blue',
                false,
                0,
                3
            ],
            [
                -108,
                -28,
                'blue',
                false,
                0,
                2
            ],
            [
                -90,
                -86,
                'blue',
                false,
                0,
                1
            ],
            // Blue Mid Lane (1): Outer T1 -> Inner T2 -> Base T3
            [
                -34,
                34,
                'blue',
                false,
                1,
                1
            ],
            [
                -62,
                62,
                'blue',
                false,
                1,
                2
            ],
            [
                -86,
                86,
                'blue',
                false,
                1,
                3
            ],
            // Blue Bot Lane (2): Base T3 -> Inner T2 -> Outer T1
            [
                -36,
                108,
                'blue',
                false,
                2,
                3
            ],
            [
                28,
                108,
                'blue',
                false,
                2,
                2
            ],
            [
                86,
                90,
                'blue',
                false,
                2,
                1
            ],
            // Red Top Lane (0): Inner T2, Base T3, Outer T1
            [
                -28,
                -108,
                'red',
                false,
                0,
                2
            ],
            [
                36,
                -108,
                'red',
                false,
                0,
                3
            ],
            [
                -86,
                -104,
                'red',
                false,
                0,
                1
            ],
            // Red Mid Lane (1): Outer T1, Inner T2, Base T3
            [
                34,
                -34,
                'red',
                false,
                1,
                1
            ],
            [
                62,
                -62,
                'red',
                false,
                1,
                2
            ],
            [
                86,
                -86,
                'red',
                false,
                1,
                3
            ],
            // Red Bot Lane (2): Base T3, Inner T2, Outer T1
            [
                108,
                -36,
                'red',
                false,
                2,
                3
            ],
            [
                108,
                28,
                'red',
                false,
                2,
                2
            ],
            [
                104,
                86,
                'red',
                false,
                2,
                1
            ]
        ];
        var isGoldenTurretVariant = this.activeMapVariant.id === 'golden_turret';
        for(var _iterator1 = _create_for_of_iterator_helper_loose(towerSpecs), _step1; !(_step1 = _iterator1()).done;){
            var _step_value1 = _step1.value, x = _step_value1[0], z = _step_value1[1], team = _step_value1[2], isNexus = _step_value1[3], lane = _step_value1[4], tier = _step_value1[5];
            var g = new _three.Group();
            var baseMat = (0, _threeShared.createToonMaterial)(team === 'blue' ? 0x2563eb : 0xdc2626);
            var gemMat = (0, _threeShared.createToonMaterial)(team === 'blue' ? 0x38bdf8 : 0xff6b6b, {
                emissive: team === 'blue' ? 0x38bdf8 : 0xff4757,
                emissiveIntensity: 0.78
            });
            var r = isNexus ? 3.2 : 1.7;
            var h = isNexus ? 6.8 : 5.0;
            var pillar = new _three.Mesh(new _three.CylinderGeometry(r * 0.72, r, h, 8), baseMat);
            pillar.position.y = h / 2;
            pillar.castShadow = true;
            (0, _threeShared.addInkOutline)(pillar, 1.07);
            var gem = new _three.Mesh(new _three.OctahedronGeometry(isNexus ? 1.55 : 0.9, 0), gemMat);
            gem.position.y = h + (isNexus ? 1.5 : 1.0);
            (0, _threeShared.addInkOutline)(gem, 1.09);
            g.add(pillar, gem);
            // Golden Turret Annual Map Variant: golden crown ring on T2 & T3 + +25% HP
            if (isGoldenTurretVariant && (tier === 2 || tier === 3)) {
                var goldTrim = new _three.Mesh(new _three.TorusGeometry(r * 0.98, 0.24, 8, 20), (0, _threeShared.createToonMaterial)(0xfacc15, {
                    emissive: 0xfacc15,
                    emissiveIntensity: 0.55
                }));
                goldTrim.rotation.x = Math.PI / 2;
                goldTrim.position.y = h * 0.85;
                g.add(goldTrim);
            }
            // Outer Turret (T1) Energy Shield Dome (active 0:00 -> 5:00)
            var shieldMesh = void 0;
            if (tier === 1) {
                shieldMesh = new _three.Mesh(new _three.SphereGeometry(2.75, 16, 12), new _three.MeshBasicMaterial({
                    color: team === 'blue' ? 0x38bdf8 : 0xfbbf24,
                    transparent: true,
                    opacity: 0.26,
                    wireframe: true
                }));
                shieldMesh.position.y = 2.8;
                g.add(shieldMesh);
            }
            g.position.set(x, 0, z);
            this.three.scene.add(g);
            var baseHp = isNexus ? 960 : tier === 3 ? 420 : tier === 2 ? 380 : 340;
            var hp = isGoldenTurretVariant && (tier === 2 || tier === 3) ? Math.round(baseHp * 1.25) : baseHp;
            this.turrets.push({
                mesh: g,
                x: x,
                z: z,
                team: team,
                lane: lane,
                tier: tier,
                hp: hp,
                maxHp: hp,
                cd: 0,
                isNexus: isNexus,
                alive: true,
                shieldMesh: shieldMesh,
                platingGoldPaid: 0
            });
        }
        // Purple Buff Shortcut Walls (open while Purple Buff is dead)
        var wallSpecs = [
            [
                -76,
                20,
                'purple_blue'
            ],
            [
                76,
                -20,
                'purple_red'
            ]
        ];
        for(var _iterator2 = _create_for_of_iterator_helper_loose(wallSpecs), _step2; !(_step2 = _iterator2()).done;){
            var _step_value2 = _step2.value, wx = _step_value2[0], wz = _step_value2[1], campId = _step_value2[2];
            var wall = new _three.Mesh(new _three.BoxGeometry(5.8, 3.6, 1.4), (0, _threeShared.createToonMaterial)(0x581c87, {
                emissive: 0x9333ea,
                emissiveIntensity: 0.22,
                transparent: true,
                opacity: 0.92
            }));
            wall.position.set(wx, 1.8, wz);
            wall.rotation.y = Math.PI / 4;
            (0, _threeShared.addInkOutline)(wall, 1.05);
            this.three.scene.add(wall);
            this.purpleShortcutWalls.push({
                mesh: wall,
                campId: campId,
                open: false
            });
        }
        // 4 Cyclone Eyes (Directional Wind Dash Gates, 45s CD)
        for(var _iterator3 = _create_for_of_iterator_helper_loose(_arenaRoster.CYCLONE_EYE_SPECS), _step3; !(_step3 = _iterator3()).done;){
            var spec = _step3.value;
            var cg = new _three.Group();
            var outer = new _three.Mesh(new _three.TorusGeometry(2.1, 0.22, 8, 24), new _three.MeshBasicMaterial({
                color: 0x38bdf8,
                transparent: true,
                opacity: 0.85
            }));
            outer.rotation.x = Math.PI / 2;
            outer.position.y = 0.25;
            var inner = new _three.Mesh(new _three.TorusGeometry(1.15, 0.16, 8, 18), new _three.MeshBasicMaterial({
                color: 0xe0f2fe,
                transparent: true,
                opacity: 0.9
            }));
            inner.rotation.x = Math.PI / 2;
            inner.position.y = 0.7;
            var core = new _three.Mesh(new _three.ConeGeometry(0.6, 2.2, 8), new _three.MeshBasicMaterial({
                color: 0x7dd3fc,
                transparent: true,
                opacity: 0.5
            }));
            core.position.y = 1.1;
            cg.add(outer, inner, core);
            cg.position.set(spec.x, 0, spec.z);
            this.three.scene.add(cg);
            this.cycloneEyes.push({
                id: spec.id,
                x: spec.x,
                z: spec.z,
                cd: 0,
                mesh: cg
            });
        }
        // 3D River Pit Hologram Countdown Ring (tracks upcoming Turtle / Lord pit)
        var pitPos = this.activeBossPit === 'upper' ? _arenaRoster.UPPER_RIVER_PIT : _arenaRoster.LOWER_RIVER_PIT;
        this.pitHologramGroup = new _three.Group();
        var holoBase = new _three.Mesh(new _three.RingGeometry(4.8, 5.6, 36), new _three.MeshBasicMaterial({
            color: 0x10b981,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.65
        }));
        holoBase.rotation.x = -Math.PI / 2;
        holoBase.position.y = 0.18;
        var holoInner = new _three.Mesh(new _three.RingGeometry(2.4, 3.1, 24), new _three.MeshBasicMaterial({
            color: 0xfacc15,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.75
        }));
        holoInner.rotation.x = -Math.PI / 2;
        holoInner.position.y = 0.22;
        this.pitHologramRing = holoInner;
        this.pitHologramGroup.add(holoBase, holoInner);
        this.pitHologramGroup.position.set(pitPos[0], 0, pitPos[1]);
        this.three.scene.add(this.pitHologramGroup);
        // Annual Map Variant 3D Actors: Revealing Wisps / Flying Cloud
        if (this.activeMapVariant.id === 'revealing_wisps') {
            for(var _i = 0, _iter = [
                [
                    -48,
                    22
                ],
                [
                    48,
                    -22
                ]
            ]; _i < _iter.length; _i++){
                var _iter__i = _iter[_i], wx1 = _iter__i[0], wz1 = _iter__i[1];
                var wg = new _three.Group();
                var orb = new _three.Mesh(new _three.OctahedronGeometry(0.75, 0), (0, _threeShared.createToonMaterial)(0x38bdf8, {
                    emissive: 0x38bdf8,
                    emissiveIntensity: 0.9
                }));
                orb.position.y = 1.9;
                var visRing = new _three.Mesh(new _three.RingGeometry(4.2, 4.7, 24), new _three.MeshBasicMaterial({
                    color: 0x38bdf8,
                    side: _three.DoubleSide,
                    transparent: true,
                    opacity: 0.35
                }));
                visRing.rotation.x = -Math.PI / 2;
                visRing.position.y = 0.15;
                wg.add(orb, visRing);
                wg.position.set(wx1, 0, wz1);
                this.three.scene.add(wg);
                this.riverWards.push({
                    mesh: wg,
                    x: wx1,
                    z: wz1,
                    homeX: wx1,
                    homeZ: wz1,
                    angle: 0,
                    life: 9999,
                    kind: 'wisp'
                });
            }
        } else if (this.activeMapVariant.id === 'flying_cloud') {
            var cg1 = new _three.Group();
            var cloudMat = (0, _threeShared.createToonMaterial)(0xe0e7ff, {
                emissive: 0xa78bfa,
                emissiveIntensity: 0.55
            });
            var mainPuff = new _three.Mesh(new _three.SphereGeometry(2.1, 14, 12), cloudMat);
            mainPuff.scale.set(1.4, 0.55, 1.1);
            mainPuff.position.y = 0.9;
            var sideA = new _three.Mesh(new _three.SphereGeometry(1.3, 12, 10), cloudMat);
            sideA.position.set(-1.7, 0.85, 0.5);
            var sideB = new _three.Mesh(new _three.SphereGeometry(1.3, 12, 10), cloudMat);
            sideB.position.set(1.7, 0.85, -0.4);
            var launchRing = new _three.Mesh(new _three.RingGeometry(3.2, 3.9, 28), new _three.MeshBasicMaterial({
                color: 0xa78bfa,
                side: _three.DoubleSide,
                transparent: true,
                opacity: 0.78
            }));
            launchRing.rotation.x = -Math.PI / 2;
            launchRing.position.y = 0.16;
            cg1.add(mainPuff, sideA, sideB, launchRing);
            cg1.position.set(_arenaRoster.FLYING_CLOUD_BLUE_SPOT[0], 0, _arenaRoster.FLYING_CLOUD_BLUE_SPOT[1]);
            this.three.scene.add(cg1);
            this.flyingCloudMesh = cg1;
        }
        // Ambush Bushes across lanes and river
        var bushMat = (0, _threeShared.createToonMaterial)(0x065f46, {
            transparent: true,
            opacity: 0.85
        });
        for(var _iterator4 = _create_for_of_iterator_helper_loose(AMBUSH_BUSHES), _step4; !(_step4 = _iterator4()).done;){
            var _step_value3 = _step4.value, bx1 = _step_value3[0], bz1 = _step_value3[1], br = _step_value3[2];
            var patch = new _three.Mesh(new _three.CylinderGeometry(br * 0.75, br * 0.82, 0.55, 12), bushMat);
            patch.position.set(bx1, 0.25, bz1);
            this.three.scene.add(patch);
        }
        // Jungle Landmark Rocks
        var jungleRocks = [
            [
                -50,
                48
            ],
            [
                -82,
                48
            ],
            [
                50,
                -48
            ],
            [
                82,
                -48
            ],
            [
                -48,
                -50
            ],
            [
                48,
                50
            ],
            [
                -82,
                -48
            ],
            [
                82,
                48
            ]
        ];
        for(var _iterator5 = _create_for_of_iterator_helper_loose(jungleRocks), _step5; !(_step5 = _iterator5()).done;){
            var _step_value4 = _step5.value, rx = _step_value4[0], rz = _step_value4[1];
            var rock = new _three.Mesh(new _three.DodecahedronGeometry(3.1, 0), (0, _threeShared.createToonMaterial)(0x475569));
            rock.position.set(rx, 1.9, rz);
            rock.castShadow = true;
            (0, _threeShared.addInkOutline)(rock, 1.06);
            this.three.scene.add(rock);
        }
        this.boltGeo = new _three.SphereGeometry(0.32, 8, 8);
        this.blueBoltMat = new _three.MeshBasicMaterial({
            color: 0x38bdf8
        });
        this.heroBoltMat = new _three.MeshBasicMaterial({
            color: this.heroBladeColor
        });
        this.redBoltMat = new _three.MeshBasicMaterial({
            color: 0xff4757
        });
    };
    _proto.createCampMesh = function createCampMesh(kind, scale, colorNum) {
        var grp = new _three.Group();
        if (kind === 'blue_buff' || kind === 'red_buff') {
            var isPurple = kind === 'blue_buff';
            var stoneCol = isPurple ? 0x3b0764 : 0x7c2d12;
            var glowCol = isPurple ? 0xa855f7 : 0xf97316;
            var torso = new _three.Mesh(new _three.DodecahedronGeometry(1.15 * scale, 0), (0, _threeShared.createToonMaterial)(stoneCol, {
                emissive: glowCol,
                emissiveIntensity: 0.28
            }));
            torso.position.y = scale * 1.25;
            torso.castShadow = true;
            (0, _threeShared.addInkOutline)(torso, 1.07);
            var crown = new _three.Mesh(new _three.OctahedronGeometry(0.56 * scale, 0), (0, _threeShared.createToonMaterial)(glowCol, {
                emissive: glowCol,
                emissiveIntensity: 0.85
            }));
            crown.position.y = scale * 2.65;
            var shoulderGeo = new _three.BoxGeometry(0.75 * scale, 0.85 * scale, 0.75 * scale);
            var shoulderMat = (0, _threeShared.createToonMaterial)(glowCol, {
                emissive: glowCol,
                emissiveIntensity: 0.45
            });
            var leftShoulder = new _three.Mesh(shoulderGeo, shoulderMat);
            leftShoulder.position.set(-1.1 * scale, scale * 1.65, 0);
            var rightShoulder = new _three.Mesh(shoulderGeo, shoulderMat);
            rightShoulder.position.set(1.1 * scale, scale * 1.65, 0);
            grp.add(torso, crown, leftShoulder, rightShoulder);
        } else {
            var bodyGeo = kind === 'turtle' ? new _three.DodecahedronGeometry(1.35 * scale, 0) : kind === 'lord' ? new _three.CylinderGeometry(1.1 * scale, 1.45 * scale, 2.7 * scale, 8) : kind === 'crab' ? new _three.CylinderGeometry(1.0 * scale, 1.15 * scale, 0.9 * scale, 8) : new _three.IcosahedronGeometry(1.05 * scale, 0);
            var body = new _three.Mesh(bodyGeo, (0, _threeShared.createToonMaterial)(colorNum, {
                emissive: colorNum,
                emissiveIntensity: 0.26
            }));
            body.position.y = scale * 1.1;
            body.castShadow = true;
            (0, _threeShared.addInkOutline)(body, 1.08);
            var crown1 = new _three.Mesh(new _three.OctahedronGeometry(0.46 * scale, 0), (0, _threeShared.createToonMaterial)(0xfef08a, {
                emissive: colorNum,
                emissiveIntensity: 0.65
            }));
            crown1.position.y = scale * 2.45;
            grp.add(body, crown1);
        }
        return grp;
    };
    _proto.buildJungleCamps = function buildJungleCamps() {
        var lithoSpot = Math.random() < 0.5 ? _arenaRoster.LITHO_UPPER_SPOT : _arenaRoster.LITHO_LOWER_SPOT;
        var bossSpot = this.activeBossPit === 'upper' ? _arenaRoster.UPPER_RIVER_PIT : _arenaRoster.LOWER_RIVER_PIT;
        var specs = [
            // Purple Buffs (0:25 first spawn, 90s respawn)
            {
                id: 'purple_blue',
                kind: 'blue_buff',
                label: 'Purple Buff (Thunder Fenrir)',
                icon: '🟣',
                x: -68,
                z: 28,
                hp: 260,
                atk: 13,
                scale: 1.45,
                respawn: _arenaRoster.MLBB_TIMERS.BUFF_RESPAWN_SEC,
                gold: 95,
                score: 150,
                colorNum: 0xa855f7,
                colorHex: '#c084fc',
                initialWait: _arenaRoster.MLBB_TIMERS.PURPLE_FIRST_SPAWN_SEC
            },
            {
                id: 'purple_red',
                kind: 'blue_buff',
                label: 'Purple Buff (Thunder Fenrir)',
                icon: '🟣',
                x: 68,
                z: -28,
                hp: 260,
                atk: 13,
                scale: 1.45,
                respawn: _arenaRoster.MLBB_TIMERS.BUFF_RESPAWN_SEC,
                gold: 95,
                score: 150,
                colorNum: 0xa855f7,
                colorHex: '#c084fc',
                initialWait: _arenaRoster.MLBB_TIMERS.PURPLE_FIRST_SPAWN_SEC
            },
            // Orange Buffs (0:20 first spawn, 90s respawn)
            {
                id: 'orange_blue',
                kind: 'red_buff',
                label: 'Orange Buff (Molten Fiend)',
                icon: '🟠',
                x: -28,
                z: 68,
                hp: 270,
                atk: 15,
                scale: 1.48,
                respawn: _arenaRoster.MLBB_TIMERS.BUFF_RESPAWN_SEC,
                gold: 95,
                score: 150,
                colorNum: 0xf97316,
                colorHex: '#fb923c',
                initialWait: _arenaRoster.MLBB_TIMERS.ORANGE_FIRST_SPAWN_SEC
            },
            {
                id: 'orange_red',
                kind: 'red_buff',
                label: 'Orange Buff (Molten Fiend)',
                icon: '🟠',
                x: 28,
                z: -68,
                hp: 270,
                atk: 15,
                scale: 1.48,
                respawn: _arenaRoster.MLBB_TIMERS.BUFF_RESPAWN_SEC,
                gold: 95,
                score: 150,
                colorNum: 0xf97316,
                colorHex: '#fb923c',
                initialWait: _arenaRoster.MLBB_TIMERS.ORANGE_FIRST_SPAWN_SEC
            },
            // Horned Lizards (0:30 first spawn, 70s respawn + Heal)
            {
                id: 'lizard_blue',
                kind: 'horned_lizard',
                label: 'Horned Lizard',
                icon: '🦎',
                x: -80,
                z: 4,
                hp: 135,
                atk: 9,
                scale: 1.05,
                respawn: _arenaRoster.MLBB_TIMERS.SMALL_CAMP_RESPAWN_SEC,
                gold: 60,
                score: 85,
                colorNum: 0x22c55e,
                colorHex: '#facc15',
                initialWait: _arenaRoster.MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN_SEC
            },
            {
                id: 'lizard_red',
                kind: 'horned_lizard',
                label: 'Horned Lizard',
                icon: '🦎',
                x: 80,
                z: -4,
                hp: 135,
                atk: 9,
                scale: 1.05,
                respawn: _arenaRoster.MLBB_TIMERS.SMALL_CAMP_RESPAWN_SEC,
                gold: 60,
                score: 85,
                colorNum: 0x22c55e,
                colorHex: '#facc15',
                initialWait: _arenaRoster.MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN_SEC
            },
            // Lava Golems (0:30 first spawn, 70s respawn + Heal)
            {
                id: 'golem_blue',
                kind: 'lava_golem',
                label: 'Lava Golem',
                icon: '🪨',
                x: -4,
                z: 80,
                hp: 150,
                atk: 10,
                scale: 1.12,
                respawn: _arenaRoster.MLBB_TIMERS.SMALL_CAMP_RESPAWN_SEC,
                gold: 65,
                score: 90,
                colorNum: 0xea580c,
                colorHex: '#facc15',
                initialWait: _arenaRoster.MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN_SEC
            },
            {
                id: 'golem_red',
                kind: 'lava_golem',
                label: 'Lava Golem',
                icon: '🪨',
                x: 4,
                z: -80,
                hp: 150,
                atk: 10,
                scale: 1.12,
                respawn: _arenaRoster.MLBB_TIMERS.SMALL_CAMP_RESPAWN_SEC,
                gold: 65,
                score: 90,
                colorNum: 0xea580c,
                colorHex: '#facc15',
                initialWait: _arenaRoster.MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN_SEC
            },
            // Fire Beetles / Crammers (0:30 first spawn, 70s respawn, splits into Little Crammer!)
            {
                id: 'beetle_blue',
                kind: 'fire_beetle',
                label: 'Fire Beetle (Crammer)',
                icon: '🪲',
                x: -50,
                z: 74,
                hp: 140,
                atk: 9,
                scale: 1.08,
                respawn: _arenaRoster.MLBB_TIMERS.SMALL_CAMP_RESPAWN_SEC,
                gold: 58,
                score: 80,
                colorNum: 0xef4444,
                colorHex: '#facc15',
                initialWait: _arenaRoster.MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN_SEC
            },
            {
                id: 'beetle_red',
                kind: 'fire_beetle',
                label: 'Fire Beetle (Crammer)',
                icon: '🪲',
                x: 50,
                z: -74,
                hp: 140,
                atk: 9,
                scale: 1.08,
                respawn: _arenaRoster.MLBB_TIMERS.SMALL_CAMP_RESPAWN_SEC,
                gold: 58,
                score: 80,
                colorNum: 0xef4444,
                colorHex: '#facc15',
                initialWait: _arenaRoster.MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN_SEC
            },
            // Lithowanderer (0:40 first spawn, 120s respawn, Walkie Grass + Stone Roamer)
            {
                id: 'litho_river',
                kind: 'litho',
                label: 'Lithowanderer',
                icon: '🌿',
                x: lithoSpot[0],
                z: lithoSpot[1],
                hp: 175,
                atk: 8,
                scale: 1.15,
                respawn: _arenaRoster.MLBB_TIMERS.LITHO_RESPAWN_SEC,
                gold: 70,
                score: 115,
                colorNum: 0x14b8a6,
                colorHex: '#2dd4bf',
                initialWait: _arenaRoster.MLBB_TIMERS.LITHO_FIRST_SPAWN_SEC
            },
            // Scavenger Crabs (0:42 Little 35s -> 2:00 Large Gold Crab 90s + 18s Gold/EXP Aura)
            {
                id: 'crab_top',
                kind: 'crab',
                label: 'Little Scavenger Crab',
                icon: '🦀',
                x: -96,
                z: -74,
                hp: 110,
                atk: 7,
                scale: 0.92,
                respawn: _arenaRoster.MLBB_TIMERS.LITTLE_CRAB_RESPAWN_SEC,
                gold: 50,
                score: 75,
                colorNum: 0xf59e0b,
                colorHex: '#fde047',
                initialWait: _arenaRoster.MLBB_TIMERS.CRAB_FIRST_SPAWN_SEC
            },
            {
                id: 'crab_bot',
                kind: 'crab',
                label: 'Little Scavenger Crab',
                icon: '🦀',
                x: 74,
                z: 96,
                hp: 110,
                atk: 7,
                scale: 0.92,
                respawn: _arenaRoster.MLBB_TIMERS.LITTLE_CRAB_RESPAWN_SEC,
                gold: 50,
                score: 75,
                colorNum: 0xf59e0b,
                colorHex: '#fde047',
                initialWait: _arenaRoster.MLBB_TIMERS.CRAB_FIRST_SPAWN_SEC
            },
            // Shared River Objective Boss: First Turtle at 2:00 -> Neutral/Enhanced/Evolved Lord at 8:00/12:00/18:00
            {
                id: 'river_boss',
                kind: 'turtle',
                label: 'River Turtle',
                icon: '🐢',
                x: bossSpot[0],
                z: bossSpot[1],
                hp: 420,
                atk: 18,
                scale: 1.78,
                respawn: _arenaRoster.MLBB_TIMERS.TURTLE_RESPAWN_SEC,
                gold: 130,
                score: 260,
                colorNum: 0x10b981,
                colorHex: '#34d399',
                initialWait: _arenaRoster.MLBB_TIMERS.FIRST_TURTLE_SEC
            }
        ];
        for(var _iterator = _create_for_of_iterator_helper_loose(specs), _step; !(_step = _iterator()).done;){
            var s = _step.value;
            var grp = this.createCampMesh(s.kind, s.scale, s.colorNum);
            grp.position.set(s.x, 0, s.z);
            grp.visible = false;
            this.three.scene.add(grp);
            var ringMesh = new _three.Mesh(new _three.RingGeometry(1.8 * s.scale, 2.35 * s.scale, 24), new _three.MeshBasicMaterial({
                color: s.colorNum,
                side: _three.DoubleSide,
                transparent: true,
                opacity: 0.6
            }));
            ringMesh.rotation.x = -Math.PI / 2;
            ringMesh.position.set(s.x, 0.12, s.z);
            ringMesh.visible = false;
            this.three.scene.add(ringMesh);
            var leashRadius = s.kind === 'turtle' || s.kind === 'lord' ? 14.5 : 12.5;
            var leashMesh = new _three.Mesh(new _three.RingGeometry(leashRadius - 0.35, leashRadius, 36), new _three.MeshBasicMaterial({
                color: 0xfef08a,
                side: _three.DoubleSide,
                transparent: true,
                opacity: 0.52
            }));
            leashMesh.rotation.x = -Math.PI / 2;
            leashMesh.position.set(s.x, 0.13, s.z);
            leashMesh.visible = false;
            this.three.scene.add(leashMesh);
            this.jungleCamps.push({
                id: s.id,
                campKind: s.kind,
                label: s.label,
                icon: s.icon,
                mesh: grp,
                ringMesh: ringMesh,
                leashMesh: leashMesh,
                leashRadius: leashRadius,
                patience: 100,
                aggroed: false,
                outOfCombatSec: 99,
                x: s.x,
                z: s.z,
                homeX: s.x,
                homeZ: s.z,
                hp: s.hp,
                maxHp: s.hp,
                atk: s.atk,
                cd: 0.6,
                alive: false,
                respawnTimer: s.initialWait,
                respawnDelay: s.respawn,
                goldReward: s.gold,
                scoreReward: s.score,
                colorHex: s.colorHex,
                colorNum: s.colorNum,
                stunTimer: 0,
                lordStage: 0
            });
        }
    };
    _proto.spawnPlayer = function spawnPlayer() {
        var _MOBA_RECALL_EFFECTS_find;
        var outline = _storage.playerState.mobaSettings.outline;
        this.playerMesh = (0, _threeShared.buildMobaHeroMesh)(this.heroBodyColor, this.heroCloakColor, this.heroBladeColor, 1.24, this.heroDef.weapon, outline);
        this.px = BLUE_BASE_X + 6;
        this.py = 0;
        this.pz = BLUE_BASE_Z - 6;
        this.playerMesh.position.set(this.px, 0, this.pz);
        this.three.scene.add(this.playerMesh);
        this.shieldDomeMesh = new _three.Mesh(new _three.SphereGeometry(2.3, 18, 14), new _three.MeshBasicMaterial({
            color: this.heroBladeColor,
            transparent: true,
            opacity: 0.26,
            wireframe: true
        }));
        this.shieldDomeMesh.position.y = 1.6;
        this.shieldDomeMesh.visible = false;
        this.playerMesh.add(this.shieldDomeMesh);
        // Golden CC Immunity Aura Ring
        this.ccImmuneAuraMesh = new _three.Mesh(new _three.TorusGeometry(1.7, 0.14, 10, 32), new _three.MeshBasicMaterial({
            color: 0xfacc15,
            transparent: true,
            opacity: 0.9
        }));
        this.ccImmuneAuraMesh.rotation.x = Math.PI / 2;
        this.ccImmuneAuraMesh.position.y = 1.45;
        this.ccImmuneAuraMesh.visible = false;
        this.playerMesh.add(this.ccImmuneAuraMesh);
        // 3D Glowing Feet Aura Ring for Blue Buff Golem
        this.blueBuffAuraMesh = new _three.Group();
        var blueOuter = new _three.Mesh(new _three.RingGeometry(1.45, 1.95, 24), new _three.MeshBasicMaterial({
            color: 0x38bdf8,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.85
        }));
        blueOuter.rotation.x = -Math.PI / 2;
        var blueInner = new _three.Mesh(new _three.RingGeometry(0.85, 1.15, 6), new _three.MeshBasicMaterial({
            color: 0xa855f7,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.75
        }));
        blueInner.rotation.x = -Math.PI / 2;
        this.blueBuffAuraMesh.add(blueOuter, blueInner);
        this.blueBuffAuraMesh.position.y = 0.14;
        this.blueBuffAuraMesh.visible = false;
        this.playerMesh.add(this.blueBuffAuraMesh);
        // 3D Glowing Feet Aura Ring for Orange Buff Golem
        this.redBuffAuraMesh = new _three.Group();
        var redOuter = new _three.Mesh(new _three.RingGeometry(2.05, 2.55, 24), new _three.MeshBasicMaterial({
            color: 0xf97316,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.85
        }));
        redOuter.rotation.x = -Math.PI / 2;
        var redInner = new _three.Mesh(new _three.RingGeometry(1.2, 1.42, 8), new _three.MeshBasicMaterial({
            color: 0xfacc15,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.75
        }));
        redInner.rotation.x = -Math.PI / 2;
        this.redBuffAuraMesh.add(redOuter, redInner);
        this.redBuffAuraMesh.position.y = 0.17;
        this.redBuffAuraMesh.visible = false;
        this.playerMesh.add(this.redBuffAuraMesh);
        // Winter Crown Frozen Stasis Crystal
        this.frozenCrystalMesh = new _three.Mesh(new _three.OctahedronGeometry(2.2, 0), new _three.MeshBasicMaterial({
            color: 0x67e8f9,
            transparent: true,
            opacity: 0.52
        }));
        this.frozenCrystalMesh.position.y = 1.6;
        this.frozenCrystalMesh.visible = false;
        this.playerMesh.add(this.frozenCrystalMesh);
        // 3D Rotating Recall Magic Circle + Beam (uses equipped Recall cosmetic color)
        var recallEffect = (_MOBA_RECALL_EFFECTS_find = _arenaRoster.MOBA_RECALL_EFFECTS.find(function(e) {
            return e.id === _storage.playerState.mobaRecallEffect;
        })) != null ? _MOBA_RECALL_EFFECTS_find : _arenaRoster.MOBA_RECALL_EFFECTS[0];
        this.recallCircleGroup = new _three.Group();
        var recOuter = new _three.Mesh(new _three.RingGeometry(2.3, 2.75, 32), new _three.MeshBasicMaterial({
            color: recallEffect.colorNum,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.88,
            polygonOffset: true,
            polygonOffsetFactor: -2
        }));
        recOuter.rotation.x = -Math.PI / 2;
        var recInner = new _three.Mesh(new _three.RingGeometry(1.2, 1.55, 6), new _three.MeshBasicMaterial({
            color: 0xffffff,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.75,
            polygonOffset: true,
            polygonOffsetFactor: -2
        }));
        recInner.rotation.x = -Math.PI / 2;
        var recBeam = new _three.Mesh(new _three.CylinderGeometry(1.75, 2.2, 14, 18, 1, true), new _three.MeshBasicMaterial({
            color: recallEffect.colorNum,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.24
        }));
        recBeam.position.y = 7;
        this.recallCircleGroup.add(recOuter, recInner, recBeam);
        this.recallCircleGroup.position.set(this.px, 0.16, this.pz);
        this.recallCircleGroup.visible = false;
        this.three.scene.add(this.recallCircleGroup);
        // Reusable Ground Aiming Telegraph Container & Max-Range Ring
        this.telegraphGroup = new _three.Group();
        this.telegraphGroup.visible = false;
        this.three.scene.add(this.telegraphGroup);
        this.telegraphRangeGroup = new _three.Group();
        this.telegraphRangeGroup.visible = false;
        this.three.scene.add(this.telegraphRangeGroup);
        // Aimed Enemy Target Highlight Ring
        this.aimTargetHighlightMesh = new _three.Mesh(new _three.RingGeometry(1.9, 2.55, 24), new _three.MeshBasicMaterial({
            color: 0x38bdf8,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.9,
            polygonOffset: true,
            polygonOffsetFactor: -4
        }));
        this.aimTargetHighlightMesh.rotation.x = -Math.PI / 2;
        this.aimTargetHighlightMesh.visible = false;
        this.three.scene.add(this.aimTargetHighlightMesh);
        // Hero Lock Ground Reticle Ring
        this.lockedReticleMesh = new _three.Mesh(new _three.RingGeometry(1.7, 2.25, 28), new _three.MeshBasicMaterial({
            color: 0xfacc15,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.92,
            polygonOffset: true,
            polygonOffsetFactor: -2
        }));
        this.lockedReticleMesh.rotation.x = -Math.PI / 2;
        this.lockedReticleMesh.visible = false;
        this.three.scene.add(this.lockedReticleMesh);
    };
    _proto.spawnTeamHeroes = function spawnTeamHeroes() {
        var isRanked = this.mobaMode === 'ranked';
        var isAiVs = this.mobaMode === 'ai_vs';
        var enemyHp = (isRanked ? 300 : isAiVs ? 210 : 250) + this.level * 24;
        var outline = _storage.playerState.mobaSettings.outline;
        var banSet = new Set(this.mobaMode === 'ranked' ? _storage.playerState.mobaDraftBans : []);
        banSet.add(this.heroDef.id);
        var pickCanonicalEnemy = function pickCanonicalEnemy(preferredIds) {
            var _MOBA_HEROES_find;
            for(var _iterator = _create_for_of_iterator_helper_loose(preferredIds), _step; !(_step = _iterator()).done;){
                var id = _step.value;
                if (!banSet.has(id) && _arenaRoster.MOBA_HEROES[id]) {
                    banSet.add(id);
                    return _arenaRoster.MOBA_HEROES[id];
                }
            }
            var fallback = (_MOBA_HEROES_find = _arenaRoster.MOBA_HEROES.find(function(h) {
                return !banSet.has(h.id);
            })) != null ? _MOBA_HEROES_find : _arenaRoster.MOBA_HEROES[1];
            banSet.add(fallback.id);
            return fallback;
        };
        var enemy1 = pickCanonicalEnemy([
            1,
            98,
            101,
            108
        ]); // Eudora / Gord / Kagura / Valir
        var enemy2 = pickCanonicalEnemy([
            80,
            84,
            83,
            88
        ]); // Saber / Lancelot / Hayabusa / Gusion
        var enemy3 = pickCanonicalEnemy([
            2,
            3,
            4,
            8
        ]); // Layla / Miya / Bruno / Moskov
        var enemySpecs = [
            [
                88,
                -88,
                1,
                enemy1
            ],
            [
                -86,
                -98,
                0,
                enemy2
            ],
            [
                98,
                84,
                2,
                enemy3
            ]
        ];
        for(var _iterator = _create_for_of_iterator_helper_loose(enemySpecs), _step; !(_step = _iterator()).done;){
            var _step_value = _step.value, hx = _step_value[0], hz = _step_value[1], lane = _step_value[2], hDef = _step_value[3];
            var m = (0, _threeShared.buildMobaHeroMesh)(0xef4444, 0x991b1b, 0xfacc15, 1.18, hDef.weapon, outline);
            m.position.set(hx, 0, hz);
            this.three.scene.add(m);
            this.actors.push({
                id: this.nextActorId++,
                mesh: m,
                x: hx,
                z: hz,
                team: 'red',
                kind: 'hero',
                hp: enemyHp,
                maxHp: enemyHp,
                atk: isRanked ? 22 : isAiVs ? 13 : 17,
                cd: 0.6,
                lane: lane,
                alive: true,
                stunTimer: 0,
                rootTimer: 0,
                silenceTimer: 0,
                fearTimer: 0,
                tauntTimer: 0,
                slowTimer: 0,
                airborneTimer: 0,
                airborneDur: 0.5,
                airbornePeak: 0,
                lifeTimer: 0,
                respawnTimer: 0,
                spawnX: RED_BASE_X - 8,
                spawnZ: RED_BASE_Z + 8,
                label: hDef.name,
                icon: hDef.icon
            });
        }
        // 2 Allied Blue Heroes pushing Top & Bot Lanes (Tigreal & Miya)
        var allySpecs = [
            [
                -94,
                38,
                0,
                'shield',
                'Tigreal',
                '🛡️'
            ],
            [
                -38,
                94,
                2,
                'bow',
                'Miya',
                '🏹'
            ]
        ];
        for(var _iterator1 = _create_for_of_iterator_helper_loose(allySpecs), _step1; !(_step1 = _iterator1()).done;){
            var _step_value1 = _step1.value, ax = _step_value1[0], az = _step_value1[1], lane1 = _step_value1[2], wp = _step_value1[3], label = _step_value1[4], icon = _step_value1[5];
            var m1 = (0, _threeShared.buildMobaHeroMesh)(0x2563eb, 0x1e40af, 0x38bdf8, 1.14, wp, outline);
            m1.position.set(ax, 0, az);
            this.three.scene.add(m1);
            this.actors.push({
                id: this.nextActorId++,
                mesh: m1,
                x: ax,
                z: az,
                team: 'blue',
                kind: 'hero',
                hp: 250,
                maxHp: 250,
                atk: 17,
                cd: 0.6,
                lane: lane1,
                alive: true,
                stunTimer: 0,
                rootTimer: 0,
                silenceTimer: 0,
                fearTimer: 0,
                tauntTimer: 0,
                slowTimer: 0,
                airborneTimer: 0,
                airborneDur: 0.5,
                airbornePeak: 0,
                lifeTimer: 0,
                respawnTimer: 0,
                spawnX: BLUE_BASE_X + 10,
                spawnZ: BLUE_BASE_Z - 10,
                label: label,
                icon: icon
            });
        }
    };
    _proto.spawnMinionWave = function spawnMinionWave() {
        var outline = _storage.playerState.mobaSettings.outline;
        var blueOffsets = [
            [
                -104,
                72,
                0
            ],
            [
                -94,
                94,
                1
            ],
            [
                -72,
                104,
                2
            ]
        ];
        var hasAlliedLord = this.actors.some(function(a) {
            return a.alive && a.kind === 'lord' && a.team === 'blue';
        });
        for(var _iterator = _create_for_of_iterator_helper_loose(blueOffsets), _step; !(_step = _iterator()).done;){
            var _step_value = _step.value, bx = _step_value[0], bz = _step_value[1], lane = _step_value[2];
            var isSuperBlue = this.superMinionLanes.has(lane) || hasAlliedLord;
            var blueScale = isSuperBlue ? 1.02 : 0.78;
            var blueBuilt = (0, _threeShared.buildSoldierMesh)(isSuperBlue ? 0x0ea5e9 : 0x3b82f6, isSuperBlue ? 0x1e40af : 0x1d4ed8, isSuperBlue ? 0xfacc15 : 0x93c5fd, blueScale, outline);
            blueBuilt.group.position.set(bx, 0, bz);
            this.three.scene.add(blueBuilt.group);
            this.actors.push({
                id: this.nextActorId++,
                mesh: blueBuilt.group,
                x: bx,
                z: bz,
                team: 'blue',
                kind: 'minion',
                hp: isSuperBlue ? 145 : 75,
                maxHp: isSuperBlue ? 145 : 75,
                atk: isSuperBlue ? 18 : 10,
                cd: 0.4,
                lane: lane,
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
                lifeTimer: 0,
                respawnTimer: 0,
                spawnX: bx,
                spawnZ: bz,
                label: isSuperBlue ? 'Super Minion' : undefined
            });
            var rx = -bx;
            var rz = -bz;
            var redBuilt = (0, _threeShared.buildSoldierMesh)(0xef4444, 0x991b1b, 0xfca5a5, 0.78, outline);
            redBuilt.group.position.set(rx, 0, rz);
            this.three.scene.add(redBuilt.group);
            this.actors.push({
                id: this.nextActorId++,
                mesh: redBuilt.group,
                x: rx,
                z: rz,
                team: 'red',
                kind: 'minion',
                hp: 75,
                maxHp: 75,
                atk: 10,
                cd: 0.4,
                lane: lane,
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
                lifeTimer: 0,
                respawnTimer: 0,
                spawnX: rx,
                spawnZ: rz
            });
        }
    };
    _proto.spawnAlliedLord = function spawnAlliedLord(stage) {
        if (stage === void 0) stage = 1;
        var standing = {
            0: 0,
            1: 0,
            2: 0
        };
        for(var _iterator = _create_for_of_iterator_helper_loose(this.turrets), _step; !(_step = _iterator()).done;){
            var t = _step.value;
            if (t.alive && t.team === 'red' && !t.isNexus) {
                standing[t.lane]++;
            }
        }
        var targetLane = (0, _arenaRoster.selectLordWeakestLane)(standing);
        var laneName = targetLane === 1 ? 'Mid Lane' : targetLane === this.laneAssign.expLaneIndex ? 'EXP Lane' : 'Gold Lane';
        var spawnPos = targetLane === 0 ? [
            -92,
            32
        ] : targetLane === 2 ? [
            -32,
            92
        ] : [
            -36,
            36
        ];
        var scale = stage === 3 ? 2.15 : stage === 2 ? 1.98 : 1.85;
        var hp = stage === 3 ? 1280 : stage === 2 ? 980 : 760;
        var atk = stage === 3 ? 58 : stage === 2 ? 46 : 38;
        var bossMesh = (0, _threeShared.buildMobaHeroMesh)(stage === 3 ? 0x7c3aed : 0x2563eb, 0x1d4ed8, 0xfacc15, scale, 'halberd', _storage.playerState.mobaSettings.outline);
        bossMesh.position.set(spawnPos[0], 0, spawnPos[1]);
        this.three.scene.add(bossMesh);
        this.lordChargeAvailable = stage >= 2;
        this.actors.push({
            id: this.nextActorId++,
            mesh: bossMesh,
            x: spawnPos[0],
            z: spawnPos[1],
            team: 'blue',
            kind: 'lord',
            hp: hp,
            maxHp: hp,
            atk: atk,
            cd: 0.8,
            lane: targetLane,
            alive: true,
            stunTimer: 0,
            rootTimer: 0,
            silenceTimer: 0,
            fearTimer: 0,
            tauntTimer: 0,
            slowTimer: 0,
            airborneTimer: 0,
            airborneDur: 0.5,
            airbornePeak: 0,
            lifeTimer: 0,
            respawnTimer: 0,
            spawnX: spawnPos[0],
            spawnZ: spawnPos[1],
            label: stage === 3 ? 'Evolved Lord' : stage === 2 ? 'Enhanced Lord' : 'Allied Lord',
            icon: '🐉'
        });
        this.showKillfeed("\uD83D\uDC09 " + (stage === 3 ? 'EVOLVED' : stage === 2 ? 'ENHANCED' : 'LUMINOUS') + " LORD marches " + laneName + "!");
    };
    _proto.setMoveDir = function setMoveDir(dx, dy) {
        if (this.gameOver || this.isPaused) {
            this.moveX = 0;
            this.moveZ = 0;
            return;
        }
        this.moveX = dx;
        this.moveZ = dy;
        if (dx !== 0 || dy !== 0) this.tapTarget = null;
    };
    _proto.setSteerLeft = function setSteerLeft(down) {
        this.moveX = down && !this.gameOver && !this.isPaused ? -1 : 0;
        if (down && !this.isPaused) this.tapTarget = null;
    };
    _proto.setSteerRight = function setSteerRight(down) {
        this.moveX = down && !this.gameOver && !this.isPaused ? 1 : 0;
        if (down && !this.isPaused) this.tapTarget = null;
    };
    _proto.firePlayerBolt = function firePlayerBolt(angle, dmg, rangeSec, _colorOverride, elementTheme, boltScale) {
        if (rangeSec === void 0) rangeSec = 0.78;
        if (boltScale === void 0) boltScale = 1.05;
        var theme = elementTheme != null ? elementTheme : this.heroBaseElement;
        var m = (0, _mobaElementalVfx.createElementalProjectileMesh)(theme, boltScale);
        m.position.set(this.px, 1.55, this.pz);
        m.rotation.y = angle;
        this.three.scene.add(m);
        var rangeBoost = this.equippedItemIds.includes('malefic_gun') ? 1.15 : 1.0;
        this.bolts.push({
            mesh: m,
            x: this.px,
            z: this.pz,
            vx: Math.sin(angle) * 34,
            vz: Math.cos(angle) * 34,
            team: 'blue',
            dmg: dmg,
            life: rangeSec * rangeBoost,
            slowSec: this.redBuffTimer > 0 || this.computedStats.hasIceBound ? 1.5 : 0,
            elementTheme: theme,
            isSharedMesh: false
        });
    };
    _proto.setLockedEnemy = function setLockedEnemy(actorId) {
        if (this.lockedEnemyId === actorId) {
            this.lockedEnemyId = null;
        } else {
            this.lockedEnemyId = actorId;
        }
        this.pushMobaHudSnapshot();
    };
    _proto.isSkillAiming = function isSkillAiming() {
        return this.activeSkillAim !== null;
    };
    _proto.resolveActionAimMeta = function resolveActionAimMeta(actionKey) {
        if (actionKey === 'skill1' || actionKey === 'skill2' || actionKey === 'skill3' || actionKey === 'skill4') {
            var slotIndex = Number(actionKey.slice(5)) - 1;
            var spec = this.combatKit.skills[slotIndex];
            if (!spec) return null;
            var johnsonDriving = spec.iconicUlt === 'johnson_car' && this.activeUltSetpieces.some(function(s) {
                return s.kind === 'johnson_car';
            });
            var cd = slotIndex === 0 ? this.cdSkill1 : slotIndex === 1 ? this.cdSkill2 : slotIndex === 2 ? this.cdSkill3 : this.cdSkill4;
            return {
                actionKey: actionKey,
                slotIndex: slotIndex,
                targeting: spec.targeting,
                range: Math.max(6, Math.min(28, spec.range)),
                radius: Math.max(2.6, Math.min(14, spec.radius)),
                elementTheme: spec.elementTheme,
                ready: johnsonDriving || cd <= 0
            };
        }
        if (actionKey === 'spell') {
            var id = this.spellDef.id;
            var targeting = 'self';
            var range = 8;
            var radius = 5.5;
            var elementTheme = 'celestial';
            if (id === 'flicker') {
                targeting = 'circle';
                range = 15;
                radius = 3.2;
                elementTheme = 'lightning';
            } else if (id === 'flameshot') {
                targeting = 'line';
                range = 26;
                radius = 2.6;
                elementTheme = 'fire';
            } else if (id === 'execute') {
                targeting = 'lock';
                range = 10.5;
                radius = 3.0;
                elementTheme = 'blood';
            } else if (id === 'retribution') {
                targeting = 'lock';
                range = 15;
                radius = 3.2;
                elementTheme = 'blood';
            } else if (id === 'petrify') {
                targeting = 'self';
                range = 8.2;
                radius = 8.2;
                elementTheme = 'earth';
            } else if (id === 'revitalize') {
                targeting = 'self';
                range = 6.2;
                radius = 6.2;
                elementTheme = 'nature';
            } else if (id === 'inspire') {
                elementTheme = 'fire';
            } else if (id === 'sprint') {
                elementTheme = 'wind';
            } else if (id === 'aegis' || id === 'vengeance' || id === 'purify') {
                elementTheme = 'celestial';
            } else if (id === 'arrival') {
                elementTheme = 'shadow';
            }
            return {
                actionKey: 'spell',
                slotIndex: null,
                targeting: targeting,
                range: range,
                radius: radius,
                elementTheme: elementTheme,
                ready: this.cdSpell <= 0
            };
        }
        return null;
    };
    _proto.findAimLockEnemy = function findAimLockEnemy(aimX, aimZ, aimYaw, maxRange, targeting) {
        var dirX = Math.sin(aimYaw);
        var dirZ = Math.cos(aimYaw);
        var bestScore = Infinity;
        var best = null;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.actors), _step; !(_step = _iterator()).done;){
            var a = _step.value;
            if (!a.alive || a.team !== 'red') continue;
            var dHero = Math.hypot(a.x - this.px, a.z - this.pz);
            if (dHero > maxRange + 4.5) continue;
            var score = Infinity;
            if (targeting === 'line' || targeting === 'cone') {
                var rx = a.x - this.px;
                var rz = a.z - this.pz;
                var proj = rx * dirX + rz * dirZ;
                var perp = Math.abs(rx * dirZ - rz * dirX);
                var coneLimit = targeting === 'cone' ? Math.max(3.5, proj * 0.62) : 3.6;
                if (proj > 0 && proj <= maxRange + 2 && perp <= coneLimit) {
                    score = perp * 2.2 + proj * 0.15;
                }
            } else {
                var dAim = Math.hypot(a.x - aimX, a.z - aimZ);
                if (dAim <= (targeting === 'lock' ? 7.5 : 5.5)) {
                    score = dAim;
                }
            }
            if (a.kind === 'hero' && Number.isFinite(score)) score *= 0.65;
            if (score < bestScore) {
                bestScore = score;
                best = {
                    id: a.id,
                    x: a.x,
                    z: a.z
                };
            }
        }
        return best;
    };
    _proto.beginSkillAim = function beginSkillAim(actionKey, mode) {
        if (mode === void 0) mode = 'drag';
        var _ref;
        var _tgt_actor;
        if (this.gameOver || this.isPaused || this.frozenTimer > 0) return false;
        var meta = this.resolveActionAimMeta(actionKey);
        if (!meta || !meta.ready) return false;
        var tgt = this.findNearestEnemyTarget();
        var initialYaw = tgt ? tgt.angle : this.pYaw;
        var initDist = meta.targeting === 'self' ? 0 : tgt ? Math.min(meta.range, tgt.dist) : Math.min(meta.range * 0.65, 11);
        var aimX = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.px + Math.sin(initialYaw) * initDist));
        var aimZ = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.pz + Math.cos(initialYaw) * initDist));
        this.activeSkillAim = {
            actionKey: meta.actionKey,
            slotIndex: meta.slotIndex,
            mode: mode,
            targeting: meta.targeting,
            range: meta.range,
            radius: meta.radius,
            elementTheme: meta.elementTheme,
            aimYaw: initialYaw,
            aimX: aimX,
            aimZ: aimZ,
            lockedTargetId: (_ref = tgt == null ? void 0 : (_tgt_actor = tgt.actor) == null ? void 0 : _tgt_actor.id) != null ? _ref : null,
            cancelled: false,
            hasManualAim: false
        };
        this.telegraphSlot = meta.slotIndex;
        this.telegraphAutoTimer = 0;
        this.telegraphCancelled = false;
        this.rebuildActiveTelegraphMesh();
        this.syncTelegraphTransform();
        return true;
    };
    _proto.updateSkillAimDrag = function updateSkillAimDrag(normX, normY, cancelled) {
        if (cancelled === void 0) cancelled = false;
        var _this_three;
        var aim = this.activeSkillAim;
        if (!aim || !((_this_three = this.three) == null ? void 0 : _this_three.camera)) return;
        var prevCancel = aim.cancelled;
        aim.cancelled = cancelled;
        var mag = Math.hypot(normX, normY);
        if (mag > 0.14) {
            var _ref;
            // Map screen-space drag (normX right, normY down) onto camera-relative world XZ plane
            this.three.camera.getWorldDirection(_camFwd);
            _camFwd.y = 0;
            if (_camFwd.lengthSq() < 1e-5) _camFwd.set(0.55, 0, -0.83);
            _camFwd.normalize();
            _camRight.crossVectors(_camFwd, _worldUp).normalize();
            var worldDx = _camRight.x * normX + _camFwd.x * -normY;
            var worldDz = _camRight.z * normX + _camFwd.z * -normY;
            var resolved = (0, _arenaRoster.resolveSkillAimPoint)(this.px, this.pz, worldDx, worldDz, aim.range, aim.targeting, PLAY_LIMIT);
            aim.aimYaw = resolved.aimYaw;
            aim.aimX = resolved.aimX;
            aim.aimZ = resolved.aimZ;
            aim.hasManualAim = true;
            var snapped = this.findAimLockEnemy(aim.aimX, aim.aimZ, aim.aimYaw, aim.range, aim.targeting);
            aim.lockedTargetId = (_ref = snapped == null ? void 0 : snapped.id) != null ? _ref : null;
            if (aim.targeting === 'lock' && snapped) {
                aim.aimX = snapped.x;
                aim.aimZ = snapped.z;
                aim.aimYaw = Math.atan2(snapped.x - this.px, snapped.z - this.pz);
            }
        }
        if (prevCancel !== cancelled) {
            this.telegraphCancelled = cancelled;
            this.rebuildActiveTelegraphMesh();
        }
        this.syncTelegraphTransform();
    };
    _proto.updateSkillAimScreen = function updateSkillAimScreen(clientX, clientY, cancelled) {
        if (cancelled === void 0) cancelled = false;
        var _this_three;
        var aim = this.activeSkillAim;
        if (!aim || !((_this_three = this.three) == null ? void 0 : _this_three.camera)) return;
        var prevCancel = aim.cancelled;
        aim.cancelled = cancelled;
        var pt = (0, _viewport.mapClientToStage)(clientX, clientY);
        var vp = (0, _viewport.getViewportSize)();
        _mobaNdc.set(pt.x / Math.max(1, vp.width) * 2 - 1, -(pt.y / Math.max(1, vp.height)) * 2 + 1);
        _mobaRay.setFromCamera(_mobaNdc, this.three.camera);
        if (Math.abs(_mobaRay.ray.direction.y) > 0.01) {
            var t = -_mobaRay.ray.origin.y / _mobaRay.ray.direction.y;
            if (t > 0 && t < 340) {
                var hitX = _mobaRay.ray.origin.x + _mobaRay.ray.direction.x * t;
                var hitZ = _mobaRay.ray.origin.z + _mobaRay.ray.direction.z * t;
                var dx = hitX - this.px;
                var dz = hitZ - this.pz;
                var rawDist = Math.hypot(dx, dz);
                if (rawDist > 0.25) {
                    var _ref;
                    var aimYaw = Math.atan2(dx, dz);
                    var clampedDist = aim.targeting === 'self' ? 0 : Math.min(aim.range, rawDist);
                    aim.aimYaw = aimYaw;
                    aim.aimX = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.px + Math.sin(aimYaw) * clampedDist));
                    aim.aimZ = Math.max(-PLAY_LIMIT, Math.min(PLAY_LIMIT, this.pz + Math.cos(aimYaw) * clampedDist));
                    aim.hasManualAim = true;
                    var snapped = this.findAimLockEnemy(aim.aimX, aim.aimZ, aim.aimYaw, aim.range, aim.targeting);
                    aim.lockedTargetId = (_ref = snapped == null ? void 0 : snapped.id) != null ? _ref : null;
                    if (aim.targeting === 'lock' && snapped) {
                        aim.aimX = snapped.x;
                        aim.aimZ = snapped.z;
                        aim.aimYaw = Math.atan2(snapped.x - this.px, snapped.z - this.pz);
                    }
                }
            }
        }
        if (prevCancel !== cancelled) {
            this.telegraphCancelled = cancelled;
            this.rebuildActiveTelegraphMesh();
        }
        this.syncTelegraphTransform();
    };
    _proto.commitSkillAim = function commitSkillAim(quickTap) {
        if (quickTap === void 0) quickTap = false;
        var aim = this.activeSkillAim;
        if (!aim) return;
        this.activeSkillAim = null;
        this.telegraphSlot = null;
        this.telegraphCancelled = false;
        if (this.telegraphGroup) this.telegraphGroup.visible = false;
        if (this.telegraphRangeGroup) this.telegraphRangeGroup.visible = false;
        if (this.aimTargetHighlightMesh) this.aimTargetHighlightMesh.visible = false;
        if (aim.cancelled) return;
        var override = quickTap && !aim.hasManualAim ? undefined : {
            aimX: aim.aimX,
            aimZ: aim.aimZ,
            aimYaw: aim.aimYaw,
            lockedTargetId: aim.lockedTargetId,
            dist: Math.hypot(aim.aimX - this.px, aim.aimZ - this.pz)
        };
        if (aim.slotIndex !== null) {
            this.castHeroSkill(aim.slotIndex, override);
        } else if (aim.actionKey === 'spell') {
            this.castBattleSpell(override);
        }
    };
    _proto.cancelSkillAim = function cancelSkillAim() {
        this.activeSkillAim = null;
        this.telegraphSlot = null;
        this.telegraphAutoTimer = 0;
        this.telegraphCancelled = false;
        if (this.telegraphGroup) this.telegraphGroup.visible = false;
        if (this.telegraphRangeGroup) this.telegraphRangeGroup.visible = false;
        if (this.aimTargetHighlightMesh) this.aimTargetHighlightMesh.visible = false;
    };
    _proto.previewSkillTelegraph = function previewSkillTelegraph(slotIndex) {
        if (this.activeSkillAim) return;
        this.telegraphSlot = slotIndex;
        this.telegraphAutoTimer = 0;
        this.rebuildTelegraphMesh(slotIndex);
    };
    _proto.clearGroupChildren = function clearGroupChildren(grp) {
        if (!grp) return;
        while(grp.children.length > 0){
            var ch = grp.children[0];
            disposeObjectTree(ch);
            grp.remove(ch);
        }
    };
    _proto.buildTelegraphGeometry = function buildTelegraphGeometry(targeting, range, radius, elementTheme, cancelled) {
        if (!this.telegraphGroup || !this.telegraphRangeGroup) return;
        this.clearGroupChildren(this.telegraphGroup);
        this.clearGroupChildren(this.telegraphRangeGroup);
        var pal = _arenaRoster.MOBA_ELEMENT_PALETTES[elementTheme];
        var fillColor = cancelled ? 0xef4444 : pal.primary;
        var rimColor = cancelled ? 0xfca5a5 : pal.secondary;
        var coreColor = cancelled ? 0xfee2e2 : pal.core;
        var matFill = new _three.MeshBasicMaterial({
            color: fillColor,
            side: _three.DoubleSide,
            transparent: true,
            opacity: cancelled ? 0.28 : 0.24,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -3
        });
        var matRim = new _three.MeshBasicMaterial({
            color: rimColor,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4
        });
        var matCore = new _three.MeshBasicMaterial({
            color: coreColor,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -5
        });
        // Outer max cast-range ring around hero for non-self skills
        if (targeting !== 'self') {
            var rangeRing = new _three.Mesh(new _three.RingGeometry(Math.max(1, range - 0.22), range, 48), new _three.MeshBasicMaterial({
                color: rimColor,
                side: _three.DoubleSide,
                transparent: true,
                opacity: cancelled ? 0.55 : 0.42,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: -2
            }));
            rangeRing.rotation.x = -Math.PI / 2;
            rangeRing.position.y = 0.12;
            this.telegraphRangeGroup.add(rangeRing);
            this.telegraphRangeGroup.visible = true;
        } else {
            this.telegraphRangeGroup.visible = false;
        }
        if (targeting === 'line') {
            var len = Math.max(6, Math.min(26, range));
            var rect = new _three.Mesh(new _three.PlaneGeometry(2.9, len), matFill);
            rect.rotation.x = -Math.PI / 2;
            rect.position.set(0, 0.15, len / 2);
            var rail = new _three.Mesh(new _three.PlaneGeometry(0.45, len * 0.96), matCore);
            rail.rotation.x = -Math.PI / 2;
            rail.position.set(0, 0.17, len / 2);
            var tip = new _three.Mesh(new _three.ConeGeometry(1.85, 2.5, 3), matRim);
            tip.rotation.x = Math.PI / 2;
            tip.position.set(0, 0.19, len + 0.85);
            this.telegraphGroup.add(rect, rail, tip);
        } else if (targeting === 'cone') {
            var rad = Math.max(6, Math.min(18, range));
            var cone = new _three.Mesh(new _three.CircleGeometry(rad, 22, Math.PI / 2 - 0.56, 1.12), matFill);
            cone.rotation.x = -Math.PI / 2;
            cone.rotation.z = Math.PI;
            cone.position.y = 0.15;
            var rimArc = new _three.Mesh(new _three.RingGeometry(rad - 0.32, rad, 24, 1, Math.PI / 2 - 0.56, 1.12), matRim);
            rimArc.rotation.x = -Math.PI / 2;
            rimArc.rotation.z = Math.PI;
            rimArc.position.y = 0.17;
            this.telegraphGroup.add(cone, rimArc);
        } else if (targeting === 'circle' || targeting === 'lock') {
            var r = targeting === 'lock' ? Math.max(2.6, Math.min(4.2, radius * 0.55)) : Math.max(2.6, radius);
            var outer = new _three.Mesh(new _three.RingGeometry(r - 0.35, r, 36), matRim);
            outer.rotation.x = -Math.PI / 2;
            outer.position.y = 0.16;
            var fill = new _three.Mesh(new _three.CircleGeometry(r, 30), matFill);
            fill.rotation.x = -Math.PI / 2;
            fill.position.y = 0.14;
            var crossH = new _three.Mesh(new _three.PlaneGeometry(r * 0.72, 0.22), matCore);
            crossH.rotation.x = -Math.PI / 2;
            crossH.position.y = 0.18;
            var crossV = new _three.Mesh(new _three.PlaneGeometry(0.22, r * 0.72), matCore);
            crossV.rotation.x = -Math.PI / 2;
            crossV.position.y = 0.18;
            this.telegraphGroup.add(outer, fill, crossH, crossV);
        } else {
            var r1 = Math.max(3.5, radius);
            var selfRing = new _three.Mesh(new _three.RingGeometry(r1 - 0.38, r1, 32), matRim);
            selfRing.rotation.x = -Math.PI / 2;
            selfRing.position.y = 0.16;
            var selfFill = new _three.Mesh(new _three.CircleGeometry(r1, 28), matFill);
            selfFill.rotation.x = -Math.PI / 2;
            selfFill.position.y = 0.14;
            this.telegraphGroup.add(selfRing, selfFill);
        }
        this.telegraphGroup.visible = true;
    };
    _proto.rebuildActiveTelegraphMesh = function rebuildActiveTelegraphMesh() {
        var aim = this.activeSkillAim;
        if (!aim) return;
        this.buildTelegraphGeometry(aim.targeting, aim.range, aim.radius, aim.elementTheme, aim.cancelled);
        if (this.aimTargetHighlightMesh) {
            var mat = this.aimTargetHighlightMesh.material;
            mat.color.setHex(aim.cancelled ? 0xef4444 : _arenaRoster.MOBA_ELEMENT_PALETTES[aim.elementTheme].secondary);
        }
    };
    _proto.rebuildTelegraphMesh = function rebuildTelegraphMesh(slotIndex) {
        if (!this.telegraphGroup) return;
        if (slotIndex === null || slotIndex < 0 || slotIndex > 3) {
            this.clearGroupChildren(this.telegraphGroup);
            this.clearGroupChildren(this.telegraphRangeGroup);
            this.telegraphGroup.visible = false;
            if (this.telegraphRangeGroup) this.telegraphRangeGroup.visible = false;
            if (this.aimTargetHighlightMesh) this.aimTargetHighlightMesh.visible = false;
            return;
        }
        var spec = this.combatKit.skills[slotIndex];
        if (!spec) {
            this.telegraphGroup.visible = false;
            return;
        }
        this.buildTelegraphGeometry(spec.targeting, spec.range, spec.radius, spec.elementTheme, false);
        this.syncTelegraphTransform();
    };
    _proto.syncTelegraphTransform = function syncTelegraphTransform() {
        if (!this.telegraphGroup || !this.telegraphGroup.visible) return;
        if (this.activeSkillAim) {
            var aim = this.activeSkillAim;
            if (this.telegraphRangeGroup) {
                this.telegraphRangeGroup.position.set(this.px, 0, this.pz);
            }
            if (aim.targeting === 'circle' || aim.targeting === 'lock') {
                this.telegraphGroup.position.set(aim.aimX, 0, aim.aimZ);
                this.telegraphGroup.rotation.y = 0;
            } else {
                this.telegraphGroup.position.set(this.px, 0, this.pz);
                this.telegraphGroup.rotation.y = aim.aimYaw;
            }
            // Highlight locked / hovered target under aim
            if (this.aimTargetHighlightMesh) {
                var hiActor;
                if (aim.lockedTargetId !== null) {
                    hiActor = this.actors.find(function(a) {
                        return a.id === aim.lockedTargetId && a.alive && a.team === 'red';
                    });
                }
                if (!hiActor && aim.targeting === 'circle') {
                    hiActor = this.actors.find(function(a) {
                        return a.alive && a.team === 'red' && Math.hypot(a.x - aim.aimX, a.z - aim.aimZ) <= aim.radius;
                    });
                }
                if (hiActor) {
                    this.aimTargetHighlightMesh.visible = true;
                    this.aimTargetHighlightMesh.position.set(hiActor.x, 0.24, hiActor.z);
                    this.aimTargetHighlightMesh.rotation.z += 0.08;
                } else {
                    this.aimTargetHighlightMesh.visible = false;
                }
            }
            return;
        }
        if (this.telegraphSlot === null) return;
        var spec = this.combatKit.skills[this.telegraphSlot];
        if (!spec) return;
        if (this.telegraphRangeGroup) {
            this.telegraphRangeGroup.position.set(this.px, 0, this.pz);
        }
        if (spec.targeting === 'circle' || spec.targeting === 'lock') {
            var tgt = this.findNearestEnemyTarget();
            if (tgt) {
                this.telegraphGroup.position.set(tgt.x, 0, tgt.z);
            } else {
                var dist = Math.min(spec.range * 0.65, 11);
                this.telegraphGroup.position.set(this.px + Math.sin(this.pYaw) * dist, 0, this.pz + Math.cos(this.pYaw) * dist);
            }
            this.telegraphGroup.rotation.y = 0;
        } else {
            this.telegraphGroup.position.set(this.px, 0, this.pz);
            this.telegraphGroup.rotation.y = this.pYaw;
        }
    };
    _create_class(LegendsArena3DWorld, [
        {
            key: "cdMult",
            get: function get() {
                var _this = this;
                var _ref;
                var modeDef = _arenaRoster.MOBA_MODES.find(function(m) {
                    return m.id === _this.mobaMode;
                });
                var modeMult = (_ref = modeDef == null ? void 0 : modeDef.cdMult) != null ? _ref : 1.0;
                return modeMult * Math.max(0.55, 1 - this.computedStats.cdrRatio);
            }
        }
    ]);
    return LegendsArena3DWorld;
}();

});
// === MODULE: src/games/legends-arena/mlbb/engine/AIBotController ===
ArcadeMod.define("src/games/legends-arena/mlbb/engine/AIBotController", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "stepAiHero", {
    enumerable: true,
    get: function() {
        return stepAiHero;
    }
});
var _mapData = require("../data/mapData");
var _items = require("../data/items");
var _emblems = require("../data/emblems");
var _CombatMath = require("./CombatMath");
var _SkillPhysics = require("./SkillPhysics");
var _SmartAiBrain = require("./SmartAiBrain");
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
function getAssignedLaneKey(hero, expLane, goldLane, isBrawl) {
    if (isBrawl) return 'mid';
    if (hero.lane === 'EXP') return expLane;
    if (hero.lane === 'Gold') return goldLane;
    return 'mid';
}
function stepAiHero(hero, dt, helpers) {
    var _loop = function(i) {
        var wp = ordered[i];
        if ((0, _CombatMath.dist)(hero.x, hero.y, wp.x, wp.y) > 220) {
            targetWp = wp;
            var blockingTurret = turrets.find(function(t) {
                return t.alive && t.team !== hero.team && (0, _CombatMath.dist)(wp.x, wp.y, t.x, t.y) < 350;
            });
            if (blockingTurret) {
                targetWp = ordered[(0, _CombatMath.clamp)(i - 1, 0, ordered.length - 1)];
                return "break";
            }
            if (i >= 2) return "break";
        }
    };
    if (!hero.alive || hero.isPlayer || hero.isTrainingDummy) return;
    var diff = (0, _SmartAiBrain.getAiDifficultyProfile)(helpers.difficulty);
    // Reflex Purify even while CC'd (non-Suppression) on Epic / Mythic AI
    if (diff.enablePurifyReflex && hero.spellId === 'purify' && hero.spellCd <= 0 && hero.ccType && (0, _CombatMath.getCcPriority)(hero.ccType) >= 3 && hero.ccType !== 'suppression') {
        (0, _SkillPhysics.castBattleSpell)(hero, hero.facing, helpers.ctx);
    }
    if (hero.ccType && (0, _CombatMath.getCcPriority)(hero.ccType) >= 4) return;
    if (hero.dashTimer > 0) return;
    var ctx = helpers.ctx, expLane = helpers.expLane, goldLane = helpers.goldLane, isBrawl = helpers.isBrawl, activePingOrder = helpers.activePingOrder, basicAttackTarget = helpers.basicAttackTarget, buyItemForHero = helpers.buyItemForHero, triggerHeroEmote = helpers.triggerHeroEmote, triggerActiveItemForHero = helpers.triggerActiveItemForHero;
    var heroes = ctx.heroes, minions = ctx.minions, turrets = ctx.turrets, jungleMobs = ctx.jungleMobs, matchTimeSec = ctx.matchTimeSec;
    // Auto level up skills for AI bots
    if (hero.skillPoints > 0) {
        var order = [
            2,
            0,
            1
        ];
        for(var _iterator = _create_for_of_iterator_helper_loose(order), _step; !(_step = _iterator()).done;){
            var idx = _step.value;
            var maxLvl = idx === 2 ? 3 : 6;
            var reqLvl = idx === 2 ? hero.skillLevels[2] === 0 ? 4 : hero.skillLevels[2] === 1 ? 8 : 12 : 1;
            if (hero.skillLevels[idx] < maxLvl && hero.level >= reqLvl) {
                hero.skillLevels[idx]++;
                hero.skillPoints--;
                break;
            }
        }
    }
    // Dynamic Counter-Build + Auto-buy items from hero's build plan
    hero.aiTimer -= dt;
    if (hero.aiTimer <= 0) {
        hero.aiTimer = diff.buyIntervalSec + Math.random() * 0.25;
        if (diff.enableCounterBuild && matchTimeSec >= 120 && hero.items.length >= 2) {
            hero.buildPlan = (0, _SmartAiBrain.computeCounterBuildPlan)(hero, heroes);
        }
        var qb = (0, _items.computeMlbbQuickBuy)(hero.buildPlan, hero.items, hero.gold, null);
        if (qb.length > 0 && qb[0].canAfford) {
            buyItemForHero(hero, qb[0].id);
        }
    }
    var home = hero.team === 'blue' ? _mapData.BLUE_FOUNTAIN : _mapData.RED_FOUNTAIN;
    var hpPct = hero.hp / Math.max(1, hero.maxHp);
    // 1. RETREAT / RECALL if low HP
    var retreatThresh = diff.tier === 'mythic' ? 0.27 : diff.tier === 'epic' ? 0.24 : 0.19;
    if (hpPct < retreatThresh && !isBrawl) {
        hero.aiState = 'retreat';
        var dHome = (0, _CombatMath.dist)(hero.x, hero.y, home.x, home.y);
        if (dHome < 260) {
            hero.vx = 0;
            hero.vy = 0;
            return;
        }
        var nearestThreat = heroes.find(function(h) {
            return h.alive && h.team !== hero.team && !h.isTrainingDummy && (0, _CombatMath.dist)(hero.x, hero.y, h.x, h.y) < 540;
        });
        if (!nearestThreat && dHome > 900 && !hero.recalling) {
            hero.recalling = true;
            hero.recallTimer = 4.0;
            hero.vx = 0;
            hero.vy = 0;
            return;
        }
        if (hero.recalling) {
            hero.vx = 0;
            hero.vy = 0;
            return;
        }
        var ang = Math.atan2(home.y - hero.y, home.x - hero.x);
        hero.vx = Math.cos(ang);
        hero.vy = Math.sin(ang);
        hero.facing = ang;
        if (hero.spellCd <= 0 && (hero.spellId === 'sprint' || hero.spellId === 'aegis' || hero.spellId === 'flicker' || hero.spellId === 'revitalize')) {
            (0, _SkillPhysics.castBattleSpell)(hero, ang, ctx);
        }
        if (nearestThreat && triggerActiveItemForHero && (0, _SmartAiBrain.shouldTriggerBotActiveOrPurify)(hero, [
            nearestThreat
        ], diff) === 'active_item') {
            triggerActiveItemForHero(hero);
        }
        return;
    }
    hero.recalling = false;
    // 1B. PING-RESPONSIVE ALLIED AI COMMANDS (Drag-to-Mark Attack / Gather / Retreat / OMW)
    if (activePingOrder) {
        var dPing = (0, _CombatMath.dist)(hero.x, hero.y, activePingOrder.x, activePingOrder.y);
        if (activePingOrder.kind === 'retreat' && dPing < 650) {
            hero.aiState = 'retreat';
            var retreatAng = Math.atan2(home.y - hero.y, home.x - hero.x);
            hero.vx = Math.cos(retreatAng);
            hero.vy = Math.sin(retreatAng);
            hero.facing = retreatAng;
            return;
        }
        if ((activePingOrder.kind === 'attack' || activePingOrder.kind === 'gather' || activePingOrder.kind === 'omw') && dPing > 220) {
            hero.aiState = 'objective';
            var moveAng = Math.atan2(activePingOrder.y - hero.y, activePingOrder.x - hero.x);
            hero.vx = Math.cos(moveAng);
            hero.vy = Math.sin(moveAng);
            hero.facing = moveAng;
            if (activePingOrder.targetHeroId) {
                var marked = heroes.find(function(h) {
                    return h.id === activePingOrder.targetHeroId && h.alive && (0, _CombatMath.dist)(hero.x, hero.y, h.x, h.y) <= hero.heroDef.attackRange + 90;
                });
                if (marked) {
                    var mAng = Math.atan2(marked.y - hero.y, marked.x - hero.x);
                    hero.facing = mAng;
                    hero.vx = 0;
                    hero.vy = 0;
                    basicAttackTarget(hero, 'hero', marked.id);
                    if (hero.skillLevels[0] > 0 && hero.skillCds[0] <= 0) (0, _SkillPhysics.castHeroSkill)(hero, 1, mAng, (0, _CombatMath.dist)(hero.x, hero.y, marked.x, marked.y), ctx);
                }
            }
            return;
        }
    }
    // 2. OBJECTIVE CHECK (Turtle at 1:50+, Lord at 7:50+) for Jungler / Roam (or Mythic Mid/EXP)
    var shouldContestObjective = !isBrawl && (hero.isJungler || hero.isRoamer || diff.tier === 'mythic' && (hero.lane === 'Mid' || hero.lane === 'EXP'));
    if (shouldContestObjective) {
        var objMob = jungleMobs.find(function(m) {
            return m.alive && (m.kind === 'turtle' && matchTimeSec >= 110 || m.kind === 'lord' && matchTimeSec >= 470) && (0, _CombatMath.dist)(hero.x, hero.y, m.x, m.y) < (hero.isJungler || hero.isRoamer ? 1750 : 1150);
        });
        if (objMob) {
            hero.aiState = 'objective';
            var dObj = (0, _CombatMath.dist)(hero.x, hero.y, objMob.x, objMob.y);
            var ang1 = Math.atan2(objMob.y - hero.y, objMob.x - hero.x);
            hero.facing = ang1;
            if (dObj > hero.heroDef.attackRange * 0.85) {
                hero.vx = Math.cos(ang1);
                hero.vy = Math.sin(ang1);
            } else {
                hero.vx = 0;
                hero.vy = 0;
                basicAttackTarget(hero, 'jungle', objMob.id);
                if (hero.spellId === 'retribution' && hero.spellCd <= 0) {
                    var thresh = (0, _CombatMath.computeRetributionThreshold)(hero.level, hero.junglerStacks >= 5);
                    if (objMob.hp <= thresh * diff.retriMargin) {
                        (0, _SkillPhysics.castBattleSpell)(hero, ang1, ctx);
                    }
                }
                if (hero.skillCds[0] <= 0 && hero.skillLevels[0] > 0) (0, _SkillPhysics.castHeroSkill)(hero, 1, ang1, dObj, ctx);
            }
            return;
        }
    }
    // 3. JUNGLING for Jungler role (prioritize Buffs before ganks)
    if (!isBrawl && hero.isJungler) {
        var camp = jungleMobs.filter(function(m) {
            return m.alive && m.teamSide === hero.team && m.kind !== 'turtle' && m.kind !== 'lord';
        }).sort(function(a, b) {
            return (0, _CombatMath.dist)(hero.x, hero.y, a.x, a.y) - (0, _CombatMath.dist)(hero.x, hero.y, b.x, b.y);
        })[0];
        if (camp && (0, _CombatMath.dist)(hero.x, hero.y, camp.x, camp.y) < 1100) {
            hero.aiState = 'jungle';
            var dCamp = (0, _CombatMath.dist)(hero.x, hero.y, camp.x, camp.y);
            var ang2 = Math.atan2(camp.y - hero.y, camp.x - hero.x);
            hero.facing = ang2;
            if (dCamp > hero.heroDef.attackRange * 0.85) {
                hero.vx = Math.cos(ang2);
                hero.vy = Math.sin(ang2);
            } else {
                hero.vx = 0;
                hero.vy = 0;
                basicAttackTarget(hero, 'jungle', camp.id);
                if (hero.skillCds[0] <= 0 && hero.skillLevels[0] > 0) (0, _SkillPhysics.castHeroSkill)(hero, 1, ang2, dCamp, ctx);
                if (hero.spellId === 'retribution' && hero.spellCd <= 0 && camp.hp <= (0, _CombatMath.computeRetributionThreshold)(hero.level, hero.junglerStacks >= 5) * diff.retriMargin) {
                    (0, _SkillPhysics.castBattleSpell)(hero, ang2, ctx);
                }
            }
            return;
        }
    }
    // 4. TEAMFIGHT, PEELING & HERO COMBAT
    var enemyHeroes = heroes.filter(function(h) {
        return h.alive && h.team !== hero.team && !h.isTrainingDummy && h.untargetableTimer <= 0 && h.stealthTimer <= 0 && (0, _CombatMath.dist)(hero.x, hero.y, h.x, h.y) <= 800;
    }).sort(function(a, b) {
        return a.hp / Math.max(1, a.maxHp) - b.hp / Math.max(1, b.maxHp);
    });
    // Check if under an enemy turret with no allied minions tanking -> back off!
    var dangerousTurret = turrets.find(function(t) {
        return t.alive && t.team !== hero.team && (0, _CombatMath.dist)(hero.x, hero.y, t.x, t.y) < t.range + 40 && !minions.some(function(m) {
            return m.alive && m.team === hero.team && (0, _CombatMath.dist)(m.x, m.y, t.x, t.y) < t.range;
        });
    });
    if (dangerousTurret) {
        var outAng = Math.atan2(hero.y - dangerousTurret.y, hero.x - dangerousTurret.x);
        hero.vx = Math.cos(outAng);
        hero.vy = Math.sin(outAng);
        hero.facing = outAng;
        return;
    }
    // Support AI: heal/shield low-HP allies
    if (hero.role === 'Support') {
        var lowAlly = heroes.find(function(h) {
            return h.alive && h.team === hero.team && h.id !== hero.id && h.hp / Math.max(1, h.maxHp) < 0.62 && (0, _CombatMath.dist)(hero.x, hero.y, h.x, h.y) < 720;
        });
        if (lowAlly) {
            var ang3 = Math.atan2(lowAlly.y - hero.y, lowAlly.x - hero.x);
            if (hero.skillCds[0] <= 0 && hero.skillLevels[0] > 0) (0, _SkillPhysics.castHeroSkill)(hero, 1, ang3, (0, _CombatMath.dist)(hero.x, hero.y, lowAlly.x, lowAlly.y), ctx);
            if (lowAlly.hp / Math.max(1, lowAlly.maxHp) < 0.44 && hero.skillCds[2] <= 0 && hero.skillLevels[2] > 0) {
                (0, _SkillPhysics.castHeroSkill)(hero, 3, ang3, 300, ctx);
            }
            if (hero.spellCd <= 0 && hero.spellId === 'revitalize' && (0, _CombatMath.dist)(hero.x, hero.y, lowAlly.x, lowAlly.y) < 340) {
                (0, _SkillPhysics.castBattleSpell)(hero, ang3, ctx);
            }
        }
    }
    // Tank / Support Peel Priority (Epic / Mythic)
    var peelTarget = diff.enablePeel ? (0, _SmartAiBrain.findPeelTarget)(hero, heroes) : null;
    if (enemyHeroes.length > 0 || peelTarget) {
        hero.aiState = 'fight';
        var tgt = peelTarget != null ? peelTarget : enemyHeroes[0];
        var dTgt = (0, _CombatMath.dist)(hero.x, hero.y, tgt.x, tgt.y);
        var ang4 = Math.atan2(tgt.y - hero.y, tgt.x - hero.x);
        hero.facing = ang4;
        // Smart Active Item trigger (Wind of Nature / Winter Crown / Conceal)
        var activeDecision = (0, _SmartAiBrain.shouldTriggerBotActiveOrPurify)(hero, enemyHeroes.length > 0 ? enemyHeroes : [
            tgt
        ], diff);
        if (activeDecision === 'active_item' && triggerActiveItemForHero) {
            triggerActiveItemForHero(hero);
        }
        // Cast combo skills (scaled by difficulty combo cadence)
        if (Math.random() <= diff.comboSkillChance) {
            if (hero.skillLevels[2] > 0 && hero.skillCds[2] <= 0 && (tgt.hp / Math.max(1, tgt.maxHp) < 0.68 || enemyHeroes.length >= 2 || Boolean(peelTarget))) {
                if (dTgt <= Math.max(360, hero.heroDef.skills[2].range)) {
                    (0, _SkillPhysics.castHeroSkill)(hero, 3, ang4, dTgt, ctx);
                }
            }
            if (hero.skillLevels[1] > 0 && hero.skillCds[1] <= 0 && dTgt <= Math.max(280, hero.heroDef.skills[1].range)) {
                (0, _SkillPhysics.castHeroSkill)(hero, 2, ang4, dTgt, ctx);
            }
            if (hero.skillLevels[0] > 0 && hero.skillCds[0] <= 0 && dTgt <= Math.max(280, hero.heroDef.skills[0].range)) {
                (0, _SkillPhysics.castHeroSkill)(hero, 1, ang4, dTgt, ctx);
            }
        }
        if (hero.spellCd <= 0 && tgt.hp / Math.max(1, tgt.maxHp) < 0.26 && (hero.spellId === 'execute' || hero.spellId === 'flameshot')) {
            (0, _SkillPhysics.castBattleSpell)(hero, ang4, ctx);
        }
        if (hero.spellCd <= 0 && (hero.spellId === 'inspire' || hero.spellId === 'vengeance' || hero.spellId === 'petrify' || hero.spellId === 'aegis')) {
            if (dTgt < 340) (0, _SkillPhysics.castBattleSpell)(hero, ang4, ctx);
        }
        // Precision Kiting & Strafe Movement for Marksmen / Mages vs Melee chase
        var idealDist = hero.heroDef.isRanged ? hero.heroDef.attackRange * 0.85 : hero.heroDef.attackRange * 0.72;
        if (dTgt > hero.heroDef.attackRange) {
            hero.vx = Math.cos(ang4);
            hero.vy = Math.sin(ang4);
        } else if (hero.heroDef.isRanged && dTgt < idealDist * 0.68) {
            var strafeDir = ((Math.floor(matchTimeSec * 0.7) + hero.id.charCodeAt(0) % 2) % 2 === 0 ? 1 : -1) * diff.kiteStrafeStrength;
            var backAng = ang4 + Math.PI + strafeDir * 0.45;
            hero.vx = Math.cos(backAng);
            hero.vy = Math.sin(backAng);
            basicAttackTarget(hero, 'hero', tgt.id);
        } else {
            hero.vx = 0;
            hero.vy = 0;
            basicAttackTarget(hero, 'hero', tgt.id);
        }
        // Contextual AI Emote on low-HP duel / kill play
        if (hero.emoteCd <= 0 && tgt.hp / Math.max(1, tgt.maxHp) < 0.2 && Math.random() < 0.012) {
            var em = _emblems.MLBB_EMOTES[Math.floor(Math.random() * 4)];
            triggerHeroEmote(hero, em.id);
        }
        return;
    }
    // 4B. PROACTIVE GANKING FOR JUNGLER / ROAM / MID (Epic & Mythic)
    if (!isBrawl && diff.enableGanking) {
        var gankTarget = (0, _SmartAiBrain.findGankOpportunity)(hero, heroes, turrets);
        if (gankTarget) {
            hero.aiState = 'fight';
            var gAng = Math.atan2(gankTarget.y - hero.y, gankTarget.x - hero.x);
            hero.vx = Math.cos(gAng);
            hero.vy = Math.sin(gAng);
            hero.facing = gAng;
            return;
        }
    }
    // 5. LANING & PUSHING MINIONS / TURRETS
    hero.aiState = 'lane';
    var laneKey = getAssignedLaneKey(hero, expLane, goldLane, isBrawl);
    var wps = _mapData.LANE_WAYPOINTS[laneKey];
    var ordered = hero.team === 'blue' ? wps : [].concat(wps).reverse();
    var enemyMinion = minions.filter(function(m) {
        return m.alive && m.team !== hero.team && (0, _CombatMath.dist)(hero.x, hero.y, m.x, m.y) < 580;
    }).sort(function(a, b) {
        return a.hp - b.hp;
    })[0];
    if (enemyMinion) {
        var dm = (0, _CombatMath.dist)(hero.x, hero.y, enemyMinion.x, enemyMinion.y);
        var ang5 = Math.atan2(enemyMinion.y - hero.y, enemyMinion.x - hero.x);
        hero.facing = ang5;
        if (dm > hero.heroDef.attackRange * 0.9) {
            hero.vx = Math.cos(ang5);
            hero.vy = Math.sin(ang5);
        } else {
            hero.vx = 0;
            hero.vy = 0;
            basicAttackTarget(hero, 'minion', enemyMinion.id);
            if (hero.skillCds[0] <= 0 && hero.skillLevels[0] > 0 && hero.mana / Math.max(1, hero.maxMana) > 0.45) {
                (0, _SkillPhysics.castHeroSkill)(hero, 1, ang5, dm, ctx);
            }
        }
        return;
    }
    var enemyTurret = turrets.filter(function(t) {
        return t.alive && t.team !== hero.team && (0, _CombatMath.dist)(hero.x, hero.y, t.x, t.y) < 620;
    }).sort(function(a, b) {
        return (0, _CombatMath.dist)(hero.x, hero.y, a.x, a.y) - (0, _CombatMath.dist)(hero.x, hero.y, b.x, b.y);
    })[0];
    if (enemyTurret) {
        var allyTank = minions.some(function(m) {
            return m.alive && m.team === hero.team && (0, _CombatMath.dist)(m.x, m.y, enemyTurret.x, enemyTurret.y) < enemyTurret.range;
        });
        var dtTurret = (0, _CombatMath.dist)(hero.x, hero.y, enemyTurret.x, enemyTurret.y);
        var ang6 = Math.atan2(enemyTurret.y - hero.y, enemyTurret.x - hero.x);
        if (allyTank) {
            hero.facing = ang6;
            if (dtTurret > hero.heroDef.attackRange + 35) {
                hero.vx = Math.cos(ang6);
                hero.vy = Math.sin(ang6);
            } else {
                hero.vx = 0;
                hero.vy = 0;
                basicAttackTarget(hero, 'turret', enemyTurret.id);
            }
            return;
        }
    }
    var targetWp = ordered[Math.min(ordered.length - 1, Math.floor(ordered.length / 2))];
    for(var i = 0; i < ordered.length; i++){
        var _ret = _loop(i);
        if (_ret === "break") break;
    }
    var ang7 = Math.atan2(targetWp.y - hero.y, targetWp.x - hero.x);
    hero.vx = Math.cos(ang7);
    hero.vy = Math.sin(ang7);
    hero.facing = ang7;
}

});

})(window.ArcadeMod);
