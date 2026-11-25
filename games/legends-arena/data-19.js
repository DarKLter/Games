(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mobaSystemsCatalog ===
ArcadeMod.define("src/games/legends-arena/mobaSystemsCatalog", function(require, module, exports) {
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
    get ALL_MOBA_TALENTS () {
        return ALL_MOBA_TALENTS;
    },
    get DEFAULT_EMBLEM_TALENTS () {
        return DEFAULT_EMBLEM_TALENTS;
    },
    get DEFAULT_MOBA_SETTINGS () {
        return DEFAULT_MOBA_SETTINGS;
    },
    get DEFAULT_STARTER_EMOTE_IDS () {
        return DEFAULT_STARTER_EMOTE_IDS;
    },
    get MOBA_ACHIEVEMENTS () {
        return MOBA_ACHIEVEMENTS;
    },
    get MOBA_COLLECTOR_TIERS () {
        return MOBA_COLLECTOR_TIERS;
    },
    get MOBA_ELIM_EFFECTS () {
        return MOBA_ELIM_EFFECTS;
    },
    get MOBA_EMOTES () {
        return MOBA_EMOTES;
    },
    get MOBA_LUCKY_SPIN_POOL () {
        return MOBA_LUCKY_SPIN_POOL;
    },
    get MOBA_RECALL_EFFECTS () {
        return MOBA_RECALL_EFFECTS;
    },
    get MOBA_SKIN_VARIANTS () {
        return MOBA_SKIN_VARIANTS;
    },
    get MOBA_STARLIGHT_TRACK () {
        return MOBA_STARLIGHT_TRACK;
    },
    get MOBA_TALENTS_T1 () {
        return MOBA_TALENTS_T1;
    },
    get MOBA_TALENTS_T2 () {
        return MOBA_TALENTS_T2;
    },
    get MOBA_TALENTS_T3 () {
        return MOBA_TALENTS_T3;
    },
    get computeCollectorTier () {
        return computeCollectorTier;
    },
    get equipEmoteToSlot () {
        return equipEmoteToSlot;
    },
    get getHeroMasteryTitle () {
        return getHeroMasteryTitle;
    },
    get getMobaEmoteById () {
        return getMobaEmoteById;
    },
    get getSkinVariantById () {
        return getSkinVariantById;
    },
    get getTalentById () {
        return getTalentById;
    },
    get normalizeEquippedEmotes () {
        return normalizeEquippedEmotes;
    },
    get pickContextualAiEmote () {
        return pickContextualAiEmote;
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
var MOBA_TALENTS_T1 = [
    {
        id: 'thrill',
        tier: 1,
        name: 'Thrill',
        icon: '⚔️',
        summary: '+16 Adaptive Attack',
        atkBonus: 6
    },
    {
        id: 'swift',
        tier: 1,
        name: 'Swift',
        icon: '⚡',
        summary: '+10% Attack Speed & +4 ATK',
        atkBonus: 4,
        spdBonus: 0.3
    },
    {
        id: 'vitality',
        tier: 1,
        name: 'Vitality',
        icon: '❤️',
        summary: '+225 Max HP',
        hpBonus: 36
    },
    {
        id: 'rupture',
        tier: 1,
        name: 'Rupture',
        icon: '🗡️',
        summary: '+5 Adaptive Penetration',
        atkBonus: 5,
        penFlat: 6
    },
    {
        id: 'inspire_t1',
        tier: 1,
        name: 'Inspire',
        icon: '⏳',
        summary: '+5% Cooldown Reduction',
        cdPct: 5
    },
    {
        id: 'agility',
        tier: 1,
        name: 'Agility',
        icon: '💨',
        summary: '+4% Movement Speed',
        spdBonus: 0.65
    },
    {
        id: 'fatal',
        tier: 1,
        name: 'Fatal',
        icon: '🎯',
        summary: '+5% Crit Chance & +10% Crit DMG',
        critPct: 6
    }
];
var MOBA_TALENTS_T2 = [
    {
        id: 'master_assassin',
        tier: 2,
        name: 'Master Assassin',
        icon: '🩸',
        summary: '+7% DMG to isolated heroes',
        atkBonus: 5
    },
    {
        id: 'festival_of_blood',
        tier: 2,
        name: 'Festival of Blood',
        icon: '🧛',
        summary: '+6% Spell Vamp & Lifesteal',
        lifestealPct: 6
    },
    {
        id: 'tenacity',
        tier: 2,
        name: 'Tenacity',
        icon: '🛡️',
        summary: '+15 Defense below 50% HP',
        hpBonus: 28
    },
    {
        id: 'wilderness_blessing',
        tier: 2,
        name: 'Wilderness Blessing',
        icon: '🌿',
        summary: '+10% Move Speed in Jungle & River',
        spdBonus: 0.55
    },
    {
        id: 'weapons_master',
        tier: 2,
        name: 'Weapons Master',
        icon: '⚒️',
        summary: '+5% Extra ATK from Equipment',
        atkBonus: 6
    },
    {
        id: 'pull_yourself_together',
        tier: 2,
        name: 'Pull Yourself Together',
        icon: '🔄',
        summary: '-15% Battle Spell & Active CD',
        cdPct: 6
    }
];
var MOBA_TALENTS_T3 = [
    {
        id: 'killing_spree',
        tier: 3,
        name: 'Killing Spree',
        icon: '🔥',
        summary: 'Hero kill restores 15% HP & +20% Speed for 3s'
    },
    {
        id: 'impure_rage',
        tier: 3,
        name: 'Impure Rage',
        icon: '🔮',
        summary: 'Skills deal +4% Max-HP bonus Magic Damage'
    },
    {
        id: 'brave_smite',
        tier: 3,
        name: 'Brave Smite',
        icon: '💚',
        summary: 'Dealing skill damage restores 5% Max HP'
    },
    {
        id: 'weakness_finder',
        tier: 3,
        name: 'Weakness Finder',
        icon: '❄️',
        summary: 'Basic attacks slow enemies by 50% for 1.2s'
    },
    {
        id: 'lethal_ignition',
        tier: 3,
        name: 'Lethal Ignition',
        icon: '☄️',
        summary: '3 rapid hits trigger a scorching True Damage burst'
    },
    {
        id: 'concussive_blast',
        tier: 3,
        name: 'Concussive Blast',
        icon: '💥',
        summary: 'Every 4th attack detonates HP-scaled AoE shockwave'
    },
    {
        id: 'temporal_reign',
        tier: 3,
        name: 'Temporal Reign',
        icon: '⏱️',
        summary: 'Casting Ultimate accelerates basic skill cooldowns'
    }
];
var ALL_MOBA_TALENTS = [].concat(MOBA_TALENTS_T1, MOBA_TALENTS_T2, MOBA_TALENTS_T3);
function getTalentById(id) {
    return ALL_MOBA_TALENTS.find(function(t) {
        return t.id === id;
    });
}
var DEFAULT_EMBLEM_TALENTS = {
    Common: {
        t1: 'thrill',
        t2: 'wilderness_blessing',
        t3: 'impure_rage'
    },
    Tank: {
        t1: 'vitality',
        t2: 'tenacity',
        t3: 'concussive_blast'
    },
    Assassin: {
        t1: 'rupture',
        t2: 'master_assassin',
        t3: 'killing_spree'
    },
    Mage: {
        t1: 'inspire_t1',
        t2: 'weapons_master',
        t3: 'lethal_ignition'
    },
    Fighter: {
        t1: 'thrill',
        t2: 'festival_of_blood',
        t3: 'brave_smite'
    },
    Support: {
        t1: 'agility',
        t2: 'pull_yourself_together',
        t3: 'temporal_reign'
    },
    Marksman: {
        t1: 'fatal',
        t2: 'weapons_master',
        t3: 'weakness_finder'
    }
};
var MOBA_SKIN_VARIANTS = [
    {
        id: 'default',
        name: 'Classic Dawn',
        tier: 'Default',
        costDiamonds: 0,
        costBp: 0,
        collectorPts: 20,
        bodyShift: null,
        cloakShift: null,
        bladeShift: null,
        accentHex: '#94a3b8'
    },
    {
        id: 'elite_crimson',
        name: 'Crimson Vanguard',
        tier: 'Elite',
        costDiamonds: 45,
        costBp: 6000,
        collectorPts: 150,
        bodyShift: 0x991b1b,
        cloakShift: 0x450a0a,
        bladeShift: 0xf43f5e,
        accentHex: '#f43f5e'
    },
    {
        id: 'starlight_astral',
        name: 'StarLight Astral',
        tier: 'StarLight',
        costDiamonds: 60,
        costBp: 9000,
        collectorPts: 280,
        bodyShift: 0x1e3a8a,
        cloakShift: 0x312e81,
        bladeShift: 0x38bdf8,
        accentHex: '#38bdf8'
    },
    {
        id: 'epic_emerald',
        name: 'Venom Sovereign',
        tier: 'Epic',
        costDiamonds: 85,
        costBp: 14000,
        collectorPts: 480,
        bodyShift: 0x065f46,
        cloakShift: 0x022c22,
        bladeShift: 0x34d399,
        accentHex: '#34d399'
    },
    {
        id: 'collector_gold',
        name: 'Celestial Emperor',
        tier: 'Collector',
        costDiamonds: 120,
        costBp: 22000,
        collectorPts: 950,
        bodyShift: 0x78350f,
        cloakShift: 0x1e1b4b,
        bladeShift: 0xfacc15,
        accentHex: '#facc15'
    },
    {
        id: 'legend_void',
        name: 'Cosmic Legend',
        tier: 'Legend',
        costDiamonds: 180,
        costBp: 32000,
        collectorPts: 1800,
        bodyShift: 0x4c1d95,
        cloakShift: 0x0f172a,
        bladeShift: 0xe879f9,
        accentHex: '#e879f9'
    }
];
function getSkinVariantById(id) {
    var _MOBA_SKIN_VARIANTS_find;
    return (_MOBA_SKIN_VARIANTS_find = MOBA_SKIN_VARIANTS.find(function(s) {
        return s.id === id;
    })) != null ? _MOBA_SKIN_VARIANTS_find : MOBA_SKIN_VARIANTS[0];
}
var MOBA_RECALL_EFFECTS = [
    {
        id: 'recall_classic',
        kind: 'recall',
        name: 'Dawn Sigil',
        icon: '🌀',
        colorNum: 0x38bdf8,
        colorHex: '#38bdf8',
        costTickets: 0
    },
    {
        id: 'recall_seal',
        kind: 'recall',
        name: 'Seal of Anvil',
        icon: '⚡',
        colorNum: 0xfacc15,
        colorHex: '#facc15',
        costTickets: 120
    },
    {
        id: 'recall_sakura',
        kind: 'recall',
        name: 'Blossom Whirl',
        icon: '🌸',
        colorNum: 0xf472b6,
        colorHex: '#f472b6',
        costTickets: 150
    },
    {
        id: 'recall_void',
        kind: 'recall',
        name: 'Starlight Vortex',
        icon: '🌌',
        colorNum: 0xc084fc,
        colorHex: '#c084fc',
        costTickets: 180
    }
];
var MOBA_ELIM_EFFECTS = [
    {
        id: 'elim_classic',
        kind: 'elim',
        name: 'Classic Burst',
        icon: '💥',
        colorNum: 0xf97316,
        colorHex: '#f97316',
        costTickets: 0
    },
    {
        id: 'elim_ko',
        kind: 'elim',
        name: 'K.O. Shockwave',
        icon: '🥊',
        colorNum: 0xfacc15,
        colorHex: '#facc15',
        costTickets: 120
    },
    {
        id: 'elim_frost',
        kind: 'elim',
        name: 'Glacial Shatter',
        icon: '❄️',
        colorNum: 0x67e8f9,
        colorHex: '#67e8f9',
        costTickets: 150
    }
];
var MOBA_EMOTES = [
    {
        id: 'emote_gg',
        name: 'Good Game',
        callout: 'GG!',
        icon: '🏆',
        category: 'spirit',
        rarity: 'Starter',
        colorHex: '#facc15',
        colorNum: 0xfacc15,
        sfx: 'coin',
        costTickets: 0,
        costCoins: 0
    },
    {
        id: 'emote_nice',
        name: 'Well Played',
        callout: 'NICE!',
        icon: '👍',
        category: 'hype',
        rarity: 'Starter',
        colorHex: '#38bdf8',
        colorNum: 0x38bdf8,
        sfx: 'match',
        costTickets: 0,
        costCoins: 0
    },
    {
        id: 'emote_retreat',
        name: 'Watch Out',
        callout: 'CAREFUL!',
        icon: '⚠️',
        category: 'tactical',
        rarity: 'Starter',
        colorHex: '#fb923c',
        colorNum: 0xfb923c,
        sfx: 'slingshot',
        costTickets: 0,
        costCoins: 0
    },
    {
        id: 'emote_fire',
        name: 'Fired Up',
        callout: "LET'S GO!",
        icon: '🔥',
        category: 'hype',
        rarity: 'Starter',
        colorHex: '#ff6b2b',
        colorNum: 0xff6b2b,
        sfx: 'combo',
        costTickets: 0,
        costCoins: 0
    },
    {
        id: 'emote_taunt',
        name: 'Challenge',
        callout: 'COME ON!',
        icon: '😈',
        category: 'taunt',
        rarity: 'Rare',
        colorHex: '#f43f5e',
        colorNum: 0xf43f5e,
        sfx: 'dash',
        costTickets: 80,
        costCoins: 45
    },
    {
        id: 'emote_crown',
        name: 'MVP Crown',
        callout: 'TOO EASY!',
        icon: '👑',
        category: 'taunt',
        rarity: 'Epic',
        colorHex: '#fbbf24',
        colorNum: 0xfbbf24,
        sfx: 'clear',
        costTickets: 140,
        costCoins: 75
    },
    {
        id: 'emote_chill',
        name: 'Ice Cold',
        callout: 'STAY COOL',
        icon: '❄️',
        category: 'spirit',
        rarity: 'Rare',
        colorHex: '#67e8f9',
        colorNum: 0x67e8f9,
        sfx: 'match',
        costTickets: 90,
        costCoins: 50
    },
    {
        id: 'emote_thunder',
        name: 'Volt Shock',
        callout: 'WHOA!',
        icon: '⚡',
        category: 'hype',
        rarity: 'Rare',
        colorHex: '#60a5fa',
        colorNum: 0x60a5fa,
        sfx: 'combo',
        costTickets: 90,
        costCoins: 50
    },
    {
        id: 'emote_heart',
        name: 'Team Spirit',
        callout: 'THANKS!',
        icon: '💚',
        category: 'spirit',
        rarity: 'Rare',
        colorHex: '#4ade80',
        colorNum: 0x4ade80,
        sfx: 'plant',
        costTickets: 70,
        costCoins: 40
    },
    {
        id: 'emote_dragon',
        name: 'Lord Rally',
        callout: 'PUSH NOW!',
        icon: '🐲',
        category: 'tactical',
        rarity: 'Epic',
        colorHex: '#c084fc',
        colorNum: 0xc084fc,
        sfx: 'clear',
        costTickets: 130,
        costCoins: 70
    },
    {
        id: 'emote_ghost',
        name: 'Ambush',
        callout: 'BOO!',
        icon: '👻',
        category: 'taunt',
        rarity: 'Rare',
        colorHex: '#a855f7',
        colorNum: 0xa855f7,
        sfx: 'dash',
        costTickets: 100,
        costCoins: 55
    },
    {
        id: 'emote_star',
        name: 'Mythic Flex',
        callout: 'UNSTOPPABLE!',
        icon: '✨',
        category: 'hype',
        rarity: 'Epic',
        colorHex: '#fde047',
        colorNum: 0xfde047,
        sfx: 'combo',
        costTickets: 160,
        costCoins: 85
    }
];
var DEFAULT_STARTER_EMOTE_IDS = [
    'emote_gg',
    'emote_nice',
    'emote_retreat',
    'emote_fire'
];
function getMobaEmoteById(id) {
    var _MOBA_EMOTES_find;
    return (_MOBA_EMOTES_find = MOBA_EMOTES.find(function(e) {
        return e.id === id;
    })) != null ? _MOBA_EMOTES_find : MOBA_EMOTES[0];
}
function normalizeEquippedEmotes(raw, ownedIds) {
    var _result_, _result_1, _result_2, _result_3;
    var validIds = new Set(MOBA_EMOTES.map(function(e) {
        return e.id;
    }));
    var ownedSet = new Set([].concat(DEFAULT_STARTER_EMOTE_IDS, ownedIds.filter(function(id) {
        return validIds.has(id);
    })));
    var result = [];
    if (Array.isArray(raw)) {
        for(var _iterator = _create_for_of_iterator_helper_loose(raw), _step; !(_step = _iterator()).done;){
            var item = _step.value;
            if (typeof item === 'string' && ownedSet.has(item) && !result.includes(item) && result.length < 4) {
                result.push(item);
            }
        }
    }
    var fallbackPool = [].concat(DEFAULT_STARTER_EMOTE_IDS, Array.from(ownedSet));
    for(var _iterator1 = _create_for_of_iterator_helper_loose(fallbackPool), _step1; !(_step1 = _iterator1()).done;){
        var id = _step1.value;
        if (result.length >= 4) break;
        if (!result.includes(id)) result.push(id);
    }
    return [
        (_result_ = result[0]) != null ? _result_ : DEFAULT_STARTER_EMOTE_IDS[0],
        (_result_1 = result[1]) != null ? _result_1 : DEFAULT_STARTER_EMOTE_IDS[1],
        (_result_2 = result[2]) != null ? _result_2 : DEFAULT_STARTER_EMOTE_IDS[2],
        (_result_3 = result[3]) != null ? _result_3 : DEFAULT_STARTER_EMOTE_IDS[3]
    ];
}
function equipEmoteToSlot(equipped, slotIdx, emoteId) {
    var next = normalizeEquippedEmotes(equipped, [].concat(equipped, [
        emoteId
    ]));
    var existingIdx = next.indexOf(emoteId);
    if (existingIdx === slotIdx) return next;
    if (existingIdx !== -1) {
        var displaced = next[slotIdx];
        next[slotIdx] = emoteId;
        next[existingIdx] = displaced;
    } else {
        next[slotIdx] = emoteId;
    }
    return next;
}
function pickContextualAiEmote(context, seed) {
    if (seed === void 0) seed = 0;
    var _pools_context;
    var pools = {
        kill: [
            'emote_crown',
            'emote_taunt',
            'emote_fire',
            'emote_star'
        ],
        low_hp: [
            'emote_retreat',
            'emote_thunder',
            'emote_chill',
            'emote_ghost'
        ],
        objective: [
            'emote_dragon',
            'emote_fire',
            'emote_star',
            'emote_nice'
        ],
        rally: [
            'emote_nice',
            'emote_heart',
            'emote_gg',
            'emote_fire'
        ]
    };
    var pool = (_pools_context = pools[context]) != null ? _pools_context : pools.rally;
    var idx = Math.abs(Math.floor(seed)) % pool.length;
    return getMobaEmoteById(pool[idx]);
}
var MOBA_ACHIEVEMENTS = [
    {
        id: 'ach_first_win',
        category: 'Arena',
        title: 'Dawn Conqueror',
        desc: 'Win your first Legends Arena match',
        target: 1,
        points: 50,
        rewardBp: 1500,
        rewardTickets: 40,
        stat: 'wins'
    },
    {
        id: 'ach_slayer_15',
        category: 'Arena',
        title: 'Legendary Striker',
        desc: 'Score 15 enemy hero takedowns',
        target: 15,
        points: 100,
        rewardBp: 3000,
        rewardTickets: 60,
        stat: 'kills'
    },
    {
        id: 'ach_siege_10',
        category: 'Arena',
        title: 'Demolition Expert',
        desc: 'Destroy 10 enemy turrets',
        target: 10,
        points: 120,
        rewardBp: 3500,
        rewardTickets: 80,
        stat: 'turrets'
    },
    {
        id: 'ach_veteran_5',
        category: 'Mastery',
        title: 'Land of Dawn Veteran',
        desc: 'Complete 5 battlefield matches',
        target: 5,
        points: 80,
        rewardBp: 2500,
        rewardTickets: 50,
        stat: 'matches'
    },
    {
        id: 'ach_roster_10',
        category: 'Collection',
        title: 'Hero Collector',
        desc: 'Own 10 canonical MLBB heroes',
        target: 10,
        points: 150,
        rewardBp: 4000,
        rewardTickets: 100,
        stat: 'heroes'
    },
    {
        id: 'ach_skins_3',
        category: 'Collection',
        title: 'Style Icon',
        desc: 'Unlock 3 hero skins in Store',
        target: 3,
        points: 160,
        rewardBp: 4500,
        rewardTickets: 120,
        stat: 'skins'
    }
];
var MOBA_COLLECTOR_TIERS = [
    {
        name: 'Amateur Collector',
        minPoints: 0,
        colorHex: '#94a3b8'
    },
    {
        name: 'Expert Collector',
        minPoints: 600,
        colorHex: '#38bdf8'
    },
    {
        name: 'Renowned Collector',
        minPoints: 1800,
        colorHex: '#c084fc'
    },
    {
        name: 'Exalted Collector',
        minPoints: 4000,
        colorHex: '#f59e0b'
    },
    {
        name: 'World Collector',
        minPoints: 8000,
        colorHex: '#facc15'
    }
];
function computeCollectorTier(unlockedHeroCount, ownedSkins) {
    var skinPts = 0;
    for(var _iterator = _create_for_of_iterator_helper_loose(Object.values(ownedSkins)), _step; !(_step = _iterator()).done;){
        var list = _step.value;
        for(var _iterator1 = _create_for_of_iterator_helper_loose(list), _step1; !(_step1 = _iterator1()).done;){
            var sid = _step1.value;
            skinPts += getSkinVariantById(sid).collectorPts;
        }
    }
    var points = unlockedHeroCount * 80 + skinPts;
    var tier = MOBA_COLLECTOR_TIERS[0];
    var nextTier = MOBA_COLLECTOR_TIERS[1];
    for(var i = 0; i < MOBA_COLLECTOR_TIERS.length; i++){
        if (points >= MOBA_COLLECTOR_TIERS[i].minPoints) {
            var _MOBA_COLLECTOR_TIERS_;
            tier = MOBA_COLLECTOR_TIERS[i];
            nextTier = (_MOBA_COLLECTOR_TIERS_ = MOBA_COLLECTOR_TIERS[i + 1]) != null ? _MOBA_COLLECTOR_TIERS_ : null;
        }
    }
    return {
        points: points,
        tier: tier,
        nextTier: nextTier
    };
}
var MOBA_STARLIGHT_TRACK = [
    {
        level: 1,
        xpRequired: 0,
        label: 'StarLight Welcome Chest',
        rewardBp: 1500,
        rewardTickets: 50,
        rewardPromoDiamonds: 25,
        rewardCoins: 30
    },
    {
        level: 2,
        xpRequired: 100,
        label: 'Emblem Matrix Pack',
        rewardBp: 2000,
        rewardTickets: 60,
        rewardPromoDiamonds: 30,
        rewardCoins: 40
    },
    {
        level: 3,
        xpRequired: 220,
        label: 'Hero Fragment Bundle',
        rewardBp: 3000,
        rewardTickets: 80,
        rewardPromoDiamonds: 40,
        rewardCoins: 55
    },
    {
        level: 4,
        xpRequired: 360,
        label: 'Promo Carnival Cache',
        rewardBp: 4000,
        rewardTickets: 100,
        rewardPromoDiamonds: 60,
        rewardCoins: 75
    },
    {
        level: 5,
        xpRequired: 520,
        label: 'StarLight Grand Chest',
        rewardBp: 6000,
        rewardTickets: 150,
        rewardPromoDiamonds: 100,
        rewardCoins: 120
    }
];
var MOBA_LUCKY_SPIN_POOL = [
    {
        id: 'bp_1200',
        label: '1,200 Battle Points',
        icon: '💰',
        bp: 1200
    },
    {
        id: 'bp_3000',
        label: '3,000 Battle Points',
        icon: '💰',
        bp: 3000
    },
    {
        id: 'coins_65',
        label: '65 Arcade Coins',
        icon: '🪙',
        coins: 65
    },
    {
        id: 'diamonds_35',
        label: '35 Bonus Diamonds',
        icon: '💎',
        diamonds: 35
    },
    {
        id: 'trial_card',
        label: '2x Hero Trial Cards',
        icon: '🎫',
        trialCards: 2
    },
    {
        id: 'double_bp',
        label: 'Double BP Card',
        icon: '⚡',
        doubleBpCards: 1
    }
];
var DEFAULT_MOBA_SETTINGS = {
    cameraHeight: 'high',
    outline: true,
    damageText: true,
    targetPriority: 'lowest_hp',
    heroLockMode: true,
    smartTargeting: true,
    shopOpacity: 90,
    shopSide: 'left',
    mapVariantOverride: 'random'
};
function getHeroMasteryTitle(mmr) {
    if (mmr >= 3200) return 'Global Top';
    if (mmr >= 2400) return 'Supreme';
    if (mmr >= 1700) return 'Senior';
    if (mmr >= 1200) return 'Junior';
    return 'Apprentice';
}

});

})(window.ArcadeMod);
