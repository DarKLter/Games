(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/nba2k14/engine/arenaBuilder ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/engine/arenaBuilder", function(require, module, exports) {
// ============================================================================
// NBA 2K14 — 5 Distinct Three.js 3D Court Environments Builder
// 1. NBA Regulation Arena (94x50 ft)
// 2. Euroleague FIBA Arena
// 3. NBA Blacktop Street Court (asphalt + chain-link + chain nets)
// 4. The Park Open-Air Plaza
// 5. Practice / Training Camp Gym
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
    get COURT_LENGTH () {
        return COURT_LENGTH;
    },
    get COURT_WIDTH () {
        return COURT_WIDTH;
    },
    get HOOP_X () {
        return HOOP_X;
    },
    get RIM_Y () {
        return RIM_Y;
    },
    get buildArenaEnvironment () {
        return buildArenaEnvironment;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
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
var COURT_LENGTH = 28.65; // 94 ft in meters
var COURT_WIDTH = 15.24; // 50 ft in meters
var HOOP_X = 12.75; // rim centers at +12.75 and -12.75
var RIM_Y = 3.05; // regulation 10 ft
function createCourtSurfaceTexture(env, homeTeam, fibaRules) {
    var canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    var padX = 110;
    var padY = 82;
    var cw = w - padX * 2;
    var ch = h - padY * 2;
    // Apron background
    if (env === 'blacktop' || env === 'park') {
        ctx.fillStyle = env === 'park' ? '#334155' : '#1e242b';
        ctx.fillRect(0, 0, w, h);
        // Asphalt speckle
        for(var i = 0; i < 4500; i++){
            ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.14)';
            ctx.fillRect(Math.random() * w, Math.random() * h, 3, 3);
        }
        ctx.fillStyle = env === 'park' ? '#475569' : '#2a3038';
        ctx.fillRect(padX, padY, cw, ch);
    } else if (env === 'euroleague') {
        ctx.fillStyle = '#0f3b7a';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#d4a36a';
        ctx.fillRect(padX, padY, cw, ch);
    } else if (env === 'practice') {
        ctx.fillStyle = '#475569';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#d8ae78';
        ctx.fillRect(padX, padY, cw, ch);
    } else {
        // NBA Arena Apron with Home Team primary color
        ctx.fillStyle = homeTeam.primaryColor;
        ctx.fillRect(0, 0, w, h);
        // Maple hardwood planks
        ctx.fillStyle = '#d7ab72';
        ctx.fillRect(padX, padY, cw, ch);
    }
    // Procedural Maple Hardwood Planks for indoor courts
    if (env !== 'blacktop' && env !== 'park') {
        var plankRows = 44;
        var rowH = ch / plankRows;
        for(var r = 0; r < plankRows; r++){
            var shade = r * 37 % 13 - 6;
            ctx.fillStyle = "rgba(" + (170 + shade * 4) + ", " + (120 + shade * 3) + ", " + (65 + shade * 2) + ", 0.22)";
            ctx.fillRect(padX, padY + r * rowH, cw, rowH - 1);
            ctx.fillStyle = 'rgba(92, 56, 24, 0.14)';
            ctx.fillRect(padX, padY + r * rowH, cw, 1);
        }
    }
    var lineInk = env === 'blacktop' ? '#facc15' : '#ffffff';
    var paintColor = env === 'euroleague' ? '#ea580c' : env === 'blacktop' ? 'rgba(206,17,65,0.52)' : env === 'park' ? 'rgba(249,160,27,0.48)' : env === 'practice' ? '#1e293b' : homeTeam.primaryColor;
    // Paint Keys (left & right)
    var keyLen = cw * (5.79 / COURT_LENGTH);
    var keyW = ch * (4.88 / COURT_WIDTH);
    var keyTop = padY + (ch - keyW) / 2;
    ctx.fillStyle = paintColor;
    ctx.fillRect(padX, keyTop, keyLen, keyW);
    ctx.fillRect(padX + cw - keyLen, keyTop, keyLen, keyW);
    // Center Court Circle & Team Emblem
    var cx = w / 2;
    var cy = h / 2;
    var centerR = ch * 0.15;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
    ctx.fillStyle = env === 'blacktop' ? '#ce1141' : env === 'park' ? '#0f172a' : homeTeam.primaryColor;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = env === 'blacktop' ? '#facc15' : homeTeam.secondaryColor;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 72px "Oswald", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(env === 'blacktop' ? '2K14' : env === 'park' ? 'PARK' : env === 'practice' ? 'GYM' : homeTeam.code, cx, cy - 6);
    ctx.font = '700 22px "Oswald", sans-serif';
    ctx.fillStyle = homeTeam.secondaryColor;
    ctx.fillText(env === 'blacktop' ? 'BLACKTOP' : env === 'park' ? 'GOT NEXT' : homeTeam.name.toUpperCase(), cx, cy + 42);
    ctx.restore();
    // Baseline Team Wordmarks on Apron
    if (env === 'nba' || env === 'euroleague') {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 44px "Oswald", Impact, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(padX * 0.5, cy);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(homeTeam.fullName.toUpperCase(), 0, 0);
        ctx.restore();
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 44px "Oswald", Impact, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(w - padX * 0.5, cy);
        ctx.rotate(Math.PI / 2);
        ctx.fillText(homeTeam.fullName.toUpperCase(), 0, 0);
        ctx.restore();
    }
    // Court Markings (Sidelines, Half-Court, Keys, Free-Throw Circles, 3PT Arcs, Restricted Arcs)
    ctx.strokeStyle = lineInk;
    ctx.lineWidth = 5;
    ctx.strokeRect(padX, padY, cw, ch);
    // Half-court line
    ctx.beginPath();
    ctx.moveTo(cx, padY);
    ctx.lineTo(cx, padY + ch);
    ctx.stroke();
    // Key outlines & Free-throw circles
    ctx.strokeRect(padX, keyTop, keyLen, keyW);
    ctx.strokeRect(padX + cw - keyLen, keyTop, keyLen, keyW);
    var ftR = keyW * 0.37;
    ctx.beginPath();
    ctx.arc(padX + keyLen, cy, ftR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(padX + cw - keyLen, cy, ftR, 0, Math.PI * 2);
    ctx.stroke();
    // 3-Point Arcs (NBA 7.24m vs FIBA 6.75m)
    var pxPerMeterX = cw / COURT_LENGTH;
    var pxPerMeterY = ch / COURT_WIDTH;
    var hoopOffsetPx = (COURT_LENGTH / 2 - HOOP_X) * pxPerMeterX;
    var arcR = (fibaRules || env === 'euroleague' ? 6.75 : 7.24) * pxPerMeterY;
    var cornerMargin = ch * 0.065;
    // Left 3PT
    ctx.beginPath();
    ctx.moveTo(padX, padY + cornerMargin);
    ctx.lineTo(padX + hoopOffsetPx + arcR * 0.35, padY + cornerMargin);
    ctx.arc(padX + hoopOffsetPx, cy, arcR, -Math.PI * 0.39, Math.PI * 0.39);
    ctx.lineTo(padX, padY + ch - cornerMargin);
    ctx.stroke();
    // Right 3PT
    ctx.beginPath();
    ctx.moveTo(padX + cw, padY + cornerMargin);
    ctx.lineTo(padX + cw - hoopOffsetPx - arcR * 0.35, padY + cornerMargin);
    ctx.arc(padX + cw - hoopOffsetPx, cy, arcR, Math.PI - Math.PI * 0.39, Math.PI + Math.PI * 0.39);
    ctx.lineTo(padX + cw, padY + ch - cornerMargin);
    ctx.stroke();
    // Restricted area arcs
    var restR = 1.25 * pxPerMeterY;
    ctx.beginPath();
    ctx.arc(padX + hoopOffsetPx, cy, restR, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(padX + cw - hoopOffsetPx, cy, restR, Math.PI / 2, Math.PI * 1.5);
    ctx.stroke();
    var tex = new _three.CanvasTexture(canvas);
    tex.colorSpace = _three.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
}
function buildBasketStanchion(side, env, homeTeam, track) {
    var g = new _three.Group();
    var baseSign = side; // +1 at +HOOP_X (right), -1 at -HOOP_X (left)
    var rimPosX = baseSign * HOOP_X;
    var boardX = rimPosX + baseSign * 0.38;
    // Hydraulic Padded Stanchion Base & Boom
    var padMat = track(new _three.MeshStandardMaterial({
        color: env === 'blacktop' || env === 'park' ? '#334155' : homeTeam.primaryColor,
        roughness: 0.45,
        metalness: 0.15
    }));
    var steelMat = track(new _three.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.35,
        metalness: 0.72
    }));
    var baseGeo = track(new _three.BoxGeometry(1.1, 1.8, 0.9));
    var baseMesh = new _three.Mesh(baseGeo, padMat);
    baseMesh.position.set(rimPosX + baseSign * 2.25, 0.9, 0);
    baseMesh.castShadow = true;
    g.add(baseMesh);
    var postGeo = track(new _three.BoxGeometry(0.32, 3.2, 0.32));
    var postMesh = new _three.Mesh(postGeo, steelMat);
    postMesh.position.set(rimPosX + baseSign * 1.95, 2.0, 0);
    g.add(postMesh);
    var armGeo = track(new _three.BoxGeometry(1.65, 0.24, 0.24));
    var armMesh = new _three.Mesh(armGeo, steelMat);
    armMesh.position.set(rimPosX + baseSign * 1.2, 3.32, 0);
    g.add(armMesh);
    // Tempered Glass Backboard
    var boardGeo = track(new _three.BoxGeometry(0.08, 1.08, 1.83));
    var boardMat = track(new _three.MeshPhysicalMaterial({
        color: env === 'blacktop' ? '#cbd5e1' : '#e2f1ff',
        transparent: true,
        opacity: env === 'blacktop' ? 0.85 : 0.42,
        roughness: 0.08,
        metalness: 0.1
    }));
    var boardMesh = new _three.Mesh(boardGeo, boardMat);
    boardMesh.position.set(boardX, RIM_Y + 0.36, 0);
    g.add(boardMesh);
    // Backboard Outer Frame + Red LED Buzzer Strip
    var ledMat = track(new _three.MeshStandardMaterial({
        color: '#f8fafc',
        emissive: '#ef4444',
        emissiveIntensity: 0.15,
        roughness: 0.3
    }));
    var borderGroup = new _three.Mesh(track(new _three.BoxGeometry(0.095, 1.13, 1.89)), ledMat);
    borderGroup.position.set(boardX + baseSign * 0.015, RIM_Y + 0.36, 0);
    // Make wireframe outline feel using thin bars instead of solid block
    g.remove(borderGroup);
    var ledTop = new _three.Mesh(track(new _three.BoxGeometry(0.11, 0.06, 1.89)), ledMat);
    ledTop.position.set(boardX, RIM_Y + 0.91, 0);
    g.add(ledTop);
    var ledBot = new _three.Mesh(track(new _three.BoxGeometry(0.11, 0.06, 1.89)), ledMat);
    ledBot.position.set(boardX, RIM_Y - 0.18, 0);
    g.add(ledBot);
    var ledL = new _three.Mesh(track(new _three.BoxGeometry(0.11, 1.12, 0.06)), ledMat);
    ledL.position.set(boardX, RIM_Y + 0.36, -0.92);
    g.add(ledL);
    var ledR = new _three.Mesh(track(new _three.BoxGeometry(0.11, 1.12, 0.06)), ledMat);
    ledR.position.set(boardX, RIM_Y + 0.36, 0.92);
    g.add(ledR);
    // Shooter's inner square on glass
    var sqMat = track(new _three.MeshBasicMaterial({
        color: '#ffffff'
    }));
    var sqTop = new _three.Mesh(track(new _three.BoxGeometry(0.09, 0.03, 0.6)), sqMat);
    sqTop.position.set(boardX - baseSign * 0.02, RIM_Y + 0.48, 0);
    g.add(sqTop);
    // 24-Second Shot Clock Tower atop Backboard
    if (env === 'nba' || env === 'euroleague') {
        var clockBox = new _three.Mesh(track(new _three.BoxGeometry(0.32, 0.44, 0.66)), track(new _three.MeshStandardMaterial({
            color: '#090a0d',
            roughness: 0.4,
            metalness: 0.6
        })));
        clockBox.position.set(boardX + baseSign * 0.12, RIM_Y + 1.24, 0);
        g.add(clockBox);
        var clockFace = new _three.Mesh(track(new _three.PlaneGeometry(0.56, 0.32)), track(new _three.MeshBasicMaterial({
            color: '#ef4444'
        })));
        clockFace.position.set(boardX + baseSign * 0.12 - baseSign * 0.17, RIM_Y + 1.24, 0);
        clockFace.rotation.y = baseSign > 0 ? -Math.PI / 2 : Math.PI / 2;
        g.add(clockFace);
    }
    // Regulation 10-ft Orange Breakaway Rim
    var rimGeo = track(new _three.TorusGeometry(0.24, 0.022, 10, 24));
    rimGeo.rotateX(Math.PI / 2);
    var rimMat = track(new _three.MeshStandardMaterial({
        color: '#ff5a1f',
        roughness: 0.28,
        metalness: 0.78
    }));
    var rimMesh = new _three.Mesh(rimGeo, rimMat);
    rimMesh.position.set(rimPosX, RIM_Y, 0);
    g.add(rimMesh);
    // Dynamic Ripple Mesh Net (white cotton for indoor, metallic chain for Blacktop/Park)
    var netGeo = track(new _three.CylinderGeometry(0.23, 0.145, 0.46, 14, 4, true));
    var netMat = track(new _three.MeshStandardMaterial({
        color: env === 'blacktop' || env === 'park' ? '#cbd5e1' : '#f8fafc',
        wireframe: true,
        roughness: env === 'blacktop' || env === 'park' ? 0.25 : 0.75,
        metalness: env === 'blacktop' || env === 'park' ? 0.85 : 0.05
    }));
    var netMesh = new _three.Mesh(netGeo, netMat);
    netMesh.position.set(rimPosX, RIM_Y - 0.24, 0);
    g.add(netMesh);
    return {
        group: g,
        refs: {
            rimMesh: rimMesh,
            netMesh: netMesh,
            ledBorderMesh: ledTop,
            rimRestY: RIM_Y,
            rippleEnergy: 0,
            rimFlex: 0
        }
    };
}
function buildArenaEnvironment(env, homeTeam, fibaRules, highCrowdDetail, courtReflections) {
    var group = new _three.Group();
    var disposables = [];
    var track = function track(d) {
        disposables.push(d);
        return d;
    };
    // Court Floor Plane with Procedural Texture
    var courtTex = track(createCourtSurfaceTexture(env, homeTeam, fibaRules));
    var floorGeo = track(new _three.PlaneGeometry(COURT_LENGTH + 4.2, COURT_WIDTH + 3.4));
    floorGeo.rotateX(-Math.PI / 2);
    var floorMat = track(new _three.MeshStandardMaterial({
        map: courtTex,
        roughness: env === 'blacktop' || env === 'park' ? 0.84 : courtReflections ? 0.22 : 0.45,
        metalness: env === 'blacktop' || env === 'park' ? 0.04 : courtReflections ? 0.12 : 0.04
    }));
    var floorMesh = new _three.Mesh(floorGeo, floorMat);
    floorMesh.receiveShadow = true;
    group.add(floorMesh);
    // Outer Stadium Concrete / Floor Skirt
    var outerGeo = track(new _three.PlaneGeometry(92, 64));
    outerGeo.rotateX(-Math.PI / 2);
    var outerMat = track(new _three.MeshStandardMaterial({
        color: env === 'blacktop' ? '#141920' : env === 'park' ? '#1e293b' : '#090b10',
        roughness: 0.9
    }));
    var outerFloor = new _three.Mesh(outerGeo, outerMat);
    outerFloor.position.y = -0.02;
    group.add(outerFloor);
    // Left & Right Regulation Stanchions
    var leftBasket = buildBasketStanchion(-1, env, homeTeam, track);
    var rightBasket = buildBasketStanchion(1, env, homeTeam, track);
    group.add(leftBasket.group, rightBasket.group);
    var crowdMesh = null;
    var crowdBaseY = new Float32Array(0);
    var cameraFlashes = [];
    if (env === 'nba' || env === 'euroleague') {
        // Multi-tier Arena Seating Bowls
        var bowlMat = track(new _three.MeshStandardMaterial({
            color: '#11141c',
            roughness: 0.85
        }));
        var ribbonMat = track(new _three.MeshStandardMaterial({
            color: homeTeam.primaryColor,
            emissive: homeTeam.primaryColor,
            emissiveIntensity: 0.65,
            roughness: 0.35
        }));
        var buildStand = function buildStand(px, pz, rotY, width) {
            var stand = new _three.Group();
            stand.position.set(px, 0, pz);
            stand.rotation.y = rotY;
            for(var tier = 0; tier < 5; tier++){
                var step = new _three.Mesh(track(new _three.BoxGeometry(width, 0.72, 1.5)), bowlMat);
                step.position.set(0, 0.4 + tier * 0.72, tier * 1.45);
                stand.add(step);
            }
            // Glowing Ribbon LED Board
            var led = new _three.Mesh(track(new _three.BoxGeometry(width, 0.45, 0.16)), ribbonMat);
            led.position.set(0, 4.15, 6.2);
            stand.add(led);
            group.add(stand);
        };
        buildStand(0, -11.4, Math.PI, 36);
        buildStand(0, 11.4, 0, 36);
        buildStand(-19.2, 0, -Math.PI / 2, 24);
        buildStand(19.2, 0, Math.PI / 2, 24);
        // Scorer's Table & Team Benches
        var tableMesh = new _three.Mesh(track(new _three.BoxGeometry(8.5, 0.85, 0.9)), track(new _three.MeshStandardMaterial({
            color: '#0f172a',
            emissive: homeTeam.primaryColor,
            emissiveIntensity: 0.35
        })));
        tableMesh.position.set(0, 0.42, -9.2);
        group.add(tableMesh);
        [
            -8.5,
            8.5
        ].forEach(function(bx) {
            var bench = new _three.Mesh(track(new _three.BoxGeometry(5.6, 0.5, 0.7)), track(new _three.MeshStandardMaterial({
                color: '#1e293b',
                roughness: 0.6
            })));
            bench.position.set(bx, 0.25, -9.3);
            group.add(bench);
        });
        // Overhead Center-Hung Jumbotron Scoreboard
        var jumbo = new _three.Group();
        jumbo.position.set(0, 11.2, 0);
        var jumboBody = new _three.Mesh(track(new _three.BoxGeometry(5.2, 2.4, 3.8)), track(new _three.MeshStandardMaterial({
            color: '#0b0d12',
            roughness: 0.3,
            metalness: 0.7
        })));
        jumbo.add(jumboBody);
        var jumboScreenMat = track(new _three.MeshStandardMaterial({
            color: homeTeam.secondaryColor,
            emissive: homeTeam.primaryColor,
            emissiveIntensity: 0.9
        }));
        var jumboScreen = new _three.Mesh(track(new _three.BoxGeometry(5.32, 1.5, 3.92)), jumboScreenMat);
        jumbo.add(jumboScreen);
        group.add(jumbo);
        // Instanced Animated Crowd Spectators
        var count = highCrowdDetail ? 360 : 140;
        var fanGeo = track(new _three.CapsuleGeometry(0.22, 0.42, 3, 6));
        var fanMat = track(new _three.MeshStandardMaterial({
            color: '#ffffff',
            roughness: 0.75
        }));
        crowdMesh = new _three.InstancedMesh(fanGeo, fanMat, count);
        crowdBaseY = new Float32Array(count);
        var dummy = new _three.Object3D();
        var color = new _three.Color();
        var palette = [
            homeTeam.primaryColor,
            homeTeam.secondaryColor,
            '#e2e8f0',
            '#334155',
            '#f59e0b'
        ];
        for(var i = 0; i < count; i++){
            var sideIdx = i % 4;
            var tier = Math.floor(i / 4) % 5;
            var spread = i * 73 % 100 / 100 - 0.5;
            var fx = 0;
            var fz = 0;
            if (sideIdx === 0) {
                fx = spread * 32;
                fz = -11.5 - tier * 1.45;
            } else if (sideIdx === 1) {
                fx = spread * 32;
                fz = 11.5 + tier * 1.45;
            } else if (sideIdx === 2) {
                fx = -19.2 - tier * 1.45;
                fz = spread * 20;
            } else {
                fx = 19.2 + tier * 1.45;
                fz = spread * 20;
            }
            var fy = 1.05 + tier * 0.72;
            crowdBaseY[i] = fy;
            dummy.position.set(fx, fy, fz);
            dummy.scale.set(1, 0.9 + i * 19 % 25 / 100, 1);
            dummy.updateMatrix();
            crowdMesh.setMatrixAt(i, dummy.matrix);
            color.set(palette[i % palette.length]);
            crowdMesh.setColorAt(i, color);
        }
        crowdMesh.instanceMatrix.needsUpdate = true;
        if (crowdMesh.instanceColor) crowdMesh.instanceColor.needsUpdate = true;
        group.add(crowdMesh);
        // Periodic Stadium Camera Flashes
        for(var f = 0; f < 3; f++){
            var fl = new _three.PointLight('#ffffff', 0, 18);
            fl.position.set((f - 1) * 11, 5.5, -13);
            group.add(fl);
            cameraFlashes.push(fl);
        }
    } else if (env === 'blacktop' || env === 'park') {
        // Chain-link Perimeter Fence & Urban Skyline Silhouettes
        var fenceMat = track(new _three.MeshStandardMaterial({
            color: '#94a3b8',
            wireframe: true,
            roughness: 0.4,
            metalness: 0.7
        }));
        var fenceBack = new _three.Mesh(track(new _three.PlaneGeometry(36, 4.2, 24, 6)), fenceMat);
        fenceBack.position.set(0, 2.1, -10.5);
        group.add(fenceBack);
        var bldgMat = track(new _three.MeshStandardMaterial({
            color: '#111827',
            roughness: 0.85
        }));
        var winMat = track(new _three.MeshStandardMaterial({
            color: '#fbbf24',
            emissive: '#f59e0b',
            emissiveIntensity: 0.65
        }));
        for(var i1 = 0; i1 < 12; i1++){
            var bw = 3 + i1 % 3 * 1.4;
            var bh = 8 + i1 * 7 % 14;
            var b = new _three.Mesh(track(new _three.BoxGeometry(bw, bh, 3.6)), bldgMat);
            b.position.set(-24 + i1 * 4.5, bh / 2, -19 - i1 % 3 * 3);
            group.add(b);
            if (i1 % 2 === 0) {
                var wStrip = new _three.Mesh(track(new _three.BoxGeometry(bw * 0.6, 0.35, 3.7)), winMat);
                wStrip.position.set(b.position.x, bh * 0.65, b.position.z);
                group.add(wStrip);
            }
        }
        // Floodlight Poles
        [
            -14,
            14
        ].forEach(function(px) {
            var pole = new _three.Mesh(track(new _three.CylinderGeometry(0.14, 0.18, 9.5, 8)), track(new _three.MeshStandardMaterial({
                color: '#334155',
                metalness: 0.7
            })));
            pole.position.set(px, 4.75, -10.6);
            group.add(pole);
            var lamp = new _three.Mesh(track(new _three.BoxGeometry(1.5, 0.42, 0.35)), track(new _three.MeshBasicMaterial({
                color: '#fff7ed'
            })));
            lamp.position.set(px, 9.6, -10.4);
            group.add(lamp);
        });
    } else {
        // Practice Gym Walls, Banners & Ball Rack
        var wallMat = track(new _three.MeshStandardMaterial({
            color: '#1e293b',
            roughness: 0.8
        }));
        var backWall = new _three.Mesh(track(new _three.BoxGeometry(40, 10, 0.5)), wallMat);
        backWall.position.set(0, 5, -11.5);
        group.add(backWall);
        [
            homeTeam.primaryColor,
            homeTeam.secondaryColor,
            '#ce1141'
        ].forEach(function(col, i) {
            var banner = new _three.Mesh(track(new _three.BoxGeometry(2.2, 3.6, 0.1)), track(new _three.MeshStandardMaterial({
                color: col,
                roughness: 0.5
            })));
            banner.position.set(-6 + i * 6, 6.8, -11.15);
            group.add(banner);
        });
    }
    // PlayVision 3D Floor Art Group
    var playVisionGroup = new _three.Group();
    playVisionGroup.position.y = 0.032;
    group.add(playVisionGroup);
    var playArrowMat = track(new _three.MeshBasicMaterial({
        color: '#ce1141',
        transparent: true,
        opacity: 0.72,
        side: _three.DoubleSide
    }));
    var playScreenMat = track(new _three.MeshBasicMaterial({
        color: '#38bdf8',
        transparent: true,
        opacity: 0.76,
        side: _three.DoubleSide
    }));
    var cutBar = new _three.Mesh(track(new _three.PlaneGeometry(4.8, 0.24)), playArrowMat);
    cutBar.rotation.x = -Math.PI / 2;
    cutBar.position.set(7.5, 0, -2.6);
    cutBar.rotation.z = 0.35;
    playVisionGroup.add(cutBar);
    var screenBar = new _three.Mesh(track(new _three.PlaneGeometry(1.6, 0.28)), playScreenMat);
    screenBar.rotation.x = -Math.PI / 2;
    screenBar.position.set(6.4, 0, 1.4);
    playVisionGroup.add(screenBar);
    var spotRing = new _three.Mesh(track(new _three.RingGeometry(0.65, 0.85, 24)), playArrowMat);
    spotRing.rotation.x = -Math.PI / 2;
    spotRing.position.set(9.4, 0, 4.6);
    playVisionGroup.add(spotRing);
    playVisionGroup.visible = false;
    var dummyCrowd = new _three.Object3D();
    var matArr = new _three.Matrix4();
    var posVec = new _three.Vector3();
    var quat = new _three.Quaternion();
    var scaleVec = new _three.Vector3();
    return {
        group: group,
        hoops: {
            home: leftBasket.refs,
            away: rightBasket.refs
        },
        crowdMesh: crowdMesh,
        crowdBaseY: crowdBaseY,
        cameraFlashes: cameraFlashes,
        playVisionGroup: playVisionGroup,
        updateArena: function updateArena(dt, elapsed, crowdExcitement, buzzerFlash) {
            // Animate nets & rim breakaway springback
            [
                leftBasket.refs,
                rightBasket.refs
            ].forEach(function(h) {
                if (h.rippleEnergy > 0.001) {
                    h.rippleEnergy = Math.max(0, h.rippleEnergy - dt * 2.2);
                    var s = 1 + Math.sin(elapsed * 32) * h.rippleEnergy * 0.24;
                    h.netMesh.scale.set(s, 1 + h.rippleEnergy * 0.16, s);
                    h.netMesh.rotation.y += dt * 4 * h.rippleEnergy;
                } else {
                    h.netMesh.scale.set(1, 1, 1);
                }
                if (h.rimFlex > 0.001) {
                    h.rimFlex = Math.max(0, h.rimFlex - dt * 3.8);
                    h.rimMesh.position.y = h.rimRestY - Math.sin(h.rimFlex * Math.PI) * 0.12;
                } else {
                    h.rimMesh.position.y = h.rimRestY;
                }
                var ledM = h.ledBorderMesh.material;
                ledM.emissiveIntensity = buzzerFlash ? 2.6 : 0.12;
            });
            // Animate crowd excitement bounce
            if (crowdMesh) {
                var amp = 0.04 + crowdExcitement * 0.28;
                var speed = 3.5 + crowdExcitement * 7;
                for(var i = 0; i < crowdMesh.count; i++){
                    crowdMesh.getMatrixAt(i, matArr);
                    matArr.decompose(posVec, quat, scaleVec);
                    posVec.y = crowdBaseY[i] + Math.max(0, Math.sin(elapsed * speed + i * 0.7)) * amp;
                    dummyCrowd.position.copy(posVec);
                    dummyCrowd.quaternion.copy(quat);
                    dummyCrowd.scale.copy(scaleVec);
                    dummyCrowd.updateMatrix();
                    crowdMesh.setMatrixAt(i, dummyCrowd.matrix);
                }
                crowdMesh.instanceMatrix.needsUpdate = true;
            }
            // Periodic stadium camera flashes
            cameraFlashes.forEach(function(fl, idx) {
                var pulse = Math.sin(elapsed * (3.7 + idx * 1.9) + idx * 2.1);
                fl.intensity = pulse > 0.965 ? 9.0 : 0;
            });
        },
        triggerSwish: function triggerSwish(targetSide, isDunk) {
            var h = targetSide === 'away' ? rightBasket.refs : leftBasket.refs;
            h.rippleEnergy = isDunk ? 1.4 : 1.0;
            if (isDunk) h.rimFlex = 1.0;
        },
        setPlayVision: function setPlayVision(activePlay, attackDir, enabled) {
            if (!enabled || activePlay === 'None') {
                playVisionGroup.visible = false;
                return;
            }
            playVisionGroup.visible = true;
            playVisionGroup.scale.x = attackDir;
        },
        dispose: function dispose() {
            disposables.forEach(function(d) {
                return d.dispose();
            });
        }
    };
}

});
// === MODULE: src/games/hoops-2k26/part7/CustomHudEditor ===
ArcadeMod.define("src/games/hoops-2k26/part7/CustomHudEditor", function(require, module, exports) {
// ============================================================================
// PART 7 — LIVE DRAG-AND-DROP CUSTOM TOUCH HUD EDITOR
// - Full-screen overlay over the live 3D court (or 3D Menu arena preview)
// - All 14 movable touch controls: Left Joystick, Shoot/Pro-Stick, Pass,
//   Dribble/Protect, Screen, Icon Pass, Alley-Oop, Takeover, Block/Reb,
//   Steal, Switch, Intense-D, Tactics, Mini Radar
// - Drag with mouse or touch, tap to select, tune Scale (50%–150%) & Opacity (20%–100%)
// - 3 Layout Presets (Classic 2K, Claw Pro, Compact One-Hand) + Reset + Save & Exit
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
    get CustomHudEditor () {
        return CustomHudEditor;
    },
    get HUD_EDITOR_NODES () {
        return HUD_EDITOR_NODES;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _store = require("../hybrid/store");
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
var HUD_EDITOR_NODES = [
    {
        key: 'left_stick',
        label: 'MOVE',
        sub: 'L-STICK',
        baseLeftPct: 12,
        baseTopPct: 72,
        width: 92,
        height: 92,
        shape: 'circle',
        accent: '#38bdf8'
    },
    {
        key: 'shoot_pad',
        label: 'SHOOT',
        sub: 'PRO-STICK',
        baseLeftPct: 86,
        baseTopPct: 72,
        width: 88,
        height: 88,
        shape: 'circle',
        accent: '#ef4444'
    },
    {
        key: 'pass_btn',
        label: 'PASS',
        sub: 'CHEST/BNC',
        baseLeftPct: 74,
        baseTopPct: 82,
        width: 64,
        height: 64,
        shape: 'circle',
        accent: '#22c55e'
    },
    {
        key: 'dribble_btn',
        label: 'DRIBBLE',
        sub: 'PROTECT',
        baseLeftPct: 73,
        baseTopPct: 62,
        width: 62,
        height: 62,
        shape: 'circle',
        accent: '#f59e0b'
    },
    {
        key: 'screen_btn',
        label: 'SCREEN',
        sub: 'PNR',
        baseLeftPct: 86,
        baseTopPct: 48,
        width: 58,
        height: 58,
        shape: 'circle',
        accent: '#a855f7'
    },
    {
        key: 'icon_btn',
        label: 'ICON',
        sub: 'PASS',
        baseLeftPct: 63,
        baseTopPct: 73,
        width: 54,
        height: 54,
        shape: 'circle',
        accent: '#06b6d4'
    },
    {
        key: 'oop_btn',
        label: 'ALLEY',
        sub: 'OOP',
        baseLeftPct: 74,
        baseTopPct: 44,
        width: 54,
        height: 54,
        shape: 'circle',
        accent: '#f97316'
    },
    {
        key: 'takeover_btn',
        label: 'TAKE',
        sub: 'OVER',
        baseLeftPct: 62,
        baseTopPct: 54,
        width: 56,
        height: 56,
        shape: 'circle',
        accent: '#facc15'
    },
    {
        key: 'block_btn',
        label: 'BLK/REB',
        sub: 'DEF',
        baseLeftPct: 88,
        baseTopPct: 28,
        width: 58,
        height: 58,
        shape: 'circle',
        accent: '#3b82f6'
    },
    {
        key: 'steal_btn',
        label: 'STEAL',
        sub: 'DEF',
        baseLeftPct: 78,
        baseTopPct: 28,
        width: 56,
        height: 56,
        shape: 'circle',
        accent: '#ec4899'
    },
    {
        key: 'switch_btn',
        label: 'SWITCH',
        sub: 'DEF',
        baseLeftPct: 68,
        baseTopPct: 28,
        width: 56,
        height: 56,
        shape: 'circle',
        accent: '#14b8a6'
    },
    {
        key: 'intense_btn',
        label: 'INTENSE',
        sub: 'CLAMPS',
        baseLeftPct: 58,
        baseTopPct: 28,
        width: 58,
        height: 58,
        shape: 'circle',
        accent: '#8b5cf6'
    },
    {
        key: 'tactics_btn',
        label: 'TACTICS',
        sub: 'D-PAD',
        baseLeftPct: 14,
        baseTopPct: 24,
        width: 88,
        height: 42,
        shape: 'rect',
        accent: '#f59e0b'
    },
    {
        key: 'radar_panel',
        label: 'MINI RADAR',
        sub: 'COURT MAP',
        baseLeftPct: 50,
        baseTopPct: 16,
        width: 112,
        height: 54,
        shape: 'rect',
        accent: '#38bdf8'
    }
];
function cloneLayout(src) {
    var base = (0, _store.createDefaultCustomHudLayout)();
    var out = _extends({}, base);
    var keys = Object.keys(src || {});
    for(var i = 0; i < keys.length; i++){
        var k = keys[i];
        if (src[k]) {
            out[k] = {
                x: Number.isFinite(src[k].x) ? src[k].x : 0,
                y: Number.isFinite(src[k].y) ? src[k].y : 0,
                scale: Number.isFinite(src[k].scale) ? Math.max(0.5, Math.min(1.5, src[k].scale)) : 1,
                opacity: Number.isFinite(src[k].opacity) ? Math.max(0.2, Math.min(1, src[k].opacity)) : 0.92
            };
        }
    }
    return out;
}
var CustomHudEditor = function CustomHudEditor(param) {
    var uiEraMode = param.uiEraMode, initialLayout = param.initialLayout, _param_liveCourtBackdrop = param.liveCourtBackdrop, liveCourtBackdrop = _param_liveCourtBackdrop === void 0 ? true : _param_liveCourtBackdrop, onSaveAndExit = param.onSaveAndExit, onCancel = param.onCancel;
    var _HUD_EDITOR_NODES_find, _draft_selectedKey;
    var _useState = (0, _react.useState)(function() {
        return cloneLayout(initialLayout);
    }), draft = _useState[0], setDraft = _useState[1];
    var _useState1 = (0, _react.useState)('shoot_pad'), selectedKey = _useState1[0], setSelectedKey = _useState1[1];
    var _useState2 = (0, _react.useState)(null), activePreset = _useState2[0], setActivePreset = _useState2[1];
    var _useState3 = (0, _react.useState)(true), showGrid = _useState3[0], setShowGrid = _useState3[1];
    var dragRef = (0, _react.useRef)(null);
    (0, _react.useEffect)(function() {
        var handleMove = function handleMove(clientX, clientY) {
            var d = dragRef.current;
            if (!d) return;
            var dx = Math.round(clientX - d.startClientX);
            var dy = Math.round(clientY - d.startClientY);
            var nextX = Math.max(-260, Math.min(260, d.origX + dx));
            var nextY = Math.max(-260, Math.min(260, d.origY + dy));
            setDraft(function(prev) {
                var _prev_d_key;
                var _obj;
                return _extends({}, prev, (_obj = {}, _obj[d.key] = _extends({}, (_prev_d_key = prev[d.key]) != null ? _prev_d_key : {
                    x: 0,
                    y: 0,
                    scale: 1,
                    opacity: 0.92
                }, {
                    x: nextX,
                    y: nextY
                }), _obj));
            });
        };
        var onMouseMove = function onMouseMove(e) {
            return handleMove(e.clientX, e.clientY);
        };
        var onTouchMove = function onTouchMove(e) {
            if (!dragRef.current || e.touches.length === 0) return;
            e.preventDefault();
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
        };
        var onEnd = function onEnd() {
            dragRef.current = null;
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onEnd);
        window.addEventListener('touchmove', onTouchMove, {
            passive: false
        });
        window.addEventListener('touchend', onEnd);
        window.addEventListener('touchcancel', onEnd);
        return function() {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onEnd);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onEnd);
            window.removeEventListener('touchcancel', onEnd);
        };
    }, []);
    var startDrag = function startDrag(key, clientX, clientY) {
        var _draft_key;
        setSelectedKey(key);
        setActivePreset(null);
        var rect = (_draft_key = draft[key]) != null ? _draft_key : {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.92
        };
        dragRef.current = {
            key: key,
            startClientX: clientX,
            startClientY: clientY,
            origX: rect.x,
            origY: rect.y
        };
    };
    var selectedMeta = (_HUD_EDITOR_NODES_find = HUD_EDITOR_NODES.find(function(n) {
        return n.key === selectedKey;
    })) != null ? _HUD_EDITOR_NODES_find : HUD_EDITOR_NODES[0];
    var selectedRect = (_draft_selectedKey = draft[selectedKey]) != null ? _draft_selectedKey : {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 0.92
    };
    var updateSelected = function updateSelected(patch) {
        setActivePreset(null);
        setDraft(function(prev) {
            var _prev_selectedKey;
            var _obj;
            return _extends({}, prev, (_obj = {}, _obj[selectedKey] = _extends({}, (_prev_selectedKey = prev[selectedKey]) != null ? _prev_selectedKey : {
                x: 0,
                y: 0,
                scale: 1,
                opacity: 0.92
            }, patch), _obj));
        });
    };
    var applyPreset = function applyPreset(preset) {
        setActivePreset(preset);
        setDraft((0, _store.createPresetCustomHudLayout)(preset));
    };
    var eraClass = uiEraMode === '2K14_CLASSIC' ? 'p7-era-2k14' : 'p7-era-2k26';
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "p7-hud-editor-root " + eraClass + " " + (liveCourtBackdrop ? 'p7-hud-live-bg' : ''),
        onClick: function onClick(e) {
            return e.stopPropagation();
        },
        children: [
            showGrid && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "p7-hud-editor-grid",
                "aria-hidden": "true",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "p7-hud-grid-midline"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "p7-hud-grid-circle"
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                className: "p7-hud-editor-topbar",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                className: "p7-hud-editor-title",
                                children: "Custom Touch HUD Editor"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "p7-muted",
                                style: {
                                    marginLeft: 10
                                },
                                children: "Drag any of the 14 controls over the live 3D court \xb7 Tap to resize or adjust opacity"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p7-hud-editor-actions",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "p7-btn " + (showGrid ? 'active' : ''),
                                onClick: function onClick() {
                                    return setShowGrid(function(v) {
                                        return !v;
                                    });
                                },
                                children: showGrid ? 'Grid: On' : 'Grid: Off'
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "p7-btn",
                                onClick: function onClick() {
                                    setActivePreset('CLASSIC_2K');
                                    setDraft((0, _store.createDefaultCustomHudLayout)());
                                },
                                children: "Reset Default"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "p7-btn",
                                onClick: onCancel,
                                children: "Cancel"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "p7-btn primary",
                                onClick: function onClick() {
                                    return onSaveAndExit(draft);
                                },
                                children: "Save & Exit"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "p7-hud-editor-stage",
                children: HUD_EDITOR_NODES.map(function(node) {
                    var _draft_node_key;
                    var rect = (_draft_node_key = draft[node.key]) != null ? _draft_node_key : {
                        x: 0,
                        y: 0,
                        scale: 1,
                        opacity: 0.92
                    };
                    var isSelected = selectedKey === node.key;
                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        role: "button",
                        tabIndex: 0,
                        "aria-label": "Move " + node.label + " touch control",
                        className: "p7-hud-node " + node.shape + " " + (isSelected ? 'selected' : ''),
                        style: {
                            left: "" + node.baseLeftPct + "%",
                            top: "" + node.baseTopPct + "%",
                            width: node.width,
                            height: node.height,
                            borderColor: isSelected ? '#ffffff' : node.accent,
                            opacity: rect.opacity,
                            transform: "translate(-50%, -50%) translate(" + rect.x + "px, " + rect.y + "px) scale(" + rect.scale + ")"
                        },
                        onMouseDown: function onMouseDown(e) {
                            e.preventDefault();
                            startDrag(node.key, e.clientX, e.clientY);
                        },
                        onTouchStart: function onTouchStart(e) {
                            if (e.touches.length === 0) return;
                            e.stopPropagation();
                            startDrag(node.key, e.touches[0].clientX, e.touches[0].clientY);
                        },
                        onClick: function onClick() {
                            return setSelectedKey(node.key);
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                children: node.label
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                children: node.sub
                            })
                        ]
                    }, node.key);
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("footer", {
                className: "p7-hud-editor-dock",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p7-hud-dock-selected",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                children: selectedMeta.label
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "p7-muted p7-num",
                                children: [
                                    "Offset (",
                                    selectedRect.x >= 0 ? "+" + selectedRect.x : selectedRect.x,
                                    "px,",
                                    ' ',
                                    selectedRect.y >= 0 ? "+" + selectedRect.y : selectedRect.y,
                                    "px)"
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                        className: "p7-hud-dock-slider",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "p7-num",
                                children: [
                                    "Scale ",
                                    Math.round(selectedRect.scale * 100),
                                    "%"
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                type: "range",
                                min: 50,
                                max: 150,
                                value: Math.round(selectedRect.scale * 100),
                                onChange: function onChange(e) {
                                    return updateSelected({
                                        scale: Number(e.target.value) / 100
                                    });
                                }
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                        className: "p7-hud-dock-slider",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "p7-num",
                                children: [
                                    "Opacity ",
                                    Math.round(selectedRect.opacity * 100),
                                    "%"
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                type: "range",
                                min: 20,
                                max: 100,
                                value: Math.round(selectedRect.opacity * 100),
                                onChange: function onChange(e) {
                                    return updateSelected({
                                        opacity: Number(e.target.value) / 100
                                    });
                                }
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p7-hud-dock-presets",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "p7-btn " + (activePreset === 'CLASSIC_2K' ? 'active' : ''),
                                onClick: function onClick() {
                                    return applyPreset('CLASSIC_2K');
                                },
                                children: "Layout 1: Classic 2K"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "p7-btn " + (activePreset === 'CLAW_PRO' ? 'active' : ''),
                                onClick: function onClick() {
                                    return applyPreset('CLAW_PRO');
                                },
                                children: "Layout 2: Claw Pro"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "p7-btn " + (activePreset === 'COMPACT_ONE_HAND' ? 'active' : ''),
                                onClick: function onClick() {
                                    return applyPreset('COMPACT_ONE_HAND');
                                },
                                children: "Layout 3: Compact One-Hand"
                            })
                        ]
                    })
                ]
            })
        ]
    });
};

});
// === MODULE: src/games/hoops-2k26/part7/InstantReplayModal ===
ArcadeMod.define("src/games/hoops-2k26/part7/InstantReplayModal", function(require, module, exports) {
// ============================================================================
// PART 7 — 10-SECOND (600-FRAME) 3D INSTANT REPLAY FREEZE CAM + PNG CAPTURE
// - Scrubs up to 600 recorded 60Hz court frames (10 full seconds)
// - Speed controls: Pause, 0.25x, 0.5x, 1.0x + Timeline Scrubber
// - Smooth 360° Free-Orbit drag/touch 3D camera + Zoom + Ball/Court Focus
// - One-tap PNG Screenshot Capture directly from WebGL canvas
// - Zero backdrop-filter over WebGL; collapsible bottom dock
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InstantReplayModal", {
    enumerable: true,
    get: function() {
        return InstantReplayModal;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
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
var REPLAY_PRESETS = [
    {
        id: '2K',
        label: '2K'
    },
    {
        id: 'BROADCAST',
        label: 'Broadcast'
    },
    {
        id: 'DRIVE',
        label: 'Drive'
    },
    {
        id: 'HIGH',
        label: 'High'
    },
    {
        id: 'NOSEBLEEDS',
        label: 'Skycam'
    }
];
var InstantReplayModal = function InstantReplayModal(param) {
    var uiEraMode = param.uiEraMode, frameCount = param.frameCount, replayOrbitRef = param.replayOrbitRef, activeCameraPreset = param.activeCameraPreset, onSeekFrame = param.onSeekFrame, onSelectCameraPreset = param.onSelectCameraPreset, onCapturePng = param.onCapturePng, onExit = param.onExit;
    var safeMax = Math.max(0, frameCount - 1);
    var _useState = (0, _react.useState)(safeMax), frame = _useState[0], setFrame = _useState[1];
    var _useState1 = (0, _react.useState)(true), playing = _useState1[0], setPlaying = _useState1[1];
    var _useState2 = (0, _react.useState)(0.5), speed = _useState2[0], setSpeed = _useState2[1];
    var _useState3 = (0, _react.useState)(true), freeOrbit = _useState3[0], setFreeOrbit = _useState3[1];
    var _useState4 = (0, _react.useState)('BALL'), focusMode = _useState4[0], setFocusMode = _useState4[1];
    var _useState5 = (0, _react.useState)(10.5), zoomDistance = _useState5[0], setZoomDistance = _useState5[1];
    var _useState6 = (0, _react.useState)(false), collapsed = _useState6[0], setCollapsed = _useState6[1];
    var _useState7 = (0, _react.useState)(null), snapshotStatus = _useState7[0], setSnapshotStatus = _useState7[1];
    var _useState8 = (0, _react.useState)(null), snapshotThumb = _useState8[0], setSnapshotThumb = _useState8[1];
    var frameFloatRef = (0, _react.useRef)(Math.max(0, safeMax - 180));
    var dragRef = (0, _react.useRef)({
        active: false,
        lastX: 0,
        lastY: 0
    });
    // Activate 360° Free-Orbit Freeze Cam on mount & clean up on exit
    (0, _react.useEffect)(function() {
        var startIdx = Math.max(0, safeMax - Math.min(safeMax, 180));
        frameFloatRef.current = startIdx;
        setFrame(startIdx);
        onSeekFrame(startIdx);
        replayOrbitRef.current.active = true;
        replayOrbitRef.current.focusMode = 'BALL';
        replayOrbitRef.current.distance = 10.5;
        return function() {
            replayOrbitRef.current.active = false;
        };
    }, [
        safeMax,
        onSeekFrame,
        replayOrbitRef
    ]);
    (0, _react.useEffect)(function() {
        replayOrbitRef.current.active = freeOrbit;
        replayOrbitRef.current.focusMode = focusMode;
        replayOrbitRef.current.distance = zoomDistance;
    }, [
        freeOrbit,
        focusMode,
        zoomDistance,
        replayOrbitRef
    ]);
    // 60 Hz timeline playback loop scaled by 0.25x / 0.5x / 1.0x
    (0, _react.useEffect)(function() {
        if (!playing || safeMax <= 0) return;
        var rafId = 0;
        var lastTs = performance.now();
        var tick = function tick1(now) {
            var dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
            lastTs = now;
            var next = frameFloatRef.current + dt * 60 * speed;
            if (next > safeMax) next = 0;
            frameFloatRef.current = next;
            var idx = Math.floor(next);
            setFrame(idx);
            onSeekFrame(idx);
            rafId = window.requestAnimationFrame(tick);
        };
        rafId = window.requestAnimationFrame(tick);
        return function() {
            return window.cancelAnimationFrame(rafId);
        };
    }, [
        playing,
        speed,
        safeMax,
        onSeekFrame
    ]);
    var handleOrbitStart = function handleOrbitStart(clientX, clientY) {
        if (!freeOrbit) setFreeOrbit(true);
        dragRef.current = {
            active: true,
            lastX: clientX,
            lastY: clientY
        };
    };
    var handleOrbitMove = function handleOrbitMove(clientX, clientY) {
        if (!dragRef.current.active) return;
        var dx = clientX - dragRef.current.lastX;
        var dy = clientY - dragRef.current.lastY;
        dragRef.current.lastX = clientX;
        dragRef.current.lastY = clientY;
        replayOrbitRef.current.azimuth -= dx * 0.0075;
        replayOrbitRef.current.polar = Math.max(0.26, Math.min(1.36, replayOrbitRef.current.polar + dy * 0.0055));
    };
    var handleOrbitEnd = function handleOrbitEnd() {
        dragRef.current.active = false;
    };
    var handleCaptureScreenshot = function handleCaptureScreenshot() {
        var dataUrl = onCapturePng();
        if (!dataUrl) {
            setSnapshotStatus('Unable to capture frame on this WebGL context.');
            return;
        }
        setSnapshotThumb(dataUrl);
        setSnapshotStatus('PNG Freeze-Cam snapshot captured!');
        try {
            var a = document.createElement('a');
            a.href = dataUrl;
            a.download = "hoops-2k26-replay-frame-" + frame + ".png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (unused) {
        // Fallback: preview thumbnail remains visible in HUD
        }
        window.setTimeout(function() {
            return setSnapshotStatus(null);
        }, 3200);
    };
    var secCurrent = (frame / 60).toFixed(2);
    var secTotal = (safeMax / 60).toFixed(2);
    var eraClass = uiEraMode === '2K14_CLASSIC' ? 'p7-era-2k14' : 'p7-era-2k26';
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "p7-replay-root " + eraClass,
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "p7-replay-orbit-zone",
                onMouseDown: function onMouseDown(e) {
                    return handleOrbitStart(e.clientX, e.clientY);
                },
                onMouseMove: function onMouseMove(e) {
                    return handleOrbitMove(e.clientX, e.clientY);
                },
                onMouseUp: handleOrbitEnd,
                onMouseLeave: handleOrbitEnd,
                onTouchStart: function onTouchStart(e) {
                    if (e.touches.length > 0) handleOrbitStart(e.touches[0].clientX, e.touches[0].clientY);
                },
                onTouchMove: function onTouchMove(e) {
                    if (e.touches.length > 0) handleOrbitMove(e.touches[0].clientX, e.touches[0].clientY);
                },
                onTouchEnd: handleOrbitEnd,
                onWheel: function onWheel(e) {
                    setZoomDistance(function(prev) {
                        return Math.max(4, Math.min(22, prev + Math.sign(e.deltaY) * 0.9));
                    });
                }
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                className: "p7-replay-topbar",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p7-replay-brand",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                children: "Instant Replay \xb7 Freeze Cam"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "p7-muted p7-num",
                                children: [
                                    secCurrent,
                                    "s / ",
                                    secTotal,
                                    "s (",
                                    frameCount,
                                    " frames) \xb7 Drag anywhere to orbit 360\xb0"
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p7-replay-top-actions",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "p7-btn primary",
                                onClick: handleCaptureScreenshot,
                                children: "Capture PNG"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "p7-btn",
                                onClick: function onClick() {
                                    return setCollapsed(function(v) {
                                        return !v;
                                    });
                                },
                                children: collapsed ? 'Show Dock' : 'Hide Dock'
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "p7-btn danger",
                                onClick: onExit,
                                children: "Exit Replay"
                            })
                        ]
                    })
                ]
            }),
            snapshotStatus && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "p7-replay-toast",
                children: [
                    snapshotThumb && /*#__PURE__*/ (0, _jsxruntime.jsx)("img", {
                        src: snapshotThumb,
                        alt: "Captured Freeze Cam snapshot",
                        className: "p7-replay-thumb"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                        children: snapshotStatus
                    })
                ]
            }),
            !collapsed && /*#__PURE__*/ (0, _jsxruntime.jsxs)("footer", {
                className: "p7-replay-dock",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p7-replay-scrubber-row",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "p7-btn primary",
                                onClick: function onClick() {
                                    return setPlaying(function(p) {
                                        return !p;
                                    });
                                },
                                children: playing ? 'Pause' : 'Play'
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                type: "range",
                                min: 0,
                                max: Math.max(1, safeMax),
                                value: frame,
                                "aria-label": "Replay timeline scrubber",
                                className: "p7-replay-slider",
                                onChange: function onChange(e) {
                                    var idx = Number(e.target.value);
                                    setPlaying(false);
                                    frameFloatRef.current = idx;
                                    setFrame(idx);
                                    onSeekFrame(idx);
                                }
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "p7-seg",
                                children: [
                                    0.25,
                                    0.5,
                                    1
                                ].map(function(s) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "p7-seg-btn " + (speed === s ? 'active' : ''),
                                        onClick: function onClick() {
                                            return setSpeed(s);
                                        },
                                        children: [
                                            s,
                                            "x"
                                        ]
                                    }, s);
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p7-replay-cam-row",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p7-seg",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "p7-seg-btn " + (freeOrbit ? 'active' : ''),
                                        onClick: function onClick() {
                                            return setFreeOrbit(true);
                                        },
                                        children: "360\xb0 Free Orbit"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "p7-seg-btn " + (!freeOrbit ? 'active' : ''),
                                        onClick: function onClick() {
                                            return setFreeOrbit(false);
                                        },
                                        children: "Broadcast Cam"
                                    })
                                ]
                            }),
                            freeOrbit ? /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p7-seg",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "p7-seg-btn " + (focusMode === 'BALL' ? 'active' : ''),
                                                onClick: function onClick() {
                                                    return setFocusMode('BALL');
                                                },
                                                children: "Focus: Ball"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "p7-seg-btn " + (focusMode === 'COURT' ? 'active' : ''),
                                                onClick: function onClick() {
                                                    return setFocusMode('COURT');
                                                },
                                                children: "Focus: Half-Court"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                        className: "p7-replay-zoom",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "p7-num",
                                                children: [
                                                    "Zoom ",
                                                    zoomDistance.toFixed(1),
                                                    "m"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                type: "range",
                                                min: 4,
                                                max: 22,
                                                step: 0.5,
                                                value: zoomDistance,
                                                onChange: function onChange(e) {
                                                    return setZoomDistance(Number(e.target.value));
                                                }
                                            })
                                        ]
                                    })
                                ]
                            }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "p7-seg",
                                children: REPLAY_PRESETS.map(function(p) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "p7-seg-btn " + (activeCameraPreset === p.id ? 'active' : ''),
                                        onClick: function onClick() {
                                            return onSelectCameraPreset(p.id);
                                        },
                                        children: p.label
                                    }, p.id);
                                })
                            })
                        ]
                    })
                ]
            })
        ]
    });
};

});
// === MODULE: src/games/hoops-2k26/part7/PostMatchScreen ===
ArcadeMod.define("src/games/hoops-2k26/part7/PostMatchScreen", function(require, module, exports) {
// ============================================================================
// PART 7 — POST-MATCH JORDAN / GATORADE MVP CELEBRATION & 3-TAB PROGRESSION
// - Animated confetti burst + Jordan / Gatorade Player of the Game Spotlight
// - Tab 1: Full 12-Column Box Score (Away & Home switcher)
// - Tab 2: Team Comparison Bars + Match Half-Court Shot Chart
// - Tab 3: Animated VC Payout Breakdown + Season / Rep / Badge / Crew XP Bars
//          + Settled Part 6 Mode Unlock Summary
// - Actions: [Rematch] [Instant Replay / Freeze Cam] [Return to The City] [Main Menu]
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PostMatchScreen", {
    enumerable: true,
    get: function() {
        return PostMatchScreen;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _store = require("../hybrid/store");
var _ShotChartCanvas = require("./ShotChartCanvas");
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
var CONFETTI_PIECES = Array.from({
    length: 24
}, function(_, idx) {
    return {
        id: idx,
        leftPct: (idx * 4.2 + 2) % 98,
        delaySec: idx * 17 % 10 * 0.14,
        durationSec: 2.2 + idx * 7 % 5 * 0.28,
        color: [
            '#fbbf24',
            '#38bdf8',
            '#22c55e',
            '#ef4444',
            '#f8fafc'
        ][idx % 5]
    };
});
function computeMvpScore(p) {
    return p.pts * 1.45 + p.reb * 1.15 + p.ast * 1.55 + p.stl * 2.3 + p.blk * 2.3 - p.turnovers * 0.9;
}
function formatMin(sec) {
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? '0' : '') + s;
}
function computeRowGrade(p) {
    var score = computeMvpScore(p);
    if (score >= 34) return 'A+';
    if (score >= 26) return 'A';
    if (score >= 20) return 'A-';
    if (score >= 14) return 'B+';
    if (score >= 9) return 'B';
    if (score >= 5) return 'B-';
    return 'C+';
}
var PostMatchScreen = function PostMatchScreen(param) {
    var hud = param.hud, awayTeam = param.awayTeam, homeTeam = param.homeTeam, save = param.save, payout = param.payout, modePayload = param.modePayload, modeOutcomeSummary = param.modeOutcomeSummary, onRematch = param.onRematch, onOpenReplay = param.onOpenReplay, onReturnToCity = param.onReturnToCity, onMainMenu = param.onMainMenu;
    var _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
    var _useState = (0, _react.useState)('BOX_SCORE'), tab = _useState[0], setTab = _useState[1];
    var _useState1 = (0, _react.useState)('HOME'), boxSide = _useState1[0], setBoxSide = _useState1[1];
    var _useState2 = (0, _react.useState)(0), animatedVc = _useState2[0], setAnimatedVc = _useState2[1];
    var era = save.uiEraMode;
    var homeRows = (0, _react.useMemo)(function() {
        return hud.boxScore.filter(function(r) {
            return r.teamSide === 'HOME';
        });
    }, [
        hud.boxScore
    ]);
    var awayRows = (0, _react.useMemo)(function() {
        return hud.boxScore.filter(function(r) {
            return r.teamSide === 'AWAY';
        });
    }, [
        hud.boxScore
    ]);
    var userWon = hud.winnerSide !== null && (hud.userTeamSide === null ? hud.winnerSide === 'HOME' : hud.winnerSide === hud.userTeamSide);
    var mvpPlayer = (0, _react.useMemo)(function() {
        var _hud_winnerSide, _all_;
        var winningSide = (_hud_winnerSide = hud.winnerSide) != null ? _hud_winnerSide : hud.homeScore >= hud.awayScore ? 'HOME' : 'AWAY';
        var pool = winningSide === 'HOME' ? homeRows : awayRows;
        var all = pool.length > 0 ? pool : hud.boxScore;
        var best = (_all_ = all[0]) != null ? _all_ : null;
        var bestScore = -999;
        for(var i = 0; i < all.length; i++){
            var sc = computeMvpScore(all[i]);
            if (sc > bestScore) {
                bestScore = sc;
                best = all[i];
            }
        }
        return best;
    }, [
        homeRows,
        awayRows,
        hud.boxScore,
        hud.winnerSide,
        hud.homeScore,
        hud.awayScore
    ]);
    (0, _react.useEffect)(function() {
        var _ref;
        var target = (_ref = payout == null ? void 0 : payout.totalVc) != null ? _ref : 450;
        var step = 0;
        var totalSteps = 24;
        var timer = window.setInterval(function() {
            step += 1;
            var t = Math.min(1, step / totalSteps);
            setAnimatedVc(Math.round(target * (1 - Math.pow(1 - t, 3))));
            if (step >= totalSteps) window.clearInterval(timer);
        }, 28);
        return function() {
            return window.clearInterval(timer);
        };
    }, [
        payout == null ? void 0 : payout.totalVc
    ]);
    var matchShots = (0, _react.useMemo)(function() {
        var _hud_matchShots;
        return ((_hud_matchShots = hud.matchShots) != null ? _hud_matchShots : []).map(function(s, idx) {
            return {
                id: s.id || "mshot_" + idx,
                x: s.x,
                y: s.y,
                made: s.made,
                isThree: s.isThree,
                isGreen: s.isGreen,
                era: era,
                timestamp: Date.now() - idx * 1000
            };
        });
    }, [
        hud.matchShots,
        era
    ]);
    var sumTeamShooting = function sumTeamShooting(rows) {
        var fgm = 0;
        var fga = 0;
        var tpm = 0;
        var tpa = 0;
        var ftm = 0;
        var fta = 0;
        var reb = 0;
        var tov = 0;
        for(var i = 0; i < rows.length; i++){
            fgm += rows[i].fgm;
            fga += rows[i].fga;
            tpm += rows[i].tpm;
            tpa += rows[i].tpa;
            ftm += rows[i].ftm;
            fta += rows[i].fta;
            reb += rows[i].reb;
            tov += rows[i].turnovers;
        }
        return {
            fgPct: fga > 0 ? Math.round(fgm / fga * 100) : 0,
            tpPct: tpa > 0 ? Math.round(tpm / tpa * 100) : 0,
            ftPct: fta > 0 ? Math.round(ftm / fta * 100) : 0,
            fgLabel: fgm + "/" + fga,
            tpLabel: tpm + "/" + tpa,
            ftLabel: ftm + "/" + fta,
            reb: reb,
            tov: tov
        };
    };
    var awaySum = (0, _react.useMemo)(function() {
        return sumTeamShooting(awayRows);
    }, [
        awayRows
    ]);
    var homeSum = (0, _react.useMemo)(function() {
        return sumTeamShooting(homeRows);
    }, [
        homeRows
    ]);
    var comp = hud.teamComparison;
    var comparisonRows = [
        {
            label: 'FG%',
            awayVal: awaySum.fgPct,
            homeVal: homeSum.fgPct,
            awayTxt: awaySum.fgPct + "% (" + awaySum.fgLabel + ")",
            homeTxt: homeSum.fgPct + "% (" + homeSum.fgLabel + ")"
        },
        {
            label: '3PT%',
            awayVal: awaySum.tpPct,
            homeVal: homeSum.tpPct,
            awayTxt: awaySum.tpPct + "% (" + awaySum.tpLabel + ")",
            homeTxt: homeSum.tpPct + "% (" + homeSum.tpLabel + ")"
        },
        {
            label: 'FT%',
            awayVal: awaySum.ftPct,
            homeVal: homeSum.ftPct,
            awayTxt: awaySum.ftPct + "% (" + awaySum.ftLabel + ")",
            homeTxt: homeSum.ftPct + "% (" + homeSum.ftLabel + ")"
        },
        {
            label: 'Points in Paint',
            awayVal: comp.awayPaintPts,
            homeVal: comp.homePaintPts,
            awayTxt: String(comp.awayPaintPts),
            homeTxt: String(comp.homePaintPts)
        },
        {
            label: 'Fast Break Pts',
            awayVal: comp.awayFastBreakPts,
            homeVal: comp.homeFastBreakPts,
            awayTxt: String(comp.awayFastBreakPts),
            homeTxt: String(comp.homeFastBreakPts)
        },
        {
            label: '2nd Chance Pts',
            awayVal: comp.awaySecondChancePts,
            homeVal: comp.homeSecondChancePts,
            awayTxt: String(comp.awaySecondChancePts),
            homeTxt: String(comp.homeSecondChancePts)
        },
        {
            label: 'Bench Points',
            awayVal: comp.awayBenchPts,
            homeVal: comp.homeBenchPts,
            awayTxt: String(comp.awayBenchPts),
            homeTxt: String(comp.homeBenchPts)
        },
        {
            label: 'Rebounds',
            awayVal: Math.max(awaySum.reb, comp.awayReb),
            homeVal: Math.max(homeSum.reb, comp.homeReb),
            awayTxt: String(Math.max(awaySum.reb, comp.awayReb)),
            homeTxt: String(Math.max(homeSum.reb, comp.homeReb))
        },
        {
            label: 'Turnovers',
            awayVal: Math.max(awaySum.tov, comp.awayTurnovers),
            homeVal: Math.max(homeSum.tov, comp.homeTurnovers),
            awayTxt: String(Math.max(awaySum.tov, comp.awayTurnovers)),
            homeTxt: String(Math.max(homeSum.tov, comp.homeTurnovers))
        }
    ];
    var activeBoxRows = boxSide === 'HOME' ? homeRows : awayRows;
    var eraClass = era === '2K14_CLASSIC' ? 'p7-era-2k14' : 'p7-era-2k26';
    var mvpFgPct = mvpPlayer && mvpPlayer.fga > 0 ? Math.round(mvpPlayer.fgm / mvpPlayer.fga * 100) : 0;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "p7-post-overlay " + eraClass,
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "p7-confetti-stage",
                "aria-hidden": "true",
                children: CONFETTI_PIECES.map(function(c) {
                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                        className: "p7-confetti-piece",
                        style: {
                            left: "" + c.leftPct + "%",
                            backgroundColor: c.color,
                            animationDelay: "" + c.delaySec + "s",
                            animationDuration: "" + c.durationSec + "s"
                        }
                    }, c.id);
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "p7-post-shell",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                        className: "p7-post-hero",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p7-post-scoreboard",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p7-post-kicker",
                                        children: [
                                            userWon ? 'Final Buzzer · Victory' : 'Final Buzzer · Complete',
                                            modePayload ? " \xb7 " + modePayload.title : ''
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p7-post-scoreline p7-num",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                style: {
                                                    color: awayTeam.colors.accent || '#e2e8f0'
                                                },
                                                children: [
                                                    awayTeam.abbr,
                                                    " ",
                                                    hud.awayScore
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "p7-muted",
                                                children: "—"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                style: {
                                                    color: homeTeam.colors.accent || '#38bdf8'
                                                },
                                                children: [
                                                    hud.homeScore,
                                                    " ",
                                                    homeTeam.abbr
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            mvpPlayer && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p7-mvp-card",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "p7-mvp-label",
                                        children: era === '2K14_CLASSIC' ? 'Jordan Brand Player of the Game' : 'Gatorade Player of the Game (MVP)'
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p7-mvp-name",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                children: [
                                                    "#",
                                                    mvpPlayer.jersey,
                                                    " ",
                                                    mvpPlayer.name
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "p7-muted",
                                                children: [
                                                    mvpPlayer.position,
                                                    " \xb7 ",
                                                    mvpPlayer.teamSide === 'HOME' ? homeTeam.abbr : awayTeam.abbr
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p7-mvp-stats p7-num",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: mvpPlayer.pts
                                                    }),
                                                    " PTS"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: mvpPlayer.reb
                                                    }),
                                                    " REB"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: mvpPlayer.ast
                                                    }),
                                                    " AST"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: mvpPlayer.stl
                                                    }),
                                                    " STL"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: mvpPlayer.blk
                                                    }),
                                                    " BLK"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                        children: [
                                                            mvpFgPct,
                                                            "%"
                                                        ]
                                                    }),
                                                    " FG"
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("nav", {
                        className: "p7-post-tabs",
                        role: "tablist",
                        children: [
                            [
                                'BOX_SCORE',
                                '1. Box Score'
                            ],
                            [
                                'COMPARISON',
                                '2. Team Comparison & Shot Chart'
                            ],
                            [
                                'REWARDS',
                                '3. Rewards & Progression'
                            ]
                        ].map(function(param) {
                            var id = param[0], label = param[1];
                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                role: "tab",
                                "aria-selected": tab === id,
                                className: "p7-tab-btn " + (tab === id ? 'active' : ''),
                                onClick: function onClick() {
                                    return setTab(id);
                                },
                                children: label
                            }, id);
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("section", {
                        className: "p7-post-body",
                        children: [
                            tab === 'BOX_SCORE' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p7-box-wrap",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p7-seg",
                                        style: {
                                            marginBottom: 10
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                type: "button",
                                                className: "p7-seg-btn " + (boxSide === 'HOME' ? 'active' : ''),
                                                onClick: function onClick() {
                                                    return setBoxSide('HOME');
                                                },
                                                children: [
                                                    homeTeam.city,
                                                    " ",
                                                    homeTeam.name,
                                                    " (",
                                                    hud.homeScore,
                                                    ")"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                type: "button",
                                                className: "p7-seg-btn " + (boxSide === 'AWAY' ? 'active' : ''),
                                                onClick: function onClick() {
                                                    return setBoxSide('AWAY');
                                                },
                                                children: [
                                                    awayTeam.city,
                                                    " ",
                                                    awayTeam.name,
                                                    " (",
                                                    hud.awayScore,
                                                    ")"
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "p7-table-scroll",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("table", {
                                            className: "p7-box-table p7-num",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("thead", {
                                                    children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                children: "Player"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                children: "MIN"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                children: "PTS"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                children: "REB"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                children: "AST"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                children: "STL"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                children: "BLK"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                children: "TO"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                children: "FGM-A"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                children: "3PM-A"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                children: "FTM-A"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                children: "+/-"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                children: "GRD"
                                                            })
                                                        ]
                                                    })
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("tbody", {
                                                    children: activeBoxRows.map(function(row) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                                    className: "p7-box-name",
                                                                    children: [
                                                                        "#",
                                                                        row.jersey,
                                                                        " ",
                                                                        row.name,
                                                                        ' ',
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                            className: "p7-muted",
                                                                            children: row.position
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                    children: formatMin(row.minutesSec)
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                        children: row.pts
                                                                    })
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                    children: row.reb
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                    children: row.ast
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                    children: row.stl
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                    children: row.blk
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                    children: row.turnovers
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                                    children: [
                                                                        row.fgm,
                                                                        "-",
                                                                        row.fga
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                                    children: [
                                                                        row.tpm,
                                                                        "-",
                                                                        row.tpa
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                                    children: [
                                                                        row.ftm,
                                                                        "-",
                                                                        row.fta
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                    children: row.plusMinus >= 0 ? "+" + row.plusMinus : row.plusMinus
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                        children: computeRowGrade(row)
                                                                    })
                                                                })
                                                            ]
                                                        }, row.playerId);
                                                    })
                                                })
                                            ]
                                        })
                                    })
                                ]
                            }),
                            tab === 'COMPARISON' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p7-comp-grid",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p7-comp-card",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p7-comp-head",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: awayTeam.abbr
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "p7-muted",
                                                        children: "Team Comparison"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: homeTeam.abbr
                                                    })
                                                ]
                                            }),
                                            comparisonRows.map(function(row) {
                                                var total = Math.max(1, row.awayVal + row.homeVal);
                                                var awayPct = Math.round(row.awayVal / total * 100);
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "p7-comp-row",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "p7-comp-labels p7-num",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    children: row.awayTxt
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "p7-muted",
                                                                    children: row.label
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    children: row.homeTxt
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "p7-comp-bar",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "p7-comp-fill-away",
                                                                    style: {
                                                                        width: "" + awayPct + "%"
                                                                    }
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "p7-comp-fill-home",
                                                                    style: {
                                                                        width: "" + (100 - awayPct) + "%"
                                                                    }
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }, row.label);
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "p7-comp-card",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_ShotChartCanvas.ShotChartCanvas, {
                                            shots: matchShots,
                                            title: "Match Half-Court Shot Chart",
                                            compact: true
                                        })
                                    })
                                ]
                            }),
                            tab === 'REWARDS' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p7-rewards-grid",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p7-reward-card",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h4", {
                                                children: "VC Payout Breakdown"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p7-vc-total p7-num",
                                                children: [
                                                    "+",
                                                    animatedVc.toLocaleString(),
                                                    " VC"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p7-vc-rows p7-num",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                children: "Base Game Salary"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                                children: [
                                                                    "+",
                                                                    (_ref = payout == null ? void 0 : payout.baseVc) != null ? _ref : 350,
                                                                    " VC"
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                children: "Win Bonus"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                                children: [
                                                                    "+",
                                                                    (_ref1 = payout == null ? void 0 : payout.winBonusVc) != null ? _ref1 : 0,
                                                                    " VC"
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                children: [
                                                                    "Teammate Grade (",
                                                                    hud.teammateGrade.letter,
                                                                    ")"
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                                children: [
                                                                    "+",
                                                                    (_ref2 = payout == null ? void 0 : payout.gradeBonusVc) != null ? _ref2 : 100,
                                                                    " VC"
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                children: "Green Release Bonus"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                                children: [
                                                                    "+",
                                                                    (_ref3 = payout == null ? void 0 : payout.greenBonusVc) != null ? _ref3 : 0,
                                                                    " VC"
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                children: "Streak Breaker / Win Streak"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                                children: [
                                                                    "+",
                                                                    (_ref4 = payout == null ? void 0 : payout.streakBonusVc) != null ? _ref4 : 0,
                                                                    " VC"
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                children: "MyTEAM Points Earned"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                                children: [
                                                                    "+",
                                                                    (_ref5 = payout == null ? void 0 : payout.mtpEarned) != null ? _ref5 : 250,
                                                                    " MTP"
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p7-reward-card",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h4", {
                                                children: "Season, Rep, Badge & Crew Progression"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p7-xp-block",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "p7-xp-head p7-num",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                children: [
                                                                    "Season Level ",
                                                                    save.currencies.seasonLevel,
                                                                    " / 40"
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                                children: [
                                                                    "+",
                                                                    (_ref6 = payout == null ? void 0 : payout.seasonXpEarned) != null ? _ref6 : 320,
                                                                    " XP"
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "p7-xp-bar",
                                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "p7-xp-fill cyan",
                                                            style: {
                                                                width: "" + Math.min(100, save.currencies.seasonXP % 500 / 5) + "%"
                                                            }
                                                        })
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p7-xp-block",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "p7-xp-head p7-num",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                children: [
                                                                    "Rep Tier \xb7 ",
                                                                    save.currencies.repTier
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                                children: [
                                                                    "+",
                                                                    (_ref7 = payout == null ? void 0 : payout.repXpEarned) != null ? _ref7 : 260,
                                                                    " REP"
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "p7-xp-bar",
                                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "p7-xp-fill gold",
                                                            style: {
                                                                width: "" + Math.min(100, save.currencies.repXP % 1000 / 10) + "%"
                                                            }
                                                        })
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p7-xp-block",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "p7-xp-head p7-num",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                children: [
                                                                    "Crew \xb7 ",
                                                                    save.currencies.crewName,
                                                                    " (Lv. ",
                                                                    save.currencies.crewLevel,
                                                                    ")"
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                children: "+120 Crew XP"
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "p7-xp-bar",
                                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "p7-xp-fill green",
                                                            style: {
                                                                width: '74%'
                                                            }
                                                        })
                                                    })
                                                ]
                                            }),
                                            modeOutcomeSummary && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p7-mode-unlock-box",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "Mode Progress Settled"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                        children: modeOutcomeSummary
                                                    })
                                                ]
                                            }),
                                            payout && payout.newlyUnlockedAchievements.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p7-mode-unlock-box",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "Trophies Unlocked"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                        children: payout.newlyUnlockedAchievements.map(function(id) {
                                                            var _ref;
                                                            var _ACHIEVEMENT_CATALOG_find;
                                                            return (_ref = (_ACHIEVEMENT_CATALOG_find = _store.ACHIEVEMENT_CATALOG.find(function(a) {
                                                                return a.id === id;
                                                            })) == null ? void 0 : _ACHIEVEMENT_CATALOG_find.title) != null ? _ref : id;
                                                        }).join(' · ')
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("footer", {
                        className: "p7-post-footer",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "p7-btn primary",
                                onClick: onRematch,
                                children: "Rematch"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "p7-btn accent",
                                onClick: onOpenReplay,
                                children: "Instant Replay / Freeze Cam"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "p7-btn",
                                onClick: onReturnToCity,
                                children: "Return to The City"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "p7-btn",
                                onClick: onMainMenu,
                                children: "Main Menu"
                            })
                        ]
                    })
                ]
            })
        ]
    });
};

});

})(window.ArcadeMod);
