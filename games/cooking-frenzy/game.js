(function(ArcadeMod){
// === MODULE: src/games/cooking-frenzy/CookingFrenzy ===
ArcadeMod.define("src/games/cooking-frenzy/CookingFrenzy", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CookingFrenzy", {
    enumerable: true,
    get: function() {
        return CookingFrenzy;
    }
});
var _audio = require("../../core/audio");
var _emojiCache = require("../../core/emojiCache");
var _runtimeBridge = require("../../core/runtimeBridge");
var _BaseGame = require("../../core/BaseGame");
var _cookingLogic = require("./cookingLogic");
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
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });
    if (superClass) _set_prototype_of(subClass, superClass);
}
function _set_prototype_of(o, p) {
    _set_prototype_of = Object.setPrototypeOf || function setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return _set_prototype_of(o, p);
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var CookingFrenzy = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(CookingFrenzy, BaseGame);
    function CookingFrenzy() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.recipes = _cookingLogic.RECIPE_BOOK, _this.ingredients = _cookingLogic.INGREDIENTS, _this.plate = [], _this.customers = [], _this.spawnTimer = 0.4, _this.servedCount = 0, _this.rushTimeLeft = 90, _this.serveCombo = 0;
        return _this;
    }
    var _proto = CookingFrenzy.prototype;
    _proto.init = function init() {
        this.recipes = _cookingLogic.RECIPE_BOOK;
        this.ingredients = _cookingLogic.INGREDIENTS;
        this.plate = [];
        this.customers = [];
        this.spawnTimer = 0.2;
        this.maxLives = 1;
        this.lives = 1;
        this.servedCount = 0;
        this.serveCombo = 0;
        this.rushTimeLeft = this.diff === 'extreme' ? 70 : this.diff === 'hard' ? 80 : 95;
    };
    _proto.spawnCustomer = function spawnCustomer() {
        var _this = this;
        var openSlots = [
            0,
            1,
            2
        ].filter(function(s) {
            return !_this.customers.some(function(c) {
                return c.slot === s;
            });
        });
        if (!openSlots.length) return;
        var slot = openSlots[Math.floor(Math.random() * openSlots.length)];
        var poolCount = Math.min(this.recipes.length, 6 + this.level * 3);
        var pool = this.recipes.slice(0, poolCount);
        var rec = pool[Math.floor(Math.random() * pool.length)];
        var maxP = Math.max(10, 21 - this.level * 0.7) / this.scaler.speedMult;
        var avatars = [
            '👩',
            '🧑',
            '👨‍💼',
            '👧',
            '🧔',
            '👵',
            '👩‍🚀',
            '🧝'
        ];
        this.customers.push({
            slot: slot,
            avatar: avatars[Math.floor(Math.random() * avatars.length)],
            rec: rec,
            patience: maxP,
            maxP: maxP
        });
    };
    _proto.resize = function resize() {
        BaseGame.prototype.resize.call(this);
        if (this.isPaused) this.draw();
    };
    _proto.getLayout = function getLayout() {
        var isCompactLand = this.width > this.height * 1.35 && this.height < 520;
        var topY = isCompactLand ? 44 : this.width < 460 ? 60 : 52;
        var slotW = Math.min(isCompactLand ? 164 : 138, (this.width - 20) / 3);
        var cStartX = (this.width - slotW * 3) / 2;
        var custH = isCompactLand ? 78 : Math.min(106, Math.max(84, this.height * 0.16));
        var plateY = topY + custH + (isCompactLand ? 10 : 16);
        var plateH = isCompactLand ? 42 : 46;
        var ingStartY = plateY + plateH + (isCompactLand ? 8 : 10);
        var ingButtons = (0, _cookingLogic.computeIngredientButtons)(this.width, this.height, ingStartY, this.ingredients);
        var plateW = Math.min(200, Math.max(150, this.width - 84));
        var groupW = plateW + 54;
        var plateX = Math.max(12, (this.width - groupW) / 2);
        var trashX = Math.min(this.width - 26, plateX + plateW + 30);
        var trashY = plateY + plateH / 2;
        var plateRect = {
            x: plateX,
            y: plateY,
            w: plateW,
            h: plateH
        };
        return {
            topY: topY,
            slotW: slotW,
            cStartX: cStartX,
            custH: custH,
            plateY: plateY,
            plateH: plateH,
            plateRect: plateRect,
            trashX: trashX,
            trashY: trashY,
            ingButtons: ingButtons
        };
    };
    _proto.onPointerDown = function onPointerDown(x, y) {
        if (this.gameOver || this.isPaused) return;
        var lay = this.getLayout();
        // 1. Check customer slots for serving
        for(var i = this.customers.length - 1; i >= 0; i--){
            var c = this.customers[i];
            var cx = lay.cStartX + c.slot * lay.slotW + 4;
            if (x >= cx && x <= cx + lay.slotW - 8 && y >= lay.topY && y <= lay.topY + lay.custH + 6) {
                var ready = (0, _cookingLogic.matchRecipe)(this.plate, this.recipes);
                if (ready && ready.name === c.rec.name) {
                    this.customers.splice(i, 1);
                    this.plate = [];
                    this.servedCount++;
                    this.serveCombo++;
                    var timeBonus = Math.min(8, 3 + Math.floor(this.serveCombo / 2));
                    this.rushTimeLeft = Math.min(120, this.rushTimeLeft + timeBonus);
                    var tip = (c.rec.need.length >= 4 ? 75 : 55) + Math.min(50, this.serveCombo * 8);
                    this.score += tip;
                    var coinBonus = this.serveCombo >= 3 ? 4 : 3;
                    (0, _runtimeBridge.addCoins)(coinBonus);
                    (0, _runtimeBridge.addXp)(10);
                    if (this.servedCount % 5 === 0) {
                        this.level++;
                        _audio.ArcadeAudio.play('levelup');
                        this.spawnPopup(this.width / 2, lay.topY + 12, "\uD83D\uDC68‍\uD83C\uDF73 CHEF LVL " + this.level + "!", '#ffd700');
                    } else {
                        _audio.ArcadeAudio.play('serve');
                    }
                    (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 14);
                    this.spawnPopup(cx + lay.slotW / 2, lay.topY + 40, "\uD83C\uDF7D️ +" + tip + " (+" + timeBonus + "s)", '#84fab0');
                } else {
                    this.serveCombo = 0;
                    _audio.ArcadeAudio.play('hurt');
                    this.spawnPopup(cx + lay.slotW / 2, lay.topY + 40, 'WRONG DISH!', '#ef4444');
                }
                return;
            }
        }
        // 2. Check Trash Bin
        if (Math.hypot(x - lay.trashX, y - lay.trashY) <= 28) {
            if (this.plate.length > 0) {
                this.plate = [];
                _audio.ArcadeAudio.play('slide');
            }
            return;
        }
        // 3. Check Plate tap (pop last ingredient)
        if (x >= lay.plateRect.x && x <= lay.plateRect.x + lay.plateRect.w && y >= lay.plateRect.y && y <= lay.plateRect.y + lay.plateRect.h) {
            if (this.plate.length > 0) {
                this.plate.pop();
                _audio.ArcadeAudio.play('click');
            }
            return;
        }
        // 4. Unified exact hit check on all 20 ingredient buttons
        for(var _iterator = _create_for_of_iterator_helper_loose(lay.ingButtons), _step; !(_step = _iterator()).done;){
            var btn = _step.value;
            if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
                if (this.plate.length < 4) {
                    this.plate.push(btn.ing);
                    _audio.ArcadeAudio.play('cook');
                    this.spawnParticles(btn.x + btn.w / 2, btn.y + btn.h / 2, '#ffd700', 5, 80);
                } else {
                    _audio.ArcadeAudio.play('hurt');
                    this.spawnPopup(btn.x + btn.w / 2, btn.y, 'PLATE FULL!', '#ef4444');
                }
                return;
            }
        }
    };
    _proto.update = function update(dt) {
        if (this.gameOver) return;
        this.survivalElapsed = 0;
        this.rushTimeLeft -= dt;
        if (this.rushTimeLeft <= 0) {
            this.rushTimeLeft = 0;
            this.spawnPopup(this.width / 2, this.height * 0.35, '⏱️ SHIFT COMPLETE!', '#facc15');
            this.gameOverSequence(this.servedCount >= 6);
            return;
        }
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0 && this.customers.length < 3) {
            this.spawnCustomer();
            this.spawnTimer = Math.max(1.6, 3.3 - this.level * 0.22);
        }
        for(var i = this.customers.length - 1; i >= 0; i--){
            var c = this.customers[i];
            c.patience -= dt;
            if (c.patience <= 0) {
                this.customers.splice(i, 1);
                this.serveCombo = 0;
                this.rushTimeLeft = Math.max(0, this.rushTimeLeft - 7);
                _audio.ArcadeAudio.play('hurt');
                this.triggerShake(7, 0.16);
                var lay = this.getLayout();
                this.spawnPopup(lay.cStartX + (c.slot + 0.5) * lay.slotW, lay.topY + 45, '😡 LEFT! -7s', '#ef4444');
            }
        }
    };
    _proto.draw = function draw() {
        var ctx = this.ctx;
        var lay = this.getLayout();
        ctx.fillStyle = '#2b1b17';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(0, lay.topY + lay.custH + 2, this.width, 10);
        // Shift timer badge centered near top
        ctx.font = '800 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.rushTimeLeft <= 15 ? '#ef4444' : '#fde047';
        ctx.fillText("⏱️ " + Math.ceil(this.rushTimeLeft) + "s   \xb7   \uD83C\uDF7D️ Served: " + this.servedCount + (this.serveCombo >= 2 ? "   \xb7   \uD83D\uDD25 x" + this.serveCombo : ''), this.width / 2, Math.max(24, lay.topY - 12));
        var isCompactCard = lay.custH < 82;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.customers), _step; !(_step = _iterator()).done;){
            var c = _step.value;
            var cx = lay.cStartX + c.slot * lay.slotW + 4;
            var w = lay.slotW - 8;
            ctx.fillStyle = 'rgba(255,255,255,0.11)';
            ctx.beginPath();
            ctx.roundRect(cx, lay.topY, w, lay.custH, 12);
            ctx.fill();
            _emojiCache.EmojiCache.draw(ctx, c.avatar, cx + w * 0.28, lay.topY + (isCompactCard ? 22 : 30), isCompactCard ? 26 : 32);
            _emojiCache.EmojiCache.draw(ctx, c.rec.dish, cx + w * 0.72, lay.topY + (isCompactCard ? 22 : 30), isCompactCard ? 24 : 30);
            ctx.font = '800 12px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.fillText(c.rec.need.join(''), cx + w / 2, lay.topY + lay.custH - (isCompactCard ? 19 : 22));
            var pct = Math.max(0, c.patience / c.maxP);
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(cx + 8, lay.topY + lay.custH - 11, w - 16, 7);
            ctx.fillStyle = pct > 0.4 ? '#4ade80' : '#ef4444';
            ctx.fillRect(cx + 8, lay.topY + lay.custH - 11, (w - 16) * pct, 7);
        }
        var ready = (0, _cookingLogic.matchRecipe)(this.plate, this.recipes);
        ctx.fillStyle = ready ? '#14532d' : '#1e293b';
        ctx.strokeStyle = ready ? '#4ade80' : '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(lay.plateRect.x, lay.plateRect.y, lay.plateRect.w, lay.plateRect.h, 24);
        ctx.fill();
        ctx.stroke();
        ctx.font = '800 13px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText(ready ? ready.dish + " " + ready.name.split(' ')[0] + "! Tap Client" : this.plate.length ? "" + this.plate.join(' ') + "  (↩)" : '🍽️ Tap Ingredients', lay.plateRect.x + lay.plateRect.w / 2, lay.plateRect.y + Math.round(lay.plateRect.h * 0.63));
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.arc(lay.trashX, lay.trashY, 22, 0, Math.PI * 2);
        ctx.fill();
        _emojiCache.EmojiCache.draw(ctx, '🗑️', lay.trashX, lay.trashY, 22);
        for(var _iterator1 = _create_for_of_iterator_helper_loose(lay.ingButtons), _step1; !(_step1 = _iterator1()).done;){
            var btn = _step1.value;
            ctx.fillStyle = 'rgba(255,255,255,0.14)';
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 10);
            ctx.fill();
            ctx.stroke();
            _emojiCache.EmojiCache.draw(ctx, btn.ing, btn.x + btn.w / 2, btn.y + btn.h / 2, Math.min(26, Math.round(btn.h * 0.6)));
        }
        ctx.textAlign = 'left';
    };
    return CookingFrenzy;
}(_BaseGame.BaseGame);

});
// === MODULE: src/games/cooking-frenzy/cookingLogic ===
ArcadeMod.define("src/games/cooking-frenzy/cookingLogic", function(require, module, exports) {
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
    get INGREDIENTS () {
        return INGREDIENTS;
    },
    get RECIPE_BOOK () {
        return RECIPE_BOOK;
    },
    get computeIngredientButtons () {
        return computeIngredientButtons;
    },
    get matchRecipe () {
        return matchRecipe;
    }
});
var INGREDIENTS = [
    '🍞',
    '🥩',
    '🧀',
    '🍅',
    '🥬',
    '🥓',
    '🥚',
    '🍗',
    '🌽',
    '🍚',
    '🐟',
    '🍤',
    '🍄',
    '🌶️',
    '🍰',
    '🍫',
    '🥑',
    '🧅',
    '🍓',
    '🍯'
];
var RECIPE_BOOK = [
    {
        dish: '🍔',
        name: 'Classic Burger',
        need: [
            '🍞',
            '🥩',
            '🧀'
        ]
    },
    {
        dish: '🥓',
        name: 'Bacon Melt',
        need: [
            '🍞',
            '🥩',
            '🧀',
            '🥓'
        ]
    },
    {
        dish: '🍕',
        name: 'Margherita',
        need: [
            '🍞',
            '🍅',
            '🧀'
        ]
    },
    {
        dish: '🍄',
        name: 'Shroom Pizza',
        need: [
            '🍞',
            '🍅',
            '🧀',
            '🍄'
        ]
    },
    {
        dish: '🌮',
        name: 'Street Taco',
        need: [
            '🌽',
            '🥩',
            '🍅'
        ]
    },
    {
        dish: '🌶️',
        name: 'Spicy Taco',
        need: [
            '🌽',
            '🍗',
            '🌶️',
            '🧀'
        ]
    },
    {
        dish: '🍣',
        name: 'Salmon Sushi',
        need: [
            '🍚',
            '🐟'
        ]
    },
    {
        dish: '🍤',
        name: 'Tempura Roll',
        need: [
            '🍚',
            '🍤',
            '🥬'
        ]
    },
    {
        dish: '🥗',
        name: 'Garden Salad',
        need: [
            '🥬',
            '🍅',
            '🌽',
            '🧀'
        ]
    },
    {
        dish: '🍳',
        name: 'Breakfast',
        need: [
            '🍞',
            '🥚',
            '🥓'
        ]
    },
    {
        dish: '🍗',
        name: 'Spicy Bowl',
        need: [
            '🍚',
            '🍗',
            '🌶️'
        ]
    },
    {
        dish: '🎂',
        name: 'Choco Cake',
        need: [
            '🍞',
            '🍰',
            '🍫'
        ]
    },
    {
        dish: '🥑',
        name: 'Avo Toast',
        need: [
            '🍞',
            '🥑',
            '🥚'
        ]
    },
    {
        dish: '🌯',
        name: 'Guac Wrap',
        need: [
            '🌽',
            '🥑',
            '🧅',
            '🍅'
        ]
    },
    {
        dish: '🍛',
        name: 'Katsu Curry',
        need: [
            '🍚',
            '🍗',
            '🧅',
            '🍄'
        ]
    },
    {
        dish: '🍓',
        name: 'Berry Tart',
        need: [
            '🍞',
            '🍰',
            '🍓',
            '🍯'
        ]
    },
    {
        dish: '🥞',
        name: 'Honey Stack',
        need: [
            '🍞',
            '🥚',
            '🍯'
        ]
    },
    {
        dish: '🍱',
        name: 'Deluxe Bento',
        need: [
            '🍚',
            '🐟',
            '🍤',
            '🥚'
        ]
    },
    {
        dish: '🧀',
        name: 'French Dip',
        need: [
            '🍞',
            '🥩',
            '🧅',
            '🧀'
        ]
    },
    {
        dish: '🥟',
        name: 'Chili Gyoza',
        need: [
            '🌽',
            '🍤',
            '🧅',
            '🌶️'
        ]
    }
];
function matchRecipe(plate, recipes) {
    if (recipes === void 0) recipes = RECIPE_BOOK;
    if (plate.length === 0) return null;
    var sortedPlate = [].concat(plate).sort().join(',');
    return recipes.find(function(r) {
        return [].concat(r.need).sort().join(',') === sortedPlate;
    }) || null;
}
function computeIngredientButtons(width, height, ingStartY, items) {
    if (items === void 0) items = INGREDIENTS;
    var isCompactLandscape = width > height * 1.35 && height < 520;
    var cols = isCompactLandscape ? 10 : 5;
    var rows = Math.ceil(items.length / cols);
    var gap = width < 380 ? 5 : isCompactLandscape ? 6 : 7;
    var maxBoardW = isCompactLandscape ? Math.min(680, width - 24) : Math.min(400, width - 16);
    var btnW = Math.floor((maxBoardW - gap * (cols - 1)) / cols);
    var availH = Math.max(88, height - ingStartY - 10);
    var btnH = Math.max(30, Math.min(52, Math.floor((availH - gap * (rows - 1)) / rows)));
    var totalW = cols * btnW + (cols - 1) * gap;
    var startX = (width - totalW) / 2;
    return items.map(function(ing, idx) {
        var r = Math.floor(idx / cols);
        var c = idx % cols;
        return {
            idx: idx,
            ing: ing,
            x: startX + c * (btnW + gap),
            y: ingStartY + r * (btnH + gap),
            w: btnW,
            h: btnH
        };
    });
}

});

})(window.ArcadeMod);
