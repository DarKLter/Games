import { FOUR_SKILL_HERO_META } from '../data/mapData';
import { MlbbHeroDef, MlbbRole } from '../types';

export interface MlbbHeroSkinTierEntry {
  id: string;
  name: string;
  tag: string;
  tier: 'Default' | 'Elite' | 'Special' | 'Epic' | 'Collector' | 'Legend';
  color: string;
  accent: string;
  costDiamonds: number;
  costBp?: number;
}

export interface HeroMasteryChapter {
  chapter: 1 | 2 | 3 | 4;
  title: string;
  objective: string;
  current: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  rewardBp: number;
  rewardTickets: number;
  rewardLabel: string;
}

export interface HeroMasterySummary {
  heroId: string;
  masteryPct: number;
  completedChapters: number;
  claimedChapters: number;
  badgeUnlocked: boolean;
  badgeTitle: string;
  chapters: HeroMasteryChapter[];
}

const ROLE_SKIN_PALETTES: Record<
  MlbbRole,
  {
    elite: { suffix: string; color: string; accent: string };
    special: { suffix: string; color: string; accent: string };
    epic: { suffix: string; color: string; accent: string };
    collector: { suffix: string; color: string; accent: string; tier: 'Collector' | 'Legend' };
  }
> = {
  Tank: {
    elite: { suffix: 'Iron Bastion', color: '#334155', accent: '#38BDF8' },
    special: { suffix: 'Dawn Sentinel', color: '#0F766E', accent: '#FDE047' },
    epic: { suffix: 'Obsidian Colossus', color: '#4C1D95', accent: '#F59E0B' },
    collector: { suffix: 'Imperial Aegis', color: '#D97706', accent: '#FEF08A', tier: 'Collector' }
  },
  Fighter: {
    elite: { suffix: 'Crimson Vanguard', color: '#991B1B', accent: '#FDBA74' },
    special: { suffix: 'Stormbreaker', color: '#0369A1', accent: '#67E8F9' },
    epic: { suffix: 'Dragon Sovereign', color: '#047857', accent: '#FACC15' },
    collector: { suffix: 'Celestial Warlord', color: '#B45309', accent: '#FFFFFF', tier: 'Legend' }
  },
  Assassin: {
    elite: { suffix: 'Nightstalker', color: '#1E1B4B', accent: '#C084FC' },
    special: { suffix: 'Neon Phantom', color: '#0E7490', accent: '#F472B6' },
    epic: { suffix: 'Eclipse Blade', color: '#581C87', accent: '#FDE047' },
    collector: { suffix: 'Astral Shadow', color: '#111827', accent: '#38BDF8', tier: 'Legend' }
  },
  Mage: {
    elite: { suffix: 'Sapphire Mystic', color: '#1D4ED8', accent: '#93C5FD' },
    special: { suffix: 'Starlight Oracle', color: '#BE185D', accent: '#FDE047' },
    epic: { suffix: 'Void Archmage', color: '#6D28D9', accent: '#38BDF8' },
    collector: { suffix: 'Empyrean Sovereign', color: '#0F172A', accent: '#F5C451', tier: 'Collector' }
  },
  Marksman: {
    elite: { suffix: 'Cobalt Sharpshooter', color: '#0284C7', accent: '#E0F2FE' },
    special: { suffix: 'Cyber Striker', color: '#DB2777', accent: '#22D3EE' },
    epic: { suffix: 'Solar Marksman', color: '#EA580C', accent: '#FEF08A' },
    collector: { suffix: 'Starfall Legend', color: '#4F46E5', accent: '#FACC15', tier: 'Legend' }
  },
  Support: {
    elite: { suffix: 'Emerald Warden', color: '#059669', accent: '#A7F3D0' },
    special: { suffix: 'Moonlit Seraph', color: '#7C3AED', accent: '#FBCFE8' },
    epic: { suffix: 'Radiant Herald', color: '#0284C7', accent: '#FDE047' },
    collector: { suffix: 'Sanctuary Saint', color: '#F8FAFC', accent: '#F5C451', tier: 'Collector' }
  }
};

function hashHeroSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const ACCENT_SHIFT_POOL = ['#38BDF8', '#FACC15', '#F472B6', '#34D399', '#C084FC', '#FB923C'];

function mapTagToTier(tag: string): MlbbHeroSkinTierEntry['tier'] {
  const t = tag.toLowerCase();
  if (t.includes('legend')) return 'Legend';
  if (t.includes('collector') || t.includes('aspirant') || t.includes('champion') || t.includes('lightborn')) return 'Collector';
  if (t.includes('epic')) return 'Epic';
  if (t.includes('special')) return 'Special';
  if (t.includes('elite')) return 'Elite';
  return 'Default';
}

/**
 * Guarantees every single hero across the 133-hero roster exposes a complete
 * 5-Tier Skin Switcher (Default, Elite, Special, Epic, Collector/Legend),
 * preserving all existing signature skins verbatim.
 */
export function enrichHeroSkins(hero: MlbbHeroDef): MlbbHeroDef['skins'] {
  const baseSkins = Array.isArray(hero.skins) && hero.skins.length > 0
    ? [...hero.skins]
    : [{ id: 'default', name: hero.title, tag: 'Default', color: hero.primaryColor, accent: hero.accentColor, costDiamonds: 0 }];

  const pal = ROLE_SKIN_PALETTES[hero.role];
  const seed = hashHeroSeed(hero.id);
  const altAccent = ACCENT_SHIFT_POOL[seed % ACCENT_SHIFT_POOL.length];

  const existingTiers = new Set<string>(baseSkins.map((s) => mapTagToTier(s.tag)));
  const out = baseSkins.map((s, idx) =>
    idx === 0 ? { ...s, id: 'default', tag: 'Default', costDiamonds: 0 } : { ...s }
  );

  const candidates: Array<{
    tier: MlbbHeroSkinTierEntry['tier'];
    id: string;
    name: string;
    tag: string;
    color: string;
    accent: string;
    costDiamonds: number;
  }> = [
    {
      tier: 'Elite',
      id: `${hero.id}_elite`,
      name: `${hero.name} · ${pal.elite.suffix}`,
      tag: 'Elite',
      color: pal.elite.color,
      accent: pal.elite.accent,
      costDiamonds: 199
    },
    {
      tier: 'Special',
      id: `${hero.id}_special`,
      name: `${hero.name} · ${pal.special.suffix}`,
      tag: 'Special',
      color: pal.special.color,
      accent: altAccent,
      costDiamonds: 349
    },
    {
      tier: 'Epic',
      id: `${hero.id}_epic`,
      name: `${hero.name} · ${pal.epic.suffix}`,
      tag: 'Epic',
      color: pal.epic.color,
      accent: pal.epic.accent,
      costDiamonds: 499
    },
    {
      tier: pal.collector.tier,
      id: `${hero.id}_collector`,
      name: `${hero.name} · ${pal.collector.suffix}`,
      tag: pal.collector.tier,
      color: pal.collector.color,
      accent: pal.collector.accent,
      costDiamonds: 699
    }
  ];

  for (const c of candidates) {
    if (out.length >= 5) break;
    const isApexTier = c.tier === 'Collector' || c.tier === 'Legend';
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
  const tierOrder: Record<MlbbHeroSkinTierEntry['tier'], number> = {
    Default: 0,
    Elite: 1,
    Special: 2,
    Epic: 3,
    Collector: 4,
    Legend: 5
  };
  out.sort((a, b) => tierOrder[mapTagToTier(a.tag)] - tierOrder[mapTagToTier(b.tag)]);
  return out.slice(0, 5);
}

/**
 * Computes the 4 Hero Mastery Chapters (Chapters 1–4) with live progress & claimable rewards
 * for any of the 133 heroes.
 */
export function getHeroMasterySummary(
  hero: MlbbHeroDef,
  stats: { matches: number; wins: number; mmr: number; mastery: number } | undefined,
  owned: boolean,
  claimedList: number[] | undefined
): HeroMasterySummary {
  const s = stats ?? { matches: 0, wins: 0, mmr: 1200, mastery: 0 };
  const claimed = new Set<number>(claimedList ?? []);

  const ch1Cur = owned ? 1 : s.matches > 0 ? 1 : 0;
  const ch2Cur = Math.min(2, s.matches);
  const ch3Cur = Math.min(2, s.wins);
  const ch4Cur = Math.min(100, Math.max(s.mastery, s.matches * 15 + s.wins * 20 + (owned ? 10 : 0)));

  const chapters: HeroMasteryChapter[] = [
    {
      chapter: 1,
      title: `Chapter 1 · ${hero.title}`,
      objective: `Recruit ${hero.name} or complete 1 match / practice session`,
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
      title: `Chapter 2 · ${hero.lane} Lane Discipline`,
      objective: `Play 2 matches with ${hero.name} mastering ${hero.skills[0].name}`,
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
      title: `Chapter 3 · ${hero.passiveName}`,
      objective: `Win 2 matches commanding ${hero.name}'s ${hero.skills[2].name}`,
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
      title: `Chapter 4 · Dawn Grandmaster`,
      objective: `Reach 100% Hero Mastery Proficiency with ${hero.name}`,
      current: ch4Cur,
      target: 100,
      completed: ch4Cur >= 100,
      claimed: claimed.has(4),
      rewardBp: 1800,
      rewardTickets: 100,
      rewardLabel: '+1,800 BP · 100 Tickets · Mastery Emblem'
    }
  ];

  const completedChapters = chapters.filter((c) => c.completed).length;
  const claimedChapters = chapters.filter((c) => c.claimed).length;
  const masteryPct = Math.min(100, Math.max(s.mastery, Math.round((completedChapters / 4) * 100)));
  const badgeUnlocked = completedChapters >= 4 || masteryPct >= 100;

  return {
    heroId: hero.id,
    masteryPct,
    completedChapters,
    claimedChapters,
    badgeUnlocked,
    badgeTitle: badgeUnlocked ? `Master ${hero.name}` : `Apprentice Lv.${Math.max(1, completedChapters)}`,
    chapters
  };
}

/**
 * Returns optional 4th-skill / stance preview card metadata for 4-skill heroes.
 */
export function getHeroExtraSkillPreview(heroId: string): {
  name: string;
  icon: string;
  cd: number;
  color: string;
  desc: string;
} | null {
  const m = FOUR_SKILL_HERO_META[heroId];
  if (!m) return null;
  return {
    name: m.name,
    icon: m.icon,
    cd: m.cd,
    color: m.color,
    desc: m.desc
  };
}
