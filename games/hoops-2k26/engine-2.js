(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/HoopsCity3D ===
ArcadeMod.define("src/games/hoops-2k26/HoopsCity3D", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HoopsCity3D", {
    enumerable: true,
    get: function() {
        return HoopsCity3D;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _arenaRoster = require("../../core/arenaRoster");
var _storage = require("../../core/storage");
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
var _camGoal = new _three.Vector3();
var _lookGoal = new _three.Vector3();
var _lookCur = new _three.Vector3();
var _proj = new _three.Vector3();
function hexStrToNum(hex, fallback) {
    var clean = hex.replace('#', '');
    var n = parseInt(clean, 16);
    return Number.isFinite(n) ? n : fallback;
}
var HoopsCity3D = /*#__PURE__*/ function() {
    "use strict";
    function HoopsCity3D(container, callbacks) {
        var _this = this;
        if (callbacks === void 0) callbacks = {};
        this.playerX = 0;
        this.playerZ = 8;
        this.playerYaw = Math.PI;
        this.animPhase = 0;
        this.vehicleMounted = false;
        this.waypointId = 'the_rec';
        this.nearbyLocId = null;
        this.keys = {};
        this.joyDx = 0;
        this.joyDz = 0;
        this.isRunning = false;
        this.lastTime = 0;
        this.portalRings = new Map();
        this.gpsDots = [];
        this.ambientNpcs = [];
        this.onKeyDown = function(e) {
            var _e_target;
            var tag = (_e_target = e.target) == null ? void 0 : _e_target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            _this.keys[e.code] = true;
        };
        this.onKeyUp = function(e) {
            _this.keys[e.code] = false;
        };
        this.onResize = function() {
            var _this_three;
            (_this_three = _this.three) == null ? void 0 : _this_three.resize();
        };
        this.tick = function() {
            if (!_this.isRunning) return;
            var now = performance.now();
            var dt = Math.min(Math.max((now - _this.lastTime) / 1000, 0.001), 0.05);
            _this.lastTime = now;
            _this.stepPlayer(dt);
            _this.updateVisuals(dt, now * 0.001);
            _this.three.render();
            _this.drawLandmarkLabels();
            if (_this.isRunning) {
                _this.three.scheduleNextFrame(_this.tick);
            }
        };
        this.container = container;
        this.callbacks = callbacks;
        this.three = new _threeShared.StudioThreeContext(container, {
            skyColor: 0x38bdf8,
            fogColor: 0xbae6fd,
            fogNear: 52,
            fogFar: 165,
            keyColor: 0xfff8e7,
            keyIntensity: 2.15,
            hemiSky: 0x7dd3fc,
            hemiGround: 0x78716c,
            hemiIntensity: 1.05,
            shadowExtent: 46,
            fov: 50,
            far: 240,
            useContainerSize: true
        });
        this.three.renderer.toneMapping = _three.NoToneMapping;
        this.buildPlazaWorld();
        this.buildGpsTrail();
        this.spawnPlayerAndVehicle();
        this.spawnAmbientHoopers();
        _lookCur.set(this.playerX, 2.0, this.playerZ - 2);
        this.three.camera.position.set(this.playerX, 9.5, this.playerZ + 12.5);
        this.three.camera.lookAt(_lookCur);
        this.three.prewarm();
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('resize', this.onResize);
        this.isRunning = true;
        this.lastTime = performance.now();
        this.checkNearbyLocation(true);
        this.tick();
    }
    var _proto = HoopsCity3D.prototype;
    _proto.setJoystick = function setJoystick(dx, dz) {
        this.joyDx = Math.max(-1, Math.min(1, dx));
        this.joyDz = Math.max(-1, Math.min(1, dz));
    };
    _proto.setWaypoint = function setWaypoint(locId) {
        this.waypointId = locId;
    };
    _proto.toggleVehicle = function toggleVehicle() {
        var mp = (0, _arenaRoster.getActiveMyPlayer)(_storage.playerState.hoops2k26);
        if (mp.equippedVehicle === 'none') {
            mp.equippedVehicle = 'skateboard';
        }
        this.vehicleMounted = !this.vehicleMounted;
        this.syncVehicleMesh();
        this.callbacks.onPlayerMove == null ? void 0 : this.callbacks.onPlayerMove.call(this.callbacks, this.playerX, this.playerZ, this.vehicleMounted);
        return this.vehicleMounted;
    };
    _proto.setVehicleMounted = function setVehicleMounted(on) {
        this.vehicleMounted = on;
        this.syncVehicleMesh();
    };
    _proto.teleportTo = function teleportTo(locId) {
        var loc = _arenaRoster.HOOPS_CITY_LOCATIONS.find(function(l) {
            return l.id === locId;
        });
        if (!loc) return null;
        // Land cleanly in front of the entrance portal ring
        var distFromOrigin = Math.hypot(loc.x, loc.z);
        if (distFromOrigin > 3) {
            var pull = Math.max(0, distFromOrigin - 4.2) / distFromOrigin;
            this.playerX = loc.x * pull;
            this.playerZ = loc.z * pull;
            this.playerYaw = Math.atan2(loc.x - this.playerX, loc.z - this.playerZ);
        } else {
            this.playerX = loc.x;
            this.playerZ = loc.z + 3.2;
            this.playerYaw = Math.PI;
        }
        this.waypointId = loc.id;
        this.checkNearbyLocation(true);
        this.callbacks.onPlayerMove == null ? void 0 : this.callbacks.onPlayerMove.call(this.callbacks, this.playerX, this.playerZ, this.vehicleMounted);
        return loc;
    };
    _proto.getNearbyLocation = function getNearbyLocation() {
        var _this = this;
        var _HOOPS_CITY_LOCATIONS_find;
        return (_HOOPS_CITY_LOCATIONS_find = _arenaRoster.HOOPS_CITY_LOCATIONS.find(function(l) {
            return l.id === _this.nearbyLocId;
        })) != null ? _HOOPS_CITY_LOCATIONS_find : null;
    };
    _proto.buildPlazaWorld = function buildPlazaWorld() {
        // Open-air sunlit plaza deck with radial promenades & center medallion
        var plazaTex = this.three.createCanvasTexture(1024, function(ctx, s) {
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(0, 0, s, s);
            // Subtle sunlit paving grid
            ctx.strokeStyle = 'rgba(71, 85, 105, 0.16)';
            ctx.lineWidth = 2;
            for(var i = 0; i <= s; i += 32){
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, s);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(s, i);
                ctx.stroke();
            }
            // Cross-city dark slate avenues (North-South & East-West)
            ctx.fillStyle = '#475569';
            ctx.fillRect(s * 0.44, 0, s * 0.12, s);
            ctx.fillRect(0, s * 0.44, s, s * 0.12);
            // Perimeter walkway loop
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 44;
            ctx.strokeRect(s * 0.16, s * 0.16, s * 0.68, s * 0.68);
            // Golden boulevard lane markings
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
            ctx.lineWidth = 4;
            ctx.setLineDash([
                18,
                14
            ]);
            ctx.strokeRect(s * 0.16, s * 0.16, s * 0.68, s * 0.68);
            ctx.setLineDash([]);
            // Central Plaza Medallion
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(s * 0.5, s * 0.5, 118, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 10;
            ctx.stroke();
            ctx.fillStyle = '#facc15';
            ctx.font = '900 42px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('THE CITY', s * 0.5, s * 0.5 - 16);
            ctx.fillStyle = '#38bdf8';
            ctx.font = '800 22px system-ui, sans-serif';
            ctx.fillText('HOOPS 2K26 PLAZA', s * 0.5, s * 0.5 + 24);
        }, 1, 1);
        plazaTex.wrapS = _three.ClampToEdgeWrapping;
        plazaTex.wrapT = _three.ClampToEdgeWrapping;
        var ground = new _three.Mesh(new _three.PlaneGeometry(148, 148), new _three.MeshStandardMaterial({
            map: plazaTex,
            roughness: 0.78,
            metalness: 0.05
        }));
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.three.scene.add(ground);
        // Outer coastal grass / boulevard apron so there are no sharp edges
        var outerApron = new _three.Mesh(new _three.PlaneGeometry(340, 340), new _three.MeshLambertMaterial({
            color: 0x1e293b
        }));
        outerApron.rotation.x = -Math.PI / 2;
        outerApron.position.y = -0.08;
        this.three.scene.add(outerApron);
        // Open-air Metropolis Skyline Silhouettes around far horizon (radius 74..92)
        var skylinePalette = [
            0x334155,
            0x475569,
            0x1e293b,
            0x3b82f6,
            0x0f172a
        ];
        for(var i = 0; i < 28; i++){
            var ang = i / 28 * Math.PI * 2;
            var dist = 74 + i % 3 * 9;
            var w = 7 + i % 4 * 3;
            var h = 16 + i * 7 % 24;
            var bldg = new _three.Mesh(new _three.BoxGeometry(w, h, w), new _three.MeshStandardMaterial({
                color: skylinePalette[i % skylinePalette.length],
                roughness: 0.7,
                metalness: 0.15
            }));
            bldg.position.set(Math.cos(ang) * dist, h * 0.5 - 0.1, Math.sin(ang) * dist);
            this.three.scene.add(bldg);
        }
        // Palm / Street Trees along plaza corners
        var trunkMat = (0, _threeShared.createToonMaterial)(0x78350f);
        var leafMat = (0, _threeShared.createToonMaterial)(0x16a34a);
        var treeSpots = [
            [
                -16,
                -16
            ],
            [
                16,
                -16
            ],
            [
                -16,
                16
            ],
            [
                16,
                16
            ],
            [
                -34,
                -22
            ],
            [
                34,
                -22
            ],
            [
                -34,
                24
            ],
            [
                34,
                24
            ]
        ];
        for(var _iterator = _create_for_of_iterator_helper_loose(treeSpots), _step; !(_step = _iterator()).done;){
            var _step_value = _step.value, tx = _step_value[0], tz = _step_value[1];
            var trunk = new _three.Mesh(new _three.CylinderGeometry(0.24, 0.34, 4.4, 7), trunkMat);
            trunk.position.set(tx, 2.2, tz);
            var canopy = new _three.Mesh(new _three.DodecahedronGeometry(1.9, 0), leafMat);
            canopy.position.set(tx, 4.8, tz);
            this.three.scene.add(trunk, canopy);
        }
        // Build all 18 City Landmarks + Glowing Portal Rings
        for(var _iterator1 = _create_for_of_iterator_helper_loose(_arenaRoster.HOOPS_CITY_LOCATIONS), _step1; !(_step1 = _iterator1()).done;){
            var loc = _step1.value;
            this.buildLandmark(loc);
        }
    };
    _proto.buildLandmark = function buildLandmark(loc) {
        var group = new _three.Group();
        group.position.set(loc.x, 0, loc.z);
        var accentMat = (0, _threeShared.createToonMaterial)(loc.color, {
            emissive: loc.color,
            emissiveIntensity: 0.28
        });
        var bodyMat = (0, _threeShared.createToonMaterial)(0x1e293b);
        var roofMat = (0, _threeShared.createToonMaterial)(0x0f172a);
        if (loc.id === 'central_plaza') {
            // Glowing City Directory & Leaderboard Spire
            var plinth = new _three.Mesh(new _three.CylinderGeometry(2.6, 3.1, 0.7, 16), bodyMat);
            plinth.position.y = 0.35;
            var spire = new _three.Mesh(new _three.CylinderGeometry(0.55, 0.9, 5.4, 10), accentMat);
            spire.position.y = 3.2;
            (0, _threeShared.addInkOutline)(spire, 1.05);
            var crown = new _three.Mesh(new _three.TorusGeometry(1.4, 0.16, 10, 24), (0, _threeShared.createToonMaterial)(0xfacc15));
            crown.rotation.x = Math.PI / 2;
            crown.position.y = 5.4;
            group.add(plinth, spire, crown);
        } else if (loc.id === 'park_courts' || loc.id === 'street_kings') {
            // Outdoor concrete half-court with painted key, white Got Next circle, and hoop stanchion!
            var slab = new _three.Mesh(new _three.BoxGeometry(11.5, 0.14, 9.2), (0, _threeShared.createToonMaterial)(loc.id === 'park_courts' ? 0x1d4ed8 : 0x7c2d12));
            slab.position.y = 0.07;
            var key = new _three.Mesh(new _three.BoxGeometry(3.4, 0.16, 3.8), accentMat);
            key.position.set(0, 0.08, -2.5);
            var post = new _three.Mesh(new _three.BoxGeometry(0.32, 3.4, 0.32), roofMat);
            post.position.set(0, 1.7, -4.1);
            var board = new _three.Mesh(new _three.BoxGeometry(2.2, 1.3, 0.12), (0, _threeShared.createToonMaterial)(0xe0f2fe));
            board.position.set(0, 3.1, -3.7);
            var rim = new _three.Mesh(new _three.TorusGeometry(0.42, 0.06, 8, 18), (0, _threeShared.createToonMaterial)(0xf97316));
            rim.rotation.x = Math.PI / 2;
            rim.position.set(0, 2.75, -3.2);
            // White Got Next Spot
            var gotNext = new _three.Mesh(new _three.RingGeometry(0.8, 1.15, 22), new _three.MeshBasicMaterial({
                color: 0xffffff,
                side: _three.DoubleSide
            }));
            gotNext.rotation.x = -Math.PI / 2;
            gotNext.position.set(0, 0.18, 2.8);
            group.add(slab, key, post, board, rim, gotNext);
        } else if (loc.kind === 'farming') {
            // Sleek Illuminated Kiosk Booth (Daily Reward / Pick'Em / Track)
            var base = new _three.Mesh(new _three.CylinderGeometry(1.8, 2.0, 2.5, 8), bodyMat);
            base.position.y = 1.25;
            (0, _threeShared.addInkOutline)(base, 1.04);
            var canopy = new _three.Mesh(new _three.ConeGeometry(2.5, 1.1, 8), accentMat);
            canopy.position.y = 3.1;
            group.add(base, canopy);
        } else {
            // Modern Arena / Gym / Store Facade Building
            var isMajorArena = loc.kind === 'court' && loc.courtTheme !== 'park' && loc.courtTheme !== 'street_kings';
            var w = isMajorArena ? 11.5 : 8.5;
            var h = isMajorArena ? 7.2 : 5.2;
            var d = isMajorArena ? 7.5 : 6.2;
            var building = new _three.Mesh(new _three.BoxGeometry(w, h, d), bodyMat);
            building.position.y = h * 0.5;
            building.castShadow = true;
            (0, _threeShared.addInkOutline)(building, 1.03);
            var marquee = new _three.Mesh(new _three.BoxGeometry(w + 0.5, 1.25, d + 0.4), accentMat);
            marquee.position.y = h - 0.8;
            var doorway = new _three.Mesh(new _three.BoxGeometry(3.2, 2.8, d + 0.25), new _three.MeshBasicMaterial({
                color: loc.color
            }));
            doorway.position.y = 1.4;
            group.add(building, marquee, doorway);
        }
        // Floating Portal Entry Ring
        var ring = new _three.Mesh(new _three.RingGeometry(2.3, 2.85, 28), new _three.MeshBasicMaterial({
            color: loc.color,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.72,
            depthWrite: false
        }));
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.1;
        group.add(ring);
        this.portalRings.set(loc.id, {
            ring: ring,
            loc: loc
        });
        this.three.scene.add(group);
    };
    _proto.buildGpsTrail = function buildGpsTrail() {
        var geo = new _three.CylinderGeometry(0.28, 0.28, 0.08, 12);
        var mat = new _three.MeshBasicMaterial({
            color: 0xfacc15,
            transparent: true,
            opacity: 0.85
        });
        for(var i = 0; i < 12; i++){
            var dot = new _three.Mesh(geo, mat);
            dot.position.y = 0.09;
            dot.visible = false;
            this.three.scene.add(dot);
            this.gpsDots.push(dot);
        }
    };
    _proto.spawnPlayerAndVehicle = function spawnPlayerAndVehicle() {
        var _playerState_hoops2k26_customShoes_find;
        var mp = (0, _arenaRoster.getActiveMyPlayer)(_storage.playerState.hoops2k26);
        var team = (0, _arenaRoster.getHoops2K26TeamById)(mp.nbaTeamId);
        var shoe = (_playerState_hoops2k26_customShoes_find = _storage.playerState.hoops2k26.customShoes.find(function(s) {
            return s.id === mp.equippedShoeId;
        })) != null ? _playerState_hoops2k26_customShoes_find : _storage.playerState.hoops2k26.customShoes[0];
        this.playerRig = (0, _threeShared.buildBasketballPlayerMesh)(team.jerseyColor, team.trimColor, 0xc68642, true, 1.05, true, shoe ? {
            upper: hexStrToNum(shoe.upperHex, 0x111827),
            sole: hexStrToNum(shoe.soleHex, 0xf8fafc),
            accent: hexStrToNum(shoe.accentHex, 0xf59e0b)
        } : undefined);
        this.playerRig.activeRing.visible = true;
        this.three.scene.add(this.playerRig.group);
        // Sleek 3D Vehicle Deck (Skateboard / Hoverboard / Go-Kart visual mounted under player on V)
        this.vehicleGroup = new _three.Group();
        var deck = new _three.Mesh(new _three.BoxGeometry(0.68, 0.12, 1.65), (0, _threeShared.createToonMaterial)(0xf59e0b, {
            emissive: 0xd97706,
            emissiveIntensity: 0.3
        }));
        deck.position.y = 0.16;
        var glow = new _three.Mesh(new _three.BoxGeometry(0.55, 0.08, 1.45), new _three.MeshBasicMaterial({
            color: 0x38bdf8
        }));
        glow.position.y = 0.08;
        this.vehicleGroup.add(deck, glow);
        this.vehicleGroup.visible = false;
        this.three.scene.add(this.vehicleGroup);
    };
    _proto.syncVehicleMesh = function syncVehicleMesh() {
        if (this.vehicleGroup) {
            this.vehicleGroup.visible = this.vehicleMounted;
        }
    };
    _proto.spawnAmbientHoopers = function spawnAmbientHoopers() {
        var _this = this;
        var spots = [
            [
                -10,
                -28,
                0x007a33,
                0xfacc15
            ],
            [
                6,
                -30,
                0x552583,
                0xfdb927
            ],
            [
                28,
                -6,
                0x1d428a,
                0xffc72c
            ],
            [
                -26,
                6,
                0x006bb6,
                0xf58426
            ],
            [
                -8,
                30,
                0x98002e,
                0xf9a01b
            ],
            [
                14,
                28,
                0x14b8a6,
                0x111827
            ]
        ];
        spots.forEach(function(param, idx) {
            var x = param[0], z = param[1], jc = param[2], tc = param[3];
            var rig = (0, _threeShared.buildBasketballPlayerMesh)(jc, tc, idx % 2 === 0 ? 0x8d5524 : 0xd99b66, false, 1.0, true);
            rig.group.position.set(x, 0, z);
            _this.three.scene.add(rig.group);
            _this.ambientNpcs.push({
                rig: rig,
                baseX: x,
                baseZ: z,
                phase: idx * 1.4
            });
        });
    };
    _proto.checkNearbyLocation = function checkNearbyLocation(forceNotify) {
        if (forceNotify === void 0) forceNotify = false;
        var bestId = null;
        var bestDist = 7.4;
        for(var _iterator = _create_for_of_iterator_helper_loose(_arenaRoster.HOOPS_CITY_LOCATIONS), _step; !(_step = _iterator()).done;){
            var loc = _step.value;
            var d = Math.hypot(this.playerX - loc.x, this.playerZ - loc.z);
            if (d < bestDist) {
                bestDist = d;
                bestId = loc.id;
            }
        }
        if (bestId !== this.nearbyLocId || forceNotify) {
            var _HOOPS_CITY_LOCATIONS_find;
            this.nearbyLocId = bestId;
            var found = (_HOOPS_CITY_LOCATIONS_find = _arenaRoster.HOOPS_CITY_LOCATIONS.find(function(l) {
                return l.id === bestId;
            })) != null ? _HOOPS_CITY_LOCATIONS_find : null;
            this.callbacks.onNearbyLocationChange == null ? void 0 : this.callbacks.onNearbyLocationChange.call(this.callbacks, found);
        }
    };
    _proto.stepPlayer = function stepPlayer(dt) {
        var dx = this.joyDx;
        var dz = this.joyDz;
        if (this.keys.KeyA || this.keys.ArrowLeft) dx -= 1;
        if (this.keys.KeyD || this.keys.ArrowRight) dx += 1;
        if (this.keys.KeyW || this.keys.ArrowUp) dz -= 1;
        if (this.keys.KeyS || this.keys.ArrowDown) dz += 1;
        var mag = Math.hypot(dx, dz);
        var sprinting = Boolean(this.keys.ShiftLeft || this.keys.ShiftRight);
        var speed = this.vehicleMounted ? 17.5 : sprinting ? 12.2 : 8.5;
        if (mag > 0.08) {
            var nx = dx / Math.max(1, mag);
            var nz = dz / Math.max(1, mag);
            this.playerX = _three.MathUtils.clamp(this.playerX + nx * speed * dt, -52, 52);
            this.playerZ = _three.MathUtils.clamp(this.playerZ + nz * speed * dt, -52, 52);
            this.playerYaw = Math.atan2(nx, nz);
            this.animPhase += dt * (this.vehicleMounted ? 4 : sprinting ? 13 : 9);
            this.checkNearbyLocation(false);
            this.callbacks.onPlayerMove == null ? void 0 : this.callbacks.onPlayerMove.call(this.callbacks, this.playerX, this.playerZ, this.vehicleMounted);
        }
    };
    _proto.updateVisuals = function updateVisuals(dt, timeSec) {
        var _this = this;
        var rideLift = this.vehicleMounted ? 0.24 : 0;
        this.playerRig.group.position.set(this.playerX, rideLift, this.playerZ);
        this.playerRig.group.rotation.y = this.playerYaw;
        var moving = Math.hypot(this.joyDx, this.joyDz) > 0.1 || this.keys.KeyW || this.keys.KeyA || this.keys.KeyS || this.keys.KeyD || this.keys.ArrowUp || this.keys.ArrowDown || this.keys.ArrowLeft || this.keys.ArrowRight;
        var stride = moving && !this.vehicleMounted ? Math.sin(this.animPhase) * 0.52 : 0;
        this.playerRig.legL.rotation.x = stride;
        this.playerRig.legR.rotation.x = -stride;
        this.playerRig.armL.rotation.x = -stride * 0.6;
        this.playerRig.armR.rotation.x = stride * 0.6;
        if (this.vehicleMounted) {
            this.vehicleGroup.position.set(this.playerX, 0, this.playerZ);
            this.vehicleGroup.rotation.y = this.playerYaw;
        }
        // Pulse active / nearby portal rings
        this.portalRings.forEach(function(param) {
            var ring = param.ring, loc = param.loc;
            var isNear = loc.id === _this.nearbyLocId || loc.id === _this.waypointId;
            var pulse = isNear ? 1.08 + Math.sin(timeSec * 5) * 0.12 : 1.0;
            ring.scale.set(pulse, pulse, 1);
        });
        // Update glowing GPS breadcrumb trail toward waypoint
        var wp = _arenaRoster.HOOPS_CITY_LOCATIONS.find(function(l) {
            return l.id === _this.waypointId;
        });
        if (wp && Math.hypot(wp.x - this.playerX, wp.z - this.playerZ) > 5.5) {
            for(var i = 0; i < this.gpsDots.length; i++){
                var frac = (i + 0.5 + timeSec * 1.4 % 1) / (this.gpsDots.length + 1);
                var dot = this.gpsDots[i];
                dot.visible = true;
                dot.position.set(_three.MathUtils.lerp(this.playerX, wp.x, frac), 0.11, _three.MathUtils.lerp(this.playerZ, wp.z, frac));
            }
        } else {
            for(var _iterator = _create_for_of_iterator_helper_loose(this.gpsDots), _step; !(_step = _iterator()).done;){
                var dot1 = _step.value;
                dot1.visible = false;
            }
        }
        // Ambient NPCs idle patrol
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.ambientNpcs), _step1; !(_step1 = _iterator1()).done;){
            var npc = _step1.value;
            var nx = npc.baseX + Math.sin(timeSec * 0.6 + npc.phase) * 2.2;
            var nz = npc.baseZ + Math.cos(timeSec * 0.5 + npc.phase) * 2.2;
            npc.rig.group.position.set(nx, 0, nz);
            npc.rig.group.rotation.y = timeSec * 0.5 + npc.phase;
            var s = Math.sin(timeSec * 4.5 + npc.phase) * 0.35;
            npc.rig.legL.rotation.x = s;
            npc.rig.legR.rotation.x = -s;
        }
        // Smooth third-person open-air City camera
        _camGoal.set(this.playerX, 9.6, this.playerZ + 12.8);
        _lookGoal.set(this.playerX, 2.2, this.playerZ - 2.6);
        var alpha = 1 - Math.exp(-6.5 * dt);
        this.three.camera.position.lerp(_camGoal, alpha);
        _lookCur.lerp(_lookGoal, alpha);
        this.three.camera.lookAt(_lookCur);
    };
    _proto.drawLandmarkLabels = function drawLandmarkLabels() {
        var ctx = this.three.overlayCtx;
        if (!ctx) return;
        this.three.clearOverlay();
        var w = this.three.width;
        var h = this.three.height;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for(var _iterator = _create_for_of_iterator_helper_loose(_arenaRoster.HOOPS_CITY_LOCATIONS), _step; !(_step = _iterator()).done;){
            var loc = _step.value;
            var dist = Math.hypot(loc.x - this.playerX, loc.z - this.playerZ);
            if (dist > 46 && loc.id !== this.waypointId) continue;
            var isIndoorArena = loc.kind === 'court' && loc.courtTheme !== 'park' && loc.courtTheme !== 'street_kings';
            _proj.set(loc.x, isIndoorArena ? 8.3 : 5.4, loc.z).project(this.three.camera);
            if (_proj.z < -1 || _proj.z > 1) continue;
            var sx = (_proj.x * 0.5 + 0.5) * w;
            var sy = (-_proj.y * 0.5 + 0.5) * h;
            if (sx < 30 || sx > w - 30 || sy < 56 || sy > h - 30) continue;
            var isNear = loc.id === this.nearbyLocId;
            var isWp = loc.id === this.waypointId;
            var label = loc.icon + " " + loc.shortName;
            ctx.font = isNear ? '900 12px system-ui, sans-serif' : '800 11px system-ui, sans-serif';
            var tw = ctx.measureText(label).width + 18;
            var bh = 22;
            ctx.fillStyle = isNear ? 'rgba(245, 158, 11, 0.94)' : isWp ? 'rgba(14, 165, 233, 0.92)' : 'rgba(11, 16, 27, 0.86)';
            ctx.strokeStyle = isNear ? '#fef08a' : loc.accentHex;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(sx - tw * 0.5, sy - bh * 0.5, tw, bh, 6);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = isNear ? '#0b101b' : '#f8fafc';
            ctx.fillText(label, sx, sy + 0.5);
        }
        ctx.restore();
    };
    _proto.dispose = function dispose() {
        var _this_three;
        this.isRunning = false;
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('resize', this.onResize);
        (_this_three = this.three) == null ? void 0 : _this_three.dispose();
    };
    return HoopsCity3D;
}();

});
// === MODULE: src/games/hoops-2k26/basketballLogic ===
ArcadeMod.define("src/games/hoops-2k26/basketballLogic", function(require, module, exports) {
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
    get CORNER_THREE_Z () {
        return CORNER_THREE_Z;
    },
    get COURT_HALF_LEN () {
        return COURT_HALF_LEN;
    },
    get COURT_HALF_WID () {
        return COURT_HALF_WID;
    },
    get DUNK_RADIUS () {
        return DUNK_RADIUS;
    },
    get HOOP_X () {
        return HOOP_X;
    },
    get OT_DURATION_SEC () {
        return OT_DURATION_SEC;
    },
    get QUARTER_DURATION_SEC () {
        return QUARTER_DURATION_SEC;
    },
    get RIM_Y () {
        return RIM_Y;
    },
    get SHOT_CLOCK_SEC () {
        return SHOT_CLOCK_SEC;
    },
    get TEAMMATE_GRADES () {
        return TEAMMATE_GRADES;
    },
    get THREE_PT_RADIUS () {
        return THREE_PT_RADIUS;
    },
    get canAttemptDunk () {
        return canAttemptDunk;
    },
    get computeShotWindow () {
        return computeShotWindow;
    },
    get computeShotWindowEnhanced () {
        return computeShotWindowEnhanced;
    },
    get evaluateShotRelease () {
        return evaluateShotRelease;
    },
    get getTeammateGradeLabel () {
        return getTeammateGradeLabel;
    },
    get isThreePointLocation () {
        return isThreePointLocation;
    },
    get pickBestPassTargetIndex () {
        return pickBestPassTargetIndex;
    },
    get stepAdrenalineBars () {
        return stepAdrenalineBars;
    },
    get stepMatchClocks () {
        return stepMatchClocks;
    },
    get stepTakeoverMeter () {
        return stepTakeoverMeter;
    },
    get stepTeammateGrade () {
        return stepTeammateGrade;
    }
});
var COURT_HALF_LEN = 22;
var COURT_HALF_WID = 12;
var HOOP_X = 18.8;
var RIM_Y = 3.05;
var THREE_PT_RADIUS = 7.35;
var CORNER_THREE_Z = 9.4;
var DUNK_RADIUS = 3.4;
var QUARTER_DURATION_SEC = 45;
var OT_DURATION_SEC = 25;
var SHOT_CLOCK_SEC = 24;
function isThreePointLocation(x, z, attackingHoopX) {
    var distToHoop = Math.hypot(x - attackingHoopX, z);
    var absZ = Math.abs(z);
    // Pro court has a straight corner-three line near the sideline plus the curved arc
    var pastBackboardTowardHalf = attackingHoopX > 0 ? x < attackingHoopX : x > attackingHoopX;
    if (!pastBackboardTowardHalf) {
        return absZ > CORNER_THREE_Z;
    }
    return distToHoop > THREE_PT_RADIUS || absZ > CORNER_THREE_Z;
}
function canAttemptDunk(x, z, attackingHoopX, sprinting, stamina) {
    var dist = Math.hypot(x - attackingHoopX, z);
    return dist <= DUNK_RADIUS && (sprinting || dist <= 2.15) && stamina >= 0.08;
}
function computeShotWindow(params) {
    var shooterPos = params.shooterPos, hoopX = params.hoopX, defenderDistances = params.defenderDistances, shootRating = params.shootRating, staminaRatio = params.staminaRatio, sprinting = params.sprinting;
    var dist = Math.hypot(shooterPos.x - hoopX, shooterPos.z);
    var points = isThreePointLocation(shooterPos.x, shooterPos.z, hoopX) ? 3 : 2;
    var nearestDef = Infinity;
    for(var i = 0; i < defenderDistances.length; i++){
        if (defenderDistances[i] < nearestDef) nearestDef = defenderDistances[i];
    }
    // Contest penalty: heavy contest within 1.8m, open beyond 4.2m
    var contestPenalty = nearestDef < 1.8 ? 0.34 : nearestDef < 3.0 ? 0.18 : nearestDef < 4.2 ? 0.07 : 0;
    var distFactor = Math.max(0, Math.min(1, 1 - Math.max(0, dist - 2.5) / 16));
    var ratingBonus = (shootRating - 3) * 0.045;
    var fatiguePenalty = staminaRatio < 0.25 ? 0.12 : 0;
    var offDribblePenalty = sprinting && points === 3 ? 0.08 : 0;
    var greenWidth = Math.max(0.075, Math.min(0.18, 0.14 + (shootRating - 3) * 0.015 - contestPenalty * 0.16 - fatiguePenalty * 0.2));
    var greenCenter = 0.84;
    var greenStart = greenCenter - greenWidth * 0.5;
    var greenEnd = greenCenter + greenWidth * 0.5;
    var baseMakeProb = Math.max(0.16, Math.min(0.92, 0.48 + distFactor * 0.26 + ratingBonus - contestPenalty - fatiguePenalty - offDribblePenalty));
    return {
        greenStart: greenStart,
        greenEnd: greenEnd,
        baseMakeProb: baseMakeProb,
        points: points
    };
}
function evaluateShotRelease(meterProgress, greenStart, greenEnd, baseMakeProb, points) {
    var clamped = Math.max(0, Math.min(1, meterProgress));
    if (clamped >= greenStart && clamped <= greenEnd) {
        return {
            quality: 'GREEN',
            isGreen: true,
            makeProb: 1.0,
            points: points
        };
    }
    var distFromGreen = clamped < greenStart ? greenStart - clamped : clamped - greenEnd;
    var quality = distFromGreen <= 0.12 ? 'GREAT' : clamped < greenStart ? 'EARLY' : 'LATE';
    var timingFactor = Math.max(0.15, 1 - distFromGreen * 1.45);
    var makeProb = Math.max(0.08, Math.min(0.95, baseMakeProb * timingFactor));
    return {
        quality: quality,
        isGreen: false,
        makeProb: makeProb,
        points: points
    };
}
function pickBestPassTargetIndex(carrierPos, aimDir, attackingHoopX, carrierIdx, teammates) {
    var aimMag = Math.hypot(aimDir.x, aimDir.z);
    var hasAim = aimMag > 0.2;
    var ax = hasAim ? aimDir.x / aimMag : Math.sign(attackingHoopX - carrierPos.x) || 1;
    var az = hasAim ? aimDir.z / aimMag : 0;
    var bestIdx = -1;
    var bestScore = -Infinity;
    for(var i = 0; i < teammates.length; i++){
        var mate = teammates[i];
        if (mate.index === carrierIdx) continue;
        var dx = mate.x - carrierPos.x;
        var dz = mate.z - carrierPos.z;
        var dist = Math.hypot(dx, dz);
        if (dist < 0.5) continue;
        var dot = dx / dist * ax + dz / dist * az;
        var towardHoop = Math.sign(attackingHoopX - carrierPos.x) * (mate.x - carrierPos.x);
        var idealDistBonus = 1 - Math.min(1, Math.abs(dist - 9.5) / 22);
        var score = (hasAim ? dot * 2.4 : dot * 0.8) + towardHoop * 0.045 + idealDistBonus * 0.6;
        if (score > bestScore) {
            bestScore = score;
            bestIdx = mate.index;
        }
    }
    return bestIdx;
}
function stepMatchClocks(quarter, quarterClock, shotClock, homeScore, awayScore, dt, maxQuarters, quarterDurationSec) {
    if (maxQuarters === void 0) maxQuarters = 4;
    if (quarterDurationSec === void 0) quarterDurationSec = QUARTER_DURATION_SEC;
    var safeDt = Math.max(0, Math.min(0.25, dt));
    var nextQ = quarter;
    var nextQClock = quarterClock - safeDt;
    var nextShotClock = shotClock - safeDt;
    var quarterEnded = false;
    var shotClockViolation = false;
    var matchOver = false;
    if (nextQClock <= 0) {
        quarterEnded = true;
        if (nextQ < maxQuarters) {
            nextQ += 1;
            nextQClock = quarterDurationSec;
            nextShotClock = SHOT_CLOCK_SEC;
        } else if (homeScore === awayScore) {
            // Sudden/short Overtime if tied at end of final period or any OT
            nextQ += 1;
            nextQClock = OT_DURATION_SEC;
            nextShotClock = SHOT_CLOCK_SEC;
        } else {
            nextQClock = 0;
            nextShotClock = 0;
            matchOver = true;
        }
    } else if (nextShotClock <= 0) {
        shotClockViolation = true;
        nextShotClock = SHOT_CLOCK_SEC;
    }
    return {
        quarter: nextQ,
        quarterClock: nextQClock,
        shotClock: Math.min(nextQClock, nextShotClock),
        quarterEnded: quarterEnded,
        shotClockViolation: shotClockViolation,
        matchOver: matchOver
    };
}
function computeShotWindowEnhanced(params) {
    var _params_jumpShotGreenBonus;
    var base = computeShotWindow(params);
    var nearestDef = Infinity;
    for(var i = 0; i < params.defenderDistances.length; i++){
        if (params.defenderDistances[i] < nearestDef) nearestDef = params.defenderDistances[i];
    }
    var coverageLabel = nearestDef >= 4.4 ? 'WIDE OPEN' : nearestDef >= 3.2 ? 'OPEN' : nearestDef >= 2.3 ? 'WEAK' : nearestDef >= 1.5 ? 'STRONG' : 'TIGHT';
    var meterOffBonus = params.jumpShotMeterOff ? 0.036 : 0;
    var jsBonus = Math.max(0, Math.min(0.03, (_params_jumpShotGreenBonus = params.jumpShotGreenBonus) != null ? _params_jumpShotGreenBonus : 0));
    var zoneBonus = params.hotZoneHeat === 'lethal' ? 0.026 : params.hotZoneHeat === 'hot' ? 0.014 : params.hotZoneHeat === 'cold' ? -0.018 : 0;
    var takeoverBonus = params.takeoverActive ? 0.032 : 0;
    var heatCheckBonus = params.heatCheckActive ? 0.045 : 0;
    var skillBoost = params.skillBoostActive ? 0.012 : 0;
    var baseWidth = base.greenEnd - base.greenStart;
    var greenWidth = Math.max(0.065, Math.min(0.28, baseWidth + meterOffBonus + jsBonus + zoneBonus + takeoverBonus + heatCheckBonus + skillBoost));
    var center = 0.84;
    var greenStart = Math.max(0.45, center - greenWidth * 0.5);
    var greenEnd = Math.min(0.985, center + greenWidth * 0.5);
    var probBoost = (params.jumpShotMeterOff ? 0.07 : 0) + (params.takeoverActive ? 0.1 : 0) + (params.heatCheckActive ? 0.12 : 0) + (params.skillBoostActive ? 0.05 : 0) + (params.hotZoneHeat === 'lethal' ? 0.08 : params.hotZoneHeat === 'hot' ? 0.04 : params.hotZoneHeat === 'cold' ? -0.06 : 0);
    return {
        greenStart: greenStart,
        greenEnd: greenEnd,
        greenWidth: greenWidth,
        baseMakeProb: Math.max(0.12, Math.min(0.98, base.baseMakeProb + probBoost)),
        points: base.points,
        coverageLabel: coverageLabel,
        meterOffBoostApplied: Boolean(params.jumpShotMeterOff)
    };
}
var TEAMMATE_GRADES = [
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
function getTeammateGradeLabel(score) {
    var clamped = Math.max(0, Math.min(100, score));
    var idx = Math.min(TEAMMATE_GRADES.length - 1, Math.floor(clamped / 100 * TEAMMATE_GRADES.length));
    return TEAMMATE_GRADES[idx];
}
function stepTeammateGrade(currentScore, event) {
    var deltaMap = {
        good_shot: 5,
        green_make: 8,
        assist: 9,
        rebound: 6,
        steal: 9,
        block: 10,
        good_contest: 4,
        screen_assist: 5,
        turnover: -11,
        bad_shot: -7,
        defensive_breakdown: -6,
        shot_clock_violation: -9
    };
    var delta = deltaMap[event];
    var score = Math.max(0, Math.min(100, currentScore + delta));
    return {
        score: score,
        grade: getTeammateGradeLabel(score),
        delta: delta
    };
}
function stepAdrenalineBars(bars, rechargeTimer, dt, burstTriggered, hasRechargeBooster) {
    if (hasRechargeBooster === void 0) hasRechargeBooster = false;
    var nextBars = Math.max(0, Math.min(3, Math.floor(bars)));
    var nextTimer = Math.max(0, rechargeTimer);
    if (burstTriggered && nextBars > 0) {
        nextBars -= 1;
        nextTimer = 0;
    }
    var rechargeSec = hasRechargeBooster ? 2.4 : 3.8;
    if (nextBars < 3) {
        nextTimer += Math.max(0, dt);
        if (nextTimer >= rechargeSec) {
            nextBars = Math.min(3, nextBars + 1);
            nextTimer = 0;
        }
    } else {
        nextTimer = 0;
    }
    return {
        bars: nextBars,
        rechargeTimer: nextTimer,
        exhausted: nextBars === 0
    };
}
function stepTakeoverMeter(currentMeter, delta) {
    var meter = Math.max(0, Math.min(500, currentMeter + delta));
    var level = Math.min(5, Math.floor(meter / 100));
    return {
        meter: meter,
        level: level,
        readyToIgnite: level >= 5
    };
}

});
// === MODULE: src/games/hoops-2k26/engine/AISystem ===
ArcadeMod.define("src/games/hoops-2k26/engine/AISystem", function(require, module, exports) {
// ============================================================================
// PART 4 — SMART 5v5 / 3v3 / 1v1 AI ENGINE (PLAYVISION, SCHEMES & TENDENCIES)
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
    get DIFFICULTY_PROFILES () {
        return DIFFICULTY_PROFILES;
    },
    get computeDefenseAI () {
        return computeDefenseAI;
    },
    get computeOffenseAI () {
        return computeOffenseAI;
    },
    get getPlayVisionOffenseSpots () {
        return getPlayVisionOffenseSpots;
    }
});
var _courtTypes = require("./courtTypes");
var DIFFICULTY_PROFILES = {
    Rookie: {
        id: 'Rookie',
        aiReactionSec: 0.52,
        aiShotGreenRate: 0.24,
        aiContestCloseoutMul: 0.72,
        aiStealAggroMul: 0.45,
        aiBlockTimingAccuracy: 0.32,
        userGreenWindowMul: 1.32,
        requiresInteractiveFinishPrompts: false
    },
    Pro: {
        id: 'Pro',
        aiReactionSec: 0.36,
        aiShotGreenRate: 0.38,
        aiContestCloseoutMul: 0.88,
        aiStealAggroMul: 0.72,
        aiBlockTimingAccuracy: 0.48,
        userGreenWindowMul: 1.12,
        requiresInteractiveFinishPrompts: true
    },
    'All-Star': {
        id: 'All-Star',
        aiReactionSec: 0.24,
        aiShotGreenRate: 0.5,
        aiContestCloseoutMul: 1.0,
        aiStealAggroMul: 0.95,
        aiBlockTimingAccuracy: 0.62,
        userGreenWindowMul: 1.0,
        requiresInteractiveFinishPrompts: true
    },
    Superstar: {
        id: 'Superstar',
        aiReactionSec: 0.16,
        aiShotGreenRate: 0.62,
        aiContestCloseoutMul: 1.12,
        aiStealAggroMul: 1.15,
        aiBlockTimingAccuracy: 0.74,
        userGreenWindowMul: 0.88,
        requiresInteractiveFinishPrompts: true
    },
    'Hall of Fame': {
        id: 'Hall of Fame',
        aiReactionSec: 0.1,
        aiShotGreenRate: 0.72,
        aiContestCloseoutMul: 1.24,
        aiStealAggroMul: 1.32,
        aiBlockTimingAccuracy: 0.84,
        userGreenWindowMul: 0.78,
        requiresInteractiveFinishPrompts: true
    }
};
function clampCourt(x, z) {
    return {
        x: Math.max(-_courtTypes.COURT_DIMS.HALF_LENGTH + 0.85, Math.min(_courtTypes.COURT_DIMS.HALF_LENGTH - 0.85, x)),
        z: Math.max(-_courtTypes.COURT_DIMS.HALF_WIDTH + 0.7, Math.min(_courtTypes.COURT_DIMS.HALF_WIDTH - 0.7, z))
    };
}
function getPlayVisionOffenseSpots(play, attackDirX, playClockSec, playersPerSide) {
    var d = attackDirX;
    var phase = playClockSec % 8 / 8; // 0..1 continuous motion cycle
    var cutWave = Math.sin(phase * Math.PI * 2);
    var spots;
    switch(play){
        case 'FIVE_OUT':
            spots = [
                {
                    x: d * 4.5,
                    z: 0.0,
                    role: 'HANDLER'
                },
                {
                    x: d * 6.4,
                    z: -5.4,
                    role: 'SHOOTER'
                },
                {
                    x: d * 6.4,
                    z: 5.4,
                    role: 'SHOOTER'
                },
                {
                    x: d * 11.4,
                    z: -6.7,
                    role: 'CORNER'
                },
                {
                    x: d * 11.4,
                    z: 6.7,
                    role: 'CORNER'
                }
            ];
            break;
        case 'MOTION_CUT':
            spots = [
                {
                    x: d * 4.8,
                    z: -0.6,
                    role: 'HANDLER'
                },
                {
                    x: d * (7.2 + Math.max(0, cutWave) * 3.4),
                    z: -5.2 + Math.max(0, cutWave) * 3.5,
                    role: 'CUTTER'
                },
                {
                    x: d * 6.2,
                    z: 5.4,
                    role: 'SHOOTER'
                },
                {
                    x: d * 11.2,
                    z: -6.6,
                    role: 'CORNER'
                },
                {
                    x: d * (9.2 - Math.max(0, -cutWave) * 2.2),
                    z: 2.1 + cutWave * 1.4,
                    role: 'CUTTER'
                }
            ];
            break;
        case 'HORNS':
            spots = [
                {
                    x: d * 4.2,
                    z: 0.0,
                    role: 'HANDLER'
                },
                {
                    x: d * 11.5,
                    z: -6.7,
                    role: 'CORNER'
                },
                {
                    x: d * 11.5,
                    z: 6.7,
                    role: 'CORNER'
                },
                {
                    x: d * 7.4,
                    z: -2.4,
                    role: 'SCREENER'
                },
                {
                    x: d * (7.4 + Math.max(0, cutWave) * 3.6),
                    z: 2.4 - Math.max(0, cutWave) * 1.6,
                    role: 'SCREENER'
                }
            ];
            break;
        case 'FLOPPY':
            spots = [
                {
                    x: d * 4.6,
                    z: 0.0,
                    role: 'HANDLER'
                },
                {
                    x: d * (10.4 - Math.abs(cutWave) * 3.2),
                    z: -1.4 - Math.abs(cutWave) * 4.6,
                    role: 'SHOOTER'
                },
                {
                    x: d * 11.3,
                    z: 6.6,
                    role: 'CORNER'
                },
                {
                    x: d * 9.8,
                    z: -2.6,
                    role: 'SCREENER'
                },
                {
                    x: d * 9.8,
                    z: 2.6,
                    role: 'SCREENER'
                }
            ];
            break;
        case 'PICK_AND_ROLL':
        case 'OFF':
        default:
            spots = [
                {
                    x: d * 4.7,
                    z: -0.4,
                    role: 'HANDLER'
                },
                {
                    x: d * 11.5,
                    z: -6.7,
                    role: 'CORNER'
                },
                {
                    x: d * 6.6,
                    z: 5.5,
                    role: 'SHOOTER'
                },
                {
                    x: d * 11.5,
                    z: 6.7,
                    role: 'CORNER'
                },
                {
                    // Roll man sets screen high then dives to dunker spot
                    x: d * (phase < 0.45 ? 6.2 : 6.2 + (phase - 0.45) / 0.55 * 4.9),
                    z: phase < 0.45 ? -1.4 : -1.4 + (phase - 0.45) / 0.55 * 2.1,
                    role: phase < 0.45 ? 'SCREENER' : 'CUTTER'
                }
            ];
            break;
    }
    return spots.slice(0, Math.max(1, Math.min(5, playersPerSide)));
}
/**
 * Evaluates closest defender distance to a given offensive player.
 */ function findNearestDefender(p, defenders) {
    var nearest = null;
    var best = 999;
    var second = 999;
    for(var i = 0; i < defenders.length; i++){
        var d = defenders[i];
        var dist = Math.hypot(d.x - p.x, d.z - p.z);
        if (dist < best) {
            second = best;
            best = dist;
            nearest = d;
        } else if (dist < second) {
            second = dist;
        }
    }
    return {
        defender: nearest,
        dist: best,
        secondDist: second
    };
}
function computeOffenseAI(params) {
    var _spots_Math_min;
    var player = params.player, teammates = params.teammates, defenders = params.defenders, attackDirX = params.attackDirX, playVision = params.playVision, shotClockSec = params.shotClockSec, playClockSec = params.playClockSec, difficulty = params.difficulty, playersPerSide = params.playersPerSide, canDecideAction = params.canDecideAction, isBlacktopHalfCourt = params.isBlacktopHalfCourt;
    var hoopX = attackDirX * _courtTypes.COURT_DIMS.RIM_X;
    var hoopZ = 0;
    var spots = getPlayVisionOffenseSpots(playVision, attackDirX, playClockSec, playersPerSide);
    var slotSpot = (_spots_Math_min = spots[Math.min(player.slotIndex, spots.length - 1)]) != null ? _spots_Math_min : spots[0];
    // Off-ball movement: space into PlayVision spot, cut backdoor if defender overplays
    if (!player.hasBall) {
        var ballHandler = teammates.find(function(t) {
            return t.hasBall;
        });
        var tx = slotSpot.x;
        var tz = slotSpot.z;
        // If handler is occupying our spot, shift gracefully to opposite wing/corner
        if (ballHandler && Math.hypot(ballHandler.x - tx, ballHandler.z - tz) < 2.4) {
            tz = tz >= 0 ? -Math.min(6.6, Math.abs(tz) + 2.2) : Math.min(6.6, Math.abs(tz) + 2.2);
        }
        // Backdoor cut opportunity when defender is overplaying beyond the 3PT arc
        var nearestDef = findNearestDefender(player, defenders);
        if (slotSpot.role === 'CUTTER' || nearestDef.defender && nearestDef.dist < 1.8 && Math.abs(hoopX - nearestDef.defender.x) > Math.abs(hoopX - player.x) + 0.6) {
            tx = hoopX - attackDirX * 1.9;
            tz = Math.sign(player.z || 1) * 1.4;
        }
        var clamped = clampCourt(tx, tz);
        return {
            targetX: clamped.x,
            targetZ: clamped.z,
            sprint: slotSpot.role === 'CUTTER',
            action: slotSpot.role === 'SCREENER' ? 'SET_SCREEN' : 'MOVE'
        };
    }
    // ---- BALL HANDLER AI ----
    var distToHoop = Math.hypot(hoopX - player.x, hoopZ - player.z);
    var defInfo = findNearestDefender(player, defenders);
    var isDoubleTeamed = defInfo.dist < 2.2 && defInfo.secondDist < 2.7;
    var inFrontCourt = isBlacktopHalfCourt ? true : attackDirX === 1 ? player.x > 0.6 : player.x < -0.6;
    // Bring the ball cleanly across half-court first (prevents 8s backcourt violation)
    if (!inFrontCourt) {
        var advance = clampCourt(attackDirX * 4.4, player.z * 0.45);
        return {
            targetX: advance.x,
            targetZ: advance.z,
            sprint: shotClockSec < 18,
            action: 'MOVE'
        };
    }
    // Evaluate open teammates for kick-outs / alley-oops / Dimer passes
    var bestPassTarget = null;
    var bestPassScore = 0;
    var preferAlleyOop = false;
    for(var i = 0; i < teammates.length; i++){
        var mate = teammates[i];
        if (mate.id === player.id) continue;
        var mateDef = findNearestDefender(mate, defenders);
        var mateDistHoop = Math.hypot(hoopX - mate.x, mate.z);
        var isCornerOrWing3 = mateDistHoop >= _courtTypes.COURT_DIMS.THREE_PT_RADIUS - 0.15 && mateDistHoop <= 8.8;
        var isCuttingRim = mateDistHoop <= 3.1 && mate.profile.attributes.drivingDunk >= 78;
        var score = mateDef.dist * 12;
        if (isCornerOrWing3) {
            score += (mate.profile.attributes.threePt - 60) * 0.9;
        }
        if (isCuttingRim && mateDef.dist > 1.7) {
            score += 36;
        }
        if (score > bestPassScore) {
            bestPassScore = score;
            bestPassTarget = mate;
            preferAlleyOop = isCuttingRim && mateDef.dist > 1.9 && player.profile.attributes.passAccuracy >= 74;
        }
    }
    var diffProfile = DIFFICULTY_PROFILES[difficulty];
    var tend = player.profile.tendencies;
    // Immediate kick-out when double-teamed!
    if (canDecideAction && isDoubleTeamed && bestPassTarget && bestPassScore > 26) {
        return {
            targetX: player.x,
            targetZ: player.z,
            sprint: false,
            action: preferAlleyOop ? 'ALLEY_OOP' : 'PASS',
            passTargetId: bestPassTarget.id
        };
    }
    // Late shot-clock urgency (< 3.5s) -> hoist best available shot immediately
    if (shotClockSec <= 3.2 && distToHoop <= 9.2) {
        return {
            targetX: hoopX,
            targetZ: 0,
            sprint: false,
            action: 'SHOOT'
        };
    }
    if (canDecideAction) {
        // 1. Wide-open 3PT or Mid-Range pull-up scaled by player tendencies
        var isThreeRange = distToHoop >= _courtTypes.COURT_DIMS.THREE_PT_RADIUS - 0.1 && distToHoop <= 8.6;
        var isMidRange = distToHoop >= 4.0 && distToHoop < _courtTypes.COURT_DIMS.THREE_PT_RADIUS - 0.1;
        if (isThreeRange && defInfo.dist >= 2.15 && tend.shoot3 >= 58) {
            var pullProb = (tend.shoot3 - 40) / 70 * (0.65 + diffProfile.aiShotGreenRate * 0.35);
            if (pullProb > 0.35 || shotClockSec < 8) {
                return {
                    targetX: player.x,
                    targetZ: player.z,
                    sprint: false,
                    action: 'SHOOT'
                };
            }
        }
        if (isMidRange && defInfo.dist >= 1.95 && player.profile.attributes.midRange >= 76) {
            return {
                targetX: player.x,
                targetZ: player.z,
                sprint: false,
                action: 'SHOOT'
            };
        }
        // 2. Finish at rim when inside 3.9m
        if (distToHoop <= 3.9) {
            return {
                targetX: hoopX,
                targetZ: 0,
                sprint: true,
                action: 'SHOOT'
            };
        }
        // 3. Pass to wide-open shooter or rim-runner if passFirst tendency or high score
        if (bestPassTarget && bestPassScore > (tend.passFirst >= 72 ? 38 : 54)) {
            return {
                targetX: player.x,
                targetZ: player.z,
                sprint: false,
                action: preferAlleyOop ? 'ALLEY_OOP' : 'PASS',
                passTargetId: bestPassTarget.id
            };
        }
        // 4. Iso dribble move if tightly guarded on the perimeter
        if (defInfo.dist < 1.55 && player.adrenalinePips > 0 && player.profile.attributes.ballHandle >= 75) {
            return {
                targetX: hoopX - attackDirX * 3.0,
                targetZ: player.z + (player.z >= 0 ? -1.8 : 1.8),
                sprint: true,
                action: 'DRIBBLE_MOVE'
            };
        }
    }
    // 5. Drive downhill toward open lane or attack mismatch
    var laneZ = defInfo.defender && Math.abs(defInfo.defender.z - player.z) < 0.9 ? player.z + (player.z >= 0 ? -2.1 : 2.1) : player.z * 0.55;
    var driveTarget = clampCourt(tend.driveRim >= tend.shoot3 ? hoopX - attackDirX * 1.4 : hoopX - attackDirX * 5.2, laneZ);
    return {
        targetX: driveTarget.x,
        targetZ: driveTarget.z,
        sprint: tend.driveRim >= 65 && player.adrenalinePips > 0,
        action: 'DRIVE'
    };
}
// ============================================================================
// DEFENSIVE SCHEMES (MAN, 2-3 ZONE, 3-2 ZONE, FULL PRESS, HALF-COURT TRAP)
// + MARKED ENEMY STAR DIRECTIVES (DOUBLE / DENY / OVER / PACK)
// ============================================================================
function getZoneAnchor(scheme, slotIndex, defendHoopX, ballX, ballZ) {
    var dirFromHoop = defendHoopX > 0 ? -1 : 1; // direction toward midcourt
    var shiftZ = Math.max(-1.6, Math.min(1.6, ballZ * 0.24));
    var shiftX = Math.max(-0.9, Math.min(0.9, (ballX - defendHoopX) * 0.06));
    if (scheme === 'ZONE_2_3') {
        var anchors = [
            {
                x: defendHoopX + dirFromHoop * 6.4,
                z: -2.2
            },
            {
                x: defendHoopX + dirFromHoop * 6.4,
                z: 2.2
            },
            {
                x: defendHoopX + dirFromHoop * 2.5,
                z: -4.4
            },
            {
                x: defendHoopX + dirFromHoop * 2.5,
                z: 4.4
            },
            {
                x: defendHoopX + dirFromHoop * 1.9,
                z: 0.0
            }
        ];
        var base = anchors[slotIndex % anchors.length];
        return clampCourt(base.x + shiftX, base.z + shiftZ);
    }
    // ZONE_3_2
    var anchors1 = [
        {
            x: defendHoopX + dirFromHoop * 7.2,
            z: 0.0
        },
        {
            x: defendHoopX + dirFromHoop * 5.6,
            z: -4.6
        },
        {
            x: defendHoopX + dirFromHoop * 5.6,
            z: 4.6
        },
        {
            x: defendHoopX + dirFromHoop * 2.3,
            z: -2.2
        },
        {
            x: defendHoopX + dirFromHoop * 2.3,
            z: 2.2
        }
    ];
    var base1 = anchors1[slotIndex % anchors1.length];
    return clampCourt(base1.x + shiftX, base1.z + shiftZ);
}
function computeDefenseAI(params) {
    var _ref, _offense_find, _offense_find1;
    var defender = params.defender, teammates = params.teammates, offense = params.offense, ballX = params.ballX, ballZ = params.ballZ, ballHandler = params.ballHandler, ballInFlight = params.ballInFlight, shooterIsRising = params.shooterIsRising, defendHoopX = params.defendHoopX, scheme = params.scheme, markedStarId = params.markedStarId, markedStarTag = params.markedStarTag, difficulty = params.difficulty, cpuDefenseSlider = params.cpuDefenseSlider, cpuSliders = params.cpuSliders, canAttemptEvent = params.canAttemptEvent;
    var diff = DIFFICULTY_PROFILES[difficulty];
    var helpVal = cpuSliders ? cpuSliders.helpDefense : cpuDefenseSlider;
    var contestVal = cpuSliders ? cpuSliders.shotContestImpact : cpuDefenseSlider;
    var blockVal = cpuSliders ? cpuSliders.blockFrequency : cpuDefenseSlider;
    var stealVal = cpuSliders ? cpuSliders.stealSuccess : cpuDefenseSlider;
    var helpMul = 0.72 + helpVal / 100 * 0.56;
    var contestMul = 0.75 + contestVal / 100 * 0.5;
    var blockMul = 0.65 + blockVal / 100 * 0.7;
    var stealMul = 0.65 + stealVal / 100 * 0.7;
    // Matchup by slot index fallback
    var manTarget = (_ref = (_offense_find = offense.find(function(o) {
        return o.id === defender.guardTargetId;
    })) != null ? _offense_find : offense[defender.slotIndex % Math.max(1, offense.length)]) != null ? _ref : offense[0];
    if (!manTarget) {
        return {
            targetX: defendHoopX * 0.6,
            targetZ: 0,
            sprint: false,
            handsUp: false,
            intenseD: false,
            attemptSteal: false,
            attemptBlock: false,
            boxOut: false,
            guardTargetId: null
        };
    }
    // Rebound box-out behavior while ball is in flight
    if (ballInFlight) {
        var dirToBall = Math.atan2(ballZ - defendHoopX * 0, ballX - defendHoopX);
        var boxX = manTarget.x * 0.55 + defendHoopX * 0.45;
        var boxZ = manTarget.z * 0.65;
        var clamped = clampCourt(boxX, boxZ);
        return {
            targetX: clamped.x + Math.cos(dirToBall) * 0.1,
            targetZ: clamped.z,
            sprint: true,
            handsUp: false,
            intenseD: true,
            attemptSteal: false,
            attemptBlock: false,
            boxOut: true,
            guardTargetId: manTarget.id
        };
    }
    // Check Marked Enemy Star DOUBLE-TEAM or HALF_COURT_TRAP
    var markedStar = markedStarId ? (_offense_find1 = offense.find(function(o) {
        return o.id === markedStarId;
    })) != null ? _offense_find1 : null : null;
    var isMarkedTarget = manTarget.id === markedStarId;
    // Determine if this defender should leave their assignment to double-team the marked star
    var shouldDoubleStar = false;
    if (markedStar && markedStar.hasBall && !isMarkedTarget && (markedStarTag === 'DOUBLE' || scheme === 'HALF_COURT_TRAP')) {
        var inFrontHalf = defendHoopX > 0 ? markedStar.x > 0 : markedStar.x < 0;
        if (inFrontHalf) {
            // Pick the single closest non-primary defender to trap
            var closestId = defender.id;
            var bestD = Math.hypot(defender.x - markedStar.x, defender.z - markedStar.z);
            for(var i = 0; i < teammates.length; i++){
                var tm = teammates[i];
                if (tm.guardTargetId === markedStar.id) continue;
                var d = Math.hypot(tm.x - markedStar.x, tm.z - markedStar.z);
                if (d < bestD) {
                    bestD = d;
                    closestId = tm.id;
                }
            }
            shouldDoubleStar = closestId === defender.id && bestD < 8.5;
        }
    }
    var tx = manTarget.x;
    var tz = manTarget.z;
    var sprint = false;
    var intenseD = false;
    if (shouldDoubleStar && markedStar) {
        var dx = defendHoopX - markedStar.x;
        var dz = -markedStar.z;
        var len = Math.max(0.01, Math.hypot(dx, dz));
        tx = markedStar.x + dx / len * 1.05;
        tz = markedStar.z + dz / len * 1.05 + (defender.z >= markedStar.z ? 0.6 : -0.6);
        sprint = true;
        intenseD = true;
    } else if (scheme === 'ZONE_2_3' || scheme === 'ZONE_3_2') {
        var anchor = getZoneAnchor(scheme, defender.slotIndex, defendHoopX, ballX, ballZ);
        // Close out hard if the ball handler enters this defender's zone sector
        if (ballHandler && Math.hypot(ballHandler.x - anchor.x, ballHandler.z - anchor.z) < 3.6) {
            var dx1 = defendHoopX - ballHandler.x;
            var dz1 = -ballHandler.z;
            var len1 = Math.max(0.01, Math.hypot(dx1, dz1));
            tx = ballHandler.x + dx1 / len1 * 1.25;
            tz = ballHandler.z + dz1 / len1 * 1.25;
            intenseD = true;
            sprint = true;
        } else {
            tx = anchor.x;
            tz = anchor.z;
        }
    } else {
        // MAN_TO_MAN, FULL_COURT_PRESS, HALF_COURT_TRAP
        var dx2 = defendHoopX - manTarget.x;
        var dz2 = -manTarget.z;
        var len2 = Math.max(0.01, Math.hypot(dx2, dz2));
        var cushion = manTarget.hasBall ? 1.18 : 1.9;
        if (scheme === 'FULL_COURT_PRESS') {
            cushion = manTarget.hasBall ? 0.92 : 1.15;
            sprint = true;
        }
        // Apply Marked Star tag nuance
        if (isMarkedTarget) {
            if (markedStarTag === 'DENY') {
                cushion = 0.85;
                intenseD = true;
                sprint = true;
            } else if (markedStarTag === 'OVER') {
                cushion = 0.95;
                intenseD = true;
            } else if (markedStarTag === 'PACK') {
                cushion = 2.65; // Sag into the lane to wall off drives
            }
        }
        // Help-side sag when off-ball man is on weak side
        if (!manTarget.hasBall && (!isMarkedTarget || markedStarTag !== 'DENY')) {
            tx = manTarget.x + dx2 / len2 * cushion * 0.72 + (defendHoopX - manTarget.x) * 0.12;
            tz = manTarget.z * 0.82;
        } else {
            tx = manTarget.x + dx2 / len2 * cushion;
            tz = manTarget.z + dz2 / len2 * cushion;
            intenseD = manTarget.hasBall;
        }
        var distToSpot = Math.hypot(tx - defender.x, tz - defender.z);
        if (distToSpot > 2.2) sprint = true;
    }
    var clamped1 = clampCourt(tx, tz);
    var distToHandler = ballHandler ? Math.hypot(defender.x - ballHandler.x, defender.z - ballHandler.z) : 99;
    var handsUp = distToHandler < 2.25 * contestMul;
    var attemptBlock = Boolean(shooterIsRising) && distToHandler < 2.15 * contestMul && canAttemptEvent && diff.aiBlockTimingAccuracy * blockMul > 0.35;
    var attemptSteal = !shooterIsRising && Boolean(ballHandler) && distToHandler < 1.38 * helpMul && canAttemptEvent && defender.profile.tendencies.stealAggro / 100 * diff.aiStealAggroMul * stealMul > 0.62;
    return {
        targetX: clamped1.x,
        targetZ: clamped1.z,
        sprint: sprint,
        handsUp: handsUp,
        intenseD: intenseD,
        attemptSteal: attemptSteal,
        attemptBlock: attemptBlock,
        boxOut: false,
        guardTargetId: manTarget.id
    };
}

});
// === MODULE: src/games/hoops-2k26/engine/BadgeEngine ===
ArcadeMod.define("src/games/hoops-2k26/engine/BadgeEngine", function(require, module, exports) {
// ============================================================================
// PART 4 — 5-TIER BADGE ENGINE (ALL 25 BADGES) & TAKEOVER PROGRESSION (LV 1–5)
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
    get BADGE_TIER_BONUS () {
        return BADGE_TIER_BONUS;
    },
    get BADGE_TIER_COLOR () {
        return BADGE_TIER_COLOR;
    },
    get BADGE_TIER_LABEL () {
        return BADGE_TIER_LABEL;
    },
    get addTakeoverProgress () {
        return addTakeoverProgress;
    },
    get computeTakeoverLevel () {
        return computeTakeoverLevel;
    },
    get createBadgeTriggerEvent () {
        return createBadgeTriggerEvent;
    },
    get createTakeoverState () {
        return createTakeoverState;
    },
    get deriveTakeoverArchetype () {
        return deriveTakeoverArchetype;
    },
    get evaluateAnkleBreaker () {
        return evaluateAnkleBreaker;
    },
    get evaluateFinishingBadges () {
        return evaluateFinishingBadges;
    },
    get evaluateFirstStepLaunch () {
        return evaluateFirstStepLaunch;
    },
    get evaluatePassBadges () {
        return evaluatePassBadges;
    },
    get evaluateReboundBadges () {
        return evaluateReboundBadges;
    },
    get evaluateShootingBadges () {
        return evaluateShootingBadges;
    },
    get evaluateStealAttempt () {
        return evaluateStealAttempt;
    },
    get getBadgeBonus () {
        return getBadgeBonus;
    },
    get getBadgeTier () {
        return getBadgeTier;
    },
    get getEffectiveAttribute () {
        return getEffectiveAttribute;
    },
    get getTakeoverAttributeBoost () {
        return getTakeoverAttributeBoost;
    },
    get igniteTakeover () {
        return igniteTakeover;
    },
    get tickTakeover () {
        return tickTakeover;
    }
});
var _rosterTypes = require("../hybrid/rosterTypes");
var BADGE_TIER_BONUS = {
    BRONZE: 0.04,
    SILVER: 0.08,
    GOLD: 0.12,
    HOF: 0.16,
    LEGEND: 0.22
};
var BADGE_TIER_LABEL = {
    BRONZE: 'Bronze',
    SILVER: 'Silver',
    GOLD: 'Gold',
    HOF: 'Hall of Fame',
    LEGEND: 'Legend'
};
var BADGE_TIER_COLOR = {
    BRONZE: '#cd7f32',
    SILVER: '#cbd5e1',
    GOLD: '#facc15',
    HOF: '#a855f7',
    LEGEND: '#ef4444'
};
var BADGE_META_MAP = function() {
    var m = {};
    for(var i = 0; i < _rosterTypes.BADGE_CATALOG.length; i++){
        var b = _rosterTypes.BADGE_CATALOG[i];
        m[b.id] = {
            name: b.name,
            category: b.category
        };
    }
    return m;
}();
function getBadgeTier(player, badgeId) {
    var _player_badges_badgeId;
    return (_player_badges_badgeId = player.badges[badgeId]) != null ? _player_badges_badgeId : null;
}
function getBadgeBonus(player, badgeId) {
    var tier = getBadgeTier(player, badgeId);
    return tier ? BADGE_TIER_BONUS[tier] : 0;
}
function createBadgeTriggerEvent(player, teamSide, badgeId, tier, seq) {
    var _BADGE_META_MAP_badgeId;
    var meta = (_BADGE_META_MAP_badgeId = BADGE_META_MAP[badgeId]) != null ? _BADGE_META_MAP_badgeId : {
        name: badgeId,
        category: 'SHOOTING'
    };
    return {
        id: "bdg_" + seq + "_" + badgeId + "_" + player.id,
        playerId: player.id,
        playerName: player.name,
        teamSide: teamSide,
        badgeId: badgeId,
        badgeName: meta.name,
        tier: tier,
        category: meta.category,
        boostPct: Math.round(BADGE_TIER_BONUS[tier] * 100),
        timestampMs: Date.now(),
        ttlSec: 2.8
    };
}
function evaluateShootingBadges(ctx, emit) {
    var offenseBonus = 0;
    var contestReduction = 0;
    var defenderContestBoost = 0;
    var triggeredBadges = [];
    var fire = function fire(p, side, id) {
        var tier = getBadgeTier(p, id);
        if (!tier) return 0;
        triggeredBadges.push(id);
        if (emit) emit(p, side, id, tier);
        return BADGE_TIER_BONUS[tier];
    };
    // DEADEYE: mitigates late closeouts & moderate-to-heavy contests
    if (ctx.contestPct >= 14) {
        var b = fire(ctx.shooter, ctx.shooterSide, 'DEADEYE');
        if (b > 0) {
            contestReduction += b * 1.45; // Legend +22% -> reduces contest impact by ~32%
            offenseBonus += b * 0.45;
        }
    }
    // LIMITLESS_RANGE: triggers on deep threes beyond 7.75m (~25.4 ft)
    if (ctx.distMeters >= 7.75) {
        var b1 = fire(ctx.shooter, ctx.shooterSide, 'LIMITLESS_RANGE');
        if (b1 > 0) {
            offenseBonus += b1 * 0.9;
        }
    }
    // SET_SHOT_SPECIALIST: stationary catch-and-shoot jumpers
    if (ctx.isCatchAndShoot && !ctx.isOffDribble) {
        var b2 = fire(ctx.shooter, ctx.shooterSide, 'SET_SHOT_SPECIALIST');
        if (b2 > 0) {
            offenseBonus += b2 * 0.85;
        }
    }
    // SHIFTY_SHOOTER: off-dribble pull-ups, stepbacks, fades
    if (ctx.isOffDribble) {
        var b3 = fire(ctx.shooter, ctx.shooterSide, 'SHIFTY_SHOOTER');
        if (b3 > 0) {
            offenseBonus += b3 * 0.85;
        }
    }
    // MINI_MARKSMAN: shorter shooter (at least 3" shorter) shooting over taller defender
    if (ctx.defender && ctx.defender.heightInches - ctx.shooter.heightInches >= 3 && ctx.contestPct >= 8) {
        var b4 = fire(ctx.shooter, ctx.shooterSide, 'MINI_MARKSMAN');
        if (b4 > 0) {
            offenseBonus += b4 * 0.75;
            contestReduction += b4 * 0.6;
        }
    }
    // DIMER: shooter received pass directly from a teammate with Dimer
    if (ctx.isCatchAndShoot && ctx.passer && ctx.passer.id !== ctx.shooter.id) {
        var b5 = fire(ctx.passer, ctx.shooterSide, 'DIMER');
        if (b5 > 0) {
            offenseBonus += b5 * 0.75;
        }
    }
    // PERIMETER_CHALLENGER: opposing defender contesting perimeter jumper
    if (ctx.defender && ctx.contestPct >= 10 && ctx.distMeters >= 4.2) {
        var b6 = fire(ctx.defender, ctx.defenderSide, 'PERIMETER_CHALLENGER');
        if (b6 > 0) {
            defenderContestBoost += b6;
        }
    }
    return {
        offenseBonus: Math.min(0.5, offenseBonus),
        contestReduction: Math.min(0.55, contestReduction),
        defenderContestBoost: defenderContestBoost,
        triggeredBadges: triggeredBadges
    };
}
function evaluateFinishingBadges(ctx, emit) {
    var finishBonus = 0;
    var dunkMeterBonus = 0;
    var defenderDeterBonus = 0;
    var blockBonus = 0;
    var triggeredBadges = [];
    var fire = function fire(p, side, id) {
        var tier = getBadgeTier(p, id);
        if (!tier) return 0;
        triggeredBadges.push(id);
        if (emit) emit(p, side, id, tier);
        return BADGE_TIER_BONUS[tier];
    };
    if (ctx.moveKind === 'DUNK') {
        var b = fire(ctx.finisher, ctx.finisherSide, 'POSTERIZER');
        if (b > 0) {
            finishBonus += b * 0.9;
            dunkMeterBonus += b * 0.85;
        }
    }
    if (ctx.moveKind === 'ALLEY_OOP' || ctx.moveKind === 'PUTBACK') {
        var b1 = fire(ctx.finisher, ctx.finisherSide, 'AERIAL_WIZARD');
        if (b1 > 0) {
            finishBonus += b1 * 1.0;
            dunkMeterBonus += b1 * 0.9;
        }
    }
    if (ctx.moveKind === 'EURO_STEP' || ctx.moveKind === 'REVERSE_LAYUP') {
        var b2 = fire(ctx.finisher, ctx.finisherSide, 'LAYUP_MIXMASTER');
        if (b2 > 0) {
            finishBonus += b2 * 0.95;
        }
    }
    if (ctx.moveKind === 'FLOATER') {
        var b3 = fire(ctx.finisher, ctx.finisherSide, 'FLOAT_GAME');
        if (b3 > 0) {
            finishBonus += b3 * 1.0;
        }
    }
    if (ctx.hasContact && ctx.moveKind !== 'FLOATER') {
        var b4 = fire(ctx.finisher, ctx.finisherSide, 'PHYSICAL_FINISHER');
        if (b4 > 0) {
            finishBonus += b4 * 0.75;
            dunkMeterBonus += b4 * 0.4;
        }
    }
    if (ctx.defender) {
        var patroller = fire(ctx.defender, ctx.defenderSide, 'PAINT_PATROLLER');
        if (patroller > 0) {
            defenderDeterBonus += patroller;
            blockBonus += patroller * 0.7;
        }
        if (ctx.isChaseDown) {
            var denier = fire(ctx.defender, ctx.defenderSide, 'HIGH_FLYING_DENIER');
            if (denier > 0) {
                blockBonus += denier * 1.0;
            }
        }
    }
    return {
        finishBonus: Math.min(0.45, finishBonus),
        dunkMeterBonus: Math.min(0.35, dunkMeterBonus),
        defenderDeterBonus: defenderDeterBonus,
        blockBonus: blockBonus,
        triggeredBadges: triggeredBadges
    };
}
function evaluateFirstStepLaunch(handler, side, emit) {
    var launchTier = getBadgeTier(handler, 'LIGHTNING_LAUNCH');
    var handlesTier = getBadgeTier(handler, 'HANDLES_FOR_DAYS');
    var speedMultiplier = 1.0;
    var adrenalineDrainMul = 1.0;
    if (launchTier) {
        var b = BADGE_TIER_BONUS[launchTier];
        speedMultiplier += b * 0.9; // up to ~+20% burst
        adrenalineDrainMul -= b * 0.55;
        if (emit) emit(handler, side, 'LIGHTNING_LAUNCH', launchTier);
    }
    if (handlesTier) {
        var b1 = BADGE_TIER_BONUS[handlesTier];
        adrenalineDrainMul -= b1 * 1.1; // up to ~-24% stamina/adrenaline drain
        if (emit) emit(handler, side, 'HANDLES_FOR_DAYS', handlesTier);
    }
    return {
        speedMultiplier: speedMultiplier,
        adrenalineDrainMul: Math.max(0.55, adrenalineDrainMul)
    };
}
function evaluateAnkleBreaker(handler, handlerSide, defender, emit) {
    var tier = getBadgeTier(handler, 'ANKLE_ASSASSIN');
    var baseHandle = (handler.attributes.ballHandle - defender.attributes.perimeterDef) * 0.0045;
    var bonus = 0;
    if (tier) {
        bonus = BADGE_TIER_BONUS[tier] * 1.1;
        if (emit) emit(handler, handlerSide, 'ANKLE_ASSASSIN', tier);
    }
    var stunChance = Math.max(0.04, Math.min(0.48, 0.1 + baseHandle + bonus));
    return {
        stunChance: stunChance,
        triggered: Boolean(tier)
    };
}
function evaluatePassBadges(passer, passerSide, isAlleyOopOrWrap, isOutletBreak, emit) {
    var passSpeedMul = 1.0;
    var accuracyBonus = 0;
    var lobWindowBonus = 0;
    if (isAlleyOopOrWrap) {
        var vv = getBadgeTier(passer, 'VERSATILE_VISIONARY');
        if (vv) {
            var b = BADGE_TIER_BONUS[vv];
            passSpeedMul += b * 0.7;
            accuracyBonus += b;
            lobWindowBonus += b * 0.9;
            if (emit) emit(passer, passerSide, 'VERSATILE_VISIONARY', vv);
        }
    }
    if (isOutletBreak) {
        var bs = getBadgeTier(passer, 'BREAK_STARTER');
        if (bs) {
            var b1 = BADGE_TIER_BONUS[bs];
            passSpeedMul += b1 * 0.85;
            accuracyBonus += b1 * 1.1;
            if (emit) emit(passer, passerSide, 'BREAK_STARTER', bs);
        }
    }
    var dimer = getBadgeTier(passer, 'DIMER');
    if (dimer) {
        accuracyBonus += BADGE_TIER_BONUS[dimer] * 0.5;
    }
    return {
        passSpeedMul: passSpeedMul,
        accuracyBonus: accuracyBonus,
        lobWindowBonus: lobWindowBonus
    };
}
function evaluateStealAttempt(defender, defenderSide, handler, handlerSide, isPassLane, isQuickProtectActive, emit) {
    var defRating = defender.attributes.steal;
    var offRating = handler.attributes.ballHandle;
    var stealChance = 0.14 + (defRating - offRating) * 0.0055;
    var foulChance = 0.18 + Math.max(0, 82 - defRating) * 0.004;
    if (isPassLane) {
        var inter = getBadgeTier(defender, 'INTERCEPTOR');
        if (inter) {
            stealChance += BADGE_TIER_BONUS[inter] * 1.15;
            if (emit) emit(defender, defenderSide, 'INTERCEPTOR', inter);
        }
        foulChance = 0.02;
    } else {
        var glove = getBadgeTier(defender, 'GLOVE');
        if (glove) {
            stealChance += BADGE_TIER_BONUS[glove] * 1.05;
            foulChance -= BADGE_TIER_BONUS[glove] * 0.35;
            if (emit) emit(defender, defenderSide, 'GLOVE', glove);
        }
        var unpluck = getBadgeTier(handler, 'UNPLUCKABLE');
        if (unpluck) {
            stealChance -= BADGE_TIER_BONUS[unpluck] * 1.1;
            foulChance += BADGE_TIER_BONUS[unpluck] * 0.35;
            if (emit) emit(handler, handlerSide, 'UNPLUCKABLE', unpluck);
        }
        // 2K26 Quick Protect hip-shield heavily punishes steal spammers!
        if (isQuickProtectActive) {
            stealChance *= 0.22;
            foulChance = Math.min(0.75, foulChance + 0.36);
        }
    }
    return {
        stealChance: Math.max(0.02, Math.min(0.62, stealChance)),
        foulChance: Math.max(0.02, Math.min(0.78, foulChance))
    };
}
function evaluateReboundBadges(rebounder, rebounderSide, isBoxingOut, isSecondJump, emit) {
    var reachBonusM = 0;
    var scoreBonus = 0;
    var recoveryMul = 1.0;
    var chaser = getBadgeTier(rebounder, 'REBOUND_CHASER');
    if (chaser) {
        var b = BADGE_TIER_BONUS[chaser];
        reachBonusM += b * 2.4; // up to +0.53m snag radius
        scoreBonus += b * 18;
        if (emit) emit(rebounder, rebounderSide, 'REBOUND_CHASER', chaser);
    }
    if (isBoxingOut) {
        var box = getBadgeTier(rebounder, 'BOXOUT_BEAST');
        if (box) {
            var b1 = BADGE_TIER_BONUS[box];
            scoreBonus += b1 * 22;
            if (emit) emit(rebounder, rebounderSide, 'BOXOUT_BEAST', box);
        }
    }
    if (isSecondJump) {
        var pogo = getBadgeTier(rebounder, 'POGO_STICK');
        if (pogo) {
            var b2 = BADGE_TIER_BONUS[pogo];
            recoveryMul -= b2 * 1.5;
            scoreBonus += b2 * 14;
            if (emit) emit(rebounder, rebounderSide, 'POGO_STICK', pogo);
        }
    }
    return {
        reachBonusM: reachBonusM,
        scoreBonus: scoreBonus,
        recoveryMul: Math.max(0.55, recoveryMul)
    };
}
var TAKEOVER_ATTR_MAP = {
    SHARP: [
        'threePt',
        'midRange',
        'freeThrow',
        'closeShot'
    ],
    SLASHER: [
        'drivingDunk',
        'drivingLayup',
        'vertical',
        'speed',
        'acceleration'
    ],
    PLAYMAKER: [
        'ballHandle',
        'passAccuracy',
        'speed',
        'acceleration',
        'threePt'
    ],
    LOCKDOWN: [
        'perimeterDef',
        'interiorDef',
        'steal',
        'block',
        'strength'
    ],
    GLASS: [
        'defReb',
        'offReb',
        'interiorDef',
        'block',
        'strength',
        'closeShot'
    ]
};
var TAKEOVER_PERK_LABELS = {
    SHARP: 'DEEP BOMBER (+10 SHOOT · EXTENDED GREEN)',
    SLASHER: 'POSTER MACHINE (+10 FINISH · CONTACT SLAM)',
    PLAYMAKER: 'ANKLE MAESTRO (+10 PLAY · DIMER + ANKLES)',
    LOCKDOWN: 'CLAMP GOD (+10 DEF · HEAVY CONTEST + STRIP)',
    GLASS: 'GLASS CLEANER (+10 REB · PAINT FORTRESS)'
};
function deriveTakeoverArchetype(profile) {
    var a = profile.attributes;
    var sharp = a.threePt * 0.6 + a.midRange * 0.4;
    var slash = a.drivingDunk * 0.55 + a.drivingLayup * 0.45;
    var play = a.ballHandle * 0.52 + a.passAccuracy * 0.48;
    var lock = a.perimeterDef * 0.55 + a.steal * 0.45;
    var glass = a.defReb * 0.5 + a.interiorDef * 0.25 + a.block * 0.25;
    var ranked = [
        [
            'SHARP',
            sharp
        ],
        [
            'SLASHER',
            slash
        ],
        [
            'PLAYMAKER',
            play
        ],
        [
            'LOCKDOWN',
            lock
        ],
        [
            'GLASS',
            glass
        ]
    ];
    ranked.sort(function(x, y) {
        return y[1] - x[1];
    });
    return ranked[0][0];
}
function createTakeoverState(profile) {
    var archetype = deriveTakeoverArchetype(profile);
    return {
        meter: 0,
        level: 0,
        readyToIgnite: false,
        ignited: false,
        igniteRemainingSec: 0,
        archetype: archetype,
        perkLabel: TAKEOVER_PERK_LABELS[archetype]
    };
}
function computeTakeoverLevel(meter) {
    if (meter >= 100) return 5;
    if (meter >= 80) return 4;
    if (meter >= 60) return 3;
    if (meter >= 40) return 2;
    if (meter >= 20) return 1;
    return 0;
}
function addTakeoverProgress(state, delta) {
    if (state.ignited) {
        // Small positive plays extend remaining flame by up to 2s, cap at 45s
        if (delta > 0) {
            state.igniteRemainingSec = Math.min(45, state.igniteRemainingSec + Math.min(2, delta * 0.08));
        }
        return state;
    }
    state.meter = Math.max(0, Math.min(100, state.meter + delta));
    state.level = computeTakeoverLevel(state.meter);
    state.readyToIgnite = state.level === 5;
    return state;
}
function igniteTakeover(state) {
    if (state.ignited || !state.readyToIgnite) return false;
    state.ignited = true;
    state.readyToIgnite = false;
    state.igniteRemainingSec = 45;
    state.level = 5;
    state.meter = 100;
    return true;
}
function tickTakeover(state, dt) {
    if (state.ignited) {
        state.igniteRemainingSec = Math.max(0, state.igniteRemainingSec - dt);
        state.meter = Math.max(0, state.igniteRemainingSec / 45 * 100);
        if (state.igniteRemainingSec <= 0) {
            state.ignited = false;
            state.readyToIgnite = false;
            state.meter = 0;
            state.level = 0;
        }
    } else if (state.meter > 0) {
        // Gentle cool-down decay (0.45% per second)
        state.meter = Math.max(0, state.meter - dt * 0.45);
        state.level = computeTakeoverLevel(state.meter);
        state.readyToIgnite = state.level === 5;
    }
}
function getTakeoverAttributeBoost(state, attrKey) {
    var boostedKeys = TAKEOVER_ATTR_MAP[state.archetype];
    var isCore = boostedKeys.includes(attrKey);
    if (state.ignited) {
        return isCore ? 10 : 3;
    }
    if (state.level >= 1 && isCore) {
        return Math.min(8, state.level * 2);
    }
    return 0;
}
function getEffectiveAttribute(profile, takeover, attrKey) {
    var base = profile.attributes[attrKey];
    var boost = getTakeoverAttributeBoost(takeover, attrKey);
    return Math.max(25, Math.min(99, base + boost));
}

});

})(window.ArcadeMod);
