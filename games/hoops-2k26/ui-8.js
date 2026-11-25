(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/hud/TacticalRadarAndMarking ===
ArcadeMod.define("src/games/hoops-2k26/hud/TacticalRadarAndMarking", function(require, module, exports) {
// ============================================================================
// PART 5 — INTERACTIVE MINI-COURT TACTICAL RADAR, ENEMY STAR MARKING & COACH HUB
// - Starts compact in Top-Left corner; expands on tap or [1-4] Tactics hotkey
// - Click/Tap any enemy player on the radar or roster drawer to apply
//   DOUBLE / DENY / OVER / PACK / CLEAR tactical marks directly to AISystem
// - On-the-fly Pick & Roll 45°/180° Angle & Roll/Fade control, Offensive Sets,
//   Defensive Schemes, Quick Lineup Presets with live stamina bars & Timeouts
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TacticalRadarAndMarking", {
    enumerable: true,
    get: function() {
        return TacticalRadarAndMarking;
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
var OFFENSIVE_SETS = [
    {
        id: 'PICK_AND_ROLL',
        label: 'Smart Play (PnR)',
        desc: 'PlayVision high screen & dive'
    },
    {
        id: 'FIVE_OUT',
        label: '5-Out Iso',
        desc: 'Max perimeter spacing'
    },
    {
        id: 'MOTION_CUT',
        label: 'Motion Cut',
        desc: 'Backdoor & weakside slashes'
    },
    {
        id: 'HORNS',
        label: 'Horns Pick & Pop',
        desc: 'Dual elbows & pop shooters'
    },
    {
        id: 'FLOPPY',
        label: 'Floppy 3PT',
        desc: 'Baseline curls for catch-and-shoot'
    }
];
var DEFENSIVE_SCHEMES = [
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
var MARK_ACTIONS = [
    {
        tag: 'DOUBLE',
        icon: '🎯',
        label: 'DOUBLE TEAM ON CATCH'
    },
    {
        tag: 'DENY',
        icon: '🔒',
        label: 'DENY BALL / FACE GUARD'
    },
    {
        tag: 'OVER',
        icon: '🛡️',
        label: 'GO OVER SCREENS'
    },
    {
        tag: 'PACK',
        icon: '🧱',
        label: 'PACK PAINT / SAG OFF'
    }
];
var LINEUP_PRESETS = [
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
function courtToRadarPct(x, z) {
    var leftPct = Math.max(4, Math.min(96, (x + _courtTypes.COURT_DIMS.HALF_LENGTH) / _courtTypes.COURT_DIMS.LENGTH * 100));
    var topPct = Math.max(6, Math.min(94, (z + _courtTypes.COURT_DIMS.HALF_WIDTH) / _courtTypes.COURT_DIMS.WIDTH * 100));
    return {
        leftPct: leftPct,
        topPct: topPct
    };
}
var TacticalRadarAndMarking = function TacticalRadarAndMarking(param) {
    var hud = param.hud, homePrimaryColor = param.homePrimaryColor, awayPrimaryColor = param.awayPrimaryColor, expanded = param.expanded, radarLayout = param.radarLayout, onToggleExpanded = param.onToggleExpanded, onMarkEnemy = param.onMarkEnemy, onSetOffensivePlay = param.onSetOffensivePlay, onSetDefensiveScheme = param.onSetDefensiveScheme, onCallPickAndRoll = param.onCallPickAndRoll, onFlipScreenAngle = param.onFlipScreenAngle, onToggleScreenAction = param.onToggleScreenAction, onApplyLineupPreset = param.onApplyLineupPreset, onCallTimeout = param.onCallTimeout;
    var _hud_userTeamSide;
    var _useState = (0, _react.useState)('MARKING'), subTab = _useState[0], setSubTab = _useState[1];
    var _useState1 = (0, _react.useState)(null), selectedEnemyId = _useState1[0], setSelectedEnemyId = _useState1[1];
    var userSide = (_hud_userTeamSide = hud.userTeamSide) != null ? _hud_userTeamSide : 'HOME';
    var enemySide = userSide === 'HOME' ? 'AWAY' : 'HOME';
    var allies = hud.radarPlayers.filter(function(p) {
        return p.teamSide === userSide;
    });
    var enemies = hud.radarPlayers.filter(function(p) {
        return p.teamSide === enemySide;
    });
    var activeSelectedEnemy = enemies.find(function(e) {
        return e.id === selectedEnemyId;
    }) || enemies.find(function(e) {
        return e.id === hud.markedStar.playerId;
    }) || enemies[0] || null;
    var ballPos = courtToRadarPct(hud.radarBall.x, hud.radarBall.z);
    var userTimeouts = userSide === 'HOME' ? hud.homeTimeouts : hud.awayTimeouts;
    var handleEnemyDotClick = function handleEnemyDotClick(enemy, e) {
        e.stopPropagation();
        setSelectedEnemyId(enemy.id);
        setSubTab('MARKING');
        if (!expanded) {
            onToggleExpanded();
        }
    };
    var radarStyle = !expanded && radarLayout ? {
        transform: "translate(" + radarLayout.x + "px, " + radarLayout.y + "px) scale(" + Math.max(0.5, Math.min(1.5, radarLayout.scale)) + ")",
        opacity: Math.max(0.2, Math.min(1, radarLayout.opacity))
    } : undefined;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "p5-radar-shell " + (expanded ? 'expanded' : 'compact'),
        style: radarStyle,
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "p5-radar-court",
                onClick: onToggleExpanded,
                role: "button",
                tabIndex: 0,
                onKeyDown: function onKeyDown(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggleExpanded();
                    }
                },
                title: expanded ? 'Click court to collapse radar' : 'Tap to expand Tactical Radar & Enemy Marking',
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
                        viewBox: "0 0 286 152",
                        className: "p5-radar-svg",
                        "aria-hidden": "true",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                                x: "4",
                                y: "4",
                                width: "278",
                                height: "144",
                                rx: "4",
                                fill: "rgba(12,18,30,0.88)",
                                stroke: "rgba(148,163,184,0.45)",
                                strokeWidth: "2"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("line", {
                                x1: "143",
                                y1: "4",
                                x2: "143",
                                y2: "148",
                                stroke: "rgba(148,163,184,0.38)",
                                strokeWidth: "1.5"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                                cx: "143",
                                cy: "76",
                                r: "18",
                                fill: "none",
                                stroke: "rgba(148,163,184,0.38)",
                                strokeWidth: "1.5"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                                x: "4",
                                y: "51",
                                width: "54",
                                height: "50",
                                fill: "rgba(56,189,248,0.12)",
                                stroke: "rgba(148,163,184,0.4)",
                                strokeWidth: "1.5"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                                x: "228",
                                y: "51",
                                width: "54",
                                height: "50",
                                fill: "rgba(239,68,68,0.12)",
                                stroke: "rgba(148,163,184,0.4)",
                                strokeWidth: "1.5"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                                d: "M 4 14 L 46 14 A 66 66 0 0 1 46 138 L 4 138",
                                fill: "none",
                                stroke: "rgba(148,163,184,0.35)",
                                strokeWidth: "1.5"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                                d: "M 282 14 L 240 14 A 66 66 0 0 0 240 138 L 282 138",
                                fill: "none",
                                stroke: "rgba(148,163,184,0.35)",
                                strokeWidth: "1.5"
                            }),
                            hud.activePlay !== 'OFF' && /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                                d: hud.activePlay === 'PICK_AND_ROLL' ? 'M 186 76 Q 214 54 244 74' : hud.activePlay === 'FIVE_OUT' ? 'M 178 24 L 242 24 M 178 128 L 242 128' : hud.activePlay === 'HORNS' ? 'M 186 48 L 236 76 M 186 104 L 236 76' : 'M 180 34 Q 212 76 180 118',
                                fill: "none",
                                stroke: "#38bdf8",
                                strokeWidth: "2.5",
                                strokeDasharray: "6 4"
                            })
                        ]
                    }),
                    hud.radarPlayers.map(function(pl) {
                        var pos = courtToRadarPct(pl.x, pl.z);
                        var isAlly = pl.teamSide === userSide;
                        var isMarked = hud.markedStar.playerId === pl.id;
                        var bg = pl.teamSide === 'HOME' ? homePrimaryColor : awayPrimaryColor;
                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                            type: "button",
                            className: "p5-radar-dot " + (isAlly ? 'ally' : 'enemy') + " " + (pl.isUserControlled ? 'controlled' : '') + " " + (isMarked ? 'marked' : ''),
                            style: {
                                left: "" + pos.leftPct + "%",
                                top: "" + pos.topPct + "%",
                                backgroundColor: bg
                            },
                            onClick: function onClick(e) {
                                if (!isAlly) {
                                    handleEnemyDotClick(pl, e);
                                } else {
                                    e.stopPropagation();
                                    onToggleExpanded();
                                }
                            },
                            title: pl.name + " (#" + pl.jerseyNumber + " " + pl.position + ")" + (!isAlly ? ' — Tap to Mark Star' : ''),
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: pl.jerseyNumber
                                }),
                                isMarked && /*#__PURE__*/ (0, _jsxruntime.jsx)("em", {
                                    className: "p5-radar-crosshair",
                                    children: "\uD83C\uDFAF"
                                })
                            ]
                        }, pl.id);
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                        className: "p5-radar-ball",
                        style: {
                            left: "" + ballPos.leftPct + "%",
                            top: "" + ballPos.topPct + "%"
                        }
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-radar-cap",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                children: hud.activePlay === 'OFF' ? hud.defensiveScheme.replace(/_/g, ' ') : hud.activePlay.replace(/_/g, ' ')
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                children: expanded ? '▾ HIDE' : '▴ TAP MARK'
                            })
                        ]
                    })
                ]
            }),
            hud.pickAndRoll.active && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "p5-pnr-live-chip",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                        children: [
                            "PnR: ",
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                children: hud.pickAndRoll.screenerName
                            }),
                            " (",
                            hud.pickAndRoll.angleDeg,
                            "\xb0",
                            ' ',
                            hud.pickAndRoll.action,
                            ")"
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-pnr-chip-btns",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: onFlipScreenAngle,
                                title: "Flip Screen Angle 45\xb0 / 180\xb0 [Q]",
                                children: hud.pickAndRoll.angleDeg === 45 ? '180°' : '45°'
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: onToggleScreenAction,
                                title: "Toggle Roll vs Fade [E]",
                                children: hud.pickAndRoll.action === 'ROLL' ? 'FADE' : 'ROLL'
                            })
                        ]
                    })
                ]
            }),
            expanded && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "p5-tactics-drawer",
                onClick: function onClick(e) {
                    return e.stopPropagation();
                },
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "p5-td-tabs",
                        children: [
                            [
                                'MARKING',
                                '🎯 Mark'
                            ],
                            [
                                'OFFENSE',
                                '🏀 Sets'
                            ],
                            [
                                'DEFENSE',
                                '🛡️ Def'
                            ],
                            [
                                'SUBS',
                                '⚡ Subs/TO'
                            ]
                        ].map(function(param) {
                            var id = param[0], label = param[1];
                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "p5-td-tab " + (subTab === id ? 'active' : ''),
                                onClick: function onClick() {
                                    return setSubTab(id);
                                },
                                children: label
                            }, id);
                        })
                    }),
                    subTab === 'MARKING' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-td-section",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "p5-td-label",
                                children: "TAP ENEMY STAR TO MARK:"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "p5-enemy-row",
                                children: enemies.map(function(en) {
                                    var isSelected = (activeSelectedEnemy == null ? void 0 : activeSelectedEnemy.id) === en.id;
                                    var isMarked = hud.markedStar.playerId === en.id;
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "p5-enemy-pill " + (isSelected ? 'selected' : '') + " " + (isMarked ? 'marked' : ''),
                                        onClick: function onClick() {
                                            return setSelectedEnemyId(en.id);
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    "#",
                                                    en.jerseyNumber,
                                                    " ",
                                                    en.lastName
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("small", {
                                                children: [
                                                    en.position,
                                                    " \xb7 ",
                                                    en.ovr
                                                ]
                                            })
                                        ]
                                    }, en.id);
                                })
                            }),
                            activeSelectedEnemy && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p5-mark-actions",
                                children: [
                                    MARK_ACTIONS.map(function(act) {
                                        var isActive = hud.markedStar.playerId === activeSelectedEnemy.id && hud.markedStar.tag === act.tag;
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                            type: "button",
                                            className: "p5-mark-btn " + (isActive ? 'active' : ''),
                                            onClick: function onClick() {
                                                return onMarkEnemy(activeSelectedEnemy.id, act.tag);
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: act.icon
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: act.label
                                                })
                                            ]
                                        }, act.tag);
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "p5-mark-btn clear",
                                        onClick: function onClick() {
                                            return onMarkEnemy(null, 'DOUBLE');
                                        },
                                        children: "✖️ CLEAR MARK"
                                    })
                                ]
                            })
                        ]
                    }),
                    subTab === 'OFFENSE' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-td-section",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p5-pnr-row",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "p5-td-action accent",
                                        onClick: onCallPickAndRoll,
                                        children: "\uD83E\uDDF1 CALL SCREEN [C]"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "p5-td-action",
                                        onClick: onFlipScreenAngle,
                                        children: [
                                            "ANGLE: ",
                                            hud.pickAndRoll.angleDeg,
                                            "\xb0"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "p5-td-action",
                                        onClick: onToggleScreenAction,
                                        children: hud.pickAndRoll.action
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "p5-td-grid",
                                children: OFFENSIVE_SETS.map(function(set) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "p5-td-chip " + (hud.activePlay === set.id ? 'active' : ''),
                                        onClick: function onClick() {
                                            return onSetOffensivePlay(set.id);
                                        },
                                        title: set.desc,
                                        children: set.label
                                    }, set.id);
                                })
                            })
                        ]
                    }),
                    subTab === 'DEFENSE' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-td-section",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "p5-td-label",
                                children: "ON-THE-FLY DEFENSIVE SCHEME:"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "p5-td-grid",
                                children: DEFENSIVE_SCHEMES.map(function(sc) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "p5-td-chip " + (hud.defensiveScheme === sc.id ? 'active' : ''),
                                        onClick: function onClick() {
                                            return onSetDefensiveScheme(sc.id);
                                        },
                                        children: sc.label
                                    }, sc.id);
                                })
                            })
                        ]
                    }),
                    subTab === 'SUBS' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p5-td-section",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "p5-td-label",
                                children: "INSTANT LINEUP PRESETS:"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "p5-td-grid",
                                children: LINEUP_PRESETS.map(function(lp) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "p5-td-chip " + (hud.activeLineupPreset === lp.id ? 'active' : ''),
                                        onClick: function onClick() {
                                            return onApplyLineupPreset(lp.id);
                                        },
                                        children: lp.label
                                    }, lp.id);
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "p5-stamina-list",
                                children: allies.map(function(al) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p5-stam-row",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    al.position,
                                                    " ",
                                                    al.lastName
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "p5-stam-mini-bar",
                                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "p5-stam-mini-fill",
                                                    style: {
                                                        width: "" + Math.round(al.stamina * 100) + "%",
                                                        backgroundColor: al.stamina > 0.55 ? '#22c55e' : al.stamina > 0.3 ? '#f59e0b' : '#ef4444'
                                                    }
                                                })
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("small", {
                                                children: [
                                                    Math.round(al.stamina * 100),
                                                    "%"
                                                ]
                                            })
                                        ]
                                    }, al.id);
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                type: "button",
                                className: "p5-timeout-cta",
                                disabled: userTimeouts <= 0,
                                onClick: onCallTimeout,
                                children: [
                                    "⏱ CALL TIMEOUT (",
                                    userTimeouts,
                                    " LEFT \xb7 RESTORE STAMINA)"
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
// === MODULE: src/games/hoops-2k26/hud/TouchControlsOverlay ===
ArcadeMod.define("src/games/hoops-2k26/hud/TouchControlsOverlay", function(require, module, exports) {
// ============================================================================
// PART 5 — DUAL-STICK MOBILE & DESKTOP-TOGGLEABLE VIRTUAL TOUCH CONTROLS
// - Bottom-Left Floating Virtual Analog Stick with outer Sprint Ring auto-lock
// - Bottom-Right Context-Aware Offense <-> Defense Action Pads:
//   * Offense: Giant dual-mode SHOOT / PRO-STICK pad (Hold to shoot OR drag
//     Down->Up right on the pad for 2K26 Rhythm Shooting!), PASS (Tap=Chest,
//     Swipe-Down=Bounce, Double-Tap=Wrap), DRIBBLE/PROTECT, SCREEN (PnR + Flip),
//     ICON PASS, ALLEY-OOP, glowing TAKEOVER button when full.
//   * Defense: BLOCK/REB, STEAL, SWITCH, INTENSE-D, HANDS-UP.
// - Every control binds { x, y, scale, opacity } from settings.controller.customHudLayout
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TouchControlsOverlay", {
    enumerable: true,
    get: function() {
        return TouchControlsOverlay;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
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
function getLayoutStyle(layout, key) {
    var rect = layout[key];
    if (!rect) return {};
    var x = Number.isFinite(rect.x) ? rect.x : 0;
    var y = Number.isFinite(rect.y) ? rect.y : 0;
    var scale = Number.isFinite(rect.scale) ? Math.max(0.5, Math.min(1.5, rect.scale)) : 1;
    var opacity = Number.isFinite(rect.opacity) ? Math.max(0.2, Math.min(1, rect.opacity)) : 0.92;
    return {
        transform: "translate(" + x + "px, " + y + "px) scale(" + scale + ")",
        opacity: opacity
    };
}
var TouchControlsOverlay = function TouchControlsOverlay(param) {
    var visible = param.visible, isOffense = param.isOffense, takeoverReady = param.takeoverReady, pickAndRoll = param.pickAndRoll, customHudLayout = param.customHudLayout, onStickChange = param.onStickChange, onHoldStateChange = param.onHoldStateChange, onRhythmDown = param.onRhythmDown, onRhythmFlickUp = param.onRhythmFlickUp, onPass = param.onPass, onDribble = param.onDribble, onCallScreen = param.onCallScreen, onFlipScreenAngle = param.onFlipScreenAngle, onToggleScreenAction = param.onToggleScreenAction, onToggleIconPass = param.onToggleIconPass, onAlleyOop = param.onAlleyOop, onIgniteTakeover = param.onIgniteTakeover, onBlockOrRebound = param.onBlockOrRebound, onSteal = param.onSteal, onSwitchDefender = param.onSwitchDefender;
    // Bottom-Left Virtual Analog Stick state
    var stickZoneRef = (0, _react.useRef)(null);
    var stickPointerIdRef = (0, _react.useRef)(null);
    var stickCenterRef = (0, _react.useRef)({
        x: 0,
        y: 0
    });
    var _useState = (0, _react.useState)({
        x: 0,
        y: 0,
        sprinting: false
    }), knobOffset = _useState[0], setKnobOffset = _useState[1];
    // Dual-mode SHOOT / PRO-STICK gesture state
    var shootDragRef = (0, _react.useRef)({
        pointerId: null,
        startY: 0,
        lastY: 0,
        lastTs: 0,
        rhythmArmed: false
    });
    var _useState1 = (0, _react.useState)('IDLE'), rhythmVisual = _useState1[0], setRhythmVisual = _useState1[1];
    // Pass gesture (Tap = Chest, Swipe-Down = Bounce, Double-Tap = Wrap)
    var passGestureRef = (0, _react.useRef)({
        startY: 0,
        lastTapTs: 0
    });
    // Dribble / Quick Protect hold vs tap
    var dribbleHoldTimerRef = (0, _react.useRef)(null);
    var dribbleHeldProtectRef = (0, _react.useRef)(false);
    if (!visible) return null;
    var STICK_MAX_R = 46;
    var handleStickDown = function handleStickDown(e) {
        e.stopPropagation();
        var el = stickZoneRef.current;
        if (!el) return;
        el.setPointerCapture(e.pointerId);
        stickPointerIdRef.current = e.pointerId;
        var rect = el.getBoundingClientRect();
        stickCenterRef.current = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        updateStickFromPoint(e.clientX, e.clientY);
    };
    var updateStickFromPoint = function updateStickFromPoint(clientX, clientY) {
        var dx = clientX - stickCenterRef.current.x;
        var dy = clientY - stickCenterRef.current.y;
        var dist = Math.hypot(dx, dy);
        var clamped = Math.min(STICK_MAX_R, dist);
        var ang = Math.atan2(dy, dx);
        var nx = dist > 6 ? Math.cos(ang) * clamped / STICK_MAX_R : 0;
        var ny = dist > 6 ? Math.sin(ang) * clamped / STICK_MAX_R : 0;
        var sprintLocked = dist >= STICK_MAX_R * 0.78;
        setKnobOffset({
            x: Math.cos(ang) * clamped,
            y: Math.sin(ang) * clamped,
            sprinting: sprintLocked
        });
        // Forward is -ny (dragging up on screen)
        onStickChange(nx, -ny, sprintLocked);
    };
    var handleStickMove = function handleStickMove(e) {
        if (stickPointerIdRef.current !== e.pointerId) return;
        e.stopPropagation();
        updateStickFromPoint(e.clientX, e.clientY);
    };
    var handleStickUp = function handleStickUp(e) {
        if (stickPointerIdRef.current !== e.pointerId) return;
        e.stopPropagation();
        stickPointerIdRef.current = null;
        setKnobOffset({
            x: 0,
            y: 0,
            sprinting: false
        });
        onStickChange(0, 0, false);
    };
    // Giant Dual-Mode SHOOT / PRO-STICK Pad Handlers
    var handleShootDown = function handleShootDown(e) {
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        shootDragRef.current = {
            pointerId: e.pointerId,
            startY: e.clientY,
            lastY: e.clientY,
            lastTs: performance.now(),
            rhythmArmed: false
        };
        setRhythmVisual('HOLD');
        onHoldStateChange({
            shoot: true
        });
    };
    var handleShootMove = function handleShootMove(e) {
        var st = shootDragRef.current;
        if (st.pointerId !== e.pointerId) return;
        e.stopPropagation();
        var dy = e.clientY - st.startY;
        if (!st.rhythmArmed && dy > 20) {
            // Transition cleanly from button hold into 2K26 Rhythm Shooting!
            st.rhythmArmed = true;
            setRhythmVisual('PULL_DOWN');
            onHoldStateChange({
                shoot: false
            });
            onRhythmDown();
        } else if (st.rhythmArmed && e.clientY < st.lastY - 14) {
            var dtMs = Math.max(12, performance.now() - st.lastTs);
            var vel = Math.min(2.0, Math.abs(st.lastY - e.clientY) / dtMs * 1.15);
            st.rhythmArmed = false;
            st.pointerId = null;
            setRhythmVisual('FLICK_UP');
            onRhythmFlickUp(vel);
            window.setTimeout(function() {
                return setRhythmVisual('IDLE');
            }, 220);
            return;
        }
        st.lastY = e.clientY;
        st.lastTs = performance.now();
    };
    var handleShootUp = function handleShootUp(e) {
        var st = shootDragRef.current;
        if (st.pointerId !== e.pointerId) return;
        e.stopPropagation();
        if (st.rhythmArmed) {
            onRhythmFlickUp(1.0);
        } else {
            onHoldStateChange({
                shoot: false
            });
        }
        st.pointerId = null;
        st.rhythmArmed = false;
        setRhythmVisual('IDLE');
    };
    // PASS button: Tap = Chest, Swipe-Down = Bounce, Double-Tap = Wrap
    var handlePassDown = function handlePassDown(e) {
        e.stopPropagation();
        passGestureRef.current.startY = e.clientY;
    };
    var handlePassUp = function handlePassUp(e) {
        e.stopPropagation();
        var dy = e.clientY - passGestureRef.current.startY;
        if (dy > 20) {
            onPass('BOUNCE');
            return;
        }
        var now = performance.now();
        if (now - passGestureRef.current.lastTapTs < 320) {
            passGestureRef.current.lastTapTs = 0;
            onPass('WRAP');
        } else {
            passGestureRef.current.lastTapTs = now;
            onPass('CHEST');
        }
    };
    // DRIBBLE / PROTECT button: Tap = Crossover, Hold > 180ms = Quick Protect
    var handleDribbleDown = function handleDribbleDown(e) {
        e.stopPropagation();
        dribbleHeldProtectRef.current = false;
        if (dribbleHoldTimerRef.current) window.clearTimeout(dribbleHoldTimerRef.current);
        dribbleHoldTimerRef.current = window.setTimeout(function() {
            dribbleHeldProtectRef.current = true;
            onHoldStateChange({
                protect: true
            });
        }, 180);
    };
    var handleDribbleUp = function handleDribbleUp(e) {
        e.stopPropagation();
        if (dribbleHoldTimerRef.current) {
            window.clearTimeout(dribbleHoldTimerRef.current);
            dribbleHoldTimerRef.current = null;
        }
        if (dribbleHeldProtectRef.current) {
            onHoldStateChange({
                protect: false
            });
        } else {
            onDribble('CROSSOVER');
        }
        dribbleHeldProtectRef.current = false;
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "p5-touch-overlay",
        "aria-label": "Virtual Dual-Stick Touch Controls",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                ref: stickZoneRef,
                className: "p5-stick-ring " + (knobOffset.sprinting ? 'sprinting' : ''),
                style: getLayoutStyle(customHudLayout, 'left_stick'),
                onPointerDown: handleStickDown,
                onPointerMove: handleStickMove,
                onPointerUp: handleStickUp,
                onPointerCancel: handleStickUp,
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                        className: "p5-stick-sprint-lbl",
                        children: knobOffset.sprinting ? '⚡ SPRINT LOCK' : 'MOVE · EDGE SPRINT'
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "p5-stick-knob",
                        style: {
                            transform: "translate(" + knobOffset.x + "px, " + knobOffset.y + "px)"
                        }
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "p5-touch-right-cluster",
                children: isOffense ? /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                    children: [
                        takeoverReady && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            className: "p5-touch-btn takeover",
                            style: getLayoutStyle(customHudLayout, 'takeover_btn'),
                            onPointerDown: function onPointerDown(e) {
                                e.stopPropagation();
                                onIgniteTakeover();
                            },
                            children: "\uD83D\uDD25 TAKEOVER"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p5-touch-top-row",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "p5-touch-btn sm",
                                    style: getLayoutStyle(customHudLayout, 'icon_btn'),
                                    onPointerDown: function onPointerDown(e) {
                                        e.stopPropagation();
                                        onToggleIconPass();
                                    },
                                    children: "ICONS"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "p5-touch-btn sm accent",
                                    style: getLayoutStyle(customHudLayout, 'oop_btn'),
                                    onPointerDown: function onPointerDown(e) {
                                        e.stopPropagation();
                                        onAlleyOop();
                                    },
                                    children: "ALLEY-OOP"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "p5-touch-btn sm " + (pickAndRoll.active ? 'active' : ''),
                                    style: getLayoutStyle(customHudLayout, 'screen_btn'),
                                    onPointerDown: function onPointerDown(e) {
                                        e.stopPropagation();
                                        if (pickAndRoll.active) {
                                            onFlipScreenAngle();
                                        } else {
                                            onCallScreen();
                                        }
                                    },
                                    children: pickAndRoll.active ? "FLIP " + pickAndRoll.angleDeg + "\xb0" : 'SCREEN'
                                }),
                                pickAndRoll.active && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "p5-touch-btn sm",
                                    onPointerDown: function onPointerDown(e) {
                                        e.stopPropagation();
                                        onToggleScreenAction();
                                    },
                                    children: pickAndRoll.action === 'ROLL' ? 'FADE' : 'ROLL'
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p5-touch-main-row",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "p5-touch-btn med",
                                    style: getLayoutStyle(customHudLayout, 'dribble_btn'),
                                    onPointerDown: handleDribbleDown,
                                    onPointerUp: handleDribbleUp,
                                    onPointerCancel: handleDribbleUp,
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "DRIBBLE"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("small", {
                                            children: "HOLD PROTECT"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "p5-touch-btn med pass",
                                    style: getLayoutStyle(customHudLayout, 'pass_btn'),
                                    onPointerDown: handlePassDown,
                                    onPointerUp: handlePassUp,
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "PASS"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("small", {
                                            children: "↓BNC \xb7 2xWRAP"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "p5-touch-btn shoot-pad state-" + rhythmVisual.toLowerCase(),
                                    style: getLayoutStyle(customHudLayout, 'shoot_pad'),
                                    onPointerDown: handleShootDown,
                                    onPointerMove: handleShootMove,
                                    onPointerUp: handleShootUp,
                                    onPointerCancel: handleShootUp,
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "p5-rhythm-arrow",
                                            children: rhythmVisual === 'PULL_DOWN' ? '⬆ FLICK UP!' : rhythmVisual === 'FLICK_UP' ? '✨ TEMPO!' : '↕ PRO-STICK'
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "SHOOT"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("small", {
                                            children: "HOLD OR ↓→↑"
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }) : /* DEFENSE CONTEXT-AWARE PADS */ /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p5-touch-top-row",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "p5-touch-btn sm",
                                    style: getLayoutStyle(customHudLayout, 'switch_btn'),
                                    onPointerDown: function onPointerDown(e) {
                                        e.stopPropagation();
                                        onSwitchDefender();
                                    },
                                    children: "SWITCH"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "p5-touch-btn sm",
                                    style: getLayoutStyle(customHudLayout, 'handsup_btn'),
                                    onPointerDown: function onPointerDown(e) {
                                        e.stopPropagation();
                                        onHoldStateChange({
                                            handsUp: true
                                        });
                                    },
                                    onPointerUp: function onPointerUp(e) {
                                        e.stopPropagation();
                                        onHoldStateChange({
                                            handsUp: false
                                        });
                                    },
                                    onPointerLeave: function onPointerLeave() {
                                        return onHoldStateChange({
                                            handsUp: false
                                        });
                                    },
                                    children: "HANDS-UP"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "p5-touch-btn sm",
                                    style: getLayoutStyle(customHudLayout, 'intense_btn'),
                                    onPointerDown: function onPointerDown(e) {
                                        e.stopPropagation();
                                        onHoldStateChange({
                                            protect: true
                                        });
                                    },
                                    onPointerUp: function onPointerUp(e) {
                                        e.stopPropagation();
                                        onHoldStateChange({
                                            protect: false
                                        });
                                    },
                                    onPointerLeave: function onPointerLeave() {
                                        return onHoldStateChange({
                                            protect: false
                                        });
                                    },
                                    children: "INTENSE-D"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p5-touch-main-row",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "p5-touch-btn med",
                                    style: getLayoutStyle(customHudLayout, 'steal_btn'),
                                    onPointerDown: function onPointerDown(e) {
                                        e.stopPropagation();
                                        onSteal();
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "STEAL"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("small", {
                                            children: "GLOVE / LANE"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "p5-touch-btn shoot-pad def-block",
                                    style: getLayoutStyle(customHudLayout, 'block_btn'),
                                    onPointerDown: function onPointerDown(e) {
                                        e.stopPropagation();
                                        onBlockOrRebound();
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "p5-rhythm-arrow",
                                            children: "\uD83D\uDEE1 RIM"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "BLK / REB"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("small", {
                                            children: "TAP JUMP"
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
// === MODULE: src/games/hoops-2k26/hybrid/CreateAPlayer ===
ArcadeMod.define("src/games/hoops-2k26/hybrid/CreateAPlayer", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateAPlayer", {
    enumerable: true,
    get: function() {
        return CreateAPlayer;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _rosterTypes = require("./rosterTypes");
var _rosterStore = require("./rosterStore");
var _TeamLogo = require("./TeamLogo");
var _audioEngine = require("./audioEngine");
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
var HAIR_STYLES = [
    'FADE',
    'BUZZ',
    'SHORT',
    'BRAIDS',
    'DREADS',
    'AFRO',
    'PONYTAIL',
    'BALD'
];
var SLEEVE_OPTS = [
    'NONE',
    'LEFT',
    'RIGHT',
    'BOTH'
];
var SKIN_TONES = [
    '#f2cbb6',
    '#dfa883',
    '#c68657',
    '#9c623d',
    '#734529',
    '#522f1c'
];
var HAIR_COLORS = [
    '#171717',
    '#451a03',
    '#a16207',
    '#dc2626',
    '#f8fafc',
    '#38bdf8'
];
var SHOE_COLORS = [
    '#e11d48',
    '#f59e0b',
    '#38bdf8',
    '#f8fafc',
    '#22c55e',
    '#a855f7'
];
var BADGE_CATS = [
    'SHOOTING',
    'PLAYMAKING',
    'FINISHING',
    'DEFENSE'
];
var ARCHETYPE_PRESETS = [
    {
        label: '3-Level Superstar',
        pos: 'SF',
        style: 'SUPERSTAR_WING',
        height: 80,
        weight: 225,
        ovr: 92
    },
    {
        label: 'Floor General PG',
        pos: 'PG',
        style: 'ELITE_PG',
        height: 75,
        weight: 192,
        ovr: 90
    },
    {
        label: 'Pure Sharpshooter',
        pos: 'SG',
        style: 'SHARPSHOOTER',
        height: 77,
        weight: 204,
        ovr: 89
    },
    {
        label: 'Lockdown 3 & D',
        pos: 'SF',
        style: 'TWO_WAY_WING',
        height: 79,
        weight: 218,
        ovr: 88
    },
    {
        label: 'Stretch Glass Big',
        pos: 'PF',
        style: 'STRETCH_BIG',
        height: 83,
        weight: 242,
        ovr: 89
    },
    {
        label: 'Point Center',
        pos: 'C',
        style: 'POINT_CENTER',
        height: 84,
        weight: 262,
        ovr: 91
    }
];
function cycleTier(cur) {
    if (!cur) return 'BRONZE';
    var idx = _rosterTypes.BADGE_TIERS.indexOf(cur);
    if (idx === -1 || idx === _rosterTypes.BADGE_TIERS.length - 1) return undefined;
    return _rosterTypes.BADGE_TIERS[idx + 1];
}
function buildInitialDraft() {
    return (0, _rosterTypes.makePlayer)({
        id: "cap_" + Date.now(),
        name: 'MP Prodigy',
        jerseyNumber: 26,
        position: 'SG',
        ovr: 90,
        era: '2K26',
        style: 'SUPERSTAR_WING',
        heightInches: 78,
        weightLbs: 214,
        wingspanInches: 83
    });
}
var CreateAPlayer = function CreateAPlayer(param) {
    var eraMode = param.eraMode, initialTeamId = param.initialTeamId, onBack = param.onBack, onSavedOpenRoster = param.onSavedOpenRoster, onSavedLaunchPlayNow = param.onSavedLaunchPlayNow, onNotify = param.onNotify;
    var _ref, _ref1;
    var snap = (0, _rosterStore.useRosterStore)();
    var _useState = (0, _react.useState)(function() {
        return buildInitialDraft();
    }), draft = _useState[0], setDraft = _useState[1];
    var _useState1 = (0, _react.useState)('VITALS'), tab = _useState1[0], setTab = _useState1[1];
    var _useState2 = (0, _react.useState)('SHOOTING'), badgeCat = _useState2[0], setBadgeCat = _useState2[1];
    var _useState3 = (0, _react.useState)(initialTeamId || '2k26_okc'), assignTeamId = _useState3[0], setAssignTeamId = _useState3[1];
    var _useState4 = (0, _react.useState)(true), insertAsStarter = _useState4[0], setInsertAsStarter = _useState4[1];
    var assignedTeam = (0, _react.useMemo)(function() {
        var _snap_teams_find;
        return assignTeamId === 'FREE_AGENTS' ? null : (_snap_teams_find = snap.teams.find(function(t) {
            return t.id === assignTeamId;
        })) != null ? _snap_teams_find : snap.teams[0];
    }, [
        snap.teams,
        assignTeamId
    ]);
    var liveOvr = (0, _react.useMemo)(function() {
        return (0, _rosterTypes.computePlayerOvr)(draft.attributes, draft.position);
    }, [
        draft.attributes,
        draft.position
    ]);
    var liveArchetype = (0, _react.useMemo)(function() {
        return (0, _rosterTypes.deriveArchetype)(draft.attributes, draft.position);
    }, [
        draft.attributes,
        draft.position
    ]);
    var applyPreset = function applyPreset(preset) {
        var _ref;
        _audioEngine.HybridAudioEngine.playUi('switch', eraMode);
        var next = (0, _rosterTypes.makePlayer)({
            id: draft.id,
            name: draft.name,
            jerseyNumber: draft.jerseyNumber,
            position: preset.pos,
            ovr: preset.ovr,
            era: (_ref = assignedTeam == null ? void 0 : assignedTeam.era) != null ? _ref : '2K26',
            style: preset.style,
            heightInches: preset.height,
            weightLbs: preset.weight,
            wingspanInches: preset.height + 4,
            appearance: draft.appearance
        });
        setDraft(next);
    };
    var setAttr = function setAttr(key, val) {
        setDraft(function(prev) {
            var _obj;
            return _extends({}, prev, {
                attributes: _extends({}, prev.attributes, (_obj = {}, _obj[key] = val, _obj))
            });
        });
    };
    var setHotZone = function setHotZone(key, val) {
        _audioEngine.HybridAudioEngine.playUi('click', eraMode);
        setDraft(function(prev) {
            var _obj;
            return _extends({}, prev, {
                hotZones: _extends({}, prev.hotZones, (_obj = {}, _obj[key] = val, _obj))
            });
        });
    };
    var toggleBadge = function toggleBadge(id) {
        _audioEngine.HybridAudioEngine.playUi('click', eraMode);
        setDraft(function(prev) {
            var next = _extends({}, prev.badges);
            var nt = cycleTier(next[id]);
            if (nt) next[id] = nt;
            else delete next[id];
            return _extends({}, prev, {
                badges: next
            });
        });
    };
    var handleSave = function handleSave(goToPlayNow) {
        var _ref;
        var cleanName = draft.name.trim() || 'MP Prodigy';
        var finalPlayer = _extends({}, draft, {
            id: "cap_" + Date.now() + "_" + Math.floor(Math.random() * 999),
            name: cleanName,
            era: (_ref = assignedTeam == null ? void 0 : assignedTeam.era) != null ? _ref : '2K26',
            ovr: liveOvr,
            archetype: liveArchetype,
            isCreated: true
        });
        _rosterStore.RosterStore.addCreatedPlayer(finalPlayer, assignTeamId, insertAsStarter);
        _audioEngine.HybridAudioEngine.playGreenRelease();
        var targetLabel = assignedTeam ? assignedTeam.city + " " + assignedTeam.name : 'Free Agents Pool';
        onNotify(cleanName + " (" + liveOvr + " OVR) created and added to " + targetLabel + "!");
        if (goToPlayNow && assignedTeam) {
            onSavedLaunchPlayNow(assignedTeam.id);
        } else {
            onSavedOpenRoster(assignedTeam ? assignedTeam.id : '2k26_okc');
        }
    };
    var jerseyPrimary = (_ref = assignedTeam == null ? void 0 : assignedTeam.colors.primary) != null ? _ref : '#e11d48';
    var jerseyAccent = (_ref1 = assignedTeam == null ? void 0 : assignedTeam.colors.accent) != null ? _ref1 : '#f59e0b';
    var badgeEntries = Object.entries(draft.badges);
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h2k-cap-screen",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                className: "h2k-subscreen-header",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "h2k-subscreen-left",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-btn-ghost",
                                onClick: function onClick() {
                                    _audioEngine.HybridAudioEngine.playUi('back', eraMode);
                                    onBack();
                                },
                                children: "◀ BACK"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h2k-kicker",
                                        children: "STANDALONE 2K14 + 2K26 PLAYER BUILDER"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                        children: "CREATE-A-PLAYER STUDIO"
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "h2k-subscreen-right h2k-roster-head-actions",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-btn-ghost",
                                onClick: function onClick() {
                                    return handleSave(false);
                                },
                                children: "\uD83D\uDCBE SAVE TO ROSTER"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-btn-accent",
                                onClick: function onClick() {
                                    return handleSave(true);
                                },
                                children: "\uD83C\uDFC0 SAVE & LAUNCH IN PLAY NOW"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "h2k-cap-workspace",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("aside", {
                        className: "h2k-cap-preview-col",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-cap-card",
                                style: {
                                    borderColor: jerseyAccent,
                                    background: "linear-gradient(155deg, " + jerseyPrimary + "55 0%, rgba(10,14,24,0.96) 65%)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-cap-card-top",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "h2k-pos-pill starter",
                                                        children: draft.position
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "h2k-cap-jersey-tag",
                                                        children: [
                                                            "#",
                                                            draft.jerseyNumber
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-ovr-badge-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: "OVR"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: liveOvr
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
                                        viewBox: "0 0 180 175",
                                        className: "h2k-cap-avatar-svg",
                                        role: "img",
                                        "aria-label": "Created player visual preview",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                                                cx: "90",
                                                cy: "78",
                                                r: "68",
                                                fill: jerseyPrimary,
                                                fillOpacity: "0.22"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                                                x: "32",
                                                y: "98",
                                                width: "20",
                                                height: "62",
                                                rx: "9",
                                                fill: draft.appearance.armSleeve === 'LEFT' || draft.appearance.armSleeve === 'BOTH' ? jerseyAccent : draft.appearance.skinTone
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                                                x: "128",
                                                y: "98",
                                                width: "20",
                                                height: "62",
                                                rx: "9",
                                                fill: draft.appearance.armSleeve === 'RIGHT' || draft.appearance.armSleeve === 'BOTH' ? jerseyAccent : draft.appearance.skinTone
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                                                d: "M52 94 L68 86 H112 L128 94 L124 170 H56 Z",
                                                fill: jerseyPrimary,
                                                stroke: jerseyAccent,
                                                strokeWidth: "3"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("text", {
                                                x: "90",
                                                y: "142",
                                                textAnchor: "middle",
                                                fill: "#FFFFFF",
                                                fontSize: "36",
                                                fontWeight: "900",
                                                fontFamily: "Impact, Arial Black, sans-serif",
                                                children: draft.jerseyNumber
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                                                x: "78",
                                                y: "70",
                                                width: "24",
                                                height: "20",
                                                rx: "6",
                                                fill: draft.appearance.skinTone
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                                                cx: "90",
                                                cy: "52",
                                                r: "24",
                                                fill: draft.appearance.skinTone
                                            }),
                                            draft.appearance.hairStyle !== 'BALD' && /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                                                d: draft.appearance.hairStyle === 'AFRO' ? 'M60 48 C58 14 122 14 120 48 C110 38 70 38 60 48 Z' : draft.appearance.hairStyle === 'DREADS' || draft.appearance.hairStyle === 'BRAIDS' ? 'M64 46 C64 20 116 20 116 46 L120 66 H110 L108 44 H72 L70 66 H60 Z' : 'M66 46 C68 22 112 22 114 46 C104 38 76 38 66 46 Z',
                                                fill: draft.appearance.hairColor
                                            }),
                                            draft.appearance.headband && /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                                                x: "65",
                                                y: "38",
                                                width: "50",
                                                height: "7",
                                                rx: "3",
                                                fill: jerseyAccent
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                                                x: "64",
                                                y: "164",
                                                width: "52",
                                                height: "6",
                                                rx: "3",
                                                fill: draft.appearance.shoeColor
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                        className: "h2k-cap-card-name",
                                        children: draft.name || 'Unnamed Player'
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h2k-archetype-line",
                                        children: liveArchetype
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-cap-vitals-strip",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: (0, _rosterTypes.formatHeightFeetInches)(draft.heightInches)
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    draft.weightLbs,
                                                    " lbs"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    "WS ",
                                                    (0, _rosterTypes.formatHeightFeetInches)(draft.wingspanInches)
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-cap-key-ratings",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: "3PT"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: draft.attributes.threePt
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: "DNK"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: draft.attributes.drivingDunk
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: "HDL"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: draft.attributes.ballHandle
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: "SPD"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: draft.attributes.speed
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: "DEF"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: draft.attributes.perimeterDef
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    badgeEntries.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h2k-cap-badge-preview",
                                        children: badgeEntries.slice(0, 6).map(function(param) {
                                            var bid = param[0], tier = param[1];
                                            var _ref;
                                            var meta = _rosterTypes.BADGE_CATALOG.find(function(b) {
                                                return b.id === bid;
                                            });
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "h2k-badge-mini tier-" + tier.toLowerCase(),
                                                children: [
                                                    (_ref = meta == null ? void 0 : meta.name) != null ? _ref : bid,
                                                    " \xb7 ",
                                                    tier
                                                ]
                                            }, bid);
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-cap-assign-box",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h2k-kicker",
                                        children: "ROSTER ASSIGNMENT (ALL 72 TEAMS + FREE AGENTS)"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                        className: "h2k-select",
                                        value: assignTeamId,
                                        onChange: function onChange(e) {
                                            return setAssignTeamId(e.target.value);
                                        },
                                        "aria-label": "Assign created player to team",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "FREE_AGENTS",
                                                children: "Free Agents Pool (Unassigned)"
                                            }),
                                            snap.teams.map(function(t) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                    value: t.id,
                                                    children: [
                                                        t.city,
                                                        " ",
                                                        t.name,
                                                        " (",
                                                        t.era,
                                                        " \xb7 OVR ",
                                                        t.ovr,
                                                        ")"
                                                    ]
                                                }, t.id);
                                            })
                                        ]
                                    }),
                                    assignTeamId !== 'FREE_AGENTS' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                        className: "h2k-check-row",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                type: "checkbox",
                                                checked: insertAsStarter,
                                                onChange: function onChange(e) {
                                                    return setInsertAsStarter(e.target.checked);
                                                }
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    "Insert directly into Starting 5 (",
                                                    draft.position,
                                                    " slot)"
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("section", {
                        className: "h2k-cap-editor-col",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-cap-presets-row",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "h2k-kicker",
                                        children: "PRESETS:"
                                    }),
                                    ARCHETYPE_PRESETS.map(function(p) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            className: "h2k-mini-pill",
                                            onClick: function onClick() {
                                                return applyPreset(p);
                                            },
                                            children: p.label
                                        }, p.label);
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "h2k-inspector-tabs",
                                children: [
                                    [
                                        'VITALS',
                                        '1. VITALS & GEAR'
                                    ],
                                    [
                                        'ATTRIBUTES',
                                        '2. 18 ATTRIBUTES'
                                    ],
                                    [
                                        'BADGES',
                                        "3. 25 BADGES (" + badgeEntries.length + ")"
                                    ],
                                    [
                                        'HOT_ZONES',
                                        '4. 9 HOT ZONES'
                                    ]
                                ].map(function(param) {
                                    var tId = param[0], label = param[1];
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "h2k-modal-tab " + (tab === tId ? 'active' : ''),
                                        onClick: function onClick() {
                                            _audioEngine.HybridAudioEngine.playUi('click', eraMode);
                                            setTab(tId);
                                        },
                                        children: label
                                    }, tId);
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-cap-tab-body",
                                children: [
                                    tab === 'VITALS' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-form-grid",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-two-col-mini",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                        className: "h2k-form-row",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                children: "Player Full Name"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                                className: "h2k-input",
                                                                value: draft.name,
                                                                maxLength: 28,
                                                                onChange: function onChange(e) {
                                                                    return setDraft(function(p) {
                                                                        return _extends({}, p, {
                                                                            name: e.target.value
                                                                        });
                                                                    });
                                                                }
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                        className: "h2k-form-row",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                children: "Jersey Number (0-99)"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                                type: "number",
                                                                className: "h2k-input",
                                                                min: 0,
                                                                max: 99,
                                                                value: draft.jerseyNumber,
                                                                onChange: function onChange(e) {
                                                                    return setDraft(function(p) {
                                                                        return _extends({}, p, {
                                                                            jerseyNumber: Math.max(0, Math.min(99, Number(e.target.value) || 0))
                                                                        });
                                                                    });
                                                                }
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-form-row",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: "Position"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "h2k-seg-group",
                                                        children: POSITIONS.map(function(pos) {
                                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                type: "button",
                                                                className: "h2k-seg-btn " + (draft.position === pos ? 'active' : ''),
                                                                onClick: function onClick() {
                                                                    return setDraft(function(p) {
                                                                        return _extends({}, p, {
                                                                            position: pos
                                                                        });
                                                                    });
                                                                },
                                                                children: pos
                                                            }, pos);
                                                        })
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-three-col-mini",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                        className: "h2k-form-row",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                children: [
                                                                    "Height (",
                                                                    (0, _rosterTypes.formatHeightFeetInches)(draft.heightInches),
                                                                    ")"
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                                type: "range",
                                                                min: 69,
                                                                max: 88,
                                                                value: draft.heightInches,
                                                                onChange: function onChange(e) {
                                                                    return setDraft(function(p) {
                                                                        return _extends({}, p, {
                                                                            heightInches: Number(e.target.value)
                                                                        });
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
                                                                    "Weight (",
                                                                    draft.weightLbs,
                                                                    " lbs)"
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                                type: "range",
                                                                min: 155,
                                                                max: 315,
                                                                value: draft.weightLbs,
                                                                onChange: function onChange(e) {
                                                                    return setDraft(function(p) {
                                                                        return _extends({}, p, {
                                                                            weightLbs: Number(e.target.value)
                                                                        });
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
                                                                    "Wingspan (",
                                                                    (0, _rosterTypes.formatHeightFeetInches)(draft.wingspanInches),
                                                                    ")"
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                                type: "range",
                                                                min: 70,
                                                                max: 96,
                                                                value: draft.wingspanInches,
                                                                onChange: function onChange(e) {
                                                                    return setDraft(function(p) {
                                                                        return _extends({}, p, {
                                                                            wingspanInches: Number(e.target.value)
                                                                        });
                                                                    });
                                                                }
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-two-col-mini",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                        className: "h2k-form-row",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                children: "Hairstyle"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                                className: "h2k-select",
                                                                value: draft.appearance.hairStyle,
                                                                onChange: function onChange(e) {
                                                                    return setDraft(function(p) {
                                                                        return _extends({}, p, {
                                                                            appearance: _extends({}, p.appearance, {
                                                                                hairStyle: e.target.value
                                                                            })
                                                                        });
                                                                    });
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
                                                        className: "h2k-form-row",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                children: "Arm Sleeve"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                                className: "h2k-select",
                                                                value: draft.appearance.armSleeve,
                                                                onChange: function onChange(e) {
                                                                    return setDraft(function(p) {
                                                                        return _extends({}, p, {
                                                                            appearance: _extends({}, p.appearance, {
                                                                                armSleeve: e.target.value
                                                                            })
                                                                        });
                                                                    });
                                                                },
                                                                children: SLEEVE_OPTS.map(function(s) {
                                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                        value: s,
                                                                        children: s
                                                                    }, s);
                                                                })
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-swatch-row",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: "Skin Tone"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "h2k-swatches",
                                                        children: SKIN_TONES.map(function(hex) {
                                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                type: "button",
                                                                className: "h2k-swatch " + (draft.appearance.skinTone === hex ? 'active' : ''),
                                                                style: {
                                                                    backgroundColor: hex
                                                                },
                                                                onClick: function onClick() {
                                                                    return setDraft(function(p) {
                                                                        return _extends({}, p, {
                                                                            appearance: _extends({}, p.appearance, {
                                                                                skinTone: hex
                                                                            })
                                                                        });
                                                                    });
                                                                }
                                                            }, hex);
                                                        })
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-swatch-row",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: "Hair Color"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "h2k-swatches",
                                                        children: HAIR_COLORS.map(function(hex) {
                                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                type: "button",
                                                                className: "h2k-swatch " + (draft.appearance.hairColor === hex ? 'active' : ''),
                                                                style: {
                                                                    backgroundColor: hex
                                                                },
                                                                onClick: function onClick() {
                                                                    return setDraft(function(p) {
                                                                        return _extends({}, p, {
                                                                            appearance: _extends({}, p.appearance, {
                                                                                hairColor: hex
                                                                            })
                                                                        });
                                                                    });
                                                                }
                                                            }, hex);
                                                        })
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-swatch-row",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: "Sneaker Colorway"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "h2k-swatches",
                                                        children: SHOE_COLORS.map(function(hex) {
                                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                type: "button",
                                                                className: "h2k-swatch " + (draft.appearance.shoeColor === hex ? 'active' : ''),
                                                                style: {
                                                                    backgroundColor: hex
                                                                },
                                                                onClick: function onClick() {
                                                                    return setDraft(function(p) {
                                                                        return _extends({}, p, {
                                                                            appearance: _extends({}, p.appearance, {
                                                                                shoeColor: hex
                                                                            })
                                                                        });
                                                                    });
                                                                }
                                                            }, hex);
                                                        })
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-two-col-mini",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                        className: "h2k-check-row",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                                type: "checkbox",
                                                                checked: draft.appearance.headband,
                                                                onChange: function onChange(e) {
                                                                    return setDraft(function(p) {
                                                                        return _extends({}, p, {
                                                                            appearance: _extends({}, p.appearance, {
                                                                                headband: e.target.checked
                                                                            })
                                                                        });
                                                                    });
                                                                }
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                children: "Headband"
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                        className: "h2k-check-row",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                                type: "checkbox",
                                                                checked: draft.appearance.legCompression,
                                                                onChange: function onChange(e) {
                                                                    return setDraft(function(p) {
                                                                        return _extends({}, p, {
                                                                            appearance: _extends({}, p.appearance, {
                                                                                legCompression: e.target.checked
                                                                            })
                                                                        });
                                                                    });
                                                                }
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                children: "Leg Compression Tights"
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
                                                            "Jumpshot Release Speed (",
                                                            draft.jumpshotSpeed.toFixed(2),
                                                            "s — Lower is Faster)"
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                        type: "range",
                                                        min: 0.75,
                                                        max: 1.25,
                                                        step: 0.05,
                                                        value: draft.jumpshotSpeed,
                                                        onChange: function onChange(e) {
                                                            return setDraft(function(p) {
                                                                return _extends({}, p, {
                                                                    jumpshotSpeed: Number(e.target.value)
                                                                });
                                                            });
                                                        }
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    tab === 'ATTRIBUTES' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h2k-attr-editor-grid",
                                        children: _rosterTypes.ATTRIBUTE_META.map(function(meta) {
                                            var val = draft.attributes[meta.key];
                                            var barColor = val >= 90 ? '#22c55e' : val >= 80 ? '#f59e0b' : val >= 70 ? '#38bdf8' : '#94a3b8';
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                className: "h2k-attr-slider-row",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "h2k-attr-slider-top",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                children: meta.label
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                style: {
                                                                    color: barColor
                                                                },
                                                                children: val
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                        type: "range",
                                                        min: 25,
                                                        max: 99,
                                                        value: val,
                                                        onChange: function onChange(e) {
                                                            return setAttr(meta.key, Number(e.target.value));
                                                        }
                                                    })
                                                ]
                                            }, meta.key);
                                        })
                                    }),
                                    tab === 'BADGES' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-badges-panel",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "h2k-badge-cat-tabs",
                                                children: BADGE_CATS.map(function(cat) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        type: "button",
                                                        className: "h2k-mini-pill " + (badgeCat === cat ? 'active' : ''),
                                                        onClick: function onClick() {
                                                            return setBadgeCat(cat);
                                                        },
                                                        children: cat
                                                    }, cat);
                                                })
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                className: "h2k-hint-text",
                                                children: "Click any badge to cycle tier: OFF → Bronze → Silver → Gold → HOF → Legend."
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "h2k-badge-grid",
                                                children: _rosterTypes.BADGE_CATALOG.filter(function(b) {
                                                    return b.category === badgeCat;
                                                }).map(function(badge) {
                                                    var tier = draft.badges[badge.id];
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        type: "button",
                                                        className: "h2k-badge-card " + (tier ? "tier-" + tier.toLowerCase() : 'tier-none'),
                                                        onClick: function onClick() {
                                                            return toggleBadge(badge.id);
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "h2k-badge-card-top",
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                        children: badge.name
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                        className: "h2k-badge-tier-tag",
                                                                        children: tier != null ? tier : 'OFF'
                                                                    })
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                                children: badge.shortDesc
                                                            })
                                                        ]
                                                    }, badge.id);
                                                })
                                            })
                                        ]
                                    }),
                                    tab === 'HOT_ZONES' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-hz-panel",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_TeamLogo.HotZoneCourtSVG, {
                                                zones: draft.hotZones,
                                                interactive: true,
                                                onToggleZone: setHotZone
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-hz-quick-row",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        type: "button",
                                                        className: "h2k-mini-pill",
                                                        onClick: function onClick() {
                                                            return setDraft(function(p) {
                                                                return _extends({}, p, {
                                                                    hotZones: {
                                                                        leftCorner3: 1,
                                                                        leftWing3: 1,
                                                                        topKey3: 1,
                                                                        rightWing3: 1,
                                                                        rightCorner3: 1,
                                                                        leftMid: 1,
                                                                        topMid: 1,
                                                                        rightMid: 1,
                                                                        paint: 1
                                                                    }
                                                                });
                                                            });
                                                        },
                                                        children: "SET ALL HOT \uD83D\uDD25"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        type: "button",
                                                        className: "h2k-mini-pill",
                                                        onClick: function onClick() {
                                                            return setDraft(function(p) {
                                                                return _extends({}, p, {
                                                                    hotZones: {
                                                                        leftCorner3: 0,
                                                                        leftWing3: 0,
                                                                        topKey3: 0,
                                                                        rightWing3: 0,
                                                                        rightCorner3: 0,
                                                                        leftMid: 0,
                                                                        topMid: 0,
                                                                        rightMid: 0,
                                                                        paint: 0
                                                                    }
                                                                });
                                                            });
                                                        },
                                                        children: "RESET NEUTRAL"
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
        ]
    });
};

});

})(window.ArcadeMod);
