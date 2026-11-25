// ============================================================================
// PART 6 — GAME MODES, THE CITY, MYPLAYER BUILDER, PTG, MYTEAM, MYNBA,
// BLACKTOP & TRAINING CAMP TYPES & STATIC CATALOGS
// ============================================================================

import type {
  ActiveMatchConfig,
  MatchDifficulty,
  MatchVenueId,
} from '../hybrid/types';
import type {
  ArmSleeveOption,
  AttributeKey,
  BadgeId,
  BadgeTier,
  HairStyle,
  PlayerAttributes,
  PlayerPosition,
  PlayerProfile,
} from '../hybrid/rosterTypes';

// ----------------------------------------------------------------------------
// 1. MYPLAYER BUILDER (5 PERSISTENT SLOTS)
// ----------------------------------------------------------------------------

export type JumpshotSpeedId = 'SLOW' | 'NORMAL' | 'QUICK' | 'VERY_QUICK';

export type PrimaryTakeoverId =
  | 'SHARP'
  | 'SLASHER'
  | 'SHOT_CREATOR'
  | 'PLAYMAKER'
  | 'LOCKDOWN'
  | 'GLASS_CLEANER';

export type GreenReleaseVfxId =
  | 'DEFAULT_EMERALD'
  | 'FLAME'
  | 'LIGHTNING'
  | 'CLASSIC_2K14_RING'
  | 'GOLDEN_CROWN';

export interface MyPlayerCosmetics {
  skinTone: string;
  hairStyle: HairStyle;
  hairColor: string;
  headband: boolean;
  headbandColor: string;
  armSleeve: ArmSleeveOption;
  legCompression: boolean;
  parkJerseyId: string;
  sneakerId: string;
  shoeColor: string;
  greenReleaseVfx: GreenReleaseVfxId;
}

export interface MyPlayerBuildSlot {
  id: string;
  slotIndex: number; // 0..4
  name: string;
  jerseyNumber: number;
  position: PlayerPosition;
  heightInches: number; // 69 (5'9") .. 88 (7'4")
  weightLbs: number; // 165 .. 295
  wingspanInches: number; // heightInches - 2 .. heightInches + 8
  cosmetics: MyPlayerCosmetics;
  attributes: PlayerAttributes;
  capBreakers: Partial<Record<AttributeKey, number>>; // 0..5 per attribute
  capBreakersEarned: number; // total budget available (default 5)
  jumpshotSpeed: JumpshotSpeedId;
  primaryTakeover: PrimaryTakeoverId;
  archetypeName: string;
  ovr: number;
  badges: Partial<Record<BadgeId, BadgeTier>>;
  careerTeamId: string;
  careerGameNumber: number;
  careerWins: number;
  careerLosses: number;
  careerPpg: number;
  createdAtMs: number;
}

export const JUMPSHOT_SPEED_OPTIONS: Array<{
  id: JumpshotSpeedId;
  label: string;
  releaseMs: number;
}> = [
  { id: 'SLOW', label: 'Slow · Smooth Set', releaseMs: 680 },
  { id: 'NORMAL', label: 'Normal · Classic 2K14', releaseMs: 580 },
  { id: 'QUICK', label: 'Quick · ProPLAY Pro', releaseMs: 500 },
  { id: 'VERY_QUICK', label: 'Very Quick · Meta 2K26', releaseMs: 430 },
];

export const TAKEOVER_OPTIONS: Array<{
  id: PrimaryTakeoverId;
  label: string;
  boostText: string;
  accent: string;
}> = [
  { id: 'SHARP', label: 'Sharpshooter', boostText: '+10 3PT & Limitless Green Window', accent: '#22c55e' },
  { id: 'SLASHER', label: 'Slasher', boostText: '+10 Driving Dunk, Layup & Vertical', accent: '#ef4444' },
  { id: 'SHOT_CREATOR', label: 'Shot Creator', boostText: '+10 Mid-Range & Stepback Timing', accent: '#f59e0b' },
  { id: 'PLAYMAKER', label: 'Playmaker', boostText: '+10 Ball Handle, Speed & Ankle Breakers', accent: '#06b6d4' },
  { id: 'LOCKDOWN', label: 'Lockdown Defender', boostText: '+10 Perimeter Def, Steal & Clamps', accent: '#3b82f6' },
  { id: 'GLASS_CLEANER', label: 'Glass Cleaner', boostText: '+10 Off/Def Rebound, Block & Strength', accent: '#a855f7' },
];

// ----------------------------------------------------------------------------
// 2. THE CITY (11 LANDMARKS, PINS, PARKS, CREWS, SWAG'S, GATORADE, BOSSES)
// ----------------------------------------------------------------------------

export type CityParkId = 'SKYLINE_PARK' | 'RIVET_CITY' | 'SUNSET_BEACH' | 'OLD_TOWN';

export type CityLandmarkId =
  | 'CENTRAL_PLAZA'
  | 'SKYLINE_PARK'
  | 'THE_REC'
  | 'THE_THEATER'
  | 'PROVING_GROUNDS'
  | 'PRO_AM_SUMMIT'
  | 'STREET_KINGS'
  | 'GATORADE_FACILITY'
  | 'MYCOURT'
  | 'NBA_ARENA_TUNNEL'
  | 'CREWS_AND_SWAGS';

export type MapPinCategory =
  | 'SQUAD_RALLY'
  | 'HOT_STREAK'
  | 'RIVAL_WATCH'
  | 'FAVORITE_GRIND';

export interface CityMapPin {
  id: string;
  label: string;
  category: MapPinCategory;
  x: number; // 0..1000 map space
  y: number; // 0..700 map space
  createdAtMs: number;
}

export interface CityLandmarkDef {
  id: CityLandmarkId;
  name: string;
  shortName: string;
  district: string;
  x: number; // 0..1000
  y: number; // 0..700
  worldX: number; // -36..36 for Walkable 3D Plaza
  worldZ: number; // -36..36 for Walkable 3D Plaza
  accent: string;
  icon: string;
  summary: string;
}

export const CITY_LANDMARKS: CityLandmarkDef[] = [
  {
    id: 'CENTRAL_PLAZA',
    name: 'Central Plaza & Golden Statues',
    shortName: 'Central Plaza',
    district: 'Center Hub',
    x: 500,
    y: 350,
    worldX: 0,
    worldZ: 0,
    accent: '#f59e0b',
    icon: '🏆',
    summary: '12-Foot Golden Statues of #1 Rep Legends, City Leaderboards & Quick Build Swap Kiosk.',
  },
  {
    id: 'SKYLINE_PARK',
    name: 'Skyline Park + 2K16 Park Switcher',
    shortName: 'Skyline Park',
    district: 'North-West',
    x: 205,
    y: 170,
    worldX: -22,
    worldZ: -20,
    accent: '#06b6d4',
    icon: '🌆',
    summary: 'Switch Skyline Park, Rivet City, Sunset Beach & Old Town. 4 Live Courts with Streak Setter/Breaker VC!',
  },
  {
    id: 'THE_REC',
    name: 'The REC Indoor Gym',
    shortName: 'The REC',
    district: 'North-East',
    x: 795,
    y: 175,
    worldX: 22,
    worldZ: -20,
    accent: '#3b82f6',
    icon: '🏟️',
    summary: '5v5 Competitive Indoor Gym · Squads & No-Squads full 4-quarter games.',
  },
  {
    id: 'THE_THEATER',
    name: 'The Theater Rotating Playlists',
    shortName: 'The Theater',
    district: 'East District',
    x: 865,
    y: 365,
    worldX: 28,
    worldZ: 2,
    accent: '#ec4899',
    icon: '🎬',
    summary: '4 Rotating Arcade Rulesets: 1v1 Instant, 3v3 No Squads, 2x Speed Arcade & 3PT = 4 Points.',
  },
  {
    id: 'PROVING_GROUNDS',
    name: 'Proving Grounds Ranked Arena',
    shortName: 'Proving Grounds',
    district: 'South-East',
    x: 785,
    y: 545,
    worldX: 22,
    worldZ: 22,
    accent: '#f97316',
    icon: '⚔️',
    summary: 'Bronze → Elite Ranked Ladder enforcing 2K26 High-Risk Green-or-Miss shooting.',
  },
  {
    id: 'PRO_AM_SUMMIT',
    name: 'Pro-Am Summit Arena',
    shortName: 'Pro-Am Summit',
    district: 'South District',
    x: 500,
    y: 595,
    worldX: 0,
    worldZ: 28,
    accent: '#8b5cf6',
    icon: '👑',
    summary: '3v3 & 5v5 Crew Tournament Arena with custom Crew Jerseys & Championship Trophy Bracket.',
  },
  {
    id: 'STREET_KINGS',
    name: 'Street Kings Roman Coliseum',
    shortName: 'Street Kings',
    district: 'South-West',
    x: 205,
    y: 540,
    worldX: -22,
    worldZ: 22,
    accent: '#ef4444',
    icon: '🏛️',
    summary: '5-Boss CPU Coliseum Ladder from Rim Reaper (92) to King of the City (99) with huge VC bounties.',
  },
  {
    id: 'GATORADE_FACILITY',
    name: 'Gatorade Training Facility',
    shortName: 'Gatorade Gym',
    district: 'West District',
    x: 135,
    y: 365,
    worldX: -28,
    worldZ: 2,
    accent: '#22c55e',
    icon: '⚡',
    summary: '3 Playable Timing Mini-Games granting live +4 Stamina & Turbo Boost for your next 5 games.',
  },
  {
    id: 'MYCOURT',
    name: 'MyCOURT Penthouse Gym',
    shortName: 'MyCOURT',
    district: 'North Edge',
    x: 370,
    y: 110,
    worldX: -10,
    worldZ: -28,
    accent: '#eab308',
    icon: '🏠',
    summary: 'Customize Wood Floor, Wall Theme & Rim Sound · Instant 3D Shootaround or 1v1 AI Sparring.',
  },
  {
    id: 'NBA_ARENA_TUNNEL',
    name: 'NBA Arena Tunnel (MyCAREER)',
    shortName: 'NBA Tunnel',
    district: 'North-Center',
    x: 630,
    y: 110,
    worldX: 10,
    worldZ: -28,
    accent: '#e11d48',
    icon: '🏀',
    summary: 'Out of Bounds Rookie-to-Superstar Story Tracker, Team Contract & Scheduled NBA Games.',
  },
  {
    id: 'CREWS_AND_SWAGS',
    name: "Crews HQ & Swag's / Sneaker Store",
    shortName: "Crews & Swag's",
    district: 'Inner Ring',
    x: 365,
    y: 445,
    worldX: -11,
    worldZ: 11,
    accent: '#14b8a6',
    icon: '👟',
    summary: 'Manage your 50-Member Crew, Weekly Crew Goals & buy Headbands, Sleeves, Sneakers & Green VFX.',
  },
];

export interface StreetKingsBossDef {
  id: string;
  name: string;
  title: string;
  ovr: number;
  position: PlayerPosition;
  heightInches: number;
  specialty: string;
  vcBounty: number;
  badgeXpReward: number;
  jerseyNumber: number;
  accentColor: string;
  attributes: Partial<PlayerAttributes>;
}

export const STREET_KINGS_BOSSES: StreetKingsBossDef[] = [
  {
    id: 'boss_rim_reaper',
    name: 'Marcus "Rim Reaper" Cole',
    title: 'Coliseum Gatekeeper',
    ovr: 92,
    position: 'PF',
    heightInches: 82,
    specialty: 'Posterizer & Chase-Down Blocks',
    vcBounty: 1800,
    badgeXpReward: 500,
    jerseyNumber: 99,
    accentColor: '#ef4444',
    attributes: { drivingDunk: 98, vertical: 95, block: 96, interiorDef: 92, strength: 93 },
  },
  {
    id: 'boss_ankle_taker',
    name: 'Devon "Ankle Taker" Cruz',
    title: 'Crossover Specialist',
    ovr: 93,
    position: 'PG',
    heightInches: 74,
    specialty: 'Ankle Assassin & Stepback 3s',
    vcBounty: 2400,
    badgeXpReward: 700,
    jerseyNumber: 3,
    accentColor: '#06b6d4',
    attributes: { ballHandle: 98, speed: 96, acceleration: 96, threePt: 93, passAccuracy: 92 },
  },
  {
    id: 'boss_logo_sniper',
    name: 'Soren "Logo Sniper" Vance',
    title: 'Deep Range Marksman',
    ovr: 95,
    position: 'SG',
    heightInches: 78,
    specialty: 'Legend Limitless Range & Deadeye',
    vcBounty: 3200,
    badgeXpReward: 950,
    jerseyNumber: 30,
    accentColor: '#22c55e',
    attributes: { threePt: 99, midRange: 96, freeThrow: 97, ballHandle: 90, perimeterDef: 88 },
  },
  {
    id: 'boss_twin_towers',
    name: 'Titan "Twin Towers" Okafor',
    title: 'Paint Fortress',
    ovr: 96,
    position: 'C',
    heightInches: 87,
    specialty: 'Paint Patroller & Putback Slams',
    vcBounty: 4200,
    badgeXpReward: 1200,
    jerseyNumber: 34,
    accentColor: '#a855f7',
    attributes: { block: 99, interiorDef: 98, defReb: 98, offReb: 96, closeShot: 96, drivingDunk: 94 },
  },
  {
    id: 'boss_king_city',
    name: 'Aurelius "King of the City"',
    title: 'Undisputed Roman Coliseum Sovereign',
    ovr: 99,
    position: 'SF',
    heightInches: 81,
    specialty: 'All-Around 99 OVR Hybrid Phenom',
    vcBounty: 7500,
    badgeXpReward: 2000,
    jerseyNumber: 23,
    accentColor: '#f59e0b',
    attributes: {
      threePt: 96,
      midRange: 97,
      drivingDunk: 99,
      ballHandle: 95,
      speed: 95,
      perimeterDef: 96,
      interiorDef: 94,
      steal: 94,
      block: 93,
      defReb: 94,
    },
  },
];

export type SwagCategory =
  | 'HEADBAND'
  | 'SLEEVE'
  | 'COMPRESSION'
  | 'PARK_JERSEY'
  | 'GREEN_VFX'
  | 'SNEAKER';

export interface SwagStoreItem {
  id: string;
  name: string;
  category: SwagCategory;
  priceVc: number;
  swatch: string;
  description: string;
  vfxId?: GreenReleaseVfxId;
  sleeveMode?: ArmSleeveOption;
}

export const SWAG_STORE_CATALOG: SwagStoreItem[] = [
  { id: 'hb_gold', name: 'Championship Gold Headband', category: 'HEADBAND', priceVc: 600, swatch: '#f59e0b', description: '2K14 Finals edition terrycloth headband.' },
  { id: 'hb_crimson', name: 'Miami Crimson Headband', category: 'HEADBAND', priceVc: 500, swatch: '#e11d48', description: 'Classic Heat Dynasty headband.' },
  { id: 'hb_obsidian', name: '2K26 Obsidian Stealth Band', category: 'HEADBAND', priceVc: 750, swatch: '#1e293b', description: 'Matte black moisture-wicking band.' },
  { id: 'slv_left_cyan', name: 'ProPLAY Shooter Sleeve (Left)', category: 'SLEEVE', priceVc: 800, swatch: '#06b6d4', description: 'Compression shooting arm sleeve.', sleeveMode: 'LEFT' },
  { id: 'slv_both_gold', name: 'Dual Legend Sleeves', category: 'SLEEVE', priceVc: 1200, swatch: '#eab308', description: 'Full dual-arm championship sleeves.', sleeveMode: 'BOTH' },
  { id: 'comp_pro', name: 'Full-Leg Compression Tights', category: 'COMPRESSION', priceVc: 900, swatch: '#0f172a', description: 'Pro-grade dual leg compression.' },
  { id: 'jrs_skyline', name: 'Skyline Park Midnight Tank', category: 'PARK_JERSEY', priceVc: 1500, swatch: '#0ea5e9', description: 'Official 2K26 Skyline Park reversible tank.' },
  { id: 'jrs_rivet', name: 'Rivet City Steel Jersey', category: 'PARK_JERSEY', priceVc: 1500, swatch: '#dc2626', description: 'Throwback 2K16 Rivet City Roughriders tank.' },
  { id: 'jrs_sunset', name: 'Sunset Beach Coral Tank', category: 'PARK_JERSEY', priceVc: 1500, swatch: '#f97316', description: 'Throwback Sunset Beach Ballers tank.' },
  { id: 'jrs_oldtown', name: 'Old Town Flyers Retro Mesh', category: 'PARK_JERSEY', priceVc: 1500, swatch: '#8b5cf6', description: 'Classic Old Town arcade mesh jersey.' },
  { id: 'vfx_flame', name: 'Green Release VFX: Flame', category: 'GREEN_VFX', priceVc: 2000, swatch: '#f97316', description: 'Ignites a blazing flame burst on Perfect Release.', vfxId: 'FLAME' },
  { id: 'vfx_lightning', name: 'Green Release VFX: Lightning', category: 'GREEN_VFX', priceVc: 2200, swatch: '#38bdf8', description: 'Electric cyan bolt crackles around the net.', vfxId: 'LIGHTNING' },
  { id: 'vfx_2k14', name: 'Green Release VFX: 2K14 Classic Ring', category: 'GREEN_VFX', priceVc: 1800, swatch: '#22c55e', description: 'Authentic glowing emerald floor ring from 2K14.', vfxId: 'CLASSIC_2K14_RING' },
  { id: 'vfx_crown', name: 'Green Release VFX: Golden Crown', category: 'GREEN_VFX', priceVc: 3000, swatch: '#fbbf24', description: 'Royal crown splash reserved for City legends.', vfxId: 'GOLDEN_CROWN' },
  { id: 'snk_king14', name: 'King XI Crimson Golds', category: 'SNEAKER', priceVc: 1600, swatch: '#e11d48', description: '2014 championship signature high-tops.' },
  { id: 'snk_proplay26', name: 'ProPLAY Aero Carbon 26', category: 'SNEAKER', priceVc: 2400, swatch: '#06b6d4', description: 'Ultra-light responsive court runners.' },
  { id: 'snk_golden', name: 'City Legend 24K Lows', category: 'SNEAKER', priceVc: 3200, swatch: '#f59e0b', description: 'Metallic gold custom signature lows.' },
];

export interface CrewWeeklyGoal {
  id: string;
  title: string;
  progress: number;
  target: number;
  vcReward: number;
  repReward: number;
  claimed: boolean;
}

export interface CrewMemberEntry {
  id: string;
  gamertag: string;
  role: 'OWNER' | 'CAPTAIN' | 'VETERAN' | 'MEMBER';
  ovr: number;
  position: PlayerPosition;
  weeklyRep: number;
}

export interface CrewHqState {
  name: string;
  tag: string; // 4 chars
  emblemColor: string;
  secondaryColor: string;
  level: number; // 1..30
  repTotal: number;
  members: CrewMemberEntry[];
  weeklyGoals: CrewWeeklyGoal[];
  proAmRecord: { wins: number; losses: number; trophies: number };
}

export interface MyCourtCustomization {
  woodFloor: 'MAPLE_CLASSIC' | 'DARK_WALNUT' | 'SKYLINE_SLATE' | 'CRIMSON_PARQUET';
  wallTheme: 'PENTHOUSE_CITY' | 'HEAT_DYNASTY' | 'BLACKTOP_BRICK' | 'NEON_LOUNGE';
  rimSound: 'PURE_NYLON' | 'CHAIN_NET' | 'ARENA_CLANK';
}

export interface ProvingGroundsState {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Elite';
  rp: number;
  wins: number;
  losses: number;
}

// ----------------------------------------------------------------------------
// 3. LEBRON: PATH TO GREATNESS (2K14 SIGNATURE MODE)
// ----------------------------------------------------------------------------

export type PtgBranchId = 'HEAT_DYNASTY' | 'FANTASTIC_JOURNEY';

export interface PtgScenarioDef {
  id: string;
  branch: PtgBranchId;
  order: number;
  title: string;
  subtitle: string;
  awayTeamId: string;
  homeTeamId: string;
  userSide: 'HOME' | 'AWAY';
  venue: MatchVenueId;
  difficulty: MatchDifficulty;
  startQuarter: number;
  startClockSec: number;
  startHomeScore: number;
  startAwayScore: number;
  starPlayerName: string;
  targetStarPts: number;
  targetStarAst: number;
  objectiveSummary: string;
  vcReward: number;
  trophyName: string;
}

export const PTG_SCENARIOS: PtgScenarioDef[] = [
  // Branch 1: HEAT DYNASTY
  {
    id: 'ptg_hd_1',
    branch: 'HEAT_DYNASTY',
    order: 1,
    title: '1. The Three-Peat',
    subtitle: '2014 NBA Finals Rematch vs San Antonio Spurs',
    awayTeamId: '2k14_sas',
    homeTeamId: '2k14_mia',
    userSide: 'HOME',
    venue: 'ARENA_2K14',
    difficulty: 'All-Star',
    startQuarter: 4,
    startClockSec: 150,
    startHomeScore: 84,
    startAwayScore: 88,
    starPlayerName: 'LeBron James',
    targetStarPts: 10,
    targetStarAst: 2,
    objectiveSummary: '4th Qtr 2:30 left, down 4 — Score 10 pts with LeBron & win!',
    vcReward: 2500,
    trophyName: 'Three-Peat Finals MVP Trophy',
  },
  {
    id: 'ptg_hd_2',
    branch: 'HEAT_DYNASTY',
    order: 2,
    title: '2. Eastern Crown',
    subtitle: 'Game 7 Grudge Match vs Indiana Pacers \'14',
    awayTeamId: '2k14_ind',
    homeTeamId: '2k14_mia',
    userSide: 'HOME',
    venue: 'ARENA_2K14',
    difficulty: 'All-Star',
    startQuarter: 4,
    startClockSec: 180,
    startHomeScore: 76,
    startAwayScore: 81,
    starPlayerName: 'LeBron James',
    targetStarPts: 12,
    targetStarAst: 3,
    objectiveSummary: '4th Qtr 3:00 left, down 5 — Drop 12 pts + 3 ast with LeBron & win!',
    vcReward: 3200,
    trophyName: 'Eastern Conference Crown',
  },
  {
    id: 'ptg_hd_3',
    branch: 'HEAT_DYNASTY',
    order: 3,
    title: '3. The Ultimate 4-Peat',
    subtitle: 'Dynasty Finale vs Oklahoma City Thunder \'14',
    awayTeamId: '2k14_okc',
    homeTeamId: '2k14_mia',
    userSide: 'HOME',
    venue: 'ARENA_2K14',
    difficulty: 'Superstar',
    startQuarter: 4,
    startClockSec: 180,
    startHomeScore: 92,
    startAwayScore: 98,
    starPlayerName: 'LeBron James',
    targetStarPts: 14,
    targetStarAst: 3,
    objectiveSummary: '4th Qtr 3:00 left, down 6 — Erase the deficit, score 14 with LeBron & seal the 4-Peat!',
    vcReward: 4500,
    trophyName: 'Four-Peat Golden Larry O\'Brien',
  },
  // Branch 2: FANTASTIC JOURNEY
  {
    id: 'ptg_fj_1',
    branch: 'FANTASTIC_JOURNEY',
    order: 1,
    title: '1. Return to Cleveland',
    subtitle: 'Homecoming Showdown vs Chicago Bulls \'14',
    awayTeamId: '2k14_chi',
    homeTeamId: '2k14_cle',
    userSide: 'HOME',
    venue: 'ARENA_2K14',
    difficulty: 'All-Star',
    startQuarter: 4,
    startClockSec: 150,
    startHomeScore: 79,
    startAwayScore: 83,
    starPlayerName: 'LeBron James',
    targetStarPts: 10,
    targetStarAst: 2,
    objectiveSummary: '4th Qtr 2:30 left, down 4 — Ignite Cleveland with 10 pts & win!',
    vcReward: 2800,
    trophyName: 'The Land Homecoming Ring',
  },
  {
    id: 'ptg_fj_2',
    branch: 'FANTASTIC_JOURNEY',
    order: 2,
    title: '2. New York Bright Lights',
    subtitle: 'Borough Rivalry at MSG vs Brooklyn Nets \'14',
    awayTeamId: '2k14_bkn',
    homeTeamId: '2k14_nyk',
    userSide: 'HOME',
    venue: 'ARENA_2K14',
    difficulty: 'All-Star',
    startQuarter: 4,
    startClockSec: 165,
    startHomeScore: 88,
    startAwayScore: 93,
    starPlayerName: 'LeBron James',
    targetStarPts: 12,
    targetStarAst: 3,
    objectiveSummary: '4th Qtr 2:45 left, down 5 — Own the Garden with 12 pts & victory!',
    vcReward: 3500,
    trophyName: 'Mecca of Basketball Banner',
  },
  {
    id: 'ptg_fj_3',
    branch: 'FANTASTIC_JOURNEY',
    order: 3,
    title: '3. Clash of Eras',
    subtitle: 'Miami Heat \'14 vs Modern Thunder \'26',
    awayTeamId: '2k26_okc',
    homeTeamId: '2k14_mia',
    userSide: 'HOME',
    venue: 'ARENA_2K26',
    difficulty: 'Superstar',
    startQuarter: 4,
    startClockSec: 180,
    startHomeScore: 96,
    startAwayScore: 102,
    starPlayerName: 'LeBron James',
    targetStarPts: 15,
    targetStarAst: 3,
    objectiveSummary: '4th Qtr 3:00 left, down 6 — Defeat SGA\'s OKC \'26 with 15 pts from King James!',
    vcReward: 6000,
    trophyName: 'Timeless GOAT Cross-Era Chalice',
  },
];

export interface PtgScenarioProgress {
  completed: boolean;
  stars: number; // 0..3
  bestMargin: number;
  trophyUnlocked: boolean;
}

// ----------------------------------------------------------------------------
// 4. NBA 2K26 ENHANCED MYTEAM
// ----------------------------------------------------------------------------

export type MyTeamTierId =
  | 'EMERALD'
  | 'SAPPHIRE'
  | 'RUBY'
  | 'AMETHYST'
  | 'DIAMOND'
  | 'PINK_DIAMOND'
  | 'GALAXY_OPAL'
  | 'DARK_MATTER';

export interface MyTeamTierMeta {
  id: MyTeamTierId;
  label: string;
  targetOvr: number;
  color: string;
  glow: string;
  sellMtp: number;
}

export const MYTEAM_TIERS: Record<MyTeamTierId, MyTeamTierMeta> = {
  EMERALD: { id: 'EMERALD', label: 'Emerald', targetOvr: 82, color: '#10b981', glow: '#34d399', sellMtp: 450 },
  SAPPHIRE: { id: 'SAPPHIRE', label: 'Sapphire', targetOvr: 85, color: '#3b82f6', glow: '#60a5fa', sellMtp: 800 },
  RUBY: { id: 'RUBY', label: 'Ruby', targetOvr: 89, color: '#ef4444', glow: '#f87171', sellMtp: 1400 },
  AMETHYST: { id: 'AMETHYST', label: 'Amethyst', targetOvr: 91, color: '#a855f7', glow: '#c084fc', sellMtp: 2200 },
  DIAMOND: { id: 'DIAMOND', label: 'Diamond', targetOvr: 94, color: '#06b6d4', glow: '#22d3ee', sellMtp: 3600 },
  PINK_DIAMOND: { id: 'PINK_DIAMOND', label: 'Pink Diamond', targetOvr: 96, color: '#ec4899', glow: '#f472b6', sellMtp: 5500 },
  GALAXY_OPAL: { id: 'GALAXY_OPAL', label: 'Galaxy Opal', targetOvr: 98, color: '#f59e0b', glow: '#fde047', sellMtp: 9000 },
  DARK_MATTER: { id: 'DARK_MATTER', label: 'Dark Matter', targetOvr: 99, color: '#f43f5e', glow: '#fb7185', sellMtp: 15000 },
};

export interface MyTeamCard {
  id: string;
  playerId: string;
  name: string;
  teamAbbr: string;
  eraLabel: '2K14' | '2K26' | 'LEGEND' | 'WNBA';
  gender: 'NBA' | 'WNBA';
  position: PlayerPosition;
  tier: MyTeamTierId;
  ovr: number;
  threePt: number;
  drivingDunk: number;
  ballHandle: number;
  defense: number;
  jerseyNumber: number;
  accentColor: string;
  acquiredAtMs: number;
}

export type GameChangerCardId =
  | 'GC_2X_MTP_REP'
  | 'GC_DIFFICULTY_REDUCER'
  | 'GC_HOT_START_TAKEOVER'
  | 'GC_WIN_STREAK_SHIELD'
  | 'GC_BADGE_XP_SURGE';

export interface GameChangerDef {
  id: GameChangerCardId;
  name: string;
  description: string;
  accent: string;
  costMtp: number;
}

export const GAME_CHANGER_CATALOG: GameChangerDef[] = [
  {
    id: 'GC_2X_MTP_REP',
    name: '2x MTP & Rep Boost',
    description: 'Doubles MTP and Season Rep earned from your next MyTEAM match.',
    accent: '#f59e0b',
    costMtp: 1200,
  },
  {
    id: 'GC_DIFFICULTY_REDUCER',
    name: 'Difficulty Reducer',
    description: 'Drops CPU AI difficulty by 1 full tier while preserving full reward payouts.',
    accent: '#22c55e',
    costMtp: 1000,
  },
  {
    id: 'GC_HOT_START_TAKEOVER',
    name: 'Instant Hot Start Takeover',
    description: 'Tip off with your Primary Takeover meter 100% ignited immediately.',
    accent: '#ef4444',
    costMtp: 1500,
  },
  {
    id: 'GC_WIN_STREAK_SHIELD',
    name: 'Free Win Streak Recovery',
    description: 'Protects your active win streak if you drop a tight matchup.',
    accent: '#06b6d4',
    costMtp: 1100,
  },
  {
    id: 'GC_BADGE_XP_SURGE',
    name: 'Badge XP Surge',
    description: 'Grants +150% Badge progression and +500 bonus VC after the buzzer.',
    accent: '#a855f7',
    costMtp: 1400,
  },
];

export type MyTeamPackId = 'PACK_2K14_THROWBACK' | 'PACK_2K26_PROPLAY' | 'PACK_LEGENDS_WNBA';

export interface MyTeamPackDef {
  id: MyTeamPackId;
  name: string;
  subtitle: string;
  priceVc: number;
  priceMtp: number;
  accent: string;
  eraFocus: '2K14' | '2K26' | 'MIXED';
  guaranteedMinTier: MyTeamTierId;
}

export const MYTEAM_PACKS: MyTeamPackDef[] = [
  {
    id: 'PACK_2K14_THROWBACK',
    name: '2K14 Throwback Pack',
    subtitle: '3 Cards · Guaranteed Ruby+ 2013-14 Star',
    priceVc: 2200,
    priceMtp: 2800,
    accent: '#e11d48',
    eraFocus: '2K14',
    guaranteedMinTier: 'RUBY',
  },
  {
    id: 'PACK_2K26_PROPLAY',
    name: '2K26 ProPLAY Series Pack',
    subtitle: '3 Cards · Guaranteed Amethyst+ 2025-26 Phenom',
    priceVc: 2800,
    priceMtp: 3600,
    accent: '#06b6d4',
    eraFocus: '2K26',
    guaranteedMinTier: 'AMETHYST',
  },
  {
    id: 'PACK_LEGENDS_WNBA',
    name: 'Legends & WNBA Super Pack',
    subtitle: '3 Cards · Guaranteed Diamond+ Icon or WNBA Superstar',
    priceVc: 3800,
    priceMtp: 5000,
    accent: '#f59e0b',
    eraFocus: 'MIXED',
    guaranteedMinTier: 'DIAMOND',
  },
];

export interface MyTeamState {
  ownedCards: MyTeamCard[];
  startingFiveIds: string[]; // 5 card IDs
  benchIds: string[]; // 3 card IDs
  gameChangerCounts: Record<GameChangerCardId, number>;
  equippedGameChangerId: GameChangerCardId | null;
  dominationStars: Record<string, number>; // teamId -> 0..3
  tripleThreatWins: number;
  packsOpened: number;
}

// ----------------------------------------------------------------------------
// 5. MYNBA ERAS / THE ASSOCIATION
// ----------------------------------------------------------------------------

export type MyNbaEraId = 'ERA_2014' | 'ERA_2026';

export interface MyNbaStandingRow {
  teamId: string;
  abbr: string;
  name: string;
  conference: 'EAST' | 'WEST';
  wins: number;
  losses: number;
  ovr: number;
  ppg: number;
}

export interface PlayoffSeries {
  id: string;
  round: 1 | 2 | 3 | 4; // 1=R1(8), 2=ConfSemi(4), 3=ConfFinals(2), 4=NBAFinals(1)
  conference: 'EAST' | 'WEST' | 'FINALS';
  highSeedTeamId: string;
  lowSeedTeamId: string;
  highWins: number;
  lowWins: number;
  winnerTeamId: string | null;
}

export interface MyNbaTradeRecord {
  id: string;
  summary: string;
  approvalScore: number;
  timestampMs: number;
}

export interface MyNbaState {
  era: MyNbaEraId;
  userTeamId: string;
  seasonYearLabel: string;
  standings: MyNbaStandingRow[];
  playoffBracket: PlayoffSeries[];
  championTeamId: string | null;
  tradeHistory: MyNbaTradeRecord[];
}

// ----------------------------------------------------------------------------
// 6. TRAINING CAMP & 6 GUIDED SKILL DRILLS
// ----------------------------------------------------------------------------

export type DrillMedal = 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD';

export type SkillDrillId =
  | 'DRILL_RHYTHM_SHOOTING'
  | 'DRILL_EURO_FINISHING'
  | 'DRILL_QUICK_PROTECT'
  | 'DRILL_PNR_PLAYVISION'
  | 'DRILL_ALLEY_OOP'
  | 'DRILL_LOCKDOWN_REBOUND';

export interface SkillDrillDef {
  id: SkillDrillId;
  order: number;
  title: string;
  category: 'SHOOTING' | 'FINISHING' | 'PLAYMAKING' | 'DEFENSE';
  description: string;
  controlHint: string;
  metricLabel: string;
  bronzeTarget: number;
  silverTarget: number;
  goldTarget: number;
  vcGoldReward: number;
  durationSec: number;
}

export const TRAINING_DRILLS: SkillDrillDef[] = [
  {
    id: 'DRILL_RHYTHM_SHOOTING',
    order: 1,
    title: '1. Rhythm Shooting Mastery',
    category: 'SHOOTING',
    description: 'Drain Green-Release or made jumpers using the 2K26 Rhythm Shot meter.',
    controlHint: 'Hold [SPACE] or Down→Up Arrow / Right Stick to time your Set Point.',
    metricLabel: 'Made Jumpers / Greens',
    bronzeTarget: 2,
    silverTarget: 4,
    goldTarget: 6,
    vcGoldReward: 1200,
    durationSec: 120,
  },
  {
    id: 'DRILL_EURO_FINISHING',
    order: 2,
    title: '2. Slow-Mo Euro-Step & Finishing',
    category: 'FINISHING',
    description: 'Attack the lane and finish at the rim with layups, floaters, or Skill Dunks.',
    controlHint: 'Drive into the paint with [WASD + Sprint] and press [SPACE] or [F].',
    metricLabel: 'Paint Finishes',
    bronzeTarget: 2,
    silverTarget: 4,
    goldTarget: 6,
    vcGoldReward: 1200,
    durationSec: 120,
  },
  {
    id: 'DRILL_QUICK_PROTECT',
    order: 3,
    title: '3. Quick Protect & Ankle Breakers',
    category: 'PLAYMAKING',
    description: 'Chain dribble crossovers, stepbacks, and Quick Protect moves to create separation and score.',
    controlHint: 'Tap [Q] Crossover / [C] Stepback / [Shift] Quick Protect, then score or dish.',
    metricLabel: 'Iso Moves & Buckets',
    bronzeTarget: 3,
    silverTarget: 6,
    goldTarget: 9,
    vcGoldReward: 1300,
    durationSec: 120,
  },
  {
    id: 'DRILL_PNR_PLAYVISION',
    order: 4,
    title: '4. Pick & Roll PlayVision',
    category: 'PLAYMAKING',
    description: 'Call a screen, read the roller or popper along the PlayVision arc, and tally assists or buckets.',
    controlHint: 'Hold [Tab] / [L1] for Pick & Roll, then [E] Pass to the roller.',
    metricLabel: 'PnR Assists / Scores',
    bronzeTarget: 2,
    silverTarget: 4,
    goldTarget: 6,
    vcGoldReward: 1400,
    durationSec: 120,
  },
  {
    id: 'DRILL_ALLEY_OOP',
    order: 5,
    title: '5. Alley-Oop Finish Timing',
    category: 'FINISHING',
    description: 'Toss lob passes to cutting teammates and nail the mid-air finish prompt.',
    controlHint: 'Double-tap [Z] or press [Oop] when a teammate cuts, then hit the button prompt.',
    metricLabel: 'Completed Lobs / Paint Scores',
    bronzeTarget: 1,
    silverTarget: 3,
    goldTarget: 5,
    vcGoldReward: 1500,
    durationSec: 120,
  },
  {
    id: 'DRILL_LOCKDOWN_REBOUND',
    order: 6,
    title: '6. Perimeter Lockdown & Rebound Timing',
    category: 'DEFENSE',
    description: 'Force defensive stops, steals, blocks, and clean defensive rebounds.',
    controlHint: 'Hold [Shift] Intense D, [U] Hands Up, [X] Steal, and [SPACE] Block / Board.',
    metricLabel: 'Stops / Boards / Steals / Blocks',
    bronzeTarget: 2,
    silverTarget: 4,
    goldTarget: 7,
    vcGoldReward: 1500,
    durationSec: 120,
  },
];

// ----------------------------------------------------------------------------
// 7. UNIFIED MODE LAUNCH PAYLOAD (PASSED TO 3D COURT + OBJECTIVE HUD)
// ----------------------------------------------------------------------------

export type ModeLaunchKind =
  | 'STANDARD'
  | 'CITY_PARK'
  | 'CITY_REC'
  | 'CITY_THEATER'
  | 'CITY_PROVING_GROUNDS'
  | 'CITY_PRO_AM'
  | 'CITY_STREET_KINGS'
  | 'CITY_MYCOURT'
  | 'CITY_MYCAREER_NBA'
  | 'PATH_TO_GREATNESS'
  | 'MYTEAM_DOMINATION'
  | 'MYTEAM_TRIPLE_THREAT'
  | 'MYNBA_GAME'
  | 'BLACKTOP_CUSTOM'
  | 'TRAINING_FREESTYLE'
  | 'TRAINING_DRILL';

export interface ModeLaunchPayload {
  kind: ModeLaunchKind;
  title: string;
  subtitle: string;
  returnScreen:
    | 'MAIN_MENU'
    | 'CITY_EXPLORE'
    | 'MYCAREER_HUB'
    | 'PATH_TO_GREATNESS'
    | 'MYTEAM_HUB'
    | 'MYNBA_HUB'
    | 'BLACKTOP_SETUP'
    | 'LEARN_2K';
  matchPatch: Partial<ActiveMatchConfig>;
  // Mid-game & rule overrides consumed by BasketballSimulation
  startQuarter?: number;
  startClockSec?: number;
  startHomeScore?: number;
  startAwayScore?: number;
  threePointValue?: number; // e.g., 4 for Theater 3PT=4pt
  twoPointValue?: number;
  speedMultiplier?: number; // e.g., 1.45 for Theater 2x Speed Arcade
  forceGreenOrMiss?: boolean; // Proving Grounds ranked enforcement
  staminaBonus?: number; // Gatorade +4 Stamina & Turbo boost
  instantTakeover?: boolean; // MyTEAM Instant Hot Start Game Changer
  makeItTakeIt?: boolean;
  customHomeRoster?: PlayerProfile[];
  customAwayRoster?: PlayerProfile[];
  // Objective & Reward metadata
  objectiveBanner?: string;
  starPlayerTargetName?: string;
  targetStarPts?: number;
  targetStarAst?: number;
  ptgScenarioId?: string;
  streetKingsBossId?: string;
  myTeamDominationTeamId?: string;
  myTeamGameChangerId?: GameChangerCardId | null;
  myNbaSeriesId?: string;
  trainingDrillId?: SkillDrillId;
  parkStreakBonusVc?: number;
  baseVcReward?: number;
  baseMtpReward?: number;
  baseRepReward?: number;
}

// ----------------------------------------------------------------------------
// 8. FULL PART 6 PERSISTENT STATE ROOT
// ----------------------------------------------------------------------------

export interface Part6ModesSave {
  version: 1;
  activeBuildSlotIndex: number; // 0..4
  buildSlots: MyPlayerBuildSlot[];
  activePark: CityParkId;
  cityPins: CityMapPin[];
  avatarMapPos: { x: number; y: number };
  provingGrounds: ProvingGroundsState;
  streetKingsDefeatedIds: string[];
  gatoradeBoostGamesLeft: number; // 0..5
  gatoradeBestScores: {
    treadmill: number;
    vertical: number;
    reaction: number;
  };
  myCourt: MyCourtCustomization;
  crew: CrewHqState;
  ownedSwagIds: string[];
  ptgProgress: Record<string, PtgScenarioProgress>;
  myTeam: MyTeamState;
  myNba: MyNbaState;
  drillMedals: Record<SkillDrillId, DrillMedal>;
  drillBestScores: Record<SkillDrillId, number>;
  lastUpdatedMs: number;
}
