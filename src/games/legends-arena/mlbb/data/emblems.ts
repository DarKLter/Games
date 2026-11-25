import { MlbbBattleSpellDef, MlbbEmblemDef, MlbbEmoteDef, MlbbTalentDef } from '../types';

/**
 * ALL 7 MLBB Emblem Sets (Lv.60 Max Base Attributes — 2026 Complete)
 */
export const MLBB_EMBLEMS: MlbbEmblemDef[] = [
  {
    id: 'common',
    name: 'Basic Common',
    icon: '⚜️',
    color: '#94A3B8',
    stats: { maxHp: 275, hpRegen: 12, manaRegen: 12, adaptiveAtk: 22 },
    desc: '+275 HP, +12 Hybrid Regen, +22 Adaptive Attack.'
  },
  {
    id: 'tank',
    name: 'Tank',
    icon: '🛡️',
    color: '#3B82F6',
    stats: { maxHp: 500, physDef: 10, magicDef: 10, hpRegen: 4 },
    desc: '+500 HP, +10 Hybrid Defense, +4 HP Regen.'
  },
  {
    id: 'assassin',
    name: 'Assassin',
    icon: '🗡️',
    color: '#A855F7',
    stats: { flatPhysPen: 14, flatMagicPen: 14, adaptiveAtk: 10, moveSpdPct: 3 },
    desc: '+14 Adaptive Penetration, +10 Adaptive Attack, +3% Movement Speed.'
  },
  {
    id: 'mage',
    name: 'Mage',
    icon: '🔮',
    color: '#6366F1',
    stats: { magicPow: 30, cdrPct: 5, flatMagicPen: 8 },
    desc: '+30 Magic Power, +5% CD Reduction, +8 Magic Penetration.'
  },
  {
    id: 'fighter',
    name: 'Fighter',
    icon: '⚔️',
    color: '#F59E0B',
    stats: { spellVampPct: 10, adaptiveAtk: 22, physDef: 6, magicDef: 6 },
    desc: '+10% Spell Vamp, +22 Adaptive Attack, +6 Hybrid Defense.'
  },
  {
    id: 'support',
    name: 'Support',
    icon: '💚',
    color: '#10B981',
    stats: { healEffectPct: 12, cdrPct: 10, moveSpdPct: 6 },
    desc: '+12% Healing Effect, +10% CD Reduction, +6% Movement Speed.'
  },
  {
    id: 'marksman',
    name: 'Marksman',
    icon: '🏹',
    color: '#EF4444',
    stats: { atkSpdPct: 15, adaptiveAtk: 14, lifestealPct: 5 },
    desc: '+15% Attack Speed, +5% Adaptive Attack, +5% Lifesteal.'
  }
];

/**
 * ALL 26 MLBB Emblem Talents (8 Tier-1 + 9 Tier-2 + 9 Tier-3 Core)
 */
export const MLBB_TALENTS: MlbbTalentDef[] = [
  // ================= TIER 1 STANDARD TALENTS (8) =================
  { id: 'thrill', tier: 1, name: 'Thrill', icon: '⚔️', desc: '+16 Adaptive Attack', stats: { adaptiveAtk: 16 } },
  { id: 'swift', tier: 1, name: 'Swift', icon: '💨', desc: '+10% Attack Speed', stats: { atkSpdPct: 10 } },
  { id: 'vitality', tier: 1, name: 'Vitality', icon: '💚', desc: '+225 Max HP', stats: { maxHp: 225 } },
  { id: 'rupture', tier: 1, name: 'Rupture', icon: '💥', desc: '+5 Adaptive Penetration', stats: { flatPhysPen: 5, flatMagicPen: 5 } },
  { id: 'inspire_t1', tier: 1, name: 'Inspire', icon: '⏱️', desc: '+5% Cooldown Reduction', stats: { cdrPct: 5 } },
  { id: 'firmness', tier: 1, name: 'Firmness', icon: '🪨', desc: '+6 Physical Defense & +6 Magic Defense', stats: { physDef: 6, magicDef: 6 } },
  { id: 'agility', tier: 1, name: 'Agility', icon: '👟', desc: '+4% Movement Speed', stats: { moveSpdPct: 4 } },
  { id: 'fatal', tier: 1, name: 'Fatal', icon: '🎯', desc: '+5% Critical Chance & +10% Critical Damage', stats: { critChance: 5, critDmgPct: 10 } },

  // ================= TIER 2 STANDARD TALENTS (9) =================
  { id: 'wilderness_blessing', tier: 2, name: 'Wilderness Blessing', icon: '🌿', desc: '+10% Movement Speed in Jungle & River (halved in combat).' },
  { id: 'seasoned_hunter', tier: 2, name: 'Seasoned Hunter', icon: '🐉', desc: '+15% Damage against Lord, Turtle, and Jungle Creeps.' },
  { id: 'tenacity', tier: 2, name: 'Tenacity', icon: '🛡️', desc: 'Dropping below 50% HP grants +15 Physical & Magic Defense.' },
  { id: 'master_assassin', tier: 2, name: 'Master Assassin', icon: '🥷', desc: '+7% Damage when only 1 enemy hero is nearby (1v1 duel).' },
  { id: 'bargain_hunter', tier: 2, name: 'Bargain Hunter', icon: '🪙', desc: 'Reduces Equipment purchase cost by 5% (95% price).' },
  { id: 'festival_of_blood', tier: 2, name: 'Festival of Blood', icon: '🩸', desc: '+6% Spell Vamp (+0.5% per kill/assist up to +10%).', stats: { spellVampPct: 6 } },
  { id: 'pull_yourself_together', tier: 2, name: 'Pull Yourself Together', icon: '🔄', desc: '-15% Battle Spell & Active Equipment cooldown.' },
  { id: 'weapon_master', tier: 2, name: 'Weapon Master', icon: '🗡️', desc: '+5% Bonus Physical Attack & Magic Power from items and emblems.' },
  { id: 'life_drain', tier: 2, name: 'Life Drain', icon: '💧', desc: 'Killing a lane minion restores 3% Max HP and 3% Max Mana.' },

  // ================= TIER 3 CORE TALENTS (9) =================
  { id: 'impure_rage', tier: 3, name: 'Impure Rage', icon: '🟣', desc: 'Skills deal bonus 4% Target Current HP Adaptive Damage (5s CD) & restore 2% Mana.' },
  { id: 'quantum_charge', tier: 3, name: 'Quantum Charge', icon: '🔋', desc: 'Basic Attacks grant +30% decaying MS (1.5s) and restore 75–180 HP (8s CD).' },
  { id: 'concussive_blast', tier: 3, name: 'Concussive Blast', icon: '💣', desc: 'Every 15s, Basic Attack triggers 100 (+7% Total HP) Magic AoE shockwave.' },
  { id: 'killing_spree', tier: 3, name: 'Killing Spree', icon: '⚡', desc: 'Eliminating an enemy hero restores 10% Lost HP & grants +20% MS for 3s.' },
  { id: 'lethal_ignition', tier: 3, name: 'Lethal Ignition', icon: '🔥', desc: '3 heavy hits (>7% Max HP) within 5s scorch target for 162–750 Adaptive Damage.' },
  { id: 'brave_smite', tier: 3, name: 'Brave Smite', icon: '🛡️', desc: 'Dealing skill damage to an enemy hero restores 5% Max HP (6s CD).' },
  { id: 'focusing_mark', tier: 3, name: 'Focusing Mark', icon: '👁️', desc: 'Damaging an enemy hero increases all allied damage against them by +6% for 3s.' },
  { id: 'weakness_finder', tier: 3, name: 'Weakness Finder', icon: '❄️', desc: 'Basic Attacks slow target MS by 50% and ATK Speed by 30% for 1s (10s CD).' },
  { id: 'war_cry', tier: 3, name: 'War Cry', icon: '📣', desc: 'Every 3 separate Basic Attacks or Skills increase all damage dealt by +8% for 6s.' },
  { id: 'temporal_reign', tier: 3, name: 'Temporal Reign', icon: '⏳', desc: 'Casting Ultimate accelerates non-Ultimate skill cooldowns by 1.5x for 4s.' }
];

/**
 * ALL 12 MLBB Battle Spells
 */
export const MLBB_BATTLE_SPELLS: MlbbBattleSpellDef[] = [
  { id: 'flicker', name: 'Flicker', icon: '✨', cooldown: 120, color: '#FACC15', desc: 'Instant wall-crossing blink in aim direction + brief hybrid defense.', range: 300 },
  { id: 'retribution', name: 'Retribution', icon: '🩸', cooldown: 35, color: '#EF4444', desc: 'Deals 520 (+80*Lv) True Damage to Jungle Creeps, Turtle, and Lord.', range: 420 },
  { id: 'execute', name: 'Execute', icon: '💀', cooldown: 90, color: '#DC2626', desc: 'Deals True Damage scaling with 13% target missing HP (ignores shields); 40% CD refund on kill.', range: 320 },
  { id: 'inspire', name: 'Inspire', icon: '🔥', cooldown: 75, color: '#F97316', desc: 'Next 8 Basic Attacks gain +55% ATK Speed, Armor Ignore, and HP heal.', range: 0 },
  { id: 'sprint', name: 'Sprint', icon: '💨', cooldown: 100, color: '#38BDF8', desc: 'Removes slows, grants Slow Immunity and +50% Move Speed for 6s.', range: 0 },
  { id: 'purify', name: 'Purify', icon: '🕊️', cooldown: 90, color: '#A855F7', desc: 'Cleanses all non-Suppression CC and grants 1.2s CC Immunity + +15% Move Speed.', range: 0 },
  { id: 'vengeance', name: 'Vengeance', icon: '⚜️', cooldown: 75, color: '#FB923C', desc: '35% Damage Reduction for 3s while reflecting 35% Magic Damage to attackers.', range: 0 },
  { id: 'aegis', name: 'Aegis', icon: '🛡️', cooldown: 75, color: '#60A5FA', desc: 'Grants 750 (+90*Lv) Shield for 5s (+50% Shield to lowest-HP nearby ally).', range: 0 },
  { id: 'revitalize', name: 'Revitalize', icon: '🌿', cooldown: 75, color: '#2CE58B', desc: 'Summons a 4s Healing Spring restoring 2.5% Max HP/0.5s & +25% Healing Received.', range: 0 },
  { id: 'petrify', name: 'Petrify', icon: '🪨', cooldown: 75, color: '#94A3B8', desc: 'Stuns surrounding enemies for 0.8s and slows them by 50% afterward.', range: 220 },
  { id: 'flameshot', name: 'Flameshot', icon: '☄️', cooldown: 50, color: '#F59E0B', desc: 'Global fireball knocking back close foes and scaling up to 640 (+180% Magic) with distance.', range: 1400 },
  { id: 'arrival', name: 'Arrival', icon: '🌀', cooldown: 75, color: '#22D3EE', desc: 'Channels 3s to teleport to an allied turret or minion with +60% Move Speed.', range: 4000 }
];

export const MLBB_QUICK_CHAT_OPTIONS = [
  { id: 'qc_attack', text: 'Launch Attack!', category: 'Offense' },
  { id: 'qc_retreat', text: 'Retreat! Careful of ambush!', category: 'Defense' },
  { id: 'qc_gather_turtle', text: 'Gather at the Turtle!', category: 'Objective' },
  { id: 'qc_gather_lord', text: 'Attack the Lord!', category: 'Objective' },
  { id: 'qc_push', text: 'Push the turrets first!', category: 'Offense' },
  { id: 'qc_missing', text: 'Enemy missing from lane!', category: 'Warning' },
  { id: 'qc_well_played', text: 'Well played!', category: 'Social' },
  { id: 'qc_wait', text: 'Wait for me to initiate!', category: 'Strategy' }
];

export const MLBB_BATTLE_EFFECTS = {
  recall: [
    { id: 'rec_dawn', name: 'Dawn Sanctuary', icon: '🌀', color: '#38BDF8', costTickets: 0 },
    { id: 'rec_seal', name: 'Seal of Anvil Crawlers', icon: '⚡', color: '#FACC15', costTickets: 180 },
    { id: 'rec_fire', name: 'Fire Crown', icon: '🔥', color: '#F97316', costTickets: 220 }
  ],
  spawn: [
    { id: 'spn_classic', name: 'Classic Portal', icon: '✨', color: '#60A5FA', costTickets: 0 },
    { id: 'spn_starlight', name: 'Starlight Descent', icon: '🌟', color: '#C084FC', costTickets: 150 }
  ],
  elim: [
    { id: 'elm_default', name: 'Arcane Burst', icon: '💥', color: '#F59E0B', costTickets: 0 },
    { id: 'elm_ko', name: 'K.O. Shockwave', icon: '⚡', color: '#EF4444', costTickets: 180 }
  ],
  killNotif: [
    { id: 'kn_default', name: 'Imperial Gold Banner', icon: '🏆', color: '#FACC15', costTickets: 0 },
    { id: 'kn_mythic', name: 'Mythic Glory Crest', icon: '👑', color: '#A855F7', costTickets: 200 }
  ]
};

export const MLBB_EMOTES: MlbbEmoteDef[] = [
  { id: 'emote_gg', name: 'Good Game', callout: 'GG!', icon: '👍', color: '#2CE58B', rarity: 'Starter', costTickets: 0, costBp: 0, sfx: 'chime' },
  { id: 'emote_nice', name: 'Well Played', callout: 'NICE!', icon: '🔥', color: '#F59E0B', rarity: 'Starter', costTickets: 0, costBp: 0, sfx: 'spark' },
  { id: 'emote_retreat', name: 'Fall Back', callout: 'CAREFUL!', icon: '🛡️', color: '#38A3FF', rarity: 'Starter', costTickets: 0, costBp: 0, sfx: 'horn' },
  { id: 'emote_laugh', name: 'Playful Tease', callout: 'HAHA!', icon: '😜', color: '#FACC15', rarity: 'Starter', costTickets: 0, costBp: 0, sfx: 'laugh' },
  { id: 'emote_crown', name: 'MVP Crown', callout: 'EZ MVP', icon: '👑', color: '#FDE047', rarity: 'Epic', costTickets: 120, costBp: 2500, sfx: 'chime' },
  { id: 'emote_chill', name: 'Stay Cool', callout: 'CHILL', icon: '❄️', color: '#38BDF8', rarity: 'Rare', costTickets: 80, costBp: 1500, sfx: 'spark' },
  { id: 'emote_dragon', name: 'Lord Roar', callout: 'ROAR!', icon: '🐉', color: '#EF4444', rarity: 'Epic', costTickets: 150, costBp: 3000, sfx: 'horn' },
  { id: 'emote_heart', name: 'Team Love', callout: 'THANKS!', icon: '💖', color: '#FB7185', rarity: 'Rare', costTickets: 90, costBp: 1800, sfx: 'chime' },
  { id: 'emote_thunder', name: 'Shocked', callout: 'WHOA!', icon: '⚡', color: '#A855F7', rarity: 'Rare', costTickets: 100, costBp: 2000, sfx: 'spark' },
  { id: 'emote_ghost', name: 'Bush Ambush', callout: 'BOO!', icon: '👻', color: '#C084FC', rarity: 'Rare', costTickets: 100, costBp: 2000, sfx: 'laugh' },
  { id: 'emote_swords', name: '1v1 Me', callout: 'FIGHT ME!', icon: '⚔️', color: '#F97316', rarity: 'Epic', costTickets: 140, costBp: 2800, sfx: 'horn' },
  { id: 'emote_star', name: 'Savage Flex', callout: 'SAVAGE!', icon: '🌟', color: '#FACC15', rarity: 'Epic', costTickets: 160, costBp: 3200, sfx: 'chime' }
];

export const MLBB_STARTER_EMOTES: [string, string, string, string] = [
  'emote_gg',
  'emote_nice',
  'emote_retreat',
  'emote_laugh'
];

export const MLBB_RANK_TIERS = [
  { name: 'Warrior', icon: '⚔️', color: '#94A3B8', borderGlow: '#CBD5E1', starsPerTier: 3 },
  { name: 'Elite', icon: '🛡️', color: '#38BDF8', borderGlow: '#7DD3FC', starsPerTier: 4 },
  { name: 'Master', icon: '⚜️', color: '#F59E0B', borderGlow: '#FCD34D', starsPerTier: 4 },
  { name: 'Grandmaster', icon: '🦅', color: '#2CE58B', borderGlow: '#6EE7B7', starsPerTier: 5 },
  { name: 'Epic', icon: '🐉', color: '#10B981', borderGlow: '#34D399', starsPerTier: 5 },
  { name: 'Legend', icon: '🦁', color: '#FACC15', borderGlow: '#FEF08A', starsPerTier: 5 },
  { name: 'Mythic', icon: '👑', color: '#A855F7', borderGlow: '#D8B4FE', starsPerTier: 25 },
  { name: 'Mythical Honor', icon: '💠', color: '#60A5FA', borderGlow: '#93C5FD', starsPerTier: 50 },
  { name: 'Mythical Glory', icon: '🌟', color: '#F43F5E', borderGlow: '#FDA4AF', starsPerTier: 100 },
  { name: 'Mythical Immortal', icon: '🔥', color: '#E6B84C', borderGlow: '#FFE28A', starsPerTier: 999 }
];

export function getMlbbEmblemById(id: string): MlbbEmblemDef {
  return MLBB_EMBLEMS.find((e) => e.id === id) ?? MLBB_EMBLEMS[0];
}

export function getMlbbTalentById(id: string): MlbbTalentDef | undefined {
  return MLBB_TALENTS.find((t) => t.id === id);
}

export function getMlbbSpellById(id: string): MlbbBattleSpellDef {
  return MLBB_BATTLE_SPELLS.find((s) => s.id === id) ?? MLBB_BATTLE_SPELLS[0];
}

export const getMlbbBattleSpellById = getMlbbSpellById;

export function getMlbbEmoteById(id: string): MlbbEmoteDef {
  return MLBB_EMOTES.find((e) => e.id === id) ?? MLBB_EMOTES[0];
}

/**
 * Computes combined Lv.60 Max Emblem + equipped Tier 1/2/3 Talent base attribute summary
 * for live display in Preparation Hub and Draft Quick Prep.
 */
export function aggregateEmblemAndTalentPreviewStats(
  emblemId: string,
  talents: { t1: string; t2: string; t3: string }
): { label: string; value: string }[] {
  const emb = getMlbbEmblemById(emblemId);
  const t1 = getMlbbTalentById(talents.t1);
  const t2 = getMlbbTalentById(talents.t2);
  const sum: Record<string, number> = {};
  const addStats = (s?: Record<string, number | undefined>) => {
    if (!s) return;
    for (const [k, v] of Object.entries(s)) {
      if (typeof v === 'number' && v !== 0) {
        sum[k] = (sum[k] ?? 0) + v;
      }
    }
  };
  addStats(emb.stats as Record<string, number | undefined>);
  addStats(t1?.stats as Record<string, number | undefined>);
  addStats(t2?.stats as Record<string, number | undefined>);

  const labelMap: Record<string, [string, string]> = {
    maxHp: ['Max HP', ''],
    adaptiveAtk: ['Adaptive ATK', ''],
    physAtk: ['Phys ATK', ''],
    magicPow: ['Magic Power', ''],
    physDef: ['Phys DEF', ''],
    magicDef: ['Magic DEF', ''],
    flatPhysPen: ['Phys PEN', ''],
    flatMagicPen: ['Magic PEN', ''],
    atkSpdPct: ['ATK Speed', '%'],
    critChance: ['Crit Chance', '%'],
    critDmgPct: ['Crit DMG', '%'],
    cdrPct: ['CDR', '%'],
    moveSpdPct: ['Move Speed', '%'],
    lifestealPct: ['Lifesteal', '%'],
    spellVampPct: ['Spell Vamp', '%'],
    healEffectPct: ['Healing Effect', '%'],
    hpRegen: ['HP Regen', ''],
    manaRegen: ['Mana Regen', '']
  };

  const out: { label: string; value: string }[] = [];
  for (const [k, v] of Object.entries(sum)) {
    const meta = labelMap[k];
    if (!meta) continue;
    out.push({ label: meta[0], value: `+${v}${meta[1]}` });
  }
  return out;
}

