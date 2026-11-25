(function(ArcadeMod){
// === MODULE: src/games/mini-militia/MiniMilitiaShell ===
ArcadeMod.define("src/games/mini-militia/MiniMilitiaShell", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MiniMilitiaShell", {
    enumerable: true,
    get: function() {
        return MiniMilitiaShell;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _storage = require("./storage");
var _progression = require("./data/progression");
var _AudioEngine = require("./engine/AudioEngine");
var _MainLobby = require("./components/MainLobby");
var _AvatarAndArmoryModals = require("./components/AvatarAndArmoryModals");
var _ProfileSocialAndRooms = require("./components/ProfileSocialAndRooms");
var _SettingsAndHudEditor = require("./components/SettingsAndHudEditor");
var _BattleHUD = require("./components/BattleHUD");
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
function buildDefaultSlots(save, totalCount, playerTeam) {
    var _save_avatarPresets_save_activeAvatarPreset;
    var playerAvatar = (_save_avatarPresets_save_activeAvatarPreset = save.avatarPresets[save.activeAvatarPreset]) != null ? _save_avatarPresets_save_activeAvatarPreset : save.avatarPresets[0];
    var slots = [
        {
            id: 'player',
            name: save.callsign,
            team: playerTeam,
            isPlayer: true,
            ready: true,
            avatar: playerAvatar
        }
    ];
    for(var i = 1; i < totalCount; i++){
        var name = _progression.MM_BOT_NAMES[i % _progression.MM_BOT_NAMES.length];
        var team = i % 2 === 1 ? playerTeam === 'blue' ? 'red' : 'blue' : playerTeam;
        slots.push({
            id: "bot_" + i,
            name: name,
            team: team,
            isPlayer: false,
            ready: true,
            avatar: (0, _progression.makeRandomAvatar)(name)
        });
    }
    return slots;
}
var MiniMilitiaShell = function MiniMilitiaShell(param) {
    var onExitToArcade = param.onExitToArcade;
    var _useState = (0, _react.useState)(function() {
        var loaded = (0, _storage.loadMiniMilitiaSave)();
        _AudioEngine.mmAudio.setVolumes(loaded.settings.audio);
        return loaded;
    }), save = _useState[0], setSave = _useState[1];
    var _useState1 = (0, _react.useState)('lobby'), screen = _useState1[0], setScreen = _useState1[1];
    var _useState2 = (0, _react.useState)(null), activeModal = _useState2[0], setActiveModal = _useState2[1];
    var _useState3 = (0, _react.useState)(null), matchConfig = _useState3[0], setMatchConfig = _useState3[1];
    var _useState4 = (0, _react.useState)(null), lastSummary = _useState4[0], setLastSummary = _useState4[1];
    var updateSave = (0, _react.useCallback)(function(updater) {
        setSave(function(prev) {
            var next = updater(prev);
            (0, _storage.saveMiniMilitiaProfile)(next);
            return next;
        });
    }, []);
    (0, _react.useEffect)(function() {
        _AudioEngine.mmAudio.setVolumes(save.settings.audio);
    }, [
        save.settings.audio
    ]);
    var startMatch = (0, _react.useCallback)(function(cfg) {
        setMatchConfig(cfg);
        setLastSummary(null);
        setActiveModal(null);
        setScreen('battle');
    }, []);
    var handleQuickPlay = (0, _react.useCallback)(function() {
        var pTeam = save.preferredTeam === 'red' ? 'red' : 'blue';
        startMatch({
            mode: 'tdm',
            mapId: 'outpost',
            timeLimitSec: 300,
            scoreLimit: 25,
            botDifficulty: 'normal',
            classicV4: save.settings.gameplay.classicV4Default,
            mapDrops: true,
            friendlyFire: false,
            gravityMode: 'normal',
            nitroMode: '1x',
            slots: buildDefaultSlots(save, 6, pTeam)
        });
    }, [
        save,
        startMatch
    ]);
    var handleJoinOnlineRoom = (0, _react.useCallback)(function(room) {
        var pTeam = save.preferredTeam === 'red' ? 'red' : 'blue';
        startMatch({
            mode: room.mode,
            mapId: room.mapId,
            timeLimitSec: 360,
            scoreLimit: room.mode === 'ctf' ? 5 : 25,
            botDifficulty: room.difficulty,
            classicV4: room.classicV4,
            mapDrops: true,
            friendlyFire: false,
            gravityMode: 'normal',
            nitroMode: '1x',
            roomName: room.name,
            slots: buildDefaultSlots(save, Math.max(6, room.maxPlayers), pTeam)
        });
    }, [
        save,
        startMatch
    ]);
    var handleStartBootCamp = (0, _react.useCallback)(function() {
        startMatch({
            mode: 'bootcamp',
            mapId: 'outpost',
            timeLimitSec: 9999,
            scoreLimit: 7,
            botDifficulty: 'easy',
            classicV4: false,
            mapDrops: true,
            friendlyFire: false,
            gravityMode: 'normal',
            nitroMode: 'unlimited',
            slots: buildDefaultSlots(save, 1, 'blue')
        });
    }, [
        save,
        startMatch
    ]);
    var handleStartSurvival = (0, _react.useCallback)(function(coopAllies) {
        startMatch({
            mode: 'survival',
            mapId: 'outpost',
            timeLimitSec: 9999,
            scoreLimit: 999,
            botDifficulty: 'normal',
            classicV4: false,
            mapDrops: true,
            friendlyFire: false,
            gravityMode: 'normal',
            nitroMode: '1x',
            coopAllies: coopAllies,
            slots: buildDefaultSlots(save, 1, 'blue')
        });
    }, [
        save,
        startMatch
    ]);
    var handleMatchFinish = (0, _react.useCallback)(function(summary) {
        updateSave(function(prev) {
            return (0, _storage.applyMatchSummaryToSave)(prev, summary);
        });
        setLastSummary(summary);
        setScreen('post_match');
    }, [
        updateSave
    ]);
    var handlePlayNextMap = (0, _react.useCallback)(function(nextMapId) {
        if (!matchConfig) {
            setScreen('lobby');
            return;
        }
        startMatch(_extends({}, matchConfig, {
            mapId: nextMapId
        }));
    }, [
        matchConfig,
        startMatch
    ]);
    var handleRematch = (0, _react.useCallback)(function() {
        if (!matchConfig) {
            setScreen('lobby');
            return;
        }
        startMatch(_extends({}, matchConfig));
    }, [
        matchConfig,
        startMatch
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "fixed inset-0 z-50 w-screen h-screen bg-[#151B12] text-[#F4F4EC] overflow-hidden",
        children: [
            screen === 'lobby' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_MainLobby.MainLobby, {
                save: save,
                onExitToArcade: onExitToArcade,
                onQuickPlay: handleQuickPlay,
                onOpenOnlineBrowser: function onOpenOnlineBrowser() {
                    return setScreen('online_browser');
                },
                onOpenCustomRoom: function onOpenCustomRoom() {
                    return setScreen('custom_room');
                },
                onStartBootCamp: handleStartBootCamp,
                onStartSurvival: handleStartSurvival,
                onOpenModal: function onOpenModal(m) {
                    return setActiveModal(m);
                },
                onToggleMute: function onToggleMute() {
                    updateSave(function(prev) {
                        var nextMuted = !prev.settings.audio.muted;
                        var nextAudio = _extends({}, prev.settings.audio, {
                            muted: nextMuted
                        });
                        _AudioEngine.mmAudio.setVolumes(nextAudio);
                        return _extends({}, prev, {
                            settings: _extends({}, prev.settings, {
                                audio: nextAudio
                            })
                        });
                    });
                },
                onCycleTeamPref: function onCycleTeamPref() {
                    updateSave(function(prev) {
                        return _extends({}, prev, {
                            preferredTeam: prev.preferredTeam === 'auto' ? 'blue' : prev.preferredTeam === 'blue' ? 'red' : 'auto'
                        });
                    });
                },
                onToggleClassicV4: function onToggleClassicV4() {
                    updateSave(function(prev) {
                        return _extends({}, prev, {
                            settings: _extends({}, prev.settings, {
                                gameplay: _extends({}, prev.settings.gameplay, {
                                    classicV4Default: !prev.settings.gameplay.classicV4Default
                                })
                            })
                        });
                    });
                }
            }),
            screen === 'online_browser' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_ProfileSocialAndRooms.OnlineRoomBrowser, {
                save: save,
                onBack: function onBack() {
                    return setScreen('lobby');
                },
                onJoinRoom: handleJoinOnlineRoom,
                onCreateCustom: function onCreateCustom() {
                    return setScreen('custom_room');
                }
            }),
            screen === 'custom_room' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_ProfileSocialAndRooms.CustomRoomLobby, {
                save: save,
                initialConfig: matchConfig != null ? matchConfig : undefined,
                onBack: function onBack() {
                    return setScreen('lobby');
                },
                onStartMatch: startMatch
            }),
            screen === 'battle' && matchConfig && /*#__PURE__*/ (0, _jsxruntime.jsx)(_BattleHUD.BattleHUD, {
                config: matchConfig,
                save: save,
                onMatchFinish: handleMatchFinish,
                onExitToLobby: function onExitToLobby() {
                    return setScreen('lobby');
                },
                onOpenSettings: function onOpenSettings() {
                    return setActiveModal('settings');
                }
            }),
            screen === 'post_match' && lastSummary && /*#__PURE__*/ (0, _jsxruntime.jsx)(_ProfileSocialAndRooms.PostMatchSummaryView, {
                summary: lastSummary,
                save: save,
                onPlayNextMap: handlePlayNextMap,
                onRematch: handleRematch,
                onReturnLobby: function onReturnLobby() {
                    return setScreen('lobby');
                }
            }),
            activeModal === 'avatar' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarAndArmoryModals.AvatarStudioModal, {
                save: save,
                onUpdateSave: updateSave,
                onClose: function onClose() {
                    return setActiveModal(null);
                }
            }),
            activeModal === 'armory' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarAndArmoryModals.ArmoryModal, {
                save: save,
                onUpdateSave: updateSave,
                onClose: function onClose() {
                    return setActiveModal(null);
                }
            }),
            activeModal === 'store' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarAndArmoryModals.StoreModal, {
                save: save,
                onUpdateSave: updateSave,
                onClose: function onClose() {
                    return setActiveModal(null);
                }
            }),
            activeModal === 'friends' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_ProfileSocialAndRooms.FriendsModal, {
                save: save,
                onUpdateSave: updateSave,
                onClose: function onClose() {
                    return setActiveModal(null);
                }
            }),
            (activeModal === 'profile' || activeModal === 'achievements') && /*#__PURE__*/ (0, _jsxruntime.jsx)(_ProfileSocialAndRooms.ProfileAndMedalsModal, {
                save: save,
                initialTab: activeModal === 'achievements' ? 'achievements' : 'identity',
                onUpdateSave: updateSave,
                onClose: function onClose() {
                    return setActiveModal(null);
                }
            }),
            activeModal === 'leaderboards' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_ProfileSocialAndRooms.LeaderboardsModal, {
                save: save,
                onClose: function onClose() {
                    return setActiveModal(null);
                }
            }),
            activeModal === 'help' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_ProfileSocialAndRooms.HelpControlsModal, {
                onClose: function onClose() {
                    return setActiveModal(null);
                },
                onStartBootCamp: handleStartBootCamp
            }),
            activeModal === 'settings' && /*#__PURE__*/ (0, _jsxruntime.jsx)(_SettingsAndHudEditor.SettingsModal, {
                save: save,
                onUpdateSave: updateSave,
                onResetAllData: function onResetAllData() {
                    return setSave((0, _storage.resetMiniMilitiaSave)());
                },
                onReplayBootCamp: handleStartBootCamp,
                onClose: function onClose() {
                    return setActiveModal(null);
                }
            })
        ]
    });
};

});
// === MODULE: src/games/mini-militia/components/AvatarAndArmoryModals ===
ArcadeMod.define("src/games/mini-militia/components/AvatarAndArmoryModals", function(require, module, exports) {
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
    get ArmoryModal () {
        return ArmoryModal;
    },
    get AvatarStudioModal () {
        return AvatarStudioModal;
    },
    get StoreModal () {
        return StoreModal;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _progression = require("../data/progression");
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
var AvatarStudioModal = function AvatarStudioModal(param) {
    var save = param.save, onUpdateSave = param.onUpdateSave, onClose = param.onClose;
    var _save_avatarPresets_presetIdx;
    var _useState = (0, _react.useState)('headgear'), tab = _useState[0], setTab = _useState[1];
    var _useState1 = (0, _react.useState)('idle'), pose = _useState1[0], setPose = _useState1[1];
    var _useState2 = (0, _react.useState)(null), statusMsg = _useState2[0], setStatusMsg = _useState2[1];
    var presetIdx = save.activeAvatarPreset;
    var avatar = (_save_avatarPresets_presetIdx = save.avatarPresets[presetIdx]) != null ? _save_avatarPresets_presetIdx : save.avatarPresets[0];
    var isUnlocked = function isUnlocked(id, costCash) {
        return costCash === 0 || save.proPackUnlocked || save.unlockedCosmeticIds.includes(id);
    };
    var patchAvatar = function patchAvatar(patch) {
        onUpdateSave(function(prev) {
            var next = [].concat(prev.avatarPresets);
            next[prev.activeAvatarPreset] = _extends({}, next[prev.activeAvatarPreset], patch);
            return _extends({}, prev, {
                avatarPresets: next
            });
        });
    };
    var selectOrBuyCosmetic = function selectOrBuyCosmetic(field, id, costCash, label) {
        _AudioEngine.mmAudio.playClick();
        if (isUnlocked(id, costCash)) {
            var _obj;
            patchAvatar((_obj = {}, _obj[field] = id, _obj));
            setStatusMsg("Equipped " + label);
            return;
        }
        if (save.cash < costCash) {
            setStatusMsg("Need \uD83D\uDCB5 " + costCash + " Cash (or unlock Pro Pack in Store)");
            return;
        }
        onUpdateSave(function(prev) {
            var next = [].concat(prev.avatarPresets);
            var _obj;
            next[prev.activeAvatarPreset] = _extends({}, next[prev.activeAvatarPreset], (_obj = {}, _obj[field] = id, _obj));
            return _extends({}, prev, {
                cash: prev.cash - costCash,
                unlockedCosmeticIds: [].concat(prev.unlockedCosmeticIds, [
                    id
                ]),
                avatarPresets: next
            });
        });
        _AudioEngine.mmAudio.playPickup();
        setStatusMsg("Unlocked & Equipped " + label + "!");
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4",
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "w-full max-w-5xl max-h-[92vh] flex flex-col rounded border-2 border-[#5D7045] bg-[#1E2420] text-[#F4F4EC] shadow-2xl overflow-hidden",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex items-center justify-between px-4 py-2.5 bg-[#23272A] border-b border-[#4F5D3B]",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                    className: "text-base font-black uppercase tracking-wider text-[#F5A623]",
                                    children: "\uD83E\uDE96 AVATAR CUSTOMIZATION STUDIO"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("p", {
                                    className: "text-[11px] font-mono text-[#C2B280]",
                                    children: [
                                        "6 Saveable Presets \xb7 6 Tactical Layers \xb7 Cash: \uD83D\uDCB5 ",
                                        save.cash,
                                        save.proPackUnlocked ? ' · PRO PACK ALL UNLOCKED' : ''
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            onClick: onClose,
                            className: "px-3 py-1 rounded bg-[#D93829] hover:bg-[#EF4444] text-xs font-black uppercase",
                            children: "Done"
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-3 p-3 overflow-y-auto",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "md:col-span-4 flex flex-col gap-2",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "h-[235px]",
                                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.AvatarStudioCanvas, {
                                        avatar: avatar,
                                        pose: pose
                                    })
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "grid grid-cols-4 gap-1",
                                    children: [
                                        'idle',
                                        'crouch',
                                        'fly',
                                        'fire'
                                    ].map(function(p) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                _AudioEngine.mmAudio.playClick();
                                                setPose(p);
                                            },
                                            className: "py-1 rounded text-[11px] font-mono uppercase border " + (pose === p ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A] font-bold' : 'bg-[#23272A] text-[#C2B280] border-[#4F5D3B]'),
                                            children: p
                                        }, p);
                                    })
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-[10px] font-mono uppercase text-[#C2B280] mb-1",
                                            children: "SAVED PRESETS (1–6)"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid grid-cols-3 gap-1",
                                            children: save.avatarPresets.map(function(pr, idx) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    type: "button",
                                                    onClick: function onClick() {
                                                        _AudioEngine.mmAudio.playClick();
                                                        onUpdateSave(function(prev) {
                                                            return _extends({}, prev, {
                                                                activeAvatarPreset: idx
                                                            });
                                                        });
                                                    },
                                                    className: "px-2 py-1.5 rounded text-[11px] font-bold truncate border " + (presetIdx === idx ? 'bg-[#3E4A2E] border-[#F5A623] text-white' : 'bg-[#23272A] border-[#3E4A2E] text-[#C2B280]'),
                                                    children: [
                                                        "#",
                                                        idx + 1,
                                                        " ",
                                                        pr.name
                                                    ]
                                                }, idx);
                                            })
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex gap-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                _AudioEngine.mmAudio.playClick();
                                                var rnd = (0, _progression.makeRandomAvatar)(avatar.name);
                                                patchAvatar({
                                                    skinTone: rnd.skinTone,
                                                    eyeStyle: rnd.eyeStyle,
                                                    headgear: isUnlocked(rnd.headgear, 99) ? rnd.headgear : 'army_helmet',
                                                    eyewear: isUnlocked(rnd.eyewear, 99) ? rnd.eyewear : 'aviators',
                                                    facial: isUnlocked(rnd.facial, 99) ? rnd.facial : 'sarge_stache',
                                                    outfit: isUnlocked(rnd.outfit, 99) ? rnd.outfit : 'olive_camo',
                                                    boots: isUnlocked(rnd.boots, 99) ? rnd.boots : 'steel'
                                                });
                                            },
                                            className: "flex-1 py-1.5 rounded bg-[#2A3320] hover:bg-[#3A472D] border border-[#5D7045] text-xs font-bold",
                                            children: "\uD83C\uDFB2 Randomize"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                _AudioEngine.mmAudio.playClick();
                                                patchAvatar({
                                                    skinTone: '#F7CBA4',
                                                    eyeStyle: 'determined',
                                                    headgear: 'army_helmet',
                                                    eyewear: 'aviators',
                                                    facial: 'stubble',
                                                    outfit: 'olive_camo',
                                                    boots: 'steel'
                                                });
                                            },
                                            className: "px-3 py-1.5 rounded bg-[#23272A] hover:bg-[#32383D] border border-[#525D64] text-xs font-mono",
                                            children: "Reset"
                                        })
                                    ]
                                }),
                                statusMsg && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "text-[11px] font-mono text-[#F5A623] bg-[#161B15] px-2 py-1 rounded border border-[#4F5D3B]",
                                    children: statusMsg
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "md:col-span-8 flex flex-col gap-2 min-h-0",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "grid grid-cols-3 sm:grid-cols-6 gap-1",
                                    children: [
                                        {
                                            id: 'skin',
                                            label: 'Skin/Eyes'
                                        },
                                        {
                                            id: 'headgear',
                                            label: 'Headgear'
                                        },
                                        {
                                            id: 'eyewear',
                                            label: 'Eyewear'
                                        },
                                        {
                                            id: 'facial',
                                            label: 'Facial'
                                        },
                                        {
                                            id: 'outfit',
                                            label: 'Outfit'
                                        },
                                        {
                                            id: 'boots',
                                            label: 'Boots'
                                        }
                                    ].map(function(t) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                _AudioEngine.mmAudio.playClick();
                                                setTab(t.id);
                                            },
                                            className: "py-1.5 px-2 rounded text-xs font-black uppercase border " + (tab === t.id ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A]' : 'bg-[#23272A] text-[#C2B280] border-[#4F5D3B] hover:bg-[#2F363B]'),
                                            children: t.label
                                        }, t.id);
                                    })
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex-1 overflow-y-auto p-2 rounded bg-[#161B17] border border-[#3E4A2E]",
                                    children: [
                                        tab === 'skin' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-xs font-mono uppercase text-[#C2B280] mb-1.5",
                                                            children: "Skin Tone"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "grid grid-cols-3 sm:grid-cols-6 gap-2",
                                                            children: _progression.MM_SKIN_TONES.map(function(s) {
                                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                                    type: "button",
                                                                    onClick: function onClick() {
                                                                        return patchAvatar({
                                                                            skinTone: s.id
                                                                        });
                                                                    },
                                                                    className: "p-2 rounded border text-center " + (avatar.skinTone === s.id ? 'border-[#F5A623] bg-[#2A3320]' : 'border-[#3E4A2E] bg-[#23272A]'),
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                            className: "w-8 h-8 rounded-full mx-auto mb-1 border-2 border-[#111]",
                                                                            style: {
                                                                                backgroundColor: s.id
                                                                            }
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                            className: "text-[11px] font-bold",
                                                                            children: s.name
                                                                        })
                                                                    ]
                                                                }, s.id);
                                                            })
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-xs font-mono uppercase text-[#C2B280] mb-1.5",
                                                            children: "Eye Style"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "grid grid-cols-2 sm:grid-cols-3 gap-2",
                                                            children: _progression.MM_EYE_STYLES.map(function(e) {
                                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                    type: "button",
                                                                    onClick: function onClick() {
                                                                        return patchAvatar({
                                                                            eyeStyle: e.id
                                                                        });
                                                                    },
                                                                    className: "px-3 py-2 rounded border text-xs font-bold " + (avatar.eyeStyle === e.id ? 'border-[#F5A623] bg-[#3E4A2E] text-white' : 'border-[#3E4A2E] bg-[#23272A] text-[#C2B280]'),
                                                                    children: e.name
                                                                }, e.id);
                                                            })
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        tab === 'headgear' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid grid-cols-2 sm:grid-cols-3 gap-2",
                                            children: _progression.MM_HEADGEAR.map(function(item) {
                                                var unlocked = isUnlocked(item.id, item.costCash);
                                                var equipped = avatar.headgear === item.id;
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    type: "button",
                                                    onClick: function onClick() {
                                                        return selectOrBuyCosmetic('headgear', item.id, item.costCash, item.name);
                                                    },
                                                    className: "p-2.5 rounded border text-left transition " + (equipped ? 'border-[#F5A623] bg-[#3E4A2E]' : 'border-[#3E4A2E] bg-[#23272A] hover:border-[#C2B280]'),
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-xs font-bold",
                                                            children: item.name
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[10px] font-mono mt-0.5 text-[#C2B280]",
                                                            children: equipped ? '✓ EQUIPPED' : unlocked ? 'OWNED' : "\uD83D\uDD12 \uD83D\uDCB5 " + item.costCash
                                                        })
                                                    ]
                                                }, item.id);
                                            })
                                        }),
                                        tab === 'eyewear' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid grid-cols-2 sm:grid-cols-3 gap-2",
                                            children: _progression.MM_EYEWEAR.map(function(item) {
                                                var unlocked = isUnlocked(item.id, item.costCash);
                                                var equipped = avatar.eyewear === item.id;
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    type: "button",
                                                    onClick: function onClick() {
                                                        return selectOrBuyCosmetic('eyewear', item.id, item.costCash, item.name);
                                                    },
                                                    className: "p-2.5 rounded border text-left " + (equipped ? 'border-[#F5A623] bg-[#3E4A2E]' : 'border-[#3E4A2E] bg-[#23272A]'),
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-xs font-bold",
                                                            children: item.name
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[10px] font-mono mt-0.5 text-[#C2B280]",
                                                            children: equipped ? '✓ EQUIPPED' : unlocked ? 'OWNED' : "\uD83D\uDD12 \uD83D\uDCB5 " + item.costCash
                                                        })
                                                    ]
                                                }, item.id);
                                            })
                                        }),
                                        tab === 'facial' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid grid-cols-2 sm:grid-cols-3 gap-2",
                                            children: _progression.MM_FACIAL.map(function(item) {
                                                var unlocked = isUnlocked(item.id, item.costCash);
                                                var equipped = avatar.facial === item.id;
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    type: "button",
                                                    onClick: function onClick() {
                                                        return selectOrBuyCosmetic('facial', item.id, item.costCash, item.name);
                                                    },
                                                    className: "p-2.5 rounded border text-left " + (equipped ? 'border-[#F5A623] bg-[#3E4A2E]' : 'border-[#3E4A2E] bg-[#23272A]'),
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-xs font-bold",
                                                            children: item.name
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[10px] font-mono mt-0.5 text-[#C2B280]",
                                                            children: equipped ? '✓ EQUIPPED' : unlocked ? 'OWNED' : "\uD83D\uDD12 \uD83D\uDCB5 " + item.costCash
                                                        })
                                                    ]
                                                }, item.id);
                                            })
                                        }),
                                        tab === 'outfit' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid grid-cols-2 sm:grid-cols-3 gap-2",
                                            children: _progression.MM_OUTFITS.map(function(item) {
                                                var unlocked = isUnlocked(item.id, item.costCash);
                                                var equipped = avatar.outfit === item.id;
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    type: "button",
                                                    onClick: function onClick() {
                                                        return selectOrBuyCosmetic('outfit', item.id, item.costCash, item.name);
                                                    },
                                                    className: "p-2.5 rounded border text-left flex items-center gap-2 " + (equipped ? 'border-[#F5A623] bg-[#3E4A2E]' : 'border-[#3E4A2E] bg-[#23272A]'),
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "w-6 h-6 rounded border border-black shrink-0",
                                                            style: {
                                                                background: "linear-gradient(135deg, " + item.primary + " 55%, " + item.secondary + " 55%)"
                                                            }
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-xs font-bold",
                                                                    children: item.name
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-[10px] font-mono text-[#C2B280]",
                                                                    children: equipped ? '✓ EQUIPPED' : unlocked ? 'OWNED' : "\uD83D\uDD12 \uD83D\uDCB5 " + item.costCash
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }, item.id);
                                            })
                                        }),
                                        tab === 'boots' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid grid-cols-2 sm:grid-cols-3 gap-2",
                                            children: _progression.MM_BOOTS.map(function(item) {
                                                var unlocked = isUnlocked(item.id, item.costCash);
                                                var equipped = avatar.boots === item.id;
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    type: "button",
                                                    onClick: function onClick() {
                                                        return selectOrBuyCosmetic('boots', item.id, item.costCash, item.name);
                                                    },
                                                    className: "p-2.5 rounded border text-left flex items-center gap-2 " + (equipped ? 'border-[#F5A623] bg-[#3E4A2E]' : 'border-[#3E4A2E] bg-[#23272A]'),
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "w-6 h-6 rounded border border-black shrink-0",
                                                            style: {
                                                                background: "linear-gradient(180deg, " + item.color + " 55%, " + item.flame + " 55%)"
                                                            }
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-xs font-bold",
                                                                    children: item.name
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-[10px] font-mono text-[#C2B280]",
                                                                    children: equipped ? '✓ EQUIPPED' : unlocked ? 'OWNED' : "\uD83D\uDD12 \uD83D\uDCB5 " + item.costCash
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }, item.id);
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
};
var ArmoryModal = function ArmoryModal(param) {
    var save = param.save, onUpdateSave = param.onUpdateSave, onClose = param.onClose;
    var _save_customLoadouts_customIdx;
    var _useState = (0, _react.useState)('loadouts'), subTab = _useState[0], setSubTab = _useState[1];
    var _useState1 = (0, _react.useState)('m93ba'), selectedWeaponId = _useState1[0], setSelectedWeaponId = _useState1[1];
    var _useState2 = (0, _react.useState)('all'), weaponCat = _useState2[0], setWeaponCat = _useState2[1];
    var _useState3 = (0, _react.useState)(0), customIdx = _useState3[0], setCustomIdx = _useState3[1];
    var selectedWeapon = (0, _weapons.getMmWeaponById)(selectedWeaponId);
    var filteredWeapons = weaponCat === 'all' ? _weapons.MM_WEAPONS : _weapons.MM_WEAPONS.filter(function(w) {
        return w.category === weaponCat;
    });
    var activeCustom = (_save_customLoadouts_customIdx = save.customLoadouts[customIdx]) != null ? _save_customLoadouts_customIdx : save.customLoadouts[0];
    var updateCustomLoadout = function updateCustomLoadout(patch) {
        onUpdateSave(function(prev) {
            var next = [].concat(prev.customLoadouts);
            var merged = _extends({}, next[customIdx], patch);
            if (!(0, _weapons.canDualWieldPair)(merged.primaryId, merged.secondaryId)) {
                merged.dualWieldStart = false;
            }
            next[customIdx] = merged;
            return _extends({}, prev, {
                customLoadouts: next
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
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                    className: "text-base font-black uppercase tracking-wider text-[#F5A623]",
                                    children: "\uD83D\uDD2B TACTICAL ARMORY (25 WEAPONS \xb7 11 LOADOUTS)"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                    className: "text-[11px] font-mono text-[#C2B280]",
                                    children: "Dual Wielding \xb7 Off-Hand Riot Shield \xb7 4 Throwables \xb7 4 Special Perks"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex items-center gap-1.5",
                            children: [
                                [
                                    {
                                        id: 'loadouts',
                                        label: 'Loadouts (8)'
                                    },
                                    {
                                        id: 'custom',
                                        label: 'Custom Builder (3)'
                                    },
                                    {
                                        id: 'weapons',
                                        label: 'Weapons (25)'
                                    }
                                ].map(function(t) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            _AudioEngine.mmAudio.playClick();
                                            setSubTab(t.id);
                                        },
                                        className: "px-2.5 py-1 rounded text-xs font-black uppercase border " + (subTab === t.id ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A]' : 'bg-[#2A3320] text-[#C2B280] border-[#4F5D3B]'),
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
                        subTab === 'loadouts' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5",
                            children: [].concat(_weapons.MM_PREBUILT_LOADOUTS, save.customLoadouts).map(function(ld) {
                                var pW = (0, _weapons.getMmWeaponById)(ld.primaryId);
                                var sW = (0, _weapons.getMmWeaponById)(ld.secondaryId);
                                var perk = _weapons.MM_SPECIAL_PERKS.find(function(pk) {
                                    return pk.id === ld.perkId;
                                });
                                var gren = _weapons.MM_GRENADES.find(function(g) {
                                    return g.id === ld.grenadeId;
                                });
                                var equipped = save.activeLoadoutId === ld.id;
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p-3 rounded border-2 flex flex-col justify-between gap-2 " + (equipped ? 'border-[#F5A623] bg-[#2D3822]' : 'border-[#434F37] bg-[#23272A]'),
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex items-center justify-between gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "font-black text-sm text-[#F4F4EC]",
                                                            children: ld.name
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-[#181C1F] text-[#F5A623]",
                                                            children: ld.coinCost === 0 ? 'FREE' : "\uD83E\uDE99 " + ld.coinCost
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                    className: "text-[11px] text-[#C2B280] mt-0.5",
                                                    children: ld.desc
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex items-center gap-2 mt-2 bg-[#171B1E] p-1.5 rounded border border-[#36402B]",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.WeaponVectorIcon, {
                                                            weaponId: ld.primaryId,
                                                            width: 76,
                                                            height: 28
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "text-[11px] font-mono leading-tight",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-white font-bold",
                                                                    children: pW.shortName
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "text-[#9CA3AF]",
                                                                    children: [
                                                                        "+ ",
                                                                        sW.shortName,
                                                                        ld.dualWieldStart ? ' ⚡DW' : ''
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex items-center justify-between text-[10px] font-mono text-[#A8B498] mt-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            children: [
                                                                gren == null ? void 0 : gren.icon,
                                                                " ",
                                                                ld.grenadeCount,
                                                                "x ",
                                                                gren == null ? void 0 : gren.shortName
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            children: [
                                                                perk == null ? void 0 : perk.icon,
                                                                " ",
                                                                perk == null ? void 0 : perk.name
                                                            ]
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
                                                        activeLoadoutId: ld.id
                                                    });
                                                });
                                            },
                                            className: "w-full py-1.5 rounded text-xs font-black uppercase " + (equipped ? 'bg-[#22C55E] text-[#0F172A]' : 'bg-[#F5A623] hover:bg-[#FBBF24] text-[#181C1F]'),
                                            children: equipped ? '✓ ACTIVE LOADOUT' : 'EQUIP LOADOUT'
                                        })
                                    ]
                                }, ld.id);
                            })
                        }),
                        subTab === 'custom' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: [
                                        save.customLoadouts.map(function(cl, idx) {
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    _AudioEngine.mmAudio.playClick();
                                                    setCustomIdx(idx);
                                                },
                                                className: "px-3 py-1.5 rounded text-xs font-black uppercase border " + (customIdx === idx ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A]' : 'bg-[#23272A] text-[#C2B280] border-[#4F5D3B]'),
                                                children: cl.name
                                            }, cl.id);
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                _AudioEngine.mmAudio.playClick();
                                                onUpdateSave(function(prev) {
                                                    return _extends({}, prev, {
                                                        activeLoadoutId: activeCustom.id
                                                    });
                                                });
                                            },
                                            className: "ml-auto px-3 py-1.5 rounded bg-[#22C55E] text-[#0F172A] text-xs font-black uppercase",
                                            children: save.activeLoadoutId === activeCustom.id ? '✓ Equipped' : 'Set as Active'
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded bg-[#23272A] border border-[#4F5D3B]",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                    className: "block text-[11px] font-mono uppercase text-[#C2B280] mb-1",
                                                    children: "Primary Weapon (All 25)"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                    value: activeCustom.primaryId,
                                                    onChange: function onChange(e) {
                                                        return updateCustomLoadout({
                                                            primaryId: e.target.value
                                                        });
                                                    },
                                                    className: "w-full px-2.5 py-2 rounded bg-[#181C1F] border border-[#5D7045] text-sm text-white font-mono",
                                                    children: _weapons.MM_WEAPONS.map(function(w) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                            value: w.id,
                                                            children: [
                                                                w.name,
                                                                " (",
                                                                w.oneHanded ? '1H Dual' : '2H',
                                                                ") \xb7 DMG ",
                                                                w.damage
                                                            ]
                                                        }, w.id);
                                                    })
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                    className: "block text-[11px] font-mono uppercase text-[#C2B280] mb-1",
                                                    children: "Secondary / Off-Hand Weapon"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("select", {
                                                    value: activeCustom.secondaryId,
                                                    onChange: function onChange(e) {
                                                        return updateCustomLoadout({
                                                            secondaryId: e.target.value
                                                        });
                                                    },
                                                    className: "w-full px-2.5 py-2 rounded bg-[#181C1F] border border-[#5D7045] text-sm text-white font-mono",
                                                    children: _weapons.MM_WEAPONS.map(function(w) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("option", {
                                                            value: w.id,
                                                            children: [
                                                                w.name,
                                                                " (",
                                                                w.oneHanded ? '1H Dual' : '2H',
                                                                ")"
                                                            ]
                                                        }, w.id);
                                                    })
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center justify-between px-3 py-2 rounded bg-[#181C1F] border border-[#3E4A2E]",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-xs font-bold",
                                                            children: "Start Dual Wielding"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[10px] font-mono text-[#C2B280]",
                                                            children: (0, _weapons.canDualWieldPair)(activeCustom.primaryId, activeCustom.secondaryId) ? 'Valid 1-Handed / Riot Shield pair!' : 'Requires two 1-Handed weapons (max 1 Riot Shield).'
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    disabled: !(0, _weapons.canDualWieldPair)(activeCustom.primaryId, activeCustom.secondaryId),
                                                    checked: Boolean(activeCustom.dualWieldStart),
                                                    onChange: function onChange(e) {
                                                        return updateCustomLoadout({
                                                            dualWieldStart: e.target.checked
                                                        });
                                                    },
                                                    className: "w-5 h-5 accent-[#F5A623]"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                    className: "block text-[11px] font-mono uppercase text-[#C2B280] mb-1",
                                                    children: "Starting Throwable"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "grid grid-cols-4 gap-1",
                                                    children: _weapons.MM_GRENADES.map(function(g) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                            type: "button",
                                                            onClick: function onClick() {
                                                                return updateCustomLoadout({
                                                                    grenadeId: g.id
                                                                });
                                                            },
                                                            className: "py-1.5 rounded text-xs font-bold border " + (activeCustom.grenadeId === g.id ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A]' : 'bg-[#181C1F] text-[#C2B280] border-[#3E4A2E]'),
                                                            children: [
                                                                g.icon,
                                                                " ",
                                                                g.shortName
                                                            ]
                                                        }, g.id);
                                                    })
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "md:col-span-2",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                    className: "block text-[11px] font-mono uppercase text-[#C2B280] mb-1",
                                                    children: "Special Tactical Perk"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "grid grid-cols-1 sm:grid-cols-4 gap-2",
                                                    children: _weapons.MM_SPECIAL_PERKS.map(function(pk) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                            type: "button",
                                                            onClick: function onClick() {
                                                                return updateCustomLoadout({
                                                                    perkId: pk.id
                                                                });
                                                            },
                                                            className: "p-2 rounded border text-left " + (activeCustom.perkId === pk.id ? 'border-[#F5A623] bg-[#3E4A2E]' : 'border-[#3E4A2E] bg-[#181C1F]'),
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "text-xs font-black",
                                                                    children: [
                                                                        pk.icon,
                                                                        " ",
                                                                        pk.name
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-[10px] text-[#C2B280] mt-0.5",
                                                                    children: pk.desc
                                                                })
                                                            ]
                                                        }, pk.id);
                                                    })
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        subTab === 'weapons' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "grid grid-cols-1 lg:grid-cols-12 gap-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "lg:col-span-7 space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "flex flex-wrap gap-1",
                                            children: [
                                                {
                                                    id: 'all',
                                                    label: "All (" + _weapons.MM_WEAPONS.length + ")"
                                                },
                                                {
                                                    id: 'one_handed',
                                                    label: '1H / Dual Wield (10)'
                                                },
                                                {
                                                    id: 'rifle_sniper',
                                                    label: 'Rifles & Snipers (8)'
                                                },
                                                {
                                                    id: 'heavy_special',
                                                    label: 'Heavy & Special (7)'
                                                }
                                            ].map(function(c) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    onClick: function onClick() {
                                                        return setWeaponCat(c.id);
                                                    },
                                                    className: "px-2 py-1 rounded text-[11px] font-mono border " + (weaponCat === c.id ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A] font-bold' : 'bg-[#23272A] text-[#C2B280] border-[#4F5D3B]'),
                                                    children: c.label
                                                }, c.id);
                                            })
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[370px] overflow-y-auto pr-1",
                                            children: filteredWeapons.map(function(w) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    type: "button",
                                                    onClick: function onClick() {
                                                        _AudioEngine.mmAudio.playWeaponFire(w.id);
                                                        setSelectedWeaponId(w.id);
                                                    },
                                                    className: "p-2 rounded border text-left transition " + (selectedWeaponId === w.id ? 'border-[#F5A623] bg-[#334026]' : 'border-[#3E4A2E] bg-[#23272A] hover:border-[#C2B280]'),
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.WeaponVectorIcon, {
                                                            weaponId: w.id,
                                                            width: 80,
                                                            height: 28
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-xs font-bold truncate mt-1",
                                                            children: w.name
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "text-[10px] font-mono text-[#C2B280] flex justify-between",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    children: w.oneHanded ? '1H DUAL' : '2H'
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    className: "tabular-nums",
                                                                    children: [
                                                                        "DMG ",
                                                                        w.damage
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }, w.id);
                                            })
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "lg:col-span-5 p-3 rounded bg-[#23272A] border-2 border-[#4F5D3B] flex flex-col justify-between gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                                            className: "text-base font-black text-[#F5A623]",
                                                            children: selectedWeapon.name
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "text-[10px] font-mono px-2 py-0.5 rounded bg-[#181C1F] border border-[#5D7045] text-[#C2B280] uppercase",
                                                            children: selectedWeapon.fireMode
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "my-2 p-3 rounded bg-[#161B18] border border-[#3E4A2E] flex items-center justify-center",
                                                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.WeaponVectorIcon, {
                                                        weaponId: selectedWeapon.id,
                                                        width: 170,
                                                        height: 64
                                                    })
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                    className: "text-xs text-[#D6D3C4] mb-3",
                                                    children: selectedWeapon.desc
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "space-y-1.5 text-xs font-mono",
                                                    children: [
                                                        {
                                                            label: 'Damage',
                                                            val: "" + selectedWeapon.damage + (selectedWeapon.pellets > 1 ? " \xd7" + selectedWeapon.pellets : ''),
                                                            pct: Math.min(100, selectedWeapon.damage * selectedWeapon.pellets / 1.5)
                                                        },
                                                        {
                                                            label: 'Fire Rate',
                                                            val: "" + selectedWeapon.rpm + " RPM",
                                                            pct: Math.min(100, selectedWeapon.rpm / 12)
                                                        },
                                                        {
                                                            label: 'Magazine',
                                                            val: selectedWeapon.magSize + " / " + selectedWeapon.reserveMax,
                                                            pct: Math.min(100, selectedWeapon.magSize / 120 * 100)
                                                        },
                                                        {
                                                            label: 'Max Zoom',
                                                            val: "" + selectedWeapon.zoomMax.toFixed(1) + "x",
                                                            pct: Math.min(100, selectedWeapon.zoomMax / 7 * 100)
                                                        },
                                                        {
                                                            label: 'Mobility',
                                                            val: "" + Math.round(selectedWeapon.weightSpeedMult * 100) + "%",
                                                            pct: selectedWeapon.weightSpeedMult * 100
                                                        }
                                                    ].map(function(st) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "flex justify-between text-[11px]",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                            className: "text-[#C2B280]",
                                                                            children: st.label
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                            className: "tabular-nums font-bold",
                                                                            children: st.val
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "w-full h-1.5 bg-[#141719] rounded-sm overflow-hidden",
                                                                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                        className: "h-full bg-[#F5A623]",
                                                                        style: {
                                                                            width: "" + Math.max(8, st.pct) + "%"
                                                                        }
                                                                    })
                                                                })
                                                            ]
                                                        }, st.label);
                                                    })
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                return _AudioEngine.mmAudio.playWeaponFire(selectedWeapon.id);
                                            },
                                            className: "w-full py-2 rounded bg-[#2A3320] hover:bg-[#3A472D] border border-[#F5A623] text-xs font-black uppercase text-[#F5A623]",
                                            children: "\uD83D\uDD0A TEST FIRE SOUND"
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
};
var StoreModal = function StoreModal(param) {
    var save = param.save, onUpdateSave = param.onUpdateSave, onClose = param.onClose;
    var _useState = (0, _react.useState)(null), crateResult = _useState[0], setCrateResult = _useState[1];
    var spinCrate = function spinCrate() {
        if (save.coins < 200) {
            setCrateResult('Need 🪙 200 Coins to open a Supply Crate!');
            return;
        }
        _AudioEngine.mmAudio.playPickup();
        var locked = [].concat(_progression.MM_HEADGEAR.map(function(x) {
            return {
                id: x.id,
                name: x.name
            };
        }), _progression.MM_OUTFITS.map(function(x) {
            return {
                id: x.id,
                name: x.name
            };
        }), _progression.MM_BOOTS.map(function(x) {
            return {
                id: x.id,
                name: x.name
            };
        })).filter(function(x) {
            return !save.unlockedCosmeticIds.includes(x.id);
        });
        if (locked.length > 0) {
            var reward = locked[Math.floor(Math.random() * locked.length)];
            onUpdateSave(function(prev) {
                return _extends({}, prev, {
                    coins: prev.coins - 200,
                    unlockedCosmeticIds: [].concat(prev.unlockedCosmeticIds, [
                        reward.id
                    ])
                });
            });
            setCrateResult("\uD83C\uDF81 CRATE UNLOCKED: " + reward.name + "!");
        } else {
            onUpdateSave(function(prev) {
                return _extends({}, prev, {
                    coins: prev.coins - 200,
                    cash: prev.cash + 120
                });
            });
            setCrateResult('💵 JACKPOT DUPLICATE BONUS: +120 Military Cash!');
        }
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4",
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "w-full max-w-4xl max-h-[90vh] flex flex-col rounded border-2 border-[#5D7045] bg-[#1E2420] text-[#F4F4EC] shadow-2xl overflow-hidden",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex items-center justify-between px-4 py-2.5 bg-[#23272A] border-b border-[#4F5D3B]",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                    className: "text-base font-black uppercase tracking-wider text-[#F5A623]",
                                    children: "\uD83D\uDED2 QUARTERMASTER STORE"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("p", {
                                    className: "text-[11px] font-mono text-[#C2B280]",
                                    children: [
                                        "Coins: \uD83E\uDE99 ",
                                        save.coins.toLocaleString(),
                                        " \xb7 Cash: \uD83D\uDCB5 ",
                                        save.cash.toLocaleString(),
                                        " \xb7 Zero Real-Money Paywalls"
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            type: "button",
                            onClick: onClose,
                            className: "px-3 py-1 rounded bg-[#D93829] hover:bg-[#EF4444] text-xs font-black uppercase",
                            children: "Close"
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex-1 overflow-y-auto p-3 grid grid-cols-1 md:grid-cols-2 gap-3",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p-4 rounded border-2 border-[#F5A623] bg-gradient-to-b from-[#333B25] to-[#1D2318] flex flex-col justify-between gap-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-xs font-mono uppercase text-[#F5A623]",
                                            children: "SIGNATURE EDITION"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                            className: "text-lg font-black uppercase",
                                            children: "⭐ MINI MILITIA PRO PACK"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("ul", {
                                            className: "mt-2 space-y-1 text-xs text-[#E5E7EB]",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• Unlocks ALL 18 Headgear, 10 Eyewear, 10 Facial, 12 Outfits & 8 Rocket Boots"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• Dual-Wield & Heavy Weapon drops boosted in Custom Rooms"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("li", {
                                                    children: "• Earn with \uD83D\uDCB5 250 Cash OR activate instantly for free!"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "flex gap-2",
                                    children: save.proPackUnlocked ? /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "w-full py-2 rounded bg-[#22C55E] text-[#0F172A] text-center text-xs font-black uppercase",
                                        children: "✓ PRO PACK ACTIVE"
                                    }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                disabled: save.cash < 250,
                                                onClick: function onClick() {
                                                    _AudioEngine.mmAudio.playKillstreak();
                                                    onUpdateSave(function(prev) {
                                                        return _extends({}, prev, {
                                                            cash: Math.max(0, prev.cash - 250),
                                                            proPackUnlocked: true
                                                        });
                                                    });
                                                },
                                                className: "flex-1 py-2 rounded bg-[#F5A623] disabled:opacity-45 text-[#181C1F] text-xs font-black uppercase",
                                                children: "Unlock (\uD83D\uDCB5 250)"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    _AudioEngine.mmAudio.playKillstreak();
                                                    onUpdateSave(function(prev) {
                                                        return _extends({}, prev, {
                                                            proPackUnlocked: true
                                                        });
                                                    });
                                                },
                                                className: "px-3 py-2 rounded bg-[#2A3320] hover:bg-[#3A492C] border border-[#F5A623] text-xs font-black uppercase text-[#F5A623]",
                                                children: "Free Unlock"
                                            })
                                        ]
                                    })
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p-4 rounded border-2 border-[#4F5D3B] bg-[#23272A] flex flex-col justify-between gap-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-xs font-mono uppercase text-[#C2B280]",
                                            children: "DROP POD"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                            className: "text-lg font-black uppercase",
                                            children: "\uD83C\uDF81 TACTICAL SUPPLY CRATE"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                            className: "text-xs text-[#C2B280] mt-1",
                                            children: "Spend 200 Coins to roll an unowned Avatar Cosmetic or Military Cash bonus."
                                        }),
                                        crateResult && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "mt-2 p-2 rounded bg-[#161B18] border border-[#F5A623] text-xs font-mono text-[#F5A623]",
                                            children: crateResult
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    onClick: spinCrate,
                                    className: "w-full py-2 rounded bg-[#F5A623] hover:bg-[#FBBF24] text-[#181C1F] text-xs font-black uppercase",
                                    children: "OPEN CRATE (\uD83E\uDE99 200)"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "md:col-span-2 p-3 rounded bg-[#23272A] border border-[#4F5D3B]",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "text-xs font-black uppercase text-[#C2B280] mb-2",
                                    children: "TACTICAL BUNDLES & CAMO SKINS"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "grid grid-cols-1 sm:grid-cols-3 gap-2",
                                    children: [
                                        {
                                            id: 'skin_gold_ak',
                                            title: 'Gold-Plated AK-47',
                                            cost: 120,
                                            weaponId: 'ak47',
                                            tint: 'gold'
                                        },
                                        {
                                            id: 'skin_tiger_m93',
                                            title: 'Arctic Tiger M93BA',
                                            cost: 150,
                                            weaponId: 'm93ba',
                                            tint: 'arctic'
                                        },
                                        {
                                            id: 'skin_cyber_uzi',
                                            title: 'Neon Cyber Uzi',
                                            cost: 110,
                                            weaponId: 'uzi',
                                            tint: 'cyber'
                                        }
                                    ].map(function(sk) {
                                        var owned = Boolean(save.unlockedWeaponSkins[sk.weaponId]);
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-2.5 rounded bg-[#181C1F] border border-[#3E4A2E]",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.WeaponVectorIcon, {
                                                    weaponId: sk.weaponId,
                                                    width: 86,
                                                    height: 32
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-xs font-bold mt-1",
                                                    children: sk.title
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    disabled: owned || save.cash < sk.cost,
                                                    onClick: function onClick() {
                                                        _AudioEngine.mmAudio.playPickup();
                                                        onUpdateSave(function(prev) {
                                                            var _obj;
                                                            return _extends({}, prev, {
                                                                cash: prev.cash - sk.cost,
                                                                unlockedWeaponSkins: _extends({}, prev.unlockedWeaponSkins, (_obj = {}, _obj[sk.weaponId] = sk.tint, _obj))
                                                            });
                                                        });
                                                    },
                                                    className: "mt-2 w-full py-1 rounded text-[11px] font-black uppercase " + (owned ? 'bg-[#22C55E] text-[#0F172A]' : 'bg-[#2A3320] hover:bg-[#3A4A2B] border border-[#F5A623] text-[#F5A623] disabled:opacity-45'),
                                                    children: owned ? '✓ OWNED' : "BUY \xb7 \uD83D\uDCB5 " + sk.cost
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
        })
    });
};

});
// === MODULE: src/games/mini-militia/components/AvatarPreviewCanvas ===
ArcadeMod.define("src/games/mini-militia/components/AvatarPreviewCanvas", function(require, module, exports) {
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
    get AvatarPortraitBadge () {
        return AvatarPortraitBadge;
    },
    get AvatarStudioCanvas () {
        return AvatarStudioCanvas;
    },
    get LobbySoldierShowcase () {
        return LobbySoldierShowcase;
    },
    get MapPreviewCanvas () {
        return MapPreviewCanvas;
    },
    get RankInsigniaBadge () {
        return RankInsigniaBadge;
    },
    get WeaponVectorIcon () {
        return WeaponVectorIcon;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _DoodleRenderer = require("../engine/DoodleRenderer");
var _AudioEngine = require("../engine/AudioEngine");
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
var SARGE_QUIPS = [
    'LOCK AND LOAD!',
    'DROP AND GIVE ME 20!',
    'KEEP YOUR JETS HOT!',
    'WATCH THAT PROXY MINE!',
    'DUAL UZIS! MOVE OUT!',
    'NO MERCY IN OUTPOST!'
];
var LobbySoldierShowcase = function LobbySoldierShowcase(param) {
    var avatar = param.avatar, weaponId = param.weaponId, offhandWeaponId = param.offhandWeaponId, team = param.team, callsign = param.callsign, clanTag = param.clanTag;
    var canvasRef = (0, _react.useRef)(null);
    var actionRef = (0, _react.useRef)({
        kind: 'idle',
        timer: 0,
        quip: null
    });
    var _useState = (0, _react.useState)(0), tapCount = _useState[0], setTapCount = _useState[1];
    (0, _react.useEffect)(function() {
        var canvas = canvasRef.current;
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;
        var raf = 0;
        var t = 0;
        var last = performance.now();
        var draw = function draw1(now) {
            var dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            t += dt;
            var act = actionRef.current;
            if (act.timer > 0) {
                act.timer = Math.max(0, act.timer - dt);
                if (act.timer === 0) {
                    act.kind = 'idle';
                    act.quip = null;
                }
            }
            var w = canvas.width;
            var h = canvas.height;
            (0, _DoodleRenderer.drawParallaxBackground)(ctx, w, h, 'jungle', t * 18, 0, t, true);
            // Outpost rocky ledge foreground
            ctx.fillStyle = '#3B4230';
            ctx.fillRect(0, h - 52, w, 52);
            ctx.fillStyle = '#53623E';
            ctx.fillRect(0, h - 56, w, 9);
            ctx.strokeStyle = '#181E14';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, h - 56);
            ctx.lineTo(w, h - 56);
            ctx.stroke();
            // Sandbags & Ammo Crate prop on ledge
            ctx.fillStyle = '#8A795D';
            ctx.strokeStyle = '#1C1917';
            ctx.lineWidth = 2;
            for(var i = 0; i < 3; i++){
                ctx.beginPath();
                ctx.roundRect(26 + i * 24, h - 68, 28, 13, 6);
                ctx.fill();
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.roundRect(38, h - 79, 28, 13, 6);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#3E4A2E';
            ctx.fillRect(w - 86, h - 82, 46, 26);
            ctx.strokeRect(w - 86, h - 82, 46, 26);
            ctx.fillStyle = '#F5A623';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('AMMO', w - 76, h - 66);
            // Soldier animated pose
            var hoverY = act.kind === 'jet' ? -36 - Math.sin(t * 14) * 7 : Math.sin(t * 2.2) * 1.5;
            var aimAngle = act.kind === 'fire' ? -0.08 + Math.sin(t * 24) * 0.06 : act.kind === 'jet' ? -0.25 : Math.sin(t * 1.3) * 0.14 - 0.05;
            (0, _DoodleRenderer.drawDoodleSoldier)(ctx, {
                x: w * 0.5,
                y: h - 80 + hoverY,
                aimAngle: aimAngle,
                avatar: avatar,
                team: team,
                weaponId: weaponId,
                offhandWeaponId: offhandWeaponId,
                crouching: act.kind === 'crouch',
                jetpacking: act.kind === 'jet',
                walkPhase: act.kind === 'idle' ? 0 : t * 8,
                scale: 1.95,
                muzzleFlash: act.kind === 'fire' && Math.floor(t * 18) % 2 === 0 ? 1 : 0,
                speechText: act.quip,
                timeSec: t
            });
            // Subtle callsign stencil plate at bottom
            ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
            ctx.fillRect(w * 0.5 - 88, h - 36, 176, 24);
            ctx.strokeStyle = '#C2B280';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(w * 0.5 - 88, h - 36, 176, 24);
            ctx.fillStyle = '#F4F4EC';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            var label = clanTag ? "[" + clanTag + "] " + callsign : callsign;
            ctx.fillText(label.slice(0, 20), w * 0.5, h - 20);
            ctx.textAlign = 'left';
            raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);
        return function() {
            return cancelAnimationFrame(raf);
        };
    }, [
        avatar,
        weaponId,
        offhandWeaponId,
        team,
        callsign,
        clanTag
    ]);
    var handleTap = function handleTap() {
        var modes = [
            'fire',
            'jet',
            'crouch'
        ];
        var next = modes[tapCount % modes.length];
        var quip = SARGE_QUIPS[tapCount % SARGE_QUIPS.length];
        actionRef.current = {
            kind: next,
            timer: 1.85,
            quip: quip
        };
        setTapCount(function(c) {
            return c + 1;
        });
        if (next === 'fire') _AudioEngine.mmAudio.playWeaponFire(weaponId);
        else if (next === 'jet') _AudioEngine.mmAudio.playJetpackPulse();
        else _AudioEngine.mmAudio.playClick();
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        onClick: handleTap,
        role: "button",
        tabIndex: 0,
        onKeyDown: function onKeyDown(e) {
            if (e.key === 'Enter' || e.key === ' ') handleTap();
        },
        title: "Click soldier to fire burst, test jetpack & hear Sarge!",
        className: "relative w-full h-full min-h-[210px] rounded border-2 border-[#4F5D3B] bg-[#1D2418] overflow-hidden cursor-pointer select-none shadow-[inset_0_0_24px_rgba(0,0,0,0.65)] group",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("canvas", {
                ref: canvasRef,
                width: 380,
                height: 240,
                className: "w-full h-full object-cover block"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "absolute top-2 left-2 px-2 py-0.5 bg-[#1C2124]/85 border border-[#C2B280]/50 text-[10px] font-mono uppercase tracking-wider text-[#C2B280]",
                children: "OUTPOST BASE \xb7 TAP SOLDIER"
            })
        ]
    });
};
var AvatarStudioCanvas = function AvatarStudioCanvas(param) {
    var avatar = param.avatar, _param_weaponId = param.weaponId, weaponId = _param_weaponId === void 0 ? 'm4' : _param_weaponId, pose = param.pose, _param_team = param.team, team = _param_team === void 0 ? 'blue' : _param_team;
    var canvasRef = (0, _react.useRef)(null);
    (0, _react.useEffect)(function() {
        var canvas = canvasRef.current;
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;
        var raf = 0;
        var t = 0;
        var last = performance.now();
        var loop = function loop1(now) {
            var dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            t += dt;
            var w = canvas.width;
            var h = canvas.height;
            (0, _DoodleRenderer.drawParallaxBackground)(ctx, w, h, 'industrial', t * 10, 0, t, false);
            // Spotlight floor plate
            ctx.fillStyle = '#1E2429';
            ctx.fillRect(0, h - 38, w, 38);
            ctx.fillStyle = '#F5A623';
            ctx.fillRect(0, h - 41, w, 3);
            (0, _DoodleRenderer.drawDoodleSoldier)(ctx, {
                x: w * 0.5,
                y: h - 72 - (pose === 'fly' ? 28 + Math.sin(t * 10) * 6 : 0),
                aimAngle: pose === 'fire' ? -0.05 + Math.sin(t * 20) * 0.04 : -0.08,
                avatar: avatar,
                team: team,
                weaponId: weaponId,
                crouching: pose === 'crouch',
                jetpacking: pose === 'fly',
                muzzleFlash: pose === 'fire' && Math.floor(t * 16) % 2 === 0 ? 1 : 0,
                scale: 2.25,
                timeSec: t
            });
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return function() {
            return cancelAnimationFrame(raf);
        };
    }, [
        avatar,
        weaponId,
        pose,
        team
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("canvas", {
        ref: canvasRef,
        width: 260,
        height: 240,
        className: "w-full h-full rounded border-2 border-[#4F5D3B] bg-[#181C1F] block"
    });
};
var AvatarPortraitBadge = function AvatarPortraitBadge(param) {
    var avatar = param.avatar, _param_size = param.size, size = _param_size === void 0 ? 46 : _param_size;
    var ref = (0, _react.useRef)(null);
    (0, _react.useEffect)(function() {
        var c = ref.current;
        if (!c) return;
        var ctx = c.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, c.width, c.height);
        var grad = ctx.createRadialGradient(32, 28, 6, 32, 32, 34);
        grad.addColorStop(0, '#4E5D3B');
        grad.addColorStop(1, '#1E2419');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        (0, _DoodleRenderer.drawDoodleSoldier)(ctx, {
            x: 30,
            y: 62,
            aimAngle: -0.1,
            avatar: avatar,
            team: 'blue',
            weaponId: 'pistol',
            scale: 1.38,
            timeSec: 0
        });
    }, [
        avatar
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("canvas", {
        ref: ref,
        width: 64,
        height: 64,
        style: {
            width: size,
            height: size
        },
        className: "rounded-full border-2 border-[#F5A623] bg-[#22281D] shrink-0 shadow-md"
    });
};
var WeaponVectorIcon = function WeaponVectorIcon(param) {
    var weaponId = param.weaponId, _param_width = param.width, width = _param_width === void 0 ? 88 : _param_width, _param_height = param.height, height = _param_height === void 0 ? 34 : _param_height;
    var ref = (0, _react.useRef)(null);
    (0, _react.useEffect)(function() {
        var c = ref.current;
        if (!c) return;
        var ctx = c.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.save();
        ctx.translate(c.width * 0.34, c.height * 0.54);
        ctx.scale(1.15, 1.15);
        (0, _DoodleRenderer.drawWeaponVector)(ctx, weaponId, 0, 0);
        ctx.restore();
    }, [
        weaponId
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("canvas", {
        ref: ref,
        width: 110,
        height: 42,
        style: {
            width: width,
            height: height
        },
        className: "block shrink-0"
    });
};
var MapPreviewCanvas = function MapPreviewCanvas(param) {
    var map = param.map, _param_width = param.width, width = _param_width === void 0 ? 240 : _param_width, _param_height = param.height, height = _param_height === void 0 ? 128 : _param_height, _param_className = param.className, className = _param_className === void 0 ? '' : _param_className;
    var ref = (0, _react.useRef)(null);
    (0, _react.useEffect)(function() {
        var c = ref.current;
        if (!c) return;
        var ctx = c.getContext('2d');
        if (!ctx) return;
        (0, _DoodleRenderer.drawMapMiniSilhouette)(ctx, map, c.width, c.height);
    }, [
        map
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("canvas", {
        ref: ref,
        width: width,
        height: height,
        className: "rounded border border-[#4F5D3B] bg-[#181C1F] block " + className
    });
};
var RankInsigniaBadge = function RankInsigniaBadge(param) {
    var rank = param.rank, _param_size = param.size, size = _param_size === void 0 ? 24 : _param_size;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
        width: size,
        height: size,
        viewBox: "0 0 28 28",
        className: "shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]",
        "aria-label": rank.title,
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                x: "2",
                y: "2",
                width: "24",
                height: "24",
                rx: "4",
                fill: "#1C2124",
                stroke: rank.color,
                strokeWidth: "1.8"
            }),
            rank.insigniaType === 'chevron' && Array.from({
                length: Math.min(rank.tierCount, 4)
            }).map(function(_, i) {
                return /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                    d: "M7 " + (18 - i * 3.5) + " L14 " + (13 - i * 3.5) + " L21 " + (18 - i * 3.5),
                    fill: "none",
                    stroke: rank.color,
                    strokeWidth: "2.2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                }, i);
            }),
            rank.insigniaType === 'bar' && Array.from({
                length: rank.tierCount
            }).map(function(_, i) {
                return /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                    x: rank.tierCount === 1 ? 11 : 7 + i * 9,
                    y: "6",
                    width: "6",
                    height: "16",
                    rx: "1",
                    fill: rank.color
                }, i);
            }),
            rank.insigniaType === 'leaf' && /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                d: "M14 5 L17 11 L22 11 L18 16 L19 22 L14 19 L9 22 L10 16 L6 11 L11 11 Z",
                fill: rank.color
            }),
            rank.insigniaType === 'eagle' && /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                d: "M5 12 Q14 7 23 12 L20 17 L14 14 L8 17 Z M14 7 L16 11 L12 11 Z",
                fill: rank.color
            }),
            (rank.insigniaType === 'star' || rank.insigniaType === 'commander') && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("polygon", {
                        points: "14,5 16.5,11 23,11.5 18,15.8 19.6,22 14,18.5 8.4,22 10,15.8 5,11.5 11.5,11",
                        fill: rank.color
                    }),
                    rank.tierCount > 1 && /*#__PURE__*/ (0, _jsxruntime.jsx)("text", {
                        x: "14",
                        y: "17",
                        textAnchor: "middle",
                        fontSize: "8",
                        fontWeight: "bold",
                        fill: "#181C1F",
                        children: rank.tierCount
                    })
                ]
            })
        ]
    });
};

});

})(window.ArcadeMod);
