(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/data/items ===
ArcadeMod.define("src/games/legends-arena/mlbb/data/items", function(require, module, exports) {
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
    get MLBB_ITEMS () {
        return MLBB_ITEMS;
    },
    get aggregateMlbbItemStats () {
        return aggregateMlbbItemStats;
    },
    get applyMlbbItemPurchase () {
        return applyMlbbItemPurchase;
    },
    get computeMlbbEffectiveCost () {
        return computeMlbbEffectiveCost;
    },
    get computeMlbbQuickBuy () {
        return computeMlbbQuickBuy;
    },
    get computeMlbbSellRefund () {
        return computeMlbbSellRefund;
    },
    get getItemCraftingTree () {
        return getItemCraftingTree;
    },
    get getMlbbItemById () {
        return getMlbbItemById;
    },
    get getProBuildTemplatesForHero () {
        return getProBuildTemplatesForHero;
    }
});
var _CombatMath = require("../engine/CombatMath");
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
var MLBB_ITEMS = [
    // ================= A. TIER-1 BASIC COMPONENTS (16 ITEMS) =================
    {
        id: 'dagger',
        name: 'Dagger',
        shortName: 'Dagger',
        icon: '🗡️',
        category: 'attack',
        tier: 1,
        cost: 250,
        recipe: [],
        stats: {
            physAtk: 15
        }
    },
    {
        id: 'knife',
        name: 'Knife',
        shortName: 'Knife',
        icon: '🔪',
        category: 'attack',
        tier: 1,
        cost: 280,
        recipe: [],
        stats: {
            atkSpdPct: 10
        }
    },
    {
        id: 'javelin',
        name: 'Javelin',
        shortName: 'Javelin',
        icon: '🎯',
        category: 'attack',
        tier: 1,
        cost: 320,
        recipe: [],
        stats: {
            critChance: 8
        }
    },
    {
        id: 'vampire_mallet',
        name: 'Vampire Mallet',
        shortName: 'Mallet',
        icon: '🩸',
        category: 'attack',
        tier: 1,
        cost: 400,
        recipe: [
            'dagger'
        ],
        stats: {
            physAtk: 8,
            lifestealPct: 8
        }
    },
    {
        id: 'iron_hunting_bow',
        name: 'Iron Hunting Bow',
        shortName: 'Hunt Bow',
        icon: '🏹',
        category: 'attack',
        tier: 1,
        cost: 450,
        recipe: [
            'dagger'
        ],
        stats: {
            physAtk: 10,
            cdrPct: 5
        }
    },
    {
        id: 'expert_gloves',
        name: 'Expert Gloves',
        shortName: 'Gloves',
        icon: '🧤',
        category: 'attack',
        tier: 1,
        cost: 500,
        recipe: [],
        stats: {
            adaptiveAtk: 30
        }
    },
    {
        id: 'magic_necklace',
        name: 'Magic Necklace',
        shortName: 'Necklace',
        icon: '📿',
        category: 'magic',
        tier: 1,
        cost: 120,
        recipe: [],
        stats: {
            manaRegen: 2
        }
    },
    {
        id: 'power_crystal',
        name: 'Power Crystal',
        shortName: 'P.Crystal',
        icon: '💎',
        category: 'magic',
        tier: 1,
        cost: 220,
        recipe: [],
        stats: {
            maxMana: 280
        }
    },
    {
        id: 'mystery_codex',
        name: 'Mystery Codex',
        shortName: 'Codex',
        icon: '📘',
        category: 'magic',
        tier: 1,
        cost: 300,
        recipe: [],
        stats: {
            magicPow: 15
        }
    },
    {
        id: 'book_of_sages',
        name: 'Book of Sages',
        shortName: 'Sages',
        icon: '📖',
        category: 'magic',
        tier: 1,
        cost: 450,
        recipe: [
            'magic_necklace'
        ],
        stats: {
            magicPow: 8,
            cdrPct: 5
        }
    },
    {
        id: 'healing_necklace',
        name: 'Healing Necklace',
        shortName: 'Heal Neck',
        icon: '💚',
        category: 'defense',
        tier: 1,
        cost: 140,
        recipe: [],
        stats: {
            hpRegen: 4
        }
    },
    {
        id: 'leather_jerkin',
        name: 'Leather Jerkin',
        shortName: 'Jerkin',
        icon: '🦺',
        category: 'defense',
        tier: 1,
        cost: 220,
        recipe: [],
        stats: {
            physDef: 14
        }
    },
    {
        id: 'magic_resist_cloak',
        name: 'Magic Resist Cloak',
        shortName: 'Cloak',
        icon: '🧥',
        category: 'defense',
        tier: 1,
        cost: 220,
        recipe: [],
        stats: {
            magicDef: 14
        }
    },
    {
        id: 'vitality_crystal',
        name: 'Vitality Crystal',
        shortName: 'Vitality',
        icon: '❤️',
        category: 'defense',
        tier: 1,
        cost: 300,
        recipe: [],
        stats: {
            maxHp: 230
        }
    },
    {
        id: 'heros_ring',
        name: "Hero's Ring",
        shortName: 'Hero Ring',
        icon: '💍',
        category: 'defense',
        tier: 1,
        cost: 450,
        recipe: [
            'vitality_crystal'
        ],
        stats: {
            maxHp: 150,
            cdrPct: 5
        }
    },
    {
        id: 'boots',
        name: 'Boots',
        shortName: 'Boots',
        icon: '👢',
        category: 'movement',
        tier: 1,
        cost: 250,
        recipe: [],
        stats: {
            moveSpd: 20
        }
    },
    // ================= B. TIER-2 INTERMEDIATE COMPONENTS (19 ITEMS) =================
    {
        id: 'regular_spear',
        name: 'Regular Spear',
        shortName: 'Reg Spear',
        icon: '🔱',
        category: 'attack',
        tier: 2,
        cost: 600,
        recipe: [
            'dagger',
            'knife'
        ],
        stats: {
            physAtk: 20,
            atkSpdPct: 10
        }
    },
    {
        id: 'ogre_tomahawk',
        name: 'Ogre Tomahawk',
        shortName: 'Tomahawk',
        icon: '🪓',
        category: 'attack',
        tier: 2,
        cost: 650,
        recipe: [
            'dagger',
            'vitality_crystal'
        ],
        stats: {
            physAtk: 25,
            maxHp: 230
        },
        uniquePassives: [
            'Crisis'
        ],
        passiveName: 'Crisis',
        passiveDesc: 'Dealing damage grants +10% Movement Speed for 2s (4s CD).'
    },
    {
        id: 'fury_hammer',
        name: 'Fury Hammer',
        shortName: 'Fury Ham',
        icon: '🔨',
        category: 'attack',
        tier: 2,
        cost: 830,
        recipe: [
            'dagger',
            'dagger'
        ],
        stats: {
            physAtk: 35,
            flatPhysPen: 12
        }
    },
    {
        id: 'rogue_meteor',
        name: 'Rogue Meteor',
        shortName: 'Rogue Met',
        icon: '☄️',
        category: 'attack',
        tier: 2,
        cost: 900,
        recipe: [
            'dagger',
            'knife',
            'javelin'
        ],
        stats: {
            physAtk: 15,
            atkSpdPct: 10,
            critChance: 10
        }
    },
    {
        id: 'legion_sword',
        name: 'Legion Sword',
        shortName: 'Legion',
        icon: '⚔️',
        category: 'attack',
        tier: 2,
        cost: 910,
        recipe: [
            'dagger',
            'dagger'
        ],
        stats: {
            physAtk: 60
        }
    },
    {
        id: 'swift_crossbow',
        name: 'Swift Crossbow',
        shortName: 'Crossbow',
        icon: '🏹',
        category: 'attack',
        tier: 2,
        cost: 1000,
        recipe: [
            'knife',
            'knife'
        ],
        stats: {
            atkSpdPct: 20
        },
        uniquePassives: [
            'Crossbow',
            'Impulse'
        ],
        passiveName: 'Crossbow / Impulse',
        passiveDesc: 'Basic Attacks deal +40 bonus damage and stack +3% ATK Speed up to 5x.'
    },
    {
        id: 'magic_blade',
        name: 'Magic Blade',
        shortName: 'Magic Bld',
        icon: '💠',
        category: 'attack',
        tier: 2,
        cost: 1150,
        recipe: [
            'dagger',
            'magic_resist_cloak'
        ],
        stats: {
            physAtk: 40,
            magicDef: 18
        },
        uniquePassives: [
            'Lifeline'
        ],
        passiveName: 'Lifeline',
        passiveDesc: 'Dropping below 30% HP grants 400 (+30*Lv) Shield and +50% decaying MS (60s CD).'
    },
    {
        id: 'mystic_container',
        name: 'Mystic Container',
        shortName: 'Mystic',
        icon: '🏺',
        category: 'magic',
        tier: 2,
        cost: 500,
        recipe: [
            'mystery_codex'
        ],
        stats: {
            magicPow: 15,
            spellVampPct: 8
        }
    },
    {
        id: 'azure_blade',
        name: 'Azure Blade',
        shortName: 'Azure Bld',
        icon: '🔷',
        category: 'magic',
        tier: 2,
        cost: 600,
        recipe: [
            'magic_necklace'
        ],
        stats: {
            maxMana: 50,
            cdrPct: 5
        },
        uniquePassives: [
            'Judgment'
        ],
        passiveName: 'Judgment',
        passiveDesc: 'Next Basic Attack after skill deals +50 (+60% Magic Power) True Damage.'
    },
    {
        id: 'exotic_veil',
        name: 'Exotic Veil',
        shortName: 'Veil',
        icon: '🧣',
        category: 'magic',
        tier: 2,
        cost: 600,
        recipe: [
            'mystery_codex'
        ],
        stats: {
            magicPow: 30,
            moveSpdPct: 5
        }
    },
    {
        id: 'elegant_gem',
        name: 'Elegant Gem',
        shortName: 'Eleg. Gem',
        icon: '💠',
        category: 'magic',
        tier: 2,
        cost: 700,
        recipe: [
            'power_crystal',
            'vitality_crystal'
        ],
        stats: {
            maxHp: 300,
            maxMana: 380
        },
        uniquePassives: [
            'Gift'
        ],
        passiveName: 'Gift',
        passiveDesc: 'Leveling up restores 20% Max HP and 20% Max Mana over 2s.'
    },
    {
        id: 'magic_wand',
        name: 'Magic Wand',
        shortName: 'Wand',
        icon: '🪄',
        category: 'magic',
        tier: 2,
        cost: 820,
        recipe: [
            'mystery_codex'
        ],
        stats: {
            magicPow: 45
        }
    },
    {
        id: 'tome_of_evil',
        name: 'Tome of Evil',
        shortName: 'Evil Tome',
        icon: '📕',
        category: 'magic',
        tier: 2,
        cost: 950,
        recipe: [
            'mystery_codex',
            'book_of_sages'
        ],
        stats: {
            magicPow: 35,
            cdrPct: 8,
            manaRegen: 20
        }
    },
    {
        id: 'black_ice_shield',
        name: 'Black Ice Shield',
        shortName: 'Ice Shld',
        icon: '🧊',
        category: 'defense',
        tier: 2,
        cost: 620,
        recipe: [
            'leather_jerkin',
            'magic_resist_cloak'
        ],
        stats: {
            physDef: 20,
            magicDef: 20
        },
        uniquePassives: [
            'Arctic Cold'
        ],
        passiveName: 'Arctic Cold',
        passiveDesc: 'Reduces nearby enemies Attack Speed by 10%.'
    },
    {
        id: 'steel_legplates',
        name: 'Steel Legplates',
        shortName: 'Legplates',
        icon: '🦿',
        category: 'defense',
        tier: 2,
        cost: 630,
        recipe: [
            'leather_jerkin',
            'leather_jerkin'
        ],
        stats: {
            physDef: 35
        }
    },
    {
        id: 'ares_belt',
        name: 'Ares Belt',
        shortName: 'Ares Belt',
        icon: '🥋',
        category: 'defense',
        tier: 2,
        cost: 700,
        recipe: [
            'vitality_crystal',
            'vitality_crystal'
        ],
        stats: {
            maxHp: 600
        }
    },
    {
        id: 'dreadnaught_armor',
        name: 'Dreadnaught Armor',
        shortName: 'Dreadnaught',
        icon: '🛡️',
        category: 'defense',
        tier: 2,
        cost: 730,
        recipe: [
            'leather_jerkin',
            'vitality_crystal'
        ],
        stats: {
            physDef: 30
        },
        uniquePassives: [
            'Deter'
        ],
        passiveName: 'Deter',
        passiveDesc: 'Enemy skill hits reduce attacker Phys ATK by 4% up to 3 stacks.'
    },
    {
        id: 'molten_essence',
        name: 'Molten Essence',
        shortName: 'Molten',
        icon: '🔥',
        category: 'defense',
        tier: 2,
        cost: 800,
        recipe: [
            'vitality_crystal',
            'vitality_crystal'
        ],
        stats: {
            maxHp: 540
        },
        uniquePassives: [
            'Burning Soul'
        ],
        passiveName: 'Burning Soul',
        passiveDesc: 'Deals 0.6% Max HP Magic DPS to nearby enemies (+100% vs minions/creeps).'
    },
    {
        id: 'silence_robe',
        name: 'Silence Robe',
        shortName: 'Sil. Robe',
        icon: '🧥',
        category: 'defense',
        tier: 2,
        cost: 1020,
        recipe: [
            'magic_resist_cloak',
            'vitality_crystal'
        ],
        stats: {
            magicDef: 30,
            maxHp: 540
        }
    },
    // ================= C. ALL 19 TIER-3 ATTACK ITEMS =================
    {
        id: 'blade_of_despair',
        name: 'Blade of Despair',
        shortName: 'BoD',
        icon: '⚔️',
        category: 'attack',
        tier: 3,
        cost: 3010,
        recipe: [
            'legion_sword',
            'legion_sword',
            'dagger'
        ],
        stats: {
            physAtk: 160,
            moveSpdPct: 5
        },
        uniquePassives: [
            'Despair'
        ],
        passiveName: 'Despair',
        passiveDesc: 'Attacking enemies below 50% HP grants +25% Physical Attack for 2s.'
    },
    {
        id: 'malefic_roar',
        name: 'Malefic Roar',
        shortName: 'Malefic',
        icon: '🔫',
        category: 'attack',
        tier: 3,
        cost: 2060,
        recipe: [
            'legion_sword',
            'dagger'
        ],
        stats: {
            physAtk: 60,
            pctPhysPen: 0.3
        },
        uniquePassives: [
            'Armor Buster',
            'Breaker'
        ],
        passiveName: 'Armor Buster / Breaker',
        passiveDesc: '+30% Phys PEN plus +0.1% per enemy Phys DEF (up to 60% total PEN).'
    },
    {
        id: 'malefic_gun',
        name: 'Malefic Gun',
        shortName: 'M.Gun',
        icon: '🔫',
        category: 'attack',
        tier: 3,
        cost: 2120,
        recipe: [
            'regular_spear',
            'dagger'
        ],
        stats: {
            physAtk: 40,
            atkSpdPct: 20,
            pctPhysPen: 0.3
        },
        uniquePassives: [
            'Armor Buster',
            'Malefic Energy'
        ],
        passiveName: 'Armor Buster / Malefic Energy',
        passiveDesc: '+30% Phys PEN (non-stacking with Malefic Roar), +12% Basic Attack range & +10% MS on hit.'
    },
    {
        id: 'berserkers_fury',
        name: "Berserker's Fury",
        shortName: 'B.Fury',
        icon: '🪓',
        category: 'attack',
        tier: 3,
        cost: 2390,
        recipe: [
            'rogue_meteor',
            'legion_sword'
        ],
        stats: {
            physAtk: 65,
            critChance: 25,
            critDmgPct: 40
        },
        uniquePassives: [
            'Doom'
        ],
        passiveName: 'Doom',
        passiveDesc: '+40% Crit Damage. Critical hits increase Physical Attack by +5% for 2s.'
    },
    {
        id: 'windtalker',
        name: 'Windtalker',
        shortName: 'Windtalker',
        icon: '🌪️',
        category: 'attack',
        tier: 3,
        cost: 1880,
        recipe: [
            'rogue_meteor',
            'knife'
        ],
        stats: {
            atkSpdPct: 35,
            critChance: 20,
            moveSpd: 20
        },
        uniquePassives: [
            'Typhoon',
            'Activate'
        ],
        passiveName: 'Typhoon',
        passiveDesc: 'Every 5s–2s, Basic Attack triggers chain lightning hitting up to 3 foes for 150–362 Magic Damage.'
    },
    {
        id: 'haas_claws',
        name: "Haas's Claws",
        shortName: 'Haas',
        icon: '🩸',
        category: 'attack',
        tier: 3,
        cost: 2020,
        recipe: [
            'rogue_meteor',
            'vampire_mallet'
        ],
        stats: {
            physAtk: 40,
            atkSpdPct: 15,
            critChance: 20,
            lifestealPct: 25
        },
        uniquePassives: [
            'Frenzy'
        ],
        passiveName: 'Frenzy',
        passiveDesc: '+25% Lifesteal. Critical hits grant +20% Attack Speed for 2s.'
    },
    {
        id: 'demon_hunter_sword',
        name: 'Demon Hunter Sword',
        shortName: 'DHS',
        icon: '🗡️',
        category: 'attack',
        tier: 3,
        cost: 2180,
        recipe: [
            'regular_spear',
            'vampire_mallet'
        ],
        stats: {
            physAtk: 35,
            atkSpdPct: 20,
            lifestealPct: 8
        },
        uniquePassives: [
            'Devour'
        ],
        passiveName: 'Devour',
        passiveDesc: 'Basic Attacks deal 8% target Current HP bonus Phys Damage & stack +3% Lifesteal (5x).'
    },
    {
        id: 'corrosion_scythe',
        name: 'Corrosion Scythe',
        shortName: 'Corrosion',
        icon: '🧪',
        category: 'attack',
        tier: 3,
        cost: 2050,
        recipe: [
            'swift_crossbow',
            'regular_spear'
        ],
        stats: {
            physAtk: 30,
            atkSpdPct: 30,
            moveSpdPct: 5
        },
        uniquePassives: [
            'Corrosive',
            'Impulse'
        ],
        passiveName: 'Corrosive / Impulse',
        passiveDesc: 'Basic Attacks deal +80 bonus Phys Dmg, slow up to 40%, and stack +6% ATK Speed (5x).'
    },
    {
        id: 'golden_staff',
        name: 'Golden Staff',
        shortName: 'G.Staff',
        icon: '🥢',
        category: 'attack',
        tier: 3,
        cost: 2000,
        recipe: [
            'swift_crossbow',
            'regular_spear'
        ],
        stats: {
            physAtk: 55,
            atkSpdPct: 15
        },
        uniquePassives: [
            'Swift',
            'Endless Strike'
        ],
        passiveName: 'Swift / Endless Strike',
        passiveDesc: 'Converts Crit Chance into ATK Speed; every 3rd Basic Attack triggers on-hit effects 3x.'
    },
    {
        id: 'endless_battle',
        name: 'Endless Battle',
        shortName: 'Endless',
        icon: '⚡',
        category: 'attack',
        tier: 3,
        cost: 2470,
        recipe: [
            'azure_blade',
            'ogre_tomahawk',
            'vampire_mallet'
        ],
        stats: {
            physAtk: 60,
            maxHp: 250,
            cdrPct: 10,
            lifestealPct: 8,
            spellVampPct: 8,
            moveSpdPct: 5,
            manaRegen: 5
        },
        uniquePassives: [
            'Divine Justice',
            'Chase Fate'
        ],
        passiveName: 'Divine Justice',
        passiveDesc: 'After casting a skill, next Basic Attack deals +60% Total Phys ATK True Damage (stacks with Crisis!).'
    },
    {
        id: 'war_axe',
        name: 'War Axe',
        shortName: 'War Axe',
        icon: '🪓',
        category: 'attack',
        tier: 3,
        cost: 2100,
        recipe: [
            'ogre_tomahawk',
            'iron_hunting_bow'
        ],
        stats: {
            physAtk: 35,
            maxHp: 400,
            cdrPct: 10,
            spellVampPct: 12
        },
        uniquePassives: [
            'Fighting Spirit'
        ],
        passiveName: 'Fighting Spirit',
        passiveDesc: 'Dealing damage stacks +12 Phys ATK (6x = +72); at max stacks deals +10% extra True Damage.'
    },
    {
        id: 'hunter_strike',
        name: 'Hunter Strike',
        shortName: 'Hunter',
        icon: '🦅',
        category: 'attack',
        tier: 3,
        cost: 2010,
        recipe: [
            'fury_hammer',
            'iron_hunting_bow'
        ],
        stats: {
            physAtk: 80,
            cdrPct: 10,
            flatPhysPen: 15
        },
        uniquePassives: [
            'Retribution'
        ],
        passiveName: 'Retribution',
        passiveDesc: 'Dealing damage 5 times grants +50% decaying Movement Speed for 3s (8s CD).'
    },
    {
        id: 'blade_of_heptaseas',
        name: 'Blade of the Heptaseas',
        shortName: 'Heptaseas',
        icon: '🔱',
        category: 'attack',
        tier: 3,
        cost: 1950,
        recipe: [
            'fury_hammer',
            'vitality_crystal'
        ],
        stats: {
            physAtk: 70,
            maxHp: 250,
            flatPhysPen: 15
        },
        uniquePassives: [
            'Ambush'
        ],
        passiveName: 'Ambush',
        passiveDesc: 'Out of combat 5s: next Basic Attack deals 160 (+40% Total Phys ATK) bonus damage & 40% slow.'
    },
    {
        id: 'sea_halberd',
        name: 'Sea Halberd',
        shortName: 'Halberd',
        icon: '🔱',
        category: 'attack',
        tier: 3,
        cost: 2050,
        recipe: [
            'legion_sword',
            'regular_spear'
        ],
        stats: {
            physAtk: 80,
            atkSpdPct: 20
        },
        antiHeal: true,
        uniquePassives: [
            'Lifebane',
            'Punish'
        ],
        passiveName: 'Lifebane / Punish',
        passiveDesc: 'Cuts target Shield & HP Regen by 50% (Lifebane non-stacking) & deals +8% damage to higher-HP heroes.'
    },
    {
        id: 'wind_of_nature',
        name: 'Wind of Nature',
        shortName: 'WoN',
        icon: '🍃',
        category: 'attack',
        tier: 3,
        cost: 1910,
        recipe: [
            'regular_spear',
            'vampire_mallet',
            'dagger'
        ],
        stats: {
            physAtk: 30,
            atkSpdPct: 20,
            lifestealPct: 10
        },
        activeName: 'Wind Chant',
        activeCd: 70,
        activeKind: 'wind_chant',
        uniquePassives: [
            'Wind Chant'
        ],
        passiveName: 'Wind Chant (Active)',
        passiveDesc: '100% Immune to all Physical Damage for 2s (1s for non-Marksmen).'
    },
    {
        id: 'rose_gold_meteor',
        name: 'Rose Gold Meteor',
        shortName: 'Rose Gold',
        icon: '🌹',
        category: 'attack',
        tier: 3,
        cost: 1820,
        recipe: [
            'magic_blade',
            'vampire_mallet'
        ],
        stats: {
            physAtk: 40,
            atkSpdPct: 20,
            lifestealPct: 10
        },
        uniquePassives: [
            'Dragon Scale',
            'Lifeline'
        ],
        passiveName: 'Lifeline / Dragon Scale',
        passiveDesc: 'Dropping below 30% HP grants 840 (+35*Lv) Shield + 50% decaying MS (60s CD).'
    },
    {
        id: 'great_dragon_spear',
        name: 'Great Dragon Spear',
        shortName: 'Dragon Sp',
        icon: '🐉',
        category: 'attack',
        tier: 3,
        cost: 2140,
        recipe: [
            'legion_sword',
            'iron_hunting_bow',
            'javelin'
        ],
        stats: {
            physAtk: 70,
            cdrPct: 10,
            critChance: 20
        },
        uniquePassives: [
            'Supreme Warrior'
        ],
        passiveName: 'Supreme Warrior',
        passiveDesc: 'Casting Ultimate grants +30% Movement Speed for 7.5s (15s CD).'
    },
    {
        id: 'sky_piercer',
        name: 'Sky Piercer',
        shortName: 'Sky Piercer',
        icon: '🌠',
        category: 'attack',
        tier: 3,
        cost: 1500,
        recipe: [
            'expert_gloves',
            'expert_gloves'
        ],
        stats: {
            adaptiveAtk: 60,
            moveSpd: 15
        },
        execute: true,
        uniquePassives: [
            'Lethality'
        ],
        passiveName: 'Lethality',
        passiveDesc: 'Instantly executes enemies below 4%–12% HP; +10 stacks per kill (max 80 stacks).'
    },
    {
        id: 'fleeting_time',
        name: 'Fleeting Time',
        shortName: 'Fleeting',
        icon: '⏳',
        category: 'attack',
        tier: 3,
        cost: 2050,
        recipe: [
            'expert_gloves',
            'heros_ring',
            'vitality_crystal'
        ],
        stats: {
            adaptiveAtk: 30,
            maxHp: 600,
            cdrPct: 15
        },
        uniquePassives: [
            'Timestream'
        ],
        passiveName: 'Timestream',
        passiveDesc: 'Hero kills or assists reduce current Ultimate cooldown by 30%.'
    },
    // ================= D. ALL 15 TIER-3 MAGIC ITEMS =================
    {
        id: 'holy_crystal',
        name: 'Holy Crystal',
        shortName: 'Holy Crys',
        icon: '💎',
        category: 'magic',
        tier: 3,
        cost: 3000,
        recipe: [
            'magic_wand',
            'magic_wand',
            'mystery_codex'
        ],
        stats: {
            magicPow: 185
        },
        uniquePassives: [
            'Mystery'
        ],
        passiveName: 'Mystery',
        passiveDesc: 'Increases total Magic Power by +21% to +35% scaling with level.'
    },
    {
        id: 'divine_glaive',
        name: 'Divine Glaive',
        shortName: 'Glaive',
        icon: '🔮',
        category: 'magic',
        tier: 3,
        cost: 1970,
        recipe: [
            'magic_wand',
            'mystery_codex'
        ],
        stats: {
            magicPow: 60,
            pctMagicPen: 0.4
        },
        uniquePassives: [
            'Spellbreaker'
        ],
        passiveName: 'Spellbreaker',
        passiveDesc: '+40% Magic PEN plus +0.1% per point of enemy Magic DEF (up to 60%).'
    },
    {
        id: 'genius_wand',
        name: 'Genius Wand',
        shortName: 'Genius',
        icon: '🪄',
        category: 'magic',
        tier: 3,
        cost: 2000,
        recipe: [
            'magic_wand',
            'exotic_veil'
        ],
        stats: {
            magicPow: 75,
            moveSpdPct: 5,
            flatMagicPen: 10
        },
        uniquePassives: [
            'Magic'
        ],
        passiveName: 'Magic',
        passiveDesc: 'Magic Damage shreds target Magic DEF by -3 to -7 per stack (max 3 stacks).'
    },
    {
        id: 'glowing_wand',
        name: 'Glowing Wand',
        shortName: 'Glowing',
        icon: '🔥',
        category: 'magic',
        tier: 3,
        cost: 2150,
        recipe: [
            'magic_wand',
            'exotic_veil',
            'vitality_crystal'
        ],
        stats: {
            magicPow: 75,
            maxHp: 400,
            moveSpdPct: 5
        },
        antiHeal: true,
        uniquePassives: [
            'Scorch',
            'Lifebane'
        ],
        passiveName: 'Scorch / Lifebane',
        passiveDesc: 'Burns enemies for 1.5% Max HP/s (3s) & cuts Shield/HP Regen by 50% (Lifebane).'
    },
    {
        id: 'wishing_lantern',
        name: 'Wishing Lantern',
        shortName: 'Lantern',
        icon: '🏮',
        category: 'magic',
        tier: 3,
        cost: 2250,
        recipe: [
            'magic_wand',
            'book_of_sages',
            'power_crystal'
        ],
        stats: {
            magicPow: 75,
            maxMana: 400,
            cdrPct: 10
        },
        uniquePassives: [
            'Butterfly Goddess'
        ],
        passiveName: 'Butterfly Goddess',
        passiveDesc: 'Every 800 Magic Damage summons a Butterfly dealing 8% target Current HP Magic Damage.'
    },
    {
        id: 'lightning_truncheon',
        name: 'Lightning Truncheon',
        shortName: 'LT',
        icon: '⚡',
        category: 'magic',
        tier: 3,
        cost: 2250,
        recipe: [
            'magic_wand',
            'power_crystal',
            'mystery_codex'
        ],
        stats: {
            magicPow: 75,
            maxMana: 400,
            cdrPct: 10
        },
        uniquePassives: [
            'Resonate'
        ],
        passiveName: 'Resonate',
        passiveDesc: 'Every 6s, skill echoes lightning to 3 foes for 120% Magic Power & +30% MS.'
    },
    {
        id: 'clock_of_destiny',
        name: 'Clock of Destiny',
        shortName: 'CoD',
        icon: '🕰️',
        category: 'magic',
        tier: 3,
        cost: 1950,
        recipe: [
            'elegant_gem',
            'book_of_sages'
        ],
        stats: {
            magicPow: 45,
            maxHp: 400,
            maxMana: 800,
            cdrPct: 10
        },
        uniquePassives: [
            'Destiny',
            'Gift'
        ],
        passiveName: 'Destiny / Gift',
        passiveDesc: 'Magic Damage stacks Hybrid DEF (6x); dropping <50% HP/Mana restores 15% over 3s.'
    },
    {
        id: 'enchanted_talisman',
        name: 'Enchanted Talisman',
        shortName: 'Book',
        icon: '📖',
        category: 'magic',
        tier: 3,
        cost: 1870,
        recipe: [
            'tome_of_evil',
            'book_of_sages',
            'vitality_crystal'
        ],
        stats: {
            magicPow: 50,
            maxHp: 250,
            cdrPct: 20
        },
        uniquePassives: [
            'Mana Spring',
            'Magic Mastery'
        ],
        passiveName: 'Mana Spring / Magic Mastery',
        passiveDesc: 'Regenerates 15% Max Mana every 10s & raises maximum CDR cap to 45%.'
    },
    {
        id: 'ice_queen_wand',
        name: 'Ice Queen Wand',
        shortName: 'IQW',
        icon: '❄️',
        category: 'magic',
        tier: 3,
        cost: 2040,
        recipe: [
            'mystic_container',
            'exotic_veil',
            'vitality_crystal'
        ],
        stats: {
            magicPow: 75,
            spellVampPct: 10,
            maxHp: 300,
            moveSpdPct: 7
        },
        uniquePassives: [
            'Ice Bound'
        ],
        passiveName: 'Ice Bound',
        passiveDesc: 'Damaging skills slow enemy heroes by 10% (stacks 3x = 30% slow).'
    },
    {
        id: 'concentrated_energy',
        name: 'Concentrated Energy',
        shortName: 'Conc.En',
        icon: '🟣',
        category: 'magic',
        tier: 3,
        cost: 2020,
        recipe: [
            'mystic_container',
            'elegant_gem'
        ],
        stats: {
            magicPow: 70,
            maxHp: 400,
            lifestealPct: 20,
            spellVampPct: 20
        },
        uniquePassives: [
            'Recharge'
        ],
        passiveName: 'Recharge',
        passiveDesc: '+20% Hybrid Lifesteal. Stacks +5 Magic Power (6x) & +12% Magic Damage at max stacks.'
    },
    {
        id: 'feather_of_heaven',
        name: 'Feather of Heaven',
        shortName: 'Feather',
        icon: '🪶',
        category: 'magic',
        tier: 3,
        cost: 2030,
        recipe: [
            'swift_crossbow',
            'book_of_sages'
        ],
        stats: {
            magicPow: 55,
            atkSpdPct: 20,
            lifestealPct: 10,
            cdrPct: 5
        },
        uniquePassives: [
            'Affliction',
            'Impulse'
        ],
        passiveName: 'Affliction / Impulse',
        passiveDesc: 'Basic Attacks deal 50 (+30% Magic) bonus Magic Damage & stack +6% ATK Speed (5x).'
    },
    {
        id: 'starlium_scythe',
        name: 'Starlium Scythe',
        shortName: 'Starlium',
        icon: '🌙',
        category: 'magic',
        tier: 3,
        cost: 2220,
        recipe: [
            'azure_blade',
            'mystic_container',
            'book_of_sages'
        ],
        stats: {
            magicPow: 70,
            cdrPct: 10,
            lifestealPct: 8,
            spellVampPct: 8,
            manaRegen: 6
        },
        uniquePassives: [
            'Crisis'
        ],
        passiveName: 'Crisis',
        passiveDesc: 'Next Basic Attack after skill deals 100 (+100% Magic) True Damage & +10% MS (stacks with Divine Justice!).'
    },
    {
        id: 'blood_wings',
        name: 'Blood Wings',
        shortName: 'B.Wings',
        icon: '🦇',
        category: 'magic',
        tier: 3,
        cost: 2100,
        recipe: [
            'magic_wand',
            'magic_wand'
        ],
        stats: {
            magicPow: 90
        },
        uniquePassives: [
            'Guard'
        ],
        passiveName: 'Guard',
        passiveDesc: 'Grants 800 (+100% Magic Power) regenerating Shield & +30 MS while active.'
    },
    {
        id: 'winter_crown',
        name: 'Winter Crown',
        shortName: 'W.Crown',
        icon: '👑',
        category: 'magic',
        tier: 3,
        cost: 1910,
        recipe: [
            'expert_gloves',
            'heros_ring',
            'vitality_crystal'
        ],
        stats: {
            adaptiveAtk: 45,
            maxHp: 400,
            cdrPct: 5
        },
        activeName: 'Frozen',
        activeCd: 100,
        activeKind: 'winter_crown',
        uniquePassives: [
            'Frozen'
        ],
        passiveName: 'Frozen (Active)',
        passiveDesc: 'Freezes user 2s: Untargetable & Immune to all damage/CC without breaking channels.'
    },
    {
        id: 'flask_of_the_oasis',
        name: 'Flask of the Oasis',
        shortName: 'Oasis',
        icon: '🧪',
        category: 'magic',
        tier: 3,
        cost: 1850,
        recipe: [
            'book_of_sages',
            'mystic_container',
            'vitality_crystal'
        ],
        stats: {
            magicPow: 60,
            maxHp: 300,
            cdrPct: 10,
            healEffectPct: 12
        },
        uniquePassives: [
            'Blessing'
        ],
        passiveName: 'Blessing',
        passiveDesc: 'Healing/shielding an ally below 35% HP grants a 680–1800 Shield & cuts caster CDs by 2s.'
    },
    // ================= E. ALL 14 TIER-3 DEFENSE ITEMS =================
    {
        id: 'dominance_ice',
        name: 'Dominance Ice',
        shortName: 'Dom Ice',
        icon: '🧊',
        category: 'defense',
        tier: 3,
        cost: 2010,
        recipe: [
            'black_ice_shield',
            'steel_legplates'
        ],
        stats: {
            maxHp: 250,
            physDef: 40,
            magicDef: 40,
            moveSpdPct: 5
        },
        antiHeal: true,
        uniquePassives: [
            'Defender',
            'Arctic Cold',
            'Lifebane'
        ],
        passiveName: 'Arctic Cold / Lifebane',
        passiveDesc: 'Cuts nearby enemy ATK Speed to 80% & Shield/HP Regen by 50% (Lifebane).'
    },
    {
        id: 'chastise_pauldron',
        name: 'Chastise Pauldron',
        shortName: 'Chastise',
        icon: '🛡️',
        category: 'defense',
        tier: 3,
        cost: 2100,
        recipe: [
            'steel_legplates',
            'ares_belt'
        ],
        stats: {
            maxHp: 900,
            physDef: 40
        },
        uniquePassives: [
            'Chastise',
            'Redemption'
        ],
        passiveName: 'Chastise / Redemption',
        passiveDesc: 'Cuts attacker ATK Speed & Cap to 75%–80%; dropping <30% HP restores 20% Max HP (60s CD).'
    },
    {
        id: 'antique_cuirass',
        name: 'Antique Cuirass',
        shortName: 'Cuirass',
        icon: '🛡️',
        category: 'defense',
        tier: 3,
        cost: 2170,
        recipe: [
            'dreadnaught_armor',
            'ares_belt',
            'healing_necklace'
        ],
        stats: {
            maxHp: 920,
            physDef: 40,
            hpRegen: 4
        },
        uniquePassives: [
            'Deter'
        ],
        passiveName: 'Deter',
        passiveDesc: 'Enemy skill hits reduce attacker Phys ATK by -6% (max 3 stacks = -18%).'
    },
    {
        id: 'athenas_shield',
        name: "Athena's Shield",
        shortName: 'Athena',
        icon: '🔰',
        category: 'defense',
        tier: 3,
        cost: 2150,
        recipe: [
            'silence_robe',
            'magic_resist_cloak',
            'healing_necklace'
        ],
        stats: {
            maxHp: 900,
            magicDef: 48,
            hpRegen: 2
        },
        uniquePassives: [
            'Shield'
        ],
        passiveName: 'Shield',
        passiveDesc: 'Upon taking Magic Damage, reduces all Magic Damage taken by 25% for 3s.'
    },
    {
        id: 'radiant_armor',
        name: 'Radiant Armor',
        shortName: 'Radiant',
        icon: '✨',
        category: 'defense',
        tier: 3,
        cost: 1880,
        recipe: [
            'silence_robe',
            'healing_necklace'
        ],
        stats: {
            maxHp: 950,
            magicDef: 40,
            hpRegen: 12
        },
        uniquePassives: [
            'Holy Blessing'
        ],
        passiveName: 'Holy Blessing',
        passiveDesc: 'Taking Magic Damage stacks +5 to +8 Magic DEF (max 6 stacks = +48 Magic DEF).'
    },
    {
        id: 'blade_armor',
        name: 'Blade Armor',
        shortName: 'Blade Arm',
        icon: '⚙️',
        category: 'defense',
        tier: 3,
        cost: 1910,
        recipe: [
            'steel_legplates',
            'steel_legplates'
        ],
        stats: {
            physDef: 80
        },
        reflect: true,
        uniquePassives: [
            'Bladed Armor'
        ],
        passiveName: 'Bladed Armor',
        passiveDesc: '+20% Crit Damage Reduction. Reflects 30% Basic Attack damage + 20% Phys DEF & slows 15%.'
    },
    {
        id: 'immortality',
        name: 'Immortality',
        shortName: 'Immort',
        icon: '🕊️',
        category: 'defense',
        tier: 3,
        cost: 2120,
        recipe: [
            'ares_belt',
            'leather_jerkin'
        ],
        stats: {
            maxHp: 800,
            physDef: 15
        },
        revive: true,
        uniquePassives: [
            'Immortal'
        ],
        passiveName: 'Immortal',
        passiveDesc: 'Resurrects 2.5s after death with 16% Max HP & 220 (+120*Lv) Shield (210s CD).'
    },
    {
        id: 'thunder_belt',
        name: 'Thunder Belt',
        shortName: 'T.Belt',
        icon: '⛈️',
        category: 'defense',
        tier: 3,
        cost: 1820,
        recipe: [
            'ares_belt',
            'black_ice_shield'
        ],
        stats: {
            maxHp: 800,
            physDef: 15,
            magicDef: 15,
            moveSpd: 20
        },
        uniquePassives: [
            'Thunderbolt'
        ],
        passiveName: 'Thunderbolt',
        passiveDesc: 'Every 4s, Basic Attack deals AoE True Damage scaling with Hybrid DEF & permanently gains +1 Hybrid DEF.'
    },
    {
        id: 'brute_force_breastplate',
        name: 'Brute Force Breastplate',
        shortName: 'Brute F.',
        icon: '🦾',
        category: 'defense',
        tier: 3,
        cost: 1870,
        recipe: [
            'heros_ring',
            'leather_jerkin',
            'vitality_crystal'
        ],
        stats: {
            maxHp: 600,
            physDef: 20,
            cdrPct: 10
        },
        uniquePassives: [
            'Brute Force'
        ],
        passiveName: 'Brute Force',
        passiveDesc: 'Stacks +6 Adaptive ATK & +2% MS (6x); at max stacks grants +15% CC Resilience.'
    },
    {
        id: 'queens_wings',
        name: "Queen's Wings",
        shortName: 'Q.Wings',
        icon: '🦋',
        category: 'defense',
        tier: 3,
        cost: 2250,
        recipe: [
            'expert_gloves',
            'ares_belt',
            'heros_ring'
        ],
        stats: {
            adaptiveAtk: 30,
            maxHp: 750,
            cdrPct: 10,
            spellVampPct: 10
        },
        uniquePassives: [
            'Demonize',
            'Defiance'
        ],
        passiveName: 'Demonize / Defiance',
        passiveDesc: 'Below 40% HP grants 30% DR (3s) & -2s CDs; missing HP boosts damage up to +15%.'
    },
    {
        id: 'oracle',
        name: 'Oracle',
        shortName: 'Oracle',
        icon: '🌿',
        category: 'defense',
        tier: 3,
        cost: 1860,
        recipe: [
            'silence_robe',
            'heros_ring'
        ],
        stats: {
            maxHp: 850,
            physDef: 20,
            magicDef: 20,
            cdrPct: 10,
            healEffectPct: 30
        },
        uniquePassives: [
            'Bless'
        ],
        passiveName: 'Bless',
        passiveDesc: 'Raises all Shield absorption and HP regeneration effects received by +30%.'
    },
    {
        id: 'cursed_helmet',
        name: 'Cursed Helmet',
        shortName: 'Cursed',
        icon: '🪖',
        category: 'defense',
        tier: 3,
        cost: 1910,
        recipe: [
            'molten_essence',
            'magic_resist_cloak'
        ],
        stats: {
            maxHp: 1200,
            magicDef: 20
        },
        uniquePassives: [
            'Burning Soul'
        ],
        passiveName: 'Burning Soul',
        passiveDesc: 'Deals 1.2% Max HP Magic DPS nearby (+140%–350% vs creeps) & shreds enemy Hybrid DEF.'
    },
    {
        id: 'guardian_helmet',
        name: 'Guardian Helmet',
        shortName: 'Guardian',
        icon: '👑',
        category: 'defense',
        tier: 3,
        cost: 2200,
        recipe: [
            'ares_belt',
            'ares_belt',
            'healing_necklace'
        ],
        stats: {
            maxHp: 1550,
            hpRegen: 20
        },
        uniquePassives: [
            'Recovery'
        ],
        passiveName: 'Recovery',
        passiveDesc: 'Regenerates 2.5% Max HP/s out of combat (0.5% Max HP/s in combat).'
    },
    {
        id: 'twilight_armor',
        name: 'Twilight Armor',
        shortName: 'Twilight',
        icon: '🌌',
        category: 'defense',
        tier: 3,
        cost: 2100,
        recipe: [
            'ares_belt',
            'vitality_crystal'
        ],
        stats: {
            maxHp: 1200,
            physDef: 15
        },
        uniquePassives: [
            'Twilight'
        ],
        passiveName: 'Twilight',
        passiveDesc: 'Reduces single-hit burst damage exceeding 500 by (0.4% Max HP + 15)% (5s CD).'
    },
    // ================= F1. ALL 7 TIER-2 MOVEMENT BOOTS =================
    {
        id: 'tough_boots',
        name: 'Tough Boots',
        shortName: 'Tough B.',
        icon: '🥾',
        category: 'movement',
        tier: 2,
        cost: 700,
        recipe: [
            'boots',
            'magic_resist_cloak'
        ],
        stats: {
            moveSpd: 40,
            magicDef: 18,
            ccResPct: 30
        },
        uniquePassives: [
            'Fortitude'
        ],
        passiveName: 'Fortitude',
        passiveDesc: 'Reduces Crowd Control and Slow durations by 30%.'
    },
    {
        id: 'warrior_boots',
        name: 'Warrior Boots',
        shortName: 'Warrior B.',
        icon: '👢',
        category: 'movement',
        tier: 2,
        cost: 720,
        recipe: [
            'boots',
            'leather_jerkin'
        ],
        stats: {
            moveSpd: 40,
            physDef: 18
        },
        uniquePassives: [
            'Valor'
        ],
        passiveName: 'Valor',
        passiveDesc: 'Taking Physical Damage stacks +4 Phys DEF up to 5x (+20 extra DEF).'
    },
    {
        id: 'swift_boots',
        name: 'Swift Boots',
        shortName: 'Swift B.',
        icon: '👟',
        category: 'movement',
        tier: 2,
        cost: 710,
        recipe: [
            'boots',
            'knife'
        ],
        stats: {
            moveSpd: 40,
            atkSpdPct: 15
        }
    },
    {
        id: 'arcane_boots',
        name: 'Arcane Boots',
        shortName: 'Arcane B.',
        icon: '🔮',
        category: 'movement',
        tier: 2,
        cost: 690,
        recipe: [
            'boots'
        ],
        stats: {
            moveSpd: 40,
            flatMagicPen: 10
        }
    },
    {
        id: 'magic_shoes',
        name: 'Magic Shoes',
        shortName: 'Magic B.',
        icon: '✨',
        category: 'movement',
        tier: 2,
        cost: 710,
        recipe: [
            'boots'
        ],
        stats: {
            moveSpd: 40,
            cdrPct: 10,
            maxHp: 150
        }
    },
    {
        id: 'demon_shoes',
        name: 'Demon Shoes',
        shortName: 'Demon B.',
        icon: '😈',
        category: 'movement',
        tier: 2,
        cost: 720,
        recipe: [
            'boots',
            'magic_necklace'
        ],
        stats: {
            moveSpd: 40,
            manaRegen: 10
        },
        uniquePassives: [
            'Mysticism'
        ],
        passiveName: 'Mysticism',
        passiveDesc: 'Hero kills/assists restore 10% Max Mana; minion kills restore 4% Max Mana.'
    },
    {
        id: 'rapid_boots',
        name: 'Rapid Boots',
        shortName: 'Rapid B.',
        icon: '💨',
        category: 'movement',
        tier: 2,
        cost: 750,
        recipe: [
            'boots'
        ],
        stats: {
            moveSpd: 65,
            ccResPct: 20
        },
        uniquePassives: [
            'Side Effect'
        ],
        passiveName: 'Side Effect',
        passiveDesc: '+65 MS & +35% Slow Reduction; in combat MS drops by -25 for 5s.'
    },
    // ================= F2. ALL 3 JUNGLING BOOT BLESSINGS =================
    {
        id: 'ice_retribution',
        name: 'Ice Retribution',
        shortName: 'Ice Retri',
        icon: '❄️',
        category: 'jungling',
        tier: 3,
        cost: 0,
        recipe: [],
        stats: {},
        blessingKind: 'jungle',
        uniquePassives: [
            'Hunter'
        ],
        passiveName: 'Ice Hunter',
        passiveDesc: 'Evolves at 5 creep/kill stacks: Retribution steals 72–100 Movement Speed for 4s.'
    },
    {
        id: 'flame_retribution',
        name: 'Flame Retribution',
        shortName: 'Flame Retri',
        icon: '🔥',
        category: 'jungling',
        tier: 3,
        cost: 0,
        recipe: [],
        stats: {},
        blessingKind: 'jungle',
        uniquePassives: [
            'Hunter'
        ],
        passiveName: 'Flame Hunter',
        passiveDesc: 'Evolves at 5 stacks: Retribution steals 58–100 Adaptive Attack for 4s.'
    },
    {
        id: 'bloody_retribution',
        name: 'Bloody Retribution',
        shortName: 'Blood Retri',
        icon: '🩸',
        category: 'jungling',
        tier: 3,
        cost: 0,
        recipe: [],
        stats: {},
        blessingKind: 'jungle',
        uniquePassives: [
            'Hunter'
        ],
        passiveName: 'Bloody Hunter',
        passiveDesc: 'Evolves at 5 stacks: Retribution drains 12.5% of user Max HP over 4s.'
    },
    // ================= F3. ALL 4 ROAMING BOOT BLESSINGS =================
    {
        id: 'roam_conceal',
        name: 'Conceal Blessing',
        shortName: 'Conceal',
        icon: '👻',
        category: 'roaming',
        tier: 3,
        cost: 0,
        recipe: [],
        stats: {},
        blessingKind: 'roam',
        activeName: 'Conceal',
        activeCd: 80,
        activeKind: 'conceal',
        uniquePassives: [
            'Devotion',
            'Conceal'
        ],
        passiveName: 'Conceal (Active)',
        passiveDesc: 'Camouflages user & nearby allies for 5s with +24%–60% Movement Speed.'
    },
    {
        id: 'roam_encourage',
        name: 'Encourage Blessing',
        shortName: 'Encourage',
        icon: '📣',
        category: 'roaming',
        tier: 3,
        cost: 0,
        recipe: [],
        stats: {
            adaptiveAtk: 18,
            atkSpdPct: 15
        },
        blessingKind: 'roam',
        uniquePassives: [
            'Devotion',
            'Encourage'
        ],
        passiveName: 'Encourage',
        passiveDesc: 'Grants nearby allies +12–30 Adaptive Attack and +15% Attack Speed.'
    },
    {
        id: 'roam_favor',
        name: 'Favor Blessing',
        shortName: 'Favor',
        icon: '💚',
        category: 'roaming',
        tier: 3,
        cost: 0,
        recipe: [],
        stats: {
            healEffectPct: 15
        },
        blessingKind: 'roam',
        uniquePassives: [
            'Devotion',
            'Favor'
        ],
        passiveName: 'Favor',
        passiveDesc: 'Healing/shielding skills additionally restore 300–750 HP to lowest-HP nearby ally.'
    },
    {
        id: 'roam_dire_hit',
        name: 'Dire Hit Blessing',
        shortName: 'Dire Hit',
        icon: '🎯',
        category: 'roaming',
        tier: 3,
        cost: 0,
        recipe: [],
        stats: {},
        blessingKind: 'roam',
        uniquePassives: [
            'Devotion',
            'Dire Hit'
        ],
        passiveName: 'Dire Hit',
        passiveDesc: 'Damaging an enemy hero below 35% HP deals 7%–18% Target Max HP Hybrid Damage.'
    },
    // ================= F4. ALL 3 LATE-GAME CONSUMABLE POTIONS =================
    {
        id: 'power_potion',
        name: 'Power Potion',
        shortName: 'Pwr Pot',
        icon: '🧪',
        category: 'consumable',
        tier: 3,
        cost: 1500,
        recipe: [],
        stats: {
            physAtk: 30,
            lifestealPct: 15
        },
        consumableDurationSec: 120,
        passiveName: 'Power Elixir (120s)',
        passiveDesc: 'Auto-activates on purchase: +30 Physical Attack & +15% Lifesteal for 120s.'
    },
    {
        id: 'magic_potion',
        name: 'Magic Potion',
        shortName: 'Mag Pot',
        icon: '🔮',
        category: 'consumable',
        tier: 3,
        cost: 1500,
        recipe: [],
        stats: {
            magicPow: 30,
            cdrPct: 5
        },
        consumableDurationSec: 120,
        passiveName: 'Arcane Elixir (120s)',
        passiveDesc: 'Auto-activates on purchase: +30 Magic Power & +5% CD Reduction for 120s.'
    },
    {
        id: 'rock_potion',
        name: 'Rock Potion',
        shortName: 'Rock Pot',
        icon: '🪨',
        category: 'consumable',
        tier: 3,
        cost: 1500,
        recipe: [],
        stats: {
            maxHp: 500,
            ccResPct: 25
        },
        consumableDurationSec: 120,
        passiveName: 'Titan Elixir (120s)',
        passiveDesc: 'Auto-activates on purchase: +500 Max HP & +25% Crowd Control Resilience for 120s.'
    },
    // ================= F5. ALL 3 HERO-UNIQUE EQUIPMENT ITEMS =================
    {
        id: 'lantern_of_hope',
        name: 'Lantern of Hope',
        shortName: 'Lantern',
        icon: '🪷',
        category: 'unique',
        tier: 3,
        cost: 0,
        recipe: [],
        stats: {
            magicPow: 45,
            cdrPct: 10,
            moveSpdPct: 10
        },
        heroExclusive: 'floryn',
        passiveName: 'Dew Evolution',
        passiveDesc: 'Floryn Exclusive: Evolves at 1000 energy to permanently upgrade stats and skills.'
    },
    {
        id: 'flower_of_hope',
        name: 'Flower of Hope',
        shortName: 'Flower',
        icon: '🌸',
        category: 'unique',
        tier: 3,
        cost: 0,
        recipe: [],
        stats: {
            adaptiveAtk: 28,
            healEffectPct: 15
        },
        heroExclusive: 'floryn',
        passiveName: 'Dew Gift',
        passiveDesc: 'Gifted by Floryn to 1 ally: +10% Hybrid Attack & converts excess heal into Shield.'
    },
    {
        id: 'throw_forbidden',
        name: 'Throw Forbidden (Odd Potion)',
        shortName: 'Odd Pot',
        icon: '🚫',
        category: 'unique',
        tier: 1,
        cost: 0,
        recipe: [],
        stats: {},
        heroExclusive: 'jawhead',
        passiveName: 'Anti-Ejector',
        passiveDesc: 'Free utility when Jawhead is an ally: prevents allied Jawhead from throwing you.'
    }
];
function getMlbbItemById(id) {
    return MLBB_ITEMS.find(function(i) {
        return i.id === id;
    });
}
function computeMlbbEffectiveCost(targetId, ownedItems, discountRate) {
    if (discountRate === void 0) discountRate = 0;
    var item = getMlbbItemById(targetId);
    if (!item) return {
        effectiveCost: 0,
        consumedIndices: []
    };
    if (item.cost === 0) return {
        effectiveCost: 0,
        consumedIndices: []
    };
    var used = new Set();
    var credit = 0;
    var consumeComponent = function consumeComponent1(compId) {
        var idx = ownedItems.findIndex(function(id, i) {
            return id === compId && !used.has(i);
        });
        if (idx !== -1) {
            var _ref;
            var _getMlbbItemById;
            used.add(idx);
            credit += (_ref = (_getMlbbItemById = getMlbbItemById(compId)) == null ? void 0 : _getMlbbItemById.cost) != null ? _ref : 0;
            return;
        }
        var sub = getMlbbItemById(compId);
        if (sub && sub.recipe.length > 0) {
            for(var _iterator = _create_for_of_iterator_helper_loose(sub.recipe), _step; !(_step = _iterator()).done;){
                var childId = _step.value;
                consumeComponent(childId);
            }
        }
    };
    for(var _iterator = _create_for_of_iterator_helper_loose(item.recipe), _step; !(_step = _iterator()).done;){
        var compId = _step.value;
        consumeComponent(compId);
    }
    var rawNet = Math.max(0, item.cost - credit);
    var discounted = discountRate > 0 ? Math.round(rawNet * (1 - discountRate)) : rawNet;
    return {
        effectiveCost: discounted,
        consumedIndices: Array.from(used)
    };
}
function applyMlbbItemPurchase(targetId, ownedItems, gold, discountRate) {
    if (discountRate === void 0) discountRate = 0;
    var item = getMlbbItemById(targetId);
    if (!item) return {
        ok: false,
        nextItems: [].concat(ownedItems),
        nextGold: gold,
        spent: 0,
        reason: 'Invalid item'
    };
    var _computeMlbbEffectiveCost = computeMlbbEffectiveCost(targetId, ownedItems, discountRate), effectiveCost = _computeMlbbEffectiveCost.effectiveCost, consumedIndices = _computeMlbbEffectiveCost.consumedIndices;
    if (gold < effectiveCost) {
        return {
            ok: false,
            nextItems: [].concat(ownedItems),
            nextGold: gold,
            spent: 0,
            reason: 'Insufficient gold'
        };
    }
    // Consumable potions activate immediately without consuming an inventory slot
    if (item.category === 'consumable') {
        return {
            ok: true,
            nextItems: [].concat(ownedItems),
            nextGold: gold - effectiveCost,
            spent: effectiveCost
        };
    }
    var remaining = ownedItems.filter(function(_, i) {
        return !consumedIndices.includes(i);
    });
    if (remaining.length >= 6) {
        return {
            ok: false,
            nextItems: [].concat(ownedItems),
            nextGold: gold,
            spent: 0,
            reason: 'Inventory full (6/6)'
        };
    }
    remaining.push(targetId);
    return {
        ok: true,
        nextItems: remaining,
        nextGold: gold - effectiveCost,
        spent: effectiveCost
    };
}
function computeMlbbSellRefund(itemId) {
    var item = getMlbbItemById(itemId);
    if (!item) return 0;
    return Math.round(item.cost * 0.6);
}
function computeMlbbQuickBuy(buildIds, ownedItems, gold, prioritizedItemId, discountRate) {
    if (discountRate === void 0) discountRate = 0;
    var result = [];
    var candidates = [];
    if (prioritizedItemId && !ownedItems.includes(prioritizedItemId)) {
        candidates.push(prioritizedItemId);
    }
    for(var _iterator = _create_for_of_iterator_helper_loose(buildIds), _step; !(_step = _iterator()).done;){
        var bid = _step.value;
        if (!ownedItems.includes(bid) && !candidates.includes(bid)) {
            candidates.push(bid);
        }
    }
    var targetId = candidates[0];
    if (!targetId) return [];
    var mainTarget = getMlbbItemById(targetId);
    if (!mainTarget) return [];
    var mainEff = computeMlbbEffectiveCost(mainTarget.id, ownedItems, discountRate);
    if (gold >= mainEff.effectiveCost || mainTarget.recipe.length === 0) {
        result.push({
            id: mainTarget.id,
            effectiveCost: mainEff.effectiveCost,
            canAfford: gold >= mainEff.effectiveCost
        });
    } else {
        for(var _iterator1 = _create_for_of_iterator_helper_loose(mainTarget.recipe), _step1; !(_step1 = _iterator1()).done;){
            var compId = _step1.value;
            if (ownedItems.includes(compId)) continue;
            var compEff = computeMlbbEffectiveCost(compId, ownedItems, discountRate);
            if (gold >= compEff.effectiveCost) {
                result.push({
                    id: compId,
                    effectiveCost: compEff.effectiveCost,
                    canAfford: true
                });
            } else {
                var compDef = getMlbbItemById(compId);
                if (compDef) {
                    for(var _iterator2 = _create_for_of_iterator_helper_loose(compDef.recipe), _step2; !(_step2 = _iterator2()).done;){
                        var subId = _step2.value;
                        if (!ownedItems.includes(subId) && result.length < 2) {
                            var subEff = computeMlbbEffectiveCost(subId, ownedItems, discountRate);
                            result.push({
                                id: subId,
                                effectiveCost: subEff.effectiveCost,
                                canAfford: gold >= subEff.effectiveCost
                            });
                        }
                    }
                }
            }
            if (result.length >= 2) break;
        }
        if (result.length === 0) {
            result.push({
                id: mainTarget.id,
                effectiveCost: mainEff.effectiveCost,
                canAfford: false
            });
        }
    }
    return result.slice(0, 2);
}
function aggregateMlbbItemStats(ownedItems, blessingId, preferMagic) {
    if (preferMagic === void 0) preferMagic = false;
    var acc = {
        physAtk: 0,
        magicPow: 0,
        adaptiveAtk: 0,
        maxHp: 0,
        maxMana: 0,
        manaRegen: 0,
        physDef: 0,
        magicDef: 0,
        moveSpd: 0,
        moveSpdPct: 0,
        atkSpdPct: 0,
        critChance: 0,
        critDmgPct: 0,
        cdrPct: 0,
        lifestealPct: 0,
        spellVampPct: 0,
        flatPhysPen: 0,
        pctPhysPen: 0,
        flatMagicPen: 0,
        pctMagicPen: 0,
        ccResPct: 0,
        hpRegen: 0,
        healEffectPct: 0
    };
    var allIds = blessingId ? [].concat(ownedItems, [
        blessingId
    ]) : [].concat(ownedItems);
    var resolved = (0, _CombatMath.resolveUniqueItemPassives)(allIds);
    var armorBusterApplied = false;
    var uniqueCritDmgApplied = false;
    for(var _iterator = _create_for_of_iterator_helper_loose(allIds), _step; !(_step = _iterator()).done;){
        var id = _step.value;
        var _s_physAtk, _s_magicPow, _s_adaptiveAtk, _s_maxHp, _s_maxMana, _s_manaRegen, _s_physDef, _s_magicDef, _s_moveSpd, _s_moveSpdPct, _s_atkSpdPct, _s_critChance, _s_cdrPct, _s_lifestealPct, _s_spellVampPct, _s_flatPhysPen, _s_flatMagicPen, _s_pctMagicPen, _s_ccResPct, _s_hpRegen, _s_healEffectPct;
        var def = getMlbbItemById(id);
        if (!def) continue;
        var s = def.stats;
        acc.physAtk += (_s_physAtk = s.physAtk) != null ? _s_physAtk : 0;
        acc.magicPow += (_s_magicPow = s.magicPow) != null ? _s_magicPow : 0;
        acc.adaptiveAtk += (_s_adaptiveAtk = s.adaptiveAtk) != null ? _s_adaptiveAtk : 0;
        if (s.adaptiveAtk) {
            if (preferMagic) acc.magicPow += s.adaptiveAtk;
            else acc.physAtk += s.adaptiveAtk;
        }
        acc.maxHp += (_s_maxHp = s.maxHp) != null ? _s_maxHp : 0;
        acc.maxMana += (_s_maxMana = s.maxMana) != null ? _s_maxMana : 0;
        acc.manaRegen += (_s_manaRegen = s.manaRegen) != null ? _s_manaRegen : 0;
        acc.physDef += (_s_physDef = s.physDef) != null ? _s_physDef : 0;
        acc.magicDef += (_s_magicDef = s.magicDef) != null ? _s_magicDef : 0;
        acc.moveSpd += (_s_moveSpd = s.moveSpd) != null ? _s_moveSpd : 0;
        acc.moveSpdPct += (_s_moveSpdPct = s.moveSpdPct) != null ? _s_moveSpdPct : 0;
        acc.atkSpdPct += (_s_atkSpdPct = s.atkSpdPct) != null ? _s_atkSpdPct : 0;
        acc.critChance += (_s_critChance = s.critChance) != null ? _s_critChance : 0;
        if (s.critDmgPct && !uniqueCritDmgApplied) {
            acc.critDmgPct += s.critDmgPct;
            uniqueCritDmgApplied = true;
        }
        acc.cdrPct += (_s_cdrPct = s.cdrPct) != null ? _s_cdrPct : 0;
        acc.lifestealPct += (_s_lifestealPct = s.lifestealPct) != null ? _s_lifestealPct : 0;
        acc.spellVampPct += (_s_spellVampPct = s.spellVampPct) != null ? _s_spellVampPct : 0;
        acc.flatPhysPen += (_s_flatPhysPen = s.flatPhysPen) != null ? _s_flatPhysPen : 0;
        if (s.pctPhysPen) {
            var _def_uniquePassives;
            if ((_def_uniquePassives = def.uniquePassives) == null ? void 0 : _def_uniquePassives.includes('Armor Buster')) {
                if (!armorBusterApplied) {
                    acc.pctPhysPen = Math.min(0.6, acc.pctPhysPen + s.pctPhysPen);
                    armorBusterApplied = true;
                }
            } else {
                acc.pctPhysPen = Math.min(0.6, acc.pctPhysPen + s.pctPhysPen);
            }
        }
        acc.flatMagicPen += (_s_flatMagicPen = s.flatMagicPen) != null ? _s_flatMagicPen : 0;
        acc.pctMagicPen = Math.min(0.6, acc.pctMagicPen + ((_s_pctMagicPen = s.pctMagicPen) != null ? _s_pctMagicPen : 0));
        acc.ccResPct = Math.min(50, acc.ccResPct + ((_s_ccResPct = s.ccResPct) != null ? _s_ccResPct : 0));
        acc.hpRegen += (_s_hpRegen = s.hpRegen) != null ? _s_hpRegen : 0;
        acc.healEffectPct += (_s_healEffectPct = s.healEffectPct) != null ? _s_healEffectPct : 0;
    }
    // Convert moveSpdPct into equivalent flat movement speed bonus (~250 base MS)
    if (acc.moveSpdPct > 0) {
        acc.moveSpd += Math.round(250 * (acc.moveSpdPct / 100));
    }
    acc.cdrPct = Math.min(resolved.cdrCapPct, acc.cdrPct);
    acc.critChance = Math.min(100, acc.critChance);
    return acc;
}
function getItemCraftingTree(targetId, ownedItems, discountRate) {
    if (discountRate === void 0) discountRate = 0;
    var rootDef = getMlbbItemById(targetId);
    if (!rootDef) return null;
    var usedSlots = new Set();
    var buildNode = function buildNode1(id, isRoot) {
        var def = getMlbbItemById(id);
        if (!def) return null;
        var owned = false;
        if (!isRoot) {
            var idx = ownedItems.findIndex(function(ownedId, slotIdx) {
                return ownedId === id && !usedSlots.has(slotIdx);
            });
            if (idx !== -1) {
                usedSlots.add(idx);
                owned = true;
            }
        } else {
            owned = ownedItems.includes(id);
        }
        var eff = computeMlbbEffectiveCost(id, ownedItems, discountRate).effectiveCost;
        var children = [];
        if (!owned || isRoot) {
            for(var _iterator = _create_for_of_iterator_helper_loose(def.recipe), _step; !(_step = _iterator()).done;){
                var childId = _step.value;
                var childNode = buildNode(childId, false);
                if (childNode) children.push(childNode);
            }
        } else {
            for(var _iterator1 = _create_for_of_iterator_helper_loose(def.recipe), _step1; !(_step1 = _iterator1()).done;){
                var childId1 = _step1.value;
                var childDef = getMlbbItemById(childId1);
                if (childDef) {
                    children.push({
                        item: childDef,
                        owned: true,
                        effectiveCost: 0,
                        children: []
                    });
                }
            }
        }
        return {
            item: def,
            owned: owned,
            effectiveCost: owned && !isRoot ? 0 : eff,
            children: children
        };
    };
    return buildNode(targetId, true);
}
function getProBuildTemplatesForHero(hero) {
    var rec = hero.recommendedBuild.length >= 6 ? [].concat(hero.recommendedBuild.slice(0, 6)) : [
        'tough_boots',
        'blade_of_despair',
        'malefic_roar',
        'endless_battle',
        'hunter_strike',
        'immortality'
    ];
    if (hero.role === 'Mage') {
        return [
            {
                id: 'pro_burst',
                label: 'Pro Burst Meta',
                tag: 'High Burst',
                items: [
                    'arcane_boots',
                    'lightning_truncheon',
                    'holy_crystal',
                    'divine_glaive',
                    'wishing_lantern',
                    'blood_wings'
                ]
            },
            {
                id: 'pro_sustain',
                label: 'Pro Sustain CDR',
                tag: 'CDR / Survive',
                items: [
                    'magic_shoes',
                    'enchanted_talisman',
                    'clock_of_destiny',
                    'concentrated_energy',
                    'ice_queen_wand',
                    'winter_crown'
                ]
            },
            {
                id: 'pro_counter',
                label: 'Pro Anti-Heal',
                tag: 'Counter Tanks',
                items: [
                    'tough_boots',
                    'glowing_wand',
                    'wishing_lantern',
                    'divine_glaive',
                    'genius_wand',
                    'immortality'
                ]
            }
        ];
    }
    if (hero.role === 'Marksman') {
        return [
            {
                id: 'pro_burst',
                label: 'Pro Crit / Range',
                tag: '2026 Meta',
                items: [
                    'swift_boots',
                    'haas_claws',
                    'berserkers_fury',
                    'windtalker',
                    'malefic_gun',
                    'wind_of_nature'
                ]
            },
            {
                id: 'pro_sustain',
                label: 'Pro Trinity Shred',
                tag: 'Tank Melt',
                items: [
                    'swift_boots',
                    'corrosion_scythe',
                    'demon_hunter_sword',
                    'golden_staff',
                    'malefic_gun',
                    'rose_gold_meteor'
                ]
            },
            {
                id: 'pro_counter',
                label: 'Pro Anti-Heal Safe',
                tag: 'Anti-Regen',
                items: [
                    'tough_boots',
                    'sea_halberd',
                    'malefic_gun',
                    'wind_of_nature',
                    'rose_gold_meteor',
                    'immortality'
                ]
            }
        ];
    }
    if (hero.role === 'Assassin') {
        return [
            {
                id: 'pro_burst',
                label: 'Pro Sky Piercer',
                tag: 'Snowball',
                items: [
                    'tough_boots',
                    'sky_piercer',
                    'blade_of_heptaseas',
                    'hunter_strike',
                    'malefic_roar',
                    'blade_of_despair'
                ]
            },
            {
                id: 'pro_sustain',
                label: 'Pro Skirmisher',
                tag: 'Bruiser',
                items: [
                    'warrior_boots',
                    'war_axe',
                    'endless_battle',
                    'brute_force_breastplate',
                    'rose_gold_meteor',
                    'immortality'
                ]
            },
            {
                id: 'pro_counter',
                label: 'Pro Anti-Heal',
                tag: 'Counter Heal',
                items: [
                    'tough_boots',
                    'sea_halberd',
                    'hunter_strike',
                    'malefic_roar',
                    'winter_crown',
                    'immortality'
                ]
            }
        ];
    }
    if (hero.role === 'Tank') {
        return [
            {
                id: 'pro_burst',
                label: 'Pro Thunder Stack',
                tag: '2026 Roam',
                items: [
                    'tough_boots',
                    'thunder_belt',
                    'dominance_ice',
                    'athenas_shield',
                    'antique_cuirass',
                    'immortality'
                ]
            },
            {
                id: 'pro_sustain',
                label: 'Pro Mega Sustain',
                tag: 'Frontline',
                items: [
                    'warrior_boots',
                    'guardian_helmet',
                    'cursed_helmet',
                    'oracle',
                    'twilight_armor',
                    'immortality'
                ]
            },
            {
                id: 'pro_counter',
                label: 'Pro Counter DPS',
                tag: 'Anti-MM/Mage',
                items: [
                    'tough_boots',
                    'dominance_ice',
                    'chastise_pauldron',
                    'blade_armor',
                    'radiant_armor',
                    'twilight_armor'
                ]
            }
        ];
    }
    if (hero.role === 'Support') {
        return [
            {
                id: 'pro_burst',
                label: 'Pro Oasis Heal',
                tag: '2026 Support',
                items: [
                    'magic_shoes',
                    'flask_of_the_oasis',
                    'enchanted_talisman',
                    'fleeting_time',
                    'oracle',
                    'immortality'
                ]
            },
            {
                id: 'pro_sustain',
                label: 'Pro Utility Tank',
                tag: 'Durable',
                items: [
                    'tough_boots',
                    'flask_of_the_oasis',
                    'dominance_ice',
                    'athenas_shield',
                    'fleeting_time',
                    'winter_crown'
                ]
            },
            {
                id: 'pro_counter',
                label: 'Pro Anti-Heal',
                tag: 'Debuff',
                items: [
                    'tough_boots',
                    'glowing_wand',
                    'ice_queen_wand',
                    'flask_of_the_oasis',
                    'dominance_ice',
                    'immortality'
                ]
            }
        ];
    }
    // Fighter (EXP / Bruiser)
    return [
        {
            id: 'pro_burst',
            label: 'Pro Meta Core',
            tag: 'Recommended',
            items: rec
        },
        {
            id: 'pro_sustain',
            label: 'Pro War Axe Sustain',
            tag: 'Spell Vamp',
            items: [
                'tough_boots',
                'war_axe',
                'thunder_belt',
                'queens_wings',
                'oracle',
                'immortality'
            ]
        },
        {
            id: 'pro_counter',
            label: 'Pro Anti-Heal Duel',
            tag: 'Counter Lane',
            items: [
                'warrior_boots',
                'sea_halberd',
                'war_axe',
                'brute_force_breastplate',
                'athenas_shield',
                'immortality'
            ]
        }
    ];
}

});
// === MODULE: src/games/legends-arena/mlbb/data/mapData ===
ArcadeMod.define("src/games/legends-arena/mlbb/data/mapData", function(require, module, exports) {
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
    get BLUE_CRYSTAL () {
        return BLUE_CRYSTAL;
    },
    get BLUE_FOUNTAIN () {
        return BLUE_FOUNTAIN;
    },
    get BRAWL_BRIDGE_HALF_WIDTH () {
        return BRAWL_BRIDGE_HALF_WIDTH;
    },
    get BRAWL_HEALING_SHRINES () {
        return BRAWL_HEALING_SHRINES;
    },
    get BRAWL_TURRETS () {
        return BRAWL_TURRETS;
    },
    get BROKEN_WALL_IDS () {
        return BROKEN_WALL_IDS;
    },
    get CYCLONE_EYES () {
        return CYCLONE_EYES;
    },
    get DANGEROUS_GRASS_EXTRA_BUSHES () {
        return DANGEROUS_GRASS_EXTRA_BUSHES;
    },
    get FLYING_CLOUD_BLUE () {
        return FLYING_CLOUD_BLUE;
    },
    get FOUR_SKILL_HERO_META () {
        return FOUR_SKILL_HERO_META;
    },
    get LANE_WAYPOINTS () {
        return LANE_WAYPOINTS;
    },
    get MAP_BUSHES () {
        return MAP_BUSHES;
    },
    get MAP_THEMES () {
        return MAP_THEMES;
    },
    get MAP_TURRETS () {
        return MAP_TURRETS;
    },
    get MAP_VARIANTS_2026 () {
        return MAP_VARIANTS_2026;
    },
    get MAP_WALLS () {
        return MAP_WALLS;
    },
    get MLBB_TIMERS () {
        return MLBB_TIMERS;
    },
    get PRIMARY_2026_VARIANTS () {
        return PRIMARY_2026_VARIANTS;
    },
    get RED_CRYSTAL () {
        return RED_CRYSTAL;
    },
    get RED_FOUNTAIN () {
        return RED_FOUNTAIN;
    },
    get WORLD_SIZE () {
        return WORLD_SIZE;
    },
    get clampToBrawlBridge () {
        return clampToBrawlBridge;
    },
    get createJungleCampSpecs () {
        return createJungleCampSpecs;
    },
    get formatClock () {
        return formatClock;
    },
    get getActiveMapBushes () {
        return getActiveMapBushes;
    },
    get getActiveMapWalls () {
        return getActiveMapWalls;
    },
    get getLaneDecalPosition () {
        return getLaneDecalPosition;
    },
    get getRiverCurrentSpeedBonus () {
        return getRiverCurrentSpeedBonus;
    },
    get isFourSkillHero () {
        return isFourSkillHero;
    },
    get isPointInBush () {
        return isPointInBush;
    },
    get isPointInExpandedRiver () {
        return isPointInExpandedRiver;
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
var WORLD_SIZE = 4000;
var BLUE_FOUNTAIN = {
    x: 260,
    y: 3740,
    radius: 220
};
var BLUE_CRYSTAL = {
    x: 520,
    y: 3480,
    radius: 95
};
var RED_FOUNTAIN = {
    x: 3740,
    y: 260,
    radius: 220
};
var RED_CRYSTAL = {
    x: 3480,
    y: 520,
    radius: 95
};
var MLBB_TIMERS = {
    MINION_FIRST_SPAWN: 10,
    MINION_INTERVAL: 30,
    ORANGE_FIRST_SPAWN: 20,
    PURPLE_FIRST_SPAWN: 20,
    BUFF_RESPAWN: 75,
    BUFF_DURATION: 75,
    SMALL_CAMP_FIRST_SPAWN: 25,
    SMALL_CAMP_RESPAWN: 60,
    LITHO_FIRST_SPAWN: 43,
    LITHO_RESPAWN: 120,
    WALKIE_GRASS_DURATION: 45,
    CRAB_FIRST_SPAWN: 45,
    CRAB_SMALL_RESPAWN: 90,
    CRAB_UPGRADE_TIME: 120,
    CRAB_LARGE_RESPAWN: 90,
    CRAB_GOLD_BUFF_DURATION: 18,
    TURTLE_FIRST_SPAWN: 120,
    TURTLE_RESPAWN: 120,
    TURTLE_STOP_SPAWN: 480,
    TURTLE_DESPAWN: 480,
    OUTER_SHIELD_EXPIRE: 300,
    OUTER_PLATE_GOLD: 40,
    OUTER_PLATE_CHUNK: 300,
    LORD_STAGE1_SPAWN: 480,
    LORD_STAGE2_TIME: 720,
    LORD_STAGE3_TIME: 1080,
    LORD_RESPAWN_EARLY: 180,
    LORD_RESPAWN_LATE: 180,
    CYCLONE_EYE_CD: 45,
    BRAWL_SHRINE_FIRST_SPAWN: 15,
    BRAWL_SHRINE_RESPAWN: 45,
    SURRENDER_UNLOCK: 360
};
var BRAWL_BRIDGE_HALF_WIDTH = 290;
var BRAWL_HEALING_SHRINES = [
    {
        id: 'brawl_shrine_blue',
        side: 'blue',
        x: 1595,
        y: 2145
    },
    {
        id: 'brawl_shrine_red',
        side: 'red',
        x: 2405,
        y: 1855
    }
];
var BRAWL_TURRETS = [
    {
        id: 'brawl_b1',
        team: 'blue',
        lane: 'mid',
        tier: 1,
        x: 1520,
        y: 2480
    },
    {
        id: 'brawl_b2',
        team: 'blue',
        lane: 'mid',
        tier: 2,
        x: 1040,
        y: 2960
    },
    {
        id: 'brawl_r1',
        team: 'red',
        lane: 'mid',
        tier: 1,
        x: 2480,
        y: 1520
    },
    {
        id: 'brawl_r2',
        team: 'red',
        lane: 'mid',
        tier: 2,
        x: 2960,
        y: 1040
    }
];
function clampToBrawlBridge(x, y, radius) {
    var cx = Math.max(radius + 40, Math.min(WORLD_SIZE - radius - 40, x));
    var cy = Math.max(radius + 40, Math.min(WORLD_SIZE - radius - 40, y));
    // Allow full freedom inside Blue or Red base plaza circles
    if (Math.hypot(cx - BLUE_FOUNTAIN.x, cy - BLUE_FOUNTAIN.y) <= 440 - radius) return {
        x: cx,
        y: cy
    };
    if (Math.hypot(cx - RED_FOUNTAIN.x, cy - RED_FOUNTAIN.y) <= 440 - radius) return {
        x: cx,
        y: cy
    };
    // Project onto the Blue->Red diagonal centerline (x + y = WORLD_SIZE)
    var signedOffset = (cx + cy - WORLD_SIZE) / Math.SQRT2;
    var maxHalf = BRAWL_BRIDGE_HALF_WIDTH - radius;
    if (Math.abs(signedOffset) <= maxHalf) return {
        x: cx,
        y: cy
    };
    var clamped = Math.sign(signedOffset) * maxHalf;
    var delta = clamped - signedOffset;
    return {
        x: cx + delta / Math.SQRT2,
        y: cy + delta / Math.SQRT2
    };
}
function getLaneDecalPosition(lane) {
    return lane === 'top' ? {
        x: 470,
        y: 470
    } : {
        x: 3530,
        y: 3530
    };
}
var MAP_THEMES = {
    imperial_sanctuary: {
        name: 'Imperial Sanctuary',
        grassA: '#2D5A36',
        grassB: '#386B40',
        laneStone: '#B7A484',
        laneBorder: '#D4B97B',
        riverA: '#1E758F',
        riverB: '#34A4BD',
        wall: '#39404A',
        bush: '#1B4227'
    },
    western_expanse: {
        name: 'Western Expanse',
        grassA: '#6E5A38',
        grassB: '#7F6943',
        laneStone: '#CBB48C',
        laneBorder: '#E2C382',
        riverA: '#287D8C',
        riverB: '#3EA3B2',
        wall: '#574636',
        bush: '#3B4D29'
    },
    celestial_palace: {
        name: 'Celestial Palace',
        grassA: '#29485C',
        grassB: '#34586E',
        laneStone: '#C9D0DE',
        laneBorder: '#F2C96B',
        riverA: '#27679C',
        riverB: '#4498D9',
        wall: '#3D4861',
        bush: '#1F3B4D'
    },
    sanctum_island: {
        name: 'Sanctum Island',
        grassA: '#245848',
        grassB: '#2E6B58',
        laneStone: '#B8AD92',
        laneBorder: '#D9B96E',
        riverA: '#196C8A',
        riverB: '#2CB3C9',
        wall: '#35434A',
        bush: '#163D34'
    },
    harmonic_sanctuary: {
        name: 'Harmonic Sanctuary',
        grassA: '#305442',
        grassB: '#3B664F',
        laneStone: '#C7B8A5',
        laneBorder: '#E8C57B',
        riverA: '#236C96',
        riverB: '#42A5D6',
        wall: '#433F52',
        bush: '#1E4032'
    }
};
var PRIMARY_2026_VARIANTS = [
    'dangerous_grass',
    'broken_walls',
    'flying_cloud',
    'expanding_rivers'
];
var MAP_VARIANTS_2026 = {
    dangerous_grass: {
        id: 'dangerous_grass',
        name: 'Dangerous Grass',
        icon: '🌿',
        desc: 'Extra dense ambush bushes grow near Outer Turrets, Mid Lane, and Lord/Turtle pits for deadly ganks.',
        color: '#22C55E'
    },
    broken_walls: {
        id: 'broken_walls',
        name: 'Broken Walls',
        icon: '🧱',
        desc: 'Shattered jungle walls open new high-speed flanking shortcuts near Blue/Red Buffs and Mid Lane.',
        color: '#F59E0B'
    },
    flying_cloud: {
        id: 'flying_cloud',
        name: 'Flying Cloud',
        icon: '☁️',
        desc: 'Base Fountain wind platform rockets respawned heroes high over base walls straight into outer lanes.',
        color: '#C084FC'
    },
    expanding_rivers: {
        id: 'expanding_rivers',
        name: 'Expanding Rivers',
        icon: '🌊',
        desc: 'Flooding river currents extend into jungle entrances, granting +28% surging rotation speed.',
        color: '#38BDF8'
    },
    revealing_wisps: {
        id: 'revealing_wisps',
        name: 'Revealing Wisps',
        icon: '👻',
        desc: 'Spirit orbs drift through jungle corridors periodically revealing enemies hidden in bushes.',
        color: '#38BDF8'
    },
    healing_turtle: {
        id: 'healing_turtle',
        name: 'Healing Turtle',
        icon: '🐢',
        desc: 'Slaying the Turtle grants rapid team regeneration and summons mini-turtles to pressure turrets.',
        color: '#2CE58B'
    },
    golden_turret: {
        id: 'golden_turret',
        name: 'Golden Turret',
        icon: '🏰',
        desc: 'Inner & Base turrets gain extra armor and shower the team with +65% bonus Gold when destroyed.',
        color: '#FACC15'
    }
};
var MAP_TURRETS = [
    // Blue Top
    {
        id: 'bt1',
        team: 'blue',
        lane: 'top',
        tier: 1,
        x: 420,
        y: 1580
    },
    {
        id: 'bt2',
        team: 'blue',
        lane: 'top',
        tier: 2,
        x: 420,
        y: 2350
    },
    {
        id: 'bt3',
        team: 'blue',
        lane: 'top',
        tier: 3,
        x: 450,
        y: 3000
    },
    // Blue Mid
    {
        id: 'bm1',
        team: 'blue',
        lane: 'mid',
        tier: 1,
        x: 1460,
        y: 2540
    },
    {
        id: 'bm2',
        team: 'blue',
        lane: 'mid',
        tier: 2,
        x: 1080,
        y: 2920
    },
    {
        id: 'bm3',
        team: 'blue',
        lane: 'mid',
        tier: 3,
        x: 780,
        y: 3220
    },
    // Blue Bot
    {
        id: 'bb1',
        team: 'blue',
        lane: 'bot',
        tier: 1,
        x: 2420,
        y: 3580
    },
    {
        id: 'bb2',
        team: 'blue',
        lane: 'bot',
        tier: 2,
        x: 1650,
        y: 3580
    },
    {
        id: 'bb3',
        team: 'blue',
        lane: 'bot',
        tier: 3,
        x: 1000,
        y: 3550
    },
    // Red Top
    {
        id: 'rt1',
        team: 'red',
        lane: 'top',
        tier: 1,
        x: 1580,
        y: 420
    },
    {
        id: 'rt2',
        team: 'red',
        lane: 'top',
        tier: 2,
        x: 2350,
        y: 420
    },
    {
        id: 'rt3',
        team: 'red',
        lane: 'top',
        tier: 3,
        x: 3000,
        y: 450
    },
    // Red Mid
    {
        id: 'rm1',
        team: 'red',
        lane: 'mid',
        tier: 1,
        x: 2540,
        y: 1460
    },
    {
        id: 'rm2',
        team: 'red',
        lane: 'mid',
        tier: 2,
        x: 2920,
        y: 1080
    },
    {
        id: 'rm3',
        team: 'red',
        lane: 'mid',
        tier: 3,
        x: 3220,
        y: 780
    },
    // Red Bot
    {
        id: 'rb1',
        team: 'red',
        lane: 'bot',
        tier: 1,
        x: 3580,
        y: 2420
    },
    {
        id: 'rb2',
        team: 'red',
        lane: 'bot',
        tier: 2,
        x: 3580,
        y: 1650
    },
    {
        id: 'rb3',
        team: 'red',
        lane: 'bot',
        tier: 3,
        x: 3550,
        y: 1000
    }
];
var MAP_WALLS = [
    // Blue Jungle Walls
    {
        id: 'w_bp_short',
        x: 1270,
        y: 2040,
        w: 70,
        h: 210,
        shortcutCampId: 'blue_purple'
    },
    {
        id: 'w_bj1',
        x: 760,
        y: 1850,
        w: 180,
        h: 75
    },
    {
        id: 'w_bj2',
        x: 1560,
        y: 2950,
        w: 240,
        h: 80
    },
    {
        id: 'w_bj3',
        x: 2180,
        y: 2800,
        w: 190,
        h: 75
    },
    {
        id: 'w_bj4',
        x: 1980,
        y: 3180,
        w: 190,
        h: 70
    },
    // Red Jungle Mirror Walls
    {
        id: 'w_rp_short',
        x: 2660,
        y: 1750,
        w: 70,
        h: 210,
        shortcutCampId: 'red_purple'
    },
    {
        id: 'w_rj1',
        x: 3060,
        y: 2075,
        w: 180,
        h: 75
    },
    {
        id: 'w_rj2',
        x: 2200,
        y: 970,
        w: 240,
        h: 80
    },
    {
        id: 'w_rj3',
        x: 1630,
        y: 1125,
        w: 190,
        h: 75
    },
    {
        id: 'w_rj4',
        x: 1830,
        y: 750,
        w: 190,
        h: 70
    },
    // Pit Back Walls
    {
        id: 'w_pit_u',
        x: 1060,
        y: 1120,
        w: 180,
        h: 65
    },
    {
        id: 'w_pit_l',
        x: 2760,
        y: 2815,
        w: 180,
        h: 65
    }
];
var MAP_BUSHES = [
    // Side Lane Edge Bushes
    {
        id: 'b_top1',
        cx: 340,
        cy: 1040,
        rx: 110,
        ry: 48,
        angle: Math.PI / 2
    },
    {
        id: 'b_top2',
        cx: 980,
        cy: 340,
        rx: 110,
        ry: 48,
        angle: 0
    },
    {
        id: 'b_bot1',
        cx: 3020,
        cy: 3660,
        rx: 110,
        ry: 48,
        angle: 0
    },
    {
        id: 'b_bot2',
        cx: 3660,
        cy: 2960,
        rx: 110,
        ry: 48,
        angle: Math.PI / 2
    },
    // Mid River Entrance Bushes
    {
        id: 'b_mid_l',
        cx: 1720,
        cy: 1980,
        rx: 95,
        ry: 44,
        angle: -Math.PI / 4
    },
    {
        id: 'b_mid_r',
        cx: 2280,
        cy: 2020,
        rx: 95,
        ry: 44,
        angle: -Math.PI / 4
    },
    // Buff Guard Bushes
    {
        id: 'b_bp',
        cx: 1360,
        cy: 2300,
        rx: 85,
        ry: 42,
        angle: 0.3
    },
    {
        id: 'b_bo',
        cx: 2050,
        cy: 2960,
        rx: 85,
        ry: 42,
        angle: -0.3
    },
    {
        id: 'b_rp',
        cx: 2640,
        cy: 1700,
        rx: 85,
        ry: 42,
        angle: 0.3
    },
    {
        id: 'b_ro',
        cx: 1950,
        cy: 1040,
        rx: 85,
        ry: 42,
        angle: -0.3
    },
    // River Pit Bushes
    {
        id: 'b_pitu',
        cx: 1480,
        cy: 1450,
        rx: 90,
        ry: 42,
        angle: Math.PI / 4
    },
    {
        id: 'b_pitl',
        cx: 2520,
        cy: 2550,
        rx: 90,
        ry: 42,
        angle: Math.PI / 4
    }
];
var DANGEROUS_GRASS_EXTRA_BUSHES = [
    {
        id: 'dg_mid_b',
        cx: 1580,
        cy: 2380,
        rx: 95,
        ry: 46,
        angle: -Math.PI / 4
    },
    {
        id: 'dg_mid_r',
        cx: 2420,
        cy: 1620,
        rx: 95,
        ry: 46,
        angle: -Math.PI / 4
    },
    {
        id: 'dg_top_t1',
        cx: 610,
        cy: 1420,
        rx: 90,
        ry: 42,
        angle: Math.PI / 2
    },
    {
        id: 'dg_bot_t1',
        cx: 2580,
        cy: 3390,
        rx: 90,
        ry: 42,
        angle: 0
    },
    {
        id: 'dg_pit_u2',
        cx: 1180,
        cy: 1540,
        rx: 88,
        ry: 42,
        angle: Math.PI / 4
    },
    {
        id: 'dg_pit_l2',
        cx: 2820,
        cy: 2460,
        rx: 88,
        ry: 42,
        angle: Math.PI / 4
    }
];
var BROKEN_WALL_IDS = new Set([
    'w_bp_short',
    'w_rp_short',
    'w_bj2',
    'w_rj2',
    'w_bj3',
    'w_rj3'
]);
function getActiveMapBushes(variant) {
    return variant === 'dangerous_grass' ? [].concat(MAP_BUSHES, DANGEROUS_GRASS_EXTRA_BUSHES) : MAP_BUSHES;
}
function getActiveMapWalls(variant) {
    return variant === 'broken_walls' ? MAP_WALLS.filter(function(w) {
        return !BROKEN_WALL_IDS.has(w.id);
    }) : MAP_WALLS;
}
function isPointInExpandedRiver(x, y, variant) {
    var riverDist = Math.abs(x - y) / Math.SQRT2;
    var maxWidth = variant === 'expanding_rivers' ? 275 : 135;
    if (riverDist <= maxWidth && x > 300 && x < WORLD_SIZE - 300 && y > 300 && y < WORLD_SIZE - 300) {
        return true;
    }
    if (variant === 'expanding_rivers') {
        // Flooded jungle entrance eddies near Turtle & Lord pits
        if (Math.hypot(x - 1420, y - 1650) < 225 || Math.hypot(x - 2580, y - 2350) < 225) return true;
    }
    return false;
}
function getRiverCurrentSpeedBonus(x, y, variant) {
    if (!isPointInExpandedRiver(x, y, variant)) return 0;
    return variant === 'expanding_rivers' ? 0.28 : 0.15;
}
var FOUR_SKILL_HERO_META = {
    zhuxin: {
        name: 'Lantern Blink',
        icon: '🏮',
        cd: 9,
        mana: 45,
        color: '#C084FC',
        desc: 'Shift lantern spirit forward and pulse soul damage.'
    },
    julian: {
        name: 'Enhanced Smith',
        icon: '⛓️',
        cd: 7,
        mana: 0,
        color: '#EF4444',
        desc: 'Empowers next skill cast with magic lifesteal & knock-up.'
    },
    valentina: {
        name: 'Shadow Morph',
        icon: '🪞',
        cd: 16,
        mana: 70,
        color: '#A855F7',
        desc: 'Manifest shadow double dealing magic burst in cone.'
    },
    kagura: {
        name: 'Yin Yang Shift',
        icon: '☂️',
        cd: 8,
        mana: 50,
        color: '#38BDF8',
        desc: 'Teleport to Seimei Umbrella and cleanse slows.'
    },
    selena: {
        name: 'Abyssal Form',
        icon: '🦇',
        cd: 6,
        mana: 35,
        color: '#9333EA',
        desc: 'Switch between Elven & Abyssal forms with speed surge.'
    },
    roger: {
        name: 'Wolf Transformation',
        icon: '🐺',
        cd: 6,
        mana: 30,
        color: '#F97316',
        desc: 'Leap forward transforming between Hunter and Lycan.'
    },
    pharsa: {
        name: 'Wings by Wings',
        icon: '🕊️',
        cd: 18,
        mana: 50,
        color: '#818CF8',
        desc: 'Transform into mist bird and fly rapidly over terrain.'
    },
    luo_yi: {
        name: 'Yin-Yang Reaction',
        icon: '☯️',
        cd: 12,
        mana: 55,
        color: '#6366F1',
        desc: 'Trigger polarity pull between marked enemies.'
    },
    yve: {
        name: 'Starfield Pulse',
        icon: '🌌',
        cd: 10,
        mana: 50,
        color: '#A855F7',
        desc: 'Project astral nova slowing enemies in area.'
    },
    beatrix: {
        name: 'Need Backup (Swap)',
        icon: '🔫',
        cd: 4,
        mana: 0,
        color: '#F59E0B',
        desc: 'Swap active firearm loadout for rapid burst boost.'
    },
    popol_and_kupa: {
        name: 'Kupa Help!',
        icon: '🐕',
        cd: 12,
        mana: 50,
        color: '#22D3EE',
        desc: 'Command Kupa to lunge and shield Popol.'
    },
    fredrinn: {
        name: 'Appraiser Wrath',
        icon: '🗡️',
        cd: 11,
        mana: 0,
        color: '#FACC15',
        desc: 'Consume Crystal Energy for massive cleave slam.'
    },
    sun: {
        name: 'Instantaneous Move',
        icon: '🐒',
        cd: 9,
        mana: 40,
        color: '#F59E0B',
        desc: 'Dash with Doppelganger strike.'
    },
    yu_zhong: {
        name: 'Black Dragon Dive',
        icon: '🐉',
        cd: 14,
        mana: 0,
        color: '#7C3AED',
        desc: 'Soar and slam down with Sha Residue burst.'
    },
    zhask: {
        name: 'Mind Eater Burst',
        icon: '👾',
        cd: 10,
        mana: 60,
        color: '#A855F7',
        desc: 'Fire synchronized Nightmaric Spawn laser.'
    },
    chip: {
        name: 'Why Walk? Portal',
        icon: '🌀',
        cd: 18,
        mana: 60,
        color: '#38BDF8',
        desc: 'Open Beacon shortcut and gain shield.'
    },
    lunox: {
        name: 'Power of Chaos',
        icon: '🌗',
        cd: 8,
        mana: 50,
        color: '#F472B6',
        desc: 'Channel Order/Chaos brilliance burst.'
    }
};
function isFourSkillHero(heroId) {
    return Boolean(FOUR_SKILL_HERO_META[heroId]);
}
var CYCLONE_EYES = [
    {
        id: 'ce_blue_top',
        x: 740,
        y: 2420
    },
    {
        id: 'ce_blue_bot',
        x: 1580,
        y: 3260
    },
    {
        id: 'ce_red_top',
        x: 2420,
        y: 740
    },
    {
        id: 'ce_red_bot',
        x: 3260,
        y: 1580
    }
];
var FLYING_CLOUD_BLUE = {
    x: 460,
    y: 3640,
    radius: 75
};
function createJungleCampSpecs(expLane) {
    var turtlePit = expLane === 'top' ? {
        x: 1280,
        y: 1280
    } : {
        x: 2720,
        y: 2720
    };
    var lordPit = expLane === 'top' ? {
        x: 2720,
        y: 2720
    } : {
        x: 1280,
        y: 1280
    };
    return [
        // Blue Jungle
        {
            id: 'blue_orange',
            kind: 'orange_buff',
            teamSide: 'blue',
            name: 'Molten Fiend',
            icon: '🟠',
            x: 2280,
            y: 3050,
            firstSpawnSec: MLBB_TIMERS.ORANGE_FIRST_SPAWN,
            respawnSec: MLBB_TIMERS.BUFF_RESPAWN,
            baseHp: 2150,
            baseAtk: 78,
            gold: 115,
            exp: 240,
            leashRadius: 270,
            color: '#F97316'
        },
        {
            id: 'blue_purple',
            kind: 'purple_buff',
            teamSide: 'blue',
            name: 'Thunder Fenrir',
            icon: '🟣',
            x: 1150,
            y: 2150,
            firstSpawnSec: MLBB_TIMERS.PURPLE_FIRST_SPAWN,
            respawnSec: MLBB_TIMERS.BUFF_RESPAWN,
            baseHp: 2150,
            baseAtk: 76,
            gold: 115,
            exp: 240,
            leashRadius: 270,
            color: '#A855F7'
        },
        {
            id: 'blue_lizard',
            kind: 'horned_lizard',
            teamSide: 'blue',
            name: 'Rockursa',
            icon: '🐻',
            x: 900,
            y: 1700,
            firstSpawnSec: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN,
            respawnSec: MLBB_TIMERS.SMALL_CAMP_RESPAWN,
            baseHp: 1350,
            baseAtk: 56,
            gold: 75,
            exp: 165,
            leashRadius: 230,
            color: '#2CE58B'
        },
        {
            id: 'blue_golem',
            kind: 'lava_golem',
            teamSide: 'blue',
            name: 'Fiend',
            icon: '👹',
            x: 1750,
            y: 2850,
            firstSpawnSec: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN,
            respawnSec: MLBB_TIMERS.SMALL_CAMP_RESPAWN,
            baseHp: 1420,
            baseAtk: 58,
            gold: 80,
            exp: 170,
            leashRadius: 230,
            color: '#FB923C'
        },
        {
            id: 'blue_beetle',
            kind: 'fire_beetle',
            teamSide: 'blue',
            name: 'Beetle',
            icon: '🪲',
            x: 2700,
            y: 3350,
            firstSpawnSec: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN,
            respawnSec: MLBB_TIMERS.SMALL_CAMP_RESPAWN,
            baseHp: 1280,
            baseAtk: 52,
            gold: 70,
            exp: 160,
            leashRadius: 230,
            color: '#FACC15'
        },
        {
            id: 'blue_crammer',
            kind: 'crammer',
            teamSide: 'blue',
            name: 'Crammer',
            icon: '🦎',
            x: 840,
            y: 2560,
            firstSpawnSec: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN,
            respawnSec: MLBB_TIMERS.SMALL_CAMP_RESPAWN,
            baseHp: 1300,
            baseAtk: 54,
            gold: 74,
            exp: 162,
            leashRadius: 230,
            color: '#38BDF8'
        },
        // Red Jungle Mirrors
        {
            id: 'red_orange',
            kind: 'orange_buff',
            teamSide: 'red',
            name: 'Molten Fiend',
            icon: '🟠',
            x: 1720,
            y: 950,
            firstSpawnSec: MLBB_TIMERS.ORANGE_FIRST_SPAWN,
            respawnSec: MLBB_TIMERS.BUFF_RESPAWN,
            baseHp: 2150,
            baseAtk: 78,
            gold: 115,
            exp: 240,
            leashRadius: 270,
            color: '#F97316'
        },
        {
            id: 'red_purple',
            kind: 'purple_buff',
            teamSide: 'red',
            name: 'Thunder Fenrir',
            icon: '🟣',
            x: 2850,
            y: 1850,
            firstSpawnSec: MLBB_TIMERS.PURPLE_FIRST_SPAWN,
            respawnSec: MLBB_TIMERS.BUFF_RESPAWN,
            baseHp: 2150,
            baseAtk: 76,
            gold: 115,
            exp: 240,
            leashRadius: 270,
            color: '#A855F7'
        },
        {
            id: 'red_lizard',
            kind: 'horned_lizard',
            teamSide: 'red',
            name: 'Rockursa',
            icon: '🐻',
            x: 3100,
            y: 2300,
            firstSpawnSec: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN,
            respawnSec: MLBB_TIMERS.SMALL_CAMP_RESPAWN,
            baseHp: 1350,
            baseAtk: 56,
            gold: 75,
            exp: 165,
            leashRadius: 230,
            color: '#2CE58B'
        },
        {
            id: 'red_golem',
            kind: 'lava_golem',
            teamSide: 'red',
            name: 'Fiend',
            icon: '👹',
            x: 2250,
            y: 1150,
            firstSpawnSec: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN,
            respawnSec: MLBB_TIMERS.SMALL_CAMP_RESPAWN,
            baseHp: 1420,
            baseAtk: 58,
            gold: 80,
            exp: 170,
            leashRadius: 230,
            color: '#FB923C'
        },
        {
            id: 'red_beetle',
            kind: 'fire_beetle',
            teamSide: 'red',
            name: 'Beetle',
            icon: '🪲',
            x: 1300,
            y: 650,
            firstSpawnSec: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN,
            respawnSec: MLBB_TIMERS.SMALL_CAMP_RESPAWN,
            baseHp: 1280,
            baseAtk: 52,
            gold: 70,
            exp: 160,
            leashRadius: 230,
            color: '#FACC15'
        },
        {
            id: 'red_crammer',
            kind: 'crammer',
            teamSide: 'red',
            name: 'Crammer',
            icon: '🦎',
            x: 3160,
            y: 1440,
            firstSpawnSec: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN,
            respawnSec: MLBB_TIMERS.SMALL_CAMP_RESPAWN,
            baseHp: 1300,
            baseAtk: 54,
            gold: 74,
            exp: 162,
            leashRadius: 230,
            color: '#38BDF8'
        },
        // River Objectives & Camps
        {
            id: 'river_litho',
            kind: 'litho',
            teamSide: 'river',
            name: 'Lithowanderer',
            icon: '🌿',
            x: 1620,
            y: 1620,
            firstSpawnSec: MLBB_TIMERS.LITHO_FIRST_SPAWN,
            respawnSec: MLBB_TIMERS.LITHO_RESPAWN,
            baseHp: 1200,
            baseAtk: 42,
            gold: 85,
            exp: 160,
            leashRadius: 240,
            color: '#2DD4BF'
        },
        {
            id: 'river_crab_top',
            kind: 'crab',
            teamSide: 'river',
            name: 'Sanctum Crab',
            icon: '🦀',
            x: 580,
            y: 580,
            firstSpawnSec: MLBB_TIMERS.CRAB_FIRST_SPAWN,
            respawnSec: MLBB_TIMERS.CRAB_SMALL_RESPAWN,
            baseHp: 980,
            baseAtk: 44,
            gold: 95,
            exp: 120,
            leashRadius: 220,
            color: '#FACC15'
        },
        {
            id: 'river_crab_bot',
            kind: 'crab',
            teamSide: 'river',
            name: 'Sanctum Crab',
            icon: '🦀',
            x: 3420,
            y: 3420,
            firstSpawnSec: MLBB_TIMERS.CRAB_FIRST_SPAWN,
            respawnSec: MLBB_TIMERS.CRAB_SMALL_RESPAWN,
            baseHp: 980,
            baseAtk: 44,
            gold: 95,
            exp: 120,
            leashRadius: 220,
            color: '#FACC15'
        },
        {
            id: 'river_turtle',
            kind: 'turtle',
            teamSide: 'river',
            name: 'Turtle',
            icon: '🐢',
            x: turtlePit.x,
            y: turtlePit.y,
            firstSpawnSec: MLBB_TIMERS.TURTLE_FIRST_SPAWN,
            respawnSec: MLBB_TIMERS.TURTLE_RESPAWN,
            baseHp: 4600,
            baseAtk: 110,
            gold: 220,
            exp: 420,
            leashRadius: 310,
            color: '#2CE58B'
        },
        {
            id: 'river_lord',
            kind: 'lord',
            teamSide: 'river',
            name: 'Sanctuary Lord',
            icon: '🐉',
            x: lordPit.x,
            y: lordPit.y,
            firstSpawnSec: MLBB_TIMERS.LORD_STAGE1_SPAWN,
            respawnSec: MLBB_TIMERS.LORD_RESPAWN_EARLY,
            baseHp: 8200,
            baseAtk: 175,
            gold: 360,
            exp: 600,
            leashRadius: 340,
            color: '#F59E0B'
        }
    ];
}
var LANE_WAYPOINTS = {
    top: [
        {
            x: 480,
            y: 3320
        },
        {
            x: 420,
            y: 2350
        },
        {
            x: 420,
            y: 1200
        },
        {
            x: 480,
            y: 480
        },
        {
            x: 1580,
            y: 420
        },
        {
            x: 2650,
            y: 420
        },
        {
            x: 3480,
            y: 520
        }
    ],
    mid: [
        {
            x: 640,
            y: 3360
        },
        {
            x: 1320,
            y: 2680
        },
        {
            x: 2000,
            y: 2000
        },
        {
            x: 2680,
            y: 1320
        },
        {
            x: 3480,
            y: 520
        }
    ],
    bot: [
        {
            x: 680,
            y: 3520
        },
        {
            x: 1650,
            y: 3580
        },
        {
            x: 2800,
            y: 3580
        },
        {
            x: 3520,
            y: 3520
        },
        {
            x: 3580,
            y: 2420
        },
        {
            x: 3580,
            y: 1350
        },
        {
            x: 3480,
            y: 520
        }
    ]
};
function isPointInBush(x, y, variant) {
    var bushes = getActiveMapBushes(variant);
    for(var _iterator = _create_for_of_iterator_helper_loose(bushes), _step; !(_step = _iterator()).done;){
        var b = _step.value;
        var dx = x - b.cx;
        var dy = y - b.cy;
        var cos = Math.cos(-b.angle);
        var sin = Math.sin(-b.angle);
        var lx = dx * cos - dy * sin;
        var ly = dx * sin + dy * cos;
        if (lx * lx / (b.rx * b.rx) + ly * ly / (b.ry * b.ry) <= 1) {
            return b;
        }
    }
    return null;
}
function formatClock(sec) {
    var s = Math.max(0, Math.floor(sec));
    var m = Math.floor(s / 60);
    var rem = s % 60;
    return String(m).padStart(2, '0') + ":" + String(rem).padStart(2, '0');
}

});

})(window.ArcadeMod);
