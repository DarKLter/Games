(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/engine/PingSystem ===
ArcadeMod.define("src/games/legends-arena/mlbb/engine/PingSystem", function(require, module, exports) {
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
    get MlbbPingSystem () {
        return MlbbPingSystem;
    },
    get describeMapZone () {
        return describeMapZone;
    }
});
var _mapData = require("../data/mapData");
var _CombatMath = require("./CombatMath");
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
function describeMapZone(x, y, expLane, goldLane) {
    if (x < 950 && y > 3050) return 'Blue Base';
    if (x > 3050 && y < 950) return 'Red Base';
    var topDist = Math.min(x, y);
    var botDist = Math.min(_mapData.WORLD_SIZE - x, _mapData.WORLD_SIZE - y);
    var midDist = Math.abs(x + y - _mapData.WORLD_SIZE) / Math.SQRT2;
    if (topDist < 720) return expLane === 'top' ? 'EXP Lane (Top)' : 'Gold Lane (Top)';
    if (botDist < 720) return goldLane === 'bot' ? 'Gold Lane (Bot)' : 'EXP Lane (Bot)';
    if (midDist < 420) return 'Mid Lane';
    if (Math.abs(x - y) < 420) return 'Central River';
    return x + y > _mapData.WORLD_SIZE ? 'Allied Jungle' : 'Enemy Jungle';
}
var MlbbPingSystem = /*#__PURE__*/ function() {
    "use strict";
    function MlbbPingSystem() {
        this.seq = 1;
        this.pings = [];
        this.feed = [];
    }
    var _proto = MlbbPingSystem.prototype;
    _proto.getActivePings = function getActivePings() {
        return this.pings;
    };
    _proto.getFeed = function getFeed() {
        return this.feed.slice(-5);
    };
    _proto.step = function step(dt) {
        for(var i = this.pings.length - 1; i >= 0; i--){
            this.pings[i].ttl -= dt;
            if (this.pings[i].ttl <= 0) {
                this.pings.splice(i, 1);
            }
        }
    };
    /**
   * Non-mutating entity-snapping preview for live Press-and-Drag Pop-Out Tactical Map reticle!
   */ _proto.previewPingTarget = function previewPingTarget(kind, worldX, worldY, team, ctx) {
        var wx = (0, _CombatMath.clamp)(worldX, 80, _mapData.WORLD_SIZE - 80);
        var wy = (0, _CombatMath.clamp)(worldY, 80, _mapData.WORLD_SIZE - 80);
        var enemyHit = ctx.heroes.filter(function(h) {
            return h.alive && h.team !== team && h.visible;
        }).sort(function(a, b) {
            return (0, _CombatMath.dist)(wx, wy, a.x, a.y) - (0, _CombatMath.dist)(wx, wy, b.x, b.y);
        }).find(function(h) {
            return (0, _CombatMath.dist)(wx, wy, h.x, h.y) <= 250;
        });
        if (enemyHit) {
            return {
                snappedX: enemyHit.x,
                snappedY: enemyHit.y,
                snapped: true,
                icon: kind === 'retreat' ? '🛡️' : '⚔️',
                color: kind === 'retreat' ? '#FACC15' : '#FF3B4E',
                label: kind === 'retreat' ? "Watch out for " + enemyHit.name + "!" : "Attack " + enemyHit.name + "!",
                targetType: 'hero'
            };
        }
        var objHit = ctx.objectives.filter(function(o) {
            return o.kind === 'turtle' || o.kind === 'lord';
        }).sort(function(a, b) {
            return (0, _CombatMath.dist)(wx, wy, a.x, a.y) - (0, _CombatMath.dist)(wx, wy, b.x, b.y);
        }).find(function(o) {
            return (0, _CombatMath.dist)(wx, wy, o.x, o.y) <= 290;
        });
        if (objHit) {
            var isLord = objHit.kind === 'lord';
            var label = !objHit.alive && objHit.respawnTimer > 0 ? (isLord ? 'Lord' : 'Turtle') + " spawns in " + (0, _mapData.formatClock)(objHit.respawnTimer) + "!" : kind === 'retreat' ? "Back off from " + (isLord ? 'Lord' : 'Turtle') + "!" : kind === 'gather' ? "Gather at " + (isLord ? 'Lord' : 'Turtle') + "!" : "Attack " + (isLord ? 'Lord' : 'Turtle') + "!";
            return {
                snappedX: objHit.x,
                snappedY: objHit.y,
                snapped: true,
                icon: isLord ? '🐉' : '🐢',
                color: isLord ? '#F59E0B' : '#2CE58B',
                label: label,
                targetType: isLord ? 'lord' : 'turtle'
            };
        }
        var turretHit = ctx.turrets.filter(function(t) {
            return t.alive;
        }).sort(function(a, b) {
            return (0, _CombatMath.dist)(wx, wy, a.x, a.y) - (0, _CombatMath.dist)(wx, wy, b.x, b.y);
        }).find(function(t) {
            return (0, _CombatMath.dist)(wx, wy, t.x, t.y) <= 240;
        });
        if (turretHit) {
            var isAlly = turretHit.team === team;
            var laneName = turretHit.lane === 'crystal' ? 'Base Crystal' : "" + turretHit.lane.toUpperCase() + " Turret";
            return {
                snappedX: turretHit.x,
                snappedY: turretHit.y,
                snapped: true,
                icon: isAlly ? '🛡️' : '🏰',
                color: isAlly ? '#38A3FF' : '#FF3B4E',
                label: isAlly ? "Defend " + laneName + "!" : "Destroy " + laneName + "!",
                targetType: 'turret'
            };
        }
        var bush = (0, _mapData.isPointInBush)(wx, wy, ctx.mapVariant);
        if (bush) {
            return {
                snappedX: bush.cx,
                snappedY: bush.cy,
                snapped: true,
                icon: '👁️',
                color: '#FACC15',
                label: kind === 'gather' ? 'Set ambush in bush!' : 'Watch out for ambush!',
                targetType: 'bush'
            };
        }
        var zone = describeMapZone(wx, wy, ctx.expLane, ctx.goldLane);
        return {
            snappedX: wx,
            snappedY: wy,
            snapped: false,
            icon: kind === 'attack' ? '⚔️' : kind === 'retreat' ? '🛡️' : '🎯',
            color: kind === 'attack' ? '#FF3B4E' : kind === 'retreat' ? '#FACC15' : '#38A3FF',
            label: kind === 'attack' ? "Attack " + zone + "!" : kind === 'retreat' ? "Retreat from " + zone + "!" : "Gather at " + zone + "!",
            targetType: 'lane'
        };
    };
    /**
   * Resolves a drag-to-mark ping (`attack` / `retreat` / `gather`) or Expanded Map tap
   * against live enemies, turrets, Turtle/Lord pits, bushes, or lanes.
   */ _proto.resolveAndEmitPing = function resolveAndEmitPing(kind, worldX, worldY, sender, team, ctx, routePoints) {
        var wx = (0, _CombatMath.clamp)(worldX, 80, _mapData.WORLD_SIZE - 80);
        var wy = (0, _CombatMath.clamp)(worldY, 80, _mapData.WORLD_SIZE - 80);
        // 1. Drawn "On My Way" Route Trail
        if (kind === 'omw' && routePoints && routePoints.length >= 2) {
            var end = routePoints[routePoints.length - 1];
            var zone = describeMapZone(end.x, end.y, ctx.expLane, ctx.goldLane);
            return this.pushPing({
                x: end.x,
                y: end.y,
                kind: 'omw',
                color: '#22D3EE',
                icon: '🧭',
                label: "On My Way to " + zone + "!",
                sender: sender,
                team: team,
                targetType: 'route',
                routePoints: routePoints,
                ttl: 5.5
            });
        }
        // 2. Check nearby visible Enemy Hero (within 240 units)
        var enemyHit = ctx.heroes.filter(function(h) {
            return h.alive && h.team !== team && h.visible;
        }).sort(function(a, b) {
            return (0, _CombatMath.dist)(wx, wy, a.x, a.y) - (0, _CombatMath.dist)(wx, wy, b.x, b.y);
        }).find(function(h) {
            return (0, _CombatMath.dist)(wx, wy, h.x, h.y) <= 250;
        });
        if (enemyHit) {
            var verb = kind === 'retreat' ? "Watch out for " + enemyHit.name + "!" : kind === 'missing' ? "Enemy " + enemyHit.name + " Missing!" : "Launch Attack on " + enemyHit.name + "!";
            return this.pushPing({
                x: enemyHit.x,
                y: enemyHit.y,
                kind: kind === 'retreat' ? 'retreat' : 'attack',
                color: kind === 'retreat' ? '#FACC15' : '#FF3B4E',
                icon: kind === 'retreat' ? '🛡️' : '⚔️',
                label: verb,
                sender: sender,
                team: team,
                targetHeroId: enemyHit.id,
                targetType: 'hero',
                ttl: 5.0
            });
        }
        // 3. Check Turtle / Lord pit (within 280 units)
        var objHit = ctx.objectives.filter(function(o) {
            return o.kind === 'turtle' || o.kind === 'lord';
        }).sort(function(a, b) {
            return (0, _CombatMath.dist)(wx, wy, a.x, a.y) - (0, _CombatMath.dist)(wx, wy, b.x, b.y);
        }).find(function(o) {
            return (0, _CombatMath.dist)(wx, wy, o.x, o.y) <= 290;
        });
        if (objHit) {
            var isLord = objHit.kind === 'lord';
            var label;
            if (!objHit.alive && objHit.respawnTimer > 0) {
                label = (isLord ? 'Lord' : 'Turtle') + " spawns in " + (0, _mapData.formatClock)(objHit.respawnTimer) + "!";
            } else if (kind === 'retreat') {
                label = "Back off from " + (isLord ? 'the Lord' : 'the Turtle') + "!";
            } else if (kind === 'gather') {
                label = "Gather at " + (isLord ? 'the Lord' : 'the Turtle') + "!";
            } else {
                label = "Attack " + (isLord ? 'the Lord' : 'the Turtle') + "!";
            }
            return this.pushPing({
                x: objHit.x,
                y: objHit.y,
                kind: kind === 'retreat' ? 'retreat' : kind === 'gather' ? 'gather' : 'attack',
                color: isLord ? '#F59E0B' : '#2CE58B',
                icon: isLord ? '🐉' : '🐢',
                label: label,
                sender: sender,
                team: team,
                targetType: isLord ? 'lord' : 'turtle',
                ttl: 5.2
            });
        }
        // 4. Check Turret / Crystal (within 230 units)
        var turretHit = ctx.turrets.filter(function(t) {
            return t.alive;
        }).sort(function(a, b) {
            return (0, _CombatMath.dist)(wx, wy, a.x, a.y) - (0, _CombatMath.dist)(wx, wy, b.x, b.y);
        }).find(function(t) {
            return (0, _CombatMath.dist)(wx, wy, t.x, t.y) <= 240;
        });
        if (turretHit) {
            var isAlly = turretHit.team === team;
            var laneName = turretHit.lane === 'crystal' ? 'Base Crystal' : "" + turretHit.lane.toUpperCase() + " Turret";
            var label1 = isAlly ? "Defend the " + laneName + "!" : kind === 'retreat' ? "Retreat from " + laneName + "!" : "Attack the " + laneName + "!";
            return this.pushPing({
                x: turretHit.x,
                y: turretHit.y,
                kind: isAlly ? 'gather' : kind === 'retreat' ? 'retreat' : 'attack',
                color: isAlly ? '#38A3FF' : '#FF3B4E',
                icon: isAlly ? '🛡️' : '🏰',
                label: label1,
                sender: sender,
                team: team,
                targetType: 'turret',
                ttl: 4.8
            });
        }
        // 5. Check Tall Bush (Ambush Warning!)
        var bush = (0, _mapData.isPointInBush)(wx, wy, ctx.mapVariant);
        if (bush) {
            var label2 = kind === 'gather' ? 'Set an ambush in this bush!' : 'Watch out for ambush here!';
            return this.pushPing({
                x: bush.cx,
                y: bush.cy,
                kind: kind === 'gather' ? 'gather' : 'retreat',
                color: '#FACC15',
                icon: '👁️',
                label: label2,
                sender: sender,
                team: team,
                targetType: 'bush',
                ttl: 4.8
            });
        }
        // 6. Fallback: Lane / Zone ping (or Enemy Missing when kind === 'missing')
        var zone1 = describeMapZone(wx, wy, ctx.expLane, ctx.goldLane);
        if (kind === 'missing') {
            var hiddenEnemy = ctx.heroes.find(function(h) {
                return h.alive && h.team !== team && !h.visible;
            });
            var label3 = hiddenEnemy ? "Enemy " + hiddenEnemy.name + " Missing!" : "Enemy Missing near " + zone1 + "!";
            return this.pushPing({
                x: wx,
                y: wy,
                kind: 'missing',
                color: '#FACC15',
                icon: '❓',
                label: label3,
                sender: sender,
                team: team,
                targetType: 'lane',
                ttl: 4.5
            });
        }
        var color = kind === 'attack' ? '#FF3B4E' : kind === 'retreat' ? '#FACC15' : '#38A3FF';
        var icon = kind === 'attack' ? '⚔️' : kind === 'retreat' ? '🛡️' : '🎯';
        var label4 = kind === 'attack' ? "Launch Attack at " + zone1 + "!" : kind === 'retreat' ? "Retreat from " + zone1 + "!" : "Gather at " + zone1 + "!";
        return this.pushPing({
            x: wx,
            y: wy,
            kind: kind,
            color: color,
            icon: icon,
            label: label4,
            sender: sender,
            team: team,
            targetType: 'lane',
            ttl: 4.5
        });
    };
    /**
   * Broadcasts Cooldown, Gold, Status, or Scoreboard enemy spell alerts.
   */ _proto.emitStatusSignal = function emitStatusSignal(sender, text, icon, color) {
        if (icon === void 0) icon = '📡';
        if (color === void 0) color = '#38BDF8';
        var id = this.seq++;
        this.feed.push({
            id: id,
            kind: 'status',
            icon: icon,
            color: color,
            text: sender + ": " + text
        });
        if (this.feed.length > 10) this.feed.shift();
    };
    /**
   * Returns the highest-priority active player ping so allied AI bots dynamically rotate,
   * focus marked targets, contest objectives, or fall back.
   */ _proto.getActiveBotPingOrder = function getActiveBotPingOrder(team, botX, botY) {
        for(var i = this.pings.length - 1; i >= 0; i--){
            var p = this.pings[i];
            if (p.team !== team) continue;
            if (p.kind !== 'attack' && p.kind !== 'gather' && p.kind !== 'retreat' && p.kind !== 'omw') continue;
            // Bots within 1850 units respond to tactical beacons (global for Turtle/Lord!)
            var maxRange = p.targetType === 'turtle' || p.targetType === 'lord' ? 3200 : 1850;
            if ((0, _CombatMath.dist)(botX, botY, p.x, p.y) <= maxRange) {
                return {
                    pingId: p.id,
                    kind: p.kind,
                    x: p.x,
                    y: p.y,
                    targetHeroId: p.targetHeroId,
                    label: p.label
                };
            }
        }
        return null;
    };
    _proto.pushPing = function pushPing(opts) {
        var ping = _extends({}, opts, {
            id: this.seq++,
            maxTtl: opts.ttl
        });
        this.pings.push(ping);
        if (this.pings.length > 12) this.pings.shift();
        this.feed.push({
            id: ping.id,
            kind: ping.kind,
            icon: ping.icon,
            color: ping.color,
            text: ping.sender + ": " + ping.label
        });
        if (this.feed.length > 10) this.feed.shift();
        return ping;
    };
    return MlbbPingSystem;
}();

});
// === MODULE: src/games/legends-arena/mlbb/engine/Renderer ===
ArcadeMod.define("src/games/legends-arena/mlbb/engine/Renderer", function(require, module, exports) {
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
    get renderBattlefield () {
        return renderBattlefield;
    },
    get renderMinimap () {
        return renderMinimap;
    }
});
var _mapData = require("../data/mapData");
var _BattlefieldSystems = require("./BattlefieldSystems");
var _CombatMath = require("./CombatMath");
var _VfxSystem = require("./VfxSystem");
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
function renderBattlefield(ctx, width, height, state) {
    var _loop = function() {
        var h = _step8.value;
        var _h_eggFormTimer;
        var isEgg = !h.alive && ((_h_eggFormTimer = h.eggFormTimer) != null ? _h_eggFormTimer : 0) > 0;
        if (!h.alive && !isEgg) return "continue";
        // True VisionSystem Fog of War / Bush Stealth check for red enemies
        if (h.team === 'red' && !state.visibleEnemyIds.has(h.id)) {
            return "continue";
        }
        if (h.x < minX - 160 || h.x > maxX + 160 || h.y < minY - 160 || h.y > maxY + 160) return "continue";
        var sil = (0, _VfxSystem.resolveHeroSilhouetteState)(h);
        var drawRadius = h.radius * sil.modelScale;
        var leapOffsetPx = sil.leapZ * 18;
        var drawY = h.y - leapOffsetPx;
        // Render Hirara's Active Astral Prisms on the battlefield
        if (h.hiraraPrisms && h.hiraraPrisms.length > 0) {
            for(var _iterator = _create_for_of_iterator_helper_loose(h.hiraraPrisms), _step; !(_step = _iterator()).done;){
                var pr = _step.value;
                ctx.save();
                ctx.translate(pr.x, pr.y);
                ctx.rotate(state.matchTimeSec * 2.4);
                ctx.beginPath();
                ctx.moveTo(0, -18);
                ctx.lineTo(14, 0);
                ctx.lineTo(0, 18);
                ctx.lineTo(-14, 0);
                ctx.closePath();
                ctx.fillStyle = 'rgba(56,189,248,0.45)';
                ctx.fill();
                ctx.strokeStyle = '#E879F9';
                ctx.lineWidth = 2.5;
                ctx.stroke();
                ctx.restore();
            }
        }
        // Render Snapback Anchor beacon (Alice S1, Harley S2, Claude S2, Hayabusa S2)
        if (h.snapbackAnchor && h.snapbackAnchor.ttl > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(h.snapbackAnchor.x, h.snapbackAnchor.y, 24, 0, Math.PI * 2);
            ctx.strokeStyle = '#FACC15';
            ctx.setLineDash([
                6,
                4
            ]);
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
        }
        ctx.save();
        if (sil.translucent) {
            ctx.globalAlpha = sil.opacity;
        }
        // Locked target indicator ring
        if (state.lockedTargetId === h.id) {
            ctx.beginPath();
            ctx.arc(h.x, drawY, drawRadius + 14, 0, Math.PI * 2);
            ctx.strokeStyle = '#EF4444';
            ctx.lineWidth = 4;
            ctx.setLineDash([
                8,
                6
            ]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        // Separated Ground Shadow (shrinks dynamically during Parabolic Leap Z-arc!)
        if (state.settings.basics.shadows) {
            var shadowShrink = Math.max(0.5, 1 - sil.leapZ * 0.09);
            ctx.beginPath();
            ctx.ellipse(h.x + 5, h.y + 16, drawRadius * 0.92 * shadowShrink, drawRadius * 0.56 * shadowShrink, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.42)';
            ctx.fill();
        }
        // Layer 2 Silhouette Shader: Gold CC-Immune Outline, White/Cyan Shield Dome, Frost Cage, Car Turbo Aura
        if (sil.goldCcImmune) {
            ctx.beginPath();
            ctx.arc(h.x, drawY, drawRadius + 10, 0, Math.PI * 2);
            ctx.strokeStyle = sil.deathImmune ? '#4ADE80' : '#FACC15';
            ctx.lineWidth = 4.5;
            ctx.stroke();
        }
        if (sil.cyanShielded) {
            ctx.beginPath();
            ctx.arc(h.x, drawY, drawRadius + 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(56,189,248,0.16)';
            ctx.fill();
            ctx.strokeStyle = '#E0F2FE';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        if (sil.frostFrozen) {
            ctx.beginPath();
            ctx.arc(h.x, drawY, drawRadius + 12, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(56,189,248,0.35)';
            ctx.fill();
            ctx.strokeStyle = '#BAE6FD';
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        if (sil.carForm) {
            ctx.beginPath();
            ctx.arc(h.x, drawY, drawRadius + 13, 0, Math.PI * 2);
            ctx.strokeStyle = '#38BDF8';
            ctx.lineWidth = 5;
            ctx.setLineDash([
                10,
                5
            ]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        if (h.recalling) {
            var prog = 1 - h.recallTimer / 4.0;
            ctx.beginPath();
            ctx.arc(h.x, drawY, drawRadius + 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
            ctx.strokeStyle = '#38BDF8';
            ctx.lineWidth = 5;
            ctx.stroke();
        }
        // Orbiting Blades / Flowers (Saber, Carmilla, Cyclops)
        if (h.orbitBlades > 0 && h.orbitTimer > 0) {
            for(var i = 0; i < h.orbitBlades; i++){
                var ba = state.matchTimeSec * 4.2 + i * Math.PI * 2 / h.orbitBlades;
                var bx = h.x + Math.cos(ba) * 86;
                var by = drawY + Math.sin(ba) * 86;
                ctx.beginPath();
                ctx.arc(bx, by, 9, 0, Math.PI * 2);
                ctx.fillStyle = h.heroDef.id === 'carmilla' ? '#FB7185' : '#22D3EE';
                ctx.fill();
            }
        }
        // Hero Circle + Directional Weapon Notch (Red Hit-Flash & Dynamic Scale!)
        ctx.beginPath();
        ctx.arc(h.x, drawY, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = sil.redHitFlash ? '#FCA5A5' : sil.eggForm ? '#FEF08A' : h.skinColor;
        ctx.fill();
        ctx.lineWidth = h.isPlayer ? 4.5 : 3;
        ctx.strokeStyle = sil.redHitFlash ? '#EF4444' : h.isPlayer ? '#FACC15' : h.team === 'blue' ? '#38BDF8' : '#FB7185';
        ctx.stroke();
        // Facing pointer
        var fx = h.x + Math.cos(h.facing) * (drawRadius + 7);
        var fy = drawY + Math.sin(h.facing) * (drawRadius + 7);
        ctx.beginPath();
        ctx.arc(fx, fy, 6, 0, Math.PI * 2);
        ctx.fillStyle = h.skinAccent;
        ctx.fill();
        // Hero Icon/Monogram
        ctx.font = "bold " + Math.round(21 * sil.modelScale) + "px sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(sil.eggForm ? '🥚' : sil.carForm ? '🏎️' : h.heroDef.weaponIcon, h.x, drawY + 1);
        // Tether line (Estes heal / Angela root)
        if (h.tetherTargetId && h.tetherTimer > 0) {
            var tHero = state.heroes.find(function(x) {
                return x.id === h.tetherTargetId && x.alive;
            });
            if (tHero) {
                ctx.beginPath();
                ctx.moveTo(h.x, drawY);
                ctx.lineTo(tHero.x, tHero.y);
                ctx.strokeStyle = h.tetherKind === 'heal' ? '#2CE58B' : '#E879F9';
                ctx.lineWidth = 4;
                ctx.stroke();
            }
        }
        // Overhead MLBB Health Bar + Delayed Catch-Up Trail + Shield + Mana + Level Badge
        ctx.globalAlpha = 1;
        var bw = 90;
        var bh = 10;
        var bx1 = h.x - bw / 2;
        var by1 = drawY - drawRadius - 30;
        // Name label
        ctx.fillStyle = h.isPlayer ? '#FDE047' : '#E2E8F0';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(h.heroDef.name, h.x, by1 - 8);
        // Bar Frame
        ctx.fillStyle = 'rgba(8,12,24,0.9)';
        ctx.fillRect(bx1 - 1, by1 - 1, bw + 2, bh + 6);
        // Delayed Catch-up Trail Bar (White/Amber)
        var trailW = bw * Math.max(0, Math.min(1, h.hpTrail / h.maxHp));
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(bx1, by1, trailW, bh);
        // Live HP Bar
        var hpW = bw * Math.max(0, Math.min(1, h.hp / h.maxHp));
        ctx.fillStyle = h.isPlayer ? '#2CE58B' : h.team === 'blue' ? '#38BDF8' : '#EF4444';
        ctx.fillRect(bx1, by1, hpW, bh);
        // Shield Overlay (White/Cyan bar over HP)
        if (h.shield > 0) {
            var shW = bw * Math.min(1, h.shield / h.maxHp);
            ctx.fillStyle = 'rgba(224,242,254,0.92)';
            ctx.fillRect(bx1 + Math.max(0, hpW - shW), by1, shW, 5);
        }
        // 1000-HP Segment Ticks
        var segs = Math.floor(h.maxHp / 1000);
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        for(var s = 1; s <= segs; s++){
            var sxTick = bx1 + s * 1000 * bw / h.maxHp;
            ctx.fillRect(sxTick, by1, 1.5, bh);
        }
        // Mana/Energy thin strip
        if (h.heroDef.resource !== 'none') {
            ctx.fillStyle = '#3B82F6';
            ctx.fillRect(bx1, by1 + bh + 1, bw * Math.max(0, h.mana / Math.max(1, h.maxMana)), 3);
        }
        // Level Badge left of bar
        ctx.beginPath();
        ctx.arc(bx1 - 11, by1 + 6, 11, 0, Math.PI * 2);
        ctx.fillStyle = '#0F172A';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#F5C451';
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px monospace';
        ctx.fillText("" + h.level, bx1 - 11, by1 + 7);
        // Layer 4: Overhead Stack Badge & Active CC Status Pill
        var stackBadge = (0, _VfxSystem.getHeroStackBadge)(h);
        if (stackBadge) {
            ctx.fillStyle = 'rgba(11,19,43,0.86)';
            ctx.fillRect(h.x - 32, by1 + bh + 6, 64, 13);
            ctx.fillStyle = stackBadge.color;
            ctx.font = 'bold 9px monospace';
            ctx.fillText(stackBadge.label, h.x, by1 + bh + 15);
        }
        var ccBadge = (0, _VfxSystem.getHeroCcBadge)(h);
        if (ccBadge) {
            ctx.fillStyle = ccBadge.bg;
            ctx.fillRect(h.x - 38, by1 - 32, 76, 15);
            ctx.fillStyle = ccBadge.color;
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText(ccBadge.text, h.x, by1 - 21);
        }
        // Overhead Eye Icon (👁️) when spotted by enemy vision (especially inside a bush!)
        if (h.team === 'blue' && h.spottedByEnemy && (h.inBush || h.isPlayer)) {
            var eyeY = by1 - (h.ccType ? 38 : 25);
            ctx.save();
            ctx.beginPath();
            ctx.arc(h.x, eyeY, 12, 0, Math.PI * 2);
            ctx.fillStyle = h.inBush ? 'rgba(239,68,68,0.92)' : 'rgba(250,204,21,0.88)';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('👁', h.x, eyeY + 1);
            ctx.restore();
        }
        // Floating Hero Emote Bubble
        if (h.activeEmote && h.activeEmote.ttl > 0) {
            var ey = by1 - 54;
            ctx.save();
            ctx.fillStyle = 'rgba(11,19,43,0.92)';
            ctx.strokeStyle = h.activeEmote.color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(h.x - 42, ey - 18, 84, 34, 14);
            ctx.fill();
            ctx.stroke();
            ctx.font = '16px sans-serif';
            ctx.fillText(h.activeEmote.icon, h.x - 22, ey);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(h.activeEmote.callout, h.x + 12, ey);
            ctx.restore();
        }
        ctx.restore();
    };
    var _MAP_THEMES_state_mapTheme;
    var theme = (_MAP_THEMES_state_mapTheme = _mapData.MAP_THEMES[state.mapTheme]) != null ? _MAP_THEMES_state_mapTheme : _mapData.MAP_THEMES.imperial_sanctuary;
    var player = state.heroes.find(function(h) {
        return h.isPlayer;
    });
    ctx.save();
    ctx.fillStyle = theme.grassA;
    ctx.fillRect(0, 0, width, height);
    // Screen shake offset
    var shakeX = 0;
    var shakeY = 0;
    if (state.settings.basics.screenShake && state.shakeTimer > 0) {
        var mag = Math.min(7, state.shakeTimer * 28);
        shakeX = (Math.random() - 0.5) * mag;
        shakeY = (Math.random() - 0.5) * mag;
    }
    ctx.translate(width / 2 + shakeX, height / 2 + shakeY);
    ctx.scale(state.zoom, state.zoom);
    ctx.translate(-state.camX, -state.camY);
    var halfW = width / (2 * state.zoom) + 280;
    var halfH = height / (2 * state.zoom) + 280;
    var minX = Math.max(0, state.camX - halfW);
    var maxX = Math.min(_mapData.WORLD_SIZE, state.camX + halfW);
    var minY = Math.max(0, state.camY - halfH);
    var maxY = Math.min(_mapData.WORLD_SIZE, state.camY + halfH);
    // 1. Tiled grass texture
    var tile = 200;
    var sx = Math.floor(minX / tile) * tile;
    var sy = Math.floor(minY / tile) * tile;
    for(var gx = sx; gx < maxX; gx += tile){
        for(var gy = sy; gy < maxY; gy += tile){
            if ((gx / tile + gy / tile & 1) === 0) {
                ctx.fillStyle = theme.grassB;
                ctx.fillRect(gx, gy, tile, tile);
            }
        }
    }
    // 2. Stone Lanes (3-lane Land of Dawn or 1-lane Brawl Mid)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    var drawLanePath = function drawLanePath(pts, laneW) {
        ctx.beginPath();
        pts.forEach(function(param, i) {
            var x = param[0], y = param[1];
            return i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.strokeStyle = theme.laneBorder;
        ctx.lineWidth = laneW + 22;
        ctx.stroke();
        ctx.strokeStyle = theme.laneStone;
        ctx.lineWidth = laneW;
        ctx.stroke();
    };
    if (!state.isBrawl) {
        drawLanePath([
            [
                420,
                3480
            ],
            [
                420,
                420
            ],
            [
                3480,
                420
            ]
        ], 210);
        drawLanePath([
            [
                520,
                3580
            ],
            [
                3580,
                3580
            ],
            [
                3580,
                520
            ]
        ], 210);
    }
    drawLanePath([
        [
            520,
            3480
        ],
        [
            3480,
            520
        ]
    ], state.isBrawl ? 300 : 210);
    // 3. Diagonal Flowing River (Top-Left to Bottom-Right, widened for Expanding Rivers!)
    if (!state.isBrawl) {
        var expanding = state.mapVariant === 'expanding_rivers';
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(280, 280);
        ctx.lineTo(3720, 3720);
        ctx.strokeStyle = theme.riverA;
        ctx.lineWidth = expanding ? 360 : 230;
        ctx.stroke();
        ctx.strokeStyle = theme.riverB;
        ctx.lineWidth = expanding ? 260 : 155;
        ctx.stroke();
        if (expanding) {
            ctx.fillStyle = theme.riverB + '66';
            ctx.beginPath();
            ctx.arc(1420, 1650, 210, 0, Math.PI * 2);
            ctx.arc(2580, 2350, 210, 0, Math.PI * 2);
            ctx.fill();
        }
        // Animated water ripples
        ctx.strokeStyle = expanding ? 'rgba(186,230,253,0.34)' : 'rgba(255,255,255,0.18)';
        ctx.lineWidth = expanding ? 7 : 5;
        var waveOff = state.matchTimeSec * (expanding ? 72 : 45) % 140;
        for(var t = 400 + waveOff; t < 3600; t += 140){
            ctx.beginPath();
            ctx.moveTo(t - 24, t + 24);
            ctx.lineTo(t + 24, t - 24);
            ctx.stroke();
        }
        ctx.restore();
    }
    // 4. Blue & Red Base Plazas & Fountains
    var drawBasePlaza = function drawBasePlaza(cx, cy, color, ringColor) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, 460, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15,23,42,0.28)';
        ctx.fill();
        ctx.lineWidth = 10;
        ctx.strokeStyle = ringColor;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 185, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    };
    drawBasePlaza(_mapData.BLUE_FOUNTAIN.x, _mapData.BLUE_FOUNTAIN.y, 'rgba(34,211,238,0.22)', 'rgba(56,189,248,0.65)');
    drawBasePlaza(_mapData.RED_FOUNTAIN.x, _mapData.RED_FOUNTAIN.y, 'rgba(244,63,94,0.22)', 'rgba(244,63,94,0.65)');
    // 5. Flying Cloud Launch Pad (2026 Variant)
    if (state.mapVariant === 'flying_cloud' && !state.isBrawl) {
        ctx.save();
        var ready = state.flyingCloudCd <= 0;
        ctx.beginPath();
        ctx.arc(_mapData.FLYING_CLOUD_BLUE.x, _mapData.FLYING_CLOUD_BLUE.y, _mapData.FLYING_CLOUD_BLUE.radius, 0, Math.PI * 2);
        ctx.fillStyle = ready ? 'rgba(192,132,252,0.34)' : 'rgba(148,163,184,0.18)';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = ready ? '#E879F9' : '#64748B';
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☁️', _mapData.FLYING_CLOUD_BLUE.x, _mapData.FLYING_CLOUD_BLUE.y);
        ctx.restore();
    }
    // 6. Cyclone Eyes (River Wind Vortices)
    if (!state.isBrawl) {
        for(var _iterator = _create_for_of_iterator_helper_loose(_mapData.CYCLONE_EYES), _step; !(_step = _iterator()).done;){
            var ce = _step.value;
            var _state_cycloneCds_ce_id;
            if (ce.x < minX || ce.x > maxX || ce.y < minY || ce.y > maxY) continue;
            var cd = (_state_cycloneCds_ce_id = state.cycloneCds[ce.id]) != null ? _state_cycloneCds_ce_id : 0;
            ctx.save();
            ctx.translate(ce.x, ce.y);
            ctx.rotate(state.matchTimeSec * (cd <= 0 ? 3.2 : 0.4));
            ctx.beginPath();
            ctx.arc(0, 0, 44, 0, Math.PI * 1.5);
            ctx.strokeStyle = cd <= 0 ? '#38BDF8' : 'rgba(148,163,184,0.35)';
            ctx.lineWidth = 6;
            ctx.stroke();
            ctx.restore();
        }
    }
    // 7. Jungle Walls & Purple Buff Shortcut Passages (or Broken Walls variant)
    if (!state.isBrawl) {
        for(var _iterator1 = _create_for_of_iterator_helper_loose((0, _mapData.getActiveMapWalls)(state.mapVariant)), _step1; !(_step1 = _iterator1()).done;){
            var w = _step1.value;
            var _state_campSlainShortcut_w_shortcutCampId;
            if (w.x + w.w < minX || w.x > maxX || w.y + w.h < minY || w.y > maxY) continue;
            var shortcutOpen = w.shortcutCampId && ((_state_campSlainShortcut_w_shortcutCampId = state.campSlainShortcut[w.shortcutCampId]) != null ? _state_campSlainShortcut_w_shortcutCampId : 0) > 0;
            ctx.save();
            if (shortcutOpen) {
                ctx.strokeStyle = 'rgba(44,229,139,0.55)';
                ctx.setLineDash([
                    10,
                    8
                ]);
                ctx.lineWidth = 4;
                ctx.strokeRect(w.x, w.y, w.w, w.h);
            } else {
                if (state.settings.basics.shadows) {
                    ctx.fillStyle = 'rgba(0,0,0,0.35)';
                    ctx.fillRect(w.x + 8, w.y + 12, w.w, w.h);
                }
                ctx.fillStyle = theme.wall;
                ctx.fillRect(w.x, w.y, w.w, w.h);
                ctx.strokeStyle = theme.laneBorder;
                ctx.lineWidth = 3;
                ctx.strokeRect(w.x, w.y, w.w, w.h);
            }
            ctx.restore();
        }
    }
    // 7B. Temporary Terrain Barriers (Badang Rock Wall, Grock Guardian's Barrier)
    if (state.tempWalls && state.tempWalls.length > 0) {
        for(var _iterator2 = _create_for_of_iterator_helper_loose(state.tempWalls), _step2; !(_step2 = _iterator2()).done;){
            var tw = _step2.value;
            ctx.save();
            ctx.fillStyle = tw.color;
            ctx.globalAlpha = Math.min(0.92, tw.ttl / Math.max(0.1, tw.maxTtl) * 1.4);
            ctx.fillRect(tw.x, tw.y, tw.w, tw.h);
            ctx.strokeStyle = '#FEF08A';
            ctx.lineWidth = 3;
            ctx.strokeRect(tw.x, tw.y, tw.w, tw.h);
            ctx.restore();
        }
    }
    // 8. Revealing Wisps (2026 Variant)
    for(var _iterator3 = _create_for_of_iterator_helper_loose(state.wisps), _step3; !(_step3 = _iterator3()).done;){
        var wisp = _step3.value;
        ctx.save();
        ctx.beginPath();
        ctx.arc(wisp.x, wisp.y, wisp.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56,189,248,0.12)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(56,189,248,0.55)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(wisp.x, wisp.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#E0F2FE';
        ctx.fill();
        ctx.restore();
    }
    // 9. Turrets & Crystals with 3-State Range Ring
    for(var _iterator4 = _create_for_of_iterator_helper_loose(state.turrets), _step4; !(_step4 = _iterator4()).done;){
        var t1 = _step4.value;
        if (!t1.alive) continue;
        if (t1.x < minX - 420 || t1.x > maxX + 420 || t1.y < minY - 420 || t1.y > maxY + 420) continue;
        // 3-State Turret Range Ring (Green safe, Yellow caution, Red locked + Laser Tether)
        if (t1.team === 'red' && player && player.alive && (0, _CombatMath.dist)(player.x, player.y, t1.x, t1.y) < t1.range + 280) {
            var ringState = (0, _BattlefieldSystems.computeTurretRingState)(t1, player.id, player.team, state.minions);
            var playerTargeted = ringState === 'locked';
            var pulse = playerTargeted ? 0.65 + Math.sin(state.matchTimeSec * 16) * 0.35 : 1;
            ctx.save();
            ctx.beginPath();
            ctx.arc(t1.x, t1.y, t1.range, 0, Math.PI * 2);
            ctx.lineWidth = playerTargeted ? 5 : 2.5;
            ctx.strokeStyle = playerTargeted ? "rgba(239,68,68," + pulse.toFixed(2) + ")" : ringState === 'safe' ? '#2CE58B' : '#FACC15';
            ctx.fillStyle = playerTargeted ? "rgba(239,68,68," + (0.11 * pulse).toFixed(2) + ")" : ringState === 'safe' ? 'rgba(44,229,139,0.06)' : 'rgba(250,204,21,0.08)';
            ctx.fill();
            ctx.stroke();
            if (playerTargeted) {
                ctx.beginPath();
                ctx.moveTo(t1.x, t1.y - 18);
                ctx.lineTo(player.x, player.y);
                ctx.strokeStyle = "rgba(255,59,78," + pulse.toFixed(2) + ")";
                ctx.lineWidth = 4;
                ctx.setLineDash([
                    12,
                    6
                ]);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            ctx.restore();
        }
        // Turret / Crystal Body
        var r = t1.tier === 4 ? 72 : 46;
        ctx.save();
        if (state.settings.basics.shadows) {
            ctx.beginPath();
            ctx.ellipse(t1.x + 8, t1.y + 18, r * 0.95, r * 0.6, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(t1.x, t1.y, r, 0, Math.PI * 2);
        ctx.fillStyle = t1.hitFlashTimer > 0 ? '#FFFFFF' : t1.team === 'blue' ? '#1E3A8A' : '#7F1D1D';
        ctx.fill();
        ctx.lineWidth = t1.golden ? 6 : 4;
        ctx.strokeStyle = t1.golden ? '#FACC15' : t1.team === 'blue' ? '#38BDF8' : '#FB7185';
        ctx.stroke();
        // Inner Crystal Gem
        ctx.beginPath();
        ctx.arc(t1.x, t1.y - 6, r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = t1.team === 'blue' ? '#38BDF8' : '#F43F5E';
        ctx.fill();
        // Pre-5:00 Cyan Energy Shield visual
        if (t1.shieldHp > 0) {
            ctx.beginPath();
            ctx.arc(t1.x, t1.y, r + 9, 0, Math.PI * 2);
            ctx.strokeStyle = '#22D3EE';
            ctx.lineWidth = 3.5;
            ctx.setLineDash([
                8,
                6
            ]);
            ctx.stroke();
        }
        // Turret HP Bar
        var bw = t1.tier === 4 ? 130 : 88;
        var bh = 10;
        var bx = t1.x - bw / 2;
        var by = t1.y - r - 24;
        ctx.fillStyle = 'rgba(10,14,24,0.85)';
        ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
        ctx.fillStyle = t1.team === 'blue' ? '#38BDF8' : '#EF4444';
        ctx.fillRect(bx, by, bw * Math.max(0, t1.hp / t1.maxHp), bh);
        ctx.restore();
    }
    // 10. Jungle Mobs + Leash Circle + Patience Bar + Retribution Threshold Tick
    for(var _iterator5 = _create_for_of_iterator_helper_loose(state.jungleMobs), _step5; !(_step5 = _iterator5()).done;){
        var mob = _step5.value;
        if (mob.x < minX - 240 || mob.x > maxX + 240 || mob.y < minY - 240 || mob.y > maxY + 240) continue;
        if (!mob.alive) {
            // Respawn timer ring on ground
            if (mob.respawnTimer > 0 && mob.respawnTimer < 120) {
                ctx.save();
                ctx.fillStyle = 'rgba(15,23,42,0.72)';
                ctx.beginPath();
                ctx.arc(mob.homeX, mob.homeY, 26, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FDE047';
                ctx.font = 'bold 15px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("" + Math.ceil(mob.respawnTimer) + "s", mob.homeX, mob.homeY);
                ctx.restore();
            }
            continue;
        }
        // Leash circle when aggro'd
        if (mob.aggroTargetId) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(mob.homeX, mob.homeY, mob.leashRadius, 0, Math.PI * 2);
            ctx.strokeStyle = mob.resetting ? 'rgba(239,68,68,0.65)' : 'rgba(250,204,21,0.38)';
            ctx.setLineDash([
                10,
                8
            ]);
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.restore();
        }
        var r1 = mob.kind === 'lord' ? 54 : mob.kind === 'turtle' ? 46 : mob.kind.includes('buff') ? 38 : 28;
        ctx.save();
        ctx.beginPath();
        ctx.arc(mob.x, mob.y, r1, 0, Math.PI * 2);
        ctx.fillStyle = mob.hitFlashTimer > 0 ? '#FFFFFF' : '#1E293B';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = mob.color;
        ctx.stroke();
        ctx.font = "" + Math.round(r1 * 0.95) + "px sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(mob.icon, mob.x, mob.y + 2);
        // HP Bar + Retribution Execute Line
        var bw1 = r1 * 2.2;
        var bx1 = mob.x - bw1 / 2;
        var by1 = mob.y - r1 - 22;
        ctx.fillStyle = 'rgba(10,14,24,0.88)';
        ctx.fillRect(bx1 - 1, by1 - 1, bw1 + 2, 11);
        ctx.fillStyle = mob.color;
        ctx.fillRect(bx1, by1, bw1 * Math.max(0, mob.hp / mob.maxHp), 9);
        if (player && player.spellId === 'retribution') {
            var thresh = (0, _CombatMath.computeRetributionThreshold)(player.level, player.junglerStacks >= 5);
            var frac = Math.min(1, thresh / mob.maxHp);
            ctx.fillStyle = mob.hp <= thresh ? '#FFFFFF' : '#EF4444';
            ctx.fillRect(bx1 + bw1 * frac - 1.5, by1 - 2, 3, 13);
        }
        // Patience bar underneath when aggro'd
        if (mob.aggroTargetId) {
            ctx.fillStyle = '#FACC15';
            ctx.fillRect(bx1, by1 + 11, bw1 * Math.max(0, mob.patience / 100), 3);
        }
        if (state.settings.basics.creepHpNumbers) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px monospace';
            ctx.fillText("" + Math.ceil(mob.hp), mob.x, by1 - 8);
        }
        ctx.restore();
    }
    // 11. Aiming Telegraphs (Layer 1 VFX — Blue/Cyan under player)
    if (state.aimPreview.active && player && player.alive) {
        var ap = state.aimPreview;
        ctx.save();
        var col = ap.cancelHover ? 'rgba(239,68,68,0.35)' : 'rgba(56,189,248,0.22)';
        var strokeCol = ap.cancelHover ? '#EF4444' : '#38BDF8';
        ctx.beginPath();
        ctx.arc(player.x, player.y, ap.range, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56,189,248,0.45)';
        ctx.lineWidth = 2;
        ctx.stroke();
        if (ap.shape === 'line' || ap.shape === 'cone') {
            ctx.translate(player.x, player.y);
            ctx.rotate(ap.angle);
            ctx.fillStyle = col;
            ctx.strokeStyle = strokeCol;
            ctx.lineWidth = 3;
            if (ap.shape === 'cone') {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, ap.range, -0.45, 0.45);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else {
                ctx.fillRect(0, -ap.radius * 0.55, ap.range, ap.radius * 1.1);
                ctx.strokeRect(0, -ap.radius * 0.55, ap.range, ap.radius * 1.1);
            }
        } else if (ap.shape === 'circle') {
            var cx = player.x + Math.cos(ap.angle) * Math.min(ap.range, ap.dist);
            var cy = player.y + Math.sin(ap.angle) * Math.min(ap.range, ap.dist);
            ctx.beginPath();
            ctx.arc(cx, cy, ap.radius, 0, Math.PI * 2);
            ctx.fillStyle = col;
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = strokeCol;
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(player.x, player.y, ap.radius || ap.range, 0, Math.PI * 2);
            ctx.fillStyle = col;
            ctx.fill();
            ctx.strokeStyle = strokeCol;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        ctx.restore();
    }
    // 12. Minions
    for(var _iterator6 = _create_for_of_iterator_helper_loose(state.minions), _step6; !(_step6 = _iterator6()).done;){
        var m = _step6.value;
        if (!m.alive) continue;
        if (m.x < minX || m.x > maxX || m.y < minY || m.y > maxY) continue;
        ctx.save();
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fillStyle = m.hitFlashTimer > 0 ? '#FFFFFF' : m.kind === 'lord_ally' ? '#F59E0B' : m.kind === 'mini_turtle' ? '#2CE58B' : m.team === 'blue' ? '#2563EB' : '#DC2626';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = m.kind === 'siege' || m.kind === 'lord_ally' ? '#FACC15' : '#E2E8F0';
        ctx.stroke();
        // Minion HP Bar
        var bw2 = m.radius * 2.1;
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(m.x - bw2 / 2, m.y - m.radius - 10, bw2, 5);
        ctx.fillStyle = m.team === 'blue' ? '#38BDF8' : '#FB7185';
        ctx.fillRect(m.x - bw2 / 2, m.y - m.radius - 10, bw2 * Math.max(0, m.hp / m.maxHp), 5);
        ctx.restore();
    }
    // 12B. 2-Second Fading Fog Ghost Silhouettes (last known enemy location entering Fog/Bush)
    for(var _iterator7 = _create_for_of_iterator_helper_loose(state.fogGhosts), _step7; !(_step7 = _iterator7()).done;){
        var ghost = _step7.value;
        if (ghost.x < minX - 80 || ghost.x > maxX + 80 || ghost.y < minY - 80 || ghost.y > maxY + 80) continue;
        var alpha = Math.max(0, ghost.ttl / Math.max(0.01, ghost.maxTtl) * 0.65);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(ghost.x, ghost.y, 28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15,23,42,0.72)';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.setLineDash([
            6,
            5
        ]);
        ctx.strokeStyle = '#FB7185';
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#FDE047';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', ghost.x, ghost.y);
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#FCA5A5';
        ctx.fillText(ghost.name, ghost.x, ghost.y - 36);
        ctx.restore();
    }
    // 12C. Smart Targeting Magnetic Tether to Locked Target
    if (player && player.alive && state.lockedTargetId) {
        var lockedHero = state.heroes.find(function(x) {
            return x.id === state.lockedTargetId && x.alive && state.visibleEnemyIds.has(x.id);
        });
        if (lockedHero && (0, _CombatMath.dist)(player.x, player.y, lockedHero.x, lockedHero.y) <= 950) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(lockedHero.x, lockedHero.y);
            ctx.strokeStyle = 'rgba(255,59,78,0.58)';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([
                10,
                8
            ]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }
    }
    // 13. Heroes (All 10) — Layer 2 Silhouette Shaders, Parabolic Leap Z-Arc, Dynamic Scaling, Layer 4 Stack Rings & CC Badges
    for(var _iterator8 = _create_for_of_iterator_helper_loose(state.heroes), _step8; !(_step8 = _iterator8()).done;)_loop();
    // 14. Swaying Bushes (drawn slightly translucent when player is inside)
    if (!state.isBrawl) {
        var sway = Math.sin(state.matchTimeSec * 2.2) * 3;
        for(var _iterator9 = _create_for_of_iterator_helper_loose((0, _mapData.getActiveMapBushes)(state.mapVariant)), _step9; !(_step9 = _iterator9()).done;){
            var b = _step9.value;
            if (b.cx + b.rx < minX || b.cx - b.rx > maxX || b.cy + b.ry < minY || b.cy - b.ry > maxY) continue;
            var playerInside = player && player.alive && (0, _CombatMath.dist)(player.x, player.y, b.cx, b.cy) < Math.max(b.rx, b.ry);
            ctx.save();
            ctx.translate(b.cx + sway, b.cy);
            ctx.rotate(b.angle);
            ctx.globalAlpha = playerInside ? 0.42 : 0.86;
            ctx.beginPath();
            ctx.ellipse(0, 0, b.rx, b.ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = theme.bush;
            ctx.fill();
            ctx.strokeStyle = '#3D7A4E';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
        }
    }
    // 15. Projectiles
    for(var _iterator10 = _create_for_of_iterator_helper_loose(state.projectiles), _step10; !(_step10 = _iterator10()).done;){
        var p = _step10.value;
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.48, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
        ctx.restore();
    }
    // 16. VFX Layers (Slashes, Beams, Craters, Rings, Tethers, Arcing Coins, Floating Numbers)
    for(var _iterator11 = _create_for_of_iterator_helper_loose(state.vfxs), _step11; !(_step11 = _iterator11()).done;){
        var v = _step11.value;
        var alpha1 = Math.max(0, Math.min(1, v.ttl / Math.max(0.01, v.maxTtl)));
        ctx.save();
        ctx.globalAlpha = alpha1;
        if (v.kind === 'ring' || v.kind === 'crater' || v.kind === 'burst') {
            var expand = v.kind === 'burst' ? 1.25 - alpha1 * 0.35 : 1;
            ctx.beginPath();
            ctx.arc(v.x, v.y, v.radius * expand, 0, Math.PI * 2);
            ctx.fillStyle = v.color + '33';
            ctx.fill();
            ctx.lineWidth = v.kind === 'burst' ? 5 : 3.5;
            ctx.strokeStyle = v.color;
            ctx.stroke();
        } else if (v.kind === 'beam' && v.tx !== undefined && v.ty !== undefined) {
            ctx.beginPath();
            ctx.moveTo(v.x, v.y);
            ctx.lineTo(v.tx, v.ty);
            ctx.strokeStyle = v.color;
            ctx.lineWidth = v.radius * alpha1;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = Math.max(4, v.radius * 0.3 * alpha1);
            ctx.stroke();
        } else if (v.kind === 'slash') {
            var _v_angle;
            ctx.translate(v.x, v.y);
            ctx.rotate((_v_angle = v.angle) != null ? _v_angle : 0);
            ctx.beginPath();
            ctx.arc(0, 0, v.radius, -0.75, 0.75);
            ctx.strokeStyle = v.color;
            ctx.lineWidth = 14 * alpha1;
            ctx.lineCap = 'round';
            ctx.stroke();
        } else if (v.kind === 'tether' && v.tx !== undefined && v.ty !== undefined) {
            ctx.beginPath();
            ctx.moveTo(v.x, v.y);
            ctx.lineTo(v.tx, v.ty);
            ctx.strokeStyle = v.color;
            ctx.lineWidth = 5;
            ctx.stroke();
        } else if (v.kind === 'coin') {
            ctx.beginPath();
            ctx.arc(v.x, v.y - (1 - alpha1) * 42, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#FACC15';
            ctx.fill();
            ctx.strokeStyle = '#FEF08A';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (v.kind === 'cable' && v.tx !== undefined && v.ty !== undefined) {
            ctx.beginPath();
            ctx.moveTo(v.x, v.y);
            ctx.lineTo(v.tx, v.ty);
            ctx.strokeStyle = '#E2E8F0';
            ctx.lineWidth = 4;
            ctx.stroke();
        } else if (v.kind === 'elemental' || v.kind === 'prism') {
            ctx.beginPath();
            ctx.arc(v.x, v.y - (1 - alpha1) * 26, Math.max(6, v.radius * alpha1 * 0.7), 0, Math.PI * 2);
            ctx.fillStyle = v.color;
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        } else if (v.kind === 'text' && v.text && state.settings.basics.damageText) {
            ctx.font = "bold " + (v.isCrit ? 22 : 17) + "px sans-serif";
            ctx.textAlign = 'center';
            ctx.fillStyle = '#000000';
            ctx.fillText(v.text, v.x + 1.5, v.y - (1 - alpha1) * 44 + 1.5);
            ctx.fillStyle = v.color;
            ctx.fillText(v.text, v.x, v.y - (1 - alpha1) * 44);
        }
        ctx.restore();
    }
    // 17. Tactical Map Pings & Glowing Cyan "On My Way" Route Trails on Battlefield
    for(var _iterator12 = _create_for_of_iterator_helper_loose(state.tacticalPings), _step12; !(_step12 = _iterator12()).done;){
        var ping = _step12.value;
        var pAlpha = Math.max(0, Math.min(1, ping.ttl / Math.max(0.1, ping.maxTtl)));
        ctx.save();
        ctx.globalAlpha = Math.min(1, pAlpha * 1.4);
        // Glowing Cyan Dotted "On My Way" Route Path
        if (ping.routePoints && ping.routePoints.length >= 2) {
            ctx.beginPath();
            ping.routePoints.forEach(function(pt, idx) {
                return idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
            });
            ctx.strokeStyle = 'rgba(34,211,238,0.35)';
            ctx.lineWidth = 14;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
            ctx.strokeStyle = '#22D3EE';
            ctx.lineWidth = 5;
            ctx.setLineDash([
                14,
                10
            ]);
            ctx.lineDashOffset = -(state.matchTimeSec * 48);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        // Expanding Ping Beacon Ripple
        var pulsePhase = state.matchTimeSec * 2.2 % 1;
        var rad = 28 + pulsePhase * 86;
        ctx.beginPath();
        ctx.arc(ping.x, ping.y, rad, 0, Math.PI * 2);
        ctx.strokeStyle = ping.color;
        ctx.lineWidth = 4.5 * (1 - pulsePhase * 0.6);
        ctx.stroke();
        // Inner Beacon Badge
        ctx.beginPath();
        ctx.arc(ping.x, ping.y, 22, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(11,19,43,0.9)';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = ping.color;
        ctx.stroke();
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ping.icon, ping.x, ping.y + 1);
        // Floating Tactical Label Banner
        ctx.font = 'bold 12px sans-serif';
        var textW = Math.min(240, ctx.measureText(ping.label).width + 18);
        ctx.fillStyle = 'rgba(8,14,28,0.88)';
        ctx.beginPath();
        ctx.roundRect(ping.x - textW / 2, ping.y - 50, textW, 22, 8);
        ctx.fill();
        ctx.strokeStyle = ping.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(ping.label, ping.x, ping.y - 38);
        ctx.restore();
    }
    ctx.restore();
    // Helcurt Dark Night Falls Global Blind Veil (2D fallback screen-space overlay)
    if (state.playerBlinded) {
        ctx.save();
        var grad = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.14, width / 2, height / 2, Math.max(width, height) * 0.55);
        grad.addColorStop(0, 'rgba(15,6,32,0.18)');
        grad.addColorStop(1, 'rgba(5,2,18,0.88)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }
}
function renderMinimap(ctx, w, h, state) {
    var _MAP_THEMES_state_mapTheme;
    var sx = w / _mapData.WORLD_SIZE;
    var sy = h / _mapData.WORLD_SIZE;
    var theme = (_MAP_THEMES_state_mapTheme = _mapData.MAP_THEMES[state.mapTheme]) != null ? _MAP_THEMES_state_mapTheme : _mapData.MAP_THEMES.imperial_sanctuary;
    var isLarge = w >= 220;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = state.isBrawl ? '#071324' : '#122434';
    ctx.fillRect(0, 0, w, h);
    // Lanes
    ctx.strokeStyle = state.isBrawl ? 'rgba(240,198,91,0.72)' : 'rgba(212,185,123,0.48)';
    ctx.lineWidth = state.isBrawl ? Math.max(9, w * 0.11) : Math.max(5, w * 0.055);
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (!state.isBrawl) {
        ctx.moveTo(420 * sx, 3480 * sy);
        ctx.lineTo(420 * sx, 420 * sy);
        ctx.lineTo(3480 * sx, 420 * sy);
        ctx.moveTo(520 * sx, 3580 * sy);
        ctx.lineTo(3580 * sx, 3580 * sy);
        ctx.lineTo(3580 * sx, 520 * sy);
    }
    ctx.moveTo(520 * sx, 3480 * sy);
    ctx.lineTo(3480 * sx, 520 * sy);
    ctx.stroke();
    // River
    if (!state.isBrawl) {
        ctx.strokeStyle = theme.riverB + '88';
        ctx.lineWidth = state.mapVariant === 'expanding_rivers' ? Math.max(7, w * 0.075) : Math.max(4, w * 0.05);
        ctx.beginPath();
        ctx.moveTo(300 * sx, 300 * sy);
        ctx.lineTo(3700 * sx, 3700 * sy);
        ctx.stroke();
        // EXP & Gold Lane corner badges on minimap
        var expPos = (0, _mapData.getLaneDecalPosition)(state.expLane);
        var goldPos = (0, _mapData.getLaneDecalPosition)(state.goldLane);
        ctx.font = "bold " + (isLarge ? 11 : 8) + "px sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#22D3EE';
        ctx.fillText('⚔', expPos.x * sx, expPos.y * sy);
        ctx.fillStyle = '#FACC15';
        ctx.fillText('🪙', goldPos.x * sx, goldPos.y * sy);
    }
    // Bushes on large tactical map for ambush pinging
    if (!state.isBrawl && isLarge) {
        ctx.fillStyle = state.mapVariant === 'dangerous_grass' ? 'rgba(34,197,94,0.58)' : 'rgba(46,125,65,0.42)';
        for(var _iterator = _create_for_of_iterator_helper_loose((0, _mapData.getActiveMapBushes)(state.mapVariant)), _step; !(_step = _iterator()).done;){
            var b = _step.value;
            ctx.beginPath();
            ctx.ellipse(b.cx * sx, b.cy * sy, Math.max(3, b.rx * sx), Math.max(2.5, b.ry * sy), b.angle, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    // Real-Time Fog of War Dimming Shroud (dims all map zones outside allied Hero/Minion/Turret/Walkie Grass vision!)
    if (!state.isSpectator) {
        ctx.save();
        ctx.fillStyle = 'rgba(2, 6, 16, 0.56)';
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        for(var _iterator1 = _create_for_of_iterator_helper_loose(state.blueVisionCircles), _step1; !(_step1 = _iterator1()).done;){
            var c = _step1.value;
            var cx = c.x * sx;
            var cy = c.y * sy;
            var rad = Math.max(6, c.radius * sx);
            var grad = ctx.createRadialGradient(cx, cy, rad * 0.25, cx, cy, rad);
            grad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
            grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, rad, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
    // Brawl Healing Shrines on Minimap
    if (state.isBrawl) {
        for(var _iterator2 = _create_for_of_iterator_helper_loose(state.brawlShrines), _step2; !(_step2 = _iterator2()).done;){
            var sh = _step2.value;
            var mx = sh.x * sx;
            var my = sh.y * sy;
            ctx.beginPath();
            ctx.arc(mx, my, isLarge ? 6 : 4, 0, Math.PI * 2);
            ctx.fillStyle = sh.active ? '#2CE58B' : 'rgba(148,163,184,0.35)';
            ctx.fill();
            if (!sh.active && sh.respawnTimer > 0) {
                var frac = 1 - sh.respawnTimer / Math.max(1, sh.maxRespawn);
                ctx.beginPath();
                ctx.arc(mx, my, isLarge ? 8 : 5.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
                ctx.strokeStyle = '#2CE58B';
                ctx.lineWidth = 1.6;
                ctx.stroke();
            }
        }
    }
    // Patrolling Walkie Grass Wards on Minimap
    for(var _iterator3 = _create_for_of_iterator_helper_loose(state.walkieGrasses), _step3; !(_step3 = _iterator3()).done;){
        var wg = _step3.value;
        var wx = wg.x * sx;
        var wy = wg.y * sy;
        ctx.save();
        ctx.beginPath();
        ctx.arc(wx, wy, isLarge ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = wg.team === 'blue' ? '#2DD4BF' : '#FB7185';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
    }
    // Alive Turrets & Crystals
    for(var _iterator4 = _create_for_of_iterator_helper_loose(state.turrets), _step4; !(_step4 = _iterator4()).done;){
        var t = _step4.value;
        if (!t.alive) continue;
        ctx.fillStyle = t.team === 'blue' ? '#38BDF8' : '#EF4444';
        var r = t.tier === 4 ? isLarge ? 7 : 5 : isLarge ? 4.5 : 3;
        ctx.fillRect(t.x * sx - r, t.y * sy - r, r * 2, r * 2);
        if (t.tier === 1 && t.shieldHp > 0) {
            ctx.strokeStyle = '#22D3EE';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(t.x * sx - r - 1, t.y * sy - r - 1, r * 2 + 2, r * 2 + 2);
        }
    }
    // Jungle Mobs & Circular Radial Respawn Countdowns for Buffs, Turtle & Lord
    for(var _iterator5 = _create_for_of_iterator_helper_loose(state.jungleMobs), _step5; !(_step5 = _iterator5()).done;){
        var m = _step5.value;
        var isMajor = m.kind === 'lord' || m.kind === 'turtle';
        var isBuff = m.kind === 'orange_buff' || m.kind === 'purple_buff';
        if (m.alive) {
            ctx.beginPath();
            ctx.arc(m.x * sx, m.y * sy, isMajor ? isLarge ? 8 : 5.5 : isLarge ? 4 : 2.5, 0, Math.PI * 2);
            ctx.fillStyle = m.color;
            ctx.fill();
            if (isMajor && isLarge) {
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(m.icon, m.x * sx, m.y * sy);
            }
        } else if ((isMajor || isBuff) && m.respawnTimer > 0 && m.respawnTimer < 240) {
            var mx1 = m.homeX * sx;
            var my1 = m.homeY * sy;
            var maxSec = m.spawnedOnce ? m.respawnSec : m.firstSpawnSec;
            var frac1 = Math.max(0, Math.min(1, 1 - m.respawnTimer / Math.max(1, maxSec)));
            var rad1 = isMajor ? isLarge ? 10 : 7 : isLarge ? 8 : 5.5;
            ctx.save();
            ctx.beginPath();
            ctx.arc(mx1, my1, rad1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(7,12,26,0.85)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(mx1, my1, rad1, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac1);
            ctx.strokeStyle = isMajor ? '#FACC15' : m.color;
            ctx.lineWidth = isLarge ? 2.2 : 1.6;
            ctx.stroke();
            ctx.fillStyle = isMajor ? '#FDE047' : '#E2E8F0';
            ctx.font = "bold " + (isLarge ? 9 : 7) + "px monospace";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("" + Math.ceil(m.respawnTimer), mx1, my1 + 0.5);
            ctx.restore();
        }
    }
    // Minions
    for(var _iterator6 = _create_for_of_iterator_helper_loose(state.minions), _step6; !(_step6 = _iterator6()).done;){
        var m1 = _step6.value;
        if (!m1.alive) continue;
        ctx.fillStyle = m1.kind === 'lord_ally' ? '#F59E0B' : m1.kind === 'super' ? '#FACC15' : m1.team === 'blue' ? 'rgba(56,189,248,0.78)' : 'rgba(251,113,133,0.78)';
        var sz = m1.kind === 'lord_ally' ? 5 : m1.kind === 'super' ? 3.5 : 2.5;
        ctx.fillRect(m1.x * sx - sz / 2, m1.y * sy - sz / 2, sz, sz);
    }
    // Fog Ghosts on Minimap (last known position for 2s!)
    for(var _iterator7 = _create_for_of_iterator_helper_loose(state.fogGhosts), _step7; !(_step7 = _iterator7()).done;){
        var ghost = _step7.value;
        var alpha = Math.max(0.2, ghost.ttl / Math.max(0.1, ghost.maxTtl));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(ghost.x * sx, ghost.y * sy, isLarge ? 7 : 5, 0, Math.PI * 2);
        ctx.strokeStyle = '#FB7185';
        ctx.setLineDash([
            2,
            2
        ]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#FDE047';
        ctx.font = "bold " + (isLarge ? 9 : 7) + "px sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', ghost.x * sx, ghost.y * sy);
        ctx.restore();
    }
    // Heroes (strictly respecting Fog of War & Bush Stealth for red team!)
    for(var _iterator8 = _create_for_of_iterator_helper_loose(state.heroes), _step8; !(_step8 = _iterator8()).done;){
        var hero = _step8.value;
        if (!hero.alive) continue;
        if (hero.team === 'red' && !state.visibleEnemyIds.has(hero.id)) continue;
        var rad2 = hero.isPlayer ? isLarge ? 9 : 6 : isLarge ? 7.5 : 4.5;
        ctx.beginPath();
        ctx.arc(hero.x * sx, hero.y * sy, rad2, 0, Math.PI * 2);
        ctx.fillStyle = hero.isPlayer ? '#FACC15' : hero.team === 'blue' ? '#38BDF8' : '#EF4444';
        ctx.fill();
        ctx.lineWidth = hero.isPlayer ? 2 : 1.4;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
        if (isLarge) {
            ctx.fillStyle = '#0A1020';
            ctx.font = 'bold 8px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(hero.heroDef.name.slice(0, 2).toUpperCase(), hero.x * sx, hero.y * sy + 0.5);
        }
    }
    // Tactical Pings & Glowing Cyan "On My Way" Route Trails on Minimap
    for(var _iterator9 = _create_for_of_iterator_helper_loose(state.tacticalPings), _step9; !(_step9 = _iterator9()).done;){
        var ping = _step9.value;
        var pAlpha = Math.max(0.2, Math.min(1, ping.ttl / Math.max(0.1, ping.maxTtl)));
        ctx.save();
        ctx.globalAlpha = pAlpha;
        if (ping.routePoints && ping.routePoints.length >= 2) {
            ctx.beginPath();
            ping.routePoints.forEach(function(pt, idx) {
                return idx === 0 ? ctx.moveTo(pt.x * sx, pt.y * sy) : ctx.lineTo(pt.x * sx, pt.y * sy);
            });
            ctx.strokeStyle = '#22D3EE';
            ctx.lineWidth = isLarge ? 3 : 2;
            ctx.setLineDash([
                4,
                3
            ]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        var pulse = state.matchTimeSec * 2.2 % 1 * (isLarge ? 14 : 9);
        ctx.beginPath();
        ctx.arc(ping.x * sx, ping.y * sy, (isLarge ? 6 : 4) + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = ping.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ping.x * sx, ping.y * sy, isLarge ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = ping.color;
        ctx.fill();
        ctx.restore();
    }
    // Live Camera Viewport Box
    var vw = state.camViewW * sx;
    var vh = state.camViewH * sy;
    ctx.strokeStyle = 'rgba(255,255,255,0.88)';
    ctx.lineWidth = isLarge ? 1.8 : 1.3;
    ctx.strokeRect(state.camX * sx - vw / 2, state.camY * sy - vh / 2, vw, vh);
    // Crystals quick anchor
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(_mapData.BLUE_CRYSTAL.x * sx, _mapData.BLUE_CRYSTAL.y * sy, isLarge ? 5.5 : 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(_mapData.RED_CRYSTAL.x * sx, _mapData.RED_CRYSTAL.y * sy, isLarge ? 5.5 : 4, 0, Math.PI * 2);
    ctx.fill();
}

});
// === MODULE: src/games/legends-arena/mlbb/engine/SmartAiBrain ===
ArcadeMod.define("src/games/legends-arena/mlbb/engine/SmartAiBrain", function(require, module, exports) {
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
    get AI_DIFFICULTY_PROFILES () {
        return AI_DIFFICULTY_PROFILES;
    },
    get computeCounterBuildPlan () {
        return computeCounterBuildPlan;
    },
    get computePostMatchProgression () {
        return computePostMatchProgression;
    },
    get findGankOpportunity () {
        return findGankOpportunity;
    },
    get findPeelTarget () {
        return findPeelTarget;
    },
    get getAiDifficultyProfile () {
        return getAiDifficultyProfile;
    },
    get selectAutoDirectorHero () {
        return selectAutoDirectorHero;
    },
    get shouldTriggerBotActiveOrPurify () {
        return shouldTriggerBotActiveOrPurify;
    }
});
var _emblems = require("../data/emblems");
var _items = require("../data/items");
var _CombatMath = require("./CombatMath");
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
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var AI_DIFFICULTY_PROFILES = {
    warrior: {
        tier: 'warrior',
        label: 'Warrior (Casual)',
        buyIntervalSec: 1.4,
        retriMargin: 1.35,
        enableCounterBuild: false,
        enableGanking: false,
        enablePeel: false,
        enableActiveItems: false,
        enablePurifyReflex: false,
        kiteStrafeStrength: 0.25,
        comboSkillChance: 0.55
    },
    epic: {
        tier: 'epic',
        label: 'Epic (Competitive)',
        buyIntervalSec: 0.85,
        retriMargin: 1.12,
        enableCounterBuild: true,
        enableGanking: true,
        enablePeel: true,
        enableActiveItems: true,
        enablePurifyReflex: true,
        kiteStrafeStrength: 0.65,
        comboSkillChance: 0.85
    },
    mythic: {
        tier: 'mythic',
        label: 'Mythic (Pro Macro)',
        buyIntervalSec: 0.5,
        retriMargin: 1.02,
        enableCounterBuild: true,
        enableGanking: true,
        enablePeel: true,
        enableActiveItems: true,
        enablePurifyReflex: true,
        kiteStrafeStrength: 0.95,
        comboSkillChance: 1.0
    }
};
function getAiDifficultyProfile(tier) {
    var _AI_DIFFICULTY_PROFILES_;
    return (_AI_DIFFICULTY_PROFILES_ = AI_DIFFICULTY_PROFILES[tier != null ? tier : 'epic']) != null ? _AI_DIFFICULTY_PROFILES_ : AI_DIFFICULTY_PROFILES.epic;
}
var HIGH_HEAL_HERO_IDS = new Set([
    'estes',
    'angela',
    'floryn',
    'rafaela',
    'uranus',
    'esmeralda',
    'ruby',
    'yu_zhong',
    'alucard',
    'alice',
    'thamuz',
    'alpha',
    'hilda',
    'lapu_lapu'
]);
function computeCounterBuildPlan(bot, allHeroes) {
    var basePlan = [].concat(bot.buildPlan.length > 0 ? bot.buildPlan : bot.heroDef.recommendedBuild);
    if (basePlan.length < 5) return basePlan;
    var enemies = allHeroes.filter(function(h) {
        return h.team !== bot.team && !h.isTrainingDummy;
    });
    if (enemies.length === 0) return basePlan;
    var magicThreats = enemies.filter(function(e) {
        return e.role === 'Mage' || e.magicPow >= 260;
    }).length;
    var sustainThreats = enemies.filter(function(e) {
        return HIGH_HEAL_HERO_IDS.has(e.heroDef.id) || e.lifestealPct >= 0.16 || e.spellVampPct >= 0.16;
    }).length;
    var tankThreats = enemies.filter(function(e) {
        return e.role === 'Tank' || e.physDef >= 115 || e.magicDef >= 95;
    }).length;
    var isMagicCarry = bot.role === 'Mage' || bot.heroDef.baseMagicPow > 0;
    var isTankOrSupport = bot.role === 'Tank' || bot.role === 'Support';
    var hasItemInPlan = function hasItemInPlan(id) {
        return basePlan.includes(id) || bot.items.includes(id);
    };
    // 1. Anti-Heal Counter Priority
    if (sustainThreats >= 1) {
        var antiHealId = isTankOrSupport ? 'dominance_ice' : isMagicCarry ? 'glowing_wand' : 'sea_halberd';
        if (!hasItemInPlan(antiHealId) && (0, _items.getMlbbItemById)(antiHealId)) {
            basePlan[4] = antiHealId;
        }
    }
    // 2. Heavy Magic Burst Counter (Slot 5 defense for Fighters/Tanks/Marksmen)
    if (magicThreats >= 2 && !isMagicCarry) {
        var magicDefId = bot.role === 'Marksman' ? 'rose_gold_meteor' : 'athenas_shield';
        if (!hasItemInPlan(magicDefId) && (0, _items.getMlbbItemById)(magicDefId)) {
            basePlan[5] = magicDefId;
        }
    } else if (tankThreats >= 2 && !isTankOrSupport) {
        // 3. Heavy Armor/Tank Counter -> % Penetration
        var penId = isMagicCarry ? 'divine_glaive' : 'malefic_roar';
        if (!hasItemInPlan(penId) && (0, _items.getMlbbItemById)(penId)) {
            basePlan[4] = penId;
        }
    }
    return basePlan;
}
function findGankOpportunity(bot, allHeroes, turrets) {
    var _loop = function() {
        var enemy = _step.value;
        if (!enemy.alive || enemy.team === bot.team || enemy.isTrainingDummy) return "continue";
        if (enemy.stealthTimer > 0 || enemy.untargetableTimer > 0) return "continue";
        var d = (0, _CombatMath.dist)(bot.x, bot.y, enemy.x, enemy.y);
        if (d > 1650) return "continue";
        // Avoid tower diving full-HP targets under enemy turrets
        var underEnemyTurret = turrets.some(function(t) {
            return t.alive && t.team === enemy.team && (0, _CombatMath.dist)(enemy.x, enemy.y, t.x, t.y) < t.range + 30;
        });
        var enemyHpPct = enemy.hp / Math.max(1, enemy.maxHp);
        if (underEnemyTurret && enemyHpPct > 0.28) return "continue";
        var nearbyAlly = allHeroes.some(function(a) {
            return a.alive && a.team === bot.team && a.id !== bot.id && (0, _CombatMath.dist)(a.x, a.y, enemy.x, enemy.y) < 760;
        });
        var score = (1 - enemyHpPct) * 60 + (nearbyAlly ? 35 : 0) + (1 - d / 1650) * 30 + (enemy.role === 'Marksman' || enemy.role === 'Mage' ? 18 : 0);
        if (score > 48 && score > bestScore) {
            bestScore = score;
            bestTarget = enemy;
        }
    };
    if (!bot.isJungler && !bot.isRoamer && bot.lane !== 'Mid') return null;
    if (bot.hp / Math.max(1, bot.maxHp) < 0.52) return null;
    var bestTarget = null;
    var bestScore = -1;
    for(var _iterator = _create_for_of_iterator_helper_loose(allHeroes), _step; !(_step = _iterator()).done;)_loop();
    return bestTarget;
}
function findPeelTarget(bot, allHeroes) {
    if (bot.role !== 'Tank' && bot.role !== 'Support') return null;
    var threatenedCarry = allHeroes.find(function(ally) {
        return ally.alive && ally.team === bot.team && ally.id !== bot.id && (ally.role === 'Marksman' || ally.role === 'Mage') && (0, _CombatMath.dist)(bot.x, bot.y, ally.x, ally.y) < 820 && ally.hp / Math.max(1, ally.maxHp) < 0.75;
    });
    if (!threatenedCarry) return null;
    var diver = allHeroes.filter(function(e) {
        return e.alive && e.team !== bot.team && !e.isTrainingDummy && (0, _CombatMath.dist)(e.x, e.y, threatenedCarry.x, threatenedCarry.y) < 420;
    }).sort(function(a, b) {
        return (0, _CombatMath.dist)(a.x, a.y, threatenedCarry.x, threatenedCarry.y) - (0, _CombatMath.dist)(b.x, b.y, threatenedCarry.x, threatenedCarry.y);
    })[0];
    return diver != null ? diver : null;
}
function shouldTriggerBotActiveOrPurify(bot, nearbyEnemies, profile) {
    if (profile.enablePurifyReflex && bot.spellId === 'purify' && bot.spellCd <= 0) {
        if (bot.ccType && (0, _CombatMath.getCcPriority)(bot.ccType) >= 3 && bot.ccType !== 'suppression') {
            return 'purify';
        }
    }
    if (!profile.enableActiveItems || bot.activeItemCd > 0) return null;
    var hpPct = bot.hp / Math.max(1, bot.maxHp);
    var hasWind = bot.items.includes('wind_of_nature');
    var hasWinter = bot.items.includes('winter_crown');
    var hasConceal = bot.blessingId === 'roam_conceal';
    if (hasWind && hpPct < 0.48 && nearbyEnemies.some(function(e) {
        return e.physAtk > e.magicPow && (0, _CombatMath.dist)(bot.x, bot.y, e.x, e.y) < 520;
    })) {
        return 'active_item';
    }
    if (hasWinter && hpPct < 0.28 && nearbyEnemies.length >= 1) {
        return 'active_item';
    }
    if (hasConceal && nearbyEnemies.length >= 1 && nearbyEnemies.every(function(e) {
        return (0, _CombatMath.dist)(bot.x, bot.y, e.x, e.y) > 480 && (0, _CombatMath.dist)(bot.x, bot.y, e.x, e.y) < 1100;
    })) {
        return 'active_item';
    }
    return null;
}
function selectAutoDirectorHero(heroes, jungleMobs, matchTimeSec) {
    var _loop = function() {
        var h = _step.value;
        var nearbyEnemies = aliveHeroes.filter(function(e) {
            return e.team !== h.team && (0, _CombatMath.dist)(h.x, h.y, e.x, e.y) < 620;
        }).length;
        var nearbyAllies = aliveHeroes.filter(function(a) {
            return a.team === h.team && a.id !== h.id && (0, _CombatMath.dist)(h.x, h.y, a.x, a.y) < 620;
        }).length;
        var hpPct = h.hp / Math.max(1, h.maxHp);
        var bossBonus = activeBoss && (0, _CombatMath.dist)(h.x, h.y, activeBoss.x, activeBoss.y) < 680 ? 38 : 0;
        var heat = nearbyEnemies * 32 + (nearbyEnemies > 0 ? nearbyAllies * 14 : 0) + (nearbyEnemies > 0 && hpPct < 0.45 ? 25 : 0) + bossBonus + h.kills * 2.5;
        if (heat > bestHeat) {
            bestHeat = heat;
            bestId = h.id;
        }
    };
    var aliveHeroes = heroes.filter(function(h) {
        return h.alive && !h.isTrainingDummy;
    });
    if (aliveHeroes.length === 0) return null;
    var activeBoss = jungleMobs.find(function(m) {
        return m.alive && (m.kind === 'turtle' && matchTimeSec >= 110 || m.kind === 'lord' && matchTimeSec >= 470);
    });
    var bestId = aliveHeroes[0].id;
    var bestHeat = -1;
    for(var _iterator = _create_for_of_iterator_helper_loose(aliveHeroes), _step; !(_step = _iterator()).done;)_loop();
    return bestId;
}
function computePostMatchProgression(prev, record) {
    var _prev_heroStats_record_playerHeroId;
    var tierIdx = prev.rankTierIdx;
    var stars = prev.rankStars;
    var prot = prev.starProtectionPts;
    var starDelta = 0;
    var starProtected = false;
    var starProtectionSource = null;
    var starRaisedBonus = false;
    var backpack = _extends({}, prev.backpack);
    var isMvp = record.medal === 'MVP';
    var baseBp = record.victory ? isMvp ? 380 : 320 : isMvp ? 210 : 165;
    var baseExp = record.victory ? isMvp ? 320 : 280 : isMvp ? 185 : 150;
    var doubleBpUsed = false;
    var doubleExpUsed = false;
    var bpGain = baseBp;
    var expGain = baseExp;
    if (record.mode !== 'practice' && backpack.doubleBpCards > 0) {
        backpack.doubleBpCards -= 1;
        bpGain *= 2;
        doubleBpUsed = true;
    }
    if (record.mode !== 'practice' && backpack.doubleExpCards > 0) {
        backpack.doubleExpCards -= 1;
        expGain *= 2;
        doubleExpUsed = true;
    }
    var tier = _emblems.MLBB_RANK_TIERS[Math.max(0, Math.min(_emblems.MLBB_RANK_TIERS.length - 1, tierIdx))];
    if (record.mode === 'ranked') {
        if (record.victory) {
            var gain = 1;
            if (backpack.starRaisingCards > 0 && isMvp) {
                backpack.starRaisingCards -= 1;
                gain = 2;
                starRaisedBonus = true;
            }
            stars += gain;
            starDelta = gain;
            prot = Math.min(1000, prot + (isMvp ? 220 : 140));
            while(stars > tier.starsPerTier && tierIdx < _emblems.MLBB_RANK_TIERS.length - 1){
                stars -= tier.starsPerTier;
                tierIdx += 1;
            }
        } else {
            if (prot >= 1000) {
                prot = 0;
                starDelta = 0;
                starProtected = true;
                starProtectionSource = 'points';
            } else if (backpack.starProtectionCards > 0) {
                backpack.starProtectionCards -= 1;
                starDelta = 0;
                starProtected = true;
                starProtectionSource = 'card';
            } else {
                starDelta = -1;
                prot = Math.min(1000, prot + (isMvp ? 180 : 90));
                if (stars > 0) {
                    stars -= 1;
                } else if (tierIdx > 0) {
                    tierIdx -= 1;
                    stars = _emblems.MLBB_RANK_TIERS[tierIdx].starsPerTier - 1;
                }
            }
        }
    }
    var mmrDelta = record.mode === 'practice' ? 0 : record.victory ? isMvp ? 36 : 26 : isMvp ? -6 : -14;
    var masteryGain = record.mode === 'practice' ? 2 : record.victory ? isMvp ? 18 : 12 : 6;
    var prevH = (_prev_heroStats_record_playerHeroId = prev.heroStats[record.playerHeroId]) != null ? _prev_heroStats_record_playerHeroId : {
        matches: 0,
        wins: 0,
        mmr: 1200,
        mastery: 0
    };
    var nextH = {
        matches: prevH.matches + 1,
        wins: prevH.wins + (record.victory ? 1 : 0),
        mmr: Math.max(800, prevH.mmr + mmrDelta),
        mastery: Math.min(100, prevH.mastery + masteryGain)
    };
    var nextExp = prev.exp + expGain;
    var levelUp = Math.floor(nextExp / 1000);
    var nextStarlightXp = prev.starlightXp + (record.victory ? 280 : 180);
    var _obj;
    var nextProfile = _extends({}, prev, {
        rankTierIdx: tierIdx,
        rankStars: stars,
        starProtectionPts: prot,
        backpack: backpack,
        bp: prev.bp + bpGain,
        exp: nextExp % 1000,
        level: prev.level + levelUp,
        dailyActivity: Math.min(800, prev.dailyActivity + 120),
        weeklyActivity: Math.min(1000, prev.weeklyActivity + 140),
        starlightXp: nextStarlightXp % 1000,
        starlightLevel: Math.min(60, prev.starlightLevel + Math.floor(nextStarlightXp / 1000)),
        heroStats: _extends({}, prev.heroStats, (_obj = {}, _obj[record.playerHeroId] = nextH, _obj)),
        matchHistory: [].concat([
            record
        ], prev.matchHistory).slice(0, 25)
    });
    return {
        nextProfile: nextProfile,
        starDelta: starDelta,
        starProtected: starProtected,
        starProtectionSource: starProtectionSource,
        starRaisedBonus: starRaisedBonus,
        bpGain: bpGain,
        expGain: expGain,
        doubleBpUsed: doubleBpUsed,
        doubleExpUsed: doubleExpUsed,
        mmrDelta: mmrDelta,
        masteryGain: masteryGain
    };
}

});

})(window.ArcadeMod);
