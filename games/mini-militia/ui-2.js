(function(ArcadeMod){
// === MODULE: src/games/mini-militia/components/BattleHUD ===
ArcadeMod.define("src/games/mini-militia/components/BattleHUD", function(require, module, exports) {
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
var _GameEngine = require("../engine/GameEngine");
var _progression = require("../data/progression");
var _weapons = require("../data/weapons");
var _AudioEngine = require("../engine/AudioEngine");
var _AvatarPreviewCanvas = require("./AvatarPreviewCanvas");
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
    var s = Math.max(0, Math.ceil(sec));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ":" + (r < 10 ? '0' : '') + r;
}
var BattleHUD = function BattleHUD(param) {
    var config = param.config, save = param.save, onMatchFinish = param.onMatchFinish, onExitToLobby = param.onExitToLobby, onOpenSettings = param.onOpenSettings;
    var _hud_player_grenades_hud_player_grenadeType;
    var canvasRef = (0, _react.useRef)(null);
    var engineRef = (0, _react.useRef)(null);
    var _useState = (0, _react.useState)(null), hud = _useState[0], setHud = _useState[1];
    var _useState1 = (0, _react.useState)(false), paused = _useState1[0], setPaused = _useState1[1];
    var _useState2 = (0, _react.useState)(false), showScoreboard = _useState2[0], setShowScoreboard = _useState2[1];
    var _useState3 = (0, _react.useState)(false), showQuickChat = _useState3[0], setShowQuickChat = _useState3[1];
    // Virtual Joystick visual knob offsets
    var _useState4 = (0, _react.useState)({
        dx: 0,
        dy: 0,
        active: false
    }), leftKnob = _useState4[0], setLeftKnob = _useState4[1];
    var _useState5 = (0, _react.useState)({
        dx: 0,
        dy: 0,
        active: false,
        firing: false
    }), rightKnob = _useState5[0], setRightKnob = _useState5[1];
    var leftPointerId = (0, _react.useRef)(null);
    var rightPointerId = (0, _react.useRef)(null);
    var leftOrigin = (0, _react.useRef)({
        x: 0,
        y: 0
    });
    var rightOrigin = (0, _react.useRef)({
        x: 0,
        y: 0
    });
    // Mount & start 60Hz MiniMilitiaGameEngine
    (0, _react.useEffect)(function() {
        var canvas = canvasRef.current;
        if (!canvas) return;
        var resize = function resize() {
            var parent = canvas.parentElement;
            if (!parent) return;
            canvas.width = Math.max(640, parent.clientWidth);
            canvas.height = Math.max(360, parent.clientHeight);
        };
        resize();
        window.addEventListener('resize', resize);
        var rankDiscount = (0, _progression.getMmRankForXp)(save.xp).current.discountPct;
        var eng = new _GameEngine.MiniMilitiaGameEngine(canvas, config, save, rankDiscount, function(snap) {
            return setHud(snap);
        }, function(summary) {
            return onMatchFinish(summary);
        });
        engineRef.current = eng;
        eng.start();
        return function() {
            window.removeEventListener('resize', resize);
            eng.destroy();
            engineRef.current = null;
        };
    // Intentionally mount once per match config
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        config
    ]);
    // Live-sync settings updates into running engine
    (0, _react.useEffect)(function() {
        var _engineRef_current;
        (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.updateSettings(save.settings);
    }, [
        save.settings
    ]);
    // Tab scoreboard & Esc pause keyboard shortcuts
    (0, _react.useEffect)(function() {
        var onKeyDown = function onKeyDown(e) {
            if (e.code === 'Tab') {
                e.preventDefault();
                setShowScoreboard(true);
            } else if (e.code === 'Escape') {
                e.preventDefault();
                setPaused(function(prev) {
                    var _engineRef_current;
                    var next = !prev;
                    (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setPaused(next);
                    return next;
                });
            }
        };
        var onKeyUp = function onKeyUp(e) {
            if (e.code === 'Tab') {
                e.preventDefault();
                setShowScoreboard(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return function() {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, []);
    var togglePause = function togglePause(next) {
        var _engineRef_current;
        _AudioEngine.mmAudio.playClick();
        setPaused(next);
        (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setPaused(next);
    };
    // Helper to apply custom HUD positions/scale/opacity (and Left-Handed flip)
    var ctrlStyle = function ctrlStyle(id, fallbackX, fallbackY) {
        var _ref, _ref1, _ref2, _ref3;
        var c = save.customHud[id];
        var x = (_ref = c == null ? void 0 : c.xPct) != null ? _ref : fallbackX;
        if (save.settings.controls.leftHanded) x = 100 - x;
        var y = (_ref1 = c == null ? void 0 : c.yPct) != null ? _ref1 : fallbackY;
        var scale = (_ref2 = c == null ? void 0 : c.scale) != null ? _ref2 : 1;
        var opacity = (_ref3 = c == null ? void 0 : c.opacity) != null ? _ref3 : 0.9;
        return {
            left: "" + x + "%",
            top: "" + y + "%",
            opacity: opacity,
            transform: "translate(-50%, -50%) scale(" + scale + ")"
        };
    };
    // Virtual Joystick Pointer Handlers (Multi-Touch Safe)
    var STICK_RADIUS = 46;
    var onLeftStickDown = function onLeftStickDown(e) {
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        leftPointerId.current = e.pointerId;
        var rect = e.currentTarget.getBoundingClientRect();
        leftOrigin.current = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        updateLeftStick(e.clientX, e.clientY);
    };
    var updateLeftStick = function updateLeftStick(cx, cy) {
        var _engineRef_current;
        var dx = cx - leftOrigin.current.x;
        var dy = cy - leftOrigin.current.y;
        var dist = Math.hypot(dx, dy);
        var clamped = Math.min(STICK_RADIUS, dist);
        var ang = Math.atan2(dy, dx);
        var kx = Math.cos(ang) * clamped;
        var ky = Math.sin(ang) * clamped;
        setLeftKnob({
            dx: kx,
            dy: ky,
            active: true
        });
        (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setTouchMoveStick(kx / STICK_RADIUS, ky / STICK_RADIUS);
    };
    var onLeftStickMove = function onLeftStickMove(e) {
        if (leftPointerId.current !== e.pointerId) return;
        updateLeftStick(e.clientX, e.clientY);
    };
    var onLeftStickUp = function onLeftStickUp(e) {
        var _engineRef_current;
        if (leftPointerId.current !== e.pointerId) return;
        leftPointerId.current = null;
        setLeftKnob({
            dx: 0,
            dy: 0,
            active: false
        });
        (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setTouchMoveStick(0, 0);
    };
    var onRightStickDown = function onRightStickDown(e) {
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        rightPointerId.current = e.pointerId;
        var rect = e.currentTarget.getBoundingClientRect();
        rightOrigin.current = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        updateRightStick(e.clientX, e.clientY);
    };
    var updateRightStick = function updateRightStick(cx, cy) {
        var _engineRef_current;
        var dx = cx - rightOrigin.current.x;
        var dy = cy - rightOrigin.current.y;
        var dist = Math.hypot(dx, dy);
        var clamped = Math.min(STICK_RADIUS, dist);
        var ang = Math.atan2(dy, dx);
        var kx = Math.cos(ang) * clamped;
        var ky = Math.sin(ang) * clamped;
        var mag = clamped / STICK_RADIUS;
        var firing = save.settings.controls.controlScheme === 'dual_stick' && mag >= save.settings.controls.fireRingThreshold / 100;
        setRightKnob({
            dx: kx,
            dy: ky,
            active: true,
            firing: firing
        });
        (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setTouchAimStick(true, ang, mag);
    };
    var onRightStickMove = function onRightStickMove(e) {
        if (rightPointerId.current !== e.pointerId) return;
        updateRightStick(e.clientX, e.clientY);
    };
    var onRightStickUp = function onRightStickUp(e) {
        var _engineRef_current;
        if (rightPointerId.current !== e.pointerId) return;
        rightPointerId.current = null;
        setRightKnob({
            dx: 0,
            dy: 0,
            active: false,
            firing: false
        });
        (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setTouchAimStick(false, 0, 0);
    };
    var activeGrenade = hud ? (0, _weapons.getMmGrenadeById)(hud.player.grenadeType) : null;
    var allLoadouts = [].concat(_weapons.MM_PREBUILT_LOADOUTS, save.customLoadouts);
    var rankDiscount = (0, _progression.getMmRankForXp)(save.xp).current.discountPct;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "relative w-full h-full bg-[#111612] overflow-hidden select-none",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("canvas", {
                ref: canvasRef,
                className: "w-full h-full block cursor-crosshair"
            }),
            hud && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "pointer-events-none absolute top-2 left-2 z-20 flex flex-col gap-1.5 max-w-[235px]",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "px-2.5 py-1 rounded bg-[#181C1F]/85 border border-[#4F5D3B] flex items-center gap-2 font-mono text-xs tabular-nums shadow",
                                children: [
                                    hud.mode === 'survival' ? /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-[#F5A623] font-black",
                                                children: [
                                                    "WAVE ",
                                                    hud.survivalWave
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-[#D6D3C4]",
                                                children: [
                                                    "\xb7 ",
                                                    hud.survivalEnemiesAlive,
                                                    " Left"
                                                ]
                                            })
                                        ]
                                    }) : hud.mode === 'bootcamp' ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "text-[#F5A623] font-black",
                                        children: [
                                            "BOOT CAMP ",
                                            hud.bootcampStep + 1,
                                            "/7"
                                        ]
                                    }) : hud.mode === 'ffa' ? /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-[#F5A623] font-black",
                                                children: [
                                                    "#",
                                                    hud.ffaRank
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                children: [
                                                    hud.player.kills,
                                                    "/",
                                                    hud.scoreLimit,
                                                    " K"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[#C2B280]",
                                                children: formatClock(hud.timeRemainingSec)
                                            })
                                        ]
                                    }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[#38BDF8] font-black",
                                                children: hud.scoreBlue
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[#6B7280]",
                                                children: "-"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[#F87171] font-black",
                                                children: hud.scoreRed
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[#C2B280] ml-1",
                                                children: formatClock(hud.timeRemainingSec)
                                            })
                                        ]
                                    }),
                                    save.settings.video.showFpsPing && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "text-[10px] text-[#9CA3AF] ml-auto",
                                        children: [
                                            hud.fps,
                                            "FPS \xb7 ",
                                            hud.pingMs,
                                            "ms"
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "px-2 py-1 rounded bg-[#181C1F]/85 border border-[#4F5D3B] shadow",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between text-[10px] font-mono",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[#22C55E] font-bold",
                                                children: "✚ HEALTH"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "tabular-nums font-bold text-white",
                                                children: [
                                                    Math.ceil(hud.player.hp),
                                                    "/",
                                                    hud.player.maxHp
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "w-full h-2 bg-[#111] rounded-sm overflow-hidden mt-0.5",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h-full transition-all " + (hud.player.hp / hud.player.maxHp < 0.3 ? 'bg-[#EF4444]' : 'bg-[#22C55E]'),
                                            style: {
                                                width: "" + Math.max(0, hud.player.hp / hud.player.maxHp * 100) + "%"
                                            }
                                        })
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between text-[10px] font-mono mt-1",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: hud.player.empDisabledSec > 0 ? 'text-[#38BDF8] font-bold' : 'text-[#F5A623] font-bold',
                                                children: hud.player.empDisabledSec > 0 ? '⚡ EMP DISABLED' : '🚀 NITRO'
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "tabular-nums text-[#C2B280]",
                                                children: [
                                                    Math.round(hud.player.jetFuel),
                                                    "%"
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "w-full h-1.5 bg-[#111] rounded-sm overflow-hidden mt-0.5",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h-full " + (hud.player.empDisabledSec > 0 ? 'bg-[#38BDF8]' : 'bg-[#F5A623]'),
                                            style: {
                                                width: "" + Math.max(0, hud.player.jetFuel / hud.player.maxJetFuel * 100) + "%"
                                            }
                                        })
                                    })
                                ]
                            }),
                            (hud.player.stealthHidden || hud.player.carryingFlag || hud.player.boostTimer > 0) && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex flex-wrap gap-1 text-[10px] font-mono font-bold",
                                children: [
                                    hud.player.stealthHidden && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "px-1.5 py-0.5 rounded bg-[#1F2937]/90 border border-[#9CA3AF] text-[#E5E7EB]",
                                        children: "\uD83D\uDC41️ STEALTH"
                                    }),
                                    hud.player.carryingFlag && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "px-1.5 py-0.5 rounded bg-[#F5A623] text-[#181C1F]",
                                        children: "\uD83D\uDEA9 FLAG CARRIER"
                                    }),
                                    hud.player.boostTimer > 0 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "px-1.5 py-0.5 rounded bg-[#DC2626] text-white",
                                        children: [
                                            "⚡ BOOST ",
                                            hud.player.boostTimer.toFixed(0),
                                            "s"
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerSwapWeapon();
                                },
                                title: "Tap or press Q to Swap Weapon",
                                className: "pointer-events-auto flex items-center gap-2 px-3 py-1 rounded bg-[#181C1F]/90 hover:bg-[#23272A] border-2 border-[#4F5D3B] hover:border-[#F5A623] shadow-lg",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.WeaponVectorIcon, {
                                        weaponId: hud.player.activeWeaponId,
                                        width: 68,
                                        height: 26
                                    }),
                                    hud.player.offhandWeaponId && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[#F5A623] font-black text-xs",
                                                children: "+"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.WeaponVectorIcon, {
                                                weaponId: hud.player.offhandWeaponId,
                                                width: 54,
                                                height: 22
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-left font-mono leading-tight",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-[11px] font-black text-[#F5A623] truncate max-w-[130px]",
                                                children: [
                                                    hud.player.activeWeaponName,
                                                    hud.player.offhandWeaponName ? " + " + hud.player.offhandWeaponName : ''
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-xs font-bold tabular-nums text-white",
                                                children: hud.player.reloading ? "RELOADING " + Math.round(hud.player.reloadProgress * 100) + "%" : hud.player.mag + "/" + hud.player.magMax + " \xb7 " + hud.player.reserve
                                            })
                                        ]
                                    })
                                ]
                            }),
                            hud.mode === 'bootcamp' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "px-3 py-1 rounded bg-[#2A3320]/95 border border-[#F5A623] text-xs font-mono font-bold text-[#FEF08A] text-center max-w-md shadow",
                                children: [
                                    "\uD83C\uDF96️ SARGE: ",
                                    hud.bootcampPrompt
                                ]
                            }),
                            hud.mode === 'ptb' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "px-3 py-1 rounded bg-[#7F1D1D]/90 border border-[#F87171] text-xs font-mono font-bold text-white",
                                children: [
                                    hud.ptbBombState === 'planted' ? "\uD83D\uDCA3 BOMB AT SITE " + hud.ptbBombSite + " \xb7 " + hud.ptbBombTimer.toFixed(1) + "s" : "ROUND " + hud.ptbRound + " \xb7 BLUE " + hud.ptbBlueRounds + " - " + hud.ptbRedRounds + " RED",
                                    hud.ptbCanPlantOrDefuse && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "ml-2 text-[#FEF08A]",
                                        children: [
                                            "HOLD E TO ",
                                            hud.ptbCanPlantOrDefuse.toUpperCase(),
                                            " (",
                                            Math.round(hud.ptbActionProgress * 100),
                                            "%)"
                                        ]
                                    })
                                ]
                            }),
                            hud.banner && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "px-4 py-1.5 rounded bg-black/80 border-2 text-center shadow-xl",
                                style: {
                                    borderColor: hud.banner.color
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-sm font-black uppercase tracking-wider",
                                        style: {
                                            color: hud.banner.color
                                        },
                                        children: hud.banner.text
                                    }),
                                    hud.banner.sub && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[11px] font-mono text-[#E5E7EB]",
                                        children: hud.banner.sub
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "absolute top-2 right-2 z-20 flex flex-col items-end gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            _AudioEngine.mmAudio.playClick();
                                            setShowScoreboard(function(v) {
                                                return !v;
                                            });
                                        },
                                        className: "px-2 py-1 rounded bg-[#181C1F]/90 hover:bg-[#2A3320] border border-[#4F5D3B] text-xs font-mono text-[#C2B280]",
                                        title: "Live Scoreboard (Tab)",
                                        children: "\uD83D\uDCCA"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            return togglePause(!paused);
                                        },
                                        className: "px-2.5 py-1 rounded bg-[#181C1F]/90 hover:bg-[#2A3320] border border-[#F5A623]/70 text-xs font-black text-[#F5A623]",
                                        title: "Pause Match (Esc)",
                                        children: "⏸"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "pointer-events-none flex flex-col items-end gap-1",
                                children: hud.killFeed.slice(0, 4).map(function(kf) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "px-2 py-0.5 rounded bg-black/70 border border-[#3E4A2E] text-[10px] font-mono flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: kf.killerTeam === 'blue' ? 'text-[#38BDF8] font-bold' : 'text-[#F87171] font-bold',
                                                children: kf.killer
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-[#C2B280]",
                                                children: [
                                                    "[",
                                                    kf.weaponName,
                                                    kf.headshot ? ' 🎯' : '',
                                                    "]"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: kf.victimTeam === 'blue' ? 'text-[#38BDF8]' : 'text-[#F87171]',
                                                children: kf.victim
                                            })
                                        ]
                                    }, kf.id);
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        type: "button",
                        onClick: function onClick() {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.cycleZoom();
                        },
                        style: ctrlStyle('zoomBtn', 10, 28),
                        className: "absolute z-20 px-2.5 py-1.5 rounded bg-[#181C1F]/85 hover:bg-[#2A3320] border border-[#5D7045] text-[11px] font-mono font-bold text-[#F5A623]",
                        children: [
                            "\uD83D\uDD0D ",
                            hud.player.zoomLevel.toFixed(1),
                            "x"
                        ]
                    }),
                    activeGrenade && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        style: ctrlStyle('grenadeBtn', 86, 12),
                        className: "absolute z-20 flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.cycleGrenadeType(1);
                                },
                                className: "px-1.5 py-2 rounded bg-[#181C1F]/90 border border-[#4F5D3B] text-[10px] font-mono text-[#C2B280]",
                                title: "Cycle Grenade Type (C)",
                                children: "⇄"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    var _engineRef_current;
                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerThrowGrenade();
                                },
                                className: "px-2.5 py-1.5 rounded bg-[#23272A]/90 hover:bg-[#3A472D] border-2 border-[#F5A623] text-xs font-mono font-bold flex items-center gap-1",
                                title: "Throw Grenade (G)",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: activeGrenade.icon
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "tabular-nums",
                                        children: (_hud_player_grenades_hud_player_grenadeType = hud.player.grenades[hud.player.grenadeType]) != null ? _hud_player_grenades_hud_player_grenadeType : 0
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        onClick: function onClick() {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerReload();
                        },
                        style: ctrlStyle('reloadBtn', 86, 24),
                        className: "absolute z-20 px-2.5 py-1.5 rounded bg-[#181C1F]/85 hover:bg-[#2A3320] border border-[#5D7045] text-[11px] font-mono font-bold text-[#F4F4EC]",
                        title: "Reload (R)",
                        children: "\uD83D\uDD04 RLD"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        style: ctrlStyle('quickChat', 93, 36),
                        className: "absolute z-20",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    return setShowQuickChat(function(v) {
                                        return !v;
                                    });
                                },
                                className: "w-9 h-9 rounded-full bg-[#181C1F]/85 hover:bg-[#2A3320] border border-[#5D7045] text-sm",
                                title: "Quick Chat Emotes",
                                children: "\uD83D\uDCAC"
                            }),
                            showQuickChat && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "absolute right-10 top-0 w-44 p-1.5 rounded bg-[#181C1F]/95 border border-[#F5A623] grid grid-cols-2 gap-1 shadow-xl",
                                children: _progression.MM_QUICK_CHATS.map(function(q) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            var _engineRef_current;
                                            (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerQuickChat(q.text);
                                            setShowQuickChat(false);
                                        },
                                        className: "px-1.5 py-1 rounded bg-[#2A3320] hover:bg-[#3B4B2E] text-[10px] font-mono text-left truncate",
                                        children: q.text
                                    }, q.id);
                                })
                            })
                        ]
                    }),
                    hud.nearbyPickup && hud.player.alive && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded bg-[#181C1F]/95 border-2 border-[#F5A623] shadow-xl",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.WeaponVectorIcon, {
                                weaponId: hud.nearbyPickup.weaponId,
                                width: 60,
                                height: 24
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "text-xs font-mono",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "font-bold text-white",
                                        children: hud.nearbyPickup.weaponName
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex gap-1.5 mt-1",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerPickup(false);
                                                },
                                                className: "px-2 py-0.5 rounded bg-[#F5A623] text-[#181C1F] text-[10px] font-black uppercase",
                                                children: "[E] SWAP"
                                            }),
                                            hud.nearbyPickup.canDualWield && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    var _engineRef_current;
                                                    return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerPickup(true);
                                                },
                                                className: "px-2 py-0.5 rounded bg-[#22C55E] text-[#0F172A] text-[10px] font-black uppercase",
                                                children: "[X] + DUAL WIELD"
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        style: ctrlStyle('leftStick', 12, 76),
                        onPointerDown: onLeftStickDown,
                        onPointerMove: onLeftStickMove,
                        onPointerUp: onLeftStickUp,
                        onPointerCancel: onLeftStickUp,
                        className: "absolute z-20 w-28 h-28 rounded-full border-2 border-[#C2B280]/55 bg-[#181C1F]/45 touch-none flex items-center justify-center",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "text-[9px] font-mono text-[#C2B280]/70 absolute top-1.5",
                                children: "\uD83D\uDE80 UP"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                style: {
                                    transform: "translate(" + leftKnob.dx + "px, " + leftKnob.dy + "px)"
                                },
                                className: "w-11 h-11 rounded-full border-2 " + (leftKnob.active ? 'border-[#F5A623] bg-[#F5A623]/45' : 'border-[#C2B280]/75 bg-[#2A3320]/75')
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        style: ctrlStyle('rightStick', 88, 76),
                        onPointerDown: onRightStickDown,
                        onPointerMove: onRightStickMove,
                        onPointerUp: onRightStickUp,
                        onPointerCancel: onRightStickUp,
                        className: "absolute z-20 w-28 h-28 rounded-full border-2 touch-none flex items-center justify-center " + (rightKnob.firing ? 'border-[#EF4444] bg-[#7F1D1D]/40' : 'border-[#F5A623]/60 bg-[#181C1F]/45'),
                        children: [
                            save.settings.controls.controlScheme === 'dual_stick' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "pointer-events-none absolute rounded-full border border-dashed border-[#EF4444]/65",
                                style: {
                                    width: "" + save.settings.controls.fireRingThreshold + "%",
                                    height: "" + save.settings.controls.fireRingThreshold + "%"
                                }
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                style: {
                                    transform: "translate(" + rightKnob.dx + "px, " + rightKnob.dy + "px)"
                                },
                                className: "w-11 h-11 rounded-full border-2 " + (rightKnob.firing ? 'border-[#FCA5A5] bg-[#EF4444]/75' : 'border-[#F5A623]/80 bg-[#23272A]/80')
                            })
                        ]
                    }),
                    save.settings.controls.controlScheme === 'separate_fire' && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        style: ctrlStyle('fireBtn', 78, 60),
                        onPointerDown: function onPointerDown() {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setTouchFireButton(true);
                        },
                        onPointerUp: function onPointerUp() {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setTouchFireButton(false);
                        },
                        onPointerLeave: function onPointerLeave() {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setTouchFireButton(false);
                        },
                        className: "absolute z-20 w-16 h-16 rounded-full bg-[#D93829]/85 active:bg-[#EF4444] border-2 border-[#FCA5A5] text-xs font-black uppercase shadow-lg touch-none",
                        children: "FIRE"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        style: ctrlStyle('crouchBtn', 26, 87),
                        onPointerDown: function onPointerDown() {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setTouchCrouch(true);
                        },
                        onPointerUp: function onPointerUp() {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setTouchCrouch(false);
                        },
                        onPointerLeave: function onPointerLeave() {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setTouchCrouch(false);
                        },
                        className: "absolute z-20 px-3 py-2 rounded-full bg-[#181C1F]/80 border border-[#C2B280]/70 text-[10px] font-mono font-bold touch-none",
                        children: "CROUCH"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        type: "button",
                        style: ctrlStyle('meleeBtn', 74, 86),
                        onPointerDown: function onPointerDown() {
                            var _engineRef_current;
                            return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.triggerMelee();
                        },
                        className: "absolute z-20 w-12 h-12 rounded-full bg-[#2A3320]/90 active:bg-[#F5A623] border-2 border-[#F5A623] text-base flex items-center justify-center shadow touch-none",
                        title: "Melee / Machete (F)",
                        children: "\uD83D\uDD2A"
                    }),
                    !hud.player.alive && !hud.matchEnded && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "absolute inset-0 z-30 bg-black/55 flex items-center justify-center p-4",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "w-full max-w-2xl p-4 rounded border-2 border-[#F5A623] bg-[#1E2420]/95 shadow-2xl space-y-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-sm font-black uppercase text-[#F87171]",
                                                    children: "KIA — RESPAWNING"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-xs font-mono text-[#C2B280]",
                                                    children: [
                                                        "Deploying in ",
                                                        hud.player.respawnSec.toFixed(1),
                                                        "s \xb7 Coins: \uD83E\uDE99 ",
                                                        hud.player.coins
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            className: "text-2xl font-mono font-black text-[#F5A623] tabular-nums",
                                            children: [
                                                Math.ceil(hud.player.respawnSec),
                                                "s"
                                            ]
                                        })
                                    ]
                                }),
                                !hud.classicV4 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-[11px] font-mono uppercase text-[#C2B280] mb-1.5",
                                            children: "QUICK SWAP RESPAWN LOADOUT"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-[190px] overflow-y-auto",
                                            children: allLoadouts.map(function(ld) {
                                                var cost = Math.round(ld.coinCost * (1 - rankDiscount / 100));
                                                var selected = hud.player.activeLoadoutId === ld.id;
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    type: "button",
                                                    disabled: cost > hud.player.coins && !selected,
                                                    onClick: function onClick() {
                                                        var _engineRef_current;
                                                        return (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.selectRespawnLoadout(ld.id);
                                                    },
                                                    className: "p-2 rounded border text-left text-[11px] " + (selected ? 'border-[#22C55E] bg-[#243822]' : 'border-[#4F5D3B] bg-[#23272A] hover:border-[#F5A623] disabled:opacity-40'),
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-bold truncate",
                                                            children: ld.name
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[10px] font-mono text-[#F5A623]",
                                                            children: selected ? '✓ ACTIVE' : cost === 0 ? 'FREE' : "\uD83E\uDE99 " + cost
                                                        })
                                                    ]
                                                }, ld.id);
                                            })
                                        })
                                    ]
                                })
                            ]
                        })
                    }),
                    showScoreboard && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "absolute inset-0 z-40 bg-black/65 flex items-center justify-center p-4",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "w-full max-w-2xl p-4 rounded border-2 border-[#5D7045] bg-[#1E2420] shadow-2xl",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex items-center justify-between mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("h3", {
                                            className: "text-sm font-black uppercase text-[#F5A623]",
                                            children: [
                                                "\uD83D\uDCCA LIVE SCOREBOARD — ",
                                                hud.mapName,
                                                " (",
                                                hud.mode.toUpperCase(),
                                                ")"
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                return setShowScoreboard(false);
                                            },
                                            className: "px-2 py-0.5 rounded bg-[#374151] text-xs font-mono",
                                            children: "Close"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("table", {
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
                                            children: hud.scoreboard.map(function(r) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("tr", {
                                                    className: r.isPlayer ? 'bg-[#364428]/70 font-bold' : '',
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                            className: "py-1",
                                                            children: [
                                                                r.isMvp ? '👑 ' : '',
                                                                r.name
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                            className: "py-1 uppercase",
                                                            children: r.team
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                            className: "py-1 text-right tabular-nums text-[#22C55E]",
                                                            children: r.kills
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                            className: "py-1 text-right tabular-nums text-[#F87171]",
                                                            children: r.deaths
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("td", {
                                                            className: "py-1 text-right tabular-nums",
                                                            children: r.assists
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("td", {
                                                            className: "py-1 text-right tabular-nums text-[#9CA3AF]",
                                                            children: [
                                                                r.pingMs,
                                                                "ms"
                                                            ]
                                                        })
                                                    ]
                                                }, r.id);
                                            })
                                        })
                                    ]
                                })
                            ]
                        })
                    }),
                    paused && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "absolute inset-0 z-40 bg-black/70 flex items-center justify-center p-4",
                        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "w-full max-w-sm p-5 rounded border-2 border-[#F5A623] bg-[#1E2420] space-y-2.5 text-center shadow-2xl",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("h3", {
                                    className: "text-lg font-black uppercase text-[#F5A623]",
                                    children: "⏸ MATCH PAUSED"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("p", {
                                    className: "text-xs font-mono text-[#C2B280]",
                                    children: [
                                        hud.mapName,
                                        " \xb7 ",
                                        hud.mode.toUpperCase()
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    onClick: function onClick() {
                                        return togglePause(false);
                                    },
                                    className: "w-full py-2.5 rounded bg-[#F5A623] text-[#181C1F] text-xs font-black uppercase",
                                    children: "▶ Resume Battle"
                                }),
                                hud.mode !== 'ffa' && hud.mode !== 'survival' && hud.mode !== 'bootcamp' && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    onClick: function onClick() {
                                        var _engineRef_current;
                                        (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.swapPlayerTeam();
                                        togglePause(false);
                                    },
                                    className: "w-full py-2 rounded bg-[#2A3320] border border-[#5D7045] text-xs font-black uppercase",
                                    children: "⇄ Switch Team"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    onClick: onOpenSettings,
                                    className: "w-full py-2 rounded bg-[#23272A] border border-[#4F5D3B] text-xs font-black uppercase",
                                    children: "⚙️ Settings & HUD Editor"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    onClick: function onClick() {
                                        _AudioEngine.mmAudio.playClick();
                                        onExitToLobby();
                                    },
                                    className: "w-full py-2 rounded bg-[#7F1D1D] hover:bg-[#B91C1C] text-xs font-black uppercase",
                                    children: "✕ Leave Match to Lobby"
                                })
                            ]
                        })
                    })
                ]
            })
        ]
    });
};

});
// === MODULE: src/games/mini-militia/components/MainLobby ===
ArcadeMod.define("src/games/mini-militia/components/MainLobby", function(require, module, exports) {
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
var _progression = require("../data/progression");
var _weapons = require("../data/weapons");
var _AudioEngine = require("../engine/AudioEngine");
var _AvatarPreviewCanvas = require("./AvatarPreviewCanvas");
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
var MainLobby = function MainLobby(param) {
    var save = param.save, onExitToArcade = param.onExitToArcade, onQuickPlay = param.onQuickPlay, onOpenOnlineBrowser = param.onOpenOnlineBrowser, onOpenCustomRoom = param.onOpenCustomRoom, onStartBootCamp = param.onStartBootCamp, onStartSurvival = param.onStartSurvival, onOpenModal = param.onOpenModal, onToggleMute = param.onToggleMute, onCycleTeamPref = param.onCycleTeamPref, onToggleClassicV4 = param.onToggleClassicV4;
    var _save_avatarPresets_save_activeAvatarPreset, _allLoadouts_find;
    var _useState = (0, _react.useState)(false), soloExpanded = _useState[0], setSoloExpanded = _useState[1];
    var rankInfo = (0, _progression.getMmRankForXp)(save.xp);
    var avatar = (_save_avatarPresets_save_activeAvatarPreset = save.avatarPresets[save.activeAvatarPreset]) != null ? _save_avatarPresets_save_activeAvatarPreset : save.avatarPresets[0];
    var allLoadouts = [].concat(_weapons.MM_PREBUILT_LOADOUTS, save.customLoadouts);
    var activeLoadout = (_allLoadouts_find = allLoadouts.find(function(l) {
        return l.id === save.activeLoadoutId;
    })) != null ? _allLoadouts_find : allLoadouts[0];
    var primaryWeapon = (0, _weapons.getMmWeaponById)(activeLoadout.primaryId);
    var secondaryWeapon = (0, _weapons.getMmWeaponById)(activeLoadout.secondaryId);
    var claimableAchievements = _progression.MM_ACHIEVEMENTS.filter(function(a) {
        return !save.claimedAchievements.includes(a.id) && a.getProgress(save) >= a.target;
    }).length;
    var click = function click(fn) {
        _AudioEngine.mmAudio.playClick();
        fn();
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "relative w-full h-full flex flex-col bg-[#1B2216] text-[#F4F4EC] overflow-hidden select-none",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "pointer-events-none absolute inset-0 opacity-15",
                style: {
                    backgroundImage: 'linear-gradient(to right, #6B7B54 1px, transparent 1px), linear-gradient(to bottom, #6B7B54 1px, transparent 1px)',
                    backgroundSize: '36px 36px'
                }
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("header", {
                className: "relative z-10 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#23272A]/95 border-b-2 border-[#4F5D3B] shadow-lg",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        type: "button",
                        onClick: function onClick() {
                            return click(function() {
                                return onOpenModal('profile');
                            });
                        },
                        className: "flex items-center gap-2.5 px-2.5 py-1.5 rounded bg-[#2A3320] hover:bg-[#354028] border border-[#5C6E45] transition text-left",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.AvatarPortraitBadge, {
                                avatar: avatar,
                                size: 42
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "min-w-[140px]",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.RankInsigniaBadge, {
                                                rank: rankInfo.current,
                                                size: 20
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "font-bold text-sm tracking-wide text-[#F4F4EC] truncate max-w-[130px]",
                                                children: [
                                                    save.clanTag ? "[" + save.clanTag + "] " : '',
                                                    save.callsign
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between text-[10px] font-mono text-[#C2B280] mt-0.5",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: rankInfo.current.title
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "tabular-nums",
                                                children: [
                                                    save.xp.toLocaleString(),
                                                    " XP"
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "w-full h-1.5 bg-[#15181A] rounded-sm overflow-hidden mt-0.5 border border-[#3E4A2E]",
                                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "h-full bg-[#F5A623] transition-all",
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
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    return click(onExitToArcade);
                                },
                                className: "px-2.5 py-1.5 rounded bg-[#1A1E21] hover:bg-[#31383D] border border-[#525D64] text-xs font-mono uppercase tracking-wider text-[#C2B280] hover:text-white transition",
                                children: "← Arcade"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[10px] font-mono uppercase tracking-[0.26em] text-[#C2B280] leading-none",
                                        children: "DOODLE ARMY 2"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("h1", {
                                        className: "text-lg sm:text-xl font-black tracking-wider uppercase text-[#F5A623] drop-shadow-[0_2px_0_#141911] leading-tight",
                                        children: "MINI MILITIA"
                                    })
                                ]
                            }),
                            save.proPackUnlocked && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "hidden md:inline-block px-2 py-0.5 rounded bg-[#F5A623] text-[#181C1F] text-[10px] font-black uppercase tracking-wider",
                                children: "PRO PACK"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-1.5 sm:gap-2",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    return click(function() {
                                        return onOpenModal('store');
                                    });
                                },
                                className: "flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#181C1F] border border-[#F5A623]/60 text-xs font-mono font-bold tabular-nums hover:border-[#F5A623]",
                                title: "Battle Coins (Loadouts & Respawn Kits)",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-[#F5A623]",
                                        children: "\uD83E\uDE99"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: save.coins.toLocaleString()
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    return click(function() {
                                        return onOpenModal('store');
                                    });
                                },
                                className: "flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#181C1F] border border-[#22C55E]/60 text-xs font-mono font-bold tabular-nums hover:border-[#22C55E]",
                                title: "Military Cash (Cosmetics, Weapons & Pro Pack)",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-[#22C55E]",
                                        children: "\uD83D\uDCB5"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: save.cash.toLocaleString()
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: onToggleMute,
                                className: "w-8 h-8 rounded bg-[#2B3236] hover:bg-[#3A4348] border border-[#525D64] flex items-center justify-center text-sm",
                                title: save.settings.audio.muted ? 'Unmute Audio' : 'Mute Audio',
                                children: save.settings.audio.muted ? '🔇' : '🔊'
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    return click(function() {
                                        return onOpenModal('leaderboards');
                                    });
                                },
                                className: "w-8 h-8 rounded bg-[#2B3236] hover:bg-[#3A4348] border border-[#525D64] flex items-center justify-center text-sm",
                                title: "Leaderboards",
                                children: "\uD83C\uDFC6"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    return click(function() {
                                        return onOpenModal('help');
                                    });
                                },
                                className: "w-8 h-8 rounded bg-[#2B3236] hover:bg-[#3A4348] border border-[#525D64] flex items-center justify-center text-sm",
                                title: "Controls & Boot Camp Guide",
                                children: "❓"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    return click(function() {
                                        return onOpenModal('settings');
                                    });
                                },
                                className: "w-8 h-8 rounded bg-[#2B3236] hover:bg-[#3A4348] border border-[#F5A623]/70 flex items-center justify-center text-sm",
                                title: "Settings & Custom HUD Editor",
                                children: "⚙️"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("main", {
                className: "relative z-10 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-y-auto",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("section", {
                        className: "lg:col-span-7 flex flex-col gap-2.5 min-h-[260px]",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "flex-1 min-h-[220px]",
                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.LobbySoldierShowcase, {
                                    avatar: avatar,
                                    weaponId: activeLoadout.primaryId,
                                    offhandWeaponId: activeLoadout.dualWieldStart ? activeLoadout.secondaryId : null,
                                    team: save.preferredTeam === 'red' ? 'red' : 'blue',
                                    callsign: save.callsign,
                                    clanTag: save.clanTag
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "grid grid-cols-1 sm:grid-cols-3 gap-2",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            return click(function() {
                                                return onOpenModal('armory');
                                            });
                                        },
                                        className: "sm:col-span-2 flex items-center justify-between gap-2 px-3 py-2 rounded bg-[#23272A] hover:bg-[#2C3236] border-2 border-[#4F5D3B] text-left transition",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[10px] font-mono uppercase tracking-wider text-[#C2B280]",
                                                        children: "ACTIVE LOADOUT \xb7 TAP TO EDIT"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "font-bold text-sm text-[#F4F4EC]",
                                                        children: activeLoadout.name
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "text-[11px] text-[#A8B498] font-mono",
                                                        children: [
                                                            primaryWeapon.shortName,
                                                            " + ",
                                                            secondaryWeapon.shortName,
                                                            activeLoadout.dualWieldStart ? ' (Dual Wield)' : ''
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "flex items-center gap-1 bg-[#181C1F] px-2 py-1 rounded border border-[#3E4A2E]",
                                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_AvatarPreviewCanvas.WeaponVectorIcon, {
                                                    weaponId: activeLoadout.primaryId,
                                                    width: 72,
                                                    height: 28
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex flex-col gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    return click(onCycleTeamPref);
                                                },
                                                className: "flex-1 px-2.5 py-1.5 rounded bg-[#23272A] hover:bg-[#2F353A] border border-[#4F5D3B] text-xs font-mono flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-[#C2B280]",
                                                        children: "TEAM:"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: save.preferredTeam === 'blue' ? 'text-[#38BDF8] font-bold uppercase' : save.preferredTeam === 'red' ? 'text-[#F87171] font-bold uppercase' : 'text-[#F5A623] font-bold uppercase',
                                                        children: save.preferredTeam
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    return click(onToggleClassicV4);
                                                },
                                                className: "flex-1 px-2.5 py-1.5 rounded bg-[#23272A] hover:bg-[#2F353A] border border-[#4F5D3B] text-xs font-mono flex items-center justify-between",
                                                title: "Toggle Classic V4 (Pistol/Machete map-scavenge spawns) vs Modern Loadouts",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-[#C2B280]",
                                                        children: "RULES:"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: save.settings.gameplay.classicV4Default ? 'text-[#22C55E] font-bold' : 'text-[#F5A623] font-bold',
                                                        children: save.settings.gameplay.classicV4Default ? 'CLASSIC V4' : 'LOADOUTS'
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("section", {
                        className: "lg:col-span-5 flex flex-col justify-center gap-2.5",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    return click(onQuickPlay);
                                },
                                className: "relative group w-full px-4 py-3.5 rounded bg-[#F5A623] bg-gradient-to-b from-[#F5A623] to-[#C97B10] hover:from-[#FBB940] hover:to-[#DC8814] border-2 border-[#FEF08A]/70 text-[#141911] shadow-lg transition active:translate-y-0.5 text-left",
                                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-lg font-black uppercase tracking-wider leading-tight",
                                                    children: "⚡ QUICK PLAY / BATTLE"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-xs font-bold opacity-85",
                                                    children: "Instant 3v3 TDM on Outpost \xb7 Zero Wait"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "text-2xl font-black group-hover:translate-x-1 transition",
                                            children: "▶"
                                        })
                                    ]
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    return click(onOpenOnlineBrowser);
                                },
                                className: "w-full px-4 py-3 rounded bg-[#2A3320] hover:bg-[#364329] border-2 border-[#5D7045] hover:border-[#F5A623] transition text-left shadow",
                                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-base font-black uppercase tracking-wider text-[#F4F4EC]",
                                                    children: "\uD83C\uDF10 PLAY ONLINE"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-xs text-[#C2B280] font-mono",
                                                    children: "Regional Servers \xb7 Ranked TDM, FFA, CTF & PTB"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "text-xs font-mono px-2 py-0.5 rounded bg-[#181C1F] border border-[#22C55E]/60 text-[#22C55E]",
                                            children: "8 ROOMS"
                                        })
                                    ]
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    return click(onOpenCustomRoom);
                                },
                                className: "w-full px-4 py-3 rounded bg-[#23272A] hover:bg-[#2E3438] border-2 border-[#4F5D3B] hover:border-[#F5A623] transition text-left shadow",
                                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-base font-black uppercase tracking-wider text-[#F4F4EC]",
                                                    children: "\uD83D\uDEE0️ CUSTOM / LAN ROOM"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-xs text-[#C2B280] font-mono",
                                                    children: "All 20 Maps \xb7 Up to 12 Bots \xb7 Gravity, Nitro & V4 Rules"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "text-xs font-mono px-2 py-0.5 rounded bg-[#181C1F] border border-[#C2B280]/40 text-[#C2B280]",
                                            children: "20 MAPS"
                                        })
                                    ]
                                })
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "rounded border-2 border-[#4F5D3B] bg-[#23272A] overflow-hidden shadow",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        onClick: function onClick() {
                                            return click(function() {
                                                return setSoloExpanded(function(v) {
                                                    return !v;
                                                });
                                            });
                                        },
                                        className: "w-full px-4 py-3 hover:bg-[#2E3438] transition text-left flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-base font-black uppercase tracking-wider text-[#F4F4EC]",
                                                        children: "\uD83E\uDE96 SOLO PLAY & SARGE"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-xs text-[#C2B280] font-mono",
                                                        children: "7-Step Boot Camp \xb7 Endless Survival \xb7 Co-Op Waves"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-sm font-mono text-[#F5A623]",
                                                children: soloExpanded ? '▲' : '▼'
                                            })
                                        ]
                                    }),
                                    soloExpanded && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-2 bg-[#1A1F18] border-t border-[#3E4A2E]",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    return click(onStartBootCamp);
                                                },
                                                className: "px-2.5 py-2 rounded bg-[#2A3320] hover:bg-[#3B4A2D] border border-[#5D7045] text-left",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-xs font-black text-[#F5A623] uppercase",
                                                        children: "\uD83C\uDF96️ Boot Camp"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[10px] text-[#C2B280]",
                                                        children: "Sarge 7-Step Drill"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    return click(function() {
                                                        return onStartSurvival(0);
                                                    });
                                                },
                                                className: "px-2.5 py-2 rounded bg-[#2A3320] hover:bg-[#3B4A2D] border border-[#5D7045] text-left",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-xs font-black text-[#F4F4EC] uppercase",
                                                        children: "\uD83D\uDEE1️ Survival"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[10px] text-[#C2B280]",
                                                        children: "You + Sarge vs Waves"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                type: "button",
                                                onClick: function onClick() {
                                                    return click(function() {
                                                        return onStartSurvival(2);
                                                    });
                                                },
                                                className: "px-2.5 py-2 rounded bg-[#2A3320] hover:bg-[#3B4A2D] border border-[#5D7045] text-left",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-xs font-black text-[#38BDF8] uppercase",
                                                        children: "\uD83E\uDD1D Co-Op"
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[10px] text-[#C2B280]",
                                                        children: "3-Man Squad + Sarge"
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
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("footer", {
                className: "relative z-10 grid grid-cols-3 sm:grid-cols-6 gap-1.5 px-3 py-2 bg-[#1B2023]/95 border-t-2 border-[#4F5D3B]",
                children: [
                    {
                        id: 'avatar',
                        icon: '🪖',
                        label: 'Avatar'
                    },
                    {
                        id: 'armory',
                        icon: '🔫',
                        label: 'Armory'
                    },
                    {
                        id: 'store',
                        icon: '🛒',
                        label: 'Store'
                    },
                    {
                        id: 'friends',
                        icon: '👥',
                        label: 'Friends'
                    },
                    {
                        id: 'profile',
                        icon: '📊',
                        label: 'Stats'
                    },
                    {
                        id: 'achievements',
                        icon: '🏅',
                        label: 'Medals',
                        badge: claimableAchievements
                    }
                ].map(function(item) {
                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        type: "button",
                        onClick: function onClick() {
                            return click(function() {
                                return onOpenModal(item.id);
                            });
                        },
                        className: "relative flex items-center justify-center gap-1.5 py-2 px-2 rounded bg-[#2A3320] hover:bg-[#3B492D] border border-[#556640] hover:border-[#F5A623] text-xs font-black uppercase tracking-wider text-[#F4F4EC] transition",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                children: item.icon
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                children: item.label
                            }),
                            item.badge && item.badge > 0 ? /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded bg-[#D93829] text-white text-[10px] font-mono font-bold tabular-nums shadow",
                                children: item.badge
                            }) : null
                        ]
                    }, item.id);
                })
            })
        ]
    });
};

});

})(window.ArcadeMod);
