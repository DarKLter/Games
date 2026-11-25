(function(ArcadeMod){
// === MODULE: src/core/LobbyShowcase3D ===
ArcadeMod.define("src/core/LobbyShowcase3D", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LobbyShowcase3D", {
    enumerable: true,
    get: function() {
        return LobbyShowcase3D;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _arenaRoster = require("./arenaRoster");
var _threeShared = require("./threeShared");
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
var LobbyShowcase3D = /*#__PURE__*/ function() {
    "use strict";
    function LobbyShowcase3D() {
        var _this = this;
        this.ctx = null;
        this.stageRoot = new _three.Group();
        this.subjectGroup = null;
        this.auxGroup = null;
        this.ringMesh = null;
        this.currentConfig = null;
        this.spinAngle = 0.4;
        this.lastTick = 0;
        this.loop = function() {
            var _this_currentConfig;
            if (!_this.ctx || _this.ctx.disposed) return;
            var now = performance.now();
            var dt = Math.min(0.05, (now - _this.lastTick) / 1000);
            _this.lastTick = now;
            _this.spinAngle += dt * (((_this_currentConfig = _this.currentConfig) == null ? void 0 : _this_currentConfig.kind) === 'asphalt' ? 0.55 : 0.42);
            if (_this.subjectGroup) {
                _this.subjectGroup.rotation.y = _this.spinAngle;
            }
            if (_this.auxGroup) {
                _this.auxGroup.rotation.y = -_this.spinAngle * 0.7;
                for(var _iterator = _create_for_of_iterator_helper_loose(_this.auxGroup.children), _step; !(_step = _iterator()).done;){
                    var child = _step.value;
                    child.rotation.y += dt * 1.4;
                }
            }
            _this.ctx.render();
            _this.ctx.scheduleNextFrame(_this.loop);
        };
    }
    var _proto = LobbyShowcase3D.prototype;
    _proto.mount = function mount(container, config) {
        this.dispose();
        var skyByKind = {
            br: {
                sky: 0x161c17,
                fog: 0x1f2820,
                key: 0xffe4b5,
                hemi: 0x78716c
            },
            moba: {
                sky: 0x091128,
                fog: 0x101c3f,
                key: 0xfff5d6,
                hemi: 0x38bdf8
            },
            asphalt: {
                sky: 0x0b0e17,
                fog: 0x111827,
                key: 0xe0f2fe,
                hemi: 0x22d3ee
            },
            hoops: {
                sky: 0x13131b,
                fog: 0x181826,
                key: 0xfff7ed,
                hemi: 0xfacc15
            },
            naruto: {
                sky: 0x12091c,
                fog: 0x1e112a,
                key: 0xfff3d6,
                hemi: 0xf97316
            }
        };
        var palette = skyByKind[config.kind];
        this.ctx = new _threeShared.StudioThreeContext(container, {
            skyColor: palette.sky,
            fogColor: palette.fog,
            fogNear: 12,
            fogFar: 48,
            keyColor: palette.key,
            keyIntensity: 2.1,
            hemiSky: palette.hemi,
            hemiGround: 0x111827,
            hemiIntensity: 0.9,
            fov: 40,
            far: 90,
            withOverlayCanvas: false,
            useContainerSize: true
        });
        this.ctx.camera.position.set(0, 2.3, 7.2);
        this.ctx.camera.lookAt(0, 1.0, 0);
        // Base showroom floor + rim pedestal
        var floor = new _three.Mesh(new _three.CircleGeometry(14, 36), new _three.MeshStandardMaterial({
            color: config.kind === 'br' ? 0x292f26 : config.kind === 'naruto' ? 0x1c1426 : 0x111827,
            roughness: 0.55,
            metalness: 0.25
        }));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        var pedestal = new _three.Mesh(new _three.CylinderGeometry(2.3, 2.6, 0.26, 36), new _three.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.35,
            metalness: 0.72
        }));
        pedestal.position.y = 0.13;
        pedestal.receiveShadow = true;
        var accent = config.kind === 'br' ? 0xf59e0b : config.kind === 'moba' ? 0xfacc15 : config.kind === 'asphalt' ? 0x06b6d4 : config.kind === 'naruto' ? 0xf97316 : 0xfacc15;
        this.ringMesh = new _three.Mesh(new _three.TorusGeometry(2.34, 0.045, 8, 48), new _three.MeshBasicMaterial({
            color: accent
        }));
        this.ringMesh.rotation.x = Math.PI / 2;
        this.ringMesh.position.y = 0.27;
        this.stageRoot = new _three.Group();
        this.ctx.scene.add(floor, pedestal, this.ringMesh, this.stageRoot);
        this.update(config);
        this.ctx.prewarm();
        this.lastTick = performance.now();
        this.loop();
    };
    _proto.update = function update(config) {
        if (!this.ctx || this.ctx.disposed) return;
        this.currentConfig = _extends({}, config);
        // Remove and dispose previous subject & aux meshes cleanly
        while(this.stageRoot.children.length > 0){
            var child = this.stageRoot.children[0];
            this.stageRoot.remove(child);
            child.traverse(function(obj) {
                var _mesh_geometry_userData;
                var mesh = obj;
                if (mesh.geometry && !((_mesh_geometry_userData = mesh.geometry.userData) == null ? void 0 : _mesh_geometry_userData.noDispose)) mesh.geometry.dispose();
                var mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [
                    mesh.material
                ] : [];
                for(var _iterator = _create_for_of_iterator_helper_loose(mats), _step; !(_step = _iterator()).done;){
                    var m = _step.value;
                    var _m_userData;
                    if (m && !((_m_userData = m.userData) == null ? void 0 : _m_userData.noDispose)) m.dispose();
                }
            });
        }
        this.subjectGroup = new _three.Group();
        this.subjectGroup.rotation.y = this.spinAngle;
        this.auxGroup = new _three.Group();
        this.auxGroup.rotation.y = -this.spinAngle * 0.7;
        this.stageRoot.add(this.subjectGroup, this.auxGroup);
        if (config.kind === 'br') {
            var soldier = (0, _threeShared.buildSoldierMesh)(config.brMap === 'sanhok' ? 0x365314 : 0x57534e, config.brCrateReady ? 0xf59e0b : 0x3f6212, 0x38bdf8, 1.15, false);
            soldier.group.position.set(-0.65, 0.26, 0.35);
            soldier.group.rotation.y = 0.35;
            this.subjectGroup.add(soldier.group);
            var buggy = (0, _threeShared.buildBuggyMesh)(config.brMap === 'sanhok' ? 0x365314 : 0x78716c);
            buggy.group.scale.setScalar(0.68);
            buggy.group.position.set(1.2, 0.26, -0.5);
            buggy.group.rotation.y = -0.6;
            this.subjectGroup.add(buggy.group);
            // Circling miniature C-130 plane silhouette overhead
            var plane = new _three.Group();
            var fuse = new _three.Mesh(new _three.BoxGeometry(0.32, 0.28, 1.5), new _three.MeshStandardMaterial({
                color: 0x64748b,
                roughness: 0.45,
                metalness: 0.5
            }));
            var wing = new _three.Mesh(new _three.BoxGeometry(1.9, 0.06, 0.4), new _three.MeshStandardMaterial({
                color: 0x475569,
                roughness: 0.45,
                metalness: 0.5
            }));
            plane.add(fuse, wing);
            plane.position.set(0, 2.75, -2.5);
            this.auxGroup.add(plane);
            this.ctx.camera.position.set(0, 2.25, 6.8);
            this.ctx.camera.lookAt(0, 1.15, 0);
        } else if (config.kind === 'moba') {
            var _MOBA_HEROES_, _config_mobaHeroId, _skin_bodyShift, _skin_cloakShift, _skin_bladeShift;
            var hero = (_MOBA_HEROES_ = _arenaRoster.MOBA_HEROES[(_config_mobaHeroId = config.mobaHeroId) != null ? _config_mobaHeroId : 0]) != null ? _MOBA_HEROES_ : _arenaRoster.MOBA_HEROES[0];
            var skin = (0, _arenaRoster.getSkinVariantById)(config.mobaSkinId);
            var bodyCol = (_skin_bodyShift = skin.bodyShift) != null ? _skin_bodyShift : hero.bodyColor;
            var cloakCol = (_skin_cloakShift = skin.cloakShift) != null ? _skin_cloakShift : hero.cloakColor;
            var bladeCol = (_skin_bladeShift = skin.bladeShift) != null ? _skin_bladeShift : hero.bladeColor;
            var mesh = (0, _threeShared.buildMobaHeroMesh)(bodyCol, cloakCol, bladeCol, 1.28, hero.weapon, false);
            mesh.position.set(0, 0.26, 0);
            this.subjectGroup.add(mesh);
            if (this.ringMesh) {
                this.ringMesh.material.color.setHex(bladeCol);
            }
            // Floating arena crystals
            for(var i = 0; i < 4; i++){
                var ang = i * Math.PI / 2 + 0.4;
                var crystal = new _three.Mesh(new _three.OctahedronGeometry(0.24, 0), new _three.MeshStandardMaterial({
                    color: bladeCol,
                    emissive: bladeCol,
                    emissiveIntensity: 0.7,
                    roughness: 0.2
                }));
                crystal.position.set(Math.cos(ang) * 2.8, 1.2 + i % 2 * 0.4, Math.sin(ang) * 2.2 - 1.2);
                this.auxGroup.add(crystal);
            }
            this.ctx.camera.position.set(0, 2.15, 6.0);
            this.ctx.camera.lookAt(0, 1.3, 0);
        } else if (config.kind === 'asphalt') {
            var _ASPHALT_CARS_, _config_asphaltCarId, _config_asphaltUpgradeSum, _config_asphaltUpgradeSum1;
            var car = (_ASPHALT_CARS_ = _arenaRoster.ASPHALT_CARS[(_config_asphaltCarId = config.asphaltCarId) != null ? _config_asphaltCarId : 0]) != null ? _ASPHALT_CARS_ : _arenaRoster.ASPHALT_CARS[0];
            var _buildSupercarMesh = (0, _threeShared.buildSupercarMesh)(car.paintColor, car.stripeColor, this.ctx.isSoftwareGl, car.style, false), group = _buildSupercarMesh.group, flameL = _buildSupercarMesh.flameL, flameR = _buildSupercarMesh.flameR;
            group.scale.setScalar(1.02);
            group.position.set(0, 0.26, 0);
            flameL.visible = ((_config_asphaltUpgradeSum = config.asphaltUpgradeSum) != null ? _config_asphaltUpgradeSum : 4) >= 8;
            flameR.visible = ((_config_asphaltUpgradeSum1 = config.asphaltUpgradeSum) != null ? _config_asphaltUpgradeSum1 : 4) >= 8;
            this.subjectGroup.add(group);
            if (this.ringMesh) {
                this.ringMesh.material.color.setHex(car.paintColor);
            }
            this.ctx.camera.position.set(0.3, 2.05, 6.6);
            this.ctx.camera.lookAt(0, 0.72, 0);
        } else if (config.kind === 'hoops') {
            var _BASKETBALL_TEAMS_, _config_hoopsTeamId;
            var team = (_BASKETBALL_TEAMS_ = _arenaRoster.BASKETBALL_TEAMS[(_config_hoopsTeamId = config.hoopsTeamId) != null ? _config_hoopsTeamId : 0]) != null ? _BASKETBALL_TEAMS_ : _arenaRoster.BASKETBALL_TEAMS[0];
            var player = (0, _threeShared.buildBasketballPlayerMesh)(team.jerseyColor, team.trimColor, 0x8d5524, true, 1.25, true);
            player.group.position.set(-0.25, 0.26, 0);
            player.armR.rotation.x = -0.6;
            this.subjectGroup.add(player.group);
            var ball = new _three.Mesh(new _three.SphereGeometry(0.26, 16, 16), new _three.MeshToonMaterial({
                color: 0xf97316
            }));
            ball.position.set(0.75, 1.45, 0.35);
            this.auxGroup.add(ball);
            if (this.ringMesh) {
                this.ringMesh.material.color.setHex(team.trimColor);
            }
            this.ctx.camera.position.set(0, 2.15, 5.9);
            this.ctx.camera.lookAt(0, 1.25, 0);
        } else if (config.kind === 'naruto') {
            var _NARUTO_SHINOBI_ROSTER_, _config_narutoHeroId;
            var hero1 = (_NARUTO_SHINOBI_ROSTER_ = _arenaRoster.NARUTO_SHINOBI_ROSTER[(_config_narutoHeroId = config.narutoHeroId) != null ? _config_narutoHeroId : 0]) != null ? _NARUTO_SHINOBI_ROSTER_ : _arenaRoster.NARUTO_SHINOBI_ROSTER[0];
            var mainShinobi = (0, _threeShared.buildShinobiMesh)(hero1, 1.26, false);
            mainShinobi.group.position.set(0, 0.26, 0.28);
            this.subjectGroup.add(mainShinobi.group);
            if (config.narutoSupport1Id !== undefined) {
                var _NARUTO_SHINOBI_ROSTER_config_narutoSupport1Id;
                var sup1 = (_NARUTO_SHINOBI_ROSTER_config_narutoSupport1Id = _arenaRoster.NARUTO_SHINOBI_ROSTER[config.narutoSupport1Id]) != null ? _NARUTO_SHINOBI_ROSTER_config_narutoSupport1Id : _arenaRoster.NARUTO_SHINOBI_ROSTER[1];
                if (sup1.id !== hero1.id) {
                    var s1Mesh = (0, _threeShared.buildShinobiMesh)(sup1, 0.94, false);
                    s1Mesh.group.position.set(-1.35, 0.26, -0.65);
                    s1Mesh.group.rotation.y = 0.28;
                    this.subjectGroup.add(s1Mesh.group);
                }
            }
            if (config.narutoSupport2Id !== undefined) {
                var _NARUTO_SHINOBI_ROSTER_config_narutoSupport2Id;
                var sup2 = (_NARUTO_SHINOBI_ROSTER_config_narutoSupport2Id = _arenaRoster.NARUTO_SHINOBI_ROSTER[config.narutoSupport2Id]) != null ? _NARUTO_SHINOBI_ROSTER_config_narutoSupport2Id : _arenaRoster.NARUTO_SHINOBI_ROSTER[2];
                if (sup2.id !== hero1.id && sup2.id !== config.narutoSupport1Id) {
                    var s2Mesh = (0, _threeShared.buildShinobiMesh)(sup2, 0.94, false);
                    s2Mesh.group.position.set(1.35, 0.26, -0.65);
                    s2Mesh.group.rotation.y = -0.28;
                    this.subjectGroup.add(s2Mesh.group);
                }
            }
            if (this.ringMesh) {
                this.ringMesh.material.color.setHex(hero1.chakraColor);
            }
            // Orbiting elemental chakra orbs & kunai
            for(var i1 = 0; i1 < 5; i1++){
                var ang1 = i1 * Math.PI * 2 / 5;
                var orb = new _three.Mesh(new _three.SphereGeometry(0.18, 12, 12), new _three.MeshBasicMaterial({
                    color: i1 % 2 === 0 ? hero1.chakraColor : hero1.accentColor,
                    transparent: true,
                    opacity: 0.88
                }));
                orb.position.set(Math.cos(ang1) * 2.55, 1.15 + i1 % 2 * 0.45, Math.sin(ang1) * 2.2 - 0.5);
                this.auxGroup.add(orb);
            }
            this.ctx.camera.position.set(0, 2.2, 6.2);
            this.ctx.camera.lookAt(0, 1.25, 0);
        }
        this.ctx.render();
    };
    _proto.resize = function resize() {
        var _this_ctx;
        (_this_ctx = this.ctx) == null ? void 0 : _this_ctx.resize();
    };
    _proto.dispose = function dispose() {
        if (this.ctx) {
            this.ctx.dispose();
            this.ctx = null;
        }
        this.subjectGroup = null;
        this.auxGroup = null;
        this.ringMesh = null;
    };
    return LobbyShowcase3D;
}();

});
// === MODULE: src/core/threeShared ===
ArcadeMod.define("src/core/threeShared", function(require, module, exports) {
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
    get StudioThreeContext () {
        return StudioThreeContext;
    },
    get addInkOutline () {
        return addInkOutline;
    },
    get buildBasketballPlayerMesh () {
        return buildBasketballPlayerMesh;
    },
    get buildBuggyMesh () {
        return buildBuggyMesh;
    },
    get buildMobaHeroMesh () {
        return buildMobaHeroMesh;
    },
    get buildShinobiMesh () {
        return buildShinobiMesh;
    },
    get buildSoldierMesh () {
        return buildSoldierMesh;
    },
    get buildSupercarMesh () {
        return buildSupercarMesh;
    },
    get createContactShadowMesh () {
        return createContactShadowMesh;
    },
    get createToonMaterial () {
        return createToonMaterial;
    },
    get detectSoftwareWebGL () {
        return detectSoftwareWebGL;
    },
    get getToonGradientMap () {
        return getToonGradientMap;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _RoomEnvironment = require("three/examples/jsm/environments/RoomEnvironment.js");
var _viewport = require("./viewport");
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
function detectSoftwareWebGL() {
    if (typeof document === 'undefined') return true;
    try {
        var _gl_getExtension;
        var probe = document.createElement('canvas');
        var gl = probe.getContext('webgl2') || probe.getContext('webgl') || probe.getContext('experimental-webgl');
        if (!gl) return true;
        var ext = gl.getExtension('WEBGL_debug_renderer_info');
        var param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        var gpu = String(gl.getParameter(param) || '');
        (_gl_getExtension = gl.getExtension('WEBGL_lose_context')) == null ? void 0 : _gl_getExtension.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch (unused) {
        return true;
    }
}
var StudioThreeContext = /*#__PURE__*/ function() {
    "use strict";
    function StudioThreeContext(container, opts) {
        var _this = this;
        var _opts_fogNear, _opts_fogFar, _opts_fov, _opts_far, _opts_hemiSky, _opts_hemiGround, _opts_hemiIntensity, _opts_keyColor, _opts_keyIntensity;
        this.envTexture = null;
        this.overlayCanvas = null;
        this.overlayCtx = null;
        this.width = 800;
        this.height = 600;
        this.disposed = false;
        this.contextLost = false;
        this.frameHandle = null;
        this.timeoutHandle = null;
        this.extraTextures = [];
        this.useContainerSize = false;
        this.onContextLost = function(e) {
            e.preventDefault();
            _this.contextLost = true;
        };
        this.onContextRestored = function() {
            _this.contextLost = false;
        };
        this.container = container;
        this.container.innerHTML = '';
        this.useContainerSize = Boolean(opts.useContainerSize);
        this.isSoftwareGl = detectSoftwareWebGL();
        var vp = (0, _viewport.getViewportSize)();
        this.width = Math.max(240, this.useContainerSize && container.clientWidth ? container.clientWidth : vp.width);
        this.height = Math.max(240, this.useContainerSize && container.clientHeight ? container.clientHeight : vp.height);
        this.renderer = new _three.WebGLRenderer({
            antialias: !this.isSoftwareGl,
            powerPreference: 'high-performance'
        });
        this.renderer.outputColorSpace = _three.SRGBColorSpace;
        this.renderer.toneMapping = _three.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.shadowMap.enabled = !this.isSoftwareGl;
        this.renderer.shadowMap.type = _three.PCFSoftShadowMap;
        this.renderer.setSize(this.width, this.height, false);
        this.renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;';
        this.container.appendChild(this.renderer.domElement);
        if (opts.withOverlayCanvas !== false) {
            this.overlayCanvas = document.createElement('canvas');
            this.overlayCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;';
            this.overlayCtx = this.overlayCanvas.getContext('2d');
            this.container.appendChild(this.overlayCanvas);
        }
        this.scene = new _three.Scene();
        this.scene.background = new _three.Color(opts.skyColor);
        this.scene.fog = new _three.Fog(opts.fogColor, (_opts_fogNear = opts.fogNear) != null ? _opts_fogNear : 45, (_opts_fogFar = opts.fogFar) != null ? _opts_fogFar : 190);
        var pmremGenerator = new _three.PMREMGenerator(this.renderer);
        var roomEnv = new _RoomEnvironment.RoomEnvironment();
        this.envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
        roomEnv.dispose();
        this.scene.environment = this.envTexture;
        pmremGenerator.dispose();
        this.camera = new _three.PerspectiveCamera((_opts_fov = opts.fov) != null ? _opts_fov : 60, this.width / Math.max(1, this.height), 0.2, (_opts_far = opts.far) != null ? _opts_far : 320);
        this.hemiLight = new _three.HemisphereLight((_opts_hemiSky = opts.hemiSky) != null ? _opts_hemiSky : 0x93c5fd, (_opts_hemiGround = opts.hemiGround) != null ? _opts_hemiGround : 0x2a3324, (_opts_hemiIntensity = opts.hemiIntensity) != null ? _opts_hemiIntensity : 0.72);
        this.scene.add(this.hemiLight);
        this.keyLight = new _three.DirectionalLight((_opts_keyColor = opts.keyColor) != null ? _opts_keyColor : 0xfff3d6, (_opts_keyIntensity = opts.keyIntensity) != null ? _opts_keyIntensity : 1.85);
        this.keyLight.position.set(28, 46, 22);
        if (!this.isSoftwareGl) {
            var _opts_shadowExtent;
            var d = (_opts_shadowExtent = opts.shadowExtent) != null ? _opts_shadowExtent : 42;
            this.keyLight.castShadow = true;
            this.keyLight.shadow.mapSize.set(1024, 1024);
            this.keyLight.shadow.camera.left = -d;
            this.keyLight.shadow.camera.right = d;
            this.keyLight.shadow.camera.top = d;
            this.keyLight.shadow.camera.bottom = -d;
            this.keyLight.shadow.camera.near = 2;
            this.keyLight.shadow.camera.far = 140;
            this.keyLight.shadow.bias = -0.0005;
            this.keyLight.shadow.normalBias = 0.02;
        }
        this.scene.add(this.keyLight);
        this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost);
        this.renderer.domElement.addEventListener('webglcontextrestored', this.onContextRestored);
        this.resize();
    }
    var _proto = StudioThreeContext.prototype;
    _proto.prewarm = function prewarm() {
        if (!this.isSoftwareGl && !this.disposed) {
            this.renderer.compile(this.scene, this.camera);
        }
    };
    _proto.resize = function resize() {
        if (this.disposed) return;
        var vp = (0, _viewport.getViewportSize)();
        var cw = this.useContainerSize ? this.container.clientWidth : 0;
        var ch = this.useContainerSize ? this.container.clientHeight : 0;
        this.width = Math.max(240, cw || vp.width);
        this.height = Math.max(240, ch || vp.height);
        this.camera.aspect = this.width / Math.max(1, this.height);
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height, false);
        if (this.overlayCanvas && this.overlayCtx) {
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.overlayCanvas.width = Math.floor(this.width * dpr);
            this.overlayCanvas.height = Math.floor(this.height * dpr);
            this.overlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
    };
    _proto.trackTexture = function trackTexture(tex) {
        this.extraTextures.push(tex);
        return tex;
    };
    _proto.createCanvasTexture = function createCanvasTexture(size, drawFn, repeatX, repeatY) {
        if (repeatX === void 0) repeatX = 1;
        if (repeatY === void 0) repeatY = 1;
        var c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        var ctx = c.getContext('2d');
        if (ctx) drawFn(ctx, size);
        var tex = new _three.CanvasTexture(c);
        tex.colorSpace = _three.SRGBColorSpace;
        tex.wrapS = _three.RepeatWrapping;
        tex.wrapT = _three.RepeatWrapping;
        tex.repeat.set(repeatX, repeatY);
        tex.anisotropy = Math.min(8, Math.max(1, (this.renderer.capabilities.getMaxAnisotropy == null ? void 0 : this.renderer.capabilities.getMaxAnisotropy.call(this.renderer.capabilities)) || 1));
        return this.trackTexture(tex);
    };
    _proto.clearOverlay = function clearOverlay() {
        if (this.overlayCtx) {
            this.overlayCtx.clearRect(0, 0, this.width, this.height);
        }
    };
    _proto.render = function render() {
        if (this.disposed || this.contextLost) return;
        this.renderer.render(this.scene, this.camera);
    };
    _proto.cancelPendingFrame = function cancelPendingFrame() {
        if (this.frameHandle !== null) {
            cancelAnimationFrame(this.frameHandle);
            this.frameHandle = null;
        }
        if (this.timeoutHandle !== null) {
            clearTimeout(this.timeoutHandle);
            this.timeoutHandle = null;
        }
    };
    _proto.scheduleNextFrame = function scheduleNextFrame(cb) {
        var _this = this;
        if (this.disposed) return;
        this.cancelPendingFrame();
        if (this.isSoftwareGl) {
            var gl = this.renderer.getContext();
            var sync = typeof gl.fenceSync === 'function' ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
            gl.flush();
            var poll = function poll1() {
                if (_this.disposed) {
                    if (sync) gl.deleteSync(sync);
                    return;
                }
                var state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
                if (state === gl.UNSIGNALED) {
                    _this.timeoutHandle = window.setTimeout(poll, 5);
                } else {
                    if (sync) gl.deleteSync(sync);
                    _this.timeoutHandle = window.setTimeout(function() {
                        if (!_this.disposed) cb();
                    }, 80);
                }
            };
            this.timeoutHandle = window.setTimeout(poll, 5);
        } else {
            this.frameHandle = requestAnimationFrame(function() {
                if (!_this.disposed) cb();
            });
        }
    };
    _proto.dispose = function dispose() {
        var _this_envTexture;
        if (this.disposed) return;
        this.disposed = true;
        this.cancelPendingFrame();
        this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost);
        this.renderer.domElement.removeEventListener('webglcontextrestored', this.onContextRestored);
        this.scene.traverse(function(obj) {
            var _mesh_geometry_userData;
            var mesh = obj;
            if (mesh.geometry && !((_mesh_geometry_userData = mesh.geometry.userData) == null ? void 0 : _mesh_geometry_userData.noDispose)) mesh.geometry.dispose();
            var mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [
                mesh.material
            ] : [];
            for(var _iterator = _create_for_of_iterator_helper_loose(mats), _step; !(_step = _iterator()).done;){
                var m = _step.value;
                var _m_userData, _std_map, _std_normalMap, _std_roughnessMap, _std_metalnessMap, _std_emissiveMap;
                if (!m || ((_m_userData = m.userData) == null ? void 0 : _m_userData.noDispose)) continue;
                var std = m;
                (_std_map = std.map) == null ? void 0 : _std_map.dispose();
                (_std_normalMap = std.normalMap) == null ? void 0 : _std_normalMap.dispose();
                (_std_roughnessMap = std.roughnessMap) == null ? void 0 : _std_roughnessMap.dispose();
                (_std_metalnessMap = std.metalnessMap) == null ? void 0 : _std_metalnessMap.dispose();
                (_std_emissiveMap = std.emissiveMap) == null ? void 0 : _std_emissiveMap.dispose();
                m.dispose();
            }
        });
        for(var _iterator = _create_for_of_iterator_helper_loose(this.extraTextures), _step; !(_step = _iterator()).done;){
            var tex = _step.value;
            tex.dispose();
        }
        this.extraTextures = [];
        (_this_envTexture = this.envTexture) == null ? void 0 : _this_envTexture.dispose();
        this.envTexture = null;
        this.renderer.dispose();
        this.container.innerHTML = '';
    };
    return StudioThreeContext;
}();
var cachedContactShadowGeo = null;
var cachedContactShadowMats = new Map();
function createContactShadowMesh(radius, opacity) {
    if (radius === void 0) radius = 1.15;
    if (opacity === void 0) opacity = 0.42;
    if (!cachedContactShadowGeo) {
        cachedContactShadowGeo = new _three.PlaneGeometry(2, 2);
        cachedContactShadowGeo.userData.noDispose = true;
    }
    var key = Math.round(opacity * 100);
    var mat = cachedContactShadowMats.get(key);
    if (!mat) {
        var c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        var ctx = c.getContext('2d');
        if (ctx) {
            var g = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
            g.addColorStop(0, "rgba(0,0,0," + key / 100 + ")");
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 64, 64);
        }
        var tex = new _three.CanvasTexture(c);
        tex.colorSpace = _three.SRGBColorSpace;
        mat = new _three.MeshBasicMaterial({
            map: tex,
            transparent: true,
            depthWrite: false
        });
        mat.userData.noDispose = true;
        cachedContactShadowMats.set(key, mat);
    }
    var mesh = new _three.Mesh(cachedContactShadowGeo, mat);
    mesh.scale.set(radius, radius, 1);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.03;
    return mesh;
}
var cachedToonGradient = null;
function getToonGradientMap() {
    if (cachedToonGradient) return cachedToonGradient;
    var bands = new Uint8Array([
        76,
        148,
        212,
        255
    ]);
    var tex = new _three.DataTexture(bands, 4, 1, _three.RedFormat);
    tex.minFilter = _three.NearestFilter;
    tex.magFilter = _three.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    cachedToonGradient = tex;
    return tex;
}
function createToonMaterial(color, opts) {
    var _ref, _ref1, _ref2, _ref3, _ref4;
    return new _three.MeshToonMaterial({
        color: color,
        gradientMap: getToonGradientMap(),
        emissive: (_ref = opts == null ? void 0 : opts.emissive) != null ? _ref : 0x000000,
        emissiveIntensity: (_ref1 = opts == null ? void 0 : opts.emissiveIntensity) != null ? _ref1 : 0,
        side: (_ref2 = opts == null ? void 0 : opts.side) != null ? _ref2 : _three.FrontSide,
        transparent: (_ref3 = opts == null ? void 0 : opts.transparent) != null ? _ref3 : false,
        opacity: (_ref4 = opts == null ? void 0 : opts.opacity) != null ? _ref4 : 1
    });
}
function addInkOutline(mesh, scale, color) {
    if (scale === void 0) scale = 1.08;
    if (color === void 0) color = 0x090d16;
    var outline = new _three.Mesh(mesh.geometry, new _three.MeshBasicMaterial({
        color: color,
        side: _three.BackSide
    }));
    outline.scale.setScalar(scale);
    outline.castShadow = false;
    outline.receiveShadow = false;
    mesh.add(outline);
    return outline;
}
function buildSoldierMesh(armorColor, helmetColor, visorColor, scale, celShaded) {
    if (scale === void 0) scale = 1;
    if (celShaded === void 0) celShaded = false;
    var group = new _three.Group();
    var darkMat = celShaded ? createToonMaterial(0x1e293b) : new _three.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.85,
        metalness: 0.15
    });
    var armorMat = celShaded ? createToonMaterial(armorColor) : new _three.MeshStandardMaterial({
        color: armorColor,
        roughness: 0.45,
        metalness: 0.3
    });
    var helmetMat = celShaded ? createToonMaterial(helmetColor) : new _three.MeshStandardMaterial({
        color: helmetColor,
        roughness: 0.35,
        metalness: 0.45
    });
    var steelMat = celShaded ? createToonMaterial(0x475569) : new _three.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.25,
        metalness: 0.85
    });
    var visorMat = celShaded ? createToonMaterial(visorColor, {
        emissive: visorColor,
        emissiveIntensity: 0.5
    }) : new _three.MeshStandardMaterial({
        color: visorColor,
        emissive: visorColor,
        emissiveIntensity: 0.7,
        roughness: 0.15,
        metalness: 0.9
    });
    // Boots + Legs
    var legGeo = new _three.BoxGeometry(0.24, 0.72, 0.26);
    var legL = new _three.Mesh(legGeo, darkMat);
    legL.position.set(-0.18, 0.36, 0);
    var legR = new _three.Mesh(legGeo, darkMat);
    legR.position.set(0.18, 0.36, 0);
    group.add(legL, legR);
    // Armored Torso + Tactical Vest
    var torso = new _three.Mesh(new _three.BoxGeometry(0.68, 0.78, 0.42), armorMat);
    torso.position.set(0, 1.11, 0);
    torso.castShadow = true;
    var pack = new _three.Mesh(new _three.BoxGeometry(0.48, 0.56, 0.22), darkMat);
    pack.position.set(0, 1.12, -0.3);
    group.add(torso, pack);
    // Helmet + Visor
    var head = new _three.Mesh(new _three.BoxGeometry(0.46, 0.44, 0.46), helmetMat);
    head.position.set(0, 1.74, 0);
    head.castShadow = true;
    var visor = new _three.Mesh(new _three.BoxGeometry(0.38, 0.14, 0.1), visorMat);
    visor.position.set(0, 1.75, 0.22);
    group.add(head, visor);
    // Arms + Assault Rifle + Barrel + Optic
    var armR = new _three.Mesh(new _three.BoxGeometry(0.2, 0.54, 0.22), armorMat);
    armR.position.set(0.44, 1.15, 0.12);
    armR.rotation.x = -0.7;
    var rifleBody = new _three.Mesh(new _three.BoxGeometry(0.12, 0.18, 0.9), steelMat);
    rifleBody.position.set(0.32, 1.15, 0.52);
    var barrel = new _three.Mesh(new _three.CylinderGeometry(0.035, 0.035, 0.48, 8), steelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.32, 1.17, 1.05);
    var muzzle = new _three.Object3D();
    muzzle.position.set(0.32, 1.17, 1.32);
    if (celShaded) {
        addInkOutline(torso, 1.08);
        addInkOutline(head, 1.09);
        addInkOutline(legL, 1.1);
        addInkOutline(legR, 1.1);
        addInkOutline(rifleBody, 1.12);
    }
    group.add(armR, rifleBody, barrel, muzzle, createContactShadowMesh(0.7, 0.38));
    group.scale.setScalar(scale);
    return {
        group: group,
        muzzle: muzzle
    };
}
function buildMobaHeroMesh(bodyColor, cloakColor, bladeColor, scale, weapon, celShaded) {
    if (scale === void 0) scale = 1;
    if (weapon === void 0) weapon = 'sword';
    if (celShaded === void 0) celShaded = false;
    var group = new _three.Group();
    var baseMat = celShaded ? createToonMaterial(bodyColor) : new _three.MeshStandardMaterial({
        color: bodyColor,
        roughness: 0.42,
        metalness: 0.35
    });
    var cloakMat = celShaded ? createToonMaterial(cloakColor) : new _three.MeshStandardMaterial({
        color: cloakColor,
        roughness: 0.78,
        metalness: 0.08
    });
    var goldMat = celShaded ? createToonMaterial(0xfacc15) : new _three.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.28,
        metalness: 0.82
    });
    var bladeMat = celShaded ? createToonMaterial(bladeColor, {
        emissive: bladeColor,
        emissiveIntensity: 0.42
    }) : new _three.MeshStandardMaterial({
        color: bladeColor,
        emissive: bladeColor,
        emissiveIntensity: 0.72,
        roughness: 0.25,
        metalness: 0.86
    });
    var woodMat = celShaded ? createToonMaterial(0x78350f) : new _three.MeshStandardMaterial({
        color: 0x451a03,
        roughness: 0.8,
        metalness: 0.12
    });
    var legs = new _three.Mesh(new _three.CylinderGeometry(weapon === 'shield' ? 0.36 : 0.28, weapon === 'shield' ? 0.42 : 0.34, 0.72, 8), baseMat);
    legs.position.set(0, 0.36, 0);
    var chestW = weapon === 'shield' ? 0.94 : weapon === 'daggers' ? 0.68 : 0.76;
    var chest = new _three.Mesh(new _three.BoxGeometry(chestW, 0.82, 0.46), baseMat);
    chest.position.set(0, 1.12, 0);
    chest.castShadow = true;
    var pauldronSize = weapon === 'shield' ? 0.32 : weapon === 'daggers' ? 0.2 : 0.26;
    var pauldronL = new _three.Mesh(new _three.SphereGeometry(pauldronSize, 8, 8), goldMat);
    pauldronL.position.set(-chestW * 0.66, 1.44, 0);
    var pauldronR = new _three.Mesh(new _three.SphereGeometry(pauldronSize, 8, 8), goldMat);
    pauldronR.position.set(chestW * 0.66, 1.44, 0);
    var cape = new _three.Mesh(new _three.BoxGeometry(0.7, 1.05, 0.1), cloakMat);
    cape.position.set(0, 1.0, -0.28);
    cape.rotation.x = 0.18;
    var head = new _three.Mesh(new _three.BoxGeometry(0.46, 0.46, 0.46), goldMat);
    head.position.set(0, 1.78, 0);
    if (celShaded) {
        addInkOutline(legs, 1.08);
        addInkOutline(chest, 1.08);
        addInkOutline(pauldronL, 1.1);
        addInkOutline(pauldronR, 1.1);
        addInkOutline(cape, 1.09);
        addInkOutline(head, 1.09);
    }
    // Class-specific headgear accent
    if (weapon === 'staff') {
        var hat = new _three.Mesh(new _three.ConeGeometry(0.38, 0.62, 7), cloakMat);
        hat.position.set(0, 2.25, 0);
        if (celShaded) addInkOutline(hat, 1.09);
        group.add(hat);
    } else if (weapon === 'bow') {
        var hood = new _three.Mesh(new _three.BoxGeometry(0.52, 0.3, 0.52), cloakMat);
        hood.position.set(0, 1.98, -0.02);
        if (celShaded) addInkOutline(hood, 1.09);
        group.add(hood);
    } else if (weapon === 'daggers') {
        var scarf = new _three.Mesh(new _three.BoxGeometry(0.54, 0.24, 0.52), cloakMat);
        scarf.position.set(0, 1.62, 0.04);
        if (celShaded) addInkOutline(scarf, 1.09);
        group.add(scarf);
    } else if (weapon === 'halberd') {
        var halo = new _three.Mesh(new _three.TorusGeometry(0.32, 0.045, 6, 16), bladeMat);
        halo.position.set(0, 2.1, -0.18);
        group.add(halo);
    } else {
        var crest = new _three.Mesh(new _three.ConeGeometry(0.16, 0.38, 4), bladeMat);
        crest.position.set(0, 2.15, 0);
        if (celShaded) addInkOutline(crest, 1.12);
        group.add(crest);
    }
    // Class-specific 3D weapon
    if (weapon === 'staff') {
        var shaft = new _three.Mesh(new _three.CylinderGeometry(0.06, 0.06, 1.75, 8), woodMat);
        shaft.position.set(0.64, 1.15, 0.32);
        shaft.rotation.x = 0.32;
        var orb = new _three.Mesh(new _three.OctahedronGeometry(0.24, 0), bladeMat);
        orb.position.set(0.64, 2.02, 0.6);
        if (celShaded) addInkOutline(orb, 1.1);
        group.add(shaft, orb);
    } else if (weapon === 'bow') {
        var bowArc = new _three.Mesh(new _three.TorusGeometry(0.55, 0.06, 6, 14, Math.PI * 1.1), woodMat);
        bowArc.position.set(0.62, 1.28, 0.42);
        bowArc.rotation.y = Math.PI / 2;
        bowArc.rotation.z = -Math.PI * 0.55;
        var arrow = new _three.Mesh(new _three.CylinderGeometry(0.035, 0.035, 1.05, 6), bladeMat);
        arrow.rotation.x = Math.PI / 2;
        arrow.position.set(0.62, 1.28, 0.72);
        group.add(bowArc, arrow);
    } else if (weapon === 'shield') {
        var shield = new _three.Mesh(new _three.BoxGeometry(0.14, 1.05, 0.78), bladeMat);
        shield.position.set(-0.68, 1.12, 0.24);
        shield.rotation.y = 0.25;
        var mace = new _three.Mesh(new _three.BoxGeometry(0.24, 0.95, 0.24), goldMat);
        mace.position.set(0.68, 1.2, 0.32);
        mace.rotation.x = 0.45;
        if (celShaded) {
            addInkOutline(shield, 1.09);
            addInkOutline(mace, 1.1);
        }
        group.add(shield, mace);
    } else if (weapon === 'daggers') {
        var dagL = new _three.Mesh(new _three.BoxGeometry(0.09, 0.78, 0.14), bladeMat);
        dagL.position.set(-0.6, 1.08, 0.38);
        dagL.rotation.x = 0.85;
        var dagR = new _three.Mesh(new _three.BoxGeometry(0.09, 0.78, 0.14), bladeMat);
        dagR.position.set(0.6, 1.08, 0.38);
        dagR.rotation.x = 0.85;
        if (celShaded) {
            addInkOutline(dagL, 1.12);
            addInkOutline(dagR, 1.12);
        }
        group.add(dagL, dagR);
    } else if (weapon === 'halberd') {
        var pole = new _three.Mesh(new _three.CylinderGeometry(0.055, 0.055, 1.85, 8), goldMat);
        pole.position.set(0.65, 1.18, 0.32);
        pole.rotation.x = 0.35;
        var axe = new _three.Mesh(new _three.BoxGeometry(0.08, 0.48, 0.44), bladeMat);
        axe.position.set(0.65, 1.92, 0.6);
        axe.rotation.x = 0.35;
        if (celShaded) addInkOutline(axe, 1.1);
        group.add(pole, axe);
    } else {
        var sword = new _three.Mesh(new _three.BoxGeometry(0.16, 1.42, 0.1), bladeMat);
        sword.position.set(0.66, 1.25, 0.35);
        sword.rotation.x = 0.55;
        if (celShaded) addInkOutline(sword, 1.1);
        group.add(sword);
    }
    group.add(legs, chest, pauldronL, pauldronR, cape, head, createContactShadowMesh(0.95, 0.42));
    group.scale.setScalar(scale);
    return group;
}
function buildSupercarMesh(paintColor, stripeColor, isSoftwareGl, style, celShaded) {
    if (style === void 0) style = 'gt';
    if (celShaded === void 0) celShaded = false;
    var group = new _three.Group();
    var bodyMat = celShaded ? createToonMaterial(paintColor) : new _three.MeshStandardMaterial({
        color: paintColor,
        roughness: 0.26,
        metalness: 0.78
    });
    var stripeMat = celShaded ? createToonMaterial(stripeColor) : new _three.MeshStandardMaterial({
        color: stripeColor,
        roughness: 0.28,
        metalness: 0.65
    });
    var glassMat = celShaded ? createToonMaterial(0x1e293b, {
        emissive: 0x38bdf8,
        emissiveIntensity: 0.16
    }) : new _three.MeshPhysicalMaterial({
        color: 0x0f172a,
        roughness: 0.12,
        metalness: 0.2,
        clearcoat: 1.0,
        transparent: true,
        opacity: isSoftwareGl ? 0.72 : 0.85
    });
    var tireMat = celShaded ? createToonMaterial(0x111827) : new _three.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.88,
        metalness: 0.1
    });
    var rimMat = celShaded ? createToonMaterial(0xf8fafc) : new _three.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.25,
        metalness: 0.9
    });
    var tailMat = celShaded ? createToonMaterial(0xff2244, {
        emissive: 0xff2244,
        emissiveIntensity: 1.0
    }) : new _three.MeshStandardMaterial({
        color: 0xff2244,
        emissive: 0xff2244,
        emissiveIntensity: 1.6,
        roughness: 0.25
    });
    var flameMat = new _three.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.9
    });
    var chassisW = style === 'heavy' ? 2.18 : style === 'hyper' ? 2.08 : 1.96;
    var chassisH = style === 'heavy' ? 0.56 : style === 'hyper' ? 0.38 : 0.44;
    var chassis = new _three.Mesh(new _three.BoxGeometry(chassisW, chassisH, 4.35), bodyMat);
    chassis.position.set(0, 0.48, 0);
    chassis.castShadow = true;
    var cabin = new _three.Mesh(new _three.BoxGeometry(style === 'heavy' ? 1.62 : 1.48, style === 'hyper' ? 0.36 : 0.42, 1.95), glassMat);
    cabin.position.set(0, style === 'heavy' ? 0.96 : 0.86, -0.15);
    var roof = new _three.Mesh(new _three.BoxGeometry(1.32, 0.09, 1.35), bodyMat);
    roof.position.set(0, style === 'heavy' ? 1.18 : 1.09, -0.2);
    var stripe = new _three.Mesh(new _three.BoxGeometry(0.42, 0.04, 4.25), stripeMat);
    stripe.position.set(0, style === 'heavy' ? 0.77 : 0.71, 0);
    if (celShaded) {
        addInkOutline(chassis, 1.055);
        addInkOutline(cabin, 1.07);
        addInkOutline(roof, 1.08);
    }
    if (style === 'hyper') {
        var fin = new _three.Mesh(new _three.BoxGeometry(0.1, 0.44, 1.45), stripeMat);
        fin.position.set(0, 1.18, -1.25);
        var nose = new _three.Mesh(new _three.BoxGeometry(1.85, 0.2, 0.7), stripeMat);
        nose.position.set(0, 0.36, 2.2);
        if (celShaded) {
            addInkOutline(fin, 1.1);
            addInkOutline(nose, 1.07);
        }
        group.add(fin, nose);
    } else if (style === 'heavy') {
        var ram = new _three.Mesh(new _three.BoxGeometry(2.26, 0.44, 0.36), stripeMat);
        ram.position.set(0, 0.46, 2.22);
        var blower = new _three.Mesh(new _three.BoxGeometry(0.62, 0.26, 0.75), rimMat);
        blower.position.set(0, 0.88, 1.05);
        if (celShaded) {
            addInkOutline(ram, 1.07);
            addInkOutline(blower, 1.08);
        }
        group.add(ram, blower);
    } else if (style === 'drift') {
        var splitter = new _three.Mesh(new _three.BoxGeometry(2.14, 0.1, 0.52), stripeMat);
        splitter.position.set(0, 0.26, 2.15);
        var skirtL = new _three.Mesh(new _three.BoxGeometry(0.14, 0.16, 2.8), stripeMat);
        skirtL.position.set(-1.02, 0.28, 0);
        var skirtR = new _three.Mesh(new _three.BoxGeometry(0.14, 0.16, 2.8), stripeMat);
        skirtR.position.set(1.02, 0.28, 0);
        if (celShaded) addInkOutline(splitter, 1.07);
        group.add(splitter, skirtL, skirtR);
    }
    // Rear Wing Spoiler + Struts (scaled higher for drift)
    var wingY = style === 'drift' ? 1.24 : style === 'heavy' ? 1.08 : 1.04;
    var wing = new _three.Mesh(new _three.BoxGeometry(chassisW + 0.08, 0.08, 0.4), stripeMat);
    wing.position.set(0, wingY, -1.96);
    var strutH = style === 'drift' ? 0.52 : 0.34;
    var strutL = new _three.Mesh(new _three.BoxGeometry(0.08, strutH, 0.14), tireMat);
    strutL.position.set(-0.62, wingY - strutH * 0.5, -1.95);
    var strutR = new _three.Mesh(new _three.BoxGeometry(0.08, strutH, 0.14), tireMat);
    strutR.position.set(0.62, wingY - strutH * 0.5, -1.95);
    if (celShaded) addInkOutline(wing, 1.09);
    // Tail lights + Nitro exhaust flames
    var tail = new _three.Mesh(new _three.BoxGeometry(chassisW - 0.18, 0.1, 0.06), tailMat);
    tail.position.set(0, 0.56, -2.18);
    var flameGeo = new _three.ConeGeometry(0.14, 0.85, 8);
    flameGeo.rotateX(-Math.PI / 2);
    var flameL = new _three.Mesh(flameGeo, flameMat);
    flameL.position.set(-0.46, 0.36, -2.55);
    flameL.visible = false;
    var flameR = new _three.Mesh(flameGeo, flameMat);
    flameR.position.set(0.46, 0.36, -2.55);
    flameR.visible = false;
    // 4 Wheels touching ground at y=0 (radius 0.36)
    var wheels = [];
    var wheelGeo = new _three.CylinderGeometry(0.36, 0.36, 0.28, 14);
    wheelGeo.rotateZ(Math.PI / 2);
    var rimGeo = new _three.CylinderGeometry(0.21, 0.21, 0.3, 10);
    rimGeo.rotateZ(Math.PI / 2);
    var wxOff = chassisW * 0.5;
    var wheelCoords = [
        [
            -wxOff,
            0.36,
            1.32
        ],
        [
            wxOff,
            0.36,
            1.32
        ],
        [
            -wxOff,
            0.36,
            -1.32
        ],
        [
            wxOff,
            0.36,
            -1.32
        ]
    ];
    for(var _iterator = _create_for_of_iterator_helper_loose(wheelCoords), _step; !(_step = _iterator()).done;){
        var _step_value = _step.value, wx = _step_value[0], wy = _step_value[1], wz = _step_value[2];
        var tire = new _three.Mesh(wheelGeo, tireMat);
        tire.position.set(wx, wy, wz);
        var rim = new _three.Mesh(rimGeo, rimMat);
        tire.add(rim);
        if (celShaded) addInkOutline(tire, 1.08);
        group.add(tire);
        wheels.push(tire);
    }
    group.add(chassis, cabin, roof, stripe, wing, strutL, strutR, tail, flameL, flameR, createContactShadowMesh(2.4, 0.48));
    return {
        group: group,
        wheels: wheels,
        flameL: flameL,
        flameR: flameR
    };
}
function buildBasketballPlayerMesh(jerseyColor, trimColor, skinColor, isHome, scale, celShaded, shoeColors) {
    if (scale === void 0) scale = 1;
    if (celShaded === void 0) celShaded = true;
    var _ref, _ref1, _ref2;
    var group = new _three.Group();
    var jerseyMat = celShaded ? createToonMaterial(jerseyColor) : new _three.MeshStandardMaterial({
        color: jerseyColor,
        roughness: 0.55,
        metalness: 0.1
    });
    var trimMat = celShaded ? createToonMaterial(trimColor) : new _three.MeshStandardMaterial({
        color: trimColor,
        roughness: 0.4,
        metalness: 0.25
    });
    var skinMat = celShaded ? createToonMaterial(skinColor) : new _three.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.65,
        metalness: 0.05
    });
    var upperCol = (_ref = shoeColors == null ? void 0 : shoeColors.upper) != null ? _ref : isHome ? 0xf8fafc : 0x111827;
    var soleCol = (_ref1 = shoeColors == null ? void 0 : shoeColors.sole) != null ? _ref1 : 0xf8fafc;
    var accentCol = (_ref2 = shoeColors == null ? void 0 : shoeColors.accent) != null ? _ref2 : trimColor;
    var sneakerMat = celShaded ? createToonMaterial(upperCol) : new _three.MeshStandardMaterial({
        color: upperCol,
        roughness: 0.45
    });
    var soleMat = celShaded ? createToonMaterial(soleCol) : new _three.MeshStandardMaterial({
        color: soleCol,
        roughness: 0.5
    });
    var shoeAccentMat = celShaded ? createToonMaterial(accentCol) : new _three.MeshStandardMaterial({
        color: accentCol,
        roughness: 0.35
    });
    var hairMat = celShaded ? createToonMaterial(0x111827) : new _three.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.85
    });
    // Sneakers (Upper + Sole + Accent Stripe) + Legs
    var shoeGeo = new _three.BoxGeometry(0.22, 0.13, 0.34);
    var soleGeo = new _three.BoxGeometry(0.23, 0.05, 0.36);
    var stripeGeo = new _three.BoxGeometry(0.24, 0.04, 0.16);
    var legGeo = new _three.BoxGeometry(0.18, 0.62, 0.2);
    var legL = new _three.Mesh(legGeo, skinMat);
    legL.position.set(-0.16, 0.44, 0);
    var shoeL = new _three.Mesh(shoeGeo, sneakerMat);
    shoeL.position.set(0, -0.35, 0.06);
    var soleL = new _three.Mesh(soleGeo, soleMat);
    soleL.position.set(0, -0.07, 0);
    var accentL = new _three.Mesh(stripeGeo, shoeAccentMat);
    accentL.position.set(0, 0.01, 0.02);
    shoeL.add(soleL, accentL);
    legL.add(shoeL);
    var legR = new _three.Mesh(legGeo, skinMat);
    legR.position.set(0.16, 0.44, 0);
    var shoeR = new _three.Mesh(shoeGeo, sneakerMat);
    shoeR.position.set(0, -0.35, 0.06);
    var soleR = new _three.Mesh(soleGeo, soleMat);
    soleR.position.set(0, -0.07, 0);
    var accentR = new _three.Mesh(stripeGeo, shoeAccentMat);
    accentR.position.set(0, 0.01, 0.02);
    shoeR.add(soleR, accentR);
    legR.add(shoeR);
    // Shorts
    var shorts = new _three.Mesh(new _three.BoxGeometry(0.56, 0.34, 0.36), jerseyMat);
    shorts.position.set(0, 0.8, 0);
    var waistband = new _three.Mesh(new _three.BoxGeometry(0.58, 0.07, 0.38), trimMat);
    waistband.position.set(0, 0.96, 0);
    // Jersey Torso + Collar Trim
    var torso = new _three.Mesh(new _three.BoxGeometry(0.58, 0.68, 0.34), jerseyMat);
    torso.position.set(0, 1.32, 0);
    torso.castShadow = true;
    var stripeFront = new _three.Mesh(new _three.BoxGeometry(0.26, 0.24, 0.36), trimMat);
    stripeFront.position.set(0, 1.36, 0);
    // Head + Headband
    var head = new _three.Mesh(new _three.BoxGeometry(0.38, 0.4, 0.38), skinMat);
    head.position.set(0, 1.88, 0);
    head.castShadow = true;
    var hair = new _three.Mesh(new _three.BoxGeometry(0.4, 0.14, 0.4), hairMat);
    hair.position.set(0, 2.06, -0.01);
    var headband = new _three.Mesh(new _three.BoxGeometry(0.41, 0.08, 0.41), trimMat);
    headband.position.set(0, 1.98, 0);
    // Articulated Arms pivoted at shoulder y=1.58
    var armGeo = new _three.BoxGeometry(0.16, 0.58, 0.18);
    var armL = new _three.Group();
    armL.position.set(-0.4, 1.58, 0);
    var armLMesh = new _three.Mesh(armGeo, skinMat);
    armLMesh.position.set(0, -0.26, 0);
    armL.add(armLMesh);
    var armR = new _three.Group();
    armR.position.set(0.4, 1.58, 0);
    var armRMesh = new _three.Mesh(armGeo, skinMat);
    armRMesh.position.set(0, -0.26, 0);
    armR.add(armRMesh);
    // Active selection ring on hardwood (visible only on controlled player)
    var activeRing = new _three.Mesh(new _three.RingGeometry(0.62, 0.82, 24), new _three.MeshBasicMaterial({
        color: isHome ? 0x4ade80 : 0xfacc15,
        side: _three.DoubleSide,
        transparent: true,
        opacity: 0.92,
        depthWrite: false
    }));
    activeRing.rotation.x = -Math.PI / 2;
    activeRing.position.y = 0.045;
    activeRing.visible = false;
    if (celShaded) {
        addInkOutline(torso, 1.07);
        addInkOutline(shorts, 1.07);
        addInkOutline(head, 1.08);
        addInkOutline(legL, 1.09);
        addInkOutline(legR, 1.09);
        addInkOutline(armLMesh, 1.09);
        addInkOutline(armRMesh, 1.09);
    }
    group.add(legL, legR, shorts, waistband, torso, stripeFront, head, hair, headband, armL, armR, activeRing, createContactShadowMesh(0.75, 0.42));
    group.scale.setScalar(scale);
    return {
        group: group,
        armL: armL,
        armR: armR,
        legL: legL,
        legR: legR,
        activeRing: activeRing
    };
}
function buildBuggyMesh(paintColor) {
    if (paintColor === void 0) paintColor = 0x57534e;
    var group = new _three.Group();
    var bodyMat = new _three.MeshStandardMaterial({
        color: paintColor,
        roughness: 0.62,
        metalness: 0.32
    });
    var cageMat = new _three.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
        metalness: 0.75
    });
    var tireMat = new _three.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.9,
        metalness: 0.08
    });
    var accentMat = new _three.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.35,
        roughness: 0.3
    });
    var chassis = new _three.Mesh(new _three.BoxGeometry(1.75, 0.42, 3.65), bodyMat);
    chassis.position.set(0, 0.56, 0);
    chassis.castShadow = true;
    var hood = new _three.Mesh(new _three.BoxGeometry(1.42, 0.24, 1.25), bodyMat);
    hood.position.set(0, 0.8, 1.15);
    var bumper = new _three.Mesh(new _three.BoxGeometry(1.88, 0.28, 0.28), cageMat);
    bumper.position.set(0, 0.54, 1.9);
    // Open roll cage bars
    var barPositions = [
        [
            -0.74,
            1.25,
            -0.25,
            0.09,
            0.98,
            0.09
        ],
        [
            0.74,
            1.25,
            -0.25,
            0.09,
            0.98,
            0.09
        ],
        [
            -0.74,
            1.18,
            0.62,
            0.09,
            0.85,
            0.09
        ],
        [
            0.74,
            1.18,
            0.62,
            0.09,
            0.85,
            0.09
        ],
        [
            0,
            1.72,
            -0.25,
            1.56,
            0.09,
            1.25
        ]
    ];
    for(var _iterator = _create_for_of_iterator_helper_loose(barPositions), _step; !(_step = _iterator()).done;){
        var _step_value = _step.value, x = _step_value[0], y = _step_value[1], z = _step_value[2], w = _step_value[3], h = _step_value[4], d = _step_value[5];
        var bar = new _three.Mesh(new _three.BoxGeometry(w, h, d), cageMat);
        bar.position.set(x, y, z);
        group.add(bar);
    }
    var lightBar = new _three.Mesh(new _three.BoxGeometry(1.05, 0.14, 0.16), accentMat);
    lightBar.position.set(0, 1.82, 0.32);
    var wheels = [];
    var wheelGeo = new _three.CylinderGeometry(0.46, 0.46, 0.34, 14);
    wheelGeo.rotateZ(Math.PI / 2);
    var coords = [
        [
            -1.02,
            0.46,
            1.22
        ],
        [
            1.02,
            0.46,
            1.22
        ],
        [
            -1.05,
            0.46,
            -1.25
        ],
        [
            1.05,
            0.46,
            -1.25
        ]
    ];
    for(var _iterator1 = _create_for_of_iterator_helper_loose(coords), _step1; !(_step1 = _iterator1()).done;){
        var _step_value1 = _step1.value, wx = _step_value1[0], wy = _step_value1[1], wz = _step_value1[2];
        var tire = new _three.Mesh(wheelGeo, tireMat);
        tire.position.set(wx, wy, wz);
        group.add(tire);
        wheels.push(tire);
    }
    group.add(chassis, hood, bumper, lightBar, createContactShadowMesh(2.2, 0.45));
    return {
        group: group,
        wheels: wheels
    };
}
function buildShinobiMesh(hero, scale, isAwakened) {
    if (scale === void 0) scale = 1;
    if (isAwakened === void 0) isAwakened = false;
    var group = new _three.Group();
    var primaryMat = createToonMaterial(hero.primaryColor);
    var accentMat = createToonMaterial(hero.accentColor);
    var hairMat = createToonMaterial(hero.hairColor);
    var skinMat = createToonMaterial(hero.faction === 'Boruto & Otsutsuki' ? 0xf1f5f9 : 0xfde68a);
    var darkMat = createToonMaterial(0x111827);
    var steelMat = createToonMaterial(0x94a3b8);
    var chakraMat = createToonMaterial(hero.chakraColor, {
        emissive: hero.chakraColor,
        emissiveIntensity: 0.72
    });
    // Ninja sandals & legs
    var legGeo = new _three.BoxGeometry(0.2, 0.66, 0.22);
    var legL = new _three.Mesh(legGeo, darkMat);
    legL.position.set(-0.17, 0.36, 0);
    var legR = new _three.Mesh(legGeo, darkMat);
    legR.position.set(0.17, 0.36, 0);
    addInkOutline(legL, 1.09);
    addInkOutline(legR, 1.09);
    // Torso + Flak Jacket / Cloak
    var torso = new _three.Mesh(new _three.BoxGeometry(0.62, 0.76, 0.38), primaryMat);
    torso.position.set(0, 1.08, 0);
    torso.castShadow = true;
    addInkOutline(torso, 1.07);
    var vest = new _three.Mesh(new _three.BoxGeometry(0.66, 0.48, 0.42), accentMat);
    vest.position.set(0, 1.15, 0);
    addInkOutline(vest, 1.07);
    // Flowing cloak or sash at back
    var cloak = new _three.Mesh(new _three.BoxGeometry(0.68, 0.96, 0.1), accentMat);
    cloak.position.set(0, 0.96, -0.24);
    cloak.rotation.x = 0.16;
    addInkOutline(cloak, 1.08);
    // Head + Headband Protector + Spiky Anime Hair
    var head = new _three.Mesh(new _three.BoxGeometry(0.42, 0.42, 0.42), skinMat);
    head.position.set(0, 1.72, 0);
    head.castShadow = true;
    addInkOutline(head, 1.08);
    var headband = new _three.Mesh(new _three.BoxGeometry(0.45, 0.1, 0.45), darkMat);
    headband.position.set(0, 1.82, 0);
    var plate = new _three.Mesh(new _three.BoxGeometry(0.24, 0.08, 0.04), steelMat);
    plate.position.set(0, 1.82, 0.24);
    var hairGroup = new _three.Group();
    hairGroup.position.set(0, 1.94, 0);
    var hairCrown = new _three.Mesh(new _three.BoxGeometry(0.46, 0.16, 0.46), hairMat);
    hairGroup.add(hairCrown);
    for(var i = 0; i < 5; i++){
        var ang = i * Math.PI * 2 / 5 + 0.3;
        var spike = new _three.Mesh(new _three.ConeGeometry(0.12, 0.32, 5), hairMat);
        spike.position.set(Math.cos(ang) * 0.16, 0.14, Math.sin(ang) * 0.14);
        spike.rotation.z = -Math.cos(ang) * 0.42;
        spike.rotation.x = Math.sin(ang) * 0.35;
        hairGroup.add(spike);
    }
    // Otsutsuki horns if Otsutsuki faction
    if (hero.faction === 'Boruto & Otsutsuki' && hero.teamTags.includes('otsutsuki')) {
        var hornL = new _three.Mesh(new _three.ConeGeometry(0.06, 0.36, 6), skinMat);
        hornL.position.set(-0.18, 2.1, 0.12);
        hornL.rotation.z = 0.25;
        var hornR = new _three.Mesh(new _three.ConeGeometry(0.06, 0.36, 6), skinMat);
        hornR.position.set(0.18, 2.1, 0.12);
        hornR.rotation.z = -0.25;
        group.add(hornL, hornR);
    }
    // Articulated Arms
    var armGeo = new _three.BoxGeometry(0.18, 0.56, 0.18);
    var armL = new _three.Group();
    armL.position.set(-0.42, 1.38, 0);
    var armLMesh = new _three.Mesh(armGeo, primaryMat);
    armLMesh.position.set(0, -0.24, 0);
    addInkOutline(armLMesh, 1.09);
    armL.add(armLMesh);
    var armR = new _three.Group();
    armR.position.set(0.42, 1.38, 0);
    var armRMesh = new _three.Mesh(armGeo, primaryMat);
    armRMesh.position.set(0, -0.24, 0);
    addInkOutline(armRMesh, 1.09);
    armR.add(armRMesh);
    // Weapon attachment on right hand / back
    var wKind = hero.weapon;
    if (wKind === 'sword' || wKind === 'samehada') {
        var bladeW = wKind === 'samehada' ? 0.28 : 0.11;
        var bladeH = wKind === 'samehada' ? 1.48 : 1.25;
        var sword = new _three.Mesh(new _three.BoxGeometry(bladeW, bladeH, 0.08), wKind === 'samehada' ? createToonMaterial(0x1d4ed8) : steelMat);
        sword.position.set(0, -0.45, 0.45);
        sword.rotation.x = 0.85;
        addInkOutline(sword, 1.09);
        armR.add(sword);
    } else if (wKind === 'scythe') {
        var pole = new _three.Mesh(new _three.CylinderGeometry(0.04, 0.04, 1.65, 8), darkMat);
        pole.position.set(0, -0.35, 0.38);
        pole.rotation.x = 0.65;
        var blade1 = new _three.Mesh(new _three.BoxGeometry(0.06, 0.14, 0.55), createToonMaterial(0xdc2626));
        blade1.position.set(0, 0.38, 0.68);
        var blade2 = new _three.Mesh(new _three.BoxGeometry(0.06, 0.12, 0.46), createToonMaterial(0xdc2626));
        blade2.position.set(0, 0.18, 0.62);
        armR.add(pole, blade1, blade2);
    } else if (wKind === 'fan') {
        var fan = new _three.Mesh(new _three.CylinderGeometry(0.56, 0.12, 0.08, 12), createToonMaterial(0xfafafa));
        fan.rotation.z = Math.PI / 2;
        fan.position.set(0.14, -0.32, 0.36);
        addInkOutline(fan, 1.08);
        armR.add(fan);
    } else if (wKind === 'gourd') {
        var gourd = new _three.Mesh(new _three.SphereGeometry(0.42, 12, 12), createToonMaterial(0xd97706));
        gourd.scale.set(0.85, 1.35, 0.85);
        gourd.position.set(0, 1.25, -0.46);
        addInkOutline(gourd, 1.08);
        group.add(gourd);
    } else if (wKind === 'staff' || wKind === 'rods') {
        var staff = new _three.Mesh(new _three.CylinderGeometry(0.045, 0.045, 1.72, 8), darkMat);
        staff.position.set(0, -0.25, 0.38);
        staff.rotation.x = 0.55;
        armR.add(staff);
    } else if (wKind === 'bones') {
        var boneL = new _three.Mesh(new _three.ConeGeometry(0.08, 0.72, 6), createToonMaterial(0xf8fafc));
        boneL.position.set(0, -0.52, 0.25);
        boneL.rotation.x = Math.PI / 2;
        var boneR = boneL.clone();
        armL.add(boneL);
        armR.add(boneR);
    } else if (wKind === 'puppet') {
        var scroll = new _three.Mesh(new _three.CylinderGeometry(0.18, 0.18, 0.92, 10), createToonMaterial(0x991b1b));
        scroll.rotation.z = Math.PI / 2;
        scroll.position.set(0, 1.48, -0.38);
        group.add(scroll);
    } else {
        // Kunai or Chakra Orb in right hand
        var kunai = new _three.Mesh(new _three.ConeGeometry(0.08, 0.44, 4), steelMat);
        kunai.rotation.x = Math.PI / 2;
        kunai.position.set(0, -0.45, 0.26);
        armR.add(kunai);
    }
    // Ground Chakra Ring
    var chakraRing = new _three.Mesh(new _three.RingGeometry(0.68, 0.92, 28), new _three.MeshBasicMaterial({
        color: hero.chakraColor,
        side: _three.DoubleSide,
        transparent: true,
        opacity: 0.75,
        depthWrite: false
    }));
    chakraRing.rotation.x = -Math.PI / 2;
    chakraRing.position.y = 0.04;
    // Guard Shield Sphere (visible when blocking in 3D Storm Mode)
    var guardShield = new _three.Mesh(new _three.SphereGeometry(1.25, 16, 14), new _three.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.34,
        wireframe: false,
        depthWrite: false
    }));
    guardShield.position.set(0, 1.1, 0);
    guardShield.visible = false;
    // True Awakening Aura (giant Susanoo ribs / Kurama tails / Six Paths Truth-Seeking Orbs)
    var awakeningAura = new _three.Group();
    awakeningAura.position.set(0, 1.15, 0);
    for(var i1 = 0; i1 < 6; i1++){
        var ang1 = i1 * Math.PI * 2 / 6;
        var rib = new _three.Mesh(new _three.TorusGeometry(1.15, 0.07, 6, 18, Math.PI * 0.8), chakraMat);
        rib.position.y = i1 % 3 * 0.34 - 0.25;
        rib.rotation.x = Math.PI / 2;
        rib.rotation.z = ang1;
        awakeningAura.add(rib);
    }
    awakeningAura.visible = isAwakened;
    group.add(legL, legR, torso, vest, cloak, head, headband, plate, hairGroup, armL, armR, chakraRing, guardShield, awakeningAura, createContactShadowMesh(0.86, 0.44));
    group.scale.setScalar(scale * (isAwakened ? 1.45 : 1));
    return {
        group: group,
        armL: armL,
        armR: armR,
        legL: legL,
        legR: legR,
        chakraRing: chakraRing,
        guardShield: guardShield,
        awakeningAura: awakeningAura
    };
}

});

})(window.ArcadeMod);
