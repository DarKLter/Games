// ============================================================================
// NBA 2K14 + NBA 2K26 ULTIMATE HYBRID — PART 2 ROSTER SCHEMA & FACTORIES
// ============================================================================

export type BadgeTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'HOF' | 'LEGEND';

export type BadgeId =
  // Shooting (5)
  | 'DEADEYE'
  | 'LIMITLESS_RANGE'
  | 'SET_SHOT_SPECIALIST'
  | 'SHIFTY_SHOOTER'
  | 'MINI_MARKSMAN'
  // Playmaking (7)
  | 'ANKLE_ASSASSIN'
  | 'DIMER'
  | 'LIGHTNING_LAUNCH'
  | 'UNPLUCKABLE'
  | 'HANDLES_FOR_DAYS'
  | 'VERSATILE_VISIONARY'
  | 'BREAK_STARTER'
  // Finishing (5)
  | 'POSTERIZER'
  | 'AERIAL_WIZARD'
  | 'LAYUP_MIXMASTER'
  | 'FLOAT_GAME'
  | 'PHYSICAL_FINISHER'
  // Defense / Rebounding (8)
  | 'PERIMETER_CHALLENGER'
  | 'GLOVE'
  | 'INTERCEPTOR'
  | 'PAINT_PATROLLER'
  | 'HIGH_FLYING_DENIER'
  | 'BOXOUT_BEAST'
  | 'REBOUND_CHASER'
  | 'POGO_STICK';

export type BadgeCategory = 'SHOOTING' | 'PLAYMAKING' | 'FINISHING' | 'DEFENSE';

export interface BadgeMeta {
  id: BadgeId;
  name: string;
  category: BadgeCategory;
  shortDesc: string;
}

export const BADGE_TIERS: BadgeTier[] = ['BRONZE', 'SILVER', 'GOLD', 'HOF', 'LEGEND'];

export const BADGE_CATALOG: BadgeMeta[] = [
  // Shooting
  { id: 'DEADEYE', name: 'Deadeye', category: 'SHOOTING', shortDesc: 'Reduces late defensive closeout penalty on jumpers.' },
  { id: 'LIMITLESS_RANGE', name: 'Limitless Range', category: 'SHOOTING', shortDesc: 'Extends three-point range deep past the arc.' },
  { id: 'SET_SHOT_SPECIALIST', name: 'Set Shot Specialist', category: 'SHOOTING', shortDesc: 'Boosts stationary catch-and-shoot jump shots.' },
  { id: 'SHIFTY_SHOOTER', name: 'Shifty Shooter', category: 'SHOOTING', shortDesc: 'Improves off-dribble pull-ups, stepbacks, and fades.' },
  { id: 'MINI_MARKSMAN', name: 'Mini Marksman', category: 'SHOOTING', shortDesc: 'Raises shooting percentage over taller defenders.' },
  // Playmaking
  { id: 'ANKLE_ASSASSIN', name: 'Ankle Assassin', category: 'PLAYMAKING', shortDesc: 'Increases chance to freeze or drop on-ball defenders.' },
  { id: 'DIMER', name: 'Dimer', category: 'PLAYMAKING', shortDesc: 'Gives open teammates a shot boost after crisp passes.' },
  { id: 'LIGHTNING_LAUNCH', name: 'Lightning Launch', category: 'PLAYMAKING', shortDesc: 'Accelerates explosive first-step perimeter drives.' },
  { id: 'UNPLUCKABLE', name: 'Unpluckable', category: 'PLAYMAKING', shortDesc: 'Protects the ball from reach-in steal attempts.' },
  { id: 'HANDLES_FOR_DAYS', name: 'Handles for Days', category: 'PLAYMAKING', shortDesc: 'Reduces energy loss on chained iso dribble moves.' },
  { id: 'VERSATILE_VISIONARY', name: 'Versatile Visionary', category: 'PLAYMAKING', shortDesc: 'Threads alley-oops, skip passes, and tight lanes.' },
  { id: 'BREAK_STARTER', name: 'Break Starter', category: 'PLAYMAKING', shortDesc: 'Fires accurate full-court outlet passes off boards.' },
  // Finishing
  { id: 'POSTERIZER', name: 'Posterizer', category: 'FINISHING', shortDesc: 'Elevates contact dunk finishes through rim protectors.' },
  { id: 'AERIAL_WIZARD', name: 'Aerial Wizard', category: 'FINISHING', shortDesc: 'Boosts alley-oop slams and putback finishes.' },
  { id: 'LAYUP_MIXMASTER', name: 'Layup Mixmaster', category: 'FINISHING', shortDesc: 'Enhances euro-steps, spin layups, and scoop finishes.' },
  { id: 'FLOAT_GAME', name: 'Float Game', category: 'FINISHING', shortDesc: 'Raises accuracy on teardrops and runners in the lane.' },
  { id: 'PHYSICAL_FINISHER', name: 'Physical Finisher', category: 'FINISHING', shortDesc: 'Powers through contact on strong paint drives.' },
  // Defense / Rebounding
  { id: 'PERIMETER_CHALLENGER', name: 'Challenger', category: 'DEFENSE', shortDesc: 'Amplifies perimeter shot contests and closeouts.' },
  { id: 'GLOVE', name: 'Glove', category: 'DEFENSE', shortDesc: 'Increases clean on-ball strip steals.' },
  { id: 'INTERCEPTOR', name: 'Interceptor', category: 'DEFENSE', shortDesc: 'Boosts passing-lane deflections and steals.' },
  { id: 'PAINT_PATROLLER', name: 'Paint Patroller', category: 'DEFENSE', shortDesc: 'Protects the rim and deters inside layups/dunks.' },
  { id: 'HIGH_FLYING_DENIER', name: 'High-Flying Denier', category: 'DEFENSE', shortDesc: 'Boosts chase-down and weakside swat speed.' },
  { id: 'BOXOUT_BEAST', name: 'Boxout Beast', category: 'DEFENSE', shortDesc: 'Holds rebounding position and swims past boxouts.' },
  { id: 'REBOUND_CHASER', name: 'Rebound Chaser', category: 'DEFENSE', shortDesc: 'Expands rebounding reach on long and contested boards.' },
  { id: 'POGO_STICK', name: 'Pogo Stick', category: 'DEFENSE', shortDesc: 'Allows rapid consecutive vertical jumps in the paint.' },
];

export type HotZoneValue = -1 | 0 | 1;

export type HotZoneKey =
  | 'leftCorner3'
  | 'leftWing3'
  | 'topKey3'
  | 'rightWing3'
  | 'rightCorner3'
  | 'leftMid'
  | 'topMid'
  | 'rightMid'
  | 'paint';

export interface HotZones {
  leftCorner3: HotZoneValue;
  leftWing3: HotZoneValue;
  topKey3: HotZoneValue;
  rightWing3: HotZoneValue;
  rightCorner3: HotZoneValue;
  leftMid: HotZoneValue;
  topMid: HotZoneValue;
  rightMid: HotZoneValue;
  paint: HotZoneValue;
}

export interface PlayerAttributes {
  closeShot: number;
  midRange: number;
  threePt: number;
  freeThrow: number;
  drivingDunk: number;
  drivingLayup: number;
  ballHandle: number;
  passAccuracy: number;
  speed: number;
  acceleration: number;
  vertical: number;
  strength: number;
  perimeterDef: number;
  interiorDef: number;
  steal: number;
  block: number;
  offReb: number;
  defReb: number;
}

export type AttributeKey = keyof PlayerAttributes;

export const ATTRIBUTE_META: Array<{
  key: AttributeKey;
  label: string;
  group: 'SHOOTING' | 'FINISHING' | 'PLAYMAKING' | 'PHYSICALS' | 'DEFENSE';
}> = [
  { key: 'threePt', label: 'Three-Point Shot', group: 'SHOOTING' },
  { key: 'midRange', label: 'Mid-Range Shot', group: 'SHOOTING' },
  { key: 'freeThrow', label: 'Free Throw', group: 'SHOOTING' },
  { key: 'closeShot', label: 'Close Shot', group: 'FINISHING' },
  { key: 'drivingLayup', label: 'Driving Layup', group: 'FINISHING' },
  { key: 'drivingDunk', label: 'Driving Dunk', group: 'FINISHING' },
  { key: 'ballHandle', label: 'Ball Handle', group: 'PLAYMAKING' },
  { key: 'passAccuracy', label: 'Pass Accuracy', group: 'PLAYMAKING' },
  { key: 'speed', label: 'Speed', group: 'PHYSICALS' },
  { key: 'acceleration', label: 'Acceleration', group: 'PHYSICALS' },
  { key: 'vertical', label: 'Vertical', group: 'PHYSICALS' },
  { key: 'strength', label: 'Strength', group: 'PHYSICALS' },
  { key: 'perimeterDef', label: 'Perimeter Defense', group: 'DEFENSE' },
  { key: 'interiorDef', label: 'Interior Defense', group: 'DEFENSE' },
  { key: 'steal', label: 'Steal', group: 'DEFENSE' },
  { key: 'block', label: 'Block', group: 'DEFENSE' },
  { key: 'offReb', label: 'Offensive Rebound', group: 'DEFENSE' },
  { key: 'defReb', label: 'Defensive Rebound', group: 'DEFENSE' },
];

export type PlayerPosition = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export type HairStyle =
  | 'BALD'
  | 'BUZZ'
  | 'FADE'
  | 'AFRO'
  | 'DREADS'
  | 'BRAIDS'
  | 'PONYTAIL'
  | 'SHORT';

export type ArmSleeveOption = 'NONE' | 'LEFT' | 'RIGHT' | 'BOTH';

export interface PlayerAppearance {
  skinTone: string;
  hairStyle: HairStyle;
  hairColor: string;
  headband: boolean;
  armSleeve: ArmSleeveOption;
  legCompression: boolean;
  shoeColor: string;
}

export interface PlayerTendencies {
  shoot3: number;
  driveRim: number;
  postUp: number;
  passFirst: number;
  stealAggro: number;
}

export type TeamEra = '2K14' | '2K26' | 'LEGENDS' | 'EUROLEAGUE' | 'WNBA';
export type TeamConference = 'EAST' | 'WEST' | 'EURO' | 'WNBA';

export interface PlayerProfile {
  id: string;
  name: string;
  jerseyNumber: number;
  position: PlayerPosition;
  heightInches: number; // 69..88
  weightLbs: number;
  wingspanInches: number;
  ovr: number; // 65..99
  archetype: string;
  era: TeamEra;
  appearance: PlayerAppearance;
  jumpshotSpeed: number; // 0.75..1.25
  tendencies: PlayerTendencies;
  attributes: PlayerAttributes;
  hotZones: HotZones;
  badges: Partial<Record<BadgeId, BadgeTier>>;
  isCreated?: boolean;
}

export interface TeamColors {
  primary: string;
  secondary: string;
  accent: string;
  courtWood: string;
  keyColor: string;
}

export interface TeamData {
  id: string;
  era: TeamEra;
  city: string;
  name: string;
  abbr: string;
  conference: TeamConference;
  arena: string;
  colors: TeamColors;
  ovr: number;
  offRating: number;
  defRating: number;
  roster: PlayerProfile[]; // 5 Starters (PG, SG, SF, PF, C) + 3 Bench = 8 playable players
}

// ============================================================================
// HELPER UTILITIES & DETERMINISTIC PLAYER / TEAM FACTORY
// ============================================================================

export function clampRating(val: number, min = 25, max = 99): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

export function formatHeightFeetInches(inches: number): string {
  const clamped = Math.max(66, Math.min(90, Math.round(inches)));
  const ft = Math.floor(clamped / 12);
  const rem = clamped % 12;
  return `${ft}'${rem}"`;
}

export function computePlayerOvr(attrs: PlayerAttributes, pos: PlayerPosition): number {
  const shoot = attrs.threePt * 0.42 + attrs.midRange * 0.38 + attrs.freeThrow * 0.2;
  const finish = attrs.drivingLayup * 0.4 + attrs.drivingDunk * 0.35 + attrs.closeShot * 0.25;
  const play = attrs.ballHandle * 0.52 + attrs.passAccuracy * 0.48;
  const phys =
    attrs.speed * 0.3 +
    attrs.acceleration * 0.28 +
    attrs.vertical * 0.2 +
    attrs.strength * 0.22;
  const perDef = attrs.perimeterDef * 0.55 + attrs.steal * 0.45;
  const intDef = attrs.interiorDef * 0.55 + attrs.block * 0.45;
  const reb = attrs.defReb * 0.65 + attrs.offReb * 0.35;

  let weighted: number;
  if (pos === 'PG') {
    weighted = shoot * 0.25 + play * 0.28 + finish * 0.16 + phys * 0.15 + perDef * 0.13 + reb * 0.03;
  } else if (pos === 'SG') {
    weighted = shoot * 0.3 + finish * 0.2 + play * 0.17 + phys * 0.16 + perDef * 0.13 + reb * 0.04;
  } else if (pos === 'SF') {
    weighted = shoot * 0.23 + finish * 0.22 + play * 0.14 + phys * 0.16 + perDef * 0.13 + intDef * 0.06 + reb * 0.06;
  } else if (pos === 'PF') {
    weighted = finish * 0.24 + shoot * 0.18 + intDef * 0.17 + reb * 0.17 + phys * 0.12 + perDef * 0.06 + play * 0.06;
  } else {
    weighted = finish * 0.26 + intDef * 0.24 + reb * 0.24 + phys * 0.11 + shoot * 0.09 + play * 0.06;
  }
  return clampRating(weighted + 7, 65, 99);
}

export function deriveArchetype(attrs: PlayerAttributes, pos: PlayerPosition): string {
  const hi3 = attrs.threePt >= 84;
  const hiDunk = attrs.drivingDunk >= 84;
  const hiPlay = attrs.ballHandle >= 83 && attrs.passAccuracy >= 82;
  const hiDef = attrs.perimeterDef >= 83 || attrs.interiorDef >= 84 || attrs.block >= 83;

  if (pos === 'C' || pos === 'PF') {
    if (hi3 && hiDef) return 'Two-Way Stretch Big';
    if (hi3) return 'Stretch Playmaker';
    if (hiPlay && attrs.defReb >= 82) return 'Point Center';
    if (hiDef && hiDunk) return 'Paint Beast';
    if (hiDef) return 'Defensive Anchor';
    return 'Interior Finisher';
  }
  if (hi3 && hiDef && hiDunk) return '2-Way 3-Level Threat';
  if (hi3 && hiPlay) return 'Shot-Creating Playmaker';
  if (hiDunk && hiPlay) return 'Slashing Playmaker';
  if (hi3 && hiDef) return '3 & D Wing';
  if (hi3) return 'Sharpshooter';
  if (hiDunk) return 'Athletic Finisher';
  if (hiDef) return 'Perimeter Lockdown';
  return 'All-Around Two-Way';
}

export function computeTeamRatings(roster: PlayerProfile[]): {
  ovr: number;
  offRating: number;
  defRating: number;
} {
  const starters = roster.slice(0, 5);
  const bench = roster.slice(5, 8);
  const sOvr =
    starters.reduce((sum, p) => sum + p.ovr, 0) / Math.max(1, starters.length);
  const bOvr =
    bench.length > 0
      ? bench.reduce((sum, p) => sum + p.ovr, 0) / bench.length
      : sOvr - 4;
  const ovr = clampRating(sOvr * 0.8 + bOvr * 0.2 + 2, 70, 99);

  const offAvg =
    starters.reduce(
      (sum, p) =>
        sum +
        (p.attributes.threePt * 0.28 +
          p.attributes.midRange * 0.22 +
          p.attributes.drivingLayup * 0.2 +
          p.attributes.drivingDunk * 0.14 +
          p.attributes.passAccuracy * 0.16),
      0
    ) / Math.max(1, starters.length);

  const defAvg =
    starters.reduce(
      (sum, p) =>
        sum +
        (p.attributes.perimeterDef * 0.32 +
          p.attributes.interiorDef * 0.28 +
          p.attributes.steal * 0.16 +
          p.attributes.block * 0.12 +
          p.attributes.defReb * 0.12),
      0
    ) / Math.max(1, starters.length);

  return {
    ovr,
    offRating: clampRating(offAvg + 7, 68, 99),
    defRating: clampRating(defAvg + 7, 68, 99),
  };
}

export type PlayerStylePreset =
  | 'SUPERSTAR_WING'
  | 'ELITE_PG'
  | 'SHARPSHOOTER'
  | 'SLASHER'
  | 'TWO_WAY_WING'
  | 'STRETCH_BIG'
  | 'RIM_PROTECTOR'
  | 'POST_SCORER'
  | 'POINT_CENTER'
  | 'ROLE_GUARD'
  | 'ROLE_FORWARD'
  | 'ROLE_BIG';

export interface MakePlayerSpec {
  id: string;
  name: string;
  jerseyNumber: number;
  position: PlayerPosition;
  ovr: number;
  era: TeamEra;
  style?: PlayerStylePreset;
  heightInches?: number;
  weightLbs?: number;
  wingspanInches?: number;
  archetype?: string;
  jumpshotSpeed?: number;
  attrs?: Partial<PlayerAttributes>;
  hotZones?: Partial<HotZones>;
  badges?: Partial<Record<BadgeId, BadgeTier>>;
  appearance?: Partial<PlayerAppearance>;
  tendencies?: Partial<PlayerTendencies>;
}

const SKIN_PALETTE = ['#f2cbb6', '#dfa883', '#c68657', '#9c623d', '#734529', '#522f1c'];
const HAIR_STYLES: HairStyle[] = ['FADE', 'BUZZ', 'SHORT', 'BRAIDS', 'DREADS', 'AFRO', 'BALD'];
const SHOE_COLORS = ['#e11d48', '#f59e0b', '#38bdf8', '#f8fafc', '#22c55e', '#a855f7'];

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function defaultPhysicals(pos: PlayerPosition, era: TeamEra, seed: number) {
  const isW = era === 'WNBA';
  const baseH: Record<PlayerPosition, number> = isW
    ? { PG: 69, SG: 71, SF: 73, PF: 75, C: 77 }
    : { PG: 74, SG: 77, SF: 79, PF: 81, C: 84 };
  const baseW: Record<PlayerPosition, number> = isW
    ? { PG: 148, SG: 160, SF: 172, PF: 186, C: 204 }
    : { PG: 192, SG: 206, SF: 222, PF: 238, C: 254 };
  const delta = (seed % 3) - 1;
  const heightInches = clampRating(baseH[pos] + delta, 69, 88);
  const weightLbs = baseW[pos] + ((seed % 5) - 2) * 5;
  const wingspanInches = heightInches + 3 + (seed % 3);
  return { heightInches, weightLbs, wingspanInches };
}

function defaultStyleForPosition(pos: PlayerPosition, ovr: number): PlayerStylePreset {
  if (pos === 'PG') return ovr >= 84 ? 'ELITE_PG' : 'ROLE_GUARD';
  if (pos === 'SG') return ovr >= 84 ? 'SHARPSHOOTER' : 'ROLE_GUARD';
  if (pos === 'SF') return ovr >= 88 ? 'SUPERSTAR_WING' : ovr >= 82 ? 'TWO_WAY_WING' : 'ROLE_FORWARD';
  if (pos === 'PF') return ovr >= 84 ? 'STRETCH_BIG' : 'ROLE_FORWARD';
  return ovr >= 85 ? 'RIM_PROTECTOR' : 'ROLE_BIG';
}

function tierForOvr(ovr: number, boost = 0): BadgeTier {
  const v = ovr + boost;
  if (v >= 97) return 'LEGEND';
  if (v >= 91) return 'HOF';
  if (v >= 84) return 'GOLD';
  if (v >= 78) return 'SILVER';
  return 'BRONZE';
}

export function makePlayer(spec: MakePlayerSpec): PlayerProfile {
  const seed = hashStr(spec.id + spec.name);
  const style = spec.style ?? defaultStyleForPosition(spec.position, spec.ovr);
  const phys = defaultPhysicals(spec.position, spec.era, seed);
  const base = spec.ovr - 5; // Baseline scaled cleanly around player OVR

  const styleOffsets: Record<PlayerStylePreset, Partial<PlayerAttributes>> = {
    SUPERSTAR_WING: {
      closeShot: 6, midRange: 7, threePt: 5, freeThrow: 5, drivingDunk: 9, drivingLayup: 8,
      ballHandle: 6, passAccuracy: 5, speed: 6, acceleration: 6, vertical: 7, strength: 4,
      perimeterDef: 5, interiorDef: 1, steal: 4, block: 1, offReb: -6, defReb: 1,
    },
    ELITE_PG: {
      closeShot: 2, midRange: 6, threePt: 7, freeThrow: 9, drivingDunk: -4, drivingLayup: 7,
      ballHandle: 10, passAccuracy: 9, speed: 9, acceleration: 9, vertical: 1, strength: -12,
      perimeterDef: 2, interiorDef: -16, steal: 5, block: -20, offReb: -18, defReb: -10,
    },
    SHARPSHOOTER: {
      closeShot: 0, midRange: 8, threePt: 12, freeThrow: 10, drivingDunk: -6, drivingLayup: 3,
      ballHandle: 4, passAccuracy: 3, speed: 4, acceleration: 5, vertical: -2, strength: -10,
      perimeterDef: 2, interiorDef: -14, steal: 2, block: -16, offReb: -16, defReb: -8,
    },
    SLASHER: {
      closeShot: 7, midRange: 1, threePt: -4, freeThrow: 1, drivingDunk: 12, drivingLayup: 10,
      ballHandle: 6, passAccuracy: 2, speed: 8, acceleration: 9, vertical: 11, strength: 2,
      perimeterDef: 3, interiorDef: -4, steal: 5, block: -2, offReb: -6, defReb: -2,
    },
    TWO_WAY_WING: {
      closeShot: 3, midRange: 4, threePt: 5, freeThrow: 4, drivingDunk: 5, drivingLayup: 4,
      ballHandle: 2, passAccuracy: 2, speed: 5, acceleration: 5, vertical: 5, strength: 3,
      perimeterDef: 9, interiorDef: 3, steal: 8, block: 3, offReb: -4, defReb: 2,
    },
    STRETCH_BIG: {
      closeShot: 7, midRange: 6, threePt: 6, freeThrow: 4, drivingDunk: 4, drivingLayup: 3,
      ballHandle: -8, passAccuracy: -2, speed: -5, acceleration: -5, vertical: 0, strength: 8,
      perimeterDef: -4, interiorDef: 7, steal: -6, block: 6, offReb: 4, defReb: 9,
    },
    RIM_PROTECTOR: {
      closeShot: 9, midRange: -8, threePt: -18, freeThrow: -8, drivingDunk: 8, drivingLayup: 2,
      ballHandle: -20, passAccuracy: -10, speed: -9, acceleration: -9, vertical: 4, strength: 12,
      perimeterDef: -10, interiorDef: 12, steal: -10, block: 13, offReb: 10, defReb: 12,
    },
    POST_SCORER: {
      closeShot: 12, midRange: 8, threePt: -4, freeThrow: 4, drivingDunk: 6, drivingLayup: 5,
      ballHandle: -8, passAccuracy: 2, speed: -7, acceleration: -6, vertical: 0, strength: 11,
      perimeterDef: -8, interiorDef: 8, steal: -8, block: 6, offReb: 8, defReb: 10,
    },
    POINT_CENTER: {
      closeShot: 11, midRange: 8, threePt: 6, freeThrow: 6, drivingDunk: 2, drivingLayup: 7,
      ballHandle: 4, passAccuracy: 12, speed: -6, acceleration: -6, vertical: -4, strength: 10,
      perimeterDef: -6, interiorDef: 6, steal: 0, block: 2, offReb: 8, defReb: 11,
    },
    ROLE_GUARD: {
      closeShot: 1, midRange: 4, threePt: 5, freeThrow: 6, drivingDunk: -6, drivingLayup: 4,
      ballHandle: 5, passAccuracy: 5, speed: 6, acceleration: 6, vertical: 0, strength: -12,
      perimeterDef: 3, interiorDef: -14, steal: 4, block: -16, offReb: -16, defReb: -9,
    },
    ROLE_FORWARD: {
      closeShot: 4, midRange: 3, threePt: 4, freeThrow: 2, drivingDunk: 4, drivingLayup: 3,
      ballHandle: -2, passAccuracy: 0, speed: 2, acceleration: 2, vertical: 3, strength: 3,
      perimeterDef: 5, interiorDef: 3, steal: 3, block: 2, offReb: 1, defReb: 4,
    },
    ROLE_BIG: {
      closeShot: 8, midRange: -4, threePt: -12, freeThrow: -4, drivingDunk: 6, drivingLayup: 2,
      ballHandle: -16, passAccuracy: -8, speed: -7, acceleration: -7, vertical: 2, strength: 10,
      perimeterDef: -9, interiorDef: 9, steal: -9, block: 8, offReb: 8, defReb: 10,
    },
  };

  const off = styleOffsets[style];
  const jitter = (k: number) => ((seed + k * 7) % 5) - 2;

  const attributes: PlayerAttributes = {
    closeShot: clampRating(base + (off.closeShot ?? 0) + jitter(1)),
    midRange: clampRating(base + (off.midRange ?? 0) + jitter(2)),
    threePt: clampRating(base + (off.threePt ?? 0) + jitter(3)),
    freeThrow: clampRating(base + (off.freeThrow ?? 0) + jitter(4)),
    drivingDunk: clampRating(base + (off.drivingDunk ?? 0) + jitter(5)),
    drivingLayup: clampRating(base + (off.drivingLayup ?? 0) + jitter(6)),
    ballHandle: clampRating(base + (off.ballHandle ?? 0) + jitter(7)),
    passAccuracy: clampRating(base + (off.passAccuracy ?? 0) + jitter(8)),
    speed: clampRating(base + (off.speed ?? 0) + jitter(9)),
    acceleration: clampRating(base + (off.acceleration ?? 0) + jitter(10)),
    vertical: clampRating(base + (off.vertical ?? 0) + jitter(11)),
    strength: clampRating(base + (off.strength ?? 0) + jitter(12)),
    perimeterDef: clampRating(base + (off.perimeterDef ?? 0) + jitter(13)),
    interiorDef: clampRating(base + (off.interiorDef ?? 0) + jitter(14)),
    steal: clampRating(base + (off.steal ?? 0) + jitter(15)),
    block: clampRating(base + (off.block ?? 0) + jitter(16)),
    offReb: clampRating(base + (off.offReb ?? 0) + jitter(17)),
    defReb: clampRating(base + (off.defReb ?? 0) + jitter(18)),
    ...(spec.attrs ?? {}),
  };

  const hot3: HotZoneValue = attributes.threePt >= 84 ? 1 : attributes.threePt <= 66 ? -1 : 0;
  const hotMid: HotZoneValue = attributes.midRange >= 82 ? 1 : attributes.midRange <= 64 ? -1 : 0;
  const hotPaint: HotZoneValue = attributes.closeShot >= 82 || attributes.drivingDunk >= 82 ? 1 : 0;

  const hotZones: HotZones = {
    leftCorner3: hot3,
    leftWing3: attributes.threePt >= 86 ? 1 : hot3 === -1 ? -1 : 0,
    topKey3: attributes.threePt >= 82 ? 1 : hot3 === -1 ? -1 : 0,
    rightWing3: attributes.threePt >= 84 ? 1 : 0,
    rightCorner3: hot3,
    leftMid: hotMid,
    topMid: attributes.midRange >= 84 ? 1 : 0,
    rightMid: hotMid,
    paint: hotPaint,
    ...(spec.hotZones ?? {}),
  };

  // Auto-assign authentic badges based on attributes & OVR, merged with any explicit badges
  const autoBadges: Partial<Record<BadgeId, BadgeTier>> = {};
  if (attributes.threePt >= 86) autoBadges.LIMITLESS_RANGE = tierForOvr(spec.ovr);
  if (attributes.threePt >= 82) autoBadges.DEADEYE = tierForOvr(spec.ovr, -1);
  if (attributes.threePt >= 80) autoBadges.SET_SHOT_SPECIALIST = tierForOvr(spec.ovr);
  if (attributes.midRange >= 84 && attributes.ballHandle >= 78) autoBadges.SHIFTY_SHOOTER = tierForOvr(spec.ovr);
  if (attributes.ballHandle >= 84) {
    autoBadges.ANKLE_ASSASSIN = tierForOvr(spec.ovr);
    autoBadges.HANDLES_FOR_DAYS = tierForOvr(spec.ovr, -2);
    autoBadges.UNPLUCKABLE = tierForOvr(spec.ovr, -1);
  }
  if (attributes.passAccuracy >= 83) {
    autoBadges.DIMER = tierForOvr(spec.ovr);
    autoBadges.VERSATILE_VISIONARY = tierForOvr(spec.ovr, -2);
  }
  if (attributes.speed >= 85 && attributes.acceleration >= 85) autoBadges.LIGHTNING_LAUNCH = tierForOvr(spec.ovr);
  if (attributes.drivingDunk >= 85) autoBadges.POSTERIZER = tierForOvr(spec.ovr);
  if (attributes.drivingDunk >= 82 && attributes.vertical >= 84) autoBadges.AERIAL_WIZARD = tierForOvr(spec.ovr, -2);
  if (attributes.drivingLayup >= 85) autoBadges.LAYUP_MIXMASTER = tierForOvr(spec.ovr, -1);
  if (attributes.strength >= 82 && attributes.drivingLayup >= 80) autoBadges.PHYSICAL_FINISHER = tierForOvr(spec.ovr, -1);
  if (attributes.perimeterDef >= 83) autoBadges.PERIMETER_CHALLENGER = tierForOvr(spec.ovr);
  if (attributes.steal >= 83) {
    autoBadges.GLOVE = tierForOvr(spec.ovr, -1);
    autoBadges.INTERCEPTOR = tierForOvr(spec.ovr, -2);
  }
  if (attributes.interiorDef >= 84 || attributes.block >= 83) {
    autoBadges.PAINT_PATROLLER = tierForOvr(spec.ovr);
    autoBadges.HIGH_FLYING_DENIER = tierForOvr(spec.ovr, -2);
  }
  if (attributes.defReb >= 84) {
    autoBadges.REBOUND_CHASER = tierForOvr(spec.ovr);
    autoBadges.BOXOUT_BEAST = tierForOvr(spec.ovr, -2);
  }

  const badges: Partial<Record<BadgeId, BadgeTier>> = {
    ...autoBadges,
    ...(spec.badges ?? {}),
  };

  const appearance: PlayerAppearance = {
    skinTone: SKIN_PALETTE[seed % SKIN_PALETTE.length],
    hairStyle: spec.era === 'WNBA' ? (seed % 2 === 0 ? 'PONYTAIL' : 'BRAIDS') : HAIR_STYLES[seed % HAIR_STYLES.length],
    hairColor: '#171717',
    headband: spec.ovr >= 88 && seed % 3 === 0,
    armSleeve: seed % 4 === 0 ? 'RIGHT' : seed % 4 === 1 ? 'LEFT' : 'NONE',
    legCompression: seed % 3 === 0,
    shoeColor: SHOE_COLORS[seed % SHOE_COLORS.length],
    ...(spec.appearance ?? {}),
  };

  const tendencies: PlayerTendencies = {
    shoot3: clampRating(attributes.threePt - 5, 10, 95),
    driveRim: clampRating((attributes.drivingDunk + attributes.drivingLayup) / 2 - 4, 15, 95),
    postUp: clampRating(spec.position === 'C' || spec.position === 'PF' ? 72 : 34, 10, 95),
    passFirst: clampRating(attributes.passAccuracy - 10, 15, 95),
    stealAggro: clampRating(attributes.steal - 8, 15, 95),
    ...(spec.tendencies ?? {}),
  };

  return {
    id: spec.id,
    name: spec.name,
    jerseyNumber: spec.jerseyNumber,
    position: spec.position,
    heightInches: spec.heightInches ?? phys.heightInches,
    weightLbs: spec.weightLbs ?? phys.weightLbs,
    wingspanInches: spec.wingspanInches ?? phys.wingspanInches,
    ovr: clampRating(spec.ovr, 65, 99),
    archetype: spec.archetype ?? deriveArchetype(attributes, spec.position),
    era: spec.era,
    appearance,
    jumpshotSpeed: spec.jumpshotSpeed ?? Number((0.88 + (seed % 24) * 0.01).toFixed(2)),
    tendencies,
    attributes,
    hotZones,
    badges,
  };
}

export type CompactPlayerTuple = [
  name: string,
  jersey: number,
  pos: PlayerPosition,
  ovr: number,
  style?: PlayerStylePreset,
  heightInches?: number,
  extras?: Partial<MakePlayerSpec>,
];

export function makeTeam(input: {
  id: string;
  era: TeamEra;
  city: string;
  name: string;
  abbr: string;
  conference: TeamConference;
  arena: string;
  colors: [primary: string, secondary: string, accent: string, courtWood?: string, keyColor?: string];
  players: CompactPlayerTuple[];
}): TeamData {
  const roster = input.players.map((tuple, idx) => {
    const [name, jerseyNumber, position, ovr, style, heightInches, extras] = tuple;
    return makePlayer({
      id: `${input.id}_p${idx}`,
      name,
      jerseyNumber,
      position,
      ovr,
      era: input.era,
      style,
      heightInches,
      ...(extras ?? {}),
    });
  });

  const ratings = computeTeamRatings(roster);
  return {
    id: input.id,
    era: input.era,
    city: input.city,
    name: input.name,
    abbr: input.abbr,
    conference: input.conference,
    arena: input.arena,
    colors: {
      primary: input.colors[0],
      secondary: input.colors[1],
      accent: input.colors[2],
      courtWood: input.colors[3] ?? '#c69255',
      keyColor: input.colors[4] ?? input.colors[0],
    },
    ovr: ratings.ovr,
    offRating: ratings.offRating,
    defRating: ratings.defRating,
    roster,
  };
}
