(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/nba2k14/components/MyCareerView ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/components/MyCareerView", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MyCareerView", {
    enumerable: true,
    get: function() {
        return MyCareerView;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _lucidereact = require("lucide-react");
var _Nba2k14Audio = require("../audio/Nba2k14Audio");
var _modesData = require("../data/modesData");
var _rosters = require("../data/rosters");
var _signatureSkills = require("../data/signatureSkills");
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
var POSITIONS = [
    'PG',
    'SG',
    'SF',
    'PF',
    'C'
];
var PLAY_STYLES = [
    'Athletic',
    'Scoring',
    '3PT Specialist',
    'All-Around',
    'Pass First',
    'Defensive',
    'Post',
    'Rebounding'
];
var HAIR_STYLES = [
    'fade',
    'short',
    'afro',
    'bald',
    'mohawk',
    'dreads'
];
var SKIN_TONES = [
    '#f2c9a8',
    '#dfb18d',
    '#c58f65',
    '#9c6844',
    '#7b4d31',
    '#5a351e',
    '#3e2313'
];
var SHOE_COLORS = [
    '#CE1141',
    '#F9A01B',
    '#FFFFFF',
    '#111827',
    '#2563EB',
    '#10B981',
    '#9333EA'
];
var ATTR_GROUPS = [
    {
        title: 'Shooting & Scoring',
        keys: [
            {
                key: 'closeShot',
                label: 'Close Shot'
            },
            {
                key: 'midRange',
                label: 'Mid-Range'
            },
            {
                key: 'threePt',
                label: '3PT Shooting'
            },
            {
                key: 'freeThrow',
                label: 'Free Throw'
            },
            {
                key: 'layup',
                label: 'Driving Layup'
            },
            {
                key: 'dunk',
                label: 'Driving Dunk'
            },
            {
                key: 'standingDunk',
                label: 'Standing Dunk'
            },
            {
                key: 'postHook',
                label: 'Post Hook'
            },
            {
                key: 'postFade',
                label: 'Post Fadeaway'
            },
            {
                key: 'shotInTraffic',
                label: 'Shot in Traffic'
            }
        ]
    },
    {
        title: 'Playmaking & Athleticism',
        keys: [
            {
                key: 'ballHandle',
                label: 'Ball Handling'
            },
            {
                key: 'passAccuracy',
                label: 'Pass Accuracy'
            },
            {
                key: 'offAwareness',
                label: 'Off. Awareness'
            },
            {
                key: 'speed',
                label: 'Speed'
            },
            {
                key: 'quickness',
                label: 'Quickness'
            },
            {
                key: 'vertical',
                label: 'Vertical'
            },
            {
                key: 'strength',
                label: 'Strength'
            },
            {
                key: 'stamina',
                label: 'Stamina'
            },
            {
                key: 'hustle',
                label: 'Hustle'
            }
        ]
    },
    {
        title: 'Defense & Rebounding',
        keys: [
            {
                key: 'onBallDefense',
                label: 'On-Ball Defense'
            },
            {
                key: 'steal',
                label: 'Steal'
            },
            {
                key: 'block',
                label: 'Block'
            },
            {
                key: 'defAwareness',
                label: 'Def. Awareness'
            },
            {
                key: 'offRebound',
                label: 'Off. Rebound'
            },
            {
                key: 'defRebound',
                label: 'Def. Rebound'
            }
        ]
    }
];
function computePlayerOvrFromAttrs(attrs) {
    var vals = Object.values(attrs);
    var avg = vals.reduce(function(a, b) {
        return a + b;
    }, 0) / vals.length;
    return Math.max(60, Math.min(99, Math.round(avg + 4)));
}
var MyCareerView = function MyCareerView(param) {
    var save = param.save, onUpdateSave = param.onUpdateSave, onStartMatch = param.onStartMatch, onOpenOptions = param.onOpenOptions;
    var _ref, _myCareer_player_jumpShotForm, _myCareer_player_dunkPackage, _myCareer_player_dribbleStyle;
    var _nextOpponent_players_find;
    var myCareer = save.myCareer, vip = save.vip;
    var _useState = (0, _react.useState)('play'), hubTab = _useState[0], setHubTab = _useState[1];
    // Creation form state
    var _useState1 = (0, _react.useState)(myCareer.player.name), name = _useState1[0], setName = _useState1[1];
    var _useState2 = (0, _react.useState)(myCareer.player.jersey), jersey = _useState2[0], setJersey = _useState2[1];
    var _useState3 = (0, _react.useState)(myCareer.player.pos), pos = _useState3[0], setPos = _useState3[1];
    var _useState4 = (0, _react.useState)(myCareer.playStyle), playStyle = _useState4[0], setPlayStyle = _useState4[1];
    var _useState5 = (0, _react.useState)(myCareer.player.heightCm), heightCm = _useState5[0], setHeightCm = _useState5[1];
    var _useState6 = (0, _react.useState)(myCareer.player.weightLbs), weightLbs = _useState6[0], setWeightLbs = _useState6[1];
    var _useState7 = (0, _react.useState)(myCareer.player.skinTone), skinTone = _useState7[0], setSkinTone = _useState7[1];
    var _useState8 = (0, _react.useState)(myCareer.player.hairStyle), hairStyle = _useState8[0], setHairStyle = _useState8[1];
    var _useState9 = (0, _react.useState)(myCareer.player.headband), headband = _useState9[0], setHeadband = _useState9[1];
    var _useState10 = (0, _react.useState)(myCareer.player.armSleeve), armSleeve = _useState10[0], setArmSleeve = _useState10[1];
    var _useState11 = (0, _react.useState)(myCareer.player.legSleeve), legSleeve = _useState11[0], setLegSleeve = _useState11[1];
    var _useState12 = (0, _react.useState)(myCareer.player.shoeColor), shoeColor = _useState12[0], setShoeColor = _useState12[1];
    var _useState13 = (0, _react.useState)('ALL'), skillFilter = _useState13[0], setSkillFilter = _useState13[1];
    var myTeam = (0, _react.useMemo)(function() {
        return (0, _rosters.getTeamById)(myCareer.teamId);
    }, [
        myCareer.teamId
    ]);
    var nextOpponent = (0, _react.useMemo)(function() {
        var others = _rosters.NBA_TEAMS.filter(function(t) {
            return t.id !== myCareer.teamId;
        });
        return others[myCareer.seasonGameIndex % others.length];
    }, [
        myCareer.teamId,
        myCareer.seasonGameIndex
    ]);
    var isKeyGame = (myCareer.seasonGameIndex + 1) % 3 === 0 || nextOpponent.ovr >= 86;
    var leagueLeaders = (0, _react.useMemo)(function() {
        var mpPpg = myCareer.gameLogs.length > 0 ? myCareer.gameLogs.reduce(function(a, g) {
            return a + g.pts;
        }, 0) / myCareer.gameLogs.length : 0;
        return [].concat([
            {
                name: 'Kevin Durant',
                team: 'OKC',
                ppg: 31.4,
                apg: 5.5,
                rpg: 7.4
            },
            {
                name: 'LeBron James',
                team: 'MIA',
                ppg: 27.9,
                apg: 6.8,
                rpg: 7.1
            },
            {
                name: 'Carmelo Anthony',
                team: 'NYK',
                ppg: 27.4,
                apg: 3.1,
                rpg: 8.1
            },
            {
                name: 'James Harden',
                team: 'HOU',
                ppg: 25.4,
                apg: 6.1,
                rpg: 4.7
            },
            {
                name: 'Stephen Curry',
                team: 'GSW',
                ppg: 24.0,
                apg: 8.5,
                rpg: 4.3
            }
        ], myCareer.gameLogs.length > 0 ? [
            {
                name: "" + myCareer.player.name + " (YOU)",
                team: myTeam.code,
                ppg: Number(mpPpg.toFixed(1)),
                apg: Number((myCareer.gameLogs.reduce(function(a, g) {
                    return a + g.ast;
                }, 0) / myCareer.gameLogs.length).toFixed(1)),
                rpg: Number((myCareer.gameLogs.reduce(function(a, g) {
                    return a + g.reb;
                }, 0) / myCareer.gameLogs.length).toFixed(1))
            }
        ] : []).sort(function(a, b) {
            return b.ppg - a.ppg;
        });
    }, [
        myCareer.gameLogs,
        myCareer.player.name,
        myTeam.code
    ]);
    var handleCreateMyPlayer = function handleCreateMyPlayer() {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        var built = (0, _storage.buildMyPlayerFromSpec)(name, jersey, pos, playStyle, heightCm, weightLbs, skinTone, hairStyle, headband, armSleeve, legSleeve, shoeColor, 'mia');
        onUpdateSave(function(prev) {
            return _extends({}, prev, {
                lastMode: 'mycareer',
                myCareer: _extends({}, prev.myCareer, {
                    created: true,
                    playStyle: playStyle,
                    player: built
                })
            });
        });
    };
    var launchRookieShowcase = function launchRookieShowcase() {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        var homeTeam = (0, _rosters.getTeamById)('allstar_east');
        var awayTeam = (0, _rosters.getTeamById)('allstar_west');
        var showcaseHome = [].concat([
            myCareer.player
        ], homeTeam.players.slice(1, 5));
        onStartMatch({
            mode: 'rookie_showcase',
            title: '2014 ROOKIE SHOWCASE',
            subtitle: 'Player Lock · Impress NBA Scouts for a Lottery Pick',
            homeTeamId: 'mia',
            awayTeamId: 'okc',
            homeCustomPlayers: showcaseHome,
            awayCustomPlayers: awayTeam.players.slice(0, 5),
            userSide: 'home',
            courtEnv: 'nba',
            quarterLengthMin: Math.min(save.settings.game.quarterLengthMin, 3),
            playersPerSide: 5,
            playerLockId: myCareer.player.id
        });
    };
    var quickDraftNow = function quickDraftNow() {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        var pick = 11;
        var draftedTeam = _rosters.NBA_TEAMS[pick - 1];
        onUpdateSave(function(prev) {
            return _extends({}, prev, {
                lastMode: 'mycareer',
                vip: _extends({}, prev.vip, {
                    unlockedAchievements: Array.from(new Set([].concat(prev.vip.unlockedAchievements, [
                        'mycareer_draft'
                    ])))
                }),
                myCareer: _extends({}, prev.myCareer, {
                    drafted: true,
                    draftPick: pick,
                    teamId: draftedTeam.id,
                    player: _extends({}, prev.myCareer.player, {
                        teamId: draftedTeam.id
                    }),
                    socialFeed: [].concat([
                        {
                            id: "qd_" + Date.now(),
                            handle: '@NBADraft2014',
                            text: "Lottery Selection! With pick #" + pick + ", the " + draftedTeam.fullName + " draft " + prev.myCareer.player.name + ".",
                            time: 'Just now'
                        }
                    ], prev.myCareer.socialFeed)
                })
            });
        });
    };
    var launchNextCareerGame = function launchNextCareerGame() {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        var teammates = myTeam.players.filter(function(p) {
            return p.pos !== myCareer.player.pos;
        }).slice(0, 4);
        var homeLineup = [].concat([
            myCareer.player
        ], teammates);
        onStartMatch({
            mode: 'mycareer',
            title: isKeyGame ? "KEY GAME: " + myTeam.code + " vs " + nextOpponent.code : "GAME #" + (myCareer.seasonGameIndex + 1) + ": " + myTeam.code + " vs " + nextOpponent.code,
            subtitle: "MyCAREER Player Lock \xb7 " + myCareer.player.name + " (#" + myCareer.player.jersey + ")",
            homeTeamId: myTeam.id,
            awayTeamId: nextOpponent.id,
            homeCustomPlayers: homeLineup,
            userSide: 'home',
            courtEnv: 'nba',
            quarterLengthMin: save.settings.game.quarterLengthMin,
            playersPerSide: 5,
            playerLockId: myCareer.player.id
        });
    };
    var upgradeAttribute = function upgradeAttribute(key) {
        var cur = myCareer.player.attrs[key];
        if (cur >= 99) return;
        var cost = Math.round(75 + Math.max(0, cur - 60) * 14);
        var useSp = vip.sp >= cost;
        var useVc = !useSp && vip.vc >= cost;
        if (!useSp && !useVc) return;
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        onUpdateSave(function(prev) {
            var _obj;
            var nextAttrs = _extends({}, prev.myCareer.player.attrs, (_obj = {}, _obj[key] = Math.min(99, prev.myCareer.player.attrs[key] + 1), _obj));
            return _extends({}, prev, {
                vip: _extends({}, prev.vip, {
                    sp: useSp ? prev.vip.sp - cost : prev.vip.sp,
                    vc: useVc ? prev.vip.vc - cost : prev.vip.vc
                }),
                myCareer: _extends({}, prev.myCareer, {
                    player: _extends({}, prev.myCareer.player, {
                        attrs: nextAttrs,
                        ovr: computePlayerOvrFromAttrs(nextAttrs)
                    })
                })
            });
        });
    };
    var buyOrUpgradeSkill = function buyOrUpgradeSkill(skillId) {
        var def = _signatureSkills.SIGNATURE_SKILL_MAP[skillId];
        var existing = myCareer.player.signatureSkills.find(function(s) {
            return s.id === skillId;
        });
        if (!existing && myCareer.player.signatureSkills.length >= 5) return;
        var nextLevel = existing ? existing.level + 1 : 1;
        if (nextLevel > 3) return;
        var cost = def.costSp[nextLevel - 1];
        var useSp = vip.sp >= cost;
        var useVc = !useSp && vip.vc >= cost;
        if (!useSp && !useVc) return;
        _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
        onUpdateSave(function(prev) {
            var nextSkills = existing ? prev.myCareer.player.signatureSkills.map(function(s) {
                return s.id === skillId ? _extends({}, s, {
                    level: nextLevel
                }) : s;
            }) : [].concat(prev.myCareer.player.signatureSkills, [
                {
                    id: skillId,
                    level: 1
                }
            ]);
            return _extends({}, prev, {
                vip: _extends({}, prev.vip, {
                    sp: useSp ? prev.vip.sp - cost : prev.vip.sp,
                    vc: useVc ? prev.vip.vc - cost : prev.vip.vc
                }),
                myCareer: _extends({}, prev.myCareer, {
                    player: _extends({}, prev.myCareer.player, {
                        signatureSkills: nextSkills
                    })
                })
            });
        });
    };
    var removeSkill = function removeSkill(skillId) {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('hover');
        onUpdateSave(function(prev) {
            return _extends({}, prev, {
                myCareer: _extends({}, prev.myCareer, {
                    player: _extends({}, prev.myCareer.player, {
                        signatureSkills: prev.myCareer.player.signatureSkills.filter(function(s) {
                            return s.id !== skillId;
                        })
                    })
                })
            });
        });
    };
    var updateSignatureAnim = function updateSignatureAnim(field, value) {
        _Nba2k14Audio.Nba2k14Audio.playUiClick('hover');
        onUpdateSave(function(prev) {
            var _obj;
            return _extends({}, prev, {
                myCareer: _extends({}, prev.myCareer, {
                    player: _extends({}, prev.myCareer.player, (_obj = {}, _obj[field] = value, _obj))
                })
            });
        });
    };
    // STEP 1: MyPLAYER CREATION
    if (!myCareer.created) {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
            className: "h-full overflow-y-auto px-5 py-4",
            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "max-w-5xl mx-auto bg-[#0f1116]/94 border border-white/15 rounded-xl p-6 shadow-2xl",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-5",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[11px] font-bold tracking-[0.2em] text-[#F9A01B] uppercase",
                                        children: "NBA 2K14 \xb7 MyCAREER"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                        className: "text-2xl font-black tracking-tight text-white uppercase",
                                        children: "CREATE YOUR MyPLAYER"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: handleCreateMyPlayer,
                                className: "px-6 py-2.5 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-sm tracking-wider uppercase flex items-center gap-2 transition cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Check, {
                                        className: "w-4 h-4"
                                    }),
                                    " Finalize & Enter Rookie Showcase"
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "grid grid-cols-3 gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "col-span-2",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                        className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
                                                        children: "Player Name"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                        value: name,
                                                        onChange: function onChange(e) {
                                                            return setName(e.target.value);
                                                        },
                                                        maxLength: 22,
                                                        className: "mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#CE1141]"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                        className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
                                                        children: "Jersey #"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                        type: "number",
                                                        min: 0,
                                                        max: 99,
                                                        value: jersey,
                                                        onChange: function onChange(e) {
                                                            return setJersey(Math.max(0, Math.min(99, Number(e.target.value) || 0)));
                                                        },
                                                        className: "mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#CE1141]"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
                                                children: "Position"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "mt-1.5 grid grid-cols-5 gap-2",
                                                children: POSITIONS.map(function(p) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: function onClick() {
                                                            _Nba2k14Audio.Nba2k14Audio.playUiClick('hover');
                                                            setPos(p);
                                                        },
                                                        className: "py-2 rounded-lg font-black text-xs border transition cursor-pointer " + (pos === p ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#171a22] border-white/10 text-zinc-300 hover:border-white/30'),
                                                        children: p
                                                    }, p);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
                                                children: "Play Style Archetype"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2",
                                                children: PLAY_STYLES.map(function(st) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: function onClick() {
                                                            _Nba2k14Audio.Nba2k14Audio.playUiClick('hover');
                                                            setPlayStyle(st);
                                                        },
                                                        className: "py-2 px-2 rounded-lg font-bold text-[11px] border transition cursor-pointer " + (playStyle === st ? 'bg-[#F9A01B]/20 border-[#F9A01B] text-[#F9A01B]' : 'bg-[#171a22] border-white/10 text-zinc-300 hover:border-white/30'),
                                                        children: st
                                                    }, st);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "grid grid-cols-2 gap-4 pt-1",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex justify-between text-[11px] font-bold text-zinc-400",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                children: "HEIGHT"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                className: "text-white",
                                                                children: [
                                                                    heightCm,
                                                                    " cm (",
                                                                    Math.floor(heightCm / 30.48),
                                                                    "'",
                                                                    Math.round(heightCm % 30.48 / 2.54),
                                                                    '")'
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                        type: "range",
                                                        min: 175,
                                                        max: 221,
                                                        value: heightCm,
                                                        onChange: function onChange(e) {
                                                            return setHeightCm(Number(e.target.value));
                                                        },
                                                        className: "w-full accent-[#CE1141] mt-1"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex justify-between text-[11px] font-bold text-zinc-400",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                children: "WEIGHT"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                className: "text-white",
                                                                children: [
                                                                    weightLbs,
                                                                    " lbs"
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                        type: "range",
                                                        min: 170,
                                                        max: 285,
                                                        value: weightLbs,
                                                        onChange: function onChange(e) {
                                                            return setWeightLbs(Number(e.target.value));
                                                        },
                                                        className: "w-full accent-[#CE1141] mt-1"
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
                                                children: "Skin Tone"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "mt-1.5 flex gap-2",
                                                children: SKIN_TONES.map(function(tone) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: function onClick() {
                                                            return setSkinTone(tone);
                                                        },
                                                        style: {
                                                            backgroundColor: tone
                                                        },
                                                        className: "w-8 h-8 rounded-full border-2 cursor-pointer " + (skinTone === tone ? 'border-[#F9A01B] scale-110' : 'border-white/20')
                                                    }, tone);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
                                                children: "Hair Style"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "mt-1.5 grid grid-cols-3 gap-2",
                                                children: HAIR_STYLES.map(function(hs) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: function onClick() {
                                                            return setHairStyle(hs);
                                                        },
                                                        className: "py-1.5 rounded-lg text-xs font-bold uppercase border cursor-pointer " + (hairStyle === hs ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#171a22] border-white/10 text-zinc-300'),
                                                        children: hs
                                                    }, hs);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
                                                children: "Accessories & Gear"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "mt-1.5 grid grid-cols-3 gap-2",
                                                children: [
                                                    {
                                                        label: 'Headband',
                                                        val: headband,
                                                        set: setHeadband
                                                    },
                                                    {
                                                        label: 'Arm Sleeve',
                                                        val: armSleeve,
                                                        set: setArmSleeve
                                                    },
                                                    {
                                                        label: 'Leg Sleeve',
                                                        val: legSleeve,
                                                        set: setLegSleeve
                                                    }
                                                ].map(function(item) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        onClick: function onClick() {
                                                            return item.set(!item.val);
                                                        },
                                                        className: "py-2 rounded-lg text-xs font-bold border cursor-pointer " + (item.val ? 'bg-emerald-600/25 border-emerald-400 text-emerald-200' : 'bg-[#171a22] border-white/10 text-zinc-400'),
                                                        children: [
                                                            item.label,
                                                            ": ",
                                                            item.val ? 'ON' : 'OFF'
                                                        ]
                                                    }, item.label);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
                                                children: "Signature Sneaker Colorway"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "mt-1.5 flex gap-2",
                                                children: SHOE_COLORS.map(function(col) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: function onClick() {
                                                            return setShoeColor(col);
                                                        },
                                                        style: {
                                                            backgroundColor: col
                                                        },
                                                        className: "w-8 h-8 rounded-lg border-2 cursor-pointer " + (shoeColor === col ? 'border-[#F9A01B] scale-110' : 'border-white/25')
                                                    }, col);
                                                })
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
    }
    // STEP 2: ROOKIE SHOWCASE & DRAFT
    if (!myCareer.drafted) {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
            className: "h-full flex items-center justify-center p-6",
            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "max-w-2xl w-full bg-[#0f1116]/95 border border-white/15 rounded-xl p-7 shadow-2xl",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "text-[11px] font-bold uppercase tracking-[0.22em] text-[#F9A01B]",
                        children: "2014 NBA DRAFT COMBINE"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                        className: "text-3xl font-black text-white uppercase mt-1",
                        children: "ROOKIE SHOWCASE"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("p", {
                        className: "text-sm text-zinc-300 mt-2 leading-relaxed",
                        children: [
                            "Step onto the hardwood in Player Lock as ",
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-white font-bold",
                                children: myCareer.player.name
                            }),
                            ' ',
                            "(#",
                            myCareer.player.jersey,
                            " ",
                            myCareer.player.pos,
                            " \xb7 ",
                            myCareer.playStyle,
                            " \xb7 ",
                            myCareer.player.ovr,
                            " OVR). Your Teammate Grade (F to A+) and box score directly determine your NBA Draft position and starting franchise."
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "grid grid-cols-3 gap-3 my-5",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#171a22] border border-white/10 rounded-lg p-3",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[10px] text-zinc-400 uppercase font-bold",
                                        children: "Lottery Target"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-lg font-black text-[#F9A01B]",
                                        children: "A- / A+ Grade"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#171a22] border border-white/10 rounded-lg p-3",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[10px] text-zinc-400 uppercase font-bold",
                                        children: "Control Mode"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-lg font-black text-white",
                                        children: "Player Lock"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#171a22] border border-white/10 rounded-lg p-3",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[10px] text-zinc-400 uppercase font-bold",
                                        children: "Starting Skills"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-sm font-bold text-zinc-200",
                                        children: myCareer.player.signatureSkills.map(function(s) {
                                            return _signatureSkills.SIGNATURE_SKILL_MAP[s.id].code;
                                        }).join(' · ')
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex flex-wrap gap-3",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: launchRookieShowcase,
                                className: "flex-1 py-3 px-5 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Play, {
                                        className: "w-4 h-4 fill-current"
                                    }),
                                    " Play Rookie Showcase"
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: quickDraftNow,
                                className: "py-3 px-4 rounded-lg bg-[#1c202a] hover:bg-[#262b38] border border-white/15 text-zinc-200 font-bold uppercase text-xs tracking-wider cursor-pointer",
                                children: "Sim Draft Lottery"
                            })
                        ]
                    })
                ]
            })
        });
    }
    // STEP 3: FULL MYCAREER HUB
    var filteredSkills = _signatureSkills.SIGNATURE_SKILLS.filter(function(s) {
        return skillFilter === 'ALL' || s.category === skillFilter;
    });
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h-full flex flex-col px-5 py-3 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl px-5 py-3 mb-3 flex flex-wrap items-center justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                style: {
                                    backgroundColor: myTeam.primaryColor,
                                    borderColor: myTeam.secondaryColor
                                },
                                className: "w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-white font-black leading-none",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-[10px]",
                                        children: myTeam.code
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "text-lg",
                                        children: [
                                            "#",
                                            myCareer.player.jersey
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-lg font-black text-white uppercase",
                                                children: myCareer.player.name
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "px-2 py-0.5 rounded bg-[#F9A01B]/20 border border-[#F9A01B]/50 text-[#F9A01B] text-[11px] font-black",
                                                children: [
                                                    myCareer.player.ovr,
                                                    " OVR"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-xs font-bold text-zinc-400",
                                                children: [
                                                    myCareer.player.pos,
                                                    " \xb7 Pick #",
                                                    myCareer.draftPick,
                                                    " \xb7 ",
                                                    myTeam.fullName
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-xs text-zinc-400 mt-0.5 flex flex-wrap gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    "Record: ",
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                        className: "text-white",
                                                        children: [
                                                            myCareer.wins,
                                                            "-",
                                                            myCareer.losses
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    "Team Chemistry: ",
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                        className: "text-emerald-400",
                                                        children: [
                                                            myCareer.chemistry,
                                                            "%"
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    "Fans: ",
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        className: "text-[#F9A01B]",
                                                        children: myCareer.fans.toLocaleString()
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    "Skill Points: ",
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                        className: "text-cyan-300",
                                                        children: [
                                                            vip.sp.toLocaleString(),
                                                            " SP"
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    "VC: ",
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                        className: "text-[#F9A01B]",
                                                        children: [
                                                            vip.vc.toLocaleString(),
                                                            " VC"
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
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                            [
                                {
                                    id: 'play',
                                    label: 'Play Next Game',
                                    icon: _lucidereact.Play
                                },
                                {
                                    id: 'player',
                                    label: 'MyPLAYER',
                                    icon: _lucidereact.User
                                },
                                {
                                    id: 'skills',
                                    label: 'Sig Skills',
                                    icon: _lucidereact.Sparkles
                                },
                                {
                                    id: 'league',
                                    label: 'League & Social',
                                    icon: _lucidereact.Users
                                },
                                {
                                    id: 'drills',
                                    label: 'Practice',
                                    icon: _lucidereact.Dumbbell
                                }
                            ].map(function(t) {
                                var Icon = t.icon;
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    onClick: function onClick() {
                                        _Nba2k14Audio.Nba2k14Audio.playUiClick('hover');
                                        setHubTab(t.id);
                                    },
                                    className: "px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border transition cursor-pointer " + (hubTab === t.id ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#171a22] border-white/10 text-zinc-300 hover:border-white/30'),
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)(Icon, {
                                            className: "w-3.5 h-3.5"
                                        }),
                                        " ",
                                        t.label
                                    ]
                                }, t.id);
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: onOpenOptions,
                                className: "px-2.5 py-2 rounded-lg text-xs font-bold uppercase bg-[#171a22] border border-white/10 text-zinc-300 hover:border-white/30 cursor-pointer",
                                title: "Options",
                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Sliders, {
                                    className: "w-3.5 h-3.5"
                                })
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "flex-1 min-h-0 overflow-y-auto",
                children: [
                    hubTab === 'play' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lg:col-span-2 bg-[#0f1116]/94 border border-white/15 rounded-xl p-5 flex flex-col justify-between",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-[11px] font-black uppercase tracking-[0.2em] text-[#F9A01B]",
                                                        children: isKeyGame ? '2X SP KEY GAME · NATIONALLY TELEVISED' : "REGULAR SEASON \xb7 GAME #" + (myCareer.seasonGameIndex + 1)
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-xs text-zinc-400",
                                                        children: myTeam.arenaName
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "mt-4 flex items-center justify-between bg-[#151820] border border-white/10 rounded-xl p-5",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "text-center flex-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                style: {
                                                                    backgroundColor: myTeam.primaryColor
                                                                },
                                                                className: "w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-white font-black text-xl border border-white/20",
                                                                children: myTeam.code
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "mt-2 font-black text-white",
                                                                children: myTeam.fullName
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-xs text-zinc-400",
                                                                children: [
                                                                    "OVR ",
                                                                    myTeam.ovr,
                                                                    " \xb7 HOME"
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "px-4 text-center",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-2xl font-black text-[#CE1141] italic",
                                                                children: "VS"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-[10px] uppercase text-zinc-400 mt-1",
                                                                children: "Player Lock"
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "text-center flex-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                style: {
                                                                    backgroundColor: nextOpponent.primaryColor
                                                                },
                                                                className: "w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-white font-black text-xl border border-white/20",
                                                                children: nextOpponent.code
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "mt-2 font-black text-white",
                                                                children: nextOpponent.fullName
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-xs text-zinc-400",
                                                                children: [
                                                                    "OVR ",
                                                                    nextOpponent.ovr,
                                                                    " \xb7 AWAY"
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "mt-4 grid grid-cols-3 gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "bg-[#151820] border border-white/10 rounded-lg p-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-[10px] uppercase text-zinc-400 font-bold",
                                                                children: "Coach Goal"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-xs font-bold text-white mt-0.5",
                                                                children: "Finish with B+ Grade or better"
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "bg-[#151820] border border-white/10 rounded-lg p-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-[10px] uppercase text-zinc-400 font-bold",
                                                                children: "Key Matchup"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-xs font-bold text-white mt-0.5",
                                                                children: (_ref = (_nextOpponent_players_find = nextOpponent.players.find(function(p) {
                                                                    return p.pos === myCareer.player.pos;
                                                                })) == null ? void 0 : _nextOpponent_players_find.name) != null ? _ref : nextOpponent.players[0].name
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "bg-[#151820] border border-white/10 rounded-lg p-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-[10px] uppercase text-zinc-400 font-bold",
                                                                children: "Payout Multiplier"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "text-xs font-bold text-[#F9A01B] mt-0.5",
                                                                children: isKeyGame ? '2.0x SP & VC' : '1.0x SP & VC'
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        onClick: launchNextCareerGame,
                                        className: "mt-5 w-full py-3.5 rounded-xl bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase tracking-[0.15em] text-sm flex items-center justify-center gap-2 transition cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Play, {
                                                className: "w-4 h-4 fill-current"
                                            }),
                                            " Tip Off Game #",
                                            myCareer.seasonGameIndex + 1
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-4 flex flex-col",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-xs font-black uppercase tracking-wider text-[#F9A01B] mb-2 flex items-center gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.TrendingUp, {
                                                className: "w-3.5 h-3.5"
                                            }),
                                            " Recent Game Logs"
                                        ]
                                    }),
                                    myCareer.gameLogs.length === 0 ? /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-xs text-zinc-400 py-8 text-center",
                                        children: "No regular season games logged yet. Play Game #1 to build your Rookie of the Year resume!"
                                    }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "space-y-2 overflow-y-auto max-h-72 pr-1",
                                        children: myCareer.gameLogs.map(function(log) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "bg-[#151820] border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between text-xs",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "font-black mr-2 " + (log.won ? 'text-emerald-400' : 'text-red-400'),
                                                                children: log.won ? 'W' : 'L'
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                className: "text-white font-bold",
                                                                children: [
                                                                    "vs ",
                                                                    log.opponentCode
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                className: "text-zinc-400 ml-2",
                                                                children: [
                                                                    log.teamScore,
                                                                    "-",
                                                                    log.oppScore
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "text-right",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                className: "text-white font-bold",
                                                                children: [
                                                                    log.pts,
                                                                    "P/",
                                                                    log.reb,
                                                                    "R/",
                                                                    log.ast,
                                                                    "A"
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "ml-2 px-1.5 py-0.5 rounded bg-[#F9A01B]/20 text-[#F9A01B] font-black",
                                                                children: log.grade
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }, log.gameNum);
                                        })
                                    })
                                ]
                            })
                        ]
                    }),
                    hubTab === 'player' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "lg:col-span-2 space-y-4",
                                children: ATTR_GROUPS.map(function(grp) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-4",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                className: "text-xs font-black uppercase tracking-widest text-[#F9A01B] mb-3",
                                                children: grp.title
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5",
                                                children: grp.keys.map(function(param) {
                                                    var key = param.key, label = param.label;
                                                    var val = myCareer.player.attrs[key];
                                                    var cost = Math.round(75 + Math.max(0, val - 60) * 14);
                                                    var canAfford = val < 99 && (vip.sp >= cost || vip.vc >= cost);
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "bg-[#151820] border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "flex-1 min-w-0",
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                        className: "flex justify-between text-xs",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                                className: "text-zinc-300 font-semibold truncate",
                                                                                children: label
                                                                            }),
                                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                                className: "text-white font-black",
                                                                                children: val
                                                                            })
                                                                        ]
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                        className: "h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1",
                                                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                            className: "h-full bg-gradient-to-r from-[#CE1141] to-[#F9A01B]",
                                                                            style: {
                                                                                width: "" + val + "%"
                                                                            }
                                                                        })
                                                                    })
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                disabled: !canAfford,
                                                                onClick: function onClick() {
                                                                    return upgradeAttribute(key);
                                                                },
                                                                className: "px-2.5 py-1 rounded text-[10px] font-black uppercase shrink-0 cursor-pointer " + (val >= 99 ? 'bg-emerald-900/40 text-emerald-300 cursor-default' : canAfford ? 'bg-[#CE1141] hover:bg-[#e1194d] text-white' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'),
                                                                children: val >= 99 ? 'MAX' : "+1 (" + cost + ")"
                                                            })
                                                        ]
                                                    }, key);
                                                })
                                            })
                                        ]
                                    }, grp.title);
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-4 space-y-4 h-fit",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                        className: "text-xs font-black uppercase tracking-widest text-[#F9A01B]",
                                        children: "Signature Animations"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[11px] font-bold text-zinc-400 uppercase",
                                                children: "Jump Shot Form"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                value: (_myCareer_player_jumpShotForm = myCareer.player.jumpShotForm) != null ? _myCareer_player_jumpShotForm : 'LeBron James',
                                                onChange: function onChange(e) {
                                                    return updateSignatureAnim('jumpShotForm', e.target.value);
                                                },
                                                className: "mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-xs font-bold text-white",
                                                children: _modesData.SIGNATURE_ANIMATION_SETS.jumpShotForms.map(function(f) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: f,
                                                        children: f
                                                    }, f);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[11px] font-bold text-zinc-400 uppercase",
                                                children: "Dunk Package"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                value: (_myCareer_player_dunkPackage = myCareer.player.dunkPackage) != null ? _myCareer_player_dunkPackage : 'Athletic One-Handers',
                                                onChange: function onChange(e) {
                                                    return updateSignatureAnim('dunkPackage', e.target.value);
                                                },
                                                className: "mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-xs font-bold text-white",
                                                children: _modesData.SIGNATURE_ANIMATION_SETS.dunkPackages.map(function(f) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: f,
                                                        children: f
                                                    }, f);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "text-[11px] font-bold text-zinc-400 uppercase",
                                                children: "IsoMotion Dribble Style"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                value: (_myCareer_player_dribbleStyle = myCareer.player.dribbleStyle) != null ? _myCareer_player_dribbleStyle : 'Kyrie Irving Iso',
                                                onChange: function onChange(e) {
                                                    return updateSignatureAnim('dribbleStyle', e.target.value);
                                                },
                                                className: "mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-xs font-bold text-white",
                                                children: _modesData.SIGNATURE_ANIMATION_SETS.dribbleStyles.map(function(f) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: f,
                                                        children: f
                                                    }, f);
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "border-t border-white/10 pt-3",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-[11px] font-bold text-zinc-400 uppercase mb-2",
                                                children: [
                                                    "Equipped Signature Skills (",
                                                    myCareer.player.signatureSkills.length,
                                                    "/5)"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "space-y-1.5",
                                                children: myCareer.player.signatureSkills.map(function(sk) {
                                                    var def = _signatureSkills.SIGNATURE_SKILL_MAP[sk.id];
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "bg-[#151820] border border-[#F9A01B]/30 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                        className: "font-black text-[#F9A01B] mr-1.5",
                                                                        children: [
                                                                            "[",
                                                                            def.code,
                                                                            "]"
                                                                        ]
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                        className: "text-white font-bold",
                                                                        children: def.name
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                        className: "ml-1.5 text-[10px] text-zinc-400",
                                                                        children: [
                                                                            "Lv.",
                                                                            sk.level
                                                                        ]
                                                                    })
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                onClick: function onClick() {
                                                                    return removeSkill(sk.id);
                                                                },
                                                                className: "text-[10px] text-red-400 hover:text-red-300 font-bold uppercase cursor-pointer",
                                                                children: "Remove"
                                                            })
                                                        ]
                                                    }, sk.id);
                                                })
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    hubTab === 'skills' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-4",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex flex-wrap items-center justify-between gap-3 mb-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                                className: "text-sm font-black uppercase text-white flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Shield, {
                                                        className: "w-4 h-4 text-[#F9A01B]"
                                                    }),
                                                    " NBA 2K14 Signature Skills Store (Equip Up To 5)"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-xs text-zinc-400",
                                                children: [
                                                    "Equipped: ",
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                        className: "text-[#F9A01B]",
                                                        children: [
                                                            myCareer.player.signatureSkills.length,
                                                            "/5"
                                                        ]
                                                    }),
                                                    " \xb7 SP: ",
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        className: "text-cyan-300",
                                                        children: vip.sp
                                                    }),
                                                    " \xb7 VC: ",
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        className: "text-[#F9A01B]",
                                                        children: vip.vc
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "flex flex-wrap gap-1.5",
                                        children: [
                                            'ALL',
                                            'Scoring',
                                            'Playmaking',
                                            'Defense',
                                            'Athleticism',
                                            'Hustle'
                                        ].map(function(cat) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    return setSkillFilter(cat);
                                                },
                                                className: "px-2.5 py-1 rounded text-[11px] font-bold uppercase cursor-pointer " + (skillFilter === cat ? 'bg-[#CE1141] text-white' : 'bg-[#171a22] text-zinc-400 hover:text-white'),
                                                children: cat
                                            }, cat);
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3",
                                children: filteredSkills.map(function(sk) {
                                    var _ref;
                                    var eq = myCareer.player.signatureSkills.find(function(e) {
                                        return e.id === sk.id;
                                    });
                                    var lvl = (_ref = eq == null ? void 0 : eq.level) != null ? _ref : 0;
                                    var nextCost = lvl < 3 ? sk.costSp[lvl] : 0;
                                    var slotsFull = !eq && myCareer.player.signatureSkills.length >= 5;
                                    var affordable = lvl < 3 && !slotsFull && (vip.sp >= nextCost || vip.vc >= nextCost);
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "rounded-lg p-3 border flex flex-col justify-between " + (eq ? 'bg-[#1b1714] border-[#F9A01B]/60' : 'bg-[#151820] border-white/10'),
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex items-center justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "text-xs font-black text-white",
                                                                children: sk.name
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "px-1.5 py-0.5 rounded bg-black/50 text-[#F9A01B] text-[10px] font-black",
                                                                children: sk.code
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[10px] text-zinc-400 uppercase font-bold mt-0.5",
                                                        children: sk.category
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                        className: "text-[11px] text-zinc-300 mt-1.5 leading-snug",
                                                        children: sk.shortDesc
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "mt-3 flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "flex gap-1",
                                                        children: [
                                                            1,
                                                            2,
                                                            3
                                                        ].map(function(dot) {
                                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "w-4 h-1.5 rounded-sm " + (lvl >= dot ? 'bg-[#F9A01B]' : 'bg-zinc-700')
                                                            }, dot);
                                                        })
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        disabled: !affordable,
                                                        onClick: function onClick() {
                                                            return buyOrUpgradeSkill(sk.id);
                                                        },
                                                        className: "px-2.5 py-1 rounded text-[10px] font-black uppercase cursor-pointer " + (lvl === 3 ? 'bg-emerald-900/50 text-emerald-300 cursor-default' : affordable ? 'bg-[#CE1141] hover:bg-[#e1194d] text-white' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'),
                                                        children: lvl === 3 ? 'MAX LV.3' : slotsFull ? '5/5 FULL' : lvl === 0 ? "EQUIP (" + nextCost + ")" : "LV." + (lvl + 1) + " (" + nextCost + ")"
                                                    })
                                                ]
                                            })
                                        ]
                                    }, sk.id);
                                })
                            })
                        ]
                    }),
                    hubTab === 'league' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "grid grid-cols-1 lg:grid-cols-2 gap-4",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                        className: "text-xs font-black uppercase tracking-widest text-[#F9A01B] mb-3 flex items-center gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_lucidereact.Award, {
                                                className: "w-4 h-4"
                                            }),
                                            " 2013-14 Scoring Leaders & MVP Race"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("table", {
                                        className: "w-full text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("thead", {
                                                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                    className: "text-zinc-400 border-b border-white/10 text-left",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                            className: "py-1.5",
                                                            children: "Player"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                            className: "py-1.5",
                                                            children: "TM"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                            className: "py-1.5 text-right",
                                                            children: "PPG"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                            className: "py-1.5 text-right",
                                                            children: "RPG"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                            className: "py-1.5 text-right",
                                                            children: "APG"
                                                        })
                                                    ]
                                                })
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("tbody", {
                                                children: leagueLeaders.map(function(p, idx) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                        className: "border-b border-white/5 text-zinc-200",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                                className: "py-2 font-bold",
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                        className: "text-zinc-500 mr-2",
                                                                        children: [
                                                                            idx + 1,
                                                                            "."
                                                                        ]
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                        className: p.name.includes('(YOU)') ? 'text-[#F9A01B]' : 'text-white',
                                                                        children: p.name
                                                                    })
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                className: "py-2 text-zinc-400 font-bold",
                                                                children: p.team
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                className: "py-2 text-right font-black text-white",
                                                                children: p.ppg
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                className: "py-2 text-right",
                                                                children: p.rpg
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                                className: "py-2 text-right",
                                                                children: p.apg
                                                            })
                                                        ]
                                                    }, p.name);
                                                })
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-4",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                        className: "text-xs font-black uppercase tracking-widest text-[#F9A01B] mb-3",
                                        children: "2K14 Social Media Feed"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "space-y-2.5",
                                        children: myCareer.socialFeed.map(function(post) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "bg-[#151820] border border-white/10 rounded-lg p-3",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex justify-between text-[11px]",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "font-black text-[#F9A01B]",
                                                                children: post.handle
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "text-zinc-500",
                                                                children: post.time
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                        className: "text-xs text-zinc-200 mt-1",
                                                        children: post.text
                                                    })
                                                ]
                                            }, post.id);
                                        })
                                    })
                                ]
                            })
                        ]
                    }),
                    hubTab === 'drills' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "bg-[#0f1116]/94 border border-white/15 rounded-xl p-4",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                className: "text-xs font-black uppercase tracking-widest text-[#F9A01B] mb-3",
                                children: "MyCAREER Practice Gym & Skill Drills"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "grid grid-cols-1 md:grid-cols-3 gap-3",
                                children: _modesData.TRAINING_DRILLS.map(function(drill) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "bg-[#151820] border border-white/10 rounded-xl p-4 flex flex-col justify-between",
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
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-sm font-black text-white mt-1",
                                                        children: drill.title
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                        className: "text-xs text-zinc-400 mt-1.5",
                                                        children: drill.instruction
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                onClick: function onClick() {
                                                    _Nba2k14Audio.Nba2k14Audio.playUiClick('select');
                                                    onStartMatch({
                                                        mode: 'training',
                                                        title: drill.title,
                                                        subtitle: 'MyCAREER Practice Facility',
                                                        homeTeamId: myTeam.id,
                                                        awayTeamId: nextOpponent.id,
                                                        homeCustomPlayers: [
                                                            myCareer.player
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
                                                children: [
                                                    "Start Drill (",
                                                    drill.targetReps,
                                                    " Reps)"
                                                ]
                                            })
                                        ]
                                    }, drill.id);
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

})(window.ArcadeMod);
