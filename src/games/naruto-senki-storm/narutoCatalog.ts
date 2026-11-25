import { NARUTO_SEEDS_PART_1 } from './narutoSeedsPart1';
import { NARUTO_SEEDS_PART_2 } from './narutoSeedsPart2';
export type NarutoFaction =
  | 'Konoha'
  | 'Five Kage & Legends'
  | 'Akatsuki & Villains'
  | 'Boruto & Otsutsuki';

export type NarutoModeId = 'senki_3v3' | 'senki_4v4' | 'storm_3v3' | 'storm_1v1';

export type NarutoStageId =
  | 'konoha_gates'
  | 'valley_of_end'
  | 'chunin_arena'
  | 'shinobi_war_crater'
  | 'kaguya_dimension';

export type StormSupportType = 'attack' | 'guard' | 'charge' | 'cover_fire';

export type NarutoWeaponKind =
  | 'kunai'
  | 'sword'
  | 'samehada'
  | 'scythe'
  | 'fan'
  | 'staff'
  | 'puppet'
  | 'gourd'
  | 'fists'
  | 'paper'
  | 'bones'
  | 'rods';

export type SenkiSkillActionKind =
  | 'melee_dash'
  | 'projectile'
  | 'aoe_burst'
  | 'summon_clones'
  | 'heal_aura'
  | 'pull_vortex'
  | 'trap_zone'
  | 'beam_laser'
  | 'form_awakening';

export type SenkiInnateTraitKind =
  | 'clone_synergy'
  | 'sharingan_crit'
  | 'combo_slam'
  | 'cooldown_mastery'
  | 'ranged_specialist'
  | 'taijutsu_speed'
  | 'gentle_fist'
  | 'shadow_control'
  | 'giant_constitution'
  | 'companion_assist'
  | 'insect_dot'
  | 'sand_shield'
  | 'lifesteal_drain'
  | 'jashin_immortal'
  | 'rinnegan_gravity'
  | 'kamui_evasion'
  | 'snake_rebirth'
  | 'raijin_flash'
  | 'hashirama_regen'
  | 'bone_reflect'
  | 'berserk_low_hp'
  | 'hydrification'
  | 'dimension_shift'
  | 'karma_absorb';

export interface SenkiSkillSpec {
  slot: 1 | 2 | 3 | 4 | 5; // 1-3: Normal Skills (Lv.1-3), 4: Ougi 1 (Lv.4), 5: Ougi 2 / Awakening (Lv.6)
  name: string;
  shortLabel: string;
  icon: string;
  unlockLevel: 1 | 2 | 3 | 4 | 6;
  cdSec: number;
  cooldown: number;
  dmgMult: number;
  damage: number;
  rangePx: number;
  range: number;
  actionKind: SenkiSkillActionKind;
  kind: string;
  hasSuperArmor: boolean;
  grantsSuperArmor: boolean;
  hasIFrames: boolean;
  grantsIFrames: boolean;
  hitsTowers: boolean;
  cloneCount?: number;
  spawnsClones?: number;
  stunSec?: number;
  healPct?: number;
  healsAlliesPct?: number;
  transformSec?: number;
  vfxColor: string;
  color: string;
  description: string;
  desc: string;
}

export type NarutoSkillDef = SenkiSkillSpec;

export interface NarutoShinobiDef {
  id: number;
  name: string;
  title: string;
  faction: NarutoFaction;
  village: string;
  role: string;
  icon: string;
  cost: number; // 0 = Starter free hero, 120-500 = Garden Coins
  unlockCost: number;
  maxHp: number;
  baseHp: number;
  atkDmg: number;
  baseAtk: number;
  moveSpeed: number;
  speed: number;
  isRanged: boolean;
  hoverFlight?: boolean;
  bodyColor: number;
  primaryColor: number;
  cloakColor: number;
  accentColor: number;
  chakraColor: number;
  hairColor: number;
  weaponKind: NarutoWeaponKind;
  weapon: NarutoWeaponKind;
  // Part 1: Naruto Senki (2D MOBA / Brawler)
  senkiTraitName: string;
  senkiTraitDesc: string;
  passiveName: string;
  passiveDesc: string;
  senkiTraitKind: SenkiInnateTraitKind;
  passiveTrait: string;
  senkiSkills: [SenkiSkillSpec, SenkiSkillSpec, SenkiSkillSpec, SenkiSkillSpec, SenkiSkillSpec];
  skills: [SenkiSkillSpec, SenkiSkillSpec, SenkiSkillSpec, SenkiSkillSpec, SenkiSkillSpec];
  // Part 2: Naruto: Ultimate Ninja Storm (3D Arena Fighter)
  stormTraitName: string;
  stormTraitDesc: string;
  stormNinjutsu: { name: string; desc: string; chakraCost: number; dmgMult: number; actionKind: SenkiSkillActionKind };
  stormTilt: { name: string; desc: string; dmgMult: number; hasIFrames?: boolean; isCounter?: boolean };
  stormUltimate: { name: string; desc: string; chakraCost: number; dmgMult: number };
  stormAwakeningName: string;
  awakeningName: string;
  stormAwakeningDesc: string;
  teamTags: string[];
}

export interface NarutoModeDef {
  id: NarutoModeId;
  engine: 'senki_2d' | 'storm_3d';
  name: string;
  title: string;
  badge: string;
  sub: string;
  icon: string;
  description: string;
  rewardCoins: number;
  teamSize: number;
}

export interface NarutoStageDef {
  id: NarutoStageId;
  name: string;
  icon: string;
  subtitle: string;
  skyColor: number;
  fogColor: number;
  groundColor: number;
  accentHex: string;
  accentColor: number;
}

export interface SenkiRamenShopItem {
  id: 'ramen' | 'pill' | 'speed_tag';
  name: string;
  shortName: string;
  icon: string;
  costGold: number;
  cost: number;
  shortcut: string;
  cdSec: number;
  cooldownSec: number;
  durationSec: number;
  summary: string;
  effectDesc: string;
}

export interface StormNinjaToolDef {
  id: 'atk_pill' | 'def_pill' | 'paper_bomb' | 'speed_tag';
  dpadKey: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  shortcutKey: string;
  shortcut: string;
  name: string;
  shortLabel: string;
  icon: string;
  maxCharges: number;
  summary: string;
  desc: string;
}

export const NARUTO_FACTIONS: NarutoFaction[] = [
  'Konoha',
  'Five Kage & Legends',
  'Akatsuki & Villains',
  'Boruto & Otsutsuki'
];

export const NARUTO_MODES: NarutoModeDef[] = [
  {
    id: 'senki_3v3',
    engine: 'senki_2d',
    name: 'Naruto Senki: 3v3 Standard Lane',
    title: 'Senki 3v3 Lane',
    badge: '2D MOBA · 3v3',
    sub: '2D Single-Lane 3-Tower MOBA',
    icon: '🍥',
    description:
      'Single-lane 2D MOBA brawler! Push 3 Enemy Towers with Fodder Ninja waves, level up 1→6 to unlock Ougi 1 (Lv.4) & Ougi 2 (Lv.6), and buy Ichiraku Ramen!',
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
    description:
      '4v4 High-Intensity Shinobi War! Faster enemy Gold/XP scaling, smarter AI Jutsu dodging, fortified 4,200–7,500 HP Towers, and massive clone battles.',
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
    description:
      'Full 3D Arena Fighter with Dual-Bar Team HP, 4-Log Kawarimi Substitution (14s reset), Chakra Dash Cancels, Counterattack Parry, Support Drive & Linked Team Ultimate!',
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
    description:
      'Pure 1v1 3D Arena showdown! Test your frame-data mastery, Guard Breaks, Substitution timing, Ninja Tools, and True Awakening transformations at ≤40% HP.',
    rewardCoins: 95,
    teamSize: 1
  }
];

export const NARUTO_STAGES: NarutoStageDef[] = [
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

export const STORM_SUPPORT_TYPE_DEFS: {
  id: StormSupportType;
  name: string;
  icon: string;
  summary: string;
  desc: string;
}[] = [
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

export const SENKI_RAMEN_ITEMS: SenkiRamenShopItem[] = [
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

export const STORM_NINJA_TOOLS: StormNinjaToolDef[] = [
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

export interface RawShinobiSeed {
  name: string;
  title: string;
  faction: NarutoFaction;
  icon: string;
  cost: number;
  maxHp: number;
  atkDmg: number;
  moveSpeed: number;
  isRanged: boolean;
  hoverFlight?: boolean;
  bodyColor: number;
  cloakColor: number;
  accentColor: number;
  hairColor: number;
  weaponKind: NarutoWeaponKind;
  senkiTraitName: string;
  senkiTraitDesc: string;
  senkiTraitKind: SenkiInnateTraitKind;
  s1: [string, string, SenkiSkillActionKind, number, number, string, Partial<SenkiSkillSpec>?];
  s2: [string, string, SenkiSkillActionKind, number, number, string, Partial<SenkiSkillSpec>?];
  s3: [string, string, SenkiSkillActionKind, number, number, string, Partial<SenkiSkillSpec>?];
  ougi1: [string, string, SenkiSkillActionKind, number, number, string, Partial<SenkiSkillSpec>?];
  ougi2: [string, string, SenkiSkillActionKind, number, number, string, Partial<SenkiSkillSpec>?];
  stormTraitName: string;
  stormTraitDesc: string;
  stormNinjutsuName: string;
  stormNinjutsuDesc: string;
  stormTiltName: string;
  stormTiltDesc: string;
  stormUltName: string;
  stormUltDesc: string;
  stormAwakeningName: string;
  stormAwakeningDesc: string;
  teamTags: string[];
}

function buildSkill(
  slot: 1 | 2 | 3 | 4 | 5,
  tuple: [string, string, SenkiSkillActionKind, number, number, string, Partial<SenkiSkillSpec>?]
): SenkiSkillSpec {
  const [name, desc, actionKind, cdSec, dmgMult, vfxColor, extra] = tuple;
  const unlockLevel: 1 | 2 | 3 | 4 | 6 = slot === 1 ? 1 : slot === 2 ? 1 : slot === 3 ? 2 : slot === 4 ? 4 : 6;
  const defaultIcon =
    slot === 4
      ? '🌟'
      : slot === 5
        ? '🔥'
        : actionKind === 'summon_clones'
          ? '👥'
          : actionKind === 'heal_aura'
            ? '💚'
            : actionKind === 'projectile'
              ? '🌀'
              : actionKind === 'beam_laser'
                ? '⚡'
                : actionKind === 'pull_vortex'
                  ? '🕳️'
                  : '🗡️';
  const shortWords = name
    .replace(/^(Wind|Fire|Water|Lightning|Earth|Wood|Sage|Inferno|Secret|Summoning|Eight Trigrams|Ninja Art)[:\s-]*/i, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(' ');
  const computedRange =
    extra?.rangePx ??
    (actionKind === 'projectile' || actionKind === 'beam_laser'
      ? 440
      : actionKind === 'aoe_burst' || actionKind === 'form_awakening'
        ? 270
        : 210);
  const superArmor = extra?.hasSuperArmor ?? slot >= 4;
  const iFrames = extra?.hasIFrames ?? false;
  const clones = extra?.cloneCount ?? (actionKind === 'summon_clones' ? 2 : undefined);
  const heal = extra?.healPct ?? (actionKind === 'heal_aura' ? 0.32 : undefined);
  return {
    slot,
    name,
    shortLabel: shortWords.slice(0, 12) || `Jutsu ${slot}`,
    icon: extra?.icon ?? defaultIcon,
    unlockLevel,
    cdSec,
    cooldown: cdSec,
    dmgMult,
    damage: Math.round(dmgMult * 75),
    rangePx: computedRange,
    range: computedRange,
    actionKind,
    kind: actionKind === 'melee_dash' ? 'dash' : actionKind,
    hasSuperArmor: superArmor,
    grantsSuperArmor: superArmor,
    hasIFrames: iFrames,
    grantsIFrames: iFrames,
    hitsTowers: extra?.hitsTowers ?? (slot >= 4 || actionKind === 'melee_dash' || actionKind === 'summon_clones'),
    cloneCount: clones,
    spawnsClones: clones,
    stunSec: extra?.stunSec ?? (slot >= 4 ? 1.4 : actionKind === 'pull_vortex' || actionKind === 'trap_zone' ? 1.2 : 0.4),
    healPct: heal,
    healsAlliesPct: heal,
    transformSec: extra?.transformSec ?? (slot === 5 || actionKind === 'form_awakening' ? 15 : undefined),
    vfxColor,
    color: vfxColor,
    description: desc,
    desc
  };
}

const RAW_SHINOBI_SEEDS: RawShinobiSeed[] = [...NARUTO_SEEDS_PART_1, ...NARUTO_SEEDS_PART_2];

export const NARUTO_SHINOBI_ROSTER: NarutoShinobiDef[] = RAW_SHINOBI_SEEDS.map((raw, idx) => {
  const builtSkills: [SenkiSkillSpec, SenkiSkillSpec, SenkiSkillSpec, SenkiSkillSpec, SenkiSkillSpec] = [
    buildSkill(1, raw.s1),
    buildSkill(2, raw.s2),
    buildSkill(3, raw.s3),
    buildSkill(4, raw.ougi1),
    buildSkill(5, raw.ougi2)
  ];
  const villageLabel =
    raw.faction === 'Konoha'
      ? 'Hidden Leaf'
      : raw.faction === 'Five Kage & Legends'
      ? 'Five Great Nations'
      : raw.faction === 'Akatsuki & Villains'
      ? 'Rogue / Akatsuki'
      : 'Otsutsuki / New Era';
  const roleLabel = raw.isRanged ? 'Ranged Ninjutsu' : 'Melee Taijutsu';

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

export function getNarutoShinobiById(id: number): NarutoShinobiDef {
  return NARUTO_SHINOBI_ROSTER[id] ?? NARUTO_SHINOBI_ROSTER[0];
}

// ============================================================================
// CANONICAL TEAM SYNERGY RESOLVER (FOR LINKED SECRET TECHNIQUE)
// ============================================================================
export interface TeamSynergyResult {
  name: string;
  teamName: string;
  bonusDesc: string;
  bonusPct: number;
  ultMultiplier: number;
  stormGaugeRate: number;
}

const SYNERGY_TABLE: { tag: string; name: string; bonusDesc: string; ultMult: number; gaugeRate: number }[] = [
  { tag: 'team7', name: 'Team 7 Reunited', bonusDesc: '+18% Team Ultimate Damage & +25% Storm Gauge Fill', ultMult: 1.18, gaugeRate: 1.25 },
  { tag: 'new_team7', name: 'New Generation Team 7', bonusDesc: '+18% Team Ultimate Damage & +25% Storm Gauge Fill', ultMult: 1.18, gaugeRate: 1.25 },
  { tag: 'sannin', name: 'The Legendary Sannin', bonusDesc: '+20% Team Ultimate Damage & +20% Guard Pressure', ultMult: 1.2, gaugeRate: 1.2 },
  { tag: 'hokage', name: 'Past & Present Hokage', bonusDesc: '+22% Team Ultimate Damage & Faster Substitution Recovery', ultMult: 1.22, gaugeRate: 1.25 },
  { tag: 'akatsuki', name: 'Akatsuki Scarlet Dawn', bonusDesc: '+20% Team Ultimate Damage & +20% Ninjutsu Power', ultMult: 1.2, gaugeRate: 1.22 },
  { tag: 'uchiha', name: 'Uchiha Clan Visual Prowess', bonusDesc: '+22% Team Ultimate Damage & Sharingan Crit Bonus', ultMult: 1.22, gaugeRate: 1.22 },
  { tag: 'sand_siblings', name: 'Three Sand Siblings', bonusDesc: '+18% Team Ultimate Damage & Sand Shield Defense', ultMult: 1.18, gaugeRate: 1.2 },
  { tag: 'ino_shika_cho', name: 'Ino-Shika-Cho Formation', bonusDesc: '+18% Team Ultimate Damage & Extended Stun Duration', ultMult: 1.18, gaugeRate: 1.25 },
  { tag: 'team_guy', name: 'Passionate Youth (Team Guy)', bonusDesc: '+18% Team Ultimate Damage & +10% Move Speed', ultMult: 1.18, gaugeRate: 1.2 },
  { tag: 'team8', name: 'Team Kurenai Sensory Trackers', bonusDesc: '+16% Team Ultimate Damage & Chakra Drain', ultMult: 1.16, gaugeRate: 1.2 },
  { tag: 'five_kage', name: 'Five Kage Summit Alliance', bonusDesc: '+20% Team Ultimate Damage & +15% Guard Durability', ultMult: 1.2, gaugeRate: 1.2 },
  { tag: 'jinchuriki', name: 'Tailed Beast Hosts (Jinchuriki)', bonusDesc: '+22% Team Ultimate Damage & Awakening Power', ultMult: 1.22, gaugeRate: 1.22 },
  { tag: 'taka', name: 'Team Taka / Hebi', bonusDesc: '+18% Team Ultimate Damage & Lifesteal Assist', ultMult: 1.18, gaugeRate: 1.2 },
  { tag: 'otsutsuki', name: 'Celestial Otsutsuki Clan', bonusDesc: '+25% Team Ultimate Damage & Dimension Dominance', ultMult: 1.25, gaugeRate: 1.25 },
  { tag: 'mist', name: 'Seven Ninja Swordsmen of the Mist', bonusDesc: '+18% Team Ultimate Damage & Hidden Mist Cleave', ultMult: 1.18, gaugeRate: 1.2 }
];

export function resolveNarutoTeamSynergy(
  heroIdsOrH1: number[] | number,
  h2?: number,
  h3?: number
): TeamSynergyResult {
  const heroIds = Array.isArray(heroIdsOrH1)
    ? heroIdsOrH1
    : [heroIdsOrH1, h2 ?? 1, h3 ?? 2];
  const heroes = heroIds.map((id) => getNarutoShinobiById(id));
  const counts: Record<string, number> = {};
  for (const h of heroes) {
    for (const tag of h.teamTags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }
  for (const syn of SYNERGY_TABLE) {
    if ((counts[syn.tag] || 0) >= 2) {
      const pct = Math.round((syn.ultMult - 1) * 100);
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

// ============================================================================
// PURE MECHANICS FORMULAS (PART 1 SENKI & PART 2 STORM)
// ============================================================================

/**
 * Part 1B: Senki Level 1..6 stat growth (+14% Max HP and +10% Base Attack per level).
 * Level 4 unlocks Ougi 1; Level 6 unlocks Ougi 2 / Final Awakening.
 */
export function computeSenkiLevelStats(
  baseHpOrHero: number | NarutoShinobiDef,
  baseAtkOrLevel: number,
  maybeLevel?: number
): {
  level: number;
  maxHp: number;
  atkDmg: number;
  atk: number;
  xpToNext: number;
  ougi1Unlocked: boolean;
  ougi2Unlocked: boolean;
} {
  const baseHp = typeof baseHpOrHero === 'number' ? baseHpOrHero : baseHpOrHero.maxHp;
  const baseAtk = typeof baseHpOrHero === 'number' ? baseAtkOrLevel : baseHpOrHero.atkDmg;
  const rawLevel = typeof baseHpOrHero === 'number' ? (maybeLevel ?? 1) : baseAtkOrLevel;
  const clampedLv = Math.max(1, Math.min(6, Math.floor(rawLevel)));
  const lvSteps = clampedLv - 1;
  const maxHp = Math.round(baseHp * Math.pow(1.14, lvSteps));
  const atkDmg = Math.round(baseAtk * Math.pow(1.1, lvSteps));
  return {
    level: clampedLv,
    maxHp,
    atkDmg,
    atk: atkDmg,
    xpToNext: clampedLv * 120,
    ougi1Unlocked: clampedLv >= 4,
    ougi2Unlocked: clampedLv >= 6
  };
}

export interface SenkiTargetCandidate {
  id: string;
  team: 'ally' | 'enemy';
  kind: 'minion' | 'clone' | 'hero';
  x: number;
  hp: number;
}

export interface SenkiDistanceCandidate {
  id: string;
  kind: 'minion' | 'clone' | 'hero';
  distance: number;
  damagedAlliedHeroRecently: boolean;
}

/**
 * Part 1A: Senki Tower Targeting Priority (Aggro Logic):
 * 1. Aggro Switch Rule: If an Enemy Hero damaged an Allied Hero while inside the tower's attack radius,
 *    the tower immediately switches aggro onto that attacking Enemy Hero until they leave range or die.
 * 2. Closest Enemy Fodder Ninja (Minion) or Clone/Summon in range.
 * 3. Closest Enemy Hero (if no minions/clones are in range).
 */
export function selectSenkiTowerTarget(
  candidates: SenkiDistanceCandidate[],
  towerRangePx: number
): string | null;
export function selectSenkiTowerTarget(
  towerX: number,
  towerTeam: 'ally' | 'enemy',
  towerRangePx: number,
  candidates: SenkiTargetCandidate[],
  aggroHeroId: string | null
): SenkiTargetCandidate | null;
export function selectSenkiTowerTarget(
  arg1: number | SenkiDistanceCandidate[],
  arg2: 'ally' | 'enemy' | number,
  arg3?: number,
  arg4?: SenkiTargetCandidate[],
  arg5?: string | null
): SenkiTargetCandidate | string | null {
  if (Array.isArray(arg1)) {
    const rangePx = typeof arg2 === 'number' ? arg2 : 260;
    const inRange = arg1.filter((c) => c.distance <= rangePx);
    if (inRange.length === 0) return null;
    const aggroHeroes = inRange
      .filter((c) => c.kind === 'hero' && c.damagedAlliedHeroRecently)
      .sort((a, b) => a.distance - b.distance);
    if (aggroHeroes.length > 0) return aggroHeroes[0].id;
    const minionsAndClones = inRange
      .filter((c) => c.kind === 'minion' || c.kind === 'clone')
      .sort((a, b) => a.distance - b.distance);
    if (minionsAndClones.length > 0) return minionsAndClones[0].id;
    const heroes = inRange
      .filter((c) => c.kind === 'hero')
      .sort((a, b) => a.distance - b.distance);
    return heroes[0]?.id ?? null;
  }

  const towerX = arg1;
  const towerTeam = arg2 as 'ally' | 'enemy';
  const towerRangePx = arg3 ?? 260;
  const candidates = arg4 ?? [];
  const aggroHeroId = arg5 ?? null;

  const inRangeEnemies = candidates.filter(
    (c) => c.team !== towerTeam && c.hp > 0 && Math.abs(c.x - towerX) <= towerRangePx
  );
  if (inRangeEnemies.length === 0) return null;

  if (aggroHeroId) {
    const aggroHero = inRangeEnemies.find((c) => c.id === aggroHeroId && c.kind === 'hero');
    if (aggroHero) return aggroHero;
  }

  const minionsAndClones = inRangeEnemies
    .filter((c) => c.kind === 'minion' || c.kind === 'clone')
    .sort((a, b) => Math.abs(a.x - towerX) - Math.abs(b.x - towerX));
  if (minionsAndClones.length > 0) {
    return minionsAndClones[0];
  }

  const heroes = inRangeEnemies
    .filter((c) => c.kind === 'hero')
    .sort((a, b) => Math.abs(a.x - towerX) - Math.abs(b.x - towerX));
  return heroes[0] ?? null;
}

/**
 * Part 2A: Storm Combo Damage Scaling (Proration):
 * Every consecutive hit in a combo reduces subsequent hit damage down to a floor of 20%.
 * Dropping the combo (hitCount === 0) resets scaling back to 100% (1.0).
 */
export function computeStormComboProration(comboHitCount: number): number {
  if (comboHitCount <= 0) return 1.0;
  return Math.max(0.2, Number((1.0 - comboHitCount * 0.08).toFixed(2)));
}

/**
 * Part 2B: Substitution Gauge Math (Kawarimi):
 * - Maximum Capacity: 4 Logs
 * - Recharge Timer: Exactly 14.0 seconds per log
 * - Reset Rule: Whenever a player uses any Substitution Log, the active recharge timer
 *   for the next log resets to 0.0s.
 */
export function stepSubstitutionGauge(
  currentLogs: number,
  rechargeTimerSec: number,
  dtSec: number,
  consumeLog = false
): { logs: number; rechargeTimerSec: number; timerSec: number; substituted: boolean } {
  let logs = Math.max(0, Math.min(4, Math.floor(currentLogs)));
  let timer = Math.max(0, rechargeTimerSec);

  if (consumeLog && logs > 0) {
    logs -= 1;
    timer = 0.0; // Reset Rule: active recharge timer resets to 0.0s
    return { logs, rechargeTimerSec: timer, timerSec: timer, substituted: true };
  }

  if (logs < 4) {
    timer += Math.max(0, dtSec);
    while (timer >= 14.0 && logs < 4) {
      timer -= 14.0;
      logs += 1;
    }
    if (logs >= 4) timer = 0.0;
  } else {
    timer = 0.0;
  }

  const fixed = Number(timer.toFixed(3));
  return { logs, rechargeTimerSec: fixed, timerSec: fixed, substituted: false };
}

/**
 * Part 2C: Counterattack Penalty (Block + Shuriken):
 * Activating Counter immediately locks off 35% of Maximum Chakra Bar (turning it grey/unusable)
 * for 16.0 seconds.
 */
export function computeStormMaxUsableChakra(counterPenaltyTimerSec: number): number;
export function computeStormMaxUsableChakra(
  maxChakra: number,
  counterPenaltyTimerSec: number
): {
  usableMaxChakra: number;
  lockedChakra: number;
  isLocked: boolean;
};
export function computeStormMaxUsableChakra(
  arg1: number,
  arg2?: number
): number | { usableMaxChakra: number; lockedChakra: number; isLocked: boolean } {
  if (typeof arg2 === 'undefined') {
    return arg1 > 0 ? 65 : 100;
  }
  const maxChakra = arg1;
  const counterPenaltyTimerSec = arg2;
  if (counterPenaltyTimerSec > 0) {
    const locked = Math.round(maxChakra * 0.35);
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
