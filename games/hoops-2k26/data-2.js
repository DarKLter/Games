(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/hybrid/RosterManager ===
ArcadeMod.define("src/games/hoops-2k26/hybrid/RosterManager", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RosterManager", {
    enumerable: true,
    get: function() {
        return RosterManager;
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
var ERA_FILTERS = [
    {
        id: 'ALL',
        label: 'ALL 72'
    },
    {
        id: '2K14',
        label: "2K14 '13-14 (30)"
    },
    {
        id: '2K26',
        label: "2K26 '25-26 (30)"
    },
    {
        id: 'LEGENDS',
        label: 'LEGENDS (4)'
    },
    {
        id: 'EUROLEAGUE',
        label: 'EURO (4)'
    },
    {
        id: 'WNBA',
        label: 'THE W (4)'
    },
    {
        id: 'FREE_AGENTS',
        label: 'FREE AGENTS'
    }
];
var POSITIONS = [
    'PG',
    'SG',
    'SF',
    'PF',
    'C'
];
var HAIR_OPTIONS = [
    'FADE',
    'BUZZ',
    'SHORT',
    'BRAIDS',
    'DREADS',
    'AFRO',
    'PONYTAIL',
    'BALD'
];
var SKIN_SWATCHES = [
    '#f2cbb6',
    '#dfa883',
    '#c68657',
    '#9c623d',
    '#734529',
    '#522f1c'
];
var BADGE_CATS = [
    'SHOOTING',
    'PLAYMAKING',
    'FINISHING',
    'DEFENSE'
];
function cycleBadgeTier(cur) {
    if (!cur) return 'BRONZE';
    var idx = _rosterTypes.BADGE_TIERS.indexOf(cur);
    if (idx === -1 || idx === _rosterTypes.BADGE_TIERS.length - 1) return undefined;
    return _rosterTypes.BADGE_TIERS[idx + 1];
}
var RosterManager = function RosterManager(param) {
    var eraMode = param.eraMode, initialTeamId = param.initialTeamId, onBack = param.onBack, onOpenCreateAPlayer = param.onOpenCreateAPlayer, onLaunchPlayNowWithTeam = param.onLaunchPlayNowWithTeam, onNotify = param.onNotify;
    var _ref, _ref1;
    var _snap_teams_, _partnerTeam_roster_find, _partnerTeam_roster_, _activeTeam_roster_swapSlotIndex;
    var snap = (0, _rosterStore.useRosterStore)();
    var _useState = (0, _react.useState)('ALL'), eraFilter = _useState[0], setEraFilter = _useState[1];
    var _useState1 = (0, _react.useState)(''), search = _useState1[0], setSearch = _useState1[1];
    var _useState2 = (0, _react.useState)(initialTeamId || ((_snap_teams_ = snap.teams[0]) == null ? void 0 : _snap_teams_.id) || '2k14_mia'), selectedTeamId = _useState2[0], setSelectedTeamId = _useState2[1];
    var _useState3 = (0, _react.useState)(''), selectedPlayerId = _useState3[0], setSelectedPlayerId = _useState3[1];
    var _useState4 = (0, _react.useState)('ATTRIBUTES'), inspectorTab = _useState4[0], setInspectorTab = _useState4[1];
    var _useState5 = (0, _react.useState)('SHOOTING'), badgeCat = _useState5[0], setBadgeCat = _useState5[1];
    var _useState6 = (0, _react.useState)(null), swapSlotIndex = _useState6[0], setSwapSlotIndex = _useState6[1];
    var _useState7 = (0, _react.useState)(false), tradeOpen = _useState7[0], setTradeOpen = _useState7[1];
    var _useState8 = (0, _react.useState)('2k26_okc'), tradePartnerTeamId = _useState8[0], setTradePartnerTeamId = _useState8[1];
    var _useState9 = (0, _react.useState)(''), tradePartnerPlayerId = _useState9[0], setTradePartnerPlayerId = _useState9[1];
    var _useState10 = (0, _react.useState)('2k26_okc'), signTargetTeamId = _useState10[0], setSignTargetTeamId = _useState10[1];
    var filteredTeams = (0, _react.useMemo)(function() {
        var q = search.trim().toLowerCase();
        return snap.teams.filter(function(t) {
            if (eraFilter !== 'ALL' && eraFilter !== 'FREE_AGENTS' && t.era !== eraFilter) {
                return false;
            }
            if (!q) return true;
            return t.city.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.abbr.toLowerCase().includes(q) || t.roster.some(function(p) {
                return p.name.toLowerCase().includes(q);
            });
        });
    }, [
        snap.teams,
        eraFilter,
        search
    ]);
    var activeTeam = (0, _react.useMemo)(function() {
        var _snap_teams_find;
        return (_snap_teams_find = snap.teams.find(function(t) {
            return t.id === selectedTeamId;
        })) != null ? _snap_teams_find : snap.teams[0];
    }, [
        snap.teams,
        selectedTeamId
    ]);
    var activePlayer = (0, _react.useMemo)(function() {
        var _ref, _activeTeam_roster_find;
        if (eraFilter === 'FREE_AGENTS') {
            var _ref1, _snap_freeAgents_find;
            return (_ref1 = (_snap_freeAgents_find = snap.freeAgents.find(function(p) {
                return p.id === selectedPlayerId;
            })) != null ? _snap_freeAgents_find : snap.freeAgents[0]) != null ? _ref1 : null;
        }
        return (_ref = (_activeTeam_roster_find = activeTeam.roster.find(function(p) {
            return p.id === selectedPlayerId;
        })) != null ? _activeTeam_roster_find : activeTeam.roster[0]) != null ? _ref : null;
    }, [
        eraFilter,
        snap.freeAgents,
        activeTeam,
        selectedPlayerId
    ]);
    var partnerTeam = (0, _react.useMemo)(function() {
        var _ref, _snap_teams_find;
        var pick = (_ref = (_snap_teams_find = snap.teams.find(function(t) {
            return t.id === tradePartnerTeamId && t.id !== activeTeam.id;
        })) != null ? _snap_teams_find : snap.teams.find(function(t) {
            return t.id !== activeTeam.id;
        })) != null ? _ref : snap.teams[0];
        return pick;
    }, [
        snap.teams,
        tradePartnerTeamId,
        activeTeam.id
    ]);
    var resolvedPartnerPlayerId = (_ref = (_ref1 = (_partnerTeam_roster_find = partnerTeam.roster.find(function(p) {
        return p.id === tradePartnerPlayerId;
    })) == null ? void 0 : _partnerTeam_roster_find.id) != null ? _ref1 : (_partnerTeam_roster_ = partnerTeam.roster[0]) == null ? void 0 : _partnerTeam_roster_.id) != null ? _ref : '';
    var commitPlayerPatch = function commitPlayerPatch(patch, recomputeOvr) {
        if (recomputeOvr === void 0) recomputeOvr = true;
        if (!activePlayer) return;
        _rosterStore.RosterStore.updatePlayer(_extends({}, activePlayer, patch), recomputeOvr);
    };
    var handleAttrChange = function handleAttrChange(key, val) {
        if (!activePlayer) return;
        var _obj;
        var nextAttrs = _extends({}, activePlayer.attributes, (_obj = {}, _obj[key] = val, _obj));
        var nextOvr = (0, _rosterTypes.computePlayerOvr)(nextAttrs, activePlayer.position);
        _rosterStore.RosterStore.updatePlayer(_extends({}, activePlayer, {
            attributes: nextAttrs,
            ovr: nextOvr,
            archetype: (0, _rosterTypes.deriveArchetype)(nextAttrs, activePlayer.position)
        }), false);
    };
    var handleHotZoneToggle = function handleHotZoneToggle(zoneKey, nextVal) {
        if (!activePlayer) return;
        _audioEngine.HybridAudioEngine.playUi('click', eraMode);
        var _obj;
        commitPlayerPatch({
            hotZones: _extends({}, activePlayer.hotZones, (_obj = {}, _obj[zoneKey] = nextVal, _obj))
        }, false);
    };
    var handleBadgeCycle = function handleBadgeCycle(badgeId) {
        if (!activePlayer) return;
        _audioEngine.HybridAudioEngine.playUi('click', eraMode);
        var nextBadges = _extends({}, activePlayer.badges);
        var nextTier = cycleBadgeTier(nextBadges[badgeId]);
        if (nextTier) nextBadges[badgeId] = nextTier;
        else delete nextBadges[badgeId];
        commitPlayerPatch({
            badges: nextBadges
        }, false);
    };
    var totalPlayersCount = (0, _react.useMemo)(function() {
        return snap.teams.reduce(function(sum, t) {
            return sum + t.roster.length;
        }, 0) + snap.freeAgents.length;
    }, [
        snap.teams,
        snap.freeAgents
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h2k-roster-screen",
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
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-kicker",
                                        children: [
                                            "PART 2 DUAL-ERA DATABASE \xb7 ",
                                            snap.teams.length,
                                            " TEAMS \xb7 ",
                                            totalPlayersCount,
                                            " PLAYERS"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                        children: "MANAGE ROSTER & TRADE MACHINE"
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
                                className: "h2k-btn-accent",
                                onClick: function onClick() {
                                    _audioEngine.HybridAudioEngine.playUi('confirm', eraMode);
                                    onOpenCreateAPlayer(activeTeam.id);
                                },
                                children: "+ CREATE-A-PLAYER"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                type: "button",
                                className: "h2k-btn-ghost",
                                onClick: function onClick() {
                                    _audioEngine.HybridAudioEngine.playUi('confirm', eraMode);
                                    onLaunchPlayNowWithTeam(activeTeam.id);
                                },
                                children: [
                                    "\uD83C\uDFC0 PLAY WITH ",
                                    activeTeam.abbr
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-btn-danger",
                                disabled: !snap.isCustomized,
                                onClick: function onClick() {
                                    _audioEngine.HybridAudioEngine.playUi('back', eraMode);
                                    _rosterStore.RosterStore.resetDefaultRosters();
                                    setSwapSlotIndex(null);
                                    onNotify('All 72 teams restored to authentic default rosters!');
                                },
                                children: "RESET DEFAULT ROSTERS"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "h2k-roster-filter-bar",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "h2k-pool-tabs",
                        children: ERA_FILTERS.map(function(f) {
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                type: "button",
                                className: "h2k-pool-pill " + (eraFilter === f.id ? 'active' : ''),
                                onClick: function onClick() {
                                    _audioEngine.HybridAudioEngine.playUi('click', eraMode);
                                    setEraFilter(f.id);
                                    setSwapSlotIndex(null);
                                },
                                children: [
                                    f.label,
                                    f.id === 'FREE_AGENTS' ? " (" + snap.freeAgents.length + ")" : ''
                                ]
                            }, f.id);
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                        type: "search",
                        className: "h2k-input h2k-roster-search",
                        placeholder: "Search team or player (e.g. LeBron, Jokic, Curry, Caitlin)...",
                        value: search,
                        onChange: function onChange(e) {
                            return setSearch(e.target.value);
                        },
                        "aria-label": "Search teams or players"
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "h2k-roster-workspace",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("aside", {
                        className: "h2k-roster-col h2k-team-list-col",
                        "aria-label": "72 Teams Directory",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-col-head",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            "TEAMS (",
                                            filteredTeams.length,
                                            ")"
                                        ]
                                    }),
                                    snap.isCustomized && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "h2k-custom-dot",
                                        children: "CUSTOM SAVED"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "h2k-team-list-scroll",
                                children: filteredTeams.map(function(team) {
                                    var isSelected = eraFilter !== 'FREE_AGENTS' && team.id === activeTeam.id;
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "h2k-team-row-btn " + (isSelected ? 'active' : ''),
                                        style: {
                                            borderLeftColor: isSelected ? team.colors.accent : team.colors.primary
                                        },
                                        onClick: function onClick() {
                                            var _ref;
                                            var _team_roster_;
                                            _audioEngine.HybridAudioEngine.playUi('click', eraMode);
                                            if (eraFilter === 'FREE_AGENTS') setEraFilter('ALL');
                                            setSelectedTeamId(team.id);
                                            setSelectedPlayerId((_ref = (_team_roster_ = team.roster[0]) == null ? void 0 : _team_roster_.id) != null ? _ref : '');
                                            setSwapSlotIndex(null);
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_TeamLogo.TeamLogoFromData, {
                                                team: team,
                                                size: 36
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-team-row-meta",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                        children: [
                                                            team.city,
                                                            " ",
                                                            team.name
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        children: [
                                                            team.era,
                                                            " \xb7 OFF ",
                                                            team.offRating,
                                                            " / DEF ",
                                                            team.defRating
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "h2k-team-row-ovr",
                                                children: team.ovr
                                            })
                                        ]
                                    }, team.id);
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("section", {
                        className: "h2k-roster-col h2k-lineup-col",
                        children: eraFilter === 'FREE_AGENTS' ? /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-team-banner",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h2k-kicker",
                                                    children: "UNASSIGNED & CREATED PROSPECTS"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                                    children: [
                                                        "FREE AGENTS POOL (",
                                                        snap.freeAgents.length,
                                                        ")"
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                            className: "h2k-select",
                                            value: signTargetTeamId,
                                            onChange: function onChange(e) {
                                                return setSignTargetTeamId(e.target.value);
                                            },
                                            "aria-label": "Team to sign free agent",
                                            children: snap.teams.map(function(t) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                    value: t.id,
                                                    children: [
                                                        "Sign to: ",
                                                        t.city,
                                                        " ",
                                                        t.name,
                                                        " (",
                                                        t.era,
                                                        ")"
                                                    ]
                                                }, t.id);
                                            })
                                        })
                                    ]
                                }),
                                snap.freeAgents.length === 0 ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-empty-box",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                            children: "No free agents right now. Create a player or release a bench player to add them here."
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            className: "h2k-btn-accent",
                                            onClick: function onClick() {
                                                return onOpenCreateAPlayer('FREE_AGENTS');
                                            },
                                            children: "+ CREATE FREE AGENT PROSPECT"
                                        })
                                    ]
                                }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "h2k-lineup-scroll",
                                    children: snap.freeAgents.map(function(p) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-player-row " + ((activePlayer == null ? void 0 : activePlayer.id) === p.id ? 'active' : ''),
                                            onClick: function onClick() {
                                                return setSelectedPlayerId(p.id);
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "h2k-pos-pill",
                                                    children: p.position
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-player-row-info",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                            children: [
                                                                "#",
                                                                p.jerseyNumber,
                                                                " ",
                                                                p.name
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            children: [
                                                                (0, _rosterTypes.formatHeightFeetInches)(p.heightInches),
                                                                " \xb7 ",
                                                                p.archetype
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                    className: "h2k-player-ovr",
                                                    children: p.ovr
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "h2k-mini-pill accent",
                                                    onClick: function onClick(e) {
                                                        e.stopPropagation();
                                                        var res = _rosterStore.RosterStore.signFreeAgent(p.id, signTargetTeamId);
                                                        onNotify(res.message);
                                                    },
                                                    children: "SIGN"
                                                })
                                            ]
                                        }, p.id);
                                    })
                                })
                            ]
                        }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-team-banner",
                                    style: {
                                        borderBottomColor: activeTeam.colors.accent
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-team-banner-left",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)(_TeamLogo.TeamLogoFromData, {
                                                    team: activeTeam,
                                                    size: 56
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "h2k-kicker",
                                                            children: [
                                                                activeTeam.era,
                                                                " \xb7 ",
                                                                activeTeam.arena
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                                            children: [
                                                                activeTeam.city,
                                                                " ",
                                                                activeTeam.name
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "h2k-banner-ratings",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    children: [
                                                                        "OVR ",
                                                                        activeTeam.ovr
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    children: [
                                                                        "OFF ",
                                                                        activeTeam.offRating
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    children: [
                                                                        "DEF ",
                                                                        activeTeam.defRating
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-team-banner-actions",
                                            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                type: "button",
                                                className: "h2k-mini-pill " + (tradeOpen ? 'accent' : ''),
                                                onClick: function onClick() {
                                                    _audioEngine.HybridAudioEngine.playUi('switch', eraMode);
                                                    setTradeOpen(function(v) {
                                                        return !v;
                                                    });
                                                },
                                                children: [
                                                    "⇄ ",
                                                    tradeOpen ? 'CLOSE TRADE' : 'TRADE MACHINE'
                                                ]
                                            })
                                        })
                                    ]
                                }),
                                tradeOpen && activePlayer && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-trade-panel",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-kicker",
                                            children: [
                                                "TRADE ",
                                                activePlayer.name.toUpperCase(),
                                                " (",
                                                activeTeam.abbr,
                                                ") TO ANY OF 71 TEAMS"
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-trade-controls",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                    className: "h2k-select",
                                                    value: partnerTeam.id,
                                                    onChange: function onChange(e) {
                                                        setTradePartnerTeamId(e.target.value);
                                                        setTradePartnerPlayerId('');
                                                    },
                                                    "aria-label": "Trade partner team",
                                                    children: snap.teams.filter(function(t) {
                                                        return t.id !== activeTeam.id;
                                                    }).map(function(t) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                            value: t.id,
                                                            children: [
                                                                t.city,
                                                                " ",
                                                                t.name,
                                                                " (",
                                                                t.era,
                                                                " \xb7 ",
                                                                t.ovr,
                                                                ")"
                                                            ]
                                                        }, t.id);
                                                    })
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                    className: "h2k-select",
                                                    value: resolvedPartnerPlayerId,
                                                    onChange: function onChange(e) {
                                                        return setTradePartnerPlayerId(e.target.value);
                                                    },
                                                    "aria-label": "Trade partner player",
                                                    children: partnerTeam.roster.map(function(p) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                            value: p.id,
                                                            children: [
                                                                p.position,
                                                                " #",
                                                                p.jerseyNumber,
                                                                " ",
                                                                p.name,
                                                                " (",
                                                                p.ovr,
                                                                " OVR)"
                                                            ]
                                                        }, p.id);
                                                    })
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    className: "h2k-btn-accent",
                                                    onClick: function onClick() {
                                                        var res = _rosterStore.RosterStore.tradePlayers(activeTeam.id, activePlayer.id, partnerTeam.id, resolvedPartnerPlayerId);
                                                        if (res.ok) {
                                                            _audioEngine.HybridAudioEngine.playGreenRelease();
                                                            setSelectedPlayerId(resolvedPartnerPlayerId);
                                                            setTradeOpen(false);
                                                        }
                                                        onNotify(res.message);
                                                    },
                                                    children: "EXECUTE TRADE"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                swapSlotIndex !== null && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-swap-banner",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            children: [
                                                "Select another player to swap lineup slot with",
                                                ' ',
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                    children: (_activeTeam_roster_swapSlotIndex = activeTeam.roster[swapSlotIndex]) == null ? void 0 : _activeTeam_roster_swapSlotIndex.name
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            className: "h2k-mini-pill",
                                            onClick: function onClick() {
                                                return setSwapSlotIndex(null);
                                            },
                                            children: "CANCEL"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-lineup-scroll",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-section-divider",
                                            children: "STARTING 5 (LIVE IN 3D TIP-OFF)"
                                        }),
                                        activeTeam.roster.map(function(player, idx) {
                                            var isBenchStart = idx === 5;
                                            var isSelected = (activePlayer == null ? void 0 : activePlayer.id) === player.id;
                                            var isSwapSource = swapSlotIndex === idx;
                                            var badgeCount = Object.keys(player.badges).length;
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_react.default.Fragment, {
                                                children: [
                                                    isBenchStart && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "h2k-section-divider",
                                                        children: "BENCH ROTATION"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "h2k-player-row " + (isSelected ? 'active' : '') + " " + (isSwapSource ? 'is-swapping' : ''),
                                                        onClick: function onClick() {
                                                            _audioEngine.HybridAudioEngine.playUi('click', eraMode);
                                                            if (swapSlotIndex !== null && swapSlotIndex !== idx) {
                                                                _rosterStore.RosterStore.swapStarterBench(activeTeam.id, swapSlotIndex, idx);
                                                                setSwapSlotIndex(null);
                                                                onNotify('Lineup rotation updated & saved!');
                                                                return;
                                                            }
                                                            setSelectedPlayerId(player.id);
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "h2k-pos-pill " + (idx < 5 ? 'starter' : 'bench'),
                                                                children: idx < 5 ? POSITIONS[idx] : player.position
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "h2k-player-row-info",
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                                        children: [
                                                                            "#",
                                                                            player.jerseyNumber,
                                                                            " ",
                                                                            player.name,
                                                                            player.isCreated ? ' ★' : ''
                                                                        ]
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                        children: [
                                                                            (0, _rosterTypes.formatHeightFeetInches)(player.heightInches),
                                                                            " \xb7 ",
                                                                            player.archetype,
                                                                            " \xb7",
                                                                            ' ',
                                                                            badgeCount,
                                                                            " Badges"
                                                                        ]
                                                                    })
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                className: "h2k-player-ovr",
                                                                children: player.ovr
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                type: "button",
                                                                className: "h2k-mini-pill",
                                                                title: "Swap Starter / Bench position",
                                                                onClick: function onClick(e) {
                                                                    e.stopPropagation();
                                                                    _audioEngine.HybridAudioEngine.playUi('switch', eraMode);
                                                                    setSwapSlotIndex(isSwapSource ? null : idx);
                                                                },
                                                                children: isSwapSource ? '✓' : '⇅'
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }, player.id);
                                        })
                                    ]
                                })
                            ]
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("section", {
                        className: "h2k-roster-col h2k-inspector-col",
                        children: !activePlayer ? /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "h2k-empty-box",
                            children: "Select a player to inspect and edit."
                        }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-inspector-head",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-kicker",
                                                    children: [
                                                        activePlayer.position,
                                                        " \xb7 #",
                                                        activePlayer.jerseyNumber,
                                                        " \xb7",
                                                        ' ',
                                                        (0, _rosterTypes.formatHeightFeetInches)(activePlayer.heightInches),
                                                        " \xb7 ",
                                                        activePlayer.weightLbs,
                                                        " lbs \xb7",
                                                        ' ',
                                                        "WS ",
                                                        (0, _rosterTypes.formatHeightFeetInches)(activePlayer.wingspanInches)
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                    children: activePlayer.name
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h2k-archetype-line",
                                                    children: activePlayer.archetype
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
                                                    children: activePlayer.ovr
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "h2k-inspector-tabs",
                                    children: [
                                        [
                                            'ATTRIBUTES',
                                            '18 ATTRIBUTES'
                                        ],
                                        [
                                            'HOT_ZONES',
                                            '9 HOT ZONES'
                                        ],
                                        [
                                            'BADGES',
                                            "BADGES (" + Object.keys(activePlayer.badges).length + ")"
                                        ],
                                        [
                                            'BIO',
                                            'BIO & GEAR'
                                        ]
                                    ].map(function(param) {
                                        var tabId = param[0], label = param[1];
                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            className: "h2k-modal-tab " + (inspectorTab === tabId ? 'active' : ''),
                                            onClick: function onClick() {
                                                _audioEngine.HybridAudioEngine.playUi('click', eraMode);
                                                setInspectorTab(tabId);
                                            },
                                            children: label
                                        }, tabId);
                                    })
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-inspector-body",
                                    children: [
                                        inspectorTab === 'ATTRIBUTES' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h2k-attr-editor-list",
                                            children: _rosterTypes.ATTRIBUTE_META.map(function(meta) {
                                                var val = activePlayer.attributes[meta.key];
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
                                                                return handleAttrChange(meta.key, Number(e.target.value));
                                                            }
                                                        })
                                                    ]
                                                }, meta.key);
                                            })
                                        }),
                                        inspectorTab === 'HOT_ZONES' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-hz-panel",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)(_TeamLogo.HotZoneCourtSVG, {
                                                    zones: activePlayer.hotZones,
                                                    interactive: true,
                                                    onToggleZone: handleHotZoneToggle
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "h2k-hz-quick-row",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            type: "button",
                                                            className: "h2k-mini-pill",
                                                            onClick: function onClick() {
                                                                return commitPlayerPatch({
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
                                                                }, false);
                                                            },
                                                            children: "ALL HOT \uD83D\uDD25"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            type: "button",
                                                            className: "h2k-mini-pill",
                                                            onClick: function onClick() {
                                                                return commitPlayerPatch({
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
                                                                }, false);
                                                            },
                                                            children: "RESET NEUTRAL"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        inspectorTab === 'BADGES' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
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
                                                    children: "Click any badge to cycle tier: None → Bronze → Silver → Gold → HOF → Legend."
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h2k-badge-grid",
                                                    children: _rosterTypes.BADGE_CATALOG.filter(function(b) {
                                                        return b.category === badgeCat;
                                                    }).map(function(badge) {
                                                        var tier = activePlayer.badges[badge.id];
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                            type: "button",
                                                            className: "h2k-badge-card " + (tier ? "tier-" + tier.toLowerCase() : 'tier-none'),
                                                            onClick: function onClick() {
                                                                return handleBadgeCycle(badge.id);
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
                                        inspectorTab === 'BIO' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "h2k-form-grid",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                    className: "h2k-form-row",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            children: "Player Name"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                            className: "h2k-input",
                                                            value: activePlayer.name,
                                                            maxLength: 28,
                                                            onChange: function onChange(e) {
                                                                return commitPlayerPatch({
                                                                    name: e.target.value
                                                                }, false);
                                                            }
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
                                                                    children: "Jersey # (0-99)"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                                    type: "number",
                                                                    className: "h2k-input",
                                                                    min: 0,
                                                                    max: 99,
                                                                    value: activePlayer.jerseyNumber,
                                                                    onChange: function onChange(e) {
                                                                        return commitPlayerPatch({
                                                                            jerseyNumber: Math.max(0, Math.min(99, Number(e.target.value) || 0))
                                                                        }, false);
                                                                    }
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                            className: "h2k-form-row",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    children: "Position"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                                    className: "h2k-select",
                                                                    value: activePlayer.position,
                                                                    onChange: function onChange(e) {
                                                                        return commitPlayerPatch({
                                                                            position: e.target.value
                                                                        }, true);
                                                                    },
                                                                    children: POSITIONS.map(function(pos) {
                                                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                            value: pos,
                                                                            children: pos
                                                                        }, pos);
                                                                    })
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
                                                                "Height (",
                                                                (0, _rosterTypes.formatHeightFeetInches)(activePlayer.heightInches),
                                                                ")"
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                            type: "range",
                                                            min: 69,
                                                            max: 88,
                                                            value: activePlayer.heightInches,
                                                            onChange: function onChange(e) {
                                                                return commitPlayerPatch({
                                                                    heightInches: Number(e.target.value)
                                                                }, false);
                                                            }
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                    className: "h2k-form-row",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            children: [
                                                                "Jumpshot Speed (",
                                                                activePlayer.jumpshotSpeed.toFixed(2),
                                                                "s)"
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                            type: "range",
                                                            min: 0.75,
                                                            max: 1.25,
                                                            step: 0.05,
                                                            value: activePlayer.jumpshotSpeed,
                                                            onChange: function onChange(e) {
                                                                return commitPlayerPatch({
                                                                    jumpshotSpeed: Number(e.target.value)
                                                                }, false);
                                                            }
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                    className: "h2k-form-row",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            children: "Hairstyle"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                            className: "h2k-select",
                                                            value: activePlayer.appearance.hairStyle,
                                                            onChange: function onChange(e) {
                                                                return commitPlayerPatch({
                                                                    appearance: _extends({}, activePlayer.appearance, {
                                                                        hairStyle: e.target.value
                                                                    })
                                                                }, false);
                                                            },
                                                            children: HAIR_OPTIONS.map(function(h) {
                                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                                    value: h,
                                                                    children: h
                                                                }, h);
                                                            })
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
                                                            children: SKIN_SWATCHES.map(function(hex) {
                                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                    type: "button",
                                                                    className: "h2k-swatch " + (activePlayer.appearance.skinTone === hex ? 'active' : ''),
                                                                    style: {
                                                                        backgroundColor: hex
                                                                    },
                                                                    "aria-label": "Skin tone " + hex,
                                                                    onClick: function onClick() {
                                                                        return commitPlayerPatch({
                                                                            appearance: _extends({}, activePlayer.appearance, {
                                                                                skinTone: hex
                                                                            })
                                                                        }, false);
                                                                    }
                                                                }, hex);
                                                            })
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                                    className: "h2k-check-row",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                            type: "checkbox",
                                                            checked: activePlayer.appearance.headband,
                                                            onChange: function onChange(e) {
                                                                return commitPlayerPatch({
                                                                    appearance: _extends({}, activePlayer.appearance, {
                                                                        headband: e.target.checked
                                                                    })
                                                                }, false);
                                                            }
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            children: "Equip Headband"
                                                        })
                                                    ]
                                                }),
                                                eraFilter !== 'FREE_AGENTS' && activeTeam.roster.length > 5 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    type: "button",
                                                    className: "h2k-btn-danger",
                                                    onClick: function onClick() {
                                                        var res = _rosterStore.RosterStore.releaseToFreeAgents(activeTeam.id, activePlayer.id);
                                                        onNotify(res.message);
                                                    },
                                                    children: [
                                                        "RELEASE ",
                                                        activePlayer.name.toUpperCase(),
                                                        " TO FREE AGENTS"
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    })
                ]
            })
        ]
    });
};

});
// === MODULE: src/games/hoops-2k26/hybrid/rosterStore ===
ArcadeMod.define("src/games/hoops-2k26/hybrid/rosterStore", function(require, module, exports) {
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
    get CUSTOM_ROSTER_SAVE_KEY () {
        return CUSTOM_ROSTER_SAVE_KEY;
    },
    get DEFAULT_ALL_TEAMS () {
        return DEFAULT_ALL_TEAMS;
    },
    get RosterStore () {
        return RosterStore;
    },
    get resolveCanonicalTeamId () {
        return resolveCanonicalTeamId;
    },
    get toHoops2K26TeamOverride () {
        return toHoops2K26TeamOverride;
    },
    get useRosterStore () {
        return useRosterStore;
    }
});
var _react = require("react");
var _rosters2K14 = require("./rosters2K14");
var _rosters2K26 = require("./rosters2K26");
var _rostersBonus = require("./rostersBonus");
var _rosterTypes = require("./rosterTypes");
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
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
var CUSTOM_ROSTER_SAVE_KEY = 'nba2k14_2k26_custom_rosters_v1';
var DEFAULT_ALL_TEAMS = [].concat(_rosters2K14.ROSTERS_2K14, _rosters2K26.ROSTERS_2K26, _rostersBonus.ROSTERS_BONUS);
function safeGetStorage(key) {
    try {
        if (typeof window === 'undefined' || !window.localStorage) return null;
        return window.localStorage.getItem(key);
    } catch (unused) {
        return null;
    }
}
function safeSetStorage(key, val) {
    try {
        if (typeof window === 'undefined' || !window.localStorage) return;
        window.localStorage.setItem(key, val);
    } catch (unused) {
    // Ignore sandbox/quota errors
    }
}
function createEmptyOverlay() {
    return {
        version: 1,
        playerEdits: {},
        teamRosterIds: {},
        createdPlayers: [],
        freeAgentIds: [],
        lastUpdatedMs: Date.now()
    };
}
function clonePlayer(p) {
    return _extends({}, p, {
        appearance: _extends({}, p.appearance),
        tendencies: _extends({}, p.tendencies),
        attributes: _extends({}, p.attributes),
        hotZones: _extends({}, p.hotZones),
        badges: _extends({}, p.badges)
    });
}
// Base lookup maps for fast overlay hydration
var BASE_PLAYERS_BY_ID = {};
DEFAULT_ALL_TEAMS.forEach(function(team) {
    team.roster.forEach(function(p) {
        BASE_PLAYERS_BY_ID[p.id] = p;
    });
});
function loadOverlay() {
    var raw = safeGetStorage(CUSTOM_ROSTER_SAVE_KEY);
    if (!raw) return createEmptyOverlay();
    try {
        var parsed = JSON.parse(raw);
        if (!parsed || (typeof parsed === "undefined" ? "undefined" : _type_of(parsed)) !== 'object') return createEmptyOverlay();
        return {
            version: 1,
            playerEdits: parsed.playerEdits && _type_of(parsed.playerEdits) === 'object' ? parsed.playerEdits : {},
            teamRosterIds: parsed.teamRosterIds && _type_of(parsed.teamRosterIds) === 'object' ? parsed.teamRosterIds : {},
            createdPlayers: Array.isArray(parsed.createdPlayers) ? parsed.createdPlayers : [],
            freeAgentIds: Array.isArray(parsed.freeAgentIds) ? parsed.freeAgentIds : [],
            lastUpdatedMs: typeof parsed.lastUpdatedMs === 'number' ? parsed.lastUpdatedMs : Date.now()
        };
    } catch (unused) {
        return createEmptyOverlay();
    }
}
function buildSnapshot(overlay, revision) {
    var createdById = {};
    overlay.createdPlayers.forEach(function(p) {
        createdById[p.id] = p;
    });
    var resolvePlayer = function resolvePlayer(id) {
        if (overlay.playerEdits[id]) return clonePlayer(overlay.playerEdits[id]);
        if (createdById[id]) return clonePlayer(createdById[id]);
        if (BASE_PLAYERS_BY_ID[id]) return clonePlayer(BASE_PLAYERS_BY_ID[id]);
        return null;
    };
    var teams = DEFAULT_ALL_TEAMS.map(function(baseTeam) {
        var _overlay_teamRosterIds_baseTeam_id;
        var ids = (_overlay_teamRosterIds_baseTeam_id = overlay.teamRosterIds[baseTeam.id]) != null ? _overlay_teamRosterIds_baseTeam_id : baseTeam.roster.map(function(p) {
            return p.id;
        });
        var roster = [];
        ids.forEach(function(pid) {
            var p = resolvePlayer(pid);
            if (p) roster.push(p);
        });
        // Safety guard: guarantee at least 5 players on any team
        if (roster.length < 5) {
            baseTeam.roster.forEach(function(bp) {
                if (!roster.some(function(x) {
                    return x.id === bp.id;
                })) {
                    roster.push(clonePlayer(bp));
                }
            });
        }
        var ratings = (0, _rosterTypes.computeTeamRatings)(roster);
        return _extends({}, baseTeam, {
            colors: _extends({}, baseTeam.colors),
            ovr: ratings.ovr,
            offRating: ratings.offRating,
            defRating: ratings.defRating,
            roster: roster
        });
    });
    var freeAgents = [];
    overlay.freeAgentIds.forEach(function(pid) {
        var p = resolvePlayer(pid);
        if (p) freeAgents.push(p);
    });
    var isCustomized = Object.keys(overlay.playerEdits).length > 0 || Object.keys(overlay.teamRosterIds).length > 0 || overlay.createdPlayers.length > 0 || overlay.freeAgentIds.length > 0;
    return {
        teams: teams,
        freeAgents: freeAgents,
        createdPlayers: overlay.createdPlayers.map(clonePlayer),
        isCustomized: isCustomized,
        revision: revision
    };
}
var _overlay = loadOverlay();
var _revision = 1;
var _snapshot = buildSnapshot(_overlay, _revision);
var _listeners = new Set();
function commitOverlay(next) {
    _overlay = _extends({}, next, {
        lastUpdatedMs: Date.now()
    });
    _revision += 1;
    safeSetStorage(CUSTOM_ROSTER_SAVE_KEY, JSON.stringify(_overlay));
    _snapshot = buildSnapshot(_overlay, _revision);
    _listeners.forEach(function(fn) {
        return fn(_snapshot);
    });
    return _snapshot;
}
function getTeamRosterIdList(teamId) {
    var existing = _overlay.teamRosterIds[teamId];
    if (existing) return [].concat(existing);
    var base = DEFAULT_ALL_TEAMS.find(function(t) {
        return t.id === teamId;
    });
    return base ? base.roster.map(function(p) {
        return p.id;
    }) : [];
}
// Legacy Part 1 team ID aliases so older localStorage saves resolve seamlessly
var LEGACY_TEAM_ID_ALIASES = {
    '2k26_bos_0': '2k26_bos',
    '2k26_lal_1': '2k26_lal',
    '2k26_gsw_2': '2k26_gsw',
    '2k26_den_3': '2k26_den',
    '2k26_okc_4': '2k26_okc',
    '2k26_mil_5': '2k26_mil',
    '2k26_nyk_6': '2k26_nyk',
    '2k26_sas_7': '2k26_sas',
    '2k26_min_8': '2k26_min',
    '2k26_mia_9': '2k26_mia',
    '2k26_lva_10': 'wnba_lva',
    '2k26_nyl_11': 'wnba_nyl',
    '2k26_ind_12': 'wnba_ind',
    '2k26_min_13': 'wnba_chi',
    '2k26_96b_14': 'leg_chi96',
    '2k26_01l_15': 'leg_lal01',
    '2k14_96chi': 'leg_chi96',
    '2k14_01lal': 'leg_lal01',
    '2k14_86bos': 'leg_bos86',
    '2k14_rm': 'euro_rm',
    '2k14_fcb': 'euro_fcb',
    '2k14_cska': 'euro_cska',
    '2k14_oly': 'euro_oly'
};
function resolveCanonicalTeamId(teamId) {
    var _LEGACY_TEAM_ID_ALIASES_teamId;
    return (_LEGACY_TEAM_ID_ALIASES_teamId = LEGACY_TEAM_ID_ALIASES[teamId]) != null ? _LEGACY_TEAM_ID_ALIASES_teamId : teamId;
}
var RosterStore = {
    getSnapshot: function getSnapshot() {
        return _snapshot;
    },
    subscribe: function subscribe(listener) {
        _listeners.add(listener);
        return function() {
            _listeners.delete(listener);
        };
    },
    getAllTeams: function getAllTeams() {
        return _snapshot.teams;
    },
    getTeamsByEra: function getTeamsByEra(era) {
        return _snapshot.teams.filter(function(t) {
            return t.era === era;
        });
    },
    getTeamById: function getTeamById(teamId) {
        var _snapshot_teams_find;
        var canon = resolveCanonicalTeamId(teamId);
        return (_snapshot_teams_find = _snapshot.teams.find(function(t) {
            return t.id === canon;
        })) != null ? _snapshot_teams_find : _snapshot.teams[0];
    },
    findPlayerTeam: function findPlayerTeam(playerId) {
        var _snapshot_teams_find;
        return (_snapshot_teams_find = _snapshot.teams.find(function(t) {
            return t.roster.some(function(p) {
                return p.id === playerId;
            });
        })) != null ? _snapshot_teams_find : null;
    },
    updatePlayer: function updatePlayer(updated, recomputeOvr) {
        if (recomputeOvr === void 0) recomputeOvr = true;
        var nextPlayer = clonePlayer(updated);
        if (recomputeOvr) {
            nextPlayer.ovr = (0, _rosterTypes.computePlayerOvr)(nextPlayer.attributes, nextPlayer.position);
            nextPlayer.archetype = (0, _rosterTypes.deriveArchetype)(nextPlayer.attributes, nextPlayer.position);
        }
        var nextCreated = _overlay.createdPlayers.map(function(p) {
            return p.id === nextPlayer.id ? nextPlayer : p;
        });
        var _obj;
        return commitOverlay(_extends({}, _overlay, {
            playerEdits: _extends({}, _overlay.playerEdits, (_obj = {}, _obj[nextPlayer.id] = nextPlayer, _obj)),
            createdPlayers: nextCreated
        }));
    },
    swapStarterBench: function swapStarterBench(teamId, indexA, indexB) {
        var canon = resolveCanonicalTeamId(teamId);
        var ids = getTeamRosterIdList(canon);
        if (indexA < 0 || indexB < 0 || indexA >= ids.length || indexB >= ids.length || indexA === indexB) {
            return _snapshot;
        }
        var tmp = ids[indexA];
        ids[indexA] = ids[indexB];
        ids[indexB] = tmp;
        var _obj;
        return commitOverlay(_extends({}, _overlay, {
            teamRosterIds: _extends({}, _overlay.teamRosterIds, (_obj = {}, _obj[canon] = ids, _obj))
        }));
    },
    tradePlayers: function tradePlayers(teamAId, playerAId, teamBId, playerBId) {
        var canonA = resolveCanonicalTeamId(teamAId);
        var canonB = resolveCanonicalTeamId(teamBId);
        if (canonA === canonB) {
            return {
                ok: false,
                message: 'Select two different teams to complete a trade.'
            };
        }
        var idsA = getTeamRosterIdList(canonA);
        var idsB = getTeamRosterIdList(canonB);
        var idxA = idsA.indexOf(playerAId);
        var idxB = idsB.indexOf(playerBId);
        if (idxA === -1 || idxB === -1) {
            return {
                ok: false,
                message: 'Could not locate selected players on those rosters.'
            };
        }
        idsA[idxA] = playerBId;
        idsB[idxB] = playerAId;
        var _obj;
        commitOverlay(_extends({}, _overlay, {
            teamRosterIds: _extends({}, _overlay.teamRosterIds, (_obj = {}, _obj[canonA] = idsA, _obj[canonB] = idsB, _obj))
        }));
        return {
            ok: true,
            message: 'Trade finalized and saved to custom rosters!'
        };
    },
    addCreatedPlayer: function addCreatedPlayer(player, assignTeamId, insertAsStarter) {
        if (insertAsStarter === void 0) insertAsStarter = true;
        var cleanPlayer = clonePlayer(_extends({}, player, {
            isCreated: true,
            ovr: (0, _rosterTypes.computePlayerOvr)(player.attributes, player.position),
            archetype: player.archetype || (0, _rosterTypes.deriveArchetype)(player.attributes, player.position)
        }));
        var nextCreated = [].concat(_overlay.createdPlayers.filter(function(p) {
            return p.id !== cleanPlayer.id;
        }), [
            cleanPlayer
        ]);
        var _obj;
        var nextEdits = _extends({}, _overlay.playerEdits, (_obj = {}, _obj[cleanPlayer.id] = cleanPlayer, _obj));
        if (assignTeamId === 'FREE_AGENTS') {
            var nextFa = _overlay.freeAgentIds.includes(cleanPlayer.id) ? _overlay.freeAgentIds : [].concat([
                cleanPlayer.id
            ], _overlay.freeAgentIds);
            return commitOverlay(_extends({}, _overlay, {
                playerEdits: nextEdits,
                createdPlayers: nextCreated,
                freeAgentIds: nextFa
            }));
        }
        var canonTeam = resolveCanonicalTeamId(assignTeamId);
        var ids = getTeamRosterIdList(canonTeam).filter(function(id) {
            return id !== cleanPlayer.id;
        });
        if (insertAsStarter) {
            var posSlot = {
                PG: 0,
                SG: 1,
                SF: 2,
                PF: 3,
                C: 4
            };
            var slot = posSlot[cleanPlayer.position];
            var displaced = ids[slot];
            ids[slot] = cleanPlayer.id;
            if (displaced) ids.push(displaced);
        } else {
            ids.push(cleanPlayer.id);
        }
        var _obj1;
        return commitOverlay(_extends({}, _overlay, {
            playerEdits: nextEdits,
            createdPlayers: nextCreated,
            teamRosterIds: _extends({}, _overlay.teamRosterIds, (_obj1 = {}, _obj1[canonTeam] = ids, _obj1)),
            freeAgentIds: _overlay.freeAgentIds.filter(function(id) {
                return id !== cleanPlayer.id;
            })
        }));
    },
    signFreeAgent: function signFreeAgent(playerId, targetTeamId) {
        if (!_overlay.freeAgentIds.includes(playerId)) {
            return {
                ok: false,
                message: 'Player is not currently in Free Agents.'
            };
        }
        var canonTeam = resolveCanonicalTeamId(targetTeamId);
        var ids = getTeamRosterIdList(canonTeam);
        if (!ids.includes(playerId)) {
            ids.push(playerId);
        }
        var _obj;
        commitOverlay(_extends({}, _overlay, {
            teamRosterIds: _extends({}, _overlay.teamRosterIds, (_obj = {}, _obj[canonTeam] = ids, _obj)),
            freeAgentIds: _overlay.freeAgentIds.filter(function(id) {
                return id !== playerId;
            })
        }));
        return {
            ok: true,
            message: 'Free agent signed to roster!'
        };
    },
    releaseToFreeAgents: function releaseToFreeAgents(teamId, playerId) {
        var canonTeam = resolveCanonicalTeamId(teamId);
        var ids = getTeamRosterIdList(canonTeam);
        if (ids.length <= 5) {
            return {
                ok: false,
                message: 'A team must keep at least 5 active players.'
            };
        }
        var nextIds = ids.filter(function(id) {
            return id !== playerId;
        });
        if (nextIds.length === ids.length) {
            return {
                ok: false,
                message: 'Player not found on team.'
            };
        }
        var _obj;
        commitOverlay(_extends({}, _overlay, {
            teamRosterIds: _extends({}, _overlay.teamRosterIds, (_obj = {}, _obj[canonTeam] = nextIds, _obj)),
            freeAgentIds: [].concat([
                playerId
            ], _overlay.freeAgentIds.filter(function(id) {
                return id !== playerId;
            }))
        }));
        return {
            ok: true,
            message: 'Player moved to Free Agents pool.'
        };
    },
    resetDefaultRosters: function resetDefaultRosters() {
        return commitOverlay(createEmptyOverlay());
    }
};
function useRosterStore() {
    var _useState = (0, _react.useState)(function() {
        return RosterStore.getSnapshot();
    }), snap = _useState[0], setSnap = _useState[1];
    (0, _react.useEffect)(function() {
        return RosterStore.subscribe(setSnap);
    }, []);
    return snap;
}
// ============================================================================
// LIVE 3D TIP-OFF BRIDGE: Convert Any Part 2 TeamData -> Hoops2K26TeamDef
// ============================================================================
function cssHexToInt(hex, fallback) {
    if (fallback === void 0) fallback = 0x1d428a;
    var clean = hex.replace('#', '').trim();
    var parsed = parseInt(clean, 16);
    return Number.isFinite(parsed) ? parsed : fallback;
}
function ratingToFiveScale(val) {
    return Math.max(1, Math.min(5, Math.round((val - 60) / 8)));
}
function toHoops2K26TeamOverride(team, fallbackCourtId) {
    if (fallbackCourtId === void 0) fallbackCourtId = 0;
    var starterSlice = team.roster.slice(0, 5);
    var toRosterPlayer = function toRosterPlayer(p, idx) {
        var roles = [
            'PG',
            'SG',
            'SF',
            'PF',
            'C'
        ];
        var scale = Number((0.92 + (p.heightInches - 70) / 18 * 0.24).toFixed(2));
        return {
            role: p.position || roles[idx],
            name: p.name,
            ovr: p.ovr,
            jersey: p.jerseyNumber,
            skin: cssHexToInt(p.appearance.skinTone, 0xc68657),
            scale: Math.max(0.88, Math.min(1.18, scale))
        };
    };
    var starters = [
        0,
        1,
        2,
        3,
        4
    ].map(function(i) {
        var _starterSlice_i;
        return toRosterPlayer((_starterSlice_i = starterSlice[i]) != null ? _starterSlice_i : starterSlice[0], i);
    });
    var avg3 = starterSlice.reduce(function(s, p) {
        return s + p.attributes.threePt;
    }, 0) / Math.max(1, starterSlice.length);
    var avgDunk = starterSlice.reduce(function(s, p) {
        return s + p.attributes.drivingDunk;
    }, 0) / Math.max(1, starterSlice.length);
    var avgSpd = starterSlice.reduce(function(s, p) {
        return s + p.attributes.speed;
    }, 0) / Math.max(1, starterSlice.length);
    var avgDef = starterSlice.reduce(function(s, p) {
        return s + (p.attributes.perimeterDef + p.attributes.interiorDef) / 2;
    }, 0) / Math.max(1, starterSlice.length);
    return {
        id: fallbackCourtId,
        city: team.city,
        name: (team.city + " " + team.name).trim(),
        abbr: team.abbr,
        league: team.era === 'WNBA' ? 'wnba' : team.era === 'LEGENDS' ? 'classic' : 'nba',
        eraTag: team.era,
        tier: team.ovr >= 88 ? 1 : team.ovr >= 82 ? 2 : 3,
        tagline: team.era + " \xb7 " + team.arena,
        icon: team.era === 'LEGENDS' ? '🏆' : team.era === 'EUROLEAGUE' ? '🌍' : team.era === 'WNBA' ? '⚡' : '🏀',
        jerseyColor: cssHexToInt(team.colors.primary, 0x1d428a),
        awayJerseyColor: 0xf8fafc,
        cityJerseyColor: cssHexToInt(team.colors.secondary, 0x111827),
        trimColor: cssHexToInt(team.colors.accent || team.colors.secondary, 0xf59e0b),
        accentHex: team.colors.accent || team.colors.secondary || '#f59e0b',
        shootRating: ratingToFiveScale(avg3),
        dunkRating: ratingToFiveScale(avgDunk),
        speedRating: ratingToFiveScale(avgSpd),
        defRating: ratingToFiveScale(avgDef),
        starters: starters
    };
}

});
// === MODULE: src/games/hoops-2k26/hybrid/rosterTypes ===
ArcadeMod.define("src/games/hoops-2k26/hybrid/rosterTypes", function(require, module, exports) {
// ============================================================================
// NBA 2K14 + NBA 2K26 ULTIMATE HYBRID — PART 2 ROSTER SCHEMA & FACTORIES
// ============================================================================
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
    get ATTRIBUTE_META () {
        return ATTRIBUTE_META;
    },
    get BADGE_CATALOG () {
        return BADGE_CATALOG;
    },
    get BADGE_TIERS () {
        return BADGE_TIERS;
    },
    get clampRating () {
        return clampRating;
    },
    get computePlayerOvr () {
        return computePlayerOvr;
    },
    get computeTeamRatings () {
        return computeTeamRatings;
    },
    get deriveArchetype () {
        return deriveArchetype;
    },
    get formatHeightFeetInches () {
        return formatHeightFeetInches;
    },
    get makePlayer () {
        return makePlayer;
    },
    get makeTeam () {
        return makeTeam;
    }
});
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
var BADGE_TIERS = [
    'BRONZE',
    'SILVER',
    'GOLD',
    'HOF',
    'LEGEND'
];
var BADGE_CATALOG = [
    // Shooting
    {
        id: 'DEADEYE',
        name: 'Deadeye',
        category: 'SHOOTING',
        shortDesc: 'Reduces late defensive closeout penalty on jumpers.'
    },
    {
        id: 'LIMITLESS_RANGE',
        name: 'Limitless Range',
        category: 'SHOOTING',
        shortDesc: 'Extends three-point range deep past the arc.'
    },
    {
        id: 'SET_SHOT_SPECIALIST',
        name: 'Set Shot Specialist',
        category: 'SHOOTING',
        shortDesc: 'Boosts stationary catch-and-shoot jump shots.'
    },
    {
        id: 'SHIFTY_SHOOTER',
        name: 'Shifty Shooter',
        category: 'SHOOTING',
        shortDesc: 'Improves off-dribble pull-ups, stepbacks, and fades.'
    },
    {
        id: 'MINI_MARKSMAN',
        name: 'Mini Marksman',
        category: 'SHOOTING',
        shortDesc: 'Raises shooting percentage over taller defenders.'
    },
    // Playmaking
    {
        id: 'ANKLE_ASSASSIN',
        name: 'Ankle Assassin',
        category: 'PLAYMAKING',
        shortDesc: 'Increases chance to freeze or drop on-ball defenders.'
    },
    {
        id: 'DIMER',
        name: 'Dimer',
        category: 'PLAYMAKING',
        shortDesc: 'Gives open teammates a shot boost after crisp passes.'
    },
    {
        id: 'LIGHTNING_LAUNCH',
        name: 'Lightning Launch',
        category: 'PLAYMAKING',
        shortDesc: 'Accelerates explosive first-step perimeter drives.'
    },
    {
        id: 'UNPLUCKABLE',
        name: 'Unpluckable',
        category: 'PLAYMAKING',
        shortDesc: 'Protects the ball from reach-in steal attempts.'
    },
    {
        id: 'HANDLES_FOR_DAYS',
        name: 'Handles for Days',
        category: 'PLAYMAKING',
        shortDesc: 'Reduces energy loss on chained iso dribble moves.'
    },
    {
        id: 'VERSATILE_VISIONARY',
        name: 'Versatile Visionary',
        category: 'PLAYMAKING',
        shortDesc: 'Threads alley-oops, skip passes, and tight lanes.'
    },
    {
        id: 'BREAK_STARTER',
        name: 'Break Starter',
        category: 'PLAYMAKING',
        shortDesc: 'Fires accurate full-court outlet passes off boards.'
    },
    // Finishing
    {
        id: 'POSTERIZER',
        name: 'Posterizer',
        category: 'FINISHING',
        shortDesc: 'Elevates contact dunk finishes through rim protectors.'
    },
    {
        id: 'AERIAL_WIZARD',
        name: 'Aerial Wizard',
        category: 'FINISHING',
        shortDesc: 'Boosts alley-oop slams and putback finishes.'
    },
    {
        id: 'LAYUP_MIXMASTER',
        name: 'Layup Mixmaster',
        category: 'FINISHING',
        shortDesc: 'Enhances euro-steps, spin layups, and scoop finishes.'
    },
    {
        id: 'FLOAT_GAME',
        name: 'Float Game',
        category: 'FINISHING',
        shortDesc: 'Raises accuracy on teardrops and runners in the lane.'
    },
    {
        id: 'PHYSICAL_FINISHER',
        name: 'Physical Finisher',
        category: 'FINISHING',
        shortDesc: 'Powers through contact on strong paint drives.'
    },
    // Defense / Rebounding
    {
        id: 'PERIMETER_CHALLENGER',
        name: 'Challenger',
        category: 'DEFENSE',
        shortDesc: 'Amplifies perimeter shot contests and closeouts.'
    },
    {
        id: 'GLOVE',
        name: 'Glove',
        category: 'DEFENSE',
        shortDesc: 'Increases clean on-ball strip steals.'
    },
    {
        id: 'INTERCEPTOR',
        name: 'Interceptor',
        category: 'DEFENSE',
        shortDesc: 'Boosts passing-lane deflections and steals.'
    },
    {
        id: 'PAINT_PATROLLER',
        name: 'Paint Patroller',
        category: 'DEFENSE',
        shortDesc: 'Protects the rim and deters inside layups/dunks.'
    },
    {
        id: 'HIGH_FLYING_DENIER',
        name: 'High-Flying Denier',
        category: 'DEFENSE',
        shortDesc: 'Boosts chase-down and weakside swat speed.'
    },
    {
        id: 'BOXOUT_BEAST',
        name: 'Boxout Beast',
        category: 'DEFENSE',
        shortDesc: 'Holds rebounding position and swims past boxouts.'
    },
    {
        id: 'REBOUND_CHASER',
        name: 'Rebound Chaser',
        category: 'DEFENSE',
        shortDesc: 'Expands rebounding reach on long and contested boards.'
    },
    {
        id: 'POGO_STICK',
        name: 'Pogo Stick',
        category: 'DEFENSE',
        shortDesc: 'Allows rapid consecutive vertical jumps in the paint.'
    }
];
var ATTRIBUTE_META = [
    {
        key: 'threePt',
        label: 'Three-Point Shot',
        group: 'SHOOTING'
    },
    {
        key: 'midRange',
        label: 'Mid-Range Shot',
        group: 'SHOOTING'
    },
    {
        key: 'freeThrow',
        label: 'Free Throw',
        group: 'SHOOTING'
    },
    {
        key: 'closeShot',
        label: 'Close Shot',
        group: 'FINISHING'
    },
    {
        key: 'drivingLayup',
        label: 'Driving Layup',
        group: 'FINISHING'
    },
    {
        key: 'drivingDunk',
        label: 'Driving Dunk',
        group: 'FINISHING'
    },
    {
        key: 'ballHandle',
        label: 'Ball Handle',
        group: 'PLAYMAKING'
    },
    {
        key: 'passAccuracy',
        label: 'Pass Accuracy',
        group: 'PLAYMAKING'
    },
    {
        key: 'speed',
        label: 'Speed',
        group: 'PHYSICALS'
    },
    {
        key: 'acceleration',
        label: 'Acceleration',
        group: 'PHYSICALS'
    },
    {
        key: 'vertical',
        label: 'Vertical',
        group: 'PHYSICALS'
    },
    {
        key: 'strength',
        label: 'Strength',
        group: 'PHYSICALS'
    },
    {
        key: 'perimeterDef',
        label: 'Perimeter Defense',
        group: 'DEFENSE'
    },
    {
        key: 'interiorDef',
        label: 'Interior Defense',
        group: 'DEFENSE'
    },
    {
        key: 'steal',
        label: 'Steal',
        group: 'DEFENSE'
    },
    {
        key: 'block',
        label: 'Block',
        group: 'DEFENSE'
    },
    {
        key: 'offReb',
        label: 'Offensive Rebound',
        group: 'DEFENSE'
    },
    {
        key: 'defReb',
        label: 'Defensive Rebound',
        group: 'DEFENSE'
    }
];
function clampRating(val, min, max) {
    if (min === void 0) min = 25;
    if (max === void 0) max = 99;
    return Math.max(min, Math.min(max, Math.round(val)));
}
function formatHeightFeetInches(inches) {
    var clamped = Math.max(66, Math.min(90, Math.round(inches)));
    var ft = Math.floor(clamped / 12);
    var rem = clamped % 12;
    return ft + "'" + rem + '"';
}
function computePlayerOvr(attrs, pos) {
    var shoot = attrs.threePt * 0.42 + attrs.midRange * 0.38 + attrs.freeThrow * 0.2;
    var finish = attrs.drivingLayup * 0.4 + attrs.drivingDunk * 0.35 + attrs.closeShot * 0.25;
    var play = attrs.ballHandle * 0.52 + attrs.passAccuracy * 0.48;
    var phys = attrs.speed * 0.3 + attrs.acceleration * 0.28 + attrs.vertical * 0.2 + attrs.strength * 0.22;
    var perDef = attrs.perimeterDef * 0.55 + attrs.steal * 0.45;
    var intDef = attrs.interiorDef * 0.55 + attrs.block * 0.45;
    var reb = attrs.defReb * 0.65 + attrs.offReb * 0.35;
    var weighted;
    if (pos === 'PG') {
        weighted = shoot * 0.25 + play * 0.28 + finish * 0.16 + phys * 0.15 + perDef * 0.13 + reb * 0.03;
    } else if (pos === 'SG') {
        weighted = shoot * 0.3 + finish * 0.2 + play * 0.17 + phys * 0.16 + perDef * 0.13 + reb * 0.04;
    } else if (pos === 'SF') {
        weighted = shoot * 0.23 + finish * 0.22 + play * 0.14 + phys * 0.16 + perDef * 0.13 + intDef * 0.06 + reb * 0.06;
    } else if (pos === 'PF') {
        weighted = finish * 0.24 + shoot * 0.18 + intDef * 0.17 + reb * 0.17 + phys * 0.12 + perDef * 0.06 + play * 0.06;
    } else {
        weighted = finish * 0.26 + intDef * 0.24 + reb * 0.24 + phys * 0.11 + shoot * 0.09 + play * 0.06;
    }
    return clampRating(weighted + 7, 65, 99);
}
function deriveArchetype(attrs, pos) {
    var hi3 = attrs.threePt >= 84;
    var hiDunk = attrs.drivingDunk >= 84;
    var hiPlay = attrs.ballHandle >= 83 && attrs.passAccuracy >= 82;
    var hiDef = attrs.perimeterDef >= 83 || attrs.interiorDef >= 84 || attrs.block >= 83;
    if (pos === 'C' || pos === 'PF') {
        if (hi3 && hiDef) return 'Two-Way Stretch Big';
        if (hi3) return 'Stretch Playmaker';
        if (hiPlay && attrs.defReb >= 82) return 'Point Center';
        if (hiDef && hiDunk) return 'Paint Beast';
        if (hiDef) return 'Defensive Anchor';
        return 'Interior Finisher';
    }
    if (hi3 && hiDef && hiDunk) return '2-Way 3-Level Threat';
    if (hi3 && hiPlay) return 'Shot-Creating Playmaker';
    if (hiDunk && hiPlay) return 'Slashing Playmaker';
    if (hi3 && hiDef) return '3 & D Wing';
    if (hi3) return 'Sharpshooter';
    if (hiDunk) return 'Athletic Finisher';
    if (hiDef) return 'Perimeter Lockdown';
    return 'All-Around Two-Way';
}
function computeTeamRatings(roster) {
    var starters = roster.slice(0, 5);
    var bench = roster.slice(5, 8);
    var sOvr = starters.reduce(function(sum, p) {
        return sum + p.ovr;
    }, 0) / Math.max(1, starters.length);
    var bOvr = bench.length > 0 ? bench.reduce(function(sum, p) {
        return sum + p.ovr;
    }, 0) / bench.length : sOvr - 4;
    var ovr = clampRating(sOvr * 0.8 + bOvr * 0.2 + 2, 70, 99);
    var offAvg = starters.reduce(function(sum, p) {
        return sum + (p.attributes.threePt * 0.28 + p.attributes.midRange * 0.22 + p.attributes.drivingLayup * 0.2 + p.attributes.drivingDunk * 0.14 + p.attributes.passAccuracy * 0.16);
    }, 0) / Math.max(1, starters.length);
    var defAvg = starters.reduce(function(sum, p) {
        return sum + (p.attributes.perimeterDef * 0.32 + p.attributes.interiorDef * 0.28 + p.attributes.steal * 0.16 + p.attributes.block * 0.12 + p.attributes.defReb * 0.12);
    }, 0) / Math.max(1, starters.length);
    return {
        ovr: ovr,
        offRating: clampRating(offAvg + 7, 68, 99),
        defRating: clampRating(defAvg + 7, 68, 99)
    };
}
var SKIN_PALETTE = [
    '#f2cbb6',
    '#dfa883',
    '#c68657',
    '#9c623d',
    '#734529',
    '#522f1c'
];
var HAIR_STYLES = [
    'FADE',
    'BUZZ',
    'SHORT',
    'BRAIDS',
    'DREADS',
    'AFRO',
    'BALD'
];
var SHOE_COLORS = [
    '#e11d48',
    '#f59e0b',
    '#38bdf8',
    '#f8fafc',
    '#22c55e',
    '#a855f7'
];
function hashStr(s) {
    var h = 2166136261;
    for(var i = 0; i < s.length; i++){
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
}
function defaultPhysicals(pos, era, seed) {
    var isW = era === 'WNBA';
    var baseH = isW ? {
        PG: 69,
        SG: 71,
        SF: 73,
        PF: 75,
        C: 77
    } : {
        PG: 74,
        SG: 77,
        SF: 79,
        PF: 81,
        C: 84
    };
    var baseW = isW ? {
        PG: 148,
        SG: 160,
        SF: 172,
        PF: 186,
        C: 204
    } : {
        PG: 192,
        SG: 206,
        SF: 222,
        PF: 238,
        C: 254
    };
    var delta = seed % 3 - 1;
    var heightInches = clampRating(baseH[pos] + delta, 69, 88);
    var weightLbs = baseW[pos] + (seed % 5 - 2) * 5;
    var wingspanInches = heightInches + 3 + seed % 3;
    return {
        heightInches: heightInches,
        weightLbs: weightLbs,
        wingspanInches: wingspanInches
    };
}
function defaultStyleForPosition(pos, ovr) {
    if (pos === 'PG') return ovr >= 84 ? 'ELITE_PG' : 'ROLE_GUARD';
    if (pos === 'SG') return ovr >= 84 ? 'SHARPSHOOTER' : 'ROLE_GUARD';
    if (pos === 'SF') return ovr >= 88 ? 'SUPERSTAR_WING' : ovr >= 82 ? 'TWO_WAY_WING' : 'ROLE_FORWARD';
    if (pos === 'PF') return ovr >= 84 ? 'STRETCH_BIG' : 'ROLE_FORWARD';
    return ovr >= 85 ? 'RIM_PROTECTOR' : 'ROLE_BIG';
}
function tierForOvr(ovr, boost) {
    if (boost === void 0) boost = 0;
    var v = ovr + boost;
    if (v >= 97) return 'LEGEND';
    if (v >= 91) return 'HOF';
    if (v >= 84) return 'GOLD';
    if (v >= 78) return 'SILVER';
    return 'BRONZE';
}
function makePlayer(spec) {
    var _spec_style, _off_closeShot, _off_midRange, _off_threePt, _off_freeThrow, _off_drivingDunk, _off_drivingLayup, _off_ballHandle, _off_passAccuracy, _off_speed, _off_acceleration, _off_vertical, _off_strength, _off_perimeterDef, _off_interiorDef, _off_steal, _off_block, _off_offReb, _off_defReb, _spec_attrs, _spec_hotZones, _spec_badges, _spec_appearance, _spec_tendencies, _spec_heightInches, _spec_weightLbs, _spec_wingspanInches, _spec_archetype, _spec_jumpshotSpeed;
    var seed = hashStr(spec.id + spec.name);
    var style = (_spec_style = spec.style) != null ? _spec_style : defaultStyleForPosition(spec.position, spec.ovr);
    var phys = defaultPhysicals(spec.position, spec.era, seed);
    var base = spec.ovr - 5; // Baseline scaled cleanly around player OVR
    var styleOffsets = {
        SUPERSTAR_WING: {
            closeShot: 6,
            midRange: 7,
            threePt: 5,
            freeThrow: 5,
            drivingDunk: 9,
            drivingLayup: 8,
            ballHandle: 6,
            passAccuracy: 5,
            speed: 6,
            acceleration: 6,
            vertical: 7,
            strength: 4,
            perimeterDef: 5,
            interiorDef: 1,
            steal: 4,
            block: 1,
            offReb: -6,
            defReb: 1
        },
        ELITE_PG: {
            closeShot: 2,
            midRange: 6,
            threePt: 7,
            freeThrow: 9,
            drivingDunk: -4,
            drivingLayup: 7,
            ballHandle: 10,
            passAccuracy: 9,
            speed: 9,
            acceleration: 9,
            vertical: 1,
            strength: -12,
            perimeterDef: 2,
            interiorDef: -16,
            steal: 5,
            block: -20,
            offReb: -18,
            defReb: -10
        },
        SHARPSHOOTER: {
            closeShot: 0,
            midRange: 8,
            threePt: 12,
            freeThrow: 10,
            drivingDunk: -6,
            drivingLayup: 3,
            ballHandle: 4,
            passAccuracy: 3,
            speed: 4,
            acceleration: 5,
            vertical: -2,
            strength: -10,
            perimeterDef: 2,
            interiorDef: -14,
            steal: 2,
            block: -16,
            offReb: -16,
            defReb: -8
        },
        SLASHER: {
            closeShot: 7,
            midRange: 1,
            threePt: -4,
            freeThrow: 1,
            drivingDunk: 12,
            drivingLayup: 10,
            ballHandle: 6,
            passAccuracy: 2,
            speed: 8,
            acceleration: 9,
            vertical: 11,
            strength: 2,
            perimeterDef: 3,
            interiorDef: -4,
            steal: 5,
            block: -2,
            offReb: -6,
            defReb: -2
        },
        TWO_WAY_WING: {
            closeShot: 3,
            midRange: 4,
            threePt: 5,
            freeThrow: 4,
            drivingDunk: 5,
            drivingLayup: 4,
            ballHandle: 2,
            passAccuracy: 2,
            speed: 5,
            acceleration: 5,
            vertical: 5,
            strength: 3,
            perimeterDef: 9,
            interiorDef: 3,
            steal: 8,
            block: 3,
            offReb: -4,
            defReb: 2
        },
        STRETCH_BIG: {
            closeShot: 7,
            midRange: 6,
            threePt: 6,
            freeThrow: 4,
            drivingDunk: 4,
            drivingLayup: 3,
            ballHandle: -8,
            passAccuracy: -2,
            speed: -5,
            acceleration: -5,
            vertical: 0,
            strength: 8,
            perimeterDef: -4,
            interiorDef: 7,
            steal: -6,
            block: 6,
            offReb: 4,
            defReb: 9
        },
        RIM_PROTECTOR: {
            closeShot: 9,
            midRange: -8,
            threePt: -18,
            freeThrow: -8,
            drivingDunk: 8,
            drivingLayup: 2,
            ballHandle: -20,
            passAccuracy: -10,
            speed: -9,
            acceleration: -9,
            vertical: 4,
            strength: 12,
            perimeterDef: -10,
            interiorDef: 12,
            steal: -10,
            block: 13,
            offReb: 10,
            defReb: 12
        },
        POST_SCORER: {
            closeShot: 12,
            midRange: 8,
            threePt: -4,
            freeThrow: 4,
            drivingDunk: 6,
            drivingLayup: 5,
            ballHandle: -8,
            passAccuracy: 2,
            speed: -7,
            acceleration: -6,
            vertical: 0,
            strength: 11,
            perimeterDef: -8,
            interiorDef: 8,
            steal: -8,
            block: 6,
            offReb: 8,
            defReb: 10
        },
        POINT_CENTER: {
            closeShot: 11,
            midRange: 8,
            threePt: 6,
            freeThrow: 6,
            drivingDunk: 2,
            drivingLayup: 7,
            ballHandle: 4,
            passAccuracy: 12,
            speed: -6,
            acceleration: -6,
            vertical: -4,
            strength: 10,
            perimeterDef: -6,
            interiorDef: 6,
            steal: 0,
            block: 2,
            offReb: 8,
            defReb: 11
        },
        ROLE_GUARD: {
            closeShot: 1,
            midRange: 4,
            threePt: 5,
            freeThrow: 6,
            drivingDunk: -6,
            drivingLayup: 4,
            ballHandle: 5,
            passAccuracy: 5,
            speed: 6,
            acceleration: 6,
            vertical: 0,
            strength: -12,
            perimeterDef: 3,
            interiorDef: -14,
            steal: 4,
            block: -16,
            offReb: -16,
            defReb: -9
        },
        ROLE_FORWARD: {
            closeShot: 4,
            midRange: 3,
            threePt: 4,
            freeThrow: 2,
            drivingDunk: 4,
            drivingLayup: 3,
            ballHandle: -2,
            passAccuracy: 0,
            speed: 2,
            acceleration: 2,
            vertical: 3,
            strength: 3,
            perimeterDef: 5,
            interiorDef: 3,
            steal: 3,
            block: 2,
            offReb: 1,
            defReb: 4
        },
        ROLE_BIG: {
            closeShot: 8,
            midRange: -4,
            threePt: -12,
            freeThrow: -4,
            drivingDunk: 6,
            drivingLayup: 2,
            ballHandle: -16,
            passAccuracy: -8,
            speed: -7,
            acceleration: -7,
            vertical: 2,
            strength: 10,
            perimeterDef: -9,
            interiorDef: 9,
            steal: -9,
            block: 8,
            offReb: 8,
            defReb: 10
        }
    };
    var off = styleOffsets[style];
    var jitter = function jitter(k) {
        return (seed + k * 7) % 5 - 2;
    };
    var attributes = _extends({
        closeShot: clampRating(base + ((_off_closeShot = off.closeShot) != null ? _off_closeShot : 0) + jitter(1)),
        midRange: clampRating(base + ((_off_midRange = off.midRange) != null ? _off_midRange : 0) + jitter(2)),
        threePt: clampRating(base + ((_off_threePt = off.threePt) != null ? _off_threePt : 0) + jitter(3)),
        freeThrow: clampRating(base + ((_off_freeThrow = off.freeThrow) != null ? _off_freeThrow : 0) + jitter(4)),
        drivingDunk: clampRating(base + ((_off_drivingDunk = off.drivingDunk) != null ? _off_drivingDunk : 0) + jitter(5)),
        drivingLayup: clampRating(base + ((_off_drivingLayup = off.drivingLayup) != null ? _off_drivingLayup : 0) + jitter(6)),
        ballHandle: clampRating(base + ((_off_ballHandle = off.ballHandle) != null ? _off_ballHandle : 0) + jitter(7)),
        passAccuracy: clampRating(base + ((_off_passAccuracy = off.passAccuracy) != null ? _off_passAccuracy : 0) + jitter(8)),
        speed: clampRating(base + ((_off_speed = off.speed) != null ? _off_speed : 0) + jitter(9)),
        acceleration: clampRating(base + ((_off_acceleration = off.acceleration) != null ? _off_acceleration : 0) + jitter(10)),
        vertical: clampRating(base + ((_off_vertical = off.vertical) != null ? _off_vertical : 0) + jitter(11)),
        strength: clampRating(base + ((_off_strength = off.strength) != null ? _off_strength : 0) + jitter(12)),
        perimeterDef: clampRating(base + ((_off_perimeterDef = off.perimeterDef) != null ? _off_perimeterDef : 0) + jitter(13)),
        interiorDef: clampRating(base + ((_off_interiorDef = off.interiorDef) != null ? _off_interiorDef : 0) + jitter(14)),
        steal: clampRating(base + ((_off_steal = off.steal) != null ? _off_steal : 0) + jitter(15)),
        block: clampRating(base + ((_off_block = off.block) != null ? _off_block : 0) + jitter(16)),
        offReb: clampRating(base + ((_off_offReb = off.offReb) != null ? _off_offReb : 0) + jitter(17)),
        defReb: clampRating(base + ((_off_defReb = off.defReb) != null ? _off_defReb : 0) + jitter(18))
    }, (_spec_attrs = spec.attrs) != null ? _spec_attrs : {});
    var hot3 = attributes.threePt >= 84 ? 1 : attributes.threePt <= 66 ? -1 : 0;
    var hotMid = attributes.midRange >= 82 ? 1 : attributes.midRange <= 64 ? -1 : 0;
    var hotPaint = attributes.closeShot >= 82 || attributes.drivingDunk >= 82 ? 1 : 0;
    var hotZones = _extends({
        leftCorner3: hot3,
        leftWing3: attributes.threePt >= 86 ? 1 : hot3 === -1 ? -1 : 0,
        topKey3: attributes.threePt >= 82 ? 1 : hot3 === -1 ? -1 : 0,
        rightWing3: attributes.threePt >= 84 ? 1 : 0,
        rightCorner3: hot3,
        leftMid: hotMid,
        topMid: attributes.midRange >= 84 ? 1 : 0,
        rightMid: hotMid,
        paint: hotPaint
    }, (_spec_hotZones = spec.hotZones) != null ? _spec_hotZones : {});
    // Auto-assign authentic badges based on attributes & OVR, merged with any explicit badges
    var autoBadges = {};
    if (attributes.threePt >= 86) autoBadges.LIMITLESS_RANGE = tierForOvr(spec.ovr);
    if (attributes.threePt >= 82) autoBadges.DEADEYE = tierForOvr(spec.ovr, -1);
    if (attributes.threePt >= 80) autoBadges.SET_SHOT_SPECIALIST = tierForOvr(spec.ovr);
    if (attributes.midRange >= 84 && attributes.ballHandle >= 78) autoBadges.SHIFTY_SHOOTER = tierForOvr(spec.ovr);
    if (attributes.ballHandle >= 84) {
        autoBadges.ANKLE_ASSASSIN = tierForOvr(spec.ovr);
        autoBadges.HANDLES_FOR_DAYS = tierForOvr(spec.ovr, -2);
        autoBadges.UNPLUCKABLE = tierForOvr(spec.ovr, -1);
    }
    if (attributes.passAccuracy >= 83) {
        autoBadges.DIMER = tierForOvr(spec.ovr);
        autoBadges.VERSATILE_VISIONARY = tierForOvr(spec.ovr, -2);
    }
    if (attributes.speed >= 85 && attributes.acceleration >= 85) autoBadges.LIGHTNING_LAUNCH = tierForOvr(spec.ovr);
    if (attributes.drivingDunk >= 85) autoBadges.POSTERIZER = tierForOvr(spec.ovr);
    if (attributes.drivingDunk >= 82 && attributes.vertical >= 84) autoBadges.AERIAL_WIZARD = tierForOvr(spec.ovr, -2);
    if (attributes.drivingLayup >= 85) autoBadges.LAYUP_MIXMASTER = tierForOvr(spec.ovr, -1);
    if (attributes.strength >= 82 && attributes.drivingLayup >= 80) autoBadges.PHYSICAL_FINISHER = tierForOvr(spec.ovr, -1);
    if (attributes.perimeterDef >= 83) autoBadges.PERIMETER_CHALLENGER = tierForOvr(spec.ovr);
    if (attributes.steal >= 83) {
        autoBadges.GLOVE = tierForOvr(spec.ovr, -1);
        autoBadges.INTERCEPTOR = tierForOvr(spec.ovr, -2);
    }
    if (attributes.interiorDef >= 84 || attributes.block >= 83) {
        autoBadges.PAINT_PATROLLER = tierForOvr(spec.ovr);
        autoBadges.HIGH_FLYING_DENIER = tierForOvr(spec.ovr, -2);
    }
    if (attributes.defReb >= 84) {
        autoBadges.REBOUND_CHASER = tierForOvr(spec.ovr);
        autoBadges.BOXOUT_BEAST = tierForOvr(spec.ovr, -2);
    }
    var badges = _extends({}, autoBadges, (_spec_badges = spec.badges) != null ? _spec_badges : {});
    var appearance = _extends({
        skinTone: SKIN_PALETTE[seed % SKIN_PALETTE.length],
        hairStyle: spec.era === 'WNBA' ? seed % 2 === 0 ? 'PONYTAIL' : 'BRAIDS' : HAIR_STYLES[seed % HAIR_STYLES.length],
        hairColor: '#171717',
        headband: spec.ovr >= 88 && seed % 3 === 0,
        armSleeve: seed % 4 === 0 ? 'RIGHT' : seed % 4 === 1 ? 'LEFT' : 'NONE',
        legCompression: seed % 3 === 0,
        shoeColor: SHOE_COLORS[seed % SHOE_COLORS.length]
    }, (_spec_appearance = spec.appearance) != null ? _spec_appearance : {});
    var tendencies = _extends({
        shoot3: clampRating(attributes.threePt - 5, 10, 95),
        driveRim: clampRating((attributes.drivingDunk + attributes.drivingLayup) / 2 - 4, 15, 95),
        postUp: clampRating(spec.position === 'C' || spec.position === 'PF' ? 72 : 34, 10, 95),
        passFirst: clampRating(attributes.passAccuracy - 10, 15, 95),
        stealAggro: clampRating(attributes.steal - 8, 15, 95)
    }, (_spec_tendencies = spec.tendencies) != null ? _spec_tendencies : {});
    return {
        id: spec.id,
        name: spec.name,
        jerseyNumber: spec.jerseyNumber,
        position: spec.position,
        heightInches: (_spec_heightInches = spec.heightInches) != null ? _spec_heightInches : phys.heightInches,
        weightLbs: (_spec_weightLbs = spec.weightLbs) != null ? _spec_weightLbs : phys.weightLbs,
        wingspanInches: (_spec_wingspanInches = spec.wingspanInches) != null ? _spec_wingspanInches : phys.wingspanInches,
        ovr: clampRating(spec.ovr, 65, 99),
        archetype: (_spec_archetype = spec.archetype) != null ? _spec_archetype : deriveArchetype(attributes, spec.position),
        era: spec.era,
        appearance: appearance,
        jumpshotSpeed: (_spec_jumpshotSpeed = spec.jumpshotSpeed) != null ? _spec_jumpshotSpeed : Number((0.88 + seed % 24 * 0.01).toFixed(2)),
        tendencies: tendencies,
        attributes: attributes,
        hotZones: hotZones,
        badges: badges
    };
}
function makeTeam(input) {
    var _input_colors_, _input_colors_1;
    var roster = input.players.map(function(tuple, idx) {
        var name = tuple[0], jerseyNumber = tuple[1], position = tuple[2], ovr = tuple[3], style = tuple[4], heightInches = tuple[5], extras = tuple[6];
        return makePlayer(_extends({
            id: input.id + "_p" + idx,
            name: name,
            jerseyNumber: jerseyNumber,
            position: position,
            ovr: ovr,
            era: input.era,
            style: style,
            heightInches: heightInches
        }, extras != null ? extras : {}));
    });
    var ratings = computeTeamRatings(roster);
    return {
        id: input.id,
        era: input.era,
        city: input.city,
        name: input.name,
        abbr: input.abbr,
        conference: input.conference,
        arena: input.arena,
        colors: {
            primary: input.colors[0],
            secondary: input.colors[1],
            accent: input.colors[2],
            courtWood: (_input_colors_ = input.colors[3]) != null ? _input_colors_ : '#c69255',
            keyColor: (_input_colors_1 = input.colors[4]) != null ? _input_colors_1 : input.colors[0]
        },
        ovr: ratings.ovr,
        offRating: ratings.offRating,
        defRating: ratings.defRating,
        roster: roster
    };
}

});

})(window.ArcadeMod);
