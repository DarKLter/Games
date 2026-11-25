(function(ArcadeMod){
// === MODULE: src/games/stick-war-legacy/StickWarLegacy ===
ArcadeMod.define("src/games/stick-war-legacy/StickWarLegacy", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "StickWarLegacy", {
    enumerable: true,
    get: function() {
        return StickWarLegacy;
    }
});
var _audio = require("../../core/audio");
var _emojiCache = require("../../core/emojiCache");
var _runtimeBridge = require("../../core/runtimeBridge");
var _BaseGame = require("../../core/BaseGame");
var _stickWarLogic = require("./stickWarLogic");
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
var StickWarLegacy = /*#__PURE__*/ function(BaseGame) {
    "use strict";
    _inherits(StickWarLegacy, BaseGame);
    function StickWarLegacy() {
        var _this;
        _this = BaseGame.apply(this, arguments) || this, _this.worldW = 1550, _this.camX = 0, _this.gold = 260, _this.playerStatueHp = 900, _this.playerStatueMax = 900, _this.enemyStatueHp = 850, _this.enemyStatueMax = 850, _this.stance = 'attack', _this.units = [], _this.projectiles = [], _this.enemySpawnTimer = 3.2, _this.groundY = 400, _this.dragCam = null, _this.rageTimer = 0, _this.rageCd = 0, _this.goldRushCd = 0, _this.castleArcherCd = 1.2;
        return _this;
    }
    var _proto = StickWarLegacy.prototype;
    _proto.init = function init() {
        this.worldW = 1550;
        this.camX = 0;
        this.gold = 260;
        this.playerStatueMax = 900;
        this.playerStatueHp = 900;
        this.enemyStatueMax = Math.round(850 * this.scaler.speedMult);
        this.enemyStatueHp = this.enemyStatueMax;
        this.stance = 'attack';
        this.units = [];
        this.projectiles = [];
        this.enemySpawnTimer = 3.0;
        this.rageTimer = 0;
        this.rageCd = 0;
        this.goldRushCd = 0;
        this.castleArcherCd = 1.0;
        this.maxLives = 1;
        this.lives = 1;
        this.spawnUnit('player', 'miner');
        this.spawnUnit('player', 'sword');
        this.spawnUnit('enemy', 'sword');
    };
    _proto.releaseInputs = function releaseInputs() {
        this.dragCam = null;
    };
    _proto.pause = function pause() {
        BaseGame.prototype.pause.call(this);
        this.releaseInputs();
    };
    _proto.setStance = function setStance(next) {
        if (this.gameOver || this.isPaused) return;
        this.stance = next;
        _audio.ArcadeAudio.play('warHorn');
        this.spawnPopup(this.width / 2, this.height * 0.35, "\uD83D\uDCE2 " + next.toUpperCase() + "!", '#ffd700');
    };
    _proto.castRageHorn = function castRageHorn() {
        if (this.gameOver || this.isPaused || this.rageCd > 0) return;
        this.rageTimer = 8;
        this.rageCd = 20;
        _audio.ArcadeAudio.play('warHorn');
        this.spawnPopup(this.width / 2, this.height * 0.32, '🎺 RAGE HORN! 2× SPEED!', '#fb923c');
    };
    _proto.castGoldRush = function castGoldRush() {
        if (this.gameOver || this.isPaused || this.goldRushCd > 0) return;
        this.gold += 140;
        this.goldRushCd = 22;
        _audio.ArcadeAudio.play('coin');
        this.spawnPopup(this.width / 2, this.height * 0.32, '💰 GOLD RUSH +140g!', '#facc15');
    };
    _proto.triggerAction = function triggerAction(actionKey, pressed) {
        if (!pressed || this.gameOver || this.isPaused) return;
        if (actionKey === 'spell1') this.castRageHorn();
        else if (actionKey === 'spell2') this.castGoldRush();
    };
    _proto.trainUnit = function trainUnit(unitIdx) {
        if (this.gameOver || this.isPaused) return;
        var spec = _stickWarLogic.UNIT_CATALOG[unitIdx];
        if (!spec) return;
        if (!(0, _stickWarLogic.canAffordUnit)(this.gold, unitIdx)) {
            _audio.ArcadeAudio.play('hurt');
            this.spawnPopup(this.width / 2, this.height * 0.32, "NEED " + spec.cost + "\uD83E\uDE99 GOLD!", '#ef4444');
            return;
        }
        this.gold -= spec.cost;
        this.spawnUnit('player', spec.id);
        _audio.ArcadeAudio.play('click');
    };
    _proto.spawnUnit = function spawnUnit(side, id) {
        var spec = _stickWarLogic.UNIT_CATALOG.find(function(u) {
            return u.id === id;
        }) || _stickWarLogic.UNIT_CATALOG[1];
        this.units.push({
            side: side,
            spec: spec,
            x: side === 'player' ? 110 + Math.random() * 20 : this.worldW - 110 - Math.random() * 20,
            hp: spec.hp,
            maxHp: spec.hp,
            atkCd: 0.4,
            goldCarried: 0,
            miningDir: 1
        });
    };
    _proto.getTopButtons = function getTopButtons() {
        var isCompactLandscape = this.width > this.height * 1.3 && this.height < 520;
        var topY = this.width < 460 ? 58 : isCompactLandscape ? 12 : 52;
        var leftPad = topY < 56 ? 148 : 9;
        var rightPad = topY < 56 ? 64 : 9;
        var availW = Math.max(220, this.width - leftPad - rightPad);
        var cols = _stickWarLogic.UNIT_CATALOG.length;
        var gap = 3;
        var uW = Math.min(54, Math.floor(availW / cols) - gap);
        var totalUW = cols * (uW + gap) - gap;
        var uStartX = leftPad + (availW - totalUW) / 2;
        var uH = isCompactLandscape ? 38 : 42;
        var unitBtns = _stickWarLogic.UNIT_CATALOG.map(function(u, idx) {
            return {
                idx: idx,
                spec: u,
                x: uStartX + idx * (uW + gap),
                y: topY,
                w: uW,
                h: uH
            };
        });
        var stances = [
            {
                id: 'garrison',
                label: '🏰 RETREAT'
            },
            {
                id: 'defend',
                label: '🛡️ DEFEND'
            },
            {
                id: 'attack',
                label: '⚔️ ATTACK'
            },
            {
                id: 'rage',
                label: this.rageCd > 0 ? "\uD83C\uDFBA " + Math.ceil(this.rageCd) + "s" : '🎺 RAGE'
            },
            {
                id: 'goldrush',
                label: this.goldRushCd > 0 ? "\uD83D\uDCB0 " + Math.ceil(this.goldRushCd) + "s" : '💰 +140g'
            }
        ];
        var sAvailW = Math.max(220, this.width - (topY + uH + 4 < 56 ? 148 + 64 : 20));
        var sLeft = topY + uH + 4 < 56 ? 148 : 10;
        var sW = Math.min(82, Math.floor(sAvailW / stances.length) - 3);
        var totalSW = stances.length * (sW + 3) - 3;
        var sStartX = sLeft + (sAvailW - totalSW) / 2;
        var stanceBtns = stances.map(function(s, idx) {
            return _extends({}, s, {
                x: sStartX + idx * (sW + 3),
                y: topY + uH + 4,
                w: sW,
                h: isCompactLandscape ? 23 : 25
            });
        });
        return {
            unitBtns: unitBtns,
            stanceBtns: stanceBtns
        };
    };
    _proto.onPointerDown = function onPointerDown(x, y) {
        if (this.gameOver || this.isPaused) return;
        var _this_getTopButtons = this.getTopButtons(), unitBtns = _this_getTopButtons.unitBtns, stanceBtns = _this_getTopButtons.stanceBtns;
        for(var _iterator = _create_for_of_iterator_helper_loose(unitBtns), _step; !(_step = _iterator()).done;){
            var ub = _step.value;
            if (x >= ub.x && x <= ub.x + ub.w && y >= ub.y && y <= ub.y + ub.h) {
                this.trainUnit(ub.idx);
                return;
            }
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(stanceBtns), _step1; !(_step1 = _iterator1()).done;){
            var sb = _step1.value;
            if (x >= sb.x && x <= sb.x + sb.w && y >= sb.y && y <= sb.y + sb.h) {
                if (sb.id === 'rage') this.castRageHorn();
                else if (sb.id === 'goldrush') this.castGoldRush();
                else this.setStance(sb.id);
                return;
            }
        }
        this.dragCam = {
            startX: x,
            camStart: this.camX
        };
    };
    _proto.onPointerMove = function onPointerMove(x) {
        if (!this.dragCam || this.gameOver || this.isPaused) return;
        var maxCam = Math.max(0, this.worldW - this.width);
        this.camX = Math.max(0, Math.min(maxCam, this.dragCam.camStart + (this.dragCam.startX - x)));
    };
    _proto.onPointerUp = function onPointerUp() {
        this.dragCam = null;
    };
    _proto.update = function update(dt) {
        if (this.gameOver) return;
        this.survivalElapsed = 0;
        this.groundY = Math.round(this.height * 0.78);
        this.gold += 9 * dt;
        if (this.rageTimer > 0) this.rageTimer -= dt;
        if (this.rageCd > 0) this.rageCd = Math.max(0, this.rageCd - dt);
        if (this.goldRushCd > 0) this.goldRushCd = Math.max(0, this.goldRushCd - dt);
        if (!this.dragCam && this.width < this.worldW) {
            var frontPlayer = 180;
            for(var i = 0; i < this.units.length; i++){
                var u = this.units[i];
                if (u.side === 'player' && u.spec.id !== 'miner' && u.x > frontPlayer) {
                    frontPlayer = u.x;
                }
            }
            var targetCam = Math.max(0, Math.min(this.worldW - this.width, frontPlayer - this.width * 0.45));
            this.camX += (targetCam - this.camX) * (1 - Math.exp(-1.4 * dt));
        }
        // Automated Castle Archers fire when defending/garrisoned and enemies approach Statue
        this.castleArcherCd -= dt;
        if (this.castleArcherCd <= 0 && (this.stance === 'defend' || this.stance === 'garrison')) {
            var threatNear = this.units.some(function(u) {
                return u.side === 'enemy' && u.x < 460;
            });
            if (threatNear) {
                this.castleArcherCd = 0.85;
                this.projectiles.push({
                    side: 'player',
                    kind: 'arrow',
                    x: 92,
                    y: this.groundY - 76,
                    vx: 460,
                    dmg: 18
                });
                _audio.ArcadeAudio.play('arrow');
            }
        }
        // AI wave trainer
        this.enemySpawnTimer -= dt;
        if (this.enemySpawnTimer <= 0) {
            this.enemySpawnTimer = Math.max(2.4, (4.8 - this.level * 0.25) / this.scaler.spawnMult);
            var pool = [
                'sword',
                'archidon',
                'sword',
                'spearton',
                'magikill',
                'albowtross',
                'giant'
            ];
            var maxPool = Math.min(pool.length, 3 + this.level);
            var pick = pool[Math.floor(Math.random() * maxPool)];
            this.spawnUnit('enemy', pick);
        }
        var mineX = 280;
        var playerHomeX = 95;
        var enemyStatueX = this.worldW - 80;
        var playerStatueX = 80;
        var playerBuff = this.rageTimer > 0 ? 1.55 : 1.0;
        for(var i1 = 0; i1 < this.units.length; i1++){
            var u1 = this.units[i1];
            if (u1.atkCd > 0) u1.atkCd -= dt * (u1.side === 'player' ? playerBuff : 1);
            if (u1.spec.id === 'miner' && u1.side === 'player') {
                if (this.stance === 'garrison') {
                    if (u1.x > playerHomeX) u1.x -= u1.spec.speed * dt;
                } else if (u1.miningDir === 1) {
                    if (u1.x < mineX) u1.x += u1.spec.speed * dt;
                    else {
                        u1.goldCarried += 20 * dt;
                        if (u1.goldCarried >= 30) u1.miningDir = -1;
                    }
                } else {
                    if (u1.x > playerHomeX) u1.x -= u1.spec.speed * dt;
                    else {
                        this.gold += Math.round(u1.goldCarried);
                        u1.goldCarried = 0;
                        u1.miningDir = 1;
                        _audio.ArcadeAudio.play('coin');
                    }
                }
                continue;
            }
            // Meric healer heals injured allies behind the frontline
            if (u1.spec.id === 'meric' && u1.side === 'player') {
                var hurtAlly = null;
                var lowestRatio = 1;
                for(var k = 0; k < this.units.length; k++){
                    var a = this.units[k];
                    if (a.side === 'player' && a.hp < a.maxHp && a !== u1) {
                        var ratio = a.hp / a.maxHp;
                        if (ratio < lowestRatio) {
                            lowestRatio = ratio;
                            hurtAlly = a;
                        }
                    }
                }
                if (hurtAlly) {
                    if (Math.abs(hurtAlly.x - u1.x) <= u1.spec.range) {
                        if (u1.atkCd <= 0) {
                            u1.atkCd = 1.1;
                            hurtAlly.hp = Math.min(hurtAlly.maxHp, hurtAlly.hp + u1.spec.dmg);
                            this.spawnParticles(hurtAlly.x - this.camX, this.groundY - 28, '#4ade80', 4, 90);
                        }
                    } else {
                        u1.x += Math.sign(hurtAlly.x - u1.x) * u1.spec.speed * dt;
                    }
                    continue;
                }
            }
            var dir = u1.side === 'player' ? 1 : -1;
            var spdMult = u1.side === 'player' ? playerBuff : 1;
            var nearestFoe = null;
            var nearestDist = Infinity;
            for(var k1 = 0; k1 < this.units.length; k1++){
                var f = this.units[k1];
                if (f.side === u1.side) continue;
                var d = Math.abs(f.x - u1.x);
                if (d < nearestDist) {
                    nearestDist = d;
                    nearestFoe = f;
                }
            }
            var targetStatueX = u1.side === 'player' ? enemyStatueX : playerStatueX;
            var statueDist = Math.abs(targetStatueX - u1.x);
            if (u1.side === 'player' && this.stance === 'garrison') {
                if (u1.x > playerHomeX + 10) u1.x -= u1.spec.speed * 1.15 * dt;
                continue;
            }
            if (u1.side === 'player' && this.stance === 'defend') {
                var rallyX = 380;
                if (nearestFoe && nearestDist <= u1.spec.range) {
                    this.performUnitAttack(u1, nearestFoe, false);
                } else if (Math.abs(u1.x - rallyX) > 20) {
                    u1.x += Math.sign(rallyX - u1.x) * u1.spec.speed * spdMult * dt;
                }
                continue;
            }
            if (nearestFoe && nearestDist <= u1.spec.range) {
                this.performUnitAttack(u1, nearestFoe, false);
            } else if (statueDist <= u1.spec.range + 22) {
                this.performUnitAttack(u1, null, true);
            } else {
                u1.x += dir * u1.spec.speed * spdMult * dt;
            }
        }
        for(var i2 = this.projectiles.length - 1; i2 >= 0; i2--){
            var pr = this.projectiles[i2];
            pr.x += pr.vx * dt;
            var hit = pr.x < 40 || pr.x > this.worldW - 40;
            for(var k2 = 0; k2 < this.units.length; k2++){
                var f1 = this.units[k2];
                if (f1.side === pr.side) continue;
                if (Math.abs(f1.x - pr.x) < 18) {
                    f1.hp -= pr.dmg;
                    hit = true;
                    this.spawnParticles(pr.x - this.camX, pr.y, pr.kind === 'magic' ? '#a855f7' : '#fde047', 6, 120);
                    break;
                }
            }
            if (!hit) {
                if (pr.side === 'player' && Math.abs(pr.x - enemyStatueX) < 28) {
                    this.enemyStatueHp -= (0, _stickWarLogic.computeStatueDamage)(pr.dmg, false);
                    this.score += 10;
                    hit = true;
                } else if (pr.side === 'enemy' && Math.abs(pr.x - playerStatueX) < 28) {
                    this.playerStatueHp -= (0, _stickWarLogic.computeStatueDamage)(pr.dmg, true);
                    hit = true;
                }
            }
            if (hit) this.projectiles.splice(i2, 1);
        }
        for(var i3 = this.units.length - 1; i3 >= 0; i3--){
            var u2 = this.units[i3];
            if (u2.hp <= 0) {
                this.units.splice(i3, 1);
                if (u2.side === 'enemy') {
                    this.score += u2.spec.id === 'giant' ? 120 : 45;
                    this.gold += u2.spec.id === 'giant' ? 40 : 16;
                    (0, _runtimeBridge.addCoins)(u2.spec.id === 'giant' ? 3 : 1);
                    (0, _runtimeBridge.addXp)(7);
                    _audio.ArcadeAudio.play('ko');
                    (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 23);
                }
            }
        }
        if (this.enemyStatueHp <= 0) {
            this.enemyStatueHp = 0;
            this.score += 500;
            (0, _runtimeBridge.addCoins)(25);
            (0, _runtimeBridge.addXp)(60);
            this.level++;
            (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 23);
            this.gameOverSequence(true);
            return;
        } else if (this.playerStatueHp <= 0) {
            this.playerStatueHp = 0;
            this.gameOverSequence(false);
            return;
        }
    };
    _proto.performUnitAttack = function performUnitAttack(u, target, hitStatue) {
        if (u.atkCd > 0) return;
        u.atkCd = u.spec.id === 'giant' ? 1.45 : u.spec.id === 'magikill' ? 1.3 : u.spec.id === 'archidon' || u.spec.id === 'albowtross' ? 0.9 : 0.72;
        if (u.spec.id === 'archidon' || u.spec.id === 'magikill' || u.spec.id === 'albowtross') {
            var dir = u.side === 'player' ? 1 : -1;
            this.projectiles.push({
                side: u.side,
                kind: u.spec.id === 'magikill' ? 'magic' : 'arrow',
                x: u.x + dir * 14,
                y: u.spec.id === 'albowtross' ? this.groundY - 58 : this.groundY - 30,
                vx: dir * 440,
                dmg: u.spec.dmg
            });
            _audio.ArcadeAudio.play(u.spec.id === 'magikill' ? 'magic' : 'arrow');
            return;
        }
        _audio.ArcadeAudio.play(u.spec.id === 'giant' ? 'explosion' : 'sword');
        if (target) {
            target.hp -= u.spec.dmg;
            this.spawnParticles(target.x - this.camX, this.groundY - 28, '#ffd700', 5, 100);
        } else if (hitStatue) {
            if (u.side === 'player') {
                this.enemyStatueHp -= (0, _stickWarLogic.computeStatueDamage)(u.spec.dmg, false);
                this.score += 12;
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 23);
            } else {
                this.playerStatueHp -= (0, _stickWarLogic.computeStatueDamage)(u.spec.dmg, true);
            }
            this.triggerShake(4, 0.1);
        }
    };
    _proto.draw = function draw() {
        var ctx = this.ctx;
        var gY = Math.round(this.height * 0.78);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, this.width, gY);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, gY, this.width, this.height - gY);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(0, gY, this.width, 5);
        ctx.save();
        ctx.translate(-this.camX, 0);
        _emojiCache.EmojiCache.draw(ctx, '🪨', 280, gY - 18, 40);
        _emojiCache.EmojiCache.draw(ctx, '🪙', 284, gY - 26, 22);
        var stH = this.height < 440 ? Math.max(66, Math.round(this.height * 0.21)) : 96;
        var drawStatue = function drawStatue(sx, hp, maxHp, color, label) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(sx - 24, gY - stH, 48, stH, 8);
            ctx.fill();
            _emojiCache.EmojiCache.draw(ctx, '🗿', sx, gY - Math.round(stH * 0.6), Math.round(stH * 0.5));
            ctx.fillStyle = '#000';
            ctx.fillRect(sx - 34, gY - stH - 18, 68, 8);
            ctx.fillStyle = color;
            ctx.fillRect(sx - 34, gY - stH - 18, 68 * Math.max(0, hp / maxHp), 8);
            ctx.font = '800 10px system-ui, sans-serif';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText(label, sx, gY - stH - 24);
        };
        drawStatue(80, this.playerStatueHp, this.playerStatueMax, '#38bdf8', "YOUR STATUE " + Math.ceil(this.playerStatueHp));
        drawStatue(this.worldW - 80, this.enemyStatueHp, this.enemyStatueMax, '#ef4444', "ENEMY " + Math.ceil(this.enemyStatueHp));
        for(var _iterator = _create_for_of_iterator_helper_loose(this.units), _step; !(_step = _iterator()).done;){
            var u = _step.value;
            var isFly = u.spec.id === 'albowtross';
            var isGiant = u.spec.id === 'giant';
            var uy = isFly ? gY - 36 : gY;
            var col = u.side === 'player' ? this.rageTimer > 0 ? '#facc15' : '#84fab0' : '#f87171';
            ctx.strokeStyle = col;
            ctx.lineWidth = isGiant ? 5 : 3.5;
            var headH = isGiant ? 54 : 38;
            ctx.beginPath();
            ctx.arc(u.x, uy - headH, isGiant ? 10 : 7, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(u.x, uy - (headH - 7));
            ctx.lineTo(u.x, uy - 14);
            ctx.moveTo(u.x, uy - 14);
            ctx.lineTo(u.x - 6, uy);
            ctx.moveTo(u.x, uy - 14);
            ctx.lineTo(u.x + 6, uy);
            ctx.stroke();
            _emojiCache.EmojiCache.draw(ctx, u.spec.icon, u.x + (u.side === 'player' ? 12 : -12), uy - 26, isGiant ? 28 : 20);
            ctx.fillStyle = '#000';
            ctx.fillRect(u.x - 14, uy - headH - 16, 28, 3);
            ctx.fillStyle = col;
            ctx.fillRect(u.x - 14, uy - headH - 16, 28 * Math.max(0, u.hp / u.maxHp), 3);
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.projectiles), _step1; !(_step1 = _iterator1()).done;){
            var pr = _step1.value;
            ctx.fillStyle = pr.kind === 'magic' ? '#c084fc' : '#fde047';
            ctx.beginPath();
            ctx.arc(pr.x, pr.y, pr.kind === 'magic' ? 6 : 3.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        var _this_getTopButtons = this.getTopButtons(), unitBtns = _this_getTopButtons.unitBtns, stanceBtns = _this_getTopButtons.stanceBtns;
        for(var _iterator2 = _create_for_of_iterator_helper_loose(unitBtns), _step2; !(_step2 = _iterator2()).done;){
            var ub = _step2.value;
            var ok = this.gold >= ub.spec.cost;
            ctx.fillStyle = ok ? 'rgba(30, 41, 59, 0.92)' : 'rgba(15, 23, 42, 0.7)';
            ctx.strokeStyle = ok ? '#84fab0' : '#475569';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(ub.x, ub.y, ub.w, ub.h, 8);
            ctx.fill();
            ctx.stroke();
            _emojiCache.EmojiCache.draw(ctx, ub.spec.icon, ub.x + ub.w / 2, ub.y + 15, 16);
            ctx.font = '800 9px system-ui, sans-serif';
            ctx.fillStyle = ok ? '#facc15' : '#94a3b8';
            ctx.textAlign = 'center';
            ctx.fillText("" + ub.spec.cost + "g", ub.x + ub.w / 2, ub.y + 36);
        }
        for(var _iterator3 = _create_for_of_iterator_helper_loose(stanceBtns), _step3; !(_step3 = _iterator3()).done;){
            var sb = _step3.value;
            var act = this.stance === sb.id;
            ctx.fillStyle = act ? '#facc15' : sb.id === 'rage' && this.rageCd <= 0 ? '#7c2d12' : sb.id === 'goldrush' && this.goldRushCd <= 0 ? '#713f12' : 'rgba(255,255,255,0.14)';
            ctx.beginPath();
            ctx.roundRect(sb.x, sb.y, sb.w, sb.h, 6);
            ctx.fill();
            ctx.font = '800 9.5px system-ui, sans-serif';
            ctx.fillStyle = act ? '#0f172a' : '#fff';
            ctx.textAlign = 'center';
            ctx.fillText(sb.label, sb.x + sb.w / 2, sb.y + 16);
        }
        var armyCount = 0;
        for(var i = 0; i < this.units.length; i++){
            if (this.units[i].side === 'player') armyCount++;
        }
        ctx.font = '800 13px system-ui, sans-serif';
        ctx.fillStyle = '#facc15';
        ctx.textAlign = 'center';
        ctx.fillText("\uD83E\uDE99 Gold: " + Math.floor(this.gold) + "   \xb7   Army: " + armyCount + (this.rageTimer > 0 ? "   \xb7   \uD83C\uDFBA RAGE " + Math.ceil(this.rageTimer) + "s" : ''), this.width / 2, this.height - 14);
        ctx.textAlign = 'left';
    };
    return StickWarLegacy;
}(_BaseGame.BaseGame);

});
// === MODULE: src/games/stick-war-legacy/stickWarLogic ===
ArcadeMod.define("src/games/stick-war-legacy/stickWarLogic", function(require, module, exports) {
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
    get UNIT_CATALOG () {
        return UNIT_CATALOG;
    },
    get canAffordUnit () {
        return canAffordUnit;
    },
    get computeStatueDamage () {
        return computeStatueDamage;
    }
});
var UNIT_CATALOG = [
    {
        id: 'miner',
        label: 'Miner',
        icon: '⛏️',
        cost: 50,
        hp: 65,
        dmg: 6,
        range: 26,
        speed: 74
    },
    {
        id: 'sword',
        label: 'Sword',
        icon: '🗡️',
        cost: 80,
        hp: 105,
        dmg: 17,
        range: 34,
        speed: 94
    },
    {
        id: 'archidon',
        label: 'Archer',
        icon: '🏹',
        cost: 110,
        hp: 78,
        dmg: 15,
        range: 225,
        speed: 80
    },
    {
        id: 'spearton',
        label: 'Spear',
        icon: '🛡️',
        cost: 160,
        hp: 235,
        dmg: 23,
        range: 42,
        speed: 70
    },
    {
        id: 'magikill',
        label: 'Mage',
        icon: '🪄',
        cost: 240,
        hp: 115,
        dmg: 34,
        range: 210,
        speed: 64
    },
    {
        id: 'giant',
        label: 'Giant',
        icon: '👹',
        cost: 420,
        hp: 560,
        dmg: 60,
        range: 54,
        speed: 46
    },
    {
        id: 'albowtross',
        label: 'Sky',
        icon: '🦅',
        cost: 190,
        hp: 105,
        dmg: 22,
        range: 240,
        speed: 98
    },
    {
        id: 'meric',
        label: 'Medic',
        icon: '🩺',
        cost: 150,
        hp: 95,
        dmg: 16,
        range: 175,
        speed: 76
    }
];
function canAffordUnit(gold, unitIdx) {
    var spec = UNIT_CATALOG[unitIdx];
    return !!spec && gold >= spec.cost;
}
function computeStatueDamage(baseDmg, isEnemyAttack) {
    if (isEnemyAttack === void 0) isEnemyAttack = false;
    return Math.max(1, Math.round(isEnemyAttack ? baseDmg * 0.9 : baseDmg));
}

});

})(window.ArcadeMod);
