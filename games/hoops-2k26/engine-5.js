(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/hybrid/store ===
ArcadeMod.define("src/games/hoops-2k26/hybrid/store", function(require, module, exports) {
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
    get ACHIEVEMENT_CATALOG () {
        return ACHIEVEMENT_CATALOG;
    },
    get DEFAULT_KEYBINDS () {
        return DEFAULT_KEYBINDS;
    },
    get DEFAULT_TRACK_IDS () {
        return DEFAULT_TRACK_IDS;
    },
    get GAMEPLAY_SLIDER_META () {
        return GAMEPLAY_SLIDER_META;
    },
    get GAMEPLAY_SLIDER_PRESETS () {
        return GAMEPLAY_SLIDER_PRESETS;
    },
    get HYBRID_SAVE_KEY () {
        return HYBRID_SAVE_KEY;
    },
    get UltimateHybridStore () {
        return UltimateHybridStore;
    },
    get createBalancedSliders () {
        return createBalancedSliders;
    },
    get createDefaultCustomHudLayout () {
        return createDefaultCustomHudLayout;
    },
    get createDefaultUltimateHybridSave () {
        return createDefaultUltimateHybridSave;
    },
    get createPresetCustomHudLayout () {
        return createPresetCustomHudLayout;
    },
    get normalizeShotMeterStyle () {
        return normalizeShotMeterStyle;
    },
    get useUltimateHybridStore () {
        return useUltimateHybridStore;
    }
});
var _react = require("react");
function _extends() {
    _extends = Object.assign || function assign(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source)if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
var ACHIEVEMENT_CATALOG = [
    {
        id: 'DROP_40_PTS',
        title: '40-Point Masterpiece',
        description: 'Drop 40+ points with a single player in any 3D game.',
        eraTag: 'HYBRID'
    },
    {
        id: 'FIVE_GREEN_THREES',
        title: '5 Green 3s in a Game',
        description: 'Splash 5 or more Excellent-Release three-pointers in one matchup.',
        eraTag: '2K26'
    },
    {
        id: 'WIN_PATH_TO_GREATNESS',
        title: 'King of Miami',
        description: 'Complete a LeBron Path to Greatness scenario victory.',
        eraTag: '2K14'
    },
    {
        id: 'BEAT_STREET_KING',
        title: 'Street Kings Slayer',
        description: 'Defeat a Street Kings Court Boss in The City.',
        eraTag: '2K26'
    },
    {
        id: 'BREAK_PARK_STREAK',
        title: 'Streak Breaker',
        description: 'Win a Blacktop or Park showdown to extend or break a hot streak.',
        eraTag: '2K26'
    },
    {
        id: 'DUAL_ERA_CHAMPION',
        title: 'Dual-Era Legend',
        description: 'Win matches across both 2K14 Classic and 2K26 Next-Gen presentations.',
        eraTag: 'HYBRID'
    },
    {
        id: 'MYTEAM_COLLECTOR',
        title: 'Holographic Dynasty',
        description: 'Collect 10+ MyTEAM cards across NBA & WNBA eras.',
        eraTag: '2K26'
    },
    {
        id: 'TRAINING_GOLD',
        title: 'Gym Rat Gold',
        description: 'Earn a Gold Medal in a Training Camp skill drill.',
        eraTag: '2K14'
    }
];
var DEFAULT_KEYBINDS = {
    shoot: 'Space',
    pass: 'KeyJ',
    bouncePass: 'KeyK',
    dribble: 'KeyE',
    screen: 'KeyL',
    alleyOop: 'KeyO',
    iconPass: 'KeyI',
    takeover: 'KeyT',
    sprint: 'ShiftLeft',
    steal: 'KeyJ',
    block: 'Space',
    switchDef: 'KeyK',
    handsUp: 'KeyU',
    camera: 'KeyC',
    pause: 'Escape'
};
var GAMEPLAY_SLIDER_META = [
    {
        key: 'insideShot',
        label: 'Inside Shot Success',
        group: 'OFFENSE'
    },
    {
        key: 'closeShot',
        label: 'Close Shot Success',
        group: 'OFFENSE'
    },
    {
        key: 'midRange',
        label: 'Mid-Range Success',
        group: 'OFFENSE'
    },
    {
        key: 'threePt',
        label: '3PT Success',
        group: 'OFFENSE'
    },
    {
        key: 'layup',
        label: 'Layup Success',
        group: 'OFFENSE'
    },
    {
        key: 'dunkInTraffic',
        label: 'Dunk in Traffic',
        group: 'OFFENSE'
    },
    {
        key: 'shotContestImpact',
        label: 'Shot Contest Impact',
        group: 'DEFENSE'
    },
    {
        key: 'blockFrequency',
        label: 'Block Frequency',
        group: 'DEFENSE'
    },
    {
        key: 'stealSuccess',
        label: 'Steal Success',
        group: 'DEFENSE'
    },
    {
        key: 'offReb',
        label: 'Offensive Rebound',
        group: 'DEFENSE'
    },
    {
        key: 'defReb',
        label: 'Defensive Rebound',
        group: 'DEFENSE'
    },
    {
        key: 'helpDefense',
        label: 'Help Defense Strength',
        group: 'DEFENSE'
    },
    {
        key: 'ballSecurity',
        label: 'Ball Security',
        group: 'ATHLETICISM & RULES'
    },
    {
        key: 'gameSpeed',
        label: 'Game Speed',
        group: 'ATHLETICISM & RULES'
    },
    {
        key: 'foulFrequency',
        label: 'Foul Frequency',
        group: 'ATHLETICISM & RULES'
    }
];
function createBalancedSliders() {
    return {
        insideShot: 50,
        closeShot: 50,
        midRange: 50,
        threePt: 50,
        layup: 50,
        dunkInTraffic: 50,
        shotContestImpact: 50,
        blockFrequency: 50,
        stealSuccess: 50,
        offReb: 50,
        defReb: 50,
        ballSecurity: 50,
        helpDefense: 50,
        gameSpeed: 50,
        foulFrequency: 50
    };
}
var GAMEPLAY_SLIDER_PRESETS = {
    HYBRID_PRO_BALANCED: {
        label: 'Hybrid Pro Balanced (50/50)',
        desc: 'Authentic 50/50 balanced simulation tuning combining 2K14 flow with 2K26 skill windows.',
        user: createBalancedSliders(),
        cpu: createBalancedSliders()
    },
    '2K26_COMP': {
        label: '2K26 Comp',
        desc: 'Competitive timing discipline with sharp shot contests, clean steals, and high-IQ help defense.',
        user: {
            insideShot: 49,
            closeShot: 50,
            midRange: 51,
            threePt: 50,
            layup: 49,
            dunkInTraffic: 48,
            shotContestImpact: 58,
            blockFrequency: 52,
            stealSuccess: 54,
            offReb: 50,
            defReb: 54,
            ballSecurity: 52,
            helpDefense: 56,
            gameSpeed: 52,
            foulFrequency: 50
        },
        cpu: {
            insideShot: 49,
            closeShot: 50,
            midRange: 51,
            threePt: 50,
            layup: 49,
            dunkInTraffic: 48,
            shotContestImpact: 58,
            blockFrequency: 52,
            stealSuccess: 54,
            offReb: 50,
            defReb: 54,
            ballSecurity: 52,
            helpDefense: 56,
            gameSpeed: 52,
            foulFrequency: 50
        }
    },
    '2K14_CLASSIC_SIM': {
        label: '2K14 Classic Sim',
        desc: 'Gritty simulation percentages, stronger interior defense, and realistic fouls.',
        user: {
            insideShot: 46,
            closeShot: 47,
            midRange: 48,
            threePt: 45,
            layup: 48,
            dunkInTraffic: 42,
            shotContestImpact: 64,
            blockFrequency: 56,
            stealSuccess: 44,
            offReb: 46,
            defReb: 58,
            ballSecurity: 52,
            helpDefense: 62,
            gameSpeed: 47,
            foulFrequency: 60
        },
        cpu: {
            insideShot: 46,
            closeShot: 47,
            midRange: 48,
            threePt: 45,
            layup: 48,
            dunkInTraffic: 44,
            shotContestImpact: 64,
            blockFrequency: 56,
            stealSuccess: 46,
            offReb: 48,
            defReb: 58,
            ballSecurity: 54,
            helpDefense: 64,
            gameSpeed: 47,
            foulFrequency: 60
        }
    },
    ARCADE_HIGH_SCORING: {
        label: 'Arcade High-Scoring',
        desc: 'Explosive dunks, deep-range splashes, faster pace, and fewer whistle stoppages.',
        user: {
            insideShot: 68,
            closeShot: 66,
            midRange: 65,
            threePt: 66,
            layup: 68,
            dunkInTraffic: 78,
            shotContestImpact: 36,
            blockFrequency: 64,
            stealSuccess: 60,
            offReb: 58,
            defReb: 52,
            ballSecurity: 64,
            helpDefense: 40,
            gameSpeed: 64,
            foulFrequency: 32
        },
        cpu: {
            insideShot: 58,
            closeShot: 56,
            midRange: 56,
            threePt: 58,
            layup: 58,
            dunkInTraffic: 66,
            shotContestImpact: 38,
            blockFrequency: 52,
            stealSuccess: 46,
            offReb: 52,
            defReb: 50,
            ballSecurity: 56,
            helpDefense: 42,
            gameSpeed: 64,
            foulFrequency: 32
        }
    }
};
function createDefaultCustomHudLayout() {
    return {
        left_stick: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.92
        },
        shoot_pad: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.95
        },
        pass_btn: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.92
        },
        dribble_btn: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.9
        },
        screen_btn: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.9
        },
        icon_btn: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.88
        },
        oop_btn: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.92
        },
        takeover_btn: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.96
        },
        block_btn: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.95
        },
        steal_btn: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.92
        },
        switch_btn: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.9
        },
        intense_btn: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.9
        },
        handsup_btn: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.9
        },
        tactics_btn: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.94
        },
        radar_panel: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.94
        }
    };
}
function createPresetCustomHudLayout(preset) {
    var base = createDefaultCustomHudLayout();
    if (preset === 'CLASSIC_2K') {
        return base;
    }
    if (preset === 'CLAW_PRO') {
        return _extends({}, base, {
            left_stick: {
                x: 12,
                y: -16,
                scale: 1.08,
                opacity: 0.94
            },
            shoot_pad: {
                x: -16,
                y: -22,
                scale: 1.15,
                opacity: 0.96
            },
            pass_btn: {
                x: -26,
                y: -12,
                scale: 1.05,
                opacity: 0.94
            },
            dribble_btn: {
                x: -10,
                y: -38,
                scale: 1.04,
                opacity: 0.92
            },
            screen_btn: {
                x: -34,
                y: -62,
                scale: 0.95,
                opacity: 0.88
            },
            icon_btn: {
                x: -24,
                y: -74,
                scale: 0.95,
                opacity: 0.9
            },
            oop_btn: {
                x: -6,
                y: -74,
                scale: 0.98,
                opacity: 0.94
            },
            takeover_btn: {
                x: -14,
                y: -96,
                scale: 1.08,
                opacity: 0.98
            },
            block_btn: {
                x: -16,
                y: -22,
                scale: 1.15,
                opacity: 0.96
            },
            steal_btn: {
                x: -26,
                y: -12,
                scale: 1.05,
                opacity: 0.94
            },
            switch_btn: {
                x: -10,
                y: -38,
                scale: 1.04,
                opacity: 0.92
            },
            intense_btn: {
                x: -28,
                y: -56,
                scale: 0.96,
                opacity: 0.9
            },
            tactics_btn: {
                x: 18,
                y: 4,
                scale: 0.95,
                opacity: 0.92
            },
            radar_panel: {
                x: 0,
                y: -10,
                scale: 0.96,
                opacity: 0.92
            }
        });
    }
    // COMPACT_ONE_HAND
    return _extends({}, base, {
        left_stick: {
            x: 8,
            y: 8,
            scale: 0.88,
            opacity: 0.86
        },
        shoot_pad: {
            x: 10,
            y: 8,
            scale: 0.88,
            opacity: 0.9
        },
        pass_btn: {
            x: 18,
            y: 10,
            scale: 0.84,
            opacity: 0.86
        },
        dribble_btn: {
            x: 14,
            y: 12,
            scale: 0.82,
            opacity: 0.84
        },
        screen_btn: {
            x: 16,
            y: 14,
            scale: 0.78,
            opacity: 0.82
        },
        icon_btn: {
            x: 16,
            y: 16,
            scale: 0.78,
            opacity: 0.82
        },
        oop_btn: {
            x: 12,
            y: 16,
            scale: 0.8,
            opacity: 0.86
        },
        takeover_btn: {
            x: 12,
            y: 12,
            scale: 0.86,
            opacity: 0.92
        },
        block_btn: {
            x: 10,
            y: 8,
            scale: 0.88,
            opacity: 0.9
        },
        steal_btn: {
            x: 18,
            y: 10,
            scale: 0.84,
            opacity: 0.86
        },
        switch_btn: {
            x: 14,
            y: 12,
            scale: 0.82,
            opacity: 0.84
        },
        intense_btn: {
            x: 16,
            y: 14,
            scale: 0.8,
            opacity: 0.84
        },
        tactics_btn: {
            x: 0,
            y: 0,
            scale: 0.85,
            opacity: 0.88
        },
        radar_panel: {
            x: 0,
            y: 6,
            scale: 0.85,
            opacity: 0.86
        }
    });
}
var HYBRID_SAVE_KEY = 'nba2k14_2k26_ultimate_save_v1';
var DEFAULT_TRACK_IDS = [
    'crown_2014',
    'kings_hardwood',
    'skyline_2k26',
    'neon_crossover',
    'chinatown_bounce',
    'clutch_symphony'
];
function createDefaultChallenges() {
    return [
        {
            id: 'daily_green_3',
            category: 'DAILY',
            title: 'Green Machine Warmup',
            description: 'Drain 3 Excellent-Release jumpers in any 3D matchup.',
            progress: 3,
            target: 3,
            vcReward: 750,
            mtpReward: 350,
            xpReward: 180,
            claimed: false
        },
        {
            id: 'daily_era_switch',
            category: 'DAILY',
            title: 'Dual-Era Architect',
            description: 'Preview both 2K14 Classic & 2K26 Next-Gen Arena stages.',
            progress: 2,
            target: 2,
            vcReward: 500,
            mtpReward: 250,
            xpReward: 120,
            claimed: false
        },
        {
            id: 'seasonal_streak',
            category: 'SEASONAL',
            title: 'Season 1: Cross-Era Domination',
            description: 'Win 5 Tip-Off games across 2013-14 & 2025-26 rosters.',
            progress: 5,
            target: 5,
            vcReward: 2500,
            mtpReward: 1500,
            xpReward: 600,
            claimed: false
        },
        {
            id: 'lifetime_legend',
            category: 'LIFETIME',
            title: 'Path to Greatness Pioneer',
            description: 'Score 500 career points across all Hoops 2K modes.',
            progress: 340,
            target: 500,
            vcReward: 5000,
            mtpReward: 3000,
            xpReward: 1200,
            claimed: false
        }
    ];
}
function createInitialShotChart() {
    var now = Date.now();
    return [
        {
            id: 'sc_1',
            x: -22,
            y: 6,
            made: true,
            isThree: true,
            isGreen: true,
            era: '2K26_NEXTGEN',
            timestamp: now - 900000
        },
        {
            id: 'sc_2',
            x: 22,
            y: 7,
            made: true,
            isThree: true,
            isGreen: true,
            era: '2K26_NEXTGEN',
            timestamp: now - 820000
        },
        {
            id: 'sc_3',
            x: 0,
            y: 26,
            made: true,
            isThree: true,
            isGreen: true,
            era: 'HYBRID_PRO',
            timestamp: now - 740000
        },
        {
            id: 'sc_4',
            x: -13,
            y: 15,
            made: true,
            isThree: false,
            isGreen: false,
            era: '2K14_CLASSIC',
            timestamp: now - 680000
        },
        {
            id: 'sc_5',
            x: 14,
            y: 14,
            made: false,
            isThree: false,
            isGreen: false,
            era: '2K14_CLASSIC',
            timestamp: now - 610000
        },
        {
            id: 'sc_6',
            x: 2,
            y: 5,
            made: true,
            isThree: false,
            isGreen: true,
            era: '2K14_CLASSIC',
            timestamp: now - 540000
        },
        {
            id: 'sc_7',
            x: -16,
            y: 21,
            made: false,
            isThree: true,
            isGreen: false,
            era: '2K26_NEXTGEN',
            timestamp: now - 410000
        },
        {
            id: 'sc_8',
            x: 15,
            y: 22,
            made: true,
            isThree: true,
            isGreen: true,
            era: 'HYBRID_PRO',
            timestamp: now - 250000
        }
    ];
}
function createDefaultUltimateHybridSave() {
    return {
        version: 1,
        uiEraMode: 'HYBRID_PRO',
        activeScreen: 'MAIN_MENU',
        currencies: {
            vc: 25000,
            mtp: 15000,
            seasonXP: 1450,
            seasonLevel: 12,
            repXP: 4200,
            repTier: 'Starter II',
            crewLevel: 8,
            crewName: 'Skyline Dynasty',
            crewTag: '2KHYB'
        },
        profile: {
            username: 'VIP Baller',
            gamertag: 'KING_2K26',
            favoriteTeamId: '2k14_mia',
            geoRank: '#14 Local · Top 2%',
            winStreak: 5,
            bestWinStreak: 11,
            wins: 18,
            losses: 4,
            gamesPlayed: 22,
            careerPoints: 340,
            careerRebounds: 96,
            careerAssists: 112,
            careerSteals: 34,
            careerBlocks: 22,
            careerGreens: 64,
            careerThreesMade: 52,
            careerFgm: 136,
            careerFga: 242,
            careerTpa: 118,
            eraMastery2K14: 68,
            eraMastery2K26: 74,
            unlockedAchievements: [
                'DUAL_ERA_CHAMPION'
            ],
            shotChartHistory: createInitialShotChart()
        },
        challenges: createDefaultChallenges(),
        settings: {
            gameplay: {
                difficulty: 'All-Star',
                quarterLengthMin: 5,
                gameSpeed: 50,
                fatigue: true,
                injuries: false,
                shootingModel: 'HYBRID_RHYTHM',
                shotTimingProfile: 'NORMAL',
                visualCue: 'SET_POINT',
                layupTiming: true,
                freeThrowTiming: 'USER_TIMING',
                outOfBounds: true,
                eightSecBackcourt: true,
                shotClock24: true,
                reachInFouls: true,
                paintThreeSecViolation: true,
                blacktopWinByTwo: true,
                blacktopMakeItTakeIt: false,
                blacktopScoring: '1S_2S'
            },
            controller: {
                proStickMode: 'RHYTHM_2K26',
                shotMeterEnabled: true,
                shotMeterStyle: '2K26_ARROW',
                shotMeterColor: 'GREEN',
                rhythmShootingEnabled: true,
                shotFeedbackMode: 'ALL',
                vibrationFeedback: true,
                defensiveAssist: 35,
                boxoutAssist: 50,
                whoToGuardArrow: true,
                iconPassingEnabled: true,
                showVirtualTouchControls: 'AUTO',
                keybinds: _extends({}, DEFAULT_KEYBINDS),
                customHudLayout: createDefaultCustomHudLayout()
            },
            camera: {
                angle: '2K',
                zoom: 5,
                height: 6,
                autoFlip: true,
                keyZoom: true,
                reverseAngle: false,
                dunkCameraShake: true
            },
            audio: {
                masterVolume: 82,
                musicVolume: 65,
                sfxVolume: 88,
                crowdVolume: 76,
                commentaryVolume: 80,
                paAnnouncerEnabled: true,
                beatsShuffle: false,
                enabledTrackIds: [].concat(DEFAULT_TRACK_IDS)
            },
            visual: {
                scoreboardEra: 'AUTO',
                scorebugPosition2K26: 'BOTTOM_LEFT',
                showFpsTelemetry: true,
                showShotFeedback: true,
                showPlayerIcons: true,
                cinema3DQuality: 'HIGH',
                graphicsQuality: 'HIGH',
                crowdDensity: 'HIGH',
                hardwoodReflections: true,
                hotColdZones: 'BALL_HANDLER',
                playVision: 'PICK_AND_ROLL',
                playVisionDensity: 'FULL'
            },
            coach: {
                aceAdaptiveCoaching: true,
                autoTimeouts: false,
                autoSubstitutions: true,
                userShotSlider: 50,
                cpuDefenseSlider: 50,
                dunkFrequencySlider: 50,
                sliders: {
                    activePreset: 'HYBRID_PRO_BALANCED',
                    user: createBalancedSliders(),
                    cpu: createBalancedSliders(),
                    customPreset: null
                }
            }
        },
        activeMatchConfig: {
            awayTeamId: '2k14_mia',
            homeTeamId: '2k26_okc',
            awayEraPool: 'NBA_2K14',
            homeEraPool: 'NBA_2K26',
            awayJersey: 'AWAY',
            homeJersey: 'HOME',
            venue: 'ARENA_2K26',
            quarterLengthMin: 5,
            difficulty: 'All-Star',
            sideControl: 'HOME',
            modeLabel: 'Play Now · Cross-Era Tip-Off',
            playersPerSide: 5,
            targetScore: null
        },
        lastUpdatedMs: Date.now()
    };
}
function safeReadStorage(key) {
    try {
        if (typeof window === 'undefined' || !window.localStorage) return null;
        return window.localStorage.getItem(key);
    } catch (unused) {
        return null;
    }
}
function safeWriteStorage(key, value) {
    try {
        if (typeof window === 'undefined' || !window.localStorage) return;
        window.localStorage.setItem(key, value);
    } catch (unused) {
    // Ignore storage quota/sandbox errors
    }
}
var LEGACY_VENUE_MAP = {
    HOME_ARENA: 'ARENA_2K26',
    FINALS_2K14: 'ARENA_2K14',
    SUNSET_PARK: 'SUNSET_BEACH',
    SKYLINE_ROOFTOP: 'SKYLINE_PARK',
    THE_REC: 'RIVET_CITY'
};
var VALID_VENUES = new Set([
    'ARENA_2K26',
    'ARENA_2K14',
    'SKYLINE_PARK',
    'RIVET_CITY',
    'SUNSET_BEACH',
    'OLD_TOWN',
    'BLACKTOP_CAGE',
    'STREET_KINGS',
    'EUROLEAGUE_PALACE',
    'WNBA_ARENA'
]);
function normalizeVenue(v, fallback) {
    var _LEGACY_VENUE_MAP_v;
    if (typeof v !== 'string') return fallback;
    if (VALID_VENUES.has(v)) return v;
    return (_LEGACY_VENUE_MAP_v = LEGACY_VENUE_MAP[v]) != null ? _LEGACY_VENUE_MAP_v : fallback;
}
var VALID_CAMERA_ANGLES = new Set([
    '2K',
    '2K_LOW',
    'BROADCAST',
    'DRIVE',
    'PLAYER_LOCK',
    'HIGH',
    'NOSEBLEEDS'
]);
var LEGACY_CAMERA_ANGLE_MAP = {
    '2K_CAM': '2K',
    BROADCAST_2K14: 'BROADCAST',
    DYNAMIC_2K26: '2K_LOW'
};
function normalizeCameraAngle(angle, fallback) {
    var _LEGACY_CAMERA_ANGLE_MAP_angle;
    if (typeof angle !== 'string') return fallback;
    if (VALID_CAMERA_ANGLES.has(angle)) return angle;
    return (_LEGACY_CAMERA_ANGLE_MAP_angle = LEGACY_CAMERA_ANGLE_MAP[angle]) != null ? _LEGACY_CAMERA_ANGLE_MAP_angle : fallback;
}
var VALID_SHOT_METER_STYLES = new Set([
    '2K26_ARROW',
    '2K14_FLOOR_RING',
    'COMET',
    'VERTICAL_BAR',
    'MINIMAL'
]);
var LEGACY_SHOT_METER_MAP = {
    '2K26_CURVED': '2K26_ARROW',
    '2K14_CLASSIC_ARC': '2K14_FLOOR_RING',
    MINIMAL_RING: 'MINIMAL'
};
function normalizeShotMeterStyle(style, fallback) {
    var _LEGACY_SHOT_METER_MAP_style;
    if (typeof style !== 'string') return fallback;
    if (VALID_SHOT_METER_STYLES.has(style)) return style;
    return (_LEGACY_SHOT_METER_MAP_style = LEGACY_SHOT_METER_MAP[style]) != null ? _LEGACY_SHOT_METER_MAP_style : fallback;
}
function normalizeTeamId(id, fallback) {
    if (typeof id !== 'string' || !id) return fallback;
    if (id === '2k26_okc_4') return '2k26_okc';
    if (id === '2k26_bos_0') return '2k26_bos';
    if (id === '2k26_lal_1') return '2k26_lal';
    if (id === '2k26_gsw_2') return '2k26_gsw';
    if (id === '2k26_den_3') return '2k26_den';
    if (id === '2k26_mil_5') return '2k26_mil';
    if (id === '2k26_nyk_6') return '2k26_nyk';
    if (id === '2k26_sas_7') return '2k26_sas';
    if (id === '2k26_min_8') return '2k26_min';
    if (id === '2k26_mia_9') return '2k26_mia';
    return id;
}
function clampSliderVal(v, fallback) {
    var n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(100, Math.round(n)));
}
function hydrateSliderSet(raw, fallback) {
    if (!raw || (typeof raw === "undefined" ? "undefined" : _type_of(raw)) !== 'object') return _extends({}, fallback);
    var obj = raw;
    return {
        insideShot: clampSliderVal(obj.insideShot, fallback.insideShot),
        closeShot: clampSliderVal(obj.closeShot, fallback.closeShot),
        midRange: clampSliderVal(obj.midRange, fallback.midRange),
        threePt: clampSliderVal(obj.threePt, fallback.threePt),
        layup: clampSliderVal(obj.layup, fallback.layup),
        dunkInTraffic: clampSliderVal(obj.dunkInTraffic, fallback.dunkInTraffic),
        shotContestImpact: clampSliderVal(obj.shotContestImpact, fallback.shotContestImpact),
        blockFrequency: clampSliderVal(obj.blockFrequency, fallback.blockFrequency),
        stealSuccess: clampSliderVal(obj.stealSuccess, fallback.stealSuccess),
        offReb: clampSliderVal(obj.offReb, fallback.offReb),
        defReb: clampSliderVal(obj.defReb, fallback.defReb),
        ballSecurity: clampSliderVal(obj.ballSecurity, fallback.ballSecurity),
        helpDefense: clampSliderVal(obj.helpDefense, fallback.helpDefense),
        gameSpeed: clampSliderVal(obj.gameSpeed, fallback.gameSpeed),
        foulFrequency: clampSliderVal(obj.foulFrequency, fallback.foulFrequency)
    };
}
function deepHydrateSave(raw) {
    var _obj_activeMatchConfig, _ref, _obj_profile, _obj_currencies, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
    var _obj_settings_coach, _obj_settings, _obj_settings1, _obj_settings2, _obj_settings_controller, _obj_settings3, _obj_settings_controller1, _obj_settings4, _obj_settings_controller2, _obj_settings5, _obj_settings6, _obj_settings_camera, _obj_settings7, _obj_settings8, _obj_settings_audio, _obj_settings9, _obj_settings10, _obj_settings11;
    var def = createDefaultUltimateHybridSave();
    if (!raw || (typeof raw === "undefined" ? "undefined" : _type_of(raw)) !== 'object') return def;
    var obj = raw;
    var validEra = obj.uiEraMode === '2K14_CLASSIC' || obj.uiEraMode === '2K26_NEXTGEN' || obj.uiEraMode === 'HYBRID_PRO' ? obj.uiEraMode : def.uiEraMode;
    var mergedMatch = _extends({}, def.activeMatchConfig, (_obj_activeMatchConfig = obj.activeMatchConfig) != null ? _obj_activeMatchConfig : {});
    var rawSliders = (_obj_settings = obj.settings) == null ? void 0 : (_obj_settings_coach = _obj_settings.coach) == null ? void 0 : _obj_settings_coach.sliders;
    var hydratedSliders = {
        activePreset: (_ref = rawSliders == null ? void 0 : rawSliders.activePreset) != null ? _ref : def.settings.coach.sliders.activePreset,
        user: hydrateSliderSet(rawSliders == null ? void 0 : rawSliders.user, def.settings.coach.sliders.user),
        cpu: hydrateSliderSet(rawSliders == null ? void 0 : rawSliders.cpu, def.settings.coach.sliders.cpu),
        customPreset: (rawSliders == null ? void 0 : rawSliders.customPreset) ? {
            user: hydrateSliderSet(rawSliders.customPreset.user, def.settings.coach.sliders.user),
            cpu: hydrateSliderSet(rawSliders.customPreset.cpu, def.settings.coach.sliders.cpu)
        } : null
    };
    var rawProfile = (_obj_profile = obj.profile) != null ? _obj_profile : {};
    var wins = typeof rawProfile.wins === 'number' ? rawProfile.wins : def.profile.wins;
    var losses = typeof rawProfile.losses === 'number' ? rawProfile.losses : def.profile.losses;
    return {
        version: 1,
        uiEraMode: validEra,
        activeScreen: 'MAIN_MENU',
        currencies: _extends({}, def.currencies, (_obj_currencies = obj.currencies) != null ? _obj_currencies : {}),
        profile: _extends({}, def.profile, rawProfile, {
            gamesPlayed: typeof rawProfile.gamesPlayed === 'number' ? Math.max(wins + losses, rawProfile.gamesPlayed) : wins + losses,
            unlockedAchievements: Array.isArray(rawProfile.unlockedAchievements) ? rawProfile.unlockedAchievements : def.profile.unlockedAchievements,
            shotChartHistory: Array.isArray(rawProfile.shotChartHistory) ? rawProfile.shotChartHistory.slice(-240) : def.profile.shotChartHistory
        }),
        challenges: Array.isArray(obj.challenges) && obj.challenges.length > 0 ? obj.challenges : def.challenges,
        settings: {
            gameplay: _extends({}, def.settings.gameplay, (_ref1 = (_obj_settings1 = obj.settings) == null ? void 0 : _obj_settings1.gameplay) != null ? _ref1 : {}),
            controller: _extends({}, def.settings.controller, (_ref2 = (_obj_settings2 = obj.settings) == null ? void 0 : _obj_settings2.controller) != null ? _ref2 : {}, {
                shotMeterStyle: normalizeShotMeterStyle((_obj_settings3 = obj.settings) == null ? void 0 : (_obj_settings_controller = _obj_settings3.controller) == null ? void 0 : _obj_settings_controller.shotMeterStyle, def.settings.controller.shotMeterStyle),
                keybinds: _extends({}, def.settings.controller.keybinds, (_ref3 = (_obj_settings4 = obj.settings) == null ? void 0 : (_obj_settings_controller1 = _obj_settings4.controller) == null ? void 0 : _obj_settings_controller1.keybinds) != null ? _ref3 : {}),
                customHudLayout: _extends({}, def.settings.controller.customHudLayout, (_ref4 = (_obj_settings5 = obj.settings) == null ? void 0 : (_obj_settings_controller2 = _obj_settings5.controller) == null ? void 0 : _obj_settings_controller2.customHudLayout) != null ? _ref4 : {})
            }),
            camera: _extends({}, def.settings.camera, (_ref5 = (_obj_settings6 = obj.settings) == null ? void 0 : _obj_settings6.camera) != null ? _ref5 : {}, {
                angle: normalizeCameraAngle((_obj_settings7 = obj.settings) == null ? void 0 : (_obj_settings_camera = _obj_settings7.camera) == null ? void 0 : _obj_settings_camera.angle, def.settings.camera.angle)
            }),
            audio: _extends({}, def.settings.audio, (_ref6 = (_obj_settings8 = obj.settings) == null ? void 0 : _obj_settings8.audio) != null ? _ref6 : {}, {
                enabledTrackIds: Array.isArray((_obj_settings9 = obj.settings) == null ? void 0 : (_obj_settings_audio = _obj_settings9.audio) == null ? void 0 : _obj_settings_audio.enabledTrackIds) && obj.settings.audio.enabledTrackIds.length > 0 ? obj.settings.audio.enabledTrackIds : def.settings.audio.enabledTrackIds
            }),
            visual: _extends({}, def.settings.visual, (_ref7 = (_obj_settings10 = obj.settings) == null ? void 0 : _obj_settings10.visual) != null ? _ref7 : {}),
            coach: _extends({}, def.settings.coach, (_ref8 = (_obj_settings11 = obj.settings) == null ? void 0 : _obj_settings11.coach) != null ? _ref8 : {}, {
                sliders: hydratedSliders
            })
        },
        activeMatchConfig: _extends({}, mergedMatch, {
            awayTeamId: normalizeTeamId(mergedMatch.awayTeamId, def.activeMatchConfig.awayTeamId),
            homeTeamId: normalizeTeamId(mergedMatch.homeTeamId, def.activeMatchConfig.homeTeamId),
            venue: normalizeVenue(mergedMatch.venue, def.activeMatchConfig.venue)
        }),
        lastUpdatedMs: typeof obj.lastUpdatedMs === 'number' ? obj.lastUpdatedMs : Date.now()
    };
}
var _state = function() {
    var rawStr = safeReadStorage(HYBRID_SAVE_KEY);
    if (!rawStr) return createDefaultUltimateHybridSave();
    try {
        return deepHydrateSave(JSON.parse(rawStr));
    } catch (unused) {
        return createDefaultUltimateHybridSave();
    }
}();
var _listeners = new Set();
function commitState(next) {
    _state = _extends({}, next, {
        lastUpdatedMs: Date.now()
    });
    safeWriteStorage(HYBRID_SAVE_KEY, JSON.stringify(_state));
    _listeners.forEach(function(fn) {
        return fn(_state);
    });
    return _state;
}
var UltimateHybridStore = {
    getState: function getState() {
        return _state;
    },
    subscribe: function subscribe(listener) {
        _listeners.add(listener);
        return function() {
            _listeners.delete(listener);
        };
    },
    setEraMode: function setEraMode(mode) {
        return commitState(_extends({}, _state, {
            uiEraMode: mode
        }));
    },
    cycleEraMode: function cycleEraMode() {
        var order = [
            'HYBRID_PRO',
            '2K14_CLASSIC',
            '2K26_NEXTGEN'
        ];
        var idx = order.indexOf(_state.uiEraMode);
        var nextMode = order[(idx + 1) % order.length];
        commitState(_extends({}, _state, {
            uiEraMode: nextMode
        }));
        return nextMode;
    },
    setActiveScreen: function setActiveScreen(screen) {
        return commitState(_extends({}, _state, {
            activeScreen: screen
        }));
    },
    updateSettings: function updateSettings(section, patch) {
        var _obj;
        return commitState(_extends({}, _state, {
            settings: _extends({}, _state.settings, (_obj = {}, _obj[section] = _extends({}, _state.settings[section], patch), _obj))
        }));
    },
    updateSlider: function updateSlider(side, key, value) {
        var clamped = clampSliderVal(value, 50);
        var prevSliders = _state.settings.coach.sliders;
        var _obj;
        var nextSide = _extends({}, prevSliders[side], (_obj = {}, _obj[key] = clamped, _obj));
        var _obj1;
        var nextSliders = _extends({}, prevSliders, (_obj1 = {
            activePreset: 'CUSTOM'
        }, _obj1[side] = nextSide, _obj1));
        return commitState(_extends({}, _state, {
            settings: _extends({}, _state.settings, {
                coach: _extends({}, _state.settings.coach, {
                    userShotSlider: nextSliders.user.threePt,
                    cpuDefenseSlider: nextSliders.cpu.helpDefense,
                    dunkFrequencySlider: nextSliders.user.dunkInTraffic,
                    sliders: nextSliders
                })
            })
        }));
    },
    applySliderPreset: function applySliderPreset(presetId) {
        var prevSliders = _state.settings.coach.sliders;
        var nextUser;
        var nextCpu;
        if (presetId === 'CUSTOM' && prevSliders.customPreset) {
            nextUser = _extends({}, prevSliders.customPreset.user);
            nextCpu = _extends({}, prevSliders.customPreset.cpu);
        } else {
            var defKey = presetId === 'CUSTOM' ? '2K26_COMP' : presetId;
            var preset = GAMEPLAY_SLIDER_PRESETS[defKey];
            nextUser = _extends({}, preset.user);
            nextCpu = _extends({}, preset.cpu);
        }
        return commitState(_extends({}, _state, {
            settings: _extends({}, _state.settings, {
                coach: _extends({}, _state.settings.coach, {
                    userShotSlider: nextUser.threePt,
                    cpuDefenseSlider: nextCpu.helpDefense,
                    dunkFrequencySlider: nextUser.dunkInTraffic,
                    sliders: _extends({}, prevSliders, {
                        activePreset: presetId,
                        user: nextUser,
                        cpu: nextCpu
                    })
                })
            })
        }));
    },
    saveCustomSliderPreset: function saveCustomSliderPreset() {
        var prevSliders = _state.settings.coach.sliders;
        return commitState(_extends({}, _state, {
            settings: _extends({}, _state.settings, {
                coach: _extends({}, _state.settings.coach, {
                    sliders: _extends({}, prevSliders, {
                        activePreset: 'CUSTOM',
                        customPreset: {
                            user: _extends({}, prevSliders.user),
                            cpu: _extends({}, prevSliders.cpu)
                        }
                    })
                })
            })
        }));
    },
    updateKeybind: function updateKeybind(action, code) {
        var _obj;
        return commitState(_extends({}, _state, {
            settings: _extends({}, _state.settings, {
                controller: _extends({}, _state.settings.controller, {
                    keybinds: _extends({}, _state.settings.controller.keybinds, (_obj = {}, _obj[action] = code, _obj))
                })
            })
        }));
    },
    resetKeybinds: function resetKeybinds() {
        return commitState(_extends({}, _state, {
            settings: _extends({}, _state.settings, {
                controller: _extends({}, _state.settings.controller, {
                    keybinds: _extends({}, DEFAULT_KEYBINDS)
                })
            })
        }));
    },
    applyCustomHudPreset: function applyCustomHudPreset(preset) {
        return commitState(_extends({}, _state, {
            settings: _extends({}, _state.settings, {
                controller: _extends({}, _state.settings.controller, {
                    customHudLayout: createPresetCustomHudLayout(preset)
                })
            })
        }));
    },
    updateCustomHudLayout: function updateCustomHudLayout(layout) {
        return commitState(_extends({}, _state, {
            settings: _extends({}, _state.settings, {
                controller: _extends({}, _state.settings.controller, {
                    customHudLayout: _extends({}, layout)
                })
            })
        }));
    },
    updateCrewTag: function updateCrewTag(crewTag) {
        var clean = crewTag.trim().toUpperCase().slice(0, 6) || '2KHYB';
        return commitState(_extends({}, _state, {
            currencies: _extends({}, _state.currencies, {
                crewTag: clean
            })
        }));
    },
    updateProfile: function updateProfile(patch) {
        return commitState(_extends({}, _state, {
            profile: _extends({}, _state.profile, patch)
        }));
    },
    updateCurrencies: function updateCurrencies(patch) {
        return commitState(_extends({}, _state, {
            currencies: _extends({}, _state.currencies, patch)
        }));
    },
    updateMatchConfig: function updateMatchConfig(patch) {
        return commitState(_extends({}, _state, {
            activeMatchConfig: _extends({}, _state.activeMatchConfig, patch)
        }));
    },
    addCurrency: function addCurrency(delta) {
        var _delta_seasonXP, _delta_repXP, _delta_vc, _delta_mtp;
        var nextSeasonXP = Math.max(0, _state.currencies.seasonXP + ((_delta_seasonXP = delta.seasonXP) != null ? _delta_seasonXP : 0));
        var nextSeasonLevel = Math.min(40, 1 + Math.floor(nextSeasonXP / 120));
        var nextRepXP = Math.max(0, _state.currencies.repXP + ((_delta_repXP = delta.repXP) != null ? _delta_repXP : 0));
        var repTier = nextRepXP >= 15000 ? 'Legend I' : nextRepXP >= 9000 ? 'Veteran II' : nextRepXP >= 5000 ? 'Starter III' : nextRepXP >= 3000 ? 'Starter II' : 'Rookie V';
        return commitState(_extends({}, _state, {
            currencies: _extends({}, _state.currencies, {
                vc: Math.max(0, _state.currencies.vc + ((_delta_vc = delta.vc) != null ? _delta_vc : 0)),
                mtp: Math.max(0, _state.currencies.mtp + ((_delta_mtp = delta.mtp) != null ? _delta_mtp : 0)),
                seasonXP: nextSeasonXP,
                seasonLevel: nextSeasonLevel,
                repXP: nextRepXP,
                repTier: repTier
            })
        }));
    },
    unlockAchievement: function unlockAchievement(id) {
        if (_state.profile.unlockedAchievements.includes(id)) return false;
        commitState(_extends({}, _state, {
            profile: _extends({}, _state.profile, {
                unlockedAchievements: [].concat(_state.profile.unlockedAchievements, [
                    id
                ])
            })
        }));
        return true;
    },
    commitCompletedMatch: function commitCompletedMatch(input) {
        var baseVc = input.isBlacktopOrPark ? 350 : 650;
        var winBonusVc = input.userWon ? input.isBlacktopOrPark ? 250 : 450 : 0;
        var gradeBonusVc = Math.round(Math.max(0, input.teammateGradeScore) * 4.5);
        var greenBonusVc = Math.min(450, input.greensMade * 45);
        var nextWinStreak = input.userWon ? _state.profile.winStreak + 1 : 0;
        var streakBonusVc = input.userWon && (nextWinStreak >= 3 || input.isBlacktopOrPark) ? 150 + Math.min(250, nextWinStreak * 25) : 0;
        var totalVc = baseVc + winBonusVc + gradeBonusVc + greenBonusVc + streakBonusVc;
        var mtpEarned = Math.round(totalVc * 0.55);
        var seasonXpEarned = (input.userWon ? 240 : 120) + input.greensMade * 12;
        var repXpEarned = (input.userWon ? 320 : 140) + Math.round(input.teammateGradeScore * 1.6);
        var existingAch = new Set(_state.profile.unlockedAchievements);
        var newlyUnlocked = [];
        var tryUnlock = function tryUnlock(id) {
            if (!existingAch.has(id)) {
                existingAch.add(id);
                newlyUnlocked.push(id);
            }
        };
        if (input.topPlayerPts >= 40) tryUnlock('DROP_40_PTS');
        if (input.greenThreesMade >= 5) tryUnlock('FIVE_GREEN_THREES');
        if (input.userWon && input.isBlacktopOrPark) tryUnlock('BREAK_PARK_STREAK');
        if (input.extraAchievements) {
            input.extraAchievements.forEach(tryUnlock);
        }
        var now = Date.now();
        var addedShots = input.matchShots.map(function(s, idx) {
            return {
                id: "sc_" + now + "_" + idx,
                x: s.x,
                y: s.y,
                made: s.made,
                isThree: s.isThree,
                isGreen: s.isGreen,
                era: _state.uiEraMode,
                timestamp: now
            };
        });
        var nextShotHistory = [].concat(_state.profile.shotChartHistory, addedShots).slice(-240);
        var nextSeasonXP = _state.currencies.seasonXP + seasonXpEarned;
        var nextRepXP = _state.currencies.repXP + repXpEarned;
        var repTier = nextRepXP >= 15000 ? 'Legend I' : nextRepXP >= 9000 ? 'Veteran II' : nextRepXP >= 5000 ? 'Starter III' : nextRepXP >= 3000 ? 'Starter II' : 'Rookie V';
        var nextEra14 = _state.uiEraMode === '2K14_CLASSIC' ? Math.min(100, _state.profile.eraMastery2K14 + (input.userWon ? 4 : 1)) : _state.profile.eraMastery2K14;
        var nextEra26 = _state.uiEraMode !== '2K14_CLASSIC' ? Math.min(100, _state.profile.eraMastery2K26 + (input.userWon ? 4 : 1)) : _state.profile.eraMastery2K26;
        commitState(_extends({}, _state, {
            currencies: _extends({}, _state.currencies, {
                vc: _state.currencies.vc + totalVc,
                mtp: _state.currencies.mtp + mtpEarned,
                seasonXP: nextSeasonXP,
                seasonLevel: Math.min(40, 1 + Math.floor(nextSeasonXP / 120)),
                repXP: nextRepXP,
                repTier: repTier
            }),
            profile: _extends({}, _state.profile, {
                gamesPlayed: _state.profile.gamesPlayed + 1,
                wins: _state.profile.wins + (input.userWon ? 1 : 0),
                losses: _state.profile.losses + (input.userWon ? 0 : 1),
                winStreak: nextWinStreak,
                bestWinStreak: Math.max(_state.profile.bestWinStreak, nextWinStreak),
                careerPoints: _state.profile.careerPoints + input.userTeamPts,
                careerRebounds: _state.profile.careerRebounds + input.userTeamReb,
                careerAssists: _state.profile.careerAssists + input.userTeamAst,
                careerSteals: _state.profile.careerSteals + input.userTeamStl,
                careerBlocks: _state.profile.careerBlocks + input.userTeamBlk,
                careerGreens: _state.profile.careerGreens + input.greensMade,
                careerThreesMade: _state.profile.careerThreesMade + input.userTeamTpm,
                careerFgm: _state.profile.careerFgm + input.userTeamFgm,
                careerFga: _state.profile.careerFga + input.userTeamFga,
                careerTpa: _state.profile.careerTpa + input.userTeamTpa,
                eraMastery2K14: nextEra14,
                eraMastery2K26: nextEra26,
                unlockedAchievements: Array.from(existingAch),
                shotChartHistory: nextShotHistory
            })
        }));
        return {
            baseVc: baseVc,
            winBonusVc: winBonusVc,
            gradeBonusVc: gradeBonusVc,
            greenBonusVc: greenBonusVc,
            streakBonusVc: streakBonusVc,
            totalVc: totalVc,
            mtpEarned: mtpEarned,
            seasonXpEarned: seasonXpEarned,
            repXpEarned: repXpEarned,
            newlyUnlockedAchievements: newlyUnlocked
        };
    },
    claimChallenge: function claimChallenge(challengeId) {
        var target = _state.challenges.find(function(c) {
            return c.id === challengeId;
        });
        if (!target || target.claimed || target.progress < target.target) {
            return {
                ok: false,
                rewardVc: 0,
                rewardMtp: 0
            };
        }
        var nextChallenges = _state.challenges.map(function(c) {
            return c.id === challengeId ? _extends({}, c, {
                claimed: true
            }) : c;
        });
        var nextSeasonXP = _state.currencies.seasonXP + target.xpReward;
        commitState(_extends({}, _state, {
            challenges: nextChallenges,
            currencies: _extends({}, _state.currencies, {
                vc: _state.currencies.vc + target.vcReward,
                mtp: _state.currencies.mtp + target.mtpReward,
                seasonXP: nextSeasonXP,
                seasonLevel: Math.min(40, 1 + Math.floor(nextSeasonXP / 120))
            })
        }));
        return {
            ok: true,
            rewardVc: target.vcReward,
            rewardMtp: target.mtpReward
        };
    },
    recordShotChart: function recordShotChart(entry) {
        var item = _extends({}, entry, {
            id: "sc_" + Date.now() + "_" + Math.floor(Math.random() * 9999),
            timestamp: Date.now()
        });
        var nextHistory = [].concat(_state.profile.shotChartHistory, [
            item
        ]).slice(-240);
        return commitState(_extends({}, _state, {
            profile: _extends({}, _state.profile, {
                careerPoints: _state.profile.careerPoints + (entry.made ? entry.isThree ? 3 : 2 : 0),
                careerThreesMade: _state.profile.careerThreesMade + (entry.made && entry.isThree ? 1 : 0),
                careerGreens: _state.profile.careerGreens + (entry.made ? 1 : 0),
                careerFgm: _state.profile.careerFgm + (entry.made ? 1 : 0),
                careerFga: _state.profile.careerFga + 1,
                careerTpa: _state.profile.careerTpa + (entry.isThree ? 1 : 0),
                shotChartHistory: nextHistory
            })
        }));
    },
    exportSaveJson: function exportSaveJson() {
        return JSON.stringify(_state, null, 2);
    },
    importSaveJson: function importSaveJson(rawJson) {
        try {
            var parsed = JSON.parse(rawJson);
            if (!parsed || (typeof parsed === "undefined" ? "undefined" : _type_of(parsed)) !== 'object') {
                return {
                    ok: false,
                    error: 'Invalid JSON payload.'
                };
            }
            commitState(deepHydrateSave(parsed));
            return {
                ok: true
            };
        } catch (unused) {
            return {
                ok: false,
                error: 'Malformed JSON string.'
            };
        }
    },
    resetSave: function resetSave() {
        return commitState(createDefaultUltimateHybridSave());
    }
};
function useUltimateHybridStore() {
    var _useState = (0, _react.useState)(function() {
        return UltimateHybridStore.getState();
    }), snap = _useState[0], setSnap = _useState[1];
    (0, _react.useEffect)(function() {
        return UltimateHybridStore.subscribe(setSnap);
    }, []);
    return snap;
}

});
// === MODULE: src/games/hoops-2k26/hybrid/types ===
ArcadeMod.define("src/games/hoops-2k26/hybrid/types", function(require, module, exports) {
// ============================================================================
// NBA 2K14 + NBA 2K26 ULTIMATE HYBRID — PART 1 CORE TYPES
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});

});
// === MODULE: src/games/hoops-2k26/modes/modesStore ===
ArcadeMod.define("src/games/hoops-2k26/modes/modesStore", function(require, module, exports) {
// ============================================================================
// PART 6 — UNIFIED MODES STORE, MYPLAYER BUILDER ENGINE, PACK ENGINE,
// MYNBA OVR SIMULATION & TRADE MACHINE, AND REWARD SETTLEMENT
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
    get BUILD_MAX_ATTR_BUDGET () {
        return BUILD_MAX_ATTR_BUDGET;
    },
    get MODES_SAVE_KEY () {
        return MODES_SAVE_KEY;
    },
    get ModesStore () {
        return ModesStore;
    },
    get buildToPlayerProfile () {
        return buildToPlayerProfile;
    },
    get clampNum () {
        return clampNum;
    },
    get computeAttributePointBudgetUsed () {
        return computeAttributePointBudgetUsed;
    },
    get computeBuildOvr () {
        return computeBuildOvr;
    },
    get computeDynamicAttributeCaps () {
        return computeDynamicAttributeCaps;
    },
    get computeUnlockedBadges5Tier () {
        return computeUnlockedBadges5Tier;
    },
    get createDefaultPart6Save () {
        return createDefaultPart6Save;
    },
    get createMyNbaSeason () {
        return createMyNbaSeason;
    },
    get deriveBuildArchetypeName () {
        return deriveBuildArchetypeName;
    },
    get evaluateAiTradeApproval () {
        return evaluateAiTradeApproval;
    },
    get formatHeightInches () {
        return formatHeightInches;
    },
    get getEffectiveBuildAttributes () {
        return getEffectiveBuildAttributes;
    },
    get myTeamCardsToProfiles () {
        return myTeamCardsToProfiles;
    },
    get rollMyTeamPack () {
        return rollMyTeamPack;
    },
    get simulateOvrWeightedGame () {
        return simulateOvrWeightedGame;
    },
    get useModesStore () {
        return useModesStore;
    }
});
var _react = require("react");
var _rosterStore = require("../hybrid/rosterStore");
var _rosterTypes = require("../hybrid/rosterTypes");
var _store = require("../hybrid/store");
var _modesTypes = require("./modesTypes");
function _extends() {
    _extends = Object.assign || function assign(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source)if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
var MODES_SAVE_KEY = 'nba2k14_2k26_modes_v1';
// ----------------------------------------------------------------------------
// SAFE LOCALSTORAGE HELPERS
// ----------------------------------------------------------------------------
function safeRead(key) {
    try {
        if (typeof window === 'undefined' || !window.localStorage) return null;
        return window.localStorage.getItem(key);
    } catch (unused) {
        return null;
    }
}
function safeWrite(key, val) {
    try {
        if (typeof window === 'undefined' || !window.localStorage) return;
        window.localStorage.setItem(key, val);
    } catch (unused) {
    // Ignore sandbox/quota errors
    }
}
function clampNum(v, min, max) {
    return Math.max(min, Math.min(max, v));
}
function formatHeightInches(inches) {
    var ft = Math.floor(inches / 12);
    var rem = inches % 12;
    return ft + "'" + rem + '"';
}
function computeDynamicAttributeCaps(position, heightInches, weightLbs, wingspanInches) {
    // Base 85-96 ceilings modified smoothly by height, weight, and wingspan delta
    var hDelta = heightInches - 78; // 0 at 6'6"
    var wDelta = (weightLbs - 210) / 15; // 0 at 210 lbs
    var wingDelta = wingspanInches - heightInches; // 0 = neutral, +6 = long arms, -2 = T-Rex
    var guardBonus = position === 'PG' || position === 'SG' ? 4 : 0;
    var bigBonus = position === 'PF' || position === 'C' ? 5 : 0;
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
        defReb: clampNum(Math.round(84 + hDelta * 1.8 + wingDelta * 1.4 + bigBonus * 0.9), 58, 99)
    };
}
function getEffectiveBuildAttributes(build) {
    var out = _extends({}, build.attributes);
    for(var i = 0; i < _rosterTypes.ATTRIBUTE_META.length; i++){
        var _build_capBreakers_k;
        var k = _rosterTypes.ATTRIBUTE_META[i].key;
        var bonus = (_build_capBreakers_k = build.capBreakers[k]) != null ? _build_capBreakers_k : 0;
        out[k] = clampNum(out[k] + bonus, 25, 99);
    }
    return out;
}
function computeBuildOvr(attrs, capBreakers) {
    var eff = capBreakers ? getEffectiveBuildAttributes({
        attributes: attrs,
        capBreakers: capBreakers
    }) : attrs;
    var vals = _rosterTypes.ATTRIBUTE_META.map(function(m) {
        return eff[m.key];
    });
    var sorted = [].concat(vals).sort(function(a, b) {
        return b - a;
    });
    var top10Avg = sorted.slice(0, 10).reduce(function(s, n) {
        return s + n;
    }, 0) / 10;
    var allAvg = vals.reduce(function(s, n) {
        return s + n;
    }, 0) / vals.length;
    var raw = top10Avg * 0.78 + allAvg * 0.28 + 3;
    return clampNum(Math.round(raw), 60, 99);
}
function computeAttributePointBudgetUsed(attrs) {
    var total = 0;
    for(var i = 0; i < _rosterTypes.ATTRIBUTE_META.length; i++){
        total += attrs[_rosterTypes.ATTRIBUTE_META[i].key];
    }
    return total;
}
var BUILD_MAX_ATTR_BUDGET = 1495; // Allows 99 OVR specialist builds without all-99 cheese
function deriveBuildArchetypeName(attrs, position) {
    var shoot = (attrs.threePt * 1.2 + attrs.midRange) / 2.2;
    var finish = (attrs.drivingDunk * 1.2 + attrs.drivingLayup + attrs.closeShot) / 3.2;
    var play = (attrs.ballHandle * 1.15 + attrs.passAccuracy) / 2.15;
    var def = (attrs.perimeterDef + attrs.interiorDef + attrs.steal + attrs.block) / 4;
    var reb = (attrs.offReb + attrs.defReb) / 2;
    var isTwoWay = def >= 81 || attrs.perimeterDef >= 86 || attrs.block >= 87;
    var prefix = isTwoWay ? '2-Way ' : '';
    if (position === 'C' || position === 'PF') {
        if (shoot >= 82 && finish >= 82) return "" + prefix + "3-Level Stretch Big";
        if (reb >= 88 && attrs.block >= 88) return "" + prefix + "Glass-Cleaning Paint Beast";
        if (finish >= 88) return "" + prefix + "Interior Force";
        if (play >= 80) return "" + prefix + "Diming Point Center";
        return "" + prefix + "Paint Beast";
    }
    if (shoot >= 86 && finish >= 84 && play >= 82) {
        return "" + prefix + "3-Level Shot Creator";
    }
    if (shoot >= 88 && play >= 82) {
        return "" + prefix + "Sharpshooting Facilitator";
    }
    if (shoot >= 84 && finish >= 85) {
        return "" + prefix + "Inside-Out Scorer";
    }
    if (play >= 87 && finish >= 82) {
        return "" + prefix + "Inside-Out Playmaker";
    }
    if (finish >= 88) {
        return "" + prefix + "Slashing High-Flyer";
    }
    if (shoot >= 88) {
        return "" + prefix + "Deep-Range Sharpshooter";
    }
    if (isTwoWay && play >= 80) {
        return '2-Way Floor General';
    }
    return "" + prefix + "All-Around Threat";
}
function tierFromThreshold(val, bronze, silver, gold, hof, legend) {
    if (val >= legend) return 'LEGEND';
    if (val >= hof) return 'HOF';
    if (val >= gold) return 'GOLD';
    if (val >= silver) return 'SILVER';
    if (val >= bronze) return 'BRONZE';
    return null;
}
function computeUnlockedBadges5Tier(attrs, capBreakers) {
    var a = capBreakers ? getEffectiveBuildAttributes({
        attributes: attrs,
        capBreakers: capBreakers
    }) : attrs;
    var out = {};
    var assign = function assign(id, val, b, s, g, h, l) {
        var t = tierFromThreshold(val, b, s, g, h, l);
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
function buildToPlayerProfile(build) {
    var eff = getEffectiveBuildAttributes(build);
    var ovr = computeBuildOvr(build.attributes, build.capBreakers);
    var speedNum = build.jumpshotSpeed === 'SLOW' ? 0.84 : build.jumpshotSpeed === 'QUICK' ? 1.12 : build.jumpshotSpeed === 'VERY_QUICK' ? 1.24 : 1.0;
    return {
        id: "myplayer_" + build.id,
        name: build.name,
        position: build.position,
        jerseyNumber: build.jerseyNumber,
        heightInches: build.heightInches,
        weightLbs: build.weightLbs,
        wingspanInches: build.wingspanInches,
        archetype: build.archetypeName,
        era: '2K26',
        ovr: ovr,
        jumpshotSpeed: speedNum,
        isCreated: true,
        appearance: {
            skinTone: build.cosmetics.skinTone,
            hairStyle: build.cosmetics.hairStyle,
            hairColor: build.cosmetics.hairColor,
            headband: build.cosmetics.headband,
            armSleeve: build.cosmetics.armSleeve,
            legCompression: build.cosmetics.legCompression,
            shoeColor: build.cosmetics.shoeColor
        },
        tendencies: {
            shoot3: eff.threePt,
            driveRim: eff.drivingDunk,
            postUp: eff.closeShot,
            passFirst: eff.passAccuracy,
            stealAggro: eff.steal
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
            paint: eff.drivingDunk >= 84 || eff.closeShot >= 85 ? 1 : 0
        },
        badges: computeUnlockedBadges5Tier(build.attributes, build.capBreakers)
    };
}
function makePresetBuild(slotIndex, name, jerseyNumber, position, heightInches, weightLbs, wingspanInches, attrs, primaryTakeover, careerTeamId) {
    var capBreakers = {};
    var badges = computeUnlockedBadges5Tier(attrs, capBreakers);
    return {
        id: "slot_" + (slotIndex + 1),
        slotIndex: slotIndex,
        name: name,
        jerseyNumber: jerseyNumber,
        position: position,
        heightInches: heightInches,
        weightLbs: weightLbs,
        wingspanInches: wingspanInches,
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
            greenReleaseVfx: 'DEFAULT_EMERALD'
        },
        attributes: attrs,
        capBreakers: capBreakers,
        capBreakersEarned: 5,
        jumpshotSpeed: 'QUICK',
        primaryTakeover: primaryTakeover,
        archetypeName: deriveBuildArchetypeName(attrs, position),
        ovr: computeBuildOvr(attrs, capBreakers),
        badges: badges,
        careerTeamId: careerTeamId,
        careerGameNumber: 1,
        careerWins: slotIndex === 0 ? 12 : 0,
        careerLosses: slotIndex === 0 ? 3 : 0,
        careerPpg: slotIndex === 0 ? 28.4 : 0,
        createdAtMs: Date.now() - (5 - slotIndex) * 86400000
    };
}
function createDefaultBuildSlots() {
    return [
        makePresetBuild(0, 'MP "Skyline" Vance', 1, 'PG', 75, 195, 78, {
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
            defReb: 66
        }, 'SHOT_CREATOR', '2k26_okc'),
        makePresetBuild(1, 'Jaxon "Flash" Reid', 6, 'SG', 78, 208, 82, {
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
            defReb: 70
        }, 'SLASHER', '2k14_mia'),
        makePresetBuild(2, 'Kairo "Clamps" Brooks', 23, 'SF', 80, 225, 85, {
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
            defReb: 82
        }, 'LOCKDOWN', '2k26_bos'),
        makePresetBuild(3, 'Darius "Stretch" King', 35, 'PF', 82, 235, 86, {
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
            defReb: 88
        }, 'SHARP', '2k26_den'),
        makePresetBuild(4, 'Titan "Glass" Monroe', 34, 'C', 85, 262, 91, {
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
            defReb: 95
        }, 'GLASS_CLEANER', '2k26_sas')
    ];
}
// ----------------------------------------------------------------------------
// 2. CREW HQ DEFAULT FACTORY (50-MEMBER ROSTER + WEEKLY GOALS)
// ----------------------------------------------------------------------------
function createDefaultCrew() {
    var posOrder = [
        'PG',
        'SG',
        'SF',
        'PF',
        'C'
    ];
    var prefixes = [
        'Skyline',
        'ProPLAY',
        'Clutch',
        'Green',
        'Fade',
        'Dimer',
        'Rim',
        'Euro',
        'Iso',
        'King'
    ];
    var members = Array.from({
        length: 50
    }, function(_, idx) {
        return {
            id: "crew_m_" + (idx + 1),
            gamertag: idx === 0 ? 'KING_2K26 (You)' : prefixes[idx % prefixes.length] + "_" + (14 + idx * 7 % 85),
            role: idx === 0 ? 'OWNER' : idx < 5 ? 'CAPTAIN' : idx < 18 ? 'VETERAN' : 'MEMBER',
            ovr: idx === 0 ? 94 : clampNum(84 + idx * 5 % 15, 82, 99),
            position: posOrder[idx % 5],
            weeklyRep: Math.max(120, 2400 - idx * 38)
        };
    });
    return {
        name: 'Skyline Dynasty',
        tag: '2KHY',
        emblemColor: '#f59e0b',
        secondaryColor: '#06b6d4',
        level: 14,
        repTotal: 48200,
        members: members,
        weeklyGoals: [
            {
                id: 'cg_1',
                title: 'Win 5 Park or REC Games as a Crew',
                progress: 5,
                target: 5,
                vcReward: 2000,
                repReward: 850,
                claimed: false
            },
            {
                id: 'cg_2',
                title: 'Knock Down 25 Green-Release Threes',
                progress: 19,
                target: 25,
                vcReward: 1500,
                repReward: 600,
                claimed: false
            },
            {
                id: 'cg_3',
                title: 'Defeat 2 Street Kings Coliseum Bosses',
                progress: 1,
                target: 2,
                vcReward: 2500,
                repReward: 1100,
                claimed: false
            }
        ],
        proAmRecord: {
            wins: 11,
            losses: 3,
            trophies: 2
        }
    };
}
// ----------------------------------------------------------------------------
// 3. MYTEAM DUAL-GENDER + DUAL-ERA CARD & PACK ENGINE
// ----------------------------------------------------------------------------
function tierFromOvr(ovr) {
    if (ovr >= 99) return 'DARK_MATTER';
    if (ovr >= 97) return 'GALAXY_OPAL';
    if (ovr >= 95) return 'PINK_DIAMOND';
    if (ovr >= 93) return 'DIAMOND';
    if (ovr >= 90) return 'AMETHYST';
    if (ovr >= 87) return 'RUBY';
    if (ovr >= 84) return 'SAPPHIRE';
    return 'EMERALD';
}
var TIER_ORDER = [
    'EMERALD',
    'SAPPHIRE',
    'RUBY',
    'AMETHYST',
    'DIAMOND',
    'PINK_DIAMOND',
    'GALAXY_OPAL',
    'DARK_MATTER'
];
function makeMyTeamCardFromPlayer(p, team, forcedTier) {
    var tier = forcedTier != null ? forcedTier : tierFromOvr(p.ovr);
    var tierMeta = _modesTypes.MYTEAM_TIERS[tier];
    var ovr = forcedTier ? Math.max(tierMeta.targetOvr, Math.min(99, p.ovr + 2)) : p.ovr;
    var eraLabel = team.era === 'WNBA' ? 'WNBA' : team.era === 'LEGENDS' ? 'LEGEND' : team.era === '2K14' || team.era === 'EUROLEAGUE' ? '2K14' : '2K26';
    var defAvg = Math.round((p.attributes.perimeterDef + p.attributes.interiorDef + p.attributes.steal + p.attributes.block) / 4);
    return {
        id: "mt_" + p.id + "_" + tier + "_" + Math.floor(Math.random() * 99999),
        playerId: p.id,
        name: p.name,
        teamAbbr: team.abbr,
        eraLabel: eraLabel,
        gender: team.era === 'WNBA' ? 'WNBA' : 'NBA',
        position: p.position,
        tier: tier,
        ovr: ovr,
        threePt: clampNum(p.attributes.threePt + (ovr - p.ovr), 50, 99),
        drivingDunk: clampNum(p.attributes.drivingDunk + (ovr - p.ovr), 45, 99),
        ballHandle: clampNum(p.attributes.ballHandle + (ovr - p.ovr), 48, 99),
        defense: clampNum(defAvg + (ovr - p.ovr), 55, 99),
        jerseyNumber: p.jerseyNumber,
        accentColor: team.colors.primary,
        acquiredAtMs: Date.now()
    };
}
function createStarterMyTeam() {
    var teams = _rosterStore.RosterStore.getAllTeams();
    var findStar = function findStar(teamId, idx, tier) {
        var _teams_find, _team_roster_idx;
        var team = (_teams_find = teams.find(function(t) {
            return t.id === teamId;
        })) != null ? _teams_find : teams[0];
        var p = (_team_roster_idx = team.roster[idx]) != null ? _team_roster_idx : team.roster[0];
        return makeMyTeamCardFromPlayer(p, team, tier);
    };
    // Starter Dual-Gender + Dual-Era 8-card squad
    var starterCards = [
        findStar('2k26_okc', 0, 'DIAMOND'),
        findStar('wnba_ind', 0, 'PINK_DIAMOND'),
        findStar('2k14_mia', 0, 'GALAXY_OPAL'),
        findStar('wnba_lva', 3, 'DIAMOND'),
        findStar('2k26_den', 0, 'AMETHYST'),
        findStar('2k14_sas', 0, 'RUBY'),
        findStar('leg_96_chi', 0, 'PINK_DIAMOND'),
        findStar('2k26_bos', 0, 'SAPPHIRE')
    ];
    // Ensure deterministic IDs for starter cards
    starterCards.forEach(function(c, i) {
        c.id = "mt_starter_" + (i + 1);
    });
    return {
        ownedCards: starterCards,
        startingFiveIds: starterCards.slice(0, 5).map(function(c) {
            return c.id;
        }),
        benchIds: starterCards.slice(5, 8).map(function(c) {
            return c.id;
        }),
        gameChangerCounts: {
            GC_2X_MTP_REP: 2,
            GC_DIFFICULTY_REDUCER: 2,
            GC_HOT_START_TAKEOVER: 1,
            GC_WIN_STREAK_SHIELD: 1,
            GC_BADGE_XP_SURGE: 2
        },
        equippedGameChangerId: 'GC_2X_MTP_REP',
        dominationStars: {},
        tripleThreatWins: 0,
        packsOpened: 0
    };
}
function rollMyTeamPack(packId) {
    var _MYTEAM_PACKS_find;
    var pack = (_MYTEAM_PACKS_find = _modesTypes.MYTEAM_PACKS.find(function(p) {
        return p.id === packId;
    })) != null ? _MYTEAM_PACKS_find : _modesTypes.MYTEAM_PACKS[0];
    var allTeams = _rosterStore.RosterStore.getAllTeams();
    var poolTeams = pack.eraFocus === '2K14' ? allTeams.filter(function(t) {
        return t.era === '2K14' || t.era === 'EUROLEAGUE';
    }) : pack.eraFocus === '2K26' ? allTeams.filter(function(t) {
        return t.era === '2K26';
    }) : allTeams.filter(function(t) {
        return t.era === 'LEGENDS' || t.era === 'WNBA';
    });
    var activePool = poolTeams.length > 0 ? poolTeams : allTeams;
    var minIdx = TIER_ORDER.indexOf(pack.guaranteedMinTier);
    var rollTier = function rollTier(guaranteed) {
        var r = Math.random();
        var idx = r > 0.94 ? 7 : r > 0.85 ? 6 : r > 0.72 ? 5 : r > 0.54 ? 4 : r > 0.36 ? 3 : r > 0.2 ? 2 : r > 0.08 ? 1 : 0;
        if (guaranteed && idx < minIdx) idx = minIdx + (Math.random() > 0.72 ? 1 : 0);
        return TIER_ORDER[clampNum(idx, 0, TIER_ORDER.length - 1)];
    };
    var pulled = [];
    for(var i = 0; i < 3; i++){
        var team = activePool[Math.floor(Math.random() * activePool.length)];
        var topPlayers = team.roster.slice(0, Math.min(4, team.roster.length));
        var player = topPlayers[Math.floor(Math.random() * topPlayers.length)];
        pulled.push(makeMyTeamCardFromPlayer(player, team, rollTier(i === 2)));
    }
    return pulled;
}
function myTeamCardsToProfiles(cards) {
    var allTeams = _rosterStore.RosterStore.getAllTeams();
    var playerMap = {};
    for(var i = 0; i < allTeams.length; i++){
        var roster = allTeams[i].roster;
        for(var j = 0; j < roster.length; j++){
            playerMap[roster[j].id] = roster[j];
        }
    }
    return cards.map(function(c) {
        var base = playerMap[c.playerId];
        if (base) {
            return _extends({}, base, {
                ovr: c.ovr,
                attributes: _extends({}, base.attributes, {
                    threePt: c.threePt,
                    drivingDunk: c.drivingDunk,
                    ballHandle: c.ballHandle
                })
            });
        }
        return buildToPlayerProfile(createDefaultBuildSlots()[0]);
    });
}
// ----------------------------------------------------------------------------
// 4. MYNBA ERAS — STANDINGS, 16-TEAM PLAYOFF BRACKET, OVR SIM & TRADE MACHINE
// ----------------------------------------------------------------------------
var EAST_ABBRS = new Set([
    'BOS',
    'MIA',
    'IND',
    'NYK',
    'BKN',
    'CHI',
    'CLE',
    'MIL',
    'PHI',
    'ORL',
    'ATL',
    'TOR',
    'DET',
    'CHA',
    'WAS'
]);
function createMyNbaSeason(era, preferredTeamId) {
    var eraKey = era === 'ERA_2014' ? '2K14' : '2K26';
    var eraTeams = _rosterStore.RosterStore.getAllTeams().filter(function(t) {
        return t.era === eraKey;
    });
    var standings = eraTeams.map(function(t, idx) {
        var baseWins = clampNum(Math.round((t.ovr - 74) * 2.55 + idx * 7 % 7 - 3), 18, 66);
        var wins = clampNum(baseWins, 16, 68);
        return {
            teamId: t.id,
            abbr: t.abbr,
            name: t.city + " " + t.name,
            conference: EAST_ABBRS.has(t.abbr) ? 'EAST' : 'WEST',
            wins: wins,
            losses: 82 - wins,
            ovr: t.ovr,
            ppg: Number((96 + (t.offRating - 75) * 0.95).toFixed(1))
        };
    });
    var east = standings.filter(function(s) {
        return s.conference === 'EAST';
    }).sort(function(a, b) {
        return b.wins - a.wins || b.ovr - a.ovr;
    }).slice(0, 8);
    var west = standings.filter(function(s) {
        return s.conference === 'WEST';
    }).sort(function(a, b) {
        return b.wins - a.wins || b.ovr - a.ovr;
    }).slice(0, 8);
    var pairOrder = [
        [
            0,
            7
        ],
        [
            3,
            4
        ],
        [
            2,
            5
        ],
        [
            1,
            6
        ]
    ];
    var playoffBracket = [];
    pairOrder.forEach(function(param, idx) {
        var hi = param[0], lo = param[1];
        if (east[hi] && east[lo]) {
            playoffBracket.push({
                id: "po_r1_e_" + (idx + 1),
                round: 1,
                conference: 'EAST',
                highSeedTeamId: east[hi].teamId,
                lowSeedTeamId: east[lo].teamId,
                highWins: 0,
                lowWins: 0,
                winnerTeamId: null
            });
        }
    });
    pairOrder.forEach(function(param, idx) {
        var hi = param[0], lo = param[1];
        if (west[hi] && west[lo]) {
            playoffBracket.push({
                id: "po_r1_w_" + (idx + 1),
                round: 1,
                conference: 'WEST',
                highSeedTeamId: west[hi].teamId,
                lowSeedTeamId: west[lo].teamId,
                highWins: 0,
                lowWins: 0,
                winnerTeamId: null
            });
        }
    });
    var defaultTeam = preferredTeamId && eraTeams.some(function(t) {
        return t.id === preferredTeamId;
    }) ? preferredTeamId : era === 'ERA_2014' ? '2k14_mia' : '2k26_okc';
    return {
        era: era,
        userTeamId: defaultTeam,
        seasonYearLabel: era === 'ERA_2014' ? '2013-14 LeBron Era' : '2025-26 Modern ProPLAY Era',
        standings: standings,
        playoffBracket: playoffBracket,
        championTeamId: null,
        tradeHistory: []
    };
}
function simulateOvrWeightedGame(highTeam, lowTeam) {
    var diff = highTeam.ovr - lowTeam.ovr;
    var highWinProb = clampNum(0.52 + diff * 0.032, 0.2, 0.85);
    var highWon = Math.random() < highWinProb;
    var baseHigh = Math.round(98 + (highTeam.offRating - 78) * 0.9 + (Math.random() * 14 - 7));
    var baseLow = Math.round(96 + (lowTeam.offRating - 78) * 0.9 + (Math.random() * 14 - 7));
    var highScore = clampNum(baseHigh, 84, 134);
    var lowScore = clampNum(baseLow, 82, 132);
    if (highWon && highScore <= lowScore) highScore = lowScore + 2 + Math.floor(Math.random() * 8);
    if (!highWon && lowScore <= highScore) lowScore = highScore + 2 + Math.floor(Math.random() * 8);
    return {
        winnerId: highWon ? highTeam.id : lowTeam.id,
        highScore: highScore,
        lowScore: lowScore
    };
}
function advancePlayoffBracketRounds(bracket) {
    var _ref;
    var out = [].concat(bracket);
    var ensureNextRound = function ensureNextRound(prevRound, nextRound, conf) {
        var existingNext = out.filter(function(s) {
            return s.round === nextRound && s.conference === conf;
        });
        if (existingNext.length > 0) return;
        if (nextRound === 4) {
            var eastFinals = out.find(function(s) {
                return s.round === 3 && s.conference === 'EAST';
            });
            var westFinals = out.find(function(s) {
                return s.round === 3 && s.conference === 'WEST';
            });
            if (eastFinals && eastFinals.winnerTeamId && westFinals && westFinals.winnerTeamId) {
                out.push({
                    id: 'po_r4_finals',
                    round: 4,
                    conference: 'FINALS',
                    highSeedTeamId: eastFinals.winnerTeamId,
                    lowSeedTeamId: westFinals.winnerTeamId,
                    highWins: 0,
                    lowWins: 0,
                    winnerTeamId: null
                });
            }
            return;
        }
        var prevSeries = out.filter(function(s) {
            return s.round === prevRound && s.conference === conf;
        });
        if (prevSeries.length >= 2 && prevSeries.every(function(s) {
            return Boolean(s.winnerTeamId);
        })) {
            for(var i = 0; i < prevSeries.length; i += 2){
                var a = prevSeries[i];
                var b = prevSeries[i + 1];
                if (a && b && a.winnerTeamId && b.winnerTeamId) {
                    out.push({
                        id: "po_r" + nextRound + "_" + conf.toLowerCase() + "_" + (i / 2 + 1),
                        round: nextRound,
                        conference: conf,
                        highSeedTeamId: a.winnerTeamId,
                        lowSeedTeamId: b.winnerTeamId,
                        highWins: 0,
                        lowWins: 0,
                        winnerTeamId: null
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
    var finals = out.find(function(s) {
        return s.round === 4;
    });
    return {
        nextBracket: out,
        championTeamId: (_ref = finals == null ? void 0 : finals.winnerTeamId) != null ? _ref : null
    };
}
function evaluateAiTradeApproval(outgoingPlayer, incomingPlayer) {
    var valueOf = function valueOf(p) {
        var badgeBonus = Object.keys(p.badges).length * 0.45;
        return p.ovr * 1.45 + badgeBonus;
    };
    var outVal = valueOf(outgoingPlayer);
    var inVal = valueOf(incomingPlayer);
    var diff = outVal - inVal; // positive means user gives more value -> AI loves it
    var approvalPct = clampNum(Math.round(62 + diff * 4.5), 5, 99);
    var accepted = approvalPct >= 55;
    var reason = approvalPct >= 82 ? 'Partner GM enthusiastically accepts — strong value return.' : approvalPct >= 55 ? 'Balanced blockbuster deal — League Office & GM approve.' : 'AI GM rejects — offer a higher OVR or younger star.';
    return {
        approvalPct: approvalPct,
        accepted: accepted,
        reason: reason
    };
}
function createDefaultPart6Save() {
    var ptgProgress = {};
    _modesTypes.PTG_SCENARIOS.forEach(function(s) {
        ptgProgress[s.id] = {
            completed: false,
            stars: 0,
            bestMargin: 0,
            trophyUnlocked: false
        };
    });
    var drillMedals = {};
    var drillBestScores = {};
    _modesTypes.TRAINING_DRILLS.forEach(function(d) {
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
                createdAtMs: Date.now() - 3600000
            }
        ],
        avatarMapPos: {
            x: 500,
            y: 350
        },
        provingGrounds: {
            tier: 'Bronze',
            rp: 180,
            wins: 2,
            losses: 1
        },
        streetKingsDefeatedIds: [],
        gatoradeBoostGamesLeft: 0,
        gatoradeBestScores: {
            treadmill: 0,
            vertical: 0,
            reaction: 0
        },
        myCourt: {
            woodFloor: 'MAPLE_CLASSIC',
            wallTheme: 'PENTHOUSE_CITY',
            rimSound: 'PURE_NYLON'
        },
        crew: createDefaultCrew(),
        ownedSwagIds: [
            'jrs_skyline',
            'snk_proplay26'
        ],
        ptgProgress: ptgProgress,
        myTeam: createStarterMyTeam(),
        myNba: createMyNbaSeason('ERA_2026'),
        drillMedals: drillMedals,
        drillBestScores: drillBestScores,
        lastUpdatedMs: Date.now()
    };
}
function hydratePart6Save(raw) {
    var _r_ptgProgress, _r_drillMedals, _r_drillBestScores;
    var def = createDefaultPart6Save();
    if (!raw || (typeof raw === "undefined" ? "undefined" : _type_of(raw)) !== 'object') return def;
    var r = raw;
    return _extends({}, def, r, {
        buildSlots: Array.isArray(r.buildSlots) && r.buildSlots.length === 5 ? r.buildSlots : def.buildSlots,
        cityPins: Array.isArray(r.cityPins) ? r.cityPins : def.cityPins,
        provingGrounds: r.provingGrounds ? _extends({}, def.provingGrounds, r.provingGrounds) : def.provingGrounds,
        streetKingsDefeatedIds: Array.isArray(r.streetKingsDefeatedIds) ? r.streetKingsDefeatedIds : def.streetKingsDefeatedIds,
        gatoradeBestScores: r.gatoradeBestScores ? _extends({}, def.gatoradeBestScores, r.gatoradeBestScores) : def.gatoradeBestScores,
        myCourt: r.myCourt ? _extends({}, def.myCourt, r.myCourt) : def.myCourt,
        crew: r.crew ? _extends({}, def.crew, r.crew) : def.crew,
        ownedSwagIds: Array.isArray(r.ownedSwagIds) ? r.ownedSwagIds : def.ownedSwagIds,
        ptgProgress: _extends({}, def.ptgProgress, (_r_ptgProgress = r.ptgProgress) != null ? _r_ptgProgress : {}),
        myTeam: r.myTeam ? _extends({}, def.myTeam, r.myTeam) : def.myTeam,
        myNba: r.myNba && Array.isArray(r.myNba.standings) && r.myNba.standings.length > 0 ? r.myNba : def.myNba,
        drillMedals: _extends({}, def.drillMedals, (_r_drillMedals = r.drillMedals) != null ? _r_drillMedals : {}),
        drillBestScores: _extends({}, def.drillBestScores, (_r_drillBestScores = r.drillBestScores) != null ? _r_drillBestScores : {})
    });
}
var _modesState = function() {
    var raw = safeRead(MODES_SAVE_KEY);
    if (!raw) return createDefaultPart6Save();
    try {
        return hydratePart6Save(JSON.parse(raw));
    } catch (unused) {
        return createDefaultPart6Save();
    }
}();
var _activeLaunchPayload = null;
var _modesListeners = new Set();
function commitModes(next) {
    _modesState = _extends({}, next, {
        lastUpdatedMs: Date.now()
    });
    safeWrite(MODES_SAVE_KEY, JSON.stringify(_modesState));
    _modesListeners.forEach(function(fn) {
        return fn(_modesState);
    });
    return _modesState;
}
var ModesStore = {
    getState: function getState() {
        return _modesState;
    },
    subscribe: function subscribe(listener) {
        _modesListeners.add(listener);
        return function() {
            _modesListeners.delete(listener);
        };
    },
    getActiveBuild: function getActiveBuild() {
        var _modesState_buildSlots__modesState_activeBuildSlotIndex;
        return (_modesState_buildSlots__modesState_activeBuildSlotIndex = _modesState.buildSlots[_modesState.activeBuildSlotIndex]) != null ? _modesState_buildSlots__modesState_activeBuildSlotIndex : _modesState.buildSlots[0];
    },
    setActiveBuildSlot: function setActiveBuildSlot(slotIndex) {
        var idx = clampNum(slotIndex, 0, _modesState.buildSlots.length - 1);
        return commitModes(_extends({}, _modesState, {
            activeBuildSlotIndex: idx
        }));
    },
    saveBuildSlot: function saveBuildSlot(slotIndex, updated) {
        var idx = clampNum(slotIndex, 0, 4);
        var recomputed = _extends({}, updated, {
            slotIndex: idx,
            archetypeName: deriveBuildArchetypeName(getEffectiveBuildAttributes(updated), updated.position),
            ovr: computeBuildOvr(updated.attributes, updated.capBreakers),
            badges: computeUnlockedBadges5Tier(updated.attributes, updated.capBreakers)
        });
        var nextSlots = _modesState.buildSlots.map(function(s, i) {
            return i === idx ? recomputed : s;
        });
        return commitModes(_extends({}, _modesState, {
            activeBuildSlotIndex: idx,
            buildSlots: nextSlots
        }));
    },
    upgradeBuildAttributeWithVc: function upgradeBuildAttributeWithVc(slotIndex, attrKey) {
        var build = _modesState.buildSlots[slotIndex];
        if (!build) return {
            ok: false,
            costVc: 0,
            message: 'Build slot not found.'
        };
        var caps = computeDynamicAttributeCaps(build.position, build.heightInches, build.weightLbs, build.wingspanInches);
        var curr = build.attributes[attrKey];
        if (curr >= caps[attrKey]) {
            return {
                ok: false,
                costVc: 0,
                message: 'Attribute is at physical cap. Use a Cap Breaker!'
            };
        }
        var costVc = Math.round(180 + Math.max(0, curr - 65) * 32);
        var vc = _store.UltimateHybridStore.getState().currencies.vc;
        if (vc < costVc) {
            return {
                ok: false,
                costVc: costVc,
                message: "Need " + costVc.toLocaleString() + " VC (have " + vc.toLocaleString() + ")."
            };
        }
        _store.UltimateHybridStore.addCurrency({
            vc: -costVc
        });
        var _obj;
        var nextAttrs = _extends({}, build.attributes, (_obj = {}, _obj[attrKey] = curr + 1, _obj));
        this.saveBuildSlot(slotIndex, _extends({}, build, {
            attributes: nextAttrs
        }));
        return {
            ok: true,
            costVc: costVc,
            message: "Upgraded " + attrKey + " to " + (curr + 1) + " (-" + costVc + " VC)!"
        };
    },
    // --- THE CITY ---
    setActivePark: function setActivePark(park) {
        return commitModes(_extends({}, _modesState, {
            activePark: park
        }));
    },
    setAvatarMapPos: function setAvatarMapPos(x, y) {
        return commitModes(_extends({}, _modesState, {
            avatarMapPos: {
                x: clampNum(x, 40, 960),
                y: clampNum(y, 40, 660)
            }
        }));
    },
    addCityPin: function addCityPin(label, category, x, y) {
        var pin = {
            id: "pin_" + Date.now() + "_" + Math.floor(Math.random() * 999),
            label: label.trim() || 'Tactical Pin',
            category: category,
            x: clampNum(Math.round(x), 30, 970),
            y: clampNum(Math.round(y), 30, 670),
            createdAtMs: Date.now()
        };
        return commitModes(_extends({}, _modesState, {
            cityPins: [].concat([
                pin
            ], _modesState.cityPins).slice(0, 14)
        }));
    },
    removeCityPin: function removeCityPin(pinId) {
        return commitModes(_extends({}, _modesState, {
            cityPins: _modesState.cityPins.filter(function(p) {
                return p.id !== pinId;
            })
        }));
    },
    clearCityPins: function clearCityPins() {
        return commitModes(_extends({}, _modesState, {
            cityPins: []
        }));
    },
    completeGatoradeDrill: function completeGatoradeDrill(drill, score) {
        var prevBest = _modesState.gatoradeBestScores[drill];
        var nextBest = Math.max(prevBest, score);
        var grantedBoost = score >= 60;
        var vcAwarded = grantedBoost ? 450 : 150;
        _store.UltimateHybridStore.addCurrency({
            vc: vcAwarded,
            seasonXP: 60
        });
        var _obj;
        commitModes(_extends({}, _modesState, {
            gatoradeBoostGamesLeft: grantedBoost ? 5 : _modesState.gatoradeBoostGamesLeft,
            gatoradeBestScores: _extends({}, _modesState.gatoradeBestScores, (_obj = {}, _obj[drill] = nextBest, _obj))
        }));
        return {
            grantedBoost: grantedBoost,
            vcAwarded: vcAwarded
        };
    },
    updateMyCourt: function updateMyCourt(patch) {
        return commitModes(_extends({}, _modesState, {
            myCourt: _extends({}, _modesState.myCourt, patch)
        }));
    },
    updateCrewIdentity: function updateCrewIdentity(patch) {
        var _patch_tag;
        var nextCrew = _extends({}, _modesState.crew, patch, {
            tag: ((_patch_tag = patch.tag) != null ? _patch_tag : _modesState.crew.tag).toUpperCase().slice(0, 4)
        });
        var hybrid = _store.UltimateHybridStore.getState();
        _store.UltimateHybridStore.updateProfile({
            username: hybrid.profile.username
        });
        return commitModes(_extends({}, _modesState, {
            crew: nextCrew
        }));
    },
    claimCrewWeeklyGoal: function claimCrewWeeklyGoal(goalId) {
        var goal = _modesState.crew.weeklyGoals.find(function(g) {
            return g.id === goalId;
        });
        if (!goal || goal.claimed || goal.progress < goal.target) {
            return {
                ok: false,
                vc: 0,
                rep: 0
            };
        }
        var nextGoals = _modesState.crew.weeklyGoals.map(function(g) {
            return g.id === goalId ? _extends({}, g, {
                claimed: true
            }) : g;
        });
        var nextRep = _modesState.crew.repTotal + goal.repReward;
        var nextLevel = clampNum(1 + Math.floor(nextRep / 3200), 1, 30);
        _store.UltimateHybridStore.addCurrency({
            vc: goal.vcReward,
            repXP: goal.repReward
        });
        commitModes(_extends({}, _modesState, {
            crew: _extends({}, _modesState.crew, {
                level: nextLevel,
                repTotal: nextRep,
                weeklyGoals: nextGoals
            })
        }));
        return {
            ok: true,
            vc: goal.vcReward,
            rep: goal.repReward
        };
    },
    buyOrEquipSwag: function buyOrEquipSwag(itemId) {
        var item = _modesTypes.SWAG_STORE_CATALOG.find(function(x) {
            return x.id === itemId;
        });
        if (!item) return {
            ok: false,
            message: 'Item not found.'
        };
        var owned = _modesState.ownedSwagIds.includes(item.id);
        if (!owned) {
            var vc = _store.UltimateHybridStore.getState().currencies.vc;
            if (vc < item.priceVc) {
                return {
                    ok: false,
                    message: "Need " + item.priceVc.toLocaleString() + " VC."
                };
            }
            _store.UltimateHybridStore.addCurrency({
                vc: -item.priceVc
            });
        }
        var active = this.getActiveBuild();
        var nextCosmetics = _extends({}, active.cosmetics);
        if (item.category === 'HEADBAND') {
            nextCosmetics.headband = true;
            nextCosmetics.headbandColor = item.swatch;
        } else if (item.category === 'SLEEVE') {
            var _item_sleeveMode;
            nextCosmetics.armSleeve = (_item_sleeveMode = item.sleeveMode) != null ? _item_sleeveMode : 'LEFT';
        } else if (item.category === 'COMPRESSION') {
            nextCosmetics.legCompression = true;
        } else if (item.category === 'PARK_JERSEY') {
            nextCosmetics.parkJerseyId = item.id;
        } else if (item.category === 'GREEN_VFX' && item.vfxId) {
            nextCosmetics.greenReleaseVfx = item.vfxId;
        } else if (item.category === 'SNEAKER') {
            nextCosmetics.sneakerId = item.id;
            nextCosmetics.shoeColor = item.swatch;
        }
        var nextOwned = owned ? _modesState.ownedSwagIds : [].concat(_modesState.ownedSwagIds, [
            item.id
        ]);
        var nextSlots = _modesState.buildSlots.map(function(b, i) {
            return i === _modesState.activeBuildSlotIndex ? _extends({}, b, {
                cosmetics: nextCosmetics
            }) : b;
        });
        commitModes(_extends({}, _modesState, {
            ownedSwagIds: nextOwned,
            buildSlots: nextSlots
        }));
        return {
            ok: true,
            message: owned ? "Equipped " + item.name + " on " + active.name + "!" : "Purchased & equipped " + item.name + "!"
        };
    },
    // --- MYTEAM ---
    openMyTeamPack: function openMyTeamPack(packId, currency) {
        var pack = _modesTypes.MYTEAM_PACKS.find(function(p) {
            return p.id === packId;
        });
        if (!pack) return {
            ok: false,
            cards: [],
            message: 'Pack unavailable.'
        };
        var wallet = _store.UltimateHybridStore.getState().currencies;
        if (currency === 'VC') {
            if (wallet.vc < pack.priceVc) {
                return {
                    ok: false,
                    cards: [],
                    message: "Need " + pack.priceVc.toLocaleString() + " VC."
                };
            }
            _store.UltimateHybridStore.addCurrency({
                vc: -pack.priceVc
            });
        } else {
            if (wallet.mtp < pack.priceMtp) {
                return {
                    ok: false,
                    cards: [],
                    message: "Need " + pack.priceMtp.toLocaleString() + " MTP."
                };
            }
            _store.UltimateHybridStore.addCurrency({
                mtp: -pack.priceMtp
            });
        }
        var pulled = rollMyTeamPack(packId);
        commitModes(_extends({}, _modesState, {
            myTeam: _extends({}, _modesState.myTeam, {
                ownedCards: [].concat(pulled, _modesState.myTeam.ownedCards),
                packsOpened: _modesState.myTeam.packsOpened + 1
            })
        }));
        return {
            ok: true,
            cards: pulled,
            message: "Opened " + pack.name + "!"
        };
    },
    setMyTeamLineupSlot: function setMyTeamLineupSlot(slotType, index, cardId) {
        var mt = _modesState.myTeam;
        var starters = [].concat(mt.startingFiveIds);
        var bench = [].concat(mt.benchIds);
        // Remove cardId if already placed elsewhere by swapping cleanly
        var prevStarterIdx = starters.indexOf(cardId);
        var prevBenchIdx = bench.indexOf(cardId);
        var displaced = slotType === 'STARTER' ? starters[index] : bench[index];
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
        return commitModes(_extends({}, _modesState, {
            myTeam: _extends({}, mt, {
                startingFiveIds: starters,
                benchIds: bench
            })
        }));
    },
    equipGameChanger: function equipGameChanger(id) {
        return commitModes(_extends({}, _modesState, {
            myTeam: _extends({}, _modesState.myTeam, {
                equippedGameChangerId: id
            })
        }));
    },
    buyGameChanger: function buyGameChanger(id) {
        var _modesState_myTeam_gameChangerCounts_id;
        var def = _modesTypes.GAME_CHANGER_CATALOG.find(function(g) {
            return g.id === id;
        });
        if (!def) return {
            ok: false,
            message: 'Card not found.'
        };
        var mtp = _store.UltimateHybridStore.getState().currencies.mtp;
        if (mtp < def.costMtp) {
            return {
                ok: false,
                message: "Need " + def.costMtp.toLocaleString() + " MTP."
            };
        }
        _store.UltimateHybridStore.addCurrency({
            mtp: -def.costMtp
        });
        var _obj;
        var nextCounts = _extends({}, _modesState.myTeam.gameChangerCounts, (_obj = {}, _obj[id] = ((_modesState_myTeam_gameChangerCounts_id = _modesState.myTeam.gameChangerCounts[id]) != null ? _modesState_myTeam_gameChangerCounts_id : 0) + 1, _obj));
        commitModes(_extends({}, _modesState, {
            myTeam: _extends({}, _modesState.myTeam, {
                gameChangerCounts: nextCounts,
                equippedGameChangerId: id
            })
        }));
        return {
            ok: true,
            message: "Acquired & equipped " + def.name + "!"
        };
    },
    // --- MYNBA ERAS ---
    startNewMyNbaEra: function startNewMyNbaEra(era, userTeamId) {
        return commitModes(_extends({}, _modesState, {
            myNba: createMyNbaSeason(era, userTeamId)
        }));
    },
    setMyNbaUserTeam: function setMyNbaUserTeam(teamId) {
        return commitModes(_extends({}, _modesState, {
            myNba: _extends({}, _modesState.myNba, {
                userTeamId: teamId
            })
        }));
    },
    simulateMyNbaSeriesGame: function simulateMyNbaSeriesGame(seriesId) {
        var series = _modesState.myNba.playoffBracket.find(function(s) {
            return s.id === seriesId;
        });
        if (!series || series.winnerTeamId) {
            return {
                ok: false,
                summary: 'Series already decided.'
            };
        }
        var hi = _rosterStore.RosterStore.getTeamById(series.highSeedTeamId);
        var lo = _rosterStore.RosterStore.getTeamById(series.lowSeedTeamId);
        var sim = simulateOvrWeightedGame(hi, lo);
        var highWins = series.highWins + (sim.winnerId === hi.id ? 1 : 0);
        var lowWins = series.lowWins + (sim.winnerId === lo.id ? 1 : 0);
        var winnerTeamId = highWins >= 4 ? hi.id : lowWins >= 4 ? lo.id : null;
        var updated = _modesState.myNba.playoffBracket.map(function(s) {
            return s.id === seriesId ? _extends({}, s, {
                highWins: highWins,
                lowWins: lowWins,
                winnerTeamId: winnerTeamId
            }) : s;
        });
        var advanced = advancePlayoffBracketRounds(updated);
        commitModes(_extends({}, _modesState, {
            myNba: _extends({}, _modesState.myNba, {
                playoffBracket: advanced.nextBracket,
                championTeamId: advanced.championTeamId
            })
        }));
        return {
            ok: true,
            summary: hi.abbr + " " + sim.highScore + " - " + lo.abbr + " " + sim.lowScore + " (Series " + highWins + "-" + lowWins + ")"
        };
    },
    simulateMyNbaCurrentRound: function simulateMyNbaCurrentRound() {
        var _Math;
        var bracket = [].concat(_modesState.myNba.playoffBracket);
        var activeRounds = bracket.filter(function(s) {
            return !s.winnerTeamId;
        }).map(function(s) {
            return s.round;
        });
        if (activeRounds.length === 0) return {
            ok: false,
            gamesSimulated: 0
        };
        var targetRound = (_Math = Math).min.apply(_Math, [].concat(activeRounds));
        var games = 0;
        bracket = bracket.map(function(s) {
            if (s.round !== targetRound || s.winnerTeamId) return s;
            var hi = _rosterStore.RosterStore.getTeamById(s.highSeedTeamId);
            var lo = _rosterStore.RosterStore.getTeamById(s.lowSeedTeamId);
            var hw = s.highWins;
            var lw = s.lowWins;
            while(hw < 4 && lw < 4){
                var res = simulateOvrWeightedGame(hi, lo);
                if (res.winnerId === hi.id) hw += 1;
                else lw += 1;
                games += 1;
            }
            return _extends({}, s, {
                highWins: hw,
                lowWins: lw,
                winnerTeamId: hw >= 4 ? hi.id : lo.id
            });
        });
        var advanced = advancePlayoffBracketRounds(bracket);
        commitModes(_extends({}, _modesState, {
            myNba: _extends({}, _modesState.myNba, {
                playoffBracket: advanced.nextBracket,
                championTeamId: advanced.championTeamId
            })
        }));
        return {
            ok: true,
            gamesSimulated: games
        };
    },
    executeMyNbaTrade: function executeMyNbaTrade(userTeamId, partnerTeamId, userPlayerId, partnerPlayerId) {
        var userTeam = _rosterStore.RosterStore.getTeamById(userTeamId);
        var partnerTeam = _rosterStore.RosterStore.getTeamById(partnerTeamId);
        var outP = userTeam.roster.find(function(p) {
            return p.id === userPlayerId;
        });
        var inP = partnerTeam.roster.find(function(p) {
            return p.id === partnerPlayerId;
        });
        if (!outP || !inP) {
            return {
                ok: false,
                approvalPct: 0,
                message: 'Select valid players on both teams.'
            };
        }
        var evalRes = evaluateAiTradeApproval(outP, inP);
        if (!evalRes.accepted) {
            return {
                ok: false,
                approvalPct: evalRes.approvalPct,
                message: evalRes.reason
            };
        }
        _rosterStore.RosterStore.tradePlayers(userTeamId, userPlayerId, partnerTeamId, partnerPlayerId);
        var rec = {
            id: "tr_" + Date.now(),
            summary: userTeam.abbr + " sent " + outP.name + " (" + outP.ovr + ") to " + partnerTeam.abbr + " for " + inP.name + " (" + inP.ovr + ")",
            approvalScore: evalRes.approvalPct,
            timestampMs: Date.now()
        };
        commitModes(_extends({}, _modesState, {
            myNba: _extends({}, _modesState.myNba, {
                tradeHistory: [].concat([
                    rec
                ], _modesState.myNba.tradeHistory).slice(0, 12)
            })
        }));
        return {
            ok: true,
            approvalPct: evalRes.approvalPct,
            message: "Trade Approved (" + evalRes.approvalPct + "%)!"
        };
    },
    // --- LAUNCH BRIDGE & POST-MATCH REWARD SETTLEMENT ---
    setActiveLaunchPayload: function setActiveLaunchPayload(payload) {
        _activeLaunchPayload = payload;
    },
    getActiveLaunchPayload: function getActiveLaunchPayload() {
        return _activeLaunchPayload;
    },
    launchModeMatch: function launchModeMatch(payload) {
        _activeLaunchPayload = payload;
        _store.UltimateHybridStore.updateMatchConfig(payload.matchPatch);
        _store.UltimateHybridStore.setActiveScreen('LIVE_GAME');
    },
    settleCompletedModeMatch: function settleCompletedModeMatch(result) {
        var _payload_baseVcReward, _payload_baseMtpReward, _payload_baseRepReward;
        var payload = _activeLaunchPayload;
        if (!payload) {
            return {
                headline: 'Match Complete',
                vcEarned: 400,
                mtpEarned: 200,
                repEarned: 100,
                details: ''
            };
        }
        var vc = (_payload_baseVcReward = payload.baseVcReward) != null ? _payload_baseVcReward : result.userWon ? 800 : 300;
        var mtp = (_payload_baseMtpReward = payload.baseMtpReward) != null ? _payload_baseMtpReward : result.userWon ? 500 : 180;
        var rep = (_payload_baseRepReward = payload.baseRepReward) != null ? _payload_baseRepReward : result.userWon ? 260 : 90;
        var headline = result.userWon ? "" + payload.title + " — Victory!" : "" + payload.title + " — Final";
        var details = '';
        var nextState = _extends({}, _modesState);
        // Decrement Gatorade boost if active
        if (nextState.gatoradeBoostGamesLeft > 0 && payload.kind !== 'TRAINING_FREESTYLE') {
            nextState.gatoradeBoostGamesLeft = Math.max(0, nextState.gatoradeBoostGamesLeft - 1);
        }
        // Consume & apply MyTEAM Game Changer Card
        if (payload.myTeamGameChangerId) {
            var _nextState_myTeam_gameChangerCounts_gcId;
            var gcId = payload.myTeamGameChangerId;
            if (gcId === 'GC_2X_MTP_REP') {
                mtp *= 2;
                rep *= 2;
                details = 'Game Changer: 2x MTP & Rep applied! ';
            } else if (gcId === 'GC_BADGE_XP_SURGE') {
                vc += 500;
                rep += 250;
                details = 'Game Changer: Badge XP Surge (+500 VC)! ';
            }
            var prevCount = (_nextState_myTeam_gameChangerCounts_gcId = nextState.myTeam.gameChangerCounts[gcId]) != null ? _nextState_myTeam_gameChangerCounts_gcId : 0;
            var _obj;
            nextState.myTeam = _extends({}, nextState.myTeam, {
                gameChangerCounts: _extends({}, nextState.myTeam.gameChangerCounts, (_obj = {}, _obj[gcId] = Math.max(0, prevCount - 1), _obj)),
                equippedGameChangerId: prevCount > 1 ? gcId : null
            });
        }
        // 1. Path to Greatness
        if (payload.kind === 'PATH_TO_GREATNESS' && payload.ptgScenarioId) {
            var sc = _modesTypes.PTG_SCENARIOS.find(function(s) {
                return s.id === payload.ptgScenarioId;
            });
            if (sc) {
                var _nextState_ptgProgress_sc_id;
                var stars = 0;
                if (result.userWon) stars += 1;
                if (result.userWon && result.starPts >= sc.targetStarPts) stars += 1;
                if (result.userWon && result.starPts >= sc.targetStarPts && result.starAst >= sc.targetStarAst) {
                    stars += 1;
                }
                var prev = (_nextState_ptgProgress_sc_id = nextState.ptgProgress[sc.id]) != null ? _nextState_ptgProgress_sc_id : {
                    completed: false,
                    stars: 0,
                    bestMargin: 0,
                    trophyUnlocked: false
                };
                var _obj1;
                nextState.ptgProgress = _extends({}, nextState.ptgProgress, (_obj1 = {}, _obj1[sc.id] = {
                    completed: prev.completed || result.userWon,
                    stars: Math.max(prev.stars, stars),
                    bestMargin: Math.max(prev.bestMargin, result.margin),
                    trophyUnlocked: prev.trophyUnlocked || stars >= 2
                }, _obj1));
                if (result.userWon) {
                    vc = sc.vcReward + stars * 400;
                    headline = sc.title + " Cleared (" + stars + "★)";
                    details += stars >= 2 ? "Unlocked " + sc.trophyName + "!" : 'Win achieved — reach LeBron stat targets for 3★.';
                }
            }
        }
        // 2. Street Kings Boss Ladder
        if (payload.kind === 'CITY_STREET_KINGS' && payload.streetKingsBossId && result.userWon) {
            var boss = _modesTypes.STREET_KINGS_BOSSES.find(function(b) {
                return b.id === payload.streetKingsBossId;
            });
            if (boss) {
                vc = boss.vcBounty;
                rep = boss.badgeXpReward;
                if (!nextState.streetKingsDefeatedIds.includes(boss.id)) {
                    nextState.streetKingsDefeatedIds = [].concat(nextState.streetKingsDefeatedIds, [
                        boss.id
                    ]);
                }
                headline = "Coliseum Boss Defeated: " + boss.name + "!";
                details += "Bounty claimed: +" + boss.vcBounty.toLocaleString() + " VC & +" + boss.badgeXpReward + " Badge XP.";
            }
        }
        // 3. Proving Grounds Ranked Ladder
        if (payload.kind === 'CITY_PROVING_GROUNDS') {
            var rpDelta = result.userWon ? 160 : -65;
            var nextRp = Math.max(0, nextState.provingGrounds.rp + rpDelta);
            var tier = nextRp >= 1600 ? 'Elite' : nextRp >= 1250 ? 'Diamond' : nextRp >= 920 ? 'Platinum' : nextRp >= 620 ? 'Gold' : nextRp >= 340 ? 'Silver' : 'Bronze';
            nextState.provingGrounds = {
                tier: tier,
                rp: nextRp,
                wins: nextState.provingGrounds.wins + (result.userWon ? 1 : 0),
                losses: nextState.provingGrounds.losses + (result.userWon ? 0 : 1)
            };
            details += "Proving Grounds: " + tier + " (" + nextRp + " RP, " + (rpDelta >= 0 ? '+' : '') + rpDelta + ").";
        }
        // 4. Skyline Park Streak Setter / Breaker Bonus
        if (payload.kind === 'CITY_PARK' && result.userWon && payload.parkStreakBonusVc) {
            vc += payload.parkStreakBonusVc;
            details += "Streak Breaker Bonus: +" + payload.parkStreakBonusVc.toLocaleString() + " VC!";
        }
        // 5. MyCAREER NBA Game progress
        if (payload.kind === 'CITY_MYCAREER_NBA') {
            var idx = nextState.activeBuildSlotIndex;
            var active = nextState.buildSlots[idx];
            if (active) {
                var nextBuild = _extends({}, active, {
                    careerGameNumber: active.careerGameNumber + 1,
                    careerWins: active.careerWins + (result.userWon ? 1 : 0),
                    careerLosses: active.careerLosses + (result.userWon ? 0 : 1),
                    careerPpg: Number(((active.careerPpg * 3 + Math.max(12, result.starPts)) / 4).toFixed(1))
                });
                nextState.buildSlots = nextState.buildSlots.map(function(b, i) {
                    return i === idx ? nextBuild : b;
                });
            }
        }
        // 6. MyTEAM Domination & Triple Threat
        if (payload.kind === 'MYTEAM_DOMINATION' && payload.myTeamDominationTeamId && result.userWon) {
            var _nextState_myTeam_dominationStars_payload_myTeamDominationTeamId;
            var stars1 = result.margin >= 12 ? 3 : result.margin >= 6 ? 2 : 1;
            var prev1 = (_nextState_myTeam_dominationStars_payload_myTeamDominationTeamId = nextState.myTeam.dominationStars[payload.myTeamDominationTeamId]) != null ? _nextState_myTeam_dominationStars_payload_myTeamDominationTeamId : 0;
            var _obj2;
            nextState.myTeam = _extends({}, nextState.myTeam, {
                dominationStars: _extends({}, nextState.myTeam.dominationStars, (_obj2 = {}, _obj2[payload.myTeamDominationTeamId] = Math.max(prev1, stars1), _obj2))
            });
            details += "Domination Complete: " + stars1 + "★ earned!";
        }
        if (payload.kind === 'MYTEAM_TRIPLE_THREAT' && result.userWon) {
            nextState.myTeam = _extends({}, nextState.myTeam, {
                tripleThreatWins: nextState.myTeam.tripleThreatWins + 1
            });
            details += "Triple Threat Win #" + nextState.myTeam.tripleThreatWins + "!";
        }
        // 7. MyNBA Playoff Series game
        if (payload.kind === 'MYNBA_GAME' && payload.myNbaSeriesId) {
            var s = nextState.myNba.playoffBracket.find(function(x) {
                return x.id === payload.myNbaSeriesId;
            });
            if (s && !s.winnerTeamId) {
                var userIsHigh = s.highSeedTeamId === nextState.myNba.userTeamId;
                var highWon = userIsHigh ? result.userWon : !result.userWon;
                var hw = s.highWins + (highWon ? 1 : 0);
                var lw = s.lowWins + (highWon ? 0 : 1);
                var winnerTeamId = hw >= 4 ? s.highSeedTeamId : lw >= 4 ? s.lowSeedTeamId : null;
                var updated = nextState.myNba.playoffBracket.map(function(x) {
                    return x.id === s.id ? _extends({}, x, {
                        highWins: hw,
                        lowWins: lw,
                        winnerTeamId: winnerTeamId
                    }) : x;
                });
                var adv = advancePlayoffBracketRounds(updated);
                nextState.myNba = _extends({}, nextState.myNba, {
                    playoffBracket: adv.nextBracket,
                    championTeamId: adv.championTeamId
                });
                details += "Playoff Series updated (" + hw + "-" + lw + ").";
            }
        }
        // 8. Training Camp Drill Medal
        if (payload.kind === 'TRAINING_DRILL' && payload.trainingDrillId) {
            var drill = _modesTypes.TRAINING_DRILLS.find(function(d) {
                return d.id === payload.trainingDrillId;
            });
            if (drill) {
                var _nextState_drillMedals_drill_id, _nextState_drillBestScores_drill_id;
                var score = result.drillMetricCount;
                var medal = score >= drill.goldTarget ? 'GOLD' : score >= drill.silverTarget ? 'SILVER' : score >= drill.bronzeTarget ? 'BRONZE' : 'NONE';
                var rankOrder = [
                    'NONE',
                    'BRONZE',
                    'SILVER',
                    'GOLD'
                ];
                var prevMedal = (_nextState_drillMedals_drill_id = nextState.drillMedals[drill.id]) != null ? _nextState_drillMedals_drill_id : 'NONE';
                var bestMedal = rankOrder.indexOf(medal) > rankOrder.indexOf(prevMedal) ? medal : prevMedal;
                var _obj3;
                nextState.drillMedals = _extends({}, nextState.drillMedals, (_obj3 = {}, _obj3[drill.id] = bestMedal, _obj3));
                var _obj4;
                nextState.drillBestScores = _extends({}, nextState.drillBestScores, (_obj4 = {}, _obj4[drill.id] = Math.max((_nextState_drillBestScores_drill_id = nextState.drillBestScores[drill.id]) != null ? _nextState_drillBestScores_drill_id : 0, score), _obj4));
                vc = medal === 'GOLD' ? drill.vcGoldReward : medal === 'SILVER' ? Math.round(drill.vcGoldReward * 0.65) : medal === 'BRONZE' ? Math.round(drill.vcGoldReward * 0.35) : 150;
                headline = drill.title + " — " + (medal === 'NONE' ? 'Completed' : "" + medal + " Medal!");
                details = "Recorded " + score + " " + drill.metricLabel + ".";
            }
        }
        _store.UltimateHybridStore.addCurrency({
            vc: vc,
            mtp: mtp,
            repXP: rep,
            seasonXP: Math.round(rep * 0.65)
        });
        commitModes(nextState);
        return {
            headline: headline,
            vcEarned: vc,
            mtpEarned: mtp,
            repEarned: rep,
            details: details.trim()
        };
    },
    resetModesSave: function resetModesSave() {
        return commitModes(createDefaultPart6Save());
    }
};
function useModesStore() {
    var _useState = (0, _react.useState)(function() {
        return ModesStore.getState();
    }), snap = _useState[0], setSnap = _useState[1];
    (0, _react.useEffect)(function() {
        return ModesStore.subscribe(setSnap);
    }, []);
    return snap;
}

});

})(window.ArcadeMod);
