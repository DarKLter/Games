(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/modes/modesTypes ===
ArcadeMod.define("src/games/hoops-2k26/modes/modesTypes", function(require, module, exports) {
// ============================================================================
// PART 6 — GAME MODES, THE CITY, MYPLAYER BUILDER, PTG, MYTEAM, MYNBA,
// BLACKTOP & TRAINING CAMP TYPES & STATIC CATALOGS
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
    get CITY_LANDMARKS () {
        return CITY_LANDMARKS;
    },
    get GAME_CHANGER_CATALOG () {
        return GAME_CHANGER_CATALOG;
    },
    get JUMPSHOT_SPEED_OPTIONS () {
        return JUMPSHOT_SPEED_OPTIONS;
    },
    get MYTEAM_PACKS () {
        return MYTEAM_PACKS;
    },
    get MYTEAM_TIERS () {
        return MYTEAM_TIERS;
    },
    get PTG_SCENARIOS () {
        return PTG_SCENARIOS;
    },
    get STREET_KINGS_BOSSES () {
        return STREET_KINGS_BOSSES;
    },
    get SWAG_STORE_CATALOG () {
        return SWAG_STORE_CATALOG;
    },
    get TAKEOVER_OPTIONS () {
        return TAKEOVER_OPTIONS;
    },
    get TRAINING_DRILLS () {
        return TRAINING_DRILLS;
    }
});
var JUMPSHOT_SPEED_OPTIONS = [
    {
        id: 'SLOW',
        label: 'Slow · Smooth Set',
        releaseMs: 680
    },
    {
        id: 'NORMAL',
        label: 'Normal · Classic 2K14',
        releaseMs: 580
    },
    {
        id: 'QUICK',
        label: 'Quick · ProPLAY Pro',
        releaseMs: 500
    },
    {
        id: 'VERY_QUICK',
        label: 'Very Quick · Meta 2K26',
        releaseMs: 430
    }
];
var TAKEOVER_OPTIONS = [
    {
        id: 'SHARP',
        label: 'Sharpshooter',
        boostText: '+10 3PT & Limitless Green Window',
        accent: '#22c55e'
    },
    {
        id: 'SLASHER',
        label: 'Slasher',
        boostText: '+10 Driving Dunk, Layup & Vertical',
        accent: '#ef4444'
    },
    {
        id: 'SHOT_CREATOR',
        label: 'Shot Creator',
        boostText: '+10 Mid-Range & Stepback Timing',
        accent: '#f59e0b'
    },
    {
        id: 'PLAYMAKER',
        label: 'Playmaker',
        boostText: '+10 Ball Handle, Speed & Ankle Breakers',
        accent: '#06b6d4'
    },
    {
        id: 'LOCKDOWN',
        label: 'Lockdown Defender',
        boostText: '+10 Perimeter Def, Steal & Clamps',
        accent: '#3b82f6'
    },
    {
        id: 'GLASS_CLEANER',
        label: 'Glass Cleaner',
        boostText: '+10 Off/Def Rebound, Block & Strength',
        accent: '#a855f7'
    }
];
var CITY_LANDMARKS = [
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
        summary: '12-Foot Golden Statues of #1 Rep Legends, City Leaderboards & Quick Build Swap Kiosk.'
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
        summary: 'Switch Skyline Park, Rivet City, Sunset Beach & Old Town. 4 Live Courts with Streak Setter/Breaker VC!'
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
        summary: '5v5 Competitive Indoor Gym · Squads & No-Squads full 4-quarter games.'
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
        summary: '4 Rotating Arcade Rulesets: 1v1 Instant, 3v3 No Squads, 2x Speed Arcade & 3PT = 4 Points.'
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
        summary: 'Bronze → Elite Ranked Ladder enforcing 2K26 High-Risk Green-or-Miss shooting.'
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
        summary: '3v3 & 5v5 Crew Tournament Arena with custom Crew Jerseys & Championship Trophy Bracket.'
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
        summary: '5-Boss CPU Coliseum Ladder from Rim Reaper (92) to King of the City (99) with huge VC bounties.'
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
        summary: '3 Playable Timing Mini-Games granting live +4 Stamina & Turbo Boost for your next 5 games.'
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
        summary: 'Customize Wood Floor, Wall Theme & Rim Sound · Instant 3D Shootaround or 1v1 AI Sparring.'
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
        summary: 'Out of Bounds Rookie-to-Superstar Story Tracker, Team Contract & Scheduled NBA Games.'
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
        summary: 'Manage your 50-Member Crew, Weekly Crew Goals & buy Headbands, Sleeves, Sneakers & Green VFX.'
    }
];
var STREET_KINGS_BOSSES = [
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
        attributes: {
            drivingDunk: 98,
            vertical: 95,
            block: 96,
            interiorDef: 92,
            strength: 93
        }
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
        attributes: {
            ballHandle: 98,
            speed: 96,
            acceleration: 96,
            threePt: 93,
            passAccuracy: 92
        }
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
        attributes: {
            threePt: 99,
            midRange: 96,
            freeThrow: 97,
            ballHandle: 90,
            perimeterDef: 88
        }
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
        attributes: {
            block: 99,
            interiorDef: 98,
            defReb: 98,
            offReb: 96,
            closeShot: 96,
            drivingDunk: 94
        }
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
            defReb: 94
        }
    }
];
var SWAG_STORE_CATALOG = [
    {
        id: 'hb_gold',
        name: 'Championship Gold Headband',
        category: 'HEADBAND',
        priceVc: 600,
        swatch: '#f59e0b',
        description: '2K14 Finals edition terrycloth headband.'
    },
    {
        id: 'hb_crimson',
        name: 'Miami Crimson Headband',
        category: 'HEADBAND',
        priceVc: 500,
        swatch: '#e11d48',
        description: 'Classic Heat Dynasty headband.'
    },
    {
        id: 'hb_obsidian',
        name: '2K26 Obsidian Stealth Band',
        category: 'HEADBAND',
        priceVc: 750,
        swatch: '#1e293b',
        description: 'Matte black moisture-wicking band.'
    },
    {
        id: 'slv_left_cyan',
        name: 'ProPLAY Shooter Sleeve (Left)',
        category: 'SLEEVE',
        priceVc: 800,
        swatch: '#06b6d4',
        description: 'Compression shooting arm sleeve.',
        sleeveMode: 'LEFT'
    },
    {
        id: 'slv_both_gold',
        name: 'Dual Legend Sleeves',
        category: 'SLEEVE',
        priceVc: 1200,
        swatch: '#eab308',
        description: 'Full dual-arm championship sleeves.',
        sleeveMode: 'BOTH'
    },
    {
        id: 'comp_pro',
        name: 'Full-Leg Compression Tights',
        category: 'COMPRESSION',
        priceVc: 900,
        swatch: '#0f172a',
        description: 'Pro-grade dual leg compression.'
    },
    {
        id: 'jrs_skyline',
        name: 'Skyline Park Midnight Tank',
        category: 'PARK_JERSEY',
        priceVc: 1500,
        swatch: '#0ea5e9',
        description: 'Official 2K26 Skyline Park reversible tank.'
    },
    {
        id: 'jrs_rivet',
        name: 'Rivet City Steel Jersey',
        category: 'PARK_JERSEY',
        priceVc: 1500,
        swatch: '#dc2626',
        description: 'Throwback 2K16 Rivet City Roughriders tank.'
    },
    {
        id: 'jrs_sunset',
        name: 'Sunset Beach Coral Tank',
        category: 'PARK_JERSEY',
        priceVc: 1500,
        swatch: '#f97316',
        description: 'Throwback Sunset Beach Ballers tank.'
    },
    {
        id: 'jrs_oldtown',
        name: 'Old Town Flyers Retro Mesh',
        category: 'PARK_JERSEY',
        priceVc: 1500,
        swatch: '#8b5cf6',
        description: 'Classic Old Town arcade mesh jersey.'
    },
    {
        id: 'vfx_flame',
        name: 'Green Release VFX: Flame',
        category: 'GREEN_VFX',
        priceVc: 2000,
        swatch: '#f97316',
        description: 'Ignites a blazing flame burst on Perfect Release.',
        vfxId: 'FLAME'
    },
    {
        id: 'vfx_lightning',
        name: 'Green Release VFX: Lightning',
        category: 'GREEN_VFX',
        priceVc: 2200,
        swatch: '#38bdf8',
        description: 'Electric cyan bolt crackles around the net.',
        vfxId: 'LIGHTNING'
    },
    {
        id: 'vfx_2k14',
        name: 'Green Release VFX: 2K14 Classic Ring',
        category: 'GREEN_VFX',
        priceVc: 1800,
        swatch: '#22c55e',
        description: 'Authentic glowing emerald floor ring from 2K14.',
        vfxId: 'CLASSIC_2K14_RING'
    },
    {
        id: 'vfx_crown',
        name: 'Green Release VFX: Golden Crown',
        category: 'GREEN_VFX',
        priceVc: 3000,
        swatch: '#fbbf24',
        description: 'Royal crown splash reserved for City legends.',
        vfxId: 'GOLDEN_CROWN'
    },
    {
        id: 'snk_king14',
        name: 'King XI Crimson Golds',
        category: 'SNEAKER',
        priceVc: 1600,
        swatch: '#e11d48',
        description: '2014 championship signature high-tops.'
    },
    {
        id: 'snk_proplay26',
        name: 'ProPLAY Aero Carbon 26',
        category: 'SNEAKER',
        priceVc: 2400,
        swatch: '#06b6d4',
        description: 'Ultra-light responsive court runners.'
    },
    {
        id: 'snk_golden',
        name: 'City Legend 24K Lows',
        category: 'SNEAKER',
        priceVc: 3200,
        swatch: '#f59e0b',
        description: 'Metallic gold custom signature lows.'
    }
];
var PTG_SCENARIOS = [
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
        trophyName: 'Three-Peat Finals MVP Trophy'
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
        trophyName: 'Eastern Conference Crown'
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
        trophyName: 'Four-Peat Golden Larry O\'Brien'
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
        trophyName: 'The Land Homecoming Ring'
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
        trophyName: 'Mecca of Basketball Banner'
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
        trophyName: 'Timeless GOAT Cross-Era Chalice'
    }
];
var MYTEAM_TIERS = {
    EMERALD: {
        id: 'EMERALD',
        label: 'Emerald',
        targetOvr: 82,
        color: '#10b981',
        glow: '#34d399',
        sellMtp: 450
    },
    SAPPHIRE: {
        id: 'SAPPHIRE',
        label: 'Sapphire',
        targetOvr: 85,
        color: '#3b82f6',
        glow: '#60a5fa',
        sellMtp: 800
    },
    RUBY: {
        id: 'RUBY',
        label: 'Ruby',
        targetOvr: 89,
        color: '#ef4444',
        glow: '#f87171',
        sellMtp: 1400
    },
    AMETHYST: {
        id: 'AMETHYST',
        label: 'Amethyst',
        targetOvr: 91,
        color: '#a855f7',
        glow: '#c084fc',
        sellMtp: 2200
    },
    DIAMOND: {
        id: 'DIAMOND',
        label: 'Diamond',
        targetOvr: 94,
        color: '#06b6d4',
        glow: '#22d3ee',
        sellMtp: 3600
    },
    PINK_DIAMOND: {
        id: 'PINK_DIAMOND',
        label: 'Pink Diamond',
        targetOvr: 96,
        color: '#ec4899',
        glow: '#f472b6',
        sellMtp: 5500
    },
    GALAXY_OPAL: {
        id: 'GALAXY_OPAL',
        label: 'Galaxy Opal',
        targetOvr: 98,
        color: '#f59e0b',
        glow: '#fde047',
        sellMtp: 9000
    },
    DARK_MATTER: {
        id: 'DARK_MATTER',
        label: 'Dark Matter',
        targetOvr: 99,
        color: '#f43f5e',
        glow: '#fb7185',
        sellMtp: 15000
    }
};
var GAME_CHANGER_CATALOG = [
    {
        id: 'GC_2X_MTP_REP',
        name: '2x MTP & Rep Boost',
        description: 'Doubles MTP and Season Rep earned from your next MyTEAM match.',
        accent: '#f59e0b',
        costMtp: 1200
    },
    {
        id: 'GC_DIFFICULTY_REDUCER',
        name: 'Difficulty Reducer',
        description: 'Drops CPU AI difficulty by 1 full tier while preserving full reward payouts.',
        accent: '#22c55e',
        costMtp: 1000
    },
    {
        id: 'GC_HOT_START_TAKEOVER',
        name: 'Instant Hot Start Takeover',
        description: 'Tip off with your Primary Takeover meter 100% ignited immediately.',
        accent: '#ef4444',
        costMtp: 1500
    },
    {
        id: 'GC_WIN_STREAK_SHIELD',
        name: 'Free Win Streak Recovery',
        description: 'Protects your active win streak if you drop a tight matchup.',
        accent: '#06b6d4',
        costMtp: 1100
    },
    {
        id: 'GC_BADGE_XP_SURGE',
        name: 'Badge XP Surge',
        description: 'Grants +150% Badge progression and +500 bonus VC after the buzzer.',
        accent: '#a855f7',
        costMtp: 1400
    }
];
var MYTEAM_PACKS = [
    {
        id: 'PACK_2K14_THROWBACK',
        name: '2K14 Throwback Pack',
        subtitle: '3 Cards · Guaranteed Ruby+ 2013-14 Star',
        priceVc: 2200,
        priceMtp: 2800,
        accent: '#e11d48',
        eraFocus: '2K14',
        guaranteedMinTier: 'RUBY'
    },
    {
        id: 'PACK_2K26_PROPLAY',
        name: '2K26 ProPLAY Series Pack',
        subtitle: '3 Cards · Guaranteed Amethyst+ 2025-26 Phenom',
        priceVc: 2800,
        priceMtp: 3600,
        accent: '#06b6d4',
        eraFocus: '2K26',
        guaranteedMinTier: 'AMETHYST'
    },
    {
        id: 'PACK_LEGENDS_WNBA',
        name: 'Legends & WNBA Super Pack',
        subtitle: '3 Cards · Guaranteed Diamond+ Icon or WNBA Superstar',
        priceVc: 3800,
        priceMtp: 5000,
        accent: '#f59e0b',
        eraFocus: 'MIXED',
        guaranteedMinTier: 'DIAMOND'
    }
];
var TRAINING_DRILLS = [
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
        durationSec: 120
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
        durationSec: 120
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
        durationSec: 120
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
        durationSec: 120
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
        durationSec: 120
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
        durationSec: 120
    }
];

});
// === MODULE: src/games/hoops-2k26/nba2k14/audio/Nba2k14Audio ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/audio/Nba2k14Audio", function(require, module, exports) {
// ============================================================================
// NBA 2K14 — Procedural Web Audio Engine (20-Track 2K Beats + Arena SFX)
// Zero external audio URLs; works 100% offline/hermetic.
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Nba2k14Audio", {
    enumerable: true,
    get: function() {
        return Nba2k14Audio;
    }
});
var _modesData = require("../data/modesData");
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
function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}
var Nba2k14AudioEngine = /*#__PURE__*/ function() {
    "use strict";
    function Nba2k14AudioEngine() {
        this.ctx = null;
        this.masterGain = null;
        this.beatsGain = null;
        this.sfxGain = null;
        this.crowdGain = null;
        this.trackIndex = 0;
        this.stepIndex = 0;
        this.stepTimer = null;
        this.playingBeats = false;
        this.disabledTrackIds = new Set();
        this.volumes = {
            master: 80,
            beats: 62,
            crowd: 75,
            sfx: 85,
            commentary: 75,
            muted: false
        };
        this.eqBars = Array(12).fill(0.15);
        this.listeners = new Set();
    }
    var _proto = Nba2k14AudioEngine.prototype;
    _proto.ensureContext = function ensureContext() {
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            var AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return null;
            this.ctx = new AudioCtx();
            this.masterGain = this.ctx.createGain();
            this.beatsGain = this.ctx.createGain();
            this.sfxGain = this.ctx.createGain();
            this.crowdGain = this.ctx.createGain();
            this.beatsGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.crowdGain.connect(this.masterGain);
            this.masterGain.connect(this.ctx.destination);
            this.applyVolumes();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(function() {});
        }
        return this.ctx;
    };
    _proto.unlock = function unlock() {
        this.ensureContext();
    };
    _proto.subscribe = function subscribe(fn) {
        var _this = this;
        this.listeners.add(fn);
        return function() {
            return _this.listeners.delete(fn);
        };
    };
    _proto.emit = function emit() {
        this.listeners.forEach(function(fn) {
            return fn();
        });
    };
    _proto.syncSettings = function syncSettings(audio, disabledIds) {
        this.volumes = _extends({}, audio);
        this.disabledTrackIds = new Set(disabledIds);
        this.applyVolumes();
        this.emit();
    };
    _proto.applyVolumes = function applyVolumes() {
        if (!this.ctx || !this.masterGain || !this.beatsGain || !this.sfxGain || !this.crowdGain) return;
        var now = this.ctx.currentTime;
        var m = this.volumes.muted ? 0 : this.volumes.master / 100 * 0.65;
        this.masterGain.gain.setTargetAtTime(m, now, 0.03);
        this.beatsGain.gain.setTargetAtTime(this.volumes.beats / 100 * 0.42, now, 0.03);
        this.sfxGain.gain.setTargetAtTime(this.volumes.sfx / 100 * 0.72, now, 0.03);
        this.crowdGain.gain.setTargetAtTime(this.volumes.crowd / 100 * 0.45, now, 0.03);
    };
    _proto.getCurrentTrack = function getCurrentTrack() {
        return _modesData.BEATS_2K14_TRACKLIST[this.trackIndex % _modesData.BEATS_2K14_TRACKLIST.length];
    };
    _proto.isBeatsPlaying = function isBeatsPlaying() {
        return this.playingBeats;
    };
    _proto.getEqBars = function getEqBars() {
        return this.eqBars;
    };
    _proto.startBeats = function startBeats() {
        var ctx = this.ensureContext();
        if (!ctx) return;
        if (this.playingBeats) return;
        this.playingBeats = true;
        this.restartStepLoop();
        this.emit();
    };
    _proto.stopBeats = function stopBeats() {
        this.playingBeats = false;
        if (this.stepTimer) {
            clearInterval(this.stepTimer);
            this.stepTimer = null;
        }
        this.eqBars = Array(12).fill(0.1);
        this.emit();
    };
    _proto.toggleBeats = function toggleBeats() {
        if (this.playingBeats) this.stopBeats();
        else this.startBeats();
    };
    _proto.playTrackById = function playTrackById(trackId) {
        var idx = _modesData.BEATS_2K14_TRACKLIST.findIndex(function(t) {
            return t.id === trackId;
        });
        if (idx >= 0) {
            this.trackIndex = idx;
            this.stepIndex = 0;
            this.playingBeats = true;
            this.ensureContext();
            this.restartStepLoop();
            this.emit();
        }
    };
    _proto.nextTrack = function nextTrack() {
        for(var i = 1; i <= _modesData.BEATS_2K14_TRACKLIST.length; i++){
            var candidate = (this.trackIndex + i) % _modesData.BEATS_2K14_TRACKLIST.length;
            if (!this.disabledTrackIds.has(_modesData.BEATS_2K14_TRACKLIST[candidate].id)) {
                this.trackIndex = candidate;
                break;
            }
        }
        this.stepIndex = 0;
        if (this.playingBeats) this.restartStepLoop();
        this.emit();
    };
    _proto.restartStepLoop = function restartStepLoop() {
        var _this = this;
        if (this.stepTimer) clearInterval(this.stepTimer);
        var track = this.getCurrentTrack();
        var stepMs = Math.max(95, Math.round(60 / track.bpm / 4 * 1000));
        this.stepTimer = setInterval(function() {
            return _this.triggerBeatStep();
        }, stepMs);
    };
    _proto.triggerBeatStep = function triggerBeatStep() {
        var _this = this;
        if (!this.playingBeats || !this.ctx || !this.beatsGain || this.volumes.muted) return;
        var track = this.getCurrentTrack();
        var s = this.stepIndex % 16;
        var bar = Math.floor(this.stepIndex / 16) % 4;
        var now = this.ctx.currentTime;
        // 808 Kick on hip-hop pattern
        var kickHits = track.style === 'trap' ? [
            0,
            6,
            10
        ] : track.style === 'rock_arena' ? [
            0,
            4,
            8,
            12
        ] : [
            0,
            3,
            8,
            10
        ];
        if (kickHits.includes(s)) {
            var osc = this.ctx.createOscillator();
            var g = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(118, now);
            osc.frequency.exponentialRampToValueAtTime(38, now + 0.14);
            g.gain.setValueAtTime(0.45, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.connect(g);
            g.connect(this.beatsGain);
            osc.start(now);
            osc.stop(now + 0.2);
        }
        // Crisp Snare / Clap on 4 & 12
        if (s === 4 || s === 12) {
            this.playNoiseBurst(this.beatsGain, 0.09, 1400, 0.22);
        }
        // Hi-Hat ticks
        if (s % 2 === 0 || track.style === 'trap' && (s === 7 || s === 15)) {
            this.playNoiseBurst(this.beatsGain, 0.03, 7200, 0.08);
        }
        // Sub-Bass & Arena Brass / Synth Stabs
        if (s === 0 || s === 6 || s === 10) {
            var deg = track.scale[(bar + (s === 10 ? 2 : 0)) % track.scale.length];
            var freq = midiToFreq(track.rootMidi - 12 + deg);
            var osc1 = this.ctx.createOscillator();
            var g1 = this.ctx.createGain();
            osc1.type = track.style === 'anthem' ? 'sawtooth' : 'triangle';
            var filt = this.ctx.createBiquadFilter();
            filt.type = 'lowpass';
            filt.frequency.value = track.style === 'anthem' ? 920 : 520;
            osc1.frequency.setValueAtTime(freq, now);
            g1.gain.setValueAtTime(0.16, now);
            g1.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
            osc1.connect(filt);
            filt.connect(g1);
            g1.connect(this.beatsGain);
            osc1.start(now);
            osc1.stop(now + 0.26);
        }
        // Top Melody / Brass Anthem Chord on bar downbeat
        if (s === 0 || s === 8) {
            var chordRoot = track.rootMidi + 12 + track.scale[bar % track.scale.length];
            [
                0,
                3,
                7
            ].forEach(function(iv) {
                if (!_this.ctx || !_this.beatsGain) return;
                var osc = _this.ctx.createOscillator();
                var g = _this.ctx.createGain();
                osc.type = track.style === 'synth_funk' ? 'sine' : 'sawtooth';
                var filt = _this.ctx.createBiquadFilter();
                filt.type = 'lowpass';
                filt.frequency.value = 1400;
                osc.frequency.setValueAtTime(midiToFreq(chordRoot + iv), now);
                g.gain.setValueAtTime(0.055, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
                osc.connect(filt);
                filt.connect(g);
                g.connect(_this.beatsGain);
                osc.start(now);
                osc.stop(now + 0.36);
            });
        }
        // Update visualizer EQ bars
        this.eqBars = this.eqBars.map(function(_, idx) {
            var pulse = kickHits.includes(s) && idx < 4 ? 0.92 : s === 4 || s === 12 ? 0.78 : 0.32;
            return Math.min(1, Math.max(0.12, pulse * (0.55 + Math.sin(_this.stepIndex * 0.9 + idx * 1.1) * 0.45)));
        });
        this.stepIndex += 1;
        // Auto-advance track every 16 bars (~30s)
        if (this.stepIndex >= 256) {
            this.nextTrack();
        }
    };
    _proto.playNoiseBurst = function playNoiseBurst(dest, duration, freq, gainAmt) {
        if (!this.ctx) return;
        var len = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
        var buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        var data = buf.getChannelData(0);
        for(var i = 0; i < len; i++){
            data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        }
        var src = this.ctx.createBufferSource();
        src.buffer = buf;
        var filt = this.ctx.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.value = freq;
        var g = this.ctx.createGain();
        g.gain.value = gainAmt;
        src.connect(filt);
        filt.connect(g);
        g.connect(dest);
        src.start();
    };
    // ==================== ON-COURT & UI SFX ====================
    _proto.playUiClick = function playUiClick(type) {
        if (type === void 0) type = 'select';
        var ctx = this.ensureContext();
        if (!ctx || !this.sfxGain || this.volumes.muted) return;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'triangle';
        var startF = type === 'select' ? 540 : type === 'back' ? 320 : 440;
        var endF = type === 'select' ? 780 : type === 'back' ? 210 : 500;
        osc.frequency.setValueAtTime(startF, now);
        osc.frequency.exponentialRampToValueAtTime(endF, now + 0.055);
        g.gain.setValueAtTime(type === 'hover' ? 0.07 : 0.14, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.07);
    };
    _proto.playDribble = function playDribble() {
        var ctx = this.ensureContext();
        if (!ctx || !this.sfxGain || this.volumes.muted) return;
        var now = ctx.currentTime;
        var jitter = 0.92 + Math.random() * 0.16;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(165 * jitter, now);
        osc.frequency.exponentialRampToValueAtTime(52 * jitter, now + 0.075);
        g.gain.setValueAtTime(0.28, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.1);
    };
    _proto.playSneakerSqueak = function playSneakerSqueak() {
        var ctx = this.ensureContext();
        if (!ctx || !this.sfxGain || this.volumes.muted) return;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sine';
        var base = 2600 + Math.random() * 900;
        osc.frequency.setValueAtTime(base, now);
        osc.frequency.linearRampToValueAtTime(base * 1.18, now + 0.04);
        osc.frequency.linearRampToValueAtTime(base * 0.9, now + 0.085);
        g.gain.setValueAtTime(0.065, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.095);
    };
    _proto.playSwish = function playSwish(chainNet) {
        var _this = this;
        if (chainNet === void 0) chainNet = false;
        var ctx = this.ensureContext();
        if (!ctx || !this.sfxGain || this.volumes.muted) return;
        if (chainNet) {
            // Metallic Blacktop chain-net rattle
            this.playNoiseBurst(this.sfxGain, 0.22, 4600, 0.28);
            var now = ctx.currentTime;
            [
                1840,
                2320,
                3110
            ].forEach(function(f, idx) {
                var osc = ctx.createOscillator();
                var g = ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(f, now + idx * 0.025);
                g.gain.setValueAtTime(0.07, now + idx * 0.025);
                g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.025 + 0.14);
                osc.connect(g);
                g.connect(_this.sfxGain);
                osc.start(now + idx * 0.025);
                osc.stop(now + idx * 0.025 + 0.15);
            });
        } else {
            this.playNoiseBurst(this.sfxGain, 0.19, 3200, 0.32);
        }
    };
    _proto.playRimClank = function playRimClank() {
        var _this = this;
        var ctx = this.ensureContext();
        if (!ctx || !this.sfxGain || this.volumes.muted) return;
        var now = ctx.currentTime;
        [
            320,
            485,
            710
        ].forEach(function(f) {
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now);
            osc.frequency.exponentialRampToValueAtTime(f * 0.88, now + 0.16);
            g.gain.setValueAtTime(0.14, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.connect(g);
            g.connect(_this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.19);
        });
    };
    _proto.playDunkBoom = function playDunkBoom() {
        var ctx = this.ensureContext();
        if (!ctx || !this.sfxGain || this.volumes.muted) return;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(34, now + 0.28);
        g.gain.setValueAtTime(0.6, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.35);
        this.playRimClank();
        this.playCrowdCheer(1.0);
    };
    _proto.playWhistle = function playWhistle() {
        var ctx = this.ensureContext();
        if (!ctx || !this.sfxGain || this.volumes.muted) return;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var lfo = ctx.createOscillator();
        var lfoGain = ctx.createGain();
        var g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 2820;
        lfo.frequency.value = 34;
        lfoGain.gain.value = 110;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        g.gain.setValueAtTime(0.18, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(now);
        lfo.start(now);
        osc.stop(now + 0.4);
        lfo.stop(now + 0.4);
    };
    _proto.playBuzzer = function playBuzzer() {
        var _this = this;
        var ctx = this.ensureContext();
        if (!ctx || !this.sfxGain || this.volumes.muted) return;
        var now = ctx.currentTime;
        [
            138,
            194,
            276
        ].forEach(function(f) {
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = f;
            g.gain.setValueAtTime(0.18, now);
            g.gain.setValueAtTime(0.18, now + 0.65);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
            osc.connect(g);
            g.connect(_this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.88);
        });
    };
    _proto.playCrowdCheer = function playCrowdCheer(intensity) {
        if (intensity === void 0) intensity = 0.7;
        var ctx = this.ensureContext();
        if (!ctx || !this.crowdGain || this.volumes.muted) return;
        var dur = 0.7 + intensity * 0.8;
        var len = Math.floor(ctx.sampleRate * dur);
        var buf = ctx.createBuffer(1, len, ctx.sampleRate);
        var data = buf.getChannelData(0);
        for(var i = 0; i < len; i++){
            var env = Math.sin(i / len * Math.PI);
            data[i] = (Math.random() * 2 - 1) * env;
        }
        var src = ctx.createBufferSource();
        src.buffer = buf;
        var filt = ctx.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.value = 950 + intensity * 450;
        filt.Q.value = 0.8;
        var g = ctx.createGain();
        g.gain.value = 0.22 * intensity;
        src.connect(filt);
        filt.connect(g);
        g.connect(this.crowdGain);
        src.start();
    };
    _proto.playArenaOrgan = function playArenaOrgan(kind) {
        var _this = this;
        var ctx = this.ensureContext();
        if (!ctx || !this.crowdGain || this.volumes.muted) return;
        var now = ctx.currentTime;
        var notes = kind === 'defense' ? [
            60,
            60,
            55
        ] : kind === 'three' ? [
            64,
            67,
            72
        ] : [
            60,
            64,
            67,
            72
        ];
        notes.forEach(function(m, i) {
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            osc.type = 'sawtooth';
            var filt = ctx.createBiquadFilter();
            filt.type = 'lowpass';
            filt.frequency.value = 1800;
            osc.frequency.value = midiToFreq(m);
            var t = now + i * 0.14;
            g.gain.setValueAtTime(0.11, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
            osc.connect(filt);
            filt.connect(g);
            g.connect(_this.crowdGain);
            osc.start(t);
            osc.stop(t + 0.18);
        });
    };
    return Nba2k14AudioEngine;
}();
var Nba2k14Audio = new Nba2k14AudioEngine();

});

})(window.ArcadeMod);
