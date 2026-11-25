(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/engine/Court3D ===
ArcadeMod.define("src/games/hoops-2k26/engine/Court3D", function(require, module, exports) {
// ============================================================================
// PART 3 — 60 FPS THREE.JS 3D BASKETBALL BATTLEFIELD COMPONENT (Court3D.tsx)
// Accepts live MatchRenderState via ref (zero React re-renders per frame).
// Enforces RoomEnvironment PBR, Software-WebGL guard + fenceSync pacing,
// zero-GC scratch vectors, webglcontextlost recovery, and full disposal.
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Court3D", {
    enumerable: true,
    get: function() {
        return Court3D;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _RoomEnvironment = require("three/addons/environments/RoomEnvironment.js");
var _courtTypes = require("./courtTypes");
var _CourtTextures = require("./CourtTextures");
var _PlayerMesh3D = require("./PlayerMesh3D");
var _VenueBuilder3D = require("./VenueBuilder3D");
var _CourtOverlays3D = require("./CourtOverlays3D");
function _instanceof(left, right) {
    "@swc/helpers - instanceof";
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else return left instanceof right;
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
// Module-scoped zero-GC scratch vectors
var _camTargetPos = new _three.Vector3();
var _camTargetLook = new _three.Vector3();
var _camCurLook = new _three.Vector3();
var _handPos = new _three.Vector3();
var _projScratch = new _three.Vector3();
function detectSoftwareWebGL() {
    try {
        var probe = document.createElement('canvas');
        var gl = probe.getContext('webgl2') || probe.getContext('webgl');
        if (!gl) return true;
        var ext = gl.getExtension('WEBGL_debug_renderer_info');
        var param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        var gpu = String(gl.getParameter(param) || '');
        var lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch (unused) {
        return false;
    }
}
var Court3D = function Court3D(param) {
    var matchStateRef = param.matchStateRef, homeTeam = param.homeTeam, awayTeam = param.awayTeam, venue = param.venue, homeJersey = param.homeJersey, awayJersey = param.awayJersey, uiEraMode = param.uiEraMode, cameraConfig = param.cameraConfig, visualConfig = param.visualConfig, streakStamp = param.streakStamp, projectedAnchorsRef = param.projectedAnchorsRef, replayOrbitRef = param.replayOrbitRef, capturePngRef = param.capturePngRef, onTickFrame = param.onTickFrame, onFpsSample = param.onFpsSample;
    var mountRef = (0, _react.useRef)(null);
    var _useState = (0, _react.useState)(false), contextLost = _useState[0], setContextLost = _useState[1];
    // Store reactive props in refs so camera/visual switches NEVER recreate WebGL context
    var camCfgRef = (0, _react.useRef)(cameraConfig);
    var visCfgRef = (0, _react.useRef)(visualConfig);
    var eraRef = (0, _react.useRef)(uiEraMode);
    var projOutRef = (0, _react.useRef)(projectedAnchorsRef);
    var orbitRef = (0, _react.useRef)(replayOrbitRef);
    var capPngPropRef = (0, _react.useRef)(capturePngRef);
    var tickCbRef = (0, _react.useRef)(onTickFrame);
    var fpsCbRef = (0, _react.useRef)(onFpsSample);
    var venueHandleRef = (0, _react.useRef)(null);
    camCfgRef.current = cameraConfig;
    visCfgRef.current = visualConfig;
    eraRef.current = uiEraMode;
    projOutRef.current = projectedAnchorsRef;
    orbitRef.current = replayOrbitRef;
    capPngPropRef.current = capturePngRef;
    tickCbRef.current = onTickFrame;
    fpsCbRef.current = onFpsSample;
    // Live toggle for 2K14 Glossy Hardwood Reflections without rebuilding the scene
    (0, _react.useEffect)(function() {
        if (venueHandleRef.current) {
            venueHandleRef.current.setHardwoodReflections(visualConfig.hardwoodReflections);
        }
    }, [
        visualConfig.hardwoodReflections
    ]);
    // Core Three.js scene lifecycle — rebuilds only on venue/team/jersey change
    (0, _react.useEffect)(function() {
        var _ref, _ref1;
        var _initSt_players_, _initSt_players_1;
        var container = mountRef.current;
        if (!container) return;
        var isSoftwareGl = detectSoftwareWebGL();
        var renderer;
        try {
            renderer = new _three.WebGLRenderer({
                antialias: !isSoftwareGl,
                powerPreference: 'high-performance'
            });
        } catch (unused) {
            setContextLost(true);
            return;
        }
        var initW = Math.max(320, container.clientWidth || window.innerWidth || 960);
        var initH = Math.max(240, container.clientHeight || window.innerHeight || 540);
        renderer.outputColorSpace = _three.SRGBColorSpace;
        renderer.toneMapping = _three.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, visCfgRef.current.cinema3DQuality === 'HIGH' ? 2 : 1.35));
        renderer.setSize(initW, initH);
        renderer.shadowMap.enabled = !isSoftwareGl;
        renderer.shadowMap.type = _three.PCFShadowMap;
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        container.innerHTML = '';
        container.appendChild(renderer.domElement);
        var scene = new _three.Scene();
        var outdoor = (0, _courtTypes.isOutdoorVenue)(venue);
        var skyBgHex = venue === 'SKYLINE_PARK' ? 0xf59e6c : venue === 'SUNSET_BEACH' ? 0x38bdf8 : venue === 'RIVET_CITY' ? 0x2a1f24 : venue === 'OLD_TOWN' ? 0x64748b : venue === 'BLACKTOP_CAGE' ? 0x0b1120 : venue === 'STREET_KINGS' ? 0x2b1d14 : venue === 'ARENA_2K14' ? 0x0b0810 : 0x070b14;
        scene.background = new _three.Color(skyBgHex);
        scene.fog = new _three.FogExp2(skyBgHex, outdoor ? 0.011 : 0.014);
        // RoomEnvironment IBL for realistic glossy hardwood & chrome rim reflections
        var pmrem = new _three.PMREMGenerator(renderer);
        var envTex = pmrem.fromScene(new _RoomEnvironment.RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;
        // 3-Point Arena / Outdoor Daylight Rig
        var hemi = new _three.HemisphereLight(outdoor ? 0xfff3d6 : 0xdbeafe, outdoor ? 0x334155 : 0x1e293b, outdoor ? 1.15 : 0.85);
        scene.add(hemi);
        var keyLight = new _three.DirectionalLight(venue === 'SKYLINE_PARK' || venue === 'ARENA_2K14' ? 0xffe4b5 : 0xffffff, outdoor ? 1.85 : 1.55);
        keyLight.position.set(10, 22, 14);
        if (!isSoftwareGl) {
            keyLight.castShadow = true;
            keyLight.shadow.mapSize.set(1024, 1024);
            keyLight.shadow.camera.near = 2;
            keyLight.shadow.camera.far = 55;
            keyLight.shadow.camera.left = -18;
            keyLight.shadow.camera.right = 18;
            keyLight.shadow.camera.top = 12;
            keyLight.shadow.camera.bottom = -12;
            keyLight.shadow.bias = -0.0005;
        }
        scene.add(keyLight);
        var rimFill = new _three.DirectionalLight(0x93c5fd, 0.55);
        rimFill.position.set(-14, 15, -12);
        scene.add(rimFill);
        // PerspectiveCamera initialized cleanly to active camera angle
        var camera = new _three.PerspectiveCamera(48, initW / initH, 0.15, 160);
        var initSt = matchStateRef.current;
        var initPose = (0, _courtTypes.solveCameraTarget)(camCfgRef.current, initSt.ball.x, initSt.ball.y, initSt.ball.z, (_ref = (_initSt_players_ = initSt.players[0]) == null ? void 0 : _initSt_players_.x) != null ? _ref : 0, (_ref1 = (_initSt_players_1 = initSt.players[0]) == null ? void 0 : _initSt_players_1.z) != null ? _ref1 : 0, initSt.attackDirX);
        camera.position.set(initPose.posX, initPose.posY, initPose.posZ);
        _camCurLook.set(initPose.lookX, initPose.lookY, initPose.lookZ);
        camera.lookAt(_camCurLook);
        // Build Venue (Court, Hoops, Nets, Crowd, Jumbotron, Outdoor Props)
        var builtVenue = (0, _VenueBuilder3D.buildVenue3D)(venue, homeTeam, visCfgRef.current.hardwoodReflections, streakStamp);
        venueHandleRef.current = builtVenue;
        scene.add(builtVenue.root);
        // Floor Overlays (Active Ring, Stamina, Pips, Takeover, PlayVision, Hot/Cold, Mark Star)
        var overlays = new _CourtOverlays3D.CourtOverlays3D();
        scene.add(overlays.root);
        // 10 Articulated Height-Scaled Players (5 Home + 5 Away)
        var jerseyCache = new _CourtTextures.JerseyTextureCache();
        var playerMeshes = new Map();
        for(var i = 0; i < initSt.players.length; i++){
            var pl = initSt.players[i];
            var teamData = pl.teamSide === 'HOME' ? homeTeam : awayTeam;
            var variant = pl.teamSide === 'HOME' ? homeJersey : awayJersey;
            var pm = new _PlayerMesh3D.PlayerMesh3D(pl, teamData, variant, jerseyCache);
            playerMeshes.set(pl.id, pm);
            scene.add(pm.root);
        }
        // Spinning Textured Basketball + Contact Shadow
        var ballTex = (0, _CourtTextures.createBasketballTexture)();
        var ballGeo = new _three.SphereGeometry(_courtTypes.COURT_DIMS.BALL_RADIUS, 20, 16);
        var ballMat = new _three.MeshStandardMaterial({
            map: ballTex,
            roughness: 0.52,
            metalness: 0.06
        });
        var ballMesh = new _three.Mesh(ballGeo, ballMat);
        ballMesh.castShadow = true;
        scene.add(ballMesh);
        var ballShadowGeo = new _three.CircleGeometry(0.18, 16);
        var ballShadowMat = new _three.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.36,
            depthWrite: false
        });
        var ballShadow = new _three.Mesh(ballShadowGeo, ballShadowMat);
        ballShadow.rotation.x = -Math.PI / 2;
        ballShadow.position.y = 0.017;
        scene.add(ballShadow);
        // Context loss & restore recovery
        var handleContextLost = function handleContextLost(e) {
            e.preventDefault();
            setContextLost(true);
        };
        var handleContextRestored = function handleContextRestored() {
            setContextLost(false);
        };
        renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
        renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);
        // ResizeObserver for crisp layout across desktop & mobile full screen
        var handleResize = function handleResize() {
            var w = Math.max(320, container.clientWidth || window.innerWidth || 960);
            var h = Math.max(240, container.clientHeight || window.innerHeight || 540);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        var ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
        if (ro) ro.observe(container);
        window.addEventListener('resize', handleResize);
        // WebGL2 fenceSync pacing helper for software renderers (zero queued-frame stutter)
        var glCtx = renderer.getContext();
        var isWebGL2 = typeof WebGL2RenderingContext !== 'undefined' && _instanceof(glCtx, WebGL2RenderingContext);
        var disposed = false;
        var rafId = 0;
        var afterDraw = function afterDraw(next) {
            if (disposed) return;
            if (!isSoftwareGl || !isWebGL2) {
                rafId = window.requestAnimationFrame(next);
                return;
            }
            var sync = glCtx.fenceSync(glCtx.SYNC_GPU_COMMANDS_COMPLETE, 0);
            if (!sync) {
                rafId = window.requestAnimationFrame(next);
                return;
            }
            glCtx.flush();
            var poll = function poll1() {
                if (disposed) {
                    glCtx.deleteSync(sync);
                    return;
                }
                var status = glCtx.clientWaitSync(sync, 0, 0);
                if (status === glCtx.TIMEOUT_EXPIRED) {
                    window.setTimeout(poll, 4);
                } else {
                    glCtx.deleteSync(sync);
                    rafId = window.requestAnimationFrame(next);
                }
            };
            window.setTimeout(poll, 4);
        };
        var lastTs = performance.now();
        var elapsedSec = 0;
        var fpsAccum = 0;
        var fpsFrames = 0;
        var jumboTimer = 0;
        var tick = function tick1() {
            var _orbitRef_current;
            if (disposed) return;
            var now = performance.now();
            var dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
            lastTs = now;
            elapsedSec += dt;
            if (tickCbRef.current) {
                tickCbRef.current(dt, elapsedSec);
            }
            var st = matchStateRef.current;
            // Update all 10 articulated players
            for(var i = 0; i < st.players.length; i++){
                var pl = st.players[i];
                var pm = playerMeshes.get(pl.id);
                if (pm) pm.update(pl);
            }
            // Sync basketball to active holder's dribbling/shooting hand or airborne arc
            if (!st.ball.inFlight && st.ball.holderPlayerId) {
                var holderMesh = playerMeshes.get(st.ball.holderPlayerId);
                var holderState = st.players.find(function(p) {
                    return p.id === st.ball.holderPlayerId;
                });
                if (holderMesh && holderState) {
                    var handSide = holderState.animState === 'DRIBBLE_LEFT' ? 'left' : 'right';
                    holderMesh.getHandWorldPos(handSide, _handPos);
                    if (holderState.animState === 'DRIBBLE_RIGHT' || holderState.animState === 'DRIBBLE_LEFT' || holderState.animState === 'CROSSOVER') {
                        var dribbleWave = Math.abs(Math.sin(holderState.animPhase * 1.4));
                        st.ball.x = _handPos.x;
                        st.ball.z = _handPos.z;
                        st.ball.y = _courtTypes.COURT_DIMS.BALL_RADIUS + dribbleWave * Math.max(0.5, _handPos.y - 0.16);
                    } else {
                        st.ball.x = _handPos.x;
                        st.ball.y = Math.max(_courtTypes.COURT_DIMS.BALL_RADIUS, _handPos.y);
                        st.ball.z = _handPos.z;
                    }
                }
            }
            ballMesh.position.set(st.ball.x, st.ball.y, st.ball.z);
            ballMesh.rotation.x += (st.ball.inFlight ? st.ball.spinX : 3.2) * dt;
            ballMesh.rotation.z += (st.ball.inFlight ? st.ball.spinZ : 1.4) * dt;
            ballShadow.position.set(st.ball.x, 0.017, st.ball.z);
            var bScale = Math.max(0.35, 1.15 - st.ball.y * 0.18);
            ballShadow.scale.set(bScale, bScale, 1);
            // Update hoops (rim flex, rippling nets, buzzer LEDs), environment & floor overlays
            builtVenue.updateHoops(st.hoops);
            builtVenue.updateEnvironment(elapsedSec, st.crowdExcitement);
            overlays.update(st, visCfgRef.current, eraRef.current, elapsedSec);
            // Update Jumbotron canvas at 2 Hz
            jumboTimer += dt;
            if (jumboTimer >= 0.5) {
                jumboTimer = 0;
                var mins = Math.floor(st.quarterClockSec / 60);
                var secs = Math.floor(st.quarterClockSec % 60);
                var clk = "Q" + st.quarter + " " + mins + ":" + (secs < 10 ? '0' : '') + secs + " \xb7 SC " + Math.ceil(st.shotClockSec);
                builtVenue.updateJumbotron(st.awayAbbr, st.awayScore, st.homeAbbr, st.homeScore, clk, st.jumbotronBanner);
            }
            // Spring-damped 7-Camera Controller + Contact Dunk Camera Shake
            var focusPl = st.players.find(function(p) {
                return p.isUserControlled && p.visible;
            }) || st.players[0];
            var camCfg = camCfgRef.current;
            var solved = (0, _courtTypes.solveCameraTarget)(camCfg, st.ball.x, st.ball.y, st.ball.z, focusPl ? focusPl.x : 0, focusPl ? focusPl.z : 0, st.attackDirX);
            var orbitState = (_orbitRef_current = orbitRef.current) == null ? void 0 : _orbitRef_current.current;
            var targetFov = solved.fov;
            if (orbitState && orbitState.active) {
                var fx = orbitState.focusMode === 'COURT' ? 0 : st.ball.x;
                var fy = orbitState.focusMode === 'COURT' ? 1.4 : Math.max(1.0, st.ball.y);
                var fz = orbitState.focusMode === 'COURT' ? 0 : st.ball.z;
                var dist = Math.max(3.5, Math.min(24, orbitState.distance));
                var pol = Math.max(0.24, Math.min(1.42, orbitState.polar));
                var sinP = Math.sin(pol);
                _camTargetLook.set(fx, fy, fz);
                _camTargetPos.set(fx + dist * sinP * Math.cos(orbitState.azimuth), Math.max(0.65, fy + dist * Math.cos(pol)), fz + dist * sinP * Math.sin(orbitState.azimuth));
                targetFov = 46;
            } else {
                _camTargetPos.set(solved.posX, solved.posY, solved.posZ);
                _camTargetLook.set(solved.lookX, solved.lookY, solved.lookZ);
            }
            var damp = 1 - Math.exp(-(orbitState && orbitState.active ? 10.5 : 6.2) * dt);
            camera.position.lerp(_camTargetPos, damp);
            _camCurLook.lerp(_camTargetLook, damp);
            if (Math.abs(camera.fov - targetFov) > 0.05) {
                camera.fov += (targetFov - camera.fov) * damp;
                camera.updateProjectionMatrix();
            }
            if (camCfg.dunkCameraShake && st.cameraShake > 0.01 && !(orbitState && orbitState.active)) {
                var shakeAmt = st.cameraShake * 0.24;
                camera.position.x += Math.sin(elapsedSec * 68) * shakeAmt;
                camera.position.y += Math.cos(elapsedSec * 57) * shakeAmt * 0.8;
            }
            camera.lookAt(_camCurLook);
            // Project 3D player head/feet + ball into 2D viewport coords (zero-GC)
            if (projOutRef.current && projOutRef.current.current) {
                var out = projOutRef.current.current;
                var vw = container.clientWidth || initW;
                var vh = container.clientHeight || initH;
                out.width = vw;
                out.height = vh;
                camera.updateMatrixWorld();
                for(var i1 = 0; i1 < st.players.length; i1++){
                    var pl1 = st.players[i1];
                    var headH = Math.max(1.75, (pl1.heightInches || 78) * 0.0254) + 0.35;
                    _projScratch.set(pl1.x, pl1.y + headH, pl1.z).project(camera);
                    var headVis = _projScratch.z > -1 && _projScratch.z < 1;
                    var hx = (_projScratch.x * 0.5 + 0.5) * vw;
                    var hy = (-_projScratch.y * 0.5 + 0.5) * vh;
                    _projScratch.set(pl1.x, 0.04, pl1.z).project(camera);
                    var fx1 = (_projScratch.x * 0.5 + 0.5) * vw;
                    var fy1 = (-_projScratch.y * 0.5 + 0.5) * vh;
                    var slot = out.players[pl1.id];
                    if (!slot) {
                        slot = {
                            headX: hx,
                            headY: hy,
                            feetX: fx1,
                            feetY: fy1,
                            visible: headVis && pl1.visible
                        };
                        out.players[pl1.id] = slot;
                    } else {
                        slot.headX = hx;
                        slot.headY = hy;
                        slot.feetX = fx1;
                        slot.feetY = fy1;
                        slot.visible = headVis && pl1.visible;
                    }
                }
                _projScratch.set(st.ball.x, st.ball.y, st.ball.z).project(camera);
                out.ball.x = (_projScratch.x * 0.5 + 0.5) * vw;
                out.ball.y = (-_projScratch.y * 0.5 + 0.5) * vh;
                out.ball.visible = _projScratch.z > -1 && _projScratch.z < 1;
            }
            renderer.render(scene, camera);
            // Sample FPS once per second
            fpsAccum += dt;
            fpsFrames += 1;
            if (fpsAccum >= 0.75) {
                if (fpsCbRef.current) {
                    fpsCbRef.current(Math.min(120, Math.max(15, Math.round(fpsFrames / fpsAccum))));
                }
                fpsAccum = 0;
                fpsFrames = 0;
            }
            afterDraw(tick);
        };
        if (capPngPropRef.current) {
            capPngPropRef.current.current = function() {
                if (disposed) return null;
                try {
                    renderer.render(scene, camera);
                    return renderer.domElement.toDataURL('image/png');
                } catch (unused) {
                    return null;
                }
            };
        }
        rafId = window.requestAnimationFrame(tick);
        return function() {
            disposed = true;
            if (capPngPropRef.current) {
                capPngPropRef.current.current = null;
            }
            window.cancelAnimationFrame(rafId);
            if (ro) ro.disconnect();
            window.removeEventListener('resize', handleResize);
            renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
            renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
            venueHandleRef.current = null;
            builtVenue.dispose();
            overlays.dispose();
            playerMeshes.forEach(function(pm) {
                return pm.dispose();
            });
            jerseyCache.dispose();
            ballGeo.dispose();
            ballMat.dispose();
            ballTex.dispose();
            ballShadowGeo.dispose();
            ballShadowMat.dispose();
            envTex.dispose();
            pmrem.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode === container) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [
        venue,
        homeTeam,
        awayTeam,
        homeJersey,
        awayJersey,
        streakStamp,
        matchStateRef
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h2k-court3d-wrap",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                ref: mountRef,
                className: "h2k-court3d-mount"
            }),
            contextLost && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-court3d-fallback",
                children: "WebGL 3D context interrupted — recovering arena renderer..."
            })
        ]
    });
};

});
// === MODULE: src/games/hoops-2k26/engine/CourtOverlays3D ===
ArcadeMod.define("src/games/hoops-2k26/engine/CourtOverlays3D", function(require, module, exports) {
// ============================================================================
// PART 3 — ON-COURT 3D FLOOR OVERLAYS (CourtOverlays3D.ts)
// Active Player Ring (Cyan 2K26 / Crimson 2K14), Stamina Arc, 3 Adrenaline
// Pips, Takeover Flame Ring, Who-To-Guard dotted arrow, 2K14 Shot Quality
// dots, Animated PlayVision 3D Floor Art, 9-Wedge Hot/Cold Heatmap, and
// Marked Enemy Star tactical reticle (DOUBLE / DENY / OVER / PACK).
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CourtOverlays3D", {
    enumerable: true,
    get: function() {
        return CourtOverlays3D;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _courtTypes = require("./courtTypes");
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
function _instanceof(left, right) {
    "@swc/helpers - instanceof";
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else return left instanceof right;
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
var Y_FLOOR = 0.022;
function createTextBadgeTexture(text, bgHex, fgHex) {
    if (fgHex === void 0) fgHex = '#ffffff';
    var c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    var ctx = c.getContext('2d');
    ctx.fillStyle = bgHex;
    ctx.fillRect(4, 4, 248, 56);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 56);
    ctx.fillStyle = fgHex;
    ctx.font = '900 30px Impact, Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 34);
    var tex = new _three.CanvasTexture(c);
    tex.colorSpace = _three.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
}
var CourtOverlays3D = /*#__PURE__*/ function() {
    "use strict";
    function CourtOverlays3D() {
        this.root = new _three.Group();
        // Active User Player Ring Cluster
        this.userCluster = new _three.Group();
        this.pipMeshes = [];
        // Marked Enemy Star Reticle
        this.markCluster = new _three.Group();
        this.markTextures = {};
        this.lastMarkTag = '';
        // PlayVision 3D Floor Art
        this.playVisionGroup = new _three.Group();
        this.playVisionLines = [];
        this.playVisionMarkers = [];
        this.currentPlayId = 'OFF';
        this.currentPlayDir = 1;
        // 9-Wedge Hot / Cold Floor Heatmap
        this.hotZoneGroup = new _three.Group();
        this.hotZoneMeshes = [];
        this.ownedGeos = [];
        this.ownedMats = [];
        // 1. Active Player Ring + Stamina Arc + 3 Adrenaline Pips + Takeover Flame Ring
        var ringGeo = this.trackGeo(new _three.RingGeometry(0.56, 0.72, 32));
        this.activeRingMat = this.trackMat(new _three.MeshBasicMaterial({
            color: 0x22d3ee,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.92,
            depthWrite: false
        }));
        var activeRing = new _three.Mesh(ringGeo, this.activeRingMat);
        activeRing.rotation.x = -Math.PI / 2;
        this.userCluster.add(activeRing);
        // Stamina Arc (outer thin ring scaled dynamically)
        var stamGeo = this.trackGeo(new _three.RingGeometry(0.75, 0.83, 28, 1, 0, Math.PI * 1.4));
        this.staminaMat = this.trackMat(new _three.MeshBasicMaterial({
            color: 0x22c55e,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.86,
            depthWrite: false
        }));
        this.staminaMesh = new _three.Mesh(stamGeo, this.staminaMat);
        this.staminaMesh.rotation.x = -Math.PI / 2;
        this.userCluster.add(this.staminaMesh);
        // 3 Adrenaline Pips
        var pipGeo = this.trackGeo(new _three.CircleGeometry(0.085, 12));
        for(var i = 0; i < 3; i++){
            var pipMat = this.trackMat(new _three.MeshBasicMaterial({
                color: 0xfacc15,
                side: _three.DoubleSide,
                transparent: true,
                opacity: 0.95,
                depthWrite: false
            }));
            var pip = new _three.Mesh(pipGeo, pipMat);
            pip.rotation.x = -Math.PI / 2;
            var ang = -0.35 + i * 0.35;
            pip.position.set(Math.cos(ang) * 0.96, 0.004, Math.sin(ang) * 0.96);
            this.pipMeshes.push(pip);
            this.userCluster.add(pip);
        }
        // Takeover Flame Ring
        var tkGeo = this.trackGeo(new _three.RingGeometry(0.84, 1.04, 32));
        this.takeoverMat = this.trackMat(new _three.MeshBasicMaterial({
            color: 0xf97316,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0,
            depthWrite: false
        }));
        this.takeoverRing = new _three.Mesh(tkGeo, this.takeoverMat);
        this.takeoverRing.rotation.x = -Math.PI / 2;
        this.userCluster.add(this.takeoverRing);
        // 2K14 Shot Quality Dot (Green/Yellow/Red)
        var sqGeo = this.trackGeo(new _three.CircleGeometry(0.13, 14));
        this.shotQualityMat = this.trackMat(new _three.MeshBasicMaterial({
            color: 0x22c55e,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.9,
            depthWrite: false
        }));
        this.shotQualityDot = new _three.Mesh(sqGeo, this.shotQualityMat);
        this.shotQualityDot.rotation.x = -Math.PI / 2;
        this.shotQualityDot.position.set(0.92, 0.005, 0);
        this.userCluster.add(this.shotQualityDot);
        this.userCluster.position.y = Y_FLOOR + 0.004;
        this.root.add(this.userCluster);
        // 2. Who-To-Guard Arrow
        var arrowGeo = this.trackGeo(new _three.PlaneGeometry(0.22, 1.1));
        var arrowMat = this.trackMat(new _three.MeshBasicMaterial({
            color: 0x38bdf8,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.72,
            depthWrite: false
        }));
        this.guardArrow = new _three.Mesh(arrowGeo, arrowMat);
        this.guardArrow.rotation.x = -Math.PI / 2;
        this.guardArrow.position.y = Y_FLOOR + 0.003;
        this.root.add(this.guardArrow);
        // 3. Marked Enemy Star Reticle (DOUBLE / DENY / OVER / PACK)
        var markGeo = this.trackGeo(new _three.RingGeometry(0.66, 0.84, 24));
        var markMat = this.trackMat(new _three.MeshBasicMaterial({
            color: 0xef4444,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.9,
            depthWrite: false
        }));
        this.markRing = new _three.Mesh(markGeo, markMat);
        this.markRing.rotation.x = -Math.PI / 2;
        this.markCluster.add(this.markRing);
        this.markTextures.DOUBLE = createTextBadgeTexture('DOUBLE TEAM', '#dc2626');
        this.markTextures.DENY = createTextBadgeTexture('DENY BALL', '#ea580c');
        this.markTextures.OVER = createTextBadgeTexture('GO OVER', '#2563eb');
        this.markTextures.PACK = createTextBadgeTexture('PACK PAINT', '#7c3aed');
        this.markLabelMat = this.trackMat(new _three.SpriteMaterial({
            map: this.markTextures.OVER,
            transparent: true,
            depthTest: false
        }));
        var labelSprite = new _three.Sprite(this.markLabelMat);
        labelSprite.position.set(0, 2.55, 0);
        labelSprite.scale.set(1.45, 0.36, 1);
        this.markCluster.add(labelSprite);
        this.markCluster.position.y = Y_FLOOR + 0.005;
        this.root.add(this.markCluster);
        // 4. PlayVision 3D Floor Art Group
        this.playVisionGroup.position.y = Y_FLOOR + 0.006;
        this.root.add(this.playVisionGroup);
        // 5. 9-Wedge Hot / Cold Floor Heatmap
        this.buildHotZonePads();
        this.hotZoneGroup.position.y = Y_FLOOR;
        this.root.add(this.hotZoneGroup);
    }
    var _proto = CourtOverlays3D.prototype;
    _proto.trackGeo = function trackGeo(g) {
        this.ownedGeos.push(g);
        return g;
    };
    _proto.trackMat = function trackMat(m) {
        this.ownedMats.push(m);
        return m;
    };
    _proto.buildHotZonePads = function buildHotZonePads() {
        // 9 court zones positioned relative to +X halfcourt (flipped by scale.x = attackDirX)
        var specs = [
            {
                key: 'paint',
                x: 11.4,
                z: 0,
                rx: 1.85,
                rz: 1.95
            },
            {
                key: 'leftMid',
                x: 9.2,
                z: -3.8,
                rx: 1.7,
                rz: 1.6
            },
            {
                key: 'topMid',
                x: 7.4,
                z: 0,
                rx: 1.75,
                rz: 1.9
            },
            {
                key: 'rightMid',
                x: 9.2,
                z: 3.8,
                rx: 1.7,
                rz: 1.6
            },
            {
                key: 'leftCorner3',
                x: 12.2,
                z: -6.8,
                rx: 1.75,
                rz: 0.85
            },
            {
                key: 'rightCorner3',
                x: 12.2,
                z: 6.8,
                rx: 1.75,
                rz: 0.85
            },
            {
                key: 'leftWing3',
                x: 6.6,
                z: -5.8,
                rx: 2.1,
                rz: 1.45
            },
            {
                key: 'topKey3',
                x: 4.7,
                z: 0,
                rx: 1.8,
                rz: 2.4
            },
            {
                key: 'rightWing3',
                x: 6.6,
                z: 5.8,
                rx: 2.1,
                rz: 1.45
            }
        ];
        for(var _iterator = _create_for_of_iterator_helper_loose(specs), _step; !(_step = _iterator()).done;){
            var sp = _step.value;
            var geo = this.trackGeo(new _three.CircleGeometry(1, 20));
            var mat = this.trackMat(new _three.MeshBasicMaterial({
                color: 0x94a3b8,
                side: _three.DoubleSide,
                transparent: true,
                opacity: 0.24,
                depthWrite: false
            }));
            var mesh = new _three.Mesh(geo, mat);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.set(sp.rx, sp.rz, 1);
            mesh.position.set(sp.x, 0, sp.z);
            this.hotZoneGroup.add(mesh);
            this.hotZoneMeshes.push({
                key: sp.key,
                mat: mat
            });
        }
    };
    _proto.rebuildPlayVision = function rebuildPlayVision(play, dir) {
        // Dispose previous play geometries/materials cleanly
        while(this.playVisionGroup.children.length > 0){
            var ch = this.playVisionGroup.children.pop();
            if (_instanceof(ch, _three.Line) || _instanceof(ch, _three.Mesh)) {
                ch.geometry.dispose();
                if (Array.isArray(ch.material)) ch.material.forEach(function(m) {
                    return m.dispose();
                });
                else ch.material.dispose();
            }
        }
        this.playVisionLines.length = 0;
        this.playVisionMarkers.length = 0;
        this.currentPlayId = play;
        this.currentPlayDir = dir;
        if (play === 'OFF') return;
        var routes = [];
        if (play === 'PICK_AND_ROLL') {
            routes.push({
                pts: [
                    [
                        3.8,
                        0.2
                    ],
                    [
                        6.6,
                        1.4
                    ],
                    [
                        9.8,
                        2.2
                    ]
                ],
                color: 0x22d3ee
            });
            routes.push({
                pts: [
                    [
                        10.4,
                        2.1
                    ],
                    [
                        6.8,
                        1.1
                    ],
                    [
                        11.2,
                        0.3
                    ]
                ],
                color: 0xfacc15,
                screenEnd: true
            });
            routes.push({
                pts: [
                    [
                        7.8,
                        -5.6
                    ],
                    [
                        11.6,
                        -6.5
                    ]
                ],
                color: 0x38bdf8
            });
        } else if (play === 'FIVE_OUT') {
            routes.push({
                pts: [
                    [
                        3.8,
                        0.2
                    ],
                    [
                        5.8,
                        -3.5
                    ],
                    [
                        8.5,
                        -5.6
                    ]
                ],
                color: 0x22d3ee
            });
            routes.push({
                pts: [
                    [
                        7.6,
                        5.6
                    ],
                    [
                        11.8,
                        6.6
                    ]
                ],
                color: 0x38bdf8
            });
            routes.push({
                pts: [
                    [
                        9.6,
                        -2.8
                    ],
                    [
                        5.6,
                        -5.4
                    ]
                ],
                color: 0xfacc15
            });
        } else if (play === 'MOTION_CUT') {
            routes.push({
                pts: [
                    [
                        7.8,
                        -5.6
                    ],
                    [
                        9.8,
                        -1.8
                    ],
                    [
                        11.2,
                        0.4
                    ]
                ],
                color: 0x22d3ee
            });
            routes.push({
                pts: [
                    [
                        7.6,
                        5.6
                    ],
                    [
                        5.6,
                        2.2
                    ],
                    [
                        7.2,
                        -4.8
                    ]
                ],
                color: 0x38bdf8
            });
            routes.push({
                pts: [
                    [
                        9.6,
                        -2.4
                    ],
                    [
                        8.2,
                        -1.4
                    ]
                ],
                color: 0xfacc15,
                screenEnd: true
            });
        } else if (play === 'HORNS') {
            routes.push({
                pts: [
                    [
                        9.6,
                        -2.8
                    ],
                    [
                        6.5,
                        -2.0
                    ]
                ],
                color: 0xfacc15,
                screenEnd: true
            });
            routes.push({
                pts: [
                    [
                        10.8,
                        1.9
                    ],
                    [
                        6.5,
                        2.0
                    ]
                ],
                color: 0xfacc15,
                screenEnd: true
            });
            routes.push({
                pts: [
                    [
                        3.8,
                        0.2
                    ],
                    [
                        7.2,
                        -1.6
                    ],
                    [
                        10.6,
                        -0.8
                    ]
                ],
                color: 0x22d3ee
            });
        } else if (play === 'FLOPPY') {
            routes.push({
                pts: [
                    [
                        10.8,
                        0.2
                    ],
                    [
                        9.2,
                        -2.5
                    ],
                    [
                        6.8,
                        -5.4
                    ]
                ],
                color: 0x22d3ee
            });
            routes.push({
                pts: [
                    [
                        10.6,
                        1.8
                    ],
                    [
                        9.1,
                        2.6
                    ],
                    [
                        6.8,
                        5.4
                    ]
                ],
                color: 0x38bdf8
            });
            routes.push({
                pts: [
                    [
                        8.8,
                        -2.2
                    ],
                    [
                        8.8,
                        -2.8
                    ]
                ],
                color: 0xfacc15,
                screenEnd: true
            });
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(routes), _step; !(_step = _iterator()).done;){
            var r = _step.value;
            var vecs = r.pts.map(function(param) {
                var x = param[0], z = param[1];
                return new _three.Vector3(x * dir, 0, z);
            });
            var curve = new _three.CatmullRomCurve3(vecs);
            var sampled = curve.getPoints(24);
            var geo = new _three.BufferGeometry().setFromPoints(sampled);
            var mat = new _three.LineBasicMaterial({
                color: r.color,
                transparent: true,
                opacity: 0.88
            });
            var line = new _three.Line(geo, mat);
            this.playVisionGroup.add(line);
            this.playVisionLines.push(line);
            var endPt = vecs[vecs.length - 1];
            var markerGeo = r.screenEnd ? new _three.RingGeometry(0.32, 0.48, 18) : new _three.CircleGeometry(0.28, 16);
            var markerMat = new _three.MeshBasicMaterial({
                color: r.color,
                side: _three.DoubleSide,
                transparent: true,
                opacity: 0.85,
                depthWrite: false
            });
            var marker = new _three.Mesh(markerGeo, markerMat);
            marker.rotation.x = -Math.PI / 2;
            marker.position.set(endPt.x, 0.002, endPt.z);
            this.playVisionGroup.add(marker);
            this.playVisionMarkers.push(marker);
        }
    };
    _proto.update = function update(state, visual, era, elapsedSec) {
        var showIcons = visual.showPlayerIcons;
        var userPl = state.players.find(function(p) {
            return p.isUserControlled && p.visible;
        }) || state.players[0];
        // 1. Active Player Floor Ring + Stamina + Adrenaline Pips + Takeover Flame
        this.userCluster.visible = showIcons && Boolean(userPl);
        if (userPl && showIcons) {
            this.userCluster.position.set(userPl.x, Y_FLOOR + 0.004, userPl.z);
            this.activeRingMat.color.setHex((0, _courtTypes.getActiveRingColorHex)(era));
            var stam = Math.max(0.08, Math.min(1, userPl.stamina));
            this.staminaMesh.scale.set(0.82 + stam * 0.22, 0.82 + stam * 0.22, 1);
            this.staminaMat.color.setHex(stam > 0.5 ? 0x22c55e : stam > 0.25 ? 0xf59e0b : 0xef4444);
            for(var i = 0; i < this.pipMeshes.length; i++){
                this.pipMeshes[i].visible = i < userPl.adrenalinePips;
            }
            if (userPl.takeoverLevel >= 0.75) {
                this.takeoverRing.visible = true;
                var pulse = 1 + Math.sin(elapsedSec * 7.5) * 0.1;
                this.takeoverRing.scale.set(pulse, pulse, 1);
                this.takeoverMat.opacity = 0.45 + Math.sin(elapsedSec * 7.5) * 0.25;
            } else {
                this.takeoverRing.visible = false;
            }
            if (userPl.shotQuality2K14 === 'NONE') {
                this.shotQualityDot.visible = false;
            } else {
                this.shotQualityDot.visible = true;
                this.shotQualityMat.color.setHex(userPl.shotQuality2K14 === 'GREEN' ? 0x22c55e : userPl.shotQuality2K14 === 'YELLOW' ? 0xfacc15 : 0xef4444);
            }
            // Who-To-Guard Dotted Indicator Arrow
            var guardTarget = state.players.find(function(p) {
                return p.id === userPl.guardTargetId && p.visible;
            });
            if (guardTarget && userPl.teamSide !== state.possession) {
                this.guardArrow.visible = true;
                var dx = guardTarget.x - userPl.x;
                var dz = guardTarget.z - userPl.z;
                var ang = Math.atan2(dx, dz);
                this.guardArrow.position.set(userPl.x + Math.sin(ang) * 1.15, Y_FLOOR + 0.003, userPl.z + Math.cos(ang) * 1.15);
                this.guardArrow.rotation.z = -ang;
            } else {
                this.guardArrow.visible = false;
            }
        } else {
            this.guardArrow.visible = false;
        }
        // 2. Marked Enemy Star Tactical Reticle
        var markedPl = state.markedStar.playerId ? state.players.find(function(p) {
            return p.id === state.markedStar.playerId && p.visible;
        }) : null;
        if (markedPl && showIcons) {
            this.markCluster.visible = true;
            this.markCluster.position.set(markedPl.x, Y_FLOOR + 0.005, markedPl.z);
            var pulse1 = 1 + Math.sin(elapsedSec * 5.2) * 0.08;
            this.markRing.scale.set(pulse1, pulse1, 1);
            if (this.lastMarkTag !== state.markedStar.tag) {
                this.lastMarkTag = state.markedStar.tag;
                var tex = this.markTextures[state.markedStar.tag] || this.markTextures.OVER;
                this.markLabelMat.map = tex;
                this.markLabelMat.needsUpdate = true;
            }
        } else {
            this.markCluster.visible = false;
        }
        // 3. PlayVision 3D Floor Art
        var desiredPlay = visual.playVision !== 'OFF' ? visual.playVision : state.activePlay;
        if (desiredPlay !== this.currentPlayId || state.attackDirX !== this.currentPlayDir) {
            this.rebuildPlayVision(desiredPlay, state.attackDirX);
        }
        if (this.playVisionMarkers.length > 0) {
            var mPulse = 0.92 + Math.sin(elapsedSec * 4.5) * 0.14;
            for(var i1 = 0; i1 < this.playVisionMarkers.length; i1++){
                this.playVisionMarkers[i1].scale.set(mPulse, mPulse, 1);
            }
        }
        // 4. 9-Wedge Hot / Cold Floor Heatmap
        if (visual.hotColdZones === 'OFF') {
            this.hotZoneGroup.visible = false;
        } else {
            this.hotZoneGroup.visible = true;
            this.hotZoneGroup.scale.x = state.attackDirX;
            var handler = state.players.find(function(p) {
                return p.hasBall && p.visible;
            }) || userPl || state.players[0];
            if (handler) {
                var hz = handler.hotZones;
                var baseAlpha = visual.hotColdZones === 'ALL' ? 0.34 : 0.24;
                for(var i2 = 0; i2 < this.hotZoneMeshes.length; i2++){
                    var item = this.hotZoneMeshes[i2];
                    var zoneState = hz[item.key];
                    item.mat.color.setHex((0, _courtTypes.hotZoneColorHex)(zoneState));
                    item.mat.opacity = zoneState === 0 ? 0.07 : baseAlpha + Math.sin(elapsedSec * 2.5 + i2) * 0.04;
                }
            }
        }
    };
    _proto.dispose = function dispose() {
        this.rebuildPlayVision('OFF', 1);
        this.ownedGeos.forEach(function(g) {
            return g.dispose();
        });
        this.ownedMats.forEach(function(m) {
            return m.dispose();
        });
        Object.values(this.markTextures).forEach(function(t) {
            return t.dispose();
        });
    };
    return CourtOverlays3D;
}();

});
// === MODULE: src/games/hoops-2k26/engine/LiveCourtStage ===
ArcadeMod.define("src/games/hoops-2k26/engine/LiveCourtStage", function(require, module, exports) {
// ============================================================================
// PART 5 — LIVE 3D COURT STAGE (LiveCourtStage.tsx)
// Unifies:
// - 60 FPS BasketballSimulation (ProPLAY Gameplay + Tactics + Replay Engine)
// - Three.js Court3D with Zero-GC 3D-to-2D Projected Anchors
// - MatchHUD (Exact Dual-Era 2K14 Classic / 2K26 Next-Gen / Blacktop Scorebugs,
//   Circular Teammate Grade, Shot Feedback, 5-Tier Badges, Splash Banners,
//   3D-Projected Alley-Oop & Icon Passing Overlays)
// - ShotMeterOverlay (All 5 Authentic 3D-Projected Shot Meter Styles + Skill Dunk)
// - TacticalRadarAndMarking (Compact/Expandable Mini-Court Radar, Enemy Star
//   Marking, Pick & Roll 45°/180° Angle & Roll/Fade, Sets, Schemes, Subs, Timeouts)
// - TouchControlsOverlay (Auto-Touch + Desktop-Toggleable Dual-Stick Virtual Pads)
// - PauseMenuModal (Resume, 4s Instant Replay Scrubber, Box Score, Gameplan, Cams)
// - Simultaneous Desktop (Keyboard + Right-Click/Arrow Rhythm + Gamepad) + Touch
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LiveCourtStage", {
    enumerable: true,
    get: function() {
        return LiveCourtStage;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _Court3D = require("./Court3D");
var _courtTypes = require("./courtTypes");
var _BasketballSimulation = require("./BasketballSimulation");
var _SimTacticsAndReplay = require("./SimTacticsAndReplay");
var _MatchHUD = require("../hud/MatchHUD");
var _ShotMeterOverlay = require("../hud/ShotMeterOverlay");
var _TacticalRadarAndMarking = require("../hud/TacticalRadarAndMarking");
var _TouchControlsOverlay = require("../hud/TouchControlsOverlay");
var _PauseMenuModal = require("../hud/PauseMenuModal");
require("../hud/matchHud.css");
var _rosterStore = require("../hybrid/rosterStore");
var _store = require("../hybrid/store");
var _audioEngine = require("../hybrid/audioEngine");
var _modesStore = require("../modes/modesStore");
var _ModeObjectiveOverlay = require("../modes/ModeObjectiveOverlay");
var _InstantReplayModal = require("../part7/InstantReplayModal");
var _PostMatchScreen = require("../part7/PostMatchScreen");
var _CustomHudEditor = require("../part7/CustomHudEditor");
var _SettingsModal = require("../part7/SettingsModal");
require("../part7/part7Hud.css");
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
function detectTouchCapableDevice() {
    if (typeof window === 'undefined') return false;
    return Boolean('ontouchstart' in window || typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0 || window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
}
var LiveCourtStage = function LiveCourtStage(param) {
    var onExitToMenu = param.onExitToMenu, onReturnToCity = param.onReturnToCity, _onOpenSettings = param.onOpenSettings, onLaunchLegacyCourt = param.onLaunchLegacyCourt, onNotify = param.onNotify;
    var _hud_controlledTakeover;
    var save = (0, _store.useUltimateHybridStore)();
    var rosterSnap = (0, _rosterStore.useRosterStore)();
    var config = save.activeMatchConfig;
    var era = save.uiEraMode;
    var homeTeam = (0, _react.useMemo)(function() {
        return _rosterStore.RosterStore.getTeamById(config.homeTeamId);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        config.homeTeamId,
        rosterSnap.revision
    ]);
    var awayTeam = (0, _react.useMemo)(function() {
        return _rosterStore.RosterStore.getTeamById(config.awayTeamId);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        config.awayTeamId,
        rosterSnap.revision
    ]);
    var _useState = (0, _react.useState)(0), rematchNonce = _useState[0], setRematchNonce = _useState[1];
    var _useState1 = (0, _react.useState)(60), fps = _useState1[0], setFps = _useState1[1];
    var _useState2 = (0, _react.useState)(16), frameMs = _useState2[0], setFrameMs = _useState2[1];
    var _useState3 = (0, _react.useState)(false), tacticsExpanded = _useState3[0], setTacticsExpanded = _useState3[1];
    var _useState4 = (0, _react.useState)(false), pauseOpen = _useState4[0], setPauseOpen = _useState4[1];
    var _useState5 = (0, _react.useState)(false), replayOpen = _useState5[0], setReplayOpen = _useState5[1];
    var _useState6 = (0, _react.useState)(null), inMatchSettingsTab = _useState6[0], setInMatchSettingsTab = _useState6[1];
    var _useState7 = (0, _react.useState)(false), hudEditorOpen = _useState7[0], setHudEditorOpen = _useState7[1];
    var _useState8 = (0, _react.useState)(null), matchPayout = _useState8[0], setMatchPayout = _useState8[1];
    var _useState9 = (0, _react.useState)(null), modeOutcomeSummary = _useState9[0], setModeOutcomeSummary = _useState9[1];
    var _useState10 = (0, _react.useState)(function() {
        return _audioEngine.HybridAudioEngine.getBeatsSnapshot();
    }), beats = _useState10[0], setBeats = _useState10[1];
    var _useState11 = (0, _react.useState)(function() {
        return detectTouchCapableDevice();
    }), isTouchDevice = _useState11[0];
    var _useState12 = (0, _react.useState)(null), desktopTouchOverride = _useState12[0], setDesktopTouchOverride = _useState12[1];
    var activeLaunchPayload = _modesStore.ModesStore.getActiveLaunchPayload();
    var replayOrbitRef = (0, _react.useRef)((0, _SimTacticsAndReplay.createDefaultReplayOrbit)());
    var capturePngRef = (0, _react.useRef)(null);
    var matchSettledRef = (0, _react.useRef)(false);
    (0, _react.useEffect)(function() {
        return _audioEngine.HybridAudioEngine.subscribe(setBeats);
    }, []);
    var createSim = (0, _react.useCallback)(function() {
        var payload = _modesStore.ModesStore.getActiveLaunchPayload();
        var resolvedHomeTeam = (payload == null ? void 0 : payload.customHomeRoster) && payload.customHomeRoster.length > 0 ? _extends({}, homeTeam, {
            roster: payload.customHomeRoster
        }) : homeTeam;
        var resolvedAwayTeam = (payload == null ? void 0 : payload.customAwayRoster) && payload.customAwayRoster.length > 0 ? _extends({}, awayTeam, {
            roster: payload.customAwayRoster
        }) : awayTeam;
        return new _BasketballSimulation.BasketballSimulation({
            awayTeam: resolvedAwayTeam,
            homeTeam: resolvedHomeTeam,
            config: config,
            settings: _store.UltimateHybridStore.getState().settings,
            scenarioOverride: payload ? {
                startQuarter: payload.startQuarter,
                startClockSec: payload.startClockSec,
                startHomeScore: payload.startHomeScore,
                startAwayScore: payload.startAwayScore,
                threePointValue: payload.threePointValue,
                twoPointValue: payload.twoPointValue,
                speedMultiplier: payload.speedMultiplier,
                forceGreenOrMiss: payload.forceGreenOrMiss,
                staminaBonus: payload.staminaBonus,
                instantTakeover: payload.instantTakeover
            } : null,
            hooks: {
                onDribble: function onDribble() {
                    return _audioEngine.HybridAudioEngine.playDribble();
                },
                onSwish: function onSwish(isChain) {
                    return _audioEngine.HybridAudioEngine.playSwish(isChain);
                },
                onGreenRelease: function onGreenRelease() {
                    return _audioEngine.HybridAudioEngine.playGreenRelease();
                },
                onRimClank: function onRimClank() {
                    return _audioEngine.HybridAudioEngine.playRimClank();
                },
                onDunkSlam: function onDunkSlam() {
                    return _audioEngine.HybridAudioEngine.playDunkSlam();
                },
                onWhistle: function onWhistle() {
                    return _audioEngine.HybridAudioEngine.playWhistle();
                },
                onBuzzer: function onBuzzer() {
                    return _audioEngine.HybridAudioEngine.playBuzzer();
                },
                onCrowdRoar: function onCrowdRoar(intensity) {
                    return _audioEngine.HybridAudioEngine.playCrowdRoar(intensity);
                },
                onAnnounce: function onAnnounce(line) {
                    return _audioEngine.HybridAudioEngine.announce(line);
                }
            }
        });
    }, [
        awayTeam,
        homeTeam,
        config
    ]);
    var simRef = (0, _react.useRef)(null);
    if (!simRef.current) {
        simRef.current = createSim();
    }
    var matchStateRef = (0, _react.useRef)(simRef.current.renderState);
    var projectedAnchorsRef = (0, _react.useRef)((0, _SimTacticsAndReplay.createEmptyProjectedAnchors)());
    var _useState13 = (0, _react.useState)(function() {
        return simRef.current.getHudSnapshot();
    }), hud = _useState13[0], setHud = _useState13[1];
    // Live input refs (zero React re-renders per frame)
    var keysRef = (0, _react.useRef)({});
    var touchStickRef = (0, _react.useRef)({
        rawRight: 0,
        rawForward: 0,
        sprintLocked: false
    });
    var touchHoldRef = (0, _react.useRef)({
        shoot: false,
        protect: false,
        sprint: false,
        handsUp: false
    });
    var proStickDragRef = (0, _react.useRef)({
        active: false,
        startY: 0,
        pulledDown: false,
        lastY: 0,
        lastTs: 0
    });
    var arrowRhythmArmedRef = (0, _react.useRef)(false);
    var rightStickArmedRef = (0, _react.useRef)(false);
    var hudSyncAccumRef = (0, _react.useRef)(0);
    var prevGamepadBtnsRef = (0, _react.useRef)([]);
    // Rebuild simulation cleanly when teams, playersPerSide, sideControl, or rematch changes
    (0, _react.useEffect)(function() {
        var nextSim = createSim();
        simRef.current = nextSim;
        matchStateRef.current = nextSim.renderState;
        matchSettledRef.current = false;
        replayOrbitRef.current.active = false;
        setPauseOpen(false);
        setReplayOpen(false);
        setInMatchSettingsTab(null);
        setHudEditorOpen(false);
        setMatchPayout(null);
        setModeOutcomeSummary(null);
        setHud(nextSim.getHudSnapshot());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        homeTeam.id,
        awayTeam.id,
        config.playersPerSide,
        config.sideControl,
        config.targetScore,
        rematchNonce,
        rosterSnap.revision
    ]);
    // Live settings sync (zero WebGL remount)
    (0, _react.useEffect)(function() {
        var _simRef_current;
        (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.syncSettings(save.settings);
    }, [
        save.settings
    ]);
    var anyModalPaused = pauseOpen || replayOpen || Boolean(inMatchSettingsTab) || hudEditorOpen;
    // Sync Pause Gate directly into BasketballSimulation
    (0, _react.useEffect)(function() {
        var _simRef_current;
        (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.setPaused(anyModalPaused);
        if (simRef.current) {
            setHud(simRef.current.getHudSnapshot());
        }
    }, [
        anyModalPaused
    ]);
    // Settle Career Profile, Shot Chart & VC/MTP/XP payout once per completed match
    (0, _react.useEffect)(function() {
        var _hud_userTeamSide;
        if (hud.phase !== 'GAME_OVER' || matchSettledRef.current) return;
        matchSettledRef.current = true;
        var userSide = (_hud_userTeamSide = hud.userTeamSide) != null ? _hud_userTeamSide : 'HOME';
        var userScore = userSide === 'HOME' ? hud.homeScore : hud.awayScore;
        var oppScore = userSide === 'HOME' ? hud.awayScore : hud.homeScore;
        var userRows = hud.boxScore.filter(function(r) {
            return r.teamSide === userSide;
        });
        var sum = function sum(fn) {
            return userRows.reduce(function(acc, r) {
                return acc + fn(r);
            }, 0);
        };
        var topPlayerPts = userRows.reduce(function(mx, r) {
            return Math.max(mx, r.pts);
        }, 0);
        var userShots = hud.matchShots.filter(function(s) {
            return s.teamSide === userSide;
        });
        var greenThreesMade = userShots.filter(function(s) {
            return s.made && s.isThree && s.isGreen;
        }).length;
        var isPark = config.playersPerSide <= 3 || config.venue === 'SKYLINE_PARK' || config.venue === 'STREET_KINGS' || config.venue === 'BLACKTOP_CAGE' || config.venue === 'RIVET_CITY';
        var payout = _store.UltimateHybridStore.commitCompletedMatch({
            userWon: userScore >= oppScore,
            userTeamPts: userScore,
            userTeamReb: sum(function(r) {
                return r.reb;
            }),
            userTeamAst: sum(function(r) {
                return r.ast;
            }),
            userTeamStl: sum(function(r) {
                return r.stl;
            }),
            userTeamBlk: sum(function(r) {
                return r.blk;
            }),
            userTeamFgm: sum(function(r) {
                return r.fgm;
            }),
            userTeamFga: sum(function(r) {
                return r.fga;
            }),
            userTeamTpm: sum(function(r) {
                return r.tpm;
            }),
            userTeamTpa: sum(function(r) {
                return r.tpa;
            }),
            greensMade: sum(function(r) {
                return r.greens;
            }),
            greenThreesMade: greenThreesMade,
            topPlayerPts: topPlayerPts,
            teammateGradeScore: hud.teammateGrade.score,
            isBlacktopOrPark: isPark,
            matchShots: userShots.map(function(s) {
                return {
                    x: s.x,
                    y: s.y,
                    made: s.made,
                    isThree: s.isThree,
                    isGreen: s.isGreen
                };
            })
        });
        setMatchPayout(payout);
    }, [
        hud,
        config.playersPerSide,
        config.venue
    ]);
    var cameraConfig = (0, _react.useMemo)(function() {
        return {
            angle: save.settings.camera.angle,
            zoom: save.settings.camera.zoom,
            height: save.settings.camera.height,
            autoFlip: save.settings.camera.autoFlip,
            keyZoom: save.settings.camera.keyZoom,
            reverseAngle: save.settings.camera.reverseAngle,
            dunkCameraShake: save.settings.camera.dunkCameraShake
        };
    }, [
        save.settings.camera
    ]);
    var visualConfig = (0, _react.useMemo)(function() {
        return {
            hardwoodReflections: save.settings.visual.hardwoodReflections,
            hotColdZones: save.settings.visual.hotColdZones,
            playVision: save.settings.visual.playVision,
            showPlayerIcons: save.settings.visual.showPlayerIcons,
            cinema3DQuality: save.settings.visual.cinema3DQuality
        };
    }, [
        save.settings.visual
    ]);
    var cycleCamera = (0, _react.useCallback)(function() {
        var cur = _store.UltimateHybridStore.getState().settings.camera.angle;
        var idx = _courtTypes.CAMERA_ORDER.indexOf(cur);
        var next = _courtTypes.CAMERA_ORDER[(idx + 1) % _courtTypes.CAMERA_ORDER.length];
        _store.UltimateHybridStore.updateSettings('camera', {
            angle: next
        });
        _audioEngine.HybridAudioEngine.playUi('switch', era);
        var meta = _courtTypes.CAMERA_ANGLE_OPTIONS.find(function(c) {
            return c.id === next;
        });
        onNotify("Camera: " + (meta ? meta.label : next));
    }, [
        era,
        onNotify
    ]);
    var toggleLiveHudEra = (0, _react.useCallback)(function() {
        var curSb = _store.UltimateHybridStore.getState().settings.visual.scoreboardEra;
        var curUiEra = _store.UltimateHybridStore.getState().uiEraMode;
        var isCurrently2K14 = curSb === '2K14_METALLIC' || curSb === 'AUTO' && curUiEra === '2K14_CLASSIC';
        var nextSb = isCurrently2K14 ? '2K26_OBSIDIAN' : '2K14_METALLIC';
        _store.UltimateHybridStore.updateSettings('visual', {
            scoreboardEra: nextSb
        });
        _audioEngine.HybridAudioEngine.playUi('switch', era);
        onNotify(nextSb === '2K14_METALLIC' ? 'HUD Era: NBA 2K14 Classic' : 'HUD Era: NBA 2K26 Next-Gen');
    }, [
        era,
        onNotify
    ]);
    var touchControlsVisible = (0, _react.useMemo)(function() {
        if (desktopTouchOverride !== null) return desktopTouchOverride;
        var pref = save.settings.controller.showVirtualTouchControls;
        if (pref === 'ALWAYS') return true;
        if (pref === 'OFF') return false;
        return isTouchDevice;
    }, [
        desktopTouchOverride,
        save.settings.controller.showVirtualTouchControls,
        isTouchDevice
    ]);
    var toggleTouchControls = (0, _react.useCallback)(function() {
        setDesktopTouchOverride(function(prev) {
            var next = prev === null ? !touchControlsVisible : !prev;
            onNotify(next ? 'Virtual Dual-Stick Pad: ON' : 'Virtual Dual-Stick Pad: OFF');
            return next;
        });
    }, [
        touchControlsVisible,
        onNotify
    ]);
    // ==========================================================================
    // FULL PART 5 + PART 7 CUSTOMIZABLE KEYBOARD BINDINGS
    // Honors save.settings.controller.keybinds while keeping WASD + Arrows Rhythm
    // ==========================================================================
    (0, _react.useEffect)(function() {
        var onKeyDown = function onKeyDown(e) {
            var _e_target;
            var tag = (_e_target = e.target) == null ? void 0 : _e_target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            var sim = simRef.current;
            if (!sim) return;
            var kb = _store.UltimateHybridStore.getState().settings.controller.keybinds;
            if (e.code === kb.pause || e.code === 'Escape') {
                e.preventDefault();
                if (hudEditorOpen) {
                    setHudEditorOpen(false);
                } else if (inMatchSettingsTab) {
                    setInMatchSettingsTab(null);
                } else if (replayOpen) {
                    sim.restoreLiveFromReplay();
                    replayOrbitRef.current.active = false;
                    setReplayOpen(false);
                } else {
                    setPauseOpen(function(prev) {
                        return !prev;
                    });
                }
                return;
            }
            if (sim.isPaused()) return;
            var wasDown = Boolean(keysRef.current[e.code]);
            keysRef.current[e.code] = true;
            if (e.code === kb.shoot || e.code === 'Space') {
                e.preventDefault();
                if (!wasDown) {
                    var curHud = sim.getHudSnapshot();
                    if (curHud.phase === 'JUMP_BALL') {
                        sim.triggerJumpBallAttempt();
                    } else if (curHud.phase === 'FREE_THROW') {
                        sim.releaseUserFreeThrow();
                    } else if (curHud.userTeamSide && curHud.possession !== curHud.userTeamSide) {
                        sim.triggerLobOrBlock();
                    }
                }
                return;
            }
            if (e.code === kb.iconPass || e.code === 'Tab') {
                e.preventDefault();
                if (!wasDown) sim.toggleIconPassing();
                return;
            }
            if (wasDown) return;
            // Arrow Keys Down -> Up 2K26 Rhythm Shooting
            if (e.code === 'ArrowDown') {
                e.preventDefault();
                arrowRhythmArmedRef.current = true;
                sim.startRhythmShotDown();
                return;
            }
            if (e.code === 'ArrowUp' && arrowRhythmArmedRef.current) {
                e.preventDefault();
                arrowRhythmArmedRef.current = false;
                sim.flickRhythmShotUp(1.0);
                return;
            }
            var curHud1 = sim.getHudSnapshot();
            // Mid-Air Alley-Oop Finish Prompt Keys (A / B / X / Y)
            if (curHud1.alleyOopPrompt.active) {
                var keyMap = {
                    KeyA: 'A',
                    KeyB: 'B',
                    KeyX: 'X',
                    KeyY: 'Y'
                };
                if (keyMap[e.code]) {
                    e.preventDefault();
                    sim.submitAlleyOopFinishKey(keyMap[e.code]);
                    return;
                }
            }
            // Icon Passing Slot 1-5
            if (curHud1.iconPassingActive && e.code >= 'Digit1' && e.code <= 'Digit5') {
                e.preventDefault();
                sim.triggerIconPass(Number(e.code.replace('Digit', '')));
                return;
            }
            // Quick Coach Tactics / Radar Expand hotkeys (1-4 when Icon Passing is off)
            if (!curHud1.iconPassingActive && e.code >= 'Digit1' && e.code <= 'Digit4') {
                e.preventDefault();
                setTacticsExpanded(function(prev) {
                    return !prev;
                });
                return;
            }
            var onDefense = Boolean(curHud1.userTeamSide && curHud1.possession !== curHud1.userTeamSide);
            if (e.code === kb.camera) {
                e.preventDefault();
                cycleCamera();
            } else if (e.code === kb.screen) {
                e.preventDefault();
                sim.callPickAndRoll();
            } else if (e.code === kb.pass) {
                e.preventDefault();
                sim.triggerPass('CHEST');
            } else if (e.code === kb.bouncePass) {
                e.preventDefault();
                sim.triggerPass('BOUNCE');
            } else if (e.code === kb.alleyOop || e.code === kb.block) {
                e.preventDefault();
                sim.triggerLobOrBlock();
            } else if (e.code === kb.steal && onDefense) {
                e.preventDefault();
                sim.triggerStealAttempt();
            } else if (e.code === kb.switchDef && onDefense) {
                e.preventDefault();
                sim.switchToNearestDefender();
            } else if (e.code === kb.dribble) {
                e.preventDefault();
                if (curHud1.pickAndRoll.active) {
                    sim.flipPickAndRollAngle();
                } else {
                    sim.triggerDribbleMove('CROSSOVER');
                }
            } else if (e.code === 'KeyE') {
                e.preventDefault();
                if (curHud1.pickAndRoll.active) {
                    sim.togglePickAndRollAction();
                } else if (onDefense) {
                    sim.switchToNearestDefender();
                } else {
                    sim.triggerDribbleMove('SPIN');
                }
            } else if (e.code === 'KeyZ') {
                e.preventDefault();
                sim.triggerDribbleMove('STEPBACK');
            } else if (e.code === kb.takeover) {
                e.preventDefault();
                sim.triggerTakeoverIgnition();
            }
        };
        var onKeyUp = function onKeyUp(e) {
            keysRef.current[e.code] = false;
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return function() {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [
        cycleCamera,
        hudEditorOpen,
        inMatchSettingsTab,
        replayOpen
    ]);
    // Mouse Right-Click (or Left-Click) Drag Down -> Up 2K26 Rhythm Shooting on 3D Court
    var handleCourtPointerDown = function handleCourtPointerDown(e) {
        if (anyModalPaused) return;
        if (e.pointerType === 'mouse' && e.button !== 0 && e.button !== 2) return;
        var target = e.target;
        if (target && target.closest('button, input, select, .p5-top-left-cluster, .p5-radar-shell, .p5-touch-overlay, .p5-pause-backdrop, .p5-replay-bar, .p7-modal-overlay, .p7-post-backdrop, .p7-replay-shell, .p7-hud-editor')) {
            return;
        }
        proStickDragRef.current = {
            active: true,
            startY: e.clientY,
            pulledDown: false,
            lastY: e.clientY,
            lastTs: performance.now()
        };
    };
    var handleCourtPointerMove = function handleCourtPointerMove(e) {
        var d = proStickDragRef.current;
        if (!d.active) return;
        var sim = simRef.current;
        if (!sim || sim.isPaused()) return;
        var dy = e.clientY - d.startY;
        if (!d.pulledDown && dy > 24) {
            d.pulledDown = true;
            sim.startRhythmShotDown();
        } else if (d.pulledDown && e.clientY < d.lastY - 16) {
            var dtMs = Math.max(12, performance.now() - d.lastTs);
            var flickVel = Math.min(2.0, Math.abs(d.lastY - e.clientY) / dtMs * 1.1);
            d.active = false;
            d.pulledDown = false;
            sim.flickRhythmShotUp(flickVel);
            return;
        }
        d.lastY = e.clientY;
        d.lastTs = performance.now();
    };
    var handleCourtPointerUp = function handleCourtPointerUp() {
        var d = proStickDragRef.current;
        if (d.active && d.pulledDown) {
            var _simRef_current;
            (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.flickRhythmShotUp(0.98);
        }
        d.active = false;
        d.pulledDown = false;
    };
    // ==========================================================================
    // 60 FPS SIMULATION TICK + HTML5 GAMEPAD API POLLING (ZERO REACT THRASH)
    // ==========================================================================
    var onTickFrame = (0, _react.useCallback)(function(dt) {
        var sim = simRef.current;
        if (!sim) return;
        if (!sim.isPaused()) {
            var keys = keysRef.current;
            var st = sim.renderState;
            var camCfg = _store.UltimateHybridStore.getState().settings.camera;
            var rawForward = touchStickRef.current.rawForward;
            var rawRight = touchStickRef.current.rawRight;
            if (keys.KeyW) rawForward += 1;
            if (keys.KeyS) rawForward -= 1;
            if (keys.KeyD) rawRight += 1;
            if (keys.KeyA) rawRight -= 1;
            rawForward = Math.max(-1, Math.min(1, rawForward));
            rawRight = Math.max(-1, Math.min(1, rawRight));
            // HTML5 Gamepad API polling (Xbox / PlayStation plug-and-play)
            var gpShoot = false;
            var gpSprint = false;
            var gpProtect = false;
            var gpHandsUp = false;
            if (typeof navigator !== 'undefined' && navigator.getGamepads) {
                var pads = navigator.getGamepads();
                var pad = pads && pads[0];
                if (pad) {
                    var lx = Math.abs(pad.axes[0] || 0) > 0.18 ? pad.axes[0] : 0;
                    var ly = Math.abs(pad.axes[1] || 0) > 0.18 ? pad.axes[1] : 0;
                    if (Math.hypot(lx, ly) > 0.18) {
                        rawRight = lx;
                        rawForward = -ly;
                    }
                    // Right Stick Down -> Up Rhythm Shooting
                    var ry = pad.axes[3] || 0;
                    if (!rightStickArmedRef.current && ry > 0.65) {
                        rightStickArmedRef.current = true;
                        sim.startRhythmShotDown();
                    } else if (rightStickArmedRef.current && ry < -0.45) {
                        rightStickArmedRef.current = false;
                        sim.flickRhythmShotUp(1.0);
                    } else if (rightStickArmedRef.current && Math.abs(ry) < 0.15) {
                        rightStickArmedRef.current = false;
                        sim.flickRhythmShotUp(0.95);
                    }
                    var btns = pad.buttons.map(function(b) {
                        return b.pressed;
                    });
                    var prev = prevGamepadBtnsRef.current;
                    var justPressed = function justPressed(idx) {
                        return Boolean(btns[idx] && !prev[idx]);
                    };
                    gpShoot = Boolean(btns[2]); // X / Square
                    gpSprint = Boolean(btns[7]); // RT / R2
                    gpProtect = Boolean(btns[6]); // LT / L2
                    gpHandsUp = Boolean(btns[5]); // RB / R1
                    if (justPressed(0)) sim.triggerPass('CHEST'); // A / Cross
                    if (justPressed(1)) sim.triggerPass('BOUNCE'); // B / Circle
                    if (justPressed(3)) sim.triggerLobOrBlock(); // Y / Triangle
                    if (justPressed(4)) sim.callPickAndRoll(); // LB / L1 -> Pick & Roll!
                    if (justPressed(9)) setPauseOpen(function(p) {
                        return !p;
                    }); // Start / Options -> Pause
                    if (justPressed(10) || justPressed(11)) sim.triggerTakeoverIgnition(); // Stick Click
                    prevGamepadBtnsRef.current = btns;
                }
            }
            var moveX = 0;
            var moveZ = 0;
            var isSidelineCam = camCfg.angle === 'BROADCAST' || camCfg.angle === 'NOSEBLEEDS';
            if (isSidelineCam) {
                var rev = camCfg.reverseAngle ? -1 : 1;
                moveX = rawRight * rev;
                moveZ = -rawForward * rev;
            } else {
                var dir = camCfg.autoFlip ? st.attackDirX : 1;
                if (camCfg.reverseAngle) dir = dir === 1 ? -1 : 1;
                moveX = rawForward * dir;
                moveZ = rawRight * dir;
            }
            var isOffenseNow = sim.getHudSnapshot().userTeamSide !== null && st.possession === sim.getHudSnapshot().userTeamSide;
            var kb = _store.UltimateHybridStore.getState().settings.controller.keybinds;
            var shiftDown = Boolean(keys.ShiftLeft || keys.ShiftRight || keys[kb.sprint]);
            var sprint = Boolean(shiftDown && isOffenseNow || keys.ControlLeft || keys.ControlRight || keys.KeyR || touchStickRef.current.sprintLocked || touchHoldRef.current.sprint || gpSprint);
            var quickProtectOrIntenseD = Boolean(shiftDown && !isOffenseNow || touchHoldRef.current.protect || gpProtect);
            var shootHeld = Boolean(keys[kb.shoot] || keys.Space || touchHoldRef.current.shoot || gpShoot);
            var handsUp = Boolean(keys[kb.handsUp] || keys.KeyU || touchHoldRef.current.handsUp || gpHandsUp);
            sim.setInput({
                moveX: moveX,
                moveZ: moveZ,
                sprint: sprint,
                shootHeld: shootHeld,
                quickProtectOrIntenseD: quickProtectOrIntenseD,
                handsUp: handsUp
            });
            sim.step(dt);
        }
        // Throttled ~18 Hz HUD refresh (silky shot meters + zero React frame thrash)
        hudSyncAccumRef.current += dt;
        if (hudSyncAccumRef.current >= 0.055) {
            hudSyncAccumRef.current = 0;
            setFrameMs(Math.max(4, Math.round(dt * 1000)));
            setHud(sim.getHudSnapshot());
        }
    }, []);
    var activeCameraMeta = (0, _react.useMemo)(function() {
        var _CAMERA_ANGLE_OPTIONS_find;
        return (_CAMERA_ANGLE_OPTIONS_find = _courtTypes.CAMERA_ANGLE_OPTIONS.find(function(c) {
            return c.id === save.settings.camera.angle;
        })) != null ? _CAMERA_ANGLE_OPTIONS_find : _courtTypes.CAMERA_ANGLE_OPTIONS[0];
    }, [
        save.settings.camera.angle
    ]);
    var isOffenseControlled = hud.userTeamSide !== null && hud.possession === hud.userTeamSide;
    var handleMarkEnemy = (0, _react.useCallback)(function(playerId, tag) {
        var _simRef_current;
        (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.setMarkedStar(playerId, tag);
        _audioEngine.HybridAudioEngine.playUi('confirm', era);
        if (simRef.current) setHud(simRef.current.getHudSnapshot());
    }, [
        era
    ]);
    var handleSetOffensivePlay = (0, _react.useCallback)(function(play) {
        var _simRef_current;
        (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.setActivePlay(play);
        _store.UltimateHybridStore.updateSettings('visual', {
            playVision: play
        });
        _audioEngine.HybridAudioEngine.playUi('switch', era);
        if (simRef.current) setHud(simRef.current.getHudSnapshot());
    }, [
        era
    ]);
    var handleSetDefensiveScheme = (0, _react.useCallback)(function(scheme) {
        var _simRef_current;
        (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.setDefensiveScheme(scheme);
        _audioEngine.HybridAudioEngine.playUi('switch', era);
        if (simRef.current) setHud(simRef.current.getHudSnapshot());
    }, [
        era
    ]);
    var handleApplyLineupPreset = (0, _react.useCallback)(function(preset) {
        var _simRef_current;
        (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.applyLineupPreset(preset);
        _audioEngine.HybridAudioEngine.playUi('confirm', era);
        onNotify("Lineup Unit: " + preset);
        if (simRef.current) setHud(simRef.current.getHudSnapshot());
    }, [
        era,
        onNotify
    ]);
    var handleCallTimeout = (0, _react.useCallback)(function() {
        var _simRef_current;
        var ok = (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.callTimeout();
        if (ok) {
            _audioEngine.HybridAudioEngine.playUi('confirm', era);
            if (simRef.current) setHud(simRef.current.getHudSnapshot());
        } else {
            onNotify('No Timeouts Remaining!');
        }
    }, [
        era,
        onNotify
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h2k-live-stage",
        "data-screen": "LIVE_GAME",
        onPointerDown: handleCourtPointerDown,
        onPointerMove: handleCourtPointerMove,
        onPointerUp: handleCourtPointerUp,
        onPointerCancel: handleCourtPointerUp,
        onContextMenu: function onContextMenu(e) {
            return e.preventDefault();
        },
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_Court3D.Court3D, {
                matchStateRef: matchStateRef,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                venue: config.venue,
                homeJersey: config.homeJersey,
                awayJersey: config.awayJersey,
                uiEraMode: era,
                cameraConfig: cameraConfig,
                visualConfig: visualConfig,
                streakStamp: save.profile.winStreak >= 3 ? "STREAK SETTER \xb7 " + save.profile.winStreak + "W" : 'SKYLINE PARK · 2K26',
                projectedAnchorsRef: projectedAnchorsRef,
                replayOrbitRef: replayOrbitRef,
                capturePngRef: capturePngRef,
                onTickFrame: onTickFrame,
                onFpsSample: setFps
            }),
            !replayOpen && !hudEditorOpen && /*#__PURE__*/ (0, _jsxruntime.jsx)(_MatchHUD.MatchHUD, {
                hud: hud,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                venue: config.venue,
                uiEraMode: era,
                scoreboardEra: save.settings.visual.scoreboardEra,
                scorebugPosition2K26: save.settings.visual.scorebugPosition2K26,
                activeCameraShortLabel: activeCameraMeta.shortLabel,
                showFpsTelemetry: save.settings.visual.showFpsTelemetry,
                showShotFeedback: save.settings.visual.showShotFeedback,
                fps: fps,
                frameMs: frameMs,
                winStreak: save.profile.winStreak,
                tacticsOpen: tacticsExpanded,
                touchControlsVisible: touchControlsVisible,
                projectedAnchorsRef: projectedAnchorsRef,
                tacticsLayout: save.settings.controller.customHudLayout.tactics_btn,
                suppressDefaultGameOver: true,
                onOpenPause: function onOpenPause() {
                    return setPauseOpen(true);
                },
                onCycleCamera: cycleCamera,
                onToggleTactics: function onToggleTactics() {
                    return setTacticsExpanded(function(v) {
                        return !v;
                    });
                },
                onToggleEra: toggleLiveHudEra,
                onToggleTouchControls: toggleTouchControls,
                onIgniteTakeover: function onIgniteTakeover() {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.triggerTakeoverIgnition();
                },
                onTriggerIconPass: function onTriggerIconPass(slot) {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.triggerIconPass(slot);
                },
                onAlleyOopPress: function onAlleyOopPress(key) {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.submitAlleyOopFinishKey(key);
                },
                onRematch: function onRematch() {
                    return setRematchNonce(function(n) {
                        return n + 1;
                    });
                },
                onExitToMenu: onExitToMenu
            }),
            !replayOpen && !hudEditorOpen && /*#__PURE__*/ (0, _jsxruntime.jsx)(_ShotMeterOverlay.ShotMeterOverlay, {
                meter: hud.meter,
                shotMeterStyle: save.settings.controller.shotMeterStyle,
                shotMeterEnabled: save.settings.controller.shotMeterEnabled,
                activeShooterId: hud.activeShooterId,
                projectedAnchorsRef: projectedAnchorsRef,
                isUserFreeThrow: hud.userTeamSide === hud.possession,
                onJumpBallTap: function onJumpBallTap() {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.triggerJumpBallAttempt();
                },
                onFreeThrowRelease: function onFreeThrowRelease() {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.releaseUserFreeThrow();
                }
            }),
            !replayOpen && !hudEditorOpen && /*#__PURE__*/ (0, _jsxruntime.jsx)(_TacticalRadarAndMarking.TacticalRadarAndMarking, {
                hud: hud,
                homePrimaryColor: homeTeam.colors.primary,
                awayPrimaryColor: awayTeam.colors.primary,
                expanded: tacticsExpanded,
                radarLayout: save.settings.controller.customHudLayout.radar_panel,
                onToggleExpanded: function onToggleExpanded() {
                    return setTacticsExpanded(function(v) {
                        return !v;
                    });
                },
                onMarkEnemy: handleMarkEnemy,
                onSetOffensivePlay: handleSetOffensivePlay,
                onSetDefensiveScheme: handleSetDefensiveScheme,
                onCallPickAndRoll: function onCallPickAndRoll() {
                    var _simRef_current;
                    (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.callPickAndRoll();
                    if (simRef.current) setHud(simRef.current.getHudSnapshot());
                },
                onFlipScreenAngle: function onFlipScreenAngle() {
                    var _simRef_current;
                    (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.flipPickAndRollAngle();
                    if (simRef.current) setHud(simRef.current.getHudSnapshot());
                },
                onToggleScreenAction: function onToggleScreenAction() {
                    var _simRef_current;
                    (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.togglePickAndRollAction();
                    if (simRef.current) setHud(simRef.current.getHudSnapshot());
                },
                onApplyLineupPreset: handleApplyLineupPreset,
                onCallTimeout: handleCallTimeout
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_TouchControlsOverlay.TouchControlsOverlay, {
                visible: touchControlsVisible && !anyModalPaused && hud.phase !== 'GAME_OVER',
                isOffense: isOffenseControlled,
                takeoverReady: Boolean((_hud_controlledTakeover = hud.controlledTakeover) == null ? void 0 : _hud_controlledTakeover.readyToIgnite),
                pickAndRoll: hud.pickAndRoll,
                customHudLayout: save.settings.controller.customHudLayout,
                onStickChange: function onStickChange(rawRight, rawForward, sprintLocked) {
                    touchStickRef.current.rawRight = rawRight;
                    touchStickRef.current.rawForward = rawForward;
                    touchStickRef.current.sprintLocked = sprintLocked;
                },
                onHoldStateChange: function onHoldStateChange(patch) {
                    Object.assign(touchHoldRef.current, patch);
                },
                onRhythmDown: function onRhythmDown() {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.startRhythmShotDown();
                },
                onRhythmFlickUp: function onRhythmFlickUp(vel) {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.flickRhythmShotUp(vel);
                },
                onPass: function onPass(kind) {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.triggerPass(kind);
                },
                onDribble: function onDribble(move) {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.triggerDribbleMove(move);
                },
                onCallScreen: function onCallScreen() {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.callPickAndRoll();
                },
                onFlipScreenAngle: function onFlipScreenAngle() {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.flipPickAndRollAngle();
                },
                onToggleScreenAction: function onToggleScreenAction() {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.togglePickAndRollAction();
                },
                onToggleIconPass: function onToggleIconPass() {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.toggleIconPassing();
                },
                onAlleyOop: function onAlleyOop() {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.triggerAlleyOop();
                },
                onIgniteTakeover: function onIgniteTakeover() {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.triggerTakeoverIgnition();
                },
                onBlockOrRebound: function onBlockOrRebound() {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.triggerLobOrBlock();
                },
                onSteal: function onSteal() {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.triggerStealAttempt();
                },
                onSwitchDefender: function onSwitchDefender() {
                    var _simRef_current;
                    return (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.switchToNearestDefender();
                }
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_PauseMenuModal.PauseMenuModal, {
                open: pauseOpen,
                hud: hud,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                cameraSettings: save.settings.camera,
                onResume: function onResume() {
                    return setPauseOpen(false);
                },
                onPreviewReplayFrame: function onPreviewReplayFrame(idx) {
                    var _simRef_current;
                    (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.previewReplayFrame(idx);
                },
                onRestoreLiveFrame: function onRestoreLiveFrame() {
                    var _simRef_current;
                    (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.restoreLiveFromReplay();
                },
                onSetOffensivePlay: handleSetOffensivePlay,
                onSetDefensiveScheme: handleSetDefensiveScheme,
                onApplyLineupPreset: handleApplyLineupPreset,
                onCallTimeout: handleCallTimeout,
                onUpdateCamera: function onUpdateCamera(patch) {
                    _store.UltimateHybridStore.updateSettings('camera', patch);
                },
                onOpenFullSettings: function onOpenFullSettings(tab) {
                    setPauseOpen(false);
                    setInMatchSettingsTab(tab != null ? tab : 'GAMEPLAY');
                },
                onOpenInstantReplay: function onOpenInstantReplay() {
                    setPauseOpen(false);
                    setReplayOpen(true);
                },
                onRematch: function onRematch() {
                    setPauseOpen(false);
                    setRematchNonce(function(n) {
                        return n + 1;
                    });
                },
                onLaunchLegacyCourt: function onLaunchLegacyCourt1() {
                    setPauseOpen(false);
                    onLaunchLegacyCourt();
                },
                onQuitToMenu: function onQuitToMenu() {
                    setPauseOpen(false);
                    _modesStore.ModesStore.setActiveLaunchPayload(null);
                    onExitToMenu();
                }
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_ModeObjectiveOverlay.ModeObjectiveOverlay, {
                payload: activeLaunchPayload,
                hud: hud,
                suppressPostMatchModal: true,
                onModeSettled: function onModeSettled(summary) {
                    return setModeOutcomeSummary(summary);
                },
                onFinishAndReturn: function onFinishAndReturn(retScreen) {
                    _modesStore.ModesStore.setActiveLaunchPayload(null);
                    _store.UltimateHybridStore.setActiveScreen(retScreen);
                },
                onRematch: function onRematch() {
                    return setRematchNonce(function(n) {
                        return n + 1;
                    });
                }
            }),
            hud.phase === 'GAME_OVER' && !replayOpen && !inMatchSettingsTab && !hudEditorOpen && /*#__PURE__*/ (0, _jsxruntime.jsx)(_PostMatchScreen.PostMatchScreen, {
                hud: hud,
                awayTeam: awayTeam,
                homeTeam: homeTeam,
                save: save,
                payout: matchPayout,
                modePayload: activeLaunchPayload,
                modeOutcomeSummary: modeOutcomeSummary,
                onRematch: function onRematch() {
                    return setRematchNonce(function(n) {
                        return n + 1;
                    });
                },
                onOpenReplay: function onOpenReplay() {
                    return setReplayOpen(true);
                },
                onReturnToCity: function onReturnToCity1() {
                    _modesStore.ModesStore.setActiveLaunchPayload(null);
                    if (onReturnToCity) {
                        onReturnToCity();
                    } else {
                        _store.UltimateHybridStore.setActiveScreen('CITY_EXPLORE');
                    }
                },
                onMainMenu: function onMainMenu() {
                    _modesStore.ModesStore.setActiveLaunchPayload(null);
                    onExitToMenu();
                }
            }),
            replayOpen && /*#__PURE__*/ (0, _jsxruntime.jsx)(_InstantReplayModal.InstantReplayModal, {
                uiEraMode: era,
                frameCount: hud.replayFrameCount,
                replayOrbitRef: replayOrbitRef,
                activeCameraPreset: save.settings.camera.angle,
                onSeekFrame: function onSeekFrame(idx) {
                    var _simRef_current;
                    (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.previewReplayFrame(idx);
                },
                onSelectCameraPreset: function onSelectCameraPreset(preset) {
                    _store.UltimateHybridStore.updateSettings('camera', {
                        angle: preset
                    });
                },
                onCapturePng: function onCapturePng() {
                    return capturePngRef.current ? capturePngRef.current() : null;
                },
                onExit: function onExit() {
                    var _simRef_current;
                    (_simRef_current = simRef.current) == null ? void 0 : _simRef_current.restoreLiveFromReplay();
                    replayOrbitRef.current.active = false;
                    setReplayOpen(false);
                }
            }),
            inMatchSettingsTab && /*#__PURE__*/ (0, _jsxruntime.jsx)(_SettingsModal.SettingsModal, {
                save: save,
                beats: beats,
                initialTab: inMatchSettingsTab,
                inMatch: true,
                onClose: function onClose() {
                    return setInMatchSettingsTab(null);
                },
                onOpenCustomHudEditor: function onOpenCustomHudEditor() {
                    setInMatchSettingsTab(null);
                    setHudEditorOpen(true);
                },
                onNotify: onNotify
            }),
            hudEditorOpen && /*#__PURE__*/ (0, _jsxruntime.jsx)(_CustomHudEditor.CustomHudEditor, {
                uiEraMode: era,
                initialLayout: save.settings.controller.customHudLayout,
                liveCourtBackdrop: true,
                onSaveAndExit: function onSaveAndExit(layout) {
                    _store.UltimateHybridStore.updateCustomHudLayout(layout);
                    setHudEditorOpen(false);
                    onNotify('Custom Touch HUD layout saved!');
                },
                onCancel: function onCancel() {
                    return setHudEditorOpen(false);
                }
            })
        ]
    });
};

});
// === MODULE: src/games/hoops-2k26/engine/VenueBuilder3D ===
ArcadeMod.define("src/games/hoops-2k26/engine/VenueBuilder3D", function(require, module, exports) {
// ============================================================================
// PART 3 — 10-VENUE 3D ENVIRONMENT, PHYSICS HOOPS & CROWD BUILDER
// Builds all 5 main venues + 4 remastered 2K16 MyPARKs + Euro/W Arenas,
// 2 detailed regulation hoops with flexing rims, translucent glass backboards,
// Red LED buzzer strips, vertex-animated rippling nets (nylon & chain),
// InstancedMesh cheering crowds, 4-sided Jumbotron, and ambient outdoor props.
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "buildVenue3D", {
    enumerable: true,
    get: function() {
        return buildVenue3D;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _courtTypes = require("./courtTypes");
var _CourtTextures = require("./CourtTextures");
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
function createHoopRig(side, isChainNet, isOutdoor, primaryHex, trackGeo, trackMat) {
    var group = new _three.Group();
    var baseX = side * (_courtTypes.COURT_DIMS.HALF_LENGTH + 0.95);
    var boardX = side * _courtTypes.COURT_DIMS.BACKBOARD_X;
    var rimX = side * _courtTypes.COURT_DIMS.RIM_X;
    var poleMat = trackMat(new _three.MeshStandardMaterial({
        color: isOutdoor ? 0x334155 : 0x111827,
        roughness: 0.45,
        metalness: 0.55
    }));
    var padMat = trackMat(new _three.MeshStandardMaterial({
        color: new _three.Color(primaryHex || '#e11d48'),
        roughness: 0.65
    }));
    // Stanchion base & angled neck
    var baseBox = new _three.Mesh(trackGeo(new _three.BoxGeometry(1.15, 1.35, 1.05)), padMat);
    baseBox.position.set(baseX + side * 0.45, 0.675, 0);
    baseBox.castShadow = true;
    group.add(baseBox);
    var post = new _three.Mesh(trackGeo(new _three.BoxGeometry(0.32, 3.5, 0.32)), poleMat);
    post.position.set(baseX + side * 0.35, 1.95, 0);
    post.castShadow = true;
    group.add(post);
    var armLen = Math.abs(baseX + side * 0.35 - boardX);
    var boom = new _three.Mesh(trackGeo(new _three.BoxGeometry(armLen, 0.24, 0.24)), poleMat);
    boom.position.set((baseX + side * 0.35 + boardX) * 0.5, _courtTypes.COURT_DIMS.BACKBOARD_Y, 0);
    group.add(boom);
    // Translucent Tempered Glass Backboard + White Shooter's Square
    var boardMat = trackMat(new _three.MeshPhysicalMaterial({
        color: 0xe2f1ff,
        transparent: true,
        opacity: 0.42,
        roughness: 0.1,
        metalness: 0.1,
        reflectivity: 0.9
    }));
    var boardMesh = new _three.Mesh(trackGeo(new _three.BoxGeometry(0.06, _courtTypes.COURT_DIMS.BACKBOARD_H, _courtTypes.COURT_DIMS.BACKBOARD_W)), boardMat);
    boardMesh.position.set(boardX, _courtTypes.COURT_DIMS.BACKBOARD_Y, 0);
    group.add(boardMesh);
    // Red LED Buzzer Perimeter Strip around Backboard
    var ledMat = trackMat(new _three.MeshStandardMaterial({
        color: 0x3f1d24,
        emissive: 0xff1122,
        emissiveIntensity: 0.0,
        roughness: 0.3
    }));
    var frameThick = 0.055;
    var topBar = new _three.Mesh(trackGeo(new _three.BoxGeometry(0.075, frameThick, _courtTypes.COURT_DIMS.BACKBOARD_W + 0.06)), ledMat);
    topBar.position.set(boardX, _courtTypes.COURT_DIMS.BACKBOARD_Y + _courtTypes.COURT_DIMS.BACKBOARD_H * 0.5, 0);
    group.add(topBar);
    var botBar = new _three.Mesh(trackGeo(new _three.BoxGeometry(0.075, frameThick, _courtTypes.COURT_DIMS.BACKBOARD_W + 0.06)), ledMat);
    botBar.position.set(boardX, _courtTypes.COURT_DIMS.BACKBOARD_Y - _courtTypes.COURT_DIMS.BACKBOARD_H * 0.5, 0);
    group.add(botBar);
    for(var _i = 0, _iter = [
        -1,
        1
    ]; _i < _iter.length; _i++){
        var zSign = _iter[_i];
        var sideBar = new _three.Mesh(trackGeo(new _three.BoxGeometry(0.075, _courtTypes.COURT_DIMS.BACKBOARD_H + 0.06, frameThick)), ledMat);
        sideBar.position.set(boardX, _courtTypes.COURT_DIMS.BACKBOARD_Y, zSign * (_courtTypes.COURT_DIMS.BACKBOARD_W * 0.5));
        group.add(sideBar);
    }
    // White Inner Shooter's Square
    var sqMat = trackMat(new _three.MeshBasicMaterial({
        color: 0xffffff
    }));
    var sqW = 0.61;
    var sqH = 0.46;
    var sqY = _courtTypes.COURT_DIMS.RIM_Y + 0.24;
    var sqX = boardX - side * 0.036;
    var sqTop = new _three.Mesh(trackGeo(new _three.BoxGeometry(0.012, 0.03, sqW)), sqMat);
    sqTop.position.set(sqX, sqY + sqH * 0.5, 0);
    group.add(sqTop);
    var sqBot = new _three.Mesh(trackGeo(new _three.BoxGeometry(0.012, 0.03, sqW)), sqMat);
    sqBot.position.set(sqX, sqY - sqH * 0.5, 0);
    group.add(sqBot);
    for(var _i1 = 0, _iter1 = [
        -1,
        1
    ]; _i1 < _iter1.length; _i1++){
        var zs = _iter1[_i1];
        var sqSide = new _three.Mesh(trackGeo(new _three.BoxGeometry(0.012, sqH, 0.03)), sqMat);
        sqSide.position.set(sqX, sqY, zs * sqW * 0.5);
        group.add(sqSide);
    }
    // Overhead Shot Clock Box
    var scBox = new _three.Mesh(trackGeo(new _three.BoxGeometry(0.45, 0.34, 0.65)), poleMat);
    scBox.position.set(boardX + side * 0.12, _courtTypes.COURT_DIMS.BACKBOARD_Y + 0.78, 0);
    group.add(scBox);
    // Breakaway Flexing Rim Pivot anchored at backboard mount
    var rimPivot = new _three.Group();
    rimPivot.position.set(boardX - side * 0.14, _courtTypes.COURT_DIMS.RIM_Y, 0);
    group.add(rimPivot);
    var rimMat = trackMat(new _three.MeshStandardMaterial({
        color: 0xf97316,
        roughness: 0.3,
        metalness: 0.65
    }));
    var rimOffset = rimX - (boardX - side * 0.14);
    var rimMesh = new _three.Mesh(trackGeo(new _three.TorusGeometry(_courtTypes.COURT_DIMS.RIM_RADIUS, 0.018, 10, 24)), rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.set(rimOffset, 0, 0);
    rimPivot.add(rimMesh);
    // Vertex-Animated Multi-Ring Net (White Nylon or Silver Chain on Blacktop)
    var netGeo = trackGeo(new _three.CylinderGeometry(_courtTypes.COURT_DIMS.RIM_RADIUS * 0.96, _courtTypes.COURT_DIMS.RIM_RADIUS * 0.56, 0.46, 14, 6, true));
    var netMat = trackMat(new _three.MeshStandardMaterial({
        color: isChainNet ? 0xd4d4d8 : 0xf8fafc,
        roughness: isChainNet ? 0.35 : 0.85,
        metalness: isChainNet ? 0.82 : 0.05,
        wireframe: true,
        side: _three.DoubleSide
    }));
    var netMesh = new _three.Mesh(netGeo, netMat);
    netMesh.position.set(rimOffset, -0.23, 0);
    rimPivot.add(netMesh);
    var posAttr = netGeo.attributes.position;
    var netBasePos = new Float32Array(posAttr.array.length);
    netBasePos.set(posAttr.array);
    return {
        group: group,
        rig: {
            side: side,
            rimPivot: rimPivot,
            netGeo: netGeo,
            netBasePos: netBasePos,
            ledMat: ledMat
        }
    };
}
function buildVenue3D(venue, homeTeam, hardwoodReflections, streakStamp) {
    var root = new _three.Group();
    var ownedGeos = [];
    var ownedMats = [];
    var ownedTextures = [];
    var trackGeo = function trackGeo(g) {
        ownedGeos.push(g);
        return g;
    };
    var trackMat = function trackMat(m) {
        ownedMats.push(m);
        return m;
    };
    var outdoor = (0, _courtTypes.isOutdoorVenue)(venue);
    var asphalt = (0, _courtTypes.isStreetAsphaltVenue)(venue);
    var isChainNet = venue === 'BLACKTOP_CAGE';
    // 1. Court Playing Floor (28.6m x 15.2m) + Outer Apron
    var courtTex = (0, _CourtTextures.createCourtTextures)(homeTeam, venue, streakStamp);
    var courtMat = trackMat(new _three.MeshStandardMaterial({
        map: courtTex.colorMap,
        roughnessMap: courtTex.roughnessMap,
        roughness: asphalt || venue === 'STREET_KINGS' ? 0.88 : hardwoodReflections ? 0.24 : 0.62,
        metalness: asphalt || venue === 'STREET_KINGS' ? 0.04 : hardwoodReflections ? 0.16 : 0.04,
        envMapIntensity: hardwoodReflections && !asphalt ? 1.35 : 0.55
    }));
    var courtMesh = new _three.Mesh(trackGeo(new _three.PlaneGeometry(_courtTypes.COURT_DIMS.LENGTH, _courtTypes.COURT_DIMS.WIDTH)), courtMat);
    courtMesh.rotation.x = -Math.PI / 2;
    courtMesh.receiveShadow = true;
    root.add(courtMesh);
    // Outer Apron Surround
    var apronColor = venue === 'SUNSET_BEACH' ? 0xd6b888 : venue === 'SKYLINE_PARK' ? 0x1e293b : venue === 'STREET_KINGS' ? 0x574c3f : venue === 'ARENA_2K14' ? 0x161218 : 0x0f172a;
    var apronMat = trackMat(new _three.MeshStandardMaterial({
        color: apronColor,
        roughness: 0.85
    }));
    var apronMesh = new _three.Mesh(trackGeo(new _three.PlaneGeometry(88, 66)), apronMat);
    apronMesh.rotation.x = -Math.PI / 2;
    apronMesh.position.y = -0.025;
    apronMesh.receiveShadow = true;
    root.add(apronMesh);
    // 2. Both Regulation Hoops (Left -X and Right +X)
    var leftHoop = createHoopRig(-1, isChainNet, outdoor, homeTeam.colors.primary, trackGeo, trackMat);
    var rightHoop = createHoopRig(1, isChainNet, outdoor, homeTeam.colors.primary, trackGeo, trackMat);
    root.add(leftHoop.group);
    root.add(rightHoop.group);
    // 3. Venue-Specific Architecture, Crowd, Jumbotron & Outdoor Scenery
    var jumbotronCtrl = null;
    var crowdInstanced = null;
    var crowdBaseY = [];
    var crowdCoords = [];
    var crowdDummy = new _three.Object3D();
    var rotorMesh = null;
    var oceanMesh = null;
    var torchLights = [];
    if (!outdoor) {
        // INDOOR ARENA (2K26 Next-Gen, 2K14 Classic, EuroLeague Palace, The W)
        var ribbonTex = (0, _CourtTextures.createScorerRibbonTexture)(homeTeam, venue);
        ownedTextures.push(ribbonTex);
        var ribbonMat = trackMat(new _three.MeshStandardMaterial({
            map: ribbonTex,
            emissive: 0xffffff,
            emissiveMap: ribbonTex,
            emissiveIntensity: 0.42,
            roughness: 0.4
        }));
        var scorerTable = new _three.Mesh(trackGeo(new _three.BoxGeometry(11.5, 0.86, 0.72)), ribbonMat);
        scorerTable.position.set(0, 0.43, -_courtTypes.COURT_DIMS.HALF_WIDTH - 1.75);
        root.add(scorerTable);
        // Tiered Stadium Bleachers on all 4 sides
        var tierMat = trackMat(new _three.MeshStandardMaterial({
            color: venue === 'ARENA_2K14' ? 0x1c1722 : 0x111827,
            roughness: 0.85
        }));
        for(var t = 0; t < 5; t++){
            var distZ = _courtTypes.COURT_DIMS.HALF_WIDTH + 3.4 + t * 1.85;
            var h = 0.75 + t * 0.95;
            for(var _i = 0, _iter = [
                -1,
                1
            ]; _i < _iter.length; _i++){
                var zSign = _iter[_i];
                var tier = new _three.Mesh(trackGeo(new _three.BoxGeometry(36, 0.85, 1.7)), tierMat);
                tier.position.set(0, h, zSign * distZ);
                root.add(tier);
                // Populate spectators in this tier
                for(var sx = -15; sx <= 15; sx += 1.45){
                    crowdCoords.push([
                        sx + t % 2 * 0.4,
                        h + 0.75,
                        zSign * distZ
                    ]);
                    crowdBaseY.push(h + 0.75);
                }
            }
            // Endzone baseline bleachers
            var distX = _courtTypes.COURT_DIMS.HALF_LENGTH + 3.8 + t * 1.75;
            for(var _i1 = 0, _iter1 = [
                -1,
                1
            ]; _i1 < _iter1.length; _i1++){
                var xSign = _iter1[_i1];
                var endTier = new _three.Mesh(trackGeo(new _three.BoxGeometry(1.6, 0.85, 18)), tierMat);
                endTier.position.set(xSign * distX, h, 0);
                root.add(endTier);
            }
        }
        // 4-Sided Hanging 3D Jumbotron Centerpiece
        jumbotronCtrl = (0, _CourtTextures.createJumbotronTexture)();
        var jumboGroup = new _three.Group();
        jumboGroup.position.set(0, 12.6, 0);
        var jumboBody = new _three.Mesh(trackGeo(new _three.BoxGeometry(5.6, 2.8, 5.6)), trackMat(new _three.MeshStandardMaterial({
            color: 0x0b0f19,
            metalness: 0.7,
            roughness: 0.35
        })));
        jumboGroup.add(jumboBody);
        var screenMat = trackMat(new _three.MeshBasicMaterial({
            map: jumbotronCtrl.texture
        }));
        var screenGeo = trackGeo(new _three.PlaneGeometry(5.1, 2.35));
        var faces = [
            [
                0,
                0,
                2.83,
                0
            ],
            [
                0,
                0,
                -2.83,
                Math.PI
            ],
            [
                2.83,
                0,
                0,
                Math.PI / 2
            ],
            [
                -2.83,
                0,
                0,
                -Math.PI / 2
            ]
        ];
        for(var _iterator = _create_for_of_iterator_helper_loose(faces), _step; !(_step = _iterator()).done;){
            var _step_value = _step.value, fx = _step_value[0], fy = _step_value[1], fz = _step_value[2], rotY = _step_value[3];
            var scr = new _three.Mesh(screenGeo, screenMat);
            scr.position.set(fx, fy, fz);
            scr.rotation.y = rotY;
            jumboGroup.add(scr);
        }
        root.add(jumboGroup);
        // Arena Ceiling Rafter Beams & Spotlights
        var rafterMat = trackMat(new _three.MeshStandardMaterial({
            color: 0x1e293b,
            metalness: 0.6,
            roughness: 0.5
        }));
        for(var rx = -14; rx <= 14; rx += 7){
            var beam = new _three.Mesh(trackGeo(new _three.BoxGeometry(0.45, 0.45, 32)), rafterMat);
            beam.position.set(rx, 16.5, 0);
            root.add(beam);
        }
    } else {
        // OUTDOOR PARKS & STREETBALL VENUES
        if (venue === 'BLACKTOP_CAGE') {
            // Chain-link metal cage walls around court
            var fenceMat = trackMat(new _three.MeshStandardMaterial({
                color: 0x94a3b8,
                wireframe: true,
                metalness: 0.7,
                roughness: 0.4
            }));
            for(var _i2 = 0, _iter2 = [
                -1,
                1
            ]; _i2 < _iter2.length; _i2++){
                var zs = _iter2[_i2];
                var wall = new _three.Mesh(trackGeo(new _three.PlaneGeometry(33, 4.2, 28, 6)), fenceMat);
                wall.position.set(0, 2.1, zs * (_courtTypes.COURT_DIMS.HALF_WIDTH + 2.2));
                root.add(wall);
            }
            for(var _i3 = 0, _iter3 = [
                -1,
                1
            ]; _i3 < _iter3.length; _i3++){
                var xs = _iter3[_i3];
                var wall1 = new _three.Mesh(trackGeo(new _three.PlaneGeometry(19.6, 4.2, 16, 6)), fenceMat);
                wall1.rotation.y = Math.PI / 2;
                wall1.position.set(xs * (_courtTypes.COURT_DIMS.HALF_LENGTH + 2.4), 2.1, 0);
                root.add(wall1);
            }
            // Corner floodlight poles
            var poleM = trackMat(new _three.MeshStandardMaterial({
                color: 0x334155,
                metalness: 0.6
            }));
            var bulbM = trackMat(new _three.MeshBasicMaterial({
                color: 0xfef08a
            }));
            for(var _i4 = 0, _iter4 = [
                -1,
                1
            ]; _i4 < _iter4.length; _i4++){
                var xs1 = _iter4[_i4];
                for(var _i5 = 0, _iter5 = [
                    -1,
                    1
                ]; _i5 < _iter5.length; _i5++){
                    var zs1 = _iter5[_i5];
                    var p = new _three.Mesh(trackGeo(new _three.CylinderGeometry(0.14, 0.18, 9.5, 8)), poleM);
                    p.position.set(xs1 * 16.8, 4.75, zs1 * 9.8);
                    root.add(p);
                    var b = new _three.Mesh(trackGeo(new _three.BoxGeometry(1.1, 0.45, 0.5)), bulbM);
                    b.position.set(xs1 * 16.4, 9.4, zs1 * 9.4);
                    root.add(b);
                }
            }
        } else if (venue === 'STREET_KINGS') {
            // Roman Coliseum Stone Pillars & Flickering Torches
            var stoneMat = trackMat(new _three.MeshStandardMaterial({
                color: 0xd6c7a9,
                roughness: 0.85
            }));
            var flameMat = trackMat(new _three.MeshBasicMaterial({
                color: 0xf97316
            }));
            var colGeo = trackGeo(new _three.CylinderGeometry(0.55, 0.65, 8.2, 12));
            var flameGeo = trackGeo(new _three.ConeGeometry(0.32, 0.9, 8));
            for(var i = 0; i < 14; i++){
                var ang = i / 14 * Math.PI * 2;
                var px = Math.cos(ang) * 20.5;
                var pz = Math.sin(ang) * 14.5;
                var col = new _three.Mesh(colGeo, stoneMat);
                col.position.set(px, 4.1, pz);
                root.add(col);
                if (i % 2 === 0) {
                    var fl = new _three.Mesh(flameGeo, flameMat);
                    fl.position.set(px, 8.6, pz);
                    root.add(fl);
                    if (torchLights.length < 4) {
                        var tl = new _three.PointLight(0xff7a1a, 18, 22);
                        tl.position.set(px, 8.9, pz);
                        root.add(tl);
                        torchLights.push(tl);
                    }
                }
            }
        } else {
            // SKYLINE PARK / RIVET CITY / SUNSET BEACH / OLD TOWN
            // City Skyline Silhouette Towers & Rooftop Props
            var bldgMat = trackMat(new _three.MeshStandardMaterial({
                color: venue === 'RIVET_CITY' ? 0x3f2e2b : venue === 'OLD_TOWN' ? 0x2f3e46 : 0x1e293b,
                roughness: 0.72,
                metalness: 0.25
            }));
            for(var i1 = 0; i1 < 18; i1++){
                var ang1 = i1 / 18 * Math.PI * 2;
                var dist = 29 + i1 % 3 * 4;
                var bw = 4.2 + i1 % 4 * 1.4;
                var bh = 9 + i1 * 7 % 16;
                var tower = new _three.Mesh(trackGeo(new _three.BoxGeometry(bw, bh, bw)), bldgMat);
                tower.position.set(Math.cos(ang1) * dist, bh * 0.5 - 0.5, Math.sin(ang1) * (dist * 0.72));
                root.add(tower);
            }
            // Sunset Beach Palm Trees + Shimmering Ocean Strip
            if (venue === 'SUNSET_BEACH' || venue === 'OLD_TOWN') {
                var trunkMat = trackMat(new _three.MeshStandardMaterial({
                    color: 0x785032,
                    roughness: 0.9
                }));
                var leafMat = trackMat(new _three.MeshStandardMaterial({
                    color: 0x15803d,
                    roughness: 0.75
                }));
                for(var p1 = 0; p1 < 8; p1++){
                    var px1 = -16 + p1 * 4.6;
                    var pz1 = p1 % 2 === 0 ? -12.5 : 12.5;
                    var trunk = new _three.Mesh(trackGeo(new _three.CylinderGeometry(0.18, 0.28, 6.2, 7)), trunkMat);
                    trunk.position.set(px1, 3.1, pz1);
                    trunk.rotation.z = (p1 % 2 === 0 ? 1 : -1) * 0.14;
                    root.add(trunk);
                    var crown = new _three.Mesh(trackGeo(new _three.ConeGeometry(2.1, 1.5, 7)), leafMat);
                    crown.position.set(px1, 6.4, pz1);
                    root.add(crown);
                }
                if (venue === 'SUNSET_BEACH') {
                    var oceanMat = trackMat(new _three.MeshStandardMaterial({
                        color: 0x0284c7,
                        roughness: 0.2,
                        metalness: 0.45
                    }));
                    oceanMesh = new _three.Mesh(trackGeo(new _three.PlaneGeometry(110, 34)), oceanMat);
                    oceanMesh.rotation.x = -Math.PI / 2;
                    oceanMesh.position.set(0, -0.08, -32);
                    root.add(oceanMesh);
                }
            }
            // Animated Flying City Helicopter / Blimp overhead on Skyline Park & Rivet City
            if (venue === 'SKYLINE_PARK' || venue === 'RIVET_CITY') {
                var heli = new _three.Group();
                var hull = new _three.Mesh(trackGeo(new _three.CapsuleGeometry(0.55, 1.8, 6, 10)), trackMat(new _three.MeshStandardMaterial({
                    color: 0xe11d48,
                    metalness: 0.5,
                    roughness: 0.35
                })));
                hull.rotation.z = Math.PI / 2;
                heli.add(hull);
                var blade = new _three.Mesh(trackGeo(new _three.BoxGeometry(3.4, 0.06, 0.18)), trackMat(new _three.MeshBasicMaterial({
                    color: 0xf8fafc
                })));
                blade.position.y = 0.72;
                heli.add(blade);
                heli.position.set(0, 15.5, -18);
                root.add(heli);
                rotorMesh = heli;
            }
        }
        // Outdoor Courtside Spectators (Street Crowd)
        for(var sx1 = -12; sx1 <= 12; sx1 += 2.2){
            crowdCoords.push([
                sx1,
                0.78,
                -_courtTypes.COURT_DIMS.HALF_WIDTH - 2.6
            ]);
            crowdBaseY.push(0.78);
            crowdCoords.push([
                sx1,
                0.78,
                _courtTypes.COURT_DIMS.HALF_WIDTH + 2.6
            ]);
            crowdBaseY.push(0.78);
        }
    }
    // 4. InstancedMesh Cheering Crowd (Single Draw Call!)
    if (crowdCoords.length > 0) {
        var specGeo = trackGeo(new _three.CapsuleGeometry(0.24, 0.55, 4, 8));
        var specMat = trackMat(new _three.MeshStandardMaterial({
            roughness: 0.78
        }));
        crowdInstanced = new _three.InstancedMesh(specGeo, specMat, crowdCoords.length);
        var palette = [
            new _three.Color(homeTeam.colors.primary || '#e11d48'),
            new _three.Color(homeTeam.colors.secondary || '#f59e0b'),
            new _three.Color(0x334155),
            new _three.Color(0x64748b),
            new _three.Color(0xf8fafc)
        ];
        for(var i2 = 0; i2 < crowdCoords.length; i2++){
            var _crowdCoords_i = crowdCoords[i2], cx = _crowdCoords_i[0], cy = _crowdCoords_i[1], cz = _crowdCoords_i[2];
            crowdDummy.position.set(cx, cy, cz);
            crowdDummy.updateMatrix();
            crowdInstanced.setMatrixAt(i2, crowdDummy.matrix);
            crowdInstanced.setColorAt(i2, palette[i2 % palette.length]);
        }
        crowdInstanced.instanceMatrix.needsUpdate = true;
        if (crowdInstanced.instanceColor) crowdInstanced.instanceColor.needsUpdate = true;
        root.add(crowdInstanced);
    }
    // Helper to deform multi-ring net vertices cleanly on swish / dunk ripple
    var updateSingleHoop = function updateSingleHoop(rig, rimFlex, netRipple, netTime, buzzerLit) {
        // Breakaway downward rim flex on contact dunks
        rig.rimPivot.rotation.z = rig.side * rimFlex * 0.22;
        // Red LED Backboard perimeter ignition
        rig.ledMat.emissiveIntensity = buzzerLit ? 2.4 : 0.0;
        rig.ledMat.color.setHex(buzzerLit ? 0xff2233 : 0x3f1d24);
        // Vertex-animated rippling net
        if (netRipple > 0.005) {
            var posAttr = rig.netGeo.attributes.position;
            var arr = posAttr.array;
            var base = rig.netBasePos;
            for(var i = 0; i < arr.length; i += 3){
                var bx = base[i];
                var by = base[i + 1];
                var bz = base[i + 2];
                // Top vertices (by > 0.18) remain pinned to rim; lower rings flare & ripple
                var depth = Math.max(0, (0.23 - by) / 0.46);
                var wave = Math.sin(netTime * 19.0 - depth * 6.0) * netRipple * depth;
                var flare = 1 + wave * 0.42;
                arr[i] = bx * flare;
                arr[i + 1] = by + Math.abs(wave) * 0.09;
                arr[i + 2] = bz * flare;
            }
            posAttr.needsUpdate = true;
        }
    };
    return {
        root: root,
        setHardwoodReflections: function setHardwoodReflections(enabled) {
            if (asphalt || venue === 'STREET_KINGS') return;
            courtMat.roughness = enabled ? 0.24 : 0.64;
            courtMat.metalness = enabled ? 0.16 : 0.04;
            courtMat.envMapIntensity = enabled ? 1.35 : 0.55;
            courtMat.needsUpdate = true;
        },
        updateHoops: function updateHoops(hoops) {
            updateSingleHoop(leftHoop.rig, hoops.leftRimFlex, hoops.leftNetRipple, hoops.leftNetTime, hoops.buzzerLit);
            updateSingleHoop(rightHoop.rig, hoops.rightRimFlex, hoops.rightNetRipple, hoops.rightNetTime, hoops.buzzerLit);
        },
        updateEnvironment: function updateEnvironment(elapsedSec, excitement) {
            if (crowdInstanced) {
                var jumpAmp = 0.05 + excitement * 0.24;
                var freq = 3.2 + excitement * 6.5;
                for(var i = 0; i < crowdCoords.length; i++){
                    var _crowdCoords_i = crowdCoords[i], cx = _crowdCoords_i[0], cz = _crowdCoords_i[2];
                    var bounce = Math.abs(Math.sin(elapsedSec * freq + i * 0.73)) * jumpAmp;
                    crowdDummy.position.set(cx, crowdBaseY[i] + bounce, cz);
                    crowdDummy.updateMatrix();
                    crowdInstanced.setMatrixAt(i, crowdDummy.matrix);
                }
                crowdInstanced.instanceMatrix.needsUpdate = true;
            }
            if (rotorMesh) {
                rotorMesh.position.x = Math.sin(elapsedSec * 0.22) * 22;
                rotorMesh.position.z = -17 + Math.cos(elapsedSec * 0.22) * 5;
                rotorMesh.rotation.y = Math.cos(elapsedSec * 0.22) > 0 ? 0 : Math.PI;
            }
            if (oceanMesh) {
                oceanMesh.position.y = -0.08 + Math.sin(elapsedSec * 1.6) * 0.06;
            }
            for(var i1 = 0; i1 < torchLights.length; i1++){
                torchLights[i1].intensity = 16 + Math.sin(elapsedSec * 11 + i1 * 2.1) * 4;
            }
        },
        updateJumbotron: function updateJumbotron(awayAbbr, awayPts, homeAbbr, homePts, clockText, banner) {
            if (jumbotronCtrl) {
                jumbotronCtrl.update(awayAbbr, awayPts, homeAbbr, homePts, clockText, banner);
            }
        },
        dispose: function dispose() {
            courtTex.dispose();
            if (jumbotronCtrl) jumbotronCtrl.dispose();
            ownedTextures.forEach(function(t) {
                return t.dispose();
            });
            ownedGeos.forEach(function(g) {
                return g.dispose();
            });
            ownedMats.forEach(function(m) {
                return m.dispose();
            });
        }
    };
}

});

})(window.ArcadeMod);
