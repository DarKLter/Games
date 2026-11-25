(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/hybrid/MainMenuShell ===
ArcadeMod.define("src/games/hoops-2k26/hybrid/MainMenuShell", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UltimateHybridShell", {
    enumerable: true,
    get: function() {
        return UltimateHybridShell;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _MenuBackground3D = require("./MenuBackground3D");
var _PlayNowSetup = require("./PlayNowSetup");
var _RosterManager = require("./RosterManager");
var _CreateAPlayer = require("./CreateAPlayer");
var _LiveCourtStage = require("../engine/LiveCourtStage");
var _HybridModals = require("./HybridModals");
var _TheCityHub = require("../modes/TheCityHub");
var _MyPlayerBuilder = require("../modes/MyPlayerBuilder");
var _PathToGreatness = require("../modes/PathToGreatness");
var _MyTeamHub = require("../modes/MyTeamHub");
var _MyNbaAssociation = require("../modes/MyNbaAssociation");
var _BlacktopSetup = require("../modes/BlacktopSetup");
var _TrainingCamp = require("../modes/TrainingCamp");
var _modesStore = require("../modes/modesStore");
var _SettingsModal = require("../part7/SettingsModal");
var _CustomHudEditor = require("../part7/CustomHudEditor");
var _audioEngine = require("./audioEngine");
var _store = require("./store");
var _rosterStore = require("./rosterStore");
var _teamCatalog = require("./teamCatalog");
var _storage = require("../../../core/storage");
require("./hybridShell.css");
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
var NEXTGEN_TABS = [
    {
        id: 'MAIN_MENU',
        label: 'HOME'
    },
    {
        id: 'PLAY_NOW_SETUP',
        label: 'PLAY NOW'
    },
    {
        id: 'MYCAREER_HUB',
        label: 'MyCAREER / THE CITY'
    },
    {
        id: 'MYTEAM_HUB',
        label: 'MyTEAM'
    },
    {
        id: 'MYNBA_HUB',
        label: 'MyNBA ERAS'
    },
    {
        id: 'THE_W_HUB',
        label: 'THE W'
    },
    {
        id: 'ROSTER_MANAGER',
        label: 'ROSTERS'
    },
    {
        id: 'SETTINGS',
        label: 'FEATURES'
    }
];
var NEXTGEN_SIDE_CARDS = [
    {
        id: 'quick_play',
        title: 'QUICK PLAY NOW',
        subtitle: '72 Teams · 2K14 vs 2K26 Cross-Era Matchup',
        tag: 'EXHIBITION',
        accent: '#e11d48',
        target: 'PLAY_NOW_SETUP'
    },
    {
        id: 'street_kings',
        title: 'STREET KINGS BOSSES',
        subtitle: 'Skyline Park & Street Kings 3v3 to 21',
        tag: '2K26 CITY',
        accent: '#f59e0b',
        target: 'BLACKTOP_SETUP',
        venuePreset: 'STREET_KINGS'
    },
    {
        id: 'myteam_gc',
        title: 'MyTEAM GAME CHANGER',
        subtitle: 'MTP Rewards, Challenges & Cross-Era Cards',
        tag: 'MyTEAM',
        accent: '#a855f7',
        target: 'MYTEAM_HUB'
    },
    {
        id: 'ptg_legacy',
        title: '2K14 PATH TO GREATNESS',
        subtitle: "LeBron #6 Heat '14 Finals Legacy Showcase",
        tag: '2K14 LEGACY',
        accent: '#38bdf8',
        target: 'PATH_TO_GREATNESS'
    }
];
var METRO_2K14_TILES = [
    {
        id: 'ptg',
        title: 'LeBron: Path to Greatness',
        subtitle: '2013-14 Heat Dynasty & Fantastic Journey',
        tag: '2K14 SIGNATURE',
        accent: '#e11d48',
        target: 'PATH_TO_GREATNESS'
    },
    {
        id: 'mycareer',
        title: 'MyCAREER & The City',
        subtitle: 'Rookie Showcase + Walkable 3D City',
        tag: 'CAREER',
        accent: '#f59e0b',
        target: 'MYCAREER_HUB'
    },
    {
        id: 'assoc',
        title: 'The Association / MyGM',
        subtitle: 'All 30 2K14 & 30 2K26 NBA Franchises',
        tag: 'FRANCHISE',
        accent: '#38bdf8',
        target: 'MYNBA_HUB'
    },
    {
        id: 'myteam',
        title: 'MyTEAM',
        subtitle: 'Cross-Era Card Collector & MTP',
        tag: 'COLLECTOR',
        accent: '#a855f7',
        target: 'MYTEAM_HUB'
    },
    {
        id: 'blacktop',
        title: 'Blacktop / Training Camp',
        subtitle: 'Skyline Park, Rivet City & Blacktop Cage',
        tag: 'STREET',
        accent: '#fb923c',
        target: 'BLACKTOP_SETUP'
    },
    {
        id: 'euro',
        title: 'EuroLeague / Classic Legends',
        subtitle: 'Real Madrid, Barcelona, CSKA, Olympiacos & 4 Legends',
        tag: 'WORLD',
        accent: '#22c55e',
        target: 'PLAY_NOW_SETUP',
        poolPreset: 'EUROLEAGUE_14'
    }
];
var TICKER_HEADLINES = [
    "LeBron James (#6, 99 OVR) leads Miami Heat '14 in NBA 2K14 Finals Spotlight",
    "Shai Gilgeous-Alexander (98 OVR) & OKC Thunder '26 headline NBA 2K26 Skyline Park",
    '72 Complete Teams · 576+ Authentic Players now live in Manage Roster & Create-A-Player',
    "Classic Legends ('96 Bulls, '01 Lakers, '86 Celtics, '17 Warriors) + EuroLeague & The W",
    '2K Beats Procedural Synth Engine: 6 Era Tracks ready in Jukebox'
];
function eraLabel(mode) {
    if (mode === '2K14_CLASSIC') return '2K14 CLASSIC';
    if (mode === '2K26_NEXTGEN') return '2K26 NEXT-GEN';
    return 'HYBRID PRO';
}
var UltimateHybridShell = function UltimateHybridShell(param) {
    var onBackToArcade = param.onBackToArcade, onLaunchCourt = param.onLaunchCourt, onOpenCity3D = param.onOpenCity3D, onOpenClassicStudio = param.onOpenClassicStudio;
    var save = (0, _store.useUltimateHybridStore)();
    var rosterSnap = (0, _rosterStore.useRosterStore)();
    var _useState = (0, _react.useState)(function() {
        return _audioEngine.HybridAudioEngine.getBeatsSnapshot();
    }), beats = _useState[0], setBeats = _useState[1];
    var _useState1 = (0, _react.useState)(null), drawer = _useState1[0], setDrawer = _useState1[1];
    var _useState2 = (0, _react.useState)('GAMEPLAY'), settingsInitTab = _useState2[0], setSettingsInitTab = _useState2[1];
    var _useState3 = (0, _react.useState)('2k14_mia'), studioTeamId = _useState3[0], setStudioTeamId = _useState3[1];
    var _useState4 = (0, _react.useState)('DAILY'), challengeCat = _useState4[0], setChallengeCat = _useState4[1];
    var _useState5 = (0, _react.useState)(false), hudHidden = _useState5[0], setHudHidden = _useState5[1];
    var _useState6 = (0, _react.useState)(false), hudEditorOpen = _useState6[0], setHudEditorOpen = _useState6[1];
    var _useState7 = (0, _react.useState)(60), fps = _useState7[0], setFps = _useState7[1];
    var _useState8 = (0, _react.useState)(null), toast = _useState8[0], setToast = _useState8[1];
    var era = save.uiEraMode;
    var screen = save.activeScreen;
    var notify = function notify(msg) {
        setToast(msg);
        window.setTimeout(function() {
            return setToast(function(cur) {
                return cur === msg ? null : cur;
            });
        }, 2800);
    };
    var openSettingsAt = function openSettingsAt(tab) {
        _audioEngine.HybridAudioEngine.playUi('click', era);
        setSettingsInitTab(tab);
        setDrawer('SETTINGS');
    };
    // Sync audio settings on mount & listen to 2K Beats updates
    (0, _react.useEffect)(function() {
        _audioEngine.HybridAudioEngine.applySettings(save.settings.audio);
        return _audioEngine.HybridAudioEngine.subscribe(setBeats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    var featuredAway = (0, _react.useMemo)(function() {
        return (0, _teamCatalog.getHybridTeamById)(save.activeMatchConfig.awayTeamId);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        save.activeMatchConfig.awayTeamId,
        rosterSnap.revision
    ]);
    var featuredHome = (0, _react.useMemo)(function() {
        return (0, _teamCatalog.getHybridTeamById)(save.activeMatchConfig.homeTeamId);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        save.activeMatchConfig.homeTeamId,
        rosterSnap.revision
    ]);
    var activeChallenges = (0, _react.useMemo)(function() {
        return save.challenges.filter(function(c) {
            return c.category === challengeCat;
        });
    }, [
        save.challenges,
        challengeCat
    ]);
    var handleToggleEra = function handleToggleEra() {
        var next = _store.UltimateHybridStore.cycleEraMode();
        _audioEngine.HybridAudioEngine.playUi('switch', next);
        notify("UI Era switched to " + eraLabel(next));
    };
    var handleNavigate = function handleNavigate(target, poolPreset, venuePreset) {
        _audioEngine.HybridAudioEngine.playUi('confirm', era);
        if (target === 'SETTINGS') {
            openSettingsAt('GAMEPLAY');
            return;
        }
        if (target === 'PROFILE_VIP') {
            setDrawer('PROFILE_VIP');
            return;
        }
        if (poolPreset === 'EUROLEAGUE_14') {
            _store.UltimateHybridStore.updateMatchConfig({
                awayEraPool: 'EUROLEAGUE_14',
                homeEraPool: 'EUROLEAGUE_14',
                awayTeamId: 'euro_rm',
                homeTeamId: 'euro_fcb',
                venue: 'EUROLEAGUE_PALACE'
            });
        } else if (target === 'THE_W_HUB') {
            _store.UltimateHybridStore.updateMatchConfig({
                awayEraPool: 'THE_W',
                homeEraPool: 'THE_W',
                awayTeamId: 'wnba_lva',
                homeTeamId: 'wnba_ind',
                venue: 'WNBA_ARENA'
            });
        } else if (target === 'PATH_TO_GREATNESS') {
            _store.UltimateHybridStore.updateMatchConfig({
                awayEraPool: 'NBA_2K14',
                homeEraPool: 'NBA_2K14',
                awayTeamId: '2k14_sas',
                homeTeamId: '2k14_mia',
                venue: 'ARENA_2K14'
            });
        } else if (target === 'BLACKTOP_SETUP') {
            _store.UltimateHybridStore.updateMatchConfig({
                venue: venuePreset != null ? venuePreset : 'SKYLINE_PARK',
                playersPerSide: 3,
                targetScore: 21
            });
        }
        _store.UltimateHybridStore.setActiveScreen(target);
    };
    var handleTipOff = function handleTipOff(cfg, away, home) {
        var _VENUE_OPTIONS_find;
        var venueDef = (_VENUE_OPTIONS_find = _teamCatalog.VENUE_OPTIONS.find(function(v) {
            return v.id === cfg.venue;
        })) != null ? _VENUE_OPTIONS_find : _teamCatalog.VENUE_OPTIONS[0];
        var isHomeUser = cfg.sideControl !== 'AWAY';
        var userTeamSummary = isHomeUser ? home : away;
        var cpuTeamSummary = isHomeUser ? away : home;
        // Build live 3D overrides directly from the Part 2 72-team RosterStore
        var userFullData = _rosterStore.RosterStore.getTeamById(userTeamSummary.id);
        var cpuFullData = _rosterStore.RosterStore.getTeamById(cpuTeamSummary.id);
        var homeTeamOverride = (0, _rosterStore.toHoops2K26TeamOverride)(userFullData, userTeamSummary.mappedCourtTeamId);
        var awayTeamOverride = (0, _rosterStore.toHoops2K26TeamOverride)(cpuFullData, cpuTeamSummary.mappedCourtTeamId);
        var matchCtx = {
            sourceLabel: away.abbr + " @ " + home.abbr + " \xb7 " + venueDef.label,
            courtTheme: venueDef.courtTheme,
            playersPerSide: cfg.playersPerSide,
            homeTeamId: userTeamSummary.mappedCourtTeamId,
            awayTeamId: cpuTeamSummary.mappedCourtTeamId,
            homeTeamOverride: homeTeamOverride,
            awayTeamOverride: awayTeamOverride,
            homeJerseyVariant: cfg.homeJersey === 'CITY' ? 'city' : cfg.homeJersey === 'AWAY' ? 'away' : 'home',
            useMyPlayer: false,
            targetScore: cfg.targetScore,
            quarterSec: Math.max(45, Math.round(cfg.quarterLengthMin * 60)),
            difficultyLabel: cfg.difficulty,
            repMult: 1.15,
            badgeMult: 1.25,
            vcBonus: 420
        };
        _storage.playerState.hoops2k26.activeMatchContext = matchCtx;
        _storage.playerState.selectedBasketballTeam = userTeamSummary.mappedCourtTeamId % 4;
        (0, _storage.persistArenaSelections)();
        (0, _storage.persistHoops2K26)();
        _modesStore.ModesStore.setActiveLaunchPayload(null);
        _store.UltimateHybridStore.updateMatchConfig(cfg);
        _audioEngine.HybridAudioEngine.pause();
        _store.UltimateHybridStore.setActiveScreen('LIVE_GAME');
    };
    var handleInstantTipOff = function handleInstantTipOff() {
        _audioEngine.HybridAudioEngine.playWhistle();
        _audioEngine.HybridAudioEngine.announce("Instant tip-off! " + featuredAway.fullName + " at " + featuredHome.fullName + "!");
        handleTipOff(save.activeMatchConfig, featuredAway, featuredHome);
    };
    // Global keyboard shortcuts matching Part 1 legend ([H], [F], [M], [Q/E], [Esc])
    (0, _react.useEffect)(function() {
        var onKey = function onKey(e) {
            var _e_target;
            var tag = (_e_target = e.target) == null ? void 0 : _e_target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (e.code === 'Escape') {
                if (hudEditorOpen) {
                    setHudEditorOpen(false);
                } else if (drawer) {
                    setDrawer(null);
                } else if (screen !== 'MAIN_MENU') {
                    _store.UltimateHybridStore.setActiveScreen('MAIN_MENU');
                }
                return;
            }
            if (drawer || hudEditorOpen) return;
            if (e.code === 'KeyH' && screen === 'MAIN_MENU') {
                setHudHidden(function(h) {
                    return !h;
                });
            } else if (e.code === 'KeyF' && screen === 'MAIN_MENU' && !hudHidden) {
                handleInstantTipOff();
            } else if (e.code === 'KeyM' && screen === 'MAIN_MENU' && !hudHidden) {
                _audioEngine.HybridAudioEngine.playUi('confirm', era);
                _store.UltimateHybridStore.setActiveScreen('CITY_EXPLORE');
            } else if ((e.code === 'KeyQ' || e.code === 'KeyE') && screen === 'MAIN_MENU' && !hudHidden) {
                handleToggleEra();
            }
        };
        window.addEventListener('keydown', onKey);
        return function() {
            return window.removeEventListener('keydown', onKey);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        screen,
        drawer,
        hudHidden,
        hudEditorOpen,
        era,
        featuredAway,
        featuredHome
    ]);
    var openRosterManager = function openRosterManager(teamId) {
        if (teamId) setStudioTeamId(teamId);
        _audioEngine.HybridAudioEngine.playUi('confirm', era);
        _store.UltimateHybridStore.setActiveScreen('ROSTER_MANAGER');
    };
    var openCreateAPlayer = function openCreateAPlayer(teamId) {
        if (teamId) setStudioTeamId(teamId);
        _audioEngine.HybridAudioEngine.playUi('confirm', era);
        _store.UltimateHybridStore.setActiveScreen('CREATE_A_PLAYER');
    };
    var launchPlayNowForTeam = function launchPlayNowForTeam(teamId) {
        var team = (0, _teamCatalog.getHybridTeamById)(teamId);
        _store.UltimateHybridStore.updateMatchConfig({
            homeEraPool: team.eraPool,
            homeTeamId: team.id,
            venue: team.eraPool === 'THE_W' ? 'WNBA_ARENA' : team.eraPool === 'EUROLEAGUE_14' ? 'EUROLEAGUE_PALACE' : save.activeMatchConfig.venue
        });
        _store.UltimateHybridStore.setActiveScreen('PLAY_NOW_SETUP');
    };
    var renderChallengeCard = function renderChallengeCard() {
        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("aside", {
            className: "h2k-challenge-card",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "h2k-challenge-head",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                            className: "h2k-kicker",
                            children: "REWARDS TRACKER"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "h2k-challenge-tabs",
                            children: [
                                'DAILY',
                                'SEASONAL',
                                'LIFETIME'
                            ].map(function(cat) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "h2k-mini-pill " + (challengeCat === cat ? 'active' : ''),
                                    onClick: function onClick() {
                                        _audioEngine.HybridAudioEngine.playUi('click', era);
                                        setChallengeCat(cat);
                                    },
                                    children: cat
                                }, cat);
                            })
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "h2k-challenge-list",
                    children: activeChallenges.map(function(ch) {
                        var pct = Math.min(100, Math.round(ch.progress / Math.max(1, ch.target) * 100));
                        var ready = ch.progress >= ch.target && !ch.claimed;
                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "h2k-challenge-item",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-challenge-row",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: ch.title
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            children: [
                                                ch.progress,
                                                "/",
                                                ch.target
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                    children: ch.description
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "h2k-rating-track",
                                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h2k-rating-fill",
                                        style: {
                                            width: "" + pct + "%",
                                            backgroundColor: ready ? '#22c55e' : '#f59e0b'
                                        }
                                    })
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "h2k-challenge-foot",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            className: "h2k-reward-txt",
                                            children: [
                                                "+",
                                                ch.vcReward,
                                                " VC \xb7 +",
                                                ch.mtpReward,
                                                " MTP"
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            className: "h2k-claim-btn " + (ready ? 'ready' : ''),
                                            disabled: !ready,
                                            onClick: function onClick() {
                                                var res = _store.UltimateHybridStore.claimChallenge(ch.id);
                                                if (res.ok) {
                                                    _audioEngine.HybridAudioEngine.playGreenRelease();
                                                    notify("Claimed +" + res.rewardVc + " VC & +" + res.rewardMtp + " MTP!");
                                                }
                                            },
                                            children: ch.claimed ? 'CLAIMED ✓' : ready ? 'CLAIM REWARD' : 'IN PROGRESS'
                                        })
                                    ]
                                })
                            ]
                        }, ch.id);
                    })
                })
            ]
        });
    };
    // Star jersey details reflect current era
    var stageJerseyNum = era === '2K14_CLASSIC' ? 6 : 2;
    var stagePrimary = era === '2K14_CLASSIC' ? '#98002e' : '#0f172a';
    var stageTrim = era === '2K14_CLASSIC' ? '#f9a01b' : '#e11d48';
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h2k-root era-" + era.toLowerCase(),
        children: [
            screen !== 'LIVE_GAME' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_MenuBackground3D.MenuBackground3D, {
                eraMode: era,
                starJerseyNumber: stageJerseyNum,
                starPrimaryHex: stagePrimary,
                starTrimHex: stageTrim,
                onFpsSample: setFps
            }),
            toast && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-toast",
                children: toast
            }),
            hudHidden && screen === 'MAIN_MENU' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-cinema-restore",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                    type: "button",
                    className: "h2k-btn-accent",
                    onClick: function onClick() {
                        return setHudHidden(false);
                    },
                    children: "▴ SHOW MENU HUD [H]"
                })
            }),
            screen === 'MAIN_MENU' && !hudHidden && !hudEditorOpen && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "h2k-shell-layer",
                children: [
                    era === '2K14_CLASSIC' && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                                className: "h2k-2k14-topbar",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-brand-cluster",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-back-arcade-btn",
                                                onClick: function onClick() {
                                                    _audioEngine.HybridAudioEngine.pause();
                                                    onBackToArcade();
                                                },
                                                children: "◀ ARCADE"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-2k14-logo",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "nba",
                                                        children: "NBA"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "2K14"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-era-toggle-pill",
                                                onClick: handleToggleEra,
                                                title: "Cycle UI Era: Hybrid Pro / 2K14 Classic / 2K26 Next-Gen",
                                                children: "ERA: 2K14 ⇄ 2K26 / HYBRID"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-2k14-ticker",
                                        "aria-label": "2K Sports Live Ticker",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "h2k-ticker-badge",
                                                children: "2K SPORTS"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "h2k-ticker-track",
                                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: TICKER_HEADLINES.join('   •   ')
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-utility-cluster",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-util-btn",
                                                onClick: function onClick() {
                                                    _audioEngine.HybridAudioEngine.playUi('click', era);
                                                    setDrawer('PROFILE_VIP');
                                                },
                                                children: "VIP"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "h2k-currency-chip vc",
                                                children: [
                                                    "VC ",
                                                    save.currencies.vc.toLocaleString()
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-util-btn",
                                                onClick: function onClick() {
                                                    _audioEngine.HybridAudioEngine.playUi('click', era);
                                                    setDrawer('BEATS_JUKEBOX');
                                                },
                                                children: "\uD83C\uDFB5 2K BEATS"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-util-btn",
                                                onClick: function onClick() {
                                                    return openSettingsAt('GAMEPLAY');
                                                },
                                                children: "OPTIONS"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("main", {
                                className: "h2k-2k14-grid",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("section", {
                                        className: "h2k-2k14-hero-card",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "h2k-hero-eyebrow",
                                                children: "FEATURED 2K14 BROADCAST SPOTLIGHT"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h1", {
                                                children: "PLAY NOW"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                className: "h2k-hero-copy",
                                                children: "Instant 5v5 exhibition across 72 authentic teams: all 30 2013-14 NBA squads, all 30 2025-26 NBA squads, Legends, EuroLeague & The W."
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-hero-matchup-preview",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_teamCatalog.TeamEmblemSVG, {
                                                        team: featuredAway,
                                                        size: 54
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "h2k-hero-vs",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                                children: [
                                                                    featuredAway.abbr,
                                                                    " @ ",
                                                                    featuredHome.abbr
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                children: [
                                                                    featuredAway.starPlayer.name,
                                                                    " (",
                                                                    featuredAway.starPlayer.ovr,
                                                                    ") vs",
                                                                    ' ',
                                                                    featuredHome.starPlayer.name,
                                                                    " (",
                                                                    featuredHome.starPlayer.ovr,
                                                                    ")"
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_teamCatalog.TeamEmblemSVG, {
                                                        team: featuredHome,
                                                        size: 54
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-hero-actions h2k-hero-dual-btns",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        type: "button",
                                                        className: "h2k-tipoff-cta",
                                                        onClick: handleInstantTipOff,
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "h2k-tipoff-title",
                                                                children: "TIP-OFF NOW"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "h2k-tipoff-sub",
                                                                children: "Instant 3D Match [F]"
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                        type: "button",
                                                        className: "h2k-btn-ghost h2k-choose-teams-btn",
                                                        onClick: function onClick() {
                                                            return handleNavigate('PLAY_NOW_SETUP');
                                                        },
                                                        children: "CHOOSE TEAMS (72)"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("section", {
                                        className: "h2k-2k14-metro-grid",
                                        "aria-label": "NBA 2K14 Game Modes",
                                        children: METRO_2K14_TILES.map(function(tile) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                type: "button",
                                                className: "h2k-metro-tile",
                                                style: {
                                                    borderTopColor: tile.accent
                                                },
                                                onClick: function onClick() {
                                                    return handleNavigate(tile.target, tile.poolPreset);
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "h2k-metro-tag",
                                                        style: {
                                                            color: tile.accent
                                                        },
                                                        children: tile.tag
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                        children: tile.title
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                        children: tile.subtitle
                                                    })
                                                ]
                                            }, tile.id);
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("nav", {
                                className: "h2k-2k14-metallic-bar",
                                "aria-label": "2K14 Features Action Bar",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "h2k-metallic-item",
                                        onClick: function onClick() {
                                            return openRosterManager(featuredHome.id);
                                        },
                                        children: "MANAGE ROSTER"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "h2k-metallic-item",
                                        onClick: function onClick() {
                                            return openCreateAPlayer(featuredHome.id);
                                        },
                                        children: "CREATE-A-PLAYER"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "h2k-metallic-item",
                                        onClick: function onClick() {
                                            _audioEngine.HybridAudioEngine.playUi('click', era);
                                            setDrawer('PROFILE_VIP');
                                        },
                                        children: "VIP PROFILE"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "h2k-metallic-item",
                                        onClick: function onClick() {
                                            return openSettingsAt('COACH');
                                        },
                                        children: "GAME SLIDERS"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "h2k-metallic-item",
                                        onClick: function onClick() {
                                            return openSettingsAt('CONTROLLER');
                                        },
                                        children: "CONTROLLER"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "h2k-metallic-item",
                                        onClick: function onClick() {
                                            _audioEngine.HybridAudioEngine.playUi('click', era);
                                            setDrawer('BEATS_JUKEBOX');
                                        },
                                        children: "2K BEATS"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "h2k-metallic-item accent",
                                        onClick: function onClick() {
                                            _audioEngine.HybridAudioEngine.playUi('confirm', era);
                                            onOpenCity3D();
                                        },
                                        children: "THE CITY MAP (2K26)"
                                    })
                                ]
                            })
                        ]
                    }),
                    era === '2K26_NEXTGEN' && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                                className: "h2k-2k26-topbar",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-brand-cluster",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-back-arcade-btn",
                                                onClick: function onClick() {
                                                    _audioEngine.HybridAudioEngine.pause();
                                                    onBackToArcade();
                                                },
                                                children: "◀ ARCADE"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-2k26-wordmark",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: "NBA"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                        children: "2K26"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-era-toggle-pill nextgen",
                                                onClick: handleToggleEra,
                                                children: "ERA: 2K26 ⇄ HYBRID / 2K14"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("nav", {
                                        className: "h2k-nextgen-tabs",
                                        "aria-label": "NBA 2K26 Main Navigation",
                                        children: NEXTGEN_TABS.map(function(t) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-nextgen-tab " + (t.id === 'MAIN_MENU' ? 'active' : ''),
                                                onClick: function onClick() {
                                                    return handleNavigate(t.id);
                                                },
                                                children: t.label
                                            }, t.label);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-utility-cluster",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-util-btn",
                                                onClick: function onClick() {
                                                    return setDrawer('SWAP_BUILD');
                                                },
                                                children: "Swap Build"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "h2k-currency-chip vc",
                                                children: [
                                                    "VC ",
                                                    save.currencies.vc.toLocaleString()
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "h2k-currency-chip mtp",
                                                children: [
                                                    "MTP ",
                                                    save.currencies.mtp.toLocaleString()
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "h2k-currency-chip",
                                                children: [
                                                    "S1 LV.",
                                                    save.currencies.seasonLevel
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-util-btn",
                                                onClick: function onClick() {
                                                    return setDrawer('CREW');
                                                },
                                                children: "Crew"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-util-btn",
                                                onClick: function onClick() {
                                                    return setDrawer('PROFILE_VIP');
                                                },
                                                children: "Profile"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-util-btn",
                                                onClick: function onClick() {
                                                    return openSettingsAt('GAMEPLAY');
                                                },
                                                children: "⚙"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("main", {
                                className: "h2k-2k26-stage",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-hybrid-left-col",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("section", {
                                                className: "h2k-2k26-hero-dock",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "h2k-kicker",
                                                        children: "THE CITY \xb7 SKYLINE PARK LIVE STAGE"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h1", {
                                                        children: "PROPLAY NEXT-GEN ARENA"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                        children: "All 72 dual-era rosters live! Tip off cross-era matchups, edit 576+ players, or build a custom star."
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "h2k-2k26-cta-row",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                type: "button",
                                                                className: "h2k-tipoff-cta compact",
                                                                onClick: function onClick() {
                                                                    return handleNavigate('PLAY_NOW_SETUP');
                                                                },
                                                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "h2k-tipoff-title",
                                                                    children: "PLAY NOW \xb7 72 TEAMS"
                                                                })
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                type: "button",
                                                                className: "h2k-btn-accent",
                                                                onClick: function onClick() {
                                                                    return openRosterManager(featuredHome.id);
                                                                },
                                                                children: "\uD83D\uDCCB MANAGE ROSTER"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                type: "button",
                                                                className: "h2k-btn-ghost",
                                                                onClick: function onClick() {
                                                                    return openCreateAPlayer(featuredHome.id);
                                                                },
                                                                children: "+ CREATE-A-PLAYER"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                type: "button",
                                                                className: "h2k-btn-ghost",
                                                                onClick: function onClick() {
                                                                    _audioEngine.HybridAudioEngine.playUi('confirm', era);
                                                                    onOpenCity3D();
                                                                },
                                                                children: "\uD83C\uDFD9️ ENTER THE CITY 3D"
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("section", {
                                                className: "h2k-2k26-side-cards",
                                                "aria-label": "2K26 Featured Quick Cards",
                                                children: NEXTGEN_SIDE_CARDS.map(function(card) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        type: "button",
                                                        className: "h2k-metro-tile compact",
                                                        style: {
                                                            borderLeftColor: card.accent
                                                        },
                                                        onClick: function onClick() {
                                                            return handleNavigate(card.target, undefined, card.venuePreset);
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "h2k-metro-tag",
                                                                style: {
                                                                    color: card.accent
                                                                },
                                                                children: card.tag
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                children: card.title
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                                children: card.subtitle
                                                            })
                                                        ]
                                                    }, card.id);
                                                })
                                            })
                                        ]
                                    }),
                                    renderChallengeCard()
                                ]
                            })
                        ]
                    }),
                    era === 'HYBRID_PRO' && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                                className: "h2k-2k26-topbar hybrid-pro",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-brand-cluster",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-back-arcade-btn",
                                                onClick: function onClick() {
                                                    _audioEngine.HybridAudioEngine.pause();
                                                    onBackToArcade();
                                                },
                                                children: "◀ ARCADE"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "h2k-hybrid-wordmark",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "era14",
                                                        children: "2K14"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "plus",
                                                        children: "+"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "era26",
                                                        children: "2K26"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-era-toggle-pill hybrid",
                                                onClick: handleToggleEra,
                                                children: "ERA: HYBRID PRO ⇄ 2K14 / 2K26"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("nav", {
                                        className: "h2k-nextgen-tabs",
                                        "aria-label": "Ultimate Hybrid Navigation",
                                        children: NEXTGEN_TABS.map(function(t) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-nextgen-tab " + (t.id === 'MAIN_MENU' ? 'active' : ''),
                                                onClick: function onClick() {
                                                    return handleNavigate(t.id);
                                                },
                                                children: t.label
                                            }, t.label);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-utility-cluster",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-util-btn",
                                                onClick: function onClick() {
                                                    return setDrawer('SWAP_BUILD');
                                                },
                                                children: "Swap Build"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "h2k-currency-chip vc",
                                                children: [
                                                    "VC ",
                                                    save.currencies.vc.toLocaleString()
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "h2k-currency-chip mtp",
                                                children: [
                                                    "MTP ",
                                                    save.currencies.mtp.toLocaleString()
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "h2k-currency-chip",
                                                children: [
                                                    "S1 LV.",
                                                    save.currencies.seasonLevel
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-util-btn",
                                                onClick: function onClick() {
                                                    return setDrawer('CREW');
                                                },
                                                children: "Crew"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-util-btn",
                                                onClick: function onClick() {
                                                    return setDrawer('PROFILE_VIP');
                                                },
                                                children: "VIP"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                className: "h2k-util-btn",
                                                onClick: function onClick() {
                                                    return openSettingsAt('GAMEPLAY');
                                                },
                                                children: "⚙"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-hybrid-ticker-bar",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "h2k-ticker-badge",
                                        children: "2K SPORTS HYBRID LIVE"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "h2k-ticker-track",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            children: TICKER_HEADLINES.join('   •   ')
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("main", {
                                className: "h2k-hybrid-stage",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h2k-hybrid-left-col",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("section", {
                                                className: "h2k-hybrid-hero",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "h2k-kicker",
                                                        children: "ULTIMATE CROSS-ERA EDITION \xb7 72 TEAMS LIVE"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "h2k-hero-matchup-preview compact",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_teamCatalog.TeamEmblemSVG, {
                                                                team: featuredAway,
                                                                size: 46
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                className: "h2k-hero-vs",
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                                        children: [
                                                                            featuredAway.abbr,
                                                                            " (",
                                                                            featuredAway.eraBadge,
                                                                            ") vs ",
                                                                            featuredHome.abbr,
                                                                            " (",
                                                                            featuredHome.eraBadge,
                                                                            ")"
                                                                        ]
                                                                    }),
                                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                        children: [
                                                                            featuredAway.starPlayer.name,
                                                                            " (",
                                                                            featuredAway.starPlayer.ovr,
                                                                            ") vs",
                                                                            ' ',
                                                                            featuredHome.starPlayer.name,
                                                                            " (",
                                                                            featuredHome.starPlayer.ovr,
                                                                            ")"
                                                                        ]
                                                                    })
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_teamCatalog.TeamEmblemSVG, {
                                                                team: featuredHome,
                                                                size: 46
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "h2k-2k26-cta-row",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                type: "button",
                                                                className: "h2k-tipoff-cta compact",
                                                                onClick: function onClick() {
                                                                    return handleNavigate('PLAY_NOW_SETUP');
                                                                },
                                                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "h2k-tipoff-title",
                                                                    children: "PLAY NOW \xb7 72 TEAMS"
                                                                })
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                type: "button",
                                                                className: "h2k-btn-accent",
                                                                onClick: function onClick() {
                                                                    return openRosterManager(featuredHome.id);
                                                                },
                                                                children: "\uD83D\uDCCB MANAGE ROSTER"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                type: "button",
                                                                className: "h2k-btn-ghost",
                                                                onClick: function onClick() {
                                                                    return openCreateAPlayer(featuredHome.id);
                                                                },
                                                                children: "+ CREATE-A-PLAYER"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                type: "button",
                                                                className: "h2k-btn-ghost",
                                                                onClick: function onClick() {
                                                                    _audioEngine.HybridAudioEngine.playUi('confirm', era);
                                                                    _store.UltimateHybridStore.setActiveScreen('CITY_EXPLORE');
                                                                },
                                                                children: "\uD83C\uDFD9️ THE CITY 3D"
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                type: "button",
                                                                className: "h2k-btn-ghost",
                                                                onClick: function onClick() {
                                                                    _audioEngine.HybridAudioEngine.playUi('click', era);
                                                                    onOpenClassicStudio();
                                                                },
                                                                children: "\uD83D\uDEE0️ STUDIO"
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("section", {
                                                className: "h2k-hybrid-quick-grid",
                                                children: METRO_2K14_TILES.map(function(tile) {
                                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                        type: "button",
                                                        className: "h2k-metro-tile compact",
                                                        style: {
                                                            borderLeftColor: tile.accent
                                                        },
                                                        onClick: function onClick() {
                                                            return handleNavigate(tile.target, tile.poolPreset);
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "h2k-metro-tag",
                                                                style: {
                                                                    color: tile.accent
                                                                },
                                                                children: tile.tag
                                                            }),
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                children: tile.title
                                                            })
                                                        ]
                                                    }, tile.id);
                                                })
                                            })
                                        ]
                                    }),
                                    renderChallengeCard()
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("footer", {
                        className: "h2k-bottom-bar",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-bottom-left",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "h2k-beats-pill",
                                        onClick: function onClick() {
                                            return setDrawer('BEATS_JUKEBOX');
                                        },
                                        children: [
                                            "\uD83C\uDFB5 ",
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                children: beats.currentTrack.title
                                            }),
                                            " \xb7",
                                            ' ',
                                            beats.isPlaying ? 'PLAYING' : 'PAUSED'
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "h2k-mini-pill",
                                        onClick: function onClick() {
                                            return _audioEngine.HybridAudioEngine.togglePlay();
                                        },
                                        children: beats.isPlaying ? '⏸' : '▶'
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "h2k-mini-pill",
                                        onClick: function onClick() {
                                            return _audioEngine.HybridAudioEngine.nextTrack();
                                        },
                                        children: "⏭"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-shortcut-legend",
                                "aria-label": "Keyboard and controller shortcuts",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "[F] Quick Match"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "[M] City Map"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "[Q/E] Era"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "[H] Hide HUD"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "[Esc] Back"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "h2k-bottom-right",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "h2k-mini-pill",
                                        onClick: function onClick() {
                                            return setHudHidden(true);
                                        },
                                        title: "Hide Menu HUD to view unobstructed 3D stage",
                                        children: "▾ HIDE HUD [H]"
                                    }),
                                    save.settings.visual.showFpsTelemetry && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "h2k-telemetry-badge",
                                        children: [
                                            eraLabel(era),
                                            " \xb7 ",
                                            fps,
                                            " FPS \xb7 12ms"
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
            screen === 'PLAY_NOW_SETUP' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-shell-layer",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_PlayNowSetup.PlayNowSetup, {
                    eraMode: era,
                    config: save.activeMatchConfig,
                    onBack: function onBack() {
                        return _store.UltimateHybridStore.setActiveScreen('MAIN_MENU');
                    },
                    onOpenRosterManager: openRosterManager,
                    onOpenCreateAPlayer: openCreateAPlayer,
                    onTipOff: handleTipOff
                })
            }),
            screen === 'ROSTER_MANAGER' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-shell-layer",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_RosterManager.RosterManager, {
                    eraMode: era,
                    initialTeamId: studioTeamId,
                    onBack: function onBack() {
                        return _store.UltimateHybridStore.setActiveScreen('MAIN_MENU');
                    },
                    onOpenCreateAPlayer: function onOpenCreateAPlayer(tid) {
                        return openCreateAPlayer(tid);
                    },
                    onLaunchPlayNowWithTeam: launchPlayNowForTeam,
                    onNotify: notify
                })
            }),
            screen === 'CREATE_A_PLAYER' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-shell-layer",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_CreateAPlayer.CreateAPlayer, {
                    eraMode: era,
                    initialTeamId: studioTeamId,
                    onBack: function onBack() {
                        return _store.UltimateHybridStore.setActiveScreen('MAIN_MENU');
                    },
                    onSavedOpenRoster: function onSavedOpenRoster(tid) {
                        return openRosterManager(tid);
                    },
                    onSavedLaunchPlayNow: launchPlayNowForTeam,
                    onNotify: notify
                })
            }),
            screen === 'LIVE_GAME' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_LiveCourtStage.LiveCourtStage, {
                onExitToMenu: function onExitToMenu() {
                    return _store.UltimateHybridStore.setActiveScreen('MAIN_MENU');
                },
                onReturnToCity: function onReturnToCity() {
                    return _store.UltimateHybridStore.setActiveScreen('CITY_EXPLORE');
                },
                onOpenSettings: function onOpenSettings(tab) {
                    return openSettingsAt(tab != null ? tab : 'CAMERA');
                },
                onLaunchLegacyCourt: function onLaunchLegacyCourt() {
                    _audioEngine.HybridAudioEngine.pause();
                    onLaunchCourt();
                },
                onNotify: notify
            }),
            screen === 'THE_W_HUB' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-shell-layer",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_PlayNowSetup.PlayNowSetup, {
                    eraMode: era,
                    config: save.activeMatchConfig,
                    onBack: function onBack() {
                        return _store.UltimateHybridStore.setActiveScreen('MAIN_MENU');
                    },
                    onOpenRosterManager: openRosterManager,
                    onOpenCreateAPlayer: openCreateAPlayer,
                    onTipOff: handleTipOff
                })
            }),
            (screen === 'CITY_EXPLORE' || screen === 'MYCAREER_HUB') && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-shell-layer",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_TheCityHub.TheCityHub, {
                    eraMode: era,
                    initialViewMode: "MAP",
                    onBack: function onBack() {
                        return _store.UltimateHybridStore.setActiveScreen('MAIN_MENU');
                    },
                    onOpenBuilder: function onOpenBuilder() {
                        return _store.UltimateHybridStore.setActiveScreen('MYPLAYER_BUILDER');
                    },
                    onNotify: notify
                })
            }),
            screen === 'MYPLAYER_BUILDER' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-shell-layer",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_MyPlayerBuilder.MyPlayerBuilder, {
                    eraMode: era,
                    onBack: function onBack() {
                        return _store.UltimateHybridStore.setActiveScreen('MAIN_MENU');
                    },
                    onEnterCity: function onEnterCity() {
                        return _store.UltimateHybridStore.setActiveScreen('CITY_EXPLORE');
                    },
                    onNotify: notify
                })
            }),
            screen === 'PATH_TO_GREATNESS' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-shell-layer",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_PathToGreatness.PathToGreatness, {
                    eraMode: era,
                    onBack: function onBack() {
                        return _store.UltimateHybridStore.setActiveScreen('MAIN_MENU');
                    },
                    onNotify: notify
                })
            }),
            screen === 'MYTEAM_HUB' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-shell-layer",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_MyTeamHub.MyTeamHub, {
                    eraMode: era,
                    onBack: function onBack() {
                        return _store.UltimateHybridStore.setActiveScreen('MAIN_MENU');
                    },
                    onNotify: notify
                })
            }),
            screen === 'MYNBA_HUB' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-shell-layer",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_MyNbaAssociation.MyNbaAssociation, {
                    eraMode: era,
                    onBack: function onBack() {
                        return _store.UltimateHybridStore.setActiveScreen('MAIN_MENU');
                    },
                    onNotify: notify
                })
            }),
            screen === 'BLACKTOP_SETUP' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-shell-layer",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_BlacktopSetup.BlacktopSetup, {
                    eraMode: era,
                    onBack: function onBack() {
                        return _store.UltimateHybridStore.setActiveScreen('MAIN_MENU');
                    },
                    onNotify: notify
                })
            }),
            screen === 'LEARN_2K' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-shell-layer",
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_TrainingCamp.TrainingCamp, {
                    eraMode: era,
                    onBack: function onBack() {
                        return _store.UltimateHybridStore.setActiveScreen('MAIN_MENU');
                    },
                    onNotify: notify
                })
            }),
            (drawer === 'SETTINGS' || drawer === 'PROFILE_VIP') && /*#__PURE__*/ (0, _jsxruntime.jsx)(_SettingsModal.SettingsModal, {
                save: save,
                beats: beats,
                initialTab: drawer === 'PROFILE_VIP' ? 'DATA' : settingsInitTab,
                inMatch: false,
                onClose: function onClose() {
                    return setDrawer(null);
                },
                onOpenCustomHudEditor: function onOpenCustomHudEditor() {
                    setDrawer(null);
                    setHudEditorOpen(true);
                },
                onNotify: notify
            }),
            hudEditorOpen && /*#__PURE__*/ (0, _jsxruntime.jsx)(_CustomHudEditor.CustomHudEditor, {
                uiEraMode: era,
                initialLayout: save.settings.controller.customHudLayout,
                liveCourtBackdrop: true,
                onSaveAndExit: function onSaveAndExit(layout) {
                    _store.UltimateHybridStore.updateCustomHudLayout(layout);
                    setHudEditorOpen(false);
                    notify('Custom Touch HUD layout saved!');
                },
                onCancel: function onCancel() {
                    return setHudEditorOpen(false);
                }
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_HybridModals.HybridModals, {
                save: save,
                drawer: drawer === 'SETTINGS' || drawer === 'PROFILE_VIP' ? null : drawer,
                beats: beats,
                initialSettingsTab: settingsInitTab,
                onClose: function onClose() {
                    return setDrawer(null);
                },
                onNotify: notify,
                onOpenCity3D: onOpenCity3D,
                onOpenClassicStudio: onOpenClassicStudio
            })
        ]
    });
};

});
// === MODULE: src/games/hoops-2k26/hybrid/MenuBackground3D ===
ArcadeMod.define("src/games/hoops-2k26/hybrid/MenuBackground3D", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MenuBackground3D", {
    enumerable: true,
    get: function() {
        return MenuBackground3D;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _RoomEnvironment = require("three/addons/environments/RoomEnvironment.js");
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
// Reusable module-scope math helpers (zero GC inside animation loop)
var _camTarget = new _three.Vector3();
var _camDesired = new _three.Vector3();
var _dummyObj = new _three.Object3D();
var _tmpColor = new _three.Color();
function detectSoftwareWebGL() {
    try {
        var _gl_getExtension;
        var canvas = document.createElement('canvas');
        var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) return true;
        var ext = gl.getExtension('WEBGL_debug_renderer_info');
        var param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        var gpu = String(gl.getParameter(param) || '');
        (_gl_getExtension = gl.getExtension('WEBGL_lose_context')) == null ? void 0 : _gl_getExtension.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch (unused) {
        return true;
    }
}
function createHardwoodTexture(maxAniso, is2K14) {
    var c = document.createElement('canvas');
    c.width = 1024;
    c.height = 1024;
    var ctx = c.getContext('2d');
    // Base wood planks
    ctx.fillStyle = is2K14 ? '#6d4423' : '#334155';
    ctx.fillRect(0, 0, 1024, 1024);
    if (is2K14) {
        for(var row = 0; row < 32; row++){
            var y = row * 32;
            for(var col = 0; col < 8; col++){
                var x = col * 128 + row % 2 * 44 - 44;
                var shade = (row * 17 + col * 31) % 24 - 12;
                ctx.fillStyle = "rgb(" + (128 + shade) + ", " + (82 + Math.round(shade * 0.7)) + ", " + (42 + Math.round(shade * 0.4)) + ")";
                ctx.fillRect(x, y, 126, 30);
                ctx.strokeStyle = 'rgba(28, 14, 5, 0.28)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, 126, 30);
            }
        }
        // Glossy 2K14 arena center circle & crimson/gold paint lines
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 8;
        ctx.strokeRect(48, 48, 928, 928);
        ctx.beginPath();
        ctx.arc(512, 512, 165, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(152, 0, 46, 0.72)';
        ctx.fill();
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#fbbf24';
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 108px Impact, Arial Black, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('2K14', 512, 515);
        // 3PT arcs
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(512, 110, 310, 0.14 * Math.PI, 0.86 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(512, 914, 310, 1.14 * Math.PI, 1.86 * Math.PI);
        ctx.stroke();
    } else {
        // 2K26 Skyline Park painted outdoor concrete court
        var grad = ctx.createLinearGradient(0, 0, 1024, 1024);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(0.5, '#0f172a');
        grad.addColorStop(1, '#1e293b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 1024);
        // Painted teal/amber park court apron & key
        ctx.fillStyle = '#0f3d56';
        ctx.fillRect(70, 70, 884, 884);
        ctx.fillStyle = '#9f1239';
        ctx.fillRect(360, 70, 304, 290);
        ctx.fillRect(360, 664, 304, 290);
        // Subtle concrete speckle
        ctx.fillStyle = 'rgba(255,255,255,0.045)';
        for(var i = 0; i < 900; i++){
            var px = i * 197 % 1024;
            var py = i * 353 % 1024;
            ctx.fillRect(px, py, 3, 3);
        }
        // Crisp painted court lines
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 8;
        ctx.strokeRect(70, 70, 884, 884);
        ctx.beginPath();
        ctx.moveTo(70, 512);
        ctx.lineTo(954, 512);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(512, 512, 150, 0, Math.PI * 2);
        ctx.fillStyle = '#e11d48';
        ctx.fill();
        ctx.lineWidth = 9;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 92px Impact, Arial Black, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('2K26', 512, 496);
        ctx.font = '800 32px system-ui, sans-serif';
        ctx.fillStyle = '#fde68a';
        ctx.fillText('SKYLINE PARK', 512, 558);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(512, 120, 300, 0.16 * Math.PI, 0.84 * Math.PI);
        ctx.stroke();
    }
    var tex = new _three.CanvasTexture(c);
    tex.colorSpace = _three.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    return tex;
}
function createJerseyTexture(jerseyNumber, primaryHex, trimHex, maxAniso) {
    var c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    var ctx = c.getContext('2d');
    ctx.fillStyle = primaryHex;
    ctx.fillRect(0, 0, 512, 512);
    // Side jersey trim stripes
    ctx.fillStyle = trimHex;
    ctx.fillRect(0, 0, 34, 512);
    ctx.fillRect(478, 0, 34, 512);
    ctx.fillRect(0, 0, 512, 24);
    // Chest numeral
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = trimHex;
    ctx.lineWidth = 10;
    ctx.font = '900 215px Impact, Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var label = String(jerseyNumber);
    ctx.strokeText(label, 256, 275);
    ctx.fillText(label, 256, 275);
    var tex = new _three.CanvasTexture(c);
    tex.colorSpace = _three.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    return tex;
}
function createContactShadowTexture() {
    var c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    var ctx = c.getContext('2d');
    var grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0,0,0,0.68)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0.28)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    var tex = new _three.CanvasTexture(c);
    tex.colorSpace = _three.SRGBColorSpace;
    return tex;
}
/**
 * Composite 12-part articulated 3D basketball superstar pivoted at bottom-center (y = 0).
 */ function buildArticulatedStar(jerseyNum, primaryHex, trimHex, skinHex, hasHeadband, maxAniso) {
    var root = new _three.Group();
    var skinMat = new _three.MeshStandardMaterial({
        color: skinHex,
        roughness: 0.62,
        metalness: 0.04
    });
    var jerseyTex = createJerseyTexture(jerseyNum, primaryHex, trimHex, maxAniso);
    var jerseyMat = new _three.MeshStandardMaterial({
        map: jerseyTex,
        roughness: 0.72,
        metalness: 0.08
    });
    var shortsMat = new _three.MeshStandardMaterial({
        color: primaryHex,
        roughness: 0.76,
        metalness: 0.05
    });
    var trimMat = new _three.MeshStandardMaterial({
        color: trimHex,
        roughness: 0.35,
        metalness: 0.35
    });
    var shoeMat = new _three.MeshStandardMaterial({
        color: '#111827',
        roughness: 0.35,
        metalness: 0.25
    });
    var soleMat = new _three.MeshStandardMaterial({
        color: trimHex,
        roughness: 0.5,
        metalness: 0.15
    });
    // Legs (pivoted at hip y = 1.02)
    var makeLeg = function makeLeg(xOff) {
        var legGroup = new _three.Group();
        legGroup.position.set(xOff, 1.02, 0);
        var thigh = new _three.Mesh(new _three.CylinderGeometry(0.11, 0.09, 0.44, 14), shortsMat);
        thigh.position.y = -0.22;
        thigh.castShadow = true;
        legGroup.add(thigh);
        var calf = new _three.Mesh(new _three.CylinderGeometry(0.082, 0.062, 0.46, 14), skinMat);
        calf.position.y = -0.66;
        calf.castShadow = true;
        legGroup.add(calf);
        var sock = new _three.Mesh(new _three.CylinderGeometry(0.068, 0.064, 0.18, 12), trimMat);
        sock.position.y = -0.84;
        legGroup.add(sock);
        var shoe = new _three.Mesh(new _three.BoxGeometry(0.15, 0.11, 0.32), shoeMat);
        shoe.position.set(0, -0.96, 0.06);
        shoe.castShadow = true;
        legGroup.add(shoe);
        var sole = new _three.Mesh(new _three.BoxGeometry(0.16, 0.035, 0.33), soleMat);
        sole.position.set(0, -1.0, 0.06);
        legGroup.add(sole);
        return legGroup;
    };
    var leftLeg = makeLeg(-0.14);
    var rightLeg = makeLeg(0.14);
    root.add(leftLeg, rightLeg);
    // Pelvis / Shorts waist
    var pelvis = new _three.Mesh(new _three.BoxGeometry(0.42, 0.22, 0.26), shortsMat);
    pelvis.position.y = 1.06;
    pelvis.castShadow = true;
    root.add(pelvis);
    // Torso group
    var torso = new _three.Group();
    torso.position.y = 1.18;
    root.add(torso);
    var chest = new _three.Mesh(new _three.BoxGeometry(0.48, 0.58, 0.27), jerseyMat);
    chest.position.y = 0.29;
    chest.castShadow = true;
    torso.add(chest);
    var shoulderTrim = new _three.Mesh(new _three.BoxGeometry(0.52, 0.08, 0.28), trimMat);
    shoulderTrim.position.y = 0.56;
    torso.add(shoulderTrim);
    // Head + Hair + Optional Headband
    var head = new _three.Group();
    head.position.y = 0.68;
    torso.add(head);
    var neck = new _three.Mesh(new _three.CylinderGeometry(0.075, 0.085, 0.12, 12), skinMat);
    neck.position.y = 0.02;
    head.add(neck);
    var skull = new _three.Mesh(new _three.SphereGeometry(0.155, 18, 16), skinMat);
    skull.position.y = 0.18;
    skull.castShadow = true;
    head.add(skull);
    var hairMat = new _three.MeshStandardMaterial({
        color: '#141414',
        roughness: 0.88,
        metalness: 0.02
    });
    var hair = new _three.Mesh(new _three.SphereGeometry(0.158, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), hairMat);
    hair.position.y = 0.195;
    head.add(hair);
    if (hasHeadband) {
        var band = new _three.Mesh(new _three.CylinderGeometry(0.16, 0.16, 0.055, 20, 1, true), trimMat);
        band.position.y = 0.22;
        head.add(band);
    }
    // Arms
    var makeArm = function makeArm(xOff, hasSleeve) {
        var arm = new _three.Group();
        arm.position.set(xOff, 0.52, 0);
        var upper = new _three.Mesh(new _three.CylinderGeometry(0.072, 0.062, 0.34, 12), skinMat);
        upper.position.y = -0.17;
        upper.castShadow = true;
        arm.add(upper);
        var forearmMat = hasSleeve ? trimMat : skinMat;
        var forearm = new _three.Mesh(new _three.CylinderGeometry(0.06, 0.05, 0.34, 12), forearmMat);
        forearm.position.y = -0.49;
        forearm.castShadow = true;
        arm.add(forearm);
        var hand = new _three.Mesh(new _three.SphereGeometry(0.058, 12, 10), skinMat);
        hand.position.y = -0.68;
        arm.add(hand);
        return arm;
    };
    var leftArm = makeArm(-0.31, false);
    var rightArm = makeArm(0.31, true);
    torso.add(leftArm, rightArm);
    // Basketball with dark seam rings
    var ballMat = new _three.MeshStandardMaterial({
        color: '#d95b16',
        roughness: 0.58,
        metalness: 0.06
    });
    var ball = new _three.Mesh(new _three.SphereGeometry(0.145, 20, 16), ballMat);
    ball.castShadow = true;
    var seamMat = new _three.MeshBasicMaterial({
        color: '#1a120c'
    });
    var seam1 = new _three.Mesh(new _three.TorusGeometry(0.146, 0.006, 6, 28), seamMat);
    var seam2 = new _three.Mesh(new _three.TorusGeometry(0.146, 0.006, 6, 28), seamMat);
    seam2.rotation.y = Math.PI / 2;
    ball.add(seam1, seam2);
    ball.position.set(0.44, 0.82, 0.32);
    root.add(ball);
    // Soft contact shadow under player
    var shadowPlane = new _three.Mesh(new _three.PlaneGeometry(1.5, 1.5), new _three.MeshBasicMaterial({
        map: createContactShadowTexture(),
        transparent: true,
        depthWrite: false,
        opacity: 0.65
    }));
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.025;
    root.add(shadowPlane);
    return {
        root: root,
        torso: torso,
        head: head,
        leftArm: leftArm,
        rightArm: rightArm,
        leftLeg: leftLeg,
        rightLeg: rightLeg,
        ball: ball
    };
}
function buildHoopStanchion(is2K14, isSoftwareGl) {
    var hoop = new _three.Group();
    var postMat = new _three.MeshStandardMaterial({
        color: is2K14 ? '#1e293b' : '#0f172a',
        roughness: 0.35,
        metalness: 0.72
    });
    var padMat = new _three.MeshStandardMaterial({
        color: is2K14 ? '#98002e' : '#e11d48',
        roughness: 0.65,
        metalness: 0.1
    });
    var base = new _three.Mesh(new _three.BoxGeometry(0.75, 1.35, 1.1), padMat);
    base.position.set(0, 0.675, -0.8);
    base.castShadow = true;
    hoop.add(base);
    var mast = new _three.Mesh(new _three.BoxGeometry(0.28, 3.6, 0.28), postMat);
    mast.position.set(0, 2.0, -0.55);
    hoop.add(mast);
    var boom = new _three.Mesh(new _three.BoxGeometry(0.24, 0.24, 1.45), postMat);
    boom.position.set(0, 3.55, 0.05);
    hoop.add(boom);
    // Glass Backboard
    var boardMat = new _three.MeshPhysicalMaterial({
        color: '#e2e8f0',
        roughness: 0.08,
        metalness: 0.05,
        transparent: true,
        opacity: isSoftwareGl ? 0.42 : 0.36,
        clearcoat: 1.0,
        depthWrite: false
    });
    var board = new _three.Mesh(new _three.BoxGeometry(1.9, 1.12, 0.06), boardMat);
    board.position.set(0, 3.45, 0.75);
    board.renderOrder = 3;
    hoop.add(board);
    // Backboard neon frame
    var frameMat = new _three.MeshStandardMaterial({
        color: is2K14 ? '#f59e0b' : '#e11d48',
        emissive: is2K14 ? '#b45309' : '#be123c',
        emissiveIntensity: 0.55,
        roughness: 0.25,
        metalness: 0.6
    });
    var topBar = new _three.Mesh(new _three.BoxGeometry(1.96, 0.06, 0.08), frameMat);
    topBar.position.set(0, 4.02, 0.75);
    var botBar = new _three.Mesh(new _three.BoxGeometry(1.96, 0.06, 0.08), frameMat);
    botBar.position.set(0, 2.88, 0.75);
    hoop.add(topBar, botBar);
    // Rim
    var rimMat = new _three.MeshStandardMaterial({
        color: '#f97316',
        roughness: 0.3,
        metalness: 0.7
    });
    var rim = new _three.Mesh(new _three.TorusGeometry(0.26, 0.025, 10, 28), rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 3.05, 1.06);
    hoop.add(rim);
    // Net cylinder (open ended wireframe-like translucent mesh)
    var netMat = new _three.MeshStandardMaterial({
        color: is2K14 ? '#f8fafc' : '#cbd5e1',
        roughness: 0.55,
        metalness: is2K14 ? 0.05 : 0.75,
        wireframe: true
    });
    var net = new _three.Mesh(new _three.CylinderGeometry(0.24, 0.15, 0.45, 12, 4, true), netMat);
    net.position.set(0, 2.82, 1.06);
    hoop.add(net);
    return hoop;
}
function buildPalmTree(x, z, scale) {
    var g = new _three.Group();
    g.position.set(x, 0, z);
    g.scale.setScalar(scale);
    var trunkMat = new _three.MeshStandardMaterial({
        color: '#6b4f35',
        roughness: 0.9,
        metalness: 0.02
    });
    for(var i = 0; i < 6; i++){
        var seg = new _three.Mesh(new _three.CylinderGeometry(0.18 - i * 0.015, 0.21 - i * 0.015, 0.92, 8), trunkMat);
        seg.position.set(Math.sin(i * 0.16) * 0.25, 0.45 + i * 0.85, 0);
        seg.rotation.z = -0.06 * i;
        g.add(seg);
    }
    var frondMat = new _three.MeshStandardMaterial({
        color: '#15803d',
        roughness: 0.75,
        metalness: 0.04
    });
    for(var i1 = 0; i1 < 7; i1++){
        var angle = i1 / 7 * Math.PI * 2;
        var frond = new _three.Mesh(new _three.ConeGeometry(0.42, 2.5, 5), frondMat);
        frond.position.set(0.32 + Math.cos(angle) * 0.95, 5.45, Math.sin(angle) * 0.95);
        frond.rotation.z = -Math.PI * 0.36;
        frond.rotation.y = -angle;
        g.add(frond);
    }
    return g;
}
var MenuBackground3D = function MenuBackground3D(param) {
    var eraMode = param.eraMode, starJerseyNumber = param.starJerseyNumber, starPrimaryHex = param.starPrimaryHex, starTrimHex = param.starTrimHex, onFpsSample = param.onFpsSample;
    var mountRef = (0, _react.useRef)(null);
    var eraRef = (0, _react.useRef)(eraMode);
    var fpsCbRef = (0, _react.useRef)(onFpsSample);
    var _useState = (0, _react.useState)(false), webglFallback = _useState[0], setWebglFallback = _useState[1];
    eraRef.current = eraMode;
    fpsCbRef.current = onFpsSample;
    var is2K14Stage = eraMode === '2K14_CLASSIC';
    (0, _react.useEffect)(function() {
        var host = mountRef.current;
        if (!host) return;
        var isSoftwareGl = detectSoftwareWebGL();
        var renderer;
        try {
            renderer = new _three.WebGLRenderer({
                antialias: !isSoftwareGl,
                powerPreference: 'high-performance'
            });
        } catch (unused) {
            setWebglFallback(true);
            return;
        }
        setWebglFallback(false);
        renderer.outputColorSpace = _three.SRGBColorSpace;
        renderer.toneMapping = _three.ACESFilmicToneMapping;
        renderer.toneMappingExposure = is2K14Stage ? 1.12 : 1.18;
        renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
        renderer.shadowMap.enabled = !isSoftwareGl;
        renderer.shadowMap.type = _three.PCFSoftShadowMap;
        renderer.setSize(host.clientWidth || window.innerWidth, host.clientHeight || window.innerHeight);
        host.innerHTML = '';
        host.appendChild(renderer.domElement);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';
        var maxAniso = renderer.capabilities.getMaxAnisotropy();
        // Scene + Studio PBR Environment
        var scene = new _three.Scene();
        var pmrem = new _three.PMREMGenerator(renderer);
        var envTex = pmrem.fromScene(new _RoomEnvironment.RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;
        pmrem.dispose();
        var camera = new _three.PerspectiveCamera(44, (host.clientWidth || window.innerWidth) / Math.max(1, host.clientHeight || window.innerHeight), 0.1, 220);
        // Stage background + horizon fog
        if (is2K14Stage) {
            scene.background = new _three.Color('#07090f');
            scene.fog = new _three.FogExp2('#07090f', 0.022);
        } else {
            scene.background = new _three.Color('#1a1423');
            scene.fog = new _three.FogExp2('#291c28', 0.015);
        }
        // 3-Point Warm/Cool Lighting Rig
        var hemi = new _three.HemisphereLight(is2K14Stage ? 0x94a3b8 : 0xfde68a, is2K14Stage ? 0x1e1b24 : 0x1e293b, is2K14Stage ? 0.65 : 0.95);
        scene.add(hemi);
        var keyLight = new _three.DirectionalLight(is2K14Stage ? 0xfff1d6 : 0xffb86c, is2K14Stage ? 2.1 : 2.35);
        keyLight.position.set(is2K14Stage ? 5 : 14, is2K14Stage ? 13 : 16, 8);
        keyLight.castShadow = !isSoftwareGl;
        keyLight.shadow.mapSize.set(1024, 1024);
        keyLight.shadow.camera.left = -10;
        keyLight.shadow.camera.right = 10;
        keyLight.shadow.camera.top = 10;
        keyLight.shadow.camera.bottom = -10;
        keyLight.shadow.bias = -0.0005;
        keyLight.shadow.normalBias = 0.02;
        scene.add(keyLight);
        var rimLight = new _three.DirectionalLight(is2K14Stage ? 0xe11d48 : 0x38bdf8, is2K14Stage ? 1.45 : 1.1);
        rimLight.position.set(-9, 7, -8);
        scene.add(rimLight);
        // Court Floor (Hardwood 2K14 vs Painted Skyline Park 2K26)
        var courtTex = createHardwoodTexture(maxAniso, is2K14Stage);
        var floorMat = new _three.MeshStandardMaterial({
            map: courtTex,
            roughness: is2K14Stage ? 0.22 : 0.68,
            metalness: is2K14Stage ? 0.14 : 0.05
        });
        var floor = new _three.Mesh(new _three.PlaneGeometry(24, 24), floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);
        // Extended surrounding ground so outdoor scene never floats in an empty void
        var apronMat = new _three.MeshStandardMaterial({
            color: is2K14Stage ? '#0a0d14' : '#182230',
            roughness: 0.85,
            metalness: 0.08
        });
        var apron = new _three.Mesh(new _three.PlaneGeometry(140, 140), apronMat);
        apron.rotation.x = -Math.PI / 2;
        apron.position.y = -0.04;
        scene.add(apron);
        // Backlit Hoop
        var hoop = buildHoopStanchion(is2K14Stage, isSoftwareGl);
        hoop.position.set(0, 0, -7.8);
        scene.add(hoop);
        // Articulated Star Player (#6 Heat Crimson/Gold for 2K14, #2 / MyPLAYER Obsidian/Crimson for 2K26)
        var resolvedJersey = starJerseyNumber != null ? starJerseyNumber : is2K14Stage ? 6 : 2;
        var resolvedPrimary = starPrimaryHex != null ? starPrimaryHex : is2K14Stage ? '#98002e' : '#0f172a';
        var resolvedTrim = starTrimHex != null ? starTrimHex : is2K14Stage ? '#f9a01b' : '#e11d48';
        var starRig = buildArticulatedStar(resolvedJersey, resolvedPrimary, resolvedTrim, is2K14Stage ? '#6c4128' : '#8a583b', is2K14Stage, maxAniso);
        starRig.root.position.set(is2K14Stage ? 0.2 : 0.6, 0, 0.2);
        scene.add(starRig.root);
        // Scene-specific architectural props
        var beamMeshes = [];
        var diamondParticles = null;
        var particleSeeds = [];
        var heliGroup = null;
        var heliRotor = null;
        var heliBeaconMat = null;
        if (is2K14Stage) {
            // 2K14 Stadium Bowl Silhouettes (3 concentric stepped tiers)
            var tierMat = new _three.MeshStandardMaterial({
                color: '#111622',
                roughness: 0.82,
                metalness: 0.12
            });
            for(var t = 0; t < 3; t++){
                var ring = new _three.Mesh(new _three.CylinderGeometry(16 + t * 4.5, 14.5 + t * 4.5, 2.4, 32, 1, true), tierMat);
                ring.position.y = 1.6 + t * 2.5;
                ring.material.side = _three.BackSide;
                scene.add(ring);
            }
            // Animated radial crimson/gold overhead spotlight beams
            var beamColors = [
                0xe11d48,
                0xf59e0b,
                0xbe123c,
                0xfbbf24
            ];
            for(var i = 0; i < 4; i++){
                var coneMat = new _three.MeshBasicMaterial({
                    color: beamColors[i],
                    transparent: true,
                    opacity: 0.09,
                    depthWrite: false,
                    side: _three.DoubleSide
                });
                var cone = new _three.Mesh(new _three.ConeGeometry(2.6, 13, 18, 1, true), coneMat);
                cone.position.set((i - 1.5) * 3.8, 6.6, -2.5 + i % 2 * 2.2);
                cone.rotation.z = (i - 1.5) * 0.14;
                scene.add(cone);
                beamMeshes.push(cone);
            }
            // Floating translucent diamond particles (InstancedMesh)
            var count = 48;
            var dGeo = new _three.OctahedronGeometry(0.14, 0);
            var dMat = new _three.MeshStandardMaterial({
                color: '#fbbf24',
                emissive: '#e11d48',
                emissiveIntensity: 0.45,
                transparent: true,
                opacity: 0.55,
                roughness: 0.2,
                metalness: 0.8
            });
            diamondParticles = new _three.InstancedMesh(dGeo, dMat, count);
            diamondParticles.frustumCulled = false;
            for(var i1 = 0; i1 < count; i1++){
                var angle = i1 / count * Math.PI * 2;
                var rad = 3.2 + i1 % 7 * 1.4;
                var seed = {
                    x: Math.cos(angle) * rad,
                    y: 0.8 + i1 % 6 * 1.15,
                    z: Math.sin(angle) * rad - 1.5,
                    speed: 0.35 + i1 % 5 * 0.14,
                    phase: i1 * 0.7
                };
                particleSeeds.push(seed);
                _dummyObj.position.set(seed.x, seed.y, seed.z);
                _dummyObj.scale.setScalar(0.75 + i1 % 4 * 0.22);
                _dummyObj.updateMatrix();
                diamondParticles.setMatrixAt(i1, _dummyObj.matrix);
                _tmpColor.set(i1 % 2 === 0 ? '#f59e0b' : '#f43f5e');
                diamondParticles.setColorAt(i1, _tmpColor);
            }
            diamondParticles.instanceMatrix.needsUpdate = true;
            if (diamondParticles.instanceColor) diamondParticles.instanceColor.needsUpdate = true;
            diamondParticles.computeBoundingSphere();
            scene.add(diamondParticles);
        } else {
            // 2K26 Golden-Hour Sun Disc + Skyline Park Towers + Palm Trees + Neon Sign
            var sunMat = new _three.MeshBasicMaterial({
                color: '#fb923c'
            });
            var sun = new _three.Mesh(new _three.SphereGeometry(4.2, 20, 16), sunMat);
            sun.position.set(18, 17, -58);
            scene.add(sun);
            // Stylized City Skyline Buildings (InstancedMesh)
            var bCount = 28;
            var bGeo = new _three.BoxGeometry(1, 1, 1);
            var bMat = new _three.MeshStandardMaterial({
                color: '#1e293b',
                roughness: 0.55,
                metalness: 0.35
            });
            var buildings = new _three.InstancedMesh(bGeo, bMat, bCount);
            for(var i2 = 0; i2 < bCount; i2++){
                var angle1 = i2 / bCount * Math.PI * 1.65 - Math.PI * 0.82;
                var dist = 24 + i2 % 4 * 5.5;
                var h = 8 + i2 * 7 % 18;
                var w = 3.2 + i2 % 3 * 1.3;
                _dummyObj.position.set(Math.sin(angle1) * dist, h / 2, -Math.cos(angle1) * dist - 4);
                _dummyObj.scale.set(w, h, w);
                _dummyObj.rotation.set(0, angle1 * 0.2, 0);
                _dummyObj.updateMatrix();
                buildings.setMatrixAt(i2, _dummyObj.matrix);
                _tmpColor.set(i2 % 3 === 0 ? '#1e293b' : i2 % 3 === 1 ? '#28203c' : '#17253a');
                buildings.setColorAt(i2, _tmpColor);
            }
            buildings.instanceMatrix.needsUpdate = true;
            if (buildings.instanceColor) buildings.instanceColor.needsUpdate = true;
            buildings.computeBoundingSphere();
            scene.add(buildings);
            // Neon Rooftop Park Signboard
            var signPostMat = new _three.MeshStandardMaterial({
                color: '#0f172a',
                roughness: 0.4,
                metalness: 0.8
            });
            var signGlowMat = new _three.MeshStandardMaterial({
                color: '#e11d48',
                emissive: '#e11d48',
                emissiveIntensity: 1.1,
                roughness: 0.2
            });
            var signFrame = new _three.Mesh(new _three.BoxGeometry(8.2, 1.35, 0.25), signPostMat);
            signFrame.position.set(0, 5.8, -11.5);
            var signBar = new _three.Mesh(new _three.BoxGeometry(7.7, 0.22, 0.32), signGlowMat);
            signBar.position.set(0, 6.38, -11.45);
            scene.add(signFrame, signBar);
            // Chain-link park fence posts along court perimeter
            var fenceMat = new _three.MeshStandardMaterial({
                color: '#64748b',
                roughness: 0.45,
                metalness: 0.7,
                wireframe: true,
                transparent: true,
                opacity: 0.45
            });
            var backFence = new _three.Mesh(new _three.PlaneGeometry(24, 3.6, 20, 6), fenceMat);
            backFence.position.set(0, 1.8, -11.8);
            scene.add(backFence);
            // Palm Trees framing Skyline Park
            scene.add(buildPalmTree(-10.5, -8.5, 1.15), buildPalmTree(10.8, -8.2, 1.05), buildPalmTree(-12.2, 2.5, 0.95), buildPalmTree(12.5, 3.0, 1.1));
            // Slowly gliding distant City Helicopter / Skyline Aircraft
            heliGroup = new _three.Group();
            var heliBodyMat = new _three.MeshStandardMaterial({
                color: '#e2e8f0',
                roughness: 0.32,
                metalness: 0.65
            });
            var heliGlassMat = new _three.MeshStandardMaterial({
                color: '#0f172a',
                roughness: 0.15,
                metalness: 0.85
            });
            var cabin = new _three.Mesh(new _three.BoxGeometry(1.75, 0.72, 0.82), heliBodyMat);
            var canopy = new _three.Mesh(new _three.BoxGeometry(0.7, 0.45, 0.76), heliGlassMat);
            canopy.position.set(0.65, 0.06, 0);
            var tailBoom = new _three.Mesh(new _three.BoxGeometry(1.85, 0.22, 0.22), heliBodyMat);
            tailBoom.position.set(-1.6, 0.14, 0);
            var tailFin = new _three.Mesh(new _three.BoxGeometry(0.32, 0.68, 0.12), heliBodyMat);
            tailFin.position.set(-2.45, 0.32, 0);
            heliRotor = new _three.Mesh(new _three.BoxGeometry(3.4, 0.06, 0.22), new _three.MeshBasicMaterial({
                color: '#cbd5e1'
            }));
            heliRotor.position.set(0, 0.54, 0);
            heliBeaconMat = new _three.MeshBasicMaterial({
                color: '#f43f5e'
            });
            var beacon = new _three.Mesh(new _three.SphereGeometry(0.14, 8, 8), heliBeaconMat);
            beacon.position.set(0, -0.42, 0);
            heliGroup.add(cabin, canopy, tailBoom, tailFin, heliRotor, beacon);
            heliGroup.position.set(-22, 16.5, -34);
            heliGroup.scale.setScalar(0.95);
            scene.add(heliGroup);
        }
        camera.position.set(is2K14Stage ? 4.8 : 7.5, is2K14Stage ? 2.5 : 4.2, is2K14Stage ? 6.8 : 9.4);
        camera.lookAt(0, 1.5, -1);
        if (!isSoftwareGl) {
            renderer.compile(scene, camera);
        }
        // Handle context loss safely
        var onContextLost = function onContextLost(e) {
            e.preventDefault();
            setWebglFallback(true);
        };
        renderer.domElement.addEventListener('webglcontextlost', onContextLost);
        var onResize = function onResize() {
            if (!host) return;
            var w = host.clientWidth || window.innerWidth;
            var h = Math.max(1, host.clientHeight || window.innerHeight);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);
        // Animation loop (rAF on GPU, afterDraw pacing on software WebGL)
        var disposed = false;
        var frameId = 0;
        var lastTime = performance.now();
        var elapsed = 0;
        var fpsFrames = 0;
        var fpsAccum = 0;
        function afterDraw(cb) {
            var gl = renderer.getContext();
            var sync = gl && typeof gl.fenceSync === 'function' ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
            if (!sync) {
                frameId = window.setTimeout(cb, 80);
                return;
            }
            gl.flush();
            var poll = function poll1() {
                if (disposed) {
                    gl.deleteSync(sync);
                    return;
                }
                var status = gl.getSyncParameter(sync, gl.SYNC_STATUS);
                if (status === gl.UNSIGNALED) {
                    frameId = window.setTimeout(poll, 5);
                } else {
                    gl.deleteSync(sync);
                    frameId = window.setTimeout(cb, 80);
                }
            };
            frameId = window.setTimeout(poll, 5);
        }
        var tick = function tick1() {
            if (disposed) return;
            var now = performance.now();
            var dt = Math.min(0.08, Math.max(0.001, (now - lastTime) / 1000));
            lastTime = now;
            elapsed += dt;
            fpsFrames++;
            fpsAccum += dt;
            if (fpsAccum >= 0.65) {
                var sampled = Math.round(fpsFrames / fpsAccum);
                fpsCbRef.current == null ? void 0 : fpsCbRef.current.call(fpsCbRef, Math.min(120, Math.max(12, sampled)));
                fpsFrames = 0;
                fpsAccum = 0;
            }
            // Animate Articulated Star warm-up dribble & rhythmic bounce
            var dribbleCycle = Math.abs(Math.sin(elapsed * 4.4));
            starRig.ball.position.y = 0.15 + dribbleCycle * 0.88;
            starRig.ball.position.x = 0.38 + Math.sin(elapsed * 2.2) * 0.14;
            starRig.ball.rotation.x += dt * 4.8;
            starRig.ball.rotation.z += dt * 2.1;
            starRig.torso.position.y = 1.18 + Math.sin(elapsed * 4.4) * 0.045;
            starRig.torso.rotation.y = Math.sin(elapsed * 1.1) * 0.18;
            starRig.rightArm.rotation.x = -0.35 - dribbleCycle * 0.42;
            starRig.leftArm.rotation.x = -0.2 + Math.sin(elapsed * 2.2) * 0.16;
            starRig.leftLeg.rotation.x = Math.sin(elapsed * 2.2) * 0.09;
            starRig.rightLeg.rotation.x = -Math.sin(elapsed * 2.2) * 0.09;
            starRig.root.rotation.y = Math.sin(elapsed * 0.45) * 0.35;
            // Animate 2K14 beams & diamond particles
            if (is2K14Stage) {
                beamMeshes.forEach(function(cone, idx) {
                    cone.rotation.z = Math.sin(elapsed * 0.55 + idx * 1.3) * 0.24;
                });
                if (diamondParticles) {
                    for(var i = 0; i < particleSeeds.length; i++){
                        var p = particleSeeds[i];
                        var yBob = p.y + Math.sin(elapsed * p.speed + p.phase) * 0.55;
                        _dummyObj.position.set(p.x, yBob, p.z);
                        _dummyObj.rotation.set(elapsed * p.speed, elapsed * 0.7, 0);
                        _dummyObj.scale.setScalar(0.85);
                        _dummyObj.updateMatrix();
                        diamondParticles.setMatrixAt(i, _dummyObj.matrix);
                    }
                    diamondParticles.instanceMatrix.needsUpdate = true;
                }
                // Slow broadcast orbit around center court
                var orbit = elapsed * 0.18;
                _camDesired.set(Math.sin(orbit) * 6.2, 2.35 + Math.sin(elapsed * 0.35) * 0.35, Math.cos(orbit) * 6.8 + 1.2);
                _camTarget.set(0.1, 1.45, -1.2);
            } else {
                // Gentle sweeping aerial drone pan over The City Skyline Park
                var pan = Math.sin(elapsed * 0.14);
                _camDesired.set(pan * 7.8, 3.8 + Math.cos(elapsed * 0.22) * 0.75, 8.6 + Math.cos(elapsed * 0.14) * 1.8);
                _camTarget.set(0.4, 1.55, -2.2);
                if (heliGroup) {
                    var cycle = elapsed * 2.1 % 68 - 34;
                    heliGroup.position.set(cycle, 16.2 + Math.sin(elapsed * 0.7) * 0.65, -33 + Math.cos(elapsed * 0.25) * 3.5);
                    heliGroup.rotation.z = -0.08 + Math.sin(elapsed * 0.6) * 0.03;
                }
                if (heliRotor) {
                    heliRotor.rotation.y += dt * 26;
                }
                if (heliBeaconMat) {
                    heliBeaconMat.color.setHex(Math.sin(elapsed * 6.5) > 0 ? 0xf43f5e : 0xfbbf24);
                }
            }
            camera.position.x = _three.MathUtils.damp(camera.position.x, _camDesired.x, 3.2, dt);
            camera.position.y = _three.MathUtils.damp(camera.position.y, _camDesired.y, 3.2, dt);
            camera.position.z = _three.MathUtils.damp(camera.position.z, _camDesired.z, 3.2, dt);
            camera.lookAt(_camTarget);
            renderer.render(scene, camera);
            if (isSoftwareGl) afterDraw(tick);
            else frameId = requestAnimationFrame(tick);
        };
        tick();
        return function() {
            disposed = true;
            cancelAnimationFrame(frameId);
            window.clearTimeout(frameId);
            window.removeEventListener('resize', onResize);
            renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
            scene.traverse(function(obj) {
                if (obj.isMesh) {
                    var _mesh_geometry;
                    var mesh = obj;
                    (_mesh_geometry = mesh.geometry) == null ? void 0 : _mesh_geometry.dispose();
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(function(m) {
                            return m.dispose();
                        });
                    } else {
                        var _mesh_material;
                        (_mesh_material = mesh.material) == null ? void 0 : _mesh_material.dispose();
                    }
                }
            });
            courtTex.dispose();
            envTex.dispose();
            renderer.dispose();
        };
    }, [
        is2K14Stage,
        starJerseyNumber,
        starPrimaryHex,
        starTrimHex
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "h2k-stage3d-backdrop " + (is2K14Stage ? 'era-2k14' : 'era-2k26') + " " + (webglFallback ? 'is-fallback' : ''),
        "aria-hidden": "true",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                ref: mountRef,
                className: "h2k-stage3d-mount"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "h2k-stage3d-vignette"
            })
        ]
    });
};

});

})(window.ArcadeMod);
