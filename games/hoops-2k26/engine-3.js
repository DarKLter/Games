(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/engine/BasketballSimulation ===
ArcadeMod.define("src/games/hoops-2k26/engine/BasketballSimulation", function(require, module, exports) {
// ============================================================================
// PART 4 — 60 FPS DETERMINISTIC BASKETBALL PHYSICS & ProPLAY™ GAMEPLAY ENGINE
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
    get BasketballSimulation () {
        return BasketballSimulation;
    },
    get VISUAL_CUE_TARGETS () {
        return VISUAL_CUE_TARGETS;
    },
    get computeShotOutcome () {
        return computeShotOutcome;
    },
    get computeSkillDunkGreenWindow () {
        return computeSkillDunkGreenWindow;
    },
    get getHotZoneKeyForPosition () {
        return getHotZoneKeyForPosition;
    }
});
var _courtTypes = require("./courtTypes");
var _BadgeEngine = require("./BadgeEngine");
var _AISystem = require("./AISystem");
var _SimTacticsAndReplay = require("./SimTacticsAndReplay");
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
var VISUAL_CUE_TARGETS = {
    JUMP: 0.48,
    SET_POINT: 0.68,
    PUSH: 0.8,
    RELEASE: 0.9
};
var GRAVITY = -9.81;
function getHotZoneKeyForPosition(x, z, hoopX) {
    var dx = Math.abs(hoopX - x);
    var dist = Math.hypot(hoopX - x, z);
    var sideSign = hoopX > 0 ? 1 : -1;
    var relZ = z * sideSign; // +Z right side facing hoop
    if (dist <= 3.1 || dx <= 4.8 && Math.abs(z) <= 2.35) {
        return 'paint';
    }
    var isThree = dist >= _courtTypes.COURT_DIMS.THREE_PT_RADIUS - 0.12 || dx <= 4.3 && Math.abs(z) >= _courtTypes.COURT_DIMS.CORNER_THREE_Z - 0.12;
    if (isThree) {
        if (dx <= 4.5 && Math.abs(z) >= 5.6) {
            return relZ < 0 ? 'leftCorner3' : 'rightCorner3';
        }
        if (Math.abs(relZ) <= 2.75) {
            return 'topKey3';
        }
        return relZ < 0 ? 'leftWing3' : 'rightWing3';
    }
    if (Math.abs(relZ) <= 2.45) {
        return 'topMid';
    }
    return relZ < 0 ? 'leftMid' : 'rightMid';
}
function computeShotOutcome(p, emitBadge) {
    var ratingKey = p.isThree ? 'threePt' : p.distMeters <= 3.1 ? 'closeShot' : 'midRange';
    var effRating = (0, _BadgeEngine.getEffectiveAttribute)(p.shooter, p.shooterTakeover, ratingKey);
    var diff = _AISystem.DIFFICULTY_PROFILES[p.difficulty];
    var badgeRes = (0, _BadgeEngine.evaluateShootingBadges)({
        shooter: p.shooter,
        shooterSide: p.shooterSide,
        defender: p.defender,
        defenderSide: p.defenderSide,
        passer: p.passer,
        distMeters: p.distMeters,
        isCatchAndShoot: p.isCatchAndShoot,
        isOffDribble: p.isOffDribble,
        contestPct: p.contestPct
    }, emitBadge);
    // Contest % adjusted by Challenger & Deadeye / Mini Marksman
    var rawContest = Math.max(0, Math.min(100, p.contestPct + badgeRes.defenderContestBoost * 65));
    var effContest = Math.max(0, rawContest * (1 - badgeRes.contestReduction));
    var contestLabel = effContest < 8 ? 'Wide Open' : effContest < 22 ? 'Open' : effContest < 48 ? "Lightly Contested (" + Math.round(effContest) + "%)" : effContest < 75 ? "Contested (" + Math.round(effContest) + "%)" : "Smothered (" + Math.round(effContest) + "%)";
    // Hot / Cold zone bonus: +8% Hot, -6% Cold
    var hotZoneDelta = p.hotZoneState === 1 ? 0.08 : p.hotZoneState === -1 ? -0.06 : 0;
    // Stamina & 0-Adrenaline penalty
    var staminaPenalty = p.stamina < 0.35 ? (0.35 - p.stamina) * 0.28 : 0;
    var adrenalinePenalty = p.adrenalinePips <= 0 && p.isOffDribble ? 0.045 : 0;
    // Rhythm Shooting check (+12% Green Window when Timing + Tempo are clean)
    var rhythmGood = p.isRhythmShot && p.rhythmTempoError <= 0.14;
    var rhythmLabel = p.isRhythmShot ? p.rhythmTempoError <= 0.075 ? 'RHYTHM: PERFECT' : p.rhythmTempoError <= 0.15 ? 'RHYTHM: SLIGHTLY FAST' : 'RHYTHM: RUSHED' : null;
    // Base Green Window half-width (~0.045 .. 0.115)
    var greenHalf = 0.048 + (effRating - 60) / 39 * 0.036;
    greenHalf *= diff.userGreenWindowMul;
    greenHalf *= 1 + badgeRes.offenseBonus * 0.65 + hotZoneDelta;
    greenHalf *= Math.max(0.32, 1 - effContest / 100 * 0.72);
    greenHalf *= Math.max(0.65, 1 - staminaPenalty - adrenalinePenalty);
    // No-Meter +15% Green Window boost
    if (!p.shotMeterEnabled) {
        greenHalf *= 1.15;
    }
    // 2K26 Enhanced Rhythm Shooting +12% Green Window boost
    if (rhythmGood) {
        greenHalf *= 1.12;
    }
    // Profile scaling on green window
    if (p.timingProfile === 'HIGH_RISK') greenHalf *= 1.18;
    else if (p.timingProfile === 'GREEN_OR_MISS') greenHalf *= 1.06;
    else if (p.timingProfile === 'LOW_RISK') greenHalf *= 0.92;
    greenHalf = Math.max(0.018, Math.min(0.145, greenHalf));
    var signedErr = p.releaseValue - p.targetCenter;
    var absErr = Math.abs(signedErr);
    var isGreen = p.timingProfile !== 'REAL_PLAYER_PCT' && absErr <= greenHalf;
    // Base Make Probability (used for whites & Real Player %)
    var sliderDelta = (p.userShotSlider - 50) * 0.004;
    var baseProb = 0.24 + (effRating - 50) / 49 * 0.44 + badgeRes.offenseBonus * 0.45 + hotZoneDelta + sliderDelta - effContest / 100 * 0.56 - staminaPenalty - adrenalinePenalty;
    if (rhythmGood) baseProb += 0.08;
    if (p.shooterTakeover.ignited && p.shooterTakeover.archetype === 'SHARP') {
        baseProb += 0.14;
    }
    var makeProb = Math.max(0.02, Math.min(0.96, baseProb));
    var made = false;
    if (p.timingProfile === 'REAL_PLAYER_PCT') {
        var roll = p.randomRoll !== undefined ? p.randomRoll : Math.random();
        made = roll <= makeProb;
    } else if (isGreen) {
        makeProb = 1.0;
        made = true;
    } else if (p.timingProfile === 'GREEN_OR_MISS') {
        makeProb = 0;
        made = false;
    } else {
        var closeness = Math.max(0, 1 - absErr / Math.max(0.24, greenHalf * 3.2));
        var profileMul = p.timingProfile === 'HIGH_RISK' ? 0.35 : p.timingProfile === 'LOW_RISK' ? 0.98 : 0.72; // NORMAL
        makeProb = Math.max(0.02, Math.min(0.88, makeProb * closeness * profileMul));
        var roll1 = p.randomRoll !== undefined ? p.randomRoll : Math.random();
        made = roll1 <= makeProb;
    }
    var timingLabel = 'EXCELLENT';
    if (!isGreen) {
        if (p.timingProfile === 'REAL_PLAYER_PCT') {
            timingLabel = made ? 'REAL FG% MAKE' : 'REAL FG% MISS';
        } else if (absErr <= greenHalf * 1.9) {
            timingLabel = signedErr < 0 ? 'SLIGHTLY EARLY' : 'SLIGHTLY LATE';
        } else {
            timingLabel = signedErr < 0 ? 'EARLY' : 'LATE';
        }
    } else {
        timingLabel = 'GREEN · EXCELLENT';
    }
    return {
        isGreen: isGreen,
        made: made,
        makeProb: makeProb,
        timingError: signedErr,
        greenHalfWidth: greenHalf,
        timingLabel: timingLabel,
        rhythmLabel: rhythmLabel,
        contestPct: Math.round(effContest),
        contestLabel: contestLabel,
        triggeredBadges: badgeRes.triggeredBadges
    };
}
function computeSkillDunkGreenWindow(finisher, defender, dunkMeterBadgeBonus, defenderDeterBonus) {
    var dunkAttr = finisher.attributes.drivingDunk;
    var intDef = defender ? defender.attributes.interiorDef : 55;
    var half = 0.085 + (dunkAttr - 70) / 29 * 0.045 + dunkMeterBadgeBonus * 0.14;
    // Shrink vs strong paint protection & Paint Patroller
    half -= Math.max(0, (intDef - 65) / 34) * 0.042;
    half -= defenderDeterBonus * 0.12;
    return Math.max(0.032, Math.min(0.145, half));
}
var BasketballSimulation = /*#__PURE__*/ function() {
    "use strict";
    function BasketballSimulation(params) {
        var _params_hooks, _params_scenarioOverride;
        this.actors = [];
        this.actorMap = new Map();
        this.phase = 'JUMP_BALL';
        this.phaseTimer = 0;
        this.simTimeSec = 0;
        this.playClockSec = 0;
        this.backcourtClockSec = 0;
        this.crossedHalfCourt = false;
        this.halftimeSwapped = false;
        this.homeFoulsQtr = 0;
        this.awayFoulsQtr = 0;
        this.userTeamSide = 'HOME';
        this.controlledPlayerId = null;
        this.defensiveScheme = 'MAN_TO_MAN';
        this.iconPassingActive = false;
        // Input & Shot / Dunk Charging State
        this.input = {
            moveX: 0,
            moveZ: 0,
            sprint: false,
            shootHeld: false,
            quickProtectOrIntenseD: false,
            handsUp: false
        };
        this.prevShootHeld = false;
        this.lastShootTapTime = -10;
        this.lastBounceTapTime = -10;
        this.lastLobTapTime = -10;
        this.shotChargeActive = false;
        this.shotChargeProgress = 0;
        this.shotChargeKind = 'JUMPSHOT';
        this.shotChargeDuration = 0.62;
        this.shotChargeTargetCenter = 0.68;
        this.shotChargeGreenHalf = 0.065;
        this.shotChargeFinishMove = null;
        this.shotChargeHasDunkMeter = false;
        this.rhythmDownTime = 0;
        this.rhythmIsArmed = false;
        // Jump Ball Mini-Game State
        this.jumpBallProgress = 0;
        this.jumpBallTossElapsed = 0;
        this.jumpBallUserAttempted = false;
        this.jumpBallUserTimingErr = 1;
        // Ball Flights & Free Throws
        this.activeShot = null;
        this.activePass = null;
        this.activeFreeThrow = null;
        this.nextInboundSide = 'HOME';
        this.pendingCheckBall = false;
        // Feedback, Badges & Part 5 Battlefield HUD State
        this.badgeSeq = 0;
        this.badgeFeed = [];
        this.shotFeedback = null;
        this.winnerSide = null;
        this.dribbleAudioCooldown = 0;
        this.isOutdoorChainNet = false;
        this.homeTimeouts = 7;
        this.awayTimeouts = 7;
        this.timeoutHuddleSec = 0;
        this.teammateGrade = (0, _SimTacticsAndReplay.createInitialTeammateGrade)();
        this.splashBanner = null;
        this.splashSeq = 0;
        this.pickAndRoll = (0, _SimTacticsAndReplay.createIdlePickAndRoll)();
        this.activeLineupPreset = 'STARTERS';
        this.paused = false;
        this.replayBuffer = new _SimTacticsAndReplay.InstantReplayBuffer(600);
        this.matchShots = [];
        this.teamComp = {
            homePaintPts: 0,
            awayPaintPts: 0,
            homeFastBreakPts: 0,
            awayFastBreakPts: 0,
            homeSecondChancePts: 0,
            awaySecondChancePts: 0,
            homeBenchPts: 0,
            awayBenchPts: 0,
            homeTurnovers: 0,
            awayTurnovers: 0,
            homeReb: 0,
            awayReb: 0,
            homeBiggestLead: 0,
            awayBiggestLead: 0,
            leadChanges: 0,
            timesTied: 1
        };
        this.lastPossessionWasOffReb = false;
        this.possessionElapsedSec = 0;
        this.liveBackupBeforeReplay = null;
        this.scenarioOverride = null;
        this.awayTeam = params.awayTeam;
        this.homeTeam = params.homeTeam;
        this.config = _extends({}, params.config);
        this.settings = params.settings;
        this.hooks = (_params_hooks = params.hooks) != null ? _params_hooks : {};
        this.scenarioOverride = (_params_scenarioOverride = params.scenarioOverride) != null ? _params_scenarioOverride : null;
        this.isOutdoorChainNet = params.config.venue === 'BLACKTOP_CAGE' || params.config.venue === 'SKYLINE_PARK' || params.config.venue === 'RIVET_CITY' || params.config.venue === 'SUNSET_BEACH' || params.config.venue === 'OLD_TOWN';
        this.userTeamSide = params.config.sideControl === 'CPU_VS_CPU' ? null : params.config.sideControl;
        this.renderState = this.buildInitialRenderState();
        this.spawnPlayers();
        this.beginTipOffOrBlacktop();
        this.applyScenarioOverrides();
    }
    var _proto = BasketballSimulation.prototype;
    _proto.applyScenarioOverrides = function applyScenarioOverrides() {
        var ov = this.scenarioOverride;
        if (!ov) return;
        if (typeof ov.startQuarter === 'number') {
            this.renderState.quarter = ov.startQuarter;
        }
        if (typeof ov.startClockSec === 'number') {
            this.renderState.quarterClockSec = ov.startClockSec;
        }
        if (typeof ov.startHomeScore === 'number') {
            this.renderState.homeScore = ov.startHomeScore;
        }
        if (typeof ov.startAwayScore === 'number') {
            this.renderState.awayScore = ov.startAwayScore;
        }
        if (typeof ov.startQuarter === 'number' || typeof ov.startHomeScore === 'number' || typeof ov.startClockSec === 'number') {
            var _this_userTeamSide;
            var startSide = (_this_userTeamSide = this.userTeamSide) != null ? _this_userTeamSide : 'HOME';
            this.phase = 'LIVE';
            this.renderState.possession = startSide;
            var sideActors = this.getSideActors(startSide);
            if (sideActors.length > 0) {
                this.grantPossession(sideActors[0], false);
                this.controlledPlayerId = sideActors[0].render.id;
            }
            this.renderState.lastEventLabel = 'SCENARIO LIVE — CRUNCH TIME!';
        }
        if (ov.instantTakeover && this.userTeamSide) {
            var userActors = this.getSideActors(this.userTeamSide);
            if (userActors[0]) {
                (0, _BadgeEngine.addTakeoverProgress)(userActors[0].takeover, 100);
                (0, _BadgeEngine.igniteTakeover)(userActors[0].takeover);
                userActors[0].render.takeoverLevel = 1;
            }
        }
    };
    _proto.isBlacktopMode = function isBlacktopMode() {
        return this.config.playersPerSide < 5 || this.config.targetScore !== null;
    };
    _proto.syncSettings = function syncSettings(next) {
        this.settings = next;
        this.renderState.activePlay = next.visual.playVision;
    };
    _proto.setInput = function setInput(partial) {
        Object.assign(this.input, partial);
    };
    _proto.setDefensiveScheme = function setDefensiveScheme(scheme) {
        this.defensiveScheme = scheme;
        this.renderState.lastEventLabel = "DEFENSE: " + scheme.replace(/_/g, ' ');
    };
    _proto.setActivePlay = function setActivePlay(play) {
        this.renderState.activePlay = play;
        this.renderState.lastEventLabel = "PLAY: " + play.replace(/_/g, ' ');
    };
    _proto.setMarkedStar = function setMarkedStar(playerId, tag) {
        this.renderState.markedStar = {
            playerId: playerId,
            tag: tag
        };
        if (playerId) {
            var target = this.actorMap.get(playerId);
            if (target) {
                this.renderState.lastEventLabel = "\uD83C\uDFAF MARKED " + target.render.lastName.toUpperCase() + ": " + tag;
            }
        } else {
            this.renderState.lastEventLabel = 'DEFENSIVE MARK CLEARED';
        }
    };
    _proto.cycleMarkedStarTag = function cycleMarkedStarTag() {
        var order = [
            'DOUBLE',
            'DENY',
            'OVER',
            'PACK'
        ];
        var cur = order.indexOf(this.renderState.markedStar.tag);
        var next = order[(cur + 1) % order.length];
        this.renderState.markedStar.tag = next;
        return next;
    };
    _proto.setPaused = function setPaused(nextPaused) {
        if (nextPaused === this.paused) return;
        this.paused = nextPaused;
        if (!nextPaused) {
            this.restoreLiveFromReplay();
        }
    };
    _proto.isPaused = function isPaused() {
        return this.paused;
    };
    _proto.getReplayFrameCount = function getReplayFrameCount() {
        return this.replayBuffer.getFrameCount();
    };
    _proto.previewReplayFrame = function previewReplayFrame(frameIndex) {
        if (!this.liveBackupBeforeReplay) {
            this.liveBackupBeforeReplay = {
                ballX: this.renderState.ball.x,
                ballY: this.renderState.ball.y,
                ballZ: this.renderState.ball.z,
                ballInFlight: this.renderState.ball.inFlight,
                holderPlayerId: this.renderState.ball.holderPlayerId,
                players: this.renderState.players.map(function(pl) {
                    return {
                        id: pl.id,
                        x: pl.x,
                        y: pl.y,
                        z: pl.z,
                        facingRad: pl.facingRad,
                        animState: pl.animState,
                        animPhase: pl.animPhase,
                        shotProgress: pl.shotProgress,
                        hasBall: pl.hasBall
                    };
                })
            };
        }
        return this.replayBuffer.applyFrame(frameIndex, this.renderState);
    };
    _proto.restoreLiveFromReplay = function restoreLiveFromReplay() {
        var _this, _loop = function(i) {
            var snap = bak.players[i];
            var pl = _this.renderState.players.find(function(p) {
                return p.id === snap.id;
            });
            if (pl) {
                pl.x = snap.x;
                pl.y = snap.y;
                pl.z = snap.z;
                pl.facingRad = snap.facingRad;
                pl.animState = snap.animState;
                pl.animPhase = snap.animPhase;
                pl.shotProgress = snap.shotProgress;
                pl.hasBall = snap.hasBall;
            }
        };
        var bak = this.liveBackupBeforeReplay;
        if (!bak) return;
        this.renderState.ball.x = bak.ballX;
        this.renderState.ball.y = bak.ballY;
        this.renderState.ball.z = bak.ballZ;
        this.renderState.ball.inFlight = bak.ballInFlight;
        this.renderState.ball.holderPlayerId = bak.holderPlayerId;
        for(var i = 0; i < bak.players.length; i++)_this = this, _loop(i);
        this.liveBackupBeforeReplay = null;
    };
    _proto.pushSplashBanner = function pushSplashBanner(title, subtitle, tone, ttlSec) {
        if (tone === void 0) tone = 'GOLD';
        if (ttlSec === void 0) ttlSec = 2.0;
        this.splashSeq += 1;
        this.splashBanner = {
            id: this.splashSeq,
            title: title,
            subtitle: subtitle,
            tone: tone,
            ttlSec: ttlSec
        };
    };
    _proto.addGradeEvent = function addGradeEvent(label, delta) {
        (0, _SimTacticsAndReplay.recordTeammateGradeEvent)(this.teammateGrade, label, delta);
    };
    _proto.callPickAndRoll = function callPickAndRoll() {
        if (this.phase !== 'LIVE') return false;
        var handler = this.getBallHandler();
        if (!handler) return false;
        var mates = this.getSideActors(handler.render.teamSide).filter(function(a) {
            return a.render.id !== handler.render.id;
        });
        if (mates.length === 0) return false;
        // Prefer big men (C / PF) nearest to the ball-handler
        var best = mates[0];
        var bestScore = -9999;
        for(var i = 0; i < mates.length; i++){
            var m = mates[i];
            var dist = Math.hypot(m.render.x - handler.render.x, m.render.z - handler.render.z);
            var posBonus = m.render.position === 'C' ? 5 : m.render.position === 'PF' ? 4 : 0;
            var sc = posBonus - dist * 0.45;
            if (sc > bestScore) {
                bestScore = sc;
                best = m;
            }
        }
        var attackDirX = this.getAttackDirForSide(handler.render.teamSide);
        var angleDeg = this.pickAndRoll.active ? this.pickAndRoll.angleDeg : 45;
        var action = this.pickAndRoll.active ? this.pickAndRoll.action : 'ROLL';
        var pos = (0, _SimTacticsAndReplay.computeScreenPosition)(handler.render.x, handler.render.z, attackDirX, angleDeg);
        this.pickAndRoll = {
            active: true,
            screenerId: best.render.id,
            screenerName: best.render.lastName,
            handlerId: handler.render.id,
            angleDeg: angleDeg,
            action: action,
            screenX: pos.x,
            screenZ: pos.z,
            elapsedSec: 0,
            screenSet: false,
            screenAssistWindowSec: 0
        };
        this.renderState.activePlay = 'PICK_AND_ROLL';
        this.renderState.lastEventLabel = "SCREEN CALLED: " + best.render.lastName.toUpperCase() + " (" + angleDeg + "\xb0 " + action + ")";
        return true;
    };
    _proto.flipPickAndRollAngle = function flipPickAndRollAngle() {
        var nextAngle = this.pickAndRoll.angleDeg === 45 ? 180 : 45;
        this.pickAndRoll.angleDeg = nextAngle;
        var handler = this.getBallHandler();
        if (this.pickAndRoll.active && handler) {
            var dir = this.getAttackDirForSide(handler.render.teamSide);
            var pos = (0, _SimTacticsAndReplay.computeScreenPosition)(handler.render.x, handler.render.z, dir, nextAngle);
            this.pickAndRoll.screenX = pos.x;
            this.pickAndRoll.screenZ = pos.z;
            this.renderState.lastEventLabel = "SCREEN FLIPPED TO " + nextAngle + "\xb0 (" + this.pickAndRoll.action + ")";
        }
        return nextAngle;
    };
    _proto.togglePickAndRollAction = function togglePickAndRollAction() {
        var nextAction = this.pickAndRoll.action === 'ROLL' ? 'FADE' : 'ROLL';
        this.pickAndRoll.action = nextAction;
        if (this.pickAndRoll.active) {
            this.renderState.lastEventLabel = "PICK & " + nextAction + " (" + this.pickAndRoll.angleDeg + "\xb0)";
        }
        return nextAction;
    };
    _proto.cancelPickAndRoll = function cancelPickAndRoll() {
        this.pickAndRoll.active = false;
        this.pickAndRoll.screenSet = false;
    };
    _proto.callTimeout = function callTimeout(sideOverride) {
        var _ref;
        var side = (_ref = sideOverride != null ? sideOverride : this.userTeamSide) != null ? _ref : this.renderState.possession;
        if (side === 'HOME') {
            if (this.homeTimeouts <= 0) return false;
            this.homeTimeouts -= 1;
        } else {
            if (this.awayTimeouts <= 0) return false;
            this.awayTimeouts -= 1;
        }
        // Restore stamina across both benches during 3-second tactical huddle
        for(var i = 0; i < this.actors.length; i++){
            this.actors[i].render.stamina = Math.min(1.0, this.actors[i].render.stamina + 0.38);
            this.actors[i].render.adrenalinePips = 3;
        }
        this.timeoutHuddleSec = 3.0;
        this.shotChargeActive = false;
        this.activePass = null;
        this.activeShot = null;
        this.cancelPickAndRoll();
        var abbr = side === 'HOME' ? this.homeTeam.abbr : this.awayTeam.abbr;
        this.renderState.lastEventLabel = "TIMEOUT " + abbr + " \xb7 STAMINA RESTORED!";
        this.pushSplashBanner("TIMEOUT \xb7 " + abbr, '3-SECOND QUICK HUDDLE · STAMINA RESTORED', 'CYAN', 2.8);
        this.hooks.onWhistle == null ? void 0 : this.hooks.onWhistle.call(this.hooks);
        this.hooks.onAnnounce == null ? void 0 : this.hooks.onAnnounce.call(this.hooks, "Timeout called by " + abbr + ". Players catch their breath.");
        return true;
    };
    _proto.applyLineupPreset = function applyLineupPreset(preset, sideOverride) {
        var _ref;
        var side = (_ref = sideOverride != null ? sideOverride : this.userTeamSide) != null ? _ref : 'HOME';
        var team = side === 'HOME' ? this.homeTeam : this.awayTeam;
        var actors = this.getSideActors(side);
        var selected = (0, _SimTacticsAndReplay.selectLineupProfiles)(team.roster, preset, actors.length);
        if (selected.length === 0) return false;
        for(var i = 0; i < actors.length; i++){
            var _parts_;
            var actor = actors[i];
            var nextProf = selected[i];
            if (!nextProf) continue;
            var changed = actor.profile.id !== nextProf.id;
            actor.profile = nextProf;
            var parts = nextProf.name.trim().split(/\s+/);
            actor.render.name = nextProf.name;
            actor.render.lastName = (_parts_ = parts[parts.length - 1]) != null ? _parts_ : nextProf.name;
            actor.render.jerseyNumber = nextProf.jerseyNumber;
            actor.render.position = nextProf.position;
            actor.render.heightInches = nextProf.heightInches;
            actor.render.weightLbs = nextProf.weightLbs;
            actor.render.wingspanInches = nextProf.wingspanInches;
            actor.render.hotZones = nextProf.hotZones;
            actor.boxScore.name = nextProf.name;
            actor.boxScore.jersey = nextProf.jerseyNumber;
            actor.boxScore.position = nextProf.position;
            if (changed) {
                actor.render.stamina = Math.max(actor.render.stamina, 0.94);
                actor.takeover = (0, _BadgeEngine.createTakeoverState)(nextProf);
            }
        }
        this.activeLineupPreset = preset;
        this.renderState.lastEventLabel = "LINEUP SUB: " + preset + " UNIT ON FLOOR";
        return true;
    };
    // ==========================================================================
    // INITIALIZATION & ROSTER SPAWNING
    // ==========================================================================
    _proto.buildInitialRenderState = function buildInitialRenderState() {
        var qSec = this.config.quarterLengthMin * 60;
        return {
            awayAbbr: this.awayTeam.abbr,
            homeAbbr: this.homeTeam.abbr,
            awayScore: 0,
            homeScore: 0,
            quarter: 1,
            quarterClockSec: qSec,
            shotClockSec: 24,
            possession: 'HOME',
            attackDirX: 1,
            players: [],
            ball: {
                x: 0,
                y: 1.35,
                z: 0,
                vx: 0,
                vy: 0,
                vz: 0,
                spinX: 0,
                spinZ: 0,
                holderPlayerId: null,
                dribbleHand: 'right',
                inFlight: false,
                isGreenShot: false
            },
            hoops: {
                leftRimFlex: 0,
                rightRimFlex: 0,
                leftNetRipple: 0,
                rightNetRipple: 0,
                leftNetTime: 0,
                rightNetTime: 0,
                buzzerLit: false
            },
            activePlay: this.settings.visual.playVision,
            markedStar: {
                playerId: null,
                tag: 'DOUBLE'
            },
            crowdExcitement: 0.35,
            cameraShake: 0,
            jumbotronBanner: this.awayTeam.abbr + " AT " + this.homeTeam.abbr + " \xb7 TIP-OFF",
            lastEventLabel: 'CENTER COURT JUMP BALL'
        };
    };
    _proto.spawnPlayers = function spawnPlayers() {
        var _this = this;
        this.actors = [];
        this.actorMap.clear();
        var count = Math.max(1, Math.min(5, this.config.playersPerSide));
        var addSide = function addSide(team, side, slotOffset) {
            var starters = team.roster.slice(0, count);
            for(var i = 0; i < starters.length; i++){
                var _parts_;
                var prof = starters[i];
                var parts = prof.name.trim().split(/\s+/);
                var lastName = (_parts_ = parts[parts.length - 1]) != null ? _parts_ : prof.name;
                var render = {
                    id: side.toLowerCase() + "_" + i + "_" + prof.id,
                    slotIndex: slotOffset + i,
                    teamSide: side,
                    name: prof.name,
                    lastName: lastName,
                    jerseyNumber: prof.jerseyNumber,
                    position: prof.position,
                    heightInches: prof.heightInches,
                    weightLbs: prof.weightLbs,
                    wingspanInches: prof.wingspanInches,
                    appearance: prof.appearance,
                    hotZones: prof.hotZones,
                    x: side === 'HOME' ? -2.2 - i * 1.1 : 2.2 + i * 1.1,
                    y: 0,
                    z: (i - 2) * 1.5,
                    facingRad: side === 'HOME' ? 0 : Math.PI,
                    speed: 0,
                    animState: 'IDLE',
                    animPhase: i * 0.7,
                    shotProgress: 0,
                    hasBall: false,
                    isUserControlled: false,
                    stamina: 1.0,
                    adrenalinePips: 3,
                    takeoverLevel: 0,
                    shotQuality2K14: 'NONE',
                    guardTargetId: null,
                    visible: true
                };
                var actor = {
                    render: render,
                    profile: prof,
                    takeover: (0, _BadgeEngine.createTakeoverState)(prof),
                    teamSlot: i,
                    vx: 0,
                    vz: 0,
                    actionTimer: 0,
                    stunTimer: 0,
                    dribbleCooldown: 0,
                    stealCooldown: 0,
                    blockCooldown: 0,
                    jumpRecoveryTimer: 0,
                    lastCatchTime: -10,
                    lastPasserId: null,
                    paintThreeSecTimer: 0,
                    jumpCountInPaint: 0,
                    aiThinkTimer: 0.25 + i * 0.08,
                    boxScore: {
                        playerId: render.id,
                        name: prof.name,
                        teamSide: side,
                        jersey: prof.jerseyNumber,
                        position: prof.position,
                        pts: 0,
                        reb: 0,
                        ast: 0,
                        stl: 0,
                        blk: 0,
                        turnovers: 0,
                        fgm: 0,
                        fga: 0,
                        tpm: 0,
                        tpa: 0,
                        ftm: 0,
                        fta: 0,
                        fouls: 0,
                        plusMinus: 0,
                        minutesSec: 0,
                        greens: 0,
                        greenThrees: 0
                    }
                };
                _this.actors.push(actor);
                _this.actorMap.set(render.id, actor);
            }
        };
        addSide(this.homeTeam, 'HOME', 0);
        addSide(this.awayTeam, 'AWAY', 5);
        this.renderState.players = this.actors.map(function(a) {
            return a.render;
        });
        // Pair defensive matchups 1-to-1 and mark opponent's highest OVR star
        var homeActors = this.getSideActors('HOME');
        var awayActors = this.getSideActors('AWAY');
        for(var i = 0; i < homeActors.length; i++){
            if (awayActors[i]) {
                homeActors[i].render.guardTargetId = awayActors[i].render.id;
                awayActors[i].render.guardTargetId = homeActors[i].render.id;
            }
        }
        var oppSide = this.userTeamSide === 'AWAY' ? 'HOME' : 'AWAY';
        var oppActors = this.getSideActors(oppSide);
        var star = oppActors[0];
        for(var i1 = 1; i1 < oppActors.length; i1++){
            if (oppActors[i1].profile.ovr > star.profile.ovr) star = oppActors[i1];
        }
        if (star) {
            this.renderState.markedStar = {
                playerId: star.render.id,
                tag: 'DOUBLE'
            };
        }
        this.selectUserControlledPlayer(this.userTeamSide === 'AWAY' ? awayActors[0] : homeActors[0]);
    };
    _proto.getSideActors = function getSideActors(side) {
        return this.actors.filter(function(a) {
            return a.render.teamSide === side;
        });
    };
    _proto.getAttackDirForSide = function getAttackDirForSide(side) {
        if (this.isBlacktopMode()) {
            return 1; // Half-court streetball always attacks +X hoop
        }
        var baseDir = side === 'HOME' ? 1 : -1;
        return this.halftimeSwapped ? baseDir === 1 ? -1 : 1 : baseDir;
    };
    _proto.selectUserControlledPlayer = function selectUserControlledPlayer(actor) {
        for(var i = 0; i < this.actors.length; i++){
            this.actors[i].render.isUserControlled = false;
        }
        if (!this.userTeamSide || !actor || actor.render.teamSide !== this.userTeamSide) {
            this.controlledPlayerId = null;
            return;
        }
        actor.render.isUserControlled = true;
        this.controlledPlayerId = actor.render.id;
    };
    _proto.getControlledActor = function getControlledActor() {
        var _this_actorMap_get;
        if (!this.controlledPlayerId) return null;
        return (_this_actorMap_get = this.actorMap.get(this.controlledPlayerId)) != null ? _this_actorMap_get : null;
    };
    _proto.getBallHandler = function getBallHandler() {
        var _this_actorMap_get;
        var id = this.renderState.ball.holderPlayerId;
        if (!id) return null;
        return (_this_actorMap_get = this.actorMap.get(id)) != null ? _this_actorMap_get : null;
    };
    _proto.emitBadge = function emitBadge(player, teamSide, badgeId, tier) {
        // Deduplicate identical badge pop-ups within 0.6s
        var existing = this.badgeFeed.find(function(b) {
            return b.playerId === player.id && b.badgeId === badgeId && b.ttlSec > 2.2;
        });
        if (existing) return;
        var ev = (0, _BadgeEngine.createBadgeTriggerEvent)(player, teamSide, badgeId, tier, ++this.badgeSeq);
        this.badgeFeed = [].concat([
            ev
        ], this.badgeFeed).slice(0, 6);
    };
    // ==========================================================================
    // OPENING JUMP BALL TIP-OFF & BLACKTOP CHECK-BALL
    // ==========================================================================
    _proto.beginTipOffOrBlacktop = function beginTipOffOrBlacktop() {
        if (this.isBlacktopMode()) {
            this.startCheckBall('HOME', 'CHECK BALL · STREETBALL TIP');
            return;
        }
        this.phase = 'JUMP_BALL';
        this.jumpBallProgress = 0;
        this.jumpBallTossElapsed = 0;
        this.jumpBallUserAttempted = false;
        this.jumpBallUserTimingErr = 1;
        this.activeShot = null;
        this.activePass = null;
        this.renderState.ball.holderPlayerId = null;
        this.renderState.ball.inFlight = true;
        this.renderState.ball.x = 0;
        this.renderState.ball.y = 1.4;
        this.renderState.ball.z = 0;
        // Position Centers at center circle, guards & wings around circle
        var home = this.getSideActors('HOME');
        var away = this.getSideActors('AWAY');
        var homeCenter = home[home.length - 1];
        var awayCenter = away[away.length - 1];
        for(var i = 0; i < home.length; i++){
            var a = home[i];
            if (a === homeCenter) {
                a.render.x = -0.85;
                a.render.z = 0;
                a.render.facingRad = 0;
            } else {
                var ang = (i - 1.5) * 0.65;
                a.render.x = -2.8 - Math.abs(Math.sin(ang)) * 1.1;
                a.render.z = Math.sin(ang) * 3.1;
                a.render.facingRad = 0;
            }
            a.render.animState = 'IDLE';
            a.render.hasBall = false;
        }
        for(var i1 = 0; i1 < away.length; i1++){
            var a1 = away[i1];
            if (a1 === awayCenter) {
                a1.render.x = 0.85;
                a1.render.z = 0;
                a1.render.facingRad = Math.PI;
            } else {
                var ang1 = (i1 - 1.5) * 0.65;
                a1.render.x = 2.8 + Math.abs(Math.sin(ang1)) * 1.1;
                a1.render.z = Math.sin(ang1) * 3.1;
                a1.render.facingRad = Math.PI;
            }
            a1.render.animState = 'IDLE';
            a1.render.hasBall = false;
        }
        if (this.userTeamSide === 'HOME' && homeCenter) {
            this.selectUserControlledPlayer(homeCenter);
        } else if (this.userTeamSide === 'AWAY' && awayCenter) {
            this.selectUserControlledPlayer(awayCenter);
        }
        this.renderState.lastEventLabel = 'TIP-OFF! TAP [SPACE] AT PEAK!';
        this.pushSplashBanner('TIP-OFF', this.awayTeam.abbr + " AT " + this.homeTeam.abbr, 'GOLD', 2.0);
        this.hooks.onWhistle == null ? void 0 : this.hooks.onWhistle.call(this.hooks);
        this.hooks.onAnnounce == null ? void 0 : this.hooks.onAnnounce.call(this.hooks, 'Welcome to tip-off! Tap shoot at the peak for opening possession.');
    };
    _proto.triggerJumpBallAttempt = function triggerJumpBallAttempt() {
        if (this.phase !== 'JUMP_BALL' || this.jumpBallUserAttempted) return;
        this.jumpBallUserAttempted = true;
        this.jumpBallUserTimingErr = Math.abs(this.jumpBallProgress - 0.84);
        var ctrl = this.getControlledActor();
        if (ctrl) {
            ctrl.render.animState = 'JUMP_BLOCK';
            ctrl.render.y = 0.72;
        }
        this.resolveJumpBall();
    };
    _proto.resolveJumpBall = function resolveJumpBall() {
        var _ref, _ref1, _ref2, _ref3;
        var home = this.getSideActors('HOME');
        var away = this.getSideActors('AWAY');
        var hC = home[home.length - 1];
        var aC = away[away.length - 1];
        var hVert = ((_ref = hC == null ? void 0 : hC.profile.attributes.vertical) != null ? _ref : 75) + ((_ref1 = hC == null ? void 0 : hC.profile.heightInches) != null ? _ref1 : 82);
        var aVert = ((_ref2 = aC == null ? void 0 : aC.profile.attributes.vertical) != null ? _ref2 : 75) + ((_ref3 = aC == null ? void 0 : aC.profile.heightInches) != null ? _ref3 : 82);
        var winner = hVert >= aVert ? 'HOME' : 'AWAY';
        if (this.userTeamSide) {
            var userBonus = this.jumpBallUserAttempted ? Math.max(-25, 34 - this.jumpBallUserTimingErr * 120) : -18;
            var homeScore = hVert + (this.userTeamSide === 'HOME' ? userBonus : 0);
            var awayScore = aVert + (this.userTeamSide === 'AWAY' ? userBonus : 0);
            winner = homeScore >= awayScore ? 'HOME' : 'AWAY';
        }
        var pg = winner === 'HOME' ? home[0] : away[0];
        this.grantPossession(pg, true);
        this.phase = 'LIVE';
        this.renderState.lastEventLabel = winner === 'HOME' ? "" + this.homeTeam.abbr + " WINS TIP-OFF!" : "" + this.awayTeam.abbr + " WINS TIP-OFF!";
        this.hooks.onCrowdRoar == null ? void 0 : this.hooks.onCrowdRoar.call(this.hooks, 0.65);
    };
    // ==========================================================================
    // PUBLIC PLAYER ACTION TRIGGERS (KEYBOARD / MOUSE PRO-STICK / GAMEPAD / TOUCH)
    // ==========================================================================
    _proto.triggerPass = function triggerPass(kind) {
        if (kind === void 0) kind = 'CHEST';
        if (this.phase !== 'LIVE') return;
        var handler = this.getBallHandler();
        if (!handler || !handler.render.isUserControlled) {
            // On defense, pressing J attempts a Glove Strip or switches defender
            this.triggerStealAttempt();
            return;
        }
        if (this.shotChargeActive || this.activePass || this.activeShot) return;
        // Double-tap K -> Wrap Pass
        var resolvedKind = kind;
        if (kind === 'BOUNCE') {
            if (this.simTimeSec - this.lastBounceTapTime < 0.34) {
                resolvedKind = 'WRAP';
            }
            this.lastBounceTapTime = this.simTimeSec;
        }
        var target = this.findBestPassTarget(handler);
        if (target) {
            this.executePass(handler, target, resolvedKind);
        }
    };
    _proto.toggleIconPassing = function toggleIconPassing() {
        if (this.phase !== 'LIVE') return;
        var handler = this.getBallHandler();
        if (handler && handler.render.isUserControlled) {
            this.iconPassingActive = !this.iconPassingActive;
        } else {
            // On defense, Tab switches to the defender closest to the ball!
            this.switchToNearestDefender();
        }
    };
    _proto.triggerIconPass = function triggerIconPass(slotNumber1To5) {
        if (this.phase !== 'LIVE') return;
        var handler = this.getBallHandler();
        if (!handler || !handler.render.isUserControlled) return;
        var mates = this.getSideActors(handler.render.teamSide);
        var target = mates[slotNumber1To5 - 1];
        this.iconPassingActive = false;
        if (target && target.render.id !== handler.render.id) {
            this.executePass(handler, target, 'CHEST');
        }
    };
    _proto.triggerLobOrBlock = function triggerLobOrBlock() {
        // Handles `L` key: Double-tap on offense -> Alley-Oop; on defense -> Block / Rebound Snag;
        // Also handles Jump Ball & Free Throw release if needed
        if (this.phase === 'JUMP_BALL') {
            this.triggerJumpBallAttempt();
            return;
        }
        if (this.phase !== 'LIVE') return;
        var handler = this.getBallHandler();
        if (handler && handler.render.isUserControlled) {
            if (this.simTimeSec - this.lastLobTapTime < 0.42) {
                this.triggerAlleyOop();
            } else {
                this.lastLobTapTime = this.simTimeSec;
                this.renderState.lastEventLabel = 'TAP [L] AGAIN TO THROW ALLEY-OOP!';
            }
            return;
        }
        // Rebound snag if ball is loose in flight
        if (this.activeShot && this.activeShot.isReboundLive) {
            this.attemptUserReboundSnag();
            return;
        }
        // Jump / Chase-down block on defense
        this.triggerBlockAttempt();
    };
    _proto.triggerAlleyOop = function triggerAlleyOop() {
        if (this.phase !== 'LIVE') return;
        var handler = this.getBallHandler();
        if (!handler || !handler.render.isUserControlled) return;
        if (this.activePass || this.activeShot) return;
        var hoopX = this.getAttackDirForSide(handler.render.teamSide) * _courtTypes.COURT_DIMS.RIM_X;
        var mates = this.getSideActors(handler.render.teamSide).filter(function(m) {
            return m.render.id !== handler.render.id;
        });
        if (mates.length === 0) return;
        // Pick best rim-runner / dunker closest to the hoop
        var best = mates[0];
        var bestScore = -999;
        for(var i = 0; i < mates.length; i++){
            var m = mates[i];
            var d = Math.hypot(hoopX - m.render.x, m.render.z);
            var score = m.profile.attributes.drivingDunk * 1.2 + m.profile.attributes.vertical * 0.5 - d * 9;
            if (score > bestScore) {
                bestScore = score;
                best = m;
            }
        }
        this.executePass(handler, best, 'ALLEY_OOP');
    };
    _proto.submitAlleyOopFinishKey = function submitAlleyOopFinishKey(key) {
        if (!this.activePass || this.activePass.kind !== 'ALLEY_OOP') return;
        if (this.activePass.alleyOopPressed) return;
        this.activePass.alleyOopPressed = true;
        var matched = key === 'ANY' || key === this.activePass.alleyOopKey;
        var timingOk = this.activePass.elapsed >= this.activePass.duration * 0.22;
        this.activePass.alleyOopSucceeded = matched && timingOk;
        if (this.activePass.alleyOopSucceeded) {
            this.renderState.lastEventLabel = 'ALLEY-OOP TIMING: PERFECT!';
        } else {
            this.renderState.lastEventLabel = 'ALLEY-OOP MISSED PROMPT!';
        }
    };
    _proto.triggerDribbleMove = function triggerDribbleMove(move) {
        if (this.phase !== 'LIVE') return;
        var handler = this.getBallHandler();
        if (!handler || !handler.render.isUserControlled) return;
        this.performDribbleMove(handler, move);
    };
    _proto.triggerTakeoverIgnition = function triggerTakeoverIgnition() {
        var ctrl = this.getControlledActor();
        if (!ctrl) return false;
        var ok = (0, _BadgeEngine.igniteTakeover)(ctrl.takeover);
        if (ok) {
            ctrl.render.takeoverLevel = 1;
            this.renderState.crowdExcitement = Math.min(1, this.renderState.crowdExcitement + 0.35);
            this.renderState.lastEventLabel = "\uD83D\uDD25 " + ctrl.render.lastName.toUpperCase() + " IGNITED TAKEOVER!";
            this.pushSplashBanner('TAKEOVER IGNITED!', ctrl.profile.name.toUpperCase() + " \xb7 " + ctrl.takeover.perkLabel, 'FIRE', 2.4);
            this.addGradeEvent('+Takeover Ignited', 6);
            this.hooks.onCrowdRoar == null ? void 0 : this.hooks.onCrowdRoar.call(this.hooks, 0.95);
            this.hooks.onAnnounce == null ? void 0 : this.hooks.onAnnounce.call(this.hooks, "" + ctrl.profile.name + " has ignited Takeover!");
        }
        return ok;
    };
    _proto.switchToNearestDefender = function switchToNearestDefender() {
        if (!this.userTeamSide) return;
        var team = this.getSideActors(this.userTeamSide);
        var best = team[0];
        var bestD = 999;
        for(var i = 0; i < team.length; i++){
            var a = team[i];
            var d = Math.hypot(a.render.x - this.renderState.ball.x, a.render.z - this.renderState.ball.z);
            if (d < bestD) {
                bestD = d;
                best = a;
            }
        }
        if (best) this.selectUserControlledPlayer(best);
    };
    /**
   * 2K26 Pro-Stick Rhythm Shooting: Pull Down arms the rhythm shot;
   * Flicking Up submits timing + tempo velocity (`tempoError: 0..0.4`).
   */ _proto.startRhythmShotDown = function startRhythmShotDown() {
        if (this.phase === 'JUMP_BALL') {
            this.triggerJumpBallAttempt();
            return;
        }
        if (this.phase === 'FREE_THROW') {
            this.releaseUserFreeThrow();
            return;
        }
        if (this.phase !== 'LIVE') return;
        var handler = this.getBallHandler();
        if (!handler || !handler.render.isUserControlled) return;
        if (this.shotChargeActive || this.activeShot || this.activePass) return;
        this.rhythmIsArmed = true;
        this.rhythmDownTime = this.simTimeSec;
        this.beginShotCharge(handler, true);
    };
    _proto.flickRhythmShotUp = function flickRhythmShotUp(upFlickVelocityNorm) {
        if (upFlickVelocityNorm === void 0) upFlickVelocityNorm = 1.0;
        if (!this.shotChargeActive || !this.rhythmIsArmed) return;
        var handler = this.getBallHandler();
        if (!handler) return;
        // Ideal tempo matches jumpshotSpeed (~1.0); deviation creates tempo error
        var ideal = handler.profile.jumpshotSpeed;
        var tempoErr = Math.abs(upFlickVelocityNorm - ideal) * 0.22;
        this.rhythmIsArmed = false;
        this.releaseShotCharge(handler, true, tempoErr);
    };
    _proto.releaseUserFreeThrow = function releaseUserFreeThrow() {
        if (this.phase !== 'FREE_THROW' || !this.activeFreeThrow) return;
        var ft = this.activeFreeThrow;
        if (ft.waitingFlight || !ft.meterActive) return;
        if (this.userTeamSide && ft.side !== this.userTeamSide) return;
        this.executeFreeThrowRelease(ft.meterProgress);
    };
    _proto.triggerStealAttempt = function triggerStealAttempt() {
        var _this = this;
        if (this.phase !== 'LIVE') return;
        var ctrl = this.getControlledActor();
        if (!ctrl || ctrl.stealCooldown > 0 || ctrl.stunTimer > 0) return;
        // Pass lane interception if a pass is in flight
        if (this.activePass && this.activePass.passerSide !== ctrl.render.teamSide) {
            var distBall = Math.hypot(ctrl.render.x - this.renderState.ball.x, ctrl.render.z - this.renderState.ball.z);
            if (distBall <= 2.35) {
                var _ref;
                var passer = this.actorMap.get(this.activePass.passerId);
                var res = (0, _BadgeEngine.evaluateStealAttempt)(ctrl.profile, ctrl.render.teamSide, (_ref = passer == null ? void 0 : passer.profile) != null ? _ref : ctrl.profile, this.activePass.passerSide, true, false, function(pl, s, id, t) {
                    return _this.emitBadge(pl, s, id, t);
                });
                ctrl.stealCooldown = 0.65;
                if (Math.random() <= res.stealChance + 0.18) {
                    this.activePass = null;
                    ctrl.boxScore.stl += 1;
                    (0, _BadgeEngine.addTakeoverProgress)(ctrl.takeover, 16);
                    this.grantPossession(ctrl, true);
                    this.renderState.lastEventLabel = "INTERCEPTED BY " + ctrl.render.lastName.toUpperCase() + "!";
                    this.hooks.onCrowdRoar == null ? void 0 : this.hooks.onCrowdRoar.call(this.hooks, 0.75);
                    return;
                }
            }
            return;
        }
        var handler = this.getBallHandler();
        if (!handler || handler.render.teamSide === ctrl.render.teamSide) {
            this.switchToNearestDefender();
            return;
        }
        this.performStealCheck(ctrl, handler);
    };
    _proto.triggerBlockAttempt = function triggerBlockAttempt() {
        if (this.phase !== 'LIVE') return;
        var ctrl = this.getControlledActor();
        if (!ctrl || ctrl.blockCooldown > 0 || ctrl.stunTimer > 0) return;
        ctrl.blockCooldown = 0.62;
        ctrl.render.animState = 'JUMP_BLOCK';
        ctrl.render.y = 0.68;
        ctrl.jumpCountInPaint += 1;
        // If opponent is shooting right nearby, contest/block!
        var handler = this.getBallHandler();
        if (handler && handler.render.teamSide !== ctrl.render.teamSide) {
            var dist = Math.hypot(ctrl.render.x - handler.render.x, ctrl.render.z - handler.render.z);
            if (dist <= 2.25 && this.shotChargeActive) {
                this.attemptBlockOnShooter(ctrl, handler);
            } else if (dist <= 2.2 && !this.shotChargeActive) {
                // Bit on pump fake -> fly-by recovery stun
                ctrl.stunTimer = 0.55;
                this.renderState.lastEventLabel = "" + ctrl.render.lastName.toUpperCase() + " BIT ON PUMP FAKE!";
                this.addGradeEvent('-Bad Block Attempt', -5);
            }
        }
    };
    // ==========================================================================
    // FIXED 60 HZ SIMULATION STEP
    // ==========================================================================
    _proto.step = function step(rawDt) {
        var _ref;
        var _this_settings_coach_sliders;
        if (this.paused) return;
        var dt = Math.min(0.05, Math.max(0.001, rawDt));
        var sliderSpeed = (_ref = (_this_settings_coach_sliders = this.settings.coach.sliders) == null ? void 0 : _this_settings_coach_sliders.user.gameSpeed) != null ? _ref : this.settings.gameplay.gameSpeed;
        var effectiveGameSpeed = Math.round((this.settings.gameplay.gameSpeed + sliderSpeed) * 0.5);
        var speedScale = 0.78 + (effectiveGameSpeed - 40) / 30 * 0.44;
        var sDt = dt * speedScale;
        this.possessionElapsedSec += sDt;
        this.simTimeSec += sDt;
        this.dribbleAudioCooldown = Math.max(0, this.dribbleAudioCooldown - dt);
        // Decay splash banner & teammate grade event feed
        (0, _SimTacticsAndReplay.tickTeammateGradeEvents)(this.teammateGrade, dt);
        if (this.splashBanner) {
            this.splashBanner.ttlSec -= dt;
            if (this.splashBanner.ttlSec <= 0) this.splashBanner = null;
        }
        // 3-second Timeout quick huddle pause
        if (this.timeoutHuddleSec > 0) {
            this.timeoutHuddleSec = Math.max(0, this.timeoutHuddleSec - dt);
            return;
        }
        // Decay transient visual effects
        this.renderState.cameraShake = Math.max(0, this.renderState.cameraShake - dt * 2.2);
        this.renderState.crowdExcitement = Math.max(0.22, this.renderState.crowdExcitement - dt * 0.08);
        this.renderState.hoops.leftRimFlex = Math.max(0, this.renderState.hoops.leftRimFlex - dt * 2.6);
        this.renderState.hoops.rightRimFlex = Math.max(0, this.renderState.hoops.rightRimFlex - dt * 2.6);
        this.renderState.hoops.leftNetRipple = Math.max(0, this.renderState.hoops.leftNetRipple - dt * 1.4);
        this.renderState.hoops.rightNetRipple = Math.max(0, this.renderState.hoops.rightNetRipple - dt * 1.4);
        this.renderState.hoops.leftNetTime += dt;
        this.renderState.hoops.rightNetTime += dt;
        // Decay Pick & Roll screen assist window
        if (this.pickAndRoll.screenAssistWindowSec > 0) {
            this.pickAndRoll.screenAssistWindowSec = Math.max(0, this.pickAndRoll.screenAssistWindowSec - dt);
        }
        // Decay badge feed & shot feedback
        if (this.badgeFeed.length > 0) {
            for(var i = this.badgeFeed.length - 1; i >= 0; i--){
                this.badgeFeed[i].ttlSec -= dt;
                if (this.badgeFeed[i].ttlSec <= 0) this.badgeFeed.splice(i, 1);
            }
        }
        if (this.shotFeedback) {
            this.shotFeedback.ttlSec -= dt;
            if (this.shotFeedback.ttlSec <= 0) this.shotFeedback = null;
        }
        // Tick Takeover & cooldowns for all players
        for(var i1 = 0; i1 < this.actors.length; i1++){
            var a = this.actors[i1];
            (0, _BadgeEngine.tickTakeover)(a.takeover, dt);
            a.render.takeoverLevel = a.takeover.ignited ? 1.0 : a.takeover.meter / 100;
            a.stunTimer = Math.max(0, a.stunTimer - dt);
            a.dribbleCooldown = Math.max(0, a.dribbleCooldown - dt);
            a.stealCooldown = Math.max(0, a.stealCooldown - dt);
            a.blockCooldown = Math.max(0, a.blockCooldown - dt);
            a.jumpRecoveryTimer = Math.max(0, a.jumpRecoveryTimer - dt);
            a.actionTimer = Math.max(0, a.actionTimer - dt);
            if (a.render.y > 0 && a.render.animState !== 'DUNK' && a.render.animState !== 'RIM_HANG') {
                a.render.y = Math.max(0, a.render.y - dt * 2.6);
            }
        }
        switch(this.phase){
            case 'JUMP_BALL':
                this.stepJumpBall(dt);
                break;
            case 'LIVE':
                this.stepLivePlay(sDt, dt);
                break;
            case 'FREE_THROW':
                this.stepFreeThrow(dt);
                break;
            case 'INBOUND':
            case 'CHECK_BALL':
                this.stepDeadBallReset(dt);
                break;
            case 'QUARTER_BREAK':
            case 'HALFTIME_SWAP':
                this.stepQuarterBreak(dt);
                break;
            case 'GAME_OVER':
                break;
        }
        this.replayBuffer.record(this.renderState, this.simTimeSec, dt);
        this.prevShootHeld = this.input.shootHeld;
    };
    _proto.stepJumpBall = function stepJumpBall(dt) {
        this.jumpBallTossElapsed += dt;
        var dur = 1.25;
        this.jumpBallProgress = Math.min(1, this.jumpBallTossElapsed / dur);
        // Smooth parabolic ball toss straight up at (0, y, 0)
        var t = this.jumpBallProgress;
        this.renderState.ball.x = 0;
        this.renderState.ball.z = 0;
        this.renderState.ball.y = 1.4 + Math.sin(t * Math.PI * 0.92) * 2.65;
        if (this.input.shootHeld && !this.prevShootHeld) {
            this.triggerJumpBallAttempt();
            return;
        }
        if (this.jumpBallTossElapsed >= dur) {
            this.resolveJumpBall();
        }
    };
    _proto.getSlidersForSide = function getSlidersForSide(side) {
        var sl = this.settings.coach.sliders;
        if (!sl) {
            return {
                insideShot: 50,
                closeShot: 50,
                midRange: 50,
                threePt: this.settings.coach.userShotSlider,
                layup: 50,
                dunkInTraffic: this.settings.coach.dunkFrequencySlider,
                shotContestImpact: 50,
                blockFrequency: 50,
                stealSuccess: 50,
                offReb: 50,
                defReb: 50,
                ballSecurity: 50,
                helpDefense: this.settings.coach.cpuDefenseSlider,
                gameSpeed: this.settings.gameplay.gameSpeed,
                foulFrequency: 50
            };
        }
        return this.userTeamSide && side === this.userTeamSide ? sl.user : sl.cpu;
    };
    _proto.stepLivePlay = function stepLivePlay(sDt, dt) {
        this.playClockSec += sDt;
        this.possessionElapsedSec += dt;
        for(var i = 0; i < this.actors.length; i++){
            this.actors[i].boxScore.minutesSec += dt;
        }
        // 1. Clocks (NBA regulation vs Blacktop untimed)
        if (!this.isBlacktopMode()) {
            this.renderState.quarterClockSec = Math.max(0, this.renderState.quarterClockSec - dt);
            if (!this.activeShot && this.settings.gameplay.shotClock24 !== false) {
                this.renderState.shotClockSec = Math.max(0, this.renderState.shotClockSec - dt);
                if (this.renderState.shotClockSec <= 0) {
                    this.handleTurnover('24-SECOND SHOT CLOCK VIOLATION!', true);
                    return;
                }
            }
            if (this.renderState.quarterClockSec <= 0 && !this.activeShot) {
                this.handleQuarterEnd();
                return;
            }
            // 8-Second Backcourt violation check
            if (this.settings.gameplay.eightSecBackcourt !== false) {
                var handler = this.getBallHandler();
                if (handler && !this.crossedHalfCourt) {
                    var dir = this.getAttackDirForSide(handler.render.teamSide);
                    var pastHalf = dir === 1 ? handler.render.x > 0.25 : handler.render.x < -0.25;
                    if (pastHalf) {
                        this.crossedHalfCourt = true;
                        this.backcourtClockSec = 0;
                    } else {
                        this.backcourtClockSec += dt;
                        if (this.backcourtClockSec >= 8.0) {
                            this.handleTurnover('8-SECOND BACKCOURT VIOLATION!', true);
                            return;
                        }
                    }
                }
            }
        }
        // 2. Toggleable 3-Second Offensive Paint Violation
        if (this.settings.gameplay.paintThreeSecViolation && !this.activeShot) {
            var offSide = this.renderState.possession;
            var hoopX = this.getAttackDirForSide(offSide) * _courtTypes.COURT_DIMS.RIM_X;
            var offPlayers = this.getSideActors(offSide);
            for(var i1 = 0; i1 < offPlayers.length; i1++){
                var a = offPlayers[i1];
                var inPaint = Math.abs(hoopX - a.render.x) <= _courtTypes.COURT_DIMS.KEY_LENGTH - 0.3 && Math.abs(a.render.z) <= _courtTypes.COURT_DIMS.KEY_HALF_WIDTH - 0.15;
                if (inPaint && !a.render.hasBall) {
                    a.paintThreeSecTimer += dt;
                    if (a.paintThreeSecTimer >= 3.0) {
                        a.paintThreeSecTimer = 0;
                        this.handleTurnover('3-SECOND PAINT VIOLATION!', true);
                        return;
                    }
                } else {
                    a.paintThreeSecTimer = 0;
                }
            }
        }
        // 3. Handle User Shot Button Hold / Release (Non-Rhythm)
        var handler1 = this.getBallHandler();
        if (handler1 && handler1.render.isUserControlled && !this.activePass && !this.activeShot) {
            if (this.input.shootHeld && !this.prevShootHeld && !this.shotChargeActive) {
                this.beginShotCharge(handler1, false);
            } else if (!this.input.shootHeld && this.prevShootHeld && this.shotChargeActive && !this.rhythmIsArmed) {
                // Quick tap (< 0.15s) outside paint -> Pump Fake!
                var hoopX1 = this.getAttackDirForSide(handler1.render.teamSide) * _courtTypes.COURT_DIMS.RIM_X;
                var dist = Math.hypot(hoopX1 - handler1.render.x, handler1.render.z);
                if (this.shotChargeProgress < 0.22 && dist > 4.2) {
                    this.shotChargeActive = false;
                    handler1.render.animState = 'JUMPSHOT';
                    handler1.render.shotProgress = 0.25;
                    handler1.actionTimer = 0.22;
                    this.renderState.lastEventLabel = "" + handler1.render.lastName.toUpperCase() + " PUMP FAKE!";
                    this.triggerDefenderPumpFakeBite(handler1);
                } else {
                    this.releaseShotCharge(handler1, false, 0);
                }
            }
        }
        // Advance active shot charge meter
        if (this.shotChargeActive && handler1) {
            this.shotChargeProgress += dt / Math.max(0.28, this.shotChargeDuration);
            handler1.render.shotProgress = Math.min(1, this.shotChargeProgress);
            if (this.shotChargeProgress >= 1.12) {
                // Auto-release very late
                this.rhythmIsArmed = false;
                this.releaseShotCharge(handler1, false, 0.35);
            }
        }
        // 4. Advance Pass or Shot Ball Flight
        if (this.activePass) {
            this.stepPassFlight(dt);
        } else if (this.activeShot) {
            this.stepShotFlight(dt);
        }
        // 5. Move User & AI Players
        this.stepAllPlayers(sDt, dt);
        // 6. Sync Ball Position to Ball Handler when not in flight
        var curHandler = this.getBallHandler();
        if (curHandler && !this.activePass && !this.activeShot) {
            var handSign = this.renderState.ball.dribbleHand === 'right' ? 1 : -1;
            var f = curHandler.render.facingRad;
            var forwardX = Math.cos(f);
            var forwardZ = Math.sin(f);
            var rightX = -forwardZ;
            var rightZ = forwardX;
            var bounceWave = Math.abs(Math.sin(this.simTimeSec * (curHandler.render.speed > 2.2 ? 9.5 : 6.2)));
            var ballY = this.shotChargeActive ? 1.55 + Math.min(1, this.shotChargeProgress) * 1.15 : 0.14 + bounceWave * 0.96;
            this.renderState.ball.x = curHandler.render.x + forwardX * 0.38 + rightX * 0.32 * handSign;
            this.renderState.ball.z = curHandler.render.z + forwardZ * 0.38 + rightZ * 0.32 * handSign;
            this.renderState.ball.y = ballY;
            this.renderState.ball.inFlight = false;
            if (!this.shotChargeActive && bounceWave < 0.1 && this.dribbleAudioCooldown <= 0) {
                this.dribbleAudioCooldown = 0.32;
                this.hooks.onDribble == null ? void 0 : this.hooks.onDribble.call(this.hooks);
            }
            // Update 2K14 Shot Quality floor ring under handler
            this.updateShotQualityRing(curHandler);
            // Out-of-bounds check
            if (Math.abs(curHandler.render.x) > _courtTypes.COURT_DIMS.HALF_LENGTH - 0.15 || Math.abs(curHandler.render.z) > _courtTypes.COURT_DIMS.HALF_WIDTH - 0.15) {
                this.handleTurnover('OUT OF BOUNDS!', true);
            }
        }
    };
    // ==========================================================================
    // PLAYER MOVEMENT & AI LOOP
    // ==========================================================================
    _proto.stepAllPlayers = function stepAllPlayers(sDt, dt) {
        var homeActors = this.getSideActors('HOME');
        var awayActors = this.getSideActors('AWAY');
        var ballHandler = this.getBallHandler();
        var makeSnaps = function makeSnaps(list) {
            return list.map(function(a) {
                return {
                    id: a.render.id,
                    slotIndex: a.teamSlot,
                    teamSide: a.render.teamSide,
                    profile: a.profile,
                    x: a.render.x,
                    z: a.render.z,
                    hasBall: a.render.hasBall,
                    isUserControlled: a.render.isUserControlled,
                    stamina: a.render.stamina,
                    adrenalinePips: a.render.adrenalinePips,
                    guardTargetId: a.render.guardTargetId
                };
            });
        };
        var homeSnaps = makeSnaps(homeActors);
        var awaySnaps = makeSnaps(awayActors);
        for(var i = 0; i < this.actors.length; i++){
            var a = this.actors[i];
            if (a.stunTimer > 0) {
                a.render.speed = 0;
                a.render.animState = 'ANKLE_BROKEN_STUMBLE';
                a.render.animPhase += dt * 4;
                continue;
            }
            var isOffense = a.render.teamSide === this.renderState.possession;
            var mySnaps = a.render.teamSide === 'HOME' ? homeSnaps : awaySnaps;
            var oppSnaps = a.render.teamSide === 'HOME' ? awaySnaps : homeSnaps;
            var mySnap = mySnaps[a.teamSlot];
            var attackDirX = this.getAttackDirForSide(a.render.teamSide);
            var defendHoopX = -attackDirX * _courtTypes.COURT_DIMS.RIM_X;
            if (a.render.isUserControlled) {
                this.stepUserPlayer(a, sDt, dt, isOffense, attackDirX);
                continue;
            }
            // AI Think Timer
            a.aiThinkTimer -= dt;
            var canDecide = a.aiThinkTimer <= 0;
            if (canDecide) {
                var diff = _AISystem.DIFFICULTY_PROFILES[this.config.difficulty];
                a.aiThinkTimer = diff.aiReactionSec + Math.random() * 0.25;
            }
            // Rebound chase if ball is loose after miss
            if (this.activeShot && this.activeShot.isReboundLive) {
                var bx = this.renderState.ball.x;
                var bz = this.renderState.ball.z;
                this.moveActorToward(a, bx, bz, true, sDt, dt, false);
                var distB = Math.hypot(a.render.x - bx, a.render.z - bz);
                if (distB < 1.35 && this.renderState.ball.y < 3.15) {
                    this.resolveReboundBattle(a);
                }
                continue;
            }
            if (isOffense) {
                // Active Pick & Roll / Pick & Fade Screener Override
                if (this.pickAndRoll.active && this.pickAndRoll.screenerId === a.render.id) {
                    this.pickAndRoll.elapsedSec += dt;
                    var pnrHandler = this.getBallHandler();
                    if (!pnrHandler || pnrHandler.render.teamSide !== a.render.teamSide || this.pickAndRoll.elapsedSec > 5.5) {
                        this.cancelPickAndRoll();
                    } else {
                        var distToSpot = Math.hypot(a.render.x - this.pickAndRoll.screenX, a.render.z - this.pickAndRoll.screenZ);
                        if (!this.pickAndRoll.screenSet) {
                            var updatedSpot = (0, _SimTacticsAndReplay.computeScreenPosition)(pnrHandler.render.x, pnrHandler.render.z, attackDirX, this.pickAndRoll.angleDeg);
                            this.pickAndRoll.screenX = updatedSpot.x;
                            this.pickAndRoll.screenZ = updatedSpot.z;
                            this.moveActorToward(a, updatedSpot.x, updatedSpot.z, true, sDt, dt, false);
                            if (distToSpot < 0.72 || this.pickAndRoll.elapsedSec > 1.35) {
                                this.pickAndRoll.screenSet = true;
                                this.pickAndRoll.screenAssistWindowSec = 4.2;
                                // Physical Brick Wall stun on defender clipped by screen
                                var nearestDef = this.findClosestOpponent(a);
                                if (nearestDef && nearestDef.dist < 1.65) {
                                    nearestDef.actor.stunTimer = Math.max(nearestDef.actor.stunTimer, 0.72);
                                }
                            }
                        } else if (this.pickAndRoll.elapsedSec < 2.25) {
                            // Hold wide screen stance
                            a.render.speed = 0;
                            a.render.animState = 'QUICK_PROTECT';
                        } else {
                            // Roll to rim OR Fade to 3PT pop spot
                            var targetX = this.pickAndRoll.action === 'ROLL' ? attackDirX * (_courtTypes.COURT_DIMS.RIM_X - 1.5) : attackDirX * (_courtTypes.COURT_DIMS.RIM_X - 7.8);
                            var targetZ = this.pickAndRoll.action === 'ROLL' ? 0 : this.pickAndRoll.screenZ >= 0 ? 4.6 : -4.6;
                            this.moveActorToward(a, targetX, targetZ, true, sDt, dt, false);
                        }
                        continue;
                    }
                }
                var cmd = (0, _AISystem.computeOffenseAI)({
                    player: mySnap,
                    teammates: mySnaps,
                    defenders: oppSnaps,
                    attackDirX: attackDirX,
                    playVision: this.renderState.activePlay,
                    shotClockSec: this.renderState.shotClockSec,
                    playClockSec: this.playClockSec,
                    difficulty: this.config.difficulty,
                    playersPerSide: this.config.playersPerSide,
                    canDecideAction: canDecide && !this.activePass && !this.activeShot,
                    isBlacktopHalfCourt: this.isBlacktopMode()
                });
                if (a.render.hasBall && !this.activePass && !this.activeShot) {
                    if (cmd.action === 'SHOOT') {
                        this.executeAIShot(a);
                        continue;
                    }
                    if ((cmd.action === 'PASS' || cmd.action === 'ALLEY_OOP') && cmd.passTargetId) {
                        var target = this.actorMap.get(cmd.passTargetId);
                        if (target) {
                            this.executePass(a, target, cmd.action === 'ALLEY_OOP' ? 'ALLEY_OOP' : 'CHEST');
                            continue;
                        }
                    }
                    if (cmd.action === 'DRIBBLE_MOVE' && a.dribbleCooldown <= 0) {
                        this.performDribbleMove(a, 'CROSSOVER');
                    }
                }
                this.moveActorToward(a, cmd.targetX, cmd.targetZ, cmd.sprint, sDt, dt, false);
            } else {
                var _this_settings_coach_sliders;
                var cmd1 = (0, _AISystem.computeDefenseAI)({
                    defender: mySnap,
                    teammates: mySnaps,
                    offense: oppSnaps,
                    ballX: this.renderState.ball.x,
                    ballZ: this.renderState.ball.z,
                    ballHandler: ballHandler ? (ballHandler.render.teamSide === 'HOME' ? homeSnaps : awaySnaps)[ballHandler.teamSlot] : null,
                    ballInFlight: Boolean(this.activeShot),
                    shooterIsRising: this.shotChargeActive,
                    defendHoopX: defendHoopX,
                    scheme: this.defensiveScheme,
                    markedStarId: this.renderState.markedStar.playerId,
                    markedStarTag: this.renderState.markedStar.tag,
                    difficulty: this.config.difficulty,
                    cpuDefenseSlider: this.settings.coach.cpuDefenseSlider,
                    cpuSliders: (_this_settings_coach_sliders = this.settings.coach.sliders) == null ? void 0 : _this_settings_coach_sliders.cpu,
                    canAttemptEvent: canDecide
                });
                a.render.guardTargetId = cmd1.guardTargetId;
                this.moveActorToward(a, cmd1.targetX, cmd1.targetZ, cmd1.sprint, sDt, dt, cmd1.intenseD);
                if (cmd1.handsUp && a.actionTimer <= 0) {
                    a.render.animState = 'HANDS_UP_CONTEST';
                }
                if (cmd1.attemptSteal && ballHandler && a.stealCooldown <= 0) {
                    this.performStealCheck(a, ballHandler);
                }
                if (cmd1.attemptBlock && ballHandler && a.blockCooldown <= 0) {
                    a.blockCooldown = 0.72;
                    a.render.animState = 'JUMP_BLOCK';
                    a.render.y = 0.65;
                    this.attemptBlockOnShooter(a, ballHandler);
                }
            }
        }
    };
    _proto.stepUserPlayer = function stepUserPlayer(a, sDt, dt, isOffense, attackDirX) {
        var _this = this;
        var _ref;
        var _this_scenarioOverride;
        // Rebound snag automatically assists if user holds movement toward loose rebound
        if (this.activeShot && this.activeShot.isReboundLive) {
            var distB = Math.hypot(a.render.x - this.renderState.ball.x, a.render.z - this.renderState.ball.z);
            if (distB < 1.15 && this.renderState.ball.y < 3.0) {
                this.resolveReboundBattle(a);
                return;
            }
        }
        var mag = Math.hypot(this.input.moveX, this.input.moveZ);
        var nx = mag > 0.05 ? this.input.moveX / Math.max(1, mag) : 0;
        var nz = mag > 0.05 ? this.input.moveZ / Math.max(1, mag) : 0;
        // 2K26 Quick Protect (Offense Shift) / Intense-D (Defense Shift)
        var isQuickProtect = isOffense && a.render.hasBall && this.input.quickProtectOrIntenseD;
        var isIntenseD = !isOffense && this.input.quickProtectOrIntenseD;
        var effSpeed = (0, _BadgeEngine.getEffectiveAttribute)(a.profile, a.takeover, 'speed');
        var maxSpeed = (4.6 + (effSpeed - 55) / 44 * 2.55) * ((_ref = (_this_scenarioOverride = this.scenarioOverride) == null ? void 0 : _this_scenarioOverride.speedMultiplier) != null ? _ref : 1); // ~4.6 .. 7.15 m/s
        // Sprint & 3-Bar Adrenaline Mechanics
        var wantsSprint = this.input.sprint && mag > 0.15 && !isQuickProtect && !this.shotChargeActive;
        if (wantsSprint) {
            if (a.render.adrenalinePips > 0) {
                var launch = (0, _BadgeEngine.evaluateFirstStepLaunch)(a.profile, a.render.teamSide, function(pl, s, id, t) {
                    return _this.emitBadge(pl, s, id, t);
                });
                maxSpeed *= 1.24 * Math.min(1.16, launch.speedMultiplier);
                if (this.settings.gameplay.fatigue) {
                    var _this_scenarioOverride1;
                    var gatoradeSave = ((_this_scenarioOverride1 = this.scenarioOverride) == null ? void 0 : _this_scenarioOverride1.staminaBonus) ? 0.72 : 1;
                    a.render.stamina = Math.max(0.08, a.render.stamina - dt * 0.11 * launch.adrenalineDrainMul * gatoradeSave);
                }
                // Bursting consumes 1 adrenaline pip every 1.45s of continuous turbo
                if (a.dribbleCooldown <= 0 && a.render.hasBall) {
                    a.render.adrenalinePips = Math.max(0, a.render.adrenalinePips - 1);
                    a.dribbleCooldown = 1.45 / Math.max(0.65, launch.adrenalineDrainMul);
                }
            } else {
                // 0 Adrenaline Pips -> -18% burst speed penalty
                maxSpeed *= 0.82;
            }
        } else if (this.settings.gameplay.fatigue) {
            var _this_scenarioOverride2;
            var recBonus = ((_this_scenarioOverride2 = this.scenarioOverride) == null ? void 0 : _this_scenarioOverride2.staminaBonus) ? 1.35 : 1;
            a.render.stamina = Math.min(1, a.render.stamina + dt * 0.065 * recBonus);
        }
        if (isQuickProtect) maxSpeed *= 0.64;
        if (isIntenseD) maxSpeed *= 0.84;
        if (this.shotChargeActive && this.shotChargeKind !== 'SKILL_DUNK') maxSpeed *= 0.22;
        // Clamps body-up slowdown if opponent defender is clamping closely
        if (a.render.hasBall) {
            var nearestDef = this.findClosestOpponent(a);
            if (nearestDef && nearestDef.dist < 1.15 && nearestDef.actor.render.animState === 'DEFENSIVE_SLIDE') {
                maxSpeed *= 0.72;
            }
        }
        a.vx = nx * maxSpeed;
        a.vz = nz * maxSpeed;
        a.render.x = Math.max(-_courtTypes.COURT_DIMS.HALF_LENGTH + 0.1, Math.min(_courtTypes.COURT_DIMS.HALF_LENGTH - 0.1, a.render.x + a.vx * sDt));
        a.render.z = Math.max(-_courtTypes.COURT_DIMS.HALF_WIDTH + 0.1, Math.min(_courtTypes.COURT_DIMS.HALF_WIDTH - 0.1, a.render.z + a.vz * sDt));
        a.render.speed = Math.hypot(a.vx, a.vz);
        if (a.render.speed > 0.25) {
            a.render.facingRad = Math.atan2(a.vz, a.vx);
            a.render.animPhase += sDt * (2.6 + a.render.speed * 0.85);
        } else {
            // Face hoop on offense, face ball on defense
            var tx = isOffense ? attackDirX * _courtTypes.COURT_DIMS.RIM_X : this.renderState.ball.x;
            var tz = isOffense ? 0 : this.renderState.ball.z;
            a.render.facingRad = Math.atan2(tz - a.render.z, tx - a.render.x);
        }
        if (a.actionTimer <= 0 && !this.shotChargeActive) {
            if (isQuickProtect) {
                a.render.animState = 'QUICK_PROTECT';
            } else if (!isOffense && this.input.handsUp) {
                a.render.animState = 'HANDS_UP_CONTEST';
            } else if (isIntenseD) {
                a.render.animState = 'DEFENSIVE_SLIDE';
            } else if (a.render.hasBall) {
                a.render.animState = a.render.speed > 5.4 ? 'SPRINT' : this.renderState.ball.dribbleHand === 'right' ? 'DRIBBLE_RIGHT' : 'DRIBBLE_LEFT';
            } else {
                a.render.animState = a.render.speed > 5.4 ? 'SPRINT' : a.render.speed > 0.4 ? 'RUN' : 'IDLE';
            }
        }
    };
    _proto.moveActorToward = function moveActorToward(a, tx, tz, sprint, sDt, dt, intenseD) {
        var dx = tx - a.render.x;
        var dz = tz - a.render.z;
        var dist = Math.hypot(dx, dz);
        if (dist < 0.22) {
            a.vx = 0;
            a.vz = 0;
            a.render.speed = 0;
            if (a.actionTimer <= 0) {
                a.render.animState = intenseD ? 'DEFENSIVE_SLIDE' : a.render.hasBall ? 'DRIBBLE_RIGHT' : 'IDLE';
            }
            // Face ball or hoop
            var lookX = a.render.hasBall ? this.getAttackDirForSide(a.render.teamSide) * _courtTypes.COURT_DIMS.RIM_X : this.renderState.ball.x;
            var lookZ = a.render.hasBall ? 0 : this.renderState.ball.z;
            a.render.facingRad = Math.atan2(lookZ - a.render.z, lookX - a.render.x);
            return;
        }
        var effSpeed = (0, _BadgeEngine.getEffectiveAttribute)(a.profile, a.takeover, 'speed');
        var speed = 4.35 + (effSpeed - 55) / 44 * 2.35;
        if (sprint && a.render.adrenalinePips > 0) {
            speed *= 1.18;
            if (this.settings.gameplay.fatigue) {
                a.render.stamina = Math.max(0.12, a.render.stamina - dt * 0.08);
            }
        } else if (sprint && a.render.adrenalinePips <= 0) {
            speed *= 0.82;
        } else if (this.settings.gameplay.fatigue) {
            a.render.stamina = Math.min(1, a.render.stamina + dt * 0.05);
        }
        if (intenseD) speed *= 0.86;
        var stepLen = Math.min(dist, speed * sDt);
        a.render.x += dx / dist * stepLen;
        a.render.z += dz / dist * stepLen;
        a.render.speed = speed;
        a.render.facingRad = Math.atan2(dz, dx);
        a.render.animPhase += sDt * (2.4 + speed * 0.75);
        if (a.actionTimer <= 0) {
            if (intenseD) a.render.animState = 'DEFENSIVE_SLIDE';
            else if (a.render.hasBall) a.render.animState = sprint ? 'SPRINT' : 'DRIBBLE_RIGHT';
            else a.render.animState = sprint ? 'SPRINT' : 'RUN';
        }
    };
    // ==========================================================================
    // SHOOTING, FINISHING, EURO-STEPS, SKILL DUNK METER & PARABOLIC FLIGHT
    // ==========================================================================
    _proto.beginShotCharge = function beginShotCharge(handler, isRhythm) {
        var _VISUAL_CUE_TARGETS_this_settings_gameplay_visualCue;
        var hoopX = this.getAttackDirForSide(handler.render.teamSide) * _courtTypes.COURT_DIMS.RIM_X;
        var dist = Math.hypot(hoopX - handler.render.x, handler.render.z);
        var isMoving = handler.render.speed > 1.35;
        var isDoubleTapShoot = this.simTimeSec - this.lastShootTapTime < 0.36;
        this.lastShootTapTime = this.simTimeSec;
        var isNoDipCatch = this.simTimeSec - handler.lastCatchTime <= 0.45 && !isMoving;
        var nearestDef = this.findClosestOpponent(handler);
        var diff = _AISystem.DIFFICULTY_PROFILES[this.config.difficulty];
        // Inside 4.2m moving -> Finishing moves (Dunk / Euro-Step / Floater / Reverse Layup / Layup)
        if (dist <= 4.2 && (isMoving || this.input.sprint)) {
            var move = 'STANDARD_LAYUP';
            if (isDoubleTapShoot || this.input.quickProtectOrIntenseD) {
                move = 'EURO_STEP';
            } else if (this.input.sprint && handler.profile.attributes.drivingDunk >= 65 && dist <= 3.7) {
                move = 'DUNK';
            } else if (dist >= 2.55) {
                move = 'FLOATER';
            } else if (Math.abs(handler.render.z) >= 1.65) {
                move = 'REVERSE_LAYUP';
            }
            this.shotChargeFinishMove = move;
            this.shotChargeActive = true;
            this.shotChargeProgress = 0;
            if (move === 'DUNK' && diff.requiresInteractiveFinishPrompts) {
                var badgeFin = (0, _BadgeEngine.evaluateFinishingBadges)({
                    finisher: handler.profile,
                    finisherSide: handler.render.teamSide,
                    defender: nearestDef && nearestDef.dist < 2.6 ? nearestDef.actor.profile : null,
                    defenderSide: handler.render.teamSide === 'HOME' ? 'AWAY' : 'HOME',
                    moveKind: 'DUNK',
                    hasContact: Boolean(nearestDef && nearestDef.dist < 2.1),
                    isChaseDown: false
                });
                this.shotChargeKind = 'SKILL_DUNK';
                this.shotChargeHasDunkMeter = true;
                this.shotChargeDuration = 0.56;
                this.shotChargeTargetCenter = 0.74;
                this.shotChargeGreenHalf = computeSkillDunkGreenWindow(handler.profile, nearestDef && nearestDef.dist < 2.6 ? nearestDef.actor.profile : null, badgeFin.dunkMeterBonus, badgeFin.defenderDeterBonus);
                handler.render.animState = 'DUNK';
                this.renderState.lastEventLabel = 'SKILL DUNK METER! RELEASE IN GREEN!';
                return;
            }
            // Layup / Euro / Floater / Rookie Dunk resolves quickly
            this.shotChargeKind = 'JUMPSHOT';
            this.shotChargeHasDunkMeter = false;
            this.shotChargeDuration = move === 'EURO_STEP' ? 0.52 : 0.44;
            this.shotChargeTargetCenter = 0.72;
            this.shotChargeGreenHalf = 0.1;
            handler.render.animState = move === 'DUNK' ? 'DUNK' : move === 'EURO_STEP' ? 'EURO_STEP' : move === 'FLOATER' ? 'FLOATER' : 'LAYUP';
            return;
        }
        // Perimeter / Mid-Range Jumpshot (Button Hold or 2K26 Rhythm Shooting)
        this.shotChargeFinishMove = null;
        this.shotChargeHasDunkMeter = false;
        this.shotChargeActive = true;
        this.shotChargeProgress = 0;
        this.shotChargeKind = isRhythm ? 'RHYTHM_SHOT' : 'JUMPSHOT';
        var baseGather = 0.64 / Math.max(0.75, Math.min(1.25, handler.profile.jumpshotSpeed));
        this.shotChargeDuration = isNoDipCatch ? baseGather * 0.8 : baseGather; // -20% No-Dip Catch-and-Shoot!
        this.shotChargeTargetCenter = (_VISUAL_CUE_TARGETS_this_settings_gameplay_visualCue = VISUAL_CUE_TARGETS[this.settings.gameplay.visualCue]) != null ? _VISUAL_CUE_TARGETS_this_settings_gameplay_visualCue : 0.68;
        this.shotChargeGreenHalf = 0.072 * diff.userGreenWindowMul;
        handler.render.animState = 'JUMPSHOT';
        handler.render.shotProgress = 0;
        if (isNoDipCatch) {
            this.renderState.lastEventLabel = 'NO-DIP CATCH & SHOOT (-20% GATHER)';
        }
    };
    _proto.releaseShotCharge = function releaseShotCharge(handler, isRhythmShot, rhythmTempoError) {
        var _this = this;
        var _this_actorMap_get, _handler_profile_hotZones_hotKey, _ref;
        var _this_scenarioOverride;
        this.shotChargeActive = false;
        var hoopX = this.getAttackDirForSide(handler.render.teamSide) * _courtTypes.COURT_DIMS.RIM_X;
        var dist = Math.hypot(hoopX - handler.render.x, handler.render.z);
        var isThree = this.isThreePointShot(handler.render.x, handler.render.z, hoopX);
        var nearestDef = this.findClosestOpponent(handler);
        var contestPct = this.computeDefenderContestPct(handler, nearestDef);
        var isCatchAndShoot = this.simTimeSec - handler.lastCatchTime <= 0.85;
        var passer = handler.lastPasserId ? (_this_actorMap_get = this.actorMap.get(handler.lastPasserId)) != null ? _this_actorMap_get : null : null;
        // Shooting Foul check on contested paint drives / late closeouts
        if (nearestDef && nearestDef.dist < 1.35 && contestPct >= 52 && (this.shotChargeFinishMove === 'DUNK' || this.shotChargeFinishMove === 'STANDARD_LAYUP') && Math.random() < 0.16) {
            this.callFoul(nearestDef.actor, handler, true, isThree ? 3 : 2);
            return;
        }
        // Skill Dunk / Finishing Resolution
        if (this.shotChargeFinishMove) {
            var move = this.shotChargeFinishMove;
            this.shotChargeFinishMove = null;
            var hasContact = Boolean(nearestDef && nearestDef.dist < 2.2);
            var badgeFin = (0, _BadgeEngine.evaluateFinishingBadges)({
                finisher: handler.profile,
                finisherSide: handler.render.teamSide,
                defender: hasContact && nearestDef ? nearestDef.actor.profile : null,
                defenderSide: handler.render.teamSide === 'HOME' ? 'AWAY' : 'HOME',
                moveKind: move,
                hasContact: hasContact,
                isChaseDown: Boolean(nearestDef && nearestDef.actor.render.speed > 5.2)
            }, function(pl, s, id, t) {
                return _this.emitBadge(pl, s, id, t);
            });
            var isGreen = false;
            var made = false;
            if (move === 'DUNK' && this.shotChargeHasDunkMeter) {
                var err = Math.abs(this.shotChargeProgress - this.shotChargeTargetCenter);
                isGreen = err <= this.shotChargeGreenHalf;
                made = isGreen || err <= this.shotChargeGreenHalf * 1.5 && Math.random() < 0.45;
            } else {
                var attr = move === 'DUNK' ? (0, _BadgeEngine.getEffectiveAttribute)(handler.profile, handler.takeover, 'drivingDunk') : (0, _BadgeEngine.getEffectiveAttribute)(handler.profile, handler.takeover, 'drivingLayup');
                var prob = Math.max(0.18, Math.min(0.94, 0.48 + (attr - 65) / 34 * 0.34 + badgeFin.finishBonus * 0.55 - badgeFin.defenderDeterBonus * 0.45 - contestPct / 100 * 0.36));
                var err1 = Math.abs(this.shotChargeProgress - this.shotChargeTargetCenter);
                isGreen = err1 <= 0.085 && prob > 0.55;
                made = isGreen || Math.random() <= prob;
            }
            this.shotFeedback = {
                timingLabel: isGreen ? move === 'DUNK' ? 'POSTER GREEN SLAM!' : "" + move.replace(/_/g, ' ') + " \xb7 GREEN" : made ? "" + move.replace(/_/g, ' ') + " FINISH" : "" + move.replace(/_/g, ' ') + " RIM OUT",
                rhythmLabel: null,
                contestLabel: contestPct < 15 ? 'Open Lane' : "Paint Contest " + Math.round(contestPct) + "%",
                contestPct: Math.round(contestPct),
                isGreen: isGreen,
                made: made,
                ttlSec: 2.6
            };
            if (move === 'DUNK') {
                handler.render.x = hoopX - this.getAttackDirForSide(handler.render.teamSide) * 0.95;
                handler.render.z = Math.max(-0.55, Math.min(0.55, handler.render.z * 0.35));
                handler.render.y = 1.05;
                handler.render.animState = made ? 'RIM_HANG' : 'DUNK';
                handler.actionTimer = 0.65;
            } else {
                handler.actionTimer = 0.45;
            }
            this.launchBallShot({
                shooter: handler,
                passerId: isCatchAndShoot ? handler.lastPasserId : null,
                isThree: false,
                isFreeThrow: false,
                isDunk: move === 'DUNK',
                isAlleyOop: false,
                isGreen: isGreen,
                willMake: made,
                targetHoopX: hoopX
            });
            return;
        }
        // Standard / Rhythm Jumpshot Evaluation
        var hotKey = getHotZoneKeyForPosition(handler.render.x, handler.render.z, hoopX);
        var hotVal = (_handler_profile_hotZones_hotKey = handler.profile.hotZones[hotKey]) != null ? _handler_profile_hotZones_hotKey : 0;
        var res = computeShotOutcome({
            shooter: handler.profile,
            shooterSide: handler.render.teamSide,
            shooterTakeover: handler.takeover,
            defender: nearestDef && nearestDef.dist < 3.0 ? nearestDef.actor.profile : null,
            defenderSide: handler.render.teamSide === 'HOME' ? 'AWAY' : 'HOME',
            passer: isCatchAndShoot ? (_ref = passer == null ? void 0 : passer.profile) != null ? _ref : null : null,
            distMeters: dist,
            isThree: isThree,
            hotZoneState: hotVal,
            releaseValue: this.shotChargeProgress,
            targetCenter: this.shotChargeTargetCenter,
            timingProfile: ((_this_scenarioOverride = this.scenarioOverride) == null ? void 0 : _this_scenarioOverride.forceGreenOrMiss) ? 'GREEN_OR_MISS' : this.settings.gameplay.shotTimingProfile,
            shotMeterEnabled: this.settings.controller.shotMeterEnabled,
            isRhythmShot: isRhythmShot,
            rhythmTempoError: rhythmTempoError,
            isCatchAndShoot: isCatchAndShoot,
            isOffDribble: handler.render.speed > 1.25 || !isCatchAndShoot,
            contestPct: contestPct,
            stamina: handler.render.stamina,
            adrenalinePips: handler.render.adrenalinePips,
            difficulty: this.config.difficulty,
            userShotSlider: function() {
                var sl = _this.getSlidersForSide(handler.render.teamSide);
                var defSl = _this.getSlidersForSide(handler.render.teamSide === 'HOME' ? 'AWAY' : 'HOME');
                var shotTypeVal = isThree ? sl.threePt : dist <= 2.4 ? sl.insideShot : dist <= 4.2 ? sl.closeShot : sl.midRange;
                var contestPenalty = (defSl.shotContestImpact - 50) * (contestPct / 100) * 0.45;
                return Math.max(10, Math.min(95, shotTypeVal - contestPenalty));
            }()
        }, function(pl, s, id, t) {
            return _this.emitBadge(pl, s, id, t);
        });
        this.shotFeedback = {
            timingLabel: res.timingLabel,
            rhythmLabel: res.rhythmLabel,
            contestLabel: res.contestLabel,
            contestPct: res.contestPct,
            isGreen: res.isGreen,
            made: res.made,
            ttlSec: 2.8
        };
        handler.render.y = 0.58;
        handler.actionTimer = 0.5;
        this.launchBallShot({
            shooter: handler,
            passerId: isCatchAndShoot ? handler.lastPasserId : null,
            isThree: isThree,
            isFreeThrow: false,
            isDunk: false,
            isAlleyOop: false,
            isGreen: res.isGreen,
            willMake: res.made,
            targetHoopX: hoopX
        });
    };
    _proto.executeAIShot = function executeAIShot(shooter) {
        var _this = this;
        var _this_actorMap_get, _shooter_profile_hotZones_hotKey, _ref;
        var hoopX = this.getAttackDirForSide(shooter.render.teamSide) * _courtTypes.COURT_DIMS.RIM_X;
        var dist = Math.hypot(hoopX - shooter.render.x, shooter.render.z);
        var isThree = this.isThreePointShot(shooter.render.x, shooter.render.z, hoopX);
        var nearestDef = this.findClosestOpponent(shooter);
        var contestPct = this.computeDefenderContestPct(shooter, nearestDef);
        var diff = _AISystem.DIFFICULTY_PROFILES[this.config.difficulty];
        var isDunk = dist <= 3.1 && shooter.profile.attributes.drivingDunk >= 75;
        var isCatch = this.simTimeSec - shooter.lastCatchTime <= 0.9;
        var passer = shooter.lastPasserId ? (_this_actorMap_get = this.actorMap.get(shooter.lastPasserId)) != null ? _this_actorMap_get : null : null;
        if (isDunk) {
            var made = Math.random() <= 0.72 - contestPct / 100 * 0.35;
            shooter.render.animState = made ? 'RIM_HANG' : 'DUNK';
            shooter.render.y = 0.95;
            shooter.actionTimer = 0.6;
            this.launchBallShot({
                shooter: shooter,
                passerId: isCatch ? shooter.lastPasserId : null,
                isThree: false,
                isFreeThrow: false,
                isDunk: true,
                isAlleyOop: false,
                isGreen: made,
                willMake: made,
                targetHoopX: hoopX
            });
            return;
        }
        var hotKey = getHotZoneKeyForPosition(shooter.render.x, shooter.render.z, hoopX);
        var hotVal = (_shooter_profile_hotZones_hotKey = shooter.profile.hotZones[hotKey]) != null ? _shooter_profile_hotZones_hotKey : 0;
        var aiGreen = Math.random() <= diff.aiShotGreenRate;
        var target = 0.68;
        var releaseVal = aiGreen ? target : target + (Math.random() < 0.5 ? -0.11 : 0.11);
        var res = computeShotOutcome({
            shooter: shooter.profile,
            shooterSide: shooter.render.teamSide,
            shooterTakeover: shooter.takeover,
            defender: nearestDef && nearestDef.dist < 3.0 ? nearestDef.actor.profile : null,
            defenderSide: shooter.render.teamSide === 'HOME' ? 'AWAY' : 'HOME',
            passer: isCatch ? (_ref = passer == null ? void 0 : passer.profile) != null ? _ref : null : null,
            distMeters: dist,
            isThree: isThree,
            hotZoneState: hotVal,
            releaseValue: releaseVal,
            targetCenter: target,
            timingProfile: 'NORMAL',
            shotMeterEnabled: true,
            isRhythmShot: false,
            rhythmTempoError: 0.2,
            isCatchAndShoot: isCatch,
            isOffDribble: !isCatch,
            contestPct: contestPct,
            stamina: shooter.render.stamina,
            adrenalinePips: shooter.render.adrenalinePips,
            difficulty: this.config.difficulty,
            userShotSlider: function() {
                var sl = _this.getSlidersForSide(shooter.render.teamSide);
                var defSl = _this.getSlidersForSide(shooter.render.teamSide === 'HOME' ? 'AWAY' : 'HOME');
                var shotTypeVal = isThree ? sl.threePt : dist <= 2.4 ? sl.insideShot : dist <= 4.2 ? sl.closeShot : sl.midRange;
                var contestPenalty = (defSl.shotContestImpact - 50) * (contestPct / 100) * 0.45;
                return Math.max(10, Math.min(95, shotTypeVal - contestPenalty));
            }()
        }, function(pl, s, id, t) {
            return _this.emitBadge(pl, s, id, t);
        });
        shooter.render.animState = dist <= 3.8 ? 'LAYUP' : 'JUMPSHOT';
        shooter.render.y = 0.52;
        shooter.actionTimer = 0.48;
        this.launchBallShot({
            shooter: shooter,
            passerId: isCatch ? shooter.lastPasserId : null,
            isThree: isThree,
            isFreeThrow: false,
            isDunk: false,
            isAlleyOop: false,
            isGreen: res.isGreen,
            willMake: res.made,
            targetHoopX: hoopX
        });
    };
    _proto.launchBallShot = function launchBallShot(opts) {
        var _ref, _ref1;
        var _this_scenarioOverride, _this_scenarioOverride1;
        var shooter = opts.shooter;
        shooter.render.hasBall = false;
        this.renderState.ball.holderPlayerId = null;
        this.renderState.ball.inFlight = true;
        this.renderState.ball.isGreenShot = opts.isGreen;
        if (!opts.isFreeThrow) {
            shooter.boxScore.fga += 1;
            if (opts.isThree) shooter.boxScore.tpa += 1;
            var distFromBaseFt = Math.max(1, Math.min(40, Math.round(Math.abs(opts.targetHoopX - shooter.render.x) * 3.281)));
            var sideFeet = Math.max(-24, Math.min(24, Math.round(shooter.render.z * 3.281)));
            this.matchShots.push({
                id: "ms_" + (this.matchShots.length + 1),
                teamSide: shooter.render.teamSide,
                shooterId: shooter.render.id,
                x: sideFeet,
                y: distFromBaseFt,
                made: opts.willMake,
                isThree: opts.isThree,
                isGreen: opts.isGreen
            });
        } else {
            shooter.boxScore.fta += 1;
        }
        var startX = shooter.render.x;
        var startY = opts.isDunk ? _courtTypes.COURT_DIMS.RIM_Y + 0.28 : 2.35;
        var startZ = shooter.render.z;
        var dist = Math.hypot(opts.targetHoopX - startX, startZ);
        var duration = opts.isDunk ? 0.24 : Math.max(0.55, Math.min(1.22, 0.48 + dist * 0.072));
        var peakHeight = opts.isDunk ? _courtTypes.COURT_DIMS.RIM_Y + 0.35 : _courtTypes.COURT_DIMS.RIM_Y + 1.15 + Math.min(2.1, dist * 0.2);
        var pointsValue = opts.isFreeThrow ? 1 : opts.isThree ? (_ref = (_this_scenarioOverride = this.scenarioOverride) == null ? void 0 : _this_scenarioOverride.threePointValue) != null ? _ref : this.isBlacktopMode() && this.settings.gameplay.blacktopScoring === '1S_2S' ? 2 : 3 : (_ref1 = (_this_scenarioOverride1 = this.scenarioOverride) == null ? void 0 : _this_scenarioOverride1.twoPointValue) != null ? _ref1 : this.isBlacktopMode() && this.settings.gameplay.blacktopScoring === '1S_2S' ? 1 : 2;
        if (opts.isGreen && !opts.isDunk) {
            this.hooks.onGreenRelease == null ? void 0 : this.hooks.onGreenRelease.call(this.hooks);
        }
        this.activeShot = {
            shooterId: shooter.render.id,
            shooterSide: shooter.render.teamSide,
            passerId: opts.passerId,
            pointsValue: pointsValue,
            isThree: opts.isThree,
            isFreeThrow: opts.isFreeThrow,
            isDunk: opts.isDunk,
            isAlleyOop: opts.isAlleyOop,
            isGreen: opts.isGreen,
            willMake: opts.willMake,
            targetHoopX: opts.targetHoopX,
            startX: startX,
            startY: startY,
            startZ: startZ,
            elapsed: 0,
            duration: duration,
            peakHeight: peakHeight,
            resolved: false,
            isReboundLive: false
        };
    };
    _proto.stepShotFlight = function stepShotFlight(dt) {
        var shot = this.activeShot;
        if (!shot) return;
        if (!shot.resolved) {
            shot.elapsed += dt;
            var t = Math.min(1, shot.elapsed / shot.duration);
            var endX = shot.willMake ? shot.targetHoopX : shot.targetHoopX + (shot.targetHoopX > 0 ? -0.26 : 0.26);
            var endZ = shot.willMake ? 0 : (Math.random() - 0.5) * 0.38;
            this.renderState.ball.x = shot.startX + (endX - shot.startX) * t;
            this.renderState.ball.z = shot.startZ + (endZ - shot.startZ) * t;
            // Quadratic arc hitting peakHeight at mid-flight and rim height at t=1
            var baseY = shot.startY + (_courtTypes.COURT_DIMS.RIM_Y - shot.startY) * t;
            var arcBoost = 4 * (shot.peakHeight - (shot.startY + _courtTypes.COURT_DIMS.RIM_Y) * 0.5) * t * (1 - t);
            this.renderState.ball.y = baseY + Math.max(0, arcBoost);
            this.renderState.ball.spinX += dt * 16;
            if (t >= 1) {
                shot.resolved = true;
                this.onShotReachedRim(shot);
            }
            return;
        }
        // Post-rim physics (dropped through net OR physical rebound carom)
        if (shot.isReboundLive) {
            this.renderState.ball.vy += GRAVITY * dt;
            this.renderState.ball.x += this.renderState.ball.vx * dt;
            this.renderState.ball.y += this.renderState.ball.vy * dt;
            this.renderState.ball.z += this.renderState.ball.vz * dt;
            if (this.renderState.ball.y <= _courtTypes.COURT_DIMS.BALL_RADIUS) {
                this.renderState.ball.y = _courtTypes.COURT_DIMS.BALL_RADIUS;
                this.renderState.ball.vy = Math.abs(this.renderState.ball.vy) * 0.58;
                this.renderState.ball.vx *= 0.84;
                this.renderState.ball.vz *= 0.84;
            }
            // Clamp rebound inside playable floor so ball never escapes
            this.renderState.ball.x = Math.max(-_courtTypes.COURT_DIMS.HALF_LENGTH + 0.6, Math.min(_courtTypes.COURT_DIMS.HALF_LENGTH - 0.6, this.renderState.ball.x));
            this.renderState.ball.z = Math.max(-_courtTypes.COURT_DIMS.HALF_WIDTH + 0.6, Math.min(_courtTypes.COURT_DIMS.HALF_WIDTH - 0.6, this.renderState.ball.z));
        }
    };
    _proto.onShotReachedRim = function onShotReachedRim(shot) {
        var isRightHoop = shot.targetHoopX > 0;
        var shooter = this.actorMap.get(shot.shooterId);
        if (shot.willMake) {
            // SWISH OR POSTER SLAM!
            if (isRightHoop) {
                this.renderState.hoops.rightNetRipple = 1.0;
                if (shot.isDunk) this.renderState.hoops.rightRimFlex = 1.0;
            } else {
                this.renderState.hoops.leftNetRipple = 1.0;
                if (shot.isDunk) this.renderState.hoops.leftRimFlex = 1.0;
            }
            if (shot.shooterSide === 'HOME') {
                this.renderState.homeScore += shot.pointsValue;
            } else {
                this.renderState.awayScore += shot.pointsValue;
            }
            // Plus/Minus update across active floor units
            for(var i = 0; i < this.actors.length; i++){
                var ac = this.actors[i];
                ac.boxScore.plusMinus += ac.render.teamSide === shot.shooterSide ? shot.pointsValue : -shot.pointsValue;
            }
            // Team comparison buckets (Paint, Fast Break, 2nd Chance, Bench)
            var shotDistM = Math.hypot(shot.targetHoopX - shot.startX, shot.startZ);
            var isHome = shot.shooterSide === 'HOME';
            if (!shot.isFreeThrow && (shot.isDunk || shotDistM <= 3.9)) {
                if (isHome) this.teamComp.homePaintPts += shot.pointsValue;
                else this.teamComp.awayPaintPts += shot.pointsValue;
            }
            if (!shot.isFreeThrow && this.possessionElapsedSec <= 5.5) {
                if (isHome) this.teamComp.homeFastBreakPts += shot.pointsValue;
                else this.teamComp.awayFastBreakPts += shot.pointsValue;
            }
            if (!shot.isFreeThrow && this.lastPossessionWasOffReb) {
                if (isHome) this.teamComp.homeSecondChancePts += shot.pointsValue;
                else this.teamComp.awaySecondChancePts += shot.pointsValue;
            }
            this.lastPossessionWasOffReb = false;
            if (shooter) {
                shooter.boxScore.pts += shot.pointsValue;
                if (shot.isFreeThrow) {
                    shooter.boxScore.ftm += 1;
                } else {
                    shooter.boxScore.fgm += 1;
                    if (shot.isThree) shooter.boxScore.tpm += 1;
                    if (shot.isGreen) {
                        shooter.boxScore.greens += 1;
                        if (shot.isThree) shooter.boxScore.greenThrees += 1;
                    }
                }
                (0, _BadgeEngine.addTakeoverProgress)(shooter.takeover, shot.isDunk ? 24 : shot.isGreen ? 20 : 14);
            }
            if (shot.passerId && shot.passerId !== shot.shooterId) {
                var passer = this.actorMap.get(shot.passerId);
                if (passer) {
                    passer.boxScore.ast += 1;
                    (0, _BadgeEngine.addTakeoverProgress)(passer.takeover, 12);
                    if (this.userTeamSide && passer.render.teamSide === this.userTeamSide) {
                        this.addGradeEvent('+Assist', 6);
                    }
                }
            }
            if (this.userTeamSide && shot.shooterSide === this.userTeamSide) {
                this.addGradeEvent(shot.isGreen ? '+Good Shot Selection' : '+Made Basket', shot.isGreen ? 6 : 4);
                if (this.pickAndRoll.screenAssistWindowSec > 0) {
                    this.addGradeEvent('+Screen Assist', 5);
                    this.pickAndRoll.screenAssistWindowSec = 0;
                }
            } else if (this.userTeamSide && shot.shooterSide !== this.userTeamSide) {
                this.addGradeEvent('-Defensive Breakdown', -4);
            }
            if (shot.isDunk) {
                var _ref;
                if (this.settings.camera.dunkCameraShake) {
                    this.renderState.cameraShake = 0.85;
                }
                this.hooks.onDunkSlam == null ? void 0 : this.hooks.onDunkSlam.call(this.hooks);
                this.hooks.onCrowdRoar == null ? void 0 : this.hooks.onCrowdRoar.call(this.hooks, 0.95);
                this.renderState.crowdExcitement = 0.95;
                this.renderState.lastEventLabel = shot.isAlleyOop ? "\uD83D\uDCA5 ALLEY-OOP SLAM! +" + shot.pointsValue : "\uD83D\uDCA5 POSTER DUNK! +" + shot.pointsValue;
                this.pushSplashBanner(shot.isAlleyOop ? 'ALLEY-OOP SLAM!' : 'POSTER DUNK!', ((_ref = shooter == null ? void 0 : shooter.render.lastName.toUpperCase()) != null ? _ref : 'STAR') + " +" + shot.pointsValue, 'FIRE', 2.0);
            } else {
                this.hooks.onSwish == null ? void 0 : this.hooks.onSwish.call(this.hooks, this.isOutdoorChainNet);
                this.hooks.onCrowdRoar == null ? void 0 : this.hooks.onCrowdRoar.call(this.hooks, shot.isThree ? 0.82 : 0.55);
                this.renderState.crowdExcitement = Math.min(1, this.renderState.crowdExcitement + 0.25);
                this.renderState.lastEventLabel = shot.isGreen ? "\uD83D\uDC9A GREEN LIGHT! +" + shot.pointsValue : "BUCKET! +" + shot.pointsValue;
                if (shot.isGreen) {
                    var _ref1;
                    this.pushSplashBanner(shot.isThree ? '3-POINT SPLASH!' : 'GREEN RELEASE!', ((_ref1 = shooter == null ? void 0 : shooter.render.lastName.toUpperCase()) != null ? _ref1 : 'SHOOTER') + " \xb7 EXCELLENT +" + shot.pointsValue, 'GREEN', 1.8);
                } else if (shot.isThree) {
                    var _ref2;
                    this.pushSplashBanner('3-POINT SPLASH!', "" + ((_ref2 = shooter == null ? void 0 : shooter.render.lastName.toUpperCase()) != null ? _ref2 : 'SHOOTER') + " FROM DEEP", 'CYAN', 1.7);
                }
            }
            this.activeShot = null;
            // Check Blacktop target score win condition
            if (this.checkBlacktopWin()) return;
            if (shot.isFreeThrow && this.activeFreeThrow) {
                this.advanceFreeThrowSequence(true);
                return;
            }
            var nextSide = this.isBlacktopMode() && this.settings.gameplay.blacktopMakeItTakeIt ? shot.shooterSide : shot.shooterSide === 'HOME' ? 'AWAY' : 'HOME';
            if (this.isBlacktopMode()) {
                this.startCheckBall(nextSide, 'CHECK BALL');
            } else {
                this.startInbound(nextSide, 'INBOUND PASS');
            }
        } else {
            // MISS -> Physical Rim / Backboard Carom Rebound!
            this.hooks.onRimClank == null ? void 0 : this.hooks.onRimClank.call(this.hooks);
            if (shooter) (0, _BadgeEngine.addTakeoverProgress)(shooter.takeover, -6);
            if (shot.isFreeThrow && this.activeFreeThrow && this.activeFreeThrow.shotsRemaining > 1) {
                this.activeShot = null;
                this.advanceFreeThrowSequence(false);
                return;
            }
            // Final FT miss or live FG miss -> live carom rebound!
            if (shot.isFreeThrow) {
                this.activeFreeThrow = null;
                this.phase = 'LIVE';
            }
            shot.isReboundLive = true;
            var bounceDir = isRightHoop ? -1 : 1;
            this.renderState.ball.vx = bounceDir * (2.2 + Math.random() * 2.6);
            this.renderState.ball.vy = 2.6 + Math.random() * 1.9;
            this.renderState.ball.vz = (Math.random() - 0.5) * 4.2;
            this.renderState.lastEventLabel = 'CLANK! BATTLE FOR THE REBOUND [L]!';
        }
    };
    // ==========================================================================
    // PASSING, WRAP PASSES, ALLEY-OOPS, DRIBBLING, STEALS, BLOCKS & REBOUNDS
    // ==========================================================================
    _proto.findBestPassTarget = function findBestPassTarget(handler) {
        var mates = this.getSideActors(handler.render.teamSide).filter(function(m) {
            return m.render.id !== handler.render.id;
        });
        if (mates.length === 0) return null;
        var aimX = Math.abs(this.input.moveX) > 0.1 || Math.abs(this.input.moveZ) > 0.1 ? this.input.moveX : Math.cos(handler.render.facingRad);
        var aimZ = Math.abs(this.input.moveX) > 0.1 || Math.abs(this.input.moveZ) > 0.1 ? this.input.moveZ : Math.sin(handler.render.facingRad);
        var aimLen = Math.max(0.01, Math.hypot(aimX, aimZ));
        var best = mates[0];
        var bestScore = -999;
        for(var i = 0; i < mates.length; i++){
            var m = mates[i];
            var dx = m.render.x - handler.render.x;
            var dz = m.render.z - handler.render.z;
            var dist = Math.max(0.5, Math.hypot(dx, dz));
            var dot = (dx * aimX + dz * aimZ) / (dist * aimLen);
            var score = dot * 3.0 - dist * 0.08;
            if (score > bestScore) {
                bestScore = score;
                best = m;
            }
        }
        return best;
    };
    _proto.executePass = function executePass(passer, receiver, kind) {
        var _this = this;
        passer.render.hasBall = false;
        this.renderState.ball.holderPlayerId = null;
        this.renderState.ball.inFlight = true;
        this.iconPassingActive = false;
        var isOutlet = Math.hypot(receiver.render.x - passer.render.x, receiver.render.z - passer.render.z) > 10.5;
        var pBadges = (0, _BadgeEngine.evaluatePassBadges)(passer.profile, passer.render.teamSide, kind === 'ALLEY_OOP' || kind === 'WRAP', isOutlet, function(pl, s, id, t) {
            return _this.emitBadge(pl, s, id, t);
        });
        var hoopX = this.getAttackDirForSide(passer.render.teamSide) * _courtTypes.COURT_DIMS.RIM_X;
        var targetX = kind === 'ALLEY_OOP' ? hoopX - this.getAttackDirForSide(passer.render.teamSide) * 1.15 : receiver.render.x;
        var targetZ = kind === 'ALLEY_OOP' ? Math.max(-0.85, Math.min(0.85, receiver.render.z * 0.4)) : receiver.render.z;
        var dist = Math.hypot(targetX - passer.render.x, targetZ - passer.render.z);
        var speed = (kind === 'ALLEY_OOP' ? 10.5 : 15.8) * pBadges.passSpeedMul;
        var duration = Math.max(0.22, Math.min(kind === 'ALLEY_OOP' ? 0.95 : 0.65, dist / speed));
        var keys = [
            'A',
            'B',
            'X',
            'Y'
        ];
        var promptKey = keys[Math.floor(Math.random() * keys.length)];
        var diff = _AISystem.DIFFICULTY_PROFILES[this.config.difficulty];
        var requiresPrompt = kind === 'ALLEY_OOP' && diff.requiresInteractiveFinishPrompts && passer.render.teamSide === this.userTeamSide;
        if (kind === 'ALLEY_OOP') {
            this.renderState.lastEventLabel = requiresPrompt ? "ALLEY-OOP LOB! PRESS [" + promptKey + "] OR TAP TO SLAM!" : 'ALLEY-OOP LOB IN THE AIR!';
        } else if (kind === 'WRAP') {
            this.renderState.lastEventLabel = "WRAP PASS BY " + passer.render.lastName.toUpperCase() + "!";
        }
        this.activePass = {
            passerId: passer.render.id,
            receiverId: receiver.render.id,
            passerSide: passer.render.teamSide,
            kind: kind,
            startX: passer.render.x,
            startY: 1.45,
            startZ: passer.render.z,
            targetX: targetX,
            targetY: kind === 'ALLEY_OOP' ? _courtTypes.COURT_DIMS.RIM_Y + 0.4 : 1.42,
            targetZ: targetZ,
            elapsed: 0,
            duration: duration,
            alleyOopKey: promptKey,
            alleyOopPressed: false,
            alleyOopSucceeded: !requiresPrompt,
            requiresPrompt: requiresPrompt
        };
    };
    _proto.stepPassFlight = function stepPassFlight(dt) {
        var _this = this;
        var pass = this.activePass;
        if (!pass) return;
        pass.elapsed += dt;
        var t = Math.min(1, pass.elapsed / pass.duration);
        var receiver = this.actorMap.get(pass.receiverId);
        // Track moving receiver smoothly for non-lob passes; pull receiver to rim on alley-oops
        if (receiver) {
            if (pass.kind === 'ALLEY_OOP') {
                receiver.render.x += (pass.targetX - receiver.render.x) * Math.min(1, dt * 7);
                receiver.render.z += (pass.targetZ - receiver.render.z) * Math.min(1, dt * 7);
                if (t > 0.55) {
                    receiver.render.y = Math.sin((t - 0.55) / 0.45 * Math.PI * 0.65) * 1.15;
                    receiver.render.animState = 'DUNK';
                }
            } else {
                pass.targetX = receiver.render.x;
                pass.targetZ = receiver.render.z;
            }
        }
        this.renderState.ball.x = pass.startX + (pass.targetX - pass.startX) * t;
        this.renderState.ball.z = pass.startZ + (pass.targetZ - pass.startZ) * t;
        if (pass.kind === 'BOUNCE') {
            this.renderState.ball.y = t < 0.55 ? 1.35 * (1 - t / 0.55) + 0.14 : 0.14 + (t - 0.55) / 0.45 * 1.2;
        } else if (pass.kind === 'ALLEY_OOP') {
            this.renderState.ball.y = pass.startY + (pass.targetY - pass.startY) * t + Math.sin(t * Math.PI) * 1.85;
        } else {
            this.renderState.ball.y = 1.42 + Math.sin(t * Math.PI) * 0.35;
        }
        if (t >= 1) {
            this.activePass = null;
            if (!receiver) return;
            if (pass.kind === 'ALLEY_OOP') {
                var hoopX = this.getAttackDirForSide(receiver.render.teamSide) * _courtTypes.COURT_DIMS.RIM_X;
                var nearestDef = this.findClosestOpponent(receiver);
                var fin = (0, _BadgeEngine.evaluateFinishingBadges)({
                    finisher: receiver.profile,
                    finisherSide: receiver.render.teamSide,
                    defender: nearestDef && nearestDef.dist < 2.2 ? nearestDef.actor.profile : null,
                    defenderSide: receiver.render.teamSide === 'HOME' ? 'AWAY' : 'HOME',
                    moveKind: 'ALLEY_OOP',
                    hasContact: Boolean(nearestDef && nearestDef.dist < 2.0),
                    isChaseDown: false
                }, function(pl, s, id, tier) {
                    return _this.emitBadge(pl, s, id, tier);
                });
                var willMake = pass.alleyOopSucceeded && Math.random() <= Math.min(0.95, 0.72 + fin.finishBonus);
                this.selectUserControlledPlayer(receiver.render.teamSide === this.userTeamSide ? receiver : this.getControlledActor());
                this.launchBallShot({
                    shooter: receiver,
                    passerId: pass.passerId,
                    isThree: false,
                    isFreeThrow: false,
                    isDunk: true,
                    isAlleyOop: true,
                    isGreen: willMake,
                    willMake: willMake,
                    targetHoopX: hoopX
                });
                return;
            }
            receiver.lastCatchTime = this.simTimeSec;
            receiver.lastPasserId = pass.passerId;
            this.grantPossession(receiver, false);
        }
    };
    _proto.performDribbleMove = function performDribbleMove(handler, move) {
        var _this = this;
        if (handler.dribbleCooldown > 0) return;
        var launch = (0, _BadgeEngine.evaluateFirstStepLaunch)(handler.profile, handler.render.teamSide, function(pl, s, id, t) {
            return _this.emitBadge(pl, s, id, t);
        });
        handler.dribbleCooldown = 0.58;
        handler.render.adrenalinePips = Math.max(0, handler.render.adrenalinePips - 1);
        if (this.settings.gameplay.fatigue) {
            handler.render.stamina = Math.max(0.1, handler.render.stamina - 0.05 * launch.adrenalineDrainMul);
        }
        this.renderState.ball.dribbleHand = this.renderState.ball.dribbleHand === 'right' ? 'left' : 'right';
        var attackDir = this.getAttackDirForSide(handler.render.teamSide);
        if (move === 'STEPBACK') {
            handler.render.animState = 'STEPBACK';
            handler.render.x -= attackDir * 1.15;
        } else {
            handler.render.animState = 'CROSSOVER';
            handler.render.z += (this.renderState.ball.dribbleHand === 'right' ? 1 : -1) * 0.95;
        }
        handler.actionTimer = 0.34;
        this.hooks.onDribble == null ? void 0 : this.hooks.onDribble.call(this.hooks);
        // Check Ankle Assassin stun against closest defender!
        var nearestDef = this.findClosestOpponent(handler);
        if (nearestDef && nearestDef.dist <= 2.15) {
            var ab = (0, _BadgeEngine.evaluateAnkleBreaker)(handler.profile, handler.render.teamSide, nearestDef.actor.profile, function(pl, s, id, t) {
                return _this.emitBadge(pl, s, id, t);
            });
            if (Math.random() <= ab.stunChance) {
                nearestDef.actor.stunTimer = 1.35;
                nearestDef.actor.render.animState = 'ANKLE_BROKEN_STUMBLE';
                (0, _BadgeEngine.addTakeoverProgress)(handler.takeover, 15);
                this.hooks.onCrowdRoar == null ? void 0 : this.hooks.onCrowdRoar.call(this.hooks, 0.8);
                this.renderState.lastEventLabel = "\uD83D\uDD25 ANKLE BREAKER BY " + handler.render.lastName.toUpperCase() + "!";
                this.pushSplashBanner('ANKLE BREAKER!', "" + handler.render.lastName.toUpperCase() + " DROPPED THE DEFENDER", 'FIRE', 1.9);
                if (this.userTeamSide && handler.render.teamSide === this.userTeamSide) {
                    this.addGradeEvent('+Ankle Breaker', 5);
                }
            }
        }
    };
    _proto.performStealCheck = function performStealCheck(defender, handler) {
        var _this = this;
        var dist = Math.hypot(defender.render.x - handler.render.x, defender.render.z - handler.render.z);
        if (dist > 1.75) return;
        defender.stealCooldown = 0.72;
        var isQuickProtect = handler.render.animState === 'QUICK_PROTECT';
        var res = (0, _BadgeEngine.evaluateStealAttempt)(defender.profile, defender.render.teamSide, handler.profile, handler.render.teamSide, false, isQuickProtect, function(pl, s, id, t) {
            return _this.emitBadge(pl, s, id, t);
        });
        var defSl = this.getSlidersForSide(defender.render.teamSide);
        var offSl = this.getSlidersForSide(handler.render.teamSide);
        var stealScale = Math.max(0.25, Math.min(2.1, defSl.stealSuccess / 50 * (1.5 - offSl.ballSecurity / 100)));
        var foulScale = this.settings.gameplay.reachInFouls === false ? 0 : Math.max(0, Math.min(2.0, defSl.foulFrequency / 50));
        var adjStealChance = Math.min(0.85, res.stealChance * stealScale);
        var adjFoulChance = Math.min(0.65, res.foulChance * foulScale);
        var roll = Math.random();
        if (roll <= adjStealChance) {
            defender.boxScore.stl += 1;
            handler.boxScore.turnovers += 1;
            if (handler.render.teamSide === 'HOME') this.teamComp.homeTurnovers += 1;
            else this.teamComp.awayTurnovers += 1;
            (0, _BadgeEngine.addTakeoverProgress)(defender.takeover, 18);
            (0, _BadgeEngine.addTakeoverProgress)(handler.takeover, -10);
            this.grantPossession(defender, true);
            this.renderState.lastEventLabel = "STRIP STEAL BY " + defender.render.lastName.toUpperCase() + "!";
            this.hooks.onCrowdRoar == null ? void 0 : this.hooks.onCrowdRoar.call(this.hooks, 0.75);
            return;
        }
        if (roll <= adjStealChance + adjFoulChance) {
            if (isQuickProtect && Math.random() < 0.55) {
                // 2K26 Quick Protect traps steal-spammer in Defender Jail!
                defender.stunTimer = 1.1;
                this.renderState.lastEventLabel = "QUICK PROTECT! " + defender.render.lastName.toUpperCase() + " IN DEFENDER JAIL!";
            } else {
                this.callFoul(defender, handler, false, 0);
            }
        }
    };
    _proto.attemptBlockOnShooter = function attemptBlockOnShooter(defender, shooter) {
        var _this = this;
        var dist = Math.hypot(defender.render.x - shooter.render.x, defender.render.z - shooter.render.z);
        if (dist > 2.2) return;
        var fin = (0, _BadgeEngine.evaluateFinishingBadges)({
            finisher: shooter.profile,
            finisherSide: shooter.render.teamSide,
            defender: defender.profile,
            defenderSide: defender.render.teamSide,
            moveKind: 'STANDARD_LAYUP',
            hasContact: true,
            isChaseDown: defender.render.speed > 5.0
        }, function(pl, s, id, t) {
            return _this.emitBadge(pl, s, id, t);
        });
        var blkRating = (0, _BadgeEngine.getEffectiveAttribute)(defender.profile, defender.takeover, 'block');
        var defSliders = this.getSlidersForSide(defender.render.teamSide);
        var blkSliderMod = (defSliders.blockFrequency - 50) * 0.0045;
        var chance = Math.max(0.04, Math.min(0.68, 0.14 + (blkRating - 60) / 39 * 0.22 + fin.blockBonus * 0.5 + blkSliderMod));
        if (Math.random() <= chance) {
            this.shotChargeActive = false;
            this.activeShot = null;
            defender.boxScore.blk += 1;
            (0, _BadgeEngine.addTakeoverProgress)(defender.takeover, 20);
            this.grantPossession(defender, true);
            this.renderState.lastEventLabel = "\uD83D\uDEAB SWAT BLOCK BY " + defender.render.lastName.toUpperCase() + "!";
            if (this.userTeamSide && defender.render.teamSide === this.userTeamSide) {
                this.addGradeEvent('+Good Shot Contest', 7);
            }
            this.hooks.onCrowdRoar == null ? void 0 : this.hooks.onCrowdRoar.call(this.hooks, 0.88);
        }
    };
    _proto.triggerDefenderPumpFakeBite = function triggerDefenderPumpFakeBite(handler) {
        var nearestDef = this.findClosestOpponent(handler);
        if (!nearestDef || nearestDef.dist > 2.2) return;
        if (nearestDef.actor.render.animState === 'HANDS_UP_CONTEST') {
            // Hands-up defense NEVER bites on pump fakes!
            return;
        }
        if (!nearestDef.actor.render.isUserControlled && Math.random() < 0.45) {
            nearestDef.actor.render.animState = 'JUMP_BLOCK';
            nearestDef.actor.render.y = 0.7;
            nearestDef.actor.stunTimer = 0.65;
        }
    };
    _proto.attemptUserReboundSnag = function attemptUserReboundSnag() {
        var _this = this;
        var ctrl = this.getControlledActor();
        if (!ctrl || !this.activeShot || !this.activeShot.isReboundLive) return;
        var badges = (0, _BadgeEngine.evaluateReboundBadges)(ctrl.profile, ctrl.render.teamSide, this.input.quickProtectOrIntenseD, ctrl.jumpCountInPaint > 0, function(pl, s, id, t) {
            return _this.emitBadge(pl, s, id, t);
        });
        var dist = Math.hypot(ctrl.render.x - this.renderState.ball.x, ctrl.render.z - this.renderState.ball.z);
        ctrl.render.animState = 'REBOUND_SNAG';
        ctrl.render.y = 0.72;
        ctrl.jumpCountInPaint += 1;
        if (dist <= 1.85 + badges.reachBonusM && this.renderState.ball.y <= 3.35) {
            this.resolveReboundBattle(ctrl);
        }
    };
    _proto.resolveReboundBattle = function resolveReboundBattle(winner) {
        if (!this.activeShot) return;
        var wasOffReb = winner.render.teamSide === this.activeShot.shooterSide;
        this.activeShot = null;
        winner.boxScore.reb += 1;
        winner.render.animState = 'REBOUND_SNAG';
        winner.actionTimer = 0.32;
        (0, _BadgeEngine.addTakeoverProgress)(winner.takeover, wasOffReb ? 14 : 10);
        this.grantPossession(winner, !wasOffReb);
        this.lastPossessionWasOffReb = wasOffReb;
        if (wasOffReb) {
            // NBA rule: Offensive Rebound resets shot clock to 14 seconds!
            this.renderState.shotClockSec = Math.max(this.renderState.shotClockSec, 14);
            this.renderState.lastEventLabel = "OFFENSIVE REBOUND (" + winner.render.lastName.toUpperCase() + ") \xb7 14s RESET!";
        } else {
            this.renderState.lastEventLabel = "DEFENSIVE BOARD BY " + winner.render.lastName.toUpperCase() + "!";
        }
    };
    // ==========================================================================
    // FOULS, BONUS FREE THROWS, TURNOVERS, QUARTERS, HALFTIME & BLACKTOP RULES
    // ==========================================================================
    _proto.callFoul = function callFoul(fouler, victim, isShootingFoul, ftCount) {
        fouler.boxScore.fouls += 1;
        if (fouler.render.teamSide === 'HOME') this.homeFoulsQtr += 1;
        else this.awayFoulsQtr += 1;
        var foulerTeamFouls = fouler.render.teamSide === 'HOME' ? this.homeFoulsQtr : this.awayFoulsQtr;
        var inBonus = !this.isBlacktopMode() && foulerTeamFouls >= 5;
        this.shotChargeActive = false;
        this.activePass = null;
        this.activeShot = null;
        this.hooks.onWhistle == null ? void 0 : this.hooks.onWhistle.call(this.hooks);
        if (!this.isBlacktopMode() && (isShootingFoul || inBonus)) {
            var shots = isShootingFoul ? Math.max(2, ftCount) : 2;
            this.startFreeThrowSequence(victim, shots, inBonus && !isShootingFoul);
            return;
        }
        // Non-shooting foul: reset shot clock to at least 14s and inbound/check-ball
        this.renderState.shotClockSec = Math.max(this.renderState.shotClockSec, 14);
        if (this.isBlacktopMode()) {
            this.startCheckBall(victim.render.teamSide, 'REACH-IN FOUL · CHECK BALL');
        } else {
            this.startInbound(victim.render.teamSide, 'REACH-IN FOUL · 14s RESET');
        }
    };
    _proto.startFreeThrowSequence = function startFreeThrowSequence(shooter, count, isBonus) {
        this.phase = 'FREE_THROW';
        var dir = this.getAttackDirForSide(shooter.render.teamSide);
        var ftLineX = dir * _courtTypes.COURT_DIMS.FREE_THROW_X;
        // Position shooter at FT line and teammates/defenders along lane
        shooter.render.x = ftLineX;
        shooter.render.z = 0;
        shooter.render.facingRad = dir === 1 ? 0 : Math.PI;
        shooter.render.animState = 'IDLE';
        var others = this.actors.filter(function(a) {
            return a.render.id !== shooter.render.id;
        });
        for(var i = 0; i < others.length; i++){
            var a = others[i];
            var sideSign = i % 2 === 0 ? -1 : 1;
            a.render.x = dir * (_courtTypes.COURT_DIMS.RIM_X - 1.5 - Math.floor(i / 2) * 1.05);
            a.render.z = sideSign * (_courtTypes.COURT_DIMS.KEY_HALF_WIDTH + 0.35);
            a.render.facingRad = Math.atan2(-a.render.z, dir * _courtTypes.COURT_DIMS.RIM_X - a.render.x);
            a.render.animState = 'IDLE';
            a.render.hasBall = false;
        }
        this.grantPossession(shooter, false);
        this.activeFreeThrow = {
            shooterId: shooter.render.id,
            side: shooter.render.teamSide,
            shotsRemaining: count,
            totalShots: count,
            meterActive: true,
            meterProgress: 0.15,
            meterDir: 1,
            waitingFlight: false,
            aiReleaseTimer: 0.9
        };
        this.renderState.lastEventLabel = isBonus ? "TEAM BONUS! " + shooter.render.lastName.toUpperCase() + " AT THE LINE (" + count + " FTs)" : "SHOOTING FOUL! " + shooter.render.lastName.toUpperCase() + " SHOOTS " + count + " FTs";
    };
    _proto.stepFreeThrow = function stepFreeThrow(dt) {
        var ft = this.activeFreeThrow;
        if (!ft) {
            this.phase = 'LIVE';
            return;
        }
        if (ft.waitingFlight) {
            this.stepShotFlight(dt);
            return;
        }
        // Oscillate Free Throw bar cleanly
        ft.meterProgress += ft.meterDir * dt * 0.95;
        if (ft.meterProgress >= 1) {
            ft.meterProgress = 1;
            ft.meterDir = -1;
        } else if (ft.meterProgress <= 0) {
            ft.meterProgress = 0;
            ft.meterDir = 1;
        }
        var isUserShooter = this.userTeamSide === ft.side;
        if (isUserShooter) {
            if (this.input.shootHeld && !this.prevShootHeld) {
                this.executeFreeThrowRelease(ft.meterProgress);
            }
        } else {
            ft.aiReleaseTimer -= dt;
            if (ft.aiReleaseTimer <= 0) {
                var _ref;
                var shooter = this.actorMap.get(ft.shooterId);
                var ftAttr = (_ref = shooter == null ? void 0 : shooter.profile.attributes.freeThrow) != null ? _ref : 75;
                var make = Math.random() <= 0.45 + ftAttr / 100 * 0.48;
                this.executeFreeThrowRelease(make ? 0.72 : 0.35);
            }
        }
    };
    _proto.executeFreeThrowRelease = function executeFreeThrowRelease(meterValue) {
        var ft = this.activeFreeThrow;
        if (!ft) return;
        var shooter = this.actorMap.get(ft.shooterId);
        if (!shooter) return;
        var ftAttr = (0, _BadgeEngine.getEffectiveAttribute)(shooter.profile, shooter.takeover, 'freeThrow');
        var halfW = 0.075 + (ftAttr - 50) / 49 * 0.085;
        var err = Math.abs(meterValue - 0.72);
        var isGreen = err <= halfW;
        var made = isGreen || err <= halfW * 1.8 && Math.random() <= ftAttr / 120;
        ft.meterActive = false;
        ft.waitingFlight = true;
        shooter.render.animState = 'JUMPSHOT';
        this.shotFeedback = {
            timingLabel: isGreen ? 'FREE THROW · GREEN' : made ? 'FREE THROW GOOD' : 'FREE THROW MISS',
            rhythmLabel: null,
            contestLabel: 'At The Line',
            contestPct: 0,
            isGreen: isGreen,
            made: made,
            ttlSec: 2.2
        };
        var hoopX = this.getAttackDirForSide(shooter.render.teamSide) * _courtTypes.COURT_DIMS.RIM_X;
        this.launchBallShot({
            shooter: shooter,
            passerId: null,
            isThree: false,
            isFreeThrow: true,
            isDunk: false,
            isAlleyOop: false,
            isGreen: isGreen,
            willMake: made,
            targetHoopX: hoopX
        });
    };
    _proto.advanceFreeThrowSequence = function advanceFreeThrowSequence(_lastMade) {
        var ft = this.activeFreeThrow;
        if (!ft) return;
        ft.shotsRemaining -= 1;
        if (ft.shotsRemaining > 0) {
            ft.meterActive = true;
            ft.meterProgress = 0.15;
            ft.meterDir = 1;
            ft.waitingFlight = false;
            ft.aiReleaseTimer = 0.85;
            var shooter = this.actorMap.get(ft.shooterId);
            if (shooter) this.grantPossession(shooter, false);
            return;
        }
        var opp = ft.side === 'HOME' ? 'AWAY' : 'HOME';
        this.activeFreeThrow = null;
        this.startInbound(opp, 'INBOUND PASS');
    };
    _proto.handleTurnover = function handleTurnover(reason, whistle) {
        this.shotChargeActive = false;
        this.activePass = null;
        this.activeShot = null;
        this.cancelPickAndRoll();
        if (this.userTeamSide && this.renderState.possession === this.userTeamSide) {
            this.addGradeEvent('-Turnover', -6);
        }
        if (reason.includes('SHOT CLOCK')) {
            this.pushSplashBanner('SHOT CLOCK VIOLATION', '24 SECONDS EXPIRED · TURNOVER', 'CRIMSON', 2.0);
        }
        if (whistle) this.hooks.onWhistle == null ? void 0 : this.hooks.onWhistle.call(this.hooks);
        var nextSide = this.renderState.possession === 'HOME' ? 'AWAY' : 'HOME';
        if (this.isBlacktopMode()) {
            this.startCheckBall(nextSide, reason);
        } else {
            this.startInbound(nextSide, reason);
        }
    };
    _proto.startInbound = function startInbound(side, label) {
        this.phase = 'INBOUND';
        this.phaseTimer = 0.85;
        this.nextInboundSide = side;
        this.pendingCheckBall = false;
        this.renderState.lastEventLabel = label;
    };
    _proto.startCheckBall = function startCheckBall(side, label) {
        this.phase = 'CHECK_BALL';
        this.phaseTimer = 0.75;
        this.nextInboundSide = side;
        this.pendingCheckBall = true;
        this.renderState.lastEventLabel = label;
    };
    _proto.stepDeadBallReset = function stepDeadBallReset(dt) {
        this.phaseTimer -= dt;
        if (this.phaseTimer > 0) return;
        var side = this.nextInboundSide;
        var offActors = this.getSideActors(side);
        var defActors = this.getSideActors(side === 'HOME' ? 'AWAY' : 'HOME');
        var dir = this.getAttackDirForSide(side);
        if (this.pendingCheckBall) {
            // Half-court streetball check-ball at top of the key (+X hoop)
            for(var i = 0; i < offActors.length; i++){
                offActors[i].render.x = 4.6 + (i === 0 ? 0 : 1.6);
                offActors[i].render.z = i === 0 ? 0 : i % 2 === 1 ? -4.5 : 4.5;
                offActors[i].render.animState = 'IDLE';
            }
            for(var i1 = 0; i1 < defActors.length; i1++){
                defActors[i1].render.x = offActors[i1] ? offActors[i1].render.x + 1.5 : 6.4;
                defActors[i1].render.z = offActors[i1] ? offActors[i1].render.z : 0;
                defActors[i1].render.animState = 'DEFENSIVE_SLIDE';
            }
            this.crossedHalfCourt = true;
        } else {
            // Regulation inbound from backcourt baseline
            var baseX = -dir * 11.2;
            for(var i2 = 0; i2 < offActors.length; i2++){
                offActors[i2].render.x = baseX + dir * (i2 * 2.1);
                offActors[i2].render.z = (i2 - 2) * 2.2;
                offActors[i2].render.animState = 'IDLE';
            }
            for(var i3 = 0; i3 < defActors.length; i3++){
                defActors[i3].render.x = baseX + dir * (3.6 + i3 * 1.9);
                defActors[i3].render.z = (i3 - 2) * 2.0;
                defActors[i3].render.animState = 'DEFENSIVE_SLIDE';
            }
            this.crossedHalfCourt = false;
        }
        this.grantPossession(offActors[0], true);
        this.phase = 'LIVE';
    };
    _proto.handleQuarterEnd = function handleQuarterEnd() {
        this.hooks.onBuzzer == null ? void 0 : this.hooks.onBuzzer.call(this.hooks);
        this.renderState.hoops.buzzerLit = true;
        this.shotChargeActive = false;
        this.activePass = null;
        this.activeShot = null;
        if (this.renderState.quarter >= 4 && this.renderState.homeScore !== this.renderState.awayScore) {
            this.finishMatch(this.renderState.homeScore > this.renderState.awayScore ? 'HOME' : 'AWAY');
            return;
        }
        this.renderState.quarter += 1;
        this.homeFoulsQtr = 0;
        this.awayFoulsQtr = 0;
        var isOT = this.renderState.quarter >= 5;
        this.renderState.quarterClockSec = isOT ? 120 : this.config.quarterLengthMin * 60;
        this.renderState.shotClockSec = 24;
        if (this.renderState.quarter === 3) {
            this.halftimeSwapped = true;
            this.phase = 'HALFTIME_SWAP';
            this.phaseTimer = 1.45;
            this.renderState.lastEventLabel = 'HALFTIME · TEAMS SWAP SIDES!';
            this.pushSplashBanner('HALFTIME', this.awayTeam.abbr + " " + this.renderState.awayScore + " - " + this.homeTeam.abbr + " " + this.renderState.homeScore, 'GOLD', 2.2);
            this.hooks.onAnnounce == null ? void 0 : this.hooks.onAnnounce.call(this.hooks, 'Halftime! Teams switch ends for the second half.');
        } else {
            this.phase = 'QUARTER_BREAK';
            this.phaseTimer = 1.25;
            this.renderState.lastEventLabel = isOT ? "OVERTIME " + (this.renderState.quarter - 4) + "!" : "START OF Q" + this.renderState.quarter + "!";
            this.pushSplashBanner('QUARTER END', this.renderState.lastEventLabel, 'GOLD', 2.0);
        }
    };
    _proto.stepQuarterBreak = function stepQuarterBreak(dt) {
        this.phaseTimer -= dt;
        if (this.phaseTimer > 0) return;
        this.renderState.hoops.buzzerLit = false;
        var startSide = this.renderState.quarter % 2 === 0 ? 'AWAY' : 'HOME';
        this.startInbound(startSide, "Q" + this.renderState.quarter + " INBOUND");
    };
    _proto.checkBlacktopWin = function checkBlacktopWin() {
        var _this_config_targetScore;
        if (!this.isBlacktopMode()) return false;
        var target = (_this_config_targetScore = this.config.targetScore) != null ? _this_config_targetScore : 21;
        var winBy2 = this.settings.gameplay.blacktopWinByTwo;
        var h = this.renderState.homeScore;
        var a = this.renderState.awayScore;
        if (h >= target && (!winBy2 || h - a >= 2)) {
            this.finishMatch('HOME');
            return true;
        }
        if (a >= target && (!winBy2 || a - h >= 2)) {
            this.finishMatch('AWAY');
            return true;
        }
        return false;
    };
    _proto.finishMatch = function finishMatch(winner) {
        this.phase = 'GAME_OVER';
        this.winnerSide = winner;
        this.renderState.hoops.buzzerLit = true;
        var winAbbr = winner === 'HOME' ? this.homeTeam.abbr : this.awayTeam.abbr;
        this.renderState.lastEventLabel = "FINAL BUZZER \xb7 " + winAbbr + " WINS!";
        this.renderState.jumbotronBanner = "FINAL: " + this.awayTeam.abbr + " " + this.renderState.awayScore + " - " + this.homeTeam.abbr + " " + this.renderState.homeScore;
        this.hooks.onBuzzer == null ? void 0 : this.hooks.onBuzzer.call(this.hooks);
        this.hooks.onCrowdRoar == null ? void 0 : this.hooks.onCrowdRoar.call(this.hooks, 1.0);
        this.hooks.onAnnounce == null ? void 0 : this.hooks.onAnnounce.call(this.hooks, "Final buzzer! " + winAbbr + " takes the victory!");
    };
    // ==========================================================================
    // POSSESSION, CONTEST & HELPER UTILITIES
    // ==========================================================================
    _proto.grantPossession = function grantPossession(player, resetClockAndAdrenaline) {
        for(var i = 0; i < this.actors.length; i++){
            this.actors[i].render.hasBall = false;
            this.actors[i].render.shotQuality2K14 = 'NONE';
            if (resetClockAndAdrenaline) {
                this.actors[i].render.adrenalinePips = 3; // Fresh 3-bar Adrenaline each possession
                this.actors[i].paintThreeSecTimer = 0;
                this.actors[i].jumpCountInPaint = 0;
            }
        }
        player.render.hasBall = true;
        this.renderState.ball.holderPlayerId = player.render.id;
        this.renderState.ball.inFlight = false;
        this.renderState.ball.isGreenShot = false;
        this.renderState.possession = player.render.teamSide;
        this.renderState.attackDirX = this.getAttackDirForSide(player.render.teamSide);
        if (resetClockAndAdrenaline) {
            this.renderState.shotClockSec = 24;
            this.backcourtClockSec = 0;
            this.possessionElapsedSec = 0;
            this.lastPossessionWasOffReb = false;
            var dir = this.renderState.attackDirX;
            this.crossedHalfCourt = this.isBlacktopMode() || (dir === 1 ? player.render.x > 0 : player.render.x < 0);
        }
        // Auto-select ball handler when user's team has possession, or nearest defender on D
        if (this.userTeamSide === player.render.teamSide) {
            this.selectUserControlledPlayer(player);
        } else if (this.userTeamSide) {
            this.switchToNearestDefender();
        }
    };
    _proto.findClosestOpponent = function findClosestOpponent(actor) {
        var oppSide = actor.render.teamSide === 'HOME' ? 'AWAY' : 'HOME';
        var opps = this.getSideActors(oppSide);
        var best = null;
        var bestD = 999;
        for(var i = 0; i < opps.length; i++){
            var d = Math.hypot(opps[i].render.x - actor.render.x, opps[i].render.z - actor.render.z);
            if (d < bestD) {
                bestD = d;
                best = opps[i];
            }
        }
        return best ? {
            actor: best,
            dist: bestD
        } : null;
    };
    _proto.computeDefenderContestPct = function computeDefenderContestPct(shooter, nearest) {
        if (!nearest || nearest.dist > 3.1) return 0;
        var def = nearest.actor;
        var pct = Math.max(0, (3.1 - nearest.dist) / 2.2) * 58;
        if (def.render.animState === 'HANDS_UP_CONTEST') pct += 22;
        if (def.render.animState === 'JUMP_BLOCK') pct += 30;
        var heightDiff = def.profile.heightInches - shooter.profile.heightInches;
        pct += heightDiff * 2.5;
        if (def.takeover.ignited && def.takeover.archetype === 'LOCKDOWN') pct += 16;
        return Math.max(0, Math.min(100, pct));
    };
    _proto.isThreePointShot = function isThreePointShot(x, z, hoopX) {
        var dx = Math.abs(hoopX - x);
        var dist = Math.hypot(hoopX - x, z);
        if (dx <= 4.3 && Math.abs(z) >= _courtTypes.COURT_DIMS.CORNER_THREE_Z - 0.08) return true;
        return dist >= _courtTypes.COURT_DIMS.THREE_PT_RADIUS - 0.08;
    };
    _proto.updateShotQualityRing = function updateShotQualityRing(handler) {
        var hoopX = this.getAttackDirForSide(handler.render.teamSide) * _courtTypes.COURT_DIMS.RIM_X;
        var dist = Math.hypot(hoopX - handler.render.x, handler.render.z);
        if (dist > 9.6) {
            handler.render.shotQuality2K14 = 'RED';
            return;
        }
        var nearestDef = this.findClosestOpponent(handler);
        var contest = this.computeDefenderContestPct(handler, nearestDef);
        var isThree = this.isThreePointShot(handler.render.x, handler.render.z, hoopX);
        var rating = isThree ? handler.profile.attributes.threePt : handler.profile.attributes.midRange;
        if (contest < 18 && rating >= 74) handler.render.shotQuality2K14 = 'GREEN';
        else if (contest < 45 && rating >= 60) handler.render.shotQuality2K14 = 'YELLOW';
        else handler.render.shotQuality2K14 = 'RED';
    };
    // ==========================================================================
    // HUD SNAPSHOT SERIALIZATION
    // ==========================================================================
    _proto.getHudSnapshot = function getHudSnapshot() {
        var _ref, _this_config_targetScore, _ref1, _ref2, _ref3, _ref4, _ref5;
        var _this_actorMap_get;
        var ctrl = this.getControlledActor();
        var meter = {
            kind: 'NONE',
            progress: 0,
            targetCenter: 0.68,
            greenHalfWidth: 0.06,
            label: '',
            isRhythmArmed: false
        };
        if (this.phase === 'JUMP_BALL') {
            meter = {
                kind: 'JUMP_BALL',
                progress: this.jumpBallProgress,
                targetCenter: 0.84,
                greenHalfWidth: 0.1,
                label: 'TAP [SPACE] AT PEAK FOR TIP-OFF',
                isRhythmArmed: false
            };
        } else if (this.phase === 'FREE_THROW' && this.activeFreeThrow && this.activeFreeThrow.meterActive) {
            var isUser = this.userTeamSide === this.activeFreeThrow.side;
            meter = {
                kind: 'FREE_THROW',
                progress: this.activeFreeThrow.meterProgress,
                targetCenter: 0.72,
                greenHalfWidth: 0.11,
                label: isUser ? "FREE THROW (" + (this.activeFreeThrow.totalShots - this.activeFreeThrow.shotsRemaining + 1) + "/" + this.activeFreeThrow.totalShots + ") \xb7 TAP [SPACE]" : 'CPU FREE THROW',
                isRhythmArmed: false
            };
        } else if (this.shotChargeActive) {
            meter = {
                kind: this.shotChargeKind,
                progress: Math.min(1, this.shotChargeProgress),
                targetCenter: this.shotChargeTargetCenter,
                greenHalfWidth: this.shotChargeGreenHalf,
                label: this.shotChargeKind === 'SKILL_DUNK' ? 'SKILL DUNK METER' : this.shotChargeKind === 'RHYTHM_SHOT' ? 'RHYTHM PRO-STICK (FLICK UP!)' : 'SHOT METER',
                isRhythmArmed: this.rhythmIsArmed
            };
        }
        var alleyOopPrompt = this.activePass && this.activePass.kind === 'ALLEY_OOP' && this.activePass.requiresPrompt && !this.activePass.alleyOopPressed ? {
            active: true,
            promptKey: this.activePass.alleyOopKey,
            receiverName: (_ref = (_this_actorMap_get = this.actorMap.get(this.activePass.receiverId)) == null ? void 0 : _this_actorMap_get.render.lastName) != null ? _ref : 'FINISHER',
            remainingSec: Math.max(0, this.activePass.duration - this.activePass.elapsed),
            durationSec: this.activePass.duration
        } : {
            active: false,
            promptKey: 'X',
            receiverName: '',
            remainingSec: 0,
            durationSec: 1
        };
        var handler = this.getBallHandler();
        var iconTargets = this.iconPassingActive && handler && handler.render.isUserControlled ? this.getSideActors(handler.render.teamSide).map(function(a, idx) {
            return {
                slotNum: idx + 1,
                playerId: a.render.id,
                lastName: a.render.lastName,
                position: a.render.position
            };
        }).filter(function(t) {
            return t.playerId !== handler.render.id;
        }) : [];
        var qNum = this.renderState.quarter;
        var quarterLabel = this.isBlacktopMode() ? "TO " + ((_this_config_targetScore = this.config.targetScore) != null ? _this_config_targetScore : 21) : qNum <= 4 ? "Q" + qNum : "OT" + (qNum - 4);
        var activeShooterId = this.phase === 'FREE_THROW' && this.activeFreeThrow ? this.activeFreeThrow.shooterId : this.shotChargeActive ? this.renderState.ball.holderPlayerId : null;
        var activeAlleyOopReceiverId = this.activePass && this.activePass.kind === 'ALLEY_OOP' && this.activePass.requiresPrompt && !this.activePass.alleyOopPressed ? this.activePass.receiverId : null;
        return {
            phase: this.phase,
            awayAbbr: this.renderState.awayAbbr,
            homeAbbr: this.renderState.homeAbbr,
            awayScore: this.renderState.awayScore,
            homeScore: this.renderState.homeScore,
            awayFouls: this.awayFoulsQtr,
            homeFouls: this.homeFoulsQtr,
            awayInBonus: !this.isBlacktopMode() && this.awayFoulsQtr >= 5,
            homeInBonus: !this.isBlacktopMode() && this.homeFoulsQtr >= 5,
            homeTimeouts: this.homeTimeouts,
            awayTimeouts: this.awayTimeouts,
            timeoutHuddleSec: this.timeoutHuddleSec,
            quarter: qNum,
            quarterLabel: quarterLabel,
            quarterClockSec: this.renderState.quarterClockSec,
            shotClockSec: this.renderState.shotClockSec,
            possession: this.renderState.possession,
            isBlacktop: this.isBlacktopMode(),
            targetScore: this.config.targetScore,
            userTeamSide: this.userTeamSide,
            controlledPlayerId: (_ref1 = ctrl == null ? void 0 : ctrl.render.id) != null ? _ref1 : null,
            controlledPlayerName: (_ref2 = ctrl == null ? void 0 : ctrl.profile.name) != null ? _ref2 : 'CPU SPECTATE',
            controlledPosition: (_ref3 = ctrl == null ? void 0 : ctrl.render.position) != null ? _ref3 : 'PG',
            controlledStamina: (_ref4 = ctrl == null ? void 0 : ctrl.render.stamina) != null ? _ref4 : 1,
            controlledAdrenaline: (_ref5 = ctrl == null ? void 0 : ctrl.render.adrenalinePips) != null ? _ref5 : 3,
            controlledTakeover: ctrl ? _extends({}, ctrl.takeover) : null,
            activeShooterId: activeShooterId,
            activeAlleyOopReceiverId: activeAlleyOopReceiverId,
            meter: meter,
            alleyOopPrompt: alleyOopPrompt,
            shotFeedback: this.shotFeedback ? _extends({}, this.shotFeedback) : null,
            badgeFeed: this.badgeFeed.map(function(b) {
                return _extends({}, b);
            }),
            teammateGrade: {
                score: this.teammateGrade.score,
                letter: this.teammateGrade.letter,
                events: this.teammateGrade.events.map(function(e) {
                    return _extends({}, e);
                })
            },
            splashBanner: this.splashBanner ? _extends({}, this.splashBanner) : null,
            pickAndRoll: _extends({}, this.pickAndRoll),
            activeLineupPreset: this.activeLineupPreset,
            markedStar: _extends({}, this.renderState.markedStar),
            isPaused: this.paused,
            replayFrameCount: this.replayBuffer.getFrameCount(),
            iconPassingActive: this.iconPassingActive,
            iconTargets: iconTargets,
            defensiveScheme: this.defensiveScheme,
            activePlay: this.renderState.activePlay,
            shotTimingProfile: this.settings.gameplay.shotTimingProfile,
            bannerText: this.renderState.lastEventLabel,
            winnerSide: this.winnerSide,
            boxScore: this.actors.map(function(a) {
                return _extends({}, a.boxScore);
            }),
            teamComparison: _extends({}, this.teamComp, {
                homeReb: this.actors.filter(function(a) {
                    return a.render.teamSide === 'HOME';
                }).reduce(function(s, a) {
                    return s + a.boxScore.reb;
                }, 0),
                awayReb: this.actors.filter(function(a) {
                    return a.render.teamSide === 'AWAY';
                }).reduce(function(s, a) {
                    return s + a.boxScore.reb;
                }, 0)
            }),
            matchShots: this.matchShots.slice(),
            radarPlayers: this.actors.map(function(a) {
                return {
                    id: a.render.id,
                    teamSide: a.render.teamSide,
                    jerseyNumber: a.render.jerseyNumber,
                    position: a.render.position,
                    lastName: a.render.lastName,
                    name: a.profile.name,
                    ovr: a.profile.ovr,
                    x: a.render.x,
                    z: a.render.z,
                    hasBall: a.render.hasBall,
                    isUserControlled: a.render.isUserControlled,
                    stamina: a.render.stamina
                };
            }),
            radarBall: {
                x: this.renderState.ball.x,
                z: this.renderState.ball.z
            }
        };
    };
    return BasketballSimulation;
}();

});

})(window.ArcadeMod);
