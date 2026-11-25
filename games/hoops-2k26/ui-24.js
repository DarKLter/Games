(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/nba2k14/components/QuickGameView ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/components/QuickGameView", function(require, module, exports) {
// ============================================================================
// NBA 2K14 — Quick Game Team Selection Screen
// Supports all 30 NBA, 14 Euroleague, 4 Classic & 2 All-Star Teams (Q/E switch)
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "QuickGameView", {
    enumerable: true,
    get: function() {
        return QuickGameView;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _lucidereact = require("lucide-react");
var _Nba2k14Audio = require("../audio/Nba2k14Audio");
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
var LEAGUES = [
    {
        id: 'NBA',
        label: 'NBA (30 Teams)'
    },
    {
        id: 'EUROLEAGUE',
        label: 'Euroleague (14 Teams)'
    },
    {
        id: 'CLASSIC',
        label: 'Classic NBA'
    },
    {
        id: 'ALLSTAR',
        label: 'All-Star'
    }
];
var QuickGameView = function QuickGameView(param) {
    var teams = param.teams, settings = param.settings, onUpdateSettings = param.onUpdateSettings, onStartMatch = param.onStartMatch, onBack = param.onBack;
    var _leagueTeams_, _leagueTeams_1;
    var _useState = (0, _react.useState)('NBA'), league = _useState[0], setLeague = _useState[1];
    var leagueTeams = teams.filter(function(t) {
        return t.league === league;
    });
    var _useState1 = (0, _react.useState)(0), awayIdx = _useState1[0], setAwayIdx = _useState1[1];
    var _useState2 = (0, _react.useState)(1), homeIdx = _useState2[0], setHomeIdx = _useState2[1];
    var _useState3 = (0, _react.useState)('home'), userSide = _useState3[0], setUserSide = _useState3[1];
    var _useState4 = (0, _react.useState)('standard'), jerseyMode = _useState4[0], setJerseyMode = _useState4[1];
    var _useState5 = (0, _react.useState)('nba'), courtEnv = _useState5[0], setCourtEnv = _useState5[1];
    var safeAway = (_leagueTeams_ = leagueTeams[awayIdx % Math.max(1, leagueTeams.length)]) != null ? _leagueTeams_ : teams[0];
    var safeHome = (_leagueTeams_1 = leagueTeams[homeIdx % Math.max(1, leagueTeams.length)]) != null ? _leagueTeams_1 : teams[1];
    (0, _react.useEffect)(function() {
        setAwayIdx(0);
        setHomeIdx(leagueTeams.length > 1 ? 1 : 0);
        if (league === 'EUROLEAGUE') setCourtEnv('euroleague');
        else setCourtEnv('nba');
    }, [
        league,
        leagueTeams.length
    ]);
    // Q / E keyboard league switcher
    (0, _react.useEffect)(function() {
        var onKey = function onKey(e) {
            if (e.code === 'KeyQ') {
                setLeague(function(prev) {
                    var i = LEAGUES.findIndex(function(l) {
                        return l.id === prev;
                    });
                    return LEAGUES[(i - 1 + LEAGUES.length) % LEAGUES.length].id;
                });
            } else if (e.code === 'KeyE') {
                setLeague(function(prev) {
                    var i = LEAGUES.findIndex(function(l) {
                        return l.id === prev;
                    });
                    return LEAGUES[(i + 1) % LEAGUES.length].id;
                });
            }
        };
        window.addEventListener('keydown', onKey);
        return function() {
            return window.removeEventListener('keydown', onKey);
        };
    }, []);
    var cycleAway = function cycleAway(delta) {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('hover');
        setAwayIdx(function(i) {
            return (i + delta + leagueTeams.length) % leagueTeams.length;
        });
    };
    var cycleHome = function cycleHome(delta) {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('hover');
        setHomeIdx(function(i) {
            return (i + delta + leagueTeams.length) % leagueTeams.length;
        });
    };
    var handleTipOff = function handleTipOff() {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        onStartMatch({
            mode: 'quick',
            title: safeAway.code + " @ " + safeHome.code,
            subtitle: safeHome.arenaName,
            homeTeamId: safeHome.id,
            awayTeamId: safeAway.id,
            userSide: userSide,
            courtEnv: courtEnv,
            quarterLengthMin: settings.game.quarterLengthMin,
            playersPerSide: 5,
            fibaRules: league === 'EUROLEAGUE' || courtEnv === 'euroleague',
            jerseyMode: jerseyMode
        });
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "w-full max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "flex flex-wrap items-center justify-between gap-2 bg-[#0f1116]/92 border border-white/15 px-4 py-2.5",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-[10px] font-mono text-slate-400 uppercase mr-1",
                                children: "[Q/E]"
                            }),
                            LEAGUES.map(function(l) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    onClick: function onClick() {
                                        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                        setLeague(l.id);
                                    },
                                    className: "px-3 py-1.5 text-xs font-black uppercase tracking-wider border cursor-pointer " + (league === l.id ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#171a23] border-white/10 text-slate-300 hover:text-white'),
                                    children: l.label
                                }, l.id);
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        onClick: onBack,
                        className: "px-3 py-1.5 bg-[#171a23] hover:bg-[#232836] border border-white/15 text-xs font-bold uppercase cursor-pointer",
                        children: "Back"
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "grid grid-cols-1 lg:grid-cols-[1fr_290px_1fr] gap-3",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "bg-[#0f1116]/94 border border-white/15 p-4 flex flex-col gap-3",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-[11px] font-bold uppercase tracking-widest text-slate-400",
                                        children: "Away Team"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            return setUserSide('away');
                                        },
                                        className: "px-2.5 py-0.5 text-[10px] font-black uppercase border cursor-pointer " + (userSide === 'away' ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#181b25] border-white/15 text-slate-400'),
                                        children: userSide === 'away' ? 'USER CONTROL' : 'CPU'
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p-4 border border-white/15 flex items-center justify-between",
                                style: {
                                    background: "linear-gradient(135deg, " + safeAway.primaryColor + "cc, #11131a)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            return cycleAway(-1);
                                        },
                                        className: "p-2 bg-black/45 hover:bg-black/75 cursor-pointer",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.ChevronLeft, {
                                            className: "w-5 h-5"
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-center",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-xs font-bold uppercase tracking-widest text-white/80",
                                                children: safeAway.city
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-2xl font-black uppercase tracking-tight",
                                                children: safeAway.name
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "mt-1 text-xs font-mono tabular-nums text-[#F9A01B] font-black",
                                                children: [
                                                    "OVR ",
                                                    safeAway.ovr,
                                                    " \xb7 ",
                                                    safeAway.code
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            return cycleAway(1);
                                        },
                                        className: "p-2 bg-black/45 hover:bg-black/75 cursor-pointer",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.ChevronRight, {
                                            className: "w-5 h-5"
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-1",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[10px] font-bold uppercase tracking-widest text-slate-400",
                                        children: "Starting 5"
                                    }),
                                    safeAway.players.slice(0, 5).map(function(p) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center justify-between text-xs px-2.5 py-1.5 bg-[#161923] border border-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    className: "font-semibold",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "text-[#F9A01B] font-mono mr-2",
                                                            children: p.pos
                                                        }),
                                                        "#",
                                                        p.jersey,
                                                        " ",
                                                        p.name
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "font-mono font-black tabular-nums text-white",
                                                    children: p.ovr
                                                })
                                            ]
                                        }, p.id);
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "bg-[#0f1116]/94 border border-[#CE1141]/60 p-4 flex flex-col justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-center border-b border-white/10 pb-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[10px] font-bold uppercase tracking-widest text-[#F9A01B]",
                                                children: "Matchup Hub"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-sm font-black uppercase truncate",
                                                children: safeHome.arenaName
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "block text-[10px] font-bold uppercase text-slate-400 mb-1",
                                                children: "Court Environment"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                value: courtEnv,
                                                onChange: function onChange(e) {
                                                    return setCourtEnv(e.target.value);
                                                },
                                                className: "w-full bg-[#171a23] border border-white/20 px-2.5 py-1.5 text-xs font-bold uppercase",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "nba",
                                                        children: "NBA Regulation Arena"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "euroleague",
                                                        children: "Euroleague FIBA Arena"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "blacktop",
                                                        children: "NBA Blacktop Street Court"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "park",
                                                        children: "The Park Plaza"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "practice",
                                                        children: "Practice Gym"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "block text-[10px] font-bold uppercase text-slate-400 mb-1",
                                                children: "Difficulty"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                value: settings.game.difficulty,
                                                onChange: function onChange(e) {
                                                    return onUpdateSettings(_extends({}, settings, {
                                                        game: _extends({}, settings.game, {
                                                            difficulty: e.target.value
                                                        })
                                                    }));
                                                },
                                                className: "w-full bg-[#171a23] border border-white/20 px-2.5 py-1.5 text-xs font-bold uppercase",
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
                                        className: "grid grid-cols-2 gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                        className: "block text-[10px] font-bold uppercase text-slate-400 mb-1",
                                                        children: "Quarter Min"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                        value: settings.game.quarterLengthMin,
                                                        onChange: function onChange(e) {
                                                            return onUpdateSettings(_extends({}, settings, {
                                                                game: _extends({}, settings.game, {
                                                                    quarterLengthMin: Number(e.target.value)
                                                                })
                                                            }));
                                                        },
                                                        className: "w-full bg-[#171a23] border border-white/20 px-2 py-1.5 text-xs font-bold font-mono",
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
                                                                    " Min"
                                                                ]
                                                            }, m);
                                                        })
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                        className: "block text-[10px] font-bold uppercase text-slate-400 mb-1",
                                                        children: "Jerseys"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                        value: jerseyMode,
                                                        onChange: function onChange(e) {
                                                            return setJerseyMode(e.target.value);
                                                        },
                                                        className: "w-full bg-[#171a23] border border-white/20 px-2 py-1.5 text-xs font-bold uppercase",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                value: "standard",
                                                                children: "Home / Away"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                value: "alternate",
                                                                children: "Alternate"
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                type: "button",
                                onClick: handleTipOff,
                                className: "w-full py-3.5 bg-[#CE1141] bg-gradient-to-r from-[#CE1141] to-[#a10d33] hover:brightness-110 border border-[#F9A01B] text-white text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Play, {
                                        className: "w-4 h-4 fill-current"
                                    }),
                                    " Tip Off"
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "bg-[#0f1116]/94 border border-white/15 p-4 flex flex-col gap-3",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-[11px] font-bold uppercase tracking-widest text-slate-400",
                                        children: "Home Team"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            return setUserSide('home');
                                        },
                                        className: "px-2.5 py-0.5 text-[10px] font-black uppercase border cursor-pointer " + (userSide === 'home' ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#181b25] border-white/15 text-slate-400'),
                                        children: userSide === 'home' ? 'USER CONTROL' : 'CPU'
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p-4 border border-white/15 flex items-center justify-between",
                                style: {
                                    background: "linear-gradient(135deg, " + safeHome.primaryColor + "cc, #11131a)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            return cycleHome(-1);
                                        },
                                        className: "p-2 bg-black/45 hover:bg-black/75 cursor-pointer",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.ChevronLeft, {
                                            className: "w-5 h-5"
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-center",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-xs font-bold uppercase tracking-widest text-white/80",
                                                children: safeHome.city
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-2xl font-black uppercase tracking-tight",
                                                children: safeHome.name
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "mt-1 text-xs font-mono tabular-nums text-[#F9A01B] font-black",
                                                children: [
                                                    "OVR ",
                                                    safeHome.ovr,
                                                    " \xb7 ",
                                                    safeHome.code
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            return cycleHome(1);
                                        },
                                        className: "p-2 bg-black/45 hover:bg-black/75 cursor-pointer",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.ChevronRight, {
                                            className: "w-5 h-5"
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-1",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[10px] font-bold uppercase tracking-widest text-slate-400",
                                        children: "Starting 5"
                                    }),
                                    safeHome.players.slice(0, 5).map(function(p) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center justify-between text-xs px-2.5 py-1.5 bg-[#161923] border border-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    className: "font-semibold",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "text-[#F9A01B] font-mono mr-2",
                                                            children: p.pos
                                                        }),
                                                        "#",
                                                        p.jersey,
                                                        " ",
                                                        p.name
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "font-mono font-black tabular-nums text-white",
                                                    children: p.ovr
                                                })
                                            ]
                                        }, p.id);
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
// === MODULE: src/games/hoops-2k26/nba2k14/components/TheParkView ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/components/TheParkView", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TheParkView", {
    enumerable: true,
    get: function() {
        return TheParkView;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _lucidereact = require("lucide-react");
var _Nba2k14Audio = require("../audio/Nba2k14Audio");
var _modesData = require("../data/modesData");
var _rosters = require("../data/rosters");
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
var TheParkView = function TheParkView(param) {
    var save = param.save, onStartMatch = param.onStartMatch;
    var _ref;
    var _PARK_REP_TIERS_filter_slice_;
    var _useState = (0, _react.useState)({
        x: 50,
        y: 52
    }), avatarPos = _useState[0], setAvatarPos = _useState[1];
    var _useState1 = (0, _react.useState)(null), targetPos = _useState1[0], setTargetPos = _useState1[1];
    var _useState2 = (0, _react.useState)(_modesData.PARK_COURTS[5].id), selectedCourtId = _useState2[0], setSelectedCourtId = _useState2[1];
    var keysRef = (0, _react.useRef)(new Set());
    var selectedCourt = (0, _react.useMemo)(function() {
        var _PARK_COURTS_find;
        return (_PARK_COURTS_find = _modesData.PARK_COURTS.find(function(c) {
            return c.id === selectedCourtId;
        })) != null ? _PARK_COURTS_find : _modesData.PARK_COURTS[0];
    }, [
        selectedCourtId
    ]);
    var repTier = (0, _modesData.getParkRepTier)(save.vip.parkRep);
    var nextTier = _modesData.PARK_REP_TIERS.find(function(t) {
        return t.minRep > save.vip.parkRep;
    });
    var prevMin = (_ref = (_PARK_REP_TIERS_filter_slice_ = _modesData.PARK_REP_TIERS.filter(function(t) {
        return t.minRep <= save.vip.parkRep;
    }).slice(-1)[0]) == null ? void 0 : _PARK_REP_TIERS_filter_slice_.minRep) != null ? _ref : 0;
    var repPct = nextTier ? Math.min(100, Math.round((save.vip.parkRep - prevMin) / Math.max(1, nextTier.minRep - prevMin) * 100)) : 100;
    var parkLeaderboard = (0, _react.useMemo)(function() {
        return [
            {
                name: 'Venice_King6',
                rep: 18420,
                wins: 142,
                streak: 9
            },
            {
                name: 'RuckerGod_2K',
                rep: 14950,
                wins: 118,
                streak: 6
            },
            {
                name: 'DadeCountyFlash',
                rep: 11200,
                wins: 94,
                streak: 5
            },
            {
                name: "" + save.vip.name + " (YOU)",
                rep: save.vip.parkRep,
                wins: save.vip.parkWins,
                streak: save.vip.parkStreak
            }
        ].sort(function(a, b) {
            return b.rep - a.rep;
        });
    }, [
        save.vip.name,
        save.vip.parkRep,
        save.vip.parkWins,
        save.vip.parkStreak
    ]);
    var launchParkCourt = function launchParkCourt(courtId) {
        var _PARK_COURTS_find;
        var court = (_PARK_COURTS_find = _modesData.PARK_COURTS.find(function(c) {
            return c.id === courtId;
        })) != null ? _PARK_COURTS_find : selectedCourt;
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        var pool = (0, _rosters.getAllPlayers)().filter(function(p) {
            return p.ovr >= 78 && p.ovr <= 92;
        });
        var pickSquad = function pickSquad(count, offset, includeMyPlayer) {
            var _loop = function(i) {
                var cand = pool[(offset + i * 7) % pool.length];
                if (!list.some(function(p) {
                    return p.id === cand.id;
                })) list.push(cand);
            };
            var list = [];
            if (includeMyPlayer) list.push(save.myCareer.player);
            for(var i = 0; list.length < count && i < pool.length; i++)_loop(i);
            return list;
        };
        var seed = court.playersPerSide * 13 + court.streak * 5;
        onStartMatch({
            mode: 'park',
            title: "THE PARK \xb7 " + court.name,
            subtitle: court.format + " Streetball \xb7 Game to " + court.targetScore + " (Win by 2) \xb7 vs " + court.squadName,
            homeTeamId: save.myCareer.teamId || 'mia',
            awayTeamId: 'lac',
            homeCustomPlayers: pickSquad(court.playersPerSide, seed, true),
            awayCustomPlayers: pickSquad(court.playersPerSide, seed + 19, false),
            userSide: 'home',
            courtEnv: 'park',
            quarterLengthMin: 12,
            targetScore: court.targetScore,
            halfCourt: court.halfCourt,
            playersPerSide: court.playersPerSide,
            parkCourtId: court.id
        });
    };
    // Walkable avatar loop (WASD / Arrow keys + click-to-walk onto GOT NEXT pad)
    (0, _react.useEffect)(function() {
        var onDown = function onDown(e) {
            return keysRef.current.add(e.code);
        };
        var onUp = function onUp(e) {
            return keysRef.current.delete(e.code);
        };
        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup', onUp);
        var raf = 0;
        var last = performance.now();
        var tick = function tick1(now) {
            var dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            var keys = keysRef.current;
            var vx = 0;
            var vy = 0;
            if (keys.has('KeyW') || keys.has('ArrowUp')) vy -= 1;
            if (keys.has('KeyS') || keys.has('ArrowDown')) vy += 1;
            if (keys.has('KeyA') || keys.has('ArrowLeft')) vx -= 1;
            if (keys.has('KeyD') || keys.has('ArrowRight')) vx += 1;
            if (vx !== 0 || vy !== 0) {
                var len = Math.hypot(vx, vy);
                setTargetPos(null);
                setAvatarPos(function(prev) {
                    var nx = Math.max(6, Math.min(94, prev.x + vx / len * 28 * dt));
                    var ny = Math.max(8, Math.min(92, prev.y + vy / len * 28 * dt));
                    var near = _modesData.PARK_COURTS.find(function(c) {
                        return Math.hypot(c.gotNextX - nx, c.gotNextY - ny) < 8;
                    });
                    if (near) setSelectedCourtId(near.id);
                    return {
                        x: nx,
                        y: ny
                    };
                });
            } else if (targetPos) {
                setAvatarPos(function(prev) {
                    var dx = targetPos.x - prev.x;
                    var dy = targetPos.y - prev.y;
                    var dist = Math.hypot(dx, dy);
                    if (dist < 1.2) {
                        var arriveCourtId = targetPos.courtId;
                        setTargetPos(null);
                        if (arriveCourtId) {
                            setSelectedCourtId(arriveCourtId);
                        }
                        return {
                            x: targetPos.x,
                            y: targetPos.y
                        };
                    }
                    var step = Math.min(dist, 42 * dt);
                    return {
                        x: prev.x + dx / dist * step,
                        y: prev.y + dy / dist * step
                    };
                });
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return function() {
            cancelAnimationFrame(raf);
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
        };
    }, [
        targetPos
    ]);
    var walkToCourt = function walkToCourt(courtId) {
        var court = _modesData.PARK_COURTS.find(function(c) {
            return c.id === courtId;
        });
        if (!court) return;
        _Nba2k14Audio.Nba2k14Audio.playUiClick('hover');
        setSelectedCourtId(court.id);
        setTargetPos({
            x: court.gotNextX,
            y: court.gotNextY,
            courtId: court.id
        });
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h-full flex flex-col px-5 py-3 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl px-5 py-3 mb-3 flex flex-wrap items-center justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "text-[11px] font-black uppercase tracking-[0.2em] text-[#F9A01B]",
                                children: "NBA 2K14 \xb7 OPEN-AIR BLACKTOP PLAZA"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                className: "text-xl font-black text-white uppercase",
                                children: "THE PARK \xb7 GOT NEXT STREETBALL"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-5",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between gap-4 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "font-black text-[#F9A01B] uppercase",
                                                children: repTier
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-zinc-400 font-bold",
                                                children: [
                                                    save.vip.parkRep.toLocaleString(),
                                                    " REP"
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "w-44 h-2 bg-zinc-800 rounded-full overflow-hidden mt-1",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h-full bg-gradient-to-r from-[#CE1141] to-[#F9A01B]",
                                            style: {
                                                width: "" + repPct + "%"
                                            }
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "text-xs text-right",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-white font-black",
                                        children: [
                                            save.vip.parkWins,
                                            "W - ",
                                            save.vip.parkLosses,
                                            "L"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-[#F9A01B] font-bold flex items-center justify-end gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Flame, {
                                                className: "w-3.5 h-3.5"
                                            }),
                                            " Streak: ",
                                            save.vip.parkStreak
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "lg:col-span-2 relative bg-[#11161d] border border-white/15 rounded-xl overflow-hidden select-none min-h-[340px]",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "absolute inset-0",
                                style: {
                                    background: 'radial-gradient(circle at 50% 45%, #27222b 0%, #171a22 55%, #0d1016 100%)'
                                }
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "absolute left-0 right-0 top-[49%] h-10 bg-zinc-900/70 border-y border-white/10"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "absolute top-0 bottom-0 left-[34%] w-6 bg-zinc-900/60"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "absolute top-0 bottom-0 left-[64%] w-6 bg-zinc-900/60"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "absolute top-2.5 left-3 z-10 px-2.5 py-1 rounded bg-black/70 border border-white/10 text-[10px] font-bold text-zinc-300 uppercase",
                                children: "Move Avatar: WASD / Arrows or Click any Court / GOT NEXT Circle"
                            }),
                            _modesData.PARK_COURTS.map(function(court) {
                                var active = selectedCourtId === court.id;
                                var isKing = court.format === '5v5';
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_react.default.Fragment, {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                            onClick: function onClick() {
                                                return walkToCourt(court.id);
                                            },
                                            style: {
                                                left: "" + court.xPct + "%",
                                                top: "" + court.yPct + "%",
                                                transform: 'translate(-50%, -50%)'
                                            },
                                            className: "absolute rounded-lg border-2 transition cursor-pointer flex flex-col items-center justify-center " + (isKing ? 'w-44 h-24' : 'w-36 h-20') + " " + (active ? 'bg-[#2a171c] border-[#F9A01B] shadow-[0_0_24px_rgba(249,160,27,0.35)]' : 'bg-[#1a222d] border-white/20 hover:border-white/50'),
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-[10px] font-black uppercase tracking-wider text-[#F9A01B]",
                                                    children: [
                                                        court.format,
                                                        " \xb7 TO ",
                                                        court.targetScore
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-xs font-black text-white leading-tight px-1 text-center",
                                                    children: court.name
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "mt-1 flex items-center gap-2 text-[10px] font-bold text-zinc-300",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            className: "text-amber-300",
                                                            children: [
                                                                court.streak,
                                                                "W STREAK"
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            children: [
                                                                "OVR ",
                                                                court.oppOvr
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            onClick: function onClick() {
                                                return walkToCourt(court.id);
                                            },
                                            style: {
                                                left: "" + court.gotNextX + "%",
                                                top: "" + court.gotNextY + "%",
                                                transform: 'translate(-50%, -50%)'
                                            },
                                            className: "absolute px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border cursor-pointer transition " + (active ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-black/80 border-emerald-400/70 text-emerald-300 hover:bg-emerald-900/60'),
                                            children: "GOT NEXT"
                                        })
                                    ]
                                }, court.id);
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                style: {
                                    left: "" + avatarPos.x + "%",
                                    top: "" + avatarPos.y + "%",
                                    transform: 'translate(-50%, -50%)'
                                },
                                className: "absolute z-20 pointer-events-none flex flex-col items-center",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "px-2 py-0.5 rounded bg-black/85 border border-[#F9A01B] text-[9px] font-black text-[#F9A01B] whitespace-nowrap mb-0.5",
                                        children: [
                                            save.myCareer.player.name,
                                            " (",
                                            save.myCareer.player.ovr,
                                            ")"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "w-7 h-7 rounded-full bg-[#CE1141] border-2 border-[#F9A01B] flex items-center justify-center text-white font-black text-[10px] shadow-lg",
                                        children: [
                                            "#",
                                            save.myCareer.player.jersey
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex flex-col gap-3 overflow-y-auto",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-[11px] font-black uppercase tracking-wider text-[#F9A01B] flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.MapPin, {
                                                        className: "w-3.5 h-3.5"
                                                    }),
                                                    " Selected Court"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "px-2 py-0.5 rounded bg-[#CE1141]/25 border border-[#CE1141] text-white text-[10px] font-black",
                                                children: selectedCourt.format
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                        className: "text-lg font-black text-white mt-1",
                                        children: selectedCourt.name
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("p", {
                                        className: "text-xs text-zinc-400 mt-1",
                                        children: [
                                            "Defending Squad: ",
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                className: "text-white",
                                                children: selectedCourt.squadName
                                            }),
                                            " (",
                                            selectedCourt.streak,
                                            "-Game Win Streak \xb7 Avg ",
                                            selectedCourt.oppOvr,
                                            " OVR)"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "grid grid-cols-2 gap-2 my-3 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "bg-[#151820] border border-white/10 rounded-lg p-2.5",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[10px] text-zinc-400 uppercase font-bold",
                                                        children: "Rules"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "font-bold text-white",
                                                        children: [
                                                            "Game to ",
                                                            selectedCourt.targetScore,
                                                            " \xb7 1s & 2s"
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "bg-[#151820] border border-white/10 rounded-lg p-2.5",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[10px] text-zinc-400 uppercase font-bold",
                                                        children: "Court Format"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "font-bold text-white",
                                                        children: selectedCourt.halfCourt ? 'Half-Court' : 'Full-Court 5v5'
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        onClick: function onClick() {
                                            return launchParkCourt(selectedCourt.id);
                                        },
                                        className: "w-full py-3 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Play, {
                                                className: "w-4 h-4 fill-current"
                                            }),
                                            " Step On GOT NEXT & Tip Off"
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-4 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-xs font-black uppercase tracking-wider text-[#F9A01B] mb-2.5 flex items-center gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Trophy, {
                                                className: "w-3.5 h-3.5"
                                            }),
                                            " Park REP Leaderboard"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "space-y-2",
                                        children: parkLeaderboard.map(function(row, idx) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "rounded-lg px-3 py-2 border flex items-center justify-between text-xs " + (row.name.includes('(YOU)') ? 'bg-[#1d1714] border-[#F9A01B]/60' : 'bg-[#151820] border-white/10'),
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                className: "font-black text-zinc-400",
                                                                children: [
                                                                    "#",
                                                                    idx + 1
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "font-bold text-white",
                                                                children: row.name
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "text-right",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                className: "font-black text-[#F9A01B]",
                                                                children: [
                                                                    row.rep.toLocaleString(),
                                                                    " REP"
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                className: "ml-2 text-zinc-400",
                                                                children: [
                                                                    row.wins,
                                                                    "W"
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }, row.name);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "mt-3 pt-3 border-t border-white/10 text-[11px] text-zinc-400 flex items-center gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Users, {
                                                className: "w-3.5 h-3.5 text-emerald-400"
                                            }),
                                            "All 6 courts live: 2x 2v2 \xb7 3x 3v3 \xb7 1x 5v5 King of the Court"
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
// === MODULE: src/games/hoops-2k26/nba2k14/components/VipNavDrawer ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/components/VipNavDrawer", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VipNavDrawer", {
    enumerable: true,
    get: function() {
        return VipNavDrawer;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _lucidereact = require("lucide-react");
var _Nba2k14Audio = require("../audio/Nba2k14Audio");
var _modesData = require("../data/modesData");
var _rosters = require("../data/rosters");
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
var HOT_ZONE_COORDS = {
    restricted: {
        x: 160,
        y: 48,
        r: 16
    },
    paint: {
        x: 160,
        y: 84,
        r: 16
    },
    paint_l: {
        x: 122,
        y: 78,
        r: 14
    },
    paint_r: {
        x: 198,
        y: 78,
        r: 14
    },
    mid_l_base: {
        x: 74,
        y: 48,
        r: 15
    },
    mid_r_base: {
        x: 246,
        y: 48,
        r: 15
    },
    mid_l_wing: {
        x: 88,
        y: 112,
        r: 16
    },
    mid_r_wing: {
        x: 232,
        y: 112,
        r: 16
    },
    mid_top: {
        x: 160,
        y: 132,
        r: 16
    },
    three_l_corner: {
        x: 28,
        y: 46,
        r: 15
    },
    three_r_corner: {
        x: 292,
        y: 46,
        r: 15
    },
    three_l_wing: {
        x: 52,
        y: 142,
        r: 17
    },
    three_r_wing: {
        x: 268,
        y: 142,
        r: 17
    },
    three_top: {
        x: 160,
        y: 178,
        r: 18
    }
};
var VipNavDrawer = function VipNavDrawer(param) {
    var open = param.open, save = param.save, onClose = param.onClose, onUpdateSave = param.onUpdateSave;
    var _ref, _ref1, _ref2, _ref3;
    var _vip_hotZones_selectedZone, _vip_hotZones_selectedZone1, _vip_hotZones_selectedZone2, _vip_hotZones_selectedZone3;
    var _useState = (0, _react.useState)('overview'), tab = _useState[0], setTab = _useState[1];
    var _useState1 = (0, _react.useState)('three_top'), selectedZone = _useState1[0], setSelectedZone = _useState1[1];
    var _useState2 = (0, _react.useState)(''), importText = _useState2[0], setImportText = _useState2[1];
    var _useState3 = (0, _react.useState)(null), saveMsg = _useState3[0], setSaveMsg = _useState3[1];
    if (!open) return null;
    var vip = save.vip;
    var winPct = vip.gamesPlayed > 0 ? Math.round(vip.wins / vip.gamesPlayed * 100) : 0;
    var avgPts = vip.gamesPlayed > 0 ? (vip.totalPoints / vip.gamesPlayed).toFixed(1) : '0.0';
    var avgAst = vip.gamesPlayed > 0 ? (vip.totalAst / vip.gamesPlayed).toFixed(1) : '0.0';
    var avgReb = vip.gamesPlayed > 0 ? (vip.totalReb / vip.gamesPlayed).toFixed(1) : '0.0';
    var greenPct = vip.totalShots > 0 ? Math.round(vip.excellentReleases / vip.totalShots * 100) : 0;
    // 6-axis radar stats (0..100)
    var insidePct = vip.insideAtt > 0 ? Math.round(vip.insideMade / vip.insideAtt * 100) : 58;
    var midPct = vip.midAtt > 0 ? Math.round(vip.midMade / vip.midAtt * 100) : 45;
    var threePct = vip.threeAtt > 0 ? Math.round(vip.threeMade / vip.threeAtt * 100) : 39;
    var radarAxes = [
        {
            label: 'Inside',
            val: insidePct
        },
        {
            label: 'Mid-Range',
            val: midPct
        },
        {
            label: '3PT%',
            val: Math.min(100, threePct * 1.4)
        },
        {
            label: 'Green Rel',
            val: Math.max(25, greenPct)
        },
        {
            label: 'Fastbreak',
            val: Math.min(100, 35 + vip.fastbreakPts)
        },
        {
            label: 'Win %',
            val: Math.max(30, winPct)
        }
    ];
    var radarPoints = radarAxes.map(function(ax, i) {
        var ang = Math.PI * 2 * i / radarAxes.length - Math.PI / 2;
        var r = ax.val / 100 * 78;
        return 110 + Math.cos(ang) * r + "," + (110 + Math.sin(ang) * r);
    }).join(' ');
    var getZoneFill = function getZoneFill(id) {
        var _vip_hotZones_id;
        var rec = (_vip_hotZones_id = vip.hotZones[id]) != null ? _vip_hotZones_id : {
            made: 0,
            att: 0
        };
        if (rec.att < 2) return '#3f4654';
        var pct = rec.made / rec.att;
        var isThree = id.startsWith('three');
        var hotThreshold = isThree ? 0.4 : 0.52;
        var coldThreshold = isThree ? 0.25 : 0.35;
        if (pct >= hotThreshold) return '#CE1141';
        if (pct <= coldThreshold) return '#2563EB';
        return '#6b7280';
    };
    var handleExportSave = function handleExportSave() {
        var blob = new Blob([
            JSON.stringify(save, null, 2)
        ], {
            type: 'application/json'
        });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "nba2k14_vip_" + vip.name.toLowerCase() + ".json";
        a.click();
        URL.revokeObjectURL(url);
        setSaveMsg('Exported VIP Save JSON file.');
    };
    var handleImportSave = function handleImportSave() {
        try {
            var parsed = JSON.parse(importText);
            if (!parsed.vip || !parsed.settings) throw new Error('Invalid');
            onUpdateSave(function() {
                return parsed;
            });
            setSaveMsg('Successfully imported VIP Save JSON!');
            setImportText('');
        } catch (unused) {
            setSaveMsg('Invalid JSON format. Paste a valid exported NBA 2K14 save.');
        }
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "fixed inset-0 z-50 bg-black/75 flex justify-end",
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "w-full max-w-2xl h-full bg-[#0d0f14] border-l border-white/15 flex flex-col shadow-2xl",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "px-5 py-4 border-b border-white/15 flex items-center justify-between bg-[#13161e]",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "text-[10px] font-black uppercase tracking-[0.22em] text-[#F9A01B]",
                                    children: "2K NAV \xb7 VIP SYSTEM"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("h2", {
                                    className: "text-xl font-black text-white uppercase",
                                    children: [
                                        vip.name,
                                        " \xb7 VIP PROFILE"
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            onClick: function onClick() {
                                _Nba2k14Audio.Nba2k14Audio.playUiClick('back');
                                onClose();
                            },
                            className: "p-2 rounded-lg bg-[#1c202a] hover:bg-[#2a3040] text-zinc-300 cursor-pointer",
                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.X, {
                                className: "w-5 h-5"
                            })
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "px-5 py-2.5 border-b border-white/10 flex flex-wrap gap-1.5 bg-[#10131a]",
                    children: [
                        {
                            id: 'overview',
                            label: 'VIP Overview',
                            icon: _lucidereact.User
                        },
                        {
                            id: 'radar',
                            label: 'Tendencies',
                            icon: _lucidereact.Shield
                        },
                        {
                            id: 'hotzones',
                            label: '14-Zone Chart',
                            icon: _lucidereact.Target
                        },
                        {
                            id: 'trophies',
                            label: "Trophies (" + vip.unlockedAchievements.length + "/25)",
                            icon: _lucidereact.Award
                        },
                        {
                            id: 'save',
                            label: 'Save Manager',
                            icon: _lucidereact.Download
                        }
                    ].map(function(t) {
                        var Icon = t.icon;
                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                            onClick: function onClick() {
                                _Nba2k14Audio.Nba2k14Audio.playUiClick('back');
                                setTab(t.id);
                            },
                            className: "px-3 py-1.5 rounded-lg text-[11px] font-black uppercase flex items-center gap-1.5 cursor-pointer " + (tab === t.id ? 'bg-[#CE1141] text-white' : 'bg-[#171a22] text-zinc-400 hover:text-white'),
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)(Icon, {
                                    className: "w-3.5 h-3.5"
                                }),
                                " ",
                                t.label
                            ]
                        }, t.id);
                    })
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex-1 overflow-y-auto p-5 space-y-4",
                    children: [
                        tab === 'overview' && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "grid grid-cols-2 gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                    className: "text-[10px] font-bold uppercase text-zinc-400",
                                                    children: "VIP Display Name"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    value: vip.name,
                                                    onChange: function onChange(e) {
                                                        return onUpdateSave(function(prev) {
                                                            return _extends({}, prev, {
                                                                vip: _extends({}, prev.vip, {
                                                                    name: e.target.value.slice(0, 18)
                                                                })
                                                            });
                                                        });
                                                    },
                                                    className: "mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-black text-white"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                    className: "text-[10px] font-bold uppercase text-zinc-400",
                                                    children: "Favorite Franchise Crest"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                    value: vip.favTeamId,
                                                    onChange: function onChange(e) {
                                                        var team = _rosters.NBA_TEAMS.find(function(t) {
                                                            return t.id === e.target.value;
                                                        });
                                                        onUpdateSave(function(prev) {
                                                            var _ref;
                                                            return _extends({}, prev, {
                                                                vip: _extends({}, prev.vip, {
                                                                    favTeamId: e.target.value,
                                                                    avatarCrest: (_ref = team == null ? void 0 : team.code) != null ? _ref : 'MIA'
                                                                })
                                                            });
                                                        });
                                                    },
                                                    className: "mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-bold text-white",
                                                    children: _rosters.NBA_TEAMS.map(function(t) {
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
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "grid grid-cols-3 gap-3",
                                    children: [
                                        {
                                            label: 'Record',
                                            val: vip.wins + "W - " + vip.losses + "L"
                                        },
                                        {
                                            label: 'Win %',
                                            val: "" + winPct + "%"
                                        },
                                        {
                                            label: 'Best Streak',
                                            val: "" + vip.bestWinStreak + "W"
                                        },
                                        {
                                            label: 'Virtual Currency',
                                            val: "" + vip.vc.toLocaleString() + " VC",
                                            gold: true
                                        },
                                        {
                                            label: 'Skill Points',
                                            val: "" + vip.sp.toLocaleString() + " SP"
                                        },
                                        {
                                            label: 'MyTEAM Points',
                                            val: "" + vip.mt.toLocaleString() + " MT"
                                        },
                                        {
                                            label: 'Avg PPG',
                                            val: avgPts
                                        },
                                        {
                                            label: 'Avg RPG / APG',
                                            val: avgReb + " / " + avgAst
                                        },
                                        {
                                            label: 'Park REP Tier',
                                            val: (0, _modesData.getParkRepTier)(vip.parkRep),
                                            gold: true
                                        }
                                    ].map(function(c) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "bg-[#151820] border border-white/10 rounded-xl p-3",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-[10px] uppercase text-zinc-400 font-bold",
                                                    children: c.label
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-base font-black mt-0.5 " + (c.gold ? 'text-[#F9A01B]' : 'text-white'),
                                                    children: c.val
                                                })
                                            ]
                                        }, c.label);
                                    })
                                })
                            ]
                        }),
                        tab === 'radar' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "bg-[#151820] border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-6",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
                                    viewBox: "0 0 220 220",
                                    className: "w-56 h-56 shrink-0",
                                    children: [
                                        [
                                            25,
                                            50,
                                            75,
                                            100
                                        ].map(function(ring) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                                                cx: 110,
                                                cy: 110,
                                                r: ring / 100 * 78,
                                                fill: "none",
                                                stroke: "rgba(255,255,255,0.12)",
                                                strokeWidth: 1
                                            }, ring);
                                        }),
                                        radarAxes.map(function(ax, i) {
                                            var ang = Math.PI * 2 * i / radarAxes.length - Math.PI / 2;
                                            var lx = 110 + Math.cos(ang) * 95;
                                            var ly = 110 + Math.sin(ang) * 95;
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("g", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("line", {
                                                        x1: 110,
                                                        y1: 110,
                                                        x2: 110 + Math.cos(ang) * 78,
                                                        y2: 110 + Math.sin(ang) * 78,
                                                        stroke: "rgba(255,255,255,0.12)"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("text", {
                                                        x: lx,
                                                        y: ly,
                                                        textAnchor: "middle",
                                                        dominantBaseline: "middle",
                                                        fill: "#e4e4e7",
                                                        fontSize: "9",
                                                        fontWeight: "bold",
                                                        children: ax.label
                                                    })
                                                ]
                                            }, ax.label);
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("polygon", {
                                            points: radarPoints,
                                            fill: "rgba(206, 17, 65, 0.35)",
                                            stroke: "#F9A01B",
                                            strokeWidth: 2
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex-1 space-y-2 w-full text-xs",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-xs font-black uppercase text-[#F9A01B] mb-2",
                                            children: "User Shooting & Tendency Breakdown"
                                        }),
                                        [
                                            {
                                                label: 'Inside FG%',
                                                val: vip.insideMade + "/" + vip.insideAtt + " (" + insidePct + "%)"
                                            },
                                            {
                                                label: 'Mid-Range FG%',
                                                val: vip.midMade + "/" + vip.midAtt + " (" + midPct + "%)"
                                            },
                                            {
                                                label: '3PT FG%',
                                                val: vip.threeMade + "/" + vip.threeAtt + " (" + threePct + "%)"
                                            },
                                            {
                                                label: 'Excellent Green Release %',
                                                val: greenPct + "% (" + vip.excellentReleases + "/" + vip.totalShots + ")"
                                            },
                                            {
                                                label: 'Total Fastbreak Pts',
                                                val: "" + vip.fastbreakPts + " PTS"
                                            },
                                            {
                                                label: 'Total Paint Pts',
                                                val: "" + vip.paintPts + " PTS"
                                            }
                                        ].map(function(row) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex justify-between border-b border-white/10 pb-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-zinc-400",
                                                        children: row.label
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "font-black text-white",
                                                        children: row.val
                                                    })
                                                ]
                                            }, row.label);
                                        })
                                    ]
                                })
                            ]
                        }),
                        tab === 'hotzones' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "bg-[#151820] border border-white/10 rounded-xl p-4",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex items-center justify-between mb-3",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-xs font-black uppercase text-[#F9A01B]",
                                            children: "Official 14-Zone NBA Hot Zone Shot Chart"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex gap-3 text-[10px] font-bold",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "text-[#CE1141]",
                                                    children: "■ HOT"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "text-zinc-400",
                                                    children: "■ NEUTRAL"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "text-blue-400",
                                                    children: "■ COLD"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex flex-col sm:flex-row items-center gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
                                            viewBox: "0 0 320 210",
                                            className: "w-full max-w-[320px] bg-[#1a1612] border border-white/15 rounded-lg",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                                                    x: 8,
                                                    y: 8,
                                                    width: 304,
                                                    height: 194,
                                                    fill: "none",
                                                    stroke: "rgba(255,255,255,0.22)",
                                                    strokeWidth: 1.5
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                                                    x: 115,
                                                    y: 8,
                                                    width: 90,
                                                    height: 105,
                                                    fill: "none",
                                                    stroke: "rgba(255,255,255,0.25)",
                                                    strokeWidth: 1.5
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                                                    d: "M 38 8 L 38 78 A 126 126 0 0 0 282 78 L 282 8",
                                                    fill: "none",
                                                    stroke: "#F9A01B",
                                                    strokeWidth: 1.5
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                                                    cx: 160,
                                                    cy: 32,
                                                    r: 8,
                                                    fill: "none",
                                                    stroke: "#CE1141",
                                                    strokeWidth: 2
                                                }),
                                                _modesData.ALL_HOT_ZONE_IDS.map(function(zid) {
                                                    var _vip_hotZones_zid;
                                                    var pos = HOT_ZONE_COORDS[zid];
                                                    var rec = (_vip_hotZones_zid = vip.hotZones[zid]) != null ? _vip_hotZones_zid : {
                                                        made: 0,
                                                        att: 0
                                                    };
                                                    var pct = rec.att > 0 ? Math.round(rec.made / rec.att * 100) : 0;
                                                    var active = selectedZone === zid;
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("g", {
                                                        onClick: function onClick() {
                                                            return setSelectedZone(zid);
                                                        },
                                                        className: "cursor-pointer",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                                                                cx: pos.x,
                                                                cy: pos.y,
                                                                r: pos.r,
                                                                fill: getZoneFill(zid),
                                                                fillOpacity: 0.82,
                                                                stroke: active ? '#F9A01B' : '#ffffff',
                                                                strokeWidth: active ? 2.5 : 1
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("text", {
                                                                x: pos.x,
                                                                y: pos.y + 3,
                                                                textAnchor: "middle",
                                                                fill: "#ffffff",
                                                                fontSize: "8.5",
                                                                fontWeight: "900",
                                                                children: rec.att > 0 ? "" + pct + "%" : '--'
                                                            })
                                                        ]
                                                    }, zid);
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex-1 w-full bg-[#10131a] border border-white/10 rounded-lg p-3.5 text-xs space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-[10px] font-black uppercase text-[#F9A01B]",
                                                    children: "Zone Detail"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-base font-black text-white",
                                                    children: _modesData.HOT_ZONE_LABELS[selectedZone]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-zinc-300",
                                                    children: [
                                                        "Made / Attempts:",
                                                        ' ',
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                            className: "text-white",
                                                            children: [
                                                                (_ref = (_vip_hotZones_selectedZone = vip.hotZones[selectedZone]) == null ? void 0 : _vip_hotZones_selectedZone.made) != null ? _ref : 0,
                                                                " / ",
                                                                (_ref1 = (_vip_hotZones_selectedZone1 = vip.hotZones[selectedZone]) == null ? void 0 : _vip_hotZones_selectedZone1.att) != null ? _ref1 : 0
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-zinc-300",
                                                    children: [
                                                        "FG%:",
                                                        ' ',
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                            className: "text-[#F9A01B]",
                                                            children: ((_ref2 = (_vip_hotZones_selectedZone2 = vip.hotZones[selectedZone]) == null ? void 0 : _vip_hotZones_selectedZone2.att) != null ? _ref2 : 0) > 0 ? "" + Math.round(((_ref3 = (_vip_hotZones_selectedZone3 = vip.hotZones[selectedZone]) == null ? void 0 : _vip_hotZones_selectedZone3.made) != null ? _ref3 : 0) / vip.hotZones[selectedZone].att * 100) + "%" : 'No attempts logged yet'
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                    className: "text-[11px] text-zinc-400 pt-1",
                                                    children: "Every user shot attempted in any 3D match automatically updates this live 14-zone chart."
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        tab === 'trophies' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5",
                            children: _modesData.ACHIEVEMENTS_25.map(function(ach) {
                                var unlocked = vip.unlockedAchievements.includes(ach.id);
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "rounded-xl p-3 border flex items-start gap-3 " + (unlocked ? 'bg-[#1c1712] border-[#F9A01B]/60' : 'bg-[#151820] border-white/10 opacity-70'),
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.CheckCircle2, {
                                            className: "w-5 h-5 shrink-0 mt-0.5 " + (unlocked ? 'text-[#F9A01B]' : 'text-zinc-600')
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-xs font-black text-white",
                                                    children: ach.title
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-[11px] text-zinc-400 mt-0.5",
                                                    children: ach.desc
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-[10px] font-black text-[#F9A01B] mt-1",
                                                    children: [
                                                        "+",
                                                        ach.vcReward,
                                                        " VC"
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }, ach.id);
                            })
                        }),
                        tab === 'save' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "space-y-4",
                            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#151820] border border-white/10 rounded-xl p-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-xs font-black uppercase text-[#F9A01B] mb-2",
                                        children: "Backup & Restore VIP Save"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex flex-wrap gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                onClick: handleExportSave,
                                                className: "px-4 py-2 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Download, {
                                                        className: "w-3.5 h-3.5"
                                                    }),
                                                    " Export Save JSON"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    onUpdateSave(function() {
                                                        return (0, _storage.createDefaultSaveData)();
                                                    });
                                                    setSaveMsg('VIP Profile reset to fresh defaults.');
                                                },
                                                className: "px-4 py-2 rounded-lg bg-[#1c202a] hover:bg-red-900/50 border border-white/15 text-red-300 font-bold text-xs uppercase cursor-pointer",
                                                children: "Reset VIP Profile"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("textarea", {
                                        value: importText,
                                        onChange: function onChange(e) {
                                            return setImportText(e.target.value);
                                        },
                                        placeholder: "Paste exported NBA 2K14 Save JSON here to restore...",
                                        rows: 4,
                                        className: "mt-3 w-full bg-[#0d0f14] border border-white/15 rounded-lg p-2.5 text-xs text-zinc-200 font-mono"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        onClick: handleImportSave,
                                        className: "mt-2 px-4 py-2 rounded-lg bg-[#F9A01B] text-black font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Upload, {
                                                className: "w-3.5 h-3.5"
                                            }),
                                            " Import JSON Save"
                                        ]
                                    }),
                                    saveMsg && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "mt-2 text-xs font-bold text-emerald-400",
                                        children: saveMsg
                                    })
                                ]
                            })
                        })
                    ]
                })
            ]
        })
    });
};

});

})(window.ArcadeMod);
