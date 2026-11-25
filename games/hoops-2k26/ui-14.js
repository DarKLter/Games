(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/modes/MyTeamHub ===
ArcadeMod.define("src/games/hoops-2k26/modes/MyTeamHub", function(require, module, exports) {
// ============================================================================
// PART 6 — NBA 2K26 ENHANCED MyTEAM
// Features:
// - Dual-Gender + Dual-Era Card Collection (2K14, 2K26, Legends & WNBA)
// - 8 Card Rarity Tiers (Emerald 82 -> Dark Matter 99)
// - Animated Holographic Pack Market (VC & MTP) with dramatic reveal & SFX
// - Lineup Manager (Starting 5 + 3 Bench)
// - NBA 2K26 Game Changer Cards (5 consumable power-ups equipped pre-tip-off)
// - Playable Domination 5v5 (30 NBA Teams) & Triple Threat 3v3 (First to 21)
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MyTeamHub", {
    enumerable: true,
    get: function() {
        return MyTeamHub;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _rosterStore = require("../hybrid/rosterStore");
var _store = require("../hybrid/store");
var _audioEngine = require("../hybrid/audioEngine");
var _modesStore = require("./modesStore");
var _modesTypes = require("./modesTypes");
require("./modesHud.css");
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
function reduceDifficultyOneTier(d) {
    if (d === 'Hall of Fame') return 'Superstar';
    if (d === 'Superstar') return 'All-Star';
    if (d === 'All-Star') return 'Pro';
    return 'Rookie';
}
var MyTeamHub = function MyTeamHub(param) {
    var eraMode = param.eraMode, onBack = param.onBack, onNotify = param.onNotify;
    var _GAME_CHANGER_CATALOG_find;
    var hybridSave = (0, _store.useUltimateHybridStore)();
    var modes = (0, _modesStore.useModesStore)();
    var mt = modes.myTeam;
    var _useState = (0, _react.useState)('LINEUP'), tab = _useState[0], setTab = _useState[1];
    var _useState1 = (0, _react.useState)('ALL'), eraFilter = _useState1[0], setEraFilter = _useState1[1];
    var _useState2 = (0, _react.useState)(null), selectedCardId = _useState2[0], setSelectedCardId = _useState2[1];
    var _useState3 = (0, _react.useState)([]), lastPulledCards = _useState3[0], setLastPulledCards = _useState3[1];
    var _useState4 = (0, _react.useState)({}), revealedIds = _useState4[0], setRevealedIds = _useState4[1];
    var _useState5 = (0, _react.useState)('2K26'), domEra = _useState5[0], setDomEra = _useState5[1];
    var cardById = (0, _react.useMemo)(function() {
        var map = {};
        mt.ownedCards.forEach(function(c) {
            map[c.id] = c;
        });
        return map;
    }, [
        mt.ownedCards
    ]);
    var starters = (0, _react.useMemo)(function() {
        return mt.startingFiveIds.map(function(id) {
            return cardById[id];
        }).filter(Boolean);
    }, [
        mt.startingFiveIds,
        cardById
    ]);
    var bench = (0, _react.useMemo)(function() {
        return mt.benchIds.map(function(id) {
            return cardById[id];
        }).filter(Boolean);
    }, [
        mt.benchIds,
        cardById
    ]);
    var filteredCollection = (0, _react.useMemo)(function() {
        var base = eraFilter === 'ALL' ? mt.ownedCards : mt.ownedCards.filter(function(c) {
            return c.eraLabel === eraFilter;
        });
        return [].concat(base).sort(function(a, b) {
            return b.ovr - a.ovr;
        });
    }, [
        mt.ownedCards,
        eraFilter
    ]);
    var dominationTeams = (0, _react.useMemo)(function() {
        return _rosterStore.RosterStore.getAllTeams().filter(function(t) {
            return t.era === domEra;
        });
    }, [
        domEra
    ]);
    var squadOvr = (0, _react.useMemo)(function() {
        if (starters.length === 0) return 85;
        return Math.round(starters.reduce(function(s, c) {
            return s + c.ovr;
        }, 0) / starters.length);
    }, [
        starters
    ]);
    var equippedGc = (_GAME_CHANGER_CATALOG_find = _modesTypes.GAME_CHANGER_CATALOG.find(function(g) {
        return g.id === mt.equippedGameChangerId;
    })) != null ? _GAME_CHANGER_CATALOG_find : null;
    var handleRipPack = function handleRipPack(packId, currency) {
        var res = _modesStore.ModesStore.openMyTeamPack(packId, currency);
        if (!res.ok) {
            onNotify(res.message);
            return;
        }
        _audioEngine.HybridAudioEngine.playGreenRelease();
        _audioEngine.HybridAudioEngine.playCrowdRoar(0.8);
        setLastPulledCards(res.cards);
        var rev = {};
        res.cards.forEach(function(c) {
            rev[c.id] = false;
        });
        setRevealedIds(rev);
        onNotify(res.message);
    };
    var revealAllPulled = function revealAllPulled() {
        var rev = {};
        lastPulledCards.forEach(function(c) {
            rev[c.id] = true;
        });
        setRevealedIds(rev);
        _audioEngine.HybridAudioEngine.playUi('confirm', eraMode);
    };
    var launchDomination = function launchDomination(oppTeamId, oppName) {
        var _mt_gameChangerCounts_mt_equippedGameChangerId;
        var activeGc = mt.equippedGameChangerId && ((_mt_gameChangerCounts_mt_equippedGameChangerId = mt.gameChangerCounts[mt.equippedGameChangerId]) != null ? _mt_gameChangerCounts_mt_equippedGameChangerId : 0) > 0 ? mt.equippedGameChangerId : null;
        var baseDiff = 'All-Star';
        var diff = activeGc === 'GC_DIFFICULTY_REDUCER' ? reduceDifficultyOneTier(baseDiff) : baseDiff;
        var fullLineup = (0, _modesStore.myTeamCardsToProfiles)([].concat(starters, bench));
        _audioEngine.HybridAudioEngine.playUi('confirm', eraMode);
        _modesStore.ModesStore.launchModeMatch({
            kind: 'MYTEAM_DOMINATION',
            title: "MyTEAM Domination vs " + oppName,
            subtitle: activeGc ? "Game Changer Active: " + (equippedGc == null ? void 0 : equippedGc.name) : '5v5 Domination · Win by 12+ for 3★',
            returnScreen: 'MYTEAM_HUB',
            matchPatch: {
                homeTeamId: '2k26_okc',
                awayTeamId: oppTeamId,
                venue: 'ARENA_2K26',
                playersPerSide: 5,
                targetScore: null,
                quarterLengthMin: 5,
                difficulty: diff,
                sideControl: 'HOME',
                modeLabel: "MyTEAM Domination vs " + oppName
            },
            customHomeRoster: fullLineup.length >= 5 ? fullLineup : undefined,
            instantTakeover: activeGc === 'GC_HOT_START_TAKEOVER',
            myTeamDominationTeamId: oppTeamId,
            myTeamGameChangerId: activeGc,
            objectiveBanner: "Domination 5v5 vs " + oppName + " \xb7 Win (+1★), Win by 6+ (+2★), Win by 12+ (+3★)",
            baseVcReward: 1000,
            baseMtpReward: 1600,
            baseRepReward: 420
        });
    };
    var launchTripleThreat = function launchTripleThreat() {
        var _mt_gameChangerCounts_mt_equippedGameChangerId;
        var activeGc = mt.equippedGameChangerId && ((_mt_gameChangerCounts_mt_equippedGameChangerId = mt.gameChangerCounts[mt.equippedGameChangerId]) != null ? _mt_gameChangerCounts_mt_equippedGameChangerId : 0) > 0 ? mt.equippedGameChangerId : null;
        var baseDiff = 'All-Star';
        var diff = activeGc === 'GC_DIFFICULTY_REDUCER' ? reduceDifficultyOneTier(baseDiff) : baseDiff;
        var trio = (0, _modesStore.myTeamCardsToProfiles)(starters.slice(0, 3));
        var randomTeams = _rosterStore.RosterStore.getAllTeams().filter(function(t) {
            return t.era === 'LEGENDS' || t.era === 'WNBA';
        });
        var opp = randomTeams[mt.tripleThreatWins % Math.max(1, randomTeams.length)];
        _audioEngine.HybridAudioEngine.playUi('confirm', eraMode);
        _modesStore.ModesStore.launchModeMatch({
            kind: 'MYTEAM_TRIPLE_THREAT',
            title: "MyTEAM Triple Threat 3v3 \xb7 Win #" + (mt.tripleThreatWins + 1),
            subtitle: "Your Top 3 Cards vs " + opp.city + " " + opp.name,
            returnScreen: 'MYTEAM_HUB',
            matchPatch: {
                homeTeamId: '2k26_okc',
                awayTeamId: opp.id,
                venue: 'SKYLINE_PARK',
                playersPerSide: 3,
                targetScore: 21,
                quarterLengthMin: 5,
                difficulty: diff,
                sideControl: 'HOME',
                modeLabel: 'MyTEAM Triple Threat 3v3'
            },
            customHomeRoster: trio.length >= 3 ? trio : undefined,
            instantTakeover: activeGc === 'GC_HOT_START_TAKEOVER',
            myTeamGameChangerId: activeGc,
            objectiveBanner: "Triple Threat 3v3 \xb7 First to 21 \xb7 Dual-Era & WNBA Squad Live!",
            baseVcReward: 850,
            baseMtpReward: 1250,
            baseRepReward: 350
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
                                        children: "NBA 2K26 MyTEAM \xb7 DUAL-ERA & WNBA"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-mode-submeta",
                                        children: [
                                            "Squad OVR ",
                                            squadOvr,
                                            " \xb7 ",
                                            mt.ownedCards.length,
                                            " Cards \xb7 TT Wins ",
                                            mt.tripleThreatWins,
                                            " \xb7",
                                            ' ',
                                            equippedGc ? "Game Changer: " + equippedGc.name : 'No Game Changer Equipped'
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "h2k-mode-top-right",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "h2k-wallet-strip",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                    className: "h2k-wallet-vc",
                                    children: [
                                        "VC ",
                                        hybridSave.currencies.vc.toLocaleString()
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                    className: "h2k-wallet-mtp",
                                    children: [
                                        "MTP ",
                                        hybridSave.currencies.mtp.toLocaleString()
                                    ]
                                })
                            ]
                        })
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-mode-tabs",
                children: [
                    {
                        id: 'LINEUP',
                        label: 'Lineup & Collection'
                    },
                    {
                        id: 'PACKS',
                        label: 'Holographic Pack Market'
                    },
                    {
                        id: 'GAME_CHANGERS',
                        label: '2K26 Game Changer Cards'
                    },
                    {
                        id: 'DOMINATION',
                        label: 'Domination 5v5 (30 Teams)'
                    },
                    {
                        id: 'TRIPLE_THREAT',
                        label: 'Triple Threat 3v3'
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
                    tab === 'LINEUP' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 18
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-card",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-section-head",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                children: "Starting 5 & 3-Man Bench"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "h2k-muted",
                                                children: selectedCardId ? 'Tap any Starting 5 or Bench slot below to assign your selected card' : 'Click any card in your Collection below, then tap a slot to swap'
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        style: {
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                                            gap: 10,
                                            marginBottom: 14
                                        },
                                        children: [
                                            'PG',
                                            'SG',
                                            'SF',
                                            'PF',
                                            'C'
                                        ].map(function(pos, idx) {
                                            var _ref, _ref1;
                                            var card = starters[idx];
                                            var tier = card ? _modesTypes.MYTEAM_TIERS[card.tier] : _modesTypes.MYTEAM_TIERS.EMERALD;
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-mt-card",
                                                style: {
                                                    '--tier-color': tier.color,
                                                    cursor: 'pointer'
                                                },
                                                onClick: function onClick() {
                                                    if (selectedCardId) {
                                                        _modesStore.ModesStore.setMyTeamLineupSlot('STARTER', idx, selectedCardId);
                                                        setSelectedCardId(null);
                                                        onNotify("Assigned card to Starting " + pos + "!");
                                                    }
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                style: {
                                                                    fontSize: 11,
                                                                    fontWeight: 700,
                                                                    color: tier.color
                                                                },
                                                                children: [
                                                                    "START ",
                                                                    pos,
                                                                    " \xb7 ",
                                                                    tier.label
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "h2k-mt-ovr",
                                                                style: {
                                                                    color: tier.glow
                                                                },
                                                                children: (_ref = card == null ? void 0 : card.ovr) != null ? _ref : '--'
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        style: {
                                                            fontSize: 13
                                                        },
                                                        children: (_ref1 = card == null ? void 0 : card.name) != null ? _ref1 : 'Empty'
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "h2k-muted h2k-tabular",
                                                        children: card ? card.eraLabel + " \xb7 " + card.teamAbbr + " \xb7 3PT " + card.threePt + " \xb7 DNK " + card.drivingDunk : ''
                                                    })
                                                ]
                                            }, "st_" + idx);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h2k-grid-3",
                                        children: [
                                            0,
                                            1,
                                            2
                                        ].map(function(bIdx) {
                                            var _ref, _ref1;
                                            var card = bench[bIdx];
                                            var tier = card ? _modesTypes.MYTEAM_TIERS[card.tier] : _modesTypes.MYTEAM_TIERS.EMERALD;
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-mt-card",
                                                style: {
                                                    '--tier-color': tier.color,
                                                    cursor: 'pointer'
                                                },
                                                onClick: function onClick() {
                                                    if (selectedCardId) {
                                                        _modesStore.ModesStore.setMyTeamLineupSlot('BENCH', bIdx, selectedCardId);
                                                        setSelectedCardId(null);
                                                        onNotify("Assigned card to Bench Slot #" + (bIdx + 1) + "!");
                                                    }
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                style: {
                                                                    fontSize: 11,
                                                                    fontWeight: 700,
                                                                    color: tier.color
                                                                },
                                                                children: [
                                                                    "BENCH #",
                                                                    bIdx + 1,
                                                                    " \xb7 ",
                                                                    tier.label
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                className: "h2k-tabular",
                                                                style: {
                                                                    fontSize: 18,
                                                                    color: tier.glow
                                                                },
                                                                children: (_ref = card == null ? void 0 : card.ovr) != null ? _ref : '--'
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        style: {
                                                            fontSize: 13
                                                        },
                                                        children: (_ref1 = card == null ? void 0 : card.name) != null ? _ref1 : 'Empty'
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "h2k-muted",
                                                        children: card ? card.eraLabel + " \xb7 " + card.position + " \xb7 " + card.teamAbbr : ''
                                                    })
                                                ]
                                            }, "bn_" + bIdx);
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
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                                children: [
                                                    "Card Collection (",
                                                    filteredCollection.length,
                                                    ")"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                style: {
                                                    display: 'flex',
                                                    gap: 6
                                                },
                                                children: [
                                                    'ALL',
                                                    '2K14',
                                                    '2K26',
                                                    'LEGEND',
                                                    'WNBA'
                                                ].map(function(f) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        type: "button",
                                                        className: "h2k-mode-btn " + (eraFilter === f ? 'primary' : ''),
                                                        style: {
                                                            minHeight: 30,
                                                            padding: '0 10px'
                                                        },
                                                        onClick: function onClick() {
                                                            return setEraFilter(f);
                                                        },
                                                        children: f
                                                    }, f);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h2k-grid-4",
                                        children: filteredCollection.map(function(card) {
                                            var tier = _modesTypes.MYTEAM_TIERS[card.tier];
                                            var isSel = selectedCardId === card.id;
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-mt-card",
                                                style: {
                                                    '--tier-color': isSel ? '#fbbf24' : tier.color,
                                                    cursor: 'pointer',
                                                    boxShadow: isSel ? '0 0 0 2px #fbbf24' : undefined
                                                },
                                                onClick: function onClick() {
                                                    return setSelectedCardId(isSel ? null : card.id);
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                style: {
                                                                    fontSize: 11,
                                                                    fontWeight: 700,
                                                                    color: tier.color
                                                                },
                                                                children: [
                                                                    tier.label,
                                                                    " \xb7 ",
                                                                    card.eraLabel
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "h2k-mt-ovr",
                                                                style: {
                                                                    color: tier.glow
                                                                },
                                                                children: card.ovr
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        style: {
                                                            fontSize: 13
                                                        },
                                                        children: card.name
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "h2k-muted h2k-tabular",
                                                        children: [
                                                            card.position,
                                                            " \xb7 ",
                                                            card.teamAbbr,
                                                            " \xb7 3PT ",
                                                            card.threePt,
                                                            " \xb7 DEF ",
                                                            card.defense
                                                        ]
                                                    })
                                                ]
                                            }, card.id);
                                        })
                                    })
                                ]
                            })
                        ]
                    }),
                    tab === 'PACKS' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 18
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "h2k-grid-3",
                                children: _modesTypes.MYTEAM_PACKS.map(function(pack) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-card",
                                        style: {
                                            borderColor: pack.accent,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            gap: 12
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        style: {
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            color: pack.accent
                                                        },
                                                        children: "HOLOGRAPHIC 3-CARD PACK"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                        style: {
                                                            margin: '4px 0',
                                                            fontFamily: 'Oswald, sans-serif',
                                                            fontSize: 21
                                                        },
                                                        children: pack.name
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                        className: "h2k-muted",
                                                        style: {
                                                            margin: 0
                                                        },
                                                        children: pack.subtitle
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                style: {
                                                    display: 'flex',
                                                    gap: 8
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        type: "button",
                                                        className: "h2k-mode-btn primary",
                                                        style: {
                                                            flex: 1
                                                        },
                                                        onClick: function onClick() {
                                                            return handleRipPack(pack.id, 'VC');
                                                        },
                                                        children: [
                                                            "Rip \xb7 ",
                                                            pack.priceVc.toLocaleString(),
                                                            " VC"
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        type: "button",
                                                        className: "h2k-mode-btn cyan",
                                                        style: {
                                                            flex: 1
                                                        },
                                                        onClick: function onClick() {
                                                            return handleRipPack(pack.id, 'MTP');
                                                        },
                                                        children: [
                                                            "Rip \xb7 ",
                                                            pack.priceMtp.toLocaleString(),
                                                            " MTP"
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    }, pack.id);
                                })
                            }),
                            lastPulledCards.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-card",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-section-head",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                children: "Pack Opening Stage — Click Cards to Flip!"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-mode-btn primary",
                                                onClick: revealAllPulled,
                                                children: "Flip All Cards"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h2k-grid-3",
                                        children: lastPulledCards.map(function(card) {
                                            var flipped = revealedIds[card.id];
                                            var tier = _modesTypes.MYTEAM_TIERS[card.tier];
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "h2k-mt-card " + (flipped ? 'holo-reveal' : ''),
                                                style: {
                                                    '--tier-color': flipped ? tier.color : '#f59e0b',
                                                    minHeight: 150,
                                                    justifyContent: 'center',
                                                    cursor: 'pointer'
                                                },
                                                onClick: function onClick() {
                                                    setRevealedIds(function(prev) {
                                                        var _obj;
                                                        return _extends({}, prev, (_obj = {}, _obj[card.id] = true, _obj));
                                                    });
                                                    _audioEngine.HybridAudioEngine.playGreenRelease();
                                                },
                                                children: !flipped ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    style: {
                                                        textAlign: 'center'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            style: {
                                                                fontSize: 26
                                                            },
                                                            children: "✨"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                            style: {
                                                                color: '#fcd34d'
                                                            },
                                                            children: "TAP TO FLIP CARD"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "h2k-muted",
                                                            children: [
                                                                "Tier Glow: ",
                                                                tier.label
                                                            ]
                                                        })
                                                    ]
                                                }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    style: {
                                                                        fontSize: 12,
                                                                        fontWeight: 800,
                                                                        color: tier.color
                                                                    },
                                                                    children: [
                                                                        tier.label.toUpperCase(),
                                                                        " \xb7 ",
                                                                        card.eraLabel
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "h2k-mt-ovr",
                                                                    style: {
                                                                        color: tier.glow
                                                                    },
                                                                    children: card.ovr
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                            style: {
                                                                fontSize: 16
                                                            },
                                                            children: card.name
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "h2k-muted h2k-tabular",
                                                            children: [
                                                                card.position,
                                                                " \xb7 #",
                                                                card.jerseyNumber,
                                                                " ",
                                                                card.teamAbbr,
                                                                " \xb7 3PT ",
                                                                card.threePt,
                                                                " \xb7 DNK ",
                                                                card.drivingDunk
                                                            ]
                                                        })
                                                    ]
                                                })
                                            }, card.id);
                                        })
                                    })
                                ]
                            })
                        ]
                    }),
                    tab === 'GAME_CHANGERS' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "h2k-grid-3",
                        children: _modesTypes.GAME_CHANGER_CATALOG.map(function(gc) {
                            var _mt_gameChangerCounts_gc_id;
                            var count = (_mt_gameChangerCounts_gc_id = mt.gameChangerCounts[gc.id]) != null ? _mt_gameChangerCounts_gc_id : 0;
                            var isEquipped = mt.equippedGameChangerId === gc.id;
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-card",
                                style: {
                                    borderColor: isEquipped ? gc.accent : 'rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    gap: 12
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        style: {
                                                            color: gc.accent,
                                                            fontSize: 14
                                                        },
                                                        children: gc.name
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "h2k-tabular",
                                                        style: {
                                                            fontSize: 12,
                                                            fontWeight: 700
                                                        },
                                                        children: [
                                                            "Owned: x",
                                                            count
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                className: "h2k-muted",
                                                style: {
                                                    marginTop: 6
                                                },
                                                children: gc.description
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
                                                className: "h2k-mode-btn " + (isEquipped ? 'emerald' : 'primary'),
                                                style: {
                                                    flex: 1
                                                },
                                                disabled: count <= 0,
                                                onClick: function onClick() {
                                                    _modesStore.ModesStore.equipGameChanger(isEquipped ? null : gc.id);
                                                    onNotify(isEquipped ? 'Unequipped Game Changer.' : "Equipped " + gc.name + "!");
                                                },
                                                children: isEquipped ? '✓ Equipped' : 'Equip'
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                type: "button",
                                                className: "h2k-mode-btn cyan",
                                                onClick: function onClick() {
                                                    var res = _modesStore.ModesStore.buyGameChanger(gc.id);
                                                    onNotify(res.message);
                                                },
                                                children: [
                                                    "Buy (",
                                                    gc.costMtp,
                                                    " MTP)"
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }, gc.id);
                        })
                    }),
                    tab === 'DOMINATION' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 14
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 10
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        style: {
                                            display: 'flex',
                                            gap: 8
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-mode-btn " + (domEra === '2K26' ? 'primary' : ''),
                                                onClick: function onClick() {
                                                    return setDomEra('2K26');
                                                },
                                                children: "2025-26 NBA Domination (30 Teams)"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-mode-btn " + (domEra === '2K14' ? 'crimson' : ''),
                                                onClick: function onClick() {
                                                    return setDomEra('2K14');
                                                },
                                                children: "2013-14 Throwback Domination (30 Teams)"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "h2k-muted h2k-tabular",
                                        children: [
                                            "Total Domination Stars:",
                                            ' ',
                                            Object.values(mt.dominationStars).reduce(function(s, n) {
                                                return s + n;
                                            }, 0),
                                            " ★"
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "h2k-grid-4",
                                children: dominationTeams.map(function(team) {
                                    var _mt_dominationStars_team_id;
                                    var stars = (_mt_dominationStars_team_id = mt.dominationStars[team.id]) != null ? _mt_dominationStars_team_id : 0;
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-card",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                        children: [
                                                            team.abbr,
                                                            " \xb7 ",
                                                            team.ovr,
                                                            " OVR"
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        style: {
                                                            color: '#fbbf24'
                                                        },
                                                        children: [
                                                            '★'.repeat(stars),
                                                            '☆'.repeat(3 - stars)
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-muted",
                                                style: {
                                                    margin: '4px 0 10px'
                                                },
                                                children: [
                                                    team.city,
                                                    " ",
                                                    team.name
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-mode-btn primary",
                                                style: {
                                                    width: '100%'
                                                },
                                                onClick: function onClick() {
                                                    return launchDomination(team.id, team.city + " " + team.name);
                                                },
                                                children: "Play 5v5 Domination"
                                            })
                                        ]
                                    }, team.id);
                                })
                            })
                        ]
                    }),
                    tab === 'TRIPLE_THREAT' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "h2k-card",
                        style: {
                            maxWidth: 680
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-section-head",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                        children: "Triple Threat 3v3 \xb7 First to 21"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "h2k-wallet-vc h2k-tabular",
                                        children: [
                                            "Wins: ",
                                            mt.tripleThreatWins
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("p", {
                                className: "h2k-muted",
                                children: [
                                    "Your Top 3 Starting Cards (",
                                    starters.slice(0, 3).map(function(c) {
                                        return c.name;
                                    }).join(', '),
                                    ") hit the rooftop courts in a fast-paced 3v3 first-to-21 showdown against Legends & WNBA Superstars."
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "h2k-mode-btn primary",
                                style: {
                                    width: '100%',
                                    marginTop: 10
                                },
                                onClick: launchTripleThreat,
                                children: "Tip Off Triple Threat 3v3"
                            })
                        ]
                    })
                ]
            })
        ]
    });
};

});
// === MODULE: src/games/hoops-2k26/modes/PathToGreatness ===
ArcadeMod.define("src/games/hoops-2k26/modes/PathToGreatness", function(require, module, exports) {
// ============================================================================
// PART 6 — NBA 2K14 SIGNATURE MODE: LeBRON: PATH TO GREATNESS
// Crimson-and-gold 2K14 presentation with Branch 1 (Heat Dynasty) & Branch 2
// (Fantastic Journey), launching live 3D mid-game scenarios with real-time
// HUD objective tracking, Star Ratings (1-3★), Trophies, and massive VC!
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PathToGreatness", {
    enumerable: true,
    get: function() {
        return PathToGreatness;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _rosterStore = require("../hybrid/rosterStore");
var _store = require("../hybrid/store");
var _audioEngine = require("../hybrid/audioEngine");
var _modesStore = require("./modesStore");
var _modesTypes = require("./modesTypes");
require("./modesHud.css");
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
function formatClock(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? '0' : '') + s;
}
var PathToGreatness = function PathToGreatness(param) {
    var eraMode = param.eraMode, onBack = param.onBack, onNotify = param.onNotify;
    var hybridSave = (0, _store.useUltimateHybridStore)();
    var modes = (0, _modesStore.useModesStore)();
    var _useState = (0, _react.useState)('HEAT_DYNASTY'), branch = _useState[0], setBranch = _useState[1];
    var scenarios = (0, _react.useMemo)(function() {
        return _modesTypes.PTG_SCENARIOS.filter(function(s) {
            return s.branch === branch;
        });
    }, [
        branch
    ]);
    var totalStars = (0, _react.useMemo)(function() {
        return _modesTypes.PTG_SCENARIOS.reduce(function(sum, sc) {
            var _ref;
            var _modes_ptgProgress_sc_id;
            return sum + ((_ref = (_modes_ptgProgress_sc_id = modes.ptgProgress[sc.id]) == null ? void 0 : _modes_ptgProgress_sc_id.stars) != null ? _ref : 0);
        }, 0);
    }, [
        modes.ptgProgress
    ]);
    var trophiesCount = (0, _react.useMemo)(function() {
        return _modesTypes.PTG_SCENARIOS.filter(function(sc) {
            var _modes_ptgProgress_sc_id;
            return (_modes_ptgProgress_sc_id = modes.ptgProgress[sc.id]) == null ? void 0 : _modes_ptgProgress_sc_id.trophyUnlocked;
        }).length;
    }, [
        modes.ptgProgress
    ]);
    var launchScenario = function launchScenario(sc) {
        var _mia14_roster_find;
        _audioEngine.HybridAudioEngine.playUi('confirm', '2K14_CLASSIC');
        // For Fantastic Journey (Cleveland/NY), ensure 2014 LeBron James leads the home lineup!
        var mia14 = _rosterStore.RosterStore.getTeamById('2k14_mia');
        var lebron14 = (_mia14_roster_find = mia14.roster.find(function(p) {
            return p.name.toLowerCase().includes('lebron');
        })) != null ? _mia14_roster_find : mia14.roster[0];
        var homeTeam = _rosterStore.RosterStore.getTeamById(sc.homeTeamId);
        var hasLeBron = homeTeam.roster.some(function(p) {
            return p.name.toLowerCase().includes('lebron');
        });
        var customHomeRoster = hasLeBron ? undefined : [].concat([
            _extends({}, lebron14, {
                id: "ptg_lbj_" + sc.id
            })
        ], homeTeam.roster.slice(0, 7));
        onNotify("Launching " + sc.title + " — " + sc.objectiveSummary);
        _modesStore.ModesStore.launchModeMatch({
            kind: 'PATH_TO_GREATNESS',
            title: "Path to Greatness \xb7 " + sc.title,
            subtitle: sc.subtitle,
            returnScreen: 'PATH_TO_GREATNESS',
            matchPatch: {
                awayTeamId: sc.awayTeamId,
                homeTeamId: sc.homeTeamId,
                venue: sc.venue,
                quarterLengthMin: 5,
                difficulty: sc.difficulty,
                sideControl: sc.userSide,
                playersPerSide: 5,
                targetScore: null,
                modeLabel: "2K14 Path to Greatness: " + sc.title
            },
            startQuarter: sc.startQuarter,
            startClockSec: sc.startClockSec,
            startHomeScore: sc.startHomeScore,
            startAwayScore: sc.startAwayScore,
            customHomeRoster: customHomeRoster,
            objectiveBanner: sc.objectiveSummary,
            starPlayerTargetName: sc.starPlayerName,
            targetStarPts: sc.targetStarPts,
            targetStarAst: sc.targetStarAst,
            ptgScenarioId: sc.id,
            baseVcReward: sc.vcReward,
            baseRepReward: 550
        });
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h2k-mode-root ptg-theme",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                className: "h2k-mode-topbar ptg-bar",
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
                                        style: {
                                            color: '#fcd34d'
                                        },
                                        children: "NBA 2K14 \xb7 LeBRON: PATH TO GREATNESS"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-mode-submeta",
                                        children: [
                                            "Crimson & Gold Dynasty Campaign \xb7 Stars ",
                                            totalStars,
                                            "/18 ★ \xb7 Trophies ",
                                            trophiesCount,
                                            "/6 \uD83C\uDFC6"
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "h2k-mode-top-right",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                            className: "h2k-wallet-vc h2k-tabular",
                            style: {
                                fontWeight: 700,
                                fontSize: 13
                            },
                            children: [
                                "VC ",
                                hybridSave.currencies.vc.toLocaleString()
                            ]
                        })
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "h2k-mode-tabs",
                style: {
                    background: 'rgba(22, 6, 12, 0.96)'
                },
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        className: "h2k-mode-tab " + (branch === 'HEAT_DYNASTY' ? 'active' : ''),
                        onClick: function onClick() {
                            _audioEngine.HybridAudioEngine.playUi('switch', eraMode);
                            setBranch('HEAT_DYNASTY');
                        },
                        children: "\uD83D\uDD25 Branch 1: HEAT DYNASTY (3 Scenarios)"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        className: "h2k-mode-tab " + (branch === 'FANTASTIC_JOURNEY' ? 'active' : ''),
                        onClick: function onClick() {
                            _audioEngine.HybridAudioEngine.playUi('switch', eraMode);
                            setBranch('FANTASTIC_JOURNEY');
                        },
                        children: "\uD83D\uDC51 Branch 2: FANTASTIC JOURNEY (3 Scenarios)"
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "h2k-mode-scroll",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "h2k-card ptg-card",
                        style: {
                            marginBottom: 18
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-section-head",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                        style: {
                                            color: '#fcd34d'
                                        },
                                        children: branch === 'HEAT_DYNASTY' ? 'Branch 1: Heat Dynasty — Cement Miami as the Greatest Trio Ever' : 'Branch 2: Fantastic Journey — Rewrite History Across Cleveland, New York & 2026'
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "h2k-tabular",
                                        style: {
                                            fontSize: 12,
                                            color: '#fb7185'
                                        },
                                        children: "Mid-Game 3D Scenarios \xb7 Live HUD Objectives"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                className: "h2k-muted",
                                style: {
                                    margin: 0
                                },
                                children: "Every chapter drops you directly into the 4th quarter crunch-time situation on the 3D court with real-time LeBron stat tracking. Win for 1★, hit LeBron's Points Target + Win for 2★ & the Trophy, and add the Assist Target for 3★ Max VC!"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "h2k-grid-3",
                        children: scenarios.map(function(sc) {
                            var _modes_ptgProgress_sc_id;
                            var prog = (_modes_ptgProgress_sc_id = modes.ptgProgress[sc.id]) != null ? _modes_ptgProgress_sc_id : {
                                completed: false,
                                stars: 0,
                                bestMargin: 0,
                                trophyUnlocked: false
                            };
                            var home = _rosterStore.RosterStore.getTeamById(sc.homeTeamId);
                            var away = _rosterStore.RosterStore.getTeamById(sc.awayTeamId);
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("article", {
                                className: "h2k-card ptg-card",
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    gap: 12
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: 6
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        style: {
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            color: '#fb7185'
                                                        },
                                                        children: [
                                                            "CHAPTER ",
                                                            sc.order,
                                                            " \xb7 ",
                                                            sc.difficulty.toUpperCase()
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        style: {
                                                            fontSize: 14,
                                                            color: '#fbbf24'
                                                        },
                                                        children: [
                                                            '★'.repeat(prog.stars),
                                                            '☆'.repeat(3 - prog.stars)
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                style: {
                                                    margin: '0 0 4px',
                                                    fontFamily: 'Oswald, sans-serif',
                                                    fontSize: 22,
                                                    color: '#fef3c7'
                                                },
                                                children: sc.title
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "h2k-muted",
                                                style: {
                                                    marginBottom: 10
                                                },
                                                children: sc.subtitle
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                style: {
                                                    padding: 10,
                                                    borderRadius: 8,
                                                    background: 'rgba(12, 5, 9, 0.78)',
                                                    border: '1px solid rgba(245, 158, 11, 0.22)',
                                                    marginBottom: 10,
                                                    fontSize: 12
                                                },
                                                className: "h2k-tabular",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            marginBottom: 4
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                                children: [
                                                                    away.abbr,
                                                                    " ",
                                                                    sc.startAwayScore,
                                                                    " – ",
                                                                    home.abbr,
                                                                    " ",
                                                                    sc.startHomeScore
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                style: {
                                                                    color: '#fbbf24'
                                                                },
                                                                children: [
                                                                    "Q",
                                                                    sc.startQuarter,
                                                                    " \xb7 ",
                                                                    formatClock(sc.startClockSec)
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "h2k-muted",
                                                        children: sc.objectiveSummary
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                style: {
                                                    fontSize: 12,
                                                    color: '#cbd5e1'
                                                },
                                                className: "h2k-tabular",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        children: [
                                                            "Reward: ",
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                                style: {
                                                                    color: '#fbbf24'
                                                                },
                                                                children: [
                                                                    "+",
                                                                    sc.vcReward.toLocaleString(),
                                                                    " VC"
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        style: {
                                                            color: prog.trophyUnlocked ? '#4ade80' : '#94a3b8'
                                                        },
                                                        children: [
                                                            "Trophy: ",
                                                            prog.trophyUnlocked ? "\uD83C\uDFC6 " + sc.trophyName + " (Unlocked)" : sc.trophyName
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "h2k-mode-btn crimson",
                                        style: {
                                            width: '100%'
                                        },
                                        onClick: function onClick() {
                                            return launchScenario(sc);
                                        },
                                        children: prog.completed ? 'Replay Scenario in 3D' : 'Launch Crunch-Time 3D Scenario'
                                    })
                                ]
                            }, sc.id);
                        })
                    })
                ]
            })
        ]
    });
};

});

})(window.ArcadeMod);
