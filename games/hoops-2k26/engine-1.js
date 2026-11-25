(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/Hoops2K26_3D ===
ArcadeMod.define("src/games/hoops-2k26/Hoops2K26_3D", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Hoops2K26_3D", {
    enumerable: true,
    get: function() {
        return Hoops2K26_3D;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _arenaRoster = require("../../core/arenaRoster");
var _audio = require("../../core/audio");
var _runtimeBridge = require("../../core/runtimeBridge");
var _storage = require("../../core/storage");
var _types = require("../../core/types");
var _basketballLogic = require("./basketballLogic");
var _threeShared = require("../../core/threeShared");
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
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) return obj;
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") return {
        default: obj
    };
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) return cache.get(obj);
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
            else newObj[key] = obj[key];
        }
    }
    newObj.default = obj;
    if (cache) cache.set(obj, newObj);
    return newObj;
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var ROLE_SLOTS = [
    {
        role: 'PG',
        offX: 8.5,
        offZ: 0.0,
        defX: -11.5,
        defZ: 0.0,
        scale: 0.96,
        skin: 0xd99b66
    },
    {
        role: 'SG',
        offX: 11.4,
        offZ: -7.8,
        defX: -14.2,
        defZ: -6.8,
        scale: 1.0,
        skin: 0x8d5524
    },
    {
        role: 'SF',
        offX: 15.8,
        offZ: 10.1,
        defX: -15.8,
        defZ: 8.4,
        scale: 1.04,
        skin: 0xc68642
    },
    {
        role: 'PF',
        offX: 14.0,
        offZ: -3.2,
        defX: -16.8,
        defZ: -3.0,
        scale: 1.09,
        skin: 0xf1c27d
    },
    {
        role: 'C',
        offX: 16.4,
        offZ: 2.8,
        defX: -17.4,
        defZ: 2.2,
        scale: 1.14,
        skin: 0x6b3e26
    }
];
var PLAY_BOOK = [
    {
        id: 'freelance',
        name: '5-Out Freelance',
        offsetZ: 0
    },
    {
        id: 'pnr',
        name: 'High Pick & Roll',
        offsetZ: -2.2
    },
    {
        id: 'floppy',
        name: 'Floppy 3PT Screen',
        offsetZ: 3.4
    },
    {
        id: 'post_iso',
        name: 'Low Post Iso',
        offsetZ: -4.1
    }
];
var COACH_SCHEMES = [
    'Man-to-Man',
    '2-3 Zone',
    'Switch Everything',
    'Pace & Space'
];
var _camDesired = new _three.Vector3();
var _camLookDesired = new _three.Vector3();
var _camLookCur = new _three.Vector3();
var _projVec = new _three.Vector3();
var _dummyMatrix = new _three.Matrix4();
var _dummyQuat = new _three.Quaternion();
var _dummyScale = new _three.Vector3(1, 1, 1);
var _dummyPos = new _three.Vector3();
function hexStrToNum(hex, fallback) {
    var clean = hex.replace('#', '');
    var n = parseInt(clean, 16);
    return Number.isFinite(n) ? n : fallback;
}
var Hoops2K26_3D = /*#__PURE__*/ function() {
    "use strict";
    function Hoops2K26_3D(container, diff, lvl, gameIdx, teamId) {
        var _this = this;
        if (gameIdx === void 0) gameIdx = 27;
        if (teamId === void 0) teamId = _storage.playerState.selectedBasketballTeam;
        var _HOOPS_MODES_find, _this_matchCtx_homeTeamOverride, _this_matchCtx_awayTeamOverride, _HOOPS_TAKEOVERS_find;
        this.playersPerSide = 5;
        this.score = 0;
        this.lives = 100;
        this.maxLives = 100;
        this.isPaused = false;
        this.gameOver = false;
        this.isRunning = false;
        this.players = [];
        this.controlledIdx = 0;
        this.ballX = 0;
        this.ballY = 1.2;
        this.ballZ = 0;
        this.ballVx = 0;
        this.ballVy = 0;
        this.ballVz = 0;
        this.ballMode = 'held';
        this.carrierIdx = 0;
        this.possession = 'home';
        this.dribblePhase = 0;
        this.lastDribblePlayed = false;
        // Pass flight & Assist tracking
        this.passFromX = 0;
        this.passFromY = 1.4;
        this.passFromZ = 0;
        this.passTargetIdx = 1;
        this.passTimer = 0;
        this.passDuration = 0.28;
        this.lastUserPassToIdx = -1;
        this.lastUserPassTimer = 0;
        // Shot flight & Pro-Stick meter
        this.meterActive = false;
        this.meterProgress = 0;
        this.meterGreenStart = 0.77;
        this.meterGreenEnd = 0.91;
        this.meterBaseProb = 0.65;
        this.meterPoints = 2;
        this.meterCoverage = 'OPEN';
        this.meterOffBoostApplied = false;
        this.shotStartX = 0;
        this.shotStartY = 2.4;
        this.shotStartZ = 0;
        this.shotTargetX = _basketballLogic.HOOP_X;
        this.shotTargetZ = 0;
        this.shotPeakY = 5.4;
        this.shotTimer = 0;
        this.shotDuration = 0.78;
        this.shotWillMake = false;
        this.shotPoints = 2;
        this.shotTeam = 'home';
        this.shotWasGreen = false;
        this.shotShooterIdx = 0;
        // Dunk flight
        this.dunkFromX = 0;
        this.dunkFromZ = 0;
        this.dunkTargetX = _basketballLogic.HOOP_X;
        this.dunkTimer = 0;
        this.dunkDuration = 0.42;
        this.leftNetShake = 0;
        this.rightNetShake = 0;
        this.crowdBasePos = [];
        this.crowdExcite = 0;
        this.releaseVfxTimer = 0;
        // Match Clocks, Fouls & Score
        this.homeScore = 0;
        this.awayScore = 0;
        this.quarter = 1;
        this.quarterClock = 300;
        this.maxQuarters = 4;
        this.quarterLengthSec = 300;
        this.targetScore = null;
        this.shotClock = _basketballLogic.SHOT_CLOCK_SEC;
        this.homeFouls = 0;
        this.awayFouls = 0;
        this.homeTimeouts = 4;
        this.awayTimeouts = 4;
        this.inboundPause = 0;
        this.pendingInboundTeam = 'home';
        this.quarterBreakPause = 0;
        // NBA 2K26 On-Court Systems (Grade, Takeover, Adrenaline, Stats, Coaching, Icon Passing)
        this.teammateGradeScore = 54; // starts at C+
        this.teammateGrade = (0, _basketballLogic.getTeammateGradeLabel)(54);
        this.gradeFlash = '';
        this.gradeFlashTimer = 0;
        this.takeoverMeter = 85; // 0..500
        this.takeoverLevel = 0;
        this.takeoverActive = false;
        this.takeoverActiveTimer = 0;
        this.takeoverName = 'Sharpshooter';
        this.adrenalineBars = 3;
        this.adrenalineRechargeTimer = 0;
        this.wasSprintingLastFrame = false;
        this.stats = {
            pts: 0,
            reb: 0,
            ast: 0,
            stl: 0,
            blk: 0,
            tov: 0,
            fgm: 0,
            fga: 0,
            tpm: 0,
            tpa: 0,
            greens: 0
        };
        this.shotFeedback = null;
        this.iconPassingActive = false;
        this.activePlayIdx = 0;
        this.coachSchemeIdx = 0;
        this.postGameSummary = null;
        // AI timers
        this.aiDecisionTimer = 0.4;
        this.aiAttackPhaseTimer = 0;
        this.hudSyncTimer = 0;
        // Inputs
        this.moveDx = 0;
        this.moveDy = 0;
        this.steerLeftHeld = false;
        this.steerRightHeld = false;
        this.sprintHeld = false;
        this.shootHeld = false;
        this.camShake = 0;
        this.banner = null;
        this.lastActionBtnMode = '';
        this.lastTime = 0;
        this.tick = function() {
            if (!_this.isRunning || _this.isPaused || _this.gameOver) return;
            var now = performance.now();
            var rawDt = (now - _this.lastTime) / 1000;
            _this.lastTime = now;
            var speedScale = Math.max(0.8, Math.min(1.2, _storage.playerState.hoops2k26.settings.gameSpeed / 50));
            var dt = Math.min(Math.max(rawDt, 0.001), 0.05) * speedScale;
            _this.stepSimulation(dt);
            if (!_this.isRunning || _this.isPaused || _this.gameOver) return;
            _this.syncMeshes();
            _this.updateCamera(dt);
            _this.three.render();
            _this.drawCourtOverlay();
            _this.hudSyncTimer += dt;
            if (_this.hudSyncTimer >= 0.12) {
                _this.hudSyncTimer = 0;
                _this.pushHudSnapshot();
            }
            if (_this.isRunning && !_this.isPaused && !_this.gameOver) {
                _this.three.scheduleNextFrame(_this.tick);
            }
        };
        this.container = container;
        this.diff = diff;
        this.level = lvl;
        this.gameIdx = gameIdx;
        this.modeDef = (_HOOPS_MODES_find = _arenaRoster.HOOPS_MODES.find(function(m) {
            return m.id === _storage.playerState.selectedHoopsMode;
        })) != null ? _HOOPS_MODES_find : _arenaRoster.HOOPS_MODES[2];
        var prof = _storage.playerState.hoops2k26;
        var settings = prof.settings;
        var defaultQuarterSec = Math.max(45, Math.round(settings.quarterLengthMin * 60));
        if (prof.activeMatchContext) {
            this.matchCtx = _extends({}, prof.activeMatchContext);
        } else {
            var _playerState_hoopsTournament_opponents_;
            var isBlacktop = this.modeDef.courtKind === 'blacktop';
            var awayId = this.modeDef.id === 'tournament' ? (_playerState_hoopsTournament_opponents_ = _storage.playerState.hoopsTournament.opponents[_storage.playerState.hoopsTournament.round - 1]) != null ? _playerState_hoopsTournament_opponents_ : 1 : (teamId + 1) % _arenaRoster.HOOPS_2K26_TEAMS.length;
            this.matchCtx = {
                sourceLabel: this.modeDef.name,
                courtTheme: isBlacktop ? 'park' : 'nba_arena',
                playersPerSide: this.modeDef.playersPerSide,
                homeTeamId: teamId,
                awayTeamId: awayId,
                homeJerseyVariant: 'home',
                useMyPlayer: false,
                targetScore: isBlacktop ? 21 : null,
                quarterSec: isBlacktop ? 90 : defaultQuarterSec,
                difficultyLabel: settings.difficulty,
                repMult: 1,
                badgeMult: 1,
                vcBonus: 250
            };
        }
        this.playersPerSide = this.matchCtx.playersPerSide;
        this.targetScore = this.matchCtx.targetScore;
        this.quarterLengthSec = this.matchCtx.quarterSec || defaultQuarterSec;
        this.quarterClock = this.quarterLengthSec;
        this.maxQuarters = this.targetScore ? 1 : 4;
        this.homeTeam = (_this_matchCtx_homeTeamOverride = this.matchCtx.homeTeamOverride) != null ? _this_matchCtx_homeTeamOverride : (0, _arenaRoster.getHoops2K26TeamById)(this.matchCtx.homeTeamId);
        this.awayTeam = (_this_matchCtx_awayTeamOverride = this.matchCtx.awayTeamOverride) != null ? _this_matchCtx_awayTeamOverride : (0, _arenaRoster.getHoops2K26TeamById)(this.matchCtx.awayTeamId);
        if (!this.matchCtx.homeTeamOverride && !this.matchCtx.awayTeamOverride && this.awayTeam.id === this.homeTeam.id) {
            this.awayTeam = (0, _arenaRoster.getHoops2K26TeamById)((this.homeTeam.id + 1) % _arenaRoster.HOOPS_2K26_TEAMS.length);
        }
        var mp = (0, _arenaRoster.getActiveMyPlayer)(prof);
        var tkDef = (_HOOPS_TAKEOVERS_find = _arenaRoster.HOOPS_TAKEOVERS.find(function(t) {
            return t.id === mp.equippedTakeoverId;
        })) != null ? _HOOPS_TAKEOVERS_find : _arenaRoster.HOOPS_TAKEOVERS[0];
        this.takeoverName = tkDef.name;
        this.scaler = _types.difficultyScalers[diff] || _types.difficultyScalers.medium;
        _storage.playerState.sessionCoins = 0;
        _storage.playerState.sessionExp = 0;
    }
    var _proto = Hoops2K26_3D.prototype;
    _proto.isOutdoorCourt = function isOutdoorCourt() {
        var t = this.matchCtx.courtTheme;
        return t === 'park' || t === 'blacktop' || t === 'street_kings';
    };
    _proto.start = function start() {
        var outdoor = this.isOutdoorCourt();
        var isMyCourt = this.matchCtx.courtTheme === 'mycourt';
        var mural = _storage.playerState.hoops2k26.myCourt.muralTheme;
        var skyColor = outdoor ? this.matchCtx.courtTheme === 'street_kings' ? 0x7c2d12 : 0x38bdf8 : isMyCourt && mural === 'northern_lights' ? 0x1e1b4b : 0x0b1020;
        this.three = new _threeShared.StudioThreeContext(this.container, {
            skyColor: skyColor,
            fogColor: outdoor ? this.matchCtx.courtTheme === 'street_kings' ? 0xc2410c : 0xbae6fd : skyColor,
            fogNear: 56,
            fogFar: 150,
            keyColor: outdoor ? 0xfff3d6 : 0xfff7ed,
            keyIntensity: outdoor ? 2.15 : 2.0,
            hemiSky: outdoor ? 0x7dd3fc : 0xbae6fd,
            hemiGround: outdoor ? 0x57534e : 0x7c2d12,
            hemiIntensity: outdoor ? 1.02 : 0.92,
            shadowExtent: 28,
            fov: 44,
            far: 195
        });
        this.three.renderer.toneMapping = _three.NoToneMapping;
        this.buildArena();
        this.buildPlayDiagramAndVfx();
        this.spawnTeams();
        this.buildBasketball();
        this.resetHalfCourtSetup('home', true);
        this.syncCameraFov();
        this.snapCameraImmediate();
        this.three.prewarm();
        this.isRunning = true;
        this.lastTime = performance.now();
        this.syncActionLabels();
        (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
        this.pushHudSnapshot();
        var titleBanner = this.targetScore ? this.matchCtx.sourceLabel.toUpperCase() + " \xb7 FIRST TO " + this.targetScore + "!" : this.matchCtx.sourceLabel.toUpperCase() + " — " + this.homeTeam.abbr + " VS " + this.awayTeam.abbr;
        this.popBanner(titleBanner, this.homeTeam.accentHex, 2.0);
        _audio.ArcadeAudio.play('whistle');
        this.tick();
    };
    _proto.stop = function stop() {
        var _this_three;
        this.isRunning = false;
        this.releaseInputs();
        (0, _runtimeBridge.updateHoopsHud)(null);
        (_this_three = this.three) == null ? void 0 : _this_three.dispose();
    };
    _proto.releaseInputs = function releaseInputs() {
        this.moveDx = 0;
        this.moveDy = 0;
        this.steerLeftHeld = false;
        this.steerRightHeld = false;
        this.sprintHeld = false;
        this.shootHeld = false;
        this.meterActive = false;
        this.meterProgress = 0;
    };
    _proto.pause = function pause() {
        var _this_three;
        this.isPaused = true;
        this.releaseInputs();
        (_this_three = this.three) == null ? void 0 : _this_three.cancelPendingFrame();
    };
    _proto.resume = function resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
        if (this.isRunning && !this.gameOver) {
            var _this_three;
            (_this_three = this.three) == null ? void 0 : _this_three.scheduleNextFrame(this.tick);
        }
    };
    _proto.resize = function resize() {
        var _this_three;
        (_this_three = this.three) == null ? void 0 : _this_three.resize();
        this.syncCameraFov();
    };
    // =========================================================================
    // NEW NBA 2K26 ON-COURT INTERACTIVE CONTROLS (Called from Keyboard / HUD)
    // =========================================================================
    _proto.toggleIconPassing = function toggleIconPassing() {
        if (this.gameOver || this.isPaused) return;
        if (this.ballMode !== 'held' || this.carrierIdx !== this.controlledIdx || this.playersPerSide <= 1) {
            this.iconPassingActive = false;
            this.pushHudSnapshot();
            return;
        }
        this.iconPassingActive = !this.iconPassingActive;
        _audio.ArcadeAudio.play('click');
        this.pushHudSnapshot();
    };
    _proto.triggerIconPass = function triggerIconPass(mateIndex) {
        if (this.gameOver || this.isPaused) return;
        var carrier = this.players[this.controlledIdx];
        var target = this.players[mateIndex];
        if (!carrier || !target || target.team !== 'home' || target.index === carrier.index) return;
        if (this.ballMode === 'held' && this.carrierIdx === this.controlledIdx) {
            var _target_name_split_pop;
            this.iconPassingActive = false;
            this.lastUserPassToIdx = target.index;
            this.lastUserPassTimer = 4.5;
            this.startPass(carrier, target);
            this.controlledIdx = target.index;
            this.updateActiveRing();
            this.popBanner("ICON PASS → " + ((_target_name_split_pop = target.name.split(' ').pop()) == null ? void 0 : _target_name_split_pop.toUpperCase()), '#38bdf8', 0.85);
            this.pushHudSnapshot();
        }
    };
    _proto.callHoopsPlay = function callHoopsPlay(playId) {
        if (this.gameOver || this.isPaused) return;
        if (playId) {
            var idx = PLAY_BOOK.findIndex(function(p) {
                return p.id === playId;
            });
            if (idx >= 0) this.activePlayIdx = idx;
        } else {
            this.activePlayIdx = (this.activePlayIdx + 1) % PLAY_BOOK.length;
        }
        var play = PLAY_BOOK[this.activePlayIdx];
        this.refreshPlayDiagramVisual();
        this.popBanner("PLAY CALL: " + play.name.toUpperCase(), '#facc15', 1.2);
        _audio.ArcadeAudio.play('click');
        this.pushHudSnapshot();
    };
    _proto.setHoopsCoachScheme = function setHoopsCoachScheme(scheme) {
        if (this.gameOver || this.isPaused) return;
        var idx = COACH_SCHEMES.findIndex(function(s) {
            return s.toLowerCase() === scheme.toLowerCase();
        });
        this.coachSchemeIdx = idx >= 0 ? idx : (this.coachSchemeIdx + 1) % COACH_SCHEMES.length;
        var activeScheme = COACH_SCHEMES[this.coachSchemeIdx];
        this.popBanner("COACH SCHEME: " + activeScheme.toUpperCase(), '#38bdf8', 1.15);
        _audio.ArcadeAudio.play('click');
        this.pushHudSnapshot();
    };
    _proto.activateHoopsTakeover = function activateHoopsTakeover() {
        if (this.gameOver || this.isPaused) return;
        if (this.takeoverLevel < 5 || this.takeoverActive) return;
        this.takeoverActive = true;
        this.takeoverActiveTimer = 16.0;
        this.takeoverAuraMesh.visible = true;
        this.crowdExcite = 1.0;
        this.popBanner("\uD83D\uDD25 " + this.takeoverName.toUpperCase() + " TAKEOVER IGNITED!", '#f97316', 1.6);
        _audio.ArcadeAudio.play('win');
        this.pushHudSnapshot();
    };
    _proto.toggleHoopsCamera = function toggleHoopsCamera() {
        var s = _storage.playerState.hoops2k26.settings;
        s.cameraAngle = s.cameraAngle === '2k' ? 'broadcast' : '2k';
        (0, _storage.persistHoops2K26)();
        this.popBanner(s.cameraAngle === '2k' ? 'CAMERA: 2K NORTH-SOUTH' : 'CAMERA: BROADCAST SIDELINE', '#38bdf8', 1.1);
        this.pushHudSnapshot();
    };
    _proto.simHoopsToEnd = function simHoopsToEnd() {
        if (this.gameOver) return;
        // Simulate realistic remaining possessions so players can test 5m/12m games & reach the 4-Tab Post-Game Summary cleanly
        if (this.targetScore) {
            var needHome = Math.max(0, this.targetScore - this.homeScore);
            var userWins = this.homeScore >= this.awayScore || Math.random() < 0.65;
            if (userWins) {
                this.homeScore = Math.max(this.homeScore + 2, this.targetScore);
                this.awayScore = Math.min(this.homeScore - 2, Math.max(this.awayScore, this.targetScore - 4));
            } else {
                this.awayScore = Math.max(this.awayScore + 2, this.targetScore);
                this.homeScore = Math.min(this.awayScore - 2, Math.max(this.homeScore, this.targetScore - 3));
            }
            this.stats.pts += Math.max(2, Math.round(needHome * 0.55));
            this.stats.reb += 2;
            this.stats.ast += 2;
        } else {
            var remQuarters = Math.max(0.25, this.maxQuarters - this.quarter + this.quarterClock / Math.max(1, this.quarterLengthSec));
            var homeAdd = Math.round(remQuarters * (18 + this.homeTeam.shootRating * 1.4));
            var awayAdd = Math.round(remQuarters * (17 + this.awayTeam.shootRating * 1.2));
            this.homeScore += homeAdd;
            this.awayScore += awayAdd;
            if (this.homeScore === this.awayScore) this.homeScore += 3;
            this.stats.pts += Math.round(homeAdd * 0.34);
            this.stats.reb += Math.max(1, Math.round(remQuarters * 2.1));
            this.stats.ast += Math.max(1, Math.round(remQuarters * 2.4));
            this.stats.fgm += Math.round(homeAdd * 0.34 / 2.3);
            this.stats.fga += Math.round(homeAdd * 0.34 / 1.4);
            this.quarter = this.maxQuarters;
            this.quarterClock = 0;
        }
        this.finishMatch();
    };
    _proto.handleKey = function handleKey(key) {
        var k = key.toLowerCase();
        if (k === 'tab' || k === 'e') {
            this.toggleIconPassing();
        } else if (k === 'q') {
            this.callHoopsPlay();
        } else if (k === 't') {
            this.activateHoopsTakeover();
        } else if (k === 'c') {
            this.toggleHoopsCamera();
        } else if (this.iconPassingActive && (k === '1' || k === '2' || k === '3' || k === '4' || k === '5')) {
            var slotNum = parseInt(k, 10) - 1;
            var targets = this.getIconPassTargets();
            if (targets[slotNum]) {
                this.triggerIconPass(targets[slotNum].index);
            }
        }
    };
    _proto.syncCameraFov = function syncCameraFov() {
        if (!this.three) return;
        var portrait = this.three.height > this.three.width;
        var nextFov = portrait ? 56 : 44;
        if (this.three.camera.fov !== nextFov) {
            this.three.camera.fov = nextFov;
            this.three.camera.updateProjectionMatrix();
        }
    };
    _proto.setMoveDir = function setMoveDir(dx, dy) {
        this.moveDx = Math.max(-1, Math.min(1, dx));
        this.moveDy = Math.max(-1, Math.min(1, dy));
    };
    _proto.setSteerLeft = function setSteerLeft(down) {
        this.steerLeftHeld = down;
    };
    _proto.setSteerRight = function setSteerRight(down) {
        this.steerRightHeld = down;
    };
    _proto.jump = function jump() {
        this.triggerAction('pass', true);
    };
    _proto.attack = function attack() {
        this.triggerAction('shoot', true);
    };
    _proto.triggerAction = function triggerAction(actionKey, pressed) {
        if (this.gameOver || this.isPaused) return;
        if (actionKey === 'sprint' || actionKey === 'boost') {
            this.sprintHeld = pressed;
            return;
        }
        if (actionKey === 'shoot' || actionKey === 'action') {
            this.shootHeld = pressed;
            if (pressed) {
                this.onShootPressed();
            } else {
                this.onShootReleased();
            }
            return;
        }
        if ((actionKey === 'pass' || actionKey === 'jump') && pressed) {
            this.onPassOrSwitch();
            return;
        }
        if (actionKey === 'steal' && pressed) {
            this.onStealPressed();
        }
    };
    _proto.getEffectiveJerseyColor = function getEffectiveJerseyColor(team, isHome) {
        if (!isHome) return team.jerseyColor;
        var variant = this.matchCtx.homeJerseyVariant;
        if (variant === 'away') return team.awayJerseyColor;
        if (variant === 'city') return team.cityJerseyColor;
        return team.jerseyColor;
    };
    _proto.buildArena = function buildArena() {
        var _this = this;
        var theme = this.matchCtx.courtTheme;
        var outdoor = this.isOutdoorCourt();
        var isMyCourt = theme === 'mycourt';
        var mc = _storage.playerState.hoops2k26.myCourt;
        var apronColor = outdoor ? theme === 'street_kings' ? 0x431407 : 0x334155 : theme === 'the_rec' ? 0x111827 : 0x0f172a;
        var apron = new _three.Mesh(new _three.PlaneGeometry(outdoor ? 160 : 80, outdoor ? 160 : 54), new _three.MeshLambertMaterial({
            color: apronColor
        }));
        apron.rotation.x = -Math.PI / 2;
        apron.position.y = -0.03;
        apron.receiveShadow = true;
        this.three.scene.add(apron);
        // Outdoor skyline silhouettes so outdoor Park / Blacktop / Street Kings feels genuinely open-air!
        if (outdoor) {
            for(var i = 0; i < 20; i++){
                var ang = i / 20 * Math.PI * 2;
                var dist = 54 + i % 3 * 8;
                var h = 14 + i * 5 % 18;
                var tower = new _three.Mesh(new _three.BoxGeometry(6 + i % 3 * 2, h, 6 + i % 2 * 2), new _three.MeshLambertMaterial({
                    color: theme === 'street_kings' ? 0x292524 : 0x475569
                }));
                tower.position.set(Math.cos(ang) * dist, h * 0.5 - 0.1, Math.sin(ang) * dist);
                this.three.scene.add(tower);
            }
        }
        var courtTex = this.three.createCanvasTexture(1024, function(ctx, s) {
            var toX = function toX(wx) {
                return (wx + _basketballLogic.COURT_HALF_LEN) / (_basketballLogic.COURT_HALF_LEN * 2) * s;
            };
            var toZ = function toZ(wz) {
                return (wz + _basketballLogic.COURT_HALF_WID) / (_basketballLogic.COURT_HALF_WID * 2) * s;
            };
            var rx = function rx(r) {
                return r / (_basketballLogic.COURT_HALF_LEN * 2) * s;
            };
            var rz = function rz(r) {
                return r / (_basketballLogic.COURT_HALF_WID * 2) * s;
            };
            if (outdoor) {
                ctx.fillStyle = theme === 'street_kings' ? '#44403c' : '#1e293b';
                ctx.fillRect(0, 0, s, s);
                for(var px = 0; px < s; px += 32){
                    ctx.fillStyle = px % 64 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)';
                    ctx.fillRect(px, 0, 32, s);
                }
            } else {
                var plankCols = 28;
                var plankH = s / plankCols;
                var baseWood = isMyCourt ? mc.woodHex : theme === 'the_rec' ? '#c89b6e' : '#d99c52';
                var tones = isMyCourt ? [
                    baseWood,
                    baseWood,
                    '#d6a46c',
                    baseWood
                ] : [
                    '#d99c52',
                    '#cf9146',
                    '#e1a862',
                    '#c8873d'
                ];
                for(var r = 0; r < plankCols; r++){
                    ctx.fillStyle = tones[r % tones.length];
                    ctx.fillRect(0, r * plankH, s, plankH + 1);
                    ctx.strokeStyle = 'rgba(110, 62, 18, 0.22)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(0, r * plankH);
                    ctx.lineTo(s, r * plankH);
                    ctx.stroke();
                }
            }
            var keyLen = 5.4;
            var keyHalfW = 2.6;
            var homePaint = isMyCourt ? mc.paintHex : "" + _this.homeTeam.accentHex + "cc";
            var awayPaint = isMyCourt ? mc.paintHex : "" + _this.awayTeam.accentHex + "cc";
            ctx.fillStyle = awayPaint;
            ctx.fillRect(toX(-_basketballLogic.COURT_HALF_LEN), toZ(-keyHalfW), rx(keyLen), rz(keyHalfW * 2));
            ctx.fillStyle = homePaint;
            ctx.fillRect(toX(_basketballLogic.COURT_HALF_LEN - keyLen), toZ(-keyHalfW), rx(keyLen), rz(keyHalfW * 2));
            // Center court medallion
            var centerText = isMyCourt ? mc.centerLogoText || 'MyCOURT' : theme === 'the_rec' ? 'THE REC' : theme === 'proving_grounds' ? 'PROVING' : theme === 'theater' ? 'THEATER' : theme === 'open_court' ? '3X BADGES' : theme === 'wnba_arena' ? 'THE W' : outdoor ? 'PARK 21' : '2K26';
            ctx.fillStyle = isMyCourt ? mc.paintHex : _this.homeTeam.accentHex;
            ctx.beginPath();
            ctx.ellipse(toX(0), toZ(0), rx(3.4), rz(3.4), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.ellipse(toX(0), toZ(0), rx(2.85), rz(2.85), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 34px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(centerText, toX(0), toZ(0));
            // Court markings
            ctx.strokeStyle = isMyCourt ? mc.lineHex : '#f8fafc';
            ctx.lineWidth = 5;
            ctx.strokeRect(3, 3, s - 6, s - 6);
            ctx.beginPath();
            ctx.moveTo(toX(0), 0);
            ctx.lineTo(toX(0), s);
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(toX(0), toZ(0), rx(3.4), rz(3.4), 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeRect(toX(-_basketballLogic.COURT_HALF_LEN), toZ(-keyHalfW), rx(keyLen), rz(keyHalfW * 2));
            ctx.strokeRect(toX(_basketballLogic.COURT_HALF_LEN - keyLen), toZ(-keyHalfW), rx(keyLen), rz(keyHalfW * 2));
            ctx.beginPath();
            ctx.ellipse(toX(-_basketballLogic.COURT_HALF_LEN + keyLen), toZ(0), rx(1.8), rz(1.8), 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(toX(_basketballLogic.COURT_HALF_LEN - keyLen), toZ(0), rx(1.8), rz(1.8), 0, 0, Math.PI * 2);
            ctx.stroke();
            // Three-point arcs
            ctx.beginPath();
            ctx.moveTo(toX(-_basketballLogic.COURT_HALF_LEN), toZ(-_basketballLogic.CORNER_THREE_Z));
            ctx.lineTo(toX(-_basketballLogic.HOOP_X), toZ(-_basketballLogic.CORNER_THREE_Z));
            ctx.moveTo(toX(-_basketballLogic.COURT_HALF_LEN), toZ(_basketballLogic.CORNER_THREE_Z));
            ctx.lineTo(toX(-_basketballLogic.HOOP_X), toZ(_basketballLogic.CORNER_THREE_Z));
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(toX(-_basketballLogic.HOOP_X), toZ(0), rx(_basketballLogic.THREE_PT_RADIUS), rz(_basketballLogic.THREE_PT_RADIUS), 0, -Math.PI / 2, Math.PI / 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(toX(_basketballLogic.COURT_HALF_LEN), toZ(-_basketballLogic.CORNER_THREE_Z));
            ctx.lineTo(toX(_basketballLogic.HOOP_X), toZ(-_basketballLogic.CORNER_THREE_Z));
            ctx.moveTo(toX(_basketballLogic.COURT_HALF_LEN), toZ(_basketballLogic.CORNER_THREE_Z));
            ctx.lineTo(toX(_basketballLogic.HOOP_X), toZ(_basketballLogic.CORNER_THREE_Z));
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(toX(_basketballLogic.HOOP_X), toZ(0), rx(_basketballLogic.THREE_PT_RADIUS), rz(_basketballLogic.THREE_PT_RADIUS), 0, Math.PI / 2, Math.PI * 3 / 2);
            ctx.stroke();
        }, 1, 1);
        courtTex.wrapS = _three.ClampToEdgeWrapping;
        courtTex.wrapT = _three.ClampToEdgeWrapping;
        var hardwood = new _three.Mesh(new _three.PlaneGeometry(_basketballLogic.COURT_HALF_LEN * 2, _basketballLogic.COURT_HALF_WID * 2), new _three.MeshStandardMaterial({
            map: courtTex,
            roughness: outdoor ? 0.72 : 0.34,
            metalness: 0.06
        }));
        hardwood.rotation.x = -Math.PI / 2;
        hardwood.receiveShadow = true;
        this.three.scene.add(hardwood);
        // LED Scorer's Table along far sideline
        var ledTable = new _three.Mesh(new _three.BoxGeometry(24, 1.05, 0.9), (0, _threeShared.createToonMaterial)(0x1e293b, {
            emissive: 0x0f172a,
            emissiveIntensity: 0.35
        }));
        ledTable.position.set(0, 0.52, -13.4);
        (0, _threeShared.addInkOutline)(ledTable, 1.03);
        var ledStrip = new _three.Mesh(new _three.BoxGeometry(22.4, 0.52, 0.94), new _three.MeshBasicMaterial({
            color: this.homeTeam.jerseyColor
        }));
        ledStrip.position.set(0, 0.54, -13.4);
        this.three.scene.add(ledTable, ledStrip);
        // MyCOURT Back Wall Mural if in MyCOURT
        if (isMyCourt) {
            var muralColor = mc.muralTheme === 'northern_lights' ? 0x7c3aed : mc.muralTheme === 'sunset_city' ? 0xf97316 : mc.muralTheme === 'championship_gold' ? 0xeab308 : 0x334155;
            var muralWall = new _three.Mesh(new _three.BoxGeometry(46, 9.5, 0.6), (0, _threeShared.createToonMaterial)(muralColor, {
                emissive: muralColor,
                emissiveIntensity: 0.2
            }));
            muralWall.position.set(0, 4.75, -15.5);
            this.three.scene.add(muralWall);
        }
        // Hoop Stanchions
        this.leftNetMesh = this.buildHoopStanchion(-1);
        this.rightNetMesh = this.buildHoopStanchion(1);
        // Bleachers & Crowd (skip heavy bleachers in private MyCOURT)
        var standMat = (0, _threeShared.createToonMaterial)(outdoor ? 0x334155 : 0x1e293b);
        if (!isMyCourt) {
            var northStand = new _three.Mesh(new _three.BoxGeometry(58, outdoor ? 2.6 : 5.2, 8.5), standMat);
            northStand.position.set(0, outdoor ? 1.3 : 2.5, -18.8);
            this.three.scene.add(northStand);
            if (!outdoor) {
                var westStand = new _three.Mesh(new _three.BoxGeometry(7.5, 4.4, 34), standMat);
                westStand.position.set(-28.5, 2.1, -1.5);
                var eastStand = new _three.Mesh(new _three.BoxGeometry(7.5, 4.4, 34), standMat);
                eastStand.position.set(28.5, 2.1, -1.5);
                this.three.scene.add(westStand, eastStand);
            }
        }
        var specGeo = new _three.BoxGeometry(0.68, 1.15, 0.52);
        var specMat = (0, _threeShared.createToonMaterial)(0xffffff);
        var maxSpecs = isMyCourt ? 16 : 160;
        this.crowdMesh = new _three.InstancedMesh(specGeo, specMat, maxSpecs);
        var palette = [
            new _three.Color(this.homeTeam.jerseyColor),
            new _three.Color(this.homeTeam.trimColor),
            new _three.Color(0xe2e8f0),
            new _three.Color(this.awayTeam.jerseyColor),
            new _three.Color(0x64748b)
        ];
        var count = 0;
        var rows = isMyCourt ? 1 : outdoor ? 2 : 3;
        for(var row = 0; row < rows && count < maxSpecs; row++){
            for(var x = -24; x <= 24 && count < maxSpecs; x += isMyCourt ? 3.4 : 1.45){
                var y = 1.8 + row * 1.45;
                var z = -15.4 - row * 1.85;
                this.crowdBasePos.push({
                    x: x,
                    y: y,
                    z: z,
                    phase: count * 0.7
                });
                _dummyPos.set(x, y, z);
                _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
                this.crowdMesh.setMatrixAt(count, _dummyMatrix);
                this.crowdMesh.setColorAt(count, palette[count % palette.length]);
                count++;
            }
        }
        this.crowdMesh.count = count;
        this.crowdMesh.instanceMatrix.needsUpdate = true;
        if (this.crowdMesh.instanceColor) this.crowdMesh.instanceColor.needsUpdate = true;
        this.crowdMesh.computeBoundingSphere();
        this.three.scene.add(this.crowdMesh);
    };
    _proto.buildHoopStanchion = function buildHoopStanchion(sideDir) {
        var hoopX = sideDir * _basketballLogic.HOOP_X;
        var baseX = sideDir * 22.3;
        var boardX = sideDir * 19.45;
        var group = new _three.Group();
        var isMyCourt = this.matchCtx.courtTheme === 'mycourt';
        var stanchionCol = isMyCourt ? hexStrToNum(_storage.playerState.hoops2k26.myCourt.stanchionHex, 0x1e293b) : 0x1e293b;
        var postMat = (0, _threeShared.createToonMaterial)(stanchionCol);
        var padMat = (0, _threeShared.createToonMaterial)(isMyCourt ? hexStrToNum(_storage.playerState.hoops2k26.myCourt.paintHex, this.homeTeam.jerseyColor) : sideDir === 1 ? this.homeTeam.jerseyColor : this.awayTeam.jerseyColor);
        var rimMat = (0, _threeShared.createToonMaterial)(0xf97316, {
            emissive: 0x9a3412,
            emissiveIntensity: 0.25
        });
        var basePad = new _three.Mesh(new _three.BoxGeometry(1.6, 1.35, 1.25), padMat);
        basePad.position.set(baseX, 0.68, 0);
        basePad.castShadow = true;
        (0, _threeShared.addInkOutline)(basePad, 1.05);
        var upright = new _three.Mesh(new _three.BoxGeometry(0.45, 3.6, 0.45), postMat);
        upright.position.set(baseX, 2.2, 0);
        (0, _threeShared.addInkOutline)(upright, 1.06);
        var arm = new _three.Mesh(new _three.BoxGeometry(2.75, 0.34, 0.36), postMat);
        arm.position.set(baseX - sideDir * 1.3, 3.55, 0);
        (0, _threeShared.addInkOutline)(arm, 1.05);
        var boardMat = new _three.MeshStandardMaterial({
            color: 0xe0f2fe,
            transparent: true,
            opacity: 0.42,
            roughness: 0.15,
            metalness: 0.1,
            depthWrite: false
        });
        var backboard = new _three.Mesh(new _three.BoxGeometry(0.08, 1.55, 2.4), boardMat);
        backboard.position.set(boardX, _basketballLogic.RIM_Y + 0.55, 0);
        backboard.renderOrder = 3;
        var frameTop = new _three.Mesh(new _three.BoxGeometry(0.11, 0.08, 2.46), (0, _threeShared.createToonMaterial)(0xf8fafc));
        frameTop.position.set(boardX, _basketballLogic.RIM_Y + 1.32, 0);
        var frameBot = new _three.Mesh(new _three.BoxGeometry(0.11, 0.08, 2.46), (0, _threeShared.createToonMaterial)(0xf8fafc));
        frameBot.position.set(boardX, _basketballLogic.RIM_Y - 0.22, 0);
        var rim = new _three.Mesh(new _three.TorusGeometry(0.45, 0.048, 10, 24), rimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.set(hoopX, _basketballLogic.RIM_Y, 0);
        var netGeo = new _three.CylinderGeometry(0.42, 0.23, 0.62, 12, 1, true);
        var netMat = new _three.MeshBasicMaterial({
            color: 0xf8fafc,
            wireframe: true,
            transparent: true,
            opacity: 0.85
        });
        var net = new _three.Mesh(netGeo, netMat);
        net.position.set(hoopX, _basketballLogic.RIM_Y - 0.32, 0);
        group.add(basePad, upright, arm, backboard, frameTop, frameBot, rim, net);
        this.three.scene.add(group);
        return net;
    };
    _proto.buildPlayDiagramAndVfx = function buildPlayDiagramAndVfx() {
        // 3D PlayVision Hardwood Arrows / Target Rings
        this.playDiagramGroup = new _three.Group();
        this.playDiagramGroup.position.y = 0.06;
        this.three.scene.add(this.playDiagramGroup);
        this.refreshPlayDiagramVisual();
        // 3D Perfect Release VFX Group (Flame / Crown / Burst around shooter)
        this.releaseVfxGroup = new _three.Group();
        var ringMat = new _three.MeshBasicMaterial({
            color: 0x4ade80,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.88
        });
        var outerRing = new _three.Mesh(new _three.RingGeometry(0.75, 1.15, 24), ringMat);
        outerRing.rotation.x = -Math.PI / 2;
        var crownMesh = new _three.Mesh(new _three.TorusGeometry(0.55, 0.08, 8, 18), new _three.MeshBasicMaterial({
            color: 0xfacc15
        }));
        crownMesh.rotation.x = Math.PI / 2;
        crownMesh.position.y = 2.6;
        this.releaseVfxGroup.add(outerRing, crownMesh);
        this.releaseVfxGroup.visible = false;
        this.three.scene.add(this.releaseVfxGroup);
        // Glowing Takeover Ignition Aura Ring
        this.takeoverAuraMesh = new _three.Mesh(new _three.RingGeometry(0.95, 1.35, 32), new _three.MeshBasicMaterial({
            color: 0xf97316,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.86,
            depthWrite: false
        }));
        this.takeoverAuraMesh.rotation.x = -Math.PI / 2;
        this.takeoverAuraMesh.position.y = 0.07;
        this.takeoverAuraMesh.visible = false;
        this.three.scene.add(this.takeoverAuraMesh);
    };
    _proto.refreshPlayDiagramVisual = function refreshPlayDiagramVisual() {
        while(this.playDiagramGroup.children.length > 0){
            this.playDiagramGroup.remove(this.playDiagramGroup.children[0]);
        }
        var pv = _storage.playerState.hoops2k26.settings.playVision;
        if (pv === 'off' || this.activePlayIdx === 0) return;
        var play = PLAY_BOOK[this.activePlayIdx];
        var mat = new _three.MeshBasicMaterial({
            color: 0x38bdf8,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.72,
            depthWrite: false
        });
        var spotRing = new _three.Mesh(new _three.RingGeometry(0.7, 1.05, 20), mat);
        spotRing.rotation.x = -Math.PI / 2;
        spotRing.position.set(11.5, 0, play.offsetZ);
        var arrowShaft = new _three.Mesh(new _three.PlaneGeometry(5.5, 0.35), mat);
        arrowShaft.rotation.x = -Math.PI / 2;
        arrowShaft.position.set(8.5, 0, play.offsetZ * 0.6);
        this.playDiagramGroup.add(spotRing, arrowShaft);
    };
    _proto.spawnTeams = function spawnTeams() {
        var _playerState_hoops2k26_customShoes_find;
        this.players = [];
        var n = this.playersPerSide;
        var roleIndices = n === 1 ? [
            0
        ] : n === 2 ? [
            0,
            4
        ] : n === 3 ? [
            0,
            2,
            4
        ] : [
            0,
            1,
            2,
            3,
            4
        ];
        var mp = (0, _arenaRoster.getActiveMyPlayer)(_storage.playerState.hoops2k26);
        var shoe = (_playerState_hoops2k26_customShoes_find = _storage.playerState.hoops2k26.customShoes.find(function(s) {
            return s.id === mp.equippedShoeId;
        })) != null ? _playerState_hoops2k26_customShoes_find : _storage.playerState.hoops2k26.customShoes[0];
        var shoePalette = shoe ? {
            upper: hexStrToNum(shoe.upperHex, 0x111827),
            sole: hexStrToNum(shoe.soleHex, 0xf8fafc),
            accent: hexStrToNum(shoe.accentHex, 0xf59e0b)
        } : undefined;
        for(var teamIdx = 0; teamIdx < 2; teamIdx++){
            var team = teamIdx === 0 ? 'home' : 'away';
            var def = team === 'home' ? this.homeTeam : this.awayTeam;
            var jerseyColor = this.getEffectiveJerseyColor(def, team === 'home');
            for(var i = 0; i < n; i++){
                var _def_starters_rIdx;
                var rIdx = roleIndices[i];
                var slot = ROLE_SLOTS[rIdx];
                var starter = (_def_starters_rIdx = def.starters[rIdx]) != null ? _def_starters_rIdx : def.starters[0];
                var isControlledMyPlayer = team === 'home' && i === 0 && this.matchCtx.useMyPlayer;
                var playerName = isControlledMyPlayer ? mp.name : starter.name;
                var playerRole = isControlledMyPlayer ? mp.position : starter.role;
                var rig = (0, _threeShared.buildBasketballPlayerMesh)(jerseyColor, def.trimColor, starter.skin, team === 'home', isControlledMyPlayer ? 0.96 + (mp.heightIn - 72) * 0.015 : starter.scale, true, team === 'home' && i === 0 ? shoePalette : undefined);
                this.three.scene.add(rig.group);
                this.players.push({
                    index: teamIdx * n + i,
                    team: team,
                    role: playerRole,
                    name: playerName,
                    rig: rig,
                    x: 0,
                    z: 0,
                    y: 0,
                    vx: 0,
                    vz: 0,
                    vy: 0,
                    facingYaw: team === 'home' ? Math.PI / 2 : -Math.PI / 2,
                    stamina: 1.0,
                    sprinting: false,
                    homeSlotX: slot.offX,
                    homeSlotZ: slot.offZ,
                    stealCd: 0,
                    stunTimer: 0,
                    blockTimer: 0,
                    animPhase: i * 1.1,
                    pointsScored: 0
                });
            }
        }
        this.updateActiveRing();
    };
    _proto.buildBasketball = function buildBasketball() {
        this.ballGroup = new _three.Group();
        var ballMat = (0, _threeShared.createToonMaterial)(0xea580c);
        var sphere = new _three.Mesh(new _three.SphereGeometry(0.24, 16, 14), ballMat);
        sphere.castShadow = true;
        (0, _threeShared.addInkOutline)(sphere, 1.09);
        var seamMat = new _three.MeshBasicMaterial({
            color: 0x0f172a
        });
        var seamA = new _three.Mesh(new _three.TorusGeometry(0.242, 0.015, 6, 18), seamMat);
        var seamB = new _three.Mesh(new _three.TorusGeometry(0.242, 0.015, 6, 18), seamMat);
        seamB.rotation.y = Math.PI / 2;
        this.ballGroup.add(sphere, seamA, seamB);
        this.three.scene.add(this.ballGroup);
        this.ballShadow = (0, _threeShared.createContactShadowMesh)(0.36, 0.45);
        this.three.scene.add(this.ballShadow);
    };
    _proto.updateActiveRing = function updateActiveRing() {
        for(var i = 0; i < this.players.length; i++){
            this.players[i].rig.activeRing.visible = i === this.controlledIdx;
        }
    };
    _proto.resetHalfCourtSetup = function resetHalfCourtSetup(offenseTeam, isTipoff) {
        if (isTipoff === void 0) isTipoff = false;
        var n = this.playersPerSide;
        var roleIndices = n === 1 ? [
            0
        ] : n === 2 ? [
            0,
            4
        ] : n === 3 ? [
            0,
            2,
            4
        ] : [
            0,
            1,
            2,
            3,
            4
        ];
        this.possession = offenseTeam;
        this.ballMode = 'held';
        this.meterActive = false;
        this.meterProgress = 0;
        this.iconPassingActive = false;
        this.shotClock = this.targetScore ? _basketballLogic.SHOT_CLOCK_SEC : Math.min(_basketballLogic.SHOT_CLOCK_SEC, Math.max(0.5, this.quarterClock));
        var offSign = offenseTeam === 'home' ? 1 : -1;
        for(var i = 0; i < n; i++){
            var slot = ROLE_SLOTS[roleIndices[i]];
            var homeP = this.players[i];
            var awayP = this.players[n + i];
            if (offenseTeam === 'home') {
                homeP.x = isTipoff && i === 0 ? -1.5 : -6.5 + i * 1.4;
                homeP.z = slot.offZ * 0.72;
                awayP.x = 7.5 + i * 2.1;
                awayP.z = slot.offZ * 0.65;
            } else {
                awayP.x = 6.5 - i * 1.4;
                awayP.z = slot.offZ * 0.72;
                homeP.x = -7.5 - i * 2.1;
                homeP.z = slot.offZ * 0.65;
            }
            homeP.y = 0;
            awayP.y = 0;
            homeP.vy = 0;
            awayP.vy = 0;
            homeP.vx = 0;
            homeP.vz = 0;
            awayP.vx = 0;
            awayP.vz = 0;
            homeP.facingYaw = offSign * (Math.PI / 2);
            awayP.facingYaw = offSign * (Math.PI / 2);
        }
        this.carrierIdx = offenseTeam === 'home' ? 0 : n;
        this.controlledIdx = 0;
        this.updateActiveRing();
        this.syncActionLabels();
        var carrier = this.players[this.carrierIdx];
        this.ballX = carrier.x + offSign * 0.55;
        this.ballY = 0.95;
        this.ballZ = carrier.z;
        this.syncMeshes();
        this.pushHudSnapshot();
    };
    _proto.syncActionLabels = function syncActionLabels() {
        var nextLabel = this.possession === 'home' ? 'SHOOT' : 'BLOCK';
        if (nextLabel !== this.lastActionBtnMode) {
            this.lastActionBtnMode = nextLabel;
            (0, _runtimeBridge.setActionButtonLabel)(nextLabel);
        }
    };
    _proto.applyGradeEvent = function applyGradeEvent(event, label, takeoverDelta) {
        if (takeoverDelta === void 0) takeoverDelta = 0;
        var res = (0, _basketballLogic.stepTeammateGrade)(this.teammateGradeScore, event);
        this.teammateGradeScore = res.score;
        this.teammateGrade = res.grade;
        this.gradeFlash = "" + (res.delta >= 0 ? '+' : '') + label;
        this.gradeFlashTimer = 1.6;
        if (takeoverDelta !== 0 && !this.takeoverActive) {
            var tk = (0, _basketballLogic.stepTakeoverMeter)(this.takeoverMeter, takeoverDelta);
            this.takeoverMeter = tk.meter;
            this.takeoverLevel = tk.level;
        }
    };
    _proto.getHotZoneForPosition = function getHotZoneForPosition(x, z) {
        var mp = (0, _arenaRoster.getActiveMyPlayer)(_storage.playerState.hoops2k26);
        if (Math.hypot(x - _basketballLogic.HOOP_X, z) < 4.5) return mp.hotZones.paint;
        if (z < -7.5) return mp.hotZones.left_corner;
        if (z > 7.5) return mp.hotZones.right_corner;
        if (z < -2.2) return mp.hotZones.left_wing;
        if (z > 2.2) return mp.hotZones.right_wing;
        return mp.hotZones.top_key;
    };
    _proto.onShootPressed = function onShootPressed() {
        var p = this.players[this.controlledIdx];
        if (!p || this.inboundPause > 0 || this.quarterBreakPause > 0) return;
        if (this.ballMode === 'held' && this.carrierIdx === this.controlledIdx) {
            if ((0, _basketballLogic.canAttemptDunk)(p.x, p.z, _basketballLogic.HOOP_X, p.sprinting || this.sprintHeld, p.stamina)) {
                this.startDunk(p);
                return;
            }
            var defenderDistances = [];
            var n = this.playersPerSide;
            for(var i = n; i < n * 2; i++){
                defenderDistances.push(Math.hypot(this.players[i].x - p.x, this.players[i].z - p.z));
            }
            var prof = _storage.playerState.hoops2k26;
            var mp = (0, _arenaRoster.getActiveMyPlayer)(prof);
            var jsEval = (0, _arenaRoster.evaluateCustomJumpShot)(mp.jumpShot);
            var effectiveShootRating = this.matchCtx.useMyPlayer ? Math.max(2, Math.min(5, 1 + (mp.attributes.shooting - 55) / 11)) : this.homeTeam.shootRating;
            var win = (0, _basketballLogic.computeShotWindowEnhanced)({
                shooterPos: {
                    x: p.x,
                    z: p.z
                },
                hoopX: _basketballLogic.HOOP_X,
                defenderDistances: defenderDistances,
                shootRating: effectiveShootRating,
                staminaRatio: p.stamina,
                sprinting: p.sprinting || this.sprintHeld,
                jumpShotMeterOff: prof.settings.jumpShotMeterOff,
                jumpShotGreenBonus: jsEval.greenWindowBonus,
                hotZoneHeat: this.getHotZoneForPosition(p.x, p.z),
                takeoverActive: this.takeoverActive,
                skillBoostActive: prof.skillBoosts > 0
            });
            this.meterActive = true;
            this.meterProgress = 0;
            this.meterGreenStart = win.greenStart;
            this.meterGreenEnd = win.greenEnd;
            this.meterBaseProb = win.baseMakeProb;
            this.meterPoints = win.points;
            this.meterCoverage = win.coverageLabel;
            this.meterOffBoostApplied = win.meterOffBoostApplied;
            p.vy = 4.6;
            return;
        }
        if (p.y <= 0.05 && p.blockTimer <= 0) {
            p.vy = 6.2;
            p.blockTimer = 0.55;
            _audio.ArcadeAudio.play('jump');
        }
    };
    _proto.onShootReleased = function onShootReleased() {
        if (!this.meterActive) return;
        this.releaseUserShot();
    };
    _proto.releaseUserShot = function releaseUserShot() {
        var shooter = this.players[this.controlledIdx];
        this.meterActive = false;
        if (!shooter || this.ballMode !== 'held' || this.carrierIdx !== this.controlledIdx) {
            return;
        }
        var evalRes = (0, _basketballLogic.evaluateShotRelease)(this.meterProgress, this.meterGreenStart, this.meterGreenEnd, this.meterBaseProb, this.meterPoints);
        this.stats.fga += 1;
        if (evalRes.points === 3) this.stats.tpa += 1;
        var willMake = evalRes.isGreen ? true : Math.random() < evalRes.makeProb;
        var timingStr = evalRes.isGreen ? 'EXCELLENT' : evalRes.quality === 'GREAT' ? 'GREAT' : evalRes.quality === 'EARLY' ? 'SLIGHTLY EARLY' : 'SLIGHTLY LATE';
        if (_storage.playerState.hoops2k26.settings.shotFeedback !== 'off') {
            this.shotFeedback = {
                timing: timingStr,
                coverage: this.meterCoverage,
                isGreen: evalRes.isGreen,
                ttl: 2.2
            };
        }
        if (evalRes.isGreen) {
            this.stats.greens += 1;
            this.releaseVfxGroup.position.set(shooter.x, 0.08, shooter.z);
            this.releaseVfxGroup.visible = true;
            this.releaseVfxTimer = 1.25;
            this.popBanner(this.meterOffBoostApplied ? 'GREEN RELEASE (+METER OFF BOOST)!' : 'EXCELLENT GREEN RELEASE!', '#4ade80', 1.2);
            this.crowdExcite = Math.min(1, this.crowdExcite + 0.55);
        } else if (evalRes.quality === 'EARLY') {
            this.popBanner("SLIGHTLY EARLY \xb7 " + this.meterCoverage, '#fbbf24', 0.85);
        } else if (evalRes.quality === 'LATE') {
            this.popBanner("SLIGHTLY LATE \xb7 " + this.meterCoverage, '#f87171', 0.85);
        }
        this.launchShot(shooter, _basketballLogic.HOOP_X, evalRes.points, willMake, evalRes.isGreen);
        this.pushHudSnapshot();
    };
    _proto.startDunk = function startDunk(p) {
        this.ballMode = 'dunk';
        this.meterActive = false;
        this.dunkFromX = p.x;
        this.dunkFromZ = p.z;
        this.dunkTargetX = _basketballLogic.HOOP_X - 0.55;
        this.dunkTimer = 0;
        this.dunkDuration = 0.42;
        this.stats.fga += 1;
        p.stamina = Math.max(0, p.stamina - 0.14);
        _audio.ArcadeAudio.play('jump');
        this.popBanner('POSTERIZER DRIVE!', this.homeTeam.accentHex, 0.85);
    };
    _proto.launchShot = function launchShot(shooter, targetHoopX, points, willMake, wasGreen) {
        this.ballMode = 'shot';
        this.shotStartX = this.ballX;
        this.shotStartY = Math.max(2.3, shooter.y + 2.35);
        this.shotStartZ = this.ballZ;
        var dir = targetHoopX > 0 ? 1 : -1;
        this.shotTargetX = willMake ? targetHoopX : targetHoopX - dir * 0.44;
        this.shotTargetZ = willMake ? 0 : Math.random() > 0.5 ? 0.36 : -0.36;
        var dist = Math.hypot(targetHoopX - shooter.x, shooter.z);
        this.shotDuration = Math.max(0.55, Math.min(1.08, 0.46 + dist * 0.032));
        this.shotPeakY = Math.max(this.shotStartY + 1.5, _basketballLogic.RIM_Y + 2.0 + dist * 0.13);
        this.shotTimer = 0;
        this.shotWillMake = willMake;
        this.shotPoints = points;
        this.shotTeam = shooter.team;
        this.shotWasGreen = wasGreen;
        this.shotShooterIdx = shooter.index;
        shooter.facingYaw = Math.atan2(targetHoopX - shooter.x, -shooter.z);
    };
    _proto.onPassOrSwitch = function onPassOrSwitch() {
        if (this.inboundPause > 0 || this.quarterBreakPause > 0) return;
        if (this.ballMode === 'held' && this.carrierIdx === this.controlledIdx && this.playersPerSide > 1) {
            var carrier = this.players[this.controlledIdx];
            var aimX = (this.steerRightHeld ? 1 : 0) - (this.steerLeftHeld ? 1 : 0) || this.moveDx;
            var aimZ = this.moveDy;
            var n = this.playersPerSide;
            var mates = this.players.slice(0, n).map(function(m) {
                return {
                    index: m.index,
                    x: m.x,
                    z: m.z
                };
            });
            var targetIdx = (0, _basketballLogic.pickBestPassTargetIndex)({
                x: carrier.x,
                z: carrier.z
            }, {
                x: aimX,
                z: aimZ
            }, _basketballLogic.HOOP_X, this.controlledIdx, mates);
            if (targetIdx >= 0) {
                this.lastUserPassToIdx = targetIdx;
                this.lastUserPassTimer = 4.5;
                this.startPass(carrier, this.players[targetIdx]);
                this.controlledIdx = targetIdx;
                this.updateActiveRing();
            }
            return;
        }
        var bestIdx = this.controlledIdx;
        var bestDist = Infinity;
        for(var i = 0; i < this.playersPerSide; i++){
            if (i === this.controlledIdx) continue;
            var d = Math.hypot(this.players[i].x - this.ballX, this.players[i].z - this.ballZ);
            if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
            }
        }
        if (bestIdx !== this.controlledIdx) {
            this.controlledIdx = bestIdx;
            this.updateActiveRing();
            _audio.ArcadeAudio.play('click');
        }
    };
    _proto.startPass = function startPass(from, to) {
        this.ballMode = 'pass';
        this.passFromX = from.x;
        this.passFromY = 1.42;
        this.passFromZ = from.z;
        this.passTargetIdx = to.index;
        var dist = Math.hypot(to.x - from.x, to.z - from.z);
        this.passDuration = Math.max(0.18, Math.min(0.42, dist / 28));
        this.passTimer = 0;
        this.meterActive = false;
        _audio.ArcadeAudio.play('dribble');
    };
    _proto.onStealPressed = function onStealPressed() {
        var _this_players_this_carrierIdx;
        var p = this.players[this.controlledIdx];
        if (!p || p.stealCd > 0 || this.inboundPause > 0 || this.quarterBreakPause > 0) return;
        p.stealCd = 0.72;
        // Consume 1 Adrenaline Bar on defensive lunge / crossover burst
        var adr = (0, _basketballLogic.stepAdrenalineBars)(this.adrenalineBars, this.adrenalineRechargeTimer, 0, true, false);
        this.adrenalineBars = adr.bars;
        this.adrenalineRechargeTimer = adr.rechargeTimer;
        if (this.ballMode === 'held' && ((_this_players_this_carrierIdx = this.players[this.carrierIdx]) == null ? void 0 : _this_players_this_carrierIdx.team) === 'away') {
            var opp = this.players[this.carrierIdx];
            var dist = Math.hypot(opp.x - p.x, opp.z - p.z);
            var dx = opp.x - p.x;
            var dz = opp.z - p.z;
            if (dist > 0.1) {
                p.x += dx / dist * Math.min(0.8, dist * 0.45);
                p.z += dz / dist * Math.min(0.8, dist * 0.45);
            }
            if (dist < 2.25) {
                var stealProb = 0.36 + (this.homeTeam.defRating - 3) * 0.08 + (this.takeoverActive ? 0.18 : 0);
                if (Math.random() < stealProb) {
                    opp.stunTimer = 0.75;
                    this.carrierIdx = p.index;
                    this.possession = 'home';
                    this.shotClock = this.targetScore ? _basketballLogic.SHOT_CLOCK_SEC : Math.min(_basketballLogic.SHOT_CLOCK_SEC, Math.max(0.5, this.quarterClock));
                    this.score += 15;
                    this.stats.stl += 1;
                    this.applyGradeEvent('steal', 'STEAL', 75);
                    (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
                    _audio.ArcadeAudio.play('whistle');
                    this.popBanner('GLOVE STEAL! +15', '#38bdf8', 1.15);
                    this.syncActionLabels();
                    this.pushHudSnapshot();
                    return;
                }
            }
            _audio.ArcadeAudio.play('click');
        } else if (this.ballMode === 'held' && this.carrierIdx === this.controlledIdx && p.stamina > 0.1) {
            p.stamina = Math.max(0, p.stamina - 0.12);
            p.z = Math.max(-_basketballLogic.COURT_HALF_WID + 0.8, Math.min(_basketballLogic.COURT_HALF_WID - 0.8, p.z + (p.z >= 0 ? -1.1 : 1.1)));
            _audio.ArcadeAudio.play('dribble');
        }
    };
    _proto.scoreBasket = function scoreBasket(team, points, label) {
        var shooter = this.players[this.shotShooterIdx];
        if (shooter) shooter.pointsScored += points;
        if (team === 'home') {
            this.homeScore += points;
            this.rightNetShake = 1.0;
            this.stats.pts += points;
            this.stats.fgm += 1;
            if (points === 3) this.stats.tpm += 1;
            if (this.lastUserPassTimer > 0 && this.shotShooterIdx === this.lastUserPassToIdx) {
                this.stats.ast += 1;
                this.applyGradeEvent('assist', 'ASSIST', 65);
                this.lastUserPassTimer = 0;
            }
            if (this.shotWasGreen) {
                this.applyGradeEvent('green_make', 'GREEN BUCKET', 95);
            } else {
                this.applyGradeEvent('good_shot', 'GOOD SHOT', 65);
            }
            var ptsValue = points === 3 ? 35 : 25;
            var greenBonus = this.shotWasGreen ? 15 : 0;
            this.score += ptsValue + greenBonus;
            (0, _runtimeBridge.addCoins)((points === 3 ? 20 : 12) + (this.shotWasGreen ? 10 : 0));
            (0, _runtimeBridge.addXp)(18);
            (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
            this.popBanner(label + " +" + points, points === 3 ? '#4ade80' : '#facc15', 1.35);
        } else {
            this.awayScore += points;
            this.leftNetShake = 1.0;
            this.applyGradeEvent('defensive_breakdown', 'ALLOWED SCORE', -25);
            this.popBanner(this.awayTeam.abbr + " SCORES +" + points, '#f87171', 1.1);
        }
        _audio.ArcadeAudio.play('swish');
        this.crowdExcite = 1.0;
        // Check Park / Blacktop / Street Kings Target Score 21 win condition!
        if (this.targetScore && (this.homeScore >= this.targetScore || this.awayScore >= this.targetScore)) {
            this.finishMatch();
            return;
        }
        this.inboundPause = 0.85;
        this.pendingInboundTeam = team === 'home' ? 'away' : 'home';
        this.pushHudSnapshot();
    };
    _proto.finishMatch = function finishMatch() {
        var _ref, _ref1;
        _audio.ArcadeAudio.play('buzzer');
        this.gameOver = true;
        this.isRunning = false;
        this.meterActive = false;
        var won = this.homeScore >= this.awayScore;
        var winBonus = won ? 120 : 25;
        var coinReward = won ? 60 : 15;
        if (this.modeDef.id === 'tournament' && !_storage.playerState.hoops2k26.activeMatchContext) {
            var res = (0, _arenaRoster.advanceTournamentBracket)(_storage.playerState.hoopsTournament, won);
            _storage.playerState.hoopsTournament = res.nextState;
            coinReward += res.bonusCoins;
            if (res.wonChampionship) {
                _storage.playerState.hoopsChampionships++;
                winBonus += 250;
            }
            (0, _storage.persistHoopsTournament)();
        }
        this.score += this.homeScore * 10 + winBonus;
        (0, _runtimeBridge.addCoins)(coinReward);
        (0, _runtimeBridge.addXp)(won ? 85 : 30);
        // Compute & persist complete 4-Tab NBA 2K26 Post-Game Progression
        var prof = _storage.playerState.hoops2k26;
        var mp = (0, _arenaRoster.getActiveMyPlayer)(prof);
        var doubleXpActive = prof.doubleXpUntilMs > Date.now();
        var rewards = (0, _arenaRoster.computeHoopsPostGameRewards)({
            won: won,
            homeScore: this.homeScore,
            awayScore: this.awayScore,
            points: this.stats.pts,
            rebounds: this.stats.reb,
            assists: this.stats.ast,
            steals: this.stats.stl,
            blocks: this.stats.blk,
            turnovers: this.stats.tov,
            greens: this.stats.greens,
            teammateGrade: this.teammateGrade,
            teammateGradeScore: this.teammateGradeScore,
            difficulty: prof.settings.difficulty,
            courtContext: this.matchCtx,
            crewLevel: prof.crewLevel,
            doubleXpActive: doubleXpActive
        });
        prof.vc += rewards.totalVc;
        prof.mtp += rewards.mtpEarned;
        prof.repXp += rewards.repXpEarned;
        prof.crewXp += rewards.crewXpEarned;
        if (prof.crewXp >= prof.crewLevel * 250 && prof.crewLevel < 30) {
            prof.crewXp -= prof.crewLevel * 250;
            prof.crewLevel += 1;
        }
        prof.plateScore = Math.max(0, Math.min(1000, prof.plateScore + rewards.plateDelta));
        prof.seasonXp += rewards.seasonXpEarned;
        prof.careerStats.gamesPlayed += 1;
        if (won) prof.careerStats.wins += 1;
        prof.careerStats.points += this.stats.pts;
        prof.careerStats.rebounds += this.stats.reb;
        prof.careerStats.assists += this.stats.ast;
        prof.careerStats.steals += this.stats.stl;
        prof.careerStats.blocks += this.stats.blk;
        prof.careerStats.greens += this.stats.greens;
        if (prof.skillBoosts > 0) prof.skillBoosts = Math.max(0, prof.skillBoosts - 1);
        if (prof.gatoradeBoosts > 0) prof.gatoradeBoosts = Math.max(0, prof.gatoradeBoosts - 1);
        mp.myPoints += rewards.myPointsEarned;
        mp.badgeXp += rewards.badgeXpEarned;
        if (this.matchCtx.courtTheme === 'nba_arena' && this.matchCtx.useMyPlayer) {
            mp.nbaSeasonGamesPlayed += 1;
            if (won) mp.nbaSeasonGamesWon += 1;
        }
        if (rewards.hotZoneUpgraded) {
            mp.hotZones.top_key = mp.hotZones.top_key === 'hot' ? 'lethal' : 'hot';
        }
        // Update Daily Challenges
        for(var _iterator = _create_for_of_iterator_helper_loose(prof.dailyChallenges.tasks), _step; !(_step = _iterator()).done;){
            var task = _step.value;
            if (task.id === 'dc_pts') task.progress = Math.min(task.target, task.progress + this.stats.pts);
            if (task.id === 'dc_green') task.progress = Math.min(task.target, task.progress + this.stats.greens);
            if (task.id === 'dc_win' && won) task.progress = Math.min(task.target, task.progress + 1);
        }
        (0, _storage.persistHoops2K26)();
        var repTier = (0, _arenaRoster.getRepTierForXp)(prof.repXp);
        var plate = (0, _arenaRoster.getPlateTierForScore)(prof.plateScore);
        var seasonLevel = Math.min(40, 1 + Math.floor(prof.seasonXp / 300));
        var leadPlayer = this.players[0];
        this.postGameSummary = {
            won: won,
            homeTeamName: this.homeTeam.name,
            homeAbbr: this.homeTeam.abbr,
            awayTeamName: this.awayTeam.name,
            awayAbbr: this.awayTeam.abbr,
            homeScore: this.homeScore,
            awayScore: this.awayScore,
            courtLabel: this.matchCtx.sourceLabel,
            potgName: (_ref = leadPlayer == null ? void 0 : leadPlayer.name) != null ? _ref : mp.name,
            potgLine: this.stats.pts + " PTS \xb7 " + this.stats.reb + " REB \xb7 " + this.stats.ast + " AST \xb7 " + this.teammateGrade,
            playerName: (_ref1 = leadPlayer == null ? void 0 : leadPlayer.name) != null ? _ref1 : mp.name,
            teammateGrade: this.teammateGrade,
            stats: _extends({}, this.stats),
            rewards: rewards,
            repLabel: repTier.tier.label,
            plateLabel: plate.label,
            plateColorHex: plate.hex,
            crewLevel: prof.crewLevel,
            seasonLevel: seasonLevel
        };
        this.pushHudSnapshot();
    };
    _proto.popBanner = function popBanner(text, color, dur) {
        if (dur === void 0) dur = 1.1;
        this.banner = {
            text: text,
            color: color,
            timer: dur,
            maxTimer: dur
        };
    };
    _proto.getIconPassTargets = function getIconPassTargets() {
        var out = [];
        var keyNum = 1;
        for(var i = 0; i < this.playersPerSide; i++){
            if (i === this.controlledIdx) continue;
            var m = this.players[i];
            if (!m) continue;
            out.push({
                index: m.index,
                keyLabel: String(keyNum++),
                name: m.name,
                role: m.role
            });
        }
        return out;
    };
    _proto.pushHudSnapshot = function pushHudSnapshot() {
        var _this_players_this_controlledIdx, _ref, _ref1, _ref2;
        var activeP = (_this_players_this_controlledIdx = this.players[this.controlledIdx]) != null ? _this_players_this_controlledIdx : this.players[0];
        var prof = _storage.playerState.hoops2k26;
        var snap = {
            courtLabel: this.matchCtx.sourceLabel,
            isOutdoorPark: this.isOutdoorCourt() || this.targetScore !== null,
            homeName: this.homeTeam.name,
            homeAbbr: this.homeTeam.abbr,
            homeAccent: this.homeTeam.accentHex,
            homeScore: this.homeScore,
            awayName: this.awayTeam.name,
            awayAbbr: this.awayTeam.abbr,
            awayAccent: this.awayTeam.accentHex,
            awayScore: this.awayScore,
            quarter: this.quarter,
            quarterClock: this.quarterClock,
            targetScore: this.targetScore,
            shotClock: this.shotClock,
            homeFouls: this.homeFouls,
            awayFouls: this.awayFouls,
            homeTimeouts: this.homeTimeouts,
            awayTimeouts: this.awayTimeouts,
            teammateGrade: this.teammateGrade,
            teammateGradeScore: this.teammateGradeScore,
            gradeFlash: this.gradeFlashTimer > 0 ? this.gradeFlash : '',
            playerName: (_ref = activeP == null ? void 0 : activeP.name) != null ? _ref : 'MyPLAYER',
            playerPos: (_ref1 = activeP == null ? void 0 : activeP.role) != null ? _ref1 : 'PG',
            stats: {
                pts: this.stats.pts,
                reb: this.stats.reb,
                ast: this.stats.ast,
                stl: this.stats.stl,
                blk: this.stats.blk,
                greens: this.stats.greens
            },
            takeoverMeter: this.takeoverMeter,
            takeoverLevel: this.takeoverLevel,
            takeoverActive: this.takeoverActive,
            takeoverName: this.takeoverName,
            adrenalineBars: this.adrenalineBars,
            stamina: (_ref2 = activeP == null ? void 0 : activeP.stamina) != null ? _ref2 : 1,
            shotMeterOffBoost: prof.settings.jumpShotMeterOff,
            shotFeedback: this.shotFeedback,
            iconPassingActive: this.iconPassingActive,
            iconPassTargets: this.getIconPassTargets(),
            activePlayName: PLAY_BOOK[this.activePlayIdx].name,
            coachScheme: COACH_SCHEMES[this.coachSchemeIdx],
            cameraAngle: prof.settings.cameraAngle,
            postGameSummary: this.postGameSummary
        };
        (0, _runtimeBridge.updateHoopsHud)(snap);
    };
    _proto.stepSimulation = function stepSimulation(dt) {
        if (this.banner) {
            this.banner.timer -= dt;
            if (this.banner.timer <= 0) this.banner = null;
        }
        if (this.gradeFlashTimer > 0) this.gradeFlashTimer = Math.max(0, this.gradeFlashTimer - dt);
        if (this.lastUserPassTimer > 0) this.lastUserPassTimer = Math.max(0, this.lastUserPassTimer - dt);
        if (this.shotFeedback) {
            this.shotFeedback.ttl -= dt;
            if (this.shotFeedback.ttl <= 0) this.shotFeedback = null;
        }
        if (this.releaseVfxTimer > 0) {
            this.releaseVfxTimer -= dt;
            this.releaseVfxGroup.rotation.y += dt * 4.5;
            this.releaseVfxGroup.scale.setScalar(1 + (1.25 - this.releaseVfxTimer) * 0.45);
            if (this.releaseVfxTimer <= 0) this.releaseVfxGroup.visible = false;
        }
        if (this.takeoverActive) {
            this.takeoverActiveTimer -= dt;
            this.takeoverMeter = Math.max(0, this.takeoverActiveTimer / 16 * 500);
            this.takeoverLevel = Math.min(5, Math.floor(this.takeoverMeter / 100));
            if (this.takeoverActiveTimer <= 0) {
                this.takeoverActive = false;
                this.takeoverMeter = 0;
                this.takeoverLevel = 0;
                this.takeoverAuraMesh.visible = false;
            }
        }
        this.leftNetShake = Math.max(0, this.leftNetShake - dt * 2.4);
        this.rightNetShake = Math.max(0, this.rightNetShake - dt * 2.4);
        this.crowdExcite = Math.max(0, this.crowdExcite - dt * 0.65);
        this.camShake = Math.max(0, this.camShake - dt * 2.8);
        if (this.quarterBreakPause > 0) {
            this.quarterBreakPause -= dt;
            if (this.quarterBreakPause <= 0) {
                this.resetHalfCourtSetup(this.quarter % 2 === 1 ? 'home' : 'away', true);
            }
            return;
        }
        if (this.inboundPause > 0) {
            this.inboundPause -= dt;
            if (this.inboundPause <= 0) {
                this.resetHalfCourtSetup(this.pendingInboundTeam, false);
            }
            return;
        }
        // Advance Match & Shot clocks (for Target Score 21 games, only 24s shot clock runs)
        if (this.targetScore) {
            this.shotClock -= dt;
            if (this.shotClock <= 0) {
                _audio.ArcadeAudio.play('whistle');
                this.popBanner('24s SHOT CLOCK VIOLATION!', '#fbbf24', 1.2);
                if (this.possession === 'home') this.applyGradeEvent('shot_clock_violation', 'SHOT CLOCK', -40);
                this.shotClock = _basketballLogic.SHOT_CLOCK_SEC;
                this.inboundPause = 0.8;
                this.pendingInboundTeam = this.possession === 'home' ? 'away' : 'home';
                return;
            }
        } else {
            var clockStep = (0, _basketballLogic.stepMatchClocks)(this.quarter, this.quarterClock, this.shotClock, this.homeScore, this.awayScore, dt, this.maxQuarters, this.quarterLengthSec);
            this.quarter = clockStep.quarter;
            this.quarterClock = clockStep.quarterClock;
            this.shotClock = clockStep.shotClock;
            if (clockStep.matchOver) {
                this.finishMatch();
                return;
            }
            if (clockStep.quarterEnded) {
                _audio.ArcadeAudio.play('buzzer');
                this.quarterBreakPause = 1.5;
                this.homeFouls = 0;
                this.awayFouls = 0;
                var label = this.quarter > 4 ? 'OVERTIME!' : "QUARTER " + this.quarter;
                this.popBanner(label, '#38bdf8', 1.4);
                this.pushHudSnapshot();
                return;
            }
            if (clockStep.shotClockViolation) {
                _audio.ArcadeAudio.play('whistle');
                this.popBanner('24s SHOT CLOCK VIOLATION!', '#fbbf24', 1.25);
                if (this.possession === 'home') {
                    this.stats.tov += 1;
                    this.applyGradeEvent('shot_clock_violation', 'SHOT CLOCK', -40);
                }
                this.inboundPause = 0.85;
                this.pendingInboundTeam = this.possession === 'home' ? 'away' : 'home';
                return;
            }
        }
        // Advance Pro-Stick Shot Meter using Custom Jump Shot speed
        if (this.meterActive) {
            var mp = (0, _arenaRoster.getActiveMyPlayer)(_storage.playerState.hoops2k26);
            var jsEval = (0, _arenaRoster.evaluateCustomJumpShot)(mp.jumpShot);
            var meterSpeed = (1.24 + (5 - this.homeTeam.shootRating) * 0.05) * jsEval.meterSpeedMult;
            this.meterProgress = Math.min(1.0, this.meterProgress + meterSpeed * dt);
            if (this.meterProgress >= 1.0) {
                this.releaseUserShot();
            }
        }
        this.stepControlledPlayer(dt);
        this.stepAIPlayers(dt);
        this.stepBallPhysics(dt);
        this.animateCrowd();
    };
    _proto.stepControlledPlayer = function stepControlledPlayer(dt) {
        var p = this.players[this.controlledIdx];
        if (!p) return;
        var rawInX = Math.abs(this.moveDx) > 0.08 ? this.moveDx : (this.steerRightHeld ? 1 : 0) - (this.steerLeftHeld ? 1 : 0);
        var rawInY = Math.abs(this.moveDy) > 0.08 ? this.moveDy : 0;
        // Remap screen input to world (X, Z) according to active Camera Angle!
        var settings = _storage.playerState.hoops2k26.settings;
        var worldDx = rawInX;
        var worldDz = rawInY;
        if (settings.cameraAngle === '2k') {
            var flipToDef = settings.flipCamera && this.possession === 'away';
            if (!flipToDef) {
                // Camera is behind left baseline looking +X: screen Up (rawInY < 0) => +X, screen Right (rawInX > 0) => +Z
                worldDx = -rawInY;
                worldDz = rawInX;
            } else {
                // Camera flipped behind right baseline looking -X: screen Up (rawInY < 0) => -X, screen Right (rawInX > 0) => -Z
                worldDx = rawInY;
                worldDz = -rawInX;
            }
        }
        var mag = Math.hypot(worldDx, worldDz);
        var nx = mag > 1 ? worldDx / mag : worldDx;
        var nz = mag > 1 ? worldDz / mag : worldDz;
        var wantsSprint = this.sprintHeld && mag > 0.15 && p.stamina > 0.04;
        var burstTriggered = wantsSprint && !this.wasSprintingLastFrame;
        this.wasSprintingLastFrame = wantsSprint;
        var hasRecharge = _storage.playerState.hoops2k26.repXp >= 4800;
        var adrStep = (0, _basketballLogic.stepAdrenalineBars)(this.adrenalineBars, this.adrenalineRechargeTimer, dt, burstTriggered, hasRecharge);
        this.adrenalineBars = adrStep.bars;
        this.adrenalineRechargeTimer = adrStep.rechargeTimer;
        p.sprinting = wantsSprint;
        var gatoradeMult = _storage.playerState.hoops2k26.gatoradeBoosts > 0 ? 0.78 : 1.0;
        if (wantsSprint) {
            p.stamina = Math.max(0, p.stamina - dt * 0.32 * gatoradeMult);
        } else {
            p.stamina = Math.min(1, p.stamina + dt * 0.24);
        }
        var staminaPct = Math.round(p.stamina * 100);
        if (Math.abs(staminaPct - this.lives) >= 3) {
            this.lives = staminaPct;
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        }
        if (this.ballMode === 'dunk' && this.carrierIdx === p.index) return;
        var speedRatingMult = 0.94 + this.homeTeam.speedRating * 0.04 + (this.takeoverActive ? 0.14 : 0);
        var adrenalinePenalty = this.adrenalineBars === 0 ? 0.84 : 1.0;
        var baseSpeed = 8.4 * speedRatingMult * (wantsSprint ? 1.4 * adrenalinePenalty : 1.0) * (this.meterActive ? 0.18 : 1.0);
        if (mag > 0.06) {
            p.vx = nx * baseSpeed;
            p.vz = nz * baseSpeed;
            p.facingYaw = Math.atan2(p.vx, p.vz);
            p.animPhase += dt * (wantsSprint ? 13.5 : 9.2);
        } else {
            p.vx *= Math.exp(-12 * dt);
            p.vz *= Math.exp(-12 * dt);
        }
        p.x = Math.max(-_basketballLogic.COURT_HALF_LEN + 0.7, Math.min(_basketballLogic.COURT_HALF_LEN - 0.7, p.x + p.vx * dt));
        p.z = Math.max(-_basketballLogic.COURT_HALF_WID + 0.7, Math.min(_basketballLogic.COURT_HALF_WID - 0.7, p.z + p.vz * dt));
    };
    _proto.stepAIPlayers = function stepAIPlayers(dt) {
        this.aiDecisionTimer -= dt;
        this.aiAttackPhaseTimer += dt;
        var activePlay = PLAY_BOOK[this.activePlayIdx];
        var scheme = COACH_SCHEMES[this.coachSchemeIdx];
        for(var i = 0; i < this.players.length; i++){
            var p = this.players[i];
            p.stealCd = Math.max(0, p.stealCd - dt);
            p.stunTimer = Math.max(0, p.stunTimer - dt);
            p.blockTimer = Math.max(0, p.blockTimer - dt);
            if (p.y > 0 || p.vy !== 0) {
                p.y += p.vy * dt;
                p.vy -= 17.5 * dt;
                if (p.y <= 0) {
                    p.y = 0;
                    p.vy = 0;
                }
            }
            if (i === this.controlledIdx) continue;
            if (this.ballMode === 'dunk' && this.carrierIdx === i) continue;
            var targetX = p.x;
            var targetZ = p.z;
            var maxSpd = 6.9;
            if (this.ballMode === 'loose') {
                targetX = this.ballX;
                targetZ = this.ballZ;
                maxSpd = 7.8;
            } else if (p.team === this.possession) {
                var offSign = p.team === 'home' ? 1 : -1;
                if (this.ballMode === 'held' && this.carrierIdx === p.index && p.team === 'away') {
                    var rimTargetX = -_basketballLogic.HOOP_X + 4.4;
                    var cutOffset = Math.sin(this.aiAttackPhaseTimer * 1.4) * 3.8;
                    targetX = rimTargetX;
                    targetZ = cutOffset;
                    maxSpd = 6.8 + (this.scaler.speedMult - 0.85) * 1.6;
                } else {
                    var slot = ROLE_SLOTS[p.index % 5];
                    var weave = Math.sin(this.aiAttackPhaseTimer * 1.1 + p.index) * 1.5;
                    var playShiftZ = p.team === 'home' ? activePlay.offsetZ * 0.45 : 0;
                    targetX = offSign * slot.offX;
                    targetZ = Math.max(-_basketballLogic.COURT_HALF_WID + 1.2, Math.min(_basketballLogic.COURT_HALF_WID - 1.2, slot.offZ + weave + playShiftZ));
                }
            } else {
                var n = this.playersPerSide;
                var oppIdx = p.team === 'home' ? n + p.index % n : p.index % n;
                var mark = this.players[oppIdx];
                var defHoopX = p.team === 'home' ? -_basketballLogic.HOOP_X : _basketballLogic.HOOP_X;
                if (p.team === 'home' && scheme === '2-3 Zone') {
                    var slot1 = ROLE_SLOTS[p.index % 5];
                    targetX = slot1.defX * 0.88 + this.ballX * 0.12;
                    targetZ = slot1.defZ * 0.85 + this.ballZ * 0.2;
                } else {
                    var isOnBall = this.ballMode === 'held' && this.carrierIdx === oppIdx;
                    var guardFrac = isOnBall ? 0.16 : 0.25;
                    targetX = mark.x + (defHoopX - mark.x) * guardFrac;
                    targetZ = mark.z + (0 - mark.z) * guardFrac;
                }
                maxSpd = p.team === 'away' ? 6.5 * this.scaler.speedMult : 7.3;
            }
            if (p.stunTimer > 0) maxSpd *= 0.25;
            var dx = targetX - p.x;
            var dz = targetZ - p.z;
            var dist = Math.hypot(dx, dz);
            if (dist > 0.35) {
                var stepSpd = Math.min(maxSpd, dist * 3.8);
                p.vx = dx / dist * stepSpd;
                p.vz = dz / dist * stepSpd;
                p.x = Math.max(-_basketballLogic.COURT_HALF_LEN + 0.7, Math.min(_basketballLogic.COURT_HALF_LEN - 0.7, p.x + p.vx * dt));
                p.z = Math.max(-_basketballLogic.COURT_HALF_WID + 0.7, Math.min(_basketballLogic.COURT_HALF_WID - 0.7, p.z + p.vz * dt));
                p.facingYaw = Math.atan2(p.vx, p.vz);
                p.animPhase += dt * 8.4;
            } else {
                p.vx = 0;
                p.vz = 0;
                var lookX = p.team === 'home' ? _basketballLogic.HOOP_X : -_basketballLogic.HOOP_X;
                p.facingYaw = Math.atan2(lookX - p.x, -p.z);
            }
        }
        if (this.ballMode === 'held' && this.possession === 'away' && this.aiDecisionTimer <= 0) {
            this.aiDecisionTimer = 0.55;
            var carrier = this.players[this.carrierIdx];
            var n1 = this.playersPerSide;
            if (carrier && carrier.team === 'away') {
                var distToRim = Math.hypot(carrier.x - -_basketballLogic.HOOP_X, carrier.z);
                var urgentShot = this.shotClock < 4.5 && carrier.x < 4;
                if (distToRim < 3.2 && carrier.x < -14) {
                    var makeProb = 0.54 + (this.scaler.speedMult - 1) * 0.14;
                    this.launchShot(carrier, -_basketballLogic.HOOP_X, 2, Math.random() < makeProb, false);
                } else if (distToRim < 9.2 && Math.random() < 0.36 || urgentShot) {
                    var nearestHome = Infinity;
                    for(var h = 0; h < n1; h++){
                        var hd = Math.hypot(this.players[h].x - carrier.x, this.players[h].z - carrier.z);
                        if (hd < nearestHome) nearestHome = hd;
                    }
                    var contestMalus = nearestHome < 2.2 ? 0.22 : nearestHome < 3.4 ? 0.09 : 0;
                    if (nearestHome < 2.4) this.applyGradeEvent('good_contest', 'GOOD CONTEST', 30);
                    var pts = distToRim > _basketballLogic.THREE_PT_RADIUS ? 3 : 2;
                    var base = pts === 3 ? 0.38 : 0.52;
                    var makeProb1 = Math.max(0.18, base + (this.scaler.speedMult - 1) * 0.12 - contestMalus);
                    this.launchShot(carrier, -_basketballLogic.HOOP_X, pts, Math.random() < makeProb1, false);
                } else if (Math.random() < 0.25 && n1 > 1) {
                    var mates = this.players.slice(n1, n1 * 2).map(function(m) {
                        return {
                            index: m.index,
                            x: m.x,
                            z: m.z
                        };
                    });
                    var tIdx = (0, _basketballLogic.pickBestPassTargetIndex)({
                        x: carrier.x,
                        z: carrier.z
                    }, {
                        x: -1,
                        z: Math.sin(this.aiAttackPhaseTimer)
                    }, -_basketballLogic.HOOP_X, carrier.index, mates);
                    if (tIdx >= n1) {
                        this.startPass(carrier, this.players[tIdx]);
                    }
                }
            }
        }
    };
    _proto.stepBallPhysics = function stepBallPhysics(dt) {
        if (this.ballMode === 'held') {
            var carrier = this.players[this.carrierIdx];
            if (!carrier) return;
            var fwdX = Math.sin(carrier.facingYaw);
            var fwdZ = Math.cos(carrier.facingYaw);
            var rightX = Math.cos(carrier.facingYaw);
            var rightZ = -Math.sin(carrier.facingYaw);
            if (this.meterActive && carrier.index === this.controlledIdx) {
                this.ballX = carrier.x + fwdX * 0.36;
                this.ballZ = carrier.z + fwdZ * 0.36;
                this.ballY = carrier.y + 2.15;
            } else {
                this.dribblePhase += dt * (carrier.sprinting ? 11.5 : 8.5);
                var s = Math.abs(Math.sin(this.dribblePhase));
                if (s < 0.18 && !this.lastDribblePlayed && carrier.index === this.controlledIdx) {
                    this.lastDribblePlayed = true;
                    _audio.ArcadeAudio.play('dribble');
                } else if (s > 0.35) {
                    this.lastDribblePlayed = false;
                }
                this.ballX = carrier.x + fwdX * 0.48 + rightX * 0.32;
                this.ballZ = carrier.z + fwdZ * 0.48 + rightZ * 0.32;
                this.ballY = 0.24 + s * 0.92;
            }
            return;
        }
        if (this.ballMode === 'pass') {
            this.passTimer += dt;
            var t = Math.min(1, this.passTimer / this.passDuration);
            var receiver = this.players[this.passTargetIdx];
            if (!receiver) {
                this.ballMode = 'loose';
                return;
            }
            this.ballX = _three.MathUtils.lerp(this.passFromX, receiver.x, t);
            this.ballZ = _three.MathUtils.lerp(this.passFromZ, receiver.z, t);
            this.ballY = _three.MathUtils.lerp(this.passFromY, 1.35, t) + Math.sin(t * Math.PI) * 0.65;
            if (t >= 1) {
                this.ballMode = 'held';
                this.carrierIdx = receiver.index;
                this.possession = receiver.team;
                if (receiver.team === 'home') {
                    this.controlledIdx = receiver.index;
                    this.updateActiveRing();
                }
                this.syncActionLabels();
            }
            return;
        }
        if (this.ballMode === 'dunk') {
            var dunker = this.players[this.carrierIdx];
            if (!dunker) {
                this.ballMode = 'loose';
                return;
            }
            this.dunkTimer += dt;
            var t1 = Math.min(1, this.dunkTimer / this.dunkDuration);
            dunker.x = _three.MathUtils.lerp(this.dunkFromX, this.dunkTargetX, t1);
            dunker.z = _three.MathUtils.lerp(this.dunkFromZ, 0, t1);
            dunker.y = Math.sin(t1 * Math.PI) * 1.95;
            dunker.facingYaw = Math.atan2(_basketballLogic.HOOP_X - dunker.x, -dunker.z);
            this.ballX = _three.MathUtils.lerp(dunker.x + 0.35, _basketballLogic.HOOP_X, Math.pow(t1, 1.4));
            this.ballZ = dunker.z * (1 - t1);
            this.ballY = dunker.y + 2.05;
            if (t1 >= 1) {
                dunker.y = 0;
                this.camShake = _storage.playerState.hoops2k26.settings.cameraShake ? 0.55 : 0;
                this.shotWasGreen = true;
                this.shotShooterIdx = dunker.index;
                this.scoreBasket('home', 2, 'POSTER DUNK!');
            }
            return;
        }
        if (this.ballMode === 'shot') {
            this.shotTimer += dt;
            var t2 = Math.min(1, this.shotTimer / this.shotDuration);
            if (t2 < 0.45) {
                for(var i = 0; i < this.players.length; i++){
                    var def = this.players[i];
                    if (def.team === this.shotTeam || def.blockTimer <= 0) continue;
                    var distXZ = Math.hypot(def.x - this.ballX, def.z - this.ballZ);
                    if (distXZ < 1.35 && Math.abs(def.y + 1.9 - this.ballY) < 1.1) {
                        this.ballMode = 'loose';
                        this.ballVx = (def.team === 'home' ? -1 : 1) * 5.2;
                        this.ballVy = 3.2;
                        this.ballVz = (Math.random() - 0.5) * 4.5;
                        _audio.ArcadeAudio.play('rimClank');
                        this.popBanner('SNATCH BLOCK!', '#38bdf8', 1.1);
                        if (def.team === 'home') {
                            this.score += 20;
                            this.stats.blk += 1;
                            this.applyGradeEvent('block', 'BLOCK', 85);
                            (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
                            this.pushHudSnapshot();
                        }
                        return;
                    }
                }
            }
            this.ballX = _three.MathUtils.lerp(this.shotStartX, this.shotTargetX, t2);
            this.ballZ = _three.MathUtils.lerp(this.shotStartZ, this.shotTargetZ, t2);
            var oneMinus = 1 - t2;
            this.ballY = oneMinus * oneMinus * this.shotStartY + 2 * oneMinus * t2 * this.shotPeakY + t2 * t2 * _basketballLogic.RIM_Y;
            if (t2 >= 1) {
                if (this.shotWillMake) {
                    this.ballY = _basketballLogic.RIM_Y - 0.55;
                    var lbl = this.shotWasGreen ? 'GREEN SPLASH!' : this.shotPoints === 3 ? '3PT SWISH!' : 'BUCKET!';
                    this.scoreBasket(this.shotTeam, this.shotPoints, lbl);
                } else {
                    _audio.ArcadeAudio.play('rimClank');
                    this.ballMode = 'loose';
                    var bounceDir = this.shotTargetX > 0 ? -1 : 1;
                    this.ballVx = bounceDir * (2.6 + Math.random() * 2.4);
                    this.ballVy = 4.5 + Math.random() * 1.5;
                    this.ballVz = (Math.random() - 0.5) * 4.4;
                    this.popBanner('REBOUND!', '#cbd5e1', 0.8);
                }
            }
            return;
        }
        // Loose rebound physics
        this.ballX += this.ballVx * dt;
        this.ballZ += this.ballVz * dt;
        this.ballY += this.ballVy * dt;
        this.ballVy -= 17.5 * dt;
        if (this.ballY <= 0.24) {
            this.ballY = 0.24;
            this.ballVy = Math.abs(this.ballVy) * 0.64;
            this.ballVx *= 0.85;
            this.ballVz *= 0.85;
        }
        if (Math.abs(this.ballX) > _basketballLogic.COURT_HALF_LEN - 0.5) {
            this.ballX = Math.sign(this.ballX) * (_basketballLogic.COURT_HALF_LEN - 0.5);
            this.ballVx *= -0.7;
        }
        if (Math.abs(this.ballZ) > _basketballLogic.COURT_HALF_WID - 0.5) {
            this.ballZ = Math.sign(this.ballZ) * (_basketballLogic.COURT_HALF_WID - 0.5);
            this.ballVz *= -0.7;
        }
        if (this.ballY < 2.65) {
            var bestGrab = -1;
            var bestDist = 1.45;
            for(var i1 = 0; i1 < this.players.length; i1++){
                var pl = this.players[i1];
                var d = Math.hypot(pl.x - this.ballX, pl.z - this.ballZ);
                if (d < bestDist) {
                    bestDist = d;
                    bestGrab = i1;
                }
            }
            if (bestGrab >= 0) {
                var grabber = this.players[bestGrab];
                var isOffensiveReb = grabber.team === this.shotTeam;
                this.ballMode = 'held';
                this.carrierIdx = bestGrab;
                this.possession = grabber.team;
                // Authentic NBA 24s / 14s offensive rebound shot clock reset!
                var resetClock = isOffensiveReb ? 14 : _basketballLogic.SHOT_CLOCK_SEC;
                this.shotClock = this.targetScore ? resetClock : Math.min(resetClock, Math.max(0.5, this.quarterClock));
                if (grabber.team === 'home') {
                    this.controlledIdx = bestGrab;
                    this.updateActiveRing();
                    this.score += 10;
                    this.stats.reb += 1;
                    this.applyGradeEvent('rebound', isOffensiveReb ? 'OFF REB' : 'DEF REB', 50);
                    (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
                    this.popBanner(isOffensiveReb ? 'OFFENSIVE BOARD! (:14)' : 'DEFENSIVE BOARD! +10', '#4ade80', 0.85);
                    this.pushHudSnapshot();
                }
                this.syncActionLabels();
                _audio.ArcadeAudio.play('dribble');
            }
        }
    };
    _proto.animateCrowd = function animateCrowd() {
        var t = performance.now() * 0.005;
        var amp = 0.06 + this.crowdExcite * 0.42;
        for(var i = 0; i < this.crowdMesh.count; i++){
            var b = this.crowdBasePos[i];
            var bob = Math.abs(Math.sin(t + b.phase)) * amp;
            _dummyPos.set(b.x, b.y + bob, b.z);
            _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
            this.crowdMesh.setMatrixAt(i, _dummyMatrix);
        }
        this.crowdMesh.instanceMatrix.needsUpdate = true;
    };
    _proto.syncMeshes = function syncMeshes() {
        for(var i = 0; i < this.players.length; i++){
            var p = this.players[i];
            p.rig.group.position.set(p.x, p.y, p.z);
            p.rig.group.rotation.y = p.facingYaw;
            var moving = Math.hypot(p.vx, p.vz) > 0.35;
            var stride = moving ? Math.sin(p.animPhase) * 0.55 : 0;
            p.rig.legL.rotation.x = stride;
            p.rig.legR.rotation.x = -stride;
            var isShooting = this.meterActive && i === this.controlledIdx || this.ballMode === 'dunk' && i === this.carrierIdx || p.blockTimer > 0.15;
            if (isShooting) {
                p.rig.armL.rotation.x = -2.45;
                p.rig.armR.rotation.x = -2.45;
            } else {
                p.rig.armL.rotation.x = -stride * 0.65;
                p.rig.armR.rotation.x = stride * 0.65;
            }
        }
        var activeP = this.players[this.controlledIdx];
        if (this.takeoverActive && activeP) {
            this.takeoverAuraMesh.position.set(activeP.x, 0.07, activeP.z);
            var pulse = 1 + Math.sin(performance.now() * 0.01) * 0.12;
            this.takeoverAuraMesh.scale.set(pulse, pulse, 1);
        }
        this.ballGroup.position.set(this.ballX, this.ballY, this.ballZ);
        this.ballGroup.rotation.x += 0.09;
        this.ballGroup.rotation.z += 0.06;
        this.ballShadow.position.set(this.ballX, 0.035, this.ballZ);
        var shadowScale = Math.max(0.42, 1.0 - (this.ballY - 0.25) * 0.08);
        this.ballShadow.scale.set(0.36 * shadowScale, 0.36 * shadowScale, 1);
        this.leftNetMesh.scale.set(1 + this.leftNetShake * 0.2, 1 - this.leftNetShake * 0.14, 1 + this.leftNetShake * 0.2);
        this.rightNetMesh.scale.set(1 + this.rightNetShake * 0.2, 1 - this.rightNetShake * 0.14, 1 + this.rightNetShake * 0.2);
    };
    _proto.computeTargetCameraVectors = function computeTargetCameraVectors() {
        var _ref;
        var s = _storage.playerState.hoops2k26.settings;
        var activeP = this.players[this.controlledIdx];
        var focusX = this.ballMode === 'shot' ? this.ballX * 0.72 : (_ref = activeP == null ? void 0 : activeP.x) != null ? _ref : this.ballX;
        var focusZ = this.ballZ * 0.42;
        var zoomOff = (5 - s.cameraZoom) * 0.9; // higher zoom = closer
        var heightOff = (s.cameraHeight - 5) * 0.75;
        if (s.cameraAngle === '2k') {
            var flipToDef = s.flipCamera && this.possession === 'away';
            var dir = flipToDef ? 1 : -1; // -1 sits behind left baseline looking right (+X)
            var camX = _three.MathUtils.clamp(focusX + dir * (16.5 + zoomOff), -32, 32);
            var camY = _three.MathUtils.clamp(12.2 + heightOff, 8.5, 18.5);
            var camZ = _three.MathUtils.clamp(focusZ * 0.55, -6.5, 6.5);
            _camDesired.set(camX, camY, camZ);
            _camLookDesired.set(_three.MathUtils.clamp(focusX - dir * 7.5, -18, 18), 1.8, _three.MathUtils.clamp(focusZ * 0.4, -5, 5));
        } else {
            var camX1 = _three.MathUtils.clamp(focusX * 0.58, -11.5, 11.5);
            _camDesired.set(camX1, 15.6 + heightOff * 0.7, 22.8 + zoomOff * 0.8);
            _camLookDesired.set(_three.MathUtils.clamp(focusX * 0.72, -14.5, 14.5), 1.85, _three.MathUtils.clamp(focusZ, -4.5, 4.5));
        }
        return {
            pos: _camDesired,
            look: _camLookDesired
        };
    };
    _proto.snapCameraImmediate = function snapCameraImmediate() {
        var _this_computeTargetCameraVectors = this.computeTargetCameraVectors(), pos = _this_computeTargetCameraVectors.pos, look = _this_computeTargetCameraVectors.look;
        _camLookCur.copy(look);
        this.three.camera.position.copy(pos);
        this.three.camera.lookAt(_camLookCur);
    };
    _proto.updateCamera = function updateCamera(dt) {
        var _this_computeTargetCameraVectors = this.computeTargetCameraVectors(), pos = _this_computeTargetCameraVectors.pos, look = _this_computeTargetCameraVectors.look;
        var shakeX = this.camShake > 0 ? Math.sin(performance.now() * 0.06) * this.camShake * 0.4 : 0;
        var shakeY = this.camShake > 0 ? Math.cos(performance.now() * 0.08) * this.camShake * 0.28 : 0;
        pos.x += shakeX;
        pos.y += shakeY;
        var alpha = 1 - Math.exp(-5.8 * dt);
        this.three.camera.position.lerp(pos, alpha);
        _camLookCur.lerp(look, alpha);
        this.three.camera.lookAt(_camLookCur);
    };
    _proto.projectWorld = function projectWorld(x, y, z) {
        _projVec.set(x, y, z).project(this.three.camera);
        var sx = (_projVec.x * 0.5 + 0.5) * this.three.width;
        var sy = (-_projVec.y * 0.5 + 0.5) * this.three.height;
        return {
            x: sx,
            y: sy,
            visible: _projVec.z < 1 && _projVec.z > -1
        };
    };
    _proto.drawCourtOverlay = function drawCourtOverlay() {
        var ctx = this.three.overlayCtx;
        if (!ctx) return;
        var w = this.three.width;
        var vh = this.three.height;
        this.three.clearOverlay();
        var s = _storage.playerState.hoops2k26.settings;
        ctx.save();
        // 1. Icon Passing Key Badges over Teammates when active
        if (this.iconPassingActive && this.ballMode === 'held' && this.carrierIdx === this.controlledIdx) {
            var targets = this.getIconPassTargets();
            for(var _iterator = _create_for_of_iterator_helper_loose(targets), _step; !(_step = _iterator()).done;){
                var t = _step.value;
                var mate = this.players[t.index];
                if (!mate) continue;
                var pt = this.projectWorld(mate.x, mate.y + 2.75, mate.z);
                if (!pt.visible) continue;
                ctx.fillStyle = '#0f172a';
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 13, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#facc15';
                ctx.font = '900 12px system-ui, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(t.keyLabel, pt.x, pt.y + 0.5);
            }
        }
        // 2. Who-To-Guard Defensive Arrow Indicator
        var activeP = this.players[this.controlledIdx];
        if (s.whoToGuard && this.possession === 'away' && activeP) {
            var n = this.playersPerSide;
            var mark = this.players[n + activeP.index % n];
            if (mark) {
                var pt1 = this.projectWorld(mark.x, mark.y + 2.65, mark.z);
                if (pt1.visible) {
                    ctx.fillStyle = '#f43f5e';
                    ctx.font = '900 10px system-ui, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('GUARD', pt1.x, pt1.y - 8);
                }
            }
        }
        // 3. Controlled Player Nameplate + 3 Adrenaline Bars + Stamina Bar + Dunk Ready Hint
        if (activeP && s.floorStamina) {
            var headPt = this.projectWorld(activeP.x, activeP.y + 2.6, activeP.z);
            if (headPt.visible) {
                var dunkReady = this.ballMode === 'held' && this.carrierIdx === this.controlledIdx && (0, _basketballLogic.canAttemptDunk)(activeP.x, activeP.z, _basketballLogic.HOOP_X, activeP.sprinting || this.sprintHeld, activeP.stamina);
                var label = dunkReady ? '🔥 DUNK READY' : s.ballHandlerText === 'off' ? '' : s.ballHandlerText === 'position' ? activeP.role : activeP.name.split(' ').pop() || activeP.role;
                if (label) {
                    ctx.textAlign = 'center';
                    ctx.font = '900 10px system-ui, sans-serif';
                    ctx.fillStyle = dunkReady ? '#facc15' : this.takeoverActive ? '#fb923c' : '#84fab0';
                    ctx.fillText(label, headPt.x, headPt.y - 16);
                }
                // Stamina bar
                var barW = 38;
                ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                ctx.fillRect(headPt.x - barW * 0.5, headPt.y - 9, barW, 4);
                ctx.fillStyle = activeP.stamina > 0.3 ? '#38bdf8' : '#ef4444';
                ctx.fillRect(headPt.x - barW * 0.5, headPt.y - 9, barW * activeP.stamina, 4);
                // 3 Adrenaline Pip Bars (■■■)
                for(var b = 0; b < 3; b++){
                    ctx.fillStyle = b < this.adrenalineBars ? '#facc15' : 'rgba(148, 163, 184, 0.32)';
                    ctx.fillRect(headPt.x - 16 + b * 11.5, headPt.y - 3, 9.5, 3);
                }
            }
        }
        // 4. Pro-Stick Shot Meter (Comet / Fang / Horn) OR Shot Meter Off Green Boost Cue
        if (this.meterActive && activeP) {
            var sp = this.projectWorld(activeP.x + 1.0, activeP.y + 2.1, activeP.z);
            if (sp.visible) {
                if (s.jumpShotMeterOff) {
                    ctx.font = '900 11px system-ui, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#4ade80';
                    ctx.fillText('NO METER · +GREEN BOOST', sp.x, Math.max(76, sp.y - 44));
                } else {
                    var style = s.layupMeterStyle;
                    var mW = style === 'fang' ? 20 : 16;
                    var mH = 74;
                    var mx = Math.max(12, Math.min(w - mW - 44, sp.x + 18));
                    var my = Math.max(76, Math.min(vh - mH - 18, sp.y - mH * 0.5));
                    ctx.fillStyle = 'rgba(11, 16, 32, 0.92)';
                    ctx.strokeStyle = style === 'horn' ? '#facc15' : style === 'fang' ? '#38bdf8' : '#f8fafc';
                    ctx.lineWidth = 2;
                    this.roundRect(ctx, mx, my, mW, mH, style === 'comet' ? 8 : 3);
                    ctx.fill();
                    ctx.stroke();
                    var gTop = my + mH * (1 - this.meterGreenEnd);
                    var gH = mH * (this.meterGreenEnd - this.meterGreenStart);
                    ctx.fillStyle = '#22c55e';
                    ctx.fillRect(mx + 2, gTop, mW - 4, gH);
                    var fillH = mH * this.meterProgress;
                    var inGreen = this.meterProgress >= this.meterGreenStart && this.meterProgress <= this.meterGreenEnd;
                    ctx.fillStyle = inGreen ? '#4ade80' : '#facc15';
                    ctx.fillRect(mx + 4, my + mH - fillH, mW - 8, fillH);
                    var needleY = my + mH * (1 - this.meterProgress);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(mx - 3, needleY - 2, mW + 6, 4);
                    ctx.font = '900 10px system-ui, sans-serif';
                    ctx.textAlign = 'left';
                    ctx.fillStyle = '#facc15';
                    ctx.fillText("" + this.meterPoints + "PT", mx + mW + 6, my + 12);
                }
            }
        }
        // 5. Shot Feedback Callout + Animated Play Banner
        if (this.banner) {
            var alpha = Math.min(1, this.banner.timer * 2.5);
            ctx.globalAlpha = alpha;
            ctx.font = '900 16px system-ui, sans-serif';
            ctx.textAlign = 'center';
            var by = vh < 480 ? 58 : 78;
            ctx.fillStyle = 'rgba(11, 16, 32, 0.88)';
            var tw = ctx.measureText(this.banner.text).width + 26;
            this.roundRect(ctx, w * 0.5 - tw * 0.5, by - 15, tw, 28, 8);
            ctx.fill();
            ctx.fillStyle = this.banner.color;
            ctx.fillText(this.banner.text, w * 0.5, by + 1);
        }
        ctx.restore();
    };
    _proto.roundRect = function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    };
    return Hoops2K26_3D;
}();

});

})(window.ArcadeMod);
