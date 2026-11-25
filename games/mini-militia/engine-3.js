(function(ArcadeMod){
// === MODULE: src/games/mini-militia/storage ===
ArcadeMod.define("src/games/mini-militia/storage", function(require, module, exports) {
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
    get applyMatchSummaryToSave () {
        return applyMatchSummaryToSave;
    },
    get createDefaultHudLayout () {
        return createDefaultHudLayout;
    },
    get createDefaultMiniMilitiaSave () {
        return createDefaultMiniMilitiaSave;
    },
    get loadMiniMilitiaSave () {
        return loadMiniMilitiaSave;
    },
    get resetMiniMilitiaSave () {
        return resetMiniMilitiaSave;
    },
    get saveMiniMilitiaProfile () {
        return saveMiniMilitiaProfile;
    }
});
var _storage = require("../../core/storage");
var _progression = require("./data/progression");
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
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var MM_SAVE_KEY = 'mini_militia_da2_v1';
function createDefaultHudLayout() {
    return {
        leftStick: {
            id: 'leftStick',
            label: 'Move / Jetpack Stick',
            xPct: 12,
            yPct: 76,
            scale: 1.0,
            opacity: 0.85
        },
        rightStick: {
            id: 'rightStick',
            label: 'Aim / Auto-Fire Stick',
            xPct: 88,
            yPct: 76,
            scale: 1.0,
            opacity: 0.85
        },
        fireBtn: {
            id: 'fireBtn',
            label: 'Fire Button',
            xPct: 78,
            yPct: 60,
            scale: 1.0,
            opacity: 0.9
        },
        crouchBtn: {
            id: 'crouchBtn',
            label: 'Crouch / Roll',
            xPct: 26,
            yPct: 87,
            scale: 0.95,
            opacity: 0.88
        },
        meleeBtn: {
            id: 'meleeBtn',
            label: 'Melee / Machete',
            xPct: 74,
            yPct: 86,
            scale: 1.0,
            opacity: 0.92
        },
        grenadeBtn: {
            id: 'grenadeBtn',
            label: 'Grenade',
            xPct: 86,
            yPct: 12,
            scale: 1.0,
            opacity: 0.94
        },
        reloadBtn: {
            id: 'reloadBtn',
            label: 'Reload',
            xPct: 86,
            yPct: 24,
            scale: 0.95,
            opacity: 0.92
        },
        zoomBtn: {
            id: 'zoomBtn',
            label: 'Zoom Scope',
            xPct: 10,
            yPct: 28,
            scale: 0.95,
            opacity: 0.92
        },
        weaponBox: {
            id: 'weaponBox',
            label: 'Weapon Slot',
            xPct: 50,
            yPct: 8,
            scale: 1.0,
            opacity: 0.96
        },
        quickChat: {
            id: 'quickChat',
            label: 'Quick Chat',
            xPct: 93,
            yPct: 36,
            scale: 0.95,
            opacity: 0.9
        }
    };
}
function defaultAvatarPresets() {
    return [
        {
            name: 'Commando',
            skinTone: '#F7CBA4',
            eyeStyle: 'determined',
            headgear: 'army_helmet',
            eyewear: 'aviators',
            facial: 'stubble',
            outfit: 'olive_camo',
            boots: 'steel',
            accentColor: '#F5A623'
        },
        {
            name: 'Sarge Style',
            skinTone: '#E5B285',
            eyeStyle: 'sarge',
            headgear: 'red_beret',
            eyewear: 'none',
            facial: 'cigar',
            outfit: 'desert_camo',
            boots: 'desert_boots',
            accentColor: '#F59E0B'
        },
        {
            name: 'Shadow Ninja',
            skinTone: '#F7CBA4',
            eyeStyle: 'angry',
            headgear: 'ninja_hood',
            eyewear: 'none',
            facial: 'clean',
            outfit: 'ninja_gi',
            boots: 'stealth_boots',
            accentColor: '#EF4444'
        },
        {
            name: 'SWAT Breacher',
            skinTone: '#C68642',
            eyeStyle: 'cool',
            headgear: 'swat_helmet',
            eyewear: 'tactical_goggles',
            facial: 'respirator',
            outfit: 'black_swat',
            boots: 'plasma_blue',
            accentColor: '#38BDF8'
        },
        {
            name: 'Lunar Trooper',
            skinTone: '#9CA3AF',
            eyeStyle: 'cyber',
            headgear: 'space_visor',
            eyewear: 'cyber_visor',
            facial: 'clean',
            outfit: 'space_suit',
            boots: 'cyber_boots',
            accentColor: '#22D3EE'
        },
        {
            name: 'Commander Gold',
            skinTone: '#E5B285',
            eyeStyle: 'scarred',
            headgear: 'crown',
            eyewear: 'monocle',
            facial: 'full_beard',
            outfit: 'golden_commander',
            boots: 'gold',
            accentColor: '#FDE047'
        }
    ];
}
function createDefaultMiniMilitiaSave() {
    return {
        version: 1,
        callsign: _storage.playerState.username || 'Soldier',
        clanTag: 'DA2',
        playerId: 'DA2-481920',
        xp: 2650,
        coins: 950,
        cash: 320,
        proPackUnlocked: false,
        preferredTeam: 'auto',
        activeAvatarPreset: 0,
        avatarPresets: defaultAvatarPresets(),
        activeLoadoutId: 'classic_default',
        customLoadouts: [
            {
                id: 'custom_1',
                name: 'Custom Slot 1',
                primaryId: 'm4',
                secondaryId: 'deagle',
                grenadeId: 'frag',
                grenadeCount: 3,
                perkId: 'jet_booster',
                coinCost: 220,
                desc: 'Player custom tactical loadout #1.'
            },
            {
                id: 'custom_2',
                name: 'Custom Slot 2',
                primaryId: 'uzi',
                secondaryId: 'uzi',
                dualWieldStart: true,
                grenadeId: 'gas',
                grenadeCount: 3,
                perkId: 'quick_hands',
                coinCost: 260,
                desc: 'Dual Uzi CQC custom loadout #2.'
            },
            {
                id: 'custom_3',
                name: 'Custom Slot 3',
                primaryId: 'm93ba',
                secondaryId: 'machete',
                grenadeId: 'proxy',
                grenadeCount: 3,
                perkId: 'heavy_armor',
                coinCost: 420,
                desc: 'Sniper + Machete custom loadout #3.'
            }
        ],
        unlockedLoadoutIds: [
            'classic_default',
            'pistol_specialist',
            'custom_1',
            'custom_2',
            'custom_3'
        ],
        unlockedCosmeticIds: [
            'army_helmet',
            'bald',
            'buzzcut',
            'spiked_hair',
            'red_beret',
            'commando_bandana',
            'none',
            'aviators',
            'tactical_goggles',
            'clean',
            'sarge_stache',
            'stubble',
            'full_beard',
            'olive_camo',
            'desert_camo',
            'black_swat',
            'steel',
            'desert_boots'
        ],
        unlockedWeaponSkins: {},
        stats: {
            matches: 0,
            wins: 0,
            kills: 0,
            deaths: 0,
            assists: 0,
            headshots: 0,
            meleeKills: 0,
            grenadeKills: 0,
            dualWieldKills: 0,
            sniperHeadshots: 0,
            macheteKills: 0,
            smawKills: 0,
            flameKills: 0,
            sawKills: 0,
            flagCaptures: 0,
            bombActions: 0,
            suicides: 0,
            bestKillstreak: 0,
            bestMultiKill: 0,
            survivalBestWave: 0,
            survivalBestTimeSec: 0,
            bootcampCompleted: false
        },
        weaponMastery: {},
        matchHistory: [],
        claimedAchievements: [],
        friends: [
            {
                id: 'fr_sarge',
                callsign: 'Sarge',
                clanTag: 'DA2',
                rankIndex: 20,
                online: true,
                inSquad: true
            },
            {
                id: 'fr_wolf',
                callsign: 'SniperWolf',
                clanTag: 'PRO',
                rankIndex: 14,
                online: true,
                inSquad: false
            },
            {
                id: 'fr_jet',
                callsign: 'JetAce',
                clanTag: 'AIR',
                rankIndex: 11,
                online: true,
                inSquad: false
            },
            {
                id: 'fr_saw',
                callsign: 'SawBlade',
                clanTag: 'CAT',
                rankIndex: 9,
                online: false,
                inSquad: false
            }
        ],
        settings: {
            controls: {
                controlScheme: 'dual_stick',
                joystickAnchor: 'floating',
                moveSensitivity: 1.0,
                aimSensitivity: 1.0,
                fireRingThreshold: 72,
                aimAssist: 'low',
                crosshairStyle: 'laser_dot',
                weaponLookAhead: 65,
                autoReload: true,
                combatRollMode: 'double_down',
                leftHanded: false
            },
            video: {
                mmcEnhanced: true,
                hitEffects: 'red',
                screenShake: true,
                targetFps: 60,
                showFpsPing: true,
                showNametags: true
            },
            audio: {
                master: 80,
                sfx: 85,
                music: 45,
                voice: 80,
                muted: false
            },
            gameplay: {
                region: 'auto',
                classicV4Default: false,
                unarmedZoom: true,
                autoPickupItems: true,
                showOffscreenArrows: true
            }
        },
        customHud: createDefaultHudLayout()
    };
}
function loadMiniMilitiaSave() {
    var def = createDefaultMiniMilitiaSave();
    try {
        var _parsed_stats, _parsed_weaponMastery, _ref, _ref1, _ref2, _ref3, _parsed_customHud;
        var _parsed_settings, _parsed_settings1, _parsed_settings2, _parsed_settings3;
        var raw = _storage.tryStorage.getItem(MM_SAVE_KEY);
        if (!raw) return def;
        var parsed = JSON.parse(raw);
        return _extends({}, def, parsed, {
            avatarPresets: Array.isArray(parsed.avatarPresets) && parsed.avatarPresets.length === 6 ? parsed.avatarPresets : def.avatarPresets,
            customLoadouts: Array.isArray(parsed.customLoadouts) && parsed.customLoadouts.length === 3 ? parsed.customLoadouts : def.customLoadouts,
            stats: _extends({}, def.stats, (_parsed_stats = parsed.stats) != null ? _parsed_stats : {}),
            weaponMastery: _extends({}, def.weaponMastery, (_parsed_weaponMastery = parsed.weaponMastery) != null ? _parsed_weaponMastery : {}),
            settings: {
                controls: _extends({}, def.settings.controls, (_ref = (_parsed_settings = parsed.settings) == null ? void 0 : _parsed_settings.controls) != null ? _ref : {}),
                video: _extends({}, def.settings.video, (_ref1 = (_parsed_settings1 = parsed.settings) == null ? void 0 : _parsed_settings1.video) != null ? _ref1 : {}),
                audio: _extends({}, def.settings.audio, (_ref2 = (_parsed_settings2 = parsed.settings) == null ? void 0 : _parsed_settings2.audio) != null ? _ref2 : {}),
                gameplay: _extends({}, def.settings.gameplay, (_ref3 = (_parsed_settings3 = parsed.settings) == null ? void 0 : _parsed_settings3.gameplay) != null ? _ref3 : {})
            },
            customHud: _extends({}, def.customHud, (_parsed_customHud = parsed.customHud) != null ? _parsed_customHud : {})
        });
    } catch (unused) {
        return def;
    }
}
function saveMiniMilitiaProfile(save) {
    _storage.tryStorage.setItem(MM_SAVE_KEY, JSON.stringify(save));
}
function resetMiniMilitiaSave() {
    var fresh = createDefaultMiniMilitiaSave();
    saveMiniMilitiaProfile(fresh);
    return fresh;
}
function applyMatchSummaryToSave(prev, sum) {
    var nextMastery = _extends({}, prev.weaponMastery);
    for(var _iterator = _create_for_of_iterator_helper_loose(Object.entries(sum.weaponDeltas)), _step; !(_step = _iterator()).done;){
        var _step_value = _step.value, wid = _step_value[0], delta = _step_value[1];
        var _nextMastery_wid;
        var cur = (_nextMastery_wid = nextMastery[wid]) != null ? _nextMastery_wid : {
            kills: 0,
            shotsFired: 0,
            shotsHit: 0,
            headshots: 0
        };
        nextMastery[wid] = {
            kills: cur.kills + delta.kills,
            shotsFired: cur.shotsFired + delta.shotsFired,
            shotsHit: cur.shotsHit + delta.shotsHit,
            headshots: cur.headshots + delta.headshots
        };
    }
    var prevRank = (0, _progression.getMmRankForXp)(prev.xp).current.index;
    var nextXp = prev.xp + sum.xpEarned;
    var nextRank = (0, _progression.getMmRankForXp)(nextXp).current.index;
    var rankBonusCash = nextRank > prevRank ? (nextRank - prevRank) * 75 : 0;
    var historyEntry = {
        id: "m_" + Date.now(),
        timestamp: Date.now(),
        mapId: sum.mapId,
        mapName: sum.mapName,
        mode: sum.mode,
        victory: sum.victory,
        kills: sum.playerKills,
        deaths: sum.playerDeaths,
        assists: sum.playerAssists,
        scoreBlue: sum.scoreBlue,
        scoreRed: sum.scoreRed,
        waveReached: sum.mode === 'survival' ? sum.waveReached : undefined,
        isMvp: sum.isMvp,
        xpEarned: sum.xpEarned,
        coinsEarned: sum.coinsEarned
    };
    return _extends({}, prev, {
        xp: nextXp,
        coins: prev.coins + sum.coinsEarned,
        cash: prev.cash + sum.cashEarned + rankBonusCash,
        stats: {
            matches: prev.stats.matches + 1,
            wins: prev.stats.wins + (sum.victory ? 1 : 0),
            kills: prev.stats.kills + sum.playerKills,
            deaths: prev.stats.deaths + sum.playerDeaths,
            assists: prev.stats.assists + sum.playerAssists,
            headshots: prev.stats.headshots + sum.headshots,
            meleeKills: prev.stats.meleeKills + sum.meleeKills,
            grenadeKills: prev.stats.grenadeKills + sum.grenadeKills,
            dualWieldKills: prev.stats.dualWieldKills + sum.dualWieldKills,
            sniperHeadshots: prev.stats.sniperHeadshots + sum.sniperHeadshots,
            macheteKills: prev.stats.macheteKills + sum.macheteKills,
            smawKills: prev.stats.smawKills + sum.smawKills,
            flameKills: prev.stats.flameKills + sum.flameKills,
            sawKills: prev.stats.sawKills + sum.sawKills,
            flagCaptures: prev.stats.flagCaptures + sum.flagCaptures,
            bombActions: prev.stats.bombActions + sum.bombActions,
            suicides: prev.stats.suicides + sum.suicides,
            bestKillstreak: Math.max(prev.stats.bestKillstreak, sum.bestStreak),
            bestMultiKill: Math.max(prev.stats.bestMultiKill, sum.bestMultiKill),
            survivalBestWave: Math.max(prev.stats.survivalBestWave, sum.waveReached),
            survivalBestTimeSec: sum.mode === 'survival' ? Math.max(prev.stats.survivalBestTimeSec, Math.round(sum.durationSec)) : prev.stats.survivalBestTimeSec,
            bootcampCompleted: prev.stats.bootcampCompleted || sum.mode === 'bootcamp' && sum.victory
        },
        weaponMastery: nextMastery,
        matchHistory: [].concat([
            historyEntry
        ], prev.matchHistory).slice(0, 20)
    });
}

});
// === MODULE: src/games/mini-militia/types ===
ArcadeMod.define("src/games/mini-militia/types", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});

});

})(window.ArcadeMod);
