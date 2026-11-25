(function(ArcadeMod){
// === MODULE: src/games/battle-royale-3d/BattleRoyale3D ===
ArcadeMod.define("src/games/battle-royale-3d/BattleRoyale3D", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BattleRoyale3D", {
    enumerable: true,
    get: function() {
        return BattleRoyale3D;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _arenaRoster = require("../../core/arenaRoster");
var _audio = require("../../core/audio");
var _runtimeBridge = require("../../core/runtimeBridge");
var _storage = require("../../core/storage");
var _types = require("../../core/types");
var _viewport = require("../../core/viewport");
var _threeShared = require("../../core/threeShared");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
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
var _camTarget = new _three.Vector3();
var _camDesired = new _three.Vector3();
var _rayOrigin = new _three.Vector3();
var BattleRoyale3D = /*#__PURE__*/ function() {
    "use strict";
    function BattleRoyale3D(container, diff, lvl, gameIdx) {
        var _this = this;
        if (gameIdx === void 0) gameIdx = 24;
        this.score = 0;
        this.lives = 100;
        this.maxLives = 100;
        this.isPaused = false;
        this.gameOver = false;
        this.isRunning = false;
        this.buggyWheels = [];
        // Match Phases: C-130 Cargo Plane -> Parachute Glide -> Ground Combat
        this.phase = 'plane';
        this.planeT = 0;
        this.planeStart = new _three.Vector3(-56, 44, -52);
        this.planeEnd = new _three.Vector3(56, 44, 52);
        this.px = -56;
        this.py = 44;
        this.pz = -52;
        this.pvy = 0;
        this.yaw = Math.PI * 0.75;
        this.pitch = 0.08;
        this.moveX = 0;
        this.moveZ = 0;
        this.firing = false;
        this.scoped = false;
        this.reloadTimer = 0;
        this.fireCd = 0;
        // 4-Weapon Loadout
        this.activeSlot = 0;
        this.weaponMag = [
            30,
            35,
            8,
            5
        ];
        this.weaponReserve = [
            120,
            140,
            32,
            10
        ];
        this.grenades = 3;
        this.flares = 1;
        this.armor = 40;
        this.medkits = 2;
        // Drivable Buggy
        this.buggyX = 9;
        this.buggyZ = 14;
        this.buggyYaw = 0.4;
        this.buggySpeed = 0;
        this.inVehicle = false;
        this.roadkillCd = 0;
        this.kills = 0;
        this.totalBots = 14;
        this.aliveCount = 15;
        this.stormRadius = 76;
        this.stormShrinkRate = 0.62;
        this.stormDmgTick = 0;
        this.airdropTimer = 20;
        this.elapsed = 0;
        this.hitMarkerTimer = 0;
        this.toastText = '';
        this.toastTimer = 0;
        this.bots = [];
        this.bullets = [];
        this.nades = [];
        this.fxRings = [];
        this.covers = [];
        this.loot = [];
        this.lastTime = 0;
        this.dragLookId = null;
        this.dragLastX = 0;
        this.dragLastY = 0;
        this.onDomDown = function(e) {
            if (_this.gameOver || _this.isPaused) return;
            if (_this.phase === 'plane') {
                _this.ejectFromPlane();
                return;
            }
            var stagePt = (0, _viewport.mapClientToStage)(e.clientX, e.clientY);
            var vp = (0, _viewport.getViewportSize)();
            // Tap bottom weapon bar slots directly
            if (stagePt.y > vp.height - 68 && vp.width >= 520) {
                var slotW = 76;
                var startX = vp.width / 2 - slotW * 2;
                if (stagePt.x >= startX && stagePt.x <= startX + slotW * 4) {
                    var idx = Math.floor((stagePt.x - startX) / slotW);
                    _this.switchWeapon(idx);
                    return;
                }
            }
            if (e.button === 2) {
                _this.scoped = !_this.scoped;
                _audio.ArcadeAudio.play('click');
                return;
            }
            _this.dragLookId = e.pointerId;
            _this.dragLastX = e.clientX;
            _this.dragLastY = e.clientY;
            if (stagePt.x > vp.width * 0.62 && stagePt.y > 140 && _this.phase === 'ground' && !_this.inVehicle) {
                _this.firing = true;
            }
        };
        this.onDomMove = function(e) {
            if (_this.dragLookId !== e.pointerId || _this.isPaused || _this.gameOver) return;
            var _mapClientDeltaToStage = (0, _viewport.mapClientDeltaToStage)(e.clientX - _this.dragLastX, e.clientY - _this.dragLastY), dx = _mapClientDeltaToStage.dx, dy = _mapClientDeltaToStage.dy;
            _this.dragLastX = e.clientX;
            _this.dragLastY = e.clientY;
            var sens = _this.scoped ? 0.0024 : 0.0052;
            _this.yaw -= dx * sens;
            _this.pitch = Math.max(-0.35, Math.min(0.42, _this.pitch + dy * sens * 0.7));
        };
        this.onDomUp = function(e) {
            if (_this.dragLookId === e.pointerId) {
                _this.dragLookId = null;
            }
            _this.firing = false;
        };
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
        this.scaler = _types.difficultyScalers[diff] || _types.difficultyScalers.easy;
        _storage.playerState.sessionCoins = 0;
        _storage.playerState.sessionExp = 0;
    }
    var _proto = BattleRoyale3D.prototype;
    _proto.showToast = function showToast(msg) {
        this.toastText = msg;
        this.toastTimer = 2.6;
    };
    _proto.start = function start() {
        var isSanhok = _storage.playerState.selectedBrMap === 'sanhok';
        this.three = new _threeShared.StudioThreeContext(this.container, {
            skyColor: isSanhok ? 0x5eead4 : 0x6ec3f4,
            fogColor: isSanhok ? 0x99f6e4 : 0x8ad2f2,
            fogNear: isSanhok ? 40 : 54,
            fogFar: isSanhok ? 165 : 185,
            fov: 62,
            far: 280
        });
        if (_storage.playerState.brSupplyCrateReady) {
            this.armor = 95;
            this.flares = 2;
            this.medkits = 3;
            this.weaponReserve[3] += 10;
            _storage.playerState.brSupplyCrateReady = false;
            (0, _storage.persistBrStats)();
            this.showToast('🎁 Supply Crate Equipped: Lv.3 Vest + Flare!');
        } else {
            this.showToast('✈️ C-130 Cargo Plane: Tap Screen or SPACE to Parachute!');
        }
        this.buildWorld(isSanhok);
        this.buildPlaneAndChute();
        this.spawnPlayer();
        this.spawnBuggy();
        this.spawnBots();
        this.spawnLoot();
        this.snapCamera();
        var dom = this.three.renderer.domElement;
        dom.addEventListener('pointerdown', this.onDomDown);
        window.addEventListener('pointermove', this.onDomMove);
        window.addEventListener('pointerup', this.onDomUp);
        window.addEventListener('pointercancel', this.onDomUp);
        this.three.prewarm();
        this.isRunning = true;
        this.lastTime = performance.now();
        (0, _runtimeBridge.setActionButtonLabel)('JUMP!');
        (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
        this.tick();
    };
    _proto.snapCamera = function snapCamera() {
        this.three.camera.position.set(this.px - 10, this.py + 6, this.pz - 10);
        this.three.camera.lookAt(0, 6, 0);
    };
    _proto.stop = function stop() {
        var _this_three_renderer, _this_three, _this_three1;
        this.isRunning = false;
        this.releaseInputs();
        var dom = (_this_three = this.three) == null ? void 0 : (_this_three_renderer = _this_three.renderer) == null ? void 0 : _this_three_renderer.domElement;
        if (dom) dom.removeEventListener('pointerdown', this.onDomDown);
        window.removeEventListener('pointermove', this.onDomMove);
        window.removeEventListener('pointerup', this.onDomUp);
        window.removeEventListener('pointercancel', this.onDomUp);
        (_this_three1 = this.three) == null ? void 0 : _this_three1.dispose();
    };
    _proto.releaseInputs = function releaseInputs() {
        this.moveX = 0;
        this.moveZ = 0;
        this.firing = false;
        this.dragLookId = null;
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
    _proto.buildWorld = function buildWorld(isSanhok) {
        var tex = this.three.createCanvasTexture(256, function(ctx, s) {
            ctx.fillStyle = isSanhok ? '#265c32' : '#3b6f38';
            ctx.fillRect(0, 0, s, s);
            for(var i = 0; i < 420; i++){
                ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(10,30,12,0.14)';
                ctx.fillRect(i * 37 % s, i * 53 % s, 6, 6);
            }
        }, 28, 28);
        var island = new _three.Mesh(new _three.CylinderGeometry(88, 96, 4, 48), new _three.MeshStandardMaterial({
            map: tex,
            roughness: 0.9,
            metalness: 0.02
        }));
        island.position.y = -2;
        island.receiveShadow = true;
        this.three.scene.add(island);
        var ocean = new _three.Mesh(new _three.PlaneGeometry(440, 440), new _three.MeshStandardMaterial({
            color: isSanhok ? 0x0f766e : 0x0284c7,
            roughness: 0.2,
            metalness: 0.65
        }));
        ocean.rotation.x = -Math.PI / 2;
        ocean.position.y = -1.2;
        this.three.scene.add(ocean);
        var wallMat = new _three.MeshStandardMaterial({
            color: isSanhok ? 0x4d5d4e : 0x64748b,
            roughness: 0.78
        });
        var crateMat = new _three.MeshStandardMaterial({
            color: isSanhok ? 0x854d0e : 0xb45309,
            roughness: 0.65
        });
        var layouts = [
            [
                0,
                0,
                5.5,
                5.5,
                3.2,
                false
            ],
            [
                -22,
                -16,
                4.8,
                3.5,
                3.0,
                false
            ],
            [
                24,
                -18,
                4.5,
                4.5,
                3.4,
                false
            ],
            [
                -28,
                22,
                6,
                3.5,
                3.2,
                false
            ],
            [
                26,
                20,
                5,
                4,
                3.0,
                false
            ],
            [
                -10,
                8,
                2.2,
                2.2,
                1.8,
                true
            ],
            [
                12,
                6,
                2.2,
                2.2,
                1.8,
                true
            ],
            [
                -12,
                -28,
                2.4,
                2.4,
                2.0,
                true
            ],
            [
                15,
                -30,
                2.4,
                2.4,
                2.0,
                true
            ],
            [
                0,
                32,
                6.2,
                2.4,
                2.5,
                false
            ],
            [
                -40,
                0,
                4.2,
                4.2,
                3.6,
                false
            ],
            [
                40,
                -2,
                4.2,
                4.2,
                3.6,
                false
            ]
        ];
        for(var _iterator = _create_for_of_iterator_helper_loose(layouts), _step; !(_step = _iterator()).done;){
            var _step_value = _step.value, x = _step_value[0], z = _step_value[1], w = _step_value[2], d = _step_value[3], h = _step_value[4], isCrate = _step_value[5];
            var m = new _three.Mesh(new _three.BoxGeometry(w, h, d), isCrate ? crateMat : wallMat);
            m.position.set(x, h / 2, z);
            m.castShadow = true;
            m.receiveShadow = true;
            this.three.scene.add(m);
            this.covers.push({
                x: x,
                z: z,
                hw: w / 2,
                hd: d / 2,
                h: h
            });
        }
        var treeCount = 58;
        var trunkMesh = new _three.InstancedMesh(new _three.CylinderGeometry(0.28, 0.4, 2.8, 7), new _three.MeshStandardMaterial({
            color: 0x5c3a21,
            roughness: 0.9
        }), treeCount);
        var crownMesh = new _three.InstancedMesh(new _three.ConeGeometry(isSanhok ? 2.1 : 1.75, 4.4, 7), new _three.MeshStandardMaterial({
            color: isSanhok ? 0x166534 : 0x15803d,
            roughness: 0.8
        }), treeCount);
        var dummy = new _three.Object3D();
        var col = new _three.Color();
        for(var i = 0; i < treeCount; i++){
            var ang = i / treeCount * Math.PI * 2 + i % 3 * 0.2;
            var rad = i < 32 ? 58 + i % 4 * 5.5 : 18 + i * 11 % 34;
            var tx = Math.cos(ang) * rad;
            var tz = Math.sin(ang) * rad;
            var sc = 0.85 + i % 5 * 0.1;
            dummy.position.set(tx, 1.4 * sc, tz);
            dummy.scale.setScalar(sc);
            dummy.updateMatrix();
            trunkMesh.setMatrixAt(i, dummy.matrix);
            dummy.position.set(tx, 4.2 * sc, tz);
            dummy.updateMatrix();
            crownMesh.setMatrixAt(i, dummy.matrix);
            col.setHSL(isSanhok ? 0.34 : 0.36, 0.6, 0.25 + i % 3 * 0.04);
            crownMesh.setColorAt(i, col);
        }
        trunkMesh.instanceMatrix.needsUpdate = true;
        crownMesh.instanceMatrix.needsUpdate = true;
        if (crownMesh.instanceColor) crownMesh.instanceColor.needsUpdate = true;
        this.three.scene.add(trunkMesh, crownMesh);
        this.stormMesh = new _three.Mesh(new _three.CylinderGeometry(1, 1, 28, 48, 1, true), new _three.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.24,
            side: _three.DoubleSide,
            depthWrite: false
        }));
        this.stormMesh.position.y = 14;
        this.three.scene.add(this.stormMesh);
        this.bulletGeo = new _three.SphereGeometry(0.16, 6, 6);
        this.playerBulletMat = new _three.MeshBasicMaterial({
            color: 0xfacc15
        });
        this.enemyBulletMat = new _three.MeshBasicMaterial({
            color: 0xff4757
        });
    };
    _proto.buildPlaneAndChute = function buildPlaneAndChute() {
        // Procedural C-130 Cargo Airplane
        this.planeGroup = new _three.Group();
        var metal = new _three.MeshStandardMaterial({
            color: 0x475569,
            roughness: 0.45,
            metalness: 0.65
        });
        var dark = new _three.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.6
        });
        var fuse = new _three.Mesh(new _three.BoxGeometry(2.6, 2.4, 12.5), metal);
        var wing = new _three.Mesh(new _three.BoxGeometry(15.5, 0.35, 3.1), metal);
        wing.position.set(0, 0.9, 0.6);
        var tailFin = new _three.Mesh(new _three.BoxGeometry(0.4, 3.0, 2.4), dark);
        tailFin.position.set(0, 2.2, -5.2);
        var tailWing = new _three.Mesh(new _three.BoxGeometry(5.6, 0.25, 1.5), dark);
        tailWing.position.set(0, 0.8, -5.3);
        this.planeGroup.add(fuse, wing, tailFin, tailWing);
        this.planeGroup.position.copy(this.planeStart);
        this.planeGroup.lookAt(this.planeEnd);
        this.three.scene.add(this.planeGroup);
        // Parachute canopy attached over player during descent
        this.chuteGroup = new _three.Group();
        var canopy = new _three.Mesh(new _three.SphereGeometry(2.2, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.52), new _three.MeshStandardMaterial({
            color: 0xf59e0b,
            side: _three.DoubleSide,
            roughness: 0.6
        }));
        canopy.position.y = 3.6;
        var cordGeo = new _three.CylinderGeometry(0.025, 0.025, 2.5, 4);
        var cordMat = new _three.MeshBasicMaterial({
            color: 0xf8fafc
        });
        for(var _i = 0, _iter = [
            -1,
            1
        ]; _i < _iter.length; _i++){
            var sx = _iter[_i];
            var cord = new _three.Mesh(cordGeo, cordMat);
            cord.position.set(sx * 0.7, 2.6, 0);
            cord.rotation.z = sx * -0.42;
            this.chuteGroup.add(cord);
        }
        this.chuteGroup.add(canopy);
        this.chuteGroup.visible = false;
    };
    _proto.spawnPlayer = function spawnPlayer() {
        var built = (0, _threeShared.buildSoldierMesh)(0x2563eb, 0x1e3a8a, 0x38bdf8, 1.0);
        this.playerGroup = built.group;
        this.muzzleObj = built.muzzle;
        this.playerGroup.add(this.chuteGroup);
        this.playerGroup.visible = false;
        this.three.scene.add(this.playerGroup);
    };
    _proto.spawnBuggy = function spawnBuggy() {
        var built = (0, _threeShared.buildBuggyMesh)(_storage.playerState.selectedBrMap === 'sanhok' ? 0x365314 : 0x78716c);
        this.buggyGroup = built.group;
        this.buggyWheels = built.wheels;
        this.buggyGroup.position.set(this.buggyX, 0, this.buggyZ);
        this.buggyGroup.rotation.y = this.buggyYaw;
        this.three.scene.add(this.buggyGroup);
    };
    _proto.spawnBots = function spawnBots() {
        var isSquad = _storage.playerState.selectedBrMode === 'squad';
        if (isSquad) {
            var wingman = (0, _threeShared.buildSoldierMesh)(0x0284c7, 0x38bdf8, 0x84fab0, 1.0);
            wingman.group.position.set(-4, 0, 18);
            this.three.scene.add(wingman.group);
            this.bots.push({
                id: 99,
                mesh: wingman.group,
                x: -4,
                z: 18,
                hp: 160,
                maxHp: 160,
                shootCd: 0.8,
                isBoss: false,
                isAlly: true,
                alive: true
            });
        }
        this.totalBots = 11 + Math.min(8, this.level * 2);
        this.aliveCount = this.totalBots + (isSquad ? 2 : 1);
        for(var i = 0; i < this.totalBots; i++){
            var ang = i / this.totalBots * Math.PI * 2 + 0.3;
            var dist = 24 + i % 4 * 9;
            var bx = Math.cos(ang) * dist;
            var bz = Math.sin(ang) * dist;
            var isBoss = i === this.totalBots - 1;
            var built = (0, _threeShared.buildSoldierMesh)(isBoss ? 0x7f1d1d : 0xdc2626, isBoss ? 0xfacc15 : 0x450a0a, isBoss ? 0xfacc15 : 0xff6b6b, isBoss ? 1.45 : 1.0);
            built.group.position.set(bx, 0, bz);
            this.three.scene.add(built.group);
            var hp = isBoss ? 210 + this.level * 25 : 52 + this.level * 8;
            this.bots.push({
                id: i,
                mesh: built.group,
                x: bx,
                z: bz,
                hp: hp,
                maxHp: hp,
                shootCd: 1.0 + Math.random() * 1.4,
                isBoss: isBoss,
                isAlly: false,
                alive: true
            });
        }
    };
    _proto.spawnLoot = function spawnLoot() {
        var spots = [
            [
                -6,
                14,
                'ammo'
            ],
            [
                10,
                -8,
                'med'
            ],
            [
                -18,
                -8,
                'armor'
            ],
            [
                18,
                12,
                'ammo'
            ],
            [
                -24,
                16,
                'med'
            ],
            [
                4,
                -22,
                'armor'
            ],
            [
                30,
                -6,
                'med'
            ],
            [
                -32,
                -16,
                'ammo'
            ]
        ];
        for(var _iterator = _create_for_of_iterator_helper_loose(spots), _step; !(_step = _iterator()).done;){
            var _step_value = _step.value, lx = _step_value[0], lz = _step_value[1], kind = _step_value[2];
            this.createLootCrate(lx, 0, lz, kind);
        }
    };
    _proto.createLootCrate = function createLootCrate(lx, ly, lz, kind) {
        var g = new _three.Group();
        var isDrop = kind === 'airdrop';
        var col = isDrop ? 0xdc2626 : kind === 'med' ? 0x22c55e : kind === 'armor' ? 0x38bdf8 : 0xfacc15;
        var sz = isDrop ? 1.5 : 0.95;
        var box = new _three.Mesh(new _three.BoxGeometry(sz, isDrop ? 1.2 : 0.65, sz), new _three.MeshStandardMaterial({
            color: col,
            emissive: col,
            emissiveIntensity: 0.35,
            roughness: 0.35
        }));
        box.position.y = isDrop ? 0.6 : 0.42;
        g.add(box);
        var smoke;
        if (isDrop) {
            var cap = new _three.Mesh(new _three.BoxGeometry(sz + 0.1, 0.25, sz + 0.1), new _three.MeshStandardMaterial({
                color: 0x1d4ed8
            }));
            cap.position.y = 1.25;
            smoke = new _three.Mesh(new _three.CylinderGeometry(0.18, 0.48, 22, 8), new _three.MeshBasicMaterial({
                color: 0xef4444,
                transparent: true,
                opacity: 0.35,
                depthWrite: false
            }));
            smoke.position.y = 12;
            g.add(cap, smoke);
        }
        g.position.set(lx, ly, lz);
        this.three.scene.add(g);
        this.loot.push({
            mesh: g,
            smoke: smoke,
            x: lx,
            y: ly,
            z: lz,
            kind: kind,
            taken: false
        });
    };
    _proto.ejectFromPlane = function ejectFromPlane() {
        if (this.phase !== 'plane') return;
        this.phase = 'parachute';
        this.playerGroup.visible = true;
        this.chuteGroup.visible = true;
        this.px = this.planeGroup.position.x;
        this.pz = this.planeGroup.position.z;
        this.py = 38;
        (0, _runtimeBridge.setActionButtonLabel)('GLIDE');
        _audio.ArcadeAudio.play('dash');
        this.showToast('🪂 Parachute Open! Steer WASD/Arrows to landing zone');
    };
    _proto.switchWeapon = function switchWeapon(slotIdx) {
        var next = Math.max(0, Math.min(_arenaRoster.BR_WEAPONS.length - 1, slotIdx));
        if (next === this.activeSlot) return;
        this.activeSlot = next;
        this.reloadTimer = 0;
        this.scoped = false;
        _audio.ArcadeAudio.play('click');
        this.showToast("\uD83D\uDD2B Equipped " + this.curWeapon.name);
    };
    _proto.toggleVehicle = function toggleVehicle() {
        if (this.phase !== 'ground' || this.gameOver || this.isPaused) return;
        if (this.inVehicle) {
            this.inVehicle = false;
            this.buggySpeed = 0;
            this.px = this.buggyX + Math.cos(this.buggyYaw) * 2.2;
            this.pz = this.buggyZ - Math.sin(this.buggyYaw) * 2.2;
            this.playerGroup.visible = true;
            (0, _runtimeBridge.setActionButtonLabel)('FIRE');
            _audio.ArcadeAudio.play('click');
            this.showToast('🏃 Exited Military Buggy');
            return;
        }
        if (Math.hypot(this.px - this.buggyX, this.pz - this.buggyZ) < 6.2) {
            this.inVehicle = true;
            this.scoped = false;
            this.firing = false;
            this.playerGroup.visible = false;
            (0, _runtimeBridge.setActionButtonLabel)('BOOST');
            _audio.ArcadeAudio.play('gas');
            this.showToast('🚗 Driving Buggy! W/S Gas · A/D Steer · [F] Exit');
        } else {
            this.showToast('🚗 Move closer to Buggy to drive!');
        }
    };
    _proto.throwGrenade = function throwGrenade() {
        if (this.phase !== 'ground' || this.gameOver || this.isPaused || this.grenades <= 0) return;
        this.grenades--;
        _audio.ArcadeAudio.play('dash');
        var mesh = new _three.Mesh(new _three.SphereGeometry(0.24, 8, 8), new _three.MeshStandardMaterial({
            color: 0x365314,
            emissive: 0xef4444,
            emissiveIntensity: 0.4
        }));
        mesh.position.set(this.px, this.py + 1.5, this.pz);
        this.three.scene.add(mesh);
        this.nades.push({
            mesh: mesh,
            x: this.px,
            y: this.py + 1.5,
            z: this.pz,
            vx: Math.sin(this.yaw) * 19,
            vy: 6.5,
            vz: Math.cos(this.yaw) * 19,
            fuse: 1.05
        });
        this.showToast("\uD83D\uDCA3 Frag Out! (" + this.grenades + " left)");
    };
    _proto.launchFlareAirdrop = function launchFlareAirdrop() {
        if (this.phase !== 'ground' || this.gameOver || this.isPaused || this.flares <= 0) return;
        this.flares--;
        _audio.ArcadeAudio.play('jetpack');
        var dx = Math.max(-58, Math.min(58, this.px + Math.sin(this.yaw) * 12));
        var dz = Math.max(-58, Math.min(58, this.pz + Math.cos(this.yaw) * 12));
        this.createLootCrate(dx, 28, dz, 'airdrop');
        this.showToast('🚨 Flare Fired! Air-Drop Crate incoming!');
    };
    _proto.setMoveDir = function setMoveDir(dx, dy) {
        if (this.gameOver || this.isPaused) {
            this.moveX = 0;
            this.moveZ = 0;
            return;
        }
        this.moveX = dx;
        this.moveZ = dy;
    };
    _proto.setSteerLeft = function setSteerLeft(down) {
        this.moveX = down && !this.gameOver && !this.isPaused ? -1 : 0;
    };
    _proto.setSteerRight = function setSteerRight(down) {
        this.moveX = down && !this.gameOver && !this.isPaused ? 1 : 0;
    };
    _proto.jump = function jump() {
        if (this.gameOver || this.isPaused) return;
        if (this.phase === 'plane') {
            this.ejectFromPlane();
            return;
        }
        if (this.phase === 'ground' && !this.inVehicle && this.py <= 0.02) {
            this.pvy = 9.2;
            _audio.ArcadeAudio.play('jump');
        }
    };
    _proto.toggleScope = function toggleScope() {
        if (this.gameOver || this.isPaused || this.phase !== 'ground' || this.inVehicle) return;
        this.scoped = !this.scoped;
        _audio.ArcadeAudio.play('click');
    };
    _proto.reload = function reload() {
        if (this.gameOver || this.isPaused || this.phase !== 'ground') return;
        var cur = this.weaponMag[this.activeSlot];
        var res = this.weaponReserve[this.activeSlot];
        var w = this.curWeapon;
        if (this.reloadTimer <= 0 && cur < w.magSize && res > 0) {
            this.reloadTimer = w.reloadSec;
            _audio.ArcadeAudio.play('reload');
        }
    };
    _proto.useMedkit = function useMedkit() {
        if (this.gameOver || this.isPaused) return;
        if (this.medkits > 0 && this.lives < this.maxLives) {
            this.medkits--;
            this.lives = Math.min(this.maxLives, this.lives + 48);
            _audio.ArcadeAudio.play('match');
            (0, _runtimeBridge.updateHealthDisplay)(Math.round(this.lives), this.maxLives);
            this.showToast("\uD83E\uDE79 Used Medkit (+48 HP \xb7 " + this.medkits + " left)");
        }
    };
    _proto.triggerAction = function triggerAction(actionKey, pressed) {
        if (!pressed) {
            if (actionKey === 'fire' || actionKey === 'action') this.firing = false;
            else if (actionKey === 'moveUp' || actionKey === 'moveDown') this.moveZ = 0;
            return;
        }
        if (this.gameOver || this.isPaused) return;
        if (this.phase === 'plane' && (actionKey === 'fire' || actionKey === 'action' || actionKey === 'jump')) {
            this.ejectFromPlane();
            return;
        }
        if (actionKey === 'fire' || actionKey === 'action') this.firing = true;
        else if (actionKey === 'moveUp') this.moveZ = -1;
        else if (actionKey === 'moveDown') this.moveZ = 1;
        else if (actionKey === 'jump') this.jump();
        else if (actionKey === 'scope') this.toggleScope();
        else if (actionKey === 'reload') this.reload();
        else if (actionKey === 'heal') this.useMedkit();
        else if (actionKey === 'vehicle') this.toggleVehicle();
        else if (actionKey === 'swapWeapon') this.switchWeapon((this.activeSlot + 1) % _arenaRoster.BR_WEAPONS.length);
        else if (actionKey === 'grenade') this.throwGrenade();
        else if (actionKey === 'flare') this.launchFlareAirdrop();
    };
    _proto.firePlayerShot = function firePlayerShot() {
        if (this.phase !== 'ground' || this.inVehicle || this.reloadTimer > 0) return;
        var w = this.curWeapon;
        if (this.weaponMag[this.activeSlot] <= 0) {
            this.reload();
            return;
        }
        this.weaponMag[this.activeSlot]--;
        this.fireCd = w.fireCd;
        _audio.ArcadeAudio.play('shoot');
        this.muzzleObj.getWorldPosition(_rayOrigin);
        var baseDirX = Math.sin(this.yaw);
        var baseDirZ = Math.cos(this.yaw);
        var baseDirY = -this.pitch * 0.65;
        for(var p = 0; p < w.pellets; p++){
            var spX = (Math.random() - 0.5) * w.spread;
            var spY = (Math.random() - 0.5) * w.spread;
            var dx = baseDirX + spX;
            var dy = baseDirY + spY * 0.5;
            var dz = baseDirZ - spX * 0.4;
            var len = Math.hypot(dx, dy, dz) || 1;
            var mesh = new _three.Mesh(this.bulletGeo, this.playerBulletMat);
            mesh.position.copy(_rayOrigin);
            this.three.scene.add(mesh);
            this.bullets.push({
                mesh: mesh,
                x: _rayOrigin.x,
                y: _rayOrigin.y,
                z: _rayOrigin.z,
                vx: dx / len * w.bulletSpeed,
                vy: dy / len * w.bulletSpeed,
                vz: dz / len * w.bulletSpeed,
                fromAlly: true,
                dmg: w.dmg,
                life: w.rangeLife
            });
        }
        if (this.weaponMag[this.activeSlot] === 0) this.reload();
    };
    _proto.resolveCoverCollision = function resolveCoverCollision(x, z, radius) {
        var nx = x;
        var nz = z;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.covers), _step; !(_step = _iterator()).done;){
            var c = _step.value;
            var dx = nx - c.x;
            var dz = nz - c.z;
            var ox = c.hw + radius - Math.abs(dx);
            var oz = c.hd + radius - Math.abs(dz);
            if (ox > 0 && oz > 0) {
                if (ox < oz) nx += dx >= 0 ? ox : -ox;
                else nz += dz >= 0 ? oz : -oz;
            }
        }
        var maxR = 82;
        var d = Math.hypot(nx, nz);
        if (d > maxR) {
            nx = nx / d * maxR;
            nz = nz / d * maxR;
        }
        return {
            x: nx,
            z: nz
        };
    };
    _proto.killEnemyBot = function killEnemyBot(b, scorePts, coinAmt) {
        b.alive = false;
        b.mesh.visible = false;
        this.kills++;
        _storage.playerState.brKills++;
        this.aliveCount = Math.max(1, this.aliveCount - 1);
        this.score += scorePts;
        (0, _runtimeBridge.addCoins)(coinAmt);
        (0, _runtimeBridge.addXp)(b.isBoss ? 40 : 15);
        _audio.ArcadeAudio.play('explosion');
        (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
        var enemiesLeft = this.bots.filter(function(u) {
            return u.alive && !u.isAlly;
        }).length;
        if (enemiesLeft <= 0) {
            this.score += 550;
            (0, _runtimeBridge.addCoins)(55);
            _storage.playerState.brWins++;
            (0, _storage.persistBrStats)();
            _audio.ArcadeAudio.play('levelup');
            this.endMatch(true);
        } else {
            (0, _storage.persistBrStats)();
        }
    };
    _proto.updateSimulation = function updateSimulation(dt) {
        this.elapsed += dt;
        if (this.toastTimer > 0) this.toastTimer = Math.max(0, this.toastTimer - dt);
        if (this.hitMarkerTimer > 0) this.hitMarkerTimer = Math.max(0, this.hitMarkerTimer - dt);
        if (this.fireCd > 0) this.fireCd -= dt;
        if (this.roadkillCd > 0) this.roadkillCd -= dt;
        // 1. C-130 Cargo Plane flight
        if (this.phase === 'plane') {
            this.planeT += dt * 0.14;
            this.planeGroup.position.lerpVectors(this.planeStart, this.planeEnd, Math.min(1, this.planeT));
            this.px = this.planeGroup.position.x;
            this.py = this.planeGroup.position.y;
            this.pz = this.planeGroup.position.z;
            _camDesired.set(this.px - 12, this.py + 5.5, this.pz - 12);
            this.three.camera.position.lerp(_camDesired, 1 - Math.exp(-8 * dt));
            _camTarget.set(this.px + 6, this.py - 2, this.pz + 6);
            this.three.camera.lookAt(_camTarget);
            if (this.planeT >= 0.62) {
                this.ejectFromPlane();
            }
            return;
        }
        // Plane fades off once past map
        if (this.planeT < 1.15) {
            this.planeT += dt * 0.12;
            this.planeGroup.position.lerpVectors(this.planeStart, this.planeEnd, Math.min(1.15, this.planeT));
        } else {
            this.planeGroup.visible = false;
        }
        // 2. Parachute drop steering
        if (this.phase === 'parachute') {
            var fwdX = Math.sin(this.yaw);
            var fwdZ = Math.cos(this.yaw);
            var rightX = -Math.cos(this.yaw);
            var rightZ = Math.sin(this.yaw);
            var glideSpd = 17.5 * dt;
            this.px = Math.max(-68, Math.min(68, this.px + (fwdX * -this.moveZ + rightX * this.moveX) * glideSpd));
            this.pz = Math.max(-68, Math.min(68, this.pz + (fwdZ * -this.moveZ + rightZ * this.moveX) * glideSpd));
            this.py -= 7.8 * dt;
            this.playerGroup.position.set(this.px, Math.max(0, this.py), this.pz);
            this.playerGroup.rotation.y = this.yaw;
            if (this.py <= 0.05) {
                this.py = 0;
                this.chuteGroup.visible = false;
                this.phase = 'ground';
                (0, _runtimeBridge.setActionButtonLabel)('FIRE');
                _audio.ArcadeAudio.play('click');
                this.showToast('⚔️ Touchdown! Loot weapons, find Buggy [F], survive!');
            }
            _camDesired.set(this.px - Math.sin(this.yaw) * 8.5, this.py + 4.8, this.pz - Math.cos(this.yaw) * 8.5);
            this.three.camera.position.lerp(_camDesired, 1 - Math.exp(-10 * dt));
            _camTarget.set(this.px, this.py + 1.5, this.pz);
            this.three.camera.lookAt(_camTarget);
            return;
        }
        // Reloading
        if (this.reloadTimer > 0) {
            this.reloadTimer -= dt;
            if (this.reloadTimer <= 0) {
                var w = this.curWeapon;
                var needed = Math.min(w.magSize - this.weaponMag[this.activeSlot], this.weaponReserve[this.activeSlot]);
                this.weaponMag[this.activeSlot] += needed;
                this.weaponReserve[this.activeSlot] -= needed;
            }
        }
        // 3. Player or Buggy locomotion
        if (this.inVehicle) {
            var throttle = -this.moveZ;
            var steer = -this.moveX;
            if (throttle > 0.1) this.buggySpeed = Math.min(24, this.buggySpeed + 20 * dt);
            else if (throttle < -0.1) this.buggySpeed = Math.max(-10, this.buggySpeed - 18 * dt);
            else this.buggySpeed *= Math.pow(0.25, dt);
            if (Math.abs(this.buggySpeed) > 0.5) {
                this.buggyYaw += steer * 2.1 * Math.sign(this.buggySpeed) * dt;
            }
            var nPos = this.resolveCoverCollision(this.buggyX + Math.sin(this.buggyYaw) * this.buggySpeed * dt, this.buggyZ + Math.cos(this.buggyYaw) * this.buggySpeed * dt, 1.5);
            this.buggyX = nPos.x;
            this.buggyZ = nPos.z;
            this.px = this.buggyX;
            this.pz = this.buggyZ;
            this.yaw = this.buggyYaw;
            this.buggyGroup.position.set(this.buggyX, 0, this.buggyZ);
            this.buggyGroup.rotation.y = this.buggyYaw;
            for(var _iterator = _create_for_of_iterator_helper_loose(this.buggyWheels), _step; !(_step = _iterator()).done;){
                var wMesh = _step.value;
                wMesh.rotation.x += this.buggySpeed * dt * 1.4;
            }
            if (Math.abs(this.buggySpeed) > 9 && this.roadkillCd <= 0) {
                for(var _iterator1 = _create_for_of_iterator_helper_loose(this.bots), _step1; !(_step1 = _iterator1()).done;){
                    var b = _step1.value;
                    if (!b.alive || b.isAlly) continue;
                    if (Math.hypot(b.x - this.buggyX, b.z - this.buggyZ) < 2.5) {
                        this.roadkillCd = 0.35;
                        b.hp -= 75;
                        this.showToast('🚗 ROADKILL HIT!');
                        if (b.hp <= 0) {
                            this.killEnemyBot(b, b.isBoss ? 320 : 120, b.isBoss ? 25 : 10);
                            if (this.gameOver) return;
                        }
                    }
                }
            }
        } else {
            var fwdX1 = Math.sin(this.yaw);
            var fwdZ1 = Math.cos(this.yaw);
            var rightX1 = -Math.cos(this.yaw);
            var rightZ1 = Math.sin(this.yaw);
            var spd = (this.scoped ? 6.2 : 11.8) * dt;
            var vx = (fwdX1 * -this.moveZ + rightX1 * this.moveX) * spd;
            var vz = (fwdZ1 * -this.moveZ + rightZ1 * this.moveX) * spd;
            var next = this.resolveCoverCollision(this.px + vx, this.pz + vz, 0.7);
            this.px = next.x;
            this.pz = next.z;
            if (this.py > 0 || this.pvy !== 0) {
                this.py += this.pvy * dt;
                this.pvy -= 24 * dt;
                if (this.py <= 0) {
                    this.py = 0;
                    this.pvy = 0;
                }
            }
            this.playerGroup.position.set(this.px, this.py, this.pz);
            this.playerGroup.rotation.y = this.yaw;
            if (this.firing && this.fireCd <= 0) {
                this.firePlayerShot();
            }
        }
        // Periodic Airdrops
        this.airdropTimer -= dt;
        if (this.airdropTimer <= 0) {
            this.airdropTimer = 26;
            var dropR = Math.min(this.stormRadius * 0.55, 28);
            var ang = Math.random() * Math.PI * 2;
            this.createLootCrate(Math.cos(ang) * dropR, 30, Math.sin(ang) * dropR, 'airdrop');
            this.showToast('🪂 Supply Airdrop Incoming! Follow Red Smoke');
        }
        // Loot + falling Airdrop crates
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.loot), _step2; !(_step2 = _iterator2()).done;){
            var l = _step2.value;
            if (l.taken) continue;
            if (l.y > 0) {
                l.y = Math.max(0, l.y - 6.5 * dt);
                l.mesh.position.y = l.y;
            }
            l.mesh.rotation.y += dt * 1.8;
            if (l.y <= 0.2 && Math.hypot(l.x - this.px, l.z - this.pz) < 2.2) {
                l.taken = true;
                l.mesh.visible = false;
                _audio.ArcadeAudio.play('coin');
                if (l.kind === 'airdrop') {
                    this.armor = Math.min(100, this.armor + 55);
                    this.medkits += 2;
                    this.weaponReserve[3] += 10;
                    this.weaponReserve[0] += 60;
                    this.score += 150;
                    (0, _runtimeBridge.addCoins)(12);
                    this.showToast('🎁 Airdrop Looted: Lv.3 Armor + AWM Ammo!');
                } else if (l.kind === 'med') {
                    this.medkits++;
                } else if (l.kind === 'armor') {
                    this.armor = Math.min(100, this.armor + 40);
                } else {
                    this.weaponReserve[0] += 60;
                    this.weaponReserve[1] += 60;
                    this.weaponReserve[2] += 12;
                }
                this.score += 20;
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
            }
        }
        // Shrinking Storm Zone
        this.stormRadius = Math.max(12, this.stormRadius - this.stormShrinkRate * dt);
        this.stormMesh.scale.set(this.stormRadius, 1, this.stormRadius);
        if (Math.hypot(this.px, this.pz) > this.stormRadius) {
            this.stormDmgTick += dt;
            if (this.stormDmgTick >= 0.65) {
                this.stormDmgTick = 0;
                this.damagePlayer(6);
                if (this.gameOver) return;
            }
        }
        // Grenades
        for(var i = this.nades.length - 1; i >= 0; i--){
            var g = this.nades[i];
            g.fuse -= dt;
            g.vy -= 18 * dt;
            g.x += g.vx * dt;
            g.y += g.vy * dt;
            g.z += g.vz * dt;
            if (g.y < 0.2) {
                g.y = 0.2;
                g.vy *= -0.35;
                g.vx *= 0.6;
                g.vz *= 0.6;
            }
            g.mesh.position.set(g.x, g.y, g.z);
            if (g.fuse <= 0) {
                _audio.ArcadeAudio.play('explosion');
                var boom = new _three.Mesh(new _three.RingGeometry(1.5, 8.5, 24), new _three.MeshBasicMaterial({
                    color: 0xf97316,
                    side: _three.DoubleSide,
                    transparent: true,
                    opacity: 0.85
                }));
                boom.rotation.x = -Math.PI / 2;
                boom.position.set(g.x, 0.25, g.z);
                this.three.scene.add(boom);
                this.fxRings.push({
                    mesh: boom,
                    life: 0.35
                });
                for(var _iterator3 = _create_for_of_iterator_helper_loose(this.bots), _step3; !(_step3 = _iterator3()).done;){
                    var b1 = _step3.value;
                    if (!b1.alive || b1.isAlly) continue;
                    var d = Math.hypot(b1.x - g.x, b1.z - g.z);
                    if (d < 9.0) {
                        b1.hp -= Math.round(135 * (1 - d / 11));
                        if (b1.hp <= 0) {
                            this.killEnemyBot(b1, b1.isBoss ? 300 : 110, b1.isBoss ? 25 : 8);
                            if (this.gameOver) return;
                        }
                    }
                }
                this.three.scene.remove(g.mesh);
                g.mesh.geometry.dispose();
                g.mesh.material.dispose();
                this.nades.splice(i, 1);
            }
        }
        // FX Rings
        for(var i1 = this.fxRings.length - 1; i1 >= 0; i1--){
            var fx = this.fxRings[i1];
            fx.life -= dt;
            fx.mesh.scale.addScalar(dt * 2.5);
            if (fx.life <= 0) {
                this.three.scene.remove(fx.mesh);
                fx.mesh.geometry.dispose();
                fx.mesh.material.dispose();
                this.fxRings.splice(i1, 1);
            }
        }
        // Bots + Wingman AI
        for(var _iterator4 = _create_for_of_iterator_helper_loose(this.bots), _step4; !(_step4 = _iterator4()).done;){
            var b2 = _step4.value;
            if (!b2.alive) continue;
            if (b2.isAlly) {
                // Follow player & target nearest enemy bot
                var nearEnemy = null;
                var nearDist = 34;
                for(var _iterator5 = _create_for_of_iterator_helper_loose(this.bots), _step5; !(_step5 = _iterator5()).done;){
                    var e = _step5.value;
                    if (!e.alive || e.isAlly) continue;
                    var d1 = Math.hypot(e.x - b2.x, e.z - b2.z);
                    if (d1 < nearDist) {
                        nearDist = d1;
                        nearEnemy = e;
                    }
                }
                var tx = Math.hypot(this.px - b2.x, this.pz - b2.z) > 10 ? this.px - 2.5 : b2.x;
                var tz = Math.hypot(this.px - b2.x, this.pz - b2.z) > 10 ? this.pz - 2.5 : b2.z;
                var mdx = tx - b2.x;
                var mdz = tz - b2.z;
                var md = Math.hypot(mdx, mdz) || 1;
                if (md > 1.5) {
                    var next1 = this.resolveCoverCollision(b2.x + mdx / md * 8.5 * dt, b2.z + mdz / md * 8.5 * dt, 0.75);
                    b2.x = next1.x;
                    b2.z = next1.z;
                    b2.mesh.position.set(b2.x, 0, b2.z);
                }
                b2.shootCd -= dt;
                if (nearEnemy) {
                    b2.mesh.rotation.y = Math.atan2(nearEnemy.x - b2.x, nearEnemy.z - b2.z);
                    if (b2.shootCd <= 0) {
                        b2.shootCd = 0.45;
                        var ang1 = Math.atan2(nearEnemy.x - b2.x, nearEnemy.z - b2.z);
                        var m = new _three.Mesh(this.bulletGeo, this.playerBulletMat);
                        m.position.set(b2.x, 1.35, b2.z);
                        this.three.scene.add(m);
                        this.bullets.push({
                            mesh: m,
                            x: b2.x,
                            y: 1.35,
                            z: b2.z,
                            vx: Math.sin(ang1) * 52,
                            vy: 0,
                            vz: Math.cos(ang1) * 52,
                            fromAlly: true,
                            dmg: 22,
                            life: 1.1
                        });
                    }
                }
                continue;
            }
            var dx = this.px - b2.x;
            var dz = this.pz - b2.z;
            var dist = Math.hypot(dx, dz) || 1;
            var toStormCenter = Math.hypot(b2.x, b2.z);
            var mx = 0;
            var mz = 0;
            if (toStormCenter > this.stormRadius - 4) {
                mx = -b2.x / (toStormCenter || 1);
                mz = -b2.z / (toStormCenter || 1);
            } else if (dist > 14 && dist < 46) {
                mx = dx / dist;
                mz = dz / dist;
            } else {
                mx = Math.sin(this.elapsed + b2.id) * 0.6;
                mz = Math.cos(this.elapsed + b2.id) * 0.6;
            }
            var bSpeed = (b2.isBoss ? 5.6 : 4.2) * this.scaler.speedMult * dt;
            var bn = this.resolveCoverCollision(b2.x + mx * bSpeed, b2.z + mz * bSpeed, 0.75);
            b2.x = bn.x;
            b2.z = bn.z;
            b2.mesh.position.set(b2.x, 0, b2.z);
            b2.mesh.rotation.y = Math.atan2(dx, dz);
            b2.shootCd -= dt;
            if (b2.shootCd <= 0 && dist < 38) {
                b2.shootCd = (b2.isBoss ? 0.68 : 1.25) / this.scaler.speedMult;
                var m1 = new _three.Mesh(this.bulletGeo, this.enemyBulletMat);
                m1.position.set(b2.x, 1.35, b2.z);
                this.three.scene.add(m1);
                var spread = (Math.random() - 0.5) * 0.14;
                var ang2 = Math.atan2(dx, dz) + spread;
                this.bullets.push({
                    mesh: m1,
                    x: b2.x,
                    y: 1.35,
                    z: b2.z,
                    vx: Math.sin(ang2) * 38,
                    vy: 0,
                    vz: Math.cos(ang2) * 38,
                    fromAlly: false,
                    dmg: b2.isBoss ? 14 : 8,
                    life: 1.6
                });
            }
        }
        // Bullets update
        for(var i2 = this.bullets.length - 1; i2 >= 0; i2--){
            var p = this.bullets[i2];
            p.life -= dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.z += p.vz * dt;
            p.mesh.position.set(p.x, p.y, p.z);
            var dead = p.life <= 0 || p.y < 0.05;
            if (!dead) {
                for(var _iterator6 = _create_for_of_iterator_helper_loose(this.covers), _step6; !(_step6 = _iterator6()).done;){
                    var c = _step6.value;
                    if (Math.abs(p.x - c.x) < c.hw && Math.abs(p.z - c.z) < c.hd && p.y <= c.h) {
                        dead = true;
                        break;
                    }
                }
            }
            if (!dead && p.fromAlly) {
                for(var _iterator7 = _create_for_of_iterator_helper_loose(this.bots), _step7; !(_step7 = _iterator7()).done;){
                    var b3 = _step7.value;
                    if (!b3.alive || b3.isAlly) continue;
                    var hitRad = b3.isBoss ? 1.35 : 0.98;
                    if (Math.hypot(p.x - b3.x, p.z - b3.z) < hitRad && p.y >= 0 && p.y <= 2.4) {
                        dead = true;
                        this.hitMarkerTimer = 0.14;
                        b3.hp -= p.dmg;
                        if (b3.hp <= 0) {
                            this.killEnemyBot(b3, b3.isBoss ? 300 : 100, b3.isBoss ? 25 : 8);
                            if (this.gameOver) return;
                        } else {
                            _audio.ArcadeAudio.play('hit');
                        }
                        break;
                    }
                }
            } else if (!dead && !p.fromAlly) {
                if (Math.hypot(p.x - this.px, p.z - this.pz) < (this.inVehicle ? 1.3 : 0.85) && Math.abs(p.y - (this.py + 1.1)) < 1.1) {
                    dead = true;
                    this.damagePlayer(this.inVehicle ? Math.round(p.dmg * 0.5) : p.dmg);
                    if (this.gameOver) return;
                }
            }
            if (dead) {
                this.three.scene.remove(p.mesh);
                this.bullets.splice(i2, 1);
            }
        }
        // Camera follow (Normal / Scope / Vehicle)
        var targetFov = this.inVehicle ? 68 : this.scoped ? this.curWeapon.scopeFov : 62;
        var nextFov = _three.MathUtils.damp(this.three.camera.fov, targetFov, 12, dt);
        if (Math.abs(nextFov - this.three.camera.fov) > 0.02) {
            this.three.camera.fov = nextFov;
            this.three.camera.updateProjectionMatrix();
        }
        var camBack = this.inVehicle ? 8.2 : this.scoped ? 1.55 : 4.8;
        var camRight = this.inVehicle ? 0 : this.scoped ? 0.52 : 0.85;
        _camDesired.set(this.px - Math.sin(this.yaw) * camBack - Math.cos(this.yaw) * camRight, this.py + (this.inVehicle ? 4.2 : this.scoped ? 1.92 : 2.65) + this.pitch * 1.4, this.pz - Math.cos(this.yaw) * camBack + Math.sin(this.yaw) * camRight);
        this.three.camera.position.lerp(_camDesired, 1 - Math.exp(-14 * dt));
        _camTarget.set(this.px + Math.sin(this.yaw) * 18, this.py + 1.45 - this.pitch * 6, this.pz + Math.cos(this.yaw) * 18);
        this.three.camera.lookAt(_camTarget);
    };
    _proto.damagePlayer = function damagePlayer(dmg) {
        var rem = dmg;
        if (this.armor > 0) {
            var absorbed = Math.min(this.armor, Math.round(dmg * 0.55));
            this.armor -= absorbed;
            rem -= absorbed;
        }
        this.lives = Math.max(0, Math.round(this.lives - rem));
        _audio.ArcadeAudio.play('hurt');
        (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        if (this.lives <= 0) {
            this.endMatch(false);
        }
    };
    _proto.endMatch = function endMatch(victory) {
        if (this.gameOver) return;
        this.gameOver = true;
        this.isRunning = false;
        (0, _runtimeBridge.triggerGameOver)(this.score, _storage.playerState.sessionCoins, this.level, this.gameIdx, victory);
    };
    _proto.drawOverlayHud = function drawOverlayHud() {
        var ctx = this.three.overlayCtx;
        if (!ctx) return;
        var w = this.three.width;
        var h = this.three.height;
        ctx.clearRect(0, 0, w, h);
        var cx = w / 2;
        var cy = h / 2;
        if (this.phase === 'ground' && !this.inVehicle) {
            if (this.scoped && this.curWeapon.id === 'awm') {
                // 4x Sniper Scope Reticle
                ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
                ctx.lineWidth = Math.max(24, w * 0.08);
                ctx.beginPath();
                ctx.arc(cx, cy, Math.min(w, h) * 0.42, 0, Math.PI * 2);
                ctx.stroke();
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(cx - 120, cy);
                ctx.lineTo(cx + 120, cy);
                ctx.moveTo(cx, cy - 120);
                ctx.lineTo(cx, cy + 120);
                ctx.stroke();
            } else {
                ctx.strokeStyle = this.scoped ? '#38bdf8' : 'rgba(255,255,255,0.85)';
                ctx.lineWidth = 2;
                var gap = this.scoped ? 4 : 8;
                var arm = this.scoped ? 14 : 9;
                ctx.beginPath();
                ctx.moveTo(cx - gap - arm, cy);
                ctx.lineTo(cx - gap, cy);
                ctx.moveTo(cx + gap, cy);
                ctx.lineTo(cx + gap + arm, cy);
                ctx.moveTo(cx, cy - gap - arm);
                ctx.lineTo(cx, cy - gap);
                ctx.moveTo(cx, cy + gap);
                ctx.lineTo(cx, cy + gap + arm);
                ctx.stroke();
            }
            if (this.hitMarkerTimer > 0) {
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(cx - 10, cy - 10);
                ctx.lineTo(cx - 4, cy - 4);
                ctx.moveTo(cx + 10, cy - 10);
                ctx.lineTo(cx + 4, cy - 4);
                ctx.moveTo(cx - 10, cy + 10);
                ctx.lineTo(cx - 4, cy + 4);
                ctx.moveTo(cx + 10, cy + 10);
                ctx.lineTo(cx + 4, cy + 4);
                ctx.stroke();
            }
        }
        // Radar Minimap with Buggy & Airdrop pings
        var compactLandscape = w > h * 1.3 && h < 480;
        var mapSize = w < 460 || compactLandscape ? 72 : 94;
        var mx = w - mapSize - 12;
        var my = compactLandscape ? 48 : 58;
        ctx.fillStyle = 'rgba(10, 18, 28, 0.8)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mx + mapSize / 2, my + mapSize / 2, mapSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        var scale = mapSize * 0.45 / 84;
        var midX = mx + mapSize / 2;
        var midY = my + mapSize / 2;
        ctx.strokeStyle = 'rgba(56,189,248,0.85)';
        ctx.beginPath();
        ctx.arc(midX, midY, this.stormRadius * scale, 0, Math.PI * 2);
        ctx.stroke();
        // Buggy green dot on minimap
        ctx.fillStyle = '#facc15';
        ctx.fillRect(midX + this.buggyX * scale - 2.5, midY + this.buggyZ * scale - 2.5, 5, 5);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.loot), _step; !(_step = _iterator()).done;){
            var l = _step.value;
            if (!l.taken && l.kind === 'airdrop') {
                ctx.fillStyle = '#f97316';
                ctx.fillRect(midX + l.x * scale - 3, midY + l.z * scale - 3, 6, 6);
            }
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.bots), _step1; !(_step1 = _iterator1()).done;){
            var b = _step1.value;
            if (!b.alive) continue;
            ctx.fillStyle = b.isAlly ? '#38bdf8' : b.isBoss ? '#facc15' : '#ef4444';
            ctx.fillRect(midX + b.x * scale - 2, midY + b.z * scale - 2, b.isBoss ? 5 : 3.5, b.isBoss ? 5 : 3.5);
        }
        ctx.fillStyle = '#84fab0';
        ctx.beginPath();
        ctx.arc(midX + this.px * scale, midY + this.pz * scale, 4, 0, Math.PI * 2);
        ctx.fill();
        // Top-center Status Badge
        var pillW = Math.min(w - (compactLandscape ? 160 : 20), 290);
        var pillX = cx - pillW / 2;
        var pillY = w < 560 ? 52 : compactLandscape ? 42 : 12;
        ctx.fillStyle = 'rgba(10,16,26,0.82)';
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, 30, 10);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '800 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        var mag = this.weaponMag[this.activeSlot];
        var res = this.weaponReserve[this.activeSlot];
        var ammoTxt = this.reloadTimer > 0 ? 'RELOADING...' : mag + "/" + res;
        var buggyDist = Math.hypot(this.px - this.buggyX, this.pz - this.buggyZ);
        var hintTag = this.inVehicle ? '🚗[F]Exit' : buggyDist < 6.2 ? '🚗[F]Drive' : "\uD83D\uDEA8" + this.flares + " \uD83D\uDCA3" + this.grenades;
        ctx.fillText("\uD83D\uDC65" + this.aliveCount + " \xb7 \uD83D\uDC80" + this.kills + " \xb7 " + this.curWeapon.shortName + " " + ammoTxt + " \xb7 \uD83D\uDEE1️" + this.armor + " \xb7 " + hintTag, cx, pillY + 19);
        // Toast Notification (Drop prompt / Roadkill / Airdrop)
        if (this.toastTimer > 0 && this.toastText) {
            var toastY = pillY + 36;
            ctx.fillStyle = 'rgba(12, 17, 28, 0.88)';
            var tw = Math.min(w - 28, 360);
            ctx.beginPath();
            ctx.roundRect(cx - tw / 2, toastY, tw, 28, 10);
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = '#fef08a';
            ctx.font = '800 11px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.toastText, cx, toastY + 18);
        }
        // 4-Weapon Bottom Strip (clickable on desktop/tablet)
        if (this.phase === 'ground' && w >= 520) {
            var slotW = 76;
            var startX = cx - slotW * 2;
            var barY = h - 54;
            for(var i = 0; i < _arenaRoster.BR_WEAPONS.length; i++){
                var wd = _arenaRoster.BR_WEAPONS[i];
                var active = i === this.activeSlot;
                ctx.fillStyle = active ? 'rgba(245, 158, 11, 0.92)' : 'rgba(15, 23, 42, 0.8)';
                ctx.beginPath();
                ctx.roundRect(startX + i * slotW + 2, barY, slotW - 4, 38, 8);
                ctx.fill();
                ctx.strokeStyle = active ? '#fef08a' : 'rgba(255,255,255,0.22)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.fillStyle = active ? '#0f172a' : '#f8fafc';
                ctx.font = '900 10px system-ui, sans-serif';
                ctx.fillText("[" + wd.slot + "] " + wd.shortName, startX + i * slotW + slotW / 2, barY + 16);
                ctx.font = '700 9px system-ui, sans-serif';
                ctx.fillText(this.weaponMag[i] + "/" + this.weaponReserve[i], startX + i * slotW + slotW / 2, barY + 30);
            }
        }
        ctx.textAlign = 'left';
    };
    _create_class(BattleRoyale3D, [
        {
            key: "curWeapon",
            get: function get() {
                var _BR_WEAPONS_this_activeSlot;
                return (_BR_WEAPONS_this_activeSlot = _arenaRoster.BR_WEAPONS[this.activeSlot]) != null ? _BR_WEAPONS_this_activeSlot : _arenaRoster.BR_WEAPONS[0];
            }
        }
    ]);
    return BattleRoyale3D;
}();

});

})(window.ArcadeMod);
