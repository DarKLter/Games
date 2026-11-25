(function(ArcadeMod){
// === MODULE: src/games/angry-slingshot/AngrySlingshot ===
ArcadeMod.define("src/games/angry-slingshot/AngrySlingshot", function(require, module, exports) {
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
    get AngrySlingshot () {
        return AngrySlingshot;
    },
    get birdBudgetForStage () {
        return birdBudgetForStage;
    }
});
var _audio = require("../../core/audio");
var _emojiCache = require("../../core/emojiCache");
var _runtimeBridge = require("../../core/runtimeBridge");
var _BaseGame = require("../../core/BaseGame");
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
function birdBudgetForStage(stage, pigCount) {
    return Math.max(2, Math.min(4, pigCount + (stage <= 1 ? 1 : 0)));
}
var AngrySlingshot = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(AngrySlingshot, BaseGame);
    function AngrySlingshot() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.stage = 1, _this.groundY = 400, _this.slingX = 90, _this.slingY = 330, _this.birdsLeft = 3, _this.maxBirds = 3, _this.bird = {
            x: 90,
            y: 330,
            vx: 0,
            vy: 0,
            r: 15,
            launched: false
        }, _this.aimDrag = null, _this.blocks = [], _this.pigs = [];
        return _this;
    }
    var _proto = AngrySlingshot.prototype;
    _proto.init = function init() {
        this.stage = 1;
        this.maxLives = 1;
        this.lives = 1;
        this.setupStage();
    };
    _proto.setupStage = function setupStage() {
        this.groundY = Math.round(this.height * 0.84);
        this.slingX = Math.max(66, this.width * 0.17);
        this.slingY = this.groundY - Math.min(78, this.height * 0.13);
        this.bird = {
            x: this.slingX,
            y: this.slingY,
            vx: 0,
            vy: 0,
            r: 15,
            launched: false
        };
        this.aimDrag = null;
        this.blocks = [];
        this.pigs = [];
        var fortX = this.width * 0.56;
        var span = Math.min(200, this.width * 0.36);
        var cols = Math.min(5, 3 + this.stage % 3);
        for(var c = 0; c < cols; c++){
            var bx = fortX + c / Math.max(1, cols - 1) * span;
            var mat = this.stage >= 3 && c % 2 === 0 ? 'iron' : c === 0 ? 'stone' : 'wood';
            var hp = mat === 'iron' ? 4 : mat === 'stone' ? 3 : 2;
            this.blocks.push({
                x: bx - 10,
                y: this.groundY - 64,
                w: 18,
                h: 64,
                hp: hp,
                maxHp: hp,
                mat: mat
            });
            if (c < cols - 1) {
                var nx = fortX + (c + 1) / Math.max(1, cols - 1) * span;
                this.blocks.push({
                    x: bx - 6,
                    y: this.groundY - 80,
                    w: nx - bx + 12,
                    h: 16,
                    hp: 2,
                    maxHp: 2,
                    mat: 'wood'
                });
                this.pigs.push({
                    x: (bx + nx) / 2,
                    y: this.groundY - 18,
                    r: 15,
                    hp: this.stage >= 3 ? 2 : 1,
                    maxHp: this.stage >= 3 ? 2 : 1,
                    isKing: false
                });
            }
        }
        if (this.stage >= 2) {
            var midX = fortX + span * 0.5;
            this.blocks.push({
                x: midX - 28,
                y: this.groundY - 134,
                w: 14,
                h: 54,
                hp: 2,
                maxHp: 2,
                mat: 'stone'
            });
            this.blocks.push({
                x: midX + 14,
                y: this.groundY - 134,
                w: 14,
                h: 54,
                hp: 2,
                maxHp: 2,
                mat: 'stone'
            });
            this.blocks.push({
                x: midX - 32,
                y: this.groundY - 148,
                w: 64,
                h: 14,
                hp: 2,
                maxHp: 2,
                mat: 'wood'
            });
            var kingHp = Math.min(3, 1 + Math.floor(this.stage / 2));
            this.pigs.push({
                x: midX,
                y: this.groundY - 96,
                r: 17,
                hp: kingHp,
                maxHp: kingHp,
                isKing: true
            });
        }
        this.maxBirds = birdBudgetForStage(this.stage, this.pigs.length);
        this.birdsLeft = this.maxBirds;
    };
    _proto.resize = function resize() {
        var prevWidth = this.width || 1;
        var prevGroundY = this.groundY;
        var prevSlingX = this.slingX;
        var prevSlingY = this.slingY;
        BaseGame.prototype.resize.call(this);
        var scaleX = prevWidth > 0 ? this.width / prevWidth : 1;
        this.groundY = Math.round(this.height * 0.84);
        this.slingX = Math.max(66, this.width * 0.17);
        this.slingY = this.groundY - Math.min(78, this.height * 0.13);
        var dy = this.groundY - prevGroundY;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.blocks), _step; !(_step = _iterator()).done;){
            var b = _step.value;
            b.x *= scaleX;
            b.w = Math.max(8, b.w * scaleX);
            b.y += dy;
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.pigs), _step1; !(_step1 = _iterator1()).done;){
            var pg = _step1.value;
            pg.x *= scaleX;
            pg.y += dy;
        }
        if (!this.bird.launched) {
            this.bird.x += this.slingX - prevSlingX;
            this.bird.y += this.slingY - prevSlingY;
        } else {
            this.bird.x *= scaleX;
            this.bird.y = Math.min(this.groundY - this.bird.r, this.bird.y + dy);
        }
        if (this.isPaused) this.draw();
    };
    _proto.releaseInputs = function releaseInputs() {
        this.aimDrag = null;
        if (!this.bird.launched) {
            this.bird.x = this.slingX;
            this.bird.y = this.slingY;
        }
    };
    _proto.pause = function pause() {
        BaseGame.prototype.pause.call(this);
        this.releaseInputs();
    };
    _proto.onPointerDown = function onPointerDown(x, y) {
        if (this.gameOver || this.isPaused || this.bird.launched) return;
        this.aimDrag = {
            sx: x,
            sy: y,
            cx: x,
            cy: y
        };
    };
    _proto.onPointerMove = function onPointerMove(x, y) {
        if (!this.aimDrag || this.gameOver || this.isPaused || this.bird.launched) return;
        this.aimDrag.cx = x;
        this.aimDrag.cy = y;
        var dx = Math.max(-75, Math.min(35, x - this.aimDrag.sx));
        var dy = Math.max(-35, Math.min(75, y - this.aimDrag.sy));
        this.bird.x = this.slingX + dx;
        this.bird.y = this.slingY + dy;
    };
    _proto.onPointerUp = function onPointerUp() {
        if (!this.aimDrag || this.bird.launched) return;
        if (this.gameOver || this.isPaused) {
            this.releaseInputs();
            return;
        }
        var pullX = this.slingX - this.bird.x;
        var pullY = this.slingY - this.bird.y;
        if (Math.hypot(pullX, pullY) > 12) {
            this.bird.vx = pullX * 10.6;
            this.bird.vy = pullY * 10.6;
            this.bird.launched = true;
            _audio.ArcadeAudio.play('slingshot');
        } else {
            this.bird.x = this.slingX;
            this.bird.y = this.slingY;
        }
        this.aimDrag = null;
    };
    _proto.update = function update(dt) {
        if (this.gameOver) return;
        this.survivalElapsed = 0;
        if (this.bird.launched) {
            this.bird.vy += 470 * dt;
            this.bird.x += this.bird.vx * dt;
            this.bird.y += this.bird.vy * dt;
            if (this.bird.y + this.bird.r > this.groundY) {
                this.bird.y = this.groundY - this.bird.r;
                if (Math.abs(this.bird.vy) < 42) {
                    this.bird.vy = 0;
                    this.bird.vx *= Math.exp(-6.5 * dt);
                } else {
                    this.bird.vy *= -0.45;
                    this.bird.vx *= 0.82;
                }
            }
            var speed = Math.hypot(this.bird.vx, this.bird.vy);
            for(var i = this.blocks.length - 1; i >= 0; i--){
                var b = this.blocks[i];
                var cx = Math.max(b.x, Math.min(b.x + b.w, this.bird.x));
                var cy = Math.max(b.y, Math.min(b.y + b.h, this.bird.y));
                if (Math.hypot(this.bird.x - cx, this.bird.y - cy) <= this.bird.r) {
                    b.hp -= speed > 420 ? 2 : 1;
                    this.bird.vx *= 0.58;
                    this.bird.vy *= 0.58;
                    _audio.ArcadeAudio.play('break');
                    this.triggerShake(6, 0.14);
                    this.spawnParticles(cx, cy, b.mat === 'wood' ? '#d97706' : '#94a3b8', 8, 150);
                    if (b.hp <= 0) {
                        this.blocks.splice(i, 1);
                        this.score += 30;
                    }
                }
            }
            for(var i1 = this.pigs.length - 1; i1 >= 0; i1--){
                var pg = this.pigs[i1];
                if (Math.hypot(this.bird.x - pg.x, this.bird.y - pg.y) <= this.bird.r + pg.r + 5) {
                    pg.hp -= speed > 360 ? 2 : 1;
                    this.bird.vx *= 0.72;
                    this.bird.vy *= 0.72;
                    if (pg.hp <= 0) {
                        this.pigs.splice(i1, 1);
                        this.score += pg.isKing ? 160 : 100;
                        (0, _runtimeBridge.addCoins)(pg.isKing ? 5 : 3);
                        _audio.ArcadeAudio.play('ko');
                        (0, _runtimeBridge.addXp)(10);
                        this.spawnParticles(pg.x, pg.y, '#4ade80', 14, 190);
                        this.spawnPopup(pg.x, pg.y - 16, pg.isKing ? '👑 KING POP! +160' : '🐷 POP! +100', '#ffd700');
                    } else {
                        _audio.ArcadeAudio.play('hit');
                        this.spawnPopup(pg.x, pg.y - 14, 'ARMOR HIT!', '#facc15');
                    }
                }
            }
            (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 13);
            if (this.pigs.length === 0) {
                this.stage++;
                this.level++;
                var bonus = Math.max(0, this.birdsLeft - 1) * 60;
                this.score += bonus;
                (0, _runtimeBridge.addCoins)(5);
                _audio.ArcadeAudio.play('levelup');
                this.spawnPopup(this.width / 2, this.height * 0.35, "\uD83C\uDFC6 STAGE CLEAR! +" + bonus, '#84fab0');
                this.setupStage();
                return;
            }
            if (this.bird.x > this.width + 60 || this.bird.x < -60 || Math.hypot(this.bird.vx, this.bird.vy) < 18 && this.bird.y >= this.groundY - this.bird.r - 4) {
                this.birdsLeft--;
                if (this.birdsLeft <= 0) {
                    this.spawnPopup(this.width / 2, this.height * 0.36, '💥 OUT OF BIRDS!', '#ef4444');
                    this.gameOverSequence(false);
                    return;
                }
                this.bird = {
                    x: this.slingX,
                    y: this.slingY,
                    vx: 0,
                    vy: 0,
                    r: 15,
                    launched: false
                };
            }
        }
    };
    _proto.draw = function draw() {
        var ctx = this.ctx;
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(0, 0, this.width, this.groundY);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(this.slingX, this.groundY);
        ctx.lineTo(this.slingX, this.slingY + 6);
        ctx.stroke();
        if (!this.bird.launched) {
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(this.slingX - 6, this.slingY);
            ctx.lineTo(this.bird.x, this.bird.y);
            ctx.lineTo(this.slingX + 6, this.slingY);
            ctx.stroke();
            var vx = (this.slingX - this.bird.x) * 10.6;
            var vy = (this.slingY - this.bird.y) * 10.6;
            if (Math.hypot(vx, vy) > 100) {
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                for(var s = 1; s <= 7; s++){
                    var t = s * 0.08;
                    ctx.beginPath();
                    ctx.arc(this.bird.x + vx * t, this.bird.y + vy * t + 235 * t * t, 3.2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(this.blocks), _step; !(_step = _iterator()).done;){
            var b = _step.value;
            ctx.fillStyle = b.mat === 'iron' ? '#334155' : b.mat === 'stone' ? '#64748b' : '#b45309';
            ctx.strokeStyle = b.hp < b.maxHp ? '#facc15' : '#1e293b';
            ctx.lineWidth = 2;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeRect(b.x, b.y, b.w, b.h);
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.pigs), _step1; !(_step1 = _iterator1()).done;){
            var pg = _step1.value;
            _emojiCache.EmojiCache.draw(ctx, pg.isKing ? '👑' : '🐷', pg.x, pg.isKing ? pg.y - 14 : pg.y, pg.r * 2);
            if (pg.isKing) _emojiCache.EmojiCache.draw(ctx, '🐷', pg.x, pg.y + 4, pg.r * 2);
            if (pg.hp > 1) {
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(pg.x - 14, pg.y - pg.r - 8, 28, 4);
                ctx.fillStyle = '#4ade80';
                ctx.fillRect(pg.x - 14, pg.y - pg.r - 8, 28 * (pg.hp / pg.maxHp), 4);
            }
        }
        _emojiCache.EmojiCache.draw(ctx, '🐦', this.bird.x, this.bird.y, this.bird.r * 2.1);
        ctx.font = '800 12px system-ui, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText("\uD83D\uDC26 Birds: " + this.birdsLeft + "/" + this.maxBirds + "  \xb7  \uD83D\uDC37 Pigs: " + this.pigs.length + "  \xb7  Stage " + this.stage, this.width / 2, Math.min(this.height - 10, this.groundY + 26));
        ctx.textAlign = 'left';
    };
    return AngrySlingshot;
}(_BaseGame.BaseGame);

});

})(window.ArcadeMod);
