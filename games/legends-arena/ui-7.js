(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/components/InMatchShopModal ===
ArcadeMod.define("src/games/legends-arena/mlbb/components/InMatchShopModal", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InMatchShopModal", {
    enumerable: true,
    get: function() {
        return InMatchShopModal;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _items = require("../data/items");
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
var STAT_LABELS = {
    physAtk: [
        'Physical ATK',
        false
    ],
    magicPow: [
        'Magic Power',
        false
    ],
    adaptiveAtk: [
        'Adaptive ATK',
        false
    ],
    maxHp: [
        'Max HP',
        false
    ],
    maxMana: [
        'Max Mana',
        false
    ],
    manaRegen: [
        'Mana Regen',
        false
    ],
    physDef: [
        'Physical DEF',
        false
    ],
    magicDef: [
        'Magic DEF',
        false
    ],
    moveSpd: [
        'Move Speed',
        false
    ],
    moveSpdPct: [
        'Move Speed',
        true
    ],
    atkSpdPct: [
        'Attack Speed',
        true
    ],
    critChance: [
        'Crit Chance',
        true
    ],
    critDmgPct: [
        'Crit Damage',
        true
    ],
    cdrPct: [
        'CD Reduction',
        true
    ],
    lifestealPct: [
        'Lifesteal',
        true
    ],
    spellVampPct: [
        'Spell Vamp',
        true
    ],
    flatPhysPen: [
        'Physical PEN',
        false
    ],
    pctPhysPen: [
        'Physical PEN',
        true
    ],
    flatMagicPen: [
        'Magic PEN',
        false
    ],
    pctMagicPen: [
        'Magic PEN',
        true
    ],
    ccResPct: [
        'CC Resilience',
        true
    ],
    hpRegen: [
        'HP Regen',
        false
    ],
    healEffectPct: [
        'Healing Effect',
        true
    ]
};
function formatStatLine(key, val) {
    var meta = STAT_LABELS[key];
    if (!meta) return "+" + val + " " + key;
    var label = meta[0], isPct = meta[1];
    if (isPct) {
        var shown = val > 0 && val < 1 ? Math.round(val * 100) : val;
        return "+" + shown + "% " + label;
    }
    return "+" + val + " " + label;
}
var SHOP_CATEGORIES = [
    {
        id: 'recommended',
        label: 'Recommended',
        icon: '★'
    },
    {
        id: 'attack',
        label: 'Attack',
        icon: '⚔️'
    },
    {
        id: 'magic',
        label: 'Magic',
        icon: '🔮'
    },
    {
        id: 'defense',
        label: 'Defense',
        icon: '🛡️'
    },
    {
        id: 'movement',
        label: 'Movement',
        icon: '👢'
    },
    {
        id: 'jungling',
        label: 'Jungling',
        icon: '🐺'
    },
    {
        id: 'roaming',
        label: 'Roaming',
        icon: '🧭'
    },
    {
        id: 'consumable',
        label: 'Potions',
        icon: '🧪'
    },
    {
        id: 'unique',
        label: 'Unique',
        icon: '🪷'
    }
];
var CraftingNodeCard = function CraftingNodeCard(param) {
    var node = param.node, selectedId = param.selectedId, gold = param.gold, onSelect = param.onSelect;
    var isSel = selectedId === node.item.id;
    var canAfford = gold >= node.effectiveCost;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
        type: "button",
        onClick: function onClick() {
            _AudioEngine.mlbbAudio.playClick();
            onSelect(node.item.id);
        },
        className: "px-2 py-1 rounded-lg border text-left transition-colors cursor-pointer min-w-[92px] " + (node.owned ? 'bg-emerald-950/70 border-emerald-400/70 text-emerald-100' : isSel ? 'bg-amber-500/25 border-[#F5C451] text-white' : 'bg-slate-900/90 border-slate-700 hover:border-slate-500 text-slate-200'),
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "flex items-center gap-1",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                        className: "text-sm leading-none",
                        children: node.item.icon
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                        className: "text-[10px] font-black truncate max-w-[68px]",
                        children: node.item.shortName
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "flex items-center justify-between mt-0.5 text-[9px] font-bold mlbb-num",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                        className: "text-slate-400",
                        children: [
                            "T",
                            node.item.tier
                        ]
                    }),
                    node.owned ? /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                        className: "text-emerald-300",
                        children: "OWNED ✓"
                    }) : /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                        className: canAfford ? 'text-amber-300' : 'text-slate-400',
                        children: [
                            node.effectiveCost,
                            "g"
                        ]
                    })
                ]
            })
        ]
    });
};
var InMatchShopModal = function InMatchShopModal(param) {
    var snap = param.snap, builds = param.builds, _param_uiOpacity = param.uiOpacity, uiOpacity = _param_uiOpacity === void 0 ? 0.94 : _param_uiOpacity, _param_hasBargainHunter = param.hasBargainHunter, hasBargainHunter = _param_hasBargainHunter === void 0 ? false : _param_hasBargainHunter, onBuy = param.onBuy, onSell = param.onSell, onPrioritize = param.onPrioritize, onSwitchBuild = param.onSwitchBuild, onPingNeedGold = param.onPingNeedGold, onClose = param.onClose;
    var _ref, _builds_snap_player_activeBuildIdx, _activePlanIds_, _getMlbbItemById, _ref1, _selected_activeCd, _selected_passiveName;
    var activePlanIds = (_ref = (_builds_snap_player_activeBuildIdx = builds[snap.player.activeBuildIdx]) != null ? _builds_snap_player_activeBuildIdx : builds[0]) != null ? _ref : [];
    var _useState = (0, _react.useState)('recommended'), cat = _useState[0], setCat = _useState[1];
    var _useState1 = (0, _react.useState)((_activePlanIds_ = activePlanIds[0]) != null ? _activePlanIds_ : 'blade_of_despair'), selectedId = _useState1[0], setSelectedId = _useState1[1];
    var _useState2 = (0, _react.useState)(false), peekMode = _useState2[0], setPeekMode = _useState2[1];
    var discountRate = hasBargainHunter ? 0.05 : 0;
    var itemsInView = (0, _react.useMemo)(function() {
        if (cat === 'recommended') {
            var planDefs = activePlanIds.map(function(id) {
                return (0, _items.getMlbbItemById)(id);
            }).filter(function(x) {
                return Boolean(x);
            });
            if (planDefs.length > 0) return planDefs;
            return _items.MLBB_ITEMS.filter(function(i) {
                return i.tier === 3;
            }).slice(0, 6);
        }
        return _items.MLBB_ITEMS.filter(function(i) {
            return i.category === cat;
        }).sort(function(a, b) {
            return b.tier - a.tier || a.cost - b.cost;
        });
    }, [
        cat,
        activePlanIds
    ]);
    var selected = (_getMlbbItemById = (0, _items.getMlbbItemById)(selectedId)) != null ? _getMlbbItemById : itemsInView[0];
    var costCalc = selected ? (0, _items.computeMlbbEffectiveCost)(selected.id, snap.player.items, discountRate) : {
        effectiveCost: 0,
        consumedIndices: []
    };
    var effCost = costCalc.effectiveCost;
    var savedGold = selected ? Math.max(0, selected.cost - effCost) : 0;
    var missingGold = Math.max(0, effCost - snap.player.gold);
    var craftingTree = (0, _react.useMemo)(function() {
        return selected ? (0, _items.getItemCraftingTree)(selected.id, snap.player.items, discountRate) : null;
    }, [
        selected,
        snap.player.items,
        discountRate
    ]);
    // Sync panel opacity with Settings -> Interface -> Battlefield UI Opacity
    var effectiveOpacity = peekMode ? 0.52 : Math.max(0.55, Math.min(0.98, uiOpacity));
    var activeBlessing = snap.player.blessingId ? (0, _items.getMlbbItemById)(snap.player.blessingId) : null;
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "fixed inset-0 z-40 flex items-center justify-center p-2.5 sm:p-4 pointer-events-auto bg-slate-950/30",
        onClick: onClose,
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            onClick: function onClick(e) {
                return e.stopPropagation();
            },
            style: {
                opacity: effectiveOpacity
            },
            className: "w-full max-w-5xl max-h-[88vh] rounded-2xl bg-[#071022]/96 backdrop-blur-md border-2 border-[#F5C451]/70 flex flex-col overflow-hidden text-slate-100 shadow-2xl transition-opacity",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#0E1B3B] border-b border-[#F5C451]/35",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex flex-wrap items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    className: "text-sm font-black tracking-wide text-[#F5C451]",
                                    children: "SHOP ANYWHERE"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                    className: "text-sm font-black text-amber-300 mlbb-num",
                                    children: [
                                        "\uD83E\uDE99 ",
                                        snap.player.gold.toLocaleString()
                                    ]
                                }),
                                hasBargainHunter && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    className: "text-[10px] font-black text-emerald-300 tracking-wide",
                                    children: "BARGAIN HUNTER -5%"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "flex items-center gap-1",
                                    children: [
                                        0,
                                        1,
                                        2
                                    ].map(function(idx) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                            type: "button",
                                            onClick: function onClick() {
                                                _AudioEngine.mlbbAudio.playClick();
                                                onSwitchBuild(idx);
                                            },
                                            className: "px-2 py-0.5 rounded text-[10px] font-black cursor-pointer " + (snap.player.activeBuildIdx === idx ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800/90 text-slate-300 hover:text-white'),
                                            children: [
                                                "Plan ",
                                                idx + 1
                                            ]
                                        }, idx);
                                    })
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                    className: "hidden md:inline text-[10px] font-bold text-slate-400 mlbb-num",
                                    children: [
                                        "UI Opacity ",
                                        Math.round(effectiveOpacity * 100),
                                        "%"
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    onClick: function onClick() {
                                        return setPeekMode(function(v) {
                                            return !v;
                                        });
                                    },
                                    className: "px-2.5 py-1 rounded-lg text-[11px] font-black border cursor-pointer " + (peekMode ? 'bg-sky-500/25 border-sky-400 text-sky-200' : 'bg-slate-800 border-slate-700 text-slate-200'),
                                    title: "Toggle Transparent Map Peek",
                                    children: [
                                        "\uD83D\uDC41️ ",
                                        peekMode ? 'Restore' : 'Peek Map'
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    type: "button",
                                    onClick: onClose,
                                    className: "w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 font-black cursor-pointer",
                                    title: "Close Shop (P)",
                                    children: "✕"
                                })
                            ]
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex flex-1 min-h-0",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "w-28 sm:w-32 bg-[#060C1D] border-r border-slate-800 p-2 space-y-1 overflow-y-auto shrink-0",
                            children: SHOP_CATEGORIES.map(function(c) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    type: "button",
                                    onClick: function onClick() {
                                        _AudioEngine.mlbbAudio.playClick();
                                        setCat(c.id);
                                    },
                                    className: "w-full px-2.5 py-2 rounded-lg text-left text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition-colors " + (cat === c.id ? 'bg-[#F5C451] text-slate-950' : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'),
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "text-xs",
                                            children: c.icon
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "truncate",
                                            children: c.label
                                        })
                                    ]
                                }, c.id);
                            })
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex-1 flex flex-col min-w-0 overflow-hidden",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "flex-1 p-3 overflow-y-auto",
                                    children: [
                                        cat === 'recommended' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "mb-2 flex items-center justify-between text-[11px]",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    className: "font-black text-[#F5C451] uppercase",
                                                    children: [
                                                        "Active Build Plan #",
                                                        snap.player.activeBuildIdx + 1,
                                                        " (6 Core Slots)"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "text-slate-400",
                                                    children: "Tap any item to view its 3-Tier Crafting Tree"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid grid-cols-2 sm:grid-cols-3 gap-2",
                                            children: itemsInView.map(function(it, idx) {
                                                var eff = (0, _items.computeMlbbEffectiveCost)(it.id, snap.player.items, discountRate).effectiveCost;
                                                var owned = snap.player.items.includes(it.id) || snap.player.blessingId === it.id;
                                                var isPrio = snap.player.prioritizedItemId === it.id;
                                                var canAfford = snap.player.gold >= eff;
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    type: "button",
                                                    onClick: function onClick() {
                                                        _AudioEngine.mlbbAudio.playClick();
                                                        setSelectedId(it.id);
                                                    },
                                                    className: "p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-colors " + ((selected == null ? void 0 : selected.id) === it.id ? 'bg-amber-500/20 border-[#F5C451]' : owned ? 'bg-emerald-950/35 border-emerald-500/45' : 'bg-[#0F1B3B] border-slate-700/90 hover:border-slate-500'),
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "text-2xl shrink-0",
                                                            children: it.icon
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "min-w-0 flex-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "text-xs font-black text-white truncate flex items-center gap-1",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                            className: "truncate",
                                                                            children: it.name
                                                                        }),
                                                                        isPrio && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                            className: "text-sky-300 shrink-0",
                                                                            children: "★"
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "flex items-center justify-between mt-0.5 text-[10px] font-bold mlbb-num",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                            className: owned ? 'text-emerald-300' : canAfford ? 'text-amber-300' : 'text-slate-400',
                                                                            children: owned ? 'EQUIPPED ✓' : eff === 0 ? 'FREE' : "" + eff + "g"
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                            className: "text-slate-400",
                                                                            children: [
                                                                                "T",
                                                                                it.tier
                                                                            ]
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }, it.id + "_" + idx);
                                            })
                                        })
                                    ]
                                }),
                                craftingTree && craftingTree.children.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "px-3 py-2.5 bg-[#081229] border-t border-[#F5C451]/30",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center justify-between mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "text-[10px] font-black text-[#F5C451] uppercase tracking-wider",
                                                    children: "3-Tier Interactive Crafting Tree — Auto Component Gold Credit"
                                                }),
                                                savedGold > 0 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                    className: "text-[10px] font-black text-emerald-300 mlbb-num",
                                                    children: [
                                                        "Saved ",
                                                        savedGold,
                                                        "g from Components",
                                                        hasBargainHunter ? ' + BH' : ''
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex flex-col items-center gap-1.5 overflow-x-auto pb-1",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)(CraftingNodeCard, {
                                                    node: craftingTree,
                                                    selectedId: (_ref1 = selected == null ? void 0 : selected.id) != null ? _ref1 : '',
                                                    gold: snap.player.gold,
                                                    onSelect: setSelectedId
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "w-px h-2.5 bg-[#F5C451]/50"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "flex items-start justify-center gap-3 flex-wrap",
                                                    children: craftingTree.children.map(function(t2Node, i) {
                                                        var _ref;
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "flex flex-col items-center gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)(CraftingNodeCard, {
                                                                    node: t2Node,
                                                                    selectedId: (_ref = selected == null ? void 0 : selected.id) != null ? _ref : '',
                                                                    gold: snap.player.gold,
                                                                    onSelect: setSelectedId
                                                                }),
                                                                t2Node.children.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                            className: "w-px h-2 bg-slate-600"
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                            className: "flex items-center gap-1",
                                                                            children: t2Node.children.map(function(t1Node, j) {
                                                                                var _ref;
                                                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)(CraftingNodeCard, {
                                                                                    node: t1Node,
                                                                                    selectedId: (_ref = selected == null ? void 0 : selected.id) != null ? _ref : '',
                                                                                    gold: snap.player.gold,
                                                                                    onSelect: setSelectedId
                                                                                }, t1Node.item.id + "_" + j);
                                                                            })
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }, t2Node.item.id + "_" + i);
                                                    })
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        selected && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "w-64 sm:w-72 bg-[#0B1633] border-l border-slate-800 p-3 flex flex-col justify-between text-xs shrink-0",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "space-y-2.5 overflow-y-auto pr-0.5",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center gap-2.5 pb-2 border-b border-slate-800",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "w-12 h-12 rounded-xl bg-slate-900 border border-[#F5C451]/50 flex items-center justify-center text-3xl shrink-0",
                                                    children: selected.icon
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "font-black text-white text-sm leading-tight truncate",
                                                            children: selected.name
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "text-amber-300 font-black mlbb-num mt-0.5",
                                                            children: [
                                                                effCost === 0 ? 'FREE BLESSING' : "" + effCost.toLocaleString() + " Gold",
                                                                savedGold > 0 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    className: "text-[10px] text-slate-400 line-through ml-1.5",
                                                                    children: [
                                                                        selected.cost,
                                                                        "g"
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        Object.keys(selected.stats).length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "space-y-0.5 text-[11px] font-bold text-emerald-300 mlbb-num",
                                            children: Object.entries(selected.stats).map(function(param) {
                                                var k = param[0], v = param[1];
                                                return typeof v === 'number' && v !== 0 ? /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    children: formatStatLine(k, v)
                                                }, k) : null;
                                            })
                                        }),
                                        selected.activeName && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "p-2 rounded-lg bg-cyan-950/50 border border-cyan-400/45 text-[11px]",
                                            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "font-black text-cyan-300",
                                                children: [
                                                    "ACTIVE: ",
                                                    selected.activeName,
                                                    " (",
                                                    (_selected_activeCd = selected.activeCd) != null ? _selected_activeCd : 70,
                                                    "s CD)"
                                                ]
                                            })
                                        }),
                                        selected.consumableDurationSec && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-2 rounded-lg bg-purple-950/60 border border-purple-400/50 text-[10px] font-bold text-purple-200",
                                            children: [
                                                "\uD83E\uDDEA Instant ",
                                                selected.consumableDurationSec,
                                                "s Potion Surge — Does not occupy an equipment slot."
                                            ]
                                        }),
                                        selected.passiveDesc && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] text-slate-200 leading-relaxed",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "font-black text-[#F5C451] mb-0.5",
                                                    children: [
                                                        "Unique Passive — ",
                                                        (_selected_passiveName = selected.passiveName) != null ? _selected_passiveName : 'Effect'
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    children: selected.passiveDesc
                                                }),
                                                selected.uniquePassives && selected.uniquePassives.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-[10px] text-slate-400 mt-1",
                                                    children: [
                                                        "Non-Stacking Key: ",
                                                        selected.uniquePassives.join(', ')
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "space-y-1.5 pt-2.5 border-t border-slate-800",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "grid grid-cols-2 gap-1.5",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    type: "button",
                                                    onClick: function onClick() {
                                                        _AudioEngine.mlbbAudio.playClick();
                                                        onPrioritize(snap.player.prioritizedItemId === selected.id ? null : selected.id);
                                                    },
                                                    className: "py-1.5 px-2 rounded-lg text-[10px] font-black cursor-pointer " + (snap.player.prioritizedItemId === selected.id ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-sky-300 hover:bg-slate-700'),
                                                    children: snap.player.prioritizedItemId === selected.id ? '★ Prioritized' : '☆ Prioritize'
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    type: "button",
                                                    onClick: function onClick() {
                                                        return onPingNeedGold == null ? void 0 : onPingNeedGold(selected.id);
                                                    },
                                                    className: "py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-amber-500/25 border border-amber-400/40 text-[10px] font-black text-amber-200 cursor-pointer mlbb-num truncate",
                                                    title: missingGold > 0 ? "Broadcast: Need " + missingGold + " more Gold for " + selected.name + "!" : "Broadcast: Ready to buy " + selected.name + "!",
                                                    children: [
                                                        "\uD83D\uDCE3 ",
                                                        missingGold > 0 ? "Need " + missingGold + "g" : 'Ping Ready'
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            type: "button",
                                            disabled: snap.player.gold < effCost,
                                            onClick: function onClick() {
                                                return onBuy(selected.id);
                                            },
                                            className: "w-full py-2.5 rounded-xl font-black text-xs tracking-wide cursor-pointer mlbb-num " + (snap.player.gold >= effCost ? 'bg-gradient-to-r from-[#F5C451] to-[#EAB308] text-slate-950 hover:brightness-110' : 'bg-slate-800 text-slate-500 cursor-not-allowed'),
                                            children: effCost === 0 ? "EQUIP " + selected.shortName.toUpperCase() : snap.player.gold >= effCost ? "BUY " + selected.shortName.toUpperCase() + " (" + effCost + "g)" : "NEED " + missingGold + " MORE GOLD"
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "px-4 py-2.5 bg-[#060C1D] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    className: "text-[10px] font-black text-slate-400 uppercase tracking-wide",
                                    children: "Equipped (Tap to Sell 60%):"
                                }),
                                [
                                    0,
                                    1,
                                    2,
                                    3,
                                    4,
                                    5
                                ].map(function(slot) {
                                    var _ref;
                                    var id = snap.player.items[slot];
                                    var it = id ? (0, _items.getMlbbItemById)(id) : null;
                                    var refund = it ? (0, _items.computeMlbbSellRefund)(it.id) : 0;
                                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                        type: "button",
                                        disabled: !it,
                                        onClick: function onClick() {
                                            return it && onSell(slot);
                                        },
                                        title: it ? "Sell " + it.name + " for +" + refund + "g (60% refund)" : 'Empty Equipment Slot',
                                        className: "w-11 h-11 rounded-lg border flex flex-col items-center justify-center " + (it ? 'bg-[#0F1B3B] border-slate-600 hover:border-rose-400 cursor-pointer' : 'bg-slate-950/70 border-slate-800 cursor-default'),
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                className: "text-lg leading-none",
                                                children: (_ref = it == null ? void 0 : it.icon) != null ? _ref : '·'
                                            }),
                                            it && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-[8px] font-black text-amber-300 mlbb-num",
                                                children: [
                                                    "+",
                                                    refund
                                                ]
                                            })
                                        ]
                                    }, slot);
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex items-center gap-3 text-[11px]",
                            children: [
                                activeBlessing && /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                    className: "font-black text-cyan-300",
                                    children: [
                                        activeBlessing.icon,
                                        " ",
                                        activeBlessing.shortName
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                    className: "text-slate-400 hidden sm:inline",
                                    children: [
                                        "Plan #",
                                        snap.player.activeBuildIdx + 1,
                                        ":",
                                        ' ',
                                        activePlanIds.map(function(id) {
                                            var _ref;
                                            var _getMlbbItemById;
                                            return (_ref = (_getMlbbItemById = (0, _items.getMlbbItemById)(id)) == null ? void 0 : _getMlbbItemById.icon) != null ? _ref : '';
                                        }).join(' ')
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
// === MODULE: src/games/legends-arena/mlbb/components/LiveStreamOverlay ===
ArcadeMod.define("src/games/legends-arena/mlbb/components/LiveStreamOverlay", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LiveStreamOverlay", {
    enumerable: true,
    get: function() {
        return LiveStreamOverlay;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _mapData = require("../data/mapData");
var _GameEngine = require("../engine/GameEngine");
var _HeroAvatarSvg = require("./HeroAvatarSvg");
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
var FEATURED_MATCHUPS = [
    {
        title: 'MPL GRAND FINALS · ONIC vs AP BREN',
        blueTag: 'ONIC',
        redTag: 'BREN',
        blue: [
            {
                heroId: 'tigreal',
                lane: 'Roam',
                name: 'ONIC.Kiboy',
                isPlayer: true,
                spellId: 'flicker',
                emblemId: 'tank'
            },
            {
                heroId: 'lancelot',
                lane: 'Jungle',
                name: 'ONIC.Kairi',
                isPlayer: false,
                spellId: 'retribution',
                emblemId: 'assassin'
            },
            {
                heroId: 'kagura',
                lane: 'Mid',
                name: 'ONIC.Sanz',
                isPlayer: false,
                spellId: 'flicker',
                emblemId: 'mage'
            },
            {
                heroId: 'beatrix',
                lane: 'Gold',
                name: 'ONIC.CW',
                isPlayer: false,
                spellId: 'flicker',
                emblemId: 'marksman'
            },
            {
                heroId: 'yu_zhong',
                lane: 'EXP',
                name: 'ONIC.Lutpiii',
                isPlayer: false,
                spellId: 'petrify',
                emblemId: 'fighter'
            }
        ],
        red: [
            {
                heroId: 'franco',
                lane: 'Roam',
                name: 'BREN.Owgwen',
                isPlayer: false,
                spellId: 'flicker',
                emblemId: 'tank'
            },
            {
                heroId: 'fanny',
                lane: 'Jungle',
                name: 'BREN.KyleTzy',
                isPlayer: false,
                spellId: 'retribution',
                emblemId: 'assassin'
            },
            {
                heroId: 'valentina',
                lane: 'Mid',
                name: 'BREN.Pheww',
                isPlayer: false,
                spellId: 'flicker',
                emblemId: 'mage'
            },
            {
                heroId: 'wanwan',
                lane: 'Gold',
                name: 'BREN.SuperMarco',
                isPlayer: false,
                spellId: 'inspire',
                emblemId: 'marksman'
            },
            {
                heroId: 'lapu_lapu',
                lane: 'EXP',
                name: 'BREN.FlapTzy',
                isPlayer: false,
                spellId: 'vengeance',
                emblemId: 'fighter'
            }
        ]
    },
    {
        title: 'M-SERIES SHOWDOWN · ECHO vs RRQ',
        blueTag: 'ECHO',
        redTag: 'RRQ',
        blue: [
            {
                heroId: 'chou',
                lane: 'Roam',
                name: 'ECHO.Yawi',
                isPlayer: true,
                spellId: 'flicker',
                emblemId: 'tank'
            },
            {
                heroId: 'ling',
                lane: 'Jungle',
                name: 'ECHO.KarlTzy',
                isPlayer: false,
                spellId: 'retribution',
                emblemId: 'assassin'
            },
            {
                heroId: 'pharsa',
                lane: 'Mid',
                name: 'ECHO.Sanji',
                isPlayer: false,
                spellId: 'purify',
                emblemId: 'mage'
            },
            {
                heroId: 'claude',
                lane: 'Gold',
                name: 'ECHO.Bennyqt',
                isPlayer: false,
                spellId: 'purify',
                emblemId: 'marksman'
            },
            {
                heroId: 'arlott',
                lane: 'EXP',
                name: 'ECHO.Sanford',
                isPlayer: false,
                spellId: 'petrify',
                emblemId: 'fighter'
            }
        ],
        red: [
            {
                heroId: 'khufra',
                lane: 'Roam',
                name: 'RRQ.Vyn',
                isPlayer: false,
                spellId: 'flicker',
                emblemId: 'tank'
            },
            {
                heroId: 'hayabusa',
                lane: 'Jungle',
                name: 'RRQ.Alberttt',
                isPlayer: false,
                spellId: 'retribution',
                emblemId: 'assassin'
            },
            {
                heroId: 'lunox',
                lane: 'Mid',
                name: 'RRQ.Clayyy',
                isPlayer: false,
                spellId: 'flicker',
                emblemId: 'mage'
            },
            {
                heroId: 'brody',
                lane: 'Gold',
                name: 'RRQ.Skylar',
                isPlayer: false,
                spellId: 'flicker',
                emblemId: 'marksman'
            },
            {
                heroId: 'paquito',
                lane: 'EXP',
                name: 'RRQ.R7',
                isPlayer: false,
                spellId: 'flicker',
                emblemId: 'fighter'
            }
        ]
    },
    {
        title: 'MYTHICAL IMMORTAL 2026 · ALL-STAR CLASH',
        blueTag: 'DAWN',
        redTag: 'ABYSS',
        blue: [
            {
                heroId: 'mathilda',
                lane: 'Roam',
                name: 'DAWN.V33nus',
                isPlayer: true,
                spellId: 'flicker',
                emblemId: 'support'
            },
            {
                heroId: 'suyou',
                lane: 'Jungle',
                name: 'DAWN.Wise',
                isPlayer: false,
                spellId: 'retribution',
                emblemId: 'assassin'
            },
            {
                heroId: 'zhuxin',
                lane: 'Mid',
                name: 'DAWN.Hadji',
                isPlayer: false,
                spellId: 'flameshot',
                emblemId: 'mage'
            },
            {
                heroId: 'hirara',
                lane: 'Gold',
                name: 'DAWN.Oheb',
                isPlayer: false,
                spellId: 'flicker',
                emblemId: 'marksman'
            },
            {
                heroId: 'lukas',
                lane: 'EXP',
                name: 'DAWN.Edward',
                isPlayer: false,
                spellId: 'vengeance',
                emblemId: 'fighter'
            }
        ],
        red: [
            {
                heroId: 'kalea',
                lane: 'Roam',
                name: 'ABYSS.Baloyskie',
                isPlayer: false,
                spellId: 'flicker',
                emblemId: 'support'
            },
            {
                heroId: 'joy',
                lane: 'Jungle',
                name: 'ABYSS.Sutsujin',
                isPlayer: false,
                spellId: 'retribution',
                emblemId: 'assassin'
            },
            {
                heroId: 'zetian',
                lane: 'Mid',
                name: 'ABYSS.Rinz',
                isPlayer: false,
                spellId: 'flicker',
                emblemId: 'mage'
            },
            {
                heroId: 'miya',
                lane: 'Gold',
                name: 'ABYSS.Kelra',
                isPlayer: false,
                spellId: 'inspire',
                emblemId: 'marksman'
            },
            {
                heroId: 'argus',
                lane: 'EXP',
                name: 'ABYSS.Dyrennn',
                isPlayer: false,
                spellId: 'inspire',
                emblemId: 'fighter'
            }
        ]
    }
];
function buildSpectatorConfig(profile, matchupIdx) {
    var matchup = FEATURED_MATCHUPS[matchupIdx % FEATURED_MATCHUPS.length];
    var variant = _mapData.PRIMARY_2026_VARIANTS[matchupIdx % _mapData.PRIMARY_2026_VARIANTS.length];
    return {
        mode: 'ranked',
        isSpectator: true,
        playerHeroId: matchup.blue[0].heroId,
        playerSkinId: 'default',
        playerLane: matchup.blue[0].lane,
        playerSpellId: matchup.blue[0].spellId,
        playerEmblemId: matchup.blue[0].emblemId,
        playerTalents: profile.emblemTalents[matchup.blue[0].emblemId],
        playerBuild: [
            'tough_boots',
            'dominance_ice',
            'athenas_shield',
            'antique_cuirass',
            'immortality'
        ],
        mapTheme: profile.settings.basics.mapTheme,
        mapVariant: variant,
        blueTeam: matchup.blue,
        redTeam: matchup.red
    };
}
var LiveStreamOverlay = function LiveStreamOverlay(param) {
    var profile = param.profile, onExit = param.onExit;
    var _ref, _ref1, _ref2;
    var canvasRef = (0, _react.useRef)(null);
    var threeHostRef = (0, _react.useRef)(null);
    var minimapRef = (0, _react.useRef)(null);
    var engineRef = (0, _react.useRef)(null);
    var _useState = (0, _react.useState)(0), matchupIdx = _useState[0], setMatchupIdx = _useState[1];
    var matchup = FEATURED_MATCHUPS[matchupIdx % FEATURED_MATCHUPS.length];
    var config = (0, _react.useMemo)(function() {
        return buildSpectatorConfig(profile, matchupIdx);
    }, [
        profile,
        matchupIdx
    ]);
    var _useState1 = (0, _react.useState)(null), snap = _useState1[0], setSnap = _useState1[1];
    var _useState2 = (0, _react.useState)(1), speed = _useState2[0], setSpeed = _useState2[1];
    var _useState3 = (0, _react.useState)(false), paused = _useState3[0], setPaused = _useState3[1];
    var _useState4 = (0, _react.useState)(true), autoDirector = _useState4[0], setAutoDirector = _useState4[1];
    var _useState5 = (0, _react.useState)(1420), cheers = _useState5[0], setCheers = _useState5[1];
    var _useState6 = (0, _react.useState)([]), hearts = _useState6[0], setHearts = _useState6[1];
    var _useState7 = (0, _react.useState)(18420), viewers = _useState7[0], setViewers = _useState7[1];
    var draggingMini = (0, _react.useRef)(false);
    (0, _react.useEffect)(function() {
        var canvas = canvasRef.current;
        if (!canvas) return;
        setSpeed(1);
        setPaused(false);
        setAutoDirector(true);
        var engine = new _GameEngine.MlbbGameEngine(canvas, config, profile.settings, function(nextSnap) {
            return setSnap(nextSnap);
        }, function() {
        // Match finished — remain in broadcast view so viewer can switch match or exit
        });
        engineRef.current = engine;
        if (threeHostRef.current) engine.attachThreeContainer(threeHostRef.current);
        if (minimapRef.current) engine.attachMinimapCanvas(minimapRef.current);
        engine.setAutoDirector(true);
        engine.start();
        var viewerTick = setInterval(function() {
            setViewers(function(v) {
                return Math.max(9000, v + Math.floor((Math.random() - 0.45) * 90));
            });
        }, 2500);
        return function() {
            clearInterval(viewerTick);
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
    var bluePlayers = (_ref = snap == null ? void 0 : snap.scoreboard.filter(function(p) {
        return p.team === 'blue';
    })) != null ? _ref : [];
    var redPlayers = (_ref1 = snap == null ? void 0 : snap.scoreboard.filter(function(p) {
        return p.team === 'red';
    })) != null ? _ref1 : [];
    var blueGold = bluePlayers.reduce(function(s, p) {
        return s + p.gold;
    }, 0);
    var redGold = redPlayers.reduce(function(s, p) {
        return s + p.gold;
    }, 0);
    var totalGold = Math.max(1, blueGold + redGold);
    var blueGoldSharePct = Math.max(20, Math.min(80, Math.round(blueGold / totalGold * 100)));
    var goldDiff = blueGold - redGold;
    var is3D = (snap == null ? void 0 : snap.rendererMode) === '3d';
    var sendHeart = function sendHeart() {
        _AudioEngine.mlbbAudio.playClick();
        setCheers(function(c) {
            return c + 1;
        });
        var id = Date.now() + Math.random();
        var x = 15 + Math.random() * 70;
        setHearts(function(h) {
            return [].concat(h.slice(-8), [
                {
                    id: id,
                    x: x
                }
            ]);
        });
        setTimeout(function() {
            setHearts(function(h) {
                return h.filter(function(item) {
                    return item.id !== id;
                });
            });
        }, 1100);
    };
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "relative w-full h-full overflow-hidden bg-[#060B18] text-slate-100 select-none",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("canvas", {
                ref: canvasRef,
                className: "absolute inset-0 w-full h-full block " + (is3D ? 'opacity-0 pointer-events-none' : 'opacity-100')
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                ref: threeHostRef,
                className: "absolute inset-0 w-full h-full pointer-events-none"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "absolute top-2 left-2 right-2 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "pointer-events-auto flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClick();
                                    onExit();
                                },
                                className: "h-9 px-3 rounded-xl bg-[#0B132B]/92 border border-[#F5C451]/60 hover:border-[#F5C451] text-xs font-black text-[#F5C451] whitespace-nowrap cursor-pointer",
                                children: "← Exit Stream"
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "px-3 py-1.5 rounded-xl bg-rose-950/92 border border-rose-500/70 flex items-center gap-2 text-[11px] font-black whitespace-nowrap",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        className: "w-2 h-2 rounded-full bg-rose-500 animate-pulse"
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                        children: matchup.title
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                        className: "text-rose-200 mlbb-num",
                                        children: [
                                            "\xb7 ",
                                            viewers.toLocaleString(),
                                            " watching"
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    snap && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "pointer-events-auto px-4 py-1.5 rounded-2xl bg-[#0B132B]/94 border-2 border-[#F5C451]/60 flex flex-col gap-1 shadow-2xl",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "flex items-center gap-4 text-xs font-black",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-right",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[10px] text-sky-300",
                                                children: matchup.blueTag
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-sm text-sky-400 mlbb-num",
                                                children: [
                                                    (blueGold / 1000).toFixed(1),
                                                    "k"
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-xl text-sky-400 mlbb-num",
                                        children: snap.blueKills
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-center px-3 py-0.5 rounded-lg bg-slate-900 border border-slate-700",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-sm text-[#F5C451] mlbb-num",
                                                children: (0, _mapData.formatClock)(snap.matchTimeSec)
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[10px] mlbb-num " + (goldDiff >= 0 ? 'text-sky-300' : 'text-rose-300'),
                                                children: goldDiff >= 0 ? "+" + (goldDiff / 1000).toFixed(1) + "k" : "-" + (Math.abs(goldDiff) / 1000).toFixed(1) + "k"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-xl text-rose-400 mlbb-num",
                                        children: snap.redKills
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-left",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-[10px] text-rose-300",
                                                children: matchup.redTag
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                className: "text-sm text-rose-400 mlbb-num",
                                                children: [
                                                    (redGold / 1000).toFixed(1),
                                                    "k"
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "h-1.5 w-full rounded-full bg-rose-500/80 overflow-hidden",
                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "h-full bg-sky-400 transition-all duration-300",
                                    style: {
                                        width: "" + blueGoldSharePct + "%"
                                    }
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "pointer-events-auto flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                onClick: function onClick() {
                                    var _engineRef_current;
                                    var next = !autoDirector;
                                    setAutoDirector(next);
                                    (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setAutoDirector(next);
                                    _AudioEngine.mlbbAudio.playClick();
                                },
                                className: "h-9 px-2.5 rounded-xl border text-[11px] font-black whitespace-nowrap cursor-pointer " + (autoDirector ? 'bg-emerald-600/90 border-emerald-300 text-white' : 'bg-[#0B132B]/90 border-slate-600 text-slate-300'),
                                title: "Auto-Director tracks active teamfights & Turtle/Lord contests automatically",
                                children: [
                                    "Auto-Director: ",
                                    autoDirector ? 'ON' : 'OFF'
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    var _engineRef_current;
                                    var next = !paused;
                                    setPaused(next);
                                    (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setPaused(next);
                                    _AudioEngine.mlbbAudio.playClick();
                                },
                                className: "h-9 px-2.5 rounded-xl bg-[#0B132B]/90 border border-slate-600 hover:border-[#F5C451] text-[11px] font-black text-white whitespace-nowrap cursor-pointer",
                                children: paused ? '▶ Resume' : '⏸ Pause'
                            }),
                            [
                                1,
                                2,
                                4
                            ].map(function(sp) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    onClick: function onClick() {
                                        var _engineRef_current;
                                        setSpeed(sp);
                                        (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setTimeScale(sp);
                                        _AudioEngine.mlbbAudio.playClick();
                                    },
                                    className: "h-9 px-2.5 rounded-xl border text-[11px] font-black mlbb-num cursor-pointer " + (speed === sp ? 'bg-[#F5C451] border-amber-200 text-slate-950' : 'bg-[#0B132B]/90 border-slate-600 text-slate-200'),
                                    children: [
                                        sp,
                                        "x"
                                    ]
                                }, sp);
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClick();
                                    setMatchupIdx(function(i) {
                                        return (i + 1) % FEATURED_MATCHUPS.length;
                                    });
                                },
                                className: "h-9 px-2.5 rounded-xl bg-sky-700 hover:bg-sky-600 border border-sky-400 text-[11px] font-black text-white whitespace-nowrap cursor-pointer",
                                title: "Switch to next featured MPL / M-Series AI showdown",
                                children: "Next Match ↻"
                            })
                        ]
                    })
                ]
            }),
            snap && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "absolute left-2 top-16 z-20 flex flex-col gap-1.5 w-44",
                children: bluePlayers.map(function(p) {
                    var focused = snap.spectateTargetId === p.id;
                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        onClick: function onClick() {
                            var _engineRef_current, _engineRef_current1;
                            setAutoDirector(false);
                            (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setAutoDirector(false);
                            (_engineRef_current1 = engineRef.current) == null ? void 0 : _engineRef_current1.setSpectateTarget(p.id);
                            _AudioEngine.mlbbAudio.playClick();
                        },
                        className: "p-1.5 rounded-xl bg-[#0B132B]/92 border text-left flex items-center gap-2 cursor-pointer transition " + (focused ? 'border-[#F5C451] scale-[1.02]' : 'border-sky-500/40 hover:border-sky-300'),
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                heroId: p.heroId,
                                size: 32
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "min-w-0 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[11px] font-black text-white truncate",
                                        children: p.name
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-[10px] text-sky-300 mlbb-num",
                                        children: [
                                            "Lv.",
                                            p.level,
                                            " \xb7 ",
                                            p.kills,
                                            "/",
                                            p.deaths,
                                            "/",
                                            p.assists,
                                            " \xb7 ",
                                            (p.gold / 1000).toFixed(1),
                                            "k"
                                        ]
                                    })
                                ]
                            })
                        ]
                    }, p.id);
                })
            }),
            snap && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "absolute right-2 top-16 z-20 flex flex-col gap-1.5 w-44",
                children: redPlayers.map(function(p) {
                    var focused = snap.spectateTargetId === p.id;
                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        onClick: function onClick() {
                            var _engineRef_current, _engineRef_current1;
                            setAutoDirector(false);
                            (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setAutoDirector(false);
                            (_engineRef_current1 = engineRef.current) == null ? void 0 : _engineRef_current1.setSpectateTarget(p.id);
                            _AudioEngine.mlbbAudio.playClick();
                        },
                        className: "p-1.5 rounded-xl bg-[#0B132B]/92 border text-left flex items-center gap-2 cursor-pointer transition " + (focused ? 'border-[#F5C451] scale-[1.02]' : 'border-rose-500/40 hover:border-rose-300'),
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                heroId: p.heroId,
                                size: 32
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "min-w-0 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "text-[11px] font-black text-white truncate",
                                        children: p.name
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-[10px] text-rose-300 mlbb-num",
                                        children: [
                                            "Lv.",
                                            p.level,
                                            " \xb7 ",
                                            p.kills,
                                            "/",
                                            p.deaths,
                                            "/",
                                            p.assists,
                                            " \xb7 ",
                                            (p.gold / 1000).toFixed(1),
                                            "k"
                                        ]
                                    })
                                ]
                            })
                        ]
                    }, p.id);
                })
            }),
            (snap == null ? void 0 : snap.announcer) && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none",
                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
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
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "absolute bottom-3 left-3 z-20 rounded-xl overflow-hidden border-2 border-[#F5C451]/60 bg-[#0B132B]",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("canvas", {
                        ref: minimapRef,
                        width: 156,
                        height: 156,
                        onPointerDown: function onPointerDown(e) {
                            var _engineRef_current;
                            e.currentTarget.setPointerCapture(e.pointerId);
                            draggingMini.current = true;
                            var r = e.currentTarget.getBoundingClientRect();
                            (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setMinimapCameraFocus((e.clientX - r.left) / r.width * _mapData.WORLD_SIZE, (e.clientY - r.top) / r.height * _mapData.WORLD_SIZE);
                        },
                        onPointerMove: function onPointerMove(e) {
                            var _engineRef_current;
                            if (!draggingMini.current) return;
                            var r = e.currentTarget.getBoundingClientRect();
                            (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.setMinimapCameraFocus(Math.max(0, Math.min(_mapData.WORLD_SIZE, (e.clientX - r.left) / r.width * _mapData.WORLD_SIZE)), Math.max(0, Math.min(_mapData.WORLD_SIZE, (e.clientY - r.top) / r.height * _mapData.WORLD_SIZE)));
                        },
                        onPointerUp: function onPointerUp() {
                            var _engineRef_current;
                            draggingMini.current = false;
                            (_engineRef_current = engineRef.current) == null ? void 0 : _engineRef_current.clearMinimapCameraFocus();
                        },
                        className: "block cursor-crosshair touch-none",
                        title: "Drag minimap to pan 3D broadcast camera"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "px-2 py-0.5 bg-[#080F24] text-[10px] font-black text-amber-300 text-center",
                        children: "Drag Map to Free-Cam \xb7 Click Hero to Lock"
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "absolute bottom-3 right-3 z-20 w-72 flex flex-col items-end gap-2",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "relative w-full p-2.5 rounded-xl bg-[#0B132B]/92 border border-slate-700/80 space-y-1 text-[11px]",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                className: "text-[10px] font-black text-[#F5C451] uppercase",
                                children: "Live Broadcast Feed"
                            }),
                            ((_ref2 = snap == null ? void 0 : snap.chatFeed) != null ? _ref2 : []).slice(-3).map(function(c) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "text-slate-200 truncate",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            className: "font-bold text-amber-300",
                                            children: [
                                                c.sender,
                                                ": "
                                            ]
                                        }),
                                        c.text
                                    ]
                                }, c.id);
                            }),
                            hearts.map(function(h) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    style: {
                                        left: "" + h.x + "%"
                                    },
                                    className: "absolute -top-6 text-lg animate-bounce pointer-events-none",
                                    children: "❤️"
                                }, h.id);
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        onClick: sendHeart,
                        className: "px-4 py-2 rounded-xl bg-rose-600 bg-gradient-to-r from-rose-600 to-pink-500 border border-pink-300 text-xs font-black text-white shadow-lg cursor-pointer mlbb-num",
                        children: [
                            "❤️ Cheer Stream (",
                            cheers.toLocaleString(),
                            ")"
                        ]
                    })
                ]
            })
        ]
    });
};

});
// === MODULE: src/games/legends-arena/mlbb/components/LobbySanctuary3D ===
ArcadeMod.define("src/games/legends-arena/mlbb/components/LobbySanctuary3D", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LobbySanctuary3D", {
    enumerable: true,
    get: function() {
        return LobbySanctuary3D;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _RoomEnvironment = require("three/examples/jsm/environments/RoomEnvironment.js");
var _threeShared = require("../../../../core/threeShared");
var _viewport = require("../../../../core/viewport");
var _heroes = require("../data/heroes");
var _ThreeHeroModels = require("../engine/ThreeHeroModels");
var _HeroAvatarSvg = require("./HeroAvatarSvg");
var _AudioEngine = require("../engine/AudioEngine");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _create_for_of_iterator_helper_loose(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (it) return (it = it.call(o)).next.bind(it);
    if (Array.isArray(o) || (it = _unsupported_iterable_to_array(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        return function() {
            if (i >= o.length) return {
                done: true
            };
            return {
                done: false,
                value: o[i++]
            };
        };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var HERO_VOICE_LINES = {
    Tank: [
        '"I will shield the Land of Dawn with my life!"',
        '"Stand behind me — none shall pass!"'
    ],
    Fighter: [
        '"Every battle sharpens my blade!"',
        '"Victory favors the relentless!"'
    ],
    Assassin: [
        '"Strike from the shadows, vanish before dawn!"',
        '"One blade, one elimination!"'
    ],
    Mage: [
        '"Arcane wisdom bends the battlefield to my will!"',
        '"Witness the brilliance of true magic!"'
    ],
    Marksman: [
        '"My aim never wavers across the Land of Dawn!"',
        '"Keep your distance — or fall!"'
    ],
    Support: [
        '"Together, our light will never fade!"',
        '"Stay close, I have your back!"'
    ]
};
function disposeGroup(group) {
    group.traverse(function(obj) {
        var _m_geometry_userData;
        var m = obj;
        if (m.geometry && !((_m_geometry_userData = m.geometry.userData) == null ? void 0 : _m_geometry_userData.noDispose)) m.geometry.dispose();
        var mats = Array.isArray(m.material) ? m.material : m.material ? [
            m.material
        ] : [];
        for(var _iterator = _create_for_of_iterator_helper_loose(mats), _step; !(_step = _iterator()).done;){
            var mat = _step.value;
            var _mat_userData;
            if (!mat || ((_mat_userData = mat.userData) == null ? void 0 : _mat_userData.noDispose)) continue;
            mat.dispose();
        }
    });
}
var LobbySanctuary3D = function LobbySanctuary3D(param) {
    var heroId = param.heroId, skinId = param.skinId, ownedHeroIds = param.ownedHeroIds, onSwitchHero = param.onSwitchHero;
    var _hero_skins_find;
    var hostRef = (0, _react.useRef)(null);
    var _useState = (0, _react.useState)(false), webglFailed = _useState[0], setWebglFailed = _useState[1];
    var _useState1 = (0, _react.useState)(null), voiceLine = _useState1[0], setVoiceLine = _useState1[1];
    var _useState2 = (0, _react.useState)(false), pickerOpen = _useState2[0], setPickerOpen = _useState2[1];
    var _useState3 = (0, _react.useState)(''), search = _useState3[0], setSearch = _useState3[1];
    var targetRotYRef = (0, _react.useRef)(0.32);
    var currentRotYRef = (0, _react.useRef)(0.32);
    var targetPitchRef = (0, _react.useRef)(0.16);
    var currentPitchRef = (0, _react.useRef)(0.16);
    var poseTimerRef = (0, _react.useRef)(0);
    var dragRef = (0, _react.useRef)(null);
    // Persistent Three.js scene slots so switching heroes never destroys the WebGL context
    var sceneSlotRef = (0, _react.useRef)(null);
    var hero = (0, _heroes.getMlbbHeroById)(heroId);
    var skin = (_hero_skins_find = hero.skins.find(function(s) {
        return s.id === skinId;
    })) != null ? _hero_skins_find : hero.skins[0];
    // Mount persistent Dark Royal Navy Celestial 3D Sanctuary once
    (0, _react.useEffect)(function() {
        var host = hostRef.current;
        if (!host || webglFailed) return;
        var renderer;
        var isSoft = (0, _threeShared.detectSoftwareWebGL)();
        try {
            renderer = new _three.WebGLRenderer({
                antialias: !isSoft,
                powerPreference: 'high-performance'
            });
            renderer.outputColorSpace = _three.SRGBColorSpace;
            renderer.toneMapping = _three.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.18;
            renderer.setPixelRatio(isSoft ? 1 : Math.min(window.devicePixelRatio || 1, 2));
            renderer.shadowMap.enabled = !isSoft;
            renderer.shadowMap.type = _three.PCFSoftShadowMap;
            renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
        } catch (unused) {
            setWebglFailed(true);
            return;
        }
        host.innerHTML = '';
        host.appendChild(renderer.domElement);
        var scene = new _three.Scene();
        scene.background = new _three.Color(0x070d1f);
        scene.fog = new _three.FogExp2(0x0b132b, 0.017);
        // Safe isolated PMREM studio reflection setup (never falls back to 2D if float FBO unavailable)
        var envTex = null;
        try {
            var pmrem = new _three.PMREMGenerator(renderer);
            var roomEnv = new _RoomEnvironment.RoomEnvironment();
            envTex = pmrem.fromScene(roomEnv, 0.04).texture;
            roomEnv.dispose();
            pmrem.dispose();
            scene.environment = envTex;
        } catch (unused) {
            envTex = null;
        }
        var camera = new _three.PerspectiveCamera(42, 16 / 9, 0.2, 220);
        camera.position.set(0, 3.4, 8.2);
        camera.lookAt(0, 1.9, 0);
        // Dark Royal Navy Celestial Sky Dome (#050A18 -> #0B132B -> #1B3B6F with subtle golden horizon glow)
        var skyGeo = new _three.SphereGeometry(140, 24, 16);
        var skyMat = new _three.ShaderMaterial({
            side: _three.BackSide,
            depthWrite: false,
            uniforms: {
                uTop: {
                    value: new _three.Color(0x050a18)
                },
                uMid: {
                    value: new _three.Color(0x0b132b)
                },
                uHorizon: {
                    value: new _three.Color(0x1b3b6f)
                },
                uGlow: {
                    value: new _three.Color(0x524022)
                }
            },
            vertexShader: "\n        varying vec3 vPos;\n        void main() {\n          vec4 wp = modelMatrix * vec4(position, 1.0);\n          vPos = wp.xyz;\n          gl_Position = projectionMatrix * viewMatrix * wp;\n        }\n      ",
            fragmentShader: "\n        uniform vec3 uTop;\n        uniform vec3 uMid;\n        uniform vec3 uHorizon;\n        uniform vec3 uGlow;\n        varying vec3 vPos;\n        void main() {\n          vec3 n = normalize(vPos);\n          float h = clamp(n.y, -0.25, 1.0);\n          vec3 col = h < 0.14\n            ? mix(uHorizon, uMid, smoothstep(-0.12, 0.14, h))\n            : mix(uMid, uTop, smoothstep(0.14, 0.72, h));\n          float horizonBand = exp(-abs(h - 0.02) * 9.0) * smoothstep(-0.4, 0.6, -n.z);\n          col += uGlow * horizonBand * 0.55;\n          gl_FragColor = vec4(col, 1.0);\n        }\n      "
        });
        scene.add(new _three.Mesh(skyGeo, skyMat));
        // Dramatic 3-Point Celestial Studio Lighting (Warm Gold Key + Celestial Azure Fill + Hero Accent Rim)
        var hemi = new _three.HemisphereLight(0x7dd3fc, 0x0b132b, 0.95);
        var key = new _three.DirectionalLight(0xffe7aa, 2.35);
        key.position.set(7.5, 13.5, 8.5);
        if (!isSoft) {
            key.castShadow = true;
            key.shadow.mapSize.set(1024, 1024);
            var d = 10;
            key.shadow.camera.left = -d;
            key.shadow.camera.right = d;
            key.shadow.camera.top = d;
            key.shadow.camera.bottom = -d;
            key.shadow.bias = -0.0005;
            key.shadow.normalBias = 0.02;
        }
        var cyanFill = new _three.DirectionalLight(0x38bdf8, 0.95);
        cyanFill.position.set(-9, 6, 4);
        var accentLight = new _three.PointLight(0xe6b84c, 4.2, 20);
        accentLight.position.set(-3.6, 4.2, -3.4);
        scene.add(hemi, key, cyanFill, accentLight);
        // Multi-Tiered Obsidian-Navy & Luminous Metallic Gold Runic Pedestal
        var obsidianMat = new _three.MeshStandardMaterial({
            color: 0x0f1b38,
            roughness: 0.36,
            metalness: 0.45
        });
        var darkStoneMat = new _three.MeshStandardMaterial({
            color: 0x16264b,
            roughness: 0.55,
            metalness: 0.32
        });
        var goldMat = new _three.MeshStandardMaterial({
            color: 0xe6b84c,
            emissive: 0x9a6412,
            emissiveIntensity: 0.38,
            roughness: 0.22,
            metalness: 0.9
        });
        var terrace = new _three.Mesh(new _three.CylinderGeometry(8.6, 9.8, 1.2, 24), obsidianMat);
        terrace.position.y = -1.2;
        terrace.receiveShadow = true;
        var plinthLow = new _three.Mesh(new _three.CylinderGeometry(3.35, 3.85, 0.42, 24), darkStoneMat);
        plinthLow.position.y = -0.42;
        plinthLow.receiveShadow = true;
        var plinthTop = new _three.Mesh(new _three.CylinderGeometry(2.45, 2.78, 0.26, 24), obsidianMat);
        plinthTop.position.y = -0.11;
        plinthTop.receiveShadow = true;
        var goldRim = new _three.Mesh(new _three.TorusGeometry(2.52, 0.085, 10, 44), goldMat);
        goldRim.rotation.x = Math.PI / 2;
        goldRim.position.y = 0.02;
        var lowerGoldRim = new _three.Mesh(new _three.TorusGeometry(3.42, 0.055, 8, 44), goldMat);
        lowerGoldRim.rotation.x = Math.PI / 2;
        lowerGoldRim.position.y = -0.22;
        var runeMat = new _three.MeshBasicMaterial({
            color: 0x38bdf8,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.78,
            depthWrite: false
        });
        var outerRuneRing = new _three.Mesh(new _three.RingGeometry(2.96, 3.24, 48), runeMat);
        outerRuneRing.rotation.x = -Math.PI / 2;
        outerRuneRing.position.y = -0.17;
        var innerRuneMat = new _three.MeshBasicMaterial({
            color: 0xffe28a,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.52,
            depthWrite: false
        });
        var innerRuneRing = new _three.Mesh(new _three.RingGeometry(1.72, 1.88, 36), innerRuneMat);
        innerRuneRing.rotation.x = -Math.PI / 2;
        innerRuneRing.position.y = 0.035;
        // 3D Tap-to-Pose Expanding Golden-Cyan Shockwave Ring
        var shockMat = new _three.MeshBasicMaterial({
            color: 0xffe28a,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0,
            depthWrite: false
        });
        var shockRing = new _three.Mesh(new _three.RingGeometry(1.1, 1.48, 36), shockMat);
        shockRing.rotation.x = -Math.PI / 2;
        shockRing.position.y = 0.14;
        shockRing.visible = false;
        scene.add(terrace, plinthLow, plinthTop, goldRim, lowerGoldRim, outerRuneRing, innerRuneRing, shockRing);
        // Drifting Volumetric Golden-Azure Sunbeams / Celestial Light Shafts
        var beamGroup = new _three.Group();
        var beamConfigs = [
            {
                x: -4.2,
                z: -8.5,
                rotZ: -0.24,
                color: 0xffe28a,
                op: 0.085,
                w: 3.4
            },
            {
                x: 0.6,
                z: -9.5,
                rotZ: -0.14,
                color: 0x38bdf8,
                op: 0.075,
                w: 4.2
            },
            {
                x: 5.1,
                z: -8.2,
                rotZ: -0.2,
                color: 0xe6b84c,
                op: 0.08,
                w: 3.1
            }
        ];
        for(var _iterator = _create_for_of_iterator_helper_loose(beamConfigs), _step; !(_step = _iterator()).done;){
            var b = _step.value;
            var mat = new _three.MeshBasicMaterial({
                color: b.color,
                transparent: true,
                opacity: b.op,
                side: _three.DoubleSide,
                depthWrite: false,
                blending: _three.AdditiveBlending
            });
            var beam = new _three.Mesh(new _three.PlaneGeometry(b.w, 22), mat);
            beam.position.set(b.x, 7.2, b.z);
            beam.rotation.z = b.rotZ;
            beamGroup.add(beam);
        }
        scene.add(beamGroup);
        // Floating Carved Dark-Obsidian & Gold Monoliths + Hovering Celestial Crystals
        var crystalMat = new _three.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0ea5e9,
            emissiveIntensity: 1.15,
            roughness: 0.15,
            metalness: 0.65
        });
        var floatingMonoliths = [];
        var crystalCaps = [];
        for(var i = 0; i < 6; i++){
            var ang = -Math.PI * 0.86 + i / 5 * Math.PI * 0.72;
            var distR = 9.4 + i % 2 * 2.1;
            var px = Math.cos(ang) * distR;
            var pz = Math.sin(ang) * distR - 2.4;
            var h = 4.4 + i % 3 * 1.15;
            var mGroup = new _three.Group();
            var baseY = 0.6 + i % 2 * 0.55;
            mGroup.position.set(px, baseY, pz);
            var shaft = new _three.Mesh(new _three.CylinderGeometry(0.46, 0.62, h, 6), darkStoneMat);
            shaft.position.y = h * 0.5;
            shaft.castShadow = true;
            var capGold = new _three.Mesh(new _three.CylinderGeometry(0.66, 0.54, 0.28, 6), goldMat);
            capGold.position.y = h + 0.1;
            var runeBand = new _three.Mesh(new _three.TorusGeometry(0.58, 0.04, 8, 24), new _three.MeshBasicMaterial({
                color: i % 2 === 0 ? 0x38bdf8 : 0xffe28a
            }));
            runeBand.rotation.x = Math.PI / 2;
            runeBand.position.y = h * 0.62;
            var gem = new _three.Mesh(new _three.OctahedronGeometry(0.44, 0), crystalMat);
            gem.position.y = h + 1.15;
            crystalCaps.push(gem);
            mGroup.add(shaft, capGold, runeBand, gem);
            scene.add(mGroup);
            floatingMonoliths.push({
                group: mGroup,
                baseY: baseY,
                phase: i * 1.05
            });
        }
        // Distant Celestial Sanctuary Peaks & Animated Dark-Azure Nebula Clouds
        var peakMat = new _three.MeshStandardMaterial({
            color: 0x0f1d3d,
            roughness: 0.9,
            metalness: 0.12
        });
        for(var i1 = 0; i1 < 10; i1++){
            var ang1 = i1 / 10 * Math.PI * 2;
            var r = 44 + i1 % 3 * 12;
            var h1 = 15 + i1 % 4 * 5;
            var peak = new _three.Mesh(new _three.ConeGeometry(9 + i1 % 3 * 3, h1, 6), peakMat);
            peak.position.set(Math.cos(ang1) * r, h1 * 0.25 - 6, Math.sin(ang1) * r - 12);
            scene.add(peak);
        }
        var cloudMat = new _three.MeshBasicMaterial({
            color: 0x1b3b6f,
            transparent: true,
            opacity: 0.34
        });
        var cloudGroup = new _three.Group();
        for(var i2 = 0; i2 < 14; i2++){
            var c = new _three.Mesh(new _three.DodecahedronGeometry(2.8 + i2 % 3 * 1.15, 1), cloudMat);
            c.scale.set(2.6, 0.52, 1.2);
            c.position.set((i2 - 7) * 7.8, 8.8 + i2 % 4 * 2.1, -26 - i2 % 5 * 7);
            cloudGroup.add(c);
        }
        scene.add(cloudGroup);
        // Rising Luminous Golden Embers + Starfield Dust
        var emberCount = 96;
        var pos = new Float32Array(emberCount * 3);
        for(var i3 = 0; i3 < emberCount; i3++){
            pos[i3 * 3] = (Math.random() - 0.5) * 18;
            pos[i3 * 3 + 1] = Math.random() * 9 - 0.5;
            pos[i3 * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
        }
        var emberGeo = new _three.BufferGeometry();
        emberGeo.setAttribute('position', new _three.BufferAttribute(pos, 3));
        var emberMat = new _three.PointsMaterial({
            color: 0xffe28a,
            size: 0.16,
            transparent: true,
            opacity: 0.9,
            blending: _three.AdditiveBlending,
            depthWrite: false
        });
        var embers = new _three.Points(emberGeo, emberMat);
        scene.add(embers);
        var starCount = 120;
        var starPos = new Float32Array(starCount * 3);
        for(var i4 = 0; i4 < starCount; i4++){
            var theta = Math.random() * Math.PI * 2;
            var phi = Math.random() * Math.PI * 0.45;
            var rad = 75 + Math.random() * 25;
            starPos[i4 * 3] = Math.sin(phi) * Math.cos(theta) * rad;
            starPos[i4 * 3 + 1] = Math.cos(phi) * rad * 0.65 + 4;
            starPos[i4 * 3 + 2] = Math.sin(phi) * Math.sin(theta) * rad;
        }
        var starGeo = new _three.BufferGeometry();
        starGeo.setAttribute('position', new _three.BufferAttribute(starPos, 3));
        var starMat = new _three.PointsMaterial({
            color: 0xbae6fd,
            size: 0.42,
            transparent: true,
            opacity: 0.65,
            depthWrite: false
        });
        scene.add(new _three.Points(starGeo, starMat));
        var heroAnchor = new _three.Group();
        scene.add(heroAnchor);
        sceneSlotRef.current = {
            heroAnchor: heroAnchor,
            heroRig: null,
            accentLight: accentLight,
            runeMat: runeMat,
            innerRuneMat: innerRuneMat,
            shockMat: shockMat
        };
        var disposed = false;
        var rafId = 0;
        var t0 = performance.now();
        var resize = function resize() {
            if (disposed) return;
            var vp = (0, _viewport.getViewportSize)();
            var w = Math.max(300, Math.floor(host.clientWidth || vp.width || window.innerWidth));
            var h = Math.max(200, Math.floor(host.clientHeight || vp.height || window.innerHeight));
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
        };
        resize();
        var ro = null;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(resize);
            ro.observe(host);
        }
        var unsubViewport = (0, _viewport.subscribeViewport)(resize);
        window.addEventListener('resize', resize);
        var onLost = function onLost(e) {
            e.preventDefault();
            setWebglFailed(true);
        };
        renderer.domElement.addEventListener('webglcontextlost', onLost);
        var animate = function animate1(now) {
            var _sceneSlotRef_current;
            if (disposed) return;
            var dt = Math.min(0.05, Math.max(0.001, (now - t0) / 1000));
            t0 = now;
            var sec = now * 0.001;
            if (!dragRef.current) {
                targetRotYRef.current += dt * 0.24;
            }
            currentRotYRef.current = _three.MathUtils.damp(currentRotYRef.current, targetRotYRef.current, 10, dt);
            currentPitchRef.current = _three.MathUtils.damp(currentPitchRef.current, targetPitchRef.current, 10, dt);
            var camDist = 8.1;
            var camY = 2.0 + Math.sin(currentPitchRef.current) * 4.6 + 1.05;
            var camZ = Math.cos(currentPitchRef.current) * camDist;
            camera.position.set(0, camY, camZ);
            camera.lookAt(0, 1.9, 0);
            var rig = (_sceneSlotRef_current = sceneSlotRef.current) == null ? void 0 : _sceneSlotRef_current.heroRig;
            if (rig) {
                var liftY = 0;
                if (poseTimerRef.current > 0) {
                    poseTimerRef.current = Math.max(0, poseTimerRef.current - dt);
                    var p = 1 - poseTimerRef.current / 0.9;
                    var arc = Math.sin(p * Math.PI);
                    liftY = arc * 0.72;
                    rig.weaponPivot.rotation.x = -arc * 1.55;
                    rig.leftArm.rotation.x = arc * 0.55;
                    rig.capePivot.rotation.x = 0.2 + arc * 0.5;
                    shockRing.visible = true;
                    shockRing.scale.setScalar(0.85 + p * 2.5);
                    shockMat.opacity = (1 - p) * 0.94;
                } else {
                    rig.weaponPivot.rotation.x = Math.sin(sec * 2.1) * 0.1;
                    rig.leftArm.rotation.x = -Math.sin(sec * 2.1) * 0.08;
                    rig.capePivot.rotation.x = 0.14 + Math.sin(sec * 3.1) * 0.07;
                    shockRing.visible = false;
                }
                rig.group.position.y = liftY + Math.sin(sec * 2.2) * 0.04;
                rig.bodyGroup.rotation.y = currentRotYRef.current;
                rig.headGroup.rotation.y = Math.sin(sec * 1.1) * 0.12;
            }
            outerRuneRing.rotation.z = sec * 0.42;
            innerRuneRing.rotation.z = -sec * 0.65;
            beamGroup.position.x = Math.sin(sec * 0.28) * 1.15;
            for(var i = 0; i < floatingMonoliths.length; i++){
                var m = floatingMonoliths[i];
                m.group.position.y = m.baseY + Math.sin(sec * 0.9 + m.phase) * 0.34;
                crystalCaps[i].rotation.y = sec * 1.35 + i;
            }
            cloudGroup.position.x = Math.sin(sec * 0.07) * 5.2;
            var arr = emberGeo.attributes.position.array;
            for(var i1 = 0; i1 < emberCount; i1++){
                arr[i1 * 3 + 1] += dt * 0.58;
                arr[i1 * 3] += Math.sin(sec + i1) * dt * 0.12;
                if (arr[i1 * 3 + 1] > 8.5) arr[i1 * 3 + 1] = -0.4;
            }
            emberGeo.attributes.position.needsUpdate = true;
            renderer.render(scene, camera);
            rafId = requestAnimationFrame(animate);
        };
        rafId = requestAnimationFrame(animate);
        return function() {
            disposed = true;
            cancelAnimationFrame(rafId);
            ro == null ? void 0 : ro.disconnect();
            unsubViewport();
            window.removeEventListener('resize', resize);
            renderer.domElement.removeEventListener('webglcontextlost', onLost);
            sceneSlotRef.current = null;
            disposeGroup(scene);
            envTex == null ? void 0 : envTex.dispose();
            renderer.dispose();
            host.innerHTML = '';
        };
    }, [
        webglFailed
    ]);
    // Swap only the 3D champion rig when hero or skin changes (zero WebGL context tear-down)
    (0, _react.useEffect)(function() {
        var slot = sceneSlotRef.current;
        if (!slot || webglFailed) return;
        if (slot.heroRig) {
            slot.heroAnchor.remove(slot.heroRig.group);
            disposeGroup(slot.heroRig.group);
            slot.heroRig = null;
        }
        var nextRig = (0, _ThreeHeroModels.buildMlbbHeroRig3D)(hero.role, skin.color, skin.accent, 'blue', true, 1.68);
        nextRig.baseRing.visible = false;
        slot.heroAnchor.add(nextRig.group);
        slot.heroRig = nextRig;
        var accentInt = (0, _ThreeHeroModels.hexToInt)(skin.accent, 0xe6b84c);
        slot.accentLight.color.setHex(accentInt);
        slot.runeMat.color.setHex(accentInt);
        slot.shockMat.color.setHex(accentInt);
    }, [
        hero.id,
        hero.role,
        skin.color,
        skin.accent,
        webglFailed
    ]);
    var triggerHeroPose = function triggerHeroPose() {
        var _HERO_VOICE_LINES_hero_role;
        poseTimerRef.current = 0.9;
        _AudioEngine.mlbbAudio.playSkill(2, 'magic');
        var pool = (_HERO_VOICE_LINES_hero_role = HERO_VOICE_LINES[hero.role]) != null ? _HERO_VOICE_LINES_hero_role : HERO_VOICE_LINES.Fighter;
        var quote = pool[Math.floor(Math.random() * pool.length)];
        setVoiceLine(hero.name + ": " + quote);
        window.setTimeout(function() {
            return setVoiceLine(null);
        }, 2800);
    };
    var candidateHeroes = _heroes.MLBB_ALL_HEROES.filter(function(h) {
        var q = search.trim().toLowerCase();
        if (!q) return ownedHeroIds.includes(h.id) || h.starter;
        return h.name.toLowerCase().includes(q) || h.role.toLowerCase().includes(q);
    }).slice(0, 36);
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "relative w-full h-full",
        children: [
            webglFailed ? /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.LobbySanctuaryCanvas, {
                heroId: heroId,
                skinId: skinId
            }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                ref: hostRef,
                onPointerDown: function onPointerDown(e) {
                    _AudioEngine.mlbbAudio.startLobbyBgm();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    dragRef.current = {
                        startX: e.clientX,
                        startY: e.clientY,
                        lastX: e.clientX,
                        lastY: e.clientY,
                        moved: false
                    };
                },
                onPointerMove: function onPointerMove(e) {
                    var d = dragRef.current;
                    if (!d) return;
                    var dx = e.clientX - d.lastX;
                    var dy = e.clientY - d.lastY;
                    if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6) d.moved = true;
                    d.lastX = e.clientX;
                    d.lastY = e.clientY;
                    targetRotYRef.current += dx * 0.015;
                    targetPitchRef.current = Math.max(-0.08, Math.min(0.46, targetPitchRef.current + dy * 0.004));
                },
                onPointerUp: function onPointerUp() {
                    var d = dragRef.current;
                    dragRef.current = null;
                    if (d && !d.moved) triggerHeroPose();
                },
                onPointerCancel: function onPointerCancel() {
                    dragRef.current = null;
                },
                className: "absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing",
                title: "Drag 360\xb0 to rotate 3D Hero \xb7 Tap for combat pose & voice line"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "pointer-events-none absolute inset-x-0 bottom-[136px] sm:bottom-[144px] lg:bottom-24 z-10 flex flex-col items-center gap-1.5 px-4",
                children: [
                    voiceLine && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "px-4 py-1.5 rounded-xl bg-[#0B132B]/94 border border-[#FFE28A] text-xs font-bold text-amber-100 shadow-2xl max-w-md text-center",
                        children: [
                            "\uD83D\uDCAC ",
                            voiceLine
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl mlbb-panel-gold shadow-lg",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                className: "text-left",
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-xs font-black tracking-wide text-white uppercase whitespace-nowrap",
                                        children: [
                                            hero.name,
                                            " ",
                                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                className: "text-[#FFE28A]",
                                                children: [
                                                    "\xb7 ",
                                                    skin.name
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "text-[10px] font-semibold text-sky-200/85 whitespace-nowrap",
                                        children: [
                                            hero.role,
                                            " \xb7 ",
                                            hero.lane,
                                            " Lane \xb7 Drag 360\xb0 or Tap Hero"
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                onClick: function onClick() {
                                    _AudioEngine.mlbbAudio.playClick();
                                    setPickerOpen(function(v) {
                                        return !v;
                                    });
                                },
                                className: "px-2.5 py-1 rounded-lg bg-[#E6B84C] bg-gradient-to-r from-[#FFE28A] to-[#E6B84C] hover:brightness-110 text-slate-950 text-[10px] font-black cursor-pointer whitespace-nowrap",
                                title: "Switch Lobby Showcase Hero",
                                children: "\uD83D\uDD04 Switch Hero"
                            })
                        ]
                    })
                ]
            }),
            pickerOpen && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "absolute inset-x-0 bottom-[196px] lg:bottom-40 z-30 flex justify-center px-4",
                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "w-full max-w-lg rounded-2xl bg-[#0B132B]/96 border-2 border-[#E6B84C]/75 p-3 shadow-2xl",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex items-center justify-between gap-2 mb-2",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                    className: "text-xs font-black text-[#FFE28A] uppercase",
                                    children: "Switch Showcase Hero"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                    value: search,
                                    onChange: function onChange(e) {
                                        return setSearch(e.target.value);
                                    },
                                    placeholder: "Search all " + _heroes.MLBB_ALL_HEROES.length + " heroes...",
                                    className: "flex-1 max-w-[200px] px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    onClick: function onClick() {
                                        return setPickerOpen(false);
                                    },
                                    className: "w-7 h-7 rounded bg-slate-800 hover:bg-rose-600 text-xs font-black text-white cursor-pointer",
                                    children: "✕"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                            className: "grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto pr-1",
                            children: candidateHeroes.map(function(h) {
                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                    onClick: function onClick() {
                                        _AudioEngine.mlbbAudio.playClick();
                                        onSwitchHero(h.id);
                                        setPickerOpen(false);
                                    },
                                    className: "p-1.5 rounded-xl border flex flex-col items-center gap-0.5 cursor-pointer " + (h.id === heroId ? 'bg-amber-500/25 border-[#FFE28A]' : 'bg-slate-900/90 border-slate-700 hover:border-slate-500'),
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                            heroId: h.id,
                                            size: 32
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "text-[10px] font-black text-white truncate max-w-full",
                                            children: h.name
                                        })
                                    ]
                                }, h.id);
                            })
                        })
                    ]
                })
            })
        ]
    });
};

});

})(window.ArcadeMod);
