(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/hybrid/PlayNowSetup ===
ArcadeMod.define("src/games/hoops-2k26/hybrid/PlayNowSetup", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PlayNowSetup", {
    enumerable: true,
    get: function() {
        return PlayNowSetup;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _teamCatalog = require("./teamCatalog");
var _rosterStore = require("./rosterStore");
var _audioEngine = require("./audioEngine");
var _store = require("./store");
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
var JERSEYS = [
    'HOME',
    'AWAY',
    'CLASSIC',
    'CITY'
];
var QUARTERS = [
    2,
    5,
    8,
    12
];
var DIFFICULTIES = [
    'Rookie',
    'Pro',
    'All-Star',
    'Superstar',
    'Hall of Fame'
];
function RatingMeter(param) {
    var label = param.label, value = param.value, color = param.color;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h2k-rating-row",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                className: "h2k-rating-lbl",
                children: label
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-rating-track",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "h2k-rating-fill",
                    style: {
                        width: "" + Math.min(100, Math.max(40, value)) + "%",
                        backgroundColor: color
                    }
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                className: "h2k-rating-num",
                children: value
            })
        ]
    });
}
var PlayNowSetup = function PlayNowSetup(param) {
    var eraMode = param.eraMode, config = param.config, onBack = param.onBack, onOpenRosterManager = param.onOpenRosterManager, onOpenCreateAPlayer = param.onOpenCreateAPlayer, onTipOff = param.onTipOff;
    var rosterSnap = (0, _rosterStore.useRosterStore)();
    var awayPoolTeams = (0, _react.useMemo)(function() {
        return (0, _teamCatalog.getTeamsByEraPool)(config.awayEraPool);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        config.awayEraPool,
        rosterSnap.revision
    ]);
    var homePoolTeams = (0, _react.useMemo)(function() {
        return (0, _teamCatalog.getTeamsByEraPool)(config.homeEraPool);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        config.homeEraPool,
        rosterSnap.revision
    ]);
    var awayTeam = (0, _react.useMemo)(function() {
        var _ref;
        var found = awayPoolTeams.find(function(t) {
            return t.id === config.awayTeamId;
        });
        return (_ref = found != null ? found : awayPoolTeams[0]) != null ? _ref : (0, _teamCatalog.getHybridTeamById)(config.awayTeamId);
    }, [
        awayPoolTeams,
        config.awayTeamId
    ]);
    var homeTeam = (0, _react.useMemo)(function() {
        var _ref;
        var found = homePoolTeams.find(function(t) {
            return t.id === config.homeTeamId;
        });
        return (_ref = found != null ? found : homePoolTeams[0]) != null ? _ref : (0, _teamCatalog.getHybridTeamById)(config.homeTeamId);
    }, [
        homePoolTeams,
        config.homeTeamId
    ]);
    var setPool = function setPool(side, pool) {
        var _teams_;
        _audioEngine.HybridAudioEngine.playUi('switch', eraMode);
        var teams = (0, _teamCatalog.getTeamsByEraPool)(pool);
        var pick = (_teams_ = teams[side === 'home' && teams.length > 1 ? 1 : 0]) != null ? _teams_ : teams[0];
        if (side === 'away') {
            _store.UltimateHybridStore.updateMatchConfig({
                awayEraPool: pool,
                awayTeamId: pick.id
            });
        } else {
            _store.UltimateHybridStore.updateMatchConfig({
                homeEraPool: pool,
                homeTeamId: pick.id,
                venue: pool === 'THE_W' ? 'WNBA_ARENA' : pool === 'EUROLEAGUE_14' ? 'EUROLEAGUE_PALACE' : config.venue
            });
        }
    };
    var stepTeam = function stepTeam(side, delta) {
        _audioEngine.HybridAudioEngine.playUi('click', eraMode);
        var list = side === 'away' ? awayPoolTeams : homePoolTeams;
        var curId = side === 'away' ? awayTeam.id : homeTeam.id;
        var idx = Math.max(0, list.findIndex(function(t) {
            return t.id === curId;
        }));
        var next = list[(idx + delta + list.length) % list.length];
        if (!next) return;
        if (side === 'away') {
            _store.UltimateHybridStore.updateMatchConfig({
                awayTeamId: next.id
            });
        } else {
            _store.UltimateHybridStore.updateMatchConfig({
                homeTeamId: next.id
            });
        }
    };
    var renderTeamSide = function renderTeamSide(side, team, pool, poolTeams, jersey) {
        var isControlled = side === 'away' && config.sideControl === 'AWAY' || side === 'home' && config.sideControl === 'HOME';
        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("section", {
            className: "h2k-matchup-card " + side + " " + (isControlled ? 'is-user' : ''),
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "h2k-matchup-card-top",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                            className: "h2k-side-badge",
                            children: [
                                side === 'away' ? 'AWAY SQUAD' : 'HOME SQUAD',
                                isControlled ? ' · P1 USER' : config.sideControl === 'CPU_VS_CPU' ? ' · CPU' : ' · CPU'
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                            className: "h2k-era-chip",
                            style: {
                                borderColor: team.accentColor
                            },
                            children: team.eraBadge
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "h2k-pool-tabs",
                    role: "tablist",
                    "aria-label": "" + side + " era pools",
                    children: _teamCatalog.ERA_POOL_META.map(function(p) {
                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            className: "h2k-pool-pill " + (pool === p.id ? 'active' : ''),
                            onClick: function onClick() {
                                return setPool(side, p.id);
                            },
                            children: p.shortLabel
                        }, p.id);
                    })
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "h2k-team-selector-row",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            className: "h2k-arrow-btn",
                            "aria-label": "Previous " + side + " team",
                            onClick: function onClick() {
                                return stepTeam(side, -1);
                            },
                            children: "◀"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "h2k-team-identity",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)(_teamCatalog.TeamEmblemSVG, {
                                    team: team,
                                    size: 74
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-team-title-block",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-team-city",
                                            children: team.city
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                            className: "h2k-team-name",
                                            children: team.name
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-team-arena",
                                            children: team.arena
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            className: "h2k-arrow-btn",
                            "aria-label": "Next " + side + " team",
                            onClick: function onClick() {
                                return stepTeam(side, 1);
                            },
                            children: "▶"
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "h2k-team-select-row",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                            className: "h2k-select",
                            "aria-label": "Select " + side + " team",
                            value: team.id,
                            onChange: function onChange(e) {
                                _audioEngine.HybridAudioEngine.playUi('click', eraMode);
                                if (side === 'away') _store.UltimateHybridStore.updateMatchConfig({
                                    awayTeamId: e.target.value
                                });
                                else _store.UltimateHybridStore.updateMatchConfig({
                                    homeTeamId: e.target.value
                                });
                            },
                            children: poolTeams.map(function(t) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                    value: t.id,
                                    children: [
                                        t.fullName,
                                        " (",
                                        t.ovr,
                                        " OVR)"
                                    ]
                                }, t.id);
                            })
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                            type: "button",
                            className: "h2k-mini-pill",
                            onClick: function onClick() {
                                _audioEngine.HybridAudioEngine.playUi('click', eraMode);
                                var nextJ = JERSEYS[(JERSEYS.indexOf(jersey) + 1) % JERSEYS.length];
                                if (side === 'away') _store.UltimateHybridStore.updateMatchConfig({
                                    awayJersey: nextJ
                                });
                                else _store.UltimateHybridStore.updateMatchConfig({
                                    homeJersey: nextJ
                                });
                            },
                            children: [
                                "JERSEY: ",
                                jersey
                            ]
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "h2k-ratings-box",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)(RatingMeter, {
                            label: "OVR",
                            value: team.ovr,
                            color: "#f59e0b"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)(RatingMeter, {
                            label: "OFF",
                            value: team.off,
                            color: "#e11d48"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)(RatingMeter, {
                            label: "DEF",
                            value: team.def,
                            color: "#38bdf8"
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "h2k-star-spotlight",
                    style: {
                        borderLeftColor: team.accentColor
                    },
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-star-kicker",
                                    children: [
                                        "STAR SPOTLIGHT \xb7 #",
                                        team.starPlayer.jersey
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                    children: team.starPlayer.name
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                    className: "h2k-star-sig",
                                    children: [
                                        team.starPlayer.position,
                                        " \xb7 ",
                                        team.starPlayer.signatureTag
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "h2k-star-ovr",
                            children: team.starPlayer.ovr
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "h2k-starters-grid",
                    children: team.starters.map(function(p, idx) {
                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "h2k-starter-chip",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    className: "pos",
                                    children: p.position
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    className: "name",
                                    children: p.name
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                    className: "ovr",
                                    children: p.ovr
                                })
                            ]
                        }, p.name + "_" + idx);
                    })
                })
            ]
        });
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h2k-playnow-screen",
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
                                children: "◀ MAIN MENU"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h2k-kicker",
                                        children: "PRE-GAME BROADCAST MATCHUP"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                        children: "PLAY NOW \xb7 CROSS-ERA TEAM SELECT"
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "h2k-subscreen-right h2k-roster-head-actions",
                        children: [
                            onOpenRosterManager && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-btn-ghost",
                                onClick: function onClick() {
                                    _audioEngine.HybridAudioEngine.playUi('click', eraMode);
                                    onOpenRosterManager(homeTeam.id);
                                },
                                children: "\uD83D\uDCCB MANAGE ROSTER"
                            }),
                            onOpenCreateAPlayer && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-btn-ghost",
                                onClick: function onClick() {
                                    _audioEngine.HybridAudioEngine.playUi('click', eraMode);
                                    onOpenCreateAPlayer(homeTeam.id);
                                },
                                children: "+ CREATE-A-PLAYER"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-btn-ghost",
                                onClick: function onClick() {
                                    var _ref, _ref1;
                                    _audioEngine.HybridAudioEngine.playUi('switch', eraMode);
                                    var randAway = awayPoolTeams[Math.floor(Math.random() * awayPoolTeams.length)];
                                    var randHome = homePoolTeams[Math.floor(Math.random() * homePoolTeams.length)];
                                    _store.UltimateHybridStore.updateMatchConfig({
                                        awayTeamId: (_ref = randAway == null ? void 0 : randAway.id) != null ? _ref : config.awayTeamId,
                                        homeTeamId: (_ref1 = randHome == null ? void 0 : randHome.id) != null ? _ref1 : config.homeTeamId
                                    });
                                },
                                children: "\uD83C\uDFB2 RANDOMIZE MATCHUP"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "h2k-matchup-split",
                children: [
                    renderTeamSide('away', awayTeam, config.awayEraPool, awayPoolTeams, config.awayJersey),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "h2k-vs-divider",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "h2k-vs-badge",
                                children: "VS"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-side-select-box",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "h2k-side-select-lbl",
                                        children: "SIDE SELECT"
                                    }),
                                    [
                                        'AWAY',
                                        'HOME',
                                        'CPU_VS_CPU'
                                    ].map(function(mode) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            className: "h2k-side-opt " + (config.sideControl === mode ? 'active' : ''),
                                            onClick: function onClick() {
                                                _audioEngine.HybridAudioEngine.playUi('click', eraMode);
                                                _store.UltimateHybridStore.updateMatchConfig({
                                                    sideControl: mode
                                                });
                                            },
                                            children: mode === 'CPU_VS_CPU' ? 'CPU vs CPU' : mode
                                        }, mode);
                                    })
                                ]
                            })
                        ]
                    }),
                    renderTeamSide('home', homeTeam, config.homeEraPool, homePoolTeams, config.homeJersey)
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("footer", {
                className: "h2k-pregame-dock",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "h2k-pregame-controls",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                className: "h2k-control-field",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "VENUE / COURT"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                        className: "h2k-select",
                                        value: config.venue,
                                        onChange: function onChange(e) {
                                            _audioEngine.HybridAudioEngine.playUi('click', eraMode);
                                            _store.UltimateHybridStore.updateMatchConfig({
                                                venue: e.target.value
                                            });
                                        },
                                        children: _teamCatalog.VENUE_OPTIONS.map(function(v) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                value: v.id,
                                                children: [
                                                    v.label,
                                                    " (",
                                                    v.eraNote,
                                                    ")"
                                                ]
                                            }, v.id);
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-control-field",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "QUARTER LENGTH"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h2k-seg-group",
                                        children: QUARTERS.map(function(q) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                type: "button",
                                                className: "h2k-seg-btn " + (config.quarterLengthMin === q ? 'active' : ''),
                                                onClick: function onClick() {
                                                    _audioEngine.HybridAudioEngine.playUi('click', eraMode);
                                                    _store.UltimateHybridStore.updateMatchConfig({
                                                        quarterLengthMin: q
                                                    });
                                                },
                                                children: [
                                                    q,
                                                    "M"
                                                ]
                                            }, q);
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                className: "h2k-control-field",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "DIFFICULTY"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                        className: "h2k-select",
                                        value: config.difficulty,
                                        onChange: function onChange(e) {
                                            _audioEngine.HybridAudioEngine.playUi('click', eraMode);
                                            _store.UltimateHybridStore.updateMatchConfig({
                                                difficulty: e.target.value
                                            });
                                        },
                                        children: DIFFICULTIES.map(function(d) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: d,
                                                children: d
                                            }, d);
                                        })
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        type: "button",
                        className: "h2k-tipoff-cta",
                        onClick: function onClick() {
                            _audioEngine.HybridAudioEngine.playWhistle();
                            _audioEngine.HybridAudioEngine.announce("Tip-off! " + awayTeam.fullName + " at " + homeTeam.fullName + "!");
                            onTipOff(_extends({}, config, {
                                awayTeamId: awayTeam.id,
                                homeTeamId: homeTeam.id
                            }), awayTeam, homeTeam);
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "h2k-tipoff-title",
                                children: "TIP-OFF / START GAME"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "h2k-tipoff-sub",
                                children: [
                                    awayTeam.abbr,
                                    " @ ",
                                    homeTeam.abbr,
                                    " \xb7 ",
                                    config.quarterLengthMin,
                                    "m QTR \xb7 ",
                                    config.difficulty
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
// === MODULE: src/games/hoops-2k26/hybrid/TeamLogo ===
ArcadeMod.define("src/games/hoops-2k26/hybrid/TeamLogo", function(require, module, exports) {
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
    get HotZoneCourtSVG () {
        return HotZoneCourtSVG;
    },
    get TeamLogo () {
        return TeamLogo;
    },
    get TeamLogoFromData () {
        return TeamLogoFromData;
    },
    get eraShortBadge () {
        return eraShortBadge;
    },
    get pickShapeForTeam () {
        return pickShapeForTeam;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_default(require("react"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function eraShortBadge(era) {
    if (era === '2K14') return "'14";
    if (era === '2K26') return "'26";
    if (era === 'LEGENDS') return 'LEGEND';
    if (era === 'EUROLEAGUE') return 'EURO';
    return 'WNBA';
}
function pickShapeForTeam(id, era) {
    if (era === 'LEGENDS') return 'CROWN';
    if (era === 'EUROLEAGUE') return 'CREST';
    if (era === 'WNBA') return 'STAR';
    var hash = 0;
    for(var i = 0; i < id.length; i++)hash = hash * 31 + id.charCodeAt(i) | 0;
    var shapes = [
        'SHIELD',
        'DIAMOND',
        'CREST',
        'STAR'
    ];
    return shapes[Math.abs(hash) % shapes.length];
}
var TeamLogo = function TeamLogo(param) {
    var id = param.id, abbr = param.abbr, name = param.name, era = param.era, primaryColor = param.primaryColor, secondaryColor = param.secondaryColor, accentColor = param.accentColor, ovr = param.ovr, shape = param.shape, _param_size = param.size, size = _param_size === void 0 ? 64 : _param_size;
    var uid = "tl_" + id.replace(/[^a-zA-Z0-9]/g, '_') + "_" + size;
    var resolvedShape = shape != null ? shape : pickShapeForTeam(id, era);
    var badge = eraShortBadge(era);
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
        width: size,
        height: size,
        viewBox: "0 0 96 96",
        role: "img",
        "aria-label": (name != null ? name : abbr) + " " + badge + " emblem",
        className: "h2k-emblem-svg",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("defs", {
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("linearGradient", {
                        id: "" + uid + "_bg",
                        x1: "0",
                        y1: "0",
                        x2: "1",
                        y2: "1",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: "0%",
                                stopColor: primaryColor
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: "100%",
                                stopColor: "#090C14"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("linearGradient", {
                        id: "" + uid + "_rim",
                        x1: "0",
                        y1: "0",
                        x2: "0",
                        y2: "1",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: "0%",
                                stopColor: secondaryColor
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                offset: "100%",
                                stopColor: accentColor
                            })
                        ]
                    })
                ]
            }),
            resolvedShape === 'CROWN' ? /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                d: "M12 28 L27 40 L48 14 L69 40 L84 28 L77 75 L48 88 L19 75 Z",
                fill: "url(#" + uid + "_bg)",
                stroke: "url(#" + uid + "_rim)",
                strokeWidth: "3.6"
            }) : resolvedShape === 'DIAMOND' ? /*#__PURE__*/ (0, _jsxruntime.jsx)("polygon", {
                points: "48,6 88,48 48,90 8,48",
                fill: "url(#" + uid + "_bg)",
                stroke: "url(#" + uid + "_rim)",
                strokeWidth: "3.6"
            }) : resolvedShape === 'STAR' ? /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                cx: "48",
                cy: "48",
                r: "41",
                fill: "url(#" + uid + "_bg)",
                stroke: "url(#" + uid + "_rim)",
                strokeWidth: "3.8"
            }) : resolvedShape === 'CREST' ? /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                d: "M16 14 H80 L84 44 C84 68 65 81 48 88 C31 81 12 68 12 44 Z",
                fill: "url(#" + uid + "_bg)",
                stroke: "url(#" + uid + "_rim)",
                strokeWidth: "3.6"
            }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                d: "M16 14 H80 V52 C80 71 64 82 48 88 C32 82 16 71 16 52 Z",
                fill: "url(#" + uid + "_bg)",
                stroke: "url(#" + uid + "_rim)",
                strokeWidth: "3.6"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                cx: "48",
                cy: "48",
                r: "28",
                fill: "none",
                stroke: secondaryColor,
                strokeOpacity: "0.3",
                strokeWidth: "1.5"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                d: "M23 39 Q48 51 73 39 M23 57 Q48 45 73 57",
                fill: "none",
                stroke: accentColor,
                strokeOpacity: "0.28",
                strokeWidth: "1.4"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                x: "26",
                y: "17",
                width: "44",
                height: "12",
                rx: "4",
                fill: "#090C14",
                fillOpacity: "0.88",
                stroke: accentColor,
                strokeWidth: "1"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("text", {
                x: "48",
                y: "25.5",
                textAnchor: "middle",
                fill: accentColor,
                fontSize: "7.4",
                fontWeight: "900",
                fontFamily: "system-ui, sans-serif",
                letterSpacing: "0.8",
                children: badge
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("text", {
                x: "48",
                y: "55",
                textAnchor: "middle",
                fill: "#FFFFFF",
                fontSize: abbr.length > 3 ? '17' : '22',
                fontWeight: "900",
                fontFamily: "Impact, 'Arial Black', sans-serif",
                letterSpacing: "1.1",
                children: abbr
            }),
            typeof ovr === 'number' && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                        x: "28",
                        y: "64",
                        width: "40",
                        height: "12",
                        rx: "3",
                        fill: "#090C14",
                        fillOpacity: "0.86",
                        stroke: secondaryColor,
                        strokeWidth: "1"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("text", {
                        x: "48",
                        y: "72.5",
                        textAnchor: "middle",
                        fill: "#FFFFFF",
                        fontSize: "7.5",
                        fontWeight: "800",
                        fontFamily: "system-ui, sans-serif",
                        children: [
                            "OVR ",
                            ovr
                        ]
                    })
                ]
            })
        ]
    });
};
var TeamLogoFromData = function TeamLogoFromData(param) {
    var team = param.team, _param_size = param.size, size = _param_size === void 0 ? 56 : _param_size;
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(TeamLogo, {
        id: team.id,
        abbr: team.abbr,
        name: team.city + " " + team.name,
        era: team.era,
        primaryColor: team.colors.primary,
        secondaryColor: team.colors.secondary,
        accentColor: team.colors.accent,
        ovr: team.ovr,
        size: size
    });
};
var ZONE_LABELS = {
    leftCorner3: {
        label: 'L3',
        lx: 22,
        ly: 34
    },
    rightCorner3: {
        label: 'R3',
        lx: 278,
        ly: 34
    },
    leftWing3: {
        label: 'LW3',
        lx: 50,
        ly: 148
    },
    topKey3: {
        label: 'TOP3',
        lx: 150,
        ly: 194
    },
    rightWing3: {
        label: 'RW3',
        lx: 250,
        ly: 148
    },
    leftMid: {
        label: 'LMID',
        lx: 64,
        ly: 86
    },
    topMid: {
        label: 'TMID',
        lx: 150,
        ly: 138
    },
    rightMid: {
        label: 'RMID',
        lx: 236,
        ly: 86
    },
    paint: {
        label: 'PAINT',
        lx: 150,
        ly: 66
    }
};
function zoneFill(val) {
    if (val === 1) return 'rgba(225, 29, 72, 0.72)'; // Hot crimson
    if (val === -1) return 'rgba(56, 189, 248, 0.56)'; // Cold icy blue
    return 'rgba(100, 116, 139, 0.32)'; // Neutral slate
}
function zoneStroke(val) {
    if (val === 1) return '#fbbf24';
    if (val === -1) return '#7dd3fc';
    return '#64748b';
}
function nextHotZoneVal(v) {
    if (v === -1) return 0;
    if (v === 0) return 1;
    return -1;
}
var HotZoneCourtSVG = function HotZoneCourtSVG(param) {
    var zones = param.zones, _param_interactive = param.interactive, interactive = _param_interactive === void 0 ? false : _param_interactive, onToggleZone = param.onToggleZone;
    var handleClick = function handleClick(key) {
        if (!interactive || !onToggleZone) return;
        onToggleZone(key, nextHotZoneVal(zones[key]));
    };
    var zoneCls = interactive ? 'h2k-hz-shape is-interactive' : 'h2k-hz-shape';
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h2k-hotzone-wrap",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
                viewBox: "0 0 300 225",
                className: "h2k-hotzone-svg",
                role: "img",
                "aria-label": "9-Zone Half-Court Hot Zones Map",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                        x: "4",
                        y: "4",
                        width: "292",
                        height: "217",
                        rx: "10",
                        fill: "#0b1120",
                        stroke: "#334155",
                        strokeWidth: "2"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                        x: "8",
                        y: "8",
                        width: "30",
                        height: "78",
                        rx: "4",
                        className: zoneCls,
                        fill: zoneFill(zones.leftCorner3),
                        stroke: zoneStroke(zones.leftCorner3),
                        strokeWidth: "1.5",
                        onClick: function onClick() {
                            return handleClick('leftCorner3');
                        }
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                        x: "262",
                        y: "8",
                        width: "30",
                        height: "78",
                        rx: "4",
                        className: zoneCls,
                        fill: zoneFill(zones.rightCorner3),
                        stroke: zoneStroke(zones.rightCorner3),
                        strokeWidth: "1.5",
                        onClick: function onClick() {
                            return handleClick('rightCorner3');
                        }
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                        d: "M 8 90 H 56 L 98 164 L 68 214 H 8 Z",
                        className: zoneCls,
                        fill: zoneFill(zones.leftWing3),
                        stroke: zoneStroke(zones.leftWing3),
                        strokeWidth: "1.5",
                        onClick: function onClick() {
                            return handleClick('leftWing3');
                        }
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                        d: "M 102 164 H 198 L 228 214 H 72 Z",
                        className: zoneCls,
                        fill: zoneFill(zones.topKey3),
                        stroke: zoneStroke(zones.topKey3),
                        strokeWidth: "1.5",
                        onClick: function onClick() {
                            return handleClick('topKey3');
                        }
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                        d: "M 244 90 H 292 V 214 H 232 L 202 164 Z",
                        className: zoneCls,
                        fill: zoneFill(zones.rightWing3),
                        stroke: zoneStroke(zones.rightWing3),
                        strokeWidth: "1.5",
                        onClick: function onClick() {
                            return handleClick('rightWing3');
                        }
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                        d: "M 42 8 H 104 V 114 L 78 158 L 42 86 Z",
                        className: zoneCls,
                        fill: zoneFill(zones.leftMid),
                        stroke: zoneStroke(zones.leftMid),
                        strokeWidth: "1.5",
                        onClick: function onClick() {
                            return handleClick('leftMid');
                        }
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                        d: "M 196 8 H 258 V 86 L 222 158 L 196 114 Z",
                        className: zoneCls,
                        fill: zoneFill(zones.rightMid),
                        stroke: zoneStroke(zones.rightMid),
                        strokeWidth: "1.5",
                        onClick: function onClick() {
                            return handleClick('rightMid');
                        }
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                        d: "M 106 114 H 194 L 218 160 H 82 Z",
                        className: zoneCls,
                        fill: zoneFill(zones.topMid),
                        stroke: zoneStroke(zones.topMid),
                        strokeWidth: "1.5",
                        onClick: function onClick() {
                            return handleClick('topMid');
                        }
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                        x: "108",
                        y: "8",
                        width: "84",
                        height: "102",
                        rx: "4",
                        className: zoneCls,
                        fill: zoneFill(zones.paint),
                        stroke: zoneStroke(zones.paint),
                        strokeWidth: "1.8",
                        onClick: function onClick() {
                            return handleClick('paint');
                        }
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                        d: "M 40 8 V 86 A 114 114 0 0 0 260 86 V 8",
                        fill: "none",
                        stroke: "#f8fafc",
                        strokeOpacity: "0.6",
                        strokeWidth: "2",
                        pointerEvents: "none"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                        cx: "150",
                        cy: "110",
                        r: "26",
                        fill: "none",
                        stroke: "#cbd5e1",
                        strokeOpacity: "0.48",
                        strokeWidth: "1.4",
                        pointerEvents: "none"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("line", {
                        x1: "132",
                        y1: "18",
                        x2: "168",
                        y2: "18",
                        stroke: "#f8fafc",
                        strokeWidth: "2.4",
                        pointerEvents: "none"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                        cx: "150",
                        cy: "26",
                        r: "6.5",
                        fill: "none",
                        stroke: "#f97316",
                        strokeWidth: "2.5",
                        pointerEvents: "none"
                    }),
                    Object.keys(ZONE_LABELS).map(function(key) {
                        var item = ZONE_LABELS[key];
                        var val = zones[key];
                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("text", {
                            x: item.lx,
                            y: item.ly,
                            textAnchor: "middle",
                            fill: "#FFFFFF",
                            fontSize: "8.5",
                            fontWeight: "900",
                            fontFamily: "system-ui, sans-serif",
                            pointerEvents: "none",
                            children: [
                                item.label,
                                " ",
                                val === 1 ? '🔥' : val === -1 ? '❄' : '•'
                            ]
                        }, key);
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "h2k-hotzone-legend",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                        className: "hz-hot",
                        children: "● HOT (+1)"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                        className: "hz-mid",
                        children: "● NEUTRAL (0)"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                        className: "hz-cold",
                        children: "● COLD (-1)"
                    }),
                    interactive && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                        className: "hz-hint",
                        children: "Click any zone to toggle"
                    })
                ]
            })
        ]
    });
};

});
// === MODULE: src/games/hoops-2k26/modes/BlacktopSetup ===
ArcadeMod.define("src/games/hoops-2k26/modes/BlacktopSetup", function(require, module, exports) {
// ============================================================================
// PART 6 — BLACKTOP SETUP (1v1 / 2v2 / 3v3 / 5v5)
// Draft ANY players from all 72 teams (2K14, 2K26, Legends, EuroLeague, WNBA)
// PLUS all 5 persistent MyPLAYER builds! Pick Venue, Target Score (11/21),
// Scoring (1s & 2s / 2s & 3s), and Make-It-Take-It rules.
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BlacktopSetup", {
    enumerable: true,
    get: function() {
        return BlacktopSetup;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _rosterStore = require("../hybrid/rosterStore");
var _store = require("../hybrid/store");
var _audioEngine = require("../hybrid/audioEngine");
var _modesStore = require("./modesStore");
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
var BLACKTOP_VENUES = [
    {
        id: 'BLACKTOP_CAGE',
        label: 'Blacktop Cage'
    },
    {
        id: 'SKYLINE_PARK',
        label: 'Skyline Park (2K26)'
    },
    {
        id: 'RIVET_CITY',
        label: 'Rivet City (2K16)'
    },
    {
        id: 'SUNSET_BEACH',
        label: 'Sunset Beach (2K16)'
    },
    {
        id: 'OLD_TOWN',
        label: 'Old Town (2K16)'
    }
];
var BlacktopSetup = function BlacktopSetup(param) {
    var eraMode = param.eraMode, onBack = param.onBack, onNotify = param.onNotify;
    var rosterSnap = (0, _rosterStore.useRosterStore)();
    var modes = (0, _modesStore.useModesStore)();
    var _useState = (0, _react.useState)(3), playersPerSide = _useState[0], setPlayersPerSide = _useState[1];
    var _useState1 = (0, _react.useState)('BLACKTOP_CAGE'), venue = _useState1[0], setVenue = _useState1[1];
    var _useState2 = (0, _react.useState)(21), targetScore = _useState2[0], setTargetScore = _useState2[1];
    var _useState3 = (0, _react.useState)('1S_2S'), scoringMode = _useState3[0], setScoringMode = _useState3[1];
    var _useState4 = (0, _react.useState)(true), makeItTakeIt = _useState4[0], setMakeItTakeIt = _useState4[1];
    var _useState5 = (0, _react.useState)('ALL'), poolFilter = _useState5[0], setPoolFilter = _useState5[1];
    var _useState6 = (0, _react.useState)(''), search = _useState6[0], setSearch = _useState6[1];
    var _useState7 = (0, _react.useState)('HOME'), draftSide = _useState7[0], setDraftSide = _useState7[1];
    var fullPool = (0, _react.useMemo)(function() {
        var items = [];
        // Include all 5 custom MyPLAYER builds at top of draft pool
        modes.buildSlots.forEach(function(b) {
            items.push({
                profile: (0, _modesStore.buildToPlayerProfile)(b),
                sourceLabel: "MyPLAYER #" + (b.slotIndex + 1),
                pool: 'MYPLAYER'
            });
        });
        rosterSnap.teams.forEach(function(t) {
            t.roster.slice(0, 6).forEach(function(p) {
                items.push({
                    profile: p,
                    sourceLabel: t.abbr + " (" + t.era.replace('_', ' ') + ")",
                    pool: t.era
                });
            });
        });
        return items;
    }, [
        modes.buildSlots,
        rosterSnap.teams
    ]);
    var _useState8 = (0, _react.useState)(function() {
        var mp = (0, _modesStore.buildToPlayerProfile)(_modesStore.ModesStore.getActiveBuild());
        var okc = _rosterStore.RosterStore.getTeamById('2k26_okc').roster;
        return [
            mp,
            okc[0],
            okc[1],
            okc[2],
            okc[3]
        ];
    }), homeDraft = _useState8[0], setHomeDraft = _useState8[1];
    var _useState9 = (0, _react.useState)(function() {
        var mia = _rosterStore.RosterStore.getTeamById('2k14_mia').roster;
        return [
            mia[0],
            mia[1],
            mia[2],
            mia[3],
            mia[4]
        ];
    }), awayDraft = _useState9[0], setAwayDraft = _useState9[1];
    var filteredPool = (0, _react.useMemo)(function() {
        var q = search.trim().toLowerCase();
        return fullPool.filter(function(item) {
            if (poolFilter !== 'ALL' && item.pool !== poolFilter) return false;
            if (!q) return true;
            return item.profile.name.toLowerCase().includes(q) || item.sourceLabel.toLowerCase().includes(q) || item.profile.position.toLowerCase() === q;
        }).sort(function(a, b) {
            return b.profile.ovr - a.profile.ovr;
        }).slice(0, 48);
    }, [
        fullPool,
        poolFilter,
        search
    ]);
    var draftPlayer = function draftPlayer(p) {
        _audioEngine.HybridAudioEngine.playUi('click', eraMode);
        if (draftSide === 'HOME') {
            setHomeDraft(function(prev) {
                var next = [].concat([
                    p
                ], prev.filter(function(x) {
                    return x.id !== p.id;
                })).slice(0, 5);
                return next;
            });
            onNotify("Drafted " + p.name + " (" + p.ovr + ") to Squad A!");
        } else {
            setAwayDraft(function(prev) {
                var next = [].concat([
                    p
                ], prev.filter(function(x) {
                    return x.id !== p.id;
                })).slice(0, 5);
                return next;
            });
            onNotify("Drafted " + p.name + " (" + p.ovr + ") to Squad B!");
        }
    };
    var handleTipOffBlacktop = function handleTipOffBlacktop() {
        var _ref;
        var _BLACKTOP_VENUES_find;
        _audioEngine.HybridAudioEngine.playUi('confirm', eraMode);
        _store.UltimateHybridStore.updateSettings('gameplay', {
            blacktopScoring: scoringMode,
            blacktopMakeItTakeIt: makeItTakeIt
        });
        var activeHome = homeDraft.slice(0, playersPerSide);
        var activeAway = awayDraft.slice(0, playersPerSide);
        _modesStore.ModesStore.launchModeMatch({
            kind: 'BLACKTOP_CUSTOM',
            title: "Blacktop " + playersPerSide + "v" + playersPerSide + " \xb7 First to " + targetScore,
            subtitle: ((_ref = (_BLACKTOP_VENUES_find = BLACKTOP_VENUES.find(function(v) {
                return v.id === venue;
            })) == null ? void 0 : _BLACKTOP_VENUES_find.label) != null ? _ref : 'Blacktop') + " \xb7 " + (scoringMode === '1S_2S' ? '1s & 2s' : '2s & 3s') + (makeItTakeIt ? ' · Make-It-Take-It' : ''),
            returnScreen: 'BLACKTOP_SETUP',
            matchPatch: {
                homeTeamId: '2k26_okc',
                awayTeamId: '2k14_mia',
                venue: venue,
                playersPerSide: playersPerSide,
                targetScore: targetScore,
                quarterLengthMin: 5,
                difficulty: 'All-Star',
                sideControl: 'HOME',
                modeLabel: "Blacktop " + playersPerSide + "v" + playersPerSide
            },
            customHomeRoster: activeHome,
            customAwayRoster: activeAway,
            twoPointValue: scoringMode === '1S_2S' ? 1 : 2,
            threePointValue: scoringMode === '1S_2S' ? 2 : 3,
            makeItTakeIt: makeItTakeIt,
            objectiveBanner: "Blacktop " + playersPerSide + "v" + playersPerSide + " \xb7 First to " + targetScore + " (" + (scoringMode === '1S_2S' ? '1s & 2s' : '2s & 3s') + ")",
            baseVcReward: 750,
            baseRepReward: 280
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
                                        children: "BLACKTOP CUSTOM DRAFT \xb7 72 TEAMS + MyPLAYER"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-mode-submeta",
                                        children: [
                                            playersPerSide,
                                            "v",
                                            playersPerSide,
                                            " \xb7 First to ",
                                            targetScore,
                                            " \xb7 ",
                                            scoringMode === '1S_2S' ? '1s & 2s' : '2s & 3s',
                                            " \xb7",
                                            ' ',
                                            makeItTakeIt ? 'Make-It-Take-It ON' : 'Alternating Possession'
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "h2k-mode-top-right",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            className: "h2k-mode-btn primary",
                            onClick: handleTipOffBlacktop,
                            children: "\uD83C\uDFC0 Launch Blacktop 3D Match"
                        })
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "h2k-mode-scroll",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "h2k-card",
                        style: {
                            marginBottom: 16
                        },
                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "h2k-grid-4",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-muted",
                                            style: {
                                                marginBottom: 6
                                            },
                                            children: "Format"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            style: {
                                                display: 'flex',
                                                gap: 6
                                            },
                                            children: [
                                                1,
                                                2,
                                                3,
                                                5
                                            ].map(function(n) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    type: "button",
                                                    className: "h2k-mode-btn " + (playersPerSide === n ? 'primary' : ''),
                                                    style: {
                                                        flex: 1,
                                                        padding: '0 6px'
                                                    },
                                                    onClick: function onClick() {
                                                        return setPlayersPerSide(n);
                                                    },
                                                    children: [
                                                        n,
                                                        "v",
                                                        n
                                                    ]
                                                }, n);
                                            })
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-muted",
                                            style: {
                                                marginBottom: 6
                                            },
                                            children: "Street Venue"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                            className: "h2k-select",
                                            style: {
                                                width: '100%',
                                                minHeight: 38
                                            },
                                            value: venue,
                                            onChange: function onChange(e) {
                                                return setVenue(e.target.value);
                                            },
                                            children: BLACKTOP_VENUES.map(function(v) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                    value: v.id,
                                                    children: v.label
                                                }, v.id);
                                            })
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-muted",
                                            style: {
                                                marginBottom: 6
                                            },
                                            children: "Target & Scoring"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            style: {
                                                display: 'flex',
                                                gap: 6
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "h2k-mode-btn " + (targetScore === 11 ? 'primary' : ''),
                                                    style: {
                                                        flex: 1,
                                                        padding: '0 6px'
                                                    },
                                                    onClick: function onClick() {
                                                        return setTargetScore(11);
                                                    },
                                                    children: "To 11"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "h2k-mode-btn " + (targetScore === 21 ? 'primary' : ''),
                                                    style: {
                                                        flex: 1,
                                                        padding: '0 6px'
                                                    },
                                                    onClick: function onClick() {
                                                        return setTargetScore(21);
                                                    },
                                                    children: "To 21"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "h2k-mode-btn cyan",
                                                    style: {
                                                        flex: 1,
                                                        padding: '0 6px'
                                                    },
                                                    onClick: function onClick() {
                                                        return setScoringMode(function(m) {
                                                            return m === '1S_2S' ? '2S_3S' : '1S_2S';
                                                        });
                                                    },
                                                    children: scoringMode === '1S_2S' ? '1s/2s' : '2s/3s'
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-muted",
                                            style: {
                                                marginBottom: 6
                                            },
                                            children: "Possession Rule"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                            type: "button",
                                            className: "h2k-mode-btn " + (makeItTakeIt ? 'emerald' : ''),
                                            style: {
                                                width: '100%'
                                            },
                                            onClick: function onClick() {
                                                return setMakeItTakeIt(function(v) {
                                                    return !v;
                                                });
                                            },
                                            children: [
                                                "Make-It-Take-It: ",
                                                makeItTakeIt ? 'ON' : 'OFF'
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "h2k-grid-2",
                        style: {
                            marginBottom: 16
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-card",
                                style: {
                                    borderColor: draftSide === 'HOME' ? '#f59e0b' : undefined
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-section-head",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                                children: [
                                                    "Your Squad (Home \xb7 ",
                                                    playersPerSide,
                                                    " Active)"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-mode-btn " + (draftSide === 'HOME' ? 'primary' : ''),
                                                style: {
                                                    minHeight: 30
                                                },
                                                onClick: function onClick() {
                                                    return setDraftSide('HOME');
                                                },
                                                children: draftSide === 'HOME' ? '✓ Drafting Here' : 'Draft to Home'
                                            })
                                        ]
                                    }),
                                    homeDraft.slice(0, playersPerSide).map(function(p, idx) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-tabular",
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '6px 0',
                                                borderBottom: '1px solid rgba(255,255,255,0.07)',
                                                fontSize: 13
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    children: [
                                                        "#",
                                                        idx + 1,
                                                        " ",
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                            children: p.name
                                                        }),
                                                        " (",
                                                        p.position,
                                                        ")"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    style: {
                                                        color: '#fbbf24',
                                                        fontWeight: 700
                                                    },
                                                    children: [
                                                        p.ovr,
                                                        " OVR"
                                                    ]
                                                })
                                            ]
                                        }, "hd_" + p.id + "_" + idx);
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-card",
                                style: {
                                    borderColor: draftSide === 'AWAY' ? '#06b6d4' : undefined
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-section-head",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                                children: [
                                                    "Opponent Squad (Away \xb7 ",
                                                    playersPerSide,
                                                    " Active)"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-mode-btn " + (draftSide === 'AWAY' ? 'cyan' : ''),
                                                style: {
                                                    minHeight: 30
                                                },
                                                onClick: function onClick() {
                                                    return setDraftSide('AWAY');
                                                },
                                                children: draftSide === 'AWAY' ? '✓ Drafting Here' : 'Draft to Away'
                                            })
                                        ]
                                    }),
                                    awayDraft.slice(0, playersPerSide).map(function(p, idx) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-tabular",
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '6px 0',
                                                borderBottom: '1px solid rgba(255,255,255,0.07)',
                                                fontSize: 13
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    children: [
                                                        "#",
                                                        idx + 1,
                                                        " ",
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                            children: p.name
                                                        }),
                                                        " (",
                                                        p.position,
                                                        ")"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    style: {
                                                        color: '#38bdf8',
                                                        fontWeight: 700
                                                    },
                                                    children: [
                                                        p.ovr,
                                                        " OVR"
                                                    ]
                                                })
                                            ]
                                        }, "ad_" + p.id + "_" + idx);
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "h2k-card",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-section-head",
                                style: {
                                    flexWrap: 'wrap'
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                        children: [
                                            "Open Player Draft Pool (Click to Add to ",
                                            draftSide === 'HOME' ? 'Your Squad' : 'Opponent Squad',
                                            ")"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        style: {
                                            display: 'flex',
                                            gap: 6,
                                            flexWrap: 'wrap'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                type: "text",
                                                className: "h2k-input",
                                                placeholder: "Search player or team...",
                                                value: search,
                                                onChange: function onChange(e) {
                                                    return setSearch(e.target.value);
                                                },
                                                style: {
                                                    width: 190,
                                                    minHeight: 34
                                                }
                                            }),
                                            [
                                                {
                                                    id: 'ALL',
                                                    label: 'All'
                                                },
                                                {
                                                    id: 'MYPLAYER',
                                                    label: 'MyPLAYER (5)'
                                                },
                                                {
                                                    id: '2K26',
                                                    label: '2K26'
                                                },
                                                {
                                                    id: '2K14',
                                                    label: '2K14'
                                                },
                                                {
                                                    id: 'LEGENDS',
                                                    label: 'Legends'
                                                },
                                                {
                                                    id: 'EUROLEAGUE',
                                                    label: 'Euro'
                                                },
                                                {
                                                    id: 'WNBA',
                                                    label: 'WNBA'
                                                }
                                            ].map(function(f) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "h2k-mode-btn " + (poolFilter === f.id ? 'primary' : ''),
                                                    style: {
                                                        minHeight: 34,
                                                        padding: '0 10px'
                                                    },
                                                    onClick: function onClick() {
                                                        return setPoolFilter(f.id);
                                                    },
                                                    children: f.label
                                                }, f.id);
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "h2k-grid-4",
                                children: filteredPool.map(function(item) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "h2k-card",
                                        style: {
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            padding: 10,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 8
                                        },
                                        onClick: function onClick() {
                                            return draftPlayer(item.profile);
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                style: {
                                                    minWidth: 0
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        style: {
                                                            fontSize: 12,
                                                            display: 'block',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        },
                                                        children: item.profile.name
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "h2k-muted",
                                                        children: [
                                                            item.profile.position,
                                                            " \xb7 ",
                                                            item.sourceLabel
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                className: "h2k-tabular",
                                                style: {
                                                    color: '#fbbf24',
                                                    fontSize: 15
                                                },
                                                children: item.profile.ovr
                                            })
                                        ]
                                    }, item.pool + "_" + item.profile.id);
                                })
                            })
                        ]
                    })
                ]
            })
        ]
    });
};

});
// === MODULE: src/games/hoops-2k26/modes/ModeObjectiveOverlay ===
ArcadeMod.define("src/games/hoops-2k26/modes/ModeObjectiveOverlay", function(require, module, exports) {
// ============================================================================
// PART 6 — LIVE 3D COURT MODE OBJECTIVE HUD & POST-MATCH REWARD SETTLEMENT
// Zero backdrop-filter (60 FPS WebGL Safe). Displays live Path to Greatness,
// Street Kings, Proving Grounds, Theater, MyTEAM & Training Camp objectives
// and settles VC/MTP/Rep/Stars/Medals cleanly upon game completion.
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ModeObjectiveOverlay", {
    enumerable: true,
    get: function() {
        return ModeObjectiveOverlay;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
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
var ModeObjectiveOverlay = function ModeObjectiveOverlay(param) {
    var payload = param.payload, hud = param.hud, _param_suppressPostMatchModal = param.suppressPostMatchModal, suppressPostMatchModal = _param_suppressPostMatchModal === void 0 ? false : _param_suppressPostMatchModal, onModeSettled = param.onModeSettled, onFinishAndReturn = param.onFinishAndReturn, onRematch = param.onRematch;
    var settledRef = (0, _react.useRef)(false);
    var _useState = (0, _react.useState)(null), settled = _useState[0], setSettled = _useState[1];
    // Track live star stats & drill metric from SimHudSnapshot box scores
    var liveProgress = (0, _react.useMemo)(function() {
        var _hud_userTeamSide, _payload_starPlayerTargetName;
        if (!payload) return {
            starPts: 0,
            starAst: 0,
            drillCount: 0,
            userWon: false,
            margin: 0
        };
        var userSide = (_hud_userTeamSide = hud.userTeamSide) != null ? _hud_userTeamSide : 'HOME';
        var userScore = userSide === 'HOME' ? hud.homeScore : hud.awayScore;
        var oppScore = userSide === 'HOME' ? hud.awayScore : hud.homeScore;
        var margin = userScore - oppScore;
        var userWon = margin > 0;
        var userRows = hud.boxScore.filter(function(b) {
            return b.teamSide === userSide;
        });
        var targetName = ((_payload_starPlayerTargetName = payload.starPlayerTargetName) != null ? _payload_starPlayerTargetName : '').toLowerCase();
        var starRow = targetName && userRows.find(function(r) {
            return r.name.toLowerCase().includes(targetName.split(' ')[0]);
        }) || userRows[0];
        var starPts = starRow ? starRow.pts : 0;
        var starAst = starRow ? starRow.ast : 0;
        // Training Camp drill live metric computation from user team box score
        var drillCount = 0;
        if (payload.trainingDrillId) {
            var sumFgm = userRows.reduce(function(s, r) {
                return s + r.fgm;
            }, 0);
            var sumTpm = userRows.reduce(function(s, r) {
                return s + r.tpm;
            }, 0);
            var sumAst = userRows.reduce(function(s, r) {
                return s + r.ast;
            }, 0);
            var sumDef = userRows.reduce(function(s, r) {
                return s + r.reb + r.stl + r.blk;
            }, 0);
            if (payload.trainingDrillId === 'DRILL_RHYTHM_SHOOTING') {
                drillCount = sumFgm + sumTpm;
            } else if (payload.trainingDrillId === 'DRILL_EURO_FINISHING') {
                drillCount = sumFgm;
            } else if (payload.trainingDrillId === 'DRILL_QUICK_PROTECT') {
                drillCount = sumFgm + sumAst;
            } else if (payload.trainingDrillId === 'DRILL_PNR_PLAYVISION') {
                drillCount = sumAst + Math.floor(sumFgm / 2);
            } else if (payload.trainingDrillId === 'DRILL_ALLEY_OOP') {
                drillCount = sumFgm + sumAst;
            } else {
                drillCount = sumDef;
            }
        }
        return {
            starPts: starPts,
            starAst: starAst,
            drillCount: drillCount,
            userWon: userWon,
            margin: margin
        };
    }, [
        payload,
        hud
    ]);
    // Reset settlement when a fresh match begins
    (0, _react.useEffect)(function() {
        if (hud.phase !== 'GAME_OVER') {
            settledRef.current = false;
            setSettled(null);
        }
    }, [
        hud.phase
    ]);
    // Settle rewards once upon reaching GAME_OVER
    (0, _react.useEffect)(function() {
        if (!payload || hud.phase !== 'GAME_OVER' || settledRef.current) return;
        settledRef.current = true;
        var res = _modesStore.ModesStore.settleCompletedModeMatch({
            userWon: liveProgress.userWon,
            margin: liveProgress.margin,
            starPts: liveProgress.starPts,
            starAst: liveProgress.starAst,
            drillMetricCount: liveProgress.drillCount
        });
        setSettled(res);
        if (res && onModeSettled) {
            onModeSettled(res.headline + " \xb7 " + res.details);
        }
    }, [
        payload,
        hud.phase,
        liveProgress,
        onModeSettled
    ]);
    if (!payload) return null;
    var activeDrill = payload.trainingDrillId ? _modesTypes.TRAINING_DRILLS.find(function(d) {
        return d.id === payload.trainingDrillId;
    }) : null;
    var handleManualFinishDrill = function handleManualFinishDrill() {
        if (settledRef.current) return;
        settledRef.current = true;
        var res = _modesStore.ModesStore.settleCompletedModeMatch({
            userWon: true,
            margin: Math.max(1, liveProgress.margin),
            starPts: liveProgress.starPts,
            starAst: liveProgress.starAst,
            drillMetricCount: liveProgress.drillCount
        });
        setSettled(res);
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
        children: [
            hud.phase !== 'GAME_OVER' && !settled && payload.objectiveBanner && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "h2k-live-obj-banner",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        style: {
                            minWidth: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                style: {
                                    color: '#fcd34d',
                                    marginRight: 8
                                },
                                children: payload.title
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "h2k-muted",
                                children: payload.objectiveBanner
                            }),
                            payload.targetStarPts && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-tabular",
                                style: {
                                    marginTop: 3,
                                    color: '#4ade80',
                                    fontWeight: 700
                                },
                                children: [
                                    payload.starPlayerTargetName,
                                    ": ",
                                    liveProgress.starPts,
                                    "/",
                                    payload.targetStarPts,
                                    " PTS",
                                    payload.targetStarAst ? " \xb7 " + liveProgress.starAst + "/" + payload.targetStarAst + " AST" : '',
                                    ' ',
                                    "\xb7 Margin ",
                                    liveProgress.margin >= 0 ? "+" + liveProgress.margin : liveProgress.margin
                                ]
                            }),
                            activeDrill && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-tabular",
                                style: {
                                    marginTop: 3,
                                    color: '#38bdf8',
                                    fontWeight: 700
                                },
                                children: [
                                    activeDrill.metricLabel,
                                    ": ",
                                    liveProgress.drillCount,
                                    " / ",
                                    activeDrill.goldTarget,
                                    " (Gold)"
                                ]
                            })
                        ]
                    }),
                    (payload.kind === 'TRAINING_DRILL' || payload.kind === 'TRAINING_FREESTYLE' || payload.kind === 'CITY_MYCOURT') && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        className: "h2k-mode-btn primary",
                        style: {
                            minHeight: 30,
                            padding: '0 10px'
                        },
                        onClick: handleManualFinishDrill,
                        children: "Finish & Claim"
                    })
                ]
            }),
            settled && !suppressPostMatchModal && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-live-reward-modal",
                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "h2k-live-reward-card",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            style: {
                                fontSize: 11,
                                fontWeight: 700,
                                color: '#fbbf24'
                            },
                            children: "POST-GAME REWARDS SETTLED"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                            style: {
                                margin: 0,
                                fontFamily: 'Oswald, sans-serif',
                                fontSize: 26
                            },
                            children: settled.headline
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "h2k-tabular",
                            style: {
                                fontSize: 14,
                                color: '#cbd5e1'
                            },
                            children: [
                                "Final Score: ",
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                    children: [
                                        hud.awayAbbr,
                                        " ",
                                        hud.awayScore
                                    ]
                                }),
                                " –",
                                ' ',
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                    children: [
                                        hud.homeAbbr,
                                        " ",
                                        hud.homeScore
                                    ]
                                })
                            ]
                        }),
                        settled.details && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            style: {
                                fontSize: 13,
                                color: '#4ade80',
                                fontWeight: 600
                            },
                            children: settled.details
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "h2k-grid-3 h2k-tabular",
                            style: {
                                padding: 12,
                                borderRadius: 10,
                                background: 'rgba(15, 23, 42, 0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                textAlign: 'center'
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-muted",
                                            children: "VC Earned"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                            style: {
                                                fontSize: 18,
                                                color: '#fbbf24'
                                            },
                                            children: [
                                                "+",
                                                settled.vcEarned.toLocaleString()
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-muted",
                                            children: "MTP Earned"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                            style: {
                                                fontSize: 18,
                                                color: '#38bdf8'
                                            },
                                            children: [
                                                "+",
                                                settled.mtpEarned.toLocaleString()
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-muted",
                                            children: "Rep / XP"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                            style: {
                                                fontSize: 18,
                                                color: '#4ade80'
                                            },
                                            children: [
                                                "+",
                                                settled.repEarned.toLocaleString()
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            style: {
                                display: 'flex',
                                gap: 10
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "h2k-mode-btn primary",
                                    style: {
                                        flex: 1
                                    },
                                    onClick: function onClick() {
                                        return onFinishAndReturn(payload.returnScreen);
                                    },
                                    children: "Continue & Return"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "h2k-mode-btn",
                                    onClick: onRematch,
                                    children: "Play Again"
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
