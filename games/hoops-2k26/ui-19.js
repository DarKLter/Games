(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/nba2k14/components/GameModesHubView ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/components/GameModesHubView", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GameModesHubView", {
    enumerable: true,
    get: function() {
        return GameModesHubView;
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
var GameModesHubView = function GameModesHubView(param) {
    var save = param.save, onUpdateSave = param.onUpdateSave, onStartMatch = param.onStartMatch;
    var _ref, _ref1;
    var _save_association_standings_assocUserTeam_id, _save_association_standings_assocUserTeam_id1, _assocUserTeam_players_, _tradePartnerTeam_players_;
    var _useState = (0, _react.useState)('association'), subMode = _useState[0], setSubMode = _useState[1];
    // Association setup & trade state
    var _useState1 = (0, _react.useState)(save.association.userTeamId || 'mia'), assocSetupTeam = _useState1[0], setAssocSetupTeam = _useState1[1];
    var _useState2 = (0, _react.useState)(save.association.seasonLength), assocLength = _useState2[0], setAssocLength = _useState2[1];
    var _useState3 = (0, _react.useState)('lal'), tradePartnerId = _useState3[0], setTradePartnerId = _useState3[1];
    var _useState4 = (0, _react.useState)(''), myTradePlayerId = _useState4[0], setMyTradePlayerId = _useState4[1];
    var _useState5 = (0, _react.useState)(''), partnerTradePlayerId = _useState5[0], setPartnerTradePlayerId = _useState5[1];
    var _useState6 = (0, _react.useState)(null), tradeMsg = _useState6[0], setTradeMsg = _useState6[1];
    // Playoffs setup state
    var _useState7 = (0, _react.useState)(save.playoffs.userTeamId || 'mia'), playoffTeamId = _useState7[0], setPlayoffTeamId = _useState7[1];
    var _useState8 = (0, _react.useState)(save.playoffs.bestOf), playoffBestOf = _useState8[0], setPlayoffBestOf = _useState8[1];
    // Blacktop state
    var _useState9 = (0, _react.useState)(3), btFormat = _useState9[0], setBtFormat = _useState9[1];
    var _useState10 = (0, _react.useState)(21), btTarget = _useState10[0], setBtTarget = _useState10[1];
    var _useState11 = (0, _react.useState)(true), btHalfCourt = _useState11[0], setBtHalfCourt = _useState11[1];
    var allPlayers = (0, _react.useMemo)(function() {
        return (0, _rosters.getAllPlayers)().sort(function(a, b) {
            return b.ovr - a.ovr;
        });
    }, []);
    var _useState12 = (0, _react.useState)(function() {
        return allPlayers.slice(0, 5).map(function(p) {
            return p.id;
        });
    }), btTeamAIds = _useState12[0], setBtTeamAIds = _useState12[1];
    var _useState13 = (0, _react.useState)(function() {
        return allPlayers.slice(5, 10).map(function(p) {
            return p.id;
        });
    }), btTeamBIds = _useState13[0], setBtTeamBIds = _useState13[1];
    // MyTEAM pack reveal state
    var _useState14 = (0, _react.useState)(null), packMessage = _useState14[0], setPackMessage = _useState14[1];
    var _useState15 = (0, _react.useState)('lineup'), myTeamSubTab = _useState15[0], setMyTeamSubTab = _useState15[1];
    var resolvedTeams = (0, _react.useMemo)(function() {
        return (0, _storage.getResolvedTeams)(save);
    }, [
        save
    ]);
    var assocUserTeam = (0, _react.useMemo)(function() {
        var _resolvedTeams_find;
        return (_resolvedTeams_find = resolvedTeams.find(function(t) {
            return t.id === save.association.userTeamId;
        })) != null ? _resolvedTeams_find : resolvedTeams[0];
    }, [
        resolvedTeams,
        save.association.userTeamId
    ]);
    var tradePartnerTeam = (0, _react.useMemo)(function() {
        var _resolvedTeams_find;
        return (_resolvedTeams_find = resolvedTeams.find(function(t) {
            return t.id === tradePartnerId;
        })) != null ? _resolvedTeams_find : resolvedTeams[1];
    }, [
        resolvedTeams,
        tradePartnerId
    ]);
    // ---------------- ASSOCIATION / MyGM ACTIONS ----------------
    var startAssociation = function startAssociation() {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        onUpdateSave(function(prev) {
            return _extends({}, prev, {
                lastMode: 'association',
                association: _extends({}, (0, _storage.createDefaultAssociation)(assocSetupTeam, assocLength), {
                    active: true
                })
            });
        });
    };
    var simAssociationDay = function simAssociationDay() {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('hover');
        onUpdateSave(function(prev) {
            var nextStandings = _extends({}, prev.association.standings);
            var ids = Object.keys(nextStandings);
            for(var i = 0; i < ids.length; i += 2){
                var aId = ids[i];
                var bId = ids[(i + prev.association.currentDay) % ids.length];
                if (!aId || !bId || aId === bId) continue;
                var aTeam = (0, _rosters.getTeamById)(aId);
                var bTeam = (0, _rosters.getTeamById)(bId);
                var aWinProb = 0.5 + (aTeam.ovr - bTeam.ovr) * 0.025;
                var aWins = Math.random() < aWinProb;
                if (nextStandings[aId].wins + nextStandings[aId].losses < prev.association.seasonLength) {
                    nextStandings[aId] = _extends({}, nextStandings[aId], {
                        wins: nextStandings[aId].wins + (aWins ? 1 : 0),
                        losses: nextStandings[aId].losses + (aWins ? 0 : 1)
                    });
                }
                if (nextStandings[bId].wins + nextStandings[bId].losses < prev.association.seasonLength) {
                    nextStandings[bId] = _extends({}, nextStandings[bId], {
                        wins: nextStandings[bId].wins + (aWins ? 0 : 1),
                        losses: nextStandings[bId].losses + (aWins ? 1 : 0)
                    });
                }
            }
            var userSt = nextStandings[prev.association.userTeamId];
            var trustDelta = userSt && userSt.wins >= userSt.losses ? 1 : -1;
            return _extends({}, prev, {
                association: _extends({}, prev.association, {
                    currentDay: prev.association.currentDay + 1,
                    standings: nextStandings,
                    ownerTrust: Math.max(20, Math.min(100, prev.association.ownerTrust + trustDelta))
                })
            });
        });
    };
    var executeGmTrade = function executeGmTrade() {
        var _assocUserTeam_players_find, _tradePartnerTeam_players_find;
        var p1 = (_assocUserTeam_players_find = assocUserTeam.players.find(function(p) {
            return p.id === myTradePlayerId;
        })) != null ? _assocUserTeam_players_find : assocUserTeam.players[0];
        var p2 = (_tradePartnerTeam_players_find = tradePartnerTeam.players.find(function(p) {
            return p.id === partnerTradePlayerId;
        })) != null ? _tradePartnerTeam_players_find : tradePartnerTeam.players[0];
        if (!p1 || !p2) return;
        if (Math.abs(p1.ovr - p2.ovr) > 10) {
            setTradeMsg(tradePartnerTeam.name + " GM declined: OVR gap (" + p1.ovr + " vs " + p2.ovr + ") is too wide.");
            return;
        }
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        setTradeMsg("TRADE OFFICIAL: " + p1.name + " to " + tradePartnerTeam.code + " for " + p2.name + "!");
        onUpdateSave(function(prev) {
            var _obj;
            return _extends({}, prev, {
                vip: _extends({}, prev.vip, {
                    unlockedAchievements: Array.from(new Set([].concat(prev.vip.unlockedAchievements, [
                        'gm_trade'
                    ])))
                }),
                teamTransfers: _extends({}, prev.teamTransfers, (_obj = {}, _obj[p1.id] = tradePartnerTeam.id, _obj[p2.id] = assocUserTeam.id, _obj)),
                association: _extends({}, prev.association, {
                    ownerTrust: Math.min(100, prev.association.ownerTrust + 3),
                    tradeHistory: [].concat([
                        assocUserTeam.code + " acquired " + p2.name + " (" + p2.ovr + ") for " + p1.name + " (" + p1.ovr + ")"
                    ], prev.association.tradeHistory)
                })
            });
        });
    };
    var signFreeAgent = function signFreeAgent(fa) {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        onUpdateSave(function(prev) {
            return _extends({}, prev, {
                customPlayers: [].concat(prev.customPlayers, [
                    _extends({}, fa, {
                        teamId: prev.association.userTeamId
                    })
                ]),
                association: _extends({}, prev.association, {
                    freeAgents: prev.association.freeAgents.filter(function(p) {
                        return p.id !== fa.id;
                    }),
                    tradeHistory: [].concat([
                        "Signed Free Agent " + fa.name + " (" + fa.ovr + " OVR)"
                    ], prev.association.tradeHistory)
                })
            });
        });
    };
    var playAssociationGame = function playAssociationGame() {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        var others = _rosters.NBA_TEAMS.filter(function(t) {
            return t.id !== assocUserTeam.id;
        });
        var opp = others[save.association.currentDay % others.length];
        onStartMatch({
            mode: 'association',
            title: "THE ASSOCIATION \xb7 DAY " + save.association.currentDay,
            subtitle: assocUserTeam.fullName + " vs " + opp.fullName,
            homeTeamId: assocUserTeam.id,
            awayTeamId: opp.id,
            homeCustomPlayers: assocUserTeam.players,
            userSide: 'home',
            courtEnv: 'nba',
            quarterLengthMin: save.settings.game.quarterLengthMin,
            playersPerSide: 5
        });
    };
    // ---------------- PLAYOFFS ACTIONS ----------------
    var startPlayoffs = function startPlayoffs() {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        onUpdateSave(function(prev) {
            return _extends({}, prev, {
                playoffs: _extends({}, (0, _storage.createDefaultPlayoffs)(playoffTeamId, playoffBestOf), {
                    active: true
                })
            });
        });
    };
    var advancePlayoffBrackets = function advancePlayoffBrackets(seriesList) {
        var _out_find, _out_find1;
        var out = [].concat(seriesList);
        var tryMakeRound = function tryMakeRound(round, conf) {
            var done = out.filter(function(s) {
                return s.round === round && s.conference === conf;
            });
            if (done.length === 0 || done.some(function(s) {
                return !s.winnerId;
            })) return;
            var nextRound = round + 1;
            if (out.some(function(s) {
                return s.round === nextRound && s.conference === conf;
            })) return;
            for(var i = 0; i < done.length; i += 2){
                var _done_i, _done_;
                if (((_done_i = done[i]) == null ? void 0 : _done_i.winnerId) && ((_done_ = done[i + 1]) == null ? void 0 : _done_.winnerId)) {
                    out.push({
                        id: conf.toLowerCase() + "_r" + nextRound + "_" + i,
                        round: nextRound,
                        conference: conf,
                        higherSeedId: done[i].winnerId,
                        lowerSeedId: done[i + 1].winnerId,
                        higherWins: 0,
                        lowerWins: 0,
                        winnerId: null
                    });
                }
            }
        };
        tryMakeRound(1, 'EAST');
        tryMakeRound(1, 'WEST');
        tryMakeRound(2, 'EAST');
        tryMakeRound(2, 'WEST');
        var eastChamp = (_out_find = out.find(function(s) {
            return s.round === 3 && s.conference === 'EAST';
        })) == null ? void 0 : _out_find.winnerId;
        var westChamp = (_out_find1 = out.find(function(s) {
            return s.round === 3 && s.conference === 'WEST';
        })) == null ? void 0 : _out_find1.winnerId;
        if (eastChamp && westChamp && !out.some(function(s) {
            return s.round === 4;
        })) {
            out.push({
                id: 'nba_finals_2014',
                round: 4,
                conference: 'FINALS',
                higherSeedId: eastChamp,
                lowerSeedId: westChamp,
                higherWins: 0,
                lowerWins: 0,
                winnerId: null
            });
        }
        return out;
    };
    var simPlayoffGame = function simPlayoffGame(seriesId) {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('hover');
        var needed = Math.ceil(save.playoffs.bestOf / 2);
        onUpdateSave(function(prev) {
            var wonSeries = false;
            var updated = prev.playoffs.series.map(function(s) {
                if (s.id !== seriesId || s.winnerId) return s;
                var hi = (0, _rosters.getTeamById)(s.higherSeedId);
                var lo = (0, _rosters.getTeamById)(s.lowerSeedId);
                var hiWin = Math.random() < 0.52 + (hi.ovr - lo.ovr) * 0.025;
                var hw = s.higherWins + (hiWin ? 1 : 0);
                var lw = s.lowerWins + (hiWin ? 0 : 1);
                var winnerId = hw >= needed ? s.higherSeedId : lw >= needed ? s.lowerSeedId : null;
                if (winnerId && winnerId === prev.playoffs.userTeamId) wonSeries = true;
                return _extends({}, s, {
                    higherWins: hw,
                    lowerWins: lw,
                    winnerId: winnerId
                });
            });
            return _extends({}, prev, {
                vip: wonSeries ? _extends({}, prev.vip, {
                    unlockedAchievements: Array.from(new Set([].concat(prev.vip.unlockedAchievements, [
                        'playoff_series'
                    ])))
                }) : prev.vip,
                playoffs: _extends({}, prev.playoffs, {
                    series: advancePlayoffBrackets(updated)
                })
            });
        });
    };
    // ---------------- MyTEAM ACTIONS ----------------
    var openStarterPack = function openStarterPack() {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        var startersPool = allPlayers.filter(function(p) {
            return p.ovr >= 74 && p.ovr <= 85;
        });
        var cards = [];
        for(var i = 0; i < 8; i++){
            var p = startersPool[(i * 11 + 3) % startersPool.length];
            cards.push((0, _storage.createMyTeamCardFromPlayer)(p, p.ovr >= 82 ? 'Silver' : 'Bronze'));
        }
        onUpdateSave(function(prev) {
            return _extends({}, prev, {
                myTeam: _extends({}, prev.myTeam, {
                    starterOpened: true,
                    collection: [].concat(prev.myTeam.collection, cards),
                    lineupCardIds: cards.slice(0, 5).map(function(c) {
                        return c.id;
                    })
                })
            });
        });
        setPackMessage('Starter Pack Opened! 8 Players added to your MyTEAM Collection.');
    };
    var buyMyTeamPack = function buyMyTeamPack(tier, vcCost) {
        if (save.vip.vc < vcCost) {
            setPackMessage("Need " + vcCost.toLocaleString() + " VC to open a " + tier + " Pack.");
            return;
        }
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        var pool = tier === 'Historic' ? allPlayers.filter(function(p) {
            return p.teamId.startsWith('cls_') || p.ovr >= 91;
        }) : tier === 'Gold' ? allPlayers.filter(function(p) {
            return p.ovr >= 85;
        }) : tier === 'Silver' ? allPlayers.filter(function(p) {
            return p.ovr >= 77 && p.ovr < 86;
        }) : allPlayers.filter(function(p) {
            return p.ovr < 79;
        });
        var pulled = [];
        for(var i = 0; i < 3; i++){
            var _pool_Math_floor;
            var pick = (_pool_Math_floor = pool[Math.floor(Math.random() * pool.length)]) != null ? _pool_Math_floor : allPlayers[0];
            pulled.push((0, _storage.createMyTeamCardFromPlayer)(pick, tier));
        }
        onUpdateSave(function(prev) {
            return _extends({}, prev, {
                vip: _extends({}, prev.vip, {
                    vc: prev.vip.vc - vcCost,
                    unlockedAchievements: Array.from(new Set([].concat(prev.vip.unlockedAchievements, [
                        'myteam_pack'
                    ])))
                }),
                myTeam: _extends({}, prev.myTeam, {
                    collection: [].concat(pulled, prev.myTeam.collection),
                    lineupCardIds: prev.myTeam.lineupCardIds.length < 5 ? [].concat(prev.myTeam.lineupCardIds, pulled.map(function(c) {
                        return c.id;
                    })).slice(0, 5) : prev.myTeam.lineupCardIds
                })
            });
        });
        setPackMessage("Pulled " + tier + " Pack: " + pulled.map(function(c) {
            return c.player.name + " (" + c.player.ovr + ")";
        }).join(' · '));
    };
    var toggleLineupCard = function toggleLineupCard(cardId) {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('hover');
        onUpdateSave(function(prev) {
            var cur = prev.myTeam.lineupCardIds;
            var next = cur.includes(cardId) ? cur.filter(function(id) {
                return id !== cardId;
            }) : cur.length < 8 ? [].concat(cur, [
                cardId
            ]) : cur;
            return _extends({}, prev, {
                myTeam: _extends({}, prev.myTeam, {
                    lineupCardIds: next
                })
            });
        });
    };
    var launchMyTeamMatch = function launchMyTeamMatch(oppTeamId, isDomination) {
        var lineupPlayers = save.myTeam.lineupCardIds.map(function(id) {
            var _save_myTeam_collection_find;
            return (_save_myTeam_collection_find = save.myTeam.collection.find(function(c) {
                return c.id === id;
            })) == null ? void 0 : _save_myTeam_collection_find.player;
        }).filter(function(p) {
            return Boolean(p);
        });
        if (lineupPlayers.length < 5) {
            setPackMessage('Select at least 5 cards in your MyTEAM Lineup before tipping off.');
            return;
        }
        var opp = (0, _rosters.getTeamById)(oppTeamId);
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        onStartMatch({
            mode: 'myteam',
            title: isDomination ? "MyTEAM DOMINATION vs " + opp.code : "ROAD TO THE PLAYOFFS \xb7 SEED " + save.myTeam.rttpSeed,
            subtitle: save.vip.name + " MyTEAM vs " + opp.fullName,
            homeTeamId: save.vip.favTeamId || 'mia',
            awayTeamId: opp.id,
            homeCustomPlayers: lineupPlayers,
            userSide: 'home',
            courtEnv: 'nba',
            quarterLengthMin: save.settings.game.quarterLengthMin,
            playersPerSide: 5,
            myTeamDominationTeamId: isDomination ? opp.id : undefined
        });
    };
    var standingsSorted = (0, _react.useMemo)(function() {
        return Object.values(save.association.standings).map(function(st) {
            return _extends({}, st, {
                team: (0, _rosters.getTeamById)(st.teamId)
            });
        }).sort(function(a, b) {
            return b.wins - a.wins || a.losses - b.losses || b.team.ovr - a.team.ovr;
        });
    }, [
        save.association.standings
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h-full flex flex-col px-5 py-3 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl px-4 py-2.5 mb-3 flex flex-wrap items-center justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "text-xs font-black uppercase tracking-[0.2em] text-[#F9A01B]",
                        children: "NBA 2K14 \xb7 GAME MODES HUB"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "flex flex-wrap gap-1.5",
                        children: [
                            {
                                id: 'association',
                                label: 'Association / MyGM',
                                icon: _lucidereact.Briefcase
                            },
                            {
                                id: 'playoffs',
                                label: 'Playoffs',
                                icon: _lucidereact.Trophy
                            },
                            {
                                id: 'blacktop',
                                label: 'NBA Blacktop & Contests',
                                icon: _lucidereact.Flame
                            },
                            {
                                id: 'myteam',
                                label: 'MyTEAM',
                                icon: _lucidereact.Layers
                            },
                            {
                                id: 'training',
                                label: 'Training Camp',
                                icon: _lucidereact.Dumbbell
                            }
                        ].map(function(item) {
                            var Icon = item.icon;
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    _Nba2k14Audio.Nba2k14Audio.playUiClick('hover');
                                    setSubMode(item.id);
                                },
                                className: "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border cursor-pointer transition " + (subMode === item.id ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#171a22] border-white/10 text-zinc-300 hover:border-white/30'),
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(Icon, {
                                        className: "w-3.5 h-3.5"
                                    }),
                                    " ",
                                    item.label
                                ]
                            }, item.id);
                        })
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "flex-1 min-h-0 overflow-y-auto",
                children: [
                    subMode === 'association' && (!save.association.active ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "max-w-3xl mx-auto bg-[#0f1116]/94 border border-white/15 rounded-xl p-6",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                className: "text-xl font-black text-white uppercase",
                                children: "LAUNCH THE ASSOCIATION / MyGM"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                className: "text-xs text-zinc-400 mt-1",
                                children: "Control all 30 NBA franchises, negotiate trades, sign free agents, manage rotation minutes, and satisfy Ownership goals."
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 gap-4 my-5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[11px] font-bold uppercase text-zinc-400",
                                                children: "Select Franchise"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                value: assocSetupTeam,
                                                onChange: function onChange(e) {
                                                    return setAssocSetupTeam(e.target.value);
                                                },
                                                className: "mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-bold text-white",
                                                children: _rosters.NBA_TEAMS.map(function(t) {
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
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[11px] font-bold uppercase text-zinc-400",
                                                children: "Season Length"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "mt-1 grid grid-cols-3 gap-2",
                                                children: [
                                                    14,
                                                    29,
                                                    82
                                                ].map(function(len) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        onClick: function onClick() {
                                                            return setAssocLength(len);
                                                        },
                                                        className: "py-2 rounded-lg text-xs font-black border cursor-pointer " + (assocLength === len ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#171a22] border-white/10 text-zinc-300'),
                                                        children: [
                                                            len,
                                                            " Games"
                                                        ]
                                                    }, len);
                                                })
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: startAssociation,
                                className: "w-full py-3 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase text-sm tracking-wider cursor-pointer",
                                children: "Begin Franchise Season"
                            })
                        ]
                    }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-4",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "text-[10px] font-black uppercase text-[#F9A01B]",
                                                        children: [
                                                            "FRONT OFFICE \xb7 DAY ",
                                                            save.association.currentDay
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "text-xs font-black text-emerald-400",
                                                        children: [
                                                            "Trust ",
                                                            save.association.ownerTrust,
                                                            "%"
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-lg font-black text-white mt-1",
                                                children: assocUserTeam.fullName
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-xs text-zinc-400 mt-0.5",
                                                children: [
                                                    "Record: ",
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                        className: "text-white",
                                                        children: [
                                                            (_ref = (_save_association_standings_assocUserTeam_id = save.association.standings[assocUserTeam.id]) == null ? void 0 : _save_association_standings_assocUserTeam_id.wins) != null ? _ref : 0,
                                                            "-",
                                                            (_ref1 = (_save_association_standings_assocUserTeam_id1 = save.association.standings[assocUserTeam.id]) == null ? void 0 : _save_association_standings_assocUserTeam_id1.losses) != null ? _ref1 : 0
                                                        ]
                                                    }),
                                                    " (",
                                                    save.association.seasonLength,
                                                    "G Season)"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "mt-3 p-2.5 rounded-lg bg-[#151820] border border-white/10 text-xs text-zinc-300",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-[#F9A01B] font-bold",
                                                        children: "Owner Goal:"
                                                    }),
                                                    " ",
                                                    save.association.ownerGoal
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "mt-3 flex gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: playAssociationGame,
                                                        className: "flex-1 py-2.5 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-xs uppercase cursor-pointer",
                                                        children: "Play Next Game"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: simAssociationDay,
                                                        className: "px-3 py-2.5 rounded-lg bg-[#1c202a] hover:bg-[#262b38] border border-white/15 text-white font-bold text-xs uppercase cursor-pointer",
                                                        children: "Sim Day"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-4",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-xs font-black uppercase text-[#F9A01B] mb-2",
                                                children: "Free Agent Pool"
                                            }),
                                            save.association.freeAgents.length === 0 ? /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-xs text-zinc-500",
                                                children: "All headline free agents signed."
                                            }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "space-y-2",
                                                children: save.association.freeAgents.map(function(fa) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "bg-[#151820] border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between text-xs",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                        className: "font-bold text-white",
                                                                        children: fa.name
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                        className: "text-[10px] text-zinc-400",
                                                                        children: [
                                                                            fa.pos,
                                                                            " \xb7 ",
                                                                            fa.ovr,
                                                                            " OVR"
                                                                        ]
                                                                    })
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                onClick: function onClick() {
                                                                    return signFreeAgent(fa);
                                                                },
                                                                className: "px-2.5 py-1 rounded bg-emerald-600/30 border border-emerald-400/50 text-emerald-200 text-[10px] font-black uppercase cursor-pointer",
                                                                children: "Sign"
                                                            })
                                                        ]
                                                    }, fa.id);
                                                })
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-4 space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-xs font-black uppercase text-[#F9A01B] mb-2 flex items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.ArrowLeftRight, {
                                                        className: "w-3.5 h-3.5"
                                                    }),
                                                    " Trade Finder"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                        value: myTradePlayerId || ((_assocUserTeam_players_ = assocUserTeam.players[0]) == null ? void 0 : _assocUserTeam_players_.id),
                                                        onChange: function onChange(e) {
                                                            return setMyTradePlayerId(e.target.value);
                                                        },
                                                        className: "w-full bg-[#171a22] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold",
                                                        children: assocUserTeam.players.map(function(p) {
                                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                                value: p.id,
                                                                children: [
                                                                    "SEND: ",
                                                                    p.name,
                                                                    " (",
                                                                    p.pos,
                                                                    ", ",
                                                                    p.ovr,
                                                                    ")"
                                                                ]
                                                            }, p.id);
                                                        })
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                        value: tradePartnerId,
                                                        onChange: function onChange(e) {
                                                            setTradePartnerId(e.target.value);
                                                            setPartnerTradePlayerId('');
                                                        },
                                                        className: "w-full bg-[#171a22] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 font-bold",
                                                        children: _rosters.NBA_TEAMS.filter(function(t) {
                                                            return t.id !== assocUserTeam.id;
                                                        }).map(function(t) {
                                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                                value: t.id,
                                                                children: [
                                                                    "PARTNER: ",
                                                                    t.fullName
                                                                ]
                                                            }, t.id);
                                                        })
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                        value: partnerTradePlayerId || ((_tradePartnerTeam_players_ = tradePartnerTeam.players[0]) == null ? void 0 : _tradePartnerTeam_players_.id),
                                                        onChange: function onChange(e) {
                                                            return setPartnerTradePlayerId(e.target.value);
                                                        },
                                                        className: "w-full bg-[#171a22] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold",
                                                        children: tradePartnerTeam.players.map(function(p) {
                                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                                value: p.id,
                                                                children: [
                                                                    "RECEIVE: ",
                                                                    p.name,
                                                                    " (",
                                                                    p.pos,
                                                                    ", ",
                                                                    p.ovr,
                                                                    ")"
                                                                ]
                                                            }, p.id);
                                                        })
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: executeGmTrade,
                                                        className: "w-full py-2 rounded-lg bg-[#F9A01B] hover:bg-amber-400 text-black font-black text-xs uppercase cursor-pointer",
                                                        children: "Propose Trade"
                                                    }),
                                                    tradeMsg && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[11px] font-bold text-amber-300",
                                                        children: tradeMsg
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "border-t border-white/10 pt-3",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-xs font-black uppercase text-[#F9A01B] mb-2",
                                                children: "Rotation Minutes"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "space-y-1.5 max-h-48 overflow-y-auto pr-1",
                                                children: assocUserTeam.players.slice(0, 8).map(function(p) {
                                                    var _save_association_rotationMinutes_p_id;
                                                    var mins = (_save_association_rotationMinutes_p_id = save.association.rotationMinutes[p.id]) != null ? _save_association_rotationMinutes_p_id : 24;
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex items-center gap-2 text-xs",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "w-28 truncate text-zinc-200 font-bold",
                                                                children: p.name
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                                type: "range",
                                                                min: 0,
                                                                max: 42,
                                                                value: mins,
                                                                onChange: function onChange(e) {
                                                                    var v = Number(e.target.value);
                                                                    onUpdateSave(function(prev) {
                                                                        var _obj;
                                                                        return _extends({}, prev, {
                                                                            association: _extends({}, prev.association, {
                                                                                rotationMinutes: _extends({}, prev.association.rotationMinutes, (_obj = {}, _obj[p.id] = v, _obj))
                                                                            })
                                                                        });
                                                                    });
                                                                },
                                                                className: "flex-1 accent-[#CE1141]"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                className: "w-8 text-right font-black text-white",
                                                                children: [
                                                                    mins,
                                                                    "m"
                                                                ]
                                                            })
                                                        ]
                                                    }, p.id);
                                                })
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-xs font-black uppercase text-[#F9A01B] mb-2",
                                        children: "NBA League Standings"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "max-h-96 overflow-y-auto pr-1",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("table", {
                                            className: "w-full text-xs",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("thead", {
                                                    children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                        className: "text-zinc-400 border-b border-white/10 text-left",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                className: "py-1",
                                                                children: "Team"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                className: "py-1 text-right",
                                                                children: "W"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                className: "py-1 text-right",
                                                                children: "L"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                                className: "py-1 text-right",
                                                                children: "OVR"
                                                            })
                                                        ]
                                                    })
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("tbody", {
                                                    children: standingsSorted.map(function(row) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                            className: "border-b border-white/5 " + (row.teamId === assocUserTeam.id ? 'text-[#F9A01B] font-black' : 'text-zinc-200'),
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                                    className: "py-1.5",
                                                                    children: [
                                                                        row.team.code,
                                                                        " \xb7 ",
                                                                        row.team.name
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                    className: "py-1.5 text-right",
                                                                    children: row.wins
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                    className: "py-1.5 text-right",
                                                                    children: row.losses
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                    className: "py-1.5 text-right text-zinc-400",
                                                                    children: row.team.ovr
                                                                })
                                                            ]
                                                        }, row.teamId);
                                                    })
                                                })
                                            ]
                                        })
                                    })
                                ]
                            })
                        ]
                    })),
                    subMode === 'playoffs' && (!save.playoffs.active ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "max-w-2xl mx-auto bg-[#0f1116]/94 border border-white/15 rounded-xl p-6",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                className: "text-xl font-black text-white uppercase",
                                children: "2014 NBA PLAYOFFS BRACKET"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                className: "text-xs text-zinc-400 mt-1",
                                children: "16-Team Championship Bracket. Play any matchup in 3D or simulate games round by round through the NBA Finals."
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "grid grid-cols-2 gap-4 my-5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[11px] font-bold uppercase text-zinc-400",
                                                children: "Your Team"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                value: playoffTeamId,
                                                onChange: function onChange(e) {
                                                    return setPlayoffTeamId(e.target.value);
                                                },
                                                className: "mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-bold text-white",
                                                children: _rosters.NBA_TEAMS.map(function(t) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                        value: t.id,
                                                        children: [
                                                            t.fullName,
                                                            " (",
                                                            t.ovr,
                                                            ")"
                                                        ]
                                                    }, t.id);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[11px] font-bold uppercase text-zinc-400",
                                                children: "Series Format"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "mt-1 grid grid-cols-4 gap-1.5",
                                                children: [
                                                    1,
                                                    3,
                                                    5,
                                                    7
                                                ].map(function(bo) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        onClick: function onClick() {
                                                            return setPlayoffBestOf(bo);
                                                        },
                                                        className: "py-2 rounded-lg text-xs font-black border cursor-pointer " + (playoffBestOf === bo ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#171a22] border-white/10 text-zinc-300'),
                                                        children: [
                                                            "Bo",
                                                            bo
                                                        ]
                                                    }, bo);
                                                })
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: startPlayoffs,
                                className: "w-full py-3 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase text-sm tracking-wider cursor-pointer",
                                children: "Generate 16-Team Playoff Bracket"
                            })
                        ]
                    }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-between bg-[#0f1116]/94 border border-white/15 rounded-xl px-4 py-2.5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-xs font-black text-white uppercase",
                                        children: [
                                            "NBA Playoffs \xb7 Best of ",
                                            save.playoffs.bestOf
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: startPlayoffs,
                                        className: "px-3 py-1 rounded bg-[#1c202a] border border-white/15 text-[11px] font-bold text-zinc-300 hover:text-white uppercase cursor-pointer",
                                        children: "Reset Bracket"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3",
                                children: save.playoffs.series.map(function(s) {
                                    var hi = (0, _rosters.getTeamById)(s.higherSeedId);
                                    var lo = (0, _rosters.getTeamById)(s.lowerSeedId);
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "rounded-xl p-3.5 border " + (s.conference === 'FINALS' ? 'bg-[#211810] border-[#F9A01B]' : 'bg-[#0f1116]/94 border-white/15'),
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex justify-between text-[10px] font-black uppercase text-[#F9A01B] mb-2",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: s.conference === 'FINALS' ? 'NBA FINALS' : s.conference + " R" + s.round
                                                    }),
                                                    s.winnerId && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "text-emerald-400",
                                                        children: [
                                                            "WINNER: ",
                                                            (0, _rosters.getTeamById)(s.winnerId).code
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "space-y-1.5 text-xs",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex justify-between bg-[#151820] px-2.5 py-1.5 rounded",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                className: "font-bold text-white",
                                                                children: [
                                                                    hi.code,
                                                                    " \xb7 ",
                                                                    hi.name
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "font-black text-[#F9A01B]",
                                                                children: s.higherWins
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex justify-between bg-[#151820] px-2.5 py-1.5 rounded",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                className: "font-bold text-white",
                                                                children: [
                                                                    lo.code,
                                                                    " \xb7 ",
                                                                    lo.name
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "font-black text-[#F9A01B]",
                                                                children: s.lowerWins
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            !s.winnerId && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "mt-2.5 flex gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: function onClick() {
                                                            _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                                            onStartMatch({
                                                                mode: 'playoffs',
                                                                title: "PLAYOFFS " + s.conference + " R" + s.round,
                                                                subtitle: hi.code + " (" + s.higherWins + ") vs " + lo.code + " (" + s.lowerWins + ")",
                                                                homeTeamId: hi.id,
                                                                awayTeamId: lo.id,
                                                                userSide: lo.id === save.playoffs.userTeamId ? 'away' : 'home',
                                                                courtEnv: 'nba',
                                                                quarterLengthMin: save.settings.game.quarterLengthMin,
                                                                playersPerSide: 5,
                                                                playoffSeriesId: s.id
                                                            });
                                                        },
                                                        className: "flex-1 py-1.5 rounded bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-[10px] uppercase cursor-pointer",
                                                        children: "Play"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: function onClick() {
                                                            return simPlayoffGame(s.id);
                                                        },
                                                        className: "flex-1 py-1.5 rounded bg-[#1c202a] hover:bg-[#262b38] border border-white/15 text-zinc-200 font-bold text-[10px] uppercase cursor-pointer",
                                                        children: "Sim Game"
                                                    })
                                                ]
                                            })
                                        ]
                                    }, s.id);
                                })
                            })
                        ]
                    })),
                    subMode === 'blacktop' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lg:col-span-2 bg-[#0f1116]/94 border border-white/15 rounded-xl p-5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex flex-wrap items-center justify-between gap-3 mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[11px] font-black uppercase tracking-wider text-[#F9A01B]",
                                                        children: "STREETBALL & ALL-STAR EVENTS"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                                        className: "text-lg font-black text-white uppercase",
                                                        children: "NBA BLACKTOP PICKUP"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "flex gap-1.5",
                                                children: [
                                                    1,
                                                    2,
                                                    3,
                                                    4,
                                                    5
                                                ].map(function(n) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        onClick: function onClick() {
                                                            return setBtFormat(n);
                                                        },
                                                        className: "px-3 py-1.5 rounded-lg text-xs font-black border cursor-pointer " + (btFormat === n ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#171a22] border-white/10 text-zinc-300'),
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
                                        className: "flex flex-wrap items-center gap-4 mb-4 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-zinc-400 font-bold uppercase",
                                                        children: "Game To:"
                                                    }),
                                                    [
                                                        7,
                                                        11,
                                                        15,
                                                        21,
                                                        50
                                                    ].map(function(pts) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            onClick: function onClick() {
                                                                return setBtTarget(pts);
                                                            },
                                                            className: "px-2.5 py-1 rounded font-black cursor-pointer " + (btTarget === pts ? 'bg-[#F9A01B] text-black' : 'bg-[#171a22] text-zinc-300'),
                                                            children: pts
                                                        }, pts);
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                onClick: function onClick() {
                                                    return setBtHalfCourt(!btHalfCourt);
                                                },
                                                className: "px-3 py-1 rounded bg-[#171a22] border border-white/15 text-zinc-200 font-bold uppercase cursor-pointer",
                                                children: [
                                                    "Court: ",
                                                    btHalfCourt ? 'Half-Court' : 'Full-Court'
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4",
                                        children: [
                                            {
                                                title: 'YOUR SQUAD (TEAM A)',
                                                ids: btTeamAIds,
                                                setIds: setBtTeamAIds
                                            },
                                            {
                                                title: 'CPU SQUAD (TEAM B)',
                                                ids: btTeamBIds,
                                                setIds: setBtTeamBIds
                                            }
                                        ].map(function(side) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "bg-[#151820] border border-white/10 rounded-xl p-3 space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[11px] font-black text-[#F9A01B] uppercase",
                                                        children: side.title
                                                    }),
                                                    Array.from({
                                                        length: btFormat
                                                    }).map(function(_, slotIdx) {
                                                        var _side_ids_slotIdx;
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                            value: (_side_ids_slotIdx = side.ids[slotIdx]) != null ? _side_ids_slotIdx : allPlayers[slotIdx].id,
                                                            onChange: function onChange(e) {
                                                                var next = [].concat(side.ids);
                                                                next[slotIdx] = e.target.value;
                                                                side.setIds(next);
                                                            },
                                                            className: "w-full bg-[#1c202a] border border-white/10 rounded px-2.5 py-1.5 text-xs font-bold text-white",
                                                            children: allPlayers.slice(0, 60).map(function(p) {
                                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                                    value: p.id,
                                                                    children: [
                                                                        p.name,
                                                                        " (",
                                                                        p.pos,
                                                                        " \xb7 ",
                                                                        p.ovr,
                                                                        " OVR)"
                                                                    ]
                                                                }, p.id);
                                                            })
                                                        }, slotIdx);
                                                    })
                                                ]
                                            }, side.title);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        onClick: function onClick() {
                                            _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                            var squadA = btTeamAIds.slice(0, btFormat).map(function(id) {
                                                var _allPlayers_find;
                                                return (_allPlayers_find = allPlayers.find(function(p) {
                                                    return p.id === id;
                                                })) != null ? _allPlayers_find : allPlayers[0];
                                            });
                                            var squadB = btTeamBIds.slice(0, btFormat).map(function(id) {
                                                var _allPlayers_find;
                                                return (_allPlayers_find = allPlayers.find(function(p) {
                                                    return p.id === id;
                                                })) != null ? _allPlayers_find : allPlayers[1];
                                            });
                                            onStartMatch({
                                                mode: 'blacktop',
                                                title: "NBA BLACKTOP " + btFormat + "v" + btFormat,
                                                subtitle: "Game to " + btTarget + " \xb7 Outdoor Concrete Blacktop",
                                                homeTeamId: 'mia',
                                                awayTeamId: 'okc',
                                                homeCustomPlayers: squadA,
                                                awayCustomPlayers: squadB,
                                                userSide: 'home',
                                                courtEnv: 'blacktop',
                                                quarterLengthMin: 12,
                                                targetScore: btTarget,
                                                halfCourt: btHalfCourt,
                                                playersPerSide: btFormat
                                            });
                                        },
                                        className: "w-full py-3 rounded-xl bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Play, {
                                                className: "w-4 h-4 fill-current"
                                            }),
                                            " Tip Off Blacktop ",
                                            btFormat,
                                            "v",
                                            btFormat
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "bg-[#0f1116]/94 border border-[#F9A01B]/40 rounded-xl p-5",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[10px] font-black uppercase tracking-widest text-[#F9A01B]",
                                                children: "ALL-STAR SATURDAY"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                className: "text-lg font-black text-white uppercase mt-1",
                                                children: "3-POINT SHOOTOUT"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                className: "text-xs text-zinc-400 mt-1",
                                                children: "5 racks (25 balls including 2-pt Money Balls) in 60 seconds. Nail green releases from all 5 perimeter stations!"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _allPlayers_find;
                                                    _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                                    var curry = (_allPlayers_find = allPlayers.find(function(p) {
                                                        return p.name.includes('Stephen Curry');
                                                    })) != null ? _allPlayers_find : allPlayers[0];
                                                    onStartMatch({
                                                        mode: 'shootout3pt',
                                                        title: '3-POINT SHOOTOUT',
                                                        subtitle: '5 Racks · 25 Balls · 60 Seconds',
                                                        homeTeamId: 'gsw',
                                                        awayTeamId: 'mia',
                                                        homeCustomPlayers: [
                                                            curry
                                                        ],
                                                        userSide: 'home',
                                                        courtEnv: 'nba',
                                                        quarterLengthMin: 1,
                                                        playersPerSide: 1,
                                                        halfCourt: true
                                                    });
                                                },
                                                className: "mt-4 w-full py-2.5 rounded-lg bg-[#F9A01B] hover:bg-amber-400 text-black font-black text-xs uppercase cursor-pointer",
                                                children: "Launch 3-Point Shootout"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "bg-[#0f1116]/94 border border-[#CE1141]/50 rounded-xl p-5",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[10px] font-black uppercase tracking-widest text-[#CE1141]",
                                                children: "SPRITE SLAM DUNK"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                className: "text-lg font-black text-white uppercase mt-1",
                                                children: "SLAM DUNK CONTEST"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                className: "text-xs text-zinc-400 mt-1",
                                                children: "Choose signature aerial slams (Tomahawk, 360 Windmill, Eastbay, Free-Throw Line), hit the timing meter, and earn a 50 from the 5 judges."
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _allPlayers_find;
                                                    _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                                    var lbj = (_allPlayers_find = allPlayers.find(function(p) {
                                                        return p.name.includes('LeBron James');
                                                    })) != null ? _allPlayers_find : allPlayers[0];
                                                    onStartMatch({
                                                        mode: 'dunkcontest',
                                                        title: 'SPRITE SLAM DUNK CONTEST',
                                                        subtitle: '5-Judge Panel · Signature Aerial Slams',
                                                        homeTeamId: 'mia',
                                                        awayTeamId: 'lac',
                                                        homeCustomPlayers: [
                                                            lbj
                                                        ],
                                                        userSide: 'home',
                                                        courtEnv: 'nba',
                                                        quarterLengthMin: 2,
                                                        playersPerSide: 1,
                                                        halfCourt: true
                                                    });
                                                },
                                                className: "mt-4 w-full py-2.5 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-xs uppercase cursor-pointer",
                                                children: "Launch Slam Dunk Contest"
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    subMode === 'myteam' && (!save.myTeam.starterOpened ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "max-w-2xl mx-auto bg-[#0f1116]/94 border border-[#F9A01B]/40 rounded-xl p-7 text-center",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Sparkles, {
                                className: "w-10 h-10 text-[#F9A01B] mx-auto"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                className: "text-2xl font-black text-white uppercase mt-2",
                                children: "WELCOME TO NBA 2K14 MyTEAM"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                className: "text-xs text-zinc-300 mt-2",
                                children: "Open your free 8-Card Starter Pack to build your dream lineup, pull Gold & Historic packs, conquer 30-Team Domination, and climb Road to the Playoffs."
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: openStarterPack,
                                className: "mt-5 px-8 py-3 rounded-xl bg-[#F9A01B] hover:bg-amber-400 text-black font-black uppercase text-sm tracking-wider cursor-pointer",
                                children: "Open Free Starter Pack (8 Cards)"
                            })
                        ]
                    }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "flex gap-1.5",
                                        children: [
                                            {
                                                id: 'lineup',
                                                label: "Lineup (" + save.myTeam.lineupCardIds.length + "/8)"
                                            },
                                            {
                                                id: 'packs',
                                                label: 'Pack Market'
                                            },
                                            {
                                                id: 'domination',
                                                label: '30-Team Domination'
                                            },
                                            {
                                                id: 'rttp',
                                                label: "RTTP (Seed " + save.myTeam.rttpSeed + ")"
                                            }
                                        ].map(function(t) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    return setMyTeamSubTab(t.id);
                                                },
                                                className: "px-3 py-1.5 rounded-lg text-xs font-black uppercase cursor-pointer " + (myTeamSubTab === t.id ? 'bg-[#CE1141] text-white' : 'bg-[#171a22] text-zinc-300'),
                                                children: t.label
                                            }, t.id);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-xs font-bold text-zinc-300",
                                        children: [
                                            "VC: ",
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                className: "text-[#F9A01B]",
                                                children: save.vip.vc.toLocaleString()
                                            }),
                                            " \xb7 MT: ",
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                className: "text-emerald-400",
                                                children: save.vip.mt.toLocaleString()
                                            })
                                        ]
                                    })
                                ]
                            }),
                            packMessage && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "bg-amber-500/15 border border-[#F9A01B] rounded-lg px-4 py-2 text-xs font-bold text-[#F9A01B]",
                                children: packMessage
                            }),
                            myTeamSubTab === 'lineup' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-xs text-zinc-400 mb-3",
                                        children: "Click cards to add/remove from your active lineup (minimum 5 starters required)."
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3",
                                        children: save.myTeam.collection.map(function(card) {
                                            var active = save.myTeam.lineupCardIds.includes(card.id);
                                            var tierBorder = card.tier === 'Historic' ? 'border-purple-400 bg-[#22162e]' : card.tier === 'Gold' ? 'border-[#F9A01B] bg-[#251e10]' : card.tier === 'Silver' ? 'border-zinc-300 bg-[#1d2028]' : 'border-amber-700 bg-[#1c1612]';
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                onClick: function onClick() {
                                                    return toggleLineupCard(card.id);
                                                },
                                                className: "rounded-xl p-3 border-2 text-left transition cursor-pointer " + tierBorder + " " + (active ? 'ring-2 ring-emerald-400' : 'opacity-80 hover:opacity-100'),
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex justify-between items-center",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "text-xl font-black text-white",
                                                                children: card.player.ovr
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-black/50 text-zinc-200",
                                                                children: card.player.pos
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-xs font-black text-white mt-2 truncate",
                                                        children: card.player.name
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "text-[10px] text-zinc-400 uppercase font-bold",
                                                        children: [
                                                            card.tier,
                                                            " \xb7 ",
                                                            card.teamCode
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "mt-2 text-[10px] font-black uppercase text-emerald-400",
                                                        children: active ? 'IN LINEUP' : '+ ADD'
                                                    })
                                                ]
                                            }, card.id);
                                        })
                                    })
                                ]
                            }),
                            myTeamSubTab === 'packs' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
                                children: [
                                    {
                                        tier: 'Bronze',
                                        cost: 500,
                                        desc: '3 Bronze NBA Player Cards',
                                        col: 'border-amber-700'
                                    },
                                    {
                                        tier: 'Silver',
                                        cost: 1200,
                                        desc: '3 Silver Rotation Stars (77-85 OVR)',
                                        col: 'border-zinc-300'
                                    },
                                    {
                                        tier: 'Gold',
                                        cost: 2500,
                                        desc: '3 Gold Superstars (85+ OVR)',
                                        col: 'border-[#F9A01B]'
                                    },
                                    {
                                        tier: 'Historic',
                                        cost: 4000,
                                        desc: '3 Classic Legends & 91+ Icons',
                                        col: 'border-purple-400'
                                    }
                                ].map(function(pk) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "bg-[#0f1116]/94 border-2 " + pk.col + " rounded-xl p-5 flex flex-col justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "text-xs font-black uppercase text-[#F9A01B]",
                                                        children: [
                                                            pk.tier,
                                                            " PACK"
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "text-2xl font-black text-white mt-1",
                                                        children: [
                                                            pk.cost.toLocaleString(),
                                                            " VC"
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                        className: "text-xs text-zinc-400 mt-2",
                                                        children: pk.desc
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    return buyMyTeamPack(pk.tier, pk.cost);
                                                },
                                                className: "mt-4 w-full py-2.5 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-xs uppercase cursor-pointer",
                                                children: "Open Pack"
                                            })
                                        ]
                                    }, pk.tier);
                                })
                            }),
                            myTeamSubTab === 'domination' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5",
                                children: _rosters.NBA_TEAMS.map(function(team) {
                                    var _save_myTeam_dominationStars_team_id;
                                    var stars = (_save_myTeam_dominationStars_team_id = save.myTeam.dominationStars[team.id]) != null ? _save_myTeam_dominationStars_team_id : 0;
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-3 flex flex-col justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex justify-between items-center",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "font-black text-white text-sm",
                                                                children: team.code
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                className: "text-[10px] font-bold text-zinc-400",
                                                                children: [
                                                                    team.ovr,
                                                                    " OVR"
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[11px] text-zinc-300 truncate",
                                                        children: team.name
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "flex gap-0.5 mt-1.5",
                                                        children: [
                                                            1,
                                                            2,
                                                            3
                                                        ].map(function(s) {
                                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Star, {
                                                                className: "w-3.5 h-3.5 " + (stars >= s ? 'text-[#F9A01B] fill-[#F9A01B]' : 'text-zinc-700')
                                                            }, s);
                                                        })
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    return launchMyTeamMatch(team.id, true);
                                                },
                                                className: "mt-2.5 w-full py-1.5 rounded bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-[10px] uppercase cursor-pointer",
                                                children: "Challenge"
                                            })
                                        ]
                                    }, team.id);
                                })
                            }),
                            myTeamSubTab === 'rttp' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-6 max-w-2xl",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-xs font-black uppercase text-[#F9A01B]",
                                        children: "ROAD TO THE PLAYOFFS"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                        className: "text-2xl font-black text-white mt-1",
                                        children: [
                                            "CURRENT SEED: #",
                                            save.myTeam.rttpSeed
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("p", {
                                        className: "text-xs text-zinc-400 mt-1",
                                        children: [
                                            "Win 2 games per tier to advance from Seed #8 all the way to Seed #1 Championship Division. Wins so far: ",
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                className: "text-white",
                                                children: save.myTeam.rttpWins
                                            }),
                                            "."
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        onClick: function onClick() {
                                            var opp = _rosters.NBA_TEAMS[(save.myTeam.rttpSeed * 3 + save.myTeam.rttpWins) % _rosters.NBA_TEAMS.length];
                                            launchMyTeamMatch(opp.id, false);
                                        },
                                        className: "mt-5 px-6 py-3 rounded-xl bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase text-xs tracking-wider cursor-pointer",
                                        children: [
                                            "Play Seed #",
                                            save.myTeam.rttpSeed,
                                            " Ladder Match"
                                        ]
                                    })
                                ]
                            })
                        ]
                    })),
                    subMode === 'training' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "grid grid-cols-1 md:grid-cols-3 gap-3",
                        children: _modesData.TRAINING_DRILLS.map(function(drill) {
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-4 flex flex-col justify-between",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex justify-between items-center",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-[10px] font-black uppercase text-[#F9A01B]",
                                                        children: drill.category
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "text-[10px] font-bold text-cyan-300",
                                                        children: [
                                                            "+",
                                                            drill.spReward,
                                                            " SP"
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                className: "text-sm font-black text-white mt-1",
                                                children: drill.title
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                className: "text-xs text-zinc-400 mt-1.5 leading-relaxed",
                                                children: drill.instruction
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            var _allPlayers_find;
                                            _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                            var lbj = (_allPlayers_find = allPlayers.find(function(p) {
                                                return p.name.includes('LeBron James');
                                            })) != null ? _allPlayers_find : allPlayers[0];
                                            onStartMatch({
                                                mode: 'training',
                                                title: "TRAINING CAMP \xb7 " + drill.title,
                                                subtitle: "" + drill.targetReps + " Target Reps \xb7 Practice Gym",
                                                homeTeamId: 'mia',
                                                awayTeamId: 'sas',
                                                homeCustomPlayers: [
                                                    lbj
                                                ],
                                                userSide: 'home',
                                                courtEnv: 'practice',
                                                quarterLengthMin: 3,
                                                playersPerSide: 1,
                                                halfCourt: true,
                                                trainingDrillId: drill.id
                                            });
                                        },
                                        className: "mt-4 w-full py-2 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-xs uppercase cursor-pointer",
                                        children: "Enter Practice Court"
                                    })
                                ]
                            }, drill.id);
                        })
                    })
                ]
            })
        ]
    });
};

});

})(window.ArcadeMod);
