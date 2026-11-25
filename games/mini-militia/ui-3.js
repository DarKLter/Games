(function(ArcadeMod){
// === MODULE: src/games/mini-militia/components/ProfileSocialAndRooms ===
ArcadeMod.define("src/games/mini-militia/components/ProfileSocialAndRooms", function(require, module, exports) {
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
    get CustomRoomLobby () {
        return CustomRoomLobby;
    },
    get FriendsModal () {
        return FriendsModal;
    },
    get HelpControlsModal () {
        return HelpControlsModal;
    },
    get LeaderboardsModal () {
        return LeaderboardsModal;
    },
    get OnlineRoomBrowser () {
        return OnlineRoomBrowser;
    },
    get PostMatchSummaryView () {
        return PostMatchSummaryView;
    },
    get ProfileAndMedalsModal () {
        return ProfileAndMedalsModal;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _progression = require("../data/progression");
var _maps = require("../data/maps");
var _weapons = require("../data/weapons");
var _AudioEngine = require("../engine/AudioEngine");
var _AvatarPreviewCanvas = require("./AvatarPreviewCanvas");
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
var ProfileAndMedalsModal = function ProfileAndMedalsModal(param) {
    var save = param.save, _param_initialTab = param.initialTab, initialTab = _param_initialTab === void 0 ? 'identity' : _param_initialTab, onUpdateSave = param.onUpdateSave, onClose = param.onClose;
    var _save_avatarPresets_save_activeAvatarPreset;
    var _useState = (0, _react.useState)(initialTab), tab = _useState[0], setTab = _useState[1];
    var _useState1 = (0, _react.useState)(save.callsign), callsign = _useState1[0], setCallsign = _useState1[1];
    var _useState2 = (0, _react.useState)(save.clanTag), clanTag = _useState2[0], setClanTag = _useState2[1];
    var _useState3 = (0, _react.useState)(false), copied = _useState3[0], setCopied = _useState3[1];
    var rankInfo = (0, _progression.getMmRankForXp)(save.xp);
    var avatar = (_save_avatarPresets_save_activeAvatarPreset = save.avatarPresets[save.activeAvatarPreset]) != null ? _save_avatarPresets_save_activeAvatarPreset : save.avatarPresets[0];
    var kd = save.stats.deaths > 0 ? (save.stats.kills / save.stats.deaths).toFixed(2) : save.stats.kills.toFixed(2);
    var winRate = save.stats.matches > 0 ? Math.round(save.stats.wins / save.stats.matches * 100) : 0;
    var claimAchievement = function claimAchievement(achId, rewardCash, rewardXp) {
        _AudioEngine.mmAudio.playKillstreak();
        onUpdateSave(function(prev) {
            if (prev.claimedAchievements.includes(achId)) return prev;
            return _extends({}, prev, {
                cash: prev.cash + rewardCash,
                xp: prev.xp + rewardXp,
                claimedAchievements: [].concat(prev.claimedAchievements, [
                    achId
                ])
            });
        });
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4",
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "w-full max-w-5xl max-h-[92vh] flex flex-col rounded border-2 border-[#5D7045] bg-[#1E2420] text-[#F4F4EC] shadow-2xl overflow-hidden",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#23272A] border-b border-[#4F5D3B]",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.RankInsigniaBadge, {
                                    rank: rankInfo.current,
                                    size: 26
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                            className: "text-base font-black uppercase tracking-wider text-[#F5A623]",
                                            children: "\uD83D\uDCCA SOLDIER DOSSIER & MEDALS"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("p", {
                                            className: "text-[11px] font-mono text-[#C2B280]",
                                            children: [
                                                rankInfo.current.title,
                                                " \xb7 ",
                                                save.xp.toLocaleString(),
                                                " XP \xb7 Loadout Discount -",
                                                rankInfo.current.discountPct,
                                                "%"
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
                                        id: 'identity',
                                        label: 'Ranks (21)'
                                    },
                                    {
                                        id: 'stats',
                                        label: 'Career & History'
                                    },
                                    {
                                        id: 'mastery',
                                        label: 'Weapons'
                                    },
                                    {
                                        id: 'achievements',
                                        label: 'Medals (22)'
                                    }
                                ].map(function(t) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            _AudioEngine.mmAudio.playClick();
                                            setTab(t.id);
                                        },
                                        className: "px-2.5 py-1 rounded text-xs font-black uppercase border " + (tab === t.id ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A]' : 'bg-[#2A3320] text-[#C2B280] border-[#4F5D3B]'),
                                        children: t.label
                                    }, t.id);
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    onClick: onClose,
                                    className: "px-3 py-1 rounded bg-[#D93829] hover:bg-[#EF4444] text-xs font-black uppercase ml-1",
                                    children: "Close"
                                })
                            ]
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex-1 min-h-0 overflow-y-auto p-3",
                    children: [
                        tab === 'identity' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "grid grid-cols-1 lg:grid-cols-12 gap-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "lg:col-span-5 p-3 rounded bg-[#23272A] border border-[#4F5D3B] space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.AvatarPortraitBadge, {
                                                    avatar: avatar,
                                                    size: 62
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-xs font-mono text-[#C2B280]",
                                                            children: "SERVICE ID"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "font-mono font-bold text-sm",
                                                                    children: save.playerId
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                    type: "button",
                                                                    onClick: function onClick() {
                                                                        if (navigator.clipboard) void navigator.clipboard.writeText(save.playerId).catch(function() {});
                                                                        setCopied(true);
                                                                        setTimeout(function() {
                                                                            return setCopied(false);
                                                                        }, 1500);
                                                                    },
                                                                    className: "px-1.5 py-0.5 rounded bg-[#2A3320] border border-[#5D7045] text-[10px] font-mono text-[#F5A623]",
                                                                    children: copied ? 'COPIED!' : 'COPY'
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                    className: "block text-[11px] font-mono uppercase text-[#C2B280] mb-1",
                                                    children: "Callsign"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    value: callsign,
                                                    maxLength: 16,
                                                    onChange: function onChange(e) {
                                                        return setCallsign(e.target.value);
                                                    },
                                                    className: "w-full px-2.5 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] text-sm font-bold text-white"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                    className: "block text-[11px] font-mono uppercase text-[#C2B280] mb-1",
                                                    children: "Clan Tag (4 chars)"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    value: clanTag,
                                                    maxLength: 4,
                                                    onChange: function onChange(e) {
                                                        return setClanTag(e.target.value.toUpperCase());
                                                    },
                                                    className: "w-full px-2.5 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] text-sm font-mono uppercase text-white"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                _AudioEngine.mmAudio.playPickup();
                                                onUpdateSave(function(prev) {
                                                    return _extends({}, prev, {
                                                        callsign: callsign.trim() || 'Soldier',
                                                        clanTag: clanTag.trim().slice(0, 4).toUpperCase()
                                                    });
                                                });
                                            },
                                            className: "w-full py-2 rounded bg-[#F5A623] text-[#181C1F] text-xs font-black uppercase",
                                            children: "Save Callsign & Clan Tag"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "lg:col-span-7 p-3 rounded bg-[#23272A] border border-[#4F5D3B]",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-xs font-black uppercase text-[#C2B280] mb-2",
                                            children: "21 OFFICIAL MILITARY RANKS LADDER"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[340px] overflow-y-auto pr-1",
                                            children: _progression.MM_RANKS.map(function(r) {
                                                var reached = save.xp >= r.xpRequired;
                                                var isCur = rankInfo.current.index === r.index;
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex items-center justify-between gap-2 px-2 py-1.5 rounded border " + (isCur ? 'border-[#F5A623] bg-[#364428]' : reached ? 'border-[#4F5D3B] bg-[#1E251A]' : 'border-[#2E3438] bg-[#181C1F] opacity-65'),
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "flex items-center gap-2 min-w-0",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.RankInsigniaBadge, {
                                                                    rank: r,
                                                                    size: 22
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "truncate",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                            className: "text-xs font-bold truncate",
                                                                            children: [
                                                                                r.index + 1,
                                                                                ". ",
                                                                                r.title
                                                                            ]
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                            className: "text-[10px] font-mono text-[#C2B280] tabular-nums",
                                                                            children: [
                                                                                r.xpRequired.toLocaleString(),
                                                                                " XP \xb7 -",
                                                                                r.discountPct,
                                                                                "% Kits"
                                                                            ]
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        isCur && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "text-[10px] font-mono text-[#F5A623] font-bold",
                                                            children: "NOW"
                                                        })
                                                    ]
                                                }, r.index);
                                            })
                                        })
                                    ]
                                })
                            ]
                        }),
                        tab === 'stats' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2",
                                    children: [
                                        {
                                            label: 'Matches',
                                            val: save.stats.matches
                                        },
                                        {
                                            label: 'Win Rate',
                                            val: "" + winRate + "%"
                                        },
                                        {
                                            label: 'Kills',
                                            val: save.stats.kills
                                        },
                                        {
                                            label: 'Deaths',
                                            val: save.stats.deaths
                                        },
                                        {
                                            label: 'K/D Ratio',
                                            val: kd
                                        },
                                        {
                                            label: 'Headshots',
                                            val: save.stats.headshots
                                        },
                                        {
                                            label: 'Melee Kills',
                                            val: save.stats.meleeKills
                                        },
                                        {
                                            label: 'Dual Wield',
                                            val: save.stats.dualWieldKills
                                        },
                                        {
                                            label: 'Grenade Kills',
                                            val: save.stats.grenadeKills
                                        },
                                        {
                                            label: 'Best Streak',
                                            val: save.stats.bestKillstreak
                                        },
                                        {
                                            label: 'Best Survival',
                                            val: "W" + save.stats.survivalBestWave
                                        },
                                        {
                                            label: 'Flag Caps',
                                            val: save.stats.flagCaptures
                                        }
                                    ].map(function(s) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-2.5 rounded bg-[#23272A] border border-[#4F5D3B] text-center",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-[10px] font-mono uppercase text-[#C2B280]",
                                                    children: s.label
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-lg font-black font-mono tabular-nums text-[#F5A623] mt-0.5",
                                                    children: s.val
                                                })
                                            ]
                                        }, s.label);
                                    })
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p-3 rounded bg-[#23272A] border border-[#4F5D3B]",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-xs font-black uppercase text-[#C2B280] mb-2",
                                            children: "RECENT MATCH HISTORY (LAST 20)"
                                        }),
                                        save.matchHistory.length === 0 ? /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                            className: "text-xs font-mono text-[#9CA3AF]",
                                            children: "No completed matches yet. Jump into Quick Play, Survival, or Boot Camp!"
                                        }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "space-y-1 max-h-[220px] overflow-y-auto",
                                            children: save.matchHistory.map(function(m) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded bg-[#181C1F] border border-[#323A30] text-xs font-mono",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: m.victory ? 'text-[#22C55E] font-bold' : 'text-[#EF4444] font-bold',
                                                                    children: m.victory ? 'WIN' : 'LOSS'
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "text-white font-bold",
                                                                    children: m.mapName
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "uppercase text-[#C2B280]",
                                                                    children: m.mode
                                                                }),
                                                                m.isMvp && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "text-[#F5A623]",
                                                                    children: "\uD83D\uDC51 MVP"
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "tabular-nums text-[#D6D3C4]",
                                                            children: [
                                                                m.kills,
                                                                "K / ",
                                                                m.deaths,
                                                                "D / ",
                                                                m.assists,
                                                                "A \xb7 +",
                                                                m.xpEarned,
                                                                " XP"
                                                            ]
                                                        })
                                                    ]
                                                }, m.id);
                                            })
                                        })
                                    ]
                                })
                            ]
                        }),
                        tab === 'mastery' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p-3 rounded bg-[#23272A] border border-[#4F5D3B]",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "text-xs font-black uppercase text-[#C2B280] mb-2",
                                    children: "WEAPON MASTERY LOG"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2",
                                    children: Object.entries(save.weaponMastery).length === 0 ? /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                        className: "text-xs font-mono text-[#9CA3AF] col-span-full",
                                        children: "Fire weapons in battle to track kills, headshots, and hit accuracy here."
                                    }) : Object.entries(save.weaponMastery).sort(function(a, b) {
                                        return b[1].kills - a[1].kills;
                                    }).map(function(param) {
                                        var wid = param[0], st = param[1];
                                        var w = (0, _weapons.getMmWeaponById)(wid);
                                        var acc = st.shotsFired > 0 ? Math.round(st.shotsHit / st.shotsFired * 100) : 0;
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-2.5 rounded bg-[#181C1F] border border-[#3E4A2E]",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-xs font-black text-[#F5A623]",
                                                    children: w.name
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-[11px] font-mono text-[#C2B280] tabular-nums mt-1",
                                                    children: [
                                                        "Kills: ",
                                                        st.kills,
                                                        " \xb7 HS: ",
                                                        st.headshots,
                                                        " \xb7 Acc: ",
                                                        acc,
                                                        "%"
                                                    ]
                                                })
                                            ]
                                        }, wid);
                                    })
                                })
                            ]
                        }),
                        tab === 'achievements' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
                            children: _progression.MM_ACHIEVEMENTS.map(function(ach) {
                                var prog = ach.getProgress(save);
                                var pct = Math.min(100, Math.round(prog / ach.target * 100));
                                var claimed = save.claimedAchievements.includes(ach.id);
                                var ready = prog >= ach.target && !claimed;
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p-2.5 rounded border flex items-center justify-between gap-2 " + (ready ? 'border-[#F5A623] bg-[#344023]' : claimed ? 'border-[#22C55E]/50 bg-[#1B261B]' : 'border-[#3E4A2E] bg-[#23272A]'),
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex-1 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex items-center gap-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            children: ach.icon
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "text-xs font-black truncate",
                                                            children: ach.title
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-[11px] text-[#C2B280]",
                                                    children: ach.desc
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex items-center gap-2 mt-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "flex-1 h-1.5 bg-[#141719] rounded-sm overflow-hidden",
                                                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "h-full bg-[#F5A623]",
                                                                style: {
                                                                    width: "" + pct + "%"
                                                                }
                                                            })
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            className: "text-[10px] font-mono tabular-nums text-[#C2B280]",
                                                            children: [
                                                                Math.min(prog, ach.target),
                                                                "/",
                                                                ach.target
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "shrink-0 text-right",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-[10px] font-mono text-[#22C55E]",
                                                    children: [
                                                        "+\uD83D\uDCB5",
                                                        ach.rewardCash
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-[10px] font-mono text-[#F5A623]",
                                                    children: [
                                                        "+",
                                                        ach.rewardXp,
                                                        "XP"
                                                    ]
                                                }),
                                                claimed ? /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "inline-block mt-1 px-2 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] text-[10px] font-bold",
                                                    children: "CLAIMED"
                                                }) : ready ? /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    onClick: function onClick() {
                                                        return claimAchievement(ach.id, ach.rewardCash, ach.rewardXp);
                                                    },
                                                    className: "mt-1 px-2.5 py-1 rounded bg-[#F5A623] text-[#181C1F] text-[10px] font-black uppercase",
                                                    children: "CLAIM"
                                                }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "inline-block mt-1 text-[10px] font-mono text-[#6B7280]",
                                                    children: "LOCKED"
                                                })
                                            ]
                                        })
                                    ]
                                }, ach.id);
                            })
                        })
                    ]
                })
            ]
        })
    });
};
var FriendsModal = function FriendsModal(param) {
    var save = param.save, onUpdateSave = param.onUpdateSave, onClose = param.onClose;
    var _useState = (0, _react.useState)(''), newName = _useState[0], setNewName = _useState[1];
    var addFriend = function addFriend() {
        var clean = newName.trim();
        if (!clean) return;
        _AudioEngine.mmAudio.playPickup();
        onUpdateSave(function(prev) {
            return _extends({}, prev, {
                friends: [].concat([
                    {
                        id: "fr_" + Date.now(),
                        callsign: clean.slice(0, 14),
                        clanTag: prev.clanTag || 'DA2',
                        rankIndex: Math.floor(Math.random() * 14) + 2,
                        online: true,
                        inSquad: true
                    }
                ], prev.friends)
            });
        });
        setNewName('');
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3",
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "w-full max-w-2xl rounded border-2 border-[#5D7045] bg-[#1E2420] text-[#F4F4EC] overflow-hidden shadow-2xl",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex items-center justify-between px-4 py-2.5 bg-[#23272A] border-b border-[#4F5D3B]",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                            className: "text-base font-black uppercase text-[#F5A623]",
                            children: "\uD83D\uDC65 SQUAD & FRIENDS"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            onClick: onClose,
                            className: "px-3 py-1 rounded bg-[#D93829] text-xs font-black uppercase",
                            children: "Close"
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "p-3 space-y-3",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex gap-2",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                    value: newName,
                                    onChange: function onChange(e) {
                                        return setNewName(e.target.value);
                                    },
                                    placeholder: "Add friend callsign (e.g. Ghost99)...",
                                    className: "flex-1 px-3 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] text-sm text-white"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    onClick: addFriend,
                                    className: "px-4 py-1.5 rounded bg-[#F5A623] text-[#181C1F] text-xs font-black uppercase",
                                    children: "+ Add"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "space-y-1.5 max-h-[300px] overflow-y-auto",
                            children: save.friends.map(function(f) {
                                var _MM_RANKS_Math_min;
                                var rk = (_MM_RANKS_Math_min = _progression.MM_RANKS[Math.min(_progression.MM_RANKS.length - 1, f.rankIndex)]) != null ? _MM_RANKS_Math_min : _progression.MM_RANKS[0];
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex items-center justify-between gap-2 px-3 py-2 rounded bg-[#23272A] border border-[#3E4A2E]",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "w-2.5 h-2.5 rounded-full " + (f.online ? 'bg-[#22C55E]' : 'bg-[#6B7280]')
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.RankInsigniaBadge, {
                                                    rank: rk,
                                                    size: 20
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "text-xs font-bold",
                                                            children: [
                                                                "[",
                                                                f.clanTag,
                                                                "] ",
                                                                f.callsign
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[10px] font-mono text-[#C2B280]",
                                                            children: rk.title
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                _AudioEngine.mmAudio.playClick();
                                                onUpdateSave(function(prev) {
                                                    return _extends({}, prev, {
                                                        friends: prev.friends.map(function(item) {
                                                            return item.id === f.id ? _extends({}, item, {
                                                                inSquad: !item.inSquad
                                                            }) : item;
                                                        })
                                                    });
                                                });
                                            },
                                            className: "px-2.5 py-1 rounded text-[11px] font-black uppercase " + (f.inSquad ? 'bg-[#22C55E] text-[#0F172A]' : 'bg-[#2A3320] border border-[#F5A623] text-[#F5A623]'),
                                            children: f.inSquad ? '✓ In Squad' : 'Invite'
                                        })
                                    ]
                                }, f.id);
                            })
                        })
                    ]
                })
            ]
        })
    });
};
var LeaderboardsModal = function LeaderboardsModal(param) {
    var save = param.save, onClose = param.onClose;
    var rows = (0, _react.useMemo)(function() {
        var base = [
            {
                name: '[DA2] Sarge',
                rank: 20,
                kills: 4820,
                kd: 3.42,
                wave: 34,
                isYou: false
            },
            {
                name: '[PRO] SniperWolf',
                rank: 16,
                kills: 3190,
                kd: 2.88,
                wave: 26,
                isYou: false
            },
            {
                name: '[CAT] SawBlade',
                rank: 14,
                kills: 2450,
                kd: 2.31,
                wave: 22,
                isYou: false
            },
            {
                name: '[AIR] JetAce',
                rank: 12,
                kills: 1790,
                kd: 1.95,
                wave: 19,
                isYou: false
            },
            {
                name: '[OUT] CommandoX',
                rank: 9,
                kills: 920,
                kd: 1.54,
                wave: 14,
                isYou: false
            },
            {
                name: "" + (save.clanTag ? "[" + save.clanTag + "] " : '') + save.callsign,
                rank: (0, _progression.getMmRankForXp)(save.xp).current.index,
                kills: save.stats.kills,
                kd: save.stats.deaths > 0 ? Number((save.stats.kills / save.stats.deaths).toFixed(2)) : save.stats.kills,
                wave: save.stats.survivalBestWave,
                isYou: true
            }
        ];
        return base.sort(function(a, b) {
            return b.kills - a.kills;
        });
    }, [
        save
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3",
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "w-full max-w-2xl rounded border-2 border-[#5D7045] bg-[#1E2420] text-[#F4F4EC] overflow-hidden shadow-2xl",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex items-center justify-between px-4 py-2.5 bg-[#23272A] border-b border-[#4F5D3B]",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                            className: "text-base font-black uppercase text-[#F5A623]",
                            children: "\uD83C\uDFC6 GLOBAL DOODLE LEADERBOARD"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            onClick: onClose,
                            className: "px-3 py-1 rounded bg-[#D93829] text-xs font-black uppercase",
                            children: "Close"
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "p-3 space-y-1.5",
                    children: rows.map(function(r, i) {
                        var _MM_RANKS_r_rank;
                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex items-center justify-between px-3 py-2 rounded border font-mono text-xs " + (r.isYou ? 'border-[#F5A623] bg-[#364428]' : 'border-[#3E4A2E] bg-[#23272A]'),
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex items-center gap-2.5",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            className: "w-5 text-[#F5A623] font-black",
                                            children: [
                                                "#",
                                                i + 1
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.RankInsigniaBadge, {
                                            rank: (_MM_RANKS_r_rank = _progression.MM_RANKS[r.rank]) != null ? _MM_RANKS_r_rank : _progression.MM_RANKS[0],
                                            size: 20
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "font-bold text-white",
                                            children: r.name
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex items-center gap-4 tabular-nums text-[#C2B280]",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            children: [
                                                r.kills,
                                                " K"
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            children: [
                                                r.kd,
                                                " K/D"
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            children: [
                                                "Wave ",
                                                r.wave
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }, r.name);
                    })
                })
            ]
        })
    });
};
var HelpControlsModal = function HelpControlsModal(param) {
    var onClose = param.onClose, onStartBootCamp = param.onStartBootCamp;
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3",
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "w-full max-w-2xl rounded border-2 border-[#5D7045] bg-[#1E2420] text-[#F4F4EC] overflow-hidden shadow-2xl",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex items-center justify-between px-4 py-2.5 bg-[#23272A] border-b border-[#4F5D3B]",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                            className: "text-base font-black uppercase text-[#F5A623]",
                            children: "❓ TACTICAL FIELD MANUAL"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            onClick: onClose,
                            className: "px-3 py-1 rounded bg-[#D93829] text-xs font-black uppercase",
                            children: "Close"
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "p-4 space-y-3 text-xs",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p-3 rounded bg-[#23272A] border border-[#4F5D3B]",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "font-black uppercase text-[#F5A623] mb-1.5",
                                            children: "⌨️ DESKTOP CONTROLS"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("ul", {
                                            className: "space-y-1 font-mono text-[#D6D3C4]",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• A / D: Move Left & Right"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• W / Space: Rocket Boots Jetpack Flight"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• S: Crouch (Hides from Radar!) \xb7 Double-Tap S: Combat Roll"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• Mouse + Left Click: 360\xb0 Aim & Fire"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• Right Click / Z: Cycle Sniper & Weapon Zoom"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• Q / Wheel: Swap Weapon \xb7 R: Reload"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• F / V: Melee / Machete \xb7 G: Throw Grenade \xb7 C: Cycle Grenade"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• E: Swap Ground Loot \xb7 X: Dual Wield Pick-Up"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• Tab: Live Scoreboard \xb7 Esc: Pause"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p-3 rounded bg-[#23272A] border border-[#4F5D3B]",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "font-black uppercase text-[#F5A623] mb-1.5",
                                            children: "\uD83D\uDCF1 DUAL-STICK TOUCH CONTROLS"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("ul", {
                                            className: "space-y-1 font-mono text-[#D6D3C4]",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• Left Stick: Move + Push Up to Ignite Rocket Boots"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• Right Stick: 360\xb0 Aim (Push past Fire Ring to Auto-Fire!)"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• Top-Center Weapon Box: Tap to Swap / View Dual-Wield"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• Contextual Loot Popup: Tap [SWAP] or [+ DUAL WIELD]"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• Switch to Separate Fire Button or move every button in Settings → Custom HUD Editor!"
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            onClick: function onClick() {
                                onClose();
                                onStartBootCamp();
                            },
                            className: "w-full py-2.5 rounded bg-[#F5A623] text-[#181C1F] font-black uppercase tracking-wider",
                            children: "\uD83C\uDF96️ Launch Sarge’s 7-Step Boot Camp Training"
                        })
                    ]
                })
            ]
        })
    });
};
var OnlineRoomBrowser = function OnlineRoomBrowser(param) {
    var save = param.save, onBack = param.onBack, onJoinRoom = param.onJoinRoom, onCreateCustom = param.onCreateCustom;
    var _useState = (0, _react.useState)('All'), region = _useState[0], setRegion = _useState[1];
    var rooms = region === 'All' ? _progression.MM_SIMULATED_ONLINE_ROOMS : _progression.MM_SIMULATED_ONLINE_ROOMS.filter(function(r) {
        return r.region === region;
    });
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "w-full h-full flex flex-col bg-[#1B2216] text-[#F4F4EC] overflow-hidden",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                className: "flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#23272A] border-b-2 border-[#4F5D3B]",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    _AudioEngine.mmAudio.playClick();
                                    onBack();
                                },
                                className: "px-3 py-1 rounded bg-[#181C1F] border border-[#525D64] text-xs font-mono text-[#C2B280]",
                                children: "← Lobby"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                        className: "text-base font-black uppercase text-[#F5A623]",
                                        children: "\uD83C\uDF10 PLAY ONLINE — SERVER BROWSER"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("p", {
                                        className: "text-[11px] font-mono text-[#C2B280]",
                                        children: [
                                            "Playing as ",
                                            save.clanTag ? "[" + save.clanTag + "] " : '',
                                            save.callsign,
                                            " \xb7 Select a regional tactical match"
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    var _rooms_;
                                    _AudioEngine.mmAudio.playClick();
                                    onJoinRoom((_rooms_ = rooms[0]) != null ? _rooms_ : _progression.MM_SIMULATED_ONLINE_ROOMS[0]);
                                },
                                className: "px-3 py-1.5 rounded bg-[#F5A623] text-[#181C1F] text-xs font-black uppercase",
                                children: "⚡ Quick Ranked"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    _AudioEngine.mmAudio.playClick();
                                    onCreateCustom();
                                },
                                className: "px-3 py-1.5 rounded bg-[#2A3320] border border-[#5D7045] text-xs font-black uppercase",
                                children: "+ Host Custom Room"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "flex flex-wrap gap-1.5 px-4 py-2 bg-[#171C14] border-b border-[#3E4A2E]",
                children: [
                    'All',
                    'Asia',
                    'Europe',
                    'North America',
                    'South America'
                ].map(function(reg) {
                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        onClick: function onClick() {
                            _AudioEngine.mmAudio.playClick();
                            setRegion(reg);
                        },
                        className: "px-3 py-1 rounded text-xs font-mono border " + (region === reg ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A] font-bold' : 'bg-[#23272A] text-[#C2B280] border-[#4F5D3B]'),
                        children: reg
                    }, reg);
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "flex-1 overflow-y-auto p-3 grid grid-cols-1 md:grid-cols-2 gap-2.5",
                children: rooms.map(function(rm) {
                    var map = (0, _maps.getMmMapById)(rm.mapId);
                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p-3 rounded bg-[#23272A] border-2 border-[#4F5D3B] hover:border-[#F5A623] flex items-center gap-3 transition",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.MapPreviewCanvas, {
                                map: map,
                                width: 120,
                                height: 74,
                                className: "shrink-0"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex-1 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "font-black text-sm truncate",
                                                children: rm.name
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-[11px] font-mono text-[#22C55E] tabular-nums",
                                                children: [
                                                    rm.pingMs,
                                                    "ms"
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-[11px] font-mono text-[#C2B280] mt-0.5",
                                        children: [
                                            map.name,
                                            " \xb7 ",
                                            rm.mode.toUpperCase(),
                                            " \xb7 ",
                                            rm.region
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] font-mono",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "px-1.5 py-0.5 rounded bg-[#181C1F] text-[#F4F4EC] tabular-nums",
                                                children: [
                                                    rm.players,
                                                    "/",
                                                    rm.maxPlayers,
                                                    " Players"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "px-1.5 py-0.5 rounded bg-[#181C1F] text-[#F5A623] uppercase",
                                                children: rm.classicV4 ? 'Classic V4' : 'Loadouts'
                                            }),
                                            rm.ranked && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "px-1.5 py-0.5 rounded bg-[#2A3320] text-[#22C55E]",
                                                children: "RANKED"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    _AudioEngine.mmAudio.playClick();
                                    onJoinRoom(rm);
                                },
                                className: "px-3 py-2 rounded bg-[#F5A623] hover:bg-[#FBBF24] text-[#181C1F] text-xs font-black uppercase shrink-0",
                                children: "JOIN"
                            })
                        ]
                    }, rm.id);
                })
            })
        ]
    });
};
var CustomRoomLobby = function CustomRoomLobby(param) {
    var save = param.save, initialConfig = param.initialConfig, onBack = param.onBack, onStartMatch = param.onStartMatch;
    var _save_avatarPresets_save_activeAvatarPreset, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    var playerAvatar = (_save_avatarPresets_save_activeAvatarPreset = save.avatarPresets[save.activeAvatarPreset]) != null ? _save_avatarPresets_save_activeAvatarPreset : save.avatarPresets[0];
    var _useState = (0, _react.useState)((_ref = initialConfig == null ? void 0 : initialConfig.mapId) != null ? _ref : 'outpost'), mapId = _useState[0], setMapId = _useState[1];
    var _useState1 = (0, _react.useState)((_ref1 = initialConfig == null ? void 0 : initialConfig.mode) != null ? _ref1 : 'tdm'), mode = _useState1[0], setMode = _useState1[1];
    var _useState2 = (0, _react.useState)((_ref2 = initialConfig == null ? void 0 : initialConfig.timeLimitSec) != null ? _ref2 : 300), timeLimitSec = _useState2[0], setTimeLimitSec = _useState2[1];
    var _useState3 = (0, _react.useState)((_ref3 = initialConfig == null ? void 0 : initialConfig.scoreLimit) != null ? _ref3 : 25), scoreLimit = _useState3[0], setScoreLimit = _useState3[1];
    var _useState4 = (0, _react.useState)((_ref4 = initialConfig == null ? void 0 : initialConfig.botDifficulty) != null ? _ref4 : 'normal'), botDifficulty = _useState4[0], setBotDifficulty = _useState4[1];
    var _useState5 = (0, _react.useState)((_ref5 = initialConfig == null ? void 0 : initialConfig.classicV4) != null ? _ref5 : save.settings.gameplay.classicV4Default), classicV4 = _useState5[0], setClassicV4 = _useState5[1];
    var _useState6 = (0, _react.useState)((_ref6 = initialConfig == null ? void 0 : initialConfig.mapDrops) != null ? _ref6 : true), mapDrops = _useState6[0], setMapDrops = _useState6[1];
    var _useState7 = (0, _react.useState)((_ref7 = initialConfig == null ? void 0 : initialConfig.friendlyFire) != null ? _ref7 : false), friendlyFire = _useState7[0], setFriendlyFire = _useState7[1];
    var _useState8 = (0, _react.useState)((_ref8 = initialConfig == null ? void 0 : initialConfig.gravityMode) != null ? _ref8 : 'normal'), gravityMode = _useState8[0], setGravityMode = _useState8[1];
    var _useState9 = (0, _react.useState)((_ref9 = initialConfig == null ? void 0 : initialConfig.nitroMode) != null ? _ref9 : '1x'), nitroMode = _useState9[0], setNitroMode = _useState9[1];
    var _useState10 = (0, _react.useState)(''), password = _useState10[0], setPassword = _useState10[1];
    var _useState11 = (0, _react.useState)(function() {
        if ((initialConfig == null ? void 0 : initialConfig.slots) && initialConfig.slots.length > 0) return initialConfig.slots;
        var base = [
            {
                id: 'player',
                name: save.callsign,
                team: save.preferredTeam === 'red' ? 'red' : 'blue',
                isPlayer: true,
                ready: true,
                avatar: playerAvatar
            }
        ];
        for(var i = 0; i < 5; i++){
            var botName = _progression.MM_BOT_NAMES[(i + 1) % _progression.MM_BOT_NAMES.length];
            base.push({
                id: "bot_" + (i + 1),
                name: botName,
                team: i % 2 === 0 ? 'red' : 'blue',
                isPlayer: false,
                ready: true,
                avatar: (0, _progression.makeRandomAvatar)(botName)
            });
        }
        return base;
    }), slots = _useState11[0], setSlots = _useState11[1];
    var _useState12 = (0, _react.useState)([
        {
            sender: 'Sarge',
            text: 'Pick any of the 20 arenas, customize bots & hit START BATTLE!'
        }
    ]), chatLog = _useState12[0], setChatLog = _useState12[1];
    var _useState13 = (0, _react.useState)(''), chatInput = _useState13[0], setChatInput = _useState13[1];
    var selectedMap = (0, _maps.getMmMapById)(mapId);
    var addBot = function addBot(team) {
        var _MM_BOT_NAMES_find;
        if (slots.length >= 12) return;
        _AudioEngine.mmAudio.playClick();
        var used = new Set(slots.map(function(s) {
            return s.name;
        }));
        var name = (_MM_BOT_NAMES_find = _progression.MM_BOT_NAMES.find(function(n) {
            return !used.has(n);
        })) != null ? _MM_BOT_NAMES_find : "Trooper_" + (slots.length + 1);
        setSlots(function(prev) {
            return [].concat(prev, [
                {
                    id: "bot_" + Date.now() + "_" + prev.length,
                    name: name,
                    team: team,
                    isPlayer: false,
                    ready: true,
                    avatar: (0, _progression.makeRandomAvatar)(name)
                }
            ]);
        });
    };
    var removeSlot = function removeSlot(id) {
        _AudioEngine.mmAudio.playClick();
        setSlots(function(prev) {
            return prev.filter(function(s) {
                return s.isPlayer || s.id !== id;
            });
        });
    };
    var swapTeam = function swapTeam(id) {
        _AudioEngine.mmAudio.playClick();
        setSlots(function(prev) {
            return prev.map(function(s) {
                return s.id === id ? _extends({}, s, {
                    team: s.team === 'blue' ? 'red' : 'blue'
                }) : s;
            });
        });
    };
    var autoBalance = function autoBalance() {
        _AudioEngine.mmAudio.playClick();
        setSlots(function(prev) {
            return prev.map(function(s, idx) {
                return _extends({}, s, {
                    team: idx % 2 === 0 ? 'blue' : 'red'
                });
            });
        });
    };
    var sendChat = function sendChat(text) {
        var clean = text.trim();
        if (!clean) return;
        _AudioEngine.mmAudio.playClick();
        setChatLog(function(prev) {
            return [].concat(prev.slice(-14), [
                {
                    sender: save.callsign,
                    text: clean
                }
            ]);
        });
        setChatInput('');
    };
    var handleLaunch = function handleLaunch() {
        _AudioEngine.mmAudio.playKillstreak();
        onStartMatch({
            mode: mode,
            mapId: mapId,
            timeLimitSec: timeLimitSec,
            scoreLimit: scoreLimit,
            botDifficulty: botDifficulty,
            classicV4: classicV4,
            mapDrops: mapDrops,
            friendlyFire: friendlyFire,
            gravityMode: gravityMode,
            nitroMode: nitroMode,
            password: password,
            slots: slots
        });
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "w-full h-full flex flex-col bg-[#1B2216] text-[#F4F4EC] overflow-hidden",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                className: "flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#23272A] border-b-2 border-[#4F5D3B]",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    _AudioEngine.mmAudio.playClick();
                                    onBack();
                                },
                                className: "px-3 py-1 rounded bg-[#181C1F] border border-[#525D64] text-xs font-mono text-[#C2B280]",
                                children: "← Lobby"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                        className: "text-base font-black uppercase text-[#F5A623]",
                                        children: "\uD83D\uDEE0️ CUSTOM / LAN TACTICAL ROOM"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("p", {
                                        className: "text-[11px] font-mono text-[#C2B280]",
                                        children: [
                                            "20 Maps \xb7 ",
                                            slots.length,
                                            "/12 Combatants \xb7 ",
                                            classicV4 ? 'Classic V4 Scavenge' : 'Loadout Rules'
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        onClick: handleLaunch,
                        className: "px-5 py-2 rounded bg-[#F5A623] bg-gradient-to-b from-[#F5A623] to-[#C97B10] border border-[#FEF08A]/70 text-[#141911] text-sm font-black uppercase tracking-wider shadow-lg",
                        children: "▶ START BATTLE"
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-y-auto",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("section", {
                        className: "lg:col-span-6 flex flex-col gap-2.5",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p-3 rounded bg-[#23272A] border border-[#4F5D3B] space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-start gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.MapPreviewCanvas, {
                                                map: selectedMap,
                                                width: 190,
                                                height: 104,
                                                className: "shrink-0"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "min-w-0 flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-sm font-black text-[#F5A623] uppercase",
                                                        children: selectedMap.name
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[11px] font-mono text-[#C2B280]",
                                                        children: selectedMap.tagline
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                        className: "text-[11px] text-[#D6D3C4] mt-1",
                                                        children: selectedMap.description
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex flex-wrap gap-1 mt-1.5 text-[10px] font-mono uppercase",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "px-1.5 py-0.5 rounded bg-[#181C1F] text-[#C2B280]",
                                                                children: selectedMap.biome
                                                            }),
                                                            selectedMap.gravityScale < 0.7 && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "px-1.5 py-0.5 rounded bg-[#1E3A8A] text-[#93C5FD]",
                                                                children: "LOW-G"
                                                            }),
                                                            selectedMap.unlimitedJetpack && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "px-1.5 py-0.5 rounded bg-[#065F46] text-[#6EE7B7]",
                                                                children: "∞ JETPACK"
                                                            }),
                                                            selectedMap.friction < 0.5 && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "px-1.5 py-0.5 rounded bg-[#155E75] text-[#67E8F9]",
                                                                children: "SLIPPERY ICE"
                                                            }),
                                                            selectedMap.lethalAbyss && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "px-1.5 py-0.5 rounded bg-[#7F1D1D] text-[#FCA5A5]",
                                                                children: "LETHAL ABYSS"
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "grid grid-cols-4 sm:grid-cols-5 gap-1 max-h-[146px] overflow-y-auto pt-1",
                                        children: _maps.MM_MAPS.map(function(m) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    _AudioEngine.mmAudio.playClick();
                                                    setMapId(m.id);
                                                },
                                                className: "px-1.5 py-1.5 rounded text-[10px] font-bold truncate border " + (mapId === m.id ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A]' : 'bg-[#181C1F] text-[#D6D3C4] border-[#3E4A2E] hover:border-[#C2B280]'),
                                                title: m.name,
                                                children: m.name
                                            }, m.id);
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p-3 rounded bg-[#23272A] border border-[#4F5D3B] grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "block text-[10px] font-mono uppercase text-[#C2B280] mb-0.5",
                                                children: "Game Mode"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                value: mode,
                                                onChange: function onChange(e) {
                                                    return setMode(e.target.value);
                                                },
                                                className: "w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "tdm",
                                                        children: "Team Deathmatch"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "ffa",
                                                        children: "Free-For-All"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "ctf",
                                                        children: "Capture The Flag"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "ptb",
                                                        children: "Plant The Bomb"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "survival",
                                                        children: "Survival Waves"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "block text-[10px] font-mono uppercase text-[#C2B280] mb-0.5",
                                                children: "Match Timer"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                value: timeLimitSec,
                                                onChange: function onChange(e) {
                                                    return setTimeLimitSec(Number(e.target.value));
                                                },
                                                className: "w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: 180,
                                                        children: "3:00"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: 300,
                                                        children: "5:00"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: 480,
                                                        children: "8:00"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: 600,
                                                        children: "10:00"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: 900,
                                                        children: "15:00"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "block text-[10px] font-mono uppercase text-[#C2B280] mb-0.5",
                                                children: "Score Limit"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                value: scoreLimit,
                                                onChange: function onChange(e) {
                                                    return setScoreLimit(Number(e.target.value));
                                                },
                                                className: "w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: 15,
                                                        children: "15 Kills / 3 Flags"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: 25,
                                                        children: "25 Kills / 5 Flags"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: 40,
                                                        children: "40 Kills"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: 60,
                                                        children: "60 Kills"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "block text-[10px] font-mono uppercase text-[#C2B280] mb-0.5",
                                                children: "Bot AI Skill"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                value: botDifficulty,
                                                onChange: function onChange(e) {
                                                    return setBotDifficulty(e.target.value);
                                                },
                                                className: "w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "easy",
                                                        children: "Easy"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "normal",
                                                        children: "Normal"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "pro",
                                                        children: "Pro"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "insane",
                                                        children: "Insane"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "block text-[10px] font-mono uppercase text-[#C2B280] mb-0.5",
                                                children: "Gravity"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                value: gravityMode,
                                                onChange: function onChange(e) {
                                                    return setGravityMode(e.target.value);
                                                },
                                                className: "w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "normal",
                                                        children: "Normal (Map Default)"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "low",
                                                        children: "Low-G (0.5x)"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "heavy",
                                                        children: "Heavy (1.35x)"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                className: "block text-[10px] font-mono uppercase text-[#C2B280] mb-0.5",
                                                children: "Jetpack Nitro"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                value: nitroMode,
                                                onChange: function onChange(e) {
                                                    return setNitroMode(e.target.value);
                                                },
                                                className: "w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "1x",
                                                        children: "1x Standard"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "2x",
                                                        children: "2x Turbo"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                        value: "unlimited",
                                                        children: "Unlimited"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                        className: "flex items-center gap-2 px-2 py-1.5 rounded bg-[#181C1F] border border-[#3E4A2E] cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                type: "checkbox",
                                                checked: classicV4,
                                                onChange: function onChange(e) {
                                                    return setClassicV4(e.target.checked);
                                                },
                                                className: "accent-[#F5A623]"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[11px] font-bold",
                                                children: "Classic V4 Mode"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                        className: "flex items-center gap-2 px-2 py-1.5 rounded bg-[#181C1F] border border-[#3E4A2E] cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                type: "checkbox",
                                                checked: mapDrops,
                                                onChange: function onChange(e) {
                                                    return setMapDrops(e.target.checked);
                                                },
                                                className: "accent-[#F5A623]"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[11px] font-bold",
                                                children: "Map Drops"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                        className: "flex items-center gap-2 px-2 py-1.5 rounded bg-[#181C1F] border border-[#3E4A2E] cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                type: "checkbox",
                                                checked: friendlyFire,
                                                onChange: function onChange(e) {
                                                    return setFriendlyFire(e.target.checked);
                                                },
                                                className: "accent-[#F5A623]"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[11px] font-bold",
                                                children: "Friendly Fire"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "col-span-2 sm:col-span-3",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                            value: password,
                                            onChange: function onChange(e) {
                                                return setPassword(e.target.value);
                                            },
                                            placeholder: "Optional LAN Room Password...",
                                            className: "w-full px-2.5 py-1 rounded bg-[#181C1F] border border-[#3E4A2E] text-xs font-mono"
                                        })
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("section", {
                        className: "lg:col-span-6 flex flex-col gap-2.5",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p-3 rounded bg-[#23272A] border border-[#4F5D3B] flex-1 flex flex-col min-h-[210px]",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex flex-wrap items-center justify-between gap-2 mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-xs font-black uppercase text-[#C2B280]",
                                                children: [
                                                    "SQUAD ROSTER (",
                                                    slots.length,
                                                    "/12)"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        type: "button",
                                                        onClick: function onClick() {
                                                            return addBot('blue');
                                                        },
                                                        className: "px-2 py-1 rounded bg-[#1D4ED8] text-white text-[11px] font-bold",
                                                        children: "+ Blue Bot"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        type: "button",
                                                        onClick: function onClick() {
                                                            return addBot('red');
                                                        },
                                                        className: "px-2 py-1 rounded bg-[#B91C1C] text-white text-[11px] font-bold",
                                                        children: "+ Red Bot"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        type: "button",
                                                        onClick: autoBalance,
                                                        className: "px-2 py-1 rounded bg-[#2A3320] border border-[#5D7045] text-[11px] font-mono text-[#F5A623]",
                                                        children: "Auto-Balance"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "grid grid-cols-1 sm:grid-cols-2 gap-1.5 flex-1 overflow-y-auto",
                                        children: slots.map(function(slot) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex items-center justify-between gap-2 px-2 py-1.5 rounded border " + (slot.team === 'blue' ? 'border-[#2B82D9]/60 bg-[#172536]' : 'border-[#D93829]/60 bg-[#321919]'),
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex items-center gap-2 min-w-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.AvatarPortraitBadge, {
                                                                avatar: slot.avatar,
                                                                size: 28
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "truncate",
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                        className: "text-xs font-bold truncate",
                                                                        children: [
                                                                            slot.name,
                                                                            " ",
                                                                            slot.isPlayer ? '(YOU)' : ''
                                                                        ]
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                        className: "text-[10px] font-mono uppercase opacity-80",
                                                                        children: mode === 'ffa' ? 'FREE-FOR-ALL' : "" + slot.team + " TEAM"
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "flex items-center gap-1 shrink-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                type: "button",
                                                                onClick: function onClick() {
                                                                    return swapTeam(slot.id);
                                                                },
                                                                className: "px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono hover:bg-black/70",
                                                                title: "Swap Team",
                                                                children: "⇄"
                                                            }),
                                                            !slot.isPlayer && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                type: "button",
                                                                onClick: function onClick() {
                                                                    return removeSlot(slot.id);
                                                                },
                                                                className: "px-1.5 py-0.5 rounded bg-[#7F1D1D] text-[10px] font-mono hover:bg-[#DC2626]",
                                                                title: "Kick Bot",
                                                                children: "✕"
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }, slot.id);
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p-2.5 rounded bg-[#23272A] border border-[#4F5D3B] space-y-1.5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h-[74px] overflow-y-auto bg-[#15181A] rounded p-2 space-y-0.5 text-[11px] font-mono",
                                        children: chatLog.map(function(c, idx) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "text-[#F5A623] font-bold",
                                                        children: [
                                                            c.sender,
                                                            ": "
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-[#E5E7EB]",
                                                        children: c.text
                                                    })
                                                ]
                                            }, idx);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "flex flex-wrap gap-1",
                                        children: _progression.MM_QUICK_CHATS.slice(0, 5).map(function(q) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    return sendChat(q.text);
                                                },
                                                className: "px-2 py-0.5 rounded bg-[#2A3320] hover:bg-[#3A492C] border border-[#4F5D3B] text-[10px] font-mono text-[#C2B280]",
                                                children: q.text
                                            }, q.id);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("form", {
                                        onSubmit: function onSubmit(e) {
                                            e.preventDefault();
                                            sendChat(chatInput);
                                        },
                                        className: "flex gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                value: chatInput,
                                                onChange: function onChange(e) {
                                                    return setChatInput(e.target.value);
                                                },
                                                placeholder: "Squad chat...",
                                                className: "flex-1 px-2.5 py-1 rounded bg-[#181C1F] border border-[#4F5D3B] text-xs font-mono"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "submit",
                                                className: "px-3 py-1 rounded bg-[#F5A623] text-[#181C1F] text-xs font-black uppercase",
                                                children: "Send"
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
var PostMatchSummaryView = function PostMatchSummaryView(param) {
    var summary = param.summary, save = param.save, onPlayNextMap = param.onPlayNextMap, onRematch = param.onRematch, onReturnLobby = param.onReturnLobby;
    var _ref;
    var _voteChoices_;
    var rankInfo = (0, _progression.getMmRankForXp)(save.xp);
    var voteChoices = (0, _react.useMemo)(function() {
        var others = _maps.MM_MAPS.filter(function(m) {
            return m.id !== summary.mapId;
        });
        var shuffled = [].concat(others).sort(function() {
            return Math.random() - 0.5;
        });
        return shuffled.slice(0, 3);
    }, [
        summary.mapId
    ]);
    var _useState = (0, _react.useState)((_ref = (_voteChoices_ = voteChoices[0]) == null ? void 0 : _voteChoices_.id) != null ? _ref : 'outpost'), votedMapId = _useState[0], setVotedMapId = _useState[1];
    var _useState1 = (0, _react.useState)(15), countdown = _useState1[0], setCountdown = _useState1[1];
    (0, _react.useEffect)(function() {
        var iv = setInterval(function() {
            setCountdown(function(c) {
                return c > 0 ? c - 1 : 0;
            });
        }, 1000);
        return function() {
            return clearInterval(iv);
        };
    }, []);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "w-full h-full flex flex-col bg-[#181E15] text-[#F4F4EC] overflow-y-auto p-3 sm:p-5",
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "max-w-5xl w-full mx-auto space-y-3",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "p-4 rounded border-2 flex flex-wrap items-center justify-between gap-3 " + (summary.victory ? 'border-[#F5A623] bg-gradient-to-r from-[#2D3B1E] to-[#1E251A]' : 'border-[#D93829] bg-gradient-to-r from-[#3B1D1D] to-[#1E1A1A]'),
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "text-xs font-mono uppercase tracking-widest text-[#C2B280]",
                                    children: [
                                        summary.mapName,
                                        " \xb7 ",
                                        summary.mode.toUpperCase()
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                    className: "text-2xl sm:text-3xl font-black uppercase tracking-wider " + (summary.victory ? 'text-[#F5A623]' : 'text-[#F87171]'),
                                    children: summary.victory ? '🏆 VICTORY!' : '💀 DEFEAT'
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex items-center gap-4 font-mono tabular-nums text-sm",
                            children: [
                                summary.mode !== 'survival' && summary.mode !== 'bootcamp' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "px-3 py-1.5 rounded bg-black/40 border border-[#4F5D3B]",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            className: "text-[#38BDF8] font-black",
                                            children: [
                                                "BLUE ",
                                                summary.scoreBlue
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "mx-2 text-[#6B7280]",
                                            children: ":"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            className: "text-[#F87171] font-black",
                                            children: [
                                                "RED ",
                                                summary.scoreRed
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "text-right",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "text-[#F5A623] font-black",
                                            children: [
                                                "+",
                                                summary.xpEarned,
                                                " XP"
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "text-xs text-[#22C55E]",
                                            children: [
                                                "+\uD83E\uDE99 ",
                                                summary.coinsEarned,
                                                " \xb7 +\uD83D\uDCB5 ",
                                                summary.cashEarned
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "p-3 rounded bg-[#23272A] border border-[#4F5D3B] flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.RankInsigniaBadge, {
                            rank: rankInfo.current,
                            size: 30
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex-1",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex justify-between text-xs font-mono",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "font-bold text-white",
                                            children: rankInfo.current.title
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            className: "text-[#C2B280] tabular-nums",
                                            children: [
                                                save.xp.toLocaleString(),
                                                " XP ",
                                                rankInfo.next ? "/ " + rankInfo.next.xpRequired.toLocaleString() : '(MAX)'
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "w-full h-2 bg-[#141719] rounded-sm overflow-hidden mt-1",
                                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h-full bg-[#F5A623]",
                                        style: {
                                            width: "" + rankInfo.progressPct + "%"
                                        }
                                    })
                                })
                            ]
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "p-3 rounded bg-[#23272A] border border-[#4F5D3B]",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "text-xs font-black uppercase text-[#C2B280] mb-2",
                            children: "MATCH SCOREBOARD"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "overflow-x-auto",
                            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("table", {
                                className: "w-full text-xs font-mono text-left",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("thead", {
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                            className: "text-[#C2B280] border-b border-[#3E4A2E]",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                    className: "py-1",
                                                    children: "Soldier"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                    className: "py-1",
                                                    children: "Team"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                    className: "py-1 text-right",
                                                    children: "K"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                    className: "py-1 text-right",
                                                    children: "D"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                    className: "py-1 text-right",
                                                    children: "A"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("th", {
                                                    className: "py-1 text-right",
                                                    children: "Ping"
                                                })
                                            ]
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("tbody", {
                                        children: summary.scoreboard.map(function(row) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                className: "border-b border-[#2D3338] " + (row.isPlayer ? 'bg-[#364428]/70 font-bold' : ''),
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                        className: "py-1.5",
                                                        children: [
                                                            row.isMvp ? '👑 ' : '',
                                                            row.name,
                                                            " ",
                                                            row.isPlayer ? '(YOU)' : ''
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        className: "py-1.5 uppercase",
                                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: row.team === 'blue' ? 'text-[#38BDF8]' : row.team === 'red' ? 'text-[#F87171]' : 'text-[#F5A623]',
                                                            children: row.team
                                                        })
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        className: "py-1.5 text-right tabular-nums text-[#22C55E]",
                                                        children: row.kills
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        className: "py-1.5 text-right tabular-nums text-[#F87171]",
                                                        children: row.deaths
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                        className: "py-1.5 text-right tabular-nums",
                                                        children: row.assists
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                        className: "py-1.5 text-right tabular-nums text-[#9CA3AF]",
                                                        children: [
                                                            row.pingMs,
                                                            "ms"
                                                        ]
                                                    })
                                                ]
                                            }, row.id);
                                        })
                                    })
                                ]
                            })
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "p-3 rounded bg-[#23272A] border border-[#4F5D3B]",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex items-center justify-between mb-2",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                    className: "text-xs font-black uppercase text-[#F5A623]",
                                    children: [
                                        "\uD83D\uDDFA️ VOTE FOR NEXT ARENA (",
                                        countdown,
                                        "s)"
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    className: "text-[11px] font-mono text-[#C2B280]",
                                    children: "Click any map to cast vote"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "grid grid-cols-1 sm:grid-cols-3 gap-2",
                            children: voteChoices.map(function(m) {
                                var selected = votedMapId === m.id;
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    onClick: function onClick() {
                                        _AudioEngine.mmAudio.playClick();
                                        setVotedMapId(m.id);
                                    },
                                    className: "p-2 rounded border-2 text-left transition " + (selected ? 'border-[#F5A623] bg-[#334025]' : 'border-[#3E4A2E] bg-[#181C1F]'),
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.MapPreviewCanvas, {
                                            map: m,
                                            width: 220,
                                            height: 92,
                                            className: "w-full"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center justify-between mt-1.5",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "text-xs font-black",
                                                    children: m.name
                                                }),
                                                selected && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "text-[10px] font-mono text-[#F5A623]",
                                                    children: "✓ VOTED"
                                                })
                                            ]
                                        })
                                    ]
                                }, m.id);
                            })
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex flex-wrap gap-2 justify-end",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            onClick: function onClick() {
                                _AudioEngine.mmAudio.playClick();
                                onReturnLobby();
                            },
                            className: "px-4 py-2 rounded bg-[#23272A] hover:bg-[#31383D] border border-[#525D64] text-xs font-black uppercase",
                            children: "Return to Lobby"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                            type: "button",
                            onClick: function onClick() {
                                _AudioEngine.mmAudio.playClick();
                                onRematch();
                            },
                            className: "px-4 py-2 rounded bg-[#2A3320] hover:bg-[#3A472D] border border-[#5D7045] text-xs font-black uppercase",
                            children: [
                                "↻ Rematch (",
                                summary.mapName,
                                ")"
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                            type: "button",
                            onClick: function onClick() {
                                _AudioEngine.mmAudio.playKillstreak();
                                onPlayNextMap(votedMapId);
                            },
                            className: "px-5 py-2 rounded bg-[#F5A623] hover:bg-[#FBBF24] text-[#181C1F] text-xs font-black uppercase",
                            children: [
                                "▶ Deploy Next Map (",
                                (0, _maps.getMmMapById)(votedMapId).name,
                                ")"
                            ]
                        })
                    ]
                })
            ]
        })
    });
};

});

})(window.ArcadeMod);
