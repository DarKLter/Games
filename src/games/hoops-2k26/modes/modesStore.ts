// ============================================================================
// PART 6 — UNIFIED MODES STORE, MYPLAYER BUILDER ENGINE, PACK ENGINE,
// MYNBA OVR SIMULATION & TRADE MACHINE, AND REWARD SETTLEMENT
// ============================================================================

import { useEffect, useState } from 'react';
import { RosterStore } from '../hybrid/rosterStore';
import {
  ATTRIBUTE_META,
  type AttributeKey,
  type BadgeId,
  type BadgeTier,
  type PlayerAttributes,
  type PlayerPosition,
  type PlayerProfile,
  type TeamData,
} from '../hybrid/rosterTypes';
import { UltimateHybridStore } from '../hybrid/store';
import {
  GAME_CHANGER_CATALOG,
  MYTEAM_PACKS,
  MYTEAM_TIERS,
  PTG_SCENARIOS,
  STREET_KINGS_BOSSES,
  SWAG_STORE_CATALOG,
  TRAINING_DRILLS,
  type CityMapPin,
  type CityParkId,
  type CrewHqState,
  type DrillMedal,
  type GameChangerCardId,
  type GreenReleaseVfxId,
  type MapPinCategory,
  type ModeLaunchPayload,
  type MyCourtCustomization,
  type MyNbaEraId,
  type MyNbaStandingRow,
  type MyNbaState,
  type MyPlayerBuildSlot,
  type MyTeamCard,
  type MyTeamPackId,
  type MyTeamTierId,
  type Part6ModesSave,
  type PlayoffSeries,
  type SkillDrillId,
} from './modesTypes';

export const MODES_SAVE_KEY = 'nba2k14_2k26_modes_v1';

// ----------------------------------------------------------------------------
// SAFE LOCALSTORAGE HELPERS
// ----------------------------------------------------------------------------

function safeRead(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key: string, val: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, val);
  } catch {
    // Ignore sandbox/quota errors
  }
}

export function clampNum(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function formatHeightInches(inches: number): string {
  const ft = Math.floor(inches / 12);
  const rem = inches % 12;
  return `${ft}'${rem}"`;
}

// ----------------------------------------------------------------------------
// 1. MYPLAYER BUILDER MATH — DYNAMIC CAPS, OVR, ARCHETYPE & 5-TIER BADGES
// ----------------------------------------------------------------------------

export function computeDynamicAttributeCaps(
  position: PlayerPosition,
  heightInches: number,
  weightLbs: number,
  wingspanInches: number
): PlayerAttributes {
  // Base 85-96 ceilings modified smoothly by height, weight, and wingspan delta
  const hDelta = heightInches - 78; // 0 at 6'6"
  const wDelta = (weightLbs - 210) / 15; // 0 at 210 lbs
  const wingDelta = wingspanInches - heightInches; // 0 = neutral, +6 = long arms, -2 = T-Rex

  const guardBonus = position === 'PG' || position === 'SG' ? 4 : 0;
  const bigBonus = position === 'PF' || position === 'C' ? 5 : 0;

  return {
    threePt: clampNum(Math.round(94 - hDelta * 1.15 - wingDelta * 1.85 + guardBonus * 0.6), 60, 99),
    midRange: clampNum(Math.round(95 - hDelta * 0.55 - wingDelta * 1.05 + guardBonus * 0.4), 68, 99),
    freeThrow: clampNum(Math.round(96 - hDelta * 0.6 - wingDelta * 0.5), 72, 99),
    closeShot: clampNum(Math.round(91 + hDelta * 0.9 + wingDelta * 0.5 + bigBonus * 0.5), 76, 99),
    drivingLayup: clampNum(Math.round(94 - Math.max(0, hDelta - 3) * 1.1 + guardBonus * 0.5), 72, 99),
    drivingDunk: clampNum(Math.round(92 + (hDelta >= 0 ? Math.min(4, hDelta * 0.6) : hDelta * 1.3) + wingDelta * 0.8), 64, 99),
    ballHandle: clampNum(Math.round(93 - hDelta * 2.1 - wDelta * 0.8 + guardBonus * 1.2), 54, 99),
    passAccuracy: clampNum(Math.round(94 - Math.max(0, hDelta - 2) * 0.9 + guardBonus * 0.9), 70, 99),
    speed: clampNum(Math.round(93 - hDelta * 1.9 - wDelta * 1.6 + guardBonus * 0.8), 55, 99),
    acceleration: clampNum(Math.round(92 - hDelta * 1.8 - wDelta * 1.7 + guardBonus * 0.8), 55, 99),
    vertical: clampNum(Math.round(91 - Math.max(0, hDelta - 3) * 1.1 - Math.max(0, wDelta) * 0.9 + wingDelta * 0.4), 62, 99),
    strength: clampNum(Math.round(80 + hDelta * 1.2 + wDelta * 3.1 + bigBonus * 0.7), 52, 99),
    perimeterDef: clampNum(Math.round(93 - Math.max(0, hDelta - 2) * 1.5 + wingDelta * 1.15), 62, 99),
    interiorDef: clampNum(Math.round(84 + hDelta * 1.65 + wDelta * 1.2 + wingDelta * 0.9 + bigBonus * 0.7), 58, 99),
    steal: clampNum(Math.round(92 - Math.max(0, hDelta - 2) * 1.2 + wingDelta * 1.45), 62, 99),
    block: clampNum(Math.round(82 + hDelta * 1.85 + wingDelta * 1.65 + bigBonus * 0.8), 55, 99),
    offReb: clampNum(Math.round(81 + hDelta * 1.9 + wingDelta * 1.5 + bigBonus * 0.9), 54, 99),
    defReb: clampNum(Math.round(84 + hDelta * 1.8 + wingDelta * 1.4 + bigBonus * 0.9), 58, 99),
  };
}

export function getEffectiveBuildAttributes(build: Pick<MyPlayerBuildSlot, 'attributes' | 'capBreakers'>): PlayerAttributes {
  const out = { ...build.attributes };
  for (let i = 0; i < ATTRIBUTE_META.length; i++) {
    const k = ATTRIBUTE_META[i].key;
    const bonus = build.capBreakers[k] ?? 0;
    out[k] = clampNum(out[k] + bonus, 25, 99);
  }
  return out;
}

export function computeBuildOvr(
  attrs: PlayerAttributes,
  capBreakers?: Partial<Record<AttributeKey, number>>
): number {
  const eff = capBreakers ? getEffectiveBuildAttributes({ attributes: attrs, capBreakers }) : attrs;
  const vals = ATTRIBUTE_META.map((m) => eff[m.key]);
  const sorted = [...vals].sort((a, b) => b - a);
  const top10Avg = sorted.slice(0, 10).reduce((s, n) => s + n, 0) / 10;
  const allAvg = vals.reduce((s, n) => s + n, 0) / vals.length;
  const raw = top10Avg * 0.78 + allAvg * 0.28 + 3;
  return clampNum(Math.round(raw), 60, 99);
}

export function computeAttributePointBudgetUsed(attrs: PlayerAttributes): number {
  let total = 0;
  for (let i = 0; i < ATTRIBUTE_META.length; i++) {
    total += attrs[ATTRIBUTE_META[i].key];
  }
  return total;
}

export const BUILD_MAX_ATTR_BUDGET = 1495; // Allows 99 OVR specialist builds without all-99 cheese

export function deriveBuildArchetypeName(
  attrs: PlayerAttributes,
  position: PlayerPosition
): string {
  const shoot = (attrs.threePt * 1.2 + attrs.midRange) / 2.2;
  const finish = (attrs.drivingDunk * 1.2 + attrs.drivingLayup + attrs.closeShot) / 3.2;
  const play = (attrs.ballHandle * 1.15 + attrs.passAccuracy) / 2.15;
  const def = (attrs.perimeterDef + attrs.interiorDef + attrs.steal + attrs.block) / 4;
  const reb = (attrs.offReb + attrs.defReb) / 2;

  const isTwoWay = def >= 81 || attrs.perimeterDef >= 86 || attrs.block >= 87;
  const prefix = isTwoWay ? '2-Way ' : '';

  if (position === 'C' || position === 'PF') {
    if (shoot >= 82 && finish >= 82) return `${prefix}3-Level Stretch Big`;
    if (reb >= 88 && attrs.block >= 88) return `${prefix}Glass-Cleaning Paint Beast`;
    if (finish >= 88) return `${prefix}Interior Force`;
    if (play >= 80) return `${prefix}Diming Point Center`;
    return `${prefix}Paint Beast`;
  }

  if (shoot >= 86 && finish >= 84 && play >= 82) {
    return `${prefix}3-Level Shot Creator`;
  }
  if (shoot >= 88 && play >= 82) {
    return `${prefix}Sharpshooting Facilitator`;
  }
  if (shoot >= 84 && finish >= 85) {
    return `${prefix}Inside-Out Scorer`;
  }
  if (play >= 87 && finish >= 82) {
    return `${prefix}Inside-Out Playmaker`;
  }
  if (finish >= 88) {
    return `${prefix}Slashing High-Flyer`;
  }
  if (shoot >= 88) {
    return `${prefix}Deep-Range Sharpshooter`;
  }
  if (isTwoWay && play >= 80) {
    return '2-Way Floor General';
  }
  return `${prefix}All-Around Threat`;
}

function tierFromThreshold(
  val: number,
  bronze: number,
  silver: number,
  gold: number,
  hof: number,
  legend: number
): BadgeTier | null {
  if (val >= legend) return 'LEGEND';
  if (val >= hof) return 'HOF';
  if (val >= gold) return 'GOLD';
  if (val >= silver) return 'SILVER';
  if (val >= bronze) return 'BRONZE';
  return null;
}

export function computeUnlockedBadges5Tier(
  attrs: PlayerAttributes,
  capBreakers?: Partial<Record<AttributeKey, number>>
): Partial<Record<BadgeId, BadgeTier>> {
  const a = capBreakers ? getEffectiveBuildAttributes({ attributes: attrs, capBreakers }) : attrs;
  const out: Partial<Record<BadgeId, BadgeTier>> = {};

  const assign = (id: BadgeId, val: number, b: number, s: number, g: number, h: number, l: number) => {
    const t = tierFromThreshold(val, b, s, g, h, l);
    if (t) out[id] = t;
  };

  // Shooting
  assign('DEADEYE', Math.max(a.threePt, a.midRange), 76, 83, 89, 94, 98);
  assign('LIMITLESS_RANGE', a.threePt, 78, 85, 91, 95, 99);
  assign('SET_SHOT_SPECIALIST', Math.max(a.threePt, a.midRange), 72, 80, 87, 93, 97);
  assign('SHIFTY_SHOOTER', Math.round((a.midRange + a.threePt) / 2), 75, 82, 88, 93, 97);
  assign('MINI_MARKSMAN', a.threePt, 74, 82, 88, 94, 98);

  // Playmaking
  assign('ANKLE_ASSASSIN', a.ballHandle, 75, 82, 88, 93, 97);
  assign('DIMER', a.passAccuracy, 72, 80, 86, 92, 96);
  assign('LIGHTNING_LAUNCH', Math.round((a.speed + a.acceleration) / 2), 75, 82, 88, 93, 97);
  assign('UNPLUCKABLE', a.ballHandle, 73, 81, 87, 92, 97);
  assign('HANDLES_FOR_DAYS', a.ballHandle, 76, 84, 90, 94, 98);
  assign('VERSATILE_VISIONARY', a.passAccuracy, 76, 83, 89, 94, 98);
  assign('BREAK_STARTER', a.passAccuracy, 70, 78, 85, 91, 96);

  // Finishing
  assign('POSTERIZER', Math.round(a.drivingDunk * 0.8 + a.vertical * 0.2), 76, 83, 89, 94, 98);
  assign('AERIAL_WIZARD', Math.round((a.drivingDunk + a.vertical) / 2), 74, 81, 87, 92, 96);
  assign('LAYUP_MIXMASTER', a.drivingLayup, 74, 81, 87, 93, 97);
  assign('FLOAT_GAME', Math.round((a.drivingLayup + a.closeShot) / 2), 73, 80, 86, 92, 96);
  assign('PHYSICAL_FINISHER', Math.round((a.drivingLayup + a.strength) / 2), 74, 81, 87, 92, 96);

  // Defense / Rebounding
  assign('PERIMETER_CHALLENGER', a.perimeterDef, 75, 82, 88, 93, 97);
  assign('GLOVE', a.steal, 75, 82, 88, 93, 97);
  assign('INTERCEPTOR', a.steal, 73, 80, 86, 92, 96);
  assign('PAINT_PATROLLER', Math.round((a.interiorDef + a.block) / 2), 75, 82, 88, 93, 97);
  assign('HIGH_FLYING_DENIER', Math.round((a.block + a.vertical) / 2), 74, 81, 87, 92, 96);
  assign('BOXOUT_BEAST', Math.round((a.defReb + a.strength) / 2), 74, 81, 87, 92, 96);
  assign('REBOUND_CHASER', Math.max(a.defReb, a.offReb), 76, 83, 89, 94, 98);
  assign('POGO_STICK', Math.round((a.block + a.vertical) / 2), 73, 80, 86, 92, 96);

  return out;
}

export function buildToPlayerProfile(build: MyPlayerBuildSlot): PlayerProfile {
  const eff = getEffectiveBuildAttributes(build);
  const ovr = computeBuildOvr(build.attributes, build.capBreakers);
  const speedNum =
    build.jumpshotSpeed === 'SLOW'
      ? 0.84
      : build.jumpshotSpeed === 'QUICK'
        ? 1.12
        : build.jumpshotSpeed === 'VERY_QUICK'
          ? 1.24
          : 1.0;
  return {
    id: `myplayer_${build.id}`,
    name: build.name,
    position: build.position,
    jerseyNumber: build.jerseyNumber,
    heightInches: build.heightInches,
    weightLbs: build.weightLbs,
    wingspanInches: build.wingspanInches,
    archetype: build.archetypeName,
    era: '2K26',
    ovr,
    jumpshotSpeed: speedNum,
    isCreated: true,
    appearance: {
      skinTone: build.cosmetics.skinTone,
      hairStyle: build.cosmetics.hairStyle,
      hairColor: build.cosmetics.hairColor,
      headband: build.cosmetics.headband,
      armSleeve: build.cosmetics.armSleeve,
      legCompression: build.cosmetics.legCompression,
      shoeColor: build.cosmetics.shoeColor,
    },
    tendencies: {
      shoot3: eff.threePt,
      driveRim: eff.drivingDunk,
      postUp: eff.closeShot,
      passFirst: eff.passAccuracy,
      stealAggro: eff.steal,
    },
    attributes: eff,
    hotZones: {
      leftCorner3: eff.threePt >= 84 ? 1 : 0,
      leftWing3: eff.threePt >= 86 ? 1 : 0,
      topKey3: eff.threePt >= 82 ? 1 : 0,
      rightWing3: eff.threePt >= 86 ? 1 : 0,
      rightCorner3: eff.threePt >= 84 ? 1 : 0,
      leftMid: eff.midRange >= 84 ? 1 : 0,
      topMid: eff.midRange >= 85 ? 1 : 0,
      rightMid: eff.midRange >= 84 ? 1 : 0,
      paint: eff.drivingDunk >= 84 || eff.closeShot >= 85 ? 1 : 0,
    },
    badges: computeUnlockedBadges5Tier(build.attributes, build.capBreakers),
  };
}

function makePresetBuild(
  slotIndex: number,
  name: string,
  jerseyNumber: number,
  position: PlayerPosition,
  heightInches: number,
  weightLbs: number,
  wingspanInches: number,
  attrs: PlayerAttributes,
  primaryTakeover: MyPlayerBuildSlot['primaryTakeover'],
  careerTeamId: string
): MyPlayerBuildSlot {
  const capBreakers: Partial<Record<AttributeKey, number>> = {};
  const badges = computeUnlockedBadges5Tier(attrs, capBreakers);
  return {
    id: `slot_${slotIndex + 1}`,
    slotIndex,
    name,
    jerseyNumber,
    position,
    heightInches,
    weightLbs,
    wingspanInches,
    cosmetics: {
      skinTone: slotIndex % 2 === 0 ? '#8d5524' : '#c68642',
      hairStyle: slotIndex === 0 ? 'FADE' : slotIndex === 1 ? 'BRAIDS' : slotIndex === 2 ? 'DREADS' : 'SHORT',
      hairColor: '#111827',
      headband: slotIndex === 0 || slotIndex === 2,
      headbandColor: '#f59e0b',
      armSleeve: slotIndex % 2 === 0 ? 'LEFT' : 'BOTH',
      legCompression: true,
      parkJerseyId: 'jrs_skyline',
      sneakerId: 'snk_proplay26',
      shoeColor: '#06b6d4',
      greenReleaseVfx: 'DEFAULT_EMERALD',
    },
    attributes: attrs,
    capBreakers,
    capBreakersEarned: 5,
    jumpshotSpeed: 'QUICK',
    primaryTakeover,
    archetypeName: deriveBuildArchetypeName(attrs, position),
    ovr: computeBuildOvr(attrs, capBreakers),
    badges,
    careerTeamId,
    careerGameNumber: 1,
    careerWins: slotIndex === 0 ? 12 : 0,
    careerLosses: slotIndex === 0 ? 3 : 0,
    careerPpg: slotIndex === 0 ? 28.4 : 0,
    createdAtMs: Date.now() - (5 - slotIndex) * 86400000,
  };
}

function createDefaultBuildSlots(): MyPlayerBuildSlot[] {
  return [
    makePresetBuild(
      0,
      'MP "Skyline" Vance',
      1,
      'PG',
      75,
      195,
      78,
      {
        closeShot: 78,
        midRange: 88,
        threePt: 92,
        freeThrow: 88,
        drivingDunk: 84,
        drivingLayup: 87,
        ballHandle: 93,
        passAccuracy: 87,
        speed: 90,
        acceleration: 91,
        vertical: 84,
        strength: 72,
        perimeterDef: 86,
        interiorDef: 65,
        steal: 87,
        block: 62,
        offReb: 54,
        defReb: 66,
      },
      'SHOT_CREATOR',
      '2k26_okc'
    ),
    makePresetBuild(
      1,
      'Jaxon "Flash" Reid',
      6,
      'SG',
      78,
      208,
      82,
      {
        closeShot: 82,
        midRange: 86,
        threePt: 89,
        freeThrow: 86,
        drivingDunk: 93,
        drivingLayup: 88,
        ballHandle: 86,
        passAccuracy: 80,
        speed: 88,
        acceleration: 89,
        vertical: 90,
        strength: 78,
        perimeterDef: 88,
        interiorDef: 72,
        steal: 85,
        block: 74,
        offReb: 58,
        defReb: 70,
      },
      'SLASHER',
      '2k14_mia'
    ),
    makePresetBuild(
      2,
      'Kairo "Clamps" Brooks',
      23,
      'SF',
      80,
      225,
      85,
      {
        closeShot: 84,
        midRange: 84,
        threePt: 85,
        freeThrow: 82,
        drivingDunk: 90,
        drivingLayup: 84,
        ballHandle: 82,
        passAccuracy: 82,
        speed: 85,
        acceleration: 84,
        vertical: 87,
        strength: 86,
        perimeterDef: 92,
        interiorDef: 84,
        steal: 90,
        block: 85,
        offReb: 72,
        defReb: 82,
      },
      'LOCKDOWN',
      '2k26_bos'
    ),
    makePresetBuild(
      3,
      'Darius "Stretch" King',
      35,
      'PF',
      82,
      235,
      86,
      {
        closeShot: 86,
        midRange: 90,
        threePt: 88,
        freeThrow: 86,
        drivingDunk: 88,
        drivingLayup: 81,
        ballHandle: 78,
        passAccuracy: 79,
        speed: 80,
        acceleration: 79,
        vertical: 84,
        strength: 86,
        perimeterDef: 81,
        interiorDef: 87,
        steal: 76,
        block: 89,
        offReb: 80,
        defReb: 88,
      },
      'SHARP',
      '2k26_den'
    ),
    makePresetBuild(
      4,
      'Titan "Glass" Monroe',
      34,
      'C',
      85,
      262,
      91,
      {
        closeShot: 92,
        midRange: 76,
        threePt: 76,
        freeThrow: 78,
        drivingDunk: 90,
        drivingLayup: 78,
        ballHandle: 62,
        passAccuracy: 82,
        speed: 72,
        acceleration: 70,
        vertical: 82,
        strength: 95,
        perimeterDef: 72,
        interiorDef: 94,
        steal: 70,
        block: 95,
        offReb: 92,
        defReb: 95,
      },
      'GLASS_CLEANER',
      '2k26_sas'
    ),
  ];
}

// ----------------------------------------------------------------------------
// 2. CREW HQ DEFAULT FACTORY (50-MEMBER ROSTER + WEEKLY GOALS)
// ----------------------------------------------------------------------------

function createDefaultCrew(): CrewHqState {
  const posOrder: PlayerPosition[] = ['PG', 'SG', 'SF', 'PF', 'C'];
  const prefixes = ['Skyline', 'ProPLAY', 'Clutch', 'Green', 'Fade', 'Dimer', 'Rim', 'Euro', 'Iso', 'King'];
  const members = Array.from({ length: 50 }, (_, idx) => ({
    id: `crew_m_${idx + 1}`,
    gamertag:
      idx === 0
        ? 'KING_2K26 (You)'
        : `${prefixes[idx % prefixes.length]}_${14 + ((idx * 7) % 85)}`,
    role: (idx === 0 ? 'OWNER' : idx < 5 ? 'CAPTAIN' : idx < 18 ? 'VETERAN' : 'MEMBER') as CrewHqState['members'][number]['role'],
    ovr: idx === 0 ? 94 : clampNum(84 + ((idx * 5) % 15), 82, 99),
    position: posOrder[idx % 5],
    weeklyRep: Math.max(120, 2400 - idx * 38),
  }));

  return {
    name: 'Skyline Dynasty',
    tag: '2KHY',
    emblemColor: '#f59e0b',
    secondaryColor: '#06b6d4',
    level: 14,
    repTotal: 48200,
    members,
    weeklyGoals: [
      { id: 'cg_1', title: 'Win 5 Park or REC Games as a Crew', progress: 5, target: 5, vcReward: 2000, repReward: 850, claimed: false },
      { id: 'cg_2', title: 'Knock Down 25 Green-Release Threes', progress: 19, target: 25, vcReward: 1500, repReward: 600, claimed: false },
      { id: 'cg_3', title: 'Defeat 2 Street Kings Coliseum Bosses', progress: 1, target: 2, vcReward: 2500, repReward: 1100, claimed: false },
    ],
    proAmRecord: { wins: 11, losses: 3, trophies: 2 },
  };
}

// ----------------------------------------------------------------------------
// 3. MYTEAM DUAL-GENDER + DUAL-ERA CARD & PACK ENGINE
// ----------------------------------------------------------------------------

function tierFromOvr(ovr: number): MyTeamTierId {
  if (ovr >= 99) return 'DARK_MATTER';
  if (ovr >= 97) return 'GALAXY_OPAL';
  if (ovr >= 95) return 'PINK_DIAMOND';
  if (ovr >= 93) return 'DIAMOND';
  if (ovr >= 90) return 'AMETHYST';
  if (ovr >= 87) return 'RUBY';
  if (ovr >= 84) return 'SAPPHIRE';
  return 'EMERALD';
}

const TIER_ORDER: MyTeamTierId[] = [
  'EMERALD',
  'SAPPHIRE',
  'RUBY',
  'AMETHYST',
  'DIAMOND',
  'PINK_DIAMOND',
  'GALAXY_OPAL',
  'DARK_MATTER',
];

function makeMyTeamCardFromPlayer(
  p: PlayerProfile,
  team: TeamData,
  forcedTier?: MyTeamTierId
): MyTeamCard {
  const tier = forcedTier ?? tierFromOvr(p.ovr);
  const tierMeta = MYTEAM_TIERS[tier];
  const ovr = forcedTier ? Math.max(tierMeta.targetOvr, Math.min(99, p.ovr + 2)) : p.ovr;
  const eraLabel: MyTeamCard['eraLabel'] =
    team.era === 'WNBA'
      ? 'WNBA'
      : team.era === 'LEGENDS'
        ? 'LEGEND'
        : team.era === '2K14' || team.era === 'EUROLEAGUE'
          ? '2K14'
          : '2K26';
  const defAvg = Math.round(
    (p.attributes.perimeterDef + p.attributes.interiorDef + p.attributes.steal + p.attributes.block) / 4
  );
  return {
    id: `mt_${p.id}_${tier}_${Math.floor(Math.random() * 99999)}`,
    playerId: p.id,
    name: p.name,
    teamAbbr: team.abbr,
    eraLabel,
    gender: team.era === 'WNBA' ? 'WNBA' : 'NBA',
    position: p.position,
    tier,
    ovr,
    threePt: clampNum(p.attributes.threePt + (ovr - p.ovr), 50, 99),
    drivingDunk: clampNum(p.attributes.drivingDunk + (ovr - p.ovr), 45, 99),
    ballHandle: clampNum(p.attributes.ballHandle + (ovr - p.ovr), 48, 99),
    defense: clampNum(defAvg + (ovr - p.ovr), 55, 99),
    jerseyNumber: p.jerseyNumber,
    accentColor: team.colors.primary,
    acquiredAtMs: Date.now(),
  };
}

function createStarterMyTeam(): Part6ModesSave['myTeam'] {
  const teams = RosterStore.getAllTeams();
  const findStar = (teamId: string, idx: number, tier: MyTeamTierId): MyTeamCard => {
    const team = teams.find((t) => t.id === teamId) ?? teams[0];
    const p = team.roster[idx] ?? team.roster[0];
    return makeMyTeamCardFromPlayer(p, team, tier);
  };

  // Starter Dual-Gender + Dual-Era 8-card squad
  const starterCards: MyTeamCard[] = [
    findStar('2k26_okc', 0, 'DIAMOND'), // SGA '26
    findStar('wnba_ind', 0, 'PINK_DIAMOND'), // Caitlin Clark WNBA Guard Superstar
    findStar('2k14_mia', 0, 'GALAXY_OPAL'), // LeBron '14
    findStar('wnba_lva', 3, 'DIAMOND'), // A'ja Wilson WNBA Forward Superstar
    findStar('2k26_den', 0, 'AMETHYST'), // Jokic '26
    findStar('2k14_sas', 0, 'RUBY'), // Bench 1
    findStar('leg_96_chi', 0, 'PINK_DIAMOND'), // Bench 2 Legend
    findStar('2k26_bos', 0, 'SAPPHIRE'), // Bench 3
  ];

  // Ensure deterministic IDs for starter cards
  starterCards.forEach((c, i) => {
    c.id = `mt_starter_${i + 1}`;
  });

  return {
    ownedCards: starterCards,
    startingFiveIds: starterCards.slice(0, 5).map((c) => c.id),
    benchIds: starterCards.slice(5, 8).map((c) => c.id),
    gameChangerCounts: {
      GC_2X_MTP_REP: 2,
      GC_DIFFICULTY_REDUCER: 2,
      GC_HOT_START_TAKEOVER: 1,
      GC_WIN_STREAK_SHIELD: 1,
      GC_BADGE_XP_SURGE: 2,
    },
    equippedGameChangerId: 'GC_2X_MTP_REP',
    dominationStars: {},
    tripleThreatWins: 0,
    packsOpened: 0,
  };
}

export function rollMyTeamPack(packId: MyTeamPackId): MyTeamCard[] {
  const pack = MYTEAM_PACKS.find((p) => p.id === packId) ?? MYTEAM_PACKS[0];
  const allTeams = RosterStore.getAllTeams();
  const poolTeams =
    pack.eraFocus === '2K14'
      ? allTeams.filter((t) => t.era === '2K14' || t.era === 'EUROLEAGUE')
      : pack.eraFocus === '2K26'
        ? allTeams.filter((t) => t.era === '2K26')
        : allTeams.filter((t) => t.era === 'LEGENDS' || t.era === 'WNBA');
  const activePool = poolTeams.length > 0 ? poolTeams : allTeams;

  const minIdx = TIER_ORDER.indexOf(pack.guaranteedMinTier);
  const rollTier = (guaranteed: boolean): MyTeamTierId => {
    const r = Math.random();
    let idx =
      r > 0.94
        ? 7
        : r > 0.85
          ? 6
          : r > 0.72
            ? 5
            : r > 0.54
              ? 4
              : r > 0.36
                ? 3
                : r > 0.2
                  ? 2
                  : r > 0.08
                    ? 1
                    : 0;
    if (guaranteed && idx < minIdx) idx = minIdx + (Math.random() > 0.72 ? 1 : 0);
    return TIER_ORDER[clampNum(idx, 0, TIER_ORDER.length - 1)];
  };

  const pulled: MyTeamCard[] = [];
  for (let i = 0; i < 3; i++) {
    const team = activePool[Math.floor(Math.random() * activePool.length)];
    const topPlayers = team.roster.slice(0, Math.min(4, team.roster.length));
    const player = topPlayers[Math.floor(Math.random() * topPlayers.length)];
    pulled.push(makeMyTeamCardFromPlayer(player, team, rollTier(i === 2)));
  }
  return pulled;
}

export function myTeamCardsToProfiles(cards: MyTeamCard[]): PlayerProfile[] {
  const allTeams = RosterStore.getAllTeams();
  const playerMap: Record<string, PlayerProfile> = {};
  for (let i = 0; i < allTeams.length; i++) {
    const roster = allTeams[i].roster;
    for (let j = 0; j < roster.length; j++) {
      playerMap[roster[j].id] = roster[j];
    }
  }
  return cards.map((c) => {
    const base = playerMap[c.playerId];
    if (base) {
      return {
        ...base,
        ovr: c.ovr,
        attributes: {
          ...base.attributes,
          threePt: c.threePt,
          drivingDunk: c.drivingDunk,
          ballHandle: c.ballHandle,
        },
      };
    }
    return buildToPlayerProfile(createDefaultBuildSlots()[0]);
  });
}

// ----------------------------------------------------------------------------
// 4. MYNBA ERAS — STANDINGS, 16-TEAM PLAYOFF BRACKET, OVR SIM & TRADE MACHINE
// ----------------------------------------------------------------------------

const EAST_ABBRS = new Set([
  'BOS', 'MIA', 'IND', 'NYK', 'BKN', 'CHI', 'CLE', 'MIL',
  'PHI', 'ORL', 'ATL', 'TOR', 'DET', 'CHA', 'WAS',
]);

export function createMyNbaSeason(era: MyNbaEraId, preferredTeamId?: string): MyNbaState {
  const eraKey = era === 'ERA_2014' ? '2K14' : '2K26';
  const eraTeams = RosterStore.getAllTeams().filter((t) => t.era === eraKey);

  const standings: MyNbaStandingRow[] = eraTeams.map((t, idx) => {
    const baseWins = clampNum(Math.round((t.ovr - 74) * 2.55 + ((idx * 7) % 7) - 3), 18, 66);
    const wins = clampNum(baseWins, 16, 68);
    return {
      teamId: t.id,
      abbr: t.abbr,
      name: `${t.city} ${t.name}`,
      conference: EAST_ABBRS.has(t.abbr) ? 'EAST' : 'WEST',
      wins,
      losses: 82 - wins,
      ovr: t.ovr,
      ppg: Number((96 + (t.offRating - 75) * 0.95).toFixed(1)),
    };
  });

  const east = standings
    .filter((s) => s.conference === 'EAST')
    .sort((a, b) => b.wins - a.wins || b.ovr - a.ovr)
    .slice(0, 8);
  const west = standings
    .filter((s) => s.conference === 'WEST')
    .sort((a, b) => b.wins - a.wins || b.ovr - a.ovr)
    .slice(0, 8);

  const pairOrder: Array<[number, number]> = [
    [0, 7],
    [3, 4],
    [2, 5],
    [1, 6],
  ];

  const playoffBracket: PlayoffSeries[] = [];
  pairOrder.forEach(([hi, lo], idx) => {
    if (east[hi] && east[lo]) {
      playoffBracket.push({
        id: `po_r1_e_${idx + 1}`,
        round: 1,
        conference: 'EAST',
        highSeedTeamId: east[hi].teamId,
        lowSeedTeamId: east[lo].teamId,
        highWins: 0,
        lowWins: 0,
        winnerTeamId: null,
      });
    }
  });
  pairOrder.forEach(([hi, lo], idx) => {
    if (west[hi] && west[lo]) {
      playoffBracket.push({
        id: `po_r1_w_${idx + 1}`,
        round: 1,
        conference: 'WEST',
        highSeedTeamId: west[hi].teamId,
        lowSeedTeamId: west[lo].teamId,
        highWins: 0,
        lowWins: 0,
        winnerTeamId: null,
      });
    }
  });

  const defaultTeam =
    preferredTeamId && eraTeams.some((t) => t.id === preferredTeamId)
      ? preferredTeamId
      : era === 'ERA_2014'
        ? '2k14_mia'
        : '2k26_okc';

  return {
    era,
    userTeamId: defaultTeam,
    seasonYearLabel: era === 'ERA_2014' ? '2013-14 LeBron Era' : '2025-26 Modern ProPLAY Era',
    standings,
    playoffBracket,
    championTeamId: null,
    tradeHistory: [],
  };
}

export function simulateOvrWeightedGame(
  highTeam: TeamData,
  lowTeam: TeamData
): { winnerId: string; highScore: number; lowScore: number } {
  const diff = highTeam.ovr - lowTeam.ovr;
  const highWinProb = clampNum(0.52 + diff * 0.032, 0.2, 0.85);
  const highWon = Math.random() < highWinProb;
  const baseHigh = Math.round(98 + (highTeam.offRating - 78) * 0.9 + (Math.random() * 14 - 7));
  const baseLow = Math.round(96 + (lowTeam.offRating - 78) * 0.9 + (Math.random() * 14 - 7));
  let highScore = clampNum(baseHigh, 84, 134);
  let lowScore = clampNum(baseLow, 82, 132);
  if (highWon && highScore <= lowScore) highScore = lowScore + 2 + Math.floor(Math.random() * 8);
  if (!highWon && lowScore <= highScore) lowScore = highScore + 2 + Math.floor(Math.random() * 8);
  return {
    winnerId: highWon ? highTeam.id : lowTeam.id,
    highScore,
    lowScore,
  };
}

function advancePlayoffBracketRounds(bracket: PlayoffSeries[]): {
  nextBracket: PlayoffSeries[];
  championTeamId: string | null;
} {
  const out = [...bracket];

  const ensureNextRound = (
    prevRound: 1 | 2 | 3,
    nextRound: 2 | 3 | 4,
    conf: 'EAST' | 'WEST' | 'FINALS'
  ) => {
    const existingNext = out.filter((s) => s.round === nextRound && s.conference === conf);
    if (existingNext.length > 0) return;

    if (nextRound === 4) {
      const eastFinals = out.find((s) => s.round === 3 && s.conference === 'EAST');
      const westFinals = out.find((s) => s.round === 3 && s.conference === 'WEST');
      if (eastFinals && eastFinals.winnerTeamId && westFinals && westFinals.winnerTeamId) {
        out.push({
          id: 'po_r4_finals',
          round: 4,
          conference: 'FINALS',
          highSeedTeamId: eastFinals.winnerTeamId,
          lowSeedTeamId: westFinals.winnerTeamId,
          highWins: 0,
          lowWins: 0,
          winnerTeamId: null,
        });
      }
      return;
    }

    const prevSeries = out.filter((s) => s.round === prevRound && s.conference === conf);
    if (prevSeries.length >= 2 && prevSeries.every((s) => Boolean(s.winnerTeamId))) {
      for (let i = 0; i < prevSeries.length; i += 2) {
        const a = prevSeries[i];
        const b = prevSeries[i + 1];
        if (a && b && a.winnerTeamId && b.winnerTeamId) {
          out.push({
            id: `po_r${nextRound}_${conf.toLowerCase()}_${i / 2 + 1}`,
            round: nextRound,
            conference: conf,
            highSeedTeamId: a.winnerTeamId,
            lowSeedTeamId: b.winnerTeamId,
            highWins: 0,
            lowWins: 0,
            winnerTeamId: null,
          });
        }
      }
    }
  };

  ensureNextRound(1, 2, 'EAST');
  ensureNextRound(1, 2, 'WEST');
  ensureNextRound(2, 3, 'EAST');
  ensureNextRound(2, 3, 'WEST');
  ensureNextRound(3, 4, 'FINALS');

  const finals = out.find((s) => s.round === 4);
  return {
    nextBracket: out,
    championTeamId: finals?.winnerTeamId ?? null,
  };
}

export function evaluateAiTradeApproval(
  outgoingPlayer: PlayerProfile,
  incomingPlayer: PlayerProfile
): { approvalPct: number; accepted: boolean; reason: string } {
  const valueOf = (p: PlayerProfile) => {
    const badgeBonus = Object.keys(p.badges).length * 0.45;
    return p.ovr * 1.45 + badgeBonus;
  };
  const outVal = valueOf(outgoingPlayer);
  const inVal = valueOf(incomingPlayer);
  const diff = outVal - inVal; // positive means user gives more value -> AI loves it
  const approvalPct = clampNum(Math.round(62 + diff * 4.5), 5, 99);
  const accepted = approvalPct >= 55;
  const reason =
    approvalPct >= 82
      ? 'Partner GM enthusiastically accepts — strong value return.'
      : approvalPct >= 55
        ? 'Balanced blockbuster deal — League Office & GM approve.'
        : 'AI GM rejects — offer a higher OVR or younger star.';
  return { approvalPct, accepted, reason };
}

// ----------------------------------------------------------------------------
// 5. DEFAULT PART 6 PERSISTENT STATE & HYDRATION
// ----------------------------------------------------------------------------

export function createDefaultPart6Save(): Part6ModesSave {
  const ptgProgress: Part6ModesSave['ptgProgress'] = {};
  PTG_SCENARIOS.forEach((s) => {
    ptgProgress[s.id] = { completed: false, stars: 0, bestMargin: 0, trophyUnlocked: false };
  });

  const drillMedals = {} as Record<SkillDrillId, DrillMedal>;
  const drillBestScores = {} as Record<SkillDrillId, number>;
  TRAINING_DRILLS.forEach((d) => {
    drillMedals[d.id] = 'NONE';
    drillBestScores[d.id] = 0;
  });

  return {
    version: 1,
    activeBuildSlotIndex: 0,
    buildSlots: createDefaultBuildSlots(),
    activePark: 'SKYLINE_PARK',
    cityPins: [
      {
        id: 'pin_default_1',
        label: 'Hot Streak Court #2',
        category: 'HOT_STREAK',
        x: 225,
        y: 192,
        createdAtMs: Date.now() - 3600000,
      },
    ],
    avatarMapPos: { x: 500, y: 350 },
    provingGrounds: {
      tier: 'Bronze',
      rp: 180,
      wins: 2,
      losses: 1,
    },
    streetKingsDefeatedIds: [],
    gatoradeBoostGamesLeft: 0,
    gatoradeBestScores: { treadmill: 0, vertical: 0, reaction: 0 },
    myCourt: {
      woodFloor: 'MAPLE_CLASSIC',
      wallTheme: 'PENTHOUSE_CITY',
      rimSound: 'PURE_NYLON',
    },
    crew: createDefaultCrew(),
    ownedSwagIds: ['jrs_skyline', 'snk_proplay26'],
    ptgProgress,
    myTeam: createStarterMyTeam(),
    myNba: createMyNbaSeason('ERA_2026'),
    drillMedals,
    drillBestScores,
    lastUpdatedMs: Date.now(),
  };
}

function hydratePart6Save(raw: unknown): Part6ModesSave {
  const def = createDefaultPart6Save();
  if (!raw || typeof raw !== 'object') return def;
  const r = raw as Partial<Part6ModesSave>;
  return {
    ...def,
    ...r,
    buildSlots:
      Array.isArray(r.buildSlots) && r.buildSlots.length === 5 ? r.buildSlots : def.buildSlots,
    cityPins: Array.isArray(r.cityPins) ? r.cityPins : def.cityPins,
    provingGrounds: r.provingGrounds ? { ...def.provingGrounds, ...r.provingGrounds } : def.provingGrounds,
    streetKingsDefeatedIds: Array.isArray(r.streetKingsDefeatedIds) ? r.streetKingsDefeatedIds : def.streetKingsDefeatedIds,
    gatoradeBestScores: r.gatoradeBestScores
      ? { ...def.gatoradeBestScores, ...r.gatoradeBestScores }
      : def.gatoradeBestScores,
    myCourt: r.myCourt ? { ...def.myCourt, ...r.myCourt } : def.myCourt,
    crew: r.crew ? { ...def.crew, ...r.crew } : def.crew,
    ownedSwagIds: Array.isArray(r.ownedSwagIds) ? r.ownedSwagIds : def.ownedSwagIds,
    ptgProgress: { ...def.ptgProgress, ...(r.ptgProgress ?? {}) },
    myTeam: r.myTeam ? { ...def.myTeam, ...r.myTeam } : def.myTeam,
    myNba: r.myNba && Array.isArray(r.myNba.standings) && r.myNba.standings.length > 0 ? r.myNba : def.myNba,
    drillMedals: { ...def.drillMedals, ...(r.drillMedals ?? {}) },
    drillBestScores: { ...def.drillBestScores, ...(r.drillBestScores ?? {}) },
  };
}

let _modesState: Part6ModesSave = (() => {
  const raw = safeRead(MODES_SAVE_KEY);
  if (!raw) return createDefaultPart6Save();
  try {
    return hydratePart6Save(JSON.parse(raw));
  } catch {
    return createDefaultPart6Save();
  }
})();

let _activeLaunchPayload: ModeLaunchPayload | null = null;
const _modesListeners = new Set<(next: Part6ModesSave) => void>();

function commitModes(next: Part6ModesSave): Part6ModesSave {
  _modesState = { ...next, lastUpdatedMs: Date.now() };
  safeWrite(MODES_SAVE_KEY, JSON.stringify(_modesState));
  _modesListeners.forEach((fn) => fn(_modesState));
  return _modesState;
}

// ----------------------------------------------------------------------------
// 6. PUBLIC STORE API
// ----------------------------------------------------------------------------

export const ModesStore = {
  getState(): Part6ModesSave {
    return _modesState;
  },

  subscribe(listener: (next: Part6ModesSave) => void): () => void {
    _modesListeners.add(listener);
    return () => {
      _modesListeners.delete(listener);
    };
  },

  getActiveBuild(): MyPlayerBuildSlot {
    return _modesState.buildSlots[_modesState.activeBuildSlotIndex] ?? _modesState.buildSlots[0];
  },

  setActiveBuildSlot(slotIndex: number): Part6ModesSave {
    const idx = clampNum(slotIndex, 0, _modesState.buildSlots.length - 1);
    return commitModes({ ..._modesState, activeBuildSlotIndex: idx });
  },

  saveBuildSlot(slotIndex: number, updated: MyPlayerBuildSlot): Part6ModesSave {
    const idx = clampNum(slotIndex, 0, 4);
    const recomputed: MyPlayerBuildSlot = {
      ...updated,
      slotIndex: idx,
      archetypeName: deriveBuildArchetypeName(
        getEffectiveBuildAttributes(updated),
        updated.position
      ),
      ovr: computeBuildOvr(updated.attributes, updated.capBreakers),
      badges: computeUnlockedBadges5Tier(updated.attributes, updated.capBreakers),
    };
    const nextSlots = _modesState.buildSlots.map((s, i) => (i === idx ? recomputed : s));
    return commitModes({
      ..._modesState,
      activeBuildSlotIndex: idx,
      buildSlots: nextSlots,
    });
  },

  upgradeBuildAttributeWithVc(
    slotIndex: number,
    attrKey: AttributeKey
  ): { ok: boolean; costVc: number; message: string } {
    const build = _modesState.buildSlots[slotIndex];
    if (!build) return { ok: false, costVc: 0, message: 'Build slot not found.' };
    const caps = computeDynamicAttributeCaps(
      build.position,
      build.heightInches,
      build.weightLbs,
      build.wingspanInches
    );
    const curr = build.attributes[attrKey];
    if (curr >= caps[attrKey]) {
      return { ok: false, costVc: 0, message: 'Attribute is at physical cap. Use a Cap Breaker!' };
    }
    const costVc = Math.round(180 + Math.max(0, curr - 65) * 32);
    const vc = UltimateHybridStore.getState().currencies.vc;
    if (vc < costVc) {
      return { ok: false, costVc, message: `Need ${costVc.toLocaleString()} VC (have ${vc.toLocaleString()}).` };
    }
    UltimateHybridStore.addCurrency({ vc: -costVc });
    const nextAttrs = { ...build.attributes, [attrKey]: curr + 1 };
    this.saveBuildSlot(slotIndex, { ...build, attributes: nextAttrs });
    return { ok: true, costVc, message: `Upgraded ${attrKey} to ${curr + 1} (-${costVc} VC)!` };
  },

  // --- THE CITY ---
  setActivePark(park: CityParkId): Part6ModesSave {
    return commitModes({ ..._modesState, activePark: park });
  },

  setAvatarMapPos(x: number, y: number): Part6ModesSave {
    return commitModes({
      ..._modesState,
      avatarMapPos: { x: clampNum(x, 40, 960), y: clampNum(y, 40, 660) },
    });
  },

  addCityPin(label: string, category: MapPinCategory, x: number, y: number): Part6ModesSave {
    const pin: CityMapPin = {
      id: `pin_${Date.now()}_${Math.floor(Math.random() * 999)}`,
      label: label.trim() || 'Tactical Pin',
      category,
      x: clampNum(Math.round(x), 30, 970),
      y: clampNum(Math.round(y), 30, 670),
      createdAtMs: Date.now(),
    };
    return commitModes({
      ..._modesState,
      cityPins: [pin, ..._modesState.cityPins].slice(0, 14),
    });
  },

  removeCityPin(pinId: string): Part6ModesSave {
    return commitModes({
      ..._modesState,
      cityPins: _modesState.cityPins.filter((p) => p.id !== pinId),
    });
  },

  clearCityPins(): Part6ModesSave {
    return commitModes({ ..._modesState, cityPins: [] });
  },

  completeGatoradeDrill(
    drill: 'treadmill' | 'vertical' | 'reaction',
    score: number
  ): { grantedBoost: boolean; vcAwarded: number } {
    const prevBest = _modesState.gatoradeBestScores[drill];
    const nextBest = Math.max(prevBest, score);
    const grantedBoost = score >= 60;
    const vcAwarded = grantedBoost ? 450 : 150;
    UltimateHybridStore.addCurrency({ vc: vcAwarded, seasonXP: 60 });
    commitModes({
      ..._modesState,
      gatoradeBoostGamesLeft: grantedBoost ? 5 : _modesState.gatoradeBoostGamesLeft,
      gatoradeBestScores: {
        ..._modesState.gatoradeBestScores,
        [drill]: nextBest,
      },
    });
    return { grantedBoost, vcAwarded };
  },

  updateMyCourt(patch: Partial<MyCourtCustomization>): Part6ModesSave {
    return commitModes({
      ..._modesState,
      myCourt: { ..._modesState.myCourt, ...patch },
    });
  },

  updateCrewIdentity(patch: Partial<Pick<CrewHqState, 'name' | 'tag' | 'emblemColor' | 'secondaryColor'>>): Part6ModesSave {
    const nextCrew: CrewHqState = {
      ..._modesState.crew,
      ...patch,
      tag: (patch.tag ?? _modesState.crew.tag).toUpperCase().slice(0, 4),
    };
    const hybrid = UltimateHybridStore.getState();
    UltimateHybridStore.updateProfile({ username: hybrid.profile.username });
    return commitModes({ ..._modesState, crew: nextCrew });
  },

  claimCrewWeeklyGoal(goalId: string): { ok: boolean; vc: number; rep: number } {
    const goal = _modesState.crew.weeklyGoals.find((g) => g.id === goalId);
    if (!goal || goal.claimed || goal.progress < goal.target) {
      return { ok: false, vc: 0, rep: 0 };
    }
    const nextGoals = _modesState.crew.weeklyGoals.map((g) =>
      g.id === goalId ? { ...g, claimed: true } : g
    );
    const nextRep = _modesState.crew.repTotal + goal.repReward;
    const nextLevel = clampNum(1 + Math.floor(nextRep / 3200), 1, 30);
    UltimateHybridStore.addCurrency({ vc: goal.vcReward, repXP: goal.repReward });
    commitModes({
      ..._modesState,
      crew: {
        ..._modesState.crew,
        level: nextLevel,
        repTotal: nextRep,
        weeklyGoals: nextGoals,
      },
    });
    return { ok: true, vc: goal.vcReward, rep: goal.repReward };
  },

  buyOrEquipSwag(itemId: string): { ok: boolean; message: string } {
    const item = SWAG_STORE_CATALOG.find((x) => x.id === itemId);
    if (!item) return { ok: false, message: 'Item not found.' };
    const owned = _modesState.ownedSwagIds.includes(item.id);
    if (!owned) {
      const vc = UltimateHybridStore.getState().currencies.vc;
      if (vc < item.priceVc) {
        return { ok: false, message: `Need ${item.priceVc.toLocaleString()} VC.` };
      }
      UltimateHybridStore.addCurrency({ vc: -item.priceVc });
    }
    const active = this.getActiveBuild();
    const nextCosmetics = { ...active.cosmetics };
    if (item.category === 'HEADBAND') {
      nextCosmetics.headband = true;
      nextCosmetics.headbandColor = item.swatch;
    } else if (item.category === 'SLEEVE') {
      nextCosmetics.armSleeve = item.sleeveMode ?? 'LEFT';
    } else if (item.category === 'COMPRESSION') {
      nextCosmetics.legCompression = true;
    } else if (item.category === 'PARK_JERSEY') {
      nextCosmetics.parkJerseyId = item.id;
    } else if (item.category === 'GREEN_VFX' && item.vfxId) {
      nextCosmetics.greenReleaseVfx = item.vfxId as GreenReleaseVfxId;
    } else if (item.category === 'SNEAKER') {
      nextCosmetics.sneakerId = item.id;
      nextCosmetics.shoeColor = item.swatch;
    }

    const nextOwned = owned ? _modesState.ownedSwagIds : [..._modesState.ownedSwagIds, item.id];
    const nextSlots = _modesState.buildSlots.map((b, i) =>
      i === _modesState.activeBuildSlotIndex ? { ...b, cosmetics: nextCosmetics } : b
    );
    commitModes({
      ..._modesState,
      ownedSwagIds: nextOwned,
      buildSlots: nextSlots,
    });
    return {
      ok: true,
      message: owned ? `Equipped ${item.name} on ${active.name}!` : `Purchased & equipped ${item.name}!`,
    };
  },

  // --- MYTEAM ---
  openMyTeamPack(
    packId: MyTeamPackId,
    currency: 'VC' | 'MTP'
  ): { ok: boolean; cards: MyTeamCard[]; message: string } {
    const pack = MYTEAM_PACKS.find((p) => p.id === packId);
    if (!pack) return { ok: false, cards: [], message: 'Pack unavailable.' };
    const wallet = UltimateHybridStore.getState().currencies;
    if (currency === 'VC') {
      if (wallet.vc < pack.priceVc) {
        return { ok: false, cards: [], message: `Need ${pack.priceVc.toLocaleString()} VC.` };
      }
      UltimateHybridStore.addCurrency({ vc: -pack.priceVc });
    } else {
      if (wallet.mtp < pack.priceMtp) {
        return { ok: false, cards: [], message: `Need ${pack.priceMtp.toLocaleString()} MTP.` };
      }
      UltimateHybridStore.addCurrency({ mtp: -pack.priceMtp });
    }
    const pulled = rollMyTeamPack(packId);
    commitModes({
      ..._modesState,
      myTeam: {
        ..._modesState.myTeam,
        ownedCards: [...pulled, ..._modesState.myTeam.ownedCards],
        packsOpened: _modesState.myTeam.packsOpened + 1,
      },
    });
    return { ok: true, cards: pulled, message: `Opened ${pack.name}!` };
  },

  setMyTeamLineupSlot(slotType: 'STARTER' | 'BENCH', index: number, cardId: string): Part6ModesSave {
    const mt = _modesState.myTeam;
    const starters = [...mt.startingFiveIds];
    const bench = [...mt.benchIds];

    // Remove cardId if already placed elsewhere by swapping cleanly
    const prevStarterIdx = starters.indexOf(cardId);
    const prevBenchIdx = bench.indexOf(cardId);
    const displaced = slotType === 'STARTER' ? starters[index] : bench[index];

    if (slotType === 'STARTER') {
      starters[index] = cardId;
    } else {
      bench[index] = cardId;
    }

    if (prevStarterIdx !== -1 && !(slotType === 'STARTER' && prevStarterIdx === index) && displaced) {
      starters[prevStarterIdx] = displaced;
    } else if (prevBenchIdx !== -1 && !(slotType === 'BENCH' && prevBenchIdx === index) && displaced) {
      bench[prevBenchIdx] = displaced;
    }

    return commitModes({
      ..._modesState,
      myTeam: {
        ...mt,
        startingFiveIds: starters,
        benchIds: bench,
      },
    });
  },

  equipGameChanger(id: GameChangerCardId | null): Part6ModesSave {
    return commitModes({
      ..._modesState,
      myTeam: {
        ..._modesState.myTeam,
        equippedGameChangerId: id,
      },
    });
  },

  buyGameChanger(id: GameChangerCardId): { ok: boolean; message: string } {
    const def = GAME_CHANGER_CATALOG.find((g) => g.id === id);
    if (!def) return { ok: false, message: 'Card not found.' };
    const mtp = UltimateHybridStore.getState().currencies.mtp;
    if (mtp < def.costMtp) {
      return { ok: false, message: `Need ${def.costMtp.toLocaleString()} MTP.` };
    }
    UltimateHybridStore.addCurrency({ mtp: -def.costMtp });
    const nextCounts = {
      ..._modesState.myTeam.gameChangerCounts,
      [id]: (_modesState.myTeam.gameChangerCounts[id] ?? 0) + 1,
    };
    commitModes({
      ..._modesState,
      myTeam: {
        ..._modesState.myTeam,
        gameChangerCounts: nextCounts,
        equippedGameChangerId: id,
      },
    });
    return { ok: true, message: `Acquired & equipped ${def.name}!` };
  },

  // --- MYNBA ERAS ---
  startNewMyNbaEra(era: MyNbaEraId, userTeamId?: string): Part6ModesSave {
    return commitModes({
      ..._modesState,
      myNba: createMyNbaSeason(era, userTeamId),
    });
  },

  setMyNbaUserTeam(teamId: string): Part6ModesSave {
    return commitModes({
      ..._modesState,
      myNba: { ..._modesState.myNba, userTeamId: teamId },
    });
  },

  simulateMyNbaSeriesGame(seriesId: string): { ok: boolean; summary: string } {
    const series = _modesState.myNba.playoffBracket.find((s) => s.id === seriesId);
    if (!series || series.winnerTeamId) {
      return { ok: false, summary: 'Series already decided.' };
    }
    const hi = RosterStore.getTeamById(series.highSeedTeamId);
    const lo = RosterStore.getTeamById(series.lowSeedTeamId);
    const sim = simulateOvrWeightedGame(hi, lo);
    const highWins = series.highWins + (sim.winnerId === hi.id ? 1 : 0);
    const lowWins = series.lowWins + (sim.winnerId === lo.id ? 1 : 0);
    const winnerTeamId = highWins >= 4 ? hi.id : lowWins >= 4 ? lo.id : null;

    const updated = _modesState.myNba.playoffBracket.map((s) =>
      s.id === seriesId ? { ...s, highWins, lowWins, winnerTeamId } : s
    );
    const advanced = advancePlayoffBracketRounds(updated);
    commitModes({
      ..._modesState,
      myNba: {
        ..._modesState.myNba,
        playoffBracket: advanced.nextBracket,
        championTeamId: advanced.championTeamId,
      },
    });
    return {
      ok: true,
      summary: `${hi.abbr} ${sim.highScore} - ${lo.abbr} ${sim.lowScore} (Series ${highWins}-${lowWins})`,
    };
  },

  simulateMyNbaCurrentRound(): { ok: boolean; gamesSimulated: number } {
    let bracket = [..._modesState.myNba.playoffBracket];
    const activeRounds = bracket.filter((s) => !s.winnerTeamId).map((s) => s.round);
    if (activeRounds.length === 0) return { ok: false, gamesSimulated: 0 };
    const targetRound = Math.min(...activeRounds);
    let games = 0;

    bracket = bracket.map((s) => {
      if (s.round !== targetRound || s.winnerTeamId) return s;
      const hi = RosterStore.getTeamById(s.highSeedTeamId);
      const lo = RosterStore.getTeamById(s.lowSeedTeamId);
      let hw = s.highWins;
      let lw = s.lowWins;
      while (hw < 4 && lw < 4) {
        const res = simulateOvrWeightedGame(hi, lo);
        if (res.winnerId === hi.id) hw += 1;
        else lw += 1;
        games += 1;
      }
      return {
        ...s,
        highWins: hw,
        lowWins: lw,
        winnerTeamId: hw >= 4 ? hi.id : lo.id,
      };
    });

    const advanced = advancePlayoffBracketRounds(bracket);
    commitModes({
      ..._modesState,
      myNba: {
        ..._modesState.myNba,
        playoffBracket: advanced.nextBracket,
        championTeamId: advanced.championTeamId,
      },
    });
    return { ok: true, gamesSimulated: games };
  },

  executeMyNbaTrade(
    userTeamId: string,
    partnerTeamId: string,
    userPlayerId: string,
    partnerPlayerId: string
  ): { ok: boolean; approvalPct: number; message: string } {
    const userTeam = RosterStore.getTeamById(userTeamId);
    const partnerTeam = RosterStore.getTeamById(partnerTeamId);
    const outP = userTeam.roster.find((p) => p.id === userPlayerId);
    const inP = partnerTeam.roster.find((p) => p.id === partnerPlayerId);
    if (!outP || !inP) {
      return { ok: false, approvalPct: 0, message: 'Select valid players on both teams.' };
    }
    const evalRes = evaluateAiTradeApproval(outP, inP);
    if (!evalRes.accepted) {
      return { ok: false, approvalPct: evalRes.approvalPct, message: evalRes.reason };
    }
    RosterStore.tradePlayers(userTeamId, userPlayerId, partnerTeamId, partnerPlayerId);
    const rec = {
      id: `tr_${Date.now()}`,
      summary: `${userTeam.abbr} sent ${outP.name} (${outP.ovr}) to ${partnerTeam.abbr} for ${inP.name} (${inP.ovr})`,
      approvalScore: evalRes.approvalPct,
      timestampMs: Date.now(),
    };
    commitModes({
      ..._modesState,
      myNba: {
        ..._modesState.myNba,
        tradeHistory: [rec, ..._modesState.myNba.tradeHistory].slice(0, 12),
      },
    });
    return { ok: true, approvalPct: evalRes.approvalPct, message: `Trade Approved (${evalRes.approvalPct}%)!` };
  },

  // --- LAUNCH BRIDGE & POST-MATCH REWARD SETTLEMENT ---
  setActiveLaunchPayload(payload: ModeLaunchPayload | null): void {
    _activeLaunchPayload = payload;
  },

  getActiveLaunchPayload(): ModeLaunchPayload | null {
    return _activeLaunchPayload;
  },

  launchModeMatch(payload: ModeLaunchPayload): void {
    _activeLaunchPayload = payload;
    UltimateHybridStore.updateMatchConfig(payload.matchPatch);
    UltimateHybridStore.setActiveScreen('LIVE_GAME');
  },

  settleCompletedModeMatch(result: {
    userWon: boolean;
    margin: number;
    starPts: number;
    starAst: number;
    drillMetricCount: number;
  }): { headline: string; vcEarned: number; mtpEarned: number; repEarned: number; details: string } {
    const payload = _activeLaunchPayload;
    if (!payload) {
      return { headline: 'Match Complete', vcEarned: 400, mtpEarned: 200, repEarned: 100, details: '' };
    }

    let vc = payload.baseVcReward ?? (result.userWon ? 800 : 300);
    let mtp = payload.baseMtpReward ?? (result.userWon ? 500 : 180);
    let rep = payload.baseRepReward ?? (result.userWon ? 260 : 90);
    let headline = result.userWon ? `${payload.title} — Victory!` : `${payload.title} — Final`;
    let details = '';

    const nextState: Part6ModesSave = { ..._modesState };

    // Decrement Gatorade boost if active
    if (nextState.gatoradeBoostGamesLeft > 0 && payload.kind !== 'TRAINING_FREESTYLE') {
      nextState.gatoradeBoostGamesLeft = Math.max(0, nextState.gatoradeBoostGamesLeft - 1);
    }

    // Consume & apply MyTEAM Game Changer Card
    if (payload.myTeamGameChangerId) {
      const gcId = payload.myTeamGameChangerId;
      if (gcId === 'GC_2X_MTP_REP') {
        mtp *= 2;
        rep *= 2;
        details = 'Game Changer: 2x MTP & Rep applied! ';
      } else if (gcId === 'GC_BADGE_XP_SURGE') {
        vc += 500;
        rep += 250;
        details = 'Game Changer: Badge XP Surge (+500 VC)! ';
      }
      const prevCount = nextState.myTeam.gameChangerCounts[gcId] ?? 0;
      nextState.myTeam = {
        ...nextState.myTeam,
        gameChangerCounts: {
          ...nextState.myTeam.gameChangerCounts,
          [gcId]: Math.max(0, prevCount - 1),
        },
        equippedGameChangerId: prevCount > 1 ? gcId : null,
      };
    }

    // 1. Path to Greatness
    if (payload.kind === 'PATH_TO_GREATNESS' && payload.ptgScenarioId) {
      const sc = PTG_SCENARIOS.find((s) => s.id === payload.ptgScenarioId);
      if (sc) {
        let stars = 0;
        if (result.userWon) stars += 1;
        if (result.userWon && result.starPts >= sc.targetStarPts) stars += 1;
        if (result.userWon && result.starPts >= sc.targetStarPts && result.starAst >= sc.targetStarAst) {
          stars += 1;
        }
        const prev = nextState.ptgProgress[sc.id] ?? { completed: false, stars: 0, bestMargin: 0, trophyUnlocked: false };
        nextState.ptgProgress = {
          ...nextState.ptgProgress,
          [sc.id]: {
            completed: prev.completed || result.userWon,
            stars: Math.max(prev.stars, stars),
            bestMargin: Math.max(prev.bestMargin, result.margin),
            trophyUnlocked: prev.trophyUnlocked || stars >= 2,
          },
        };
        if (result.userWon) {
          vc = sc.vcReward + stars * 400;
          headline = `${sc.title} Cleared (${stars}★)`;
          details += stars >= 2 ? `Unlocked ${sc.trophyName}!` : 'Win achieved — reach LeBron stat targets for 3★.';
        }
      }
    }

    // 2. Street Kings Boss Ladder
    if (payload.kind === 'CITY_STREET_KINGS' && payload.streetKingsBossId && result.userWon) {
      const boss = STREET_KINGS_BOSSES.find((b) => b.id === payload.streetKingsBossId);
      if (boss) {
        vc = boss.vcBounty;
        rep = boss.badgeXpReward;
        if (!nextState.streetKingsDefeatedIds.includes(boss.id)) {
          nextState.streetKingsDefeatedIds = [...nextState.streetKingsDefeatedIds, boss.id];
        }
        headline = `Coliseum Boss Defeated: ${boss.name}!`;
        details += `Bounty claimed: +${boss.vcBounty.toLocaleString()} VC & +${boss.badgeXpReward} Badge XP.`;
      }
    }

    // 3. Proving Grounds Ranked Ladder
    if (payload.kind === 'CITY_PROVING_GROUNDS') {
      const rpDelta = result.userWon ? 160 : -65;
      const nextRp = Math.max(0, nextState.provingGrounds.rp + rpDelta);
      const tier: Part6ModesSave['provingGrounds']['tier'] =
        nextRp >= 1600
          ? 'Elite'
          : nextRp >= 1250
            ? 'Diamond'
            : nextRp >= 920
              ? 'Platinum'
              : nextRp >= 620
                ? 'Gold'
                : nextRp >= 340
                  ? 'Silver'
                  : 'Bronze';
      nextState.provingGrounds = {
        tier,
        rp: nextRp,
        wins: nextState.provingGrounds.wins + (result.userWon ? 1 : 0),
        losses: nextState.provingGrounds.losses + (result.userWon ? 0 : 1),
      };
      details += `Proving Grounds: ${tier} (${nextRp} RP, ${rpDelta >= 0 ? '+' : ''}${rpDelta}).`;
    }

    // 4. Skyline Park Streak Setter / Breaker Bonus
    if (payload.kind === 'CITY_PARK' && result.userWon && payload.parkStreakBonusVc) {
      vc += payload.parkStreakBonusVc;
      details += `Streak Breaker Bonus: +${payload.parkStreakBonusVc.toLocaleString()} VC!`;
    }

    // 5. MyCAREER NBA Game progress
    if (payload.kind === 'CITY_MYCAREER_NBA') {
      const idx = nextState.activeBuildSlotIndex;
      const active = nextState.buildSlots[idx];
      if (active) {
        const nextBuild: MyPlayerBuildSlot = {
          ...active,
          careerGameNumber: active.careerGameNumber + 1,
          careerWins: active.careerWins + (result.userWon ? 1 : 0),
          careerLosses: active.careerLosses + (result.userWon ? 0 : 1),
          careerPpg: Number(((active.careerPpg * 3 + Math.max(12, result.starPts)) / 4).toFixed(1)),
        };
        nextState.buildSlots = nextState.buildSlots.map((b, i) => (i === idx ? nextBuild : b));
      }
    }

    // 6. MyTEAM Domination & Triple Threat
    if (payload.kind === 'MYTEAM_DOMINATION' && payload.myTeamDominationTeamId && result.userWon) {
      const stars = result.margin >= 12 ? 3 : result.margin >= 6 ? 2 : 1;
      const prev = nextState.myTeam.dominationStars[payload.myTeamDominationTeamId] ?? 0;
      nextState.myTeam = {
        ...nextState.myTeam,
        dominationStars: {
          ...nextState.myTeam.dominationStars,
          [payload.myTeamDominationTeamId]: Math.max(prev, stars),
        },
      };
      details += `Domination Complete: ${stars}★ earned!`;
    }
    if (payload.kind === 'MYTEAM_TRIPLE_THREAT' && result.userWon) {
      nextState.myTeam = {
        ...nextState.myTeam,
        tripleThreatWins: nextState.myTeam.tripleThreatWins + 1,
      };
      details += `Triple Threat Win #${nextState.myTeam.tripleThreatWins}!`;
    }

    // 7. MyNBA Playoff Series game
    if (payload.kind === 'MYNBA_GAME' && payload.myNbaSeriesId) {
      const s = nextState.myNba.playoffBracket.find((x) => x.id === payload.myNbaSeriesId);
      if (s && !s.winnerTeamId) {
        const userIsHigh = s.highSeedTeamId === nextState.myNba.userTeamId;
        const highWon = userIsHigh ? result.userWon : !result.userWon;
        const hw = s.highWins + (highWon ? 1 : 0);
        const lw = s.lowWins + (highWon ? 0 : 1);
        const winnerTeamId = hw >= 4 ? s.highSeedTeamId : lw >= 4 ? s.lowSeedTeamId : null;
        const updated = nextState.myNba.playoffBracket.map((x) =>
          x.id === s.id ? { ...x, highWins: hw, lowWins: lw, winnerTeamId } : x
        );
        const adv = advancePlayoffBracketRounds(updated);
        nextState.myNba = {
          ...nextState.myNba,
          playoffBracket: adv.nextBracket,
          championTeamId: adv.championTeamId,
        };
        details += `Playoff Series updated (${hw}-${lw}).`;
      }
    }

    // 8. Training Camp Drill Medal
    if (payload.kind === 'TRAINING_DRILL' && payload.trainingDrillId) {
      const drill = TRAINING_DRILLS.find((d) => d.id === payload.trainingDrillId);
      if (drill) {
        const score = result.drillMetricCount;
        const medal: DrillMedal =
          score >= drill.goldTarget
            ? 'GOLD'
            : score >= drill.silverTarget
              ? 'SILVER'
              : score >= drill.bronzeTarget
                ? 'BRONZE'
                : 'NONE';
        const rankOrder: DrillMedal[] = ['NONE', 'BRONZE', 'SILVER', 'GOLD'];
        const prevMedal = nextState.drillMedals[drill.id] ?? 'NONE';
        const bestMedal =
          rankOrder.indexOf(medal) > rankOrder.indexOf(prevMedal) ? medal : prevMedal;
        nextState.drillMedals = { ...nextState.drillMedals, [drill.id]: bestMedal };
        nextState.drillBestScores = {
          ...nextState.drillBestScores,
          [drill.id]: Math.max(nextState.drillBestScores[drill.id] ?? 0, score),
        };
        vc =
          medal === 'GOLD'
            ? drill.vcGoldReward
            : medal === 'SILVER'
              ? Math.round(drill.vcGoldReward * 0.65)
              : medal === 'BRONZE'
                ? Math.round(drill.vcGoldReward * 0.35)
                : 150;
        headline = `${drill.title} — ${medal === 'NONE' ? 'Completed' : `${medal} Medal!`}`;
        details = `Recorded ${score} ${drill.metricLabel}.`;
      }
    }

    UltimateHybridStore.addCurrency({ vc, mtp, repXP: rep, seasonXP: Math.round(rep * 0.65) });
    commitModes(nextState);
    return { headline, vcEarned: vc, mtpEarned: mtp, repEarned: rep, details: details.trim() };
  },

  resetModesSave(): Part6ModesSave {
    return commitModes(createDefaultPart6Save());
  },
};

export function useModesStore(): Part6ModesSave {
  const [snap, setSnap] = useState<Part6ModesSave>(() => ModesStore.getState());
  useEffect(() => ModesStore.subscribe(setSnap), []);
  return snap;
}
