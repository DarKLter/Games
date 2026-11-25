(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/modes/MyNbaAssociation ===
ArcadeMod.define("src/games/hoops-2k26/modes/MyNbaAssociation", function(require, module, exports) {
// ============================================================================
// PART 6 — THE ASSOCIATION / MyNBA ERAS
// Features:
// - Choose Era (2014 LeBron Era or 2026 Modern Era) & pick Franchise
// - Interactive 16-Team NBA Playoff Bracket + Conference Standings
// - OVR-Weighted Simulate Game / Simulate Round engine + [PLAY GAME] 3D Launch
// - Trade Machine with live AI Trade Approval Meter (0-100%)
// - Era League Leaders Table
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MyNbaAssociation", {
    enumerable: true,
    get: function() {
        return MyNbaAssociation;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _rosterStore = require("../hybrid/rosterStore");
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
var MyNbaAssociation = function MyNbaAssociation(param) {
    var eraMode = param.eraMode, onBack = param.onBack, onNotify = param.onNotify;
    var _userTeam_roster_find, _ref, _ref1, _ref2;
    var modes = (0, _modesStore.useModesStore)();
    var rosterSnap = (0, _rosterStore.useRosterStore)();
    var nba = modes.myNba;
    var _useState = (0, _react.useState)('BRACKET'), tab = _useState[0], setTab = _useState[1];
    var _useState1 = (0, _react.useState)(''), partnerTeamId = _useState1[0], setPartnerTeamId = _useState1[1];
    var _useState2 = (0, _react.useState)(''), userTradePlayerId = _useState2[0], setUserTradePlayerId = _useState2[1];
    var _useState3 = (0, _react.useState)(''), partnerTradePlayerId = _useState3[0], setPartnerTradePlayerId = _useState3[1];
    var eraTeams = (0, _react.useMemo)(function() {
        var key = nba.era === 'ERA_2014' ? '2K14' : '2K26';
        return rosterSnap.teams.filter(function(t) {
            return t.era === key;
        });
    }, [
        nba.era,
        rosterSnap.teams
    ]);
    var userTeam = (0, _react.useMemo)(function() {
        return _rosterStore.RosterStore.getTeamById(nba.userTeamId);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        nba.userTeamId,
        rosterSnap.revision
    ]);
    var effectivePartnerTeam = (0, _react.useMemo)(function() {
        var _ref;
        var found = eraTeams.find(function(t) {
            return t.id === partnerTeamId && t.id !== userTeam.id;
        });
        return (_ref = found != null ? found : eraTeams.find(function(t) {
            return t.id !== userTeam.id;
        })) != null ? _ref : eraTeams[0];
    }, [
        eraTeams,
        partnerTeamId,
        userTeam.id
    ]);
    var selectedOutPlayer = (_userTeam_roster_find = userTeam.roster.find(function(p) {
        return p.id === userTradePlayerId;
    })) != null ? _userTeam_roster_find : userTeam.roster[0];
    var selectedInPlayer = (_ref = effectivePartnerTeam == null ? void 0 : effectivePartnerTeam.roster.find(function(p) {
        return p.id === partnerTradePlayerId;
    })) != null ? _ref : effectivePartnerTeam == null ? void 0 : effectivePartnerTeam.roster[0];
    var tradePreview = (0, _react.useMemo)(function() {
        if (!selectedOutPlayer || !selectedInPlayer) return null;
        return (0, _modesStore.evaluateAiTradeApproval)(selectedOutPlayer, selectedInPlayer);
    }, [
        selectedOutPlayer,
        selectedInPlayer
    ]);
    var leagueLeaders = (0, _react.useMemo)(function() {
        var rows = eraTeams.flatMap(function(t) {
            return t.roster.slice(0, 3).map(function(p) {
                return {
                    id: p.id,
                    name: p.name,
                    teamAbbr: t.abbr,
                    pos: p.position,
                    ovr: p.ovr,
                    ppg: Number((12 + (p.ovr - 74) * 0.88 + p.attributes.threePt * 0.04).toFixed(1)),
                    rpg: Number((3.2 + (p.attributes.defReb + p.attributes.offReb) * 0.055).toFixed(1)),
                    apg: Number((2.1 + p.attributes.passAccuracy * 0.088).toFixed(1))
                };
            });
        });
        return rows.sort(function(a, b) {
            return b.ppg - a.ppg;
        }).slice(0, 12);
    }, [
        eraTeams
    ]);
    var switchEra = function switchEra(nextEra) {
        _audioEngine.HybridAudioEngine.playUi('switch', eraMode);
        _modesStore.ModesStore.startNewMyNbaEra(nextEra);
        onNotify("Switched MyNBA to " + (nextEra === 'ERA_2014' ? '2014 LeBron Era' : '2026 Modern Era') + "!");
    };
    var launchPlayoffGame = function launchPlayoffGame(series) {
        var hi = _rosterStore.RosterStore.getTeamById(series.highSeedTeamId);
        var lo = _rosterStore.RosterStore.getTeamById(series.lowSeedTeamId);
        var userIsLow = series.lowSeedTeamId === nba.userTeamId;
        _audioEngine.HybridAudioEngine.playUi('confirm', eraMode);
        _modesStore.ModesStore.launchModeMatch({
            kind: 'MYNBA_GAME',
            title: "MyNBA Playoffs \xb7 " + hi.abbr + " vs " + lo.abbr,
            subtitle: "Series " + series.highWins + "-" + series.lowWins + " \xb7 Round " + series.round,
            returnScreen: 'MYNBA_HUB',
            matchPatch: {
                homeTeamId: hi.id,
                awayTeamId: lo.id,
                venue: nba.era === 'ERA_2014' ? 'ARENA_2K14' : 'ARENA_2K26',
                quarterLengthMin: 5,
                difficulty: 'All-Star',
                sideControl: userIsLow ? 'AWAY' : 'HOME',
                playersPerSide: 5,
                targetScore: null,
                modeLabel: "MyNBA Playoffs R" + series.round
            },
            myNbaSeriesId: series.id,
            objectiveBanner: "Playoff Round " + series.round + " \xb7 " + hi.abbr + " (" + series.highWins + ") vs " + lo.abbr + " (" + series.lowWins + ") \xb7 Win to advance!",
            baseVcReward: 1200,
            baseRepReward: 380
        });
    };
    var eastStandings = nba.standings.filter(function(s) {
        return s.conference === 'EAST';
    }).sort(function(a, b) {
        return b.wins - a.wins;
    });
    var westStandings = nba.standings.filter(function(s) {
        return s.conference === 'WEST';
    }).sort(function(a, b) {
        return b.wins - a.wins;
    });
    var championTeam = nba.championTeamId ? _rosterStore.RosterStore.getTeamById(nba.championTeamId) : null;
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
                                        children: "THE ASSOCIATION / MyNBA ERAS"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-mode-submeta",
                                        children: [
                                            nba.seasonYearLabel,
                                            " \xb7 Franchise: ",
                                            userTeam.city,
                                            " ",
                                            userTeam.name,
                                            " (",
                                            userTeam.ovr,
                                            " OVR)"
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "h2k-mode-top-right",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-mode-btn " + (nba.era === 'ERA_2014' ? 'crimson' : ''),
                                onClick: function onClick() {
                                    return switchEra('ERA_2014');
                                },
                                children: "2014 LeBron Era"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-mode-btn " + (nba.era === 'ERA_2026' ? 'primary' : ''),
                                onClick: function onClick() {
                                    return switchEra('ERA_2026');
                                },
                                children: "2026 Modern Era"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                className: "h2k-select",
                                value: nba.userTeamId,
                                onChange: function onChange(e) {
                                    return _modesStore.ModesStore.setMyNbaUserTeam(e.target.value);
                                },
                                style: {
                                    minHeight: 38
                                },
                                children: eraTeams.map(function(t) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                        value: t.id,
                                        children: [
                                            t.abbr,
                                            " \xb7 ",
                                            t.city,
                                            " ",
                                            t.name,
                                            " (",
                                            t.ovr,
                                            ")"
                                        ]
                                    }, t.id);
                                })
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-mode-tabs",
                children: [
                    {
                        id: 'BRACKET',
                        label: '16-Team Playoff Bracket'
                    },
                    {
                        id: 'STANDINGS',
                        label: 'Conference Standings'
                    },
                    {
                        id: 'TRADE_MACHINE',
                        label: 'Trade Machine (AI GM)'
                    },
                    {
                        id: 'LEADERS',
                        label: 'League Leaders'
                    }
                ].map(function(t) {
                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        className: "h2k-mode-tab " + (tab === t.id ? 'active' : ''),
                        onClick: function onClick() {
                            return setTab(t.id);
                        },
                        children: t.label
                    }, t.id);
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "h2k-mode-scroll",
                children: [
                    tab === 'BRACKET' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-card",
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 10
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                style: {
                                                    margin: 0,
                                                    fontFamily: 'Oswald, sans-serif',
                                                    fontSize: 18
                                                },
                                                children: championTeam ? "\uD83C\uDFC6 NBA CHAMPION: " + championTeam.city.toUpperCase() + " " + championTeam.name.toUpperCase() + "!" : "Interactive 16-Team Playoff Bracket \xb7 " + nba.seasonYearLabel
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "h2k-muted",
                                                children: "Simulate individual games, sim entire rounds with our OVR-weighted engine, or click [PLAY GAME] to tip off in 3D!"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        style: {
                                            display: 'flex',
                                            gap: 8
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-mode-btn cyan",
                                                disabled: Boolean(championTeam),
                                                onClick: function onClick() {
                                                    var res = _modesStore.ModesStore.simulateMyNbaCurrentRound();
                                                    if (res.ok) onNotify("Simulated " + res.gamesSimulated + " playoff games and advanced the bracket!");
                                                },
                                                children: "⚡ Sim Current Round"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-mode-btn",
                                                onClick: function onClick() {
                                                    _modesStore.ModesStore.startNewMyNbaEra(nba.era, nba.userTeamId);
                                                    onNotify('Reset Playoff Bracket for a fresh postseason!');
                                                },
                                                children: "New Postseason"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            [
                                1,
                                2,
                                3,
                                4
                            ].map(function(roundNum) {
                                var roundSeries = nba.playoffBracket.filter(function(s) {
                                    return s.round === roundNum;
                                });
                                if (roundSeries.length === 0) return null;
                                var roundTitle = roundNum === 1 ? 'First Round (16 Teams)' : roundNum === 2 ? 'Conference Semifinals' : roundNum === 3 ? 'Conference Finals' : '🏆 NBA FINALS';
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h4", {
                                            style: {
                                                margin: '0 0 10px',
                                                fontFamily: 'Oswald, sans-serif',
                                                color: '#fcd34d',
                                                letterSpacing: '0.04em'
                                            },
                                            children: roundTitle
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-grid-4",
                                            children: roundSeries.map(function(s) {
                                                var hi = _rosterStore.RosterStore.getTeamById(s.highSeedTeamId);
                                                var lo = _rosterStore.RosterStore.getTeamById(s.lowSeedTeamId);
                                                var involvesUser = hi.id === nba.userTeamId || lo.id === nba.userTeamId;
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-card",
                                                    style: {
                                                        borderColor: involvesUser ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 8
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            style: {
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                color: '#94a3b8'
                                                            },
                                                            children: [
                                                                s.conference,
                                                                " \xb7 ",
                                                                s.winnerTeamId ? 'FINAL' : 'BEST OF 7'
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "h2k-tabular",
                                                            style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                fontWeight: 700
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    style: {
                                                                        color: s.winnerTeamId === hi.id ? '#4ade80' : '#f8fafc'
                                                                    },
                                                                    children: [
                                                                        hi.abbr,
                                                                        " (",
                                                                        hi.ovr,
                                                                        ")"
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    children: s.highWins
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "h2k-tabular",
                                                            style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                fontWeight: 700
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    style: {
                                                                        color: s.winnerTeamId === lo.id ? '#4ade80' : '#f8fafc'
                                                                    },
                                                                    children: [
                                                                        lo.abbr,
                                                                        " (",
                                                                        lo.ovr,
                                                                        ")"
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    children: s.lowWins
                                                                })
                                                            ]
                                                        }),
                                                        !s.winnerTeamId && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            style: {
                                                                display: 'flex',
                                                                gap: 6,
                                                                marginTop: 4
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                    type: "button",
                                                                    className: "h2k-mode-btn primary",
                                                                    style: {
                                                                        flex: 1,
                                                                        minHeight: 32,
                                                                        padding: '0 8px'
                                                                    },
                                                                    onClick: function onClick() {
                                                                        return launchPlayoffGame(s);
                                                                    },
                                                                    children: "PLAY GAME"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                    type: "button",
                                                                    className: "h2k-mode-btn",
                                                                    style: {
                                                                        minHeight: 32,
                                                                        padding: '0 10px'
                                                                    },
                                                                    onClick: function onClick() {
                                                                        var res = _modesStore.ModesStore.simulateMyNbaSeriesGame(s.id);
                                                                        onNotify(res.summary);
                                                                    },
                                                                    children: "Sim 1"
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }, s.id);
                                            })
                                        })
                                    ]
                                }, roundNum);
                            })
                        ]
                    }),
                    tab === 'STANDINGS' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "h2k-grid-2",
                        children: [
                            {
                                title: 'Eastern Conference',
                                rows: eastStandings
                            },
                            {
                                title: 'Western Conference',
                                rows: westStandings
                            }
                        ].map(function(conf) {
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-card",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h2k-section-head",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                            children: conf.title
                                        })
                                    }),
                                    conf.rows.map(function(r, idx) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-tabular",
                                            style: {
                                                display: 'grid',
                                                gridTemplateColumns: '28px 1fr 54px 54px 54px',
                                                padding: '7px 6px',
                                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                                fontSize: 12,
                                                background: r.teamId === nba.userTeamId ? 'rgba(245,158,11,0.14)' : undefined
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    className: "h2k-muted",
                                                    children: [
                                                        "#",
                                                        idx + 1
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                    children: r.name
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    children: [
                                                        r.wins,
                                                        "-",
                                                        r.losses
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    children: [
                                                        r.ovr,
                                                        " OVR"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    className: "h2k-muted",
                                                    children: [
                                                        r.ppg,
                                                        " PPG"
                                                    ]
                                                })
                                            ]
                                        }, r.teamId);
                                    })
                                ]
                            }, conf.title);
                        })
                    }),
                    tab === 'TRADE_MACHINE' && effectivePartnerTeam && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-grid-2",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-card",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "h2k-section-head",
                                                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                                    children: [
                                                        "Send From ",
                                                        userTeam.city,
                                                        " ",
                                                        userTeam.name
                                                    ]
                                                })
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                className: "h2k-select",
                                                style: {
                                                    width: '100%'
                                                },
                                                value: (_ref1 = selectedOutPlayer == null ? void 0 : selectedOutPlayer.id) != null ? _ref1 : '',
                                                onChange: function onChange(e) {
                                                    return setUserTradePlayerId(e.target.value);
                                                },
                                                children: userTeam.roster.map(function(p) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                        value: p.id,
                                                        children: [
                                                            p.name,
                                                            " \xb7 ",
                                                            p.position,
                                                            " \xb7 ",
                                                            p.ovr,
                                                            " OVR (",
                                                            p.archetype,
                                                            ")"
                                                        ]
                                                    }, p.id);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-card",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-section-head",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                        children: "Receive From Partner"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                        className: "h2k-select",
                                                        value: effectivePartnerTeam.id,
                                                        onChange: function onChange(e) {
                                                            setPartnerTeamId(e.target.value);
                                                            setPartnerTradePlayerId('');
                                                        },
                                                        children: eraTeams.filter(function(t) {
                                                            return t.id !== userTeam.id;
                                                        }).map(function(t) {
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
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                className: "h2k-select",
                                                style: {
                                                    width: '100%'
                                                },
                                                value: (_ref2 = selectedInPlayer == null ? void 0 : selectedInPlayer.id) != null ? _ref2 : '',
                                                onChange: function onChange(e) {
                                                    return setPartnerTradePlayerId(e.target.value);
                                                },
                                                children: effectivePartnerTeam.roster.map(function(p) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                        value: p.id,
                                                        children: [
                                                            p.name,
                                                            " \xb7 ",
                                                            p.position,
                                                            " \xb7 ",
                                                            p.ovr,
                                                            " OVR (",
                                                            p.archetype,
                                                            ")"
                                                        ]
                                                    }, p.id);
                                                })
                                            })
                                        ]
                                    })
                                ]
                            }),
                            tradePreview && selectedOutPlayer && selectedInPlayer && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-card",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-section-head",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                children: "AI GM Trade Approval Meter"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                className: "h2k-tabular",
                                                style: {
                                                    fontSize: 18,
                                                    color: tradePreview.accepted ? '#4ade80' : '#f87171'
                                                },
                                                children: [
                                                    tradePreview.approvalPct,
                                                    "% \xb7 ",
                                                    tradePreview.accepted ? 'LIKELY ACCEPTED' : 'REJECTED'
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h2k-bar-track",
                                        style: {
                                            marginBottom: 10
                                        },
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-bar-fill",
                                            style: {
                                                width: "" + tradePreview.approvalPct + "%",
                                                background: tradePreview.accepted ? '#22c55e' : '#ef4444'
                                            }
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                        className: "h2k-muted",
                                        style: {
                                            margin: '0 0 12px'
                                        },
                                        children: tradePreview.reason
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "h2k-mode-btn " + (tradePreview.accepted ? 'emerald' : ''),
                                        onClick: function onClick() {
                                            var res = _modesStore.ModesStore.executeMyNbaTrade(userTeam.id, effectivePartnerTeam.id, selectedOutPlayer.id, selectedInPlayer.id);
                                            onNotify(res.message);
                                        },
                                        children: "Propose Official Trade"
                                    })
                                ]
                            }),
                            nba.tradeHistory.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-card",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h2k-section-head",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                            children: "Completed League Trades"
                                        })
                                    }),
                                    nba.tradeHistory.map(function(tr) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-muted",
                                            style: {
                                                padding: '6px 0',
                                                borderBottom: '1px solid rgba(255,255,255,0.06)'
                                            },
                                            children: [
                                                tr.summary,
                                                " (",
                                                tr.approvalScore,
                                                "% GM approval)"
                                            ]
                                        }, tr.id);
                                    })
                                ]
                            })
                        ]
                    }),
                    tab === 'LEADERS' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "h2k-card",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "h2k-section-head",
                                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                    children: [
                                        nba.seasonYearLabel,
                                        " \xb7 League Scoring Leaders"
                                    ]
                                })
                            }),
                            leagueLeaders.map(function(row, idx) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-tabular",
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: '34px 1fr 64px 56px 68px 68px 68px',
                                        padding: '8px 6px',
                                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                                        fontSize: 12
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            className: "h2k-muted",
                                            children: [
                                                "#",
                                                idx + 1
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: row.name
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            children: [
                                                row.teamAbbr,
                                                " \xb7 ",
                                                row.pos
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            style: {
                                                color: '#fbbf24'
                                            },
                                            children: row.ovr
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                            children: [
                                                row.ppg,
                                                " PPG"
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            children: [
                                                row.rpg,
                                                " RPG"
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            children: [
                                                row.apg,
                                                " APG"
                                            ]
                                        })
                                    ]
                                }, row.id);
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
