(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/nba2k14/data/signatureSkills ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/data/signatureSkills", function(require, module, exports) {
// ============================================================================
// NBA 2K14 — Complete Signature Skills Database & Live Gameplay Math Engine
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
    get DIFFICULTY_SHOT_MOD () {
        return DIFFICULTY_SHOT_MOD;
    },
    get SIGNATURE_SKILLS () {
        return SIGNATURE_SKILLS;
    },
    get SIGNATURE_SKILL_MAP () {
        return SIGNATURE_SKILL_MAP;
    },
    get canGoCold () {
        return canGoCold;
    },
    get computeAnkleBreakerChance () {
        return computeAnkleBreakerChance;
    },
    get computeBlockReachBonus () {
        return computeBlockReachBonus;
    },
    get computeReboundScore () {
        return computeReboundScore;
    },
    get computeScreenKnockdownChance () {
        return computeScreenKnockdownChance;
    },
    get computeShotProbability () {
        return computeShotProbability;
    },
    get computeStealOutcome () {
        return computeStealOutcome;
    },
    get computeTeamAuraBonuses () {
        return computeTeamAuraBonuses;
    },
    get getEffectiveFastbreakSpeedBonus () {
        return getEffectiveFastbreakSpeedBonus;
    },
    get getHotThreshold () {
        return getHotThreshold;
    },
    get getSkillLevel () {
        return getSkillLevel;
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
var SIGNATURE_SKILLS = [
    {
        id: 'lebron_coast_to_coast',
        name: 'LeBron Coast to Coast',
        category: 'Athleticism',
        code: 'L2C',
        shortDesc: '+4 Speed/Quickness/Handle & lower contact penalty on fastbreaks.',
        costSp: [
            400,
            900,
            1800
        ]
    },
    {
        id: 'one_man_fastbreak',
        name: 'One-Man Fastbreak',
        category: 'Athleticism',
        code: 'OMF',
        shortDesc: '+6 Speed, Quickness & Ball-Handling during transition fastbreaks.',
        costSp: [
            350,
            800,
            1500
        ]
    },
    {
        id: 'posterizer',
        name: 'Posterizer',
        category: 'Scoring',
        code: 'PST',
        shortDesc: 'Boosts contact dunk success and triggers poster slam animations.',
        costSp: [
            350,
            850,
            1600
        ]
    },
    {
        id: 'highlight_film',
        name: 'Highlight Film',
        category: 'Athleticism',
        code: 'HLF',
        shortDesc: 'Flashy dunks boost teammate energy & arena crowd momentum.',
        costSp: [
            250,
            600,
            1100
        ]
    },
    {
        id: 'finisher',
        name: 'Finisher',
        category: 'Scoring',
        code: 'FIN',
        shortDesc: 'Reduces contact shot penalty on layups and dunks by up to 40%.',
        costSp: [
            350,
            800,
            1500
        ]
    },
    {
        id: 'acrobat',
        name: 'Acrobat',
        category: 'Scoring',
        code: 'ACR',
        shortDesc: 'Boosts Euro step, Hop step, Reverse & mid-air change-shot makes.',
        costSp: [
            300,
            700,
            1300
        ]
    },
    {
        id: 'shot_creator',
        name: 'Shot Creator',
        category: 'Scoring',
        code: 'SCR',
        shortDesc: 'Reduces off-the-dribble, stepback & pull-up jumper penalties.',
        costSp: [
            350,
            800,
            1500
        ]
    },
    {
        id: 'deadeye',
        name: 'Deadeye',
        category: 'Scoring',
        code: 'DED',
        shortDesc: 'Reduces late defensive closeout contest penalties on jump shots.',
        costSp: [
            400,
            900,
            1750
        ]
    },
    {
        id: 'catch_and_shoot',
        name: 'Catch & Shoot',
        category: 'Scoring',
        code: 'C&S',
        shortDesc: 'Boosts jumper rating for 1.0s immediately after catching a pass.',
        costSp: [
            300,
            700,
            1350
        ]
    },
    {
        id: 'corner_specialist',
        name: 'Corner Specialist',
        category: 'Scoring',
        code: 'CRN',
        shortDesc: 'Boosts 3-point accuracy from both left and right corners.',
        costSp: [
            250,
            600,
            1200
        ]
    },
    {
        id: 'post_proficiency',
        name: 'Post Proficiency',
        category: 'Scoring',
        code: 'PST+',
        shortDesc: 'Boosts Post Hook, Post Fadeaway, and Dropstep accuracy.',
        costSp: [
            300,
            700,
            1350
        ]
    },
    {
        id: 'microwave',
        name: 'Microwave',
        category: 'Scoring',
        code: 'MCW',
        shortDesc: 'Takes half as many made shots to become Hot / On Fire.',
        costSp: [
            300,
            650,
            1200
        ]
    },
    {
        id: 'heat_retention',
        name: 'Heat Retention',
        category: 'Scoring',
        code: 'HTR',
        shortDesc: 'Retains Hot streak status longer after misses or timeouts.',
        costSp: [
            250,
            600,
            1100
        ]
    },
    {
        id: 'closer',
        name: 'Closer',
        category: 'Scoring',
        code: 'CLS',
        shortDesc: 'Major offensive boost in the final 4 min of Q4/OT within 7 pts.',
        costSp: [
            400,
            900,
            1800
        ]
    },
    {
        id: 'anti_freeze',
        name: 'Anti-Freeze',
        category: 'Scoring',
        code: 'AFZ',
        shortDesc: 'Prevents the player from going Cold during shooting slumps.',
        costSp: [
            250,
            550,
            1000
        ]
    },
    {
        id: 'floor_general',
        name: 'Floor General',
        category: 'Playmaking',
        code: 'FLG',
        shortDesc: '+3 to +6 Offensive Awareness boost to all 4 teammates on court.',
        costSp: [
            350,
            800,
            1500
        ]
    },
    {
        id: 'dimer',
        name: 'Dimer',
        category: 'Playmaking',
        code: 'DIM',
        shortDesc: 'Boosts shot percentage of teammates receiving a pass from this player.',
        costSp: [
            350,
            850,
            1600
        ]
    },
    {
        id: 'alley_ooper',
        name: 'Alley-Ooper',
        category: 'Playmaking',
        code: 'OOP',
        shortDesc: 'Increases alley-oop lob pass accuracy and aerial finish rate.',
        costSp: [
            250,
            600,
            1150
        ]
    },
    {
        id: 'break_starter',
        name: 'Break Starter',
        category: 'Playmaking',
        code: 'BRK',
        shortDesc: 'Improves full-court outlet pass accuracy after defensive boards.',
        costSp: [
            250,
            550,
            1050
        ]
    },
    {
        id: 'flashy_passer',
        name: 'Flashy Passer',
        category: 'Playmaking',
        code: 'FLS',
        shortDesc: 'Reduces flashy pass turnover penalty by up to 60%.',
        costSp: [
            250,
            550,
            1050
        ]
    },
    {
        id: 'pick_and_roll_maestro',
        name: 'Pick & Roll Maestro',
        category: 'Playmaking',
        code: 'PNR',
        shortDesc: '+3 shooting & higher pass accuracy right after using a screen.',
        costSp: [
            300,
            750,
            1400
        ]
    },
    {
        id: 'ankle_breaker',
        name: 'Ankle Breaker',
        category: 'Playmaking',
        code: 'ANK',
        shortDesc: 'Increases probability of freezing/dropping defenders on crossovers.',
        costSp: [
            350,
            850,
            1650
        ]
    },
    {
        id: 'screen_outlet',
        name: 'Screen Outlet',
        category: 'Playmaking',
        code: 'SCO',
        shortDesc: '+4 shooting boost for the screener immediately after rolling/popping.',
        costSp: [
            250,
            600,
            1150
        ]
    },
    {
        id: 'post_playmaker',
        name: 'Post Playmaker',
        category: 'Playmaking',
        code: 'PPM',
        shortDesc: 'Boosts shooting of teammates receiving kick-out passes from the post.',
        costSp: [
            250,
            600,
            1150
        ]
    },
    {
        id: 'lockdown_defender',
        name: 'Lockdown Defender',
        category: 'Defense',
        code: 'LKD',
        shortDesc: 'Negates opponent offensive Signature Skills while guarding them.',
        costSp: [
            400,
            950,
            1850
        ]
    },
    {
        id: 'pick_pocket',
        name: 'Pick Pocket',
        category: 'Defense',
        code: 'PKP',
        shortDesc: 'Increases clean strip-steal chance while lowering reach-in foul rate.',
        costSp: [
            300,
            750,
            1450
        ]
    },
    {
        id: 'interceptor',
        name: 'Interceptor',
        category: 'Defense',
        code: 'INT',
        shortDesc: 'Increases passing-lane steal lunge range and interception rate.',
        costSp: [
            300,
            700,
            1350
        ]
    },
    {
        id: 'active_hands',
        name: 'Active Hands',
        category: 'Defense',
        code: 'ACH',
        shortDesc: 'Causes more loose-ball deflections when contesting drives & passes.',
        costSp: [
            250,
            600,
            1150
        ]
    },
    {
        id: 'eraser',
        name: 'Eraser',
        category: 'Defense',
        code: 'ERS',
        shortDesc: 'Boosts shot-blocking height/timing & drops shooter ratings after a block.',
        costSp: [
            350,
            800,
            1550
        ]
    },
    {
        id: 'chasedown_artist',
        name: 'Chasedown Artist',
        category: 'Defense',
        code: 'CDA',
        shortDesc: 'Burst of speed & block boost when chasing a fastbreak layup/dunk.',
        costSp: [
            300,
            750,
            1450
        ]
    },
    {
        id: 'charge_card',
        name: 'Charge Card',
        category: 'Defense',
        code: 'CHG',
        shortDesc: 'Increases probability of drawing offensive charging fouls.',
        costSp: [
            200,
            500,
            950
        ]
    },
    {
        id: 'pick_dodger',
        name: 'Pick Dodger',
        category: 'Defense',
        code: 'PKD',
        shortDesc: 'Counters Brick Wall and slips cleanly around offensive screens.',
        costSp: [
            250,
            600,
            1150
        ]
    },
    {
        id: 'brick_wall',
        name: 'Brick Wall',
        category: 'Hustle',
        code: 'BRW',
        shortDesc: 'Sets bone-crushing screens that knock defenders down & drain stamina.',
        costSp: [
            300,
            700,
            1350
        ]
    },
    {
        id: 'bruiser',
        name: 'Bruiser',
        category: 'Hustle',
        code: 'BRU',
        shortDesc: 'Drains opponent stamina rapidly on physical body contact.',
        costSp: [
            250,
            600,
            1200
        ]
    },
    {
        id: 'defensive_anchor',
        name: 'Defensive Anchor',
        category: 'Defense',
        code: 'DAN',
        shortDesc: '+3 to +6 Defensive Awareness boost to all 4 teammates on court.',
        costSp: [
            350,
            800,
            1550
        ]
    },
    {
        id: 'scrapper',
        name: 'Scrapper',
        category: 'Hustle',
        code: 'SCP',
        shortDesc: 'Boosts hustle diving for loose balls & offensive rebound battles.',
        costSp: [
            250,
            550,
            1050
        ]
    },
    {
        id: 'hustle_points',
        name: 'Hustle Points',
        category: 'Hustle',
        code: 'HSP',
        shortDesc: 'Boosts putback layups/dunks immediately after offensive rebounds.',
        costSp: [
            250,
            600,
            1150
        ]
    },
    {
        id: 'tenacious_rebounder',
        name: 'Tenacious Rebounder',
        category: 'Hustle',
        code: 'TRB',
        shortDesc: '+50% boost to winning boxout battles & snatching contested boards.',
        costSp: [
            350,
            800,
            1550
        ]
    }
];
var SIGNATURE_SKILL_MAP = SIGNATURE_SKILLS.reduce(function(acc, item) {
    acc[item.id] = item;
    return acc;
}, {});
function getSkillLevel(skills, id) {
    if (!skills) return 0;
    var found = skills.find(function(s) {
        return s.id === id;
    });
    return found ? found.level : 0;
}
var DIFFICULTY_SHOT_MOD = {
    Rookie: 0.12,
    Pro: 0.05,
    'All-Star': 0.0,
    Superstar: -0.055,
    'Hall of Fame': -0.1
};
function getHotThreshold(shooter) {
    return getSkillLevel(shooter.signatureSkills, 'microwave') > 0 ? 2 : 3;
}
function canGoCold(shooter) {
    return getSkillLevel(shooter.signatureSkills, 'anti_freeze') === 0;
}
function getEffectiveFastbreakSpeedBonus(player) {
    var c2c = getSkillLevel(player.signatureSkills, 'lebron_coast_to_coast');
    var omf = getSkillLevel(player.signatureSkills, 'one_man_fastbreak');
    return Math.max(c2c > 0 ? 3 + c2c : 0, omf > 0 ? 4 + omf : 0);
}
function computeTeamAuraBonuses(teamOnCourt) {
    var offMax = 0;
    var defMax = 0;
    for(var _iterator = _create_for_of_iterator_helper_loose(teamOnCourt), _step; !(_step = _iterator()).done;){
        var p = _step.value;
        var fg = getSkillLevel(p.signatureSkills, 'floor_general');
        var da = getSkillLevel(p.signatureSkills, 'defensive_anchor');
        if (fg > 0) offMax = Math.max(offMax, 2 + fg * 1.33);
        if (da > 0) defMax = Math.max(defMax, 2 + da * 1.33);
    }
    return {
        offAwarenessBonus: Math.round(offMax),
        defAwarenessBonus: Math.round(defMax)
    };
}
function computeShotProbability(ctx) {
    var _ctx_shooter_hotZones_ctx_zone;
    var triggered = [];
    var defenderLockdown = ctx.defender && ctx.contestRatio > 0.25 ? getSkillLevel(ctx.defender.signatureSkills, 'lockdown_defender') : 0;
    // Lockdown Defender negates offensive skills proportional to level
    var skillActive = function skillActive(id) {
        var lvl = getSkillLevel(ctx.shooter.signatureSkills, id);
        if (lvl === 0) return 0;
        if (defenderLockdown >= 3) {
            if (ctx.defender && !triggered.some(function(t) {
                return t.id === 'lockdown_defender';
            })) {
                triggered.push({
                    id: 'lockdown_defender',
                    level: 3,
                    ownerName: ctx.defender.name
                });
            }
            return 0;
        }
        if (defenderLockdown > 0 && lvl <= defenderLockdown) {
            if (ctx.defender && !triggered.some(function(t) {
                return t.id === 'lockdown_defender';
            })) {
                triggered.push({
                    id: 'lockdown_defender',
                    level: defenderLockdown,
                    ownerName: ctx.defender.name
                });
            }
            return 0;
        }
        return lvl;
    };
    // Base attribute by shot type
    var a = ctx.shooter.attrs;
    var baseAttr = a.midRange;
    var sliderVal = ctx.sliders.midRange;
    if (ctx.shotType === 'three') {
        baseAttr = a.threePt;
        sliderVal = ctx.sliders.threePt;
    } else if (ctx.shotType === 'close') {
        baseAttr = a.closeShot;
        sliderVal = ctx.sliders.closeShot;
    } else if (ctx.shotType === 'layup' || ctx.shotType === 'euro') {
        baseAttr = a.layup;
        sliderVal = ctx.sliders.layup;
    } else if (ctx.shotType === 'dunk') {
        baseAttr = Math.max(a.dunk, a.standingDunk);
        sliderVal = ctx.sliders.dunkInTraffic;
    } else if (ctx.shotType === 'post_fade') {
        baseAttr = a.postFade;
        sliderVal = ctx.sliders.midRange;
    } else if (ctx.shotType === 'post_hook') {
        baseAttr = a.postHook;
        sliderVal = ctx.sliders.closeShot;
    } else if (ctx.shotType === 'free_throw') {
        baseAttr = a.freeThrow;
        sliderVal = 55;
    }
    // Team Floor General aura
    if (ctx.teammatesOnCourt) {
        var aura = computeTeamAuraBonuses(ctx.teammatesOnCourt);
        baseAttr += aura.offAwarenessBonus * 0.45;
    }
    // Hot / Cold zone adjustment
    var zoneHeat = (_ctx_shooter_hotZones_ctx_zone = ctx.shooter.hotZones[ctx.zone]) != null ? _ctx_shooter_hotZones_ctx_zone : 0;
    baseAttr += zoneHeat * 4;
    // Apply Offensive Signature Skills
    var contestMultiplier = 1.0;
    var skillFlatBonus = 0;
    if (ctx.shotType === 'three' && (ctx.zone === 'three_l_corner' || ctx.zone === 'three_r_corner')) {
        var lvl = skillActive('corner_specialist');
        if (lvl) {
            baseAttr += 3 + lvl * 2;
            triggered.push({
                id: 'corner_specialist',
                level: lvl,
                ownerName: ctx.shooter.name
            });
        }
    }
    if (ctx.justCaughtPass && (ctx.shotType === 'three' || ctx.shotType === 'mid')) {
        var lvl1 = skillActive('catch_and_shoot');
        if (lvl1) {
            baseAttr += 3 + lvl1 * 1.8;
            triggered.push({
                id: 'catch_and_shoot',
                level: lvl1,
                ownerName: ctx.shooter.name
            });
        }
    }
    if (ctx.contestRatio > 0.28 && (ctx.shotType === 'three' || ctx.shotType === 'mid')) {
        var lvl2 = skillActive('deadeye');
        if (lvl2) {
            contestMultiplier *= 1 - 0.14 * lvl2;
            triggered.push({
                id: 'deadeye',
                level: lvl2,
                ownerName: ctx.shooter.name
            });
        }
    }
    if (ctx.offDribble && (ctx.shotType === 'three' || ctx.shotType === 'mid')) {
        var lvl3 = skillActive('shot_creator');
        if (lvl3) {
            skillFlatBonus += 0.03 * lvl3;
            triggered.push({
                id: 'shot_creator',
                level: lvl3,
                ownerName: ctx.shooter.name
            });
        }
    }
    if (ctx.shotType === 'dunk' && ctx.contestRatio > 0.25) {
        var lvl4 = skillActive('posterizer');
        if (lvl4) {
            contestMultiplier *= 1 - 0.16 * lvl4;
            skillFlatBonus += 0.04 * lvl4;
            triggered.push({
                id: 'posterizer',
                level: lvl4,
                ownerName: ctx.shooter.name
            });
        }
    }
    if ((ctx.shotType === 'layup' || ctx.shotType === 'dunk' || ctx.shotType === 'euro') && ctx.contestRatio > 0.2) {
        var lvl5 = skillActive('finisher');
        if (lvl5) {
            contestMultiplier *= 1 - 0.133 * lvl5; // up to 40%
            triggered.push({
                id: 'finisher',
                level: lvl5,
                ownerName: ctx.shooter.name
            });
        }
    }
    if (ctx.shotType === 'euro') {
        var lvl6 = skillActive('acrobat');
        if (lvl6) {
            skillFlatBonus += 0.045 * lvl6;
            triggered.push({
                id: 'acrobat',
                level: lvl6,
                ownerName: ctx.shooter.name
            });
        }
    }
    if (ctx.shotType === 'post_fade' || ctx.shotType === 'post_hook') {
        var lvl7 = skillActive('post_proficiency');
        if (lvl7) {
            baseAttr += 3 + lvl7 * 2;
            triggered.push({
                id: 'post_proficiency',
                level: lvl7,
                ownerName: ctx.shooter.name
            });
        }
    }
    if (ctx.isFastbreak) {
        var c2c = skillActive('lebron_coast_to_coast');
        if (c2c) {
            contestMultiplier *= 0.8;
            skillFlatBonus += 0.03 * c2c;
            triggered.push({
                id: 'lebron_coast_to_coast',
                level: c2c,
                ownerName: ctx.shooter.name
            });
        }
    }
    if (ctx.isClutchTime) {
        var cls = skillActive('closer');
        if (cls) {
            baseAttr += 4 + cls * 2.5;
            skillFlatBonus += 0.025 * cls;
            triggered.push({
                id: 'closer',
                level: cls,
                ownerName: ctx.shooter.name
            });
        }
    }
    if (ctx.usedScreenRecently) {
        var pnr = skillActive('pick_and_roll_maestro');
        if (pnr) {
            baseAttr += 2 + pnr;
            triggered.push({
                id: 'pick_and_roll_maestro',
                level: pnr,
                ownerName: ctx.shooter.name
            });
        }
    }
    if (ctx.isScreenerPop) {
        var sco = skillActive('screen_outlet');
        if (sco) {
            baseAttr += 2 + sco * 1.3;
            triggered.push({
                id: 'screen_outlet',
                level: sco,
                ownerName: ctx.shooter.name
            });
        }
    }
    if (ctx.isPutback) {
        var hsp = skillActive('hustle_points');
        if (hsp) {
            skillFlatBonus += 0.05 * hsp;
            triggered.push({
                id: 'hustle_points',
                level: hsp,
                ownerName: ctx.shooter.name
            });
        }
    }
    if (ctx.isAlleyOop) {
        var oop = skillActive('alley_ooper');
        if (oop) {
            skillFlatBonus += 0.06 * oop;
            triggered.push({
                id: 'alley_ooper',
                level: oop,
                ownerName: ctx.shooter.name
            });
        }
    }
    if (ctx.passerSkills && ctx.justCaughtPass) {
        var dimer = getSkillLevel(ctx.passerSkills, 'dimer');
        if (dimer) {
            skillFlatBonus += 0.03 * dimer;
            triggered.push({
                id: 'dimer',
                level: dimer,
                ownerName: 'Teammate'
            });
        }
        if (ctx.passFromPost) {
            var ppm = getSkillLevel(ctx.passerSkills, 'post_playmaker');
            if (ppm) {
                skillFlatBonus += 0.03 * ppm;
                triggered.push({
                    id: 'post_playmaker',
                    level: ppm,
                    ownerName: 'Teammate'
                });
            }
        }
    }
    // Release timing curve
    var absErr = Math.abs(ctx.releaseError);
    var releaseLabel = 'EXCELLENT';
    var timingMult = 1.0;
    if (ctx.realPlayerPctMode) {
        releaseLabel = 'EXCELLENT';
        timingMult = 1.0;
    } else if (absErr <= 0.048) {
        releaseLabel = 'EXCELLENT';
        timingMult = 1.34 + (ctx.noMeterBoost ? 0.08 : 0);
    } else if (absErr <= 0.13) {
        releaseLabel = ctx.releaseError < 0 ? 'SLIGHTLY EARLY' : 'SLIGHTLY LATE';
        timingMult = 1.02 - (absErr - 0.048) * 1.4;
    } else {
        releaseLabel = ctx.releaseError < 0 ? 'EARLY' : 'LATE';
        timingMult = Math.max(0.32, 0.72 - (absErr - 0.13) * 1.8);
    }
    // Base probability curve from attribute
    var normalizedAttr = Math.min(99, Math.max(25, baseAttr)) / 99;
    var shotBaseFloor = ctx.shotType === 'dunk' ? 0.76 : ctx.shotType === 'layup' || ctx.shotType === 'close' ? 0.56 : ctx.shotType === 'free_throw' ? 0.52 : ctx.shotType === 'three' ? 0.24 : 0.34;
    var shotBaseScale = ctx.shotType === 'dunk' ? 0.22 : ctx.shotType === 'layup' || ctx.shotType === 'close' ? 0.34 : ctx.shotType === 'free_throw' ? 0.44 : ctx.shotType === 'three' ? 0.32 : 0.34;
    var prob = (shotBaseFloor + normalizedAttr * shotBaseScale) * timingMult;
    // Contest penalty
    var effectiveContest = Math.min(1, Math.max(0, ctx.contestRatio)) * contestMultiplier;
    var contestPenalty = effectiveContest * (ctx.shotType === 'dunk' ? 0.26 : 0.42);
    prob -= contestPenalty;
    // Fatigue & Streak
    prob -= ctx.fatigueRatio * 0.12;
    var hotThresh = getHotThreshold(ctx.shooter);
    if (ctx.streak >= hotThresh) {
        prob += 0.085;
    } else if (ctx.streak <= -3 && canGoCold(ctx.shooter)) {
        prob -= 0.065;
    }
    // Slider + Difficulty + Skill Bonus
    prob += (sliderVal - 50) * 0.0045;
    prob += DIFFICULTY_SHOT_MOD[ctx.difficulty];
    prob += skillFlatBonus;
    // Excellent wide-open jumper reward
    if (!ctx.realPlayerPctMode && releaseLabel === 'EXCELLENT' && effectiveContest < 0.22 && baseAttr >= 65) {
        prob = Math.max(prob, 0.94);
    }
    prob = Math.min(0.99, Math.max(0.03, prob));
    // Shot Quality Grade (A+ wide open -> F smothered)
    var qualityGrade = 'B';
    var contestLabel = 'Open';
    if (effectiveContest < 0.12) {
        qualityGrade = releaseLabel === 'EXCELLENT' ? 'A+' : 'A';
        contestLabel = 'Wide Open';
    } else if (effectiveContest < 0.28) {
        qualityGrade = releaseLabel === 'EXCELLENT' ? 'A' : 'B+';
        contestLabel = 'Open';
    } else if (effectiveContest < 0.48) {
        qualityGrade = 'B';
        contestLabel = 'Lightly Contested';
    } else if (effectiveContest < 0.68) {
        qualityGrade = 'C';
        contestLabel = 'Contested';
    } else if (effectiveContest < 0.85) {
        qualityGrade = 'D';
        contestLabel = 'Heavily Contested';
    } else {
        qualityGrade = 'F';
        contestLabel = 'Smothered';
    }
    return {
        makeProbability: prob,
        releaseLabel: releaseLabel,
        qualityGrade: qualityGrade,
        contestLabel: contestLabel,
        triggeredSkills: triggered
    };
}
function computeAnkleBreakerChance(handler, defender, chainCount) {
    var ab = getSkillLevel(handler.signatureSkills, 'ankle_breaker');
    var lkd = getSkillLevel(defender.signatureSkills, 'lockdown_defender');
    var handleEdge = (handler.attrs.ballHandle - defender.attrs.onBallDefense) * 0.0035;
    var base = 0.08 + chainCount * 0.06 + ab * 0.095 - lkd * 0.065 + handleEdge;
    return Math.min(0.62, Math.max(0.02, base));
}
function computeStealOutcome(defender, handler, isExposed, stealSlider) {
    var pkp = getSkillLevel(defender.signatureSkills, 'pick_pocket');
    var ach = getSkillLevel(defender.signatureSkills, 'active_hands');
    var baseSteal = 0.12 + (defender.attrs.steal - handler.attrs.ballHandle) * 0.004 + (isExposed ? 0.14 : 0) + pkp * 0.065 + ach * 0.03 + (stealSlider - 50) * 0.003;
    var foulProb = Math.max(0.04, 0.22 - pkp * 0.045 - (isExposed ? 0.06 : 0));
    return {
        stealProb: Math.min(0.65, Math.max(0.04, baseSteal)),
        foulProb: foulProb
    };
}
function computeBlockReachBonus(defender, isFastbreakChase) {
    var eraser = getSkillLevel(defender.signatureSkills, 'eraser');
    var chase = isFastbreakChase ? getSkillLevel(defender.signatureSkills, 'chasedown_artist') : 0;
    return 1 + eraser * 0.12 + chase * 0.18;
}
function computeScreenKnockdownChance(screener, defender) {
    var bw = getSkillLevel(screener.signatureSkills, 'brick_wall');
    var pd = getSkillLevel(defender.signatureSkills, 'pick_dodger');
    return Math.min(0.7, Math.max(0.03, 0.1 + bw * 0.16 - pd * 0.12 + (screener.attrs.strength - defender.attrs.strength) * 0.004));
}
function computeReboundScore(player, isOffensive, distance) {
    var base = isOffensive ? player.attrs.offRebound : player.attrs.defRebound;
    var trb = getSkillLevel(player.signatureSkills, 'tenacious_rebounder');
    var scp = getSkillLevel(player.signatureSkills, 'scrapper');
    var skillMult = 1 + trb * 0.17 + (isOffensive ? scp * 0.08 : 0);
    var heightFactor = (player.heightCm - 175) * 0.35;
    return (base + heightFactor + player.attrs.vertical * 0.25) * skillMult - distance * 14;
}

});

})(window.ArcadeMod);
