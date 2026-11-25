import { MmAchievementDef, MmAvatarConfig, MmRankDef } from '../types';

/**
 * All 21 Official Mini Militia Military Ranks (Exact Progression Ladder + Loadout Discounts)
 */
export const MM_RANKS: MmRankDef[] = [
  { index: 0, title: 'Private', xpRequired: 0, discountPct: 0, insigniaType: 'chevron', tierCount: 1, color: '#A3A3A3' },
  { index: 1, title: 'Private First Class', xpRequired: 1000, discountPct: 0, insigniaType: 'chevron', tierCount: 2, color: '#D4D4D8' },
  { index: 2, title: 'Corporal', xpRequired: 2500, discountPct: 2, insigniaType: 'chevron', tierCount: 2, color: '#84CC16' },
  { index: 3, title: 'Sergeant', xpRequired: 5000, discountPct: 4, insigniaType: 'chevron', tierCount: 3, color: '#84CC16' },
  { index: 4, title: 'Staff Sergeant', xpRequired: 8500, discountPct: 5, insigniaType: 'chevron', tierCount: 3, color: '#22C55E' },
  { index: 5, title: 'Sergeant 1st Class', xpRequired: 13000, discountPct: 6, insigniaType: 'chevron', tierCount: 4, color: '#10B981' },
  { index: 6, title: 'Master Sergeant', xpRequired: 18500, discountPct: 7, insigniaType: 'chevron', tierCount: 4, color: '#14B8A6' },
  { index: 7, title: 'First Sergeant', xpRequired: 25000, discountPct: 8, insigniaType: 'chevron', tierCount: 5, color: '#06B6D4' },
  { index: 8, title: 'Sergeant Major', xpRequired: 33000, discountPct: 9, insigniaType: 'chevron', tierCount: 5, color: '#38BDF8' },
  { index: 9, title: '2nd Lieutenant', xpRequired: 42000, discountPct: 10, insigniaType: 'bar', tierCount: 1, color: '#FACC15' },
  { index: 10, title: '1st Lieutenant', xpRequired: 53000, discountPct: 11, insigniaType: 'bar', tierCount: 1, color: '#E2E8F0' },
  { index: 11, title: 'Captain', xpRequired: 66000, discountPct: 12, insigniaType: 'bar', tierCount: 2, color: '#E2E8F0' },
  { index: 12, title: 'Major', xpRequired: 82000, discountPct: 13, insigniaType: 'leaf', tierCount: 1, color: '#F59E0B' },
  { index: 13, title: 'Lieutenant Colonel', xpRequired: 100000, discountPct: 14, insigniaType: 'leaf', tierCount: 1, color: '#CBD5E1' },
  { index: 14, title: 'Colonel', xpRequired: 125000, discountPct: 15, insigniaType: 'eagle', tierCount: 1, color: '#F8FAFC' },
  { index: 15, title: 'Brigadier General', xpRequired: 155000, discountPct: 16, insigniaType: 'star', tierCount: 1, color: '#FDE047' },
  { index: 16, title: 'Major General', xpRequired: 190000, discountPct: 17, insigniaType: 'star', tierCount: 2, color: '#FDE047' },
  { index: 17, title: 'Lieutenant General', xpRequired: 235000, discountPct: 18, insigniaType: 'star', tierCount: 3, color: '#FACC15' },
  { index: 18, title: 'General', xpRequired: 290000, discountPct: 20, insigniaType: 'star', tierCount: 4, color: '#F59E0B' },
  { index: 19, title: 'General of the Army', xpRequired: 360000, discountPct: 22, insigniaType: 'star', tierCount: 5, color: '#FB923C' },
  { index: 20, title: 'Commander-in-Chief', xpRequired: 500000, discountPct: 25, insigniaType: 'commander', tierCount: 5, color: '#FDE047' }
];

export function getMmRankForXp(xp: number): { current: MmRankDef; next: MmRankDef | null; progressPct: number } {
  let current = MM_RANKS[0];
  for (const r of MM_RANKS) {
    if (xp >= r.xpRequired) current = r;
  }
  const next = MM_RANKS[current.index + 1] ?? null;
  if (!next) return { current, next: null, progressPct: 100 };
  const span = Math.max(1, next.xpRequired - current.xpRequired);
  const progressPct = Math.min(100, Math.max(0, ((xp - current.xpRequired) / span) * 100));
  return { current, next, progressPct };
}

/**
 * 22 Claimable Military Medals & Achievements
 */
export const MM_ACHIEVEMENTS: MmAchievementDef[] = [
  { id: 'first_blood', title: 'First Blood', desc: 'Eliminate your first enemy soldier.', icon: '🩸', rewardCash: 50, rewardXp: 250, target: 1, getProgress: (s) => s.stats.kills },
  { id: 'boot_camp_grad', title: 'Boot Camp Graduate', desc: 'Complete Sarge’s 7-step Training course.', icon: '🎖️', rewardCash: 100, rewardXp: 600, target: 1, getProgress: (s) => (s.stats.bootcampCompleted ? 1 : 0) },
  { id: 'veteran_50', title: 'Combat Veteran', desc: 'Score 50 total career kills.', icon: '⚔️', rewardCash: 120, rewardXp: 800, target: 50, getProgress: (s) => s.stats.kills },
  { id: 'warlord_250', title: 'Doodle Warlord', desc: 'Score 250 total career kills.', icon: '💀', rewardCash: 300, rewardXp: 2500, target: 250, getProgress: (s) => s.stats.kills },
  { id: 'sharpshooter', title: 'Sharpshooter', desc: 'Land 50 Sniper headshots.', icon: '🎯', rewardCash: 220, rewardXp: 1800, target: 50, getProgress: (s) => s.stats.sniperHeadshots },
  { id: 'headhunter', title: 'Headhunter', desc: 'Score 25 headshots with any weapon.', icon: '🧠', rewardCash: 140, rewardXp: 1000, target: 25, getProgress: (s) => s.stats.headshots },
  { id: 'butcher', title: 'Butcher', desc: 'Score 25 Machete kills.', icon: '🔪', rewardCash: 180, rewardXp: 1400, target: 25, getProgress: (s) => s.stats.macheteKills },
  { id: 'brawler', title: 'Close Quarters', desc: 'Score 15 melee kills.', icon: '👊', rewardCash: 110, rewardXp: 850, target: 15, getProgress: (s) => s.stats.meleeKills },
  { id: 'rocketman', title: 'Rocketman', desc: 'Score 25 SMAW Rocket Launcher kills.', icon: '🚀', rewardCash: 200, rewardXp: 1600, target: 25, getProgress: (s) => s.stats.smawKills },
  { id: 'pyromaniac', title: 'Pyromaniac', desc: 'Eliminate 20 enemies with the Flamethrower.', icon: '🔥', rewardCash: 180, rewardXp: 1400, target: 20, getProgress: (s) => s.stats.flameKills },
  { id: 'saw_master', title: 'Saw Master', desc: 'Score 20 Saw Gun kills.', icon: '⚙️', rewardCash: 220, rewardXp: 1700, target: 20, getProgress: (s) => s.stats.sawKills },
  { id: 'dual_trouble', title: 'Dual Trouble', desc: 'Score 30 kills while Dual Wielding.', icon: '🔫', rewardCash: 160, rewardXp: 1200, target: 30, getProgress: (s) => s.stats.dualWieldKills },
  { id: 'demolition', title: 'Demolition Expert', desc: 'Score 20 Grenade or Mine kills.', icon: '💣', rewardCash: 150, rewardXp: 1100, target: 20, getProgress: (s) => s.stats.grenadeKills },
  { id: 'survivor_10', title: 'Survivor I', desc: 'Reach Wave 10 in Survival mode.', icon: '🛡️', rewardCash: 160, rewardXp: 1300, target: 10, getProgress: (s) => s.stats.survivalBestWave },
  { id: 'survivor_20', title: 'Survivor II', desc: 'Reach Wave 20 in Survival mode.', icon: '🦅', rewardCash: 320, rewardXp: 3000, target: 20, getProgress: (s) => s.stats.survivalBestWave },
  { id: 'survivor_30', title: 'Last Doodle Standing', desc: 'Reach Wave 30 in Survival mode.', icon: '👑', rewardCash: 550, rewardXp: 5500, target: 30, getProgress: (s) => s.stats.survivalBestWave },
  { id: 'flag_runner', title: 'Flag Runner', desc: 'Capture 10 Flags in CTF.', icon: '🚩', rewardCash: 180, rewardXp: 1500, target: 10, getProgress: (s) => s.stats.flagCaptures },
  { id: 'bomb_squad', title: 'Bomb Squad', desc: 'Plant or Defuse 10 C4 bombs in PTB.', icon: '⏱️', rewardCash: 200, rewardXp: 1600, target: 10, getProgress: (s) => s.stats.bombActions },
  { id: 'untouchable', title: 'Untouchable', desc: 'Reach a 10-Kill Streak without dying.', icon: '⚡', rewardCash: 260, rewardXp: 2200, target: 10, getProgress: (s) => s.stats.bestKillstreak },
  { id: 'rampage', title: 'Triple Threat', desc: 'Score a Triple Kill or higher multi-kill.', icon: '💥', rewardCash: 140, rewardXp: 1100, target: 3, getProgress: (s) => s.stats.bestMultiKill },
  { id: 'victor_10', title: 'Squad Leader', desc: 'Win 10 matches across any mode.', icon: '🏆', rewardCash: 180, rewardXp: 1500, target: 10, getProgress: (s) => s.stats.wins },
  { id: 'officer_rank', title: 'Commissioned Officer', desc: 'Reach 2nd Lieutenant rank (42,000 XP).', icon: '⭐', rewardCash: 400, rewardXp: 3000, target: 42000, getProgress: (s) => s.xp }
];

/**
 * Avatar Studio Cosmetics Catalog (6 Layers, 100% Vector Drawn)
 */
export const MM_SKIN_TONES = [
  { id: '#F7CBA4', name: 'Light' },
  { id: '#E5B285', name: 'Warm' },
  { id: '#C68642', name: 'Tan' },
  { id: '#8D5524', name: 'Bronze' },
  { id: '#5C381B', name: 'Deep' },
  { id: '#9CA3AF', name: 'Cyber Bot' }
];

export const MM_EYE_STYLES: { id: MmAvatarConfig['eyeStyle']; name: string }[] = [
  { id: 'determined', name: 'Determined' },
  { id: 'angry', name: 'Battle Fury' },
  { id: 'cool', name: 'Cool Calm' },
  { id: 'cyber', name: 'Cyber Glow' },
  { id: 'scarred', name: 'Scarred Vet' },
  { id: 'sarge', name: 'Sarge Squint' }
];

export const MM_HEADGEAR: { id: string; name: string; costCash: number }[] = [
  { id: 'army_helmet', name: 'Army Helmet', costCash: 0 },
  { id: 'bald', name: 'Bald', costCash: 0 },
  { id: 'buzzcut', name: 'Buzzcut', costCash: 0 },
  { id: 'spiked_hair', name: 'Spiked Hair', costCash: 0 },
  { id: 'mohawk', name: 'Mohawk', costCash: 40 },
  { id: 'red_beret', name: 'Red Beret', costCash: 50 },
  { id: 'commando_bandana', name: 'Commando Bandana', costCash: 40 },
  { id: 'swat_helmet', name: 'SWAT Helmet', costCash: 70 },
  { id: 'pilot_cap', name: 'Pilot Aviator', costCash: 60 },
  { id: 'viking_helm', name: 'Viking Horned', costCash: 110 },
  { id: 'ninja_hood', name: 'Ninja Hood', costCash: 80 },
  { id: 'gas_mask', name: 'Gas Mask', costCash: 90 },
  { id: 'skull_mask', name: 'Skull Mask', costCash: 120 },
  { id: 'halo', name: 'Golden Halo', costCash: 150 },
  { id: 'crown', name: 'Royal Crown', costCash: 180 },
  { id: 'space_visor', name: 'Astronaut Visor', costCash: 130 },
  { id: 'cowboy_hat', name: 'Cowboy Hat', costCash: 85 },
  { id: 'ghillie_hood', name: 'Ghillie Hood', costCash: 110 }
];

export const MM_EYEWEAR: { id: string; name: string; costCash: number }[] = [
  { id: 'none', name: 'None', costCash: 0 },
  { id: 'aviators', name: 'Aviator Shades', costCash: 0 },
  { id: 'tactical_goggles', name: 'Tactical Goggles', costCash: 40 },
  { id: 'nvg', name: 'Tri-NVG Goggles', costCash: 90 },
  { id: 'cyber_visor', name: 'Red Cyber Visor', costCash: 85 },
  { id: 'eyepatch', name: 'Eyepatch', costCash: 50 },
  { id: 'monocle', name: 'Gold Monocle', costCash: 75 },
  { id: 'ski_goggles', name: 'Ski Goggles', costCash: 55 },
  { id: 'battle_paint', name: 'Battle Paint', costCash: 35 },
  { id: 'bandage', name: 'Combat Bandage', costCash: 30 }
];

export const MM_FACIAL: { id: string; name: string; costCash: number }[] = [
  { id: 'clean', name: 'Clean Shaven', costCash: 0 },
  { id: 'sarge_stache', name: 'Sarge Walrus', costCash: 0 },
  { id: 'full_beard', name: 'Full Beard', costCash: 30 },
  { id: 'goatee', name: 'Goatee', costCash: 30 },
  { id: 'stubble', name: 'Heavy Stubble', costCash: 25 },
  { id: 'cigar', name: 'Sarge Cigar', costCash: 60 },
  { id: 'war_grin', name: 'War Grin', costCash: 40 },
  { id: 'respirator', name: 'Respirator', costCash: 75 },
  { id: 'skull_bandana', name: 'Skull Bandana', costCash: 90 },
  { id: 'whistle', name: 'Officer Whistle', costCash: 45 }
];

export const MM_OUTFITS: { id: string; name: string; primary: string; secondary: string; costCash: number }[] = [
  { id: 'olive_camo', name: 'Olive Camo', primary: '#4D5D3B', secondary: '#2F3A22', costCash: 0 },
  { id: 'desert_camo', name: 'Desert Camo', primary: '#C2B280', secondary: '#8A795D', costCash: 0 },
  { id: 'arctic_camo', name: 'Snow Arctic', primary: '#CBD5E1', secondary: '#64748B', costCash: 50 },
  { id: 'black_swat', name: 'Black SWAT', primary: '#1F2937', secondary: '#0F172A', costCash: 70 },
  { id: 'hazmat', name: 'Biohazard Hazmat', primary: '#EAB308', secondary: '#422006', costCash: 95 },
  { id: 'red_commando', name: 'Red Commando', primary: '#991B1B', secondary: '#450A0A', costCash: 80 },
  { id: 'ninja_gi', name: 'Shadow Ninja', primary: '#18181B', secondary: '#DC2626', costCash: 100 },
  { id: 'exo_suit', name: 'Exo-Suit', primary: '#0F766E', secondary: '#22D3EE', costCash: 130 },
  { id: 'space_suit', name: 'Lunar Suit', primary: '#F8FAFC', secondary: '#F97316', costCash: 120 },
  { id: 'ghillie_suit', name: 'Ghillie Suit', primary: '#365314', secondary: '#1A2E05', costCash: 110 },
  { id: 'juggernaut', name: 'Heavy Juggernaut', primary: '#334155', secondary: '#F59E0B', costCash: 140 },
  { id: 'golden_commander', name: 'Golden Commander', primary: '#CA8A04', secondary: '#FEF08A', costCash: 220 }
];

export const MM_BOOTS: { id: string; name: string; color: string; flame: string; costCash: number }[] = [
  { id: 'steel', name: 'Steel Boots', color: '#475569', flame: '#FB923C', costCash: 0 },
  { id: 'gold', name: 'Gold Thrusters', color: '#EAB308', flame: '#FDE047', costCash: 80 },
  { id: 'plasma_blue', name: 'Blue Plasma Jets', color: '#1D4ED8', flame: '#38BDF8', costCash: 90 },
  { id: 'crimson_flame', name: 'Red Flame Jets', color: '#B91C1C', flame: '#EF4444', costCash: 75 },
  { id: 'cyber_boots', name: 'Cyber Thrusters', color: '#0F766E', flame: '#2DD4BF', costCash: 95 },
  { id: 'stealth_boots', name: 'Stealth Boots', color: '#18181B', flame: '#A855F7', costCash: 85 },
  { id: 'desert_boots', name: 'Tactical Tan', color: '#A16207', flame: '#F97316', costCash: 50 },
  { id: 'arctic_boots', name: 'Frost Jets', color: '#94A3B8', flame: '#BAE6FD', costCash: 65 }
];

export const MM_QUICK_CHATS = [
  { id: 'cm', code: 'CM', text: 'Cover Me!' },
  { id: 'cb', code: 'CB', text: 'Come on Boy!' },
  { id: 'wp', code: 'WP', text: 'Wanna Piece?' },
  { id: 'ns', code: 'NS', text: 'Nice Shot!' },
  { id: 'haha', code: '😂', text: 'Hahaha!' },
  { id: 'gg', code: 'GG', text: 'GG! Well Played!' },
  { id: 'flag', code: '🚩', text: 'Defend the Base!' },
  { id: 'sarge', code: '🫡', text: 'Lock and Load!' }
];

export const MM_BOT_NAMES = [
  'Sarge',
  'DoodleBot',
  'CommandoX',
  'TriggerHappy',
  'SniperWolf',
  'RocketMan',
  'Ghost99',
  'RamboJr',
  'SawBlade',
  'JetAce',
  'BunkerKing',
  'C4Ninja'
];

export const MM_SARGE_AVATAR: MmAvatarConfig = {
  name: 'Sarge',
  skinTone: '#E5B285',
  eyeStyle: 'sarge',
  headgear: 'army_helmet',
  eyewear: 'none',
  facial: 'cigar',
  outfit: 'olive_camo',
  boots: 'steel',
  accentColor: '#F5A623'
};

export interface MmOnlineRoomListing {
  id: string;
  name: string;
  region: 'Asia' | 'Europe' | 'North America' | 'South America';
  mapId: string;
  mode: 'tdm' | 'ffa' | 'ctf' | 'ptb';
  players: number;
  maxPlayers: number;
  pingMs: number;
  classicV4: boolean;
  difficulty: 'normal' | 'pro' | 'insane';
  ranked: boolean;
}

export const MM_SIMULATED_ONLINE_ROOMS: MmOnlineRoomListing[] = [
  { id: 'rm_1', name: 'Outpost 24/7 Pro Scrim', region: 'Asia', mapId: 'outpost', mode: 'tdm', players: 5, maxPlayers: 6, pingMs: 24, classicV4: false, difficulty: 'pro', ranked: true },
  { id: 'rm_2', name: 'Catacombs Saw Madness', region: 'Asia', mapId: 'catacombs', mode: 'ffa', players: 4, maxPlayers: 6, pingMs: 31, classicV4: true, difficulty: 'normal', ranked: false },
  { id: 'rm_3', name: 'High Tower Snipers & Rockets', region: 'Europe', mapId: 'high_tower', mode: 'tdm', players: 6, maxPlayers: 8, pingMs: 58, classicV4: false, difficulty: 'pro', ranked: true },
  { id: 'rm_4', name: 'Lunarcy Zero-G Laser Arena', region: 'North America', mapId: 'lunarcy', mode: 'ffa', players: 5, maxPlayers: 8, pingMs: 74, classicV4: true, difficulty: 'normal', ranked: false },
  { id: 'rm_5', name: 'Stronghold Ranked CTF', region: 'Europe', mapId: 'stronghold', mode: 'ctf', players: 5, maxPlayers: 6, pingMs: 49, classicV4: false, difficulty: 'pro', ranked: true },
  { id: 'rm_6', name: 'Subdivision Bomb Squad PTB', region: 'North America', mapId: 'subdivision', mode: 'ptb', players: 4, maxPlayers: 6, pingMs: 68, classicV4: false, difficulty: 'insane', ranked: true },
  { id: 'rm_7', name: 'Mini Outpost Dual Uzi Rush', region: 'South America', mapId: 'mini_outpost', mode: 'tdm', players: 4, maxPlayers: 6, pingMs: 92, classicV4: true, difficulty: 'normal', ranked: false },
  { id: 'rm_8', name: 'Overseer Competitive 3v3', region: 'Asia', mapId: 'overseer', mode: 'tdm', players: 5, maxPlayers: 6, pingMs: 19, classicV4: false, difficulty: 'insane', ranked: true }
];

export function makeRandomAvatar(name = 'Trooper'): MmAvatarConfig {
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
  return {
    name,
    skinTone: pick(MM_SKIN_TONES).id,
    eyeStyle: pick(MM_EYE_STYLES).id,
    headgear: pick(MM_HEADGEAR).id,
    eyewear: pick(MM_EYEWEAR).id,
    facial: pick(MM_FACIAL).id,
    outfit: pick(MM_OUTFITS).id,
    boots: pick(MM_BOOTS).id,
    accentColor: '#F5A623'
  };
}
