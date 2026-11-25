import { MlbbHeroDef, MlbbItemDef, MlbbItemStats } from '../types';
import { resolveUniqueItemPassives } from '../engine/CombatMath';

/**
 * COMPLETE MLBB EQUIPMENT DATABASE (2026 COMPLETE — 103 ITEMS):
 * - 16 Tier-1 Basic Components
 * - 19 Tier-2 Intermediate Components
 * - 19 Tier-3 Attack Items
 * - 15 Tier-3 Magic Items
 * - 14 Tier-3 Defense Items
 * - 7 Tier-2 Movement Boots
 * - 3 Jungling Boot Blessings
 * - 4 Roaming Boot Blessings
 * - 3 Late-Game Consumable Potions
 * - 3 Hero-Unique Equipment Items
 */
export const MLBB_ITEMS: MlbbItemDef[] = [
  // ================= A. TIER-1 BASIC COMPONENTS (16 ITEMS) =================
  { id: 'dagger', name: 'Dagger', shortName: 'Dagger', icon: '🗡️', category: 'attack', tier: 1, cost: 250, recipe: [], stats: { physAtk: 15 } },
  { id: 'knife', name: 'Knife', shortName: 'Knife', icon: '🔪', category: 'attack', tier: 1, cost: 280, recipe: [], stats: { atkSpdPct: 10 } },
  { id: 'javelin', name: 'Javelin', shortName: 'Javelin', icon: '🎯', category: 'attack', tier: 1, cost: 320, recipe: [], stats: { critChance: 8 } },
  { id: 'vampire_mallet', name: 'Vampire Mallet', shortName: 'Mallet', icon: '🩸', category: 'attack', tier: 1, cost: 400, recipe: ['dagger'], stats: { physAtk: 8, lifestealPct: 8 } },
  { id: 'iron_hunting_bow', name: 'Iron Hunting Bow', shortName: 'Hunt Bow', icon: '🏹', category: 'attack', tier: 1, cost: 450, recipe: ['dagger'], stats: { physAtk: 10, cdrPct: 5 } },
  { id: 'expert_gloves', name: 'Expert Gloves', shortName: 'Gloves', icon: '🧤', category: 'attack', tier: 1, cost: 500, recipe: [], stats: { adaptiveAtk: 30 } },
  { id: 'magic_necklace', name: 'Magic Necklace', shortName: 'Necklace', icon: '📿', category: 'magic', tier: 1, cost: 120, recipe: [], stats: { manaRegen: 2 } },
  { id: 'power_crystal', name: 'Power Crystal', shortName: 'P.Crystal', icon: '💎', category: 'magic', tier: 1, cost: 220, recipe: [], stats: { maxMana: 280 } },
  { id: 'mystery_codex', name: 'Mystery Codex', shortName: 'Codex', icon: '📘', category: 'magic', tier: 1, cost: 300, recipe: [], stats: { magicPow: 15 } },
  { id: 'book_of_sages', name: 'Book of Sages', shortName: 'Sages', icon: '📖', category: 'magic', tier: 1, cost: 450, recipe: ['magic_necklace'], stats: { magicPow: 8, cdrPct: 5 } },
  { id: 'healing_necklace', name: 'Healing Necklace', shortName: 'Heal Neck', icon: '💚', category: 'defense', tier: 1, cost: 140, recipe: [], stats: { hpRegen: 4 } },
  { id: 'leather_jerkin', name: 'Leather Jerkin', shortName: 'Jerkin', icon: '🦺', category: 'defense', tier: 1, cost: 220, recipe: [], stats: { physDef: 14 } },
  { id: 'magic_resist_cloak', name: 'Magic Resist Cloak', shortName: 'Cloak', icon: '🧥', category: 'defense', tier: 1, cost: 220, recipe: [], stats: { magicDef: 14 } },
  { id: 'vitality_crystal', name: 'Vitality Crystal', shortName: 'Vitality', icon: '❤️', category: 'defense', tier: 1, cost: 300, recipe: [], stats: { maxHp: 230 } },
  { id: 'heros_ring', name: "Hero's Ring", shortName: 'Hero Ring', icon: '💍', category: 'defense', tier: 1, cost: 450, recipe: ['vitality_crystal'], stats: { maxHp: 150, cdrPct: 5 } },
  { id: 'boots', name: 'Boots', shortName: 'Boots', icon: '👢', category: 'movement', tier: 1, cost: 250, recipe: [], stats: { moveSpd: 20 } },

  // ================= B. TIER-2 INTERMEDIATE COMPONENTS (19 ITEMS) =================
  { id: 'regular_spear', name: 'Regular Spear', shortName: 'Reg Spear', icon: '🔱', category: 'attack', tier: 2, cost: 600, recipe: ['dagger', 'knife'], stats: { physAtk: 20, atkSpdPct: 10 } },
  {
    id: 'ogre_tomahawk', name: 'Ogre Tomahawk', shortName: 'Tomahawk', icon: '🪓', category: 'attack', tier: 2, cost: 650,
    recipe: ['dagger', 'vitality_crystal'], stats: { physAtk: 25, maxHp: 230 },
    uniquePassives: ['Crisis'], passiveName: 'Crisis', passiveDesc: 'Dealing damage grants +10% Movement Speed for 2s (4s CD).'
  },
  { id: 'fury_hammer', name: 'Fury Hammer', shortName: 'Fury Ham', icon: '🔨', category: 'attack', tier: 2, cost: 830, recipe: ['dagger', 'dagger'], stats: { physAtk: 35, flatPhysPen: 12 } },
  { id: 'rogue_meteor', name: 'Rogue Meteor', shortName: 'Rogue Met', icon: '☄️', category: 'attack', tier: 2, cost: 900, recipe: ['dagger', 'knife', 'javelin'], stats: { physAtk: 15, atkSpdPct: 10, critChance: 10 } },
  { id: 'legion_sword', name: 'Legion Sword', shortName: 'Legion', icon: '⚔️', category: 'attack', tier: 2, cost: 910, recipe: ['dagger', 'dagger'], stats: { physAtk: 60 } },
  {
    id: 'swift_crossbow', name: 'Swift Crossbow', shortName: 'Crossbow', icon: '🏹', category: 'attack', tier: 2, cost: 1000,
    recipe: ['knife', 'knife'], stats: { atkSpdPct: 20 },
    uniquePassives: ['Crossbow', 'Impulse'], passiveName: 'Crossbow / Impulse', passiveDesc: 'Basic Attacks deal +40 bonus damage and stack +3% ATK Speed up to 5x.'
  },
  {
    id: 'magic_blade', name: 'Magic Blade', shortName: 'Magic Bld', icon: '💠', category: 'attack', tier: 2, cost: 1150,
    recipe: ['dagger', 'magic_resist_cloak'], stats: { physAtk: 40, magicDef: 18 },
    uniquePassives: ['Lifeline'], passiveName: 'Lifeline', passiveDesc: 'Dropping below 30% HP grants 400 (+30*Lv) Shield and +50% decaying MS (60s CD).'
  },
  { id: 'mystic_container', name: 'Mystic Container', shortName: 'Mystic', icon: '🏺', category: 'magic', tier: 2, cost: 500, recipe: ['mystery_codex'], stats: { magicPow: 15, spellVampPct: 8 } },
  {
    id: 'azure_blade', name: 'Azure Blade', shortName: 'Azure Bld', icon: '🔷', category: 'magic', tier: 2, cost: 600,
    recipe: ['magic_necklace'], stats: { maxMana: 50, cdrPct: 5 },
    uniquePassives: ['Judgment'], passiveName: 'Judgment', passiveDesc: 'Next Basic Attack after skill deals +50 (+60% Magic Power) True Damage.'
  },
  { id: 'exotic_veil', name: 'Exotic Veil', shortName: 'Veil', icon: '🧣', category: 'magic', tier: 2, cost: 600, recipe: ['mystery_codex'], stats: { magicPow: 30, moveSpdPct: 5 } },
  {
    id: 'elegant_gem', name: 'Elegant Gem', shortName: 'Eleg. Gem', icon: '💠', category: 'magic', tier: 2, cost: 700,
    recipe: ['power_crystal', 'vitality_crystal'], stats: { maxHp: 300, maxMana: 380 },
    uniquePassives: ['Gift'], passiveName: 'Gift', passiveDesc: 'Leveling up restores 20% Max HP and 20% Max Mana over 2s.'
  },
  { id: 'magic_wand', name: 'Magic Wand', shortName: 'Wand', icon: '🪄', category: 'magic', tier: 2, cost: 820, recipe: ['mystery_codex'], stats: { magicPow: 45 } },
  { id: 'tome_of_evil', name: 'Tome of Evil', shortName: 'Evil Tome', icon: '📕', category: 'magic', tier: 2, cost: 950, recipe: ['mystery_codex', 'book_of_sages'], stats: { magicPow: 35, cdrPct: 8, manaRegen: 20 } },
  {
    id: 'black_ice_shield', name: 'Black Ice Shield', shortName: 'Ice Shld', icon: '🧊', category: 'defense', tier: 2, cost: 620,
    recipe: ['leather_jerkin', 'magic_resist_cloak'], stats: { physDef: 20, magicDef: 20 },
    uniquePassives: ['Arctic Cold'], passiveName: 'Arctic Cold', passiveDesc: 'Reduces nearby enemies Attack Speed by 10%.'
  },
  { id: 'steel_legplates', name: 'Steel Legplates', shortName: 'Legplates', icon: '🦿', category: 'defense', tier: 2, cost: 630, recipe: ['leather_jerkin', 'leather_jerkin'], stats: { physDef: 35 } },
  { id: 'ares_belt', name: 'Ares Belt', shortName: 'Ares Belt', icon: '🥋', category: 'defense', tier: 2, cost: 700, recipe: ['vitality_crystal', 'vitality_crystal'], stats: { maxHp: 600 } },
  {
    id: 'dreadnaught_armor', name: 'Dreadnaught Armor', shortName: 'Dreadnaught', icon: '🛡️', category: 'defense', tier: 2, cost: 730,
    recipe: ['leather_jerkin', 'vitality_crystal'], stats: { physDef: 30 },
    uniquePassives: ['Deter'], passiveName: 'Deter', passiveDesc: 'Enemy skill hits reduce attacker Phys ATK by 4% up to 3 stacks.'
  },
  {
    id: 'molten_essence', name: 'Molten Essence', shortName: 'Molten', icon: '🔥', category: 'defense', tier: 2, cost: 800,
    recipe: ['vitality_crystal', 'vitality_crystal'], stats: { maxHp: 540 },
    uniquePassives: ['Burning Soul'], passiveName: 'Burning Soul', passiveDesc: 'Deals 0.6% Max HP Magic DPS to nearby enemies (+100% vs minions/creeps).'
  },
  { id: 'silence_robe', name: 'Silence Robe', shortName: 'Sil. Robe', icon: '🧥', category: 'defense', tier: 2, cost: 1020, recipe: ['magic_resist_cloak', 'vitality_crystal'], stats: { magicDef: 30, maxHp: 540 } },

  // ================= C. ALL 19 TIER-3 ATTACK ITEMS =================
  {
    id: 'blade_of_despair', name: 'Blade of Despair', shortName: 'BoD', icon: '⚔️', category: 'attack', tier: 3, cost: 3010,
    recipe: ['legion_sword', 'legion_sword', 'dagger'], stats: { physAtk: 160, moveSpdPct: 5 },
    uniquePassives: ['Despair'], passiveName: 'Despair', passiveDesc: 'Attacking enemies below 50% HP grants +25% Physical Attack for 2s.'
  },
  {
    id: 'malefic_roar', name: 'Malefic Roar', shortName: 'Malefic', icon: '🔫', category: 'attack', tier: 3, cost: 2060,
    recipe: ['legion_sword', 'dagger'], stats: { physAtk: 60, pctPhysPen: 0.3 },
    uniquePassives: ['Armor Buster', 'Breaker'], passiveName: 'Armor Buster / Breaker', passiveDesc: '+30% Phys PEN plus +0.1% per enemy Phys DEF (up to 60% total PEN).'
  },
  {
    id: 'malefic_gun', name: 'Malefic Gun', shortName: 'M.Gun', icon: '🔫', category: 'attack', tier: 3, cost: 2120,
    recipe: ['regular_spear', 'dagger'], stats: { physAtk: 40, atkSpdPct: 20, pctPhysPen: 0.3 },
    uniquePassives: ['Armor Buster', 'Malefic Energy'], passiveName: 'Armor Buster / Malefic Energy', passiveDesc: '+30% Phys PEN (non-stacking with Malefic Roar), +12% Basic Attack range & +10% MS on hit.'
  },
  {
    id: 'berserkers_fury', name: "Berserker's Fury", shortName: 'B.Fury', icon: '🪓', category: 'attack', tier: 3, cost: 2390,
    recipe: ['rogue_meteor', 'legion_sword'], stats: { physAtk: 65, critChance: 25, critDmgPct: 40 },
    uniquePassives: ['Doom'], passiveName: 'Doom', passiveDesc: '+40% Crit Damage. Critical hits increase Physical Attack by +5% for 2s.'
  },
  {
    id: 'windtalker', name: 'Windtalker', shortName: 'Windtalker', icon: '🌪️', category: 'attack', tier: 3, cost: 1880,
    recipe: ['rogue_meteor', 'knife'], stats: { atkSpdPct: 35, critChance: 20, moveSpd: 20 },
    uniquePassives: ['Typhoon', 'Activate'], passiveName: 'Typhoon', passiveDesc: 'Every 5s–2s, Basic Attack triggers chain lightning hitting up to 3 foes for 150–362 Magic Damage.'
  },
  {
    id: 'haas_claws', name: "Haas's Claws", shortName: 'Haas', icon: '🩸', category: 'attack', tier: 3, cost: 2020,
    recipe: ['rogue_meteor', 'vampire_mallet'], stats: { physAtk: 40, atkSpdPct: 15, critChance: 20, lifestealPct: 25 },
    uniquePassives: ['Frenzy'], passiveName: 'Frenzy', passiveDesc: '+25% Lifesteal. Critical hits grant +20% Attack Speed for 2s.'
  },
  {
    id: 'demon_hunter_sword', name: 'Demon Hunter Sword', shortName: 'DHS', icon: '🗡️', category: 'attack', tier: 3, cost: 2180,
    recipe: ['regular_spear', 'vampire_mallet'], stats: { physAtk: 35, atkSpdPct: 20, lifestealPct: 8 },
    uniquePassives: ['Devour'], passiveName: 'Devour', passiveDesc: 'Basic Attacks deal 8% target Current HP bonus Phys Damage & stack +3% Lifesteal (5x).'
  },
  {
    id: 'corrosion_scythe', name: 'Corrosion Scythe', shortName: 'Corrosion', icon: '🧪', category: 'attack', tier: 3, cost: 2050,
    recipe: ['swift_crossbow', 'regular_spear'], stats: { physAtk: 30, atkSpdPct: 30, moveSpdPct: 5 },
    uniquePassives: ['Corrosive', 'Impulse'], passiveName: 'Corrosive / Impulse', passiveDesc: 'Basic Attacks deal +80 bonus Phys Dmg, slow up to 40%, and stack +6% ATK Speed (5x).'
  },
  {
    id: 'golden_staff', name: 'Golden Staff', shortName: 'G.Staff', icon: '🥢', category: 'attack', tier: 3, cost: 2000,
    recipe: ['swift_crossbow', 'regular_spear'], stats: { physAtk: 55, atkSpdPct: 15 },
    uniquePassives: ['Swift', 'Endless Strike'], passiveName: 'Swift / Endless Strike', passiveDesc: 'Converts Crit Chance into ATK Speed; every 3rd Basic Attack triggers on-hit effects 3x.'
  },
  {
    id: 'endless_battle', name: 'Endless Battle', shortName: 'Endless', icon: '⚡', category: 'attack', tier: 3, cost: 2470,
    recipe: ['azure_blade', 'ogre_tomahawk', 'vampire_mallet'], stats: { physAtk: 60, maxHp: 250, cdrPct: 10, lifestealPct: 8, spellVampPct: 8, moveSpdPct: 5, manaRegen: 5 },
    uniquePassives: ['Divine Justice', 'Chase Fate'], passiveName: 'Divine Justice', passiveDesc: 'After casting a skill, next Basic Attack deals +60% Total Phys ATK True Damage (stacks with Crisis!).'
  },
  {
    id: 'war_axe', name: 'War Axe', shortName: 'War Axe', icon: '🪓', category: 'attack', tier: 3, cost: 2100,
    recipe: ['ogre_tomahawk', 'iron_hunting_bow'], stats: { physAtk: 35, maxHp: 400, cdrPct: 10, spellVampPct: 12 },
    uniquePassives: ['Fighting Spirit'], passiveName: 'Fighting Spirit', passiveDesc: 'Dealing damage stacks +12 Phys ATK (6x = +72); at max stacks deals +10% extra True Damage.'
  },
  {
    id: 'hunter_strike', name: 'Hunter Strike', shortName: 'Hunter', icon: '🦅', category: 'attack', tier: 3, cost: 2010,
    recipe: ['fury_hammer', 'iron_hunting_bow'], stats: { physAtk: 80, cdrPct: 10, flatPhysPen: 15 },
    uniquePassives: ['Retribution'], passiveName: 'Retribution', passiveDesc: 'Dealing damage 5 times grants +50% decaying Movement Speed for 3s (8s CD).'
  },
  {
    id: 'blade_of_heptaseas', name: 'Blade of the Heptaseas', shortName: 'Heptaseas', icon: '🔱', category: 'attack', tier: 3, cost: 1950,
    recipe: ['fury_hammer', 'vitality_crystal'], stats: { physAtk: 70, maxHp: 250, flatPhysPen: 15 },
    uniquePassives: ['Ambush'], passiveName: 'Ambush', passiveDesc: 'Out of combat 5s: next Basic Attack deals 160 (+40% Total Phys ATK) bonus damage & 40% slow.'
  },
  {
    id: 'sea_halberd', name: 'Sea Halberd', shortName: 'Halberd', icon: '🔱', category: 'attack', tier: 3, cost: 2050,
    recipe: ['legion_sword', 'regular_spear'], stats: { physAtk: 80, atkSpdPct: 20 },
    antiHeal: true, uniquePassives: ['Lifebane', 'Punish'], passiveName: 'Lifebane / Punish', passiveDesc: 'Cuts target Shield & HP Regen by 50% (Lifebane non-stacking) & deals +8% damage to higher-HP heroes.'
  },
  {
    id: 'wind_of_nature', name: 'Wind of Nature', shortName: 'WoN', icon: '🍃', category: 'attack', tier: 3, cost: 1910,
    recipe: ['regular_spear', 'vampire_mallet', 'dagger'], stats: { physAtk: 30, atkSpdPct: 20, lifestealPct: 10 },
    activeName: 'Wind Chant', activeCd: 70, activeKind: 'wind_chant',
    uniquePassives: ['Wind Chant'], passiveName: 'Wind Chant (Active)', passiveDesc: '100% Immune to all Physical Damage for 2s (1s for non-Marksmen).'
  },
  {
    id: 'rose_gold_meteor', name: 'Rose Gold Meteor', shortName: 'Rose Gold', icon: '🌹', category: 'attack', tier: 3, cost: 1820,
    recipe: ['magic_blade', 'vampire_mallet'], stats: { physAtk: 40, atkSpdPct: 20, lifestealPct: 10 },
    uniquePassives: ['Dragon Scale', 'Lifeline'], passiveName: 'Lifeline / Dragon Scale', passiveDesc: 'Dropping below 30% HP grants 840 (+35*Lv) Shield + 50% decaying MS (60s CD).'
  },
  {
    id: 'great_dragon_spear', name: 'Great Dragon Spear', shortName: 'Dragon Sp', icon: '🐉', category: 'attack', tier: 3, cost: 2140,
    recipe: ['legion_sword', 'iron_hunting_bow', 'javelin'], stats: { physAtk: 70, cdrPct: 10, critChance: 20 },
    uniquePassives: ['Supreme Warrior'], passiveName: 'Supreme Warrior', passiveDesc: 'Casting Ultimate grants +30% Movement Speed for 7.5s (15s CD).'
  },
  {
    id: 'sky_piercer', name: 'Sky Piercer', shortName: 'Sky Piercer', icon: '🌠', category: 'attack', tier: 3, cost: 1500,
    recipe: ['expert_gloves', 'expert_gloves'], stats: { adaptiveAtk: 60, moveSpd: 15 },
    execute: true, uniquePassives: ['Lethality'], passiveName: 'Lethality', passiveDesc: 'Instantly executes enemies below 4%–12% HP; +10 stacks per kill (max 80 stacks).'
  },
  {
    id: 'fleeting_time', name: 'Fleeting Time', shortName: 'Fleeting', icon: '⏳', category: 'attack', tier: 3, cost: 2050,
    recipe: ['expert_gloves', 'heros_ring', 'vitality_crystal'], stats: { adaptiveAtk: 30, maxHp: 600, cdrPct: 15 },
    uniquePassives: ['Timestream'], passiveName: 'Timestream', passiveDesc: 'Hero kills or assists reduce current Ultimate cooldown by 30%.'
  },

  // ================= D. ALL 15 TIER-3 MAGIC ITEMS =================
  {
    id: 'holy_crystal', name: 'Holy Crystal', shortName: 'Holy Crys', icon: '💎', category: 'magic', tier: 3, cost: 3000,
    recipe: ['magic_wand', 'magic_wand', 'mystery_codex'], stats: { magicPow: 185 },
    uniquePassives: ['Mystery'], passiveName: 'Mystery', passiveDesc: 'Increases total Magic Power by +21% to +35% scaling with level.'
  },
  {
    id: 'divine_glaive', name: 'Divine Glaive', shortName: 'Glaive', icon: '🔮', category: 'magic', tier: 3, cost: 1970,
    recipe: ['magic_wand', 'mystery_codex'], stats: { magicPow: 60, pctMagicPen: 0.4 },
    uniquePassives: ['Spellbreaker'], passiveName: 'Spellbreaker', passiveDesc: '+40% Magic PEN plus +0.1% per point of enemy Magic DEF (up to 60%).'
  },
  {
    id: 'genius_wand', name: 'Genius Wand', shortName: 'Genius', icon: '🪄', category: 'magic', tier: 3, cost: 2000,
    recipe: ['magic_wand', 'exotic_veil'], stats: { magicPow: 75, moveSpdPct: 5, flatMagicPen: 10 },
    uniquePassives: ['Magic'], passiveName: 'Magic', passiveDesc: 'Magic Damage shreds target Magic DEF by -3 to -7 per stack (max 3 stacks).'
  },
  {
    id: 'glowing_wand', name: 'Glowing Wand', shortName: 'Glowing', icon: '🔥', category: 'magic', tier: 3, cost: 2150,
    recipe: ['magic_wand', 'exotic_veil', 'vitality_crystal'], stats: { magicPow: 75, maxHp: 400, moveSpdPct: 5 },
    antiHeal: true, uniquePassives: ['Scorch', 'Lifebane'], passiveName: 'Scorch / Lifebane', passiveDesc: 'Burns enemies for 1.5% Max HP/s (3s) & cuts Shield/HP Regen by 50% (Lifebane).'
  },
  {
    id: 'wishing_lantern', name: 'Wishing Lantern', shortName: 'Lantern', icon: '🏮', category: 'magic', tier: 3, cost: 2250,
    recipe: ['magic_wand', 'book_of_sages', 'power_crystal'], stats: { magicPow: 75, maxMana: 400, cdrPct: 10 },
    uniquePassives: ['Butterfly Goddess'], passiveName: 'Butterfly Goddess', passiveDesc: 'Every 800 Magic Damage summons a Butterfly dealing 8% target Current HP Magic Damage.'
  },
  {
    id: 'lightning_truncheon', name: 'Lightning Truncheon', shortName: 'LT', icon: '⚡', category: 'magic', tier: 3, cost: 2250,
    recipe: ['magic_wand', 'power_crystal', 'mystery_codex'], stats: { magicPow: 75, maxMana: 400, cdrPct: 10 },
    uniquePassives: ['Resonate'], passiveName: 'Resonate', passiveDesc: 'Every 6s, skill echoes lightning to 3 foes for 120% Magic Power & +30% MS.'
  },
  {
    id: 'clock_of_destiny', name: 'Clock of Destiny', shortName: 'CoD', icon: '🕰️', category: 'magic', tier: 3, cost: 1950,
    recipe: ['elegant_gem', 'book_of_sages'], stats: { magicPow: 45, maxHp: 400, maxMana: 800, cdrPct: 10 },
    uniquePassives: ['Destiny', 'Gift'], passiveName: 'Destiny / Gift', passiveDesc: 'Magic Damage stacks Hybrid DEF (6x); dropping <50% HP/Mana restores 15% over 3s.'
  },
  {
    id: 'enchanted_talisman', name: 'Enchanted Talisman', shortName: 'Book', icon: '📖', category: 'magic', tier: 3, cost: 1870,
    recipe: ['tome_of_evil', 'book_of_sages', 'vitality_crystal'], stats: { magicPow: 50, maxHp: 250, cdrPct: 20 },
    uniquePassives: ['Mana Spring', 'Magic Mastery'], passiveName: 'Mana Spring / Magic Mastery', passiveDesc: 'Regenerates 15% Max Mana every 10s & raises maximum CDR cap to 45%.'
  },
  {
    id: 'ice_queen_wand', name: 'Ice Queen Wand', shortName: 'IQW', icon: '❄️', category: 'magic', tier: 3, cost: 2040,
    recipe: ['mystic_container', 'exotic_veil', 'vitality_crystal'], stats: { magicPow: 75, spellVampPct: 10, maxHp: 300, moveSpdPct: 7 },
    uniquePassives: ['Ice Bound'], passiveName: 'Ice Bound', passiveDesc: 'Damaging skills slow enemy heroes by 10% (stacks 3x = 30% slow).'
  },
  {
    id: 'concentrated_energy', name: 'Concentrated Energy', shortName: 'Conc.En', icon: '🟣', category: 'magic', tier: 3, cost: 2020,
    recipe: ['mystic_container', 'elegant_gem'], stats: { magicPow: 70, maxHp: 400, lifestealPct: 20, spellVampPct: 20 },
    uniquePassives: ['Recharge'], passiveName: 'Recharge', passiveDesc: '+20% Hybrid Lifesteal. Stacks +5 Magic Power (6x) & +12% Magic Damage at max stacks.'
  },
  {
    id: 'feather_of_heaven', name: 'Feather of Heaven', shortName: 'Feather', icon: '🪶', category: 'magic', tier: 3, cost: 2030,
    recipe: ['swift_crossbow', 'book_of_sages'], stats: { magicPow: 55, atkSpdPct: 20, lifestealPct: 10, cdrPct: 5 },
    uniquePassives: ['Affliction', 'Impulse'], passiveName: 'Affliction / Impulse', passiveDesc: 'Basic Attacks deal 50 (+30% Magic) bonus Magic Damage & stack +6% ATK Speed (5x).'
  },
  {
    id: 'starlium_scythe', name: 'Starlium Scythe', shortName: 'Starlium', icon: '🌙', category: 'magic', tier: 3, cost: 2220,
    recipe: ['azure_blade', 'mystic_container', 'book_of_sages'], stats: { magicPow: 70, cdrPct: 10, lifestealPct: 8, spellVampPct: 8, manaRegen: 6 },
    uniquePassives: ['Crisis'], passiveName: 'Crisis', passiveDesc: 'Next Basic Attack after skill deals 100 (+100% Magic) True Damage & +10% MS (stacks with Divine Justice!).'
  },
  {
    id: 'blood_wings', name: 'Blood Wings', shortName: 'B.Wings', icon: '🦇', category: 'magic', tier: 3, cost: 2100,
    recipe: ['magic_wand', 'magic_wand'], stats: { magicPow: 90 },
    uniquePassives: ['Guard'], passiveName: 'Guard', passiveDesc: 'Grants 800 (+100% Magic Power) regenerating Shield & +30 MS while active.'
  },
  {
    id: 'winter_crown', name: 'Winter Crown', shortName: 'W.Crown', icon: '👑', category: 'magic', tier: 3, cost: 1910,
    recipe: ['expert_gloves', 'heros_ring', 'vitality_crystal'], stats: { adaptiveAtk: 45, maxHp: 400, cdrPct: 5 },
    activeName: 'Frozen', activeCd: 100, activeKind: 'winter_crown',
    uniquePassives: ['Frozen'], passiveName: 'Frozen (Active)', passiveDesc: 'Freezes user 2s: Untargetable & Immune to all damage/CC without breaking channels.'
  },
  {
    id: 'flask_of_the_oasis', name: 'Flask of the Oasis', shortName: 'Oasis', icon: '🧪', category: 'magic', tier: 3, cost: 1850,
    recipe: ['book_of_sages', 'mystic_container', 'vitality_crystal'], stats: { magicPow: 60, maxHp: 300, cdrPct: 10, healEffectPct: 12 },
    uniquePassives: ['Blessing'], passiveName: 'Blessing', passiveDesc: 'Healing/shielding an ally below 35% HP grants a 680–1800 Shield & cuts caster CDs by 2s.'
  },

  // ================= E. ALL 14 TIER-3 DEFENSE ITEMS =================
  {
    id: 'dominance_ice', name: 'Dominance Ice', shortName: 'Dom Ice', icon: '🧊', category: 'defense', tier: 3, cost: 2010,
    recipe: ['black_ice_shield', 'steel_legplates'], stats: { maxHp: 250, physDef: 40, magicDef: 40, moveSpdPct: 5 },
    antiHeal: true, uniquePassives: ['Defender', 'Arctic Cold', 'Lifebane'], passiveName: 'Arctic Cold / Lifebane', passiveDesc: 'Cuts nearby enemy ATK Speed to 80% & Shield/HP Regen by 50% (Lifebane).'
  },
  {
    id: 'chastise_pauldron', name: 'Chastise Pauldron', shortName: 'Chastise', icon: '🛡️', category: 'defense', tier: 3, cost: 2100,
    recipe: ['steel_legplates', 'ares_belt'], stats: { maxHp: 900, physDef: 40 },
    uniquePassives: ['Chastise', 'Redemption'], passiveName: 'Chastise / Redemption', passiveDesc: 'Cuts attacker ATK Speed & Cap to 75%–80%; dropping <30% HP restores 20% Max HP (60s CD).'
  },
  {
    id: 'antique_cuirass', name: 'Antique Cuirass', shortName: 'Cuirass', icon: '🛡️', category: 'defense', tier: 3, cost: 2170,
    recipe: ['dreadnaught_armor', 'ares_belt', 'healing_necklace'], stats: { maxHp: 920, physDef: 40, hpRegen: 4 },
    uniquePassives: ['Deter'], passiveName: 'Deter', passiveDesc: 'Enemy skill hits reduce attacker Phys ATK by -6% (max 3 stacks = -18%).'
  },
  {
    id: 'athenas_shield', name: "Athena's Shield", shortName: 'Athena', icon: '🔰', category: 'defense', tier: 3, cost: 2150,
    recipe: ['silence_robe', 'magic_resist_cloak', 'healing_necklace'], stats: { maxHp: 900, magicDef: 48, hpRegen: 2 },
    uniquePassives: ['Shield'], passiveName: 'Shield', passiveDesc: 'Upon taking Magic Damage, reduces all Magic Damage taken by 25% for 3s.'
  },
  {
    id: 'radiant_armor', name: 'Radiant Armor', shortName: 'Radiant', icon: '✨', category: 'defense', tier: 3, cost: 1880,
    recipe: ['silence_robe', 'healing_necklace'], stats: { maxHp: 950, magicDef: 40, hpRegen: 12 },
    uniquePassives: ['Holy Blessing'], passiveName: 'Holy Blessing', passiveDesc: 'Taking Magic Damage stacks +5 to +8 Magic DEF (max 6 stacks = +48 Magic DEF).'
  },
  {
    id: 'blade_armor', name: 'Blade Armor', shortName: 'Blade Arm', icon: '⚙️', category: 'defense', tier: 3, cost: 1910,
    recipe: ['steel_legplates', 'steel_legplates'], stats: { physDef: 80 },
    reflect: true, uniquePassives: ['Bladed Armor'], passiveName: 'Bladed Armor', passiveDesc: '+20% Crit Damage Reduction. Reflects 30% Basic Attack damage + 20% Phys DEF & slows 15%.'
  },
  {
    id: 'immortality', name: 'Immortality', shortName: 'Immort', icon: '🕊️', category: 'defense', tier: 3, cost: 2120,
    recipe: ['ares_belt', 'leather_jerkin'], stats: { maxHp: 800, physDef: 15 },
    revive: true, uniquePassives: ['Immortal'], passiveName: 'Immortal', passiveDesc: 'Resurrects 2.5s after death with 16% Max HP & 220 (+120*Lv) Shield (210s CD).'
  },
  {
    id: 'thunder_belt', name: 'Thunder Belt', shortName: 'T.Belt', icon: '⛈️', category: 'defense', tier: 3, cost: 1820,
    recipe: ['ares_belt', 'black_ice_shield'], stats: { maxHp: 800, physDef: 15, magicDef: 15, moveSpd: 20 },
    uniquePassives: ['Thunderbolt'], passiveName: 'Thunderbolt', passiveDesc: 'Every 4s, Basic Attack deals AoE True Damage scaling with Hybrid DEF & permanently gains +1 Hybrid DEF.'
  },
  {
    id: 'brute_force_breastplate', name: 'Brute Force Breastplate', shortName: 'Brute F.', icon: '🦾', category: 'defense', tier: 3, cost: 1870,
    recipe: ['heros_ring', 'leather_jerkin', 'vitality_crystal'], stats: { maxHp: 600, physDef: 20, cdrPct: 10 },
    uniquePassives: ['Brute Force'], passiveName: 'Brute Force', passiveDesc: 'Stacks +6 Adaptive ATK & +2% MS (6x); at max stacks grants +15% CC Resilience.'
  },
  {
    id: 'queens_wings', name: "Queen's Wings", shortName: 'Q.Wings', icon: '🦋', category: 'defense', tier: 3, cost: 2250,
    recipe: ['expert_gloves', 'ares_belt', 'heros_ring'], stats: { adaptiveAtk: 30, maxHp: 750, cdrPct: 10, spellVampPct: 10 },
    uniquePassives: ['Demonize', 'Defiance'], passiveName: 'Demonize / Defiance', passiveDesc: 'Below 40% HP grants 30% DR (3s) & -2s CDs; missing HP boosts damage up to +15%.'
  },
  {
    id: 'oracle', name: 'Oracle', shortName: 'Oracle', icon: '🌿', category: 'defense', tier: 3, cost: 1860,
    recipe: ['silence_robe', 'heros_ring'], stats: { maxHp: 850, physDef: 20, magicDef: 20, cdrPct: 10, healEffectPct: 30 },
    uniquePassives: ['Bless'], passiveName: 'Bless', passiveDesc: 'Raises all Shield absorption and HP regeneration effects received by +30%.'
  },
  {
    id: 'cursed_helmet', name: 'Cursed Helmet', shortName: 'Cursed', icon: '🪖', category: 'defense', tier: 3, cost: 1910,
    recipe: ['molten_essence', 'magic_resist_cloak'], stats: { maxHp: 1200, magicDef: 20 },
    uniquePassives: ['Burning Soul'], passiveName: 'Burning Soul', passiveDesc: 'Deals 1.2% Max HP Magic DPS nearby (+140%–350% vs creeps) & shreds enemy Hybrid DEF.'
  },
  {
    id: 'guardian_helmet', name: 'Guardian Helmet', shortName: 'Guardian', icon: '👑', category: 'defense', tier: 3, cost: 2200,
    recipe: ['ares_belt', 'ares_belt', 'healing_necklace'], stats: { maxHp: 1550, hpRegen: 20 },
    uniquePassives: ['Recovery'], passiveName: 'Recovery', passiveDesc: 'Regenerates 2.5% Max HP/s out of combat (0.5% Max HP/s in combat).'
  },
  {
    id: 'twilight_armor', name: 'Twilight Armor', shortName: 'Twilight', icon: '🌌', category: 'defense', tier: 3, cost: 2100,
    recipe: ['ares_belt', 'vitality_crystal'], stats: { maxHp: 1200, physDef: 15 },
    uniquePassives: ['Twilight'], passiveName: 'Twilight', passiveDesc: 'Reduces single-hit burst damage exceeding 500 by (0.4% Max HP + 15)% (5s CD).'
  },

  // ================= F1. ALL 7 TIER-2 MOVEMENT BOOTS =================
  {
    id: 'tough_boots', name: 'Tough Boots', shortName: 'Tough B.', icon: '🥾', category: 'movement', tier: 2, cost: 700,
    recipe: ['boots', 'magic_resist_cloak'], stats: { moveSpd: 40, magicDef: 18, ccResPct: 30 },
    uniquePassives: ['Fortitude'], passiveName: 'Fortitude', passiveDesc: 'Reduces Crowd Control and Slow durations by 30%.'
  },
  {
    id: 'warrior_boots', name: 'Warrior Boots', shortName: 'Warrior B.', icon: '👢', category: 'movement', tier: 2, cost: 720,
    recipe: ['boots', 'leather_jerkin'], stats: { moveSpd: 40, physDef: 18 },
    uniquePassives: ['Valor'], passiveName: 'Valor', passiveDesc: 'Taking Physical Damage stacks +4 Phys DEF up to 5x (+20 extra DEF).'
  },
  {
    id: 'swift_boots', name: 'Swift Boots', shortName: 'Swift B.', icon: '👟', category: 'movement', tier: 2, cost: 710,
    recipe: ['boots', 'knife'], stats: { moveSpd: 40, atkSpdPct: 15 }
  },
  {
    id: 'arcane_boots', name: 'Arcane Boots', shortName: 'Arcane B.', icon: '🔮', category: 'movement', tier: 2, cost: 690,
    recipe: ['boots'], stats: { moveSpd: 40, flatMagicPen: 10 }
  },
  {
    id: 'magic_shoes', name: 'Magic Shoes', shortName: 'Magic B.', icon: '✨', category: 'movement', tier: 2, cost: 710,
    recipe: ['boots'], stats: { moveSpd: 40, cdrPct: 10, maxHp: 150 }
  },
  {
    id: 'demon_shoes', name: 'Demon Shoes', shortName: 'Demon B.', icon: '😈', category: 'movement', tier: 2, cost: 720,
    recipe: ['boots', 'magic_necklace'], stats: { moveSpd: 40, manaRegen: 10 },
    uniquePassives: ['Mysticism'], passiveName: 'Mysticism', passiveDesc: 'Hero kills/assists restore 10% Max Mana; minion kills restore 4% Max Mana.'
  },
  {
    id: 'rapid_boots', name: 'Rapid Boots', shortName: 'Rapid B.', icon: '💨', category: 'movement', tier: 2, cost: 750,
    recipe: ['boots'], stats: { moveSpd: 65, ccResPct: 20 },
    uniquePassives: ['Side Effect'], passiveName: 'Side Effect', passiveDesc: '+65 MS & +35% Slow Reduction; in combat MS drops by -25 for 5s.'
  },

  // ================= F2. ALL 3 JUNGLING BOOT BLESSINGS =================
  {
    id: 'ice_retribution', name: 'Ice Retribution', shortName: 'Ice Retri', icon: '❄️', category: 'jungling', tier: 3, cost: 0,
    recipe: [], stats: {}, blessingKind: 'jungle',
    uniquePassives: ['Hunter'], passiveName: 'Ice Hunter', passiveDesc: 'Evolves at 5 creep/kill stacks: Retribution steals 72–100 Movement Speed for 4s.'
  },
  {
    id: 'flame_retribution', name: 'Flame Retribution', shortName: 'Flame Retri', icon: '🔥', category: 'jungling', tier: 3, cost: 0,
    recipe: [], stats: {}, blessingKind: 'jungle',
    uniquePassives: ['Hunter'], passiveName: 'Flame Hunter', passiveDesc: 'Evolves at 5 stacks: Retribution steals 58–100 Adaptive Attack for 4s.'
  },
  {
    id: 'bloody_retribution', name: 'Bloody Retribution', shortName: 'Blood Retri', icon: '🩸', category: 'jungling', tier: 3, cost: 0,
    recipe: [], stats: {}, blessingKind: 'jungle',
    uniquePassives: ['Hunter'], passiveName: 'Bloody Hunter', passiveDesc: 'Evolves at 5 stacks: Retribution drains 12.5% of user Max HP over 4s.'
  },

  // ================= F3. ALL 4 ROAMING BOOT BLESSINGS =================
  {
    id: 'roam_conceal', name: 'Conceal Blessing', shortName: 'Conceal', icon: '👻', category: 'roaming', tier: 3, cost: 0,
    recipe: [], stats: {}, blessingKind: 'roam', activeName: 'Conceal', activeCd: 80, activeKind: 'conceal',
    uniquePassives: ['Devotion', 'Conceal'], passiveName: 'Conceal (Active)', passiveDesc: 'Camouflages user & nearby allies for 5s with +24%–60% Movement Speed.'
  },
  {
    id: 'roam_encourage', name: 'Encourage Blessing', shortName: 'Encourage', icon: '📣', category: 'roaming', tier: 3, cost: 0,
    recipe: [], stats: { adaptiveAtk: 18, atkSpdPct: 15 }, blessingKind: 'roam',
    uniquePassives: ['Devotion', 'Encourage'], passiveName: 'Encourage', passiveDesc: 'Grants nearby allies +12–30 Adaptive Attack and +15% Attack Speed.'
  },
  {
    id: 'roam_favor', name: 'Favor Blessing', shortName: 'Favor', icon: '💚', category: 'roaming', tier: 3, cost: 0,
    recipe: [], stats: { healEffectPct: 15 }, blessingKind: 'roam',
    uniquePassives: ['Devotion', 'Favor'], passiveName: 'Favor', passiveDesc: 'Healing/shielding skills additionally restore 300–750 HP to lowest-HP nearby ally.'
  },
  {
    id: 'roam_dire_hit', name: 'Dire Hit Blessing', shortName: 'Dire Hit', icon: '🎯', category: 'roaming', tier: 3, cost: 0,
    recipe: [], stats: {}, blessingKind: 'roam',
    uniquePassives: ['Devotion', 'Dire Hit'], passiveName: 'Dire Hit', passiveDesc: 'Damaging an enemy hero below 35% HP deals 7%–18% Target Max HP Hybrid Damage.'
  },

  // ================= F4. ALL 3 LATE-GAME CONSUMABLE POTIONS =================
  {
    id: 'power_potion', name: 'Power Potion', shortName: 'Pwr Pot', icon: '🧪', category: 'consumable', tier: 3, cost: 1500,
    recipe: [], stats: { physAtk: 30, lifestealPct: 15 }, consumableDurationSec: 120,
    passiveName: 'Power Elixir (120s)', passiveDesc: 'Auto-activates on purchase: +30 Physical Attack & +15% Lifesteal for 120s.'
  },
  {
    id: 'magic_potion', name: 'Magic Potion', shortName: 'Mag Pot', icon: '🔮', category: 'consumable', tier: 3, cost: 1500,
    recipe: [], stats: { magicPow: 30, cdrPct: 5 }, consumableDurationSec: 120,
    passiveName: 'Arcane Elixir (120s)', passiveDesc: 'Auto-activates on purchase: +30 Magic Power & +5% CD Reduction for 120s.'
  },
  {
    id: 'rock_potion', name: 'Rock Potion', shortName: 'Rock Pot', icon: '🪨', category: 'consumable', tier: 3, cost: 1500,
    recipe: [], stats: { maxHp: 500, ccResPct: 25 }, consumableDurationSec: 120,
    passiveName: 'Titan Elixir (120s)', passiveDesc: 'Auto-activates on purchase: +500 Max HP & +25% Crowd Control Resilience for 120s.'
  },

  // ================= F5. ALL 3 HERO-UNIQUE EQUIPMENT ITEMS =================
  {
    id: 'lantern_of_hope', name: 'Lantern of Hope', shortName: 'Lantern', icon: '🪷', category: 'unique', tier: 3, cost: 0,
    recipe: [], stats: { magicPow: 45, cdrPct: 10, moveSpdPct: 10 }, heroExclusive: 'floryn',
    passiveName: 'Dew Evolution', passiveDesc: 'Floryn Exclusive: Evolves at 1000 energy to permanently upgrade stats and skills.'
  },
  {
    id: 'flower_of_hope', name: 'Flower of Hope', shortName: 'Flower', icon: '🌸', category: 'unique', tier: 3, cost: 0,
    recipe: [], stats: { adaptiveAtk: 28, healEffectPct: 15 }, heroExclusive: 'floryn',
    passiveName: 'Dew Gift', passiveDesc: 'Gifted by Floryn to 1 ally: +10% Hybrid Attack & converts excess heal into Shield.'
  },
  {
    id: 'throw_forbidden', name: 'Throw Forbidden (Odd Potion)', shortName: 'Odd Pot', icon: '🚫', category: 'unique', tier: 1, cost: 0,
    recipe: [], stats: {}, heroExclusive: 'jawhead',
    passiveName: 'Anti-Ejector', passiveDesc: 'Free utility when Jawhead is an ally: prevents allied Jawhead from throwing you.'
  }
];

export function getMlbbItemById(id: string): MlbbItemDef | undefined {
  return MLBB_ITEMS.find((i) => i.id === id);
}

/**
 * Recursively finds which owned items can be consumed as sub-components of targetId
 * and returns the net effective gold cost + consumed slot indices.
 * Supports optional Bargain Hunter 5% discount multiplier.
 */
export function computeMlbbEffectiveCost(
  targetId: string,
  ownedItems: readonly string[],
  discountRate = 0
): { effectiveCost: number; consumedIndices: number[] } {
  const item = getMlbbItemById(targetId);
  if (!item) return { effectiveCost: 0, consumedIndices: [] };
  if (item.cost === 0) return { effectiveCost: 0, consumedIndices: [] };

  const used = new Set<number>();
  let credit = 0;

  const consumeComponent = (compId: string) => {
    const idx = ownedItems.findIndex((id, i) => id === compId && !used.has(i));
    if (idx !== -1) {
      used.add(idx);
      credit += getMlbbItemById(compId)?.cost ?? 0;
      return;
    }
    const sub = getMlbbItemById(compId);
    if (sub && sub.recipe.length > 0) {
      for (const childId of sub.recipe) {
        consumeComponent(childId);
      }
    }
  };

  for (const compId of item.recipe) {
    consumeComponent(compId);
  }

  const rawNet = Math.max(0, item.cost - credit);
  const discounted = discountRate > 0 ? Math.round(rawNet * (1 - discountRate)) : rawNet;
  return {
    effectiveCost: discounted,
    consumedIndices: Array.from(used)
  };
}

export function applyMlbbItemPurchase(
  targetId: string,
  ownedItems: readonly string[],
  gold: number,
  discountRate = 0
): { ok: boolean; nextItems: string[]; nextGold: number; spent: number; reason?: string } {
  const item = getMlbbItemById(targetId);
  if (!item) return { ok: false, nextItems: [...ownedItems], nextGold: gold, spent: 0, reason: 'Invalid item' };
  const { effectiveCost, consumedIndices } = computeMlbbEffectiveCost(targetId, ownedItems, discountRate);
  if (gold < effectiveCost) {
    return { ok: false, nextItems: [...ownedItems], nextGold: gold, spent: 0, reason: 'Insufficient gold' };
  }
  // Consumable potions activate immediately without consuming an inventory slot
  if (item.category === 'consumable') {
    return {
      ok: true,
      nextItems: [...ownedItems],
      nextGold: gold - effectiveCost,
      spent: effectiveCost
    };
  }
  const remaining = ownedItems.filter((_, i) => !consumedIndices.includes(i));
  if (remaining.length >= 6) {
    return { ok: false, nextItems: [...ownedItems], nextGold: gold, spent: 0, reason: 'Inventory full (6/6)' };
  }
  remaining.push(targetId);
  return {
    ok: true,
    nextItems: remaining,
    nextGold: gold - effectiveCost,
    spent: effectiveCost
  };
}

export function computeMlbbSellRefund(itemId: string): number {
  const item = getMlbbItemById(itemId);
  if (!item) return 0;
  return Math.round(item.cost * 0.6);
}

export function computeMlbbQuickBuy(
  buildIds: readonly string[],
  ownedItems: readonly string[],
  gold: number,
  prioritizedItemId: string | null,
  discountRate = 0
): { id: string; effectiveCost: number; canAfford: boolean }[] {
  const result: { id: string; effectiveCost: number; canAfford: boolean }[] = [];
  const candidates: string[] = [];
  if (prioritizedItemId && !ownedItems.includes(prioritizedItemId)) {
    candidates.push(prioritizedItemId);
  }
  for (const bid of buildIds) {
    if (!ownedItems.includes(bid) && !candidates.includes(bid)) {
      candidates.push(bid);
    }
  }
  const targetId = candidates[0];
  if (!targetId) return [];
  const mainTarget = getMlbbItemById(targetId);
  if (!mainTarget) return [];

  const mainEff = computeMlbbEffectiveCost(mainTarget.id, ownedItems, discountRate);
  if (gold >= mainEff.effectiveCost || mainTarget.recipe.length === 0) {
    result.push({ id: mainTarget.id, effectiveCost: mainEff.effectiveCost, canAfford: gold >= mainEff.effectiveCost });
  } else {
    for (const compId of mainTarget.recipe) {
      if (ownedItems.includes(compId)) continue;
      const compEff = computeMlbbEffectiveCost(compId, ownedItems, discountRate);
      if (gold >= compEff.effectiveCost) {
        result.push({ id: compId, effectiveCost: compEff.effectiveCost, canAfford: true });
      } else {
        const compDef = getMlbbItemById(compId);
        if (compDef) {
          for (const subId of compDef.recipe) {
            if (!ownedItems.includes(subId) && result.length < 2) {
              const subEff = computeMlbbEffectiveCost(subId, ownedItems, discountRate);
              result.push({ id: subId, effectiveCost: subEff.effectiveCost, canAfford: gold >= subEff.effectiveCost });
            }
          }
        }
      }
      if (result.length >= 2) break;
    }
    if (result.length === 0) {
      result.push({ id: mainTarget.id, effectiveCost: mainEff.effectiveCost, canAfford: false });
    }
  }
  return result.slice(0, 2);
}

/**
 * Aggregates equipment stats while strictly enforcing MLBB Same-Name Unique Passive
 * Non-Stacking rules (e.g. Armor Buster on Malefic Roar + Malefic Gun only applies +30% once;
 * Enchanted Talisman raises CDR cap from 40% to 45%).
 */
export function aggregateMlbbItemStats(
  ownedItems: readonly string[],
  blessingId: string | null,
  preferMagic = false
): Required<MlbbItemStats> {
  const acc: Required<MlbbItemStats> = {
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
  const allIds = blessingId ? [...ownedItems, blessingId] : [...ownedItems];
  const resolved = resolveUniqueItemPassives(allIds);
  let armorBusterApplied = false;
  let uniqueCritDmgApplied = false;

  for (const id of allIds) {
    const def = getMlbbItemById(id);
    if (!def) continue;
    const s = def.stats;
    acc.physAtk += s.physAtk ?? 0;
    acc.magicPow += s.magicPow ?? 0;
    acc.adaptiveAtk += s.adaptiveAtk ?? 0;
    if (s.adaptiveAtk) {
      if (preferMagic) acc.magicPow += s.adaptiveAtk;
      else acc.physAtk += s.adaptiveAtk;
    }
    acc.maxHp += s.maxHp ?? 0;
    acc.maxMana += s.maxMana ?? 0;
    acc.manaRegen += s.manaRegen ?? 0;
    acc.physDef += s.physDef ?? 0;
    acc.magicDef += s.magicDef ?? 0;
    acc.moveSpd += s.moveSpd ?? 0;
    acc.moveSpdPct += s.moveSpdPct ?? 0;
    acc.atkSpdPct += s.atkSpdPct ?? 0;
    acc.critChance += s.critChance ?? 0;
    if (s.critDmgPct && !uniqueCritDmgApplied) {
      acc.critDmgPct += s.critDmgPct;
      uniqueCritDmgApplied = true;
    }
    acc.cdrPct += s.cdrPct ?? 0;
    acc.lifestealPct += s.lifestealPct ?? 0;
    acc.spellVampPct += s.spellVampPct ?? 0;
    acc.flatPhysPen += s.flatPhysPen ?? 0;
    if (s.pctPhysPen) {
      if (def.uniquePassives?.includes('Armor Buster')) {
        if (!armorBusterApplied) {
          acc.pctPhysPen = Math.min(0.6, acc.pctPhysPen + s.pctPhysPen);
          armorBusterApplied = true;
        }
      } else {
        acc.pctPhysPen = Math.min(0.6, acc.pctPhysPen + s.pctPhysPen);
      }
    }
    acc.flatMagicPen += s.flatMagicPen ?? 0;
    acc.pctMagicPen = Math.min(0.6, acc.pctMagicPen + (s.pctMagicPen ?? 0));
    acc.ccResPct = Math.min(50, acc.ccResPct + (s.ccResPct ?? 0));
    acc.hpRegen += s.hpRegen ?? 0;
    acc.healEffectPct += s.healEffectPct ?? 0;
  }

  // Convert moveSpdPct into equivalent flat movement speed bonus (~250 base MS)
  if (acc.moveSpdPct > 0) {
    acc.moveSpd += Math.round(250 * (acc.moveSpdPct / 100));
  }
  acc.cdrPct = Math.min(resolved.cdrCapPct, acc.cdrPct);
  acc.critChance = Math.min(100, acc.critChance);
  return acc;
}

export interface MlbbCraftingTreeNode {
  item: MlbbItemDef;
  owned: boolean;
  effectiveCost: number;
  children: MlbbCraftingTreeNode[];
}

/**
 * Builds a structured 3-tier crafting tree (Tier-3 -> Tier-2 -> Tier-1)
 * accurately matching owned inventory slots so duplicate sub-components
 * (e.g. 2x Legion Sword in Blade of Despair) are credited individually.
 */
export function getItemCraftingTree(
  targetId: string,
  ownedItems: readonly string[],
  discountRate = 0
): MlbbCraftingTreeNode | null {
  const rootDef = getMlbbItemById(targetId);
  if (!rootDef) return null;

  const usedSlots = new Set<number>();

  const buildNode = (id: string, isRoot: boolean): MlbbCraftingTreeNode | null => {
    const def = getMlbbItemById(id);
    if (!def) return null;

    let owned = false;
    if (!isRoot) {
      const idx = ownedItems.findIndex((ownedId, slotIdx) => ownedId === id && !usedSlots.has(slotIdx));
      if (idx !== -1) {
        usedSlots.add(idx);
        owned = true;
      }
    } else {
      owned = ownedItems.includes(id);
    }

    const eff = computeMlbbEffectiveCost(id, ownedItems, discountRate).effectiveCost;
    const children: MlbbCraftingTreeNode[] = [];
    if (!owned || isRoot) {
      for (const childId of def.recipe) {
        const childNode = buildNode(childId, false);
        if (childNode) children.push(childNode);
      }
    } else {
      for (const childId of def.recipe) {
        const childDef = getMlbbItemById(childId);
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
      owned,
      effectiveCost: owned && !isRoot ? 0 : eff,
      children
    };
  };

  return buildNode(targetId, true);
}

export interface MlbbProBuildTemplate {
  id: 'pro_burst' | 'pro_sustain' | 'pro_counter';
  label: string;
  tag: string;
  items: string[];
}

/**
 * Generates 3 tailored 2026 Pro Build templates (Pro Burst, Pro Sustain, Pro Counter)
 * for any of the 133 heroes based on role, primary damage profile, and recommended core.
 */
export function getProBuildTemplatesForHero(hero: MlbbHeroDef): MlbbProBuildTemplate[] {
  const rec = hero.recommendedBuild.length >= 6 ? [...hero.recommendedBuild.slice(0, 6)] : [
    'tough_boots', 'blade_of_despair', 'malefic_roar', 'endless_battle', 'hunter_strike', 'immortality'
  ];

  if (hero.role === 'Mage') {
    return [
      {
        id: 'pro_burst',
        label: 'Pro Burst Meta',
        tag: 'High Burst',
        items: ['arcane_boots', 'lightning_truncheon', 'holy_crystal', 'divine_glaive', 'wishing_lantern', 'blood_wings']
      },
      {
        id: 'pro_sustain',
        label: 'Pro Sustain CDR',
        tag: 'CDR / Survive',
        items: ['magic_shoes', 'enchanted_talisman', 'clock_of_destiny', 'concentrated_energy', 'ice_queen_wand', 'winter_crown']
      },
      {
        id: 'pro_counter',
        label: 'Pro Anti-Heal',
        tag: 'Counter Tanks',
        items: ['tough_boots', 'glowing_wand', 'wishing_lantern', 'divine_glaive', 'genius_wand', 'immortality']
      }
    ];
  }

  if (hero.role === 'Marksman') {
    return [
      {
        id: 'pro_burst',
        label: 'Pro Crit / Range',
        tag: '2026 Meta',
        items: ['swift_boots', 'haas_claws', 'berserkers_fury', 'windtalker', 'malefic_gun', 'wind_of_nature']
      },
      {
        id: 'pro_sustain',
        label: 'Pro Trinity Shred',
        tag: 'Tank Melt',
        items: ['swift_boots', 'corrosion_scythe', 'demon_hunter_sword', 'golden_staff', 'malefic_gun', 'rose_gold_meteor']
      },
      {
        id: 'pro_counter',
        label: 'Pro Anti-Heal Safe',
        tag: 'Anti-Regen',
        items: ['tough_boots', 'sea_halberd', 'malefic_gun', 'wind_of_nature', 'rose_gold_meteor', 'immortality']
      }
    ];
  }

  if (hero.role === 'Assassin') {
    return [
      {
        id: 'pro_burst',
        label: 'Pro Sky Piercer',
        tag: 'Snowball',
        items: ['tough_boots', 'sky_piercer', 'blade_of_heptaseas', 'hunter_strike', 'malefic_roar', 'blade_of_despair']
      },
      {
        id: 'pro_sustain',
        label: 'Pro Skirmisher',
        tag: 'Bruiser',
        items: ['warrior_boots', 'war_axe', 'endless_battle', 'brute_force_breastplate', 'rose_gold_meteor', 'immortality']
      },
      {
        id: 'pro_counter',
        label: 'Pro Anti-Heal',
        tag: 'Counter Heal',
        items: ['tough_boots', 'sea_halberd', 'hunter_strike', 'malefic_roar', 'winter_crown', 'immortality']
      }
    ];
  }

  if (hero.role === 'Tank') {
    return [
      {
        id: 'pro_burst',
        label: 'Pro Thunder Stack',
        tag: '2026 Roam',
        items: ['tough_boots', 'thunder_belt', 'dominance_ice', 'athenas_shield', 'antique_cuirass', 'immortality']
      },
      {
        id: 'pro_sustain',
        label: 'Pro Mega Sustain',
        tag: 'Frontline',
        items: ['warrior_boots', 'guardian_helmet', 'cursed_helmet', 'oracle', 'twilight_armor', 'immortality']
      },
      {
        id: 'pro_counter',
        label: 'Pro Counter DPS',
        tag: 'Anti-MM/Mage',
        items: ['tough_boots', 'dominance_ice', 'chastise_pauldron', 'blade_armor', 'radiant_armor', 'twilight_armor']
      }
    ];
  }

  if (hero.role === 'Support') {
    return [
      {
        id: 'pro_burst',
        label: 'Pro Oasis Heal',
        tag: '2026 Support',
        items: ['magic_shoes', 'flask_of_the_oasis', 'enchanted_talisman', 'fleeting_time', 'oracle', 'immortality']
      },
      {
        id: 'pro_sustain',
        label: 'Pro Utility Tank',
        tag: 'Durable',
        items: ['tough_boots', 'flask_of_the_oasis', 'dominance_ice', 'athenas_shield', 'fleeting_time', 'winter_crown']
      },
      {
        id: 'pro_counter',
        label: 'Pro Anti-Heal',
        tag: 'Debuff',
        items: ['tough_boots', 'glowing_wand', 'ice_queen_wand', 'flask_of_the_oasis', 'dominance_ice', 'immortality']
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
      items: ['tough_boots', 'war_axe', 'thunder_belt', 'queens_wings', 'oracle', 'immortality']
    },
    {
      id: 'pro_counter',
      label: 'Pro Anti-Heal Duel',
      tag: 'Counter Lane',
      items: ['warrior_boots', 'sea_halberd', 'war_axe', 'brute_force_breastplate', 'athenas_shield', 'immortality']
    }
  ];
}

