(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/engine/SkillPhysics ===
ArcadeMod.define("src/games/legends-arena/mlbb/engine/SkillPhysics", function(require, module, exports) {
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
    get applyCcToHero () {
        return applyCcToHero;
    },
    get castBattleSpell () {
        return castBattleSpell;
    },
    get castHeroSkill () {
        return castHeroSkill;
    },
    get computeMitigatedHeroDamage () {
        return computeMitigatedHeroDamage;
    },
    get resolveWallCollision () {
        return resolveWallCollision;
    }
});
var _mapData = require("../data/mapData");
var _CombatMath = require("./CombatMath");
var _AudioEngine = require("./AudioEngine");
var _HeroKitsPart1 = require("./HeroKitsPart1");
var _HeroKitsPart2 = require("./HeroKitsPart2");
var _VfxSystem = require("./VfxSystem");
var _EquipmentCombatEngine = require("./EquipmentCombatEngine");
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
function resolveWallCollision(x, y, radius, campSlainMap, mapVariant, isBrawl, tempWalls) {
    if (isBrawl === void 0) isBrawl = false;
    if (tempWalls === void 0) tempWalls = [];
    if (isBrawl) {
        var c = (0, _mapData.clampToBrawlBridge)(x, y, radius);
        return {
            x: c.x,
            y: c.y,
            hitWall: Math.hypot(c.x - x, c.y - y) > 2
        };
    }
    var nx = (0, _CombatMath.clamp)(x, radius + 30, _mapData.WORLD_SIZE - radius - 30);
    var ny = (0, _CombatMath.clamp)(y, radius + 30, _mapData.WORLD_SIZE - radius - 30);
    var hitWall = Math.hypot(nx - x, ny - y) > 2;
    var walls = (0, _mapData.getActiveMapWalls)(mapVariant);
    for(var _iterator = _create_for_of_iterator_helper_loose(walls), _step; !(_step = _iterator()).done;){
        var w = _step.value;
        var _campSlainMap_w_shortcutCampId;
        if (w.shortcutCampId && ((_campSlainMap_w_shortcutCampId = campSlainMap[w.shortcutCampId]) != null ? _campSlainMap_w_shortcutCampId : 0) > 0) {
            continue; // Purple buff shortcut wall is open
        }
        var closestX = (0, _CombatMath.clamp)(nx, w.x, w.x + w.w);
        var closestY = (0, _CombatMath.clamp)(ny, w.y, w.y + w.h);
        var dx = nx - closestX;
        var dy = ny - closestY;
        var d2 = dx * dx + dy * dy;
        if (d2 < radius * radius) {
            var d = Math.sqrt(d2) || 0.001;
            var push = radius - d;
            nx += dx / d * push;
            ny += dy / d * push;
            hitWall = true;
        }
    }
    for(var _iterator1 = _create_for_of_iterator_helper_loose(tempWalls), _step1; !(_step1 = _iterator1()).done;){
        var tw = _step1.value;
        var closestX1 = (0, _CombatMath.clamp)(nx, tw.x, tw.x + tw.w);
        var closestY1 = (0, _CombatMath.clamp)(ny, tw.y, tw.y + tw.h);
        var dx1 = nx - closestX1;
        var dy1 = ny - closestY1;
        var d21 = dx1 * dx1 + dy1 * dy1;
        if (d21 < radius * radius) {
            var d1 = Math.sqrt(d21) || 0.001;
            var push1 = radius - d1;
            nx += dx1 / d1 * push1;
            ny += dy1 / d1 * push1;
            hitWall = true;
        }
    }
    return {
        x: nx,
        y: ny,
        hitWall: hitWall
    };
}
function applyCcToHero(target, ccType, duration, matchTimeSec) {
    if (matchTimeSec === void 0) matchTimeSec = 0;
    if (!target.alive || target.untargetableTimer > 0) return false;
    var prio = (0, _CombatMath.getCcPriority)(ccType);
    // Suppression (Tier 5 Ultimate CC) bypasses CC Immunity & CC Resilience!
    if (ccType !== 'suppression' && target.ccImmuneTimer > 0) {
        return false;
    }
    var reducedDur = ccType === 'suppression' ? duration : duration * (1 - Math.min(0.6, target.ccResPct));
    var recordCc = function recordCc() {
        if (!target.ccLog) target.ccLog = [];
        target.ccLog.push({
            ccType: ccType,
            durationSec: reducedDur,
            timeSec: matchTimeSec
        });
        if (target.ccLog.length > 32) {
            target.ccLog.splice(0, target.ccLog.length - 32);
        }
    };
    if (ccType === 'slow') {
        target.slowPct = Math.max(target.slowPct, 0.38);
        target.slowTimer = Math.max(target.slowTimer, reducedDur);
        recordCc();
        return true;
    }
    if (!target.ccType || prio >= target.ccPriority || reducedDur > target.ccTimer) {
        target.ccType = ccType;
        target.ccPriority = prio;
        target.ccTimer = Math.max(target.ccTimer, reducedDur);
        target.recalling = false;
        recordCc();
        return true;
    }
    return false;
}
function getSkillDmg(hero, skill, lvl) {
    var idx = (0, _CombatMath.clamp)(lvl - 1, 0, skill.baseDmg.length - 1);
    return skill.baseDmg[idx] + hero.physAtk * skill.physScale + hero.magicPow * skill.magicScale;
}
function findNearestEnemyHero(caster, heroes, range, nearX, nearY) {
    if (nearX === void 0) nearX = caster.x;
    if (nearY === void 0) nearY = caster.y;
    var best = null;
    var bestD = range;
    for(var _iterator = _create_for_of_iterator_helper_loose(heroes), _step; !(_step = _iterator()).done;){
        var h = _step.value;
        if (!h.alive || h.team === caster.team || h.untargetableTimer > 0 || h.stealthTimer > 0) continue;
        var d = (0, _CombatMath.dist)(nearX, nearY, h.x, h.y);
        if (d <= bestD) {
            bestD = d;
            best = h;
        }
    }
    return best;
}
function castHeroSkill(caster, slot, aimAngle, aimDist, ctx) {
    var _caster_eggFormTimer;
    if (!caster.alive || ((_caster_eggFormTimer = caster.eggFormTimer) != null ? _caster_eggFormTimer : 0) > 0) return false;
    if (caster.ccType && (caster.ccType === 'silence' || caster.ccType === 'taunt' || (0, _CombatMath.getCcPriority)(caster.ccType) >= 3)) {
        return false;
    }
    var sIdx = slot - 1;
    var skill = caster.heroDef.skills[sIdx];
    var lvl = caster.skillLevels[sIdx];
    if (lvl <= 0) return false;
    // Tier 1 Grounded & Tier 2 Root block dash / blink / leap mobility skills!
    var isMobilitySkill = skill.physics === 'blink' || skill.physics === 'dash' || skill.physics === 'leap';
    if (isMobilitySkill && caster.ccType && (0, _CombatMath.isDashBlockingCc)(caster.ccType)) {
        return false;
    }
    var isRecast = caster.recastSlot === slot && caster.recastTimer > 0;
    if (!isRecast && caster.skillCds[sIdx] > 0) return false;
    var resourceMult = caster.purpleBuffTimer > 0 ? caster.heroDef.resource === 'energy' ? 0.8 : 0.6 : 1;
    var manaCost = caster.heroDef.resource === 'none' ? 0 : Math.round(skill.manaCost * resourceMult);
    // Hylos Thickened Blood: casts with HP when Mana is 0!
    var hylosHpCast = caster.heroDef.id === 'hylos' && manaCost > caster.mana && caster.hp > manaCost * 1.5;
    if (!isRecast && manaCost > caster.mana && !hylosHpCast) return false;
    if (!isRecast) {
        if (hylosHpCast) {
            var deficit = manaCost - caster.mana;
            caster.mana = 0;
            caster.hp = Math.max(1, caster.hp - deficit * 1.5);
        } else {
            caster.mana = Math.max(0, caster.mana - manaCost);
        }
        var cdIdx = (0, _CombatMath.clamp)(lvl - 1, 0, skill.cooldown.length - 1);
        var hasTalisman = caster.items.includes('enchanted_talisman');
        var cdr = (0, _CombatMath.applyCdrCap)(caster.cdrPct + (caster.purpleBuffTimer > 0 ? 0.1 : 0), hasTalisman);
        caster.skillCds[sIdx] = ctx.noCooldown ? 0.25 : Math.max(0.5, skill.cooldown[cdIdx] * (1 - cdr));
    } else {
        caster.recastSlot = null;
        caster.recastTimer = 0;
    }
    // 3-Phase Cast Cycle: Foreswing -> Active Hitbox -> Cancellable Backswing
    // Casting a mobility skill immediately cancels any lingering Backswing!
    if (isMobilitySkill) {
        caster.castBackswing = 0;
    } else {
        caster.castBackswing = skill.backswing || 0.16;
    }
    caster.facing = aimAngle;
    caster.castWindup = skill.foreswing || 0.14;
    caster.castColor = skill.color;
    caster.recalling = false;
    caster.outOfCombatTimer = 0;
    caster.recentlyAttackedTimer = Math.max(caster.recentlyAttackedTimer, 1.5);
    (0, _EquipmentCombatEngine.onHeroSkillCastEquipHooks)(caster, slot);
    if (caster.isPlayer) {
        _AudioEngine.mlbbAudio.playSkill(slot, skill.damageType);
    }
    var dmg = getSkillDmg(caster, skill, lvl);
    var clampedDist = (0, _CombatMath.clamp)(aimDist || skill.range * 0.65, 60, Math.max(80, skill.range));
    var tx = caster.x + Math.cos(aimAngle) * clampedDist;
    var ty = caster.y + Math.sin(aimAngle) * clampedDist;
    var callbacks = ctx.callbacks, heroes = ctx.heroes, minions = ctx.minions, jungleMobs = ctx.jungleMobs;
    // Helper to hit enemies in circle
    var hitCircle = function hitCircle(cx, cy, rad, rawD, dType, cc, ccDur, onHeroHit, bypassShield) {
        if (bypassShield === void 0) bypassShield = false;
        var hitCount = 0;
        for(var _iterator = _create_for_of_iterator_helper_loose(heroes), _step; !(_step = _iterator()).done;){
            var h = _step.value;
            if (!h.alive || h.team === caster.team || h.untargetableTimer > 0) continue;
            if ((0, _CombatMath.dist)(cx, cy, h.x, h.y) <= rad + h.radius) {
                callbacks.dealDamageToHero(caster, h, rawD, dType, false, false, skill.name, bypassShield);
                if (cc && ccDur) callbacks.applyCc(h, cc, ccDur, caster);
                onHeroHit == null ? void 0 : onHeroHit(h);
                hitCount++;
            }
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(minions), _step1; !(_step1 = _iterator1()).done;){
            var m = _step1.value;
            if (!m.alive || m.team === caster.team) continue;
            if ((0, _CombatMath.dist)(cx, cy, m.x, m.y) <= rad + m.radius) {
                callbacks.dealDamageToMinion(caster, m, rawD, dType);
                hitCount++;
            }
        }
        for(var _iterator2 = _create_for_of_iterator_helper_loose(jungleMobs), _step2; !(_step2 = _iterator2()).done;){
            var j = _step2.value;
            if (!j.alive) continue;
            if ((0, _CombatMath.dist)(cx, cy, j.x, j.y) <= rad + 36) {
                callbacks.dealDamageToJungle(caster, j, rawD, dType);
                hitCount++;
            }
        }
        return hitCount;
    };
    // Parabolic Leap primitive helper (sets Z-axis elevation curve alongside horizontal velocity)
    var startParabolicLeap = function startParabolicLeap(angle, travelDist, durationSec, wallCross) {
        if (wallCross === void 0) wallCross = true;
        var dur = (0, _CombatMath.clamp)(durationSec, 0.22, 0.58);
        caster.dashVx = Math.cos(angle) * travelDist / dur;
        caster.dashVy = Math.sin(angle) * travelDist / dur;
        caster.dashTimer = dur;
        caster.dashWallCross = wallCross;
        caster.leapDuration = dur;
        caster.leapTimer = dur;
        caster.leapZ = 0.5;
    };
    // Displacement + Wall-Pin collision helper (checks map walls & temporary rock barriers!)
    var displaceWithWallPin = function displaceWithWallPin(target, pushAngle, pushDist, sourceHero, pinBonusDmg, pinStunSec) {
        var _ctx_tempWalls;
        var desiredX = target.x + Math.cos(pushAngle) * pushDist;
        var desiredY = target.y + Math.sin(pushAngle) * pushDist;
        var res = resolveWallCollision(desiredX, desiredY, target.radius, {}, undefined, false, (_ctx_tempWalls = ctx.tempWalls) != null ? _ctx_tempWalls : []);
        target.x = res.x;
        target.y = res.y;
        if (res.hitWall) {
            callbacks.dealDamageToHero(sourceHero, target, pinBonusDmg, 'physical', false, false, 'Wall Pin');
            callbacks.applyCc(target, 'stun', pinStunSec, sourceHero);
            callbacks.spawnVfx({
                kind: 'burst',
                x: res.x,
                y: res.y,
                radius: 110,
                color: '#FACC15',
                ttl: 0.45,
                maxTtl: 0.45
            });
            return true;
        }
        return false;
    };
    var hid = caster.heroDef.id;
    // Dispatch Part 4 Bespoke Hero Kits (Heroes 1-66 A-K including Hirara, Beatrix, Fanny, Johnson, Barats, Argus, etc.)
    var skillHelpers = {
        hitCircle: hitCircle,
        findNearestEnemy: function findNearestEnemy(range, nearX, nearY) {
            return findNearestEnemyHero(caster, heroes, range, nearX, nearY);
        },
        startParabolicLeap: startParabolicLeap,
        displaceWithWallPin: displaceWithWallPin
    };
    var handledByPart4 = (0, _HeroKitsPart1.executePart4HeroSkill)(caster, slot, skill, lvl, aimAngle, aimDist, dmg, isRecast, ctx, skillHelpers);
    if (handledByPart4) {
        return true;
    }
    // Dispatch Part 5 Bespoke Hero Kits (Heroes 67-133 K-Z: Kagura through Zilong)
    var handledByPart5 = (0, _HeroKitsPart2.executePart5HeroSkill)(caster, slot, skill, lvl, aimAngle, aimDist, dmg, isRecast, ctx, skillHelpers);
    if (handledByPart5) {
        return true;
    }
    // ==================== 12 ICONIC HERO SKILL IMPLEMENTATIONS ====================
    if (hid === 'miya') {
        if (slot === 1) {
            // Moon Arrow: triple split arrows buff
            caster.passiveTimer = Math.max(caster.passiveTimer, 5);
            caster.passiveStacks = Math.min(5, caster.passiveStacks + 2);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 72,
                color: skill.color,
                ttl: 0.45,
                maxTtl: 0.45
            });
        } else if (slot === 2) {
            // Arrow of Eclipse: AoE root
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: skill.radius,
                color: skill.color,
                ttl: 0.55,
                maxTtl: 0.55
            });
            hitCircle(tx, ty, skill.radius, dmg, 'physical', 'root', 1.2);
        } else {
            // Hidden Moonlight: Purify + Stealth + 5 Turbo stacks + MS burst
            if (caster.ccType && caster.ccType !== 'suppression') {
                caster.ccType = null;
                caster.ccTimer = 0;
            }
            caster.stealthTimer = 2.0;
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.45);
            caster.speedBoostTimer = 2.5;
            caster.passiveStacks = 5;
            caster.passiveTimer = 5.0;
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 95,
                color: '#E0F2FE',
                ttl: 0.5,
                maxTtl: 0.5
            });
        }
        return true;
    }
    if (hid === 'layla') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 940,
                vy: Math.sin(aimAngle) * 940,
                radius: 26,
                rangeLeft: skill.range,
                damage: dmg,
                damageType: 'physical',
                color: skill.color,
                kind: 'skill_line',
                life: 1.0,
                maxLife: 1.0,
                extraTag: 'layla_s1'
            });
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: skill.radius,
                color: skill.color,
                ttl: 0.45,
                maxTtl: 0.45
            });
            hitCircle(tx, ty, skill.radius, dmg, 'physical', 'slow', 1.4, function(h) {
                h.markedTimer = 3.5;
                h.markedBy = caster.id;
            });
        } else {
            // Destruction Rush: 1100-unit beam
            var ex = caster.x + Math.cos(aimAngle) * skill.range;
            var ey = caster.y + Math.sin(aimAngle) * skill.range;
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: ex,
                ty: ey,
                radius: 68,
                color: skill.color,
                ttl: 0.5,
                maxTtl: 0.5,
                angle: aimAngle
            });
            var steps = 11;
            var hitSet = new Set();
            for(var i = 1; i <= steps; i++){
                var px = caster.x + Math.cos(aimAngle) * (skill.range / steps * i);
                var py = caster.y + Math.sin(aimAngle) * (skill.range / steps * i);
                for(var _iterator = _create_for_of_iterator_helper_loose(heroes), _step; !(_step = _iterator()).done;){
                    var h = _step.value;
                    if (!h.alive || h.team === caster.team || h.untargetableTimer > 0 || hitSet.has(h.id)) continue;
                    if ((0, _CombatMath.dist)(px, py, h.x, h.y) <= 72 + h.radius) {
                        hitSet.add(h.id);
                        callbacks.dealDamageToHero(caster, h, dmg, 'physical');
                    }
                }
                for(var _iterator1 = _create_for_of_iterator_helper_loose(minions), _step1; !(_step1 = _iterator1()).done;){
                    var m = _step1.value;
                    if (!m.alive || m.team === caster.team || hitSet.has(m.id)) continue;
                    if ((0, _CombatMath.dist)(px, py, m.x, m.y) <= 72 + m.radius) {
                        hitSet.add(m.id);
                        callbacks.dealDamageToMinion(caster, m, dmg, 'physical');
                    }
                }
            }
        }
        return true;
    }
    if (hid === 'tigreal') {
        if (slot === 1) {
            // Attack Wave: 3 sequential ground shockwaves along line
            for(var w = 1; w <= 3; w++){
                var wx = caster.x + Math.cos(aimAngle) * (w * 145);
                var wy = caster.y + Math.sin(aimAngle) * (w * 145);
                callbacks.spawnVfx({
                    kind: 'crater',
                    x: wx,
                    y: wy,
                    radius: 95,
                    color: skill.color,
                    ttl: 0.35 + w * 0.1,
                    maxTtl: 0.65
                });
                hitCircle(wx, wy, 95, dmg * (0.65 + w * 0.18), 'physical', 'slow', 1.5);
            }
        } else if (slot === 2) {
            if (isRecast) {
                // Stage 2: Hammer Uppercut Airborne
                var ux = caster.x + Math.cos(aimAngle) * 110;
                var uy = caster.y + Math.sin(aimAngle) * 110;
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: ux,
                    y: uy,
                    radius: 135,
                    color: '#FACC15',
                    ttl: 0.45,
                    maxTtl: 0.45
                });
                hitCircle(ux, uy, 135, dmg * 0.85, 'physical', 'airborne', 1.0);
            } else {
                // Stage 1: Sacred Hammer Charge pushing enemies
                caster.dashVx = Math.cos(aimAngle) * 900;
                caster.dashVy = Math.sin(aimAngle) * 900;
                caster.dashTimer = 0.34;
                caster.dashWallCross = false;
                caster.recastSlot = 2;
                caster.recastTimer = 3.5;
                callbacks.spawnVfx({
                    kind: 'slash',
                    x: caster.x,
                    y: caster.y,
                    radius: 110,
                    color: skill.color,
                    ttl: 0.35,
                    maxTtl: 0.35,
                    angle: aimAngle
                });
                hitCircle(caster.x + Math.cos(aimAngle) * 150, caster.y + Math.sin(aimAngle) * 150, 120, dmg, 'physical', 'knockback', 0.45, function(h) {
                    h.x = (0, _CombatMath.clamp)(h.x + Math.cos(aimAngle) * 130, 80, _mapData.WORLD_SIZE - 80);
                    h.y = (0, _CombatMath.clamp)(h.y + Math.sin(aimAngle) * 130, 80, _mapData.WORLD_SIZE - 80);
                });
            }
        } else {
            // Implosion: Pull all nearby enemies inward + 1.8s Stun
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: skill.radius,
                color: '#FACC15',
                ttl: 0.65,
                maxTtl: 0.65
            });
            hitCircle(caster.x, caster.y, skill.radius, dmg, 'physical', 'stun', 1.8, function(h) {
                var ang = Math.atan2(caster.y - h.y, caster.x - h.x);
                var pullD = Math.min(180, (0, _CombatMath.dist)(caster.x, caster.y, h.x, h.y) * 0.65);
                h.x += Math.cos(ang) * pullD;
                h.y += Math.sin(ang) * pullD;
            });
        }
        return true;
    }
    if (hid === 'franco') {
        if (slot === 1) {
            // Iron Hook: 850-range displacement hook
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 1080,
                vy: Math.sin(aimAngle) * 1080,
                radius: 30,
                rangeLeft: skill.range,
                damage: dmg,
                damageType: 'physical',
                color: skill.color,
                kind: 'hook',
                life: 0.9,
                maxLife: 0.9
            });
        } else if (slot === 2) {
            // Fury Shock: 70% slow ring
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: skill.radius,
                color: skill.color,
                ttl: 0.45,
                maxTtl: 0.45
            });
            hitCircle(caster.x, caster.y, skill.radius, dmg + caster.maxHp * 0.04, 'physical', 'slow', 1.5);
        } else {
            // Bloody Hunt: 1.8s Un-purifiable Suppression!
            var tgt = findNearestEnemyHero(caster, heroes, skill.range);
            if (tgt) {
                callbacks.applyCc(tgt, 'suppression', 1.8, caster);
                callbacks.dealDamageToHero(caster, tgt, dmg, 'physical');
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: tgt.x,
                    y: tgt.y,
                    radius: 115,
                    color: '#EF4444',
                    ttl: 0.7,
                    maxTtl: 0.7
                });
            } else {
                callbacks.spawnVfx({
                    kind: 'ring',
                    x: caster.x,
                    y: caster.y,
                    radius: 140,
                    color: '#EF4444',
                    ttl: 0.4,
                    maxTtl: 0.4
                });
            }
        }
        return true;
    }
    if (hid === 'zilong') {
        if (slot === 1) {
            // Spear Flip: flips enemy behind Zilong
            var tgt1 = findNearestEnemyHero(caster, heroes, skill.range);
            if (tgt1) {
                var behindAng = Math.atan2(caster.y - tgt1.y, caster.x - tgt1.x);
                tgt1.x = (0, _CombatMath.clamp)(caster.x + Math.cos(behindAng) * 95, 80, _mapData.WORLD_SIZE - 80);
                tgt1.y = (0, _CombatMath.clamp)(caster.y + Math.sin(behindAng) * 95, 80, _mapData.WORLD_SIZE - 80);
                callbacks.applyCc(tgt1, 'airborne', 0.65, caster);
                callbacks.dealDamageToHero(caster, tgt1, dmg, 'physical');
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: tgt1.x,
                    y: tgt1.y,
                    radius: 95,
                    color: skill.color,
                    ttl: 0.4,
                    maxTtl: 0.4
                });
            } else {
                hitCircle(tx, ty, 110, dmg * 0.7, 'physical', 'airborne', 0.5);
            }
        } else if (slot === 2) {
            // Spear Strike: gap-close dash + armor shred + CD reset on kill
            var tgt2 = findNearestEnemyHero(caster, heroes, skill.range);
            var ang = tgt2 ? Math.atan2(tgt2.y - caster.y, tgt2.x - caster.x) : aimAngle;
            caster.dashVx = Math.cos(ang) * 1150;
            caster.dashVy = Math.sin(ang) * 1150;
            caster.dashTimer = 0.25;
            caster.dashWallCross = true;
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 110,
                color: skill.color,
                ttl: 0.35,
                maxTtl: 0.35,
                angle: ang
            });
            if (tgt2) {
                tgt2.defShredFlat = Math.max(tgt2.defShredFlat, 20);
                tgt2.defShredTimer = 2.5;
                var wasAlive = tgt2.alive;
                callbacks.dealDamageToHero(caster, tgt2, dmg, 'physical');
                if (wasAlive && !tgt2.alive) caster.skillCds[1] = 0;
            } else {
                hitCircle(tx, ty, 120, dmg, 'physical');
            }
        } else {
            // Supreme Warrior: Slow immunity + +40% MS + +45% AtkSpd
            caster.slowTimer = 0;
            caster.slowPct = 0;
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.42);
            caster.speedBoostTimer = 7.0;
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.2);
            caster.inspireTimer = Math.max(caster.inspireTimer, 6.0);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 120,
                color: '#FACC15',
                ttl: 0.6,
                maxTtl: 0.6
            });
        }
        return true;
    }
    if (hid === 'alucard') {
        if (slot === 1) {
            // Groundsplitter: parabolic leap over walls with Z-elevation arc!
            startParabolicLeap(aimAngle, clampedDist, 0.34, true);
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: skill.radius,
                color: skill.color,
                ttl: 0.5,
                maxTtl: 0.5
            });
            hitCircle(tx, ty, skill.radius, dmg, 'physical', 'slow', 1.4);
        } else if (slot === 2) {
            // Whirling Smash: 360 slash
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: skill.radius,
                color: skill.color,
                ttl: 0.38,
                maxTtl: 0.38
            });
            hitCircle(caster.x, caster.y, skill.radius, dmg, 'physical');
        } else {
            // Fission Wave: Lifesteal aura + Recast shockwave
            if (isRecast) {
                var ex1 = caster.x + Math.cos(aimAngle) * 580;
                var ey1 = caster.y + Math.sin(aimAngle) * 580;
                callbacks.spawnVfx({
                    kind: 'beam',
                    x: caster.x,
                    y: caster.y,
                    tx: ex1,
                    ty: ey1,
                    radius: 110,
                    color: '#FACC15',
                    ttl: 0.45,
                    maxTtl: 0.45,
                    angle: aimAngle
                });
                hitCircle(caster.x + Math.cos(aimAngle) * 280, caster.y + Math.sin(aimAngle) * 280, 220, dmg, 'physical', 'slow', 1.2);
            } else {
                caster.recastSlot = 3;
                caster.recastTimer = 6.0;
                caster.passiveTimer = 6.0;
                caster.shield = Math.max(caster.shield, 340);
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: caster.x,
                    y: caster.y,
                    radius: 130,
                    color: '#FACC15',
                    ttl: 0.5,
                    maxTtl: 0.5
                });
            }
        }
        return true;
    }
    if (hid === 'saber') {
        if (slot === 1) {
            // Orbiting Swords: 5 spinning cyan blades
            caster.orbitBlades = 5;
            caster.orbitTimer = 6.0;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 150,
                color: '#38BDF8',
                ttl: 0.45,
                maxTtl: 0.45
            });
            hitCircle(caster.x, caster.y, 150, dmg, 'physical', undefined, undefined, function(h) {
                h.defShredFlat = Math.min(40, h.defShredFlat + 8);
                h.defShredTimer = 4.0;
            });
        } else if (slot === 2) {
            // Charge: wall-crossing dash
            caster.dashVx = Math.cos(aimAngle) * 1120;
            caster.dashVy = Math.sin(aimAngle) * 1120;
            caster.dashTimer = 0.28;
            caster.dashWallCross = true;
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 110,
                color: skill.color,
                ttl: 0.3,
                maxTtl: 0.3,
                angle: aimAngle
            });
            hitCircle(tx, ty, 105, dmg, 'physical', 'slow', 1.0);
        } else {
            // Triple Sweep: Dash to enemy + 1.2s Airborne + 3 heavy slashes
            var tgt3 = findNearestEnemyHero(caster, heroes, skill.range);
            if (tgt3) {
                caster.x = tgt3.x - Math.cos(aimAngle) * 48;
                caster.y = tgt3.y - Math.sin(aimAngle) * 48;
                callbacks.applyCc(tgt3, 'airborne', 1.2, caster);
                tgt3.defShredFlat = Math.min(45, tgt3.defShredFlat + 18);
                tgt3.defShredTimer = 5.0;
                callbacks.dealDamageToHero(caster, tgt3, dmg, 'physical');
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: tgt3.x,
                    y: tgt3.y,
                    radius: 125,
                    color: '#22D3EE',
                    ttl: 0.6,
                    maxTtl: 0.6
                });
            } else {
                hitCircle(tx, ty, 130, dmg * 0.75, 'physical', 'airborne', 0.9);
            }
        }
        return true;
    }
    if (hid === 'lancelot') {
        if (slot === 1) {
            // Puncture: dash through targets; resets CD if hitting unmarked enemy!
            caster.dashVx = Math.cos(aimAngle) * 1200;
            caster.dashVy = Math.sin(aimAngle) * 1200;
            caster.dashTimer = 0.24;
            caster.dashWallCross = true;
            caster.passiveStacks = Math.min(4, caster.passiveStacks + 1);
            caster.passiveTimer = 4.0;
            var reset = false;
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 120,
                color: skill.color,
                ttl: 0.3,
                maxTtl: 0.3,
                angle: aimAngle
            });
            hitCircle(caster.x + Math.cos(aimAngle) * 160, caster.y + Math.sin(aimAngle) * 160, 120, dmg, 'physical', undefined, undefined, function(h) {
                if (h.markedTimer <= 0) {
                    h.markedTimer = 5.0;
                    h.markedBy = caster.id;
                    reset = true;
                }
            });
            if (reset) caster.skillCds[0] = 0.15;
        } else if (slot === 2) {
            // Thorned Rose: 0.6s Untargetable I-frame + triangular 3-slash burst
            caster.untargetableTimer = 0.6;
            caster.passiveStacks = Math.min(4, caster.passiveStacks + 1);
            caster.passiveTimer = 4.0;
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: skill.radius,
                color: '#E879F9',
                ttl: 0.55,
                maxTtl: 0.55
            });
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: skill.radius,
                color: '#FACC15',
                ttl: 0.45,
                maxTtl: 0.45
            });
            hitCircle(tx, ty, skill.radius, dmg * (1 + caster.passiveStacks * 0.075), 'physical', 'slow', 0.8);
        } else {
            // Phantom Execution: brief CC-immune dash + lethal thrust
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 0.7);
            caster.untargetableTimer = Math.max(caster.untargetableTimer, 0.35);
            caster.dashVx = Math.cos(aimAngle) * 1280;
            caster.dashVy = Math.sin(aimAngle) * 1280;
            caster.dashTimer = 0.32;
            caster.dashWallCross = true;
            var ex2 = caster.x + Math.cos(aimAngle) * skill.range;
            var ey2 = caster.y + Math.sin(aimAngle) * skill.range;
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: ex2,
                ty: ey2,
                radius: 90,
                color: '#FACC15',
                ttl: 0.45,
                maxTtl: 0.45,
                angle: aimAngle
            });
            hitCircle(caster.x + Math.cos(aimAngle) * 260, caster.y + Math.sin(aimAngle) * 260, 175, dmg * (1 + caster.passiveStacks * 0.075), 'physical');
        }
        return true;
    }
    if (hid === 'eudora') {
        if (slot === 1) {
            // Forked Lightning: cone + applies Superconductor mark
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: skill.range,
                color: '#38BDF8',
                ttl: 0.4,
                maxTtl: 0.4,
                angle: aimAngle
            });
            hitCircle(caster.x + Math.cos(aimAngle) * 210, caster.y + Math.sin(aimAngle) * 210, 195, dmg, 'magic', undefined, undefined, function(h) {
                if (h.markedTimer > 0) callbacks.dealDamageToHero(caster, h, 180 + caster.magicPow * 0.35, 'magic');
                h.markedTimer = 4.0;
                h.markedBy = caster.id;
            });
        } else if (slot === 2) {
            // Ball Lightning: stun orb; chains to nearby marked enemies
            var tgt4 = findNearestEnemyHero(caster, heroes, skill.range);
            if (tgt4) {
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: 0,
                    vy: 0,
                    radius: 26,
                    rangeLeft: skill.range + 120,
                    damage: dmg,
                    damageType: 'magic',
                    color: '#60A5FA',
                    kind: 'orb_stun',
                    homingTargetId: tgt4.id,
                    ccType: 'stun',
                    ccDuration: 1.25,
                    life: 1.5,
                    maxLife: 1.5
                });
            } else {
                callbacks.spawnVfx({
                    kind: 'crater',
                    x: tx,
                    y: ty,
                    radius: 120,
                    color: '#60A5FA',
                    ttl: 0.4,
                    maxTtl: 0.4
                });
                hitCircle(tx, ty, 120, dmg, 'magic', 'stun', 1.1);
            }
        } else {
            // Thunder's Wrath: Massive lightning strike + secondary Superconductor storm
            var tgt5 = findNearestEnemyHero(caster, heroes, skill.range);
            var bx = tgt5 ? tgt5.x : tx;
            var by = tgt5 ? tgt5.y : ty;
            callbacks.spawnVfx({
                kind: 'burst',
                x: bx,
                y: by,
                radius: 175,
                color: '#38BDF8',
                ttl: 0.65,
                maxTtl: 0.65
            });
            callbacks.spawnVfx({
                kind: 'ring',
                x: bx,
                y: by,
                radius: 190,
                color: '#FACC15',
                ttl: 0.55,
                maxTtl: 0.55
            });
            hitCircle(bx, by, 170, dmg, 'magic', undefined, undefined, function(h) {
                if (h.markedTimer > 0) {
                    h.markedTimer = 0;
                    callbacks.dealDamageToHero(caster, h, dmg * 0.55, 'magic');
                }
            });
        }
        return true;
    }
    if (hid === 'nana') {
        if (slot === 1) {
            // Magic Boomerang: Pierces out and back
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 780,
                vy: Math.sin(aimAngle) * 780,
                radius: 34,
                rangeLeft: skill.range,
                damage: dmg,
                damageType: 'magic',
                color: skill.color,
                kind: 'boomerang',
                pierce: true,
                returning: false,
                life: 1.8,
                maxLife: 1.8
            });
        } else if (slot === 2) {
            // Molina Smooch: Transforms enemies into Molina (1.5s transform + -25% Magic Def)
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: skill.radius,
                color: '#FB7185',
                ttl: 0.8,
                maxTtl: 0.8
            });
            hitCircle(tx, ty, skill.radius, dmg, 'magic', 'transform', 1.5, function(h) {
                h.defShredFlat = Math.max(h.defShredFlat, 22);
                h.defShredTimer = 2.5;
            });
        } else {
            // Molina Blitz: 3 sequential heavy blasts + Stun
            for(var i1 = 0; i1 < 3; i1++){
                var bx1 = tx + Math.cos(aimAngle) * (i1 * 90 - 70);
                var by1 = ty + Math.sin(aimAngle) * (i1 * 90 - 70);
                callbacks.spawnVfx({
                    kind: 'crater',
                    x: bx1,
                    y: by1,
                    radius: skill.radius,
                    color: '#F43F5E',
                    ttl: 0.45 + i1 * 0.14,
                    maxTtl: 0.8
                });
                hitCircle(bx1, by1, skill.radius, dmg * 0.48, 'magic', i1 >= 1 ? 'stun' : 'slow', 1.0);
            }
        }
        return true;
    }
    if (hid === 'estes') {
        if (slot === 1) {
            // Moonlight Immersion: Heal lowest-HP nearby ally + tether
            var bestAlly = caster;
            var lowestPct = caster.hp / caster.maxHp;
            for(var _iterator2 = _create_for_of_iterator_helper_loose(heroes), _step2; !(_step2 = _iterator2()).done;){
                var h1 = _step2.value;
                if (!h1.alive || h1.team !== caster.team) continue;
                if ((0, _CombatMath.dist)(caster.x, caster.y, h1.x, h1.y) <= skill.range && h1.hp / h1.maxHp < lowestPct) {
                    lowestPct = h1.hp / h1.maxHp;
                    bestAlly = h1;
                }
            }
            var healAmt = 360 + lvl * 75 + caster.magicPow * 0.85;
            callbacks.healHero(bestAlly, healAmt, caster);
            caster.tetherTargetId = bestAlly.id;
            caster.tetherTimer = 3.0;
            caster.tetherKind = 'heal';
            callbacks.spawnVfx({
                kind: 'ring',
                x: bestAlly.x,
                y: bestAlly.y,
                radius: 95,
                color: '#2CE58B',
                ttl: 0.55,
                maxTtl: 0.55
            });
        } else if (slot === 2) {
            // Domain of Moon Goddess: heavy slow ring
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: skill.radius,
                color: '#38BDF8',
                ttl: 0.8,
                maxTtl: 0.8
            });
            hitCircle(tx, ty, skill.radius, dmg, 'magic', 'slow', 2.0);
        } else {
            // Blessing of Moon Goddess: Massive teamwide AoE heal!
            var healAmt1 = 680 + lvl * 180 + caster.magicPow * 1.15;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: skill.radius,
                color: '#FDE047',
                ttl: 0.9,
                maxTtl: 0.9
            });
            for(var _iterator3 = _create_for_of_iterator_helper_loose(heroes), _step3; !(_step3 = _iterator3()).done;){
                var h2 = _step3.value;
                if (!h2.alive || h2.team !== caster.team) continue;
                if ((0, _CombatMath.dist)(caster.x, caster.y, h2.x, h2.y) <= skill.radius) {
                    callbacks.healHero(h2, healAmt1, caster);
                    callbacks.spawnVfx({
                        kind: 'tether',
                        x: caster.x,
                        y: caster.y,
                        tx: h2.x,
                        ty: h2.y,
                        radius: 6,
                        color: '#2CE58B',
                        ttl: 0.75,
                        maxTtl: 0.75
                    });
                }
            }
        }
        return true;
    }
    if (hid === 'angela') {
        if (slot === 1) {
            // Love Waves: damages enemies & heals allies in line
            var ex3 = caster.x + Math.cos(aimAngle) * skill.range;
            var ey3 = caster.y + Math.sin(aimAngle) * skill.range;
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: ex3,
                ty: ey3,
                radius: 75,
                color: '#F472B6',
                ttl: 0.4,
                maxTtl: 0.4,
                angle: aimAngle
            });
            hitCircle(caster.x + Math.cos(aimAngle) * 230, caster.y + Math.sin(aimAngle) * 230, 170, dmg, 'magic', 'slow', 1.0);
            for(var _iterator4 = _create_for_of_iterator_helper_loose(heroes), _step4; !(_step4 = _iterator4()).done;){
                var h3 = _step4.value;
                if (!h3.alive || h3.team !== caster.team) continue;
                if ((0, _CombatMath.dist)(caster.x + Math.cos(aimAngle) * 210, caster.y + Math.sin(aimAngle) * 210, h3.x, h3.y) <= 190) {
                    callbacks.healHero(h3, 210 + caster.magicPow * 0.45, caster);
                }
            }
        } else if (slot === 2) {
            // Puppet-on-a-String: Tether & Root enemy
            var tgt6 = findNearestEnemyHero(caster, heroes, skill.range);
            if (tgt6) {
                caster.tetherTargetId = tgt6.id;
                caster.tetherTimer = 2.0;
                caster.tetherKind = 'root';
                callbacks.dealDamageToHero(caster, tgt6, dmg, 'magic');
                callbacks.applyCc(tgt6, 'root', 1.4, caster);
                callbacks.spawnVfx({
                    kind: 'tether',
                    x: caster.x,
                    y: caster.y,
                    tx: tgt6.x,
                    ty: tgt6.y,
                    radius: 5,
                    color: '#E879F9',
                    ttl: 0.8,
                    maxTtl: 0.8
                });
            }
        } else {
            // Heartguard: Global Shield + Attach to lowest-HP ally
            var targetAlly = null;
            var lowestPct1 = 2;
            for(var _iterator5 = _create_for_of_iterator_helper_loose(heroes), _step5; !(_step5 = _iterator5()).done;){
                var h4 = _step5.value;
                if (!h4.alive || h4.team !== caster.team || h4.id === caster.id) continue;
                var pct = h4.hp / h4.maxHp;
                if (pct < lowestPct1) {
                    lowestPct1 = pct;
                    targetAlly = h4;
                }
            }
            if (targetAlly) {
                var sh = 1200 + lvl * 400 + caster.magicPow * 1.4;
                callbacks.grantShield(targetAlly, sh);
                caster.attachedAllyId = targetAlly.id;
                caster.attachedTimer = 8.0;
                caster.untargetableTimer = 8.0;
                callbacks.spawnVfx({
                    kind: 'ring',
                    x: targetAlly.x,
                    y: targetAlly.y,
                    radius: 130,
                    color: '#EC4899',
                    ttl: 0.8,
                    maxTtl: 0.8
                });
            }
        }
        return true;
    }
    // ==================== UNIVERSAL 133-HERO PHYSICS DISPATCHER ====================
    // Global Vision Reveal Ultimates (Aldous, Yi Sun-shin, Zetian)
    if (slot === 3 && (hid === 'aldous' || hid === 'yi_sun_shin' || hid === 'zetian')) {
        callbacks.triggerGlobalReveal == null ? void 0 : callbacks.triggerGlobalReveal.call(callbacks, caster.team, 5.0);
        callbacks.announce("" + caster.heroDef.name.toUpperCase() + " — GLOBAL REVEAL!", 'All enemy positions exposed across the Land of Dawn for 5s!', skill.color);
        for(var _iterator6 = _create_for_of_iterator_helper_loose(heroes), _step6; !(_step6 = _iterator6()).done;){
            var h5 = _step6.value;
            if (h5.alive && h5.team !== caster.team) {
                h5.revealedTimer = Math.max(h5.revealedTimer, 5.0);
                callbacks.spawnVfx({
                    kind: 'ring',
                    x: h5.x,
                    y: h5.y,
                    radius: 70,
                    color: skill.color,
                    ttl: 0.75,
                    maxTtl: 0.75
                });
                if (hid === 'yi_sun_shin' || hid === 'zetian') {
                    callbacks.dealDamageToHero(caster, h5, dmg, skill.damageType, false, false, skill.name);
                    if (skill.ccType && skill.ccDuration) callbacks.applyCc(h5, skill.ccType, skill.ccDuration, caster);
                }
            }
        }
        if (hid === 'aldous') {
            var tgt7 = findNearestEnemyHero(caster, heroes, 4000);
            if (tgt7) {
                caster.x = (0, _CombatMath.clamp)(tgt7.x - Math.cos(aimAngle) * 55, 80, _mapData.WORLD_SIZE - 80);
                caster.y = (0, _CombatMath.clamp)(tgt7.y - Math.sin(aimAngle) * 55, 80, _mapData.WORLD_SIZE - 80);
                callbacks.dealDamageToHero(caster, tgt7, dmg, 'physical', false, false, skill.name);
                callbacks.applyCc(tgt7, 'knockback', 0.9, caster);
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: tgt7.x,
                    y: tgt7.y,
                    radius: 135,
                    color: skill.color,
                    ttl: 0.65,
                    maxTtl: 0.65
                });
            }
        }
        return true;
    }
    switch(skill.physics){
        case 'blink':
            {
                var nx = (0, _CombatMath.clamp)(tx, 80, _mapData.WORLD_SIZE - 80);
                var ny = (0, _CombatMath.clamp)(ty, 80, _mapData.WORLD_SIZE - 80);
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: caster.x,
                    y: caster.y,
                    radius: 68,
                    color: skill.color,
                    ttl: 0.35,
                    maxTtl: 0.35
                });
                caster.x = nx;
                caster.y = ny;
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: nx,
                    y: ny,
                    radius: Math.max(85, skill.radius),
                    color: skill.color,
                    ttl: 0.4,
                    maxTtl: 0.4
                });
                if (dmg > 0) hitCircle(nx, ny, Math.max(95, skill.radius), dmg, skill.damageType, skill.ccType, skill.ccDuration);
                break;
            }
        case 'dash':
        case 'leap':
            {
                if (skill.physics === 'leap') {
                    startParabolicLeap(aimAngle, clampedDist, (0, _CombatMath.clamp)(clampedDist / 960, 0.28, 0.44), true);
                } else {
                    caster.dashVx = Math.cos(aimAngle) * 1140;
                    caster.dashVy = Math.sin(aimAngle) * 1140;
                    caster.dashTimer = (0, _CombatMath.clamp)(clampedDist / 1080, 0.2, 0.38);
                    caster.dashWallCross = Boolean(skill.wallCross);
                }
                (0, _VfxSystem.spawnElementalTrailVfx)(callbacks, (0, _VfxSystem.getHeroElement)(hid, caster.role), caster.x, caster.y, tx, ty, 4);
                callbacks.spawnVfx({
                    kind: skill.physics === 'leap' ? 'crater' : 'slash',
                    x: skill.physics === 'leap' ? tx : caster.x,
                    y: skill.physics === 'leap' ? ty : caster.y,
                    radius: Math.max(100, skill.radius),
                    color: skill.color,
                    ttl: 0.42,
                    maxTtl: 0.42,
                    angle: aimAngle
                });
                hitCircle(caster.x + Math.cos(aimAngle) * Math.min(200, clampedDist), caster.y + Math.sin(aimAngle) * Math.min(200, clampedDist), Math.max(115, skill.radius), dmg, skill.damageType, skill.ccType, skill.ccDuration);
                break;
            }
        case 'boomerang':
            {
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(aimAngle) * 840,
                    vy: Math.sin(aimAngle) * 840,
                    radius: Math.max(28, skill.radius * 0.4),
                    rangeLeft: Math.max(420, skill.range),
                    damage: dmg,
                    damageType: skill.damageType,
                    color: skill.color,
                    kind: 'boomerang',
                    pierce: true,
                    returning: false,
                    life: 1.8,
                    maxLife: 1.8
                });
                break;
            }
        case 'projectile':
            {
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(aimAngle) * 960,
                    vy: Math.sin(aimAngle) * 960,
                    radius: Math.max(24, Math.min(48, skill.radius * 0.5)),
                    rangeLeft: Math.max(440, skill.range),
                    damage: dmg,
                    damageType: skill.damageType,
                    color: skill.color,
                    kind: 'skill_line',
                    ccType: skill.ccType,
                    ccDuration: skill.ccDuration,
                    life: 1.25,
                    maxLife: 1.25
                });
                break;
            }
        case 'displacement':
            {
                var _skill_ccType, _skill_ccDuration;
                callbacks.spawnVfx({
                    kind: 'ring',
                    x: tx,
                    y: ty,
                    radius: Math.max(120, skill.radius),
                    color: skill.color,
                    ttl: 0.5,
                    maxTtl: 0.5
                });
                hitCircle(tx, ty, Math.max(120, skill.radius), dmg, skill.damageType, (_skill_ccType = skill.ccType) != null ? _skill_ccType : 'knockback', (_skill_ccDuration = skill.ccDuration) != null ? _skill_ccDuration : 0.9, function(h) {
                    var pushDir = skill.ccType === 'pull' ? Math.atan2(caster.y - h.y, caster.x - h.x) : aimAngle;
                    h.x = (0, _CombatMath.clamp)(h.x + Math.cos(pushDir) * 125, 80, _mapData.WORLD_SIZE - 80);
                    h.y = (0, _CombatMath.clamp)(h.y + Math.sin(pushDir) * 125, 80, _mapData.WORLD_SIZE - 80);
                });
                break;
            }
        case 'iframe':
            {
                caster.untargetableTimer = Math.max(caster.untargetableTimer, 0.75);
                caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 0.9);
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: tx,
                    y: ty,
                    radius: Math.max(130, skill.radius),
                    color: skill.color,
                    ttl: 0.55,
                    maxTtl: 0.55
                });
                hitCircle(tx, ty, Math.max(130, skill.radius), dmg, skill.damageType, skill.ccType, skill.ccDuration);
                break;
            }
        case 'buff':
            {
                caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
                caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 4.0);
                callbacks.grantShield(caster, Math.round(240 + caster.level * 35 + caster.magicPow * 0.45));
                if (caster.role === 'Marksman' || caster.role === 'Fighter') {
                    caster.inspireTimer = Math.max(caster.inspireTimer, 4.0);
                }
                if (caster.role === 'Support') {
                    for(var _iterator7 = _create_for_of_iterator_helper_loose(heroes), _step7; !(_step7 = _iterator7()).done;){
                        var h6 = _step7.value;
                        if (h6.alive && h6.team === caster.team && (0, _CombatMath.dist)(caster.x, caster.y, h6.x, h6.y) <= Math.max(320, skill.radius)) {
                            callbacks.healHero(h6, 280 + lvl * 75 + caster.magicPow * 0.65, caster);
                        }
                    }
                }
                (0, _VfxSystem.spawnElementalTrailVfx)(callbacks, (0, _VfxSystem.getHeroElement)(hid, caster.role), caster.x, caster.y, tx, ty, 3);
                callbacks.spawnVfx({
                    kind: 'ring',
                    x: caster.x,
                    y: caster.y,
                    radius: Math.max(110, skill.radius),
                    color: skill.color,
                    ttl: 0.55,
                    maxTtl: 0.55
                });
                if (dmg > 0) hitCircle(caster.x, caster.y, Math.max(120, skill.radius), dmg, skill.damageType, skill.ccType, skill.ccDuration);
                break;
            }
        case 'snapback':
            {
                if (isRecast && caster.snapbackAnchor) {
                    var ax = caster.snapbackAnchor.x;
                    var ay = caster.snapbackAnchor.y;
                    caster.snapbackAnchor = null;
                    caster.x = ax;
                    caster.y = ay;
                    callbacks.spawnVfx({
                        kind: 'burst',
                        x: ax,
                        y: ay,
                        radius: 95,
                        color: skill.color,
                        ttl: 0.4,
                        maxTtl: 0.4
                    });
                } else {
                    caster.snapbackAnchor = {
                        x: caster.x,
                        y: caster.y,
                        ttl: 4.0,
                        slot: slot
                    };
                    caster.recastSlot = slot;
                    caster.recastTimer = 4.0;
                    caster.x = (0, _CombatMath.clamp)(tx, 80, _mapData.WORLD_SIZE - 80);
                    caster.y = (0, _CombatMath.clamp)(ty, 80, _mapData.WORLD_SIZE - 80);
                    if (dmg > 0) hitCircle(caster.x, caster.y, Math.max(110, skill.radius), dmg, skill.damageType, skill.ccType, skill.ccDuration);
                }
                break;
            }
        case 'terrain':
            {
                callbacks.spawnTempWall == null ? void 0 : callbacks.spawnTempWall.call(callbacks, {
                    id: "wall_" + hid + "_" + Math.round(ctx.matchTimeSec * 100),
                    x: tx - 70,
                    y: ty - 28,
                    w: 140,
                    h: 56,
                    color: skill.color,
                    ttl: 4.5,
                    maxTtl: 4.5,
                    ownerId: caster.id
                });
                if (dmg > 0) hitCircle(tx, ty, Math.max(125, skill.radius), dmg, skill.damageType, skill.ccType, skill.ccDuration);
                break;
            }
        case 'tether':
        case 'attach':
            {
                if (caster.role === 'Support' && skill.telegraph === 'ally') {
                    var ally = heroes.filter(function(h) {
                        return h.alive && h.team === caster.team && h.id !== caster.id;
                    }).sort(function(a, b) {
                        return a.hp / a.maxHp - b.hp / b.maxHp;
                    })[0];
                    if (ally) {
                        callbacks.healHero(ally, 340 + lvl * 90 + caster.magicPow * 0.75, caster);
                        callbacks.grantShield(ally, 320 + lvl * 80);
                        caster.tetherTargetId = ally.id;
                        caster.tetherTimer = 3.0;
                        caster.tetherKind = 'heal';
                        callbacks.spawnVfx({
                            kind: 'tether',
                            x: caster.x,
                            y: caster.y,
                            tx: ally.x,
                            ty: ally.y,
                            radius: 6,
                            color: skill.color,
                            ttl: 0.7,
                            maxTtl: 0.7
                        });
                    }
                } else {
                    var tgt8 = findNearestEnemyHero(caster, heroes, Math.max(360, skill.range));
                    if (tgt8) {
                        var _skill_ccType1, _skill_ccDuration1;
                        caster.tetherTargetId = tgt8.id;
                        caster.tetherTimer = 2.2;
                        caster.tetherKind = 'root';
                        callbacks.dealDamageToHero(caster, tgt8, dmg, skill.damageType, false, false, skill.name);
                        callbacks.applyCc(tgt8, (_skill_ccType1 = skill.ccType) != null ? _skill_ccType1 : 'root', (_skill_ccDuration1 = skill.ccDuration) != null ? _skill_ccDuration1 : 1.2, caster);
                        callbacks.spawnVfx({
                            kind: 'tether',
                            x: caster.x,
                            y: caster.y,
                            tx: tgt8.x,
                            ty: tgt8.y,
                            radius: 6,
                            color: skill.color,
                            ttl: 0.75,
                            maxTtl: 0.75
                        });
                    } else {
                        hitCircle(tx, ty, Math.max(120, skill.radius), dmg, skill.damageType, skill.ccType, skill.ccDuration);
                    }
                }
                break;
            }
        case 'channel':
            {
                var ex4 = caster.x + Math.cos(aimAngle) * Math.max(360, skill.range);
                var ey4 = caster.y + Math.sin(aimAngle) * Math.max(360, skill.range);
                callbacks.spawnVfx({
                    kind: 'beam',
                    x: caster.x,
                    y: caster.y,
                    tx: ex4,
                    ty: ey4,
                    radius: Math.max(60, skill.radius * 0.55),
                    color: skill.color,
                    ttl: 0.55,
                    maxTtl: 0.55,
                    angle: aimAngle
                });
                hitCircle(caster.x + Math.cos(aimAngle) * Math.min(280, skill.range * 0.5), caster.y + Math.sin(aimAngle) * Math.min(280, skill.range * 0.5), Math.max(160, skill.radius), dmg, skill.damageType, skill.ccType, skill.ccDuration);
                break;
            }
        case 'aoe':
        default:
            {
                var cx = skill.telegraph === 'ring' || skill.telegraph === 'self' ? caster.x : tx;
                var cy = skill.telegraph === 'ring' || skill.telegraph === 'self' ? caster.y : ty;
                var rad = Math.max(115, skill.radius);
                callbacks.spawnVfx({
                    kind: slot === 3 ? 'burst' : 'crater',
                    x: cx,
                    y: cy,
                    radius: rad,
                    color: skill.color,
                    ttl: slot === 3 ? 0.65 : 0.48,
                    maxTtl: slot === 3 ? 0.65 : 0.48
                });
                hitCircle(cx, cy, rad, dmg, skill.damageType, skill.ccType, skill.ccDuration);
                break;
            }
    }
    return true;
}
function castBattleSpell(caster, aimAngle, ctx) {
    if (!caster.alive || caster.spellCd > 0) return false;
    // Purify works during non-suppression CC; Flicker is blocked by Grounded/Root
    if (caster.spellId !== 'purify' && caster.ccType && (0, _CombatMath.getCcPriority)(caster.ccType) >= 3) return false;
    if (caster.spellId === 'flicker' && caster.ccType && (0, _CombatMath.isDashBlockingCc)(caster.ccType)) return false;
    if (caster.spellId === 'purify' && caster.ccType === 'suppression') return false;
    var callbacks = ctx.callbacks, heroes = ctx.heroes, jungleMobs = ctx.jungleMobs, turrets = ctx.turrets, minions = ctx.minions;
    var cdMap = {
        flicker: 120,
        retribution: 35,
        execute: 90,
        inspire: 75,
        sprint: 100,
        purify: 90,
        vengeance: 75,
        aegis: 75,
        revitalize: 75,
        petrify: 75,
        flameshot: 50,
        arrival: 75
    };
    var cdMult = (0, _EquipmentCombatEngine.getSpellOrActiveCdMultiplier)(caster);
    caster.spellCd = ctx.noCooldown ? 1 : Math.round(cdMap[caster.spellId] * cdMult);
    if (caster.isPlayer) _AudioEngine.mlbbAudio.playSkill(2, 'true');
    var st = (0, _EquipmentCombatEngine.ensureEquipState)(caster);
    switch(caster.spellId){
        case 'flicker':
            {
                var nx = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * 320, 80, _mapData.WORLD_SIZE - 80);
                var ny = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * 320, 80, _mapData.WORLD_SIZE - 80);
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: caster.x,
                    y: caster.y,
                    radius: 70,
                    color: '#FACC15',
                    ttl: 0.35,
                    maxTtl: 0.35
                });
                caster.x = nx;
                caster.y = ny;
                st.flickerDefTimer = 1.5; // Brief Hybrid Defense surge after blinking
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: nx,
                    y: ny,
                    radius: 75,
                    color: '#FACC15',
                    ttl: 0.35,
                    maxTtl: 0.35
                });
                break;
            }
        case 'retribution':
            {
                var _caster_blessingId;
                var dmg = (0, _CombatMath.computeRetributionThreshold)(caster.level, caster.junglerStacks >= 5);
                // Prioritize nearest jungle creep / Turtle / Lord
                var bestMob = null;
                var bestD = 430;
                for(var _iterator = _create_for_of_iterator_helper_loose(jungleMobs), _step; !(_step = _iterator()).done;){
                    var m = _step.value;
                    if (!m.alive) continue;
                    var d = (0, _CombatMath.dist)(caster.x, caster.y, m.x, m.y);
                    if (d < bestD) {
                        bestD = d;
                        bestMob = m;
                    }
                }
                if (bestMob) {
                    callbacks.dealDamageToJungle(caster, bestMob, dmg, 'true');
                    callbacks.spawnVfx({
                        kind: 'beam',
                        x: caster.x,
                        y: caster.y,
                        tx: bestMob.x,
                        ty: bestMob.y,
                        radius: 22,
                        color: '#EF4444',
                        ttl: 0.35,
                        maxTtl: 0.35
                    });
                } else if (caster.junglerStacks >= 5 || ((_caster_blessingId = caster.blessingId) == null ? void 0 : _caster_blessingId.includes('retribution'))) {
                    var tgt = findNearestEnemyHero(caster, heroes, 440);
                    if (tgt) {
                        var tst = (0, _EquipmentCombatEngine.ensureEquipState)(tgt);
                        var heroRetriDmg = 100 + caster.level * 12;
                        callbacks.dealDamageToHero(caster, tgt, heroRetriDmg, 'true', false, false, 'Retribution');
                        if (caster.blessingId === 'flame_retribution') {
                            var stealAtk = Math.round(58 + (caster.level - 1) / 14 * 42);
                            st.flameRetriBonusAtk = stealAtk;
                            st.flameRetriTimer = 4.0;
                            tst.flameRetriDebuffAtk = stealAtk;
                            tst.flameRetriDebuffTimer = 4.0;
                            callbacks.spawnVfx({
                                kind: 'beam',
                                x: caster.x,
                                y: caster.y,
                                tx: tgt.x,
                                ty: tgt.y,
                                radius: 18,
                                color: '#F97316',
                                ttl: 0.4,
                                maxTtl: 0.4
                            });
                        } else if (caster.blessingId === 'bloody_retribution') {
                            tst.bloodyDrainTimer = 4.0;
                            tst.bloodyDrainSourceId = caster.id;
                            tst.bloodyDrainTickAccum = 0.5;
                            callbacks.spawnVfx({
                                kind: 'beam',
                                x: caster.x,
                                y: caster.y,
                                tx: tgt.x,
                                ty: tgt.y,
                                radius: 18,
                                color: '#DC2626',
                                ttl: 0.4,
                                maxTtl: 0.4
                            });
                        } else {
                            // Ice Retribution (default evolved): steals Movement Speed for 4s
                            callbacks.applyCc(tgt, 'slow', 4.0, caster);
                            tgt.slowPct = Math.max(tgt.slowPct, 0.35);
                            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
                            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 4.0);
                            callbacks.spawnVfx({
                                kind: 'beam',
                                x: caster.x,
                                y: caster.y,
                                tx: tgt.x,
                                ty: tgt.y,
                                radius: 18,
                                color: '#38BDF8',
                                ttl: 0.4,
                                maxTtl: 0.4
                            });
                        }
                    }
                }
                break;
            }
        case 'execute':
            {
                var tgt1 = findNearestEnemyHero(caster, heroes, 360);
                if (tgt1) {
                    var missingHp = tgt1.maxHp - tgt1.hp;
                    var raw = 200 + caster.level * 24 + missingHp * 0.13;
                    var wasAlive = tgt1.alive;
                    callbacks.dealDamageToHero(caster, tgt1, raw, 'true', false, false, 'Execute', true);
                    callbacks.spawnVfx({
                        kind: 'burst',
                        x: tgt1.x,
                        y: tgt1.y,
                        radius: 90,
                        color: '#F97316',
                        ttl: 0.4,
                        maxTtl: 0.4
                    });
                    if (wasAlive && !tgt1.alive) caster.spellCd = Math.round(caster.spellCd * 0.6);
                }
                break;
            }
        case 'inspire':
            caster.inspireTimer = 5.0;
            st.inspireAttacksLeft = 8;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 85,
                color: '#FB7185',
                ttl: 0.5,
                maxTtl: 0.5
            });
            break;
        case 'sprint':
            caster.slowTimer = 0;
            caster.slowPct = 0;
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.5);
            caster.speedBoostTimer = 6.0;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 85,
                color: '#38BDF8',
                ttl: 0.45,
                maxTtl: 0.45
            });
            break;
        case 'purify':
            caster.ccType = null;
            caster.ccTimer = 0;
            caster.ccPriority = 0;
            caster.slowTimer = 0;
            caster.slowPct = 0;
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.2);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.15);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 1.2);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 95,
                color: '#FDE047',
                ttl: 0.55,
                maxTtl: 0.55
            });
            break;
        case 'vengeance':
            caster.vengeanceTimer = 3.0;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 95,
                color: '#A855F7',
                ttl: 0.6,
                maxTtl: 0.6
            });
            break;
        case 'aegis':
            {
                var selfShield = 750 + caster.level * 90;
                callbacks.grantShield(caster, selfShield);
                // Automatically grants 50% shield to lowest-HP nearby ally
                var lowestAlly = heroes.filter(function(a) {
                    return a.alive && a.team === caster.team && a.id !== caster.id && (0, _CombatMath.dist)(caster.x, caster.y, a.x, a.y) <= 440;
                }).sort(function(a, b) {
                    return a.hp / a.maxHp - b.hp / b.maxHp;
                })[0];
                if (lowestAlly) {
                    callbacks.grantShield(lowestAlly, Math.round(selfShield * 0.5));
                    callbacks.spawnVfx({
                        kind: 'ring',
                        x: lowestAlly.x,
                        y: lowestAlly.y,
                        radius: 85,
                        color: '#60A5FA',
                        ttl: 0.5,
                        maxTtl: 0.5
                    });
                }
                callbacks.spawnVfx({
                    kind: 'ring',
                    x: caster.x,
                    y: caster.y,
                    radius: 95,
                    color: '#60A5FA',
                    ttl: 0.55,
                    maxTtl: 0.55
                });
                break;
            }
        case 'revitalize':
            st.revitalizeZoneTimer = 4.0;
            st.revitalizeZoneX = caster.x;
            st.revitalizeZoneY = caster.y;
            st.revitalizeTickAccum = 0;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 220,
                color: '#2CE58B',
                ttl: 0.85,
                maxTtl: 0.85
            });
            for(var _iterator1 = _create_for_of_iterator_helper_loose(heroes), _step1; !(_step1 = _iterator1()).done;){
                var h = _step1.value;
                if (h.alive && h.team === caster.team && (0, _CombatMath.dist)(caster.x, caster.y, h.x, h.y) <= 220) {
                    (0, _EquipmentCombatEngine.ensureEquipState)(h).revitalizeAmpTimer = 1.0;
                    callbacks.healHero(h, h.maxHp * 0.05, caster);
                }
            }
            break;
        case 'petrify':
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 230,
                color: '#CBD5E1',
                ttl: 0.5,
                maxTtl: 0.5
            });
            for(var _iterator2 = _create_for_of_iterator_helper_loose(heroes), _step2; !(_step2 = _iterator2()).done;){
                var h1 = _step2.value;
                if (h1.alive && h1.team !== caster.team && (0, _CombatMath.dist)(caster.x, caster.y, h1.x, h1.y) <= 230) {
                    callbacks.dealDamageToHero(caster, h1, 100 + caster.level * 15, 'magic', false, false, 'Petrify');
                    callbacks.applyCc(h1, 'petrify', 0.8, caster);
                    h1.slowPct = Math.max(h1.slowPct, 0.5);
                    h1.slowTimer = Math.max(h1.slowTimer, 1.6);
                }
            }
            break;
        case 'flameshot':
            // Immediate close-range knockback wave before launching long-range scaling fireball
            for(var _iterator3 = _create_for_of_iterator_helper_loose(heroes), _step3; !(_step3 = _iterator3()).done;){
                var h2 = _step3.value;
                if (h2.alive && h2.team !== caster.team && (0, _CombatMath.dist)(caster.x, caster.y, h2.x, h2.y) <= 165) {
                    var pushAng = Math.atan2(h2.y - caster.y, h2.x - caster.x);
                    h2.x = (0, _CombatMath.clamp)(h2.x + Math.cos(pushAng) * 150, 80, _mapData.WORLD_SIZE - 80);
                    h2.y = (0, _CombatMath.clamp)(h2.y + Math.sin(pushAng) * 150, 80, _mapData.WORLD_SIZE - 80);
                    callbacks.applyCc(h2, 'knockback', 0.45, caster);
                }
            }
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 1120,
                vy: Math.sin(aimAngle) * 1120,
                radius: 32,
                rangeLeft: 1600,
                damage: 200 + caster.magicPow * 0.5,
                damageType: 'magic',
                color: '#FB923C',
                kind: 'flameshot',
                life: 1.5,
                maxLife: 1.5
            });
            break;
        case 'arrival':
            {
                var _allyMinions_;
                // Teleport to furthest alive allied turret or frontline allied minion
                var allyTurrets = turrets.filter(function(t) {
                    return t.alive && t.team === caster.team && t.tier <= 3;
                }).sort(function(a, b) {
                    return (0, _CombatMath.dist)(caster.x, caster.y, b.x, b.y) - (0, _CombatMath.dist)(caster.x, caster.y, a.x, a.y);
                });
                var allyMinions = minions.filter(function(m) {
                    return m.alive && m.team === caster.team;
                }).sort(function(a, b) {
                    return (0, _CombatMath.dist)(caster.x, caster.y, b.x, b.y) - (0, _CombatMath.dist)(caster.x, caster.y, a.x, a.y);
                });
                var dest = (_allyMinions_ = allyMinions[0]) != null ? _allyMinions_ : allyTurrets[0];
                if (dest) {
                    callbacks.spawnVfx({
                        kind: 'ring',
                        x: caster.x,
                        y: caster.y,
                        radius: 95,
                        color: '#22D3EE',
                        ttl: 0.5,
                        maxTtl: 0.5
                    });
                    caster.x = (0, _CombatMath.clamp)(dest.x, 80, _mapData.WORLD_SIZE - 80);
                    caster.y = (0, _CombatMath.clamp)(dest.y + (caster.team === 'blue' ? 55 : -55), 80, _mapData.WORLD_SIZE - 80);
                    caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.6);
                    caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 3.0);
                    callbacks.spawnVfx({
                        kind: 'ring',
                        x: caster.x,
                        y: caster.y,
                        radius: 115,
                        color: '#22D3EE',
                        ttl: 0.65,
                        maxTtl: 0.65
                    });
                }
                break;
            }
    }
    return true;
}
function computeMitigatedHeroDamage(attacker, target, rawDmg, dmgType, extraPctPen, ignoreFlatDef) {
    if (extraPctPen === void 0) extraPctPen = 0;
    if (ignoreFlatDef === void 0) ignoreFlatDef = 0;
    if (dmgType === 'physical' && target.physImmuneTimer > 0) return 0;
    if (target.winterCrownTimer > 0) return 0;
    var baseDef = dmgType === 'physical' ? target.physDef : target.magicDef;
    if (target.defShredTimer > 0) baseDef -= target.defShredFlat;
    if (ignoreFlatDef > 0) baseDef -= ignoreFlatDef;
    var flatPen = attacker ? dmgType === 'physical' ? attacker.flatPhysPen : attacker.flatMagicPen : 0;
    var pctPen = attacker ? Math.min(0.6, (dmgType === 'physical' ? attacker.pctPhysPen : attacker.pctMagicPen) + extraPctPen) : 0;
    var effDef = (0, _CombatMath.computeEffectiveDefense)(baseDef, flatPen, pctPen);
    var dmg = (0, _CombatMath.computeFinalDamage)(rawDmg, effDef, dmgType);
    if (target.vengeanceTimer > 0) {
        dmg = Math.round(dmg * 0.65);
    }
    return dmg;
}

});
// === MODULE: src/games/legends-arena/mlbb/engine/ThreeHeroModels ===
ArcadeMod.define("src/games/legends-arena/mlbb/engine/ThreeHeroModels", function(require, module, exports) {
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
    get MLBB_3D_CAMERA_YAW () {
        return MLBB_3D_CAMERA_YAW;
    },
    get WORLD_SCALE () {
        return WORLD_SCALE;
    },
    get buildBrawlShrineRig3D () {
        return buildBrawlShrineRig3D;
    },
    get buildJungleMobRig3D () {
        return buildJungleMobRig3D;
    },
    get buildMinionRig3D () {
        return buildMinionRig3D;
    },
    get buildMlbbHeroRig3D () {
        return buildMlbbHeroRig3D;
    },
    get buildMlbbTurretRig3D () {
        return buildMlbbTurretRig3D;
    },
    get buildWalkieGrassRig3D () {
        return buildWalkieGrassRig3D;
    },
    get hexToInt () {
        return hexToInt;
    },
    get toThreeX () {
        return toThreeX;
    },
    get toThreeZ () {
        return toThreeZ;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _threeShared = require("../../../../core/threeShared");
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
var WORLD_SCALE = 0.05; // 4000 logical units -> 200 Three.js world units (-100..+100)
var MLBB_3D_CAMERA_YAW = Math.atan2(8.2, 20.2);
function toThreeX(wx) {
    return (wx - 2000) * WORLD_SCALE;
}
function toThreeZ(wy) {
    return (wy - 2000) * WORLD_SCALE;
}
function hexToInt(hex, fallback) {
    if (fallback === void 0) fallback = 0x38bdf8;
    if (!hex || typeof hex !== 'string') return fallback;
    var cleaned = hex.replace('#', '').trim();
    var parsed = parseInt(cleaned.length === 3 ? cleaned.split('').map(function(c) {
        return c + c;
    }).join('') : cleaned.slice(0, 6), 16);
    return Number.isFinite(parsed) ? parsed : fallback;
}
function buildMlbbHeroRig3D(role, primaryHex, accentHex, team, isPlayer, scale) {
    if (scale === void 0) scale = 1.62;
    var group = new _three.Group();
    var bodyGroup = new _three.Group();
    group.add(bodyGroup);
    var primaryCol = hexToInt(primaryHex, 0x3b82f6);
    var accentCol = hexToInt(accentHex, 0xf5c451);
    var teamCol = isPlayer ? 0xfacc15 : team === 'blue' ? 0x38bdf8 : 0xfb7185;
    var armorMat = new _three.MeshStandardMaterial({
        color: primaryCol,
        roughness: 0.34,
        metalness: 0.42
    });
    var cloakMat = new _three.MeshStandardMaterial({
        color: accentCol,
        roughness: 0.68,
        metalness: 0.14,
        side: _three.DoubleSide
    });
    var goldMat = new _three.MeshStandardMaterial({
        color: 0xf0c65b,
        roughness: 0.22,
        metalness: 0.86
    });
    var darkMat = new _three.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.72,
        metalness: 0.24
    });
    var glowMat = new _three.MeshStandardMaterial({
        color: accentCol,
        emissive: accentCol,
        emissiveIntensity: 0.85,
        roughness: 0.18,
        metalness: 0.7
    });
    var skinMat = new _three.MeshStandardMaterial({
        color: 0xf4cfa8,
        roughness: 0.62,
        metalness: 0.05
    });
    var materials = [
        armorMat,
        cloakMat,
        goldMat,
        darkMat,
        glowMat,
        skinMat
    ];
    // --- Articulated Sculpted Legs (Hip Pivots) ---
    var legScale = role === 'Tank' ? 1.2 : role === 'Assassin' ? 0.88 : 1.0;
    var makeLeg = function makeLeg(xSign) {
        var pivot = new _three.Group();
        pivot.position.set(xSign * 0.22 * legScale, 0.86, 0);
        var thigh = new _three.Mesh(new _three.CylinderGeometry(0.14 * legScale, 0.115 * legScale, 0.44, 8), darkMat);
        thigh.position.y = -0.22;
        thigh.castShadow = true;
        var knee = new _three.Mesh(new _three.OctahedronGeometry(0.12 * legScale, 0), goldMat);
        knee.position.set(0, -0.44, 0.06);
        var greave = new _three.Mesh(new _three.CylinderGeometry(0.12 * legScale, 0.14 * legScale, 0.42, 8), armorMat);
        greave.position.y = -0.65;
        greave.castShadow = true;
        var boot = new _three.Mesh(new _three.BoxGeometry(0.24 * legScale, 0.14, 0.36 * legScale), darkMat);
        boot.position.set(0, -0.79, 0.06);
        boot.castShadow = true;
        pivot.add(thigh, knee, greave, boot);
        return pivot;
    };
    var leftLeg = makeLeg(-1);
    var rightLeg = makeLeg(1);
    // --- Sculpted Waist Sash, Hip Tassets & Tapered Armored Cuirass ---
    var chestW = role === 'Tank' ? 0.66 : role === 'Fighter' ? 0.56 : role === 'Assassin' ? 0.45 : 0.48;
    var waist = new _three.Mesh(new _three.CylinderGeometry(chestW * 0.72, chestW * 0.84, 0.28, 10), darkMat);
    waist.position.y = 0.96;
    var belt = new _three.Mesh(new _three.TorusGeometry(chestW * 0.78, 0.055, 8, 18), goldMat);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = 0.98;
    var buckle = new _three.Mesh(new _three.OctahedronGeometry(0.12, 0), glowMat);
    buckle.position.set(0, 0.98, chestW * 0.76);
    // Hip Armor Tassets
    var tassetL = new _three.Mesh(new _three.BoxGeometry(0.16, 0.38, 0.34), armorMat);
    tassetL.position.set(-chestW * 0.78, 0.84, 0);
    tassetL.rotation.z = 0.18;
    var tassetR = tassetL.clone();
    tassetR.position.x = chestW * 0.78;
    tassetR.rotation.z = -0.18;
    // Tapered Sculpted Torso Cuirass
    var torso = new _three.Mesh(new _three.CylinderGeometry(chestW * 0.98, chestW * 0.68, 0.72, 10), armorMat);
    torso.scale.set(1.05, 1.0, 0.72);
    torso.position.y = 1.42;
    torso.castShadow = true;
    var chestCrest = new _three.Mesh(new _three.OctahedronGeometry(0.17, 0), glowMat);
    chestCrest.position.set(0, 1.48, chestW * 0.72);
    var collar = new _three.Mesh(new _three.TorusGeometry(0.28, 0.065, 8, 16), goldMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 1.76;
    // Sculpted Layered Pauldrons
    var paulR = role === 'Tank' ? 0.36 : role === 'Fighter' ? 0.29 : 0.23;
    var pauldronL = new _three.Mesh(new _three.SphereGeometry(paulR, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.65), goldMat);
    pauldronL.position.set(-chestW * 1.12, 1.68, 0);
    pauldronL.rotation.z = 0.35;
    pauldronL.castShadow = true;
    var pauldronR = pauldronL.clone();
    pauldronR.position.x = chestW * 1.12;
    pauldronR.rotation.z = -0.35;
    // --- Flowing Articulated Cape Pivot ---
    var capePivot = new _three.Group();
    capePivot.position.set(0, 1.72, -chestW * 0.56);
    var capeShape = new _three.Shape();
    var cwTop = chestW * 0.85;
    var cwBot = chestW * 1.25;
    capeShape.moveTo(-cwTop, 0);
    capeShape.lineTo(cwTop, 0);
    capeShape.lineTo(cwBot, -1.28);
    capeShape.lineTo(0, -1.42);
    capeShape.lineTo(-cwBot, -1.28);
    capeShape.closePath();
    var capeGeo = new _three.ExtrudeGeometry(capeShape, {
        depth: 0.04,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 2
    });
    var capeMesh = new _three.Mesh(capeGeo, cloakMat);
    capeMesh.position.z = -0.04;
    capeMesh.rotation.x = 0.18;
    capeMesh.castShadow = true;
    capePivot.add(capeMesh);
    // --- Sculpted Head & Role-Specific Headgear ---
    var headGroup = new _three.Group();
    headGroup.position.set(0, 1.98, 0);
    var head = new _three.Mesh(new _three.SphereGeometry(0.26, 12, 10), skinMat);
    head.scale.set(0.96, 1.08, 0.98);
    head.castShadow = true;
    var helm = new _three.Mesh(new _three.SphereGeometry(0.285, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), role === 'Mage' || role === 'Marksman' ? cloakMat : armorMat);
    helm.position.y = 0.03;
    helm.castShadow = true;
    var visor = new _three.Mesh(new _three.BoxGeometry(0.32, 0.085, 0.14), glowMat);
    visor.position.set(0, 0.02, 0.22);
    headGroup.add(head, helm, visor);
    if (role === 'Mage') {
        var brim = new _three.Mesh(new _three.CylinderGeometry(0.54, 0.56, 0.06, 14), cloakMat);
        brim.position.set(0, 0.22, -0.02);
        var hatCone = new _three.Mesh(new _three.ConeGeometry(0.34, 0.78, 10), cloakMat);
        hatCone.position.set(0, 0.58, -0.08);
        hatCone.rotation.x = -0.18;
        var hatBand = new _three.Mesh(new _three.TorusGeometry(0.32, 0.04, 6, 16), goldMat);
        hatBand.rotation.x = Math.PI / 2;
        hatBand.position.set(0, 0.26, -0.02);
        headGroup.add(brim, hatCone, hatBand);
    } else if (role === 'Support') {
        var halo = new _three.Mesh(new _three.TorusGeometry(0.38, 0.05, 8, 22), glowMat);
        halo.position.set(0, 0.34, -0.14);
        halo.rotation.x = 0.3;
        var wingCrownL = new _three.Mesh(new _three.ConeGeometry(0.08, 0.34, 4), goldMat);
        wingCrownL.position.set(-0.28, 0.18, 0);
        wingCrownL.rotation.z = 0.65;
        var wingCrownR = wingCrownL.clone();
        wingCrownR.position.x = 0.28;
        wingCrownR.rotation.z = -0.65;
        headGroup.add(halo, wingCrownL, wingCrownR);
    } else if (role === 'Marksman') {
        var hood = new _three.Mesh(new _three.ConeGeometry(0.38, 0.52, 8), cloakMat);
        hood.position.set(0, 0.16, -0.16);
        hood.rotation.x = -0.85;
        var plume = new _three.Mesh(new _three.ConeGeometry(0.08, 0.42, 6), glowMat);
        plume.position.set(0.14, 0.34, -0.12);
        plume.rotation.x = -0.4;
        headGroup.add(hood, plume);
    } else if (role === 'Tank') {
        var hornL = new _three.Mesh(new _three.ConeGeometry(0.085, 0.48, 6), goldMat);
        hornL.position.set(-0.26, 0.28, 0.04);
        hornL.rotation.z = 0.42;
        var hornR = hornL.clone();
        hornR.position.x = 0.26;
        hornR.rotation.z = -0.42;
        var crest = new _three.Mesh(new _three.BoxGeometry(0.08, 0.26, 0.44), glowMat);
        crest.position.set(0, 0.32, -0.02);
        headGroup.add(hornL, hornR, crest);
    } else if (role === 'Assassin') {
        var scarf = new _three.Mesh(new _three.TorusGeometry(0.28, 0.085, 8, 16), cloakMat);
        scarf.rotation.x = Math.PI / 2;
        scarf.position.y = -0.16;
        var finL = new _three.Mesh(new _three.ConeGeometry(0.07, 0.36, 4), glowMat);
        finL.position.set(-0.24, 0.22, -0.06);
        finL.rotation.z = 0.55;
        finL.rotation.x = -0.35;
        var finR = finL.clone();
        finR.position.x = 0.24;
        finR.rotation.z = -0.55;
        headGroup.add(scarf, finL, finR);
    } else {
        var crown = new _three.Mesh(new _three.ConeGeometry(0.14, 0.42, 5), goldMat);
        crown.position.set(0, 0.36, 0.02);
        var plume1 = new _three.Mesh(new _three.BoxGeometry(0.09, 0.34, 0.48), glowMat);
        plume1.position.set(0, 0.26, -0.18);
        plume1.rotation.x = -0.28;
        headGroup.add(crown, plume1);
    }
    // --- Articulated Left Arm (+ Shield / Off-hand Dagger) ---
    var leftArm = new _three.Group();
    leftArm.position.set(-chestW * 1.06, 1.56, 0);
    var armGeo = new _three.CylinderGeometry(0.1, 0.085, 0.56, 8);
    var leftArmMesh = new _three.Mesh(armGeo, armorMat);
    leftArmMesh.position.y = -0.28;
    leftArmMesh.castShadow = true;
    var leftGauntlet = new _three.Mesh(new _three.SphereGeometry(0.11, 8, 8), goldMat);
    leftGauntlet.position.y = -0.58;
    leftArm.add(leftArmMesh, leftGauntlet);
    if (role === 'Tank') {
        var shieldFrame = new _three.Mesh(new _three.BoxGeometry(0.16, 1.18, 0.86), goldMat);
        shieldFrame.position.set(-0.18, -0.42, 0.24);
        shieldFrame.rotation.y = 0.26;
        shieldFrame.castShadow = true;
        var shieldCore = new _three.Mesh(new _three.BoxGeometry(0.19, 0.88, 0.56), glowMat);
        shieldCore.position.copy(shieldFrame.position);
        shieldCore.rotation.copy(shieldFrame.rotation);
        leftArm.add(shieldFrame, shieldCore);
    } else if (role === 'Assassin') {
        var offBlade = new _three.Mesh(new _three.ConeGeometry(0.08, 0.96, 4), glowMat);
        offBlade.rotation.x = Math.PI / 2 - 0.15;
        offBlade.position.set(0, -0.56, 0.45);
        leftArm.add(offBlade);
    }
    // --- Articulated Right Weapon Arm Pivot ---
    var weaponPivot = new _three.Group();
    weaponPivot.position.set(chestW * 1.06, 1.56, 0);
    var rightArmMesh = new _three.Mesh(armGeo, armorMat);
    rightArmMesh.position.y = -0.28;
    rightArmMesh.castShadow = true;
    var rightGauntlet = new _three.Mesh(new _three.SphereGeometry(0.11, 8, 8), goldMat);
    rightGauntlet.position.y = -0.58;
    weaponPivot.add(rightArmMesh, rightGauntlet);
    if (role === 'Tank') {
        var hammerShaft = new _three.Mesh(new _three.CylinderGeometry(0.055, 0.055, 1.48, 8), darkMat);
        hammerShaft.position.set(0.05, -0.35, 0.42);
        hammerShaft.rotation.x = 0.72;
        var hammerHead = new _three.Mesh(new _three.BoxGeometry(0.42, 0.4, 0.64), goldMat);
        hammerHead.position.set(0.05, 0.15, 0.88);
        hammerHead.castShadow = true;
        var hammerGem = new _three.Mesh(new _three.OctahedronGeometry(0.16, 0), glowMat);
        hammerGem.position.set(0.05, 0.15, 1.22);
        weaponPivot.add(hammerShaft, hammerHead, hammerGem);
    } else if (role === 'Assassin') {
        var mainBlade = new _three.Mesh(new _three.ConeGeometry(0.085, 1.08, 4), glowMat);
        mainBlade.rotation.x = Math.PI / 2 - 0.12;
        mainBlade.position.set(0, -0.54, 0.52);
        var hilt = new _three.Mesh(new _three.CylinderGeometry(0.04, 0.04, 0.28, 6), goldMat);
        hilt.rotation.x = Math.PI / 2;
        hilt.position.set(0, -0.56, 0.08);
        weaponPivot.add(mainBlade, hilt);
    } else if (role === 'Mage' || role === 'Support') {
        var staff = new _three.Mesh(new _three.CylinderGeometry(0.048, 0.055, 2.2, 8), goldMat);
        staff.position.set(0.04, -0.12, 0.36);
        staff.rotation.x = 0.32;
        var orb = new _three.Mesh(new _three.OctahedronGeometry(0.26, 0), glowMat);
        orb.position.set(0.04, 0.96, 0.72);
        var haloRing = new _three.Mesh(new _three.TorusGeometry(0.34, 0.04, 6, 18), goldMat);
        haloRing.position.copy(orb.position);
        haloRing.rotation.y = Math.PI / 4;
        weaponPivot.add(staff, orb, haloRing);
    } else if (role === 'Marksman') {
        var bowArc = new _three.Mesh(new _three.TorusGeometry(0.68, 0.06, 8, 20, Math.PI * 1.18), goldMat);
        bowArc.position.set(0.02, -0.42, 0.52);
        bowArc.rotation.y = Math.PI / 2;
        bowArc.rotation.z = -Math.PI * 0.59;
        var arrow = new _three.Mesh(new _three.CylinderGeometry(0.03, 0.03, 1.28, 6), glowMat);
        arrow.rotation.x = Math.PI / 2;
        arrow.position.set(0.02, -0.42, 0.82);
        var arrowTip = new _three.Mesh(new _three.ConeGeometry(0.09, 0.24, 4), glowMat);
        arrowTip.rotation.x = Math.PI / 2;
        arrowTip.position.set(0.02, -0.42, 1.48);
        weaponPivot.add(bowArc, arrow, arrowTip);
    } else {
        // Fighter Ornate Greatsword
        var blade = new _three.Mesh(new _three.BoxGeometry(0.18, 1.72, 0.07), glowMat);
        blade.position.set(0.04, -0.02, 0.62);
        blade.rotation.x = 0.66;
        blade.castShadow = true;
        var tip = new _three.Mesh(new _three.ConeGeometry(0.12, 0.34, 4), glowMat);
        tip.position.set(0.04, 0.72, 1.18);
        tip.rotation.x = 0.66;
        var guard = new _three.Mesh(new _three.BoxGeometry(0.56, 0.1, 0.16), goldMat);
        guard.position.set(0.04, -0.58, 0.2);
        guard.rotation.x = 0.66;
        weaponPivot.add(blade, tip, guard);
    }
    bodyGroup.add(leftLeg, rightLeg, waist, belt, buckle, tassetL, tassetR, torso, chestCrest, collar, pauldronL, pauldronR, capePivot, headGroup, leftArm, weaponPivot);
    // Ground Team Ring + Lock-On Target Ring
    var baseRing = new _three.Mesh(new _three.RingGeometry(0.84, 1.08, 32), new _three.MeshBasicMaterial({
        color: teamCol,
        side: _three.DoubleSide,
        transparent: true,
        opacity: isPlayer ? 0.94 : 0.75,
        depthWrite: false
    }));
    baseRing.rotation.x = -Math.PI / 2;
    baseRing.position.y = 0.05;
    var lockRing = new _three.Mesh(new _three.RingGeometry(1.25, 1.52, 28), new _three.MeshBasicMaterial({
        color: 0xef4444,
        side: _three.DoubleSide,
        transparent: true,
        opacity: 0.92,
        depthWrite: false
    }));
    lockRing.rotation.x = -Math.PI / 2;
    lockRing.position.y = 0.08;
    lockRing.visible = false;
    // Golden CC-Immune / Wind of Nature Halo
    var ccHalo = new _three.Mesh(new _three.TorusGeometry(1.06, 0.075, 8, 24), new _three.MeshBasicMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0.9
    }));
    ccHalo.rotation.x = Math.PI / 2;
    ccHalo.position.y = 1.2;
    ccHalo.visible = false;
    // Winter Crown Ice Cage
    var iceCage = new _three.Mesh(new _three.OctahedronGeometry(1.42, 0), new _three.MeshStandardMaterial({
        color: 0x7dd3fc,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.55,
        transparent: true,
        opacity: 0.52,
        roughness: 0.12
    }));
    iceCage.position.y = 1.25;
    iceCage.visible = false;
    // Recall Blue Swirling Runic Cylinder
    var recallRing = new _three.Mesh(new _three.CylinderGeometry(1.22, 1.22, 2.35, 24, 1, true), new _three.MeshBasicMaterial({
        color: 0x38bdf8,
        side: _three.DoubleSide,
        transparent: true,
        opacity: 0.36,
        depthWrite: false
    }));
    recallRing.position.y = 1.18;
    recallRing.visible = false;
    // Saber Orbiting Cyan Blades
    var orbitGroup = new _three.Group();
    orbitGroup.position.y = 1.15;
    var orbitBlades = [];
    var orbitMat = new _three.MeshBasicMaterial({
        color: 0x22d3ee
    });
    var orbitGeo = new _three.ConeGeometry(0.16, 0.78, 4);
    orbitGeo.rotateX(Math.PI / 2);
    for(var i = 0; i < 5; i++){
        var b = new _three.Mesh(orbitGeo, orbitMat);
        b.visible = false;
        orbitGroup.add(b);
        orbitBlades.push(b);
    }
    group.add((0, _threeShared.createContactShadowMesh)(1.22, 0.42), baseRing, lockRing, ccHalo, iceCage, recallRing, orbitGroup);
    group.scale.setScalar(scale);
    return {
        group: group,
        bodyGroup: bodyGroup,
        leftLeg: leftLeg,
        rightLeg: rightLeg,
        leftArm: leftArm,
        weaponPivot: weaponPivot,
        capePivot: capePivot,
        headGroup: headGroup,
        baseRing: baseRing,
        lockRing: lockRing,
        ccHalo: ccHalo,
        iceCage: iceCage,
        recallRing: recallRing,
        orbitGroup: orbitGroup,
        orbitBlades: orbitBlades,
        materials: materials
    };
}
function buildMlbbTurretRig3D(team, tier, golden, rangeWorld) {
    var group = new _three.Group();
    var isCrystal = tier === 4;
    var teamCol = team === 'blue' ? 0x38bdf8 : 0xf43f5e;
    var marbleCol = team === 'blue' ? 0xdbeafe : 0xfde2e4;
    var stoneCol = team === 'blue' ? 0x254980 : 0x7c2033;
    var trimCol = golden ? 0xfacc15 : 0xeab308;
    var marbleMat = new _three.MeshStandardMaterial({
        color: marbleCol,
        roughness: 0.45,
        metalness: 0.16
    });
    var stoneMat = new _three.MeshStandardMaterial({
        color: stoneCol,
        roughness: 0.58,
        metalness: 0.25
    });
    var trimMat = new _three.MeshStandardMaterial({
        color: trimCol,
        roughness: 0.24,
        metalness: 0.85
    });
    var crystalMat = new _three.MeshStandardMaterial({
        color: teamCol,
        emissive: teamCol,
        emissiveIntensity: 1.05,
        roughness: 0.14,
        metalness: 0.45
    });
    var baseR = isCrystal ? 4.1 : 2.55;
    var baseH = isCrystal ? 1.45 : 1.15;
    // Stepped Octagonal Stone Plinth
    var plinthLower = new _three.Mesh(new _three.CylinderGeometry(baseR * 0.94, baseR * 1.08, baseH * 0.55, 8), stoneMat);
    plinthLower.position.y = baseH * 0.28;
    plinthLower.castShadow = true;
    plinthLower.receiveShadow = true;
    var plinthUpper = new _three.Mesh(new _three.CylinderGeometry(baseR * 0.78, baseR * 0.92, baseH * 0.55, 8), marbleMat);
    plinthUpper.position.y = baseH * 0.8;
    plinthUpper.castShadow = true;
    var trimBand = new _three.Mesh(new _three.CylinderGeometry(baseR * 0.88, baseR * 0.92, 0.26, 8), trimMat);
    trimBand.position.y = baseH * 1.08;
    var pillarH = isCrystal ? 2.85 : 3.9;
    var pillar = new _three.Mesh(new _three.CylinderGeometry(baseR * 0.4, baseR * 0.62, pillarH, 8), marbleMat);
    pillar.position.y = baseH + pillarH * 0.5;
    pillar.castShadow = true;
    // 4 Sculpted Architectural Buttresses
    for(var i = 0; i < 4; i++){
        var a = i * Math.PI / 2 + Math.PI / 4;
        var buttress = new _three.Mesh(new _three.BoxGeometry(0.42, pillarH * 0.78, 0.82), stoneMat);
        buttress.position.set(Math.cos(a) * baseR * 0.58, baseH + pillarH * 0.36, Math.sin(a) * baseR * 0.58);
        buttress.rotation.y = -a + Math.PI / 2;
        buttress.castShadow = true;
        group.add(buttress);
    }
    var crown = new _three.Mesh(new _three.TorusGeometry(baseR * 0.58, 0.2, 8, 12), trimMat);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = baseH + pillarH;
    var crystalY = baseH + pillarH + (isCrystal ? 1.85 : 1.4);
    var crystal = new _three.Mesh(new _three.OctahedronGeometry(isCrystal ? 2.05 : 1.18, 0), crystalMat);
    crystal.position.y = crystalY;
    crystal.castShadow = true;
    var orbitRing = new _three.Mesh(new _three.TorusGeometry(isCrystal ? 2.55 : 1.55, 0.11, 8, 28), trimMat);
    orbitRing.position.y = crystalY;
    orbitRing.rotation.x = Math.PI / 3;
    var shieldDome = new _three.Mesh(new _three.SphereGeometry(baseR * 1.28, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.64), new _three.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.3,
        wireframe: true,
        depthWrite: false
    }));
    var shieldShell = new _three.Mesh(new _three.SphereGeometry(baseR * 1.24, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), new _three.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.14,
        side: _three.DoubleSide,
        depthWrite: false
    }));
    shieldDome.add(shieldShell);
    shieldDome.position.y = 0.18;
    shieldDome.visible = false;
    // 3-State Turret Ground Range Ring
    var rr = rangeWorld * WORLD_SCALE;
    var rangeRingMat = new _three.MeshBasicMaterial({
        color: 0x2ce58b,
        side: _three.DoubleSide,
        transparent: true,
        opacity: 0.88,
        depthWrite: false
    });
    var rangeRing = new _three.Mesh(new _three.RingGeometry(rr - 0.3, rr, 48), rangeRingMat);
    rangeRing.rotation.x = -Math.PI / 2;
    rangeRing.position.y = 0.1;
    rangeRing.visible = false;
    var rangeFillMat = new _three.MeshBasicMaterial({
        color: 0x2ce58b,
        side: _three.DoubleSide,
        transparent: true,
        opacity: 0.09,
        depthWrite: false
    });
    var rangeFill = new _three.Mesh(new _three.CircleGeometry(rr - 0.3, 40), rangeFillMat);
    rangeFill.rotation.x = -Math.PI / 2;
    rangeFill.position.y = 0.07;
    rangeFill.visible = false;
    // Lock-On Laser Sight Beam
    var laserGeo = new _three.CylinderGeometry(0.13, 0.13, 1, 6);
    laserGeo.rotateX(Math.PI / 2);
    laserGeo.translate(0, 0, 0.5);
    var laserBeam = new _three.Mesh(laserGeo, new _three.MeshBasicMaterial({
        color: 0xff3b4e,
        transparent: true,
        opacity: 0.9
    }));
    laserBeam.position.y = crystalY;
    laserBeam.visible = false;
    group.add((0, _threeShared.createContactShadowMesh)(baseR * 1.22, 0.48), plinthLower, plinthUpper, trimBand, pillar, crown, crystal, orbitRing, shieldDome, rangeRing, rangeFill, laserBeam);
    return {
        group: group,
        crystal: crystal,
        orbitRing: orbitRing,
        shieldDome: shieldDome,
        rangeRing: rangeRing,
        rangeRingMat: rangeRingMat,
        rangeFill: rangeFill,
        rangeFillMat: rangeFillMat,
        laserBeam: laserBeam
    };
}
function buildJungleMobRig3D(kind, colorHex) {
    var group = new _three.Group();
    var col = hexToInt(colorHex, 0x2ce58b);
    var bodyMat = new _three.MeshStandardMaterial({
        color: col,
        roughness: 0.42,
        metalness: 0.32
    });
    var darkMat = new _three.MeshStandardMaterial({
        color: 0x243044,
        roughness: 0.68,
        metalness: 0.25
    });
    var goldMat = new _three.MeshStandardMaterial({
        color: 0xf0c65b,
        roughness: 0.24,
        metalness: 0.85
    });
    var glowMat = new _three.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.9,
        roughness: 0.18
    });
    if (kind === 'lord') {
        var legL = new _three.Mesh(new _three.CylinderGeometry(0.42, 0.52, 1.8, 8), darkMat);
        legL.position.set(-0.62, 0.9, 0);
        var legR = legL.clone();
        legR.position.x = 0.62;
        var torso = new _three.Mesh(new _three.CylinderGeometry(1.35, 0.92, 2.4, 8), bodyMat);
        torso.position.y = 2.6;
        torso.castShadow = true;
        var chestCore = new _three.Mesh(new _three.OctahedronGeometry(0.55, 0), glowMat);
        chestCore.position.set(0, 2.75, 1.02);
        var head = new _three.Mesh(new _three.DodecahedronGeometry(0.75, 0), goldMat);
        head.position.set(0, 4.2, 0.22);
        var crown = new _three.Mesh(new _three.ConeGeometry(0.35, 0.9, 5), glowMat);
        crown.position.set(0, 4.95, 0.22);
        var wingL = new _three.Mesh(new _three.BoxGeometry(2.5, 1.5, 0.16), glowMat);
        wingL.position.set(-2.0, 3.1, -0.65);
        wingL.rotation.z = 0.48;
        var wingR = wingL.clone();
        wingR.position.x = 2.0;
        wingR.rotation.z = -0.48;
        var halberdShaft = new _three.Mesh(new _three.CylinderGeometry(0.12, 0.12, 5.2, 8), goldMat);
        halberdShaft.position.set(1.75, 2.6, 0.58);
        halberdShaft.rotation.x = 0.32;
        var halberdBlade = new _three.Mesh(new _three.BoxGeometry(0.95, 1.45, 0.12), glowMat);
        halberdBlade.position.set(1.75, 4.65, 1.28);
        halberdBlade.rotation.x = 0.32;
        group.add((0, _threeShared.createContactShadowMesh)(2.9, 0.5), legL, legR, torso, chestCore, head, crown, wingL, wingR, halberdShaft, halberdBlade);
    } else if (kind === 'turtle') {
        var shell = new _three.Mesh(new _three.SphereGeometry(2.05, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), bodyMat);
        shell.scale.set(1.16, 0.86, 1.25);
        shell.position.y = 0.65;
        shell.castShadow = true;
        var ridge = new _three.Mesh(new _three.OctahedronGeometry(0.82, 0), glowMat);
        ridge.position.y = 2.15;
        var head1 = new _three.Mesh(new _three.DodecahedronGeometry(0.68, 0), darkMat);
        head1.position.set(0, 0.92, 2.35);
        var eyeGlow = new _three.Mesh(new _three.BoxGeometry(0.65, 0.16, 0.2), glowMat);
        eyeGlow.position.set(0, 1.02, 2.88);
        for(var i = 0; i < 4; i++){
            var sx = i % 2 === 0 ? -1.45 : 1.45;
            var sz = i < 2 ? 1.15 : -1.15;
            var fin = new _three.Mesh(new _three.BoxGeometry(0.72, 0.42, 0.92), darkMat);
            fin.position.set(sx, 0.42, sz);
            fin.rotation.y = sx > 0 ? -0.35 : 0.35;
            group.add(fin);
        }
        group.add((0, _threeShared.createContactShadowMesh)(2.65, 0.48), shell, ridge, head1, eyeGlow);
    } else if (kind === 'orange_buff' || kind === 'purple_buff') {
        var legs = new _three.Mesh(new _three.CylinderGeometry(0.68, 0.85, 0.95, 8), darkMat);
        legs.position.y = 0.48;
        var torso1 = new _three.Mesh(new _three.DodecahedronGeometry(1.18, 0), bodyMat);
        torso1.scale.set(1.15, 1.1, 0.92);
        torso1.position.y = 1.65;
        torso1.castShadow = true;
        var core = new _three.Mesh(new _three.OctahedronGeometry(0.55, 0), glowMat);
        core.position.set(0, 1.72, 0.95);
        var shoulderL = new _three.Mesh(new _three.ConeGeometry(0.32, 1.1, 5), glowMat);
        shoulderL.position.set(-1.18, 2.38, 0.08);
        shoulderL.rotation.z = 0.42;
        var shoulderR = shoulderL.clone();
        shoulderR.position.x = 1.18;
        shoulderR.rotation.z = -0.42;
        group.add((0, _threeShared.createContactShadowMesh)(1.9, 0.45), legs, torso1, core, shoulderL, shoulderR);
    } else {
        var body = new _three.Mesh(new _three.DodecahedronGeometry(1.05, 0), bodyMat);
        body.position.y = 1.05;
        body.castShadow = true;
        var eye = new _three.Mesh(new _three.SphereGeometry(0.32, 10, 8), glowMat);
        eye.position.set(0, 1.22, 0.82);
        var crest = new _three.Mesh(new _three.ConeGeometry(0.24, 0.65, 5), goldMat);
        crest.position.set(0, 2.05, 0);
        group.add((0, _threeShared.createContactShadowMesh)(1.3, 0.4), body, eye, crest);
    }
    return group;
}
function buildMinionRig3D(team, kind) {
    if (kind === 'lord_ally') return buildJungleMobRig3D('lord', team === 'blue' ? '#38BDF8' : '#F59E0B');
    if (kind === 'mini_turtle') {
        var g = buildJungleMobRig3D('turtle', '#2CE58B');
        g.scale.setScalar(0.68);
        return g;
    }
    var group = new _three.Group();
    var col = team === 'blue' ? 0x2563eb : 0xdc2626;
    var trim = kind === 'siege' || kind === 'super' ? 0xfacc15 : team === 'blue' ? 0x93c5fd : 0xfca5a5;
    var bodyMat = new _three.MeshStandardMaterial({
        color: col,
        roughness: 0.38,
        metalness: 0.42
    });
    var trimMat = new _three.MeshStandardMaterial({
        color: trim,
        roughness: 0.24,
        metalness: 0.82
    });
    var darkMat = new _three.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.72
    });
    if (kind === 'super') {
        // Heavily armored gold-crested Super Minion Juggernaut (unlocked when enemy Inhibitor falls!)
        var torso = new _three.Mesh(new _three.CylinderGeometry(0.68, 0.82, 1.75, 8), bodyMat);
        torso.position.y = 0.92;
        torso.castShadow = true;
        var paulL = new _three.Mesh(new _three.SphereGeometry(0.42, 8, 6), trimMat);
        paulL.position.set(-0.78, 1.52, 0);
        var paulR = paulL.clone();
        paulR.position.x = 0.78;
        var helm = new _three.Mesh(new _three.DodecahedronGeometry(0.46, 0), trimMat);
        helm.position.y = 2.02;
        var crest = new _three.Mesh(new _three.ConeGeometry(0.2, 0.65, 5), trimMat);
        crest.position.set(0, 2.55, 0);
        var towerShield = new _three.Mesh(new _three.BoxGeometry(0.18, 1.48, 0.95), trimMat);
        towerShield.position.set(-0.92, 1.05, 0.35);
        var halberd = new _three.Mesh(new _three.CylinderGeometry(0.08, 0.08, 2.35, 6), darkMat);
        halberd.position.set(0.88, 1.35, 0.32);
        var blade = new _three.Mesh(new _three.BoxGeometry(0.48, 0.72, 0.1), trimMat);
        blade.position.set(0.88, 2.25, 0.38);
        group.add((0, _threeShared.createContactShadowMesh)(1.38, 0.44), torso, paulL, paulR, helm, crest, towerShield, halberd, blade);
    } else if (kind === 'siege') {
        var hull = new _three.Mesh(new _three.BoxGeometry(1.35, 0.82, 1.65), bodyMat);
        hull.position.y = 0.64;
        hull.castShadow = true;
        var cannon = new _three.Mesh(new _three.CylinderGeometry(0.22, 0.28, 1.55, 8), trimMat);
        cannon.rotation.x = Math.PI / 2 - 0.22;
        cannon.position.set(0, 1.25, 0.55);
        for(var i = 0; i < 4; i++){
            var wheel = new _three.Mesh(new _three.CylinderGeometry(0.32, 0.32, 0.16, 10), darkMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(i % 2 === 0 ? -0.74 : 0.74, 0.32, i < 2 ? 0.5 : -0.5);
            group.add(wheel);
        }
        group.add((0, _threeShared.createContactShadowMesh)(1.25, 0.38), hull, cannon);
    } else {
        var robe = new _three.Mesh(new _three.CylinderGeometry(0.36, 0.54, 1.15, 8), bodyMat);
        robe.position.y = 0.58;
        robe.castShadow = true;
        var shoulder = new _three.Mesh(new _three.TorusGeometry(0.38, 0.08, 6, 12), trimMat);
        shoulder.rotation.x = Math.PI / 2;
        shoulder.position.y = 1.06;
        var head = new _three.Mesh(new _three.SphereGeometry(0.34, 10, 8), trimMat);
        head.position.y = 1.35;
        var weapon = new _three.Mesh(kind === 'ranged' ? new _three.CylinderGeometry(0.05, 0.05, 1.35, 6) : new _three.BoxGeometry(0.14, 0.82, 0.52), trimMat);
        weapon.position.set(0.45, 0.92, 0.22);
        group.add((0, _threeShared.createContactShadowMesh)(0.78, 0.35), robe, shoulder, head, weapon);
    }
    return group;
}
function buildBrawlShrineRig3D() {
    var group = new _three.Group();
    var stoneMat = new _three.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.65,
        metalness: 0.22
    });
    var goldMat = new _three.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.26,
        metalness: 0.82
    });
    var emeraldMat = new _three.MeshStandardMaterial({
        color: 0x2ce58b,
        emissive: 0x10b981,
        emissiveIntensity: 1.15,
        roughness: 0.16
    });
    var base = new _three.Mesh(new _three.CylinderGeometry(2.1, 2.45, 0.42, 12), stoneMat);
    base.position.y = 0.21;
    base.receiveShadow = true;
    var rim = new _three.Mesh(new _three.TorusGeometry(2.15, 0.14, 8, 24), goldMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.44;
    var crystal = new _three.Mesh(new _three.OctahedronGeometry(1.15, 0), emeraldMat);
    crystal.position.y = 2.35;
    crystal.castShadow = true;
    var ring = new _three.Mesh(new _three.RingGeometry(1.85, 2.35, 28), new _three.MeshBasicMaterial({
        color: 0x2ce58b,
        side: _three.DoubleSide,
        transparent: true,
        opacity: 0.65,
        depthWrite: false
    }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.48;
    group.add(base, rim, crystal, ring);
    return {
        group: group,
        crystal: crystal,
        ring: ring
    };
}
function buildWalkieGrassRig3D(team) {
    var group = new _three.Group();
    var mainCol = team === 'blue' ? 0x2dd4bf : 0xfb7185;
    var glowMat = new _three.MeshStandardMaterial({
        color: mainCol,
        emissive: mainCol,
        emissiveIntensity: 0.95,
        roughness: 0.22
    });
    var leafMat = new _three.MeshStandardMaterial({
        color: 0x4ade80,
        emissive: 0x22c55e,
        emissiveIntensity: 0.55
    });
    var body = new _three.Mesh(new _three.SphereGeometry(0.72, 12, 10), glowMat);
    body.position.y = 1.45;
    var sproutL = new _three.Mesh(new _three.ConeGeometry(0.28, 0.9, 6), leafMat);
    sproutL.position.set(-0.32, 2.25, 0);
    sproutL.rotation.z = 0.45;
    var sproutR = sproutL.clone();
    sproutR.position.x = 0.32;
    sproutR.rotation.z = -0.45;
    var aura = new _three.Mesh(new _three.RingGeometry(2.6, 3.05, 32), new _three.MeshBasicMaterial({
        color: mainCol,
        side: _three.DoubleSide,
        transparent: true,
        opacity: 0.48,
        depthWrite: false
    }));
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = 0.2;
    group.add((0, _threeShared.createContactShadowMesh)(1.1, 0.35), body, sproutL, sproutR, aura);
    return group;
}

});

})(window.ArcadeMod);
