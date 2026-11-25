(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/hybrid/HybridModals ===
ArcadeMod.define("src/games/hoops-2k26/hybrid/HybridModals", function(require, module, exports) {
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
    get HybridModals () {
        return HybridModals;
    },
    get ModeHubView () {
        return ModeHubView;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _audioEngine = require("./audioEngine");
var _store = require("./store");
var _modesStore = require("../modes/modesStore");
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
var SETTINGS_TABS = [
    {
        id: 'GAMEPLAY',
        label: 'Gameplay'
    },
    {
        id: 'CONTROLLER',
        label: 'Controller / ProPLAY'
    },
    {
        id: 'CAMERA',
        label: 'Camera'
    },
    {
        id: 'AUDIO',
        label: 'Audio / 2K Beats'
    },
    {
        id: 'VISUAL',
        label: 'Visual / HUD'
    },
    {
        id: 'COACH',
        label: 'Coach / Sliders'
    },
    {
        id: 'DATA',
        label: 'Data / Save JSON'
    }
];
var HybridModals = function HybridModals(param) {
    var save = param.save, drawer = param.drawer, beats = param.beats, initialSettingsTab = param.initialSettingsTab, onClose = param.onClose, onNotify = param.onNotify, onOpenCity3D = param.onOpenCity3D, onOpenClassicStudio = param.onOpenClassicStudio;
    var _save_profile_winStreak, _save_profile_bestWinStreak, _modes_buildSlots_modes_activeBuildSlotIndex;
    var _useState = (0, _react.useState)(initialSettingsTab != null ? initialSettingsTab : 'GAMEPLAY'), settingsTab = _useState[0], setSettingsTab = _useState[1];
    var _useState1 = (0, _react.useState)(''), jsonBox = _useState1[0], setJsonBox = _useState1[1];
    var _useState2 = (0, _react.useState)(save.profile.gamertag), tagDraft = _useState2[0], setTagDraft = _useState2[1];
    var modes = (0, _modesStore.useModesStore)();
    (0, _react.useEffect)(function() {
        if (drawer === 'SETTINGS' && initialSettingsTab) {
            setSettingsTab(initialSettingsTab);
        }
    }, [
        drawer,
        initialSettingsTab
    ]);
    if (!drawer) return null;
    var era = save.uiEraMode;
    var syncAudioToEngine = function syncAudioToEngine(nextAudio) {
        _store.UltimateHybridStore.updateSettings('audio', nextAudio);
        _audioEngine.HybridAudioEngine.applySettings(nextAudio);
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "h2k-modal-overlay",
        onClick: onClose,
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "h2k-modal-panel",
            onClick: function onClick(e) {
                return e.stopPropagation();
            },
            children: [
                drawer === 'SETTINGS' && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                            className: "h2k-modal-head",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-kicker",
                                            children: "UNIFIED 2K14 + 2K26 CONFIGURATION"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                            children: "7-TAB SETTINGS & SYSTEM"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "h2k-close-btn",
                                    onClick: onClose,
                                    children: "✕"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "h2k-modal-tabs",
                            children: SETTINGS_TABS.map(function(t) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "h2k-modal-tab " + (settingsTab === t.id ? 'active' : ''),
                                    onClick: function onClick() {
                                        _audioEngine.HybridAudioEngine.playUi('click', era);
                                        setSettingsTab(t.id);
                                    },
                                    children: t.label
                                }, t.id);
                            })
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "h2k-modal-body",
                            children: [
                                settingsTab === 'GAMEPLAY' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-form-grid",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Difficulty Preset"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                    className: "h2k-select",
                                                    value: save.settings.gameplay.difficulty,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('gameplay', {
                                                            difficulty: e.target.value
                                                        });
                                                    },
                                                    children: [
                                                        'Rookie',
                                                        'Pro',
                                                        'All-Star',
                                                        'Superstar',
                                                        'Hall of Fame'
                                                    ].map(function(d) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: d,
                                                            children: d
                                                        }, d);
                                                    })
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Shooting Model"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    className: "h2k-select",
                                                    value: save.settings.gameplay.shootingModel,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('gameplay', {
                                                            shootingModel: e.target.value
                                                        });
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "HYBRID_RHYTHM",
                                                            children: "Hybrid Pro Rhythm + Timing"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "TIMING_2K26",
                                                            children: "2K26 Green-or-Miss Timing"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "REAL_FG_2K14",
                                                            children: "2K14 Real Player FG%"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Shot Timing Profile (2K26 ProPLAY)"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    className: "h2k-select",
                                                    value: save.settings.gameplay.shotTimingProfile,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('gameplay', {
                                                            shotTimingProfile: e.target.value
                                                        });
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "NORMAL",
                                                            children: "Normal / Hybrid Rhythm (Balanced)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "HIGH_RISK",
                                                            children: "High-Risk Reward (Wide Green, Tight Miss)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "GREEN_OR_MISS",
                                                            children: "Green-or-Miss (Pure Skill Timing)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "LOW_RISK",
                                                            children: "Low-Risk Forgiving (Rating-Assisted)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "REAL_PLAYER_PCT",
                                                            children: "Real Player % (2K14 Ratings Only)"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Jumpshot Visual Cue"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    className: "h2k-select",
                                                    value: save.settings.gameplay.visualCue,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('gameplay', {
                                                            visualCue: e.target.value
                                                        });
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "JUMP",
                                                            children: "Jump (Early Lift-Off Cue)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "SET_POINT",
                                                            children: "Set Point (Forehead Set \xb7 Default)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "PUSH",
                                                            children: "Push (Forward Arm Extension)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "RELEASE",
                                                            children: "Release (Wrist Flick Peak)"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Blacktop Scoring Mode"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    className: "h2k-select",
                                                    value: save.settings.gameplay.blacktopScoring,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('gameplay', {
                                                            blacktopScoring: e.target.value
                                                        });
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "1S_2S",
                                                            children: "1s & 2s (Authentic Streetball)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "2S_3S",
                                                            children: "2s & 3s (Pro Regulation Scoring)"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    children: [
                                                        "Game Speed (",
                                                        save.settings.gameplay.gameSpeed,
                                                        ")"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "range",
                                                    min: 40,
                                                    max: 70,
                                                    value: save.settings.gameplay.gameSpeed,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('gameplay', {
                                                            gameSpeed: Number(e.target.value)
                                                        });
                                                    }
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-check-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: save.settings.gameplay.fatigue,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('gameplay', {
                                                            fatigue: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Enable Player Fatigue & Gatorade Stamina Drain"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-check-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: save.settings.gameplay.paintThreeSecViolation,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('gameplay', {
                                                            paintThreeSecViolation: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Enforce 3-Second Offensive Paint Violation"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-check-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: save.settings.gameplay.blacktopWinByTwo,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('gameplay', {
                                                            blacktopWinByTwo: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Blacktop Win-By-2 Rule"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-check-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: save.settings.gameplay.blacktopMakeItTakeIt,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('gameplay', {
                                                            blacktopMakeItTakeIt: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Blacktop Make-It-Take-It Possession"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                settingsTab === 'CONTROLLER' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-form-grid",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Pro Stick Function"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    className: "h2k-select",
                                                    value: save.settings.controller.proStickMode,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('controller', {
                                                            proStickMode: e.target.value
                                                        });
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "RHYTHM_2K26",
                                                            children: "2K26 ProPLAY Rhythm Shooting"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "ISOMOTION_2K14",
                                                            children: "2K14 Pro Stick IsoMotion"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "DEFAULT",
                                                            children: "Balanced Default"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Shot Meter Style (All 5 Authentic Styles)"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    className: "h2k-select",
                                                    value: save.settings.controller.shotMeterStyle,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('controller', {
                                                            shotMeterStyle: e.target.value
                                                        });
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "2K26_ARROW",
                                                            children: "2K26 Curved Arrow (Beside Shooter \xb7 Default)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "2K14_FLOOR_RING",
                                                            children: "2K14 Classic Floor Ring (Under Feet)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "COMET",
                                                            children: "Comet Sweeping Arc"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "VERTICAL_BAR",
                                                            children: "Vertical Side Bar"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "MINIMAL",
                                                            children: "Minimal Competitive Micro-Bar"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Virtual Dual-Stick Touch Controls"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    className: "h2k-select",
                                                    value: save.settings.controller.showVirtualTouchControls,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('controller', {
                                                            showVirtualTouchControls: e.target.value
                                                        });
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "AUTO",
                                                            children: "Auto on Touchscreens + HUD Toggle"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "ALWAYS",
                                                            children: "Always Show (Desktop + Mobile)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "OFF",
                                                            children: "Hidden (Keyboard / Gamepad Only)"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    children: [
                                                        "Defensive Assist (",
                                                        save.settings.controller.defensiveAssist,
                                                        "%)"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "range",
                                                    min: 0,
                                                    max: 100,
                                                    value: save.settings.controller.defensiveAssist,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('controller', {
                                                            defensiveAssist: Number(e.target.value)
                                                        });
                                                    }
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-check-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: save.settings.controller.shotMeterEnabled,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('controller', {
                                                            shotMeterEnabled: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Show On-Court Shot Meter (+15% Green Window Boost when OFF)"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                settingsTab === 'CAMERA' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-form-grid",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Camera Angle (All 7 Authentic 2K Angles)"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    className: "h2k-select",
                                                    value: save.settings.camera.angle,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('camera', {
                                                            angle: e.target.value
                                                        });
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "2K",
                                                            children: "2K Camera (Behind Offense \xb7 Vertical)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "2K_LOW",
                                                            children: "2K Low (Court-Level Behind Ball)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "BROADCAST",
                                                            children: "Broadcast TV (Sideline Pan)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "DRIVE",
                                                            children: "Drive Cam (Tight Action Behind Handler)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "PLAYER_LOCK",
                                                            children: "Player Lock (Follows Controlled Star)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "HIGH",
                                                            children: "High Tactical (Wide Coach PlayVision)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "NOSEBLEEDS",
                                                            children: "Nosebleeds (Full Arena & Jumbotron)"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    children: [
                                                        "Camera Zoom (",
                                                        save.settings.camera.zoom,
                                                        "/10)"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "range",
                                                    min: 1,
                                                    max: 10,
                                                    value: save.settings.camera.zoom,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('camera', {
                                                            zoom: Number(e.target.value)
                                                        });
                                                    }
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    children: [
                                                        "Camera Height (",
                                                        save.settings.camera.height,
                                                        "/10)"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "range",
                                                    min: 1,
                                                    max: 10,
                                                    value: save.settings.camera.height,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('camera', {
                                                            height: Number(e.target.value)
                                                        });
                                                    }
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-check-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: save.settings.camera.autoFlip,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('camera', {
                                                            autoFlip: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Auto-Flip 180\xb0 Camera on Possession Change"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-check-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: save.settings.camera.keyZoom,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('camera', {
                                                            keyZoom: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Key Zoom (Tighten FOV Inside the Painted Lane)"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-check-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: save.settings.camera.reverseAngle,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('camera', {
                                                            reverseAngle: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Reverse Camera Angle"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-check-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: save.settings.camera.dunkCameraShake,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('camera', {
                                                            dunkCameraShake: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Contact Dunk Camera Shake Impulse"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                settingsTab === 'AUDIO' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-form-grid",
                                    children: [
                                        [
                                            [
                                                'masterVolume',
                                                'Master Volume'
                                            ],
                                            [
                                                'musicVolume',
                                                '2K Beats Music'
                                            ],
                                            [
                                                'sfxVolume',
                                                'On-Court & UI SFX'
                                            ],
                                            [
                                                'crowdVolume',
                                                'Arena Crowd'
                                            ],
                                            [
                                                'commentaryVolume',
                                                'PA Announcer Voice'
                                            ]
                                        ].map(function(param) {
                                            var key = param[0], label = param[1];
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                className: "h2k-form-row",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        children: [
                                                            label,
                                                            " (",
                                                            save.settings.audio[key],
                                                            "%)"
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                        type: "range",
                                                        min: 0,
                                                        max: 100,
                                                        value: save.settings.audio[key],
                                                        onChange: function onChange(e) {
                                                            var _obj;
                                                            return syncAudioToEngine(_extends({}, save.settings.audio, (_obj = {}, _obj[key] = Number(e.target.value), _obj)));
                                                        }
                                                    })
                                                ]
                                            }, key);
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-check-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: save.settings.audio.paAnnouncerEnabled,
                                                    onChange: function onChange(e) {
                                                        return syncAudioToEngine(_extends({}, save.settings.audio, {
                                                            paAnnouncerEnabled: e.target.checked
                                                        }));
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Enable Procedural Web Speech PA Announcer"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-sfx-pad",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "LIVE PROCEDURAL SFX TEST PAD:"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-sfx-btn-row",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            type: "button",
                                                            className: "h2k-mini-pill",
                                                            onClick: function onClick() {
                                                                return _audioEngine.HybridAudioEngine.playDribble();
                                                            },
                                                            children: "Dribble"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            type: "button",
                                                            className: "h2k-mini-pill",
                                                            onClick: function onClick() {
                                                                return _audioEngine.HybridAudioEngine.playSneakerSqueak();
                                                            },
                                                            children: "Squeak"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            type: "button",
                                                            className: "h2k-mini-pill",
                                                            onClick: function onClick() {
                                                                return _audioEngine.HybridAudioEngine.playSwish(false);
                                                            },
                                                            children: "Swish"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            type: "button",
                                                            className: "h2k-mini-pill",
                                                            onClick: function onClick() {
                                                                return _audioEngine.HybridAudioEngine.playGreenRelease();
                                                            },
                                                            children: "Green Light"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            type: "button",
                                                            className: "h2k-mini-pill",
                                                            onClick: function onClick() {
                                                                return _audioEngine.HybridAudioEngine.playDunkSlam();
                                                            },
                                                            children: "Dunk Slam"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            type: "button",
                                                            className: "h2k-mini-pill",
                                                            onClick: function onClick() {
                                                                return _audioEngine.HybridAudioEngine.playBuzzer();
                                                            },
                                                            children: "Buzzer"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            type: "button",
                                                            className: "h2k-mini-pill accent",
                                                            onClick: function onClick() {
                                                                _audioEngine.HybridAudioEngine.playCrowdRoar(0.95);
                                                                _audioEngine.HybridAudioEngine.announce('From downtown! Green light!');
                                                            },
                                                            children: "PA Call + Crowd"
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                settingsTab === 'VISUAL' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-form-grid",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Active UI Era Theme"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    className: "h2k-select",
                                                    value: save.uiEraMode,
                                                    onChange: function onChange(e) {
                                                        var next = e.target.value;
                                                        _store.UltimateHybridStore.setEraMode(next);
                                                        _audioEngine.HybridAudioEngine.playUi('switch', next);
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "HYBRID_PRO",
                                                            children: "Hybrid Pro (2K14 + 2K26 Blend)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "2K14_CLASSIC",
                                                            children: "NBA 2K14 Classic Metallic"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "2K26_NEXTGEN",
                                                            children: "NBA 2K26 Next-Gen Obsidian"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "In-Game Scoreboard Style"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    className: "h2k-select",
                                                    value: save.settings.visual.scoreboardEra,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('visual', {
                                                            scoreboardEra: e.target.value
                                                        });
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "AUTO",
                                                            children: "Auto Match Active Era"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "2K14_METALLIC",
                                                            children: "2K14 Broadcast Metallic (Bottom-Right)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "2K26_OBSIDIAN",
                                                            children: "2K26 Next-Gen Obsidian Bar"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "2K26 Scorebug Anchor Position"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    className: "h2k-select",
                                                    value: save.settings.visual.scorebugPosition2K26,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('visual', {
                                                            scorebugPosition2K26: e.target.value
                                                        });
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "BOTTOM_LEFT",
                                                            children: "Bottom-Left (Classic Next-Gen)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "TOP_CENTER",
                                                            children: "Top-Center Broadcast Pill"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "PlayVision 3D Floor Art Default"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    className: "h2k-select",
                                                    value: save.settings.visual.playVision,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('visual', {
                                                            playVision: e.target.value
                                                        });
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "OFF",
                                                            children: "Off"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "PICK_AND_ROLL",
                                                            children: "Pick & Roll (Screen & Dive)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "FIVE_OUT",
                                                            children: "5-Out Spacing"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "MOTION_CUT",
                                                            children: "Motion Cut (Backdoor & Wing Cuts)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "HORNS",
                                                            children: "Horns High Post"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "FLOPPY",
                                                            children: "Floppy Shooter Curl"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Hot / Cold Floor Heatmap Overlay"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    className: "h2k-select",
                                                    value: save.settings.visual.hotColdZones,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('visual', {
                                                            hotColdZones: e.target.value
                                                        });
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "OFF",
                                                            children: "Off"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "BALL_HANDLER",
                                                            children: "Active Ball-Handler"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "ALL",
                                                            children: "All On-Court Players"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-check-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: save.settings.visual.hardwoodReflections,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('visual', {
                                                            hardwoodReflections: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "2K14 Glossy Hardwood Specular Reflections"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-check-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: save.settings.visual.showFpsTelemetry,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('visual', {
                                                            showFpsTelemetry: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Display Live FPS Telemetry Bar"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-check-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: save.settings.visual.showShotFeedback,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('visual', {
                                                            showShotFeedback: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Show Shot Timing & Contest Feedback"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                settingsTab === 'COACH' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-form-grid",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-check-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: save.settings.coach.aceAdaptiveCoaching,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('coach', {
                                                            aceAdaptiveCoaching: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "ACE Adaptive Coaching Engine"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    children: [
                                                        "User Shot Success Slider (",
                                                        save.settings.coach.userShotSlider,
                                                        ")"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "range",
                                                    min: 20,
                                                    max: 90,
                                                    value: save.settings.coach.userShotSlider,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('coach', {
                                                            userShotSlider: Number(e.target.value)
                                                        });
                                                    }
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    children: [
                                                        "CPU Defense Intensity (",
                                                        save.settings.coach.cpuDefenseSlider,
                                                        ")"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "range",
                                                    min: 20,
                                                    max: 90,
                                                    value: save.settings.coach.cpuDefenseSlider,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('coach', {
                                                            cpuDefenseSlider: Number(e.target.value)
                                                        });
                                                    }
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "h2k-form-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    children: [
                                                        "Dunk & Contact Frequency (",
                                                        save.settings.coach.dunkFrequencySlider,
                                                        ")"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "range",
                                                    min: 20,
                                                    max: 95,
                                                    value: save.settings.coach.dunkFrequencySlider,
                                                    onChange: function onChange(e) {
                                                        return _store.UltimateHybridStore.updateSettings('coach', {
                                                            dunkFrequencySlider: Number(e.target.value)
                                                        });
                                                    }
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                settingsTab === 'DATA' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-form-grid",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-data-actions",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "h2k-btn-accent",
                                                    onClick: function onClick() {
                                                        var _navigator_clipboard;
                                                        var out = _store.UltimateHybridStore.exportSaveJson();
                                                        setJsonBox(out);
                                                        if ((_navigator_clipboard = navigator.clipboard) == null ? void 0 : _navigator_clipboard.writeText) {
                                                            navigator.clipboard.writeText(out).catch(function() {});
                                                        }
                                                        onNotify('Save JSON exported to box & clipboard!');
                                                    },
                                                    children: "EXPORT SAVE JSON"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "h2k-btn-ghost",
                                                    onClick: function onClick() {
                                                        var res = _store.UltimateHybridStore.importSaveJson(jsonBox);
                                                        if (res.ok) {
                                                            onNotify('Save JSON imported successfully!');
                                                        } else {
                                                            var _res_error;
                                                            onNotify((_res_error = res.error) != null ? _res_error : 'Import failed.');
                                                        }
                                                    },
                                                    children: "IMPORT JSON FROM BOX"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "h2k-btn-danger",
                                                    onClick: function onClick() {
                                                        _store.UltimateHybridStore.resetSave();
                                                        setJsonBox('');
                                                        onNotify('Ultimate Hybrid profile reset to factory defaults.');
                                                    },
                                                    children: "RESET SAVE"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("textarea", {
                                            className: "h2k-json-textarea",
                                            rows: 8,
                                            placeholder: "Click EXPORT SAVE JSON to inspect your backup, or paste a saved JSON string and click IMPORT...",
                                            value: jsonBox,
                                            onChange: function onChange(e) {
                                                return setJsonBox(e.target.value);
                                            }
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                drawer === 'PROFILE_VIP' && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                            className: "h2k-modal-head",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-kicker",
                                            children: "2K14 VIP + 2K26 PLAYER CARD"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                            children: [
                                                save.profile.gamertag,
                                                " \xb7 CAREER PROFILE & SHOT CHART"
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "h2k-close-btn",
                                    onClick: onClose,
                                    children: "✕"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "h2k-modal-body h2k-vip-grid",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-vip-col",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-tag-edit-row",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    className: "h2k-input",
                                                    value: tagDraft,
                                                    maxLength: 18,
                                                    onChange: function onChange(e) {
                                                        return setTagDraft(e.target.value);
                                                    },
                                                    "aria-label": "Gamertag"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "h2k-btn-accent",
                                                    onClick: function onClick() {
                                                        _store.UltimateHybridStore.updateProfile({
                                                            gamertag: tagDraft.trim() || 'KING_2K26'
                                                        });
                                                        onNotify('VIP Gamertag saved!');
                                                    },
                                                    children: "SAVE TAG"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-stat-tiles",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-stat-tile",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            children: "RECORD"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                            children: [
                                                                save.profile.wins,
                                                                "W - ",
                                                                save.profile.losses,
                                                                "L"
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-stat-tile",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            children: "GEO RANK"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                            children: save.profile.geoRank || '#14 Local · Top 2%'
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-stat-tile",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            children: "WIN STREAK"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                            children: [
                                                                "\uD83D\uDD25 ",
                                                                (_save_profile_winStreak = save.profile.winStreak) != null ? _save_profile_winStreak : 5,
                                                                " (Best ",
                                                                (_save_profile_bestWinStreak = save.profile.bestWinStreak) != null ? _save_profile_bestWinStreak : 11,
                                                                ")"
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-stat-tile",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            children: "CAREER PTS"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                            children: save.profile.careerPoints
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-stat-tile",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            children: "GREENS"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                            children: save.profile.careerGreens
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-stat-tile",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            children: "3PM"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                            children: save.profile.careerThreesMade
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-mastery-box",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-mastery-row",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            children: "NBA 2K14 Classic Mastery"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                            children: [
                                                                save.profile.eraMastery2K14,
                                                                "%"
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h2k-rating-track",
                                                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "h2k-rating-fill",
                                                        style: {
                                                            width: "" + save.profile.eraMastery2K14 + "%",
                                                            backgroundColor: '#e11d48'
                                                        }
                                                    })
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-mastery-row",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            children: "NBA 2K26 Next-Gen Mastery"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                            children: [
                                                                save.profile.eraMastery2K26,
                                                                "%"
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h2k-rating-track",
                                                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "h2k-rating-fill",
                                                        style: {
                                                            width: "" + save.profile.eraMastery2K26 + "%",
                                                            backgroundColor: '#f59e0b'
                                                        }
                                                    })
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-vip-col",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-kicker",
                                            children: [
                                                "CAREER SHOT CHART (",
                                                save.profile.shotChartHistory.length,
                                                " SHOTS)"
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
                                            viewBox: "0 0 260 220",
                                            className: "h2k-shotchart-svg",
                                            role: "img",
                                            "aria-label": "Career Shot Chart",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                                                    x: "4",
                                                    y: "4",
                                                    width: "252",
                                                    height: "212",
                                                    rx: "8",
                                                    fill: "#0f172a",
                                                    stroke: "#334155",
                                                    strokeWidth: "2"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                                                    x: "86",
                                                    y: "4",
                                                    width: "88",
                                                    height: "92",
                                                    fill: "rgba(225,29,72,0.18)",
                                                    stroke: "#64748b",
                                                    strokeWidth: "1.5"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                                                    cx: "130",
                                                    cy: "96",
                                                    r: "28",
                                                    fill: "none",
                                                    stroke: "#64748b",
                                                    strokeWidth: "1.5"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                                                    d: "M 24 4 V 66 A 106 106 0 0 0 236 66 V 4",
                                                    fill: "none",
                                                    stroke: "#f59e0b",
                                                    strokeWidth: "2"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                                                    cx: "130",
                                                    cy: "24",
                                                    r: "6",
                                                    fill: "none",
                                                    stroke: "#f97316",
                                                    strokeWidth: "2.5"
                                                }),
                                                save.profile.shotChartHistory.map(function(s) {
                                                    var cx = 130 + s.x * 4.4;
                                                    var cy = 22 + s.y * 4.4;
                                                    return s.made ? /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                                                        cx: cx,
                                                        cy: cy,
                                                        r: "5.5",
                                                        fill: "#22c55e",
                                                        fillOpacity: "0.88",
                                                        stroke: "#052e16",
                                                        strokeWidth: "1.2"
                                                    }, s.id) : /*#__PURE__*/ (0, _jsxruntime.jsxs)("g", {
                                                        stroke: "#f43f5e",
                                                        strokeWidth: "2",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("line", {
                                                                x1: cx - 4,
                                                                y1: cy - 4,
                                                                x2: cx + 4,
                                                                y2: cy + 4
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("line", {
                                                                x1: cx + 4,
                                                                y1: cy - 4,
                                                                x2: cx - 4,
                                                                y2: cy + 4
                                                            })
                                                        ]
                                                    }, s.id);
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-shotchart-legend",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "● Green = Made"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "✕ Red = Missed"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "h2k-mini-pill",
                                                    onClick: function onClick() {
                                                        var made = Math.random() > 0.3;
                                                        _store.UltimateHybridStore.recordShotChart({
                                                            x: Math.round((Math.random() - 0.5) * 42),
                                                            y: Math.round(4 + Math.random() * 24),
                                                            made: made,
                                                            isThree: Math.random() > 0.45,
                                                            era: era
                                                        });
                                                        if (made) _audioEngine.HybridAudioEngine.playGreenRelease();
                                                        else _audioEngine.HybridAudioEngine.playRimClank();
                                                    },
                                                    children: "+ SIM PRACTICE SHOT"
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                drawer === 'BEATS_JUKEBOX' && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                            className: "h2k-modal-head",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-kicker",
                                            children: "100% PROCEDURAL WEB AUDIO SYNTH SOUNDTRACK"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                            children: "2K BEATS JUKEBOX (2K14 + 2K26)"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "h2k-close-btn",
                                    onClick: onClose,
                                    children: "✕"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "h2k-modal-body",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-beats-now",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-kicker",
                                                    children: [
                                                        "NOW ",
                                                        beats.isPlaying ? 'SPINNING' : 'PAUSED'
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("h4", {
                                                    children: beats.currentTrack.title
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    children: [
                                                        beats.currentTrack.artist,
                                                        " \xb7 ",
                                                        beats.currentTrack.bpm,
                                                        " BPM \xb7 ",
                                                        beats.currentTrack.eraTag
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-beats-controls",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "h2k-btn-ghost",
                                                    onClick: function onClick() {
                                                        return _audioEngine.HybridAudioEngine.prevTrack();
                                                    },
                                                    children: "⏮"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "h2k-btn-accent",
                                                    onClick: function onClick() {
                                                        return _audioEngine.HybridAudioEngine.togglePlay();
                                                    },
                                                    children: beats.isPlaying ? '⏸ PAUSE' : '▶ PLAY'
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "h2k-btn-ghost",
                                                    onClick: function onClick() {
                                                        return _audioEngine.HybridAudioEngine.nextTrack();
                                                    },
                                                    children: "⏭"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    type: "button",
                                                    className: "h2k-btn-ghost " + (beats.shuffle ? 'active' : ''),
                                                    onClick: function onClick() {
                                                        var sh = _audioEngine.HybridAudioEngine.toggleShuffle();
                                                        _store.UltimateHybridStore.updateSettings('audio', {
                                                            beatsShuffle: sh
                                                        });
                                                    },
                                                    children: [
                                                        "\uD83D\uDD00 ",
                                                        beats.shuffle ? 'SHUFFLE ON' : 'SHUFFLE'
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "h2k-track-list",
                                    children: _audioEngine.HYBRID_2K_BEATS_TRACKS.map(function(tr) {
                                        var isCurrent = beats.currentTrack.id === tr.id;
                                        var enabled = beats.enabledTrackIds.includes(tr.id);
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-track-row " + (isCurrent ? 'active' : ''),
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "h2k-track-play",
                                                    onClick: function onClick() {
                                                        return _audioEngine.HybridAudioEngine.selectTrack(tr.id, true);
                                                    },
                                                    children: isCurrent && beats.isPlaying ? '❚❚' : '▶'
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-track-meta",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                            children: tr.title
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            children: [
                                                                tr.artist,
                                                                " \xb7 ",
                                                                tr.bpm,
                                                                " BPM \xb7 ",
                                                                tr.durationLabel
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "h2k-era-chip",
                                                    children: tr.eraTag
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                    className: "h2k-track-toggle",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                            type: "checkbox",
                                                            checked: enabled,
                                                            onChange: function onChange() {
                                                                var nextIds = _audioEngine.HybridAudioEngine.toggleTrackEnabled(tr.id);
                                                                _store.UltimateHybridStore.updateSettings('audio', {
                                                                    enabledTrackIds: nextIds
                                                                });
                                                            }
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            children: "In Mix"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }, tr.id);
                                    })
                                })
                            ]
                        })
                    ]
                }),
                drawer === 'SWAP_BUILD' && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                            className: "h2k-modal-head",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-kicker",
                                            children: "MyPLAYER 5 PERSISTENT BUILD SLOTS"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                            children: "⚡ SWAP ACTIVE BUILD"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "h2k-close-btn",
                                    onClick: onClose,
                                    children: "✕"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "h2k-modal-body",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "h2k-track-list",
                                    children: modes.buildSlots.map(function(slot, idx) {
                                        var isActive = idx === modes.activeBuildSlotIndex;
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-track-row " + (isActive ? 'active' : ''),
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-track-meta",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                            children: [
                                                                "Slot #",
                                                                idx + 1,
                                                                ": ",
                                                                slot.name,
                                                                " (",
                                                                slot.position,
                                                                ")"
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            children: [
                                                                slot.ovr,
                                                                " OVR \xb7 ",
                                                                slot.archetypeName,
                                                                " \xb7 ",
                                                                slot.primaryTakeover.replace('_', ' ')
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: isActive ? 'h2k-btn-ghost' : 'h2k-btn-accent',
                                                    onClick: function onClick() {
                                                        _modesStore.ModesStore.setActiveBuildSlot(idx);
                                                        _audioEngine.HybridAudioEngine.playUi('confirm', era);
                                                        onNotify("Active MyPLAYER switched to " + slot.name + " (" + slot.ovr + " OVR)!");
                                                    },
                                                    children: isActive ? 'ACTIVE ✓' : 'EQUIP BUILD'
                                                })
                                            ]
                                        }, slot.id);
                                    })
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-modal-foot-actions",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            className: "h2k-btn-accent",
                                            onClick: function onClick() {
                                                onClose();
                                                _store.UltimateHybridStore.setActiveScreen('CITY_EXPLORE');
                                            },
                                            children: "\uD83C\uDFD9️ ENTER THE CITY (2.5D MAP + 3D PLAZA)"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            className: "h2k-btn-ghost",
                                            onClick: function onClick() {
                                                onClose();
                                                _store.UltimateHybridStore.setActiveScreen('MYPLAYER_BUILDER');
                                            },
                                            children: "\uD83E\uDDEC OPEN MyPLAYER BUILDER (5 SLOTS)"
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                drawer === 'CREW' && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                            className: "h2k-modal-head",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-kicker",
                                            children: "2K26 NEXT-GEN SQUAD AFFILIATION"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                            children: [
                                                "[",
                                                modes.crew.tag,
                                                "] ",
                                                modes.crew.name,
                                                " \xb7 LV.",
                                                modes.crew.level,
                                                " / 30"
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "h2k-close-btn",
                                    onClick: onClose,
                                    children: "✕"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "h2k-modal-body",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-stat-tiles",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-stat-tile",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "ACTIVE REP TIER"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                    children: save.currencies.repTier
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-stat-tile",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "CREW ROSTER"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                    children: [
                                                        modes.crew.members.length,
                                                        " MEMBERS"
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-stat-tile",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "PRO-AM RECORD"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                    children: [
                                                        modes.crew.proAmRecord.wins,
                                                        "W - ",
                                                        modes.crew.proAmRecord.losses,
                                                        "L"
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-stat-tile",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "ACTIVE BUILD"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                    children: ((_modes_buildSlots_modes_activeBuildSlotIndex = modes.buildSlots[modes.activeBuildSlotIndex]) != null ? _modes_buildSlots_modes_activeBuildSlotIndex : modes.buildSlots[0]).name
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "h2k-modal-foot-actions",
                                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "h2k-btn-accent",
                                        onClick: function onClick() {
                                            onClose();
                                            _store.UltimateHybridStore.setActiveScreen('CITY_EXPLORE');
                                        },
                                        children: "\uD83C\uDFD9️ DEPLOY TO THE CITY & CREWS HQ"
                                    })
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    });
};
var MODE_META = {
    MYCAREER_HUB: {
        kicker: '2K26 NEXT-GEN + 2K14 ROOKIE STORY',
        title: 'MyCAREER & THE CITY HUB',
        subtitle: 'Step into the walkable 3D City, hit Sunset Park & The REC, upgrade attributes, or enter the MyPLAYER Builder.',
        highlights: [
            'Walkable 3D City with Skateboard, Fast-Travel Map & Live Arena Rings',
            '40 Canonical Badges + Build-By-Badges Solver & Custom Jump Shot Studio',
            '6-Ladder Progression: OVR, REP, Crew Lv.30, Skill Plate, Specialization & Season'
        ],
        ctaLabel: 'ENTER WALKABLE 3D CITY',
        action: 'city'
    },
    PATH_TO_GREATNESS: {
        kicker: 'NBA 2K14 SIGNATURE CAMPAIGN',
        title: 'LeBRON: PATH TO GREATNESS',
        subtitle: 'Relive the iconic 2013-14 branching dynasty — Heat Dynasty vs Fantastic Journey — straight onto the 3D hardwood.',
        highlights: [
            'Miami Heat (#6 LeBron, Wade, Bosh, Ray Allen) ready in 2013-14 Pool',
            'Authentic 2K14 Finals Arena Spotlight presentation & Signature Skills',
            'Part 5 expands full branching narrative chapters & clutch moments'
        ],
        ctaLabel: 'LAUNCH 2K14 HEAT SHOWCASE MATCHUP',
        action: 'playnow'
    },
    MYTEAM_HUB: {
        kicker: 'CARD COLLECTING & TRIPLE THREAT',
        title: 'MyTEAM ULTIMATE HYBRID',
        subtitle: 'Build cross-era lineups blending 2013-14 Legends, 2025-26 Superstars, and WNBA Icons with MTP rewards.',
        highlights: [
            'Shared MTP Wallet synced across Main Menu challenges and matches',
            'Cross-Era Fantasy Matchups playable immediately in Play Now Setup',
            'Classic 2K26 Pack Market & Lineup Locker available via Creator Studio'
        ],
        ctaLabel: 'OPEN MyTEAM LOCKER & STUDIO',
        action: 'studio'
    },
    MYNBA_HUB: {
        kicker: 'THE ASSOCIATION (2K14) + MyNBA ERAS (2K26)',
        title: 'MyNBA ERAS & FRANCHISE',
        subtitle: 'Command franchises across Magic/Bird, Jordan, Kobe, LeBron 2K14, Steph, and Modern 2026 Eras.',
        highlights: [
            'All 30 authentic 2013-14 NBA squads + Modern 2025-26 contenders',
            'ACE Adaptive Coaching & customizable Simulation Sliders in Settings',
            'Jump straight into a Franchise Tip-Off or Classic Era Hub'
        ],
        ctaLabel: 'OPEN MyNBA ERAS HUB',
        action: 'studio'
    },
    BLACKTOP_SETUP: {
        kicker: 'STREETBALL 1v1 · 2v2 · 3v3 · 5v5',
        title: 'BLACKTOP & SKYLINE ROOFTOP',
        subtitle: 'Take 2K14 Legends, EuroLeague stars, or 2K26 superstars to Sunset Park and Skyline Rooftop to 21.',
        highlights: [
            'Instant Blacktop 1v1, 2v2, 3v3, and 5v5 court rules',
            'Chain-net swish audio & Skyline Park golden-hour atmosphere',
            'Configure squads right in Pre-Game Matchup or Classic Blacktop'
        ],
        ctaLabel: 'CONFIGURE ROOFTOP MATCHUP',
        action: 'playnow'
    },
    THE_W_HUB: {
        kicker: 'THE W · WNBA BROADCAST EXPERIENCE',
        title: 'THE W / WNBA ARENA',
        subtitle: 'Compete with Las Vegas Aces, New York Liberty, Indiana Fever, and Minnesota Lynx in dedicated WNBA venues.',
        highlights: [
            "Full WNBA rosters starring A'ja Wilson, Breanna Stewart, Caitlin Clark & Napheesa Collier",
            'Playable standalone or in Cross-Era Exhibition matchups',
            'Dedicated WNBA Arena floor & broadcast presentation'
        ],
        ctaLabel: 'LAUNCH THE W MATCHUP',
        action: 'playnow'
    },
    LEARN_2K: {
        kicker: '2K14 TRAINING CAMP + 2K26 PROPLAY TUTORIALS',
        title: 'LEARN 2K & SHOT LAB',
        subtitle: 'Master ProPLAY Rhythm Shooting, 2K14 IsoMotion dribble chains, on-ball clamps, and pick-and-roll reads.',
        highlights: [
            'Controls: WASD/Arrows Move · Space/Hold Shoot (Release on Green!) · E Pass · Shift Sprint · Q/F Steal/Block',
            'Customize Shot Meter style & Shooting Model in 7-Tab Settings',
            'Jump straight onto MyCOURT or Quick Tip-Off to test your timing'
        ],
        ctaLabel: 'OPEN PRACTICE & CREATOR STUDIO',
        action: 'studio'
    }
};
var ModeHubView = function ModeHubView(param) {
    var screen = param.screen, eraMode = param.eraMode, onBack = param.onBack, onQuickPlaySetup = param.onQuickPlaySetup, onOpenCity3D = param.onOpenCity3D, onOpenClassicStudio = param.onOpenClassicStudio;
    var meta = MODE_META[screen];
    if (!meta) return null;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h2k-mode-hub",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("header", {
                className: "h2k-subscreen-header",
                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "h2k-subscreen-left",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            className: "h2k-btn-ghost",
                            onClick: function onClick() {
                                _audioEngine.HybridAudioEngine.playUi('back', eraMode);
                                onBack();
                            },
                            children: "◀ MAIN MENU"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "h2k-kicker",
                                    children: meta.kicker
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                    children: meta.title
                                })
                            ]
                        })
                    ]
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "h2k-mode-hub-card",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                        className: "h2k-mode-hub-sub",
                        children: meta.subtitle
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("ul", {
                        className: "h2k-mode-hub-list",
                        children: meta.highlights.map(function(h, i) {
                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                children: h
                            }, i);
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "h2k-mode-hub-actions",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-tipoff-cta compact",
                                onClick: function onClick() {
                                    _audioEngine.HybridAudioEngine.playUi('confirm', eraMode);
                                    if (meta.action === 'city') onOpenCity3D();
                                    else if (meta.action === 'studio') onOpenClassicStudio();
                                    else onQuickPlaySetup();
                                },
                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    className: "h2k-tipoff-title",
                                    children: meta.ctaLabel
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-btn-ghost",
                                onClick: function onClick() {
                                    _audioEngine.HybridAudioEngine.playUi('click', eraMode);
                                    onQuickPlaySetup();
                                },
                                children: "PRE-GAME TEAM SELECT"
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
