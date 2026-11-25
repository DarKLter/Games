import { MlbbMapThemeId, MlbbMapVariantId } from '../types';

export const WORLD_SIZE = 4000;
export const BLUE_FOUNTAIN = { x: 260, y: 3740, radius: 220 };
export const BLUE_CRYSTAL = { x: 520, y: 3480, radius: 95 };
export const RED_FOUNTAIN = { x: 3740, y: 260, radius: 220 };
export const RED_CRYSTAL = { x: 3480, y: 520, radius: 95 };

export const MLBB_TIMERS = {
  MINION_FIRST_SPAWN: 10,
  MINION_INTERVAL: 30,
  ORANGE_FIRST_SPAWN: 20,
  PURPLE_FIRST_SPAWN: 20,
  BUFF_RESPAWN: 75,
  BUFF_DURATION: 75,
  SMALL_CAMP_FIRST_SPAWN: 25,
  SMALL_CAMP_RESPAWN: 60,
  LITHO_FIRST_SPAWN: 43,
  LITHO_RESPAWN: 120,
  WALKIE_GRASS_DURATION: 45,
  CRAB_FIRST_SPAWN: 45,
  CRAB_SMALL_RESPAWN: 90,
  CRAB_UPGRADE_TIME: 120,
  CRAB_LARGE_RESPAWN: 90,
  CRAB_GOLD_BUFF_DURATION: 18,
  TURTLE_FIRST_SPAWN: 120,
  TURTLE_RESPAWN: 120,
  TURTLE_STOP_SPAWN: 480,
  TURTLE_DESPAWN: 480,
  OUTER_SHIELD_EXPIRE: 300,
  OUTER_PLATE_GOLD: 40,
  OUTER_PLATE_CHUNK: 300,
  LORD_STAGE1_SPAWN: 480,
  LORD_STAGE2_TIME: 720,
  LORD_STAGE3_TIME: 1080,
  LORD_RESPAWN_EARLY: 180,
  LORD_RESPAWN_LATE: 180,
  CYCLONE_EYE_CD: 45,
  BRAWL_SHRINE_FIRST_SPAWN: 15,
  BRAWL_SHRINE_RESPAWN: 45,
  SURRENDER_UNLOCK: 360
} as const;

export const BRAWL_BRIDGE_HALF_WIDTH = 290;

export const BRAWL_HEALING_SHRINES: { id: string; side: 'blue' | 'red'; x: number; y: number }[] = [
  { id: 'brawl_shrine_blue', side: 'blue', x: 1595, y: 2145 },
  { id: 'brawl_shrine_red', side: 'red', x: 2405, y: 1855 }
];

export const BRAWL_TURRETS: MapTurretSpec[] = [
  { id: 'brawl_b1', team: 'blue', lane: 'mid', tier: 1, x: 1520, y: 2480 },
  { id: 'brawl_b2', team: 'blue', lane: 'mid', tier: 2, x: 1040, y: 2960 },
  { id: 'brawl_r1', team: 'red', lane: 'mid', tier: 1, x: 2480, y: 1520 },
  { id: 'brawl_r2', team: 'red', lane: 'mid', tier: 2, x: 2960, y: 1040 }
];

/** Clamps a hero smoothly inside the elevated diagonal Brawl Bridge + Base plazas. */
export function clampToBrawlBridge(x: number, y: number, radius: number): { x: number; y: number } {
  const cx = Math.max(radius + 40, Math.min(WORLD_SIZE - radius - 40, x));
  const cy = Math.max(radius + 40, Math.min(WORLD_SIZE - radius - 40, y));
  // Allow full freedom inside Blue or Red base plaza circles
  if (Math.hypot(cx - BLUE_FOUNTAIN.x, cy - BLUE_FOUNTAIN.y) <= 440 - radius) return { x: cx, y: cy };
  if (Math.hypot(cx - RED_FOUNTAIN.x, cy - RED_FOUNTAIN.y) <= 440 - radius) return { x: cx, y: cy };

  // Project onto the Blue->Red diagonal centerline (x + y = WORLD_SIZE)
  const signedOffset = (cx + cy - WORLD_SIZE) / Math.SQRT2;
  const maxHalf = BRAWL_BRIDGE_HALF_WIDTH - radius;
  if (Math.abs(signedOffset) <= maxHalf) return { x: cx, y: cy };
  const clamped = Math.sign(signedOffset) * maxHalf;
  const delta = clamped - signedOffset;
  return {
    x: cx + delta / Math.SQRT2,
    y: cy + delta / Math.SQRT2
  };
}

export function getLaneDecalPosition(lane: 'top' | 'bot'): { x: number; y: number } {
  return lane === 'top' ? { x: 470, y: 470 } : { x: 3530, y: 3530 };
}

export interface MapWallRect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  shortcutCampId?: string; // Purple buff shortcut wall opens temporarily when camp is slain
}

export interface MapBushPoly {
  id: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  angle: number;
}

export interface MapTurretSpec {
  id: string;
  team: 'blue' | 'red';
  lane: 'top' | 'mid' | 'bot';
  tier: 1 | 2 | 3;
  x: number;
  y: number;
}

export type JungleCampKind =
  | 'orange_buff'
  | 'purple_buff'
  | 'horned_lizard'
  | 'lava_golem'
  | 'fire_beetle'
  | 'crammer'
  | 'litho'
  | 'crab'
  | 'turtle'
  | 'lord';

export interface JungleCampSpec {
  id: string;
  kind: JungleCampKind;
  teamSide: 'blue' | 'red' | 'river';
  name: string;
  icon: string;
  x: number;
  y: number;
  firstSpawnSec: number;
  respawnSec: number;
  baseHp: number;
  baseAtk: number;
  gold: number;
  exp: number;
  leashRadius: number;
  color: string;
}

export const MAP_THEMES: Record<
  MlbbMapThemeId,
  { name: string; grassA: string; grassB: string; laneStone: string; laneBorder: string; riverA: string; riverB: string; wall: string; bush: string }
> = {
  imperial_sanctuary: {
    name: 'Imperial Sanctuary',
    grassA: '#2D5A36',
    grassB: '#386B40',
    laneStone: '#B7A484',
    laneBorder: '#D4B97B',
    riverA: '#1E758F',
    riverB: '#34A4BD',
    wall: '#39404A',
    bush: '#1B4227'
  },
  western_expanse: {
    name: 'Western Expanse',
    grassA: '#6E5A38',
    grassB: '#7F6943',
    laneStone: '#CBB48C',
    laneBorder: '#E2C382',
    riverA: '#287D8C',
    riverB: '#3EA3B2',
    wall: '#574636',
    bush: '#3B4D29'
  },
  celestial_palace: {
    name: 'Celestial Palace',
    grassA: '#29485C',
    grassB: '#34586E',
    laneStone: '#C9D0DE',
    laneBorder: '#F2C96B',
    riverA: '#27679C',
    riverB: '#4498D9',
    wall: '#3D4861',
    bush: '#1F3B4D'
  },
  sanctum_island: {
    name: 'Sanctum Island',
    grassA: '#245848',
    grassB: '#2E6B58',
    laneStone: '#B8AD92',
    laneBorder: '#D9B96E',
    riverA: '#196C8A',
    riverB: '#2CB3C9',
    wall: '#35434A',
    bush: '#163D34'
  },
  harmonic_sanctuary: {
    name: 'Harmonic Sanctuary',
    grassA: '#305442',
    grassB: '#3B664F',
    laneStone: '#C7B8A5',
    laneBorder: '#E8C57B',
    riverA: '#236C96',
    riverB: '#42A5D6',
    wall: '#433F52',
    bush: '#1E4032'
  }
};

export const PRIMARY_2026_VARIANTS: MlbbMapVariantId[] = [
  'dangerous_grass',
  'broken_walls',
  'flying_cloud',
  'expanding_rivers'
];

export const MAP_VARIANTS_2026: Record<
  MlbbMapVariantId,
  { id: MlbbMapVariantId; name: string; icon: string; desc: string; color: string }
> = {
  dangerous_grass: {
    id: 'dangerous_grass',
    name: 'Dangerous Grass',
    icon: '🌿',
    desc: 'Extra dense ambush bushes grow near Outer Turrets, Mid Lane, and Lord/Turtle pits for deadly ganks.',
    color: '#22C55E'
  },
  broken_walls: {
    id: 'broken_walls',
    name: 'Broken Walls',
    icon: '🧱',
    desc: 'Shattered jungle walls open new high-speed flanking shortcuts near Blue/Red Buffs and Mid Lane.',
    color: '#F59E0B'
  },
  flying_cloud: {
    id: 'flying_cloud',
    name: 'Flying Cloud',
    icon: '☁️',
    desc: 'Base Fountain wind platform rockets respawned heroes high over base walls straight into outer lanes.',
    color: '#C084FC'
  },
  expanding_rivers: {
    id: 'expanding_rivers',
    name: 'Expanding Rivers',
    icon: '🌊',
    desc: 'Flooding river currents extend into jungle entrances, granting +28% surging rotation speed.',
    color: '#38BDF8'
  },
  revealing_wisps: {
    id: 'revealing_wisps',
    name: 'Revealing Wisps',
    icon: '👻',
    desc: 'Spirit orbs drift through jungle corridors periodically revealing enemies hidden in bushes.',
    color: '#38BDF8'
  },
  healing_turtle: {
    id: 'healing_turtle',
    name: 'Healing Turtle',
    icon: '🐢',
    desc: 'Slaying the Turtle grants rapid team regeneration and summons mini-turtles to pressure turrets.',
    color: '#2CE58B'
  },
  golden_turret: {
    id: 'golden_turret',
    name: 'Golden Turret',
    icon: '🏰',
    desc: 'Inner & Base turrets gain extra armor and shower the team with +65% bonus Gold when destroyed.',
    color: '#FACC15'
  }
};

export const MAP_TURRETS: MapTurretSpec[] = [
  // Blue Top
  { id: 'bt1', team: 'blue', lane: 'top', tier: 1, x: 420, y: 1580 },
  { id: 'bt2', team: 'blue', lane: 'top', tier: 2, x: 420, y: 2350 },
  { id: 'bt3', team: 'blue', lane: 'top', tier: 3, x: 450, y: 3000 },
  // Blue Mid
  { id: 'bm1', team: 'blue', lane: 'mid', tier: 1, x: 1460, y: 2540 },
  { id: 'bm2', team: 'blue', lane: 'mid', tier: 2, x: 1080, y: 2920 },
  { id: 'bm3', team: 'blue', lane: 'mid', tier: 3, x: 780, y: 3220 },
  // Blue Bot
  { id: 'bb1', team: 'blue', lane: 'bot', tier: 1, x: 2420, y: 3580 },
  { id: 'bb2', team: 'blue', lane: 'bot', tier: 2, x: 1650, y: 3580 },
  { id: 'bb3', team: 'blue', lane: 'bot', tier: 3, x: 1000, y: 3550 },

  // Red Top
  { id: 'rt1', team: 'red', lane: 'top', tier: 1, x: 1580, y: 420 },
  { id: 'rt2', team: 'red', lane: 'top', tier: 2, x: 2350, y: 420 },
  { id: 'rt3', team: 'red', lane: 'top', tier: 3, x: 3000, y: 450 },
  // Red Mid
  { id: 'rm1', team: 'red', lane: 'mid', tier: 1, x: 2540, y: 1460 },
  { id: 'rm2', team: 'red', lane: 'mid', tier: 2, x: 2920, y: 1080 },
  { id: 'rm3', team: 'red', lane: 'mid', tier: 3, x: 3220, y: 780 },
  // Red Bot
  { id: 'rb1', team: 'red', lane: 'bot', tier: 1, x: 3580, y: 2420 },
  { id: 'rb2', team: 'red', lane: 'bot', tier: 2, x: 3580, y: 1650 },
  { id: 'rb3', team: 'red', lane: 'bot', tier: 3, x: 3550, y: 1000 }
];

export const MAP_WALLS: MapWallRect[] = [
  // Blue Jungle Walls
  { id: 'w_bp_short', x: 1270, y: 2040, w: 70, h: 210, shortcutCampId: 'blue_purple' },
  { id: 'w_bj1', x: 760, y: 1850, w: 180, h: 75 },
  { id: 'w_bj2', x: 1560, y: 2950, w: 240, h: 80 },
  { id: 'w_bj3', x: 2180, y: 2800, w: 190, h: 75 },
  { id: 'w_bj4', x: 1980, y: 3180, w: 190, h: 70 },
  // Red Jungle Mirror Walls
  { id: 'w_rp_short', x: 2660, y: 1750, w: 70, h: 210, shortcutCampId: 'red_purple' },
  { id: 'w_rj1', x: 3060, y: 2075, w: 180, h: 75 },
  { id: 'w_rj2', x: 2200, y: 970, w: 240, h: 80 },
  { id: 'w_rj3', x: 1630, y: 1125, w: 190, h: 75 },
  { id: 'w_rj4', x: 1830, y: 750, w: 190, h: 70 },
  // Pit Back Walls
  { id: 'w_pit_u', x: 1060, y: 1120, w: 180, h: 65 },
  { id: 'w_pit_l', x: 2760, y: 2815, w: 180, h: 65 }
];

export const MAP_BUSHES: MapBushPoly[] = [
  // Side Lane Edge Bushes
  { id: 'b_top1', cx: 340, cy: 1040, rx: 110, ry: 48, angle: Math.PI / 2 },
  { id: 'b_top2', cx: 980, cy: 340, rx: 110, ry: 48, angle: 0 },
  { id: 'b_bot1', cx: 3020, cy: 3660, rx: 110, ry: 48, angle: 0 },
  { id: 'b_bot2', cx: 3660, cy: 2960, rx: 110, ry: 48, angle: Math.PI / 2 },
  // Mid River Entrance Bushes
  { id: 'b_mid_l', cx: 1720, cy: 1980, rx: 95, ry: 44, angle: -Math.PI / 4 },
  { id: 'b_mid_r', cx: 2280, cy: 2020, rx: 95, ry: 44, angle: -Math.PI / 4 },
  // Buff Guard Bushes
  { id: 'b_bp', cx: 1360, cy: 2300, rx: 85, ry: 42, angle: 0.3 },
  { id: 'b_bo', cx: 2050, cy: 2960, rx: 85, ry: 42, angle: -0.3 },
  { id: 'b_rp', cx: 2640, cy: 1700, rx: 85, ry: 42, angle: 0.3 },
  { id: 'b_ro', cx: 1950, cy: 1040, rx: 85, ry: 42, angle: -0.3 },
  // River Pit Bushes
  { id: 'b_pitu', cx: 1480, cy: 1450, rx: 90, ry: 42, angle: Math.PI / 4 },
  { id: 'b_pitl', cx: 2520, cy: 2550, rx: 90, ry: 42, angle: Math.PI / 4 }
];

/** Extra dense ambush bushes spawned when 2026 Map Variant = 'dangerous_grass'. */
export const DANGEROUS_GRASS_EXTRA_BUSHES: MapBushPoly[] = [
  { id: 'dg_mid_b', cx: 1580, cy: 2380, rx: 95, ry: 46, angle: -Math.PI / 4 },
  { id: 'dg_mid_r', cx: 2420, cy: 1620, rx: 95, ry: 46, angle: -Math.PI / 4 },
  { id: 'dg_top_t1', cx: 610, cy: 1420, rx: 90, ry: 42, angle: Math.PI / 2 },
  { id: 'dg_bot_t1', cx: 2580, cy: 3390, rx: 90, ry: 42, angle: 0 },
  { id: 'dg_pit_u2', cx: 1180, cy: 1540, rx: 88, ry: 42, angle: Math.PI / 4 },
  { id: 'dg_pit_l2', cx: 2820, cy: 2460, rx: 88, ry: 42, angle: Math.PI / 4 }
];

/** Jungle walls broken open as flanking shortcuts when 2026 Map Variant = 'broken_walls'. */
export const BROKEN_WALL_IDS = new Set<string>(['w_bp_short', 'w_rp_short', 'w_bj2', 'w_rj2', 'w_bj3', 'w_rj3']);

export function getActiveMapBushes(variant?: MlbbMapVariantId): MapBushPoly[] {
  return variant === 'dangerous_grass' ? [...MAP_BUSHES, ...DANGEROUS_GRASS_EXTRA_BUSHES] : MAP_BUSHES;
}

export function getActiveMapWalls(variant?: MlbbMapVariantId): MapWallRect[] {
  return variant === 'broken_walls' ? MAP_WALLS.filter((w) => !BROKEN_WALL_IDS.has(w.id)) : MAP_WALLS;
}

export function isPointInExpandedRiver(x: number, y: number, variant?: MlbbMapVariantId): boolean {
  const riverDist = Math.abs(x - y) / Math.SQRT2;
  const maxWidth = variant === 'expanding_rivers' ? 275 : 135;
  if (riverDist <= maxWidth && x > 300 && x < WORLD_SIZE - 300 && y > 300 && y < WORLD_SIZE - 300) {
    return true;
  }
  if (variant === 'expanding_rivers') {
    // Flooded jungle entrance eddies near Turtle & Lord pits
    if (Math.hypot(x - 1420, y - 1650) < 225 || Math.hypot(x - 2580, y - 2350) < 225) return true;
  }
  return false;
}

/** Returns river current boost fraction: +15% on standard river, +28% with Expanding Rivers variant. */
export function getRiverCurrentSpeedBonus(x: number, y: number, variant?: MlbbMapVariantId): number {
  if (!isPointInExpandedRiver(x, y, variant)) return 0;
  return variant === 'expanding_rivers' ? 0.28 : 0.15;
}

/** Authentic 4-Skill MLBB Champions that unlock the Skill 4 (R) active button. */
export const FOUR_SKILL_HERO_META: Record<
  string,
  { name: string; icon: string; cd: number; mana: number; color: string; desc: string }
> = {
  zhuxin: { name: 'Lantern Blink', icon: '🏮', cd: 9, mana: 45, color: '#C084FC', desc: 'Shift lantern spirit forward and pulse soul damage.' },
  julian: { name: 'Enhanced Smith', icon: '⛓️', cd: 7, mana: 0, color: '#EF4444', desc: 'Empowers next skill cast with magic lifesteal & knock-up.' },
  valentina: { name: 'Shadow Morph', icon: '🪞', cd: 16, mana: 70, color: '#A855F7', desc: 'Manifest shadow double dealing magic burst in cone.' },
  kagura: { name: 'Yin Yang Shift', icon: '☂️', cd: 8, mana: 50, color: '#38BDF8', desc: 'Teleport to Seimei Umbrella and cleanse slows.' },
  selena: { name: 'Abyssal Form', icon: '🦇', cd: 6, mana: 35, color: '#9333EA', desc: 'Switch between Elven & Abyssal forms with speed surge.' },
  roger: { name: 'Wolf Transformation', icon: '🐺', cd: 6, mana: 30, color: '#F97316', desc: 'Leap forward transforming between Hunter and Lycan.' },
  pharsa: { name: 'Wings by Wings', icon: '🕊️', cd: 18, mana: 50, color: '#818CF8', desc: 'Transform into mist bird and fly rapidly over terrain.' },
  luo_yi: { name: 'Yin-Yang Reaction', icon: '☯️', cd: 12, mana: 55, color: '#6366F1', desc: 'Trigger polarity pull between marked enemies.' },
  yve: { name: 'Starfield Pulse', icon: '🌌', cd: 10, mana: 50, color: '#A855F7', desc: 'Project astral nova slowing enemies in area.' },
  beatrix: { name: 'Need Backup (Swap)', icon: '🔫', cd: 4, mana: 0, color: '#F59E0B', desc: 'Swap active firearm loadout for rapid burst boost.' },
  popol_and_kupa: { name: 'Kupa Help!', icon: '🐕', cd: 12, mana: 50, color: '#22D3EE', desc: 'Command Kupa to lunge and shield Popol.' },
  fredrinn: { name: 'Appraiser Wrath', icon: '🗡️', cd: 11, mana: 0, color: '#FACC15', desc: 'Consume Crystal Energy for massive cleave slam.' },
  sun: { name: 'Instantaneous Move', icon: '🐒', cd: 9, mana: 40, color: '#F59E0B', desc: 'Dash with Doppelganger strike.' },
  yu_zhong: { name: 'Black Dragon Dive', icon: '🐉', cd: 14, mana: 0, color: '#7C3AED', desc: 'Soar and slam down with Sha Residue burst.' },
  zhask: { name: 'Mind Eater Burst', icon: '👾', cd: 10, mana: 60, color: '#A855F7', desc: 'Fire synchronized Nightmaric Spawn laser.' },
  chip: { name: 'Why Walk? Portal', icon: '🌀', cd: 18, mana: 60, color: '#38BDF8', desc: 'Open Beacon shortcut and gain shield.' },
  lunox: { name: 'Power of Chaos', icon: '🌗', cd: 8, mana: 50, color: '#F472B6', desc: 'Channel Order/Chaos brilliance burst.' }
};

export function isFourSkillHero(heroId: string): boolean {
  return Boolean(FOUR_SKILL_HERO_META[heroId]);
}

export const CYCLONE_EYES = [
  { id: 'ce_blue_top', x: 740, y: 2420 },
  { id: 'ce_blue_bot', x: 1580, y: 3260 },
  { id: 'ce_red_top', x: 2420, y: 740 },
  { id: 'ce_red_bot', x: 3260, y: 1580 }
];

export const FLYING_CLOUD_BLUE = { x: 460, y: 3640, radius: 75 };

export function createJungleCampSpecs(expLane: 'top' | 'bot'): JungleCampSpec[] {
  const turtlePit = expLane === 'top' ? { x: 1280, y: 1280 } : { x: 2720, y: 2720 };
  const lordPit = expLane === 'top' ? { x: 2720, y: 2720 } : { x: 1280, y: 1280 };
  return [
    // Blue Jungle
    {
      id: 'blue_orange',
      kind: 'orange_buff',
      teamSide: 'blue',
      name: 'Molten Fiend',
      icon: '🟠',
      x: 2280,
      y: 3050,
      firstSpawnSec: MLBB_TIMERS.ORANGE_FIRST_SPAWN,
      respawnSec: MLBB_TIMERS.BUFF_RESPAWN,
      baseHp: 2150,
      baseAtk: 78,
      gold: 115,
      exp: 240,
      leashRadius: 270,
      color: '#F97316'
    },
    {
      id: 'blue_purple',
      kind: 'purple_buff',
      teamSide: 'blue',
      name: 'Thunder Fenrir',
      icon: '🟣',
      x: 1150,
      y: 2150,
      firstSpawnSec: MLBB_TIMERS.PURPLE_FIRST_SPAWN,
      respawnSec: MLBB_TIMERS.BUFF_RESPAWN,
      baseHp: 2150,
      baseAtk: 76,
      gold: 115,
      exp: 240,
      leashRadius: 270,
      color: '#A855F7'
    },
    {
      id: 'blue_lizard',
      kind: 'horned_lizard',
      teamSide: 'blue',
      name: 'Rockursa',
      icon: '🐻',
      x: 900,
      y: 1700,
      firstSpawnSec: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN,
      respawnSec: MLBB_TIMERS.SMALL_CAMP_RESPAWN,
      baseHp: 1350,
      baseAtk: 56,
      gold: 75,
      exp: 165,
      leashRadius: 230,
      color: '#2CE58B'
    },
    {
      id: 'blue_golem',
      kind: 'lava_golem',
      teamSide: 'blue',
      name: 'Fiend',
      icon: '👹',
      x: 1750,
      y: 2850,
      firstSpawnSec: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN,
      respawnSec: MLBB_TIMERS.SMALL_CAMP_RESPAWN,
      baseHp: 1420,
      baseAtk: 58,
      gold: 80,
      exp: 170,
      leashRadius: 230,
      color: '#FB923C'
    },
    {
      id: 'blue_beetle',
      kind: 'fire_beetle',
      teamSide: 'blue',
      name: 'Beetle',
      icon: '🪲',
      x: 2700,
      y: 3350,
      firstSpawnSec: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN,
      respawnSec: MLBB_TIMERS.SMALL_CAMP_RESPAWN,
      baseHp: 1280,
      baseAtk: 52,
      gold: 70,
      exp: 160,
      leashRadius: 230,
      color: '#FACC15'
    },
    {
      id: 'blue_crammer',
      kind: 'crammer',
      teamSide: 'blue',
      name: 'Crammer',
      icon: '🦎',
      x: 840,
      y: 2560,
      firstSpawnSec: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN,
      respawnSec: MLBB_TIMERS.SMALL_CAMP_RESPAWN,
      baseHp: 1300,
      baseAtk: 54,
      gold: 74,
      exp: 162,
      leashRadius: 230,
      color: '#38BDF8'
    },
    // Red Jungle Mirrors
    {
      id: 'red_orange',
      kind: 'orange_buff',
      teamSide: 'red',
      name: 'Molten Fiend',
      icon: '🟠',
      x: 1720,
      y: 950,
      firstSpawnSec: MLBB_TIMERS.ORANGE_FIRST_SPAWN,
      respawnSec: MLBB_TIMERS.BUFF_RESPAWN,
      baseHp: 2150,
      baseAtk: 78,
      gold: 115,
      exp: 240,
      leashRadius: 270,
      color: '#F97316'
    },
    {
      id: 'red_purple',
      kind: 'purple_buff',
      teamSide: 'red',
      name: 'Thunder Fenrir',
      icon: '🟣',
      x: 2850,
      y: 1850,
      firstSpawnSec: MLBB_TIMERS.PURPLE_FIRST_SPAWN,
      respawnSec: MLBB_TIMERS.BUFF_RESPAWN,
      baseHp: 2150,
      baseAtk: 76,
      gold: 115,
      exp: 240,
      leashRadius: 270,
      color: '#A855F7'
    },
    {
      id: 'red_lizard',
      kind: 'horned_lizard',
      teamSide: 'red',
      name: 'Rockursa',
      icon: '🐻',
      x: 3100,
      y: 2300,
      firstSpawnSec: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN,
      respawnSec: MLBB_TIMERS.SMALL_CAMP_RESPAWN,
      baseHp: 1350,
      baseAtk: 56,
      gold: 75,
      exp: 165,
      leashRadius: 230,
      color: '#2CE58B'
    },
    {
      id: 'red_golem',
      kind: 'lava_golem',
      teamSide: 'red',
      name: 'Fiend',
      icon: '👹',
      x: 2250,
      y: 1150,
      firstSpawnSec: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN,
      respawnSec: MLBB_TIMERS.SMALL_CAMP_RESPAWN,
      baseHp: 1420,
      baseAtk: 58,
      gold: 80,
      exp: 170,
      leashRadius: 230,
      color: '#FB923C'
    },
    {
      id: 'red_beetle',
      kind: 'fire_beetle',
      teamSide: 'red',
      name: 'Beetle',
      icon: '🪲',
      x: 1300,
      y: 650,
      firstSpawnSec: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN,
      respawnSec: MLBB_TIMERS.SMALL_CAMP_RESPAWN,
      baseHp: 1280,
      baseAtk: 52,
      gold: 70,
      exp: 160,
      leashRadius: 230,
      color: '#FACC15'
    },
    {
      id: 'red_crammer',
      kind: 'crammer',
      teamSide: 'red',
      name: 'Crammer',
      icon: '🦎',
      x: 3160,
      y: 1440,
      firstSpawnSec: MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN,
      respawnSec: MLBB_TIMERS.SMALL_CAMP_RESPAWN,
      baseHp: 1300,
      baseAtk: 54,
      gold: 74,
      exp: 162,
      leashRadius: 230,
      color: '#38BDF8'
    },
    // River Objectives & Camps
    {
      id: 'river_litho',
      kind: 'litho',
      teamSide: 'river',
      name: 'Lithowanderer',
      icon: '🌿',
      x: 1620,
      y: 1620,
      firstSpawnSec: MLBB_TIMERS.LITHO_FIRST_SPAWN,
      respawnSec: MLBB_TIMERS.LITHO_RESPAWN,
      baseHp: 1200,
      baseAtk: 42,
      gold: 85,
      exp: 160,
      leashRadius: 240,
      color: '#2DD4BF'
    },
    {
      id: 'river_crab_top',
      kind: 'crab',
      teamSide: 'river',
      name: 'Sanctum Crab',
      icon: '🦀',
      x: 580,
      y: 580,
      firstSpawnSec: MLBB_TIMERS.CRAB_FIRST_SPAWN,
      respawnSec: MLBB_TIMERS.CRAB_SMALL_RESPAWN,
      baseHp: 980,
      baseAtk: 44,
      gold: 95,
      exp: 120,
      leashRadius: 220,
      color: '#FACC15'
    },
    {
      id: 'river_crab_bot',
      kind: 'crab',
      teamSide: 'river',
      name: 'Sanctum Crab',
      icon: '🦀',
      x: 3420,
      y: 3420,
      firstSpawnSec: MLBB_TIMERS.CRAB_FIRST_SPAWN,
      respawnSec: MLBB_TIMERS.CRAB_SMALL_RESPAWN,
      baseHp: 980,
      baseAtk: 44,
      gold: 95,
      exp: 120,
      leashRadius: 220,
      color: '#FACC15'
    },
    {
      id: 'river_turtle',
      kind: 'turtle',
      teamSide: 'river',
      name: 'Turtle',
      icon: '🐢',
      x: turtlePit.x,
      y: turtlePit.y,
      firstSpawnSec: MLBB_TIMERS.TURTLE_FIRST_SPAWN,
      respawnSec: MLBB_TIMERS.TURTLE_RESPAWN,
      baseHp: 4600,
      baseAtk: 110,
      gold: 220,
      exp: 420,
      leashRadius: 310,
      color: '#2CE58B'
    },
    {
      id: 'river_lord',
      kind: 'lord',
      teamSide: 'river',
      name: 'Sanctuary Lord',
      icon: '🐉',
      x: lordPit.x,
      y: lordPit.y,
      firstSpawnSec: MLBB_TIMERS.LORD_STAGE1_SPAWN,
      respawnSec: MLBB_TIMERS.LORD_RESPAWN_EARLY,
      baseHp: 8200,
      baseAtk: 175,
      gold: 360,
      exp: 600,
      leashRadius: 340,
      color: '#F59E0B'
    }
  ];
}

export const LANE_WAYPOINTS: Record<'top' | 'mid' | 'bot', { x: number; y: number }[]> = {
  top: [
    { x: 480, y: 3320 },
    { x: 420, y: 2350 },
    { x: 420, y: 1200 },
    { x: 480, y: 480 },
    { x: 1580, y: 420 },
    { x: 2650, y: 420 },
    { x: 3480, y: 520 }
  ],
  mid: [
    { x: 640, y: 3360 },
    { x: 1320, y: 2680 },
    { x: 2000, y: 2000 },
    { x: 2680, y: 1320 },
    { x: 3480, y: 520 }
  ],
  bot: [
    { x: 680, y: 3520 },
    { x: 1650, y: 3580 },
    { x: 2800, y: 3580 },
    { x: 3520, y: 3520 },
    { x: 3580, y: 2420 },
    { x: 3580, y: 1350 },
    { x: 3480, y: 520 }
  ]
};

export function isPointInBush(x: number, y: number, variant?: MlbbMapVariantId): MapBushPoly | null {
  const bushes = getActiveMapBushes(variant);
  for (const b of bushes) {
    const dx = x - b.cx;
    const dy = y - b.cy;
    const cos = Math.cos(-b.angle);
    const sin = Math.sin(-b.angle);
    const lx = dx * cos - dy * sin;
    const ly = dx * sin + dy * cos;
    if ((lx * lx) / (b.rx * b.rx) + (ly * ly) / (b.ry * b.ry) <= 1) {
      return b;
    }
  }
  return null;
}

export function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}
