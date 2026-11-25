(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/components/PreMatchFlow ===
ArcadeMod.define("src/games/legends-arena/mlbb/components/PreMatchFlow", function(require, module, exports) {
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
    get DraftPickScreen () {
        return DraftPickScreen;
    },
    get MatchLoadingScreen () {
        return MatchLoadingScreen;
    },
    get PreMatchRoom () {
        return PreMatchRoom;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _heroes = require("../data/heroes");
var _emblems = require("../data/emblems");
var _mapData = require("../data/mapData");
var _items = require("../data/items");
var _HeroAvatarSvg = require("./HeroAvatarSvg");
var _AudioEngine = require("../engine/AudioEngine");
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
var LANES = [
    'EXP',
    'Jungle',
    'Mid',
    'Gold',
    'Roam'
];
var BOT_NAMES_BLUE = [
    'Zephyr',
    'NovaWing',
    'IronVanguard',
    'MoonSage'
];
var BOT_NAMES_RED = [
    'ShadowKain',
    'VexanaPro',
    'CrimsonFang',
    'Aetheris',
    'GrimBlade'
];
var INVITEABLE_ROSTER = [
    {
        id: 'inv1',
        name: 'KaguraMain',
        heroId: 'eudora',
        lane: 'Mid',
        rankIdx: 6,
        affinity: 'Partner Lv.6',
        tag: 'Friend'
    },
    {
        id: 'inv2',
        name: 'TigrealSet',
        heroId: 'tigreal',
        lane: 'Roam',
        rankIdx: 5,
        affinity: 'Bro Lv.4',
        tag: 'Squad'
    },
    {
        id: 'inv3',
        name: 'EstesHeal',
        heroId: 'estes',
        lane: 'Roam',
        rankIdx: 4,
        affinity: 'Bestie Lv.5',
        tag: 'Friend'
    },
    {
        id: 'inv4',
        name: 'LanceDash',
        heroId: 'lancelot',
        lane: 'Jungle',
        rankIdx: 7,
        affinity: 'Confidant Lv.3',
        tag: 'Squad'
    },
    {
        id: 'inv5',
        name: 'ZilongBot',
        heroId: 'zilong',
        lane: 'EXP',
        rankIdx: 5,
        affinity: 'AI Veteran',
        tag: 'Bot'
    },
    {
        id: 'inv6',
        name: 'LaylaBot',
        heroId: 'layla',
        lane: 'Gold',
        rankIdx: 4,
        affinity: 'AI Marksman',
        tag: 'Bot'
    }
];
function autoFillTeams(mode, playerName, playerHeroId, playerLane, playerSpellId, playerEmblemId, bannedIds, invitedParty) {
    if (invitedParty === void 0) invitedParty = [];
    var available = _heroes.MLBB_ALL_HEROES.filter(function(h) {
        return !bannedIds.includes(h.id);
    });
    var used = new Set([
        playerHeroId
    ]);
    var pickForLane = function pickForLane(lane, preferredHeroId) {
        if (preferredHeroId && !used.has(preferredHeroId) && !bannedIds.includes(preferredHeroId)) {
            used.add(preferredHeroId);
            return preferredHeroId;
        }
        var laneCandidates = available.filter(function(h) {
            return !used.has(h.id) && h.lane === lane;
        });
        if (laneCandidates.length > 0) {
            var match = laneCandidates[Math.floor(Math.random() * laneCandidates.length)];
            used.add(match.id);
            return match.id;
        }
        var remaining = available.filter(function(h) {
            return !used.has(h.id);
        });
        var any = remaining.length > 0 ? remaining[Math.floor(Math.random() * remaining.length)] : _heroes.MLBB_ALL_HEROES[0];
        used.add(any.id);
        return any.id;
    };
    if (mode === 'practice') {
        var _available_find;
        var enemyHero = (_available_find = available.find(function(h) {
            return h.id !== playerHeroId;
        })) != null ? _available_find : _heroes.MLBB_ALL_HEROES[1];
        return {
            blueTeam: [
                {
                    heroId: playerHeroId,
                    lane: playerLane,
                    name: playerName,
                    isPlayer: true,
                    spellId: playerSpellId,
                    emblemId: playerEmblemId
                }
            ],
            redTeam: [
                {
                    heroId: enemyHero.id,
                    lane: 'Mid',
                    name: 'Practice Bot',
                    isPlayer: false,
                    spellId: 'flicker',
                    emblemId: 'common'
                }
            ]
        };
    }
    var remainingBlueLanes = LANES.filter(function(l) {
        return l !== playerLane;
    });
    var blueTeam = [].concat([
        {
            heroId: playerHeroId,
            lane: playerLane,
            name: playerName,
            isPlayer: true,
            spellId: playerSpellId,
            emblemId: playerEmblemId
        }
    ], remainingBlueLanes.map(function(lane, i) {
        var invited = invitedParty[i];
        var hid = pickForLane(lane, invited == null ? void 0 : invited.heroId);
        return {
            heroId: hid,
            lane: lane,
            name: invited ? invited.name : BOT_NAMES_BLUE[i],
            isPlayer: false,
            spellId: lane === 'Jungle' ? 'retribution' : lane === 'Gold' ? 'inspire' : 'flicker',
            emblemId: lane === 'Mid' ? 'mage' : lane === 'Roam' ? 'tank' : 'assassin'
        };
    }));
    if (mode !== 'ranked') used.clear();
    var redTeam = LANES.map(function(lane, i) {
        var hid = pickForLane(lane);
        return {
            heroId: hid,
            lane: lane,
            name: BOT_NAMES_RED[i],
            isPlayer: false,
            spellId: lane === 'Jungle' ? 'retribution' : lane === 'EXP' ? 'vengeance' : 'flicker',
            emblemId: lane === 'Mid' ? 'mage' : lane === 'Roam' ? 'tank' : 'fighter'
        };
    });
    return {
        blueTeam: blueTeam,
        redTeam: redTeam
    };
}
var PreMatchRoom = function PreMatchRoom(param) {
    var mode = param.mode, profile = param.profile, onUpdateProfile = param.onUpdateProfile, onBack = param.onBack, onProceedToDraft = param.onProceedToDraft;
    var _profile_settings_controls_aiDifficulty;
    var _MLBB_RANK_TIERS_profile_rankTierIdx;
    var _useState = (0, _react.useState)(true), micOn = _useState[0], setMicOn = _useState[1];
    var _useState1 = (0, _react.useState)(true), speakerOn = _useState1[0], setSpeakerOn = _useState1[1];
    var _useState2 = (0, _react.useState)(mode === 'practice' ? [
        null,
        null,
        null,
        null
    ] : [
        INVITEABLE_ROSTER[0],
        INVITEABLE_ROSTER[1],
        null,
        null
    ]), partySlots = _useState2[0], setPartySlots = _useState2[1];
    var _useState3 = (0, _react.useState)(false), matchFoundOpen = _useState3[0], setMatchFoundOpen = _useState3[1];
    var _useState4 = (0, _react.useState)(30), matchCountdown = _useState4[0], setMatchCountdown = _useState4[1];
    var _useState5 = (0, _react.useState)(Array(10).fill(false)), readyFlags = _useState5[0], setReadyFlags = _useState5[1];
    var _useState6 = (0, _react.useState)(false), playerEntered = _useState6[0], setPlayerEntered = _useState6[1];
    var _useState7 = (0, _react.useState)([
        {
            sender: 'System',
            text: "Entered " + mode.toUpperCase() + " room. Invite teammates, pick lane & map variant."
        }
    ]), partyChat = _useState7[0], setPartyChat = _useState7[1];
    var _useState8 = (0, _react.useState)(''), chatText = _useState8[0], setChatText = _useState8[1];
    // Match Found sequential ready ticks + 30s countdown + repeating heartbeat gong
    (0, _react.useEffect)(function() {
        if (!matchFoundOpen) return;
        _AudioEngine.mlbbAudio.playMatchFoundGong();
        setMatchCountdown(30);
        setPlayerEntered(false);
        setReadyFlags(Array(10).fill(false));
        var readyTimers = [];
        // Slots 1..9 are AI/party players accepting sequentially
        [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
        ].forEach(function(slotIdx, order) {
            var delay = 420 + order * 340 + Math.floor(Math.random() * 180);
            var tid = window.setTimeout(function() {
                setReadyFlags(function(prev) {
                    var next = [].concat(prev);
                    next[slotIdx] = true;
                    return next;
                });
                _AudioEngine.mlbbAudio.playPlayerReady();
            }, delay);
            readyTimers.push(tid);
        });
        var cdId = window.setInterval(function() {
            setMatchCountdown(function(sec) {
                if (sec <= 1) {
                    setMatchFoundOpen(false);
                    return 0;
                }
                if (sec <= 6) _AudioEngine.mlbbAudio.playCountdownTick(true);
                return sec - 1;
            });
        }, 1000);
        return function() {
            readyTimers.forEach(function(t) {
                return window.clearTimeout(t);
            });
            window.clearInterval(cdId);
        };
    }, [
        matchFoundOpen
    ]);
    // Repeating dramatic heartbeat gong while awaiting player ENTER tap
    (0, _react.useEffect)(function() {
        if (!matchFoundOpen || playerEntered) return;
        var hbId = window.setInterval(function() {
            _AudioEngine.mlbbAudio.playMatchFoundGong();
        }, 2200);
        return function() {
            return window.clearInterval(hbId);
        };
    }, [
        matchFoundOpen,
        playerEntered
    ]);
    // Proceed to Draft once all 10 players (including player slot 0) are ready!
    (0, _react.useEffect)(function() {
        if (!matchFoundOpen || !playerEntered) return;
        if (readyFlags.every(Boolean)) {
            var activeParty = partySlots.filter(function(m) {
                return m !== null;
            });
            var tid = window.setTimeout(function() {
                _AudioEngine.mlbbAudio.playHeroLockIn();
                onProceedToDraft(activeParty);
            }, 420);
            return function() {
                return window.clearTimeout(tid);
            };
        }
    }, [
        matchFoundOpen,
        playerEntered,
        readyFlags,
        partySlots,
        onProceedToDraft
    ]);
    var inviteMember = function inviteMember(member) {
        if (mode === 'practice') return;
        if (partySlots.some(function(s) {
            return (s == null ? void 0 : s.id) === member.id;
        })) return;
        var emptyIdx = partySlots.findIndex(function(s) {
            return s === null;
        });
        if (emptyIdx === -1) return;
        _AudioEngine.mlbbAudio.playPlayerReady();
        setPartySlots(function(prev) {
            var next = [].concat(prev);
            next[emptyIdx] = member;
            return next;
        });
        setPartyChat(function(prev) {
            return [].concat(prev, [
                {
                    sender: 'System',
                    text: "" + member.name + " joined your party!"
                }
            ]);
        });
    };
    var removeSlot = function removeSlot(idx) {
        _AudioEngine.mlbbAudio.playClick();
        setPartySlots(function(prev) {
            var next = [].concat(prev);
            next[idx] = null;
            return next;
        });
    };
    var readyCount = readyFlags.filter(Boolean).length;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "relative w-full h-full bg-gradient-to-br from-[#070E21] via-[#0F1E46] to-[#060B18] text-slate-100 flex flex-col p-3.5 overflow-hidden select-none",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "flex flex-wrap items-center justify-between gap-2 border-b border-[#E6B84C]/35 pb-2.5",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex flex-wrap items-center gap-2.5",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClick();
                                    onBack();
                                },
                                className: "h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black text-white cursor-pointer",
                                children: "← Lobby"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-sm font-black text-[#FFE28A] uppercase tracking-wide flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    mode.replace('_', ' '),
                                                    " PRE-MATCH LOBBY"
                                                ]
                                            }),
                                            mode === 'arcade' && profile.arcadeSubMode && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-[10px] text-purple-300",
                                                children: [
                                                    "\xb7 ",
                                                    profile.arcadeSubMode.toUpperCase()
                                                ]
                                            }),
                                            mode === 'practice' && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[10px] text-emerald-300",
                                                children: "\xb7 PRACTICE MODE"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center gap-1 mt-1",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[10px] font-bold text-slate-400 mr-1",
                                                children: "LANE:"
                                            }),
                                            LANES.map(function(ln) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    onClick: function onClick() {
                                                        _AudioEngine.mlbbAudio.playClick();
                                                        onUpdateProfile(function(p) {
                                                            return _extends({}, p, {
                                                                selectedLane: ln,
                                                                selectedSpellId: ln === 'Jungle' ? 'retribution' : p.selectedSpellId
                                                            });
                                                        });
                                                    },
                                                    className: "px-2 py-0.5 rounded text-[10px] font-black cursor-pointer " + (profile.selectedLane === ln ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'),
                                                    children: ln
                                                }, ln);
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex flex-wrap items-center gap-1.5 text-xs",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClick();
                                    setMicOn(function(v) {
                                        return !v;
                                    });
                                },
                                className: "h-8 px-2.5 rounded-lg border font-black cursor-pointer " + (micOn ? 'bg-emerald-950/70 border-emerald-400/60 text-emerald-200' : 'bg-slate-900 border-slate-700 text-slate-400'),
                                title: "Toggle Party Microphone",
                                children: micOn ? '🎙️ Mic' : '🔇 Muted'
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClick();
                                    setSpeakerOn(function(v) {
                                        return !v;
                                    });
                                },
                                className: "h-8 px-2.5 rounded-lg border font-black cursor-pointer " + (speakerOn ? 'bg-sky-950/70 border-sky-400/60 text-sky-200' : 'bg-slate-900 border-slate-700 text-slate-400'),
                                title: "Toggle Team Voice Audio",
                                children: speakerOn ? '🔊 Voice' : '🔈 Off'
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                value: (_profile_settings_controls_aiDifficulty = profile.settings.controls.aiDifficulty) != null ? _profile_settings_controls_aiDifficulty : 'epic',
                                onChange: function onChange(e) {
                                    _AudioEngine.mlbbAudio.playClick();
                                    onUpdateProfile(function(p) {
                                        return _extends({}, p, {
                                            settings: _extends({}, p.settings, {
                                                controls: _extends({}, p.settings.controls, {
                                                    aiDifficulty: e.target.value
                                                })
                                            })
                                        });
                                    });
                                },
                                className: "h-8 px-2 rounded-lg bg-slate-900 border border-sky-400/50 text-[11px] font-bold text-sky-200",
                                title: "Smart AI Bot Difficulty",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                        value: "warrior",
                                        children: "AI: Warrior"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                        value: "epic",
                                        children: "AI: Epic"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                        value: "mythic",
                                        children: "AI: Mythic"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                value: profile.settings.basics.mapTheme,
                                onChange: function onChange(e) {
                                    return onUpdateProfile(function(p) {
                                        return _extends({}, p, {
                                            settings: _extends({}, p.settings, {
                                                basics: _extends({}, p.settings.basics, {
                                                    mapTheme: e.target.value
                                                })
                                            })
                                        });
                                    });
                                },
                                className: "h-8 px-2 rounded-lg bg-slate-900 border border-[#E6B84C]/45 text-[11px] font-bold text-white",
                                title: "Map Theme Selector",
                                children: Object.keys(_mapData.MAP_THEMES).map(function(tid) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                        value: tid,
                                        children: [
                                            "\uD83D\uDDFA️ ",
                                            _mapData.MAP_THEMES[tid].name
                                        ]
                                    }, tid);
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                value: profile.selectedMapVariant,
                                onChange: function onChange(e) {
                                    return onUpdateProfile(function(p) {
                                        return _extends({}, p, {
                                            selectedMapVariant: e.target.value
                                        });
                                    });
                                },
                                className: "h-8 px-2 rounded-lg bg-slate-900 border border-cyan-400/55 text-[11px] font-bold text-cyan-200",
                                title: "2026 Map Variant Selector",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                        value: "random",
                                        children: "\uD83C\uDFB2 Standard / Random 2026"
                                    }),
                                    [].concat(_mapData.PRIMARY_2026_VARIANTS, [
                                        'revealing_wisps',
                                        'healing_turtle',
                                        'golden_turret'
                                    ]).map(function(v) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                            value: v,
                                            children: [
                                                _mapData.MAP_VARIANTS_2026[v].icon,
                                                " ",
                                                _mapData.MAP_VARIANTS_2026[v].name
                                            ]
                                        }, v);
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClaimFanfare();
                                    setPartyChat(function(prev) {
                                        return [].concat(prev, [
                                            {
                                                sender: 'Recruit Broadcast',
                                                text: "[" + mode.toUpperCase() + "] " + profile.name + " is recruiting players! Tap + to join."
                                            }
                                        ]);
                                    });
                                },
                                className: "h-8 px-2.5 rounded-lg bg-amber-500/20 border border-[#E6B84C] text-[#FFE28A] text-[11px] font-black cursor-pointer",
                                children: "\uD83D\uDCE3 Recruit"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 py-3 overflow-y-auto",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "lg:col-span-9 flex flex-col justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "grid grid-cols-5 gap-2.5 flex-1 items-stretch",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p-3 rounded-2xl bg-gradient-to-b from-[#1B3B6F]/85 to-[#0B132B]/95 border-2 border-[#E6B84C] flex flex-col items-center justify-between text-center shadow-xl",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex items-center gap-1 text-[10px] font-black text-[#FFE28A]",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.RankCrestSvg, {
                                                        tierIdx: profile.rankTierIdx,
                                                        size: 18
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: (_MLBB_RANK_TIERS_profile_rankTierIdx = _emblems.MLBB_RANK_TIERS[profile.rankTierIdx]) == null ? void 0 : _MLBB_RANK_TIERS_profile_rankTierIdx.name
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "my-1",
                                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                    heroId: profile.selectedHeroId,
                                                    size: 64
                                                })
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "w-full",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-xs font-black text-white truncate",
                                                        children: profile.name
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "text-[10px] text-amber-300 font-bold",
                                                        children: [
                                                            profile.selectedLane,
                                                            " Lane \xb7 Host"
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[10px] text-emerald-400 font-black mt-0.5",
                                                        children: "READY ✓"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    partySlots.map(function(member, idx) {
                                        var _MLBB_RANK_TIERS_member_rankIdx;
                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "relative p-3 rounded-2xl border flex flex-col items-center justify-between text-center " + (member ? 'bg-gradient-to-b from-[#13244D]/90 to-[#0B132B]/95 border-sky-400/50' : 'bg-[#0B132B]/65 border-dashed border-slate-700'),
                                            children: member ? /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: function onClick() {
                                                            return removeSlot(idx);
                                                        },
                                                        className: "absolute top-1.5 right-1.5 w-5 h-5 rounded bg-slate-900/90 hover:bg-rose-600 text-[10px] font-black text-slate-300 hover:text-white cursor-pointer",
                                                        title: "Remove from party",
                                                        children: "✕"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex items-center gap-1 text-[10px] font-black text-cyan-300",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.RankCrestSvg, {
                                                                tierIdx: member.rankIdx,
                                                                size: 16
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "truncate",
                                                                children: (_MLBB_RANK_TIERS_member_rankIdx = _emblems.MLBB_RANK_TIERS[member.rankIdx]) == null ? void 0 : _MLBB_RANK_TIERS_member_rankIdx.name
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                        heroId: member.heroId,
                                                        size: 58
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "w-full",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-xs font-black text-white truncate",
                                                                children: member.name
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-[10px] text-pink-300 font-bold truncate",
                                                                children: member.affinity
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-[10px] text-emerald-400 font-black",
                                                                children: [
                                                                    member.lane,
                                                                    " \xb7 Ready ✓"
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "my-auto space-y-1.5 text-slate-400",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "w-12 h-12 mx-auto rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xl",
                                                        children: mode === 'practice' ? '🎯' : '+'
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[11px] font-bold",
                                                        children: mode === 'practice' ? '1v1 Training' : 'Auto-Fill / Invite'
                                                    })
                                                ]
                                            })
                                        }, idx);
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "grid grid-cols-1 md:grid-cols-12 gap-3 items-end",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "md:col-span-7 p-3 rounded-2xl bg-[#0D1836] border border-slate-700",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[10px] font-black text-[#FFE28A] mb-1",
                                                children: "PARTY CHAT"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "space-y-1 max-h-20 overflow-y-auto text-[11px] mb-2",
                                                children: partyChat.map(function(c, idx) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                className: "font-bold text-amber-300",
                                                                children: [
                                                                    c.sender,
                                                                    ": "
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "text-slate-200",
                                                                children: c.text
                                                            })
                                                        ]
                                                    }, idx);
                                                })
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("form", {
                                                onSubmit: function onSubmit(e) {
                                                    e.preventDefault();
                                                    if (!chatText.trim()) return;
                                                    _AudioEngine.mlbbAudio.playClick();
                                                    setPartyChat(function(prev) {
                                                        return [].concat(prev, [
                                                            {
                                                                sender: profile.name,
                                                                text: chatText.trim()
                                                            }
                                                        ]);
                                                    });
                                                    setChatText('');
                                                },
                                                className: "flex gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                        value: chatText,
                                                        onChange: function onChange(e) {
                                                            return setChatText(e.target.value);
                                                        },
                                                        placeholder: "Say something to party...",
                                                        className: "flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        type: "submit",
                                                        className: "px-3 py-1 rounded-lg bg-slate-700 text-xs font-black text-white cursor-pointer",
                                                        children: "Send"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "md:col-span-5 flex flex-col items-end justify-end",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    _AudioEngine.mlbbAudio.playClick();
                                                    setMatchFoundOpen(true);
                                                },
                                                className: "w-full h-16 px-8 rounded-2xl bg-[#E6B84C] bg-gradient-to-r from-[#FFE28A] via-[#E6B84C] to-[#C68618] border-2 border-[#FFE28A] text-slate-950 font-black text-lg tracking-wider shadow-2xl hover:brightness-110 cursor-pointer transition",
                                                children: "START GAME"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[10px] text-slate-400 mt-1",
                                                children: mode === 'ranked' ? 'Strict MLBB 5-Ban Draft Pick · Match Found Ready Check' : '10-Player Match Found Check → Hero Selection'
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("aside", {
                        className: "lg:col-span-3 p-3 rounded-2xl bg-[#0D1836] border border-[#E6B84C]/35 flex flex-col min-h-0",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "text-xs font-black text-[#FFE28A] mb-2 uppercase",
                                children: "Invite Teammates"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "space-y-1.5 overflow-y-auto flex-1 pr-0.5",
                                children: INVITEABLE_ROSTER.map(function(m) {
                                    var inParty = partySlots.some(function(s) {
                                        return (s == null ? void 0 : s.id) === m.id;
                                    });
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex items-center gap-2 min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                        heroId: m.heroId,
                                                        size: 30
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "truncate",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-xs font-black text-white truncate",
                                                                children: m.name
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-[10px] text-slate-400 truncate",
                                                                children: [
                                                                    m.tag,
                                                                    " \xb7 ",
                                                                    m.lane,
                                                                    " \xb7 ",
                                                                    m.affinity
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                disabled: inParty || mode === 'practice' || !partySlots.includes(null),
                                                onClick: function onClick() {
                                                    return inviteMember(m);
                                                },
                                                className: "w-7 h-7 rounded-lg font-black text-xs shrink-0 cursor-pointer " + (inParty ? 'bg-emerald-700 text-white' : 'bg-[#E6B84C] hover:brightness-110 text-slate-950 disabled:opacity-40'),
                                                title: inParty ? 'In Party' : 'Invite to Party',
                                                children: inParty ? '✓' : '+'
                                            })
                                        ]
                                    }, m.id);
                                })
                            })
                        ]
                    })
                ]
            }),
            matchFoundOpen && function() {
                var ringCirc = 2 * Math.PI * 36;
                var ringDash = ringCirc * (matchCountdown / 30);
                return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "fixed inset-0 z-50 bg-slate-950/88 flex items-center justify-center p-4",
                    children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#162856] via-[#0F1E46] to-[#0B132B] border-2 border-[#E6B84C] p-6 text-center space-y-4 shadow-2xl mlbb-heartbeat",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex flex-col items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "relative w-20 h-20 flex items-center justify-center",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
                                                width: "80",
                                                height: "80",
                                                viewBox: "0 0 80 80",
                                                className: "-rotate-90",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                                                        cx: "40",
                                                        cy: "40",
                                                        r: "36",
                                                        fill: "none",
                                                        stroke: "rgba(148,163,184,0.22)",
                                                        strokeWidth: "5"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                                                        cx: "40",
                                                        cy: "40",
                                                        r: "36",
                                                        fill: "none",
                                                        stroke: matchCountdown <= 6 ? '#EF4444' : '#FFE28A',
                                                        strokeWidth: "5",
                                                        strokeLinecap: "round",
                                                        strokeDasharray: ringDash + " " + ringCirc,
                                                        style: {
                                                            transition: 'stroke-dasharray 0.9s linear'
                                                        }
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "absolute inset-0 flex flex-col items-center justify-center",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-xl font-black text-[#FFE28A] mlbb-num leading-none",
                                                        children: matchCountdown
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-[9px] font-bold text-cyan-300 uppercase",
                                                        children: "SEC"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-xs font-black tracking-[0.25em] text-cyan-300 uppercase",
                                        children: [
                                            mode.toUpperCase(),
                                            " \xb7 LAND OF DAWN"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-3xl font-black text-[#FFE28A] tracking-wider",
                                        children: "MATCH FOUND!"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-xs text-slate-300 mlbb-num",
                                        children: [
                                            "Players Ready: ",
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-emerald-300 font-black",
                                                children: [
                                                    readyCount,
                                                    " / 10"
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-2.5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[10px] font-black text-sky-300 uppercase tracking-widest",
                                        children: "Blue Squad"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "flex items-center justify-center gap-2.5",
                                        children: readyFlags.slice(0, 5).map(function(r, i) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "w-11 h-11 rounded-full border-2 flex items-center justify-center text-sm font-black transition " + (r ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_16px_rgba(34,197,94,0.7)] scale-105' : 'bg-slate-900 border-sky-500/45 text-slate-400'),
                                                children: r ? '✓' : i === 0 ? 'YOU' : '•'
                                            }, i);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[10px] font-black text-rose-300 uppercase tracking-widest pt-1",
                                        children: "Red Squad"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "flex items-center justify-center gap-2.5",
                                        children: readyFlags.slice(5, 10).map(function(r, i) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "w-11 h-11 rounded-full border-2 flex items-center justify-center text-sm font-black transition " + (r ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_16px_rgba(34,197,94,0.7)] scale-105' : 'bg-slate-900 border-rose-500/45 text-slate-400'),
                                                children: r ? '✓' : '•'
                                            }, i + 5);
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-center gap-3 pt-1",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            _AudioEngine.mlbbAudio.playClick();
                                            setMatchFoundOpen(false);
                                        },
                                        className: "px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black text-slate-300 cursor-pointer",
                                        children: "Decline"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        disabled: playerEntered,
                                        onClick: function onClick() {
                                            _AudioEngine.mlbbAudio.playPlayerReady();
                                            setPlayerEntered(true);
                                            setReadyFlags(function(prev) {
                                                var next = [].concat(prev);
                                                next[0] = true;
                                                return next;
                                            });
                                        },
                                        className: "px-12 py-3.5 rounded-2xl font-black text-base tracking-wider cursor-pointer transition mlbb-num " + (playerEntered ? 'bg-emerald-600 text-white shadow-lg border-2 border-emerald-300' : 'bg-[#E6B84C] bg-gradient-to-r from-[#FFE28A] via-[#E6B84C] to-[#C88E20] border-2 border-[#FFE28A] text-slate-950 shadow-xl hover:brightness-110'),
                                        children: playerEntered ? "READY ✓ (" + readyCount + "/10)" : "ENTER (" + matchCountdown + "s)"
                                    })
                                ]
                            })
                        ]
                    })
                });
            }()
        ]
    });
};
var DraftPickScreen = function DraftPickScreen(param) {
    var mode = param.mode, profile = param.profile, _param_invitedParty = param.invitedParty, invitedParty = _param_invitedParty === void 0 ? [] : _param_invitedParty, onUpdateProfile = param.onUpdateProfile, onCancel = param.onCancel, onConfirmMatch = param.onConfirmMatch;
    var _profile_activeBuildSlot_selectedHeroId, _profile_ownedSkins_selectedHeroId, _profile_equippedSkins_selectedHeroId;
    var isRanked = mode === 'ranked';
    var _useState = (0, _react.useState)(isRanked ? 'ban' : 'pick'), phase = _useState[0], setPhase = _useState[1];
    var _useState1 = (0, _react.useState)(isRanked ? 30 : 30), timer = _useState1[0], setTimer = _useState1[1];
    var _useState2 = (0, _react.useState)([]), blueBans = _useState2[0], setBlueBans = _useState2[1];
    var _useState3 = (0, _react.useState)([]), redBans = _useState3[0], setRedBans = _useState3[1];
    var _useState4 = (0, _react.useState)('fanny'), banCandidateId = _useState4[0], setBanCandidateId = _useState4[1];
    var _useState5 = (0, _react.useState)(!isRanked), playerBanDone = _useState5[0], setPlayerBanDone = _useState5[1];
    var _useState6 = (0, _react.useState)(false), playerLocked = _useState6[0], setPlayerLocked = _useState6[1];
    var _useState7 = (0, _react.useState)(profile.selectedHeroId), selectedHeroId = _useState7[0], setSelectedHeroId = _useState7[1];
    var _useState8 = (0, _react.useState)(''), draftSearch = _useState8[0], setDraftSearch = _useState8[1];
    var _useState9 = (0, _react.useState)('All'), draftRole = _useState9[0], setDraftRole = _useState9[1];
    var _useState10 = (0, _react.useState)('All'), draftLane = _useState10[0], setDraftLane = _useState10[1];
    var _useState11 = (0, _react.useState)(null), splashFlash = _useState11[0], setSplashFlash = _useState11[1];
    var _useState12 = (0, _react.useState)(function() {
        var remaining = LANES.filter(function(l) {
            return l !== profile.selectedLane;
        });
        return [].concat([
            {
                heroId: profile.selectedHeroId,
                lane: profile.selectedLane,
                name: profile.name,
                isPlayer: true,
                spellId: profile.selectedSpellId,
                emblemId: profile.selectedEmblemId
            }
        ], remaining.map(function(lane, i) {
            var invited = invitedParty[i];
            return {
                heroId: '',
                lane: lane,
                name: invited ? invited.name : BOT_NAMES_BLUE[i],
                isPlayer: false,
                spellId: lane === 'Jungle' ? 'retribution' : lane === 'Gold' ? 'inspire' : 'flicker',
                emblemId: lane === 'Mid' ? 'mage' : lane === 'Roam' ? 'tank' : 'assassin'
            };
        }));
    }), blueRoster = _useState12[0], setBlueRoster = _useState12[1];
    var _useState13 = (0, _react.useState)(function() {
        return LANES.map(function(lane, i) {
            return {
                heroId: '',
                lane: lane,
                name: BOT_NAMES_RED[i],
                isPlayer: false,
                spellId: lane === 'Jungle' ? 'retribution' : lane === 'EXP' ? 'vengeance' : 'flicker',
                emblemId: lane === 'Mid' ? 'mage' : lane === 'Roam' ? 'tank' : 'fighter'
            };
        });
    }), redRoster = _useState13[0], setRedRoster = _useState13[1];
    var _useState14 = (0, _react.useState)([
        {
            sender: 'Draft Room',
            text: isRanked ? '5-Ban Ranked Draft started. Ban priority threats first!' : "" + mode.toUpperCase() + " Selection started. Pick your champion & Quick Prep."
        }
    ]), draftChat = _useState14[0], setDraftChat = _useState14[1];
    var _useState15 = (0, _react.useState)(''), draftChatInput = _useState15[0], setDraftChatInput = _useState15[1];
    var launchedRef = (0, _react.useRef)(false);
    var allBanned = (0, _react.useMemo)(function() {
        return [].concat(blueBans, redBans);
    }, [
        blueBans,
        redBans
    ]);
    var allPicked = (0, _react.useMemo)(function() {
        return [].concat(blueRoster.map(function(b) {
            return b.heroId;
        }), redRoster.map(function(r) {
            return r.heroId;
        })).filter(function(id) {
            return Boolean(id) && (isRanked || id !== selectedHeroId);
        });
    }, [
        blueRoster,
        redRoster,
        isRanked,
        selectedHeroId
    ]);
    var filteredDraftHeroes = (0, _react.useMemo)(function() {
        var q = draftSearch.trim().toLowerCase();
        return _heroes.MLBB_ALL_HEROES.filter(function(h) {
            if (draftRole !== 'All' && h.role !== draftRole) return false;
            if (draftLane !== 'All' && h.lane !== draftLane) return false;
            if (q && !h.name.toLowerCase().includes(q) && !h.lane.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [
        draftSearch,
        draftRole,
        draftLane
    ]);
    var triggerFlash = function triggerFlash(label, heroId, tone) {
        setSplashFlash({
            label: label,
            heroId: heroId,
            tone: tone
        });
        window.setTimeout(function() {
            return setSplashFlash(null);
        }, 1250);
    };
    // Keep slot 0 synced with player selection/spell/emblem
    (0, _react.useEffect)(function() {
        setBlueRoster(function(prev) {
            return prev.map(function(slot, i) {
                return i === 0 ? _extends({}, slot, {
                    heroId: selectedHeroId,
                    spellId: profile.selectedSpellId,
                    emblemId: profile.selectedEmblemId
                }) : slot;
            });
        });
    }, [
        selectedHeroId,
        profile.selectedSpellId,
        profile.selectedEmblemId
    ]);
    // Progressive AI Bans in Ranked Ban Phase (fills up to 4 AI Blue Bans + 5 Red Bans)
    (0, _react.useEffect)(function() {
        if (!isRanked || phase !== 'ban') return;
        var pool = [
            'fanny',
            'ling',
            'hayabusa',
            'nolan',
            'franco',
            'nana',
            'joy',
            'zhuxin',
            'tigreal',
            'lancelot',
            'valir',
            'gusion'
        ];
        var id = window.setInterval(function() {
            setBlueBans(function(prevB) {
                if (prevB.length < 4) {
                    var next = pool.find(function(h) {
                        return !prevB.includes(h) && !redBans.includes(h);
                    });
                    if (next) {
                        _AudioEngine.mlbbAudio.playBanSlam();
                        return [].concat(prevB, [
                            next
                        ]);
                    }
                }
                return prevB;
            });
            setRedBans(function(prevR) {
                if (prevR.length < 5) {
                    var next = pool.find(function(h) {
                        return !prevR.includes(h) && !blueBans.includes(h);
                    });
                    if (next) return [].concat(prevR, [
                        next
                    ]);
                }
                return prevR;
            });
        }, 1700);
        return function() {
            return window.clearInterval(id);
        };
    }, [
        isRanked,
        phase,
        blueBans,
        redBans
    ]);
    // Move from Ban -> Pick automatically when all 5 Blue & 5 Red Bans are locked
    (0, _react.useEffect)(function() {
        if (isRanked && phase === 'ban' && blueBans.length >= 5 && redBans.length >= 5) {
            var tid = window.setTimeout(function() {
                _AudioEngine.mlbbAudio.playSwoosh();
                setPhase('pick');
                setTimer(30);
                setDraftChat(function(c) {
                    return [].concat(c, [
                        {
                            sender: 'Draft Room',
                            text: 'Ban Phase complete (5v5 Bans). Pick Phase begins!'
                        }
                    ]);
                });
            }, 650);
            return function() {
                return window.clearTimeout(tid);
            };
        }
    }, [
        isRanked,
        phase,
        blueBans.length,
        redBans.length
    ]);
    // Progressive AI Picks during Pick Phase
    (0, _react.useEffect)(function() {
        if (phase !== 'pick') return;
        var id = window.setInterval(function() {
            var used = new Set([].concat(blueBans, redBans, [
                selectedHeroId
            ], blueRoster.map(function(b) {
                return b.heroId;
            }).filter(Boolean), redRoster.map(function(r) {
                return r.heroId;
            }).filter(Boolean)));
            var pickAvailable = function pickAvailable(lane) {
                var _ref;
                var laneHit = _heroes.MLBB_ALL_HEROES.find(function(h) {
                    return !used.has(h.id) && h.lane === lane;
                });
                var picked = (_ref = laneHit != null ? laneHit : _heroes.MLBB_ALL_HEROES.find(function(h) {
                    return !used.has(h.id);
                })) != null ? _ref : _heroes.MLBB_ALL_HEROES[0];
                used.add(picked.id);
                return picked.id;
            };
            setBlueRoster(function(prev) {
                var emptyIdx = prev.findIndex(function(s, i) {
                    return i > 0 && !s.heroId;
                });
                if (emptyIdx === -1) return prev;
                var next = [].concat(prev);
                next[emptyIdx] = _extends({}, next[emptyIdx], {
                    heroId: pickAvailable(next[emptyIdx].lane)
                });
                return next;
            });
            setRedRoster(function(prev) {
                var emptyIdx = prev.findIndex(function(s) {
                    return !s.heroId;
                });
                if (emptyIdx === -1) return prev;
                var next = [].concat(prev);
                next[emptyIdx] = _extends({}, next[emptyIdx], {
                    heroId: pickAvailable(next[emptyIdx].lane)
                });
                return next;
            });
        }, 1450);
        return function() {
            return window.clearInterval(id);
        };
    }, [
        phase,
        blueBans,
        redBans,
        selectedHeroId,
        blueRoster,
        redRoster
    ]);
    // Advance from Pick -> Final Adjustment once Player locked & all 10 slots filled
    (0, _react.useEffect)(function() {
        if (phase !== 'pick' || !playerLocked) return;
        var allBlueReady = blueRoster.every(function(b) {
            return Boolean(b.heroId);
        });
        var allRedReady = redRoster.every(function(r) {
            return Boolean(r.heroId);
        });
        if (allBlueReady && allRedReady) {
            var tid = window.setTimeout(function() {
                _AudioEngine.mlbbAudio.playSwoosh();
                setPhase('adjustment');
                setTimer(isRanked ? 20 : 8);
                setDraftChat(function(c) {
                    return [].concat(c, [
                        {
                            sender: 'Draft Room',
                            text: 'Final Adjustment! Swap heroes with allies or tune Emblem/Build.'
                        }
                    ]);
                });
            }, 500);
            return function() {
                return window.clearTimeout(tid);
            };
        }
    }, [
        phase,
        playerLocked,
        blueRoster,
        redRoster,
        isRanked
    ]);
    var launchNow = function launchNow() {
        var _profile_activeBuildSlot_finalPlayerHeroId, _ref, _profile_equippedSkins_finalPlayerHeroId;
        var _profile_savedBuilds_finalPlayerHeroId;
        if (launchedRef.current) return;
        launchedRef.current = true;
        var variants = [].concat(_mapData.PRIMARY_2026_VARIANTS);
        var mapVariant = profile.selectedMapVariant === 'random' ? variants[Math.floor(Math.random() * variants.length)] : profile.selectedMapVariant;
        var fallbackTeams = autoFillTeams(mode, profile.name, selectedHeroId, profile.selectedLane, profile.selectedSpellId, profile.selectedEmblemId, allBanned, invitedParty);
        var finalBlue = mode === 'practice' ? fallbackTeams.blueTeam : blueRoster.map(function(slot, idx) {
            var _fallbackTeams_blueTeam_idx;
            return _extends({}, slot, {
                heroId: slot.heroId || ((_fallbackTeams_blueTeam_idx = fallbackTeams.blueTeam[idx]) == null ? void 0 : _fallbackTeams_blueTeam_idx.heroId) || 'miya'
            });
        });
        var finalRed = mode === 'practice' ? fallbackTeams.redTeam : redRoster.map(function(slot, idx) {
            var _fallbackTeams_redTeam_idx;
            return _extends({}, slot, {
                heroId: slot.heroId || ((_fallbackTeams_redTeam_idx = fallbackTeams.redTeam[idx]) == null ? void 0 : _fallbackTeams_redTeam_idx.heroId) || 'zilong'
            });
        });
        var finalPlayerHeroId = finalBlue[0].heroId;
        var buildIdx = (_profile_activeBuildSlot_finalPlayerHeroId = profile.activeBuildSlot[finalPlayerHeroId]) != null ? _profile_activeBuildSlot_finalPlayerHeroId : 0;
        var saved = (_ref = (_profile_savedBuilds_finalPlayerHeroId = profile.savedBuilds[finalPlayerHeroId]) == null ? void 0 : _profile_savedBuilds_finalPlayerHeroId[buildIdx]) != null ? _ref : (0, _heroes.getMlbbHeroById)(finalPlayerHeroId).recommendedBuild;
        onUpdateProfile(function(p) {
            return _extends({}, p, {
                selectedHeroId: finalPlayerHeroId
            });
        });
        onConfirmMatch({
            mode: mode,
            playerHeroId: finalPlayerHeroId,
            playerSkinId: (_profile_equippedSkins_finalPlayerHeroId = profile.equippedSkins[finalPlayerHeroId]) != null ? _profile_equippedSkins_finalPlayerHeroId : (0, _heroes.getMlbbHeroById)(finalPlayerHeroId).skins[0].id,
            playerLane: profile.selectedLane,
            playerSpellId: profile.selectedSpellId,
            playerEmblemId: profile.selectedEmblemId,
            playerTalents: profile.emblemTalents[profile.selectedEmblemId],
            playerBuild: saved,
            mapTheme: profile.settings.basics.mapTheme,
            mapVariant: mapVariant,
            customSubMode: profile.customSubMode,
            blueTeam: finalBlue,
            redTeam: finalRed
        });
    };
    // Strict MLBB Phase Countdown Timer (with Final 5s tick audio!)
    (0, _react.useEffect)(function() {
        var id = window.setInterval(function() {
            setTimer(function(t) {
                if (t <= 6 && t > 1) {
                    _AudioEngine.mlbbAudio.playCountdownTick(t <= 3);
                }
                if (t <= 1) {
                    if (phase === 'ban') {
                        setPhase('pick');
                        return 30;
                    }
                    if (phase === 'pick') {
                        setPlayerLocked(true);
                        setPhase('adjustment');
                        return isRanked ? 20 : 8;
                    }
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return function() {
            return window.clearInterval(id);
        };
    }, [
        phase,
        isRanked
    ]);
    (0, _react.useEffect)(function() {
        if (phase === 'adjustment' && timer === 0) {
            launchNow();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        phase,
        timer
    ]);
    var hero = (0, _heroes.getMlbbHeroById)(selectedHeroId);
    var buildIdx = (_profile_activeBuildSlot_selectedHeroId = profile.activeBuildSlot[selectedHeroId]) != null ? _profile_activeBuildSlot_selectedHeroId : 0;
    var activeTalents = profile.emblemTalents[profile.selectedEmblemId];
    var ownedHeroSkins = (_profile_ownedSkins_selectedHeroId = profile.ownedSkins[selectedHeroId]) != null ? _profile_ownedSkins_selectedHeroId : [
        'default'
    ];
    var handleBanHero = function handleBanHero(hid) {
        if (allBanned.includes(hid) || blueBans.length >= 5) return;
        _AudioEngine.mlbbAudio.playBanSlam();
        setBlueBans(function(prev) {
            return [].concat(prev, [
                hid
            ]);
        });
        setPlayerBanDone(true);
        triggerFlash("BANNED: " + (0, _heroes.getMlbbHeroById)(hid).name.toUpperCase(), hid, 'ban');
        setDraftChat(function(c) {
            return [].concat(c, [
                {
                    sender: profile.name,
                    text: "Banned " + (0, _heroes.getMlbbHeroById)(hid).name + "!"
                }
            ]);
        });
        if (selectedHeroId === hid) {
            var nextSafe = _heroes.MLBB_ALL_HEROES.find(function(x) {
                return !allBanned.includes(x.id) && x.id !== hid;
            });
            if (nextSafe) setSelectedHeroId(nextSafe.id);
        }
    };
    var handleSwapWithAlly = function handleSwapWithAlly(allyIndex) {
        if (phase !== 'adjustment' || allyIndex === 0) return;
        var ally = blueRoster[allyIndex];
        if (!(ally == null ? void 0 : ally.heroId)) return;
        _AudioEngine.mlbbAudio.playHeroLockIn();
        var myHeroId = blueRoster[0].heroId;
        setBlueRoster(function(prev) {
            var next = [].concat(prev);
            next[0] = _extends({}, next[0], {
                heroId: ally.heroId
            });
            next[allyIndex] = _extends({}, next[allyIndex], {
                heroId: myHeroId
            });
            return next;
        });
        setSelectedHeroId(ally.heroId);
        setDraftChat(function(c) {
            return [].concat(c, [
                {
                    sender: 'System',
                    text: "Swapped heroes: " + profile.name + " ↔ " + ally.name + " (" + (0, _heroes.getMlbbHeroById)(ally.heroId).name + ")!"
                }
            ]);
        });
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "relative w-full h-full mlbb-war-room-bg text-slate-100 flex flex-col p-2.5 overflow-hidden select-none",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-sky-500/22 via-sky-400/8 to-transparent border-r border-sky-400/15"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-rose-500/22 via-rose-400/8 to-transparent border-l border-rose-400/15"
            }),
            splashFlash && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 mlbb-splash-flash",
                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "px-8 py-5 rounded-3xl border-2 flex items-center gap-4 shadow-2xl " + (splashFlash.tone === 'ban' ? 'bg-rose-950/95 border-rose-400 text-rose-100' : 'bg-[#101E44]/95 border-[#FFE28A] text-[#FFE28A]'),
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                            heroId: splashFlash.heroId,
                            size: 74
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "text-xs font-black tracking-widest uppercase",
                                    children: splashFlash.tone === 'ban' ? 'HERO BANNED' : 'CHAMPION LOCKED IN'
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "text-2xl font-black text-white",
                                    children: splashFlash.label
                                })
                            ]
                        })
                    ]
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "relative z-10 flex items-center justify-between gap-2 pb-2 border-b border-[#E6B84C]/35",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClick();
                                    onCancel();
                                },
                                className: "px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-black cursor-pointer",
                                children: "← Back"
                            }),
                            isRanked && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-[10px] font-black text-sky-400 mr-1",
                                        children: "BLUE BANS"
                                    }),
                                    [
                                        0,
                                        1,
                                        2,
                                        3,
                                        4
                                    ].map(function(idx) {
                                        var bid = blueBans[idx];
                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "w-8 h-8 rounded-lg border flex items-center justify-center overflow-hidden " + (bid ? 'bg-rose-950/80 border-rose-500/70' : 'bg-slate-900/90 border-sky-500/35'),
                                            title: bid ? "Banned: " + (0, _heroes.getMlbbHeroById)(bid).name : 'Open Blue Ban Slot',
                                            children: bid ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "relative",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                        heroId: bid,
                                                        size: 28
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "absolute inset-0 flex items-center justify-center text-rose-400 font-black text-sm",
                                                        children: "✕"
                                                    })
                                                ]
                                            }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[9px] text-slate-500 font-black",
                                                children: idx + 1
                                            })
                                        }, idx);
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-xs font-black text-[#FFE28A] tracking-wider uppercase",
                                        children: phase === 'ban' ? 'BAN PHASE (5 PER SIDE)' : phase === 'pick' ? 'PICK PHASE — LOCK YOUR HERO' : 'FINAL ADJUSTMENT & SWAP'
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[10px] text-slate-300",
                                        children: phase === 'ban' ? playerBanDone ? 'Waiting for remaining bans...' : 'Tap any hero tile to BAN' : phase === 'pick' ? playerLocked ? 'Allies & Enemies completing picks...' : 'Choose your hero and click LOCK IN' : 'Use ⇄ Swap arrows or tune Quick Prep'
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "px-3.5 py-1 rounded-xl border-2 text-lg font-black mlbb-num " + (timer <= 5 ? 'bg-rose-600/30 border-rose-400 text-rose-200' : 'bg-amber-500/20 border-[#E6B84C] text-[#FFE28A]'),
                                children: [
                                    timer,
                                    "s"
                                ]
                            })
                        ]
                    }),
                    isRanked ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-1",
                        children: [
                            [
                                0,
                                1,
                                2,
                                3,
                                4
                            ].map(function(idx) {
                                var bid = redBans[idx];
                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "w-8 h-8 rounded-lg border flex items-center justify-center overflow-hidden " + (bid ? 'bg-rose-950/80 border-rose-500/70' : 'bg-slate-900/90 border-rose-500/35'),
                                    title: bid ? "Banned: " + (0, _heroes.getMlbbHeroById)(bid).name : 'Open Red Ban Slot',
                                    children: bid ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "relative",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                heroId: bid,
                                                size: 28
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "absolute inset-0 flex items-center justify-center text-rose-400 font-black text-sm",
                                                children: "✕"
                                            })
                                        ]
                                    }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-[9px] text-slate-500 font-black",
                                        children: idx + 1
                                    })
                                }, idx);
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-[10px] font-black text-rose-400 ml-1",
                                children: "RED BANS"
                            })
                        ]
                    }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "text-[11px] font-black text-sky-300 uppercase",
                        children: [
                            mode,
                            " Blind Pick"
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "relative z-10 flex-1 grid grid-cols-12 gap-2.5 min-h-0 py-2",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "col-span-3 flex flex-col gap-1.5 overflow-y-auto",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "text-[10px] font-black text-sky-300 uppercase",
                                children: "BLUE TEAM (ALLIES)"
                            }),
                            blueRoster.map(function(slot, i) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p-2 rounded-xl border flex items-center justify-between gap-2 " + (i === 0 ? 'bg-sky-900/50 border-[#E6B84C]' : 'bg-[#0E1938]/90 border-sky-500/35'),
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center gap-2 min-w-0",
                                            children: [
                                                slot.heroId ? /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                    heroId: slot.heroId,
                                                    size: 36
                                                }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "w-9 h-9 rounded-full bg-slate-900 border border-sky-500/40 flex items-center justify-center text-xs text-slate-500",
                                                    children: "?"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-xs font-black text-white truncate",
                                                            children: slot.heroId ? (0, _heroes.getMlbbHeroById)(slot.heroId).name : 'Picking...'
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "text-[10px] text-sky-300 truncate",
                                                            children: [
                                                                slot.name,
                                                                " \xb7 ",
                                                                slot.lane
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center gap-1 shrink-0",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "text-xs",
                                                    title: (0, _emblems.getMlbbBattleSpellById)(slot.spellId).name,
                                                    children: (0, _emblems.getMlbbBattleSpellById)(slot.spellId).icon
                                                }),
                                                phase === 'adjustment' && i > 0 && slot.heroId && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    onClick: function onClick() {
                                                        return handleSwapWithAlly(i);
                                                    },
                                                    className: "px-1.5 py-1 rounded bg-[#E6B84C] text-slate-950 text-[10px] font-black cursor-pointer",
                                                    title: "Swap hero with " + slot.name,
                                                    children: "⇄"
                                                })
                                            ]
                                        })
                                    ]
                                }, i);
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "col-span-6 flex flex-col min-h-0 gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex flex-wrap items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                        value: draftSearch,
                                        onChange: function onChange(e) {
                                            return setDraftSearch(e.target.value);
                                        },
                                        placeholder: "Search " + _heroes.MLBB_ALL_HEROES.length + " heroes...",
                                        className: "flex-1 min-w-[120px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                                    }),
                                    [
                                        'All',
                                        'Tank',
                                        'Fighter',
                                        'Assassin',
                                        'Mage',
                                        'Marksman',
                                        'Support'
                                    ].map(function(r) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            onClick: function onClick() {
                                                return setDraftRole(r);
                                            },
                                            className: "px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer " + (draftRole === r ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-300'),
                                            children: r
                                        }, r);
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-[10px] font-bold text-slate-400",
                                        children: "LANE:"
                                    }),
                                    [].concat([
                                        'All'
                                    ], LANES).map(function(ln) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            onClick: function onClick() {
                                                return setDraftLane(ln);
                                            },
                                            className: "px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer " + (draftLane === ln ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-800/90 text-slate-300'),
                                            children: ln
                                        }, ln);
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "flex-1 grid grid-cols-4 sm:grid-cols-5 gap-1.5 overflow-y-auto pr-1",
                                children: filteredDraftHeroes.map(function(h) {
                                    var banned = allBanned.includes(h.id);
                                    var takenByOther = isRanked && allPicked.includes(h.id) && h.id !== selectedHeroId;
                                    var selected = phase === 'ban' ? banCandidateId === h.id : selectedHeroId === h.id;
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        disabled: banned || takenByOther,
                                        onClick: function onClick() {
                                            if (phase === 'ban') {
                                                if (!playerBanDone) {
                                                    _AudioEngine.mlbbAudio.playClick();
                                                    setBanCandidateId(h.id);
                                                }
                                            } else if (!playerLocked) {
                                                _AudioEngine.mlbbAudio.playClick();
                                                setSelectedHeroId(h.id);
                                            }
                                        },
                                        className: "p-1.5 rounded-xl border flex flex-col items-center gap-0.5 cursor-pointer transition " + (banned || takenByOther ? 'bg-slate-900/50 border-rose-900/50 opacity-35 cursor-not-allowed' : selected ? phase === 'ban' ? 'bg-rose-500/25 border-rose-400 scale-[1.03]' : 'bg-amber-500/20 border-[#FFE28A] scale-[1.03]' : 'bg-[#0E1938] border-slate-700 hover:border-slate-500'),
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                heroId: h.id,
                                                size: 38
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[10px] font-black text-white truncate max-w-full",
                                                children: h.name
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[9px] text-amber-300 truncate max-w-full",
                                                children: banned ? 'BANNED' : takenByOther ? 'PICKED' : h.lane
                                            })
                                        ]
                                    }, h.id);
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center gap-2 pt-1",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            var _profile_heroStats_selectedHeroId;
                                            _AudioEngine.mlbbAudio.playClick();
                                            var st = (_profile_heroStats_selectedHeroId = profile.heroStats[selectedHeroId]) != null ? _profile_heroStats_selectedHeroId : {
                                                matches: 14,
                                                wins: 10,
                                                mmr: 1620,
                                                mastery: 72
                                            };
                                            var wr = Math.round(st.wins / Math.max(1, st.matches) * 100);
                                            setDraftChat(function(c) {
                                                return [].concat(c, [
                                                    {
                                                        sender: profile.name,
                                                        text: "Showing " + hero.name + " (" + st.matches + " Matches \xb7 " + wr + "% WR \xb7 " + st.mmr + " MMR)!"
                                                    }
                                                ]);
                                            });
                                        },
                                        className: "px-3 py-2 rounded-xl bg-sky-700 hover:bg-sky-600 text-white text-xs font-black cursor-pointer whitespace-nowrap",
                                        children: "\uD83D\uDCCA Show Hero / Winrate"
                                    }),
                                    phase === 'ban' ? playerBanDone ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex-1 py-2 px-3 rounded-xl bg-rose-950/75 border border-rose-400/60 text-center text-xs font-black text-rose-200",
                                        children: [
                                            "Ban Locked \xb7 Waiting for remaining bans (",
                                            blueBans.length,
                                            "/5 Blue \xb7 ",
                                            redBans.length,
                                            "/5 Red)..."
                                        ]
                                    }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        disabled: !banCandidateId || allBanned.includes(banCandidateId),
                                        onClick: function onClick() {
                                            return handleBanHero(banCandidateId);
                                        },
                                        className: "flex-1 py-2.5 rounded-xl bg-rose-600 bg-gradient-to-r from-rose-600 via-red-500 to-rose-700 border border-rose-300 text-white font-black text-xs tracking-wide cursor-pointer shadow-lg hover:brightness-110 disabled:opacity-45",
                                        children: [
                                            "\uD83D\uDEAB BAN ",
                                            (0, _heroes.getMlbbHeroById)(banCandidateId).name.toUpperCase()
                                        ]
                                    }) : phase === 'pick' ? /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        disabled: playerLocked || allBanned.includes(selectedHeroId),
                                        onClick: function onClick() {
                                            _AudioEngine.mlbbAudio.playHeroLockIn();
                                            setPlayerLocked(true);
                                            triggerFlash(hero.name.toUpperCase(), hero.id, 'pick');
                                            setDraftChat(function(c) {
                                                return [].concat(c, [
                                                    {
                                                        sender: profile.name,
                                                        text: "Locked in " + hero.name + "!"
                                                    }
                                                ]);
                                            });
                                        },
                                        className: "flex-1 py-2.5 rounded-xl font-black text-xs tracking-wide cursor-pointer shadow-lg " + (playerLocked ? 'bg-emerald-700 border border-emerald-300 text-white' : 'bg-[#E6B84C] bg-gradient-to-r from-[#FFE28A] via-[#E6B84C] to-[#C88E20] border border-[#FFE28A] text-slate-950'),
                                        children: playerLocked ? "LOCKED IN: " + hero.name.toUpperCase() + " ✓" : "LOCK IN " + hero.name.toUpperCase()
                                    }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex-1 flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex-1 py-2 px-3 rounded-xl bg-amber-500/20 border border-[#E6B84C] text-center text-xs font-black text-[#FFE28A] mlbb-num",
                                                children: [
                                                    "FINAL ADJUSTMENT (",
                                                    timer,
                                                    "s)"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    _AudioEngine.mlbbAudio.playHeroLockIn();
                                                    launchNow();
                                                },
                                                className: "px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black cursor-pointer whitespace-nowrap shadow-lg",
                                                children: "⚔️ Launch Now"
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "col-span-3 flex flex-col gap-1.5 overflow-y-auto",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "text-[10px] font-black text-rose-300 uppercase text-right",
                                children: "RED TEAM (ENEMIES)"
                            }),
                            redRoster.map(function(slot, i) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p-2 rounded-xl bg-[#241022]/85 border border-rose-500/40 flex items-center justify-between gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "text-xs shrink-0",
                                            title: (0, _emblems.getMlbbBattleSpellById)(slot.spellId).name,
                                            children: slot.heroId ? (0, _emblems.getMlbbBattleSpellById)(slot.spellId).icon : '⏳'
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center gap-2 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "min-w-0 text-right",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-xs font-black text-white truncate",
                                                            children: slot.heroId ? (0, _heroes.getMlbbHeroById)(slot.heroId).name : 'Drafting...'
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "text-[10px] text-rose-300 truncate",
                                                            children: [
                                                                slot.name,
                                                                " \xb7 ",
                                                                slot.lane
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                slot.heroId ? /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                    heroId: slot.heroId,
                                                    size: 36
                                                }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "w-9 h-9 rounded-full bg-slate-900 border border-rose-500/40 flex items-center justify-center text-xs text-slate-500",
                                                    children: "?"
                                                })
                                            ]
                                        })
                                    ]
                                }, i);
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-2 pt-2 border-t border-[#E6B84C]/30 text-[11px]",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "lg:col-span-8 p-2 rounded-xl bg-[#0D1836] border border-slate-700 flex flex-wrap items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-[10px] font-black text-[#FFE28A]",
                                        children: "BUILD:"
                                    }),
                                    [
                                        0,
                                        1,
                                        2
                                    ].map(function(slot) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                            onClick: function onClick() {
                                                _AudioEngine.mlbbAudio.playClick();
                                                onUpdateProfile(function(p) {
                                                    var _obj;
                                                    return _extends({}, p, {
                                                        activeBuildSlot: _extends({}, p.activeBuildSlot, (_obj = {}, _obj[selectedHeroId] = slot, _obj))
                                                    });
                                                });
                                            },
                                            className: "px-2 py-1 rounded text-[10px] font-black cursor-pointer " + (buildIdx === slot ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-300'),
                                            children: [
                                                "P",
                                                slot + 1
                                            ]
                                        }, slot);
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                        value: "",
                                        onChange: function onChange(e) {
                                            var tplId = e.target.value;
                                            var templates = (0, _items.getProBuildTemplatesForHero)(hero);
                                            var chosen = templates.find(function(t) {
                                                return t.id === tplId;
                                            });
                                            if (!chosen) return;
                                            _AudioEngine.mlbbAudio.playClick();
                                            onUpdateProfile(function(p) {
                                                var _p_savedBuilds_selectedHeroId;
                                                var prevSet = (_p_savedBuilds_selectedHeroId = p.savedBuilds[selectedHeroId]) != null ? _p_savedBuilds_selectedHeroId : [
                                                    [].concat(templates[0].items),
                                                    [].concat(templates[1].items),
                                                    [].concat(templates[2].items)
                                                ];
                                                var nextSet = [
                                                    [].concat(prevSet[0]),
                                                    [].concat(prevSet[1]),
                                                    [].concat(prevSet[2])
                                                ];
                                                nextSet[buildIdx] = [].concat(chosen.items);
                                                var _obj;
                                                return _extends({}, p, {
                                                    savedBuilds: _extends({}, p.savedBuilds, (_obj = {}, _obj[selectedHeroId] = nextSet, _obj))
                                                });
                                            });
                                        },
                                        className: "px-1.5 py-1 rounded bg-slate-900 border border-[#E6B84C]/50 text-[10px] font-bold text-amber-200 max-w-[106px]",
                                        title: "Apply 1-Click Pro Build to active Preset",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                value: "",
                                                children: "⭐ Pro Build..."
                                            }),
                                            (0, _items.getProBuildTemplatesForHero)(hero).map(function(tpl) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                    value: tpl.id,
                                                    children: tpl.label
                                                }, tpl.id);
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                value: profile.selectedEmblemId,
                                onChange: function onChange(e) {
                                    return onUpdateProfile(function(p) {
                                        return _extends({}, p, {
                                            selectedEmblemId: e.target.value
                                        });
                                    });
                                },
                                className: "px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] text-white",
                                title: "Emblem Set",
                                children: _emblems.MLBB_EMBLEMS.map(function(em) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                        value: em.id,
                                        children: [
                                            em.icon,
                                            " ",
                                            em.name
                                        ]
                                    }, em.id);
                                })
                            }),
                            [
                                1,
                                2,
                                3
                            ].map(function(tier) {
                                var key = tier === 1 ? 't1' : tier === 2 ? 't2' : 't3';
                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                    value: activeTalents[key],
                                    onChange: function onChange(e) {
                                        return onUpdateProfile(function(p) {
                                            var _obj, _obj1;
                                            return _extends({}, p, {
                                                emblemTalents: _extends({}, p.emblemTalents, (_obj1 = {}, _obj1[p.selectedEmblemId] = _extends({}, p.emblemTalents[p.selectedEmblemId], (_obj = {}, _obj[key] = e.target.value, _obj)), _obj1))
                                            });
                                        });
                                    },
                                    className: "px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] text-amber-200 max-w-[106px]",
                                    title: "Tier " + tier + " Talent",
                                    children: _emblems.MLBB_TALENTS.filter(function(tl) {
                                        return tl.tier === tier;
                                    }).map(function(tl) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                            value: tl.id,
                                            children: [
                                                tl.icon,
                                                " ",
                                                tl.name
                                            ]
                                        }, tl.id);
                                    })
                                }, tier);
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                value: profile.selectedSpellId,
                                onChange: function onChange(e) {
                                    return onUpdateProfile(function(p) {
                                        return _extends({}, p, {
                                            selectedSpellId: e.target.value
                                        });
                                    });
                                },
                                className: "px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] text-cyan-200",
                                title: "Battle Spell",
                                children: _emblems.MLBB_BATTLE_SPELLS.map(function(s) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                        value: s.id,
                                        children: [
                                            s.icon,
                                            " ",
                                            s.name
                                        ]
                                    }, s.id);
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                value: (_profile_equippedSkins_selectedHeroId = profile.equippedSkins[selectedHeroId]) != null ? _profile_equippedSkins_selectedHeroId : hero.skins[0].id,
                                onChange: function onChange(e) {
                                    return onUpdateProfile(function(p) {
                                        var _obj;
                                        return _extends({}, p, {
                                            equippedSkins: _extends({}, p.equippedSkins, (_obj = {}, _obj[selectedHeroId] = e.target.value, _obj))
                                        });
                                    });
                                },
                                className: "px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] text-purple-200 max-w-[120px]",
                                title: "Skin Selector",
                                children: hero.skins.filter(function(s) {
                                    return s.id === 'default' || ownedHeroSkins.includes(s.id);
                                }).map(function(s) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                        value: s.id,
                                        children: [
                                            "\uD83C\uDFA8 ",
                                            s.name
                                        ]
                                    }, s.id);
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "lg:col-span-4 p-2 rounded-xl bg-[#0D1836] border border-slate-700 flex flex-col justify-between gap-1",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "max-h-10 overflow-y-auto space-y-0.5 text-[10px]",
                                children: draftChat.slice(-3).map(function(c, idx) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "truncate",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "font-black text-[#FFE28A]",
                                                children: [
                                                    c.sender,
                                                    ": "
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-slate-200",
                                                children: c.text
                                            })
                                        ]
                                    }, idx);
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("form", {
                                onSubmit: function onSubmit(e) {
                                    e.preventDefault();
                                    if (!draftChatInput.trim()) return;
                                    _AudioEngine.mlbbAudio.playClick();
                                    setDraftChat(function(prev) {
                                        return [].concat(prev, [
                                            {
                                                sender: profile.name,
                                                text: draftChatInput.trim()
                                            }
                                        ]);
                                    });
                                    setDraftChatInput('');
                                },
                                className: "flex gap-1",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                        value: draftChatInput,
                                        onChange: function onChange(e) {
                                            return setDraftChatInput(e.target.value);
                                        },
                                        placeholder: "Draft team chat...",
                                        className: "flex-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px] text-white"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "submit",
                                        className: "px-2 py-0.5 rounded bg-slate-700 text-[10px] font-black text-white cursor-pointer",
                                        children: "Send"
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
var MatchLoadingScreen = function MatchLoadingScreen(param) {
    var config = param.config, onReady = param.onReady;
    var _useState = (0, _react.useState)(0), progress = _useState[0], setProgress = _useState[1];
    var _useState1 = (0, _react.useState)({}), sparkCards = _useState1[0], setSparkCards = _useState1[1];
    var _useState2 = (0, _react.useState)(null), goodLuckBurst = _useState2[0], setGoodLuckBurst = _useState2[1];
    (0, _react.useEffect)(function() {
        var id = window.setInterval(function() {
            setProgress(function(p) {
                if (p >= 100) {
                    window.clearInterval(id);
                    window.setTimeout(onReady, 220);
                    return 100;
                }
                return Math.min(100, p + 9 + Math.floor(Math.random() * 11));
            });
        }, 125);
        return function() {
            return window.clearInterval(id);
        };
    }, [
        onReady
    ]);
    var variant = _mapData.MAP_VARIANTS_2026[config.mapVariant];
    var triggerSpark = function triggerSpark(cardKey, playerName) {
        _AudioEngine.mlbbAudio.playGold();
        setSparkCards(function(prev) {
            var _prev_cardKey;
            var _obj;
            return _extends({}, prev, (_obj = {}, _obj[cardKey] = ((_prev_cardKey = prev[cardKey]) != null ? _prev_cardKey : 0) + 1, _obj));
        });
        setGoodLuckBurst("✨ Good Luck, " + playerName + "!");
        window.setTimeout(function() {
            return setGoodLuckBurst(null);
        }, 1200);
    };
    var renderCard = function renderCard(m, idx, side) {
        var _sparkCards_key, _hero_skins_find, _ref;
        var key = side + "_" + idx;
        var sp = (_sparkCards_key = sparkCards[key]) != null ? _sparkCards_key : 0;
        // Showcase all 10 MLBB Rank Tiers across the 10-player clash cards
        var rankIdx = (side === 'blue' ? 5 + idx : idx) % _emblems.MLBB_RANK_TIERS.length;
        var tier = _emblems.MLBB_RANK_TIERS[rankIdx];
        var hero = (0, _heroes.getMlbbHeroById)(m.heroId);
        var equippedSkin = m.isPlayer ? (_hero_skins_find = hero.skins.find(function(s) {
            return s.id === config.playerSkinId;
        })) != null ? _hero_skins_find : hero.skins[0] : hero.skins[0];
        var spell = (0, _emblems.getMlbbBattleSpellById)(m.spellId);
        var emblem = (0, _emblems.getMlbbEmblemById)(m.emblemId);
        var skinTag = (_ref = equippedSkin == null ? void 0 : equippedSkin.tag) != null ? _ref : 'Classic';
        var pct = Math.min(100, progress + (idx + (side === 'red' ? 2 : 0)) % 3 * 4);
        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
            type: "button",
            onClick: function onClick() {
                return triggerSpark(key, m.name);
            },
            className: "relative p-[2px] rounded-2xl mlbb-rank-shimmer cursor-pointer transition hover:scale-[1.03]",
            style: {
                backgroundImage: "linear-gradient(135deg, " + tier.color + ", #FFE28A, " + tier.borderGlow + ")"
            },
            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "relative h-full p-2.5 rounded-[14px] flex flex-col items-center justify-between gap-1 " + (side === 'blue' ? 'bg-gradient-to-b from-[#0E1E44] to-[#081228]' : 'bg-gradient-to-b from-[#331126] to-[#170914]'),
                children: [
                    sp > 0 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                        className: "pointer-events-none absolute -top-2 left-1/2 px-2 py-0.5 rounded-full bg-[#FFE28A] text-slate-950 text-[10px] font-black shadow-lg whitespace-nowrap mlbb-spark-pop",
                        children: [
                            "✨ Good Luck! x",
                            sp
                        ]
                    }, key + "_" + sp),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "w-full flex items-center justify-between text-[9px] font-black",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                style: {
                                    color: tier.borderGlow
                                },
                                children: [
                                    tier.icon,
                                    " ",
                                    tier.name
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-purple-200",
                                children: skinTag
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                        heroId: m.heroId,
                        size: 52,
                        skinColor: equippedSkin == null ? void 0 : equippedSkin.color,
                        skinAccent: equippedSkin == null ? void 0 : equippedSkin.accent
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "text-xs font-black text-white truncate max-w-full",
                        children: [
                            hero.name,
                            m.isPlayer && equippedSkin && equippedSkin.id !== 'default' ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "text-[10px] text-[#FFE28A]",
                                children: [
                                    " \xb7 ",
                                    equippedSkin.name
                                ]
                            }) : null
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "text-[10px] truncate max-w-full " + (side === 'blue' ? 'text-sky-300' : 'text-rose-300'),
                        children: [
                            m.name,
                            " \xb7 ",
                            m.lane
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "w-full flex items-center justify-between text-[11px] px-1 pt-0.5 border-t border-slate-700/70",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                title: emblem.name,
                                children: emblem.icon
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "text-[10px] font-black text-emerald-400 mlbb-num",
                                children: [
                                    pct,
                                    "%"
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                title: spell.name,
                                children: spell.icon
                            })
                        ]
                    })
                ]
            })
        }, key);
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "relative w-full h-full bg-[#050A18] text-slate-100 flex flex-col justify-between p-4 overflow-hidden select-none",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-sky-900/28 to-transparent"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-rose-900/28 to-transparent"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
                className: "pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-16 mlbb-lightning-flare",
                viewBox: "0 0 1200 64",
                preserveAspectRatio: "none",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("defs", {
                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("linearGradient", {
                            id: "mlbbClashArc",
                            x1: "0%",
                            y1: "0%",
                            x2: "100%",
                            y2: "0%",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                    offset: "0%",
                                    stopColor: "#38BDF8"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                    offset: "50%",
                                    stopColor: "#FFE28A"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                                    offset: "100%",
                                    stopColor: "#EF4444"
                                })
                            ]
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("polyline", {
                        points: "0,34 140,26 260,38 420,20 560,36 600,14 640,46 780,24 940,38 1080,26 1200,32",
                        fill: "none",
                        stroke: "url(#mlbbClashArc)",
                        strokeWidth: "3"
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "relative z-10 flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "text-sm font-black text-[#FFE28A]",
                        children: [
                            config.mode.toUpperCase(),
                            " \xb7 ",
                            _mapData.MAP_THEMES[config.mapTheme].name
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "text-xs font-bold text-cyan-300",
                        children: [
                            variant.icon,
                            " 2026 Variant: ",
                            variant.name
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "relative z-10 grid grid-cols-5 gap-2.5",
                children: config.blueTeam.map(function(m, i) {
                    return renderCard(m, i, 'blue');
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "relative z-10 text-center py-1",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "text-2xl font-black text-[#FFE28A] tracking-[0.25em] drop-shadow",
                        children: "⚡ VS ⚡"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "text-xs text-slate-200 mt-0.5",
                        children: goodLuckBurst ? /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                            className: "font-black text-[#FFE28A]",
                            children: goodLuckBurst
                        }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                            children: [
                                "Tip: ",
                                variant.desc,
                                " \xb7 Tap any card to spark “Good Luck!”"
                            ]
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "max-w-md mx-auto h-2 mt-1.5 rounded-full bg-slate-800 overflow-hidden",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "h-full bg-gradient-to-r from-sky-400 via-[#FFE28A] to-rose-400 transition-all",
                            style: {
                                width: "" + progress + "%"
                            }
                        })
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "relative z-10 grid grid-cols-5 gap-2.5",
                children: config.redTeam.map(function(m, i) {
                    return renderCard(m, i, 'red');
                })
            })
        ]
    });
};

});

})(window.ArcadeMod);
