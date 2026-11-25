(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/components/SettingsAndCustomUi ===
ArcadeMod.define("src/games/legends-arena/mlbb/components/SettingsAndCustomUi", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SettingsAndCustomUiModal", {
    enumerable: true,
    get: function() {
        return SettingsAndCustomUiModal;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _mapData = require("../data/mapData");
var _heroes = require("../data/heroes");
var _items = require("../data/items");
var _emblems = require("../data/emblems");
var _storage = require("../storage");
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
var VOICE_LANGUAGES = [
    'English',
    'Japanese',
    'Indonesian',
    'Tagalog'
];
var REFRESH_RATES = [
    30,
    60,
    90,
    120
];
var GRAPHICS_TIERS = [
    {
        id: 'smooth',
        label: 'Smooth'
    },
    {
        id: 'medium',
        label: 'Medium'
    },
    {
        id: 'high',
        label: 'High'
    },
    {
        id: 'ultra',
        label: 'Ultra'
    }
];
var AI_TIERS = [
    {
        id: 'warrior',
        label: 'Warrior',
        desc: 'Casual bots, relaxed laning'
    },
    {
        id: 'epic',
        label: 'Epic',
        desc: 'Counter-builds, ganks, smart spells'
    },
    {
        id: 'mythic',
        label: 'Mythic',
        desc: 'Pro macro, kiting, tight Retribution'
    }
];
var SettingsAndCustomUiModal = function SettingsAndCustomUiModal(param) {
    var settings = param.settings, _param_inMatch = param.inMatch, inMatch = _param_inMatch === void 0 ? false : _param_inMatch, _param_surrenderAvailable = param.surrenderAvailable, surrenderAvailable = _param_surrenderAvailable === void 0 ? false : _param_surrenderAvailable, onUpdateSettings = param.onUpdateSettings, onSurrender = param.onSurrender, onExitMatch = param.onExitMatch, onClose = param.onClose;
    var _useState = (0, _react.useState)('basics'), tab = _useState[0], setTab = _useState[1];
    var _useState1 = (0, _react.useState)(false), editingCustomUi = _useState1[0], setEditingCustomUi = _useState1[1];
    var _useState2 = (0, _react.useState)(false), diagRunning = _useState2[0], setDiagRunning = _useState2[1];
    var _useState3 = (0, _react.useState)(null), diagResult = _useState3[0], setDiagResult = _useState3[1];
    var _useState4 = (0, _react.useState)(null), resourceCheck = _useState4[0], setResourceCheck = _useState4[1];
    if (editingCustomUi) {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(CustomUiEditorOverlay, {
            settings: settings,
            onSave: function onSave(next) {
                onUpdateSettings(next);
                setEditingCustomUi(false);
            },
            onClose: function onClose() {
                return setEditingCustomUi(false);
            }
        });
    }
    var updateBasics = function updateBasics(patch) {
        return onUpdateSettings(_extends({}, settings, {
            basics: _extends({}, settings.basics, patch)
        }));
    };
    var updateControls = function updateControls(patch) {
        return onUpdateSettings(_extends({}, settings, {
            controls: _extends({}, settings.controls, patch)
        }));
    };
    var updateInterface = function updateInterface(patch) {
        return onUpdateSettings(_extends({}, settings, {
            interface: _extends({}, settings.interface, patch)
        }));
    };
    var updateSound = function updateSound(patch) {
        var next = _extends({}, settings, {
            sound: _extends({}, settings.sound, patch)
        });
        _AudioEngine.mlbbAudio.setVolumes(next.sound);
        onUpdateSettings(next);
    };
    var updateNetwork = function updateNetwork(patch) {
        return onUpdateSettings(_extends({}, settings, {
            network: _extends({}, settings.network, patch)
        }));
    };
    var updatePrivacy = function updatePrivacy(patch) {
        return onUpdateSettings(_extends({}, settings, {
            privacy: _extends({}, settings.privacy, patch)
        }));
    };
    var updateResources = function updateResources(patch) {
        return onUpdateSettings(_extends({}, settings, {
            resources: _extends({}, settings.resources, patch)
        }));
    };
    var runLiveFrameDiagnostic = function runLiveFrameDiagnostic() {
        if (diagRunning) return;
        _AudioEngine.mlbbAudio.playClick();
        setDiagRunning(true);
        setDiagResult('Sampling live frame pacing...');
        var samples = [];
        var last = performance.now();
        var step = function step1(now) {
            samples.push(now - last);
            last = now;
            if (samples.length < 24) {
                requestAnimationFrame(step);
            } else {
                var trimmed = samples.slice(2);
                var avgMs = trimmed.reduce(function(a, b) {
                    return a + b;
                }, 0) / Math.max(1, trimmed.length);
                var fps = Math.max(15, Math.min(240, Math.round(1000 / Math.max(1, avgMs))));
                var simPing = settings.network.speedMode ? settings.network.networkBoost ? 12 : 16 : 26;
                setDiagResult("Measured " + fps + " FPS (" + avgMs.toFixed(1) + "ms frame) \xb7 Simulated Ping " + simPing + "ms \xb7 0% Loss");
                setDiagRunning(false);
            }
        };
        requestAnimationFrame(step);
    };
    var runResourceIntegrityCheck = function runResourceIntegrityCheck() {
        _AudioEngine.mlbbAudio.playClick();
        setResourceCheck("Verified: " + _heroes.MLBB_ALL_HEROES.length + " Heroes \xb7 " + _items.MLBB_ITEMS.length + " Equipment Items \xb7 " + _emblems.MLBB_EMBLEMS.length + " Lv.60 Emblems \xb7 " + _emblems.MLBB_TALENTS.length + " Talents \xb7 " + _emblems.MLBB_BATTLE_SPELLS.length + " Battle Spells \xb7 5 Map Themes");
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-3",
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "w-full max-w-4xl max-h-[88vh] rounded-2xl bg-[#0B132B] border-2 border-[#F5C451]/60 flex flex-col overflow-hidden text-slate-100 shadow-2xl",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex items-center justify-between px-5 py-3 bg-[#101C3D] border-b border-[#F5C451]/30",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "text-base font-black text-[#F5C451] uppercase tracking-wide",
                            children: "Settings"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex items-center gap-2",
                            children: [
                                inMatch && onSurrender && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    disabled: !surrenderAvailable,
                                    onClick: onSurrender,
                                    className: "px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap cursor-pointer " + (surrenderAvailable ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'),
                                    children: surrenderAvailable ? 'Surrender' : 'Surrender (06:00)'
                                }),
                                inMatch && onExitMatch && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    onClick: onExitMatch,
                                    className: "px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-black whitespace-nowrap cursor-pointer",
                                    children: "Return to Lobby"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    onClick: onClose,
                                    className: "w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-white font-black cursor-pointer",
                                    "aria-label": "Close Settings",
                                    children: "✕"
                                })
                            ]
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex flex-1 min-h-0",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "w-40 bg-[#080F24] border-r border-slate-800 p-2 space-y-1 overflow-y-auto shrink-0",
                            children: [
                                [
                                    'basics',
                                    'Basics'
                                ],
                                [
                                    'controls',
                                    'Controls'
                                ],
                                [
                                    'interface',
                                    'Interface & UI'
                                ],
                                [
                                    'sound',
                                    'Sound'
                                ],
                                [
                                    'network',
                                    'Network'
                                ],
                                [
                                    'privacy',
                                    'Privacy'
                                ],
                                [
                                    'resources',
                                    'Resources'
                                ]
                            ].map(function(param) {
                                var id = param[0], label = param[1];
                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    onClick: function onClick() {
                                        _AudioEngine.mlbbAudio.playClick();
                                        setTab(id);
                                    },
                                    className: "w-full px-3 py-2.5 rounded-xl text-left text-xs font-black whitespace-nowrap cursor-pointer transition-colors " + (tab === id ? 'bg-[#F5C451] text-slate-950' : 'text-slate-300 hover:bg-slate-800/80'),
                                    children: label
                                }, id);
                            })
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex-1 p-4 overflow-y-auto space-y-3 text-xs",
                            children: [
                                tab === 'basics' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid grid-cols-2 gap-2.5",
                                            children: [
                                                [
                                                    'outline',
                                                    'Hero Outline'
                                                ],
                                                [
                                                    'screenShake',
                                                    'Screen Shake'
                                                ],
                                                [
                                                    'shadows',
                                                    'Battlefield Shadows'
                                                ],
                                                [
                                                    'creepHpNumbers',
                                                    'Creep HP Numbers'
                                                ],
                                                [
                                                    'damageText',
                                                    'Floating Damage Text'
                                                ],
                                                [
                                                    'hdMode',
                                                    'HD Mode'
                                                ]
                                            ].map(function(param) {
                                                var key = param[0], label = param[1];
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                    className: "p-2.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between cursor-pointer",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "font-bold",
                                                            children: label
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                            type: "checkbox",
                                                            checked: settings.basics[key],
                                                            onChange: function onChange(e) {
                                                                var _obj;
                                                                return updateBasics((_obj = {}, _obj[key] = e.target.checked, _obj));
                                                            },
                                                            className: "accent-[#F5C451] w-4 h-4"
                                                        })
                                                    ]
                                                }, key);
                                            })
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "grid grid-cols-2 gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-bold text-slate-300 mb-1.5",
                                                            children: "Refresh Rate Target"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "grid grid-cols-4 gap-1",
                                                            children: REFRESH_RATES.map(function(hz) {
                                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                                    onClick: function onClick() {
                                                                        _AudioEngine.mlbbAudio.playClick();
                                                                        updateBasics({
                                                                            refreshRate: hz
                                                                        });
                                                                    },
                                                                    className: "py-1.5 rounded-lg font-black mlbb-num cursor-pointer " + (settings.basics.refreshRate === hz ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'),
                                                                    children: [
                                                                        hz,
                                                                        "Hz"
                                                                    ]
                                                                }, hz);
                                                            })
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-bold text-slate-300 mb-1.5",
                                                            children: "Graphics Quality"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "grid grid-cols-4 gap-1",
                                                            children: GRAPHICS_TIERS.map(function(g) {
                                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                    onClick: function onClick() {
                                                                        _AudioEngine.mlbbAudio.playClick();
                                                                        updateBasics({
                                                                            graphicsQuality: g.id
                                                                        });
                                                                    },
                                                                    className: "py-1.5 rounded-lg font-black cursor-pointer " + (settings.basics.graphicsQuality === g.id ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'),
                                                                    children: g.label
                                                                }, g.id);
                                                            })
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "grid grid-cols-2 gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-bold text-slate-300 mb-1.5",
                                                            children: "Camera Height"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "flex gap-1.5",
                                                            children: [
                                                                'low',
                                                                'high'
                                                            ].map(function(h) {
                                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                    onClick: function onClick() {
                                                                        return updateBasics({
                                                                            cameraHeight: h
                                                                        });
                                                                    },
                                                                    className: "flex-1 py-1.5 rounded-lg font-black uppercase cursor-pointer " + (settings.basics.cameraHeight === h ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'),
                                                                    children: h
                                                                }, h);
                                                            })
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-bold text-slate-300 mb-1.5",
                                                            children: "Colorblind Filter"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                            value: settings.basics.colorblind,
                                                            onChange: function onChange(e) {
                                                                return updateBasics({
                                                                    colorblind: e.target.value
                                                                });
                                                            },
                                                            className: "w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                    value: "off",
                                                                    children: "Off"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                    value: "deuteranopia",
                                                                    children: "Deuteranopia"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                    value: "protanopia",
                                                                    children: "Protanopia"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                    value: "tritanopia",
                                                                    children: "Tritanopia"
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "font-bold text-slate-300 mb-1.5",
                                                    children: "Battlefield Map Theme"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "flex flex-wrap gap-1.5",
                                                    children: Object.keys(_mapData.MAP_THEMES).map(function(tid) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            onClick: function onClick() {
                                                                return updateBasics({
                                                                    mapTheme: tid
                                                                });
                                                            },
                                                            className: "px-2.5 py-1.5 rounded-lg font-bold cursor-pointer " + (settings.basics.mapTheme === tid ? 'bg-[#F5C451] text-slate-950 font-black' : 'bg-slate-800 text-slate-200'),
                                                            children: _mapData.MAP_THEMES[tid].name
                                                        }, tid);
                                                    })
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                tab === 'controls' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "grid grid-cols-2 gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-bold text-slate-300 mb-1.5",
                                                            children: "Targeting Method"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "flex gap-1.5",
                                                            children: [
                                                                'standard',
                                                                'advanced'
                                                            ].map(function(m) {
                                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                    onClick: function onClick() {
                                                                        return updateControls({
                                                                            targetingMethod: m
                                                                        });
                                                                    },
                                                                    className: "flex-1 py-1.5 rounded-lg font-black uppercase cursor-pointer " + (settings.controls.targetingMethod === m ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'),
                                                                    children: m
                                                                }, m);
                                                            })
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-bold text-slate-300 mb-1.5",
                                                            children: "Targeting Priority"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                            value: settings.controls.targetingPriority,
                                                            onChange: function onChange(e) {
                                                                return updateControls({
                                                                    targetingPriority: e.target.value
                                                                });
                                                            },
                                                            className: "w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                    value: "lowest_hp",
                                                                    children: "Lowest HP"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                    value: "lowest_pct",
                                                                    children: "Lowest HP %"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                    value: "closest",
                                                                    children: "Closest Target"
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "grid grid-cols-2 gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-bold text-slate-300 mb-1.5",
                                                            children: "Movement Joystick Mode"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "flex gap-1.5",
                                                            children: [
                                                                'fixed',
                                                                'floating'
                                                            ].map(function(pos) {
                                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                    onClick: function onClick() {
                                                                        return updateControls({
                                                                            joystickPosition: pos
                                                                        });
                                                                    },
                                                                    className: "flex-1 py-1.5 rounded-lg font-black uppercase cursor-pointer " + (settings.controls.joystickPosition === pos ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'),
                                                                    children: pos
                                                                }, pos);
                                                            })
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-bold text-slate-300 mb-1.5",
                                                            children: "Skill Cancel Cast Method"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "flex gap-1.5",
                                                            children: [
                                                                [
                                                                    'drag_to_x',
                                                                    'Drag to Red X'
                                                                ],
                                                                [
                                                                    'drag_distance',
                                                                    'Drag Distance'
                                                                ]
                                                            ].map(function(param) {
                                                                var m = param[0], lbl = param[1];
                                                                var _settings_controls_skillCancelMethod;
                                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                    onClick: function onClick() {
                                                                        return updateControls({
                                                                            skillCancelMethod: m
                                                                        });
                                                                    },
                                                                    className: "flex-1 py-1.5 rounded-lg font-black cursor-pointer " + (((_settings_controls_skillCancelMethod = settings.controls.skillCancelMethod) != null ? _settings_controls_skillCancelMethod : 'drag_to_x') === m ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'),
                                                                    children: lbl
                                                                }, m);
                                                            })
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-3 rounded-xl bg-[#101C3D] border border-[#F5C451]/40",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "font-black text-[#F5C451] mb-1.5",
                                                    children: "Smart AI Difficulty Tier"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "grid grid-cols-3 gap-2",
                                                    children: AI_TIERS.map(function(tier) {
                                                        var _settings_controls_aiDifficulty;
                                                        var active = ((_settings_controls_aiDifficulty = settings.controls.aiDifficulty) != null ? _settings_controls_aiDifficulty : 'epic') === tier.id;
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                            onClick: function onClick() {
                                                                _AudioEngine.mlbbAudio.playClick();
                                                                updateControls({
                                                                    aiDifficulty: tier.id
                                                                });
                                                            },
                                                            className: "p-2 rounded-xl border text-left cursor-pointer transition-colors " + (active ? 'bg-[#F5C451] border-amber-200 text-slate-950' : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:border-slate-500'),
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "font-black text-xs",
                                                                    children: tier.label
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-[10px] " + (active ? 'text-slate-900 font-bold' : 'text-slate-400'),
                                                                    children: tier.desc
                                                                })
                                                            ]
                                                        }, tier.id);
                                                    })
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid grid-cols-2 gap-2",
                                            children: [
                                                [
                                                    'heroLockMode',
                                                    'Hero Lock Mode'
                                                ],
                                                [
                                                    'skillSmartTargeting',
                                                    'Skill Smart Targeting'
                                                ],
                                                [
                                                    'basicSmartTargeting',
                                                    'Basic Attack Smart Targeting'
                                                ],
                                                [
                                                    'attackAssist',
                                                    'Attack Assist (Auto-Pursue)'
                                                ],
                                                [
                                                    'aimPanning',
                                                    'Aim Panning (Camera Shift)'
                                                ],
                                                [
                                                    'autoLevelUp',
                                                    'Auto Level-Up Skills'
                                                ],
                                                [
                                                    'autoBuy',
                                                    'Auto-Buy Recommended Items'
                                                ]
                                            ].map(function(param) {
                                                var k = param[0], label = param[1];
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                    className: "p-2.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between cursor-pointer",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "font-bold",
                                                            children: label
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                            type: "checkbox",
                                                            checked: Boolean(settings.controls[k]),
                                                            onChange: function onChange(e) {
                                                                var _obj;
                                                                return updateControls((_obj = {}, _obj[k] = e.target.checked, _obj));
                                                            },
                                                            className: "accent-[#F5C451] w-4 h-4"
                                                        })
                                                    ]
                                                }, k);
                                            })
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    className: "font-bold mlbb-num",
                                                    children: [
                                                        "Camera Pan Sensitivity (",
                                                        settings.controls.cameraPanSensitivity,
                                                        "%)"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "range",
                                                    min: 10,
                                                    max: 100,
                                                    value: settings.controls.cameraPanSensitivity,
                                                    onChange: function onChange(e) {
                                                        return updateControls({
                                                            cameraPanSensitivity: Number(e.target.value)
                                                        });
                                                    },
                                                    className: "w-48 accent-[#F5C451]"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                tab === 'interface' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-3.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "font-black text-white mlbb-num",
                                                            children: [
                                                                "Battlefield UI Opacity (",
                                                                settings.interface.battlefieldUiOpacity,
                                                                "%)"
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[11px] text-slate-400",
                                                            children: "Adjusts transparency of HUD panels and Shop-Anywhere overlay over the live battlefield."
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "range",
                                                    min: 25,
                                                    max: 100,
                                                    value: settings.interface.battlefieldUiOpacity,
                                                    onChange: function onChange(e) {
                                                        return updateInterface({
                                                            battlefieldUiOpacity: Number(e.target.value)
                                                        });
                                                    },
                                                    className: "w-48 accent-[#F5C451]"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-3.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-black text-white",
                                                            children: "Default Skill Layout Preset"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[11px] text-slate-400",
                                                            children: "Switch between standard 3-Skill heroes and 4-Skill heroes (Kagura, Julian, Pharsa, etc.)."
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "flex gap-1.5",
                                                    children: [
                                                        '3skill',
                                                        '4skill'
                                                    ].map(function(preset) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            onClick: function onClick() {
                                                                return updateInterface({
                                                                    activeSkillPreset: preset
                                                                });
                                                            },
                                                            className: "px-3 py-1.5 rounded-lg font-black cursor-pointer " + (settings.interface.activeSkillPreset === preset ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'),
                                                            children: preset === '3skill' ? '3-Skill' : '4-Skill'
                                                        }, preset);
                                                    })
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-4 rounded-xl bg-[#101C3D] border border-[#F5C451]/45 space-y-2.5",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "font-black text-[#F5C451] text-sm",
                                                    children: "Interactive Custom UI Layout Editor"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-slate-300",
                                                    children: "Drag any control on the live Land of Dawn layout stage, enable 4% grid snap, detect overlapping buttons, adjust scale (50%–150%) and opacity (20%–100%), or copy between 3-Skill and 4-Skill layouts."
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    onClick: function onClick() {
                                                        _AudioEngine.mlbbAudio.playClick();
                                                        setEditingCustomUi(true);
                                                    },
                                                    className: "px-5 py-2.5 rounded-xl bg-[#F5C451] hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer",
                                                    children: "Open Interactive Custom UI Editor →"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                tab === 'sound' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "space-y-2.5",
                                    children: [
                                        [
                                            [
                                                'master',
                                                'Master Volume'
                                            ],
                                            [
                                                'sfx',
                                                'Sound Effects (SFX)'
                                            ],
                                            [
                                                'bgm',
                                                'Background Music (BGM)'
                                            ],
                                            [
                                                'voice',
                                                'Hero Voice & Announcer'
                                            ],
                                            [
                                                'mic',
                                                'Team Mic Volume'
                                            ]
                                        ].map(function(param) {
                                            var k = param[0], label = param[1];
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p-2.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "font-bold mlbb-num",
                                                        children: [
                                                            label,
                                                            " (",
                                                            settings.sound[k],
                                                            "%)"
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                        type: "range",
                                                        min: 0,
                                                        max: 100,
                                                        value: settings.sound[k],
                                                        onChange: function onChange(e) {
                                                            var _obj;
                                                            return updateSound((_obj = {}, _obj[k] = Number(e.target.value), _obj));
                                                        },
                                                        className: "w-48 accent-[#F5C451]"
                                                    })
                                                ]
                                            }, k);
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-bold text-white",
                                                            children: "Hero Voiceover Language"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[11px] text-slate-400",
                                                            children: "Select voice pack dialect for Lobby Showcase and Battle Announcer cues."
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "flex gap-1",
                                                    children: VOICE_LANGUAGES.map(function(lang) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            onClick: function onClick() {
                                                                _AudioEngine.mlbbAudio.playClick();
                                                                updateSound({
                                                                    language: lang
                                                                });
                                                            },
                                                            className: "px-2.5 py-1.5 rounded-lg font-black cursor-pointer " + (settings.sound.language === lang ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'),
                                                            children: lang
                                                        }, lang);
                                                    })
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "p-2.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "font-bold",
                                                    children: "Kill Streak Announcer Voice"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: settings.sound.killAnnouncer,
                                                    onChange: function onChange(e) {
                                                        return updateSound({
                                                            killAnnouncer: e.target.checked
                                                        });
                                                    },
                                                    className: "accent-[#F5C451] w-4 h-4"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center gap-2 pt-1",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    onClick: function onClick() {
                                                        return _AudioEngine.mlbbAudio.playSkill(3, 'magic');
                                                    },
                                                    className: "px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-black text-sky-300 cursor-pointer",
                                                    children: "Test Skill SFX"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    onClick: function onClick() {
                                                        return _AudioEngine.mlbbAudio.playKillStreakAnnouncer('savage');
                                                    },
                                                    className: "px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-[#F5C451]/50 font-black text-[#F5C451] cursor-pointer",
                                                    children: "Test Announcer (SAVAGE!)"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                tab === 'network' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "space-y-3",
                                    children: [
                                        [
                                            [
                                                'speedMode',
                                                'Speed Mode (Low Latency Input)'
                                            ],
                                            [
                                                'networkBoost',
                                                'Network Boost (Dual-Channel Smoothing)'
                                            ],
                                            [
                                                'showPingFps',
                                                'Show Live Ping & FPS Telemetry'
                                            ]
                                        ].map(function(param) {
                                            var k = param[0], label = param[1];
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "font-bold",
                                                        children: label
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                        type: "checkbox",
                                                        checked: settings.network[k],
                                                        onChange: function onChange(e) {
                                                            var _obj;
                                                            return updateNetwork((_obj = {}, _obj[k] = e.target.checked, _obj));
                                                        },
                                                        className: "accent-[#F5C451] w-4 h-4"
                                                    })
                                                ]
                                            }, k);
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-3.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-black text-white",
                                                            children: "Live Frame-Pacing & Engine Diagnostic"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[11px] text-emerald-300 mlbb-num",
                                                            children: diagResult != null ? diagResult : 'Measures real browser animation frames and frame-time stability'
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    disabled: diagRunning,
                                                    onClick: runLiveFrameDiagnostic,
                                                    className: "px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-black whitespace-nowrap cursor-pointer",
                                                    children: diagRunning ? 'Testing...' : 'Run Test'
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                tab === 'privacy' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "space-y-2.5",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-[11px] text-slate-400",
                                            children: "Privacy controls apply immediately to your Player Profile Namecard, History tab, and Lobby social visibility."
                                        }),
                                        [
                                            [
                                                'hideMatchHistory',
                                                'Hide Match History'
                                            ],
                                            [
                                                'hideFavoriteHeroes',
                                                'Hide Favorite Heroes'
                                            ],
                                            [
                                                'hideOnlineStatus',
                                                'Hide Online Status'
                                            ],
                                            [
                                                'hideRegion',
                                                'Hide Region Flag'
                                            ],
                                            [
                                                'blockNonFriendInvites',
                                                'Block Non-Friend Lobby Invites'
                                            ]
                                        ].map(function(param) {
                                            var k = param[0], label = param[1];
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "font-bold",
                                                        children: label
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                        type: "checkbox",
                                                        checked: settings.privacy[k],
                                                        onChange: function onChange(e) {
                                                            var _obj;
                                                            return updatePrivacy((_obj = {}, _obj[k] = e.target.checked, _obj));
                                                        },
                                                        className: "accent-[#F5C451] w-4 h-4"
                                                    })
                                                ]
                                            }, k);
                                        })
                                    ]
                                }),
                                tab === 'resources' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-bold text-white",
                                                            children: "Procedural HD VFX Pack"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[11px] text-slate-400",
                                                            children: "Enables full 5-layer elemental skill particles, ground runes, and 3D lighting shaders."
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: settings.resources.hdVfxPack,
                                                    onChange: function onChange(e) {
                                                        return updateResources({
                                                            hdVfxPack: e.target.checked
                                                        });
                                                    },
                                                    className: "accent-[#F5C451] w-4 h-4"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-bold text-white",
                                                            children: "Procedural Web Audio HD Pack"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[11px] text-slate-400",
                                                            children: "High-definition synthesized combat hits, harmonic chimes, and announcer fanfare."
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: settings.resources.hdAudioPack,
                                                    onChange: function onChange(e) {
                                                        return updateResources({
                                                            hdAudioPack: e.target.checked
                                                        });
                                                    },
                                                    className: "accent-[#F5C451] w-4 h-4"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-3.5 rounded-xl bg-[#101C3D] border border-[#F5C451]/40 flex items-center justify-between gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-black text-[#F5C451]",
                                                            children: "Game Resource Integrity Check"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[11px] text-emerald-300 mlbb-num mt-0.5",
                                                            children: resourceCheck != null ? resourceCheck : 'Verify all local offline hero, item, emblem, talent, and spell registries.'
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    onClick: runResourceIntegrityCheck,
                                                    className: "px-4 py-2 rounded-lg bg-[#F5C451] hover:bg-amber-300 text-slate-950 font-black whitespace-nowrap cursor-pointer",
                                                    children: "Verify Assets"
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
        })
    });
};
/* ==================== INTERACTIVE VISUAL CUSTOM UI EDITOR ==================== */ function getControlVisualShape(id) {
    if (id === 'minimap') return {
        cls: 'w-28 h-28 rounded-xl',
        badge: 'MAP'
    };
    if (id === 'shopBar') return {
        cls: 'w-32 h-11 rounded-xl',
        badge: 'SHOP'
    };
    if (id === 'joystick') return {
        cls: 'w-24 h-24 rounded-full border-dashed',
        badge: 'JOY'
    };
    if (id === 'basicAtk') return {
        cls: 'w-20 h-20 rounded-full',
        badge: 'ATK'
    };
    if (id === 'skill1' || id === 'skill2' || id === 'skill3' || id === 'skill4') {
        return {
            cls: 'w-16 h-16 rounded-full',
            badge: id.toUpperCase()
        };
    }
    if (id === 'minionBtn' || id === 'turretBtn' || id === 'cancelCast') {
        return {
            cls: 'w-12 h-12 rounded-full',
            badge: id === 'cancelCast' ? 'X' : 'TGT'
        };
    }
    return {
        cls: 'w-14 h-14 rounded-full',
        badge: 'BTN'
    };
}
var CustomUiEditorOverlay = function CustomUiEditorOverlay(param) {
    var settings = param.settings, onSave = param.onSave, onClose = param.onClose;
    var _settings_interface_editorSnapToGrid, _currentMap_selectedId;
    var _useState = (0, _react.useState)(settings.interface.activeSkillPreset), preset = _useState[0], setPreset = _useState[1];
    var _useState1 = (0, _react.useState)((_settings_interface_editorSnapToGrid = settings.interface.editorSnapToGrid) != null ? _settings_interface_editorSnapToGrid : true), snapToGrid = _useState1[0], setSnapToGrid = _useState1[1];
    var _useState2 = (0, _react.useState)(function() {
        return _extends({}, settings.interface.customUi3Skill);
    }), layouts3 = _useState2[0], setLayouts3 = _useState2[1];
    var _useState3 = (0, _react.useState)(function() {
        return _extends({}, settings.interface.customUi4Skill);
    }), layouts4 = _useState3[0], setLayouts4 = _useState3[1];
    var _useState4 = (0, _react.useState)('skill1'), selectedId = _useState4[0], setSelectedId = _useState4[1];
    var stageRef = (0, _react.useRef)(null);
    var draggingId = (0, _react.useRef)(null);
    var currentMap = preset === '3skill' ? layouts3 : layouts4;
    var setCurrentMap = function setCurrentMap(updater) {
        if (preset === '3skill') setLayouts3(updater);
        else setLayouts4(updater);
    };
    var selected = (_currentMap_selectedId = currentMap[selectedId]) != null ? _currentMap_selectedId : Object.values(currentMap)[0];
    // Real-time overlap detection between any two controls
    var overlappingIds = (0, _react.useMemo)(function() {
        var ids = new Set();
        var list = Object.values(currentMap);
        for(var i = 0; i < list.length; i++){
            for(var j = i + 1; j < list.length; j++){
                var d = Math.hypot(list[i].xPct - list[j].xPct, list[i].yPct - list[j].yPct);
                if (d < 5.2) {
                    ids.add(list[i].id);
                    ids.add(list[j].id);
                }
            }
        }
        return ids;
    }, [
        currentMap
    ]);
    var applyCoord = function applyCoord(id, rawX, rawY) {
        var snappedX = snapToGrid ? Math.round(rawX / 4) * 4 : Math.round(rawX);
        var snappedY = snapToGrid ? Math.round(rawY / 4) * 4 : Math.round(rawY);
        var xPct = Math.max(3, Math.min(97, snappedX));
        var yPct = Math.max(6, Math.min(94, snappedY));
        setCurrentMap(function(m) {
            var _obj;
            return _extends({}, m, (_obj = {}, _obj[id] = _extends({}, m[id], {
                xPct: xPct,
                yPct: yPct
            }), _obj));
        });
    };
    var handlePointerMove = function handlePointerMove(e) {
        if (!draggingId.current || !stageRef.current) return;
        var rect = stageRef.current.getBoundingClientRect();
        var rawX = (e.clientX - rect.left) / rect.width * 100;
        var rawY = (e.clientY - rect.top) / rect.height * 100;
        applyCoord(draggingId.current, rawX, rawY);
    };
    var nudgeSelected = function nudgeSelected(dx, dy) {
        if (!selected) return;
        var xPct = Math.max(3, Math.min(97, selected.xPct + dx));
        var yPct = Math.max(6, Math.min(94, selected.yPct + dy));
        setCurrentMap(function(m) {
            var _obj;
            return _extends({}, m, (_obj = {}, _obj[selected.id] = _extends({}, m[selected.id], {
                xPct: xPct,
                yPct: yPct
            }), _obj));
        });
    };
    var copyBetweenPresets = function copyBetweenPresets() {
        _AudioEngine.mlbbAudio.playClick();
        if (preset === '3skill') {
            var _layouts4_skill4;
            var base4 = (0, _storage.createDefaultCustomUi)('4skill');
            setLayouts4(_extends({}, base4, layouts3, {
                skill4: (_layouts4_skill4 = layouts4.skill4) != null ? _layouts4_skill4 : base4.skill4
            }));
        } else {
            var next3 = {};
            for(var _iterator = _create_for_of_iterator_helper_loose(Object.entries(layouts4)), _step; !(_step = _iterator()).done;){
                var _step_value = _step.value, k = _step_value[0], v = _step_value[1];
                if (k !== 'skill4') next3[k] = _extends({}, v);
            }
            setLayouts3(next3);
        }
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "fixed inset-0 z-50 bg-[#050A18] text-white flex flex-col select-none",
        onPointerMove: handlePointerMove,
        onPointerUp: function onPointerUp() {
            return draggingId.current = null;
        },
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#0D1836] border-b border-[#F5C451]/40 text-xs",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "font-black text-[#F5C451] whitespace-nowrap",
                                children: "Custom UI Editor"
                            }),
                            [
                                '3skill',
                                '4skill'
                            ].map(function(p) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    onClick: function onClick() {
                                        return setPreset(p);
                                    },
                                    className: "px-2.5 py-1 rounded font-black whitespace-nowrap cursor-pointer " + (preset === p ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'),
                                    children: p === '3skill' ? '3-Skill' : '4-Skill'
                                }, p);
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    return setSnapToGrid(function(v) {
                                        return !v;
                                    });
                                },
                                className: "px-2.5 py-1 rounded font-black whitespace-nowrap cursor-pointer border " + (snapToGrid ? 'bg-sky-600/35 border-sky-400 text-sky-200' : 'bg-slate-800 border-slate-700 text-slate-400'),
                                children: [
                                    "Grid Snap: ",
                                    snapToGrid ? 'ON' : 'OFF'
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: copyBetweenPresets,
                                className: "px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold text-slate-200 whitespace-nowrap cursor-pointer",
                                title: "Copy current layout coordinates to the other skill preset",
                                children: preset === '3skill' ? 'Copy → 4-Skill' : 'Copy → 3-Skill'
                            })
                        ]
                    }),
                    selected && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex flex-wrap items-center gap-2.5",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "font-black text-sky-300 whitespace-nowrap",
                                children: [
                                    selected.label,
                                    " ",
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "text-slate-400 mlbb-num",
                                        children: [
                                            "(",
                                            selected.xPct,
                                            "%, ",
                                            selected.yPct,
                                            "%)"
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center gap-0.5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            return nudgeSelected(-1, 0);
                                        },
                                        className: "w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-black cursor-pointer",
                                        title: "Nudge Left 1%",
                                        children: "←"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            return nudgeSelected(0, -1);
                                        },
                                        className: "w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-black cursor-pointer",
                                        title: "Nudge Up 1%",
                                        children: "↑"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            return nudgeSelected(0, 1);
                                        },
                                        className: "w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-black cursor-pointer",
                                        title: "Nudge Down 1%",
                                        children: "↓"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            return nudgeSelected(1, 0);
                                        },
                                        className: "w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-black cursor-pointer",
                                        title: "Nudge Right 1%",
                                        children: "→"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                className: "flex items-center gap-1 mlbb-num",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            "Size ",
                                            Math.round(selected.scale * 100),
                                            "%"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                        type: "range",
                                        min: 50,
                                        max: 150,
                                        value: Math.round(selected.scale * 100),
                                        onChange: function onChange(e) {
                                            return setCurrentMap(function(m) {
                                                var _obj;
                                                return _extends({}, m, (_obj = {}, _obj[selected.id] = _extends({}, m[selected.id], {
                                                    scale: Number(e.target.value) / 100
                                                }), _obj));
                                            });
                                        },
                                        className: "w-20 accent-[#F5C451]"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                className: "flex items-center gap-1 mlbb-num",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            "Opacity ",
                                            Math.round(selected.opacity * 100),
                                            "%"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                        type: "range",
                                        min: 20,
                                        max: 100,
                                        value: Math.round(selected.opacity * 100),
                                        onChange: function onChange(e) {
                                            return setCurrentMap(function(m) {
                                                var _obj;
                                                return _extends({}, m, (_obj = {}, _obj[selected.id] = _extends({}, m[selected.id], {
                                                    opacity: Number(e.target.value) / 100
                                                }), _obj));
                                            });
                                        },
                                        className: "w-20 accent-[#F5C451]"
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                            [
                                [
                                    'Compact',
                                    0.88
                                ],
                                [
                                    'Default',
                                    1.0
                                ],
                                [
                                    'Pro',
                                    1.12
                                ],
                                [
                                    'Large',
                                    1.24
                                ]
                            ].map(function(param) {
                                var lbl = param[0], mult = param[1];
                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    onClick: function onClick() {
                                        return setCurrentMap(function(m) {
                                            var base = (0, _storage.createDefaultCustomUi)(preset);
                                            var next = {};
                                            for(var _iterator = _create_for_of_iterator_helper_loose(Object.entries(m)), _step; !(_step = _iterator()).done;){
                                                var _step_value = _step.value, k = _step_value[0], v = _step_value[1];
                                                var _ref;
                                                var _base_k;
                                                next[k] = _extends({}, v, {
                                                    scale: Number((((_ref = (_base_k = base[k]) == null ? void 0 : _base_k.scale) != null ? _ref : 1) * mult).toFixed(2))
                                                });
                                            }
                                            return next;
                                        });
                                    },
                                    className: "px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[10px] font-black text-amber-200 whitespace-nowrap cursor-pointer",
                                    children: lbl
                                }, lbl);
                            }),
                            selected && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    var def = (0, _storage.createDefaultCustomUi)(preset)[selected.id];
                                    if (def) setCurrentMap(function(m) {
                                        var _obj;
                                        return _extends({}, m, (_obj = {}, _obj[selected.id] = _extends({}, def), _obj));
                                    });
                                },
                                className: "px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-black whitespace-nowrap cursor-pointer",
                                children: "Reset One"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    return setCurrentMap(function() {
                                        return (0, _storage.createDefaultCustomUi)(preset);
                                    });
                                },
                                className: "px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 font-black whitespace-nowrap cursor-pointer",
                                children: "Reset All"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClick();
                                    onSave(_extends({}, settings, {
                                        interface: _extends({}, settings.interface, {
                                            activeSkillPreset: preset,
                                            editorSnapToGrid: snapToGrid,
                                            customUi3Skill: layouts3,
                                            customUi4Skill: layouts4
                                        })
                                    }));
                                },
                                className: "px-4 py-1.5 rounded-lg bg-[#F5C451] hover:bg-amber-300 text-slate-950 font-black whitespace-nowrap cursor-pointer",
                                children: "Save Layout"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: onClose,
                                className: "px-2.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 font-black cursor-pointer",
                                children: "✕"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                ref: stageRef,
                className: "relative flex-1 bg-gradient-to-br from-[#173526] via-[#102438] to-[#0B132B] overflow-hidden",
                style: snapToGrid ? {
                    backgroundImage: 'linear-gradient(to right, rgba(245,196,81,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,196,81,0.08) 1px, transparent 1px)',
                    backgroundSize: '4% 4%'
                } : undefined,
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-1",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "text-slate-300/35 text-xs font-black tracking-widest uppercase",
                                children: "Drag any control to reposition \xb7 Use toolbar for fine X/Y nudge, scale & opacity"
                            }),
                            overlappingIds.size > 0 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "px-3 py-1 rounded-lg bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-black",
                                children: [
                                    "Overlap Warning: ",
                                    overlappingIds.size,
                                    " controls are placed too close together"
                                ]
                            })
                        ]
                    }),
                    Object.values(currentMap).map(function(ctrl) {
                        var shape = getControlVisualShape(ctrl.id);
                        var isSelected = selectedId === ctrl.id;
                        var isOverlapping = overlappingIds.has(ctrl.id);
                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            onPointerDown: function onPointerDown(e) {
                                e.stopPropagation();
                                setSelectedId(ctrl.id);
                                draggingId.current = ctrl.id;
                            },
                            style: {
                                left: "" + ctrl.xPct + "%",
                                top: "" + ctrl.yPct + "%",
                                transform: "translate(-50%, -50%) scale(" + ctrl.scale + ")",
                                opacity: ctrl.opacity
                            },
                            className: "absolute " + shape.cls + " border-2 flex flex-col items-center justify-center text-center px-1 text-[10px] font-black cursor-move shadow-xl transition-shadow " + (isOverlapping ? 'bg-rose-600/45 border-rose-400 text-white' : isSelected ? 'bg-amber-500/40 border-[#F5C451] text-white ring-2 ring-[#F5C451]/60' : 'bg-[#0B132B]/88 border-sky-400/75 text-slate-200'),
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    className: "leading-tight",
                                    children: ctrl.label
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    className: "text-[8px] text-amber-200/80 mlbb-num",
                                    children: shape.badge
                                })
                            ]
                        }, ctrl.id);
                    })
                ]
            })
        ]
    });
};

});

})(window.ArcadeMod);
