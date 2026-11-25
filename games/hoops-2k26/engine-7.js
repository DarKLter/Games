(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/nba2k14/engine/Nba2k14Engine ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/engine/Nba2k14Engine", function(require, module, exports) {
// ============================================================================
// NBA 2K14 — Complete Decoupled Three.js 3D Basketball Simulation Engine
// Supports 5v5/3v3/2v2/1v1, Pro Stick IsoMotion, Shooting/Dunking/Post/PnR,
// All 32+ Signature Skills, 3PT Shootout, Dunk Contest, Training Drills,
// 6 Camera Angles, Gamepad/Keyboard/Touch, and 10s 3D Instant Replay.
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Nba2k14Engine", {
    enumerable: true,
    get: function() {
        return Nba2k14Engine;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _RoomEnvironment = require("three/examples/jsm/environments/RoomEnvironment.js");
var _Nba2k14Audio = require("../audio/Nba2k14Audio");
var _modesData = require("../data/modesData");
var _rosters = require("../data/rosters");
var _signatureSkills = require("../data/signatureSkills");
var _arenaBuilder = require("./arenaBuilder");
var _playerRig = require("./playerRig");
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
var GRADE_STEPS = [
    'F',
    'D-',
    'D',
    'D+',
    'C-',
    'C',
    'C+',
    'B-',
    'B',
    'B+',
    'A-',
    'A',
    'A+'
];
var THREE_PT_RACK_POSITIONS = [
    [
        _arenaBuilder.HOOP_X - 1.2,
        -6.9
    ],
    [
        _arenaBuilder.HOOP_X - 5.1,
        -5.2
    ],
    [
        _arenaBuilder.HOOP_X - 7.45,
        0
    ],
    [
        _arenaBuilder.HOOP_X - 5.1,
        5.2
    ],
    [
        _arenaBuilder.HOOP_X - 1.2,
        6.9
    ]
];
var Nba2k14Engine = /*#__PURE__*/ function() {
    "use strict";
    function Nba2k14Engine(container, config, settings, onHudUpdate, onMatchComplete) {
        var _this = this;
        var _config_startHomeScore, _config_startAwayScore, _config_startQuarter, _config_startClockSec;
        this.envTex = null;
        this.isSoftwareGl = false;
        this.players = [];
        this.allBenchHome = [];
        this.allBenchAway = [];
        this.controlledId = '';
        this.possession = 'home';
        this.homeScore = 0;
        this.awayScore = 0;
        this.quarter = 1;
        this.quarterScoresHome = [
            0,
            0,
            0,
            0
        ];
        this.quarterScoresAway = [
            0,
            0,
            0,
            0
        ];
        this.gameClockSec = 300;
        this.shotClockSec = 24;
        this.backcourtTimer = 0;
        this.homeTimeouts = 7;
        this.awayTimeouts = 7;
        this.homeFoulsQ = 0;
        this.awayFoulsQ = 0;
        // Shot Meter & Free Throw State
        this.isChargingShot = false;
        this.shotChargeTime = 0;
        this.shotReleaseDuration = 0.65;
        this.shotStartPressMs = 0;
        this.freeThrowActive = false;
        this.freeThrowShooterId = null;
        this.freeThrowRemaining = 0;
        this.freeThrowPos = 0;
        this.freeThrowDir = 1;
        // Icon Passing, OTFC, Teammate Grade & Presentation
        this.iconPassActive = false;
        this.otfc = {
            openTab: null,
            offensePoe: 'Get Shooters Open',
            activePlay: 'None',
            defenseSet: 'Man-to-Man',
            showSigSkillsOverhead: false
        };
        this.teammateGradeIdx = 6; // C+
        this.teammateGradeFill = 0.5;
        this.gradeEvents = [];
        this.shotFeedback = null;
        this.shotFeedbackTimer = 0;
        this.sigPopup = null;
        this.sigPopupTimer = 0;
        this.commentary = 'Welcome to NBA 2K14! Tip-off is underway!';
        this.paBanner = null;
        this.paBannerTimer = 0;
        this.crowdExcitement = 0.25;
        this.buzzerFlashTimer = 0;
        this.cameraShake = 0;
        this.eventSeq = 1;
        // Special Modes State
        this.shootoutRack = 0;
        this.shootoutBallInRack = 0;
        this.shootoutScore = 0;
        this.shootoutTime = 60;
        this.dunkRound = 1;
        this.dunkAttempt = 1;
        this.dunkMoveId = _modesData.DUNK_CONTEST_MOVES[0].id;
        this.dunkTotalScore = 0;
        this.dunkJudgeScores = [];
        this.dunkPhase = 'select';
        this.dunkMeterVal = 0;
        this.trainingReps = 0;
        // Replay Ring Buffer (10s @ 30Hz = 300 frames)
        this.replayBuffer = [];
        this.replaySampleAccum = 0;
        this.replayMode = false;
        this.replayIndex = 0;
        this.replayPlaying = false;
        this.replaySpeed = 0.5;
        this.replayOrbitAngle = 0.5;
        this.replayOrbitDist = 11.5;
        this.replayOrbitHeight = 4.6;
        this.replayDragging = false;
        this.replayLastX = 0;
        // Input State
        this.keys = new Set();
        this.virtualInput = {
            moveX: 0,
            moveY: 0,
            sprint: false,
            shoot: false,
            pass: false,
            intenseD: false,
            postBlock: false,
            pickCharge: false,
            proStickX: 0,
            proStickY: 0
        };
        this.prevVirtualShoot = false;
        this.prevGamepadButtons = [];
        // Runtime Bookkeeping
        this.paused = false;
        this.finished = false;
        this.disposed = false;
        this.rafId = 0;
        this.lastFrameMs = performance.now();
        this.elapsed = 0;
        this.hudEmitAccum = 0;
        this.fps = 60;
        this.curCamPos = new _three.Vector3(0, 12, 16);
        this.curCamLook = new _three.Vector3(0, 1.5, 0);
        this.userShotLog = [];
        this.aiDecisionCooldown = 0.4;
        // ==================== KEYBOARD & POINTER INPUT ====================
        this.handleKeyDown = function(e) {
            if (_this.finished) return;
            var code = e.code;
            if (code === 'Escape') {
                e.preventDefault();
                if (_this.replayMode) _this.exitInstantReplay();
                else _this.setPaused(!_this.paused);
                return;
            }
            if (_this.paused) return;
            // Prevent browser scroll on Space / Arrows
            if ([
                'Space',
                'ArrowUp',
                'ArrowDown',
                'ArrowLeft',
                'ArrowRight'
            ].includes(code)) {
                e.preventDefault();
            }
            var kb = _this.settings.keybinds;
            // OTFC D-Pad Arrow Keys
            if (code === 'ArrowLeft') {
                _this.triggerOtfcAction({
                    tab: 'strategy'
                });
                return;
            }
            if (code === 'ArrowRight') {
                _this.triggerOtfcAction({
                    tab: 'plays'
                });
                return;
            }
            if (code === 'ArrowDown') {
                _this.triggerOtfcAction({
                    tab: 'subs'
                });
                return;
            }
            if (code === 'ArrowUp') {
                _this.triggerOtfcAction({
                    tab: 'skills'
                });
                return;
            }
            if (code === kb.timeout) {
                _this.callTimeout();
                return;
            }
            if (code === kb.playCall) {
                var plays = [
                    'Pick & Roll',
                    'Quick Iso',
                    'Motion Cuts',
                    '3PT Play',
                    'None'
                ];
                var nextIdx = (plays.indexOf(_this.otfc.activePlay) + 1) % plays.length;
                _this.otfc.activePlay = plays[nextIdx];
                _this.commentary = _this.otfc.activePlay === 'None' ? 'Freelance Offense' : "PlayVision: " + _this.otfc.activePlay;
                _this.emitHud();
                return;
            }
            if (code === kb.iconPass) {
                _this.iconPassActive = !_this.iconPassActive;
                _this.emitHud();
                return;
            }
            if (_this.iconPassActive && [
                'Digit1',
                'Digit2',
                'Digit3',
                'Digit4',
                'Digit5'
            ].includes(code)) {
                var idx = Number(code.replace('Digit', '')) - 1;
                _this.executeIconPass(idx);
                _this.iconPassActive = false;
                return;
            }
            if (!_this.keys.has(code)) {
                _this.onActionPress(code);
            }
            _this.keys.add(code);
        };
        this.handleKeyUp = function(e) {
            var code = e.code;
            _this.keys.delete(code);
            var kb = _this.settings.keybinds;
            if (code === kb.shoot || code === kb.proStickUp || code === kb.proStickDown || code === kb.proStickLeft || code === kb.proStickRight) {
                if (_this.isChargingShot) {
                    _this.releaseShot(code);
                }
            }
        };
        this.handlePointerDown = function(e) {
            if (_this.replayMode) {
                _this.replayDragging = true;
                _this.replayLastX = e.clientX;
            }
        };
        this.handlePointerMove = function(e) {
            if (_this.replayMode && _this.replayDragging) {
                var dx = e.clientX - _this.replayLastX;
                _this.replayLastX = e.clientX;
                _this.replayOrbitAngle += dx * 0.009;
            }
        };
        this.handlePointerUp = function() {
            _this.replayDragging = false;
        };
        this.handleContextLost = function(e) {
            e.preventDefault();
        };
        this.tick = function() {
            if (_this.disposed) return;
            var now = performance.now();
            var rawDt = Math.min(0.05, Math.max(0.001, (now - _this.lastFrameMs) * 0.001));
            _this.lastFrameMs = now;
            _this.fps = Math.round(_this.fps * 0.9 + 1 / rawDt * 0.1);
            var speedMult = 0.7 + _this.settings.game.gameSpeed / 100 * 0.6;
            var dt = rawDt * speedMult;
            if (_this.replayMode) {
                _this.updateReplayView(rawDt);
            } else if (!_this.paused && !_this.finished) {
                _this.elapsed += dt;
                _this.stepSimulation(dt);
                _this.recordReplayFrame(rawDt);
                _this.updateCamera(rawDt);
            }
            _this.arena.updateArena(rawDt, _this.elapsed, _this.crowdExcitement, _this.buzzerFlashTimer > 0);
            _this.renderer.render(_this.scene, _this.camera);
            _this.hudEmitAccum += rawDt;
            if (_this.hudEmitAccum >= 0.06) {
                _this.hudEmitAccum = 0;
                _this.emitHud();
            }
            if (_this.isSoftwareGl) {
                setTimeout(function() {
                    if (!_this.disposed) _this.rafId = requestAnimationFrame(_this.tick);
                }, 28);
            } else {
                _this.rafId = requestAnimationFrame(_this.tick);
            }
        };
        this.container = container;
        this.config = config;
        this.settings = settings;
        this.onHudUpdate = onHudUpdate;
        this.onMatchComplete = onMatchComplete;
        this.homeTeam = (0, _rosters.getTeamById)(config.homeTeamId);
        this.awayTeam = (0, _rosters.getTeamById)(config.awayTeamId);
        this.homeScore = (_config_startHomeScore = config.startHomeScore) != null ? _config_startHomeScore : 0;
        this.awayScore = (_config_startAwayScore = config.startAwayScore) != null ? _config_startAwayScore : 0;
        this.quarter = (_config_startQuarter = config.startQuarter) != null ? _config_startQuarter : 1;
        this.gameClockSec = (_config_startClockSec = config.startClockSec) != null ? _config_startClockSec : config.quarterLengthMin * 60;
        this.shotClockSec = 24;
        // Renderer Setup
        this.renderer = new _three.WebGLRenderer({
            antialias: settings.graphics.renderQuality !== 'Low',
            powerPreference: 'high-performance'
        });
        var gl = this.renderer.getContext();
        var rStr = String(gl.getParameter(gl.RENDERER) || '');
        this.isSoftwareGl = /SwiftShader|llvmpipe|Software|Basic Render Driver/i.test(rStr);
        var dprCap = this.isSoftwareGl || settings.graphics.renderQuality === 'Low' ? 1 : settings.graphics.renderQuality === 'Ultra' ? 2 : 1.5;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
        this.renderer.outputColorSpace = _three.SRGBColorSpace;
        this.renderer.toneMapping = _three.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.08;
        this.renderer.shadowMap.enabled = !this.isSoftwareGl && settings.graphics.renderQuality !== 'Low';
        this.renderer.shadowMap.type = _three.PCFSoftShadowMap;
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.display = 'block';
        container.innerHTML = '';
        container.appendChild(this.renderer.domElement);
        // Scene + Lighting + RoomEnvironment
        this.scene = new _three.Scene();
        var bgHex = config.courtEnv === 'blacktop' ? '#1a1524' : config.courtEnv === 'park' ? '#1e293b' : config.courtEnv === 'practice' ? '#273142' : '#090b10';
        this.scene.background = new _three.Color(bgHex);
        this.scene.fog = new _three.FogExp2(bgHex, 0.011);
        var pmrem = new _three.PMREMGenerator(this.renderer);
        this.envTex = pmrem.fromScene(new _RoomEnvironment.RoomEnvironment(), 0.04).texture;
        this.scene.environment = this.envTex;
        pmrem.dispose();
        var w = Math.max(320, container.clientWidth);
        var h = Math.max(240, container.clientHeight);
        this.camera = new _three.PerspectiveCamera(48, w / h, 0.15, 160);
        this.renderer.setSize(w, h, false);
        // Arena Lighting
        var hemi = new _three.HemisphereLight(config.courtEnv === 'blacktop' ? '#ffd9a8' : '#ffffff', '#1e1a18', config.courtEnv === 'practice' ? 0.95 : 0.72);
        this.scene.add(hemi);
        var keyDir = new _three.DirectionalLight(config.courtEnv === 'blacktop' ? '#ffcf8c' : '#fff8ef', config.courtEnv === 'blacktop' ? 1.55 : 1.35);
        keyDir.position.set(8, 22, 11);
        keyDir.castShadow = !this.isSoftwareGl && settings.graphics.renderQuality !== 'Low';
        keyDir.shadow.mapSize.set(1024, 1024);
        keyDir.shadow.camera.left = -18;
        keyDir.shadow.camera.right = 18;
        keyDir.shadow.camera.top = 14;
        keyDir.shadow.camera.bottom = -14;
        keyDir.shadow.bias = -0.0005;
        this.scene.add(keyDir);
        var fillDir = new _three.DirectionalLight('#93c5fd', 0.42);
        fillDir.position.set(-12, 14, -10);
        this.scene.add(fillDir);
        // Build 3D Arena Environment
        this.arena = (0, _arenaBuilder.buildArenaEnvironment)(config.courtEnv, this.homeTeam, Boolean(config.fibaRules), settings.graphics.crowdDetail === 'High' && !this.isSoftwareGl, settings.graphics.courtReflections);
        this.scene.add(this.arena.group);
        // Build Basketball & Players
        this.initBall();
        this.initPlayers();
        this.setupInitialPositions();
        // Listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        this.renderer.domElement.addEventListener('pointerdown', this.handlePointerDown);
        window.addEventListener('pointermove', this.handlePointerMove);
        window.addEventListener('pointerup', this.handlePointerUp);
        this.renderer.domElement.addEventListener('webglcontextlost', this.handleContextLost);
        this.resizeObserver = new ResizeObserver(function() {
            return _this.handleResize();
        });
        this.resizeObserver.observe(container);
        _Nba2k14Audio.Nba2k14Audio.playWhistle();
        this.emitHud();
        this.lastFrameMs = performance.now();
        this.tick();
    }
    var _proto = Nba2k14Engine.prototype;
    _proto.initBall = function initBall() {
        var ballCanvas = document.createElement('canvas');
        ballCanvas.width = 256;
        ballCanvas.height = 128;
        var bctx = ballCanvas.getContext('2d');
        bctx.fillStyle = '#d45a15';
        bctx.fillRect(0, 0, 256, 128);
        bctx.strokeStyle = '#18181b';
        bctx.lineWidth = 4;
        bctx.beginPath();
        bctx.moveTo(0, 64);
        bctx.lineTo(256, 64);
        bctx.moveTo(128, 0);
        bctx.lineTo(128, 128);
        bctx.stroke();
        var ballTex = new _three.CanvasTexture(ballCanvas);
        ballTex.colorSpace = _three.SRGBColorSpace;
        var mesh = new _three.Mesh(new _three.SphereGeometry(0.125, 18, 16), new _three.MeshStandardMaterial({
            map: ballTex,
            roughness: 0.45,
            metalness: 0.06
        }));
        mesh.castShadow = true;
        this.scene.add(mesh);
        this.ball = {
            mesh: mesh,
            x: 0,
            y: 1.1,
            z: 0,
            vx: 0,
            vy: 0,
            vz: 0,
            state: 'held',
            holderId: null,
            passTargetId: null,
            shooterId: null,
            shotTargetSide: 'away',
            shotWillMake: false,
            shotPoints: 2,
            shotIsDunk: false,
            shotZone: 'mid_top',
            shotExcellent: false,
            shotFastbreak: false,
            shotPaint: false,
            shotProgress: 0,
            shotDuration: 0.9,
            shotStart: new _three.Vector3(),
            shotPeakY: 4.5,
            shotEnd: new _three.Vector3(),
            lastTouchedSide: 'home',
            dribblePhase: 0
        };
    };
    _proto.initPlayers = function initPlayers() {
        var _this = this;
        var _ref;
        var _this_config_homeCustomPlayers, _this_config_awayCustomPlayers;
        var count = this.config.mode === 'shootout3pt' || this.config.mode === 'dunkcontest' ? 1 : this.config.playersPerSide;
        var homeSource = ((_this_config_homeCustomPlayers = this.config.homeCustomPlayers) == null ? void 0 : _this_config_homeCustomPlayers.length) ? this.config.homeCustomPlayers : this.homeTeam.players;
        var awaySource = ((_this_config_awayCustomPlayers = this.config.awayCustomPlayers) == null ? void 0 : _this_config_awayCustomPlayers.length) ? this.config.awayCustomPlayers : this.awayTeam.players;
        var homeActive = homeSource.slice(0, count);
        this.allBenchHome = homeSource.slice(count);
        var awayActive = this.config.mode === 'shootout3pt' || this.config.mode === 'dunkcontest' ? [] : awaySource.slice(0, count);
        this.allBenchAway = awaySource.slice(count);
        var homeJersey = this.config.jerseyMode === 'alternate' ? this.homeTeam.altColor : this.homeTeam.homeJerseyColor;
        var awayJersey = this.config.jerseyMode === 'alternate' ? this.awayTeam.secondaryColor : this.awayTeam.awayJerseyColor;
        var spawnList = function spawnList(list, side) {
            var team = side === 'home' ? _this.homeTeam : _this.awayTeam;
            var jersey = side === 'home' ? homeJersey : awayJersey;
            var trim = side === 'home' ? team.primaryColor : team.secondaryColor;
            list.forEach(function(pData, idx) {
                var rig = (0, _playerRig.createArticulatedPlayerRig)(pData, jersey, trim, team.code, side === _this.config.userSide);
                _this.scene.add(rig.root);
                _this.players.push({
                    data: pData,
                    side: side,
                    slotIdx: idx,
                    rig: rig,
                    x: 0,
                    y: 0,
                    z: 0,
                    vx: 0,
                    vz: 0,
                    rotY: 0,
                    pose: 'idle',
                    poseTimer: 0,
                    stamina: 100,
                    streak: 0,
                    stumbleTimer: 0,
                    isoChain: 0,
                    isoResetTimer: 0,
                    catchTimer: 0,
                    lastPasserSkills: [],
                    lastPassFromPost: false,
                    usedScreenTimer: 0,
                    screenerPopTimer: 0,
                    isScreening: false,
                    isPostingUp: false,
                    jumpVelY: 0,
                    stats: {
                        playerId: pData.id,
                        name: pData.name,
                        pos: pData.pos,
                        jersey: pData.jersey,
                        teamSide: side,
                        pts: 0,
                        fgm: 0,
                        fga: 0,
                        tpm: 0,
                        tpa: 0,
                        ftm: 0,
                        fta: 0,
                        reb: 0,
                        ast: 0,
                        stl: 0,
                        blk: 0,
                        to: 0,
                        pf: 0,
                        stamina: 100,
                        streak: 0
                    }
                });
            });
        };
        spawnList(homeActive, 'home');
        spawnList(awayActive, 'away');
        // Choose initial controlled player
        var userPlayers = this.players.filter(function(p) {
            return p.side === _this.config.userSide;
        });
        var locked = this.config.playerLockId ? userPlayers.find(function(p) {
            return p.data.id === _this.config.playerLockId;
        }) : null;
        this.controlledId = ((_ref = locked != null ? locked : userPlayers[0]) != null ? _ref : this.players[0]).data.id;
    };
    _proto.setupInitialPositions = function setupInitialPositions() {
        if (this.config.mode === 'shootout3pt') {
            var shooter = this.players[0];
            var _THREE_PT_RACK_POSITIONS_ = THREE_PT_RACK_POSITIONS[0], rx = _THREE_PT_RACK_POSITIONS_[0], rz = _THREE_PT_RACK_POSITIONS_[1];
            shooter.x = rx;
            shooter.z = rz;
            shooter.rotY = Math.atan2(_arenaBuilder.HOOP_X - rx, -rz);
            this.ball.state = 'held';
            this.ball.holderId = shooter.data.id;
            this.commentary = 'NBA 2K14 3-Point Shootout! 5 Racks, 25 Balls, 60 Seconds. Hold Space to shoot!';
            return;
        }
        if (this.config.mode === 'dunkcontest') {
            var dunker = this.players[0];
            dunker.x = 3.2;
            dunker.z = 0;
            dunker.rotY = Math.PI / 2;
            this.ball.state = 'held';
            this.ball.holderId = dunker.data.id;
            this.commentary = 'Sprite Slam Dunk Contest! Pick your signature dunk and nail the timing meter!';
            return;
        }
        this.possession = this.config.userSide;
        this.resetHalfCourtPossession(this.possession, true);
    };
    _proto.getAttackDir = function getAttackDir(side) {
        if (this.config.halfCourt) return 1; // Half-court always attacks +HOOP_X
        return side === 'home' ? 1 : -1;
    };
    _proto.getTargetHoopX = function getTargetHoopX(side) {
        return this.getAttackDir(side) * _arenaBuilder.HOOP_X;
    };
    _proto.resetHalfCourtPossession = function resetHalfCourtPossession(offSide, isTipOrInbound) {
        var _this = this;
        if (isTipOrInbound === void 0) isTipOrInbound = false;
        var _offPlayers_find;
        this.possession = offSide;
        this.shotClockSec = 24;
        this.backcourtTimer = 0;
        var dir = this.getAttackDir(offSide);
        var offPlayers = this.players.filter(function(p) {
            return p.side === offSide;
        });
        var defPlayers = this.players.filter(function(p) {
            return p.side !== offSide;
        });
        var offOffsets = this.config.halfCourt ? [
            [
                4.2,
                0
            ],
            [
                7.4,
                -5.2
            ],
            [
                7.4,
                5.2
            ],
            [
                9.6,
                -2.5
            ],
            [
                9.8,
                2.5
            ]
        ] : [
            [
                isTipOrInbound ? -1.5 * dir : -7.5 * dir,
                0
            ],
            [
                3.5 * dir,
                -5.4
            ],
            [
                3.5 * dir,
                5.4
            ],
            [
                8.6 * dir,
                -2.8
            ],
            [
                9.2 * dir,
                2.8
            ]
        ];
        offPlayers.forEach(function(p, i) {
            var _offOffsets_ = offOffsets[i % offOffsets.length], ox = _offOffsets_[0], oz = _offOffsets_[1];
            p.x = ox;
            p.z = oz;
            p.y = 0;
            p.vx = 0;
            p.vz = 0;
            p.stumbleTimer = 0;
            p.isScreening = false;
            p.isPostingUp = false;
        });
        defPlayers.forEach(function(p, i) {
            var match = offPlayers[i % Math.max(1, offPlayers.length)];
            if (match) {
                var hoopX = _this.getTargetHoopX(offSide);
                p.x = _three.MathUtils.lerp(match.x, hoopX, 0.28);
                p.z = match.z * 0.88;
            }
            p.y = 0;
            p.vx = 0;
            p.vz = 0;
            p.stumbleTimer = 0;
        });
        var handler = this.config.playerLockId && offSide === this.config.userSide ? (_offPlayers_find = offPlayers.find(function(p) {
            return p.data.id === _this.config.playerLockId;
        })) != null ? _offPlayers_find : offPlayers[0] : offPlayers[0];
        if (handler) {
            this.ball.state = 'held';
            this.ball.holderId = handler.data.id;
            this.ball.lastTouchedSide = offSide;
            if (!this.config.playerLockId && offSide === this.config.userSide) {
                this.controlledId = handler.data.id;
            }
        }
    };
    // ==================== PUBLIC CONTROLS FOR REACT UI ====================
    _proto.updateSettings = function updateSettings(next) {
        this.settings = next;
    };
    _proto.setPaused = function setPaused(p) {
        this.paused = p;
        if (!p) {
            this.replayMode = false;
            this.lastFrameMs = performance.now();
        }
        this.emitHud();
    };
    _proto.enterInstantReplay = function enterInstantReplay() {
        this.paused = true;
        this.replayMode = true;
        this.replayPlaying = false;
        this.replayIndex = Math.max(0, this.replayBuffer.length - 1);
        this.emitHud();
    };
    _proto.exitInstantReplay = function exitInstantReplay() {
        this.replayMode = false;
        this.emitHud();
    };
    _proto.setReplayControls = function setReplayControls(opts) {
        if (opts.index !== undefined) {
            this.replayIndex = Math.max(0, Math.min(Math.max(0, this.replayBuffer.length - 1), opts.index));
        }
        if (opts.playing !== undefined) this.replayPlaying = opts.playing;
        if (opts.speed !== undefined) this.replaySpeed = opts.speed;
        this.emitHud();
    };
    _proto.setVirtualInput = function setVirtualInput(patch) {
        Object.assign(this.virtualInput, patch);
    };
    _proto.triggerOtfcAction = function triggerOtfcAction(action) {
        if (action.tab !== undefined) {
            this.otfc.openTab = this.otfc.openTab === action.tab ? null : action.tab;
            this.otfc.showSigSkillsOverhead = this.otfc.openTab === 'skills';
        }
        if (action.offensePoe) {
            this.otfc.offensePoe = action.offensePoe;
            this.commentary = "Coach Point of Emphasis: " + action.offensePoe;
            this.otfc.openTab = null;
        }
        if (action.activePlay) {
            this.otfc.activePlay = action.activePlay;
            this.commentary = "Play Called: " + action.activePlay;
            this.otfc.openTab = null;
        }
        if (action.defenseSet) {
            this.otfc.defenseSet = action.defenseSet;
            this.commentary = "Defensive Set switched to " + action.defenseSet;
            this.otfc.openTab = null;
        }
        if (action.subPreset) {
            this.applySubstitutionPreset(this.config.userSide, action.subPreset);
            this.otfc.openTab = null;
        }
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        this.emitHud();
    };
    _proto.callTimeout = function callTimeout() {
        if (this.config.userSide === 'home' && this.homeTimeouts > 0) this.homeTimeouts -= 1;
        else if (this.config.userSide === 'away' && this.awayTimeouts > 0) this.awayTimeouts -= 1;
        else return;
        this.players.forEach(function(p) {
            p.stamina = Math.min(100, p.stamina + 30);
        });
        _Nba2k14Audio.Nba2k14Audio.playWhistle();
        this.paBanner = 'TIMEOUT CALLED · STAMINA RESTORED';
        this.paBannerTimer = 2.0;
        this.commentary = 'Coach calls a timely timeout to rest the squad and draw up a play.';
        this.emitHud();
    };
    _proto.selectDunkContestMove = function selectDunkContestMove(moveId) {
        var _ref;
        var _DUNK_CONTEST_MOVES_find;
        if (this.config.mode !== 'dunkcontest') return;
        this.dunkMoveId = moveId;
        this.dunkPhase = 'runup';
        var dunker = this.players[0];
        dunker.x = 2.2;
        dunker.z = 0;
        this.dunkMeterVal = 0;
        this.commentary = "Running up for the " + ((_ref = (_DUNK_CONTEST_MOVES_find = _modesData.DUNK_CONTEST_MOVES.find(function(m) {
            return m.id === moveId;
        })) == null ? void 0 : _DUNK_CONTEST_MOVES_find.name) != null ? _ref : 'Slam') + "! Press Space at the rim!";
        this.emitHud();
    };
    _proto.applySubstitutionPreset = function applySubstitutionPreset(side, preset) {
        var active = this.players.filter(function(p) {
            return p.side === side;
        });
        var bench = side === 'home' ? this.allBenchHome : this.allBenchAway;
        if (bench.length === 0) return;
        var pool = [].concat(active.map(function(a) {
            return a.data;
        }), bench);
        var sorted = [].concat(pool);
        if (preset === 'Starters') sorted.sort(function(a, b) {
            return Number(b.isStarter) - Number(a.isStarter) || b.ovr - a.ovr;
        });
        else if (preset === 'Bench') sorted.sort(function(a, b) {
            return Number(a.isStarter) - Number(b.isStarter) || b.ovr - a.ovr;
        });
        else if (preset === 'Tall') sorted.sort(function(a, b) {
            return b.heightCm - a.heightCm;
        });
        else if (preset === '3PT') sorted.sort(function(a, b) {
            return b.attrs.threePt - a.attrs.threePt;
        });
        else if (preset === 'Defense') sorted.sort(function(a, b) {
            return b.attrs.onBallDefense + b.attrs.block - (a.attrs.onBallDefense + a.attrs.block);
        });
        var nextFive = sorted.slice(0, active.length);
        var nextBench = sorted.slice(active.length);
        if (side === 'home') this.allBenchHome = nextBench;
        else this.allBenchAway = nextBench;
        active.forEach(function(sp, i) {
            var nextP = nextFive[i];
            if (!nextP || nextP.id === sp.data.id) return;
            sp.data = nextP;
            sp.stamina = 96;
            sp.stats.name = nextP.name;
            sp.stats.jersey = nextP.jersey;
            sp.stats.pos = nextP.pos;
        });
        this.commentary = "Substitution Preset applied: " + preset + " lineup on the floor.";
    };
    _proto.finishEarlyAndSummarize = function finishEarlyAndSummarize() {
        if (this.finished) return;
        this.finalizeMatch();
    };
    _proto.onActionPress = function onActionPress(code) {
        var _this = this;
        var kb = this.settings.keybinds;
        // Free Throw Release
        if (this.freeThrowActive && code === kb.shoot) {
            this.resolveFreeThrow();
            return;
        }
        // Dunk Contest Timing Press
        if (this.config.mode === 'dunkcontest' && code === kb.shoot) {
            if (this.dunkPhase === 'runup' || this.dunkPhase === 'meter') {
                this.resolveDunkContestAttempt();
            }
            return;
        }
        var ctrl = this.getControlledPlayer();
        if (!ctrl) return;
        var hasBall = this.ball.state === 'held' && this.ball.holderId === ctrl.data.id;
        // Shoot / Alley-Oop / Steal
        if (code === kb.shoot) {
            if (hasBall) {
                if (this.keys.has(kb.intenseD)) {
                    this.attemptAlleyOop(ctrl);
                } else {
                    this.startShotCharge(ctrl);
                }
            } else if (this.possession !== ctrl.side) {
                this.attemptSteal(ctrl);
            }
            return;
        }
        // Pro Stick Flicks (I/J/K/L) -> IsoMotion Dribble or Euro/Hop Layup
        if ([
            kb.proStickUp,
            kb.proStickDown,
            kb.proStickLeft,
            kb.proStickRight
        ].includes(code)) {
            if (hasBall) {
                if (this.settings.controller.proStickFunction === 'Shots') {
                    this.startShotCharge(ctrl);
                } else {
                    this.triggerIsoMotionDribble(ctrl, code);
                }
            }
            return;
        }
        // Pass / Switch Defender
        if (code === kb.pass) {
            if (hasBall) {
                var isBounce = this.keys.has(kb.intenseD);
                this.executeSmartPass(ctrl, isBounce ? 'bounce' : 'chest');
            } else if (this.possession !== ctrl.side && !this.config.playerLockId) {
                this.switchNearestDefender();
            } else if (this.possession === ctrl.side && this.config.playerLockId) {
                // Call for pass in MyCAREER Player Lock
                var holder = this.players.find(function(p) {
                    return p.data.id === _this.ball.holderId;
                });
                if (holder && holder.side === ctrl.side) {
                    this.launchPass(holder, ctrl, 'chest');
                }
            }
            return;
        }
        // Flashy Pass
        if (code === kb.flashyPass && hasBall) {
            this.executeSmartPass(ctrl, 'flashy');
            return;
        }
        // Post-Up (Offense) / Block & Rebound (Defense)
        if (code === kb.postUp) {
            if (hasBall) {
                ctrl.isPostingUp = !ctrl.isPostingUp;
                ctrl.pose = ctrl.isPostingUp ? 'post' : 'dribble';
            } else {
                this.attemptBlockOrRebound(ctrl);
            }
            return;
        }
        // Pick & Roll (Offense) / Take Charge (Defense)
        if (code === kb.pickAndRoll) {
            if (this.possession === ctrl.side) {
                this.callPickAndRoll(ctrl);
            } else {
                this.attemptTakeCharge(ctrl);
            }
        }
    };
    _proto.handleResize = function handleResize() {
        if (this.disposed) return;
        var w = Math.max(320, this.container.clientWidth);
        var h = Math.max(240, this.container.clientHeight);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h, false);
    };
    // ==================== GAMEPLAY ACTIONS ====================
    _proto.getControlledPlayer = function getControlledPlayer() {
        var _this = this;
        var _this_players_find;
        return (_this_players_find = this.players.find(function(p) {
            return p.data.id === _this.controlledId;
        })) != null ? _this_players_find : this.players[0];
    };
    _proto.getNearestOpponent = function getNearestOpponent(p) {
        var best = null;
        var bestDist = Infinity;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.players), _step; !(_step = _iterator()).done;){
            var o = _step.value;
            if (o.side === p.side) continue;
            var d = Math.hypot(o.x - p.x, o.z - p.z);
            if (d < bestDist) {
                bestDist = d;
                best = o;
            }
        }
        return best;
    };
    _proto.switchNearestDefender = function switchNearestDefender() {
        var userSide = this.config.userSide;
        var defs = this.players.filter(function(p) {
            return p.side === userSide;
        });
        var best = defs[0];
        var bestD = Infinity;
        for(var _iterator = _create_for_of_iterator_helper_loose(defs), _step; !(_step = _iterator()).done;){
            var d = _step.value;
            var dist = Math.hypot(d.x - this.ball.x, d.z - this.ball.z);
            if (dist < bestD) {
                bestD = dist;
                best = d;
            }
        }
        if (best) this.controlledId = best.data.id;
    };
    _proto.startShotCharge = function startShotCharge(p) {
        this.isChargingShot = true;
        this.shotChargeTime = 0;
        this.shotStartPressMs = performance.now();
        this.shotReleaseDuration = p.data.releaseSpeed;
        p.pose = 'jumpshot';
    };
    _proto.releaseShot = function releaseShot(triggerCode) {
        var p = this.getControlledPlayer();
        this.isChargingShot = false;
        if (!p || this.ball.holderId !== p.data.id) return;
        var heldMs = performance.now() - this.shotStartPressMs;
        // Quick tap (<130ms) = Pump Fake!
        if (heldMs < 130 && this.config.mode !== 'shootout3pt') {
            p.pose = 'jumpshot';
            p.poseTimer = 0.24;
            var def = this.getNearestOpponent(p);
            if (def && Math.hypot(def.x - p.x, def.z - p.z) < 2.2) {
                def.jumpVelY = 4.6;
                def.pose = 'block';
                def.poseTimer = 0.55;
                this.commentary = p.data.name + " pump fakes and gets " + def.data.name + " in the air!";
            }
            return;
        }
        var fill = this.shotChargeTime / this.shotReleaseDuration;
        var sweetSpot = 0.82;
        var releaseError = fill - sweetSpot;
        var kb = this.settings.keybinds;
        var isEuro = triggerCode === kb.proStickLeft || triggerCode === kb.proStickRight;
        this.fireBasketballShot(p, releaseError, isEuro);
    };
    _proto.fireBasketballShot = function fireBasketballShot(p, releaseError, forceEuro, isAlleyOop) {
        if (forceEuro === void 0) forceEuro = false;
        if (isAlleyOop === void 0) isAlleyOop = false;
        var _ref;
        var hoopX = this.getTargetHoopX(p.side);
        var _classifyShotZone = (0, _modesData.classifyShotZone)(p.x, p.z, hoopX, Boolean(this.config.fibaRules)), zone = _classifyShotZone.zone, isThree = _classifyShotZone.isThree, distMeters = _classifyShotZone.distMeters;
        var sprintHeld = p.data.id === this.controlledId && (this.keys.has(this.settings.keybinds.sprint) || this.virtualInput.sprint);
        var speed = Math.hypot(p.vx, p.vz);
        var shotType = isThree ? 'three' : 'mid';
        if (isAlleyOop) {
            shotType = 'dunk';
        } else if (distMeters < 2.35 && (sprintHeld || p.data.attrs.dunk >= 80) && speed > 2.2) {
            shotType = 'dunk';
        } else if (distMeters < 2.8) {
            shotType = forceEuro ? 'euro' : p.isPostingUp ? 'post_hook' : 'layup';
        } else if (p.isPostingUp) {
            shotType = 'post_fade';
        } else if (distMeters < 4.2) {
            shotType = 'close';
        }
        // Calculate Defender Contest
        var def = this.getNearestOpponent(p);
        var contestRatio = 0;
        if (def && this.config.mode !== 'shootout3pt') {
            var dDist = Math.hypot(def.x - p.x, def.z - p.z);
            if (dDist < 2.6) {
                contestRatio = Math.max(0, 1 - dDist / 2.6);
                if (def.pose === 'hands_up' || def.pose === 'block') contestRatio = Math.min(1, contestRatio + 0.25);
                if (def.stumbleTimer > 0) contestRatio *= 0.2;
            }
            // Check Mid-Air Rim/Chasedown Block!
            if (def.pose === 'block' && dDist < 1.75) {
                var blkReach = (0, _signatureSkills.computeBlockReachBonus)(def.data, speed > 5);
                var blkProb = Math.min(0.55, def.data.attrs.block / 260 * blkReach);
                if (Math.random() < blkProb) {
                    def.stats.blk += 1;
                    p.stats.fga += 1;
                    this.ball.state = 'loose';
                    this.ball.holderId = null;
                    this.ball.vx = (p.x - def.x) * 3.5;
                    this.ball.vy = 3.2;
                    this.ball.vz = (p.z - def.z) * 3.5;
                    _Nba2k14Audio.Nba2k14Audio.playRimClank();
                    _Nba2k14Audio.Nba2k14Audio.playCrowdCheer(0.95);
                    this.paBanner = "REJECTED BY " + def.data.name.toUpperCase() + "!";
                    this.paBannerTimer = 1.6;
                    this.commentary = "BLOCKED BY " + def.data.name + "! What a swat at the rim!";
                    if ((0, _signatureSkills.getSkillLevel)(def.data.signatureSkills, 'eraser') > 0) {
                        this.showSigSkillPopup('eraser', (0, _signatureSkills.getSkillLevel)(def.data.signatureSkills, 'eraser'), def.data.name);
                    }
                    if (def.data.id === this.controlledId) this.adjustTeammateGrade(0.45, '+Block');
                    return;
                }
            }
            // Check Shooting Foul on heavy paint contact
            if (this.settings.rules.shootingFouls && this.config.mode !== 'park' && this.config.mode !== 'blacktop' && this.config.mode !== 'training' && contestRatio > 0.72 && (shotType === 'layup' || shotType === 'dunk') && Math.random() < 0.14) {
                this.triggerShootingFoul(p, def, isThree ? 3 : 2);
                return;
            }
        }
        var isUserShooter = p.side === this.config.userSide;
        var sliders = isUserShooter ? this.settings.slidersUser : this.settings.slidersCpu;
        var isClutch = this.settings.game.clutchFactor && this.quarter >= 4 && this.gameClockSec <= 240 && Math.abs(this.homeScore - this.awayScore) <= 7;
        var teammates = this.players.filter(function(pl) {
            return pl.side === p.side;
        }).map(function(pl) {
            return pl.data;
        });
        var outcome = (0, _signatureSkills.computeShotProbability)({
            shooter: p.data,
            defender: (_ref = def == null ? void 0 : def.data) != null ? _ref : null,
            teammatesOnCourt: teammates,
            shotType: shotType,
            zone: zone,
            releaseError: releaseError,
            noMeterBoost: this.settings.controller.shotMeterDisplay === 'Off (No-Meter Green Boost)',
            contestRatio: contestRatio,
            fatigueRatio: this.settings.game.fatigue ? Math.max(0, (100 - p.stamina) / 100) : 0,
            streak: p.streak,
            isFastbreak: this.shotClockSec > 18.5,
            offDribble: speed > 2.4 && shotType !== 'dunk' && shotType !== 'layup',
            justCaughtPass: p.catchTimer > 0,
            passerSkills: p.lastPasserSkills,
            passFromPost: p.lastPassFromPost,
            usedScreenRecently: p.usedScreenTimer > 0,
            isScreenerPop: p.screenerPopTimer > 0,
            isAlleyOop: isAlleyOop,
            isClutchTime: isClutch,
            difficulty: this.settings.game.difficulty,
            sliders: sliders,
            realPlayerPctMode: this.settings.game.shotTiming === 'Real Player FG%'
        });
        var willMake = Math.random() < outcome.makeProbability;
        // Trigger Signature Skill Flash
        if (outcome.triggeredSkills.length > 0) {
            var first = outcome.triggeredSkills[0];
            this.showSigSkillPopup(first.id, first.level, first.ownerName);
        }
        // Shot Feedback Banner for User
        if (isUserShooter && this.settings.controller.shotFeedback) {
            this.shotFeedback = {
                id: this.eventSeq++,
                release: outcome.releaseLabel,
                quality: outcome.qualityGrade,
                contestLabel: outcome.contestLabel,
                made: willMake,
                points: isThree ? 3 : 2,
                zone: zone,
                shooterName: p.data.name
            };
            this.shotFeedbackTimer = 2.4;
        }
        // Animate Player & Ball Trajectory
        p.pose = shotType === 'dunk' ? 'dunk' : shotType === 'layup' || shotType === 'euro' ? 'layup' : 'jumpshot';
        p.poseTimer = shotType === 'dunk' ? 0.65 : 0.45;
        p.jumpVelY = shotType === 'dunk' ? 5.6 : 4.2;
        p.isPostingUp = false;
        var targetSide = hoopX > 0 ? 'away' : 'home';
        this.ball.state = 'shot';
        this.ball.holderId = null;
        this.ball.shooterId = p.data.id;
        this.ball.shotTargetSide = targetSide;
        this.ball.shotWillMake = willMake;
        this.ball.shotPoints = isThree ? 3 : 2;
        this.ball.shotIsDunk = shotType === 'dunk';
        this.ball.shotZone = zone;
        this.ball.shotExcellent = outcome.releaseLabel === 'EXCELLENT';
        this.ball.shotFastbreak = this.shotClockSec > 18.5;
        this.ball.shotPaint = zone === 'restricted' || zone.startsWith('paint');
        this.ball.shotProgress = 0;
        this.ball.shotDuration = shotType === 'dunk' ? 0.34 : Math.min(1.15, Math.max(0.58, distMeters * 0.11));
        this.ball.shotStart.set(p.x, 2.15, p.z);
        this.ball.shotEnd.set(hoopX + (willMake ? 0 : Math.random() > 0.5 ? 0.27 : -0.27), _arenaBuilder.RIM_Y, willMake ? 0 : (Math.random() - 0.5) * 0.38);
        this.ball.shotPeakY = shotType === 'dunk' ? _arenaBuilder.RIM_Y + 0.55 : _arenaBuilder.RIM_Y + 1.45 + distMeters * 0.24;
        if (shotType === 'dunk') {
            p.x = _three.MathUtils.lerp(p.x, hoopX - Math.sign(hoopX) * 0.6, 0.55);
            p.z *= 0.4;
        }
        if (isUserShooter && outcome.qualityGrade === 'F') {
            this.adjustTeammateGrade(-0.22, '-Bad Shot Selection');
        } else if (isUserShooter && outcome.qualityGrade === 'A+') {
            this.adjustTeammateGrade(0.18, '+Good Shot Selection');
        }
        if (this.config.mode === 'training') {
            this.checkTrainingDrillProgress(shotType, willMake);
        }
    };
    _proto.triggerIsoMotionDribble = function triggerIsoMotionDribble(p, code) {
        var kb = this.settings.keybinds;
        p.pose = 'crossover';
        p.poseTimer = 0.32;
        p.isoChain = Math.min(4, p.isoChain + 1);
        p.isoResetTimer = 1.6;
        p.stamina = Math.max(10, p.stamina - 4.5);
        var sidePush = code === kb.proStickLeft ? -3.4 : code === kb.proStickRight ? 3.4 : 0;
        var backPush = code === kb.proStickDown ? -3.2 * this.getAttackDir(p.side) : 1.8 * this.getAttackDir(p.side);
        p.vx += backPush;
        p.vz += sidePush;
        _Nba2k14Audio.Nba2k14Audio.playSneakerSqueak();
        _Nba2k14Audio.Nba2k14Audio.playDribble();
        // Roll Ankle Breaker Physics Check!
        var def = this.getNearestOpponent(p);
        if (def && Math.hypot(def.x - p.x, def.z - p.z) < 2.2) {
            var chance = (0, _signatureSkills.computeAnkleBreakerChance)(p.data, def.data, p.isoChain);
            if (Math.random() < chance) {
                def.stumbleTimer = 1.35;
                def.pose = 'stumble';
                this.crowdExcitement = Math.min(1, this.crowdExcitement + 0.45);
                _Nba2k14Audio.Nba2k14Audio.playCrowdCheer(0.85);
                this.commentary = "OH! " + p.data.name + " drops " + def.data.name + " with a nasty IsoMotion crossover!";
                var abLvl = (0, _signatureSkills.getSkillLevel)(p.data.signatureSkills, 'ankle_breaker');
                if (abLvl > 0) this.showSigSkillPopup('ankle_breaker', abLvl, p.data.name);
                if (p.data.id === this.controlledId) this.adjustTeammateGrade(0.25, '+Ankle Breaker');
            }
        }
    };
    _proto.executeSmartPass = function executeSmartPass(passer, style) {
        var teammates = this.players.filter(function(pl) {
            return pl.side === passer.side && pl.data.id !== passer.data.id;
        });
        if (teammates.length === 0) return;
        // Pick best open teammate closest to movement/facing direction
        var best = teammates[0];
        var bestScore = -Infinity;
        for(var _iterator = _create_for_of_iterator_helper_loose(teammates), _step; !(_step = _iterator()).done;){
            var tm = _step.value;
            var dist = Math.hypot(tm.x - passer.x, tm.z - passer.z);
            var nearestDef = this.getNearestOpponent(tm);
            var openness = nearestDef ? Math.min(4, Math.hypot(nearestDef.x - tm.x, nearestDef.z - tm.z)) : 3;
            var score = openness * 2.5 - dist * 0.25;
            if (score > bestScore) {
                bestScore = score;
                best = tm;
            }
        }
        this.launchPass(passer, best, style);
    };
    _proto.executeIconPass = function executeIconPass(slotIdx) {
        var passer = this.getControlledPlayer();
        if (!passer || this.ball.holderId !== passer.data.id) return;
        var teammates = this.players.filter(function(pl) {
            return pl.side === passer.side;
        });
        var target = teammates[slotIdx];
        if (target && target.data.id !== passer.data.id) {
            this.launchPass(passer, target, 'chest');
        }
    };
    _proto.launchPass = function launchPass(passer, receiver, style) {
        // Check Flashy Pass turnover risk
        if (style === 'flashy') {
            var fpLvl = (0, _signatureSkills.getSkillLevel)(passer.data.signatureSkills, 'flashy_passer');
            var turnoverRisk = 0.22 * (1 - fpLvl * 0.2);
            if (fpLvl > 0) this.showSigSkillPopup('flashy_passer', fpLvl, passer.data.name);
            if (Math.random() < turnoverRisk) {
                passer.stats.to += 1;
                this.ball.state = 'loose';
                this.ball.holderId = null;
                this.ball.vx = (receiver.x - passer.x) * 1.4;
                this.ball.vy = 1.6;
                this.ball.vz = (receiver.z - passer.z) * 1.4;
                this.commentary = "Flashy pass goes awry off " + passer.data.name + "'s hands!";
                return;
            }
        }
        this.ball.state = 'pass';
        this.ball.holderId = null;
        this.ball.passTargetId = receiver.data.id;
        this.ball.shooterId = passer.data.id;
        receiver.lastPasserSkills = passer.data.signatureSkills;
        receiver.lastPassFromPost = passer.isPostingUp;
        _Nba2k14Audio.Nba2k14Audio.playDribble();
        if (passer.data.id === this.controlledId) {
            this.adjustTeammateGrade(0.08, style === 'flashy' ? '+Flashy Pass' : '+Good Pass');
        }
    };
    _proto.attemptAlleyOop = function attemptAlleyOop(passer) {
        var hoopX = this.getTargetHoopX(passer.side);
        var teammates = this.players.filter(function(pl) {
            return pl.side === passer.side && pl.data.id !== passer.data.id;
        });
        if (teammates.length === 0) return;
        var flyer = [].concat(teammates).sort(function(a, b) {
            return b.data.attrs.dunk + b.data.attrs.vertical - (a.data.attrs.dunk + a.data.attrs.vertical);
        })[0];
        flyer.x = hoopX - Math.sign(hoopX) * 1.35;
        flyer.z = (Math.random() - 0.5) * 1.1;
        flyer.jumpVelY = 6.0;
        flyer.pose = 'dunk';
        flyer.poseTimer = 0.7;
        this.ball.holderId = flyer.data.id;
        passer.stats.ast += 1;
        var oopLvl = (0, _signatureSkills.getSkillLevel)(passer.data.signatureSkills, 'alley_ooper');
        if (oopLvl > 0) this.showSigSkillPopup('alley_ooper', oopLvl, passer.data.name);
        this.commentary = "ALLEY-OOP! " + passer.data.name + " throws it up to " + flyer.data.name + " for the slam!";
        this.fireBasketballShot(flyer, 0.01, false, true);
        if (this.config.mode === 'training' && this.config.trainingDrillId === 'alley_oop') {
            this.trainingReps += 1;
        }
    };
    _proto.callPickAndRoll = function callPickAndRoll(handler) {
        var teammates = this.players.filter(function(pl) {
            return pl.side === handler.side && pl.data.id !== handler.data.id;
        });
        if (teammates.length === 0) return;
        var big = [].concat(teammates).sort(function(a, b) {
            return b.data.heightCm - a.data.heightCm;
        })[0];
        big.isScreening = true;
        var dir = this.getAttackDir(handler.side);
        big.x = handler.x + dir * 1.15;
        big.z = handler.z + (handler.z > 0 ? -1.1 : 1.1);
        handler.usedScreenTimer = 3.2;
        big.screenerPopTimer = 3.5;
        this.otfc.activePlay = 'Pick & Roll';
        this.commentary = "" + big.data.name + " comes up to set a hard Pick & Roll screen!";
        // Brick Wall vs Pick Dodger check on defender
        var def = this.getNearestOpponent(handler);
        if (def && Math.hypot(def.x - big.x, def.z - big.z) < 2.4) {
            var knock = (0, _signatureSkills.computeScreenKnockdownChance)(big.data, def.data);
            if (Math.random() < knock) {
                def.stumbleTimer = 1.25;
                def.pose = 'stumble';
                def.stamina = Math.max(10, def.stamina - 14);
                var bwLvl = (0, _signatureSkills.getSkillLevel)(big.data.signatureSkills, 'brick_wall');
                if (bwLvl > 0) this.showSigSkillPopup('brick_wall', bwLvl, big.data.name);
            }
        }
        if (this.config.mode === 'training' && this.config.trainingDrillId === 'pick_roll') {
            this.trainingReps += 1;
        }
    };
    _proto.attemptSteal = function attemptSteal(def) {
        var _this = this;
        var handler = this.players.find(function(p) {
            return p.data.id === _this.ball.holderId;
        });
        if (!handler || handler.side === def.side) return;
        var dist = Math.hypot(handler.x - def.x, handler.z - def.z);
        def.pose = 'intense_d';
        def.poseTimer = 0.25;
        if (dist > 1.95) return;
        var sliders = def.side === this.config.userSide ? this.settings.slidersUser : this.settings.slidersCpu;
        var _computeStealOutcome = (0, _signatureSkills.computeStealOutcome)(def.data, handler.data, handler.pose === 'crossover', sliders.stealSuccess), stealProb = _computeStealOutcome.stealProb, foulProb = _computeStealOutcome.foulProb;
        if (Math.random() < stealProb) {
            def.stats.stl += 1;
            handler.stats.to += 1;
            this.ball.holderId = def.data.id;
            this.possession = def.side;
            this.shotClockSec = 24;
            this.backcourtTimer = 0;
            _Nba2k14Audio.Nba2k14Audio.playSneakerSqueak();
            _Nba2k14Audio.Nba2k14Audio.playCrowdCheer(0.65);
            this.commentary = "STOLEN BY " + def.data.name + "! Clean rip!";
            var pkp = (0, _signatureSkills.getSkillLevel)(def.data.signatureSkills, 'pick_pocket');
            if (pkp > 0) this.showSigSkillPopup('pick_pocket', pkp, def.data.name);
            if (def.data.id === this.controlledId) this.adjustTeammateGrade(0.35, '+Steal');
            if (this.config.mode === 'training' && this.config.trainingDrillId === 'intense_d') {
                this.trainingReps += 1;
            }
        } else if (this.settings.rules.reachInFouls && Math.random() < foulProb && this.config.mode !== 'park' && this.config.mode !== 'blacktop') {
            def.stats.pf += 1;
            if (def.side === 'home') this.homeFoulsQ += 1;
            else this.awayFoulsQ += 1;
            _Nba2k14Audio.Nba2k14Audio.playWhistle();
            this.commentary = "Whistle! Reach-in foul on " + def.data.name + ".";
            if (def.data.id === this.controlledId) this.adjustTeammateGrade(-0.25, '-Reach-In Foul');
        }
    };
    _proto.attemptBlockOrRebound = function attemptBlockOrRebound(p) {
        if (p.y > 0.05) return;
        p.jumpVelY = 5.1;
        p.pose = 'block';
        p.poseTimer = 0.45;
    };
    _proto.attemptTakeCharge = function attemptTakeCharge(def) {
        var _this = this;
        var handler = this.players.find(function(p) {
            return p.data.id === _this.ball.holderId;
        });
        if (!handler || handler.side === def.side) return;
        var dist = Math.hypot(handler.x - def.x, handler.z - def.z);
        var speed = Math.hypot(handler.vx, handler.vz);
        if (this.settings.rules.chargingFouls && dist < 1.6 && speed > 4.2) {
            var cc = (0, _signatureSkills.getSkillLevel)(def.data.signatureSkills, 'charge_card');
            if (Math.random() < 0.28 + cc * 0.14) {
                handler.stats.pf += 1;
                handler.stats.to += 1;
                _Nba2k14Audio.Nba2k14Audio.playWhistle();
                this.paBanner = 'OFFENSIVE FOUL · CHARGE DRAWN!';
                this.paBannerTimer = 1.8;
                this.commentary = "CHARGE! " + def.data.name + " stood his ground and drew the offensive foul!";
                if (cc > 0) this.showSigSkillPopup('charge_card', cc, def.data.name);
                if (def.data.id === this.controlledId) this.adjustTeammateGrade(0.42, '+Charge Drawn');
                this.resetHalfCourtPossession(def.side);
            }
        }
    };
    _proto.triggerShootingFoul = function triggerShootingFoul(shooter, defender, count) {
        defender.stats.pf += 1;
        if (defender.side === 'home') this.homeFoulsQ += 1;
        else this.awayFoulsQ += 1;
        _Nba2k14Audio.Nba2k14Audio.playWhistle();
        this.paBanner = "SHOOTING FOUL \xb7 " + count + " FREE THROWS";
        this.paBannerTimer = 2.0;
        this.commentary = "Foul called on " + defender.data.name + "! " + shooter.data.name + " heads to the charity stripe for " + count + ".";
        if (shooter.side === this.config.userSide && this.settings.game.freeThrowTiming === 'User Timing') {
            this.freeThrowActive = true;
            this.freeThrowShooterId = shooter.data.id;
            this.freeThrowRemaining = count;
            this.freeThrowPos = 0;
            this.freeThrowDir = 1;
        } else {
            // Simulate AI / Real Player FT%
            var made = 0;
            for(var i = 0; i < count; i++){
                shooter.stats.fta += 1;
                if (Math.random() < shooter.data.attrs.freeThrow / 100) {
                    shooter.stats.ftm += 1;
                    shooter.stats.pts += 1;
                    made += 1;
                    this.addScore(shooter.side, 1);
                }
            }
            this.commentary = shooter.data.name + " hits " + made + " of " + count + " free throws.";
            this.resetHalfCourtPossession(shooter.side === 'home' ? 'away' : 'home');
        }
    };
    _proto.resolveFreeThrow = function resolveFreeThrow() {
        var _this = this;
        var shooter = this.players.find(function(p) {
            return p.data.id === _this.freeThrowShooterId;
        });
        if (!shooter) {
            this.freeThrowActive = false;
            return;
        }
        var err = Math.abs(this.freeThrowPos - 0.5);
        var makeProb = err < 0.08 ? 0.98 : err < 0.18 ? 0.78 : 0.35;
        shooter.stats.fta += 1;
        if (Math.random() < makeProb) {
            shooter.stats.ftm += 1;
            shooter.stats.pts += 1;
            this.addScore(shooter.side, 1);
            _Nba2k14Audio.Nba2k14Audio.playSwish(false);
            this.commentary = "" + shooter.data.name + " drains the free throw!";
        } else {
            _Nba2k14Audio.Nba2k14Audio.playRimClank();
            this.commentary = "" + shooter.data.name + " rims out the free throw.";
        }
        this.freeThrowRemaining -= 1;
        if (this.freeThrowRemaining <= 0) {
            this.freeThrowActive = false;
            this.freeThrowShooterId = null;
            this.resetHalfCourtPossession(shooter.side === 'home' ? 'away' : 'home');
        }
    };
    _proto.resolveDunkContestAttempt = function resolveDunkContestAttempt() {
        var _this = this;
        var _DUNK_CONTEST_MOVES_find;
        var move = (_DUNK_CONTEST_MOVES_find = _modesData.DUNK_CONTEST_MOVES.find(function(m) {
            return m.id === _this.dunkMoveId;
        })) != null ? _DUNK_CONTEST_MOVES_find : _modesData.DUNK_CONTEST_MOVES[0];
        var err = Math.abs(this.dunkMeterVal - 0.8);
        var base = Math.round(Math.max(32, Math.min(50, move.difficulty + (0.2 - err) * 45)));
        var judges = Array.from({
            length: 5
        }, function(_, i) {
            return Math.max(6, Math.min(10, Math.round(base / 5 + (i % 2 === 0 ? 1 : -1) * (err < 0.06 ? 0 : 1))));
        });
        var total = judges.reduce(function(a, b) {
            return a + b;
        }, 0);
        this.dunkJudgeScores = judges;
        this.dunkTotalScore += total;
        this.dunkPhase = 'scored';
        var dunker = this.players[0];
        dunker.x = _arenaBuilder.HOOP_X - 0.8;
        dunker.y = 1.6;
        dunker.pose = 'dunk';
        dunker.poseTimer = 0.9;
        this.arena.triggerSwish('away', true);
        _Nba2k14Audio.Nba2k14Audio.playDunkBoom();
        this.cameraShake = 0.55;
        this.paBanner = "DUNK SCORE: " + total + " / 50!";
        this.paBannerTimer = 2.4;
        this.commentary = move.name + "! The judges award a " + total + "!";
        setTimeout(function() {
            if (_this.disposed || _this.finished) return;
            if (_this.dunkRound >= 2) {
                _this.homeScore = _this.dunkTotalScore;
                _this.awayScore = 84; // AI rival benchmark
                _this.finalizeMatch();
            } else {
                _this.dunkRound += 1;
                _this.dunkAttempt += 1;
                _this.dunkPhase = 'select';
                dunker.x = 3.2;
                dunker.y = 0;
                _this.emitHud();
            }
        }, 2200);
        this.emitHud();
    };
    _proto.checkTrainingDrillProgress = function checkTrainingDrillProgress(shotType, made) {
        var _this = this;
        var _this_config_trainingDrillId, _ref;
        var _this_getControlledPlayer;
        var id = (_this_config_trainingDrillId = this.config.trainingDrillId) != null ? _this_config_trainingDrillId : 'freestyle';
        if (!made) return;
        if (id === 'freestyle' || id === 'jump_shot' && (shotType === 'three' || shotType === 'mid') || id === 'isomotion' && ((_ref = (_this_getControlledPlayer = this.getControlledPlayer()) == null ? void 0 : _this_getControlledPlayer.isoChain) != null ? _ref : 0) > 0 || id === 'euro_hop' && (shotType === 'euro' || shotType === 'layup') || id === 'poster_dunk' && shotType === 'dunk' || id === 'post_moves' && (shotType === 'post_fade' || shotType === 'post_hook')) {
            this.trainingReps += 1;
            var drill = _modesData.TRAINING_DRILLS.find(function(d) {
                return d.id === id;
            });
            if (drill && this.trainingReps >= drill.targetReps && id !== 'freestyle') {
                this.homeScore = this.trainingReps * 2;
                this.awayScore = 0;
                this.paBanner = "DRILL COMPLETE \xb7 +" + drill.spReward + " SP!";
                this.paBannerTimer = 2.0;
                setTimeout(function() {
                    if (!_this.disposed && !_this.finished) _this.finalizeMatch();
                }, 1200);
            }
        }
    };
    _proto.showSigSkillPopup = function showSigSkillPopup(id, level, playerName) {
        var def = _signatureSkills.SIGNATURE_SKILL_MAP[id];
        if (!def) return;
        this.sigPopup = {
            id: this.eventSeq++,
            skillId: id,
            skillName: def.name,
            code: def.code,
            playerName: playerName,
            level: level
        };
        this.sigPopupTimer = 2.1;
    };
    _proto.adjustTeammateGrade = function adjustTeammateGrade(delta, label) {
        this.teammateGradeFill += delta;
        while(this.teammateGradeFill >= 1 && this.teammateGradeIdx < GRADE_STEPS.length - 1){
            this.teammateGradeFill -= 1;
            this.teammateGradeIdx += 1;
        }
        while(this.teammateGradeFill < 0 && this.teammateGradeIdx > 0){
            this.teammateGradeFill += 1;
            this.teammateGradeIdx -= 1;
        }
        this.teammateGradeFill = Math.max(0.05, Math.min(0.95, this.teammateGradeFill));
        this.gradeEvents = [].concat([
            {
                id: this.eventSeq++,
                text: label,
                positive: delta >= 0
            }
        ], this.gradeEvents).slice(0, 4);
    };
    _proto.addScore = function addScore(side, pts) {
        var actualPts = this.config.targetScore ? pts === 3 ? 2 : 1 : pts; // Park/Blacktop 1s & 2s
        if (side === 'home') {
            this.homeScore += actualPts;
            this.quarterScoresHome[Math.min(3, this.quarter - 1)] += actualPts;
        } else {
            this.awayScore += actualPts;
            this.quarterScoresAway[Math.min(3, this.quarter - 1)] += actualPts;
        }
        if (this.config.targetScore && (this.homeScore >= this.config.targetScore || this.awayScore >= this.config.targetScore)) {
            this.finalizeMatch();
        }
    };
    // ==================== MAIN SIMULATION LOOP ====================
    _proto.pollGamepad = function pollGamepad() {
        var _this = this;
        var mx = 0;
        var my = 0;
        var sprint = false;
        try {
            var _gp_buttons_;
            var pads = navigator.getGamepads ? navigator.getGamepads() : [];
            var gp = pads && pads[0];
            if (!gp) return {
                mx: mx,
                my: my,
                sprint: sprint
            };
            if (Math.abs(gp.axes[0] || 0) > 0.18) mx = gp.axes[0];
            if (Math.abs(gp.axes[1] || 0) > 0.18) my = gp.axes[1];
            sprint = Boolean((_gp_buttons_ = gp.buttons[7]) == null ? void 0 : _gp_buttons_.pressed);
            var kb = this.settings.keybinds;
            var btnPressed = function btnPressed(idx) {
                var _gp_buttons_idx;
                return Boolean((_gp_buttons_idx = gp.buttons[idx]) == null ? void 0 : _gp_buttons_idx.pressed);
            };
            var justPressed = function justPressed(idx) {
                return btnPressed(idx) && !_this.prevGamepadButtons[idx];
            };
            var justReleased = function justReleased(idx) {
                return !btnPressed(idx) && Boolean(_this.prevGamepadButtons[idx]);
            };
            if (justPressed(2)) this.onActionPress(kb.shoot); // Square / X
            if (justReleased(2) && this.isChargingShot) this.releaseShot(kb.shoot);
            if (justPressed(0)) this.onActionPress(kb.pass); // Cross / A
            if (justPressed(3)) this.onActionPress(kb.postUp); // Triangle / Y
            if (justPressed(1)) this.onActionPress(kb.pickAndRoll); // Circle / B
            if (justPressed(9)) this.setPaused(!this.paused); // Start
            if (justPressed(5)) this.iconPassActive = !this.iconPassActive; // R1
            // Right Stick IsoMotion Flick
            if (Math.abs(gp.axes[2] || 0) > 0.72) {
                var ctrl = this.getControlledPlayer();
                if (ctrl && this.ball.holderId === ctrl.data.id && ctrl.poseTimer <= 0) {
                    this.triggerIsoMotionDribble(ctrl, gp.axes[2] < 0 ? kb.proStickLeft : kb.proStickRight);
                }
            }
            this.prevGamepadButtons = gp.buttons.map(function(b) {
                return b.pressed;
            });
        } catch (unused) {
        // ignore unsupported gamepad
        }
        return {
            mx: mx,
            my: my,
            sprint: sprint
        };
    };
    _proto.stepSimulation = function stepSimulation(dt) {
        this.crowdExcitement = Math.max(0.2, this.crowdExcitement - dt * 0.14);
        if (this.buzzerFlashTimer > 0) this.buzzerFlashTimer = Math.max(0, this.buzzerFlashTimer - dt);
        if (this.cameraShake > 0) this.cameraShake = Math.max(0, this.cameraShake - dt * 2.5);
        if (this.shotFeedbackTimer > 0) {
            this.shotFeedbackTimer -= dt;
            if (this.shotFeedbackTimer <= 0) this.shotFeedback = null;
        }
        if (this.sigPopupTimer > 0) {
            this.sigPopupTimer -= dt;
            if (this.sigPopupTimer <= 0) this.sigPopup = null;
        }
        if (this.paBannerTimer > 0) {
            this.paBannerTimer -= dt;
            if (this.paBannerTimer <= 0) this.paBanner = null;
        }
        // Free Throw Meter Oscillation
        if (this.freeThrowActive) {
            this.freeThrowPos += this.freeThrowDir * dt * 1.45;
            if (this.freeThrowPos >= 1) {
                this.freeThrowPos = 1;
                this.freeThrowDir = -1;
            } else if (this.freeThrowPos <= 0) {
                this.freeThrowPos = 0;
                this.freeThrowDir = 1;
            }
            this.syncRigTransforms(dt);
            return;
        }
        // 3-Point Shootout Timer
        if (this.config.mode === 'shootout3pt') {
            this.shootoutTime = Math.max(0, this.shootoutTime - dt);
            if (this.shootoutTime <= 0) {
                _Nba2k14Audio.Nba2k14Audio.playBuzzer();
                this.homeScore = this.shootoutScore;
                this.awayScore = 18;
                this.finalizeMatch();
                return;
            }
        }
        // Dunk Contest Runup & Meter
        if (this.config.mode === 'dunkcontest') {
            var dunker = this.players[0];
            if (this.dunkPhase === 'runup') {
                dunker.x += dt * 5.8;
                dunker.pose = 'dribble';
                this.dunkMeterVal = Math.min(1, (dunker.x - 2.2) / 9.2);
                if (dunker.x >= _arenaBuilder.HOOP_X - 2.4) this.dunkPhase = 'meter';
                if (dunker.x >= _arenaBuilder.HOOP_X - 0.6) this.resolveDunkContestAttempt();
            } else if (this.dunkPhase === 'meter') {
                dunker.x += dt * 3.8;
                this.dunkMeterVal = Math.min(1, this.dunkMeterVal + dt * 0.65);
                if (this.dunkMeterVal >= 1) this.resolveDunkContestAttempt();
            }
            this.syncRigTransforms(dt);
            this.updateBall(dt);
            return;
        }
        // Regulation Clocks
        if (this.config.mode !== 'shootout3pt' && this.config.mode !== 'training' && !this.config.targetScore) {
            this.gameClockSec = Math.max(0, this.gameClockSec - dt);
            if (this.gameClockSec <= 0) {
                this.buzzerFlashTimer = 1.6;
                _Nba2k14Audio.Nba2k14Audio.playBuzzer();
                if (this.quarter < 4 || this.homeScore === this.awayScore) {
                    this.quarter += 1;
                    this.homeFoulsQ = 0;
                    this.awayFoulsQ = 0;
                    this.gameClockSec = this.quarter > 4 ? Math.min(180, this.config.quarterLengthMin * 60) : this.config.quarterLengthMin * 60;
                    this.paBanner = this.quarter > 4 ? "OVERTIME " + (this.quarter - 4) : "START OF QUARTER " + this.quarter;
                    this.paBannerTimer = 2.2;
                    this.resetHalfCourtPossession(this.quarter % 2 === 0 ? 'away' : 'home', true);
                } else {
                    this.finalizeMatch();
                    return;
                }
            }
        }
        // 24-Second Shot Clock
        if (this.settings.rules.shotClock24 && this.config.mode !== 'shootout3pt' && this.config.mode !== 'training' && this.ball.state === 'held') {
            this.shotClockSec = Math.max(0, this.shotClockSec - dt);
            if (this.shotClockSec <= 0) {
                this.buzzerFlashTimer = 1.4;
                _Nba2k14Audio.Nba2k14Audio.playBuzzer();
                this.paBanner = '24-SECOND SHOT CLOCK VIOLATION';
                this.paBannerTimer = 1.8;
                this.resetHalfCourtPossession(this.possession === 'home' ? 'away' : 'home');
                return;
            }
        }
        // Charge Active Shot Meter
        if (this.isChargingShot) {
            this.shotChargeTime += dt;
            if (this.shotChargeTime >= this.shotReleaseDuration * 1.25) {
                this.releaseShot();
            }
        }
        // Handle Virtual Touch Shoot Button Edge
        if (this.virtualInput.shoot && !this.prevVirtualShoot) {
            this.onActionPress(this.settings.keybinds.shoot);
        } else if (!this.virtualInput.shoot && this.prevVirtualShoot && this.isChargingShot) {
            this.releaseShot(this.settings.keybinds.shoot);
        }
        this.prevVirtualShoot = this.virtualInput.shoot;
        // Update Controlled Player Movement
        this.updateControlledMovement(dt);
        // Update AI Players
        if (this.config.mode !== 'shootout3pt') {
            this.updateAiPlayers(dt);
        }
        // Update Ball & Scoring
        this.updateBall(dt);
        // Sync 3D Player Rigs & Floor Rings
        this.syncRigTransforms(dt);
        // Update PlayVision 3D Floor Art
        this.arena.setPlayVision(this.otfc.activePlay, this.getAttackDir(this.possession), this.settings.coach.playVision !== 'Off' && this.possession === this.config.userSide);
    };
    _proto.updateControlledMovement = function updateControlledMovement(dt) {
        var _this = this;
        var p = this.getControlledPlayer();
        if (!p || this.config.mode === 'shootout3pt') return;
        var kb = this.settings.keybinds;
        var gp = this.pollGamepad();
        var inX = gp.mx + this.virtualInput.moveX;
        var inY = gp.my + this.virtualInput.moveY;
        if (this.keys.has(kb.moveUp)) inY -= 1;
        if (this.keys.has(kb.moveDown)) inY += 1;
        if (this.keys.has(kb.moveLeft)) inX -= 1;
        if (this.keys.has(kb.moveRight)) inX += 1;
        var mag = Math.hypot(inX, inY);
        if (mag > 1) {
            inX /= mag;
            inY /= mag;
        }
        // Map screen-space input according to active camera orientation
        var worldDx = 0;
        var worldDz = 0;
        var camAngle = this.settings.camera.angle;
        if (camAngle === '2K' || camAngle === 'Turbo' || camAngle === 'Drive' || camAngle === 'Player Lock') {
            var dir = this.settings.camera.autoFlip ? this.getAttackDir(this.possession) : this.getAttackDir(this.config.userSide);
            worldDx = -inY * dir;
            worldDz = inX * dir;
        } else {
            // Broadcast / Nosebleeds TV Sideline orientation
            worldDx = inX;
            worldDz = inY;
        }
        var sprint = (this.keys.has(kb.sprint) || gp.sprint || this.virtualInput.sprint) && p.stamina > 8;
        var intenseD = (this.keys.has(kb.intenseD) || this.virtualInput.intenseD) && this.possession !== p.side;
        var handsUp = this.keys.has(kb.handsUp) && this.possession !== p.side;
        var fastbreakBonus = this.shotClockSec > 18 ? (0, _signatureSkills.getEffectiveFastbreakSpeedBonus)(p.data) * 0.08 : 0;
        var baseSpeed = 4.6 + p.data.attrs.speed / 99 * 2.4 + fastbreakBonus;
        var moveSpeed = sprint ? baseSpeed * 1.28 : intenseD ? baseSpeed * 0.78 : baseSpeed;
        if (p.stumbleTimer > 0) {
            p.vx *= 0.85;
            p.vz *= 0.85;
        } else if (this.isChargingShot) {
            p.vx *= 0.72;
            p.vz *= 0.72;
        } else {
            p.vx = _three.MathUtils.lerp(p.vx, worldDx * moveSpeed, Math.min(1, dt * 11));
            p.vz = _three.MathUtils.lerp(p.vz, worldDz * moveSpeed, Math.min(1, dt * 11));
        }
        p.x += p.vx * dt;
        p.z += p.vz * dt;
        // Out-of-bounds clamping (or violation)
        var maxX = _arenaBuilder.COURT_LENGTH / 2 - 0.35;
        var maxZ = _arenaBuilder.COURT_WIDTH / 2 - 0.35;
        p.x = _three.MathUtils.clamp(p.x, -maxX, maxX);
        p.z = _three.MathUtils.clamp(p.z, -maxZ, maxZ);
        // Stamina drain / recovery
        if (this.settings.game.fatigue) {
            if (sprint && mag > 0.1) p.stamina = Math.max(5, p.stamina - dt * 14);
            else p.stamina = Math.min(100, p.stamina + dt * 6.5);
            p.stats.stamina = Math.round(p.stamina);
        }
        if (p.poseTimer <= 0 && p.stumbleTimer <= 0 && !this.isChargingShot) {
            if (handsUp) p.pose = 'hands_up';
            else if (intenseD) p.pose = 'intense_d';
            else if (p.isPostingUp) p.pose = 'post';
            else if (this.ball.holderId === p.data.id) p.pose = 'dribble';
            else p.pose = Math.hypot(p.vx, p.vz) > 0.6 ? 'run' : 'idle';
        }
        // Intense D Defensive Assist Shading
        if (intenseD && this.settings.controller.defensiveAssist > 10) {
            var handler = this.players.find(function(pl) {
                return pl.data.id === _this.ball.holderId;
            });
            if (handler && Math.hypot(handler.x - p.x, handler.z - p.z) < 3.5) {
                var hoopX = this.getTargetHoopX(handler.side);
                var shadeX = _three.MathUtils.lerp(handler.x, hoopX, 0.22);
                var assist = this.settings.controller.defensiveAssist / 100 * dt * 2.8;
                p.x = _three.MathUtils.lerp(p.x, shadeX, assist);
                p.z = _three.MathUtils.lerp(p.z, handler.z, assist);
            }
        }
        // Facing Direction
        var hoopX1 = this.getTargetHoopX(p.side);
        if (this.ball.holderId === p.data.id || p.isPostingUp) {
            p.rotY = Math.atan2(hoopX1 - p.x, -p.z);
        } else if (Math.hypot(p.vx, p.vz) > 0.4) {
            p.rotY = Math.atan2(p.vx, p.vz);
        }
    };
    _proto.updateAiPlayers = function updateAiPlayers(dt) {
        var _this = this;
        this.aiDecisionCooldown = Math.max(0, this.aiDecisionCooldown - dt);
        var offDir = this.getAttackDir(this.possession);
        var attackHoopX = this.getTargetHoopX(this.possession);
        var offTeam = this.players.filter(function(p) {
            return p.side === _this.possession;
        });
        var defTeam = this.players.filter(function(p) {
            return p.side !== _this.possession;
        });
        // Floor spacing spots for off-ball offense
        var spacingSpots = [
            [
                attackHoopX - offDir * 7.8,
                0
            ],
            [
                attackHoopX - offDir * 2.2,
                -6.5
            ],
            [
                attackHoopX - offDir * 2.2,
                6.5
            ],
            [
                attackHoopX - offDir * 5.6,
                -4.4
            ],
            [
                attackHoopX - offDir * 4.2,
                3.6
            ]
        ];
        for(var _iterator = _create_for_of_iterator_helper_loose(this.players), _step; !(_step = _iterator()).done;){
            var p = _step.value;
            if (p.data.id === this.controlledId) continue;
            if (p.stumbleTimer > 0) continue;
            var isOff = p.side === this.possession;
            var hasBall = this.ball.state === 'held' && this.ball.holderId === p.data.id;
            var moveSpeed = 4.3 + p.data.attrs.speed / 99 * 2.1;
            var targetX = p.x;
            var targetZ = p.z;
            if (this.ball.state === 'loose') {
                targetX = this.ball.x;
                targetZ = this.ball.z;
            } else if (hasBall) {
                // AI Ball Handler attacks hoop or looks for open jumper / pass
                var distHoop = Math.hypot(attackHoopX - p.x, -p.z);
                targetX = attackHoopX - offDir * (p.data.attrs.threePt >= 82 ? 6.8 : 2.1);
                targetZ = Math.sin(this.elapsed * 0.9 + p.slotIdx) * 3.8;
                if (this.aiDecisionCooldown <= 0 && distHoop < 9.0) {
                    this.aiDecisionCooldown = 0.7 + Math.random() * 0.65;
                    var def = this.getNearestOpponent(p);
                    var defDist = def ? Math.hypot(def.x - p.x, def.z - p.z) : 5;
                    if ((distHoop < 2.5 || defDist > 2.2 || this.shotClockSec < 4.5) && Math.random() < 0.62) {
                        var aiErr = (Math.random() - 0.5) * (this.settings.game.difficulty === 'Hall of Fame' ? 0.08 : 0.19);
                        this.fireBasketballShot(p, aiErr);
                    } else if (Math.random() < 0.42) {
                        this.executeSmartPass(p, 'chest');
                    }
                }
            } else if (isOff) {
                var spot = spacingSpots[p.slotIdx % spacingSpots.length];
                var cutWave = this.otfc.activePlay === 'Motion Cuts' ? Math.sin(this.elapsed * 1.6 + p.slotIdx) * 1.9 : 0;
                targetX = spot[0] + cutWave * offDir * 0.4;
                targetZ = spot[1] + cutWave * 0.5;
            } else {
                // Defender tracks matchup or zone spot
                var match = offTeam[p.slotIdx % Math.max(1, offTeam.length)];
                if (this.otfc.defenseSet === '2-3 Zone' && p.side === this.config.userSide) {
                    var zoneSpots = [
                        [
                            attackHoopX - offDir * 5.8,
                            -2.5
                        ],
                        [
                            attackHoopX - offDir * 5.8,
                            2.5
                        ],
                        [
                            attackHoopX - offDir * 2.4,
                            -4.4
                        ],
                        [
                            attackHoopX - offDir * 2.4,
                            4.4
                        ],
                        [
                            attackHoopX - offDir * 2.2,
                            0
                        ]
                    ];
                    var zs = zoneSpots[p.slotIdx % zoneSpots.length];
                    targetX = zs[0];
                    targetZ = zs[1];
                } else if (match) {
                    var tight = match.data.id === this.ball.holderId ? 0.16 : 0.28;
                    targetX = _three.MathUtils.lerp(match.x, attackHoopX, tight);
                    targetZ = _three.MathUtils.lerp(match.z, 0, tight * 0.5);
                }
            }
            var dx = targetX - p.x;
            var dz = targetZ - p.z;
            var dist = Math.hypot(dx, dz);
            if (dist > 0.25) {
                p.vx = _three.MathUtils.lerp(p.vx, dx / dist * moveSpeed, Math.min(1, dt * 8));
                p.vz = _three.MathUtils.lerp(p.vz, dz / dist * moveSpeed, Math.min(1, dt * 8));
            } else {
                p.vx *= 0.8;
                p.vz *= 0.8;
            }
            p.x = _three.MathUtils.clamp(p.x + p.vx * dt, -_arenaBuilder.COURT_LENGTH / 2 + 0.4, _arenaBuilder.COURT_LENGTH / 2 - 0.4);
            p.z = _three.MathUtils.clamp(p.z + p.vz * dt, -_arenaBuilder.COURT_WIDTH / 2 + 0.4, _arenaBuilder.COURT_WIDTH / 2 - 0.4);
            if (p.poseTimer <= 0) {
                if (hasBall) p.pose = 'dribble';
                else if (!isOff && dist < 1.8) p.pose = 'intense_d';
                else p.pose = Math.hypot(p.vx, p.vz) > 0.55 ? 'run' : 'idle';
            }
            p.rotY = isOff ? Math.atan2(attackHoopX - p.x, -p.z) : Math.atan2(this.ball.x - p.x, this.ball.z - p.z);
        }
        // Keep unused ref quiet
        void defTeam;
    };
    _proto.updateBall = function updateBall(dt) {
        var b = this.ball;
        if (b.state === 'held') {
            var holder = this.players.find(function(p) {
                return p.data.id === b.holderId;
            });
            if (holder) {
                b.dribblePhase += dt * (Math.hypot(holder.vx, holder.vz) > 1 ? 11.5 : 8.0);
                var bounce = holder.pose === 'jumpshot' || holder.pose === 'dunk' ? 2.15 + holder.y : 0.14 + Math.abs(Math.sin(b.dribblePhase)) * 0.88;
                var sideOffX = Math.cos(holder.rotY) * 0.34 + Math.sin(holder.rotY) * 0.32;
                var sideOffZ = -Math.sin(holder.rotY) * 0.34 + Math.cos(holder.rotY) * 0.32;
                b.x = holder.x + sideOffX;
                b.y = bounce;
                b.z = holder.z + sideOffZ;
            }
        } else if (b.state === 'pass') {
            var target = this.players.find(function(p) {
                return p.data.id === b.passTargetId;
            });
            if (!target) {
                b.state = 'loose';
            } else {
                var dx = target.x - b.x;
                var dz = target.z - b.z;
                var dist = Math.hypot(dx, dz);
                var passSpeed = 17.5;
                if (dist < 0.65) {
                    b.state = 'held';
                    b.holderId = target.data.id;
                    b.passTargetId = null;
                    target.catchTimer = 1.05; // Catch & Shoot 1s window!
                    if (!this.config.playerLockId && target.side === this.config.userSide) {
                        this.controlledId = target.data.id;
                    }
                } else {
                    b.x += dx / dist * passSpeed * dt;
                    b.z += dz / dist * passSpeed * dt;
                    b.y = _three.MathUtils.lerp(b.y, 1.35, dt * 8);
                }
            }
        } else if (b.state === 'shot') {
            b.shotProgress += dt / b.shotDuration;
            var t = Math.min(1, b.shotProgress);
            b.x = _three.MathUtils.lerp(b.shotStart.x, b.shotEnd.x, t);
            b.z = _three.MathUtils.lerp(b.shotStart.z, b.shotEnd.z, t);
            var linearY = _three.MathUtils.lerp(b.shotStart.y, b.shotEnd.y, t);
            var arcBoost = Math.sin(t * Math.PI) * (b.shotPeakY - Math.max(b.shotStart.y, b.shotEnd.y));
            b.y = linearY + arcBoost;
            if (b.shotProgress >= 1) {
                this.onShotReachedRim();
            }
        } else if (b.state === 'loose') {
            b.vy -= 12.8 * dt;
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.z += b.vz * dt;
            if (b.y <= 0.13) {
                b.y = 0.13;
                b.vy = Math.abs(b.vy) * 0.62;
                b.vx *= 0.82;
                b.vz *= 0.82;
                if (b.vy > 0.6) _Nba2k14Audio.Nba2k14Audio.playDribble();
            }
            b.x = _three.MathUtils.clamp(b.x, -_arenaBuilder.COURT_LENGTH / 2 + 0.5, _arenaBuilder.COURT_LENGTH / 2 - 0.5);
            b.z = _three.MathUtils.clamp(b.z, -_arenaBuilder.COURT_WIDTH / 2 + 0.5, _arenaBuilder.COURT_WIDTH / 2 - 0.5);
            // Rebound Battle
            if (b.y < 2.25) {
                var winner = null;
                var bestScore = -Infinity;
                for(var _iterator = _create_for_of_iterator_helper_loose(this.players), _step; !(_step = _iterator()).done;){
                    var p = _step.value;
                    var dist1 = Math.hypot(p.x - b.x, p.z - b.z);
                    if (dist1 < 1.55) {
                        var isOff = p.side === b.lastTouchedSide;
                        var score = (0, _signatureSkills.computeReboundScore)(p.data, isOff, dist1);
                        if (score > bestScore) {
                            bestScore = score;
                            winner = p;
                        }
                    }
                }
                if (winner) {
                    winner.stats.reb += 1;
                    var isOffReb = winner.side === this.possession;
                    b.state = 'held';
                    b.holderId = winner.data.id;
                    this.possession = winner.side;
                    this.shotClockSec = isOffReb ? 14 : 24;
                    if (!this.config.playerLockId && winner.side === this.config.userSide) {
                        this.controlledId = winner.data.id;
                    }
                    if (winner.data.id === this.controlledId) {
                        this.adjustTeammateGrade(0.28, isOffReb ? '+Offensive Rebound' : '+Defensive Rebound');
                    }
                    if ((0, _signatureSkills.getSkillLevel)(winner.data.signatureSkills, 'tenacious_rebounder') > 0) {
                        this.showSigSkillPopup('tenacious_rebounder', (0, _signatureSkills.getSkillLevel)(winner.data.signatureSkills, 'tenacious_rebounder'), winner.data.name);
                    }
                }
            }
        }
        b.mesh.position.set(b.x, b.y, b.z);
        b.mesh.rotation.x += dt * 7;
        b.mesh.rotation.z += dt * 3;
    };
    _proto.onShotReachedRim = function onShotReachedRim() {
        var b = this.ball;
        var shooter = this.players.find(function(p) {
            return p.data.id === b.shooterId;
        });
        var isChainNet = this.config.courtEnv === 'blacktop' || this.config.courtEnv === 'park';
        if (shooter) {
            shooter.stats.fga += 1;
            if (b.shotPoints === 3) shooter.stats.tpa += 1;
            if (shooter.side === this.config.userSide) {
                this.userShotLog.push({
                    zone: b.shotZone,
                    made: b.shotWillMake,
                    pts: b.shotPoints,
                    excellent: b.shotExcellent,
                    fastbreak: b.shotFastbreak,
                    paint: b.shotPaint
                });
            }
        }
        // 3-Point Shootout Advance Logic
        if (this.config.mode === 'shootout3pt') {
            var isMoney = this.shootoutBallInRack === 4;
            if (b.shotWillMake) {
                var add = isMoney ? 2 : 1;
                this.shootoutScore += add;
                this.homeScore = this.shootoutScore;
                this.arena.triggerSwish('away', false);
                _Nba2k14Audio.Nba2k14Audio.playSwish(false);
                _Nba2k14Audio.Nba2k14Audio.playCrowdCheer(isMoney ? 0.9 : 0.45);
                this.commentary = isMoney ? "MONEY BALL! +2! Total: " + this.shootoutScore : "Swish! Total: " + this.shootoutScore;
            } else {
                _Nba2k14Audio.Nba2k14Audio.playRimClank();
            }
            this.shootoutBallInRack += 1;
            if (this.shootoutBallInRack >= 5) {
                this.shootoutBallInRack = 0;
                this.shootoutRack += 1;
            }
            if (this.shootoutRack >= 5) {
                this.awayScore = 18;
                this.finalizeMatch();
                return;
            }
            var p = this.players[0];
            var _THREE_PT_RACK_POSITIONS_this_shootoutRack = THREE_PT_RACK_POSITIONS[this.shootoutRack], rx = _THREE_PT_RACK_POSITIONS_this_shootoutRack[0], rz = _THREE_PT_RACK_POSITIONS_this_shootoutRack[1];
            p.x = rx;
            p.z = rz;
            p.rotY = Math.atan2(_arenaBuilder.HOOP_X - rx, -rz);
            b.state = 'held';
            b.holderId = p.data.id;
            return;
        }
        if (b.shotWillMake) {
            this.arena.triggerSwish(b.shotTargetSide, b.shotIsDunk);
            if (b.shotIsDunk) {
                _Nba2k14Audio.Nba2k14Audio.playDunkBoom();
                if (this.settings.camera.dunkShake) this.cameraShake = 0.48;
            } else {
                _Nba2k14Audio.Nba2k14Audio.playSwish(isChainNet);
                if (b.shotPoints === 3) {
                    _Nba2k14Audio.Nba2k14Audio.playArenaOrgan('three');
                    _Nba2k14Audio.Nba2k14Audio.playCrowdCheer(0.85);
                } else {
                    _Nba2k14Audio.Nba2k14Audio.playCrowdCheer(0.45);
                }
            }
            this.crowdExcitement = Math.min(1, this.crowdExcitement + (b.shotIsDunk || b.shotPoints === 3 ? 0.55 : 0.25));
            if (shooter) {
                shooter.stats.fgm += 1;
                if (b.shotPoints === 3) shooter.stats.tpm += 1;
                shooter.stats.pts += b.shotPoints;
                shooter.streak = Math.max(1, shooter.streak + 1);
                shooter.stats.streak = shooter.streak;
                if (shooter.catchTimer > 0 && shooter.lastPasserSkills) {
                    // Credit assist to previous teammate
                    var teammates = this.players.filter(function(pl) {
                        return pl.side === shooter.side && pl.data.id !== shooter.data.id;
                    });
                    if (teammates[0]) teammates[0].stats.ast += 1;
                }
                var hot = shooter.streak >= (0, _signatureSkills.getHotThreshold)(shooter.data);
                this.commentary = b.shotIsDunk ? "THUNDEROUS SLAM BY " + shooter.data.name.toUpperCase() + "!" : b.shotPoints === 3 ? shooter.data.name + " FROM DOWNTOWN — BANG!" + (hot ? ' HE IS ON FIRE!' : '') : "" + shooter.data.name + " knocks it down for two!";
                if (shooter.data.id === this.controlledId) {
                    this.adjustTeammateGrade(b.shotPoints === 3 ? 0.34 : 0.26, b.shotIsDunk ? '+Highlight Dunk' : '+Score');
                }
                this.addScore(shooter.side, b.shotPoints);
            }
            if (!this.finished) {
                if (this.config.mode === 'training') {
                    this.resetHalfCourtPossession(this.config.userSide);
                } else {
                    var nextOff = (shooter == null ? void 0 : shooter.side) === 'home' ? 'away' : 'home';
                    this.resetHalfCourtPossession(nextOff);
                }
            }
        } else {
            var _ref;
            _Nba2k14Audio.Nba2k14Audio.playRimClank();
            if (shooter) {
                if ((0, _signatureSkills.canGoCold)(shooter.data)) shooter.streak = Math.min(-1, shooter.streak - 1);
                else shooter.streak = Math.max(0, shooter.streak - 1);
                shooter.stats.streak = shooter.streak;
            }
            b.state = 'loose';
            b.lastTouchedSide = (_ref = shooter == null ? void 0 : shooter.side) != null ? _ref : 'home';
            var bounceDir = b.shotTargetSide === 'away' ? -1 : 1;
            b.vx = bounceDir * (2.0 + Math.random() * 2.2);
            b.vy = 3.1 + Math.random() * 1.4;
            b.vz = (Math.random() - 0.5) * 4.2;
        }
    };
    _proto.syncRigTransforms = function syncRigTransforms(dt) {
        var _this = this;
        var ballHolder = this.players.find(function(p) {
            return p.data.id === _this.ball.holderId;
        });
        var primaryDefender = ballHolder ? this.getNearestOpponent(ballHolder) : null;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.players), _step; !(_step = _iterator()).done;){
            var p = _step.value;
            if (p.poseTimer > 0) p.poseTimer = Math.max(0, p.poseTimer - dt);
            if (p.stumbleTimer > 0) p.stumbleTimer = Math.max(0, p.stumbleTimer - dt);
            if (p.catchTimer > 0) p.catchTimer = Math.max(0, p.catchTimer - dt);
            if (p.usedScreenTimer > 0) p.usedScreenTimer = Math.max(0, p.usedScreenTimer - dt);
            if (p.screenerPopTimer > 0) p.screenerPopTimer = Math.max(0, p.screenerPopTimer - dt);
            if (p.isoResetTimer > 0) {
                p.isoResetTimer -= dt;
                if (p.isoResetTimer <= 0) p.isoChain = 0;
            }
            if (p.y > 0 || p.jumpVelY !== 0) {
                p.y += p.jumpVelY * dt;
                p.jumpVelY -= 14.5 * dt;
                if (p.y <= 0) {
                    p.y = 0;
                    p.jumpVelY = 0;
                }
            }
            p.rig.root.position.set(p.x, 0, p.z);
            p.rig.bodyGroup.rotation.y = p.rotY;
            (0, _playerRig.animatePlayerRig)(p.rig, p.pose, this.elapsed, Math.hypot(p.vx, p.vz) / 6.5, p.y);
            var isCtrl = p.data.id === this.controlledId;
            var isPrimDef = (primaryDefender == null ? void 0 : primaryDefender.data.id) === p.data.id;
            var showRing = this.settings.presentation.playerIndicatorStyle !== 'Name + Number';
            var matchupAngle = null;
            if (isCtrl && this.possession !== p.side) {
                var opp = this.getNearestOpponent(p);
                if (opp) matchupAngle = Math.atan2(opp.x - p.x, opp.z - p.z);
            }
            (0, _playerRig.updatePlayerFloorRing)(p.rig, {
                visible: showRing && (isCtrl || isPrimDef),
                isControlled: isCtrl,
                isPrimaryDefender: isPrimDef,
                stamina: p.stamina,
                streak: p.streak,
                showShotMeter: isCtrl && this.isChargingShot && this.settings.controller.shotMeterDisplay === 'On (Floor Ring)',
                shotFill: this.shotChargeTime / this.shotReleaseDuration,
                matchupAngle: matchupAngle,
                teamColor: p.side === 'home' ? this.homeTeam.primaryColor : this.awayTeam.primaryColor
            });
        }
    };
    _proto.updateCamera = function updateCamera(dt) {
        var _ref;
        var _this_players_;
        var camCfg = this.settings.camera;
        var zoomScale = 1.35 - camCfg.zoom * 0.06;
        var heightBoost = (camCfg.height - 5) * 0.65;
        var focusX = this.config.mode === 'shootout3pt' || this.config.mode === 'dunkcontest' ? ((_ref = (_this_players_ = this.players[0]) == null ? void 0 : _this_players_.x) != null ? _ref : 4) * 0.65 + _arenaBuilder.HOOP_X * 0.35 : this.ball.x * 0.72;
        var focusZ = this.ball.z * 0.55;
        var desiredPos = new _three.Vector3();
        var desiredLook = new _three.Vector3(focusX, 1.7, focusZ);
        if (camCfg.angle === 'Broadcast' || camCfg.angle === 'Nosebleeds') {
            var dist = (camCfg.angle === 'Nosebleeds' ? 23 : 16.5) * zoomScale;
            desiredPos.set(focusX * 0.65, (camCfg.angle === 'Nosebleeds' ? 14 : 9.4) + heightBoost, dist);
        } else if (camCfg.angle === 'Player Lock') {
            var _ref1, _ref2;
            var ctrl = this.getControlledPlayer();
            var dir = this.getAttackDir(this.possession);
            var px = (_ref1 = ctrl == null ? void 0 : ctrl.x) != null ? _ref1 : focusX;
            var pz = (_ref2 = ctrl == null ? void 0 : ctrl.z) != null ? _ref2 : focusZ;
            desiredPos.set(px - dir * 8.2 * zoomScale, 5.2 + heightBoost, pz * 0.75);
            desiredLook.set(px + dir * 4.5, 1.8, pz * 0.5);
        } else {
            // Iconic NBA 2K Vertical North-South Camera (2K / Turbo / Drive)
            var dir1 = camCfg.autoFlip ? this.getAttackDir(this.possession) : this.getAttackDir(this.config.userSide);
            var baseDist = camCfg.angle === 'Drive' ? 10.5 : camCfg.angle === 'Turbo' ? 12.2 : 14.2;
            desiredPos.set(focusX - dir1 * baseDist * zoomScale, 9.6 + heightBoost, focusZ * 0.55);
            desiredLook.set(focusX + dir1 * 4.2, 1.65, focusZ * 0.45);
        }
        if (this.cameraShake > 0) {
            desiredPos.x += (Math.random() - 0.5) * this.cameraShake * 0.65;
            desiredPos.y += (Math.random() - 0.5) * this.cameraShake * 0.65;
        }
        this.curCamPos.lerp(desiredPos, Math.min(1, dt * 5.2));
        this.curCamLook.lerp(desiredLook, Math.min(1, dt * 6.5));
        this.camera.position.copy(this.curCamPos);
        this.camera.lookAt(this.curCamLook);
    };
    // ==================== 10-SECOND 3D INSTANT REPLAY ====================
    _proto.recordReplayFrame = function recordReplayFrame(dt) {
        this.replaySampleAccum += dt;
        if (this.replaySampleAccum < 1 / 30) return;
        this.replaySampleAccum = 0;
        this.replayBuffer.push({
            t: this.elapsed,
            ballX: this.ball.x,
            ballY: this.ball.y,
            ballZ: this.ball.z,
            players: this.players.map(function(p) {
                return {
                    id: p.data.id,
                    x: p.x,
                    y: p.y,
                    z: p.z,
                    rotY: p.rotY,
                    pose: p.pose
                };
            })
        });
        if (this.replayBuffer.length > 300) {
            this.replayBuffer.shift();
        }
    };
    _proto.updateReplayView = function updateReplayView(dt) {
        var _this, _loop = function() {
            var pf = _step.value;
            var sp = _this.players.find(function(p) {
                return p.data.id === pf.id;
            });
            if (sp) {
                sp.rig.root.position.set(pf.x, 0, pf.z);
                sp.rig.bodyGroup.rotation.y = pf.rotY;
                (0, _playerRig.animatePlayerRig)(sp.rig, pf.pose, frame.t, 0.5, pf.y);
            }
        };
        var _this_replayBuffer_Math_floor;
        if (this.replayBuffer.length === 0) return;
        if (this.replayPlaying) {
            this.replayIndex += dt * 30 * this.replaySpeed;
            if (this.replayIndex >= this.replayBuffer.length - 1) {
                this.replayIndex = 0;
            }
        }
        var frame = (_this_replayBuffer_Math_floor = this.replayBuffer[Math.floor(this.replayIndex)]) != null ? _this_replayBuffer_Math_floor : this.replayBuffer[0];
        this.ball.mesh.position.set(frame.ballX, frame.ballY, frame.ballZ);
        for(var _iterator = _create_for_of_iterator_helper_loose(frame.players), _step; !(_step = _iterator()).done;)_this = this, _loop();
        // Free-orbit 3D replay camera centered on the ball
        this.camera.position.set(frame.ballX + Math.cos(this.replayOrbitAngle) * this.replayOrbitDist, this.replayOrbitHeight, frame.ballZ + Math.sin(this.replayOrbitAngle) * this.replayOrbitDist);
        this.camera.lookAt(frame.ballX, 1.75, frame.ballZ);
    };
    // ==================== FINALIZE & HUD SNAPSHOT ====================
    _proto.finalizeMatch = function finalizeMatch() {
        var _sort_;
        if (this.finished) return;
        this.finished = true;
        var userScore = this.config.userSide === 'home' ? this.homeScore : this.awayScore;
        var oppScore = this.config.userSide === 'home' ? this.awayScore : this.homeScore;
        var userWon = userScore >= oppScore;
        var box = this.players.map(function(p) {
            return _extends({}, p.stats);
        });
        var pog = (_sort_ = [].concat(box).sort(function(a, b) {
            return b.pts + b.reb * 1.2 + b.ast * 1.5 - (a.pts + a.reb * 1.2 + a.ast * 1.5);
        })[0]) != null ? _sort_ : box[0];
        var diffMult = this.settings.game.difficulty === 'Hall of Fame' ? 1.75 : this.settings.game.difficulty === 'Superstar' ? 1.45 : this.settings.game.difficulty === 'All-Star' ? 1.2 : 1.0;
        var grade = GRADE_STEPS[this.teammateGradeIdx];
        var vcEarned = Math.round(((userWon ? 450 : 220) + userScore * 8 + this.teammateGradeIdx * 28) * diffMult);
        var spEarned = Math.round(((userWon ? 350 : 180) + userScore * 6 + this.teammateGradeIdx * 25) * diffMult);
        var mtEarned = this.config.mode === 'myteam' ? Math.round((userWon ? 750 : 300) + userScore * 12) : 150;
        var repEarned = this.config.mode === 'park' ? userWon ? 320 : 120 : 0;
        this.emitHud();
        this.onMatchComplete({
            config: this.config,
            homeScore: this.homeScore,
            awayScore: this.awayScore,
            userWon: userWon,
            quarterScoresHome: [].concat(this.quarterScoresHome),
            quarterScoresAway: [].concat(this.quarterScoresAway),
            boxScore: box,
            playerOfGame: pog,
            teammateGrade: grade,
            vcEarned: vcEarned,
            spEarned: spEarned,
            mtEarned: mtEarned,
            repEarned: repEarned,
            userShotLog: [].concat(this.userShotLog),
            newAchievements: [],
            shootoutScore: this.config.mode === 'shootout3pt' ? this.shootoutScore : undefined,
            dunkContestScore: this.config.mode === 'dunkcontest' ? this.dunkTotalScore : undefined
        });
    };
    _proto.emitHud = function emitHud() {
        var _this = this;
        var _this_players_find, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
        var _this_players_find1, _DUNK_CONTEST_MOVES_find;
        var ctrl = this.getControlledPlayer();
        var lockPlayer = this.config.playerLockId ? (_this_players_find = this.players.find(function(p) {
            return p.data.id === _this.config.playerLockId;
        })) != null ? _this_players_find : ctrl : ctrl;
        // Project teammate screen coordinates for Icon Passing overlay
        var iconTargets = [];
        if (this.iconPassActive && ctrl) {
            var mates = this.players.filter(function(p) {
                return p.side === ctrl.side;
            });
            var projVec = new _three.Vector3();
            var w = this.container.clientWidth || 1280;
            var h = this.container.clientHeight || 720;
            mates.forEach(function(m, idx) {
                projVec.set(m.x, 2.35, m.z).project(_this.camera);
                iconTargets.push({
                    key: String(idx + 1),
                    name: m.data.name,
                    pos: m.data.pos,
                    screenX: (projVec.x * 0.5 + 0.5) * w,
                    screenY: (-projVec.y * 0.5 + 0.5) * h
                });
            });
        }
        var activeDrill = _modesData.TRAINING_DRILLS.find(function(d) {
            return d.id === _this.config.trainingDrillId;
        });
        this.onHudUpdate({
            homeCode: this.homeTeam.code,
            awayCode: this.awayTeam.code,
            homeColor: this.homeTeam.primaryColor,
            awayColor: this.awayTeam.primaryColor,
            homeScore: this.homeScore,
            awayScore: this.awayScore,
            homeTimeouts: this.homeTimeouts,
            awayTimeouts: this.awayTimeouts,
            homeFoulsQ: this.homeFoulsQ,
            awayFoulsQ: this.awayFoulsQ,
            quarter: this.quarter,
            quarterScoresHome: [].concat(this.quarterScoresHome),
            quarterScoresAway: [].concat(this.quarterScoresAway),
            gameClockSec: this.gameClockSec,
            shotClockSec: this.shotClockSec,
            possession: this.possession,
            controlledPlayerName: (_ref = ctrl == null ? void 0 : ctrl.data.name) != null ? _ref : 'Player',
            controlledPlayerPos: (_ref1 = ctrl == null ? void 0 : ctrl.data.pos) != null ? _ref1 : 'SF',
            controlledPlayerJersey: (_ref2 = ctrl == null ? void 0 : ctrl.data.jersey) != null ? _ref2 : 6,
            controlledPlayerStamina: (_ref3 = ctrl == null ? void 0 : ctrl.stamina) != null ? _ref3 : 100,
            controlledPlayerStreak: (_ref4 = ctrl == null ? void 0 : ctrl.streak) != null ? _ref4 : 0,
            controlledPlayerSkills: (_ref5 = ctrl == null ? void 0 : ctrl.data.signatureSkills) != null ? _ref5 : [],
            shotMeterActive: this.isChargingShot && this.settings.controller.shotMeterDisplay !== 'Off (No-Meter Green Boost)',
            shotMeterFill: Math.min(1.15, this.shotChargeTime / this.shotReleaseDuration),
            shotMeterSweetSpot: 0.82,
            freeThrowActive: this.freeThrowActive,
            freeThrowShooterName: (_ref6 = (_this_players_find1 = this.players.find(function(p) {
                return p.data.id === _this.freeThrowShooterId;
            })) == null ? void 0 : _this_players_find1.data.name) != null ? _ref6 : '',
            freeThrowRemaining: this.freeThrowRemaining,
            freeThrowPos: this.freeThrowPos,
            iconPassActive: this.iconPassActive,
            iconTargets: iconTargets,
            shotFeedback: this.shotFeedback,
            sigPopup: this.sigPopup,
            commentary: this.commentary,
            paBanner: this.paBanner,
            teammateGrade: GRADE_STEPS[this.teammateGradeIdx],
            teammateGradeFill: this.teammateGradeFill,
            gradeEvents: this.gradeEvents,
            playerLockStats: lockPlayer ? _extends({}, lockPlayer.stats) : null,
            otfc: _extends({}, this.otfc),
            fps: this.fps,
            paused: this.paused,
            replayMode: this.replayMode,
            replayIndex: Math.floor(this.replayIndex),
            replayLength: this.replayBuffer.length,
            replayPlaying: this.replayPlaying,
            replaySpeed: this.replaySpeed,
            shootoutState: this.config.mode === 'shootout3pt' ? {
                rackIndex: this.shootoutRack,
                ballInRack: this.shootoutBallInRack,
                score: this.shootoutScore,
                timeLeft: this.shootoutTime,
                isMoneyBall: this.shootoutBallInRack === 4,
                ballsRemaining: Math.max(0, 25 - (this.shootoutRack * 5 + this.shootoutBallInRack))
            } : undefined,
            dunkContestState: this.config.mode === 'dunkcontest' ? {
                round: this.dunkRound,
                attempt: this.dunkAttempt,
                selectedDunk: (_ref7 = (_DUNK_CONTEST_MOVES_find = _modesData.DUNK_CONTEST_MOVES.find(function(m) {
                    return m.id === _this.dunkMoveId;
                })) == null ? void 0 : _DUNK_CONTEST_MOVES_find.name) != null ? _ref7 : '',
                totalScore: this.dunkTotalScore,
                lastJudgeScores: this.dunkJudgeScores,
                phase: this.dunkPhase
            } : undefined,
            trainingState: this.config.mode === 'training' && activeDrill ? {
                drillTitle: activeDrill.title,
                instruction: activeDrill.instruction,
                completedReps: this.trainingReps,
                targetReps: activeDrill.targetReps
            } : undefined,
            finished: this.finished,
            boxScore: this.players.map(function(p) {
                return _extends({}, p.stats);
            }),
            userShotLog: [].concat(this.userShotLog)
        });
    };
    _proto.dispose = function dispose() {
        var _this_envTex;
        this.disposed = true;
        cancelAnimationFrame(this.rafId);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('pointermove', this.handlePointerMove);
        window.removeEventListener('pointerup', this.handlePointerUp);
        this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);
        this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost);
        this.resizeObserver.disconnect();
        this.players.forEach(function(p) {
            return p.rig.dispose();
        });
        this.arena.dispose();
        (_this_envTex = this.envTex) == null ? void 0 : _this_envTex.dispose();
        this.ball.mesh.geometry.dispose();
        this.ball.mesh.material.dispose();
        this.renderer.dispose();
    };
    return Nba2k14Engine;
}();

});
// === MODULE: src/games/hoops-2k26/nba2k14/engine/SpotlightStage ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/engine/SpotlightStage", function(require, module, exports) {
// ============================================================================
// NBA 2K14 — Persistent 3D Arena Spotlight Stage (Title Screen & Main Menu)
// Renders #6 LeBron James (or active MyPLAYER) under dramatic arena god-rays,
// crimson/gold ember particles, and glossy hardwood with tab-reactive camera.
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SpotlightStageController", {
    enumerable: true,
    get: function() {
        return SpotlightStageController;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _RoomEnvironment = require("three/examples/jsm/environments/RoomEnvironment.js");
var _playerRig = require("./playerRig");
function _construct(Parent, args, Class) {
    if (_is_native_reflect_construct()) _construct = Reflect.construct;
    else {
        _construct = function construct(Parent, args, Class) {
            var a = [
                null
            ];
            a.push.apply(a, args);
            var Constructor = Function.bind.apply(Parent, a);
            var instance = new Constructor();
            if (Class) _set_prototype_of(instance, Class.prototype);
            return instance;
        };
    }
    return _construct.apply(null, arguments);
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
function _is_native_reflect_construct() {
    try {
        var result = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
    } catch (_) {}
    return (_is_native_reflect_construct = function() {
        return !!result;
    })();
}
function _set_prototype_of(o, p) {
    _set_prototype_of = Object.setPrototypeOf || function setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return _set_prototype_of(o, p);
}
var CAMERA_PRESETS = {
    title: {
        pos: [
            0.3,
            1.75,
            4.6
        ],
        look: [
            0,
            1.32,
            0
        ]
    },
    main: {
        pos: [
            2.3,
            2.05,
            5.2
        ],
        look: [
            -0.2,
            1.25,
            0
        ]
    },
    quick: {
        pos: [
            -2.8,
            2.1,
            4.9
        ],
        look: [
            0.2,
            1.2,
            0
        ]
    },
    path: {
        pos: [
            0.9,
            1.45,
            3.65
        ],
        look: [
            0,
            1.42,
            0
        ]
    },
    mycareer: {
        pos: [
            -1.7,
            1.65,
            3.9
        ],
        look: [
            0,
            1.32,
            0
        ]
    },
    park: {
        pos: [
            3.6,
            2.8,
            5.8
        ],
        look: [
            0,
            1.1,
            0
        ]
    },
    modes: {
        pos: [
            2.8,
            2.2,
            4.6
        ],
        look: [
            0,
            1.2,
            0
        ]
    },
    features: {
        pos: [
            -2.4,
            1.9,
            4.4
        ],
        look: [
            0,
            1.3,
            0
        ]
    },
    options: {
        pos: [
            0.1,
            2.6,
            5.6
        ],
        look: [
            0,
            1.1,
            0
        ]
    }
};
var SpotlightStageController = /*#__PURE__*/ function() {
    "use strict";
    function SpotlightStageController(container, player, team) {
        var _this = this;
        this.rig = null;
        this.rafId = 0;
        this.disposed = false;
        this.isSoftwareGl = false;
        this.targetPreset = 'title';
        this.curCamPos = new _three.Vector3(0.3, 1.75, 4.6);
        this.curLookAt = new _three.Vector3(0, 1.32, 0);
        this.startTime = performance.now();
        this.envTex = null;
        this.disposables = [];
        this.resizeObserver = null;
        this.loop = function() {
            if (_this.disposed) return;
            var elapsed = (performance.now() - _this.startTime) * 0.001;
            // Smooth camera transition + gentle breathing orbit
            var preset = CAMERA_PRESETS[_this.targetPreset];
            var desiredPos = new _three.Vector3(preset.pos[0] + Math.sin(elapsed * 0.35) * 0.25, preset.pos[1] + Math.cos(elapsed * 0.4) * 0.08, preset.pos[2]);
            var desiredLook = _construct(_three.Vector3, [].concat(preset.look));
            _this.curCamPos.lerp(desiredPos, 0.05);
            _this.curLookAt.lerp(desiredLook, 0.06);
            _this.camera.position.copy(_this.curCamPos);
            _this.camera.lookAt(_this.curLookAt);
            // Animate featured star warm-up dribble -> crossover -> jumper cycle
            if (_this.rig) {
                var cycle = elapsed % 9;
                if (cycle < 5.5) {
                    (0, _playerRig.animatePlayerRig)(_this.rig, 'dribble', elapsed, 0.15, 0);
                    _this.rig.root.rotation.y = Math.sin(elapsed * 0.5) * 0.22;
                    var bounceY = Math.abs(Math.sin(elapsed * 6.0)) * 0.88 + 0.125;
                    _this.ballMesh.position.set(0.36, bounceY, 0.28);
                } else if (cycle < 7.2) {
                    (0, _playerRig.animatePlayerRig)(_this.rig, 'crossover', elapsed, 0.4, 0);
                    _this.rig.root.rotation.y = Math.sin(elapsed * 3) * 0.35;
                    _this.ballMesh.position.set(Math.sin(elapsed * 8) * 0.35, 0.45 + Math.abs(Math.cos(elapsed * 8)) * 0.35, 0.34);
                } else {
                    var jumpT = (cycle - 7.2) / 1.8;
                    var air = Math.sin(jumpT * Math.PI) * 0.52;
                    (0, _playerRig.animatePlayerRig)(_this.rig, 'jumpshot', elapsed, 0, air);
                    _this.ballMesh.position.set(0.08, 2.08 + air + jumpT * 0.7, 0.24 + jumpT * 0.6);
                }
                _this.ballMesh.rotation.x += 0.08;
            }
            // Float embers gently upward
            var posAttr = _this.embers.geometry.getAttribute('position');
            for(var i = 0; i < posAttr.count; i++){
                var y = posAttr.getY(i) + 0.008;
                if (y > 5.2) y = 0.05;
                posAttr.setY(i, y);
            }
            posAttr.needsUpdate = true;
            _this.renderer.render(_this.scene, _this.camera);
            if (_this.isSoftwareGl) {
                setTimeout(function() {
                    if (!_this.disposed) _this.rafId = requestAnimationFrame(_this.loop);
                }, 34);
            } else {
                _this.rafId = requestAnimationFrame(_this.loop);
            }
        };
        this.container = container;
        this.renderer = new _three.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        var gl = this.renderer.getContext();
        var rendererStr = String(gl.getParameter(gl.RENDERER) || '');
        this.isSoftwareGl = /SwiftShader|llvmpipe|Software|Basic Render Driver/i.test(rendererStr);
        this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.outputColorSpace = _three.SRGBColorSpace;
        this.renderer.toneMapping = _three.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.renderer.shadowMap.enabled = !this.isSoftwareGl;
        this.renderer.shadowMap.type = _three.PCFSoftShadowMap;
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.display = 'block';
        container.innerHTML = '';
        container.appendChild(this.renderer.domElement);
        this.scene = new _three.Scene();
        this.scene.background = new _three.Color('#090a0d');
        this.scene.fog = new _three.FogExp2('#090a0d', 0.055);
        var pmrem = new _three.PMREMGenerator(this.renderer);
        this.envTex = pmrem.fromScene(new _RoomEnvironment.RoomEnvironment(), 0.04).texture;
        this.scene.environment = this.envTex;
        pmrem.dispose();
        var w = Math.max(320, container.clientWidth);
        var h = Math.max(240, container.clientHeight);
        this.camera = new _three.PerspectiveCamera(44, w / h, 0.1, 100);
        this.renderer.setSize(w, h, false);
        // Dramatic NBA 2K14 Crimson/Gold Arena Spotlight Lighting
        var hemi = new _three.HemisphereLight('#ffd5b0', '#16090e', 0.55);
        this.scene.add(hemi);
        var overheadSpot = new _three.SpotLight('#fff1e0', 110, 26, Math.PI / 4.2, 0.65, 1.7);
        overheadSpot.position.set(0.4, 9.2, 1.2);
        overheadSpot.castShadow = !this.isSoftwareGl;
        this.scene.add(overheadSpot);
        var crimsonRim = new _three.PointLight('#ce1141', 38, 16);
        crimsonRim.position.set(-3.4, 2.8, -2.5);
        this.scene.add(crimsonRim);
        var goldRim = new _three.PointLight('#f9a01b', 28, 15);
        goldRim.position.set(3.2, 2.4, -2.2);
        this.scene.add(goldRim);
        // Volumetric-style Overhead God-Ray Cones (additive transparent geometry)
        var coneMat = this.track(new _three.MeshBasicMaterial({
            color: '#f9a01b',
            transparent: true,
            opacity: 0.055,
            depthWrite: false,
            blending: _three.AdditiveBlending,
            side: _three.DoubleSide
        }));
        [
            -1.4,
            0,
            1.4
        ].forEach(function(cx, i) {
            var cone = new _three.Mesh(_this.track(new _three.ConeGeometry(2.6, 9.5, 20, 1, true)), coneMat);
            cone.position.set(cx, 4.7, -0.8 + i * 0.25);
            cone.rotation.z = cx * 0.08;
            _this.scene.add(cone);
        });
        // Reflective Arena Hardwood Floor
        var floorCanvas = document.createElement('canvas');
        floorCanvas.width = 512;
        floorCanvas.height = 512;
        var fctx = floorCanvas.getContext('2d');
        fctx.fillStyle = '#5c3c20';
        fctx.fillRect(0, 0, 512, 512);
        for(var r = 0; r < 32; r++){
            fctx.fillStyle = r % 2 === 0 ? 'rgba(220,168,105,0.22)' : 'rgba(90,52,22,0.22)';
            fctx.fillRect(0, r * 16, 512, 15);
        }
        fctx.strokeStyle = 'rgba(206,17,65,0.75)';
        fctx.lineWidth = 6;
        fctx.beginPath();
        fctx.arc(256, 256, 175, 0, Math.PI * 2);
        fctx.stroke();
        var floorTex = this.track(new _three.CanvasTexture(floorCanvas));
        floorTex.colorSpace = _three.SRGBColorSpace;
        var floor = new _three.Mesh(this.track(new _three.CircleGeometry(18, 48)), this.track(new _three.MeshStandardMaterial({
            map: floorTex,
            roughness: 0.2,
            metalness: 0.16
        })));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        // Subtle Arena Tunnel Arch Backdrop
        var archMat = this.track(new _three.MeshStandardMaterial({
            color: '#14161c',
            roughness: 0.7,
            metalness: 0.4
        }));
        for(var i = 0; i < 4; i++){
            var arch = new _three.Mesh(this.track(new _three.TorusGeometry(4.6 + i * 0.9, 0.16, 8, 32, Math.PI)), archMat);
            arch.position.set(0, 0, -4.5 - i * 2.2);
            this.scene.add(arch);
        }
        // Basketball
        var ballMat = this.track(new _three.MeshStandardMaterial({
            color: '#d95b16',
            roughness: 0.46,
            metalness: 0.08
        }));
        this.ballMesh = new _three.Mesh(this.track(new _three.SphereGeometry(0.125, 16, 14)), ballMat);
        this.ballMesh.castShadow = true;
        this.scene.add(this.ballMesh);
        // Floating Crimson & Gold Embers
        var emberCount = this.isSoftwareGl ? 60 : 180;
        var positions = new Float32Array(emberCount * 3);
        var colors = new Float32Array(emberCount * 3);
        var cRed = new _three.Color('#ce1141');
        var cGold = new _three.Color('#f9a01b');
        for(var i1 = 0; i1 < emberCount; i1++){
            positions[i1 * 3] = (Math.random() - 0.5) * 11;
            positions[i1 * 3 + 1] = Math.random() * 5.2;
            positions[i1 * 3 + 2] = (Math.random() - 0.5) * 9;
            var c = i1 % 2 === 0 ? cRed : cGold;
            colors[i1 * 3] = c.r;
            colors[i1 * 3 + 1] = c.g;
            colors[i1 * 3 + 2] = c.b;
        }
        var emberGeo = this.track(new _three.BufferGeometry());
        emberGeo.setAttribute('position', new _three.BufferAttribute(positions, 3));
        emberGeo.setAttribute('color', new _three.BufferAttribute(colors, 3));
        var emberMat = this.track(new _three.PointsMaterial({
            size: 0.065,
            vertexColors: true,
            transparent: true,
            opacity: 0.82,
            blending: _three.AdditiveBlending,
            depthWrite: false
        }));
        this.embers = new _three.Points(emberGeo, emberMat);
        this.scene.add(this.embers);
        this.setFeaturedPlayer(player, team);
        this.resizeObserver = new ResizeObserver(function() {
            return _this.handleResize();
        });
        this.resizeObserver.observe(container);
        this.loop();
    }
    var _proto = SpotlightStageController.prototype;
    _proto.track = function track(d) {
        this.disposables.push(d);
        return d;
    };
    _proto.setFeaturedPlayer = function setFeaturedPlayer(player, team) {
        if (this.rig) {
            this.scene.remove(this.rig.root);
            this.rig.dispose();
        }
        this.rig = (0, _playerRig.createArticulatedPlayerRig)(player, team.primaryColor, team.secondaryColor, team.code, true);
        this.rig.floorRingGroup.visible = false;
        this.scene.add(this.rig.root);
    };
    _proto.setCameraPreset = function setCameraPreset(preset) {
        this.targetPreset = preset;
    };
    _proto.handleResize = function handleResize() {
        if (this.disposed) return;
        var w = Math.max(320, this.container.clientWidth);
        var h = Math.max(240, this.container.clientHeight);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h, false);
    };
    _proto.dispose = function dispose() {
        var _this_resizeObserver, _this_rig, _this_envTex;
        this.disposed = true;
        cancelAnimationFrame(this.rafId);
        (_this_resizeObserver = this.resizeObserver) == null ? void 0 : _this_resizeObserver.disconnect();
        (_this_rig = this.rig) == null ? void 0 : _this_rig.dispose();
        (_this_envTex = this.envTex) == null ? void 0 : _this_envTex.dispose();
        this.disposables.forEach(function(d) {
            return d.dispose();
        });
        this.renderer.dispose();
    };
    return SpotlightStageController;
}();

});

})(window.ArcadeMod);
