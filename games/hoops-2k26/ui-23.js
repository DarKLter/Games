(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/nba2k14/components/OptionsSuiteView ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/components/OptionsSuiteView", function(require, module, exports) {
// ============================================================================
// NBA 2K14 — Complete 7-Category Options & Gameplay Sliders Suite
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "OptionsSuiteView", {
    enumerable: true,
    get: function() {
        return OptionsSuiteView;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _lucidereact = require("lucide-react");
var _Nba2k14Audio = require("../audio/Nba2k14Audio");
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
var TABS = [
    {
        id: 'game',
        label: 'Game Settings'
    },
    {
        id: 'controller',
        label: 'Controller'
    },
    {
        id: 'camera',
        label: 'Camera'
    },
    {
        id: 'presentation',
        label: 'Presentation & Audio'
    },
    {
        id: 'coach',
        label: 'Coach Settings'
    },
    {
        id: 'sliders',
        label: 'Gameplay Sliders'
    },
    {
        id: 'graphics',
        label: 'Graphics'
    }
];
var SLIDER_LABELS = [
    {
        key: 'insideShot',
        label: 'Inside Shot Success'
    },
    {
        key: 'closeShot',
        label: 'Close Shot Success'
    },
    {
        key: 'midRange',
        label: 'Mid-Range Success'
    },
    {
        key: 'threePt',
        label: '3PT Success'
    },
    {
        key: 'layup',
        label: 'Layup Success'
    },
    {
        key: 'dunkInTraffic',
        label: 'Dunk in Traffic'
    },
    {
        key: 'passAccuracy',
        label: 'Pass Accuracy'
    },
    {
        key: 'alleyOop',
        label: 'Alley-Oop Success'
    },
    {
        key: 'contactShot',
        label: 'Contact Shot Success'
    },
    {
        key: 'drivingContactFreq',
        label: 'Driving Contact Freq'
    },
    {
        key: 'insideContactFreq',
        label: 'Inside Contact Freq'
    },
    {
        key: 'stealSuccess',
        label: 'Steal Success'
    },
    {
        key: 'blockSuccess',
        label: 'Block Success'
    },
    {
        key: 'defAwareness',
        label: 'Defensive Awareness'
    },
    {
        key: 'onBallDefense',
        label: 'On-Ball Defense'
    },
    {
        key: 'acceleration',
        label: 'Acceleration'
    },
    {
        key: 'vertical',
        label: 'Vertical'
    },
    {
        key: 'strength',
        label: 'Strength'
    },
    {
        key: 'stamina',
        label: 'Stamina'
    },
    {
        key: 'speed',
        label: 'Speed'
    },
    {
        key: 'hustle',
        label: 'Hustle'
    },
    {
        key: 'ballHandling',
        label: 'Ball Handling'
    },
    {
        key: 'hands',
        label: 'Hands'
    },
    {
        key: 'offRebounding',
        label: 'Offensive Rebounding'
    },
    {
        key: 'defRebounding',
        label: 'Defensive Rebounding'
    }
];
var OptionsSuiteView = function OptionsSuiteView(param) {
    var settings = param.settings, onChange = param.onChange, onBack = param.onBack, compact = param.compact;
    var _useState = (0, _react.useState)('game'), tab = _useState[0], setTab = _useState[1];
    var _useState1 = (0, _react.useState)('user'), sliderSide = _useState1[0], setSliderSide = _useState1[1];
    var _useState2 = (0, _react.useState)(null), rebindingKey = _useState2[0], setRebindingKey = _useState2[1];
    var patch = function patch(next) {
        onChange(next);
    };
    var activeSliders = sliderSide === 'user' ? settings.slidersUser : settings.slidersCpu;
    var updateSlider = function updateSlider(key, val) {
        if (sliderSide === 'user') {
            var _obj;
            patch(_extends({}, settings, {
                slidersUser: _extends({}, settings.slidersUser, (_obj = {}, _obj[key] = val, _obj))
            }));
        } else {
            var _obj1;
            patch(_extends({}, settings, {
                slidersCpu: _extends({}, settings.slidersCpu, (_obj1 = {}, _obj1[key] = val, _obj1))
            }));
        }
    };
    var handleKeyCapture = function handleKeyCapture(e, k) {
        e.preventDefault();
        var _obj;
        patch(_extends({}, settings, {
            keybinds: _extends({}, settings.keybinds, (_obj = {}, _obj[k] = e.code, _obj))
        }));
        setRebindingKey(null);
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "w-full " + (compact ? '' : 'max-w-6xl mx-auto px-4 py-3') + " flex flex-col gap-3",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "bg-[#0f1116]/94 border border-white/15 px-3 py-2 flex flex-wrap items-center justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "flex flex-wrap gap-1",
                        children: TABS.map(function(t) {
                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    _Nba2k14Audio.Nba2k14Audio.playUiClick('hover');
                                    setTab(t.id);
                                },
                                className: "px-3 py-1.5 text-[11px] font-black uppercase tracking-wider border cursor-pointer " + (tab === t.id ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#171a23] border-white/10 text-slate-300 hover:text-white'),
                                children: t.label
                            }, t.id);
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                    patch((0, _storage.createDefaultSettings)());
                                },
                                className: "px-2.5 py-1.5 bg-[#171a23] hover:bg-[#252a38] border border-white/15 text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.RotateCcw, {
                                        className: "w-3 h-3"
                                    }),
                                    " Reset All"
                                ]
                            }),
                            onBack && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: onBack,
                                className: "px-3 py-1.5 bg-[#171a23] hover:bg-[#252a38] border border-white/15 text-[11px] font-bold uppercase cursor-pointer",
                                children: "Back"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "bg-[#0f1116]/94 border border-white/15 p-4 " + (compact ? 'max-h-[54vh]' : 'max-h-[58vh]') + " overflow-y-auto",
                children: [
                    tab === 'game' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-6 text-xs",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-xs font-black uppercase tracking-widest text-[#F9A01B]",
                                        children: "Core Gameplay"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Difficulty"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                value: settings.game.difficulty,
                                                onChange: function onChange(e) {
                                                    return patch(_extends({}, settings, {
                                                        game: _extends({}, settings.game, {
                                                            difficulty: e.target.value
                                                        })
                                                    }));
                                                },
                                                className: "bg-[#171a23] border border-white/20 px-2.5 py-1 font-bold",
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
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Quarter Length"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                value: settings.game.quarterLengthMin,
                                                onChange: function onChange(e) {
                                                    return patch(_extends({}, settings, {
                                                        game: _extends({}, settings.game, {
                                                            quarterLengthMin: Number(e.target.value)
                                                        })
                                                    }));
                                                },
                                                className: "bg-[#171a23] border border-white/20 px-2.5 py-1 font-mono font-bold",
                                                children: [
                                                    1,
                                                    2,
                                                    3,
                                                    5,
                                                    6,
                                                    8,
                                                    10,
                                                    12
                                                ].map(function(m) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                        value: m,
                                                        children: [
                                                            m,
                                                            " Minutes"
                                                        ]
                                                    }, m);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Game Style"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                value: settings.game.gameStyle,
                                                onChange: function onChange(e) {
                                                    return patch(_extends({}, settings, {
                                                        game: _extends({}, settings.game, {
                                                            gameStyle: e.target.value
                                                        })
                                                    }));
                                                },
                                                className: "bg-[#171a23] border border-white/20 px-2.5 py-1 font-bold",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Default",
                                                        children: "Default"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Simulation",
                                                        children: "Simulation"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Casual",
                                                        children: "Casual"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex justify-between mb-1",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: "Game Speed"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "font-mono tabular-nums text-[#F9A01B]",
                                                        children: settings.game.gameSpeed
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                type: "range",
                                                min: 20,
                                                max: 100,
                                                value: settings.game.gameSpeed,
                                                onChange: function onChange(e) {
                                                    return patch(_extends({}, settings, {
                                                        game: _extends({}, settings.game, {
                                                            gameSpeed: Number(e.target.value)
                                                        })
                                                    }));
                                                },
                                                className: "w-full accent-[#CE1141]"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Shot Timing"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                value: settings.game.shotTiming,
                                                onChange: function onChange(e) {
                                                    return patch(_extends({}, settings, {
                                                        game: _extends({}, settings.game, {
                                                            shotTiming: e.target.value
                                                        })
                                                    }));
                                                },
                                                className: "bg-[#171a23] border border-white/20 px-2.5 py-1 font-bold",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "User Timing",
                                                        children: "User Timing"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Real Player FG%",
                                                        children: "Real Player FG%"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Free Throw Timing"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                value: settings.game.freeThrowTiming,
                                                onChange: function onChange(e) {
                                                    return patch(_extends({}, settings, {
                                                        game: _extends({}, settings.game, {
                                                            freeThrowTiming: e.target.value
                                                        })
                                                    }));
                                                },
                                                className: "bg-[#171a23] border border-white/20 px-2.5 py-1 font-bold",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "User Timing",
                                                        children: "User Timing"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Real Player FT%",
                                                        children: "Real Player FT%"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    [
                                        [
                                            'fatigue',
                                            'Fatigue'
                                        ],
                                        [
                                            'injuries',
                                            'Injuries'
                                        ],
                                        [
                                            'clutchFactor',
                                            'Clutch Factor'
                                        ]
                                    ].map(function(param) {
                                        var k = param[0], label = param[1];
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "flex items-center justify-between cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: label
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: settings.game[k],
                                                    onChange: function onChange(e) {
                                                        var _obj;
                                                        return patch(_extends({}, settings, {
                                                            game: _extends({}, settings.game, (_obj = {}, _obj[k] = e.target.checked, _obj))
                                                        }));
                                                    },
                                                    className: "accent-[#CE1141] w-4 h-4"
                                                })
                                            ]
                                        }, k);
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-2.5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-xs font-black uppercase tracking-widest text-[#F9A01B]",
                                        children: "NBA Rules Enforcement"
                                    }),
                                    [
                                        [
                                            'outOfBounds',
                                            'Out of Bounds'
                                        ],
                                        [
                                            'backcourtViolation',
                                            'Backcourt Violation'
                                        ],
                                        [
                                            'eightSecondViolation',
                                            '8-Second Violation'
                                        ],
                                        [
                                            'shotClock24',
                                            '24-Second Shot Clock'
                                        ],
                                        [
                                            'threeSecondKey',
                                            '3-Second Key'
                                        ],
                                        [
                                            'goaltending',
                                            'Goaltending'
                                        ],
                                        [
                                            'shootingFouls',
                                            'Shooting Fouls'
                                        ],
                                        [
                                            'reachInFouls',
                                            'Reach-In Fouls'
                                        ],
                                        [
                                            'chargingFouls',
                                            'Charging Fouls'
                                        ]
                                    ].map(function(param) {
                                        var k = param[0], label = param[1];
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "flex items-center justify-between py-1 border-b border-white/5 cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: label
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: settings.rules[k],
                                                    onChange: function onChange(e) {
                                                        var _obj;
                                                        return patch(_extends({}, settings, {
                                                            rules: _extends({}, settings.rules, (_obj = {}, _obj[k] = e.target.checked, _obj))
                                                        }));
                                                    },
                                                    className: "accent-[#CE1141] w-4 h-4"
                                                })
                                            ]
                                        }, k);
                                    })
                                ]
                            })
                        ]
                    }),
                    tab === 'controller' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-6 text-xs",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-xs font-black uppercase tracking-widest text-[#F9A01B]",
                                        children: "Pro Stick & Assists"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Pro Stick Function"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                value: settings.controller.proStickFunction,
                                                onChange: function onChange(e) {
                                                    return patch(_extends({}, settings, {
                                                        controller: _extends({}, settings.controller, {
                                                            proStickFunction: e.target.value
                                                        })
                                                    }));
                                                },
                                                className: "bg-[#171a23] border border-white/20 px-2 py-1 font-bold",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Default",
                                                        children: "Default"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Dribble Moves",
                                                        children: "Dribble Moves"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Shots",
                                                        children: "Shots"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Pro Stick Orientation"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                value: settings.controller.proStickOrientation,
                                                onChange: function onChange(e) {
                                                    return patch(_extends({}, settings, {
                                                        controller: _extends({}, settings.controller, {
                                                            proStickOrientation: e.target.value
                                                        })
                                                    }));
                                                },
                                                className: "bg-[#171a23] border border-white/20 px-2 py-1 font-bold",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Camera Relative",
                                                        children: "Camera Relative"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Absolute",
                                                        children: "Absolute"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Shot Meter Display"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                value: settings.controller.shotMeterDisplay,
                                                onChange: function onChange(e) {
                                                    return patch(_extends({}, settings, {
                                                        controller: _extends({}, settings.controller, {
                                                            shotMeterDisplay: e.target.value
                                                        })
                                                    }));
                                                },
                                                className: "bg-[#171a23] border border-white/20 px-2 py-1 font-bold",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "On (Floor Ring)",
                                                        children: "On (Floor Ring)"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "On (Hands)",
                                                        children: "On (Hands)"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Off (No-Meter Green Boost)",
                                                        children: "Off (No-Meter Green Boost)"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Virtual Gamepad Overlay"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                value: settings.controller.virtualGamepad,
                                                onChange: function onChange(e) {
                                                    return patch(_extends({}, settings, {
                                                        controller: _extends({}, settings.controller, {
                                                            virtualGamepad: e.target.value
                                                        })
                                                    }));
                                                },
                                                className: "bg-[#171a23] border border-white/20 px-2 py-1 font-bold",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Auto",
                                                        children: "Auto"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Always On",
                                                        children: "Always On"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Off",
                                                        children: "Off"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                        className: "flex items-center justify-between cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Shot Feedback Banner"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                type: "checkbox",
                                                checked: settings.controller.shotFeedback,
                                                onChange: function onChange(e) {
                                                    return patch(_extends({}, settings, {
                                                        controller: _extends({}, settings.controller, {
                                                            shotFeedback: e.target.checked
                                                        })
                                                    }));
                                                },
                                                className: "accent-[#CE1141] w-4 h-4"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: "Defensive Assist"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "font-mono",
                                                        children: settings.controller.defensiveAssist
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                type: "range",
                                                min: 0,
                                                max: 100,
                                                value: settings.controller.defensiveAssist,
                                                onChange: function onChange(e) {
                                                    return patch(_extends({}, settings, {
                                                        controller: _extends({}, settings.controller, {
                                                            defensiveAssist: Number(e.target.value)
                                                        })
                                                    }));
                                                },
                                                className: "w-full accent-[#CE1141]"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: "Boxout Assist"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "font-mono",
                                                        children: settings.controller.boxoutAssist
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                type: "range",
                                                min: 0,
                                                max: 100,
                                                value: settings.controller.boxoutAssist,
                                                onChange: function onChange(e) {
                                                    return patch(_extends({}, settings, {
                                                        controller: _extends({}, settings.controller, {
                                                            boxoutAssist: Number(e.target.value)
                                                        })
                                                    }));
                                                },
                                                className: "w-full accent-[#CE1141]"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-1.5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between mb-1",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-xs font-black uppercase tracking-widest text-[#F9A01B]",
                                                children: "Keybind Remapper"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    return patch(_extends({}, settings, {
                                                        keybinds: (0, _storage.createDefaultSettings)().keybinds
                                                    }));
                                                },
                                                className: "text-[10px] uppercase text-slate-300 hover:text-white underline cursor-pointer",
                                                children: "Reset Keys"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "grid grid-cols-2 gap-1.5",
                                        children: Object.keys(settings.keybinds).map(function(k) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    return setRebindingKey(k);
                                                },
                                                onKeyDown: function onKeyDown(e) {
                                                    return rebindingKey === k && handleKeyCapture(e, k);
                                                },
                                                className: "flex items-center justify-between px-2 py-1.5 border text-[11px] cursor-pointer " + (rebindingKey === k ? 'bg-[#CE1141] border-[#F9A01B]' : 'bg-[#171a23] border-white/10 hover:border-white/30'),
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "capitalize text-slate-300",
                                                        children: k.replace(/([A-Z])/g, ' $1')
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "font-mono font-bold text-white",
                                                        children: rebindingKey === k ? 'Press Key...' : settings.keybinds[k].replace('Key', '')
                                                    })
                                                ]
                                            }, k);
                                        })
                                    })
                                ]
                            })
                        ]
                    }),
                    tab === 'camera' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "max-w-xl space-y-4 text-xs",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "text-xs font-black uppercase tracking-widest text-[#F9A01B]",
                                children: "3D Court Camera Angles"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "grid grid-cols-3 gap-2",
                                children: [
                                    '2K',
                                    'Broadcast',
                                    'Turbo',
                                    'Drive',
                                    'Nosebleeds',
                                    'Player Lock'
                                ].map(function(ang) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            return patch(_extends({}, settings, {
                                                camera: _extends({}, settings.camera, {
                                                    angle: ang
                                                })
                                            }));
                                        },
                                        className: "py-2 border text-xs font-black uppercase cursor-pointer " + (settings.camera.angle === ang ? 'bg-[#CE1141] border-[#F9A01B]' : 'bg-[#171a23] border-white/15'),
                                        children: ang
                                    }, ang);
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Zoom (1–10)"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "font-mono",
                                                children: settings.camera.zoom
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                        type: "range",
                                        min: 1,
                                        max: 10,
                                        value: settings.camera.zoom,
                                        onChange: function onChange(e) {
                                            return patch(_extends({}, settings, {
                                                camera: _extends({}, settings.camera, {
                                                    zoom: Number(e.target.value)
                                                })
                                            }));
                                        },
                                        className: "w-full accent-[#CE1141]"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Height (1–10)"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "font-mono",
                                                children: settings.camera.height
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                        type: "range",
                                        min: 1,
                                        max: 10,
                                        value: settings.camera.height,
                                        onChange: function onChange(e) {
                                            return patch(_extends({}, settings, {
                                                camera: _extends({}, settings.camera, {
                                                    height: Number(e.target.value)
                                                })
                                            }));
                                        },
                                        className: "w-full accent-[#CE1141]"
                                    })
                                ]
                            }),
                            [
                                [
                                    'keyZoom',
                                    'Key Zoom'
                                ],
                                [
                                    'autoFlip',
                                    'Auto-Flip Camera on Possession'
                                ],
                                [
                                    'dunkShake',
                                    'Camera Shake on Dunks'
                                ]
                            ].map(function(param) {
                                var k = param[0], label = param[1];
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                    className: "flex items-center justify-between cursor-pointer",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            children: label
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                            type: "checkbox",
                                            checked: settings.camera[k],
                                            onChange: function onChange(e) {
                                                var _obj;
                                                return patch(_extends({}, settings, {
                                                    camera: _extends({}, settings.camera, (_obj = {}, _obj[k] = e.target.checked, _obj))
                                                }));
                                            },
                                            className: "accent-[#CE1141] w-4 h-4"
                                        })
                                    ]
                                }, k);
                            })
                        ]
                    }),
                    tab === 'presentation' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-6 text-xs",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-xs font-black uppercase tracking-widest text-[#F9A01B]",
                                        children: "Broadcast Presentation"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                        className: "flex items-center justify-between cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Scoreboard Display"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                type: "checkbox",
                                                checked: settings.presentation.scoreboardDisplay,
                                                onChange: function onChange(e) {
                                                    return patch(_extends({}, settings, {
                                                        presentation: _extends({}, settings.presentation, {
                                                            scoreboardDisplay: e.target.checked
                                                        })
                                                    }));
                                                },
                                                className: "accent-[#CE1141] w-4 h-4"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Player Indicator Style"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                value: settings.presentation.playerIndicatorStyle,
                                                onChange: function onChange(e) {
                                                    return patch(_extends({}, settings, {
                                                        presentation: _extends({}, settings.presentation, {
                                                            playerIndicatorStyle: e.target.value
                                                        })
                                                    }));
                                                },
                                                className: "bg-[#171a23] border border-white/20 px-2 py-1 font-bold",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Full 2K14 Ring",
                                                        children: "Full 2K14 Ring"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Minimal",
                                                        children: "Minimal"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Name + Number",
                                                        children: "Name + Number"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Action Replays / Dunk Cuts"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                value: settings.presentation.actionReplays,
                                                onChange: function onChange(e) {
                                                    return patch(_extends({}, settings, {
                                                        presentation: _extends({}, settings.presentation, {
                                                            actionReplays: e.target.value
                                                        })
                                                    }));
                                                },
                                                className: "bg-[#171a23] border border-white/20 px-2 py-1 font-bold",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Often",
                                                        children: "Often"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Occasionally",
                                                        children: "Occasionally"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "Never",
                                                        children: "Never"
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-xs font-black uppercase tracking-widest text-[#F9A01B]",
                                        children: "Audio Mixer (0–100)"
                                    }),
                                    [
                                        [
                                            'master',
                                            'Master Volume'
                                        ],
                                        [
                                            'beats',
                                            '2K Beats Soundtrack'
                                        ],
                                        [
                                            'crowd',
                                            'Arena Crowd'
                                        ],
                                        [
                                            'sfx',
                                            'On-Court SFX'
                                        ],
                                        [
                                            'commentary',
                                            'PA Announcer & Commentary'
                                        ]
                                    ].map(function(param) {
                                        var k = param[0], label = param[1];
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            children: label
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "font-mono tabular-nums",
                                                            children: settings.audio[k]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "range",
                                                    min: 0,
                                                    max: 100,
                                                    value: settings.audio[k],
                                                    onChange: function onChange(e) {
                                                        var _obj;
                                                        return patch(_extends({}, settings, {
                                                            audio: _extends({}, settings.audio, (_obj = {}, _obj[k] = Number(e.target.value), _obj))
                                                        }));
                                                    },
                                                    className: "w-full accent-[#CE1141]"
                                                })
                                            ]
                                        }, k);
                                    })
                                ]
                            })
                        ]
                    }),
                    tab === 'coach' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "max-w-lg space-y-3 text-xs",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "text-xs font-black uppercase tracking-widest text-[#F9A01B]",
                                children: "Coach & PlayVision"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                className: "flex items-center justify-between cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "Adaptive Coaching Engine"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                        type: "checkbox",
                                        checked: settings.coach.adaptiveEngine,
                                        onChange: function onChange(e) {
                                            return patch(_extends({}, settings, {
                                                coach: _extends({}, settings.coach, {
                                                    adaptiveEngine: e.target.checked
                                                })
                                            }));
                                        },
                                        className: "accent-[#CE1141] w-4 h-4"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "Substitutions"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                        value: settings.coach.substitutions,
                                        onChange: function onChange(e) {
                                            return patch(_extends({}, settings, {
                                                coach: _extends({}, settings.coach, {
                                                    substitutions: e.target.value
                                                })
                                            }));
                                        },
                                        className: "bg-[#171a23] border border-white/20 px-2 py-1 font-bold",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "Auto (Rotation)",
                                                children: "Auto (Rotation)"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "Auto (Fatigue)",
                                                children: "Auto (Fatigue)"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "Manual",
                                                children: "Manual"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "Timeouts"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                        value: settings.coach.timeouts,
                                        onChange: function onChange(e) {
                                            return patch(_extends({}, settings, {
                                                coach: _extends({}, settings.coach, {
                                                    timeouts: e.target.value
                                                })
                                            }));
                                        },
                                        className: "bg-[#171a23] border border-white/20 px-2 py-1 font-bold",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "Auto",
                                                children: "Auto"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "Manual",
                                                children: "Manual"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "Offensive Playcalling"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                        value: settings.coach.offensivePlaycalling,
                                        onChange: function onChange(e) {
                                            return patch(_extends({}, settings, {
                                                coach: _extends({}, settings.coach, {
                                                    offensivePlaycalling: e.target.value
                                                })
                                            }));
                                        },
                                        className: "bg-[#171a23] border border-white/20 px-2 py-1 font-bold",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "Auto",
                                                children: "Auto"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "Manual",
                                                children: "Manual"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "PlayVision Display (3D Floor Art)"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                        value: settings.coach.playVision,
                                        onChange: function onChange(e) {
                                            return patch(_extends({}, settings, {
                                                coach: _extends({}, settings.coach, {
                                                    playVision: e.target.value
                                                })
                                            }));
                                        },
                                        className: "bg-[#171a23] border border-white/20 px-2 py-1 font-bold",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "Off",
                                                children: "Off"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "Lite",
                                                children: "Lite"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "Full",
                                                children: "Full"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                className: "flex items-center justify-between cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "PlayArt Messages"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                        type: "checkbox",
                                        checked: settings.coach.playArtMessages,
                                        onChange: function onChange(e) {
                                            return patch(_extends({}, settings, {
                                                coach: _extends({}, settings.coach, {
                                                    playArtMessages: e.target.checked
                                                })
                                            }));
                                        },
                                        className: "accent-[#CE1141] w-4 h-4"
                                    })
                                ]
                            })
                        ]
                    }),
                    tab === 'sliders' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "space-y-4 text-xs",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex flex-wrap items-center justify-between gap-2",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "flex gap-1.5",
                                        children: [
                                            'user',
                                            'cpu'
                                        ].map(function(s) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    return setSliderSide(s);
                                                },
                                                className: "px-3.5 py-1.5 font-black uppercase border cursor-pointer " + (sliderSide === s ? 'bg-[#CE1141] border-[#F9A01B]' : 'bg-[#171a23] border-white/15'),
                                                children: s === 'user' ? 'USER Sliders' : 'CPU Sliders'
                                            }, s);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "flex gap-1.5",
                                        children: [
                                            'Default',
                                            'Simulation',
                                            'Arcade'
                                        ].map(function(preset) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    var nextS = (0, _storage.createDefaultSliders)(preset);
                                                    patch(sliderSide === 'user' ? _extends({}, settings, {
                                                        slidersUser: nextS
                                                    }) : _extends({}, settings, {
                                                        slidersCpu: nextS
                                                    }));
                                                },
                                                className: "px-2.5 py-1 bg-[#171a23] hover:bg-[#252a38] border border-white/15 font-bold uppercase cursor-pointer",
                                                children: preset === 'Arcade' ? 'Arcade / Blacktop' : preset
                                            }, preset);
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",
                                children: SLIDER_LABELS.map(function(item) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "bg-[#161923] border border-white/10 p-2.5",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex justify-between mb-1",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-slate-200",
                                                        children: item.label
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "font-mono font-bold tabular-nums text-[#F9A01B]",
                                                        children: activeSliders[item.key]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                type: "range",
                                                min: 0,
                                                max: 100,
                                                value: activeSliders[item.key],
                                                onChange: function onChange(e) {
                                                    return updateSlider(item.key, Number(e.target.value));
                                                },
                                                className: "w-full accent-[#CE1141]"
                                            })
                                        ]
                                    }, item.key);
                                })
                            })
                        ]
                    }),
                    tab === 'graphics' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "max-w-lg space-y-3 text-xs",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "text-xs font-black uppercase tracking-widest text-[#F9A01B]",
                                children: "WebGL 3D Render Pipeline"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "Render Quality"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                        value: settings.graphics.renderQuality,
                                        onChange: function onChange(e) {
                                            return patch(_extends({}, settings, {
                                                graphics: _extends({}, settings.graphics, {
                                                    renderQuality: e.target.value
                                                })
                                            }));
                                        },
                                        className: "bg-[#171a23] border border-white/20 px-2.5 py-1 font-bold",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "Low",
                                                children: "Low"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "Medium",
                                                children: "Medium"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "High",
                                                children: "High"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "Ultra",
                                                children: "Ultra"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "Crowd Detail"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                        value: settings.graphics.crowdDetail,
                                        onChange: function onChange(e) {
                                            return patch(_extends({}, settings, {
                                                graphics: _extends({}, settings.graphics, {
                                                    crowdDetail: e.target.value
                                                })
                                            }));
                                        },
                                        className: "bg-[#171a23] border border-white/20 px-2.5 py-1 font-bold",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "Low",
                                                children: "Low"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "High",
                                                children: "High"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                className: "flex items-center justify-between cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "Court Hardwood Reflections"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                        type: "checkbox",
                                        checked: settings.graphics.courtReflections,
                                        onChange: function onChange(e) {
                                            return patch(_extends({}, settings, {
                                                graphics: _extends({}, settings.graphics, {
                                                    courtReflections: e.target.checked
                                                })
                                            }));
                                        },
                                        className: "accent-[#CE1141] w-4 h-4"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                className: "flex items-center justify-between cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "FPS Counter Overlay"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                        type: "checkbox",
                                        checked: settings.graphics.fpsCounter,
                                        onChange: function onChange(e) {
                                            return patch(_extends({}, settings, {
                                                graphics: _extends({}, settings.graphics, {
                                                    fpsCounter: e.target.checked
                                                })
                                            }));
                                        },
                                        className: "accent-[#CE1141] w-4 h-4"
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
// === MODULE: src/games/hoops-2k26/nba2k14/components/PathToGreatnessView ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/components/PathToGreatnessView", function(require, module, exports) {
// ============================================================================
// NBA 2K14 — LeBron: Path to Greatness (Heat Dynasty + Fantastic Journey)
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PathToGreatnessView", {
    enumerable: true,
    get: function() {
        return PathToGreatnessView;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_default(require("react"));
var _lucidereact = require("lucide-react");
var _Nba2k14Audio = require("../audio/Nba2k14Audio");
var _modesData = require("../data/modesData");
var _rosters = require("../data/rosters");
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
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var PathToGreatnessView = function PathToGreatnessView(param) {
    var state = param.state, onSelectPath = param.onSelectPath, onLaunchChapter = param.onLaunchChapter, onBack = param.onBack;
    var chapters = _modesData.PATH_TO_GREATNESS_CHAPTERS.filter(function(c) {
        return c.path === state.selectedPath;
    });
    var totalStars = Object.values(state.completedStars).reduce(function(a, b) {
        return a + b;
    }, 0);
    var maxStars = _modesData.PATH_TO_GREATNESS_CHAPTERS.length * 3;
    var startChapter = function startChapter(ch) {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        var heat = (0, _rosters.getTeamById)('mia');
        var lebron = heat.players.find(function(p) {
            return p.name.includes('LeBron');
        });
        var userTeam = (0, _rosters.getTeamById)(ch.userTeamId);
        var customLineup = ch.userTeamId !== 'mia' ? [].concat([
            _extends({}, lebron, {
                teamId: ch.userTeamId
            })
        ], userTeam.players.filter(function(p) {
            return p.pos !== 'SF';
        }).slice(0, 8)) : undefined;
        onLaunchChapter({
            mode: 'path',
            title: "Path to Greatness \xb7 " + ch.title,
            subtitle: ch.subtitle,
            homeTeamId: ch.userTeamId,
            awayTeamId: ch.oppTeamId,
            homeCustomPlayers: customLineup,
            userSide: 'home',
            courtEnv: ch.courtEnv,
            quarterLengthMin: 4,
            playersPerSide: 5,
            fibaRules: ch.courtEnv === 'euroleague',
            startQuarter: ch.startQuarter,
            startClockSec: ch.startClockSec,
            startHomeScore: ch.startUserScore,
            startAwayScore: ch.startOppScore,
            pathChapterId: ch.id
        });
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "w-full max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "bg-[#0f1116]/94 border border-[#CE1141]/70 px-5 py-3 flex flex-wrap items-center justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#F9A01B]",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Crown, {
                                        className: "w-4 h-4"
                                    }),
                                    " NBA 2K14 Exclusive Story Mode"
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                className: "text-2xl font-black uppercase tracking-tight",
                                children: "LeBron: Path to Greatness"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "text-xs font-mono tabular-nums text-amber-300 mr-2",
                                children: [
                                    "STARS: ",
                                    totalStars,
                                    " / ",
                                    maxStars
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                    onSelectPath('heat_dynasty');
                                },
                                className: "px-3.5 py-2 text-xs font-black uppercase border cursor-pointer " + (state.selectedPath === 'heat_dynasty' ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#171a23] border-white/15 text-slate-300'),
                                children: "Path A: Heat Dynasty"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                    onSelectPath('fantastic_journey');
                                },
                                className: "px-3.5 py-2 text-xs font-black uppercase border cursor-pointer " + (state.selectedPath === 'fantastic_journey' ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#171a23] border-white/15 text-slate-300'),
                                children: "Path B: Fantastic Journey"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: onBack,
                                className: "px-3 py-2 bg-[#171a23] hover:bg-[#232836] border border-white/15 text-xs font-bold uppercase cursor-pointer",
                                children: "Back"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1",
                children: chapters.map(function(ch) {
                    var _state_completedStars_ch_id;
                    var stars = (_state_completedStars_ch_id = state.completedStars[ch.id]) != null ? _state_completedStars_ch_id : 0;
                    var opp = (0, _rosters.getTeamById)(ch.oppTeamId);
                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "bg-[#0f1116]/94 border border-white/15 p-4 flex flex-col justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between text-[11px] font-bold uppercase text-[#F9A01B]",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    "Chapter 0",
                                                    ch.index
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "flex items-center gap-0.5",
                                                children: [
                                                    1,
                                                    2,
                                                    3
                                                ].map(function(n) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Star, {
                                                        className: "w-3.5 h-3.5 " + (stars >= n ? 'fill-[#F9A01B] text-[#F9A01B]' : 'text-slate-600')
                                                    }, n);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                        className: "text-base font-black uppercase mt-1",
                                        children: ch.title
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-xs text-rose-300 font-semibold",
                                        children: ch.subtitle
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                        className: "text-xs text-slate-300 mt-2 leading-relaxed",
                                        children: ch.story
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "mt-3 p-2.5 bg-[#151822] border border-white/10 text-[11px] space-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "font-mono tabular-nums text-slate-200",
                                                children: [
                                                    "Start: Q",
                                                    ch.startQuarter,
                                                    " \xb7 ",
                                                    Math.floor(ch.startClockSec / 60),
                                                    ":00 \xb7 ",
                                                    ch.startUserScore,
                                                    "-",
                                                    ch.startOppScore,
                                                    " vs ",
                                                    opp.code
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-amber-300",
                                                children: [
                                                    "Gold: ",
                                                    ch.objectives.gold
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-slate-300",
                                                children: [
                                                    "Silver: ",
                                                    ch.objectives.silver
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-slate-400",
                                                children: [
                                                    "Bronze: ",
                                                    ch.objectives.bronze
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    return startChapter(ch);
                                },
                                className: "w-full py-2 bg-[#CE1141] hover:bg-rose-600 border border-[#F9A01B]/70 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Play, {
                                        className: "w-3.5 h-3.5 fill-current"
                                    }),
                                    " Play Scenario"
                                ]
                            })
                        ]
                    }, ch.id);
                })
            })
        ]
    });
};

});

})(window.ArcadeMod);
