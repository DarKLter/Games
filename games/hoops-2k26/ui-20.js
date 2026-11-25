(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/nba2k14/components/MatchPlayView ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/components/MatchPlayView", function(require, module, exports) {
// ============================================================================
// NBA 2K14 — Live 3D Match Viewport, Authentic On-Court Broadcast HUD,
// Pause Menu (10s 3D Instant Replay, Gameplan, Box Score, Options),
// Virtual Touch Controller & Post-Game Summary + VC/SP Payout
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MatchPlayView", {
    enumerable: true,
    get: function() {
        return MatchPlayView;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _lucidereact = require("lucide-react");
var _Nba2k14Audio = require("../audio/Nba2k14Audio");
var _modesData = require("../data/modesData");
var _Nba2k14Engine = require("../engine/Nba2k14Engine");
var _OptionsSuiteView = require("./OptionsSuiteView");
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
function formatClock(sec) {
    var s = Math.max(0, sec);
    if (s < 60) {
        return s.toFixed(1).padStart(4, '0');
    }
    var m = Math.floor(s / 60);
    var rem = Math.floor(s % 60);
    return String(m).padStart(2, '0') + ":" + String(rem).padStart(2, '0');
}
var MatchPlayView = function MatchPlayView(param) {
    var config = param.config, settings = param.settings, onUpdateSettings = param.onUpdateSettings, onFinishMatch = param.onFinishMatch, onQuitToMenu = param.onQuitToMenu;
    var _ref, _ref1, _ref2, _ref3, _ref4;
    var mountRef = (0, _react.useRef)(null);
    var engineRef = (0, _react.useRef)(null);
    var _useState = (0, _react.useState)(null), hud = _useState[0], setHud = _useState[1];
    var _useState1 = (0, _react.useState)(null), summary = _useState1[0], setSummary = _useState1[1];
    var _useState2 = (0, _react.useState)('main'), pauseTab = _useState2[0], setPauseTab = _useState2[1];
    var _useState3 = (0, _react.useState)('pog'), postTab = _useState3[0], setPostTab = _useState3[1];
    var _useState4 = (0, _react.useState)(function() {
        if (settings.controller.virtualGamepad === 'Always On') return true;
        if (settings.controller.virtualGamepad === 'Off') return false;
        return typeof window !== 'undefined' && window.innerWidth < 960;
    }), touchMode = _useState4[0], setTouchMode = _useState4[1];
    (0, _react.useEffect)(function() {
        if (!mountRef.current) return;
        var engine = new _Nba2k14Engine.Nba2k14Engine(mountRef.current, config, settings, function(snap) {
            return setHud(snap);
        }, function(res) {
            setSummary(res);
            onFinishMatch(res);
        });
        engineRef.current = engine;
        return function() {
            engine.dispose();
            engineRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        config
    ]);
    (0, _react.useEffect)(function() {
        var _engineRef_current;
        (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.updateSettings(settings);
        if (settings.controller.virtualGamepad === 'Always On') setTouchMode(true);
        else if (settings.controller.virtualGamepad === 'Off') setTouchMode(false);
    }, [
        settings
    ]);
    var handleRestart = function handleRestart() {
        var _engineRef_current;
        if (!mountRef.current) return;
        (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.dispose();
        setSummary(null);
        setPauseTab('main');
        var engine = new _Nba2k14Engine.Nba2k14Engine(mountRef.current, config, settings, function(snap) {
            return setHud(snap);
        }, function(res) {
            setSummary(res);
            onFinishMatch(res);
        });
        engineRef.current = engine;
    };
    var quarterLabel = hud && config.targetScore ? "TO " + config.targetScore : hud && hud.quarter > 4 ? "OT" + (hud.quarter - 4) : "Q" + ((_ref = hud == null ? void 0 : hud.quarter) != null ? _ref : 1);
    var homeBox = ((_ref1 = hud == null ? void 0 : hud.boxScore) != null ? _ref1 : []).filter(function(b) {
        return b.teamSide === 'home';
    });
    var awayBox = ((_ref2 = hud == null ? void 0 : hud.boxScore) != null ? _ref2 : []).filter(function(b) {
        return b.teamSide === 'away';
    });
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "fixed inset-0 z-50 bg-[#090a0d] text-white select-none overflow-hidden font-sans",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                ref: mountRef,
                className: "w-full h-full"
            }),
            hud && !summary && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "pointer-events-none fixed top-3 left-3 z-20 flex flex-col gap-2",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "pointer-events-auto flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setPaused(!hud.paused);
                                },
                                className: "px-3 py-1.5 bg-[#0f1116]/92 border border-white/20 hover:border-[#CE1141] text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 rounded-sm cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Pause, {
                                        className: "w-3.5 h-3.5 text-[#F9A01B]"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "Pause (Esc)"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    return setTouchMode(function(t) {
                                        return !t;
                                    });
                                },
                                className: "px-2.5 py-1.5 bg-[#0f1116]/90 border border-white/15 hover:border-white/40 text-[11px] font-semibold uppercase tracking-wide rounded-sm cursor-pointer",
                                children: touchMode ? 'Hide Pad' : 'Touch Pad'
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.finishEarlyAndSummarize();
                                },
                                className: "px-2.5 py-1.5 bg-[#0f1116]/90 border border-white/15 hover:border-[#F9A01B] text-[11px] font-semibold uppercase tracking-wide rounded-sm cursor-pointer text-amber-300",
                                children: "Sim To End"
                            }),
                            settings.graphics.fpsCounter && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "px-2 py-1 bg-[#0f1116]/90 border border-white/15 text-[11px] font-mono tabular-nums text-emerald-400",
                                children: [
                                    hud.fps,
                                    " FPS"
                                ]
                            })
                        ]
                    }),
                    hud.sigPopup && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-2.5 px-3 py-2 bg-[#14110b]/95 border border-[#F9A01B] shadow-lg rounded-sm",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "w-9 h-9 rounded-full bg-gradient-to-br from-[#F9A01B] to-[#92400e] text-[#090a0d] font-black text-xs flex items-center justify-center border border-amber-200",
                                children: hud.sigPopup.code
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-[10px] font-bold uppercase tracking-widest text-[#F9A01B]",
                                        children: [
                                            "Signature Skill Lv.",
                                            hud.sigPopup.level
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-sm font-black uppercase tracking-wide text-white leading-tight",
                                        children: hud.sigPopup.skillName
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[11px] text-slate-300",
                                        children: hud.sigPopup.playerName
                                    })
                                ]
                            })
                        ]
                    }),
                    hud.trainingState && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "max-w-xs px-3 py-2 bg-[#0f1116]/92 border border-[#F9A01B]/60 rounded-sm",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "text-[10px] font-bold uppercase tracking-widest text-[#F9A01B]",
                                children: [
                                    "Training Camp \xb7 ",
                                    hud.trainingState.completedReps,
                                    "/",
                                    hud.trainingState.targetReps
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "text-xs font-black uppercase",
                                children: hud.trainingState.drillTitle
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                className: "text-[11px] text-slate-300 mt-0.5 leading-snug",
                                children: hud.trainingState.instruction
                            })
                        ]
                    })
                ]
            }),
            hud && !summary && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "pointer-events-none fixed top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 w-[min(560px,78vw)]",
                children: [
                    hud.shotFeedback && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "px-4 py-1.5 bg-[#0f1116]/94 border border-white/25 flex items-center gap-3 rounded-sm shadow-lg",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "text-xs font-black uppercase tracking-wider " + (hud.shotFeedback.release === 'EXCELLENT' ? 'text-emerald-400' : hud.shotFeedback.release.includes('SLIGHTLY') ? 'text-amber-300' : 'text-rose-400'),
                                children: [
                                    "RELEASE: ",
                                    hud.shotFeedback.release
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-white/30",
                                children: "|"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "text-xs font-black uppercase text-white",
                                children: [
                                    "QUALITY: ",
                                    hud.shotFeedback.quality,
                                    " (",
                                    hud.shotFeedback.contestLabel,
                                    ")"
                                ]
                            })
                        ]
                    }),
                    hud.paBanner && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "px-5 py-1.5 bg-[#CE1141] border border-amber-300/70 text-xs font-black uppercase tracking-widest text-white shadow-lg",
                        children: hud.paBanner
                    }),
                    hud.shootoutState && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "px-4 py-1.5 bg-[#0f1116]/94 border border-[#F9A01B] flex items-center gap-4 text-xs font-mono tabular-nums",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "font-black text-[#F9A01B]",
                                children: "3PT SHOOTOUT"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                children: [
                                    "SCORE: ",
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                        className: "text-white text-sm",
                                        children: hud.shootoutState.score
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                children: [
                                    "RACK: ",
                                    hud.shootoutState.rackIndex + 1,
                                    "/5"
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                children: [
                                    "TIME: ",
                                    hud.shootoutState.timeLeft.toFixed(1),
                                    "s"
                                ]
                            }),
                            hud.shootoutState.isMoneyBall && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-amber-300 font-black",
                                children: "MONEY BALL (2 PTS)"
                            })
                        ]
                    }),
                    hud.dunkContestState && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "pointer-events-auto px-4 py-2 bg-[#0f1116]/95 border border-[#F9A01B] flex flex-col items-center gap-2 rounded-sm",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center gap-4 text-xs font-bold uppercase tracking-wider",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-[#F9A01B]",
                                        children: "Sprite Slam Dunk Contest"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            "Round ",
                                            hud.dunkContestState.round,
                                            "/2"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "font-mono tabular-nums",
                                        children: [
                                            "Total: ",
                                            hud.dunkContestState.totalScore
                                        ]
                                    })
                                ]
                            }),
                            hud.dunkContestState.phase === 'select' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "flex flex-wrap justify-center gap-1.5",
                                children: _modesData.DUNK_CONTEST_MOVES.map(function(m) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            var _engineRef_current;
                                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.selectDunkContestMove(m.id);
                                        },
                                        className: "px-2.5 py-1 bg-[#1b1f2a] hover:bg-[#CE1141] border border-white/20 text-[11px] font-bold uppercase cursor-pointer",
                                        children: m.name
                                    }, m.id);
                                })
                            }),
                            hud.dunkContestState.phase === 'scored' && hud.dunkContestState.lastJudgeScores.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "flex items-center gap-2",
                                children: hud.dunkContestState.lastJudgeScores.map(function(s, idx) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "w-8 h-8 flex items-center justify-center bg-white text-[#090a0d] font-black font-mono text-sm border-2 border-[#CE1141]",
                                        children: s
                                    }, idx);
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "px-3 py-1 bg-[#090a0d]/85 border border-white/10 text-[11px] text-slate-200 text-center max-w-full truncate",
                        children: hud.commentary
                    })
                ]
            }),
            hud && !summary && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "pointer-events-none fixed top-3 right-3 z-20 flex flex-col items-end gap-1.5",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "w-60 bg-[#0f1116]/94 border border-white/20 px-3 py-2 rounded-sm",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-between gap-2",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-[10px] font-bold uppercase tracking-widest text-slate-400",
                                                children: [
                                                    "#",
                                                    hud.controlledPlayerJersey,
                                                    " ",
                                                    hud.controlledPlayerPos,
                                                    " \xb7 Teammate Grade"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-xs font-black uppercase truncate text-white",
                                                children: hud.controlledPlayerName
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "w-10 h-10 bg-[#1a1d26] border border-[#F9A01B] flex items-center justify-center text-lg font-black text-[#F9A01B] font-mono",
                                        children: hud.teammateGrade
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "mt-1.5 h-1.5 bg-slate-800 overflow-hidden",
                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "h-full bg-gradient-to-r from-[#CE1141] to-[#F9A01B]",
                                    style: {
                                        width: "" + Math.round(hud.teammateGradeFill * 100) + "%"
                                    }
                                })
                            }),
                            hud.playerLockStats && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "mt-1.5 flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-200",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            "PTS ",
                                            hud.playerLockStats.pts
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            "REB ",
                                            hud.playerLockStats.reb
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            "AST ",
                                            hud.playerLockStats.ast
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            "STL ",
                                            hud.playerLockStats.stl
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            "BLK ",
                                            hud.playerLockStats.blk
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    hud.gradeEvents.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "flex flex-col items-end gap-0.5",
                        children: hud.gradeEvents.slice(0, 3).map(function(ev) {
                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "px-2 py-0.5 text-[10px] font-bold uppercase bg-[#0f1116]/90 border " + (ev.positive ? 'border-emerald-500/40 text-emerald-300' : 'border-rose-500/40 text-rose-300'),
                                children: ev.text
                            }, ev.id);
                        })
                    })
                ]
            }),
            hud && hud.iconPassActive && !hud.paused && !summary && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "pointer-events-none fixed inset-0 z-15",
                children: hud.iconTargets.map(function(t) {
                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center",
                        style: {
                            left: "" + t.screenX + "px",
                            top: "" + t.screenY + "px"
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "w-8 h-8 rounded-full bg-[#CE1141] border-2 border-[#F9A01B] flex items-center justify-center font-black text-xs font-mono shadow-lg",
                                children: t.key
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "mt-0.5 px-1.5 py-0.5 bg-[#090a0d]/90 text-[10px] font-bold uppercase whitespace-nowrap",
                                children: [
                                    t.pos,
                                    " \xb7 ",
                                    t.name.split(' ').slice(-1)[0]
                                ]
                            })
                        ]
                    }, t.key);
                })
            }),
            hud && hud.shotMeterActive && settings.controller.shotMeterDisplay === 'On (Hands)' && !summary && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "pointer-events-none fixed left-1/2 top-[38%] -translate-x-1/2 z-20 w-44 bg-[#0f1116]/94 border border-white/25 p-2 rounded-sm",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "text-[10px] font-bold uppercase tracking-widest text-center text-slate-300 mb-1",
                        children: "Release Timing"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "relative h-3 bg-slate-800 overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "absolute top-0 bottom-0 left-[76%] w-[12%] bg-emerald-500/45 border-x border-emerald-300"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "h-full bg-gradient-to-r from-amber-400 to-emerald-400",
                                style: {
                                    width: "" + Math.min(100, Math.round(hud.shotMeterFill * 100)) + "%"
                                }
                            })
                        ]
                    })
                ]
            }),
            hud && hud.freeThrowActive && !summary && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "fixed left-1/2 top-[36%] -translate-x-1/2 z-30 w-72 bg-[#0f1116]/96 border-2 border-[#F9A01B] p-3 rounded-sm text-center",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "text-xs font-black uppercase tracking-wider text-[#F9A01B]",
                        children: [
                            "Free Throw \xb7 ",
                            hud.freeThrowShooterName,
                            " (",
                            hud.freeThrowRemaining,
                            " left)"
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "relative mt-2.5 h-5 bg-slate-800 border border-white/20",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "absolute top-0 bottom-0 left-[44%] w-[12%] bg-emerald-500/45 border-x border-emerald-300"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "absolute top-0 bottom-0 w-1.5 bg-white",
                                style: {
                                    left: "calc(" + Math.round(hud.freeThrowPos * 100) + "% - 3px)"
                                }
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "mt-2 text-[11px] text-slate-300 uppercase font-semibold",
                        children: "Press Space / Shoot in the Green Zone"
                    })
                ]
            }),
            hud && !summary && !hud.paused && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "fixed bottom-3 left-3 z-20 flex flex-col gap-1.5",
                children: [
                    hud.otfc.openTab && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "w-64 bg-[#0f1116]/96 border border-[#CE1141] p-2.5 rounded-sm shadow-xl",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#F9A01B] mb-2",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            "OTFC \xb7 ",
                                            hud.otfc.openTab === 'strategy' ? 'Points of Emphasis' : hud.otfc.openTab === 'plays' ? 'Plays & Defense' : hud.otfc.openTab === 'subs' ? 'Quick Substitutions' : 'On-Court Sig Skills'
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            var _engineRef_current;
                                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerOtfcAction({
                                                tab: null
                                            });
                                        },
                                        className: "text-slate-400 hover:text-white cursor-pointer",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.X, {
                                            className: "w-3.5 h-3.5"
                                        })
                                    })
                                ]
                            }),
                            hud.otfc.openTab === 'strategy' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "grid grid-cols-1 gap-1",
                                children: [
                                    'Get Shooters Open',
                                    'Feed the Post',
                                    'Crash Offensive Glass',
                                    'Play Through Star',
                                    'Limit Transition',
                                    'Protect the Paint'
                                ].map(function(poe) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            var _engineRef_current;
                                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerOtfcAction({
                                                offensePoe: poe
                                            });
                                        },
                                        className: "text-left px-2 py-1 text-[11px] font-bold uppercase border cursor-pointer " + (hud.otfc.offensePoe === poe ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#171a22] border-white/10 text-slate-200 hover:border-white/30'),
                                        children: poe
                                    }, poe);
                                })
                            }),
                            hud.otfc.openTab === 'plays' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[10px] text-slate-400 uppercase font-bold",
                                        children: "Offense Quick Plays"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "grid grid-cols-2 gap-1",
                                        children: [
                                            'Quick Iso',
                                            'Pick & Roll',
                                            'Motion Cuts',
                                            '3PT Play'
                                        ].map(function(pl) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerOtfcAction({
                                                        activePlay: pl
                                                    });
                                                },
                                                className: "px-2 py-1 text-[11px] font-bold uppercase border cursor-pointer " + (hud.otfc.activePlay === pl ? 'bg-[#CE1141] border-[#F9A01B]' : 'bg-[#171a22] border-white/10 hover:border-white/30'),
                                                children: pl
                                            }, pl);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[10px] text-slate-400 uppercase font-bold pt-1",
                                        children: "Defensive Sets"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "grid grid-cols-2 gap-1",
                                        children: [
                                            'Man-to-Man',
                                            '2-3 Zone',
                                            '3-2 Zone',
                                            'Half-Court Trap',
                                            'Full-Court Press'
                                        ].map(function(df) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerOtfcAction({
                                                        defenseSet: df
                                                    });
                                                },
                                                className: "px-2 py-1 text-[11px] font-bold uppercase border cursor-pointer " + (hud.otfc.defenseSet === df ? 'bg-[#CE1141] border-[#F9A01B]' : 'bg-[#171a22] border-white/10 hover:border-white/30'),
                                                children: df
                                            }, df);
                                        })
                                    })
                                ]
                            }),
                            hud.otfc.openTab === 'subs' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "grid grid-cols-2 gap-1",
                                children: [
                                    'Starters',
                                    'Bench',
                                    'Tall',
                                    '3PT',
                                    'Defense'
                                ].map(function(preset) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            var _engineRef_current;
                                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerOtfcAction({
                                                subPreset: preset
                                            });
                                        },
                                        className: "px-2 py-1.5 text-[11px] font-bold uppercase bg-[#171a22] hover:bg-[#CE1141] border border-white/15 cursor-pointer",
                                        children: preset
                                    }, preset);
                                })
                            }),
                            hud.otfc.openTab === 'skills' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-1 text-[11px]",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "font-bold text-white",
                                        children: hud.controlledPlayerName
                                    }),
                                    hud.controlledPlayerSkills.map(function(sk) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex justify-between text-amber-300 border-b border-white/10 pb-0.5",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "uppercase",
                                                    children: sk.id.replace(/_/g, ' ')
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    className: "font-mono",
                                                    children: [
                                                        "Lv.",
                                                        sk.level
                                                    ]
                                                })
                                            ]
                                        }, sk.id);
                                    })
                                ]
                            })
                        ]
                    }),
                    !touchMode && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-1 bg-[#0f1116]/90 border border-white/15 px-2 py-1 text-[10px] font-bold uppercase",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerOtfcAction({
                                        tab: 'strategy'
                                    });
                                },
                                className: "px-1.5 py-0.5 hover:text-[#F9A01B] cursor-pointer",
                                children: "← POE"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-white/20",
                                children: "|"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerOtfcAction({
                                        tab: 'plays'
                                    });
                                },
                                className: "px-1.5 py-0.5 hover:text-[#F9A01B] cursor-pointer",
                                children: "→ Plays/Def"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-white/20",
                                children: "|"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerOtfcAction({
                                        tab: 'subs'
                                    });
                                },
                                className: "px-1.5 py-0.5 hover:text-[#F9A01B] cursor-pointer",
                                children: "↓ Subs"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-white/20",
                                children: "|"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerOtfcAction({
                                        tab: 'skills'
                                    });
                                },
                                className: "px-1.5 py-0.5 hover:text-[#F9A01B] cursor-pointer",
                                children: "↑ Skills"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-white/20",
                                children: "|"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-slate-400",
                                children: "WASD \xb7 Space:Shoot \xb7 E:Pass \xb7 I/J/K/L:ProStick \xb7 V:PnR \xb7 C:IntenseD"
                            })
                        ]
                    })
                ]
            }),
            hud && settings.presentation.scoreboardDisplay && !summary && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "fixed bottom-3 right-3 z-20 w-[328px] bg-[#0d0f14]/96 border border-white/20 shadow-2xl rounded-sm overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "grid grid-cols-[1fr_1fr_92px] border-b border-white/15",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-between px-2.5 py-1.5 border-r border-white/10",
                                style: {
                                    background: "linear-gradient(90deg, " + hud.awayColor + "cc, #12141b)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center gap-1.5",
                                        children: [
                                            hud.possession === 'away' && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[#F9A01B] text-[10px] font-black",
                                                children: "▸"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-sm font-black tracking-wider uppercase",
                                                children: hud.awayCode
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-xl font-black font-mono tabular-nums",
                                        children: hud.awayScore
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-between px-2.5 py-1.5 border-r border-white/10",
                                style: {
                                    background: "linear-gradient(90deg, " + hud.homeColor + "cc, #12141b)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center gap-1.5",
                                        children: [
                                            hud.possession === 'home' && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[#F9A01B] text-[10px] font-black",
                                                children: "▸"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-sm font-black tracking-wider uppercase",
                                                children: hud.homeCode
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-xl font-black font-mono tabular-nums",
                                        children: hud.homeScore
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex flex-col items-center justify-center bg-[#090a0d] px-2 py-1",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-[10px] font-black tracking-widest text-[#F9A01B] uppercase",
                                        children: quarterLabel
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-sm font-black font-mono tabular-nums text-white",
                                        children: formatClock(hud.gameClockSec)
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center justify-between px-2.5 py-1 bg-[#141720] text-[10px] font-bold uppercase tracking-wider",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "text-slate-400",
                                        children: [
                                            "TO ",
                                            hud.awayTimeouts,
                                            "-",
                                            hud.homeTimeouts
                                        ]
                                    }),
                                    (hud.homeFoulsQ >= 5 || hud.awayFoulsQ >= 5) && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-[#F9A01B] font-black",
                                        children: "BONUS"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-slate-400",
                                        children: hud.otfc.defenseSet
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center gap-2 font-mono tabular-nums",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-slate-400",
                                        children: "SHOT"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "font-black text-xs " + (hud.shotClockSec <= 5 ? 'text-[#CE1141]' : 'text-amber-300'),
                                        children: [
                                            ":",
                                            String(Math.ceil(hud.shotClockSec)).padStart(2, '0')
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
            touchMode && hud && !hud.paused && !summary && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "fixed inset-x-0 bottom-16 z-25 pointer-events-none flex items-end justify-between px-4",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "pointer-events-auto grid grid-cols-3 gap-1 w-32 h-32 bg-[#0f1116]/85 border border-white/15 p-1.5 rounded-sm",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {}),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onPointerDown: function onPointerDown() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setVirtualInput({
                                        moveY: -1
                                    });
                                },
                                onPointerUp: function onPointerUp() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setVirtualInput({
                                        moveY: 0
                                    });
                                },
                                onPointerLeave: function onPointerLeave() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setVirtualInput({
                                        moveY: 0
                                    });
                                },
                                className: "bg-[#1c202c] active:bg-[#CE1141] text-xs font-black rounded-sm cursor-pointer",
                                children: "▲"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {}),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onPointerDown: function onPointerDown() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setVirtualInput({
                                        moveX: -1
                                    });
                                },
                                onPointerUp: function onPointerUp() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setVirtualInput({
                                        moveX: 0
                                    });
                                },
                                onPointerLeave: function onPointerLeave() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setVirtualInput({
                                        moveX: 0
                                    });
                                },
                                className: "bg-[#1c202c] active:bg-[#CE1141] text-xs font-black rounded-sm cursor-pointer",
                                children: "◀"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onPointerDown: function onPointerDown() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setVirtualInput({
                                        sprint: true
                                    });
                                },
                                onPointerUp: function onPointerUp() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setVirtualInput({
                                        sprint: false
                                    });
                                },
                                className: "bg-[#F9A01B] text-[#090a0d] text-[9px] font-black uppercase rounded-sm cursor-pointer",
                                children: "TURBO"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onPointerDown: function onPointerDown() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setVirtualInput({
                                        moveX: 1
                                    });
                                },
                                onPointerUp: function onPointerUp() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setVirtualInput({
                                        moveX: 0
                                    });
                                },
                                onPointerLeave: function onPointerLeave() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setVirtualInput({
                                        moveX: 0
                                    });
                                },
                                className: "bg-[#1c202c] active:bg-[#CE1141] text-xs font-black rounded-sm cursor-pointer",
                                children: "▶"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {}),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onPointerDown: function onPointerDown() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setVirtualInput({
                                        moveY: 1
                                    });
                                },
                                onPointerUp: function onPointerUp() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setVirtualInput({
                                        moveY: 0
                                    });
                                },
                                onPointerLeave: function onPointerLeave() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setVirtualInput({
                                        moveY: 0
                                    });
                                },
                                className: "bg-[#1c202c] active:bg-[#CE1141] text-xs font-black rounded-sm cursor-pointer",
                                children: "▼"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {})
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "pointer-events-auto grid grid-cols-2 gap-1.5 bg-[#0f1116]/85 border border-white/15 p-2 rounded-sm",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onPointerDown: function onPointerDown() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setVirtualInput({
                                        shoot: true
                                    });
                                },
                                onPointerUp: function onPointerUp() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setVirtualInput({
                                        shoot: false
                                    });
                                },
                                className: "px-3.5 py-2.5 bg-[#CE1141] active:bg-rose-500 text-xs font-black uppercase rounded-sm cursor-pointer",
                                children: "Shoot / Steal"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    return window.dispatchEvent(new KeyboardEvent('keydown', {
                                        code: settings.keybinds.pass
                                    }));
                                },
                                className: "px-3.5 py-2.5 bg-[#1e2432] active:bg-sky-600 text-xs font-black uppercase rounded-sm cursor-pointer",
                                children: "Pass / Switch"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    return window.dispatchEvent(new KeyboardEvent('keydown', {
                                        code: settings.keybinds.proStickLeft
                                    }));
                                },
                                className: "px-3 py-2 bg-[#1e2432] active:bg-[#F9A01B] text-[11px] font-black uppercase rounded-sm cursor-pointer",
                                children: "Iso Cross"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    return window.dispatchEvent(new KeyboardEvent('keydown', {
                                        code: settings.keybinds.postUp
                                    }));
                                },
                                className: "px-3 py-2 bg-[#1e2432] active:bg-emerald-600 text-[11px] font-black uppercase rounded-sm cursor-pointer",
                                children: "Post / Block"
                            })
                        ]
                    })
                ]
            }),
            hud && hud.replayMode && !summary && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "fixed inset-x-0 bottom-4 z-40 flex justify-center px-4",
                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "w-full max-w-2xl bg-[#0d0f15]/96 border border-[#F9A01B] p-3.5 rounded-sm shadow-2xl",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex items-center justify-between mb-2",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "text-xs font-black uppercase tracking-widest text-[#F9A01B]",
                                    children: "2K14 3D Instant Replay \xb7 Drag Viewport to Orbit Camera"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    onClick: function onClick() {
                                        var _engineRef_current;
                                        return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.exitInstantReplay();
                                    },
                                    className: "px-3 py-1 bg-[#CE1141] text-xs font-bold uppercase rounded-sm cursor-pointer",
                                    children: "Back to Pause"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                            type: "range",
                            min: 0,
                            max: Math.max(1, hud.replayLength - 1),
                            value: hud.replayIndex,
                            onChange: function onChange(e) {
                                var _engineRef_current;
                                return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setReplayControls({
                                    index: Number(e.target.value),
                                    playing: false
                                });
                            },
                            className: "w-full accent-[#CE1141]"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "mt-2 flex items-center justify-between text-xs",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                var _engineRef_current;
                                                return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setReplayControls({
                                                    index: Math.max(0, hud.replayIndex - 15),
                                                    playing: false
                                                });
                                            },
                                            className: "p-1.5 bg-[#1b1f2b] border border-white/15 hover:border-white cursor-pointer",
                                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Rewind, {
                                                className: "w-3.5 h-3.5"
                                            })
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                var _engineRef_current;
                                                return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setReplayControls({
                                                    playing: !hud.replayPlaying
                                                });
                                            },
                                            className: "px-3 py-1.5 bg-[#CE1141] font-bold uppercase flex items-center gap-1 cursor-pointer",
                                            children: [
                                                hud.replayPlaying ? /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Pause, {
                                                    className: "w-3.5 h-3.5"
                                                }) : /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Play, {
                                                    className: "w-3.5 h-3.5"
                                                }),
                                                hud.replayPlaying ? 'Pause' : 'Play'
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                var _engineRef_current;
                                                return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setReplayControls({
                                                    index: Math.min(hud.replayLength - 1, hud.replayIndex + 15),
                                                    playing: false
                                                });
                                            },
                                            className: "p-1.5 bg-[#1b1f2b] border border-white/15 hover:border-white cursor-pointer",
                                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.FastForward, {
                                                className: "w-3.5 h-3.5"
                                            })
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex items-center gap-1.5 font-mono tabular-nums",
                                    children: [
                                        [
                                            0.25,
                                            0.5,
                                            1
                                        ].map(function(sp) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setReplayControls({
                                                        speed: sp
                                                    });
                                                },
                                                className: "px-2 py-1 border text-[11px] font-bold cursor-pointer " + (hud.replaySpeed === sp ? 'bg-[#F9A01B] text-[#090a0d] border-[#F9A01B]' : 'bg-[#171a22] border-white/15'),
                                                children: [
                                                    sp,
                                                    "x"
                                                ]
                                            }, sp);
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            className: "ml-2 text-slate-400",
                                            children: [
                                                "Frame ",
                                                hud.replayIndex,
                                                "/",
                                                hud.replayLength
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            }),
            hud && hud.paused && !hud.replayMode && !summary && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "fixed inset-0 z-35 bg-[#090a0d]/82 flex",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "w-72 bg-[#0e1017] border-r border-white/15 p-5 flex flex-col justify-between",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[11px] font-bold uppercase tracking-widest text-[#F9A01B]",
                                        children: "NBA 2K14 \xb7 Game Paused"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-2xl font-black uppercase tracking-tight mt-0.5",
                                        children: [
                                            hud.awayCode,
                                            " ",
                                            hud.awayScore,
                                            " — ",
                                            hud.homeScore,
                                            " ",
                                            hud.homeCode
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-xs text-slate-400 font-mono tabular-nums mb-5",
                                        children: [
                                            quarterLabel,
                                            " \xb7 ",
                                            formatClock(hud.gameClockSec)
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "flex flex-col gap-1.5",
                                        children: [
                                            {
                                                id: 'resume',
                                                label: 'Resume Game',
                                                action: function action() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setPaused(false);
                                                }
                                            },
                                            {
                                                id: 'replay',
                                                label: 'Instant Replay (3D)',
                                                action: function action() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.enterInstantReplay();
                                                }
                                            },
                                            {
                                                id: 'gameplan',
                                                label: 'Gameplan & Subs',
                                                action: function action() {
                                                    return setPauseTab('gameplan');
                                                }
                                            },
                                            {
                                                id: 'boxscore',
                                                label: 'Box Score',
                                                action: function action() {
                                                    return setPauseTab('boxscore');
                                                }
                                            },
                                            {
                                                id: 'options',
                                                label: 'Options & Sliders',
                                                action: function action() {
                                                    return setPauseTab('options');
                                                }
                                            },
                                            {
                                                id: 'timeout',
                                                label: 'Call Timeout',
                                                action: function action() {
                                                    var _engineRef_current, _engineRef_current1;
                                                    (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.callTimeout();
                                                    (_engineRef_current1 = engineRef.current) == null ? void 0 : _engineRef_current1.setPaused(false);
                                                }
                                            },
                                            {
                                                id: 'restart',
                                                label: 'Restart Game',
                                                action: handleRestart
                                            },
                                            {
                                                id: 'quit',
                                                label: 'Quit to Main Menu',
                                                action: onQuitToMenu
                                            }
                                        ].map(function(item) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                                    item.action();
                                                },
                                                className: "w-full text-left px-3.5 py-2.5 text-xs font-black uppercase tracking-wider border transition-colors cursor-pointer " + (pauseTab === item.id || item.id === 'resume' ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#161923] border-white/10 text-slate-200 hover:bg-[#232736]'),
                                                children: item.label
                                            }, item.id);
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "text-[11px] text-slate-500 uppercase",
                                children: "Press Esc / Start to Resume"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex-1 p-6 overflow-y-auto",
                        children: [
                            pauseTab === 'main' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "max-w-xl bg-[#11131b] border border-white/15 p-5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                        className: "text-lg font-black uppercase tracking-wider text-[#F9A01B] mb-3",
                                        children: "Pro Stick Control Reference"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "grid grid-cols-2 gap-2.5 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p-2.5 bg-[#171b26] border border-white/10",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "WASD / Left Stick:"
                                                    }),
                                                    " Move"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p-2.5 bg-[#171b26] border border-white/10",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "Left Shift / RT:"
                                                    }),
                                                    " Sprint / Dunk"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p-2.5 bg-[#171b26] border border-white/10",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "Space (Hold):"
                                                    }),
                                                    " Shoot / Layup / Dunk"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p-2.5 bg-[#171b26] border border-white/10",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "Space (Tap):"
                                                    }),
                                                    " Pump Fake / Steal"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p-2.5 bg-[#171b26] border border-white/10",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "I / J / K / L:"
                                                    }),
                                                    " Pro Stick IsoMotion"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p-2.5 bg-[#171b26] border border-white/10",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "E / C+E / Z:"
                                                    }),
                                                    " Pass / Bounce / Flashy"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p-2.5 bg-[#171b26] border border-white/10",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "C + Space:"
                                                    }),
                                                    " Alley-Oop Lob"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p-2.5 bg-[#171b26] border border-white/10",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "R + 1-5:"
                                                    }),
                                                    " Icon Pass"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p-2.5 bg-[#171b26] border border-white/10",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "F:"
                                                    }),
                                                    " Post-Up / Block & Rebound"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p-2.5 bg-[#171b26] border border-white/10",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "V:"
                                                    }),
                                                    " Pick & Roll / Take Charge"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p-2.5 bg-[#171b26] border border-white/10",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "C / U:"
                                                    }),
                                                    " Intense D / Hands Up"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p-2.5 bg-[#171b26] border border-white/10",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "Arrow Keys:"
                                                    }),
                                                    " OTFC Coaching"
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            pauseTab === 'gameplan' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "max-w-2xl bg-[#11131b] border border-white/15 p-5 space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                        className: "text-lg font-black uppercase text-[#F9A01B] flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Shield, {
                                                className: "w-5 h-5"
                                            }),
                                            " Coach Gameplan & Lineup Substitutions"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-xs font-bold uppercase text-slate-400 mb-2",
                                                children: "Quick Rotation Preset"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "flex flex-wrap gap-2",
                                                children: [
                                                    'Starters',
                                                    'Bench',
                                                    'Tall',
                                                    '3PT',
                                                    'Defense'
                                                ].map(function(preset) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        type: "button",
                                                        onClick: function onClick() {
                                                            var _engineRef_current;
                                                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerOtfcAction({
                                                                subPreset: preset
                                                            });
                                                        },
                                                        className: "px-3 py-1.5 bg-[#1b202e] hover:bg-[#CE1141] border border-white/15 text-xs font-bold uppercase cursor-pointer",
                                                        children: preset
                                                    }, preset);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-xs font-bold uppercase text-slate-400 mb-2",
                                                children: "Defensive Set"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "flex flex-wrap gap-2",
                                                children: [
                                                    'Man-to-Man',
                                                    '2-3 Zone',
                                                    '3-2 Zone',
                                                    'Half-Court Trap',
                                                    'Full-Court Press'
                                                ].map(function(df) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        type: "button",
                                                        onClick: function onClick() {
                                                            var _engineRef_current;
                                                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerOtfcAction({
                                                                defenseSet: df
                                                            });
                                                        },
                                                        className: "px-3 py-1.5 border text-xs font-bold uppercase cursor-pointer " + (hud.otfc.defenseSet === df ? 'bg-[#CE1141] border-[#F9A01B]' : 'bg-[#1b202e] border-white/15'),
                                                        children: df
                                                    }, df);
                                                })
                                            })
                                        ]
                                    })
                                ]
                            }),
                            pauseTab === 'boxscore' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#11131b] border border-white/15 p-5 space-y-5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                        className: "text-lg font-black uppercase text-[#F9A01B] flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Users, {
                                                className: "w-5 h-5"
                                            }),
                                            " Live Game Box Score"
                                        ]
                                    }),
                                    [
                                        {
                                            label: hud.homeCode + ' (Home)',
                                            rows: homeBox
                                        },
                                        {
                                            label: hud.awayCode + ' (Away)',
                                            rows: awayBox
                                        }
                                    ].map(function(grp) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-xs font-black uppercase text-slate-300 mb-1.5",
                                                    children: grp.label
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("table", {
                                                    className: "w-full text-xs font-mono tabular-nums border-collapse",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("thead", {
                                                            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                                className: "border-b border-white/15 text-slate-400 text-left",
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                        className: "py-1.5",
                                                                        children: "Player"
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                        children: "PTS"
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                        children: "FG"
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                        children: "3PT"
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
                                                                        children: "PF"
                                                                    })
                                                                ]
                                                            })
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("tbody", {
                                                            children: grp.rows.map(function(r) {
                                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                                    className: "border-b border-white/5",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                                            className: "py-1.5 font-sans font-semibold text-white",
                                                                            children: [
                                                                                "#",
                                                                                r.jersey,
                                                                                " ",
                                                                                r.name
                                                                            ]
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                            className: "font-bold text-[#F9A01B]",
                                                                            children: r.pts
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                                            children: [
                                                                                r.fgm,
                                                                                "-",
                                                                                r.fga
                                                                            ]
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                                            children: [
                                                                                r.tpm,
                                                                                "-",
                                                                                r.tpa
                                                                            ]
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                            children: r.reb
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                            children: r.ast
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                            children: r.stl
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                            children: r.blk
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                            children: r.to
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                            children: r.pf
                                                                        })
                                                                    ]
                                                                }, r.playerId);
                                                            })
                                                        })
                                                    ]
                                                })
                                            ]
                                        }, grp.label);
                                    })
                                ]
                            }),
                            pauseTab === 'options' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#11131b] border border-white/15 p-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center gap-2 text-sm font-black uppercase text-[#F9A01B] mb-3",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Settings, {
                                                className: "w-4 h-4"
                                            }),
                                            " Live Match Options & Sliders"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_OptionsSuiteView.OptionsSuiteView, {
                                        settings: settings,
                                        onChange: onUpdateSettings,
                                        compact: true
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
            summary && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "fixed inset-0 z-45 bg-[#090a0d]/95 flex items-center justify-center p-4 overflow-y-auto",
                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "w-full max-w-4xl bg-[#11131b] border border-[#CE1141] shadow-2xl overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "bg-gradient-to-r from-[#18070c] via-[#CE1141]/35 to-[#18070c] px-6 py-4 border-b border-white/15 flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "text-[11px] font-bold uppercase tracking-widest text-[#F9A01B]",
                                            children: [
                                                config.title,
                                                " \xb7 Final"
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-3xl font-black uppercase tracking-tight",
                                            children: summary.userWon ? 'VICTORY' : 'FINAL BUZZER'
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex items-center gap-6 font-mono tabular-nums",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "text-center",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-xs text-slate-300 uppercase",
                                                    children: hud == null ? void 0 : hud.awayCode
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-4xl font-black",
                                                    children: summary.awayScore
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "text-slate-500 text-xl",
                                            children: "—"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "text-center",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-xs text-slate-300 uppercase",
                                                    children: hud == null ? void 0 : hud.homeCode
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-4xl font-black text-[#F9A01B]",
                                                    children: summary.homeScore
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "flex border-b border-white/10 bg-[#0d0f15] px-4",
                            children: [
                                [
                                    'pog',
                                    'Player of the Game'
                                ],
                                [
                                    'home',
                                    "" + ((_ref3 = hud == null ? void 0 : hud.homeCode) != null ? _ref3 : 'Home') + " Box"
                                ],
                                [
                                    'away',
                                    "" + ((_ref4 = hud == null ? void 0 : hud.awayCode) != null ? _ref4 : 'Away') + " Box"
                                ],
                                [
                                    'payout',
                                    'VC / SP Payout'
                                ]
                            ].map(function(param) {
                                var id = param[0], label = param[1];
                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    onClick: function onClick() {
                                        return setPostTab(id);
                                    },
                                    className: "px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer " + (postTab === id ? 'border-[#CE1141] text-white' : 'border-transparent text-slate-400 hover:text-white'),
                                    children: label
                                }, id);
                            })
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p-6 min-h-[260px]",
                            children: [
                                postTab === 'pog' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "bg-[#171a24] border border-[#F9A01B]/50 p-5",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#F9A01B]",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Trophy, {
                                                            className: "w-4 h-4"
                                                        }),
                                                        " Jordan Brand Player of the Game"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-2xl font-black uppercase mt-2",
                                                    children: [
                                                        "#",
                                                        summary.playerOfGame.jersey,
                                                        " ",
                                                        summary.playerOfGame.name
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "grid grid-cols-5 gap-2 mt-4 font-mono tabular-nums text-center",
                                                    children: [
                                                        [
                                                            'PTS',
                                                            summary.playerOfGame.pts
                                                        ],
                                                        [
                                                            'REB',
                                                            summary.playerOfGame.reb
                                                        ],
                                                        [
                                                            'AST',
                                                            summary.playerOfGame.ast
                                                        ],
                                                        [
                                                            'STL',
                                                            summary.playerOfGame.stl
                                                        ],
                                                        [
                                                            'BLK',
                                                            summary.playerOfGame.blk
                                                        ]
                                                    ].map(function(param) {
                                                        var k = param[0], v = param[1];
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "bg-[#0e1017] border border-white/10 py-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-[10px] text-slate-400",
                                                                    children: k
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-lg font-black text-white",
                                                                    children: v
                                                                })
                                                            ]
                                                        }, String(k));
                                                    })
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "bg-[#171a24] border border-white/15 p-5",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-xs font-black uppercase tracking-widest text-slate-300 mb-3",
                                                    children: "Scoring By Quarter"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("table", {
                                                    className: "w-full text-xs font-mono tabular-nums",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("thead", {
                                                            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                                className: "text-slate-400 border-b border-white/10",
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                        className: "text-left py-1",
                                                                        children: "Team"
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                        children: "Q1"
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                        children: "Q2"
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                        children: "Q3"
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                        children: "Q4"
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                        children: "TOT"
                                                                    })
                                                                ]
                                                            })
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("tbody", {
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                                    className: "border-b border-white/10",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                            className: "py-2 font-sans font-bold",
                                                                            children: hud == null ? void 0 : hud.awayCode
                                                                        }),
                                                                        summary.quarterScoresAway.map(function(q, i) {
                                                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                                className: "text-center",
                                                                                children: q
                                                                            }, i);
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                            className: "text-center font-black",
                                                                            children: summary.awayScore
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                            className: "py-2 font-sans font-bold",
                                                                            children: hud == null ? void 0 : hud.homeCode
                                                                        }),
                                                                        summary.quarterScoresHome.map(function(q, i) {
                                                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                                className: "text-center",
                                                                                children: q
                                                                            }, i);
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                            className: "text-center font-black text-[#F9A01B]",
                                                                            children: summary.homeScore
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
                                }),
                                (postTab === 'home' || postTab === 'away') && /*#__PURE__*/ (0, _jsxruntime.jsxs)("table", {
                                    className: "w-full text-xs font-mono tabular-nums",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("thead", {
                                            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                className: "text-slate-400 border-b border-white/15 text-left",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                        className: "py-1.5",
                                                        children: "Player"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                        children: "PTS"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                        children: "FG"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                        children: "3PT"
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
                                                    })
                                                ]
                                            })
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("tbody", {
                                            children: summary.boxScore.filter(function(b) {
                                                return b.teamSide === postTab;
                                            }).map(function(r) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                    className: "border-b border-white/5",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                            className: "py-1.5 font-sans font-semibold text-white",
                                                            children: [
                                                                "#",
                                                                r.jersey,
                                                                " ",
                                                                r.name
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                            className: "font-bold text-[#F9A01B]",
                                                            children: r.pts
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                            children: [
                                                                r.fgm,
                                                                "-",
                                                                r.fga
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                            children: [
                                                                r.tpm,
                                                                "-",
                                                                r.tpa
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                            children: r.reb
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                            children: r.ast
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                            children: r.stl
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                            children: r.blk
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                            children: r.to
                                                        })
                                                    ]
                                                }, r.playerId);
                                            })
                                        })
                                    ]
                                }),
                                postTab === 'payout' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "grid grid-cols-2 md:grid-cols-4 gap-3 font-mono tabular-nums",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-4 bg-[#171a24] border border-[#F9A01B]/50",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-[10px] uppercase text-slate-400 font-sans",
                                                    children: "VC Earned"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-2xl font-black text-[#F9A01B] mt-1",
                                                    children: [
                                                        "+",
                                                        summary.vcEarned
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-4 bg-[#171a24] border border-white/15",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-[10px] uppercase text-slate-400 font-sans",
                                                    children: "Skill Points (SP)"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-2xl font-black text-emerald-400 mt-1",
                                                    children: [
                                                        "+",
                                                        summary.spEarned
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-4 bg-[#171a24] border border-white/15",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-[10px] uppercase text-slate-400 font-sans",
                                                    children: "Teammate Grade"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-2xl font-black text-white mt-1",
                                                    children: summary.teammateGrade
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-4 bg-[#171a24] border border-white/15",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-[10px] uppercase text-slate-400 font-sans",
                                                    children: "MyTEAM MT / REP"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-2xl font-black text-sky-400 mt-1",
                                                    children: [
                                                        "+",
                                                        summary.mtEarned,
                                                        " / +",
                                                        summary.repEarned
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "px-6 py-4 bg-[#0d0f15] border-t border-white/15 flex items-center justify-end gap-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    onClick: handleRestart,
                                    className: "px-4 py-2 bg-[#1c202c] hover:bg-[#272c3c] border border-white/20 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.RotateCcw, {
                                            className: "w-3.5 h-3.5"
                                        }),
                                        " Rematch"
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    onClick: onQuitToMenu,
                                    className: "px-5 py-2 bg-[#CE1141] hover:bg-rose-600 border border-[#F9A01B] text-xs font-black uppercase tracking-wider cursor-pointer",
                                    children: "Continue to 2K14 Hub"
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
