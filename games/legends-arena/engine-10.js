(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/engine/ThreeBattlefieldRenderer ===
ArcadeMod.define("src/games/legends-arena/mlbb/engine/ThreeBattlefieldRenderer", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ThreeBattlefieldRenderer", {
    enumerable: true,
    get: function() {
        return ThreeBattlefieldRenderer;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _RoomEnvironment = require("three/examples/jsm/environments/RoomEnvironment.js");
var _threeShared = require("../../../../core/threeShared");
var _BattlefieldSystems = require("./BattlefieldSystems");
var _CombatMath = require("./CombatMath");
var _ThreeHeroModels = require("./ThreeHeroModels");
var _ThreeMapBuilder = require("./ThreeMapBuilder");
var _VfxSystem = require("./VfxSystem");
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
var THEME_SUNLIT_ATMOSPHERE = {
    imperial_sanctuary: {
        sky: 0x7cc4fa,
        fog: 0xcbe8ff,
        key: 0xfff5d6,
        keyInt: 2.25,
        hemiSky: 0xbae6fd,
        hemiGround: 0x22663a
    },
    western_expanse: {
        sky: 0x7dd3fc,
        fog: 0xfdecc8,
        key: 0xffe4a8,
        keyInt: 2.35,
        hemiSky: 0xfef3c7,
        hemiGround: 0x856436
    },
    celestial_palace: {
        sky: 0x60a5fa,
        fog: 0xdbeafe,
        key: 0xfffbeb,
        keyInt: 2.3,
        hemiSky: 0xe0f2fe,
        hemiGround: 0x336b75
    },
    sanctum_island: {
        sky: 0x38bdf8,
        fog: 0xccfbf1,
        key: 0xfefce8,
        keyInt: 2.2,
        hemiSky: 0xdcfce7,
        hemiGround: 0x1e6b52
    },
    harmonic_sanctuary: {
        sky: 0x272359,
        fog: 0x3f3775,
        key: 0xfde68a,
        keyInt: 1.85,
        hemiSky: 0xc4b5fd,
        hemiGround: 0x1e3a42
    }
};
var ThreeBattlefieldRenderer = /*#__PURE__*/ function() {
    "use strict";
    function ThreeBattlefieldRenderer(container) {
        var _this = this;
        this.envTexture = null;
        this.resizeObserver = null;
        this.mapHandle = null;
        this.builtTheme = null;
        this.builtVariant = null;
        this.builtBrawl = false;
        this.builtExpLane = 'top';
        this.heroRigs = new Map();
        this.turretRigs = new Map();
        this.jungleRigs = new Map();
        this.minionRigs = new Map();
        this.brawlShrineRigs = new Map();
        this.walkieRigs = new Map();
        this.dynamicGroup = new _three.Group();
        // Shared geometries for volumetric 3D VFX
        this.projGeo = new _three.SphereGeometry(0.48, 10, 8);
        this.haloGeo = new _three.SphereGeometry(0.78, 10, 8);
        this.ringGeo = new _three.RingGeometry(0.8, 1.0, 28);
        this.domeGeo = new _three.SphereGeometry(1.0, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
        this.slashGeo = new _three.TorusGeometry(1.0, 0.16, 6, 18, Math.PI * 0.85);
        this.coinGeo = new _three.CylinderGeometry(0.32, 0.32, 0.1, 10);
        this.aimGroup = new _three.Group();
        this.width = 0;
        this.height = 0;
        this.disposed = false;
        this.contextLost = false;
        this.smoothCamX = null;
        this.smoothCamZ = null;
        this.lastRenderMs = 0;
        this.tmpVec = new _three.Vector3();
        this.bushDummy = new _three.Object3D();
        this.onContextLost = function(e) {
            e.preventDefault();
            _this.contextLost = true;
        };
        this.onContextRestored = function() {
            _this.contextLost = false;
        };
        this.container = container;
        this.isSoftwareGl = (0, _threeShared.detectSoftwareWebGL)();
        this.renderer = new _three.WebGLRenderer({
            antialias: !this.isSoftwareGl,
            powerPreference: 'high-performance',
            alpha: false
        });
        this.renderer.outputColorSpace = _three.SRGBColorSpace;
        this.renderer.toneMapping = _three.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.12;
        this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.shadowMap.enabled = !this.isSoftwareGl;
        this.renderer.shadowMap.type = _three.PCFSoftShadowMap;
        this.renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';
        this.overlayCanvas = document.createElement('canvas');
        this.overlayCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:2;';
        this.overlayCtx = this.overlayCanvas.getContext('2d');
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
        this.container.appendChild(this.overlayCanvas);
        this.scene = new _three.Scene();
        this.scene.background = new _three.Color(0x7cc4fa);
        this.scene.fog = new _three.Fog(0xcbe8ff, 78, 265);
        // Safe isolated PMREM studio reflection setup (never fails WebGL boot on older mobile GPUs)
        try {
            var pmrem = new _three.PMREMGenerator(this.renderer);
            var roomEnv = new _RoomEnvironment.RoomEnvironment();
            this.envTexture = pmrem.fromScene(roomEnv, 0.04).texture;
            roomEnv.dispose();
            pmrem.dispose();
            this.scene.environment = this.envTexture;
        } catch (unused) {
            this.envTexture = null;
        }
        this.camera = new _three.PerspectiveCamera(46, 16 / 9, 0.5, 420);
        // Vibrant Bright Sunlit 3-Point MLBB Lighting Rig
        this.hemiLight = new _three.HemisphereLight(0xbae6fd, 0x22663a, 1.15);
        this.scene.add(this.hemiLight);
        this.keyLight = new _three.DirectionalLight(0xfff5d6, 2.25);
        this.keyLight.position.set(34, 58, 28);
        if (!this.isSoftwareGl) {
            this.keyLight.castShadow = true;
            this.keyLight.shadow.mapSize.set(1024, 1024);
            var d = 44;
            this.keyLight.shadow.camera.left = -d;
            this.keyLight.shadow.camera.right = d;
            this.keyLight.shadow.camera.top = d;
            this.keyLight.shadow.camera.bottom = -d;
            this.keyLight.shadow.camera.near = 6;
            this.keyLight.shadow.camera.far = 165;
            this.keyLight.shadow.bias = -0.0005;
            this.keyLight.shadow.normalBias = 0.02;
        }
        this.scene.add(this.keyLight);
        this.scene.add(this.keyLight.target);
        this.rimLight = new _three.DirectionalLight(0x93c5fd, 0.62);
        this.rimLight.position.set(-30, 26, -34);
        this.scene.add(this.rimLight);
        this.scene.add(this.dynamicGroup);
        // Skill Aiming 3D Ground Telegraph Group
        this.aimRangeRing = new _three.Mesh(new _three.RingGeometry(0.95, 1.0, 48), new _three.MeshBasicMaterial({
            color: 0x38bdf8,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.55,
            depthWrite: false
        }));
        this.aimRangeRing.rotation.x = -Math.PI / 2;
        this.aimRangeRing.position.y = 0.22;
        this.aimShapeMesh = new _three.Mesh(new _three.PlaneGeometry(1, 1), new _three.MeshBasicMaterial({
            color: 0x38bdf8,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.38,
            depthWrite: false
        }));
        this.aimShapeMesh.rotation.x = -Math.PI / 2;
        this.aimShapeMesh.position.y = 0.24;
        this.aimGroup.add(this.aimRangeRing, this.aimShapeMesh);
        this.aimGroup.visible = false;
        this.scene.add(this.aimGroup);
        this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost);
        this.renderer.domElement.addEventListener('webglcontextrestored', this.onContextRestored);
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(function() {
                return _this.resize();
            });
            this.resizeObserver.observe(this.container);
        }
        this.resize();
        this.lastRenderMs = performance.now();
    }
    var _proto = ThreeBattlefieldRenderer.prototype;
    _proto.isAvailable = function isAvailable() {
        return !this.disposed && !this.contextLost;
    };
    _proto.isSoftware = function isSoftware() {
        return this.isSoftwareGl;
    };
    _proto.resize = function resize() {
        if (this.disposed) return;
        var rect = this.container.getBoundingClientRect();
        var w = Math.max(320, Math.floor(rect.width || window.innerWidth || 960));
        var h = Math.max(180, Math.floor(rect.height || window.innerHeight || 540));
        if (w === this.width && h === this.height) return;
        this.width = w;
        this.height = h;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h, false);
        if (this.overlayCtx) {
            var dpr = Math.min(2, window.devicePixelRatio || 1);
            this.overlayCanvas.width = Math.floor(w * dpr);
            this.overlayCanvas.height = Math.floor(h * dpr);
            this.overlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
    };
    _proto.ensureMapBuilt = function ensureMapBuilt(state) {
        var _THEME_SUNLIT_ATMOSPHERE_state_mapTheme;
        if (this.mapHandle && this.builtTheme === state.mapTheme && this.builtVariant === state.mapVariant && this.builtBrawl === state.isBrawl && this.builtExpLane === state.expLane) {
            return;
        }
        if (this.mapHandle) {
            this.scene.remove(this.mapHandle.root);
            this.mapHandle.dispose();
        }
        this.mapHandle = (0, _ThreeMapBuilder.buildLandOfDawn3D)(state.mapTheme, state.mapVariant, state.isBrawl, state.expLane, state.goldLane);
        this.scene.add(this.mapHandle.root);
        this.builtTheme = state.mapTheme;
        this.builtVariant = state.mapVariant;
        this.builtBrawl = state.isBrawl;
        this.builtExpLane = state.expLane;
        var atmo = (_THEME_SUNLIT_ATMOSPHERE_state_mapTheme = THEME_SUNLIT_ATMOSPHERE[state.mapTheme]) != null ? _THEME_SUNLIT_ATMOSPHERE_state_mapTheme : THEME_SUNLIT_ATMOSPHERE.imperial_sanctuary;
        this.scene.background = new _three.Color(atmo.sky);
        this.scene.fog = new _three.Fog(atmo.fog, 78, 265);
        this.keyLight.color.setHex(atmo.key);
        this.keyLight.intensity = atmo.keyInt;
        this.hemiLight.color.setHex(atmo.hemiSky);
        this.hemiLight.groundColor.setHex(atmo.hemiGround);
    };
    _proto.clearDynamicGroup = function clearDynamicGroup() {
        while(this.dynamicGroup.children.length > 0){
            var child = this.dynamicGroup.children.pop();
            var mesh = child;
            if (mesh.geometry && mesh.geometry !== this.projGeo && mesh.geometry !== this.haloGeo && mesh.geometry !== this.ringGeo && mesh.geometry !== this.domeGeo && mesh.geometry !== this.slashGeo && mesh.geometry !== this.coinGeo) {
                mesh.geometry.dispose();
            }
            var mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [
                mesh.material
            ] : [];
            for(var _iterator = _create_for_of_iterator_helper_loose(mats), _step; !(_step = _iterator()).done;){
                var m = _step.value;
                m.dispose();
            }
        }
    };
    _proto.projectToScreen = function projectToScreen(wx3, wy3, wz3) {
        this.tmpVec.set(wx3, wy3, wz3).project(this.camera);
        var visible = this.tmpVec.z >= -1 && this.tmpVec.z <= 1;
        return {
            x: (this.tmpVec.x * 0.5 + 0.5) * this.width,
            y: (-this.tmpVec.y * 0.5 + 0.5) * this.height,
            visible: visible
        };
    };
    _proto.render = function render(state) {
        if (!this.isAvailable()) return;
        this.resize();
        this.ensureMapBuilt(state);
        var nowMs = performance.now();
        var dt = Math.min(0.05, Math.max(0.001, (nowMs - this.lastRenderMs) / 1000));
        this.lastRenderMs = nowMs;
        var wantShadows = !this.isSoftwareGl && state.settings.basics.shadows;
        if (this.renderer.shadowMap.enabled !== wantShadows) {
            this.renderer.shadowMap.enabled = wantShadows;
            this.keyLight.castShadow = wantShadows;
        }
        var player = state.heroes.find(function(h) {
            return h.isPlayer;
        });
        // 1. Authentic MLBB Angled 3D Diagonal Camera (Blue->Red diagonal yaw, dramatic 3D pitch & smooth damping)
        var targetX = (0, _ThreeHeroModels.toThreeX)(state.camX);
        var targetZ = (0, _ThreeHeroModels.toThreeZ)(state.camY);
        if (this.smoothCamX === null || this.smoothCamZ === null || Math.hypot(targetX - this.smoothCamX, targetZ - this.smoothCamZ) > 30) {
            this.smoothCamX = targetX;
            this.smoothCamZ = targetZ;
        } else {
            this.smoothCamX = _three.MathUtils.damp(this.smoothCamX, targetX, 11, dt);
            this.smoothCamZ = _three.MathUtils.damp(this.smoothCamZ, targetZ, 11, dt);
        }
        var highCam = state.settings.basics.cameraHeight === 'high';
        // High camera height grants true +20% wider battlefield FOV (52.8 deg vs 44 deg)
        var desiredFov = highCam ? 52.8 : 44.0;
        if (Math.abs(this.camera.fov - desiredFov) > 0.05) {
            this.camera.fov = desiredFov;
            this.camera.updateProjectionMatrix();
        }
        var camOffX = highCam ? -9.8 : -8.2;
        var camY = highCam ? 22.4 : 18.5;
        var camOffZ = highCam ? 24.2 : 20.2;
        var shakeX = 0;
        var shakeZ = 0;
        if (state.settings.basics.screenShake && state.shakeTimer > 0) {
            var mag = Math.min(0.65, state.shakeTimer * 2.2);
            shakeX = (Math.random() - 0.5) * mag;
            shakeZ = (Math.random() - 0.5) * mag;
        }
        this.camera.position.set(this.smoothCamX + camOffX + shakeX, camY, this.smoothCamZ + camOffZ + shakeZ);
        this.camera.lookAt(this.smoothCamX + 0.9, 1.0, this.smoothCamZ - 2.2);
        // Keep directional sunlight shadows centered tightly around the active 3D viewport
        this.keyLight.position.set(this.smoothCamX + 28, 54, this.smoothCamZ + 24);
        this.keyLight.target.position.set(this.smoothCamX, 0, this.smoothCamZ);
        this.keyLight.target.updateMatrixWorld();
        // 2. Animate River Flow, Swaying Bushes, Cyclone Eyes, Flying Cloud, Shortcut Walls, Theme Landmarks & 3D Fog of War
        if (this.mapHandle) {
            this.mapHandle.updateFogOfWar(state.blueVisionCircles, Boolean(state.isSpectator));
            if (this.mapHandle.riverTex) {
                var flowSpeed = state.mapVariant === 'expanding_rivers' ? 0.65 : 0.38;
                this.mapHandle.riverTex.offset.y = -(state.matchTimeSec * flowSpeed) % 1;
            }
            if (this.mapHandle.expDecalMesh && this.mapHandle.goldDecalMesh) {
                var decalPulse = 0.78 + Math.sin(state.matchTimeSec * 3.2) * 0.18;
                this.mapHandle.expDecalMesh.material.opacity = decalPulse;
                this.mapHandle.goldDecalMesh.material.opacity = decalPulse;
            }
            if (this.mapHandle.themeAmbientGroup) {
                this.mapHandle.themeAmbientGroup.position.y = Math.sin(state.matchTimeSec * 1.4) * 0.16;
            }
            if (this.mapHandle.bushMesh) {
                var bases = this.mapHandle.bushBaseMatrices;
                for(var i = 0; i < bases.length; i++){
                    var b = bases[i];
                    var sway = Math.sin(state.matchTimeSec * 2.3 + b.x * 0.25) * 0.14;
                    this.bushDummy.position.set(b.x + sway, 1.15, b.z);
                    this.bushDummy.rotation.set(0, b.rot, sway * 0.22);
                    this.bushDummy.scale.set(b.sx, 1.55, b.sz);
                    this.bushDummy.updateMatrix();
                    this.mapHandle.bushMesh.setMatrixAt(i, this.bushDummy.matrix);
                }
                this.mapHandle.bushMesh.instanceMatrix.needsUpdate = true;
            }
            for(var _iterator = _create_for_of_iterator_helper_loose(this.mapHandle.shortcutWallMeshes.entries()), _step; !(_step = _iterator()).done;){
                var _step_value = _step.value, campId = _step_value[0], mesh = _step_value[1];
                var _state_campSlainShortcut_campId;
                var open = ((_state_campSlainShortcut_campId = state.campSlainShortcut[campId]) != null ? _state_campSlainShortcut_campId : 0) > 0;
                mesh.visible = !open;
            }
            for(var _iterator1 = _create_for_of_iterator_helper_loose(this.mapHandle.cycloneMeshes.entries()), _step1; !(_step1 = _iterator1()).done;){
                var _step_value1 = _step1.value, ceId = _step_value1[0], mesh1 = _step_value1[1];
                var _state_cycloneCds_ceId;
                var cd = (_state_cycloneCds_ceId = state.cycloneCds[ceId]) != null ? _state_cycloneCds_ceId : 0;
                mesh1.rotation.z = state.matchTimeSec * (cd <= 0 ? 3.8 : 0.45);
                mesh1.material.color.setHex(cd <= 0 ? 0x38bdf8 : 0x64748b);
            }
            if (this.mapHandle.flyingCloudGroup) {
                this.mapHandle.flyingCloudGroup.rotation.y = state.matchTimeSec * (state.flyingCloudCd <= 0 ? 2.4 : 0.35);
            }
        }
        // 2B. Sync 3D Brawl Healing Shrines
        for(var _iterator2 = _create_for_of_iterator_helper_loose(state.brawlShrines), _step2; !(_step2 = _iterator2()).done;){
            var sh = _step2.value;
            var rig = this.brawlShrineRigs.get(sh.id);
            if (!rig) {
                rig = (0, _ThreeHeroModels.buildBrawlShrineRig3D)();
                rig.group.position.set((0, _ThreeHeroModels.toThreeX)(sh.x), 0, (0, _ThreeHeroModels.toThreeZ)(sh.y));
                this.scene.add(rig.group);
                this.brawlShrineRigs.set(sh.id, rig);
            }
            rig.group.visible = state.isBrawl;
            if (!state.isBrawl) continue;
            rig.crystal.visible = sh.active;
            rig.ring.visible = sh.active;
            if (sh.active) {
                rig.crystal.rotation.y = state.matchTimeSec * 2.4;
                rig.crystal.position.y = 2.35 + Math.sin(state.matchTimeSec * 3.5) * 0.32;
                rig.ring.rotation.z = state.matchTimeSec * 1.8;
            }
        }
        // 2C. Sync 3D Walkie Grass Patrolling River Wards
        var aliveWalkies = new Set();
        for(var _iterator3 = _create_for_of_iterator_helper_loose(state.walkieGrasses), _step3; !(_step3 = _iterator3()).done;){
            var wg = _step3.value;
            aliveWalkies.add(wg.id);
            var rig1 = this.walkieRigs.get(wg.id);
            if (!rig1) {
                rig1 = (0, _ThreeHeroModels.buildWalkieGrassRig3D)(wg.team);
                this.scene.add(rig1);
                this.walkieRigs.set(wg.id, rig1);
            }
            rig1.position.set((0, _ThreeHeroModels.toThreeX)(wg.x), Math.sin(state.matchTimeSec * 4.2 + wg.phase) * 0.25, (0, _ThreeHeroModels.toThreeZ)(wg.y));
            rig1.rotation.y = state.matchTimeSec * 2.1;
        }
        for(var _iterator4 = _create_for_of_iterator_helper_loose(this.walkieRigs.entries()), _step4; !(_step4 = _iterator4()).done;){
            var _step_value2 = _step4.value, id = _step_value2[0], rig2 = _step_value2[1];
            if (!aliveWalkies.has(id)) {
                this.scene.remove(rig2);
                this.walkieRigs.delete(id);
            }
        }
        // 3. Sync Monumental 3D Turrets & Base Crystals + 3-State Range Rings + Laser Tether
        for(var _iterator5 = _create_for_of_iterator_helper_loose(state.turrets), _step5; !(_step5 = _iterator5()).done;){
            var t = _step5.value;
            var rig3 = this.turretRigs.get(t.id);
            if (!rig3) {
                rig3 = (0, _ThreeHeroModels.buildMlbbTurretRig3D)(t.team, t.tier, t.golden, t.range);
                this.scene.add(rig3.group);
                this.turretRigs.set(t.id, rig3);
            }
            rig3.group.visible = t.alive;
            if (!t.alive) continue;
            var tx = (0, _ThreeHeroModels.toThreeX)(t.x);
            var tz = (0, _ThreeHeroModels.toThreeZ)(t.y);
            rig3.group.position.set(tx, 0, tz);
            rig3.crystal.rotation.y = state.matchTimeSec * 1.8;
            rig3.crystal.position.y = (t.tier === 4 ? 6.15 : 6.45) + Math.sin(state.matchTimeSec * 3.1) * 0.2;
            rig3.orbitRing.position.y = rig3.crystal.position.y;
            rig3.orbitRing.rotation.z = state.matchTimeSec * 2.2;
            rig3.shieldDome.visible = t.shieldHp > 0;
            rig3.shieldDome.rotation.y = -state.matchTimeSec * 0.7;
            var showRing = t.team === 'red' && player && player.alive && (0, _CombatMath.dist)(player.x, player.y, t.x, t.y) < t.range + 300;
            rig3.rangeRing.visible = Boolean(showRing);
            rig3.rangeFill.visible = Boolean(showRing);
            rig3.laserBeam.visible = false;
            if (showRing && player) {
                var ringState = (0, _BattlefieldSystems.computeTurretRingState)(t, player.id, player.team, state.minions);
                var locked = ringState === 'locked';
                var col = locked ? 0xef4444 : ringState === 'safe' ? 0x2ce58b : 0xfacc15;
                var pulse = locked ? 0.58 + Math.sin(state.matchTimeSec * 16) * 0.38 : 0.86;
                rig3.rangeRingMat.color.setHex(col);
                rig3.rangeRingMat.opacity = pulse;
                rig3.rangeFillMat.color.setHex(col);
                rig3.rangeFillMat.opacity = locked ? 0.18 : 0.08;
                if (locked) {
                    var px3 = (0, _ThreeHeroModels.toThreeX)(player.x);
                    var pz3 = (0, _ThreeHeroModels.toThreeZ)(player.y);
                    var dx = px3 - tx;
                    var dy = 1.6 - rig3.laserBeam.position.y;
                    var dz = pz3 - tz;
                    var beamLen = Math.hypot(dx, dy, dz);
                    rig3.laserBeam.visible = true;
                    rig3.laserBeam.scale.set(1, 1, beamLen);
                    rig3.laserBeam.lookAt(px3, 1.6, pz3);
                }
            }
        }
        // 4. Sync Detailed Articulated 3D Heroes (Layer 2 Silhouette Shaders, Dynamic Scale, Parabolic Leap Z-Arc, 0.55 Bush Stealth)
        for(var _iterator6 = _create_for_of_iterator_helper_loose(state.heroes), _step6; !(_step6 = _iterator6()).done;){
            var h = _step6.value;
            var _h_eggFormTimer;
            var rig4 = this.heroRigs.get(h.id);
            if (!rig4) {
                rig4 = (0, _ThreeHeroModels.buildMlbbHeroRig3D)(h.role, h.skinColor, h.skinAccent, h.team, h.isPlayer, 1.58);
                this.scene.add(rig4.group);
                this.heroRigs.set(h.id, rig4);
            }
            var isEgg = !h.alive && ((_h_eggFormTimer = h.eggFormTimer) != null ? _h_eggFormTimer : 0) > 0;
            var visible = (h.alive || isEgg) && (h.team === 'blue' || state.visibleEnemyIds.has(h.id));
            rig4.group.visible = visible;
            if (!visible) continue;
            var sil = (0, _VfxSystem.resolveHeroSilhouetteState)(h);
            var hx = (0, _ThreeHeroModels.toThreeX)(h.x);
            var hz = (0, _ThreeHeroModels.toThreeZ)(h.y);
            var fallbackLeap = h.dashTimer > 0 && h.dashWallCross ? Math.sin(Math.min(1, h.dashTimer * 2.5) * Math.PI) * 3.2 : 0;
            var leapY = sil.leapZ > 0 ? sil.leapZ : fallbackLeap;
            var speedMag = Math.hypot(h.vx, h.vy);
            var bobY = speedMag > 15 ? Math.abs(Math.sin(state.matchTimeSec * 12)) * 0.12 : Math.sin(state.matchTimeSec * 2.6 + hx) * 0.04;
            rig4.group.position.set(hx, leapY + bobY, hz);
            // Dynamic Model Scaling (Barats Big Guy up to 1.45x, Diggie Egg 0.72x!)
            var scaleFactor = sil.eggForm ? 0.72 : sil.modelScale;
            rig4.group.scale.setScalar(scaleFactor);
            rig4.bodyGroup.rotation.y = Math.PI / 2 - h.facing;
            var walkPhase = speedMag > 15 ? Math.sin(state.matchTimeSec * 12) * 0.58 : 0;
            rig4.leftLeg.rotation.x = walkPhase;
            rig4.rightLeg.rotation.x = -walkPhase;
            rig4.leftArm.rotation.x = -walkPhase * 0.72;
            rig4.capePivot.rotation.x = (speedMag > 15 ? 0.42 : 0.12) + Math.sin(state.matchTimeSec * 5.2 + hx) * 0.1;
            var isSwinging = h.atkCd > 0.32 || h.castWindup > 0;
            rig4.weaponPivot.rotation.x = isSwinging ? -1.25 : walkPhase * 0.65 + Math.sin(state.matchTimeSec * 2.8) * 0.08;
            // Layer 2 PBR Silhouette Shaders: Translucent Camo/Untargetable, Red Hit-Flash, Gold CC-Immune, Cyan Shield
            for(var _iterator7 = _create_for_of_iterator_helper_loose(rig4.materials), _step7; !(_step7 = _iterator7()).done;){
                var m = _step7.value;
                if (m.transparent !== sil.translucent) {
                    m.transparent = sil.translucent;
                    m.needsUpdate = true;
                }
                m.opacity = sil.opacity;
                if (sil.redHitFlash) {
                    m.emissive.setHex(0xff3b4e);
                    m.emissiveIntensity = 1.55;
                } else if (sil.goldCcImmune) {
                    m.emissive.setHex(sil.deathImmune ? 0x4ade80 : 0xfacc15);
                    m.emissiveIntensity = 0.52;
                } else if (sil.cyanShielded) {
                    m.emissive.setHex(0x38bdf8);
                    m.emissiveIntensity = 0.28;
                } else {
                    m.emissive.setHex(0x000000);
                    m.emissiveIntensity = m === rig4.materials[4] ? 0.85 : 0;
                }
            }
            rig4.lockRing.visible = state.lockedTargetId === h.id;
            rig4.lockRing.rotation.z = state.matchTimeSec * 2.5;
            rig4.ccHalo.visible = sil.goldCcImmune || sil.carForm;
            rig4.ccHalo.rotation.z = state.matchTimeSec * 3.6;
            rig4.iceCage.visible = sil.frostFrozen;
            rig4.recallRing.visible = h.recalling;
            if (h.recalling) {
                var prog = Math.max(0, Math.min(1, 1 - h.recallTimer / 4.0));
                var rScale = 0.85 + prog * 0.7 + Math.sin(state.matchTimeSec * 9) * 0.06;
                rig4.recallRing.rotation.y = state.matchTimeSec * 4.5;
                rig4.recallRing.scale.set(rScale, 1, rScale);
            } else {
                rig4.recallRing.scale.set(1, 1, 1);
            }
            var hasOrbit = h.orbitBlades > 0 && h.orbitTimer > 0;
            rig4.orbitGroup.visible = hasOrbit;
            if (hasOrbit) {
                for(var i1 = 0; i1 < rig4.orbitBlades.length; i1++){
                    var b1 = rig4.orbitBlades[i1];
                    b1.visible = i1 < h.orbitBlades;
                    if (b1.visible) {
                        var ba = state.matchTimeSec * 4.4 + i1 * Math.PI * 2 / h.orbitBlades;
                        b1.position.set(Math.cos(ba) * 3.2, 0, Math.sin(ba) * 3.2);
                        b1.rotation.y = -ba;
                    }
                }
            }
        }
        // 5. Sync Sculpted 3D Jungle Monsters
        for(var _iterator8 = _create_for_of_iterator_helper_loose(state.jungleMobs), _step8; !(_step8 = _iterator8()).done;){
            var mob = _step8.value;
            var rig5 = this.jungleRigs.get(mob.id);
            if (!rig5) {
                rig5 = (0, _ThreeHeroModels.buildJungleMobRig3D)(mob.kind, mob.color);
                this.scene.add(rig5);
                this.jungleRigs.set(mob.id, rig5);
            }
            rig5.visible = mob.alive;
            if (!mob.alive) continue;
            rig5.position.set((0, _ThreeHeroModels.toThreeX)(mob.x), Math.sin(state.matchTimeSec * 2.5 + mob.homeX) * 0.08, (0, _ThreeHeroModels.toThreeZ)(mob.y));
            rig5.rotation.y = Math.sin(state.matchTimeSec * 0.9 + mob.homeX) * 0.4;
        }
        // 6. Sync 3D Lane Minions (including armored Super Minions & 3-Stage Evolved Lord scaling!)
        var aliveMinions = new Set();
        for(var _iterator9 = _create_for_of_iterator_helper_loose(state.minions), _step9; !(_step9 = _iterator9()).done;){
            var m1 = _step9.value;
            if (!m1.alive) continue;
            aliveMinions.add(m1.id);
            var rig6 = this.minionRigs.get(m1.id);
            if (!rig6) {
                rig6 = (0, _ThreeHeroModels.buildMinionRig3D)(m1.team, m1.kind);
                this.scene.add(rig6);
                this.minionRigs.set(m1.id, rig6);
            }
            rig6.position.set((0, _ThreeHeroModels.toThreeX)(m1.x), 0, (0, _ThreeHeroModels.toThreeZ)(m1.y));
            if (m1.kind === 'lord_ally') {
                var sc = m1.lordStage === 3 ? 1.24 : m1.lordStage === 2 ? 1.12 : 1.0;
                rig6.scale.setScalar(sc);
            }
        }
        for(var _iterator10 = _create_for_of_iterator_helper_loose(this.minionRigs.entries()), _step10; !(_step10 = _iterator10()).done;){
            var _step_value3 = _step10.value, id1 = _step_value3[0], rig7 = _step_value3[1];
            if (!aliveMinions.has(id1)) {
                this.scene.remove(rig7);
                this.minionRigs.delete(id1);
            }
        }
        // 7. Skill Aiming 3D Ground Telegraph
        if (state.aimPreview.active && player && player.alive) {
            var ap = state.aimPreview;
            var px = (0, _ThreeHeroModels.toThreeX)(player.x);
            var pz = (0, _ThreeHeroModels.toThreeZ)(player.y);
            var r3 = Math.max(1.5, ap.range * _ThreeHeroModels.WORLD_SCALE);
            var rad3 = Math.max(1.0, ap.radius * _ThreeHeroModels.WORLD_SCALE);
            var col1 = ap.cancelHover ? 0xef4444 : 0x38bdf8;
            this.aimGroup.visible = true;
            this.aimGroup.position.set(px, 0, pz);
            this.aimRangeRing.scale.set(r3, r3, 1);
            this.aimRangeRing.material.color.setHex(col1);
            this.aimShapeMesh.material.color.setHex(col1);
            if (ap.shape === 'line' || ap.shape === 'cone') {
                var ang = ap.angle;
                var cx = Math.cos(ang) * (r3 * 0.5);
                var cz = Math.sin(ang) * (r3 * 0.5);
                this.aimShapeMesh.position.set(cx, 0.24, cz);
                this.aimShapeMesh.rotation.set(-Math.PI / 2, 0, -ang);
                this.aimShapeMesh.scale.set(r3, rad3 * 1.15, 1);
            } else if (ap.shape === 'circle') {
                var d3 = Math.min(r3, ap.dist * _ThreeHeroModels.WORLD_SCALE);
                this.aimShapeMesh.position.set(Math.cos(ap.angle) * d3, 0.24, Math.sin(ap.angle) * d3);
                this.aimShapeMesh.rotation.set(-Math.PI / 2, 0, 0);
                this.aimShapeMesh.scale.set(rad3 * 1.9, rad3 * 1.9, 1);
            } else {
                this.aimShapeMesh.position.set(0, 0.24, 0);
                this.aimShapeMesh.rotation.set(-Math.PI / 2, 0, 0);
                this.aimShapeMesh.scale.set(rad3 * 1.8, rad3 * 1.8, 1);
            }
        } else {
            this.aimGroup.visible = false;
        }
        // 8. Volumetric 3D Projectiles, Shockwave Domes, Slash Arcs, Beams, Spinning Coins & Tactical Ping Beacons
        this.clearDynamicGroup();
        for(var _iterator11 = _create_for_of_iterator_helper_loose(state.projectiles), _step11; !(_step11 = _iterator11()).done;){
            var p = _step11.value;
            var col2 = (0, _ThreeHeroModels.hexToInt)(p.color, 0x38bdf8);
            var sc1 = Math.max(0.65, p.radius * _ThreeHeroModels.WORLD_SCALE * 0.65);
            var px1 = (0, _ThreeHeroModels.toThreeX)(p.x);
            var pz1 = (0, _ThreeHeroModels.toThreeZ)(p.y);
            var core = new _three.Mesh(this.projGeo, new _three.MeshBasicMaterial({
                color: 0xffffff
            }));
            core.scale.setScalar(sc1 * 0.72);
            core.position.set(px1, 1.75, pz1);
            var halo = new _three.Mesh(this.haloGeo, new _three.MeshBasicMaterial({
                color: col2,
                transparent: true,
                opacity: 0.62,
                depthWrite: false
            }));
            halo.scale.setScalar(sc1 * 1.15);
            halo.position.set(px1, 1.75, pz1);
            this.dynamicGroup.add(core, halo);
        }
        for(var _iterator12 = _create_for_of_iterator_helper_loose(state.wisps), _step12; !(_step12 = _iterator12()).done;){
            var wisp = _step12.value;
            var orb = new _three.Mesh(this.haloGeo, new _three.MeshBasicMaterial({
                color: 0x38bdf8,
                transparent: true,
                opacity: 0.78
            }));
            orb.scale.setScalar(1.1);
            orb.position.set((0, _ThreeHeroModels.toThreeX)(wisp.x), 2.5 + Math.sin(state.matchTimeSec * 4.5) * 0.4, (0, _ThreeHeroModels.toThreeZ)(wisp.y));
            this.dynamicGroup.add(orb);
        }
        for(var _iterator13 = _create_for_of_iterator_helper_loose(state.vfxs), _step13; !(_step13 = _iterator13()).done;){
            var v = _step13.value;
            var alpha = Math.max(0, Math.min(1, v.ttl / Math.max(0.01, v.maxTtl)));
            var col3 = (0, _ThreeHeroModels.hexToInt)(v.color, 0xfacc15);
            var vx = (0, _ThreeHeroModels.toThreeX)(v.x);
            var vz = (0, _ThreeHeroModels.toThreeZ)(v.y);
            if (v.kind === 'burst') {
                var expand = 1.35 - alpha * 0.55;
                var r31 = Math.max(1.4, v.radius * _ThreeHeroModels.WORLD_SCALE * expand);
                var dome = new _three.Mesh(this.domeGeo, new _three.MeshBasicMaterial({
                    color: col3,
                    side: _three.DoubleSide,
                    transparent: true,
                    opacity: alpha * 0.42,
                    depthWrite: false
                }));
                dome.position.set(vx, 0.15, vz);
                dome.scale.set(r31, r31 * 0.72, r31);
                var ring = new _three.Mesh(this.ringGeo, new _three.MeshBasicMaterial({
                    color: col3,
                    side: _three.DoubleSide,
                    transparent: true,
                    opacity: alpha * 0.9,
                    depthWrite: false
                }));
                ring.rotation.x = -Math.PI / 2;
                ring.position.set(vx, 0.25, vz);
                ring.scale.set(r31 * 1.05, r31 * 1.05, 1);
                this.dynamicGroup.add(dome, ring);
            } else if (v.kind === 'slash') {
                var r32 = Math.max(1.5, v.radius * _ThreeHeroModels.WORLD_SCALE);
                var arc = new _three.Mesh(this.slashGeo, new _three.MeshBasicMaterial({
                    color: col3,
                    transparent: true,
                    opacity: alpha * 0.92,
                    depthWrite: false
                }));
                arc.rotation.set(Math.PI / 2 - 0.22, 0, state.matchTimeSec * 8);
                arc.position.set(vx, 1.55, vz);
                arc.scale.setScalar(r32 * 0.82);
                this.dynamicGroup.add(arc);
            } else if (v.kind === 'ring' || v.kind === 'crater') {
                var r33 = Math.max(1.3, v.radius * _ThreeHeroModels.WORLD_SCALE);
                var ring1 = new _three.Mesh(this.ringGeo, new _three.MeshBasicMaterial({
                    color: col3,
                    side: _three.DoubleSide,
                    transparent: true,
                    opacity: alpha * 0.88,
                    depthWrite: false
                }));
                ring1.rotation.x = -Math.PI / 2;
                ring1.position.set(vx, 0.25, vz);
                ring1.scale.set(r33, r33, 1);
                this.dynamicGroup.add(ring1);
            } else if ((v.kind === 'beam' || v.kind === 'tether') && v.tx !== undefined && v.ty !== undefined) {
                var x2 = (0, _ThreeHeroModels.toThreeX)(v.tx);
                var z2 = (0, _ThreeHeroModels.toThreeZ)(v.ty);
                var len = Math.max(0.2, Math.hypot(x2 - vx, z2 - vz));
                var beamGeo = new _three.CylinderGeometry(0.24, 0.24, len, 6);
                beamGeo.rotateX(Math.PI / 2);
                var beam = new _three.Mesh(beamGeo, new _three.MeshBasicMaterial({
                    color: col3,
                    transparent: true,
                    opacity: alpha * 0.92
                }));
                beam.position.set((vx + x2) * 0.5, 1.7, (vz + z2) * 0.5);
                beam.lookAt(x2, 1.7, z2);
                this.dynamicGroup.add(beam);
            } else if (v.kind === 'coin') {
                var coin = new _three.Mesh(this.coinGeo, new _three.MeshBasicMaterial({
                    color: 0xfacc15,
                    transparent: true,
                    opacity: alpha
                }));
                coin.rotation.x = Math.PI / 2;
                coin.rotation.z = state.matchTimeSec * 10;
                coin.position.set(vx, 1.8 + (1 - alpha) * 2.8, vz);
                this.dynamicGroup.add(coin);
            } else if (v.kind === 'leaf') {
                var _v_angle;
                var leaf = new _three.Mesh(this.coinGeo, new _three.MeshBasicMaterial({
                    color: 0x4ade80,
                    transparent: true,
                    opacity: alpha * 0.9
                }));
                leaf.scale.set(1.1, 0.3, 0.55);
                leaf.rotation.set(state.matchTimeSec * 6, (_v_angle = v.angle) != null ? _v_angle : 0, state.matchTimeSec * 5);
                leaf.position.set(vx + Math.sin(state.matchTimeSec * 8 + vx) * 0.4, 0.8 + (1 - alpha) * 1.9, vz);
                this.dynamicGroup.add(leaf);
            } else if (v.kind === 'shard') {
                var _v_angle1;
                var shard = new _three.Mesh(this.projGeo, new _three.MeshBasicMaterial({
                    color: col3,
                    transparent: true,
                    opacity: alpha
                }));
                var spread = (1 - alpha) * (v.radius * _ThreeHeroModels.WORLD_SCALE);
                var ang1 = (_v_angle1 = v.angle) != null ? _v_angle1 : 0;
                shard.scale.set(0.6, 1.45, 0.6);
                shard.rotation.set(state.matchTimeSec * 7, ang1, state.matchTimeSec * 9);
                shard.position.set(vx + Math.cos(ang1) * spread, 2.2 + Math.sin(alpha * Math.PI) * 5.8, vz + Math.sin(ang1) * spread);
                this.dynamicGroup.add(shard);
            } else if (v.kind === 'elemental' || v.kind === 'prism') {
                var orb1 = new _three.Mesh(this.haloGeo, new _three.MeshBasicMaterial({
                    color: col3,
                    transparent: true,
                    opacity: alpha * 0.85,
                    depthWrite: false
                }));
                orb1.scale.setScalar(v.kind === 'prism' ? 1.35 : 0.72 * alpha + 0.25);
                orb1.position.set(vx, 1.4 + (1 - alpha) * 2.2, vz);
                this.dynamicGroup.add(orb1);
            } else if (v.kind === 'cable' && v.tx !== undefined && v.ty !== undefined) {
                var x21 = (0, _ThreeHeroModels.toThreeX)(v.tx);
                var z21 = (0, _ThreeHeroModels.toThreeZ)(v.ty);
                var len1 = Math.max(0.2, Math.hypot(x21 - vx, z21 - vz));
                var cableGeo = new _three.CylinderGeometry(0.11, 0.11, len1, 6);
                cableGeo.rotateX(Math.PI / 2);
                var cable = new _three.Mesh(cableGeo, new _three.MeshBasicMaterial({
                    color: 0xe2e8f0,
                    transparent: true,
                    opacity: alpha
                }));
                cable.position.set((vx + x21) * 0.5, 1.65, (vz + z21) * 0.5);
                cable.lookAt(x21, 1.65, z21);
                this.dynamicGroup.add(cable);
            }
        }
        // 8B. 3D Temporary Rock Walls (Badang S2, Grock S2), Hirara Astral Prisms & Cyan Shield Domes
        if (state.tempWalls && state.tempWalls.length > 0) {
            for(var _iterator14 = _create_for_of_iterator_helper_loose(state.tempWalls), _step14; !(_step14 = _iterator14()).done;){
                var tw = _step14.value;
                var w3 = Math.max(1.2, tw.w * _ThreeHeroModels.WORLD_SCALE);
                var d31 = Math.max(1.2, tw.h * _ThreeHeroModels.WORLD_SCALE);
                var wallMesh = new _three.Mesh(new _three.BoxGeometry(w3, 3.2, d31), new _three.MeshStandardMaterial({
                    color: (0, _ThreeHeroModels.hexToInt)(tw.color, 0xd97706),
                    roughness: 0.75,
                    transparent: true,
                    opacity: Math.min(0.95, tw.ttl / Math.max(0.1, tw.maxTtl) * 1.5)
                }));
                wallMesh.position.set((0, _ThreeHeroModels.toThreeX)(tw.x + tw.w * 0.5), 1.6, (0, _ThreeHeroModels.toThreeZ)(tw.y + tw.h * 0.5));
                this.dynamicGroup.add(wallMesh);
            }
        }
        for(var _iterator15 = _create_for_of_iterator_helper_loose(state.heroes), _step15; !(_step15 = _iterator15()).done;){
            var h1 = _step15.value;
            if (h1.alive && h1.shield > 0 && (h1.team === 'blue' || state.visibleEnemyIds.has(h1.id))) {
                var dome1 = new _three.Mesh(this.domeGeo, new _three.MeshBasicMaterial({
                    color: 0x38bdf8,
                    transparent: true,
                    opacity: 0.24,
                    side: _three.DoubleSide,
                    depthWrite: false
                }));
                var sc2 = 2.0 * (h1.modelScale || 1);
                dome1.scale.set(sc2, sc2 * 1.1, sc2);
                dome1.position.set((0, _ThreeHeroModels.toThreeX)(h1.x), 0.15 + (h1.leapZ || 0), (0, _ThreeHeroModels.toThreeZ)(h1.y));
                this.dynamicGroup.add(dome1);
            }
            if (h1.hiraraPrisms && h1.hiraraPrisms.length > 0) {
                for(var _iterator16 = _create_for_of_iterator_helper_loose(h1.hiraraPrisms), _step16; !(_step16 = _iterator16()).done;){
                    var pr = _step16.value;
                    var pMesh = new _three.Mesh(this.haloGeo, new _three.MeshBasicMaterial({
                        color: 0xe879f9,
                        transparent: true,
                        opacity: 0.82
                    }));
                    pMesh.scale.set(0.75, 1.55, 0.75);
                    pMesh.position.set((0, _ThreeHeroModels.toThreeX)(pr.x), 1.9 + Math.sin(state.matchTimeSec * 4) * 0.3, (0, _ThreeHeroModels.toThreeZ)(pr.y));
                    this.dynamicGroup.add(pMesh);
                }
            }
        }
        // Tall 3D Vertical Light Pillars & Ground Ripples for Active Tactical Pings
        for(var _iterator17 = _create_for_of_iterator_helper_loose(state.tacticalPings), _step17; !(_step17 = _iterator17()).done;){
            var ping = _step17.value;
            var pAlpha = Math.max(0.18, Math.min(1, ping.ttl / Math.max(0.1, ping.maxTtl)));
            var col4 = (0, _ThreeHeroModels.hexToInt)(ping.color, 0xff3b4e);
            var px2 = (0, _ThreeHeroModels.toThreeX)(ping.x);
            var pz2 = (0, _ThreeHeroModels.toThreeZ)(ping.y);
            var pulse1 = state.matchTimeSec * 2.2 % 1;
            var ripple = new _three.Mesh(this.ringGeo, new _three.MeshBasicMaterial({
                color: col4,
                side: _three.DoubleSide,
                transparent: true,
                opacity: pAlpha * (1 - pulse1 * 0.65),
                depthWrite: false
            }));
            ripple.rotation.x = -Math.PI / 2;
            ripple.position.set(px2, 0.3, pz2);
            var rr = 1.8 + pulse1 * 4.8;
            ripple.scale.set(rr, rr, 1);
            var pillar = new _three.Mesh(new _three.CylinderGeometry(0.16, 0.65, 9.5, 10, 1, true), new _three.MeshBasicMaterial({
                color: col4,
                side: _three.DoubleSide,
                transparent: true,
                opacity: pAlpha * 0.62,
                depthWrite: false
            }));
            pillar.position.set(px2, 4.75, pz2);
            this.dynamicGroup.add(ripple, pillar);
        }
        // Render 3D WebGL scene
        this.renderer.render(this.scene, this.camera);
        // 9. Draw Crisp Screen-Space Projected 2D Overlays (HP Bars, Eye Icons, Damage Popups, Route Trails, Ping Badges)
        this.render2DOverlay(state);
    };
    _proto.render2DOverlay = function render2DOverlay(state) {
        var ctx = this.overlayCtx;
        if (!ctx) return;
        ctx.clearRect(0, 0, this.width, this.height);
        var player = state.heroes.find(function(h) {
            return h.isPlayer;
        });
        // 0. Glowing Red Hero Lock-On Tether Line from Player to Locked Enemy
        if (player && player.alive && state.lockedTargetId) {
            var lockedEnemy = state.heroes.find(function(x) {
                return x.id === state.lockedTargetId && x.alive && state.visibleEnemyIds.has(x.id);
            });
            if (lockedEnemy) {
                var spA = this.projectToScreen((0, _ThreeHeroModels.toThreeX)(player.x), 1.4, (0, _ThreeHeroModels.toThreeZ)(player.y));
                var spB = this.projectToScreen((0, _ThreeHeroModels.toThreeX)(lockedEnemy.x), 1.4, (0, _ThreeHeroModels.toThreeZ)(lockedEnemy.y));
                if (spA.visible && spB.visible) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(spA.x, spA.y);
                    ctx.lineTo(spB.x, spB.y);
                    ctx.strokeStyle = 'rgba(255,59,78,0.38)';
                    ctx.lineWidth = 7;
                    ctx.stroke();
                    ctx.strokeStyle = '#FF3B4E';
                    ctx.lineWidth = 2.5;
                    ctx.setLineDash([
                        8,
                        6
                    ]);
                    ctx.lineDashOffset = -(state.matchTimeSec * 38);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    // Crisp underfoot target crosshair around locked enemy
                    ctx.beginPath();
                    ctx.arc(spB.x, spB.y + 8, 18, 0, Math.PI * 2);
                    ctx.strokeStyle = '#FF3B4E';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
        // A. Glowing Cyan "On My Way" Route Lines & Tactical Ping Banners
        for(var _iterator = _create_for_of_iterator_helper_loose(state.tacticalPings), _step; !(_step = _iterator()).done;){
            var ping = _step.value;
            var pAlpha = Math.max(0, Math.min(1, ping.ttl / Math.max(0.1, ping.maxTtl)));
            ctx.save();
            ctx.globalAlpha = Math.min(1, pAlpha * 1.35);
            if (ping.routePoints && ping.routePoints.length >= 2) {
                ctx.beginPath();
                var started = false;
                for(var _iterator1 = _create_for_of_iterator_helper_loose(ping.routePoints), _step1; !(_step1 = _iterator1()).done;){
                    var pt = _step1.value;
                    var sp = this.projectToScreen((0, _ThreeHeroModels.toThreeX)(pt.x), 0.45, (0, _ThreeHeroModels.toThreeZ)(pt.y));
                    if (!sp.visible) continue;
                    if (!started) {
                        ctx.moveTo(sp.x, sp.y);
                        started = true;
                    } else {
                        ctx.lineTo(sp.x, sp.y);
                    }
                }
                if (started) {
                    ctx.strokeStyle = 'rgba(34,211,238,0.42)';
                    ctx.lineWidth = 10;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.stroke();
                    ctx.strokeStyle = '#22D3EE';
                    ctx.lineWidth = 4;
                    ctx.setLineDash([
                        12,
                        8
                    ]);
                    ctx.lineDashOffset = -(state.matchTimeSec * 42);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }
            var sp1 = this.projectToScreen((0, _ThreeHeroModels.toThreeX)(ping.x), 5.2, (0, _ThreeHeroModels.toThreeZ)(ping.y));
            if (sp1.visible && sp1.x > -120 && sp1.x < this.width + 120 && sp1.y > -60 && sp1.y < this.height + 60) {
                ctx.font = 'bold 11px sans-serif';
                var txt = ping.icon + " " + ping.label;
                var tw = Math.min(240, ctx.measureText(txt).width + 18);
                ctx.fillStyle = 'rgba(11,19,43,0.92)';
                ctx.beginPath();
                ctx.roundRect(sp1.x - tw / 2, sp1.y - 14, tw, 22, 8);
                ctx.fill();
                ctx.strokeStyle = ping.color;
                ctx.lineWidth = 1.8;
                ctx.stroke();
                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(txt, sp1.x, sp1.y - 3);
            }
            ctx.restore();
        }
        // B. Fog Ghosts (2s fading last-known silhouettes)
        for(var _iterator2 = _create_for_of_iterator_helper_loose(state.fogGhosts), _step2; !(_step2 = _iterator2()).done;){
            var ghost = _step2.value;
            var sp2 = this.projectToScreen((0, _ThreeHeroModels.toThreeX)(ghost.x), 2.1, (0, _ThreeHeroModels.toThreeZ)(ghost.y));
            if (!sp2.visible) continue;
            var alpha = Math.max(0, ghost.ttl / Math.max(0.01, ghost.maxTtl) * 0.78);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(sp2.x, sp2.y, 18, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(15,23,42,0.84)';
            ctx.fill();
            ctx.strokeStyle = '#FB7185';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([
                4,
                4
            ]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#FDE047';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', sp2.x, sp2.y);
            ctx.font = 'bold 10px sans-serif';
            ctx.fillStyle = '#FCA5A5';
            ctx.fillText(ghost.name, sp2.x, sp2.y - 24);
            ctx.restore();
        }
        // C. Turret HP Bars
        for(var _iterator3 = _create_for_of_iterator_helper_loose(state.turrets), _step3; !(_step3 = _iterator3()).done;){
            var t = _step3.value;
            if (!t.alive) continue;
            var sp3 = this.projectToScreen((0, _ThreeHeroModels.toThreeX)(t.x), t.tier === 4 ? 9.1 : 8.5, (0, _ThreeHeroModels.toThreeZ)(t.y));
            if (!sp3.visible || sp3.x < -80 || sp3.x > this.width + 80 || sp3.y < -40 || sp3.y > this.height + 40) continue;
            var bw = t.tier === 4 ? 106 : 76;
            var bx = sp3.x - bw / 2;
            var by = sp3.y;
            ctx.fillStyle = 'rgba(8,12,24,0.88)';
            ctx.fillRect(bx - 1, by - 1, bw + 2, 9);
            ctx.fillStyle = t.team === 'blue' ? '#38BDF8' : '#EF4444';
            ctx.fillRect(bx, by, bw * Math.max(0, t.hp / t.maxHp), 7);
            if (t.shieldHp > 0) {
                ctx.strokeStyle = '#22D3EE';
                ctx.lineWidth = 1.8;
                ctx.strokeRect(bx - 2, by - 2, bw + 4, 11);
            }
        }
        // C2. Brawl Healing Shrine Ground Countdown Rings
        if (state.isBrawl) {
            for(var _iterator4 = _create_for_of_iterator_helper_loose(state.brawlShrines), _step4; !(_step4 = _iterator4()).done;){
                var sh = _step4.value;
                if (sh.active) continue;
                if (sh.respawnTimer <= 0) continue;
                var sp4 = this.projectToScreen((0, _ThreeHeroModels.toThreeX)(sh.x), 0.7, (0, _ThreeHeroModels.toThreeZ)(sh.y));
                if (!sp4.visible || sp4.x < 0 || sp4.x > this.width || sp4.y < 0 || sp4.y > this.height) continue;
                var frac = Math.max(0, Math.min(1, 1 - sh.respawnTimer / Math.max(1, sh.maxRespawn)));
                ctx.save();
                ctx.beginPath();
                ctx.arc(sp4.x, sp4.y, 18, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(7,12,26,0.82)';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(sp4.x, sp4.y, 18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
                ctx.strokeStyle = '#2CE58B';
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.fillStyle = '#A7F3D0';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("" + Math.ceil(sh.respawnTimer) + "s", sp4.x, sp4.y);
                ctx.restore();
            }
        }
        // D. Jungle Mob HP Bars + Exact Numeric HP on Turtle/Lord + Retribution Line + Circular Radial Respawn Timers
        for(var _iterator5 = _create_for_of_iterator_helper_loose(state.jungleMobs), _step5; !(_step5 = _iterator5()).done;){
            var mob = _step5.value;
            var isMajor = mob.kind === 'lord' || mob.kind === 'turtle';
            var isBuff = mob.kind === 'orange_buff' || mob.kind === 'purple_buff';
            if (!mob.alive) {
                if ((isMajor || isBuff) && mob.respawnTimer > 0 && mob.respawnTimer < 240) {
                    var sp5 = this.projectToScreen((0, _ThreeHeroModels.toThreeX)(mob.homeX), 0.9, (0, _ThreeHeroModels.toThreeZ)(mob.homeY));
                    if (sp5.visible && sp5.x > -30 && sp5.x < this.width + 30 && sp5.y > -30 && sp5.y < this.height + 30) {
                        var maxSec = mob.spawnedOnce ? mob.respawnSec : mob.firstSpawnSec;
                        var frac1 = Math.max(0, Math.min(1, 1 - mob.respawnTimer / Math.max(1, maxSec)));
                        var rad = isMajor ? 22 : 17;
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(sp5.x, sp5.y, rad, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(11,19,43,0.88)';
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(148,163,184,0.32)';
                        ctx.lineWidth = 3;
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.arc(sp5.x, sp5.y, rad, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac1);
                        ctx.strokeStyle = isMajor ? '#FACC15' : mob.color;
                        ctx.lineWidth = 3.2;
                        ctx.stroke();
                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = 'bold 10px monospace';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText("" + Math.ceil(mob.respawnTimer) + "s", sp5.x, sp5.y + 1);
                        ctx.restore();
                    }
                }
                continue;
            }
            var sp6 = this.projectToScreen((0, _ThreeHeroModels.toThreeX)(mob.x), mob.kind === 'lord' ? 6.1 : 3.8, (0, _ThreeHeroModels.toThreeZ)(mob.y));
            if (!sp6.visible || sp6.x < -80 || sp6.x > this.width + 80 || sp6.y < -40 || sp6.y > this.height + 40) continue;
            var bw1 = mob.kind === 'lord' ? 114 : mob.kind === 'turtle' ? 96 : 64;
            var bx1 = sp6.x - bw1 / 2;
            var by1 = sp6.y;
            ctx.fillStyle = 'rgba(8,12,24,0.9)';
            ctx.fillRect(bx1 - 1, by1 - 1, bw1 + 2, 11);
            ctx.fillStyle = mob.color;
            ctx.fillRect(bx1, by1, bw1 * Math.max(0, mob.hp / mob.maxHp), 9);
            if (player && player.spellId === 'retribution') {
                var thresh = (0, _CombatMath.computeRetributionThreshold)(player.level, player.junglerStacks >= 5);
                var frac2 = Math.min(1, thresh / mob.maxHp);
                ctx.fillStyle = mob.hp <= thresh ? '#FFFFFF' : '#EF4444';
                ctx.fillRect(bx1 + bw1 * frac2 - 1.5, by1 - 2, 3, 13);
            }
            if (isMajor || state.settings.basics.creepHpNumbers) {
                ctx.fillStyle = isMajor ? '#FEF08A' : '#FFFFFF';
                ctx.font = "bold " + (isMajor ? 11 : 10) + "px monospace";
                ctx.textAlign = 'center';
                var label = isMajor ? (mob.kind === 'lord' ? "LORD S" + mob.lordStage : 'TURTLE') + " " + Math.ceil(mob.hp) + " / " + mob.maxHp : "" + Math.ceil(mob.hp);
                ctx.fillText(label, sp6.x, by1 - 5);
            }
        }
        // E. Minion HP Bars (Super Minions & Allied Lord show thicker gold-trimmed bars!)
        for(var _iterator6 = _create_for_of_iterator_helper_loose(state.minions), _step6; !(_step6 = _iterator6()).done;){
            var m = _step6.value;
            if (!m.alive) continue;
            var sp7 = this.projectToScreen((0, _ThreeHeroModels.toThreeX)(m.x), m.kind === 'lord_ally' ? 5.6 : m.kind === 'super' ? 3.2 : 2.35, (0, _ThreeHeroModels.toThreeZ)(m.y));
            if (!sp7.visible || sp7.x < -40 || sp7.x > this.width + 40 || sp7.y < -20 || sp7.y > this.height + 20) continue;
            var bw2 = m.kind === 'lord_ally' ? 94 : m.kind === 'super' ? 42 : 28;
            var bh = m.kind === 'lord_ally' ? 7 : m.kind === 'super' ? 5 : 4;
            ctx.fillStyle = 'rgba(0,0,0,0.78)';
            ctx.fillRect(sp7.x - bw2 / 2 - 1, sp7.y - 1, bw2 + 2, bh + 2);
            ctx.fillStyle = m.kind === 'lord_ally' ? '#F59E0B' : m.team === 'blue' ? '#38BDF8' : '#FB7185';
            ctx.fillRect(sp7.x - bw2 / 2, sp7.y, bw2 * Math.max(0, m.hp / m.maxHp), bh);
            if (m.kind === 'lord_ally') {
                ctx.fillStyle = '#FEF08A';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText("LORD " + Math.ceil(m.hp), sp7.x, sp7.y - 4);
            }
        }
        // F. Hero Overhead MLBB Bars (Delayed Catch-Up Trail, Shield, 1000-HP Segments, Mana, Level, Bush Eye, Emote)
        for(var _iterator7 = _create_for_of_iterator_helper_loose(state.heroes), _step7; !(_step7 = _iterator7()).done;){
            var h = _step7.value;
            if (!h.alive) continue;
            if (h.team === 'red' && !state.visibleEnemyIds.has(h.id)) continue;
            var sp8 = this.projectToScreen((0, _ThreeHeroModels.toThreeX)(h.x), 4.4, (0, _ThreeHeroModels.toThreeZ)(h.y));
            if (!sp8.visible || sp8.x < -100 || sp8.x > this.width + 100 || sp8.y < -60 || sp8.y > this.height + 60) continue;
            var bw3 = 84;
            var bh1 = 9;
            var bx2 = sp8.x - bw3 / 2;
            var by2 = sp8.y;
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(8,12,24,0.75)';
            ctx.fillText(h.heroDef.name, sp8.x + 1, by2 - 6);
            ctx.fillStyle = h.isPlayer ? '#FDE047' : '#FFFFFF';
            ctx.fillText(h.heroDef.name, sp8.x, by2 - 7);
            ctx.fillStyle = 'rgba(8,12,24,0.92)';
            ctx.fillRect(bx2 - 1, by2 - 1, bw3 + 2, bh1 + 5);
            var trailW = bw3 * Math.max(0, Math.min(1, h.hpTrail / h.maxHp));
            ctx.fillStyle = '#F8FAFC';
            ctx.fillRect(bx2, by2, trailW, bh1);
            var hpW = bw3 * Math.max(0, Math.min(1, h.hp / h.maxHp));
            ctx.fillStyle = h.isPlayer ? '#2CE58B' : h.team === 'blue' ? '#38BDF8' : '#EF4444';
            ctx.fillRect(bx2, by2, hpW, bh1);
            if (h.shield > 0) {
                var shW = bw3 * Math.min(1, h.shield / h.maxHp);
                ctx.fillStyle = 'rgba(224,242,254,0.88)';
                ctx.fillRect(bx2 + Math.max(0, hpW - shW), by2, shW, 4);
            }
            var segs = Math.floor(h.maxHp / 1000);
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            for(var s = 1; s <= segs; s++){
                ctx.fillRect(bx2 + s * 1000 * bw3 / h.maxHp, by2, 1.4, bh1);
            }
            if (h.heroDef.resource !== 'none') {
                ctx.fillStyle = '#3B82F6';
                ctx.fillRect(bx2, by2 + bh1 + 1, bw3 * Math.max(0, h.mana / Math.max(1, h.maxMana)), 3);
            }
            // Level Badge
            ctx.beginPath();
            ctx.arc(bx2 - 10, by2 + 5, 10, 0, Math.PI * 2);
            ctx.fillStyle = '#0F172A';
            ctx.fill();
            ctx.strokeStyle = '#F5C451';
            ctx.lineWidth = 1.8;
            ctx.stroke();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 10px monospace';
            ctx.textBaseline = 'middle';
            ctx.fillText("" + h.level, bx2 - 10, by2 + 5.5);
            ctx.textBaseline = 'alphabetic';
            if (h.ccType) {
                ctx.fillStyle = h.ccType === 'suppression' ? '#EF4444' : '#FACC15';
                ctx.font = 'bold 11px sans-serif';
                ctx.fillText(h.ccType.toUpperCase(), sp8.x, by2 - 20);
            }
            // Bright Pulsing Overhead Vision Eye (👁️) when spotted inside a bush or revealed by enemies!
            if (h.team === 'blue' && h.spottedByEnemy && (h.inBush || h.isPlayer)) {
                var eyeY = by2 - (h.ccType ? 36 : 24);
                var pulse = 0.72 + Math.sin(state.matchTimeSec * 12) * 0.28;
                ctx.save();
                ctx.beginPath();
                ctx.arc(sp8.x, eyeY, 13 + pulse * 5, 0, Math.PI * 2);
                ctx.strokeStyle = h.inBush ? "rgba(239,68,68," + (0.75 * pulse).toFixed(2) + ")" : "rgba(250,204,21," + (0.7 * pulse).toFixed(2) + ")";
                ctx.lineWidth = 2.2;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(sp8.x, eyeY, 12, 0, Math.PI * 2);
                ctx.fillStyle = h.inBush ? 'rgba(239,68,68,0.95)' : 'rgba(250,204,21,0.92)';
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.font = '13px sans-serif';
                ctx.textBaseline = 'middle';
                ctx.fillText('👁️', sp8.x, eyeY + 1);
                ctx.textBaseline = 'alphabetic';
                ctx.restore();
            }
            // Emote Bubble
            if (h.activeEmote && h.activeEmote.ttl > 0) {
                var ey = by2 - 46;
                ctx.fillStyle = 'rgba(11,19,43,0.94)';
                ctx.strokeStyle = h.activeEmote.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(sp8.x - 40, ey - 16, 80, 30, 12);
                ctx.fill();
                ctx.stroke();
                ctx.font = '14px sans-serif';
                ctx.textBaseline = 'middle';
                ctx.fillText(h.activeEmote.icon, sp8.x - 20, ey);
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 10px sans-serif';
                ctx.fillText(h.activeEmote.callout, sp8.x + 12, ey);
                ctx.textBaseline = 'alphabetic';
            }
        }
        // G. Floating Damage Text (Layer 5 — Enlarged Gold Crits with !, Orange Physical, Purple Magic, White True, Green Heal, Cyan Shield)
        for(var _iterator8 = _create_for_of_iterator_helper_loose(state.vfxs), _step8; !(_step8 = _iterator8()).done;){
            var v = _step8.value;
            var alpha1 = Math.max(0, Math.min(1, v.ttl / Math.max(0.01, v.maxTtl)));
            if (v.kind === 'text' && v.text && state.settings.basics.damageText) {
                var sp9 = this.projectToScreen((0, _ThreeHeroModels.toThreeX)(v.x), 3.1 + (1 - alpha1) * 2.4, (0, _ThreeHeroModels.toThreeZ)(v.y));
                if (!sp9.visible) continue;
                ctx.save();
                ctx.globalAlpha = alpha1;
                ctx.font = "bold " + (v.isCrit ? 21 : 15) + "px sans-serif";
                ctx.textAlign = 'center';
                ctx.fillStyle = '#000000';
                ctx.fillText(v.text, sp9.x + 1.5, sp9.y + 1.5);
                ctx.fillStyle = v.color;
                ctx.fillText(v.text, sp9.x, sp9.y);
                ctx.restore();
            }
        }
        // H. Overhead Part 4 Stack Rings & CC Badges on 3D Projected Heroes
        for(var _iterator9 = _create_for_of_iterator_helper_loose(state.heroes), _step9; !(_step9 = _iterator9()).done;){
            var h1 = _step9.value;
            var _h_eggFormTimer;
            if (!h1.alive && ((_h_eggFormTimer = h1.eggFormTimer) != null ? _h_eggFormTimer : 0) <= 0) continue;
            if (h1.team === 'red' && !state.visibleEnemyIds.has(h1.id)) continue;
            var ccBadge = (0, _VfxSystem.getHeroCcBadge)(h1);
            var stackBadge = (0, _VfxSystem.getHeroStackBadge)(h1);
            if (!ccBadge && !stackBadge) continue;
            var sp10 = this.projectToScreen((0, _ThreeHeroModels.toThreeX)(h1.x), 5.9 * (h1.modelScale || 1) + (h1.leapZ || 0), (0, _ThreeHeroModels.toThreeZ)(h1.y));
            if (!sp10.visible) continue;
            if (ccBadge) {
                ctx.save();
                ctx.fillStyle = ccBadge.bg;
                ctx.fillRect(sp10.x - 36, sp10.y - 34, 72, 15);
                ctx.fillStyle = ccBadge.color;
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(ccBadge.text, sp10.x, sp10.y - 23);
                ctx.restore();
            }
            if (stackBadge) {
                ctx.save();
                ctx.fillStyle = 'rgba(11,19,43,0.88)';
                ctx.fillRect(sp10.x - 34, sp10.y + 18, 68, 13);
                ctx.fillStyle = stackBadge.color;
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(stackBadge.label, sp10.x, sp10.y + 27);
                ctx.restore();
            }
        }
        // I. Helcurt Dark Night Falls 3.5s Global Blind Vignette Overlay
        if (state.playerBlinded) {
            ctx.save();
            var grad = ctx.createRadialGradient(this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.14, this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.56);
            grad.addColorStop(0, 'rgba(15,6,32,0.16)');
            grad.addColorStop(1, 'rgba(5,2,18,0.88)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.restore();
        }
    };
    _proto.dispose = function dispose() {
        var _this_resizeObserver, _this_envTexture;
        if (this.disposed) return;
        this.disposed = true;
        (_this_resizeObserver = this.resizeObserver) == null ? void 0 : _this_resizeObserver.disconnect();
        this.resizeObserver = null;
        this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost);
        this.renderer.domElement.removeEventListener('webglcontextrestored', this.onContextRestored);
        this.clearDynamicGroup();
        if (this.mapHandle) {
            this.mapHandle.dispose();
            this.mapHandle = null;
        }
        this.projGeo.dispose();
        this.haloGeo.dispose();
        this.ringGeo.dispose();
        this.domeGeo.dispose();
        this.slashGeo.dispose();
        this.coinGeo.dispose();
        this.scene.traverse(function(obj) {
            var _m_geometry_userData;
            var m = obj;
            if (m.geometry && !((_m_geometry_userData = m.geometry.userData) == null ? void 0 : _m_geometry_userData.noDispose)) m.geometry.dispose();
            var mats = Array.isArray(m.material) ? m.material : m.material ? [
                m.material
            ] : [];
            for(var _iterator = _create_for_of_iterator_helper_loose(mats), _step; !(_step = _iterator()).done;){
                var mat = _step.value;
                var _mat_userData;
                if (!mat || ((_mat_userData = mat.userData) == null ? void 0 : _mat_userData.noDispose)) continue;
                mat.dispose();
            }
        });
        (_this_envTexture = this.envTexture) == null ? void 0 : _this_envTexture.dispose();
        this.envTexture = null;
        this.renderer.dispose();
        this.container.innerHTML = '';
    };
    return ThreeBattlefieldRenderer;
}();

});
// === MODULE: src/games/legends-arena/mlbb/engine/VfxSystem ===
ArcadeMod.define("src/games/legends-arena/mlbb/engine/VfxSystem", function(require, module, exports) {
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
    get ELEMENT_PALETTES () {
        return ELEMENT_PALETTES;
    },
    get HERO_ELEMENT_MAP () {
        return HERO_ELEMENT_MAP;
    },
    get getDamageNumberStyle () {
        return getDamageNumberStyle;
    },
    get getHeroCcBadge () {
        return getHeroCcBadge;
    },
    get getHeroElement () {
        return getHeroElement;
    },
    get getHeroStackBadge () {
        return getHeroStackBadge;
    },
    get resolveHeroSilhouetteState () {
        return resolveHeroSilhouetteState;
    },
    get spawnElementalTrailVfx () {
        return spawnElementalTrailVfx;
    }
});
var ELEMENT_PALETTES = {
    fire: {
        id: 'fire',
        primary: '#F97316',
        secondary: '#FACC15',
        glow: '#EF4444',
        label: 'Fire'
    },
    ice: {
        id: 'ice',
        primary: '#38BDF8',
        secondary: '#E0F2FE',
        glow: '#7DD3FC',
        label: 'Ice'
    },
    lightning: {
        id: 'lightning',
        primary: '#FACC15',
        secondary: '#38BDF8',
        glow: '#FEF08A',
        label: 'Lightning'
    },
    shadow: {
        id: 'shadow',
        primary: '#7E22CE',
        secondary: '#C084FC',
        glow: '#3B0764',
        label: 'Shadow'
    },
    holy: {
        id: 'holy',
        primary: '#FDE047',
        secondary: '#FFFFFF',
        glow: '#F59E0B',
        label: 'Holy'
    },
    water: {
        id: 'water',
        primary: '#06B6D4',
        secondary: '#67E8F9',
        glow: '#0EA5E9',
        label: 'Water'
    },
    wind: {
        id: 'wind',
        primary: '#34D399',
        secondary: '#A7F3D0',
        glow: '#10B981',
        label: 'Wind'
    },
    blood: {
        id: 'blood',
        primary: '#E11D48',
        secondary: '#FB7185',
        glow: '#9F1239',
        label: 'Blood'
    },
    astral: {
        id: 'astral',
        primary: '#A855F7',
        secondary: '#38BDF8',
        glow: '#E879F9',
        label: 'Astral'
    }
};
var HERO_ELEMENT_MAP = {
    aamon: 'shadow',
    akai: 'wind',
    aldous: 'shadow',
    alice: 'blood',
    alpha: 'lightning',
    alucard: 'holy',
    angela: 'holy',
    argus: 'shadow',
    arlott: 'blood',
    atlas: 'ice',
    aulus: 'fire',
    aurora: 'ice',
    badang: 'wind',
    balmond: 'blood',
    bane: 'water',
    barats: 'fire',
    baxia: 'fire',
    beatrix: 'fire',
    belerick: 'wind',
    benedetta: 'shadow',
    brody: 'shadow',
    bruno: 'lightning',
    carmilla: 'blood',
    cecilion: 'blood',
    chang_e: 'astral',
    chip: 'lightning',
    chou: 'wind',
    cici: 'fire',
    claude: 'lightning',
    clint: 'fire',
    cyclops: 'astral',
    diggie: 'holy',
    dyrroth: 'blood',
    edith: 'lightning',
    esmeralda: 'astral',
    estes: 'holy',
    eudora: 'lightning',
    fanny: 'wind',
    faramis: 'shadow',
    floryn: 'holy',
    franco: 'ice',
    fredrinn: 'astral',
    freya: 'holy',
    gatotkaca: 'fire',
    gloo: 'shadow',
    gord: 'astral',
    granger: 'blood',
    grock: 'wind',
    guinevere: 'astral',
    gusion: 'shadow',
    hanabi: 'blood',
    hanzo: 'shadow',
    harith: 'astral',
    harley: 'fire',
    hayabusa: 'shadow',
    helcurt: 'shadow',
    hilda: 'wind',
    hirara: 'astral',
    hylos: 'holy',
    irithel: 'wind',
    ixia: 'lightning',
    jawhead: 'fire',
    johnson: 'lightning',
    joy: 'lightning',
    julian: 'blood',
    kadita: 'water',
    // Part 5: All 67 K-Z Heroes (#67 Kagura - #133 Zilong)
    kagura: 'water',
    kaja: 'lightning',
    kalea: 'water',
    karina: 'shadow',
    karrie: 'holy',
    khaleed: 'wind',
    khufra: 'shadow',
    kimmy: 'lightning',
    lancelot: 'holy',
    lapu_lapu: 'fire',
    layla: 'lightning',
    leomord: 'shadow',
    lesley: 'fire',
    ling: 'wind',
    lolita: 'holy',
    lukas: 'holy',
    lunox: 'astral',
    luo_yi: 'astral',
    lylia: 'shadow',
    marcel: 'holy',
    martis: 'blood',
    masha: 'fire',
    mathilda: 'wind',
    melissa: 'shadow',
    minotaur: 'fire',
    minsitthar: 'holy',
    miya: 'astral',
    moskov: 'shadow',
    nana: 'astral',
    natalia: 'shadow',
    natan: 'astral',
    nolan: 'astral',
    novaria: 'astral',
    obsidia: 'shadow',
    odette: 'water',
    paquito: 'fire',
    pharsa: 'shadow',
    phoveus: 'shadow',
    popol_and_kupa: 'ice',
    rafaela: 'holy',
    roger: 'blood',
    ruby: 'blood',
    saber: 'lightning',
    selena: 'shadow',
    silvanna: 'holy',
    sora: 'wind',
    sun: 'fire',
    suyou: 'shadow',
    terizla: 'blood',
    thamuz: 'fire',
    tigreal: 'holy',
    uranus: 'holy',
    vale: 'wind',
    valentina: 'shadow',
    valir: 'fire',
    vexana: 'shadow',
    wanwan: 'wind',
    x_borg: 'fire',
    xavier: 'astral',
    yi_sun_shin: 'water',
    yin: 'fire',
    yu_zhong: 'blood',
    yve: 'astral',
    zetian: 'fire',
    zhask: 'shadow',
    zhuxin: 'fire',
    zilong: 'wind'
};
function getHeroElement(heroId, role) {
    var mapped = HERO_ELEMENT_MAP[heroId];
    if (mapped) return mapped;
    switch(role){
        case 'Mage':
            return 'astral';
        case 'Assassin':
            return 'shadow';
        case 'Support':
            return 'holy';
        case 'Tank':
            return 'ice';
        case 'Marksman':
            return 'lightning';
        default:
            return 'fire';
    }
}
function spawnElementalTrailVfx(callbacks, element, fromX, fromY, toX, toY, count) {
    if (count === void 0) count = 4;
    var pal = ELEMENT_PALETTES[element];
    var steps = Math.max(2, Math.min(7, count));
    for(var i = 0; i < steps; i++){
        var t = i / Math.max(1, steps - 1);
        var px = fromX + (toX - fromX) * t + (Math.random() - 0.5) * 26;
        var py = fromY + (toY - fromY) * t + (Math.random() - 0.5) * 26;
        callbacks.spawnVfx({
            kind: 'elemental',
            x: px,
            y: py,
            radius: 16 + i % 2 * 8,
            color: i % 2 === 0 ? pal.primary : pal.secondary,
            ttl: 0.36 + i * 0.04,
            maxTtl: 0.48,
            angle: Math.atan2(toY - fromY, toX - fromX),
            element: element
        });
    }
}
function resolveHeroSilhouetteState(h) {
    var _h_eggFormTimer, _h_deathImmuneTimer, _h_carDriveTimer, _h_wallPhaseTimer;
    var eggForm = ((_h_eggFormTimer = h.eggFormTimer) != null ? _h_eggFormTimer : 0) > 0;
    var deathImmune = ((_h_deathImmuneTimer = h.deathImmuneTimer) != null ? _h_deathImmuneTimer : 0) > 0;
    var carForm = ((_h_carDriveTimer = h.carDriveTimer) != null ? _h_carDriveTimer : 0) > 0;
    var translucent = h.stealthTimer > 0 || h.inBush && h.team === 'blue' || h.untargetableTimer > 0 || ((_h_wallPhaseTimer = h.wallPhaseTimer) != null ? _h_wallPhaseTimer : 0) > 0 || eggForm;
    var opacity = h.untargetableTimer > 0 || eggForm ? 0.48 : translucent ? 0.56 : 1.0;
    return {
        goldCcImmune: h.ccImmuneTimer > 0 || h.physImmuneTimer > 0 || deathImmune,
        cyanShielded: h.shield > 0,
        translucent: translucent,
        opacity: opacity,
        redHitFlash: h.hitFlashTimer > 0,
        frostFrozen: h.winterCrownTimer > 0 || h.ccType === 'freeze' || h.ccType === 'petrify',
        deathImmune: deathImmune,
        eggForm: eggForm,
        carForm: carForm,
        modelScale: Math.max(0.75, Math.min(1.5, h.modelScale || 1.0)),
        leapZ: Math.max(0, h.leapZ || 0),
        element: getHeroElement(h.heroDef.id, h.role)
    };
}
var CC_LABEL_MAP = {
    slow: {
        text: 'SLOWED',
        color: '#93C5FD'
    },
    grounded: {
        text: 'GROUNDED',
        color: '#F59E0B'
    },
    root: {
        text: 'ROOTED',
        color: '#34D399'
    },
    silence: {
        text: 'SILENCED',
        color: '#C084FC'
    },
    disarm: {
        text: 'DISARMED',
        color: '#FB923C'
    },
    taunt: {
        text: 'TAUNTED',
        color: '#F43F5E'
    },
    stun: {
        text: 'STUNNED',
        color: '#FACC15'
    },
    freeze: {
        text: 'FROZEN',
        color: '#38BDF8'
    },
    petrify: {
        text: 'PETRIFIED',
        color: '#CBD5E1'
    },
    transform: {
        text: 'MORPHED',
        color: '#F472B6'
    },
    airborne: {
        text: 'AIRBORNE',
        color: '#67E8F9'
    },
    knockback: {
        text: 'KNOCKED',
        color: '#FDBA74'
    },
    pull: {
        text: 'PULLED',
        color: '#F97316'
    },
    vortex: {
        text: 'VORTEX',
        color: '#A855F7'
    },
    suppression: {
        text: 'SUPPRESSED',
        color: '#EF4444'
    }
};
function getHeroCcBadge(h) {
    var _h_eggFormTimer, _h_deathImmuneTimer, _h_carDriveTimer, _h_yuZhongDragonTimer, _h_yinDomainTimer, _h_lingWallTimer, _h_wanwanFlyTimer, _h_yveGridTimer;
    if (((_h_eggFormTimer = h.eggFormTimer) != null ? _h_eggFormTimer : 0) > 0) {
        return {
            text: 'EGG FORM',
            color: '#FDE047',
            bg: 'rgba(15,23,42,0.88)'
        };
    }
    if (((_h_deathImmuneTimer = h.deathImmuneTimer) != null ? _h_deathImmuneTimer : 0) > 0) {
        return {
            text: 'IMMORTAL',
            color: '#4ADE80',
            bg: 'rgba(6,78,59,0.9)'
        };
    }
    if (((_h_carDriveTimer = h.carDriveTimer) != null ? _h_carDriveTimer : 0) > 0) {
        return {
            text: 'TURBO CAR',
            color: '#38BDF8',
            bg: 'rgba(12,74,110,0.9)'
        };
    }
    if (((_h_yuZhongDragonTimer = h.yuZhongDragonTimer) != null ? _h_yuZhongDragonTimer : 0) > 0) {
        return {
            text: 'BLACK DRAGON',
            color: '#F43F5E',
            bg: 'rgba(76,5,25,0.92)'
        };
    }
    if (((_h_yinDomainTimer = h.yinDomainTimer) != null ? _h_yinDomainTimer : 0) > 0) {
        return {
            text: '1V1 DOMAIN',
            color: '#F97316',
            bg: 'rgba(67,20,7,0.92)'
        };
    }
    if (((_h_lingWallTimer = h.lingWallTimer) != null ? _h_lingWallTimer : 0) > 0) {
        return {
            text: 'WALL PERCH',
            color: '#67E8F9',
            bg: 'rgba(8,51,68,0.9)'
        };
    }
    if (((_h_wanwanFlyTimer = h.wanwanFlyTimer) != null ? _h_wanwanFlyTimer : 0) > 0) {
        return {
            text: 'TANG BARRAGE',
            color: '#FDE047',
            bg: 'rgba(66,32,6,0.9)'
        };
    }
    if (((_h_yveGridTimer = h.yveGridTimer) != null ? _h_yveGridTimer : 0) > 0) {
        return {
            text: '7×7 REALM',
            color: '#E879F9',
            bg: 'rgba(59,7,100,0.92)'
        };
    }
    if (!h.ccType) return null;
    var info = CC_LABEL_MAP[h.ccType];
    return {
        text: info.text,
        color: info.color,
        bg: h.ccType === 'suppression' ? 'rgba(127,29,29,0.94)' : 'rgba(15,23,42,0.88)'
    };
}
var BEATRIX_GUN_LABELS = [
    'RENNER',
    'BENNETT',
    'WESKER',
    'NIBIRU'
];
function getHeroStackBadge(h) {
    var _ref;
    var _h_hiraraPrisms;
    var hid = h.heroDef.id;
    if (hid === 'beatrix') {
        var _h_beatrixGunIdx, _BEATRIX_GUN_LABELS_idx;
        var idx = (_h_beatrixGunIdx = h.beatrixGunIdx) != null ? _h_beatrixGunIdx : 0;
        return {
            count: idx + 1,
            max: 4,
            label: (_BEATRIX_GUN_LABELS_idx = BEATRIX_GUN_LABELS[idx]) != null ? _BEATRIX_GUN_LABELS_idx : 'GUN',
            color: '#F59E0B'
        };
    }
    if (hid === 'julian') {
        var _h_julianCastCount;
        var c = (_h_julianCastCount = h.julianCastCount) != null ? _h_julianCastCount : 0;
        return {
            count: c,
            max: 2,
            label: c >= 2 ? 'ENHANCED' : "CAST " + c + "/2",
            color: c >= 2 ? '#EF4444' : '#C084FC'
        };
    }
    if (hid === 'hirara' && ((_ref = (_h_hiraraPrisms = h.hiraraPrisms) == null ? void 0 : _h_hiraraPrisms.length) != null ? _ref : 0) > 0) {
        return {
            count: h.hiraraPrisms.length,
            max: 3,
            label: "PRISM \xd7" + h.hiraraPrisms.length,
            color: '#38BDF8'
        };
    }
    if (hid === 'barats' && h.passiveStacks > 0) {
        return {
            count: h.passiveStacks,
            max: 10,
            label: "BIG GUY " + h.passiveStacks,
            color: '#F97316'
        };
    }
    if (hid === 'aldous' && h.passiveStacks > 0) {
        return {
            count: h.passiveStacks,
            max: 500,
            label: "SOUL " + h.passiveStacks,
            color: '#FACC15'
        };
    }
    if (hid === 'cecilion' && h.passiveStacks > 0) {
        return {
            count: h.passiveStacks,
            max: 999,
            label: "BAT " + h.passiveStacks,
            color: '#E11D48'
        };
    }
    if (hid === 'masha') {
        var _h_mashaBars;
        var bars = (_h_mashaBars = h.mashaBars) != null ? _h_mashaBars : 3;
        return {
            count: bars,
            max: 3,
            label: "HP BARS " + bars + "/3",
            color: '#FB923C'
        };
    }
    if (hid === 'paquito' && h.passiveStacks > 0) {
        return {
            count: h.passiveStacks,
            max: 3,
            label: h.passiveStacks >= 3 ? 'CHAMP READY' : "CHAMPS " + h.passiveStacks + "/3",
            color: '#EF4444'
        };
    }
    if (hid === 'luo_yi') {
        var isYang = h.passiveStacks % 2 === 0;
        return {
            count: 1,
            max: 2,
            label: isYang ? 'YANG ☀' : 'YIN ☾',
            color: isYang ? '#FACC15' : '#A855F7'
        };
    }
    if (hid === 'uranus' && h.passiveStacks > 0) {
        return {
            count: h.passiveStacks,
            max: 20,
            label: "RADIANCE " + h.passiveStacks,
            color: '#FDE047'
        };
    }
    if (h.altFormActive && (hid === 'roger' || hid === 'selena' || hid === 'lapu_lapu' || hid === 'leomord' || hid === 'lukas' || hid === 'sora' || hid === 'suyou' || hid === 'zhask')) {
        var _labelMap_hid;
        var labelMap = {
            roger: 'WOLF FORM',
            selena: 'ABYSSAL',
            lapu_lapu: 'HEAVY SWORD',
            leomord: 'BARBIEL',
            lukas: 'SACRED BEAST',
            sora: 'STORM FORM',
            suyou: 'IMMORTAL',
            zhask: 'DOMINATOR'
        };
        return {
            count: 1,
            max: 1,
            label: (_labelMap_hid = labelMap[hid]) != null ? _labelMap_hid : 'ENHANCED',
            color: '#F5C451'
        };
    }
    if (h.passiveStacks > 0) {
        return {
            count: h.passiveStacks,
            max: 5,
            label: "\xd7" + h.passiveStacks,
            color: h.skinAccent || '#FACC15'
        };
    }
    return null;
}
function getDamageNumberStyle(dmgType, isCrit, kind) {
    if (kind === void 0) kind = 'damage';
    if (kind === 'heal') return {
        color: '#2CE58B',
        fontSize: 15
    };
    if (kind === 'shield') return {
        color: '#38BDF8',
        fontSize: 14
    };
    if (dmgType === 'true') return {
        color: '#F8FAFC',
        fontSize: isCrit ? 20 : 16
    };
    if (isCrit) return {
        color: '#FACC15',
        fontSize: 21
    };
    if (dmgType === 'magic') return {
        color: '#C084FC',
        fontSize: 15
    };
    return {
        color: '#FB923C',
        fontSize: 15
    };
}

});
// === MODULE: src/games/legends-arena/mlbb/engine/VisionSystem ===
ArcadeMod.define("src/games/legends-arena/mlbb/engine/VisionSystem", function(require, module, exports) {
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
    get BUSH_FACECHECK_RADIUS () {
        return BUSH_FACECHECK_RADIUS;
    },
    get FOG_GHOST_DURATION_SEC () {
        return FOG_GHOST_DURATION_SEC;
    },
    get HERO_VISION_RADIUS () {
        return HERO_VISION_RADIUS;
    },
    get MINION_VISION_RADIUS () {
        return MINION_VISION_RADIUS;
    },
    get MlbbVisionSystem () {
        return MlbbVisionSystem;
    },
    get TURRET_VISION_RADIUS () {
        return TURRET_VISION_RADIUS;
    }
});
var _mapData = require("../data/mapData");
var _CombatMath = require("./CombatMath");
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
var HERO_VISION_RADIUS = 560;
var MINION_VISION_RADIUS = 360;
var TURRET_VISION_RADIUS = 540;
var BUSH_FACECHECK_RADIUS = 135;
var FOG_GHOST_DURATION_SEC = 2.0;
var MlbbVisionSystem = /*#__PURE__*/ function() {
    "use strict";
    function MlbbVisionSystem() {
        this.prevVisibleEnemies = new Map();
        this.ghosts = [];
        this.globalRevealBlueTimer = 0; // Reveals all red heroes to blue (Aldous/YSS/Zetian Ult)
        this.globalRevealRedTimer = 0;
    }
    var _proto = MlbbVisionSystem.prototype;
    _proto.triggerGlobalReveal = function triggerGlobalReveal(forTeam, durationSec) {
        if (durationSec === void 0) durationSec = 5.0;
        if (forTeam === 'blue') {
            this.globalRevealBlueTimer = Math.max(this.globalRevealBlueTimer, durationSec);
        } else {
            this.globalRevealRedTimer = Math.max(this.globalRevealRedTimer, durationSec);
        }
    };
    _proto.getGlobalRevealRemaining = function getGlobalRevealRemaining(forTeam) {
        return forTeam === 'blue' ? this.globalRevealBlueTimer : this.globalRevealRedTimer;
    };
    _proto.isPointVisibleToTeam = function isPointVisibleToTeam(px, py, inBush, stealthActive, revealedTimer, observerCircles, globalRevealActive, mapVariant) {
        if (globalRevealActive || revealedTimer > 0) return true;
        var bush = inBush ? (0, _mapData.isPointInBush)(px, py, mapVariant) : null;
        for(var _iterator = _create_for_of_iterator_helper_loose(observerCircles), _step; !(_step = _iterator()).done;){
            var c = _step.value;
            var d = (0, _CombatMath.dist)(px, py, c.x, c.y);
            if (d > c.radius) continue;
            if (stealthActive && d > BUSH_FACECHECK_RADIUS && !c.revealsBush) continue;
            if (bush) {
                // Must either be inside the same bush, within facecheck range, or revealed by a Wisp/Walkie Grass ward
                if (c.revealsBush || d <= BUSH_FACECHECK_RADIUS) return true;
                var obsBush = (0, _mapData.isPointInBush)(c.x, c.y, mapVariant);
                if (obsBush && obsBush.id === bush.id) return true;
                continue;
            }
            return true;
        }
        return false;
    };
    _proto.step = function step(dt, heroes, minions, turrets, wisps, mapVariant) {
        var _this, _loop = function() {
            var h = _step4.value;
            var _h_recentlyAttackedTimer;
            if (!h.alive) return "continue";
            var isStealthed = h.stealthTimer > 0;
            var attackedRecently = ((_h_recentlyAttackedTimer = h.recentlyAttackedTimer) != null ? _h_recentlyAttackedTimer : 0) > 0;
            var effRevealed = attackedRecently ? Math.max(h.revealedTimer, 1.0) : h.revealedTimer;
            if (h.team === 'red') {
                var visible = _this.isPointVisibleToTeam(h.x, h.y, h.inBush, isStealthed, effRevealed, blueCircles, _this.globalRevealBlueTimer > 0, mapVariant);
                if (visible) {
                    visibleEnemyIds.add(h.id);
                    _this.prevVisibleEnemies.set(h.id, {
                        heroId: h.heroId,
                        name: h.name,
                        x: h.x,
                        y: h.y,
                        color: h.color
                    });
                    // Clear any existing fog ghost for this enemy now that they are visible again
                    _this.ghosts = _this.ghosts.filter(function(g) {
                        return g.heroId !== h.heroId || g.name !== h.name;
                    });
                } else if (_this.prevVisibleEnemies.has(h.id)) {
                    // Enemy just vanished into Fog of War or a bush -> spawn 2s fading ghost silhouette!
                    var last = _this.prevVisibleEnemies.get(h.id);
                    _this.prevVisibleEnemies.delete(h.id);
                    _this.ghosts = _this.ghosts.filter(function(g) {
                        return g.name !== last.name;
                    });
                    _this.ghosts.push({
                        heroId: last.heroId,
                        name: last.name,
                        team: 'red',
                        x: last.x,
                        y: last.y,
                        color: last.color,
                        ttl: FOG_GHOST_DURATION_SEC,
                        maxTtl: FOG_GHOST_DURATION_SEC
                    });
                }
            } else {
                // Check if blue hero is spotted by red team (triggers overhead Yellow/Red Eye icon!)
                var spotted = _this.isPointVisibleToTeam(h.x, h.y, h.inBush, isStealthed, effRevealed, redCircles, _this.globalRevealRedTimer > 0, mapVariant);
                if (spotted) {
                    spottedAllyIds.add(h.id);
                }
            }
        };
        this.globalRevealBlueTimer = Math.max(0, this.globalRevealBlueTimer - dt);
        this.globalRevealRedTimer = Math.max(0, this.globalRevealRedTimer - dt);
        var blueCircles = [];
        var redCircles = [];
        for(var _iterator = _create_for_of_iterator_helper_loose(heroes), _step; !(_step = _iterator()).done;){
            var h = _step.value;
            if (!h.alive) continue;
            var c = {
                x: h.x,
                y: h.y,
                radius: HERO_VISION_RADIUS
            };
            if (h.team === 'blue') blueCircles.push(c);
            else redCircles.push(c);
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(minions), _step1; !(_step1 = _iterator1()).done;){
            var m = _step1.value;
            if (!m.alive) continue;
            var c1 = {
                x: m.x,
                y: m.y,
                radius: MINION_VISION_RADIUS
            };
            if (m.team === 'blue') blueCircles.push(c1);
            else redCircles.push(c1);
        }
        for(var _iterator2 = _create_for_of_iterator_helper_loose(turrets), _step2; !(_step2 = _iterator2()).done;){
            var t = _step2.value;
            if (!t.alive) continue;
            var c2 = {
                x: t.x,
                y: t.y,
                radius: TURRET_VISION_RADIUS,
                revealsBush: true
            };
            if (t.team === 'blue') blueCircles.push(c2);
            else redCircles.push(c2);
        }
        for(var _iterator3 = _create_for_of_iterator_helper_loose(wisps), _step3; !(_step3 = _iterator3()).done;){
            var w = _step3.value;
            var c3 = {
                x: w.x,
                y: w.y,
                radius: w.radius,
                revealsBush: true
            };
            if (!w.team || w.team === 'both' || w.team === 'blue') blueCircles.push(c3);
            if (!w.team || w.team === 'both' || w.team === 'red') redCircles.push(c3);
        }
        var visibleEnemyIds = new Set();
        var spottedAllyIds = new Set();
        // Decay existing fog ghosts before processing new vanish events this tick
        for(var i = this.ghosts.length - 1; i >= 0; i--){
            this.ghosts[i].ttl -= dt;
            if (this.ghosts[i].ttl <= 0) {
                this.ghosts.splice(i, 1);
            }
        }
        for(var _iterator4 = _create_for_of_iterator_helper_loose(heroes), _step4; !(_step4 = _iterator4()).done;)_this = this, _loop();
        return {
            blueVisionCircles: blueCircles,
            redVisionCircles: redCircles,
            visibleEnemyIds: visibleEnemyIds,
            spottedAllyIds: spottedAllyIds,
            fogGhosts: [].concat(this.ghosts)
        };
    };
    return MlbbVisionSystem;
}();

});
// === MODULE: src/games/legends-arena/mlbb/storage ===
ArcadeMod.define("src/games/legends-arena/mlbb/storage", function(require, module, exports) {
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
    get createDefaultCustomUi () {
        return createDefaultCustomUi;
    },
    get createDefaultMlbbSave () {
        return createDefaultMlbbSave;
    },
    get loadMlbbSave () {
        return loadMlbbSave;
    },
    get resetMlbbSave () {
        return resetMlbbSave;
    },
    get saveMlbbProfile () {
        return saveMlbbProfile;
    }
});
var _storage = require("../../../core/storage");
var _emblems = require("./data/emblems");
var _heroes = require("./data/heroes");
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
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var MLBB_SAVE_KEY = 'mlbb_legends_arena_v1';
function createDefaultCustomUi(preset) {
    var base = {
        minimap: {
            id: 'minimap',
            label: 'Minimap',
            xPct: 2,
            yPct: 3,
            scale: 1.0,
            opacity: 0.96
        },
        shopBar: {
            id: 'shopBar',
            label: 'Shop & Quick-Buy',
            xPct: 2,
            yPct: 36,
            scale: 1.0,
            opacity: 0.95
        },
        joystick: {
            id: 'joystick',
            label: 'Move Joystick',
            xPct: 8,
            yPct: 76,
            scale: 1.0,
            opacity: 0.92
        },
        recall: {
            id: 'recall',
            label: 'Recall',
            xPct: 43,
            yPct: 89,
            scale: 1.0,
            opacity: 0.94
        },
        regen: {
            id: 'regen',
            label: 'Regen',
            xPct: 50,
            yPct: 89,
            scale: 1.0,
            opacity: 0.94
        },
        spell: {
            id: 'spell',
            label: 'Battle Spell',
            xPct: 57,
            yPct: 89,
            scale: 1.0,
            opacity: 0.96
        },
        activeItem: {
            id: 'activeItem',
            label: 'Active Item',
            xPct: 64,
            yPct: 78,
            scale: 1.0,
            opacity: 0.95
        },
        skill1: {
            id: 'skill1',
            label: 'Skill 1',
            xPct: 73,
            yPct: 87,
            scale: 1.0,
            opacity: 0.96
        },
        skill2: {
            id: 'skill2',
            label: 'Skill 2',
            xPct: 79,
            yPct: 71,
            scale: 1.0,
            opacity: 0.96
        },
        skill3: {
            id: 'skill3',
            label: 'Ultimate',
            xPct: 89,
            yPct: 62,
            scale: 1.0,
            opacity: 0.96
        },
        basicAtk: {
            id: 'basicAtk',
            label: 'Basic Attack',
            xPct: 89,
            yPct: 84,
            scale: 1.0,
            opacity: 0.98
        },
        minionBtn: {
            id: 'minionBtn',
            label: 'Minion Target',
            xPct: 81,
            yPct: 91,
            scale: 0.95,
            opacity: 0.94
        },
        turretBtn: {
            id: 'turretBtn',
            label: 'Turret Target',
            xPct: 95,
            yPct: 73,
            scale: 0.95,
            opacity: 0.94
        },
        cancelCast: {
            id: 'cancelCast',
            label: 'Cancel Cast (X)',
            xPct: 90,
            yPct: 24,
            scale: 1.0,
            opacity: 0.96
        },
        pings: {
            id: 'pings',
            label: 'Tactical Pings',
            xPct: 95,
            yPct: 22,
            scale: 1.0,
            opacity: 0.94
        },
        comms: {
            id: 'comms',
            label: 'Chat & Emotes',
            xPct: 95,
            yPct: 44,
            scale: 1.0,
            opacity: 0.94
        }
    };
    if (preset === '4skill') {
        base.skill4 = {
            id: 'skill4',
            label: 'Skill 4',
            xPct: 72,
            yPct: 68,
            scale: 0.95,
            opacity: 0.96
        };
    }
    return base;
}
function createDefaultMlbbSave() {
    var starterHeroes = _heroes.MLBB_ICONIC_HEROES.filter(function(h) {
        return h.starter;
    }).map(function(h) {
        return h.id;
    });
    var savedBuilds = {};
    var activeBuildSlot = {};
    var ownedSkins = {};
    var equippedSkins = {};
    var heroStats = {};
    for(var _iterator = _create_for_of_iterator_helper_loose(_heroes.MLBB_ICONIC_HEROES), _step; !(_step = _iterator()).done;){
        var h = _step.value;
        savedBuilds[h.id] = [
            [].concat(h.recommendedBuild),
            [].concat(h.recommendedBuild.slice(0, 4), [
                'athenas_shield',
                'immortality'
            ]),
            [].concat(h.recommendedBuild.slice(0, 4), [
                'sea_halberd',
                'blade_of_despair'
            ])
        ];
        activeBuildSlot[h.id] = 0;
        ownedSkins[h.id] = [
            'default'
        ];
        equippedSkins[h.id] = 'default';
        heroStats[h.id] = {
            matches: h.starter ? 3 : 0,
            wins: h.starter ? 2 : 0,
            mmr: 1200 + (h.starter ? 240 : 0),
            mastery: h.starter ? 45 : 0
        };
    }
    return {
        version: 1,
        accountId: '941827401',
        serverId: '3024',
        name: _storage.playerState.username || 'DawnCommander',
        avatar: '⚔️',
        border: 'Imperial Gold',
        countryFlag: '🇵🇭',
        gender: 'Unspecified',
        bio: 'Road to Mythical Glory — Fill any lane!',
        battleTitle: 'Supreme Mid Laner',
        level: 30,
        exp: 680,
        rankTierIdx: 6,
        rankStars: 25,
        starProtectionPts: 650,
        bp: 32500,
        tickets: 480,
        diamonds: 650,
        fragments: 145,
        charisma: 4820,
        creditScore: 110,
        dailyActivity: 420,
        claimedDailyMilestones: [
            200
        ],
        dailyTasksDone: [
            'task_login'
        ],
        weeklyActivity: 520,
        claimedActivityMilestones: [
            200
        ],
        starlightLevel: 12,
        starlightXp: 640,
        claimedStarlightLevels: [
            1,
            5,
            10
        ],
        claimedMailIds: [],
        claimedAchievementIds: [],
        claimedMasteryChapters: {},
        ownedHeroIds: starterHeroes,
        ownedSkins: ownedSkins,
        equippedSkins: equippedSkins,
        showcaseHeroId: 'miya',
        selectedHeroId: 'miya',
        selectedLane: 'Gold',
        selectedMode: 'ranked',
        selectedMapVariant: 'random',
        selectedSpellId: 'flicker',
        selectedEmblemId: 'marksman',
        emblemTalents: {
            common: {
                t1: 'vitality',
                t2: 'bargain_hunter',
                t3: 'quantum_charge'
            },
            tank: {
                t1: 'vitality',
                t2: 'pull_yourself_together',
                t3: 'concussive_blast'
            },
            assassin: {
                t1: 'rupture',
                t2: 'seasoned_hunter',
                t3: 'killing_spree'
            },
            mage: {
                t1: 'thrill',
                t2: 'weapon_master',
                t3: 'lethal_ignition'
            },
            fighter: {
                t1: 'thrill',
                t2: 'festival_of_blood',
                t3: 'brave_smite'
            },
            support: {
                t1: 'agility',
                t2: 'pull_yourself_together',
                t3: 'impure_rage'
            },
            marksman: {
                t1: 'swift',
                t2: 'weapon_master',
                t3: 'quantum_charge'
            }
        },
        savedBuilds: savedBuilds,
        activeBuildSlot: activeBuildSlot,
        quickChatIds: [
            'qc_attack',
            'qc_retreat',
            'qc_gather_turtle',
            'qc_gather_lord',
            'qc_push',
            'qc_well_played'
        ],
        ownedEmotes: [].concat(_emblems.MLBB_STARTER_EMOTES, [
            'emote_crown',
            'emote_dragon'
        ]),
        equippedEmotes: [].concat(_emblems.MLBB_STARTER_EMOTES),
        ownedEffects: {
            recall: [
                'rec_dawn'
            ],
            spawn: [
                'spn_classic'
            ],
            elim: [
                'elm_default'
            ],
            killNotif: [
                'kn_default'
            ]
        },
        equippedEffects: {
            recall: 'rec_dawn',
            spawn: 'spn_classic',
            elim: 'elm_default',
            killNotif: 'kn_default'
        },
        backpack: {
            trialCards: 3,
            doubleBpCards: 2,
            doubleExpCards: 2,
            starProtectionCards: 2,
            starRaisingCards: 1,
            chests: 2
        },
        squad: {
            name: 'Dawn Vanguard',
            tag: 'DVG',
            slogan: 'Objective first, Savage second.',
            activity: 8420,
            rank: 'Regional #14'
        },
        matchHistory: [
            {
                id: 'seed_match_1',
                timestamp: Date.now() - 3600 * 1000 * 5,
                mode: 'ranked',
                victory: true,
                durationSec: 942,
                blueKills: 29,
                redKills: 18,
                playerHeroId: 'miya',
                playerHeroName: 'Miya',
                kda: [
                    11,
                    2,
                    9
                ],
                rating: 11.4,
                medal: 'MVP',
                items: [
                    'swift_boots',
                    'windtalker',
                    'berserkers_fury',
                    'haas_claws',
                    'malefic_roar',
                    'wind_of_nature'
                ],
                players: [
                    {
                        id: 'b0',
                        name: _storage.playerState.username || 'DawnCommander',
                        team: 'blue',
                        heroId: 'miya',
                        heroName: 'Miya',
                        role: 'Marksman',
                        lane: 'Gold',
                        isPlayer: true,
                        level: 15,
                        kills: 11,
                        deaths: 2,
                        assists: 9,
                        gold: 13840,
                        items: [
                            'swift_boots',
                            'windtalker',
                            'berserkers_fury',
                            'haas_claws',
                            'malefic_roar',
                            'wind_of_nature'
                        ],
                        spellId: 'inspire',
                        emblemId: 'marksman',
                        coreTalentId: 'quantum_charge',
                        damageDealt: 112400,
                        damageTaken: 41200,
                        turretDamage: 18900,
                        teamfightPct: 69,
                        rating: 11.4,
                        medal: 'MVP',
                        isMvp: true
                    },
                    {
                        id: 'b1',
                        name: 'TigrealSet',
                        team: 'blue',
                        heroId: 'tigreal',
                        heroName: 'Tigreal',
                        role: 'Tank',
                        lane: 'Roam',
                        isPlayer: false,
                        level: 13,
                        kills: 2,
                        deaths: 3,
                        assists: 18,
                        gold: 8420,
                        items: [
                            'tough_boots',
                            'dominance_ice',
                            'athenas_shield',
                            'antique_cuirass',
                            'immortality'
                        ],
                        spellId: 'flicker',
                        emblemId: 'tank',
                        coreTalentId: 'concussive_blast',
                        damageDealt: 28500,
                        damageTaken: 128900,
                        turretDamage: 2400,
                        teamfightPct: 79,
                        rating: 9.8,
                        medal: 'Gold',
                        isMvp: false
                    },
                    {
                        id: 'b2',
                        name: 'LanceDash',
                        team: 'blue',
                        heroId: 'lancelot',
                        heroName: 'Lancelot',
                        role: 'Assassin',
                        lane: 'Jungle',
                        isPlayer: false,
                        level: 15,
                        kills: 9,
                        deaths: 4,
                        assists: 7,
                        gold: 12950,
                        items: [
                            'tough_boots',
                            'hunter_strike',
                            'endless_battle',
                            'blade_of_the_heptaseas',
                            'malefic_roar',
                            'immortality'
                        ],
                        spellId: 'retribution',
                        emblemId: 'assassin',
                        coreTalentId: 'killing_spree',
                        damageDealt: 89300,
                        damageTaken: 52100,
                        turretDamage: 6200,
                        teamfightPct: 62,
                        rating: 9.4,
                        medal: 'Gold',
                        isMvp: false
                    },
                    {
                        id: 'b3',
                        name: 'KaguraMain',
                        team: 'blue',
                        heroId: 'eudora',
                        heroName: 'Eudora',
                        role: 'Mage',
                        lane: 'Mid',
                        isPlayer: false,
                        level: 14,
                        kills: 5,
                        deaths: 4,
                        assists: 11,
                        gold: 10820,
                        items: [
                            'arcane_boots',
                            'genius_wand',
                            'lightning_truncheon',
                            'holy_crystal',
                            'divine_glaive'
                        ],
                        spellId: 'flicker',
                        emblemId: 'mage',
                        coreTalentId: 'lethal_ignition',
                        damageDealt: 76200,
                        damageTaken: 35600,
                        turretDamage: 4100,
                        teamfightPct: 58,
                        rating: 8.6,
                        medal: 'Gold',
                        isMvp: false
                    },
                    {
                        id: 'b4',
                        name: 'ZilongBot',
                        team: 'blue',
                        heroId: 'zilong',
                        heroName: 'Zilong',
                        role: 'Fighter',
                        lane: 'EXP',
                        isPlayer: false,
                        level: 14,
                        kills: 2,
                        deaths: 5,
                        assists: 6,
                        gold: 9940,
                        items: [
                            'swift_boots',
                            'windtalker',
                            'berserkers_fury',
                            'great_dragon_spear',
                            'blade_of_despair'
                        ],
                        spellId: 'inspire',
                        emblemId: 'fighter',
                        coreTalentId: 'brave_smite',
                        damageDealt: 51400,
                        damageTaken: 64200,
                        turretDamage: 14500,
                        teamfightPct: 44,
                        rating: 7.5,
                        medal: 'Silver',
                        isMvp: false
                    },
                    {
                        id: 'r0',
                        name: 'ShadowKain',
                        team: 'red',
                        heroId: 'layla',
                        heroName: 'Layla',
                        role: 'Marksman',
                        lane: 'Gold',
                        isPlayer: false,
                        level: 14,
                        kills: 7,
                        deaths: 6,
                        assists: 4,
                        gold: 11200,
                        items: [
                            'swift_boots',
                            'windtalker',
                            'berserkers_fury',
                            'haas_claws',
                            'malefic_roar'
                        ],
                        spellId: 'flicker',
                        emblemId: 'marksman',
                        coreTalentId: 'quantum_charge',
                        damageDealt: 78400,
                        damageTaken: 46100,
                        turretDamage: 7400,
                        teamfightPct: 61,
                        rating: 8.2,
                        medal: 'MVP',
                        isMvp: true
                    },
                    {
                        id: 'r1',
                        name: 'VexanaPro',
                        team: 'red',
                        heroId: 'nana',
                        heroName: 'Nana',
                        role: 'Mage',
                        lane: 'Mid',
                        isPlayer: false,
                        level: 13,
                        kills: 4,
                        deaths: 5,
                        assists: 8,
                        gold: 9600,
                        items: [
                            'arcane_boots',
                            'enchanted_talisman',
                            'lightning_truncheon',
                            'holy_crystal'
                        ],
                        spellId: 'flameshot',
                        emblemId: 'mage',
                        coreTalentId: 'lethal_ignition',
                        damageDealt: 62100,
                        damageTaken: 38200,
                        turretDamage: 2800,
                        teamfightPct: 67,
                        rating: 7.4,
                        medal: 'Silver',
                        isMvp: false
                    },
                    {
                        id: 'r2',
                        name: 'CrimsonFang',
                        team: 'red',
                        heroId: 'alucard',
                        heroName: 'Alucard',
                        role: 'Fighter',
                        lane: 'Jungle',
                        isPlayer: false,
                        level: 13,
                        kills: 4,
                        deaths: 6,
                        assists: 5,
                        gold: 9850,
                        items: [
                            'tough_boots',
                            'endless_battle',
                            'hunter_strike',
                            'blade_of_despair'
                        ],
                        spellId: 'retribution',
                        emblemId: 'assassin',
                        coreTalentId: 'killing_spree',
                        damageDealt: 58300,
                        damageTaken: 71400,
                        turretDamage: 3200,
                        teamfightPct: 50,
                        rating: 6.8,
                        medal: 'Silver',
                        isMvp: false
                    },
                    {
                        id: 'r3',
                        name: 'Aetheris',
                        team: 'red',
                        heroId: 'franco',
                        heroName: 'Franco',
                        role: 'Tank',
                        lane: 'Roam',
                        isPlayer: false,
                        level: 12,
                        kills: 1,
                        deaths: 6,
                        assists: 9,
                        gold: 7210,
                        items: [
                            'rapid_boots',
                            'dominance_ice',
                            'athenas_shield',
                            'immortality'
                        ],
                        spellId: 'flicker',
                        emblemId: 'tank',
                        coreTalentId: 'concussive_blast',
                        damageDealt: 22100,
                        damageTaken: 98400,
                        turretDamage: 900,
                        teamfightPct: 55,
                        rating: 6.4,
                        medal: 'Silver',
                        isMvp: false
                    },
                    {
                        id: 'r4',
                        name: 'GrimBlade',
                        team: 'red',
                        heroId: 'balmond',
                        heroName: 'Balmond',
                        role: 'Fighter',
                        lane: 'EXP',
                        isPlayer: false,
                        level: 13,
                        kills: 2,
                        deaths: 6,
                        assists: 4,
                        gold: 8820,
                        items: [
                            'warrior_boots',
                            'war_axe',
                            'cursed_helmet',
                            'brute_force_breastplate'
                        ],
                        spellId: 'vengeance',
                        emblemId: 'fighter',
                        coreTalentId: 'brave_smite',
                        damageDealt: 44600,
                        damageTaken: 86500,
                        turretDamage: 4100,
                        teamfightPct: 39,
                        rating: 5.9,
                        medal: 'Bronze',
                        isMvp: false
                    }
                ]
            }
        ],
        heroStats: heroStats,
        likesReceived: [
            {
                id: 'lk1',
                from: 'KairiShadow',
                hero: 'Lancelot',
                likedBack: false
            },
            {
                id: 'lk2',
                from: 'OhMyV33',
                hero: 'Estes',
                likedBack: true
            },
            {
                id: 'lk3',
                from: 'WiseRetri',
                hero: 'Tigreal',
                likedBack: false
            }
        ],
        namecardLikes: 148,
        namecardSuperLikes: 36,
        activeIdCard: 'mythic_medal',
        selectedServerRegion: 'SEA-3024 (Original)',
        boundAccounts: {
            moonton: true,
            google: true,
            apple: false,
            facebook: false
        },
        affinityLinks: [
            {
                id: 'af1',
                name: 'KaguraMain',
                role: 'Partner',
                level: 6,
                pts: 4820,
                heroId: 'eudora'
            },
            {
                id: 'af2',
                name: 'TigrealSet',
                role: 'Bro',
                level: 4,
                pts: 2450,
                heroId: 'tigreal'
            },
            {
                id: 'af3',
                name: 'EstesHeal',
                role: 'Bestie',
                level: 5,
                pts: 3190,
                heroId: 'estes'
            },
            {
                id: 'af4',
                name: 'LanceDash',
                role: 'Confidant',
                level: 3,
                pts: 1620,
                heroId: 'lancelot'
            }
        ],
        photoAlbum: [
            {
                id: 'ph1',
                caption: 'Late-game Lord steal & Savage wipe!',
                heroId: 'miya',
                date: 'Season 36',
                likes: 42
            },
            {
                id: 'ph2',
                caption: '5-man Conceal Tigreal set in Mid',
                heroId: 'tigreal',
                date: 'Season 36',
                likes: 31
            },
            {
                id: 'ph3',
                caption: 'Reached Mythic 25★ with 72% WR',
                heroId: 'lancelot',
                date: 'Season 36',
                likes: 59
            }
        ],
        esportsPredictions: {},
        arcadeSubMode: 'mayhem',
        customSubMode: '5v5',
        secondaryPasswordEnabled: false,
        settings: {
            basics: {
                outline: true,
                screenShake: true,
                cameraHeight: 'high',
                shadows: true,
                creepHpNumbers: true,
                damageText: true,
                colorblind: 'off',
                refreshRate: 60,
                graphicsQuality: 'high',
                hdMode: true,
                mapTheme: 'imperial_sanctuary'
            },
            controls: {
                targetingMethod: 'advanced',
                targetingPriority: 'lowest_hp',
                heroLockMode: true,
                skillSmartTargeting: true,
                basicSmartTargeting: true,
                attackAssist: true,
                aimPanning: true,
                joystickPosition: 'fixed',
                skillCancelMethod: 'drag_to_x',
                cameraPanSensitivity: 65,
                autoLevelUp: false,
                autoBuy: false,
                aiDifficulty: 'epic'
            },
            interface: {
                battlefieldUiOpacity: 88,
                activeSkillPreset: '3skill',
                editorSnapToGrid: true,
                customUi3Skill: createDefaultCustomUi('3skill'),
                customUi4Skill: createDefaultCustomUi('4skill')
            },
            sound: {
                master: 80,
                sfx: 85,
                bgm: 60,
                voice: 80,
                mic: 70,
                language: 'English',
                killAnnouncer: true
            },
            network: {
                speedMode: true,
                networkBoost: true,
                showPingFps: true
            },
            privacy: {
                hideMatchHistory: false,
                hideFavoriteHeroes: false,
                hideOnlineStatus: false,
                hideRegion: false,
                blockNonFriendInvites: false
            },
            resources: {
                hdVfxPack: true,
                hdAudioPack: true
            }
        }
    };
}
function loadMlbbSave() {
    var def = createDefaultMlbbSave();
    try {
        var _parsed_savedBuilds, _parsed_activeBuildSlot, _parsed_ownedSkins, _parsed_equippedSkins, _parsed_heroStats, _parsed_claimedMasteryChapters, _parsed_emblemTalents, _parsed_ownedEffects, _parsed_equippedEffects, _parsed_backpack, _parsed_squad, _parsed_boundAccounts, _parsed_esportsPredictions, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
        var _parsed_settings, _parsed_settings1, _parsed_settings2, _parsed_settings_interface, _parsed_settings3, _parsed_settings_interface1, _parsed_settings4, _parsed_settings5, _parsed_settings6, _parsed_settings7, _parsed_settings8;
        var raw = _storage.tryStorage.getItem(MLBB_SAVE_KEY);
        if (!raw) return def;
        var parsed = JSON.parse(raw);
        return _extends({}, def, parsed, {
            ownedHeroIds: Array.isArray(parsed.ownedHeroIds) && parsed.ownedHeroIds.length > 0 ? parsed.ownedHeroIds : def.ownedHeroIds,
            savedBuilds: _extends({}, def.savedBuilds, (_parsed_savedBuilds = parsed.savedBuilds) != null ? _parsed_savedBuilds : {}),
            activeBuildSlot: _extends({}, def.activeBuildSlot, (_parsed_activeBuildSlot = parsed.activeBuildSlot) != null ? _parsed_activeBuildSlot : {}),
            ownedSkins: _extends({}, def.ownedSkins, (_parsed_ownedSkins = parsed.ownedSkins) != null ? _parsed_ownedSkins : {}),
            equippedSkins: _extends({}, def.equippedSkins, (_parsed_equippedSkins = parsed.equippedSkins) != null ? _parsed_equippedSkins : {}),
            heroStats: _extends({}, def.heroStats, (_parsed_heroStats = parsed.heroStats) != null ? _parsed_heroStats : {}),
            claimedMasteryChapters: _extends({}, def.claimedMasteryChapters, (_parsed_claimedMasteryChapters = parsed.claimedMasteryChapters) != null ? _parsed_claimedMasteryChapters : {}),
            emblemTalents: _extends({}, def.emblemTalents, (_parsed_emblemTalents = parsed.emblemTalents) != null ? _parsed_emblemTalents : {}),
            ownedEffects: _extends({}, def.ownedEffects, (_parsed_ownedEffects = parsed.ownedEffects) != null ? _parsed_ownedEffects : {}),
            equippedEffects: _extends({}, def.equippedEffects, (_parsed_equippedEffects = parsed.equippedEffects) != null ? _parsed_equippedEffects : {}),
            backpack: _extends({}, def.backpack, (_parsed_backpack = parsed.backpack) != null ? _parsed_backpack : {}),
            squad: _extends({}, def.squad, (_parsed_squad = parsed.squad) != null ? _parsed_squad : {}),
            boundAccounts: _extends({}, def.boundAccounts, (_parsed_boundAccounts = parsed.boundAccounts) != null ? _parsed_boundAccounts : {}),
            affinityLinks: Array.isArray(parsed.affinityLinks) && parsed.affinityLinks.length > 0 ? parsed.affinityLinks : def.affinityLinks,
            photoAlbum: Array.isArray(parsed.photoAlbum) && parsed.photoAlbum.length > 0 ? parsed.photoAlbum : def.photoAlbum,
            claimedDailyMilestones: Array.isArray(parsed.claimedDailyMilestones) ? parsed.claimedDailyMilestones : def.claimedDailyMilestones,
            dailyTasksDone: Array.isArray(parsed.dailyTasksDone) ? parsed.dailyTasksDone : def.dailyTasksDone,
            esportsPredictions: _extends({}, def.esportsPredictions, (_parsed_esportsPredictions = parsed.esportsPredictions) != null ? _parsed_esportsPredictions : {}),
            settings: {
                basics: _extends({}, def.settings.basics, (_ref = (_parsed_settings = parsed.settings) == null ? void 0 : _parsed_settings.basics) != null ? _ref : {}),
                controls: _extends({}, def.settings.controls, (_ref1 = (_parsed_settings1 = parsed.settings) == null ? void 0 : _parsed_settings1.controls) != null ? _ref1 : {}),
                interface: _extends({}, def.settings.interface, (_ref2 = (_parsed_settings2 = parsed.settings) == null ? void 0 : _parsed_settings2.interface) != null ? _ref2 : {}, {
                    customUi3Skill: _extends({}, def.settings.interface.customUi3Skill, (_ref3 = (_parsed_settings3 = parsed.settings) == null ? void 0 : (_parsed_settings_interface = _parsed_settings3.interface) == null ? void 0 : _parsed_settings_interface.customUi3Skill) != null ? _ref3 : {}),
                    customUi4Skill: _extends({}, def.settings.interface.customUi4Skill, (_ref4 = (_parsed_settings4 = parsed.settings) == null ? void 0 : (_parsed_settings_interface1 = _parsed_settings4.interface) == null ? void 0 : _parsed_settings_interface1.customUi4Skill) != null ? _ref4 : {})
                }),
                sound: _extends({}, def.settings.sound, (_ref5 = (_parsed_settings5 = parsed.settings) == null ? void 0 : _parsed_settings5.sound) != null ? _ref5 : {}),
                network: _extends({}, def.settings.network, (_ref6 = (_parsed_settings6 = parsed.settings) == null ? void 0 : _parsed_settings6.network) != null ? _ref6 : {}),
                privacy: _extends({}, def.settings.privacy, (_ref7 = (_parsed_settings7 = parsed.settings) == null ? void 0 : _parsed_settings7.privacy) != null ? _ref7 : {}),
                resources: _extends({}, def.settings.resources, (_ref8 = (_parsed_settings8 = parsed.settings) == null ? void 0 : _parsed_settings8.resources) != null ? _ref8 : {})
            }
        });
    } catch (unused) {
        return def;
    }
}
function saveMlbbProfile(save) {
    _storage.tryStorage.setItem(MLBB_SAVE_KEY, JSON.stringify(save));
}
function resetMlbbSave() {
    var fresh = createDefaultMlbbSave();
    saveMlbbProfile(fresh);
    return fresh;
}

});
// === MODULE: src/games/legends-arena/mlbb/types ===
ArcadeMod.define("src/games/legends-arena/mlbb/types", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});

});

})(window.ArcadeMod);
