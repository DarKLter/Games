(function(ArcadeMod){
// === MODULE: src/games/asphalt-nitro-3d/AsphaltNitro3D ===
ArcadeMod.define("src/games/asphalt-nitro-3d/AsphaltNitro3D", function(require, module, exports) {
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
    get AsphaltNitro3D () {
        return AsphaltNitro3D;
    },
    get resolveCarCollisionStep () {
        return resolveCarCollisionStep;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _arenaRoster = require("../../core/arenaRoster");
var _audio = require("../../core/audio");
var _runtimeBridge = require("../../core/runtimeBridge");
var _storage = require("../../core/storage");
var _types = require("../../core/types");
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
function resolveCarCollisionStep(a, b, trackLength, laneHalfLimit) {
    if (Math.abs(a.yOff - b.yOff) > 1.55) return {
        hit: false,
        relSpeed: 0
    };
    var ds = a.s - b.s;
    ds = ds - Math.round(ds);
    var longDist = ds * trackLength;
    var latDist = a.lane - b.lane;
    var minLong = 4.6;
    var minLat = 2.25;
    if (Math.abs(longDist) >= minLong || Math.abs(latDist) >= minLat) {
        return {
            hit: false,
            relSpeed: 0
        };
    }
    var totalMass = a.mass + b.mass;
    var ratioA = b.mass / totalMass;
    var ratioB = a.mass / totalMass;
    var relSpeed = Math.abs(a.speed - b.speed);
    var penLat = minLat - Math.abs(latDist);
    var penLong = minLong - Math.abs(longDist);
    if (penLat <= penLong) {
        var signLat = latDist >= 0 ? 1 : -1;
        a.lane = Math.max(-laneHalfLimit, Math.min(laneHalfLimit, a.lane + signLat * penLat * ratioA));
        b.lane = Math.max(-laneHalfLimit, Math.min(laneHalfLimit, b.lane - signLat * penLat * ratioB));
    } else {
        var signLong = longDist >= 0 ? 1 : -1;
        var pushS = signLong * (penLong + 0.12) / Math.max(1, trackLength);
        a.s += pushS * ratioA;
        b.s -= pushS * ratioB;
        var avgSpd = (a.speed * a.mass + b.speed * b.mass) / totalMass;
        a.speed = a.speed * 0.45 + avgSpd * 0.55;
        b.speed = b.speed * 0.45 + avgSpd * 0.55;
    }
    return {
        hit: true,
        relSpeed: relSpeed
    };
}
var _p0 = new _three.Vector3();
var _p1 = new _three.Vector3();
var _tan = new _three.Vector3();
var _right = new _three.Vector3();
var _camPos = new _three.Vector3();
var _camLook = new _three.Vector3();
var _up = new _three.Vector3(0, 1, 0);
var AsphaltNitro3D = /*#__PURE__*/ function() {
    "use strict";
    function AsphaltNitro3D(container, diff, lvl, gameIdx, carId) {
        var _this = this;
        if (gameIdx === void 0) gameIdx = 26;
        if (carId === void 0) carId = _storage.playerState.selectedAsphaltCar;
        this.score = 0;
        this.lives = 1;
        this.maxLives = 1;
        this.isPaused = false;
        this.gameOver = false;
        this.isRunning = false;
        this.trackLength = 1320;
        this.laneHalfLimit = 8.6;
        this.racers = [];
        this.pickups = [];
        this.sparks = [];
        this.steerLeft = false;
        this.steerRight = false;
        this.analogSteer = 0;
        this.boosting = false;
        this.drifting = false;
        this.nitroEnergy = 100;
        this.totalLaps = 3;
        this.knockdowns = 0;
        this.gatesHit = 0;
        this.missionClock = 0;
        this.lap1ElimDone = false;
        this.playerRank = 1;
        this.bumpShake = 0;
        this.slamBanner = '';
        this.slamBannerTimer = 0;
        this.elapsed = 0;
        this.lastTime = 0;
        this.tick = function() {
            if (!_this.isRunning || _this.gameOver || _this.isPaused) return;
            var now = performance.now();
            var dt = Math.min(Math.max((now - _this.lastTime) / 1000, 0.001), 0.05);
            _this.lastTime = now;
            _this.updateSimulation(dt);
            _this.drawOverlayHud();
            _this.three.render();
            if (_this.isRunning && !_this.gameOver && !_this.isPaused) {
                _this.three.scheduleNextFrame(_this.tick);
            }
        };
        this.container = container;
        this.diff = diff;
        this.level = lvl;
        this.gameIdx = gameIdx;
        this.carDef = _arenaRoster.ASPHALT_CARS[carId] || _arenaRoster.ASPHALT_CARS[0];
        this.mapDef = _arenaRoster.ASPHALT_MAPS[_storage.playerState.selectedAsphaltMap] || _arenaRoster.ASPHALT_MAPS[0];
        this.tuned = (0, _arenaRoster.computeUpgradedCarStats)(this.carDef, _storage.playerState.carUpgrades[this.carDef.id]);
        this.totalLaps = this.mapDef.laps;
        this.missionClock = this.mapDef.timeLimitSec;
        this.scaler = _types.difficultyScalers[diff] || _types.difficultyScalers.easy;
        _storage.playerState.sessionCoins = 0;
        _storage.playerState.sessionExp = 0;
    }
    var _proto = AsphaltNitro3D.prototype;
    _proto.start = function start() {
        this.three = new _threeShared.StudioThreeContext(this.container, {
            skyColor: this.mapDef.skyColor,
            fogColor: this.mapDef.fogColor,
            fogNear: 95,
            fogFar: 330,
            keyColor: 0xfff3c4,
            keyIntensity: 2.2,
            hemiSky: 0xfde68a,
            hemiGround: this.mapDef.groundColor,
            hemiIntensity: 0.95,
            fov: 62,
            far: 460
        });
        this.three.renderer.toneMapping = _three.NoToneMapping;
        this.buildCircuit();
        this.spawnRacers();
        this.spawnTrackFeatures();
        this.initSparkPool();
        this.snapRacersAndCamera();
        this.slamBanner = this.mapDef.icon + " " + this.mapDef.missionGoal.toUpperCase();
        this.slamBannerTimer = 2.4;
        this.three.prewarm();
        this.isRunning = true;
        this.lastTime = performance.now();
        (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
        this.tick();
    };
    _proto.snapRacersAndCamera = function snapRacersAndCamera() {
        for(var _iterator = _create_for_of_iterator_helper_loose(this.racers), _step; !(_step = _iterator()).done;){
            var car = _step.value;
            var t = (car.s % 1 + 1) % 1;
            var tNext = ((car.s + 0.004) % 1 + 1) % 1;
            this.curve.getPointAt(t, _p0);
            this.curve.getPointAt(tNext, _p1);
            _tan.subVectors(_p1, _p0).normalize();
            _right.crossVectors(_tan, _up).normalize();
            car.group.position.set(_p0.x + _right.x * car.lane, _p0.y + car.yOff, _p0.z + _right.z * car.lane);
            car.group.rotation.set(0, Math.atan2(_tan.x, _tan.z), 0);
        }
        var p = this.playerCar;
        var t1 = (p.s % 1 + 1) % 1;
        this.curve.getPointAt(t1, _p0);
        this.curve.getTangentAt(t1, _tan).normalize();
        this.three.camera.position.set(p.group.position.x - _tan.x * 9.2, p.group.position.y + 3.6, p.group.position.z - _tan.z * 9.2);
        this.three.camera.lookAt(p.group.position.x + _tan.x * 20, p.group.position.y + 1.2, p.group.position.z + _tan.z * 20);
    };
    _proto.stop = function stop() {
        var _this_three;
        this.isRunning = false;
        this.releaseInputs();
        (_this_three = this.three) == null ? void 0 : _this_three.dispose();
    };
    _proto.releaseInputs = function releaseInputs() {
        this.steerLeft = false;
        this.steerRight = false;
        this.analogSteer = 0;
        this.boosting = false;
        this.drifting = false;
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
    };
    _proto.buildCircuit = function buildCircuit() {
        var _this = this;
        var pts = [];
        var N = 48;
        for(var i = 0; i < N; i++){
            var a = i / N * Math.PI * 2;
            var rad = 205 + Math.cos(a * 3) * 44 + Math.sin(a * 2) * 32;
            var y = 2.4 + Math.sin(a * 4) * 4.2 + Math.cos(a * 2) * 1.8;
            pts.push(new _three.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad * 1.28));
        }
        this.curve = new _three.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
        this.trackLength = this.curve.getLength();
        var ground = new _three.Mesh(new _three.PlaneGeometry(1150, 1150), (0, _threeShared.createToonMaterial)(this.mapDef.groundColor));
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -5.5;
        this.three.scene.add(ground);
        var roadTex = this.three.createCanvasTexture(256, function(ctx, s) {
            ctx.fillStyle = _this.mapDef.slug === 'alpine-snow' ? '#475569' : '#334155';
            ctx.fillRect(0, 0, s, s);
            ctx.fillStyle = '#090d16';
            ctx.fillRect(0, 0, 18, s);
            ctx.fillRect(s - 18, 0, 18, s);
            ctx.fillStyle = _this.mapDef.curbLeftHex;
            ctx.fillRect(3, 0, 11, s);
            ctx.fillStyle = _this.mapDef.curbRightHex;
            ctx.fillRect(s - 14, 0, 11, s);
            ctx.fillStyle = 'rgba(255,255,255,0.65)';
            ctx.fillRect(s / 3 - 2, 16, 5, s / 2 - 24);
            ctx.fillRect(s / 3 - 2, s / 2 + 16, 5, s / 2 - 24);
            ctx.fillRect(s * 2 / 3 - 2, 16, 5, s / 2 - 24);
            ctx.fillRect(s * 2 / 3 - 2, s / 2 + 16, 5, s / 2 - 24);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(s / 2 - 4, 10, 8, s - 20);
        }, 1, 92);
        var segs = 320;
        var roadHalfW = 10.6;
        var posArr = [];
        var uvArr = [];
        var idxArr = [];
        for(var i1 = 0; i1 <= segs; i1++){
            var t = i1 % segs / segs;
            this.curve.getPointAt(t, _p0);
            this.curve.getTangentAt(t, _tan).normalize();
            _right.crossVectors(_tan, _up).normalize();
            posArr.push(_p0.x - _right.x * roadHalfW, _p0.y, _p0.z - _right.z * roadHalfW, _p0.x + _right.x * roadHalfW, _p0.y, _p0.z + _right.z * roadHalfW);
            uvArr.push(0, i1 / 5, 1, i1 / 5);
            if (i1 < segs) {
                var b = i1 * 2;
                idxArr.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
            }
        }
        var roadGeo = new _three.BufferGeometry();
        roadGeo.setAttribute('position', new _three.Float32BufferAttribute(posArr, 3));
        roadGeo.setAttribute('uv', new _three.Float32BufferAttribute(uvArr, 2));
        roadGeo.setIndex(idxArr);
        roadGeo.computeVertexNormals();
        var roadMesh = new _three.Mesh(roadGeo, new _three.MeshToonMaterial({
            map: roadTex,
            side: _three.DoubleSide
        }));
        roadMesh.receiveShadow = true;
        this.three.scene.add(roadMesh);
        var pylonColor = this.mapDef.slug === 'volcanic-coast' ? 0xf97316 : this.mapDef.slug === 'alpine-snow' ? 0x0ea5e9 : 0x38bdf8;
        var pylonCount = 72;
        var pylonMesh = new _three.InstancedMesh(new _three.BoxGeometry(0.65, 6.2, 0.65), (0, _threeShared.createToonMaterial)(pylonColor, {
            emissive: pylonColor,
            emissiveIntensity: 0.45
        }), pylonCount);
        var dummy = new _three.Object3D();
        for(var i2 = 0; i2 < pylonCount; i2++){
            var t1 = i2 / pylonCount;
            this.curve.getPointAt(t1, _p0);
            this.curve.getTangentAt(t1, _tan).normalize();
            _right.crossVectors(_tan, _up).normalize();
            var side = i2 % 2 === 0 ? 1 : -1;
            dummy.position.set(_p0.x + _right.x * (roadHalfW + 1.6) * side, _p0.y + 2.8, _p0.z + _right.z * (roadHalfW + 1.6) * side);
            dummy.rotation.y = Math.atan2(_tan.x, _tan.z);
            dummy.updateMatrix();
            pylonMesh.setMatrixAt(i2, dummy.matrix);
        }
        pylonMesh.instanceMatrix.needsUpdate = true;
        pylonMesh.computeBoundingSphere();
        this.three.scene.add(pylonMesh);
        this.curve.getPointAt(0, _p0);
        this.curve.getTangentAt(0, _tan).normalize();
        var arch = new _three.Group();
        var archMat = (0, _threeShared.createToonMaterial)(0xfacc15, {
            emissive: 0xf59e0b,
            emissiveIntensity: 0.35
        });
        var postL = new _three.Mesh(new _three.BoxGeometry(1.1, 9.5, 1.1), archMat);
        postL.position.set(-roadHalfW, 4.7, 0);
        (0, _threeShared.addInkOutline)(postL, 1.07);
        var postR = new _three.Mesh(new _three.BoxGeometry(1.1, 9.5, 1.1), archMat);
        postR.position.set(roadHalfW, 4.7, 0);
        (0, _threeShared.addInkOutline)(postR, 1.07);
        var banner = new _three.Mesh(new _three.BoxGeometry(roadHalfW * 2 + 1.8, 1.6, 1.1), archMat);
        banner.position.set(0, 9.1, 0);
        (0, _threeShared.addInkOutline)(banner, 1.05);
        arch.add(postL, postR, banner);
        arch.position.copy(_p0);
        arch.rotation.y = Math.atan2(_tan.x, _tan.z);
        this.three.scene.add(arch);
        // Biome props outside circuit (Neon Skyscrapers vs Canyon Mesas vs Alpine Peaks)
        var propCount = 44;
        var isCity = this.mapDef.slug === 'neon-city';
        var isSnow = this.mapDef.slug === 'alpine-snow';
        var propGeo = isCity ? new _three.BoxGeometry(12, 26, 12) : isSnow ? new _three.ConeGeometry(13, 24, 6) : new _three.DodecahedronGeometry(9.5, 0);
        var propMesh = new _three.InstancedMesh(propGeo, (0, _threeShared.createToonMaterial)(this.mapDef.mesaColor), propCount);
        for(var i3 = 0; i3 < propCount; i3++){
            var t2 = (i3 + 0.5) / propCount;
            this.curve.getPointAt(t2, _p0);
            this.curve.getTangentAt(t2, _tan).normalize();
            _right.crossVectors(_tan, _up).normalize();
            var side1 = i3 % 2 === 0 ? 1 : -1;
            dummy.position.set(_p0.x + _right.x * 36 * side1, isCity ? 6 : 2, _p0.z + _right.z * 36 * side1);
            dummy.scale.set(1.2, 1.1 + i3 % 3 * 0.5, 1.2);
            dummy.rotation.y = i3 * 0.7;
            dummy.updateMatrix();
            propMesh.setMatrixAt(i3, dummy.matrix);
        }
        propMesh.instanceMatrix.needsUpdate = true;
        propMesh.computeBoundingSphere();
        this.three.scene.add(propMesh);
    };
    _proto.initSparkPool = function initSparkPool() {
        var geo = new _three.BoxGeometry(0.18, 0.18, 0.18);
        var mat = new _three.MeshBasicMaterial({
            color: 0xfacc15
        });
        for(var i = 0; i < 24; i++){
            var mesh = new _three.Mesh(geo, mat);
            mesh.visible = false;
            this.three.scene.add(mesh);
            this.sparks.push({
                mesh: mesh,
                vx: 0,
                vy: 0,
                vz: 0,
                life: 0
            });
        }
    };
    _proto.emitCollisionSparks = function emitCollisionSparks(x, y, z) {
        var spawned = 0;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.sparks), _step; !(_step = _iterator()).done;){
            var sp = _step.value;
            if (sp.life <= 0) {
                sp.life = 0.35 + Math.random() * 0.2;
                sp.vx = (Math.random() - 0.5) * 18;
                sp.vy = 4 + Math.random() * 9;
                sp.vz = (Math.random() - 0.5) * 18;
                sp.mesh.position.set(x, y + 0.5, z);
                sp.mesh.visible = true;
                spawned++;
                if (spawned >= 10) break;
            }
        }
    };
    _proto.spawnRacers = function spawnRacers() {
        var rivalDefs = [
            [
                0x38bdf8,
                0xffffff,
                'hyper',
                0.95
            ],
            [
                0x22c55e,
                0xfacc15,
                'gt',
                1.0
            ],
            [
                0xf97316,
                0x111827,
                'heavy',
                1.35
            ],
            [
                0xec4899,
                0xffffff,
                'drift',
                1.0
            ],
            [
                0x6366f1,
                0xfacc15,
                'gt',
                1.05
            ]
        ];
        var playerBuilt = (0, _threeShared.buildSupercarMesh)(this.carDef.paintColor, this.carDef.stripeColor, this.three.isSoftwareGl, this.carDef.style, true);
        this.three.scene.add(playerBuilt.group);
        var pCar = {
            group: playerBuilt.group,
            wheels: playerBuilt.wheels,
            flameL: playerBuilt.flameL,
            flameR: playerBuilt.flameR,
            s: 0.005,
            lane: 0,
            speed: 42,
            yOff: 0,
            vy: 0,
            airSpin: 0,
            mass: this.carDef.mass,
            knockTimer: 0,
            targetLane: 0,
            isPlayer: true,
            eliminated: false
        };
        this.racers.push(pCar);
        this.playerCar = pCar;
        for(var i = 0; i < rivalDefs.length; i++){
            var _rivalDefs_i = rivalDefs[i], paint = _rivalDefs_i[0], stripe = _rivalDefs_i[1], style = _rivalDefs_i[2], mass = _rivalDefs_i[3];
            var built = (0, _threeShared.buildSupercarMesh)(paint, stripe, this.three.isSoftwareGl, style, true);
            this.three.scene.add(built.group);
            var startLane = (i % 3 - 1) * 4.2;
            this.racers.push({
                group: built.group,
                wheels: built.wheels,
                flameL: built.flameL,
                flameR: built.flameR,
                s: 0.014 + i * 0.009,
                lane: startLane,
                speed: 45 + i % 3 * 3.8 * this.scaler.speedMult,
                yOff: 0,
                vy: 0,
                airSpin: 0,
                mass: mass,
                knockTimer: 0,
                targetLane: startLane,
                isPlayer: false,
                eliminated: false
            });
        }
    };
    _proto.spawnTrackFeatures = function spawnTrackFeatures() {
        var isGatesMode = this.mapDef.missionKind === 'gates';
        var total = isGatesMode ? 22 : 16;
        for(var i = 0; i < total; i++){
            var s = 0.04 + i / total * 0.92;
            var kind = isGatesMode ? i % 2 === 0 ? 'gate' : i % 4 === 1 ? 'ramp' : 'nitro' : i % 3 === 1 ? 'ramp' : 'nitro';
            var lane = (i * 2 % 5 - 2) * 3.0;
            this.curve.getPointAt(s % 1, _p0);
            this.curve.getTangentAt(s % 1, _tan).normalize();
            _right.crossVectors(_tan, _up).normalize();
            var mesh = kind === 'gate' ? new _three.Mesh(new _three.TorusGeometry(2.2, 0.22, 8, 18), (0, _threeShared.createToonMaterial)(0x22d3ee, {
                emissive: 0x06b6d4,
                emissiveIntensity: 0.8
            })) : kind === 'ramp' ? new _three.Mesh(new _three.BoxGeometry(3.8, 0.8, 4.8), (0, _threeShared.createToonMaterial)(0xfacc15, {
                emissive: 0xf59e0b,
                emissiveIntensity: 0.4
            })) : new _three.Mesh(new _three.OctahedronGeometry(1.05, 0), (0, _threeShared.createToonMaterial)(0x38bdf8, {
                emissive: 0x38bdf8,
                emissiveIntensity: 0.65
            }));
            if (kind !== 'gate') (0, _threeShared.addInkOutline)(mesh, 1.07);
            mesh.position.set(_p0.x + _right.x * lane, _p0.y + (kind === 'ramp' ? 0.35 : kind === 'gate' ? 2.1 : 1.15), _p0.z + _right.z * lane);
            mesh.rotation.y = Math.atan2(_tan.x, _tan.z);
            if (kind === 'ramp') mesh.rotation.x = -0.22;
            this.three.scene.add(mesh);
            this.pickups.push({
                mesh: mesh,
                s: s,
                lane: lane,
                kind: kind,
                cooldown: 0
            });
        }
    };
    _proto.setSteerLeft = function setSteerLeft(down) {
        this.steerLeft = down && !this.gameOver && !this.isPaused;
    };
    _proto.setSteerRight = function setSteerRight(down) {
        this.steerRight = down && !this.gameOver && !this.isPaused;
    };
    _proto.setMoveDir = function setMoveDir(dx) {
        if (this.gameOver || this.isPaused) {
            this.analogSteer = 0;
            this.steerLeft = false;
            this.steerRight = false;
            return;
        }
        this.analogSteer = Math.max(-1, Math.min(1, dx));
        this.steerLeft = dx < -0.2;
        this.steerRight = dx > 0.2;
    };
    _proto.setBoost = function setBoost(on) {
        this.boosting = on && !this.gameOver && !this.isPaused;
    };
    _proto.jump = function jump() {
        if (this.gameOver || this.isPaused) return;
        if (this.playerCar && this.playerCar.yOff <= 0.05) {
            this.playerCar.vy = 11.5;
            this.playerCar.airSpin = Math.PI * 2;
            _audio.ArcadeAudio.play('jump');
        }
    };
    _proto.triggerAction = function triggerAction(actionKey, pressed) {
        if (!pressed) {
            if (actionKey === 'action' || actionKey === 'boost') this.boosting = false;
            else if (actionKey === 'drift') this.drifting = false;
            return;
        }
        if (this.gameOver || this.isPaused) return;
        if (actionKey === 'action' || actionKey === 'boost') this.boosting = true;
        else if (actionKey === 'drift') this.drifting = true;
        else if (actionKey === 'jump') this.jump();
    };
    _proto.finishMission = function finishMission(victory, stars) {
        if (this.gameOver) return;
        this.gameOver = true;
        this.isRunning = false;
        if (victory) {
            var _playerState_asphaltMapStars_this_mapDef_id;
            var reward = this.mapDef.rewardCoins;
            (0, _runtimeBridge.addCoins)(reward);
            (0, _runtimeBridge.addXp)(55);
            var prev = (_playerState_asphaltMapStars_this_mapDef_id = _storage.playerState.asphaltMapStars[this.mapDef.id]) != null ? _playerState_asphaltMapStars_this_mapDef_id : 0;
            if (stars > prev) {
                _storage.playerState.asphaltMapStars[this.mapDef.id] = stars;
            }
            (0, _storage.persistAsphaltGarage)();
            _audio.ArcadeAudio.play('combo');
        } else {
            _audio.ArcadeAudio.play('gameover');
        }
        (0, _runtimeBridge.triggerGameOver)(this.score, _storage.playerState.sessionCoins, this.level, this.gameIdx, victory);
    };
    _proto.updateSimulation = function updateSimulation(dt) {
        this.elapsed += dt;
        this.bumpShake = Math.max(0, this.bumpShake - dt * 2.5);
        this.slamBannerTimer = Math.max(0, this.slamBannerTimer - dt);
        if (this.mapDef.missionKind === 'gates' && this.missionClock > 0) {
            this.missionClock -= dt;
            if (this.missionClock <= 0 && this.gatesHit < this.mapDef.targetGates) {
                this.finishMission(false, 0);
                return;
            }
        }
        var p = this.playerCar;
        var btnSteer = (this.steerRight ? 1 : 0) - (this.steerLeft ? 1 : 0);
        var steerDir = Math.abs(this.analogSteer) > 0.12 ? this.analogSteer : btnSteer;
        var laneSpeed = (this.drifting ? this.tuned.steerSpeed * 1.25 : this.tuned.steerSpeed) * dt;
        p.lane = Math.max(-this.laneHalfLimit, Math.min(this.laneHalfLimit, p.lane + steerDir * laneSpeed));
        if (this.drifting && Math.abs(steerDir) > 0) {
            this.nitroEnergy = Math.min(100, this.nitroEnergy + this.tuned.driftCharge * dt);
        }
        var useNitro = this.boosting && this.nitroEnergy > 2;
        if (useNitro) {
            this.nitroEnergy = Math.max(0, this.nitroEnergy - this.tuned.nitroDrain * dt);
            p.flameL.visible = true;
            p.flameR.visible = true;
        } else {
            this.nitroEnergy = Math.min(100, this.nitroEnergy + 7.5 * dt);
            p.flameL.visible = false;
            p.flameR.visible = false;
        }
        var targetSpd = useNitro ? this.tuned.nitroSpeed : this.drifting ? this.tuned.topSpeed * 0.92 : this.tuned.topSpeed;
        p.speed = _three.MathUtils.damp(p.speed, targetSpd, this.tuned.accelRate, dt);
        var normS = (p.s % 1 + 1) % 1;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.pickups), _step; !(_step = _iterator()).done;){
            var pk = _step.value;
            if (pk.kind === 'nitro') pk.mesh.rotation.y += dt * 2.5;
            if (pk.cooldown > 0) {
                pk.cooldown = Math.max(0, pk.cooldown - dt);
                pk.mesh.visible = pk.cooldown <= 0 || pk.kind === 'ramp';
                continue;
            }
            var ds = Math.abs(normS - pk.s);
            if ((ds < 0.011 || ds > 0.989) && Math.abs(p.lane - pk.lane) < 2.9 && p.yOff < 2.2) {
                pk.cooldown = 2.0;
                if (pk.kind === 'gate') {
                    this.gatesHit++;
                    this.nitroEnergy = Math.min(100, this.nitroEnergy + 28);
                    this.score += 120;
                    (0, _runtimeBridge.addCoins)(3);
                    _audio.ArcadeAudio.play('coin');
                    pk.mesh.visible = false;
                    this.slamBanner = "\uD83C\uDF00 GATE " + this.gatesHit + "/" + this.mapDef.targetGates + "!";
                    this.slamBannerTimer = 1.1;
                    if (this.gatesHit >= this.mapDef.targetGates) {
                        this.score += 500;
                        this.finishMission(true, this.missionClock > 20 ? 3 : 2);
                        return;
                    }
                } else if (pk.kind === 'nitro') {
                    this.nitroEnergy = Math.min(100, this.nitroEnergy + 45);
                    this.score += 75;
                    (0, _runtimeBridge.addCoins)(2);
                    _audio.ArcadeAudio.play('coin');
                    pk.mesh.visible = false;
                } else {
                    p.vy = 14.5;
                    p.airSpin = Math.PI * 2;
                    p.speed = Math.max(p.speed, this.tuned.nitroSpeed);
                    this.score += 140;
                    (0, _runtimeBridge.addCoins)(4);
                    _audio.ArcadeAudio.play('levelup');
                }
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
            }
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.racers), _step1; !(_step1 = _iterator1()).done;){
            var car = _step1.value;
            car.knockTimer = Math.max(0, car.knockTimer - dt);
            if (!car.isPlayer) {
                var aiTarget = car.eliminated ? 0 : car.knockTimer > 0 ? 24 : 54 + (Math.sin(car.s * 14) * 4 + (car.lane > 0 ? 1 : -1) * 2.5) * this.scaler.speedMult;
                car.speed = _three.MathUtils.damp(car.speed, aiTarget, 2.5, dt);
                car.targetLane = Math.sin(car.s * 24 + car.mass * 3) * 6.2;
                car.lane = _three.MathUtils.damp(car.lane, car.targetLane, 1.4, dt);
                car.flameL.visible = !car.eliminated && car.speed > 60;
                car.flameR.visible = !car.eliminated && car.speed > 60;
            }
            var prevLap = Math.floor(car.s);
            car.s += car.speed * dt / this.trackLength;
            var newLap = Math.floor(car.s);
            if (car.isPlayer && newLap > prevLap && newLap <= this.totalLaps) {
                this.score += 350;
                this.level = Math.min(this.totalLaps, newLap + 1);
                (0, _runtimeBridge.addCoins)(12);
                (0, _runtimeBridge.addXp)(25);
                _audio.ArcadeAudio.play('levelup');
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
                if (this.mapDef.missionKind === 'elimination' && newLap === 1 && !this.lap1ElimDone) {
                    this.lap1ElimDone = true;
                    var sorted = [].concat(this.racers).sort(function(a, b) {
                        return b.s - a.s;
                    });
                    var pPos = sorted.indexOf(p) + 1;
                    if (pPos > 4) {
                        this.finishMission(false, 0);
                        return;
                    }
                    sorted[sorted.length - 1].eliminated = true;
                    sorted[sorted.length - 2].eliminated = true;
                    this.slamBanner = '⚠️ 2 RIVALS ELIMINATED!';
                    this.slamBannerTimer = 1.6;
                }
            }
            if (car.yOff > 0 || car.vy !== 0) {
                car.yOff += car.vy * dt;
                car.vy -= 26 * dt;
                if (car.yOff <= 0) {
                    car.yOff = 0;
                    car.vy = 0;
                    car.airSpin = 0;
                }
            }
            if (car.airSpin > 0) {
                car.airSpin = Math.max(0, car.airSpin - dt * 6.5);
            }
        }
        for(var i = 0; i < this.racers.length; i++){
            for(var j = i + 1; j < this.racers.length; j++){
                var a = this.racers[i];
                var b = this.racers[j];
                var col = resolveCarCollisionStep(a, b, this.trackLength, this.laneHalfLimit);
                if (col.hit) {
                    var involvesPlayer = a.isPlayer || b.isPlayer;
                    var rival = a.isPlayer ? b : b.isPlayer ? a : null;
                    var midX = (a.group.position.x + b.group.position.x) * 0.5;
                    var midY = (a.group.position.y + b.group.position.y) * 0.5;
                    var midZ = (a.group.position.z + b.group.position.z) * 0.5;
                    this.emitCollisionSparks(midX, midY, midZ);
                    if (involvesPlayer && rival && rival.knockTimer <= 0) {
                        this.bumpShake = 0.28;
                        _audio.ArcadeAudio.play('hit');
                        if (useNitro || this.carDef.mass >= 1.25 || col.relSpeed > 6.5) {
                            rival.knockTimer = 1.6;
                            rival.vy = 5.5;
                            this.knockdowns++;
                            this.score += 140;
                            (0, _runtimeBridge.addCoins)(5);
                            this.slamBanner = "\uD83D\uDCA5 TAKEDOWN #" + this.knockdowns + "! +140";
                            this.slamBannerTimer = 1.4;
                            _audio.ArcadeAudio.play('explosion');
                            (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
                        }
                    }
                }
            }
        }
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.racers), _step2; !(_step2 = _iterator2()).done;){
            var car1 = _step2.value;
            var t = (car1.s % 1 + 1) % 1;
            var tNext = ((car1.s + 0.004) % 1 + 1) % 1;
            this.curve.getPointAt(t, _p0);
            this.curve.getPointAt(tNext, _p1);
            _tan.subVectors(_p1, _p0).normalize();
            _right.crossVectors(_tan, _up).normalize();
            car1.group.position.set(_p0.x + _right.x * car1.lane, _p0.y + car1.yOff, _p0.z + _right.z * car1.lane);
            var yaw = Math.atan2(_tan.x, _tan.z) + (car1.isPlayer && this.drifting ? steerDir * 0.24 : 0);
            car1.group.rotation.set(0, yaw, car1.airSpin);
            for(var _iterator3 = _create_for_of_iterator_helper_loose(car1.wheels), _step3; !(_step3 = _iterator3()).done;){
                var w = _step3.value;
                w.rotation.x += car1.speed * dt * 0.65;
            }
        }
        for(var _iterator4 = _create_for_of_iterator_helper_loose(this.sparks), _step4; !(_step4 = _iterator4()).done;){
            var sp = _step4.value;
            if (sp.life > 0) {
                sp.life -= dt;
                sp.mesh.position.x += sp.vx * dt;
                sp.mesh.position.y += sp.vy * dt;
                sp.mesh.position.z += sp.vz * dt;
                sp.vy -= 18 * dt;
                if (sp.life <= 0) sp.mesh.visible = false;
            }
        }
        var rank = 1;
        for(var _iterator5 = _create_for_of_iterator_helper_loose(this.racers), _step5; !(_step5 = _iterator5()).done;){
            var c = _step5.value;
            if (!c.isPlayer && c.s > p.s) rank++;
        }
        this.playerRank = rank;
        if (p.s >= this.totalLaps) {
            this.score += (7 - this.playerRank) * 250;
            var koMet = this.mapDef.missionKind !== 'takedown' || this.knockdowns >= this.mapDef.targetKOs;
            var elimMet = this.mapDef.missionKind !== 'elimination' || this.playerRank <= 2;
            var gateMet = this.mapDef.missionKind !== 'gates' || this.gatesHit >= this.mapDef.targetGates;
            var victory = this.playerRank <= 3 && koMet && elimMet && gateMet;
            var stars = !victory ? 0 : this.playerRank === 1 ? 3 : this.playerRank === 2 ? 2 : 1;
            this.finishMission(victory, stars);
            return;
        }
        var t1 = (p.s % 1 + 1) % 1;
        this.curve.getPointAt(t1, _p0);
        this.curve.getTangentAt(t1, _tan).normalize();
        _right.crossVectors(_tan, _up).normalize();
        var targetFov = useNitro ? 78 : 62;
        var nextFov = _three.MathUtils.damp(this.three.camera.fov, targetFov, 7, dt);
        if (Math.abs(nextFov - this.three.camera.fov) > 0.02) {
            this.three.camera.fov = nextFov;
            this.three.camera.updateProjectionMatrix();
        }
        var shakeX = this.bumpShake > 0 ? (Math.random() - 0.5) * this.bumpShake * 1.4 : 0;
        var shakeY = this.bumpShake > 0 ? (Math.random() - 0.5) * this.bumpShake * 1.1 : 0;
        _camPos.set(p.group.position.x - _tan.x * 9.5 + shakeX, p.group.position.y + 3.9 + shakeY, p.group.position.z - _tan.z * 9.5);
        this.three.camera.position.lerp(_camPos, 1 - Math.exp(-12 * dt));
        _camLook.set(p.group.position.x + _tan.x * 18, p.group.position.y + 1.3, p.group.position.z + _tan.z * 18);
        this.three.camera.lookAt(_camLook);
    };
    _proto.drawOverlayHud = function drawOverlayHud() {
        var ctx = this.three.overlayCtx;
        if (!ctx) return;
        var w = this.three.width;
        var h = this.three.height;
        ctx.clearRect(0, 0, w, h);
        if (this.boosting && this.nitroEnergy > 2) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
            ctx.lineWidth = 3;
            var cx = w / 2;
            var cy = h * 0.45;
            for(var i = 0; i < 12; i++){
                var ang = i / 12 * Math.PI * 2 + this.elapsed * 2;
                var r1 = Math.min(w, h) * 0.34;
                var r2 = Math.max(w, h) * 0.65;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
                ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
                ctx.stroke();
            }
        }
        var compactLandscape = w > h * 1.3 && h < 480;
        var pillY = w < 560 ? 54 : compactLandscape ? 44 : 12;
        var pillW = Math.min(w - (compactLandscape ? 160 : 24), 340);
        var pillH = compactLandscape ? 32 : 38;
        var pillX = w / 2 - pillW / 2;
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.roundRect(pillX + 4, pillY + 4, pillW, pillH, 12);
        ctx.fill();
        ctx.fillStyle = '#fefce8';
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 12);
        ctx.fill();
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 3;
        ctx.stroke();
        var lapNum = Math.min(this.totalLaps, Math.floor(this.playerCar.s) + 1);
        var kmh = Math.round(this.playerCar.speed * 3.8);
        var extraTag = this.mapDef.missionKind === 'takedown' ? " \xb7 \uD83D\uDCA5 " + this.knockdowns + "/" + this.mapDef.targetKOs + " KO" : this.mapDef.missionKind === 'gates' ? " \xb7 \uD83C\uDF00 " + this.gatesHit + "/" + this.mapDef.targetGates + " (" + Math.ceil(this.missionClock) + "s)" : this.mapDef.missionKind === 'elimination' ? " \xb7 " + (this.lap1ElimDone ? 'FINAL TOP 2' : 'ELIM CUTOFF') : '';
        ctx.fillStyle = '#090d16';
        ctx.font = w < 440 || compactLandscape ? '900 10px system-ui, sans-serif' : '900 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.mapDef.icon + " #" + this.playerRank + "/6 \xb7 LAP " + lapNum + "/" + this.totalLaps + " \xb7 " + kmh + " KM/H" + extraTag, w / 2, pillY + (compactLandscape ? 20 : 24));
        if (this.slamBannerTimer > 0) {
            ctx.fillStyle = '#090d16';
            ctx.font = compactLandscape ? '900 13px system-ui, sans-serif' : '900 16px system-ui, sans-serif';
            ctx.fillText(this.slamBanner, w / 2 + 2, pillY + pillH + 20);
            ctx.fillStyle = '#facc15';
            ctx.fillText(this.slamBanner, w / 2, pillY + pillH + 18);
        }
        var bw = w < 440 || compactLandscape ? Math.min(186, Math.max(114, w - 210)) : 186;
        var gx = w / 2 - bw / 2 - 12;
        var barH = compactLandscape ? 34 : 42;
        var gy = h - (compactLandscape ? 42 : 56);
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.roundRect(gx + 4, gy + 4, bw + 24, barH, 10);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(gx, gy, bw + 24, barH, 10);
        ctx.fill();
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#090d16';
        ctx.fillRect(w / 2 - bw / 2, gy + 7, bw, compactLandscape ? 9 : 12);
        ctx.fillStyle = this.boosting ? '#38bdf8' : '#facc15';
        ctx.fillRect(w / 2 - bw / 2 + 2, gy + 9, (bw - 4) * this.nitroEnergy / 100, compactLandscape ? 5 : 8);
        ctx.fillStyle = '#ffffff';
        ctx.font = compactLandscape ? '900 9.5px system-ui, sans-serif' : '900 10.5px system-ui, sans-serif';
        ctx.fillText("⚡ " + this.carDef.name.toUpperCase() + " NITRO " + Math.round(this.nitroEnergy) + "%", w / 2, gy + (compactLandscape ? 28 : 34));
        ctx.textAlign = 'left';
    };
    return AsphaltNitro3D;
}();

});

})(window.ArcadeMod);
