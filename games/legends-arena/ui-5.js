(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/components/BattleHUD ===
ArcadeMod.define("src/games/legends-arena/mlbb/components/BattleHUD", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BattleHUD", {
    enumerable: true,
    get: function() {
        return BattleHUD;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _items = require("../data/items");
var _emblems = require("../data/emblems");
var _mapData = require("../data/mapData");
var _heroes = require("../data/heroes");
var _CombatMath = require("../engine/CombatMath");
var _GameEngine = require("../engine/GameEngine");
var _HeroAvatarSvg = require("./HeroAvatarSvg");
var _InMatchOverlays = require("./InMatchOverlays");
var _SettingsAndCustomUi = require("./SettingsAndCustomUi");
var _ExpandedMinimap = require("./ExpandedMinimap");
var _DeathRecapModal = require("./DeathRecapModal");
var _HudWidgets = require("./HudWidgets");
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
function _instanceof(left, right) {
    "@swc/helpers - instanceof";
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else return left instanceof right;
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
var BattleHUD = function BattleHUD(param) {
    var config = param.config, profile = param.profile, onUpdateSettings = param.onUpdateSettings, onMatchEnd = param.onMatchEnd, onExitToLobby = param.onExitToLobby;
    var _ref, _ref1, _ref2, _ref3, _dragPingState_previewColor, _dragPingState_previewIcon, _dragPingState_previewIcon1, _snap_practiceCheats_dummyDps, _snap_practiceCheats_dummyPeakBurst, _snap_practiceCheats_dummyLastHit, _snap_practiceCheats_dummyTotalDmg, _ref4, _ref5, _snap_player_deathRecap_totalCcSec;
    var _customLayout_shopBar, _customLayout_shopBar1, _customLayout_pings, _customLayout_pings1, _customLayout_joystick, _customLayout_joystick1;
    var canvasRef = (0, _react.useRef)(null);
    var threeHostRef = (0, _react.useRef)(null);
    var minimapRef = (0, _react.useRef)(null);
    var engineRef = (0, _react.useRef)(null);
    var _useState = (0, _react.useState)(null), snap = _useState[0], setSnap = _useState[1];
    var _useState1 = (0, _react.useState)(false), shopOpen = _useState1[0], setShopOpen = _useState1[1];
    var _useState2 = (0, _react.useState)(false), scoreboardOpen = _useState2[0], setScoreboardOpen = _useState2[1];
    var _useState3 = (0, _react.useState)(false), settingsOpen = _useState3[0], setSettingsOpen = _useState3[1];
    var _useState4 = (0, _react.useState)(false), minimapExpanded = _useState4[0], setMinimapExpanded = _useState4[1];
    var _useState5 = (0, _react.useState)(false), deathRecapOpen = _useState5[0], setDeathRecapOpen = _useState5[1];
    var _useState6 = (0, _react.useState)(false), chatDrawerOpen = _useState6[0], setChatDrawerOpen = _useState6[1];
    var _useState7 = (0, _react.useState)(''), customChatText = _useState7[0], setCustomChatText = _useState7[1];
    var _useState8 = (0, _react.useState)(false), emoteWheelOpen = _useState8[0], setEmoteWheelOpen = _useState8[1];
    var _useState9 = (0, _react.useState)(false), micOn = _useState9[0], setMicOn = _useState9[1];
    var _useState10 = (0, _react.useState)(true), speakerOn = _useState10[0], setSpeakerOn = _useState10[1];
    var _useState11 = (0, _react.useState)(config.mode === 'practice'), practiceOpen = _useState11[0], setPracticeOpen = _useState11[1];
    // Press-and-Hold Drag-to-Mark Pop-Out Tactical Mini-Map state (140ms hold OR >10px drag threshold!)
    var pingPopupCanvasRef = (0, _react.useRef)(null);
    var pingHoldTimerRef = (0, _react.useRef)(null);
    var _useState12 = (0, _react.useState)(null), dragPingState = _useState12[0], setDragPingState = _useState12[1];
    // Direct top-left minimap camera scouting drag ref
    var minimapDragRef = (0, _react.useRef)(null);
    // Delayed catch-up HUD HP bar & cooldown completion pop
    var _useState13 = (0, _react.useState)(100), hudHpTrailPct = _useState13[0], setHudHpTrailPct = _useState13[1];
    var prevSkillCdsRef = (0, _react.useRef)([
        0,
        0,
        0
    ]);
    var _useState14 = (0, _react.useState)({}), readyPopSlots = _useState14[0], setReadyPopSlots = _useState14[1];
    // Multi-touch virtual joystick state (supports BOTH Fixed & Floating modes)
    var joyOriginRef = (0, _react.useRef)(null);
    var _useState15 = (0, _react.useState)({
        x: 0,
        y: 0,
        active: false
    }), joyKnob = _useState15[0], setJoyKnob = _useState15[1];
    var _useState16 = (0, _react.useState)(null), floatingJoyCenter = _useState16[0], setFloatingJoyCenter = _useState16[1];
    // Skill drag-aiming + Cancel Cast + Drag-to-Signal CD drop target state
    var signalDropRef = (0, _react.useRef)(null);
    var cancelDropRef = (0, _react.useRef)(null);
    var skillDragRef = (0, _react.useRef)(null);
    var _useState17 = (0, _react.useState)(null), activeAimSlot = _useState17[0], setActiveAimSlot = _useState17[1];
    var _useState18 = (0, _react.useState)(false), cancelHover = _useState18[0], setCancelHover = _useState18[1];
    var _useState19 = (0, _react.useState)(false), signalHover = _useState19[0], setSignalHover = _useState19[1];
    // Free camera pan state
    var panOriginRef = (0, _react.useRef)(null);
    // Mount & start decoupled 60 FPS MlbbGameEngine
    (0, _react.useEffect)(function() {
        var canvas = canvasRef.current;
        if (!canvas) return;
        var engine = new _GameEngine.MlbbGameEngine(canvas, config, profile.settings, function(nextSnap) {
            setSnap(nextSnap);
        }, function(record) {
            onMatchEnd(record);
        });
        engineRef.current = engine;
        if (threeHostRef.current) engine.attachThreeContainer(threeHostRef.current);
        if (minimapRef.current) engine.attachMinimapCanvas(minimapRef.current);
        engine.start();
        return function() {
            if (pingHoldTimerRef.current !== null) window.clearTimeout(pingHoldTimerRef.current);
            engine.destroy();
            engineRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        config
    ]);
    (0, _react.useEffect)(function() {
        var _engineRef_current;
        (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.attachMinimapCanvas(minimapRef.current);
    }, [
        snap !== null
    ]);
    (0, _react.useEffect)(function() {
        if ((dragPingState == null ? void 0 : dragPingState.popupOpen) && pingPopupCanvasRef.current && !minimapExpanded) {
            var _engineRef_current;
            (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.attachExtraMinimapCanvas(pingPopupCanvasRef.current);
            return function() {
                var _engineRef_current;
                (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.attachExtraMinimapCanvas(null);
            };
        }
    }, [
        dragPingState == null ? void 0 : dragPingState.popupOpen,
        minimapExpanded
    ]);
    (0, _react.useEffect)(function() {
        var _engineRef_current;
        (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.updateSettings(profile.settings);
    }, [
        profile.settings
    ]);
    // Animate delayed catch-up HUD HP bar & detect skill cooldown completion pop
    (0, _react.useEffect)(function() {
        if (!snap) return;
        var livePct = Math.max(0, Math.min(100, snap.player.hp / Math.max(1, snap.player.maxHp) * 100));
        setHudHpTrailPct(function(prev) {
            return livePct >= prev ? livePct : Math.max(livePct, prev - (prev - livePct) * 0.16 - 0.35);
        });
        var prevCds = prevSkillCdsRef.current;
        var now = Date.now();
        snap.skills.forEach(function(sk, i) {
            if (prevCds[i] > 0.05 && sk.cd <= 0 && sk.level > 0) {
                setReadyPopSlots(function(p) {
                    var _obj;
                    return _extends({}, p, (_obj = {}, _obj[sk.slot] = now, _obj));
                });
            }
            prevCds[i] = sk.cd;
        });
    }, [
        snap
    ]);
    // Desktop keyboard controls: WASD/Arrows Move, Q/E/R/V/X/F Skills & Spell, Space/Z/C Attacks, B/G/P/Tab/M/T/1-4
    (0, _react.useEffect)(function() {
        var keys = new Set();
        var syncMove = function syncMove() {
            var _engineRef_current;
            var x = 0;
            var y = 0;
            if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
            if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
            if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
            if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
            (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setMoveVector(x, y);
        };
        var onKeyDown = function onKeyDown(e) {
            if (_instanceof(e.target, HTMLInputElement) || _instanceof(e.target, HTMLTextAreaElement)) return;
            if ([
                'KeyW',
                'KeyA',
                'KeyS',
                'KeyD',
                'ArrowUp',
                'ArrowDown',
                'ArrowLeft',
                'ArrowRight'
            ].includes(e.code)) {
                keys.add(e.code);
                syncMove();
            } else if (e.code === 'Space') {
                var _engineRef_current;
                e.preventDefault();
                (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setHoldingAttack(true, 'hero');
            } else if (e.code === 'KeyZ') {
                var _engineRef_current1;
                (_engineRef_current1 = engineRef.current) == null ? void 0 : _engineRef_current1.setHoldingAttack(true, 'minion');
            } else if (e.code === 'KeyC') {
                var _engineRef_current2;
                (_engineRef_current2 = engineRef.current) == null ? void 0 : _engineRef_current2.setHoldingAttack(true, 'turret');
            } else if (e.code === 'KeyM') {
                setMinimapExpanded(function(v) {
                    return !v;
                });
            } else if (e.code === 'KeyQ') {
                var _engineRef_current3, _engineRef_current4;
                if (e.altKey || e.shiftKey) (_engineRef_current3 = engineRef.current) == null ? void 0 : _engineRef_current3.signalSkillStatus(1);
                else (_engineRef_current4 = engineRef.current) == null ? void 0 : _engineRef_current4.castPlayerSkill(1);
            } else if (e.code === 'KeyE') {
                var _engineRef_current5, _engineRef_current6;
                if (e.altKey || e.shiftKey) (_engineRef_current5 = engineRef.current) == null ? void 0 : _engineRef_current5.signalSkillStatus(2);
                else (_engineRef_current6 = engineRef.current) == null ? void 0 : _engineRef_current6.castPlayerSkill(2);
            } else if (e.code === 'KeyR') {
                var _engineRef_current7, _engineRef_current8;
                if (e.altKey || e.shiftKey) (_engineRef_current7 = engineRef.current) == null ? void 0 : _engineRef_current7.signalSkillStatus(3);
                else (_engineRef_current8 = engineRef.current) == null ? void 0 : _engineRef_current8.castPlayerSkill(3);
            } else if (e.code === 'KeyV') {
                var _engineRef_current9, _engineRef_current10;
                if (e.altKey || e.shiftKey) (_engineRef_current9 = engineRef.current) == null ? void 0 : _engineRef_current9.signalSkill4Status();
                else (_engineRef_current10 = engineRef.current) == null ? void 0 : _engineRef_current10.castPlayerSkill4();
            } else if (e.code === 'KeyX') {
                var _engineRef_current11;
                (_engineRef_current11 = engineRef.current) == null ? void 0 : _engineRef_current11.triggerActiveItem();
            } else if (e.code === 'KeyF') {
                var _engineRef_current12, _engineRef_current13;
                if (e.altKey || e.shiftKey) (_engineRef_current12 = engineRef.current) == null ? void 0 : _engineRef_current12.signalSpellStatus();
                else (_engineRef_current13 = engineRef.current) == null ? void 0 : _engineRef_current13.castPlayerSpell();
            } else if (e.code === 'KeyB') {
                var _engineRef_current14;
                (_engineRef_current14 = engineRef.current) == null ? void 0 : _engineRef_current14.triggerRecall();
            } else if (e.code === 'KeyG') {
                var _engineRef_current15;
                (_engineRef_current15 = engineRef.current) == null ? void 0 : _engineRef_current15.triggerRegen();
            } else if (e.code === 'KeyP') {
                setShopOpen(function(v) {
                    return !v;
                });
            } else if (e.code === 'Tab') {
                e.preventDefault();
                setScoreboardOpen(function(v) {
                    return !v;
                });
            } else if (e.code === 'KeyT') {
                setEmoteWheelOpen(function(v) {
                    return !v;
                });
            } else if ([
                'Digit1',
                'Digit2',
                'Digit3',
                'Digit4'
            ].includes(e.code)) {
                var _engineRef_current16;
                var idx = Number(e.code.replace('Digit', '')) - 1;
                var emId = profile.equippedEmotes[idx];
                if (emId) (_engineRef_current16 = engineRef.current) == null ? void 0 : _engineRef_current16.triggerEmote(emId);
            } else if (e.code === 'Escape') {
                if (minimapExpanded) setMinimapExpanded(false);
                else if (deathRecapOpen) setDeathRecapOpen(false);
                else if (chatDrawerOpen) setChatDrawerOpen(false);
                else setSettingsOpen(function(v) {
                    return !v;
                });
            }
        };
        var onKeyUp = function onKeyUp(e) {
            if (keys.has(e.code)) {
                keys.delete(e.code);
                syncMove();
            } else if (e.code === 'Space') {
                var _engineRef_current;
                (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setHoldingAttack(false, 'hero');
            } else if (e.code === 'KeyZ') {
                var _engineRef_current1;
                (_engineRef_current1 = engineRef.current) == null ? void 0 : _engineRef_current1.setHoldingAttack(false, 'minion');
            } else if (e.code === 'KeyC') {
                var _engineRef_current2;
                (_engineRef_current2 = engineRef.current) == null ? void 0 : _engineRef_current2.setHoldingAttack(false, 'turret');
            }
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return function() {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [
        profile.equippedEmotes,
        minimapExpanded,
        deathRecapOpen,
        chatDrawerOpen
    ]);
    var uiOpacity = Math.max(0.25, Math.min(1, profile.settings.interface.battlefieldUiOpacity / 100));
    var customLayout = profile.settings.interface.activeSkillPreset === '4skill' ? profile.settings.interface.customUi4Skill : profile.settings.interface.customUi3Skill;
    var isFloatingJoystick = profile.settings.controls.joystickPosition === 'floating';
    var playerBuilds = (0, _react.useMemo)(function() {
        var _profile_savedBuilds_config_playerHeroId;
        var hero = (0, _heroes.getMlbbHeroById)(config.playerHeroId);
        return (_profile_savedBuilds_config_playerHeroId = profile.savedBuilds[config.playerHeroId]) != null ? _profile_savedBuilds_config_playerHeroId : [
            hero.recommendedBuild,
            hero.recommendedBuild,
            hero.recommendedBuild
        ];
    }, [
        config.playerHeroId,
        profile.savedBuilds
    ]);
    var hasBargainHunter = config.playerTalents.t2 === 'bargain_hunter';
    var quickBuyItems = (0, _react.useMemo)(function() {
        var _playerBuilds_snap_player_activeBuildIdx;
        if (!snap) return [];
        var activePlan = (_playerBuilds_snap_player_activeBuildIdx = playerBuilds[snap.player.activeBuildIdx]) != null ? _playerBuilds_snap_player_activeBuildIdx : playerBuilds[0];
        return (0, _items.computeMlbbQuickBuy)(activePlan, snap.player.items, snap.player.gold, snap.player.prioritizedItemId, hasBargainHunter ? 0.05 : 0);
    }, [
        snap,
        playerBuilds,
        hasBargainHunter
    ]);
    // Center-anchored HUD control helper (reads saved Custom UI layout coordinates, scale & opacity)
    var getCtrlStyle = function getCtrlStyle(id, fallback, aliasId) {
        var _customLayout_id, _ref, _ref1, _ref2, _ref3;
        var cfg = (_customLayout_id = customLayout[id]) != null ? _customLayout_id : aliasId ? customLayout[aliasId] : undefined;
        var x = (_ref = cfg == null ? void 0 : cfg.xPct) != null ? _ref : fallback.xPct;
        var y = (_ref1 = cfg == null ? void 0 : cfg.yPct) != null ? _ref1 : fallback.yPct;
        var scale = (_ref2 = cfg == null ? void 0 : cfg.scale) != null ? _ref2 : 1;
        var op = ((_ref3 = cfg == null ? void 0 : cfg.opacity) != null ? _ref3 : 1) * uiOpacity;
        return {
            left: "" + x + "%",
            top: "" + y + "%",
            transform: "translate(-50%, -50%) scale(" + scale + ")",
            opacity: op
        };
    };
    // Top-left anchored HUD container helper (for minimap & quick-buy)
    var getTopLeftStyle = function getTopLeftStyle(id, fallback) {
        var _ref, _ref1, _ref2, _ref3;
        var cfg = customLayout[id];
        var x = (_ref = cfg == null ? void 0 : cfg.xPct) != null ? _ref : fallback.xPct;
        var y = (_ref1 = cfg == null ? void 0 : cfg.yPct) != null ? _ref1 : fallback.yPct;
        var scale = (_ref2 = cfg == null ? void 0 : cfg.scale) != null ? _ref2 : 1;
        var op = ((_ref3 = cfg == null ? void 0 : cfg.opacity) != null ? _ref3 : 1) * uiOpacity;
        return {
            left: "" + x + "%",
            top: "" + y + "%",
            transform: "scale(" + scale + ")",
            transformOrigin: 'top left',
            opacity: op
        };
    };
    // Drag-aim handlers for skills (1/2/3/4) & Battle Spell with Cancel Zone + Drag-to-Signal CD drop zone
    var startSkillDrag = function startSkillDrag(e, slot, range, radius, shape) {
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        skillDragRef.current = {
            slot: slot,
            startX: e.clientX,
            startY: e.clientY,
            angle: 0,
            dist: range * 0.65,
            cancelHover: false,
            signalHover: false,
            moved: false
        };
        setActiveAimSlot(slot);
        setCancelHover(false);
        setSignalHover(false);
        if (slot !== 4) {
            var _engineRef_current;
            (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setAimPreview({
                active: true,
                slot: slot,
                range: range,
                radius: radius,
                shape: shape,
                cancelHover: false
            });
        }
    };
    var isInsideRect = function isInsideRect(x, y, el, pad) {
        if (pad === void 0) pad = 12;
        if (!el) return false;
        var r = el.getBoundingClientRect();
        return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
    };
    var moveSkillDrag = function moveSkillDrag(e, range) {
        var _profile_settings_controls_skillCancelMethod;
        var drag = skillDragRef.current;
        if (!drag) return;
        var dx = e.clientX - drag.startX;
        var dy = e.clientY - drag.startY;
        var mag = Math.hypot(dx, dy);
        if (mag > 12) {
            drag.moved = true;
            drag.angle = Math.atan2(dy, dx);
            drag.dist = Math.min(range, mag / 95 * range);
        }
        var inSignal = isInsideRect(e.clientX, e.clientY, signalDropRef.current, 14);
        var cancelMethod = (_profile_settings_controls_skillCancelMethod = profile.settings.controls.skillCancelMethod) != null ? _profile_settings_controls_skillCancelMethod : 'drag_to_x';
        var inCancelRect = isInsideRect(e.clientX, e.clientY, cancelDropRef.current, 14);
        var inCancelDist = cancelMethod === 'drag_distance' && mag > 165 && !inSignal;
        var inCancel = !inSignal && (inCancelRect || inCancelDist);
        drag.signalHover = inSignal;
        drag.cancelHover = inCancel;
        setSignalHover(inSignal);
        setCancelHover(inCancel);
        if (drag.slot !== 4) {
            var _engineRef_current;
            (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setAimPreview({
                angle: drag.angle,
                dist: drag.dist,
                cancelHover: inCancel || inSignal
            });
        }
    };
    var endSkillDrag = function endSkillDrag() {
        var _engineRef_current;
        var drag = skillDragRef.current;
        skillDragRef.current = null;
        setActiveAimSlot(null);
        setCancelHover(false);
        setSignalHover(false);
        (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setAimPreview({
            active: false,
            cancelHover: false
        });
        if (!drag) return;
        // Dropped onto 📡 Signal CD target -> broadcast Ready / remaining CD without casting!
        if (drag.signalHover) {
            var _engineRef_current1, _engineRef_current2, _engineRef_current3;
            if (drag.slot === 'spell') (_engineRef_current1 = engineRef.current) == null ? void 0 : _engineRef_current1.signalSpellStatus();
            else if (drag.slot === 4) (_engineRef_current2 = engineRef.current) == null ? void 0 : _engineRef_current2.signalSkill4Status();
            else (_engineRef_current3 = engineRef.current) == null ? void 0 : _engineRef_current3.signalSkillStatus(drag.slot);
            return;
        }
        if (drag.cancelHover) return;
        if (drag.slot === 'spell') {
            var _engineRef_current4;
            (_engineRef_current4 = engineRef.current) == null ? void 0 : _engineRef_current4.castPlayerSpell(drag.moved ? drag.angle : undefined);
        } else if (drag.slot === 4) {
            var _engineRef_current5;
            (_engineRef_current5 = engineRef.current) == null ? void 0 : _engineRef_current5.castPlayerSkill4();
        } else {
            var _engineRef_current6;
            (_engineRef_current6 = engineRef.current) == null ? void 0 : _engineRef_current6.castPlayerSkill(drag.slot, drag.moved ? drag.angle : undefined, drag.moved ? drag.dist : undefined);
        }
    };
    // Press-and-Hold Drag-to-Mark Tactical Ping handlers (140ms hold OR >10px drag opens Pop-Out Mini-Map!)
    var clearPingHoldTimer = function clearPingHoldTimer() {
        if (pingHoldTimerRef.current !== null) {
            window.clearTimeout(pingHoldTimerRef.current);
            pingHoldTimerRef.current = null;
        }
    };
    var startPingDrag = function startPingDrag(e, kind) {
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        clearPingHoldTimer();
        var startMs = Date.now();
        setDragPingState({
            kind: kind,
            startX: e.clientX,
            startY: e.clientY,
            startMs: startMs,
            popupOpen: false,
            reticleNorm: null,
            previewLabel: null,
            previewIcon: null,
            previewColor: null,
            snapped: false
        });
        pingHoldTimerRef.current = window.setTimeout(function() {
            setDragPingState(function(prev) {
                return prev ? _extends({}, prev, {
                    popupOpen: true
                }) : null;
            });
        }, 140);
    };
    var movePingDrag = function movePingDrag(e) {
        setDragPingState(function(prev) {
            if (!prev) return null;
            var movedPx = Math.hypot(e.clientX - prev.startX, e.clientY - prev.startY);
            var elapsedMs = Date.now() - prev.startMs;
            var popupOpen = prev.popupOpen || (0, _CombatMath.classifyPingGesture)(elapsedMs, movedPx) === 'drag';
            if (popupOpen && !prev.popupOpen) clearPingHoldTimer();
            var reticleNorm = prev.reticleNorm;
            var previewLabel = prev.previewLabel;
            var previewIcon = prev.previewIcon;
            var previewColor = prev.previewColor;
            var snapped = prev.snapped;
            var popup = pingPopupCanvasRef.current;
            if (popupOpen && popup) {
                var rect = popup.getBoundingClientRect();
                if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                    var _engineRef_current;
                    var rawNx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    var rawNy = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
                    var preview = (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.previewDragPing(prev.kind, rawNx * _mapData.WORLD_SIZE, rawNy * _mapData.WORLD_SIZE);
                    if (preview) {
                        reticleNorm = {
                            nx: Math.max(0, Math.min(1, preview.snappedX / _mapData.WORLD_SIZE)),
                            ny: Math.max(0, Math.min(1, preview.snappedY / _mapData.WORLD_SIZE))
                        };
                        previewLabel = preview.label;
                        previewIcon = preview.icon;
                        previewColor = preview.color;
                        snapped = preview.snapped;
                    } else {
                        reticleNorm = {
                            nx: rawNx,
                            ny: rawNy
                        };
                    }
                } else {
                    reticleNorm = null;
                    previewLabel = null;
                    previewIcon = null;
                    previewColor = null;
                    snapped = false;
                }
            }
            return _extends({}, prev, {
                popupOpen: popupOpen,
                reticleNorm: reticleNorm,
                previewLabel: previewLabel,
                previewIcon: previewIcon,
                previewColor: previewColor,
                snapped: snapped
            });
        });
    };
    var endPingDrag = function endPingDrag() {
        clearPingHoldTimer();
        setDragPingState(function(prev) {
            if (!prev) return null;
            if (prev.popupOpen && prev.reticleNorm) {
                var _engineRef_current;
                (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.dragPingToWorld(prev.kind, prev.reticleNorm.nx * _mapData.WORLD_SIZE, prev.reticleNorm.ny * _mapData.WORLD_SIZE);
            } else {
                var _engineRef_current1;
                (_engineRef_current1 = engineRef.current) == null ? void 0 : _engineRef_current1.sendTacticalPing(prev.kind);
            }
            return null;
        });
    };
    var cancelPingDrag = function cancelPingDrag() {
        clearPingHoldTimer();
        setDragPingState(null);
    };
    var handleSendCustomChat = function handleSendCustomChat(e) {
        var _engineRef_current;
        e.preventDefault();
        var trimmed = customChatText.trim();
        if (!trimmed) return;
        (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.sendQuickChat(trimmed);
        setCustomChatText('');
        setChatDrawerOpen(false);
    };
    // Virtual Joystick pointer handlers (shared by Fixed & Floating modes)
    var startJoystick = function startJoystick(e, floating) {
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        if (floating) {
            joyOriginRef.current = {
                x: e.clientX,
                y: e.clientY,
                pointerId: e.pointerId
            };
            setFloatingJoyCenter({
                x: e.clientX,
                y: e.clientY
            });
            setJoyKnob({
                x: 0,
                y: 0,
                active: true
            });
        } else {
            var rect = e.currentTarget.getBoundingClientRect();
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            joyOriginRef.current = {
                x: cx,
                y: cy,
                pointerId: e.pointerId
            };
            setJoyKnob({
                x: 0,
                y: 0,
                active: true
            });
        }
    };
    var moveJoystick = function moveJoystick(e) {
        var _engineRef_current;
        var orig = joyOriginRef.current;
        if (!orig || orig.pointerId !== e.pointerId) return;
        var dx = e.clientX - orig.x;
        var dy = e.clientY - orig.y;
        var maxR = 46;
        var mag = Math.hypot(dx, dy);
        var clamped = Math.min(maxR, mag);
        var ang = Math.atan2(dy, dx);
        var kx = Math.cos(ang) * clamped;
        var ky = Math.sin(ang) * clamped;
        setJoyKnob({
            x: kx,
            y: ky,
            active: true
        });
        (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setMoveVector(kx / maxR, ky / maxR);
    };
    var endJoystick = function endJoystick(e) {
        var _joyOriginRef_current;
        if (((_joyOriginRef_current = joyOriginRef.current) == null ? void 0 : _joyOriginRef_current.pointerId) === e.pointerId) {
            var _engineRef_current;
            joyOriginRef.current = null;
            setJoyKnob({
                x: 0,
                y: 0,
                active: false
            });
            setFloatingJoyCenter(null);
            (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setMoveVector(0, 0);
        }
    };
    var is3D = (snap == null ? void 0 : snap.rendererMode) === '3d';
    var hpPct = snap ? Math.max(0, Math.min(100, snap.player.hp / Math.max(1, snap.player.maxHp) * 100)) : 100;
    var manaPct = snap && snap.player.resource !== 'none' ? Math.max(0, Math.min(100, snap.player.mana / Math.max(1, snap.player.maxMana) * 100)) : 100;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "relative w-full h-full overflow-hidden bg-[#060B18] select-none touch-none",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("canvas", {
                ref: canvasRef,
                className: "absolute inset-0 w-full h-full block " + (is3D ? 'opacity-0 pointer-events-none' : 'opacity-100')
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                ref: threeHostRef,
                className: "absolute inset-0 w-full h-full pointer-events-none"
            }),
            snap && activeAimSlot === null && !dragPingState && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                onPointerDown: function onPointerDown(e) {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    panOriginRef.current = {
                        x: e.clientX,
                        y: e.clientY
                    };
                },
                onPointerMove: function onPointerMove(e) {
                    var _engineRef_current;
                    if (!panOriginRef.current) return;
                    (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setFreeCameraOffset(e.clientX - panOriginRef.current.x, e.clientY - panOriginRef.current.y);
                },
                onPointerUp: function onPointerUp() {
                    var _engineRef_current;
                    panOriginRef.current = null;
                    (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.resetFreeCamera();
                },
                onPointerCancel: function onPointerCancel() {
                    var _engineRef_current;
                    panOriginRef.current = null;
                    (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.resetFreeCamera();
                },
                className: "absolute top-14 right-14 w-[40%] h-[40%] z-10 cursor-grab active:cursor-grabbing touch-none",
                title: "Drag anywhere in upper-right empty space to free-pan 3D camera"
            }),
            snap && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        style: getTopLeftStyle('minimap', {
                            xPct: 1.5,
                            yPct: 2
                        }),
                        className: "absolute z-20 flex items-start gap-2",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex flex-col gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "relative rounded-xl overflow-hidden border-2 border-[#F5C451]/65 bg-[#0B132B] shadow-xl",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("canvas", {
                                                ref: minimapRef,
                                                width: 156,
                                                height: 156,
                                                onPointerDown: function onPointerDown(e) {
                                                    var _engineRef_current;
                                                    e.stopPropagation();
                                                    e.currentTarget.setPointerCapture(e.pointerId);
                                                    var rect = e.currentTarget.getBoundingClientRect();
                                                    var wx = (e.clientX - rect.left) / rect.width * _mapData.WORLD_SIZE;
                                                    var wy = (e.clientY - rect.top) / rect.height * _mapData.WORLD_SIZE;
                                                    if (e.altKey) {
                                                        var _engineRef_current1;
                                                        (_engineRef_current1 = engineRef.current) == null ? void 0 : _engineRef_current1.dragPingToWorld('attack', wx, wy);
                                                        return;
                                                    }
                                                    minimapDragRef.current = {
                                                        startX: e.clientX,
                                                        startY: e.clientY,
                                                        dragged: false
                                                    };
                                                    (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setMinimapCameraFocus(wx, wy);
                                                },
                                                onPointerMove: function onPointerMove(e) {
                                                    var _engineRef_current;
                                                    var md = minimapDragRef.current;
                                                    if (!md) return;
                                                    if (Math.hypot(e.clientX - md.startX, e.clientY - md.startY) > 6) {
                                                        md.dragged = true;
                                                    }
                                                    var rect = e.currentTarget.getBoundingClientRect();
                                                    var wx = Math.max(0, Math.min(_mapData.WORLD_SIZE, (e.clientX - rect.left) / rect.width * _mapData.WORLD_SIZE));
                                                    var wy = Math.max(0, Math.min(_mapData.WORLD_SIZE, (e.clientY - rect.top) / rect.height * _mapData.WORLD_SIZE));
                                                    (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setMinimapCameraFocus(wx, wy);
                                                },
                                                onPointerUp: function onPointerUp(e) {
                                                    var _engineRef_current;
                                                    var md = minimapDragRef.current;
                                                    minimapDragRef.current = null;
                                                    (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.clearMinimapCameraFocus();
                                                    if (md && !md.dragged) {
                                                        var _engineRef_current1;
                                                        var rect = e.currentTarget.getBoundingClientRect();
                                                        var wx = (e.clientX - rect.left) / rect.width * _mapData.WORLD_SIZE;
                                                        var wy = (e.clientY - rect.top) / rect.height * _mapData.WORLD_SIZE;
                                                        (_engineRef_current1 = engineRef.current) == null ? void 0 : _engineRef_current1.dragPingToWorld('gather', wx, wy);
                                                    }
                                                },
                                                onPointerCancel: function onPointerCancel() {
                                                    var _engineRef_current;
                                                    minimapDragRef.current = null;
                                                    (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.clearMinimapCameraFocus();
                                                },
                                                className: "block cursor-crosshair touch-none",
                                                title: "Drag to scout camera \xb7 Tap or Alt+Click to ping"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    return setMinimapExpanded(function(v) {
                                                        return !v;
                                                    });
                                                },
                                                className: "absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-[#F5C451]/65 text-[10px] font-black text-[#F5C451] cursor-pointer",
                                                title: "Open Expanded Tactical Map (M)",
                                                children: "\uD83D\uDD0D M"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        style: {
                                            transform: "scale(" + ((_ref = (_customLayout_shopBar = customLayout.shopBar) == null ? void 0 : _customLayout_shopBar.scale) != null ? _ref : 1) + ")",
                                            transformOrigin: 'top left',
                                            opacity: (_ref1 = (_customLayout_shopBar1 = customLayout.shopBar) == null ? void 0 : _customLayout_shopBar1.opacity) != null ? _ref1 : 1
                                        },
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                onClick: function onClick() {
                                                    return setShopOpen(true);
                                                },
                                                className: "h-11 px-2.5 rounded-xl bg-[#0B132B]/92 border border-[#F5C451]/60 text-xs font-black text-amber-300 flex items-center gap-1 cursor-pointer mlbb-num",
                                                title: "Open Equipment Shop (P)",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: "\uD83D\uDED2"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        children: snap.player.gold
                                                    })
                                                ]
                                            }),
                                            quickBuyItems.map(function(qb) {
                                                var itDef = (0, _items.getMlbbItemById)(qb.id);
                                                if (!itDef) return null;
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    onClick: function onClick(e) {
                                                        if (e.altKey || e.shiftKey) {
                                                            var _engineRef_current;
                                                            (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.signalItemNeed(qb.id);
                                                        } else {
                                                            var _engineRef_current1;
                                                            (_engineRef_current1 = engineRef.current) == null ? void 0 : _engineRef_current1.buyItem(qb.id);
                                                        }
                                                    },
                                                    className: "h-11 px-2 rounded-xl border text-[10px] font-black flex items-center gap-1 cursor-pointer " + (qb.canAfford ? 'bg-amber-500/25 border-[#F5C451] text-white' : 'bg-[#0B132B]/85 border-slate-700 text-slate-400'),
                                                    title: "Quick-Buy " + itDef.name + " (" + qb.effectiveCost + "g) \xb7 Alt+Click to ping gold needed",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "text-sm",
                                                            children: itDef.icon
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            className: "mlbb-num",
                                                            children: [
                                                                qb.effectiveCost,
                                                                "g"
                                                            ]
                                                        })
                                                    ]
                                                }, qb.id);
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "flex flex-col gap-1",
                                children: snap.teammates.map(function(ally) {
                                    var isSpectating = !snap.player.alive && snap.spectateTargetId === ally.id;
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            if (!snap.player.alive && ally.alive) {
                                                var _engineRef_current;
                                                (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setSpectateTarget(ally.id);
                                            }
                                        },
                                        title: !snap.player.alive ? "Spectate " + ally.name : ally.name,
                                        className: "relative flex items-center gap-1.5 px-1.5 py-1 rounded-lg bg-[#0B132B]/88 border text-left " + (isSpectating ? 'border-[#F5C451] ring-1 ring-[#F5C451]' : 'border-sky-400/40') + " " + (!snap.player.alive && ally.alive ? 'cursor-pointer hover:border-amber-300' : 'cursor-default'),
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                heroId: ally.heroId,
                                                size: 24
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "w-12",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "h-1.5 rounded bg-slate-900 overflow-hidden",
                                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "h-full bg-emerald-400",
                                                            style: {
                                                                width: "" + Math.round(ally.hpPct * 100) + "%"
                                                            }
                                                        })
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[9px] text-slate-300 font-bold truncate",
                                                        children: ally.alive ? ally.name : "" + ally.respawnSec + "s"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                title: ally.ultReady ? 'Ultimate Ready' : 'Ultimate on Cooldown',
                                                className: "w-2.5 h-2.5 rounded-full border border-slate-950 " + (ally.ultReady ? 'bg-emerald-400' : 'bg-slate-600')
                                            })
                                        ]
                                    }, ally.id);
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        style: {
                            opacity: uiOpacity
                        },
                        className: "absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    return setScoreboardOpen(true);
                                },
                                className: "pointer-events-auto px-4 py-1.5 rounded-2xl bg-[#0B132B]/92 backdrop-blur-sm border border-[#F5C451]/55 flex items-center gap-3 text-xs font-black cursor-pointer shadow-lg",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-base text-sky-400 mlbb-num",
                                        children: snap.blueKills
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-slate-400",
                                        children: "vs"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-base text-rose-400 mlbb-num",
                                        children: snap.redKills
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "px-2 py-0.5 rounded bg-slate-900 text-[#F5C451] mlbb-num",
                                        children: (0, _mapData.formatClock)(snap.matchTimeSec)
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "text-slate-200 mlbb-num",
                                        children: [
                                            "KDA ",
                                            snap.player.kills,
                                            "/",
                                            snap.player.deaths,
                                            "/",
                                            snap.player.assists
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-[10px] text-amber-300",
                                        children: "\uD83D\uDCCA"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "pointer-events-auto w-60 px-2.5 py-1.5 rounded-xl bg-[#0B132B]/90 backdrop-blur-sm border border-slate-700/80 space-y-1 shadow-lg",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            var _engineRef_current;
                                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.signalLowHpStatus();
                                        },
                                        title: "Click to broadcast Low HP Retreat signal to team",
                                        className: "w-full text-left cursor-pointer group",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex justify-between text-[10px] font-black mlbb-num mb-0.5",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: hpPct < 25 ? 'text-rose-400 animate-pulse' : 'text-emerald-300 group-hover:text-white',
                                                        children: [
                                                            "HP ",
                                                            snap.player.hp,
                                                            "/",
                                                            snap.player.maxHp,
                                                            snap.player.shield > 0 ? " (+" + snap.player.shield + ")" : '',
                                                            hpPct < 25 ? ' · 📡 TAP' : ''
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "text-amber-300",
                                                        children: [
                                                            "Lv.",
                                                            snap.player.level
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "relative h-2 rounded-full bg-slate-900 overflow-hidden",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "absolute inset-y-0 left-0 bg-amber-200 transition-all duration-150",
                                                        style: {
                                                            width: "" + hudHpTrailPct + "%"
                                                        }
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "absolute inset-y-0 left-0 " + (hpPct < 25 ? 'bg-rose-500' : 'bg-emerald-400'),
                                                        style: {
                                                            width: "" + hpPct + "%"
                                                        }
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    snap.player.resource !== 'none' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            var _engineRef_current;
                                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.signalLowManaStatus();
                                        },
                                        title: "Click to broadcast Low " + (snap.player.resource === 'energy' ? 'Energy' : 'Mana') + " signal",
                                        className: "w-full text-left cursor-pointer group",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex justify-between text-[9px] font-black mlbb-num mb-0.5",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: manaPct < 25 ? 'text-sky-300 animate-pulse' : snap.player.resource === 'energy' ? 'text-amber-300/90 group-hover:text-white' : 'text-sky-300/90 group-hover:text-white',
                                                        children: [
                                                            snap.player.resource === 'energy' ? 'ENERGY' : 'MANA',
                                                            " ",
                                                            snap.player.mana,
                                                            "/",
                                                            snap.player.maxMana,
                                                            manaPct < 25 ? ' · 📡 TAP' : ''
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "text-slate-400",
                                                        children: [
                                                            Math.round(manaPct),
                                                            "%"
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "relative h-1.5 rounded-full bg-slate-900 overflow-hidden",
                                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "absolute inset-y-0 left-0 " + (snap.player.resource === 'energy' ? 'bg-amber-400' : 'bg-sky-400'),
                                                    style: {
                                                        width: "" + manaPct + "%"
                                                    }
                                                })
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center gap-1.5",
                                children: [
                                    snap.player.turretAlert === 'locked' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "px-3 py-0.5 rounded-lg bg-rose-600/95 border border-white text-[11px] font-black text-white animate-pulse",
                                        children: "⚠ TURRET LOCKED ON YOU!"
                                    }),
                                    snap.player.turretAlert === 'warn' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "px-2.5 py-0.5 rounded-lg bg-amber-500/90 border border-amber-200 text-[10px] font-black text-slate-950",
                                        children: "⚠ NO MINIONS IN TURRET"
                                    }),
                                    snap.player.inBush && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "px-2.5 py-0.5 rounded-lg border text-[10px] font-black " + (snap.player.spottedByEnemy ? 'bg-rose-950/90 border-rose-400 text-rose-200' : 'bg-emerald-950/90 border-emerald-400 text-emerald-200'),
                                        children: snap.player.spottedByEnemy ? '👁 SPOTTED IN BUSH!' : '🌿 HIDDEN IN BUSH'
                                    })
                                ]
                            }),
                            snap.surrenderVote && snap.surrenderVote.active && /*#__PURE__*/ (0, _jsxruntime.jsx)(_HudWidgets.SurrenderVoteBar, {
                                vote: snap.surrenderVote
                            }),
                            snap.announcer && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                style: {
                                    borderColor: snap.announcer.color
                                },
                                className: "px-6 py-2 rounded-2xl bg-[#0B132B]/95 border-2 text-center shadow-2xl",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-sm font-black tracking-wider",
                                        style: {
                                            color: snap.announcer.color
                                        },
                                        children: snap.announcer.text
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[11px] text-slate-200 font-bold",
                                        children: snap.announcer.sub
                                    })
                                ]
                            }),
                            snap.objectiveBanner && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "px-4 py-1 rounded-xl bg-amber-500/20 border border-[#F5C451] text-xs font-black text-[#F5C451]",
                                children: [
                                    "\uD83D\uDC09 ",
                                    snap.objectiveBanner
                                ]
                            }),
                            snap.pingFeed.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "flex flex-col items-center gap-0.5",
                                children: snap.pingFeed.slice(-2).map(function(pf) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        style: {
                                            borderColor: pf.color
                                        },
                                        className: "px-3 py-0.5 rounded-lg bg-[#080F24]/92 border text-[11px] font-black text-white shadow",
                                        children: [
                                            pf.icon,
                                            " ",
                                            pf.text
                                        ]
                                    }, pf.id);
                                })
                            }),
                            snap.trackedEnemySpells && snap.trackedEnemySpells.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "flex flex-wrap justify-center gap-1",
                                children: snap.trackedEnemySpells.slice(0, 3).map(function(ts) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "px-2 py-0.5 rounded-lg bg-amber-950/88 border border-amber-400/70 text-[10px] font-black text-amber-200 mlbb-num shadow",
                                        children: [
                                            "⏱️ ",
                                            ts.heroName,
                                            " ",
                                            ts.spellIcon,
                                            " ",
                                            ts.remainingSec,
                                            "s"
                                        ]
                                    }, ts.heroId);
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        style: {
                            opacity: uiOpacity
                        },
                        className: "absolute top-2 right-2 z-20 flex items-center gap-1.5",
                        children: [
                            profile.settings.network.showPingFps && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "px-2.5 py-1.5 rounded-lg bg-[#0B132B]/90 border border-slate-700 text-[10px] font-black text-emerald-300 mlbb-num",
                                children: [
                                    snap.pingMs,
                                    "ms \xb7 ",
                                    snap.fps,
                                    " FPS"
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    return setScoreboardOpen(true);
                                },
                                className: "w-10 h-10 rounded-xl bg-[#0B132B]/90 border border-slate-600 hover:border-[#F5C451] text-sm cursor-pointer",
                                title: "Scoreboard (Tab)",
                                children: "\uD83D\uDCCB"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    return setSettingsOpen(true);
                                },
                                className: "w-10 h-10 rounded-xl bg-[#0B132B]/90 border border-[#F5C451]/60 hover:bg-amber-500/20 text-sm cursor-pointer",
                                title: "Settings (Esc)",
                                children: "⚙️"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        style: {
                            opacity: ((_ref2 = (_customLayout_pings = customLayout.pings) == null ? void 0 : _customLayout_pings.opacity) != null ? _ref2 : 1) * uiOpacity,
                            transform: "scale(" + ((_ref3 = (_customLayout_pings1 = customLayout.pings) == null ? void 0 : _customLayout_pings1.scale) != null ? _ref3 : 1) + ")",
                            transformOrigin: 'top right'
                        },
                        className: "absolute top-14 right-2 z-20 flex items-start gap-2",
                        children: [
                            (dragPingState == null ? void 0 : dragPingState.popupOpen) && !minimapExpanded && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p-2 rounded-2xl bg-[#0B132B]/96 border-2 border-[#F5C451] shadow-2xl flex flex-col items-center gap-1 pointer-events-none",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        style: {
                                            color: (_dragPingState_previewColor = dragPingState.previewColor) != null ? _dragPingState_previewColor : '#F5C451'
                                        },
                                        className: "text-[10px] font-black uppercase tracking-wider max-w-[200px] truncate text-center",
                                        children: dragPingState.previewLabel ? ((_dragPingState_previewIcon = dragPingState.previewIcon) != null ? _dragPingState_previewIcon : '') + " " + dragPingState.previewLabel : "Drag " + dragPingState.kind.toUpperCase() + " Beacon to Target"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "relative rounded-xl overflow-hidden border border-sky-400/75 w-[200px] h-[200px]",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("canvas", {
                                                ref: pingPopupCanvasRef,
                                                width: 200,
                                                height: 200,
                                                className: "w-full h-full block"
                                            }),
                                            dragPingState.reticleNorm && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                style: {
                                                    left: "" + dragPingState.reticleNorm.nx * 100 + "%",
                                                    top: "" + dragPingState.reticleNorm.ny * 100 + "%",
                                                    borderColor: dragPingState.snapped ? '#FACC15' : '#FFFFFF'
                                                },
                                                className: "absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm shadow-lg transition-transform " + (dragPingState.snapped ? 'bg-amber-500/45 scale-115' : 'bg-rose-500/35'),
                                                children: (_dragPingState_previewIcon1 = dragPingState.previewIcon) != null ? _dragPingState_previewIcon1 : dragPingState.kind === 'attack' ? '⚔️' : dragPingState.kind === 'retreat' ? '🛡️' : '🎯'
                                            })
                                        ]
                                    })
                                ]
                            }),
                            chatDrawerOpen && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "w-64 p-2.5 rounded-2xl bg-[#0B132B]/96 backdrop-blur-sm border-2 border-[#F5C451]/60 shadow-2xl space-y-1.5 text-[11px]",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between text-[10px] font-black text-[#F5C451] uppercase",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "Team Tactical Chat"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    return setChatDrawerOpen(false);
                                                },
                                                className: "text-slate-400 hover:text-white cursor-pointer",
                                                children: "✕"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "max-h-40 overflow-y-auto space-y-1 pr-0.5",
                                        children: profile.quickChatIds.map(function(id) {
                                            var opt = _emblems.MLBB_QUICK_CHAT_OPTIONS.find(function(q) {
                                                return q.id === id;
                                            });
                                            if (!opt) return null;
                                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.sendQuickChat(opt.text);
                                                    setChatDrawerOpen(false);
                                                },
                                                className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-left text-slate-100 font-bold cursor-pointer",
                                                children: opt.text
                                            }, id);
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("form", {
                                        onSubmit: handleSendCustomChat,
                                        className: "flex gap-1 pt-1 border-t border-slate-700/80",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                type: "text",
                                                value: customChatText,
                                                onChange: function onChange(e) {
                                                    return setCustomChatText(e.target.value);
                                                },
                                                placeholder: "Type team message...",
                                                maxLength: 80,
                                                className: "flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-600 focus:border-[#F5C451] text-white text-[11px] outline-none"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "submit",
                                                className: "px-2.5 py-1.5 rounded-lg bg-[#F5C451] text-slate-950 font-black text-[10px] cursor-pointer",
                                                children: "Send"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            emoteWheelOpen && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "p-2 rounded-2xl bg-[#0B132B]/96 border-2 border-[#F5C451] grid grid-cols-2 gap-1.5 shadow-2xl",
                                children: profile.equippedEmotes.map(function(emId, idx) {
                                    var em = (0, _emblems.getMlbbEmoteById)(emId);
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        disabled: snap.emoteCd > 0,
                                        onClick: function onClick() {
                                            var _engineRef_current;
                                            (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerEmote(em.id);
                                            setEmoteWheelOpen(false);
                                        },
                                        className: "px-3 py-2 rounded-xl bg-slate-900 hover:bg-amber-500/25 border border-slate-700 hover:border-[#F5C451] flex items-center gap-1.5 text-xs font-black text-white cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-lg",
                                                children: em.icon
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: em.callout
                                            })
                                        ]
                                    }, idx);
                                })
                            }),
                            activeAimSlot !== null && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex flex-col items-end gap-2 mt-2",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        ref: cancelDropRef,
                                        className: "w-22 h-22 rounded-full border-2 flex flex-col items-center justify-center font-black text-[11px] transition-all shadow-2xl " + (cancelHover ? 'bg-rose-600/95 border-white text-white scale-110' : 'bg-rose-950/85 border-rose-400 text-rose-200'),
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-xl leading-none",
                                                children: "✕"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "CANCEL"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        ref: signalDropRef,
                                        className: "w-22 h-22 rounded-full border-2 flex flex-col items-center justify-center font-black text-[10px] text-center transition-all shadow-2xl " + (signalHover ? 'bg-cyan-500/95 border-white text-slate-950 scale-110' : 'bg-sky-950/90 border-cyan-400 text-cyan-200'),
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-xl leading-none",
                                                children: "\uD83D\uDCE1"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: "SIGNAL CD"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex flex-col items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onPointerDown: function onPointerDown(e) {
                                            return startPingDrag(e, 'attack');
                                        },
                                        onPointerMove: movePingDrag,
                                        onPointerUp: endPingDrag,
                                        onPointerCancel: cancelPingDrag,
                                        className: "w-11 h-11 rounded-full bg-rose-900/92 border-2 border-rose-400 text-base font-black shadow-lg cursor-grab active:cursor-grabbing touch-none flex items-center justify-center",
                                        title: "Tap: Attack here \xb7 Hold & Drag (>140ms): Open Pop-Out Map to mark Enemy/Turret/Turtle",
                                        children: "⚔️"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onPointerDown: function onPointerDown(e) {
                                            return startPingDrag(e, 'retreat');
                                        },
                                        onPointerMove: movePingDrag,
                                        onPointerUp: endPingDrag,
                                        onPointerCancel: cancelPingDrag,
                                        className: "w-11 h-11 rounded-full bg-amber-900/92 border-2 border-amber-400 text-base font-black shadow-lg cursor-grab active:cursor-grabbing touch-none flex items-center justify-center",
                                        title: "Tap: Retreat \xb7 Hold & Drag (>140ms): Warn Bush Ambush or Threat",
                                        children: "\uD83D\uDEE1️"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onPointerDown: function onPointerDown(e) {
                                            return startPingDrag(e, 'gather');
                                        },
                                        onPointerMove: movePingDrag,
                                        onPointerUp: endPingDrag,
                                        onPointerCancel: cancelPingDrag,
                                        className: "w-11 h-11 rounded-full bg-sky-900/92 border-2 border-sky-400 text-base font-black shadow-lg cursor-grab active:cursor-grabbing touch-none flex items-center justify-center",
                                        title: "Tap: Gather \xb7 Hold & Drag (>140ms): Rally Allies to Objective/Lane",
                                        children: "\uD83C\uDFAF"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center gap-1 pt-0.5",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    return setMicOn(function(v) {
                                                        return !v;
                                                    });
                                                },
                                                className: "w-8 h-8 rounded-full border text-[11px] cursor-pointer flex items-center justify-center " + (micOn ? 'bg-emerald-700 border-emerald-400' : 'bg-[#0B132B]/90 border-slate-600'),
                                                title: "Toggle Team Mic",
                                                children: micOn ? '🎙️' : '🔇'
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    return setSpeakerOn(function(v) {
                                                        return !v;
                                                    });
                                                },
                                                className: "w-8 h-8 rounded-full border text-[11px] cursor-pointer flex items-center justify-center " + (speakerOn ? 'bg-sky-800 border-sky-400' : 'bg-[#0B132B]/90 border-slate-600'),
                                                title: "Toggle Team Speaker",
                                                children: speakerOn ? '🔊' : '🔈'
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            setEmoteWheelOpen(false);
                                            setChatDrawerOpen(function(v) {
                                                return !v;
                                            });
                                        },
                                        className: "w-11 h-11 rounded-full bg-[#0B132B]/92 border-2 text-base cursor-pointer flex items-center justify-center " + (chatDrawerOpen ? 'border-[#F5C451] bg-amber-500/20' : 'border-slate-500'),
                                        title: "Quick Chat & Custom Team Message",
                                        children: "\uD83D\uDCAC"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            setChatDrawerOpen(false);
                                            setEmoteWheelOpen(function(v) {
                                                return !v;
                                            });
                                        },
                                        className: "w-11 h-11 rounded-full bg-[#0B132B]/92 border-2 text-base cursor-pointer flex items-center justify-center " + (emoteWheelOpen ? 'border-white bg-amber-500/25' : 'border-[#F5C451]'),
                                        title: "Hero Emote Wheel (T / 1-4)",
                                        children: "\uD83D\uDE04"
                                    })
                                ]
                            })
                        ]
                    }),
                    snap.chatFeed.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "absolute left-3 bottom-44 z-10 pointer-events-none space-y-0.5 max-w-xs",
                        children: snap.chatFeed.slice(-3).map(function(c) {
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "px-2 py-0.5 rounded bg-slate-950/70 text-[11px] font-bold text-slate-100",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: c.team === 'sys' ? 'text-amber-300' : 'text-sky-300',
                                        children: [
                                            c.sender,
                                            ": "
                                        ]
                                    }),
                                    c.text
                                ]
                            }, c.id);
                        })
                    }),
                    config.mode === 'practice' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "absolute left-2 top-54 z-30",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    return setPracticeOpen(function(v) {
                                        return !v;
                                    });
                                },
                                className: "px-2.5 py-1.5 rounded-lg bg-emerald-700 border border-emerald-400 text-[11px] font-black text-white cursor-pointer shadow-lg",
                                children: [
                                    "\uD83D\uDEE0️ Practice Console ",
                                    practiceOpen ? '▾' : '▸'
                                ]
                            }),
                            practiceOpen && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "mt-1 p-2 rounded-xl bg-[#0B132B]/95 border border-emerald-400/50 space-y-1.5 text-[10px] w-60 shadow-2xl",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "p-2 rounded-lg bg-slate-900/90 border border-amber-400/35 grid grid-cols-2 gap-x-2 gap-y-1 mlbb-num",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-slate-400",
                                                        children: "5s DPS: "
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "font-black text-[#F5C451]",
                                                        children: ((_snap_practiceCheats_dummyDps = snap.practiceCheats.dummyDps) != null ? _snap_practiceCheats_dummyDps : 0).toLocaleString()
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-slate-400",
                                                        children: "Peak Hit: "
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "font-black text-orange-300",
                                                        children: ((_snap_practiceCheats_dummyPeakBurst = snap.practiceCheats.dummyPeakBurst) != null ? _snap_practiceCheats_dummyPeakBurst : 0).toLocaleString()
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-slate-400",
                                                        children: "Last Hit: "
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "font-black text-sky-300",
                                                        children: ((_snap_practiceCheats_dummyLastHit = snap.practiceCheats.dummyLastHit) != null ? _snap_practiceCheats_dummyLastHit : 0).toLocaleString()
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-slate-400",
                                                        children: "Total: "
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "font-black text-emerald-300",
                                                        children: ((_snap_practiceCheats_dummyTotalDmg = snap.practiceCheats.dummyTotalDmg) != null ? _snap_practiceCheats_dummyTotalDmg : 0).toLocaleString()
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "grid grid-cols-2 gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('level');
                                                },
                                                className: "py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-black text-sky-300 cursor-pointer",
                                                children: "+1 Level Up"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('max_level');
                                                },
                                                className: "py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-black text-sky-300 cursor-pointer",
                                                children: "Max Lv.15"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('gold');
                                                },
                                                className: "py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-black text-amber-300 cursor-pointer",
                                                children: "+1,000 Gold"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('gold_10k');
                                                },
                                                className: "py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-black text-amber-300 cursor-pointer",
                                                children: "+10,000 Gold"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('no_cd');
                                                },
                                                className: "py-1.5 rounded font-black cursor-pointer " + (snap.practiceCheats.noCooldown ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'),
                                                children: "Zero CD"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('god_mode');
                                                },
                                                className: "py-1.5 rounded font-black cursor-pointer " + (snap.practiceCheats.godMode ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'),
                                                children: "God Mode"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('spawn_dummy');
                                                },
                                                className: "py-1.5 rounded bg-amber-900/70 hover:bg-amber-800 font-black text-amber-200 cursor-pointer",
                                                children: "\uD83C\uDFAF DPS Dummy"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('reset_dummy_dps');
                                                },
                                                className: "py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-black text-amber-200 cursor-pointer",
                                                children: "↺ Reset DPS"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('spawn_normal_bot');
                                                },
                                                className: "py-1.5 rounded bg-rose-900/70 hover:bg-rose-800 font-black text-rose-200 cursor-pointer",
                                                children: "\uD83E\uDD16 Spawn Bot"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('level_bot');
                                                },
                                                className: "py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 font-black text-rose-200 cursor-pointer",
                                                children: "⬆ Level Bot"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('spawn_turtle');
                                                },
                                                className: "py-1.5 rounded bg-emerald-900/70 hover:bg-emerald-800 font-black text-emerald-200 cursor-pointer",
                                                children: "\uD83D\uDC22 Spawn Turtle"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('spawn_lord');
                                                },
                                                className: "py-1.5 rounded bg-orange-900/70 hover:bg-orange-800 font-black text-orange-200 cursor-pointer",
                                                children: "\uD83D\uDC09 Spawn Lord"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('spawn_wave');
                                                },
                                                className: "py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-black text-white cursor-pointer",
                                                children: "Spawn Wave"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('clear_minions');
                                                },
                                                className: "py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-black text-slate-200 cursor-pointer",
                                                children: "Clear Minions"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('spawn_jungle');
                                                },
                                                className: "py-1.5 rounded bg-purple-900/70 hover:bg-purple-800 font-black text-purple-200 cursor-pointer",
                                                children: "\uD83D\uDC3A Spawn Jungle"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('turret_invincible');
                                                },
                                                className: "py-1.5 rounded font-black cursor-pointer " + (snap.practiceCheats.turretsInvincible ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'),
                                                children: "\uD83D\uDEE1️ Inv. Turrets"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('reset_pos');
                                                },
                                                className: "py-1.5 rounded bg-sky-900/80 hover:bg-sky-800 font-black text-sky-200 cursor-pointer",
                                                children: "\uD83C\uDF00 Reset Pos"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.practiceCheat('end_win');
                                                },
                                                className: "py-1.5 rounded bg-[#F5C451] text-slate-950 font-black cursor-pointer",
                                                children: "\uD83C\uDFC6 End Win"
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    isFloatingJoystick ? /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                onPointerDown: function onPointerDown(e) {
                                    return startJoystick(e, true);
                                },
                                onPointerMove: moveJoystick,
                                onPointerUp: endJoystick,
                                onPointerCancel: endJoystick,
                                className: "absolute left-0 bottom-0 w-[40%] h-[50%] z-20 touch-none cursor-pointer",
                                title: "Floating Joystick Zone (Touch & drag anywhere here, or use WASD/Arrows)"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                style: floatingJoyCenter ? {
                                    left: "" + floatingJoyCenter.x + "px",
                                    top: "" + floatingJoyCenter.y + "px",
                                    transform: "translate(-50%, -50%) scale(" + ((_ref4 = (_customLayout_joystick = customLayout.joystick) == null ? void 0 : _customLayout_joystick.scale) != null ? _ref4 : 1) + ")",
                                    opacity: ((_ref5 = (_customLayout_joystick1 = customLayout.joystick) == null ? void 0 : _customLayout_joystick1.opacity) != null ? _ref5 : 1) * uiOpacity
                                } : _extends({}, getCtrlStyle('joystick', {
                                    xPct: 12,
                                    yPct: 78
                                }), {
                                    opacity: 0.38 * uiOpacity
                                }),
                                className: "fixed z-20 w-32 h-32 rounded-full bg-[#0B132B]/55 border-2 border-[#F5C451]/55 flex items-center justify-center pointer-events-none",
                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    style: {
                                        transform: "translate(" + joyKnob.x + "px, " + joyKnob.y + "px)"
                                    },
                                    className: "w-12 h-12 rounded-full bg-gradient-to-br from-[#F5C451] to-[#B4781A] border-2 border-white shadow-lg"
                                })
                            })
                        ]
                    }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        style: getCtrlStyle('joystick', {
                            xPct: 12,
                            yPct: 78
                        }),
                        onPointerDown: function onPointerDown(e) {
                            return startJoystick(e, false);
                        },
                        onPointerMove: moveJoystick,
                        onPointerUp: endJoystick,
                        onPointerCancel: endJoystick,
                        className: "absolute z-20 w-32 h-32 rounded-full bg-[#0B132B]/55 border-2 border-[#F5C451]/45 flex items-center justify-center touch-none cursor-pointer",
                        title: "Move Joystick (or WASD / Arrow Keys)",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            style: {
                                transform: "translate(" + joyKnob.x + "px, " + joyKnob.y + "px)"
                            },
                            className: "w-12 h-12 rounded-full bg-gradient-to-br from-[#F5C451] to-[#B4781A] border-2 border-white shadow-lg pointer-events-none"
                        })
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        style: {
                            opacity: uiOpacity
                        },
                        className: "absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-1.5 pointer-events-none max-w-[44vw]",
                        children: [
                            snap.player.passiveStacks > 0 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                title: snap.player.passiveName,
                                className: "px-2 py-0.5 rounded-lg bg-[#0B132B]/92 border border-[#F5C451]/75 text-[10px] font-black text-[#F5C451] mlbb-num shadow",
                                children: [
                                    "✨ ",
                                    snap.player.passiveName,
                                    " \xd7",
                                    snap.player.passiveStacks
                                ]
                            }),
                            snap.player.isJungler && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "px-2 py-0.5 rounded-lg bg-purple-950/90 border border-purple-400 text-[10px] font-black text-purple-200 mlbb-num",
                                children: [
                                    "⚔️ Retri ",
                                    snap.player.junglerStacks,
                                    "/5"
                                ]
                            }),
                            snap.player.isRoamer && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "px-2 py-0.5 rounded-lg bg-amber-950/90 border border-amber-400 text-[10px] font-black text-amber-200 mlbb-num",
                                children: [
                                    "\uD83D\uDEE1️ Roam ",
                                    snap.player.roamGold,
                                    "/600g"
                                ]
                            }),
                            snap.activeBuffs.map(function(b) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsx)(_HudWidgets.BuffRadialBadge, {
                                    buff: b
                                }, b.id);
                            }),
                            snap.player.nearFlyingCloud && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerFlyingCloud();
                                },
                                className: "pointer-events-auto px-3 py-1 rounded-xl bg-purple-600 border-2 border-white text-xs font-black text-white cursor-pointer",
                                children: "☁️ LAUNCH CLOUD"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        onClick: function onClick() {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerRecall();
                        },
                        style: getCtrlStyle('recall', {
                            xPct: 43,
                            yPct: 89
                        }),
                        className: "absolute z-20 w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center text-xs font-black cursor-pointer shadow-lg " + (snap.player.recalling ? 'bg-sky-600 border-white text-white animate-pulse' : 'bg-[#0B132B]/92 border-sky-400/70 text-sky-200'),
                        title: "Shielded Recall to Fountain (B) — Survives hits absorbed by Shield!",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-base leading-none",
                                children: "\uD83C\uDF00"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-[9px] mlbb-num",
                                children: snap.player.recalling ? "" + Math.round(snap.player.recallProg * 100) + "%" : 'B'
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        disabled: snap.regenCd > 0,
                        onClick: function onClick() {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerRegen();
                        },
                        style: getCtrlStyle('regen', {
                            xPct: 50,
                            yPct: 89
                        }),
                        className: "absolute z-20 w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center text-xs font-black cursor-pointer shadow-lg " + (snap.player.regening ? 'bg-emerald-600/90 border-white text-white' : 'bg-[#0B132B]/92 border-emerald-400/70 text-emerald-200'),
                        title: "Regen Heal (G) — Interrupted by incoming Hero/Turret damage",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-base leading-none",
                                children: "\uD83D\uDC9A"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-[9px] mlbb-num",
                                children: snap.regenCd > 0 ? "" + Math.ceil(snap.regenCd) + "s" : 'G'
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        onPointerDown: function onPointerDown(e) {
                            if (e.altKey || e.shiftKey) {
                                var _engineRef_current;
                                e.stopPropagation();
                                (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.signalSpellStatus();
                                return;
                            }
                            startSkillDrag(e, 'spell', 420, 120, 'line');
                        },
                        onPointerMove: function onPointerMove(e) {
                            return moveSkillDrag(e, 420);
                        },
                        onPointerUp: endSkillDrag,
                        style: _extends({}, getCtrlStyle('spell', {
                            xPct: 57,
                            yPct: 89
                        }), {
                            borderColor: snap.spell.color
                        }),
                        className: "absolute z-20 w-14 h-14 rounded-full bg-[#0B132B]/95 border-2 flex flex-col items-center justify-center text-xs font-black text-white cursor-pointer shadow-xl",
                        title: "" + snap.spell.name + " (F) \xb7 Drag to \uD83D\uDCE1 Signal CD or Alt/Shift+Click",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-xl leading-none",
                                children: snap.spell.icon
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-[9px] mlbb-num",
                                children: snap.spell.cd > 0 ? "" + Math.ceil(snap.spell.cd) + "s" : 'F'
                            })
                        ]
                    }),
                    profile.settings.controls.heroLockMode && snap.nearbyEnemies.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "absolute right-16 bottom-64 z-20 flex items-center gap-1.5",
                        children: snap.nearbyEnemies.map(function(en) {
                            var locked = snap.lockedTargetId === en.id;
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    var _engineRef_current;
                                    _AudioEngine.mlbbAudio.playClick();
                                    (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setLockedTarget(en.id);
                                },
                                className: "relative p-1 rounded-full border-2 cursor-pointer transition-transform " + (locked ? 'border-rose-500 scale-110 bg-rose-950/85 ring-2 ring-rose-400/60' : 'border-slate-500 bg-[#0B132B]/85'),
                                title: "Lock Target: " + en.name + " (" + Math.round(en.hpPct * 100) + "% HP)",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                        heroId: en.heroId,
                                        size: 34
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 rounded bg-slate-950/90 text-[8px] font-black text-rose-300 mlbb-num",
                                        children: [
                                            Math.round(en.hpPct * 100),
                                            "%"
                                        ]
                                    })
                                ]
                            }, en.id);
                        })
                    }),
                    snap.skills.map(function(sk) {
                        var idKey = "skill" + sk.slot;
                        var fallback = sk.slot === 1 ? {
                            xPct: 73,
                            yPct: 87
                        } : sk.slot === 2 ? {
                            xPct: 79,
                            yPct: 71
                        } : {
                            xPct: 89,
                            yPct: 62
                        };
                        var isPop = readyPopSlots[sk.slot] && Date.now() - readyPopSlots[sk.slot] < 900;
                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            style: getCtrlStyle(idKey, fallback),
                            className: "absolute z-20 flex flex-col items-center",
                            children: [
                                sk.canUpgrade && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    onClick: function onClick() {
                                        var _engineRef_current;
                                        return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.upgradePlayerSkill(sk.slot);
                                    },
                                    className: "mb-1 w-8 h-8 rounded-full bg-[#F5C451] border-2 border-white text-slate-950 font-black text-base shadow-lg cursor-pointer animate-bounce",
                                    title: "Level Up " + sk.name,
                                    children: "+"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    onPointerDown: function onPointerDown(e) {
                                        if (e.altKey || e.shiftKey) {
                                            var _engineRef_current;
                                            e.stopPropagation();
                                            (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.signalSkillStatus(sk.slot);
                                            return;
                                        }
                                        if (sk.level <= 0) return;
                                        startSkillDrag(e, sk.slot, sk.range, sk.radius, sk.telegraph);
                                    },
                                    onPointerMove: function onPointerMove(e) {
                                        return moveSkillDrag(e, sk.range);
                                    },
                                    onPointerUp: endSkillDrag,
                                    style: {
                                        borderColor: sk.recastActive ? '#FACC15' : sk.level > 0 ? sk.color : '#475569',
                                        '--mlbb-pop-color': sk.color
                                    },
                                    className: "relative w-16 h-16 rounded-full bg-[#0B132B]/94 border-2 flex flex-col items-center justify-center shadow-xl cursor-pointer " + (isPop ? 'mlbb-skill-ready-pop' : '') + " " + (sk.level <= 0 ? 'opacity-50' : ''),
                                    title: sk.name + " (" + (sk.slot === 1 ? 'Q' : sk.slot === 2 ? 'E' : 'R') + ") — Drag to Aim \xb7 Drag to \uD83D\uDCE1 Signal CD or Alt/Shift+Click",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "text-2xl leading-none",
                                            children: sk.icon
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "text-[9px] font-black text-slate-200 mt-0.5 mlbb-num",
                                            children: sk.level === 0 ? 'LOCK' : sk.cd > 0 ? "" + sk.cd.toFixed(1) + "s" : sk.recastActive ? 'RECAST' : sk.slot === 1 ? 'Q' : sk.slot === 2 ? 'E' : 'R'
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "absolute -bottom-1.5 flex gap-0.5",
                                            children: Array.from({
                                                length: sk.maxLevel
                                            }).map(function(_, pi) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "w-1.5 h-1.5 rounded-full " + (pi < sk.level ? 'bg-[#F5C451]' : 'bg-slate-700')
                                                }, pi);
                                            })
                                        })
                                    ]
                                })
                            ]
                        }, sk.slot);
                    }),
                    snap.extraSkill4 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        onPointerDown: function onPointerDown(e) {
                            if (e.altKey || e.shiftKey) {
                                var _engineRef_current;
                                e.stopPropagation();
                                (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.signalSkill4Status();
                                return;
                            }
                            startSkillDrag(e, 4, snap.extraSkill4.range, snap.extraSkill4.radius, 'circle');
                        },
                        onPointerMove: function onPointerMove(e) {
                            return moveSkillDrag(e, snap.extraSkill4.range);
                        },
                        onPointerUp: endSkillDrag,
                        style: _extends({}, getCtrlStyle('skill4', {
                            xPct: 72,
                            yPct: 68
                        }), {
                            borderColor: snap.extraSkill4.color
                        }),
                        className: "absolute z-20 w-14 h-14 rounded-full bg-[#0B132B]/95 border-2 flex flex-col items-center justify-center text-white font-black shadow-xl cursor-pointer",
                        title: "" + snap.extraSkill4.name + " (V) \xb7 4th Skill \xb7 Drag to \uD83D\uDCE1 Signal CD or Alt/Shift+Click",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-xl leading-none",
                                children: snap.extraSkill4.icon
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-[9px] mlbb-num",
                                children: snap.extraSkill4.cd > 0 ? "" + snap.extraSkill4.cd.toFixed(1) + "s" : 'V'
                            })
                        ]
                    }),
                    snap.activeItem && /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        onClick: function onClick() {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerActiveItem();
                        },
                        style: getCtrlStyle('activeItem', {
                            xPct: 64,
                            yPct: 78
                        }),
                        className: "absolute z-20 w-13 h-13 rounded-full bg-[#0B132B]/95 border-2 border-[#F5C451] flex flex-col items-center justify-center text-white font-black cursor-pointer shadow-xl",
                        title: "" + snap.activeItem.name + " (X)",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-lg leading-none",
                                children: snap.activeItem.icon
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-[9px] mlbb-num",
                                children: snap.activeItem.cd > 0 ? "" + Math.ceil(snap.activeItem.cd) + "s" : 'X'
                            })
                        ]
                    }),
                    profile.settings.controls.targetingMethod === 'advanced' && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onPointerDown: function onPointerDown() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setHoldingAttack(true, 'minion');
                                },
                                onPointerUp: function onPointerUp() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setHoldingAttack(false, 'minion');
                                },
                                onPointerLeave: function onPointerLeave() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setHoldingAttack(false, 'minion');
                                },
                                style: getCtrlStyle('minionBtn', {
                                    xPct: 81,
                                    yPct: 91
                                }),
                                className: "absolute z-20 w-11 h-11 rounded-full bg-[#0B132B]/92 border-2 border-emerald-400/80 text-sm font-black text-emerald-200 cursor-pointer shadow-lg",
                                title: "Attack Minions / Creeps (Z)",
                                children: "\uD83D\uDC7E"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onPointerDown: function onPointerDown() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setHoldingAttack(true, 'turret');
                                },
                                onPointerUp: function onPointerUp() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setHoldingAttack(false, 'turret');
                                },
                                onPointerLeave: function onPointerLeave() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setHoldingAttack(false, 'turret');
                                },
                                style: getCtrlStyle('turretBtn', {
                                    xPct: 95,
                                    yPct: 73
                                }),
                                className: "absolute z-20 w-11 h-11 rounded-full bg-[#0B132B]/92 border-2 border-amber-400/80 text-sm font-black text-amber-200 cursor-pointer shadow-lg",
                                title: "Attack Turret (C)",
                                children: "\uD83C\uDFF0"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        onPointerDown: function onPointerDown() {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setHoldingAttack(true, 'hero');
                        },
                        onPointerUp: function onPointerUp() {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setHoldingAttack(false, 'hero');
                        },
                        onPointerLeave: function onPointerLeave() {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setHoldingAttack(false, 'hero');
                        },
                        style: getCtrlStyle('basicAtk', {
                            xPct: 89,
                            yPct: 84
                        }, 'basic_atk'),
                        className: "absolute z-20 w-20 h-20 rounded-full bg-[#F5C451] bg-gradient-to-br from-[#F5C451] to-[#B45309] border-4 border-amber-100 text-slate-950 font-black text-xs flex flex-col items-center justify-center shadow-2xl active:scale-95 cursor-pointer",
                        title: "Basic Attack (Space)",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-2xl leading-none",
                                children: "⚔️"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-[10px]",
                                children: "ATTACK"
                            })
                        ]
                    }),
                    !snap.player.alive && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "fixed inset-x-0 top-24 z-30 flex justify-center pointer-events-none",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "pointer-events-auto px-5 py-2.5 rounded-2xl bg-rose-950/92 border-2 border-rose-500 text-center flex flex-col items-center gap-1.5 shadow-2xl",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "text-sm font-black text-rose-200",
                                    children: "YOU HAVE BEEN SLAIN"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "text-xs text-white font-bold mlbb-num",
                                    children: [
                                        "Respawning in ",
                                        snap.player.respawnSec,
                                        "s \xb7 Click any ally portrait (top-left) to spectate"
                                    ]
                                }),
                                snap.player.deathRecap && /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    onClick: function onClick() {
                                        return setDeathRecapOpen(true);
                                    },
                                    className: "px-3.5 py-1.5 rounded-lg bg-[#F5C451] text-slate-950 font-black text-xs cursor-pointer",
                                    children: [
                                        "\uD83D\uDCCA Death Recap (",
                                        snap.player.deathRecap.totalDamage.toLocaleString(),
                                        " DMG \xb7 ",
                                        ((_snap_player_deathRecap_totalCcSec = snap.player.deathRecap.totalCcSec) != null ? _snap_player_deathRecap_totalCcSec : 0).toFixed(1),
                                        "s CC)"
                                    ]
                                })
                            ]
                        })
                    }),
                    minimapExpanded && /*#__PURE__*/ (0, _jsxruntime.jsx)(_ExpandedMinimap.ExpandedMinimap, {
                        engine: engineRef.current,
                        playerPos: {
                            x: snap.player.x,
                            y: snap.player.y
                        },
                        onClose: function onClose() {
                            return setMinimapExpanded(false);
                        }
                    }),
                    deathRecapOpen && snap.player.deathRecap && /*#__PURE__*/ (0, _jsxruntime.jsx)(_DeathRecapModal.DeathRecapModal, {
                        recap: snap.player.deathRecap,
                        respawnSec: snap.player.respawnSec,
                        onOpenShop: function onOpenShop() {
                            return setShopOpen(true);
                        },
                        onClose: function onClose() {
                            return setDeathRecapOpen(false);
                        }
                    }),
                    shopOpen && /*#__PURE__*/ (0, _jsxruntime.jsx)(_InMatchOverlays.InMatchShopModal, {
                        snap: snap,
                        builds: playerBuilds,
                        uiOpacity: uiOpacity,
                        hasBargainHunter: hasBargainHunter,
                        onBuy: function onBuy(id) {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.buyItem(id);
                        },
                        onSell: function onSell(idx) {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.sellItem(idx);
                        },
                        onPrioritize: function onPrioritize(id) {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.prioritizeItem(id);
                        },
                        onSwitchBuild: function onSwitchBuild(idx) {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.switchBuildPreset(idx, playerBuilds[idx]);
                        },
                        onPingNeedGold: function onPingNeedGold(id) {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.pingNeedGoldForItem(id);
                        },
                        onClose: function onClose() {
                            return setShopOpen(false);
                        }
                    }),
                    scoreboardOpen && /*#__PURE__*/ (0, _jsxruntime.jsx)(_InMatchOverlays.InMatchScoreboardModal, {
                        snap: snap,
                        uiOpacity: uiOpacity,
                        onSignalTarget: function onSignalTarget(heroId, kind) {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.signalScoreboardTarget(heroId, kind);
                        },
                        onClose: function onClose() {
                            return setScoreboardOpen(false);
                        }
                    }),
                    settingsOpen && /*#__PURE__*/ (0, _jsxruntime.jsx)(_SettingsAndCustomUi.SettingsAndCustomUiModal, {
                        settings: profile.settings,
                        inMatch: true,
                        surrenderAvailable: snap.surrenderAvailable,
                        onUpdateSettings: onUpdateSettings,
                        onSurrender: function onSurrender() {
                            var _engineRef_current;
                            (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.initiateSurrender();
                            setSettingsOpen(false);
                        },
                        onExitMatch: onExitToLobby,
                        onClose: function onClose() {
                            return setSettingsOpen(false);
                        }
                    })
                ]
            })
        ]
    });
};

});

})(window.ArcadeMod);
