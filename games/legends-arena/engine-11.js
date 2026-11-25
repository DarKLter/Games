(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mobaBattlefield ===
ArcadeMod.define("src/games/legends-arena/mobaBattlefield", function(require, module, exports) {
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
    get CYCLONE_EYE_SPECS () {
        return CYCLONE_EYE_SPECS;
    },
    get FLYING_CLOUD_BLUE_SPOT () {
        return FLYING_CLOUD_BLUE_SPOT;
    },
    get LITHO_LOWER_SPOT () {
        return LITHO_LOWER_SPOT;
    },
    get LITHO_UPPER_SPOT () {
        return LITHO_UPPER_SPOT;
    },
    get LOWER_RIVER_PIT () {
        return LOWER_RIVER_PIT;
    },
    get MLBB_TIMERS () {
        return MLBB_TIMERS;
    },
    get MOBA_MAP_VARIANTS () {
        return MOBA_MAP_VARIANTS;
    },
    get UPPER_RIVER_PIT () {
        return UPPER_RIVER_PIT;
    },
    get canRespawnNextTurtle () {
        return canRespawnNextTurtle;
    },
    get computeEvolvedLordNeutralDr () {
        return computeEvolvedLordNeutralDr;
    },
    get computeEvolvedLordSummonedDr () {
        return computeEvolvedLordSummonedDr;
    },
    get computeOrangeBuffPenetrationPct () {
        return computeOrangeBuffPenetrationPct;
    },
    get computeRetributionDamage () {
        return computeRetributionDamage;
    },
    get computeTurtleRewards () {
        return computeTurtleRewards;
    },
    get createDynamicLaneAssignment () {
        return createDynamicLaneAssignment;
    },
    get evaluateBattlefieldClock () {
        return evaluateBattlefieldClock;
    },
    get formatMatchClock () {
        return formatMatchClock;
    },
    get getMapVariantDef () {
        return getMapVariantDef;
    },
    get resolveMatchMapVariant () {
        return resolveMatchMapVariant;
    },
    get selectLordWeakestLane () {
        return selectLordWeakestLane;
    },
    get shouldTurtleDissipate () {
        return shouldTurtleDissipate;
    }
});
var MOBA_MAP_VARIANTS = [
    {
        id: 'revealing_wisps',
        name: 'Revealing Wisps',
        shortName: 'Wisps',
        icon: '✨',
        accentHex: '#38bdf8',
        colorNum: 0x38bdf8,
        summary: 'Drifting spirit orbs patrol jungle corridors and reveal enemies hiding in nearby bushes.',
        tacticalTip: 'Track wisp patrols before setting up bush ambushes near buff camps.'
    },
    {
        id: 'healing_turtle',
        name: 'Healing Turtle',
        shortName: 'Heal Turtle',
        icon: '🐢',
        accentHex: '#34d399',
        colorNum: 0x10b981,
        summary: 'Allied heroes near captured/allied Turtle rapidly heal & summon mini-turtle siege companions.',
        tacticalTip: 'Group around your Turtle buff to push outer turrets with mini-turtle siegers.'
    },
    {
        id: 'golden_turret',
        name: 'Golden Turret',
        shortName: 'Gold Turret',
        icon: '🏛️',
        accentHex: '#facc15',
        colorNum: 0xfacc15,
        summary: 'Inner & Base Turrets gain +25% max HP, and every destroyed turret awards +65% teamwide Gold.',
        tacticalTip: 'Prioritize turret takedowns for massive shared gold spikes across your team.'
    },
    {
        id: 'flying_cloud',
        name: 'Flying Cloud',
        shortName: 'Sky Cloud',
        icon: '☁️',
        accentHex: '#a78bfa',
        colorNum: 0xa78bfa,
        summary: 'Interactive cloud launch pad near Base Fountain launches heroes over base walls into outer lanes.',
        tacticalTip: 'Step onto the glowing cloud beside Fountain after respawning to reinforce lanes fast.'
    }
];
function getMapVariantDef(id) {
    var _MOBA_MAP_VARIANTS_find;
    return (_MOBA_MAP_VARIANTS_find = MOBA_MAP_VARIANTS.find(function(v) {
        return v.id === id;
    })) != null ? _MOBA_MAP_VARIANTS_find : MOBA_MAP_VARIANTS[0];
}
function resolveMatchMapVariant(override, rng) {
    if (override === void 0) override = 'random';
    if (rng === void 0) rng = Math.random;
    var _MOBA_MAP_VARIANTS_idx;
    if (override !== 'random') {
        return getMapVariantDef(override);
    }
    var idx = Math.floor(Math.max(0, Math.min(0.999999, rng())) * MOBA_MAP_VARIANTS.length);
    return (_MOBA_MAP_VARIANTS_idx = MOBA_MAP_VARIANTS[idx]) != null ? _MOBA_MAP_VARIANTS_idx : MOBA_MAP_VARIANTS[0];
}
function createDynamicLaneAssignment(firstTurtlePit) {
    if (firstTurtlePit === 'upper') {
        return {
            firstTurtlePit: 'upper',
            expLaneIndex: 0,
            goldLaneIndex: 2,
            expLaneSide: 'top',
            goldLaneSide: 'bottom',
            expMarkerWorld: [
                -104,
                -56
            ],
            goldMarkerWorld: [
                56,
                104
            ]
        };
    }
    return {
        firstTurtlePit: 'lower',
        expLaneIndex: 2,
        goldLaneIndex: 0,
        expLaneSide: 'bottom',
        goldLaneSide: 'top',
        expMarkerWorld: [
            56,
            104
        ],
        goldMarkerWorld: [
            -104,
            -56
        ]
    };
}
var MLBB_TIMERS = {
    FIRST_WAVE_SEC: 10,
    WAVE_INTERVAL_SEC: 30,
    ORANGE_FIRST_SPAWN_SEC: 20,
    PURPLE_FIRST_SPAWN_SEC: 25,
    SMALL_CAMP_FIRST_SPAWN_SEC: 30,
    LITHO_FIRST_SPAWN_SEC: 40,
    CRAB_FIRST_SPAWN_SEC: 42,
    BUFF_RESPAWN_SEC: 90,
    BUFF_DURATION_SEC: 75,
    SMALL_CAMP_RESPAWN_SEC: 70,
    LITHO_RESPAWN_SEC: 120,
    WALKIE_GRASS_DURATION_SEC: 45,
    LITTLE_CRAB_RESPAWN_SEC: 35,
    LARGE_CRAB_RESPAWN_SEC: 90,
    CRAB_AURA_DURATION_SEC: 18,
    CYCLONE_EYE_COOLDOWN_SEC: 45,
    FIRST_TURTLE_SEC: 120,
    TURTLE_RESPAWN_SEC: 120,
    TURTLE_CUTOFF_SEC: 360,
    TURRET_SHIELD_END_SEC: 300,
    FIRST_LORD_SEC: 480,
    TURTLE_MAX_COMBAT_DELAY_SEC: 540,
    ENHANCED_LORD_SEC: 720,
    EVOLVED_LORD_SEC: 1080,
    LORD_STAGE1_RESPAWN_SEC: 180,
    LORD_STAGE2_RESPAWN_SEC: 180,
    LORD_STAGE3_RESPAWN_SEC: 150,
    FLYING_CLOUD_COOLDOWN_SEC: 45
};
function evaluateBattlefieldClock(elapsedSec) {
    var t = Math.max(0, elapsedSec);
    var lordStage = t >= MLBB_TIMERS.EVOLVED_LORD_SEC ? 3 : t >= MLBB_TIMERS.ENHANCED_LORD_SEC ? 2 : t >= MLBB_TIMERS.FIRST_LORD_SEC ? 1 : 0;
    var lordStageLabel = lordStage === 3 ? 'Evolved Lord' : lordStage === 2 ? 'Enhanced Lord' : lordStage === 1 ? 'Neutral Lord' : 'Turtle Phase';
    var lordRespawnSec = lordStage === 3 ? MLBB_TIMERS.LORD_STAGE3_RESPAWN_SEC : MLBB_TIMERS.LORD_STAGE1_RESPAWN_SEC;
    var nextMilestoneLabel = 'Evolved Lord Active';
    var nextMilestoneInSec = 0;
    if (t < MLBB_TIMERS.FIRST_WAVE_SEC) {
        nextMilestoneLabel = 'First Minion Wave';
        nextMilestoneInSec = MLBB_TIMERS.FIRST_WAVE_SEC - t;
    } else if (t < MLBB_TIMERS.ORANGE_FIRST_SPAWN_SEC) {
        nextMilestoneLabel = 'Orange Buff Spawn';
        nextMilestoneInSec = MLBB_TIMERS.ORANGE_FIRST_SPAWN_SEC - t;
    } else if (t < MLBB_TIMERS.FIRST_TURTLE_SEC) {
        nextMilestoneLabel = 'First Turtle & Large Crabs';
        nextMilestoneInSec = MLBB_TIMERS.FIRST_TURTLE_SEC - t;
    } else if (t < MLBB_TIMERS.TURRET_SHIELD_END_SEC) {
        nextMilestoneLabel = 'Turret Shields Expire';
        nextMilestoneInSec = MLBB_TIMERS.TURRET_SHIELD_END_SEC - t;
    } else if (t < MLBB_TIMERS.FIRST_LORD_SEC) {
        nextMilestoneLabel = 'Neutral Lord (Stage 1)';
        nextMilestoneInSec = MLBB_TIMERS.FIRST_LORD_SEC - t;
    } else if (t < MLBB_TIMERS.ENHANCED_LORD_SEC) {
        nextMilestoneLabel = 'Enhanced Lord (Stage 2)';
        nextMilestoneInSec = MLBB_TIMERS.ENHANCED_LORD_SEC - t;
    } else if (t < MLBB_TIMERS.EVOLVED_LORD_SEC) {
        nextMilestoneLabel = 'Evolved Lord (Stage 3)';
        nextMilestoneInSec = MLBB_TIMERS.EVOLVED_LORD_SEC - t;
    }
    return {
        elapsedSec: t,
        wavesStarted: t >= MLBB_TIMERS.FIRST_WAVE_SEC,
        orangeBuffReady: t >= MLBB_TIMERS.ORANGE_FIRST_SPAWN_SEC,
        purpleBuffReady: t >= MLBB_TIMERS.PURPLE_FIRST_SPAWN_SEC,
        smallCampsReady: t >= MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN_SEC,
        lithoReady: t >= MLBB_TIMERS.LITHO_FIRST_SPAWN_SEC,
        crabsReady: t >= MLBB_TIMERS.CRAB_FIRST_SPAWN_SEC,
        largeGoldCrabsActive: t >= MLBB_TIMERS.FIRST_TURTLE_SEC,
        junglerJungleDrActive: t < MLBB_TIMERS.FIRST_TURTLE_SEC,
        outerTurretShieldActive: t < MLBB_TIMERS.TURRET_SHIELD_END_SEC,
        laneCannonBonusActive: t < MLBB_TIMERS.TURRET_SHIELD_END_SEC,
        junglerLanePenaltyActive: t < MLBB_TIMERS.TURRET_SHIELD_END_SEC,
        roamDevotionActive: t < MLBB_TIMERS.FIRST_LORD_SEC,
        innerTurretEarlyDrActive: t < MLBB_TIMERS.FIRST_LORD_SEC,
        baseTurretEarlyBuffActive: t < MLBB_TIMERS.ENHANCED_LORD_SEC,
        minionSpeedBoostActive: t >= MLBB_TIMERS.ENHANCED_LORD_SEC,
        lateGameEscalationActive: t >= MLBB_TIMERS.EVOLVED_LORD_SEC,
        lordStage: lordStage,
        lordStageLabel: lordStageLabel,
        lordRespawnSec: lordRespawnSec,
        nextMilestoneLabel: nextMilestoneLabel,
        nextMilestoneInSec: Math.max(0, Math.ceil(nextMilestoneInSec))
    };
}
function canRespawnNextTurtle(slainAtSec) {
    return slainAtSec < MLBB_TIMERS.TURTLE_CUTOFF_SEC;
}
function shouldTurtleDissipate(elapsedSec, outOfCombatSec) {
    if (elapsedSec >= MLBB_TIMERS.TURTLE_MAX_COMBAT_DELAY_SEC) return true;
    if (elapsedSec >= MLBB_TIMERS.FIRST_LORD_SEC && outOfCombatSec >= 5) return true;
    return false;
}
function computeTurtleRewards(turtleNumber, heroLevel) {
    var n = Math.max(1, Math.round(turtleNumber));
    var lv = Math.max(1, Math.min(15, Math.round(heroLevel)));
    return {
        teamGold: 60 + (n - 1) * 10,
        teamXp: 90 + (n - 1) * 20,
        teamShieldHp: 200 + 20 * lv,
        teamShieldSec: 120,
        slayerShieldHp: 400 + 40 * lv,
        slayerPhysAtkBonus: 20 + 2 * lv,
        slayerMagicPowerBonus: 25 + 4 * lv
    };
}
function computeEvolvedLordNeutralDr(nearbyHeroCount) {
    var count = Math.max(0, Math.floor(nearbyHeroCount));
    return Number(Math.max(0.15, 0.4 - count * 0.05).toFixed(2));
}
function computeEvolvedLordSummonedDr(nearbyAllyCount) {
    var count = Math.max(0, Math.floor(nearbyAllyCount));
    return Number(Math.min(0.25, count * 0.05).toFixed(2));
}
function selectLordWeakestLane(redStandingTurretsPerLane) {
    var c0 = redStandingTurretsPerLane[0];
    var c1 = redStandingTurretsPerLane[1];
    var c2 = redStandingTurretsPerLane[2];
    var minVal = Math.min(c0, c1, c2);
    // Default to Mid (1) when tied, matching MLBB Lord lane rules
    if (c1 === minVal) return 1;
    if (c0 === minVal) return 0;
    return 2;
}
function computeOrangeBuffPenetrationPct(role) {
    if (role === 'Assassin' || role === 'Marksman' || role === 'Mage') return 10;
    return 5;
}
function computeRetributionDamage(heroLevel, evolved) {
    var lv = Math.max(1, Math.min(15, Math.round(heroLevel)));
    return (evolved ? 310 : 240) + lv * 26;
}
function formatMatchClock(sec) {
    var safe = Math.max(0, Math.floor(sec));
    var m = Math.floor(safe / 60);
    var s = safe % 60;
    return String(m).padStart(2, '0') + ":" + String(s).padStart(2, '0');
}
var CYCLONE_EYE_SPECS = [
    {
        id: 'cyclone_blue_top',
        x: -56,
        z: 10
    },
    {
        id: 'cyclone_blue_bot',
        x: -10,
        z: 56
    },
    {
        id: 'cyclone_red_top',
        x: 10,
        z: -56
    },
    {
        id: 'cyclone_red_bot',
        x: 56,
        z: -10
    }
];
var UPPER_RIVER_PIT = [
    -36,
    -36
];
var LOWER_RIVER_PIT = [
    36,
    36
];
var LITHO_UPPER_SPOT = [
    -16,
    -16
];
var LITHO_LOWER_SPOT = [
    16,
    16
];
var FLYING_CLOUD_BLUE_SPOT = [
    -94,
    94
];

});
// === MODULE: src/games/legends-arena/mobaElementalVfx ===
ArcadeMod.define("src/games/legends-arena/mobaElementalVfx", function(require, module, exports) {
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
    get animateElementalStatusMesh () {
        return animateElementalStatusMesh;
    },
    get animateElementalVfx () {
        return animateElementalVfx;
    },
    get createElementalImpactVfx () {
        return createElementalImpactVfx;
    },
    get createElementalProjectileMesh () {
        return createElementalProjectileMesh;
    },
    get createElementalStatusMesh () {
        return createElementalStatusMesh;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _arenaRoster = require("../../core/arenaRoster");
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
function makeBasicMat(color, opacity, doubleSide) {
    if (opacity === void 0) opacity = 0.85;
    if (doubleSide === void 0) doubleSide = false;
    return new _three.MeshBasicMaterial({
        color: color,
        transparent: opacity < 0.99,
        opacity: opacity,
        side: doubleSide ? _three.DoubleSide : _three.FrontSide,
        depthWrite: opacity >= 0.95
    });
}
function makeGroundMat(color, opacity, polyFactor) {
    if (polyFactor === void 0) polyFactor = -2;
    return new _three.MeshBasicMaterial({
        color: color,
        side: _three.DoubleSide,
        transparent: true,
        opacity: opacity,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: polyFactor
    });
}
function createElementalProjectileMesh(theme, scale) {
    if (scale === void 0) scale = 1.0;
    var pal = _arenaRoster.MOBA_ELEMENT_PALETTES[theme];
    var g = new _three.Group();
    g.scale.setScalar(scale);
    switch(theme){
        case 'fire':
            {
                var core = new _three.Mesh(new _three.SphereGeometry(0.44, 10, 8), makeBasicMat(pal.core, 0.96));
                var shell = new _three.Mesh(new _three.SphereGeometry(0.62, 10, 8), makeBasicMat(pal.primary, 0.78));
                var tail = new _three.Mesh(new _three.ConeGeometry(0.54, 1.85, 8), makeBasicMat(pal.secondary, 0.72));
                tail.rotation.x = -Math.PI / 2;
                tail.position.z = -1.0;
                var halo = new _three.Mesh(new _three.TorusGeometry(0.66, 0.08, 6, 14), makeBasicMat(pal.primary, 0.7));
                g.add(core, shell, tail, halo);
                break;
            }
        case 'ice':
            {
                var shard = new _three.Mesh(new _three.ConeGeometry(0.42, 2.2, 6), makeBasicMat(pal.primary, 0.82));
                shard.rotation.x = Math.PI / 2;
                shard.position.z = 0.25;
                var back = new _three.Mesh(new _three.ConeGeometry(0.36, 1.05, 6), makeBasicMat(pal.secondary, 0.78));
                back.rotation.x = -Math.PI / 2;
                back.position.z = -0.8;
                var crystalCore = new _three.Mesh(new _three.OctahedronGeometry(0.34, 0), makeBasicMat(pal.core, 0.95));
                g.add(shard, back, crystalCore);
                break;
            }
        case 'lightning':
            {
                var core1 = new _three.Mesh(new _three.OctahedronGeometry(0.46, 0), makeBasicMat(pal.core, 0.98));
                var ringA = new _three.Mesh(new _three.TorusGeometry(0.68, 0.07, 6, 14), makeBasicMat(pal.primary, 0.85));
                ringA.rotation.x = Math.PI / 3;
                var ringB = new _three.Mesh(new _three.TorusGeometry(0.68, 0.07, 6, 14), makeBasicMat(pal.secondary, 0.85));
                ringB.rotation.y = Math.PI / 3;
                var tail1 = new _three.Mesh(new _three.CylinderGeometry(0.08, 0.24, 1.6, 6), makeBasicMat(pal.secondary, 0.78));
                tail1.rotation.x = Math.PI / 2;
                tail1.position.z = -0.9;
                g.add(core1, ringA, ringB, tail1);
                break;
            }
        case 'wind':
            {
                var crescent = new _three.Mesh(new _three.TorusGeometry(0.82, 0.14, 6, 14, Math.PI * 1.15), makeBasicMat(pal.primary, 0.86));
                crescent.rotation.x = Math.PI / 2;
                crescent.rotation.z = -Math.PI * 0.08;
                var inner = new _three.Mesh(new _three.TorusGeometry(0.58, 0.08, 6, 12, Math.PI), makeBasicMat(pal.core, 0.92));
                inner.rotation.x = Math.PI / 2;
                g.add(crescent, inner);
                break;
            }
        case 'water':
            {
                var orb = new _three.Mesh(new _three.SphereGeometry(0.52, 10, 8), makeBasicMat(pal.primary, 0.82));
                var crest = new _three.Mesh(new _three.TorusGeometry(0.65, 0.12, 6, 14, Math.PI * 1.25), makeBasicMat(pal.secondary, 0.84));
                crest.rotation.x = Math.PI / 2;
                var core2 = new _three.Mesh(new _three.SphereGeometry(0.28, 8, 6), makeBasicMat(pal.core, 0.95));
                g.add(orb, crest, core2);
                break;
            }
        case 'shadow':
            {
                var blade = new _three.Mesh(new _three.ConeGeometry(0.38, 2.0, 4), makeBasicMat(pal.primary, 0.9));
                blade.rotation.x = Math.PI / 2;
                blade.position.z = 0.2;
                var aura = new _three.Mesh(new _three.TorusGeometry(0.58, 0.08, 6, 12), makeBasicMat(pal.secondary, 0.8));
                var core3 = new _three.Mesh(new _three.OctahedronGeometry(0.32, 0), makeBasicMat(pal.core, 0.9));
                g.add(blade, aura, core3);
                break;
            }
        case 'nature':
            {
                var thorn = new _three.Mesh(new _three.ConeGeometry(0.34, 1.9, 6), makeBasicMat(pal.primary, 0.92));
                thorn.rotation.x = Math.PI / 2;
                var leafL = new _three.Mesh(new _three.BoxGeometry(0.75, 0.08, 0.35), makeBasicMat(pal.secondary, 0.85));
                leafL.position.set(-0.35, 0, -0.35);
                leafL.rotation.y = 0.45;
                var leafR = new _three.Mesh(new _three.BoxGeometry(0.75, 0.08, 0.35), makeBasicMat(pal.secondary, 0.85));
                leafR.position.set(0.35, 0, -0.35);
                leafR.rotation.y = -0.45;
                g.add(thorn, leafL, leafR);
                break;
            }
        case 'celestial':
            {
                var star = new _three.Mesh(new _three.OctahedronGeometry(0.5, 0), makeBasicMat(pal.core, 0.98));
                var lance = new _three.Mesh(new _three.ConeGeometry(0.26, 2.1, 6), makeBasicMat(pal.primary, 0.88));
                lance.rotation.x = Math.PI / 2;
                var halo1 = new _three.Mesh(new _three.TorusGeometry(0.68, 0.07, 6, 16), makeBasicMat(pal.secondary, 0.82));
                g.add(star, lance, halo1);
                break;
            }
        case 'earth':
            {
                var rock = new _three.Mesh(new _three.DodecahedronGeometry(0.56, 0), makeBasicMat(pal.primary, 0.96));
                var crack = new _three.Mesh(new _three.TorusGeometry(0.62, 0.08, 5, 10), makeBasicMat(pal.secondary, 0.82));
                g.add(rock, crack);
                break;
            }
        case 'blood':
            {
                var scythe = new _three.Mesh(new _three.TorusGeometry(0.78, 0.14, 6, 14, Math.PI * 1.15), makeBasicMat(pal.primary, 0.92));
                scythe.rotation.x = Math.PI / 2;
                var core4 = new _three.Mesh(new _three.SphereGeometry(0.34, 8, 6), makeBasicMat(pal.core, 0.9));
                g.add(scythe, core4);
                break;
            }
        default:
            {
                var bolt = new _three.Mesh(new _three.CylinderGeometry(0.18, 0.22, 1.75, 8), makeBasicMat(pal.primary, 0.94));
                bolt.rotation.x = Math.PI / 2;
                var tip = new _three.Mesh(new _three.ConeGeometry(0.28, 0.7, 8), makeBasicMat(pal.secondary, 0.96));
                tip.rotation.x = Math.PI / 2;
                tip.position.z = 1.05;
                g.add(bolt, tip);
                break;
            }
    }
    return g;
}
function createElementalImpactVfx(theme, kind, size, yaw) {
    var pal = _arenaRoster.MOBA_ELEMENT_PALETTES[theme];
    var g = new _three.Group();
    var safeSize = Math.max(2.2, Math.min(26, size));
    // Directional Beam or Hook Chain
    if (kind === 'beam' || kind === 'hook_chain') {
        var len = Math.max(6, safeSize);
        var outer = new _three.Mesh(new _three.CylinderGeometry(0.62, 0.82, len, 10, 1, true), makeBasicMat(pal.primary, 0.62, true));
        outer.position.set(0, 1.5, len * 0.5);
        outer.rotation.x = Math.PI / 2;
        var core = new _three.Mesh(new _three.CylinderGeometry(0.24, 0.34, len, 8), makeBasicMat(pal.core, 0.95));
        core.position.set(0, 1.5, len * 0.5);
        core.rotation.x = Math.PI / 2;
        var muzzle = new _three.Mesh(new _three.RingGeometry(0.5, 1.65, 16), makeBasicMat(pal.secondary, 0.82, true));
        muzzle.position.set(0, 1.5, 0.7);
        g.add(outer, core, muzzle);
        // Add elemental accents along the beam (rings or jagged segments)
        var accentCount = 3;
        for(var i = 1; i <= accentCount; i++){
            var ring = new _three.Mesh(new _three.TorusGeometry(0.95, 0.08, 6, 14), makeBasicMat(pal.secondary, 0.78));
            ring.position.set(0, 1.5, len / (accentCount + 1) * i);
            g.add(ring);
        }
        g.rotation.y = yaw;
        return {
            group: g,
            duration: 0.42,
            animKind: 'beam'
        };
    }
    // Sweeping Elemental Slash Arc
    if (kind === 'slash_arc') {
        var rad = Math.max(3.4, safeSize * 0.72);
        var arcOuter = new _three.Mesh(new _three.RingGeometry(rad * 0.58, rad, 22, 1, -Math.PI * 0.58, Math.PI * 1.16), makeGroundMat(pal.primary, 0.86, -3));
        arcOuter.rotation.x = -Math.PI / 2;
        arcOuter.rotation.z = Math.PI / 2;
        arcOuter.position.y = 1.35;
        var arcInner = new _three.Mesh(new _three.RingGeometry(rad * 0.78, rad * 0.94, 20, 1, -Math.PI * 0.5, Math.PI), makeGroundMat(pal.core, 0.92, -4));
        arcInner.rotation.x = -Math.PI / 2;
        arcInner.rotation.z = Math.PI / 2;
        arcInner.position.y = 1.42;
        var groundWave = new _three.Mesh(new _three.RingGeometry(rad * 0.35, rad * 0.92, 24), makeGroundMat(pal.secondary, 0.45, -2));
        groundWave.rotation.x = -Math.PI / 2;
        groundWave.position.y = 0.16;
        g.add(arcOuter, arcInner, groundWave);
        g.rotation.y = yaw;
        return {
            group: g,
            duration: 0.36,
            animKind: 'slash'
        };
    }
    // Protective / Buff Elemental Dome
    if (kind === 'dome' || kind === 'shield_dome' || kind === 'transform_giant' || kind === 'stealth_mist') {
        var r = Math.max(2.4, safeSize * 0.45);
        var shell = new _three.Mesh(new _three.SphereGeometry(r, 14, 12), new _three.MeshBasicMaterial({
            color: pal.primary,
            transparent: true,
            opacity: 0.28,
            wireframe: true
        }));
        shell.position.y = 1.7;
        var baseRing = new _three.Mesh(new _three.RingGeometry(r * 0.72, r * 1.15, 28), makeGroundMat(pal.secondary, 0.76, -2));
        baseRing.rotation.x = -Math.PI / 2;
        baseRing.position.y = 0.18;
        var halo = new _three.Mesh(new _three.TorusGeometry(r * 0.95, 0.12, 8, 24), makeBasicMat(pal.core, 0.75));
        halo.rotation.x = Math.PI / 2;
        halo.position.y = 1.8;
        g.add(shell, baseRing, halo);
        return {
            group: g,
            duration: 0.55,
            animKind: 'dome'
        };
    }
    // Element-specific signature composite 3D bursts & eruptions
    var r1 = Math.max(3.2, safeSize * 0.76);
    var groundRing = new _three.Mesh(new _three.RingGeometry(r1 * 0.55, r1, 28), makeGroundMat(pal.primary, 0.76, -2));
    groundRing.rotation.x = -Math.PI / 2;
    groundRing.position.y = 0.16;
    var groundFill = new _three.Mesh(new _three.CircleGeometry(r1 * 0.88, 24), makeGroundMat(pal.secondary, 0.24, -1));
    groundFill.rotation.x = -Math.PI / 2;
    groundFill.position.y = 0.14;
    g.add(groundRing, groundFill);
    switch(theme){
        case 'fire':
            {
                // Valir / X.Borg / Thamuz: Blazing central inferno cone + 6 roaring flame pillars + floating ember orbs
                var centerFlame = new _three.Mesh(new _three.ConeGeometry(r1 * 0.34, 5.4, 8), makeBasicMat(pal.core, 0.85));
                centerFlame.position.y = 2.7;
                g.add(centerFlame);
                for(var i1 = 0; i1 < 6; i1++){
                    var ang = i1 / 6 * Math.PI * 2;
                    var dist = r1 * 0.56;
                    var h = 3.2 + i1 % 2 * 1.4;
                    var tongue = new _three.Mesh(new _three.ConeGeometry(r1 * 0.18, h, 7), makeBasicMat(i1 % 2 === 0 ? pal.primary : pal.secondary, 0.82));
                    tongue.position.set(Math.cos(ang) * dist, h * 0.5, Math.sin(ang) * dist);
                    tongue.rotation.z = -Math.cos(ang) * 0.18;
                    tongue.rotation.x = Math.sin(ang) * 0.18;
                    g.add(tongue);
                }
                var scorchRing = new _three.Mesh(new _three.TorusGeometry(r1 * 0.68, 0.22, 6, 20), makeBasicMat(pal.primary, 0.78));
                scorchRing.rotation.x = Math.PI / 2;
                scorchRing.position.y = 0.85;
                g.add(scorchRing);
                return {
                    group: g,
                    duration: 0.62,
                    animKind: 'fire_burst'
                };
            }
        case 'ice':
            {
                // Aurora / Atlas / Freya: Jagged translucent glacier crystal cluster + frost star rays
                var centralSpire = new _three.Mesh(new _three.ConeGeometry(r1 * 0.28, 6.2, 5), makeBasicMat(pal.core, 0.82));
                centralSpire.position.y = 3.1;
                g.add(centralSpire);
                for(var i2 = 0; i2 < 6; i2++){
                    var ang1 = i2 / 6 * Math.PI * 2;
                    var dist1 = r1 * 0.52;
                    var shard = new _three.Mesh(new _three.ConeGeometry(r1 * 0.19, 3.8 + i2 % 2 * 1.1, 5), makeBasicMat(i2 % 2 === 0 ? pal.primary : pal.secondary, 0.78));
                    shard.position.set(Math.cos(ang1) * dist1, 1.85, Math.sin(ang1) * dist1);
                    shard.rotation.z = -Math.cos(ang1) * 0.36;
                    shard.rotation.x = Math.sin(ang1) * 0.36;
                    g.add(shard);
                }
                // 6-point snowflake star on ground
                for(var i3 = 0; i3 < 3; i3++){
                    var bar = new _three.Mesh(new _three.PlaneGeometry(r1 * 1.85, 0.32), makeGroundMat(pal.core, 0.78, -3));
                    bar.rotation.x = -Math.PI / 2;
                    bar.rotation.z = i3 * Math.PI / 3;
                    bar.position.y = 0.2;
                    g.add(bar);
                }
                return {
                    group: g,
                    duration: 0.68,
                    animKind: 'ice_burst'
                };
            }
        case 'lightning':
            {
                // Eudora / Kaja / Joy / Johnson: Jagged multi-segment sky thunderbolt + ionized spark rings
                var segs = [
                    {
                        x: 0.55,
                        y: 12.5,
                        z: -0.35,
                        h: 5.5,
                        rx: 0.16,
                        rz: -0.22
                    },
                    {
                        x: -0.45,
                        y: 7.5,
                        z: 0.4,
                        h: 5.2,
                        rx: -0.2,
                        rz: 0.24
                    },
                    {
                        x: 0.15,
                        y: 2.6,
                        z: -0.1,
                        h: 5.2,
                        rx: 0.12,
                        rz: -0.14
                    }
                ];
                for(var _iterator = _create_for_of_iterator_helper_loose(segs), _step; !(_step = _iterator()).done;){
                    var s = _step.value;
                    var outer1 = new _three.Mesh(new _three.CylinderGeometry(0.32, 0.44, s.h, 6), makeBasicMat(pal.primary, 0.82));
                    outer1.position.set(s.x, s.y, s.z);
                    outer1.rotation.set(s.rx, 0, s.rz);
                    var core1 = new _three.Mesh(new _three.CylinderGeometry(0.14, 0.18, s.h, 6), makeBasicMat(pal.secondary, 0.98));
                    core1.position.set(s.x, s.y, s.z);
                    core1.rotation.set(s.rx, 0, s.rz);
                    g.add(outer1, core1);
                }
                var arcRing = new _three.Mesh(new _three.TorusGeometry(r1 * 0.62, 0.14, 6, 18), makeBasicMat(pal.secondary, 0.9));
                arcRing.rotation.x = Math.PI / 2;
                arcRing.position.y = 1.4;
                g.add(arcRing);
                return {
                    group: g,
                    duration: 0.5,
                    animKind: 'lightning_strike'
                };
            }
        case 'wind':
            {
                // Vale / Ling / Zilong: Ascending helical cyclone rings + spinning wind blades
                for(var i4 = 0; i4 < 4; i4++){
                    var t = i4 / 3;
                    var ring1 = new _three.Mesh(new _three.TorusGeometry(r1 * (0.36 + t * 0.45), 0.14, 6, 20), makeBasicMat(i4 % 2 === 0 ? pal.primary : pal.secondary, 0.8));
                    ring1.rotation.x = Math.PI / 2 + (i4 % 2 === 0 ? 0.16 : -0.16);
                    ring1.position.y = 0.75 + i4 * 1.45;
                    g.add(ring1);
                }
                return {
                    group: g,
                    duration: 0.6,
                    animKind: 'wind_vortex'
                };
            }
        case 'water':
            {
                // Kadita / Bane / Odette: Tidal surge crest rings + rising aqua splash columns
                var waveWall = new _three.Mesh(new _three.CylinderGeometry(r1 * 0.82, r1 * 0.95, 2.4, 20, 1, true), makeBasicMat(pal.primary, 0.52, true));
                waveWall.position.y = 1.2;
                var foam = new _three.Mesh(new _three.TorusGeometry(r1 * 0.84, 0.2, 6, 22), makeBasicMat(pal.core, 0.85));
                foam.rotation.x = Math.PI / 2;
                foam.position.y = 2.35;
                g.add(waveWall, foam);
                for(var i5 = 0; i5 < 5; i5++){
                    var ang2 = i5 / 5 * Math.PI * 2;
                    var drop = new _three.Mesh(new _three.SphereGeometry(0.42, 8, 6), makeBasicMat(pal.secondary, 0.85));
                    drop.position.set(Math.cos(ang2) * r1 * 0.55, 2.6 + i5 % 2 * 0.9, Math.sin(ang2) * r1 * 0.55);
                    g.add(drop);
                }
                return {
                    group: g,
                    duration: 0.62,
                    animKind: 'water_surge'
                };
            }
        case 'shadow':
            {
                // Hayabusa / Kagura / Selena / Vexana: Dark-violet abyssal vortex + crimson-edged shadow blades
                var voidPillar = new _three.Mesh(new _three.CylinderGeometry(r1 * 0.25, r1 * 0.68, 5.2, 12, 1, true), makeBasicMat(pal.primary, 0.56, true));
                voidPillar.position.y = 2.6;
                g.add(voidPillar);
                for(var i6 = 0; i6 < 4; i6++){
                    var ang3 = i6 / 4 * Math.PI * 2;
                    var slash = new _three.Mesh(new _three.BoxGeometry(0.18, 3.8, r1 * 0.9), makeBasicMat(i6 % 2 === 0 ? pal.secondary : pal.primary, 0.84));
                    slash.position.set(Math.cos(ang3) * r1 * 0.32, 2.0, Math.sin(ang3) * r1 * 0.32);
                    slash.rotation.y = ang3 + 0.6;
                    slash.rotation.z = 0.28;
                    g.add(slash);
                }
                return {
                    group: g,
                    duration: 0.58,
                    animKind: 'shadow_burst'
                };
            }
        case 'nature':
            {
                // Belerick / Estes / Floryn: Erupting emerald thorn spires + glowing blossom canopy
                for(var i7 = 0; i7 < 6; i7++){
                    var ang4 = i7 / 6 * Math.PI * 2;
                    var vine = new _three.Mesh(new _three.ConeGeometry(0.36, 4.2, 5), makeBasicMat(i7 % 2 === 0 ? pal.primary : pal.secondary, 0.88));
                    vine.position.set(Math.cos(ang4) * r1 * 0.58, 1.9, Math.sin(ang4) * r1 * 0.58);
                    vine.rotation.z = Math.cos(ang4) * 0.32;
                    vine.rotation.x = -Math.sin(ang4) * 0.32;
                    g.add(vine);
                }
                var bloom = new _three.Mesh(new _three.TorusGeometry(r1 * 0.5, 0.16, 6, 16), makeBasicMat(pal.core, 0.82));
                bloom.rotation.x = Math.PI / 2;
                bloom.position.y = 1.6;
                g.add(bloom);
                return {
                    group: g,
                    duration: 0.64,
                    animKind: 'nature_bloom'
                };
            }
        case 'celestial':
            {
                // Rafaela / Miya / Lunox / Yve / Xavier: Radiant sky pillar + golden starlight halo
                var skyBeam = new _three.Mesh(new _three.CylinderGeometry(r1 * 0.36, r1 * 0.56, 13, 14, 1, true), makeBasicMat(pal.primary, 0.48, true));
                skyBeam.position.y = 6.5;
                var innerBeam = new _three.Mesh(new _three.CylinderGeometry(r1 * 0.14, r1 * 0.24, 13, 10), makeBasicMat(pal.core, 0.85));
                innerBeam.position.y = 6.5;
                var halo1 = new _three.Mesh(new _three.TorusGeometry(r1 * 0.72, 0.15, 6, 22), makeBasicMat(pal.secondary, 0.85));
                halo1.rotation.x = Math.PI / 2;
                halo1.position.y = 2.2;
                g.add(skyBeam, innerBeam, halo1);
                return {
                    group: g,
                    duration: 0.6,
                    animKind: 'celestial_burst'
                };
            }
        case 'earth':
            {
                // Grock / Khufra / Minotaur / Gatotkaca: Jutting seismic stone monoliths + shockwave ring
                for(var i8 = 0; i8 < 6; i8++){
                    var ang5 = i8 / 6 * Math.PI * 2;
                    var spike = new _three.Mesh(new _three.DodecahedronGeometry(r1 * 0.24, 0), makeBasicMat(i8 % 2 === 0 ? pal.primary : pal.secondary, 0.94));
                    spike.scale.set(0.85, 2.2, 0.85);
                    spike.position.set(Math.cos(ang5) * r1 * 0.55, 1.45, Math.sin(ang5) * r1 * 0.55);
                    spike.rotation.set(Math.sin(ang5) * 0.35, ang5, -Math.cos(ang5) * 0.35);
                    g.add(spike);
                }
                return {
                    group: g,
                    duration: 0.64,
                    animKind: 'earth_quake'
                };
            }
        case 'blood':
            {
                // Alice / Ruby / Alucard / Balmond / Yu Zhong: Spinning crimson scythe halo + siphon tendrils
                var scythe = new _three.Mesh(new _three.TorusGeometry(r1 * 0.74, 0.22, 6, 20, Math.PI * 1.45), makeBasicMat(pal.primary, 0.9));
                scythe.rotation.x = Math.PI / 2;
                scythe.position.y = 1.5;
                var inner = new _three.Mesh(new _three.TorusGeometry(r1 * 0.45, 0.12, 6, 16), makeBasicMat(pal.core, 0.82));
                inner.rotation.x = Math.PI / 2;
                inner.position.y = 1.65;
                g.add(scythe, inner);
                return {
                    group: g,
                    duration: 0.56,
                    animKind: 'blood_slash'
                };
            }
        default:
            {
                // Steel / Ballistic: Kinetic shockwave rings + metallic sparks
                var shock = new _three.Mesh(new _three.TorusGeometry(r1 * 0.65, 0.16, 6, 20), makeBasicMat(pal.secondary, 0.88));
                shock.rotation.x = Math.PI / 2;
                shock.position.y = 1.2;
                g.add(shock);
                return {
                    group: g,
                    duration: 0.45,
                    animKind: 'steel_burst'
                };
            }
    }
}
function animateElementalVfx(group, animKind, progress, dt) {
    var p = Math.max(0, Math.min(1, progress));
    var fade = Math.max(0.02, 1 - p * p);
    if (animKind === 'fire_burst') {
        var s = 0.75 + p * 0.75;
        group.scale.set(s, 0.85 + Math.sin(p * Math.PI) * 0.75, s);
        group.rotation.y += dt * 3.8;
    } else if (animKind === 'ice_burst') {
        var pop = Math.min(1, p * 4.5);
        group.scale.set(0.8 + pop * 0.35, 0.25 + pop * 0.95, 0.8 + pop * 0.35);
        group.rotation.y += dt * 0.8;
    } else if (animKind === 'lightning_strike') {
        group.rotation.y += dt * 16;
        var s1 = 0.9 + p * 0.45;
        group.scale.set(s1, 1, s1);
    } else if (animKind === 'wind_vortex') {
        group.rotation.y += dt * 11;
        var s2 = 0.8 + p * 0.55;
        group.scale.set(s2, 0.9 + p * 0.5, s2);
    } else if (animKind === 'water_surge') {
        var s3 = 0.72 + p * 0.78;
        group.scale.set(s3, 1.15 - p * 0.4, s3);
        group.rotation.y -= dt * 3.2;
    } else if (animKind === 'shadow_burst' || animKind === 'blood_slash') {
        group.rotation.y += dt * 8.5;
        var s4 = 0.82 + p * 0.55;
        group.scale.set(s4, 1, s4);
    } else if (animKind === 'nature_bloom' || animKind === 'earth_quake') {
        var pop1 = Math.min(1, p * 4.2);
        group.scale.set(0.85 + pop1 * 0.3, 0.2 + pop1 * 0.95, 0.85 + pop1 * 0.3);
    } else if (animKind === 'celestial_burst') {
        group.rotation.y += dt * 4.2;
        var s5 = 0.85 + p * 0.45;
        group.scale.set(s5, 1.0, s5);
    } else if (animKind === 'slash') {
        group.rotation.y += dt * 4.5;
        group.scale.setScalar(0.9 + p * 0.32);
    } else if (animKind === 'beam') {
        var widthScale = Math.max(0.25, 1.15 - p * 0.85);
        group.scale.set(widthScale, widthScale, 1);
    } else if (animKind === 'dome') {
        group.rotation.y += dt * 3.0;
        group.scale.setScalar(0.92 + p * 0.35);
    } else {
        group.scale.setScalar(0.82 + p * 0.65);
    }
    group.traverse(function(obj) {
        var m = obj;
        if (!m.isMesh) return;
        var mat = m.material;
        if (mat && mat.transparent) {
            if (mat.userData.baseOpacity === undefined) {
                mat.userData.baseOpacity = mat.opacity;
            }
            mat.opacity = mat.userData.baseOpacity * fade;
        }
    });
}
function createElementalStatusMesh(statusKind) {
    var g = new _three.Group();
    g.userData.statusKind = statusKind;
    switch(statusKind){
        case 'burn':
            {
                // Flickering flame tongues + molten ground ring
                var ring = new _three.Mesh(new _three.RingGeometry(0.9, 1.38, 18), makeGroundMat(0xff5a1f, 0.78, -3));
                ring.rotation.x = -Math.PI / 2;
                ring.position.y = 0.16;
                g.add(ring);
                for(var i = 0; i < 3; i++){
                    var ang = i / 3 * Math.PI * 2;
                    var flame = new _three.Mesh(new _three.ConeGeometry(0.32, 1.45, 6), makeBasicMat(i === 0 ? 0xfacc15 : 0xff5a1f, 0.86));
                    flame.position.set(Math.cos(ang) * 0.68, 1.1 + i % 2 * 0.45, Math.sin(ang) * 0.68);
                    g.add(flame);
                }
                break;
            }
        case 'freeze':
            {
                // Translucent ice crystal block encasing target + frost shards
                var iceBlock = new _three.Mesh(new _three.OctahedronGeometry(1.48, 0), new _three.MeshBasicMaterial({
                    color: 0x38bdf8,
                    transparent: true,
                    opacity: 0.44,
                    depthWrite: false
                }));
                iceBlock.scale.set(0.95, 1.55, 0.95);
                iceBlock.position.y = 1.65;
                var wire = new _three.Mesh(new _three.OctahedronGeometry(1.52, 0), new _three.MeshBasicMaterial({
                    color: 0xe0f2fe,
                    transparent: true,
                    opacity: 0.72,
                    wireframe: true
                }));
                wire.scale.set(0.95, 1.55, 0.95);
                wire.position.y = 1.65;
                var frostRing = new _three.Mesh(new _three.RingGeometry(1.1, 1.68, 6), makeGroundMat(0xa5f3fc, 0.84, -3));
                frostRing.rotation.x = -Math.PI / 2;
                frostRing.position.y = 0.16;
                g.add(iceBlock, wire, frostRing);
                break;
            }
        case 'shock':
            {
                var arcA = new _three.Mesh(new _three.TorusGeometry(1.15, 0.08, 6, 14), makeBasicMat(0xfde047, 0.92));
                arcA.position.y = 1.5;
                arcA.rotation.x = 0.9;
                var arcB = new _three.Mesh(new _three.TorusGeometry(1.18, 0.08, 6, 14), makeBasicMat(0x60a5fa, 0.92));
                arcB.position.y = 1.85;
                arcB.rotation.z = 1.1;
                g.add(arcA, arcB);
                break;
            }
        case 'vine':
            {
                for(var i1 = 0; i1 < 2; i1++){
                    var coil = new _three.Mesh(new _three.TorusGeometry(1.02, 0.12, 6, 14), makeBasicMat(i1 === 0 ? 0x22c55e : 0xa3e635, 0.9));
                    coil.rotation.x = Math.PI / 2 + (i1 === 0 ? 0.25 : -0.25);
                    coil.position.y = 0.65 + i1 * 0.65;
                    g.add(coil);
                }
                break;
            }
        case 'curse':
            {
                var hex = new _three.Mesh(new _three.RingGeometry(1.05, 1.55, 6), makeGroundMat(0x9333ea, 0.88, -3));
                hex.rotation.x = -Math.PI / 2;
                hex.position.y = 0.18;
                var crown = new _three.Mesh(new _three.TorusGeometry(0.95, 0.09, 6, 12), makeBasicMat(0xf43f5e, 0.88));
                crown.rotation.x = Math.PI / 2;
                crown.position.y = 2.65;
                g.add(hex, crown);
                break;
            }
        case 'bleed':
            {
                var pool = new _three.Mesh(new _three.RingGeometry(0.85, 1.4, 16), makeGroundMat(0xe11d48, 0.84, -3));
                pool.rotation.x = -Math.PI / 2;
                pool.position.y = 0.16;
                var orb = new _three.Mesh(new _three.OctahedronGeometry(0.28, 0), makeBasicMat(0xf43f5e, 0.92));
                orb.position.set(0.85, 1.9, 0);
                g.add(pool, orb);
                break;
            }
        case 'soak':
            {
                var ripple = new _three.Mesh(new _three.RingGeometry(1.0, 1.52, 20), makeGroundMat(0x0ea5e9, 0.8, -3));
                ripple.rotation.x = -Math.PI / 2;
                ripple.position.y = 0.16;
                var crest = new _three.Mesh(new _three.TorusGeometry(0.98, 0.08, 6, 16), makeBasicMat(0x67e8f9, 0.82));
                crest.rotation.x = Math.PI / 2;
                crest.position.y = 1.25;
                g.add(ripple, crest);
                break;
            }
        case 'gust':
            {
                var windA = new _three.Mesh(new _three.TorusGeometry(1.05, 0.08, 6, 16), makeBasicMat(0x2dd4bf, 0.84));
                windA.rotation.x = Math.PI / 2 + 0.2;
                windA.position.y = 1.2;
                g.add(windA);
                break;
            }
        case 'radiant':
            {
                var halo = new _three.Mesh(new _three.TorusGeometry(0.85, 0.09, 6, 16), makeBasicMat(0xfacc15, 0.92));
                halo.rotation.x = Math.PI / 2;
                halo.position.y = 2.95;
                g.add(halo);
                break;
            }
        case 'crush':
            {
                var crack = new _three.Mesh(new _three.RingGeometry(0.95, 1.5, 8), makeGroundMat(0xd97706, 0.84, -3));
                crack.rotation.x = -Math.PI / 2;
                crack.position.y = 0.16;
                g.add(crack);
                break;
            }
        default:
            break;
    }
    return g;
}
function animateElementalStatusMesh(group, statusKind, timeSec, dt) {
    if (statusKind === 'burn') {
        group.rotation.y += dt * 4.5;
        var pulse = 0.92 + Math.sin(timeSec * 16) * 0.16;
        group.scale.set(1, pulse, 1);
    } else if (statusKind === 'freeze') {
        group.rotation.y += dt * 0.7;
    } else if (statusKind === 'shock') {
        group.rotation.y += dt * 12;
        group.scale.setScalar(0.95 + Math.sin(timeSec * 24) * 0.08);
    } else if (statusKind === 'gust' || statusKind === 'soak' || statusKind === 'curse' || statusKind === 'bleed') {
        group.rotation.y += dt * 4.0;
    } else if (statusKind === 'radiant') {
        group.rotation.y += dt * 3.0;
        group.position.y = Math.sin(timeSec * 5) * 0.12;
    }
}

});

})(window.ArcadeMod);
