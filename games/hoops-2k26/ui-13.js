(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/modes/MyPlayerBuilder ===
ArcadeMod.define("src/games/hoops-2k26/modes/MyPlayerBuilder", function(require, module, exports) {
// ============================================================================
// PART 6 — FULL MyPLAYER BUILDER & 5-SLOT BUILD MANAGER
// Features:
// - 5 Persistent Build Slots + instant [⚡ SWAP BUILD] switcher
// - Step 1: Vitals & Body (Name, Jersey #, Position PG-C, Height 5'9"-7'4",
//   Weight, Wingspan dynamically shifting attribute caps, Appearance/Gear with
//   live 3D rotating Three.js preview!)
// - Step 2: 99-OVR Attribute Allocator across all 18 attributes (25-99) +
//   2K26 Cap Breakers (+1..+5), Dynamic Archetype Build Name Generator, and
//   live 2K26 5-Tier Badge Threshold Calculator (Bronze..Legend)
// - Step 3: Custom Jumpshot Speed, Primary Takeover & VC Attribute Upgrades
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MyPlayerBuilder", {
    enumerable: true,
    get: function() {
        return MyPlayerBuilder;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _RoomEnvironment = require("three/addons/environments/RoomEnvironment.js");
var _rosterTypes = require("../hybrid/rosterTypes");
var _store = require("../hybrid/store");
var _audioEngine = require("../hybrid/audioEngine");
var _modesStore = require("./modesStore");
var _modesTypes = require("./modesTypes");
require("./modesHud.css");
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
var POSITIONS = [
    'PG',
    'SG',
    'SF',
    'PF',
    'C'
];
var SKIN_SWATCHES = [
    '#f5cba7',
    '#d8a47f',
    '#c68642',
    '#8d5524',
    '#5c3818',
    '#3b2210'
];
var HAIR_STYLES = [
    'FADE',
    'BUZZ',
    'AFRO',
    'DREADS',
    'BRAIDS',
    'SHORT',
    'PONYTAIL',
    'BALD'
];
function detectSoftwareGl() {
    try {
        var gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        var ext = gl.getExtension('WEBGL_debug_renderer_info');
        var param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        var gpu = String(gl.getParameter(param));
        var lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch (unused) {
        return true;
    }
}
// Live 3D Rotating Preview of the MyPLAYER Build
var MyPlayer3DTurntable = function MyPlayer3DTurntable(param) {
    var draft = param.draft;
    var hostRef = (0, _react.useRef)(null);
    var draftRef = (0, _react.useRef)(draft);
    draftRef.current = draft;
    (0, _react.useEffect)(function() {
        var el = hostRef.current;
        if (!el) return;
        var isSoftwareGl = detectSoftwareGl();
        var renderer = new _three.WebGLRenderer({
            antialias: !isSoftwareGl,
            alpha: true
        });
        renderer.outputColorSpace = _three.SRGBColorSpace;
        renderer.toneMapping = _three.ACESFilmicToneMapping;
        renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(el.clientWidth || 300, el.clientHeight || 340);
        el.innerHTML = '';
        el.appendChild(renderer.domElement);
        var scene = new _three.Scene();
        var pmrem = new _three.PMREMGenerator(renderer);
        var envTex = pmrem.fromScene(new _RoomEnvironment.RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;
        pmrem.dispose();
        var camera = new _three.PerspectiveCamera(36, (el.clientWidth || 300) / (el.clientHeight || 340), 0.1, 40);
        camera.position.set(0, 1.45, 4.1);
        camera.lookAt(0, 1.15, 0);
        scene.add(new _three.HemisphereLight(0x93c5fd, 0x1e293b, 0.8));
        var key = new _three.DirectionalLight(0xfff1d6, 1.5);
        key.position.set(3, 5, 4);
        scene.add(key);
        // Pedestal ring
        var pedestal = new _three.Mesh(new _three.CylinderGeometry(0.95, 1.08, 0.16, 28), new _three.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.35,
            metalness: 0.6
        }));
        pedestal.position.y = 0.08;
        scene.add(pedestal);
        var trimRing = new _three.Mesh(new _three.TorusGeometry(0.96, 0.03, 10, 32), new _three.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.45,
            metalness: 0.8,
            roughness: 0.2
        }));
        trimRing.rotation.x = Math.PI / 2;
        trimRing.position.y = 0.17;
        scene.add(trimRing);
        var avatarGroup = new _three.Group();
        avatarGroup.position.y = 0.16;
        scene.add(avatarGroup);
        var rebuildAvatar = function rebuildAvatar(b) {
            while(avatarGroup.children.length > 0){
                var ch = avatarGroup.children.pop();
                avatarGroup.remove(ch);
            }
            var skinMat = new _three.MeshStandardMaterial({
                color: b.cosmetics.skinTone || '#8d5524',
                roughness: 0.62
            });
            var jerseyMat = new _three.MeshStandardMaterial({
                color: b.cosmetics.headbandColor || '#06b6d4',
                roughness: 0.52
            });
            var shortsMat = new _three.MeshStandardMaterial({
                color: 0x111827,
                roughness: 0.65
            });
            var sleeveMat = new _three.MeshStandardMaterial({
                color: 0xe2e8f0,
                roughness: 0.45
            });
            var shoeMat = new _three.MeshStandardMaterial({
                color: b.cosmetics.shoeColor || '#f59e0b',
                roughness: 0.3,
                metalness: 0.25
            });
            var hairMat = new _three.MeshStandardMaterial({
                color: b.cosmetics.hairColor || '#111827',
                roughness: 0.85
            });
            var hScale = _three.MathUtils.clamp((b.heightInches - 58) / 20, 0.85, 1.24);
            var wScale = _three.MathUtils.clamp(0.84 + (b.weightLbs - 165) / 340, 0.84, 1.22);
            var armLen = _three.MathUtils.clamp(0.6 + (b.wingspanInches - b.heightInches) * 0.025, 0.52, 0.82);
            avatarGroup.scale.set(wScale, hScale, wScale);
            // Legs
            var legMat = b.cosmetics.legCompression ? shortsMat : skinMat;
            var lLeg = new _three.Mesh(new _three.BoxGeometry(0.18, 0.78, 0.18), legMat);
            lLeg.position.set(-0.14, 0.46, 0);
            avatarGroup.add(lLeg);
            var rLeg = new _three.Mesh(new _three.BoxGeometry(0.18, 0.78, 0.18), legMat);
            rLeg.position.set(0.14, 0.46, 0);
            avatarGroup.add(rLeg);
            // Sneakers
            var lShoe = new _three.Mesh(new _three.BoxGeometry(0.2, 0.14, 0.32), shoeMat);
            lShoe.position.set(-0.14, 0.07, 0.05);
            avatarGroup.add(lShoe);
            var rShoe = new _three.Mesh(new _three.BoxGeometry(0.2, 0.14, 0.32), shoeMat);
            rShoe.position.set(0.14, 0.07, 0.05);
            avatarGroup.add(rShoe);
            // Shorts + Jersey Torso
            var shorts = new _three.Mesh(new _three.BoxGeometry(0.5, 0.34, 0.3), shortsMat);
            shorts.position.y = 0.92;
            avatarGroup.add(shorts);
            var torso = new _three.Mesh(new _three.BoxGeometry(0.54, 0.66, 0.28), jerseyMat);
            torso.position.y = 1.4;
            avatarGroup.add(torso);
            // Arms scaled by Wingspan
            var lArmMat = b.cosmetics.armSleeve === 'LEFT' || b.cosmetics.armSleeve === 'BOTH' ? sleeveMat : skinMat;
            var rArmMat = b.cosmetics.armSleeve === 'RIGHT' || b.cosmetics.armSleeve === 'BOTH' ? sleeveMat : skinMat;
            var lArm = new _three.Mesh(new _three.BoxGeometry(0.14, armLen, 0.14), lArmMat);
            lArm.position.set(-0.36, 1.66 - armLen / 2, 0);
            avatarGroup.add(lArm);
            var rArm = new _three.Mesh(new _three.BoxGeometry(0.14, armLen, 0.14), rArmMat);
            rArm.position.set(0.36, 1.66 - armLen / 2, 0);
            avatarGroup.add(rArm);
            // Head + Hair + Headband
            var head = new _three.Mesh(new _three.SphereGeometry(0.2, 16, 14), skinMat);
            head.position.y = 1.94;
            avatarGroup.add(head);
            if (b.cosmetics.hairStyle !== 'BALD') {
                var hairH = b.cosmetics.hairStyle === 'AFRO' ? 0.24 : b.cosmetics.hairStyle === 'DREADS' ? 0.22 : 0.13;
                var hairR = b.cosmetics.hairStyle === 'AFRO' ? 0.24 : 0.205;
                var hair = new _three.Mesh(new _three.SphereGeometry(hairR, 14, 12), hairMat);
                hair.position.y = 2.02 + hairH * 0.22;
                avatarGroup.add(hair);
            }
            if (b.cosmetics.headband) {
                var hb = new _three.Mesh(new _three.CylinderGeometry(0.21, 0.21, 0.06, 18), new _three.MeshStandardMaterial({
                    color: b.cosmetics.headbandColor || '#f59e0b',
                    roughness: 0.45
                }));
                hb.position.y = 2.01;
                avatarGroup.add(hb);
            }
        };
        rebuildAvatar(draftRef.current);
        var disposed = false;
        var frameId = 0;
        var lastTs = performance.now();
        var tick = function tick1() {
            if (disposed) return;
            var now = performance.now();
            var dt = Math.min(0.05, (now - lastTs) / 1000);
            lastTs = now;
            avatarGroup.rotation.y += dt * 0.65;
            renderer.render(scene, camera);
            if (isSoftwareGl) {
                frameId = window.setTimeout(tick, 90);
            } else {
                frameId = requestAnimationFrame(tick);
            }
        };
        tick();
        return function() {
            disposed = true;
            cancelAnimationFrame(frameId);
            clearTimeout(frameId);
            envTex.dispose();
            renderer.dispose();
        };
    }, [
        draft.heightInches,
        draft.weightLbs,
        draft.wingspanInches,
        draft.cosmetics.skinTone,
        draft.cosmetics.hairStyle,
        draft.cosmetics.headband,
        draft.cosmetics.headbandColor,
        draft.cosmetics.armSleeve,
        draft.cosmetics.legCompression,
        draft.cosmetics.shoeColor
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        ref: hostRef,
        className: "h2k-builder-turntable"
    });
};
var MyPlayerBuilder = function MyPlayerBuilder(param) {
    var eraMode = param.eraMode, onBack = param.onBack, onEnterCity = param.onEnterCity, onNotify = param.onNotify;
    var hybridSave = (0, _store.useUltimateHybridStore)();
    var modes = (0, _modesStore.useModesStore)();
    var _useState = (0, _react.useState)(modes.activeBuildSlotIndex), slotIdx = _useState[0], setSlotIdx = _useState[1];
    var _useState1 = (0, _react.useState)(1), step = _useState1[0], setStep = _useState1[1];
    var _useState2 = (0, _react.useState)(function() {
        return _extends({}, modes.buildSlots[modes.activeBuildSlotIndex], {
            attributes: _extends({}, modes.buildSlots[modes.activeBuildSlotIndex].attributes),
            capBreakers: _extends({}, modes.buildSlots[modes.activeBuildSlotIndex].capBreakers),
            cosmetics: _extends({}, modes.buildSlots[modes.activeBuildSlotIndex].cosmetics)
        });
    }), draft = _useState2[0], setDraft = _useState2[1];
    var switchSlot = function switchSlot(idx) {
        setSlotIdx(idx);
        _modesStore.ModesStore.setActiveBuildSlot(idx);
        var src = _modesStore.ModesStore.getState().buildSlots[idx];
        setDraft(_extends({}, src, {
            attributes: _extends({}, src.attributes),
            capBreakers: _extends({}, src.capBreakers),
            cosmetics: _extends({}, src.cosmetics)
        }));
        _audioEngine.HybridAudioEngine.playUi('switch', eraMode);
    };
    var caps = (0, _react.useMemo)(function() {
        return (0, _modesStore.computeDynamicAttributeCaps)(draft.position, draft.heightInches, draft.weightLbs, draft.wingspanInches);
    }, [
        draft.position,
        draft.heightInches,
        draft.weightLbs,
        draft.wingspanInches
    ]);
    var effectiveAttrs = (0, _react.useMemo)(function() {
        return (0, _modesStore.getEffectiveBuildAttributes)(draft);
    }, [
        draft
    ]);
    var liveOvr = (0, _react.useMemo)(function() {
        return (0, _modesStore.computeBuildOvr)(draft.attributes, draft.capBreakers);
    }, [
        draft.attributes,
        draft.capBreakers
    ]);
    var liveArchetype = (0, _react.useMemo)(function() {
        return (0, _modesStore.deriveBuildArchetypeName)(effectiveAttrs, draft.position);
    }, [
        effectiveAttrs,
        draft.position
    ]);
    var liveBadges = (0, _react.useMemo)(function() {
        return (0, _modesStore.computeUnlockedBadges5Tier)(draft.attributes, draft.capBreakers);
    }, [
        draft.attributes,
        draft.capBreakers
    ]);
    var budgetUsed = (0, _react.useMemo)(function() {
        return (0, _modesStore.computeAttributePointBudgetUsed)(draft.attributes);
    }, [
        draft.attributes
    ]);
    var capBreakersUsed = (0, _react.useMemo)(function() {
        return Object.values(draft.capBreakers).reduce(function(s, n) {
            return s + (n != null ? n : 0);
        }, 0);
    }, [
        draft.capBreakers
    ]);
    var updateBody = function updateBody(patch) {
        setDraft(function(prev) {
            var _patch_heightInches, _patch_wingspanInches, _patch_position, _patch_weightLbs;
            var nextH = (_patch_heightInches = patch.heightInches) != null ? _patch_heightInches : prev.heightInches;
            var nextWing = (0, _modesStore.clampNum)((_patch_wingspanInches = patch.wingspanInches) != null ? _patch_wingspanInches : prev.wingspanInches, nextH - 2, nextH + 8);
            var nextPos = (_patch_position = patch.position) != null ? _patch_position : prev.position;
            var nextW = (_patch_weightLbs = patch.weightLbs) != null ? _patch_weightLbs : prev.weightLbs;
            var nextCaps = (0, _modesStore.computeDynamicAttributeCaps)(nextPos, nextH, nextW, nextWing);
            var clampedAttrs = _extends({}, prev.attributes);
            _rosterTypes.ATTRIBUTE_META.forEach(function(m) {
                clampedAttrs[m.key] = (0, _modesStore.clampNum)(clampedAttrs[m.key], 25, nextCaps[m.key]);
            });
            return _extends({}, prev, {
                position: nextPos,
                heightInches: nextH,
                weightLbs: nextW,
                wingspanInches: nextWing,
                attributes: clampedAttrs
            });
        });
    };
    var setAttr = function setAttr(key, val) {
        setDraft(function(prev) {
            var capped = (0, _modesStore.clampNum)(val, 25, caps[key]);
            var otherSum = (0, _modesStore.computeAttributePointBudgetUsed)(prev.attributes) - prev.attributes[key];
            var maxAllowed = Math.min(caps[key], Math.max(25, _modesStore.BUILD_MAX_ATTR_BUDGET - otherSum));
            var _obj;
            return _extends({}, prev, {
                attributes: _extends({}, prev.attributes, (_obj = {}, _obj[key] = Math.min(capped, maxAllowed), _obj))
            });
        });
    };
    var adjustCapBreaker = function adjustCapBreaker(key, delta) {
        setDraft(function(prev) {
            var _prev_capBreakers_key;
            var curr = (_prev_capBreakers_key = prev.capBreakers[key]) != null ? _prev_capBreakers_key : 0;
            var used = Object.values(prev.capBreakers).reduce(function(s, n) {
                return s + (n != null ? n : 0);
            }, 0);
            if (delta > 0 && (used >= prev.capBreakersEarned || curr >= 5 || prev.attributes[key] + curr >= 99)) {
                return prev;
            }
            if (delta < 0 && curr <= 0) return prev;
            var _obj;
            return _extends({}, prev, {
                capBreakers: _extends({}, prev.capBreakers, (_obj = {}, _obj[key] = curr + delta, _obj))
            });
        });
    };
    var handleSaveBuild = function handleSaveBuild() {
        _modesStore.ModesStore.saveBuildSlot(slotIdx, draft);
        _audioEngine.HybridAudioEngine.playUi('confirm', eraMode);
        onNotify("Saved Slot #" + (slotIdx + 1) + ": " + draft.name + " (" + liveOvr + " OVR " + liveArchetype + ")!");
    };
    var handleVcUpgrade = function handleVcUpgrade(key) {
        _modesStore.ModesStore.saveBuildSlot(slotIdx, draft);
        var res = _modesStore.ModesStore.upgradeBuildAttributeWithVc(slotIdx, key);
        if (res.ok) {
            var fresh = _modesStore.ModesStore.getState().buildSlots[slotIdx];
            setDraft(_extends({}, fresh, {
                attributes: _extends({}, fresh.attributes),
                capBreakers: _extends({}, fresh.capBreakers),
                cosmetics: _extends({}, fresh.cosmetics)
            }));
            _audioEngine.HybridAudioEngine.playUi('confirm', eraMode);
        }
        onNotify(res.message);
    };
    var unlockedBadgeList = _rosterTypes.BADGE_CATALOG.filter(function(b) {
        return Boolean(liveBadges[b.id]);
    });
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h2k-mode-root",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                className: "h2k-mode-topbar",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "h2k-mode-top-left",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-mode-btn",
                                onClick: onBack,
                                children: "← Main Menu"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                        className: "h2k-mode-title",
                                        children: "MyPLAYER BUILDER \xb7 5 PERSISTENT SLOTS"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-mode-submeta",
                                        children: [
                                            liveArchetype,
                                            " \xb7 ",
                                            liveOvr,
                                            " OVR \xb7 Playable in The City, MyCAREER & Blacktop"
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "h2k-mode-top-right",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "h2k-wallet-vc h2k-tabular",
                                style: {
                                    fontWeight: 700,
                                    fontSize: 13
                                },
                                children: [
                                    "VC ",
                                    hybridSave.currencies.vc.toLocaleString()
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-mode-btn primary",
                                onClick: handleSaveBuild,
                                children: "\uD83D\uDCBE Save Build"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-mode-btn cyan",
                                onClick: function onClick() {
                                    handleSaveBuild();
                                    onEnterCity();
                                },
                                children: "\uD83C\uDFD9️ Take Build to The City"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "h2k-mode-tabs",
                style: {
                    justifyContent: 'space-between'
                },
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        style: {
                            display: 'flex',
                            gap: 6
                        },
                        children: modes.buildSlots.map(function(s, idx) {
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                type: "button",
                                className: "h2k-mode-tab " + (slotIdx === idx ? 'active' : ''),
                                onClick: function onClick() {
                                    return switchSlot(idx);
                                },
                                children: [
                                    "⚡ Slot ",
                                    idx + 1,
                                    ": ",
                                    s.position,
                                    " ",
                                    s.ovr
                                ]
                            }, s.id);
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        style: {
                            display: 'flex',
                            gap: 6
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-mode-tab " + (step === 1 ? 'active' : ''),
                                onClick: function onClick() {
                                    return setStep(1);
                                },
                                children: "1. Vitals & Body"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-mode-tab " + (step === 2 ? 'active' : ''),
                                onClick: function onClick() {
                                    return setStep(2);
                                },
                                children: "2. Attributes, Cap Breakers & Badges"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-mode-tab " + (step === 3 ? 'active' : ''),
                                onClick: function onClick() {
                                    return setStep(3);
                                },
                                children: "3. Jumpshot, Takeover & VC Upgrades"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-mode-scroll",
                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "h2k-builder-layout",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)(MyPlayer3DTurntable, {
                                    draft: draft
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-card",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "h2k-muted",
                                                            children: "ARCHETYPE"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                            style: {
                                                                fontSize: 16,
                                                                color: '#fcd34d'
                                                            },
                                                            children: liveArchetype
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h2k-mt-ovr",
                                                    style: {
                                                        color: '#22c55e'
                                                    },
                                                    children: liveOvr
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-muted h2k-tabular",
                                            style: {
                                                marginTop: 8
                                            },
                                            children: [
                                                draft.name,
                                                " \xb7 #",
                                                draft.jerseyNumber,
                                                " \xb7 ",
                                                draft.position,
                                                " \xb7 ",
                                                (0, _modesStore.formatHeightInches)(draft.heightInches),
                                                " \xb7",
                                                ' ',
                                                draft.weightLbs,
                                                " lbs \xb7 ",
                                                (0, _modesStore.formatHeightInches)(draft.wingspanInches),
                                                " Wing"
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-muted h2k-tabular",
                                            style: {
                                                marginTop: 6
                                            },
                                            children: [
                                                "Badges Unlocked: ",
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                    style: {
                                                        color: '#f8fafc'
                                                    },
                                                    children: unlockedBadgeList.length
                                                }),
                                                " \xb7 Cap Breakers:",
                                                ' ',
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                    style: {
                                                        color: '#38bdf8'
                                                    },
                                                    children: [
                                                        capBreakersUsed,
                                                        "/",
                                                        draft.capBreakersEarned
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 14
                            },
                            children: [
                                step === 1 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-card",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-section-head",
                                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                children: "Step 1 \xb7 Vitals, Physicals & Appearance"
                                            })
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-grid-2",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                    style: {
                                                        fontSize: 12
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "h2k-muted",
                                                            style: {
                                                                marginBottom: 4
                                                            },
                                                            children: "MyPLAYER Name"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                            type: "text",
                                                            className: "h2k-input",
                                                            style: {
                                                                width: '100%'
                                                            },
                                                            value: draft.name,
                                                            onChange: function onChange(e) {
                                                                return setDraft(_extends({}, draft, {
                                                                    name: e.target.value
                                                                }));
                                                            }
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                    style: {
                                                        fontSize: 12
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "h2k-muted",
                                                            style: {
                                                                marginBottom: 4
                                                            },
                                                            children: "Jersey Number (0-99)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                            type: "number",
                                                            className: "h2k-input",
                                                            style: {
                                                                width: '100%'
                                                            },
                                                            min: 0,
                                                            max: 99,
                                                            value: draft.jerseyNumber,
                                                            onChange: function onChange(e) {
                                                                return setDraft(_extends({}, draft, {
                                                                    jerseyNumber: (0, _modesStore.clampNum)(Number(e.target.value) || 0, 0, 99)
                                                                }));
                                                            }
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            style: {
                                                marginTop: 14
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h2k-muted",
                                                    style: {
                                                        marginBottom: 6
                                                    },
                                                    children: "Position"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    style: {
                                                        display: 'flex',
                                                        gap: 8
                                                    },
                                                    children: POSITIONS.map(function(pos) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            type: "button",
                                                            className: "h2k-mode-btn " + (draft.position === pos ? 'primary' : ''),
                                                            style: {
                                                                flex: 1
                                                            },
                                                            onClick: function onClick() {
                                                                return updateBody({
                                                                    position: pos
                                                                });
                                                            },
                                                            children: pos
                                                        }, pos);
                                                    })
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-grid-3",
                                            style: {
                                                marginTop: 14
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                    style: {
                                                        fontSize: 12
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    children: "Height"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                    className: "h2k-tabular",
                                                                    children: (0, _modesStore.formatHeightInches)(draft.heightInches)
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                            type: "range",
                                                            min: 69,
                                                            max: 88,
                                                            value: draft.heightInches,
                                                            onChange: function onChange(e) {
                                                                return updateBody({
                                                                    heightInches: Number(e.target.value)
                                                                });
                                                            },
                                                            style: {
                                                                width: '100%'
                                                            }
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                    style: {
                                                        fontSize: 12
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    children: "Weight"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                                    className: "h2k-tabular",
                                                                    children: [
                                                                        draft.weightLbs,
                                                                        " lbs"
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                            type: "range",
                                                            min: 165,
                                                            max: 295,
                                                            value: draft.weightLbs,
                                                            onChange: function onChange(e) {
                                                                return updateBody({
                                                                    weightLbs: Number(e.target.value)
                                                                });
                                                            },
                                                            style: {
                                                                width: '100%'
                                                            }
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                    style: {
                                                        fontSize: 12
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    children: "Wingspan"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                    className: "h2k-tabular",
                                                                    children: (0, _modesStore.formatHeightInches)(draft.wingspanInches)
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                            type: "range",
                                                            min: draft.heightInches - 2,
                                                            max: draft.heightInches + 8,
                                                            value: draft.wingspanInches,
                                                            onChange: function onChange(e) {
                                                                return updateBody({
                                                                    wingspanInches: Number(e.target.value)
                                                                });
                                                            },
                                                            style: {
                                                                width: '100%'
                                                            }
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-muted",
                                            style: {
                                                marginTop: 10
                                            },
                                            children: [
                                                "Live Cap Preview: Max 3PT ",
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                    children: caps.threePt
                                                }),
                                                " \xb7 Max Dunk ",
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                    children: caps.drivingDunk
                                                }),
                                                " \xb7 Max Ball Handle ",
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                    children: caps.ballHandle
                                                }),
                                                " \xb7 Max Block ",
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                    children: caps.block
                                                }),
                                                " \xb7 Max Steal",
                                                ' ',
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                    children: caps.steal
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-grid-3",
                                            style: {
                                                marginTop: 14
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "h2k-muted",
                                                            style: {
                                                                marginBottom: 6
                                                            },
                                                            children: "Skin Tone"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            style: {
                                                                display: 'flex',
                                                                gap: 6
                                                            },
                                                            children: SKIN_SWATCHES.map(function(sw) {
                                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                    type: "button",
                                                                    onClick: function onClick() {
                                                                        return setDraft(_extends({}, draft, {
                                                                            cosmetics: _extends({}, draft.cosmetics, {
                                                                                skinTone: sw
                                                                            })
                                                                        }));
                                                                    },
                                                                    style: {
                                                                        width: 28,
                                                                        height: 28,
                                                                        borderRadius: 6,
                                                                        background: sw,
                                                                        border: draft.cosmetics.skinTone === sw ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.2)',
                                                                        cursor: 'pointer'
                                                                    }
                                                                }, sw);
                                                            })
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                    style: {
                                                        fontSize: 12
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "h2k-muted",
                                                            style: {
                                                                marginBottom: 4
                                                            },
                                                            children: "Hairstyle"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                            className: "h2k-select",
                                                            style: {
                                                                width: '100%'
                                                            },
                                                            value: draft.cosmetics.hairStyle,
                                                            onChange: function onChange(e) {
                                                                return setDraft(_extends({}, draft, {
                                                                    cosmetics: _extends({}, draft.cosmetics, {
                                                                        hairStyle: e.target.value
                                                                    })
                                                                }));
                                                            },
                                                            children: HAIR_STYLES.map(function(h) {
                                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                    value: h,
                                                                    children: h
                                                                }, h);
                                                            })
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                    style: {
                                                        fontSize: 12
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "h2k-muted",
                                                            style: {
                                                                marginBottom: 4
                                                            },
                                                            children: "Arm Sleeve"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                            className: "h2k-select",
                                                            style: {
                                                                width: '100%'
                                                            },
                                                            value: draft.cosmetics.armSleeve,
                                                            onChange: function onChange(e) {
                                                                return setDraft(_extends({}, draft, {
                                                                    cosmetics: _extends({}, draft.cosmetics, {
                                                                        armSleeve: e.target.value
                                                                    })
                                                                }));
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                    value: "NONE",
                                                                    children: "None"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                    value: "LEFT",
                                                                    children: "Left Arm"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                    value: "RIGHT",
                                                                    children: "Right Arm"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                    value: "BOTH",
                                                                    children: "Both Arms"
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            style: {
                                                display: 'flex',
                                                gap: 14,
                                                marginTop: 12
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        fontSize: 12
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                            type: "checkbox",
                                                            checked: draft.cosmetics.headband,
                                                            onChange: function onChange(e) {
                                                                return setDraft(_extends({}, draft, {
                                                                    cosmetics: _extends({}, draft.cosmetics, {
                                                                        headband: e.target.checked
                                                                    })
                                                                }));
                                                            }
                                                        }),
                                                        "Equip Headband"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        fontSize: 12
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                            type: "checkbox",
                                                            checked: draft.cosmetics.legCompression,
                                                            onChange: function onChange(e) {
                                                                return setDraft(_extends({}, draft, {
                                                                    cosmetics: _extends({}, draft.cosmetics, {
                                                                        legCompression: e.target.checked
                                                                    })
                                                                }));
                                                            }
                                                        }),
                                                        "Equip Leg Compression"
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                step === 2 && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-card",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-section-head",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                            children: "Step 2 \xb7 18-Attribute Allocator & 2K26 Cap Breakers"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            className: "h2k-tabular",
                                                            style: {
                                                                fontSize: 12,
                                                                color: '#38bdf8'
                                                            },
                                                            children: [
                                                                "Budget: ",
                                                                budgetUsed,
                                                                " / ",
                                                                _modesStore.BUILD_MAX_ATTR_BUDGET,
                                                                " \xb7 Cap Breakers Left:",
                                                                ' ',
                                                                draft.capBreakersEarned - capBreakersUsed
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h2k-grid-2",
                                                    children: _rosterTypes.ATTRIBUTE_META.map(function(m) {
                                                        var _draft_capBreakers_m_key;
                                                        var base = draft.attributes[m.key];
                                                        var cb = (_draft_capBreakers_m_key = draft.capBreakers[m.key]) != null ? _draft_capBreakers_m_key : 0;
                                                        var eff = effectiveAttrs[m.key];
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "h2k-attr-row",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    children: [
                                                                        m.label,
                                                                        " ",
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                            className: "h2k-muted",
                                                                            children: [
                                                                                "(cap ",
                                                                                caps[m.key],
                                                                                ")"
                                                                            ]
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                                    type: "range",
                                                                    min: 25,
                                                                    max: caps[m.key],
                                                                    value: base,
                                                                    onChange: function onChange(e) {
                                                                        return setAttr(m.key, Number(e.target.value));
                                                                    }
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                    className: "h2k-tabular",
                                                                    style: {
                                                                        textAlign: 'right',
                                                                        color: cb > 0 ? '#38bdf8' : '#f8fafc'
                                                                    },
                                                                    children: eff
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    style: {
                                                                        display: 'flex',
                                                                        gap: 4,
                                                                        justifyContent: 'flex-end'
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                            type: "button",
                                                                            className: "h2k-mode-btn",
                                                                            style: {
                                                                                minHeight: 26,
                                                                                padding: '0 7px'
                                                                            },
                                                                            onClick: function onClick() {
                                                                                return adjustCapBreaker(m.key, -1);
                                                                            },
                                                                            disabled: cb <= 0,
                                                                            title: "Remove Cap Breaker",
                                                                            children: "-"
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                            type: "button",
                                                                            className: "h2k-mode-btn cyan",
                                                                            style: {
                                                                                minHeight: 26,
                                                                                padding: '0 7px'
                                                                            },
                                                                            onClick: function onClick() {
                                                                                return adjustCapBreaker(m.key, 1);
                                                                            },
                                                                            disabled: capBreakersUsed >= draft.capBreakersEarned || eff >= 99,
                                                                            title: "Apply +1 Cap Breaker past physical ceiling",
                                                                            children: "+CB"
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }, m.key);
                                                    })
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-card",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h2k-section-head",
                                                    children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                                        children: [
                                                            "Live 2K26 5-Tier Badge Threshold Calculator (",
                                                            unlockedBadgeList.length,
                                                            " Unlocked)"
                                                        ]
                                                    })
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h2k-badge-grid",
                                                    children: unlockedBadgeList.map(function(b) {
                                                        var tier = liveBadges[b.id];
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "h2k-badge-tile",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    children: b.name
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                    className: "h2k-tier-" + tier,
                                                                    children: tier
                                                                })
                                                            ]
                                                        }, b.id);
                                                    })
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                step === 3 && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-card",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h2k-section-head",
                                                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                        children: "Step 3 \xb7 Custom Jumpshot Speed & Primary Takeover"
                                                    })
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h2k-muted",
                                                    style: {
                                                        marginBottom: 8
                                                    },
                                                    children: "Jumpshot Release Speed"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h2k-grid-4",
                                                    style: {
                                                        marginBottom: 16
                                                    },
                                                    children: _modesTypes.JUMPSHOT_SPEED_OPTIONS.map(function(js) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            type: "button",
                                                            className: "h2k-mode-btn " + (draft.jumpshotSpeed === js.id ? 'primary' : ''),
                                                            onClick: function onClick() {
                                                                return setDraft(_extends({}, draft, {
                                                                    jumpshotSpeed: js.id
                                                                }));
                                                            },
                                                            children: js.label
                                                        }, js.id);
                                                    })
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h2k-muted",
                                                    style: {
                                                        marginBottom: 8
                                                    },
                                                    children: "Primary Takeover Specialization"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h2k-grid-3",
                                                    children: _modesTypes.TAKEOVER_OPTIONS.map(function(tk) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                            type: "button",
                                                            className: "h2k-card",
                                                            style: {
                                                                textAlign: 'left',
                                                                cursor: 'pointer',
                                                                borderColor: draft.primaryTakeover === tk.id ? tk.accent : 'rgba(255,255,255,0.1)',
                                                                background: draft.primaryTakeover === tk.id ? 'rgba(245,158,11,0.12)' : 'rgba(15,23,42,0.92)'
                                                            },
                                                            onClick: function onClick() {
                                                                return setDraft(_extends({}, draft, {
                                                                    primaryTakeover: tk.id
                                                                }));
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                    style: {
                                                                        color: tk.accent,
                                                                        fontSize: 14
                                                                    },
                                                                    children: tk.label
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "h2k-muted",
                                                                    style: {
                                                                        marginTop: 4
                                                                    },
                                                                    children: tk.boostText
                                                                })
                                                            ]
                                                        }, tk.id);
                                                    })
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-card",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-section-head",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                            children: "VC Attribute Upgrades (Spend Earned VC)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            className: "h2k-wallet-vc h2k-tabular",
                                                            children: [
                                                                "Balance: ",
                                                                hybridSave.currencies.vc.toLocaleString(),
                                                                " VC"
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h2k-grid-3",
                                                    children: _rosterTypes.ATTRIBUTE_META.slice(0, 12).map(function(m) {
                                                        var val = draft.attributes[m.key];
                                                        var atCap = val >= caps[m.key];
                                                        var cost = Math.round(180 + Math.max(0, val - 65) * 32);
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                padding: '8px 10px',
                                                                borderRadius: 8,
                                                                background: 'rgba(30,41,59,0.72)',
                                                                fontSize: 12
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                            children: m.label
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                            className: "h2k-muted h2k-tabular",
                                                                            children: [
                                                                                val,
                                                                                " / ",
                                                                                caps[m.key]
                                                                            ]
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                    type: "button",
                                                                    className: "h2k-mode-btn primary",
                                                                    style: {
                                                                        minHeight: 30,
                                                                        padding: '0 10px'
                                                                    },
                                                                    disabled: atCap,
                                                                    onClick: function onClick() {
                                                                        return handleVcUpgrade(m.key);
                                                                    },
                                                                    children: atCap ? 'MAX' : "+1 (" + cost + ")"
                                                                })
                                                            ]
                                                        }, m.key);
                                                    })
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            })
        ]
    });
};

});

})(window.ArcadeMod);
