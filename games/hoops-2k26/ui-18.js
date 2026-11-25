(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/modes/TrainingCamp ===
ArcadeMod.define("src/games/hoops-2k26/modes/TrainingCamp", function(require, module, exports) {
// ============================================================================
// PART 6 — TRAINING CAMP & FREESTYLE SHOOTAROUND
// Features:
// - Open Court Freestyle Shootaround (pick team or MyPLAYER)
// - 6 Interactive Guided Skill Drills with real-time live objectives in 3D,
//   Bronze / Silver / Gold medals, and VC rewards!
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TrainingCamp", {
    enumerable: true,
    get: function() {
        return TrainingCamp;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _rosterStore = require("../hybrid/rosterStore");
var _store = require("../hybrid/store");
var _audioEngine = require("../hybrid/audioEngine");
var _modesStore = require("./modesStore");
var _modesTypes = require("./modesTypes");
require("./modesHud.css");
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
var MEDAL_COLOR = {
    NONE: '#64748b',
    BRONZE: '#d97706',
    SILVER: '#cbd5e1',
    GOLD: '#fbbf24'
};
var TrainingCamp = function TrainingCamp(param) {
    var eraMode = param.eraMode, onBack = param.onBack, onNotify = param.onNotify;
    var _modes_buildSlots_modes_activeBuildSlotIndex;
    var hybridSave = (0, _store.useUltimateHybridStore)();
    var modes = (0, _modesStore.useModesStore)();
    var activeBuild = (_modes_buildSlots_modes_activeBuildSlotIndex = modes.buildSlots[modes.activeBuildSlotIndex]) != null ? _modes_buildSlots_modes_activeBuildSlotIndex : modes.buildSlots[0];
    var _useState = (0, _react.useState)(true), useMyPlayer = _useState[0], setUseMyPlayer = _useState[1];
    var _useState1 = (0, _react.useState)('2k26_okc'), freestyleTeamId = _useState1[0], setFreestyleTeamId = _useState1[1];
    var teams = (0, _react.useMemo)(function() {
        return _rosterStore.RosterStore.getAllTeams().filter(function(t) {
            return t.era === '2K26' || t.era === '2K14';
        });
    }, []);
    var goldCount = (0, _react.useMemo)(function() {
        return _modesTypes.TRAINING_DRILLS.filter(function(d) {
            return modes.drillMedals[d.id] === 'GOLD';
        }).length;
    }, [
        modes.drillMedals
    ]);
    var getPracticeRoster = function getPracticeRoster() {
        var base = _rosterStore.RosterStore.getTeamById(freestyleTeamId).roster;
        if (!useMyPlayer) return undefined;
        return [].concat([
            (0, _modesStore.buildToPlayerProfile)(activeBuild)
        ], base.slice(1, 6));
    };
    var launchFreestyle = function launchFreestyle() {
        _audioEngine.HybridAudioEngine.playUi('confirm', eraMode);
        _modesStore.ModesStore.launchModeMatch({
            kind: 'TRAINING_FREESTYLE',
            title: 'Training Camp · Open Court Freestyle',
            subtitle: useMyPlayer ? "Practicing with " + activeBuild.name + " (" + activeBuild.ovr + " OVR)" : "Team Shootaround",
            returnScreen: 'LEARN_2K',
            matchPatch: {
                homeTeamId: freestyleTeamId,
                awayTeamId: '2k14_mia',
                venue: 'ARENA_2K26',
                playersPerSide: 1,
                targetScore: null,
                quarterLengthMin: 12,
                difficulty: 'Rookie',
                sideControl: 'HOME',
                modeLabel: 'Open Court Freestyle'
            },
            customHomeRoster: getPracticeRoster(),
            objectiveBanner: 'Freestyle Shootaround · Practice Rhythm Shooting, Euro-Steps & Dribble Chains!',
            baseVcReward: 250
        });
    };
    var launchSkillDrill = function launchSkillDrill(drill) {
        _audioEngine.HybridAudioEngine.playUi('confirm', eraMode);
        var pCount = drill.id === 'DRILL_PNR_PLAYVISION' || drill.id === 'DRILL_ALLEY_OOP' ? 3 : 1;
        onNotify("Starting " + drill.title + " — Gold Target: " + drill.goldTarget + " " + drill.metricLabel);
        _modesStore.ModesStore.launchModeMatch({
            kind: 'TRAINING_DRILL',
            title: drill.title,
            subtitle: drill.description,
            returnScreen: 'LEARN_2K',
            matchPatch: {
                homeTeamId: freestyleTeamId,
                awayTeamId: '2k26_bos',
                venue: 'ARENA_2K26',
                playersPerSide: pCount,
                targetScore: null,
                quarterLengthMin: 2,
                difficulty: drill.id === 'DRILL_LOCKDOWN_REBOUND' ? 'All-Star' : 'Pro',
                sideControl: 'HOME',
                modeLabel: drill.title
            },
            startQuarter: 4,
            startClockSec: drill.durationSec,
            startHomeScore: 0,
            startAwayScore: 0,
            customHomeRoster: getPracticeRoster(),
            trainingDrillId: drill.id,
            objectiveBanner: drill.title + " \xb7 " + drill.controlHint + " \xb7 Gold: " + drill.goldTarget + " " + drill.metricLabel,
            baseVcReward: drill.vcGoldReward
        });
    };
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
                                        children: "TRAINING CAMP & ProPLAY™ LAB"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-mode-submeta",
                                        children: [
                                            "Open Freestyle Shootaround \xb7 6 Guided Skill Drills \xb7 Gold Medals ",
                                            goldCount,
                                            "/6 \uD83E\uDD47"
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "h2k-mode-top-right",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                            className: "h2k-wallet-vc h2k-tabular",
                            style: {
                                fontWeight: 700,
                                fontSize: 13
                            },
                            children: [
                                "VC ",
                                hybridSave.currencies.vc.toLocaleString()
                            ]
                        })
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "h2k-mode-scroll",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "h2k-card",
                        style: {
                            marginBottom: 18,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 14,
                            borderColor: 'rgba(6, 182, 212, 0.45)'
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                        style: {
                                            margin: '0 0 4px',
                                            fontFamily: 'Oswald, sans-serif',
                                            fontSize: 22
                                        },
                                        children: "Open Court Freestyle Shootaround"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                        className: "h2k-muted",
                                        style: {
                                            margin: 0
                                        },
                                        children: "Master your jumpshot visual cue, Rhythm Shooting flicks, Slow-Mo Euro-Steps, and PlayVision sets with zero pressure."
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    flexWrap: 'wrap'
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "h2k-mode-btn " + (useMyPlayer ? 'emerald' : ''),
                                        onClick: function onClick() {
                                            return setUseMyPlayer(function(v) {
                                                return !v;
                                            });
                                        },
                                        children: useMyPlayer ? "Using MyPLAYER: " + activeBuild.name : 'Using NBA Roster Star'
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                        className: "h2k-select",
                                        value: freestyleTeamId,
                                        onChange: function onChange(e) {
                                            return setFreestyleTeamId(e.target.value);
                                        },
                                        style: {
                                            minHeight: 38
                                        },
                                        children: teams.map(function(t) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                value: t.id,
                                                children: [
                                                    t.abbr,
                                                    " \xb7 ",
                                                    t.city,
                                                    " ",
                                                    t.name
                                                ]
                                            }, t.id);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "h2k-mode-btn cyan",
                                        onClick: launchFreestyle,
                                        children: "\uD83C\uDFC0 Enter Freestyle Gym"
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "h2k-section-head",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                            children: "6 Interactive Guided Skill Drills (Bronze / Silver / Gold Medals)"
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "h2k-grid-3",
                        children: _modesTypes.TRAINING_DRILLS.map(function(drill) {
                            var _modes_drillMedals_drill_id, _modes_drillBestScores_drill_id;
                            var medal = (_modes_drillMedals_drill_id = modes.drillMedals[drill.id]) != null ? _modes_drillMedals_drill_id : 'NONE';
                            var best = (_modes_drillBestScores_drill_id = modes.drillBestScores[drill.id]) != null ? _modes_drillBestScores_drill_id : 0;
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("article", {
                                className: "h2k-card",
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    gap: 12
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: 6
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        style: {
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            color: '#38bdf8'
                                                        },
                                                        children: drill.category
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        style: {
                                                            fontSize: 12,
                                                            color: MEDAL_COLOR[medal]
                                                        },
                                                        children: medal === 'NONE' ? 'NO MEDAL' : "\uD83C\uDFC5 " + medal
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                style: {
                                                    margin: '0 0 6px',
                                                    fontFamily: 'Oswald, sans-serif',
                                                    fontSize: 19
                                                },
                                                children: drill.title
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                className: "h2k-muted",
                                                style: {
                                                    margin: '0 0 10px'
                                                },
                                                children: drill.description
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                style: {
                                                    padding: 9,
                                                    borderRadius: 8,
                                                    background: 'rgba(11, 17, 30, 0.85)',
                                                    fontSize: 11,
                                                    color: '#cbd5e1',
                                                    marginBottom: 8
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "Controls:"
                                                    }),
                                                    " ",
                                                    drill.controlHint
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-muted h2k-tabular",
                                                children: [
                                                    "Bronze ",
                                                    drill.bronzeTarget,
                                                    " \xb7 Silver ",
                                                    drill.silverTarget,
                                                    " \xb7 Gold",
                                                    ' ',
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        style: {
                                                            color: '#fbbf24'
                                                        },
                                                        children: drill.goldTarget
                                                    }),
                                                    " (",
                                                    drill.metricLabel,
                                                    ") \xb7 Best: ",
                                                    best,
                                                    " \xb7 Gold Reward",
                                                    ' ',
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                        style: {
                                                            color: '#fbbf24'
                                                        },
                                                        children: [
                                                            "+",
                                                            drill.vcGoldReward,
                                                            " VC"
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "h2k-mode-btn primary",
                                        style: {
                                            width: '100%'
                                        },
                                        onClick: function onClick() {
                                            return launchSkillDrill(drill);
                                        },
                                        children: [
                                            "Launch 3D Drill (",
                                            drill.durationSec,
                                            "s)"
                                        ]
                                    })
                                ]
                            }, drill.id);
                        })
                    })
                ]
            })
        ]
    });
};

});
// === MODULE: src/games/hoops-2k26/modes/WalkablePlaza3D ===
ArcadeMod.define("src/games/hoops-2k26/modes/WalkablePlaza3D", function(require, module, exports) {
// ============================================================================
// PART 6 — 60 FPS WALKABLE 3D PLAZA (Three.js Open-Air City Plaza)
// Features:
// - Composite 3-12 part procedural 12-Foot Golden Statue in Central Plaza
// - All 11 Glowing Landmark Portals + Skyline Park Outdoor Hoops
// - Composite Jogging/Sprinting MyPLAYER Avatar with equipped cosmetics
// - WASD / Arrow Keys + Shift Sprint + Mobile Touch Virtual Stick
// - Press [E] or Tap Interact button when near any portal to enter directly
// - RoomEnvironment PBR lighting, software-WebGL guard & full cleanup
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WalkablePlaza3D", {
    enumerable: true,
    get: function() {
        return WalkablePlaza3D;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _RoomEnvironment = require("three/addons/environments/RoomEnvironment.js");
var _modesTypes = require("./modesTypes");
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
var _camTarget = new _three.Vector3();
var _camDesired = new _three.Vector3();
var _moveDir = new _three.Vector3();
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
function buildPlazaGroundTexture(maxAniso) {
    var c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    var ctx = c.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#182235';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
        ctx.lineWidth = 2;
        for(var i = 0; i <= 512; i += 32){
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
        }
        // Center inlaid plaza medallion rings
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(256, 256, 110, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(256, 256, 175, 0, Math.PI * 2);
        ctx.stroke();
    }
    var tex = new _three.CanvasTexture(c);
    tex.colorSpace = _three.SRGBColorSpace;
    tex.wrapS = _three.RepeatWrapping;
    tex.wrapT = _three.RepeatWrapping;
    tex.repeat.set(6, 6);
    tex.anisotropy = Math.min(8, maxAniso);
    return tex;
}
function createGoldenStatueGroup() {
    var group = new _three.Group();
    var marbleMat = new _three.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.45,
        metalness: 0.15
    });
    var goldMat = new _three.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.18,
        metalness: 0.92
    });
    var glowRingMat = new _three.MeshStandardMaterial({
        color: 0xfde047,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.55,
        roughness: 0.3,
        metalness: 0.5
    });
    // Pedestal base tiers
    var base1 = new _three.Mesh(new _three.CylinderGeometry(3.2, 3.6, 0.6, 24), marbleMat);
    base1.position.y = 0.3;
    base1.receiveShadow = true;
    group.add(base1);
    var base2 = new _three.Mesh(new _three.CylinderGeometry(2.2, 2.6, 1.1, 20), marbleMat);
    base2.position.y = 1.15;
    base2.castShadow = true;
    group.add(base2);
    var goldRing = new _three.Mesh(new _three.TorusGeometry(2.35, 0.09, 10, 32), glowRingMat);
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.y = 1.72;
    group.add(goldRing);
    // 12-foot Golden Legend Silhouette (composite torso, limbs, head, raised trophy ball)
    var legs = new _three.Mesh(new _three.CylinderGeometry(0.42, 0.52, 1.9, 12), goldMat);
    legs.position.y = 2.65;
    legs.castShadow = true;
    group.add(legs);
    var torso = new _three.Mesh(new _three.BoxGeometry(1.1, 1.45, 0.65), goldMat);
    torso.position.y = 4.25;
    torso.castShadow = true;
    group.add(torso);
    var head = new _three.Mesh(new _three.SphereGeometry(0.42, 14, 12), goldMat);
    head.position.y = 5.38;
    head.castShadow = true;
    group.add(head);
    var rightArm = new _three.Mesh(new _three.CylinderGeometry(0.16, 0.18, 1.55, 10), goldMat);
    rightArm.position.set(0.68, 5.15, 0.15);
    rightArm.rotation.z = -0.35;
    group.add(rightArm);
    var goldenBall = new _three.Mesh(new _three.SphereGeometry(0.46, 16, 14), glowRingMat);
    goldenBall.position.set(1.02, 6.02, 0.22);
    group.add(goldenBall);
    return group;
}
function createMyPlayerAvatarMesh(build) {
    var root = new _three.Group();
    var skinMat = new _three.MeshStandardMaterial({
        color: new _three.Color(build.cosmetics.skinTone || '#8d5524'),
        roughness: 0.62,
        metalness: 0.05
    });
    var jerseyMat = new _three.MeshStandardMaterial({
        color: new _three.Color(build.cosmetics.headbandColor || '#06b6d4'),
        roughness: 0.55,
        metalness: 0.1
    });
    var shortsMat = new _three.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.65,
        metalness: 0.08
    });
    var shoeMat = new _three.MeshStandardMaterial({
        color: new _three.Color(build.cosmetics.shoeColor || '#f59e0b'),
        roughness: 0.32,
        metalness: 0.25
    });
    var heightScale = _three.MathUtils.clamp((build.heightInches - 60) / 18, 0.88, 1.22);
    root.scale.setScalar(heightScale);
    var leftLeg = new _three.Mesh(new _three.BoxGeometry(0.22, 0.78, 0.22), skinMat);
    leftLeg.position.set(-0.16, 0.42, 0);
    leftLeg.castShadow = true;
    root.add(leftLeg);
    var rightLeg = new _three.Mesh(new _three.BoxGeometry(0.22, 0.78, 0.22), skinMat);
    rightLeg.position.set(0.16, 0.42, 0);
    rightLeg.castShadow = true;
    root.add(rightLeg);
    var leftShoe = new _three.Mesh(new _three.BoxGeometry(0.24, 0.14, 0.34), shoeMat);
    leftShoe.position.set(0, -0.35, 0.05);
    leftLeg.add(leftShoe);
    var rightShoe = new _three.Mesh(new _three.BoxGeometry(0.24, 0.14, 0.34), shoeMat);
    rightShoe.position.set(0, -0.35, 0.05);
    rightLeg.add(rightShoe);
    var shorts = new _three.Mesh(new _three.BoxGeometry(0.56, 0.36, 0.34), shortsMat);
    shorts.position.y = 0.88;
    root.add(shorts);
    var torso = new _three.Mesh(new _three.BoxGeometry(0.58, 0.68, 0.32), jerseyMat);
    torso.position.y = 1.38;
    torso.castShadow = true;
    root.add(torso);
    var head = new _three.Mesh(new _three.SphereGeometry(0.22, 14, 12), skinMat);
    head.position.y = 1.94;
    head.castShadow = true;
    root.add(head);
    if (build.cosmetics.headband) {
        var hb = new _three.Mesh(new _three.CylinderGeometry(0.23, 0.23, 0.07, 16), new _three.MeshStandardMaterial({
            color: build.cosmetics.headbandColor || '#f59e0b',
            roughness: 0.5
        }));
        hb.position.y = 2.02;
        root.add(hb);
    }
    var leftArm = new _three.Mesh(new _three.BoxGeometry(0.16, 0.62, 0.16), skinMat);
    leftArm.position.set(-0.39, 1.35, 0);
    root.add(leftArm);
    var rightArm = new _three.Mesh(new _three.BoxGeometry(0.16, 0.62, 0.16), skinMat);
    rightArm.position.set(0.39, 1.35, 0);
    root.add(rightArm);
    return {
        root: root,
        leftLeg: leftLeg,
        rightLeg: rightLeg,
        leftArm: leftArm,
        rightArm: rightArm
    };
}
function createPortalMonument(lm) {
    var g = new _three.Group();
    var accent = new _three.Color(lm.accent);
    var pad = new _three.Mesh(new _three.CylinderGeometry(2.6, 2.8, 0.18, 24), new _three.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.4,
        metalness: 0.3
    }));
    pad.position.y = 0.09;
    g.add(pad);
    var ring = new _three.Mesh(new _three.TorusGeometry(2.2, 0.12, 10, 32), new _three.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.75,
        roughness: 0.25,
        metalness: 0.6
    }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.24;
    g.add(ring);
    // Twin architectural arch pillars
    var pillarMat = new _three.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.55
    });
    var leftP = new _three.Mesh(new _three.BoxGeometry(0.38, 3.6, 0.38), pillarMat);
    leftP.position.set(-1.95, 1.8, -0.5);
    leftP.castShadow = true;
    g.add(leftP);
    var rightP = new _three.Mesh(new _three.BoxGeometry(0.38, 3.6, 0.38), pillarMat);
    rightP.position.set(1.95, 1.8, -0.5);
    rightP.castShadow = true;
    g.add(rightP);
    var lintel = new _three.Mesh(new _three.BoxGeometry(4.4, 0.55, 0.46), new _three.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.3,
        roughness: 0.3,
        metalness: 0.65
    }));
    lintel.position.set(0, 3.7, -0.5);
    g.add(lintel);
    g.position.set(lm.worldX, 0, lm.worldZ);
    return g;
}
var WalkablePlaza3D = function WalkablePlaza3D(param) {
    var activeBuild = param.activeBuild, onEnterLandmark = param.onEnterLandmark, onReturnToMap = param.onReturnToMap;
    var mountRef = (0, _react.useRef)(null);
    var _useState = (0, _react.useState)(null), nearestLandmark = _useState[0], setNearestLandmark = _useState[1];
    var _useState1 = (0, _react.useState)('JOG'), speedMode = _useState1[0], setSpeedMode = _useState1[1];
    var touchVecRef = (0, _react.useRef)({
        x: 0,
        z: 0
    });
    var _useState2 = (0, _react.useState)({
        x: 0,
        y: 0
    }), knobOffset = _useState2[0], setKnobOffset = _useState2[1];
    var nearestRef = (0, _react.useRef)(null);
    var onEnterRef = (0, _react.useRef)(onEnterLandmark);
    onEnterRef.current = onEnterLandmark;
    var onMapRef = (0, _react.useRef)(onReturnToMap);
    onMapRef.current = onReturnToMap;
    (0, _react.useEffect)(function() {
        var container = mountRef.current;
        if (!container) return;
        var isSoftwareGl = detectSoftwareGl();
        var renderer = new _three.WebGLRenderer({
            antialias: !isSoftwareGl,
            powerPreference: 'high-performance'
        });
        renderer.outputColorSpace = _three.SRGBColorSpace;
        renderer.toneMapping = _three.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
        renderer.shadowMap.enabled = !isSoftwareGl;
        renderer.shadowMap.type = _three.PCFSoftShadowMap;
        renderer.setSize(container.clientWidth || 960, container.clientHeight || 540);
        container.innerHTML = '';
        container.appendChild(renderer.domElement);
        var scene = new _three.Scene();
        scene.background = new _three.Color(0x0a1326);
        scene.fog = new _three.FogExp2(0x0a1326, 0.0115);
        var pmrem = new _three.PMREMGenerator(renderer);
        var envTex = pmrem.fromScene(new _RoomEnvironment.RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;
        pmrem.dispose();
        var camera = new _three.PerspectiveCamera(55, (container.clientWidth || 960) / Math.max(1, container.clientHeight || 540), 0.1, 260);
        camera.position.set(0, 7.5, 16);
        // Warm key + Cool hemisphere + Rim
        var hemi = new _three.HemisphereLight(0x93c5fd, 0x1e293b, 0.72);
        scene.add(hemi);
        var keyLight = new _three.DirectionalLight(0xfff1d6, 1.55);
        keyLight.position.set(22, 34, 18);
        keyLight.castShadow = !isSoftwareGl;
        keyLight.shadow.mapSize.set(1024, 1024);
        keyLight.shadow.camera.left = -45;
        keyLight.shadow.camera.right = 45;
        keyLight.shadow.camera.top = 45;
        keyLight.shadow.camera.bottom = -45;
        scene.add(keyLight);
        // Open-air plaza floor extending naturally to horizon
        var groundTex = buildPlazaGroundTexture(renderer.capabilities.getMaxAnisotropy());
        var ground = new _three.Mesh(new _three.PlaneGeometry(180, 180), new _three.MeshStandardMaterial({
            map: groundTex,
            roughness: 0.72,
            metalness: 0.14
        }));
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);
        // Central Golden Statue
        var statue = createGoldenStatueGroup();
        scene.add(statue);
        // Skyline perimeter towers (instanced for draw-call efficiency)
        var towerGeo = new _three.BoxGeometry(6, 26, 6);
        var towerMat = new _three.MeshStandardMaterial({
            color: 0x111c33,
            roughness: 0.55,
            metalness: 0.45
        });
        var towerCount = 28;
        var towers = new _three.InstancedMesh(towerGeo, towerMat, towerCount);
        var dummy = new _three.Object3D();
        for(var i = 0; i < towerCount; i++){
            var ang = i / towerCount * Math.PI * 2;
            var rad = 54 + i % 3 * 8;
            var hScale = 0.65 + i * 19 % 10 * 0.14;
            dummy.position.set(Math.cos(ang) * rad, 13 * hScale, Math.sin(ang) * rad);
            dummy.scale.set(1 + i % 2 * 0.35, hScale, 1 + (i + 1) % 2 * 0.35);
            dummy.rotation.y = ang;
            dummy.updateMatrix();
            towers.setMatrixAt(i, dummy.matrix);
        }
        towers.instanceMatrix.needsUpdate = true;
        towers.computeBoundingSphere();
        scene.add(towers);
        // Outdoor Skyline Park Court surface near North-West landmark
        var courtFloor = new _three.Mesh(new _three.PlaneGeometry(11, 16), new _three.MeshStandardMaterial({
            color: 0x0e7490,
            roughness: 0.42,
            metalness: 0.12
        }));
        courtFloor.rotation.x = -Math.PI / 2;
        courtFloor.position.set(-22, 0.03, -20);
        scene.add(courtFloor);
        // All 11 Glowing Landmark Portals (skip central statue overlap by offsetting Central Plaza kiosk slightly)
        var portalRings = [];
        _modesTypes.CITY_LANDMARKS.forEach(function(lm) {
            if (lm.id === 'CENTRAL_PLAZA') return;
            var monument = createPortalMonument(lm);
            scene.add(monument);
            portalRings.push(monument.children[1]);
        });
        // Player Avatar
        var avatar = createMyPlayerAvatarMesh(activeBuild);
        avatar.root.position.set(0, 0, 8);
        scene.add(avatar.root);
        var keys = new Set();
        var onKeyDown = function onKeyDown(e) {
            var k = e.key.toLowerCase();
            keys.add(k);
            if (k === 'e' && nearestRef.current) {
                onEnterRef.current(nearestRef.current.id);
            } else if (k === 'm') {
                onMapRef.current();
            }
        };
        var onKeyUp = function onKeyUp(e) {
            keys.delete(e.key.toLowerCase());
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        var onResize = function onResize() {
            if (!container) return;
            var w = container.clientWidth || 960;
            var h = Math.max(1, container.clientHeight || 540);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);
        var disposed = false;
        var frameId = 0;
        var lastTs = performance.now();
        var walkPhase = 0;
        var yaw = Math.PI;
        var uiSyncAccum = 0;
        function afterDraw(cb) {
            var gl = renderer.getContext();
            if (!gl || !gl.fenceSync) {
                frameId = window.setTimeout(cb, 80);
                return;
            }
            var sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
            gl.flush();
            var poll = function poll1() {
                if (disposed) return;
                var st = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
                if (st === gl.UNSIGNALED) {
                    frameId = window.setTimeout(poll, 6);
                } else {
                    if (sync) gl.deleteSync(sync);
                    frameId = window.setTimeout(cb, 75);
                }
            };
            frameId = window.setTimeout(poll, 6);
        }
        function tick() {
            if (disposed) return;
            var now = performance.now();
            var dt = Math.min(0.05, Math.max(0.004, (now - lastTs) / 1000));
            lastTs = now;
            var ix = touchVecRef.current.x;
            var iz = touchVecRef.current.z;
            if (keys.has('a') || keys.has('arrowleft')) ix -= 1;
            if (keys.has('d') || keys.has('arrowright')) ix += 1;
            if (keys.has('w') || keys.has('arrowup')) iz -= 1;
            if (keys.has('s') || keys.has('arrowdown')) iz += 1;
            var sprinting = keys.has('shift');
            _moveDir.set(ix, 0, iz);
            var mag = _moveDir.length();
            if (mag > 0.08) {
                _moveDir.normalize();
                var moveSpeed = sprinting ? 14.5 : 8.5;
                avatar.root.position.x = _three.MathUtils.clamp(avatar.root.position.x + _moveDir.x * moveSpeed * dt, -36, 36);
                avatar.root.position.z = _three.MathUtils.clamp(avatar.root.position.z + _moveDir.z * moveSpeed * dt, -36, 36);
                var targetYaw = Math.atan2(_moveDir.x, _moveDir.z);
                var diff = targetYaw - yaw;
                while(diff > Math.PI)diff -= Math.PI * 2;
                while(diff < -Math.PI)diff += Math.PI * 2;
                yaw += diff * Math.min(1, dt * 11);
                avatar.root.rotation.y = yaw;
                walkPhase += dt * (sprinting ? 14 : 9);
                var swing = Math.sin(walkPhase) * 0.55;
                avatar.leftLeg.rotation.x = swing;
                avatar.rightLeg.rotation.x = -swing;
                avatar.leftArm.rotation.x = -swing * 0.8;
                avatar.rightArm.rotation.x = swing * 0.8;
            } else {
                avatar.leftLeg.rotation.x *= 0.85;
                avatar.rightLeg.rotation.x *= 0.85;
                avatar.leftArm.rotation.x *= 0.85;
                avatar.rightArm.rotation.x *= 0.85;
            }
            // Smooth golden statue rotation & portal hover pulse
            statue.rotation.y += dt * 0.22;
            for(var i = 0; i < portalRings.length; i++){
                portalRings[i].rotation.z += dt * 0.7;
            }
            // Smooth third-person follow camera
            _camDesired.set(avatar.root.position.x, avatar.root.position.y + 6.4, avatar.root.position.z + 11.5);
            camera.position.lerp(_camDesired, 1 - Math.exp(-6.5 * dt));
            _camTarget.set(avatar.root.position.x, avatar.root.position.y + 1.8, avatar.root.position.z - 2);
            camera.lookAt(_camTarget);
            // Proximity landmark detection (throttled ~10 Hz to avoid React spam)
            uiSyncAccum += dt;
            if (uiSyncAccum >= 0.1) {
                uiSyncAccum = 0;
                var closest = null;
                var bestDist = 6.2;
                for(var i1 = 0; i1 < _modesTypes.CITY_LANDMARKS.length; i1++){
                    var lm = _modesTypes.CITY_LANDMARKS[i1];
                    var dx = avatar.root.position.x - lm.worldX;
                    var dz = avatar.root.position.z - lm.worldZ;
                    var d = Math.hypot(dx, dz);
                    if (d < bestDist) {
                        bestDist = d;
                        closest = lm;
                    }
                }
                if ((closest && closest.id) !== (nearestRef.current && nearestRef.current.id)) {
                    nearestRef.current = closest;
                    setNearestLandmark(closest);
                }
                setSpeedMode(sprinting ? 'SPRINT' : 'JOG');
            }
            renderer.render(scene, camera);
            if (isSoftwareGl) afterDraw(tick);
            else frameId = requestAnimationFrame(tick);
        }
        if (!isSoftwareGl) {
            renderer.compile(scene, camera);
        }
        tick();
        return function() {
            disposed = true;
            cancelAnimationFrame(frameId);
            clearTimeout(frameId);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('resize', onResize);
            envTex.dispose();
            groundTex.dispose();
            scene.traverse(function(obj) {
                var mesh = obj;
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) {
                    if (Array.isArray(mesh.material)) mesh.material.forEach(function(m) {
                        return m.dispose();
                    });
                    else mesh.material.dispose();
                }
            });
            renderer.dispose();
        };
    }, [
        activeBuild
    ]);
    var handleTouchMove = function handleTouchMove(e) {
        if (e.buttons === 0 && e.pointerType === 'mouse') return;
        var rect = e.currentTarget.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var maxR = rect.width * 0.42;
        var dx = Math.max(-maxR, Math.min(maxR, e.clientX - cx));
        var dy = Math.max(-maxR, Math.min(maxR, e.clientY - cy));
        setKnobOffset({
            x: dx,
            y: dy
        });
        touchVecRef.current = {
            x: dx / maxR,
            z: dy / maxR
        };
    };
    var resetTouchStick = function resetTouchStick() {
        setKnobOffset({
            x: 0,
            y: 0
        });
        touchVecRef.current = {
            x: 0,
            z: 0
        };
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h2k-plaza-root",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                ref: mountRef,
                className: "h2k-plaza-canvas"
            }),
            nearestLandmark && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "h2k-plaza-prompt",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                style: {
                                    fontSize: 11,
                                    color: '#94a3b8',
                                    fontWeight: 700
                                },
                                children: nearestLandmark.district
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                style: {
                                    fontSize: 15
                                },
                                children: [
                                    nearestLandmark.icon,
                                    " ",
                                    nearestLandmark.name
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        className: "h2k-mode-btn primary",
                        onClick: function onClick() {
                            return onEnterLandmark(nearestLandmark.id);
                        },
                        children: "[E] Enter Landmark"
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-plaza-touch-stick",
                onPointerDown: function onPointerDown(e) {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    handleTouchMove(e);
                },
                onPointerMove: handleTouchMove,
                onPointerUp: resetTouchStick,
                onPointerCancel: resetTouchStick,
                "aria-label": "Walkable 3D Plaza Movement Stick",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "h2k-plaza-touch-knob",
                    style: {
                        transform: "translate(calc(-50% + " + knobOffset.x + "px), calc(-50% + " + knobOffset.y + "px))"
                    }
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "h2k-plaza-dock",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                        className: "h2k-muted",
                        style: {
                            whiteSpace: 'nowrap'
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                style: {
                                    color: '#f8fafc'
                                },
                                children: activeBuild.name
                            }),
                            " (",
                            activeBuild.ovr,
                            " OVR) \xb7",
                            ' ',
                            speedMode,
                            " \xb7 WASD / Stick Move \xb7 Shift Sprint \xb7 E Enter"
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        className: "h2k-mode-btn cyan",
                        onClick: onReturnToMap,
                        children: "\uD83D\uDDFA️ [M] 2.5D City Map"
                    })
                ]
            })
        ]
    });
};

});
// === MODULE: src/games/hoops-2k26/nba2k14/components/FeaturesView ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/components/FeaturesView", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FeaturesView", {
    enumerable: true,
    get: function() {
        return FeaturesView;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _lucidereact = require("lucide-react");
var _Nba2k14Audio = require("../audio/Nba2k14Audio");
var _modesData = require("../data/modesData");
var _rosters = require("../data/rosters");
var _signatureSkills = require("../data/signatureSkills");
var _storage = require("../storage");
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
var FeaturesView = function FeaturesView(param) {
    var save = param.save, onUpdateSave = param.onUpdateSave;
    var _ref;
    var _selectedTeam_players_;
    var _useState = (0, _react.useState)('rosters'), tab = _useState[0], setTab = _useState[1];
    var resolvedTeams = (0, _react.useMemo)(function() {
        return (0, _storage.getResolvedTeams)(save);
    }, [
        save
    ]);
    // Manage Rosters state
    var _useState1 = (0, _react.useState)('mia'), selectedTeamId = _useState1[0], setSelectedTeamId = _useState1[1];
    var selectedTeam = (0, _react.useMemo)(function() {
        var _resolvedTeams_find;
        return (_resolvedTeams_find = resolvedTeams.find(function(t) {
            return t.id === selectedTeamId;
        })) != null ? _resolvedTeams_find : resolvedTeams[0];
    }, [
        resolvedTeams,
        selectedTeamId
    ]);
    var _useState2 = (0, _react.useState)((_ref = (_selectedTeam_players_ = selectedTeam.players[0]) == null ? void 0 : _selectedTeam_players_.id) != null ? _ref : ''), selectedPlayerId = _useState2[0], setSelectedPlayerId = _useState2[1];
    var activePlayer = (0, _react.useMemo)(function() {
        var _selectedTeam_players_find;
        return (_selectedTeam_players_find = selectedTeam.players.find(function(p) {
            return p.id === selectedPlayerId;
        })) != null ? _selectedTeam_players_find : selectedTeam.players[0];
    }, [
        selectedTeam,
        selectedPlayerId
    ]);
    // Create-a-Player state
    var _useState3 = (0, _react.useState)('Custom Legend'), capName = _useState3[0], setCapName = _useState3[1];
    var _useState4 = (0, _react.useState)('SF'), capPos = _useState4[0], setCapPos = _useState4[1];
    var _useState5 = (0, _react.useState)(23), capJersey = _useState5[0], setCapJersey = _useState5[1];
    var _useState6 = (0, _react.useState)(86), capOvr = _useState6[0], setCapOvr = _useState6[1];
    var _useState7 = (0, _react.useState)('All-Around'), capStyle = _useState7[0], setCapStyle = _useState7[1];
    var _useState8 = (0, _react.useState)('mia'), capTeamId = _useState8[0], setCapTeamId = _useState8[1];
    var _useState9 = (0, _react.useState)(null), capMsg = _useState9[0], setCapMsg = _useState9[1];
    // Locker Code state
    var _useState10 = (0, _react.useState)(''), codeInput = _useState10[0], setCodeInput = _useState10[1];
    var _useState11 = (0, _react.useState)(null), codeFeedback = _useState11[0], setCodeFeedback = _useState11[1];
    var handleUpdatePlayerField = function handleUpdatePlayerField(field, value) {
        if (!activePlayer) return;
        onUpdateSave(function(prev) {
            var _prev_rosterOverrides_activePlayer_id;
            var curOv = (_prev_rosterOverrides_activePlayer_id = prev.rosterOverrides[activePlayer.id]) != null ? _prev_rosterOverrides_activePlayer_id : {};
            var nextOvr = field === 'ovr' ? Math.max(55, Math.min(99, value)) : activePlayer.ovr;
            var nextJersey = field === 'jersey' ? Math.max(0, Math.min(99, value)) : activePlayer.jersey;
            var _obj;
            return _extends({}, prev, {
                rosterOverrides: _extends({}, prev.rosterOverrides, (_obj = {}, _obj[activePlayer.id] = _extends({}, curOv, {
                    ovr: nextOvr,
                    jersey: nextJersey
                }), _obj))
            });
        });
    };
    var handleTransferPlayer = function handleTransferPlayer(newTeamId) {
        if (!activePlayer) return;
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        onUpdateSave(function(prev) {
            var _obj;
            return _extends({}, prev, {
                teamTransfers: _extends({}, prev.teamTransfers, (_obj = {}, _obj[activePlayer.id] = newTeamId, _obj))
            });
        });
    };
    var handleTogglePlayerSkill = function handleTogglePlayerSkill(skillId) {
        if (!activePlayer) return;
        _Nba2k14Audio.Nba2k14Audio.playUiClick('hover');
        var has = activePlayer.signatureSkills.some(function(s) {
            return s.id === skillId;
        });
        var nextSkills = has ? activePlayer.signatureSkills.filter(function(s) {
            return s.id !== skillId;
        }) : [].concat(activePlayer.signatureSkills, [
            {
                id: skillId,
                level: 2
            }
        ]).slice(0, 5);
        onUpdateSave(function(prev) {
            var _prev_rosterOverrides_activePlayer_id;
            var _obj;
            return _extends({}, prev, {
                rosterOverrides: _extends({}, prev.rosterOverrides, (_obj = {}, _obj[activePlayer.id] = _extends({}, (_prev_rosterOverrides_activePlayer_id = prev.rosterOverrides[activePlayer.id]) != null ? _prev_rosterOverrides_activePlayer_id : {}, {
                    signatureSkills: nextSkills
                }), _obj))
            });
        });
    };
    var handleCreateCustomPlayer = function handleCreateCustomPlayer() {
        var _ref;
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        var built = (0, _storage.buildMyPlayerFromSpec)(capName, capJersey, capPos, capStyle, 201, 220, '#7b4d31', 'fade', true, true, false, '#CE1141', capTeamId);
        var boosted = _extends({}, built, {
            id: "cap_" + Date.now(),
            ovr: capOvr,
            attrs: Object.fromEntries(Object.entries(built.attrs).map(function(param) {
                var k = param[0], v = param[1];
                return [
                    k,
                    Math.min(99, Math.max(50, v + (capOvr - 68)))
                ];
            }))
        });
        onUpdateSave(function(prev) {
            return _extends({}, prev, {
                customPlayers: [].concat(prev.customPlayers, [
                    boosted
                ])
            });
        });
        var team = _rosters.ALL_TEAMS.find(function(t) {
            return t.id === capTeamId;
        });
        setCapMsg("Added " + boosted.name + " (" + boosted.ovr + " OVR " + boosted.pos + ") to " + ((_ref = team == null ? void 0 : team.fullName) != null ? _ref : capTeamId) + "!");
    };
    var toggleTrackEnabled = function toggleTrackEnabled(trackId) {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('hover');
        onUpdateSave(function(prev) {
            var cur = prev.settings.jukeboxDisabledTrackIds;
            var next = cur.includes(trackId) ? cur.filter(function(id) {
                return id !== trackId;
            }) : [].concat(cur, [
                trackId
            ]);
            return _extends({}, prev, {
                settings: _extends({}, prev.settings, {
                    jukeboxDisabledTrackIds: next
                })
            });
        });
    };
    var handleRedeemCode = function handleRedeemCode() {
        var res = (0, _storage.redeemLockerCode)(save, codeInput);
        _Nba2k14Audio.Nba2k14Audio.playUiClick(res.ok ? 'select' : 'back');
        setCodeFeedback({
            ok: res.ok,
            text: res.message
        });
        if (res.ok) {
            onUpdateSave(function() {
                return res.nextSave;
            });
            setCodeInput('');
        }
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h-full flex flex-col px-5 py-3 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl px-4 py-2.5 mb-3 flex flex-wrap items-center justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "text-xs font-black uppercase tracking-[0.2em] text-[#F9A01B]",
                        children: "NBA 2K14 \xb7 FEATURES & EXTRAS"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "flex flex-wrap gap-1.5",
                        children: [
                            {
                                id: 'rosters',
                                label: 'Manage Rosters',
                                icon: _lucidereact.Users
                            },
                            {
                                id: 'create',
                                label: 'Create-a-Player',
                                icon: _lucidereact.PlusCircle
                            },
                            {
                                id: 'beats',
                                label: '2K Beats (20 Tracks)',
                                icon: _lucidereact.Disc3
                            },
                            {
                                id: 'locker',
                                label: 'Locker Codes',
                                icon: _lucidereact.KeyRound
                            },
                            {
                                id: 'credits',
                                label: 'Credits',
                                icon: _lucidereact.SlidersHorizontal
                            }
                        ].map(function(t) {
                            var Icon = t.icon;
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    _Nba2k14Audio.Nba2k14Audio.playUiClick('hover');
                                    setTab(t.id);
                                },
                                className: "px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 border cursor-pointer " + (tab === t.id ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#171a22] border-white/10 text-zinc-300 hover:border-white/30'),
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(Icon, {
                                        className: "w-3.5 h-3.5"
                                    }),
                                    " ",
                                    t.label
                                ]
                            }, t.id);
                        })
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "flex-1 min-h-0 overflow-y-auto",
                children: [
                    tab === 'rosters' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-4 flex flex-col",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                        className: "text-[10px] font-black uppercase text-[#F9A01B]",
                                        children: "Select Any of 50 Teams"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                        value: selectedTeamId,
                                        onChange: function onChange(e) {
                                            setSelectedTeamId(e.target.value);
                                            var found = resolvedTeams.find(function(t) {
                                                return t.id === e.target.value;
                                            });
                                            if (found == null ? void 0 : found.players[0]) setSelectedPlayerId(found.players[0].id);
                                        },
                                        className: "mt-1.5 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-xs font-bold text-white",
                                        children: resolvedTeams.map(function(t) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                value: t.id,
                                                children: [
                                                    "[",
                                                    t.league,
                                                    "] ",
                                                    t.fullName,
                                                    " (",
                                                    t.ovr,
                                                    ")"
                                                ]
                                            }, t.id);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "mt-3 space-y-1.5 overflow-y-auto max-h-96 pr-1",
                                        children: selectedTeam.players.map(function(p) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                onClick: function onClick() {
                                                    return setSelectedPlayerId(p.id);
                                                },
                                                className: "w-full px-3 py-2 rounded-lg text-left border flex items-center justify-between text-xs cursor-pointer " + ((activePlayer == null ? void 0 : activePlayer.id) === p.id ? 'bg-[#CE1141]/25 border-[#F9A01B] text-white' : 'bg-[#151820] border-white/10 text-zinc-300'),
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "font-bold",
                                                        children: [
                                                            "#",
                                                            p.jersey,
                                                            " ",
                                                            p.name,
                                                            " ",
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                className: "text-zinc-400",
                                                                children: [
                                                                    "(",
                                                                    p.pos,
                                                                    ")"
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "font-black text-[#F9A01B]",
                                                        children: p.ovr
                                                    })
                                                ]
                                            }, p.id);
                                        })
                                    })
                                ]
                            }),
                            activePlayer && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lg:col-span-2 bg-[#0f1116]/94 border border-white/15 rounded-xl p-5 space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[10px] font-black uppercase text-[#F9A01B]",
                                                        children: "ROSTER EDITOR"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                                        className: "text-xl font-black text-white",
                                                        children: [
                                                            activePlayer.name,
                                                            " #",
                                                            activePlayer.jersey,
                                                            " \xb7 ",
                                                            activePlayer.pos
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-2xl font-black text-[#F9A01B]",
                                                children: [
                                                    activePlayer.ovr,
                                                    " OVR"
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                        className: "text-[10px] font-bold uppercase text-zinc-400",
                                                        children: [
                                                            "Overall Rating (",
                                                            activePlayer.ovr,
                                                            ")"
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                        type: "range",
                                                        min: 55,
                                                        max: 99,
                                                        value: activePlayer.ovr,
                                                        onChange: function onChange(e) {
                                                            return handleUpdatePlayerField('ovr', Number(e.target.value));
                                                        },
                                                        className: "w-full accent-[#CE1141] mt-2"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                        className: "text-[10px] font-bold uppercase text-zinc-400",
                                                        children: "Jersey Number"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                        type: "number",
                                                        min: 0,
                                                        max: 99,
                                                        value: activePlayer.jersey,
                                                        onChange: function onChange(e) {
                                                            return handleUpdatePlayerField('jersey', Number(e.target.value));
                                                        },
                                                        className: "mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-1.5 text-sm font-black text-white"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                        className: "text-[10px] font-bold uppercase text-zinc-400",
                                                        children: "Transfer Team"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                        value: selectedTeam.id,
                                                        onChange: function onChange(e) {
                                                            return handleTransferPlayer(e.target.value);
                                                        },
                                                        className: "mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white",
                                                        children: _rosters.ALL_TEAMS.map(function(t) {
                                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                                value: t.id,
                                                                children: [
                                                                    t.code,
                                                                    " \xb7 ",
                                                                    t.fullName
                                                                ]
                                                            }, t.id);
                                                        })
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-[10px] font-black uppercase text-[#F9A01B] mb-2",
                                                children: [
                                                    "Signature Skills (",
                                                    activePlayer.signatureSkills.length,
                                                    "/5 Equipped)"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1",
                                                children: _signatureSkills.SIGNATURE_SKILLS.map(function(sk) {
                                                    var eq = activePlayer.signatureSkills.some(function(s) {
                                                        return s.id === sk.id;
                                                    });
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        onClick: function onClick() {
                                                            return handleTogglePlayerSkill(sk.id);
                                                        },
                                                        className: "px-2.5 py-1.5 rounded text-left text-[11px] font-bold border cursor-pointer " + (eq ? 'bg-[#F9A01B]/20 border-[#F9A01B] text-[#F9A01B]' : 'bg-[#151820] border-white/10 text-zinc-400 hover:text-white'),
                                                        children: [
                                                            "[",
                                                            sk.code,
                                                            "] ",
                                                            sk.name
                                                        ]
                                                    }, sk.id);
                                                })
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    tab === 'create' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "max-w-2xl mx-auto bg-[#0f1116]/94 border border-white/15 rounded-xl p-6 space-y-4",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                className: "text-xl font-black text-white uppercase",
                                children: "CREATE-A-PLAYER & ASSIGN TO ROSTER"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "grid grid-cols-2 gap-3",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[10px] font-bold uppercase text-zinc-400",
                                                children: "Full Name"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                value: capName,
                                                onChange: function onChange(e) {
                                                    return setCapName(e.target.value);
                                                },
                                                className: "mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-bold text-white"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[10px] font-bold uppercase text-zinc-400",
                                                children: "Assign to Team"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                value: capTeamId,
                                                onChange: function onChange(e) {
                                                    return setCapTeamId(e.target.value);
                                                },
                                                className: "mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-bold text-white",
                                                children: _rosters.ALL_TEAMS.map(function(t) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                        value: t.id,
                                                        children: [
                                                            t.code,
                                                            " \xb7 ",
                                                            t.fullName
                                                        ]
                                                    }, t.id);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[10px] font-bold uppercase text-zinc-400",
                                                children: "Position"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                value: capPos,
                                                onChange: function onChange(e) {
                                                    return setCapPos(e.target.value);
                                                },
                                                className: "mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-bold text-white",
                                                children: [
                                                    'PG',
                                                    'SG',
                                                    'SF',
                                                    'PF',
                                                    'C'
                                                ].map(function(p) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: p,
                                                        children: p
                                                    }, p);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[10px] font-bold uppercase text-zinc-400",
                                                children: "Archetype"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                value: capStyle,
                                                onChange: function onChange(e) {
                                                    return setCapStyle(e.target.value);
                                                },
                                                className: "mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-bold text-white",
                                                children: [
                                                    'Athletic',
                                                    'Scoring',
                                                    '3PT Specialist',
                                                    'All-Around',
                                                    'Pass First',
                                                    'Defensive',
                                                    'Post',
                                                    'Rebounding'
                                                ].map(function(s) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: s,
                                                        children: s
                                                    }, s);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[10px] font-bold uppercase text-zinc-400",
                                                children: "Jersey #"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                type: "number",
                                                min: 0,
                                                max: 99,
                                                value: capJersey,
                                                onChange: function onChange(e) {
                                                    return setCapJersey(Number(e.target.value));
                                                },
                                                className: "mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-bold text-white"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                className: "text-[10px] font-bold uppercase text-zinc-400",
                                                children: [
                                                    "Overall Rating (",
                                                    capOvr,
                                                    ")"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                type: "range",
                                                min: 65,
                                                max: 99,
                                                value: capOvr,
                                                onChange: function onChange(e) {
                                                    return setCapOvr(Number(e.target.value));
                                                },
                                                className: "w-full accent-[#CE1141] mt-3"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: handleCreateCustomPlayer,
                                className: "w-full py-3 rounded-xl bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase text-sm cursor-pointer",
                                children: "Add Custom Player to Roster"
                            }),
                            capMsg && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "text-xs font-bold text-emerald-400",
                                children: capMsg
                            })
                        ]
                    }),
                    tab === 'beats' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-5",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex flex-wrap items-center justify-between gap-2 mb-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[10px] font-black uppercase tracking-widest text-[#F9A01B]",
                                                children: "CURATED BY LEBRON JAMES"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                                className: "text-lg font-black text-white uppercase",
                                                children: "2K BEATS JUKEBOX (20 PROCEDURAL TRACKS)"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        onClick: function onClick() {
                                            return _Nba2k14Audio.Nba2k14Audio.toggleBeats();
                                        },
                                        className: "px-4 py-2 rounded-lg bg-[#CE1141] text-white font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Volume2, {
                                                className: "w-3.5 h-3.5"
                                            }),
                                            " Play / Pause Beats"
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 gap-2",
                                children: _modesData.BEATS_2K14_TRACKLIST.map(function(track, idx) {
                                    var disabled = save.settings.jukeboxDisabledTrackIds.includes(track.id);
                                    var playing = _Nba2k14Audio.Nba2k14Audio.getCurrentTrack().id === track.id && _Nba2k14Audio.Nba2k14Audio.isBeatsPlaying();
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "rounded-lg px-3.5 py-2.5 border flex items-center justify-between gap-3 " + (playing ? 'bg-[#221519] border-[#F9A01B]' : 'bg-[#151820] border-white/10'),
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "text-xs font-black text-white truncate",
                                                        children: [
                                                            String(idx + 1).padStart(2, '0'),
                                                            ". ",
                                                            track.title
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "text-[10px] text-zinc-400",
                                                        children: [
                                                            track.artist,
                                                            " \xb7 ",
                                                            track.bpm,
                                                            " BPM \xb7 ",
                                                            track.style.replace('_', ' ').toUpperCase()
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex items-center gap-1.5 shrink-0",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        onClick: function onClick() {
                                                            return _Nba2k14Audio.Nba2k14Audio.playTrackById(track.id);
                                                        },
                                                        className: "px-2.5 py-1 rounded bg-[#CE1141] hover:bg-[#e1194d] text-white text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Play, {
                                                                className: "w-3 h-3 fill-current"
                                                            }),
                                                            " Play"
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: function onClick() {
                                                            return toggleTrackEnabled(track.id);
                                                        },
                                                        className: "px-2 py-1 rounded text-[10px] font-black uppercase border cursor-pointer " + (disabled ? 'bg-zinc-900 border-white/10 text-zinc-500' : 'bg-emerald-900/40 border-emerald-500/40 text-emerald-300'),
                                                        children: disabled ? 'OFF' : 'ON'
                                                    })
                                                ]
                                            })
                                        ]
                                    }, track.id);
                                })
                            })
                        ]
                    }),
                    tab === 'locker' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "max-w-2xl mx-auto bg-[#0f1116]/94 border border-white/15 rounded-xl p-6 space-y-5",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[10px] font-black uppercase tracking-widest text-[#F9A01B]",
                                        children: "OFFICIAL 2K14 REWARDS"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                        className: "text-2xl font-black text-white uppercase mt-1",
                                        children: "REDEEM LOCKER CODES"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                        className: "text-xs text-zinc-400 mt-1",
                                        children: "Enter an NBA 2K14 Locker Code below to claim instant VC, SP, MyTEAM Points, Park REP, and Gold/Historic Player Cards."
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                        value: codeInput,
                                        onChange: function onChange(e) {
                                            return setCodeInput(e.target.value.toUpperCase());
                                        },
                                        onKeyDown: function onKeyDown(e) {
                                            return e.key === 'Enter' && handleRedeemCode();
                                        },
                                        placeholder: "ENTER CODE (E.G. KINGJAMES)",
                                        className: "flex-1 bg-[#171a22] border border-white/20 rounded-xl px-4 py-3 text-base font-black tracking-widest text-white uppercase focus:outline-none focus:border-[#F9A01B]"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: handleRedeemCode,
                                        className: "px-6 py-3 rounded-xl bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase text-xs tracking-wider cursor-pointer",
                                        children: "Redeem"
                                    })
                                ]
                            }),
                            codeFeedback && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "p-3 rounded-lg border text-xs font-bold " + (codeFeedback.ok ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-red-950/60 border-red-500 text-red-300'),
                                children: codeFeedback.text
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "border-t border-white/10 pt-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[10px] font-black uppercase text-[#F9A01B] mb-2",
                                        children: "Active 2K14 Vault Codes"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "space-y-2",
                                        children: _modesData.LOCKER_CODES.map(function(c) {
                                            var used = save.vip.redeemedCodes.includes(c.code);
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "bg-[#151820] border border-white/10 rounded-lg px-3.5 py-2.5 flex items-center justify-between text-xs",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "font-black text-[#F9A01B] tracking-wider mr-2",
                                                                children: c.code
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "text-zinc-300",
                                                                children: c.label
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        disabled: used,
                                                        onClick: function onClick() {
                                                            return setCodeInput(c.code);
                                                        },
                                                        className: "px-2.5 py-1 rounded text-[10px] font-black uppercase shrink-0 cursor-pointer " + (used ? 'bg-emerald-900/40 text-emerald-300 cursor-default' : 'bg-[#1c202a] hover:bg-[#2c3345] text-white'),
                                                        children: used ? 'REDEEMED' : 'USE'
                                                    })
                                                ]
                                            }, c.code);
                                        })
                                    })
                                ]
                            })
                        ]
                    }),
                    tab === 'credits' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "max-w-2xl mx-auto bg-[#0f1116]/94 border border-white/15 rounded-xl p-6 space-y-3 text-xs text-zinc-300",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "text-[10px] font-black uppercase tracking-widest text-[#F9A01B]",
                                children: "2013–14 CHAMPIONSHIP EDITION"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                className: "text-2xl font-black text-white uppercase",
                                children: "NBA 2K14 \xb7 WEBGL 3D ENGINE"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                className: "leading-relaxed",
                                children: "Built with real-time Three.js articulated 3D hardwood simulation, procedural 2048\xd71024 court arenas (NBA, Euroleague FIBA, Blacktop, The Park, Practice Gym), 50 authentic 2013–14 rosters, 38 active Signature Skills, Pro Stick IsoMotion & Shooting, 10-second 3D Instant Replay camera, and a 20-track procedural Web Audio 2K Beats synthesizer."
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "grid grid-cols-2 gap-3 pt-2",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "bg-[#151820] border border-white/10 rounded-lg p-3",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[10px] text-[#F9A01B] font-black uppercase",
                                                children: "Teams & Rosters"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-white font-bold mt-0.5",
                                                children: "30 NBA \xb7 14 Euroleague \xb7 4 Classic \xb7 2 All-Star"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "bg-[#151820] border border-white/10 rounded-lg p-3",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[10px] text-[#F9A01B] font-black uppercase",
                                                children: "Gameplay Systems"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-white font-bold mt-0.5",
                                                children: "Pro Stick \xb7 OTFC \xb7 38 Signature Skills \xb7 14 Hot Zones"
                                            })
                                        ]
                                    })
                                ]
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
