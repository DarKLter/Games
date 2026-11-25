(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/components/HeroAvatarSvg ===
ArcadeMod.define("src/games/legends-arena/mlbb/components/HeroAvatarSvg", function(require, module, exports) {
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
    get HeroPortraitSvg () {
        return HeroPortraitSvg;
    },
    get LobbySanctuaryCanvas () {
        return LobbySanctuaryCanvas;
    },
    get RankCrestSvg () {
        return RankCrestSvg;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _heroes = require("../data/heroes");
var _emblems = require("../data/emblems");
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
var HeroPortraitSvg = function HeroPortraitSvg(param) {
    var heroId = param.heroId, _param_size = param.size, size = _param_size === void 0 ? 48 : _param_size, skinColor = param.skinColor, skinAccent = param.skinAccent, _param_className = param.className, className = _param_className === void 0 ? '' : _param_className;
    var hero = (0, _heroes.getMlbbHeroById)(heroId);
    var c1 = skinColor != null ? skinColor : hero.primaryColor;
    var c2 = skinAccent != null ? skinAccent : hero.accentColor;
    var gradId = "hg_" + hero.id + "_" + size;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
        width: size,
        height: size,
        viewBox: "0 0 80 80",
        className: className,
        "aria-label": hero.name,
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("defs", {
                children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("linearGradient", {
                    id: gradId,
                    x1: "0",
                    y1: "0",
                    x2: "1",
                    y2: "1",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                            offset: "0%",
                            stopColor: c1
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("stop", {
                            offset: "100%",
                            stopColor: "#0B132B"
                        })
                    ]
                })
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                cx: "40",
                cy: "40",
                r: "38",
                fill: "url(#" + gradId + ")",
                stroke: "#F5C451",
                strokeWidth: "3"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                cx: "40",
                cy: "40",
                r: "32",
                fill: "none",
                stroke: c2,
                strokeOpacity: "0.45",
                strokeWidth: "1.5"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                d: "M18 68 C20 50 30 46 40 46 C50 46 60 50 62 68 Z",
                fill: c1,
                stroke: c2,
                strokeWidth: "2"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("circle", {
                cx: "40",
                cy: "31",
                r: "13",
                fill: "#1E293B",
                stroke: c2,
                strokeWidth: "2"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("path", {
                d: "M28 28 L40 16 L52 28",
                fill: "none",
                stroke: "#F5C451",
                strokeWidth: "2.5",
                strokeLinecap: "round"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("text", {
                x: "40",
                y: "36",
                textAnchor: "middle",
                fontSize: "16",
                fontWeight: "bold",
                fill: "#FFFFFF",
                children: hero.weaponIcon
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("text", {
                x: "40",
                y: "65",
                textAnchor: "middle",
                fontSize: "9",
                fontWeight: "800",
                fill: "#F8FAFC",
                letterSpacing: "0.5",
                children: hero.name.toUpperCase()
            })
        ]
    });
};
var RankCrestSvg = function RankCrestSvg(param) {
    var tierIdx = param.tierIdx, _param_size = param.size, size = _param_size === void 0 ? 34 : _param_size;
    var tier = _emblems.MLBB_RANK_TIERS[Math.max(0, Math.min(_emblems.MLBB_RANK_TIERS.length - 1, tierIdx))];
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("svg", {
        width: size,
        height: size,
        viewBox: "0 0 64 64",
        "aria-label": tier.name,
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)("polygon", {
                points: "32,4 58,18 52,50 32,60 12,50 6,18",
                fill: "#0F172A",
                stroke: tier.color,
                strokeWidth: "4"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("polygon", {
                points: "32,12 49,22 45,45 32,52 19,45 15,22",
                fill: tier.color,
                fillOpacity: "0.24",
                stroke: "#F5C451",
                strokeWidth: "1.5"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)("text", {
                x: "32",
                y: "39",
                textAnchor: "middle",
                fontSize: "22",
                children: tier.icon
            })
        ]
    });
};
var LobbySanctuaryCanvas = function LobbySanctuaryCanvas(param) {
    var heroId = param.heroId, skinId = param.skinId;
    var canvasRef = (0, _react.useRef)(null);
    var rotRef = (0, _react.useRef)(0);
    var dragRef = (0, _react.useRef)({
        active: false,
        lastX: 0
    });
    (0, _react.useEffect)(function() {
        var _hero_skins_find, _ref, _ref1;
        var canvas = canvasRef.current;
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;
        var hero = (0, _heroes.getMlbbHeroById)(heroId);
        var skin = (_hero_skins_find = hero.skins.find(function(s) {
            return s.id === skinId;
        })) != null ? _hero_skins_find : hero.skins[0];
        var primary = (_ref = skin == null ? void 0 : skin.color) != null ? _ref : hero.primaryColor;
        var accent = (_ref1 = skin == null ? void 0 : skin.accent) != null ? _ref1 : hero.accentColor;
        var embers = Array.from({
            length: 44
        }, function() {
            return {
                x: Math.random(),
                y: Math.random(),
                r: 1.5 + Math.random() * 2.5,
                vy: 0.015 + Math.random() * 0.04,
                phase: Math.random() * Math.PI * 2
            };
        });
        var raf = 0;
        var t = 0;
        var draw = function draw1() {
            var _ref;
            var _canvas_parentElement, _canvas_parentElement1;
            t += 0.016;
            if (!dragRef.current.active) {
                rotRef.current += 0.005;
            }
            var dpr = Math.min(2, window.devicePixelRatio || 1);
            var cssW = canvas.clientWidth || ((_canvas_parentElement = canvas.parentElement) == null ? void 0 : _canvas_parentElement.clientWidth) || canvas.getBoundingClientRect().width;
            var cssH = canvas.clientHeight || ((_canvas_parentElement1 = canvas.parentElement) == null ? void 0 : _canvas_parentElement1.clientHeight) || canvas.getBoundingClientRect().height;
            var w = Math.max(320, Math.floor(cssW * dpr));
            var h = Math.max(200, Math.floor(cssH * dpr));
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }
            // Midnight Sapphire Sanctuary Backdrop
            var bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.42, 30, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
            bgGrad.addColorStop(0, '#1B2D5C');
            bgGrad.addColorStop(0.5, '#0D1733');
            bgGrad.addColorStop(1, '#060B18');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);
            // Subtle architectural arcane rays
            ctx.save();
            ctx.translate(w * 0.5, h * 0.34);
            for(var i = 0; i < 8; i++){
                var a = i / 8 * Math.PI * 2 + t * 0.05;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(a) * w * 0.65, Math.sin(a) * h * 0.65);
                ctx.strokeStyle = 'rgba(245,196,81,0.05)';
                ctx.lineWidth = 24 * dpr;
                ctx.stroke();
            }
            ctx.restore();
            var cx = w * 0.5;
            var pedY = h * 0.69;
            var pedRx = Math.min(w, h) * 0.27;
            var pedRy = pedRx * 0.28;
            // Pedestal Ambient Aura
            var glow = ctx.createRadialGradient(cx, pedY - 30 * dpr, 10, cx, pedY, pedRx * 1.45);
            glow.addColorStop(0, primary + '55');
            glow.addColorStop(0.55, accent + '22');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, w, h);
            // Rotating Arcane Rune Pedestal
            ctx.save();
            ctx.translate(cx, pedY);
            ctx.scale(1, pedRy / pedRx);
            ctx.rotate(rotRef.current);
            ctx.beginPath();
            ctx.arc(0, 0, pedRx, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(12,22,48,0.85)';
            ctx.fill();
            ctx.lineWidth = 4 * dpr;
            ctx.strokeStyle = '#F5C451';
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, pedRx * 0.78, 0, Math.PI * 2);
            ctx.strokeStyle = accent;
            ctx.lineWidth = 2.5 * dpr;
            ctx.setLineDash([
                14 * dpr,
                10 * dpr
            ]);
            ctx.stroke();
            ctx.setLineDash([]);
            for(var i1 = 0; i1 < 12; i1++){
                var a1 = i1 / 12 * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a1) * pedRx * 0.78, Math.sin(a1) * pedRx * 0.78);
                ctx.lineTo(Math.cos(a1) * pedRx * 0.98, Math.sin(a1) * pedRx * 0.98);
                ctx.strokeStyle = '#F5C451';
                ctx.lineWidth = 2 * dpr;
                ctx.stroke();
            }
            ctx.restore();
            // Stylized 2.5D Hero Showcase Figure on Pedestal (breathes & rotates with drag)
            var bob = Math.sin(t * 2.1) * 7 * dpr;
            var turnX = Math.sin(rotRef.current) * 18 * dpr;
            var heroY = pedY - 125 * dpr + bob;
            // Floating Cloak / Wings
            ctx.save();
            ctx.translate(cx + turnX * 0.4, heroY + 25 * dpr);
            ctx.beginPath();
            ctx.moveTo(-66 * dpr, 85 * dpr);
            ctx.quadraticCurveTo(-82 * dpr, -10 * dpr, 0, -56 * dpr);
            ctx.quadraticCurveTo(82 * dpr, -10 * dpr, 66 * dpr, 85 * dpr);
            ctx.closePath();
            ctx.fillStyle = primary + 'BB';
            ctx.fill();
            ctx.lineWidth = 3 * dpr;
            ctx.strokeStyle = '#F5C451';
            ctx.stroke();
            // Armored Core & Pauldrons
            ctx.beginPath();
            ctx.roundRect(-42 * dpr, -28 * dpr, 84 * dpr, 92 * dpr, 24 * dpr);
            ctx.fillStyle = '#0F1B3B';
            ctx.fill();
            ctx.lineWidth = 3 * dpr;
            ctx.strokeStyle = accent;
            ctx.stroke();
            // Crest Emblem
            ctx.beginPath();
            ctx.arc(turnX * 0.35, -56 * dpr, 30 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = primary;
            ctx.fill();
            ctx.lineWidth = 3.5 * dpr;
            ctx.strokeStyle = '#F5C451';
            ctx.stroke();
            // Hero Weapon Emblem
            ctx.font = "bold " + Math.round(42 * dpr) + "px sans-serif";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(hero.weaponIcon, turnX * 0.55, 16 * dpr);
            ctx.restore();
            // Floating Golden Embers
            for(var _iterator = _create_for_of_iterator_helper_loose(embers), _step; !(_step = _iterator()).done;){
                var e = _step.value;
                e.y -= e.vy * 0.016;
                if (e.y < 0) {
                    e.y = 1;
                    e.x = Math.random();
                }
                var ex = e.x * w + Math.sin(t * 2 + e.phase) * 14 * dpr;
                var ey = e.y * h;
                ctx.beginPath();
                ctx.arc(ex, ey, e.r * dpr, 0, Math.PI * 2);
                ctx.fillStyle = e.phase > 3 ? '#F5C451AA' : accent + '99';
                ctx.fill();
            }
            // Hero Showcase Nameplate below pedestal
            ctx.save();
            ctx.textAlign = 'center';
            ctx.fillStyle = '#F5C451';
            ctx.font = "800 " + Math.round(13 * dpr) + "px sans-serif";
            ctx.fillText(hero.role.toUpperCase() + " \xb7 " + hero.lane.toUpperCase() + " LANE \xb7 " + ((_ref = skin == null ? void 0 : skin.name.toUpperCase()) != null ? _ref : 'CLASSIC'), cx, pedY + pedRy + 26 * dpr);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = "900 " + Math.round(28 * dpr) + "px sans-serif";
            ctx.fillText(hero.name.toUpperCase(), cx, pedY + pedRy + 56 * dpr);
            ctx.fillStyle = '#94A3B8';
            ctx.font = "600 " + Math.round(11 * dpr) + "px sans-serif";
            ctx.fillText('DRAG TO ROTATE HERO PEDESTAL', cx, pedY + pedRy + 76 * dpr);
            ctx.restore();
            raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);
        return function() {
            return cancelAnimationFrame(raf);
        };
    }, [
        heroId,
        skinId
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("canvas", {
        ref: canvasRef,
        className: "absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none",
        onPointerDown: function onPointerDown(e) {
            dragRef.current = {
                active: true,
                lastX: e.clientX
            };
        },
        onPointerMove: function onPointerMove(e) {
            if (!dragRef.current.active) return;
            var dx = e.clientX - dragRef.current.lastX;
            dragRef.current.lastX = e.clientX;
            rotRef.current += dx * 0.012;
        },
        onPointerUp: function onPointerUp() {
            dragRef.current.active = false;
        },
        onPointerLeave: function onPointerLeave() {
            dragRef.current.active = false;
        }
    });
};

});
// === MODULE: src/games/legends-arena/mlbb/components/HeroGalleryModal ===
ArcadeMod.define("src/games/legends-arena/mlbb/components/HeroGalleryModal", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HeroGalleryModal", {
    enumerable: true,
    get: function() {
        return HeroGalleryModal;
    }
});
var _jsxruntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
var _heroes = require("../data/heroes");
var _items = require("../data/items");
var _heroCatalogMeta = require("../data/heroCatalogMeta");
var _HeroAvatarSvg = require("./HeroAvatarSvg");
var _HeroShowcase3D = require("./HeroShowcase3D");
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
var ROLES = [
    'All',
    'Tank',
    'Fighter',
    'Assassin',
    'Mage',
    'Marksman',
    'Support'
];
var LANES = [
    'All',
    'EXP',
    'Jungle',
    'Mid',
    'Gold',
    'Roam'
];
function getSkinTagColor(tag) {
    var t = tag.toLowerCase();
    if (t.includes('legend')) return 'text-[#FFE28A]';
    if (t.includes('collector') || t.includes('aspirant') || t.includes('lightborn') || t.includes('champion')) {
        return 'text-amber-300';
    }
    if (t.includes('epic')) return 'text-violet-300';
    if (t.includes('special')) return 'text-emerald-300';
    if (t.includes('elite')) return 'text-sky-300';
    return 'text-slate-300';
}
var SKILL_KEYS = [
    'PASSIVE',
    'SKILL 1',
    'SKILL 2',
    'ULTIMATE',
    'SKILL 4'
];
var HeroGalleryModal = function HeroGalleryModal(param) {
    var profile = param.profile, onClose = param.onClose, onUpdateProfile = param.onUpdateProfile, onPracticeHero = param.onPracticeHero;
    var _profile_equippedSkins_profile_selectedHeroId, _inspectHero_skins_find, _profile_ownedSkins_inspectHero_id, _profile_equippedSkins_inspectHero_id, _profile_heroStats_inspectHero_id, _skillCards_Math_min, _activeSkillCard_mana;
    var _useState = (0, _react.useState)('All'), roleFilter = _useState[0], setRoleFilter = _useState[1];
    var _useState1 = (0, _react.useState)('All'), laneFilter = _useState1[0], setLaneFilter = _useState1[1];
    var _useState2 = (0, _react.useState)('all'), ownershipFilter = _useState2[0], setOwnershipFilter = _useState2[1];
    var _useState3 = (0, _react.useState)(''), search = _useState3[0], setSearch = _useState3[1];
    var _useState4 = (0, _react.useState)(profile.selectedHeroId), inspectHeroId = _useState4[0], setInspectHeroId = _useState4[1];
    var _useState5 = (0, _react.useState)((_profile_equippedSkins_profile_selectedHeroId = profile.equippedSkins[profile.selectedHeroId]) != null ? _profile_equippedSkins_profile_selectedHeroId : (0, _heroes.getMlbbHeroById)(profile.selectedHeroId).skins[0].id), previewSkinId = _useState5[0], setPreviewSkinId = _useState5[1];
    var _useState6 = (0, _react.useState)('skills'), detailTab = _useState6[0], setDetailTab = _useState6[1];
    var _useState7 = (0, _react.useState)(1), selectedSkillIdx = _useState7[0], setSelectedSkillIdx = _useState7[1];
    var _useState8 = (0, _react.useState)(null), poseSignal = _useState8[0], setPoseSignal = _useState8[1];
    var _useState9 = (0, _react.useState)(null), feedbackMsg = _useState9[0], setFeedbackMsg = _useState9[1];
    var inspectHero = (0, _heroes.getMlbbHeroById)(inspectHeroId);
    (0, _react.useEffect)(function() {
        var _inspectHero_skins_find;
        var equipped = profile.equippedSkins[inspectHero.id];
        var valid = (_inspectHero_skins_find = inspectHero.skins.find(function(s) {
            return s.id === equipped;
        })) != null ? _inspectHero_skins_find : inspectHero.skins[0];
        setPreviewSkinId(valid.id);
        setSelectedSkillIdx(1);
    }, [
        inspectHero,
        profile.equippedSkins
    ]);
    (0, _react.useEffect)(function() {
        if (!feedbackMsg) return;
        var t = window.setTimeout(function() {
            return setFeedbackMsg(null);
        }, 2600);
        return function() {
            return window.clearTimeout(t);
        };
    }, [
        feedbackMsg
    ]);
    var filteredHeroes = (0, _react.useMemo)(function() {
        var q = search.trim().toLowerCase();
        return _heroes.MLBB_ALL_HEROES.filter(function(h) {
            if (roleFilter !== 'All' && h.role !== roleFilter) return false;
            if (laneFilter !== 'All' && h.lane !== laneFilter) return false;
            if (ownershipFilter === 'owned' && !profile.ownedHeroIds.includes(h.id)) return false;
            if (ownershipFilter === 'mastered') {
                var _ref;
                var _profile_claimedMasteryChapters;
                var st = profile.heroStats[h.id];
                var claimed = (_ref = (_profile_claimedMasteryChapters = profile.claimedMasteryChapters) == null ? void 0 : _profile_claimedMasteryChapters[h.id]) != null ? _ref : [];
                if ((!st || st.mastery < 100) && !claimed.includes(4)) return false;
            }
            if (q && !h.name.toLowerCase().includes(q) && !h.title.toLowerCase().includes(q) && !h.specialty.toLowerCase().includes(q) && !h.role.toLowerCase().includes(q) && !h.lane.toLowerCase().includes(q)) {
                return false;
            }
            return true;
        });
    }, [
        search,
        roleFilter,
        laneFilter,
        ownershipFilter,
        profile.ownedHeroIds,
        profile.heroStats,
        profile.claimedMasteryChapters
    ]);
    var activeSkin = (_inspectHero_skins_find = inspectHero.skins.find(function(s) {
        return s.id === previewSkinId;
    })) != null ? _inspectHero_skins_find : inspectHero.skins[0];
    var isHeroOwned = profile.ownedHeroIds.includes(inspectHero.id);
    var ownedHeroSkinList = (_profile_ownedSkins_inspectHero_id = profile.ownedSkins[inspectHero.id]) != null ? _profile_ownedSkins_inspectHero_id : [];
    var isDefaultSkin = activeSkin.id === inspectHero.skins[0].id || activeSkin.costDiamonds === 0;
    var isSkinOwned = isDefaultSkin || ownedHeroSkinList.includes(activeSkin.id);
    var isSkinEquipped = ((_profile_equippedSkins_inspectHero_id = profile.equippedSkins[inspectHero.id]) != null ? _profile_equippedSkins_inspectHero_id : inspectHero.skins[0].id) === activeSkin.id;
    var isLobbyHero = profile.selectedHeroId === inspectHero.id;
    var extraSkill4 = (0, _heroCatalogMeta.getHeroExtraSkillPreview)(inspectHero.id);
    var masterySummary = (0, _react.useMemo)(function() {
        var _ref;
        var _profile_claimedMasteryChapters;
        return (0, _heroCatalogMeta.getHeroMasterySummary)(inspectHero, profile.heroStats[inspectHero.id], isHeroOwned, (_ref = (_profile_claimedMasteryChapters = profile.claimedMasteryChapters) == null ? void 0 : _profile_claimedMasteryChapters[inspectHero.id]) != null ? _ref : []);
    }, [
        inspectHero,
        profile.heroStats,
        isHeroOwned,
        profile.claimedMasteryChapters
    ]);
    var heroStatRecord = (_profile_heroStats_inspectHero_id = profile.heroStats[inspectHero.id]) != null ? _profile_heroStats_inspectHero_id : {
        matches: 0,
        wins: 0,
        mmr: 1200,
        mastery: 0
    };
    var winRate = heroStatRecord.matches > 0 ? Math.round(heroStatRecord.wins / heroStatRecord.matches * 100) : 0;
    var handleRecruitHero = function handleRecruitHero(currency) {
        if (isHeroOwned) return;
        if (currency === 'bp') {
            if (profile.bp < inspectHero.costBp) {
                setFeedbackMsg("Need " + inspectHero.costBp.toLocaleString() + " BP to recruit " + inspectHero.name + ".");
                return;
            }
            _AudioEngine.mlbbAudio.playPurchase();
            onUpdateProfile(function(p) {
                var _p_ownedSkins_inspectHero_id;
                var prevSkins = (_p_ownedSkins_inspectHero_id = p.ownedSkins[inspectHero.id]) != null ? _p_ownedSkins_inspectHero_id : [];
                var defId = inspectHero.skins[0].id;
                var _obj, _obj1;
                return _extends({}, p, {
                    bp: p.bp - inspectHero.costBp,
                    ownedHeroIds: p.ownedHeroIds.includes(inspectHero.id) ? p.ownedHeroIds : [].concat(p.ownedHeroIds, [
                        inspectHero.id
                    ]),
                    ownedSkins: _extends({}, p.ownedSkins, (_obj = {}, _obj[inspectHero.id] = prevSkins.includes(defId) ? prevSkins : [].concat(prevSkins, [
                        defId
                    ]), _obj)),
                    equippedSkins: _extends({}, p.equippedSkins, (_obj1 = {}, _obj1[inspectHero.id] = defId, _obj1))
                });
            });
            setFeedbackMsg("Recruited " + inspectHero.name + " with BP!");
        } else {
            if (profile.diamonds < inspectHero.costDiamonds) {
                setFeedbackMsg("Need " + inspectHero.costDiamonds + " Diamonds to recruit " + inspectHero.name + ".");
                return;
            }
            _AudioEngine.mlbbAudio.playPurchase();
            onUpdateProfile(function(p) {
                var _p_ownedSkins_inspectHero_id;
                var prevSkins = (_p_ownedSkins_inspectHero_id = p.ownedSkins[inspectHero.id]) != null ? _p_ownedSkins_inspectHero_id : [];
                var defId = inspectHero.skins[0].id;
                var _obj, _obj1;
                return _extends({}, p, {
                    diamonds: p.diamonds - inspectHero.costDiamonds,
                    ownedHeroIds: p.ownedHeroIds.includes(inspectHero.id) ? p.ownedHeroIds : [].concat(p.ownedHeroIds, [
                        inspectHero.id
                    ]),
                    ownedSkins: _extends({}, p.ownedSkins, (_obj = {}, _obj[inspectHero.id] = prevSkins.includes(defId) ? prevSkins : [].concat(prevSkins, [
                        defId
                    ]), _obj)),
                    equippedSkins: _extends({}, p.equippedSkins, (_obj1 = {}, _obj1[inspectHero.id] = defId, _obj1))
                });
            });
            setFeedbackMsg("Recruited " + inspectHero.name + " with Diamonds!");
        }
    };
    var handleEquipOrUnlockSkin = function handleEquipOrUnlockSkin() {
        if (isSkinOwned) {
            _AudioEngine.mlbbAudio.playClick();
            onUpdateProfile(function(p) {
                var _obj;
                return _extends({}, p, {
                    equippedSkins: _extends({}, p.equippedSkins, (_obj = {}, _obj[inspectHero.id] = activeSkin.id, _obj))
                });
            });
            setPoseSignal({
                nonce: Date.now(),
                color: activeSkin.accent,
                label: "" + activeSkin.name + " Equipped"
            });
            setFeedbackMsg("Equipped " + activeSkin.name + " (" + activeSkin.tag + ")!");
            return;
        }
        var cost = activeSkin.costDiamonds;
        if (profile.diamonds < cost) {
            setFeedbackMsg("Need " + cost + " Diamonds to unlock " + activeSkin.name + ".");
            return;
        }
        _AudioEngine.mlbbAudio.playPurchase();
        onUpdateProfile(function(p) {
            var _p_ownedSkins_inspectHero_id;
            var prevSkins = (_p_ownedSkins_inspectHero_id = p.ownedSkins[inspectHero.id]) != null ? _p_ownedSkins_inspectHero_id : [];
            var _obj, _obj1;
            return _extends({}, p, {
                diamonds: p.diamonds - cost,
                ownedSkins: _extends({}, p.ownedSkins, (_obj = {}, _obj[inspectHero.id] = prevSkins.includes(activeSkin.id) ? prevSkins : [].concat(prevSkins, [
                    activeSkin.id
                ]), _obj)),
                equippedSkins: _extends({}, p.equippedSkins, (_obj1 = {}, _obj1[inspectHero.id] = activeSkin.id, _obj1))
            });
        });
        setPoseSignal({
            nonce: Date.now(),
            color: activeSkin.accent,
            label: "" + activeSkin.name + " Unlocked"
        });
        setFeedbackMsg("Unlocked & equipped " + activeSkin.name + "!");
    };
    var handleDisplayInLobby = function handleDisplayInLobby() {
        _AudioEngine.mlbbAudio.playClick();
        onUpdateProfile(function(p) {
            var _obj;
            return _extends({}, p, {
                showcaseHeroId: inspectHero.id,
                selectedHeroId: inspectHero.id,
                selectedLane: inspectHero.lane,
                equippedSkins: isSkinOwned ? _extends({}, p.equippedSkins, (_obj = {}, _obj[inspectHero.id] = activeSkin.id, _obj)) : p.equippedSkins
            });
        });
        setFeedbackMsg("" + inspectHero.name + " is now displayed in the Sanctuary Lobby.");
    };
    var handleClaimMasteryChapter = function handleClaimMasteryChapter(chapterNum, rewardBp, rewardTickets) {
        _AudioEngine.mlbbAudio.playPurchase();
        onUpdateProfile(function(p) {
            var _p_claimedMasteryChapters, _prevMap_inspectHero_id, _p_heroStats_inspectHero_id;
            var prevMap = (_p_claimedMasteryChapters = p.claimedMasteryChapters) != null ? _p_claimedMasteryChapters : {};
            var prevList = (_prevMap_inspectHero_id = prevMap[inspectHero.id]) != null ? _prevMap_inspectHero_id : [];
            if (prevList.includes(chapterNum)) return p;
            var prevStat = (_p_heroStats_inspectHero_id = p.heroStats[inspectHero.id]) != null ? _p_heroStats_inspectHero_id : {
                matches: 0,
                wins: 0,
                mmr: 1200,
                mastery: 0
            };
            var nextMastery = Math.min(100, Math.max(prevStat.mastery, chapterNum * 25));
            var _obj, _obj1;
            return _extends({}, p, {
                bp: p.bp + rewardBp,
                tickets: p.tickets + rewardTickets,
                heroStats: _extends({}, p.heroStats, (_obj = {}, _obj[inspectHero.id] = _extends({}, prevStat, {
                    mastery: nextMastery
                }), _obj)),
                claimedMasteryChapters: _extends({}, prevMap, (_obj1 = {}, _obj1[inspectHero.id] = [].concat(prevList, [
                    chapterNum
                ]), _obj1))
            });
        });
        setPoseSignal({
            nonce: Date.now(),
            color: '#FFE28A',
            label: "Chapter " + chapterNum + " Claimed"
        });
        setFeedbackMsg("Claimed Chapter " + chapterNum + ": +" + rewardBp + " BP & +" + rewardTickets + " Tickets!");
    };
    var resourceLabel = inspectHero.resource === 'mana' ? 'Mana' : inspectHero.resource === 'energy' ? 'Energy' : 'No Mana';
    var skillCards = (0, _react.useMemo)(function() {
        var list = [].concat([
            {
                idx: 0,
                keyLabel: SKILL_KEYS[0],
                name: inspectHero.passiveName,
                desc: inspectHero.passiveDesc,
                color: activeSkin.accent,
                tags: [
                    'Signature Passive'
                ]
            }
        ], inspectHero.skills.map(function(sk, i) {
            var _ref, _sk_cooldown_, _sk_cooldown_1, _sk_baseDmg_, _sk_baseDmg_1, _sk_ccDuration;
            var minCd = (_ref = (_sk_cooldown_ = sk.cooldown[sk.cooldown.length - 1]) != null ? _sk_cooldown_ : sk.cooldown[0]) != null ? _ref : 8;
            var maxCd = (_sk_cooldown_1 = sk.cooldown[0]) != null ? _sk_cooldown_1 : 8;
            var cdStr = maxCd === minCd ? "" + maxCd.toFixed(1) + "s" : maxCd.toFixed(1) + "–" + minCd.toFixed(1) + "s";
            var dmgMin = (_sk_baseDmg_ = sk.baseDmg[0]) != null ? _sk_baseDmg_ : 0;
            var dmgMax = (_sk_baseDmg_1 = sk.baseDmg[sk.baseDmg.length - 1]) != null ? _sk_baseDmg_1 : dmgMin;
            var dmgBand = dmgMin === dmgMax ? "" + dmgMin : dmgMin + "–" + dmgMax;
            return {
                idx: i + 1,
                keyLabel: SKILL_KEYS[i + 1],
                name: sk.name,
                desc: sk.desc,
                color: sk.color,
                damageType: sk.damageType.toUpperCase(),
                cd: cdStr,
                mana: sk.manaCost,
                range: sk.range,
                cc: sk.ccType ? sk.ccType.toUpperCase() + " (" + ((_sk_ccDuration = sk.ccDuration) != null ? _sk_ccDuration : 1.0).toFixed(1) + "s)" : 'None',
                scaling: dmgBand + " base + " + Math.round(sk.physScale * 100) + "% Phys ATK / " + Math.round(sk.magicScale * 100) + "% Magic POW",
                tags: [
                    sk.physics.toUpperCase(),
                    sk.telegraph.toUpperCase(),
                    sk.wallCross ? 'Wall-Cross' : ''
                ].filter(Boolean)
            };
        }));
        if (extraSkill4) {
            list.push({
                idx: 4,
                keyLabel: SKILL_KEYS[4],
                name: extraSkill4.name,
                desc: extraSkill4.desc,
                color: extraSkill4.color,
                cd: "" + extraSkill4.cd.toFixed(1) + "s",
                tags: [
                    '4-Skill Special Slot'
                ]
            });
        }
        return list;
    }, [
        inspectHero,
        activeSkin.accent,
        extraSkill4
    ]);
    var activeSkillCard = (_skillCards_Math_min = skillCards[Math.min(selectedSkillIdx, skillCards.length - 1)]) != null ? _skillCards_Math_min : skillCards[0];
    var statRows = [
        {
            label: 'Max HP',
            base: "" + inspectHero.baseHp,
            growth: "+" + inspectHero.hpGrowth + " / Lv"
        },
        {
            label: resourceLabel,
            base: "" + inspectHero.baseMana,
            growth: inspectHero.manaGrowth > 0 ? "+" + inspectHero.manaGrowth + " / Lv" : 'Resource-Free'
        },
        {
            label: 'Physical ATK',
            base: "" + inspectHero.basePhysAtk,
            growth: "+" + inspectHero.physAtkGrowth + " / Lv"
        },
        {
            label: 'Magic Power',
            base: "" + inspectHero.baseMagicPow,
            growth: 'Scales w/ Items'
        },
        {
            label: 'Physical DEF',
            base: "" + inspectHero.basePhysDef,
            growth: "+" + inspectHero.physDefGrowth + " / Lv"
        },
        {
            label: 'Magic DEF',
            base: "" + inspectHero.baseMagicDef,
            growth: "+" + inspectHero.magicDefGrowth + " / Lv"
        },
        {
            label: 'Move Speed',
            base: "" + inspectHero.baseMoveSpd,
            growth: 'Soft-Cap 415/490'
        },
        {
            label: 'Attack Speed',
            base: "" + inspectHero.baseAtkSpd.toFixed(2) + "/s",
            growth: 'Cap 3.00/s'
        },
        {
            label: 'Attack Range',
            base: "" + inspectHero.attackRange,
            growth: inspectHero.isRanged ? 'Ranged' : 'Melee'
        }
    ];
    var ratingBars = [
        {
            label: 'Durability',
            val: inspectHero.ratings.durability,
            color: '#22C55E'
        },
        {
            label: 'Offense',
            val: inspectHero.ratings.offense,
            color: '#F97316'
        },
        {
            label: 'Control',
            val: inspectHero.ratings.control,
            color: '#38BDF8'
        },
        {
            label: 'Difficulty',
            val: inspectHero.ratings.difficulty,
            color: '#E6B84C'
        }
    ];
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
        className: "fixed inset-0 z-40 bg-slate-950/88 flex items-center justify-center p-2 sm:p-3",
        children: /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
            className: "w-full max-w-7xl h-[92vh] rounded-2xl bg-[#080F24] border border-[#E6B84C]/55 shadow-2xl flex flex-col overflow-hidden text-slate-100",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#0E1938] border-b border-[#E6B84C]/30 shrink-0",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "text-sm sm:text-base font-black tracking-wide uppercase text-[#FFE28A]",
                                            children: "Heroes Gallery"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "text-[11px] text-slate-400",
                                            children: [
                                                _heroes.MLBB_ALL_HEROES.length,
                                                " Playable Champions \xb7 Owned",
                                                ' ',
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                    className: "text-white font-bold mlbb-num",
                                                    children: profile.ownedHeroIds.length
                                                }),
                                                " / ",
                                                _heroes.MLBB_ALL_HEROES.length
                                            ]
                                        })
                                    ]
                                }),
                                feedbackMsg && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "hidden md:block px-3 py-1 rounded-lg bg-[#162754] border border-[#E6B84C]/50 text-xs font-bold text-[#FFE28A]",
                                    children: feedbackMsg
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "hidden sm:flex items-center gap-3 text-xs font-bold text-slate-200 mlbb-num",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            children: [
                                                "BP ",
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                    className: "text-amber-300",
                                                    children: profile.bp.toLocaleString()
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "text-slate-600",
                                            children: "\xb7"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            children: [
                                                "Tickets ",
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                    className: "text-cyan-300",
                                                    children: profile.tickets.toLocaleString()
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                            className: "text-slate-600",
                                            children: "\xb7"
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                            children: [
                                                "Diamonds ",
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                    className: "text-sky-300",
                                                    children: profile.diamonds.toLocaleString()
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                    onClick: function onClick() {
                                        _AudioEngine.mlbbAudio.playClick();
                                        onClose();
                                    },
                                    className: "w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-white font-black cursor-pointer transition",
                                    "aria-label": "Close Heroes Gallery",
                                    children: "✕"
                                })
                            ]
                        })
                    ]
                }),
                feedbackMsg && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                    className: "md:hidden px-4 py-1.5 bg-[#162754] border-b border-[#E6B84C]/35 text-xs font-bold text-[#FFE28A]",
                    children: feedbackMsg
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                    className: "flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lg:col-span-5 flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-slate-800/90 bg-[#0A1229]",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p-3 space-y-2 border-b border-slate-800/80 shrink-0",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("input", {
                                                    value: search,
                                                    onChange: function onChange(e) {
                                                        return setSearch(e.target.value);
                                                    },
                                                    placeholder: "Search 133 heroes by name, role, lane, specialty...",
                                                    className: "flex-1 px-3 py-1.5 rounded-lg bg-[#070D1F] border border-slate-700 focus:border-[#E6B84C] outline-none text-xs text-white placeholder:text-slate-500"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-[11px] font-bold text-slate-400 mlbb-num shrink-0",
                                                    children: [
                                                        filteredHeroes.length,
                                                        " / ",
                                                        _heroes.MLBB_ALL_HEROES.length
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "flex flex-wrap gap-1",
                                            children: ROLES.map(function(r) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                    onClick: function onClick() {
                                                        _AudioEngine.mlbbAudio.playClick();
                                                        setRoleFilter(r);
                                                    },
                                                    className: "px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition " + (roleFilter === r ? 'bg-[#E6B84C] text-slate-950' : 'bg-[#121E3D] text-slate-300 hover:bg-[#1A2B54] hover:text-white'),
                                                    children: r
                                                }, r);
                                            })
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex flex-wrap items-center justify-between gap-1.5",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "flex flex-wrap gap-1",
                                                    children: LANES.map(function(l) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            onClick: function onClick() {
                                                                _AudioEngine.mlbbAudio.playClick();
                                                                setLaneFilter(l);
                                                            },
                                                            className: "px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition " + (laneFilter === l ? 'bg-sky-500 text-slate-950' : 'bg-[#0E1834] text-slate-400 hover:text-white'),
                                                            children: l === 'All' ? 'All Lanes' : l
                                                        }, l);
                                                    })
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        'all',
                                                        'owned',
                                                        'mastered'
                                                    ].map(function(f) {
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                            onClick: function onClick() {
                                                                _AudioEngine.mlbbAudio.playClick();
                                                                setOwnershipFilter(f);
                                                            },
                                                            className: "px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer " + (ownershipFilter === f ? 'bg-emerald-500 text-slate-950' : 'bg-[#0E1834] text-slate-400 hover:text-white'),
                                                            children: f
                                                        }, f);
                                                    })
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "flex-1 overflow-y-auto p-2.5",
                                    children: filteredHeroes.length === 0 ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                        className: "h-full flex flex-col items-center justify-center text-center p-6 space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                className: "text-sm font-bold text-slate-300",
                                                children: "No champions match your filters."
                                            }),
                                            /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                onClick: function onClick() {
                                                    setRoleFilter('All');
                                                    setLaneFilter('All');
                                                    setOwnershipFilter('all');
                                                    setSearch('');
                                                },
                                                className: "px-4 py-1.5 rounded-lg bg-[#E6B84C] text-slate-950 text-xs font-black cursor-pointer",
                                                children: "Reset Filters"
                                            })
                                        ]
                                    }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                        className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 gap-2",
                                        children: filteredHeroes.map(function(h) {
                                            var _h_skins_find, _ref, _ref1;
                                            var _profile_heroStats_h_id, _profile_claimedMasteryChapters;
                                            var selected = h.id === inspectHero.id;
                                            var owned = profile.ownedHeroIds.includes(h.id);
                                            var eqSkinId = profile.equippedSkins[h.id];
                                            var eqSkin = (_h_skins_find = h.skins.find(function(s) {
                                                return s.id === eqSkinId;
                                            })) != null ? _h_skins_find : h.skins[0];
                                            var mastered = ((_ref = (_profile_heroStats_h_id = profile.heroStats[h.id]) == null ? void 0 : _profile_heroStats_h_id.mastery) != null ? _ref : 0) >= 100 || ((_ref1 = (_profile_claimedMasteryChapters = profile.claimedMasteryChapters) == null ? void 0 : _profile_claimedMasteryChapters[h.id]) != null ? _ref1 : []).includes(4);
                                            return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                onClick: function onClick() {
                                                    _AudioEngine.mlbbAudio.playClick();
                                                    setInspectHeroId(h.id);
                                                },
                                                className: "relative p-2 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer transition " + (selected ? 'bg-[#172855] border-[#FFE28A] shadow-lg' : 'bg-[#0E1835] border-slate-800 hover:border-slate-600'),
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "relative",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroAvatarSvg.HeroPortraitSvg, {
                                                                heroId: h.id,
                                                                skinColor: eqSkin.color,
                                                                skinAccent: eqSkin.accent,
                                                                size: 50
                                                            }),
                                                            mastered && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFE28A] text-slate-950 text-[9px] font-black flex items-center justify-center",
                                                                title: "Mastered Champion",
                                                                children: "★"
                                                            }),
                                                            !owned && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                className: "absolute -bottom-0.5 -right-0.5 px-1 rounded bg-slate-950/90 border border-slate-700 text-[8px] font-bold text-slate-300",
                                                                title: "Not yet recruited",
                                                                children: "LOCK"
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                        className: "w-full truncate text-[11px] font-black text-white",
                                                        children: h.name
                                                    }),
                                                    /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                        className: "w-full truncate text-[9px] text-slate-400",
                                                        children: [
                                                            h.role,
                                                            " \xb7 ",
                                                            h.lane
                                                        ]
                                                    })
                                                ]
                                            }, h.id);
                                        })
                                    })
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                            className: "lg:col-span-7 flex flex-col min-h-0 overflow-y-auto p-3.5 space-y-3 bg-[#080F24]",
                            children: [
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "grid grid-cols-1 md:grid-cols-12 gap-3 shrink-0",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "md:col-span-7 h-56 sm:h-64",
                                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_HeroShowcase3D.HeroShowcase3D, {
                                                heroId: inspectHero.id,
                                                skinId: activeSkin.id,
                                                poseSignal: poseSignal
                                            })
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "md:col-span-5 flex flex-col justify-between p-3 rounded-xl bg-[#0D1734] border border-slate-800",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "space-y-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "flex items-start justify-between gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("h2", {
                                                                            className: "text-xl font-black text-white leading-tight",
                                                                            children: inspectHero.name
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                            className: "text-xs font-semibold text-[#FFE28A]",
                                                                            children: inspectHero.title
                                                                        })
                                                                    ]
                                                                }),
                                                                masterySummary.badgeUnlocked && /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "text-[10px] font-black uppercase tracking-wider text-amber-300",
                                                                    children: "★ Master"
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "text-[11px] text-slate-300",
                                                            children: [
                                                                inspectHero.role,
                                                                inspectHero.secondaryRole ? " / " + inspectHero.secondaryRole : '',
                                                                " \xb7 ",
                                                                inspectHero.lane,
                                                                " Lane \xb7 ",
                                                                resourceLabel
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "text-[11px] text-slate-400",
                                                            children: [
                                                                "Specialty: ",
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "text-slate-200 font-semibold",
                                                                    children: inspectHero.specialty
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 mlbb-num",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    children: [
                                                                        "Matches: ",
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                            className: "text-white",
                                                                            children: heroStatRecord.matches
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    children: [
                                                                        "Win Rate: ",
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("strong", {
                                                                            className: "text-emerald-300",
                                                                            children: [
                                                                                winRate,
                                                                                "%"
                                                                            ]
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    children: [
                                                                        "MMR: ",
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("strong", {
                                                                            className: "text-amber-300",
                                                                            children: heroStatRecord.mmr
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "pt-3 space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                            onClick: function onClick() {
                                                                _AudioEngine.mlbbAudio.playClick();
                                                                onPracticeHero(inspectHero.id, activeSkin.id, inspectHero.lane);
                                                            },
                                                            className: "w-full py-2.5 px-3 rounded-xl bg-[#E6B84C] bg-gradient-to-r from-[#FFE28A] via-[#E6B84C] to-[#C88A1E] border border-[#FFE28A] text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg transition",
                                                            children: [
                                                                "Practice This Hero (",
                                                                inspectHero.lane,
                                                                ")"
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "grid grid-cols-2 gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                    onClick: handleDisplayInLobby,
                                                                    className: "py-2 px-2 rounded-lg text-[11px] font-black cursor-pointer transition " + (isLobbyHero ? 'bg-emerald-900/60 border border-emerald-500/60 text-emerald-200' : 'bg-[#15244A] hover:bg-[#1D3164] border border-slate-700 text-slate-100'),
                                                                    children: isLobbyHero ? 'In Sanctuary ✓' : 'Display in Lobby'
                                                                }),
                                                                !isHeroOwned ? /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                                    onClick: function onClick() {
                                                                        return handleRecruitHero('bp');
                                                                    },
                                                                    className: "py-2 px-2 rounded-lg bg-[#1A2952] hover:bg-[#243870] border border-[#E6B84C]/55 text-[11px] font-black text-[#FFE28A] cursor-pointer mlbb-num",
                                                                    children: [
                                                                        "Buy ",
                                                                        inspectHero.costBp.toLocaleString(),
                                                                        " BP"
                                                                    ]
                                                                }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                    onClick: handleEquipOrUnlockSkin,
                                                                    className: "py-2 px-2 rounded-lg text-[11px] font-black cursor-pointer transition mlbb-num " + (isSkinOwned && isSkinEquipped ? 'bg-slate-800 text-slate-400 border border-slate-700' : isSkinOwned ? 'bg-sky-500 hover:bg-sky-400 text-slate-950' : 'bg-violet-600 hover:bg-violet-500 text-white'),
                                                                    children: isSkinOwned ? isSkinEquipped ? 'Skin Active ✓' : 'Equip Skin' : "Unlock " + activeSkin.costDiamonds + " \uD83D\uDC8E"
                                                                })
                                                            ]
                                                        }),
                                                        !isHeroOwned && /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                            onClick: function onClick() {
                                                                return handleRecruitHero('diamonds');
                                                            },
                                                            className: "w-full py-1.5 rounded-lg bg-[#101C3D] hover:bg-[#192B5B] border border-sky-500/40 text-[10px] font-bold text-sky-300 cursor-pointer mlbb-num",
                                                            children: [
                                                                "Or Instant Unlock with ",
                                                                inspectHero.costDiamonds,
                                                                " Diamonds \uD83D\uDC8E"
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "p-3 rounded-xl bg-[#0D1734] border border-slate-800 space-y-2 shrink-0",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-[11px] font-black uppercase tracking-wider text-[#FFE28A]",
                                                    children: [
                                                        "Skin Collection (",
                                                        inspectHero.skins.length,
                                                        " Tiers)"
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-[11px] text-slate-400",
                                                    children: [
                                                        "Previewing:",
                                                        ' ',
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                            className: "font-bold " + getSkinTagColor(activeSkin.tag),
                                                            children: activeSkin.name
                                                        }),
                                                        isSkinOwned ? isSkinEquipped ? ' · Equipped' : ' · Owned' : " \xb7 " + activeSkin.costDiamonds + " Diamonds"
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid grid-cols-2 sm:grid-cols-5 gap-2",
                                            children: inspectHero.skins.map(function(sk) {
                                                var _profile_equippedSkins_inspectHero_id;
                                                var selected = sk.id === activeSkin.id;
                                                var owned = sk.id === inspectHero.skins[0].id || sk.costDiamonds === 0 || ownedHeroSkinList.includes(sk.id);
                                                var equipped = ((_profile_equippedSkins_inspectHero_id = profile.equippedSkins[inspectHero.id]) != null ? _profile_equippedSkins_inspectHero_id : inspectHero.skins[0].id) === sk.id;
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    onClick: function onClick() {
                                                        _AudioEngine.mlbbAudio.playClick();
                                                        setPreviewSkinId(sk.id);
                                                    },
                                                    className: "p-2 rounded-lg border text-left cursor-pointer transition " + (selected ? 'bg-[#172856] border-[#FFE28A]' : 'bg-[#081026] border-slate-800 hover:border-slate-600'),
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "flex items-center justify-between gap-1 mb-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "w-3.5 h-3.5 rounded-full border border-white/30 shrink-0",
                                                                    style: {
                                                                        background: "linear-gradient(135deg, " + sk.color + ", " + sk.accent + ")"
                                                                    }
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "text-[9px] font-black uppercase " + getSkinTagColor(sk.tag),
                                                                    children: sk.tag
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[11px] font-bold text-white truncate",
                                                            children: sk.name
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[9px] text-slate-400 mlbb-num mt-0.5",
                                                            children: equipped ? 'Equipped ✓' : owned ? 'Owned' : "" + sk.costDiamonds + " \uD83D\uDC8E"
                                                        })
                                                    ]
                                                }, sk.id);
                                            })
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                    className: "flex items-center gap-2 border-b border-slate-800 pb-2 shrink-0",
                                    children: [
                                        {
                                            id: 'skills',
                                            label: "Skills (" + skillCards.length + ")"
                                        },
                                        {
                                            id: 'stats',
                                            label: 'Base Stats & Build'
                                        },
                                        {
                                            id: 'mastery',
                                            label: "Mastery Ch. 1–4 (" + masterySummary.masteryPct + "%)"
                                        }
                                    ].map(function(tab) {
                                        return /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                            onClick: function onClick() {
                                                _AudioEngine.mlbbAudio.playClick();
                                                setDetailTab(tab.id);
                                            },
                                            className: "px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide cursor-pointer transition " + (detailTab === tab.id ? 'bg-[#E6B84C] text-slate-950' : 'bg-[#0F1B3B] text-slate-300 hover:text-white'),
                                            children: tab.label
                                        }, tab.id);
                                    })
                                }),
                                detailTab === 'skills' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid gap-2 " + (skillCards.length >= 5 ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'),
                                            children: skillCards.map(function(sc) {
                                                var active = sc.idx === activeSkillCard.idx;
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("button", {
                                                    onClick: function onClick() {
                                                        _AudioEngine.mlbbAudio.playClick();
                                                        setSelectedSkillIdx(sc.idx);
                                                        setPoseSignal({
                                                            nonce: Date.now(),
                                                            color: sc.color,
                                                            label: sc.name
                                                        });
                                                    },
                                                    className: "p-2.5 rounded-xl border text-left cursor-pointer transition " + (active ? 'bg-[#172856] border-[#FFE28A]' : 'bg-[#0D1734] border-slate-800 hover:border-slate-600'),
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "flex items-center justify-between gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "text-[9px] font-black tracking-wider uppercase text-slate-400",
                                                                    children: sc.keyLabel
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "w-2.5 h-2.5 rounded-full shrink-0",
                                                                    style: {
                                                                        backgroundColor: sc.color
                                                                    }
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-xs font-black text-white truncate mt-1",
                                                            children: sc.name
                                                        }),
                                                        sc.cd && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "text-[10px] text-slate-400 mlbb-num mt-0.5",
                                                            children: [
                                                                "CD ",
                                                                sc.cd,
                                                                sc.mana ? " \xb7 " + sc.mana + " " + resourceLabel : ''
                                                            ]
                                                        })
                                                    ]
                                                }, sc.keyLabel);
                                            })
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-3.5 rounded-xl bg-[#0D1734] border border-slate-800 space-y-2.5",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "flex flex-wrap items-center justify-between gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-[10px] font-black uppercase tracking-widest text-[#FFE28A]",
                                                                    children: activeSkillCard.keyLabel
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-base font-black text-white",
                                                                    children: activeSkillCard.name
                                                                })
                                                            ]
                                                        }),
                                                        activeSkillCard.tags && activeSkillCard.tags.length > 0 && /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[11px] font-semibold text-sky-300",
                                                            children: activeSkillCard.tags.join(' · ')
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                    className: "text-xs leading-relaxed text-slate-200",
                                                    children: activeSkillCard.desc
                                                }),
                                                activeSkillCard.scaling && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px] mlbb-num",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-slate-400 text-[10px]",
                                                                    children: "Damage Type"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "font-bold text-white",
                                                                    children: activeSkillCard.damageType
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-slate-400 text-[10px]",
                                                                    children: "Cooldown / Cost"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "font-bold text-white",
                                                                    children: [
                                                                        activeSkillCard.cd,
                                                                        " \xb7 ",
                                                                        (_activeSkillCard_mana = activeSkillCard.mana) != null ? _activeSkillCard_mana : 0
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-slate-400 text-[10px]",
                                                                    children: "Cast Range"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "font-bold text-white",
                                                                    children: [
                                                                        activeSkillCard.range,
                                                                        " units"
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-slate-400 text-[10px]",
                                                                    children: "Crowd Control"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "font-bold text-amber-300",
                                                                    children: activeSkillCard.cc
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "col-span-2 sm:col-span-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-slate-400 text-[10px]",
                                                                    children: "Scaling Formula"
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "font-bold text-sky-200",
                                                                    children: activeSkillCard.scaling
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                detailTab === 'stats' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#0D1734] border border-slate-800",
                                            children: ratingBars.map(function(bar) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "space-y-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "flex items-center justify-between text-[11px]",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "font-bold text-slate-300",
                                                                    children: bar.label
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                    className: "font-black text-white mlbb-num",
                                                                    children: bar.val
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "h-2 rounded-full bg-slate-900 overflow-hidden",
                                                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "h-full rounded-full",
                                                                style: {
                                                                    width: "" + Math.min(100, bar.val) + "%",
                                                                    backgroundColor: bar.color
                                                                }
                                                            })
                                                        })
                                                    ]
                                                }, bar.label);
                                            })
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid grid-cols-2 sm:grid-cols-3 gap-2",
                                            children: statRows.map(function(row) {
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "p-2.5 rounded-lg bg-[#0D1734] border border-slate-800 flex items-center justify-between gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-[10px] text-slate-400",
                                                                    children: row.label
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-sm font-black text-white mlbb-num",
                                                                    children: row.base
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[10px] font-bold text-emerald-300 mlbb-num text-right",
                                                            children: row.growth
                                                        })
                                                    ]
                                                }, row.label);
                                            })
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-3 rounded-xl bg-[#0D1734] border border-slate-800 space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "text-[11px] font-black uppercase tracking-wider text-[#FFE28A]",
                                                    children: "Recommended 6-Item Core Build"
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                    className: "grid grid-cols-2 sm:grid-cols-3 gap-2",
                                                    children: inspectHero.recommendedBuild.map(function(itemId, idx) {
                                                        var _ref, _ref1, _ref2;
                                                        var item = (0, _items.getMlbbItemById)(itemId);
                                                        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "p-2 rounded-lg bg-[#081026] border border-slate-800 flex items-center justify-between gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "min-w-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                            className: "text-[11px] font-bold text-white truncate",
                                                                            children: [
                                                                                idx + 1,
                                                                                ". ",
                                                                                (_ref = item == null ? void 0 : item.name) != null ? _ref : itemId
                                                                            ]
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                            className: "text-[9px] text-slate-400 truncate",
                                                                            children: (_ref1 = item == null ? void 0 : item.category) != null ? _ref1 : 'Equipment'
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "text-[10px] font-bold text-amber-300 mlbb-num shrink-0",
                                                                    children: [
                                                                        (_ref2 = item == null ? void 0 : item.cost) != null ? _ref2 : 0,
                                                                        "g"
                                                                    ]
                                                                })
                                                            ]
                                                        }, itemId + "_" + idx);
                                                    })
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                detailTab === 'mastery' && /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                            className: "p-3.5 rounded-xl bg-[#0D1734] border border-[#E6B84C]/35 flex flex-wrap items-center justify-between gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "space-y-1 flex-1 min-w-[200px]",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "flex items-center justify-between text-xs",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    className: "font-black text-[#FFE28A] uppercase tracking-wide",
                                                                    children: [
                                                                        inspectHero.name,
                                                                        " Mastery Code"
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                    className: "font-black text-white mlbb-num",
                                                                    children: [
                                                                        masterySummary.completedChapters,
                                                                        " / 4 Chapters \xb7 ",
                                                                        masterySummary.masteryPct,
                                                                        "%"
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "h-2 rounded-full bg-slate-900 overflow-hidden",
                                                            children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                className: "h-full rounded-full bg-gradient-to-r from-[#E6B84C] to-[#FFE28A]",
                                                                style: {
                                                                    width: "" + masterySummary.masteryPct + "%"
                                                                }
                                                            })
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "text-right",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-[10px] text-slate-400 uppercase font-bold",
                                                            children: "Mastery Badge"
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                            className: "text-xs font-black " + (masterySummary.badgeUnlocked ? 'text-[#FFE28A]' : 'text-slate-400'),
                                                            children: masterySummary.badgeUnlocked ? "★ " + masterySummary.badgeTitle : 'Complete Ch. 4 to Unlock'
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                            className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5",
                                            children: masterySummary.chapters.map(function(ch) {
                                                var pct = Math.min(100, Math.round(ch.current / ch.target * 100));
                                                return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                    className: "p-3 rounded-xl border flex flex-col justify-between gap-2.5 " + (ch.claimed ? 'bg-[#0C1D2E] border-emerald-500/40' : ch.completed ? 'bg-[#17264D] border-[#FFE28A]/70' : 'bg-[#0D1734] border-slate-800'),
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "space-y-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "flex items-center justify-between text-[10px] font-black uppercase tracking-wider",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                            className: "text-[#FFE28A]",
                                                                            children: [
                                                                                "Chapter ",
                                                                                ch.chapter
                                                                            ]
                                                                        }),
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
                                                                            className: "text-slate-300 mlbb-num",
                                                                            children: [
                                                                                ch.current,
                                                                                " / ",
                                                                                ch.target
                                                                            ]
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "text-sm font-black text-white",
                                                                    children: ch.title
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                                                                    className: "text-[11px] text-slate-300 leading-snug",
                                                                    children: ch.objective
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                            className: "space-y-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                    className: "h-1.5 rounded-full bg-slate-900 overflow-hidden",
                                                                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                        className: "h-full rounded-full",
                                                                        style: {
                                                                            width: "" + pct + "%",
                                                                            backgroundColor: ch.claimed ? '#22C55E' : '#E6B84C'
                                                                        }
                                                                    })
                                                                }),
                                                                /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
                                                                    className: "flex items-center justify-between gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxruntime.jsx)("div", {
                                                                            className: "text-[10px] font-bold text-amber-300 mlbb-num",
                                                                            children: ch.rewardLabel
                                                                        }),
                                                                        ch.claimed ? /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                            className: "text-[10px] font-black text-emerald-400",
                                                                            children: "Claimed ✓"
                                                                        }) : ch.completed ? /*#__PURE__*/ (0, _jsxruntime.jsx)("button", {
                                                                            onClick: function onClick() {
                                                                                return handleClaimMasteryChapter(ch.chapter, ch.rewardBp, ch.rewardTickets);
                                                                            },
                                                                            className: "px-3 py-1 rounded-lg bg-[#E6B84C] hover:brightness-110 text-slate-950 text-[10px] font-black uppercase cursor-pointer",
                                                                            children: "Claim"
                                                                        }) : /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
                                                                            className: "text-[10px] font-bold text-slate-500",
                                                                            children: "In Progress"
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }, ch.chapter);
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

});

})(window.ArcadeMod);
