(function(ArcadeMod){
// === MODULE: src/games/mini-militia/data/maps ===
ArcadeMod.define("src/games/mini-militia/data/maps", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get MM_MAPS () {
        return MM_MAPS;
    },
    get getMmMapById () {
        return getMmMapById;
    }
});
function makePerimeter(w, h, mat, openBottom) {
    if (openBottom === void 0) openBottom = false;
    var t = 54;
    var rects = [
        {
            x: 0,
            y: 0,
            w: w,
            h: t,
            material: mat
        },
        {
            x: 0,
            y: 0,
            w: t,
            h: h,
            material: mat
        },
        {
            x: w - t,
            y: 0,
            w: t,
            h: h,
            material: mat
        } // right wall
    ];
    if (!openBottom) {
        rects.push({
            x: 0,
            y: h - t,
            w: w,
            h: t,
            material: mat
        }); // ground floor
    }
    return rects;
}
function buildMap(bp) {
    var _bp_blueSpawns, _bp_redSpawns, _bp_gravityScale, _bp_unlimitedJetpack, _bp_friction, _bp_lethalAbyss, _bp_snowOverlay, _bp_blueFlag, _bp_redFlag, _bp_siteA, _bp_siteB;
    var platforms = [].concat(makePerimeter(bp.w, bp.h, bp.mat, bp.lethalAbyss), bp.inner);
    var blueSpawns = (_bp_blueSpawns = bp.blueSpawns) != null ? _bp_blueSpawns : [
        {
            x: 170,
            y: bp.h - 160
        },
        {
            x: 250,
            y: bp.h - 160
        },
        {
            x: 190,
            y: Math.round(bp.h * 0.45)
        }
    ];
    var redSpawns = (_bp_redSpawns = bp.redSpawns) != null ? _bp_redSpawns : [
        {
            x: bp.w - 170,
            y: bp.h - 160
        },
        {
            x: bp.w - 250,
            y: bp.h - 160
        },
        {
            x: bp.w - 190,
            y: Math.round(bp.h * 0.45)
        }
    ];
    var ffaSpawns = [].concat(blueSpawns, redSpawns, [
        {
            x: Math.round(bp.w * 0.5),
            y: 210
        },
        {
            x: Math.round(bp.w * 0.35),
            y: Math.round(bp.h * 0.45)
        },
        {
            x: Math.round(bp.w * 0.65),
            y: Math.round(bp.h * 0.45)
        },
        {
            x: Math.round(bp.w * 0.5),
            y: bp.h - 160
        }
    ]);
    return {
        id: bp.id,
        name: bp.name,
        biome: bp.biome,
        width: bp.w,
        height: bp.h,
        gravityScale: (_bp_gravityScale = bp.gravityScale) != null ? _bp_gravityScale : 1.0,
        unlimitedJetpack: (_bp_unlimitedJetpack = bp.unlimitedJetpack) != null ? _bp_unlimitedJetpack : false,
        friction: (_bp_friction = bp.friction) != null ? _bp_friction : 1.0,
        lethalAbyss: (_bp_lethalAbyss = bp.lethalAbyss) != null ? _bp_lethalAbyss : false,
        snowOverlay: (_bp_snowOverlay = bp.snowOverlay) != null ? _bp_snowOverlay : false,
        tagline: bp.tagline,
        description: bp.description,
        platforms: platforms,
        blueSpawns: blueSpawns,
        redSpawns: redSpawns,
        ffaSpawns: ffaSpawns,
        blueFlagPos: (_bp_blueFlag = bp.blueFlag) != null ? _bp_blueFlag : {
            x: 210,
            y: bp.h - 90
        },
        redFlagPos: (_bp_redFlag = bp.redFlag) != null ? _bp_redFlag : {
            x: bp.w - 210,
            y: bp.h - 90
        },
        bombSiteA: (_bp_siteA = bp.siteA) != null ? _bp_siteA : {
            x: Math.round(bp.w * 0.3),
            y: Math.round(bp.h * 0.52)
        },
        bombSiteB: (_bp_siteB = bp.siteB) != null ? _bp_siteB : {
            x: Math.round(bp.w * 0.7),
            y: Math.round(bp.h * 0.52)
        },
        pads: bp.pads
    };
}
var MM_MAPS = [
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
            {
                x: 54,
                y: 920,
                w: 560,
                h: 120,
                material: 'stone'
            },
            {
                x: 180,
                y: 690,
                w: 340,
                h: 36,
                material: 'wood',
                oneWay: true
            },
            {
                x: 54,
                y: 500,
                w: 260,
                h: 32,
                material: 'metal',
                oneWay: true
            },
            // Right bunker hill & roof
            {
                x: 1786,
                y: 920,
                w: 560,
                h: 120,
                material: 'stone'
            },
            {
                x: 1880,
                y: 690,
                w: 340,
                h: 36,
                material: 'wood',
                oneWay: true
            },
            {
                x: 2086,
                y: 500,
                w: 260,
                h: 32,
                material: 'metal',
                oneWay: true
            },
            // Central bridge + underground tunnel ceiling
            {
                x: 760,
                y: 900,
                w: 880,
                h: 46,
                material: 'stone'
            },
            {
                x: 960,
                y: 1120,
                w: 480,
                h: 28,
                material: 'wood',
                oneWay: true
            },
            // Central tall sniper watchtower
            {
                x: 1120,
                y: 420,
                w: 160,
                h: 26,
                material: 'metal',
                oneWay: true
            },
            {
                x: 1050,
                y: 640,
                w: 300,
                h: 30,
                material: 'wood',
                oneWay: true
            },
            // Mid cover pillars
            {
                x: 730,
                y: 660,
                w: 54,
                h: 240,
                material: 'stone'
            },
            {
                x: 1616,
                y: 660,
                w: 54,
                h: 240,
                material: 'stone'
            }
        ],
        blueFlag: {
            x: 220,
            y: 880
        },
        redFlag: {
            x: 2180,
            y: 880
        },
        siteA: {
            x: 1200,
            y: 860
        },
        siteB: {
            x: 1200,
            y: 1220
        },
        blueSpawns: [
            {
                x: 180,
                y: 860
            },
            {
                x: 340,
                y: 860
            },
            {
                x: 200,
                y: 640
            }
        ],
        redSpawns: [
            {
                x: 2220,
                y: 860
            },
            {
                x: 2060,
                y: 860
            },
            {
                x: 2200,
                y: 640
            }
        ],
        pads: [
            {
                x: 1200,
                y: 390,
                kind: 'weapon',
                weaponPool: [
                    'm93ba',
                    'hunting_rifle',
                    'm14'
                ],
                respawnSec: 18
            },
            {
                x: 180,
                y: 470,
                kind: 'weapon',
                weaponPool: [
                    'smaw',
                    'mortar',
                    'ak47'
                ],
                respawnSec: 20
            },
            {
                x: 2220,
                y: 470,
                kind: 'weapon',
                weaponPool: [
                    'smaw',
                    'minigun',
                    'm4'
                ],
                respawnSec: 20
            },
            {
                x: 1200,
                y: 1220,
                kind: 'weapon',
                weaponPool: [
                    'riot_shield',
                    'spas12',
                    'uzi'
                ],
                respawnSec: 15
            },
            {
                x: 1200,
                y: 865,
                kind: 'health',
                respawnSec: 16
            },
            {
                x: 840,
                y: 1220,
                kind: 'boost',
                respawnSec: 24
            },
            {
                x: 1560,
                y: 1220,
                kind: 'ammo',
                respawnSec: 14
            },
            {
                x: 350,
                y: 660,
                kind: 'weapon',
                weaponPool: [
                    'uzi',
                    'mp5',
                    'm4'
                ],
                respawnSec: 14
            },
            {
                x: 2050,
                y: 660,
                kind: 'weapon',
                weaponPool: [
                    'uzi',
                    'mp5',
                    'ak47'
                ],
                respawnSec: 14
            }
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
            {
                x: 54,
                y: 710,
                w: 380,
                h: 75,
                material: 'stone'
            },
            {
                x: 1316,
                y: 710,
                w: 380,
                h: 75,
                material: 'stone'
            },
            {
                x: 580,
                y: 720,
                w: 590,
                h: 36,
                material: 'stone'
            },
            {
                x: 750,
                y: 450,
                w: 250,
                h: 28,
                material: 'wood',
                oneWay: true
            },
            {
                x: 260,
                y: 460,
                w: 220,
                h: 26,
                material: 'wood',
                oneWay: true
            },
            {
                x: 1270,
                y: 460,
                w: 220,
                h: 26,
                material: 'wood',
                oneWay: true
            }
        ],
        blueFlag: {
            x: 180,
            y: 675
        },
        redFlag: {
            x: 1570,
            y: 675
        },
        blueSpawns: [
            {
                x: 160,
                y: 650
            },
            {
                x: 260,
                y: 650
            }
        ],
        redSpawns: [
            {
                x: 1590,
                y: 650
            },
            {
                x: 1490,
                y: 650
            }
        ],
        pads: [
            {
                x: 875,
                y: 420,
                kind: 'weapon',
                weaponPool: [
                    'spas12',
                    'aa12',
                    'uzi'
                ],
                respawnSec: 14
            },
            {
                x: 875,
                y: 685,
                kind: 'health',
                respawnSec: 14
            },
            {
                x: 875,
                y: 950,
                kind: 'weapon',
                weaponPool: [
                    'machete',
                    'sawed_off',
                    'riot_shield'
                ],
                respawnSec: 14
            },
            {
                x: 370,
                y: 430,
                kind: 'weapon',
                weaponPool: [
                    'uzi',
                    'tec9',
                    'mp5'
                ],
                respawnSec: 12
            },
            {
                x: 1380,
                y: 430,
                kind: 'weapon',
                weaponPool: [
                    'uzi',
                    'tec9',
                    'mp5'
                ],
                respawnSec: 12
            }
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
            {
                x: 54,
                y: 440,
                w: 720,
                h: 52,
                material: 'stone'
            },
            {
                x: 1626,
                y: 440,
                w: 720,
                h: 52,
                material: 'stone'
            },
            // Mid walls carving 4 tunnels
            {
                x: 54,
                y: 920,
                w: 680,
                h: 56,
                material: 'stone'
            },
            {
                x: 1666,
                y: 920,
                w: 680,
                h: 56,
                material: 'stone'
            },
            {
                x: 740,
                y: 260,
                w: 54,
                h: 360,
                material: 'stone'
            },
            {
                x: 1606,
                y: 260,
                w: 54,
                h: 360,
                material: 'stone'
            },
            {
                x: 740,
                y: 840,
                w: 54,
                h: 380,
                material: 'stone'
            },
            {
                x: 1606,
                y: 840,
                w: 54,
                h: 380,
                material: 'stone'
            },
            // Central Saw Gun pedestal & upper bridge
            {
                x: 1020,
                y: 740,
                w: 360,
                h: 40,
                material: 'stone'
            },
            {
                x: 1060,
                y: 420,
                w: 280,
                h: 28,
                material: 'wood',
                oneWay: true
            },
            {
                x: 1060,
                y: 1080,
                w: 280,
                h: 28,
                material: 'wood',
                oneWay: true
            }
        ],
        blueFlag: {
            x: 260,
            y: 880
        },
        redFlag: {
            x: 2140,
            y: 880
        },
        siteA: {
            x: 1200,
            y: 700
        },
        siteB: {
            x: 1200,
            y: 1360
        },
        pads: [
            {
                x: 1200,
                y: 700,
                kind: 'weapon',
                weaponPool: [
                    'saw_gun'
                ],
                respawnSec: 16
            },
            {
                x: 1200,
                y: 390,
                kind: 'weapon',
                weaponPool: [
                    'flamethrower',
                    'spas12'
                ],
                respawnSec: 18
            },
            {
                x: 350,
                y: 405,
                kind: 'weapon',
                weaponPool: [
                    'ak47',
                    'mp5',
                    'sawed_off'
                ],
                respawnSec: 15
            },
            {
                x: 2050,
                y: 405,
                kind: 'weapon',
                weaponPool: [
                    'm4',
                    'mp5',
                    'sawed_off'
                ],
                respawnSec: 15
            },
            {
                x: 1200,
                y: 1045,
                kind: 'health',
                respawnSec: 16
            },
            {
                x: 400,
                y: 1360,
                kind: 'boost',
                respawnSec: 22
            },
            {
                x: 2000,
                y: 1360,
                kind: 'ammo',
                respawnSec: 14
            }
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
            {
                x: 740,
                y: 260,
                w: 44,
                h: 420,
                material: 'metal'
            },
            {
                x: 1316,
                y: 260,
                w: 44,
                h: 420,
                material: 'metal'
            },
            {
                x: 740,
                y: 860,
                w: 44,
                h: 460,
                material: 'metal'
            },
            {
                x: 1316,
                y: 860,
                w: 44,
                h: 460,
                material: 'metal'
            },
            // Multi-story tower floors
            {
                x: 784,
                y: 360,
                w: 532,
                h: 28,
                material: 'metal',
                oneWay: true
            },
            {
                x: 784,
                y: 660,
                w: 532,
                h: 32,
                material: 'hazard'
            },
            {
                x: 784,
                y: 980,
                w: 532,
                h: 28,
                material: 'metal',
                oneWay: true
            },
            {
                x: 784,
                y: 1300,
                w: 532,
                h: 36,
                material: 'metal'
            },
            // Outer sky balconies
            {
                x: 220,
                y: 520,
                w: 320,
                h: 28,
                material: 'metal',
                oneWay: true
            },
            {
                x: 1560,
                y: 520,
                w: 320,
                h: 28,
                material: 'metal',
                oneWay: true
            },
            {
                x: 220,
                y: 1020,
                w: 340,
                h: 36,
                material: 'stone'
            },
            {
                x: 1540,
                y: 1020,
                w: 340,
                h: 36,
                material: 'stone'
            }
        ],
        blueFlag: {
            x: 320,
            y: 980
        },
        redFlag: {
            x: 1780,
            y: 980
        },
        blueSpawns: [
            {
                x: 280,
                y: 960
            },
            {
                x: 240,
                y: 1560
            }
        ],
        redSpawns: [
            {
                x: 1820,
                y: 960
            },
            {
                x: 1860,
                y: 1560
            }
        ],
        pads: [
            {
                x: 1050,
                y: 325,
                kind: 'weapon',
                weaponPool: [
                    'm93ba',
                    'smaw'
                ],
                respawnSec: 18
            },
            {
                x: 1050,
                y: 625,
                kind: 'weapon',
                weaponPool: [
                    'minigun',
                    'aa12',
                    'tavor'
                ],
                respawnSec: 18
            },
            {
                x: 1050,
                y: 945,
                kind: 'health',
                respawnSec: 15
            },
            {
                x: 1050,
                y: 1580,
                kind: 'weapon',
                weaponPool: [
                    'flamethrower',
                    'riot_shield'
                ],
                respawnSec: 16
            },
            {
                x: 360,
                y: 485,
                kind: 'weapon',
                weaponPool: [
                    'm14',
                    'm4'
                ],
                respawnSec: 15
            },
            {
                x: 1740,
                y: 485,
                kind: 'weapon',
                weaponPool: [
                    'm14',
                    'ak47'
                ],
                respawnSec: 15
            }
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
            {
                x: 960,
                y: 54,
                w: 46,
                h: 420,
                material: 'metal'
            },
            {
                x: 1194,
                y: 54,
                w: 46,
                h: 420,
                material: 'metal'
            },
            {
                x: 960,
                y: 680,
                w: 46,
                h: 460,
                material: 'metal'
            },
            {
                x: 1194,
                y: 680,
                w: 46,
                h: 460,
                material: 'metal'
            },
            // Left rooms
            {
                x: 54,
                y: 460,
                w: 680,
                h: 38,
                material: 'metal'
            },
            {
                x: 260,
                y: 880,
                w: 700,
                h: 38,
                material: 'metal'
            },
            {
                x: 460,
                y: 498,
                w: 38,
                h: 230,
                material: 'metal'
            },
            // Right rooms
            {
                x: 1466,
                y: 460,
                w: 680,
                h: 38,
                material: 'metal'
            },
            {
                x: 1240,
                y: 880,
                w: 700,
                h: 38,
                material: 'metal'
            },
            {
                x: 1702,
                y: 498,
                w: 38,
                h: 230,
                material: 'metal'
            },
            // Mid catwalk inside shaft
            {
                x: 1006,
                y: 660,
                w: 188,
                h: 24,
                material: 'hazard',
                oneWay: true
            }
        ],
        pads: [
            {
                x: 1100,
                y: 625,
                kind: 'weapon',
                weaponPool: [
                    'spas12',
                    'aa12',
                    'saw_gun'
                ],
                respawnSec: 16
            },
            {
                x: 1100,
                y: 1280,
                kind: 'health',
                respawnSec: 14
            },
            {
                x: 280,
                y: 420,
                kind: 'weapon',
                weaponPool: [
                    'uzi',
                    'mp5',
                    'm4'
                ],
                respawnSec: 14
            },
            {
                x: 1920,
                y: 420,
                kind: 'weapon',
                weaponPool: [
                    'uzi',
                    'mp5',
                    'ak47'
                ],
                respawnSec: 14
            },
            {
                x: 640,
                y: 840,
                kind: 'ammo',
                respawnSec: 15
            },
            {
                x: 1560,
                y: 840,
                kind: 'boost',
                respawnSec: 22
            }
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
            {
                x: 54,
                y: 360,
                w: 740,
                h: 160,
                material: 'stone'
            },
            {
                x: 1456,
                y: 360,
                w: 740,
                h: 160,
                material: 'stone'
            },
            {
                x: 930,
                y: 320,
                w: 390,
                h: 36,
                material: 'stone'
            },
            // Mid cavern platforms
            {
                x: 520,
                y: 840,
                w: 360,
                h: 30,
                material: 'wood',
                oneWay: true
            },
            {
                x: 1370,
                y: 840,
                w: 360,
                h: 30,
                material: 'wood',
                oneWay: true
            },
            {
                x: 960,
                y: 980,
                w: 330,
                h: 42,
                material: 'stone'
            }
        ],
        pads: [
            {
                x: 1125,
                y: 285,
                kind: 'weapon',
                weaponPool: [
                    'smaw',
                    'mortar',
                    'minigun'
                ],
                respawnSec: 18
            },
            {
                x: 1125,
                y: 940,
                kind: 'weapon',
                weaponPool: [
                    'flamethrower',
                    'spas12',
                    'riot_shield'
                ],
                respawnSec: 16
            },
            {
                x: 700,
                y: 805,
                kind: 'health',
                respawnSec: 15
            },
            {
                x: 1550,
                y: 805,
                kind: 'ammo',
                respawnSec: 15
            },
            {
                x: 1125,
                y: 1200,
                kind: 'boost',
                respawnSec: 22
            }
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
            {
                x: 54,
                y: 820,
                w: 540,
                h: 90,
                material: 'ice'
            },
            {
                x: 1856,
                y: 820,
                w: 540,
                h: 90,
                material: 'ice'
            },
            {
                x: 740,
                y: 600,
                w: 380,
                h: 36,
                material: 'ice'
            },
            {
                x: 1330,
                y: 600,
                w: 380,
                h: 36,
                material: 'ice'
            },
            {
                x: 980,
                y: 980,
                w: 490,
                h: 42,
                material: 'stone'
            },
            {
                x: 1090,
                y: 360,
                w: 270,
                h: 28,
                material: 'metal',
                oneWay: true
            }
        ],
        pads: [
            {
                x: 1225,
                y: 325,
                kind: 'weapon',
                weaponPool: [
                    'm93ba',
                    'hunting_rifle'
                ],
                respawnSec: 18
            },
            {
                x: 920,
                y: 565,
                kind: 'weapon',
                weaponPool: [
                    'tavor',
                    'm4',
                    'm14'
                ],
                respawnSec: 15
            },
            {
                x: 1530,
                y: 565,
                kind: 'weapon',
                weaponPool: [
                    'ak47',
                    'mp5',
                    'm14'
                ],
                respawnSec: 15
            },
            {
                x: 1225,
                y: 940,
                kind: 'health',
                respawnSec: 15
            },
            {
                x: 1225,
                y: 1220,
                kind: 'weapon',
                weaponPool: [
                    'smaw',
                    'flamethrower'
                ],
                respawnSec: 18
            }
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
            {
                x: 260,
                y: 940,
                w: 460,
                h: 42,
                material: 'metal'
            },
            {
                x: 1730,
                y: 940,
                w: 460,
                h: 42,
                material: 'metal'
            },
            {
                x: 880,
                y: 740,
                w: 690,
                h: 34,
                material: 'hazard'
            },
            {
                x: 420,
                y: 500,
                w: 340,
                h: 28,
                material: 'metal',
                oneWay: true
            },
            {
                x: 1690,
                y: 500,
                w: 340,
                h: 28,
                material: 'metal',
                oneWay: true
            },
            {
                x: 1080,
                y: 340,
                w: 290,
                h: 28,
                material: 'metal',
                oneWay: true
            },
            {
                x: 1080,
                y: 1120,
                w: 290,
                h: 36,
                material: 'stone'
            }
        ],
        pads: [
            {
                x: 1225,
                y: 700,
                kind: 'weapon',
                weaponPool: [
                    'phasr'
                ],
                respawnSec: 15
            },
            {
                x: 1225,
                y: 305,
                kind: 'weapon',
                weaponPool: [
                    'm93ba',
                    'phasr'
                ],
                respawnSec: 17
            },
            {
                x: 590,
                y: 465,
                kind: 'weapon',
                weaponPool: [
                    'emp_gun',
                    'm14'
                ],
                respawnSec: 15
            },
            {
                x: 1860,
                y: 465,
                kind: 'weapon',
                weaponPool: [
                    'emp_gun',
                    'smaw'
                ],
                respawnSec: 15
            },
            {
                x: 1225,
                y: 1080,
                kind: 'health',
                respawnSec: 15
            },
            {
                x: 490,
                y: 900,
                kind: 'boost',
                respawnSec: 20
            }
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
            {
                x: 420,
                y: 1020,
                w: 440,
                h: 42,
                material: 'sand'
            },
            {
                x: 1540,
                y: 1020,
                w: 440,
                h: 42,
                material: 'sand'
            },
            {
                x: 640,
                y: 740,
                w: 380,
                h: 42,
                material: 'sand'
            },
            {
                x: 1380,
                y: 740,
                w: 380,
                h: 42,
                material: 'sand'
            },
            {
                x: 880,
                y: 460,
                w: 640,
                h: 42,
                material: 'sand'
            },
            {
                x: 1080,
                y: 260,
                w: 240,
                h: 32,
                material: 'sand'
            },
            // Inner burial chamber walls
            {
                x: 1020,
                y: 920,
                w: 360,
                h: 36,
                material: 'sand'
            },
            {
                x: 960,
                y: 660,
                w: 48,
                h: 260,
                material: 'sand'
            },
            {
                x: 1392,
                y: 660,
                w: 48,
                h: 260,
                material: 'sand'
            }
        ],
        pads: [
            {
                x: 1200,
                y: 885,
                kind: 'weapon',
                weaponPool: [
                    'minigun',
                    'smaw',
                    'saw_gun'
                ],
                respawnSec: 18
            },
            {
                x: 1200,
                y: 225,
                kind: 'weapon',
                weaponPool: [
                    'm93ba',
                    'golden_eagle'
                ],
                respawnSec: 18
            },
            {
                x: 1200,
                y: 425,
                kind: 'health',
                respawnSec: 16
            },
            {
                x: 620,
                y: 985,
                kind: 'weapon',
                weaponPool: [
                    'ak47',
                    'spas12'
                ],
                respawnSec: 15
            },
            {
                x: 1780,
                y: 985,
                kind: 'weapon',
                weaponPool: [
                    'tavor',
                    'aa12'
                ],
                respawnSec: 15
            },
            {
                x: 1200,
                y: 1320,
                kind: 'boost',
                respawnSec: 22
            }
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
            {
                x: 380,
                y: 360,
                w: 540,
                h: 36,
                material: 'metal'
            },
            {
                x: 1230,
                y: 360,
                w: 540,
                h: 36,
                material: 'metal'
            },
            {
                x: 380,
                y: 740,
                w: 540,
                h: 36,
                material: 'hazard'
            },
            {
                x: 1230,
                y: 740,
                w: 540,
                h: 36,
                material: 'hazard'
            },
            {
                x: 380,
                y: 1100,
                w: 540,
                h: 36,
                material: 'metal'
            },
            {
                x: 1230,
                y: 1100,
                w: 540,
                h: 36,
                material: 'metal'
            },
            {
                x: 380,
                y: 360,
                w: 36,
                h: 380,
                material: 'metal'
            },
            {
                x: 1734,
                y: 360,
                w: 36,
                h: 380,
                material: 'metal'
            },
            {
                x: 960,
                y: 540,
                w: 230,
                h: 28,
                material: 'metal',
                oneWay: true
            },
            {
                x: 960,
                y: 920,
                w: 230,
                h: 28,
                material: 'metal',
                oneWay: true
            }
        ],
        pads: [
            {
                x: 1075,
                y: 505,
                kind: 'weapon',
                weaponPool: [
                    'aa12',
                    'flamethrower',
                    'saw_gun'
                ],
                respawnSec: 16
            },
            {
                x: 1075,
                y: 885,
                kind: 'health',
                respawnSec: 14
            },
            {
                x: 640,
                y: 705,
                kind: 'weapon',
                weaponPool: [
                    'uzi',
                    'mp5',
                    'm4'
                ],
                respawnSec: 14
            },
            {
                x: 1510,
                y: 705,
                kind: 'weapon',
                weaponPool: [
                    'uzi',
                    'mp5',
                    'ak47'
                ],
                respawnSec: 14
            },
            {
                x: 1075,
                y: 1360,
                kind: 'weapon',
                weaponPool: [
                    'smaw',
                    'mortar'
                ],
                respawnSec: 18
            }
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
            {
                x: 54,
                y: 560,
                w: 420,
                h: 42,
                material: 'metal'
            },
            {
                x: 54,
                y: 920,
                w: 420,
                h: 42,
                material: 'stone'
            },
            // Center tower
            {
                x: 1040,
                y: 420,
                w: 420,
                h: 36,
                material: 'hazard'
            },
            {
                x: 1040,
                y: 860,
                w: 420,
                h: 42,
                material: 'metal'
            },
            // Right tower
            {
                x: 2026,
                y: 560,
                w: 420,
                h: 42,
                material: 'metal'
            },
            {
                x: 2026,
                y: 920,
                w: 420,
                h: 42,
                material: 'stone'
            },
            // High & low suspension bridge catwalks
            {
                x: 474,
                y: 580,
                w: 566,
                h: 22,
                material: 'metal',
                oneWay: true
            },
            {
                x: 1460,
                y: 580,
                w: 566,
                h: 22,
                material: 'metal',
                oneWay: true
            },
            {
                x: 474,
                y: 940,
                w: 566,
                h: 22,
                material: 'wood',
                oneWay: true
            },
            {
                x: 1460,
                y: 940,
                w: 566,
                h: 22,
                material: 'wood',
                oneWay: true
            }
        ],
        pads: [
            {
                x: 1250,
                y: 385,
                kind: 'weapon',
                weaponPool: [
                    'm93ba',
                    'smaw',
                    'phasr'
                ],
                respawnSec: 18
            },
            {
                x: 1250,
                y: 825,
                kind: 'health',
                respawnSec: 15
            },
            {
                x: 750,
                y: 545,
                kind: 'weapon',
                weaponPool: [
                    'm4',
                    'tavor'
                ],
                respawnSec: 14
            },
            {
                x: 1750,
                y: 545,
                kind: 'weapon',
                weaponPool: [
                    'ak47',
                    'm14'
                ],
                respawnSec: 14
            },
            {
                x: 1250,
                y: 1160,
                kind: 'boost',
                respawnSec: 20
            }
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
            {
                x: 220,
                y: 420,
                w: 460,
                h: 34,
                material: 'metal'
            },
            {
                x: 1620,
                y: 420,
                w: 460,
                h: 34,
                material: 'metal'
            },
            {
                x: 220,
                y: 900,
                w: 460,
                h: 34,
                material: 'metal'
            },
            {
                x: 1620,
                y: 900,
                w: 460,
                h: 34,
                material: 'metal'
            },
            {
                x: 960,
                y: 650,
                w: 380,
                h: 38,
                material: 'hazard'
            },
            {
                x: 1130,
                y: 340,
                w: 40,
                h: 210,
                material: 'metal'
            },
            {
                x: 1130,
                y: 790,
                w: 40,
                h: 210,
                material: 'metal'
            }
        ],
        pads: [
            {
                x: 1150,
                y: 615,
                kind: 'weapon',
                weaponPool: [
                    'smaw',
                    'minigun',
                    'm93ba'
                ],
                respawnSec: 18
            },
            {
                x: 450,
                y: 385,
                kind: 'weapon',
                weaponPool: [
                    'm14',
                    'm4'
                ],
                respawnSec: 15
            },
            {
                x: 1850,
                y: 385,
                kind: 'weapon',
                weaponPool: [
                    'm14',
                    'ak47'
                ],
                respawnSec: 15
            },
            {
                x: 450,
                y: 865,
                kind: 'health',
                respawnSec: 15
            },
            {
                x: 1850,
                y: 865,
                kind: 'health',
                respawnSec: 15
            }
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
            {
                x: 420,
                y: 760,
                w: 320,
                h: 40,
                material: 'stone'
            },
            {
                x: 980,
                y: 600,
                w: 340,
                h: 36,
                material: 'wood',
                oneWay: true
            },
            {
                x: 1480,
                y: 760,
                w: 360,
                h: 42,
                material: 'stone'
            },
            {
                x: 1980,
                y: 600,
                w: 340,
                h: 36,
                material: 'wood',
                oneWay: true
            },
            {
                x: 2420,
                y: 760,
                w: 320,
                h: 40,
                material: 'stone'
            },
            {
                x: 1560,
                y: 390,
                w: 200,
                h: 26,
                material: 'metal',
                oneWay: true
            }
        ],
        pads: [
            {
                x: 1660,
                y: 355,
                kind: 'weapon',
                weaponPool: [
                    'm93ba',
                    'hunting_rifle'
                ],
                respawnSec: 18
            },
            {
                x: 1660,
                y: 725,
                kind: 'health',
                respawnSec: 15
            },
            {
                x: 580,
                y: 725,
                kind: 'weapon',
                weaponPool: [
                    'm4',
                    'tavor'
                ],
                respawnSec: 14
            },
            {
                x: 2580,
                y: 725,
                kind: 'weapon',
                weaponPool: [
                    'ak47',
                    'tavor'
                ],
                respawnSec: 14
            },
            {
                x: 1150,
                y: 565,
                kind: 'boost',
                respawnSec: 20
            },
            {
                x: 2150,
                y: 565,
                kind: 'weapon',
                weaponPool: [
                    'smaw',
                    'mortar'
                ],
                respawnSec: 18
            }
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
            {
                x: 54,
                y: 1080,
                w: 520,
                h: 120,
                material: 'stone'
            },
            {
                x: 1676,
                y: 1080,
                w: 520,
                h: 120,
                material: 'stone'
            },
            {
                x: 820,
                y: 1020,
                w: 610,
                h: 72,
                material: 'stone'
            },
            {
                x: 320,
                y: 700,
                w: 420,
                h: 42,
                material: 'stone'
            },
            {
                x: 1510,
                y: 700,
                w: 420,
                h: 42,
                material: 'stone'
            },
            {
                x: 930,
                y: 460,
                w: 390,
                h: 32,
                material: 'wood',
                oneWay: true
            }
        ],
        blueFlag: {
            x: 240,
            y: 1040
        },
        redFlag: {
            x: 2010,
            y: 1040
        },
        blueSpawns: [
            {
                x: 220,
                y: 1010
            },
            {
                x: 360,
                y: 1010
            },
            {
                x: 420,
                y: 640
            }
        ],
        redSpawns: [
            {
                x: 2030,
                y: 1010
            },
            {
                x: 1890,
                y: 1010
            },
            {
                x: 1830,
                y: 640
            }
        ],
        pads: [
            {
                x: 1125,
                y: 425,
                kind: 'weapon',
                weaponPool: [
                    'm93ba',
                    'emp_gun',
                    'smaw'
                ],
                respawnSec: 18
            },
            {
                x: 1125,
                y: 985,
                kind: 'health',
                respawnSec: 15
            },
            {
                x: 530,
                y: 665,
                kind: 'weapon',
                weaponPool: [
                    'spas12',
                    'm4'
                ],
                respawnSec: 15
            },
            {
                x: 1720,
                y: 665,
                kind: 'weapon',
                weaponPool: [
                    'spas12',
                    'ak47'
                ],
                respawnSec: 15
            }
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
            {
                x: 54,
                y: 480,
                w: 620,
                h: 44,
                material: 'stone'
            },
            {
                x: 920,
                y: 480,
                w: 460,
                h: 44,
                material: 'stone'
            },
            {
                x: 1626,
                y: 480,
                w: 620,
                h: 44,
                material: 'stone'
            },
            {
                x: 300,
                y: 920,
                w: 720,
                h: 44,
                material: 'stone'
            },
            {
                x: 1280,
                y: 920,
                w: 720,
                h: 44,
                material: 'stone'
            },
            {
                x: 674,
                y: 680,
                w: 246,
                h: 24,
                material: 'wood',
                oneWay: true
            },
            {
                x: 1380,
                y: 680,
                w: 246,
                h: 24,
                material: 'wood',
                oneWay: true
            }
        ],
        pads: [
            {
                x: 1150,
                y: 445,
                kind: 'weapon',
                weaponPool: [
                    'flamethrower',
                    'saw_gun'
                ],
                respawnSec: 17
            },
            {
                x: 1150,
                y: 1320,
                kind: 'weapon',
                weaponPool: [
                    'aa12',
                    'spas12',
                    'riot_shield'
                ],
                respawnSec: 16
            },
            {
                x: 790,
                y: 645,
                kind: 'health',
                respawnSec: 15
            },
            {
                x: 1500,
                y: 645,
                kind: 'ammo',
                respawnSec: 15
            },
            {
                x: 640,
                y: 885,
                kind: 'weapon',
                weaponPool: [
                    'uzi',
                    'mp5'
                ],
                respawnSec: 14
            },
            {
                x: 1660,
                y: 885,
                kind: 'weapon',
                weaponPool: [
                    'uzi',
                    'tec9'
                ],
                respawnSec: 14
            }
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
            {
                x: 280,
                y: 960,
                w: 380,
                h: 86,
                material: 'hazard'
            },
            {
                x: 960,
                y: 880,
                w: 430,
                h: 92,
                material: 'metal'
            },
            {
                x: 1690,
                y: 960,
                w: 380,
                h: 86,
                material: 'hazard'
            },
            {
                x: 520,
                y: 620,
                w: 320,
                h: 34,
                material: 'metal',
                oneWay: true
            },
            {
                x: 1510,
                y: 620,
                w: 320,
                h: 34,
                material: 'metal',
                oneWay: true
            },
            {
                x: 990,
                y: 400,
                w: 370,
                h: 30,
                material: 'hazard',
                oneWay: true
            }
        ],
        pads: [
            {
                x: 1175,
                y: 365,
                kind: 'weapon',
                weaponPool: [
                    'minigun',
                    'smaw',
                    'mortar'
                ],
                respawnSec: 18
            },
            {
                x: 1175,
                y: 845,
                kind: 'weapon',
                weaponPool: [
                    'saw_gun',
                    'spas12',
                    'ak47'
                ],
                respawnSec: 16
            },
            {
                x: 680,
                y: 585,
                kind: 'health',
                respawnSec: 15
            },
            {
                x: 1670,
                y: 585,
                kind: 'boost',
                respawnSec: 20
            }
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
            {
                x: 54,
                y: 560,
                w: 480,
                h: 42,
                material: 'ice'
            },
            {
                x: 1416,
                y: 560,
                w: 480,
                h: 42,
                material: 'ice'
            },
            {
                x: 740,
                y: 740,
                w: 470,
                h: 38,
                material: 'ice'
            },
            {
                x: 790,
                y: 380,
                w: 370,
                h: 30,
                material: 'metal',
                oneWay: true
            }
        ],
        pads: [
            {
                x: 975,
                y: 345,
                kind: 'weapon',
                weaponPool: [
                    'phasr',
                    'm14',
                    'tavor'
                ],
                respawnSec: 16
            },
            {
                x: 975,
                y: 705,
                kind: 'weapon',
                weaponPool: [
                    'aa12',
                    'uzi',
                    'flamethrower'
                ],
                respawnSec: 15
            },
            {
                x: 975,
                y: 1080,
                kind: 'health',
                respawnSec: 14
            },
            {
                x: 280,
                y: 525,
                kind: 'ammo',
                respawnSec: 14
            },
            {
                x: 1670,
                y: 525,
                kind: 'boost',
                respawnSec: 20
            }
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
            {
                x: 440,
                y: 660,
                w: 150,
                h: 646,
                material: 'sand'
            },
            {
                x: 1810,
                y: 660,
                w: 150,
                h: 646,
                material: 'sand'
            },
            {
                x: 980,
                y: 540,
                w: 440,
                h: 42,
                material: 'sand'
            },
            {
                x: 920,
                y: 940,
                w: 560,
                h: 38,
                material: 'wood',
                oneWay: true
            },
            {
                x: 54,
                y: 780,
                w: 280,
                h: 34,
                material: 'sand'
            },
            {
                x: 2066,
                y: 780,
                w: 280,
                h: 34,
                material: 'sand'
            }
        ],
        pads: [
            {
                x: 1200,
                y: 505,
                kind: 'weapon',
                weaponPool: [
                    'm93ba',
                    'smaw'
                ],
                respawnSec: 18
            },
            {
                x: 515,
                y: 625,
                kind: 'weapon',
                weaponPool: [
                    'm14',
                    'm4'
                ],
                respawnSec: 15
            },
            {
                x: 1885,
                y: 625,
                kind: 'weapon',
                weaponPool: [
                    'hunting_rifle',
                    'ak47'
                ],
                respawnSec: 15
            },
            {
                x: 1200,
                y: 905,
                kind: 'health',
                respawnSec: 15
            },
            {
                x: 1200,
                y: 1260,
                kind: 'weapon',
                weaponPool: [
                    'saw_gun',
                    'spas12'
                ],
                respawnSec: 16
            }
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
            {
                x: 54,
                y: 540,
                w: 420,
                h: 40,
                material: 'stone'
            },
            {
                x: 434,
                y: 540,
                w: 40,
                h: 420,
                material: 'stone'
            },
            {
                x: 54,
                y: 920,
                w: 380,
                h: 32,
                material: 'metal',
                oneWay: true
            },
            // Right citadel
            {
                x: 1976,
                y: 540,
                w: 420,
                h: 40,
                material: 'stone'
            },
            {
                x: 1976,
                y: 540,
                w: 40,
                h: 420,
                material: 'stone'
            },
            {
                x: 2016,
                y: 920,
                w: 380,
                h: 32,
                material: 'metal',
                oneWay: true
            },
            // Central courtyard & upper arch
            {
                x: 940,
                y: 840,
                w: 570,
                h: 44,
                material: 'stone'
            },
            {
                x: 1040,
                y: 480,
                w: 370,
                h: 34,
                material: 'hazard'
            }
        ],
        blueFlag: {
            x: 210,
            y: 885
        },
        redFlag: {
            x: 2240,
            y: 885
        },
        siteA: {
            x: 1225,
            y: 800
        },
        siteB: {
            x: 1225,
            y: 445
        },
        pads: [
            {
                x: 1225,
                y: 445,
                kind: 'weapon',
                weaponPool: [
                    'smaw',
                    'm93ba',
                    'minigun'
                ],
                respawnSec: 18
            },
            {
                x: 1225,
                y: 805,
                kind: 'health',
                respawnSec: 15
            },
            {
                x: 260,
                y: 505,
                kind: 'weapon',
                weaponPool: [
                    'm4',
                    'riot_shield'
                ],
                respawnSec: 15
            },
            {
                x: 2190,
                y: 505,
                kind: 'weapon',
                weaponPool: [
                    'ak47',
                    'riot_shield'
                ],
                respawnSec: 15
            },
            {
                x: 1225,
                y: 1240,
                kind: 'boost',
                respawnSec: 22
            }
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
            {
                x: 280,
                y: 740,
                w: 340,
                h: 32,
                material: 'metal'
            },
            {
                x: 1280,
                y: 740,
                w: 340,
                h: 32,
                material: 'metal'
            },
            {
                x: 760,
                y: 540,
                w: 380,
                h: 32,
                material: 'hazard'
            },
            {
                x: 460,
                y: 380,
                w: 220,
                h: 24,
                material: 'metal',
                oneWay: true
            },
            {
                x: 1220,
                y: 380,
                w: 220,
                h: 24,
                material: 'metal',
                oneWay: true
            }
        ],
        pads: [
            {
                x: 950,
                y: 505,
                kind: 'weapon',
                weaponPool: [
                    'm4',
                    'ak47',
                    'm14',
                    'spas12'
                ],
                respawnSec: 14
            },
            {
                x: 950,
                y: 1020,
                kind: 'health',
                respawnSec: 14
            },
            {
                x: 570,
                y: 345,
                kind: 'weapon',
                weaponPool: [
                    'uzi',
                    'mp5',
                    'magnum'
                ],
                respawnSec: 12
            },
            {
                x: 1330,
                y: 345,
                kind: 'weapon',
                weaponPool: [
                    'uzi',
                    'mp5',
                    'deagle'
                ],
                respawnSec: 12
            }
        ]
    })
];
var MAP_LOOKUP = new Map(MM_MAPS.map(function(m) {
    return [
        m.id,
        m
    ];
}));
function getMmMapById(id) {
    var _MAP_LOOKUP_get;
    return (_MAP_LOOKUP_get = MAP_LOOKUP.get(id)) != null ? _MAP_LOOKUP_get : MM_MAPS[0];
}

});
// === MODULE: src/games/mini-militia/data/progression ===
ArcadeMod.define("src/games/mini-militia/data/progression", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get MM_ACHIEVEMENTS () {
        return MM_ACHIEVEMENTS;
    },
    get MM_BOOTS () {
        return MM_BOOTS;
    },
    get MM_BOT_NAMES () {
        return MM_BOT_NAMES;
    },
    get MM_EYEWEAR () {
        return MM_EYEWEAR;
    },
    get MM_EYE_STYLES () {
        return MM_EYE_STYLES;
    },
    get MM_FACIAL () {
        return MM_FACIAL;
    },
    get MM_HEADGEAR () {
        return MM_HEADGEAR;
    },
    get MM_OUTFITS () {
        return MM_OUTFITS;
    },
    get MM_QUICK_CHATS () {
        return MM_QUICK_CHATS;
    },
    get MM_RANKS () {
        return MM_RANKS;
    },
    get MM_SARGE_AVATAR () {
        return MM_SARGE_AVATAR;
    },
    get MM_SIMULATED_ONLINE_ROOMS () {
        return MM_SIMULATED_ONLINE_ROOMS;
    },
    get MM_SKIN_TONES () {
        return MM_SKIN_TONES;
    },
    get getMmRankForXp () {
        return getMmRankForXp;
    },
    get makeRandomAvatar () {
        return makeRandomAvatar;
    }
});
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _create_for_of_iterator_helper_loose(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (it) return (it = it.call(o)).next.bind(it);
    if (Array.isArray(o) || (it = _unsupported_iterable_to_array(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        return function() {
            if (i >= o.length) return {
                done: true
            };
            return {
                done: false,
                value: o[i++]
            };
        };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var MM_RANKS = [
    {
        index: 0,
        title: 'Private',
        xpRequired: 0,
        discountPct: 0,
        insigniaType: 'chevron',
        tierCount: 1,
        color: '#A3A3A3'
    },
    {
        index: 1,
        title: 'Private First Class',
        xpRequired: 1000,
        discountPct: 0,
        insigniaType: 'chevron',
        tierCount: 2,
        color: '#D4D4D8'
    },
    {
        index: 2,
        title: 'Corporal',
        xpRequired: 2500,
        discountPct: 2,
        insigniaType: 'chevron',
        tierCount: 2,
        color: '#84CC16'
    },
    {
        index: 3,
        title: 'Sergeant',
        xpRequired: 5000,
        discountPct: 4,
        insigniaType: 'chevron',
        tierCount: 3,
        color: '#84CC16'
    },
    {
        index: 4,
        title: 'Staff Sergeant',
        xpRequired: 8500,
        discountPct: 5,
        insigniaType: 'chevron',
        tierCount: 3,
        color: '#22C55E'
    },
    {
        index: 5,
        title: 'Sergeant 1st Class',
        xpRequired: 13000,
        discountPct: 6,
        insigniaType: 'chevron',
        tierCount: 4,
        color: '#10B981'
    },
    {
        index: 6,
        title: 'Master Sergeant',
        xpRequired: 18500,
        discountPct: 7,
        insigniaType: 'chevron',
        tierCount: 4,
        color: '#14B8A6'
    },
    {
        index: 7,
        title: 'First Sergeant',
        xpRequired: 25000,
        discountPct: 8,
        insigniaType: 'chevron',
        tierCount: 5,
        color: '#06B6D4'
    },
    {
        index: 8,
        title: 'Sergeant Major',
        xpRequired: 33000,
        discountPct: 9,
        insigniaType: 'chevron',
        tierCount: 5,
        color: '#38BDF8'
    },
    {
        index: 9,
        title: '2nd Lieutenant',
        xpRequired: 42000,
        discountPct: 10,
        insigniaType: 'bar',
        tierCount: 1,
        color: '#FACC15'
    },
    {
        index: 10,
        title: '1st Lieutenant',
        xpRequired: 53000,
        discountPct: 11,
        insigniaType: 'bar',
        tierCount: 1,
        color: '#E2E8F0'
    },
    {
        index: 11,
        title: 'Captain',
        xpRequired: 66000,
        discountPct: 12,
        insigniaType: 'bar',
        tierCount: 2,
        color: '#E2E8F0'
    },
    {
        index: 12,
        title: 'Major',
        xpRequired: 82000,
        discountPct: 13,
        insigniaType: 'leaf',
        tierCount: 1,
        color: '#F59E0B'
    },
    {
        index: 13,
        title: 'Lieutenant Colonel',
        xpRequired: 100000,
        discountPct: 14,
        insigniaType: 'leaf',
        tierCount: 1,
        color: '#CBD5E1'
    },
    {
        index: 14,
        title: 'Colonel',
        xpRequired: 125000,
        discountPct: 15,
        insigniaType: 'eagle',
        tierCount: 1,
        color: '#F8FAFC'
    },
    {
        index: 15,
        title: 'Brigadier General',
        xpRequired: 155000,
        discountPct: 16,
        insigniaType: 'star',
        tierCount: 1,
        color: '#FDE047'
    },
    {
        index: 16,
        title: 'Major General',
        xpRequired: 190000,
        discountPct: 17,
        insigniaType: 'star',
        tierCount: 2,
        color: '#FDE047'
    },
    {
        index: 17,
        title: 'Lieutenant General',
        xpRequired: 235000,
        discountPct: 18,
        insigniaType: 'star',
        tierCount: 3,
        color: '#FACC15'
    },
    {
        index: 18,
        title: 'General',
        xpRequired: 290000,
        discountPct: 20,
        insigniaType: 'star',
        tierCount: 4,
        color: '#F59E0B'
    },
    {
        index: 19,
        title: 'General of the Army',
        xpRequired: 360000,
        discountPct: 22,
        insigniaType: 'star',
        tierCount: 5,
        color: '#FB923C'
    },
    {
        index: 20,
        title: 'Commander-in-Chief',
        xpRequired: 500000,
        discountPct: 25,
        insigniaType: 'commander',
        tierCount: 5,
        color: '#FDE047'
    }
];
function getMmRankForXp(xp) {
    var _MM_RANKS_;
    var current = MM_RANKS[0];
    for(var _iterator = _create_for_of_iterator_helper_loose(MM_RANKS), _step; !(_step = _iterator()).done;){
        var r = _step.value;
        if (xp >= r.xpRequired) current = r;
    }
    var next = (_MM_RANKS_ = MM_RANKS[current.index + 1]) != null ? _MM_RANKS_ : null;
    if (!next) return {
        current: current,
        next: null,
        progressPct: 100
    };
    var span = Math.max(1, next.xpRequired - current.xpRequired);
    var progressPct = Math.min(100, Math.max(0, (xp - current.xpRequired) / span * 100));
    return {
        current: current,
        next: next,
        progressPct: progressPct
    };
}
var MM_ACHIEVEMENTS = [
    {
        id: 'first_blood',
        title: 'First Blood',
        desc: 'Eliminate your first enemy soldier.',
        icon: '🩸',
        rewardCash: 50,
        rewardXp: 250,
        target: 1,
        getProgress: function getProgress(s) {
            return s.stats.kills;
        }
    },
    {
        id: 'boot_camp_grad',
        title: 'Boot Camp Graduate',
        desc: 'Complete Sarge’s 7-step Training course.',
        icon: '🎖️',
        rewardCash: 100,
        rewardXp: 600,
        target: 1,
        getProgress: function getProgress(s) {
            return s.stats.bootcampCompleted ? 1 : 0;
        }
    },
    {
        id: 'veteran_50',
        title: 'Combat Veteran',
        desc: 'Score 50 total career kills.',
        icon: '⚔️',
        rewardCash: 120,
        rewardXp: 800,
        target: 50,
        getProgress: function getProgress(s) {
            return s.stats.kills;
        }
    },
    {
        id: 'warlord_250',
        title: 'Doodle Warlord',
        desc: 'Score 250 total career kills.',
        icon: '💀',
        rewardCash: 300,
        rewardXp: 2500,
        target: 250,
        getProgress: function getProgress(s) {
            return s.stats.kills;
        }
    },
    {
        id: 'sharpshooter',
        title: 'Sharpshooter',
        desc: 'Land 50 Sniper headshots.',
        icon: '🎯',
        rewardCash: 220,
        rewardXp: 1800,
        target: 50,
        getProgress: function getProgress(s) {
            return s.stats.sniperHeadshots;
        }
    },
    {
        id: 'headhunter',
        title: 'Headhunter',
        desc: 'Score 25 headshots with any weapon.',
        icon: '🧠',
        rewardCash: 140,
        rewardXp: 1000,
        target: 25,
        getProgress: function getProgress(s) {
            return s.stats.headshots;
        }
    },
    {
        id: 'butcher',
        title: 'Butcher',
        desc: 'Score 25 Machete kills.',
        icon: '🔪',
        rewardCash: 180,
        rewardXp: 1400,
        target: 25,
        getProgress: function getProgress(s) {
            return s.stats.macheteKills;
        }
    },
    {
        id: 'brawler',
        title: 'Close Quarters',
        desc: 'Score 15 melee kills.',
        icon: '👊',
        rewardCash: 110,
        rewardXp: 850,
        target: 15,
        getProgress: function getProgress(s) {
            return s.stats.meleeKills;
        }
    },
    {
        id: 'rocketman',
        title: 'Rocketman',
        desc: 'Score 25 SMAW Rocket Launcher kills.',
        icon: '🚀',
        rewardCash: 200,
        rewardXp: 1600,
        target: 25,
        getProgress: function getProgress(s) {
            return s.stats.smawKills;
        }
    },
    {
        id: 'pyromaniac',
        title: 'Pyromaniac',
        desc: 'Eliminate 20 enemies with the Flamethrower.',
        icon: '🔥',
        rewardCash: 180,
        rewardXp: 1400,
        target: 20,
        getProgress: function getProgress(s) {
            return s.stats.flameKills;
        }
    },
    {
        id: 'saw_master',
        title: 'Saw Master',
        desc: 'Score 20 Saw Gun kills.',
        icon: '⚙️',
        rewardCash: 220,
        rewardXp: 1700,
        target: 20,
        getProgress: function getProgress(s) {
            return s.stats.sawKills;
        }
    },
    {
        id: 'dual_trouble',
        title: 'Dual Trouble',
        desc: 'Score 30 kills while Dual Wielding.',
        icon: '🔫',
        rewardCash: 160,
        rewardXp: 1200,
        target: 30,
        getProgress: function getProgress(s) {
            return s.stats.dualWieldKills;
        }
    },
    {
        id: 'demolition',
        title: 'Demolition Expert',
        desc: 'Score 20 Grenade or Mine kills.',
        icon: '💣',
        rewardCash: 150,
        rewardXp: 1100,
        target: 20,
        getProgress: function getProgress(s) {
            return s.stats.grenadeKills;
        }
    },
    {
        id: 'survivor_10',
        title: 'Survivor I',
        desc: 'Reach Wave 10 in Survival mode.',
        icon: '🛡️',
        rewardCash: 160,
        rewardXp: 1300,
        target: 10,
        getProgress: function getProgress(s) {
            return s.stats.survivalBestWave;
        }
    },
    {
        id: 'survivor_20',
        title: 'Survivor II',
        desc: 'Reach Wave 20 in Survival mode.',
        icon: '🦅',
        rewardCash: 320,
        rewardXp: 3000,
        target: 20,
        getProgress: function getProgress(s) {
            return s.stats.survivalBestWave;
        }
    },
    {
        id: 'survivor_30',
        title: 'Last Doodle Standing',
        desc: 'Reach Wave 30 in Survival mode.',
        icon: '👑',
        rewardCash: 550,
        rewardXp: 5500,
        target: 30,
        getProgress: function getProgress(s) {
            return s.stats.survivalBestWave;
        }
    },
    {
        id: 'flag_runner',
        title: 'Flag Runner',
        desc: 'Capture 10 Flags in CTF.',
        icon: '🚩',
        rewardCash: 180,
        rewardXp: 1500,
        target: 10,
        getProgress: function getProgress(s) {
            return s.stats.flagCaptures;
        }
    },
    {
        id: 'bomb_squad',
        title: 'Bomb Squad',
        desc: 'Plant or Defuse 10 C4 bombs in PTB.',
        icon: '⏱️',
        rewardCash: 200,
        rewardXp: 1600,
        target: 10,
        getProgress: function getProgress(s) {
            return s.stats.bombActions;
        }
    },
    {
        id: 'untouchable',
        title: 'Untouchable',
        desc: 'Reach a 10-Kill Streak without dying.',
        icon: '⚡',
        rewardCash: 260,
        rewardXp: 2200,
        target: 10,
        getProgress: function getProgress(s) {
            return s.stats.bestKillstreak;
        }
    },
    {
        id: 'rampage',
        title: 'Triple Threat',
        desc: 'Score a Triple Kill or higher multi-kill.',
        icon: '💥',
        rewardCash: 140,
        rewardXp: 1100,
        target: 3,
        getProgress: function getProgress(s) {
            return s.stats.bestMultiKill;
        }
    },
    {
        id: 'victor_10',
        title: 'Squad Leader',
        desc: 'Win 10 matches across any mode.',
        icon: '🏆',
        rewardCash: 180,
        rewardXp: 1500,
        target: 10,
        getProgress: function getProgress(s) {
            return s.stats.wins;
        }
    },
    {
        id: 'officer_rank',
        title: 'Commissioned Officer',
        desc: 'Reach 2nd Lieutenant rank (42,000 XP).',
        icon: '⭐',
        rewardCash: 400,
        rewardXp: 3000,
        target: 42000,
        getProgress: function getProgress(s) {
            return s.xp;
        }
    }
];
var MM_SKIN_TONES = [
    {
        id: '#F7CBA4',
        name: 'Light'
    },
    {
        id: '#E5B285',
        name: 'Warm'
    },
    {
        id: '#C68642',
        name: 'Tan'
    },
    {
        id: '#8D5524',
        name: 'Bronze'
    },
    {
        id: '#5C381B',
        name: 'Deep'
    },
    {
        id: '#9CA3AF',
        name: 'Cyber Bot'
    }
];
var MM_EYE_STYLES = [
    {
        id: 'determined',
        name: 'Determined'
    },
    {
        id: 'angry',
        name: 'Battle Fury'
    },
    {
        id: 'cool',
        name: 'Cool Calm'
    },
    {
        id: 'cyber',
        name: 'Cyber Glow'
    },
    {
        id: 'scarred',
        name: 'Scarred Vet'
    },
    {
        id: 'sarge',
        name: 'Sarge Squint'
    }
];
var MM_HEADGEAR = [
    {
        id: 'army_helmet',
        name: 'Army Helmet',
        costCash: 0
    },
    {
        id: 'bald',
        name: 'Bald',
        costCash: 0
    },
    {
        id: 'buzzcut',
        name: 'Buzzcut',
        costCash: 0
    },
    {
        id: 'spiked_hair',
        name: 'Spiked Hair',
        costCash: 0
    },
    {
        id: 'mohawk',
        name: 'Mohawk',
        costCash: 40
    },
    {
        id: 'red_beret',
        name: 'Red Beret',
        costCash: 50
    },
    {
        id: 'commando_bandana',
        name: 'Commando Bandana',
        costCash: 40
    },
    {
        id: 'swat_helmet',
        name: 'SWAT Helmet',
        costCash: 70
    },
    {
        id: 'pilot_cap',
        name: 'Pilot Aviator',
        costCash: 60
    },
    {
        id: 'viking_helm',
        name: 'Viking Horned',
        costCash: 110
    },
    {
        id: 'ninja_hood',
        name: 'Ninja Hood',
        costCash: 80
    },
    {
        id: 'gas_mask',
        name: 'Gas Mask',
        costCash: 90
    },
    {
        id: 'skull_mask',
        name: 'Skull Mask',
        costCash: 120
    },
    {
        id: 'halo',
        name: 'Golden Halo',
        costCash: 150
    },
    {
        id: 'crown',
        name: 'Royal Crown',
        costCash: 180
    },
    {
        id: 'space_visor',
        name: 'Astronaut Visor',
        costCash: 130
    },
    {
        id: 'cowboy_hat',
        name: 'Cowboy Hat',
        costCash: 85
    },
    {
        id: 'ghillie_hood',
        name: 'Ghillie Hood',
        costCash: 110
    }
];
var MM_EYEWEAR = [
    {
        id: 'none',
        name: 'None',
        costCash: 0
    },
    {
        id: 'aviators',
        name: 'Aviator Shades',
        costCash: 0
    },
    {
        id: 'tactical_goggles',
        name: 'Tactical Goggles',
        costCash: 40
    },
    {
        id: 'nvg',
        name: 'Tri-NVG Goggles',
        costCash: 90
    },
    {
        id: 'cyber_visor',
        name: 'Red Cyber Visor',
        costCash: 85
    },
    {
        id: 'eyepatch',
        name: 'Eyepatch',
        costCash: 50
    },
    {
        id: 'monocle',
        name: 'Gold Monocle',
        costCash: 75
    },
    {
        id: 'ski_goggles',
        name: 'Ski Goggles',
        costCash: 55
    },
    {
        id: 'battle_paint',
        name: 'Battle Paint',
        costCash: 35
    },
    {
        id: 'bandage',
        name: 'Combat Bandage',
        costCash: 30
    }
];
var MM_FACIAL = [
    {
        id: 'clean',
        name: 'Clean Shaven',
        costCash: 0
    },
    {
        id: 'sarge_stache',
        name: 'Sarge Walrus',
        costCash: 0
    },
    {
        id: 'full_beard',
        name: 'Full Beard',
        costCash: 30
    },
    {
        id: 'goatee',
        name: 'Goatee',
        costCash: 30
    },
    {
        id: 'stubble',
        name: 'Heavy Stubble',
        costCash: 25
    },
    {
        id: 'cigar',
        name: 'Sarge Cigar',
        costCash: 60
    },
    {
        id: 'war_grin',
        name: 'War Grin',
        costCash: 40
    },
    {
        id: 'respirator',
        name: 'Respirator',
        costCash: 75
    },
    {
        id: 'skull_bandana',
        name: 'Skull Bandana',
        costCash: 90
    },
    {
        id: 'whistle',
        name: 'Officer Whistle',
        costCash: 45
    }
];
var MM_OUTFITS = [
    {
        id: 'olive_camo',
        name: 'Olive Camo',
        primary: '#4D5D3B',
        secondary: '#2F3A22',
        costCash: 0
    },
    {
        id: 'desert_camo',
        name: 'Desert Camo',
        primary: '#C2B280',
        secondary: '#8A795D',
        costCash: 0
    },
    {
        id: 'arctic_camo',
        name: 'Snow Arctic',
        primary: '#CBD5E1',
        secondary: '#64748B',
        costCash: 50
    },
    {
        id: 'black_swat',
        name: 'Black SWAT',
        primary: '#1F2937',
        secondary: '#0F172A',
        costCash: 70
    },
    {
        id: 'hazmat',
        name: 'Biohazard Hazmat',
        primary: '#EAB308',
        secondary: '#422006',
        costCash: 95
    },
    {
        id: 'red_commando',
        name: 'Red Commando',
        primary: '#991B1B',
        secondary: '#450A0A',
        costCash: 80
    },
    {
        id: 'ninja_gi',
        name: 'Shadow Ninja',
        primary: '#18181B',
        secondary: '#DC2626',
        costCash: 100
    },
    {
        id: 'exo_suit',
        name: 'Exo-Suit',
        primary: '#0F766E',
        secondary: '#22D3EE',
        costCash: 130
    },
    {
        id: 'space_suit',
        name: 'Lunar Suit',
        primary: '#F8FAFC',
        secondary: '#F97316',
        costCash: 120
    },
    {
        id: 'ghillie_suit',
        name: 'Ghillie Suit',
        primary: '#365314',
        secondary: '#1A2E05',
        costCash: 110
    },
    {
        id: 'juggernaut',
        name: 'Heavy Juggernaut',
        primary: '#334155',
        secondary: '#F59E0B',
        costCash: 140
    },
    {
        id: 'golden_commander',
        name: 'Golden Commander',
        primary: '#CA8A04',
        secondary: '#FEF08A',
        costCash: 220
    }
];
var MM_BOOTS = [
    {
        id: 'steel',
        name: 'Steel Boots',
        color: '#475569',
        flame: '#FB923C',
        costCash: 0
    },
    {
        id: 'gold',
        name: 'Gold Thrusters',
        color: '#EAB308',
        flame: '#FDE047',
        costCash: 80
    },
    {
        id: 'plasma_blue',
        name: 'Blue Plasma Jets',
        color: '#1D4ED8',
        flame: '#38BDF8',
        costCash: 90
    },
    {
        id: 'crimson_flame',
        name: 'Red Flame Jets',
        color: '#B91C1C',
        flame: '#EF4444',
        costCash: 75
    },
    {
        id: 'cyber_boots',
        name: 'Cyber Thrusters',
        color: '#0F766E',
        flame: '#2DD4BF',
        costCash: 95
    },
    {
        id: 'stealth_boots',
        name: 'Stealth Boots',
        color: '#18181B',
        flame: '#A855F7',
        costCash: 85
    },
    {
        id: 'desert_boots',
        name: 'Tactical Tan',
        color: '#A16207',
        flame: '#F97316',
        costCash: 50
    },
    {
        id: 'arctic_boots',
        name: 'Frost Jets',
        color: '#94A3B8',
        flame: '#BAE6FD',
        costCash: 65
    }
];
var MM_QUICK_CHATS = [
    {
        id: 'cm',
        code: 'CM',
        text: 'Cover Me!'
    },
    {
        id: 'cb',
        code: 'CB',
        text: 'Come on Boy!'
    },
    {
        id: 'wp',
        code: 'WP',
        text: 'Wanna Piece?'
    },
    {
        id: 'ns',
        code: 'NS',
        text: 'Nice Shot!'
    },
    {
        id: 'haha',
        code: '😂',
        text: 'Hahaha!'
    },
    {
        id: 'gg',
        code: 'GG',
        text: 'GG! Well Played!'
    },
    {
        id: 'flag',
        code: '🚩',
        text: 'Defend the Base!'
    },
    {
        id: 'sarge',
        code: '🫡',
        text: 'Lock and Load!'
    }
];
var MM_BOT_NAMES = [
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
var MM_SARGE_AVATAR = {
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
var MM_SIMULATED_ONLINE_ROOMS = [
    {
        id: 'rm_1',
        name: 'Outpost 24/7 Pro Scrim',
        region: 'Asia',
        mapId: 'outpost',
        mode: 'tdm',
        players: 5,
        maxPlayers: 6,
        pingMs: 24,
        classicV4: false,
        difficulty: 'pro',
        ranked: true
    },
    {
        id: 'rm_2',
        name: 'Catacombs Saw Madness',
        region: 'Asia',
        mapId: 'catacombs',
        mode: 'ffa',
        players: 4,
        maxPlayers: 6,
        pingMs: 31,
        classicV4: true,
        difficulty: 'normal',
        ranked: false
    },
    {
        id: 'rm_3',
        name: 'High Tower Snipers & Rockets',
        region: 'Europe',
        mapId: 'high_tower',
        mode: 'tdm',
        players: 6,
        maxPlayers: 8,
        pingMs: 58,
        classicV4: false,
        difficulty: 'pro',
        ranked: true
    },
    {
        id: 'rm_4',
        name: 'Lunarcy Zero-G Laser Arena',
        region: 'North America',
        mapId: 'lunarcy',
        mode: 'ffa',
        players: 5,
        maxPlayers: 8,
        pingMs: 74,
        classicV4: true,
        difficulty: 'normal',
        ranked: false
    },
    {
        id: 'rm_5',
        name: 'Stronghold Ranked CTF',
        region: 'Europe',
        mapId: 'stronghold',
        mode: 'ctf',
        players: 5,
        maxPlayers: 6,
        pingMs: 49,
        classicV4: false,
        difficulty: 'pro',
        ranked: true
    },
    {
        id: 'rm_6',
        name: 'Subdivision Bomb Squad PTB',
        region: 'North America',
        mapId: 'subdivision',
        mode: 'ptb',
        players: 4,
        maxPlayers: 6,
        pingMs: 68,
        classicV4: false,
        difficulty: 'insane',
        ranked: true
    },
    {
        id: 'rm_7',
        name: 'Mini Outpost Dual Uzi Rush',
        region: 'South America',
        mapId: 'mini_outpost',
        mode: 'tdm',
        players: 4,
        maxPlayers: 6,
        pingMs: 92,
        classicV4: true,
        difficulty: 'normal',
        ranked: false
    },
    {
        id: 'rm_8',
        name: 'Overseer Competitive 3v3',
        region: 'Asia',
        mapId: 'overseer',
        mode: 'tdm',
        players: 5,
        maxPlayers: 6,
        pingMs: 19,
        classicV4: false,
        difficulty: 'insane',
        ranked: true
    }
];
function makeRandomAvatar(name) {
    if (name === void 0) name = 'Trooper';
    var pick = function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };
    return {
        name: name,
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

});
// === MODULE: src/games/mini-militia/data/weapons ===
ArcadeMod.define("src/games/mini-militia/data/weapons", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get MM_GRENADES () {
        return MM_GRENADES;
    },
    get MM_PREBUILT_LOADOUTS () {
        return MM_PREBUILT_LOADOUTS;
    },
    get MM_SPECIAL_PERKS () {
        return MM_SPECIAL_PERKS;
    },
    get MM_WEAPONS () {
        return MM_WEAPONS;
    },
    get canDualWieldPair () {
        return canDualWieldPair;
    },
    get getMmGrenadeById () {
        return getMmGrenadeById;
    },
    get getMmWeaponById () {
        return getMmWeaponById;
    }
});
var MM_WEAPONS = [
    // ==================== A. ONE-HANDED & DUAL-WIELDABLE (10) ====================
    {
        id: 'pistol',
        name: 'M9 Pistol',
        shortName: 'M9',
        category: 'one_handed',
        fireMode: 'semi',
        oneHanded: true,
        damage: 18,
        headshotMult: 1.75,
        pellets: 1,
        rpm: 300,
        magSize: 12,
        reserveMax: 96,
        reloadSec: 1.3,
        zoomMax: 1.2,
        weightSpeedMult: 1.0,
        recoilImpulse: 18,
        spreadDeg: 2.2,
        projectileSpeed: 1280,
        projectileKind: 'bullet',
        color: '#4B5563',
        accent: '#9CA3AF',
        desc: 'Classic backup sidearm with crisp accuracy and fast draw.',
        unlockCostCash: 0
    },
    {
        id: 'deagle',
        name: 'Desert Eagle',
        shortName: 'Deagle',
        category: 'one_handed',
        fireMode: 'semi',
        oneHanded: true,
        damage: 34,
        headshotMult: 1.75,
        pellets: 1,
        rpm: 220,
        magSize: 7,
        reserveMax: 63,
        reloadSec: 1.6,
        zoomMax: 1.5,
        weightSpeedMult: 0.99,
        recoilImpulse: 44,
        spreadDeg: 2.6,
        projectileSpeed: 1420,
        projectileKind: 'bullet',
        color: '#9CA3AF',
        accent: '#E5E7EB',
        desc: 'Iconic heavy pistol with high stopping power.',
        unlockCostCash: 0
    },
    {
        id: 'golden_eagle',
        name: 'Golden Eagle',
        shortName: 'Gold Deagle',
        category: 'one_handed',
        fireMode: 'semi',
        oneHanded: true,
        damage: 38,
        headshotMult: 1.8,
        pellets: 1,
        rpm: 240,
        magSize: 8,
        reserveMax: 72,
        reloadSec: 1.5,
        zoomMax: 1.8,
        weightSpeedMult: 0.99,
        recoilImpulse: 38,
        spreadDeg: 1.8,
        projectileSpeed: 1520,
        projectileKind: 'bullet',
        color: '#F59E0B',
        accent: '#FEF08A',
        desc: 'Silenced golden Deagle with extended range and tight spread.',
        unlockCostCash: 180
    },
    {
        id: 'magnum',
        name: 'Magnum (.357)',
        shortName: 'Magnum',
        category: 'one_handed',
        fireMode: 'semi',
        oneHanded: true,
        damage: 46,
        headshotMult: 1.8,
        pellets: 1,
        rpm: 140,
        magSize: 6,
        reserveMax: 54,
        reloadSec: 1.9,
        zoomMax: 2.0,
        weightSpeedMult: 0.98,
        recoilImpulse: 62,
        spreadDeg: 1.5,
        projectileSpeed: 1620,
        projectileKind: 'bullet',
        color: '#64748B',
        accent: '#CBD5E1',
        desc: 'Devastating 2-3 shot revolver; classic Mini Militia starter.',
        unlockCostCash: 0
    },
    {
        id: 'uzi',
        name: 'Uzi',
        shortName: 'Uzi',
        category: 'one_handed',
        fireMode: 'auto',
        oneHanded: true,
        damage: 13,
        headshotMult: 1.65,
        pellets: 1,
        rpm: 850,
        magSize: 32,
        reserveMax: 256,
        reloadSec: 1.7,
        zoomMax: 1.3,
        weightSpeedMult: 0.98,
        recoilImpulse: 16,
        spreadDeg: 5.8,
        projectileSpeed: 1260,
        projectileKind: 'bullet',
        color: '#1F2937',
        accent: '#6B7280',
        desc: 'Insane close-range bullet hose. Dual Uzi is legendary CQC meta!',
        unlockCostCash: 0
    },
    {
        id: 'tec9',
        name: 'Tec-9',
        shortName: 'Tec-9',
        category: 'one_handed',
        fireMode: 'auto',
        oneHanded: true,
        damage: 16,
        headshotMult: 1.7,
        pellets: 1,
        rpm: 650,
        magSize: 24,
        reserveMax: 192,
        reloadSec: 1.6,
        zoomMax: 1.4,
        weightSpeedMult: 0.98,
        recoilImpulse: 20,
        spreadDeg: 4.0,
        projectileSpeed: 1320,
        projectileKind: 'bullet',
        color: '#374151',
        accent: '#94A3B8',
        desc: 'Balanced auto pistol with tighter spread than the Uzi.',
        unlockCostCash: 90
    },
    {
        id: 'mp5',
        name: 'MP5',
        shortName: 'MP5',
        category: 'one_handed',
        fireMode: 'auto',
        oneHanded: true,
        damage: 17,
        headshotMult: 1.75,
        pellets: 1,
        rpm: 750,
        magSize: 30,
        reserveMax: 240,
        reloadSec: 1.8,
        zoomMax: 1.6,
        weightSpeedMult: 0.95,
        recoilImpulse: 22,
        spreadDeg: 3.1,
        projectileSpeed: 1420,
        projectileKind: 'bullet',
        color: '#1E293B',
        accent: '#64748B',
        desc: 'High fire-rate tactical SMG; dual-wieldable for relentless pressure.',
        unlockCostCash: 140
    },
    {
        id: 'sawed_off',
        name: 'Sawed-Off Shotgun',
        shortName: 'Sawed-Off',
        category: 'one_handed',
        fireMode: 'semi',
        oneHanded: true,
        damage: 16,
        headshotMult: 1.5,
        pellets: 6,
        rpm: 110,
        magSize: 2,
        reserveMax: 32,
        reloadSec: 1.5,
        zoomMax: 1.2,
        weightSpeedMult: 0.97,
        recoilImpulse: 125,
        spreadDeg: 13.5,
        projectileSpeed: 1150,
        projectileKind: 'pellet',
        color: '#78350F',
        accent: '#9CA3AF',
        desc: 'Brutal point-blank double-barrel blast with backward recoil kick.',
        unlockCostCash: 120
    },
    {
        id: 'machete',
        name: 'Machete',
        shortName: 'Machete',
        category: 'one_handed',
        fireMode: 'melee',
        oneHanded: true,
        isMelee: true,
        damage: 85,
        headshotMult: 1.35,
        pellets: 1,
        rpm: 150,
        magSize: 999,
        reserveMax: 999,
        reloadSec: 0,
        zoomMax: 1.0,
        weightSpeedMult: 1.04,
        recoilImpulse: -90,
        spreadDeg: 0,
        projectileSpeed: 0,
        projectileKind: 'melee',
        color: '#E2E8F0',
        accent: '#475569',
        desc: 'Huge melee lunge arc; 1-shot head slash. Dual machetes boost swing speed!',
        unlockCostCash: 100
    },
    {
        id: 'riot_shield',
        name: 'Riot Shield',
        shortName: 'Shield',
        category: 'one_handed',
        fireMode: 'shield',
        oneHanded: true,
        isShield: true,
        damage: 35,
        headshotMult: 1.2,
        pellets: 1,
        rpm: 100,
        magSize: 999,
        reserveMax: 999,
        reloadSec: 0,
        zoomMax: 1.0,
        weightSpeedMult: 0.8,
        recoilImpulse: -40,
        spreadDeg: 0,
        projectileSpeed: 0,
        projectileKind: 'shield',
        color: '#1E3A8A',
        accent: '#93C5FD',
        desc: 'Off-hand armor! Blocks 100% of aimed bullets & snipers; vulnerable to explosives, gas & fire.',
        unlockCostCash: 160
    },
    // ==================== B. TWO-HANDED RIFLES, SHOTGUNS & SNIPERS (8) ====================
    {
        id: 'm4',
        name: 'M4 / AR-15',
        shortName: 'M4',
        category: 'rifle_sniper',
        fireMode: 'burst3',
        oneHanded: false,
        damage: 24,
        headshotMult: 1.75,
        pellets: 1,
        rpm: 560,
        magSize: 30,
        reserveMax: 210,
        reloadSec: 1.9,
        zoomMax: 2.5,
        weightSpeedMult: 0.93,
        recoilImpulse: 26,
        spreadDeg: 1.6,
        projectileSpeed: 1660,
        projectileKind: 'bullet',
        color: '#334155',
        accent: '#94A3B8',
        desc: 'Ultra-accurate 3-round burst rifle; deadly mid-range laser.',
        unlockCostCash: 0
    },
    {
        id: 'ak47',
        name: 'AK-47',
        shortName: 'AK-47',
        category: 'rifle_sniper',
        fireMode: 'auto',
        oneHanded: false,
        damage: 28,
        headshotMult: 1.75,
        pellets: 1,
        rpm: 520,
        magSize: 30,
        reserveMax: 210,
        reloadSec: 2.1,
        zoomMax: 2.2,
        weightSpeedMult: 0.92,
        recoilImpulse: 34,
        spreadDeg: 3.4,
        projectileSpeed: 1580,
        projectileKind: 'bullet',
        color: '#92400E',
        accent: '#475569',
        desc: 'Heavy-hitting full-auto assault rifle with noticeable recoil bloom.',
        unlockCostCash: 0
    },
    {
        id: 'tavor',
        name: 'Tavor (TAR-21)',
        shortName: 'Tavor',
        category: 'rifle_sniper',
        fireMode: 'auto',
        oneHanded: false,
        damage: 22,
        headshotMult: 1.75,
        pellets: 1,
        rpm: 680,
        magSize: 30,
        reserveMax: 240,
        reloadSec: 1.8,
        zoomMax: 2.4,
        weightSpeedMult: 0.95,
        recoilImpulse: 22,
        spreadDeg: 2.1,
        projectileSpeed: 1640,
        projectileKind: 'bullet',
        color: '#3F4E35',
        accent: '#A3B18A',
        desc: 'Fast bullpup rifle with crisp accuracy and agile handling.',
        unlockCostCash: 150
    },
    {
        id: 'm14',
        name: 'M14 Marksman',
        shortName: 'M14',
        category: 'rifle_sniper',
        fireMode: 'semi',
        oneHanded: false,
        damage: 48,
        headshotMult: 1.85,
        pellets: 1,
        rpm: 190,
        magSize: 12,
        reserveMax: 84,
        reloadSec: 2.0,
        zoomMax: 3.5,
        weightSpeedMult: 0.91,
        recoilImpulse: 58,
        spreadDeg: 1.1,
        projectileSpeed: 1850,
        projectileKind: 'bullet',
        color: '#713F12',
        accent: '#CBD5E1',
        desc: 'Precision DMR built for rapid 2-tap headshots.',
        unlockCostCash: 180
    },
    {
        id: 'hunting_rifle',
        name: 'Hunting Rifle',
        shortName: 'Hunting',
        category: 'rifle_sniper',
        fireMode: 'bolt',
        oneHanded: false,
        damage: 58,
        headshotMult: 1.9,
        pellets: 1,
        rpm: 75,
        magSize: 5,
        reserveMax: 40,
        reloadSec: 2.2,
        zoomMax: 4.5,
        weightSpeedMult: 0.9,
        recoilImpulse: 92,
        spreadDeg: 0.6,
        projectileSpeed: 2100,
        projectileKind: 'bullet',
        color: '#854D0E',
        accent: '#64748B',
        desc: 'Classic high-velocity wood-stock sniper rifle.',
        unlockCostCash: 160
    },
    {
        id: 'spas12',
        name: 'SPAS-12 Pump Shotgun',
        shortName: 'SPAS-12',
        category: 'rifle_sniper',
        fireMode: 'semi',
        oneHanded: false,
        damage: 18,
        headshotMult: 1.5,
        pellets: 7,
        rpm: 85,
        magSize: 8,
        reserveMax: 48,
        reloadSec: 2.4,
        zoomMax: 1.4,
        weightSpeedMult: 0.9,
        recoilImpulse: 160,
        spreadDeg: 11.0,
        projectileSpeed: 1220,
        projectileKind: 'pellet',
        color: '#1E293B',
        accent: '#94A3B8',
        desc: 'Devastating 1-shot CQC pump shotgun with heavy knockback.',
        unlockCostCash: 170
    },
    {
        id: 'aa12',
        name: 'AA-12 Auto Shotgun',
        shortName: 'AA-12',
        category: 'rifle_sniper',
        fireMode: 'auto',
        oneHanded: false,
        damage: 13,
        headshotMult: 1.45,
        pellets: 6,
        rpm: 260,
        magSize: 12,
        reserveMax: 72,
        reloadSec: 2.5,
        zoomMax: 1.3,
        weightSpeedMult: 0.85,
        recoilImpulse: 95,
        spreadDeg: 13.0,
        projectileSpeed: 1180,
        projectileKind: 'pellet',
        color: '#475569',
        accent: '#CBD5E1',
        desc: 'Rapid-fire full-auto pellet storm for bunker clearing.',
        unlockCostCash: 240
    },
    {
        id: 'm93ba',
        name: 'M93BA Anti-Materiel Sniper',
        shortName: 'M93BA',
        category: 'rifle_sniper',
        fireMode: 'bolt',
        oneHanded: false,
        damage: 88,
        headshotMult: 1.88,
        pellets: 1,
        rpm: 55,
        magSize: 5,
        reserveMax: 30,
        reloadSec: 2.6,
        zoomMax: 7.0,
        weightSpeedMult: 0.84,
        recoilImpulse: 175,
        spreadDeg: 0.2,
        projectileSpeed: 2450,
        projectileKind: 'bullet',
        hasLaserSight: true,
        color: '#111827',
        accent: '#EF4444',
        desc: 'Iconic Red Laser Sight! 1-shot headshot kill across the map with 7x zoom.',
        unlockCostCash: 320
    },
    // ==================== C. HEAVY, EXPLOSIVE & FUTURISTIC SPECIALS (7) ====================
    {
        id: 'smaw',
        name: 'SMAW Rocket Launcher',
        shortName: 'SMAW',
        category: 'heavy_special',
        fireMode: 'semi',
        oneHanded: false,
        damage: 135,
        headshotMult: 1.0,
        pellets: 1,
        rpm: 42,
        magSize: 3,
        reserveMax: 12,
        reloadSec: 3.2,
        zoomMax: 2.5,
        weightSpeedMult: 0.8,
        recoilImpulse: 220,
        spreadDeg: 0.8,
        projectileSpeed: 680,
        projectileKind: 'rocket',
        splashRadius: 125,
        color: '#3F6212',
        accent: '#F59E0B',
        desc: 'Smoke-trailing warhead with huge fiery blast radius; enables rocket-jumping!',
        unlockCostCash: 280
    },
    {
        id: 'mortar',
        name: 'Grenade Launcher (Mortar)',
        shortName: 'Mortar',
        category: 'heavy_special',
        fireMode: 'semi',
        oneHanded: false,
        damage: 95,
        headshotMult: 1.0,
        pellets: 1,
        rpm: 80,
        magSize: 6,
        reserveMax: 24,
        reloadSec: 3.0,
        zoomMax: 2.0,
        weightSpeedMult: 0.84,
        recoilImpulse: 110,
        spreadDeg: 2.0,
        projectileSpeed: 740,
        projectileKind: 'mortar',
        splashRadius: 96,
        color: '#374151',
        accent: '#22C55E',
        desc: 'Fires bouncing arced mini-grenades that detonate on impact or after 2.2s.',
        unlockCostCash: 260
    },
    {
        id: 'minigun',
        name: 'M134 Minigun',
        shortName: 'Minigun',
        category: 'heavy_special',
        fireMode: 'spinup',
        oneHanded: false,
        damage: 16,
        headshotMult: 1.5,
        pellets: 1,
        rpm: 1200,
        magSize: 100,
        reserveMax: 400,
        reloadSec: 3.5,
        zoomMax: 1.5,
        weightSpeedMult: 0.75,
        recoilImpulse: 38,
        spreadDeg: 6.5,
        projectileSpeed: 1500,
        projectileKind: 'bullet',
        spinUpSec: 0.8,
        color: '#1E293B',
        accent: '#F59E0B',
        desc: '0.8s barrel spin-up followed by 1200 RPM hail & mid-air recoil pushback!',
        unlockCostCash: 350
    },
    {
        id: 'flamethrower',
        name: 'Flamethrower',
        shortName: 'Flamer',
        category: 'heavy_special',
        fireMode: 'flame',
        oneHanded: false,
        damage: 14,
        headshotMult: 1.0,
        pellets: 1,
        rpm: 720,
        magSize: 100,
        reserveMax: 300,
        reloadSec: 2.0,
        zoomMax: 1.2,
        weightSpeedMult: 0.86,
        recoilImpulse: 12,
        spreadDeg: 9.0,
        projectileSpeed: 480,
        projectileKind: 'flame',
        burnsTarget: true,
        batteryAutoRefill: true,
        color: '#B91C1C',
        accent: '#FB923C',
        desc: 'Continuous roaring flames; ignites enemies for 3s DOT and bypasses Riot Shields!',
        unlockCostCash: 270
    },
    {
        id: 'phasr',
        name: 'PHASR Laser Gun',
        shortName: 'PHASR',
        category: 'heavy_special',
        fireMode: 'laser',
        oneHanded: false,
        damage: 18,
        headshotMult: 1.45,
        pellets: 1,
        rpm: 600,
        magSize: 100,
        reserveMax: 200,
        reloadSec: 2.2,
        zoomMax: 4.0,
        weightSpeedMult: 0.9,
        recoilImpulse: 8,
        spreadDeg: 0,
        projectileSpeed: 0,
        projectileKind: 'laser',
        batteryAutoRefill: true,
        color: '#0E7490',
        accent: '#22D3EE',
        desc: 'Instant hitscan glowing cyan laser beam with pinpoint accuracy and auto-recharge.',
        unlockCostCash: 340
    },
    {
        id: 'emp_gun',
        name: 'EMP Gun',
        shortName: 'EMP Gun',
        category: 'heavy_special',
        fireMode: 'semi',
        oneHanded: false,
        damage: 20,
        headshotMult: 1.0,
        pellets: 1,
        rpm: 75,
        magSize: 4,
        reserveMax: 24,
        reloadSec: 2.4,
        zoomMax: 2.0,
        weightSpeedMult: 0.9,
        recoilImpulse: 50,
        spreadDeg: 1.0,
        projectileSpeed: 460,
        projectileKind: 'emp',
        splashRadius: 115,
        disablesJetpackSec: 4.0,
        color: '#1D4ED8',
        accent: '#60A5FA',
        desc: 'Fires pulsing electric orbs that disable Rocket Boots for 4s & destroy Proxy Mines!',
        unlockCostCash: 290
    },
    {
        id: 'saw_gun',
        name: 'Saw Gun (Catacombs Legend)',
        shortName: 'Saw Gun',
        category: 'heavy_special',
        fireMode: 'semi',
        oneHanded: false,
        damage: 115,
        headshotMult: 1.25,
        pellets: 1,
        rpm: 90,
        magSize: 6,
        reserveMax: 30,
        reloadSec: 2.5,
        zoomMax: 2.0,
        weightSpeedMult: 0.85,
        recoilImpulse: 85,
        spreadDeg: 1.2,
        projectileSpeed: 980,
        projectileKind: 'saw',
        ricochets: 4,
        color: '#991B1B',
        accent: '#E2E8F0',
        desc: 'Launches spinning steel sawblades that ricochet up to 4 times off walls!',
        unlockCostCash: 360
    }
];
var WEAPON_MAP = new Map(MM_WEAPONS.map(function(w) {
    return [
        w.id,
        w
    ];
}));
function getMmWeaponById(id) {
    var _WEAPON_MAP_get;
    return (_WEAPON_MAP_get = WEAPON_MAP.get(id)) != null ? _WEAPON_MAP_get : MM_WEAPONS[3]; // default Magnum
}
function canDualWieldPair(weaponAId, weaponBId) {
    var a = getMmWeaponById(weaponAId);
    var b = getMmWeaponById(weaponBId);
    if (!a.oneHanded || !b.oneHanded) return false;
    // Cannot dual-wield two Riot Shields simultaneously
    if (a.isShield && b.isShield) return false;
    return true;
}
var MM_GRENADES = [
    {
        id: 'frag',
        name: 'Frag Grenade',
        shortName: 'Frag',
        icon: '💣',
        color: '#4ADE80',
        fuseSec: 2.5,
        radius: 118,
        damage: 130,
        desc: 'Bounces off walls & floors; 2.5s fuse with high blast damage.'
    },
    {
        id: 'gas',
        name: 'Poison Gas Grenade',
        shortName: 'Gas',
        icon: '☣️',
        color: '#A3E635',
        fuseSec: 1.8,
        radius: 110,
        damage: 35,
        desc: 'Releases a 7s toxic cloud (35 true dmg/s) that flushes out bunkers.'
    },
    {
        id: 'proxy',
        name: 'Proximity Mine',
        shortName: 'Proxy',
        icon: '🔴',
        color: '#EF4444',
        fuseSec: 1.5,
        radius: 95,
        damage: 145,
        desc: 'Sticks permanently to walls, ceilings, or floors; arms in 1.5s & detonates on approach.'
    },
    {
        id: 'emp',
        name: 'EMP Grenade',
        shortName: 'EMP',
        icon: '⚡',
        color: '#38BDF8',
        fuseSec: 1.6,
        radius: 140,
        damage: 25,
        desc: 'Disables enemy Rocket Boots for 5s, strips power boosts & disarms Proxy Mines.'
    }
];
function getMmGrenadeById(id) {
    var _MM_GRENADES_find;
    return (_MM_GRENADES_find = MM_GRENADES.find(function(g) {
        return g.id === id;
    })) != null ? _MM_GRENADES_find : MM_GRENADES[0];
}
var MM_SPECIAL_PERKS = [
    {
        id: 'grenadier',
        name: 'Grenadier',
        icon: '💣',
        desc: '+2 max grenade capacity & spawn with +2 extra grenades.'
    },
    {
        id: 'jet_booster',
        name: 'Jet-Booster',
        icon: '🚀',
        desc: '+25% max Rocket Boot nitro fuel & faster aerial recharge.'
    },
    {
        id: 'heavy_armor',
        name: 'Heavy Armor',
        icon: '🛡️',
        desc: '+20 Max HP (120 HP total) to survive burst trades.'
    },
    {
        id: 'quick_hands',
        name: 'Quick Hands',
        icon: '⚡',
        desc: '+20% faster weapon reload & swap speed.'
    }
];
var MM_PREBUILT_LOADOUTS = [
    {
        id: 'classic_default',
        name: 'Classic Default',
        primaryId: 'magnum',
        secondaryId: 'deagle',
        grenadeId: 'frag',
        grenadeCount: 2,
        perkId: 'jet_booster',
        coinCost: 0,
        desc: 'Free starter kit: Magnum .357 + Desert Eagle + 2 Frag Grenades.'
    },
    {
        id: 'pistol_specialist',
        name: 'Pistol Specialist',
        primaryId: 'uzi',
        secondaryId: 'magnum',
        dualWieldStart: true,
        grenadeId: 'frag',
        grenadeCount: 2,
        perkId: 'quick_hands',
        coinCost: 0,
        desc: 'Free agile Dual-Wield kit: Uzi + Magnum + Quick Hands.'
    },
    {
        id: 'general_infantry',
        name: 'General Infantry',
        primaryId: 'm4',
        secondaryId: 'uzi',
        grenadeId: 'frag',
        grenadeCount: 3,
        perkId: 'heavy_armor',
        coinCost: 250,
        desc: 'Balanced mid-range M4 burst rifle backed by close-range Uzi.'
    },
    {
        id: 'jungle_assault',
        name: 'Jungle Assault',
        primaryId: 'ak47',
        secondaryId: 'machete',
        grenadeId: 'gas',
        grenadeCount: 3,
        perkId: 'jet_booster',
        coinCost: 300,
        desc: 'Heavy AK-47 assault paired with lethal Machete & Poison Gas.'
    },
    {
        id: 'marksman',
        name: 'Marksman',
        primaryId: 'm14',
        secondaryId: 'magnum',
        grenadeId: 'frag',
        grenadeCount: 4,
        perkId: 'grenadier',
        coinCost: 380,
        desc: 'M14 precision DMR + Magnum + 4 Frag Grenades.'
    },
    {
        id: 'secret_agent',
        name: 'Secret Agent',
        primaryId: 'golden_eagle',
        secondaryId: 'golden_eagle',
        dualWieldStart: true,
        grenadeId: 'proxy',
        grenadeCount: 3,
        perkId: 'quick_hands',
        coinCost: 450,
        desc: 'Dual Golden Eagles + Proximity Mines for silent tactical ambushes.'
    },
    {
        id: 'breach_specialist',
        name: 'Breach Specialist',
        primaryId: 'uzi',
        secondaryId: 'riot_shield',
        dualWieldStart: true,
        grenadeId: 'gas',
        grenadeCount: 3,
        perkId: 'heavy_armor',
        coinCost: 500,
        desc: 'Uzi + Off-Hand Riot Shield + Gas Grenades for unstoppable pushes.'
    },
    {
        id: 'kings_choice',
        name: "King's Choice",
        primaryId: 'm93ba',
        secondaryId: 'spas12',
        grenadeId: 'emp',
        grenadeCount: 3,
        perkId: 'jet_booster',
        coinCost: 650,
        desc: 'M93BA 7x Laser Sniper + SPAS-12 Pump + EMP Grenades.'
    }
];

});

})(window.ArcadeMod);
