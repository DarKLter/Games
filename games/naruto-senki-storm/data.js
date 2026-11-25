(function(ArcadeMod){
// === MODULE: src/games/naruto-senki-storm/narutoCatalog ===
ArcadeMod.define("src/games/naruto-senki-storm/narutoCatalog", function(require, module, exports) {
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
    get NARUTO_FACTIONS () {
        return NARUTO_FACTIONS;
    },
    get NARUTO_MODES () {
        return NARUTO_MODES;
    },
    get NARUTO_SHINOBI_ROSTER () {
        return NARUTO_SHINOBI_ROSTER;
    },
    get NARUTO_STAGES () {
        return NARUTO_STAGES;
    },
    get SENKI_RAMEN_ITEMS () {
        return SENKI_RAMEN_ITEMS;
    },
    get STORM_NINJA_TOOLS () {
        return STORM_NINJA_TOOLS;
    },
    get STORM_SUPPORT_TYPE_DEFS () {
        return STORM_SUPPORT_TYPE_DEFS;
    },
    get computeSenkiLevelStats () {
        return computeSenkiLevelStats;
    },
    get computeStormComboProration () {
        return computeStormComboProration;
    },
    get computeStormMaxUsableChakra () {
        return computeStormMaxUsableChakra;
    },
    get getNarutoShinobiById () {
        return getNarutoShinobiById;
    },
    get resolveNarutoTeamSynergy () {
        return resolveNarutoTeamSynergy;
    },
    get selectSenkiTowerTarget () {
        return selectSenkiTowerTarget;
    },
    get stepSubstitutionGauge () {
        return stepSubstitutionGauge;
    }
});
var _narutoSeedsPart1 = require("./narutoSeedsPart1");
var _narutoSeedsPart2 = require("./narutoSeedsPart2");
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
var NARUTO_FACTIONS = [
    'Konoha',
    'Five Kage & Legends',
    'Akatsuki & Villains',
    'Boruto & Otsutsuki'
];
var NARUTO_MODES = [
    {
        id: 'senki_3v3',
        engine: 'senki_2d',
        name: 'Naruto Senki: 3v3 Standard Lane',
        title: 'Senki 3v3 Lane',
        badge: '2D MOBA · 3v3',
        sub: '2D Single-Lane 3-Tower MOBA',
        icon: '🍥',
        description: 'Single-lane 2D MOBA brawler! Push 3 Enemy Towers with Fodder Ninja waves, level up 1→6 to unlock Ougi 1 (Lv.4) & Ougi 2 (Lv.6), and buy Ichiraku Ramen!',
        rewardCoins: 85,
        teamSize: 3
    },
    {
        id: 'senki_4v4',
        engine: 'senki_2d',
        name: 'Naruto Senki: 4v4 Hardcore War',
        title: 'Senki 4v4 Hardcore',
        badge: '2D HARDCORE · 4v4',
        sub: '2D 4v4 High-Intensity War',
        icon: '🔥',
        description: '4v4 High-Intensity Shinobi War! Faster enemy Gold/XP scaling, smarter AI Jutsu dodging, fortified 4,200–7,500 HP Towers, and massive clone battles.',
        rewardCoins: 125,
        teamSize: 4
    },
    {
        id: 'storm_3v3',
        engine: 'storm_3d',
        name: 'Ultimate Ninja Storm: 3v3 Team Arena',
        title: 'Storm 3v3 Team',
        badge: '3D STORM · 3v3',
        sub: '3D Team Arena & Support Drive',
        icon: '⚡',
        description: 'Full 3D Arena Fighter with Dual-Bar Team HP, 4-Log Kawarimi Substitution (14s reset), Chakra Dash Cancels, Counterattack Parry, Support Drive & Linked Team Ultimate!',
        rewardCoins: 110,
        teamSize: 3
    },
    {
        id: 'storm_1v1',
        engine: 'storm_3d',
        name: 'Ultimate Ninja Storm: 1v1 Pure Duel',
        title: 'Storm 1v1 Duel',
        badge: '3D DUEL · 1v1',
        sub: '3D Pure 1v1 Shinobi Duel',
        icon: '🗡️',
        description: 'Pure 1v1 3D Arena showdown! Test your frame-data mastery, Guard Breaks, Substitution timing, Ninja Tools, and True Awakening transformations at ≤40% HP.',
        rewardCoins: 95,
        teamSize: 1
    }
];
var NARUTO_STAGES = [
    {
        id: 'konoha_gates',
        name: 'Hidden Leaf Village (Konoha)',
        icon: '🍃',
        subtitle: 'Crimson Torii Gates, Hokage Rock cliffs & training grounds',
        skyColor: 0x1e293b,
        fogColor: 0x1e293b,
        groundColor: 0x3f4f3a,
        accentHex: '#22c55e',
        accentColor: 0x22c55e
    },
    {
        id: 'valley_of_end',
        name: 'Valley of the End',
        icon: '🌊',
        subtitle: 'Colossal Hashirama & Madara stone statues over crashing waterfalls',
        skyColor: 0x0f172a,
        fogColor: 0x0f172a,
        groundColor: 0x334155,
        accentHex: '#38bdf8',
        accentColor: 0x38bdf8
    },
    {
        id: 'chunin_arena',
        name: 'Chunin Exams Final Arena',
        icon: '🏟️',
        subtitle: 'Sunlit stone colosseum surrounded by towering forest walls',
        skyColor: 0x1e3a5f,
        fogColor: 0x1e3a5f,
        groundColor: 0x57534e,
        accentHex: '#f59e0b',
        accentColor: 0xf59e0b
    },
    {
        id: 'shinobi_war_crater',
        name: 'Fourth Great Ninja War Crater',
        icon: '☄️',
        subtitle: 'Shattered Ten-Tails battlefield under a crimson Tsukuyomi moon',
        skyColor: 0x2a0a18,
        fogColor: 0x2a0a18,
        groundColor: 0x3b2f2f,
        accentHex: '#ef4444',
        accentColor: 0xef4444
    },
    {
        id: 'kaguya_dimension',
        name: 'Kaguya Amenominaka Dimension',
        icon: '🌌',
        subtitle: 'Shifting Lava, Glacial Ice & Gravity monolithic floating palace',
        skyColor: 0x1e1b4b,
        fogColor: 0x1e1b4b,
        groundColor: 0x312e81,
        accentHex: '#a855f7',
        accentColor: 0xa855f7
    }
];
var STORM_SUPPORT_TYPE_DEFS = [
    {
        id: 'attack',
        name: 'Attack Support',
        icon: '⚔️',
        summary: 'At 50% Storm Gauge, automatically dashes in to extend your melee combos and knockbacks.',
        desc: 'At 50% Storm Gauge, automatically dashes in to extend your melee combos and knockbacks.'
    },
    {
        id: 'guard',
        name: 'Guard Support',
        icon: '🛡️',
        summary: 'At 50% Storm Gauge, automatically blocks incoming Ultimate Jutsu or Chakra Dashes while charging Chakra.',
        desc: 'At 50% Storm Gauge, automatically blocks incoming Ultimate Jutsu or Chakra Dashes while charging Chakra.'
    },
    {
        id: 'charge',
        name: 'Charge Support',
        icon: '💙',
        summary: 'At 50% Storm Gauge, appears beside you to double your Chakra charging speed.',
        desc: 'At 50% Storm Gauge, appears beside you to double your Chakra charging speed.'
    },
    {
        id: 'cover_fire',
        name: 'Cover Fire Support',
        icon: '🎯',
        summary: 'At 50% Storm Gauge, fires bonus Chakra Shuriken volleys whenever you throw projectiles.',
        desc: 'At 50% Storm Gauge, fires bonus Chakra Shuriken volleys whenever you throw projectiles.'
    }
];
var SENKI_RAMEN_ITEMS = [
    {
        id: 'ramen',
        name: 'Ichiraku Ramen',
        shortName: 'Ramen',
        icon: '🍜',
        costGold: 50,
        cost: 50,
        shortcut: '7',
        cdSec: 10,
        cooldownSec: 10,
        durationSec: 0,
        summary: 'Instantly restores 40% of Max HP (10s cooldown).',
        effectDesc: 'Instantly restores 40% of Max HP (10s cooldown).'
    },
    {
        id: 'pill',
        name: 'Military Rations Pill',
        shortName: 'ATK Pill',
        icon: '💊',
        costGold: 100,
        cost: 100,
        shortcut: '8',
        cdSec: 15,
        cooldownSec: 15,
        durationSec: 15,
        summary: 'Increases Attack Damage by +25% for 15 seconds.',
        effectDesc: 'Increases Attack Damage by +25% for 15 seconds.'
    },
    {
        id: 'speed_tag',
        name: 'Speed / Chakra Tag',
        shortName: 'Speed Tag',
        icon: '📜',
        costGold: 150,
        cost: 150,
        shortcut: '9',
        cdSec: 14,
        cooldownSec: 14,
        durationSec: 12,
        summary: 'Boosts Movement Speed by +30% and accelerates active skill cooldowns for 12s.',
        effectDesc: 'Boosts Movement Speed by +30% and accelerates active skill cooldowns for 12s.'
    }
];
var STORM_NINJA_TOOLS = [
    {
        id: 'atk_pill',
        dpadKey: 'UP',
        shortcutKey: 'Z',
        shortcut: 'Z',
        name: 'Attack Buff Pill',
        shortLabel: 'ATK Pill',
        icon: '💊',
        maxCharges: 2,
        summary: 'Increases melee & jutsu damage by +20% for 12s.',
        desc: 'Increases melee & jutsu damage by +20% for 12s.'
    },
    {
        id: 'def_pill',
        dpadKey: 'DOWN',
        shortcutKey: 'X',
        shortcut: 'X',
        name: 'Guard Defense Pill',
        shortLabel: 'DEF Pill',
        icon: '🛡️',
        maxCharges: 2,
        summary: 'Reduces incoming damage by 30% and restores Guard Health.',
        desc: 'Reduces incoming damage by 30% and restores Guard Health.'
    },
    {
        id: 'paper_bomb',
        dpadKey: 'LEFT',
        shortcutKey: 'V',
        shortcut: 'V',
        name: 'Paper Bomb Ball',
        shortLabel: 'Bomb Ball',
        icon: '💣',
        maxCharges: 3,
        summary: 'Throws an arcing explosive kunai that stuns on hit and shreds Guard Health.',
        desc: 'Throws an arcing explosive kunai that stuns on hit and shreds Guard Health.'
    },
    {
        id: 'speed_tag',
        dpadKey: 'RIGHT',
        shortcutKey: 'B',
        shortcut: 'B',
        name: 'Exhaustion & Speed Tag',
        shortLabel: 'Speed Tag',
        icon: '⚡',
        maxCharges: 2,
        summary: 'Boosts your dash speed by +30% while slowing & weakening the opponent.',
        desc: 'Boosts your dash speed by +30% while slowing & weakening the opponent.'
    }
];
function buildSkill(slot, tuple) {
    var _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
    var name = tuple[0], desc = tuple[1], actionKind = tuple[2], cdSec = tuple[3], dmgMult = tuple[4], vfxColor = tuple[5], extra = tuple[6];
    var unlockLevel = slot === 1 ? 1 : slot === 2 ? 1 : slot === 3 ? 2 : slot === 4 ? 4 : 6;
    var defaultIcon = slot === 4 ? '🌟' : slot === 5 ? '🔥' : actionKind === 'summon_clones' ? '👥' : actionKind === 'heal_aura' ? '💚' : actionKind === 'projectile' ? '🌀' : actionKind === 'beam_laser' ? '⚡' : actionKind === 'pull_vortex' ? '🕳️' : '🗡️';
    var shortWords = name.replace(/^(Wind|Fire|Water|Lightning|Earth|Wood|Sage|Inferno|Secret|Summoning|Eight Trigrams|Ninja Art)[:\s-]*/i, '').trim().split(/\s+/).slice(0, 2).join(' ');
    var computedRange = (_ref = extra == null ? void 0 : extra.rangePx) != null ? _ref : actionKind === 'projectile' || actionKind === 'beam_laser' ? 440 : actionKind === 'aoe_burst' || actionKind === 'form_awakening' ? 270 : 210;
    var superArmor = (_ref1 = extra == null ? void 0 : extra.hasSuperArmor) != null ? _ref1 : slot >= 4;
    var iFrames = (_ref2 = extra == null ? void 0 : extra.hasIFrames) != null ? _ref2 : false;
    var clones = (_ref3 = extra == null ? void 0 : extra.cloneCount) != null ? _ref3 : actionKind === 'summon_clones' ? 2 : undefined;
    var heal = (_ref4 = extra == null ? void 0 : extra.healPct) != null ? _ref4 : actionKind === 'heal_aura' ? 0.32 : undefined;
    return {
        slot: slot,
        name: name,
        shortLabel: shortWords.slice(0, 12) || "Jutsu " + slot,
        icon: (_ref5 = extra == null ? void 0 : extra.icon) != null ? _ref5 : defaultIcon,
        unlockLevel: unlockLevel,
        cdSec: cdSec,
        cooldown: cdSec,
        dmgMult: dmgMult,
        damage: Math.round(dmgMult * 75),
        rangePx: computedRange,
        range: computedRange,
        actionKind: actionKind,
        kind: actionKind === 'melee_dash' ? 'dash' : actionKind,
        hasSuperArmor: superArmor,
        grantsSuperArmor: superArmor,
        hasIFrames: iFrames,
        grantsIFrames: iFrames,
        hitsTowers: (_ref6 = extra == null ? void 0 : extra.hitsTowers) != null ? _ref6 : slot >= 4 || actionKind === 'melee_dash' || actionKind === 'summon_clones',
        cloneCount: clones,
        spawnsClones: clones,
        stunSec: (_ref7 = extra == null ? void 0 : extra.stunSec) != null ? _ref7 : slot >= 4 ? 1.4 : actionKind === 'pull_vortex' || actionKind === 'trap_zone' ? 1.2 : 0.4,
        healPct: heal,
        healsAlliesPct: heal,
        transformSec: (_ref8 = extra == null ? void 0 : extra.transformSec) != null ? _ref8 : slot === 5 || actionKind === 'form_awakening' ? 15 : undefined,
        vfxColor: vfxColor,
        color: vfxColor,
        description: desc,
        desc: desc
    };
}
var RAW_SHINOBI_SEEDS = [].concat(_narutoSeedsPart1.NARUTO_SEEDS_PART_1, _narutoSeedsPart2.NARUTO_SEEDS_PART_2);
var NARUTO_SHINOBI_ROSTER = RAW_SHINOBI_SEEDS.map(function(raw, idx) {
    var builtSkills = [
        buildSkill(1, raw.s1),
        buildSkill(2, raw.s2),
        buildSkill(3, raw.s3),
        buildSkill(4, raw.ougi1),
        buildSkill(5, raw.ougi2)
    ];
    var villageLabel = raw.faction === 'Konoha' ? 'Hidden Leaf' : raw.faction === 'Five Kage & Legends' ? 'Five Great Nations' : raw.faction === 'Akatsuki & Villains' ? 'Rogue / Akatsuki' : 'Otsutsuki / New Era';
    var roleLabel = raw.isRanged ? 'Ranged Ninjutsu' : 'Melee Taijutsu';
    return {
        id: idx,
        name: raw.name,
        title: raw.title,
        faction: raw.faction,
        village: villageLabel,
        role: roleLabel,
        icon: raw.icon,
        cost: raw.cost,
        unlockCost: raw.cost,
        maxHp: raw.maxHp,
        baseHp: raw.maxHp,
        atkDmg: raw.atkDmg,
        baseAtk: raw.atkDmg,
        moveSpeed: raw.moveSpeed,
        speed: raw.moveSpeed,
        isRanged: raw.isRanged,
        hoverFlight: raw.hoverFlight,
        bodyColor: raw.bodyColor,
        primaryColor: raw.bodyColor,
        cloakColor: raw.cloakColor,
        accentColor: raw.accentColor,
        chakraColor: raw.accentColor,
        hairColor: raw.hairColor,
        weaponKind: raw.weaponKind,
        weapon: raw.weaponKind,
        senkiTraitName: raw.senkiTraitName,
        senkiTraitDesc: raw.senkiTraitDesc,
        passiveName: raw.senkiTraitName,
        passiveDesc: raw.senkiTraitDesc,
        senkiTraitKind: raw.senkiTraitKind,
        passiveTrait: raw.senkiTraitKind,
        senkiSkills: builtSkills,
        skills: builtSkills,
        stormTraitName: raw.stormTraitName,
        stormTraitDesc: raw.stormTraitDesc,
        stormNinjutsu: {
            name: raw.stormNinjutsuName,
            desc: raw.stormNinjutsuDesc,
            chakraCost: 22,
            dmgMult: raw.s2[4],
            actionKind: raw.s2[2]
        },
        stormTilt: {
            name: raw.stormTiltName,
            desc: raw.stormTiltDesc,
            dmgMult: 1.35,
            hasIFrames: raw.senkiTraitKind === 'kamui_evasion' || raw.senkiTraitKind === 'raijin_flash',
            isCounter: raw.senkiTraitKind === 'sand_shield' || raw.senkiTraitKind === 'bone_reflect'
        },
        stormUltimate: {
            name: raw.stormUltName,
            desc: raw.stormUltDesc,
            chakraCost: 45,
            dmgMult: raw.ougi2[4]
        },
        stormAwakeningName: raw.stormAwakeningName,
        awakeningName: raw.stormAwakeningName,
        stormAwakeningDesc: raw.stormAwakeningDesc,
        teamTags: raw.teamTags
    };
});
function getNarutoShinobiById(id) {
    var _NARUTO_SHINOBI_ROSTER_id;
    return (_NARUTO_SHINOBI_ROSTER_id = NARUTO_SHINOBI_ROSTER[id]) != null ? _NARUTO_SHINOBI_ROSTER_id : NARUTO_SHINOBI_ROSTER[0];
}
var SYNERGY_TABLE = [
    {
        tag: 'team7',
        name: 'Team 7 Reunited',
        bonusDesc: '+18% Team Ultimate Damage & +25% Storm Gauge Fill',
        ultMult: 1.18,
        gaugeRate: 1.25
    },
    {
        tag: 'new_team7',
        name: 'New Generation Team 7',
        bonusDesc: '+18% Team Ultimate Damage & +25% Storm Gauge Fill',
        ultMult: 1.18,
        gaugeRate: 1.25
    },
    {
        tag: 'sannin',
        name: 'The Legendary Sannin',
        bonusDesc: '+20% Team Ultimate Damage & +20% Guard Pressure',
        ultMult: 1.2,
        gaugeRate: 1.2
    },
    {
        tag: 'hokage',
        name: 'Past & Present Hokage',
        bonusDesc: '+22% Team Ultimate Damage & Faster Substitution Recovery',
        ultMult: 1.22,
        gaugeRate: 1.25
    },
    {
        tag: 'akatsuki',
        name: 'Akatsuki Scarlet Dawn',
        bonusDesc: '+20% Team Ultimate Damage & +20% Ninjutsu Power',
        ultMult: 1.2,
        gaugeRate: 1.22
    },
    {
        tag: 'uchiha',
        name: 'Uchiha Clan Visual Prowess',
        bonusDesc: '+22% Team Ultimate Damage & Sharingan Crit Bonus',
        ultMult: 1.22,
        gaugeRate: 1.22
    },
    {
        tag: 'sand_siblings',
        name: 'Three Sand Siblings',
        bonusDesc: '+18% Team Ultimate Damage & Sand Shield Defense',
        ultMult: 1.18,
        gaugeRate: 1.2
    },
    {
        tag: 'ino_shika_cho',
        name: 'Ino-Shika-Cho Formation',
        bonusDesc: '+18% Team Ultimate Damage & Extended Stun Duration',
        ultMult: 1.18,
        gaugeRate: 1.25
    },
    {
        tag: 'team_guy',
        name: 'Passionate Youth (Team Guy)',
        bonusDesc: '+18% Team Ultimate Damage & +10% Move Speed',
        ultMult: 1.18,
        gaugeRate: 1.2
    },
    {
        tag: 'team8',
        name: 'Team Kurenai Sensory Trackers',
        bonusDesc: '+16% Team Ultimate Damage & Chakra Drain',
        ultMult: 1.16,
        gaugeRate: 1.2
    },
    {
        tag: 'five_kage',
        name: 'Five Kage Summit Alliance',
        bonusDesc: '+20% Team Ultimate Damage & +15% Guard Durability',
        ultMult: 1.2,
        gaugeRate: 1.2
    },
    {
        tag: 'jinchuriki',
        name: 'Tailed Beast Hosts (Jinchuriki)',
        bonusDesc: '+22% Team Ultimate Damage & Awakening Power',
        ultMult: 1.22,
        gaugeRate: 1.22
    },
    {
        tag: 'taka',
        name: 'Team Taka / Hebi',
        bonusDesc: '+18% Team Ultimate Damage & Lifesteal Assist',
        ultMult: 1.18,
        gaugeRate: 1.2
    },
    {
        tag: 'otsutsuki',
        name: 'Celestial Otsutsuki Clan',
        bonusDesc: '+25% Team Ultimate Damage & Dimension Dominance',
        ultMult: 1.25,
        gaugeRate: 1.25
    },
    {
        tag: 'mist',
        name: 'Seven Ninja Swordsmen of the Mist',
        bonusDesc: '+18% Team Ultimate Damage & Hidden Mist Cleave',
        ultMult: 1.18,
        gaugeRate: 1.2
    }
];
function resolveNarutoTeamSynergy(heroIdsOrH1, h2, h3) {
    var heroIds = Array.isArray(heroIdsOrH1) ? heroIdsOrH1 : [
        heroIdsOrH1,
        h2 != null ? h2 : 1,
        h3 != null ? h3 : 2
    ];
    var heroes = heroIds.map(function(id) {
        return getNarutoShinobiById(id);
    });
    var counts = {};
    for(var _iterator = _create_for_of_iterator_helper_loose(heroes), _step; !(_step = _iterator()).done;){
        var h = _step.value;
        for(var _iterator1 = _create_for_of_iterator_helper_loose(h.teamTags), _step1; !(_step1 = _iterator1()).done;){
            var tag = _step1.value;
            counts[tag] = (counts[tag] || 0) + 1;
        }
    }
    for(var _iterator2 = _create_for_of_iterator_helper_loose(SYNERGY_TABLE), _step2; !(_step2 = _iterator2()).done;){
        var syn = _step2.value;
        if ((counts[syn.tag] || 0) >= 2) {
            var pct = Math.round((syn.ultMult - 1) * 100);
            return {
                name: syn.name,
                teamName: syn.name,
                bonusDesc: syn.bonusDesc,
                bonusPct: pct,
                ultMultiplier: syn.ultMult,
                stormGaugeRate: syn.gaugeRate
            };
        }
    }
    return {
        name: 'Allied Shinobi Forces',
        teamName: 'Allied Shinobi Forces',
        bonusDesc: '+10% Balanced Team Synergy',
        bonusPct: 10,
        ultMultiplier: 1.1,
        stormGaugeRate: 1.1
    };
}
function computeSenkiLevelStats(baseHpOrHero, baseAtkOrLevel, maybeLevel) {
    var baseHp = typeof baseHpOrHero === 'number' ? baseHpOrHero : baseHpOrHero.maxHp;
    var baseAtk = typeof baseHpOrHero === 'number' ? baseAtkOrLevel : baseHpOrHero.atkDmg;
    var rawLevel = typeof baseHpOrHero === 'number' ? maybeLevel != null ? maybeLevel : 1 : baseAtkOrLevel;
    var clampedLv = Math.max(1, Math.min(6, Math.floor(rawLevel)));
    var lvSteps = clampedLv - 1;
    var maxHp = Math.round(baseHp * Math.pow(1.14, lvSteps));
    var atkDmg = Math.round(baseAtk * Math.pow(1.1, lvSteps));
    return {
        level: clampedLv,
        maxHp: maxHp,
        atkDmg: atkDmg,
        atk: atkDmg,
        xpToNext: clampedLv * 120,
        ougi1Unlocked: clampedLv >= 4,
        ougi2Unlocked: clampedLv >= 6
    };
}
function selectSenkiTowerTarget(arg1, arg2, arg3, arg4, arg5) {
    var _heroes_;
    if (Array.isArray(arg1)) {
        var _ref;
        var _heroes_1;
        var rangePx = typeof arg2 === 'number' ? arg2 : 260;
        var inRange = arg1.filter(function(c) {
            return c.distance <= rangePx;
        });
        if (inRange.length === 0) return null;
        var aggroHeroes = inRange.filter(function(c) {
            return c.kind === 'hero' && c.damagedAlliedHeroRecently;
        }).sort(function(a, b) {
            return a.distance - b.distance;
        });
        if (aggroHeroes.length > 0) return aggroHeroes[0].id;
        var minionsAndClones = inRange.filter(function(c) {
            return c.kind === 'minion' || c.kind === 'clone';
        }).sort(function(a, b) {
            return a.distance - b.distance;
        });
        if (minionsAndClones.length > 0) return minionsAndClones[0].id;
        var heroes = inRange.filter(function(c) {
            return c.kind === 'hero';
        }).sort(function(a, b) {
            return a.distance - b.distance;
        });
        return (_ref = (_heroes_1 = heroes[0]) == null ? void 0 : _heroes_1.id) != null ? _ref : null;
    }
    var towerX = arg1;
    var towerTeam = arg2;
    var towerRangePx = arg3 != null ? arg3 : 260;
    var candidates = arg4 != null ? arg4 : [];
    var aggroHeroId = arg5 != null ? arg5 : null;
    var inRangeEnemies = candidates.filter(function(c) {
        return c.team !== towerTeam && c.hp > 0 && Math.abs(c.x - towerX) <= towerRangePx;
    });
    if (inRangeEnemies.length === 0) return null;
    if (aggroHeroId) {
        var aggroHero = inRangeEnemies.find(function(c) {
            return c.id === aggroHeroId && c.kind === 'hero';
        });
        if (aggroHero) return aggroHero;
    }
    var minionsAndClones1 = inRangeEnemies.filter(function(c) {
        return c.kind === 'minion' || c.kind === 'clone';
    }).sort(function(a, b) {
        return Math.abs(a.x - towerX) - Math.abs(b.x - towerX);
    });
    if (minionsAndClones1.length > 0) {
        return minionsAndClones1[0];
    }
    var heroes1 = inRangeEnemies.filter(function(c) {
        return c.kind === 'hero';
    }).sort(function(a, b) {
        return Math.abs(a.x - towerX) - Math.abs(b.x - towerX);
    });
    return (_heroes_ = heroes1[0]) != null ? _heroes_ : null;
}
function computeStormComboProration(comboHitCount) {
    if (comboHitCount <= 0) return 1.0;
    return Math.max(0.2, Number((1.0 - comboHitCount * 0.08).toFixed(2)));
}
function stepSubstitutionGauge(currentLogs, rechargeTimerSec, dtSec, consumeLog) {
    if (consumeLog === void 0) consumeLog = false;
    var logs = Math.max(0, Math.min(4, Math.floor(currentLogs)));
    var timer = Math.max(0, rechargeTimerSec);
    if (consumeLog && logs > 0) {
        logs -= 1;
        timer = 0.0; // Reset Rule: active recharge timer resets to 0.0s
        return {
            logs: logs,
            rechargeTimerSec: timer,
            timerSec: timer,
            substituted: true
        };
    }
    if (logs < 4) {
        timer += Math.max(0, dtSec);
        while(timer >= 14.0 && logs < 4){
            timer -= 14.0;
            logs += 1;
        }
        if (logs >= 4) timer = 0.0;
    } else {
        timer = 0.0;
    }
    var fixed = Number(timer.toFixed(3));
    return {
        logs: logs,
        rechargeTimerSec: fixed,
        timerSec: fixed,
        substituted: false
    };
}
function computeStormMaxUsableChakra(arg1, arg2) {
    if (typeof arg2 === 'undefined') {
        return arg1 > 0 ? 65 : 100;
    }
    var maxChakra = arg1;
    var counterPenaltyTimerSec = arg2;
    if (counterPenaltyTimerSec > 0) {
        var locked = Math.round(maxChakra * 0.35);
        return {
            usableMaxChakra: maxChakra - locked,
            lockedChakra: locked,
            isLocked: true
        };
    }
    return {
        usableMaxChakra: maxChakra,
        lockedChakra: 0,
        isLocked: false
    };
}

});

})(window.ArcadeMod);
