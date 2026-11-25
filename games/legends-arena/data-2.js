(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/components/HeroShowcase3D ===
ArcadeMod.define("src/games/legends-arena/mlbb/components/HeroShowcase3D", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HeroShowcase3D", {
    enumerable: true,
    get: function() {
        return HeroShowcase3D;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _RoomEnvironment = require("three/examples/jsm/environments/RoomEnvironment.js");
var _threeShared = require("../../../../core/threeShared");
var _heroes = require("../data/heroes");
var _ThreeHeroModels = require("../engine/ThreeHeroModels");
var _HeroAvatarSvg = require("./HeroAvatarSvg");
var _AudioEngine = require("../engine/AudioEngine");
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
function disposeThreeGroup(group) {
    group.traverse(function(obj) {
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
}
var HeroShowcase3D = function HeroShowcase3D(param) {
    var heroId = param.heroId, skinId = param.skinId, poseSignal = param.poseSignal, onTapHero = param.onTapHero;
    var _hero_skins_find;
    var hostRef = (0, _react.useRef)(null);
    var _useState = (0, _react.useState)(false), webglFailed = _useState[0], setWebglFailed = _useState[1];
    var targetRotYRef = (0, _react.useRef)(0.35);
    var currentRotYRef = (0, _react.useRef)(0.35);
    var targetPitchRef = (0, _react.useRef)(0.14);
    var currentPitchRef = (0, _react.useRef)(0.14);
    var poseTimerRef = (0, _react.useRef)(0);
    var dragRef = (0, _react.useRef)(null);
    var sceneSlotRef = (0, _react.useRef)(null);
    var hero = (0, _heroes.getMlbbHeroById)(heroId);
    var skin = (_hero_skins_find = hero.skins.find(function(s) {
        return s.id === skinId;
    })) != null ? _hero_skins_find : hero.skins[0];
    // Mount persistent WebGL showcase studio once
    (0, _react.useEffect)(function() {
        var host = hostRef.current;
        if (!host || webglFailed) return;
        var renderer;
        var isSoft = (0, _threeShared.detectSoftwareWebGL)();
        try {
            renderer = new _three.WebGLRenderer({
                antialias: !isSoft,
                powerPreference: 'high-performance'
            });
            renderer.outputColorSpace = _three.SRGBColorSpace;
            renderer.toneMapping = _three.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.15;
            renderer.setPixelRatio(isSoft ? 1 : Math.min(window.devicePixelRatio || 1, 2));
            renderer.shadowMap.enabled = !isSoft;
            renderer.shadowMap.type = _three.PCFSoftShadowMap;
            renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
        } catch (unused) {
            setWebglFailed(true);
            return;
        }
        var onContextLost = function onContextLost(e) {
            e.preventDefault();
            setWebglFailed(true);
        };
        renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
        host.innerHTML = '';
        host.appendChild(renderer.domElement);
        var scene = new _three.Scene();
        scene.background = new _three.Color(0x070d1f);
        scene.fog = new _three.FogExp2(0x0b132b, 0.035);
        var envTex = null;
        try {
            var pmrem = new _three.PMREMGenerator(renderer);
            var roomEnv = new _RoomEnvironment.RoomEnvironment();
            envTex = pmrem.fromScene(roomEnv, 0.04).texture;
            roomEnv.dispose();
            pmrem.dispose();
            scene.environment = envTex;
        } catch (unused) {
            envTex = null;
        }
        var camera = new _three.PerspectiveCamera(38, 16 / 9, 0.2, 120);
        camera.position.set(0, 2.75, 6.9);
        camera.lookAt(0, 1.55, 0);
        // Subtle royal-navy radial backdrop sphere
        var skyGeo = new _three.SphereGeometry(55, 20, 14);
        var skyMat = new _three.ShaderMaterial({
            side: _three.BackSide,
            depthWrite: false,
            uniforms: {
                uTop: {
                    value: new _three.Color(0x050915)
                },
                uMid: {
                    value: new _three.Color(0x0c1736)
                },
                uHorizon: {
                    value: new _three.Color(0x1b3463)
                }
            },
            vertexShader: "\n        varying vec3 vPos;\n        void main() {\n          vec4 wp = modelMatrix * vec4(position, 1.0);\n          vPos = wp.xyz;\n          gl_Position = projectionMatrix * viewMatrix * wp;\n        }\n      ",
            fragmentShader: "\n        uniform vec3 uTop;\n        uniform vec3 uMid;\n        uniform vec3 uHorizon;\n        varying vec3 vPos;\n        void main() {\n          vec3 n = normalize(vPos);\n          float h = clamp(n.y, -0.3, 1.0);\n          vec3 col = h < 0.15\n            ? mix(uHorizon, uMid, smoothstep(-0.18, 0.15, h))\n            : mix(uMid, uTop, smoothstep(0.15, 0.72, h));\n          gl_FragColor = vec4(col, 1.0);\n        }\n      "
        });
        scene.add(new _three.Mesh(skyGeo, skyMat));
        // 3-Point Studio Lighting (Warm Gold Key + Celestial Azure Fill + Dynamic Skin Accent Rim)
        var hemi = new _three.HemisphereLight(0x93c5fd, 0x0b132b, 1.0);
        var key = new _three.DirectionalLight(0xffe8b0, 2.35);
        key.position.set(6, 10, 7);
        if (!isSoft) {
            key.castShadow = true;
            key.shadow.mapSize.set(1024, 1024);
            var d = 6;
            key.shadow.camera.left = -d;
            key.shadow.camera.right = d;
            key.shadow.camera.top = d;
            key.shadow.camera.bottom = -d;
            key.shadow.bias = -0.0005;
            key.shadow.normalBias = 0.02;
        }
        var rimFill = new _three.DirectionalLight(0x38bdf8, 1.0);
        rimFill.position.set(-7, 5, 3);
        var accentLight = new _three.PointLight(0xe6b84c, 4.5, 16);
        accentLight.position.set(-2.6, 3.6, -2.5);
        scene.add(hemi, key, rimFill, accentLight);
        // Sculpted Obsidian & Gold Runic Pedestal
        var obsidianMat = new _three.MeshStandardMaterial({
            color: 0x0f1c3b,
            roughness: 0.34,
            metalness: 0.48
        });
        var stoneMat = new _three.MeshStandardMaterial({
            color: 0x162952,
            roughness: 0.5,
            metalness: 0.32
        });
        var goldMat = new _three.MeshStandardMaterial({
            color: 0xe6b84c,
            emissive: 0x8a580e,
            emissiveIntensity: 0.35,
            roughness: 0.24,
            metalness: 0.88
        });
        var baseDisc = new _three.Mesh(new _three.CylinderGeometry(3.2, 3.65, 0.36, 28), obsidianMat);
        baseDisc.position.y = -0.36;
        baseDisc.receiveShadow = true;
        var topPlinth = new _three.Mesh(new _three.CylinderGeometry(2.3, 2.55, 0.24, 28), stoneMat);
        topPlinth.position.y = -0.12;
        topPlinth.receiveShadow = true;
        var goldBevel = new _three.Mesh(new _three.TorusGeometry(2.36, 0.045, 10, 48), goldMat);
        goldBevel.rotation.x = Math.PI / 2;
        goldBevel.position.y = 0.01;
        var runeMat = new _three.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.55,
            side: _three.DoubleSide
        });
        var outerRune = new _three.Mesh(new _three.RingGeometry(1.75, 1.92, 48), runeMat);
        outerRune.rotation.x = -Math.PI / 2;
        outerRune.position.y = 0.02;
        var innerRuneMat = new _three.MeshBasicMaterial({
            color: 0xfde047,
            transparent: true,
            opacity: 0.45,
            side: _three.DoubleSide
        });
        var innerRune = new _three.Mesh(new _three.RingGeometry(1.12, 1.2, 36), innerRuneMat);
        innerRune.rotation.x = -Math.PI / 2;
        innerRune.position.y = 0.025;
        var shockMat = new _three.MeshBasicMaterial({
            color: 0xffe28a,
            transparent: true,
            opacity: 0,
            side: _three.DoubleSide
        });
        var shockRing = new _three.Mesh(new _three.RingGeometry(0.95, 1.22, 40), shockMat);
        shockRing.rotation.x = -Math.PI / 2;
        shockRing.position.y = 0.05;
        scene.add(baseDisc, topPlinth, goldBevel, outerRune, innerRune, shockRing);
        // Floating golden dust motes
        var moteCount = isSoft ? 28 : 54;
        var moteGeo = new _three.BufferGeometry();
        var motePos = new Float32Array(moteCount * 3);
        for(var i = 0; i < moteCount; i++){
            var ang = Math.random() * Math.PI * 2;
            var rad = 1.6 + Math.random() * 4.2;
            motePos[i * 3] = Math.cos(ang) * rad;
            motePos[i * 3 + 1] = 0.2 + Math.random() * 4.5;
            motePos[i * 3 + 2] = Math.sin(ang) * rad;
        }
        moteGeo.setAttribute('position', new _three.BufferAttribute(motePos, 3));
        var moteMat = new _three.PointsMaterial({
            color: 0xfde68a,
            size: 0.085,
            transparent: true,
            opacity: 0.72,
            depthWrite: false
        });
        var motes = new _three.Points(moteGeo, moteMat);
        scene.add(motes);
        var heroAnchor = new _three.Group();
        heroAnchor.position.set(0, 0.02, 0);
        scene.add(heroAnchor);
        sceneSlotRef.current = {
            heroAnchor: heroAnchor,
            heroRig: null,
            accentLight: accentLight,
            runeMat: runeMat,
            innerRuneMat: innerRuneMat,
            shockMat: shockMat,
            shockRing: shockRing
        };
        var resize = function resize() {
            var w = Math.max(120, host.clientWidth);
            var h = Math.max(120, host.clientHeight);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
        };
        resize();
        var ro = new ResizeObserver(resize);
        ro.observe(host);
        var rafId = 0;
        var lastTs = performance.now();
        var elapsed = 0;
        var tick = function tick1(now) {
            rafId = requestAnimationFrame(tick);
            var dt = Math.min(0.05, (now - lastTs) / 1000);
            lastTs = now;
            elapsed += dt;
            if (!dragRef.current) {
                targetRotYRef.current += dt * 0.22;
            }
            currentRotYRef.current += (targetRotYRef.current - currentRotYRef.current) * Math.min(1, dt * 8);
            currentPitchRef.current += (targetPitchRef.current - currentPitchRef.current) * Math.min(1, dt * 8);
            heroAnchor.rotation.y = currentRotYRef.current;
            // Subtle camera elevation from pitch drag
            camera.position.y = 2.45 + currentPitchRef.current * 2.2;
            camera.lookAt(0, 1.5, 0);
            outerRune.rotation.z = elapsed * 0.35;
            innerRune.rotation.z = -elapsed * 0.55;
            motes.rotation.y = elapsed * 0.08;
            var slot = sceneSlotRef.current;
            if (slot && slot.heroRig) {
                var rig = slot.heroRig;
                var bob = Math.sin(elapsed * 2.4) * 0.045;
                if (poseTimerRef.current > 0) {
                    poseTimerRef.current = Math.max(0, poseTimerRef.current - dt);
                    var p = 1 - poseTimerRef.current / 0.85;
                    var arc = Math.sin(p * Math.PI);
                    rig.group.position.y = bob + arc * 0.42;
                    rig.weaponPivot.rotation.x = -arc * 1.48;
                    rig.leftArm.rotation.x = arc * 0.58;
                    rig.capePivot.rotation.x = 0.18 + arc * 0.45;
                    var ringScale = 0.9 + p * 2.3;
                    shockRing.scale.set(ringScale, ringScale, 1);
                    shockMat.opacity = Math.max(0, (1 - p) * 0.88);
                } else {
                    rig.group.position.y = bob;
                    rig.weaponPivot.rotation.x = Math.sin(elapsed * 1.9) * 0.1;
                    rig.leftArm.rotation.x = -Math.sin(elapsed * 1.9) * 0.08;
                    rig.capePivot.rotation.x = 0.14 + Math.sin(elapsed * 2.9) * 0.06;
                    shockMat.opacity = 0;
                }
                rig.headGroup.rotation.y = Math.sin(elapsed * 1.1) * 0.12;
            }
            renderer.render(scene, camera);
        };
        rafId = requestAnimationFrame(tick);
        return function() {
            var _sceneSlotRef_current;
            cancelAnimationFrame(rafId);
            ro.disconnect();
            renderer.domElement.removeEventListener('webglcontextlost', onContextLost, false);
            if ((_sceneSlotRef_current = sceneSlotRef.current) == null ? void 0 : _sceneSlotRef_current.heroRig) {
                disposeThreeGroup(sceneSlotRef.current.heroRig.group);
            }
            sceneSlotRef.current = null;
            disposeThreeGroup(scene);
            if (envTex) envTex.dispose();
            renderer.dispose();
        };
    }, [
        webglFailed
    ]);
    // Swap 3D champion rig & skin colors in-place whenever hero or skin changes
    (0, _react.useEffect)(function() {
        var slot = sceneSlotRef.current;
        if (!slot || webglFailed) return;
        if (slot.heroRig) {
            slot.heroAnchor.remove(slot.heroRig.group);
            disposeThreeGroup(slot.heroRig.group);
            slot.heroRig = null;
        }
        var rig = (0, _ThreeHeroModels.buildMlbbHeroRig3D)(hero.role, skin.color, skin.accent, 'blue', true, 1.56);
        rig.baseRing.visible = false;
        slot.heroAnchor.add(rig.group);
        slot.heroRig = rig;
        var primaryInt = (0, _ThreeHeroModels.hexToInt)(skin.color);
        var accentInt = (0, _ThreeHeroModels.hexToInt)(skin.accent);
        slot.accentLight.color.setHex(accentInt);
        slot.runeMat.color.setHex(primaryInt);
        slot.innerRuneMat.color.setHex(accentInt);
        slot.shockMat.color.setHex(accentInt);
        poseTimerRef.current = 0.55;
    }, [
        hero,
        skin,
        webglFailed
    ]);
    // Trigger combat pose + skill-colored shockwave when user clicks a Skill Preview card
    (0, _react.useEffect)(function() {
        if (!poseSignal || !poseSignal.nonce) return;
        poseTimerRef.current = 0.85;
        if (sceneSlotRef.current && poseSignal.color) {
            sceneSlotRef.current.shockMat.color.setHex((0, _ThreeHeroModels.hexToInt)(poseSignal.color));
            sceneSlotRef.current.accentLight.color.setHex((0, _ThreeHeroModels.hexToInt)(poseSignal.color));
        }
    }, [
        poseSignal
    ]);
    var triggerPose = function triggerPose() {
        poseTimerRef.current = 0.85;
        if (sceneSlotRef.current) {
            sceneSlotRef.current.shockMat.color.setHex((0, _ThreeHeroModels.hexToInt)(skin.accent));
        }
        _AudioEngine.mlbbAudio.playClick();
        onTapHero == null ? void 0 : onTapHero();
    };
    var handlePointerDown = function handlePointerDown(e) {
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            lastX: e.clientX,
            lastY: e.clientY,
            moved: false
        };
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    var handlePointerMove = function handlePointerMove(e) {
        if (!dragRef.current) return;
        var dx = e.clientX - dragRef.current.lastX;
        var dy = e.clientY - dragRef.current.lastY;
        if (Math.hypot(e.clientX - dragRef.current.startX, e.clientY - dragRef.current.startY) > 6) {
            dragRef.current.moved = true;
        }
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastY = e.clientY;
        targetRotYRef.current += dx * 0.012;
        targetPitchRef.current = Math.max(-0.08, Math.min(0.42, targetPitchRef.current + dy * 0.004));
    };
    var handlePointerUp = function handlePointerUp() {
        if (dragRef.current && !dragRef.current.moved) {
            triggerPose();
        }
        dragRef.current = null;
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "relative w-full h-full select-none overflow-hidden rounded-xl border border-[#E6B84C]/35 bg-[#070D1F] cursor-grab active:cursor-grabbing touch-none",
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: function onPointerCancel() {
            dragRef.current = null;
        },
        children: [
            webglFailed ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "absolute inset-0 flex flex-col items-center justify-center",
                style: {
                    background: "radial-gradient(circle at 50% 42%, " + skin.color + "38 0%, #0B132B 62%, #050915 100%)"
                },
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "transition-transform duration-300 hover:scale-105",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                            heroId: hero.id,
                            skinColor: skin.color,
                            skinAccent: skin.accent,
                            size: 118
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "mt-2 text-[10px] font-bold tracking-wider uppercase text-slate-400",
                        children: "2D Champion Preview"
                    })
                ]
            }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                ref: hostRef,
                className: "absolute inset-0 w-full h-full"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "pointer-events-none absolute top-2.5 left-3 flex items-center gap-2",
                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                    className: "text-[10px] font-black tracking-widest uppercase text-[#FFE28A] drop-shadow",
                    children: [
                        skin.tag,
                        " \xb7 ",
                        skin.name
                    ]
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "pointer-events-none absolute top-2.5 right-3 text-[10px] font-bold text-slate-300/80",
                children: "Drag 360\xb0 \xb7 Tap to Pose"
            }),
            (poseSignal == null ? void 0 : poseSignal.label) && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "pointer-events-none absolute bottom-2.5 right-3 px-2 py-0.5 rounded bg-[#070D1F]/90 border border-[#E6B84C]/45 text-[10px] font-black text-[#FFE28A]",
                children: [
                    "Preview: ",
                    poseSignal.label
                ]
            })
        ]
    });
};

});
// === MODULE: src/games/legends-arena/mlbb/components/PrepAndHeroModals ===
ArcadeMod.define("src/games/legends-arena/mlbb/components/PrepAndHeroModals", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PrepAndHeroModals", {
    enumerable: true,
    get: function() {
        return PrepAndHeroModals;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _heroes = require("../data/heroes");
var _items = require("../data/items");
var _emblems = require("../data/emblems");
var _HeroAvatarSvg = require("./HeroAvatarSvg");
var _AudioEngine = require("../engine/AudioEngine");
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
var PrepAndHeroModals = function PrepAndHeroModals(param) {
    var mode = param.mode, profile = param.profile, onClose = param.onClose, onUpdateProfile = param.onUpdateProfile;
    var _profile_activeBuildSlot_profile_selectedHeroId, _profile_savedBuilds_buildHeroId, _heroBuilds_buildSlotIdx;
    var _MLBB_EMBLEMS_find, _inspectHero_skins_find, _inspectHero_skins_find1;
    var _useState = (0, _react.useState)('emblems'), prepTab = _useState[0], setPrepTab = _useState[1];
    var _useState1 = (0, _react.useState)('All'), roleFilter = _useState1[0], setRoleFilter = _useState1[1];
    var _useState2 = (0, _react.useState)('All'), laneFilter = _useState2[0], setLaneFilter = _useState2[1];
    var _useState3 = (0, _react.useState)(''), heroSearch = _useState3[0], setHeroSearch = _useState3[1];
    var _useState4 = (0, _react.useState)(''), buildHeroSearch = _useState4[0], setBuildHeroSearch = _useState4[1];
    var _useState5 = (0, _react.useState)(profile.selectedHeroId), inspectHeroId = _useState5[0], setInspectHeroId = _useState5[1];
    var _useState6 = (0, _react.useState)(profile.selectedHeroId), buildHeroId = _useState6[0], setBuildHeroId = _useState6[1];
    var _useState7 = (0, _react.useState)((_profile_activeBuildSlot_profile_selectedHeroId = profile.activeBuildSlot[profile.selectedHeroId]) != null ? _profile_activeBuildSlot_profile_selectedHeroId : 0), buildSlotIdx = _useState7[0], setBuildSlotIdx = _useState7[1];
    var _useState8 = (0, _react.useState)(null), editingItemIdx = _useState8[0], setEditingItemIdx = _useState8[1];
    var _useState9 = (0, _react.useState)(0), selectedEmoteSlot = _useState9[0], setSelectedEmoteSlot = _useState9[1];
    var filteredGalleryHeroes = (0, _react.useMemo)(function() {
        var q = heroSearch.trim().toLowerCase();
        return _heroes.MLBB_ALL_HEROES.filter(function(h) {
            if (roleFilter !== 'All' && h.role !== roleFilter) return false;
            if (laneFilter !== 'All' && h.lane !== laneFilter) return false;
            if (q && !h.name.toLowerCase().includes(q) && !h.title.toLowerCase().includes(q) && !h.specialty.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [
        heroSearch,
        roleFilter,
        laneFilter
    ]);
    var filteredBuildHeroes = (0, _react.useMemo)(function() {
        var q = buildHeroSearch.trim().toLowerCase();
        if (!q) return _heroes.MLBB_ALL_HEROES;
        return _heroes.MLBB_ALL_HEROES.filter(function(h) {
            return h.name.toLowerCase().includes(q) || h.role.toLowerCase().includes(q);
        });
    }, [
        buildHeroSearch
    ]);
    var inspectHero = (0, _heroes.getMlbbHeroById)(inspectHeroId);
    var activeEmblemId = profile.selectedEmblemId;
    var activeTalents = profile.emblemTalents[activeEmblemId];
    var _useState10 = (0, _react.useState)('all'), buildItemFilter = _useState10[0], setBuildItemFilter = _useState10[1];
    var buildHero = (0, _heroes.getMlbbHeroById)(buildHeroId);
    var proTemplates = (0, _react.useMemo)(function() {
        return (0, _items.getProBuildTemplatesForHero)(buildHero);
    }, [
        buildHero
    ]);
    var emblemPreviewStats = (0, _react.useMemo)(function() {
        return (0, _emblems.aggregateEmblemAndTalentPreviewStats)(activeEmblemId, activeTalents);
    }, [
        activeEmblemId,
        activeTalents
    ]);
    var heroBuilds = (_profile_savedBuilds_buildHeroId = profile.savedBuilds[buildHeroId]) != null ? _profile_savedBuilds_buildHeroId : [
        proTemplates[0].items,
        proTemplates[1].items,
        proTemplates[2].items
    ];
    var currentBuild = (_heroBuilds_buildSlotIdx = heroBuilds[buildSlotIdx]) != null ? _heroBuilds_buildSlotIdx : buildHero.recommendedBuild;
    var selectableBuildItems = (0, _react.useMemo)(function() {
        return _items.MLBB_ITEMS.filter(function(i) {
            if (i.blessingKind || i.category === 'consumable' || i.category === 'unique') return false;
            var isBootOrT3 = i.tier === 3 || i.category === 'movement' && i.tier === 2;
            if (!isBootOrT3) return false;
            if (buildItemFilter !== 'all' && i.category !== buildItemFilter) return false;
            return true;
        });
    }, [
        buildItemFilter
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "fixed inset-0 z-40 bg-slate-950/82 flex items-center justify-center p-3",
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "w-full max-w-5xl max-h-[88vh] rounded-2xl bg-[#0B132B] border-2 border-[#F5C451]/60 shadow-2xl flex flex-col overflow-hidden text-slate-100",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex items-center justify-between px-5 py-3 bg-[#101C3D] border-b border-[#F5C451]/30",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "text-base font-black text-[#F5C451] uppercase tracking-wide",
                            children: mode === 'prep' ? 'Battle Preparation — Emblems, Builds, Spells & Emotes' : "Hero Gallery — All " + _heroes.MLBB_ALL_HEROES.length + " Champions (2026)"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            onClick: onClose,
                            className: "w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-white font-black cursor-pointer",
                            children: "✕"
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "flex-1 overflow-y-auto p-4",
                    children: mode === 'prep' ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "flex flex-wrap gap-1.5",
                                children: [
                                    {
                                        id: 'emblems',
                                        label: 'Emblems & Talents'
                                    },
                                    {
                                        id: 'builds',
                                        label: 'Equipment Builds'
                                    },
                                    {
                                        id: 'spells',
                                        label: 'Battle Spells (12)'
                                    },
                                    {
                                        id: 'emotes',
                                        label: 'Emote Wheel (4-Slot)'
                                    },
                                    {
                                        id: 'quickchat',
                                        label: 'Quick Chat'
                                    },
                                    {
                                        id: 'effects',
                                        label: 'Battle Effects'
                                    }
                                ].map(function(t) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            _AudioEngine.mlbbAudio.playClick();
                                            setPrepTab(t.id);
                                        },
                                        className: "px-3.5 py-1.5 rounded-lg text-xs font-black uppercase cursor-pointer " + (prepTab === t.id ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'),
                                        children: t.label
                                    }, t.id);
                                })
                            }),
                            prepTab === 'emblems' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p-3 rounded-xl bg-[#101C3D] border border-[#F5C451]/45 flex flex-wrap items-center justify-between gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "text-[11px] font-black text-[#F5C451] uppercase tracking-wide",
                                                        children: [
                                                            "Active Lv. 60 Max Emblem Loadout — ",
                                                            (_MLBB_EMBLEMS_find = _emblems.MLBB_EMBLEMS.find(function(e) {
                                                                return e.id === activeEmblemId;
                                                            })) == null ? void 0 : _MLBB_EMBLEMS_find.name
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] font-bold text-emerald-300 mlbb-num",
                                                        children: emblemPreviewStats.map(function(s) {
                                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                children: [
                                                                    s.value,
                                                                    " ",
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                        className: "text-slate-300 font-semibold",
                                                                        children: s.label
                                                                    })
                                                                ]
                                                            }, s.label);
                                                        })
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-[10px] font-black text-cyan-300 mlbb-num",
                                                children: [
                                                    "ALL 7 EMBLEMS UNLOCKED \xb7 LV. 60 MAX \xb7 ",
                                                    _emblems.MLBB_TALENTS.length,
                                                    " TALENTS"
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "space-y-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-xs font-black text-[#F5C451]",
                                                        children: "7 EMBLEM SETS (LV. 60 MAX)"
                                                    }),
                                                    _emblems.MLBB_EMBLEMS.map(function(emb) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                            onClick: function onClick() {
                                                                _AudioEngine.mlbbAudio.playClick();
                                                                onUpdateProfile(function(p) {
                                                                    return _extends({}, p, {
                                                                        selectedEmblemId: emb.id
                                                                    });
                                                                });
                                                            },
                                                            className: "w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer " + (activeEmblemId === emb.id ? 'bg-amber-500/20 border-[#F5C451]' : 'bg-[#101C3D] border-slate-700 hover:border-slate-500'),
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "text-xl",
                                                                    children: emb.icon
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "min-w-0 flex-1",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                            className: "flex items-center justify-between gap-1",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                                    className: "text-xs font-black text-white",
                                                                                    children: emb.name
                                                                                }),
                                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                                    className: "text-[9px] font-black text-amber-300 mlbb-num",
                                                                                    children: "LV.60"
                                                                                })
                                                                            ]
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                            className: "text-[10px] text-slate-300",
                                                                            children: emb.desc
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }, emb.id);
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "md:col-span-2 space-y-3",
                                                children: [
                                                    1,
                                                    2,
                                                    3
                                                ].map(function(tier) {
                                                    var tierKey = tier === 1 ? 't1' : tier === 2 ? 't2' : 't3';
                                                    var tierTalents = _emblems.MLBB_TALENTS.filter(function(t) {
                                                        return t.tier === tier;
                                                    });
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-xs font-black text-[#F5C451] mb-2",
                                                                children: [
                                                                    "TIER ",
                                                                    tier,
                                                                    " ",
                                                                    tier === 1 ? 'ATTRIBUTE' : tier === 2 ? 'UTILITY' : 'CORE KEYSTONE',
                                                                    " TALENT (",
                                                                    tierTalents.length,
                                                                    ")"
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "grid grid-cols-2 sm:grid-cols-3 gap-2",
                                                                children: tierTalents.map(function(tal) {
                                                                    var selected = activeTalents[tierKey] === tal.id;
                                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                                        onClick: function onClick() {
                                                                            _AudioEngine.mlbbAudio.playClick();
                                                                            onUpdateProfile(function(p) {
                                                                                var _obj, _obj1;
                                                                                return _extends({}, p, {
                                                                                    emblemTalents: _extends({}, p.emblemTalents, (_obj1 = {}, _obj1[activeEmblemId] = _extends({}, p.emblemTalents[activeEmblemId], (_obj = {}, _obj[tierKey] = tal.id, _obj)), _obj1))
                                                                                });
                                                                            });
                                                                        },
                                                                        className: "p-2 rounded-lg border text-left cursor-pointer " + (selected ? 'bg-sky-500/20 border-sky-400' : 'bg-slate-900/80 border-slate-700'),
                                                                        children: [
                                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                                className: "text-xs font-black text-white",
                                                                                children: [
                                                                                    tal.icon,
                                                                                    " ",
                                                                                    tal.name
                                                                                ]
                                                                            }),
                                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                                className: "text-[10px] text-slate-300 mt-0.5 leading-snug",
                                                                                children: tal.desc
                                                                            })
                                                                        ]
                                                                    }, tal.id);
                                                                })
                                                            })
                                                        ]
                                                    }, tier);
                                                })
                                            })
                                        ]
                                    })
                                ]
                            }),
                            prepTab === 'builds' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                value: buildHeroSearch,
                                                onChange: function onChange(e) {
                                                    return setBuildHeroSearch(e.target.value);
                                                },
                                                placeholder: "Search all " + _heroes.MLBB_ALL_HEROES.length + " heroes for build...",
                                                className: "flex-1 max-w-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-[11px] font-bold text-amber-300",
                                                children: [
                                                    "Editing: ",
                                                    (0, _heroes.getMlbbHeroById)(buildHeroId).name
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "flex flex-wrap items-center gap-1.5 max-h-28 overflow-y-auto pr-1",
                                        children: filteredBuildHeroes.map(function(h) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _profile_activeBuildSlot_h_id;
                                                    setBuildHeroId(h.id);
                                                    setBuildSlotIdx((_profile_activeBuildSlot_h_id = profile.activeBuildSlot[h.id]) != null ? _profile_activeBuildSlot_h_id : 0);
                                                    setEditingItemIdx(null);
                                                },
                                                className: "px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer " + (buildHeroId === h.id ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'),
                                                children: h.name
                                            }, h.id);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex flex-wrap items-center justify-between gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    0,
                                                    1,
                                                    2
                                                ].map(function(s) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        onClick: function onClick() {
                                                            setBuildSlotIdx(s);
                                                            onUpdateProfile(function(p) {
                                                                var _obj;
                                                                return _extends({}, p, {
                                                                    activeBuildSlot: _extends({}, p.activeBuildSlot, (_obj = {}, _obj[buildHeroId] = s, _obj))
                                                                });
                                                            });
                                                        },
                                                        className: "px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer " + (buildSlotIdx === s ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300'),
                                                        children: [
                                                            "Build Preset ",
                                                            s + 1
                                                        ]
                                                    }, s);
                                                })
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex flex-wrap items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-[10px] font-black text-amber-300 uppercase",
                                                        children: "1-Click Pro Builds:"
                                                    }),
                                                    proTemplates.map(function(tpl) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                            onClick: function onClick() {
                                                                _AudioEngine.mlbbAudio.playClick();
                                                                onUpdateProfile(function(p) {
                                                                    var _p_savedBuilds_buildHeroId;
                                                                    var prevSet = (_p_savedBuilds_buildHeroId = p.savedBuilds[buildHeroId]) != null ? _p_savedBuilds_buildHeroId : [
                                                                        [].concat(proTemplates[0].items),
                                                                        [].concat(proTemplates[1].items),
                                                                        [].concat(proTemplates[2].items)
                                                                    ];
                                                                    var nextSet = [
                                                                        [].concat(prevSet[0]),
                                                                        [].concat(prevSet[1]),
                                                                        [].concat(prevSet[2])
                                                                    ];
                                                                    nextSet[buildSlotIdx] = [].concat(tpl.items);
                                                                    var _obj;
                                                                    return _extends({}, p, {
                                                                        savedBuilds: _extends({}, p.savedBuilds, (_obj = {}, _obj[buildHeroId] = nextSet, _obj))
                                                                    });
                                                                });
                                                            },
                                                            className: "px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-[#F5C451]/55 text-[10px] font-black text-amber-200 cursor-pointer",
                                                            title: "Load " + tpl.label + " (" + tpl.tag + ") into Preset " + (buildSlotIdx + 1),
                                                            children: [
                                                                "⭐ ",
                                                                tpl.label
                                                            ]
                                                        }, tpl.id);
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p-3.5 rounded-xl bg-[#101C3D] border border-[#F5C451]/40",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex items-center justify-between text-xs font-bold text-slate-300 mb-2",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: "Click any of the 6 slots below to swap Boots or Tier-3 equipment:"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "text-[11px] text-amber-300 mlbb-num",
                                                        children: [
                                                            "Total: ",
                                                            currentBuild.reduce(function(acc, id) {
                                                                var _ref;
                                                                var _getMlbbItemById;
                                                                return acc + ((_ref = (_getMlbbItemById = (0, _items.getMlbbItemById)(id)) == null ? void 0 : _getMlbbItemById.cost) != null ? _ref : 0);
                                                            }, 0).toLocaleString(),
                                                            "g"
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "grid grid-cols-3 sm:grid-cols-6 gap-2",
                                                children: currentBuild.map(function(itemId, idx) {
                                                    var _ref, _ref1, _ref2;
                                                    var it = (0, _items.getMlbbItemById)(itemId);
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        onClick: function onClick() {
                                                            return setEditingItemIdx(idx);
                                                        },
                                                        className: "p-2.5 rounded-xl border text-center cursor-pointer " + (editingItemIdx === idx ? 'bg-amber-500/20 border-[#F5C451]' : 'bg-slate-900 border-slate-700'),
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-2xl",
                                                                children: (_ref = it == null ? void 0 : it.icon) != null ? _ref : '📦'
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-[11px] font-black text-white mt-1 truncate",
                                                                children: (_ref1 = it == null ? void 0 : it.shortName) != null ? _ref1 : itemId
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-[10px] text-amber-300 mlbb-num",
                                                                children: [
                                                                    (_ref2 = it == null ? void 0 : it.cost) != null ? _ref2 : 0,
                                                                    "g"
                                                                ]
                                                            })
                                                        ]
                                                    }, idx);
                                                })
                                            })
                                        ]
                                    }),
                                    editingItemIdx !== null && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex flex-wrap items-center justify-between gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "text-xs font-black text-[#F5C451]",
                                                        children: [
                                                            "Pick Replacement Item for Slot #",
                                                            editingItemIdx + 1,
                                                            ":"
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "flex gap-1",
                                                        children: [
                                                            'all',
                                                            'movement',
                                                            'attack',
                                                            'magic',
                                                            'defense'
                                                        ].map(function(f) {
                                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                onClick: function onClick() {
                                                                    return setBuildItemFilter(f);
                                                                },
                                                                className: "px-2 py-0.5 rounded text-[10px] font-black uppercase cursor-pointer " + (buildItemFilter === f ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'),
                                                                children: f === 'movement' ? 'Boots' : f
                                                            }, f);
                                                        })
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto",
                                                children: selectableBuildItems.map(function(it) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        onClick: function onClick() {
                                                            onUpdateProfile(function(p) {
                                                                var _p_savedBuilds_buildHeroId;
                                                                var prevSet = (_p_savedBuilds_buildHeroId = p.savedBuilds[buildHeroId]) != null ? _p_savedBuilds_buildHeroId : [
                                                                    [].concat(currentBuild),
                                                                    [].concat(currentBuild),
                                                                    [].concat(currentBuild)
                                                                ];
                                                                var nextSet = [
                                                                    [].concat(prevSet[0]),
                                                                    [].concat(prevSet[1]),
                                                                    [].concat(prevSet[2])
                                                                ];
                                                                nextSet[buildSlotIdx][editingItemIdx] = it.id;
                                                                var _obj;
                                                                return _extends({}, p, {
                                                                    savedBuilds: _extends({}, p.savedBuilds, (_obj = {}, _obj[buildHeroId] = nextSet, _obj))
                                                                });
                                                            });
                                                            setEditingItemIdx(null);
                                                            _AudioEngine.mlbbAudio.playClick();
                                                        },
                                                        className: "p-2 rounded-lg bg-[#101C3D] hover:border-[#F5C451] border border-slate-700 text-left cursor-pointer",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-xs font-black text-white",
                                                                children: [
                                                                    it.icon,
                                                                    " ",
                                                                    it.name
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-[10px] text-amber-300 mlbb-num",
                                                                children: [
                                                                    it.cost,
                                                                    "g \xb7 ",
                                                                    it.category
                                                                ]
                                                            })
                                                        ]
                                                    }, it.id);
                                                })
                                            })
                                        ]
                                    })
                                ]
                            }),
                            prepTab === 'spells' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "grid grid-cols-2 sm:grid-cols-3 gap-2.5",
                                children: _emblems.MLBB_BATTLE_SPELLS.map(function(sp) {
                                    var selected = profile.selectedSpellId === sp.id;
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        onClick: function onClick() {
                                            _AudioEngine.mlbbAudio.playClick();
                                            onUpdateProfile(function(p) {
                                                return _extends({}, p, {
                                                    selectedSpellId: sp.id
                                                });
                                            });
                                        },
                                        className: "p-3 rounded-xl border text-left cursor-pointer " + (selected ? 'bg-amber-500/20 border-[#F5C451]' : 'bg-[#101C3D] border-slate-700'),
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "text-sm font-black text-white",
                                                        children: [
                                                            sp.icon,
                                                            " ",
                                                            sp.name
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "text-[11px] font-bold text-cyan-300 mlbb-num",
                                                        children: [
                                                            sp.cooldown,
                                                            "s CD"
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[11px] text-slate-300 mt-1",
                                                children: sp.desc
                                            })
                                        ]
                                    }, sp.id);
                                })
                            }),
                            prepTab === 'emotes' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p-3.5 rounded-xl bg-[#101C3D] border border-[#F5C451]/40",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-xs font-black text-[#F5C451] mb-2",
                                                children: "EQUIPPED 4-SLOT RADIAL EMOTE WHEEL (TAP SLOT TO ASSIGN)"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "grid grid-cols-4 gap-2.5",
                                                children: profile.equippedEmotes.map(function(emId, idx) {
                                                    var _MLBB_EMOTES_find;
                                                    var em = (_MLBB_EMOTES_find = _emblems.MLBB_EMOTES.find(function(e) {
                                                        return e.id === emId;
                                                    })) != null ? _MLBB_EMOTES_find : _emblems.MLBB_EMOTES[0];
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        onClick: function onClick() {
                                                            return setSelectedEmoteSlot(idx);
                                                        },
                                                        className: "p-3 rounded-xl border text-center cursor-pointer " + (selectedEmoteSlot === idx ? 'bg-amber-500/25 border-[#F5C451]' : 'bg-slate-900 border-slate-700'),
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-[10px] text-slate-400 font-bold",
                                                                children: [
                                                                    "SLOT ",
                                                                    idx + 1
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-2xl my-1",
                                                                children: em.icon
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-xs font-black text-white",
                                                                children: em.name
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-[10px] text-amber-300",
                                                                children: [
                                                                    '"',
                                                                    em.callout,
                                                                    '"'
                                                                ]
                                                            })
                                                        ]
                                                    }, idx);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "grid grid-cols-2 sm:grid-cols-4 gap-2.5",
                                        children: _emblems.MLBB_EMOTES.map(function(em) {
                                            var owned = profile.ownedEmotes.includes(em.id);
                                            var isEquipped = profile.equippedEmotes.includes(em.id);
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex flex-col justify-between gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex items-center justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "text-2xl",
                                                                children: em.icon
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "text-[10px] font-bold",
                                                                style: {
                                                                    color: em.color
                                                                },
                                                                children: em.rarity
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-xs font-black text-white",
                                                                children: em.name
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-[10px] text-slate-300",
                                                                children: [
                                                                    'Callout: "',
                                                                    em.callout,
                                                                    '"'
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    owned ? /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: function onClick() {
                                                            _AudioEngine.mlbbAudio.playEmote(em.sfx);
                                                            onUpdateProfile(function(p) {
                                                                var next = [].concat(p.equippedEmotes);
                                                                next[selectedEmoteSlot] = em.id;
                                                                return _extends({}, p, {
                                                                    equippedEmotes: next
                                                                });
                                                            });
                                                        },
                                                        className: "py-1.5 rounded-lg text-[11px] font-black cursor-pointer " + (isEquipped ? 'bg-emerald-600 text-white' : 'bg-[#F5C451] text-slate-950'),
                                                        children: isEquipped ? 'Equipped ✓' : "Equip to Slot " + (selectedEmoteSlot + 1)
                                                    }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        onClick: function onClick() {
                                                            if (profile.tickets >= em.costTickets && em.costTickets > 0) {
                                                                onUpdateProfile(function(p) {
                                                                    return _extends({}, p, {
                                                                        tickets: p.tickets - em.costTickets,
                                                                        ownedEmotes: [].concat(p.ownedEmotes, [
                                                                            em.id
                                                                        ])
                                                                    });
                                                                });
                                                                _AudioEngine.mlbbAudio.playEmote(em.sfx);
                                                            } else if (profile.bp >= em.costBp && em.costBp > 0) {
                                                                onUpdateProfile(function(p) {
                                                                    return _extends({}, p, {
                                                                        bp: p.bp - em.costBp,
                                                                        ownedEmotes: [].concat(p.ownedEmotes, [
                                                                            em.id
                                                                        ])
                                                                    });
                                                                });
                                                                _AudioEngine.mlbbAudio.playEmote(em.sfx);
                                                            }
                                                        },
                                                        className: "py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-[11px] font-black cursor-pointer mlbb-num",
                                                        children: [
                                                            "Unlock \uD83C\uDF9F️ ",
                                                            em.costTickets
                                                        ]
                                                    })
                                                ]
                                            }, em.id);
                                        })
                                    })
                                ]
                            }),
                            prepTab === 'quickchat' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "grid grid-cols-2 sm:grid-cols-3 gap-2",
                                children: _emblems.MLBB_QUICK_CHAT_OPTIONS.map(function(qc) {
                                    var active = profile.quickChatIds.includes(qc.id);
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        onClick: function onClick() {
                                            onUpdateProfile(function(p) {
                                                var has = p.quickChatIds.includes(qc.id);
                                                if (has && p.quickChatIds.length > 2) {
                                                    return _extends({}, p, {
                                                        quickChatIds: p.quickChatIds.filter(function(x) {
                                                            return x !== qc.id;
                                                        })
                                                    });
                                                }
                                                if (!has && p.quickChatIds.length < 6) {
                                                    return _extends({}, p, {
                                                        quickChatIds: [].concat(p.quickChatIds, [
                                                            qc.id
                                                        ])
                                                    });
                                                }
                                                return p;
                                            });
                                        },
                                        className: "p-2.5 rounded-xl border text-left text-xs font-bold cursor-pointer " + (active ? 'bg-amber-500/20 border-[#F5C451] text-white' : 'bg-[#101C3D] border-slate-700 text-slate-300'),
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[10px] text-amber-300 uppercase",
                                                children: qc.category
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                children: qc.text
                                            })
                                        ]
                                    }, qc.id);
                                })
                            }),
                            prepTab === 'effects' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs",
                                children: [
                                    'recall',
                                    'spawn',
                                    'elim',
                                    'killNotif'
                                ].map(function(cat) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700 space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "font-black text-[#F5C451] uppercase",
                                                children: [
                                                    cat,
                                                    " Effect"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "flex flex-wrap gap-1.5",
                                                children: _emblems.MLBB_BATTLE_EFFECTS[cat].map(function(ef) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: function onClick() {
                                                            return onUpdateProfile(function(p) {
                                                                var _obj;
                                                                return _extends({}, p, {
                                                                    equippedEffects: _extends({}, p.equippedEffects, (_obj = {}, _obj[cat] = ef.id, _obj))
                                                                });
                                                            });
                                                        },
                                                        className: "px-2.5 py-1.5 rounded-lg font-bold cursor-pointer " + (profile.equippedEffects[cat] === ef.id ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-200'),
                                                        children: ef.name
                                                    }, ef.id);
                                                })
                                            })
                                        ]
                                    }, cat);
                                })
                            })
                        ]
                    }) : /* ==================== HERO GALLERY ==================== */ /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "grid grid-cols-1 md:grid-cols-12 gap-4",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "md:col-span-5 space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                value: heroSearch,
                                                onChange: function onChange(e) {
                                                    return setHeroSearch(e.target.value);
                                                },
                                                placeholder: "Search " + _heroes.MLBB_ALL_HEROES.length + " heroes (e.g. Kalea, Zetian, Obsidia)...",
                                                className: "flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-[10px] font-black text-[#F5C451] mlbb-num whitespace-nowrap",
                                                children: [
                                                    filteredGalleryHeroes.length,
                                                    "/",
                                                    _heroes.MLBB_ALL_HEROES.length
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "flex flex-wrap gap-1",
                                        children: [
                                            'All',
                                            'Tank',
                                            'Fighter',
                                            'Assassin',
                                            'Mage',
                                            'Marksman',
                                            'Support'
                                        ].map(function(r) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    return setRoleFilter(r);
                                                },
                                                className: "px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer " + (roleFilter === r ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'),
                                                children: r
                                            }, r);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "flex flex-wrap gap-1",
                                        children: [
                                            'All',
                                            'EXP',
                                            'Jungle',
                                            'Mid',
                                            'Gold',
                                            'Roam'
                                        ].map(function(ln) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    return setLaneFilter(ln);
                                                },
                                                className: "px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer " + (laneFilter === ln ? 'bg-sky-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400 border border-slate-700'),
                                                children: ln === 'All' ? 'All Lanes' : ln
                                            }, ln);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "grid grid-cols-2 gap-2 max-h-[52vh] overflow-y-auto pr-1",
                                        children: filteredGalleryHeroes.map(function(h) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                onClick: function onClick() {
                                                    return setInspectHeroId(h.id);
                                                },
                                                className: "p-2 rounded-xl border flex items-center gap-2 text-left cursor-pointer " + (inspectHeroId === h.id ? 'bg-amber-500/20 border-[#F5C451]' : 'bg-[#101C3D] border-slate-700 hover:border-slate-500'),
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                        heroId: h.id,
                                                        size: 36
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "min-w-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-xs font-black text-white truncate",
                                                                children: h.name
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-[10px] text-amber-300 truncate",
                                                                children: [
                                                                    h.role,
                                                                    " \xb7 ",
                                                                    h.lane
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }, h.id);
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "md:col-span-7 p-4 rounded-xl bg-[#101C3D] border border-slate-700 space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                        heroId: inspectHero.id,
                                                        size: 66,
                                                        skinColor: (_inspectHero_skins_find = inspectHero.skins.find(function(s) {
                                                            return s.id === profile.equippedSkins[inspectHero.id];
                                                        })) == null ? void 0 : _inspectHero_skins_find.color,
                                                        skinAccent: (_inspectHero_skins_find1 = inspectHero.skins.find(function(s) {
                                                            return s.id === profile.equippedSkins[inspectHero.id];
                                                        })) == null ? void 0 : _inspectHero_skins_find1.accent
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-lg font-black text-white",
                                                                children: inspectHero.name
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-xs text-[#F5C451] font-bold",
                                                                children: [
                                                                    inspectHero.title,
                                                                    " \xb7 ",
                                                                    inspectHero.specialty
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-[11px] text-slate-300",
                                                                children: [
                                                                    inspectHero.role,
                                                                    " \xb7 Recommended ",
                                                                    inspectHero.lane,
                                                                    " Lane"
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "flex flex-col gap-1.5",
                                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    onClick: function onClick() {
                                                        onUpdateProfile(function(p) {
                                                            return _extends({}, p, {
                                                                selectedHeroId: inspectHero.id,
                                                                showcaseHeroId: inspectHero.id,
                                                                selectedLane: inspectHero.lane
                                                            });
                                                        });
                                                        _AudioEngine.mlbbAudio.playClick();
                                                    },
                                                    className: "px-3 py-1.5 rounded-lg bg-[#F5C451] text-slate-950 text-xs font-black cursor-pointer",
                                                    children: "Display in Lobby"
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "grid grid-cols-2 gap-2 text-[11px]",
                                        children: [
                                            [
                                                'Durability',
                                                inspectHero.ratings.durability,
                                                'bg-emerald-400'
                                            ],
                                            [
                                                'Offense',
                                                inspectHero.ratings.offense,
                                                'bg-rose-400'
                                            ],
                                            [
                                                'Control',
                                                inspectHero.ratings.control,
                                                'bg-sky-400'
                                            ],
                                            [
                                                'Difficulty',
                                                inspectHero.ratings.difficulty,
                                                'bg-amber-400'
                                            ]
                                        ].map(function(param) {
                                            var label = param[0], val = param[1], col = param[2];
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex justify-between font-bold text-slate-300",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                children: label
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                className: "mlbb-num",
                                                                children: [
                                                                    val,
                                                                    "/10"
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "h-2 rounded-full bg-slate-900 overflow-hidden mt-0.5",
                                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "h-full " + col,
                                                            style: {
                                                                width: "" + val * 10 + "%"
                                                            }
                                                        })
                                                    })
                                                ]
                                            }, label);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "space-y-2 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p-2.5 rounded-lg bg-slate-900/90 border border-amber-500/30",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "font-black text-[#F5C451]",
                                                        children: [
                                                            "Passive \xb7 ",
                                                            inspectHero.passiveName
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-slate-300 text-[11px] mt-0.5",
                                                        children: inspectHero.passiveDesc
                                                    })
                                                ]
                                            }),
                                            inspectHero.skills.map(function(sk) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "p-2.5 rounded-lg bg-slate-900/90 border border-slate-700",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "flex items-center justify-between",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    className: "font-black text-white",
                                                                    children: [
                                                                        sk.icon,
                                                                        " Skill ",
                                                                        sk.slot,
                                                                        ": ",
                                                                        sk.name
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    className: "text-[10px] text-cyan-300 mlbb-num",
                                                                    children: [
                                                                        "CD ",
                                                                        sk.cooldown[0],
                                                                        "s \xb7 ",
                                                                        sk.damageType.toUpperCase()
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-slate-300 text-[11px] mt-0.5",
                                                            children: sk.desc
                                                        })
                                                    ]
                                                }, sk.slot);
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                })
            ]
        })
    });
};

});
// === MODULE: src/games/legends-arena/mlbb/data/emblems ===
ArcadeMod.define("src/games/legends-arena/mlbb/data/emblems", function(require, module, exports) {
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
    get MLBB_BATTLE_EFFECTS () {
        return MLBB_BATTLE_EFFECTS;
    },
    get MLBB_BATTLE_SPELLS () {
        return MLBB_BATTLE_SPELLS;
    },
    get MLBB_EMBLEMS () {
        return MLBB_EMBLEMS;
    },
    get MLBB_EMOTES () {
        return MLBB_EMOTES;
    },
    get MLBB_QUICK_CHAT_OPTIONS () {
        return MLBB_QUICK_CHAT_OPTIONS;
    },
    get MLBB_RANK_TIERS () {
        return MLBB_RANK_TIERS;
    },
    get MLBB_STARTER_EMOTES () {
        return MLBB_STARTER_EMOTES;
    },
    get MLBB_TALENTS () {
        return MLBB_TALENTS;
    },
    get aggregateEmblemAndTalentPreviewStats () {
        return aggregateEmblemAndTalentPreviewStats;
    },
    get getMlbbBattleSpellById () {
        return getMlbbBattleSpellById;
    },
    get getMlbbEmblemById () {
        return getMlbbEmblemById;
    },
    get getMlbbEmoteById () {
        return getMlbbEmoteById;
    },
    get getMlbbSpellById () {
        return getMlbbSpellById;
    },
    get getMlbbTalentById () {
        return getMlbbTalentById;
    }
});
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
var MLBB_EMBLEMS = [
    {
        id: 'common',
        name: 'Basic Common',
        icon: '⚜️',
        color: '#94A3B8',
        stats: {
            maxHp: 275,
            hpRegen: 12,
            manaRegen: 12,
            adaptiveAtk: 22
        },
        desc: '+275 HP, +12 Hybrid Regen, +22 Adaptive Attack.'
    },
    {
        id: 'tank',
        name: 'Tank',
        icon: '🛡️',
        color: '#3B82F6',
        stats: {
            maxHp: 500,
            physDef: 10,
            magicDef: 10,
            hpRegen: 4
        },
        desc: '+500 HP, +10 Hybrid Defense, +4 HP Regen.'
    },
    {
        id: 'assassin',
        name: 'Assassin',
        icon: '🗡️',
        color: '#A855F7',
        stats: {
            flatPhysPen: 14,
            flatMagicPen: 14,
            adaptiveAtk: 10,
            moveSpdPct: 3
        },
        desc: '+14 Adaptive Penetration, +10 Adaptive Attack, +3% Movement Speed.'
    },
    {
        id: 'mage',
        name: 'Mage',
        icon: '🔮',
        color: '#6366F1',
        stats: {
            magicPow: 30,
            cdrPct: 5,
            flatMagicPen: 8
        },
        desc: '+30 Magic Power, +5% CD Reduction, +8 Magic Penetration.'
    },
    {
        id: 'fighter',
        name: 'Fighter',
        icon: '⚔️',
        color: '#F59E0B',
        stats: {
            spellVampPct: 10,
            adaptiveAtk: 22,
            physDef: 6,
            magicDef: 6
        },
        desc: '+10% Spell Vamp, +22 Adaptive Attack, +6 Hybrid Defense.'
    },
    {
        id: 'support',
        name: 'Support',
        icon: '💚',
        color: '#10B981',
        stats: {
            healEffectPct: 12,
            cdrPct: 10,
            moveSpdPct: 6
        },
        desc: '+12% Healing Effect, +10% CD Reduction, +6% Movement Speed.'
    },
    {
        id: 'marksman',
        name: 'Marksman',
        icon: '🏹',
        color: '#EF4444',
        stats: {
            atkSpdPct: 15,
            adaptiveAtk: 14,
            lifestealPct: 5
        },
        desc: '+15% Attack Speed, +5% Adaptive Attack, +5% Lifesteal.'
    }
];
var MLBB_TALENTS = [
    // ================= TIER 1 STANDARD TALENTS (8) =================
    {
        id: 'thrill',
        tier: 1,
        name: 'Thrill',
        icon: '⚔️',
        desc: '+16 Adaptive Attack',
        stats: {
            adaptiveAtk: 16
        }
    },
    {
        id: 'swift',
        tier: 1,
        name: 'Swift',
        icon: '💨',
        desc: '+10% Attack Speed',
        stats: {
            atkSpdPct: 10
        }
    },
    {
        id: 'vitality',
        tier: 1,
        name: 'Vitality',
        icon: '💚',
        desc: '+225 Max HP',
        stats: {
            maxHp: 225
        }
    },
    {
        id: 'rupture',
        tier: 1,
        name: 'Rupture',
        icon: '💥',
        desc: '+5 Adaptive Penetration',
        stats: {
            flatPhysPen: 5,
            flatMagicPen: 5
        }
    },
    {
        id: 'inspire_t1',
        tier: 1,
        name: 'Inspire',
        icon: '⏱️',
        desc: '+5% Cooldown Reduction',
        stats: {
            cdrPct: 5
        }
    },
    {
        id: 'firmness',
        tier: 1,
        name: 'Firmness',
        icon: '🪨',
        desc: '+6 Physical Defense & +6 Magic Defense',
        stats: {
            physDef: 6,
            magicDef: 6
        }
    },
    {
        id: 'agility',
        tier: 1,
        name: 'Agility',
        icon: '👟',
        desc: '+4% Movement Speed',
        stats: {
            moveSpdPct: 4
        }
    },
    {
        id: 'fatal',
        tier: 1,
        name: 'Fatal',
        icon: '🎯',
        desc: '+5% Critical Chance & +10% Critical Damage',
        stats: {
            critChance: 5,
            critDmgPct: 10
        }
    },
    // ================= TIER 2 STANDARD TALENTS (9) =================
    {
        id: 'wilderness_blessing',
        tier: 2,
        name: 'Wilderness Blessing',
        icon: '🌿',
        desc: '+10% Movement Speed in Jungle & River (halved in combat).'
    },
    {
        id: 'seasoned_hunter',
        tier: 2,
        name: 'Seasoned Hunter',
        icon: '🐉',
        desc: '+15% Damage against Lord, Turtle, and Jungle Creeps.'
    },
    {
        id: 'tenacity',
        tier: 2,
        name: 'Tenacity',
        icon: '🛡️',
        desc: 'Dropping below 50% HP grants +15 Physical & Magic Defense.'
    },
    {
        id: 'master_assassin',
        tier: 2,
        name: 'Master Assassin',
        icon: '🥷',
        desc: '+7% Damage when only 1 enemy hero is nearby (1v1 duel).'
    },
    {
        id: 'bargain_hunter',
        tier: 2,
        name: 'Bargain Hunter',
        icon: '🪙',
        desc: 'Reduces Equipment purchase cost by 5% (95% price).'
    },
    {
        id: 'festival_of_blood',
        tier: 2,
        name: 'Festival of Blood',
        icon: '🩸',
        desc: '+6% Spell Vamp (+0.5% per kill/assist up to +10%).',
        stats: {
            spellVampPct: 6
        }
    },
    {
        id: 'pull_yourself_together',
        tier: 2,
        name: 'Pull Yourself Together',
        icon: '🔄',
        desc: '-15% Battle Spell & Active Equipment cooldown.'
    },
    {
        id: 'weapon_master',
        tier: 2,
        name: 'Weapon Master',
        icon: '🗡️',
        desc: '+5% Bonus Physical Attack & Magic Power from items and emblems.'
    },
    {
        id: 'life_drain',
        tier: 2,
        name: 'Life Drain',
        icon: '💧',
        desc: 'Killing a lane minion restores 3% Max HP and 3% Max Mana.'
    },
    // ================= TIER 3 CORE TALENTS (9) =================
    {
        id: 'impure_rage',
        tier: 3,
        name: 'Impure Rage',
        icon: '🟣',
        desc: 'Skills deal bonus 4% Target Current HP Adaptive Damage (5s CD) & restore 2% Mana.'
    },
    {
        id: 'quantum_charge',
        tier: 3,
        name: 'Quantum Charge',
        icon: '🔋',
        desc: 'Basic Attacks grant +30% decaying MS (1.5s) and restore 75–180 HP (8s CD).'
    },
    {
        id: 'concussive_blast',
        tier: 3,
        name: 'Concussive Blast',
        icon: '💣',
        desc: 'Every 15s, Basic Attack triggers 100 (+7% Total HP) Magic AoE shockwave.'
    },
    {
        id: 'killing_spree',
        tier: 3,
        name: 'Killing Spree',
        icon: '⚡',
        desc: 'Eliminating an enemy hero restores 10% Lost HP & grants +20% MS for 3s.'
    },
    {
        id: 'lethal_ignition',
        tier: 3,
        name: 'Lethal Ignition',
        icon: '🔥',
        desc: '3 heavy hits (>7% Max HP) within 5s scorch target for 162–750 Adaptive Damage.'
    },
    {
        id: 'brave_smite',
        tier: 3,
        name: 'Brave Smite',
        icon: '🛡️',
        desc: 'Dealing skill damage to an enemy hero restores 5% Max HP (6s CD).'
    },
    {
        id: 'focusing_mark',
        tier: 3,
        name: 'Focusing Mark',
        icon: '👁️',
        desc: 'Damaging an enemy hero increases all allied damage against them by +6% for 3s.'
    },
    {
        id: 'weakness_finder',
        tier: 3,
        name: 'Weakness Finder',
        icon: '❄️',
        desc: 'Basic Attacks slow target MS by 50% and ATK Speed by 30% for 1s (10s CD).'
    },
    {
        id: 'war_cry',
        tier: 3,
        name: 'War Cry',
        icon: '📣',
        desc: 'Every 3 separate Basic Attacks or Skills increase all damage dealt by +8% for 6s.'
    },
    {
        id: 'temporal_reign',
        tier: 3,
        name: 'Temporal Reign',
        icon: '⏳',
        desc: 'Casting Ultimate accelerates non-Ultimate skill cooldowns by 1.5x for 4s.'
    }
];
var MLBB_BATTLE_SPELLS = [
    {
        id: 'flicker',
        name: 'Flicker',
        icon: '✨',
        cooldown: 120,
        color: '#FACC15',
        desc: 'Instant wall-crossing blink in aim direction + brief hybrid defense.',
        range: 300
    },
    {
        id: 'retribution',
        name: 'Retribution',
        icon: '🩸',
        cooldown: 35,
        color: '#EF4444',
        desc: 'Deals 520 (+80*Lv) True Damage to Jungle Creeps, Turtle, and Lord.',
        range: 420
    },
    {
        id: 'execute',
        name: 'Execute',
        icon: '💀',
        cooldown: 90,
        color: '#DC2626',
        desc: 'Deals True Damage scaling with 13% target missing HP (ignores shields); 40% CD refund on kill.',
        range: 320
    },
    {
        id: 'inspire',
        name: 'Inspire',
        icon: '🔥',
        cooldown: 75,
        color: '#F97316',
        desc: 'Next 8 Basic Attacks gain +55% ATK Speed, Armor Ignore, and HP heal.',
        range: 0
    },
    {
        id: 'sprint',
        name: 'Sprint',
        icon: '💨',
        cooldown: 100,
        color: '#38BDF8',
        desc: 'Removes slows, grants Slow Immunity and +50% Move Speed for 6s.',
        range: 0
    },
    {
        id: 'purify',
        name: 'Purify',
        icon: '🕊️',
        cooldown: 90,
        color: '#A855F7',
        desc: 'Cleanses all non-Suppression CC and grants 1.2s CC Immunity + +15% Move Speed.',
        range: 0
    },
    {
        id: 'vengeance',
        name: 'Vengeance',
        icon: '⚜️',
        cooldown: 75,
        color: '#FB923C',
        desc: '35% Damage Reduction for 3s while reflecting 35% Magic Damage to attackers.',
        range: 0
    },
    {
        id: 'aegis',
        name: 'Aegis',
        icon: '🛡️',
        cooldown: 75,
        color: '#60A5FA',
        desc: 'Grants 750 (+90*Lv) Shield for 5s (+50% Shield to lowest-HP nearby ally).',
        range: 0
    },
    {
        id: 'revitalize',
        name: 'Revitalize',
        icon: '🌿',
        cooldown: 75,
        color: '#2CE58B',
        desc: 'Summons a 4s Healing Spring restoring 2.5% Max HP/0.5s & +25% Healing Received.',
        range: 0
    },
    {
        id: 'petrify',
        name: 'Petrify',
        icon: '🪨',
        cooldown: 75,
        color: '#94A3B8',
        desc: 'Stuns surrounding enemies for 0.8s and slows them by 50% afterward.',
        range: 220
    },
    {
        id: 'flameshot',
        name: 'Flameshot',
        icon: '☄️',
        cooldown: 50,
        color: '#F59E0B',
        desc: 'Global fireball knocking back close foes and scaling up to 640 (+180% Magic) with distance.',
        range: 1400
    },
    {
        id: 'arrival',
        name: 'Arrival',
        icon: '🌀',
        cooldown: 75,
        color: '#22D3EE',
        desc: 'Channels 3s to teleport to an allied turret or minion with +60% Move Speed.',
        range: 4000
    }
];
var MLBB_QUICK_CHAT_OPTIONS = [
    {
        id: 'qc_attack',
        text: 'Launch Attack!',
        category: 'Offense'
    },
    {
        id: 'qc_retreat',
        text: 'Retreat! Careful of ambush!',
        category: 'Defense'
    },
    {
        id: 'qc_gather_turtle',
        text: 'Gather at the Turtle!',
        category: 'Objective'
    },
    {
        id: 'qc_gather_lord',
        text: 'Attack the Lord!',
        category: 'Objective'
    },
    {
        id: 'qc_push',
        text: 'Push the turrets first!',
        category: 'Offense'
    },
    {
        id: 'qc_missing',
        text: 'Enemy missing from lane!',
        category: 'Warning'
    },
    {
        id: 'qc_well_played',
        text: 'Well played!',
        category: 'Social'
    },
    {
        id: 'qc_wait',
        text: 'Wait for me to initiate!',
        category: 'Strategy'
    }
];
var MLBB_BATTLE_EFFECTS = {
    recall: [
        {
            id: 'rec_dawn',
            name: 'Dawn Sanctuary',
            icon: '🌀',
            color: '#38BDF8',
            costTickets: 0
        },
        {
            id: 'rec_seal',
            name: 'Seal of Anvil Crawlers',
            icon: '⚡',
            color: '#FACC15',
            costTickets: 180
        },
        {
            id: 'rec_fire',
            name: 'Fire Crown',
            icon: '🔥',
            color: '#F97316',
            costTickets: 220
        }
    ],
    spawn: [
        {
            id: 'spn_classic',
            name: 'Classic Portal',
            icon: '✨',
            color: '#60A5FA',
            costTickets: 0
        },
        {
            id: 'spn_starlight',
            name: 'Starlight Descent',
            icon: '🌟',
            color: '#C084FC',
            costTickets: 150
        }
    ],
    elim: [
        {
            id: 'elm_default',
            name: 'Arcane Burst',
            icon: '💥',
            color: '#F59E0B',
            costTickets: 0
        },
        {
            id: 'elm_ko',
            name: 'K.O. Shockwave',
            icon: '⚡',
            color: '#EF4444',
            costTickets: 180
        }
    ],
    killNotif: [
        {
            id: 'kn_default',
            name: 'Imperial Gold Banner',
            icon: '🏆',
            color: '#FACC15',
            costTickets: 0
        },
        {
            id: 'kn_mythic',
            name: 'Mythic Glory Crest',
            icon: '👑',
            color: '#A855F7',
            costTickets: 200
        }
    ]
};
var MLBB_EMOTES = [
    {
        id: 'emote_gg',
        name: 'Good Game',
        callout: 'GG!',
        icon: '👍',
        color: '#2CE58B',
        rarity: 'Starter',
        costTickets: 0,
        costBp: 0,
        sfx: 'chime'
    },
    {
        id: 'emote_nice',
        name: 'Well Played',
        callout: 'NICE!',
        icon: '🔥',
        color: '#F59E0B',
        rarity: 'Starter',
        costTickets: 0,
        costBp: 0,
        sfx: 'spark'
    },
    {
        id: 'emote_retreat',
        name: 'Fall Back',
        callout: 'CAREFUL!',
        icon: '🛡️',
        color: '#38A3FF',
        rarity: 'Starter',
        costTickets: 0,
        costBp: 0,
        sfx: 'horn'
    },
    {
        id: 'emote_laugh',
        name: 'Playful Tease',
        callout: 'HAHA!',
        icon: '😜',
        color: '#FACC15',
        rarity: 'Starter',
        costTickets: 0,
        costBp: 0,
        sfx: 'laugh'
    },
    {
        id: 'emote_crown',
        name: 'MVP Crown',
        callout: 'EZ MVP',
        icon: '👑',
        color: '#FDE047',
        rarity: 'Epic',
        costTickets: 120,
        costBp: 2500,
        sfx: 'chime'
    },
    {
        id: 'emote_chill',
        name: 'Stay Cool',
        callout: 'CHILL',
        icon: '❄️',
        color: '#38BDF8',
        rarity: 'Rare',
        costTickets: 80,
        costBp: 1500,
        sfx: 'spark'
    },
    {
        id: 'emote_dragon',
        name: 'Lord Roar',
        callout: 'ROAR!',
        icon: '🐉',
        color: '#EF4444',
        rarity: 'Epic',
        costTickets: 150,
        costBp: 3000,
        sfx: 'horn'
    },
    {
        id: 'emote_heart',
        name: 'Team Love',
        callout: 'THANKS!',
        icon: '💖',
        color: '#FB7185',
        rarity: 'Rare',
        costTickets: 90,
        costBp: 1800,
        sfx: 'chime'
    },
    {
        id: 'emote_thunder',
        name: 'Shocked',
        callout: 'WHOA!',
        icon: '⚡',
        color: '#A855F7',
        rarity: 'Rare',
        costTickets: 100,
        costBp: 2000,
        sfx: 'spark'
    },
    {
        id: 'emote_ghost',
        name: 'Bush Ambush',
        callout: 'BOO!',
        icon: '👻',
        color: '#C084FC',
        rarity: 'Rare',
        costTickets: 100,
        costBp: 2000,
        sfx: 'laugh'
    },
    {
        id: 'emote_swords',
        name: '1v1 Me',
        callout: 'FIGHT ME!',
        icon: '⚔️',
        color: '#F97316',
        rarity: 'Epic',
        costTickets: 140,
        costBp: 2800,
        sfx: 'horn'
    },
    {
        id: 'emote_star',
        name: 'Savage Flex',
        callout: 'SAVAGE!',
        icon: '🌟',
        color: '#FACC15',
        rarity: 'Epic',
        costTickets: 160,
        costBp: 3200,
        sfx: 'chime'
    }
];
var MLBB_STARTER_EMOTES = [
    'emote_gg',
    'emote_nice',
    'emote_retreat',
    'emote_laugh'
];
var MLBB_RANK_TIERS = [
    {
        name: 'Warrior',
        icon: '⚔️',
        color: '#94A3B8',
        borderGlow: '#CBD5E1',
        starsPerTier: 3
    },
    {
        name: 'Elite',
        icon: '🛡️',
        color: '#38BDF8',
        borderGlow: '#7DD3FC',
        starsPerTier: 4
    },
    {
        name: 'Master',
        icon: '⚜️',
        color: '#F59E0B',
        borderGlow: '#FCD34D',
        starsPerTier: 4
    },
    {
        name: 'Grandmaster',
        icon: '🦅',
        color: '#2CE58B',
        borderGlow: '#6EE7B7',
        starsPerTier: 5
    },
    {
        name: 'Epic',
        icon: '🐉',
        color: '#10B981',
        borderGlow: '#34D399',
        starsPerTier: 5
    },
    {
        name: 'Legend',
        icon: '🦁',
        color: '#FACC15',
        borderGlow: '#FEF08A',
        starsPerTier: 5
    },
    {
        name: 'Mythic',
        icon: '👑',
        color: '#A855F7',
        borderGlow: '#D8B4FE',
        starsPerTier: 25
    },
    {
        name: 'Mythical Honor',
        icon: '💠',
        color: '#60A5FA',
        borderGlow: '#93C5FD',
        starsPerTier: 50
    },
    {
        name: 'Mythical Glory',
        icon: '🌟',
        color: '#F43F5E',
        borderGlow: '#FDA4AF',
        starsPerTier: 100
    },
    {
        name: 'Mythical Immortal',
        icon: '🔥',
        color: '#E6B84C',
        borderGlow: '#FFE28A',
        starsPerTier: 999
    }
];
function getMlbbEmblemById(id) {
    var _MLBB_EMBLEMS_find;
    return (_MLBB_EMBLEMS_find = MLBB_EMBLEMS.find(function(e) {
        return e.id === id;
    })) != null ? _MLBB_EMBLEMS_find : MLBB_EMBLEMS[0];
}
function getMlbbTalentById(id) {
    return MLBB_TALENTS.find(function(t) {
        return t.id === id;
    });
}
function getMlbbSpellById(id) {
    var _MLBB_BATTLE_SPELLS_find;
    return (_MLBB_BATTLE_SPELLS_find = MLBB_BATTLE_SPELLS.find(function(s) {
        return s.id === id;
    })) != null ? _MLBB_BATTLE_SPELLS_find : MLBB_BATTLE_SPELLS[0];
}
var getMlbbBattleSpellById = getMlbbSpellById;
function getMlbbEmoteById(id) {
    var _MLBB_EMOTES_find;
    return (_MLBB_EMOTES_find = MLBB_EMOTES.find(function(e) {
        return e.id === id;
    })) != null ? _MLBB_EMOTES_find : MLBB_EMOTES[0];
}
function aggregateEmblemAndTalentPreviewStats(emblemId, talents) {
    var emb = getMlbbEmblemById(emblemId);
    var t1 = getMlbbTalentById(talents.t1);
    var t2 = getMlbbTalentById(talents.t2);
    var sum = {};
    var addStats = function addStats(s) {
        if (!s) return;
        for(var _iterator = _create_for_of_iterator_helper_loose(Object.entries(s)), _step; !(_step = _iterator()).done;){
            var _step_value = _step.value, k = _step_value[0], v = _step_value[1];
            if (typeof v === 'number' && v !== 0) {
                var _sum_k;
                sum[k] = ((_sum_k = sum[k]) != null ? _sum_k : 0) + v;
            }
        }
    };
    addStats(emb.stats);
    addStats(t1 == null ? void 0 : t1.stats);
    addStats(t2 == null ? void 0 : t2.stats);
    var labelMap = {
        maxHp: [
            'Max HP',
            ''
        ],
        adaptiveAtk: [
            'Adaptive ATK',
            ''
        ],
        physAtk: [
            'Phys ATK',
            ''
        ],
        magicPow: [
            'Magic Power',
            ''
        ],
        physDef: [
            'Phys DEF',
            ''
        ],
        magicDef: [
            'Magic DEF',
            ''
        ],
        flatPhysPen: [
            'Phys PEN',
            ''
        ],
        flatMagicPen: [
            'Magic PEN',
            ''
        ],
        atkSpdPct: [
            'ATK Speed',
            '%'
        ],
        critChance: [
            'Crit Chance',
            '%'
        ],
        critDmgPct: [
            'Crit DMG',
            '%'
        ],
        cdrPct: [
            'CDR',
            '%'
        ],
        moveSpdPct: [
            'Move Speed',
            '%'
        ],
        lifestealPct: [
            'Lifesteal',
            '%'
        ],
        spellVampPct: [
            'Spell Vamp',
            '%'
        ],
        healEffectPct: [
            'Healing Effect',
            '%'
        ],
        hpRegen: [
            'HP Regen',
            ''
        ],
        manaRegen: [
            'Mana Regen',
            ''
        ]
    };
    var out = [];
    for(var _iterator = _create_for_of_iterator_helper_loose(Object.entries(sum)), _step; !(_step = _iterator()).done;){
        var _step_value = _step.value, k = _step_value[0], v = _step_value[1];
        var meta = labelMap[k];
        if (!meta) continue;
        out.push({
            label: meta[0],
            value: "+" + v + meta[1]
        });
    }
    return out;
}

});

})(window.ArcadeMod);
