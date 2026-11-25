(function(ArcadeMod){
// === MODULE: src/core/ui/Lobby3DOverlay ===
ArcadeMod.define("src/core/ui/Lobby3DOverlay", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Lobby3DOverlay", {
    enumerable: true,
    get: function() {
        return Lobby3DOverlay;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _arenaRoster = require("../arenaRoster");
var _audio = require("../audio");
var _storage = require("../storage");
var _viewport = require("../viewport");
var _LobbyShowcase3D = require("../LobbyShowcase3D");
var _HoopsLobbyView = require("../../games/hoops-2k26/HoopsLobbyView");
var _MobaLobbyView = require("../../games/legends-arena/MobaLobbyView");
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
var Lobby3DOverlay = function Lobby3DOverlay(param) {
    var gameId = param.gameId, totalCoins = param.totalCoins, onSpendCoins = param.onSpendCoins, onAwardCoins = param.onAwardCoins, onBack = param.onBack, onLaunch = param.onLaunch;
    var _playerState_mobaEquippedSkins_playerState_selectedMobaHero, _playerState_mobaTrialHeroId, _playerState_mobaEquippedSkins_activeShowcaseHeroId, _playerState_narutoTrialHeroId;
    var stageRef = (0, _react.useRef)(null);
    var showcaseRef = (0, _react.useRef)(null);
    var _useState = (0, _react.useState)(0), setTick = _useState[1];
    var bump = function bump() {
        return setTick(function(t) {
            return t + 1;
        });
    };
    var _useState1 = (0, _react.useState)(null), notice = _useState1[0], setNotice = _useState1[1];
    var _useState2 = (0, _react.useState)(0), brWeaponIdx = _useState2[0], setBrWeaponIdx = _useState2[1];
    // Legends Arena 3D Multi-Lobby State
    var _useState3 = (0, _react.useState)('main'), mobaTab = _useState3[0], setMobaTab = _useState3[1];
    var _useState4 = (0, _react.useState)('lobby'), mobaStep = _useState4[0], setMobaStep = _useState4[1];
    var _useState5 = (0, _react.useState)(_storage.playerState.selectedMobaHero), previewHeroId = _useState5[0], setPreviewHeroId = _useState5[1];
    var _useState6 = (0, _react.useState)((_playerState_mobaEquippedSkins_playerState_selectedMobaHero = _storage.playerState.mobaEquippedSkins[_storage.playerState.selectedMobaHero]) != null ? _playerState_mobaEquippedSkins_playerState_selectedMobaHero : 'default'), previewSkinId = _useState6[0], setPreviewSkinId = _useState6[1];
    // Naruto: Senki & Storm Multi-Lobby State
    var _useState7 = (0, _react.useState)('hub'), narutoTab = _useState7[0], setNarutoTab = _useState7[1];
    var _useState8 = (0, _react.useState)('all'), narutoFactionFilter = _useState8[0], setNarutoFactionFilter = _useState8[1];
    var _useState9 = (0, _react.useState)(''), narutoSearch = _useState9[0], setNarutoSearch = _useState9[1];
    var _useState10 = (0, _react.useState)(_storage.playerState.selectedNarutoHero), previewNarutoId = _useState10[0], setPreviewNarutoId = _useState10[1];
    var _useState11 = (0, _react.useState)('lead'), assignSlot = _useState11[0], setAssignSlot = _useState11[1];
    var showNotice = function showNotice(msg) {
        setNotice(msg);
        window.setTimeout(function() {
            return setNotice(function(prev) {
                return prev === msg ? null : prev;
            });
        }, 2400);
    };
    var kind = gameId === 24 ? 'br' : gameId === 25 ? 'moba' : gameId === 26 ? 'asphalt' : gameId === 27 ? 'hoops' : 'naruto';
    var activeShowcaseHeroId = gameId === 25 && mobaStep === 'lobby' && mobaTab === 'store' ? previewHeroId : (_playerState_mobaTrialHeroId = _storage.playerState.mobaTrialHeroId) != null ? _playerState_mobaTrialHeroId : _storage.playerState.selectedMobaHero;
    var activeShowcaseSkinId = gameId === 25 && mobaStep === 'lobby' && mobaTab === 'store' ? previewSkinId : (_playerState_mobaEquippedSkins_activeShowcaseHeroId = _storage.playerState.mobaEquippedSkins[activeShowcaseHeroId]) != null ? _playerState_mobaEquippedSkins_activeShowcaseHeroId : 'default';
    var activeShowcaseNarutoId = gameId === 28 && narutoTab === 'roster' ? previewNarutoId : (_playerState_narutoTrialHeroId = _storage.playerState.narutoTrialHeroId) != null ? _playerState_narutoTrialHeroId : _storage.playerState.selectedNarutoHero;
    var buildShowcaseConfig = function buildShowcaseConfig(overrideHeroId, overrideNarutoId, overrideSkinId) {
        var _playerState_carUpgrades_playerState_selectedAsphaltCar;
        var upg = (_playerState_carUpgrades_playerState_selectedAsphaltCar = _storage.playerState.carUpgrades[_storage.playerState.selectedAsphaltCar]) != null ? _playerState_carUpgrades_playerState_selectedAsphaltCar : (0, _arenaRoster.defaultCarUpgrades)();
        var resolvedHeroId = overrideHeroId != null ? overrideHeroId : activeShowcaseHeroId;
        return {
            kind: kind,
            brMap: _storage.playerState.selectedBrMap,
            brCrateReady: _storage.playerState.brSupplyCrateReady,
            mobaHeroId: resolvedHeroId,
            mobaSkinId: overrideSkinId != null ? overrideSkinId : activeShowcaseSkinId,
            asphaltCarId: _storage.playerState.selectedAsphaltCar,
            asphaltUpgradeSum: upg.speed + upg.accel + upg.nitro + upg.handling,
            hoopsTeamId: _storage.playerState.selectedBasketballTeam,
            narutoHeroId: overrideNarutoId != null ? overrideNarutoId : activeShowcaseNarutoId,
            narutoSupport1Id: _storage.playerState.selectedNarutoSupport1,
            narutoSupport2Id: _storage.playerState.selectedNarutoSupport2
        };
    };
    (0, _react.useEffect)(function() {
        if (gameId === 27 || !stageRef.current) return;
        var showcase = new _LobbyShowcase3D.LobbyShowcase3D();
        showcaseRef.current = showcase;
        showcase.mount(stageRef.current, buildShowcaseConfig());
        var onResize = function onResize() {
            return showcase.resize();
        };
        window.addEventListener('resize', onResize);
        var unsubVp = (0, _viewport.subscribeViewport)(function() {
            return showcase.resize();
        });
        return function() {
            window.removeEventListener('resize', onResize);
            unsubVp();
            showcase.dispose();
            showcaseRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        gameId
    ]);
    var syncShowcase = function syncShowcase(overrideHeroId, overrideNarutoId, overrideSkinId) {
        var _showcaseRef_current;
        (_showcaseRef_current = showcaseRef.current) == null ? void 0 : _showcaseRef_current.update(buildShowcaseConfig(overrideHeroId, overrideNarutoId, overrideSkinId));
    };
    (0, _react.useEffect)(function() {
        if (gameId === 25) {
            syncShowcase(activeShowcaseHeroId, undefined, activeShowcaseSkinId);
        } else if (gameId === 28) {
            syncShowcase(undefined, activeShowcaseNarutoId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        mobaTab,
        mobaStep,
        previewHeroId,
        previewSkinId,
        narutoTab,
        previewNarutoId
    ]);
    var filteredNarutoRoster = (0, _react.useMemo)(function() {
        var q = narutoSearch.trim().toLowerCase();
        return _arenaRoster.NARUTO_SHINOBI_ROSTER.filter(function(h) {
            if (narutoFactionFilter !== 'all' && h.faction !== narutoFactionFilter) return false;
            if (!q) return true;
            return h.name.toLowerCase().includes(q) || h.title.toLowerCase().includes(q) || h.village.toLowerCase().includes(q) || h.role.toLowerCase().includes(q);
        });
    }, [
        narutoFactionFilter,
        narutoSearch
    ]);
    // ---------- RENDERERS PER GAME ----------
    var renderBrLobby = function renderBrLobby() {
        var _BR_WEAPONS_brWeaponIdx;
        var selectedWeapon = (_BR_WEAPONS_brWeaponIdx = _arenaRoster.BR_WEAPONS[brWeaponIdx]) != null ? _BR_WEAPONS_brWeaponIdx : _arenaRoster.BR_WEAPONS[0];
        return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "lobby3d-panel",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lobby3d-sec-title",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: "Drop Mode & Island"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                    children: [
                                        "\uD83C\uDFC6 ",
                                        _storage.playerState.brWins,
                                        " \xb7 \uD83D\uDC80 ",
                                        _storage.playerState.brKills
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lobby3d-seg-row",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "lobby3d-seg-btn " + (_storage.playerState.selectedBrMode === 'solo' ? 'active' : ''),
                                    onClick: function onClick() {
                                        _storage.playerState.selectedBrMode = 'solo';
                                        (0, _storage.persistArenaSelections)();
                                        bump();
                                    },
                                    children: "\uD83D\uDC64 SOLO"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "lobby3d-seg-btn " + (_storage.playerState.selectedBrMode === 'squad' ? 'active' : ''),
                                    onClick: function onClick() {
                                        _storage.playerState.selectedBrMode = 'squad';
                                        (0, _storage.persistArenaSelections)();
                                        bump();
                                    },
                                    children: "\uD83D\uDC65 SQUAD (+AI)"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lobby3d-seg-row",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "lobby3d-seg-btn " + (_storage.playerState.selectedBrMap === 'erangel' ? 'active' : ''),
                                    onClick: function onClick() {
                                        _storage.playerState.selectedBrMap = 'erangel';
                                        (0, _storage.persistArenaSelections)();
                                        syncShowcase();
                                        bump();
                                    },
                                    children: "\uD83C\uDF3E Erangel"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "lobby3d-seg-btn " + (_storage.playerState.selectedBrMap === 'sanhok' ? 'active' : ''),
                                    onClick: function onClick() {
                                        _storage.playerState.selectedBrMap = 'sanhok';
                                        (0, _storage.persistArenaSelections)();
                                        syncShowcase();
                                        bump();
                                    },
                                    children: "\uD83C\uDF34 Sanhok Mist"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lobby3d-sec-title",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: "Supply Drop Crate"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: "Lv.3 Vest + Flare"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                            type: "button",
                            className: "lobby3d-item-card " + (_storage.playerState.brSupplyCrateReady ? 'selected' : ''),
                            disabled: _storage.playerState.brSupplyCrateReady,
                            onClick: function onClick() {
                                if (_storage.playerState.brSupplyCrateReady) return;
                                if (!onSpendCoins(30)) {
                                    showNotice('Need 30🪙 Garden Coins for Supply Crate!');
                                    return;
                                }
                                _storage.playerState.brSupplyCrateReady = true;
                                (0, _storage.persistBrStats)();
                                syncShowcase();
                                bump();
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "lobby3d-item-main",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "lobby3d-item-title",
                                            children: "\uD83E\uDE82 Air-Drop Tactical Kit"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "lobby3d-item-sub",
                                            children: "Start with +60 Lv.3 Armor & Signal Flare [C]"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    className: "lobby3d-mini-btn",
                                    children: _storage.playerState.brSupplyCrateReady ? 'EQUIPPED ✓' : 'BUY 30🪙'
                                })
                            ]
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "lobby3d-center-spacer",
                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "lobby3d-center-caption",
                        children: "C-130 Cargo Jump \xb7 Parachute Drop \xb7 Military Buggy \xb7 Flare Airdrops"
                    })
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "lobby3d-panel",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lobby3d-sec-title",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: "4-Gun Loadout Armory"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: "All 4 Carried"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "lobby3d-card-list",
                            children: _arenaRoster.BR_WEAPONS.map(function(w, idx) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    className: "lobby3d-item-card " + (brWeaponIdx === idx ? 'selected' : ''),
                                    onClick: function onClick() {
                                        return setBrWeaponIdx(idx);
                                    },
                                    children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "lobby3d-item-main",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "lobby3d-item-title",
                                                children: [
                                                    "[",
                                                    w.slot,
                                                    "] ",
                                                    w.icon,
                                                    " ",
                                                    w.name
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "lobby3d-item-sub",
                                                children: [
                                                    w.category,
                                                    " \xb7 DMG ",
                                                    w.dmg * w.pellets,
                                                    " \xb7 Mag ",
                                                    w.magSize,
                                                    " \xb7 ",
                                                    w.scopeFov === 22 ? '4x Scope' : 'Red Dot'
                                                ]
                                            })
                                        ]
                                    })
                                }, w.id);
                            })
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lobby3d-item-sub",
                            children: [
                                "Preview: ",
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                    children: selectedWeapon.name
                                }),
                                " \xb7 Switch anytime with [1–4] or \uD83D\uDD01 GUN"
                            ]
                        }),
                        notice && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "lobby3d-notice",
                            children: notice
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            className: "lobby3d-cta-btn",
                            onClick: onLaunch,
                            children: "✈️ BOARD C-130 & DROP IN"
                        })
                    ]
                })
            ]
        });
    };
    var renderMobaLobby = function renderMobaLobby() {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(_MobaLobbyView.MobaLobbyView, {
            mobaTab: mobaTab,
            setMobaTab: setMobaTab,
            mobaStep: mobaStep,
            setMobaStep: setMobaStep,
            previewHeroId: previewHeroId,
            setPreviewHeroId: setPreviewHeroId,
            previewSkinId: previewSkinId,
            setPreviewSkinId: setPreviewSkinId,
            notice: notice,
            showNotice: showNotice,
            onSpendCoins: onSpendCoins,
            onAwardCoins: onAwardCoins,
            onSyncShowcase: function onSyncShowcase(hid, sid) {
                return syncShowcase(hid, undefined, sid);
            },
            onLaunch: onLaunch,
            bump: bump
        });
    };
    var renderAsphaltLobby = function renderAsphaltLobby() {
        var _ASPHALT_CARS_playerState_selectedAsphaltCar, _playerState_carUpgrades_car_id, _ASPHALT_MAPS_playerState_selectedAsphaltMap;
        var car = (_ASPHALT_CARS_playerState_selectedAsphaltCar = _arenaRoster.ASPHALT_CARS[_storage.playerState.selectedAsphaltCar]) != null ? _ASPHALT_CARS_playerState_selectedAsphaltCar : _arenaRoster.ASPHALT_CARS[0];
        var isOwned = _storage.playerState.ownedAsphaltCars.includes(car.id);
        var upg = (_playerState_carUpgrades_car_id = _storage.playerState.carUpgrades[car.id]) != null ? _playerState_carUpgrades_car_id : (0, _arenaRoster.defaultCarUpgrades)();
        var computed = (0, _arenaRoster.computeUpgradedCarStats)(car, upg);
        var selectedMap = (_ASPHALT_MAPS_playerState_selectedAsphaltMap = _arenaRoster.ASPHALT_MAPS[_storage.playerState.selectedAsphaltMap]) != null ? _ASPHALT_MAPS_playerState_selectedAsphaltMap : _arenaRoster.ASPHALT_MAPS[0];
        var upgradeStat = function upgradeStat(key) {
            if (!isOwned) return;
            var curLv = upg[key];
            var cost = (0, _arenaRoster.getCarUpgradeCost)(curLv);
            if (curLv >= 5 || cost <= 0) return;
            if (!onSpendCoins(cost)) {
                showNotice("Need " + cost + "\uD83E\uDE99 Garden Coins to upgrade " + key + "!");
                return;
            }
            var _obj;
            _storage.playerState.carUpgrades[car.id] = _extends({}, upg, (_obj = {}, _obj[key] = curLv + 1, _obj));
            (0, _storage.persistAsphaltGarage)();
            syncShowcase();
            bump();
        };
        var buyCar = function buyCar(carId, unlockCost) {
            if (_storage.playerState.ownedAsphaltCars.includes(carId)) return;
            if (!onSpendCoins(unlockCost)) {
                showNotice("Need " + unlockCost + "\uD83E\uDE99 to unlock " + _arenaRoster.ASPHALT_CARS[carId].name + "!");
                return;
            }
            _storage.playerState.ownedAsphaltCars = [].concat(_storage.playerState.ownedAsphaltCars, [
                carId
            ]);
            _storage.playerState.selectedAsphaltCar = carId;
            (0, _storage.persistAsphaltGarage)();
            syncShowcase();
            bump();
        };
        var statRows = [
            {
                key: 'speed',
                label: 'Top Speed',
                lv: upg.speed
            },
            {
                key: 'accel',
                label: 'Accel',
                lv: upg.accel
            },
            {
                key: 'nitro',
                label: 'Nitro',
                lv: upg.nitro
            },
            {
                key: 'handling',
                label: 'Handling',
                lv: upg.handling
            }
        ];
        return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "lobby3d-panel",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lobby3d-sec-title",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: "8-Car Showroom"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                    children: [
                                        _storage.playerState.ownedAsphaltCars.length,
                                        "/8 Owned"
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "lobby3d-card-list",
                            children: _arenaRoster.ASPHALT_CARS.map(function(c) {
                                var owned = _storage.playerState.ownedAsphaltCars.includes(c.id);
                                var selected = _storage.playerState.selectedAsphaltCar === c.id;
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "lobby3d-item-card " + (selected ? 'selected' : '') + " " + (!owned ? 'locked' : ''),
                                    onClick: function onClick() {
                                        _storage.playerState.selectedAsphaltCar = c.id;
                                        if (owned) (0, _storage.persistAsphaltGarage)();
                                        syncShowcase();
                                        bump();
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "lobby3d-item-main",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "lobby3d-item-title",
                                                    children: [
                                                        c.icon,
                                                        " ",
                                                        c.name
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "lobby3d-item-sub",
                                                    children: [
                                                        c.tagline,
                                                        " \xb7 Top ",
                                                        c.topSpeed
                                                    ]
                                                })
                                            ]
                                        }),
                                        owned ? /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "lobby3d-badge",
                                            children: selected ? 'READY' : 'OWNED'
                                        }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                            type: "button",
                                            className: "lobby3d-mini-btn",
                                            onClick: function onClick(e) {
                                                e.stopPropagation();
                                                buyCar(c.id, c.unlockCost);
                                            },
                                            children: [
                                                "BUY ",
                                                c.unlockCost,
                                                "\uD83E\uDE99"
                                            ]
                                        })
                                    ]
                                }, c.id);
                            })
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "lobby3d-center-spacer",
                    children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "lobby3d-center-caption",
                        children: [
                            car.icon,
                            " ",
                            car.name,
                            " \xb7 ",
                            Math.round(computed.topSpeed * 3.8),
                            " KM/H \xb7 Nitro ",
                            Math.round(computed.nitroSpeed * 3.8),
                            " KM/H"
                        ]
                    })
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "lobby3d-panel",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lobby3d-sec-title",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: "Performance Tuning"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: isOwned ? 'Upgrades Active' : 'Locked Car'
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            children: statRows.map(function(row) {
                                var cost = (0, _arenaRoster.getCarUpgradeCost)(row.lv);
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "lobby3d-upgrade-row",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            className: "lobby3d-upgrade-label",
                                            children: [
                                                row.label,
                                                " Lv",
                                                row.lv
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "lobby3d-pips",
                                            children: [
                                                1,
                                                2,
                                                3,
                                                4,
                                                5
                                            ].map(function(pip) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "lobby3d-pip " + (pip <= row.lv ? 'filled' : '')
                                                }, pip);
                                            })
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            className: "lobby3d-mini-btn",
                                            disabled: !isOwned || row.lv >= 5,
                                            onClick: function onClick() {
                                                return upgradeStat(row.key);
                                            },
                                            children: row.lv >= 5 ? 'MAX' : "" + cost + "\uD83E\uDE99"
                                        })
                                    ]
                                }, row.key);
                            })
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lobby3d-sec-title",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: "4 Mission Maps"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                    children: [
                                        "+",
                                        selectedMap.rewardCoins,
                                        "\uD83E\uDE99"
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "lobby3d-card-list",
                            children: _arenaRoster.ASPHALT_MAPS.map(function(m) {
                                var _playerState_asphaltMapStars_m_id;
                                var stars = (_playerState_asphaltMapStars_m_id = _storage.playerState.asphaltMapStars[m.id]) != null ? _playerState_asphaltMapStars_m_id : 0;
                                var starStr = "" + '★'.repeat(stars) + '☆'.repeat(3 - stars);
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    className: "lobby3d-item-card " + (_storage.playerState.selectedAsphaltMap === m.id ? 'selected' : ''),
                                    onClick: function onClick() {
                                        _storage.playerState.selectedAsphaltMap = m.id;
                                        (0, _storage.persistAsphaltGarage)();
                                        bump();
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "lobby3d-item-main",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "lobby3d-item-title",
                                                    children: [
                                                        m.icon,
                                                        " ",
                                                        m.name
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "lobby3d-item-sub",
                                                    children: m.missionGoal
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "lobby3d-badge",
                                            children: starStr
                                        })
                                    ]
                                }, m.id);
                            })
                        }),
                        notice && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "lobby3d-notice",
                            children: notice
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            className: "lobby3d-cta-btn",
                            disabled: !isOwned,
                            onClick: function onClick() {
                                if (!isOwned) return;
                                (0, _storage.persistAsphaltGarage)();
                                onLaunch();
                            },
                            children: isOwned ? "\uD83C\uDFC1 RACE " + selectedMap.name.toUpperCase() : "\uD83D\uDD12 BUY " + car.name.toUpperCase() + " FIRST"
                        })
                    ]
                })
            ]
        });
    };
    var renderHoopsLobby = function renderHoopsLobby() {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(_HoopsLobbyView.HoopsLobbyView, {
            onBack: onBack,
            onLaunch: onLaunch,
            onSyncShowcase: function onSyncShowcase() {
                return syncShowcase();
            },
            bump: bump
        });
    };
    var renderNarutoLobby = function renderNarutoLobby() {
        var _NARUTO_SHINOBI_ROSTER_playerState_selectedNarutoHero, _NARUTO_SHINOBI_ROSTER_playerState_selectedNarutoSupport1, _NARUTO_SHINOBI_ROSTER_playerState_selectedNarutoSupport2, _NARUTO_MODES_find, _NARUTO_STAGES_find;
        var leadHero = (_NARUTO_SHINOBI_ROSTER_playerState_selectedNarutoHero = _arenaRoster.NARUTO_SHINOBI_ROSTER[_storage.playerState.selectedNarutoHero]) != null ? _NARUTO_SHINOBI_ROSTER_playerState_selectedNarutoHero : _arenaRoster.NARUTO_SHINOBI_ROSTER[0];
        var sup1Hero = (_NARUTO_SHINOBI_ROSTER_playerState_selectedNarutoSupport1 = _arenaRoster.NARUTO_SHINOBI_ROSTER[_storage.playerState.selectedNarutoSupport1]) != null ? _NARUTO_SHINOBI_ROSTER_playerState_selectedNarutoSupport1 : _arenaRoster.NARUTO_SHINOBI_ROSTER[1];
        var sup2Hero = (_NARUTO_SHINOBI_ROSTER_playerState_selectedNarutoSupport2 = _arenaRoster.NARUTO_SHINOBI_ROSTER[_storage.playerState.selectedNarutoSupport2]) != null ? _NARUTO_SHINOBI_ROSTER_playerState_selectedNarutoSupport2 : _arenaRoster.NARUTO_SHINOBI_ROSTER[2];
        var activeMode = (_NARUTO_MODES_find = _arenaRoster.NARUTO_MODES.find(function(m) {
            return m.id === _storage.playerState.selectedNarutoMode;
        })) != null ? _NARUTO_MODES_find : _arenaRoster.NARUTO_MODES[0];
        var activeStage = (_NARUTO_STAGES_find = _arenaRoster.NARUTO_STAGES.find(function(s) {
            return s.id === _storage.playerState.selectedNarutoStage;
        })) != null ? _NARUTO_STAGES_find : _arenaRoster.NARUTO_STAGES[0];
        var synergy = (0, _arenaRoster.resolveNarutoTeamSynergy)([
            leadHero.id,
            sup1Hero.id,
            sup2Hero.id
        ]);
        // TAB 1: SHINOBI HUB
        if (narutoTab === 'hub') {
            return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "lobby3d-panel",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lobby3d-sec-title",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "Shinobi Battle Record"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            "\uD83C\uDFC6 ",
                                            _storage.playerState.narutoWins,
                                            " Wins \xb7 ⚔️ ",
                                            _storage.playerState.narutoKillsTotal,
                                            " KOs"
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "lobby3d-item-card selected",
                                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "lobby3d-item-main",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "lobby3d-item-title",
                                            children: [
                                                leadHero.icon,
                                                " ",
                                                leadHero.name,
                                                " \xb7 ",
                                                leadHero.title
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "lobby3d-item-sub",
                                            children: [
                                                leadHero.village,
                                                " \xb7 ",
                                                leadHero.role,
                                                " \xb7 Unlocked ",
                                                _storage.playerState.unlockedNarutoHeroes.length,
                                                "/",
                                                _arenaRoster.NARUTO_SHINOBI_ROSTER.length,
                                                " Shinobi"
                                            ]
                                        })
                                    ]
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lobby3d-sec-title",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "Select Combat Engine & Mode"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: activeMode.badge
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "lobby3d-card-list",
                                children: _arenaRoster.NARUTO_MODES.map(function(m) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "lobby3d-item-card " + (_storage.playerState.selectedNarutoMode === m.id ? 'selected' : ''),
                                        onClick: function onClick() {
                                            _audio.ArcadeAudio.play('click');
                                            _storage.playerState.selectedNarutoMode = m.id;
                                            (0, _storage.persistNarutoProgression)();
                                            bump();
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "lobby3d-item-main",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "lobby3d-item-title",
                                                        children: m.title
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "lobby3d-item-sub",
                                                        children: m.sub
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "lobby3d-badge",
                                                children: m.badge
                                            })
                                        ]
                                    }, m.id);
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lobby3d-sec-title",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "Select Battlefield Stage"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: activeStage.name
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "lobby3d-seg-row",
                                style: {
                                    flexWrap: 'wrap'
                                },
                                children: _arenaRoster.NARUTO_STAGES.map(function(st) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "lobby3d-seg-btn " + (_storage.playerState.selectedNarutoStage === st.id ? 'active' : ''),
                                        onClick: function onClick() {
                                            _audio.ArcadeAudio.play('click');
                                            _storage.playerState.selectedNarutoStage = st.id;
                                            (0, _storage.persistNarutoProgression)();
                                            bump();
                                        },
                                        children: [
                                            st.icon,
                                            " ",
                                            st.name.split(' ')[0]
                                        ]
                                    }, st.id);
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "lobby3d-center-spacer",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lobby3d-center-caption",
                            children: [
                                leadHero.icon,
                                " ",
                                leadHero.name,
                                " + ",
                                sup1Hero.icon,
                                " ",
                                sup1Hero.name.split(' ')[0],
                                " + ",
                                sup2Hero.icon,
                                " ",
                                sup2Hero.name.split(' ')[0],
                                " \xb7 ",
                                synergy.name,
                                " (+",
                                synergy.bonusPct,
                                "% Team DMG)"
                            ]
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "lobby3d-panel",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lobby3d-sec-title",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            leadHero.name,
                                            " Jutsu & Ougi Kit"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            "Awakening: ",
                                            leadHero.awakeningName
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lobby3d-kit-box",
                                style: {
                                    overflowY: 'auto'
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "lobby3d-kit-item",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                children: [
                                                    "Innate Trait — ",
                                                    leadHero.passiveName,
                                                    ":"
                                                ]
                                            }),
                                            " ",
                                            leadHero.passiveDesc
                                        ]
                                    }),
                                    leadHero.skills.map(function(sk) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "lobby3d-kit-item",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                    children: [
                                                        "[S",
                                                        sk.slot,
                                                        " \xb7 Lv.",
                                                        sk.unlockLevel,
                                                        " \xb7 ",
                                                        sk.cooldown,
                                                        "s] ",
                                                        sk.name,
                                                        ":"
                                                    ]
                                                }),
                                                ' ',
                                                sk.desc
                                            ]
                                        }, sk.slot);
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lobby3d-btn-row",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "lobby3d-seg-btn active",
                                        onClick: function onClick() {
                                            _audio.ArcadeAudio.play('click');
                                            setPreviewNarutoId(_storage.playerState.selectedNarutoHero);
                                            setNarutoTab('roster');
                                        },
                                        children: [
                                            "\uD83D\uDED2 ",
                                            _arenaRoster.NARUTO_SHINOBI_ROSTER.length,
                                            " SHINOBI (",
                                            _storage.playerState.unlockedNarutoHeroes.length,
                                            "/",
                                            _arenaRoster.NARUTO_SHINOBI_ROSTER.length,
                                            ")"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "lobby3d-seg-btn",
                                        onClick: function onClick() {
                                            _audio.ArcadeAudio.play('click');
                                            setNarutoTab('team');
                                        },
                                        children: "\uD83D\uDC65 TEAM SUPPORTS"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                type: "button",
                                className: "lobby3d-cta-btn",
                                onClick: function onClick() {
                                    _storage.playerState.narutoTrialHeroId = null;
                                    (0, _storage.persistNarutoProgression)();
                                    onLaunch();
                                },
                                children: [
                                    "\uD83C\uDF65 LAUNCH ",
                                    activeMode.title.toUpperCase()
                                ]
                            })
                        ]
                    })
                ]
            });
        }
        // TAB 2: SHINOBI ROSTER & STORE
        if (narutoTab === 'roster') {
            var _NARUTO_SHINOBI_ROSTER_previewNarutoId;
            var inspected = (_NARUTO_SHINOBI_ROSTER_previewNarutoId = _arenaRoster.NARUTO_SHINOBI_ROSTER[previewNarutoId]) != null ? _NARUTO_SHINOBI_ROSTER_previewNarutoId : _arenaRoster.NARUTO_SHINOBI_ROSTER[0];
            var isOwned = _storage.playerState.unlockedNarutoHeroes.includes(inspected.id);
            var isLead = _storage.playerState.selectedNarutoHero === inspected.id;
            var factionTabs = [
                {
                    id: 'all',
                    label: "All (" + _arenaRoster.NARUTO_SHINOBI_ROSTER.length + ")"
                },
                {
                    id: 'Konoha',
                    label: '🍃 Konoha'
                },
                {
                    id: 'Five Kage & Legends',
                    label: '👑 Kage & Legends'
                },
                {
                    id: 'Akatsuki & Villains',
                    label: '☁️ Akatsuki & Villains'
                },
                {
                    id: 'Boruto & Otsutsuki',
                    label: '🌙 Boruto & Otsutsuki'
                }
            ];
            return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "lobby3d-panel",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lobby3d-sec-title",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            _arenaRoster.NARUTO_SHINOBI_ROSTER.length,
                                            "-Shinobi Roster"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            _storage.playerState.unlockedNarutoHeroes.length,
                                            "/",
                                            _arenaRoster.NARUTO_SHINOBI_ROSTER.length,
                                            " Unlocked"
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                type: "text",
                                className: "lobby3d-search",
                                placeholder: "Search Naruto, Sasuke, Madara, Itachi, Kaguya...",
                                value: narutoSearch,
                                onChange: function onChange(e) {
                                    return setNarutoSearch(e.target.value);
                                }
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "lobby3d-role-pills",
                                children: factionTabs.map(function(ft) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "lobby3d-role-pill " + (narutoFactionFilter === ft.id ? 'active' : ''),
                                        onClick: function onClick() {
                                            _audio.ArcadeAudio.play('click');
                                            setNarutoFactionFilter(ft.id);
                                        },
                                        children: ft.label
                                    }, ft.id);
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "lobby3d-scroll-list",
                                children: filteredNarutoRoster.map(function(h) {
                                    var owned = _storage.playerState.unlockedNarutoHeroes.includes(h.id);
                                    var selected = previewNarutoId === h.id;
                                    var eq = _storage.playerState.selectedNarutoHero === h.id;
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "lobby3d-item-card " + (selected ? 'selected' : '') + " " + (!owned ? 'locked' : ''),
                                        onClick: function onClick() {
                                            _audio.ArcadeAudio.play('click');
                                            setPreviewNarutoId(h.id);
                                            syncShowcase(undefined, h.id);
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "lobby3d-item-main",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "lobby3d-item-title",
                                                        children: [
                                                            h.icon,
                                                            " ",
                                                            h.name
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "lobby3d-item-sub",
                                                        children: [
                                                            h.village,
                                                            " \xb7 ",
                                                            h.role,
                                                            " \xb7 ",
                                                            h.title
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "lobby3d-badge",
                                                children: eq ? 'LEAD' : owned ? 'OWNED' : "\uD83E\uDE99" + h.unlockCost
                                            })
                                        ]
                                    }, h.id);
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "lobby3d-center-spacer",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lobby3d-center-caption",
                            children: [
                                inspected.icon,
                                " ",
                                inspected.name,
                                " — ",
                                inspected.title,
                                " (",
                                inspected.village,
                                ")"
                            ]
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "lobby3d-panel",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lobby3d-sec-title",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: inspected.name
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: isOwned ? isLead ? 'ACTIVE LEAD' : 'OWNED' : "\uD83E\uDE99 " + inspected.unlockCost
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lobby3d-stat-mini-grid",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "lobby3d-stat-mini",
                                        children: [
                                            "HP",
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("b", {
                                                children: inspected.baseHp
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "lobby3d-stat-mini",
                                        children: [
                                            "ATK",
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("b", {
                                                children: inspected.baseAtk
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "lobby3d-stat-mini",
                                        children: [
                                            "SPD",
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("b", {
                                                children: inspected.speed
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "lobby3d-stat-mini",
                                        children: [
                                            "ROLE",
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("b", {
                                                children: inspected.role.split(' ')[0]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lobby3d-kit-box",
                                style: {
                                    overflowY: 'auto'
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "lobby3d-kit-item",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                children: [
                                                    "Passive — ",
                                                    inspected.passiveName,
                                                    ":"
                                                ]
                                            }),
                                            " ",
                                            inspected.passiveDesc
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "lobby3d-kit-item",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                children: [
                                                    "Awakening — ",
                                                    inspected.awakeningName,
                                                    ":"
                                                ]
                                            }),
                                            " Unlocks at Lv.6 in Senki or ≤40% HP in Storm 3D."
                                        ]
                                    }),
                                    inspected.skills.map(function(sk) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "lobby3d-kit-item",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                    children: [
                                                        "[S",
                                                        sk.slot,
                                                        " \xb7 Lv.",
                                                        sk.unlockLevel,
                                                        "] ",
                                                        sk.name,
                                                        ":"
                                                    ]
                                                }),
                                                ' ',
                                                sk.desc
                                            ]
                                        }, sk.slot);
                                    })
                                ]
                            }),
                            notice && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "lobby3d-notice",
                                children: notice
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lobby3d-btn-row",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "lobby3d-seg-btn",
                                        onClick: function onClick() {
                                            _audio.ArcadeAudio.play('click');
                                            _storage.playerState.narutoTrialHeroId = inspected.id;
                                            (0, _storage.persistNarutoProgression)();
                                            onLaunch();
                                        },
                                        children: "\uD83E\uDDEA FREE TRIAL MATCH"
                                    }),
                                    isOwned ? /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        className: "lobby3d-cta-btn",
                                        disabled: isLead,
                                        onClick: function onClick() {
                                            _audio.ArcadeAudio.play('coin');
                                            _storage.playerState.narutoTrialHeroId = null;
                                            _storage.playerState.selectedNarutoHero = inspected.id;
                                            (0, _storage.persistNarutoProgression)();
                                            syncShowcase(undefined, inspected.id);
                                            bump();
                                        },
                                        children: isLead ? '✓ EQUIPPED LEAD' : '⭐ SET AS LEAD'
                                    }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "lobby3d-cta-btn",
                                        onClick: function onClick() {
                                            if (!onSpendCoins(inspected.unlockCost)) {
                                                showNotice("Need " + inspected.unlockCost + "\uD83E\uDE99 Coins to unlock " + inspected.name + "!");
                                                return;
                                            }
                                            _storage.playerState.unlockedNarutoHeroes = [].concat(_storage.playerState.unlockedNarutoHeroes, [
                                                inspected.id
                                            ]).sort(function(a, b) {
                                                return a - b;
                                            });
                                            _storage.playerState.selectedNarutoHero = inspected.id;
                                            _storage.playerState.narutoTrialHeroId = null;
                                            (0, _storage.persistNarutoProgression)();
                                            _audio.ArcadeAudio.play('levelup');
                                            showNotice("Unlocked " + inspected.name + "!");
                                            syncShowcase(undefined, inspected.id);
                                            bump();
                                        },
                                        children: [
                                            "\uD83E\uDE99 UNLOCK (",
                                            inspected.unlockCost,
                                            "\uD83E\uDE99)"
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ]
            });
        }
        // TAB 3: TEAM FORMATION & SUPPORT DRIVE ROLES
        if (narutoTab === 'team') {
            var ownedShinobi = _arenaRoster.NARUTO_SHINOBI_ROSTER.filter(function(h) {
                return _storage.playerState.unlockedNarutoHeroes.includes(h.id);
            });
            return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "lobby3d-panel",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lobby3d-sec-title",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "3-Man Cell Squad Formation"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            "Synergy: +",
                                            synergy.bonusPct,
                                            "%"
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lobby3d-seg-row",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "lobby3d-seg-btn " + (assignSlot === 'lead' ? 'active' : ''),
                                        onClick: function onClick() {
                                            return setAssignSlot('lead');
                                        },
                                        children: [
                                            "⭐ Lead: ",
                                            leadHero.name.split(' ')[0]
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "lobby3d-seg-btn " + (assignSlot === 'sup1' ? 'active' : ''),
                                        onClick: function onClick() {
                                            return setAssignSlot('sup1');
                                        },
                                        children: [
                                            "\uD83E\uDD1D Sup 1: ",
                                            sup1Hero.name.split(' ')[0]
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "lobby3d-seg-btn " + (assignSlot === 'sup2' ? 'active' : ''),
                                        onClick: function onClick() {
                                            return setAssignSlot('sup2');
                                        },
                                        children: [
                                            "\uD83E\uDD1D Sup 2: ",
                                            sup2Hero.name.split(' ')[0]
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "lobby3d-scroll-list",
                                children: ownedShinobi.map(function(h) {
                                    var isAssigned = assignSlot === 'lead' && _storage.playerState.selectedNarutoHero === h.id || assignSlot === 'sup1' && _storage.playerState.selectedNarutoSupport1 === h.id || assignSlot === 'sup2' && _storage.playerState.selectedNarutoSupport2 === h.id;
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "lobby3d-item-card " + (isAssigned ? 'selected' : ''),
                                        onClick: function onClick() {
                                            _audio.ArcadeAudio.play('click');
                                            if (assignSlot === 'lead') _storage.playerState.selectedNarutoHero = h.id;
                                            else if (assignSlot === 'sup1') _storage.playerState.selectedNarutoSupport1 = h.id;
                                            else _storage.playerState.selectedNarutoSupport2 = h.id;
                                            (0, _storage.persistNarutoProgression)();
                                            syncShowcase();
                                            bump();
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "lobby3d-item-main",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "lobby3d-item-title",
                                                        children: [
                                                            h.icon,
                                                            " ",
                                                            h.name
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "lobby3d-item-sub",
                                                        children: [
                                                            h.village,
                                                            " \xb7 ",
                                                            h.role
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "lobby3d-badge",
                                                children: isAssigned ? 'ACTIVE' : 'ASSIGN'
                                            })
                                        ]
                                    }, h.id);
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "lobby3d-center-spacer",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lobby3d-center-caption",
                            children: [
                                "Team Bond: ",
                                synergy.name,
                                " (+",
                                synergy.bonusPct,
                                "% Team Jutsu & Linked Secret Technique Power)"
                            ]
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "lobby3d-panel",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lobby3d-sec-title",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            "Support 1 Role (",
                                            sup1Hero.name.split(' ')[0],
                                            ")"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "[R] Assist"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "lobby3d-seg-row",
                                style: {
                                    flexWrap: 'wrap'
                                },
                                children: _arenaRoster.STORM_SUPPORT_TYPE_DEFS.map(function(st) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "lobby3d-seg-btn " + (_storage.playerState.narutoSupport1Type === st.id ? 'active' : ''),
                                        onClick: function onClick() {
                                            _audio.ArcadeAudio.play('click');
                                            _storage.playerState.narutoSupport1Type = st.id;
                                            (0, _storage.persistNarutoProgression)();
                                            bump();
                                        },
                                        children: [
                                            st.icon,
                                            " ",
                                            st.name
                                        ]
                                    }, st.id);
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "lobby3d-sec-title",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        children: [
                                            "Support 2 Role (",
                                            sup2Hero.name.split(' ')[0],
                                            ")"
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: "[T] Assist"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "lobby3d-seg-row",
                                style: {
                                    flexWrap: 'wrap'
                                },
                                children: _arenaRoster.STORM_SUPPORT_TYPE_DEFS.map(function(st) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        className: "lobby3d-seg-btn " + (_storage.playerState.narutoSupport2Type === st.id ? 'active' : ''),
                                        onClick: function onClick() {
                                            _audio.ArcadeAudio.play('click');
                                            _storage.playerState.narutoSupport2Type = st.id;
                                            (0, _storage.persistNarutoProgression)();
                                            bump();
                                        },
                                        children: [
                                            st.icon,
                                            " ",
                                            st.name
                                        ]
                                    }, st.id);
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "lobby3d-kit-box",
                                children: _arenaRoster.STORM_SUPPORT_TYPE_DEFS.map(function(st) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "lobby3d-kit-item",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                children: [
                                                    st.icon,
                                                    " ",
                                                    st.name,
                                                    ":"
                                                ]
                                            }),
                                            " ",
                                            st.desc
                                        ]
                                    }, st.id);
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "lobby3d-cta-btn",
                                onClick: onLaunch,
                                children: "\uD83C\uDF65 DEPLOY 3-MAN CELL SQUAD"
                            })
                        ]
                    })
                ]
            });
        }
        // TAB 4: MECHANICS, RAMEN SHOP & NINJA TOOLS GUIDE
        return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "lobby3d-panel",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lobby3d-sec-title",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: "Part 1: Naruto Senki (2D MOBA)"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: "3v3 & 4v4"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lobby3d-kit-box",
                            style: {
                                overflowY: 'auto'
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "lobby3d-kit-item",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "3-Tower Single Lane:"
                                        }),
                                        " Outer (3,000 HP), Inner (4,500 HP), and Main Base Crystal (6,000 HP). Towers prioritize Minions/Clones first, but immediately switch aggro onto any Hero who attacks an enemy Hero inside tower range!"
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "lobby3d-kit-item",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "Level 1–6 & Ougi:"
                                        }),
                                        " Skills 1–3 available at Lv.1–3. Unlock ",
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "Ougi 1"
                                        }),
                                        " at ",
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "Lv.4"
                                        }),
                                        " and ",
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "Ougi 2 / Form Awakening"
                                        }),
                                        " at ",
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "Lv.6"
                                        }),
                                        ". Pure cooldowns (no mana bar)."
                                    ]
                                }),
                                _arenaRoster.SENKI_RAMEN_ITEMS.map(function(item) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "lobby3d-kit-item",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                children: [
                                                    item.icon,
                                                    " ",
                                                    item.name,
                                                    " (",
                                                    item.cost,
                                                    "G \xb7 [",
                                                    item.shortcut,
                                                    "]):"
                                                ]
                                            }),
                                            ' ',
                                            item.effectDesc
                                        ]
                                    }, item.id);
                                })
                            ]
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "lobby3d-center-spacer",
                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "lobby3d-center-caption",
                        children: "Both On-Screen Touch Buttons & Full Keyboard Shortcuts Active"
                    })
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "lobby3d-panel",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lobby3d-sec-title",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: "Part 2: Ultimate Ninja Storm (3D)"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: "3v3 & 1v1"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lobby3d-kit-box",
                            style: {
                                overflowY: 'auto'
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "lobby3d-kit-item",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "4-Log Substitution (Kawarimi) [E]:"
                                        }),
                                        " 4 wood logs max. Takes ",
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "14.0s"
                                        }),
                                        " of zero log usage to recharge—spending any log resets the 14.0s timer to 0.0s!"
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "lobby3d-kit-item",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "Counterattack Parry [Q + I]:"
                                        }),
                                        " Parries melee dashes & Chakra Dashes, but locks ",
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "35% of max Chakra grey for 16s"
                                        }),
                                        "."
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "lobby3d-kit-item",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                            children: "True Awakening [L / 5]:"
                                        }),
                                        " Available at ≤40% HP with full Chakra. Followed by 10s Chakra Fatigue."
                                    ]
                                }),
                                _arenaRoster.STORM_NINJA_TOOLS.map(function(tl) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "lobby3d-kit-item",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                children: [
                                                    tl.icon,
                                                    " ",
                                                    tl.name,
                                                    " ([",
                                                    tl.shortcut,
                                                    "]):"
                                                ]
                                            }),
                                            ' ',
                                            tl.desc
                                        ]
                                    }, tl.id);
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            className: "lobby3d-cta-btn",
                            onClick: onLaunch,
                            children: "\uD83C\uDF65 ENTER BATTLEFIELD"
                        })
                    ]
                })
            ]
        });
    };
    var titleByGame = {
        24: {
            title: 'Battle Royale 3D Lobby',
            badge: 'PUBG EDITION'
        },
        25: {
            title: 'Legends Arena 3D',
            badge: mobaStep === 'draft' ? 'DRAFT & BANS' : mobaTab === 'store' ? 'SHOP & SKINS (129)' : mobaTab === 'mode' ? '6 GAME MODES' : mobaTab === 'events' ? 'EVENTS & STARLIGHT' : mobaTab === 'prep' ? 'EMBLEMS & BUILDS' : mobaTab === 'profile' ? 'PROFILE & SQUAD' : mobaTab === 'settings' ? 'SETTINGS' : 'LAND OF DAWN'
        },
        26: {
            title: 'Asphalt Nitro 3D',
            badge: '3D GARAGE & MAPS'
        },
        27: {
            title: 'Hoops 2K26 3D',
            badge: '2K ARENA HUB'
        },
        28: {
            title: 'Naruto: Senki & Storm',
            badge: narutoTab === 'roster' ? "" + _arenaRoster.NARUTO_SHINOBI_ROSTER.length + " SHINOBI ROSTER" : narutoTab === 'team' ? '3-MAN CELL & SUPPORTS' : narutoTab === 'modes' ? 'SENKI & STORM GUIDE' : 'SHINOBI HUB'
        }
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "lobby3d-overlay lobby3d-theme-" + kind,
        role: "dialog",
        "aria-label": titleByGame[gameId].title,
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                ref: stageRef,
                className: "lobby3d-canvas-stage"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                className: "lobby3d-topbar",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "lobby3d-title-wrap",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                className: "lobby3d-back-btn",
                                onClick: onBack,
                                children: "◀ ARCADE"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "lobby3d-title",
                                children: titleByGame[gameId].title
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "lobby3d-badge",
                                children: titleByGame[gameId].badge
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                        className: "lobby3d-coins-pill",
                        children: [
                            "\uD83E\uDE99 ",
                            totalCoins
                        ]
                    })
                ]
            }),
            gameId === 25 && mobaStep === 'lobby' && /*#__PURE__*/ (0, _jsxruntime.jsx)("nav", {
                className: "lobby3d-subnav moba-subnav-7",
                "aria-label": "Legends Arena Lobbies",
                children: [
                    {
                        id: 'main',
                        label: '🏠 Home'
                    },
                    {
                        id: 'mode',
                        label: '⚔️ Modes'
                    },
                    {
                        id: 'store',
                        label: '🛒 Store'
                    },
                    {
                        id: 'events',
                        label: '🎉 Events'
                    },
                    {
                        id: 'prep',
                        label: '🛡️ Prep'
                    },
                    {
                        id: 'profile',
                        label: '👤 Profile'
                    },
                    {
                        id: 'settings',
                        label: '⚙️ Settings'
                    }
                ].map(function(tab) {
                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        className: "lobby3d-subnav-btn " + (mobaTab === tab.id ? 'active' : ''),
                        onClick: function onClick() {
                            _audio.ArcadeAudio.play('click');
                            setMobaTab(tab.id);
                        },
                        children: tab.label
                    }, tab.id);
                })
            }),
            gameId === 28 && /*#__PURE__*/ (0, _jsxruntime.jsx)("nav", {
                className: "lobby3d-subnav",
                "aria-label": "Naruto Senki and Storm Lobbies",
                children: [
                    {
                        id: 'hub',
                        label: '🏠 SHINOBI HUB'
                    },
                    {
                        id: 'roster',
                        label: "\uD83D\uDED2 SHINOBI ROSTER (" + _arenaRoster.NARUTO_SHINOBI_ROSTER.length + ")"
                    },
                    {
                        id: 'team',
                        label: '👥 TEAM & SUPPORTS'
                    },
                    {
                        id: 'modes',
                        label: '📜 MODES & GUIDE'
                    }
                ].map(function(tab) {
                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        className: "lobby3d-subnav-btn " + (narutoTab === tab.id ? 'active' : ''),
                        onClick: function onClick() {
                            _audio.ArcadeAudio.play('click');
                            setNarutoTab(tab.id);
                        },
                        children: tab.label
                    }, tab.id);
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "lobby3d-body " + (gameId === 27 ? 'lobby3d-body-hoops' : ''),
                children: [
                    gameId === 24 && renderBrLobby(),
                    gameId === 25 && renderMobaLobby(),
                    gameId === 26 && renderAsphaltLobby(),
                    gameId === 27 && renderHoopsLobby(),
                    gameId === 28 && renderNarutoLobby()
                ]
            })
        ]
    });
};

});

})(window.ArcadeMod);
