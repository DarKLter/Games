import { MobaHeroDef, MobaRole } from './mobaHeroCatalog';

export type MobaEquipCategory = 'attack' | 'magic' | 'defense' | 'movement' | 'blessing';
export type MobaEquipmentCategory = Exclude<MobaEquipCategory, 'blessing'>;

export type MobaActiveSkillId = 'wind_chant' | 'frozen' | 'conceal';

export interface MobaEquipStats {
  physAtk?: number;
  magicPower?: number;
  adaptiveAtk?: number;
  hp?: number;
  mana?: number;
  physDef?: number;
  magicDef?: number;
  atkSpeedPct?: number;
  critChancePct?: number;
  critDmgPct?: number;
  physPenFlat?: number;
  physPenPct?: number;
  magicPenFlat?: number;
  magicPenPct?: number;
  lifestealPct?: number;
  spellVampPct?: number;
  hybridLifestealPct?: number;
  cdrPct?: number;
  moveSpeedPct?: number;
  moveSpeedFlat?: number;
  hpRegen?: number;
  manaRegen?: number;
  critDmgReductionPct?: number;
  slowReductionPct?: number;
  ccReductionPct?: number;
}

export type MobaEquipTier = 1 | 2 | 3;

export interface MobaEquipmentItem {
  id: string;
  name: string;
  shortName: string;
  category: Exclude<MobaEquipCategory, 'blessing'>;
  tier?: MobaEquipTier;
  recipe?: string[];
  icon: string;
  cost: number;
  statsSummary: string;
  stats: MobaEquipStats;
  passiveName: string;
  passiveDesc: string;
  isActiveSkill?: boolean;
  activeSkillId?: MobaActiveSkillId;
  activeCdSec?: number;
}

export type MobaBlessingKind = 'jungling' | 'roaming';

export interface MobaBootBlessing {
  id: string;
  name: string;
  shortName: string;
  kind: MobaBlessingKind;
  icon: string;
  cost: number;
  summary: string;
  desc: string;
  isActiveSkill?: boolean;
  activeSkillId?: MobaActiveSkillId;
  activeCdSec?: number;
}

// ============================================================================
// COMPLETE MLBB TIER-3 EQUIPMENT CATALOG (52 ITEMS: 17 ATK, 15 MAG, 13 DEF, 7 BOOTS)
// ============================================================================
export const MOBA_EQUIPMENT_ITEMS: MobaEquipmentItem[] = [
  // ================= ⚔️ ATTACK ITEMS (17) =================
  {
    id: 'bod',
    name: 'Blade of Despair',
    shortName: 'BOD',
    category: 'attack',
    icon: '🗡️',
    cost: 310,
    statsSummary: '+160 Physical Attack · +5% Movement Speed',
    stats: { physAtk: 160, moveSpeedPct: 5 },
    passiveName: 'Despair',
    passiveDesc: 'Attacking enemies with HP below 50% boosts your Physical Attack by 25% for 2 seconds.'
  },
  {
    id: 'malefic_roar',
    name: 'Malefic Roar',
    shortName: 'Malefic',
    category: 'attack',
    icon: '🦁',
    cost: 210,
    statsSummary: '+60 Physical Attack · +30% Physical Penetration',
    stats: { physAtk: 60, physPenPct: 30 },
    passiveName: 'Armor Buster',
    passiveDesc: 'Gains extra Physical Penetration based on enemy Physical Defense (melts high-armor tanks and turrets).'
  },
  {
    id: 'malefic_gun',
    name: 'Malefic Gun',
    shortName: 'M.Gun',
    category: 'attack',
    icon: '🔫',
    cost: 205,
    statsSummary: '+40 Physical Attack · +20% Attack Speed · +15% Lifesteal',
    stats: { physAtk: 40, atkSpeedPct: 20, lifestealPct: 15 },
    passiveName: 'Malefic Energy & Zeal',
    passiveDesc: 'Increases basic attack range by 15% and grants a burst of Movement Speed whenever you hit with a basic attack.'
  },
  {
    id: 'hunter_strike',
    name: 'Hunter Strike',
    shortName: 'Hunter',
    category: 'attack',
    icon: '🪓',
    cost: 200,
    statsSummary: '+80 Physical Attack · +10% CDR · +15 Physical Penetration',
    stats: { physAtk: 80, cdrPct: 10, physPenFlat: 15 },
    passiveName: 'Retribution',
    passiveDesc: 'Dealing damage 5 times in a row to an enemy hero or creep grants a 50% Movement Speed burst over 3 seconds.'
  },
  {
    id: 'heptaseas',
    name: 'Blade of the Heptaseas',
    shortName: 'Heptaseas',
    category: 'attack',
    icon: '🌊',
    cost: 195,
    statsSummary: '+70 Physical Attack · +250 HP · +15 Physical Penetration',
    stats: { physAtk: 70, hp: 250, physPenFlat: 15 },
    passiveName: 'Ambush',
    passiveDesc: 'If you take or deal no damage for 5 seconds, your next basic attack deals massive bonus Physical Damage and slows by 40%.'
  },
  {
    id: 'endless_battle',
    name: 'Endless Battle',
    shortName: 'Endless',
    category: 'attack',
    icon: '⚔️',
    cost: 245,
    statsSummary: '+65 Phys ATK · +250 HP · +10% CDR · +8% Hybrid Lifesteal · +5% SPD · +5 Mana Regen',
    stats: { physAtk: 65, hp: 250, cdrPct: 10, hybridLifestealPct: 8, moveSpeedPct: 5, manaRegen: 5 },
    passiveName: 'Divine Justice & Chase Fate',
    passiveDesc: 'After using a skill, your next basic attack deals bonus True Damage equal to 60% of Physical Attack and boosts Move Speed by 10%.'
  },
  {
    id: 'dhs',
    name: 'Demon Hunter Sword',
    shortName: 'DHS',
    category: 'attack',
    icon: '👹',
    cost: 215,
    statsSummary: '+35 Physical Attack · +20% Attack Speed',
    stats: { physAtk: 35, atkSpeedPct: 20 },
    passiveName: 'Devour',
    passiveDesc: 'Basic attacks deal bonus Physical Damage equal to 8% of target current HP and grant stacking Lifesteal.'
  },
  {
    id: 'golden_staff',
    name: 'Golden Staff',
    shortName: 'G.Staff',
    category: 'attack',
    icon: '🥖',
    cost: 200,
    statsSummary: '+55 Physical Attack · +15% Attack Speed',
    stats: { physAtk: 55, atkSpeedPct: 15 },
    passiveName: 'Swift & Endless Strike',
    passiveDesc: 'Converts every 1% of Critical Chance into 1% Attack Speed; every 3rd basic attack triggers on-hit effects three times.'
  },
  {
    id: 'corrosion_scythe',
    name: 'Corrosion Scythe',
    shortName: 'Corrosion',
    category: 'attack',
    icon: '🧪',
    cost: 205,
    statsSummary: '+30 Physical Attack · +30% Attack Speed · +5% Movement Speed',
    stats: { physAtk: 30, atkSpeedPct: 30, moveSpeedPct: 5 },
    passiveName: 'Corrosive & Impulse',
    passiveDesc: 'Basic attacks slow the target (up to 5 stacks) and grant stacking Attack Speed up to +30%.'
  },
  {
    id: 'windtalker',
    name: 'Windtalker',
    shortName: 'Windtalk',
    category: 'attack',
    icon: '🌪️',
    cost: 185,
    statsSummary: '+35% Attack Speed · +20 Movement Speed · +10% Critical Chance',
    stats: { atkSpeedPct: 35, moveSpeedFlat: 20, critChancePct: 10 },
    passiveName: 'Typhoon & Activate',
    passiveDesc: 'Every few basic attacks unleashes a lightning whirlwind that bounces to 3 enemies for Magic Damage and boosts Move Speed.'
  },
  {
    id: 'berserkers_fury',
    name: "Berserker's Fury",
    shortName: 'Berserk',
    category: 'attack',
    icon: '💢',
    cost: 235,
    statsSummary: '+65 Physical Attack · +25% Critical Chance · +40% Critical Damage',
    stats: { physAtk: 65, critChancePct: 25, critDmgPct: 40 },
    passiveName: 'Doom',
    passiveDesc: 'Landing a Critical Hit increases your Physical Attack by 5% for 2 seconds.'
  },
  {
    id: 'haas_claws',
    name: "Haas's Claws",
    shortName: 'Haas',
    category: 'attack',
    icon: '🐾',
    cost: 200,
    statsSummary: '+30 Physical Attack · +15% Attack Speed · +20% Crit Chance · +25% Lifesteal',
    stats: { physAtk: 30, atkSpeedPct: 15, critChancePct: 20, lifestealPct: 25 },
    passiveName: 'Frenzy',
    passiveDesc: 'Landing a Critical Hit grants an extra 20% Attack Speed for 2 seconds.'
  },
  {
    id: 'great_dragon_spear',
    name: 'Great Dragon Spear',
    shortName: 'DragonSp',
    category: 'attack',
    icon: '🐉',
    cost: 215,
    statsSummary: '+70 Physical Attack · +10% CDR · +20% Critical Chance',
    stats: { physAtk: 70, cdrPct: 10, critChancePct: 20 },
    passiveName: 'Supreme Warrior',
    passiveDesc: 'Casting your Ultimate increases your Movement Speed by 30% for 7.5 seconds.'
  },
  {
    id: 'sea_halberd',
    name: 'Sea Halberd',
    shortName: 'Halberd',
    category: 'attack',
    icon: '🔱',
    cost: 205,
    statsSummary: '+80 Physical Attack · +20% Attack Speed',
    stats: { physAtk: 80, atkSpeedPct: 20 },
    passiveName: 'Lifebane & Punish',
    passiveDesc: 'Reduces target Shield and HP Regen by 50% for 3s, and increases damage by 8% against enemies with higher Max HP.'
  },
  {
    id: 'rose_gold_meteor',
    name: 'Rose Gold Meteor',
    shortName: 'RoseGold',
    category: 'attack',
    icon: '🌹',
    cost: 210,
    statsSummary: '+60 Physical Attack · +30 Magic Defense · +10% Lifesteal',
    stats: { physAtk: 60, magicDef: 30, lifestealPct: 10 },
    passiveName: 'Lifeline',
    passiveDesc: 'When HP drops below 30%, automatically generates a large damage-absorbing Shield and boosts Move Speed by 50%.'
  },
  {
    id: 'wind_of_nature',
    name: 'Wind of Nature',
    shortName: 'WON',
    category: 'attack',
    icon: '🍃',
    cost: 190,
    statsSummary: '+30 Physical Attack · +20% Attack Speed · +10% Lifesteal',
    stats: { physAtk: 30, atkSpeedPct: 20, lifestealPct: 10 },
    passiveName: 'Active: Wind Chant',
    passiveDesc: 'Become 100% immune to all Physical Damage for 2 seconds (1 second for non-Marksmen).',
    isActiveSkill: true,
    activeSkillId: 'wind_chant',
    activeCdSec: 18
  },
  {
    id: 'war_axe',
    name: 'War Axe',
    shortName: 'WarAxe',
    category: 'attack',
    icon: '🪓',
    cost: 210,
    statsSummary: '+35 Physical Attack · +400 HP · +10% CDR · +12% Spell Vamp',
    stats: { physAtk: 35, hp: 400, cdrPct: 10, spellVampPct: 12 },
    passiveName: 'Fighting Spirit',
    passiveDesc: 'Entering combat builds up to 6 stacks granting extra Physical Attack and bonus True Damage at max stacks.'
  },

  // ================= 🔮 MAGIC ITEMS (15) =================
  {
    id: 'holy_crystal',
    name: 'Holy Crystal',
    shortName: 'Crystal',
    category: 'magic',
    icon: '💎',
    cost: 300,
    statsSummary: '+185 Magic Power',
    stats: { magicPower: 185 },
    passiveName: 'Mystery',
    passiveDesc: 'Increases your total Magic Power by an additional 21% to 35% (scales with hero level).'
  },
  {
    id: 'divine_glaive',
    name: 'Divine Glaive',
    shortName: 'Glaive',
    category: 'magic',
    icon: '🔮',
    cost: 195,
    statsSummary: '+60 Magic Power · +40% Magic Penetration',
    stats: { magicPower: 60, magicPenPct: 40 },
    passiveName: 'Spellbreaker',
    passiveDesc: 'Gains extra Magic Penetration based on enemy Magic Defense (melts magic-resist tanks).'
  },
  {
    id: 'genius_wand',
    name: 'Genius Wand',
    shortName: 'Genius',
    category: 'magic',
    icon: '🪄',
    cost: 200,
    statsSummary: '+75 Magic Power · +5% Movement Speed · +10 Magic Penetration',
    stats: { magicPower: 75, moveSpeedPct: 5, magicPenFlat: 10 },
    passiveName: 'Magic',
    passiveDesc: 'Dealing damage reduces enemy Magic Defense by 3–7 points (stacks up to 3 times).'
  },
  {
    id: 'lightning_truncheon',
    name: 'Lightning Truncheon',
    shortName: 'Truncheon',
    category: 'magic',
    icon: '⚡',
    cost: 225,
    statsSummary: '+75 Magic Power · +400 Mana · +10% CDR',
    stats: { magicPower: 75, mana: 400, cdrPct: 10 },
    passiveName: 'Resonate',
    passiveDesc: 'Every 6 seconds, your next damaging skill triggers chain lightning bouncing to 3 enemies and boosts Move Speed.'
  },
  {
    id: 'blood_wings',
    name: 'Blood Wings',
    shortName: 'B.Wings',
    category: 'magic',
    icon: '🦇',
    cost: 280,
    statsSummary: '+90 Magic Power',
    stats: { magicPower: 90 },
    passiveName: 'Guard',
    passiveDesc: 'Grants a massive damage-absorbing Shield that regenerates after 20s and boosts Move Speed while active.'
  },
  {
    id: 'clock_of_destiny',
    name: 'Clock of Destiny',
    shortName: 'Clock',
    category: 'magic',
    icon: '⏳',
    cost: 205,
    statsSummary: '+45 Magic Power · +400 HP · +800 Mana · +10% CDR',
    stats: { magicPower: 45, hp: 400, mana: 800, cdrPct: 10 },
    passiveName: 'Destiny & Gift',
    passiveDesc: 'Dealing Magic Damage grants stacking Hybrid Defense and restores 15% HP/Mana when HP drops below 50%.'
  },
  {
    id: 'glowing_wand',
    name: 'Glowing Wand',
    shortName: 'Glowing',
    category: 'magic',
    icon: '🔥',
    cost: 215,
    statsSummary: '+75 Magic Power · +400 HP · +5% Movement Speed',
    stats: { magicPower: 75, hp: 400, moveSpeedPct: 5 },
    passiveName: 'Scorch & Lifebane',
    passiveDesc: 'Burns targets for continuous Max-HP Magic Damage over 3s and reduces their Shield and HP Regen by 50%.'
  },
  {
    id: 'ice_queen_wand',
    name: 'Ice Queen Wand',
    shortName: 'IceQueen',
    category: 'magic',
    icon: '❄️',
    cost: 220,
    statsSummary: '+75 Magic Power · +10% Spell Vamp · +300 HP · +7% Movement Speed',
    stats: { magicPower: 75, spellVampPct: 10, hp: 300, moveSpeedPct: 7 },
    passiveName: 'Ice Bound',
    passiveDesc: 'Damaging enemies with skills slows them by 10% (stacks up to 3 times for a 30% slow).'
  },
  {
    id: 'concentrated_energy',
    name: 'Concentrated Energy',
    shortName: 'Conc.En',
    category: 'magic',
    icon: '💠',
    cost: 210,
    statsSummary: '+70 Magic Power · +400 HP · +20% Hybrid Lifesteal',
    stats: { magicPower: 70, hp: 400, hybridLifestealPct: 20 },
    passiveName: 'Recharge',
    passiveDesc: 'Dealing Magic Damage increases Magic Power (up to 6 stacks) and grants +12% extra Magic Damage at full stacks.'
  },
  {
    id: 'wishing_lantern',
    name: 'Wishing Lantern',
    shortName: 'Lantern',
    category: 'magic',
    icon: '🏮',
    cost: 225,
    statsSummary: '+75 Magic Power · +400 Mana · +10% CDR',
    stats: { magicPower: 75, mana: 400, cdrPct: 10 },
    passiveName: 'Butterfly Goddess',
    passiveDesc: 'Every 800 Magic Damage dealt summons a Butterfly Goddess that strikes the target for 10% of their current HP.'
  },
  {
    id: 'starlium_scythe',
    name: 'Starlium Scythe',
    shortName: 'Starlium',
    category: 'magic',
    icon: '🌙',
    cost: 220,
    statsSummary: '+70 Magic Power · +10% CDR · +8% Hybrid Lifesteal · +6 Mana Regen',
    stats: { magicPower: 70, cdrPct: 10, hybridLifestealPct: 8, manaRegen: 6 },
    passiveName: 'Crisis',
    passiveDesc: 'After casting a skill, your next basic attack deals bonus True Damage equal to 100% of Magic Power and +10% Move Speed.'
  },
  {
    id: 'feather_of_heaven',
    name: 'Feather of Heaven',
    shortName: 'Feather',
    category: 'magic',
    icon: '🪶',
    cost: 205,
    statsSummary: '+55 Magic Power · +20% Attack Speed · +10% Lifesteal · +5% CDR',
    stats: { magicPower: 55, atkSpeedPct: 20, lifestealPct: 10, cdrPct: 5 },
    passiveName: 'Affliction & Impulse',
    passiveDesc: 'Basic attacks deal bonus Magic Damage and grant stacking Attack Speed up to +25%.'
  },
  {
    id: 'enchanted_talisman',
    name: 'Enchanted Talisman',
    shortName: 'Talisman',
    category: 'magic',
    icon: '📖',
    cost: 190,
    statsSummary: '+50 Magic Power · +250 HP · +20% CDR',
    stats: { magicPower: 50, hp: 250, cdrPct: 20 },
    passiveName: 'Mana Spring & Magic Mastery',
    passiveDesc: 'Regenerates 15% Max Mana every 10s and increases maximum Cooldown Reduction cap from 40% to 45%.'
  },
  {
    id: 'fleeting_time',
    name: 'Fleeting Time',
    shortName: 'Fleeting',
    category: 'magic',
    icon: '⌛',
    cost: 205,
    statsSummary: '+30 Adaptive Attack · +600 HP · +15% CDR',
    stats: { adaptiveAtk: 30, hp: 600, cdrPct: 15 },
    passiveName: 'Timestream',
    passiveDesc: 'Getting a kill or assist immediately reduces your Ultimate current cooldown by 30%.'
  },
  {
    id: 'winter_crown',
    name: 'Winter Crown',
    shortName: 'W.Crown',
    category: 'magic',
    icon: '👑',
    cost: 195,
    statsSummary: '+45 Adaptive Attack · +400 HP · +5% CDR',
    stats: { adaptiveAtk: 45, hp: 400, cdrPct: 5 },
    passiveName: 'Active: Frozen',
    passiveDesc: 'Freezes yourself in solid ice for 2 seconds, making you 100% immune to all damage and Crowd Control.',
    isActiveSkill: true,
    activeSkillId: 'frozen',
    activeCdSec: 20
  },

  // ================= 🛡️ DEFENSE ITEMS (13) =================
  {
    id: 'dominance_ice',
    name: 'Dominance Ice',
    shortName: 'Dom.Ice',
    category: 'defense',
    icon: '🧊',
    cost: 200,
    statsSummary: '+500 Mana · +55 Physical Defense · +5% Movement Speed',
    stats: { mana: 500, physDef: 55, moveSpeedPct: 5 },
    passiveName: 'Arctic Cold & Lifebane',
    passiveDesc: 'Reduces Attack Speed of nearby enemies by 20% and reduces their Shield and HP Regeneration by 50%.'
  },
  {
    id: 'antique_cuirass',
    name: 'Antique Cuirass',
    shortName: 'Cuirass',
    category: 'defense',
    icon: '🛡️',
    cost: 215,
    statsSummary: '+920 HP · +40 Physical Defense · +4 HP Regen',
    stats: { hp: 920, physDef: 40, hpRegen: 4 },
    passiveName: 'Deter',
    passiveDesc: 'When hit by an enemy skill, reduces the attacker Physical Attack by 6% (stacks up to 3 times).'
  },
  {
    id: 'blade_armor',
    name: 'Blade Armor',
    shortName: 'BladeArm',
    category: 'defense',
    icon: '⚙️',
    cost: 190,
    statsSummary: '+70 Physical Defense · +20% Crit Damage Reduction',
    stats: { physDef: 70, critDmgReductionPct: 20 },
    passiveName: 'Bladed Armor',
    passiveDesc: 'Reflects incoming basic attack damage back at the attacker as Physical Damage and slows them by 15%.'
  },
  {
    id: 'radiant_armor',
    name: 'Radiant Armor',
    shortName: 'Radiant',
    category: 'defense',
    icon: '✨',
    cost: 195,
    statsSummary: '+950 HP · +40 Magic Defense · +12 HP Regen',
    stats: { hp: 950, magicDef: 40, hpRegen: 12 },
    passiveName: 'Holy Blessing',
    passiveDesc: 'Taking Magic Damage grants stacking Magic Defense (stacks up to 8 times against continuous magic damage).'
  },
  {
    id: 'athenas_shield',
    name: "Athena's Shield",
    shortName: 'Athena',
    category: 'defense',
    icon: '🔱',
    cost: 215,
    statsSummary: '+900 HP · +48 Magic Defense · +2 HP Regen',
    stats: { hp: 900, magicDef: 48, hpRegen: 2 },
    passiveName: 'Shield',
    passiveDesc: 'Taking Magic Damage activates a barrier that reduces all incoming Magic Damage by 25% for 3 seconds.'
  },
  {
    id: 'oracle',
    name: 'Oracle',
    shortName: 'Oracle',
    category: 'defense',
    icon: '💚',
    cost: 185,
    statsSummary: '+850 HP · +20 Physical Defense · +20 Magic Defense · +10% CDR',
    stats: { hp: 850, physDef: 20, magicDef: 20, cdrPct: 10 },
    passiveName: 'Bless',
    passiveDesc: 'Increases all Shield absorption and HP Regeneration received by 30%.'
  },
  {
    id: 'immortality',
    name: 'Immortality',
    shortName: 'Immortal',
    category: 'defense',
    icon: '👼',
    cost: 210,
    statsSummary: '+800 HP · +15 Physical Defense',
    stats: { hp: 800, physDef: 15 },
    passiveName: 'Immortal',
    passiveDesc: 'Resurrects you after fatal damage with 16% Max HP and a protective Shield.'
  },
  {
    id: 'guardian_helmet',
    name: 'Guardian Helmet',
    shortName: 'G.Helmet',
    category: 'defense',
    icon: '🪖',
    cost: 220,
    statsSummary: '+1,550 HP · +20 HP Regen',
    stats: { hp: 1550, hpRegen: 20 },
    passiveName: 'Recovery',
    passiveDesc: 'Continuously regenerates 2.5% of your Max HP every second (0.5% during combat).'
  },
  {
    id: 'cursed_helmet',
    name: 'Cursed Helmet',
    shortName: 'Cursed',
    category: 'defense',
    icon: '💀',
    cost: 180,
    statsSummary: '+1,200 HP · +20 Magic Defense',
    stats: { hp: 1200, magicDef: 20 },
    passiveName: 'Burning Soul',
    passiveDesc: 'Deals continuous Magic Damage per second based on your Max HP to all nearby enemies and creeps.'
  },
  {
    id: 'thunder_belt',
    name: 'Thunder Belt',
    shortName: 'T.Belt',
    category: 'defense',
    icon: '🌩️',
    cost: 195,
    statsSummary: '+800 HP · +15 Phys Defense · +15 Magic Defense · +20 Move Speed',
    stats: { hp: 800, physDef: 15, magicDef: 15, moveSpeedFlat: 20 },
    passiveName: 'Thunderbolt',
    passiveDesc: 'Every 4s, next basic attack deals bonus True Damage based on Hybrid Defense, slows foes, and permanently stacks Defense.'
  },
  {
    id: 'queens_wings',
    name: "Queen's Wings",
    shortName: 'Q.Wings',
    category: 'defense',
    icon: '🦅',
    cost: 200,
    statsSummary: '+40 Adaptive Attack · +600 HP · +10% CDR · +10% Spell Vamp',
    stats: { adaptiveAtk: 40, hp: 600, cdrPct: 10, spellVampPct: 10 },
    passiveName: 'Demonize',
    passiveDesc: 'When HP drops below 40%, grants 30% Damage Reduction for 3s and reduces skill cooldowns by 2 seconds.'
  },
  {
    id: 'brute_force_breastplate',
    name: 'Brute Force Breastplate',
    shortName: 'BruteFrc',
    category: 'defense',
    icon: '🥋',
    cost: 190,
    statsSummary: '+600 HP · +20 Physical Defense · +10% CDR',
    stats: { hp: 600, physDef: 20, cdrPct: 10 },
    passiveName: 'Brute Force',
    passiveDesc: 'Dealing damage grants stacking Adaptive Attack and Move Speed (up to 6 stacks) plus +15% CC Reduction at full stacks.'
  },
  {
    id: 'twilight_armor',
    name: 'Twilight Armor',
    shortName: 'Twilight',
    category: 'defense',
    icon: '🌆',
    cost: 210,
    statsSummary: '+1,200 HP · +15 Physical Defense',
    stats: { hp: 1200, physDef: 15 },
    passiveName: 'Twilight',
    passiveDesc: 'Drastically reduces excess burst damage from any single heavy hit.'
  },

  // ================= 👢 MOVEMENT / BOOTS ITEMS (7) =================
  {
    id: 'warrior_boots',
    name: 'Warrior Boots',
    shortName: 'WarriorB',
    category: 'movement',
    icon: '👢',
    cost: 75,
    statsSummary: '+40 Movement Speed · +18 Physical Defense',
    stats: { moveSpeedFlat: 40, physDef: 18 },
    passiveName: 'Valor',
    passiveDesc: 'Gains +4 extra Physical Defense each time you take Physical Damage (stacks up to 5 times).'
  },
  {
    id: 'tough_boots',
    name: 'Tough Boots',
    shortName: 'ToughB',
    category: 'movement',
    icon: '🥾',
    cost: 75,
    statsSummary: '+40 Movement Speed · +18 Magic Defense',
    stats: { moveSpeedFlat: 40, magicDef: 18, ccReductionPct: 30 },
    passiveName: 'Fortitude',
    passiveDesc: 'Reduces the duration of all Crowd Control (stuns, slows, roots) by 30%.'
  },
  {
    id: 'magic_shoes',
    name: 'Magic Shoes',
    shortName: 'MagicSh',
    category: 'movement',
    icon: '👟',
    cost: 75,
    statsSummary: '+40 Movement Speed · +10% Cooldown Reduction',
    stats: { moveSpeedFlat: 40, cdrPct: 10 },
    passiveName: 'Mystic Haste',
    passiveDesc: 'Grants +10% Cooldown Reduction for frequent spell casting.'
  },
  {
    id: 'swift_boots',
    name: 'Swift Boots',
    shortName: 'SwiftB',
    category: 'movement',
    icon: '⚡',
    cost: 75,
    statsSummary: '+40 Movement Speed · +15% Attack Speed',
    stats: { moveSpeedFlat: 40, atkSpeedPct: 15 },
    passiveName: 'Swift Stride',
    passiveDesc: 'Grants +15% Attack Speed for rapid basic attack combinations.'
  },
  {
    id: 'arcane_boots',
    name: 'Arcane Boots',
    shortName: 'ArcaneB',
    category: 'movement',
    icon: '🔮',
    cost: 75,
    statsSummary: '+40 Movement Speed · +10 Magic Penetration',
    stats: { moveSpeedFlat: 40, magicPenFlat: 10 },
    passiveName: 'Arcane Piercing',
    passiveDesc: 'Grants +10 flat Magic Penetration to pierce enemy magic resistance.'
  },
  {
    id: 'demon_shoes',
    name: 'Demon Shoes',
    shortName: 'DemonSh',
    category: 'movement',
    icon: '😈',
    cost: 75,
    statsSummary: '+40 Movement Speed · +10 Mana Regen',
    stats: { moveSpeedFlat: 40, manaRegen: 10 },
    passiveName: 'Mysticism',
    passiveDesc: 'Restores 10% Max Mana/HP sustain on hero kills/assists and 4% on minion kills.'
  },
  {
    id: 'rapid_boots',
    name: 'Rapid Boots',
    shortName: 'RapidB',
    category: 'movement',
    icon: '💨',
    cost: 85,
    statsSummary: '+65 Movement Speed · +35% Slow Reduction',
    stats: { moveSpeedFlat: 65, slowReductionPct: 35 },
    passiveName: 'Side Effect',
    passiveDesc: 'Maximum roaming velocity; Movement Speed drops slightly for 5 seconds when dealing or taking damage.'
  }
];

// ============================================================================
// 🌿 JUNGLING & ROAMING BLESSINGS (7 BLESSINGS APPLIED TO BOOTS)
// ============================================================================
export const MOBA_BOOT_BLESSINGS: MobaBootBlessing[] = [
  // Jungling Blessings (3 — Free on Boots, unlock at 5/5 Retribution Stacks)
  {
    id: 'ice_retribution',
    name: 'Ice Retribution',
    shortName: 'IceRetri',
    kind: 'jungling',
    icon: '🧊',
    cost: 0,
    summary: 'Free Jungling Blessing · Steals Move Speed (4s) at 5/5 Stacks',
    desc: 'Free Boot Blessing. Slay 5 jungle camps or heroes to evolve Retribution so it steals Movement Speed from enemy heroes for 4 seconds.'
  },
  {
    id: 'flame_retribution',
    name: 'Flame Retribution',
    shortName: 'FlameRet',
    kind: 'jungling',
    icon: '🔥',
    cost: 0,
    summary: 'Free Jungling Blessing · Steals Phys & Magic ATK (4s) at 5/5 Stacks',
    desc: 'Free Boot Blessing. Slay 5 jungle camps or heroes to evolve Retribution so it steals Physical Attack & Magic Power for 4 seconds.'
  },
  {
    id: 'bloody_retribution',
    name: 'Bloody Retribution',
    shortName: 'BloodRet',
    kind: 'jungling',
    icon: '🩸',
    cost: 0,
    summary: 'Free Jungling Blessing · Drains 12.5% Max HP at 5/5 Stacks',
    desc: 'Free Boot Blessing. Slay 5 jungle camps or heroes to evolve Retribution so it drains 12.5% Max HP from enemy heroes to heal yourself.'
  },

  // Roaming Blessings (4 — Free on Boots, unlock at 600/600 Roam Gold)
  {
    id: 'conceal',
    name: 'Conceal',
    shortName: 'Conceal',
    kind: 'roaming',
    icon: '👻',
    cost: 0,
    summary: 'Free Roaming Active · Camouflage + 45% Move Speed (5s)',
    desc: 'Free Boot Blessing. Unlocks Active Skill: Turns you and nearby allied heroes camouflaged with +45% Movement Speed for 5 seconds.',
    isActiveSkill: true,
    activeSkillId: 'conceal',
    activeCdSec: 22
  },
  {
    id: 'encourage',
    name: 'Encourage',
    shortName: 'Encourag',
    kind: 'roaming',
    icon: '📯',
    cost: 0,
    summary: 'Free Roaming Aura · +18 ATK & +15% Attack Speed to Allies',
    desc: 'Free Boot Blessing. Passive Aura: Increases the Physical Attack, Magic Power, and Attack Speed of you and all nearby allies.'
  },
  {
    id: 'favor',
    name: 'Favor',
    shortName: 'Favor',
    kind: 'roaming',
    icon: '💖',
    cost: 0,
    summary: 'Free Roaming Heal · Restores Bonus HP on Heal/Shield',
    desc: 'Free Boot Blessing. Passive Heal: Casting any healing, regen, or shielding skill restores an extra chunk of HP to yourself and nearby allies.'
  },
  {
    id: 'dire_hit',
    name: 'Dire Hit',
    shortName: 'DireHit',
    kind: 'roaming',
    icon: '💥',
    cost: 0,
    summary: 'Free Roaming Burst · Bonus Max-HP Damage vs <35% HP',
    desc: 'Free Boot Blessing. Passive Burst: Damaging an enemy hero below 35% HP deals massive bonus Hybrid Damage based on their Max HP.'
  }
];

// ============================================================================
// TIER 1 BASIC ITEMS & TIER 2 INTERMEDIATE ITEMS (CRAFTING TREE COMPONENTS)
// ============================================================================
export const MOBA_BASIC_ITEMS: MobaEquipmentItem[] = [
  {
    id: 'dagger',
    name: 'Dagger',
    shortName: 'Dagger',
    category: 'attack',
    tier: 1,
    icon: '🔪',
    cost: 35,
    statsSummary: '+15 Physical Attack',
    stats: { physAtk: 15 },
    passiveName: 'Basic Weapon',
    passiveDesc: 'Core Tier-1 Physical Attack component used in Attack upgrades.'
  },
  {
    id: 'knife',
    name: 'Knife',
    shortName: 'Knife',
    category: 'attack',
    tier: 1,
    icon: '🗡️',
    cost: 35,
    statsSummary: '+10% Attack Speed',
    stats: { atkSpeedPct: 10 },
    passiveName: 'Quick Strike',
    passiveDesc: 'Core Tier-1 Attack Speed component for Marksmen & Fighters.'
  },
  {
    id: 'javelin',
    name: 'Javelin',
    shortName: 'Javelin',
    category: 'attack',
    tier: 1,
    icon: '🎯',
    cost: 40,
    statsSummary: '+8% Critical Chance',
    stats: { critChancePct: 8 },
    passiveName: 'Keen Edge',
    passiveDesc: 'Tier-1 Critical Chance component.'
  },
  {
    id: 'mystery_codex',
    name: 'Mystery Codex',
    shortName: 'Codex',
    category: 'magic',
    tier: 1,
    icon: '📘',
    cost: 35,
    statsSummary: '+18 Magic Power',
    stats: { magicPower: 18 },
    passiveName: 'Arcane Primer',
    passiveDesc: 'Core Tier-1 Magic Power component for Mages & Supports.'
  },
  {
    id: 'power_crystal',
    name: 'Power Crystal',
    shortName: 'P.Crystal',
    category: 'magic',
    tier: 1,
    icon: '🔹',
    cost: 35,
    statsSummary: '+240 Mana · +5% CDR',
    stats: { mana: 240, cdrPct: 5 },
    passiveName: 'Mana Core',
    passiveDesc: 'Tier-1 Mana & Cooldown component.'
  },
  {
    id: 'vitality_crystal',
    name: 'Vitality Crystal',
    shortName: 'Vitality',
    category: 'defense',
    tier: 1,
    icon: '❤️',
    cost: 35,
    statsSummary: '+230 HP',
    stats: { hp: 230 },
    passiveName: 'Heartstone',
    passiveDesc: 'Core Tier-1 Max HP component.'
  },
  {
    id: 'leather_jerkin',
    name: 'Leather Jerkin',
    shortName: 'Jerkin',
    category: 'defense',
    tier: 1,
    icon: '🦺',
    cost: 35,
    statsSummary: '+15 Physical Defense',
    stats: { physDef: 15 },
    passiveName: 'Tough Hide',
    passiveDesc: 'Core Tier-1 Physical Defense component.'
  },
  {
    id: 'magic_resist_cloak',
    name: 'Magic Resist Cloak',
    shortName: 'MR Cloak',
    category: 'defense',
    tier: 1,
    icon: '🧣',
    cost: 35,
    statsSummary: '+15 Magic Defense',
    stats: { magicDef: 15 },
    passiveName: 'Spell Ward',
    passiveDesc: 'Core Tier-1 Magic Defense component.'
  },
  {
    id: 'basic_boots',
    name: 'Boots',
    shortName: 'Boots',
    category: 'movement',
    tier: 1,
    icon: '👟',
    cost: 30,
    statsSummary: '+20 Movement Speed',
    stats: { moveSpeedFlat: 20 },
    passiveName: 'Swift Footwork',
    passiveDesc: 'Tier-1 Footwear; upgrades directly into any Tier-3 Movement Boots.'
  }
];

export const MOBA_INTERMEDIATE_ITEMS: MobaEquipmentItem[] = [
  {
    id: 'legion_sword',
    name: 'Legion Sword',
    shortName: 'Legion',
    category: 'attack',
    tier: 2,
    recipe: ['dagger', 'dagger'],
    icon: '⚔️',
    cost: 95,
    statsSummary: '+60 Physical Attack',
    stats: { physAtk: 60 },
    passiveName: 'Heavy Blade',
    passiveDesc: 'High-value Tier-2 Physical Attack component for Blade of Despair & Sea Halberd.'
  },
  {
    id: 'fury_hammer',
    name: 'Fury Hammer',
    shortName: 'FuryHam',
    category: 'attack',
    tier: 2,
    recipe: ['dagger'],
    icon: '🔨',
    cost: 90,
    statsSummary: '+35 Physical Attack · +12 Physical Penetration',
    stats: { physAtk: 35, physPenFlat: 12 },
    passiveName: 'Armor Pierce',
    passiveDesc: 'Early penetration power-spike for Assassins & Fighters.'
  },
  {
    id: 'swift_crossbow',
    name: 'Swift Crossbow',
    shortName: 'Crossbow',
    category: 'attack',
    tier: 2,
    recipe: ['knife', 'dagger'],
    icon: '🏹',
    cost: 95,
    statsSummary: '+20% Attack Speed · +20 Physical Attack',
    stats: { atkSpeedPct: 20, physAtk: 20 },
    passiveName: 'Crossbow',
    passiveDesc: 'Tier-2 Attack Speed & on-hit component.'
  },
  {
    id: 'vampire_mallet',
    name: 'Vampire Mallet',
    shortName: 'VampMal',
    category: 'attack',
    tier: 2,
    recipe: ['dagger'],
    icon: '🩸',
    cost: 80,
    statsSummary: '+15 Physical Attack · +10% Lifesteal',
    stats: { physAtk: 15, lifestealPct: 10 },
    passiveName: 'Blood Drain',
    passiveDesc: 'Early lane sustain Lifesteal component.'
  },
  {
    id: 'rogue_meteor',
    name: 'Rogue Meteor',
    shortName: 'RogueMet',
    category: 'attack',
    tier: 2,
    recipe: ['javelin', 'knife'],
    icon: '☄️',
    cost: 90,
    statsSummary: '+15% Attack Speed · +10% Crit Chance',
    stats: { atkSpeedPct: 15, critChancePct: 10 },
    passiveName: 'Crit Momentum',
    passiveDesc: 'Tier-2 Critical & Attack Speed component.'
  },
  {
    id: 'magic_wand',
    name: 'Magic Wand',
    shortName: 'M.Wand',
    category: 'magic',
    tier: 2,
    recipe: ['mystery_codex'],
    icon: '🪄',
    cost: 85,
    statsSummary: '+45 Magic Power',
    stats: { magicPower: 45 },
    passiveName: 'Focused Mana',
    passiveDesc: 'Core Tier-2 Magic Power upgrade.'
  },
  {
    id: 'elegant_gem',
    name: 'Elegant Gem',
    shortName: 'ElegGem',
    category: 'magic',
    tier: 2,
    recipe: ['vitality_crystal', 'power_crystal'],
    icon: '💠',
    cost: 85,
    statsSummary: '+300 HP · +380 Mana · +5% CDR',
    stats: { hp: 300, mana: 380, cdrPct: 5 },
    passiveName: 'Gift',
    passiveDesc: 'Restores HP and Mana on level-up; core component for Clock of Destiny.'
  },
  {
    id: 'book_of_sages',
    name: 'Book of Sages',
    shortName: 'SagesBk',
    category: 'magic',
    tier: 2,
    recipe: ['power_crystal'],
    icon: '📗',
    cost: 75,
    statsSummary: '+15 Magic Power · +10% CDR',
    stats: { magicPower: 15, cdrPct: 10 },
    passiveName: 'Insight',
    passiveDesc: 'Early Cooldown Reduction component for Mages & Supports.'
  },
  {
    id: 'dreadnaught_armor',
    name: 'Dreadnaught Armor',
    shortName: 'DreadArm',
    category: 'defense',
    tier: 2,
    recipe: ['leather_jerkin', 'vitality_crystal'],
    icon: '🛡️',
    cost: 90,
    statsSummary: '+350 HP · +30 Physical Defense',
    stats: { hp: 350, physDef: 30 },
    passiveName: 'Deter (Mini)',
    passiveDesc: 'Early anti-physical skill component; upgrades into Antique Cuirass.'
  },
  {
    id: 'steel_legplates',
    name: 'Steel Legplates',
    shortName: 'Legplate',
    category: 'defense',
    tier: 2,
    recipe: ['leather_jerkin', 'leather_jerkin'],
    icon: '🦿',
    cost: 80,
    statsSummary: '+40 Physical Defense',
    stats: { physDef: 40 },
    passiveName: 'Iron Plating',
    passiveDesc: 'High-efficiency early armor component for Dominance Ice & Blade Armor.'
  },
  {
    id: 'silence_robe',
    name: 'Silence Robe',
    shortName: 'SilRobe',
    category: 'defense',
    tier: 2,
    recipe: ['magic_resist_cloak', 'vitality_crystal'],
    icon: '🧥',
    cost: 90,
    statsSummary: '+450 HP · +25 Magic Defense',
    stats: { hp: 450, magicDef: 25 },
    passiveName: 'Aegis Weave',
    passiveDesc: 'Early anti-mage component for Athena Shield, Radiant Armor & Oracle.'
  },
  {
    id: 'ares_belt',
    name: 'Ares Belt',
    shortName: 'AresBelt',
    category: 'defense',
    tier: 2,
    recipe: ['vitality_crystal', 'vitality_crystal'],
    icon: '🥋',
    cost: 90,
    statsSummary: '+680 HP',
    stats: { hp: 680 },
    passiveName: 'Titan Vigor',
    passiveDesc: 'High-HP Tier-2 belt for Guardian Helmet, Immortality & Twilight Armor.'
  }
];

export const MOBA_ITEM_RECIPES: Record<string, string[]> = {
  // Attack (17)
  bod: ['legion_sword', 'legion_sword'],
  malefic_roar: ['legion_sword', 'fury_hammer'],
  malefic_gun: ['swift_crossbow', 'vampire_mallet'],
  hunter_strike: ['fury_hammer', 'dagger'],
  heptaseas: ['fury_hammer', 'vitality_crystal'],
  endless_battle: ['vampire_mallet', 'book_of_sages'],
  dhs: ['swift_crossbow', 'vampire_mallet'],
  golden_staff: ['swift_crossbow', 'knife'],
  corrosion_scythe: ['swift_crossbow', 'knife'],
  windtalker: ['rogue_meteor', 'knife'],
  berserkers_fury: ['legion_sword', 'javelin'],
  haas_claws: ['vampire_mallet', 'rogue_meteor'],
  great_dragon_spear: ['legion_sword', 'javelin'],
  sea_halberd: ['legion_sword', 'knife'],
  rose_gold_meteor: ['vampire_mallet', 'magic_resist_cloak'],
  wind_of_nature: ['vampire_mallet', 'knife'],
  war_axe: ['fury_hammer', 'vitality_crystal'],
  // Magic (15)
  holy_crystal: ['magic_wand', 'magic_wand'],
  divine_glaive: ['magic_wand', 'mystery_codex'],
  genius_wand: ['magic_wand', 'mystery_codex'],
  lightning_truncheon: ['magic_wand', 'power_crystal'],
  blood_wings: ['magic_wand', 'magic_wand'],
  clock_of_destiny: ['elegant_gem', 'mystery_codex'],
  glowing_wand: ['magic_wand', 'vitality_crystal'],
  ice_queen_wand: ['magic_wand', 'vitality_crystal'],
  concentrated_energy: ['magic_wand', 'vitality_crystal'],
  wishing_lantern: ['magic_wand', 'book_of_sages'],
  starlium_scythe: ['magic_wand', 'book_of_sages'],
  feather_of_heaven: ['magic_wand', 'knife'],
  enchanted_talisman: ['book_of_sages', 'power_crystal'],
  fleeting_time: ['book_of_sages', 'vitality_crystal'],
  winter_crown: ['magic_wand', 'vitality_crystal'],
  // Defense (13)
  dominance_ice: ['steel_legplates', 'power_crystal'],
  antique_cuirass: ['dreadnaught_armor', 'ares_belt'],
  blade_armor: ['steel_legplates', 'leather_jerkin'],
  radiant_armor: ['silence_robe', 'magic_resist_cloak'],
  athenas_shield: ['silence_robe', 'magic_resist_cloak'],
  oracle: ['silence_robe', 'book_of_sages'],
  immortality: ['ares_belt', 'leather_jerkin'],
  guardian_helmet: ['ares_belt', 'vitality_crystal'],
  cursed_helmet: ['ares_belt', 'magic_resist_cloak'],
  thunder_belt: ['dreadnaught_armor', 'magic_resist_cloak'],
  queens_wings: ['ares_belt', 'dagger'],
  brute_force_breastplate: ['dreadnaught_armor', 'book_of_sages'],
  twilight_armor: ['ares_belt', 'steel_legplates'],
  // Movement / Boots (7)
  warrior_boots: ['basic_boots', 'leather_jerkin'],
  tough_boots: ['basic_boots', 'magic_resist_cloak'],
  magic_shoes: ['basic_boots', 'power_crystal'],
  swift_boots: ['basic_boots', 'knife'],
  arcane_boots: ['basic_boots', 'mystery_codex'],
  demon_shoes: ['basic_boots', 'power_crystal'],
  rapid_boots: ['basic_boots']
};

for (const item of MOBA_EQUIPMENT_ITEMS) {
  item.tier = 3;
  if (!item.recipe && MOBA_ITEM_RECIPES[item.id]) {
    item.recipe = MOBA_ITEM_RECIPES[item.id];
  }
}

export const ALL_MOBA_SHOP_ITEMS: MobaEquipmentItem[] = [
  ...MOBA_BASIC_ITEMS,
  ...MOBA_INTERMEDIATE_ITEMS,
  ...MOBA_EQUIPMENT_ITEMS
];

export const ROLE_RECOMMENDED_BUILDS: Record<MobaRole, string[]> = {
  Marksman: ['swift_boots', 'windtalker', 'berserkers_fury', 'haas_claws', 'malefic_gun', 'wind_of_nature'],
  Assassin: ['tough_boots', 'heptaseas', 'hunter_strike', 'endless_battle', 'malefic_roar', 'bod'],
  Fighter: ['warrior_boots', 'war_axe', 'endless_battle', 'brute_force_breastplate', 'queens_wings', 'immortality'],
  Mage: ['arcane_boots', 'enchanted_talisman', 'lightning_truncheon', 'holy_crystal', 'divine_glaive', 'winter_crown'],
  Tank: ['tough_boots', 'dominance_ice', 'antique_cuirass', 'athenas_shield', 'guardian_helmet', 'immortality'],
  Support: ['magic_shoes', 'fleeting_time', 'oracle', 'dominance_ice', 'ice_queen_wand', 'immortality']
};

export interface MobaBuildPreset {
  name: string;
  items: string[];
}

export const ROLE_BUILD_PRESETS: Record<MobaRole, MobaBuildPreset[]> = {
  Marksman: [
    { name: 'Pro Crit DPS', items: ROLE_RECOMMENDED_BUILDS.Marksman },
    { name: 'Trinity Tank-Shred', items: ['swift_boots', 'corrosion_scythe', 'dhs', 'golden_staff', 'malefic_gun', 'rose_gold_meteor'] },
    { name: 'Anti-Heal Survival', items: ['tough_boots', 'sea_halberd', 'windtalker', 'berserkers_fury', 'wind_of_nature', 'immortality'] }
  ],
  Assassin: [
    { name: 'Pro Burst Pen', items: ROLE_RECOMMENDED_BUILDS.Assassin },
    { name: 'Sustain Skirmisher', items: ['tough_boots', 'war_axe', 'endless_battle', 'rose_gold_meteor', 'malefic_roar', 'immortality'] },
    { name: 'Anti-Heal Execute', items: ['magic_shoes', 'heptaseas', 'sea_halberd', 'hunter_strike', 'malefic_roar', 'bod'] }
  ],
  Fighter: [
    { name: 'Pro Sustain Bruiser', items: ROLE_RECOMMENDED_BUILDS.Fighter },
    { name: 'Full Damage Carry', items: ['warrior_boots', 'war_axe', 'hunter_strike', 'sea_halberd', 'bod', 'rose_gold_meteor'] },
    { name: 'Frontline Anti-Heal', items: ['tough_boots', 'war_axe', 'dominance_ice', 'oracle', 'antique_cuirass', 'immortality'] }
  ],
  Mage: [
    { name: 'Pro Burst Mage', items: ROLE_RECOMMENDED_BUILDS.Mage },
    { name: 'Anti-Heal Burn', items: ['arcane_boots', 'enchanted_talisman', 'glowing_wand', 'ice_queen_wand', 'divine_glaive', 'blood_wings'] },
    { name: 'Safe Sustain', items: ['tough_boots', 'clock_of_destiny', 'concentrated_energy', 'holy_crystal', 'winter_crown', 'immortality'] }
  ],
  Tank: [
    { name: 'Pro Roam Tank', items: ROLE_RECOMMENDED_BUILDS.Tank },
    { name: 'Anti-Mage Wall', items: ['tough_boots', 'dominance_ice', 'athenas_shield', 'radiant_armor', 'oracle', 'immortality'] },
    { name: 'Bruiser Thunder', items: ['warrior_boots', 'thunder_belt', 'cursed_helmet', 'blade_armor', 'guardian_helmet', 'immortality'] }
  ],
  Support: [
    { name: 'Pro Utility Roam', items: ROLE_RECOMMENDED_BUILDS.Support },
    { name: 'Anti-Heal Poke', items: ['magic_shoes', 'enchanted_talisman', 'glowing_wand', 'ice_queen_wand', 'oracle', 'winter_crown'] },
    { name: 'Tanky Protector', items: ['tough_boots', 'dominance_ice', 'oracle', 'antique_cuirass', 'athenas_shield', 'immortality'] }
  ]
};

const EQUIP_BY_ID = new Map<string, MobaEquipmentItem>(ALL_MOBA_SHOP_ITEMS.map((item) => [item.id, item]));
const EQUIP_ALIASES: Record<string, string> = {
  blade_of_despair: 'bod',
  demon_hunter_sword: 'dhs',
  won: 'wind_of_nature',
  blade_of_the_heptaseas: 'heptaseas'
};
for (const [alias, target] of Object.entries(EQUIP_ALIASES)) {
  const it = EQUIP_BY_ID.get(target);
  if (it) EQUIP_BY_ID.set(alias, it);
}

const BLESSING_BY_ID = new Map<string, MobaBootBlessing>(MOBA_BOOT_BLESSINGS.map((b) => [b.id, b]));
const BLESSING_ALIASES: Record<string, string> = {
  roam_conceal: 'conceal',
  roam_favor: 'favor',
  roam_dire_hit: 'dire_hit',
  roam_encourage: 'encourage',
  jungle_ice: 'ice_retribution',
  jungle_flame: 'flame_retribution',
  jungle_bloody: 'bloody_retribution'
};
for (const [alias, target] of Object.entries(BLESSING_ALIASES)) {
  const bl = BLESSING_BY_ID.get(target);
  if (bl) BLESSING_BY_ID.set(alias, bl);
}

export function getMobaEquipmentById(id: string): MobaEquipmentItem | undefined {
  return EQUIP_BY_ID.get(id);
}

export function getMobaBlessingById(id: string | null | undefined): MobaBootBlessing | undefined {
  if (!id) return undefined;
  return BLESSING_BY_ID.get(id);
}

export interface ComputedMobaStats {
  maxHp: number;
  atkDmg: number;
  physDef: number;
  magicDef: number;
  damageReductionPct: number;
  atkSpeedMult: number; // > 1 means faster attack speed multiplier
  moveSpeed: number;
  atkRange: number;
  critChance: number; // 0..100 percentage
  critMult: number;
  lifestealRatio: number;
  cdrRatio: number; // capped at 0.40 or 0.45 with Enchanted Talisman
  cdrPct: number; // 0..45 percentage
  penRatio: number;
  hpRegenPerSec: number;
  hasAntiHeal: boolean;
  hasImmortality: boolean;
  hasBurningSoul: boolean;
  hasDespair: boolean;
  hasDevour: boolean;
  hasDivineJustice: boolean;
  hasAmbush: boolean;
  hasLifeline: boolean;
  hasLifelineShield: boolean;
  hasDireHit: boolean;
  hasTyphoon: boolean;
  hasTimestream: boolean;
  hasIceBound: boolean;
  hasThunderbolt: boolean;
  activeKind: MobaActiveSkillId | null;
  activeLabel: string;
  activeIcon: string;
  activeCdSec: number;
  activeSkill: {
    id: MobaActiveSkillId;
    name: string;
    shortLabel: string;
    icon: string;
    cdSec: number;
  } | null;
}

export function computeMobaEquippedStats(
  hero: MobaHeroDef,
  emblemBonus: { hpBonus: number; atkBonus: number; spdBonus: number; cdReduction: number },
  equippedIds: string[],
  blessingId: string | null,
  blueBuffActive: boolean,
  redBuffActive: boolean,
  heroLevel = 1
): ComputedMobaStats {
  let bonusHp = emblemBonus.hpBonus;
  let physAtk = 0;
  let magicPower = 0;
  let adaptiveAtk = emblemBonus.atkBonus;
  let physDef = hero.role === 'Tank' ? 28 : hero.role === 'Fighter' ? 18 : 10;
  let magicDef = hero.role === 'Tank' ? 24 : hero.role === 'Support' ? 16 : 10;
  let atkSpeedPct = 0;
  let critChancePct = 0;
  let critDmgPct = 0;
  let penPct = 0;
  let penFlat = 0;
  let lifestealPct = 0;
  let cdrPct = emblemBonus.cdReduction * 100;
  let moveSpeedPct = 0;
  let moveSpeedFlat = 0;
  let hpRegen = 1;
  let rangeBonusMult = 1.0;

  const canonicalIds = equippedIds.map((id) => EQUIP_BY_ID.get(id)?.id ?? id);
  const idSet = new Set(canonicalIds);
  const canonicalBlessingId = getMobaBlessingById(blessingId)?.id ?? blessingId;
  let activeSkill: ComputedMobaStats['activeSkill'] = null;

  for (const id of canonicalIds) {
    const it = EQUIP_BY_ID.get(id);
    if (!it) continue;
    const s = it.stats;
    if (s.hp) bonusHp += Math.round(s.hp * 0.22); // scaled cleanly to arena HP pool (140..650)
    if (s.physAtk) physAtk += s.physAtk;
    if (s.magicPower) magicPower += s.magicPower;
    if (s.adaptiveAtk) adaptiveAtk += s.adaptiveAtk;
    if (s.physDef) physDef += s.physDef;
    if (s.magicDef) magicDef += s.magicDef;
    if (s.atkSpeedPct) atkSpeedPct += s.atkSpeedPct;
    if (s.critChancePct) critChancePct += s.critChancePct;
    if (s.critDmgPct) critDmgPct += s.critDmgPct;
    if (s.physPenPct) penPct += s.physPenPct;
    if (s.magicPenPct) penPct += s.magicPenPct;
    if (s.physPenFlat) penFlat += s.physPenFlat;
    if (s.magicPenFlat) penFlat += s.magicPenFlat;
    if (s.lifestealPct) lifestealPct += s.lifestealPct;
    if (s.spellVampPct) lifestealPct += s.spellVampPct;
    if (s.hybridLifestealPct) lifestealPct += s.hybridLifestealPct;
    if (s.cdrPct) cdrPct += s.cdrPct;
    if (s.moveSpeedPct) moveSpeedPct += s.moveSpeedPct;
    if (s.moveSpeedFlat) moveSpeedFlat += s.moveSpeedFlat;
    if (s.hpRegen) hpRegen += s.hpRegen;

    if (it.isActiveSkill && it.activeSkillId) {
      activeSkill = {
        id: it.activeSkillId,
        name: it.name,
        shortLabel: it.shortName.toUpperCase(),
        icon: it.icon,
        cdSec: it.activeCdSec ?? 20
      };
    }
  }

  // Holy Crystal Mystery passive (+21% to +35% Magic Power)
  if (idSet.has('holy_crystal')) {
    const mult = 1.21 + Math.min(0.14, (heroLevel - 1) * 0.02);
    magicPower = Math.round(magicPower * mult);
  }

  // Golden Staff Swift passive: converts Crit Chance into Attack Speed
  if (idSet.has('golden_staff')) {
    atkSpeedPct += critChancePct;
    critChancePct = 0;
  }

  // Malefic Gun +15% Basic Attack Range
  if (idSet.has('malefic_gun')) {
    rangeBonusMult = 1.15;
  }

  // Encourage Roaming Blessing aura
  if (canonicalBlessingId === 'encourage') {
    adaptiveAtk += 18;
    atkSpeedPct += 15;
  }

  const blessing = getMobaBlessingById(canonicalBlessingId);
  if (blessing?.isActiveSkill && blessing.activeSkillId && !activeSkill) {
    activeSkill = {
      id: blessing.activeSkillId,
      name: blessing.name,
      shortLabel: blessing.shortName.toUpperCase(),
      icon: blessing.icon,
      cdSec: blessing.activeCdSec ?? 22
    };
  }

  // Blue & Orange Buff Golem stat boosts
  if (blueBuffActive) {
    cdrPct += 20;
    hpRegen += 8;
  }

  // Enchanted Talisman raises CDR cap from 40% to 45%
  const cdrCap = idSet.has('enchanted_talisman') ? 45 : 40;
  const finalCdrPct = Math.round(Math.min(cdrCap, cdrPct));
  const cdrRatio = finalCdrPct / 100;

  // Convert item Physical / Magic / Adaptive power into combat attack damage
  const rawPower = Math.round((physAtk + magicPower) * 0.24 + adaptiveAtk * 0.32);
  let totalAtk = hero.atkDmg + rawPower;
  if (redBuffActive) {
    totalAtk = Math.round(totalAtk * 1.22);
  }

  const totalDef = physDef + magicDef;
  const damageReductionPct = Math.min(0.62, totalDef / (totalDef + 140));

  // Guardian Helmet passive recovery
  if (idSet.has('guardian_helmet')) {
    hpRegen += Math.max(4, Math.round((hero.maxHp + bonusHp) * 0.025));
  }
  // Oracle +30% regen & shield boost
  if (idSet.has('oracle')) {
    hpRegen = Math.round(hpRegen * 1.3);
  }

  const atkSpeedMult = Number((1 + atkSpeedPct / 100).toFixed(3));
  const moveSpeed = Number(
    (
      (hero.moveSpeed + emblemBonus.spdBonus + 1.2 + moveSpeedFlat * 0.035) *
      (1 + moveSpeedPct / 100)
    ).toFixed(2)
  );
  const hasLifeline = idSet.has('rose_gold_meteor') || idSet.has('blood_wings') || idSet.has('queens_wings');

  return {
    maxHp: hero.maxHp + bonusHp,
    atkDmg: totalAtk,
    physDef,
    magicDef,
    damageReductionPct: Number(damageReductionPct.toFixed(3)),
    atkSpeedMult,
    moveSpeed,
    atkRange: Number((hero.atkRange * rangeBonusMult).toFixed(2)),
    critChance: Math.min(85, critChancePct),
    critMult: 1.5 + critDmgPct / 100,
    lifestealRatio: Math.min(0.6, lifestealPct / 100),
    cdrRatio: Number(cdrRatio.toFixed(3)),
    cdrPct: finalCdrPct,
    penRatio: Math.min(0.65, penPct / 100 + penFlat * 0.006),
    hpRegenPerSec: hpRegen,
    hasAntiHeal: idSet.has('sea_halberd') || idSet.has('glowing_wand') || idSet.has('dominance_ice'),
    hasImmortality: idSet.has('immortality'),
    hasBurningSoul: idSet.has('cursed_helmet'),
    hasDespair: idSet.has('bod'),
    hasDevour: idSet.has('dhs') || idSet.has('glowing_wand') || idSet.has('wishing_lantern'),
    hasDivineJustice: idSet.has('endless_battle') || idSet.has('starlium_scythe') || idSet.has('calamity_reaper'),
    hasAmbush: idSet.has('heptaseas') || idSet.has('shadow_twinblades'),
    hasLifeline,
    hasLifelineShield: hasLifeline,
    hasDireHit: canonicalBlessingId === 'dire_hit',
    hasTyphoon: idSet.has('windtalker') || idSet.has('lightning_truncheon'),
    hasTimestream: idSet.has('fleeting_time'),
    hasIceBound: idSet.has('ice_queen_wand') || idSet.has('corrosion_scythe'),
    hasThunderbolt: idSet.has('thunder_belt'),
    activeKind: activeSkill ? activeSkill.id : null,
    activeLabel: activeSkill ? activeSkill.shortLabel : 'ACTIVE',
    activeIcon: activeSkill ? activeSkill.icon : '⚡',
    activeCdSec: activeSkill ? activeSkill.cdSec : 20,
    activeSkill
  };
}

export interface MobaQuickBuyRec {
  kind: 'item' | 'blessing';
  id: string;
  name: string;
  shortName: string;
  icon: string;
  cost: number;
  statsLabel: string;
  canAfford: boolean;
  item?: MobaEquipmentItem;
  blessing?: MobaBootBlessing;
}

export function getItemRecipe(itemId: string): string[] {
  const canonical = EQUIP_BY_ID.get(itemId);
  if (!canonical) return [];
  return canonical.recipe ? [...canonical.recipe] : [];
}

export interface CraftedCostBreakdown {
  item: MobaEquipmentItem;
  totalCost: number;
  netCost: number;
  consumedSlotIndices: number[];
  ownedComponentIds: string[];
  missingComponentIds: string[];
}

export function computeEffectiveItemCost(
  itemId: string,
  equippedIds: string[]
): CraftedCostBreakdown | null {
  const item = EQUIP_BY_ID.get(itemId);
  if (!item) return null;

  const recipe = item.recipe ?? [];
  const canonicalEquipped = equippedIds.map((id) => EQUIP_BY_ID.get(id)?.id ?? id);
  const usedSlots = new Set<number>();
  const ownedComponentIds: string[] = [];
  const missingComponentIds: string[] = [];
  let deducted = 0;

  const tryMatch = (compId: string): boolean => {
    for (let i = 0; i < canonicalEquipped.length; i++) {
      if (usedSlots.has(i)) continue;
      if (canonicalEquipped[i] === compId) {
        usedSlots.add(i);
        ownedComponentIds.push(compId);
        deducted += EQUIP_BY_ID.get(compId)?.cost ?? 0;
        return true;
      }
    }
    // Check one level deeper (Tier-1 components owned toward a Tier-2 recipe component)
    const compItem = EQUIP_BY_ID.get(compId);
    if (compItem?.recipe && compItem.recipe.length > 0) {
      let matchedAnySub = false;
      for (const subId of compItem.recipe) {
        for (let i = 0; i < canonicalEquipped.length; i++) {
          if (usedSlots.has(i)) continue;
          if (canonicalEquipped[i] === subId) {
            usedSlots.add(i);
            ownedComponentIds.push(subId);
            deducted += EQUIP_BY_ID.get(subId)?.cost ?? 0;
            matchedAnySub = true;
            break;
          }
        }
      }
      if (matchedAnySub) {
        missingComponentIds.push(compId);
        return false;
      }
    }
    missingComponentIds.push(compId);
    return false;
  };

  for (const compId of recipe) {
    tryMatch(compId);
  }

  return {
    item,
    totalCost: item.cost,
    netCost: Math.max(0, item.cost - deducted),
    consumedSlotIndices: Array.from(usedSlots).sort((a, b) => a - b),
    ownedComponentIds,
    missingComponentIds
  };
}

export function computeSellRefund(itemId: string): number {
  const item = EQUIP_BY_ID.get(itemId);
  return item ? Math.round(item.cost * 0.6) : 60;
}

export interface CraftedPurchaseResult {
  ok: boolean;
  reason?: string;
  nextEquippedIds: string[];
  nextGold: number;
  spentGold: number;
  consumedCount: number;
  item?: MobaEquipmentItem;
}

export function applyCraftedPurchase(
  itemId: string,
  equippedIds: string[],
  gold: number
): CraftedPurchaseResult {
  const breakdown = computeEffectiveItemCost(itemId, equippedIds);
  if (!breakdown) {
    return { ok: false, reason: 'Unknown item', nextEquippedIds: [...equippedIds], nextGold: gold, spentGold: 0, consumedCount: 0 };
  }
  const { item, netCost, consumedSlotIndices } = breakdown;
  const canonicalEquipped = equippedIds.map((id) => EQUIP_BY_ID.get(id)?.id ?? id);
  const consumedSet = new Set(consumedSlotIndices);
  const remaining = canonicalEquipped.filter((_, idx) => !consumedSet.has(idx));

  // Only 1 Footwear allowed (upgrading Basic Boots -> Tier-3 Boots is allowed because Basic Boots is consumed)
  if (
    item.category === 'movement' &&
    remaining.some((id) => EQUIP_BY_ID.get(id)?.category === 'movement')
  ) {
    return {
      ok: false,
      reason: 'Only 1 pair of Boots can be equipped!',
      nextEquippedIds: [...equippedIds],
      nextGold: gold,
      spentGold: 0,
      consumedCount: 0,
      item
    };
  }

  if (remaining.length >= 6) {
    return {
      ok: false,
      reason: 'Inventory full (6/6)! Sell an item first.',
      nextEquippedIds: [...equippedIds],
      nextGold: gold,
      spentGold: 0,
      consumedCount: 0,
      item
    };
  }

  if (gold < netCost) {
    return {
      ok: false,
      reason: `Need ${Math.ceil(netCost - gold)} more Gold for ${item.name}!`,
      nextEquippedIds: [...equippedIds],
      nextGold: gold,
      spentGold: 0,
      consumedCount: 0,
      item
    };
  }

  return {
    ok: true,
    nextEquippedIds: [...remaining, item.id],
    nextGold: gold - netCost,
    spentGold: netCost,
    consumedCount: consumedSlotIndices.length,
    item
  };
}

export function getNextQuickBuyRecommendation(
  role: MobaRole,
  equippedIds: string[],
  blessingId: string | null,
  gold: number,
  customBuildIds?: string[],
  prioritizedItemId?: string | null
): MobaQuickBuyRec | null {
  const canonicalIds = equippedIds.map((id) => EQUIP_BY_ID.get(id)?.id ?? id);
  const hasTier3Boots = canonicalIds.some((id) => {
    const it = EQUIP_BY_ID.get(id);
    return it?.category === 'movement' && (it.tier ?? 3) === 3;
  });

  // Prioritize locked target item first if not already owned
  if (prioritizedItemId) {
    const prio = EQUIP_BY_ID.get(prioritizedItemId);
    if (prio && !canonicalIds.includes(prio.id)) {
      const bd = computeEffectiveItemCost(prio.id, canonicalIds);
      if (bd) {
        return {
          kind: 'item',
          id: prio.id,
          name: prio.name,
          shortName: prio.shortName,
          icon: prio.icon,
          cost: bd.netCost,
          statsLabel: prio.statsSummary,
          canAfford: gold >= bd.netCost,
          item: prio
        };
      }
    }
  }

  // If player has Tier-3 boots and at least 1 other item but no blessing yet, recommend role blessing (FREE)
  if (hasTier3Boots && !blessingId && canonicalIds.length >= 2) {
    const defaultBlessingId =
      role === 'Assassin'
        ? 'ice_retribution'
        : role === 'Tank'
          ? 'conceal'
          : role === 'Support'
            ? 'favor'
            : role === 'Fighter'
              ? 'bloody_retribution'
              : 'dire_hit';
    const bl = BLESSING_BY_ID.get(defaultBlessingId) ?? MOBA_BOOT_BLESSINGS[0];
    return {
      kind: 'blessing',
      id: bl.id,
      name: bl.name,
      shortName: bl.shortName,
      icon: bl.icon,
      cost: bl.cost,
      statsLabel: bl.summary,
      canAfford: gold >= bl.cost,
      blessing: bl
    };
  }

  const buildOrder =
    customBuildIds && customBuildIds.length > 0
      ? customBuildIds
      : ROLE_RECOMMENDED_BUILDS[role] || ROLE_RECOMMENDED_BUILDS.Fighter;

  for (const itemId of buildOrder) {
    const cand = EQUIP_BY_ID.get(itemId);
    if (!cand || canonicalIds.includes(cand.id)) continue;
    if (cand.category === 'movement' && hasTier3Boots) continue;
    const bd = computeEffectiveItemCost(cand.id, canonicalIds);
    const netCost = bd ? bd.netCost : cand.cost;
    const slotsAfter = canonicalIds.length - (bd?.consumedSlotIndices.length ?? 0);
    if (slotsAfter >= 6) continue;
    return {
      kind: 'item',
      id: cand.id,
      name: cand.name,
      shortName: cand.shortName,
      icon: cand.icon,
      cost: netCost,
      statsLabel: cand.statsSummary,
      canAfford: gold >= netCost,
      item: cand
    };
  }

  if (canonicalIds.length >= 6) {
    if (hasTier3Boots && !blessingId) {
      const bl = MOBA_BOOT_BLESSINGS[0];
      return {
        kind: 'blessing',
        id: bl.id,
        name: bl.name,
        shortName: bl.shortName,
        icon: bl.icon,
        cost: bl.cost,
        statsLabel: bl.summary,
        canAfford: gold >= bl.cost,
        blessing: bl
      };
    }
    return null;
  }

  for (const cand of MOBA_EQUIPMENT_ITEMS) {
    if (canonicalIds.includes(cand.id)) continue;
    if (cand.category === 'movement' && hasTier3Boots) continue;
    const bd = computeEffectiveItemCost(cand.id, canonicalIds);
    const netCost = bd ? bd.netCost : cand.cost;
    return {
      kind: 'item',
      id: cand.id,
      name: cand.name,
      shortName: cand.shortName,
      icon: cand.icon,
      cost: netCost,
      statsLabel: cand.statsSummary,
      canAfford: gold >= netCost,
      item: cand
    };
  }
  return null;
}

export function getQuickBuyPair(
  role: MobaRole,
  equippedIds: string[],
  blessingId: string | null,
  gold: number,
  customBuildIds?: string[],
  prioritizedItemId?: string | null
): MobaQuickBuyRec[] {
  const results: MobaQuickBuyRec[] = [];
  const seen = new Set<string>();
  const primary = getNextQuickBuyRecommendation(
    role,
    equippedIds,
    blessingId,
    gold,
    customBuildIds,
    prioritizedItemId
  );
  if (!primary) return results;

  // If primary is a Tier-3 item that isn't yet affordable, offer its first missing component alongside it!
  if (primary.kind === 'item' && primary.item && (primary.item.tier ?? 3) > 1) {
    const bd = computeEffectiveItemCost(primary.id, equippedIds);
    const missing = bd?.missingComponentIds ?? [];
    if (gold >= primary.cost) {
      results.push(primary);
      seen.add(primary.id);
    } else if (missing.length > 0) {
      const firstComp = EQUIP_BY_ID.get(missing[0]);
      if (firstComp) {
        const compBd = computeEffectiveItemCost(firstComp.id, equippedIds);
        const compCost = compBd ? compBd.netCost : firstComp.cost;
        const canFit = equippedIds.length - (compBd?.consumedSlotIndices.length ?? 0) < 6;
        if (canFit) {
          results.push({
            kind: 'item',
            id: firstComp.id,
            name: firstComp.name,
            shortName: firstComp.shortName,
            icon: firstComp.icon,
            cost: compCost,
            statsLabel: `${firstComp.statsSummary} (→ ${primary.shortName})`,
            canAfford: gold >= compCost,
            item: firstComp
          });
          seen.add(firstComp.id);
        }
      }
      // Also push the parent Tier-3 target as slot 2 (or a second missing Tier-1 sub-component if cheaper)
      if (!seen.has(primary.id)) {
        results.push(primary);
        seen.add(primary.id);
      }
      return results.slice(0, 2);
    }
  }

  if (!seen.has(primary.id)) {
    results.push(primary);
    seen.add(primary.id);
  }

  // Fill slot 2 with the next unowned build item or affordable Tier-1/2 component
  const buildOrder =
    customBuildIds && customBuildIds.length > 0
      ? customBuildIds
      : ROLE_RECOMMENDED_BUILDS[role] || ROLE_RECOMMENDED_BUILDS.Fighter;
  const canonicalIds = equippedIds.map((id) => EQUIP_BY_ID.get(id)?.id ?? id);
  const hasTier3Boots = canonicalIds.some((id) => {
    const it = EQUIP_BY_ID.get(id);
    return it?.category === 'movement' && (it.tier ?? 3) === 3;
  });

  for (const itemId of buildOrder) {
    if (results.length >= 2) break;
    const cand = EQUIP_BY_ID.get(itemId);
    if (!cand || seen.has(cand.id) || canonicalIds.includes(cand.id)) continue;
    if (cand.category === 'movement' && hasTier3Boots) continue;
    const bd = computeEffectiveItemCost(cand.id, canonicalIds);
    const netCost = bd ? bd.netCost : cand.cost;
    const slotsAfter = canonicalIds.length - (bd?.consumedSlotIndices.length ?? 0);
    if (slotsAfter >= 6) continue;
    results.push({
      kind: 'item',
      id: cand.id,
      name: cand.name,
      shortName: cand.shortName,
      icon: cand.icon,
      cost: netCost,
      statsLabel: cand.statsSummary,
      canAfford: gold >= netCost,
      item: cand
    });
    seen.add(cand.id);
  }

  return results.slice(0, 2);
}
