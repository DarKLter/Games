(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/hybrid/rostersBonus ===
ArcadeMod.define("src/games/hoops-2k26/hybrid/rostersBonus", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ROSTERS_BONUS", {
    enumerable: true,
    get: function() {
        return ROSTERS_BONUS;
    }
});
var _rosterTypes = require("./rosterTypes");
var ROSTERS_BONUS = [
    // -------------------- 4 CLASSIC LEGEND TEAMS --------------------
    (0, _rosterTypes.makeTeam)({
        id: 'leg_chi96',
        era: 'LEGENDS',
        city: '95-96 Chicago',
        name: 'Bulls',
        abbr: '96CHI',
        conference: 'EAST',
        arena: 'United Center (1996)',
        colors: [
            '#CE1141',
            '#111111',
            '#FFFFFF',
            '#c89252',
            '#CE1141'
        ],
        players: [
            [
                'Ron Harper',
                9,
                'PG',
                82,
                'TWO_WAY_WING',
                78
            ],
            [
                'Michael Jordan',
                23,
                'SG',
                99,
                'SUPERSTAR_WING',
                78,
                {
                    badges: {
                        POSTERIZER: 'LEGEND',
                        DEADEYE: 'LEGEND',
                        SHIFTY_SHOOTER: 'LEGEND',
                        PERIMETER_CHALLENGER: 'LEGEND',
                        GLOVE: 'HOF'
                    },
                    appearance: {
                        hairStyle: 'BALD',
                        armSleeve: 'LEFT'
                    }
                }
            ],
            [
                'Scottie Pippen',
                33,
                'SF',
                95,
                'TWO_WAY_WING',
                80,
                {
                    badges: {
                        PERIMETER_CHALLENGER: 'LEGEND',
                        INTERCEPTOR: 'HOF',
                        POSTERIZER: 'HOF',
                        DIMER: 'GOLD'
                    }
                }
            ],
            [
                'Dennis Rodman',
                91,
                'PF',
                91,
                'RIM_PROTECTOR',
                79,
                {
                    badges: {
                        REBOUND_CHASER: 'LEGEND',
                        BOXOUT_BEAST: 'LEGEND',
                        POGO_STICK: 'HOF',
                        PAINT_PATROLLER: 'HOF'
                    },
                    appearance: {
                        hairColor: '#f59e0b'
                    }
                }
            ],
            [
                'Luc Longley',
                13,
                'C',
                78,
                'ROLE_BIG',
                86
            ],
            [
                'Toni Kukoc',
                7,
                'SF',
                85,
                'STRETCH_BIG',
                82
            ],
            [
                'Steve Kerr',
                25,
                'PG',
                80,
                'SHARPSHOOTER',
                75,
                {
                    attrs: {
                        threePt: 96
                    },
                    badges: {
                        SET_SHOT_SPECIALIST: 'HOF',
                        DEADEYE: 'GOLD'
                    }
                }
            ],
            [
                'Bill Wennington',
                34,
                'C',
                74,
                'ROLE_BIG',
                84
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: 'leg_lal01',
        era: 'LEGENDS',
        city: '00-01 LA',
        name: 'Lakers',
        abbr: '01LAL',
        conference: 'WEST',
        arena: 'Staples Center (2001)',
        colors: [
            '#552583',
            '#FDB927',
            '#FFFFFF',
            '#d0a060',
            '#552583'
        ],
        players: [
            [
                'Derek Fisher',
                2,
                'PG',
                80,
                'SHARPSHOOTER',
                73
            ],
            [
                'Kobe Bryant',
                8,
                'SG',
                97,
                'SUPERSTAR_WING',
                78,
                {
                    badges: {
                        DEADEYE: 'LEGEND',
                        POSTERIZER: 'LEGEND',
                        SHIFTY_SHOOTER: 'LEGEND',
                        PERIMETER_CHALLENGER: 'HOF'
                    },
                    appearance: {
                        hairStyle: 'AFRO'
                    }
                }
            ],
            [
                'Rick Fox',
                17,
                'SF',
                79,
                'TWO_WAY_WING',
                79
            ],
            [
                'Horace Grant',
                54,
                'PF',
                80,
                'ROLE_BIG',
                82
            ],
            [
                "Shaquille O'Neal",
                34,
                'C',
                99,
                'POST_SCORER',
                85,
                {
                    weightLbs: 325,
                    attrs: {
                        closeShot: 99,
                        drivingDunk: 99,
                        strength: 99,
                        interiorDef: 95,
                        block: 93,
                        defReb: 95
                    },
                    badges: {
                        POSTERIZER: 'LEGEND',
                        PHYSICAL_FINISHER: 'LEGEND',
                        PAINT_PATROLLER: 'LEGEND',
                        BOXOUT_BEAST: 'LEGEND'
                    },
                    appearance: {
                        hairStyle: 'BALD'
                    }
                }
            ],
            [
                'Robert Horry',
                5,
                'PF',
                81,
                'STRETCH_BIG',
                82,
                {
                    badges: {
                        DEADEYE: 'HOF',
                        SET_SHOT_SPECIALIST: 'GOLD'
                    }
                }
            ],
            [
                'Brian Shaw',
                20,
                'PG',
                76,
                'ROLE_GUARD',
                78
            ],
            [
                'Tyronn Lue',
                10,
                'PG',
                75,
                'ROLE_GUARD',
                72
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: 'leg_bos86',
        era: 'LEGENDS',
        city: '85-86 Boston',
        name: 'Celtics',
        abbr: '86BOS',
        conference: 'EAST',
        arena: 'Boston Garden (1986)',
        colors: [
            '#007A33',
            '#BA9653',
            '#FFFFFF',
            '#d4a362',
            '#007A33'
        ],
        players: [
            [
                'Dennis Johnson',
                3,
                'PG',
                85,
                'TWO_WAY_WING',
                76
            ],
            [
                'Danny Ainge',
                44,
                'SG',
                83,
                'SHARPSHOOTER',
                76
            ],
            [
                'Larry Bird',
                33,
                'SF',
                98,
                'SUPERSTAR_WING',
                81,
                {
                    attrs: {
                        threePt: 96,
                        midRange: 98,
                        passAccuracy: 94,
                        defReb: 89
                    },
                    badges: {
                        DEADEYE: 'LEGEND',
                        SET_SHOT_SPECIALIST: 'LEGEND',
                        DIMER: 'LEGEND',
                        LIMITLESS_RANGE: 'HOF'
                    }
                }
            ],
            [
                'Kevin McHale',
                32,
                'PF',
                92,
                'POST_SCORER',
                82,
                {
                    badges: {
                        PHYSICAL_FINISHER: 'HOF',
                        PAINT_PATROLLER: 'HOF'
                    }
                }
            ],
            [
                'Robert Parish',
                0,
                'C',
                88,
                'RIM_PROTECTOR',
                84
            ],
            [
                'Bill Walton',
                5,
                'C',
                84,
                'POINT_CENTER',
                83,
                {
                    badges: {
                        BREAK_STARTER: 'HOF',
                        DIMER: 'GOLD'
                    }
                }
            ],
            [
                'Scott Wedman',
                8,
                'SF',
                77,
                'ROLE_FORWARD',
                79
            ],
            [
                'Jerry Sichting',
                12,
                'PG',
                75,
                'ROLE_GUARD',
                73
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: 'leg_gsw17',
        era: 'LEGENDS',
        city: '16-17 Golden State',
        name: 'Warriors',
        abbr: '17GSW',
        conference: 'WEST',
        arena: 'Oracle Arena (2017)',
        colors: [
            '#1D428A',
            '#FFC72C',
            '#FFFFFF',
            '#cc9858',
            '#1D428A'
        ],
        players: [
            [
                'Stephen Curry',
                30,
                'PG',
                97,
                'SHARPSHOOTER',
                75,
                {
                    attrs: {
                        threePt: 99,
                        ballHandle: 96,
                        midRange: 95
                    },
                    badges: {
                        LIMITLESS_RANGE: 'LEGEND',
                        DEADEYE: 'LEGEND',
                        SHIFTY_SHOOTER: 'LEGEND',
                        ANKLE_ASSASSIN: 'HOF'
                    }
                }
            ],
            [
                'Klay Thompson',
                11,
                'SG',
                90,
                'SHARPSHOOTER',
                78,
                {
                    attrs: {
                        threePt: 96,
                        perimeterDef: 88
                    },
                    badges: {
                        SET_SHOT_SPECIALIST: 'LEGEND',
                        DEADEYE: 'HOF',
                        PERIMETER_CHALLENGER: 'GOLD'
                    }
                }
            ],
            [
                'Kevin Durant',
                35,
                'SF',
                97,
                'SUPERSTAR_WING',
                82,
                {
                    attrs: {
                        midRange: 98,
                        threePt: 94,
                        drivingDunk: 90,
                        block: 84
                    },
                    badges: {
                        DEADEYE: 'LEGEND',
                        SHIFTY_SHOOTER: 'LEGEND',
                        LIMITLESS_RANGE: 'HOF'
                    }
                }
            ],
            [
                'Draymond Green',
                23,
                'PF',
                88,
                'TWO_WAY_WING',
                78,
                {
                    attrs: {
                        interiorDef: 94,
                        perimeterDef: 92,
                        passAccuracy: 88,
                        defReb: 87
                    },
                    badges: {
                        PAINT_PATROLLER: 'HOF',
                        PERIMETER_CHALLENGER: 'HOF',
                        DIMER: 'GOLD'
                    }
                }
            ],
            [
                'Zaza Pachulia',
                27,
                'C',
                77,
                'ROLE_BIG',
                83
            ],
            [
                'Andre Iguodala',
                9,
                'SF',
                83,
                'TWO_WAY_WING',
                78
            ],
            [
                'Shaun Livingston',
                34,
                'PG',
                79,
                'ROLE_GUARD',
                79
            ],
            [
                'JaVale McGee',
                1,
                'C',
                78,
                'RIM_PROTECTOR',
                84
            ]
        ]
    }),
    // -------------------- 4 NBA 2K14 EUROLEAGUE TEAMS --------------------
    (0, _rosterTypes.makeTeam)({
        id: 'euro_rm',
        era: 'EUROLEAGUE',
        city: 'Real',
        name: 'Madrid',
        abbr: 'RMB',
        conference: 'EURO',
        arena: 'Palacio de Deportes',
        colors: [
            '#FFFFFF',
            '#00529F',
            '#FEBE10',
            '#d2a266',
            '#00529F'
        ],
        players: [
            [
                'Sergio Llull',
                23,
                'PG',
                85,
                'ELITE_PG',
                75,
                {
                    badges: {
                        DEADEYE: 'GOLD',
                        SHIFTY_SHOOTER: 'GOLD',
                        LIGHTNING_LAUNCH: 'GOLD'
                    }
                }
            ],
            [
                'Rudy Fernandez',
                5,
                'SG',
                84,
                'TWO_WAY_WING',
                77,
                {
                    badges: {
                        SET_SHOT_SPECIALIST: 'GOLD',
                        INTERCEPTOR: 'GOLD'
                    }
                }
            ],
            [
                'Tremmell Darden',
                21,
                'SF',
                78,
                'TWO_WAY_WING',
                77
            ],
            [
                'Nikola Mirotic',
                12,
                'PF',
                84,
                'STRETCH_BIG',
                82,
                {
                    attrs: {
                        threePt: 88
                    }
                }
            ],
            [
                'Ioannis Bourousis',
                30,
                'C',
                81,
                'POST_SCORER',
                84
            ],
            [
                'Sergio Rodriguez',
                13,
                'PG',
                83,
                'ELITE_PG',
                75,
                {
                    badges: {
                        DIMER: 'HOF',
                        ANKLE_ASSASSIN: 'GOLD'
                    }
                }
            ],
            [
                'Jaycee Carroll',
                20,
                'SG',
                80,
                'SHARPSHOOTER',
                74,
                {
                    attrs: {
                        threePt: 93
                    }
                }
            ],
            [
                'Felipe Reyes',
                9,
                'PF',
                79,
                'ROLE_BIG',
                81
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: 'euro_fcb',
        era: 'EUROLEAGUE',
        city: 'FC',
        name: 'Barcelona',
        abbr: 'FCB',
        conference: 'EURO',
        arena: 'Palau Blaugrana',
        colors: [
            '#A50044',
            '#004D98',
            '#EDBB00',
            '#c89456',
            '#004D98'
        ],
        players: [
            [
                'Marcelinho Huertas',
                9,
                'PG',
                82,
                'ELITE_PG',
                75,
                {
                    badges: {
                        DIMER: 'GOLD',
                        FLOAT_GAME: 'GOLD'
                    }
                }
            ],
            [
                'Juan Carlos Navarro',
                11,
                'SG',
                85,
                'SHARPSHOOTER',
                75,
                {
                    attrs: {
                        threePt: 91
                    },
                    badges: {
                        FLOAT_GAME: 'HOF',
                        DEADEYE: 'GOLD',
                        LIMITLESS_RANGE: 'GOLD'
                    }
                }
            ],
            [
                'Kostas Papanikolaou',
                16,
                'SF',
                80,
                'TWO_WAY_WING',
                80
            ],
            [
                'Erazem Lorbek',
                25,
                'PF',
                81,
                'STRETCH_BIG',
                82
            ],
            [
                'Ante Tomic',
                44,
                'C',
                83,
                'POINT_CENTER',
                86
            ],
            [
                'Brad Oleson',
                24,
                'SG',
                78,
                'SHARPSHOOTER',
                75
            ],
            [
                'Bostjan Nachbar',
                34,
                'PF',
                78,
                'STRETCH_BIG',
                81
            ],
            [
                'Joey Dorsey',
                6,
                'C',
                77,
                'RIM_PROTECTOR',
                81
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: 'euro_cska',
        era: 'EUROLEAGUE',
        city: 'CSKA',
        name: 'Moscow',
        abbr: 'CSK',
        conference: 'EURO',
        arena: 'Universal Sports Hall',
        colors: [
            '#D52B1E',
            '#0039A6',
            '#FFFFFF',
            '#c9975a',
            '#D52B1E'
        ],
        players: [
            [
                'Milos Teodosic',
                4,
                'PG',
                85,
                'ELITE_PG',
                77,
                {
                    attrs: {
                        passAccuracy: 94,
                        threePt: 88
                    },
                    badges: {
                        DIMER: 'HOF',
                        VERSATILE_VISIONARY: 'HOF',
                        LIMITLESS_RANGE: 'GOLD'
                    }
                }
            ],
            [
                'Sonny Weems',
                13,
                'SG',
                82,
                'SLASHER',
                78
            ],
            [
                'Victor Khryapa',
                31,
                'SF',
                81,
                'TWO_WAY_WING',
                80
            ],
            [
                'Andrey Vorontsevich',
                20,
                'PF',
                79,
                'STRETCH_BIG',
                81
            ],
            [
                'Nenad Krstic',
                12,
                'C',
                84,
                'POST_SCORER',
                84
            ],
            [
                'Kyle Hines',
                42,
                'C',
                82,
                'RIM_PROTECTOR',
                78,
                {
                    badges: {
                        PAINT_PATROLLER: 'GOLD',
                        BOXOUT_BEAST: 'GOLD'
                    }
                }
            ],
            [
                'Aaron Jackson',
                9,
                'PG',
                78,
                'ROLE_GUARD',
                76
            ],
            [
                'Vitaly Fridzon',
                7,
                'SG',
                77,
                'SHARPSHOOTER',
                77
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: 'euro_oly',
        era: 'EUROLEAGUE',
        city: 'Olympiacos',
        name: 'Piraeus',
        abbr: 'OLY',
        conference: 'EURO',
        arena: 'Peace & Friendship Stadium',
        colors: [
            '#D6001C',
            '#FFFFFF',
            '#F5B700',
            '#ca9658',
            '#D6001C'
        ],
        players: [
            [
                'Vassilis Spanoulis',
                7,
                'PG',
                86,
                'ELITE_PG',
                76,
                {
                    badges: {
                        DEADEYE: 'HOF',
                        DIMER: 'GOLD',
                        SHIFTY_SHOOTER: 'HOF'
                    }
                }
            ],
            [
                'Acie Law',
                5,
                'SG',
                79,
                'ROLE_GUARD',
                75
            ],
            [
                'Stratos Perperoglou',
                16,
                'SF',
                79,
                'TWO_WAY_WING',
                80
            ],
            [
                'Georgios Printezis',
                15,
                'PF',
                83,
                'POST_SCORER',
                81,
                {
                    badges: {
                        FLOAT_GAME: 'HOF',
                        PHYSICAL_FINISHER: 'GOLD'
                    }
                }
            ],
            [
                'Bryant Dunston',
                6,
                'C',
                82,
                'RIM_PROTECTOR',
                80,
                {
                    badges: {
                        PAINT_PATROLLER: 'HOF',
                        HIGH_FLYING_DENIER: 'GOLD'
                    }
                }
            ],
            [
                'Kostas Sloukas',
                10,
                'PG',
                80,
                'ELITE_PG',
                75
            ],
            [
                'Matt Lojeski',
                24,
                'SF',
                78,
                'SHARPSHOOTER',
                78
            ],
            [
                'Vangelis Mantzaris',
                17,
                'PG',
                76,
                'ROLE_GUARD',
                77
            ]
        ]
    }),
    // -------------------- 4 NBA 2K26 THE W / WNBA TEAMS --------------------
    (0, _rosterTypes.makeTeam)({
        id: 'wnba_lva',
        era: 'WNBA',
        city: 'Las Vegas',
        name: 'Aces',
        abbr: 'LVA',
        conference: 'WNBA',
        arena: 'Michelob ULTRA Arena',
        colors: [
            '#111111',
            '#C8102E',
            '#A7A8AA',
            '#d1a162',
            '#111111'
        ],
        players: [
            [
                'Chelsea Gray',
                12,
                'PG',
                89,
                'ELITE_PG',
                71,
                {
                    badges: {
                        DIMER: 'HOF',
                        SHIFTY_SHOOTER: 'HOF',
                        DEADEYE: 'GOLD'
                    }
                }
            ],
            [
                'Jackie Young',
                0,
                'SG',
                89,
                'TWO_WAY_WING',
                72,
                {
                    badges: {
                        PERIMETER_CHALLENGER: 'GOLD',
                        SET_SHOT_SPECIALIST: 'GOLD'
                    }
                }
            ],
            [
                'Jewell Loyd',
                24,
                'SF',
                87,
                'SHARPSHOOTER',
                71
            ],
            [
                "A'ja Wilson",
                22,
                'PF',
                98,
                'POST_SCORER',
                76,
                {
                    attrs: {
                        closeShot: 97,
                        midRange: 93,
                        interiorDef: 96,
                        block: 95,
                        defReb: 95
                    },
                    badges: {
                        PAINT_PATROLLER: 'LEGEND',
                        PHYSICAL_FINISHER: 'LEGEND',
                        REBOUND_CHASER: 'HOF',
                        DEADEYE: 'HOF'
                    }
                }
            ],
            [
                'Kiah Stokes',
                41,
                'C',
                78,
                'RIM_PROTECTOR',
                75
            ],
            [
                'Alysha Clark',
                7,
                'SF',
                80,
                'TWO_WAY_WING',
                71
            ],
            [
                'Tiffany Hayes',
                15,
                'SG',
                81,
                'SLASHER',
                70
            ],
            [
                'Megan Gustafson',
                17,
                'C',
                77,
                'STRETCH_BIG',
                75
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: 'wnba_ind',
        era: 'WNBA',
        city: 'Indiana',
        name: 'Fever',
        abbr: 'INDW',
        conference: 'WNBA',
        arena: 'Gainbridge Fieldhouse',
        colors: [
            '#041E42',
            '#C8102E',
            '#FFCD00',
            '#cf9f5e',
            '#041E42'
        ],
        players: [
            [
                'Caitlin Clark',
                22,
                'PG',
                95,
                'SHARPSHOOTER',
                72,
                {
                    attrs: {
                        threePt: 97,
                        passAccuracy: 95,
                        ballHandle: 92
                    },
                    badges: {
                        LIMITLESS_RANGE: 'LEGEND',
                        DIMER: 'HOF',
                        VERSATILE_VISIONARY: 'HOF',
                        DEADEYE: 'HOF'
                    }
                }
            ],
            [
                'Kelsey Mitchell',
                0,
                'SG',
                87,
                'SHARPSHOOTER',
                68,
                {
                    badges: {
                        LIGHTNING_LAUNCH: 'HOF',
                        MINI_MARKSMAN: 'HOF'
                    }
                }
            ],
            [
                'Lexie Hull',
                10,
                'SF',
                79,
                'TWO_WAY_WING',
                73
            ],
            [
                'DeWanna Bonner',
                24,
                'PF',
                85,
                'TWO_WAY_WING',
                76
            ],
            [
                'Aliyah Boston',
                7,
                'C',
                88,
                'POST_SCORER',
                77,
                {
                    badges: {
                        PAINT_PATROLLER: 'HOF',
                        BOXOUT_BEAST: 'HOF',
                        PHYSICAL_FINISHER: 'GOLD'
                    }
                }
            ],
            [
                'Natasha Howard',
                6,
                'PF',
                83,
                'ROLE_FORWARD',
                74
            ],
            [
                'Sophie Cunningham',
                8,
                'SG',
                79,
                'SHARPSHOOTER',
                73
            ],
            [
                'Damiris Dantas',
                12,
                'C',
                76,
                'STRETCH_BIG',
                75
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: 'wnba_nyl',
        era: 'WNBA',
        city: 'New York',
        name: 'Liberty',
        abbr: 'NYL',
        conference: 'WNBA',
        arena: 'Barclays Center',
        colors: [
            '#6ECEB2',
            '#111111',
            '#FFFFFF',
            '#c8a06a',
            '#6ECEB2'
        ],
        players: [
            [
                'Sabrina Ionescu',
                20,
                'PG',
                92,
                'SHARPSHOOTER',
                71,
                {
                    attrs: {
                        threePt: 95,
                        passAccuracy: 90
                    },
                    badges: {
                        LIMITLESS_RANGE: 'HOF',
                        DEADEYE: 'HOF',
                        DIMER: 'GOLD'
                    }
                }
            ],
            [
                'Betnijah Laney-Hamilton',
                44,
                'SG',
                84,
                'TWO_WAY_WING',
                72
            ],
            [
                'Leonie Fiebich',
                13,
                'SF',
                81,
                'TWO_WAY_WING',
                76
            ],
            [
                'Breanna Stewart',
                30,
                'PF',
                95,
                'SUPERSTAR_WING',
                76,
                {
                    badges: {
                        DEADEYE: 'LEGEND',
                        PAINT_PATROLLER: 'HOF',
                        SHIFTY_SHOOTER: 'HOF',
                        REBOUND_CHASER: 'HOF'
                    }
                }
            ],
            [
                'Jonquel Jones',
                35,
                'C',
                91,
                'STRETCH_BIG',
                78,
                {
                    badges: {
                        REBOUND_CHASER: 'HOF',
                        PAINT_PATROLLER: 'HOF',
                        SET_SHOT_SPECIALIST: 'GOLD'
                    }
                }
            ],
            [
                'Natasha Cloud',
                9,
                'PG',
                83,
                'TWO_WAY_WING',
                69
            ],
            [
                'Nyara Sabally',
                8,
                'C',
                79,
                'ROLE_BIG',
                77
            ],
            [
                'Kennedy Burke',
                2,
                'SF',
                77,
                'ROLE_FORWARD',
                73
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: 'wnba_chi',
        era: 'WNBA',
        city: 'Chicago',
        name: 'Sky',
        abbr: 'CHIW',
        conference: 'WNBA',
        arena: 'Wintrust Arena',
        colors: [
            '#418FDE',
            '#FFCD00',
            '#FFFFFF',
            '#cf9c5c',
            '#418FDE'
        ],
        players: [
            [
                'Courtney Vandersloot',
                22,
                'PG',
                82,
                'ELITE_PG',
                68,
                {
                    badges: {
                        DIMER: 'HOF',
                        VERSATILE_VISIONARY: 'GOLD'
                    }
                }
            ],
            [
                'Ariel Atkins',
                7,
                'SG',
                84,
                'TWO_WAY_WING',
                70
            ],
            [
                'Rebecca Allen',
                9,
                'SF',
                79,
                'TWO_WAY_WING',
                74
            ],
            [
                'Angel Reese',
                5,
                'PF',
                92,
                'RIM_PROTECTOR',
                75,
                {
                    attrs: {
                        offReb: 98,
                        defReb: 96,
                        interiorDef: 89,
                        strength: 88
                    },
                    badges: {
                        REBOUND_CHASER: 'LEGEND',
                        BOXOUT_BEAST: 'LEGEND',
                        POGO_STICK: 'HOF',
                        PHYSICAL_FINISHER: 'GOLD'
                    }
                }
            ],
            [
                'Kamilla Cardoso',
                10,
                'C',
                85,
                'RIM_PROTECTOR',
                79,
                {
                    badges: {
                        PAINT_PATROLLER: 'GOLD',
                        HIGH_FLYING_DENIER: 'GOLD'
                    }
                }
            ],
            [
                'Kia Nurse',
                11,
                'SG',
                78,
                'SHARPSHOOTER',
                72
            ],
            [
                'Michaela Onyenwere',
                12,
                'SF',
                78,
                'ROLE_FORWARD',
                72
            ],
            [
                'Elizabeth Williams',
                1,
                'C',
                79,
                'RIM_PROTECTOR',
                75
            ]
        ]
    })
];

});
// === MODULE: src/games/hoops-2k26/hybrid/teamCatalog ===
ArcadeMod.define("src/games/hoops-2k26/hybrid/teamCatalog", function(require, module, exports) {
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
    get ERA_POOL_META () {
        return ERA_POOL_META;
    },
    get HYBRID_ALL_TEAMS () {
        return HYBRID_ALL_TEAMS;
    },
    get TeamEmblemSVG () {
        return TeamEmblemSVG;
    },
    get VENUE_OPTIONS () {
        return VENUE_OPTIONS;
    },
    get getAllLiveHybridTeams () {
        return getAllLiveHybridTeams;
    },
    get getHybridTeamById () {
        return getHybridTeamById;
    },
    get getTeamsByEraPool () {
        return getTeamsByEraPool;
    },
    get teamDataToSummary () {
        return teamDataToSummary;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_default(require("react"));
var _rosterTypes = require("./rosterTypes");
var _rosterStore = require("./rosterStore");
var _TeamLogo = require("./TeamLogo");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
// ============================================================================
// UNIFIED 72-TEAM BRIDGE — LIVE-LINKED TO PART 2 ROSTER STORE
// ============================================================================
function teamEraToPool(era) {
    if (era === '2K14') return 'NBA_2K14';
    if (era === '2K26') return 'NBA_2K26';
    if (era === 'LEGENDS') return 'LEGENDS';
    if (era === 'EUROLEAGUE') return 'EUROLEAGUE_14';
    return 'THE_W';
}
function poolToTeamEra(pool) {
    if (pool === 'NBA_2K14') return '2K14';
    if (pool === 'NBA_2K26') return '2K26';
    if (pool === 'LEGENDS') return 'LEGENDS';
    if (pool === 'EUROLEAGUE_14') return 'EUROLEAGUE';
    return 'WNBA';
}
function eraBadgeLabel(era) {
    if (era === '2K14') return '2013-14 NBA';
    if (era === '2K26') return '2025-26 NBA';
    if (era === 'LEGENDS') return 'NBA Legend';
    if (era === 'EUROLEAGUE') return "EuroLeague '14";
    return 'THE W · WNBA';
}
function mapAbbrToCourtTeamId(abbr, idx) {
    var _lookup_abbr;
    var lookup = {
        BOS: 0,
        LAL: 1,
        GSW: 2,
        DEN: 3,
        OKC: 4,
        MIL: 5,
        NYK: 6,
        SAS: 7,
        MIN: 8,
        MIA: 9,
        LVA: 10,
        NYL: 11,
        INDW: 12,
        CHIW: 13,
        '96CHI': 14,
        '01LAL': 15
    };
    return (_lookup_abbr = lookup[abbr]) != null ? _lookup_abbr : idx % 10;
}
var TIER_RANK = {
    LEGEND: 5,
    HOF: 4,
    GOLD: 3,
    SILVER: 2,
    BRONZE: 1
};
function topSignatureTag(badges, archetype) {
    var _ref;
    var entries = Object.entries(badges);
    if (entries.length === 0) return archetype;
    entries.sort(function(a, b) {
        var _TIER_RANK_b_, _TIER_RANK_a_;
        return ((_TIER_RANK_b_ = TIER_RANK[b[1]]) != null ? _TIER_RANK_b_ : 0) - ((_TIER_RANK_a_ = TIER_RANK[a[1]]) != null ? _TIER_RANK_a_ : 0);
    });
    var _entries_ = entries[0], topId = _entries_[0], topTier = _entries_[1];
    var meta = _rosterTypes.BADGE_CATALOG.find(function(b) {
        return b.id === topId;
    });
    return ((_ref = meta == null ? void 0 : meta.name) != null ? _ref : topId) + " (" + topTier + ")";
}
function teamDataToSummary(team, idx) {
    if (idx === void 0) idx = 0;
    var _sort_;
    var eraPool = teamEraToPool(team.era);
    var starters = team.roster.slice(0, 5).map(function(p) {
        return {
            name: p.name,
            position: p.position,
            ovr: p.ovr,
            jersey: p.jerseyNumber,
            signatureTag: topSignatureTag(p.badges, p.archetype)
        };
    });
    var starPlayer = (_sort_ = [].concat(starters).sort(function(a, b) {
        return b.ovr - a.ovr;
    })[0]) != null ? _sort_ : {
        name: team.name,
        position: 'SF',
        ovr: team.ovr,
        jersey: 6,
        signatureTag: 'Franchise Leader'
    };
    return {
        id: team.id,
        abbr: team.abbr,
        city: team.city,
        name: team.name,
        fullName: (team.city + " " + team.name).trim(),
        eraPool: eraPool,
        eraBadge: eraBadgeLabel(team.era),
        arena: team.arena,
        primaryColor: team.colors.primary,
        secondaryColor: team.colors.secondary,
        accentColor: team.colors.accent,
        ovr: team.ovr,
        off: team.offRating,
        def: team.defRating,
        tagline: team.era === 'EUROLEAGUE' ? 'Official 2K14 EuroLeague Club' : team.era === 'LEGENDS' ? 'Iconic Championship Dynasty' : team.era === 'WNBA' ? 'The W · 2K26 WNBA Franchise' : team.conference + " Conference \xb7 " + (team.era === '2K14' ? '2013-14' : '2025-26'),
        emblemStyle: (0, _TeamLogo.pickShapeForTeam)(team.id, team.era),
        starPlayer: starPlayer,
        starters: starters,
        mappedCourtTeamId: mapAbbrToCourtTeamId(team.abbr, idx)
    };
}
var HYBRID_ALL_TEAMS = _rosterStore.DEFAULT_ALL_TEAMS.map(function(t, i) {
    return teamDataToSummary(t, i);
});
var ERA_POOL_META = [
    {
        id: 'NBA_2K14',
        label: '2013-14 2K14 (30)',
        shortLabel: '2K14 NBA',
        accent: '#E11D48'
    },
    {
        id: 'NBA_2K26',
        label: '2025-26 2K26 (30)',
        shortLabel: '2K26 NBA',
        accent: '#F59E0B'
    },
    {
        id: 'LEGENDS',
        label: 'LEGENDS (4)',
        shortLabel: 'LEGENDS',
        accent: '#A855F7'
    },
    {
        id: 'EUROLEAGUE_14',
        label: "EUROLEAGUE '14 (4)",
        shortLabel: 'EURO',
        accent: '#38BDF8'
    },
    {
        id: 'THE_W',
        label: 'THE W / WNBA (4)',
        shortLabel: 'THE W',
        accent: '#FB923C'
    }
];
var VENUE_OPTIONS = [
    {
        id: 'ARENA_2K26',
        label: '2K26 Next-Gen NBA Arena',
        courtTheme: 'nba_arena',
        eraNote: 'Official ProPLAY Hardwood'
    },
    {
        id: 'ARENA_2K14',
        label: '2K14 Classic Arena',
        courtTheme: 'nba_arena',
        eraNote: '2014 Finals Spotlight Gold'
    },
    {
        id: 'SKYLINE_PARK',
        label: 'Skyline Park (2K26)',
        courtTheme: 'park',
        eraNote: 'Golden-Hour City Rooftop'
    },
    {
        id: 'RIVET_CITY',
        label: 'Rivet City Rooftops',
        courtTheme: 'the_rec',
        eraNote: 'Classic Park Industrial'
    },
    {
        id: 'SUNSET_BEACH',
        label: 'Sunset Beach Courts',
        courtTheme: 'park',
        eraNote: 'Palm Oceanfront Park'
    },
    {
        id: 'OLD_TOWN',
        label: 'Old Town Flyers Park',
        courtTheme: 'proving_grounds',
        eraNote: 'Heritage Boardwalk Park'
    },
    {
        id: 'BLACKTOP_CAGE',
        label: 'Blacktop Cage',
        courtTheme: 'blacktop',
        eraNote: 'Chain-Link Streetball'
    },
    {
        id: 'STREET_KINGS',
        label: 'Street Kings Plaza',
        courtTheme: 'street_kings',
        eraNote: '2K26 Boss Arena'
    },
    {
        id: 'EUROLEAGUE_PALACE',
        label: 'EuroLeague Palace',
        courtTheme: 'proving_grounds',
        eraNote: 'FIBA / Euro 2K14'
    },
    {
        id: 'WNBA_ARENA',
        label: 'WNBA Arena',
        courtTheme: 'wnba_arena',
        eraNote: 'The W Broadcast'
    }
];
function getAllLiveHybridTeams() {
    return _rosterStore.RosterStore.getAllTeams().map(function(t, i) {
        return teamDataToSummary(t, i);
    });
}
function getTeamsByEraPool(pool) {
    var targetEra = poolToTeamEra(pool);
    return _rosterStore.RosterStore.getTeamsByEra(targetEra).map(function(t, i) {
        return teamDataToSummary(t, i);
    });
}
function getHybridTeamById(id) {
    var canon = (0, _rosterStore.resolveCanonicalTeamId)(id);
    var all = _rosterStore.RosterStore.getAllTeams();
    var idx = all.findIndex(function(t) {
        return t.id === canon;
    });
    if (idx >= 0) return teamDataToSummary(all[idx], idx);
    return teamDataToSummary(all[0], 0);
}
var TeamEmblemSVG = function TeamEmblemSVG(param) {
    var team = param.team, _param_size = param.size, size = _param_size === void 0 ? 76 : _param_size;
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_TeamLogo.TeamLogo, {
        id: team.id,
        abbr: team.abbr,
        name: team.fullName,
        era: poolToTeamEra(team.eraPool),
        primaryColor: team.primaryColor,
        secondaryColor: team.secondaryColor,
        accentColor: team.accentColor,
        ovr: team.ovr,
        shape: team.emblemStyle,
        size: size
    });
};

});
// === MODULE: src/games/hoops-2k26/nba2k14/data/modesData ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/data/modesData", function(require, module, exports) {
// ============================================================================
// NBA 2K14 — Modes Data: 2K Beats (20 Tracks), Path to Greatness, Park Courts,
// Achievements (25), Locker Codes, Training Drills, Hot Zones & NBA Today
// ============================================================================
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
    get ACHIEVEMENTS_25 () {
        return ACHIEVEMENTS_25;
    },
    get ALL_HOT_ZONE_IDS () {
        return ALL_HOT_ZONE_IDS;
    },
    get BEATS_2K14_TRACKLIST () {
        return BEATS_2K14_TRACKLIST;
    },
    get DUNK_CONTEST_MOVES () {
        return DUNK_CONTEST_MOVES;
    },
    get HOT_ZONE_LABELS () {
        return HOT_ZONE_LABELS;
    },
    get LOCKER_CODES () {
        return LOCKER_CODES;
    },
    get NBA_TODAY_MATCHUPS () {
        return NBA_TODAY_MATCHUPS;
    },
    get PARK_COURTS () {
        return PARK_COURTS;
    },
    get PARK_REP_TIERS () {
        return PARK_REP_TIERS;
    },
    get PATH_TO_GREATNESS_CHAPTERS () {
        return PATH_TO_GREATNESS_CHAPTERS;
    },
    get SIGNATURE_ANIMATION_SETS () {
        return SIGNATURE_ANIMATION_SETS;
    },
    get TRAINING_DRILLS () {
        return TRAINING_DRILLS;
    },
    get classifyShotZone () {
        return classifyShotZone;
    },
    get getParkRepTier () {
        return getParkRepTier;
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
var BEATS_2K14_TRACKLIST = [
    {
        id: 't01',
        title: 'Started From The Bottom (Arena Mix)',
        artist: 'King James Curated · 01',
        bpm: 86,
        rootMidi: 46,
        scale: [
            0,
            2,
            3,
            7,
            10
        ],
        style: 'trap'
    },
    {
        id: 't02',
        title: 'All Of The Lights (Brass Cut)',
        artist: 'King James Curated · 02',
        bpm: 120,
        rootMidi: 48,
        scale: [
            0,
            3,
            5,
            7,
            10
        ],
        style: 'anthem'
    },
    {
        id: 't03',
        title: 'In The Air Tonight (Tunnel Dub)',
        artist: 'King James Curated · 03',
        bpm: 95,
        rootMidi: 50,
        scale: [
            0,
            2,
            3,
            5,
            7,
            8,
            10
        ],
        style: 'rock_arena'
    },
    {
        id: 't04',
        title: 'Radioactive (Arena Pulse)',
        artist: 'King James Curated · 04',
        bpm: 136,
        rootMidi: 47,
        scale: [
            0,
            2,
            3,
            7,
            10
        ],
        style: 'rock_arena'
    },
    {
        id: 't05',
        title: 'Hate Me Now (Championship Flip)',
        artist: 'King James Curated · 05',
        bpm: 92,
        rootMidi: 45,
        scale: [
            0,
            1,
            4,
            5,
            7,
            8
        ],
        style: 'anthem'
    },
    {
        id: 't06',
        title: "Can't Hold Us (Fastbreak Groove)",
        artist: 'King James Curated · 06',
        bpm: 128,
        rootMidi: 52,
        scale: [
            0,
            2,
            4,
            7,
            9
        ],
        style: 'anthem'
    },
    {
        id: 't07',
        title: 'Blurred Lines (Court Funk)',
        artist: 'King James Curated · 07',
        bpm: 120,
        rootMidi: 43,
        scale: [
            0,
            2,
            4,
            7,
            9,
            10
        ],
        style: 'synth_funk'
    },
    {
        id: 't08',
        title: 'Lost! (Hardwood Echo)',
        artist: 'King James Curated · 08',
        bpm: 102,
        rootMidi: 48,
        scale: [
            0,
            3,
            5,
            7,
            10
        ],
        style: 'rock_arena'
    },
    {
        id: 't09',
        title: 'Get Lucky (South Beach Mix)',
        artist: 'King James Curated · 09',
        bpm: 116,
        rootMidi: 47,
        scale: [
            0,
            2,
            3,
            5,
            7,
            9,
            10
        ],
        style: 'synth_funk'
    },
    {
        id: 't10',
        title: 'Now Or Never (4th Quarter Mix)',
        artist: 'King James Curated · 10',
        bpm: 96,
        rootMidi: 49,
        scale: [
            0,
            3,
            5,
            7,
            10
        ],
        style: 'boom_bap'
    },
    {
        id: 't11',
        title: 'Who Do We Think We Are',
        artist: 'King James Curated · 11',
        bpm: 88,
        rootMidi: 44,
        scale: [
            0,
            2,
            3,
            7,
            8,
            10
        ],
        style: 'boom_bap'
    },
    {
        id: 't12',
        title: 'Not Afraid (Finals Anthem)',
        artist: 'King James Curated · 12',
        bpm: 86,
        rootMidi: 48,
        scale: [
            0,
            3,
            5,
            7,
            10
        ],
        style: 'anthem'
    },
    {
        id: 't13',
        title: 'Long Run (Blacktop Bounce)',
        artist: 'King James Curated · 13',
        bpm: 94,
        rootMidi: 46,
        scale: [
            0,
            3,
            5,
            6,
            7,
            10
        ],
        style: 'boom_bap'
    },
    {
        id: 't14',
        title: 'Elevator (Miami Spotlight)',
        artist: 'King James Curated · 14',
        bpm: 110,
        rootMidi: 51,
        scale: [
            0,
            2,
            3,
            7,
            10
        ],
        style: 'trap'
    },
    {
        id: 't15',
        title: 'Gorilla (Rim Shaker)',
        artist: 'King James Curated · 15',
        bpm: 126,
        rootMidi: 45,
        scale: [
            0,
            2,
            3,
            5,
            7,
            10
        ],
        style: 'rock_arena'
    },
    {
        id: 't16',
        title: 'The Ruler Is Back (Brass Loop)',
        artist: 'King James Curated · 16',
        bpm: 93,
        rootMidi: 43,
        scale: [
            0,
            3,
            5,
            7,
            10
        ],
        style: 'anthem'
    },
    {
        id: 't17',
        title: 'Coldest Winter (Clutch Synth)',
        artist: 'King James Curated · 17',
        bpm: 108,
        rootMidi: 46,
        scale: [
            0,
            2,
            3,
            5,
            7,
            8
        ],
        style: 'synth_funk'
    },
    {
        id: 't18',
        title: 'Para Los Rumberos (Miami Heat)',
        artist: 'King James Curated · 18',
        bpm: 114,
        rootMidi: 50,
        scale: [
            0,
            2,
            4,
            5,
            7,
            9
        ],
        style: 'synth_funk'
    },
    {
        id: 't19',
        title: 'Clint Eastwood (Street Cipher)',
        artist: 'King James Curated · 19',
        bpm: 84,
        rootMidi: 42,
        scale: [
            0,
            3,
            5,
            6,
            7,
            10
        ],
        style: 'boom_bap'
    },
    {
        id: 't20',
        title: 'King James Crown (2K14 Theme)',
        artist: '2K Sports Studio · 20',
        bpm: 98,
        rootMidi: 48,
        scale: [
            0,
            2,
            3,
            7,
            10
        ],
        style: 'anthem'
    }
];
var NBA_TODAY_MATCHUPS = [
    {
        id: 'nt1',
        awayId: 'mia',
        homeId: 'sas',
        label: 'Finals Rematch',
        arena: 'AT&T Center',
        tipTime: '8:00 PM ET'
    },
    {
        id: 'nt2',
        awayId: 'okc',
        homeId: 'lac',
        label: 'West Showdown',
        arena: 'Staples Center',
        tipTime: '10:30 PM ET'
    },
    {
        id: 'nt3',
        awayId: 'chi',
        homeId: 'nyk',
        label: 'East Classic',
        arena: 'Madison Square Garden',
        tipTime: '7:30 PM ET'
    },
    {
        id: 'nt4',
        awayId: 'gsw',
        homeId: 'hou',
        label: 'Splash vs Dwight',
        arena: 'Toyota Center',
        tipTime: '8:30 PM ET'
    },
    {
        id: 'nt5',
        awayId: 'ind',
        homeId: 'mia',
        label: 'ECF Grudge Match',
        arena: 'AmericanAirlines Arena',
        tipTime: '8:00 PM ET'
    }
];
var PATH_TO_GREATNESS_CHAPTERS = [
    // PATH A: HEAT DYNASTY (7 Scenarios)
    {
        id: 'hd_1',
        path: 'heat_dynasty',
        index: 1,
        title: 'Ring Night Statement',
        subtitle: 'vs Chicago Bulls · Opening Night',
        story: 'Derrick Rose returns to crash ring night in Miami. Set the tone for the Heat 3-Peat.',
        userTeamId: 'mia',
        oppTeamId: 'chi',
        courtEnv: 'nba',
        startQuarter: 3,
        startClockSec: 180,
        startUserScore: 54,
        startOppScore: 56,
        objectives: {
            bronze: 'Win the game',
            silver: 'Score 12+ pts with LeBron & win',
            gold: 'Win by 6+ & score 16+ pts with LeBron',
            lebronPtsTarget: 16,
            winMarginTarget: 6
        }
    },
    {
        id: 'hd_2',
        path: 'heat_dynasty',
        index: 2,
        title: 'Battle for the East Crown',
        subtitle: 'vs Indiana Pacers · Bankers Life',
        story: 'Paul George and Roy Hibbert have locked down the paint. Break Indiana on the road.',
        userTeamId: 'mia',
        oppTeamId: 'ind',
        courtEnv: 'nba',
        startQuarter: 4,
        startClockSec: 240,
        startUserScore: 74,
        startOppScore: 79,
        objectives: {
            bronze: 'Erase the 5-pt deficit & win',
            silver: 'Score 10+ with LeBron & win',
            gold: 'Win by 5+ & score 14+ with LeBron',
            lebronPtsTarget: 14,
            winMarginTarget: 5
        }
    },
    {
        id: 'hd_3',
        path: 'heat_dynasty',
        index: 3,
        title: 'Brooklyn Veterans Clash',
        subtitle: 'vs Brooklyn Nets · Barclays Center',
        story: 'Pierce, Garnett, and Deron Williams formed a superteam to topple Miami.',
        userTeamId: 'mia',
        oppTeamId: 'bkn',
        courtEnv: 'nba',
        startQuarter: 4,
        startClockSec: 210,
        startUserScore: 78,
        startOppScore: 80,
        objectives: {
            bronze: 'Defeat Brooklyn',
            silver: 'Score 10+ with LeBron & win',
            gold: 'Win by 6+ with LeBron leading',
            lebronPtsTarget: 14,
            winMarginTarget: 6
        }
    },
    {
        id: 'hd_4',
        path: 'heat_dynasty',
        index: 4,
        title: 'Garden Spotlight',
        subtitle: 'vs New York Knicks · MSG',
        story: 'Carmelo Anthony is red hot under the bright lights of Madison Square Garden.',
        userTeamId: 'mia',
        oppTeamId: 'nyk',
        courtEnv: 'nba',
        startQuarter: 3,
        startClockSec: 180,
        startUserScore: 62,
        startOppScore: 64,
        objectives: {
            bronze: 'Win at MSG',
            silver: 'Score 12+ with LeBron & win',
            gold: 'Win by 7+ & score 16+ with LeBron',
            lebronPtsTarget: 16,
            winMarginTarget: 7
        }
    },
    {
        id: 'hd_5',
        path: 'heat_dynasty',
        index: 5,
        title: 'Space City Showdown',
        subtitle: 'vs Houston Rockets · Toyota Center',
        story: 'Dwight Howard and James Harden push the pace. Dominate the paint and transition.',
        userTeamId: 'mia',
        oppTeamId: 'hou',
        courtEnv: 'nba',
        startQuarter: 4,
        startClockSec: 240,
        startUserScore: 81,
        startOppScore: 85,
        objectives: {
            bronze: 'Beat Houston',
            silver: 'Score 12+ with LeBron & win',
            gold: 'Win by 6+ & score 15+ with LeBron',
            lebronPtsTarget: 15,
            winMarginTarget: 6
        }
    },
    {
        id: 'hd_6',
        path: 'heat_dynasty',
        index: 6,
        title: 'MVP Duel in Loud City',
        subtitle: 'vs Oklahoma City Thunder · Finals Preview',
        story: 'Kevin Durant and Russell Westbrook want redemption for 2012.',
        userTeamId: 'mia',
        oppTeamId: 'okc',
        courtEnv: 'nba',
        startQuarter: 4,
        startClockSec: 240,
        startUserScore: 86,
        startOppScore: 91,
        objectives: {
            bronze: 'Come back to beat OKC',
            silver: 'Score 14+ with LeBron & win',
            gold: 'Win by 5+ & score 18+ with LeBron',
            lebronPtsTarget: 18,
            winMarginTarget: 5
        }
    },
    {
        id: 'hd_7',
        path: 'heat_dynasty',
        index: 7,
        title: 'The 3-Peat Dynasty — Game 7',
        subtitle: 'vs San Antonio Spurs · NBA Finals',
        story: 'Duncan, Parker, and Kawhi stand one quarter away from denying Miami history.',
        userTeamId: 'mia',
        oppTeamId: 'sas',
        courtEnv: 'nba',
        startQuarter: 4,
        startClockSec: 300,
        startUserScore: 84,
        startOppScore: 88,
        objectives: {
            bronze: 'Clinch the 3-Peat',
            silver: 'Score 14+ with LeBron & win',
            gold: 'Win by 6+ & score 18+ with LeBron',
            lebronPtsTarget: 18,
            winMarginTarget: 6
        }
    },
    // PATH B: FANTASTIC JOURNEY (6 What-If Chapters)
    {
        id: 'fj_1',
        path: 'fantastic_journey',
        index: 1,
        title: 'The King of New York',
        subtitle: 'What If LeBron Joined the Knicks? vs MIA',
        story: 'In an alternate 2014, LeBron teams up with Carmelo at MSG to face Dwyane Wade and Miami.',
        userTeamId: 'nyk',
        oppTeamId: 'mia',
        courtEnv: 'nba',
        startQuarter: 4,
        startClockSec: 240,
        startUserScore: 80,
        startOppScore: 83,
        objectives: {
            bronze: 'Win at MSG with NYK',
            silver: 'Score 12+ with LeBron & win',
            gold: 'Win by 6+ & score 16+ with LeBron',
            lebronPtsTarget: 16,
            winMarginTarget: 6
        }
    },
    {
        id: 'fj_2',
        path: 'fantastic_journey',
        index: 2,
        title: 'Homecoming in Cleveland',
        subtitle: 'What If LeBron Returned to CLE? vs GSW',
        story: 'Back in Wine & Gold alongside Kyrie Irving to stop Stephen Curry and the surging Warriors.',
        userTeamId: 'cle',
        oppTeamId: 'gsw',
        courtEnv: 'nba',
        startQuarter: 4,
        startClockSec: 240,
        startUserScore: 83,
        startOppScore: 88,
        objectives: {
            bronze: 'Deliver a Cleveland victory',
            silver: 'Score 12+ with LeBron & win',
            gold: 'Win by 6+ & score 16+ with LeBron',
            lebronPtsTarget: 16,
            winMarginTarget: 6
        }
    },
    {
        id: 'fj_3',
        path: 'fantastic_journey',
        index: 3,
        title: 'King vs Black Mamba',
        subtitle: 'LeBron vs Kobe Bryant · Staples Center',
        story: 'The Finals duel fans always dreamed of: LeBron vs Kobe in a fourth-quarter shootout.',
        userTeamId: 'mia',
        oppTeamId: 'lal',
        courtEnv: 'nba',
        startQuarter: 4,
        startClockSec: 240,
        startUserScore: 88,
        startOppScore: 91,
        objectives: {
            bronze: 'Outduel Kobe & win',
            silver: 'Score 14+ with LeBron & win',
            gold: 'Win by 6+ & score 18+ with LeBron',
            lebronPtsTarget: 18,
            winMarginTarget: 6
        }
    },
    {
        id: 'fj_4',
        path: 'fantastic_journey',
        index: 4,
        title: 'Lob City Ambush',
        subtitle: 'vs LA Clippers · High-Flying Duel',
        story: 'Chris Paul and Blake Griffin are throwing lobs all night. Shut down Lob City.',
        userTeamId: 'mia',
        oppTeamId: 'lac',
        courtEnv: 'nba',
        startQuarter: 4,
        startClockSec: 240,
        startUserScore: 85,
        startOppScore: 89,
        objectives: {
            bronze: 'Defeat the Clippers',
            silver: 'Score 12+ with LeBron & win',
            gold: 'Win by 7+ & score 16+ with LeBron',
            lebronPtsTarget: 16,
            winMarginTarget: 7
        }
    },
    {
        id: 'fj_5',
        path: 'fantastic_journey',
        index: 5,
        title: 'Euroleague Exhibition Clash',
        subtitle: 'Miami Heat vs Real Madrid · FIBA Rules',
        story: 'Take the Heat overseas for an international showdown under European arena atmosphere.',
        userTeamId: 'mia',
        oppTeamId: 'euro_rma',
        courtEnv: 'euroleague',
        startQuarter: 4,
        startClockSec: 240,
        startUserScore: 76,
        startOppScore: 78,
        objectives: {
            bronze: 'Beat Real Madrid',
            silver: 'Score 12+ with LeBron & win',
            gold: 'Win by 8+ & score 16+ with LeBron',
            lebronPtsTarget: 16,
            winMarginTarget: 8
        }
    },
    {
        id: 'fj_6',
        path: 'fantastic_journey',
        index: 6,
        title: 'Immortal Legacy: King vs GOAT',
        subtitle: "Miami Heat vs '95-96 Chicago Bulls",
        story: 'The ultimate fantasy matchup: 99 OVR LeBron James against 99 OVR Michael Jordan.',
        userTeamId: 'mia',
        oppTeamId: 'cls_96chi',
        courtEnv: 'nba',
        startQuarter: 4,
        startClockSec: 300,
        startUserScore: 88,
        startOppScore: 93,
        objectives: {
            bronze: "Defeat the '95-96 Bulls",
            silver: 'Score 15+ with LeBron & win',
            gold: 'Win by 5+ & score 20+ with LeBron',
            lebronPtsTarget: 20,
            winMarginTarget: 5
        }
    }
];
var ACHIEVEMENTS_25 = [
    {
        id: 'first_win',
        title: 'Tip-Off Victory',
        desc: 'Win your first game in any mode.',
        vcReward: 500
    },
    {
        id: 'triple_double',
        title: 'Triple-Double Machine',
        desc: 'Record 10+ PTS, 10+ REB, and 10+ AST with one player.',
        vcReward: 1500
    },
    {
        id: 'king_of_court',
        title: 'King of the Court',
        desc: 'Win a 5v5 game on The Park King of the Court.',
        vcReward: 1000
    },
    {
        id: 'buzzer_beater',
        title: 'Buzzer Beater',
        desc: 'Win a game decided by 3 points or fewer.',
        vcReward: 1000
    },
    {
        id: 'ten_zero_run',
        title: '10-0 Run',
        desc: 'Score 40+ points in a single regulation game.',
        vcReward: 800
    },
    {
        id: 'ptg_gold',
        title: 'Path to Greatness Gold',
        desc: 'Earn a 3-Star Gold rating in any Path to Greatness chapter.',
        vcReward: 1200
    },
    {
        id: 'downtown_king',
        title: 'Downtown 3PT King',
        desc: 'Make 5+ three-pointers in a single game or score 18+ in 3PT Shootout.',
        vcReward: 1000
    },
    {
        id: 'lockdown_5_steals',
        title: 'Lockdown 5 Steals',
        desc: 'Record 5+ team steals in a single match.',
        vcReward: 900
    },
    {
        id: 'posterizer_dunk',
        title: 'Posterizer Dunk',
        desc: 'Score 45+ points in Sprite Slam Dunk Contest or dominate the paint.',
        vcReward: 900
    },
    {
        id: 'green_machine',
        title: 'Green Release Artist',
        desc: 'Hit 5+ Excellent shot releases in a single game.',
        vcReward: 850
    },
    {
        id: 'double_double',
        title: 'Double-Double Workhorse',
        desc: 'Record a double-double with any player.',
        vcReward: 600
    },
    {
        id: 'euro_champ',
        title: 'Euroleague Conqueror',
        desc: 'Win a game using or against an official Euroleague club.',
        vcReward: 750
    },
    {
        id: 'classic_legend',
        title: 'Hardwood Historian',
        desc: 'Win a matchup featuring a Classic NBA team.',
        vcReward: 750
    },
    {
        id: 'mycareer_draft',
        title: 'Welcome to the League',
        desc: 'Complete the Rookie Showcase and get drafted in MyCAREER.',
        vcReward: 1200
    },
    {
        id: 'mycareer_a_plus',
        title: 'Coach’s Dream',
        desc: 'Finish a MyCAREER game with an A or A+ Teammate Grade.',
        vcReward: 1100
    },
    {
        id: 'park_streak_3',
        title: 'Hot Streak on the Blacktop',
        desc: 'Reach a 3-game win streak in The Park.',
        vcReward: 1200
    },
    {
        id: 'myteam_pack',
        title: 'Card Collector',
        desc: 'Open your Starter Pack and a Market Pack in MyTEAM.',
        vcReward: 600
    },
    {
        id: 'myteam_dom',
        title: 'Domination Starter',
        desc: 'Earn 3 stars against an NBA team in MyTEAM Domination.',
        vcReward: 900
    },
    {
        id: 'gm_trade',
        title: 'Blockbuster GM',
        desc: 'Complete a trade in The Association / MyGM.',
        vcReward: 700
    },
    {
        id: 'playoff_series',
        title: 'Playoff Advance',
        desc: 'Win a Playoff series in Playoffs mode.',
        vcReward: 1000
    },
    {
        id: 'locker_hunter',
        title: 'Locker Code VIP',
        desc: 'Redeem your first NBA 2K14 Locker Code.',
        vcReward: 500
    },
    {
        id: 'training_grad',
        title: 'Gym Rat',
        desc: 'Complete any Training Camp Pro Stick drill.',
        vcReward: 650
    },
    {
        id: 'twenty_pts',
        title: 'Bucket Getter',
        desc: 'Score 20+ points with a single player in one game.',
        vcReward: 750
    },
    {
        id: 'rim_protector',
        title: 'No-Fly Zone',
        desc: 'Record 4+ team blocks in a single match.',
        vcReward: 800
    },
    {
        id: 'win_streak_5',
        title: 'Dynasty Rising',
        desc: 'Achieve a 5-game overall win streak on your VIP Profile.',
        vcReward: 1500
    }
];
var LOCKER_CODES = [
    {
        code: 'KINGJAMES',
        label: 'King James Bundle (+5,000 VC, +2,000 SP & Gold LeBron MyTEAM Card)',
        vc: 5000,
        sp: 2000,
        mt: 1500,
        bonusCardPlayerName: 'LeBron James',
        bonusTier: 'Gold'
    },
    {
        code: '2K14LEGEND',
        label: '2K14 Legend Vault (+7,500 VC, +2,500 MT & Historic MJ Card)',
        vc: 7500,
        sp: 1500,
        mt: 2500,
        bonusCardPlayerName: 'Michael Jordan',
        bonusTier: 'Historic'
    },
    {
        code: 'BLACKTOP21',
        label: 'Blacktop Street Pack (+3,500 VC, +1,500 SP & +500 Park REP)',
        vc: 3500,
        sp: 1500,
        mt: 1000
    }
];
var PARK_COURTS = [
    {
        id: 'park_2v2_a',
        name: 'Sunset 2s · West',
        format: '2v2',
        playersPerSide: 2,
        targetScore: 21,
        halfCourt: true,
        xPct: 20,
        yPct: 26,
        gotNextX: 20,
        gotNextY: 40,
        squadName: 'Venice Ballers',
        streak: 3,
        oppOvr: 80,
        accentColor: '#F9A01B'
    },
    {
        id: 'park_2v2_b',
        name: 'Rucker 2s · East',
        format: '2v2',
        playersPerSide: 2,
        targetScore: 21,
        halfCourt: true,
        xPct: 80,
        yPct: 26,
        gotNextX: 80,
        gotNextY: 40,
        squadName: 'Harlem Flash',
        streak: 2,
        oppOvr: 82,
        accentColor: '#F9A01B'
    },
    {
        id: 'park_3v3_a',
        name: 'South Beach 3s',
        format: '3v3',
        playersPerSide: 3,
        targetScore: 21,
        halfCourt: true,
        xPct: 20,
        yPct: 74,
        gotNextX: 20,
        gotNextY: 60,
        squadName: 'Dade County Crew',
        streak: 5,
        oppOvr: 85,
        accentColor: '#CE1141'
    },
    {
        id: 'park_3v3_b',
        name: 'Midtown 3s',
        format: '3v3',
        playersPerSide: 3,
        targetScore: 21,
        halfCourt: true,
        xPct: 50,
        yPct: 78,
        gotNextX: 50,
        gotNextY: 64,
        squadName: 'Concrete Kings',
        streak: 4,
        oppOvr: 84,
        accentColor: '#CE1141'
    },
    {
        id: 'park_3v3_c',
        name: 'Pier 3s',
        format: '3v3',
        playersPerSide: 3,
        targetScore: 21,
        halfCourt: true,
        xPct: 80,
        yPct: 74,
        gotNextX: 80,
        gotNextY: 60,
        squadName: 'Bay Rim Rattlers',
        streak: 1,
        oppOvr: 81,
        accentColor: '#CE1141'
    },
    {
        id: 'park_5v5_king',
        name: 'KING OF THE COURT 5v5',
        format: '5v5',
        playersPerSide: 5,
        targetScore: 21,
        halfCourt: false,
        xPct: 50,
        yPct: 28,
        gotNextX: 50,
        gotNextY: 44,
        squadName: '2K14 Park Legends',
        streak: 7,
        oppOvr: 90,
        accentColor: '#F59E0B'
    }
];
var TRAINING_DRILLS = [
    {
        id: 'freestyle',
        title: 'Open Freestyle Shootaround',
        category: 'Freestyle',
        instruction: 'Practice jumpers, Pro Stick IsoMotion combos, Eurosteps, and dunks at your own pace.',
        targetReps: 10,
        spReward: 250
    },
    {
        id: 'jump_shot',
        title: 'Jump Shot Release Timing',
        category: 'Shooting',
        instruction: 'Hold Space (or Pro Stick) and release inside the green sweet spot to sink 5 jump shots.',
        targetReps: 5,
        spReward: 400
    },
    {
        id: 'isomotion',
        title: 'Pro Stick IsoMotion Crossovers',
        category: 'Pro Stick',
        instruction: 'Flick I/J/K/L (Right Stick) to chain crossovers & stepbacks, then score 4 buckets.',
        targetReps: 4,
        spReward: 450
    },
    {
        id: 'euro_hop',
        title: 'Euro Step & Hop Step Finishes',
        category: 'Pro Stick',
        instruction: 'Drive into the paint and tap Left/Right Pro Stick (J/L) while finishing 4 layups.',
        targetReps: 4,
        spReward: 450
    },
    {
        id: 'poster_dunk',
        title: 'Power & Flashy Poster Dunks',
        category: 'Pro Stick',
        instruction: 'Hold Sprint (Shift) driving toward the rim and press Shoot (Space) for 4 slams.',
        targetReps: 4,
        spReward: 450
    },
    {
        id: 'pick_roll',
        title: 'Pick & Roll Maestro Drill',
        category: 'Playmaking',
        instruction: 'Tap V to call a screen, turn the corner, and score or assist 4 times.',
        targetReps: 4,
        spReward: 500
    },
    {
        id: 'post_moves',
        title: 'Post Fadeaway & Hook Clinic',
        category: 'Shooting',
        instruction: 'Hold F to post up near the block and release a Post Fade or Hook for 4 makes.',
        targetReps: 4,
        spReward: 450
    },
    {
        id: 'alley_oop',
        title: 'Alley-Oop Lob Timing',
        category: 'Playmaking',
        instruction: 'Press C + Space to throw Alley-Oop lobs to cutting teammates 3 times.',
        targetReps: 3,
        spReward: 500
    },
    {
        id: 'intense_d',
        title: 'Intense D & Shot Contest',
        category: 'Defense',
        instruction: 'Hold C for Intense D and U for Hands Up to force 4 stops or steals.',
        targetReps: 4,
        spReward: 500
    }
];
var HOT_ZONE_LABELS = {
    restricted: 'Restricted Area',
    paint: 'Center Paint',
    paint_l: 'Left Paint Block',
    paint_r: 'Right Paint Block',
    mid_l_base: 'Left Baseline Mid',
    mid_r_base: 'Right Baseline Mid',
    mid_l_wing: 'Left Wing Mid',
    mid_r_wing: 'Right Wing Mid',
    mid_top: 'Top of Key Mid',
    three_l_corner: 'Left Corner 3',
    three_r_corner: 'Right Corner 3',
    three_l_wing: 'Left Wing 3',
    three_r_wing: 'Right Wing 3',
    three_top: 'Top of Key 3'
};
var ALL_HOT_ZONE_IDS = Object.keys(HOT_ZONE_LABELS);
function classifyShotZone(shooterX, shooterZ, hoopX, fibaRules) {
    if (fibaRules === void 0) fibaRules = false;
    var dx = Math.abs(hoopX - shooterX); // forward distance from hoop toward midcourt
    var dz = shooterZ; // lateral distance from center line
    var dist = Math.hypot(dx, dz);
    var threeArc = fibaRules ? 6.75 : 7.24;
    var cornerDist = fibaRules ? 6.6 : 6.71;
    var isCornerDepth = dx < 2.9;
    var isThree = isCornerDepth ? Math.abs(dz) >= cornerDist : dist >= threeArc;
    if (isThree) {
        if (isCornerDepth) {
            return {
                zone: dz < 0 ? 'three_l_corner' : 'three_r_corner',
                isThree: true,
                distMeters: dist
            };
        }
        if (Math.abs(dz) < 2.6) {
            return {
                zone: 'three_top',
                isThree: true,
                distMeters: dist
            };
        }
        return {
            zone: dz < 0 ? 'three_l_wing' : 'three_r_wing',
            isThree: true,
            distMeters: dist
        };
    }
    if (dist <= 1.55) {
        return {
            zone: 'restricted',
            isThree: false,
            distMeters: dist
        };
    }
    if (dx <= 4.6 && Math.abs(dz) <= 2.45) {
        if (Math.abs(dz) < 1.0) return {
            zone: 'paint',
            isThree: false,
            distMeters: dist
        };
        return {
            zone: dz < 0 ? 'paint_l' : 'paint_r',
            isThree: false,
            distMeters: dist
        };
    }
    if (isCornerDepth) {
        return {
            zone: dz < 0 ? 'mid_l_base' : 'mid_r_base',
            isThree: false,
            distMeters: dist
        };
    }
    if (Math.abs(dz) < 2.2) {
        return {
            zone: 'mid_top',
            isThree: false,
            distMeters: dist
        };
    }
    return {
        zone: dz < 0 ? 'mid_l_wing' : 'mid_r_wing',
        isThree: false,
        distMeters: dist
    };
}
var PARK_REP_TIERS = [
    {
        name: 'Rookie 1',
        minRep: 0
    },
    {
        name: 'Rookie 2',
        minRep: 400
    },
    {
        name: 'Rookie 3',
        minRep: 900
    },
    {
        name: 'Pro 1',
        minRep: 1600
    },
    {
        name: 'Pro 2',
        minRep: 2500
    },
    {
        name: 'Pro 3',
        minRep: 3800
    },
    {
        name: 'All-Star 1',
        minRep: 5500
    },
    {
        name: 'All-Star 2',
        minRep: 7800
    },
    {
        name: 'All-Star 3',
        minRep: 10500
    },
    {
        name: 'Legend 1',
        minRep: 14000
    },
    {
        name: 'Legend 3',
        minRep: 20000
    }
];
function getParkRepTier(rep) {
    var tier = PARK_REP_TIERS[0].name;
    for(var _iterator = _create_for_of_iterator_helper_loose(PARK_REP_TIERS), _step; !(_step = _iterator()).done;){
        var t = _step.value;
        if (rep >= t.minRep) tier = t.name;
    }
    return tier;
}
var DUNK_CONTEST_MOVES = [
    {
        id: 'tomahawk',
        name: 'King James Tomahawk',
        difficulty: 44,
        styleBonus: 5,
        airTime: 0.92
    },
    {
        id: 'windmill',
        name: '360 Baseline Windmill',
        difficulty: 48,
        styleBonus: 8,
        airTime: 1.05
    },
    {
        id: 'between_legs',
        name: 'Eastbay Between-The-Legs',
        difficulty: 50,
        styleBonus: 10,
        airTime: 1.1
    },
    {
        id: 'free_throw',
        name: 'Air Jordan Free-Throw Line',
        difficulty: 50,
        styleBonus: 10,
        airTime: 1.18
    },
    {
        id: 'reverse_pump',
        name: 'Double-Clutch Reverse',
        difficulty: 46,
        styleBonus: 6,
        airTime: 0.98
    }
];
var SIGNATURE_ANIMATION_SETS = {
    jumpShotForms: [
        'LeBron James',
        'Ray Allen',
        'Kobe Bryant',
        'Stephen Curry',
        'Michael Jordan',
        'Carmelo Anthony',
        'Dirk Nowitzki'
    ],
    dunkPackages: [
        'Athletic One-Handers',
        'LeBron Signature',
        'Blake Griffin Power',
        'Michael Jordan Air',
        'Vince Carter 360s',
        'Rim Grazers'
    ],
    dribbleStyles: [
        'Kyrie Irving Iso',
        'Chris Paul Crafty',
        'Derrick Rose Explosive',
        'LeBron Power',
        'Jamal Crawford Flashy'
    ]
};

});

})(window.ArcadeMod);
