(function(ArcadeMod){
// === MODULE: src/games/stickman-brawl/StickmanBrawl ===
ArcadeMod.define("src/games/stickman-brawl/StickmanBrawl", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "StickmanBrawl", {
    enumerable: true,
    get: function() {
        return StickmanBrawl;
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
var StickmanBrawl = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(StickmanBrawl, BaseGame);
    function StickmanBrawl() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.worldW = 2200, _this.groundY = 560, _this.floorCount = 6, _this.platforms = [], _this.crates = [], _this.camX = 0, _this.camY = 0, _this.hero = {
            x: 420,
            y: 560,
            vy: 0,
            facing: 1,
            moveDir: 0,
            atkTimer: 0,
            combo: 0,
            hitCd: 0,
            jumpsLeft: 2,
            dropTimer: 0
        }, _this.enemies = [], _this.wave = 1, _this.animClock = 0;
        return _this;
    }
    var _proto = StickmanBrawl.prototype;
    _proto.init = function init() {
        this.wave = 1;
        this.animClock = 0;
        this.maxLives = 5;
        this.lives = 5;
        this.buildArena();
        this.hero = {
            x: this.worldW * 0.5,
            y: this.groundY,
            vy: 0,
            facing: 1,
            moveDir: 0,
            atkTimer: 0,
            combo: 0,
            hitCd: 1.1,
            jumpsLeft: 2,
            dropTimer: 0
        };
        this.camX = Math.max(0, Math.min(this.worldW - this.width, this.hero.x - this.width / 2));
        this.camY = 0;
        this.enemies = [];
        this.spawnWave();
    };
    _proto.buildArena = function buildArena() {
        this.worldW = Math.max(2200, this.width * 2);
        this.groundY = Math.round(this.height * (this.height > this.width ? 0.78 : 0.83));
        this.floorCount = Math.min(7, 5 + Math.floor((this.wave + 1) / 2));
        this.platforms = [
            {
                floor: 1,
                x: 0,
                y: this.groundY,
                w: this.worldW
            }
        ];
        var step = 104;
        for(var f = 2; f <= this.floorCount; f++){
            var fy = this.groundY - (f - 1) * step;
            var segs = f % 2 === 0 ? 4 : 3;
            var segW = Math.round(this.worldW / (segs + 1.1));
            for(var s = 0; s < segs; s++){
                var sx = Math.round((s + 0.5) / segs * (this.worldW - segW));
                this.platforms.push({
                    floor: f,
                    x: sx,
                    y: fy,
                    w: segW
                });
            }
        }
    };
    _proto.resize = function resize() {
        var prevGroundY = this.groundY;
        var prevWorldW = this.worldW || 1;
        BaseGame.prototype.resize.call(this);
        if (this.platforms.length > 0) {
            this.buildArena();
            var dy = this.groundY - prevGroundY;
            var sx = this.worldW / prevWorldW;
            this.hero.x = Math.max(24, Math.min(this.worldW - 24, this.hero.x * sx));
            this.hero.y = Math.min(this.groundY, this.hero.y + dy);
            for(var _iterator = _create_for_of_iterator_helper_loose(this.enemies), _step; !(_step = _iterator()).done;){
                var e = _step.value;
                e.x = Math.max(20, Math.min(this.worldW - 20, e.x * sx));
                e.y = Math.min(this.groundY, e.y + dy);
            }
            for(var _iterator1 = _create_for_of_iterator_helper_loose(this.crates), _step1; !(_step1 = _iterator1()).done;){
                var cr = _step1.value;
                cr.x = Math.max(20, Math.min(this.worldW - 20, cr.x * sx));
                cr.y = Math.min(this.groundY - 16, cr.y + dy);
            }
            this.camX = Math.max(0, Math.min(this.worldW - this.width, this.hero.x - this.width / 2));
        }
        if (this.isPaused) this.draw();
    };
    _proto.spawnWave = function spawnWave() {
        this.buildArena();
        this.hero.hitCd = Math.max(this.hero.hitCd, 1.0);
        var count = 3 + this.wave;
        for(var i = 0; i < count; i++){
            var plat = this.platforms[Math.floor(Math.random() * this.platforms.length)];
            var sx = plat.x + Math.random() * Math.max(40, plat.w - 40);
            if (Math.abs(sx - this.hero.x) < 200) {
                sx = this.hero.x < this.worldW * 0.5 ? this.hero.x + 320 : this.hero.x - 320;
            }
            var hp = 50 + this.wave * 18;
            this.enemies.push({
                x: Math.max(40, Math.min(this.worldW - 40, sx)),
                y: plat.y,
                vy: 0,
                hp: hp,
                maxHp: hp,
                cd: 0.85,
                jumpCd: 1.0 + Math.random() * 1.4,
                chargeCd: 4,
                flash: 0,
                color: i % 3 === 0 ? '#f97316' : '#ef4444'
            });
        }
        // Spawn Boss Fighter every wave >= 2 (plus mini-boss on wave 1 final or wave >= 2)
        if (this.wave >= 2) {
            var bossHp = 220 + this.wave * 95;
            var bossX = this.hero.x < this.worldW * 0.5 ? this.worldW - 220 : 220;
            this.enemies.push({
                x: bossX,
                y: this.groundY,
                vy: 0,
                hp: bossHp,
                maxHp: bossHp,
                cd: 1.1,
                jumpCd: 1.8,
                chargeCd: 3.5,
                flash: 0,
                color: '#facc15',
                isBoss: true,
                name: this.wave % 2 === 0 ? '👑 SHADOW TITAN BOSS' : '🤖 CYBER SHOGUN BOSS'
            });
            _audio.ArcadeAudio.play('warHorn');
            this.spawnPopup(this.width / 2, this.height * 0.28, '⚠️ BOSS ENTERED THE ARENA!', '#facc15');
        }
        // Spawn 2 Heal/Coin Crates
        this.crates = [];
        for(var k = 0; k < 2; k++){
            var p = this.platforms[Math.floor(Math.random() * this.platforms.length)];
            this.crates.push({
                x: p.x + p.w * (0.25 + Math.random() * 0.5),
                y: p.y - 16,
                kind: k === 0 ? 'heal' : 'coin'
            });
        }
    };
    _proto.releaseInputs = function releaseInputs() {
        this.hero.moveDir = 0;
    };
    _proto.pause = function pause() {
        BaseGame.prototype.pause.call(this);
        this.releaseInputs();
    };
    _proto.setMove = function setMove(dir) {
        if (this.gameOver || this.isPaused) {
            this.hero.moveDir = 0;
            return;
        }
        this.hero.moveDir = dir;
        if (dir) this.hero.facing = dir;
    };
    _proto.jump = function jump() {
        if (this.gameOver || this.isPaused) return;
        if (this.hero.jumpsLeft > 0) {
            this.hero.vy = -530;
            this.hero.jumpsLeft--;
            this.hero.dropTimer = 0;
            _audio.ArcadeAudio.play('jump');
        }
    };
    _proto.dropDown = function dropDown() {
        if (this.gameOver || this.isPaused) return;
        if (this.hero.y < this.groundY - 10) {
            this.hero.dropTimer = 0.24;
            this.hero.vy = Math.max(this.hero.vy, 115);
            _audio.ArcadeAudio.play('slide');
        }
    };
    _proto.attack = function attack() {
        if (this.gameOver || this.isPaused) return;
        if (this.hero.atkTimer > 0.05) return;
        this.hero.atkTimer = 0.24;
        this.hero.combo = (this.hero.combo + 1) % 3;
        _audio.ArcadeAudio.play('punch');
        var hitAny = false;
        for(var i = this.enemies.length - 1; i >= 0; i--){
            var e = this.enemies[i];
            var dx = e.x - this.hero.x;
            var dy = Math.abs(e.y - this.hero.y);
            var reach = e.isBoss ? 96 : 84;
            if (Math.abs(dx) < reach && dy < 66 && dx * this.hero.facing >= -24) {
                var dmg = this.hero.combo === 2 ? 40 : 25;
                e.hp -= dmg;
                e.flash = 0.14;
                e.x += this.hero.facing * (e.isBoss ? 12 : 28);
                hitAny = true;
                this.spawnParticles(e.x - this.camX, e.y - 38 - this.camY, '#ffd700', 8, 160);
                if (e.hp <= 0) {
                    this.enemies.splice(i, 1);
                    var pts = e.isBoss ? 250 : 60;
                    var coinAdd = e.isBoss ? 10 : 2;
                    this.score += pts;
                    (0, _runtimeBridge.addCoins)(coinAdd);
                    _audio.ArcadeAudio.play(e.isBoss ? 'win' : 'ko');
                    (0, _runtimeBridge.addXp)(e.isBoss ? 28 : 8);
                    this.spawnPopup(e.x - this.camX, e.y - 70 - this.camY, e.isBoss ? "\uD83C\uDFC6 BOSS KO! +" + pts : '💥 KO! +60', '#ffd700');
                }
            }
        }
        if (hitAny) {
            this.triggerShake(5, 0.12);
            (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 17);
        }
        if (this.enemies.length === 0) {
            this.wave++;
            this.level++;
            _audio.ArcadeAudio.play('levelup');
            this.spawnPopup(this.width / 2, this.height * 0.35, "\uD83C\uDFE2 WAVE " + this.wave + " (" + this.floorCount + " FLOORS)", '#84fab0');
            this.spawnWave();
        }
    };
    _proto.onPointerDown = function onPointerDown(x) {
        if (this.gameOver || this.isPaused) return;
        if (x < this.width * 0.3) this.setMove(-1);
        else if (x > this.width * 0.7) this.setMove(1);
        else this.attack();
    };
    _proto.onPointerUp = function onPointerUp() {
        this.setMove(0);
    };
    _proto.resolveLanding = function resolveLanding(ent, prevY, allowDrop) {
        if (ent.vy >= 0) {
            for(var _iterator = _create_for_of_iterator_helper_loose(this.platforms), _step; !(_step = _iterator()).done;){
                var p = _step.value;
                if (allowDrop && p.floor > 1) continue;
                if (ent.x >= p.x - 10 && ent.x <= p.x + p.w + 10 && prevY <= p.y + 6 && ent.y >= p.y) {
                    ent.y = p.y;
                    ent.vy = 0;
                    return true;
                }
            }
        }
        if (ent.y > this.groundY) {
            ent.y = this.groundY;
            ent.vy = 0;
            return true;
        }
        return false;
    };
    _proto.update = function update(dt) {
        if (this.gameOver) return;
        this.survivalElapsed = 0;
        this.animClock += dt;
        if (this.hero.dropTimer > 0) this.hero.dropTimer -= dt;
        var prevHeroY = this.hero.y;
        this.hero.x = Math.max(24, Math.min(this.worldW - 24, this.hero.x + this.hero.moveDir * 275 * dt));
        this.hero.vy += 1100 * dt;
        this.hero.y += this.hero.vy * dt;
        if (this.resolveLanding(this.hero, prevHeroY, this.hero.dropTimer > 0)) {
            this.hero.jumpsLeft = 2;
        }
        if (this.hero.atkTimer > 0) this.hero.atkTimer -= dt;
        if (this.hero.hitCd > 0) this.hero.hitCd -= dt;
        // Pick up crates
        for(var i = this.crates.length - 1; i >= 0; i--){
            var cr = this.crates[i];
            if (Math.hypot(cr.x - this.hero.x, cr.y - (this.hero.y - 26)) < 38) {
                this.crates.splice(i, 1);
                if (cr.kind === 'heal') {
                    this.lives = Math.min(this.maxLives, this.lives + 1);
                    (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                    _audio.ArcadeAudio.play('save');
                    this.spawnPopup(this.hero.x - this.camX, this.hero.y - 60 - this.camY, '❤️ +1 HP!', '#84fab0');
                } else {
                    (0, _runtimeBridge.addCoins)(5);
                    this.score += 50;
                    _audio.ArcadeAudio.play('coin');
                    (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 17);
                    this.spawnPopup(this.hero.x - this.camX, this.hero.y - 60 - this.camY, '+5🪙 CRATE!', '#facc15');
                }
            }
        }
        // Smooth 2D camera across expanded 2200px x 6-7 floor arena
        var targetCamX = Math.max(0, Math.min(this.worldW - this.width, this.hero.x - this.width / 2));
        var targetCamY = Math.min(0, this.hero.y - this.height * 0.65);
        this.camX += (targetCamX - this.camX) * (1 - Math.exp(-8 * dt));
        this.camY += (targetCamY - this.camY) * (1 - Math.exp(-7 * dt));
        for(var _iterator = _create_for_of_iterator_helper_loose(this.enemies), _step; !(_step = _iterator()).done;){
            var e = _step.value;
            if (e.flash > 0) e.flash -= dt;
            var prevEy = e.y;
            e.vy += 1100 * dt;
            e.y += e.vy * dt;
            var landed = this.resolveLanding(e, prevEy, false);
            e.jumpCd -= dt;
            if (landed && e.jumpCd <= 0 && this.hero.y < e.y - 60) {
                e.vy = -500;
                e.jumpCd = e.isBoss ? 1.1 : 1.5 + Math.random();
            }
            var dx = this.hero.x - e.x;
            if (e.isBoss) {
                e.chargeCd -= dt;
                if (e.chargeCd <= 0 && Math.abs(dx) < 340 && Math.abs(this.hero.y - e.y) < 75) {
                    e.chargeCd = 3.6;
                    e.x += Math.sign(dx) * 95;
                    _audio.ArcadeAudio.play('punch');
                }
            }
            if (Math.abs(dx) > (e.isBoss ? 52 : 42)) {
                var moveSpd = (e.isBoss ? 115 : 98 + this.wave * 9) * this.scaler.speedMult;
                e.x += Math.sign(dx) * moveSpd * dt;
                e.x = Math.max(20, Math.min(this.worldW - 20, e.x));
            } else if (Math.abs(this.hero.y - e.y) < 52) {
                e.cd -= dt;
                if (e.cd <= 0) {
                    e.cd = Math.max(0.65, (e.isBoss ? 1.1 : 1.3) - this.wave * 0.07);
                    if (this.hero.hitCd <= 0) {
                        this.hero.hitCd = 0.95;
                        this.lives--;
                        _audio.ArcadeAudio.play('hurt');
                        this.triggerShake(e.isBoss ? 10 : 7, 0.18);
                        (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
                        if (this.lives <= 0) {
                            this.gameOverSequence(false);
                            return;
                        }
                    }
                }
            }
        }
    };
    _proto.getCurrentFloor = function getCurrentFloor() {
        return Math.min(this.floorCount, Math.max(1, Math.round((this.groundY - this.hero.y) / 104) + 1));
    };
    _proto.drawStickman = function drawStickman(x, y, color, facing, punching, walkPhase, scale) {
        if (scale === void 0) scale = 1;
        var ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.strokeStyle = color;
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, -58, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -48);
        ctx.lineTo(0, -22);
        ctx.moveTo(0, -22);
        ctx.lineTo(-10 + walkPhase, 0);
        ctx.moveTo(0, -22);
        ctx.lineTo(10 - walkPhase, 0);
        ctx.moveTo(0, -42);
        ctx.lineTo(facing * (punching ? 34 : 14), -40);
        ctx.stroke();
        ctx.restore();
    };
    _proto.draw = function draw() {
        var ctx = this.ctx;
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.save();
        ctx.translate(-this.camX, -this.camY);
        // Arena pillar grid lines so camera scrolling is immediately readable
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 2;
        for(var x = 200; x < this.worldW; x += 200){
            ctx.beginPath();
            ctx.moveTo(x, this.groundY - this.floorCount * 104);
            ctx.lineTo(x, this.groundY);
            ctx.stroke();
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(this.platforms), _step; !(_step = _iterator()).done;){
            var p = _step.value;
            if (p.floor === 1) {
                ctx.fillStyle = '#312e81';
                ctx.fillRect(0, p.y, this.worldW, this.height + 240);
                ctx.fillStyle = '#6366f1';
                ctx.fillRect(0, p.y, this.worldW, 4);
            } else {
                ctx.fillStyle = '#4338ca';
                ctx.beginPath();
                ctx.roundRect(p.x, p.y, p.w, 12, 6);
                ctx.fill();
                ctx.fillStyle = '#84fab0';
                ctx.fillRect(p.x + 6, p.y, p.w - 12, 3);
                ctx.font = '800 10px system-ui, sans-serif';
                ctx.fillStyle = 'rgba(255,255,255,0.65)';
                ctx.fillText("F" + p.floor, p.x + 6, p.y - 4);
            }
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.crates), _step1; !(_step1 = _iterator1()).done;){
            var cr = _step1.value;
            _emojiCache.EmojiCache.draw(ctx, cr.kind === 'heal' ? '🧰' : '💰', cr.x, cr.y, 26);
        }
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.enemies), _step2; !(_step2 = _iterator2()).done;){
            var e = _step2.value;
            var sc = e.isBoss ? 1.45 : 1;
            this.drawStickman(e.x, e.y, e.flash > 0 ? '#ffffff' : e.color, Math.sign(this.hero.x - e.x) || 1, false, Math.sin(this.animClock * 10) * 5, sc);
            if (e.isBoss) {
                _emojiCache.EmojiCache.draw(ctx, '👑', e.x, e.y - 98, 22);
            }
            var bw = e.isBoss ? 54 : 36;
            var barY = e.y - (e.isBoss ? 114 : 78);
            ctx.fillStyle = '#000';
            ctx.fillRect(e.x - bw / 2, barY, bw, 5);
            ctx.fillStyle = e.isBoss ? '#facc15' : '#ef4444';
            ctx.fillRect(e.x - bw / 2, barY, bw * Math.max(0, e.hp / e.maxHp), 5);
        }
        var wp = this.hero.moveDir ? Math.sin(this.animClock * 20) * 8 : 0;
        this.drawStickman(this.hero.x, this.hero.y, '#84fab0', this.hero.facing, this.hero.atkTimer > 0.05, wp);
        if (this.hero.atkTimer > 0.08) {
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.hero.x + this.hero.facing * 24, this.hero.y - 38, 18, -0.7, 0.7);
            ctx.stroke();
        }
        ctx.restore();
        // Boss HP banner if active boss exists
        var activeBoss = this.enemies.find(function(e) {
            return e.isBoss;
        });
        var isCompactLand = this.width > this.height * 1.35 && this.height < 480;
        var topY = isCompactLand ? 24 : this.width < 460 ? 60 : 50;
        ctx.font = '800 11.5px system-ui, sans-serif';
        ctx.fillStyle = '#84fab0';
        ctx.textAlign = 'center';
        ctx.fillText("\uD83C\uDFE2 Floor " + this.getCurrentFloor() + "/" + this.floorCount + " \xb7 Wave " + this.wave + " \xb7 Foes: " + this.enemies.length, this.width / 2, topY);
        if (activeBoss) {
            var mw = Math.min(200, this.width * 0.5);
            var bx = (this.width - mw) / 2;
            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.fillRect(bx, topY + 8, mw, 10);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(bx, topY + 8, mw * Math.max(0, activeBoss.hp / activeBoss.maxHp), 10);
        }
        // Compact Arena Radar Minimap (below top-right settings gear)
        var mapW = 86;
        var mapH = 26;
        var mx = this.width - mapW - 12;
        var my = 62;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.strokeStyle = 'rgba(132, 250, 176, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(mx, my, mapW, mapH, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#84fab0';
        ctx.fillRect(mx + this.hero.x / this.worldW * (mapW - 4), my + mapH - 7, 4, 4);
        for(var _iterator3 = _create_for_of_iterator_helper_loose(this.enemies), _step3; !(_step3 = _iterator3()).done;){
            var e1 = _step3.value;
            ctx.fillStyle = e1.isBoss ? '#facc15' : '#ef4444';
            ctx.fillRect(mx + e1.x / this.worldW * (mapW - 4), my + 6, e1.isBoss ? 5 : 3, e1.isBoss ? 5 : 3);
        }
        ctx.textAlign = 'left';
    };
    return StickmanBrawl;
}(_BaseGame.BaseGame);

});

})(window.ArcadeMod);
