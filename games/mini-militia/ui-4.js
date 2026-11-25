(function(ArcadeMod){
// === MODULE: src/games/mini-militia/components/SettingsAndHudEditor ===
ArcadeMod.define("src/games/mini-militia/components/SettingsAndHudEditor", function(require, module, exports) {
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
    get CustomHudEditorModal () {
        return CustomHudEditorModal;
    },
    get SettingsModal () {
        return SettingsModal;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _storage = require("../storage");
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
var CustomHudEditorModal = function CustomHudEditorModal(param) {
    var hud = param.hud, onSaveHud = param.onSaveHud, onClose = param.onClose;
    var _draft_selectedId;
    var _useState = (0, _react.useState)(function() {
        return _extends({}, hud);
    }), draft = _useState[0], setDraft = _useState[1];
    var _useState1 = (0, _react.useState)('rightStick'), selectedId = _useState1[0], setSelectedId = _useState1[1];
    var stageRef = (0, _react.useRef)(null);
    var draggingId = (0, _react.useRef)(null);
    var selected = (_draft_selectedId = draft[selectedId]) != null ? _draft_selectedId : Object.values(draft)[0];
    var handlePointerMove = function handlePointerMove(e) {
        if (!draggingId.current || !stageRef.current) return;
        var rect = stageRef.current.getBoundingClientRect();
        var xPct = Math.max(4, Math.min(96, (e.clientX - rect.left) / rect.width * 100));
        var yPct = Math.max(6, Math.min(94, (e.clientY - rect.top) / rect.height * 100));
        var id = draggingId.current;
        setDraft(function(prev) {
            var _obj;
            return _extends({}, prev, (_obj = {}, _obj[id] = _extends({}, prev[id], {
                xPct: Math.round(xPct),
                yPct: Math.round(yPct)
            }), _obj));
        });
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "fixed inset-0 z-[60] bg-[#141913] text-[#F4F4EC] flex flex-col select-none",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#23272A] border-b-2 border-[#F5A623]",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                className: "text-sm font-black uppercase text-[#F5A623]",
                                children: "\uD83C\uDF9B️ CUSTOM HUD LAYOUT EDITOR"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                className: "text-[11px] font-mono text-[#C2B280]",
                                children: "Drag any control on the battlefield \xb7 Adjust Scale (50%–180%) & Opacity (0%–100%)"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    _AudioEngine.mmAudio.playClick();
                                    setDraft((0, _storage.createDefaultHudLayout)());
                                },
                                className: "px-3 py-1 rounded bg-[#2A3320] border border-[#5D7045] text-xs font-mono",
                                children: "Reset Defaults"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: onClose,
                                className: "px-3 py-1 rounded bg-[#374151] text-xs font-black uppercase",
                                children: "Cancel"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                onClick: function onClick() {
                                    _AudioEngine.mmAudio.playPickup();
                                    onSaveHud(draft);
                                    onClose();
                                },
                                className: "px-4 py-1 rounded bg-[#F5A623] text-[#181C1F] text-xs font-black uppercase",
                                children: "Save HUD Layout"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                ref: stageRef,
                onPointerMove: handlePointerMove,
                onPointerUp: function onPointerUp() {
                    draggingId.current = null;
                },
                className: "relative flex-1 bg-gradient-to-b from-[#233229] via-[#1C271B] to-[#131912] overflow-hidden touch-none",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "pointer-events-none absolute inset-0 opacity-20",
                        style: {
                            backgroundImage: 'linear-gradient(to right, #9CA3AF 1px, transparent 1px), linear-gradient(to bottom, #9CA3AF 1px, transparent 1px)',
                            backgroundSize: '48px 48px'
                        }
                    }),
                    Object.values(draft).map(function(ctrl) {
                        var isSel = ctrl.id === selectedId;
                        var isStick = ctrl.id.includes('Stick');
                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            onPointerDown: function onPointerDown(e) {
                                e.currentTarget.setPointerCapture(e.pointerId);
                                draggingId.current = ctrl.id;
                                setSelectedId(ctrl.id);
                            },
                            style: {
                                left: "" + ctrl.xPct + "%",
                                top: "" + ctrl.yPct + "%",
                                opacity: Math.max(0.18, ctrl.opacity),
                                transform: "translate(-50%, -50%) scale(" + ctrl.scale + ")"
                            },
                            className: "absolute cursor-grab active:cursor-grabbing flex items-center justify-center text-center font-mono text-[10px] font-bold uppercase border-2 shadow-lg transition-colors " + (isStick ? 'w-24 h-24 rounded-full' : 'px-3 py-2 rounded') + " " + (isSel ? 'border-[#F5A623] bg-[#F5A623]/25 text-[#FEF08A] z-20' : 'border-[#C2B280]/70 bg-[#23272A]/80 text-[#F4F4EC] z-10'),
                            children: ctrl.label
                        }, ctrl.id);
                    })
                ]
            }),
            selected && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "px-4 py-2.5 bg-[#23272A] border-t-2 border-[#4F5D3B] flex flex-wrap items-center gap-4 text-xs font-mono",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "min-w-[170px]",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "text-[10px] text-[#C2B280] uppercase",
                                children: "Selected Widget"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "font-bold text-[#F5A623]",
                                children: selected.label
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "text-[#C2B280]",
                                children: [
                                    "Scale (",
                                    Math.round(selected.scale * 100),
                                    "%)"
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                type: "range",
                                min: 50,
                                max: 180,
                                value: Math.round(selected.scale * 100),
                                onChange: function onChange(e) {
                                    return setDraft(function(prev) {
                                        var _obj;
                                        return _extends({}, prev, (_obj = {}, _obj[selected.id] = _extends({}, prev[selected.id], {
                                            scale: Number(e.target.value) / 100
                                        }), _obj));
                                    });
                                },
                                className: "w-32 accent-[#F5A623]"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "text-[#C2B280]",
                                children: [
                                    "Opacity (",
                                    Math.round(selected.opacity * 100),
                                    "%)"
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                type: "range",
                                min: 0,
                                max: 100,
                                value: Math.round(selected.opacity * 100),
                                onChange: function onChange(e) {
                                    return setDraft(function(prev) {
                                        var _obj;
                                        return _extends({}, prev, (_obj = {}, _obj[selected.id] = _extends({}, prev[selected.id], {
                                            opacity: Number(e.target.value) / 100
                                        }), _obj));
                                    });
                                },
                                className: "w-32 accent-[#F5A623]"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "ml-auto text-[11px] text-[#9CA3AF] tabular-nums",
                        children: [
                            "X: ",
                            selected.xPct,
                            "% \xb7 Y: ",
                            selected.yPct,
                            "%"
                        ]
                    })
                ]
            })
        ]
    });
};
var SettingsModal = function SettingsModal(param) {
    var save = param.save, onUpdateSave = param.onUpdateSave, onResetAllData = param.onResetAllData, onReplayBootCamp = param.onReplayBootCamp, onClose = param.onClose;
    var _useState = (0, _react.useState)('controls'), tab = _useState[0], setTab = _useState[1];
    var _useState1 = (0, _react.useState)(false), showHudEditor = _useState1[0], setShowHudEditor = _useState1[1];
    var _useState2 = (0, _react.useState)(''), exportJson = _useState2[0], setExportJson = _useState2[1];
    var _useState3 = (0, _react.useState)(null), importMsg = _useState3[0], setImportMsg = _useState3[1];
    var _useState4 = (0, _react.useState)(false), confirmReset = _useState4[0], setConfirmReset = _useState4[1];
    var s = save.settings;
    var patchSettings = function patchSettings(section, patch) {
        onUpdateSave(function(prev) {
            var _obj;
            var nextSettings = _extends({}, prev.settings, (_obj = {}, _obj[section] = _extends({}, prev.settings[section], patch), _obj));
            if (section === 'audio') _AudioEngine.mmAudio.setVolumes(nextSettings.audio);
            return _extends({}, prev, {
                settings: nextSettings
            });
        });
    };
    if (showHudEditor) {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(CustomHudEditorModal, {
            hud: save.customHud,
            onSaveHud: function onSaveHud(nextHud) {
                return onUpdateSave(function(prev) {
                    return _extends({}, prev, {
                        customHud: nextHud
                    });
                });
            },
            onClose: function onClose() {
                return setShowHudEditor(false);
            }
        });
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4",
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "w-full max-w-4xl max-h-[92vh] flex flex-col rounded border-2 border-[#5D7045] bg-[#1E2420] text-[#F4F4EC] shadow-2xl overflow-hidden",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#23272A] border-b border-[#4F5D3B]",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                            className: "text-base font-black uppercase text-[#F5A623]",
                            children: "⚙️ TACTICAL SETTINGS"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex flex-wrap items-center gap-1",
                            children: [
                                [
                                    {
                                        id: 'controls',
                                        label: 'Controls'
                                    },
                                    {
                                        id: 'video',
                                        label: 'Video'
                                    },
                                    {
                                        id: 'audio',
                                        label: 'Audio'
                                    },
                                    {
                                        id: 'gameplay',
                                        label: 'Gameplay'
                                    },
                                    {
                                        id: 'account',
                                        label: 'Account'
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
                                    className: "px-3 py-1 rounded bg-[#D93829] text-xs font-black uppercase ml-1",
                                    children: "Done"
                                })
                            ]
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex-1 overflow-y-auto p-4 space-y-3 text-xs",
                    children: [
                        tab === 'controls' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p-3 rounded bg-[#23272A] border border-[#4F5D3B] space-y-2.5",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                    className: "block text-[11px] font-mono uppercase text-[#C2B280] mb-1",
                                                    children: "Touch Control Scheme"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    value: s.controls.controlScheme,
                                                    onChange: function onChange(e) {
                                                        return patchSettings('controls', {
                                                            controlScheme: e.target.value
                                                        });
                                                    },
                                                    className: "w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "dual_stick",
                                                            children: "Classic Dual-Stick Auto-Fire"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "separate_fire",
                                                            children: "Separate Fire Button"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                    className: "block text-[11px] font-mono uppercase text-[#C2B280] mb-1",
                                                    children: "Joystick Anchor"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    value: s.controls.joystickAnchor,
                                                    onChange: function onChange(e) {
                                                        return patchSettings('controls', {
                                                            joystickAnchor: e.target.value
                                                        });
                                                    },
                                                    className: "w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "floating",
                                                            children: "Floating (Follows Touch)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "fixed",
                                                            children: "Fixed Position"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex justify-between font-mono text-[11px]",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "text-[#C2B280]",
                                                            children: "Move Sensitivity"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            children: [
                                                                s.controls.moveSensitivity.toFixed(1),
                                                                "x"
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "range",
                                                    min: 50,
                                                    max: 200,
                                                    value: Math.round(s.controls.moveSensitivity * 100),
                                                    onChange: function onChange(e) {
                                                        return patchSettings('controls', {
                                                            moveSensitivity: Number(e.target.value) / 100
                                                        });
                                                    },
                                                    className: "w-full accent-[#F5A623]"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex justify-between font-mono text-[11px]",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "text-[#C2B280]",
                                                            children: "Aim Sensitivity"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            children: [
                                                                s.controls.aimSensitivity.toFixed(1),
                                                                "x"
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "range",
                                                    min: 50,
                                                    max: 200,
                                                    value: Math.round(s.controls.aimSensitivity * 100),
                                                    onChange: function onChange(e) {
                                                        return patchSettings('controls', {
                                                            aimSensitivity: Number(e.target.value) / 100
                                                        });
                                                    },
                                                    className: "w-full accent-[#F5A623]"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex justify-between font-mono text-[11px]",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "text-[#C2B280]",
                                                            children: "Auto-Fire Ring Threshold"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            children: [
                                                                s.controls.fireRingThreshold,
                                                                "%"
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "range",
                                                    min: 55,
                                                    max: 90,
                                                    value: s.controls.fireRingThreshold,
                                                    onChange: function onChange(e) {
                                                        return patchSettings('controls', {
                                                            fireRingThreshold: Number(e.target.value)
                                                        });
                                                    },
                                                    className: "w-full accent-[#F5A623]"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p-3 rounded bg-[#23272A] border border-[#4F5D3B] space-y-2.5",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                    className: "block text-[11px] font-mono uppercase text-[#C2B280] mb-1",
                                                    children: "Aim Assist"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    value: s.controls.aimAssist,
                                                    onChange: function onChange(e) {
                                                        return patchSettings('controls', {
                                                            aimAssist: e.target.value
                                                        });
                                                    },
                                                    className: "w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "off",
                                                            children: "Off"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "low",
                                                            children: "Low (Tactical)"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "high",
                                                            children: "High (Casual)"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                                    className: "block text-[11px] font-mono uppercase text-[#C2B280] mb-1",
                                                    children: "Crosshair Style"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                                    value: s.controls.crosshairStyle,
                                                    onChange: function onChange(e) {
                                                        return patchSettings('controls', {
                                                            crosshairStyle: e.target.value
                                                        });
                                                    },
                                                    className: "w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "laser_dot",
                                                            children: "Red Laser + Dot"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "dynamic",
                                                            children: "Dynamic Spread Crosshair"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                            value: "minimal",
                                                            children: "Minimal Tactical Reticle"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex justify-between font-mono text-[11px]",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "text-[#C2B280]",
                                                            children: "Weapon Look-Ahead Camera"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                            children: [
                                                                s.controls.weaponLookAhead,
                                                                "%"
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "range",
                                                    min: 0,
                                                    max: 100,
                                                    value: s.controls.weaponLookAhead,
                                                    onChange: function onChange(e) {
                                                        return patchSettings('controls', {
                                                            weaponLookAhead: Number(e.target.value)
                                                        });
                                                    },
                                                    className: "w-full accent-[#F5A623]"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "flex items-center justify-between py-1",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Auto-Reload Empty Magazine"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: s.controls.autoReload,
                                                    onChange: function onChange(e) {
                                                        return patchSettings('controls', {
                                                            autoReload: e.target.checked
                                                        });
                                                    },
                                                    className: "w-4 h-4 accent-[#F5A623]"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                            className: "flex items-center justify-between py-1",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    children: "Left-Handed Flip Mode"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    type: "checkbox",
                                                    checked: s.controls.leftHanded,
                                                    onChange: function onChange(e) {
                                                        return patchSettings('controls', {
                                                            leftHanded: e.target.checked
                                                        });
                                                    },
                                                    className: "w-4 h-4 accent-[#F5A623]"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                _AudioEngine.mmAudio.playClick();
                                                setShowHudEditor(true);
                                            },
                                            className: "w-full py-2 rounded bg-[#F5A623] hover:bg-[#FBBF24] text-[#181C1F] font-black uppercase",
                                            children: "\uD83C\uDF9B️ Launch Drag-and-Drop Custom HUD Editor"
                                        })
                                    ]
                                })
                            ]
                        }),
                        tab === 'video' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p-3 rounded bg-[#23272A] border border-[#4F5D3B] grid grid-cols-1 sm:grid-cols-2 gap-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                    className: "flex items-center justify-between p-2 rounded bg-[#181C1F] border border-[#3E4A2E]",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "font-bold",
                                                    children: "MMC Enhanced Lighting"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-[10px] text-[#C2B280]",
                                                    children: "Dynamic glows, tracers & shadows"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                            type: "checkbox",
                                            checked: s.video.mmcEnhanced,
                                            onChange: function onChange(e) {
                                                return patchSettings('video', {
                                                    mmcEnhanced: e.target.checked
                                                });
                                            },
                                            className: "w-4 h-4 accent-[#F5A623]"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                    className: "flex items-center justify-between p-2 rounded bg-[#181C1F] border border-[#3E4A2E]",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "font-bold",
                                                    children: "Screen Shake"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-[10px] text-[#C2B280]",
                                                    children: "Explosion & heavy weapon recoil camera shake"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                            type: "checkbox",
                                            checked: s.video.screenShake,
                                            onChange: function onChange(e) {
                                                return patchSettings('video', {
                                                    screenShake: e.target.checked
                                                });
                                            },
                                            className: "w-4 h-4 accent-[#F5A623]"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                    className: "flex items-center justify-between p-2 rounded bg-[#181C1F] border border-[#3E4A2E]",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            children: "Show FPS & Ping Counter"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                            type: "checkbox",
                                            checked: s.video.showFpsPing,
                                            onChange: function onChange(e) {
                                                return patchSettings('video', {
                                                    showFpsPing: e.target.checked
                                                });
                                            },
                                            className: "w-4 h-4 accent-[#F5A623]"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                    className: "flex items-center justify-between p-2 rounded bg-[#181C1F] border border-[#3E4A2E]",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            children: "Show Floating Soldier Nametags"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                            type: "checkbox",
                                            checked: s.video.showNametags,
                                            onChange: function onChange(e) {
                                                return patchSettings('video', {
                                                    showNametags: e.target.checked
                                                });
                                            },
                                            className: "w-4 h-4 accent-[#F5A623]"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                            className: "block text-[11px] font-mono uppercase text-[#C2B280] mb-1",
                                            children: "Hit Effects"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                            value: s.video.hitEffects,
                                            onChange: function onChange(e) {
                                                return patchSettings('video', {
                                                    hitEffects: e.target.value
                                                });
                                            },
                                            className: "w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                    value: "red",
                                                    children: "Classic Cartoon Splash"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                    value: "confetti",
                                                    children: "Party Confetti"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                    value: "off",
                                                    children: "Minimal Sparks Only"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                            className: "block text-[11px] font-mono uppercase text-[#C2B280] mb-1",
                                            children: "Target Frame Rate"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                            value: s.video.targetFps,
                                            onChange: function onChange(e) {
                                                return patchSettings('video', {
                                                    targetFps: Number(e.target.value)
                                                });
                                            },
                                            className: "w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                    value: 30,
                                                    children: "30 FPS (Battery Saver)"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                    value: 60,
                                                    children: "60 FPS (Standard)"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                    value: 120,
                                                    children: "120 FPS (Unlocked)"
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        tab === 'audio' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p-3 rounded bg-[#23272A] border border-[#4F5D3B] space-y-3",
                            children: [
                                [
                                    {
                                        key: 'master',
                                        label: 'Master Volume'
                                    },
                                    {
                                        key: 'sfx',
                                        label: 'Gunfire, Explosions & Jetpack SFX'
                                    },
                                    {
                                        key: 'music',
                                        label: 'Menu & Ambient Track'
                                    },
                                    {
                                        key: 'voice',
                                        label: 'Sarge Voice & Killstreak Chimes'
                                    }
                                ].map(function(sl) {
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "flex justify-between font-mono text-[11px] mb-0.5",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-[#C2B280]",
                                                        children: sl.label
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "tabular-nums",
                                                        children: [
                                                            s.audio[sl.key],
                                                            "%"
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                type: "range",
                                                min: 0,
                                                max: 100,
                                                value: s.audio[sl.key],
                                                onChange: function onChange(e) {
                                                    var _obj;
                                                    return patchSettings('audio', (_obj = {}, _obj[sl.key] = Number(e.target.value), _obj));
                                                },
                                                className: "w-full accent-[#F5A623]"
                                            })
                                        ]
                                    }, sl.key);
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                    className: "flex items-center justify-between pt-2 border-t border-[#3E4A2E]",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "font-bold",
                                            children: "Mute All Audio"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                            type: "checkbox",
                                            checked: s.audio.muted,
                                            onChange: function onChange(e) {
                                                return patchSettings('audio', {
                                                    muted: e.target.checked
                                                });
                                            },
                                            className: "w-4 h-4 accent-[#F5A623]"
                                        })
                                    ]
                                })
                            ]
                        }),
                        tab === 'gameplay' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p-3 rounded bg-[#23272A] border border-[#4F5D3B] grid grid-cols-1 sm:grid-cols-2 gap-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                            className: "block text-[11px] font-mono uppercase text-[#C2B280] mb-1",
                                            children: "Preferred Region"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("select", {
                                            value: s.gameplay.region,
                                            onChange: function onChange(e) {
                                                return patchSettings('gameplay', {
                                                    region: e.target.value
                                                });
                                            },
                                            className: "w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                    value: "auto",
                                                    children: "Auto (Lowest Ping)"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                    value: "asia",
                                                    children: "Asia"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                    value: "europe",
                                                    children: "Europe"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                    value: "na",
                                                    children: "North America"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("option", {
                                                    value: "sa",
                                                    children: "South America"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                    className: "flex items-center justify-between p-2 rounded bg-[#181C1F] border border-[#3E4A2E]",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "font-bold",
                                                    children: "Classic V4 Mode Default"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-[10px] text-[#C2B280]",
                                                    children: "Start Pistol + Machete & scavenge arena pads"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                            type: "checkbox",
                                            checked: s.gameplay.classicV4Default,
                                            onChange: function onChange(e) {
                                                return patchSettings('gameplay', {
                                                    classicV4Default: e.target.checked
                                                });
                                            },
                                            className: "w-4 h-4 accent-[#F5A623]"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                    className: "flex items-center justify-between p-2 rounded bg-[#181C1F] border border-[#3E4A2E]",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            children: "Auto-Pickup Health & Ammo Crates"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                            type: "checkbox",
                                            checked: s.gameplay.autoPickupItems,
                                            onChange: function onChange(e) {
                                                return patchSettings('gameplay', {
                                                    autoPickupItems: e.target.checked
                                                });
                                            },
                                            className: "w-4 h-4 accent-[#F5A623]"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("label", {
                                    className: "flex items-center justify-between p-2 rounded bg-[#181C1F] border border-[#3E4A2E]",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            children: "Off-Screen Enemy Directional Arrows"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                            type: "checkbox",
                                            checked: s.gameplay.showOffscreenArrows,
                                            onChange: function onChange(e) {
                                                return patchSettings('gameplay', {
                                                    showOffscreenArrows: e.target.checked
                                                });
                                            },
                                            className: "w-4 h-4 accent-[#F5A623]"
                                        })
                                    ]
                                })
                            ]
                        }),
                        tab === 'account' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "p-3 rounded bg-[#23272A] border border-[#4F5D3B] space-y-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex flex-wrap gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                _AudioEngine.mmAudio.playKillstreak();
                                                onUpdateSave(function(prev) {
                                                    return _extends({}, prev, {
                                                        proPackUnlocked: !prev.proPackUnlocked
                                                    });
                                                });
                                            },
                                            className: "px-3 py-1.5 rounded bg-[#2A3320] border border-[#F5A623] text-[#F5A623] font-black uppercase",
                                            children: save.proPackUnlocked ? '✓ Pro Pack Active (Toggle)' : '⭐ Activate Pro Pack Free'
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                onClose();
                                                onReplayBootCamp();
                                            },
                                            className: "px-3 py-1.5 rounded bg-[#2A3320] border border-[#5D7045] font-black uppercase",
                                            children: "\uD83C\uDF96️ Replay Boot Camp"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                return setExportJson(JSON.stringify(save));
                                            },
                                            className: "px-3 py-1.5 rounded bg-[#181C1F] border border-[#525D64] font-mono",
                                            children: "Export Save JSON"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("label", {
                                            className: "block text-[10px] font-mono uppercase text-[#C2B280] mb-1",
                                            children: "Export / Import Profile JSON"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("textarea", {
                                            rows: 3,
                                            value: exportJson,
                                            onChange: function onChange(e) {
                                                return setExportJson(e.target.value);
                                            },
                                            placeholder: "Click Export Save JSON or paste backup JSON here to import...",
                                            className: "w-full p-2 rounded bg-[#141719] border border-[#3E4A2E] font-mono text-[10px]"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center justify-between mt-1.5",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    onClick: function onClick() {
                                                        try {
                                                            var parsed = JSON.parse(exportJson);
                                                            if (!parsed.callsign || !parsed.stats) throw new Error('Invalid');
                                                            onUpdateSave(function() {
                                                                return parsed;
                                                            });
                                                            setImportMsg('✓ Profile restored successfully!');
                                                        } catch (unused) {
                                                            setImportMsg('Invalid Mini Militia save JSON.');
                                                        }
                                                    },
                                                    className: "px-3 py-1 rounded bg-[#22C55E] text-[#0F172A] font-black uppercase",
                                                    children: "Import JSON"
                                                }),
                                                importMsg && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "font-mono text-[#F5A623]",
                                                    children: importMsg
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "pt-2 border-t border-[#3E4A2E] flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "text-[#F87171] font-mono",
                                            children: "Danger Zone: Reset career stats & unlocks"
                                        }),
                                        confirmReset ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    onClick: function onClick() {
                                                        onResetAllData();
                                                        setConfirmReset(false);
                                                    },
                                                    className: "px-3 py-1 rounded bg-[#D93829] font-black uppercase",
                                                    children: "Confirm Wipe"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    onClick: function onClick() {
                                                        return setConfirmReset(false);
                                                    },
                                                    className: "px-3 py-1 rounded bg-[#374151] font-mono",
                                                    children: "Cancel"
                                                })
                                            ]
                                        }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                return setConfirmReset(true);
                                            },
                                            className: "px-3 py-1 rounded bg-[#7F1D1D] hover:bg-[#B91C1C] font-black uppercase",
                                            children: "Reset All Data"
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

});

})(window.ArcadeMod);
