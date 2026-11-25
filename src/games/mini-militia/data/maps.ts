import { MmBiomeId, MmMapDef, MmPlatformRect, MmSpawnPad } from '../types';

function makePerimeter(w: number, h: number, mat: MmPlatformRect['material'], openBottom = false): MmPlatformRect[] {
  const t = 54;
  const rects: MmPlatformRect[] = [
    { x: 0, y: 0, w, h: t, material: mat }, // ceiling skycap
    { x: 0, y: 0, w: t, h, material: mat }, // left wall
    { x: w - t, y: 0, w: t, h, material: mat } // right wall
  ];
  if (!openBottom) {
    rects.push({ x: 0, y: h - t, w, h: t, material: mat }); // ground floor
  }
  return rects;
}

interface MapBlueprint {
  id: string;
  name: string;
  biome: MmBiomeId;
  w: number;
  h: number;
  mat: MmPlatformRect['material'];
  gravityScale?: number;
  unlimitedJetpack?: boolean;
  friction?: number;
  lethalAbyss?: boolean;
  snowOverlay?: boolean;
  tagline: string;
  description: string;
  inner: MmPlatformRect[];
  pads: MmSpawnPad[];
  blueFlag?: { x: number; y: number };
  redFlag?: { x: number; y: number };
  siteA?: { x: number; y: number };
  siteB?: { x: number; y: number };
  blueSpawns?: { x: number; y: number }[];
  redSpawns?: { x: number; y: number }[];
}

function buildMap(bp: MapBlueprint): MmMapDef {
  const platforms = [...makePerimeter(bp.w, bp.h, bp.mat, bp.lethalAbyss), ...bp.inner];
  const blueSpawns = bp.blueSpawns ?? [
    { x: 170, y: bp.h - 160 },
    { x: 250, y: bp.h - 160 },
    { x: 190, y: Math.round(bp.h * 0.45) }
  ];
  const redSpawns = bp.redSpawns ?? [
    { x: bp.w - 170, y: bp.h - 160 },
    { x: bp.w - 250, y: bp.h - 160 },
    { x: bp.w - 190, y: Math.round(bp.h * 0.45) }
  ];
  const ffaSpawns = [
    ...blueSpawns,
    ...redSpawns,
    { x: Math.round(bp.w * 0.5), y: 210 },
    { x: Math.round(bp.w * 0.35), y: Math.round(bp.h * 0.45) },
    { x: Math.round(bp.w * 0.65), y: Math.round(bp.h * 0.45) },
    { x: Math.round(bp.w * 0.5), y: bp.h - 160 }
  ];
  return {
    id: bp.id,
    name: bp.name,
    biome: bp.biome,
    width: bp.w,
    height: bp.h,
    gravityScale: bp.gravityScale ?? 1.0,
    unlimitedJetpack: bp.unlimitedJetpack ?? false,
    friction: bp.friction ?? 1.0,
    lethalAbyss: bp.lethalAbyss ?? false,
    snowOverlay: bp.snowOverlay ?? false,
    tagline: bp.tagline,
    description: bp.description,
    platforms,
    blueSpawns,
    redSpawns,
    ffaSpawns,
    blueFlagPos: bp.blueFlag ?? { x: 210, y: bp.h - 90 },
    redFlagPos: bp.redFlag ?? { x: bp.w - 210, y: bp.h - 90 },
    bombSiteA: bp.siteA ?? { x: Math.round(bp.w * 0.3), y: Math.round(bp.h * 0.52) },
    bombSiteB: bp.siteB ?? { x: Math.round(bp.w * 0.7), y: Math.round(bp.h * 0.52) },
    pads: bp.pads
  };
}

/**
 * ALL 20 ICONIC MINI MILITIA - DOODLE ARMY 2 MAPS
 * Every map features unique terrain geometry, tunnels/catwalks, spawns, CTF flags, PTB sites & weapon pads.
 */
export const MM_MAPS: MmMapDef[] = [
  // 1. OUTPOST (Iconic Default)
  buildMap({
    id: 'outpost',
    name: 'Outpost',
    biome: 'jungle',
    w: 2400,
    h: 1320,
    mat: 'stone',
    tagline: 'Twin Jungle Bunkers · Sniper Tower · Tunnel',
    description: 'Twin jungle outpost bunkers on left & right hills, central open bridge, underground tunnel, and tall sniper watchtower.',
    inner: [
      // Left bunker hill & roof
      { x: 54, y: 920, w: 560, h: 120, material: 'stone' },
      { x: 180, y: 690, w: 340, h: 36, material: 'wood', oneWay: true },
      { x: 54, y: 500, w: 260, h: 32, material: 'metal', oneWay: true },
      // Right bunker hill & roof
      { x: 1786, y: 920, w: 560, h: 120, material: 'stone' },
      { x: 1880, y: 690, w: 340, h: 36, material: 'wood', oneWay: true },
      { x: 2086, y: 500, w: 260, h: 32, material: 'metal', oneWay: true },
      // Central bridge + underground tunnel ceiling
      { x: 760, y: 900, w: 880, h: 46, material: 'stone' },
      { x: 960, y: 1120, w: 480, h: 28, material: 'wood', oneWay: true },
      // Central tall sniper watchtower
      { x: 1120, y: 420, w: 160, h: 26, material: 'metal', oneWay: true },
      { x: 1050, y: 640, w: 300, h: 30, material: 'wood', oneWay: true },
      // Mid cover pillars
      { x: 730, y: 660, w: 54, h: 240, material: 'stone' },
      { x: 1616, y: 660, w: 54, h: 240, material: 'stone' }
    ],
    blueFlag: { x: 220, y: 880 },
    redFlag: { x: 2180, y: 880 },
    siteA: { x: 1200, y: 860 },
    siteB: { x: 1200, y: 1220 },
    blueSpawns: [{ x: 180, y: 860 }, { x: 340, y: 860 }, { x: 200, y: 640 }],
    redSpawns: [{ x: 2220, y: 860 }, { x: 2060, y: 860 }, { x: 2200, y: 640 }],
    pads: [
      { x: 1200, y: 390, kind: 'weapon', weaponPool: ['m93ba', 'hunting_rifle', 'm14'], respawnSec: 18 },
      { x: 180, y: 470, kind: 'weapon', weaponPool: ['smaw', 'mortar', 'ak47'], respawnSec: 20 },
      { x: 2220, y: 470, kind: 'weapon', weaponPool: ['smaw', 'minigun', 'm4'], respawnSec: 20 },
      { x: 1200, y: 1220, kind: 'weapon', weaponPool: ['riot_shield', 'spas12', 'uzi'], respawnSec: 15 },
      { x: 1200, y: 865, kind: 'health', respawnSec: 16 },
      { x: 840, y: 1220, kind: 'boost', respawnSec: 24 },
      { x: 1560, y: 1220, kind: 'ammo', respawnSec: 14 },
      { x: 350, y: 660, kind: 'weapon', weaponPool: ['uzi', 'mp5', 'm4'], respawnSec: 14 },
      { x: 2050, y: 660, kind: 'weapon', weaponPool: ['uzi', 'mp5', 'ak47'], respawnSec: 14 }
    ]
  }),

  // 2. MINI OUTPOST
  buildMap({
    id: 'mini_outpost',
    name: 'Mini Outpost',
    biome: 'jungle',
    w: 1750,
    h: 1050,
    mat: 'stone',
    tagline: 'Fast CQC Remix · Dual-Uzi Chaos',
    description: 'Compact, high-tempo remix of Outpost engineered for chaotic close-quarters dual-Uzi and shotgun duels.',
    inner: [
      { x: 54, y: 710, w: 380, h: 75, material: 'stone' },
      { x: 1316, y: 710, w: 380, h: 75, material: 'stone' },
      { x: 580, y: 720, w: 590, h: 36, material: 'stone' },
      { x: 750, y: 450, w: 250, h: 28, material: 'wood', oneWay: true },
      { x: 260, y: 460, w: 220, h: 26, material: 'wood', oneWay: true },
      { x: 1270, y: 460, w: 220, h: 26, material: 'wood', oneWay: true }
    ],
    blueFlag: { x: 180, y: 675 },
    redFlag: { x: 1570, y: 675 },
    blueSpawns: [{ x: 160, y: 650 }, { x: 260, y: 650 }],
    redSpawns: [{ x: 1590, y: 650 }, { x: 1490, y: 650 }],
    pads: [
      { x: 875, y: 420, kind: 'weapon', weaponPool: ['spas12', 'aa12', 'uzi'], respawnSec: 14 },
      { x: 875, y: 685, kind: 'health', respawnSec: 14 },
      { x: 875, y: 950, kind: 'weapon', weaponPool: ['machete', 'sawed_off', 'riot_shield'], respawnSec: 14 },
      { x: 370, y: 430, kind: 'weapon', weaponPool: ['uzi', 'tec9', 'mp5'], respawnSec: 12 },
      { x: 1380, y: 430, kind: 'weapon', weaponPool: ['uzi', 'tec9', 'mp5'], respawnSec: 12 }
    ]
  }),

  // 3. CATACOMBS
  buildMap({
    id: 'catacombs',
    name: 'Catacombs',
    biome: 'underground',
    w: 2400,
    h: 1460,
    mat: 'stone',
    tagline: 'Underground Labyrinth · Saw Gun Pedestal',
    description: 'Sprawling underground stone labyrinth branching from a central Saw Gun chamber with deadly chokepoints.',
    inner: [
      // Upper left & right vaults
      { x: 54, y: 440, w: 720, h: 52, material: 'stone' },
      { x: 1626, y: 440, w: 720, h: 52, material: 'stone' },
      // Mid walls carving 4 tunnels
      { x: 54, y: 920, w: 680, h: 56, material: 'stone' },
      { x: 1666, y: 920, w: 680, h: 56, material: 'stone' },
      { x: 740, y: 260, w: 54, h: 360, material: 'stone' },
      { x: 1606, y: 260, w: 54, h: 360, material: 'stone' },
      { x: 740, y: 840, w: 54, h: 380, material: 'stone' },
      { x: 1606, y: 840, w: 54, h: 380, material: 'stone' },
      // Central Saw Gun pedestal & upper bridge
      { x: 1020, y: 740, w: 360, h: 40, material: 'stone' },
      { x: 1060, y: 420, w: 280, h: 28, material: 'wood', oneWay: true },
      { x: 1060, y: 1080, w: 280, h: 28, material: 'wood', oneWay: true }
    ],
    blueFlag: { x: 260, y: 880 },
    redFlag: { x: 2140, y: 880 },
    siteA: { x: 1200, y: 700 },
    siteB: { x: 1200, y: 1360 },
    pads: [
      { x: 1200, y: 700, kind: 'weapon', weaponPool: ['saw_gun'], respawnSec: 16 },
      { x: 1200, y: 390, kind: 'weapon', weaponPool: ['flamethrower', 'spas12'], respawnSec: 18 },
      { x: 350, y: 405, kind: 'weapon', weaponPool: ['ak47', 'mp5', 'sawed_off'], respawnSec: 15 },
      { x: 2050, y: 405, kind: 'weapon', weaponPool: ['m4', 'mp5', 'sawed_off'], respawnSec: 15 },
      { x: 1200, y: 1045, kind: 'health', respawnSec: 16 },
      { x: 400, y: 1360, kind: 'boost', respawnSec: 22 },
      { x: 2000, y: 1360, kind: 'ammo', respawnSec: 14 }
    ]
  }),

  // 4. HIGH TOWER
  buildMap({
    id: 'high_tower',
    name: 'High Tower',
    biome: 'industrial',
    w: 2100,
    h: 1700,
    mat: 'metal',
    tagline: 'Vertical Fortress · Open Sky Flanks',
    description: 'Tall multi-story steel fortress with sniper balconies, internal elevator shafts, and an under-tower tunnel.',
    inner: [
      // Central tower outer walls with shaft gaps
      { x: 740, y: 260, w: 44, h: 420, material: 'metal' },
      { x: 1316, y: 260, w: 44, h: 420, material: 'metal' },
      { x: 740, y: 860, w: 44, h: 460, material: 'metal' },
      { x: 1316, y: 860, w: 44, h: 460, material: 'metal' },
      // Multi-story tower floors
      { x: 784, y: 360, w: 532, h: 28, material: 'metal', oneWay: true },
      { x: 784, y: 660, w: 532, h: 32, material: 'hazard' },
      { x: 784, y: 980, w: 532, h: 28, material: 'metal', oneWay: true },
      { x: 784, y: 1300, w: 532, h: 36, material: 'metal' },
      // Outer sky balconies
      { x: 220, y: 520, w: 320, h: 28, material: 'metal', oneWay: true },
      { x: 1560, y: 520, w: 320, h: 28, material: 'metal', oneWay: true },
      { x: 220, y: 1020, w: 340, h: 36, material: 'stone' },
      { x: 1540, y: 1020, w: 340, h: 36, material: 'stone' }
    ],
    blueFlag: { x: 320, y: 980 },
    redFlag: { x: 1780, y: 980 },
    blueSpawns: [{ x: 280, y: 960 }, { x: 240, y: 1560 }],
    redSpawns: [{ x: 1820, y: 960 }, { x: 1860, y: 1560 }],
    pads: [
      { x: 1050, y: 325, kind: 'weapon', weaponPool: ['m93ba', 'smaw'], respawnSec: 18 },
      { x: 1050, y: 625, kind: 'weapon', weaponPool: ['minigun', 'aa12', 'tavor'], respawnSec: 18 },
      { x: 1050, y: 945, kind: 'health', respawnSec: 15 },
      { x: 1050, y: 1580, kind: 'weapon', weaponPool: ['flamethrower', 'riot_shield'], respawnSec: 16 },
      { x: 360, y: 485, kind: 'weapon', weaponPool: ['m14', 'm4'], respawnSec: 15 },
      { x: 1740, y: 485, kind: 'weapon', weaponPool: ['m14', 'ak47'], respawnSec: 15 }
    ]
  }),

  // 5. SUBDIVISION
  buildMap({
    id: 'subdivision',
    name: 'Subdivision',
    biome: 'industrial',
    w: 2200,
    h: 1380,
    mat: 'metal',
    tagline: 'Mirrored Bases · Central Death-Shaft',
    description: 'Two mirrored multi-room bases divided by a narrow vertical shaft packed with grenades and shotgun ambushes.',
    inner: [
      // Central shaft walls
      { x: 960, y: 54, w: 46, h: 420, material: 'metal' },
      { x: 1194, y: 54, w: 46, h: 420, material: 'metal' },
      { x: 960, y: 680, w: 46, h: 460, material: 'metal' },
      { x: 1194, y: 680, w: 46, h: 460, material: 'metal' },
      // Left rooms
      { x: 54, y: 460, w: 680, h: 38, material: 'metal' },
      { x: 260, y: 880, w: 700, h: 38, material: 'metal' },
      { x: 460, y: 498, w: 38, h: 230, material: 'metal' },
      // Right rooms
      { x: 1466, y: 460, w: 680, h: 38, material: 'metal' },
      { x: 1240, y: 880, w: 700, h: 38, material: 'metal' },
      { x: 1702, y: 498, w: 38, h: 230, material: 'metal' },
      // Mid catwalk inside shaft
      { x: 1006, y: 660, w: 188, h: 24, material: 'hazard', oneWay: true }
    ],
    pads: [
      { x: 1100, y: 625, kind: 'weapon', weaponPool: ['spas12', 'aa12', 'saw_gun'], respawnSec: 16 },
      { x: 1100, y: 1280, kind: 'health', respawnSec: 14 },
      { x: 280, y: 420, kind: 'weapon', weaponPool: ['uzi', 'mp5', 'm4'], respawnSec: 14 },
      { x: 1920, y: 420, kind: 'weapon', weaponPool: ['uzi', 'mp5', 'ak47'], respawnSec: 14 },
      { x: 640, y: 840, kind: 'ammo', respawnSec: 15 },
      { x: 1560, y: 840, kind: 'boost', respawnSec: 22 }
    ]
  }),

  // 6. BOTTLENECK
  buildMap({
    id: 'bottleneck',
    name: 'Bottleneck',
    biome: 'underground',
    w: 2250,
    h: 1300,
    mat: 'stone',
    tagline: 'Hourglass Choke · Explosive Cavern',
    description: 'Distinct hourglass battlefield—narrow deadly top tunnel above an explosive wide central cavern.',
    inner: [
      // Hourglass upper pinch
      { x: 54, y: 360, w: 740, h: 160, material: 'stone' },
      { x: 1456, y: 360, w: 740, h: 160, material: 'stone' },
      { x: 930, y: 320, w: 390, h: 36, material: 'stone' },
      // Mid cavern platforms
      { x: 520, y: 840, w: 360, h: 30, material: 'wood', oneWay: true },
      { x: 1370, y: 840, w: 360, h: 30, material: 'wood', oneWay: true },
      { x: 960, y: 980, w: 330, h: 42, material: 'stone' }
    ],
    pads: [
      { x: 1125, y: 285, kind: 'weapon', weaponPool: ['smaw', 'mortar', 'minigun'], respawnSec: 18 },
      { x: 1125, y: 940, kind: 'weapon', weaponPool: ['flamethrower', 'spas12', 'riot_shield'], respawnSec: 16 },
      { x: 700, y: 805, kind: 'health', respawnSec: 15 },
      { x: 1550, y: 805, kind: 'ammo', respawnSec: 15 },
      { x: 1125, y: 1200, kind: 'boost', respawnSec: 22 }
    ]
  }),

  // 7. SNOW BLIND
  buildMap({
    id: 'snow_blind',
    name: 'Snow Blind',
    biome: 'arctic',
    w: 2450,
    h: 1320,
    mat: 'ice',
    snowOverlay: true,
    friction: 0.72,
    tagline: 'Blizzard Ridge · Arctic Caves · Sniper Sightlines',
    description: 'Arctic mountain outpost swept by drifting snow with icy caves and elevated sniper ridges.',
    inner: [
      { x: 54, y: 820, w: 540, h: 90, material: 'ice' },
      { x: 1856, y: 820, w: 540, h: 90, material: 'ice' },
      { x: 740, y: 600, w: 380, h: 36, material: 'ice' },
      { x: 1330, y: 600, w: 380, h: 36, material: 'ice' },
      { x: 980, y: 980, w: 490, h: 42, material: 'stone' },
      { x: 1090, y: 360, w: 270, h: 28, material: 'metal', oneWay: true }
    ],
    pads: [
      { x: 1225, y: 325, kind: 'weapon', weaponPool: ['m93ba', 'hunting_rifle'], respawnSec: 18 },
      { x: 920, y: 565, kind: 'weapon', weaponPool: ['tavor', 'm4', 'm14'], respawnSec: 15 },
      { x: 1530, y: 565, kind: 'weapon', weaponPool: ['ak47', 'mp5', 'm14'], respawnSec: 15 },
      { x: 1225, y: 940, kind: 'health', respawnSec: 15 },
      { x: 1225, y: 1220, kind: 'weapon', weaponPool: ['smaw', 'flamethrower'], respawnSec: 18 }
    ]
  }),

  // 8. LUNARCY (Low Gravity + Unlimited Nitro!)
  buildMap({
    id: 'lunarcy',
    name: 'Lunarcy',
    biome: 'lunar',
    w: 2450,
    h: 1380,
    mat: 'metal',
    gravityScale: 0.38,
    unlimitedJetpack: true,
    tagline: '0.38x Moon Gravity · Unlimited Jetpack · PHASR & EMP',
    description: 'Moon surface base with low gravity, infinite Rocket Boot fuel, futuristic space domes, PHASR Laser & EMP Gun.',
    inner: [
      { x: 260, y: 940, w: 460, h: 42, material: 'metal' },
      { x: 1730, y: 940, w: 460, h: 42, material: 'metal' },
      { x: 880, y: 740, w: 690, h: 34, material: 'hazard' },
      { x: 420, y: 500, w: 340, h: 28, material: 'metal', oneWay: true },
      { x: 1690, y: 500, w: 340, h: 28, material: 'metal', oneWay: true },
      { x: 1080, y: 340, w: 290, h: 28, material: 'metal', oneWay: true },
      { x: 1080, y: 1120, w: 290, h: 36, material: 'stone' }
    ],
    pads: [
      { x: 1225, y: 700, kind: 'weapon', weaponPool: ['phasr'], respawnSec: 15 },
      { x: 1225, y: 305, kind: 'weapon', weaponPool: ['m93ba', 'phasr'], respawnSec: 17 },
      { x: 590, y: 465, kind: 'weapon', weaponPool: ['emp_gun', 'm14'], respawnSec: 15 },
      { x: 1860, y: 465, kind: 'weapon', weaponPool: ['emp_gun', 'smaw'], respawnSec: 15 },
      { x: 1225, y: 1080, kind: 'health', respawnSec: 15 },
      { x: 490, y: 900, kind: 'boost', respawnSec: 20 }
    ]
  }),

  // 9. PYRAMID
  buildMap({
    id: 'pyramid',
    name: 'Pyramid',
    biome: 'desert',
    w: 2400,
    h: 1420,
    mat: 'sand',
    tagline: 'Stepped Sandstone Pyramid · Secret Burial Chamber',
    description: 'Hollow Egyptian sandstone pyramid with stepped outer slopes, inner zigzag halls, and a central heavy-weapon tomb.',
    inner: [
      // Stepped outer pyramid ledges
      { x: 420, y: 1020, w: 440, h: 42, material: 'sand' },
      { x: 1540, y: 1020, w: 440, h: 42, material: 'sand' },
      { x: 640, y: 740, w: 380, h: 42, material: 'sand' },
      { x: 1380, y: 740, w: 380, h: 42, material: 'sand' },
      { x: 880, y: 460, w: 640, h: 42, material: 'sand' },
      { x: 1080, y: 260, w: 240, h: 32, material: 'sand' },
      // Inner burial chamber walls
      { x: 1020, y: 920, w: 360, h: 36, material: 'sand' },
      { x: 960, y: 660, w: 48, h: 260, material: 'sand' },
      { x: 1392, y: 660, w: 48, h: 260, material: 'sand' }
    ],
    pads: [
      { x: 1200, y: 885, kind: 'weapon', weaponPool: ['minigun', 'smaw', 'saw_gun'], respawnSec: 18 },
      { x: 1200, y: 225, kind: 'weapon', weaponPool: ['m93ba', 'golden_eagle'], respawnSec: 18 },
      { x: 1200, y: 425, kind: 'health', respawnSec: 16 },
      { x: 620, y: 985, kind: 'weapon', weaponPool: ['ak47', 'spas12'], respawnSec: 15 },
      { x: 1780, y: 985, kind: 'weapon', weaponPool: ['tavor', 'aa12'], respawnSec: 15 },
      { x: 1200, y: 1320, kind: 'boost', respawnSec: 22 }
    ]
  }),

  // 10. NO ESCAPE
  buildMap({
    id: 'no_escape',
    name: 'No Escape',
    biome: 'industrial',
    w: 2150,
    h: 1460,
    mat: 'metal',
    tagline: 'Boxed Chambers · Vertical Flanking Shafts',
    description: 'Fan-favorite Subdivision + High Tower hybrid with boxed steel chambers and zero safe camping corners.',
    inner: [
      { x: 380, y: 360, w: 540, h: 36, material: 'metal' },
      { x: 1230, y: 360, w: 540, h: 36, material: 'metal' },
      { x: 380, y: 740, w: 540, h: 36, material: 'hazard' },
      { x: 1230, y: 740, w: 540, h: 36, material: 'hazard' },
      { x: 380, y: 1100, w: 540, h: 36, material: 'metal' },
      { x: 1230, y: 1100, w: 540, h: 36, material: 'metal' },
      { x: 380, y: 360, w: 36, h: 380, material: 'metal' },
      { x: 1734, y: 360, w: 36, h: 380, material: 'metal' },
      { x: 960, y: 540, w: 230, h: 28, material: 'metal', oneWay: true },
      { x: 960, y: 920, w: 230, h: 28, material: 'metal', oneWay: true }
    ],
    pads: [
      { x: 1075, y: 505, kind: 'weapon', weaponPool: ['aa12', 'flamethrower', 'saw_gun'], respawnSec: 16 },
      { x: 1075, y: 885, kind: 'health', respawnSec: 14 },
      { x: 640, y: 705, kind: 'weapon', weaponPool: ['uzi', 'mp5', 'm4'], respawnSec: 14 },
      { x: 1510, y: 705, kind: 'weapon', weaponPool: ['uzi', 'mp5', 'ak47'], respawnSec: 14 },
      { x: 1075, y: 1360, kind: 'weapon', weaponPool: ['smaw', 'mortar'], respawnSec: 18 }
    ]
  }),

  // 11. SUSPENSION
  buildMap({
    id: 'suspension',
    name: 'Suspension',
    biome: 'industrial',
    w: 2500,
    h: 1260,
    mat: 'metal',
    tagline: 'Triple Towers · High Suspension Bridge',
    description: 'Three elevated steel structures linked across a wide sky chasm by high and low suspension bridges.',
    inner: [
      // Left tower
      { x: 54, y: 560, w: 420, h: 42, material: 'metal' },
      { x: 54, y: 920, w: 420, h: 42, material: 'stone' },
      // Center tower
      { x: 1040, y: 420, w: 420, h: 36, material: 'hazard' },
      { x: 1040, y: 860, w: 420, h: 42, material: 'metal' },
      // Right tower
      { x: 2026, y: 560, w: 420, h: 42, material: 'metal' },
      { x: 2026, y: 920, w: 420, h: 42, material: 'stone' },
      // High & low suspension bridge catwalks
      { x: 474, y: 580, w: 566, h: 22, material: 'metal', oneWay: true },
      { x: 1460, y: 580, w: 566, h: 22, material: 'metal', oneWay: true },
      { x: 474, y: 940, w: 566, h: 22, material: 'wood', oneWay: true },
      { x: 1460, y: 940, w: 566, h: 22, material: 'wood', oneWay: true }
    ],
    pads: [
      { x: 1250, y: 385, kind: 'weapon', weaponPool: ['m93ba', 'smaw', 'phasr'], respawnSec: 18 },
      { x: 1250, y: 825, kind: 'health', respawnSec: 15 },
      { x: 750, y: 545, kind: 'weapon', weaponPool: ['m4', 'tavor'], respawnSec: 14 },
      { x: 1750, y: 545, kind: 'weapon', weaponPool: ['ak47', 'm14'], respawnSec: 14 },
      { x: 1250, y: 1160, kind: 'boost', respawnSec: 20 }
    ]
  }),

  // 12. CROSSFIRE
  buildMap({
    id: 'crossfire',
    name: 'Crossfire',
    biome: 'industrial',
    w: 2300,
    h: 1340,
    mat: 'metal',
    tagline: 'Symmetrical Atrium · Intersecting Sightlines',
    description: 'Symmetrical multi-level industrial arena where rockets and snipers clash across the central atrium.',
    inner: [
      { x: 220, y: 420, w: 460, h: 34, material: 'metal' },
      { x: 1620, y: 420, w: 460, h: 34, material: 'metal' },
      { x: 220, y: 900, w: 460, h: 34, material: 'metal' },
      { x: 1620, y: 900, w: 460, h: 34, material: 'metal' },
      { x: 960, y: 650, w: 380, h: 38, material: 'hazard' },
      { x: 1130, y: 340, w: 40, h: 210, material: 'metal' },
      { x: 1130, y: 790, w: 40, h: 210, material: 'metal' }
    ],
    pads: [
      { x: 1150, y: 615, kind: 'weapon', weaponPool: ['smaw', 'minigun', 'm93ba'], respawnSec: 18 },
      { x: 450, y: 385, kind: 'weapon', weaponPool: ['m14', 'm4'], respawnSec: 15 },
      { x: 1850, y: 385, kind: 'weapon', weaponPool: ['m14', 'ak47'], respawnSec: 15 },
      { x: 450, y: 865, kind: 'health', respawnSec: 15 },
      { x: 1850, y: 865, kind: 'health', respawnSec: 15 }
    ]
  }),

  // 13. SO LONG
  buildMap({
    id: 'so_long',
    name: 'So Long',
    biome: 'jungle',
    w: 3100,
    h: 1140,
    mat: 'stone',
    tagline: 'Ultra-Wide Trench · Pillboxes & Long Flight Corridors',
    description: 'Massive horizontal battlefield featuring repeating pillboxes, sniper towers, and long aerial assault lanes.',
    inner: [
      { x: 420, y: 760, w: 320, h: 40, material: 'stone' },
      { x: 980, y: 600, w: 340, h: 36, material: 'wood', oneWay: true },
      { x: 1480, y: 760, w: 360, h: 42, material: 'stone' },
      { x: 1980, y: 600, w: 340, h: 36, material: 'wood', oneWay: true },
      { x: 2420, y: 760, w: 320, h: 40, material: 'stone' },
      { x: 1560, y: 390, w: 200, h: 26, material: 'metal', oneWay: true }
    ],
    pads: [
      { x: 1660, y: 355, kind: 'weapon', weaponPool: ['m93ba', 'hunting_rifle'], respawnSec: 18 },
      { x: 1660, y: 725, kind: 'health', respawnSec: 15 },
      { x: 580, y: 725, kind: 'weapon', weaponPool: ['m4', 'tavor'], respawnSec: 14 },
      { x: 2580, y: 725, kind: 'weapon', weaponPool: ['ak47', 'tavor'], respawnSec: 14 },
      { x: 1150, y: 565, kind: 'boost', respawnSec: 20 },
      { x: 2150, y: 565, kind: 'weapon', weaponPool: ['smaw', 'mortar'], respawnSec: 18 }
    ]
  }),

  // 14. CLIFFHANGER (Lethal Abyss!)
  buildMap({
    id: 'cliffhanger',
    name: 'Cliffhanger',
    biome: 'jungle',
    w: 2250,
    h: 1420,
    mat: 'stone',
    lethalAbyss: true,
    tagline: 'Steep Cliffside · Lethal Bottom Drop-Off Abyss!',
    description: 'Steep mountain cliffside with carved caves, narrow ledges, and a lethal bottom drop-off—don’t run out of nitro!',
    inner: [
      // Solid cliff islands over the open abyss
      { x: 54, y: 1080, w: 520, h: 120, material: 'stone' },
      { x: 1676, y: 1080, w: 520, h: 120, material: 'stone' },
      { x: 820, y: 1020, w: 610, h: 72, material: 'stone' },
      { x: 320, y: 700, w: 420, h: 42, material: 'stone' },
      { x: 1510, y: 700, w: 420, h: 42, material: 'stone' },
      { x: 930, y: 460, w: 390, h: 32, material: 'wood', oneWay: true }
    ],
    blueFlag: { x: 240, y: 1040 },
    redFlag: { x: 2010, y: 1040 },
    blueSpawns: [{ x: 220, y: 1010 }, { x: 360, y: 1010 }, { x: 420, y: 640 }],
    redSpawns: [{ x: 2030, y: 1010 }, { x: 1890, y: 1010 }, { x: 1830, y: 640 }],
    pads: [
      { x: 1125, y: 425, kind: 'weapon', weaponPool: ['m93ba', 'emp_gun', 'smaw'], respawnSec: 18 },
      { x: 1125, y: 985, kind: 'health', respawnSec: 15 },
      { x: 530, y: 665, kind: 'weapon', weaponPool: ['spas12', 'm4'], respawnSec: 15 },
      { x: 1720, y: 665, kind: 'weapon', weaponPool: ['spas12', 'ak47'], respawnSec: 15 }
    ]
  }),

  // 15. UNDERMINING
  buildMap({
    id: 'undermining',
    name: 'Undermining',
    biome: 'underground',
    w: 2300,
    h: 1420,
    mat: 'stone',
    tagline: 'Mine Shafts · Timber Frames · Drop Chimneys',
    description: 'Deep underground mine shafts with timber platforms, vertical drop chimneys, and CQC flamethrower pockets.',
    inner: [
      { x: 54, y: 480, w: 620, h: 44, material: 'stone' },
      { x: 920, y: 480, w: 460, h: 44, material: 'stone' },
      { x: 1626, y: 480, w: 620, h: 44, material: 'stone' },
      { x: 300, y: 920, w: 720, h: 44, material: 'stone' },
      { x: 1280, y: 920, w: 720, h: 44, material: 'stone' },
      { x: 674, y: 680, w: 246, h: 24, material: 'wood', oneWay: true },
      { x: 1380, y: 680, w: 246, h: 24, material: 'wood', oneWay: true }
    ],
    pads: [
      { x: 1150, y: 445, kind: 'weapon', weaponPool: ['flamethrower', 'saw_gun'], respawnSec: 17 },
      { x: 1150, y: 1320, kind: 'weapon', weaponPool: ['aa12', 'spas12', 'riot_shield'], respawnSec: 16 },
      { x: 790, y: 645, kind: 'health', respawnSec: 15 },
      { x: 1500, y: 645, kind: 'ammo', respawnSec: 15 },
      { x: 640, y: 885, kind: 'weapon', weaponPool: ['uzi', 'mp5'], respawnSec: 14 },
      { x: 1660, y: 885, kind: 'weapon', weaponPool: ['uzi', 'tec9'], respawnSec: 14 }
    ]
  }),

  // 16. JUNKYARD
  buildMap({
    id: 'junkyard',
    name: 'Junkyard',
    biome: 'industrial',
    w: 2350,
    h: 1300,
    mat: 'hazard',
    tagline: 'Scrap Containers · Cranes · Jagged Cover',
    description: 'Chaotic scrapyard stacked with shipping containers, rusted beams, cranes, and jagged cover platforms.',
    inner: [
      { x: 280, y: 960, w: 380, h: 86, material: 'hazard' },
      { x: 960, y: 880, w: 430, h: 92, material: 'metal' },
      { x: 1690, y: 960, w: 380, h: 86, material: 'hazard' },
      { x: 520, y: 620, w: 320, h: 34, material: 'metal', oneWay: true },
      { x: 1510, y: 620, w: 320, h: 34, material: 'metal', oneWay: true },
      { x: 990, y: 400, w: 370, h: 30, material: 'hazard', oneWay: true }
    ],
    pads: [
      { x: 1175, y: 365, kind: 'weapon', weaponPool: ['minigun', 'smaw', 'mortar'], respawnSec: 18 },
      { x: 1175, y: 845, kind: 'weapon', weaponPool: ['saw_gun', 'spas12', 'ak47'], respawnSec: 16 },
      { x: 680, y: 585, kind: 'health', respawnSec: 15 },
      { x: 1670, y: 585, kind: 'boost', respawnSec: 20 }
    ]
  }),

  // 17. ICEBOX (Slippery Ice!)
  buildMap({
    id: 'icebox',
    name: 'Icebox',
    biome: 'arctic',
    w: 1950,
    h: 1180,
    mat: 'ice',
    friction: 0.28,
    snowOverlay: true,
    tagline: 'Slippery Low-Friction Ice · Tight Blast Doors',
    description: 'Compact sub-zero bunker with ultra-low friction ice floors that amplify slide momentum.',
    inner: [
      { x: 54, y: 560, w: 480, h: 42, material: 'ice' },
      { x: 1416, y: 560, w: 480, h: 42, material: 'ice' },
      { x: 740, y: 740, w: 470, h: 38, material: 'ice' },
      { x: 790, y: 380, w: 370, h: 30, material: 'metal', oneWay: true }
    ],
    pads: [
      { x: 975, y: 345, kind: 'weapon', weaponPool: ['phasr', 'm14', 'tavor'], respawnSec: 16 },
      { x: 975, y: 705, kind: 'weapon', weaponPool: ['aa12', 'uzi', 'flamethrower'], respawnSec: 15 },
      { x: 975, y: 1080, kind: 'health', respawnSec: 14 },
      { x: 280, y: 525, kind: 'ammo', respawnSec: 14 },
      { x: 1670, y: 525, kind: 'boost', respawnSec: 20 }
    ]
  }),

  // 18. CRAG
  buildMap({
    id: 'crag',
    name: 'Crag',
    biome: 'desert',
    w: 2400,
    h: 1360,
    mat: 'sand',
    tagline: 'Canyon Pillars · Deep Ravine · Flanking Caves',
    description: 'Jagged canyon peaks with tall rock pillars, a deep central ravine, and flanking subterranean caves.',
    inner: [
      { x: 440, y: 660, w: 150, h: 646, material: 'sand' },
      { x: 1810, y: 660, w: 150, h: 646, material: 'sand' },
      { x: 980, y: 540, w: 440, h: 42, material: 'sand' },
      { x: 920, y: 940, w: 560, h: 38, material: 'wood', oneWay: true },
      { x: 54, y: 780, w: 280, h: 34, material: 'sand' },
      { x: 2066, y: 780, w: 280, h: 34, material: 'sand' }
    ],
    pads: [
      { x: 1200, y: 505, kind: 'weapon', weaponPool: ['m93ba', 'smaw'], respawnSec: 18 },
      { x: 515, y: 625, kind: 'weapon', weaponPool: ['m14', 'm4'], respawnSec: 15 },
      { x: 1885, y: 625, kind: 'weapon', weaponPool: ['hunting_rifle', 'ak47'], respawnSec: 15 },
      { x: 1200, y: 905, kind: 'health', respawnSec: 15 },
      { x: 1200, y: 1260, kind: 'weapon', weaponPool: ['saw_gun', 'spas12'], respawnSec: 16 }
    ]
  }),

  // 19. STRONGHOLD
  buildMap({
    id: 'stronghold',
    name: 'Stronghold',
    biome: 'industrial',
    w: 2450,
    h: 1340,
    mat: 'stone',
    tagline: 'Fortified Citadel · Dual Guard Towers · CTF/PTB Classic',
    description: 'Symmetrical fortified concrete citadel with dual guard towers, central courtyard, and tactical CTF/PTB lanes.',
    inner: [
      // Left citadel
      { x: 54, y: 540, w: 420, h: 40, material: 'stone' },
      { x: 434, y: 540, w: 40, h: 420, material: 'stone' },
      { x: 54, y: 920, w: 380, h: 32, material: 'metal', oneWay: true },
      // Right citadel
      { x: 1976, y: 540, w: 420, h: 40, material: 'stone' },
      { x: 1976, y: 540, w: 40, h: 420, material: 'stone' },
      { x: 2016, y: 920, w: 380, h: 32, material: 'metal', oneWay: true },
      // Central courtyard & upper arch
      { x: 940, y: 840, w: 570, h: 44, material: 'stone' },
      { x: 1040, y: 480, w: 370, h: 34, material: 'hazard' }
    ],
    blueFlag: { x: 210, y: 885 },
    redFlag: { x: 2240, y: 885 },
    siteA: { x: 1225, y: 800 },
    siteB: { x: 1225, y: 445 },
    pads: [
      { x: 1225, y: 445, kind: 'weapon', weaponPool: ['smaw', 'm93ba', 'minigun'], respawnSec: 18 },
      { x: 1225, y: 805, kind: 'health', respawnSec: 15 },
      { x: 260, y: 505, kind: 'weapon', weaponPool: ['m4', 'riot_shield'], respawnSec: 15 },
      { x: 2190, y: 505, kind: 'weapon', weaponPool: ['ak47', 'riot_shield'], respawnSec: 15 },
      { x: 1225, y: 1240, kind: 'boost', respawnSec: 22 }
    ]
  }),

  // 20. OVERSEER (Pro Arena)
  buildMap({
    id: 'overseer',
    name: 'Overseer',
    biome: 'industrial',
    w: 1900,
    h: 1120,
    mat: 'metal',
    tagline: 'Tournament Balanced · 1v1 / 2v2 / 3v3 Pro Scrims',
    description: 'Compact tournament-balanced symmetrical steel arena crafted for high-skill competitive scrims.',
    inner: [
      { x: 280, y: 740, w: 340, h: 32, material: 'metal' },
      { x: 1280, y: 740, w: 340, h: 32, material: 'metal' },
      { x: 760, y: 540, w: 380, h: 32, material: 'hazard' },
      { x: 460, y: 380, w: 220, h: 24, material: 'metal', oneWay: true },
      { x: 1220, y: 380, w: 220, h: 24, material: 'metal', oneWay: true }
    ],
    pads: [
      { x: 950, y: 505, kind: 'weapon', weaponPool: ['m4', 'ak47', 'm14', 'spas12'], respawnSec: 14 },
      { x: 950, y: 1020, kind: 'health', respawnSec: 14 },
      { x: 570, y: 345, kind: 'weapon', weaponPool: ['uzi', 'mp5', 'magnum'], respawnSec: 12 },
      { x: 1330, y: 345, kind: 'weapon', weaponPool: ['uzi', 'mp5', 'deagle'], respawnSec: 12 }
    ]
  })
];

const MAP_LOOKUP = new Map<string, MmMapDef>(MM_MAPS.map((m) => [m.id, m]));

export function getMmMapById(id: string): MmMapDef {
  return MAP_LOOKUP.get(id) ?? MM_MAPS[0];
}
