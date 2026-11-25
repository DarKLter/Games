(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/data/heroCatalogMeta ===
ArcadeMod.define("src/games/legends-arena/mlbb/data/heroCatalogMeta", function(require, module, exports) {
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
    get enrichHeroSkins () {
        return enrichHeroSkins;
    },
    get getHeroExtraSkillPreview () {
        return getHeroExtraSkillPreview;
    },
    get getHeroMasterySummary () {
        return getHeroMasterySummary;
    }
});
var _mapData = require("../data/mapData");
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
var ROLE_SKIN_PALETTES = {
    Tank: {
        elite: {
            suffix: 'Iron Bastion',
            color: '#334155',
            accent: '#38BDF8'
        },
        special: {
            suffix: 'Dawn Sentinel',
            color: '#0F766E',
            accent: '#FDE047'
        },
        epic: {
            suffix: 'Obsidian Colossus',
            color: '#4C1D95',
            accent: '#F59E0B'
        },
        collector: {
            suffix: 'Imperial Aegis',
            color: '#D97706',
            accent: '#FEF08A',
            tier: 'Collector'
        }
    },
    Fighter: {
        elite: {
            suffix: 'Crimson Vanguard',
            color: '#991B1B',
            accent: '#FDBA74'
        },
        special: {
            suffix: 'Stormbreaker',
            color: '#0369A1',
            accent: '#67E8F9'
        },
        epic: {
            suffix: 'Dragon Sovereign',
            color: '#047857',
            accent: '#FACC15'
        },
        collector: {
            suffix: 'Celestial Warlord',
            color: '#B45309',
            accent: '#FFFFFF',
            tier: 'Legend'
        }
    },
    Assassin: {
        elite: {
            suffix: 'Nightstalker',
            color: '#1E1B4B',
            accent: '#C084FC'
        },
        special: {
            suffix: 'Neon Phantom',
            color: '#0E7490',
            accent: '#F472B6'
        },
        epic: {
            suffix: 'Eclipse Blade',
            color: '#581C87',
            accent: '#FDE047'
        },
        collector: {
            suffix: 'Astral Shadow',
            color: '#111827',
            accent: '#38BDF8',
            tier: 'Legend'
        }
    },
    Mage: {
        elite: {
            suffix: 'Sapphire Mystic',
            color: '#1D4ED8',
            accent: '#93C5FD'
        },
        special: {
            suffix: 'Starlight Oracle',
            color: '#BE185D',
            accent: '#FDE047'
        },
        epic: {
            suffix: 'Void Archmage',
            color: '#6D28D9',
            accent: '#38BDF8'
        },
        collector: {
            suffix: 'Empyrean Sovereign',
            color: '#0F172A',
            accent: '#F5C451',
            tier: 'Collector'
        }
    },
    Marksman: {
        elite: {
            suffix: 'Cobalt Sharpshooter',
            color: '#0284C7',
            accent: '#E0F2FE'
        },
        special: {
            suffix: 'Cyber Striker',
            color: '#DB2777',
            accent: '#22D3EE'
        },
        epic: {
            suffix: 'Solar Marksman',
            color: '#EA580C',
            accent: '#FEF08A'
        },
        collector: {
            suffix: 'Starfall Legend',
            color: '#4F46E5',
            accent: '#FACC15',
            tier: 'Legend'
        }
    },
    Support: {
        elite: {
            suffix: 'Emerald Warden',
            color: '#059669',
            accent: '#A7F3D0'
        },
        special: {
            suffix: 'Moonlit Seraph',
            color: '#7C3AED',
            accent: '#FBCFE8'
        },
        epic: {
            suffix: 'Radiant Herald',
            color: '#0284C7',
            accent: '#FDE047'
        },
        collector: {
            suffix: 'Sanctuary Saint',
            color: '#F8FAFC',
            accent: '#F5C451',
            tier: 'Collector'
        }
    }
};
function hashHeroSeed(id) {
    var h = 2166136261;
    for(var i = 0; i < id.length; i++){
        h ^= id.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
}
var ACCENT_SHIFT_POOL = [
    '#38BDF8',
    '#FACC15',
    '#F472B6',
    '#34D399',
    '#C084FC',
    '#FB923C'
];
function mapTagToTier(tag) {
    var t = tag.toLowerCase();
    if (t.includes('legend')) return 'Legend';
    if (t.includes('collector') || t.includes('aspirant') || t.includes('champion') || t.includes('lightborn')) return 'Collector';
    if (t.includes('epic')) return 'Epic';
    if (t.includes('special')) return 'Special';
    if (t.includes('elite')) return 'Elite';
    return 'Default';
}
function enrichHeroSkins(hero) {
    var baseSkins = Array.isArray(hero.skins) && hero.skins.length > 0 ? [].concat(hero.skins) : [
        {
            id: 'default',
            name: hero.title,
            tag: 'Default',
            color: hero.primaryColor,
            accent: hero.accentColor,
            costDiamonds: 0
        }
    ];
    var pal = ROLE_SKIN_PALETTES[hero.role];
    var seed = hashHeroSeed(hero.id);
    var altAccent = ACCENT_SHIFT_POOL[seed % ACCENT_SHIFT_POOL.length];
    var existingTiers = new Set(baseSkins.map(function(s) {
        return mapTagToTier(s.tag);
    }));
    var out = baseSkins.map(function(s, idx) {
        return idx === 0 ? _extends({}, s, {
            id: 'default',
            tag: 'Default',
            costDiamonds: 0
        }) : _extends({}, s);
    });
    var candidates = [
        {
            tier: 'Elite',
            id: "" + hero.id + "_elite",
            name: hero.name + " \xb7 " + pal.elite.suffix,
            tag: 'Elite',
            color: pal.elite.color,
            accent: pal.elite.accent,
            costDiamonds: 199
        },
        {
            tier: 'Special',
            id: "" + hero.id + "_special",
            name: hero.name + " \xb7 " + pal.special.suffix,
            tag: 'Special',
            color: pal.special.color,
            accent: altAccent,
            costDiamonds: 349
        },
        {
            tier: 'Epic',
            id: "" + hero.id + "_epic",
            name: hero.name + " \xb7 " + pal.epic.suffix,
            tag: 'Epic',
            color: pal.epic.color,
            accent: pal.epic.accent,
            costDiamonds: 499
        },
        {
            tier: pal.collector.tier,
            id: "" + hero.id + "_collector",
            name: hero.name + " \xb7 " + pal.collector.suffix,
            tag: pal.collector.tier,
            color: pal.collector.color,
            accent: pal.collector.accent,
            costDiamonds: 699
        }
    ];
    for(var _iterator = _create_for_of_iterator_helper_loose(candidates), _step; !(_step = _iterator()).done;){
        var c = _step.value;
        if (out.length >= 5) break;
        var isApexTier = c.tier === 'Collector' || c.tier === 'Legend';
        if (isApexTier && (existingTiers.has('Collector') || existingTiers.has('Legend'))) continue;
        if (existingTiers.has(c.tier)) continue;
        out.push({
            id: c.id,
            name: c.name,
            tag: c.tag,
            color: c.color,
            accent: c.accent,
            costDiamonds: c.costDiamonds
        });
        existingTiers.add(c.tier);
    }
    // Sort consistently: Default -> Elite -> Special -> Epic -> Collector/Legend
    var tierOrder = {
        Default: 0,
        Elite: 1,
        Special: 2,
        Epic: 3,
        Collector: 4,
        Legend: 5
    };
    out.sort(function(a, b) {
        return tierOrder[mapTagToTier(a.tag)] - tierOrder[mapTagToTier(b.tag)];
    });
    return out.slice(0, 5);
}
function getHeroMasterySummary(hero, stats, owned, claimedList) {
    var s = stats != null ? stats : {
        matches: 0,
        wins: 0,
        mmr: 1200,
        mastery: 0
    };
    var claimed = new Set(claimedList != null ? claimedList : []);
    var ch1Cur = owned ? 1 : s.matches > 0 ? 1 : 0;
    var ch2Cur = Math.min(2, s.matches);
    var ch3Cur = Math.min(2, s.wins);
    var ch4Cur = Math.min(100, Math.max(s.mastery, s.matches * 15 + s.wins * 20 + (owned ? 10 : 0)));
    var chapters = [
        {
            chapter: 1,
            title: "Chapter 1 \xb7 " + hero.title,
            objective: "Recruit " + hero.name + " or complete 1 match / practice session",
            current: ch1Cur,
            target: 1,
            completed: ch1Cur >= 1,
            claimed: claimed.has(1),
            rewardBp: 300,
            rewardTickets: 15,
            rewardLabel: '+300 BP · 15 Tickets'
        },
        {
            chapter: 2,
            title: "Chapter 2 \xb7 " + hero.lane + " Lane Discipline",
            objective: "Play 2 matches with " + hero.name + " mastering " + hero.skills[0].name,
            current: ch2Cur,
            target: 2,
            completed: ch2Cur >= 2,
            claimed: claimed.has(2),
            rewardBp: 600,
            rewardTickets: 25,
            rewardLabel: '+600 BP · 25 Tickets'
        },
        {
            chapter: 3,
            title: "Chapter 3 \xb7 " + hero.passiveName,
            objective: "Win 2 matches commanding " + hero.name + "'s " + hero.skills[2].name,
            current: ch3Cur,
            target: 2,
            completed: ch3Cur >= 2,
            claimed: claimed.has(3),
            rewardBp: 1000,
            rewardTickets: 45,
            rewardLabel: '+1,000 BP · 45 Tickets'
        },
        {
            chapter: 4,
            title: "Chapter 4 \xb7 Dawn Grandmaster",
            objective: "Reach 100% Hero Mastery Proficiency with " + hero.name,
            current: ch4Cur,
            target: 100,
            completed: ch4Cur >= 100,
            claimed: claimed.has(4),
            rewardBp: 1800,
            rewardTickets: 100,
            rewardLabel: '+1,800 BP · 100 Tickets · Mastery Emblem'
        }
    ];
    var completedChapters = chapters.filter(function(c) {
        return c.completed;
    }).length;
    var claimedChapters = chapters.filter(function(c) {
        return c.claimed;
    }).length;
    var masteryPct = Math.min(100, Math.max(s.mastery, Math.round(completedChapters / 4 * 100)));
    var badgeUnlocked = completedChapters >= 4 || masteryPct >= 100;
    return {
        heroId: hero.id,
        masteryPct: masteryPct,
        completedChapters: completedChapters,
        claimedChapters: claimedChapters,
        badgeUnlocked: badgeUnlocked,
        badgeTitle: badgeUnlocked ? "Master " + hero.name : "Apprentice Lv." + Math.max(1, completedChapters),
        chapters: chapters
    };
}
function getHeroExtraSkillPreview(heroId) {
    var m = _mapData.FOUR_SKILL_HERO_META[heroId];
    if (!m) return null;
    return {
        name: m.name,
        icon: m.icon,
        cd: m.cd,
        color: m.color,
        desc: m.desc
    };
}

});
// === MODULE: src/games/legends-arena/mlbb/data/heroes ===
ArcadeMod.define("src/games/legends-arena/mlbb/data/heroes", function(require, module, exports) {
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
    get MLBB_ALL_HEROES () {
        return MLBB_ALL_HEROES;
    },
    get MLBB_ICONIC_HEROES () {
        return MLBB_ICONIC_HEROES;
    },
    get getMlbbHeroById () {
        return getMlbbHeroById;
    }
});
var _heroesAll133 = require("./heroesAll133");
var _heroCatalogMeta = require("./heroCatalogMeta");
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
var MLBB_ICONIC_HEROES = [
    {
        id: 'miya',
        name: 'Miya',
        title: 'Moonlight Archer',
        role: 'Marksman',
        lane: 'Gold',
        specialty: 'Finisher · Damage',
        costBp: 0,
        costDiamonds: 0,
        starter: true,
        primaryColor: '#38A3FF',
        accentColor: '#C4E5FF',
        weaponIcon: '🏹',
        resource: 'mana',
        attackRange: 440,
        isRanged: true,
        baseHp: 2524,
        hpGrowth: 145,
        baseMana: 445,
        manaGrowth: 38,
        basePhysAtk: 100,
        physAtkGrowth: 10,
        baseMagicPow: 0,
        basePhysDef: 17,
        physDefGrowth: 3.6,
        baseMagicDef: 15,
        magicDefGrowth: 1.8,
        baseMoveSpd: 245,
        baseAtkSpd: 0.92,
        ratings: {
            durability: 35,
            offense: 92,
            control: 45,
            difficulty: 25
        },
        passiveName: 'Moon Blessing',
        passiveDesc: 'Basic Attacks grant +5% ATK Speed up to 5 stacks. At max stacks, Moonlight Shadow fires extra ghost arrows.',
        skills: [
            {
                slot: 1,
                name: 'Moon Arrow',
                icon: '🏹',
                desc: 'Enhances Basic Attacks for 4s to split into 3 lunar arrows striking nearby targets.',
                manaCost: 50,
                cooldown: [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                baseDmg: [
                    30,
                    40,
                    50,
                    60,
                    70,
                    80
                ],
                physScale: 0.35,
                magicScale: 0,
                damageType: 'physical',
                range: 440,
                radius: 160,
                telegraph: 'self',
                physics: 'buff',
                color: '#60A5FA',
                foreswing: 0.08,
                backswing: 0.1
            },
            {
                slot: 2,
                name: 'Arrow of Eclipse',
                icon: '🌙',
                desc: 'Drops a lunar volley immobilizing enemies for 1.2s and splitting into 8 slowing arrows.',
                manaCost: 70,
                cooldown: [
                    8,
                    7.6,
                    7.2,
                    6.8,
                    6.4,
                    6
                ],
                baseDmg: [
                    270,
                    310,
                    350,
                    390,
                    430,
                    470
                ],
                physScale: 0.45,
                magicScale: 0,
                damageType: 'physical',
                range: 560,
                radius: 130,
                telegraph: 'circle',
                physics: 'aoe',
                color: '#93C5FD',
                foreswing: 0.18,
                backswing: 0.18,
                ccType: 'root',
                ccDuration: 1.2
            },
            {
                slot: 3,
                name: 'Hidden Moonlight',
                icon: '✨',
                desc: 'Cleanses all CC, enters 2s Stealth with +35% Move Speed, and instantly grants max Moon Blessing stacks.',
                manaCost: 110,
                cooldown: [
                    42,
                    36,
                    30
                ],
                baseDmg: [
                    0,
                    0,
                    0
                ],
                physScale: 0,
                magicScale: 0,
                damageType: 'physical',
                range: 0,
                radius: 140,
                telegraph: 'self',
                physics: 'buff',
                color: '#E0F2FE',
                foreswing: 0.06,
                backswing: 0.1
            }
        ],
        recommendedBuild: [
            'swift_boots',
            'haas_claws',
            'berserkers_fury',
            'wind_of_nature',
            'malefic_roar',
            'blade_of_despair'
        ],
        skins: [
            {
                id: 'default',
                name: 'Moonlight Archer',
                tag: 'Classic',
                color: '#38A3FF',
                accent: '#C4E5FF',
                costDiamonds: 0
            },
            {
                id: 'modena',
                name: 'Modena Butterfly',
                tag: 'Legend',
                color: '#818CF8',
                accent: '#FDE047',
                costDiamonds: 450
            }
        ]
    },
    {
        id: 'layla',
        name: 'Layla',
        title: 'Energy Gunner',
        role: 'Marksman',
        lane: 'Gold',
        specialty: 'Finisher · Damage',
        costBp: 0,
        costDiamonds: 0,
        starter: true,
        primaryColor: '#F59E0B',
        accentColor: '#38BDF8',
        weaponIcon: '🔫',
        resource: 'mana',
        attackRange: 470,
        isRanged: true,
        baseHp: 2500,
        hpGrowth: 138,
        baseMana: 424,
        manaGrowth: 36,
        basePhysAtk: 108,
        physAtkGrowth: 11,
        baseMagicPow: 0,
        basePhysDef: 15,
        physDefGrowth: 3.4,
        baseMagicDef: 15,
        magicDefGrowth: 1.8,
        baseMoveSpd: 240,
        baseAtkSpd: 0.88,
        ratings: {
            durability: 30,
            offense: 96,
            control: 40,
            difficulty: 18
        },
        passiveName: 'Malefic Gun',
        passiveDesc: 'Basic Attacks and skills deal 100%–130% damage scaled by distance to target.',
        skills: [
            {
                slot: 1,
                name: 'Malefic Bomb',
                icon: '⚡',
                desc: 'Fires a long-range plasma bolt that extends Basic Attack range for 3s and grants +60% decaying Move Speed.',
                manaCost: 45,
                cooldown: [
                    5.5,
                    5.2,
                    4.9,
                    4.6,
                    4.3,
                    4
                ],
                baseDmg: [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                physScale: 0.85,
                magicScale: 0,
                damageType: 'physical',
                range: 640,
                radius: 44,
                telegraph: 'line',
                physics: 'projectile',
                color: '#38BDF8',
                foreswing: 0.14,
                backswing: 0.14
            },
            {
                slot: 2,
                name: 'Void Projectile',
                icon: '🔮',
                desc: 'Launches an exploding orb applying Magic Marks; popping a mark triggers AoE damage and a 0.25s stun.',
                manaCost: 65,
                cooldown: [
                    7.5,
                    7.2,
                    6.9,
                    6.6,
                    6.3,
                    6
                ],
                baseDmg: [
                    190,
                    225,
                    260,
                    295,
                    330,
                    365
                ],
                physScale: 0.7,
                magicScale: 0,
                damageType: 'physical',
                range: 560,
                radius: 115,
                telegraph: 'circle',
                physics: 'aoe',
                color: '#A855F7',
                foreswing: 0.16,
                backswing: 0.15,
                ccType: 'stun',
                ccDuration: 0.25
            },
            {
                slot: 3,
                name: 'Destruction Rush',
                icon: '💥',
                desc: 'Fires an 1100-unit Malefic energy cannon beam. Passively extends Basic Attack range per rank.',
                manaCost: 110,
                cooldown: [
                    34,
                    29,
                    24
                ],
                baseDmg: [
                    540,
                    690,
                    840
                ],
                physScale: 1.5,
                magicScale: 0,
                damageType: 'physical',
                range: 1100,
                radius: 85,
                telegraph: 'line',
                physics: 'projectile',
                color: '#FACC15',
                foreswing: 0.3,
                backswing: 0.22
            }
        ],
        recommendedBuild: [
            'swift_boots',
            'haas_claws',
            'berserkers_fury',
            'malefic_roar',
            'wind_of_nature',
            'blade_of_despair'
        ],
        skins: [
            {
                id: 'default',
                name: 'Energy Gunner',
                tag: 'Classic',
                color: '#F59E0B',
                accent: '#38BDF8',
                costDiamonds: 0
            },
            {
                id: 'aspirant',
                name: 'Miss Hikari',
                tag: 'Aspirants',
                color: '#EC4899',
                accent: '#38BDF8',
                costDiamonds: 599
            }
        ]
    },
    {
        id: 'tigreal',
        name: 'Tigreal',
        title: 'Warrior of Dawn',
        role: 'Tank',
        lane: 'Roam',
        specialty: 'Crowd Control · Initiator',
        costBp: 0,
        costDiamonds: 0,
        starter: true,
        primaryColor: '#2563EB',
        accentColor: '#FACC15',
        weaponIcon: '🛡️',
        resource: 'mana',
        attackRange: 145,
        isRanged: false,
        baseHp: 2890,
        hpGrowth: 245,
        baseMana: 450,
        manaGrowth: 40,
        basePhysAtk: 112,
        physAtkGrowth: 8,
        baseMagicPow: 0,
        basePhysDef: 28,
        physDefGrowth: 5.5,
        baseMagicDef: 18,
        magicDefGrowth: 3.1,
        baseMoveSpd: 260,
        baseAtkSpd: 0.82,
        ratings: {
            durability: 96,
            offense: 40,
            control: 98,
            difficulty: 30
        },
        passiveName: 'Fearless',
        passiveDesc: 'Every 4 skill casts or hits taken grants Blessing, completely blocking the next Basic Attack or Turret shot.',
        skills: [
            {
                slot: 1,
                name: 'Attack Wave',
                icon: '🌊',
                desc: 'Slams the ground unleashing 3 sequential shockwaves that slow enemies up to 60%.',
                manaCost: 45,
                cooldown: [
                    7,
                    6.6,
                    6.2,
                    5.8,
                    5.4,
                    5
                ],
                baseDmg: [
                    270,
                    310,
                    350,
                    390,
                    430,
                    470
                ],
                physScale: 0.8,
                magicScale: 0,
                damageType: 'physical',
                range: 420,
                radius: 120,
                telegraph: 'cone',
                physics: 'aoe',
                color: '#60A5FA',
                foreswing: 0.18,
                backswing: 0.16,
                ccType: 'slow',
                ccDuration: 1.5
            },
            {
                slot: 2,
                name: 'Sacred Hammer',
                icon: '🔨',
                desc: '2-stage charge pushing enemies along the path; recast knocks targets Airborne for 0.6s.',
                manaCost: 65,
                cooldown: [
                    12,
                    11.4,
                    10.8,
                    10.2,
                    9.6,
                    9
                ],
                baseDmg: [
                    260,
                    290,
                    320,
                    350,
                    380,
                    410
                ],
                physScale: 0.7,
                magicScale: 0,
                damageType: 'physical',
                range: 340,
                radius: 95,
                telegraph: 'line',
                physics: 'displacement',
                color: '#F59E0B',
                foreswing: 0.1,
                backswing: 0.15,
                ccType: 'airborne',
                ccDuration: 0.6,
                wallCross: false
            },
            {
                slot: 3,
                name: 'Implosion',
                icon: '☀️',
                desc: 'Pulls all nearby enemies into a golden vortex and stuns them for 1.8s. Comboable with Flicker.',
                manaCost: 120,
                cooldown: [
                    46,
                    42,
                    38
                ],
                baseDmg: [
                    360,
                    460,
                    560
                ],
                physScale: 1.1,
                magicScale: 0,
                damageType: 'physical',
                range: 0,
                radius: 255,
                telegraph: 'ring',
                physics: 'displacement',
                color: '#FACC15',
                foreswing: 0.38,
                backswing: 0.2,
                ccType: 'stun',
                ccDuration: 1.8
            }
        ],
        recommendedBuild: [
            'tough_boots',
            'dominance_ice',
            'athenas_shield',
            'antique_cuirass',
            'radiant_armor',
            'immortality'
        ],
        skins: [
            {
                id: 'default',
                name: 'Warrior of Dawn',
                tag: 'Classic',
                color: '#2563EB',
                accent: '#FACC15',
                costDiamonds: 0
            },
            {
                id: 'lightborn',
                name: 'Lightborn Defender',
                tag: 'Lightborn',
                color: '#FACC15',
                accent: '#FFFFFF',
                costDiamonds: 599
            }
        ]
    },
    {
        id: 'franco',
        name: 'Franco',
        title: 'Frozen Warrior',
        role: 'Tank',
        lane: 'Roam',
        specialty: 'Initiator · Suppression',
        costBp: 15000,
        costDiamonds: 299,
        starter: true,
        primaryColor: '#0284C7',
        accentColor: '#E2E8F0',
        weaponIcon: '🪝',
        resource: 'mana',
        attackRange: 140,
        isRanged: false,
        baseHp: 2810,
        hpGrowth: 235,
        baseMana: 440,
        manaGrowth: 40,
        basePhysAtk: 116,
        physAtkGrowth: 8.5,
        baseMagicPow: 0,
        basePhysDef: 26,
        physDefGrowth: 5.2,
        baseMagicDef: 17,
        magicDefGrowth: 2.9,
        baseMoveSpd: 260,
        baseAtkSpd: 0.83,
        ratings: {
            durability: 88,
            offense: 50,
            control: 99,
            difficulty: 68
        },
        passiveName: 'Wasteland Force',
        passiveDesc: 'After 5s out of combat, gains +10% Move Speed, rapid HP regen, and stacks boosting next skill damage.',
        skills: [
            {
                slot: 1,
                name: 'Iron Hook',
                icon: '🪝',
                desc: 'Launches an 850-range iron chain hook that drags the first struck enemy directly back to Franco.',
                manaCost: 85,
                cooldown: [
                    13,
                    12.2,
                    11.4,
                    10.6,
                    9.8,
                    9
                ],
                baseDmg: [
                    400,
                    450,
                    500,
                    550,
                    600,
                    650
                ],
                physScale: 1.0,
                magicScale: 0,
                damageType: 'physical',
                range: 850,
                radius: 36,
                telegraph: 'line',
                physics: 'displacement',
                color: '#94A3B8',
                foreswing: 0.22,
                backswing: 0.18,
                ccType: 'pull',
                ccDuration: 0.55
            },
            {
                slot: 2,
                name: 'Fury Shock',
                icon: '🪓',
                desc: 'Point-blank axe slam dealing Max-HP bonus damage and slowing surrounding enemies by 70% for 1.5s.',
                manaCost: 50,
                cooldown: [
                    7,
                    6.6,
                    6.2,
                    5.8,
                    5.4,
                    5
                ],
                baseDmg: [
                    300,
                    330,
                    360,
                    390,
                    420,
                    450
                ],
                physScale: 0.4,
                magicScale: 0,
                damageType: 'physical',
                range: 0,
                radius: 205,
                telegraph: 'ring',
                physics: 'aoe',
                color: '#38BDF8',
                foreswing: 0.14,
                backswing: 0.15,
                ccType: 'slow',
                ccDuration: 1.5
            },
            {
                slot: 3,
                name: 'Bloody Hunt',
                icon: '⛓️',
                desc: 'Suppresses target enemy for 1.8s (ignores CC Immunity & Purify) while delivering 6 rapid axe hacks.',
                manaCost: 110,
                cooldown: [
                    42,
                    37,
                    32
                ],
                baseDmg: [
                    420,
                    540,
                    660
                ],
                physScale: 1.4,
                magicScale: 0,
                damageType: 'physical',
                range: 250,
                radius: 90,
                telegraph: 'circle',
                physics: 'channel',
                color: '#EF4444',
                foreswing: 0.1,
                backswing: 0.2,
                ccType: 'suppression',
                ccDuration: 1.8
            }
        ],
        recommendedBuild: [
            'rapid_boots',
            'dominance_ice',
            'athenas_shield',
            'antique_cuirass',
            'blade_armor',
            'immortality'
        ],
        skins: [
            {
                id: 'default',
                name: 'Frozen Warrior',
                tag: 'Classic',
                color: '#0284C7',
                accent: '#E2E8F0',
                costDiamonds: 0
            },
            {
                id: 'king_of_hell',
                name: 'King of Hell',
                tag: 'Legend',
                color: '#DC2626',
                accent: '#FACC15',
                costDiamonds: 699
            }
        ]
    },
    {
        id: 'zilong',
        name: 'Zilong',
        title: 'Spear of Dragon',
        role: 'Fighter',
        secondaryRole: 'Assassin',
        lane: 'EXP',
        specialty: 'Chase · Damage',
        costBp: 0,
        costDiamonds: 0,
        starter: true,
        primaryColor: '#1D4ED8',
        accentColor: '#F59E0B',
        weaponIcon: '🔱',
        resource: 'mana',
        attackRange: 155,
        isRanged: false,
        baseHp: 2689,
        hpGrowth: 195,
        baseMana: 405,
        manaGrowth: 35,
        basePhysAtk: 123,
        physAtkGrowth: 11.5,
        baseMagicPow: 0,
        basePhysDef: 25,
        physDefGrowth: 4.5,
        baseMagicDef: 16,
        magicDefGrowth: 2.3,
        baseMoveSpd: 265,
        baseAtkSpd: 0.96,
        ratings: {
            durability: 62,
            offense: 90,
            control: 55,
            difficulty: 24
        },
        passiveName: 'Dragon Flurry',
        passiveDesc: 'Every 3 Basic Attacks triggers a rapid triple-strike dealing bonus damage and healing Zilong.',
        skills: [
            {
                slot: 1,
                name: 'Spear Flip',
                icon: '🔄',
                desc: 'Lifts and flips target enemy behind Zilong, shredding Physical Defense for 2s.',
                manaCost: 55,
                cooldown: [
                    8,
                    7.6,
                    7.2,
                    6.8,
                    6.4,
                    6
                ],
                baseDmg: [
                    250,
                    280,
                    310,
                    340,
                    370,
                    400
                ],
                physScale: 0.85,
                magicScale: 0,
                damageType: 'physical',
                range: 220,
                radius: 80,
                telegraph: 'circle',
                physics: 'displacement',
                color: '#F59E0B',
                foreswing: 0.12,
                backswing: 0.14,
                ccType: 'airborne',
                ccDuration: 0.55
            },
            {
                slot: 2,
                name: 'Spear Strike',
                icon: '⚡',
                desc: 'Dashes to target enemy dealing burst damage; resets cooldown immediately if target dies within 1s.',
                manaCost: 50,
                cooldown: [
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5,
                    7
                ],
                baseDmg: [
                    260,
                    300,
                    340,
                    380,
                    420,
                    460
                ],
                physScale: 0.8,
                magicScale: 0,
                damageType: 'physical',
                range: 460,
                radius: 65,
                telegraph: 'line',
                physics: 'dash',
                color: '#38BDF8',
                foreswing: 0.08,
                backswing: 0.12,
                wallCross: true
            },
            {
                slot: 3,
                name: 'Supreme Warrior',
                icon: '🐉',
                desc: 'Cleanses slows, gains Slow Immunity, +40% Move Speed, +45% ATK Speed for 7.5s, and Dragon Flurry every 2 hits.',
                manaCost: 100,
                cooldown: [
                    38,
                    34,
                    30
                ],
                baseDmg: [
                    0,
                    0,
                    0
                ],
                physScale: 0,
                magicScale: 0,
                damageType: 'physical',
                range: 0,
                radius: 150,
                telegraph: 'self',
                physics: 'buff',
                color: '#FACC15',
                foreswing: 0.06,
                backswing: 0.08
            }
        ],
        recommendedBuild: [
            'rapid_boots',
            'haas_claws',
            'berserkers_fury',
            'blade_of_heptaseas',
            'malefic_roar',
            'blade_of_despair'
        ],
        skins: [
            {
                id: 'default',
                name: 'Spear of Dragon',
                tag: 'Classic',
                color: '#1D4ED8',
                accent: '#F59E0B',
                costDiamonds: 0
            },
            {
                id: 'glorious',
                name: 'Glorious General',
                tag: 'Epic',
                color: '#10B981',
                accent: '#FDE047',
                costDiamonds: 499
            }
        ]
    },
    {
        id: 'alucard',
        name: 'Alucard',
        title: 'Demon Hunter',
        role: 'Fighter',
        secondaryRole: 'Assassin',
        lane: 'Jungle',
        specialty: 'Chase · Lifesteal',
        costBp: 15000,
        costDiamonds: 299,
        starter: true,
        primaryColor: '#B91C1C',
        accentColor: '#38BDF8',
        weaponIcon: '⚔️',
        resource: 'none',
        attackRange: 155,
        isRanged: false,
        baseHp: 2821,
        hpGrowth: 205,
        baseMana: 0,
        manaGrowth: 0,
        basePhysAtk: 126,
        physAtkGrowth: 11,
        baseMagicPow: 0,
        basePhysDef: 24,
        physDefGrowth: 4.4,
        baseMagicDef: 16,
        magicDefGrowth: 2.4,
        baseMoveSpd: 260,
        baseAtkSpd: 0.9,
        ratings: {
            durability: 70,
            offense: 92,
            control: 35,
            difficulty: 42
        },
        passiveName: 'Pursuit',
        passiveDesc: 'After casting a skill, next Basic Attack leaps to target for 1.4x damage. Skills deal bonus damage to isolated targets.',
        skills: [
            {
                slot: 1,
                name: 'Groundsplitter',
                icon: '🦘',
                desc: 'Parabolic wall-crossing leap slamming the ground and slowing enemies by 40% for 2s.',
                manaCost: 0,
                cooldown: [
                    8,
                    7.6,
                    7.2,
                    6.8,
                    6.4,
                    6
                ],
                baseDmg: [
                    270,
                    305,
                    340,
                    375,
                    410,
                    445
                ],
                physScale: 1.1,
                magicScale: 0,
                damageType: 'physical',
                range: 460,
                radius: 150,
                telegraph: 'circle',
                physics: 'leap',
                color: '#38BDF8',
                foreswing: 0.14,
                backswing: 0.14,
                ccType: 'slow',
                ccDuration: 2.0,
                wallCross: true
            },
            {
                slot: 2,
                name: 'Whirling Smash',
                icon: '🌀',
                desc: 'Unleashes a 360-degree demonic greatsword slash around Alucard.',
                manaCost: 0,
                cooldown: [
                    5,
                    4.8,
                    4.6,
                    4.4,
                    4.2,
                    4
                ],
                baseDmg: [
                    330,
                    375,
                    420,
                    465,
                    510,
                    555
                ],
                physScale: 1.2,
                magicScale: 0,
                damageType: 'physical',
                range: 0,
                radius: 215,
                telegraph: 'ring',
                physics: 'aoe',
                color: '#60A5FA',
                foreswing: 0.1,
                backswing: 0.12
            },
            {
                slot: 3,
                name: 'Fission Wave',
                icon: '🔥',
                desc: 'Gains +30% Hybrid Lifesteal for 8s and marks enemies; recast unleashes a wide crimson shockwave.',
                manaCost: 0,
                cooldown: [
                    36,
                    32,
                    28
                ],
                baseDmg: [
                    440,
                    560,
                    680
                ],
                physScale: 1.5,
                magicScale: 0,
                damageType: 'physical',
                range: 540,
                radius: 140,
                telegraph: 'cone',
                physics: 'projectile',
                color: '#EF4444',
                foreswing: 0.15,
                backswing: 0.16
            }
        ],
        recommendedBuild: [
            'tough_boots',
            'haas_claws',
            'blade_of_heptaseas',
            'malefic_roar',
            'blade_of_despair',
            'immortality'
        ],
        skins: [
            {
                id: 'default',
                name: 'Demon Hunter',
                tag: 'Classic',
                color: '#B91C1C',
                accent: '#38BDF8',
                costDiamonds: 0
            },
            {
                id: 'obsidian',
                name: 'Obsidian Blade',
                tag: 'Legend',
                color: '#6366F1',
                accent: '#F43F5E',
                costDiamonds: 699
            }
        ]
    },
    {
        id: 'saber',
        name: 'Saber',
        title: 'Wandering Sword',
        role: 'Assassin',
        lane: 'Jungle',
        specialty: 'Charge · Burst',
        costBp: 24000,
        costDiamonds: 399,
        starter: true,
        primaryColor: '#06B6D4',
        accentColor: '#E0F2FE',
        weaponIcon: '🗡️',
        resource: 'mana',
        attackRange: 150,
        isRanged: false,
        baseHp: 2599,
        hpGrowth: 168,
        baseMana: 443,
        manaGrowth: 36,
        basePhysAtk: 118,
        physAtkGrowth: 12,
        baseMagicPow: 0,
        basePhysDef: 18,
        physDefGrowth: 3.8,
        baseMagicDef: 15,
        magicDefGrowth: 2.1,
        baseMoveSpd: 260,
        baseAtkSpd: 0.91,
        ratings: {
            durability: 45,
            offense: 95,
            control: 72,
            difficulty: 32
        },
        passiveName: "Enemy's Bane",
        passiveDesc: 'Every hit shreds target Physical Defense by 5 (up to 5 stacks for 5s).',
        skills: [
            {
                slot: 1,
                name: 'Orbiting Swords',
                icon: '⚔️',
                desc: 'Summons 5 rotating cyan laser blades that pierce enemies and fly into targets struck by Saber.',
                manaCost: 55,
                cooldown: [
                    8,
                    7.6,
                    7.2,
                    6.8,
                    6.4,
                    6
                ],
                baseDmg: [
                    120,
                    145,
                    170,
                    195,
                    220,
                    245
                ],
                physScale: 0.5,
                magicScale: 0,
                damageType: 'physical',
                range: 0,
                radius: 175,
                telegraph: 'ring',
                physics: 'projectile',
                color: '#22D3EE',
                foreswing: 0.08,
                backswing: 0.1
            },
            {
                slot: 2,
                name: 'Charge',
                icon: '💨',
                desc: 'Wall-crossing cyber dash empowering next Basic Attack into a lunging slowing strike.',
                manaCost: 45,
                cooldown: [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                baseDmg: [
                    150,
                    175,
                    200,
                    225,
                    250,
                    275
                ],
                physScale: 0.65,
                magicScale: 0,
                damageType: 'physical',
                range: 420,
                radius: 65,
                telegraph: 'line',
                physics: 'dash',
                color: '#38BDF8',
                foreswing: 0.06,
                backswing: 0.1,
                ccType: 'slow',
                ccDuration: 1.0,
                wallCross: true
            },
            {
                slot: 3,
                name: 'Triple Sweep',
                icon: '⚡',
                desc: 'Locks onto target enemy, knocks them Airborne for 1.2s, and executes 3 lethal cyber-slashes.',
                manaCost: 110,
                cooldown: [
                    38,
                    34,
                    30
                ],
                baseDmg: [
                    480,
                    620,
                    760
                ],
                physScale: 1.9,
                magicScale: 0,
                damageType: 'physical',
                range: 420,
                radius: 85,
                telegraph: 'circle',
                physics: 'displacement',
                color: '#06B6D4',
                foreswing: 0.1,
                backswing: 0.18,
                ccType: 'airborne',
                ccDuration: 1.2
            }
        ],
        recommendedBuild: [
            'magic_shoes',
            'blade_of_heptaseas',
            'sky_piercer',
            'malefic_roar',
            'blade_of_despair',
            'immortality'
        ],
        skins: [
            {
                id: 'default',
                name: 'Wandering Sword',
                tag: 'Classic',
                color: '#06B6D4',
                accent: '#E0F2FE',
                costDiamonds: 0
            },
            {
                id: 'codename',
                name: 'Codename - Storm',
                tag: 'Legend',
                color: '#0EA5E9',
                accent: '#FACC15',
                costDiamonds: 699
            }
        ]
    },
    {
        id: 'lancelot',
        name: 'Lancelot',
        title: 'Perfumed Knight',
        role: 'Assassin',
        lane: 'Jungle',
        specialty: 'Chase · Untargetable Burst',
        costBp: 32000,
        costDiamonds: 599,
        primaryColor: '#F59E0B',
        accentColor: '#FEF08A',
        weaponIcon: '🤺',
        resource: 'mana',
        attackRange: 150,
        isRanged: false,
        baseHp: 2549,
        hpGrowth: 165,
        baseMana: 450,
        manaGrowth: 38,
        basePhysAtk: 124,
        physAtkGrowth: 12,
        baseMagicPow: 0,
        basePhysDef: 16,
        physDefGrowth: 3.6,
        baseMagicDef: 15,
        magicDefGrowth: 2.0,
        baseMoveSpd: 260,
        baseAtkSpd: 0.94,
        ratings: {
            durability: 42,
            offense: 98,
            control: 25,
            difficulty: 92
        },
        passiveName: 'Soul Cutter',
        passiveDesc: 'Each dash grants +7.5% damage for 4s (stacks up to 4 times for +30% damage).',
        skills: [
            {
                slot: 1,
                name: 'Puncture',
                icon: '✨',
                desc: 'Dashes in a line applying Sword Marks; dashing through an unmarked target resets cooldown immediately.',
                manaCost: 40,
                cooldown: [
                    11,
                    10.4,
                    9.8,
                    9.2,
                    8.6,
                    8
                ],
                baseDmg: [
                    150,
                    180,
                    210,
                    240,
                    270,
                    300
                ],
                physScale: 0.75,
                magicScale: 0,
                damageType: 'physical',
                range: 440,
                radius: 60,
                telegraph: 'line',
                physics: 'dash',
                color: '#FDE047',
                foreswing: 0.06,
                backswing: 0.08,
                wallCross: true
            },
            {
                slot: 2,
                name: 'Thorned Rose',
                icon: '🌹',
                desc: 'Becomes Untargetable for 0.6s while carving a golden triangle slash hitting enemies up to 3 times.',
                manaCost: 70,
                cooldown: [
                    9,
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5
                ],
                baseDmg: [
                    340,
                    390,
                    440,
                    490,
                    540,
                    590
                ],
                physScale: 1.5,
                magicScale: 0,
                damageType: 'physical',
                range: 340,
                radius: 175,
                telegraph: 'cone',
                physics: 'iframe',
                color: '#FACC15',
                foreswing: 0.06,
                backswing: 0.1
            },
            {
                slot: 3,
                name: 'Phantom Execution',
                icon: '⚔️',
                desc: 'Untargetable wind-up followed by a high-burst golden linear lunge through all enemies.',
                manaCost: 110,
                cooldown: [
                    27,
                    24,
                    21
                ],
                baseDmg: [
                    450,
                    620,
                    790
                ],
                physScale: 1.8,
                magicScale: 0,
                damageType: 'physical',
                range: 520,
                radius: 75,
                telegraph: 'line',
                physics: 'iframe',
                color: '#FEF08A',
                foreswing: 0.28,
                backswing: 0.14,
                wallCross: true
            }
        ],
        recommendedBuild: [
            'tough_boots',
            'blade_of_heptaseas',
            'sky_piercer',
            'malefic_roar',
            'blade_of_despair',
            'immortality'
        ],
        skins: [
            {
                id: 'default',
                name: 'Perfumed Knight',
                tag: 'Classic',
                color: '#F59E0B',
                accent: '#FEF08A',
                costDiamonds: 0
            },
            {
                id: 'bren',
                name: 'Bren Esports',
                tag: 'Champion',
                color: '#0F172A',
                accent: '#FACC15',
                costDiamonds: 599
            }
        ]
    },
    {
        id: 'eudora',
        name: 'Eudora',
        title: 'Lightning Weaver',
        role: 'Mage',
        lane: 'Mid',
        specialty: 'Burst · Control',
        costBp: 0,
        costDiamonds: 0,
        starter: true,
        primaryColor: '#6366F1',
        accentColor: '#38BDF8',
        weaponIcon: '⚡',
        resource: 'mana',
        attackRange: 430,
        isRanged: true,
        baseHp: 2524,
        hpGrowth: 142,
        baseMana: 468,
        manaGrowth: 55,
        basePhysAtk: 105,
        physAtkGrowth: 6,
        baseMagicPow: 24,
        basePhysDef: 19,
        physDefGrowth: 3.4,
        baseMagicDef: 15,
        magicDefGrowth: 1.9,
        baseMoveSpd: 250,
        baseAtkSpd: 0.8,
        ratings: {
            durability: 34,
            offense: 95,
            control: 82,
            difficulty: 20
        },
        passiveName: 'Superconductor',
        passiveDesc: 'Skills apply a static Superconductor mark that supercharges follow-up skills with bonus burst or chain stuns.',
        skills: [
            {
                slot: 1,
                name: 'Forked Lightning',
                icon: '⚡',
                desc: 'Fires a lightning fan cone dealing heavy Magic Damage and bonus shock burst to marked enemies.',
                manaCost: 65,
                cooldown: [
                    7,
                    6.6,
                    6.2,
                    5.8,
                    5.4,
                    5
                ],
                baseDmg: [
                    350,
                    400,
                    450,
                    500,
                    550,
                    600
                ],
                physScale: 0,
                magicScale: 1.3,
                damageType: 'magic',
                range: 460,
                radius: 155,
                telegraph: 'cone',
                physics: 'aoe',
                color: '#60A5FA',
                foreswing: 0.14,
                backswing: 0.14
            },
            {
                slot: 2,
                name: 'Ball Lightning',
                icon: '🔵',
                desc: 'Homing lightning orb stunning for 1.2s; chains a 0.6s stun to nearby enemies if target is marked.',
                manaCost: 85,
                cooldown: [
                    11,
                    10.5,
                    10,
                    9.5,
                    9,
                    8.5
                ],
                baseDmg: [
                    330,
                    360,
                    390,
                    420,
                    450,
                    480
                ],
                physScale: 0,
                magicScale: 0.8,
                damageType: 'magic',
                range: 520,
                radius: 55,
                telegraph: 'circle',
                physics: 'projectile',
                color: '#38BDF8',
                foreswing: 0.14,
                backswing: 0.14,
                ccType: 'stun',
                ccDuration: 1.2
            },
            {
                slot: 3,
                name: "Thunder's Wrath",
                icon: '🌩️',
                desc: 'Summons a massive sky lightning strike, triggering a delayed AoE storm blast on marked enemies.',
                manaCost: 130,
                cooldown: [
                    32,
                    28,
                    24
                ],
                baseDmg: [
                    600,
                    780,
                    960
                ],
                physScale: 0,
                magicScale: 1.85,
                damageType: 'magic',
                range: 520,
                radius: 145,
                telegraph: 'circle',
                physics: 'aoe',
                color: '#A855F7',
                foreswing: 0.18,
                backswing: 0.18
            }
        ],
        recommendedBuild: [
            'arcane_boots',
            'glowing_wand',
            'holy_crystal',
            'divine_glaive',
            'winter_crown',
            'immortality'
        ],
        skins: [
            {
                id: 'default',
                name: 'Lightning Weaver',
                tag: 'Classic',
                color: '#6366F1',
                accent: '#38BDF8',
                costDiamonds: 0
            },
            {
                id: 'atomic',
                name: 'Atomic Pop',
                tag: 'Special',
                color: '#EC4899',
                accent: '#38BDF8',
                costDiamonds: 499
            }
        ]
    },
    {
        id: 'nana',
        name: 'Nana',
        title: 'Sweet Leonin',
        role: 'Mage',
        secondaryRole: 'Support',
        lane: 'Mid',
        specialty: 'Poke · Polymorph Control',
        costBp: 15000,
        costDiamonds: 299,
        starter: true,
        primaryColor: '#EC4899',
        accentColor: '#FDE047',
        weaponIcon: '🐾',
        resource: 'mana',
        attackRange: 440,
        isRanged: true,
        baseHp: 2501,
        hpGrowth: 144,
        baseMana: 510,
        manaGrowth: 58,
        basePhysAtk: 102,
        physAtkGrowth: 6,
        baseMagicPow: 22,
        basePhysDef: 17,
        physDefGrowth: 3.3,
        baseMagicDef: 15,
        magicDefGrowth: 1.9,
        baseMoveSpd: 250,
        baseAtkSpd: 0.82,
        ratings: {
            durability: 48,
            offense: 85,
            control: 92,
            difficulty: 24
        },
        passiveName: "Molina's Gift",
        passiveDesc: '150s CD: Taking fatal damage cleanses CC, turns Nana into an untargetable spirit for 2s with +70% MS.',
        skills: [
            {
                slot: 1,
                name: 'Magic Boomerang',
                icon: '🪃',
                desc: 'Throws a piercing boomerang that deals Magic Damage both outbound and returning.',
                manaCost: 55,
                cooldown: [
                    6,
                    5.7,
                    5.4,
                    5.1,
                    4.8,
                    4.5
                ],
                baseDmg: [
                    260,
                    295,
                    330,
                    365,
                    400,
                    435
                ],
                physScale: 0,
                magicScale: 1.0,
                damageType: 'magic',
                range: 640,
                radius: 52,
                telegraph: 'line',
                physics: 'boomerang',
                color: '#F472B6',
                foreswing: 0.14,
                backswing: 0.14
            },
            {
                slot: 2,
                name: 'Molina Smooch',
                icon: '🐱',
                desc: 'Summons Molina at target area, transforming enemies into slow critters for 1.5s with -25% Magic Defense.',
                manaCost: 80,
                cooldown: [
                    13,
                    12.4,
                    11.8,
                    11.2,
                    10.6,
                    10
                ],
                baseDmg: [
                    250,
                    275,
                    300,
                    325,
                    350,
                    375
                ],
                physScale: 0,
                magicScale: 0.55,
                damageType: 'magic',
                range: 540,
                radius: 130,
                telegraph: 'circle',
                physics: 'aoe',
                color: '#FBBF24',
                foreswing: 0.16,
                backswing: 0.14,
                ccType: 'transform',
                ccDuration: 1.5
            },
            {
                slot: 3,
                name: 'Molina Blitz',
                icon: '🐾',
                desc: 'Calls down 3 sequential paw blasts; enemies hit by 2 blasts are stunned for 1s.',
                manaCost: 130,
                cooldown: [
                    36,
                    32,
                    28
                ],
                baseDmg: [
                    420,
                    520,
                    620
                ],
                physScale: 0,
                magicScale: 1.55,
                damageType: 'magic',
                range: 560,
                radius: 180,
                telegraph: 'circle',
                physics: 'aoe',
                color: '#F472B6',
                foreswing: 0.22,
                backswing: 0.18,
                ccType: 'stun',
                ccDuration: 1.0
            }
        ],
        recommendedBuild: [
            'arcane_boots',
            'glowing_wand',
            'holy_crystal',
            'divine_glaive',
            'winter_crown',
            'immortality'
        ],
        skins: [
            {
                id: 'default',
                name: 'Sweet Leonin',
                tag: 'Classic',
                color: '#EC4899',
                accent: '#FDE047',
                costDiamonds: 0
            },
            {
                id: 'mecha',
                name: 'Mecha Baby',
                tag: 'Epic',
                color: '#38BDF8',
                accent: '#F472B6',
                costDiamonds: 499
            }
        ]
    },
    {
        id: 'estes',
        name: 'Estes',
        title: 'Moon Elf King',
        role: 'Support',
        lane: 'Roam',
        specialty: 'Regen · Team Sustain',
        costBp: 24000,
        costDiamonds: 399,
        primaryColor: '#10B981',
        accentColor: '#FEF08A',
        weaponIcon: '🌿',
        resource: 'mana',
        attackRange: 420,
        isRanged: true,
        baseHp: 2621,
        hpGrowth: 175,
        baseMana: 545,
        manaGrowth: 60,
        basePhysAtk: 108,
        physAtkGrowth: 6.5,
        baseMagicPow: 20,
        basePhysDef: 18,
        physDefGrowth: 3.7,
        baseMagicDef: 16,
        magicDefGrowth: 2.3,
        baseMoveSpd: 245,
        baseAtkSpd: 0.8,
        ratings: {
            durability: 68,
            offense: 35,
            control: 60,
            difficulty: 28
        },
        passiveName: 'Scripture of Moon Elf',
        passiveDesc: 'Charges to 100 stacks, empowering next Basic Attack into a bouncing slowing moonlight beam.',
        skills: [
            {
                slot: 1,
                name: 'Moonlight Immersion',
                icon: '💚',
                desc: 'Instantly heals an ally (or self) and links a 3s glowing lunar tether restoring continuous HP.',
                manaCost: 60,
                cooldown: [
                    8,
                    7.6,
                    7.2,
                    6.8,
                    6.4,
                    6
                ],
                baseDmg: [
                    260,
                    300,
                    340,
                    380,
                    420,
                    460
                ],
                physScale: 0,
                magicScale: 0.75,
                damageType: 'magic',
                range: 520,
                radius: 150,
                telegraph: 'ally',
                physics: 'tether',
                color: '#2CE58B',
                foreswing: 0.1,
                backswing: 0.12
            },
            {
                slot: 2,
                name: 'Domain of Moon Goddess',
                icon: '🌙',
                desc: 'Creates a wide lunar ring inflicting a massive 90% slow for 1.5s when enemies cross the border.',
                manaCost: 75,
                cooldown: [
                    11,
                    10.5,
                    10,
                    9.5,
                    9,
                    8.5
                ],
                baseDmg: [
                    280,
                    320,
                    360,
                    400,
                    440,
                    480
                ],
                physScale: 0,
                magicScale: 0.7,
                damageType: 'magic',
                range: 520,
                radius: 170,
                telegraph: 'circle',
                physics: 'aoe',
                color: '#34D399',
                foreswing: 0.16,
                backswing: 0.14,
                ccType: 'slow',
                ccDuration: 1.5
            },
            {
                slot: 3,
                name: 'Blessing of Moon Goddess',
                icon: '🌟',
                desc: 'Unleashes enhanced healing tethers onto ALL nearby allies simultaneously for 8s.',
                manaCost: 130,
                cooldown: [
                    48,
                    44,
                    40
                ],
                baseDmg: [
                    420,
                    560,
                    700
                ],
                physScale: 0,
                magicScale: 1.2,
                damageType: 'magic',
                range: 0,
                radius: 420,
                telegraph: 'ring',
                physics: 'tether',
                color: '#4ADE80',
                foreswing: 0.12,
                backswing: 0.14
            }
        ],
        recommendedBuild: [
            'magic_shoes',
            'dominance_ice',
            'athenas_shield',
            'antique_cuirass',
            'holy_crystal',
            'immortality'
        ],
        skins: [
            {
                id: 'default',
                name: 'Moon Elf King',
                tag: 'Classic',
                color: '#10B981',
                accent: '#FEF08A',
                costDiamonds: 0
            },
            {
                id: 'blacklist',
                name: 'Blacklist International',
                tag: 'Champion',
                color: '#F8FAFC',
                accent: '#FACC15',
                costDiamonds: 599
            }
        ]
    },
    {
        id: 'angela',
        name: 'Angela',
        title: 'Bunnylove',
        role: 'Support',
        lane: 'Roam',
        specialty: 'Guard · Global Attach',
        costBp: 32000,
        costDiamonds: 599,
        primaryColor: '#F43F5E',
        accentColor: '#FBCFE8',
        weaponIcon: '🎀',
        resource: 'mana',
        attackRange: 430,
        isRanged: true,
        baseHp: 2490,
        hpGrowth: 152,
        baseMana: 520,
        manaGrowth: 56,
        basePhysAtk: 104,
        physAtkGrowth: 6,
        baseMagicPow: 20,
        basePhysDef: 16,
        physDefGrowth: 3.4,
        baseMagicDef: 15,
        magicDefGrowth: 2.0,
        baseMoveSpd: 245,
        baseAtkSpd: 0.82,
        ratings: {
            durability: 48,
            offense: 65,
            control: 75,
            difficulty: 45
        },
        passiveName: 'Smart Heart',
        passiveDesc: 'Casting skills stacks +7.5% Move Speed up to +30% (shared with attached Heartguard ally).',
        skills: [
            {
                slot: 1,
                name: 'Love Waves',
                icon: '💗',
                desc: 'Sends love energy healing allies while damaging enemies and stacking +20% damage-taken Lover’s Marks.',
                manaCost: 45,
                cooldown: [
                    4.5,
                    4.3,
                    4.1,
                    3.9,
                    3.7,
                    3.5
                ],
                baseDmg: [
                    210,
                    240,
                    270,
                    300,
                    330,
                    360
                ],
                physScale: 0,
                magicScale: 0.85,
                damageType: 'magic',
                range: 560,
                radius: 65,
                telegraph: 'line',
                physics: 'projectile',
                color: '#FB7185',
                foreswing: 0.1,
                backswing: 0.1
            },
            {
                slot: 2,
                name: 'Puppet-on-a-String',
                icon: '🧵',
                desc: 'Links a 3s puppet string to an enemy; if unbroken, immobilizes them for 1.5s and deals bonus Magic Damage.',
                manaCost: 75,
                cooldown: [
                    11,
                    10.6,
                    10.2,
                    9.8,
                    9.4,
                    9
                ],
                baseDmg: [
                    300,
                    340,
                    380,
                    420,
                    460,
                    500
                ],
                physScale: 0,
                magicScale: 0.7,
                damageType: 'magic',
                range: 460,
                radius: 65,
                telegraph: 'line',
                physics: 'tether',
                color: '#F43F5E',
                foreswing: 0.12,
                backswing: 0.12,
                ccType: 'root',
                ccDuration: 1.5
            },
            {
                slot: 3,
                name: 'Heartguard',
                icon: '🛡️',
                desc: 'Grants a massive global shield to a chosen ally and attaches inside them for 12s, casting zero-mana skills from their body.',
                manaCost: 100,
                cooldown: [
                    55,
                    50,
                    45
                ],
                baseDmg: [
                    1200,
                    1600,
                    2000
                ],
                physScale: 0,
                magicScale: 2.2,
                damageType: 'magic',
                range: 4000,
                radius: 160,
                telegraph: 'ally',
                physics: 'attach',
                color: '#FDA4AF',
                foreswing: 0.2,
                backswing: 0.15
            }
        ],
        recommendedBuild: [
            'magic_shoes',
            'glowing_wand',
            'dominance_ice',
            'holy_crystal',
            'winter_crown',
            'immortality'
        ],
        skins: [
            {
                id: 'default',
                name: 'Bunnylove',
                tag: 'Classic',
                color: '#F43F5E',
                accent: '#FBCFE8',
                costDiamonds: 0
            },
            {
                id: 'sanrio',
                name: 'Heartstring',
                tag: 'Collector',
                color: '#FB7185',
                accent: '#FEF08A',
                costDiamonds: 699
            }
        ]
    }
];
var ICONIC_BY_ID = new Map(MLBB_ICONIC_HEROES.map(function(h) {
    return [
        h.id,
        h
    ];
}));
var MLBB_ALL_HEROES = _heroesAll133.MLBB_GENERATED_133_HEROES.map(function(gen) {
    var handTuned = ICONIC_BY_ID.get(gen.id);
    var base = handTuned ? _extends({}, handTuned, {
        starter: true
    }) : gen;
    return _extends({}, base, {
        skins: (0, _heroCatalogMeta.enrichHeroSkins)(base)
    });
});
var ALL_HEROES_BY_ID = new Map(MLBB_ALL_HEROES.map(function(h) {
    return [
        h.id,
        h
    ];
}));
function getMlbbHeroById(id) {
    var _ALL_HEROES_BY_ID_get;
    return (_ALL_HEROES_BY_ID_get = ALL_HEROES_BY_ID.get(id)) != null ? _ALL_HEROES_BY_ID_get : MLBB_ALL_HEROES[0];
}

});
// === MODULE: src/games/legends-arena/mlbb/data/heroesAll133 ===
ArcadeMod.define("src/games/legends-arena/mlbb/data/heroesAll133", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MLBB_GENERATED_133_HEROES", {
    enumerable: true,
    get: function() {
        return MLBB_GENERATED_133_HEROES;
    }
});
var _heroesTank = require("./heroesTank");
var _heroesFighterA = require("./heroesFighterA");
var _heroesFighterB = require("./heroesFighterB");
var _heroesAssassin = require("./heroesAssassin");
var _heroesMage = require("./heroesMage");
var _heroesMarksman = require("./heroesMarksman");
var _heroesSupport = require("./heroesSupport");
var MLBB_GENERATED_133_HEROES = [].concat(_heroesTank.MLBB_HEROES_TANK, _heroesFighterA.MLBB_HEROES_FIGHTER_A, _heroesFighterB.MLBB_HEROES_FIGHTER_B, _heroesAssassin.MLBB_HEROES_ASSASSIN, _heroesMage.MLBB_HEROES_MAGE, _heroesMarksman.MLBB_HEROES_MARKSMAN, _heroesSupport.MLBB_HEROES_SUPPORT).sort(function(a, b) {
    return a.name.localeCompare(b.name);
});

});

})(window.ArcadeMod);
