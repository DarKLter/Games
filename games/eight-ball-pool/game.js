(function(ArcadeMod){
// === MODULE: src/games/eight-ball-pool/EightBallPool ===
ArcadeMod.define("src/games/eight-ball-pool/EightBallPool", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EightBallPool", {
    enumerable: true,
    get: function() {
        return EightBallPool;
    }
});
var _audio = require("../../core/audio");
var _runtimeBridge = require("../../core/runtimeBridge");
var _BaseGame = require("../../core/BaseGame");
var _poolRules = require("./poolRules");
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
var VS_TURN_TIME = 18;
var EightBallPool = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(EightBallPool, BaseGame);
    function EightBallPool() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.poolMode = 'vs', _this.turn = 'player', _this.enemyScore = 0, _this.shots = 0, _this.shotActive = false, _this.shotPocketedAny = false, _this.shotScratched = false, _this.enemyThinkTimer = 0, _this.turnTimer = VS_TURN_TIME, _this.soloTimeLeft = 75, _this.aiming = null, _this.balls = [], _this.lastTableRect = null;
        return _this;
    }
    var _proto = EightBallPool.prototype;
    _proto.init = function init() {
        this.poolMode = 'vs';
        this.turn = 'player';
        this.enemyScore = 0;
        this.shots = 0;
        this.shotActive = false;
        this.shotPocketedAny = false;
        this.shotScratched = false;
        this.enemyThinkTimer = 0;
        this.turnTimer = VS_TURN_TIME;
        this.soloTimeLeft = this.diff === 'extreme' || this.diff === 'hard' ? 60 : 75;
        this.maxLives = 1;
        this.lives = 1;
        this.aiming = null;
        this.setupRack();
    };
    _proto.getModeButtons = function getModeButtons() {
        var isCompactLand = this.width > this.height * 1.35 && this.height < 480;
        var bw = Math.min(138, (this.width - 30) / 2);
        var by = isCompactLand ? 10 : this.width < 460 ? 54 : 48;
        var bh = isCompactLand ? 32 : 34;
        var startX = this.width / 2 - bw - 5;
        return [
            {
                id: 'vs',
                label: '🤖 VS ENEMY',
                x: startX,
                y: by,
                w: bw,
                h: bh
            },
            {
                id: 'solo',
                label: '⏱️ SOLO TIMED',
                x: startX + bw + 10,
                y: by,
                w: bw,
                h: bh
            }
        ];
    };
    _proto.getTableRect = function getTableRect() {
        var isCompactLand = this.width > this.height * 1.35 && this.height < 480;
        var topSafe = isCompactLand ? 52 : this.width < 460 ? 96 : 90;
        var availW = this.width - 28;
        var availH = Math.max(120, this.height - topSafe - 34);
        var w = Math.min(availW, 640);
        var h = Math.min(availH, 360);
        if (w > h * 1.9) w = h * 1.9;
        if (h > w * 0.72 && this.width > this.height) h = w * 0.56;
        return {
            x: (this.width - w) / 2,
            y: topSafe + (availH - h) / 2,
            w: w,
            h: h,
            r: Math.max(8, Math.min(13, Math.min(w, h) * 0.036))
        };
    };
    _proto.setupRack = function setupRack() {
        var tb = this.getTableRect();
        this.lastTableRect = tb;
        var r = tb.r;
        this.balls = [
            {
                x: tb.x + tb.w * 0.25,
                y: tb.y + tb.h * 0.5,
                vx: 0,
                vy: 0,
                color: '#ffffff',
                num: 0,
                isCue: true
            }
        ];
        var colors = [
            '#eab308',
            '#2563eb',
            '#dc2626',
            '#7c3aed',
            '#ea580c',
            '#16a34a',
            '#111827',
            '#06b6d4',
            '#ec4899',
            '#84cc16'
        ];
        var idx = 0;
        for(var col = 0; col < 4; col++){
            for(var row = 0; row <= col; row++){
                var bx = tb.x + tb.w * 0.7 + col * (r * 1.85);
                var by = tb.y + tb.h * 0.5 + (row - col / 2) * (r * 2.08);
                var is8 = col === 2 && row === 1;
                this.balls.push({
                    x: bx,
                    y: by,
                    vx: 0,
                    vy: 0,
                    color: is8 ? '#111111' : colors[idx % colors.length],
                    num: is8 ? 8 : ++idx,
                    is8: is8
                });
            }
        }
    };
    _proto.pockets = function pockets(tb) {
        return [
            {
                x: tb.x + 4,
                y: tb.y + 4
            },
            {
                x: tb.x + tb.w / 2,
                y: tb.y + 2
            },
            {
                x: tb.x + tb.w - 4,
                y: tb.y + 4
            },
            {
                x: tb.x + 4,
                y: tb.y + tb.h - 4
            },
            {
                x: tb.x + tb.w / 2,
                y: tb.y + tb.h - 2
            },
            {
                x: tb.x + tb.w - 4,
                y: tb.y + tb.h - 4
            }
        ];
    };
    _proto.ballsMoving = function ballsMoving() {
        return this.balls.some(function(b) {
            return Math.hypot(b.vx, b.vy) > 6;
        });
    };
    _proto.resize = function resize() {
        var prev = this.lastTableRect;
        BaseGame.prototype.resize.call(this);
        var next = this.getTableRect();
        if (prev && prev.w > 0 && prev.h > 0) {
            var sx = next.w / prev.w;
            var sy = next.h / prev.h;
            for(var _iterator = _create_for_of_iterator_helper_loose(this.balls), _step; !(_step = _iterator()).done;){
                var b = _step.value;
                b.x = next.x + (b.x - prev.x) * sx;
                b.y = next.y + (b.y - prev.y) * sy;
                b.vx *= sx;
                b.vy *= sy;
            }
        }
        this.lastTableRect = next;
        if (this.isPaused) this.draw();
    };
    _proto.releaseInputs = function releaseInputs() {
        this.aiming = null;
    };
    _proto.pause = function pause() {
        BaseGame.prototype.pause.call(this);
        this.releaseInputs();
    };
    _proto.onPointerDown = function onPointerDown(x, y) {
        if (this.gameOver || this.isPaused) return;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.getModeButtons()), _step; !(_step = _iterator()).done;){
            var mb = _step.value;
            if (x >= mb.x && x <= mb.x + mb.w && y >= mb.y && y <= mb.y + mb.h) {
                if (this.poolMode !== mb.id) {
                    this.poolMode = mb.id;
                    this.score = 0;
                    this.enemyScore = 0;
                    this.turn = 'player';
                    this.turnTimer = VS_TURN_TIME;
                    this.shotActive = false;
                    this.soloTimeLeft = this.diff === 'extreme' || this.diff === 'hard' ? 60 : 75;
                    this.setupRack();
                    _audio.ArcadeAudio.play('click');
                    (0, _runtimeBridge.updateInGameHud)(0, this.level, 18);
                }
                return;
            }
        }
        if (this.ballsMoving() || this.poolMode === 'vs' && this.turn !== 'player') return;
        this.aiming = {
            sx: x,
            sy: y,
            cx: x,
            cy: y
        };
    };
    _proto.onPointerMove = function onPointerMove(x, y) {
        if (this.gameOver || this.isPaused) return;
        if (this.aiming) {
            this.aiming.cx = x;
            this.aiming.cy = y;
        }
    };
    _proto.onPointerUp = function onPointerUp() {
        if (!this.aiming) return;
        if (this.gameOver || this.isPaused) {
            this.aiming = null;
            return;
        }
        var cue = this.balls[0];
        var dx = this.aiming.sx - this.aiming.cx;
        var dy = this.aiming.sy - this.aiming.cy;
        var pull = Math.min(160, Math.hypot(dx, dy));
        if (pull > 10 && cue) {
            var ang = Math.atan2(dy, dx);
            var power = pull * 6.5;
            cue.vx = Math.cos(ang) * power;
            cue.vy = Math.sin(ang) * power;
            this.shots++;
            this.shotActive = true;
            this.shotPocketedAny = false;
            this.shotScratched = false;
            _audio.ArcadeAudio.play('cueHit');
        }
        this.aiming = null;
    };
    _proto.performEnemyShot = function performEnemyShot() {
        var cue = this.balls[0];
        if (!cue) return;
        var tb = this.getTableRect();
        var _pickBestPoolShot = (0, _poolRules.pickBestPoolShot)(cue, this.balls, this.pockets(tb)), angle = _pickBestPoolShot.angle, power = _pickBestPoolShot.power;
        var jitter = (Math.random() - 0.5) * 0.08;
        cue.vx = Math.cos(angle + jitter) * power;
        cue.vy = Math.sin(angle + jitter) * power;
        this.shotActive = true;
        this.shotPocketedAny = false;
        this.shotScratched = false;
        _audio.ArcadeAudio.play('cueHit');
    };
    _proto.update = function update(dt) {
        var _this, _loop = function(i1) {
            var b = _this.balls[i1];
            if (pkts.some(function(pk) {
                return Math.hypot(b.x - pk.x, b.y - pk.y) < r * 1.45;
            })) {
                if (b.isCue) {
                    b.x = tb.x + tb.w * 0.25;
                    b.y = tb.y + tb.h * 0.5;
                    b.vx = 0;
                    b.vy = 0;
                    _this.shotScratched = true;
                    _audio.ArcadeAudio.play('hurt');
                    _this.spawnPopup(b.x, b.y - 16, 'SCRATCH!', '#ef4444');
                } else if (b.is8) {
                    _this.balls.splice(i1, 1);
                    eightBallPocketed = true;
                } else {
                    _this.balls.splice(i1, 1);
                    _this.shotPocketedAny = true;
                    if (_this.poolMode === 'vs' && _this.turn === 'enemy') {
                        _this.enemyScore += 50;
                        _audio.ArcadeAudio.play('pocket');
                        _this.spawnPopup(b.x, b.y - 12, '🤖 ENEMY +50', '#f87171');
                    } else {
                        _this.score += 50;
                        (0, _runtimeBridge.addCoins)(2);
                        _audio.ArcadeAudio.play('pocket');
                        (0, _runtimeBridge.addXp)(8);
                        (0, _runtimeBridge.updateInGameHud)(_this.score, _this.level, 18);
                        _this.spawnPopup(b.x, b.y - 12, '🎱 +50 (+2🪙)', '#84fab0');
                    }
                }
            }
        };
        if (this.gameOver) return;
        this.survivalElapsed = 0;
        if (this.poolMode === 'solo') {
            this.soloTimeLeft -= dt;
            if (this.soloTimeLeft <= 0) {
                this.soloTimeLeft = 0;
                this.spawnPopup(this.width / 2, this.height * 0.35, "⏱️ TIME'S UP!", '#ef4444');
                this.gameOverSequence(false);
                return;
            }
        } else if (this.turn === 'player' && !this.shotActive && !this.ballsMoving()) {
            // Turn Shot Clock in VS ENEMY mode
            this.turnTimer -= dt;
            if (this.turnTimer <= 0) {
                this.aiming = null;
                this.turn = 'enemy';
                this.turnTimer = VS_TURN_TIME;
                this.enemyThinkTimer = 0.75;
                _audio.ArcadeAudio.play('hurt');
                this.spawnPopup(this.width / 2, this.height * 0.35, '⏱️ TIME UP — ENEMY TURN!', '#fca5a5');
            }
        }
        var tb = this.getTableRect();
        this.lastTableRect = tb;
        var r = tb.r;
        var pkts = this.pockets(tb);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.balls), _step; !(_step = _iterator()).done;){
            var b = _step.value;
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            var damp = Math.pow(0.28, dt);
            b.vx *= damp;
            b.vy *= damp;
            if (Math.hypot(b.vx, b.vy) < 4) {
                b.vx = 0;
                b.vy = 0;
            }
            if (b.x - r < tb.x) {
                b.x = tb.x + r;
                b.vx = Math.abs(b.vx) * 0.85;
            }
            if (b.x + r > tb.x + tb.w) {
                b.x = tb.x + tb.w - r;
                b.vx = -Math.abs(b.vx) * 0.85;
            }
            if (b.y - r < tb.y) {
                b.y = tb.y + r;
                b.vy = Math.abs(b.vy) * 0.85;
            }
            if (b.y + r > tb.y + tb.h) {
                b.y = tb.y + tb.h - r;
                b.vy = -Math.abs(b.vy) * 0.85;
            }
        }
        for(var i = 0; i < this.balls.length; i++){
            for(var j = i + 1; j < this.balls.length; j++){
                var a = this.balls[i];
                var b1 = this.balls[j];
                var dx = b1.x - a.x;
                var dy = b1.y - a.y;
                var dist = Math.hypot(dx, dy);
                if (dist > 0 && dist < r * 2) {
                    var nx = dx / dist;
                    var ny = dy / dist;
                    var overlap = r * 2 - dist;
                    a.x -= nx * overlap * 0.5;
                    a.y -= ny * overlap * 0.5;
                    b1.x += nx * overlap * 0.5;
                    b1.y += ny * overlap * 0.5;
                    var dvx = a.vx - b1.vx;
                    var dvy = a.vy - b1.vy;
                    var dot = dvx * nx + dvy * ny;
                    if (dot > 0) {
                        a.vx -= dot * nx * 0.94;
                        a.vy -= dot * ny * 0.94;
                        b1.vx += dot * nx * 0.94;
                        b1.vy += dot * ny * 0.94;
                        if (dot > 35) _audio.ArcadeAudio.play('cueHit');
                    }
                }
            }
        }
        var eightBallPocketed = false;
        for(var i1 = this.balls.length - 1; i1 >= 0; i1--)_this = this, _loop(i1);
        if (eightBallPocketed) {
            var remainingColors = this.balls.filter(function(o) {
                return !o.isCue;
            }).length;
            if (this.poolMode === 'solo') {
                if (remainingColors === 0 && !this.shotScratched) {
                    this.score += 250;
                    (0, _runtimeBridge.addCoins)(12);
                    _audio.ArcadeAudio.play('win');
                    (0, _runtimeBridge.addXp)(25);
                    this.level++;
                    this.soloTimeLeft += 35;
                    (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 18);
                    this.spawnPopup(this.width / 2, this.height * 0.35, '🎱 RACK CLEAR! +35s', '#84fab0');
                    this.setupRack();
                } else {
                    _audio.ArcadeAudio.play('hurt');
                    this.gameOverSequence(false);
                    return;
                }
            } else {
                if (remainingColors === 0 && !this.shotScratched) {
                    if (this.turn === 'player') {
                        this.score += 150;
                        (0, _runtimeBridge.addCoins)(8);
                    } else {
                        this.enemyScore += 150;
                    }
                } else {
                    if (this.turn === 'player') this.enemyScore += 150;
                    else this.score += 150;
                }
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 18);
                var winner = (0, _poolRules.resolvePoolWinner)(this.score, this.enemyScore);
                this.gameOverSequence(winner === 'player');
                return;
            }
        }
        // Turn management in VS ENEMY mode
        if (this.poolMode === 'vs' && this.shotActive && !this.ballsMoving()) {
            this.shotActive = false;
            if (!this.shotPocketedAny || this.shotScratched) {
                this.turn = this.turn === 'player' ? 'enemy' : 'player';
            }
            if (this.turn === 'enemy') {
                this.enemyThinkTimer = 0.75;
            } else {
                this.turnTimer = VS_TURN_TIME;
            }
        }
        if (this.poolMode === 'vs' && this.turn === 'enemy' && !this.shotActive && !this.ballsMoving()) {
            this.enemyThinkTimer -= dt;
            if (this.enemyThinkTimer <= 0) {
                this.performEnemyShot();
            }
        }
    };
    _proto.draw = function draw() {
        var ctx = this.ctx;
        var tb = this.getTableRect();
        var r = tb.r;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, this.width, this.height);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.getModeButtons()), _step; !(_step = _iterator()).done;){
            var mb = _step.value;
            var sel = this.poolMode === mb.id;
            ctx.fillStyle = sel ? '#84fab0' : 'rgba(255,255,255,0.12)';
            ctx.strokeStyle = sel ? '#ffffff' : 'rgba(255,255,255,0.28)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(mb.x, mb.y, mb.w, mb.h, 8);
            ctx.fill();
            ctx.stroke();
            ctx.font = '800 11px system-ui, sans-serif';
            ctx.fillStyle = sel ? '#0f172a' : '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(mb.label, mb.x + mb.w / 2, mb.y + Math.round(mb.h * 0.63));
        }
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(tb.x - 14, tb.y - 14, tb.w + 28, tb.h + 28, 16);
        ctx.fill();
        ctx.fillStyle = '#15803d';
        ctx.fillRect(tb.x, tb.y, tb.w, tb.h);
        ctx.fillStyle = '#090d14';
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.pockets(tb)), _step1; !(_step1 = _iterator1()).done;){
            var pk = _step1.value;
            ctx.beginPath();
            ctx.arc(pk.x, pk.y, r * 1.35, 0, Math.PI * 2);
            ctx.fill();
        }
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.balls), _step2; !(_step2 = _iterator2()).done;){
            var b = _step2.value;
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.beginPath();
            ctx.arc(b.x - r * 0.3, b.y - r * 0.3, r * 0.28, 0, Math.PI * 2);
            ctx.fill();
        }
        var cue = this.balls[0];
        if (this.aiming && cue) {
            var dx = this.aiming.sx - this.aiming.cx;
            var dy = this.aiming.sy - this.aiming.cy;
            var pull = Math.min(160, Math.hypot(dx, dy));
            if (pull > 6) {
                var ang = Math.atan2(dy, dx);
                ctx.strokeStyle = 'rgba(255,255,255,0.55)';
                ctx.lineWidth = 2;
                ctx.setLineDash([
                    6,
                    6
                ]);
                ctx.beginPath();
                ctx.moveTo(cue.x, cue.y);
                ctx.lineTo(cue.x + Math.cos(ang) * 160, cue.y + Math.sin(ang) * 160);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.strokeStyle = '#fde68a';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(cue.x - Math.cos(ang) * (r + 8 + pull * 0.25), cue.y - Math.sin(ang) * (r + 8 + pull * 0.25));
                ctx.lineTo(cue.x - Math.cos(ang) * (r + 75 + pull * 0.25), cue.y - Math.sin(ang) * (r + 75 + pull * 0.25));
                ctx.stroke();
            }
        }
        ctx.font = '800 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        if (this.poolMode === 'vs') {
            var clockText = this.turn === 'player' ? "⏱️ " + Math.ceil(this.turnTimer) + "s" : '🤖 ENEMY SHOT';
            ctx.fillStyle = this.turn === 'player' && this.turnTimer <= 5 ? '#ef4444' : this.turn === 'player' ? '#84fab0' : '#fca5a5';
            ctx.fillText("\uD83D\uDC64 You: " + this.score + "  vs  \uD83E\uDD16 Enemy: " + this.enemyScore + "   \xb7   " + clockText, this.width / 2, Math.min(this.height - 10, tb.y + tb.h + 26));
        } else {
            ctx.fillStyle = this.soloTimeLeft <= 12 ? '#ef4444' : '#facc15';
            ctx.fillText("⏱️ Time Left: " + Math.ceil(this.soloTimeLeft) + "s   \xb7   Balls Left: " + this.balls.filter(function(b) {
                return !b.isCue;
            }).length, this.width / 2, Math.min(this.height - 10, tb.y + tb.h + 26));
        }
        ctx.textAlign = 'left';
    };
    return EightBallPool;
}(_BaseGame.BaseGame);

});
// === MODULE: src/games/eight-ball-pool/poolRules ===
ArcadeMod.define("src/games/eight-ball-pool/poolRules", function(require, module, exports) {
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
    get pickBestPoolShot () {
        return pickBestPoolShot;
    },
    get resolvePoolWinner () {
        return resolvePoolWinner;
    }
});
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
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
function resolvePoolWinner(playerScore, enemyScore) {
    if (playerScore > enemyScore) return 'player';
    if (enemyScore > playerScore) return 'enemy';
    return 'draw';
}
function pickBestPoolShot(cue, balls, pockets) {
    var colored = balls.filter(function(b) {
        return !b.isCue && !b.is8;
    });
    var targets = colored.length > 0 ? colored : balls.filter(function(b) {
        return !b.isCue;
    });
    if (targets.length === 0) return {
        angle: 0,
        power: 420
    };
    var bestScore = -Infinity;
    var bestAngle = 0;
    for(var _iterator = _create_for_of_iterator_helper_loose(targets), _step; !(_step = _iterator()).done;){
        var t = _step.value;
        for(var _iterator1 = _create_for_of_iterator_helper_loose(pockets), _step1; !(_step1 = _iterator1()).done;){
            var pk = _step1.value;
            var tpDx = pk.x - t.x;
            var tpDy = pk.y - t.y;
            var tpDist = Math.hypot(tpDx, tpDy) || 1;
            var ctDx = t.x - cue.x;
            var ctDy = t.y - cue.y;
            var ctDist = Math.hypot(ctDx, ctDy) || 1;
            var align = tpDx / tpDist * (ctDx / ctDist) + tpDy / tpDist * (ctDy / ctDist);
            var heuristic = align * 200 - tpDist * 0.22 - ctDist * 0.14;
            if (heuristic > bestScore) {
                bestScore = heuristic;
                // Aim slightly toward the ghost ball spot behind target from pocket
                var aimX = t.x - tpDx / tpDist * 14;
                var aimY = t.y - tpDy / tpDist * 14;
                bestAngle = Math.atan2(aimY - cue.y, aimX - cue.x);
            }
        }
    }
    return {
        angle: bestAngle,
        power: 580
    };
}

});

})(window.ArcadeMod);
