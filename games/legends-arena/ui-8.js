(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/components/MainLobby ===
ArcadeMod.define("src/games/legends-arena/mlbb/components/MainLobby", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MainLobby", {
    enumerable: true,
    get: function() {
        return MainLobby;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _emblems = require("../data/emblems");
var _HeroAvatarSvg = require("./HeroAvatarSvg");
var _LobbySanctuary3D = require("./LobbySanctuary3D");
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
var DEMO_FRIENDS = [
    {
        id: 'f1',
        name: 'KaguraMain',
        rank: 'Mythic ★24',
        status: 'In Lobby',
        online: true,
        heroId: 'eudora',
        affinity: 'Partner Lv.6'
    },
    {
        id: 'f2',
        name: 'TigrealSet',
        rank: 'Legend II',
        status: 'Online',
        online: true,
        heroId: 'tigreal',
        affinity: 'Bro Lv.4'
    },
    {
        id: 'f3',
        name: 'LanceDash',
        rank: 'Mythical Honor',
        status: 'In Match (08:14)',
        online: true,
        heroId: 'lancelot',
        affinity: 'Confidant Lv.3'
    },
    {
        id: 'f4',
        name: 'EstesHeal',
        rank: 'Epic I',
        status: 'Online',
        online: true,
        heroId: 'estes',
        affinity: 'Bestie Lv.5'
    },
    {
        id: 'f5',
        name: 'FrancoHook',
        rank: 'Grandmaster',
        status: 'Offline 2h ago',
        online: false,
        heroId: 'franco',
        affinity: ''
    }
];
var MainLobby = function MainLobby(param) {
    var profile = param.profile, onOpenModal = param.onOpenModal, onLaunchMode = param.onLaunchMode, onOpenLiveStream = param.onOpenLiveStream, onExitToArcade = param.onExitToArcade, onUpdateProfile = param.onUpdateProfile;
    var _profile_squad_rank, _profile_squad_activity;
    var _useState = (0, _react.useState)(false), socialOpen = _useState[0], setSocialOpen = _useState[1];
    var _useState1 = (0, _react.useState)('friends'), socialTab = _useState1[0], setSocialTab = _useState1[1];
    var _useState2 = (0, _react.useState)('Global'), chatTab = _useState2[0], setChatTab = _useState2[1];
    var _useState3 = (0, _react.useState)(''), chatInput = _useState3[0], setChatInput = _useState3[1];
    var _useState4 = (0, _react.useState)(false), chatOpen = _useState4[0], setChatOpen = _useState4[1];
    var _useState5 = (0, _react.useState)(false), customPickerOpen = _useState5[0], setCustomPickerOpen = _useState5[1];
    var _useState6 = (0, _react.useState)(false), arcadePickerOpen = _useState6[0], setArcadePickerOpen = _useState6[1];
    var _useState7 = (0, _react.useState)(0), promoIdx = _useState7[0], setPromoIdx = _useState7[1];
    var _useState8 = (0, _react.useState)(null), promoSwipeStartX = _useState8[0], setPromoSwipeStartX = _useState8[1];
    var _useState9 = (0, _react.useState)(0), tickerIdx = _useState9[0], setTickerIdx = _useState9[1];
    var _useState10 = (0, _react.useState)(function() {
        return profile.settings.network.speedMode ? 18 : 28;
    }), livePing = _useState10[0], setLivePing = _useState10[1];
    var _useState11 = (0, _react.useState)(96), batteryPct = _useState11[0], setBatteryPct = _useState11[1];
    var _useState12 = (0, _react.useState)([
        {
            id: 'rc1',
            host: 'MythicCore',
            mode: 'Ranked',
            need: 'Roam / Tank',
            filled: '4/5'
        },
        {
            id: 'rc2',
            host: 'AuroraMid',
            mode: 'Classic',
            need: 'Jungler',
            filled: '3/5'
        },
        {
            id: 'rc3',
            host: 'DawnSquad',
            mode: 'Ranked',
            need: 'Gold Laner',
            filled: '4/5'
        }
    ]), recruitRooms = _useState12[0], setRecruitRooms = _useState12[1];
    var _useState13 = (0, _react.useState)([
        {
            ch: 'Global',
            sender: 'MythicSlayer',
            text: 'LF Tank/Roam for 5-man Ranked push!'
        },
        {
            ch: 'Global',
            sender: 'ValirSpark',
            text: '2026 Expanding Rivers & Broken Walls maps are live!'
        },
        {
            ch: 'Local',
            sender: 'MiyaCarry',
            text: 'Anyone up for Brawl or Mayhem warm-up?'
        },
        {
            ch: 'Recruitment',
            sender: 'MythicCore',
            text: '[Ranked 4/5] Need Roam/Tank Mythic+!'
        },
        {
            ch: 'Squad',
            sender: 'Captain',
            text: 'Weekly squad activity chest almost maxed!'
        },
        {
            ch: 'Mentor',
            sender: 'SenseiTig',
            text: 'Secure first Turtle at 02:00 for team shield & EXP.'
        },
        {
            ch: 'Private',
            sender: 'KaguraMain',
            text: 'Ready for duo push whenever you are!'
        }
    ]), chatLines = _useState13[0], setChatLines = _useState13[1];
    var rankTier = _emblems.MLBB_RANK_TIERS[Math.max(0, Math.min(_emblems.MLBB_RANK_TIERS.length - 1, profile.rankTierIdx))];
    var unreadMailCount = Math.max(0, 4 - profile.claimedMailIds.length);
    var dailyChestReady = [
        200,
        400,
        600,
        800
    ].some(function(m) {
        return profile.dailyActivity >= m && !profile.claimedDailyMilestones.includes(m);
    });
    var promos = [
        {
            title: 'SEASON 36 MYTHIC',
            sub: 'Lv.1–60 Starlight Pass · Exclusive Skins & Rewards',
            badge: 'STARLIGHT',
            modal: 'starlight'
        },
        {
            title: 'PROMO DIAMOND CARNIVAL',
            sub: 'Earn Promo Diamonds & Free Epic Skin Chests',
            badge: 'EVENT',
            modal: 'events'
        },
        {
            title: 'MAGIC WHEEL & LUCKY SPIN',
            sub: 'Spin with Tickets for Fragments, BP & Legend Rewards',
            badge: 'DRAW',
            modal: 'shop'
        }
    ];
    // Auto-rotate Mid-Left Promo Carousel every 5.5s
    (0, _react.useEffect)(function() {
        var id = window.setInterval(function() {
            setPromoIdx(function(i) {
                return (i + 1) % promos.length;
            });
        }, 5500);
        return function() {
            return window.clearInterval(id);
        };
    }, [
        promos.length
    ]);
    // Live Chat Bar scrolling preview ticker & subtle realistic Wi-Fi ping fluctuation
    (0, _react.useEffect)(function() {
        var id = window.setInterval(function() {
            setTickerIdx(function(i) {
                return i + 1;
            });
            var base = profile.settings.network.speedMode ? 17 : 27;
            setLivePing(base + Math.floor(Math.random() * 5));
        }, 3400);
        return function() {
            return window.clearInterval(id);
        };
    }, [
        profile.settings.network.speedMode
    ]);
    // Read native Battery API when available (graceful 96% fallback)
    (0, _react.useEffect)(function() {
        var nav = navigator;
        if (!nav.getBattery) return;
        var alive = true;
        nav.getBattery().then(function(bat) {
            if (alive && typeof (bat == null ? void 0 : bat.level) === 'number') {
                setBatteryPct(Math.max(10, Math.round(bat.level * 100)));
            }
        }).catch(function() {});
        return function() {
            alive = false;
        };
    }, []);
    var handleSendChat = function handleSendChat(e) {
        e.preventDefault();
        var txt = chatInput.trim();
        if (!txt) return;
        setChatLines(function(prev) {
            return [].concat(prev.slice(-24), [
                {
                    ch: chatTab,
                    sender: profile.name,
                    text: txt
                }
            ]);
        });
        setChatInput('');
        _AudioEngine.mlbbAudio.playClick();
    };
    var openModal = function openModal(m) {
        _AudioEngine.mlbbAudio.startLobbyBgm();
        _AudioEngine.mlbbAudio.playModalOpen();
        onOpenModal(m);
    };
    var openSocialTab = function openSocialTab(tab) {
        _AudioEngine.mlbbAudio.startLobbyBgm();
        _AudioEngine.mlbbAudio.playSwoosh();
        if (socialOpen && socialTab === tab) {
            setSocialOpen(false);
        } else {
            setSocialTab(tab);
            setSocialOpen(true);
        }
    };
    var channelLines = chatLines.filter(function(l) {
        return l.ch === chatTab;
    });
    var latestChat = channelLines.length > 0 ? channelLines[tickerIdx % channelLines.length] : chatLines[chatLines.length - 1];
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        onPointerDown: function onPointerDown() {
            return _AudioEngine.mlbbAudio.startLobbyBgm();
        },
        className: "relative w-full h-full overflow-hidden bg-[#060B18] text-slate-100 select-none",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_LobbySanctuary3D.LobbySanctuary3D, {
                heroId: profile.showcaseHeroId,
                skinId: profile.equippedSkins[profile.showcaseHeroId],
                ownedHeroIds: profile.ownedHeroIds,
                onSwitchHero: function onSwitchHero(id) {
                    return onUpdateProfile(function(prev) {
                        return _extends({}, prev, {
                            showcaseHeroId: id,
                            selectedHeroId: id
                        });
                    });
                }
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "absolute top-3 left-3 z-20 flex flex-col gap-2 max-w-[54vw]",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-start gap-2 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClick();
                                    onExitToArcade();
                                },
                                className: "h-14 px-2.5 rounded-xl bg-[#0B132B]/92 border border-[#E6B84C]/45 hover:border-[#FFE28A] text-[11px] font-black text-[#FFE28A] flex flex-col items-center justify-center cursor-pointer transition",
                                title: "Return to Tsepang Arcade",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "←"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "Arcade"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    return openModal('profile');
                                },
                                className: "flex items-center gap-2.5 pr-3.5 pl-1.5 py-1.5 rounded-xl mlbb-panel-gold hover:border-[#FFE28A] transition cursor-pointer",
                                title: "Open 6-Tab Player Profile & Namecard",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "relative rounded-full p-[2px] mlbb-rank-shimmer",
                                        style: {
                                            backgroundImage: "linear-gradient(135deg, " + rankTier.color + ", #FFE28A, " + rankTier.borderGlow + ")"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "rounded-full bg-[#0B132B] p-[1px]",
                                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                    heroId: profile.showcaseHeroId,
                                                    size: 42
                                                })
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "absolute -bottom-1 -right-1 px-1.5 rounded bg-[#0B132B] border border-[#E6B84C] text-[10px] font-black text-[#FFE28A] mlbb-num",
                                                children: [
                                                    "Lv.",
                                                    profile.level
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-left leading-tight",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-sm font-black text-white flex items-center gap-1.5 whitespace-nowrap",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: profile.name
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-xs opacity-90",
                                                        children: profile.countryFlag
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-[11px] font-bold text-[#FFE28A] flex items-center gap-1 whitespace-nowrap",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.RankCrestSvg, {
                                                        tierIdx: profile.rankTierIdx,
                                                        size: 16
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: rankTier.name
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "text-amber-300 mlbb-num",
                                                        children: [
                                                            profile.rankStars,
                                                            "★"
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "grid grid-cols-2 gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        onClick: function onClick() {
                                            return openModal('events');
                                        },
                                        className: "h-7 px-2.5 rounded-lg bg-[#0E1E42]/92 border border-cyan-400/50 hover:border-cyan-200 flex items-center gap-1.5 text-[11px] font-black text-cyan-100 whitespace-nowrap cursor-pointer transition",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "\uD83C\uDF81"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Event"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        onClick: function onClick() {
                                            return openModal('starlight');
                                        },
                                        className: "h-7 px-2.5 rounded-lg bg-[#1A1444]/92 border border-purple-400/55 hover:border-purple-200 flex items-center gap-1.5 text-[11px] font-black text-purple-100 whitespace-nowrap cursor-pointer transition",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "⭐"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Starlight"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-[10px] text-purple-300 mlbb-num",
                                                children: [
                                                    "Lv.",
                                                    profile.starlightLevel
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        onClick: function onClick() {
                                            return openModal('shop');
                                        },
                                        className: "h-7 px-2.5 rounded-lg bg-[#1E1A32]/92 border border-[#E6B84C]/60 hover:border-[#FFE28A] flex items-center gap-1.5 text-[11px] font-black text-[#FFE28A] whitespace-nowrap cursor-pointer transition",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "\uD83D\uDECD️"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Shop"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        onClick: function onClick() {
                                            return openModal('daily');
                                        },
                                        className: "relative h-7 px-2.5 rounded-lg bg-[#10263A]/92 border border-emerald-400/55 hover:border-emerald-200 flex items-center gap-1.5 text-[11px] font-black text-emerald-200 whitespace-nowrap cursor-pointer transition",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "\uD83D\uDCCB"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Daily"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-[10px] text-amber-300 mlbb-num",
                                                children: [
                                                    Math.min(800, profile.dailyActivity),
                                                    "/800"
                                                ]
                                            }),
                                            dailyChestReady && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white"
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        onPointerDown: function onPointerDown(e) {
                            return setPromoSwipeStartX(e.clientX);
                        },
                        onPointerUp: function onPointerUp(e) {
                            if (promoSwipeStartX === null) return;
                            var dx = e.clientX - promoSwipeStartX;
                            setPromoSwipeStartX(null);
                            if (Math.abs(dx) > 34) {
                                _AudioEngine.mlbbAudio.playSwoosh();
                                setPromoIdx(function(i) {
                                    return dx < 0 ? (i + 1) % promos.length : (i - 1 + promos.length) % promos.length;
                                });
                            }
                        },
                        className: "mt-1 w-56 rounded-xl mlbb-panel-gold p-2.5 touch-pan-y",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-between text-[10px] font-black text-[#FFE28A] mb-1",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: promos[promoIdx].badge
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    _AudioEngine.mlbbAudio.playSwoosh();
                                                    setPromoIdx(function(i) {
                                                        return (i - 1 + promos.length) % promos.length;
                                                    });
                                                },
                                                className: "px-1 text-slate-300 hover:text-white cursor-pointer",
                                                "aria-label": "Previous promo",
                                                children: "◂"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-slate-300 mlbb-num",
                                                children: [
                                                    promoIdx + 1,
                                                    "/",
                                                    promos.length
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    _AudioEngine.mlbbAudio.playSwoosh();
                                                    setPromoIdx(function(i) {
                                                        return (i + 1) % promos.length;
                                                    });
                                                },
                                                className: "px-1 text-slate-300 hover:text-white cursor-pointer",
                                                "aria-label": "Next promo",
                                                children: "▸"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    return openModal(promos[promoIdx].modal);
                                },
                                className: "text-left w-full cursor-pointer group",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-xs font-black text-white group-hover:text-[#FFE28A] transition",
                                        children: promos[promoIdx].title
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[11px] text-slate-300 leading-snug mt-0.5",
                                        children: promos[promoIdx].sub
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "flex gap-1 mt-2",
                                children: promos.map(function(_, i) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            return setPromoIdx(i);
                                        },
                                        className: "h-1 flex-1 rounded-full cursor-pointer transition " + (i === promoIdx ? 'bg-[#E6B84C]' : 'bg-slate-700'),
                                        "aria-label": "Promo slide " + (i + 1)
                                    }, i);
                                })
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "absolute bottom-[106px] left-3 z-20",
                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                    onClick: function onClick() {
                        _AudioEngine.mlbbAudio.playModalOpen();
                        onOpenLiveStream();
                    },
                    className: "h-9 px-3.5 rounded-xl bg-rose-950 bg-gradient-to-r from-rose-950/95 to-[#1B2246]/95 border border-rose-400/60 hover:border-rose-300 flex items-center gap-2 text-xs font-black text-rose-100 shadow-lg cursor-pointer transition",
                    title: "Watch Live AI-vs-AI Spectate Match",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                            children: "\uD83D\uDCFA"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                            children: "Live / Stream"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                            className: "text-[10px] font-bold text-rose-300 mlbb-num",
                            children: "LIVE"
                        })
                    ]
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center justify-end gap-1.5 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center gap-3 px-3 py-1.5 rounded-xl mlbb-panel-gold text-xs font-black mlbb-num",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        title: "Tickets",
                                        className: "text-cyan-300 whitespace-nowrap",
                                        children: [
                                            "\uD83C\uDF9F️ ",
                                            profile.tickets.toLocaleString()
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        title: "Battle Points (BP)",
                                        className: "text-[#FFE28A] whitespace-nowrap",
                                        children: [
                                            "\uD83E\uDE99 ",
                                            profile.bp.toLocaleString()
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        onClick: function onClick() {
                                            return openModal('recharge');
                                        },
                                        className: "flex items-center gap-1 text-sky-300 hover:text-white cursor-pointer whitespace-nowrap",
                                        title: "Open Diamond Recharge Simulator",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    "\uD83D\uDC8E ",
                                                    profile.diamonds.toLocaleString()
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "px-1.5 py-0.2 rounded bg-sky-500/35 border border-sky-300/70 text-[10px] font-black text-white",
                                                children: "+"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    return openModal('help');
                                },
                                className: "w-10 h-10 rounded-xl bg-[#0B132B]/92 border border-slate-600/70 hover:border-[#E6B84C] flex items-center justify-center text-base cursor-pointer transition",
                                title: "Customer Service (FAQ, Bug Report, Account Appeal)",
                                children: "\uD83C\uDFA7"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    return openModal('mail');
                                },
                                className: "relative w-10 h-10 rounded-xl bg-[#0B132B]/92 border border-slate-600/70 hover:border-[#E6B84C] flex items-center justify-center text-base cursor-pointer transition",
                                title: "Mail Inbox",
                                children: [
                                    "✉️",
                                    unreadMailCount > 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center mlbb-num",
                                        children: unreadMailCount
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    return openModal('settings');
                                },
                                className: "w-10 h-10 rounded-xl bg-[#0B132B]/92 border border-[#E6B84C]/55 hover:border-[#FFE28A] flex items-center justify-center text-base cursor-pointer transition",
                                title: "Settings (7 Tabs + Custom UI)",
                                children: "⚙️"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "px-2.5 py-1 rounded-lg bg-[#0B132B]/90 border border-emerald-500/40 flex items-center gap-2 text-[11px] font-bold text-emerald-300 mlbb-num",
                        title: "Live Network Ping & Battery Status",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "inline-flex items-end gap-[2px] h-3",
                                "aria-hidden": "true",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "w-[3px] h-1.5 rounded-sm bg-emerald-400"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "w-[3px] h-2 rounded-sm bg-emerald-400"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "w-[3px] h-3 rounded-sm bg-emerald-400"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                children: [
                                    livePing,
                                    "ms"
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-slate-600",
                                children: "/"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "text-[#FFE28A]",
                                children: [
                                    "\uD83D\uDD0B ",
                                    batteryPct,
                                    "%"
                                ]
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "absolute top-[92px] right-3 z-20 flex items-start gap-2",
                children: [
                    socialOpen && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "w-76 max-w-[78vw] rounded-2xl mlbb-panel-gold p-3 shadow-2xl",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-between mb-2",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-xs font-black text-[#FFE28A] uppercase tracking-wide",
                                        children: [
                                            socialTab === 'friends' && "Friends (" + DEMO_FRIENDS.filter(function(f) {
                                                return f.online;
                                            }).length + " Online)",
                                            socialTab === 'squad' && "[" + profile.squad.tag + "] " + profile.squad.name,
                                            socialTab === 'recruit' && '5-Man Lobby Recruitment',
                                            socialTab === 'ranking' && 'Sanctuary Rankings'
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            return setSocialOpen(false);
                                        },
                                        className: "text-xs text-slate-400 hover:text-white px-1 cursor-pointer",
                                        children: "✕"
                                    })
                                ]
                            }),
                            socialTab === 'friends' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "space-y-1.5 max-h-56 overflow-y-auto pr-0.5",
                                children: DEMO_FRIENDS.map(function(f) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between p-1.5 rounded-lg bg-slate-900/85 border border-slate-700/70 gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex items-center gap-2 min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                        heroId: f.heroId,
                                                        size: 30
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "truncate",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-xs font-bold text-white truncate",
                                                                children: [
                                                                    f.name,
                                                                    ' ',
                                                                    f.affinity && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                        className: "text-[10px] text-pink-300 font-semibold",
                                                                        children: [
                                                                            "\xb7 ",
                                                                            f.affinity
                                                                        ]
                                                                    })
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-[10px] font-semibold " + (f.online ? 'text-emerald-400' : 'text-slate-400'),
                                                                children: [
                                                                    f.status,
                                                                    " \xb7 ",
                                                                    f.rank
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            f.online && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex items-center gap-1 shrink-0",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: function onClick() {
                                                            _AudioEngine.mlbbAudio.playClick();
                                                            setChatTab('Private');
                                                            setChatOpen(true);
                                                            setChatLines(function(prev) {
                                                                return [].concat(prev.slice(-24), [
                                                                    {
                                                                        ch: 'Private',
                                                                        sender: f.name,
                                                                        text: "Hey " + profile.name + "! Invite me when ready."
                                                                    }
                                                                ]);
                                                            });
                                                        },
                                                        className: "px-1.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-bold text-white cursor-pointer",
                                                        title: "Private Chat",
                                                        children: "\uD83D\uDCAC"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: function onClick() {
                                                            _AudioEngine.mlbbAudio.playPlayerReady();
                                                            onLaunchMode('ranked');
                                                        },
                                                        className: "px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-[10px] font-black text-white cursor-pointer",
                                                        children: "Invite"
                                                    })
                                                ]
                                            })
                                        ]
                                    }, f.id);
                                })
                            }),
                            socialTab === 'squad' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-2 text-xs",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p-2.5 rounded-xl bg-slate-900/90 border border-[#E6B84C]/40 space-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "font-black text-[#FFE28A]",
                                                        children: [
                                                            "[",
                                                            profile.squad.tag,
                                                            "] ",
                                                            profile.squad.name
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-[10px] font-black text-cyan-300",
                                                        children: (_profile_squad_rank = profile.squad.rank) != null ? _profile_squad_rank : 'Regional #14'
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[11px] text-slate-300",
                                                children: profile.squad.slogan
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-[10px] text-emerald-300 font-bold mlbb-num",
                                                children: [
                                                    "Members: 9/9 \xb7 Weekly Activity: ",
                                                    ((_profile_squad_activity = profile.squad.activity) != null ? _profile_squad_activity : 8420).toLocaleString()
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                        value: profile.squad.slogan,
                                        onChange: function onChange(e) {
                                            return onUpdateProfile(function(prev) {
                                                return _extends({}, prev, {
                                                    squad: _extends({}, prev.squad, {
                                                        slogan: e.target.value.slice(0, 60)
                                                    })
                                                });
                                            });
                                        },
                                        className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white",
                                        placeholder: "Edit squad slogan..."
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            _AudioEngine.mlbbAudio.playClick();
                                            onLaunchMode('ranked');
                                        },
                                        className: "w-full py-2 rounded-lg bg-[#E6B84C] bg-gradient-to-r from-[#E6B84C] to-[#C88E20] text-slate-950 font-black text-xs cursor-pointer",
                                        children: "Create 5-Man Squad Lobby"
                                    })
                                ]
                            }),
                            socialTab === 'recruit' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-2 text-xs",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "space-y-1.5 max-h-44 overflow-y-auto",
                                        children: recruitRooms.map(function(r) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "p-2 rounded-lg bg-slate-900/85 border border-slate-700 flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "font-bold text-white",
                                                                children: [
                                                                    r.host,
                                                                    " (",
                                                                    r.mode,
                                                                    ")"
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "text-[10px] text-amber-300 mlbb-num",
                                                                children: [
                                                                    "Need: ",
                                                                    r.need,
                                                                    " \xb7 ",
                                                                    r.filled
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: function onClick() {
                                                            _AudioEngine.mlbbAudio.playPlayerReady();
                                                            onLaunchMode(r.mode === 'Ranked' ? 'ranked' : 'classic');
                                                        },
                                                        className: "px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-[10px] font-black text-white cursor-pointer",
                                                        children: "Join"
                                                    })
                                                ]
                                            }, r.id);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            _AudioEngine.mlbbAudio.playClaimFanfare();
                                            var newRoom = {
                                                id: "rc_" + Date.now(),
                                                host: profile.name,
                                                mode: 'Ranked',
                                                need: 'Any Fill (Mythic+)',
                                                filled: '1/5'
                                            };
                                            setRecruitRooms(function(prev) {
                                                return [].concat([
                                                    newRoom
                                                ], prev.slice(0, 4));
                                            });
                                            setChatLines(function(prev) {
                                                return [].concat(prev.slice(-24), [
                                                    {
                                                        ch: 'Recruitment',
                                                        sender: profile.name,
                                                        text: "[Ranked 1/5] Recruiting 5-man squad! Any Fill."
                                                    }
                                                ]);
                                            });
                                        },
                                        className: "w-full py-1.5 rounded-lg bg-[#E6B84C] text-slate-950 font-black text-[11px] cursor-pointer",
                                        children: "+ Post 5-Man Lobby"
                                    })
                                ]
                            }),
                            socialTab === 'ranking' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-1.5 text-xs",
                                children: [
                                    [
                                        {
                                            pos: 1,
                                            name: 'ONIC.Kairi',
                                            stars: 162,
                                            heroId: 'lancelot',
                                            title: 'Global #1'
                                        },
                                        {
                                            pos: 2,
                                            name: 'BREN.FlapTzy',
                                            stars: 154,
                                            heroId: 'zilong',
                                            title: 'Regional #1'
                                        },
                                        {
                                            pos: 3,
                                            name: 'RRQ.Skylar',
                                            stars: 148,
                                            heroId: 'miya',
                                            title: 'Street #1'
                                        }
                                    ].map(function(r) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-1.5 rounded-lg bg-slate-900/85 border border-slate-700 flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            className: "w-5 text-center font-black text-[#FFE28A] mlbb-num",
                                                            children: [
                                                                "#",
                                                                r.pos
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                            heroId: r.heroId,
                                                            size: 26
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "font-bold text-white leading-tight",
                                                                    children: r.name
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-[10px] text-cyan-300",
                                                                    children: r.title
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    className: "text-[11px] font-black text-amber-300 mlbb-num",
                                                    children: [
                                                        "★",
                                                        r.stars
                                                    ]
                                                })
                                            ]
                                        }, r.pos);
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            return openModal('leaderboards');
                                        },
                                        className: "w-full py-1.5 rounded-lg bg-[#E6B84C] text-slate-950 font-black text-[11px] cursor-pointer",
                                        children: "\uD83C\uDFC6 Full Leaderboards (6 Categories) →"
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "flex flex-col gap-1.5",
                        children: [
                            {
                                id: 'friends',
                                icon: '👥',
                                label: 'Friends'
                            },
                            {
                                id: 'squad',
                                icon: '🛡️',
                                label: 'Squad'
                            },
                            {
                                id: 'recruit',
                                icon: '📣',
                                label: 'Recruit'
                            },
                            {
                                id: 'ranking',
                                icon: '🏆',
                                label: 'Ranking'
                            }
                        ].map(function(item) {
                            var active = socialOpen && socialTab === item.id;
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    return openSocialTab(item.id);
                                },
                                className: "w-16 py-1.5 px-1.5 rounded-xl border text-[10px] font-black flex flex-col items-center justify-center gap-0.5 cursor-pointer transition " + (active ? 'bg-[#E6B84C] border-[#FFE28A] text-slate-950 shadow-lg' : 'bg-[#0B132B]/92 border-[#E6B84C]/40 hover:border-[#FFE28A] text-slate-100'),
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-sm leading-none",
                                        children: item.icon
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "whitespace-nowrap",
                                        children: item.label
                                    })
                                ]
                            }, item.id);
                        })
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "absolute bottom-3 left-3 z-20 flex flex-col gap-1.5 max-w-[60vw]",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "w-[360px] max-w-[54vw]",
                        children: [
                            chatOpen && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "mb-1.5 rounded-xl mlbb-panel-gold p-2.5 shadow-2xl",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between mb-1.5 gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "flex flex-wrap gap-1",
                                                children: [
                                                    'Global',
                                                    'Local',
                                                    'Recruitment',
                                                    'Squad',
                                                    'Mentor',
                                                    'Private'
                                                ].map(function(c) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        onClick: function onClick() {
                                                            _AudioEngine.mlbbAudio.playSwoosh();
                                                            setChatTab(c);
                                                        },
                                                        className: "px-1.5 py-0.5 rounded text-[10px] font-black cursor-pointer " + (chatTab === c ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'),
                                                        children: c
                                                    }, c);
                                                })
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    return setChatOpen(false);
                                                },
                                                className: "text-xs text-slate-400 hover:text-white px-1 cursor-pointer",
                                                children: "✕"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "space-y-1 max-h-28 overflow-y-auto text-[11px] mb-2",
                                        children: chatLines.filter(function(l) {
                                            return l.ch === chatTab;
                                        }).map(function(l, idx) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-slate-200",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "font-bold text-[#FFE28A]",
                                                        children: [
                                                            l.sender,
                                                            ": "
                                                        ]
                                                    }),
                                                    l.text
                                                ]
                                            }, idx);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("form", {
                                        onSubmit: handleSendChat,
                                        className: "flex gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                value: chatInput,
                                                onChange: function onChange(e) {
                                                    return setChatInput(e.target.value);
                                                },
                                                placeholder: "Message " + chatTab + "...",
                                                className: "flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "submit",
                                                className: "px-2.5 py-1 rounded bg-[#E6B84C] text-slate-950 font-black text-xs cursor-pointer",
                                                children: "Send"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClick();
                                    setChatOpen(function(v) {
                                        return !v;
                                    });
                                },
                                className: "w-full h-9 px-3 rounded-xl bg-[#0B132B]/90 border border-slate-600/70 hover:border-[#E6B84C] flex items-center gap-2 text-left text-xs text-slate-200 truncate cursor-pointer transition",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "text-[#FFE28A] font-black shrink-0",
                                        children: [
                                            "\uD83D\uDCAC [",
                                            chatTab,
                                            "]"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "truncate",
                                        children: [
                                            latestChat == null ? void 0 : latestChat.sender,
                                            ": ",
                                            latestChat == null ? void 0 : latestChat.text
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "flex items-center gap-1 px-2 py-1 rounded-2xl mlbb-panel-gold w-fit",
                        children: [
                            {
                                id: 'prep',
                                icon: '⚔️',
                                label: 'Prep'
                            },
                            {
                                id: 'heroes',
                                icon: '🛡️',
                                label: 'Heroes'
                            },
                            {
                                id: 'collection',
                                icon: '✨',
                                label: 'Collection'
                            },
                            {
                                id: 'backpack',
                                icon: '🎒',
                                label: 'Backpack'
                            },
                            {
                                id: 'esports',
                                icon: '🏅',
                                label: 'Esports'
                            }
                        ].map(function(tab) {
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    return openModal(tab.id);
                                },
                                className: "h-11 px-3 rounded-xl hover:bg-[#1B3B6F]/70 flex flex-col items-center justify-center text-[11px] font-extrabold text-slate-100 hover:text-[#FFE28A] transition cursor-pointer whitespace-nowrap",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-base leading-none",
                                        children: tab.icon
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "mt-0.5",
                                        children: tab.label
                                    })
                                ]
                            }, tab.label);
                        })
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "absolute bottom-3 right-3 z-20 flex flex-col items-end gap-1.5",
                children: [
                    arcadePickerOpen && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p-2 rounded-xl bg-[#0B132B]/96 border border-purple-400/70 flex items-center gap-1.5 shadow-2xl text-[11px] font-black",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-purple-300 px-1",
                                children: "ARCADE:"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    setArcadePickerOpen(false);
                                    onUpdateProfile(function(p) {
                                        return _extends({}, p, {
                                            arcadeSubMode: 'mayhem'
                                        });
                                    });
                                    onLaunchMode('arcade');
                                },
                                className: "px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white cursor-pointer",
                                children: "⚡ Mayhem"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    setArcadePickerOpen(false);
                                    onUpdateProfile(function(p) {
                                        return _extends({}, p, {
                                            arcadeSubMode: 'overdrive'
                                        });
                                    });
                                    onLaunchMode('arcade');
                                },
                                className: "px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer",
                                children: "\uD83D\uDE80 Overdrive (80% CDR)"
                            })
                        ]
                    }),
                    customPickerOpen && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p-2 rounded-xl bg-[#0B132B]/96 border border-emerald-400/70 flex items-center gap-1.5 shadow-2xl text-[11px] font-black",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-emerald-300 px-1",
                                children: "CUSTOM:"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    setCustomPickerOpen(false);
                                    onUpdateProfile(function(p) {
                                        return _extends({}, p, {
                                            customSubMode: '5v5'
                                        });
                                    });
                                    onLaunchMode('classic');
                                },
                                className: "px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-200 cursor-pointer",
                                children: "⚔️ 5v5 Custom"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    setCustomPickerOpen(false);
                                    onUpdateProfile(function(p) {
                                        return _extends({}, p, {
                                            customSubMode: '1v1_mid'
                                        });
                                    });
                                    onLaunchMode('brawl');
                                },
                                className: "px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-200 cursor-pointer",
                                children: "\uD83D\uDD25 1v1 Mid"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    setCustomPickerOpen(false);
                                    onUpdateProfile(function(p) {
                                        return _extends({}, p, {
                                            customSubMode: 'practice'
                                        });
                                    });
                                    onLaunchMode('practice');
                                },
                                className: "px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer",
                                children: "\uD83C\uDFAF Practice Mode"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "grid grid-cols-2 gap-1.5 w-[294px]",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClick();
                                    onLaunchMode('ranked');
                                },
                                className: "h-14 px-3.5 rounded-xl mlbb-chamfer bg-[#E6B84C] bg-gradient-to-br from-[#FFE28A] via-[#E6B84C] to-[#B87414] border-2 border-[#FFE28A] hover:brightness-110 active:scale-[0.98] text-left shadow-xl cursor-pointer transition",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-sm font-black text-slate-950 tracking-wide",
                                        children: "RANKED"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-[10px] font-extrabold text-slate-900 truncate",
                                        children: [
                                            rankTier.name,
                                            " ★",
                                            profile.rankStars,
                                            " \xb7 5-Ban"
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClick();
                                    onLaunchMode('classic');
                                },
                                className: "h-14 px-3.5 rounded-xl mlbb-chamfer bg-[#1B3B6F] bg-gradient-to-br from-[#1B3B6F] to-[#0D2149] border-2 border-sky-400/75 hover:border-sky-200 active:scale-[0.98] text-left shadow-lg cursor-pointer transition",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-sm font-black text-white tracking-wide",
                                        children: "CLASSIC"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[10px] font-bold text-sky-300 truncate",
                                        children: "5v5 Blind Pick"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClick();
                                    onLaunchMode('brawl');
                                },
                                className: "h-10 px-3 rounded-xl bg-[#0B132B]/94 border border-orange-400/60 hover:border-orange-300 text-left flex items-center justify-between cursor-pointer transition",
                                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-[11px] font-black text-orange-200 leading-tight",
                                            children: "\uD83D\uDD25 BRAWL"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-[9px] text-slate-400",
                                            children: "Single Lane"
                                        })
                                    ]
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClick();
                                    setCustomPickerOpen(false);
                                    setArcadePickerOpen(function(v) {
                                        return !v;
                                    });
                                },
                                className: "h-10 px-3 rounded-xl bg-[#0B132B]/94 border border-purple-400/60 hover:border-purple-300 text-left flex items-center justify-between cursor-pointer transition",
                                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-[11px] font-black text-purple-200 leading-tight",
                                            children: "⚡ ARCADE"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-[9px] text-slate-400",
                                            children: "Mayhem / Overdrive"
                                        })
                                    ]
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClick();
                                    onLaunchMode('vs_ai');
                                },
                                className: "h-10 px-3 rounded-xl bg-[#0B132B]/94 border border-cyan-400/60 hover:border-cyan-300 text-left flex items-center justify-between cursor-pointer transition",
                                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-[11px] font-black text-cyan-200 leading-tight",
                                            children: "\uD83E\uDD16 VS AI"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-[9px] text-slate-400",
                                            children: "5v5 Bot Match"
                                        })
                                    ]
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClick();
                                    setArcadePickerOpen(false);
                                    setCustomPickerOpen(function(v) {
                                        return !v;
                                    });
                                },
                                className: "h-10 px-3 rounded-xl bg-[#0B132B]/94 border border-emerald-400/60 hover:border-emerald-300 text-left flex items-center justify-between cursor-pointer transition",
                                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-[11px] font-black text-emerald-200 leading-tight",
                                            children: "\uD83C\uDFAF CUSTOM"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-[9px] text-slate-400",
                                            children: "5v5 / 1v1 / Practice"
                                        })
                                    ]
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
// === MODULE: src/games/legends-arena/mlbb/components/MlbbExperienceShell ===
ArcadeMod.define("src/games/legends-arena/mlbb/components/MlbbExperienceShell", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MlbbExperienceShell", {
    enumerable: true,
    get: function() {
        return MlbbExperienceShell;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _storage = require("../storage");
var _heroes = require("../data/heroes");
var _AudioEngine = require("../engine/AudioEngine");
var _SmartAiBrain = require("../engine/SmartAiBrain");
var _MainLobby = require("./MainLobby");
var _ProfileAndHubModals = require("./ProfileAndHubModals");
var _PrepAndHeroModals = require("./PrepAndHeroModals");
var _HeroGalleryModal = require("./HeroGalleryModal");
var _PreMatchFlow = require("./PreMatchFlow");
var _SettingsAndCustomUi = require("./SettingsAndCustomUi");
var _BattleHUD = require("./BattleHUD");
var _InMatchOverlays = require("./InMatchOverlays");
var _LiveStreamOverlay = require("./LiveStreamOverlay");
require("../mlbb.css");
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
var MlbbExperienceShell = function MlbbExperienceShell(param) {
    var onExitToArcade = param.onExitToArcade;
    var _useState = (0, _react.useState)(function() {
        return (0, _storage.loadMlbbSave)();
    }), profile = _useState[0], setProfile = _useState[1];
    var _useState1 = (0, _react.useState)('lobby'), screen = _useState1[0], setScreen = _useState1[1];
    var _useState2 = (0, _react.useState)(null), lobbyModal = _useState2[0], setLobbyModal = _useState2[1];
    var _useState3 = (0, _react.useState)('ranked'), activeMode = _useState3[0], setActiveMode = _useState3[1];
    var _useState4 = (0, _react.useState)([]), invitedParty = _useState4[0], setInvitedParty = _useState4[1];
    var _useState5 = (0, _react.useState)(null), launchConfig = _useState5[0], setLaunchConfig = _useState5[1];
    var _useState6 = (0, _react.useState)(null), lastMatch = _useState6[0], setLastMatch = _useState6[1];
    (0, _react.useEffect)(function() {
        (0, _storage.saveMlbbProfile)(profile);
        _AudioEngine.mlbbAudio.setVolumes(profile.settings.sound);
    }, [
        profile
    ]);
    // Stop ambient Lobby Sanctuary BGM when entering Battle/LiveStream or leaving Legends Arena
    (0, _react.useEffect)(function() {
        if (screen === 'battle' || screen === 'livestream' || screen === 'loading') {
            _AudioEngine.mlbbAudio.stopLobbyBgm();
        }
    }, [
        screen
    ]);
    (0, _react.useEffect)(function() {
        return function() {
            _AudioEngine.mlbbAudio.stopLobbyBgm();
        };
    }, []);
    var updateProfile = (0, _react.useCallback)(function(fn) {
        setProfile(function(prev) {
            return fn(prev);
        });
    }, []);
    var updateSettings = (0, _react.useCallback)(function(next) {
        setProfile(function(prev) {
            return _extends({}, prev, {
                settings: next
            });
        });
    }, []);
    var handleLaunchMode = function handleLaunchMode(mode) {
        setActiveMode(mode);
        setLobbyModal(null);
        setProfile(function(prev) {
            return _extends({}, prev, {
                selectedMode: mode
            });
        });
        setScreen('prematch');
    };
    var handleQuickPracticeHero = (0, _react.useCallback)(function(heroId, skinId, lane) {
        var _profile_activeBuildSlot_heroId, _profile_emblemTalents_emblemId;
        var hero = (0, _heroes.getMlbbHeroById)(heroId);
        var slotIdx = (_profile_activeBuildSlot_heroId = profile.activeBuildSlot[heroId]) != null ? _profile_activeBuildSlot_heroId : 0;
        var savedBuildsForHero = profile.savedBuilds[heroId];
        var playerBuild = savedBuildsForHero && savedBuildsForHero[slotIdx] && savedBuildsForHero[slotIdx].length > 0 ? savedBuildsForHero[slotIdx] : hero.recommendedBuild;
        var opponentId = heroId === 'zilong' ? 'layla' : 'zilong';
        var emblemId = profile.selectedEmblemId;
        var talents = (_profile_emblemTalents_emblemId = profile.emblemTalents[emblemId]) != null ? _profile_emblemTalents_emblemId : {
            t1: 'thrill',
            t2: 'festival_blood',
            t3: 'lethal_ignition'
        };
        var resolvedVariant = profile.selectedMapVariant === 'random' ? 'dangerous_grass' : profile.selectedMapVariant;
        var cfg = {
            mode: 'practice',
            customSubMode: 'practice',
            playerHeroId: heroId,
            playerSkinId: skinId,
            playerLane: lane,
            playerSpellId: profile.selectedSpellId,
            playerEmblemId: emblemId,
            playerTalents: talents,
            playerBuild: playerBuild,
            mapTheme: 'sanctum_island',
            mapVariant: resolvedVariant,
            blueTeam: [
                {
                    heroId: heroId,
                    lane: lane,
                    name: profile.name,
                    isPlayer: true,
                    spellId: profile.selectedSpellId,
                    emblemId: emblemId
                }
            ],
            redTeam: [
                {
                    heroId: opponentId,
                    lane: lane,
                    name: 'Training Bot',
                    isPlayer: false,
                    spellId: 'flicker',
                    emblemId: 'fighter'
                }
            ]
        };
        setActiveMode('practice');
        setLobbyModal(null);
        setProfile(function(prev) {
            var _prev_ownedSkins_heroId;
            var _hero_skins_;
            var ownedList = (_prev_ownedSkins_heroId = prev.ownedSkins[heroId]) != null ? _prev_ownedSkins_heroId : [];
            var canEquip = ownedList.includes(skinId) || ((_hero_skins_ = hero.skins[0]) == null ? void 0 : _hero_skins_.id) === skinId;
            var _obj;
            return _extends({}, prev, {
                selectedHeroId: heroId,
                selectedLane: lane,
                selectedMode: 'practice',
                equippedSkins: canEquip ? _extends({}, prev.equippedSkins, (_obj = {}, _obj[heroId] = skinId, _obj)) : prev.equippedSkins
            });
        });
        setLaunchConfig(cfg);
        setScreen('loading');
    }, [
        profile
    ]);
    var handleMatchEnd = (0, _react.useCallback)(function(record) {
        setProfile(function(prev) {
            var res = (0, _SmartAiBrain.computePostMatchProgression)(prev, record);
            setLastMatch({
                record: record,
                starDelta: res.starDelta,
                starProtected: res.starProtected,
                starProtectionSource: res.starProtectionSource,
                starRaisedBonus: res.starRaisedBonus,
                bpGain: res.bpGain,
                expGain: res.expGain,
                doubleBpUsed: res.doubleBpUsed,
                doubleExpUsed: res.doubleExpUsed,
                mmrDelta: res.mmrDelta,
                masteryGain: res.masteryGain
            });
            return res.nextProfile;
        });
        setScreen('postmatch');
    }, []);
    var cbClass = profile.settings.basics.colorblind === 'deuteranopia' ? 'mlbb-cb-deuteranopia' : profile.settings.basics.colorblind === 'protanopia' ? 'mlbb-cb-protanopia' : profile.settings.basics.colorblind === 'tritanopia' ? 'mlbb-cb-tritanopia' : '';
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-[#060B18] " + cbClass,
        children: [
            screen === 'lobby' && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_MainLobby.MainLobby, {
                        profile: profile,
                        onOpenModal: setLobbyModal,
                        onLaunchMode: handleLaunchMode,
                        onOpenLiveStream: function onOpenLiveStream() {
                            return setScreen('livestream');
                        },
                        onExitToArcade: onExitToArcade,
                        onUpdateProfile: updateProfile
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_ProfileAndHubModals.ProfileAndHubModals, {
                        modal: lobbyModal,
                        profile: profile,
                        onClose: function onClose() {
                            return setLobbyModal(null);
                        },
                        onUpdateProfile: updateProfile,
                        onReplaceProfile: setProfile
                    }),
                    lobbyModal === 'prep' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_PrepAndHeroModals.PrepAndHeroModals, {
                        mode: "prep",
                        profile: profile,
                        onClose: function onClose() {
                            return setLobbyModal(null);
                        },
                        onUpdateProfile: updateProfile
                    }),
                    lobbyModal === 'heroes' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroGalleryModal.HeroGalleryModal, {
                        profile: profile,
                        onClose: function onClose() {
                            return setLobbyModal(null);
                        },
                        onUpdateProfile: updateProfile,
                        onPracticeHero: handleQuickPracticeHero
                    }),
                    lobbyModal === 'settings' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_SettingsAndCustomUi.SettingsAndCustomUiModal, {
                        settings: profile.settings,
                        onUpdateSettings: updateSettings,
                        onClose: function onClose() {
                            return setLobbyModal(null);
                        }
                    })
                ]
            }),
            screen === 'prematch' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_PreMatchFlow.PreMatchRoom, {
                mode: activeMode,
                profile: profile,
                onUpdateProfile: updateProfile,
                onBack: function onBack() {
                    return setScreen('lobby');
                },
                onProceedToDraft: function onProceedToDraft(party) {
                    setInvitedParty(party);
                    setScreen('draft');
                }
            }),
            screen === 'draft' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_PreMatchFlow.DraftPickScreen, {
                mode: activeMode,
                profile: profile,
                invitedParty: invitedParty,
                onUpdateProfile: updateProfile,
                onCancel: function onCancel() {
                    return setScreen('prematch');
                },
                onConfirmMatch: function onConfirmMatch(cfg) {
                    setLaunchConfig(cfg);
                    setScreen('loading');
                }
            }),
            screen === 'loading' && launchConfig && /*#__PURE__*/ (0, _jsxruntime.jsx)(_PreMatchFlow.MatchLoadingScreen, {
                config: launchConfig,
                onReady: function onReady() {
                    return setScreen('battle');
                }
            }),
            screen === 'battle' && launchConfig && /*#__PURE__*/ (0, _jsxruntime.jsx)(_BattleHUD.BattleHUD, {
                config: launchConfig,
                profile: profile,
                onUpdateSettings: updateSettings,
                onMatchEnd: handleMatchEnd,
                onExitToLobby: function onExitToLobby() {
                    return setScreen('lobby');
                }
            }),
            screen === 'livestream' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_LiveStreamOverlay.LiveStreamOverlay, {
                profile: profile,
                onExit: function onExit() {
                    return setScreen('lobby');
                }
            }),
            screen === 'postmatch' && lastMatch && /*#__PURE__*/ (0, _jsxruntime.jsx)(_InMatchOverlays.PostMatchScreen, {
                record: lastMatch.record,
                profile: profile,
                starDelta: lastMatch.starDelta,
                starProtected: lastMatch.starProtected,
                starProtectionSource: lastMatch.starProtectionSource,
                starRaisedBonus: lastMatch.starRaisedBonus,
                bpGain: lastMatch.bpGain,
                expGain: lastMatch.expGain,
                doubleBpUsed: lastMatch.doubleBpUsed,
                doubleExpUsed: lastMatch.doubleExpUsed,
                mmrDelta: lastMatch.mmrDelta,
                masteryGain: lastMatch.masteryGain,
                onReturnLobby: function onReturnLobby() {
                    return setScreen('lobby');
                },
                onPlayAgain: function onPlayAgain() {
                    return setScreen('prematch');
                }
            })
        ]
    });
};

});

})(window.ArcadeMod);
