(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/components/DeathRecapModal ===
ArcadeMod.define("src/games/legends-arena/mlbb/components/DeathRecapModal", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DeathRecapModal", {
    enumerable: true,
    get: function() {
        return DeathRecapModal;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_default(require("react"));
var _HeroAvatarSvg = require("./HeroAvatarSvg");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var DeathRecapModal = function DeathRecapModal(param) {
    var recap = param.recap, respawnSec = param.respawnSec, onOpenShop = param.onOpenShop, onClose = param.onClose;
    var _recap_totalCcSec;
    var physPct = Math.round(recap.physicalPct);
    var magicPct = Math.round(recap.magicPct);
    var truePct = Math.round(recap.truePct);
    var counterTip = physPct >= 55 ? 'Counter-build tip: Consider Antique Cuirass, Dominance Ice, or Blade Armor.' : magicPct >= 55 ? 'Counter-build tip: Consider Athena\'s Shield or Radiant Armor.' : 'Counter-build tip: True/Mixed burst — stack Max HP (Guardian Helmet / Immortality).';
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "fixed inset-0 z-40 bg-slate-950/70 flex items-center justify-center p-3",
        onClick: onClose,
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            onClick: function onClick(e) {
                return e.stopPropagation();
            },
            className: "w-full max-w-md rounded-2xl bg-[#0B132B] border-2 border-rose-500/75 p-4 text-slate-100 shadow-2xl space-y-3",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex items-center justify-between border-b border-slate-700/80 pb-2.5",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex items-center gap-2.5",
                            children: [
                                recap.killerHeroId !== 'environment' ? /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                    heroId: recap.killerHeroId,
                                    size: 40
                                }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "w-10 h-10 rounded-full bg-rose-950 border border-rose-400 flex items-center justify-center text-lg",
                                    children: "\uD83C\uDFF0"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-xs font-black tracking-wider text-rose-400 uppercase",
                                            children: "Death Damage Recap"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "text-sm font-black text-white",
                                            children: [
                                                "Eliminated by ",
                                                recap.killerName,
                                                " \xb7",
                                                ' ',
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    className: "text-amber-300 mlbb-num",
                                                    children: [
                                                        recap.totalDamage.toLocaleString(),
                                                        " DMG"
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            onClick: onClose,
                            className: "w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-white font-black cursor-pointer",
                            children: "✕"
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "space-y-1.5",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "h-3.5 w-full rounded-full bg-slate-900 overflow-hidden flex border border-slate-700",
                            children: [
                                physPct > 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "h-full bg-orange-400",
                                    style: {
                                        width: "" + physPct + "%"
                                    }
                                }),
                                magicPct > 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "h-full bg-purple-400",
                                    style: {
                                        width: "" + magicPct + "%"
                                    }
                                }),
                                truePct > 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "h-full bg-slate-100",
                                    style: {
                                        width: "" + truePct + "%"
                                    }
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "grid grid-cols-3 gap-1.5 text-[11px] font-black mlbb-num",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "px-2 py-1 rounded-lg bg-orange-950/60 border border-orange-400/40 text-orange-300 text-center",
                                    children: [
                                        "PHYS ",
                                        physPct,
                                        "%"
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "px-2 py-1 rounded-lg bg-purple-950/60 border border-purple-400/40 text-purple-300 text-center",
                                    children: [
                                        "MAGIC ",
                                        magicPct,
                                        "%"
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "px-2 py-1 rounded-lg bg-slate-800 border border-slate-500/50 text-slate-100 text-center",
                                    children: [
                                        "TRUE ",
                                        truePct,
                                        "%"
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "px-2.5 py-2 rounded-xl bg-amber-950/35 border border-amber-400/45 flex flex-wrap items-center justify-between gap-1.5 text-[11px]",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "font-black text-amber-200 flex items-center gap-1.5",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: "⛓️"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: "TOTAL CC SUFFERED:"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                    className: "text-amber-300 mlbb-num text-xs",
                                    children: [
                                        ((_recap_totalCcSec = recap.totalCcSec) != null ? _recap_totalCcSec : 0).toFixed(1),
                                        "s"
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "flex flex-wrap gap-1",
                            children: recap.ccBreakdown && recap.ccBreakdown.length > 0 ? recap.ccBreakdown.slice(0, 4).map(function(cc) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                    className: "px-1.5 py-0.5 rounded bg-slate-900/90 border border-amber-400/40 text-[10px] font-black text-amber-100 uppercase mlbb-num",
                                    children: [
                                        cc.ccType,
                                        " ",
                                        cc.durationSec.toFixed(1),
                                        "s"
                                    ]
                                }, cc.ccType);
                            }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                className: "text-[10px] font-bold text-slate-400",
                                children: "None"
                            })
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "space-y-1.5",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "text-[10px] font-black tracking-wider text-slate-400 uppercase",
                            children: "Top Damage Contributors"
                        }),
                        recap.contributors.length === 0 ? /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "p-2.5 rounded-xl bg-slate-900/80 text-xs text-slate-400 text-center",
                            children: "No damage events logged before elimination."
                        }) : recap.contributors.map(function(src, idx) {
                            var domType = src.trueDmg >= src.physical && src.trueDmg >= src.magic && src.trueDmg > 0 ? 'true' : src.magic > src.physical ? 'magic' : 'physical';
                            var skillSummary = src.topSkills.length > 0 ? src.topSkills.map(function(s) {
                                return s.name + " (" + s.damage + ")";
                            }).join(' · ') : 'Combat Damage';
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p-2 rounded-xl bg-[#101C3D] border border-slate-700/80 flex items-center justify-between gap-2 text-xs",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center gap-2 min-w-0",
                                        children: [
                                            src.heroId !== 'environment' ? /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                heroId: src.heroId,
                                                size: 28
                                            }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-sm",
                                                children: "\uD83C\uDFF0"
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "font-black text-white truncate",
                                                        children: src.attackerName
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "text-[10px] text-slate-300 truncate",
                                                        children: skillSummary
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-right shrink-0 mlbb-num",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "font-black text-amber-300",
                                                children: Math.round(src.totalDamage).toLocaleString()
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-[10px] font-black uppercase " + (domType === 'physical' ? 'text-orange-300' : domType === 'magic' ? 'text-purple-300' : 'text-slate-100'),
                                                children: [
                                                    domType,
                                                    " (",
                                                    Math.round(src.sharePct),
                                                    "%)"
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }, src.attackerId + "_" + idx);
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "p-2.5 rounded-xl bg-slate-900/90 border border-[#F5C451]/35 text-[11px] text-slate-200",
                    children: counterTip
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex items-center justify-between gap-2 pt-1",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "text-xs font-black text-rose-300 mlbb-num",
                            children: respawnSec > 0 ? "Respawn in " + respawnSec + "s" : 'Respawned'
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex gap-2",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    onClick: function onClick() {
                                        onClose();
                                        onOpenShop();
                                    },
                                    className: "px-3.5 py-2 rounded-xl bg-[#F5C451] text-slate-950 font-black text-xs cursor-pointer",
                                    children: "\uD83D\uDED2 Counter-Build Shop"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    onClick: onClose,
                                    className: "px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs cursor-pointer",
                                    children: "Close"
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
// === MODULE: src/games/legends-arena/mlbb/components/ExpandedMinimap ===
ArcadeMod.define("src/games/legends-arena/mlbb/components/ExpandedMinimap", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ExpandedMinimap", {
    enumerable: true,
    get: function() {
        return ExpandedMinimap;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _mapData = require("../data/mapData");
var _CombatMath = require("../engine/CombatMath");
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
var ExpandedMinimap = function ExpandedMinimap(param) {
    var engine = param.engine, playerPos = param.playerPos, onClose = param.onClose;
    var canvasRef = (0, _react.useRef)(null);
    var _useState = (0, _react.useState)('attack'), selectedKind = _useState[0], setSelectedKind = _useState[1];
    var _useState1 = (0, _react.useState)([]), routePts = _useState1[0], setRoutePts = _useState1[1];
    var _useState2 = (0, _react.useState)(null), hoverPreview = _useState2[0], setHoverPreview = _useState2[1];
    var draggingRef = (0, _react.useRef)(false);
    var startPtRef = (0, _react.useRef)(null);
    var worldPtsRef = (0, _react.useRef)([]);
    (0, _react.useEffect)(function() {
        if (!engine || !canvasRef.current) return;
        engine.attachExtraMinimapCanvas(canvasRef.current);
        return function() {
            engine.attachExtraMinimapCanvas(null);
        };
    }, [
        engine
    ]);
    var toWorld = function toWorld(clientX, clientY, rect) {
        return {
            x: Math.max(80, Math.min(_mapData.WORLD_SIZE - 80, (clientX - rect.left) / rect.width * _mapData.WORLD_SIZE)),
            y: Math.max(80, Math.min(_mapData.WORLD_SIZE - 80, (clientY - rect.top) / rect.height * _mapData.WORLD_SIZE))
        };
    };
    var updateHoverPreview = function updateHoverPreview(clientX, clientY, rect) {
        if (!engine) return;
        var wp = toWorld(clientX, clientY, rect);
        if (selectedKind === 'omw') {
            setHoverPreview({
                icon: '🧭',
                label: 'Tap or drag to draw cyan "On My Way" route',
                color: '#22D3EE'
            });
            return;
        }
        var previewKind = selectedKind === 'missing' ? 'retreat' : selectedKind;
        var prev = engine.previewDragPing(previewKind, wp.x, wp.y);
        if (selectedKind === 'missing' && !prev.snapped) {
            setHoverPreview({
                icon: '❓',
                label: 'Signal Enemy Missing in zone',
                color: '#FACC15'
            });
        } else {
            setHoverPreview({
                icon: prev.icon,
                label: prev.label,
                color: prev.color
            });
        }
    };
    var handlePointerDown = function handlePointerDown(e) {
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        var rect = e.currentTarget.getBoundingClientRect();
        var lx = e.clientX - rect.left;
        var ly = e.clientY - rect.top;
        draggingRef.current = true;
        startPtRef.current = {
            x: lx,
            y: ly
        };
        var wp = toWorld(e.clientX, e.clientY, rect);
        worldPtsRef.current = [
            wp
        ];
        setRoutePts([
            {
                x: lx,
                y: ly
            }
        ]);
    };
    var handlePointerMove = function handlePointerMove(e) {
        var rect = e.currentTarget.getBoundingClientRect();
        updateHoverPreview(e.clientX, e.clientY, rect);
        if (!draggingRef.current) return;
        var lx = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        var ly = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
        var last = routePts[routePts.length - 1];
        if (!last || Math.hypot(lx - last.x, ly - last.y) >= 8) {
            setRoutePts(function(prev) {
                return [].concat(prev.slice(-36), [
                    {
                        x: lx,
                        y: ly
                    }
                ]);
            });
            worldPtsRef.current.push(toWorld(e.clientX, e.clientY, rect));
        }
    };
    var handlePointerUp = function handlePointerUp(e) {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        var rect = e.currentTarget.getBoundingClientRect();
        var start = startPtRef.current;
        var endX = e.clientX - rect.left;
        var endY = e.clientY - rect.top;
        var movedDist = start ? Math.hypot(endX - start.x, endY - start.y) : 0;
        if (movedDist >= 18 && worldPtsRef.current.length >= 2) {
            // Drawn glowing cyan "On My Way" route trail!
            engine == null ? void 0 : engine.drawOmwRoute(worldPtsRef.current);
        } else if (selectedKind === 'omw') {
            var _ref, _ref1;
            var wp = toWorld(e.clientX, e.clientY, rect);
            var originX = (_ref = playerPos == null ? void 0 : playerPos.x) != null ? _ref : 620;
            var originY = (_ref1 = playerPos == null ? void 0 : playerPos.y) != null ? _ref1 : _mapData.WORLD_SIZE - 620;
            engine == null ? void 0 : engine.drawOmwRoute((0, _CombatMath.buildOmwRouteFromHero)(originX, originY, wp.x, wp.y));
        } else {
            var wp1 = toWorld(e.clientX, e.clientY, rect);
            engine == null ? void 0 : engine.expandedMapTap(wp1.x, wp1.y, selectedKind);
        }
        setRoutePts([]);
        worldPtsRef.current = [];
        startPtRef.current = null;
    };
    var polylinePoints = routePts.map(function(p) {
        return p.x.toFixed(1) + "," + p.y.toFixed(1);
    }).join(' ');
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "fixed inset-0 z-40 bg-slate-950/65 flex items-center justify-center p-3",
        onClick: onClose,
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            onClick: function onClick(e) {
                return e.stopPropagation();
            },
            className: "rounded-2xl bg-[#0B132B]/96 border-2 border-[#F5C451]/75 p-3 shadow-2xl flex flex-col items-center gap-2.5 max-w-[94vw]",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "w-full flex items-center justify-between gap-3",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "text-xs font-black tracking-wider text-[#F5C451] uppercase",
                                    children: "Expanded Tactical Map (M)"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "text-[11px] text-slate-300 font-semibold",
                                    children: 'Tap Hero/Turret/Bush/Pit to ping \xb7 Select "On My Way" or drag to draw cyan route'
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            onClick: onClose,
                            className: "w-9 h-9 rounded-lg bg-slate-800 hover:bg-rose-600 text-white font-black text-sm cursor-pointer",
                            title: "Close Tactical Map (M)",
                            children: "✕"
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "w-full grid grid-cols-5 gap-1.5 text-[10px] sm:text-[11px]",
                    children: [
                        {
                            id: 'attack',
                            icon: '⚔️',
                            label: 'Attack',
                            activeCls: 'bg-rose-600 border-rose-300 text-white'
                        },
                        {
                            id: 'retreat',
                            icon: '🛡️',
                            label: 'Retreat',
                            activeCls: 'bg-amber-500 border-amber-200 text-slate-950'
                        },
                        {
                            id: 'gather',
                            icon: '🎯',
                            label: 'Gather',
                            activeCls: 'bg-sky-500 border-sky-200 text-slate-950'
                        },
                        {
                            id: 'missing',
                            icon: '❓',
                            label: 'Missing',
                            activeCls: 'bg-yellow-400 border-white text-slate-950'
                        },
                        {
                            id: 'omw',
                            icon: '🧭',
                            label: 'On My Way',
                            activeCls: 'bg-cyan-400 border-white text-slate-950'
                        }
                    ].map(function(btn) {
                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                            onClick: function onClick() {
                                return setSelectedKind(btn.id);
                            },
                            className: "min-h-[36px] py-1.5 px-1.5 rounded-lg border font-black flex items-center justify-center gap-1 cursor-pointer " + (selectedKind === btn.id ? btn.activeCls : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'),
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    children: btn.icon
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    className: "truncate",
                                    children: btn.label
                                })
                            ]
                        }, btn.id);
                    })
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "w-full px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-center text-[11px] font-black truncate",
                    children: hoverPreview ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                        style: {
                            color: hoverPreview.color
                        },
                        children: [
                            hoverPreview.icon,
                            " ",
                            hoverPreview.label
                        ]
                    }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                        className: "text-slate-400",
                        children: "Move pointer over map to snap to Heroes, Turrets, Bushes, or Objectives"
                    })
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "relative rounded-xl overflow-hidden border-2 border-[#38BDF8]/65 bg-[#091326] w-[min(82vw,46vh,380px)] h-[min(82vw,46vh,380px)]",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("canvas", {
                            ref: canvasRef,
                            width: 380,
                            height: 380,
                            onPointerDown: handlePointerDown,
                            onPointerMove: handlePointerMove,
                            onPointerUp: handlePointerUp,
                            onPointerLeave: function onPointerLeave() {
                                return setHoverPreview(null);
                            },
                            className: "w-full h-full block cursor-crosshair touch-none"
                        }),
                        routePts.length >= 2 && /*#__PURE__*/ (0, _jsxruntime.jsx)("svg", {
                            className: "absolute inset-0 w-full h-full pointer-events-none",
                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)("polyline", {
                                points: polylinePoints,
                                fill: "none",
                                stroke: "#22D3EE",
                                strokeWidth: "4",
                                strokeDasharray: "8 6",
                                strokeLinecap: "round",
                                strokeLinejoin: "round"
                            })
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "w-full flex items-center justify-between gap-2 text-[11px]",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            onClick: function onClick() {
                                return engine == null ? void 0 : engine.expandedMapTap(2000, 2000, 'missing');
                            },
                            className: "flex-1 py-2 rounded-lg bg-slate-900 hover:bg-amber-500/20 border border-amber-400/50 text-amber-200 font-black cursor-pointer",
                            children: "❓ Enemy Missing!"
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            onClick: function onClick() {
                                return engine == null ? void 0 : engine.expandedMapTap(2000, 2000, 'gather');
                            },
                            className: "flex-1 py-2 rounded-lg bg-slate-900 hover:bg-sky-500/20 border border-sky-400/50 text-sky-200 font-black cursor-pointer",
                            children: "\uD83C\uDFAF Gather Mid!"
                        })
                    ]
                })
            ]
        })
    });
};

});
// === MODULE: src/games/legends-arena/mlbb/components/HudWidgets ===
ArcadeMod.define("src/games/legends-arena/mlbb/components/HudWidgets", function(require, module, exports) {
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
    get BuffRadialBadge () {
        return BuffRadialBadge;
    },
    get SurrenderVoteBar () {
        return SurrenderVoteBar;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_default(require("react"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var BuffRadialBadge = function BuffRadialBadge(param) {
    var buff = param.buff;
    var ratio = Math.max(0, Math.min(1, buff.remaining / Math.max(0.1, buff.max)));
    var radius = 15;
    var circumference = 2 * Math.PI * radius;
    var dashOffset = circumference * (1 - ratio);
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        title: buff.label + " (" + Math.ceil(buff.remaining) + "s remaining)",
        className: "relative w-10 h-10 rounded-full bg-[#0B132B]/92 flex flex-col items-center justify-center shadow-lg select-none",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
                className: "absolute inset-0 w-full h-full -rotate-90 pointer-events-none",
                viewBox: "0 0 36 36",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                        cx: "18",
                        cy: "18",
                        r: radius,
                        fill: "none",
                        stroke: "rgba(15,23,42,0.85)",
                        strokeWidth: "3"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                        cx: "18",
                        cy: "18",
                        r: radius,
                        fill: "none",
                        stroke: buff.color,
                        strokeWidth: "3",
                        strokeDasharray: circumference,
                        strokeDashoffset: dashOffset,
                        strokeLinecap: "round"
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                className: "text-sm leading-none relative z-10",
                children: buff.icon
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                className: "text-[8px] font-black text-white leading-none mt-0.5 mlbb-num relative z-10",
                children: [
                    Math.ceil(buff.remaining),
                    "s"
                ]
            })
        ]
    });
};
var SurrenderVoteBar = function SurrenderVoteBar(param) {
    var vote = param.vote;
    var statusText = vote.status === 'passed' ? 'SURRENDER PASSED' : vote.status === 'failed' ? 'SURRENDER FAILED' : "SURRENDER VOTE (" + vote.yes + "/5)";
    var borderCls = vote.status === 'passed' ? 'border-rose-400' : vote.status === 'failed' ? 'border-amber-400' : 'border-[#F5C451]/80';
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "pointer-events-auto px-3.5 py-2 rounded-2xl bg-[#0B132B]/95 border-2 " + borderCls + " shadow-2xl flex items-center gap-3",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "flex flex-col",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                        className: "text-[10px] font-black tracking-wider text-[#F5C451] uppercase",
                        children: statusText
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                        className: "text-[10px] font-bold text-slate-300 mlbb-num",
                        children: vote.status === 'voting' ? "" + Math.ceil(vote.remainingSec) + "s remaining" : vote.yes + " Agree \xb7 " + vote.no + " Refuse"
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "flex items-center gap-1.5",
                children: vote.slots.map(function(slot, idx) {
                    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all duration-300 " + (slot === 'yes' ? 'bg-emerald-500/90 border-emerald-200 text-slate-950 scale-105' : slot === 'no' ? 'bg-rose-600/90 border-rose-200 text-white scale-105' : 'bg-slate-900 border-slate-600 text-slate-400 animate-pulse'),
                        title: idx === 0 ? 'Your Vote: Agree' : slot === 'yes' ? "Ally " + idx + ": Agreed" : slot === 'no' ? "Ally " + idx + ": Refused" : "Ally " + idx + ": Deciding...",
                        children: slot === 'yes' ? '✓' : slot === 'no' ? '✕' : '·'
                    }, idx);
                })
            })
        ]
    });
};

});
// === MODULE: src/games/legends-arena/mlbb/components/InMatchOverlays ===
ArcadeMod.define("src/games/legends-arena/mlbb/components/InMatchOverlays", function(require, module, exports) {
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
    get InMatchScoreboardModal () {
        return InMatchScoreboardModal;
    },
    get InMatchShopModal () {
        return _InMatchShopModal.InMatchShopModal;
    },
    get PostMatchScreen () {
        return PostMatchScreen;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _items = require("../data/items");
var _emblems = require("../data/emblems");
var _mapData = require("../data/mapData");
var _HeroAvatarSvg = require("./HeroAvatarSvg");
var _AudioEngine = require("../engine/AudioEngine");
var _InMatchShopModal = require("./InMatchShopModal");
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
var InMatchScoreboardModal = function InMatchScoreboardModal(param) {
    var snap = param.snap, _param_uiOpacity = param.uiOpacity, uiOpacity = _param_uiOpacity === void 0 ? 0.92 : _param_uiOpacity, onSignalTarget = param.onSignalTarget, onClose = param.onClose;
    var _useState = (0, _react.useState)('equipment'), tab = _useState[0], setTab = _useState[1];
    var _useState1 = (0, _react.useState)([]), mutedIds = _useState1[0], setMutedIds = _useState1[1];
    var blue = snap.scoreboard.filter(function(p) {
        return p.team === 'blue';
    });
    var red = snap.scoreboard.filter(function(p) {
        return p.team === 'red';
    });
    var cardOpacity = Math.max(0.55, Math.min(0.98, uiOpacity));
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "fixed inset-0 z-40 bg-slate-950/45 flex items-center justify-center p-3",
        onClick: onClose,
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            onClick: function onClick(e) {
                return e.stopPropagation();
            },
            style: {
                opacity: cardOpacity
            },
            className: "w-full max-w-5xl max-h-[86vh] rounded-2xl bg-[#0B132B]/95 backdrop-blur-sm border-2 border-[#F5C451]/60 flex flex-col overflow-hidden text-slate-100 shadow-2xl transition-opacity",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex items-center justify-between px-4 py-2.5 bg-[#101C3D] border-b border-[#F5C451]/30",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    className: "text-base font-black text-sky-400 mlbb-num",
                                    children: snap.blueKills
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    className: "text-xs font-black text-[#F5C451] mlbb-num",
                                    children: (0, _mapData.formatClock)(snap.matchTimeSec)
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    className: "text-base font-black text-rose-400 mlbb-num",
                                    children: snap.redKills
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "flex gap-1 ml-3",
                                    children: [
                                        'equipment',
                                        'data',
                                        'attributes'
                                    ].map(function(t) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            onClick: function onClick() {
                                                return setTab(t);
                                            },
                                            className: "px-3 py-1 rounded-lg text-xs font-black uppercase cursor-pointer " + (tab === t ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'),
                                            children: t
                                        }, t);
                                    })
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                            onClick: onClose,
                            className: "w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 font-black cursor-pointer",
                            children: "✕"
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "flex-1 overflow-y-auto p-3",
                    children: tab === 'attributes' ? /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs",
                        children: [
                            [
                                'Health (HP)',
                                snap.player.hp + " / " + snap.player.maxHp
                            ],
                            [
                                snap.player.resource === 'energy' ? 'Energy' : 'Mana',
                                snap.player.resource === 'none' ? 'No Cost' : snap.player.mana + " / " + snap.player.maxMana
                            ],
                            [
                                'Physical Attack',
                                snap.player.stats.physAtk
                            ],
                            [
                                'Magic Power',
                                snap.player.stats.magicPow
                            ],
                            [
                                'Physical Defense',
                                snap.player.stats.physDef
                            ],
                            [
                                'Magic Defense',
                                snap.player.stats.magicDef
                            ],
                            [
                                'Flat / % Phys PEN',
                                snap.player.stats.flatPhysPen + " / " + Math.round(snap.player.stats.pctPhysPen * 100) + "%"
                            ],
                            [
                                'Flat / % Magic PEN',
                                snap.player.stats.flatMagicPen + " / " + Math.round(snap.player.stats.pctMagicPen * 100) + "%"
                            ],
                            [
                                'Attack Speed',
                                snap.player.stats.atkSpd.toFixed(2)
                            ],
                            [
                                'Crit Chance',
                                "" + Math.round(snap.player.stats.critChance * 100) + "%"
                            ],
                            [
                                'Cooldown Reduction',
                                "" + Math.round(snap.player.stats.cdrPct * 100) + "%"
                            ],
                            [
                                'Movement Speed',
                                snap.player.stats.moveSpd
                            ],
                            [
                                'Lifesteal / Spell Vamp',
                                Math.round(snap.player.stats.lifestealPct * 100) + "% / " + Math.round(snap.player.stats.spellVampPct * 100) + "%"
                            ],
                            [
                                'Level / Total Gold',
                                "Lv." + snap.player.level + " \xb7 " + snap.player.totalGold + "g"
                            ]
                        ].map(function(param) {
                            var label = param[0], val = param[1];
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex justify-between",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "text-slate-400 font-bold",
                                        children: label
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "font-black text-[#F5C451] mlbb-num",
                                        children: val
                                    })
                                ]
                            }, String(label));
                        })
                    }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-3",
                        children: [
                            [
                                'ALLIES (BLUE)',
                                blue,
                                'border-sky-500/40'
                            ],
                            [
                                'ENEMIES (RED)',
                                red,
                                'border-rose-500/40'
                            ]
                        ].map(function(param) {
                            var title = param[0], teamList = param[1], borderCol = param[2];
                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "space-y-1.5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "flex items-center justify-between text-xs font-black text-slate-300",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                children: title
                                            }),
                                            title.startsWith('ENEMIES') && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-[10px] font-bold text-amber-300",
                                                children: "Click spell icon to announce & track CD"
                                            })
                                        ]
                                    }),
                                    teamList.map(function(pl) {
                                        var _snap_trackedEnemySpells;
                                        var tracked = (_snap_trackedEnemySpells = snap.trackedEnemySpells) == null ? void 0 : _snap_trackedEnemySpells.find(function(t) {
                                            return t.heroId === pl.id;
                                        });
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-2 rounded-xl bg-[#101C3D] border " + (pl.isPlayer ? 'border-[#F5C451]' : borderCol) + " flex items-center justify-between gap-2 text-xs",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex items-center gap-2 min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            type: "button",
                                                            onClick: function onClick() {
                                                                if (pl.team === 'red' && onSignalTarget) onSignalTarget(pl.id, 'focus');
                                                            },
                                                            title: pl.team === 'red' ? "Ping team: Focus " + pl.heroName + "!" : pl.heroName,
                                                            className: pl.team === 'red' ? 'cursor-pointer hover:scale-105 transition-transform' : 'cursor-default',
                                                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                                heroId: pl.heroId,
                                                                size: 34
                                                            })
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "min-w-0",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "font-black text-white truncate",
                                                                    children: [
                                                                        pl.heroName,
                                                                        " ",
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                            className: "text-[10px] text-amber-300 mlbb-num",
                                                                            children: [
                                                                                "Lv.",
                                                                                pl.level
                                                                            ]
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "text-[10px] text-slate-400 truncate flex items-center gap-1",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                            children: [
                                                                                pl.name,
                                                                                " \xb7"
                                                                            ]
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                                            type: "button",
                                                                            onClick: function onClick() {
                                                                                if (pl.team === 'red' && onSignalTarget) onSignalTarget(pl.id, 'no_spell');
                                                                            },
                                                                            title: pl.team === 'red' ? "Announce & track " + pl.heroName + "'s " + (0, _emblems.getMlbbBattleSpellById)(pl.spellId).name + " CD" : (0, _emblems.getMlbbBattleSpellById)(pl.spellId).name,
                                                                            className: pl.team === 'red' ? "px-1.5 py-0.5 rounded border text-[10px] font-black mlbb-num flex items-center gap-0.5 cursor-pointer " + (tracked ? 'bg-amber-500/25 border-amber-300 text-amber-200' : 'bg-rose-950/70 border-rose-500/40 text-rose-200 hover:bg-rose-800') : '',
                                                                            children: [
                                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                                    children: (0, _emblems.getMlbbBattleSpellById)(pl.spellId).icon
                                                                                }),
                                                                                tracked && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                                    children: [
                                                                                        tracked.remainingSec,
                                                                                        "s"
                                                                                    ]
                                                                                })
                                                                            ]
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                            children: (0, _emblems.getMlbbEmblemById)(pl.emblemId).icon
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                tab === 'equipment' ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "text-right mlbb-num",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "font-black text-white",
                                                                    children: [
                                                                        pl.kills,
                                                                        "/",
                                                                        pl.deaths,
                                                                        "/",
                                                                        pl.assists
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "text-[10px] text-amber-300",
                                                                    children: [
                                                                        pl.gold,
                                                                        "g"
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "flex gap-0.5",
                                                            children: [
                                                                0,
                                                                1,
                                                                2,
                                                                3,
                                                                4,
                                                                5
                                                            ].map(function(i) {
                                                                var _getMlbbItemById;
                                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-[11px]",
                                                                    children: pl.items[i] ? (_getMlbbItemById = (0, _items.getMlbbItemById)(pl.items[i])) == null ? void 0 : _getMlbbItemById.icon : ''
                                                                }, i);
                                                            })
                                                        }),
                                                        !pl.isPlayer && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            onClick: function onClick() {
                                                                return setMutedIds(function(m) {
                                                                    return m.includes(pl.id) ? m.filter(function(x) {
                                                                        return x !== pl.id;
                                                                    }) : [].concat(m, [
                                                                        pl.id
                                                                    ]);
                                                                });
                                                            },
                                                            className: "text-xs cursor-pointer",
                                                            title: "Mute Player",
                                                            children: mutedIds.includes(pl.id) ? '🔇' : '🔊'
                                                        })
                                                    ]
                                                }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-right text-[10px] mlbb-num",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "text-orange-300 font-bold",
                                                            children: [
                                                                "DMG ",
                                                                pl.damageDealt.toLocaleString()
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "text-sky-300",
                                                            children: [
                                                                "TANK ",
                                                                pl.damageTaken.toLocaleString(),
                                                                " \xb7 TUR ",
                                                                pl.turretDamage.toLocaleString()
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "text-emerald-300",
                                                            children: [
                                                                "TF ",
                                                                pl.teamfightPct,
                                                                "%"
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        }, pl.id);
                                    })
                                ]
                            }, title);
                        })
                    })
                })
            ]
        })
    });
};
var PostMatchScreen = function PostMatchScreen(param) {
    var record = param.record, profile = param.profile, starDelta = param.starDelta, _param_starProtected = param.starProtected, starProtected = _param_starProtected === void 0 ? false : _param_starProtected, _param_starProtectionSource = param.starProtectionSource, starProtectionSource = _param_starProtectionSource === void 0 ? null : _param_starProtectionSource, _param_starRaisedBonus = param.starRaisedBonus, starRaisedBonus = _param_starRaisedBonus === void 0 ? false : _param_starRaisedBonus, bpGain = param.bpGain, expGain = param.expGain, _param_doubleBpUsed = param.doubleBpUsed, doubleBpUsed = _param_doubleBpUsed === void 0 ? false : _param_doubleBpUsed, _param_doubleExpUsed = param.doubleExpUsed, doubleExpUsed = _param_doubleExpUsed === void 0 ? false : _param_doubleExpUsed, _param_mmrDelta = param.mmrDelta, mmrDelta = _param_mmrDelta === void 0 ? 0 : _param_mmrDelta, _param_masteryGain = param.masteryGain, masteryGain = _param_masteryGain === void 0 ? 0 : _param_masteryGain, onReturnLobby = param.onReturnLobby, onPlayAgain = param.onPlayAgain;
    var _Math, _Math1, _Math2;
    var _useState = (0, _react.useState)('overview'), viewMode = _useState[0], setViewMode = _useState[1];
    var _useState1 = (0, _react.useState)([]), likedIds = _useState1[0], setLikedIds = _useState1[1];
    var _useState2 = (0, _react.useState)(false), copiedToast = _useState2[0], setCopiedToast = _useState2[1];
    var rankTier = _emblems.MLBB_RANK_TIERS[Math.max(0, Math.min(_emblems.MLBB_RANK_TIERS.length - 1, profile.rankTierIdx))];
    var blue = record.players.filter(function(p) {
        return p.team === 'blue';
    });
    var red = record.players.filter(function(p) {
        return p.team === 'red';
    });
    var maxDmg = (_Math = Math).max.apply(_Math, [].concat([
        1
    ], record.players.map(function(p) {
        return p.damageDealt;
    })));
    var maxTank = (_Math1 = Math).max.apply(_Math1, [].concat([
        1
    ], record.players.map(function(p) {
        return p.damageTaken;
    })));
    var maxTur = (_Math2 = Math).max.apply(_Math2, [].concat([
        1
    ], record.players.map(function(p) {
        return p.turretDamage;
    })));
    var likeAllAllies = function likeAllAllies() {
        _AudioEngine.mlbbAudio.playClick();
        var allyIds = blue.filter(function(p) {
            return !p.isPlayer;
        }).map(function(p) {
            return p.id;
        });
        setLikedIds(function(prev) {
            return Array.from(new Set([].concat(prev, allyIds)));
        });
    };
    var copyMatchSummary = function copyMatchSummary() {
        _AudioEngine.mlbbAudio.playClick();
        var summary = "[Legends Arena] " + (record.victory ? 'VICTORY' : 'DEFEAT') + " (" + record.mode.toUpperCase() + ") \xb7 " + record.playerHeroName + " " + record.kda.join('/') + " \xb7 Rating " + record.rating.toFixed(1) + " (" + record.medal + ") \xb7 " + (0, _mapData.formatClock)(record.durationSec);
        try {
            var _navigator_clipboard;
            (_navigator_clipboard = navigator.clipboard) == null ? void 0 : _navigator_clipboard.writeText(summary);
        } catch (unused) {
        // Clipboard optional in sandbox
        }
        setCopiedToast(true);
        window.setTimeout(function() {
            return setCopiedToast(false);
        }, 2000);
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "w-full h-full bg-gradient-to-b from-[#070E21] via-[#0E1A3B] to-[#050A18] text-slate-100 flex flex-col p-4 overflow-y-auto",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "flex flex-wrap items-center justify-between gap-3 border-b border-[#F5C451]/35 pb-3",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-3xl font-black tracking-wider " + (record.victory ? 'text-[#F5C451]' : 'text-rose-400'),
                                        children: record.victory ? 'VICTORY' : 'DEFEAT'
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "text-xs font-black text-amber-200 mlbb-num",
                                        children: [
                                            "Rating ",
                                            record.rating.toFixed(1),
                                            " \xb7 ",
                                            record.medal
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "text-xs text-slate-300 mlbb-num",
                                children: [
                                    record.mode.toUpperCase(),
                                    " \xb7 ",
                                    (0, _mapData.formatClock)(record.durationSec),
                                    " \xb7 Score ",
                                    record.blueKills,
                                    " - ",
                                    record.redKills,
                                    mmrDelta !== 0 ? " \xb7 Hero MMR " + (mmrDelta > 0 ? "+" + mmrDelta : mmrDelta) : '',
                                    masteryGain > 0 ? " \xb7 Mastery +" + masteryGain : ''
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "flex flex-wrap items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "px-3.5 py-2 rounded-xl bg-[#101C3D] border border-[#F5C451]/45 flex items-center gap-2.5 text-xs",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.RankCrestSvg, {
                                        tierIdx: profile.rankTierIdx,
                                        size: 34
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "font-black text-[#F5C451] flex items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        children: [
                                                            rankTier.name,
                                                            " ★",
                                                            profile.rankStars
                                                        ]
                                                    }),
                                                    starDelta !== 0 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: starDelta > 0 ? 'text-emerald-400' : 'text-rose-400',
                                                        children: [
                                                            "(",
                                                            starDelta > 0 ? "+" + starDelta : starDelta,
                                                            ")"
                                                        ]
                                                    }),
                                                    starProtected && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                        className: "text-sky-300 font-black",
                                                        children: [
                                                            "\xb7 \uD83D\uDEE1️ Star Protected (",
                                                            starProtectionSource === 'card' ? 'Card' : '1000 Pts',
                                                            ")"
                                                        ]
                                                    }),
                                                    starRaisedBonus && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                        className: "text-amber-300 font-black",
                                                        children: "\xb7 ⭐ Star Raising +1"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-[11px] text-amber-200 mlbb-num",
                                                children: [
                                                    "+",
                                                    bpGain,
                                                    " BP",
                                                    doubleBpUsed ? ' (2x Card)' : '',
                                                    " \xb7 +",
                                                    expGain,
                                                    " EXP",
                                                    doubleExpUsed ? ' (2x Card)' : '',
                                                    " \xb7 Protection ",
                                                    profile.starProtectionPts,
                                                    "/1000"
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "mt-1 h-1.5 w-48 rounded-full bg-slate-900 overflow-hidden",
                                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "h-full bg-gradient-to-r from-sky-400 to-[#F5C451]",
                                                    style: {
                                                        width: "" + Math.min(100, Math.round(profile.starProtectionPts / 1000 * 100)) + "%"
                                                    }
                                                })
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            return setViewMode('overview');
                                        },
                                        className: "px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer " + (viewMode === 'overview' ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'),
                                        children: "Overview"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                        onClick: function onClick() {
                                            return setViewMode('data');
                                        },
                                        className: "px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer " + (viewMode === 'data' ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'),
                                        children: "Damage Data"
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-3 my-4 flex-1",
                children: [
                    [
                        'BLUE TEAM (ALLIES)',
                        blue,
                        record.victory
                    ],
                    [
                        'RED TEAM (ENEMIES)',
                        red,
                        !record.victory
                    ]
                ].map(function(param) {
                    var title = param[0], list = param[1], isWinningSide = param[2];
                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center justify-between text-xs font-black text-slate-300",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: title
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: isWinningSide ? 'text-[#F5C451]' : 'text-rose-300',
                                        children: isWinningSide ? 'WINNING SIDE' : 'DEFEATED SIDE'
                                    })
                                ]
                            }),
                            list.map(function(pl) {
                                var isSideMvp = pl.isMvp || pl.medal === 'MVP';
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p-2.5 rounded-xl bg-[#0F1B3B] border flex items-center justify-between gap-2 text-xs " + (isSideMvp ? 'border-[#F5C451]' : pl.isPlayer ? 'border-sky-400' : 'border-slate-700'),
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center gap-2.5 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                    heroId: pl.heroId,
                                                    size: 38
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "font-black text-white flex items-center gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "truncate",
                                                                    children: pl.heroName
                                                                }),
                                                                isSideMvp && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: isWinningSide ? 'text-[#F5C451]' : 'text-purple-300',
                                                                    children: isWinningSide ? '👑 MVP' : '🏅 Defeat MVP'
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "text-[10px] text-slate-400 truncate mlbb-num",
                                                            children: [
                                                                pl.name,
                                                                " \xb7 ",
                                                                pl.kills,
                                                                "/",
                                                                pl.deaths,
                                                                "/",
                                                                pl.assists,
                                                                " \xb7 ",
                                                                pl.gold.toLocaleString(),
                                                                "g"
                                                            ]
                                                        }),
                                                        viewMode === 'overview' && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "flex gap-0.5 mt-1",
                                                            children: [
                                                                0,
                                                                1,
                                                                2,
                                                                3,
                                                                4,
                                                                5
                                                            ].map(function(i) {
                                                                var _getMlbbItemById, _getMlbbItemById1;
                                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "w-4.5 h-4.5 rounded bg-slate-900 border border-slate-700/70 flex items-center justify-center text-[10px]",
                                                                    title: pl.items[i] ? (_getMlbbItemById = (0, _items.getMlbbItemById)(pl.items[i])) == null ? void 0 : _getMlbbItemById.name : 'Empty Slot',
                                                                    children: pl.items[i] ? (_getMlbbItemById1 = (0, _items.getMlbbItemById)(pl.items[i])) == null ? void 0 : _getMlbbItemById1.icon : ''
                                                                }, i);
                                                            })
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        viewMode === 'overview' ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center gap-2 shrink-0",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-right mlbb-num",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-black text-[#F5C451] text-sm",
                                                            children: pl.rating.toFixed(1)
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[10px] text-slate-300",
                                                            children: pl.medal
                                                        })
                                                    ]
                                                }),
                                                !pl.isPlayer && /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    onClick: function onClick() {
                                                        _AudioEngine.mlbbAudio.playClick();
                                                        setLikedIds(function(prev) {
                                                            return prev.includes(pl.id) ? prev : [].concat(prev, [
                                                                pl.id
                                                            ]);
                                                        });
                                                    },
                                                    className: "px-2 py-1 rounded-lg text-[11px] font-black cursor-pointer " + (likedIds.includes(pl.id) ? 'bg-pink-600 text-white' : 'bg-slate-800 text-pink-300 hover:bg-slate-700'),
                                                    title: "Send Post-Match Like",
                                                    children: likedIds.includes(pl.id) ? '👍 Liked' : '👍'
                                                })
                                            ]
                                        }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "w-44 space-y-1 text-[10px] mlbb-num shrink-0",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "flex justify-between text-orange-300 font-bold",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    children: "Hero DMG"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    children: pl.damageDealt.toLocaleString()
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "h-1 rounded bg-slate-900 overflow-hidden",
                                                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "h-full bg-orange-400",
                                                                style: {
                                                                    width: "" + Math.round(pl.damageDealt / maxDmg * 100) + "%"
                                                                }
                                                            })
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "flex justify-between text-sky-300",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    children: "Taken"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    children: pl.damageTaken.toLocaleString()
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "h-1 rounded bg-slate-900 overflow-hidden",
                                                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "h-full bg-sky-400",
                                                                style: {
                                                                    width: "" + Math.round(pl.damageTaken / maxTank * 100) + "%"
                                                                }
                                                            })
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "flex justify-between text-amber-300",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    children: [
                                                                        "Turret \xb7 TF ",
                                                                        pl.teamfightPct,
                                                                        "%"
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    children: pl.turretDamage.toLocaleString()
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "h-1 rounded bg-slate-900 overflow-hidden",
                                                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "h-full bg-amber-400",
                                                                style: {
                                                                    width: "" + Math.round(pl.turretDamage / maxTur * 100) + "%"
                                                                }
                                                            })
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }, pl.id);
                            })
                        ]
                    }, title);
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "flex flex-wrap items-center justify-center gap-3 pt-2",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        onClick: likeAllAllies,
                        className: "h-11 px-5 rounded-xl bg-pink-700/85 hover:bg-pink-600 text-white font-black text-xs cursor-pointer",
                        children: "\uD83D\uDC4D Like All Allies"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        onClick: copyMatchSummary,
                        className: "h-11 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-sky-200 font-black text-xs cursor-pointer",
                        children: copiedToast ? 'Copied Summary ✓' : 'Share Summary'
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        onClick: function onClick() {
                            _AudioEngine.mlbbAudio.playClick();
                            onReturnLobby();
                        },
                        className: "h-11 px-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm cursor-pointer",
                        children: "Return to Lobby"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                        onClick: function onClick() {
                            _AudioEngine.mlbbAudio.playClick();
                            onPlayAgain();
                        },
                        className: "h-11 px-10 rounded-xl bg-[#F5C451] bg-gradient-to-r from-[#F5C451] to-[#D97706] border border-amber-200 text-slate-950 font-black text-sm cursor-pointer shadow-lg",
                        children: "Play Again"
                    })
                ]
            })
        ]
    });
};

});

})(window.ArcadeMod);
