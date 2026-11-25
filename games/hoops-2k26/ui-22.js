(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/nba2k14/components/Nba2k14ExperienceShell ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/components/Nba2k14ExperienceShell", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Nba2k14ExperienceShell", {
    enumerable: true,
    get: function() {
        return Nba2k14ExperienceShell;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _lucidereact = require("lucide-react");
var _Nba2k14Audio = require("../audio/Nba2k14Audio");
var _modesData = require("../data/modesData");
var _rosters = require("../data/rosters");
var _SpotlightStage = require("../engine/SpotlightStage");
var _storage = require("../storage");
var _FeaturesView = require("./FeaturesView");
var _GameModesHubView = require("./GameModesHubView");
var _MatchPlayView = require("./MatchPlayView");
var _MyCareerView = require("./MyCareerView");
var _OptionsSuiteView = require("./OptionsSuiteView");
var _PathToGreatnessView = require("./PathToGreatnessView");
var _QuickGameView = require("./QuickGameView");
var _TheParkView = require("./TheParkView");
var _VipNavDrawer = require("./VipNavDrawer");
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
var DOCK_TABS = [
    {
        id: 'quick',
        label: 'QUICK GAME'
    },
    {
        id: 'path',
        label: 'PATH TO GREATNESS'
    },
    {
        id: 'mycareer',
        label: 'MyCAREER'
    },
    {
        id: 'park',
        label: 'THE PARK'
    },
    {
        id: 'modes',
        label: 'GAME MODES'
    },
    {
        id: 'nav',
        label: '2K NAV'
    },
    {
        id: 'features',
        label: 'FEATURES'
    },
    {
        id: 'options',
        label: 'OPTIONS'
    }
];
var TAB_LABELS = {
    main: 'MAIN MENU',
    quick: 'QUICK GAME',
    path: 'LEBRON: PATH TO GREATNESS',
    mycareer: 'MyCAREER',
    park: 'THE PARK',
    modes: 'GAME MODES',
    features: 'FEATURES',
    options: 'OPTIONS & SLIDERS'
};
var Nba2k14ExperienceShell = function Nba2k14ExperienceShell(param) {
    var onExitToArcade = param.onExitToArcade;
    var _useState = (0, _react.useState)(function() {
        return (0, _storage.loadNba2k14Save)();
    }), save = _useState[0], setSave = _useState[1];
    var _useState1 = (0, _react.useState)(false), entered = _useState1[0], setEntered = _useState1[1];
    var _useState2 = (0, _react.useState)('main'), activeTab = _useState2[0], setActiveTab = _useState2[1];
    var _useState3 = (0, _react.useState)(false), vipDrawerOpen = _useState3[0], setVipDrawerOpen = _useState3[1];
    var _useState4 = (0, _react.useState)(null), activeMatch = _useState4[0], setActiveMatch = _useState4[1];
    var _useState5 = (0, _react.useState)(0), nbaTodayIdx = _useState5[0], setNbaTodayIdx = _useState5[1];
    var _useState6 = (0, _react.useState)(0), audioTick = _useState6[0], setAudioTick = _useState6[1];
    var _useState7 = (0, _react.useState)(function() {
        return Array(12).fill(0.18);
    }), eqBars = _useState7[0], setEqBars = _useState7[1];
    var stageHostRef = (0, _react.useRef)(null);
    var stageCtrlRef = (0, _react.useRef)(null);
    var resolvedTeams = (0, _react.useMemo)(function() {
        return (0, _storage.getResolvedTeams)(save);
    }, [
        save
    ]);
    var currentMatchup = _modesData.NBA_TODAY_MATCHUPS[nbaTodayIdx % _modesData.NBA_TODAY_MATCHUPS.length];
    var todayAway = (0, _rosters.getTeamById)(currentMatchup.awayId);
    var todayHome = (0, _rosters.getTeamById)(currentMatchup.homeId);
    var updateSave = (0, _react.useCallback)(function(updater) {
        setSave(function(prev) {
            var next = updater(prev);
            (0, _storage.persistNba2k14Save)(next);
            return next;
        });
    }, []);
    // Sync Web Audio settings & subscribe to track updates
    (0, _react.useEffect)(function() {
        _Nba2k14Audio.Nba2k14Audio.syncSettings(save.settings.audio, save.settings.jukeboxDisabledTrackIds);
    }, [
        save.settings.audio,
        save.settings.jukeboxDisabledTrackIds
    ]);
    (0, _react.useEffect)(function() {
        var unsub = _Nba2k14Audio.Nba2k14Audio.subscribe(function() {
            return setAudioTick(function(t) {
                return t + 1;
            });
        });
        var eqInterval = setInterval(function() {
            setEqBars([].concat(_Nba2k14Audio.Nba2k14Audio.getEqBars()));
        }, 110);
        return function() {
            unsub();
            clearInterval(eqInterval);
        };
    }, []);
    // Stop 2K Beats on unmount back to arcade
    (0, _react.useEffect)(function() {
        return function() {
            _Nba2k14Audio.Nba2k14Audio.stopBeats();
        };
    }, []);
    // Persistent 3D Arena Spotlight Stage behind Title Screen & Main Menu
    (0, _react.useEffect)(function() {
        var _heat_players_find;
        if (activeMatch) {
            var _stageCtrlRef_current;
            (_stageCtrlRef_current = stageCtrlRef.current) == null ? void 0 : _stageCtrlRef_current.dispose();
            stageCtrlRef.current = null;
            return;
        }
        var host = stageHostRef.current;
        if (!host) return;
        var heat = (0, _rosters.getTeamById)('mia');
        var lebron = (_heat_players_find = heat.players.find(function(p) {
            return p.name.includes('LeBron');
        })) != null ? _heat_players_find : heat.players[0];
        var ctrl = new _SpotlightStage.SpotlightStageController(host, lebron, heat);
        stageCtrlRef.current = ctrl;
        return function() {
            ctrl.dispose();
            stageCtrlRef.current = null;
        };
    }, [
        activeMatch
    ]);
    // React camera preset & featured star to active tab
    (0, _react.useEffect)(function() {
        var ctrl = stageCtrlRef.current;
        if (!ctrl) return;
        var preset = !entered ? 'title' : activeTab;
        ctrl.setCameraPreset(preset);
        if (entered && (activeTab === 'mycareer' || activeTab === 'park') && save.myCareer.created) {
            ctrl.setFeaturedPlayer(save.myCareer.player, (0, _rosters.getTeamById)(save.myCareer.teamId));
        } else {
            var _heat_players_find;
            var heat = (0, _rosters.getTeamById)('mia');
            var lebron = (_heat_players_find = heat.players.find(function(p) {
                return p.name.includes('LeBron');
            })) != null ? _heat_players_find : heat.players[0];
            ctrl.setFeaturedPlayer(lebron, heat);
        }
    }, [
        entered,
        activeTab,
        save.myCareer.created,
        save.myCareer.player,
        save.myCareer.teamId
    ]);
    var enterFromTitle = (0, _react.useCallback)(function() {
        if (entered) return;
        _Nba2k14Audio.Nba2k14Audio.unlock();
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        _Nba2k14Audio.Nba2k14Audio.startBeats();
        setEntered(true);
    }, [
        entered
    ]);
    // Global keyboard shortcuts (Enter to enter from title, Tab/Y for 2K Nav, M to skip 2K Beats, Esc to go back)
    (0, _react.useEffect)(function() {
        var onKeyDown = function onKeyDown(e) {
            var _e_target;
            if (activeMatch) return;
            var tag = (_e_target = e.target) == null ? void 0 : _e_target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (!entered) {
                if (e.code === 'Escape') return;
                enterFromTitle();
                return;
            }
            if (e.code === 'Tab' || e.code === 'KeyY') {
                e.preventDefault();
                _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                setVipDrawerOpen(function(v) {
                    return !v;
                });
            } else if (e.code === 'KeyM') {
                e.preventDefault();
                _Nba2k14Audio.Nba2k14Audio.nextTrack();
            } else if (e.code === 'KeyP') {
                e.preventDefault();
                setActiveTab('options');
            } else if (e.code === 'Escape') {
                if (vipDrawerOpen) {
                    setVipDrawerOpen(false);
                } else if (activeTab !== 'main') {
                    _Nba2k14Audio.Nba2k14Audio.playUiClick('back');
                    setActiveTab('main');
                }
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return function() {
            return window.removeEventListener('keydown', onKeyDown);
        };
    }, [
        activeMatch,
        entered,
        enterFromTitle,
        vipDrawerOpen,
        activeTab
    ]);
    var handleStartMatch = (0, _react.useCallback)(function(cfg) {
        _Nba2k14Audio.Nba2k14Audio.stopBeats();
        setVipDrawerOpen(false);
        setActiveMatch(cfg);
    }, []);
    var handleFinishMatch = (0, _react.useCallback)(function(summary) {
        updateSave(function(prev) {
            var nextSave = (0, _storage.applyMatchResultToSave)(prev, summary).nextSave;
            // Update Playoff Series if applicable
            if (summary.config.mode === 'playoffs' && summary.config.playoffSeriesId) {
                var needed = Math.ceil(nextSave.playoffs.bestOf / 2);
                var updatedSeries = nextSave.playoffs.series.map(function(s) {
                    if (s.id !== summary.config.playoffSeriesId || s.winnerId) return s;
                    var homeWon = summary.homeScore >= summary.awayScore;
                    var hw = s.higherWins + (homeWon ? 1 : 0);
                    var lw = s.lowerWins + (homeWon ? 0 : 1);
                    var winnerId = hw >= needed ? s.higherSeedId : lw >= needed ? s.lowerSeedId : null;
                    return _extends({}, s, {
                        higherWins: hw,
                        lowerWins: lw,
                        winnerId: winnerId
                    });
                });
                return _extends({}, nextSave, {
                    playoffs: _extends({}, nextSave.playoffs, {
                        series: updatedSeries
                    })
                });
            }
            return nextSave;
        });
    }, [
        updateSave
    ]);
    var handleQuitMatch = (0, _react.useCallback)(function() {
        setActiveMatch(null);
        _Nba2k14Audio.Nba2k14Audio.startBeats();
    }, []);
    var currentTrack = (0, _react.useMemo)(function() {
        void audioTick;
        return _Nba2k14Audio.Nba2k14Audio.getCurrentTrack();
    }, [
        audioTick
    ]);
    var beatsPlaying = (0, _react.useMemo)(function() {
        void audioTick;
        return _Nba2k14Audio.Nba2k14Audio.isBeatsPlaying();
    }, [
        audioTick
    ]);
    // Live 3D Match Viewport
    if (activeMatch) {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
            className: "nba2k14-shell fixed inset-0 z-50 bg-[#090a0d] text-white overflow-hidden",
            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_MatchPlayView.MatchPlayView, {
                config: activeMatch,
                settings: save.settings,
                onUpdateSettings: function onUpdateSettings(nextSettings) {
                    return updateSave(function(prev) {
                        return _extends({}, prev, {
                            settings: nextSettings
                        });
                    });
                },
                onFinishMatch: handleFinishMatch,
                onQuitToMenu: handleQuitMatch
            })
        });
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "nba2k14-shell fixed inset-0 z-50 bg-[#090a0d] text-white overflow-hidden select-none font-sans",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                ref: stageHostRef,
                className: "absolute inset-0 z-0"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "absolute inset-0 z-10 pointer-events-none",
                style: {
                    background: 'linear-gradient(180deg, rgba(9,10,13,0.78) 0%, rgba(9,10,13,0.18) 28%, rgba(9,10,13,0.22) 68%, rgba(9,10,13,0.92) 100%)'
                }
            }),
            !entered ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                onClick: enterFromTitle,
                className: "relative z-20 h-full w-full flex flex-col justify-between p-6 sm:p-10 cursor-pointer",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center gap-2 text-xs font-black tracking-[0.26em] text-[#F9A01B] uppercase",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Crown, {
                                        className: "w-4 h-4"
                                    }),
                                    " KING JAMES ERA \xb7 2013–14 EDITION"
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick(e) {
                                    e.stopPropagation();
                                    _Nba2k14Audio.Nba2k14Audio.stopBeats();
                                    onExitToArcade();
                                },
                                className: "px-3.5 py-2 rounded-lg bg-[#0f1116]/92 border border-white/15 hover:border-[#CE1141] text-xs font-bold uppercase text-zinc-200 flex items-center gap-1.5 cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.LogOut, {
                                        className: "w-3.5 h-3.5"
                                    }),
                                    " Exit to Arcade"
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "max-w-xl",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "inline-block px-3 py-1 rounded bg-[#CE1141] text-white text-[11px] font-black tracking-[0.28em] uppercase mb-3",
                                children: "2K SPORTS \xb7 OFFICIAL 3D SIMULATION"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("h1", {
                                className: "text-6xl sm:text-7xl font-black italic tracking-tighter leading-none text-white drop-shadow-[0_6px_28px_rgba(206,17,65,0.45)]",
                                children: [
                                    "NBA ",
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-[#CE1141]",
                                        children: "2K"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-[#F9A01B]",
                                        children: "14"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                className: "mt-3 text-sm sm:text-base text-zinc-300 font-semibold max-w-md",
                                children: "50 Authentic Teams \xb7 38 Signature Skills \xb7 Pro Stick IsoMotion \xb7 Path to Greatness \xb7 MyCAREER \xb7 The Park"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "mt-8 inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-[#0f1116]/92 border-2 border-[#F9A01B] shadow-[0_0_30px_rgba(249,160,27,0.25)]",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Play, {
                                        className: "w-5 h-5 text-[#F9A01B] fill-[#F9A01B]"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-sm sm:text-base font-black tracking-[0.22em] text-white uppercase",
                                        children: "PRESS START \xb7 CLICK OR PRESS ANY KEY"
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex flex-wrap items-end justify-between gap-4",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#0f1116]/92 border border-white/15 rounded-xl px-4 py-2.5 flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Disc3, {
                                        className: "w-5 h-5 text-[#F9A01B]"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[10px] font-black uppercase tracking-[0.2em] text-[#F9A01B]",
                                                children: "2K BEATS \xb7 CURATED BY LEBRON JAMES"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-xs font-bold text-white",
                                                children: currentTrack.title
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "text-[11px] font-bold tracking-wider uppercase text-zinc-400",
                                children: "WebGL 3D Hardwood \xb7 Keyboard + Gamepad + Touch Ready"
                            })
                        ]
                    })
                ]
            }) : /* ==================== SCREEN 2: EXACT MAIN MENU LOBBY ==================== */ /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "relative z-20 h-full w-full flex flex-col justify-between",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                        className: "px-5 pt-3.5 pb-2 flex items-center justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            _Nba2k14Audio.Nba2k14Audio.playUiClick('back');
                                            setActiveTab('main');
                                        },
                                        className: "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f1116]/92 border border-white/15 hover:border-[#F9A01B] transition cursor-pointer",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            className: "text-xl font-black italic tracking-tighter text-white leading-none",
                                            children: [
                                                "NBA ",
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "text-[#CE1141]",
                                                    children: "2K"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "text-[#F9A01B]",
                                                    children: "14"
                                                })
                                            ]
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-300 bg-[#0f1116]/88 border border-white/10 rounded-lg px-3 py-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[#F9A01B]",
                                                children: "HOME"
                                            }),
                                            activeTab !== 'main' && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-zinc-600",
                                                        children: "/"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-white",
                                                        children: TAB_LABELS[activeTab]
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        onClick: function onClick() {
                                            _Nba2k14Audio.Nba2k14Audio.stopBeats();
                                            onExitToArcade();
                                        },
                                        className: "px-3 py-1.5 rounded-lg bg-[#0f1116]/92 border border-white/15 hover:border-[#CE1141] text-[11px] font-black uppercase text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.LogOut, {
                                                className: "w-3.5 h-3.5"
                                            }),
                                            " Arcade"
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                    setVipDrawerOpen(true);
                                },
                                className: "bg-[#0f1116]/94 border border-white/20 hover:border-[#F9A01B] rounded-xl px-3.5 py-2 flex items-center gap-3 transition cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "w-8 h-8 rounded-lg bg-[#CE1141] border border-[#F9A01B] flex items-center justify-center text-[11px] font-black text-white",
                                        children: save.vip.avatarCrest
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-left leading-tight",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-xs font-black text-white uppercase",
                                                children: save.vip.name
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-[10px] font-bold text-zinc-400",
                                                children: [
                                                    save.vip.wins,
                                                    "W-",
                                                    save.vip.losses,
                                                    "L \xb7 ",
                                                    save.vip.unlockedAchievements.length,
                                                    "/25 Trophies"
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "hidden md:flex items-center gap-2.5 pl-2 border-l border-white/15 text-xs font-black",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-[#F9A01B]",
                                                children: [
                                                    save.vip.vc.toLocaleString(),
                                                    " VC"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-cyan-300",
                                                children: [
                                                    save.vip.sp.toLocaleString(),
                                                    " SP"
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("main", {
                        className: "flex-1 min-h-0 overflow-hidden",
                        children: [
                            activeTab === 'main' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h-full px-6 py-4 flex flex-col justify-between",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex-1 flex flex-col lg:flex-row items-center justify-between gap-6",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "w-full max-w-sm bg-[#0f1116]/92 border border-white/15 rounded-xl p-4 shadow-2xl",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex items-center justify-between mb-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                className: "text-[10px] font-black uppercase tracking-[0.22em] text-[#F9A01B]",
                                                                children: [
                                                                    "NBA TODAY \xb7 ",
                                                                    currentMatchup.label
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "flex gap-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                        onClick: function onClick() {
                                                                            return setNbaTodayIdx(function(i) {
                                                                                return (i - 1 + _modesData.NBA_TODAY_MATCHUPS.length) % _modesData.NBA_TODAY_MATCHUPS.length;
                                                                            });
                                                                        },
                                                                        className: "p-1 rounded bg-[#1a1e28] hover:bg-[#272d3c] text-zinc-300 cursor-pointer",
                                                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.ChevronLeft, {
                                                                            className: "w-3.5 h-3.5"
                                                                        })
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                        onClick: function onClick() {
                                                                            return setNbaTodayIdx(function(i) {
                                                                                return (i + 1) % _modesData.NBA_TODAY_MATCHUPS.length;
                                                                            });
                                                                        },
                                                                        className: "p-1 rounded bg-[#1a1e28] hover:bg-[#272d3c] text-zinc-300 cursor-pointer",
                                                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.ChevronRight, {
                                                                            className: "w-3.5 h-3.5"
                                                                        })
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "bg-[#151820] border border-white/10 rounded-lg p-3.5 flex items-center justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-center",
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                        style: {
                                                                            backgroundColor: todayAway.primaryColor
                                                                        },
                                                                        className: "w-12 h-12 mx-auto rounded-lg flex items-center justify-center font-black text-sm text-white border border-white/20",
                                                                        children: todayAway.code
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                        className: "text-xs font-black text-white mt-1.5",
                                                                        children: todayAway.name
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                        className: "text-[10px] text-zinc-400",
                                                                        children: [
                                                                            "OVR ",
                                                                            todayAway.ovr
                                                                        ]
                                                                    })
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-center px-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                        className: "text-xs font-black text-[#CE1141]",
                                                                        children: "AT"
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                        className: "text-[10px] text-zinc-400 mt-0.5",
                                                                        children: currentMatchup.tipTime
                                                                    })
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-center",
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                        style: {
                                                                            backgroundColor: todayHome.primaryColor
                                                                        },
                                                                        className: "w-12 h-12 mx-auto rounded-lg flex items-center justify-center font-black text-sm text-white border border-white/20",
                                                                        children: todayHome.code
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                        className: "text-xs font-black text-white mt-1.5",
                                                                        children: todayHome.name
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                        className: "text-[10px] text-zinc-400",
                                                                        children: [
                                                                            "OVR ",
                                                                            todayHome.ovr
                                                                        ]
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[11px] text-zinc-400 mt-2 text-center",
                                                        children: currentMatchup.arena
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        onClick: function onClick() {
                                                            _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                                            handleStartMatch({
                                                                mode: 'quick',
                                                                title: "NBA TODAY \xb7 " + todayAway.code + " @ " + todayHome.code,
                                                                subtitle: currentMatchup.arena,
                                                                homeTeamId: todayHome.id,
                                                                awayTeamId: todayAway.id,
                                                                userSide: 'home',
                                                                courtEnv: 'nba',
                                                                quarterLengthMin: save.settings.game.quarterLengthMin,
                                                                playersPerSide: 5
                                                            });
                                                        },
                                                        className: "mt-3 w-full py-2.5 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Play, {
                                                                className: "w-3.5 h-3.5 fill-current"
                                                            }),
                                                            " Play NBA Today Matchup"
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "hidden lg:block flex-1"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "w-full max-w-sm bg-[#0f1116]/92 border border-white/15 rounded-xl p-4 shadow-2xl space-y-3",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[10px] font-black uppercase tracking-[0.22em] text-[#F9A01B]",
                                                        children: "QUICK CONTINUE"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "bg-[#151820] border border-white/10 rounded-lg p-3.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-xs font-black text-white uppercase",
                                                                children: save.lastMode === 'mycareer' ? "MyCAREER \xb7 " + save.myCareer.player.name + " (" + save.myCareer.player.ovr + " OVR)" : save.lastMode === 'path' ? 'LeBron: Path to Greatness' : save.lastMode === 'association' ? "The Association \xb7 Day " + save.association.currentDay : 'NBA 2K14 Quick Game (50 Teams)'
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                                className: "text-[11px] text-zinc-400 mt-1",
                                                                children: save.lastMode === 'mycareer' ? "Record " + save.myCareer.wins + "-" + save.myCareer.losses + " \xb7 Continue your Rookie Season." : save.lastMode === 'path' ? "Earned " + Object.values(save.pathToGreatness.completedStars).reduce(function(a, b) {
                                                                    return a + b;
                                                                }, 0) + " / 39 Championship Stars." : save.lastMode === 'association' ? 'Jump straight back into Front Office GM decisions & games.' : 'Pick any NBA, Euroleague, Classic, or All-Star squad.'
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                onClick: function onClick() {
                                                                    _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                                                    setActiveTab(save.lastMode === 'association' ? 'modes' : save.lastMode);
                                                                },
                                                                className: "mt-3 w-full py-2 rounded-lg bg-[#F9A01B] hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer",
                                                                children: "Resume Mode"
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "grid grid-cols-2 gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                                onClick: function onClick() {
                                                                    _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                                                    setActiveTab('path');
                                                                },
                                                                className: "p-2.5 rounded-lg bg-[#151820] hover:bg-[#1e222e] border border-white/10 text-left cursor-pointer",
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                        className: "text-[10px] font-black text-[#F9A01B] uppercase",
                                                                        children: "Path to Greatness"
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                        className: "text-xs font-bold text-white mt-0.5",
                                                                        children: "13 LeBron Chapters"
                                                                    })
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                                onClick: function onClick() {
                                                                    _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                                                    setActiveTab('park');
                                                                },
                                                                className: "p-2.5 rounded-lg bg-[#151820] hover:bg-[#1e222e] border border-white/10 text-left cursor-pointer",
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                        className: "text-[10px] font-black text-[#CE1141] uppercase",
                                                                        children: "The Park"
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                        className: "text-xs font-bold text-white mt-0.5",
                                                                        children: "6 Streetball Courts"
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "flex items-end justify-between mt-3",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "bg-[#0f1116]/94 border border-white/15 rounded-xl px-3.5 py-2 flex items-center gap-3 shadow-xl",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "flex items-end gap-[2px] h-5 w-10",
                                                    children: eqBars.slice(0, 8).map(function(h, i) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            style: {
                                                                height: "" + Math.max(15, Math.round(h * 100)) + "%"
                                                            },
                                                            className: "flex-1 bg-gradient-to-t from-[#CE1141] to-[#F9A01B] rounded-t-sm transition-all duration-100"
                                                        }, i);
                                                    })
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "min-w-0 max-w-[220px]",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[9px] font-black uppercase tracking-[0.2em] text-[#F9A01B]",
                                                            children: "2K BEATS \xb7 NOW PLAYING"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-xs font-bold text-white truncate",
                                                            children: currentTrack.title
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex items-center gap-1 pl-2 border-l border-white/10",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            onClick: function onClick() {
                                                                return _Nba2k14Audio.Nba2k14Audio.toggleBeats();
                                                            },
                                                            className: "p-1.5 rounded bg-[#181c26] hover:bg-[#252b3a] text-white cursor-pointer",
                                                            title: "Play / Pause 2K Beats",
                                                            children: beatsPlaying ? /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Pause, {
                                                                className: "w-3.5 h-3.5"
                                                            }) : /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Play, {
                                                                className: "w-3.5 h-3.5"
                                                            })
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            onClick: function onClick() {
                                                                return _Nba2k14Audio.Nba2k14Audio.nextTrack();
                                                            },
                                                            className: "p-1.5 rounded bg-[#181c26] hover:bg-[#252b3a] text-white cursor-pointer",
                                                            title: "Next Track (M)",
                                                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.SkipForward, {
                                                                className: "w-3.5 h-3.5"
                                                            })
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            onClick: function onClick() {
                                                                return updateSave(function(prev) {
                                                                    return _extends({}, prev, {
                                                                        settings: _extends({}, prev.settings, {
                                                                            audio: _extends({}, prev.settings.audio, {
                                                                                muted: !prev.settings.audio.muted
                                                                            })
                                                                        })
                                                                    });
                                                                });
                                                            },
                                                            className: "p-1.5 rounded bg-[#181c26] hover:bg-[#252b3a] text-white cursor-pointer",
                                                            title: "Mute Audio",
                                                            children: save.settings.audio.muted ? /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.VolumeX, {
                                                                className: "w-3.5 h-3.5 text-red-400"
                                                            }) : /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Volume2, {
                                                                className: "w-3.5 h-3.5"
                                                            })
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    })
                                ]
                            }),
                            activeTab === 'quick' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_QuickGameView.QuickGameView, {
                                teams: resolvedTeams,
                                settings: save.settings,
                                onUpdateSettings: function onUpdateSettings(nextSettings) {
                                    return updateSave(function(prev) {
                                        return _extends({}, prev, {
                                            settings: nextSettings
                                        });
                                    });
                                },
                                onStartMatch: handleStartMatch,
                                onBack: function onBack() {
                                    return setActiveTab('main');
                                }
                            }),
                            activeTab === 'path' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_PathToGreatnessView.PathToGreatnessView, {
                                state: save.pathToGreatness,
                                onSelectPath: function onSelectPath(selectedPath) {
                                    return updateSave(function(prev) {
                                        return _extends({}, prev, {
                                            pathToGreatness: _extends({}, prev.pathToGreatness, {
                                                selectedPath: selectedPath
                                            })
                                        });
                                    });
                                },
                                onLaunchChapter: handleStartMatch,
                                onBack: function onBack() {
                                    return setActiveTab('main');
                                }
                            }),
                            activeTab === 'mycareer' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_MyCareerView.MyCareerView, {
                                save: save,
                                onUpdateSave: updateSave,
                                onStartMatch: handleStartMatch,
                                onOpenOptions: function onOpenOptions() {
                                    return setActiveTab('options');
                                }
                            }),
                            activeTab === 'park' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_TheParkView.TheParkView, {
                                save: save,
                                onStartMatch: handleStartMatch
                            }),
                            activeTab === 'modes' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_GameModesHubView.GameModesHubView, {
                                save: save,
                                onUpdateSave: updateSave,
                                onStartMatch: handleStartMatch
                            }),
                            activeTab === 'features' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_FeaturesView.FeaturesView, {
                                save: save,
                                onUpdateSave: updateSave
                            }),
                            activeTab === 'options' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_OptionsSuiteView.OptionsSuiteView, {
                                settings: save.settings,
                                onChange: function onChange(nextSettings) {
                                    return updateSave(function(prev) {
                                        return _extends({}, prev, {
                                            settings: nextSettings
                                        });
                                    });
                                },
                                onBack: function onBack() {
                                    return setActiveTab('main');
                                }
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("footer", {
                        className: "bg-[#0b0d12]/96 border-t border-white/15",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("nav", {
                                className: "px-4 py-2 flex items-center justify-center gap-1.5 overflow-x-auto",
                                children: DOCK_TABS.map(function(item) {
                                    var isActive = item.id === activeTab || item.id === 'nav' && vipDrawerOpen;
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                            if (item.id === 'nav') {
                                                setVipDrawerOpen(true);
                                            } else {
                                                setActiveTab(item.id);
                                            }
                                        },
                                        className: "px-3.5 py-2 rounded-lg text-[11px] font-black tracking-wider uppercase whitespace-nowrap border transition cursor-pointer " + (isActive ? 'bg-[#CE1141] border-[#F9A01B] text-white shadow-[0_0_16px_rgba(206,17,65,0.45)]' : 'bg-[#151820] border-white/10 text-zinc-300 hover:text-white hover:border-white/30'),
                                        children: item.label
                                    }, item.id);
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "px-5 py-1.5 bg-[#07080b] border-t border-white/10 flex flex-wrap items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "Enter: Select \xb7 Esc: Back \xb7 Tab / Y: 2K Nav VIP \xb7 M: Skip 2K Beats \xb7 P: Options"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-[#F9A01B]",
                                        children: "NBA 2K14 \xb7 3D HARDWOOD ENGINE"
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_VipNavDrawer.VipNavDrawer, {
                open: vipDrawerOpen,
                save: save,
                onClose: function onClose() {
                    return setVipDrawerOpen(false);
                },
                onUpdateSave: updateSave
            })
        ]
    });
};

});

})(window.ArcadeMod);
