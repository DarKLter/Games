(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/hybrid/rosters2K14 ===
ArcadeMod.define("src/games/hoops-2k26/hybrid/rosters2K14", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ROSTERS_2K14", {
    enumerable: true,
    get: function() {
        return ROSTERS_2K14;
    }
});
var _rosterTypes = require("./rosterTypes");
var ROSTERS_2K14 = [
    // ======================== EASTERN CONFERENCE (15) ========================
    (0, _rosterTypes.makeTeam)({
        id: '2k14_mia',
        era: '2K14',
        city: 'Miami',
        name: 'Heat',
        abbr: 'MIA',
        conference: 'EAST',
        arena: 'AmericanAirlines Arena',
        colors: [
            '#98002E',
            '#F9A01B',
            '#FFFFFF',
            '#c89454',
            '#98002E'
        ],
        players: [
            [
                'Mario Chalmers',
                15,
                'PG',
                78,
                'ROLE_GUARD',
                74
            ],
            [
                'Dwyane Wade',
                3,
                'SG',
                91,
                'SLASHER',
                76,
                {
                    attrs: {
                        midRange: 91,
                        drivingLayup: 94,
                        drivingDunk: 90,
                        perimeterDef: 88
                    },
                    badges: {
                        LAYUP_MIXMASTER: 'HOF',
                        POSTERIZER: 'HOF',
                        PHYSICAL_FINISHER: 'HOF',
                        SHIFTY_SHOOTER: 'GOLD'
                    }
                }
            ],
            [
                'LeBron James',
                6,
                'SF',
                99,
                'SUPERSTAR_WING',
                80,
                {
                    weightLbs: 250,
                    attrs: {
                        closeShot: 98,
                        drivingDunk: 98,
                        drivingLayup: 98,
                        midRange: 92,
                        threePt: 86,
                        passAccuracy: 94,
                        speed: 94,
                        strength: 95,
                        perimeterDef: 95,
                        interiorDef: 88,
                        steal: 89,
                        block: 84
                    },
                    badges: {
                        POSTERIZER: 'LEGEND',
                        PHYSICAL_FINISHER: 'LEGEND',
                        DIMER: 'LEGEND',
                        PERIMETER_CHALLENGER: 'LEGEND',
                        HIGH_FLYING_DENIER: 'LEGEND',
                        LIGHTNING_LAUNCH: 'HOF',
                        DEADEYE: 'HOF'
                    },
                    appearance: {
                        headband: true,
                        armSleeve: 'LEFT'
                    }
                }
            ],
            [
                'Shane Battier',
                31,
                'PF',
                76,
                'TWO_WAY_WING',
                80,
                {
                    attrs: {
                        threePt: 84,
                        perimeterDef: 86
                    }
                }
            ],
            [
                'Chris Bosh',
                1,
                'C',
                86,
                'STRETCH_BIG',
                83,
                {
                    attrs: {
                        midRange: 90,
                        threePt: 80,
                        closeShot: 88,
                        defReb: 84
                    },
                    badges: {
                        SET_SHOT_SPECIALIST: 'GOLD',
                        DEADEYE: 'GOLD',
                        PAINT_PATROLLER: 'SILVER'
                    }
                }
            ],
            [
                'Ray Allen',
                34,
                'SG',
                81,
                'SHARPSHOOTER',
                77,
                {
                    attrs: {
                        threePt: 95,
                        freeThrow: 93
                    },
                    badges: {
                        DEADEYE: 'HOF',
                        SET_SHOT_SPECIALIST: 'LEGEND',
                        LIMITLESS_RANGE: 'HOF'
                    }
                }
            ],
            [
                'Chris Andersen',
                11,
                'C',
                77,
                'RIM_PROTECTOR',
                82,
                {
                    badges: {
                        POGO_STICK: 'GOLD',
                        HIGH_FLYING_DENIER: 'GOLD'
                    }
                }
            ],
            [
                'Norris Cole',
                30,
                'PG',
                75,
                'ROLE_GUARD',
                74
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_ind',
        era: '2K14',
        city: 'Indiana',
        name: 'Pacers',
        abbr: 'IND',
        conference: 'EAST',
        arena: 'Bankers Life Fieldhouse',
        colors: [
            '#002D62',
            '#FDBB30',
            '#FFFFFF',
            '#cc9958',
            '#002D62'
        ],
        players: [
            [
                'George Hill',
                3,
                'PG',
                79,
                'TWO_WAY_WING',
                75
            ],
            [
                'Lance Stephenson',
                1,
                'SG',
                79,
                'SLASHER',
                77,
                {
                    badges: {
                        ANKLE_ASSASSIN: 'GOLD',
                        PHYSICAL_FINISHER: 'SILVER'
                    }
                }
            ],
            [
                'Paul George',
                24,
                'SF',
                90,
                'TWO_WAY_WING',
                81,
                {
                    attrs: {
                        threePt: 87,
                        drivingDunk: 92,
                        perimeterDef: 94,
                        steal: 90
                    },
                    badges: {
                        PERIMETER_CHALLENGER: 'HOF',
                        POSTERIZER: 'HOF',
                        DEADEYE: 'GOLD',
                        INTERCEPTOR: 'HOF'
                    }
                }
            ],
            [
                'David West',
                21,
                'PF',
                82,
                'POST_SCORER',
                81,
                {
                    attrs: {
                        midRange: 89,
                        strength: 89
                    }
                }
            ],
            [
                'Roy Hibbert',
                55,
                'C',
                83,
                'RIM_PROTECTOR',
                86,
                {
                    attrs: {
                        interiorDef: 94,
                        block: 92
                    },
                    badges: {
                        PAINT_PATROLLER: 'HOF',
                        BOXOUT_BEAST: 'GOLD'
                    }
                }
            ],
            [
                'Danny Granger',
                33,
                'SF',
                78,
                'SHARPSHOOTER',
                81
            ],
            [
                'Luis Scola',
                4,
                'PF',
                78,
                'POST_SCORER',
                81
            ],
            [
                'C.J. Watson',
                32,
                'PG',
                75,
                'ROLE_GUARD',
                74
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_chi',
        era: '2K14',
        city: 'Chicago',
        name: 'Bulls',
        abbr: 'CHI',
        conference: 'EAST',
        arena: 'United Center',
        colors: [
            '#CE1141',
            '#111111',
            '#FFFFFF',
            '#c89252',
            '#CE1141'
        ],
        players: [
            [
                'Derrick Rose',
                1,
                'PG',
                92,
                'SLASHER',
                75,
                {
                    attrs: {
                        speed: 97,
                        acceleration: 98,
                        drivingLayup: 96,
                        drivingDunk: 93,
                        ballHandle: 94,
                        vertical: 95
                    },
                    badges: {
                        LIGHTNING_LAUNCH: 'LEGEND',
                        LAYUP_MIXMASTER: 'LEGEND',
                        POSTERIZER: 'HOF',
                        ANKLE_ASSASSIN: 'HOF'
                    }
                }
            ],
            [
                'Jimmy Butler',
                21,
                'SG',
                81,
                'TWO_WAY_WING',
                79,
                {
                    attrs: {
                        perimeterDef: 91,
                        steal: 87
                    },
                    badges: {
                        PERIMETER_CHALLENGER: 'HOF',
                        GLOVE: 'GOLD'
                    }
                }
            ],
            [
                'Luol Deng',
                9,
                'SF',
                83,
                'TWO_WAY_WING',
                81
            ],
            [
                'Carlos Boozer',
                5,
                'PF',
                80,
                'POST_SCORER',
                81
            ],
            [
                'Joakim Noah',
                13,
                'C',
                86,
                'POINT_CENTER',
                83,
                {
                    attrs: {
                        interiorDef: 93,
                        perimeterDef: 84,
                        defReb: 91,
                        passAccuracy: 85
                    },
                    badges: {
                        PAINT_PATROLLER: 'HOF',
                        REBOUND_CHASER: 'HOF',
                        DIMER: 'GOLD',
                        POGO_STICK: 'GOLD'
                    }
                }
            ],
            [
                'Taj Gibson',
                22,
                'PF',
                79,
                'RIM_PROTECTOR',
                81
            ],
            [
                'Kirk Hinrich',
                12,
                'PG',
                76,
                'ROLE_GUARD',
                76
            ],
            [
                'Mike Dunleavy',
                34,
                'SF',
                76,
                'SHARPSHOOTER',
                81
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_nyk',
        era: '2K14',
        city: 'New York',
        name: 'Knicks',
        abbr: 'NYK',
        conference: 'EAST',
        arena: 'Madison Square Garden',
        colors: [
            '#006BB6',
            '#F58426',
            '#FFFFFF',
            '#ce9d5c',
            '#006BB6'
        ],
        players: [
            [
                'Raymond Felton',
                2,
                'PG',
                78,
                'ROLE_GUARD',
                73
            ],
            [
                'Iman Shumpert',
                21,
                'SG',
                77,
                'TWO_WAY_WING',
                77,
                {
                    appearance: {
                        hairStyle: 'AFRO'
                    }
                }
            ],
            [
                'Carmelo Anthony',
                7,
                'SF',
                92,
                'SUPERSTAR_WING',
                80,
                {
                    attrs: {
                        midRange: 96,
                        threePt: 89,
                        closeShot: 92,
                        strength: 88
                    },
                    badges: {
                        DEADEYE: 'LEGEND',
                        SHIFTY_SHOOTER: 'LEGEND',
                        SET_SHOT_SPECIALIST: 'HOF',
                        PHYSICAL_FINISHER: 'GOLD'
                    },
                    appearance: {
                        headband: true
                    }
                }
            ],
            [
                "Amar'e Stoudemire",
                1,
                'PF',
                79,
                'POST_SCORER',
                82
            ],
            [
                'Tyson Chandler',
                6,
                'C',
                82,
                'RIM_PROTECTOR',
                85,
                {
                    badges: {
                        PAINT_PATROLLER: 'HOF',
                        AERIAL_WIZARD: 'GOLD',
                        BOXOUT_BEAST: 'GOLD'
                    }
                }
            ],
            [
                'J.R. Smith',
                8,
                'SG',
                81,
                'SHARPSHOOTER',
                78,
                {
                    attrs: {
                        threePt: 89,
                        drivingDunk: 90
                    },
                    badges: {
                        SHIFTY_SHOOTER: 'HOF',
                        LIMITLESS_RANGE: 'GOLD',
                        POSTERIZER: 'GOLD'
                    }
                }
            ],
            [
                'Metta World Peace',
                51,
                'SF',
                76,
                'TWO_WAY_WING',
                79
            ],
            [
                'Tim Hardaway Jr.',
                5,
                'SG',
                76,
                'SHARPSHOOTER',
                78
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_bkn',
        era: '2K14',
        city: 'Brooklyn',
        name: 'Nets',
        abbr: 'BKN',
        conference: 'EAST',
        arena: 'Barclays Center',
        colors: [
            '#111111',
            '#FFFFFF',
            '#A1A1AA',
            '#b99364',
            '#111111'
        ],
        players: [
            [
                'Deron Williams',
                8,
                'PG',
                86,
                'ELITE_PG',
                75,
                {
                    badges: {
                        ANKLE_ASSASSIN: 'HOF',
                        DIMER: 'HOF',
                        HANDLES_FOR_DAYS: 'GOLD'
                    }
                }
            ],
            [
                'Joe Johnson',
                7,
                'SG',
                84,
                'SHARPSHOOTER',
                79,
                {
                    badges: {
                        DEADEYE: 'HOF',
                        SHIFTY_SHOOTER: 'HOF',
                        FLOAT_GAME: 'GOLD'
                    }
                }
            ],
            [
                'Paul Pierce',
                34,
                'SF',
                83,
                'SUPERSTAR_WING',
                79,
                {
                    badges: {
                        DEADEYE: 'HOF',
                        SET_SHOT_SPECIALIST: 'GOLD'
                    }
                }
            ],
            [
                'Kevin Garnett',
                2,
                'PF',
                82,
                'RIM_PROTECTOR',
                83,
                {
                    badges: {
                        PAINT_PATROLLER: 'HOF',
                        BOXOUT_BEAST: 'HOF'
                    }
                }
            ],
            [
                'Brook Lopez',
                11,
                'C',
                84,
                'POST_SCORER',
                84
            ],
            [
                'Andrei Kirilenko',
                47,
                'SF',
                79,
                'TWO_WAY_WING',
                81
            ],
            [
                'Jason Terry',
                31,
                'SG',
                77,
                'SHARPSHOOTER',
                74
            ],
            [
                'Shaun Livingston',
                14,
                'PG',
                77,
                'ROLE_GUARD',
                79
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_bos',
        era: '2K14',
        city: 'Boston',
        name: 'Celtics',
        abbr: 'BOS',
        conference: 'EAST',
        arena: 'TD Garden',
        colors: [
            '#007A33',
            '#BA9653',
            '#FFFFFF',
            '#d3a260',
            '#007A33'
        ],
        players: [
            [
                'Rajon Rondo',
                9,
                'PG',
                89,
                'ELITE_PG',
                73,
                {
                    attrs: {
                        passAccuracy: 97,
                        ballHandle: 93,
                        steal: 90,
                        perimeterDef: 89,
                        threePt: 65
                    },
                    badges: {
                        DIMER: 'LEGEND',
                        VERSATILE_VISIONARY: 'LEGEND',
                        GLOVE: 'HOF',
                        UNPLUCKABLE: 'HOF'
                    }
                }
            ],
            [
                'Avery Bradley',
                0,
                'SG',
                78,
                'TWO_WAY_WING',
                74,
                {
                    attrs: {
                        perimeterDef: 90,
                        steal: 86
                    },
                    badges: {
                        PERIMETER_CHALLENGER: 'HOF',
                        GLOVE: 'GOLD'
                    }
                }
            ],
            [
                'Jeff Green',
                8,
                'SF',
                80,
                'SLASHER',
                81
            ],
            [
                'Jared Sullinger',
                7,
                'PF',
                77,
                'POST_SCORER',
                81
            ],
            [
                'Kelly Olynyk',
                41,
                'C',
                75,
                'STRETCH_BIG',
                84
            ],
            [
                'Gerald Wallace',
                45,
                'SF',
                77,
                'TWO_WAY_WING',
                79
            ],
            [
                'Brandon Bass',
                30,
                'PF',
                77,
                'ROLE_FORWARD',
                80
            ],
            [
                'Courtney Lee',
                11,
                'SG',
                76,
                'SHARPSHOOTER',
                77
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_tor',
        era: '2K14',
        city: 'Toronto',
        name: 'Raptors',
        abbr: 'TOR',
        conference: 'EAST',
        arena: 'Air Canada Centre',
        colors: [
            '#CE1141',
            '#111111',
            '#A1A1AA',
            '#c89558',
            '#CE1141'
        ],
        players: [
            [
                'Kyle Lowry',
                7,
                'PG',
                82,
                'ELITE_PG',
                72,
                {
                    badges: {
                        DIMER: 'GOLD',
                        PERIMETER_CHALLENGER: 'GOLD',
                        PHYSICAL_FINISHER: 'SILVER'
                    }
                }
            ],
            [
                'DeMar DeRozan',
                10,
                'SG',
                83,
                'SLASHER',
                79,
                {
                    attrs: {
                        midRange: 89,
                        drivingDunk: 92
                    },
                    badges: {
                        POSTERIZER: 'HOF',
                        SHIFTY_SHOOTER: 'GOLD'
                    }
                }
            ],
            [
                'Rudy Gay',
                22,
                'SF',
                83,
                'SUPERSTAR_WING',
                80
            ],
            [
                'Amir Johnson',
                15,
                'PF',
                77,
                'ROLE_BIG',
                81
            ],
            [
                'Jonas Valanciunas',
                17,
                'C',
                78,
                'POST_SCORER',
                84
            ],
            [
                'Terrence Ross',
                31,
                'SG',
                77,
                'SLASHER',
                79,
                {
                    attrs: {
                        drivingDunk: 94,
                        vertical: 95
                    },
                    badges: {
                        POSTERIZER: 'HOF',
                        AERIAL_WIZARD: 'GOLD'
                    }
                }
            ],
            [
                'Tyler Hansbrough',
                50,
                'PF',
                75,
                'ROLE_BIG',
                81
            ],
            [
                'Greivis Vasquez',
                21,
                'PG',
                76,
                'ROLE_GUARD',
                78
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_was',
        era: '2K14',
        city: 'Washington',
        name: 'Wizards',
        abbr: 'WAS',
        conference: 'EAST',
        arena: 'Verizon Center',
        colors: [
            '#002B5C',
            '#E31837',
            '#C4CED4',
            '#ca9658',
            '#002B5C'
        ],
        players: [
            [
                'John Wall',
                2,
                'PG',
                86,
                'ELITE_PG',
                76,
                {
                    attrs: {
                        speed: 97,
                        acceleration: 97,
                        passAccuracy: 91,
                        drivingDunk: 89,
                        steal: 87
                    },
                    badges: {
                        LIGHTNING_LAUNCH: 'LEGEND',
                        DIMER: 'HOF',
                        HIGH_FLYING_DENIER: 'GOLD'
                    }
                }
            ],
            [
                'Bradley Beal',
                3,
                'SG',
                81,
                'SHARPSHOOTER',
                77,
                {
                    attrs: {
                        threePt: 88,
                        midRange: 86
                    }
                }
            ],
            [
                'Trevor Ariza',
                1,
                'SF',
                78,
                'TWO_WAY_WING',
                80
            ],
            [
                'Nene',
                42,
                'PF',
                80,
                'POST_SCORER',
                83
            ],
            [
                'Marcin Gortat',
                4,
                'C',
                79,
                'RIM_PROTECTOR',
                83
            ],
            [
                'Martell Webster',
                9,
                'SF',
                76,
                'SHARPSHOOTER',
                79
            ],
            [
                'Otto Porter Jr.',
                22,
                'SF',
                75,
                'ROLE_FORWARD',
                80
            ],
            [
                'Andre Miller',
                24,
                'PG',
                76,
                'ROLE_GUARD',
                75
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_cle',
        era: '2K14',
        city: 'Cleveland',
        name: 'Cavaliers',
        abbr: 'CLE',
        conference: 'EAST',
        arena: 'Quicken Loans Arena',
        colors: [
            '#6F263D',
            '#FFB81C',
            '#041E42',
            '#cc9858',
            '#6F263D'
        ],
        players: [
            [
                'Kyrie Irving',
                2,
                'PG',
                89,
                'ELITE_PG',
                75,
                {
                    attrs: {
                        ballHandle: 97,
                        drivingLayup: 95,
                        threePt: 89,
                        midRange: 90
                    },
                    badges: {
                        ANKLE_ASSASSIN: 'LEGEND',
                        LAYUP_MIXMASTER: 'LEGEND',
                        HANDLES_FOR_DAYS: 'HOF',
                        SHIFTY_SHOOTER: 'HOF'
                    }
                }
            ],
            [
                'Dion Waiters',
                3,
                'SG',
                79,
                'SLASHER',
                76
            ],
            [
                'Earl Clark',
                6,
                'SF',
                75,
                'ROLE_FORWARD',
                82
            ],
            [
                'Tristan Thompson',
                13,
                'PF',
                78,
                'RIM_PROTECTOR',
                81,
                {
                    attrs: {
                        offReb: 90,
                        defReb: 85
                    }
                }
            ],
            [
                'Anderson Varejao',
                17,
                'C',
                79,
                'RIM_PROTECTOR',
                83,
                {
                    appearance: {
                        hairStyle: 'AFRO'
                    }
                }
            ],
            [
                'Jarrett Jack',
                1,
                'PG',
                77,
                'ROLE_GUARD',
                75
            ],
            [
                'Andrew Bynum',
                21,
                'C',
                78,
                'POST_SCORER',
                84
            ],
            [
                'Anthony Bennett',
                15,
                'PF',
                75,
                'ROLE_FORWARD',
                80
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_det',
        era: '2K14',
        city: 'Detroit',
        name: 'Pistons',
        abbr: 'DET',
        conference: 'EAST',
        arena: 'The Palace of Auburn Hills',
        colors: [
            '#C8102E',
            '#1D42BA',
            '#FFFFFF',
            '#c89558',
            '#1D42BA'
        ],
        players: [
            [
                'Brandon Jennings',
                7,
                'PG',
                82,
                'ELITE_PG',
                73,
                {
                    badges: {
                        ANKLE_ASSASSIN: 'GOLD',
                        LIGHTNING_LAUNCH: 'GOLD'
                    }
                }
            ],
            [
                'Rodney Stuckey',
                3,
                'SG',
                77,
                'SLASHER',
                77
            ],
            [
                'Josh Smith',
                6,
                'SF',
                84,
                'SLASHER',
                81,
                {
                    attrs: {
                        drivingDunk: 93,
                        block: 89,
                        vertical: 92
                    },
                    badges: {
                        POSTERIZER: 'HOF',
                        HIGH_FLYING_DENIER: 'HOF'
                    }
                }
            ],
            [
                'Greg Monroe',
                10,
                'PF',
                82,
                'POST_SCORER',
                83
            ],
            [
                'Andre Drummond',
                0,
                'C',
                81,
                'RIM_PROTECTOR',
                83,
                {
                    attrs: {
                        offReb: 93,
                        defReb: 91,
                        drivingDunk: 89
                    },
                    badges: {
                        REBOUND_CHASER: 'HOF',
                        BOXOUT_BEAST: 'HOF',
                        AERIAL_WIZARD: 'GOLD'
                    }
                }
            ],
            [
                'Kentavious Caldwell-Pope',
                5,
                'SG',
                75,
                'TWO_WAY_WING',
                77
            ],
            [
                'Chauncey Billups',
                1,
                'PG',
                77,
                'SHARPSHOOTER',
                75,
                {
                    badges: {
                        DEADEYE: 'GOLD',
                        DIMER: 'GOLD'
                    }
                }
            ],
            [
                'Kyle Singler',
                25,
                'SF',
                75,
                'SHARPSHOOTER',
                80
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_atl',
        era: '2K14',
        city: 'Atlanta',
        name: 'Hawks',
        abbr: 'ATL',
        conference: 'EAST',
        arena: 'Philips Arena',
        colors: [
            '#E03A3E',
            '#26282A',
            '#C1D32F',
            '#cc995a',
            '#E03A3E'
        ],
        players: [
            [
                'Jeff Teague',
                0,
                'PG',
                81,
                'ELITE_PG',
                74
            ],
            [
                'Kyle Korver',
                26,
                'SG',
                78,
                'SHARPSHOOTER',
                79,
                {
                    attrs: {
                        threePt: 96,
                        midRange: 88
                    },
                    badges: {
                        SET_SHOT_SPECIALIST: 'LEGEND',
                        DEADEYE: 'HOF',
                        LIMITLESS_RANGE: 'HOF'
                    }
                }
            ],
            [
                'DeMarre Carroll',
                5,
                'SF',
                76,
                'TWO_WAY_WING',
                80
            ],
            [
                'Paul Millsap',
                4,
                'PF',
                83,
                'STRETCH_BIG',
                80
            ],
            [
                'Al Horford',
                15,
                'C',
                86,
                'STRETCH_BIG',
                82,
                {
                    badges: {
                        PAINT_PATROLLER: 'GOLD',
                        SET_SHOT_SPECIALIST: 'GOLD'
                    }
                }
            ],
            [
                'Lou Williams',
                3,
                'SG',
                79,
                'SHARPSHOOTER',
                73,
                {
                    badges: {
                        SHIFTY_SHOOTER: 'GOLD',
                        MINI_MARKSMAN: 'GOLD'
                    }
                }
            ],
            [
                'Dennis Schroder',
                17,
                'PG',
                75,
                'ROLE_GUARD',
                73
            ],
            [
                'Elton Brand',
                42,
                'PF',
                76,
                'ROLE_BIG',
                81
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_cha',
        era: '2K14',
        city: 'Charlotte',
        name: 'Bobcats',
        abbr: 'CHA',
        conference: 'EAST',
        arena: 'Time Warner Cable Arena',
        colors: [
            '#F9423A',
            '#1D1160',
            '#00788C',
            '#ca9658',
            '#1D1160'
        ],
        players: [
            [
                'Kemba Walker',
                15,
                'PG',
                82,
                'ELITE_PG',
                72,
                {
                    badges: {
                        ANKLE_ASSASSIN: 'HOF',
                        SHIFTY_SHOOTER: 'GOLD',
                        MINI_MARKSMAN: 'GOLD'
                    }
                }
            ],
            [
                'Gerald Henderson',
                9,
                'SG',
                78,
                'SLASHER',
                77
            ],
            [
                'Michael Kidd-Gilchrist',
                14,
                'SF',
                78,
                'TWO_WAY_WING',
                79
            ],
            [
                'Josh McRoberts',
                11,
                'PF',
                75,
                'STRETCH_BIG',
                82
            ],
            [
                'Al Jefferson',
                25,
                'C',
                85,
                'POST_SCORER',
                82,
                {
                    attrs: {
                        closeShot: 94,
                        midRange: 86,
                        defReb: 88
                    },
                    badges: {
                        PHYSICAL_FINISHER: 'HOF',
                        FLOAT_GAME: 'GOLD'
                    }
                }
            ],
            [
                'Cody Zeller',
                40,
                'C',
                75,
                'ROLE_BIG',
                84
            ],
            [
                'Bismack Biyombo',
                0,
                'C',
                75,
                'RIM_PROTECTOR',
                81
            ],
            [
                'Ramon Sessions',
                7,
                'PG',
                76,
                'ROLE_GUARD',
                75
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_mil',
        era: '2K14',
        city: 'Milwaukee',
        name: 'Bucks',
        abbr: 'MIL',
        conference: 'EAST',
        arena: 'BMO Harris Bradley Center',
        colors: [
            '#00471B',
            '#EEE1C6',
            '#C8102E',
            '#c9985a',
            '#00471B'
        ],
        players: [
            [
                'Brandon Knight',
                11,
                'PG',
                78,
                'ROLE_GUARD',
                75
            ],
            [
                'O.J. Mayo',
                0,
                'SG',
                79,
                'SHARPSHOOTER',
                76
            ],
            [
                'Giannis Antetokounmpo',
                34,
                'SF',
                74,
                'SLASHER',
                83,
                {
                    wingspanInches: 88,
                    attrs: {
                        drivingDunk: 85,
                        vertical: 86,
                        speed: 84
                    },
                    badges: {
                        AERIAL_WIZARD: 'SILVER',
                        HIGH_FLYING_DENIER: 'SILVER'
                    }
                }
            ],
            [
                'Ersan Ilyasova',
                7,
                'PF',
                78,
                'STRETCH_BIG',
                82
            ],
            [
                'Larry Sanders',
                8,
                'C',
                80,
                'RIM_PROTECTOR',
                83,
                {
                    attrs: {
                        block: 92,
                        interiorDef: 90
                    },
                    badges: {
                        PAINT_PATROLLER: 'HOF',
                        HIGH_FLYING_DENIER: 'GOLD'
                    }
                }
            ],
            [
                'Caron Butler',
                3,
                'SF',
                77,
                'ROLE_FORWARD',
                79
            ],
            [
                'John Henson',
                31,
                'PF',
                76,
                'RIM_PROTECTOR',
                83
            ],
            [
                'Zaza Pachulia',
                27,
                'C',
                75,
                'ROLE_BIG',
                83
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_orl',
        era: '2K14',
        city: 'Orlando',
        name: 'Magic',
        abbr: 'ORL',
        conference: 'EAST',
        arena: 'Amway Center',
        colors: [
            '#0077C0',
            '#C4CED4',
            '#111111',
            '#cc9a5a',
            '#0077C0'
        ],
        players: [
            [
                'Jameer Nelson',
                14,
                'PG',
                77,
                'ROLE_GUARD',
                72
            ],
            [
                'Victor Oladipo',
                5,
                'SG',
                79,
                'SLASHER',
                76,
                {
                    attrs: {
                        drivingDunk: 89,
                        speed: 89,
                        steal: 85
                    },
                    badges: {
                        POSTERIZER: 'GOLD',
                        LIGHTNING_LAUNCH: 'GOLD'
                    }
                }
            ],
            [
                'Arron Afflalo',
                4,
                'SF',
                80,
                'TWO_WAY_WING',
                77
            ],
            [
                'Tobias Harris',
                12,
                'PF',
                78,
                'ROLE_FORWARD',
                81
            ],
            [
                'Nikola Vucevic',
                9,
                'C',
                81,
                'POST_SCORER',
                84
            ],
            [
                'Maurice Harkless',
                21,
                'SF',
                75,
                'ROLE_FORWARD',
                81
            ],
            [
                'Glen Davis',
                11,
                'PF',
                76,
                'ROLE_BIG',
                81
            ],
            [
                "Kyle O'Quinn",
                2,
                'C',
                74,
                'ROLE_BIG',
                82
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_phi',
        era: '2K14',
        city: 'Philadelphia',
        name: '76ers',
        abbr: 'PHI',
        conference: 'EAST',
        arena: 'Wells Fargo Center',
        colors: [
            '#006BB6',
            '#ED174C',
            '#FFFFFF',
            '#cb9858',
            '#006BB6'
        ],
        players: [
            [
                'Michael Carter-Williams',
                1,
                'PG',
                79,
                'ELITE_PG',
                78,
                {
                    badges: {
                        DIMER: 'GOLD',
                        INTERCEPTOR: 'GOLD'
                    }
                }
            ],
            [
                'Evan Turner',
                12,
                'SG',
                79,
                'SLASHER',
                79
            ],
            [
                'Thaddeus Young',
                21,
                'SF',
                80,
                'TWO_WAY_WING',
                80
            ],
            [
                'Nerlens Noel',
                4,
                'PF',
                76,
                'RIM_PROTECTOR',
                83,
                {
                    badges: {
                        PAINT_PATROLLER: 'GOLD',
                        POGO_STICK: 'GOLD'
                    }
                }
            ],
            [
                'Spencer Hawes',
                0,
                'C',
                77,
                'STRETCH_BIG',
                85
            ],
            [
                'Tony Wroten',
                8,
                'PG',
                75,
                'SLASHER',
                78
            ],
            [
                'James Anderson',
                9,
                'SG',
                74,
                'ROLE_GUARD',
                78
            ],
            [
                'Hollis Thompson',
                31,
                'SF',
                73,
                'SHARPSHOOTER',
                80
            ]
        ]
    }),
    // ======================== WESTERN CONFERENCE (15) ========================
    (0, _rosterTypes.makeTeam)({
        id: '2k14_sas',
        era: '2K14',
        city: 'San Antonio',
        name: 'Spurs',
        abbr: 'SAS',
        conference: 'WEST',
        arena: 'AT&T Center',
        colors: [
            '#111111',
            '#C4CED4',
            '#F59E0B',
            '#cca064',
            '#111111'
        ],
        players: [
            [
                'Tony Parker',
                9,
                'PG',
                89,
                'ELITE_PG',
                74,
                {
                    attrs: {
                        drivingLayup: 94,
                        midRange: 90,
                        speed: 92
                    },
                    badges: {
                        FLOAT_GAME: 'LEGEND',
                        LAYUP_MIXMASTER: 'HOF',
                        DIMER: 'HOF'
                    }
                }
            ],
            [
                'Danny Green',
                4,
                'SG',
                78,
                'SHARPSHOOTER',
                78,
                {
                    attrs: {
                        threePt: 91,
                        perimeterDef: 87
                    },
                    badges: {
                        SET_SHOT_SPECIALIST: 'HOF',
                        PERIMETER_CHALLENGER: 'GOLD'
                    }
                }
            ],
            [
                'Kawhi Leonard',
                2,
                'SF',
                84,
                'TWO_WAY_WING',
                79,
                {
                    attrs: {
                        perimeterDef: 94,
                        steal: 91,
                        threePt: 84,
                        drivingDunk: 87
                    },
                    badges: {
                        PERIMETER_CHALLENGER: 'HOF',
                        GLOVE: 'HOF',
                        INTERCEPTOR: 'HOF'
                    }
                }
            ],
            [
                'Tim Duncan',
                21,
                'PF',
                88,
                'POST_SCORER',
                83,
                {
                    attrs: {
                        closeShot: 94,
                        midRange: 89,
                        interiorDef: 95,
                        block: 90,
                        defReb: 91
                    },
                    badges: {
                        PAINT_PATROLLER: 'LEGEND',
                        BOXOUT_BEAST: 'LEGEND',
                        PHYSICAL_FINISHER: 'HOF'
                    }
                }
            ],
            [
                'Tiago Splitter',
                22,
                'C',
                78,
                'ROLE_BIG',
                83
            ],
            [
                'Manu Ginobili',
                20,
                'SG',
                83,
                'SLASHER',
                78,
                {
                    badges: {
                        LAYUP_MIXMASTER: 'HOF',
                        DIMER: 'HOF',
                        DEADEYE: 'GOLD'
                    }
                }
            ],
            [
                'Boris Diaw',
                33,
                'PF',
                78,
                'POINT_CENTER',
                80,
                {
                    badges: {
                        DIMER: 'GOLD',
                        VERSATILE_VISIONARY: 'GOLD'
                    }
                }
            ],
            [
                'Patty Mills',
                8,
                'PG',
                77,
                'SHARPSHOOTER',
                72,
                {
                    attrs: {
                        threePt: 89
                    }
                }
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_okc',
        era: '2K14',
        city: 'Oklahoma City',
        name: 'Thunder',
        abbr: 'OKC',
        conference: 'WEST',
        arena: 'Chesapeake Energy Arena',
        colors: [
            '#007AC1',
            '#EF3B24',
            '#FDBB30',
            '#cb9858',
            '#007AC1'
        ],
        players: [
            [
                'Russell Westbrook',
                0,
                'PG',
                91,
                'SLASHER',
                75,
                {
                    attrs: {
                        speed: 97,
                        acceleration: 97,
                        drivingDunk: 95,
                        vertical: 96,
                        passAccuracy: 87
                    },
                    badges: {
                        POSTERIZER: 'LEGEND',
                        LIGHTNING_LAUNCH: 'LEGEND',
                        PHYSICAL_FINISHER: 'HOF',
                        REBOUND_CHASER: 'GOLD'
                    }
                }
            ],
            [
                'Thabo Sefolosha',
                2,
                'SG',
                76,
                'TWO_WAY_WING',
                79,
                {
                    attrs: {
                        perimeterDef: 89
                    }
                }
            ],
            [
                'Kevin Durant',
                35,
                'SF',
                95,
                'SUPERSTAR_WING',
                82,
                {
                    attrs: {
                        midRange: 97,
                        threePt: 93,
                        freeThrow: 94,
                        drivingDunk: 91,
                        ballHandle: 88
                    },
                    badges: {
                        DEADEYE: 'LEGEND',
                        SHIFTY_SHOOTER: 'LEGEND',
                        LIMITLESS_RANGE: 'HOF',
                        SET_SHOT_SPECIALIST: 'HOF'
                    }
                }
            ],
            [
                'Serge Ibaka',
                9,
                'PF',
                84,
                'RIM_PROTECTOR',
                82,
                {
                    attrs: {
                        block: 94,
                        interiorDef: 91,
                        midRange: 85
                    },
                    badges: {
                        PAINT_PATROLLER: 'HOF',
                        HIGH_FLYING_DENIER: 'HOF'
                    }
                }
            ],
            [
                'Kendrick Perkins',
                5,
                'C',
                74,
                'ROLE_BIG',
                82
            ],
            [
                'Reggie Jackson',
                15,
                'PG',
                78,
                'ROLE_GUARD',
                75
            ],
            [
                'Jeremy Lamb',
                11,
                'SG',
                75,
                'SHARPSHOOTER',
                77
            ],
            [
                'Steven Adams',
                12,
                'C',
                75,
                'RIM_PROTECTOR',
                84,
                {
                    attrs: {
                        strength: 92,
                        offReb: 88
                    }
                }
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_lac',
        era: '2K14',
        city: 'Los Angeles',
        name: 'Clippers',
        abbr: 'LAC',
        conference: 'WEST',
        arena: 'Staples Center',
        colors: [
            '#C8102E',
            '#1D428A',
            '#FFFFFF',
            '#cd9b5c',
            '#1D428A'
        ],
        players: [
            [
                'Chris Paul',
                3,
                'PG',
                94,
                'ELITE_PG',
                72,
                {
                    attrs: {
                        passAccuracy: 98,
                        ballHandle: 96,
                        midRange: 94,
                        steal: 95,
                        perimeterDef: 92
                    },
                    badges: {
                        DIMER: 'LEGEND',
                        VERSATILE_VISIONARY: 'LEGEND',
                        GLOVE: 'LEGEND',
                        UNPLUCKABLE: 'LEGEND',
                        SHIFTY_SHOOTER: 'HOF'
                    }
                }
            ],
            [
                'J.J. Redick',
                4,
                'SG',
                79,
                'SHARPSHOOTER',
                76,
                {
                    attrs: {
                        threePt: 92
                    },
                    badges: {
                        SET_SHOT_SPECIALIST: 'HOF',
                        DEADEYE: 'GOLD'
                    }
                }
            ],
            [
                'Matt Barnes',
                22,
                'SF',
                77,
                'TWO_WAY_WING',
                79
            ],
            [
                'Blake Griffin',
                32,
                'PF',
                88,
                'SLASHER',
                82,
                {
                    attrs: {
                        drivingDunk: 97,
                        vertical: 95,
                        strength: 91,
                        closeShot: 91
                    },
                    badges: {
                        POSTERIZER: 'LEGEND',
                        AERIAL_WIZARD: 'LEGEND',
                        PHYSICAL_FINISHER: 'HOF'
                    }
                }
            ],
            [
                'DeAndre Jordan',
                6,
                'C',
                82,
                'RIM_PROTECTOR',
                83,
                {
                    attrs: {
                        drivingDunk: 94,
                        block: 90,
                        defReb: 92,
                        offReb: 91
                    },
                    badges: {
                        AERIAL_WIZARD: 'LEGEND',
                        REBOUND_CHASER: 'HOF',
                        PAINT_PATROLLER: 'HOF'
                    }
                }
            ],
            [
                'Jamal Crawford',
                11,
                'SG',
                81,
                'SHARPSHOOTER',
                77,
                {
                    attrs: {
                        ballHandle: 93,
                        threePt: 87
                    },
                    badges: {
                        ANKLE_ASSASSIN: 'HOF',
                        SHIFTY_SHOOTER: 'HOF'
                    }
                }
            ],
            [
                'Darren Collison',
                2,
                'PG',
                77,
                'ROLE_GUARD',
                72
            ],
            [
                'Jared Dudley',
                9,
                'SF',
                75,
                'SHARPSHOOTER',
                79
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_gsw',
        era: '2K14',
        city: 'Golden State',
        name: 'Warriors',
        abbr: 'GSW',
        conference: 'WEST',
        arena: 'Oracle Arena',
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
                90,
                'SHARPSHOOTER',
                75,
                {
                    attrs: {
                        threePt: 98,
                        ballHandle: 94,
                        midRange: 92,
                        freeThrow: 95
                    },
                    badges: {
                        LIMITLESS_RANGE: 'LEGEND',
                        DEADEYE: 'LEGEND',
                        SHIFTY_SHOOTER: 'HOF',
                        ANKLE_ASSASSIN: 'HOF'
                    }
                }
            ],
            [
                'Klay Thompson',
                11,
                'SG',
                83,
                'SHARPSHOOTER',
                79,
                {
                    attrs: {
                        threePt: 93,
                        perimeterDef: 85
                    },
                    badges: {
                        SET_SHOT_SPECIALIST: 'HOF',
                        DEADEYE: 'GOLD'
                    }
                }
            ],
            [
                'Andre Iguodala',
                9,
                'SF',
                84,
                'TWO_WAY_WING',
                78,
                {
                    attrs: {
                        perimeterDef: 93,
                        steal: 89,
                        drivingDunk: 90
                    },
                    badges: {
                        PERIMETER_CHALLENGER: 'HOF',
                        GLOVE: 'HOF',
                        POSTERIZER: 'GOLD'
                    }
                }
            ],
            [
                'David Lee',
                10,
                'PF',
                82,
                'POST_SCORER',
                81
            ],
            [
                'Andrew Bogut',
                12,
                'C',
                80,
                'RIM_PROTECTOR',
                84,
                {
                    badges: {
                        PAINT_PATROLLER: 'HOF',
                        BOXOUT_BEAST: 'GOLD'
                    }
                }
            ],
            [
                'Harrison Barnes',
                40,
                'SF',
                78,
                'SLASHER',
                80
            ],
            [
                'Draymond Green',
                23,
                'PF',
                76,
                'TWO_WAY_WING',
                79
            ],
            [
                "Jermaine O'Neal",
                7,
                'C',
                75,
                'RIM_PROTECTOR',
                83
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_hou',
        era: '2K14',
        city: 'Houston',
        name: 'Rockets',
        abbr: 'HOU',
        conference: 'WEST',
        arena: 'Toyota Center',
        colors: [
            '#CE1141',
            '#C4CED4',
            '#111111',
            '#ca9658',
            '#CE1141'
        ],
        players: [
            [
                'Patrick Beverley',
                2,
                'PG',
                77,
                'TWO_WAY_WING',
                73,
                {
                    attrs: {
                        perimeterDef: 90,
                        steal: 86
                    },
                    badges: {
                        PERIMETER_CHALLENGER: 'HOF',
                        GLOVE: 'GOLD'
                    }
                }
            ],
            [
                'James Harden',
                13,
                'SG',
                89,
                'SUPERSTAR_WING',
                77,
                {
                    attrs: {
                        threePt: 89,
                        ballHandle: 92,
                        drivingLayup: 93,
                        freeThrow: 91
                    },
                    badges: {
                        LAYUP_MIXMASTER: 'HOF',
                        SHIFTY_SHOOTER: 'HOF',
                        ANKLE_ASSASSIN: 'HOF',
                        PHYSICAL_FINISHER: 'GOLD'
                    }
                }
            ],
            [
                'Chandler Parsons',
                25,
                'SF',
                80,
                'SHARPSHOOTER',
                81
            ],
            [
                'Terrence Jones',
                6,
                'PF',
                76,
                'ROLE_FORWARD',
                81
            ],
            [
                'Dwight Howard',
                12,
                'C',
                91,
                'RIM_PROTECTOR',
                83,
                {
                    attrs: {
                        drivingDunk: 95,
                        block: 94,
                        interiorDef: 95,
                        defReb: 95,
                        offReb: 93,
                        strength: 96
                    },
                    badges: {
                        PAINT_PATROLLER: 'LEGEND',
                        REBOUND_CHASER: 'LEGEND',
                        BOXOUT_BEAST: 'LEGEND',
                        POSTERIZER: 'HOF',
                        AERIAL_WIZARD: 'HOF'
                    }
                }
            ],
            [
                'Jeremy Lin',
                7,
                'PG',
                79,
                'ELITE_PG',
                75,
                {
                    badges: {
                        LIGHTNING_LAUNCH: 'GOLD',
                        LAYUP_MIXMASTER: 'GOLD'
                    }
                }
            ],
            [
                'Omer Asik',
                3,
                'C',
                77,
                'RIM_PROTECTOR',
                84
            ],
            [
                'Omri Casspi',
                18,
                'SF',
                74,
                'SHARPSHOOTER',
                81
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_lal',
        era: '2K14',
        city: 'Los Angeles',
        name: 'Lakers',
        abbr: 'LAL',
        conference: 'WEST',
        arena: 'Staples Center',
        colors: [
            '#552583',
            '#FDB927',
            '#FFFFFF',
            '#d0a060',
            '#552583'
        ],
        players: [
            [
                'Steve Nash',
                10,
                'PG',
                81,
                'ELITE_PG',
                75,
                {
                    attrs: {
                        passAccuracy: 95,
                        threePt: 91,
                        freeThrow: 95
                    },
                    badges: {
                        DIMER: 'LEGEND',
                        VERSATILE_VISIONARY: 'HOF',
                        DEADEYE: 'GOLD'
                    }
                }
            ],
            [
                'Kobe Bryant',
                24,
                'SG',
                93,
                'SUPERSTAR_WING',
                78,
                {
                    attrs: {
                        midRange: 97,
                        threePt: 87,
                        drivingDunk: 88,
                        drivingLayup: 93,
                        freeThrow: 90,
                        perimeterDef: 88
                    },
                    badges: {
                        DEADEYE: 'LEGEND',
                        SHIFTY_SHOOTER: 'LEGEND',
                        POSTERIZER: 'HOF',
                        LAYUP_MIXMASTER: 'HOF',
                        PERIMETER_CHALLENGER: 'GOLD'
                    },
                    appearance: {
                        hairStyle: 'BALD',
                        armSleeve: 'RIGHT'
                    }
                }
            ],
            [
                'Nick Young',
                0,
                'SF',
                78,
                'SHARPSHOOTER',
                79,
                {
                    badges: {
                        SHIFTY_SHOOTER: 'GOLD',
                        LIMITLESS_RANGE: 'SILVER'
                    }
                }
            ],
            [
                'Pau Gasol',
                16,
                'PF',
                84,
                'POST_SCORER',
                84,
                {
                    attrs: {
                        closeShot: 91,
                        midRange: 87,
                        passAccuracy: 83,
                        defReb: 87
                    },
                    badges: {
                        PHYSICAL_FINISHER: 'GOLD',
                        DIMER: 'GOLD',
                        PAINT_PATROLLER: 'GOLD'
                    }
                }
            ],
            [
                'Chris Kaman',
                9,
                'C',
                76,
                'POST_SCORER',
                84
            ],
            [
                'Jordan Hill',
                27,
                'PF',
                76,
                'ROLE_BIG',
                82
            ],
            [
                'Jodie Meeks',
                20,
                'SG',
                76,
                'SHARPSHOOTER',
                76
            ],
            [
                'Wesley Johnson',
                11,
                'SF',
                75,
                'ROLE_FORWARD',
                79
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_por',
        era: '2K14',
        city: 'Portland',
        name: 'Trail Blazers',
        abbr: 'POR',
        conference: 'WEST',
        arena: 'Moda Center',
        colors: [
            '#E03A3E',
            '#111111',
            '#FFFFFF',
            '#c9975a',
            '#E03A3E'
        ],
        players: [
            [
                'Damian Lillard',
                0,
                'PG',
                86,
                'SHARPSHOOTER',
                75,
                {
                    attrs: {
                        threePt: 91,
                        drivingDunk: 86,
                        speed: 90
                    },
                    badges: {
                        LIMITLESS_RANGE: 'HOF',
                        DEADEYE: 'HOF',
                        LIGHTNING_LAUNCH: 'GOLD'
                    }
                }
            ],
            [
                'Wesley Matthews',
                2,
                'SG',
                80,
                'TWO_WAY_WING',
                77
            ],
            [
                'Nicolas Batum',
                88,
                'SF',
                81,
                'TWO_WAY_WING',
                80
            ],
            [
                'LaMarcus Aldridge',
                12,
                'PF',
                88,
                'POST_SCORER',
                83,
                {
                    attrs: {
                        midRange: 95,
                        closeShot: 92,
                        defReb: 88
                    },
                    badges: {
                        DEADEYE: 'HOF',
                        SHIFTY_SHOOTER: 'HOF',
                        PHYSICAL_FINISHER: 'GOLD'
                    }
                }
            ],
            [
                'Robin Lopez',
                42,
                'C',
                78,
                'RIM_PROTECTOR',
                84,
                {
                    appearance: {
                        hairStyle: 'AFRO'
                    }
                }
            ],
            [
                'Mo Williams',
                25,
                'PG',
                77,
                'SHARPSHOOTER',
                73
            ],
            [
                'C.J. McCollum',
                3,
                'SG',
                75,
                'SHARPSHOOTER',
                75
            ],
            [
                'Thomas Robinson',
                41,
                'PF',
                74,
                'ROLE_BIG',
                82
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_mem',
        era: '2K14',
        city: 'Memphis',
        name: 'Grizzlies',
        abbr: 'MEM',
        conference: 'WEST',
        arena: 'FedExForum',
        colors: [
            '#5D76A9',
            '#12173F',
            '#F5B112',
            '#c89658',
            '#12173F'
        ],
        players: [
            [
                'Mike Conley',
                11,
                'PG',
                84,
                'ELITE_PG',
                73,
                {
                    badges: {
                        FLOAT_GAME: 'HOF',
                        DIMER: 'GOLD',
                        PERIMETER_CHALLENGER: 'GOLD'
                    }
                }
            ],
            [
                'Tony Allen',
                9,
                'SG',
                79,
                'TWO_WAY_WING',
                76,
                {
                    attrs: {
                        perimeterDef: 96,
                        steal: 93,
                        threePt: 58
                    },
                    badges: {
                        PERIMETER_CHALLENGER: 'LEGEND',
                        GLOVE: 'LEGEND',
                        INTERCEPTOR: 'HOF'
                    }
                }
            ],
            [
                'Tayshaun Prince',
                21,
                'SF',
                76,
                'TWO_WAY_WING',
                81
            ],
            [
                'Zach Randolph',
                50,
                'PF',
                85,
                'POST_SCORER',
                81,
                {
                    attrs: {
                        closeShot: 92,
                        strength: 93,
                        offReb: 92,
                        defReb: 90
                    },
                    badges: {
                        BOXOUT_BEAST: 'HOF',
                        PHYSICAL_FINISHER: 'HOF',
                        REBOUND_CHASER: 'HOF'
                    }
                }
            ],
            [
                'Marc Gasol',
                33,
                'C',
                87,
                'POINT_CENTER',
                85,
                {
                    attrs: {
                        interiorDef: 95,
                        block: 89,
                        midRange: 86,
                        passAccuracy: 85
                    },
                    badges: {
                        PAINT_PATROLLER: 'LEGEND',
                        DIMER: 'GOLD',
                        BOXOUT_BEAST: 'HOF'
                    }
                }
            ],
            [
                'Courtney Lee',
                5,
                'SG',
                77,
                'TWO_WAY_WING',
                77
            ],
            [
                'Jerryd Bayless',
                7,
                'PG',
                75,
                'ROLE_GUARD',
                75
            ],
            [
                'Kosta Koufos',
                41,
                'C',
                75,
                'ROLE_BIG',
                84
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_dal',
        era: '2K14',
        city: 'Dallas',
        name: 'Mavericks',
        abbr: 'DAL',
        conference: 'WEST',
        arena: 'American Airlines Center',
        colors: [
            '#00538C',
            '#002B5E',
            '#B8C4CA',
            '#cc9a5c',
            '#00538C'
        ],
        players: [
            [
                'Jose Calderon',
                8,
                'PG',
                78,
                'SHARPSHOOTER',
                75,
                {
                    attrs: {
                        threePt: 90,
                        passAccuracy: 88
                    }
                }
            ],
            [
                'Monta Ellis',
                11,
                'SG',
                84,
                'SLASHER',
                75,
                {
                    attrs: {
                        speed: 92,
                        drivingLayup: 91
                    },
                    badges: {
                        LAYUP_MIXMASTER: 'HOF',
                        LIGHTNING_LAUNCH: 'HOF'
                    }
                }
            ],
            [
                'Shawn Marion',
                0,
                'SF',
                79,
                'TWO_WAY_WING',
                79
            ],
            [
                'Dirk Nowitzki',
                41,
                'PF',
                87,
                'STRETCH_BIG',
                84,
                {
                    attrs: {
                        midRange: 97,
                        threePt: 91,
                        freeThrow: 94
                    },
                    badges: {
                        DEADEYE: 'LEGEND',
                        SHIFTY_SHOOTER: 'LEGEND',
                        SET_SHOT_SPECIALIST: 'HOF'
                    }
                }
            ],
            [
                'Samuel Dalembert',
                1,
                'C',
                75,
                'RIM_PROTECTOR',
                83
            ],
            [
                'Vince Carter',
                25,
                'SG',
                78,
                'SHARPSHOOTER',
                78,
                {
                    badges: {
                        POSTERIZER: 'GOLD',
                        DEADEYE: 'GOLD'
                    }
                }
            ],
            [
                'Devin Harris',
                20,
                'PG',
                76,
                'ROLE_GUARD',
                75
            ],
            [
                'Brandan Wright',
                34,
                'PF',
                76,
                'RIM_PROTECTOR',
                82
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_den',
        era: '2K14',
        city: 'Denver',
        name: 'Nuggets',
        abbr: 'DEN',
        conference: 'WEST',
        arena: 'Pepsi Center',
        colors: [
            '#0E2240',
            '#418FDE',
            '#FEC524',
            '#cf9c5c',
            '#418FDE'
        ],
        players: [
            [
                'Ty Lawson',
                3,
                'PG',
                84,
                'ELITE_PG',
                71,
                {
                    attrs: {
                        speed: 95,
                        acceleration: 96,
                        passAccuracy: 89
                    },
                    badges: {
                        LIGHTNING_LAUNCH: 'HOF',
                        DIMER: 'GOLD',
                        MINI_MARKSMAN: 'GOLD'
                    }
                }
            ],
            [
                'Randy Foye',
                4,
                'SG',
                77,
                'SHARPSHOOTER',
                76
            ],
            [
                'Danilo Gallinari',
                8,
                'SF',
                81,
                'SHARPSHOOTER',
                82
            ],
            [
                'Kenneth Faried',
                35,
                'PF',
                82,
                'SLASHER',
                80,
                {
                    attrs: {
                        drivingDunk: 92,
                        vertical: 93,
                        offReb: 91
                    },
                    badges: {
                        AERIAL_WIZARD: 'HOF',
                        REBOUND_CHASER: 'GOLD',
                        POGO_STICK: 'GOLD'
                    },
                    appearance: {
                        hairStyle: 'DREADS'
                    }
                }
            ],
            [
                'JaVale McGee',
                34,
                'C',
                78,
                'RIM_PROTECTOR',
                84,
                {
                    attrs: {
                        block: 90,
                        drivingDunk: 91,
                        vertical: 90
                    }
                }
            ],
            [
                'Wilson Chandler',
                21,
                'SF',
                79,
                'ROLE_FORWARD',
                80
            ],
            [
                'Nate Robinson',
                10,
                'PG',
                78,
                'SLASHER',
                69,
                {
                    attrs: {
                        vertical: 98,
                        drivingDunk: 90
                    },
                    badges: {
                        MINI_MARKSMAN: 'HOF',
                        POSTERIZER: 'GOLD'
                    }
                }
            ],
            [
                'J.J. Hickson',
                7,
                'PF',
                77,
                'ROLE_BIG',
                81
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_min',
        era: '2K14',
        city: 'Minnesota',
        name: 'Timberwolves',
        abbr: 'MIN',
        conference: 'WEST',
        arena: 'Target Center',
        colors: [
            '#0C2340',
            '#236192',
            '#9EA2A2',
            '#c9975a',
            '#0C2340'
        ],
        players: [
            [
                'Ricky Rubio',
                9,
                'PG',
                82,
                'ELITE_PG',
                76,
                {
                    attrs: {
                        passAccuracy: 94,
                        steal: 91,
                        perimeterDef: 87
                    },
                    badges: {
                        DIMER: 'HOF',
                        VERSATILE_VISIONARY: 'HOF',
                        GLOVE: 'GOLD'
                    }
                }
            ],
            [
                'Kevin Martin',
                23,
                'SG',
                80,
                'SHARPSHOOTER',
                79,
                {
                    attrs: {
                        threePt: 89
                    }
                }
            ],
            [
                'Corey Brewer',
                13,
                'SF',
                77,
                'TWO_WAY_WING',
                81
            ],
            [
                'Kevin Love',
                42,
                'PF',
                89,
                'STRETCH_BIG',
                82,
                {
                    attrs: {
                        threePt: 89,
                        defReb: 96,
                        offReb: 92,
                        passAccuracy: 86
                    },
                    badges: {
                        REBOUND_CHASER: 'LEGEND',
                        BREAK_STARTER: 'LEGEND',
                        SET_SHOT_SPECIALIST: 'HOF',
                        BOXOUT_BEAST: 'HOF'
                    }
                }
            ],
            [
                'Nikola Pekovic',
                14,
                'C',
                81,
                'POST_SCORER',
                83,
                {
                    attrs: {
                        strength: 96,
                        closeShot: 90
                    }
                }
            ],
            [
                'Chase Budinger',
                10,
                'SF',
                75,
                'SHARPSHOOTER',
                79
            ],
            [
                'J.J. Barea',
                11,
                'PG',
                75,
                'ROLE_GUARD',
                70
            ],
            [
                'Gorgui Dieng',
                5,
                'C',
                75,
                'RIM_PROTECTOR',
                83
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_nop',
        era: '2K14',
        city: 'New Orleans',
        name: 'Pelicans',
        abbr: 'NOP',
        conference: 'WEST',
        arena: 'New Orleans Arena',
        colors: [
            '#0C2340',
            '#C8102E',
            '#85714D',
            '#cca064',
            '#0C2340'
        ],
        players: [
            [
                'Jrue Holiday',
                11,
                'PG',
                84,
                'TWO_WAY_WING',
                76,
                {
                    attrs: {
                        perimeterDef: 91,
                        passAccuracy: 88,
                        steal: 87
                    },
                    badges: {
                        PERIMETER_CHALLENGER: 'HOF',
                        DIMER: 'GOLD',
                        GLOVE: 'GOLD'
                    }
                }
            ],
            [
                'Eric Gordon',
                10,
                'SG',
                81,
                'SHARPSHOOTER',
                76
            ],
            [
                'Tyreke Evans',
                1,
                'SF',
                81,
                'SLASHER',
                78
            ],
            [
                'Ryan Anderson',
                33,
                'PF',
                79,
                'STRETCH_BIG',
                82,
                {
                    attrs: {
                        threePt: 90
                    }
                }
            ],
            [
                'Anthony Davis',
                23,
                'C',
                87,
                'RIM_PROTECTOR',
                82,
                {
                    attrs: {
                        block: 94,
                        interiorDef: 92,
                        drivingDunk: 92,
                        vertical: 90,
                        defReb: 90
                    },
                    badges: {
                        PAINT_PATROLLER: 'HOF',
                        HIGH_FLYING_DENIER: 'HOF',
                        AERIAL_WIZARD: 'HOF',
                        POGO_STICK: 'GOLD'
                    }
                }
            ],
            [
                'Al-Farouq Aminu',
                0,
                'SF',
                76,
                'TWO_WAY_WING',
                81
            ],
            [
                'Jason Smith',
                14,
                'C',
                74,
                'ROLE_BIG',
                84
            ],
            [
                'Austin Rivers',
                25,
                'PG',
                74,
                'ROLE_GUARD',
                76
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_phx',
        era: '2K14',
        city: 'Phoenix',
        name: 'Suns',
        abbr: 'PHX',
        conference: 'WEST',
        arena: 'US Airways Center',
        colors: [
            '#1D1160',
            '#E56020',
            '#F9AD1B',
            '#cf9c5c',
            '#1D1160'
        ],
        players: [
            [
                'Eric Bledsoe',
                2,
                'PG',
                83,
                'SLASHER',
                73,
                {
                    attrs: {
                        speed: 93,
                        drivingDunk: 88,
                        perimeterDef: 89
                    }
                }
            ],
            [
                'Goran Dragic',
                1,
                'SG',
                84,
                'ELITE_PG',
                75,
                {
                    badges: {
                        LAYUP_MIXMASTER: 'HOF',
                        LIGHTNING_LAUNCH: 'GOLD',
                        SET_SHOT_SPECIALIST: 'GOLD'
                    }
                }
            ],
            [
                'Gerald Green',
                14,
                'SF',
                79,
                'SLASHER',
                80,
                {
                    attrs: {
                        drivingDunk: 97,
                        vertical: 98,
                        threePt: 86
                    },
                    badges: {
                        POSTERIZER: 'LEGEND',
                        AERIAL_WIZARD: 'HOF'
                    }
                }
            ],
            [
                'Markieff Morris',
                11,
                'PF',
                78,
                'STRETCH_BIG',
                82
            ],
            [
                'Miles Plumlee',
                22,
                'C',
                76,
                'RIM_PROTECTOR',
                83
            ],
            [
                'P.J. Tucker',
                17,
                'SF',
                77,
                'TWO_WAY_WING',
                78
            ],
            [
                'Channing Frye',
                8,
                'PF',
                77,
                'STRETCH_BIG',
                83,
                {
                    attrs: {
                        threePt: 87
                    }
                }
            ],
            [
                'Marcus Morris',
                15,
                'PF',
                76,
                'STRETCH_BIG',
                81
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_sac',
        era: '2K14',
        city: 'Sacramento',
        name: 'Kings',
        abbr: 'SAC',
        conference: 'WEST',
        arena: 'Sleep Train Arena',
        colors: [
            '#5A2D81',
            '#63727A',
            '#FFFFFF',
            '#c89558',
            '#5A2D81'
        ],
        players: [
            [
                'Isaiah Thomas',
                22,
                'PG',
                81,
                'ELITE_PG',
                69,
                {
                    attrs: {
                        speed: 93,
                        threePt: 87,
                        drivingLayup: 89
                    },
                    badges: {
                        MINI_MARKSMAN: 'HOF',
                        LIGHTNING_LAUNCH: 'HOF',
                        SHIFTY_SHOOTER: 'GOLD'
                    }
                }
            ],
            [
                'Marcus Thornton',
                23,
                'SG',
                77,
                'SHARPSHOOTER',
                76
            ],
            [
                'Ben McLemore',
                16,
                'SF',
                77,
                'SLASHER',
                77,
                {
                    attrs: {
                        drivingDunk: 91,
                        vertical: 93
                    }
                }
            ],
            [
                'Jason Thompson',
                34,
                'PF',
                75,
                'ROLE_BIG',
                83
            ],
            [
                'DeMarcus Cousins',
                15,
                'C',
                86,
                'POST_SCORER',
                83,
                {
                    attrs: {
                        closeShot: 93,
                        strength: 95,
                        defReb: 91,
                        midRange: 83
                    },
                    badges: {
                        PHYSICAL_FINISHER: 'HOF',
                        BOXOUT_BEAST: 'HOF',
                        REBOUND_CHASER: 'HOF'
                    },
                    appearance: {
                        headband: true
                    }
                }
            ],
            [
                'Derrick Williams',
                13,
                'PF',
                76,
                'SLASHER',
                80
            ],
            [
                'Carl Landry',
                24,
                'PF',
                76,
                'POST_SCORER',
                81
            ],
            [
                'Jimmer Fredette',
                7,
                'PG',
                74,
                'SHARPSHOOTER',
                74,
                {
                    attrs: {
                        threePt: 91
                    },
                    badges: {
                        LIMITLESS_RANGE: 'GOLD'
                    }
                }
            ]
        ]
    }),
    (0, _rosterTypes.makeTeam)({
        id: '2k14_uta',
        era: '2K14',
        city: 'Utah',
        name: 'Jazz',
        abbr: 'UTA',
        conference: 'WEST',
        arena: 'EnergySolutions Arena',
        colors: [
            '#002B5C',
            '#00471B',
            '#F9A01B',
            '#cc9958',
            '#002B5C'
        ],
        players: [
            [
                'Trey Burke',
                3,
                'PG',
                78,
                'ELITE_PG',
                73
            ],
            [
                'Alec Burks',
                10,
                'SG',
                77,
                'SLASHER',
                78
            ],
            [
                'Gordon Hayward',
                20,
                'SF',
                82,
                'SUPERSTAR_WING',
                80
            ],
            [
                'Derrick Favors',
                15,
                'PF',
                81,
                'RIM_PROTECTOR',
                82
            ],
            [
                'Enes Kanter',
                0,
                'C',
                78,
                'POST_SCORER',
                83
            ],
            [
                'Richard Jefferson',
                24,
                'SF',
                75,
                'ROLE_FORWARD',
                79
            ],
            [
                'Marvin Williams',
                2,
                'PF',
                75,
                'STRETCH_BIG',
                81
            ],
            [
                'Rudy Gobert',
                27,
                'C',
                75,
                'RIM_PROTECTOR',
                85,
                {
                    wingspanInches: 92,
                    attrs: {
                        block: 89,
                        interiorDef: 87
                    },
                    badges: {
                        PAINT_PATROLLER: 'GOLD'
                    }
                }
            ]
        ]
    })
];

});

})(window.ArcadeMod);
