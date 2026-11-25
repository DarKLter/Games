(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/part7/ShotChartCanvas ===
ArcadeMod.define("src/games/hoops-2k26/part7/ShotChartCanvas", function(require, module, exports) {
// ============================================================================
// PART 7 — INTERACTIVE HALF-COURT SHOT CHART SPRAY GRAPH (PROFILE & POST-MATCH)
// - Plots shots in real regulation half-court feet (x: -25..25 ft, y: 0..42 ft)
//   with Green Circle = Green Make, Gold Circle = Regular Make, Red X = Miss
// - Filter tabs: ALL · MAKES ONLY · 3PT ONLY · GREENS ONLY
// - Interactive 9-zone FG% breakdown with hover/tap tooltips
// ============================================================================
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
    get ShotChartCanvas () {
        return ShotChartCanvas;
    },
    get classifyShotZone () {
        return classifyShotZone;
    },
    get computeShotChartZoneStats () {
        return computeShotChartZoneStats;
    },
    get filterShotEntries () {
        return filterShotEntries;
    },
    get normalizeShotFeet () {
        return normalizeShotFeet;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
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
function normalizeShotFeet(shot) {
    // Support both regulation feet (-25..25, 0..42) and normalized [-1..1, 0..1]
    var isNormalized = Math.abs(shot.x) <= 1.05 && shot.y >= 0 && shot.y <= 1.05;
    var xFt = isNormalized ? shot.x * 24 : Math.max(-25, Math.min(25, shot.x));
    var yFt = isNormalized ? shot.y * 40 : Math.max(0, Math.min(42, shot.y));
    return {
        xFt: xFt,
        yFt: yFt
    };
}
function classifyShotZone(shot) {
    var _normalizeShotFeet = normalizeShotFeet(shot), xFt = _normalizeShotFeet.xFt, yFt = _normalizeShotFeet.yFt;
    var absX = Math.abs(xFt);
    if (shot.isThree) {
        if (yFt <= 11.5) return xFt < 0 ? 'LEFT_CORNER_3' : 'RIGHT_CORNER_3';
        if (absX >= 9.5) return xFt < 0 ? 'LEFT_WING_3' : 'RIGHT_WING_3';
        return 'TOP_KEY_3';
    }
    if (yFt <= 7.5 && absX <= 6.5) return 'RESTRICTED_PAINT';
    if (yFt <= 16.5 && absX <= 8.5) return 'IN_THE_PAINT';
    return xFt < 0 ? 'LEFT_MID' : 'RIGHT_MID';
}
var ZONE_LABELS = [
    {
        id: 'RESTRICTED_PAINT',
        label: 'Rim / RA'
    },
    {
        id: 'IN_THE_PAINT',
        label: 'Paint (Non-RA)'
    },
    {
        id: 'LEFT_MID',
        label: 'Left Mid'
    },
    {
        id: 'RIGHT_MID',
        label: 'Right Mid'
    },
    {
        id: 'LEFT_CORNER_3',
        label: 'L Corner 3'
    },
    {
        id: 'RIGHT_CORNER_3',
        label: 'R Corner 3'
    },
    {
        id: 'LEFT_WING_3',
        label: 'L Wing 3'
    },
    {
        id: 'TOP_KEY_3',
        label: 'Top Key 3'
    },
    {
        id: 'RIGHT_WING_3',
        label: 'R Wing 3'
    }
];
function filterShotEntries(shots, filter) {
    if (filter === 'ALL') return shots;
    if (filter === 'MAKES') return shots.filter(function(s) {
        return s.made;
    });
    if (filter === 'THREE_PT') return shots.filter(function(s) {
        return s.isThree;
    });
    return shots.filter(function(s) {
        return Boolean(s.isGreen) && s.made;
    });
}
function computeShotChartZoneStats(shots) {
    var map = {};
    for(var i = 0; i < ZONE_LABELS.length; i++){
        map[ZONE_LABELS[i].id] = {
            made: 0,
            att: 0
        };
    }
    for(var i1 = 0; i1 < shots.length; i1++){
        var s = shots[i1];
        var z = classifyShotZone(s);
        if (!map[z]) map[z] = {
            made: 0,
            att: 0
        };
        map[z].att += 1;
        if (s.made) map[z].made += 1;
    }
    return ZONE_LABELS.map(function(item) {
        var _map_item_id;
        var entry = (_map_item_id = map[item.id]) != null ? _map_item_id : {
            made: 0,
            att: 0
        };
        return {
            id: item.id,
            label: item.label,
            made: entry.made,
            att: entry.att,
            pct: entry.att > 0 ? Math.round(entry.made / entry.att * 100) : 0
        };
    });
}
var ShotChartCanvas = function ShotChartCanvas(param) {
    var shots = param.shots, _param_title = param.title, title = _param_title === void 0 ? 'Half-Court Shot Chart' : _param_title, _param_compact = param.compact, compact = _param_compact === void 0 ? false : _param_compact;
    var _zones_find;
    var _useState = (0, _react.useState)('ALL'), filter = _useState[0], setFilter = _useState[1];
    var _useState1 = (0, _react.useState)(null), activeZoneId = _useState1[0], setActiveZoneId = _useState1[1];
    var filteredShots = (0, _react.useMemo)(function() {
        return filterShotEntries(shots, filter);
    }, [
        shots,
        filter
    ]);
    var zones = (0, _react.useMemo)(function() {
        return computeShotChartZoneStats(shots);
    }, [
        shots
    ]);
    var totalMade = (0, _react.useMemo)(function() {
        return filteredShots.filter(function(s) {
            return s.made;
        }).length;
    }, [
        filteredShots
    ]);
    var totalAtt = filteredShots.length;
    var fgPct = totalAtt > 0 ? (totalMade / totalAtt * 100).toFixed(1) : '0.0';
    var activeZone = (_zones_find = zones.find(function(z) {
        return z.id === activeZoneId;
    })) != null ? _zones_find : null;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "p7-shotchart-wrap",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "p7-shotchart-bar",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                        className: "p7-shotchart-head",
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                className: "p7-shotchart-title",
                                children: title
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                className: "p7-num p7-muted",
                                children: [
                                    totalMade,
                                    "/",
                                    totalAtt,
                                    " FG (",
                                    fgPct,
                                    "%)"
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                        className: "p7-seg",
                        role: "tablist",
                        "aria-label": "Shot chart filters",
                        children: [
                            [
                                'ALL',
                                'All'
                            ],
                            [
                                'MAKES',
                                'Makes Only'
                            ],
                            [
                                'THREE_PT',
                                '3PT Only'
                            ],
                            [
                                'GREENS',
                                'Greens Only'
                            ]
                        ].map(function(param) {
                            var id = param[0], label = param[1];
                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                type: "button",
                                role: "tab",
                                "aria-selected": filter === id,
                                className: "p7-seg-btn " + (filter === id ? 'active' : ''),
                                onClick: function onClick() {
                                    return setFilter(id);
                                },
                                children: label
                            }, id);
                        })
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
                viewBox: "0 0 400 280",
                className: "p7-shotchart-svg",
                role: "img",
                "aria-label": "Interactive basketball half-court shot chart",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                        x: "0",
                        y: "0",
                        width: "400",
                        height: "280",
                        fill: "#141c2c"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                        x: "10",
                        y: "10",
                        width: "380",
                        height: "260",
                        fill: "#1a253a",
                        stroke: "rgba(255,255,255,0.28)",
                        strokeWidth: "2"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("rect", {
                        x: "140",
                        y: "10",
                        width: "120",
                        height: "122",
                        fill: "rgba(2, 132, 199, 0.16)",
                        stroke: "rgba(255,255,255,0.34)",
                        strokeWidth: "1.6"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                        cx: "200",
                        cy: "132",
                        r: "40",
                        fill: "none",
                        stroke: "rgba(255,255,255,0.28)",
                        strokeWidth: "1.4"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                        d: "M 168 32 A 32 32 0 0 0 232 32",
                        fill: "none",
                        stroke: "rgba(255,255,255,0.34)",
                        strokeWidth: "1.4"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("line", {
                        x1: "176",
                        y1: "22",
                        x2: "224",
                        y2: "22",
                        stroke: "#e2e8f0",
                        strokeWidth: "2.5"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                        cx: "200",
                        cy: "30",
                        r: "7",
                        fill: "none",
                        stroke: "#f97316",
                        strokeWidth: "2.2"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("line", {
                        x1: "36",
                        y1: "10",
                        x2: "36",
                        y2: "86",
                        stroke: "rgba(255,255,255,0.38)",
                        strokeWidth: "1.8"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("line", {
                        x1: "364",
                        y1: "10",
                        x2: "364",
                        y2: "86",
                        stroke: "rgba(255,255,255,0.38)",
                        strokeWidth: "1.8"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                        d: "M 36 86 A 174 174 0 0 0 364 86",
                        fill: "none",
                        stroke: "rgba(255,255,255,0.38)",
                        strokeWidth: "1.8"
                    }),
                    /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                        d: "M 160 270 A 40 40 0 0 1 240 270",
                        fill: "none",
                        stroke: "rgba(255,255,255,0.22)",
                        strokeWidth: "1.5"
                    }),
                    filteredShots.map(function(s, idx) {
                        var _normalizeShotFeet = normalizeShotFeet(s), xFt = _normalizeShotFeet.xFt, yFt = _normalizeShotFeet.yFt;
                        var cx = 200 + xFt / 25 * 184;
                        var cy = 22 + yFt / 42 * 238;
                        var zoneId = classifyShotZone(s);
                        var isHighlighted = activeZoneId === zoneId;
                        if (s.made) {
                            var color = s.isGreen ? '#22c55e' : '#fbbf24';
                            return /*#__PURE__*/ (0, _jsxruntime.jsx)("g", {
                                onMouseEnter: function onMouseEnter() {
                                    return setActiveZoneId(zoneId);
                                },
                                onClick: function onClick() {
                                    return setActiveZoneId(zoneId);
                                },
                                style: {
                                    cursor: 'pointer'
                                },
                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                                    cx: cx,
                                    cy: cy,
                                    r: isHighlighted ? 6.5 : 4.8,
                                    fill: color,
                                    fillOpacity: 0.85,
                                    stroke: "#ffffff",
                                    strokeWidth: s.isGreen ? 1.5 : 1
                                })
                            }, (s.id || s.timestamp) + "-" + idx);
                        }
                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("g", {
                            onMouseEnter: function onMouseEnter() {
                                return setActiveZoneId(zoneId);
                            },
                            onClick: function onClick() {
                                return setActiveZoneId(zoneId);
                            },
                            style: {
                                cursor: 'pointer'
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("line", {
                                    x1: cx - 4,
                                    y1: cy - 4,
                                    x2: cx + 4,
                                    y2: cy + 4,
                                    stroke: "#f87171",
                                    strokeWidth: isHighlighted ? 2.4 : 1.7
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("line", {
                                    x1: cx + 4,
                                    y1: cy - 4,
                                    x2: cx - 4,
                                    y2: cy + 4,
                                    stroke: "#f87171",
                                    strokeWidth: isHighlighted ? 2.4 : 1.7
                                })
                            ]
                        }, (s.id || s.timestamp) + "-" + idx);
                    }),
                    filteredShots.length === 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)("text", {
                        x: "200",
                        y: "188",
                        textAnchor: "middle",
                        fill: "rgba(226,232,240,0.6)",
                        fontSize: "12",
                        fontWeight: "700",
                        children: "No shots logged for this filter yet"
                    })
                ]
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                className: "p7-shotchart-legend",
                children: [
                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                style: {
                                    color: '#22c55e'
                                },
                                children: "●"
                            }),
                            " Green Make \xb7",
                            ' ',
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                style: {
                                    color: '#fbbf24'
                                },
                                children: "●"
                            }),
                            " Regular Make \xb7",
                            ' ',
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                style: {
                                    color: '#f87171'
                                },
                                children: "✕"
                            }),
                            " Miss"
                        ]
                    }),
                    activeZone ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                        className: "p7-num",
                        style: {
                            color: '#38bdf8',
                            fontWeight: 700
                        },
                        children: [
                            activeZone.label,
                            ": ",
                            activeZone.made,
                            "/",
                            activeZone.att,
                            " (",
                            activeZone.pct,
                            "%)"
                        ]
                    }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                        className: "p7-muted",
                        children: "Tap or hover any shot or zone for FG%"
                    })
                ]
            }),
            !compact && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                className: "p7-zone-grid",
                children: zones.map(function(z) {
                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                        type: "button",
                        className: "p7-zone-cell " + (activeZoneId === z.id ? 'active' : ''),
                        onClick: function onClick() {
                            return setActiveZoneId(activeZoneId === z.id ? null : z.id);
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                children: z.label
                            }),
                            /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                className: "p7-num",
                                style: {
                                    color: z.att === 0 ? '#94a3b8' : z.pct >= 50 ? '#4ade80' : z.pct >= 35 ? '#fbbf24' : '#f87171'
                                },
                                children: [
                                    z.made,
                                    "/",
                                    z.att,
                                    " (",
                                    z.pct,
                                    "%)"
                                ]
                            })
                        ]
                    }, z.id);
                })
            })
        ]
    });
};

});

})(window.ArcadeMod);
