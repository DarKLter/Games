export type MobaEmblemId =
  | 'Common'
  | 'Tank'
  | 'Assassin'
  | 'Mage'
  | 'Fighter'
  | 'Support'
  | 'Marksman';

export interface MobaTalentDef {
  id: string;
  tier: 1 | 2 | 3;
  name: string;
  icon: string;
  summary: string;
  atkBonus?: number;
  hpBonus?: number;
  spdBonus?: number;
  cdPct?: number;
  critPct?: number;
  penFlat?: number;
  lifestealPct?: number;
}

export const MOBA_TALENTS_T1: MobaTalentDef[] = [
  { id: 'thrill', tier: 1, name: 'Thrill', icon: '⚔️', summary: '+16 Adaptive Attack', atkBonus: 6 },
  { id: 'swift', tier: 1, name: 'Swift', icon: '⚡', summary: '+10% Attack Speed & +4 ATK', atkBonus: 4, spdBonus: 0.3 },
  { id: 'vitality', tier: 1, name: 'Vitality', icon: '❤️', summary: '+225 Max HP', hpBonus: 36 },
  { id: 'rupture', tier: 1, name: 'Rupture', icon: '🗡️', summary: '+5 Adaptive Penetration', atkBonus: 5, penFlat: 6 },
  { id: 'inspire_t1', tier: 1, name: 'Inspire', icon: '⏳', summary: '+5% Cooldown Reduction', cdPct: 5 },
  { id: 'agility', tier: 1, name: 'Agility', icon: '💨', summary: '+4% Movement Speed', spdBonus: 0.65 },
  { id: 'fatal', tier: 1, name: 'Fatal', icon: '🎯', summary: '+5% Crit Chance & +10% Crit DMG', critPct: 6 }
];

export const MOBA_TALENTS_T2: MobaTalentDef[] = [
  { id: 'master_assassin', tier: 2, name: 'Master Assassin', icon: '🩸', summary: '+7% DMG to isolated heroes', atkBonus: 5 },
  { id: 'festival_of_blood', tier: 2, name: 'Festival of Blood', icon: '🧛', summary: '+6% Spell Vamp & Lifesteal', lifestealPct: 6 },
  { id: 'tenacity', tier: 2, name: 'Tenacity', icon: '🛡️', summary: '+15 Defense below 50% HP', hpBonus: 28 },
  { id: 'wilderness_blessing', tier: 2, name: 'Wilderness Blessing', icon: '🌿', summary: '+10% Move Speed in Jungle & River', spdBonus: 0.55 },
  { id: 'weapons_master', tier: 2, name: 'Weapons Master', icon: '⚒️', summary: '+5% Extra ATK from Equipment', atkBonus: 6 },
  { id: 'pull_yourself_together', tier: 2, name: 'Pull Yourself Together', icon: '🔄', summary: '-15% Battle Spell & Active CD', cdPct: 6 }
];

export const MOBA_TALENTS_T3: MobaTalentDef[] = [
  { id: 'killing_spree', tier: 3, name: 'Killing Spree', icon: '🔥', summary: 'Hero kill restores 15% HP & +20% Speed for 3s' },
  { id: 'impure_rage', tier: 3, name: 'Impure Rage', icon: '🔮', summary: 'Skills deal +4% Max-HP bonus Magic Damage' },
  { id: 'brave_smite', tier: 3, name: 'Brave Smite', icon: '💚', summary: 'Dealing skill damage restores 5% Max HP' },
  { id: 'weakness_finder', tier: 3, name: 'Weakness Finder', icon: '❄️', summary: 'Basic attacks slow enemies by 50% for 1.2s' },
  { id: 'lethal_ignition', tier: 3, name: 'Lethal Ignition', icon: '☄️', summary: '3 rapid hits trigger a scorching True Damage burst' },
  { id: 'concussive_blast', tier: 3, name: 'Concussive Blast', icon: '💥', summary: 'Every 4th attack detonates HP-scaled AoE shockwave' },
  { id: 'temporal_reign', tier: 3, name: 'Temporal Reign', icon: '⏱️', summary: 'Casting Ultimate accelerates basic skill cooldowns' }
];

export const ALL_MOBA_TALENTS: MobaTalentDef[] = [
  ...MOBA_TALENTS_T1,
  ...MOBA_TALENTS_T2,
  ...MOBA_TALENTS_T3
];

export function getTalentById(id: string): MobaTalentDef | undefined {
  return ALL_MOBA_TALENTS.find((t) => t.id === id);
}

export interface MobaEmblemTalentLoadout {
  t1: string;
  t2: string;
  t3: string;
}

export const DEFAULT_EMBLEM_TALENTS: Record<MobaEmblemId, MobaEmblemTalentLoadout> = {
  Common: { t1: 'thrill', t2: 'wilderness_blessing', t3: 'impure_rage' },
  Tank: { t1: 'vitality', t2: 'tenacity', t3: 'concussive_blast' },
  Assassin: { t1: 'rupture', t2: 'master_assassin', t3: 'killing_spree' },
  Mage: { t1: 'inspire_t1', t2: 'weapons_master', t3: 'lethal_ignition' },
  Fighter: { t1: 'thrill', t2: 'festival_of_blood', t3: 'brave_smite' },
  Support: { t1: 'agility', t2: 'pull_yourself_together', t3: 'temporal_reign' },
  Marksman: { t1: 'fatal', t2: 'weapons_master', t3: 'weakness_finder' }
};

export interface MobaSkinVariant {
  id: string;
  name: string;
  tier: 'Default' | 'Basic' | 'Elite' | 'StarLight' | 'Epic' | 'Collector' | 'Legend';
  costDiamonds: number;
  costBp: number;
  collectorPts: number;
  bodyShift: number | null;
  cloakShift: number | null;
  bladeShift: number | null;
  accentHex: string;
}

export const MOBA_SKIN_VARIANTS: MobaSkinVariant[] = [
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

export function getSkinVariantById(id?: string): MobaSkinVariant {
  return MOBA_SKIN_VARIANTS.find((s) => s.id === id) ?? MOBA_SKIN_VARIANTS[0];
}

export interface MobaCosmeticEffectDef {
  id: string;
  kind: 'recall' | 'elim';
  name: string;
  icon: string;
  colorNum: number;
  colorHex: string;
  costTickets: number;
}

export const MOBA_RECALL_EFFECTS: MobaCosmeticEffectDef[] = [
  { id: 'recall_classic', kind: 'recall', name: 'Dawn Sigil', icon: '🌀', colorNum: 0x38bdf8, colorHex: '#38bdf8', costTickets: 0 },
  { id: 'recall_seal', kind: 'recall', name: 'Seal of Anvil', icon: '⚡', colorNum: 0xfacc15, colorHex: '#facc15', costTickets: 120 },
  { id: 'recall_sakura', kind: 'recall', name: 'Blossom Whirl', icon: '🌸', colorNum: 0xf472b6, colorHex: '#f472b6', costTickets: 150 },
  { id: 'recall_void', kind: 'recall', name: 'Starlight Vortex', icon: '🌌', colorNum: 0xc084fc, colorHex: '#c084fc', costTickets: 180 }
];

export const MOBA_ELIM_EFFECTS: MobaCosmeticEffectDef[] = [
  { id: 'elim_classic', kind: 'elim', name: 'Classic Burst', icon: '💥', colorNum: 0xf97316, colorHex: '#f97316', costTickets: 0 },
  { id: 'elim_ko', kind: 'elim', name: 'K.O. Shockwave', icon: '🥊', colorNum: 0xfacc15, colorHex: '#facc15', costTickets: 120 },
  { id: 'elim_frost', kind: 'elim', name: 'Glacial Shatter', icon: '❄️', colorNum: 0x67e8f9, colorHex: '#67e8f9', costTickets: 150 }
];

export type MobaEmoteCategory = 'tactical' | 'hype' | 'taunt' | 'spirit';
export type MobaEmoteRarity = 'Starter' | 'Rare' | 'Epic';
export type MobaEmoteAiContext = 'kill' | 'low_hp' | 'objective' | 'rally';

export interface MobaEmoteDef {
  id: string;
  name: string;
  callout: string;
  icon: string;
  category: MobaEmoteCategory;
  rarity: MobaEmoteRarity;
  colorHex: string;
  colorNum: number;
  sfx: 'combo' | 'coin' | 'match' | 'clear' | 'dash' | 'plant' | 'slingshot';
  costTickets: number;
  costCoins: number;
}

export const MOBA_EMOTES: MobaEmoteDef[] = [
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

export const DEFAULT_STARTER_EMOTE_IDS: [string, string, string, string] = [
  'emote_gg',
  'emote_nice',
  'emote_retreat',
  'emote_fire'
];

export function getMobaEmoteById(id: string): MobaEmoteDef {
  return MOBA_EMOTES.find((e) => e.id === id) ?? MOBA_EMOTES[0];
}

export function normalizeEquippedEmotes(
  raw: unknown,
  ownedIds: readonly string[]
): [string, string, string, string] {
  const validIds = new Set(MOBA_EMOTES.map((e) => e.id));
  const ownedSet = new Set([...DEFAULT_STARTER_EMOTE_IDS, ...ownedIds.filter((id) => validIds.has(id))]);
  const result: string[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string' && ownedSet.has(item) && !result.includes(item) && result.length < 4) {
        result.push(item);
      }
    }
  }
  const fallbackPool = [...DEFAULT_STARTER_EMOTE_IDS, ...Array.from(ownedSet)];
  for (const id of fallbackPool) {
    if (result.length >= 4) break;
    if (!result.includes(id)) result.push(id);
  }
  return [
    result[0] ?? DEFAULT_STARTER_EMOTE_IDS[0],
    result[1] ?? DEFAULT_STARTER_EMOTE_IDS[1],
    result[2] ?? DEFAULT_STARTER_EMOTE_IDS[2],
    result[3] ?? DEFAULT_STARTER_EMOTE_IDS[3]
  ];
}

export function equipEmoteToSlot(
  equipped: readonly string[],
  slotIdx: 0 | 1 | 2 | 3,
  emoteId: string
): [string, string, string, string] {
  const next = normalizeEquippedEmotes(equipped, [...equipped, emoteId]);
  const existingIdx = next.indexOf(emoteId);
  if (existingIdx === slotIdx) return next;
  if (existingIdx !== -1) {
    const displaced = next[slotIdx];
    next[slotIdx] = emoteId;
    next[existingIdx] = displaced;
  } else {
    next[slotIdx] = emoteId;
  }
  return next;
}

export function pickContextualAiEmote(context: MobaEmoteAiContext, seed = 0): MobaEmoteDef {
  const pools: Record<MobaEmoteAiContext, string[]> = {
    kill: ['emote_crown', 'emote_taunt', 'emote_fire', 'emote_star'],
    low_hp: ['emote_retreat', 'emote_thunder', 'emote_chill', 'emote_ghost'],
    objective: ['emote_dragon', 'emote_fire', 'emote_star', 'emote_nice'],
    rally: ['emote_nice', 'emote_heart', 'emote_gg', 'emote_fire']
  };
  const pool = pools[context] ?? pools.rally;
  const idx = Math.abs(Math.floor(seed)) % pool.length;
  return getMobaEmoteById(pool[idx]);
}

export interface MobaAchievementDef {
  id: string;
  category: 'Arena' | 'Mastery' | 'Collection';
  title: string;
  desc: string;
  target: number;
  points: number;
  rewardBp: number;
  rewardTickets: number;
  stat: 'kills' | 'wins' | 'turrets' | 'matches' | 'heroes' | 'skins';
}

export const MOBA_ACHIEVEMENTS: MobaAchievementDef[] = [
  { id: 'ach_first_win', category: 'Arena', title: 'Dawn Conqueror', desc: 'Win your first Legends Arena match', target: 1, points: 50, rewardBp: 1500, rewardTickets: 40, stat: 'wins' },
  { id: 'ach_slayer_15', category: 'Arena', title: 'Legendary Striker', desc: 'Score 15 enemy hero takedowns', target: 15, points: 100, rewardBp: 3000, rewardTickets: 60, stat: 'kills' },
  { id: 'ach_siege_10', category: 'Arena', title: 'Demolition Expert', desc: 'Destroy 10 enemy turrets', target: 10, points: 120, rewardBp: 3500, rewardTickets: 80, stat: 'turrets' },
  { id: 'ach_veteran_5', category: 'Mastery', title: 'Land of Dawn Veteran', desc: 'Complete 5 battlefield matches', target: 5, points: 80, rewardBp: 2500, rewardTickets: 50, stat: 'matches' },
  { id: 'ach_roster_10', category: 'Collection', title: 'Hero Collector', desc: 'Own 10 canonical MLBB heroes', target: 10, points: 150, rewardBp: 4000, rewardTickets: 100, stat: 'heroes' },
  { id: 'ach_skins_3', category: 'Collection', title: 'Style Icon', desc: 'Unlock 3 hero skins in Store', target: 3, points: 160, rewardBp: 4500, rewardTickets: 120, stat: 'skins' }
];

export interface MobaCollectorTier {
  name: string;
  minPoints: number;
  colorHex: string;
}

export const MOBA_COLLECTOR_TIERS: MobaCollectorTier[] = [
  { name: 'Amateur Collector', minPoints: 0, colorHex: '#94a3b8' },
  { name: 'Expert Collector', minPoints: 600, colorHex: '#38bdf8' },
  { name: 'Renowned Collector', minPoints: 1800, colorHex: '#c084fc' },
  { name: 'Exalted Collector', minPoints: 4000, colorHex: '#f59e0b' },
  { name: 'World Collector', minPoints: 8000, colorHex: '#facc15' }
];

export function computeCollectorTier(unlockedHeroCount: number, ownedSkins: Record<number, string[]>): {
  points: number;
  tier: MobaCollectorTier;
  nextTier: MobaCollectorTier | null;
} {
  let skinPts = 0;
  for (const list of Object.values(ownedSkins)) {
    for (const sid of list) {
      skinPts += getSkinVariantById(sid).collectorPts;
    }
  }
  const points = unlockedHeroCount * 80 + skinPts;
  let tier = MOBA_COLLECTOR_TIERS[0];
  let nextTier: MobaCollectorTier | null = MOBA_COLLECTOR_TIERS[1];
  for (let i = 0; i < MOBA_COLLECTOR_TIERS.length; i++) {
    if (points >= MOBA_COLLECTOR_TIERS[i].minPoints) {
      tier = MOBA_COLLECTOR_TIERS[i];
      nextTier = MOBA_COLLECTOR_TIERS[i + 1] ?? null;
    }
  }
  return { points, tier, nextTier };
}

export interface MobaStarlightReward {
  level: number;
  xpRequired: number;
  label: string;
  rewardBp: number;
  rewardTickets: number;
  rewardPromoDiamonds: number;
  rewardCoins: number;
}

export const MOBA_STARLIGHT_TRACK: MobaStarlightReward[] = [
  { level: 1, xpRequired: 0, label: 'StarLight Welcome Chest', rewardBp: 1500, rewardTickets: 50, rewardPromoDiamonds: 25, rewardCoins: 30 },
  { level: 2, xpRequired: 100, label: 'Emblem Matrix Pack', rewardBp: 2000, rewardTickets: 60, rewardPromoDiamonds: 30, rewardCoins: 40 },
  { level: 3, xpRequired: 220, label: 'Hero Fragment Bundle', rewardBp: 3000, rewardTickets: 80, rewardPromoDiamonds: 40, rewardCoins: 55 },
  { level: 4, xpRequired: 360, label: 'Promo Carnival Cache', rewardBp: 4000, rewardTickets: 100, rewardPromoDiamonds: 60, rewardCoins: 75 },
  { level: 5, xpRequired: 520, label: 'StarLight Grand Chest', rewardBp: 6000, rewardTickets: 150, rewardPromoDiamonds: 100, rewardCoins: 120 }
];

export interface MobaLuckySpinReward {
  id: string;
  label: string;
  icon: string;
  bp?: number;
  tickets?: number;
  diamonds?: number;
  coins?: number;
  trialCards?: number;
  doubleBpCards?: number;
}

export const MOBA_LUCKY_SPIN_POOL: MobaLuckySpinReward[] = [
  { id: 'bp_1200', label: '1,200 Battle Points', icon: '💰', bp: 1200 },
  { id: 'bp_3000', label: '3,000 Battle Points', icon: '💰', bp: 3000 },
  { id: 'coins_65', label: '65 Arcade Coins', icon: '🪙', coins: 65 },
  { id: 'diamonds_35', label: '35 Bonus Diamonds', icon: '💎', diamonds: 35 },
  { id: 'trial_card', label: '2x Hero Trial Cards', icon: '🎫', trialCards: 2 },
  { id: 'double_bp', label: 'Double BP Card', icon: '⚡', doubleBpCards: 1 }
];

export interface MobaMatchRecord {
  id: string;
  heroId: number;
  heroName: string;
  mode: string;
  victory: boolean;
  kills: number;
  deaths: number;
  gold: number;
  score: number;
  durationSec: number;
  medal: 'MVP' | 'Gold' | 'Silver';
  items: string[];
  timestamp: number;
}

export interface MobaHeroMasteryEntry {
  matches: number;
  wins: number;
  mmr: number;
  masteryPts: number;
}

export interface MobaSettings {
  cameraHeight: 'low' | 'medium' | 'high';
  outline: boolean;
  damageText: boolean;
  targetPriority: 'lowest_hp' | 'closest';
  heroLockMode: boolean;
  smartTargeting: boolean;
  shopOpacity: number; // 0..100
  shopSide: 'left' | 'right';
  mapVariantOverride: 'random' | 'revealing_wisps' | 'healing_turtle' | 'golden_turret' | 'flying_cloud';
}

export const DEFAULT_MOBA_SETTINGS: MobaSettings = {
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

export interface MobaBackpackState {
  trialCards: number;
  doubleBpCards: number;
  activeDoubleBp: boolean;
  starProtectionCards: number;
}

export interface MobaSquadState {
  name: string;
  tag: string;
  slogan: string;
}

export function getHeroMasteryTitle(mmr: number): string {
  if (mmr >= 3200) return 'Global Top';
  if (mmr >= 2400) return 'Supreme';
  if (mmr >= 1700) return 'Senior';
  if (mmr >= 1200) return 'Junior';
  return 'Apprentice';
}
