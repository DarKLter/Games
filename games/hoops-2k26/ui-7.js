(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/hud/MatchHUD ===
ArcadeMod.define("src/games/hoops-2k26/hud/MatchHUD", function(require, module, exports) {
// ============================================================================
// PART 5 — DUAL-ERA BROADCAST IN-MATCH BATTLEFIELD HUD (MatchHUD.tsx)
// - 2K14_CLASSIC (Bottom-Right metallic crimson-chrome scorebug)
// - 2K26_NEXTGEN (Bottom-Left or Top-Center obsidian neon scorebug + flip ticker)
// - BLACKTOP Streetball compact scoreboard (Score vs Target + Win Streak)
// - Top-Left Cluster: Pause, Cam, Tactics/Mark, 2K14/2K26 Toggle, Touch Toggle, Telemetry
// - Top-Right Cluster: Circular Teammate Grade (F..A+) + 3-Event Feed, Shot Feedback,
//   and 5-Tier Animated Badge Pop-Up Stack
// - Center Splash Banners, 3D-Projected Alley-Oop Prompt, 3D-Projected Icon Passing [1-5]
// - Compact Controlled Player Stamina / 3-Bar Adrenaline / Takeover Bar
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MatchHUD", {
    enumerable: true,
    get: function() {
        return MatchHUD;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _TeamLogo = require("../hybrid/TeamLogo");
var _courtTypes = require("../engine/courtTypes");
var _BadgeEngine = require("../engine/BadgeEngine");
var _SimTacticsAndReplay = require("../engine/SimTacticsAndReplay");
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
    var clamped = Math.max(0, sec);
    var m = Math.floor(clamped / 60);
    var s = Math.floor(clamped % 60);
    return m + ":" + (s < 10 ? '0' : '') + s;
}
function formatQuarterOrdinal(q) {
    if (q === 1) return '1ST';
    if (q === 2) return '2ND';
    if (q === 3) return '3RD';
    if (q === 4) return '4TH';
    return "OT" + (q - 4);
}
function renderTimeoutPips(count) {
    var total = 7;
    var pips = [];
    for(var i = 0; i < total; i++){
        pips.push(/*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
            className: "p5-to-pip " + (i < count ? 'on' : '')
        }, i));
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
        className: "p5-to-row",
        title: "" + count + " Timeouts Remaining",
        children: pips
    });
}
var MatchHUD = function MatchHUD(param) {
    var hud = param.hud, homeTeam = param.homeTeam, awayTeam = param.awayTeam, venue = param.venue, uiEraMode = param.uiEraMode, scoreboardEra = param.scoreboardEra, scorebugPosition2K26 = param.scorebugPosition2K26, activeCameraShortLabel = param.activeCameraShortLabel, showFpsTelemetry = param.showFpsTelemetry, showShotFeedback = param.showShotFeedback, fps = param.fps, frameMs = param.frameMs, winStreak = param.winStreak, tacticsOpen = param.tacticsOpen, touchControlsVisible = param.touchControlsVisible, tacticsLayout = param.tacticsLayout, _param_suppressDefaultGameOver = param.suppressDefaultGameOver, suppressDefaultGameOver = _param_suppressDefaultGameOver === void 0 ? false : _param_suppressDefaultGameOver, projectedAnchorsRef = param.projectedAnchorsRef, onOpenPause = param.onOpenPause, onCycleCamera = param.onCycleCamera, onToggleTactics = param.onToggleTactics, onToggleEra = param.onToggleEra, onToggleTouchControls = param.onToggleTouchControls, onIgniteTakeover = param.onIgniteTakeover, onTriggerIconPass = param.onTriggerIconPass, onAlleyOopPress = param.onAlleyOopPress, onRematch = param.onRematch, onExitToMenu = param.onExitToMenu;
    var _hud_targetScore;
    // Animated score flip bump detector
    var prevScoresRef = (0, _react.useRef)({
        away: hud.awayScore,
        home: hud.homeScore
    });
    var _useState = (0, _react.useState)(null), flipSide = _useState[0], setFlipSide = _useState[1];
    (0, _react.useEffect)(function() {
        if (hud.awayScore !== prevScoresRef.current.away) {
            prevScoresRef.current.away = hud.awayScore;
            setFlipSide('AWAY');
            var t = window.setTimeout(function() {
                return setFlipSide(null);
            }, 460);
            return function() {
                return window.clearTimeout(t);
            };
        }
        if (hud.homeScore !== prevScoresRef.current.home) {
            prevScoresRef.current.home = hud.homeScore;
            setFlipSide('HOME');
            var t1 = window.setTimeout(function() {
                return setFlipSide(null);
            }, 460);
            return function() {
                return window.clearTimeout(t1);
            };
        }
        return undefined;
    }, [
        hud.awayScore,
        hud.homeScore
    ]);
    var effectiveEra = scoreboardEra === '2K14_METALLIC' ? '2K14_CLASSIC' : scoreboardEra === '2K26_OBSIDIAN' ? '2K26_NEXTGEN' : uiEraMode === '2K14_CLASSIC' ? '2K14_CLASSIC' : '2K26_NEXTGEN';
    var gradeColor = (0, _SimTacticsAndReplay.getGradeColor)(hud.teammateGrade.letter);
    var gradeCirc = 2 * Math.PI * 20;
    var gradeFill = gradeCirc * Math.max(0.06, hud.teammateGrade.score / 100);
    var anchors = projectedAnchorsRef.current;
    // Projected Alley-Oop finisher screen position
    var oopAnchor = hud.activeAlleyOopReceiverId ? anchors.players[hud.activeAlleyOopReceiverId] : undefined;
    var oopStyle = oopAnchor && oopAnchor.visible ? {
        left: "" + Math.max(120, Math.min((anchors.width || 960) - 120, oopAnchor.headX)) + "px",
        top: "" + Math.max(100, Math.min((anchors.height || 540) - 120, oopAnchor.headY - 46)) + "px",
        transform: 'translate(-50%, -50%)'
    } : undefined;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "p5-hud-root era-" + effectiveEra.toLowerCase(),
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "p5-top-left-cluster",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        className: "p5-hud-pill pause",
                        onClick: onOpenPause,
                        title: "Pause Match & Instant Replay [Esc]",
                        children: "⏸ PAUSE"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        type: "button",
                        className: "p5-hud-pill",
                        onClick: onCycleCamera,
                        title: "Cycle 7 Cameras [V]",
                        children: [
                            "\uD83D\uDCF7 ",
                            activeCameraShortLabel
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        className: "p5-hud-pill " + (tacticsOpen ? 'active' : ''),
                        style: tacticsLayout ? {
                            transform: "translate(" + tacticsLayout.x + "px, " + tacticsLayout.y + "px) scale(" + Math.max(0.5, Math.min(1.5, tacticsLayout.scale)) + ")",
                            opacity: Math.max(0.2, Math.min(1, tacticsLayout.opacity))
                        } : undefined,
                        onClick: onToggleTactics,
                        title: "Coach Tactics & Enemy Star Marking [1-4]",
                        children: "\uD83D\uDCCB TACTICS / \uD83C\uDFAF MARK"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        type: "button",
                        className: "p5-hud-pill era-btn",
                        onClick: onToggleEra,
                        title: "Instant Live HUD Era Switch (2K14 Classic / 2K26 Next-Gen)",
                        children: [
                            "\uD83D\uDD04 ",
                            effectiveEra === '2K14_CLASSIC' ? '2K14' : '2K26'
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        type: "button",
                        className: "p5-hud-pill " + (touchControlsVisible ? 'active' : ''),
                        onClick: onToggleTouchControls,
                        title: "Toggle Virtual Dual-Stick Touch Controls",
                        children: [
                            "\uD83C\uDFAE ",
                            touchControlsVisible ? 'PAD ON' : 'PAD'
                        ]
                    }),
                    showFpsTelemetry && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                        className: "p5-telemetry-chip",
                        children: [
                            fps,
                            " FPS | ",
                            frameMs,
                            "ms"
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "p5-top-right-cluster",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-grade-card",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p5-grade-ring-wrap",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
                                        width: "50",
                                        height: "50",
                                        viewBox: "0 0 50 50",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                                                cx: "25",
                                                cy: "25",
                                                r: "20",
                                                fill: "rgba(9,12,20,0.88)",
                                                stroke: "rgba(255,255,255,0.14)",
                                                strokeWidth: "4"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                                                cx: "25",
                                                cy: "25",
                                                r: "20",
                                                fill: "none",
                                                stroke: gradeColor,
                                                strokeWidth: "4",
                                                strokeDasharray: gradeFill + " " + gradeCirc,
                                                strokeLinecap: "round",
                                                transform: "rotate(-90 25 25)"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                        className: "p5-grade-letter",
                                        style: {
                                            color: gradeColor
                                        },
                                        children: hud.teammateGrade.letter
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p5-grade-meta",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "p5-grade-kicker",
                                        children: "TEAMMATE GRADE"
                                    }),
                                    hud.teammateGrade.events.length > 0 ? /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "p5-grade-feed",
                                        children: hud.teammateGrade.events.slice(0, 3).map(function(ev) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "p5-grade-ev " + (ev.positive ? 'pos' : 'neg'),
                                                children: ev.label
                                            }, ev.id);
                                        })
                                    }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "p5-grade-sub",
                                        children: (0, _courtTypes.getVenueDisplayLabel)(venue)
                                    })
                                ]
                            })
                        ]
                    }),
                    showShotFeedback && hud.shotFeedback && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-shot-fb-banner " + (hud.shotFeedback.isGreen ? 'is-green' : ''),
                        "aria-live": "polite",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p5-shot-fb-row",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                        children: hud.shotFeedback.timingLabel
                                    }),
                                    hud.shotFeedback.rhythmLabel && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "p5-fb-rhythm",
                                        children: hud.shotFeedback.rhythmLabel
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "p5-fb-contest",
                                children: hud.shotFeedback.contestLabel
                            })
                        ]
                    }),
                    hud.badgeFeed.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "p5-badge-stack",
                        "aria-live": "polite",
                        children: hud.badgeFeed.slice(0, 4).map(function(ev) {
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p5-badge-card",
                                style: {
                                    borderLeftColor: _BadgeEngine.BADGE_TIER_COLOR[ev.tier]
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "p5-badge-tier",
                                        style: {
                                            color: _BadgeEngine.BADGE_TIER_COLOR[ev.tier]
                                        },
                                        children: [
                                            _BadgeEngine.BADGE_TIER_LABEL[ev.tier].toUpperCase(),
                                            " +",
                                            ev.boostPct,
                                            "%"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                        children: ev.badgeName
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "p5-badge-player",
                                        children: ev.playerName
                                    })
                                ]
                            }, ev.id);
                        })
                    })
                ]
            }),
            hud.splashBanner && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "p5-splash-banner tone-" + hud.splashBanner.tone.toLowerCase(),
                role: "status",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "p5-splash-title",
                        children: hud.splashBanner.title
                    }),
                    hud.splashBanner.subtitle && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "p5-splash-sub",
                        children: hud.splashBanner.subtitle
                    })
                ]
            }, hud.splashBanner.id),
            hud.timeoutHuddleSec > 0 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "p5-huddle-bar",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                        children: "COACH HUDDLE \xb7 STAMINA BOOSTING"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                        children: [
                            hud.timeoutHuddleSec.toFixed(1),
                            "s"
                        ]
                    })
                ]
            }),
            hud.alleyOopPrompt.active && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "p5-alleyoop-floating " + (oopStyle ? 'projected' : ''),
                style: oopStyle,
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-oop-ring-lbl",
                        children: [
                            "ALLEY-OOP \xb7 ",
                            hud.alleyOopPrompt.receiverName
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        type: "button",
                        className: "p5-oop-cta",
                        onClick: function onClick() {
                            return onAlleyOopPress('ANY');
                        },
                        children: [
                            "PRESS [",
                            hud.alleyOopPrompt.promptKey,
                            "] / TAP SLAM!"
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "p5-oop-timer-track",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "p5-oop-timer-fill",
                            style: {
                                width: "" + Math.max(0, Math.min(100, hud.alleyOopPrompt.remainingSec / Math.max(0.1, hud.alleyOopPrompt.durationSec) * 100)) + "%"
                            }
                        })
                    })
                ]
            }),
            hud.iconPassingActive && hud.iconTargets.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                children: [
                    hud.iconTargets.map(function(t) {
                        var pt = anchors.players[t.playerId];
                        if (!pt || !pt.visible) return null;
                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                            type: "button",
                            className: "p5-icon-pass-float",
                            style: {
                                left: "" + Math.max(48, Math.min((anchors.width || 960) - 48, pt.headX)) + "px",
                                top: "" + Math.max(58, Math.min((anchors.height || 540) - 68, pt.headY - 22)) + "px"
                            },
                            onClick: function onClick() {
                                return onTriggerIconPass(t.slotNum);
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                    children: [
                                        "[",
                                        t.slotNum,
                                        "]"
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: t.position
                                })
                            ]
                        }, t.playerId);
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-icon-pass-strip",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                children: "ICON PASS:"
                            }),
                            hud.iconTargets.map(function(t) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "p5-icon-strip-btn",
                                    onClick: function onClick() {
                                        return onTriggerIconPass(t.slotNum);
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                            children: [
                                                "[",
                                                t.slotNum,
                                                "]"
                                            ]
                                        }),
                                        " ",
                                        t.position,
                                        " ",
                                        t.lastName
                                    ]
                                }, t.playerId);
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "p5-player-bar " + (effectiveEra === '2K26_NEXTGEN' && scorebugPosition2K26 === 'BOTTOM_LEFT' ? 'above-2k26-bug' : '') + " " + (touchControlsVisible ? 'touch-shifted' : ''),
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-pb-top",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "p5-pb-pos",
                                children: hud.controlledPosition
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                className: "p5-pb-name",
                                children: hud.controlledPlayerName
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "p5-adren-row",
                                title: "2K26 3-Bar Adrenaline Boosts",
                                children: [
                                    0,
                                    1,
                                    2
                                ].map(function(i) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "p5-adren-pip " + (i < hud.controlledAdrenaline ? 'full' : '')
                                    }, i);
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-pb-bars",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "p5-stamina-track",
                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "p5-stamina-fill",
                                    style: {
                                        width: "" + Math.round(hud.controlledStamina * 100) + "%"
                                    }
                                })
                            }),
                            hud.controlledTakeover && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p5-tk-row",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "p5-tk-track",
                                        title: hud.controlledTakeover.perkLabel,
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "p5-tk-fill " + (hud.controlledTakeover.ignited ? 'ignited' : ''),
                                            style: {
                                                width: "" + Math.round(hud.controlledTakeover.meter) + "%"
                                            }
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "p5-tk-lvl",
                                        children: hud.controlledTakeover.ignited ? "\uD83D\uDD25 " + Math.ceil(hud.controlledTakeover.igniteRemainingSec) + "s" : "LV." + hud.controlledTakeover.level
                                    }),
                                    hud.controlledTakeover.readyToIgnite && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "p5-tk-ignite",
                                        onClick: onIgniteTakeover,
                                        children: "\uD83D\uDD25 IGNITE [T]"
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
            hud.isBlacktop ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("aside", {
                className: "p5-scorebug-blacktop",
                "aria-label": "Streetball Scoreboard",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-bt-side",
                        style: {
                            borderLeftColor: awayTeam.colors.primary
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                children: awayTeam.abbr
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                className: flipSide === 'AWAY' ? 'flip' : '',
                                children: hud.awayScore
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-bt-mid",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "p5-bt-target",
                                children: [
                                    "TO ",
                                    (_hud_targetScore = hud.targetScore) != null ? _hud_targetScore : 21
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "p5-bt-streak",
                                children: [
                                    "STREAK ",
                                    winStreak,
                                    "\uD83D\uDD25"
                                ]
                            }),
                            hud.phase === 'CHECK_BALL' && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "p5-bt-check",
                                children: "CHECK BALL"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-bt-side",
                        style: {
                            borderRightColor: homeTeam.colors.primary
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                className: flipSide === 'HOME' ? 'flip' : '',
                                children: hud.homeScore
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                children: homeTeam.abbr
                            })
                        ]
                    })
                ]
            }) : effectiveEra === '2K14_CLASSIC' ? /* NBA 2K14 CLASSIC BOTTOM-RIGHT METALLIC CRIMSON BROADCAST SCOREBUG */ /*#__PURE__*/ (0, _jsxruntime.jsxs)("aside", {
                className: "p5-scorebug-2k14 " + (touchControlsVisible ? 'touch-lifted' : ''),
                "aria-label": "2K14 Classic Broadcast Scorebug",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-2k14-teams",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p5-2k14-row " + (hud.possession === 'AWAY' ? 'poss' : ''),
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_TeamLogo.TeamLogo, {
                                        id: awayTeam.id,
                                        abbr: awayTeam.abbr,
                                        name: awayTeam.name,
                                        era: awayTeam.era,
                                        primaryColor: awayTeam.colors.primary,
                                        secondaryColor: awayTeam.colors.secondary,
                                        accentColor: awayTeam.colors.accent,
                                        size: 22
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p5-2k14-team-col",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "p5-2k14-abbr",
                                                children: [
                                                    awayTeam.abbr,
                                                    hud.possession === 'AWAY' && /*#__PURE__*/ (0, _jsxruntime.jsx)("em", {
                                                        className: "p5-poss-dot",
                                                        children: "▸"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p5-2k14-sub",
                                                children: [
                                                    renderTimeoutPips(hud.awayTimeouts),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "p5-foul-tag " + (hud.awayInBonus ? 'bonus' : ''),
                                                        children: hud.awayInBonus ? 'BONUS' : "F:" + hud.awayFouls
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                        className: "p5-2k14-score " + (flipSide === 'AWAY' ? 'flip' : ''),
                                        children: hud.awayScore
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p5-2k14-row " + (hud.possession === 'HOME' ? 'poss' : ''),
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_TeamLogo.TeamLogo, {
                                        id: homeTeam.id,
                                        abbr: homeTeam.abbr,
                                        name: homeTeam.name,
                                        era: homeTeam.era,
                                        primaryColor: homeTeam.colors.primary,
                                        secondaryColor: homeTeam.colors.secondary,
                                        accentColor: homeTeam.colors.accent,
                                        size: 22
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p5-2k14-team-col",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "p5-2k14-abbr",
                                                children: [
                                                    homeTeam.abbr,
                                                    hud.possession === 'HOME' && /*#__PURE__*/ (0, _jsxruntime.jsx)("em", {
                                                        className: "p5-poss-dot",
                                                        children: "▸"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p5-2k14-sub",
                                                children: [
                                                    renderTimeoutPips(hud.homeTimeouts),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "p5-foul-tag " + (hud.homeInBonus ? 'bonus' : ''),
                                                        children: hud.homeInBonus ? 'BONUS' : "F:" + hud.homeFouls
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                        className: "p5-2k14-score " + (flipSide === 'HOME' ? 'flip' : ''),
                                        children: hud.homeScore
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-2k14-clock",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "p5-2k14-qtr",
                                children: formatQuarterOrdinal(hud.quarter)
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                className: "p5-2k14-time",
                                children: formatClock(hud.quarterClockSec)
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "p5-2k14-sc " + (hud.shotClockSec < 5 ? 'danger' : ''),
                                children: hud.shotClockSec < 5 ? hud.shotClockSec.toFixed(1) : Math.ceil(hud.shotClockSec)
                            })
                        ]
                    })
                ]
            }) : /* NBA 2K26 NEXT-GEN OBSIDIAN NEON SCOREBUG (BOTTOM-LEFT OR TOP-CENTER) */ /*#__PURE__*/ (0, _jsxruntime.jsxs)("aside", {
                className: "p5-scorebug-2k26 pos-" + scorebugPosition2K26.toLowerCase() + " " + (touchControlsVisible && scorebugPosition2K26 === 'BOTTOM_LEFT' ? 'touch-lifted' : ''),
                style: scorebugPosition2K26 === 'BOTTOM_RIGHT' ? {
                    left: 'auto',
                    right: 16,
                    bottom: touchControlsVisible ? 156 : 16
                } : undefined,
                "aria-label": "2K26 Next-Gen Scorebug",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-2k26-team " + (hud.possession === 'AWAY' ? 'poss' : ''),
                        style: {
                            borderLeftColor: awayTeam.colors.primary
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_TeamLogo.TeamLogo, {
                                id: awayTeam.id,
                                abbr: awayTeam.abbr,
                                name: awayTeam.name,
                                era: awayTeam.era,
                                primaryColor: awayTeam.colors.primary,
                                secondaryColor: awayTeam.colors.secondary,
                                accentColor: awayTeam.colors.accent,
                                size: 22
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p5-2k26-meta",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "p5-2k26-abbr",
                                        children: [
                                            awayTeam.abbr,
                                            hud.possession === 'AWAY' && /*#__PURE__*/ (0, _jsxruntime.jsx)("em", {
                                                className: "p5-poss-arrow",
                                                children: "◀"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p5-2k26-sub",
                                        children: [
                                            renderTimeoutPips(hud.awayTimeouts),
                                            hud.awayInBonus && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "p5-bonus-pill",
                                                children: "BONUS"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                className: "p5-2k26-pts " + (flipSide === 'AWAY' ? 'flip' : ''),
                                children: hud.awayScore
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-2k26-clock",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "p5-2k26-qtr",
                                children: formatQuarterOrdinal(hud.quarter)
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                className: "p5-2k26-time",
                                children: formatClock(hud.quarterClockSec)
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "p5-2k26-sc " + (hud.shotClockSec < 5 ? 'danger' : ''),
                                children: hud.shotClockSec < 5 ? hud.shotClockSec.toFixed(1) : Math.ceil(hud.shotClockSec)
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-2k26-team right " + (hud.possession === 'HOME' ? 'poss' : ''),
                        style: {
                            borderRightColor: homeTeam.colors.primary
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                className: "p5-2k26-pts " + (flipSide === 'HOME' ? 'flip' : ''),
                                children: hud.homeScore
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p5-2k26-meta right",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "p5-2k26-abbr",
                                        children: [
                                            hud.possession === 'HOME' && /*#__PURE__*/ (0, _jsxruntime.jsx)("em", {
                                                className: "p5-poss-arrow",
                                                children: "▶"
                                            }),
                                            homeTeam.abbr
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p5-2k26-sub",
                                        children: [
                                            hud.homeInBonus && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "p5-bonus-pill",
                                                children: "BONUS"
                                            }),
                                            renderTimeoutPips(hud.homeTimeouts)
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_TeamLogo.TeamLogo, {
                                id: homeTeam.id,
                                abbr: homeTeam.abbr,
                                name: homeTeam.name,
                                era: homeTeam.era,
                                primaryColor: homeTeam.colors.primary,
                                secondaryColor: homeTeam.colors.secondary,
                                accentColor: homeTeam.colors.accent,
                                size: 22
                            })
                        ]
                    })
                ]
            }),
            hud.phase === 'GAME_OVER' && !suppressDefaultGameOver && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "p5-gameover-overlay",
                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "p5-gameover-card",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "p5-go-kicker",
                            children: "FINAL BUZZER \xb7 PROPLAY BOX SCORE"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("h2", {
                            children: [
                                hud.winnerSide === 'HOME' ? homeTeam.city + " " + homeTeam.name : awayTeam.city + " " + awayTeam.name,
                                ' ',
                                "WIN!"
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p5-go-scoreline",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                    children: [
                                        awayTeam.abbr,
                                        " ",
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: hud.awayScore
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: "—"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: hud.homeScore
                                        }),
                                        " ",
                                        homeTeam.abbr
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "p5-go-table-wrap",
                            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("table", {
                                className: "p5-box-table",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("thead", {
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                    children: "PLAYER"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                    children: "TEAM"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                    children: "PTS"
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
                                                    children: "FG"
                                                })
                                            ]
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("tbody", {
                                        children: hud.boxScore.map(function(row) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                        children: [
                                                            "#",
                                                            row.jersey,
                                                            " ",
                                                            row.name
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        children: row.teamSide === 'HOME' ? homeTeam.abbr : awayTeam.abbr
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                            children: row.pts
                                                        })
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        children: row.reb
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        children: row.ast
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        children: row.stl
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        children: row.blk
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                        children: [
                                                            row.fgm,
                                                            "/",
                                                            row.fga
                                                        ]
                                                    })
                                                ]
                                            }, row.playerId);
                                        })
                                    })
                                ]
                            })
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p5-go-actions",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "p5-go-btn primary",
                                    onClick: onRematch,
                                    children: "PLAY REMATCH"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "p5-go-btn",
                                    onClick: onExitToMenu,
                                    children: "EXIT TO MENU"
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
// === MODULE: src/games/hoops-2k26/hud/PauseMenuModal ===
ArcadeMod.define("src/games/hoops-2k26/hud/PauseMenuModal", function(require, module, exports) {
// ============================================================================
// PART 5 — FULL PAUSE MENU MODAL & 4-SECOND INSTANT REPLAY (PauseMenuModal.tsx)
// Tabs: Resume, Instant Replay (4s scrub + play/pause + slow-mo + 7 cams),
// Live Box Score, Coach Gameplan, Camera Settings, 7-Tab Settings, Quit to Menu
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PauseMenuModal", {
    enumerable: true,
    get: function() {
        return PauseMenuModal;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _courtTypes = require("../engine/courtTypes");
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
var OFFENSE_OPTIONS = [
    {
        id: 'PICK_AND_ROLL',
        label: 'Smart Play (PnR)'
    },
    {
        id: 'FIVE_OUT',
        label: '5-Out Iso'
    },
    {
        id: 'MOTION_CUT',
        label: 'Motion Cut'
    },
    {
        id: 'HORNS',
        label: 'Horns Pick & Pop'
    },
    {
        id: 'FLOPPY',
        label: 'Floppy 3PT'
    },
    {
        id: 'OFF',
        label: 'Freelance (Off)'
    }
];
var DEFENSE_OPTIONS = [
    {
        id: 'MAN_TO_MAN',
        label: 'Man-to-Man'
    },
    {
        id: 'ZONE_2_3',
        label: '2-3 Zone'
    },
    {
        id: 'ZONE_3_2',
        label: '3-2 Zone'
    },
    {
        id: 'FULL_COURT_PRESS',
        label: 'Full-Court Press'
    },
    {
        id: 'HALF_COURT_TRAP',
        label: 'Half-Court Trap'
    }
];
var LINEUP_OPTIONS = [
    {
        id: 'STARTERS',
        label: 'Starters'
    },
    {
        id: 'SHOOTERS',
        label: '3PT Shooters'
    },
    {
        id: 'TALL',
        label: 'Tall Lineup'
    },
    {
        id: 'DEFENSIVE',
        label: 'Defensive'
    }
];
var PauseMenuModal = function PauseMenuModal(param) {
    var open = param.open, hud = param.hud, homeTeam = param.homeTeam, awayTeam = param.awayTeam, cameraSettings = param.cameraSettings, onResume = param.onResume, onPreviewReplayFrame = param.onPreviewReplayFrame, onRestoreLiveFrame = param.onRestoreLiveFrame, onSetOffensivePlay = param.onSetOffensivePlay, onSetDefensiveScheme = param.onSetDefensiveScheme, onApplyLineupPreset = param.onApplyLineupPreset, onCallTimeout = param.onCallTimeout, onUpdateCamera = param.onUpdateCamera, onOpenFullSettings = param.onOpenFullSettings, onOpenInstantReplay = param.onOpenInstantReplay, onRematch = param.onRematch, onLaunchLegacyCourt = param.onLaunchLegacyCourt, onQuitToMenu = param.onQuitToMenu;
    var _hud_userTeamSide;
    var _useState = (0, _react.useState)('MENU'), tab = _useState[0], setTab = _useState[1];
    var _useState1 = (0, _react.useState)(false), replayPlaying = _useState1[0], setReplayPlaying = _useState1[1];
    var _useState2 = (0, _react.useState)(0.5), replaySpeed = _useState2[0], setReplaySpeed = _useState2[1];
    var _useState3 = (0, _react.useState)(0), replayIndex = _useState3[0], setReplayIndex = _useState3[1];
    var maxReplayIdx = Math.max(0, hud.replayFrameCount - 1);
    (0, _react.useEffect)(function() {
        if (!open) {
            setReplayPlaying(false);
            setTab('MENU');
            return;
        }
        setReplayIndex(Math.max(0, hud.replayFrameCount - 1));
    }, [
        open,
        hud.replayFrameCount
    ]);
    // Replay playback ticker (30 Hz base scaled by 0.25x / 0.5x / 1x)
    (0, _react.useEffect)(function() {
        if (!open || tab !== 'REPLAY' || !replayPlaying || maxReplayIdx <= 0) return;
        var stepMs = Math.max(16, Math.round(1000 / 30 / replaySpeed));
        var timer = window.setInterval(function() {
            setReplayIndex(function(prev) {
                var next = prev >= maxReplayIdx ? 0 : prev + 1;
                onPreviewReplayFrame(next);
                return next;
            });
        }, stepMs);
        return function() {
            return window.clearInterval(timer);
        };
    }, [
        open,
        tab,
        replayPlaying,
        replaySpeed,
        maxReplayIdx,
        onPreviewReplayFrame
    ]);
    if (!open) return null;
    var enterReplay = function enterReplay() {
        if (onOpenInstantReplay) {
            onOpenInstantReplay();
            return;
        }
        setTab('REPLAY');
        var startIdx = Math.max(0, Math.min(maxReplayIdx, Math.floor(maxReplayIdx * 0.2)));
        setReplayIndex(startIdx);
        if (hud.replayFrameCount > 0) {
            onPreviewReplayFrame(startIdx);
            setReplayPlaying(true);
        }
    };
    var leaveReplayTo = function leaveReplayTo(nextTab) {
        setReplayPlaying(false);
        onRestoreLiveFrame();
        setTab(nextTab);
    };
    var userSide = (_hud_userTeamSide = hud.userTeamSide) != null ? _hud_userTeamSide : 'HOME';
    var userTimeouts = userSide === 'HOME' ? hud.homeTimeouts : hud.awayTimeouts;
    // Compact floating bottom bar during Instant Replay so the 3D court stays 100% visible!
    if (tab === 'REPLAY') {
        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "p5-replay-bar",
            role: "dialog",
            "aria-label": "Instant Replay Controls",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "p5-replay-head",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    className: "p5-replay-kicker",
                                    children: "INSTANT REPLAY \xb7 4-SEC PROPLAY BUFFER"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                    children: [
                                        "FRAME ",
                                        replayIndex + 1,
                                        " / ",
                                        Math.max(1, hud.replayFrameCount)
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "p5-replay-cam-pills",
                            children: _courtTypes.CAMERA_ANGLE_OPTIONS.slice(0, 5).map(function(c) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "p5-rep-pill " + (cameraSettings.angle === c.id ? 'active' : ''),
                                    onClick: function onClick() {
                                        return onUpdateCamera({
                                            angle: c.id
                                        });
                                    },
                                    children: c.shortLabel
                                }, c.id);
                            })
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            className: "p5-rep-exit",
                            onClick: function onClick() {
                                return leaveReplayTo('MENU');
                            },
                            children: "◀ BACK TO PAUSE"
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "p5-replay-controls",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            className: "p5-rep-btn primary",
                            disabled: hud.replayFrameCount === 0,
                            onClick: function onClick() {
                                return setReplayPlaying(function(v) {
                                    return !v;
                                });
                            },
                            children: replayPlaying ? '⏸ PAUSE' : '▶ PLAY'
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                            type: "range",
                            className: "p5-rep-scrubber",
                            min: 0,
                            max: maxReplayIdx,
                            value: Math.min(replayIndex, maxReplayIdx),
                            disabled: hud.replayFrameCount === 0,
                            onChange: function onChange(e) {
                                var idx = Number(e.target.value);
                                setReplayPlaying(false);
                                setReplayIndex(idx);
                                onPreviewReplayFrame(idx);
                            }
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "p5-rep-speeds",
                            children: [
                                0.25,
                                0.5,
                                1
                            ].map(function(sp) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "p5-rep-pill " + (replaySpeed === sp ? 'active' : ''),
                                    onClick: function onClick() {
                                        return setReplaySpeed(sp);
                                    },
                                    children: [
                                        sp,
                                        "x"
                                    ]
                                }, sp);
                            })
                        })
                    ]
                })
            ]
        });
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "p5-pause-backdrop",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Match Pause Menu",
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "p5-pause-modal",
            onClick: function onClick(e) {
                return e.stopPropagation();
            },
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                    className: "p5-pause-header",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p5-pause-kicker",
                                    children: [
                                        "MATCH PAUSED \xb7 ",
                                        hud.quarterLabel
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("h2", {
                                    children: [
                                        awayTeam.abbr,
                                        " ",
                                        hud.awayScore,
                                        " — ",
                                        hud.homeScore,
                                        " ",
                                        homeTeam.abbr
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            className: "p5-pause-resume-top",
                            onClick: onResume,
                            children: "▶ RESUME [ESC]"
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("nav", {
                    className: "p5-pause-tabs",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            className: "p5-ptab " + (tab === 'MENU' ? 'active' : ''),
                            onClick: function onClick() {
                                return setTab('MENU');
                            },
                            children: "Pause Menu"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                            type: "button",
                            className: "p5-ptab",
                            onClick: enterReplay,
                            children: [
                                "\uD83C\uDFAC Instant Replay (",
                                hud.replayFrameCount,
                                ")"
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            className: "p5-ptab " + (tab === 'BOX_SCORE' ? 'active' : ''),
                            onClick: function onClick() {
                                return setTab('BOX_SCORE');
                            },
                            children: "\uD83D\uDCCA Box Score"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            className: "p5-ptab " + (tab === 'GAMEPLAN' ? 'active' : ''),
                            onClick: function onClick() {
                                return setTab('GAMEPLAN');
                            },
                            children: "\uD83D\uDCCB Gameplan"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            className: "p5-ptab " + (tab === 'CAMERA' ? 'active' : ''),
                            onClick: function onClick() {
                                return setTab('CAMERA');
                            },
                            children: "\uD83D\uDCF7 Camera"
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "p5-pause-body",
                    children: [
                        tab === 'MENU' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p5-pause-menu-grid",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "p5-pm-card primary",
                                    onClick: onResume,
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "▶ RESUME MATCH"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            children: "Return directly to live 3D hardwood action"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "p5-pm-card",
                                    onClick: enterReplay,
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "\uD83C\uDFAC INSTANT REPLAY"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            children: "Scrub the last 4 seconds from any of the 7 cameras"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "p5-pm-card",
                                    onClick: function onClick() {
                                        return setTab('BOX_SCORE');
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "\uD83D\uDCCA LIVE BOX SCORE"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            children: "Points, Rebounds, Assists, Steals, Blocks & FG%"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "p5-pm-card",
                                    onClick: function onClick() {
                                        return setTab('GAMEPLAN');
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "\uD83D\uDCCB COACH GAMEPLAN"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            children: "Offensive Sets, Defensive Schemes, Subs & Timeouts"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "p5-pm-card",
                                    onClick: function onClick() {
                                        return setTab('CAMERA');
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "\uD83D\uDCF7 CAMERA SETTINGS"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            children: "Switch 7 authentic 2K angles, Zoom, Height & Auto-Flip"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "p5-pm-card",
                                    onClick: function onClick() {
                                        return onOpenFullSettings('CONTROLLER');
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "⚙ 7-TAB SETTINGS"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            children: "5 Shot Meter styles, Rhythm Profiles, Audio & Sliders"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "p5-pm-card",
                                    onClick: onRematch,
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "\uD83D\uDD01 RESTART TIP-OFF"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            children: "Reset score & clocks for a fresh opening jump ball"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "p5-pm-card",
                                    onClick: onLaunchLegacyCourt,
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "\uD83D\uDD79️ CLASSIC ARCADE 3D"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            children: "Switch to the classic 3D arcade basketball arena"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "p5-pm-card danger",
                                    onClick: onQuitToMenu,
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "✖ QUIT TO MAIN MENU"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            children: "Leave current match and return to Hybrid Main Menu"
                                        })
                                    ]
                                })
                            ]
                        }),
                        tab === 'BOX_SCORE' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "p5-pause-box-wrap",
                            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("table", {
                                className: "p5-box-table",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("thead", {
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                    children: "PLAYER"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                    children: "TEAM"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                    children: "PTS"
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
                                                    children: "FG"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                    children: "3PT"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                    children: "PF"
                                                })
                                            ]
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("tbody", {
                                        children: hud.boxScore.map(function(row) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                        children: [
                                                            "#",
                                                            row.jersey,
                                                            " ",
                                                            row.name,
                                                            " ",
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("small", {
                                                                children: [
                                                                    "(",
                                                                    row.position,
                                                                    ")"
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        children: row.teamSide === 'HOME' ? homeTeam.abbr : awayTeam.abbr
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                            children: row.pts
                                                        })
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        children: row.reb
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        children: row.ast
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        children: row.stl
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        children: row.blk
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                        children: [
                                                            row.fgm,
                                                            "/",
                                                            row.fga
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                        children: [
                                                            row.tpm,
                                                            "/",
                                                            row.tpa
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        children: row.fouls
                                                    })
                                                ]
                                            }, row.playerId);
                                        })
                                    })
                                ]
                            })
                        }),
                        tab === 'GAMEPLAN' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p5-pause-gp",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p5-gp-group",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h4", {
                                            children: "OFFENSIVE SET (PLAYVISION)"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "p5-gp-chips",
                                            children: OFFENSE_OPTIONS.map(function(o) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "p5-gp-chip " + (hud.activePlay === o.id ? 'active' : ''),
                                                    onClick: function onClick() {
                                                        return onSetOffensivePlay(o.id);
                                                    },
                                                    children: o.label
                                                }, o.id);
                                            })
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p5-gp-group",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h4", {
                                            children: "DEFENSIVE SCHEME"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "p5-gp-chips",
                                            children: DEFENSE_OPTIONS.map(function(d) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "p5-gp-chip " + (hud.defensiveScheme === d.id ? 'active' : ''),
                                                    onClick: function onClick() {
                                                        return onSetDefensiveScheme(d.id);
                                                    },
                                                    children: d.label
                                                }, d.id);
                                            })
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p5-gp-group",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h4", {
                                            children: "QUICK LINEUP PRESETS & TIMEOUT"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p5-gp-chips",
                                            children: [
                                                LINEUP_OPTIONS.map(function(l) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        type: "button",
                                                        className: "p5-gp-chip " + (hud.activeLineupPreset === l.id ? 'active' : ''),
                                                        onClick: function onClick() {
                                                            return onApplyLineupPreset(l.id);
                                                        },
                                                        children: l.label
                                                    }, l.id);
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    type: "button",
                                                    className: "p5-gp-chip accent",
                                                    disabled: userTimeouts <= 0,
                                                    onClick: function onClick() {
                                                        onCallTimeout();
                                                        onResume();
                                                    },
                                                    children: [
                                                        "⏱ CALL TIMEOUT (",
                                                        userTimeouts,
                                                        " LEFT)"
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        tab === 'CAMERA' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p5-pause-gp",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p5-gp-group",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h4", {
                                            children: "ALL 7 AUTHENTIC 2K CAMERAS"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "p5-gp-chips",
                                            children: _courtTypes.CAMERA_ANGLE_OPTIONS.map(function(c) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "p5-gp-chip " + (cameraSettings.angle === c.id ? 'active' : ''),
                                                    onClick: function onClick() {
                                                        return onUpdateCamera({
                                                            angle: c.id
                                                        });
                                                    },
                                                    children: c.label
                                                }, c.id);
                                            })
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p5-cam-sliders",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    children: [
                                                        "Zoom (",
                                                        cameraSettings.zoom,
                                                        "/10)"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "range",
                                                    min: 1,
                                                    max: 10,
                                                    value: cameraSettings.zoom,
                                                    onChange: function onChange(e) {
                                                        return onUpdateCamera({
                                                            zoom: Number(e.target.value)
                                                        });
                                                    }
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    children: [
                                                        "Height (",
                                                        cameraSettings.height,
                                                        "/10)"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "range",
                                                    min: 1,
                                                    max: 10,
                                                    value: cameraSettings.height,
                                                    onChange: function onChange(e) {
                                                        return onUpdateCamera({
                                                            height: Number(e.target.value)
                                                        });
                                                    }
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p5-cam-checks",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: cameraSettings.autoFlip,
                                                    onChange: function onChange(e) {
                                                        return onUpdateCamera({
                                                            autoFlip: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Auto-Flip 180\xb0"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: cameraSettings.keyZoom,
                                                    onChange: function onChange(e) {
                                                        return onUpdateCamera({
                                                            keyZoom: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Key Zoom"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: cameraSettings.reverseAngle,
                                                    onChange: function onChange(e) {
                                                        return onUpdateCamera({
                                                            reverseAngle: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Reverse Angle"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: cameraSettings.dunkCameraShake,
                                                    onChange: function onChange(e) {
                                                        return onUpdateCamera({
                                                            dunkCameraShake: e.target.checked
                                                        });
                                                    }
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Contact Dunk Shake"
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

});
// === MODULE: src/games/hoops-2k26/hud/ShotMeterOverlay ===
ArcadeMod.define("src/games/hoops-2k26/hud/ShotMeterOverlay", function(require, module, exports) {
// ============================================================================
// PART 5 — ALL 5 AUTHENTIC 3D-PROJECTED SHOT METER STYLES (ShotMeterOverlay.tsx)
// 1. 2K26_ARROW (Default — Curved gold/green precision arrow beside shooter)
// 2. 2K14_FLOOR_RING (Under-feet circular timing bar + shot quality glow)
// 3. COMET (Sweeping arc comet converging into green peak)
// 4. VERTICAL_BAR (Clean vertical side bar with glowing green window)
// 5. MINIMAL (Ultra-compact horizontal competitive micro-bar)
// + 2K26 Skill Dunk curved ring, Free Throw bar, Jump Ball CTA, & No-Meter +15%
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ShotMeterOverlay", {
    enumerable: true,
    get: function() {
        return ShotMeterOverlay;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_default(require("react"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function resolveMeterColor(colorId, teamPrimary) {
    if (colorId === 'GOLD') return '#f59e0b';
    if (colorId === 'CYAN') return '#38bdf8';
    if (colorId === 'CRIMSON') return '#ef4444';
    if (colorId === 'TEAM_COLOR' && teamPrimary) return teamPrimary;
    return '#22c55e';
}
function clampCoord(val, min, max) {
    return Math.max(min, Math.min(max, val));
}
function computeMeterArcAngle(progress) {
    // Maps 0..1 progress across a -125 deg to +45 deg precision curve
    return -125 + Math.max(0, Math.min(1, progress)) * 170;
}
var ShotMeterOverlay = function ShotMeterOverlay(param) {
    var meter = param.meter, shotMeterStyle = param.shotMeterStyle, shotMeterColor = param.shotMeterColor, teamPrimaryColor = param.teamPrimaryColor, shotMeterEnabled = param.shotMeterEnabled, activeShooterId = param.activeShooterId, projectedAnchorsRef = param.projectedAnchorsRef, isUserFreeThrow = param.isUserFreeThrow, onJumpBallTap = param.onJumpBallTap, onFreeThrowRelease = param.onFreeThrowRelease;
    if (meter.kind === 'NONE') return null;
    var accentColor = resolveMeterColor(shotMeterColor, teamPrimaryColor);
    var isJumpShot = meter.kind === 'JUMPSHOT' || meter.kind === 'RHYTHM_SHOT';
    var isSkillDunk = meter.kind === 'SKILL_DUNK';
    var isJumpBall = meter.kind === 'JUMP_BALL';
    var isFreeThrow = meter.kind === 'FREE_THROW';
    // No-Meter Competitive Boost (+15% Green Window) hides jumpshot visual bar
    if (isJumpShot && !shotMeterEnabled) {
        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "p5-nometer-pill",
            "aria-live": "polite",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                    className: "p5-nometer-dot"
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                    children: "NO-METER BOOST (+15% GREEN)"
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                    children: "WATCH VISUAL CUE"
                })
            ]
        });
    }
    var anchors = projectedAnchorsRef.current;
    var vw = anchors.width || 960;
    var vh = anchors.height || 540;
    var playerAnchor = activeShooterId ? anchors.players[activeShooterId] : undefined;
    var inGreen = Math.abs(meter.progress - meter.targetCenter) <= meter.greenHalfWidth;
    // 1. Opening Jump Ball & Free Throw centered precision bars
    if (isJumpBall || isFreeThrow) {
        var greenLeft = Math.max(0, (meter.targetCenter - meter.greenHalfWidth) * 100);
        var greenWidth = Math.min(100, meter.greenHalfWidth * 200);
        var pct = Math.min(100, Math.max(0, meter.progress * 100));
        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "p5-center-meter " + (isJumpBall ? 'is-jumpball' : 'is-ft'),
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "p5-center-meter-head",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                            children: meter.label
                        }),
                        inGreen && /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                            className: "p5-green-tag",
                            children: "GREEN WINDOW"
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "p5-linear-track",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "p5-linear-green",
                            style: {
                                left: "" + greenLeft + "%",
                                width: "" + greenWidth + "%"
                            }
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "p5-linear-fill",
                            style: {
                                width: "" + pct + "%"
                            }
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "p5-linear-needle",
                            style: {
                                left: "" + pct + "%"
                            }
                        })
                    ]
                }),
                isJumpBall && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                    type: "button",
                    className: "p5-meter-cta",
                    onClick: onJumpBallTap,
                    children: "TAP TO JUMP FOR TIP-OFF [SPACE]"
                }),
                isFreeThrow && isUserFreeThrow && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                    type: "button",
                    className: "p5-meter-cta",
                    onClick: onFreeThrowRelease,
                    children: "RELEASE FREE THROW [SPACE]"
                })
            ]
        });
    }
    // Resolve 3D-projected anchor beside shooter hands or under feet (with clean screen clamping)
    var useFeet = shotMeterStyle === '2K14_FLOOR_RING' && !isSkillDunk;
    var rawX = playerAnchor && playerAnchor.visible ? useFeet ? playerAnchor.feetX : playerAnchor.headX + 54 : vw * 0.54;
    var rawY = playerAnchor && playerAnchor.visible ? useFeet ? playerAnchor.feetY + 8 : playerAnchor.headY - 8 : vh * 0.44;
    var anchorX = clampCoord(rawX, 74, vw - 74);
    var anchorY = clampCoord(rawY, 76, vh - 96);
    var prog = Math.max(0, Math.min(1, meter.progress));
    var greenStart = Math.max(0, meter.targetCenter - meter.greenHalfWidth);
    var greenEnd = Math.min(1, meter.targetCenter + meter.greenHalfWidth);
    // 2. 2K26 Skill Dunk High-Contrast Curved Ring
    if (isSkillDunk) {
        var r = 34;
        var circ = 2 * Math.PI * r;
        var arcLen = circ * 0.65;
        var fillLen = arcLen * prog;
        var greenOffset = arcLen * greenStart;
        var greenLen = Math.max(8, arcLen * (greenEnd - greenStart));
        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "p5-projected-meter style-skill-dunk",
            style: {
                left: "" + anchorX + "px",
                top: "" + anchorY + "px"
            },
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
                    width: "88",
                    height: "88",
                    viewBox: "0 0 88 88",
                    className: "p5-meter-svg",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                            cx: "44",
                            cy: "44",
                            r: r,
                            fill: "none",
                            stroke: "rgba(15,23,42,0.88)",
                            strokeWidth: "10",
                            strokeDasharray: arcLen + " " + circ,
                            transform: "rotate(152 44 44)",
                            strokeLinecap: "round"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                            cx: "44",
                            cy: "44",
                            r: r,
                            fill: "none",
                            stroke: "#22c55e",
                            strokeWidth: "10",
                            strokeDasharray: greenLen + " " + circ,
                            strokeDashoffset: -greenOffset,
                            transform: "rotate(152 44 44)",
                            strokeLinecap: "round"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                            cx: "44",
                            cy: "44",
                            r: r,
                            fill: "none",
                            stroke: inGreen ? '#4ade80' : '#f97316',
                            strokeWidth: "5",
                            strokeDasharray: fillLen + " " + circ,
                            transform: "rotate(152 44 44)",
                            strokeLinecap: "round"
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                    className: "p5-meter-badge dunk",
                    children: "SKILL DUNK"
                })
            ]
        });
    }
    // 3. All 5 Authentic Jumpshot / Rhythm Shot Meter Styles
    if (shotMeterStyle === '2K26_ARROW') {
        var r1 = 36;
        var circ1 = 2 * Math.PI * r1;
        var arcLen1 = circ1 * 0.44;
        var fillLen1 = arcLen1 * prog;
        var greenOffset1 = arcLen1 * greenStart;
        var greenLen1 = Math.max(7, arcLen1 * (greenEnd - greenStart));
        var needleDeg = computeMeterArcAngle(prog);
        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "p5-projected-meter style-2k26-arrow " + (inGreen ? 'in-green' : ''),
            style: {
                left: "" + anchorX + "px",
                top: "" + anchorY + "px"
            },
            "data-meter-style": "2K26_ARROW",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
                    width: "92",
                    height: "92",
                    viewBox: "0 0 92 92",
                    className: "p5-meter-svg",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                            cx: "46",
                            cy: "46",
                            r: r1,
                            fill: "none",
                            stroke: "rgba(10,14,24,0.86)",
                            strokeWidth: "11",
                            strokeDasharray: arcLen1 + " " + circ1,
                            transform: "rotate(-125 46 46)",
                            strokeLinecap: "round"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                            cx: "46",
                            cy: "46",
                            r: r1,
                            fill: "none",
                            stroke: accentColor,
                            strokeWidth: "11",
                            strokeDasharray: greenLen1 + " " + circ1,
                            strokeDashoffset: -greenOffset1,
                            transform: "rotate(-125 46 46)"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                            cx: "46",
                            cy: "46",
                            r: r1,
                            fill: "none",
                            stroke: inGreen ? '#86efac' : accentColor,
                            strokeWidth: "6",
                            strokeDasharray: fillLen1 + " " + circ1,
                            transform: "rotate(-125 46 46)",
                            strokeLinecap: "round"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("g", {
                            transform: "rotate(" + needleDeg + " 46 46)",
                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)("polygon", {
                                points: "82,46 73,41 73,51",
                                fill: "#ffffff"
                            })
                        })
                    ]
                }),
                meter.isRhythmArmed && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                    className: "p5-meter-badge rhythm",
                    children: "FLICK UP \xb7 TEMPO"
                })
            ]
        });
    }
    if (shotMeterStyle === '2K14_FLOOR_RING') {
        var r2 = 30;
        var circ2 = 2 * Math.PI * r2;
        var fillLen2 = circ2 * prog;
        var greenOffset2 = circ2 * greenStart;
        var greenLen2 = Math.max(8, circ2 * (greenEnd - greenStart));
        return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
            className: "p5-projected-meter style-2k14-ring " + (inGreen ? 'in-green' : ''),
            style: {
                left: "" + anchorX + "px",
                top: "" + anchorY + "px"
            },
            "data-meter-style": "2K14_FLOOR_RING",
            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
                width: "84",
                height: "50",
                viewBox: "0 0 84 84",
                className: "p5-meter-svg floor-squash",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                        cx: "42",
                        cy: "42",
                        r: r2,
                        fill: "none",
                        stroke: "rgba(12,16,24,0.85)",
                        strokeWidth: "10"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                        cx: "42",
                        cy: "42",
                        r: r2,
                        fill: "none",
                        stroke: "#22c55e",
                        strokeWidth: "10",
                        strokeDasharray: greenLen2 + " " + circ2,
                        strokeDashoffset: -greenOffset2,
                        transform: "rotate(-90 42 42)"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                        cx: "42",
                        cy: "42",
                        r: r2,
                        fill: "none",
                        stroke: inGreen ? '#4ade80' : '#ef4444',
                        strokeWidth: "6",
                        strokeDasharray: fillLen2 + " " + circ2,
                        transform: "rotate(-90 42 42)"
                    })
                ]
            })
        });
    }
    if (shotMeterStyle === 'COMET') {
        var tailW = Math.max(4, prog * 78);
        var greenL = greenStart * 100;
        var greenW = (greenEnd - greenStart) * 100;
        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "p5-projected-meter style-comet " + (inGreen ? 'in-green' : ''),
            style: {
                left: "" + anchorX + "px",
                top: "" + anchorY + "px"
            },
            "data-meter-style": "COMET",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "p5-comet-arc",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "p5-comet-green",
                            style: {
                                left: "" + greenL + "%",
                                width: "" + greenW + "%"
                            }
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "p5-comet-tail",
                            style: {
                                width: "" + tailW + "px"
                            }
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "p5-comet-head",
                            style: {
                                left: "" + prog * 100 + "%"
                            }
                        })
                    ]
                }),
                meter.isRhythmArmed && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                    className: "p5-meter-badge rhythm",
                    children: "RHYTHM"
                })
            ]
        });
    }
    if (shotMeterStyle === 'VERTICAL_BAR') {
        var greenBottom = greenStart * 100;
        var greenH = (greenEnd - greenStart) * 100;
        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "p5-projected-meter style-vertical " + (inGreen ? 'in-green' : ''),
            style: {
                left: "" + anchorX + "px",
                top: "" + anchorY + "px"
            },
            "data-meter-style": "VERTICAL_BAR",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "p5-vbar-track",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "p5-vbar-green",
                            style: {
                                bottom: "" + greenBottom + "%",
                                height: "" + greenH + "%"
                            }
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "p5-vbar-fill",
                            style: {
                                height: "" + prog * 100 + "%"
                            }
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "p5-vbar-tick",
                            style: {
                                bottom: "" + prog * 100 + "%"
                            }
                        })
                    ]
                }),
                meter.isRhythmArmed && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                    className: "p5-meter-badge rhythm",
                    children: "UP"
                })
            ]
        });
    }
    // 5. MINIMAL (Ultra-compact horizontal competitive bar)
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "p5-projected-meter style-minimal " + (inGreen ? 'in-green' : ''),
        style: {
            left: "" + anchorX + "px",
            top: "" + anchorY + "px"
        },
        "data-meter-style": "MINIMAL",
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "p5-min-track",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "p5-min-green",
                    style: {
                        left: "" + greenStart * 100 + "%",
                        width: "" + (greenEnd - greenStart) * 100 + "%"
                    }
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "p5-min-needle",
                    style: {
                        left: "" + prog * 100 + "%"
                    }
                })
            ]
        })
    });
};

});

})(window.ArcadeMod);
